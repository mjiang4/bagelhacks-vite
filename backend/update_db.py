import os
import shutil
from pathlib import Path
from langchain_community.document_loaders import DirectoryLoader
from langchain_community.document_loaders.pdf import PyPDFDirectoryLoader
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_chroma import Chroma
from langchain_huggingface import HuggingFaceEmbeddings

# Define paths
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

    print(f"\n 📂 Document Discovery in '{os.path.relpath(DATA_PATH)}':")
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

def update_vector_db():
    # Force a database update by clearing the existing mortgage knowledge base
    print("\n🧹 Clearing existing mortgage knowledge base...")
    shutil.rmtree(CHROMA_PATH, ignore_errors=True)
    
    print("\n 🛠️ Building updated mortgage knowledge base...")
    embeddings = HuggingFaceEmbeddings(model_name="all-MiniLM-L6-v2")
    docs = load_documents()
    split_docs = split_documents(docs)
    
    vectordb = Chroma.from_documents(
        documents=split_docs,
        embedding=embeddings,
        persist_directory=CHROMA_PATH,
        collection_metadata={"hnsw:space": "cosine"}
    )
    print(f"\n ✅ Mortgage knowledge base updated with {len(split_docs)} vectorized chunks")
    return vectordb

if __name__ == "__main__":
    update_vector_db()