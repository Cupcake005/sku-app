import React, { useState } from 'react';
import { supabase } from '../supabaseClient';
import Scanner from '../components/Scanner';
import AddProductModal from '../components/AddProductModal';
import { ScanLine, Search, ArrowRight } from 'lucide-react'; // Tambah icon Search

const ScanPage = () => {
  // State Scanner & UI
  const [flashOn, setFlashOn] = useState(false);
  const [lastScan, setLastScan] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  
  // State Manual Search
  const [manualInput, setManualInput] = useState('');

  // State Modal
  const [showAddModal, setShowAddModal] = useState(false);
  const [pendingSku, setPendingSku] = useState('');

  // --- FUNGSI PROSES PENCARIAN (Dipakai oleh Scanner & Manual Input) ---
  const processResult = async (queryValue, isManual = false) => {
    // Validasi
    if (!queryValue) return;
    if ((queryValue === lastScan && !isManual) || isProcessing || showAddModal) return;

    if (!isManual) setLastScan(queryValue); // Set lastScan hanya jika dari kamera
    setIsProcessing(true);

    try {
      // 1. Coba Cari Berdasarkan SKU (Exact Match)
      let { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('sku', queryValue)
        .maybeSingle();

      // 2. Jika tidak ketemu di SKU, dan ini Input Manual, coba cari di Nama (Partial Match)
      if (!data && isManual) {
        const { data: dataByName } = await supabase
            .from('products')
            .select('*')
            .ilike('item_name', `%${queryValue}%`)
            .limit(1); // Ambil 1 aja dulu untuk cek
        
        if (dataByName && dataByName.length > 0) {
            data = dataByName[0];
        }
      }

      if (data) {
        // --- A. PRODUK DITEMUKAN ---
        alert(`✅ PRODUK DITEMUKAN!\n\nNama: ${data.item_name}\nSKU: ${data.sku}\nHarga: Rp ${data.price.toLocaleString()}\nLokasi: ${data.category}`);
        
        // Reset
        setTimeout(() => {
            setLastScan(null);
            setIsProcessing(false);
            if(isManual) setManualInput(''); // Kosongkan input jika sukses
        }, 1000);

      } else {
        // --- B. PRODUK TIDAK DITEMUKAN ---
        
        // Cek apakah inputnya berupa ANGKA (seperti SKU)?
        const isNumeric = /^\d+$/.test(queryValue);

        if (isNumeric) {
             // Jika Angka -> Asumsikan ini SKU baru yang mau ditambah
             const confirmAdd = window.confirm(`⚠️ Data "${queryValue}" tidak ditemukan.\nApakah Anda ingin menambah produk baru dengan SKU ini?`);
             
             if (confirmAdd) {
                setPendingSku(queryValue);
                setShowAddModal(true);
             }
        } else {
             // Jika Text (Nama) -> Beritahu tidak ketemu
             alert(`❌ Produk dengan kata kunci "${queryValue}" tidak ditemukan.`);
        }
        
        setIsProcessing(false);
        setLastScan(null);
      }

    } catch (err) {
      console.error(err);
      alert("Terjadi kesalahan koneksi.");
      setIsProcessing(false);
    }
  };

  // Handler Submit Manual Form
  const handleManualSubmit = (e) => {
    e.preventDefault();
    processResult(manualInput, true); // true = isManual
  };

  // Handler Sukses Tambah Data
  const handleSuccessAdd = () => {
    setLastScan(null);
    setManualInput('');
    setIsProcessing(false);
  };

  // Handler Tutup Modal
  const handleCloseModal = () => {
    setShowAddModal(false);
    setPendingSku('');
    setLastScan(null);
    setIsProcessing(false);
  };

  return (
    <div className="flex flex-col h-[85vh] relative">
      
      {/* --- HEADER --- */}
      <div className="bg-white p-3 rounded shadow-sm z-10 mb-3">
        <div className="flex justify-between items-center mb-3">
            <h2 className="font-bold text-gray-700 flex items-center gap-2">
                <ScanLine className="text-blue-600"/> Scan / Cari
            </h2>
            <button
            onClick={() => setFlashOn(!flashOn)}
            className={`px-3 py-1 rounded text-sm font-bold transition-colors ${
                flashOn ? 'bg-yellow-400 text-black' : 'bg-gray-200 text-gray-600'
            }`}
            >
            {flashOn ? 'Flash ⚡' : 'Flash 🌑'}
            </button>
        </div>

        {/* --- KOLOM PENCARIAN MANUAL (BARU) --- */}
        <form onSubmit={handleManualSubmit} className="relative flex w-full">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search size={18} className="text-gray-400" />
            </div>
            <input 
                type="text" 
                value={manualInput}
                onChange={(e) => setManualInput(e.target.value)}
                placeholder="Ketik SKU atau Nama Barang..."
                className="w-full pl-10 pr-12 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm"
            />
            <button 
                type="submit"
                disabled={!manualInput || isProcessing}
                className="absolute right-1 top-1 bottom-1 bg-blue-600 text-white px-3 rounded-md hover:bg-blue-700 disabled:bg-gray-300 flex items-center"
            >
                <ArrowRight size={16} />
            </button>
        </form>
      </div>

      {/* --- AREA KAMERA --- */}
      <div className="flex-1 bg-black rounded-lg overflow-hidden shadow-md relative z-0">
        <Scanner onScanResult={(sku) => processResult(sku, false)} flashOn={flashOn} />
        
        {/* Overlay Loading */}
        {isProcessing && !showAddModal && (
            <div className="absolute inset-0 bg-black bg-opacity-60 flex items-center justify-center z-20">
                <div className="text-white font-bold animate-pulse flex flex-col items-center">
                    <Search className="mb-2 animate-bounce" />
                    Mencari di Database...
                </div>
            </div>
        )}
      </div>

      <p className="text-center text-xs text-gray-500 mt-3">
        Scan barcode atau ketik manual di atas.
      </p>

      {/* --- MODAL ADD PRODUCT --- */}
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