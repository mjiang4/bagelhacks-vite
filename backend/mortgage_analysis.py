import os
import shutil
import json
import re
from pathlib import Path
from collections import Counter
from dotenv import load_dotenv

import openai

# Load environment variables
load_dotenv()

# -----------------------
# AZURE OPENAI CONFIGURATION
# -----------------------
openai.api_type = os.getenv("OPENAI_API_TYPE", "azure")
openai.api_key = os.getenv("OPENAI_API_KEY", "")
openai.api_base = os.getenv("OPENAI_API_BASE", "https://oai-ofcresearch-sandbox.openai.azure.com")
openai.api_version = os.getenv("OPENAI_API_VERSION", "2024-12-01-preview")

# -----------------------
# FOLDER SETUP FOR OUTPUTS
# -----------------------
PARALLEL_JSON_DIR = "parallel_json_outputs"
AGREED_JSON_DIR = "agreed_json_outputs"

os.makedirs(PARALLEL_JSON_DIR, exist_ok=True)
os.makedirs(AGREED_JSON_DIR, exist_ok=True)

# -----------------------
# DOCUMENT LOADING & VECTOR DATABASE SETUP
# -----------------------
from langchain_community.document_loaders import DirectoryLoader
from langchain_community.document_loaders.pdf import PyPDFDirectoryLoader
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_chroma import Chroma
from langchain_huggingface import HuggingFaceEmbeddings

DATA_PATH = os.path.abspath("data")
CHROMA_PATH = "chroma_db"

def load_documents():
    all_docs = []
    file_counts = {"md_files": set(), "pdf_files": set()}
    try:
        md_loader = DirectoryLoader(
            DATA_PATH,
            glob="**/*.md",
            recursive=True,
            show_progress=False,
            loader_kwargs={"autodetect_encoding": True}
        )
        md_docs = md_loader.load()
        file_counts["md_files"] = {doc.metadata['source'] for doc in md_docs}
        all_docs.extend(md_docs)
    except Exception as e:
        print(f"Error loading Markdown files: {str(e)}")
    try:
        pdf_loader = PyPDFDirectoryLoader(
            DATA_PATH,
            glob="**/*.pdf",
            recursive=True,
        )
        pdf_docs = pdf_loader.load()
        file_counts["pdf_files"] = {doc.metadata['source'] for doc in pdf_docs}
        all_docs.extend(pdf_docs)
    except Exception as e:
        print(f"Error loading PDF files: {str(e)}")
    print(f"\n📂 Document Discovery in '{os.path.relpath(DATA_PATH)}':")
    print(f"• Markdown files: {len(file_counts['md_files'])}")
    print(f"• PDF documents: {len(file_counts['pdf_files'])}")
    print(f"• Total chunks: {len(all_docs)}")
    if not all_docs:
        raise ValueError("❗ No documents found in directory structure")
    return all_docs

def split_documents(docs):
    text_splitter = RecursiveCharacterTextSplitter(
        chunk_size=1000,
        chunk_overlap=200,
        length_function=len,
        is_separator_regex=False,
    )
    return text_splitter.split_documents(docs)

def create_vector_db():
    embeddings = HuggingFaceEmbeddings(model_name="all-MiniLM-L6-v2")
    if not os.path.exists(CHROMA_PATH):
        print("\n🛠️ Building mortgage knowledge base...")
        try:
            docs = load_documents()
            split_docs = split_documents(docs)
            vectordb = Chroma.from_documents(
                documents=split_docs,
                embedding=embeddings,
                persist_directory=CHROMA_PATH,
                collection_metadata={"hnsw:space": "cosine"}
            )
            # vectordb.persist()
            print(f"\n✅ Knowledge base created with {len(split_docs)} vectorized chunks")
        except ValueError as e:
            print(f"\n❌ Critical error: {str(e)}")
            exit(1)
        except Exception as e:
            print(f"Error creating database: {str(e)}")
            exit(1)
    else:
        print("\n📚 Loading existing mortgage knowledge base...\n")
        vectordb = Chroma(
            persist_directory=CHROMA_PATH,
            embedding_function=embeddings
        )
    return vectordb

