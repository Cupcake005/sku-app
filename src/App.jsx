import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './AuthProvider';
import { ExportProvider } from './ExportContext';
import BottomNav from './components/BottomNav';
import ScanPage from './pages/ScanPage';
import ListPage from './pages/ListPage';
import ManagePage from './pages/ManagePage';
import SwipeWrapper from './components/SwipeWrapper';
import InstallPWA from './components/InstallPWA';
import LoginPage from './pages/LoginPage';
import TopHeader from './components/TopHeader'; // Import Header

// --- SATPAM (PROTEKSI) ---
const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  
  if (loading) {
    return <div className="flex h-screen items-center justify-center text-blue-600 font-bold">Memuat Data User...</div>;
  }
  
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

// --- LAYOUT APLIKASI UTAMA ---
const AppLayout = () => {
  return (
    <div className="min-h-screen bg-gray-100 font-sans text-gray-800 max-w-md mx-auto relative shadow-2xl flex flex-col">
      {/* 1. Install PWA */}
      <InstallPWA />

      {/* 2. Top Header (Nama & Logout) */}
      <TopHeader />

      {/* 3. Area Konten (Bisa Swipe) */}
      <SwipeWrapper>
        <div className="p-4 pb-24 flex-1"> 
          <Routes>
            <Route path="/" element={<ScanPage />} />
            <Route path="/list" element={<ListPage />} />
            <Route path="/manage" element={<ManagePage />} />
          </Routes>
        </div>
      </SwipeWrapper>

      {/* 4. Menu Bawah */}
      <BottomNav />
    </div>
  );
};

function App() {
  return (
    <AuthProvider>
      <ExportProvider>
        <BrowserRouter>
          <Routes>
            {/* Halaman Login (Tanpa Layout Aplikasi) */}
            <Route path="/login" element={<LoginPage />} />

            {/* Halaman Aplikasi (Semua halaman dalam) */}
            <Route 
              path="/*" 
              element={
                <ProtectedRoute>
                  <AppLayout />
                </ProtectedRoute>
              } 
            />
          </Routes>
        </BrowserRouter>
      </ExportProvider>
    </AuthProvider>
  );
}

export default App;