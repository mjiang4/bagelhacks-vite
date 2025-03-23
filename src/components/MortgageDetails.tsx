import React from 'react';

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
  return (
    <div className="w-full max-w-3xl mx-auto flex flex-col items-center">
      {/* File name display with X button */}
      <div className="bg-[#211A3F]/60 backdrop-blur-md rounded-full py-4 px-6 flex items-center border border-[#E4E3ED] justify-between mb-24 w-[80%]">
        <div className="text-white flex-grow text-left">{fileName}</div>
        <button className="text-white text-xl ml-4 hover:text-gray-300 cursor-pointer" onClick={onClose}>×</button>
      </div>
      
      {/* Three cards displaying mortgage details */}
      <div className="flex justify-center gap-6 w-full min-w-full md:flex-nowrap">
        {/* Monthly Payment */}
        <div className="bg-[#211A3F] backdrop-blur-md rounded-[30px] p-6 flex-1 flex flex-col items-center">
          <div className="text-white text-lg mb-2">Monthly Payment</div>
          <div className="text-[#E038BC] text-3xl font-bold">{monthlyPayment}</div>
        </div>
        
        {/* Interest Rate */}
        <div className="bg-[#211A3F] backdrop-blur-md rounded-[30px] p-6 flex-1 flex flex-col items-center">
          <div className="text-white text-lg mb-2">Interest Rate</div>
          <div className="text-[#35EEDF] text-3xl font-bold">{interestRate}</div>
        </div>
        
        {/* Cash to Close */}
        <div className="bg-[#211A3F] backdrop-blur-md rounded-[30px] p-6 flex-1 flex flex-col items-center">
          <div className="text-white text-lg mb-2">Cash to Close</div>
          <div className="text-[#B07FEB] text-3xl font-bold">{cashToClose}</div>
        </div>
      </div>
      
      {/* Action buttons */}
      <div className="flex gap-6 mt-24">
        <button className="bg-transparent backdrop-blur-md border border-[#35EEDF] text-[#35EEDF] font-bold py-3 px-10 rounded-full hover:bg-[#35EEDF]/10 cursor-pointer">
          get explanations
        </button>
        <button className="bg-[#35EEDF] text-black py-3 px-10 rounded-full font-bold hover:bg-[#35EEDF]/80 cursor-pointer">
          shop cheaper
        </button>
      </div>
    </div>
  );
} 