def update_vector_db():
    print("\n🧹 Clearing existing mortgage knowledge base...")
    shutil.rmtree(CHROMA_PATH, ignore_errors=True)
    print("\n🛠️ Building updated mortgage knowledge base...")
    embeddings = HuggingFaceEmbeddings(model_name="all-MiniLM-L6-v2")
    docs = load_documents()
    split_docs = split_documents(docs)
    vectordb = Chroma.from_documents(
        documents=split_docs,
        embedding=embeddings,
        persist_directory=CHROMA_PATH,
        collection_metadata={"hnsw:space": "cosine"}
    )
    # vectordb.persist()
    print(f"\n✅ Mortgage knowledge base updated with {len(split_docs)} vectorized chunks")
    return vectordb

# -----------------------
# BASIC API CALL & NORMALIZATION
# -----------------------
def query_openai(prompt: str) -> str:
    try:
        response = openai.ChatCompletion.create(
            engine="gpt-4o-mini",  # Replace with your deployed engine name
            # engine="o3-mini",  # Use the OpenAI engine name
            messages=[{"role": "user", "content": prompt}],
            temperature=0.1  # Lower temperature for consistency # for GPT-4o
        )
        return response.choices[0].message['content']
    except Exception as e:
        return f"Error querying OpenAI: {str(e)}"

def normalize_response(response: str) -> str:
    # Remove markdown code block markers if present
    cleaned = response.strip()
    if cleaned.startswith("```"):
        lines = cleaned.splitlines()
        if lines[0].startswith("```"):
            lines = lines[1:]
        if lines and lines[-1].strip() == "```":
            lines = lines[:-1]
        cleaned = "\n".join(lines).strip()
    try:
        data = json.loads(cleaned)
        normalized = json.dumps(data, sort_keys=True)
        return normalized
    except Exception:
        return cleaned.lower().strip()

# -----------------------
# SMART TEACHER VERIFICATION LAYER
# -----------------------
def verify_interactive_outputs(query: str, context_text: str, source_info: str, outputs: list) -> str:
    outputs_text = "\n\n".join([f"Output {i+1}:\n{o}" for i, o in enumerate(outputs)])
    prompt = f"""```text
You are a knowledgeable teacher in mortgage analysis (specializing in USA & Canada). A user asked:
"{query}"

The document context provided is:
{context_text}

Source Information:
{source_info}

The following are the answers generated by multiple parallel outputs:
{outputs_text}

Review these answers carefully. A majority answer has been found among these outputs if they are similar. Please double-check if that majority answer is correct and consistent with the document context. If it is, simply return that answer. If there are discrepancies, explain briefly and choose the answer that is best supported by the evidence.

Return only the final unified answer in plain text.
```"""
    teacher_response = query_openai(prompt)
    return teacher_response

