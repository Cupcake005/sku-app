import React, { useEffect, useState } from 'react';
import { Download, X } from 'lucide-react';

const InstallPWA = () => {
  const [supportsPWA, setSupportsPWA] = useState(false);
  const [promptInstall, setPromptInstall] = useState(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handler = (e) => {
      // Mencegah browser menampilkan prompt default yang membosankan
      e.preventDefault();
      setSupportsPWA(true);
      setPromptInstall(e);
      setIsVisible(true); // Tampilkan tombol kita
    };

    // Event listener untuk mendeteksi apakah bisa diinstall
    window.addEventListener("beforeinstallprompt", handler);

    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  const handleInstallClick = (evt) => {
    evt.preventDefault();
    if (!promptInstall) {
      return;
    }
    // Panggil prompt asli browser
    promptInstall.prompt();
  };

  const handleClose = () => {
      setIsVisible(false);
  }

  // Jika sudah terinstall atau browser tidak support, jangan tampilkan apa-apa
  if (!supportsPWA || !isVisible) return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-[60] p-4 bg-blue-600 text-white shadow-xl flex justify-between items-center animate-fade-in-down">
        <div className="flex items-center gap-3">
            <div className="bg-white p-2 rounded-lg">
                {/* Ganti src dengan path logo kamu yang benar */}
                <img src="/logo.png" alt="Logo" className="w-8 h-8 object-contain" />
            </div>
            <div>
                <p className="font-bold text-sm">Install Aplikasi Toko</p>
                <p className="text-xs text-blue-100">Akses lebih cepat & offline</p>
            </div>
        </div>
        
        <div className="flex items-center gap-2">
            <button
                onClick={handleInstallClick}
                className="bg-white text-blue-600 px-3 py-1.5 rounded-full font-bold text-xs shadow-md hover:bg-gray-100 transition"
            >
                Install
            </button>
            <button onClick={handleClose} className="text-blue-200 hover:text-white">
                <X size={20} />
            </button>
        </div>
    </div>
  );
};

export default InstallPWA;