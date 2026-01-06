import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ExportProvider } from './ExportContext';
import BottomNav from './components/BottomNav';
import ScanPage from './pages/ScanPage';
import ListPage from './pages/ListPage';

function App() {
  return (
    <ExportProvider> {/* Bungkus aplikasi dengan Context */}
      <BrowserRouter>
        <div className="min-h-screen bg-gray-100 p-4 font-sans text-gray-800 max-w-md mx-auto relative">
          
          {/* Header Aplikasi */}
          <div className="text-center mb-4">
            <h1 className="text-2xl font-bold text-blue-600">Toko Acan 📦</h1>
          </div>

          {/* Area Konten Berubah-ubah */}
          <Routes>
            <Route path="/" element={<ScanPage />} />
            <Route path="/list" element={<ListPage />} />
          </Routes>

          {/* Menu Navigasi Bawah */}
          <BottomNav />
          
        </div>
      </BrowserRouter>
    </ExportProvider>
  );
}

export default App;