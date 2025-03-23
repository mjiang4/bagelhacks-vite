import { useState, useEffect } from 'react'
import './App.css'
import FileUploader from './components/FileUploader'
import BackgroundCircles from './components/bgcircles/BackgroundCircles'
import MortgageDetails from './components/MortgageDetails'

function App() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  
  // Mock data for the mortgage details
  const mockMortgageData = {
    monthlyPayment: "$ 2,386.43",
    interestRate: "4.990%",
    cashToClose: "$ 36,509.05"
  };
  
  const handleFileSelected = (file: File) => {
    setSelectedFile(file);
  };
  
  const handleCloseDetails = () => {
    setSelectedFile(null);
  };

  // Control overflow behavior based on whether details are shown
  useEffect(() => {
    if (selectedFile) {
      document.body.style.overflowY = 'auto';
    } else {
      document.body.style.overflowY = 'hidden';
    }
    
    // Cleanup function
    return () => {
      document.body.style.overflowY = 'hidden';
    };
  }, [selectedFile]);

  return (
    <>
      <div className={`min-h-screen flex flex-col ${selectedFile ? 'overflow-x-hidden' : 'overflow-hidden'}`}>
        <header className="p-3 ml-8 mt-8 flex justify-start">
          <div className="logo-container">
            <h1 className="text-2xl font-bold text-white">LoanLens</h1>
          </div>
        </header>
        
        <main className="flex-1 flex flex-col items-center justify-start px-4 mt-18">
          {!selectedFile ? (
            <>
              <div className="text-center mb-6">
                <h1 className="text-5xl font-medium text-white mb-2">Simplify your mortgage</h1>
                <p className="text-lg font-semibold text-gray-200 mb-2">Understand your mortgage and find cheaper options.</p>
              </div>
              
              <div className="relative w-full">
                <BackgroundCircles />
                <FileUploader onFileSelected={handleFileSelected} />
              </div>
            </>
          ) : (
            <div className="relative w-full pb-24">
              <MortgageDetails 
                fileName={selectedFile.name}
                monthlyPayment={mockMortgageData.monthlyPayment}
                interestRate={mockMortgageData.interestRate}
                cashToClose={mockMortgageData.cashToClose}
                onClose={handleCloseDetails}
              />
            </div>
          )}
        </main>
      </div>
    </>
  )
}

export default App
