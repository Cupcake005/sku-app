// import React from 'react';
// import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
// import { AuthProvider, useAuth } from './AuthProvider';
// import { ExportProvider } from './ExportContext';
// import BottomNav from './components/BottomNav';
// import ScanPage from './pages/ScanPage';
// import ListPage from './pages/ListPage';
// import ManagePage from './pages/ManagePage';
// import SwipeWrapper from './components/SwipeWrapper';
// import InstallPWA from './components/InstallPWA';
// import LoginPage from './pages/LoginPage';
// import TopHeader from './components/TopHeader'; 
// import UpdatePassword from './pages/UpdatePassword'; 

// // --- SATPAM (PROTEKSI) ---
// const ProtectedRoute = ({ children }) => {
//   const { user, loading } = useAuth();
  
//   if (loading) {
//     return <div className="flex h-screen items-center justify-center text-blue-600 font-bold">Memuat Data User...</div>;
//   }
  
//   if (!user) {
//     return <Navigate to="/login" replace />;
//   }

//   return children;
// };

// // --- LAYOUT APLIKASI UTAMA ---
// const AppLayout = () => {
//   return (
//     <div className="min-h-screen bg-gray-100 font-sans text-gray-800 max-w-md mx-auto relative shadow-2xl flex flex-col">
//       <InstallPWA />
//       <TopHeader />
//       <SwipeWrapper>
//         <div className="p-4 pb-24 flex-1"> 
//           <Routes>
//             <Route path="/" element={<ScanPage />} />
//             <Route path="/list" element={<ListPage />} />
//             <Route path="/manage" element={<ManagePage />} />
//           </Routes>
//         </div>
//       </SwipeWrapper>
//       <BottomNav />
//     </div>
//   );
// };

// function App() {
//   return (
//     // PERBAIKAN: BrowserRouter harus paling luar!
//     <BrowserRouter> 
//       <AuthProvider>
//         <ExportProvider>
          
//             <Routes>
//               {/* Halaman Login */}
//               <Route path="/login" element={<LoginPage />} />

//               {/* Halaman Update Password */}
//               <Route path="/update-password" element={<UpdatePassword />} /> 

//               {/* Halaman Aplikasi */}
//               <Route 
//                 path="/*" 
//                 element={
//                   <ProtectedRoute>
//                     <AppLayout />
//                   </ProtectedRoute>
//                 } 
//               />
//             </Routes>
          
//         </ExportProvider>
//       </AuthProvider>
//     </BrowserRouter>
//   );
// }

// export default App;


//=======================================================================================

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
import TopHeader from './components/TopHeader'; 
import UpdatePassword from './pages/UpdatePassword'; 

// 1. IMPORT KOMPONEN OFFLINE
import OfflineStatus from './components/OfflineStatus';

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
      <InstallPWA />
      <TopHeader />
      <SwipeWrapper>
        <div className="p-4 pb-24 flex-1"> 
          <Routes>
            <Route path="/" element={<ScanPage />} />
            <Route path="/list" element={<ListPage />} />
            <Route path="/manage" element={<ManagePage />} />
          </Routes>
        </div>
      </SwipeWrapper>
      <BottomNav />
    </div>
  );
};

function App() {
  return (
    <BrowserRouter> 
      <AuthProvider>
        <ExportProvider>
          
          {/* 2. PASANG DI SINI (Agar muncul di SEMUA halaman termasuk Login) */}
          <OfflineStatus />

          <Routes>
            {/* Halaman Login */}
            <Route path="/login" element={<LoginPage />} />

            {/* Halaman Update Password */}
            <Route path="/update-password" element={<UpdatePassword />} /> 

            {/* Halaman Aplikasi (Protected) */}
            <Route 
              path="/*" 
              element={
                <ProtectedRoute>
                  <AppLayout />
                </ProtectedRoute>
              } 
            />
          </Routes>
          
        </ExportProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;