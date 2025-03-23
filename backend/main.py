import os
from fastapi import FastAPI, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from dotenv import load_dotenv
from supabase import create_client, Client
import uuid

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
        
        # Upload to Supabase
        supabase.storage.from_(bucket_name).upload(
            path=filename,
            file=content,
            file_options={"content-type": "application/pdf"}
        )
        
        # Get the public URL
        file_url = supabase.storage.from_(bucket_name).get_public_url(filename)
        
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
        supabase.storage.from_(bucket_name).remove([filename])
        return {"message": f"PDF {filename} deleted successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to delete PDF: {str(e)}")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True) 