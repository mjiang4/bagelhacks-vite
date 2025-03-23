import React, { useState } from 'react';
import { askMortgageQuestion } from '../services/mortgageAPI';

export default function ChatInterface() {
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // Handle predefined question button clicks
  const handlePredefinedQuestion = async (predefinedQuestion: string) => {
    setQuestion(predefinedQuestion);
    await handleSubmit(predefinedQuestion);
  };

  // Handle direct response for rate questions
  const handleRateQuestion = () => {
    const rateQuestion = 'Is my rate good?';
    setQuestion(rateQuestion);
    setIsLoading(true);
    
    setTimeout(() => {
      setAnswer("It's hard to say without comparing. The best way to know if your rate is good is to shop around and see what other lenders are offering. Check your rates with Mortgage Minder now!");
      setIsLoading(false);
      setQuestion('');
    }, 2500);
  };

  // Handle form submission for the question
  const handleSubmit = async (userQuestion?: string) => {
    try {
      const questionToAsk = userQuestion || question;
      if (!questionToAsk) return;

      setIsLoading(true);
      setError('');
      
      const response = await askMortgageQuestion(questionToAsk);
      setAnswer(response);
      setQuestion(''); // Clear the input field after submission
    } catch (err) {
      setError('Failed to get an answer. Please try again.');
      console.error('Error in chat submission:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle form submission via Enter key or submit button
  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSubmit();
  };

  return (
    <>
      <div className="text-xl text-white mb-4 text-left">Got more questions?</div>
      
      <div className="w-full max-w-xl bg-[#211A3F]/80 backdrop-blur-md rounded-3xl border border-[#E4E3ED]/40 p-6 animate-fadeIn overflow-hidden transition-all duration-300">
        {/* Question suggestion buttons */}
        <div className="flex flex-wrap justify-center gap-2 mb-6">
          <button 
            className="inline-block text-left bg-[#211A3F] py-2 px-4 rounded-full text-white border border-[#E4E3ED]/40 hover:bg-[#2c2252] transition-colors cursor-pointer"
            onClick={handleRateQuestion}
          >
            Is my rate good?
          </button>
          <button 
            className="inline-block text-left bg-[#211A3F] py-2 px-4 rounded-full text-white border border-[#E4E3ED]/40 hover:bg-[#2c2252] transition-colors cursor-pointer"
            onClick={() => handlePredefinedQuestion('What happens if I make late payments?')}
          >
            What if I pay late?
          </button>
          <button 
            className="inline-block text-left bg-[#211A3F] py-2 px-4 rounded-full text-white border border-[#E4E3ED]/40 hover:bg-[#2c2252] transition-colors cursor-pointer"
            onClick={() => handlePredefinedQuestion('Are these fees normal?')}
          >
            Are these fees normal?
          </button>
        </div>
        
        {/* Answer display area */}
        {answer && (
          <div className="mt-4 mb-6 p-4 rounded-lg bg-[#2c2252]/50 text-white">
            <p>{answer}</p>
          </div>
        )}

        {/* Error message */}
        {error && (
          <div className="mt-2 mb-4 p-2 rounded bg-red-900/50 text-red-200 text-sm">
            {error}
          </div>
        )}
        
        {/* Chat input */}
        <form onSubmit={handleFormSubmit} className="flex items-center">
          <input 
            type="text" 
            placeholder="Ask about your mortgage..."
            className="flex-grow bg-[#2c2252] border border-[#E4E3ED]/40 rounded-full py-3 px-6 text-white focus:outline-none focus:ring-2 focus:ring-[#35EEDF]/50"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            disabled={isLoading}
          />
          <button 
            type="submit" 
            className="ml-2 bg-[#211A3F] p-3 rounded-full disabled:opacity-50 cursor-pointer"
            disabled={isLoading}
          >
            {isLoading ? (
              <div className="w-6 h-6 border-2 border-t-transparent border-white rounded-full animate-spin"></div>
            ) : (
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M22 2L11 13" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M22 2L15 22L11 13L2 9L22 2Z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            )}
          </button>
        </form>
      </div>
    </>
  );
} 