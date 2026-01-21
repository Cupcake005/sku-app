import React, { useState, useEffect } from 'react';
import { WifiOff, AlertTriangle } from 'lucide-react';

const OfflineStatus = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    // Fungsi untuk update status
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    // Pasang 'telinga' (event listener) untuk mendengar perubahan jaringan
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Bersihkan saat komponen tidak dipakai (cleanup)
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Jika online, jangan tampilkan apa-apa (return null)
  if (isOnline) return null;

  return (
    <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-[100] w-[90%] max-w-sm animate-bounce-slight">
      <div className="bg-red-600 text-white px-4 py-3 rounded-xl shadow-2xl flex items-center justify-between border-2 border-red-400">
        <div className="flex items-center gap-3">
            <div className="bg-white/20 p-2 rounded-full">
                <WifiOff size={24} className="text-white" />
            </div>
            <div>
                <h4 className="font-bold text-sm">Anda Sedang Offline</h4>
                <p className="text-xs text-red-100">Periksa koneksi internet Anda.</p>
            </div>
        </div>
        <AlertTriangle size={20} className="text-red-200 opacity-50" />
      </div>
    </div>
  );
};

export default OfflineStatus;