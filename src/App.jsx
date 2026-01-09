import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ExportProvider } from './ExportContext';
import BottomNav from './components/BottomNav';
import ScanPage from './pages/ScanPage';
import ListPage from './pages/ListPage';
import ManagePage from './pages/ManagePage';
import SwipeWrapper from './components/SwipeWrapper';
import InstallPWA from './components/InstallPWA'; // <--- 1. Import ini

function App() {
  return (
    <ExportProvider>
      <BrowserRouter>
        <div className="min-h-screen bg-gray-100 font-sans text-gray-800 max-w-md mx-auto relative shadow-2xl">
          
          {/* 2. Pasang komponen InstallPWA di sini (Paling Atas) */}
          <InstallPWA />

          <SwipeWrapper>
            <div className="p-4 pb-24"> 
              <Routes>
                <Route path="/" element={<ScanPage />} />
                <Route path="/list" element={<ListPage />} />
                <Route path="/manage" element={<ManagePage />} />
              </Routes>
            </div>
          </SwipeWrapper>

          <BottomNav />
          
        </div>
      </BrowserRouter>
    </ExportProvider>
  );
}

export default App;