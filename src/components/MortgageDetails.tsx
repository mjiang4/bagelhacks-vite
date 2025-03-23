import { useState, useRef, useEffect } from 'react';
import ChatInterface from './ChatInterface';
import PhonePopup from './PhonePopup';
import MortgageComparisons from './MortgageComparisons';

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
  const [showPhonePopup, setShowPhonePopup] = useState(false);
  const [showComparisons, setShowComparisons] = useState(false);
  const cardsRef = useRef<HTMLDivElement>(null);
  const chatRef = useRef<HTMLDivElement>(null);
  const comparisonsRef = useRef<HTMLDivElement>(null);

  const handleGetExplanations = () => {
    setShowChat(true);
    setShowComparisons(false);
  };

  const handleShopCheaper = () => {
    setShowPhonePopup(true);
  };

  const handleCompareQuotes = () => {
    setShowChat(false);
    setShowComparisons(true);
  };

  // Scroll to chat when it appears
  useEffect(() => {
    if (showChat && chatRef.current) {
      setTimeout(() => {
        chatRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 100);
    }
  }, [showChat]);

  // Scroll to comparisons when they appear
  useEffect(() => {
    if (showComparisons && comparisonsRef.current) {
      setTimeout(() => {
        comparisonsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 100);
    }
  }, [showComparisons]);

  return (
    <div className="w-full max-w-3xl mx-auto flex flex-col items-center">
      {/* File name display with X button */}
      <div className="bg-[#211A3F]/60 backdrop-blur-md rounded-full py-4 px-6 flex items-center border border-[#E4E3ED] justify-between mb-24 w-[80%]">
        <div className="text-white flex-grow text-left">{fileName}</div>
        <button className="text-white text-3xl ml-4 hover:text-gray-300 cursor-pointer" onClick={onClose}>×</button>
      </div>
      
      {/* Three cards displaying mortgage details with blurs positioned outside */}
      <div ref={cardsRef} className="flex justify-center gap-6 w-full min-w-full md:flex-nowrap relative z-10">
        {/* Left blur - E038BC */}
        <div className="absolute top-[50%] -translate-y-1/2 left-[16.67%] -translate-x-1/2 bg-[#E038BC] blur-[75px] w-[350px] h-[200px] rounded-[175px/100px] opacity-50"></div>
        
        {/* Middle blur - 35EEDF */}
        <div className="absolute top-[50%] -translate-y-1/2 left-[50%] -translate-x-1/2 bg-[#35EEDF] blur-[75px] w-[350px] h-[200px] rounded-[175px/100px] opacity-50"></div>
        
        {/* Right blur - 8835EE */}
        <div className="absolute top-[50%] -translate-y-1/2 left-[83.33%] -translate-x-1/2 bg-[#8835EE] blur-[75px] w-[350px] h-[200px] rounded-[175px/100px] opacity-50"></div>
        
        {/* Monthly Payment */}
        <div className="bg-[#211A3F] backdrop-blur-md rounded-[30px] p-6 flex-1 flex flex-col items-center min-w-[260px] relative overflow-hidden shadow-[0_0_40px_10px_rgba(224,56,188,0.2)]">
          <div className="relative z-10">
            <div className="text-white text-lg mb-2">Monthly Payment</div>
            <div className="text-[#E038BC] text-3xl font-bold">{monthlyPayment}</div>
          </div>
        </div>
        
        {/* Interest Rate */}
        <div className="bg-[#211A3F] backdrop-blur-md rounded-[30px] p-6 flex-1 flex flex-col items-center min-w-[260px] relative overflow-hidden shadow-[0_0_40px_10px_rgba(53,238,223,0.2)]">
          <div className="relative z-10">
            <div className="text-white text-lg mb-2">Interest Rate</div>
            <div className="text-[#35EEDF] text-3xl font-bold">{interestRate}</div>
          </div>
        </div>
        
        {/* Cash to Close */}
        <div className="bg-[#211A3F] backdrop-blur-md rounded-[30px] p-6 flex-1 flex flex-col items-center min-w-[260px] relative overflow-hidden shadow-[0_0_40px_10px_rgba(176,127,235,0.2)]">
          <div className="relative z-10">
            <div className="text-white text-lg mb-2">Cash to Close</div>
            <div className="text-[#B07FEB] text-3xl font-bold">{cashToClose}</div>
          </div>
        </div>
      </div>
      
      {/* Action buttons */}
      <div className={`flex ${showChat || showComparisons ? 'justify-center' : 'gap-6'} mt-24 mb-12 transition-all duration-500 ease-in-out`}>
        {!showChat && !showComparisons && (
          <button 
            onClick={handleGetExplanations}
            className="bg-transparent backdrop-blur-md border border-[#35EEDF] text-[#35EEDF] font-bold py-3 px-10 rounded-full hover:bg-[#35EEDF]/10 cursor-pointer transition-all duration-300"
          >
            get explanations
          </button>
        )}
        {!showComparisons && (
          <button 
            onClick={handleShopCheaper}
            className="bg-[#35EEDF] text-black py-3 px-10 rounded-full font-bold hover:bg-[#35EEDF]/80 cursor-pointer transition-all duration-500"
          >
            shop cheaper
          </button>
        )}
      </div>
      
      {/* Chat interface that appears when "get explanations" is clicked */}
      {showChat && (
        <div ref={chatRef} className="mt-8">
          <ChatInterface />
        </div>
      )}
      
      {/* Mortgage comparisons that appear when "compare quotes" is clicked */}
      {showComparisons && (
        <div ref={comparisonsRef}>
          <MortgageComparisons />
        </div>
      )}
      
      {/* Phone popup component */}
      <PhonePopup
        isOpen={showPhonePopup}
        onClose={() => setShowPhonePopup(false)}
        onCompareQuotes={handleCompareQuotes}
      />
    </div>
  );
} 