# -----------------------
# 5-PARALLEL INTERACTIVE QUERY
# -----------------------
def parallel_interactive_query(prompt: str, query: str, context_text: str, source_info: str, max_attempts: int = 3) -> str:
    all_attempts_outputs = []  # Collect outputs from all attempts
    for attempt in range(max_attempts):
        outputs = []
        for i in range(5):
            out = query_openai(prompt)
            outputs.append(out)
        # Save outputs for this attempt and accumulate overall outputs
        all_attempts_outputs.extend(outputs)
        par_filename = os.path.join(PARALLEL_JSON_DIR, f"parallel_interactive_attempt_{attempt+1}.json")
        with open(par_filename, "w") as f:
            json.dump({"outputs": outputs}, f, indent=2)
        print(f"🔄 Parallel interactive outputs saved to {par_filename}")
        
        normalized_outputs = [normalize_response(o) for o in outputs]
        freq = Counter(normalized_outputs)
        most_common, count = freq.most_common(1)[0]
        if count >= 3:
            print(f"✅ Majority response found on attempt {attempt+1} with count {count}")
            majority_response = outputs[normalized_outputs.index(most_common)]
            print("🔍 Triggering teacher for double-check of majority response...")
            teacher_answer = verify_interactive_outputs(query, context_text, source_info, outputs)
            normalized_teacher = normalize_response(teacher_answer)
            teacher_filename = os.path.join(AGREED_JSON_DIR, f"teacher_verified_attempt_{attempt+1}.json")
            if normalized_teacher:
                with open(teacher_filename, "w") as f:
                    f.write(teacher_answer)
                print(f"✅ Teacher verified interactive response saved to {teacher_filename}")
                return teacher_answer
            else:
                print(f"⚠️ Teacher verification returned an invalid output on attempt {attempt+1}. Using majority response.")
                teacher_filename = os.path.join(AGREED_JSON_DIR, f"teacher_verified_attempt_{attempt+1}_fallback.json")
                with open(teacher_filename, "w") as f:
                    f.write(majority_response)
                return majority_response
        else:
            print(f"⚠️ No majority found on attempt {attempt+1}.")
    
    # After all attempts, if no majority was reached in any attempt:
    print("🔍 No majority reached in any attempt. Invoking teacher with all aggregated outputs...")
    teacher_answer = verify_interactive_outputs(query, context_text, source_info, all_attempts_outputs)
    normalized_teacher = normalize_response(teacher_answer)
    teacher_filename = os.path.join(AGREED_JSON_DIR, "teacher_verified_final.json")
    if normalized_teacher:
        with open(teacher_filename, "w") as f:
            f.write(teacher_answer)
        print(f"✅ Teacher verified interactive response saved to {teacher_filename}")
        return teacher_answer
    else:
        error_message = f"Error: Failed to get a consistent interactive response after {max_attempts} attempts."
        print(error_message)
        return error_message


# -----------------------
# PROMPT GENERATION FUNCTIONS (USA & Canada specific)
# -----------------------
def generate_summary_prompt(context_text, source_info):
    return f"""```text
Extract the following key details from the provided mortgage document excerpts (considering USA and Canadian practices):
1. Interest Rate: The annual interest rate specified.
2. Monthly Payment: The borrower's expected monthly payment.
3. Cash to Close: The total cash required at closing.

DOCUMENT EXCERPTS:
{context_text}

SOURCE INFORMATION:
{source_info}

Return the answer strictly in JSON format with keys:
"interest_rate", "monthly_payment", "cash_to_close"

Example:
{{
  "interest_rate": "4.5%",
  "monthly_payment": "$1,500",
  "cash_to_close": "$20,000"
}}
```"""

def generate_query_prompt(query, context_text, source_info):
    return f"""```text
MORTGAGE QUESTION DIRECTIVE [CUSTOMER FOCUS - USA & Canada]

USER QUERY: {query}

DOCUMENT EXCERPTS:
{context_text}

SOURCE INFORMATION:
{source_info}

Please answer the query in clear, plain language using evidence from the documents.
```"""

def generate_expert_prompt(query, context_text, source_info):
    return f"""```text
MORTGAGE EXPERT ADVICE [SPECIALIST MODE - USA & Canada]

You are a seasoned mortgage expert specializing in USA and Canadian markets.
Query: {query}

DOCUMENT EXCERPTS:
{context_text}

SOURCE INFORMATION:
{source_info}

Provide detailed, authoritative advice using evidence from the documents.
```"""

