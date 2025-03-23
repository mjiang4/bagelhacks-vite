import React from 'react';

interface MortgageComparisonProps {
  monthlyPayment: string;
  interestRate: string;
  cashToClose: string;
  isBest?: boolean;
  label: string;
  url?: string;
}

const MortgageComparison: React.FC<MortgageComparisonProps> = ({
  monthlyPayment,
  interestRate,
  cashToClose,
  isBest = false,
  label,
  url
}) => {
  const borderColor = isBest ? 'border-[#35EEDF]' : 'border-[#B07FEB]';
  const labelColor = isBest ? 'text-[#35EEDF]' : 'text-[#B07FEB]';

  return (
    <div className="relative pl-10">
      {/* BEST label positioned outside on the left */}
      {isBest && (
        <div className="absolute left-0 top-1/2 -translate-y-1/2 h-full flex items-center">
          <div className={`${labelColor} text-4xl font-bold tracking-widest vertical-text`}>
            BEST
          </div>
        </div>
      )}
      
      <div className={`relative bg-[#211A3F] backdrop-blur-md rounded-[30px] p-6 w-full border-2 ${borderColor} overflow-hidden`}>
        <div className="flex-grow flex flex-col">
          <div className={`${labelColor} text-xl font-bold mb-4 flex items-center`}>
            {label}
            {url && (
              <a href={url} target="_blank" rel="noopener noreferrer" className="ml-2">
                ↗
              </a>
            )}
          </div>
          <div className="flex justify-between items-center">
            <div className="flex flex-col items-center mx-2">
              <div className="text-white text-lg mb-2">Monthly Payment</div>
              <div className={`${labelColor} text-3xl font-bold`}>${monthlyPayment}</div>
            </div>
            
            <div className="flex flex-col items-center mx-2">
              <div className="text-white text-lg mb-2">Interest Rate</div>
              <div className={`${labelColor} text-3xl font-bold`}>{interestRate}%</div>
            </div>
            
            <div className="flex flex-col items-center mx-2">
              <div className="text-white text-lg mb-2">Cash to Close</div>
              <div className={`${labelColor} text-3xl font-bold`}>${cashToClose}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default function MortgageComparisons() {
  return (
    <div className="w-full max-w-3xl mx-auto">
      <h2 className="text-white text-3xl font-bold mb-8 text-center">Your alternatives</h2>
      
      <div className="space-y-6">
        <MortgageComparison 
          monthlyPayment="3,950.50"
          interestRate="8.45"
          cashToClose="13,200.00"
          isBest={true}
          label="Mortgage comp 1"
          url="#"
        />

        <MortgageComparison 
          monthlyPayment="3,980.75"
          interestRate="8.50"
          cashToClose="13,250.50"
          isBest={false}
          label="Mortgage comp 2"
          url="#"
        />

        <MortgageComparison 
          monthlyPayment="4,010.00"
          interestRate="8.55"
          cashToClose="13,300.00"
          isBest={false}
          label="Mortgage comp 3"
          url="#"
        />

        <MortgageComparison 
          monthlyPayment="4,030.00"
          interestRate="8.60"
          cashToClose="13,320.75"
          isBest={false}
          label="Mortgage comp 4"
          url="#"
        />

        <MortgageComparison 
          monthlyPayment="4,050.00"
          interestRate="8.62"
          cashToClose="13,340.25"
          isBest={false}
          label="Mortgage comp 5"
          url="#"
        />
      </div>
    </div>
  );
} 