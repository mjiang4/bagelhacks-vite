import React from 'react';

export default function ChatInterface() {
  return (
    <div className="w-full max-w-xl mt-12 bg-[#211A3F]/80 backdrop-blur-md rounded-3xl border border-[#E4E3ED]/40 p-6 animate-fadeIn overflow-hidden transition-all duration-300">
      <div className="text-xl text-white mb-6">Got more questions?</div>
      
      {/* Question suggestion buttons */}
      <div className="space-y-2">
        <button className="w-full text-left bg-[#211A3F] py-2 px-4 rounded-full text-white border border-[#E4E3ED]/40 hover:bg-[#2c2252] transition-colors">
          Negotiable fees
        </button>
        <button className="w-full text-left bg-[#211A3F] py-2 px-4 rounded-full text-white border border-[#E4E3ED]/40 hover:bg-[#2c2252] transition-colors">
          Late payments
        </button>
        <button className="w-full text-left bg-[#211A3F] py-2 px-4 rounded-full text-white border border-[#E4E3ED]/40 hover:bg-[#2c2252] transition-colors">
          Early repayment
        </button>
      </div>
      
      {/* Chat input */}
      <div className="mt-12 flex items-center">
        <input 
          type="text" 
          placeholder="Ask about your mortgage..."
          className="flex-grow bg-[#2c2252] border border-[#E4E3ED]/40 rounded-full py-3 px-6 text-white focus:outline-none focus:ring-2 focus:ring-[#35EEDF]/50"
        />
        <button className="ml-2 bg-[#211A3F] p-3 rounded-full">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M22 2L11 13" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M22 2L15 22L11 13L2 9L22 2Z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
      </div>
    </div>
  );
} 