# -----------------------
# HELPER: Build Context from Similar Documents
# -----------------------
def build_context(vectordb, query, k=5):
    docs_and_scores = vectordb.similarity_search_with_score(query, k=k)
    context_text = "\n\n---\n".join([doc.page_content for doc, _ in docs_and_scores])
    sources = []
    for doc, _ in docs_and_scores:
        try:
            source_path = Path(doc.metadata['source']).resolve()
            filename = source_path.name
            raw_page = doc.metadata.get('page', doc.metadata.get('page_number', None))
            page = None
            if raw_page is not None:
                if isinstance(raw_page, str) and raw_page.isdigit():
                    page = int(raw_page)
                elif isinstance(raw_page, (int, float)):
                    page = int(raw_page)
                if page is not None:
                    page += 1
            source_str = f"{filename}[p{page}]" if page and page > 0 else filename
            sources.append(source_str)
        except Exception as e:
            sources.append("[REDACTED SOURCE]")
    source_info = "\n".join(
        f"• {sources[i]} | Excerpt: {doc.page_content[:75]}..."
        for i, (doc, _) in enumerate(docs_and_scores)
    )
    return context_text, source_info

# -----------------------
# KEY DETAILS EXTRACTION FUNCTION
# -----------------------
def extract_summary_points(vectordb):
    print("\n🚀 Extracting key mortgage details for USA and Canada...")
    extraction_query = "interest rate monthly payment cash to close USA Canada"
    context_text, source_info = build_context(vectordb, extraction_query, k=5)
    prompt = generate_summary_prompt(context_text, source_info)
    response = parallel_interactive_query(prompt, extraction_query, context_text, source_info)
    try:
        result = json.loads(normalize_response(response))
        print("\n📋 Extracted Mortgage Details (JSON):")
        print(json.dumps(result, indent=2))
    except Exception as e:
        print("\n⚠️ Error parsing JSON response. Raw response:")
        print(response)
        result = {"error": "Failed to parse JSON output", "raw": response}
    return result

def save_summary_json(summary, filename="mortgage_summary.json"):
    try:
        with open(filename, "w") as f:
            json.dump(summary, f, indent=2)
        print(f"✅ Mortgage summary saved to {filename}")
    except Exception as e:
        print(f"Error saving JSON: {str(e)}")

# -----------------------
# INTERACTIVE QUERY FUNCTIONS
# -----------------------
def ask_mortgage_query(query, vectordb):
    context_text, source_info = build_context(vectordb, query, k=5)
    prompt = generate_query_prompt(query, context_text, source_info)
    return parallel_interactive_query(prompt, query, context_text, source_info)

def ask_mortgage_expert(query, vectordb):
    context_text, source_info = build_context(vectordb, query, k=5)
    prompt = generate_expert_prompt(query, context_text, source_info)
    return parallel_interactive_query(prompt, query, context_text, source_info)

# -----------------------
# MAIN OPERATION FLOW
# -----------------------
if __name__ == "__main__":
    print("\n🔥 INITIALIZING MORTGAGE ANALYSIS SYSTEM (USA & Canada)...")
    vectordb = create_vector_db()
    
    # Optionally, force an update of the vector database:
    # vectordb = update_vector_db()
    
    # Extract key details and save as JSON
    summary_json = extract_summary_points(vectordb)
    save_summary_json(summary_json)
    
    # Interactive chatbot mode with /expert option for follow-up queries
    while True:
        try:
            user_query = input("\n🎯 Enter your mortgage-related query (or type '/exit' to quit):  ").strip()
            if not user_query:
                continue
            if user_query.lower() in ['/exit', '/quit']:
                break
            if user_query.startswith("/expert"):
                expert_query = user_query[len("/expert"):].strip()
                if not expert_query:
                    print("Please provide a query after '/expert'.")
                    continue
                print("\n🚀 Processing your expert query...")
                answer = ask_mortgage_expert(expert_query, vectordb)
            else:
                print("\n🚀 Processing your query...")
                answer = ask_mortgage_query(user_query, vectordb)
            print(f"\n🎖️ Response:\n{answer}")
        except KeyboardInterrupt:
            print("\n🚪 Goodbye! 👋")
            break
        except Exception as e:
            print(f"\nError processing query: {str(e)}")
            continue
    print("\n🚪 Mortgage Analysis System Deactivated. Goodbye! 👋")