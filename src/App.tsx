import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import PDFUploader from './components/PDFUploader'

function App() {

  return (
    <>
      
      <div className="mt-8">
        <h2 className="text-xl font-bold mb-4">PDF Storage with Supabase</h2>
        <PDFUploader />
      </div>
      
    </>
  )
}

export default App
