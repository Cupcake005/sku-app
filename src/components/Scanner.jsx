import React, { useRef, useEffect, useState } from 'react';

const Scanner = ({ onScanResult, flashOn }) => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [errorMsg, setErrorMsg] = useState('');
  
  // Ref untuk menyimpan track video agar bisa akses flash nanti
  const videoTrackRef = useRef(null);

  // 1. AUTO START KAMERA SAAT KOMPONEN MUNCUL
  useEffect(() => {
    let stream = null;

    const startCamera = async () => {
      try {
        // Langsung minta akses tanpa tombol
        stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'environment' } // Kamera belakang
        });

        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          // Supaya video main di iOS/Android tanpa fullscreen otomatis
          videoRef.current.setAttribute("playsinline", true); 
          videoRef.current.play();
          
          // Simpan track untuk kontrol Flash nanti
          const track = stream.getVideoTracks()[0];
          videoTrackRef.current = track;

          // Mulai loop scanning
          requestAnimationFrame(scanFrame);
        }
      } catch (err) {
        console.error("Camera Error:", err);
        setErrorMsg("Izin kamera diperlukan untuk scan barcode.");
      }
    };

    startCamera();

    // Cleanup: Matikan kamera saat pindah halaman / komponen hilang
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, []); // Array kosong = jalan sekali saat mount

  // 2. KONTROL FLASH (Dipicu oleh props dari ScanPage)
  useEffect(() => {
    const track = videoTrackRef.current;
    if (track) {
      const capabilities = track.getCapabilities ? track.getCapabilities() : {};
      
      // Cek apakah HP support flash (torch)
      // @ts-ignore
      if (capabilities.torch || 'torch' in track.getSettings()) {
        track.applyConstraints({
          advanced: [{ torch: flashOn }]
        }).catch(e => console.log("Flash error:", e));
      }
    }
  }, [flashOn]); // Jalan setiap kali tombol flash di ScanPage ditekan

  // 3. LOGIKA SCANNING
  const scanFrame = () => {
    if (videoRef.current && videoRef.current.readyState === videoRef.current.HAVE_ENOUGH_DATA) {
      // Disini logika baca barcode. 
      // Jika kamu pakai library eksternal (misal: jsQR atau zxing), panggil disini.
      
      // CONTOH LOGIKA SIMULASI (Ganti ini dengan library scan aslimu):
      // const canvas = canvasRef.current;
      // const ctx = canvas.getContext('2d');
      // canvas.height = videoRef.current.videoHeight;
      // canvas.width = videoRef.current.videoWidth;
      // ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
      // const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      // const code = jsQR(imageData.data, imageData.width, imageData.height);
      // if (code) { onScanResult(code.data); return; } // Stop loop jika ketemu
    }
    
    // Loop terus menerus
    requestAnimationFrame(scanFrame);
  };

  return (
    <div className="w-full h-full relative">
      {/* Pesan Error jika izin ditolak */}
      {errorMsg && (
        <div className="absolute inset-0 flex items-center justify-center bg-black text-white p-4 text-center z-20">
          <p>{errorMsg}</p>
        </div>
      )}

      {/* Element Video */}
      <video
        ref={videoRef}
        className="w-full h-full object-cover"
        muted
      />
      
      {/* Canvas tersembunyi untuk pemrosesan gambar */}
      <canvas ref={canvasRef} className="hidden" />

      {/* Overlay Kotak Fokus (Hanya Pemanis UI) */}
      <div className="absolute inset-0 border-2 border-red-500 opacity-50 pointer-events-none m-12 rounded-lg">
         <div className="absolute top-0 left-0 w-4 h-4 border-l-4 border-t-4 border-red-500 -ml-1 -mt-1"></div>
         <div className="absolute top-0 right-0 w-4 h-4 border-r-4 border-t-4 border-red-500 -mr-1 -mt-1"></div>
         <div className="absolute bottom-0 left-0 w-4 h-4 border-l-4 border-b-4 border-red-500 -ml-1 -mb-1"></div>
         <div className="absolute bottom-0 right-0 w-4 h-4 border-r-4 border-b-4 border-red-500 -mr-1 -mb-1"></div>
      </div>
    </div>
  );
};

export default Scanner;