import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ExportProvider } from './ExportContext';
import BottomNav from './components/BottomNav';
import ScanPage from './pages/ScanPage';
import ListPage from './pages/ListPage';
import ManagePage from './pages/ManagePage'; // <--- Import Halaman Baru

function App() {
  return (
    <ExportProvider>
      <BrowserRouter>
        <div className="min-h-screen bg-gray-100 p-4 font-sans text-gray-800 max-w-md mx-auto relative">
          
          <div className="text-center mb-4">
            <h1 className="text-2xl font-bold text-blue-600">SKU MANAJAMEN</h1>
          </div>

          <Routes>
            <Route path="/" element={<ScanPage />} />
            <Route path="/list" element={<ListPage />} />
            <Route path="/manage" element={<ManagePage />} /> {/* <--- Tambah Route Baru */}
          </Routes>

          <BottomNav />
          
        </div>
      </BrowserRouter>
    </ExportProvider>
  );
}

export default App;