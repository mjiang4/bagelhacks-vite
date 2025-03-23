import { useState, useEffect } from 'react';
import phoneCallIcon from '../assets/Phone call.png';
import phoneMissingIcon from '../assets/Phone missed.png';

interface PhonePopupProps {
  isOpen: boolean;
  onClose: () => void;
  onCompareQuotes?: () => void;
}

export default function PhonePopup({ isOpen, onClose, onCompareQuotes }: PhonePopupProps) {
  const [callActive, setCallActive] = useState(false);
  const [transformed, setTransformed] = useState(false);
  const [callTimer, setCallTimer] = useState(0);
  const [timerInterval, setTimerInterval] = useState<number | null>(null);
  
  useEffect(() => {
    if (!isOpen) {
      // Reset states when popup closes
      setCallActive(false);
      setTransformed(false);
      setCallTimer(0);
      if (timerInterval) {
        clearInterval(timerInterval);
        setTimerInterval(null);
      }
    }
  }, [isOpen, timerInterval]);
  
  const startCall = () => {
    if (callActive) return;
    
    setCallActive(true);
    
    // Start timer
    const interval = setInterval(() => {
      setCallTimer(prev => prev + 1);
    }, 1000);
    
    setTimerInterval(interval);
  };
  
  const endCall = () => {
    if (!callActive) return;
    
    // Stop timer
    if (timerInterval) {
      clearInterval(timerInterval);
      setTimerInterval(null);
    }
    
    setTransformed(true);
  };
  
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };
  
  const handleCompareQuotes = () => {
    onClose();
    if (onCompareQuotes) {
      onCompareQuotes();
    }
  };
  
  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-[2px] transition-opacity" 
      onClick={onClose}
    >
      <div 
        className="w-[320px] bg-[#211A3F] rounded-xl relative border border-[#463B78] shadow-lg flex flex-col items-center justify-center py-10"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button 
          className="absolute top-2 right-4 text-white text-xl hover:text-gray-300 cursor-pointer"
          onClick={onClose}
        >
          ×
        </button>
        
        {/* Text above the phone icon */}
        <div className="text-[#FFFFFF] text-center mb-5">
          {transformed ? (
            <>
              <p className="text-xl">We've got it.</p>
              <p className="text-xl">Get your quotes now.</p>
            </>
          ) : (
            <>
              <p className="text-xl">We need some more info.</p>
              <p className="text-xl">Let's chat!</p>
            </>
          )}
        </div>
        
        {/* Phone circle with smooth blur glow */}
        <div className="relative flex items-center justify-center mb-6">
          {/* Smooth blur glow */}
          <div className={`absolute w-[150px] h-[150px] rounded-full ${callActive ? 'bg-[#35EEDF]' : 'bg-[#E038BC]'} opacity-75 blur-2xl transition-colors duration-500`}></div>
          
          {/* Main circle */}
          <div 
            className="w-[100px] h-[100px] bg-[#E4E3ED] rounded-full flex items-center justify-center relative z-10 cursor-pointer"
            onClick={callActive ? endCall : startCall}
          >
            <img 
              src={callActive ? phoneMissingIcon : phoneCallIcon} 
              alt="Phone" 
              className="w-12 h-12"
            />
          </div>
        </div>
        
        {/* Timer or Compare quotes button */}
        {callActive && !transformed && (
          <div className="text-[#35EEDF] font-mono text-xl">
            {formatTime(callTimer)}
          </div>
        )}
        
        {/* Compare quotes button (appears after transform) */}
        {transformed && (
          <button 
            onClick={handleCompareQuotes}
            className="bg-[#35EEDF] text-black py-2 px-6 rounded-full font-bold hover:bg-[#35EEDF]/80 cursor-pointer transition-all duration-500 text-sm"
          >
            compare quotes
          </button>
        )}
      </div>
    </div>
  );
} 