import { useState, useRef } from 'react';

interface UploadResponse {
  message: string;
  file_id: string;
  filename: string;
  url: string;
}

interface MortgageAnalysis {
  interest_rate: string;
  monthly_payment: string;
  cash_to_close: string;
}

interface FileUploaderProps {
  onFileSelected: (file: File) => void;
  onAnalysisComplete: (analysis: MortgageAnalysis) => void;
  onError?: (error: string) => void;
}

export default function FileUploader({ onFileSelected, onAnalysisComplete, onError }: FileUploaderProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const dropRef = useRef<HTMLDivElement>(null);
  
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      onFileSelected(file);
      await uploadAndAnalyzeFile(file);
    }
  };
  
  const uploadAndAnalyzeFile = async (file: File) => {
    if (!file.name.toLowerCase().endsWith('.pdf')) {
      const errorMsg = 'File must be a PDF';
      setError(errorMsg);
      if (onError) onError(errorMsg);
      return;
    }

    setIsUploading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('file', file);

      // Step 1: Upload the file
      const response = await fetch('http://localhost:8000/upload-pdf/', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`Server responded with ${response.status}`);
      }

      const result: UploadResponse = await response.json();
      console.log('File uploaded successfully:', result);
      
      // Step 2: Run the update_db.py script to update the vector database
      const updateDbResponse = await fetch('http://localhost:8000/update-db/', {
        method: 'POST',
      });
      
      if (!updateDbResponse.ok) {
        console.warn('Database update may have failed, continuing with analysis');
      } else {
        console.log('Vector database updated successfully');
      }
      
      // Step 3: Trigger analysis after upload is complete
      setIsUploading(false);
      setIsAnalyzing(true);
      
      const analysisResponse = await fetch('http://localhost:8000/analyze-mortgage/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (!analysisResponse.ok) {
        throw new Error(`Analysis failed with status ${analysisResponse.status}`);
      }
      
      const analysisResult: MortgageAnalysis = await analysisResponse.json();
      console.log('Mortgage analysis completed:', analysisResult);
      
      // Step 4: Pass the analysis results to the parent component
      onAnalysisComplete(analysisResult);
      
    } catch (err) {
      const errorMsg = `Process failed: ${err instanceof Error ? err.message : String(err)}`;
      setError(errorMsg);
      if (onError) onError(errorMsg);
      console.error('Error:', err);
    } finally {
      // Only reset local component state, not the parent state
      setIsUploading(false);
      setIsAnalyzing(false);
    }
  };
  
  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };
  
  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };
  
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isDragging) {
      setIsDragging(true);
    }
  };
  
  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      onFileSelected(file);
      await uploadAndAnalyzeFile(file);
    }
  };
  
  return (
    <div 
      ref={dropRef}
      className={`file-upload-container w-full max-w-xl mx-auto bg-[#211A3F]/60 backdrop-blur-md rounded-[4vw] py-16 px-8 border border-[#E4E3ED]/40 flex flex-col items-center justify-center cursor-pointer ${isDragging ? 'drag-active' : ''} ${isUploading || isAnalyzing ? 'opacity-70' : ''}`}
      onClick={() => document.getElementById('file-input')?.click()}
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
    >
      <div className="upload-icon mb-4">
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M12 4L12 16M12 4L8 8M12 4L16 8" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M3 15V19C3 20.1046 3.89543 21 5 21H19C20.1046 21 21 20.1046 21 19V15" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </div>
      <p className="text-[#FFFFFF] text-base mb-1">
        {isUploading 
          ? 'Uploading...' 
          : isAnalyzing 
            ? 'Analyzing your mortgage document...' 
            : 'Drag and drop your mortgage document here, or click to select'}
      </p>
      <p className="text-[#D9D9D9] text-sm">Supported format: PDF (max 10MB)</p>
      {error && <p className="text-red-500 mt-2">{error}</p>}
      <input 
        id="file-input"
        type="file"
        accept=".pdf"
        onChange={handleFileChange}
        className="hidden"
      />
    </div>
  );
} 