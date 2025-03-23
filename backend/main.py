import os
from fastapi import FastAPI, UploadFile, HTTPException, File
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse, FileResponse
from dotenv import load_dotenv
from supabase import create_client, Client
import uuid
import tempfile
import shutil
from pathlib import Path
import json

# Import mortgage analysis functionality
from mortgage_analysis import create_vector_db, ask_mortgage_query, extract_summary_points

load_dotenv()

app = FastAPI()

# Configure CORS for frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],  # Vite default port
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize Supabase client
supabase_url = os.environ.get("SUPABASE_URL")
supabase_key = os.environ.get("SUPABASE_KEY")
bucket_name = "mortgage-uploads"  # Using the existing bucket
supabase: Client = create_client(supabase_url, supabase_key)

# Create data directory if it doesn't exist
os.makedirs("data", exist_ok=True)

# Initialize vector database
vectordb = None
try:
    vectordb = create_vector_db()
    print("Vector database initialized successfully")
except Exception as e:
    print(f"Error initializing vector database: {str(e)}")

@app.get("/")
async def root():
    return {"message": "PDF Storage API is running"}

@app.post("/upload-pdf/")
async def upload_pdf(file: UploadFile):
    if not file.filename.lower().endswith('.pdf'):
        raise HTTPException(status_code=400, detail="File must be a PDF")
    
    try:
        # Read file content
        content = await file.read()
        
        # Generate unique filename
        file_id = str(uuid.uuid4())
        filename = f"{file_id}_{file.filename}"
        
        # Save the PDF locally in the data directory for analysis
        pdf_path = os.path.join("data", filename)
        with open(pdf_path, "wb") as f:
            f.write(content)
        
        # Upload to Supabase
        supabase.storage.from_(bucket_name).upload(
            path=filename,
            file=content,
            file_options={"content-type": "application/pdf"}
        )
        
        # Get the public URL
        file_url = supabase.storage.from_(bucket_name).get_public_url(filename)
        
        # Update the vector database with the new document
        global vectordb
        from mortgage_analysis import update_vector_db
        vectordb = update_vector_db()
        
        return {
            "message": "PDF uploaded successfully",
            "file_id": file_id,
            "filename": filename,
            "url": file_url
        }
    except Exception as e:
        print(f"Upload error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to upload PDF: {str(e)}")

@app.get("/pdfs/")
async def list_pdfs():
    try:
        response = supabase.storage.from_(bucket_name).list()
        return {"files": response}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to list PDFs: {str(e)}")
        
@app.delete("/pdfs/{filename}")
async def delete_pdf(filename: str):
    try:
        # Remove from Supabase
        supabase.storage.from_(bucket_name).remove([filename])
        
        # Remove from local data directory if it exists
        local_file_path = Path("data") / filename
        if local_file_path.exists():
            local_file_path.unlink()
        
        # Update the vector database after deletion
        global vectordb
        from mortgage_analysis import update_vector_db
        vectordb = update_vector_db()
        
        return {"message": f"PDF {filename} deleted successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to delete PDF: {str(e)}")

@app.post("/analyze-mortgage/")
async def analyze_mortgage():
    """
    Analyze all documents in the data directory and extract key mortgage details
    """
    global vectordb
    
    try:
        # Ensure vector database is initialized
        if vectordb is None:
            vectordb = create_vector_db()
        
        # Extract key mortgage details
        summary = extract_summary_points(vectordb)
        
        return summary
    except Exception as e:
        print(f"Analysis error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to analyze mortgage documents: {str(e)}")

@app.post("/ask-query/")
async def ask_query(query: dict):
    """
    Ask a specific question about the mortgage documents
    """
    global vectordb
    
    if "question" not in query:
        raise HTTPException(status_code=400, detail="Query must include a 'question' field")
    
    try:
        # Ensure vector database is initialized
        if vectordb is None:
            vectordb = create_vector_db()
        
        # Get answer to user's query
        answer = ask_mortgage_query(query["question"], vectordb)
        
        return {"question": query["question"], "answer": answer}
    except Exception as e:
        print(f"Query error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to process query: {str(e)}")

@app.post("/sync-data/")
async def sync_data():
    """
    Synchronize files between Supabase and local data directory, and rebuild the vector database
    """
    try:
        # List files in Supabase
        supabase_files = supabase.storage.from_(bucket_name).list()
        supabase_filenames = {file["name"] for file in supabase_files if file.get("name")}
        
        # List files in data directory
        data_dir = Path("data")
        data_dir.mkdir(exist_ok=True)
        local_files = {file.name for file in data_dir.glob("*.pdf")}
        
        # Files in Supabase but not in data
        files_to_download = supabase_filenames - local_files
        for filename in files_to_download:
            try:
                # Download from Supabase
                content = supabase.storage.from_(bucket_name).download(filename)
                
                # Save locally
                with open(data_dir / filename, "wb") as f:
                    f.write(content)
                print(f"Downloaded {filename} from Supabase")
            except Exception as e:
                print(f"Error downloading {filename}: {str(e)}")
        
        # Files in data but not in Supabase
        files_to_upload = local_files - supabase_filenames
        for filename in files_to_upload:
            try:
                # Read local file
                with open(data_dir / filename, "rb") as f:
                    content = f.read()
                
                # Upload to Supabase
                supabase.storage.from_(bucket_name).upload(
                    path=filename,
                    file=content,
                    file_options={"content-type": "application/pdf"}
                )
                print(f"Uploaded {filename} to Supabase")
            except Exception as e:
                print(f"Error uploading {filename}: {str(e)}")
        
        # Rebuild vector database
        global vectordb
        from mortgage_analysis import update_vector_db
        vectordb = update_vector_db()
        
        return {
            "message": "Data synchronized successfully",
            "downloaded": list(files_to_download),
            "uploaded": list(files_to_upload)
        }
    except Exception as e:
        print(f"Sync error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to synchronize data: {str(e)}")

@app.get("/local-pdfs/")
async def list_local_pdfs():
    """
    List all PDF files in the local data directory
    """
    try:
        data_dir = Path("data")
        data_dir.mkdir(exist_ok=True)
        local_files = list(data_dir.glob("*.pdf"))
        
        # Format the results
        files_info = []
        for file_path in local_files:
            # Get file stats
            stats = file_path.stat()
            # Add file information
            files_info.append({
                "filename": file_path.name,
                "size_bytes": stats.st_size,
                "created_at": stats.st_ctime,
                "modified_at": stats.st_mtime
            })
        
        return {"files": sorted(files_info, key=lambda x: x["modified_at"], reverse=True)}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to list local PDFs: {str(e)}")

@app.get("/pdfs/{filename}")
async def get_pdf(filename: str):
    """
    Get a specific PDF file by filename
    """
    try:
        # Check if file exists in local data directory
        local_file_path = Path("data") / filename
        if local_file_path.exists():
            return FileResponse(
                path=local_file_path,
                media_type="application/pdf",
                filename=filename
            )
        
        # If not in local directory, try to download from Supabase
        try:
            content = supabase.storage.from_(bucket_name).download(filename)
            
            # Save locally for future use
            with open(local_file_path, "wb") as f:
                f.write(content)
            
            return FileResponse(
                path=local_file_path,
                media_type="application/pdf",
                filename=filename
            )
        except Exception as e:
            raise HTTPException(status_code=404, detail=f"PDF not found: {filename}")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to retrieve PDF: {str(e)}")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True) 