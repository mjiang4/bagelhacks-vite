import { useState, useRef, useEffect } from 'react';

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
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isHovering, setIsHovering] = useState(false);
  const [scanPosition, setScanPosition] = useState(0);
  const dropRef = useRef<HTMLDivElement>(null);
  const glossyRef = useRef<HTMLDivElement>(null);
  const animationRef = useRef<number | null>(null);
  
  // Handle scanline animation
  useEffect(() => {
    if (!isHovering) return;
    
    let startTime: number;
    const duration = 2000; // 2 seconds for a full scan cycle
    
    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const elapsed = timestamp - startTime;
      
      // Create a smooth oscillation between 0 and 100
      const position = (Math.sin((elapsed / duration) * Math.PI) + 1) * 50;
      setScanPosition(position);
      
      animationRef.current = requestAnimationFrame(animate);
    };
    
    animationRef.current = requestAnimationFrame(animate);
    
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
        animationRef.current = null;
      }
    };
  }, [isHovering]);
  
  // Handle mouse movement for the glossy effect
  const handleMouseMove = (e: React.MouseEvent) => {
    if (dropRef.current) {
      const rect = dropRef.current.getBoundingClientRect();
      setMousePosition({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
      });
    }
  };
  
  const handleMouseEnter = () => {
    setIsHovering(true);
  };
  
  const handleMouseLeave = () => {
    setIsHovering(false);
  };
  
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
      className={`file-upload-container w-full max-w-xl mx-auto bg-[#211A3F]/60 backdrop-blur-md rounded-[4vw] py-16 px-8 border border-[#E4E3ED]/40 flex flex-col items-center justify-center cursor-pointer relative overflow-hidden ${isDragging ? 'drag-active' : ''} ${isUploading || isAnalyzing ? 'opacity-70' : ''}`}
      onClick={() => document.getElementById('file-input')?.click()}
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* Holographic scanner effect */}
      {isHovering && (
        <>
          {/* Horizontal scan line */}
          <div 
            className="absolute left-0 right-0 h-[2px] pointer-events-none"
            style={{
              top: `${scanPosition}%`,
              background: 'linear-gradient(90deg, transparent 0%, rgba(53, 238, 223, 0.2) 20%, rgba(53, 238, 223, 0.8) 50%, rgba(53, 238, 223, 0.2) 80%, transparent 100%)',
              boxShadow: '0 0 10px rgba(53, 238, 223, 0.5), 0 0 20px rgba(53, 238, 223, 0.3)',
              zIndex: 5
            }}
          ></div>
          
          {/* Top corner hud elements */}
          <div className="absolute top-4 left-4 flex items-center pointer-events-none" style={{ zIndex: 5 }}>
            <div className="w-2 h-2 bg-[#35EEDF] rounded-full opacity-70 animate-pulse"></div>
            <div className="ml-2 text-[10px] font-mono text-[#35EEDF] opacity-70">
              SCAN ACTIVE
            </div>
          </div>
          
          <div className="absolute top-4 right-4 flex items-center pointer-events-none" style={{ zIndex: 5 }}>
            <div className="text-[10px] font-mono text-[#35EEDF] opacity-70">
              {Math.floor(Math.random() * 9999).toString().padStart(4, '0')}
            </div>
          </div>
          
          {/* Corner brackets */}
          <div className="absolute top-4 left-4 w-12 h-12 border-t-2 border-l-2 border-[#35EEDF]/30 rounded-tl-lg pointer-events-none" style={{ zIndex: 5 }}></div>
          <div className="absolute top-4 right-4 w-12 h-12 border-t-2 border-r-2 border-[#35EEDF]/30 rounded-tr-lg pointer-events-none" style={{ zIndex: 5 }}></div>
          <div className="absolute bottom-4 left-4 w-12 h-12 border-b-2 border-l-2 border-[#35EEDF]/30 rounded-bl-lg pointer-events-none" style={{ zIndex: 5 }}></div>
          <div className="absolute bottom-4 right-4 w-12 h-12 border-b-2 border-r-2 border-[#35EEDF]/30 rounded-br-lg pointer-events-none" style={{ zIndex: 5 }}></div>
        </>
      )}
      
      {/* Primary glossy effect that follows mouse */}
      <div 
        ref={glossyRef}
        className="absolute pointer-events-none transition-opacity duration-300"
        style={{
          left: mousePosition.x - 150,
          top: mousePosition.y - 150,
          width: '300px',
          height: '300px',
          background: 'radial-gradient(circle, rgba(53, 238, 223, 0.2) 0%, rgba(224, 56, 188, 0.1) 35%, transparent 70%)',
          borderRadius: '50%',
          opacity: isHovering ? 1 : 0,
          transform: 'translate(0, 0)',
          transition: 'opacity 0.3s ease-out, background 0.3s ease-out',
          mixBlendMode: 'screen',
          filter: 'blur(8px)',
        }}
      />
      
      <div className="upload-icon mb-4 relative z-10">
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M12 4L12 16M12 4L8 8M12 4L16 8" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M3 15V19C3 20.1046 3.89543 21 5 21H19C20.1046 21 21 20.1046 21 19V15" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </div>
      <p className="text-[#FFFFFF] text-base mb-1 relative z-10">
        {isUploading 
          ? 'Uploading...' 
          : isAnalyzing 
            ? 'Analyzing your mortgage document...' 
            : 'Drag and drop your mortgage document here, or click to select'}
      </p>
      <p className="text-[#D9D9D9] text-sm relative z-10">Supported format: PDF (max 10MB)</p>
      {error && <p className="text-red-500 mt-2 relative z-10">{error}</p>}
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