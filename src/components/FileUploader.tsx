import { useState, useRef } from 'react';

interface UploadResponse {
  message: string;
  file_id: string;
  filename: string;
  url: string;
}

export default function FileUploader({ onFileSelected }: { onFileSelected: (file: File) => void }) {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const dropRef = useRef<HTMLDivElement>(null);
  
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      onFileSelected(file);
      await uploadFile(file);
    }
  };
  
  const uploadFile = async (file: File) => {
    if (!file.name.toLowerCase().endsWith('.pdf')) {
      setError('File must be a PDF');
      return;
    }

    setIsUploading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('http://localhost:8000/upload-pdf/', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`Server responded with ${response.status}`);
      }

      const result: UploadResponse = await response.json();
      console.log('File uploaded successfully:', result);
      // We don't need to set anything since we're just uploading
    } catch (err) {
      setError(`Upload failed: ${err instanceof Error ? err.message : String(err)}`);
      console.error('Upload error:', err);
    } finally {
      setIsUploading(false);
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
      await uploadFile(file);
    }
  };
  
  return (
    <div 
      ref={dropRef}
      className={`file-upload-container w-full max-w-xl mx-auto bg-[#211A3F]/60 backdrop-blur-md rounded-[4vw] py-16 px-8 border border-[#E4E3ED]/40 flex flex-col items-center justify-center cursor-pointer ${isDragging ? 'drag-active' : ''} ${isUploading ? 'opacity-70' : ''}`}
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
      <p className="text-[#FFFFFF] text-base mb-1">{isUploading ? 'Uploading...' : 'Drag and drop your mortgage document here, or click to select'}</p>
      <p className="text-[#D9D9D9] text-sm">Supported format: PDF, JPG (max 10MB)</p>
      {error && <p className="text-red-500 mt-2">{error}</p>}
      <input 
        id="file-input"
        type="file"
        accept=".pdf,.jpg,.jpeg"
        onChange={handleFileChange}
        className="hidden"
      />
    </div>
  );
} 