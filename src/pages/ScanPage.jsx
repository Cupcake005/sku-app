import React, { useState } from 'react';
import { supabase } from '../supabaseClient'; // Pastikan path benar
import Scanner from '../components/Scanner';
import AddProductModal from '../components/AddProductModal'; // Import Modal yang sudah dibuat
import { ScanLine } from 'lucide-react';

const ScanPage = () => {
  // State Scanner
  const [flashOn, setFlashOn] = useState(false);
  const [lastScan, setLastScan] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false); // Agar tidak scan double saat loading DB

  // State Modal
  const [showAddModal, setShowAddModal] = useState(false);
  const [pendingSku, setPendingSku] = useState('');

  // --- LOGIKA UTAMA: CEK KE DATABASE SAAT SCAN ---
  const handleScan = async (scannedSku) => {
    // 1. Validasi dasar: cegah scan berulang cepat atau saat modal terbuka
    if (scannedSku === lastScan || isProcessing || showAddModal) return;
    
    setLastScan(scannedSku);
    setIsProcessing(true);

    try {
      // 2. Cek langsung ke Supabase (Real-time check)
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('sku', scannedSku)
        .maybeSingle(); // Mengambil satu data atau null jika tidak ada

      if (error) {
        console.error("Error cek database:", error);
        alert("Terjadi kesalahan koneksi database.");
        setIsProcessing(false);
        return;
      }

      if (data) {
        // SKENARIO A: PRODUK SUDAH ADA
        playBeep(true); // Opsional: Bunyi sukses
        alert(`✅ PRODUK DITEMUKAN!\n\nNama: ${data.item_name}\nHarga: Rp ${data.price.toLocaleString()}\nStok/Varian: ${data.variant_name}`);
        
        // Jeda sebentar sebelum bisa scan lagi
        setTimeout(() => {
            setLastScan(null);
            setIsProcessing(false);
        }, 2000);

      } else {
        // SKENARIO B: PRODUK BELUM ADA -> BUKA MODAL DI SINI
        playBeep(false); // Opsional: Bunyi warning
        
        // Simpan SKU yang barusan discan
        setPendingSku(scannedSku);
        
        // Buka Modal
        setShowAddModal(true);
        setIsProcessing(false); 
      }

    } catch (err) {
      console.error(err);
      setIsProcessing(false);
    }
  };

  // --- FUNGSI SETELAH SUKSES TAMBAH DATA ---
  const handleSuccessAdd = () => {
    // Data berhasil ditambah via Modal.
    // Kita reset lastScan agar user bisa langsung scan ulang produk yg barusan ditambah untuk memastikan.
    setLastScan(null); 
    setIsProcessing(false);
  };

  // --- FUNGSI SETELAH TUTUP MODAL (BATAL) ---
  const handleCloseModal = () => {
    setShowAddModal(false);
    setPendingSku('');
    // Beri jeda sedikit sebelum scanner aktif lagi
    setTimeout(() => {
        setLastScan(null);
        setIsProcessing(false);
    }, 1000);
  };

  // (Opsional) Efek Suara
  const playBeep = (isSuccess) => {
    // Anda bisa menambahkan file audio beep.mp3 di folder public
    // const audio = new Audio(isSuccess ? '/beep-success.mp3' : '/beep-warning.mp3');
    // audio.play().catch(e => console.log(e));
  };

  return (
    <div className="flex flex-col h-[85vh] relative">
      
      {/* Header Kecil */}
      <div className="flex justify-between items-center mb-4 bg-white p-3 rounded shadow-sm z-10">
        <h2 className="font-bold text-gray-700 flex items-center gap-2">
            <ScanLine className="text-blue-600"/> Scan Produk
        </h2>
        <button
          onClick={() => setFlashOn(!flashOn)}
          className={`px-3 py-1 rounded text-sm font-bold transition-colors ${
            flashOn ? 'bg-yellow-400 text-black' : 'bg-gray-200 text-gray-600'
          }`}
        >
          {flashOn ? 'Flash ON ⚡' : 'Flash OFF'}
        </button>
      </div>

      {/* Area Kamera */}
      <div className="flex-1 bg-black rounded-lg overflow-hidden shadow-md relative z-0">
        <Scanner onScanResult={handleScan} flashOn={flashOn} />
        
        {/* Indikator Loading saat Cek DB */}
        {isProcessing && !showAddModal && (
            <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center z-20">
                <div className="text-white font-bold animate-pulse">Memeriksa Database...</div>
            </div>
        )}
      </div>

      <p className="text-center text-xs text-gray-500 mt-3">
        Arahkan kamera ke barcode. Jika produk belum ada, form tambah akan otomatis muncul.
      </p>

      {/* --- MODAL ADD PRODUCT (Muncul Pop-up di atas Scanner) --- */}
      <AddProductModal 
        isOpen={showAddModal} 
        onClose={handleCloseModal} 
        initialSku={pendingSku} 
        onSuccess={handleSuccessAdd} 
      />

    </div>
  );
};

export default ScanPage;