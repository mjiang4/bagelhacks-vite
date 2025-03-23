# Mortgage Analysis Backend

This backend provides a FastAPI server that handles mortgage document uploads and analysis using AI.

## Setup

### Environment Setup
1. Ensure Python 3.8+ is installed
2. Install dependencies:
   ```
   pip install -r requirements.txt
   ```
3. Configure your `.env` file with the following:
   ```
   SUPABASE_URL=your_supabase_url
   SUPABASE_KEY=your_supabase_key
   SUPABASE_BUCKET=mortgage-uploads
   
   # OpenAI API credentials for the mortgage analysis
   OPENAI_API_TYPE=azure
   OPENAI_API_KEY=your_openai_api_key
   OPENAI_API_BASE=your_openai_api_base
   OPENAI_API_VERSION=2024-12-01-preview
   ```

### Data Directory
Create a `data` directory in the backend folder to store uploaded mortgage documents:
```
mkdir data
```

## Running the server

### Windows
```
run.bat
```

### Mac/Linux
```
chmod +x run.sh
./run.sh
```

Or directly:
```
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

## API Endpoints

### `GET /`
- Description: Health check
- Response: `{"message": "PDF Storage API is running"}`

### `POST /upload-pdf/`
- Description: Upload a PDF document
- Request: Form data with a `file` field containing a PDF file
- Response: 
  ```json
  {
    "message": "PDF uploaded successfully",
    "file_id": "uuid",
    "filename": "filename.pdf",
    "url": "public_url"
  }
  ```

### `POST /analyze-mortgage/`
- Description: Analyze all uploaded mortgage documents
- Response: JSON object with mortgage details
  ```json
  {
    "interest_rate": "4.5%", 
    "monthly_payment": "$1,500", 
    "cash_to_close": "$20,000"
  }
  ```

### `POST /ask-query/`
- Description: Ask a specific question about the mortgage documents
- Request:
  ```json
  {
    "question": "What is the interest rate on my mortgage?"
  }
  ```
- Response:
  ```json
  {
    "question": "What is the interest rate on my mortgage?",
    "answer": "Your mortgage has an interest rate of 4.5%."
  }
  ```

### `GET /pdfs/`
- Description: List all uploaded PDFs
- Response: `{"files": [...]}`

### `DELETE /pdfs/{filename}`
- Description: Delete a specific PDF
- Response: `{"message": "PDF {filename} deleted successfully"}`