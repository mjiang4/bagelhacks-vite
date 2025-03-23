import React, { useState, useRef } from 'react';
import ChatInterface from './ChatInterface';

interface MortgageDetailsProps {
  fileName: string;
  monthlyPayment: string;
  interestRate: string;
  cashToClose: string;
  onClose: () => void;
}

export default function MortgageDetails({ 
  fileName, 
  monthlyPayment, 
  interestRate, 
  cashToClose,
  onClose 
}: MortgageDetailsProps) {
  const [showChat, setShowChat] = useState(false);
  const cardsRef = useRef<HTMLDivElement>(null);

  const handleGetExplanations = () => {
    setShowChat(true);
  };

  return (
    <div className="w-full max-w-3xl mx-auto flex flex-col items-center">
      {/* File name display with X button */}
      <div className="bg-[#211A3F]/60 backdrop-blur-md rounded-full py-4 px-6 flex items-center border border-[#E4E3ED] justify-between mb-24 w-[80%]">
        <div className="text-white flex-grow text-left">{fileName}</div>
        <button className="text-white text-xl ml-4 hover:text-gray-300 cursor-pointer" onClick={onClose}>×</button>
      </div>
      
      {/* Three cards displaying mortgage details */}
      <div className="flex justify-center gap-6 w-full min-w-full md:flex-nowrap relative z-10">
        {/* Monthly Payment */}
        <div className="bg-[#211A3F] backdrop-blur-md rounded-[30px] p-6 flex-1 flex flex-col items-center min-w-[260px] relative overflow-hidden">
          <div className="absolute inset-0 border-[6px] border-[#E038BC]/30 rounded-[30px] box-border shadow-[0_0_40px_10px_rgba(224,56,188,0.2)]"></div>
          <div className="relative z-10">
            <div className="text-white text-lg mb-2">Monthly Payment</div>
            <div className="text-[#E038BC] text-3xl font-bold">{monthlyPayment}</div>
          </div>
        </div>
        
        {/* Interest Rate */}
        <div className="bg-[#211A3F] backdrop-blur-md rounded-[30px] p-6 flex-1 flex flex-col items-center min-w-[260px] relative overflow-hidden">
          <div className="absolute inset-0 border-[6px] border-[#35EEDF]/30 rounded-[30px] box-border shadow-[0_0_40px_10px_rgba(53,238,223,0.2)]"></div>
          <div className="relative z-10">
            <div className="text-white text-lg mb-2">Interest Rate</div>
            <div className="text-[#35EEDF] text-3xl font-bold">{interestRate}</div>
          </div>
        </div>
        
        {/* Cash to Close */}
        <div className="bg-[#211A3F] backdrop-blur-md rounded-[30px] p-6 flex-1 flex flex-col items-center min-w-[260px] relative overflow-hidden">
          <div className="absolute inset-0 border-[6px] border-[#B07FEB]/30 rounded-[30px] box-border shadow-[0_0_40px_10px_rgba(176,127,235,0.2)]"></div>
          <div className="relative z-10">
            <div className="text-white text-lg mb-2">Cash to Close</div>
            <div className="text-[#B07FEB] text-3xl font-bold">{cashToClose}</div>
          </div>
        </div>
      </div>
      
      {/* Action buttons */}
      <div className={`flex ${showChat ? 'justify-center' : 'gap-6'} mt-24 mb-12 transition-all duration-500 ease-in-out`}>
        {!showChat && (
          <button 
            onClick={handleGetExplanations}
            className="bg-transparent backdrop-blur-md border border-[#35EEDF] text-[#35EEDF] font-bold py-3 px-10 rounded-full hover:bg-[#35EEDF]/10 cursor-pointer transition-all duration-300"
          >
            get explanations
          </button>
        )}
        <button className="bg-[#35EEDF] text-black py-3 px-10 rounded-full font-bold hover:bg-[#35EEDF]/80 cursor-pointer transition-all duration-500">
          shop cheaper
        </button>
      </div>
      
      {/* Chat interface that appears when "get explanations" is clicked */}
      {showChat && <ChatInterface />}
    </div>
  );
} 