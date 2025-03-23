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
          monthlyPayment="1,856"
          interestRate="3.758"
          cashToClose="30,367"
          isBest={true}
          label="Mortgage comp 1"
          url="#"
        />

        <MortgageComparison 
          monthlyPayment="1,956.50"
          interestRate="3.812"
          cashToClose="31,250.75"
          isBest={false}
          label="Mortgage comp 2"
          url="#"
        />

        <MortgageComparison 
          monthlyPayment="1,987.25"
          interestRate="3.925"
          cashToClose="32,100.60"
          isBest={false}
          label="Mortgage comp 3"
          url="#"
        />

        <MortgageComparison 
          monthlyPayment="2,012.80"
          interestRate="4.045"
          cashToClose="33,345.90"
          isBest={false}
          label="Mortgage comp 4"
          url="#"
        />

        <MortgageComparison 
          monthlyPayment="2,098.95"
          interestRate="4.215"
          cashToClose="34,125.50"
          isBest={false}
          label="Mortgage comp 5"
          url="#"
        />
      </div>
    </div>
  );
} 