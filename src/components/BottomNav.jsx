import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ScanLine, FileSpreadsheet, Database } from 'lucide-react'; // Tambah ikon Database

const BottomNav = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const isActive = (path) => location.pathname === path 
    ? "text-blue-600 font-bold" 
    : "text-gray-500";

  return (
    <div className="fixed bottom-0 left-0 w-full bg-white border-t border-gray-200 h-16 flex justify-around items-center shadow-lg z-50">
      
      {/* 1. Halaman Scan */}
      <button onClick={() => navigate('/')} className={`flex flex-col items-center ${isActive('/')}`}>
        <ScanLine size={24} />
        <span className="text-xs mt-1">Scan</span>
      </button>

      {/* 2. Halaman List Export */}
      <button onClick={() => navigate('/list')} className={`flex flex-col items-center ${isActive('/list')}`}>
        <FileSpreadsheet size={24} />
        <span className="text-xs mt-1">Export</span>
      </button>

      {/* 3. Halaman Manage Data (BARU) */}
      <button onClick={() => navigate('/manage')} className={`flex flex-col items-center ${isActive('/manage')}`}>
        <Database size={24} />
        <span className="text-xs mt-1">Data</span>
      </button>

    </div>
  );
};

export default BottomNav;