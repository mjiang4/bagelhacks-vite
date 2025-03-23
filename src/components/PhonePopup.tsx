import React, { useState, useEffect } from 'react';
import phoneCallIcon from '../assets/Phone call.png';
import phoneMissingIcon from '../assets/Phone missed.png';

interface PhonePopupProps {
  isOpen: boolean;
  onClose: () => void;
  onCompareQuotes?: () => void;
}

export default function PhonePopup({ isOpen, onClose, onCompareQuotes }: PhonePopupProps) {
  const [transformed, setTransformed] = useState(false);
  
  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => {
        setTransformed(true);
      }, 5000);
      
      return () => clearTimeout(timer);
    } else {
      setTransformed(false);
    }
  }, [isOpen]);
  
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
          <div className={`absolute w-[150px] h-[150px] rounded-full ${transformed ? 'bg-[#35EEDF]' : 'bg-[#E038BC]'} opacity-75 blur-2xl transition-colors duration-500`}></div>
          
          {/* Main circle */}
          <div className="w-[100px] h-[100px] bg-[#E4E3ED] rounded-full flex items-center justify-center relative z-10">
            <img 
              src={transformed ? phoneMissingIcon : phoneCallIcon} 
              alt="Phone" 
              className="w-12 h-12"
            />
          </div>
        </div>
        
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