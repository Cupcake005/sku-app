import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import Scanner from '../components/Scanner'; 
import { useExportList } from '../ExportContext';
import { Search, Plus, X, Trash2, ShoppingCart, AlertCircle } from 'lucide-react';

// Audio Beep (Base64 pendek agar tidak perlu file mp3 terpisah)
const beepSound = new Audio("data:audio/wav;base64,UklGRl9vT19XQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YU");

const ScanPage = () => {
  const { exportList, addToExportList, removeFromExportList } = useExportList();
  
  const [mode, setMode] = useState('scan'); // Hanya: 'scan' atau 'result' (form dihapus)
  const [loading, setLoading] = useState(false);
  const [productData, setProductData] = useState(null);

  // Search State
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);

  // --- FUNGSI BANTUAN: MAINKAN SUARA BEEP ---
  const playBeep = () => {
    beepSound.play().catch(e => console.log("Audio play blocked", e));
  };

  // --- LOGIKA UTAMA: TAMBAH ITEM KE LIST ---
  const handleAddItem = (product) => {
    const isDuplicate = exportList.some((item) => item.sku === product.sku);

    if (isDuplicate) {
      alert(`⚠️ Produk "${product.item_name}" SUDAH ADA di dalam list!`);
      return; 
    }

    addToExportList(product);
    setMode('scan'); 
    clearSearch();
  };

  // --- LOGIKA SCANNER ---
  const handleScan = async (sku) => {
    // Mainkan suara BEEP saat scan berhasil terdeteksi
    playBeep();

    setLoading(true);
    clearSearch(); 
    
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('sku', sku)
        .single();

      if (data) {
        setProductData(data);
        setMode('result'); 
      } else {
        // PERUBAHAN: Tidak lagi masuk ke Form, tapi Alert
        alert(`❌ Produk dengan SKU ${sku} TIDAK DITEMUKAN.\nSilakan input data di menu "Manajemen Database".`);
        setMode('scan');
      }
    } catch (error) {
      console.error(error);
      setMode('scan');
    } finally {
      setLoading(false);
    }
  };

  // --- FUNGSI SEARCH ---
  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    
    setLoading(true);
    setIsSearching(true);
    
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .or(`sku.ilike.%${searchQuery}%,item_name.ilike.%${searchQuery}%`)
        .limit(20);

      if (error) throw error;
      setSearchResults(data || []);
    } catch (error) {
      alert('Error searching: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const clearSearch = () => {
    setSearchQuery('');
    setSearchResults([]);
    setIsSearching(false);
  };

  return (
    <div className="pb-24 max-w-md mx-auto"> 
      <div className="bg-white p-4 rounded-lg shadow-md mb-4 sticky top-0 z-10">
        
        <h2 className="text-xl font-bold text-center mb-4 text-blue-600">Scan & Cari Stok</h2>
        
        <form onSubmit={handleSearch} className="relative mb-2">
          <input 
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari Nama Barang / SKU..."
            className="w-full pl-10 pr-4 py-3 border rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 outline-none"
          />
          <Search className="absolute left-3 top-3.5 text-gray-400" size={20} />
          {searchQuery && (
            <button type="button" onClick={clearSearch} className="absolute right-3 top-3.5 text-gray-400">
              <X size={20} />
            </button>
          )}
        </form>
      </div>

      <div className="px-4">
        {/* --- TAMPILAN 1: HASIL PENCARIAN --- */}
        {isSearching ? (
          <div>
            <div className="flex justify-between items-center mb-2">
              <h3 className="font-bold text-gray-700">Hasil Pencarian ({searchResults.length})</h3>
              <button onClick={clearSearch} className="text-sm text-red-500 underline">Tutup</button>
            </div>

            {loading && <p className="text-center py-4">Mencari...</p>}

            {searchResults.length === 0 && !loading ? (
               <div className="text-center py-8 text-gray-500 flex flex-col items-center">
                 <AlertCircle size={40} className="mb-2 text-gray-300"/>
                 <p>Produk tidak ditemukan.</p>
                 <small>Cek ejaan atau input di Menu Database.</small>
               </div>
            ) : (
              <div className="space-y-3">
                {searchResults.map((item) => (
                  <div key={item.id} className="border p-3 rounded-lg shadow-sm flex justify-between items-center bg-white">
                    <div className="flex-1">
                      <div className="font-bold text-gray-800">{item.item_name}</div>
                      <div className="text-xs text-gray-500">SKU: {item.sku}</div>
                      <div className="text-sm font-bold text-blue-600">Rp {item.price.toLocaleString()}</div>
                    </div>
                    <button 
                      onClick={() => handleAddItem(item)}
                      className="ml-3 bg-orange-500 hover:bg-orange-600 text-white p-2 rounded-full shadow-md"
                    >
                      <Plus size={20} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : (
          /* --- TAMPILAN 2: SCANNER & RESULT --- */
          <>
            {mode === 'scan' && (
              <>
                <Scanner onScanResult={handleScan} />
                <div className="text-center mt-4 text-sm text-gray-400">- Arahkan kamera ke Barcode -</div>
                
                {/* Tombol Input Manual SUDAH DIHAPUS sesuai request */}
              </>
            )}

            {mode === 'result' && productData && (
              <div className="text-center bg-white p-6 rounded-lg shadow-lg animate-fade-in">
                <div className="bg-green-100 text-green-800 p-2 rounded mb-4 inline-block font-bold">✓ Ditemukan</div>
                <h2 className="text-2xl font-bold">{productData.item_name}</h2>
                <p className="text-gray-600 mb-2">{productData.sku}</p>
                <p className="text-3xl font-bold text-blue-600 mb-6">Rp {productData.price.toLocaleString()}</p>

                <button 
                  onClick={() => handleAddItem(productData)}
                  className="w-full bg-orange-500 text-white font-bold py-4 rounded-lg shadow-lg hover:bg-orange-600 mb-3 flex justify-center items-center gap-2"
                >
                  <Plus size={24} /> Masukkan ke List
                </button>

                <button onClick={() => setMode('scan')} className="w-full bg-gray-200 py-3 rounded-lg">Scan Lagi</button>
              </div>
            )}
          </>
        )}

        {/* --- LIST BARANG (PERSISTENT) --- */}
        {!isSearching && mode === 'scan' && (
           <div className="mt-8">
             <div className="flex items-center gap-2 mb-3 border-b pb-2">
               <ShoppingCart size={20} className="text-blue-600" />
               <h3 className="font-bold text-lg text-gray-800">List Barang ({exportList.length})</h3>
             </div>
             
             {exportList.length === 0 ? (
               <p className="text-gray-400 text-center text-sm py-4">Belum ada barang di list.</p>
             ) : (
               <div className="space-y-2">
                 {exportList.map((item, index) => (
                   <div key={`${item.sku}-${index}`} className="flex justify-between items-center bg-white p-3 rounded-lg shadow-sm border-l-4 border-blue-500">
                     <div>
                       <div className="font-medium text-gray-800">{item.item_name}</div>
                       <div className="text-xs text-gray-500">Rp {item.price.toLocaleString()}</div>
                     </div>
                     <button 
                       onClick={() => removeFromExportList(item.sku)} 
                       className="text-red-500 p-2 hover:bg-red-50 rounded"
                     >
                       <Trash2 size={18} />
                     </button>
                   </div>
                 ))}
               </div>
             )}
           </div>
        )}
      </div>
    </div>
  );
};

export default ScanPage;