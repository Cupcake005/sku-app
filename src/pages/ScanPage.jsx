import React, { useEffect, useRef, useState } from 'react';
import { Html5Qrcode, Html5QrcodeSupportedFormats } from 'html5-qrcode';

const Scanner = ({ onScanResult, flashOn }) => {
  const scannerRef = useRef(null);
  const [isScanning, setIsScanning] = useState(false);
  
  // ID unik untuk elemen div container scanner
  const qrcodeRegionId = "html5qr-code-full-region";

  useEffect(() => {
    // 1. Inisialisasi Instance
    // Verbose false agar console tidak penuh log
    const html5QrCode = new Html5Qrcode(qrcodeRegionId, { verbose: false });
    scannerRef.current = html5QrCode;

    const startScanner = async () => {
      try {
        // Konfigurasi Scanner
        const config = {
          fps: 10,
          qrbox: { width: 250, height: 250 },
          aspectRatio: 1.0,
          // Mendukung berbagai format barcode (1D dan 2D)
          formatsToSupport: [
            Html5QrcodeSupportedFormats.QR_CODE,
            Html5QrcodeSupportedFormats.EAN_13,
            Html5QrcodeSupportedFormats.EAN_8,
            Html5QrcodeSupportedFormats.CODE_128,
            Html5QrcodeSupportedFormats.CODE_39,
            Html5QrcodeSupportedFormats.UPC_A,
            Html5QrcodeSupportedFormats.UPC_E,
          ]
        };

        // Mulai Scanner (Kamera Belakang)
        await html5QrCode.start(
          { facingMode: "environment" }, 
          config,
          (decodedText, decodedResult) => {
            // Sukses Scan
            onScanResult(decodedText);
          },
          (errorMessage) => {
            // Scan gagal (frame kosong/blur), abaikan saja agar tidak spam log
          }
        );

        setIsScanning(true);

      } catch (err) {
        console.error("Gagal memulai scanner", err);
      }
    };

    startScanner();

    // Cleanup saat unmount
    return () => {
      if (html5QrCode.isScanning) {
        html5QrCode.stop().then(() => {
            html5QrCode.clear();
        }).catch(err => console.error("Error stop scanner", err));
      }
    };
  }, []); // Run sekali saat mount

  // 2. LOGIKA FLASH (TORCH)
  useEffect(() => {
    const applyFlash = async () => {
      if (scannerRef.current && isScanning) {
        try {
            // html5-qrcode memiliki state internal
            // State 2 = SCANNING, State 3 = PAUSED
            const state = scannerRef.current.getState();
            if (state === 2 || state === 3) {
                await scannerRef.current.applyVideoConstraints({
                    advanced: [{ torch: flashOn }]
                });
            }
        } catch (err) {
          console.warn("Flash tidak didukung atau error:", err);
        }
      }
    };

    applyFlash();
  }, [flashOn, isScanning]);

  return (
    <div className="w-full h-full relative bg-black overflow-hidden">
      
      {/* Container untuk html5-qrcode */}
      {/* Library ini akan merender elemen <video> di dalam div ini */}
      <div id={qrcodeRegionId} className="w-full h-full object-cover" />

      {/* --- UI OVERLAY (TETAP SAMA) --- */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
        <div className="w-64 h-40 border-2 border-red-500 rounded-lg relative opacity-70">
            {/* Garis Scan Animasi */}
            <div className="absolute top-0 left-0 w-full h-0.5 bg-red-500 animate-scan"></div>
            
            {/* Hiasan Pojok */}
            <div className="absolute top-0 left-0 w-4 h-4 border-l-4 border-t-4 border-red-500 -ml-1 -mt-1"></div>
            <div className="absolute top-0 right-0 w-4 h-4 border-r-4 border-t-4 border-red-500 -mr-1 -mt-1"></div>
            <div className="absolute bottom-0 left-0 w-4 h-4 border-l-4 border-b-4 border-red-500 -ml-1 -mb-1"></div>
            <div className="absolute bottom-0 right-0 w-4 h-4 border-r-4 border-b-4 border-red-500 -mr-1 -mb-1"></div>
        </div>
        <p className="absolute mt-48 text-white text-xs font-semibold bg-black/50 px-2 py-1 rounded">
            Arahkan kamera ke Barcode
        </p>
      </div>

      {/* CSS untuk mematikan beberapa elemen bawaan html5-qrcode yang mungkin mengganggu */}
      <style>{`
        #html5qr-code-full-region video {
            object-fit: cover !important;
            width: 100% !important;
            height: 100% !important;
            border-radius: 0.5rem; /* sesuaikan dengan styling parent */
        }
        @keyframes scan {
            0% { top: 0; opacity: 0; }
            10% { opacity: 1; }
            90% { opacity: 1; }
            100% { top: 100%; opacity: 0; }
        }
        .animate-scan {
            animation: scan 2s infinite linear;
            box-shadow: 0 0 4px red;
        }
      `}</style>
    </div>
  );
};

export default Scanner;