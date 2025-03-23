import { useState, useEffect } from 'react'
import './App.css'
import FileUploader from './components/FileUploader'
import BackgroundCircles from './components/bgcircles/BackgroundCircles'
import MortgageDetails from './components/MortgageDetails'
import { useNavigate, useLocation } from 'react-router-dom'

interface MortgageAnalysis {
  interest_rate: string;
  monthly_payment: string;
  cash_to_close: string;
}

interface AppProps {
  initialShowDetails?: boolean;
}

function App({ initialShowDetails = false }: AppProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [mortgageData, setMortgageData] = useState<MortgageAnalysis | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showFileUploader, setShowFileUploader] = useState(!initialShowDetails);
  
  // Check if we need to show details from URL params
  useEffect(() => {
    if (location.pathname === '/details') {
      setShowFileUploader(false);
    } else {
      setShowFileUploader(true);
    }
  }, [location.pathname]);
  
  const handleFileSelected = (file: File) => {
    setSelectedFile(file);
    setIsLoading(true);
    setError(null);
    setShowFileUploader(false);
  };
  
  const handleAnalysisComplete = (analysis: MortgageAnalysis) => {
    setMortgageData(analysis);
    setIsLoading(false);
    setShowFileUploader(false);
    // Navigate to the details page
    navigate('/details');
  };
  
  const handleCloseDetails = () => {
    setSelectedFile(null);
    setMortgageData(null);
    setError(null);
    setShowFileUploader(true);
    navigate('/');
  };

  const handleError = (errorMessage: string) => {
    setError(errorMessage);
    setIsLoading(false);
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
          {showFileUploader ? (
            <>
              <div className="text-center mb-6">
                <h1 className="text-5xl font-medium text-white mb-2">Simplify your mortgage</h1>
                <p className="text-lg font-semibold text-gray-200 mb-2">Understand your mortgage and find cheaper options.</p>
              </div>
              
              <div className="relative w-full">
                <BackgroundCircles />
                <FileUploader 
                  onFileSelected={handleFileSelected} 
                  onAnalysisComplete={handleAnalysisComplete}
                  onError={handleError}
                />
              </div>
            </>
          ) : (
            <div className="relative w-full pb-24">
              {isLoading ? (
                <div className="text-center py-20">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
                  <p className="text-white text-lg">Analyzing your mortgage document...</p>
                </div>
              ) : error ? (
                <div className="text-center py-20">
                  <div className="text-red-500 text-xl mb-4">Error</div>
                  <p className="text-white">{error}</p>
                  <button 
                    onClick={handleCloseDetails}
                    className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 cursor-pointer"
                  >
                    Try Again
                  </button>
                </div>
              ) : mortgageData ? (
                <MortgageDetails 
                  fileName={selectedFile?.name || "Your Mortgage Document"}
                  monthlyPayment={mortgageData.monthly_payment}
                  interestRate={mortgageData.interest_rate}
                  cashToClose={mortgageData.cash_to_close}
                  onClose={handleCloseDetails}
                />
              ) : (
                <div className="text-center py-20">
                  <p className="text-white">No mortgage data available</p>
                  <button 
                    onClick={handleCloseDetails}
                    className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 cursor-pointer"
                  >
                    Try Again
                  </button>
                </div>
              )}
            </div>
          )}
        </main>
      </div>
    </>
  )
}

export default App
