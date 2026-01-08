import React, { useRef, useEffect, useState } from 'react';
import { BrowserMultiFormatReader, NotFoundException } from '@zxing/library';

const Scanner = ({ onScanResult, flashOn }) => {
  const videoRef = useRef(null);
  const [errorMsg, setErrorMsg] = useState('');
  
  // Ref untuk menyimpan instance codeReader agar bisa distop nanti
  const codeReader = useRef(new BrowserMultiFormatReader());
  
  // Ref untuk menyimpan track video agar bisa akses flash
  const videoTrackRef = useRef(null);

  useEffect(() => {
    // 1. Inisialisasi Scanner
    const startScanner = async () => {
      try {
        // Mendapatkan device ID kamera belakang (environment)
        const videoInputDevices = await codeReader.current.listVideoInputDevices();
        
        // Cari kamera belakang, kalau tidak ada pakai kamera pertama yg ditemukan
        const selectedDeviceId = videoInputDevices.find(device => 
            device.label.toLowerCase().includes('back') || 
            device.label.toLowerCase().includes('environment')
        )?.deviceId || videoInputDevices[0].deviceId;

        // Mulai Decode dari Video Device
        await codeReader.current.decodeFromVideoDevice(
          selectedDeviceId,
          videoRef.current,
          (result, err) => {
            if (result) {
              // --- BERHASIL SCAN ---
              // Mainkan suara beep kecil (opsional UX)
              // const audio = new Audio('/beep.mp3'); audio.play().catch(e=>{});
              
              onScanResult(result.getText());
            }
            if (err && !(err instanceof NotFoundException)) {
              // Error serius (bukan sekadar "tidak ada barcode di frame")
              console.warn(err);
            }
          }
        );

        // --- AMBIL TRACK UNTUK FLASH ---
        // Kita perlu menunggu sebentar sampai stream aktif di video element
        setTimeout(() => {
            if (videoRef.current && videoRef.current.srcObject) {
                const stream = videoRef.current.srcObject;
                const track = stream.getVideoTracks()[0];
                videoTrackRef.current = track;
            }
        }, 500);

      } catch (err) {
        console.error("Camera Error:", err);
        setErrorMsg("Gagal akses kamera. Pastikan izin diberikan.");
      }
    };

    startScanner();

    // Cleanup: Matikan kamera saat komponen hilang
    return () => {
      codeReader.current.reset();
    };
  }, [onScanResult]); // Dijalankan sekali saat mount

  // 2. LOGIKA FLASH
  useEffect(() => {
    const track = videoTrackRef.current;
    if (track) {
      try {
        // Cek kapabilitas flash
        const capabilities = track.getCapabilities ? track.getCapabilities() : {};
        // @ts-ignore
        if (capabilities.torch || 'torch' in track.getSettings()) {
          track.applyConstraints({
            advanced: [{ torch: flashOn }]
          }).catch(e => console.log("Flash error constraints:", e));
        }
      } catch (error) {
        console.log("Flash not supported or error:", error);
      }
    }
  }, [flashOn]);

  return (
    <div className="w-full h-full relative bg-black">
      {/* Pesan Error */}
      {errorMsg && (
        <div className="absolute inset-0 flex items-center justify-center bg-black text-white p-4 text-center z-20">
          <p>{errorMsg}</p>
        </div>
      )}

      {/* Video Element (Wajib ada ID untuk ZXing kadang-kadang, tapi ref cukup) */}
      <video
        ref={videoRef}
        className="w-full h-full object-cover"
        muted // Wajib muted agar autoplay jalan di iOS
      />

      {/* Overlay Garis Merah (UI Pemanis) */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="w-64 h-40 border-2 border-red-500 rounded-lg relative opacity-70">
            {/* Garis Scan Animasi */}
            <div className="absolute top-0 left-0 w-full h-0.5 bg-red-500 animate-scan"></div>
            
            {/* Pojokan */}
            <div className="absolute top-0 left-0 w-4 h-4 border-l-4 border-t-4 border-red-500 -ml-1 -mt-1"></div>
            <div className="absolute top-0 right-0 w-4 h-4 border-r-4 border-t-4 border-red-500 -mr-1 -mt-1"></div>
            <div className="absolute bottom-0 left-0 w-4 h-4 border-l-4 border-b-4 border-red-500 -ml-1 -mb-1"></div>
            <div className="absolute bottom-0 right-0 w-4 h-4 border-r-4 border-b-4 border-red-500 -mr-1 -mb-1"></div>
        </div>
        <p className="absolute mt-48 text-white text-xs font-semibold bg-black/50 px-2 py-1 rounded">
            Arahkan kamera ke Barcode
        </p>
      </div>

      <style>{`
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