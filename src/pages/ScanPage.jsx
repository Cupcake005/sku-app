import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import Scanner from '../components/Scanner'; 
import ProductModal from '../components/ProductModal'; // Import Modal
import { useExportList } from '../ExportContext';
import { useNavigate } from 'react-router-dom';
import { Search, Plus, X, Camera, CameraOff, Zap, ZapOff, ArrowRight } from 'lucide-react';

const beepSound = new Audio("data:audio/wav;base64,UklGRl9vT19XQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YU");

const ScanPage = () => {
  const { exportList, addToExportList } = useExportList();
  const navigate = useNavigate();
  
  // --- STATE UI & LOGIC ---
  const [mode, setMode] = useState('scan'); // 'scan' | 'result'
  const [loading, setLoading] = useState(false);
  const [productData, setProductData] = useState(null);

  // --- STATE KAMERA DENGAN LOCAL STORAGE (INIT LAZY) ---
  const [isCameraActive, setIsCameraActive] = useState(() => {
    const savedState = localStorage.getItem('camera_active');
    return savedState === 'false' ? false : true;
  });

  const [isFlashOn, setIsFlashOn] = useState(false);

  // --- EFFECT: SIMPAN STATUS KAMERA KE STORAGE ---
  useEffect(() => {
    localStorage.setItem('camera_active', isCameraActive);
  }, [isCameraActive]);

  // --- STATE PENCARIAN ---
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);

  // --- STATE MODAL TAMBAH PRODUK ---
  const [showAddModal, setShowAddModal] = useState(false);
  const [pendingSku, setPendingSku] = useState('');

  const playBeep = () => { beepSound.play().catch(e => console.log(e)); };

  // --- FUNGSI TAMBAH KE LIST EXPORT ---
  const handleAddItem = (product) => {
    const isDuplicate = exportList.some((item) => item.sku === product.sku);
    if (isDuplicate) {
      alert(`⚠️ Produk "${product.item_name}" SUDAH ADA di list!`);
      return; 
    }
    addToExportList(product);
    setMode('scan'); 
    clearSearch();
  };

  // --- LOGIKA SCAN UTAMA ---
  const handleScan = async (sku) => {
    playBeep();
    setLoading(true);
    clearSearch(); 
    try {
      // Cek ke Database
      const { data } = await supabase.from('products').select('*').eq('sku', sku).single();
      
      if (data) { 
        // SKENARIO A: PRODUK ADA
        setProductData(data); 
        setMode('result'); 
      } else { 
        // SKENARIO B: PRODUK TIDAK ADA -> BUKA MODAL
        setPendingSku(sku); // Simpan SKU yang barusan discan
        setShowAddModal(true); // Buka Modal
      }
    } catch (error) { 
      console.error(error); 
      setMode('scan'); 
    } finally { 
      setLoading(false); 
    }
  };

  // --- LOGIKA SIMPAN PRODUK BARU DARI MODAL ---
  const handleSaveNewProduct = async (formData) => {
    setLoading(true);
    // Insert ke Supabase
    const { data, error } = await supabase
        .from('products')
        .insert([{
            sku: formData.sku || '-',
            item_name: formData.item_name,
            category: formData.category,
            brand_name: formData.brand_name || '-',
            variant_name: formData.variant_name,
            price: parseFloat(formData.price) || 0
        }])
        .select()
        .single();

    setLoading(false);

    if (error) {
        alert('Gagal menyimpan: ' + error.message);
    } else {
        alert('✅ Produk berhasil ditambahkan!');
        setShowAddModal(false); 
        
        // Langsung tampilkan di mode Result agar user bisa "Masukkan ke List"
        setProductData(data);
        setMode('result');
    }
  };
  
  // --- LOGIKA SEARCH MANUAL ---
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
      } catch (error) { alert(error.message); } finally { setLoading(false); }
  };

  const clearSearch = () => { setSearchQuery(''); setSearchResults([]); setIsSearching(false); };

  return (
    <div className="pb-24 max-w-md mx-auto relative min-h-screen"> 
      {/* Header Search */}
      <div className="bg-white p-4 rounded-lg shadow-md mb-4 sticky top-0 z-10">
        <h2 className="text-xl font-bold text-center mb-4 text-blue-600">Scan Barang</h2>
        <form onSubmit={handleSearch} className="relative mb-2">
          <input 
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari Nama / SKU..."
            className="w-full pl-10 pr-4 py-3 border rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 outline-none"
          />
          <Search className="absolute left-3 top-3.5 text-gray-400" size={20} />
          {searchQuery && (
            <button type="button" onClick={clearSearch} className="absolute right-3 top-3.5 text-gray-400"><X size={20} /></button>
          )}
        </form>
      </div>

      <div className="px-4">
        {/* --- TAMPILAN 1: SEARCH RESULTS (JIKA SEDANG MENCARI) --- */}
        {isSearching ? (
          <div>
            <div className="flex justify-between items-center mb-2">
               <h3 className="font-bold text-gray-700">Hasil Pencarian ({searchResults.length})</h3>
               <button onClick={clearSearch} className="text-sm text-red-500 underline">Tutup</button>
            </div>
             <div className="space-y-3">
                {searchResults.map((item) => (
                  <div key={item.id} className="border p-3 rounded-lg shadow-sm flex justify-between items-center bg-white">
                    <div className="flex-1">
                      <div className="font-bold text-gray-800">{item.item_name}</div>
                      <div className="text-xs text-gray-500 mb-1">{item.sku}</div>
                      
                      {/* --- UPDATE: MENAMPILKAN KATEGORI & VARIAN --- */}
                      <div className="flex flex-wrap gap-1">
                        {item.category && (
                            <span className="text-[10px] bg-blue-50 text-blue-600 px-1.5 py-0.5 rounded border border-blue-100 font-medium">
                                {item.category}
                            </span>
                        )}
                        {item.variant_name && (
                            <span className="text-[10px] bg-orange-50 text-orange-600 px-1.5 py-0.5 rounded border border-orange-100 font-medium">
                                {item.variant_name}
                            </span>
                        )}
                      </div>

                    </div>
                    <button onClick={() => handleAddItem(item)} className="ml-3 bg-orange-500 text-white p-2 rounded-full"><Plus size={20} /></button>
                  </div>
                ))}
                {searchResults.length === 0 && (
                    <p className="text-center text-gray-400 mt-4">Tidak ditemukan.</p>
                )}
             </div>
          </div>
        ) : (
          /* --- TAMPILAN 2: SCANNER & RESULT --- */
          <>
            {/* MODE SCAN */}
            {mode === 'scan' && (
              <>
                {/* Kamera lebih kecil (h-56) */}
                <div className="relative bg-black rounded-lg overflow-hidden h-56 w-full max-w-xs mx-auto flex items-center justify-center shadow-lg transition-all">
                    {isCameraActive ? (
                        <Scanner onScanResult={handleScan} flashOn={isFlashOn} />
                    ) : (
                        <div className="text-white flex flex-col items-center opacity-70 animate-fade-in">
                            <CameraOff size={40} className="mb-2"/>
                            <p className="text-sm">Kamera Mati</p>
                        </div>
                    )}
                </div>

                {/* Kontrol Kamera & Flash */}
                <div className="grid grid-cols-2 gap-3 mt-4 max-w-xs mx-auto">
                    <button 
                        onClick={() => setIsCameraActive(!isCameraActive)}
                        className={`flex items-center justify-center gap-2 py-2 rounded-lg font-bold text-white shadow transition text-sm ${
                            isCameraActive ? 'bg-gray-800' : 'bg-green-600'
                        }`}
                    >
                        {isCameraActive ? <><CameraOff size={18}/> Matikan</> : <><Camera size={18}/> Hidupkan</>}
                    </button>

                    <button 
                        onClick={() => setIsFlashOn(!isFlashOn)}
                        disabled={!isCameraActive}
                        className={`flex items-center justify-center gap-2 py-2 rounded-lg font-bold shadow transition text-sm ${
                            !isCameraActive ? 'bg-gray-300 text-gray-400' : isFlashOn ? 'bg-yellow-400 text-black' : 'bg-white text-gray-800 border'
                        }`}
                    >
                        {isFlashOn ? <><ZapOff size={18}/> Flash Off</> : <><Zap size={18}/> Flash On</>}
                    </button>
                </div>
              </>
            )}

            {/* MODE RESULT (PRODUK DITEMUKAN/DITAMBAHKAN) */}
            {mode === 'result' && productData && (
              <div className="text-center bg-white p-6 rounded-lg shadow-lg mt-4 animate-fade-in border border-blue-100">
                <div className="bg-green-100 text-green-800 px-3 py-1 rounded-full mb-4 inline-block text-sm font-bold">✓ Ditemukan</div>
                <h2 className="text-xl font-bold text-gray-800 leading-tight mb-1">{productData.item_name}</h2>
                <div className="text-gray-500 mb-4 text-xs">
                    SKU: {productData.sku} <br/>
                    {productData.brand_name && `Brand: ${productData.brand_name}`}
                </div>
                
                {/* Kategori & Varian di Result */}
                <div className="flex justify-center gap-2 mb-4">
                    {productData.category && <span className="text-xs bg-blue-50 text-blue-700 px-2 py-1 rounded">{productData.category}</span>}
                    {productData.variant_name && <span className="text-xs bg-orange-50 text-orange-700 px-2 py-1 rounded">{productData.variant_name}</span>}
                </div>

                <p className="text-3xl font-bold text-blue-600 mb-6">Rp {productData.price.toLocaleString()}</p>

                <div className="space-y-3">
                    <button 
                      onClick={() => handleAddItem(productData)}
                      className="w-full bg-orange-500 text-white font-bold py-3 rounded-lg shadow-md hover:bg-orange-600 flex justify-center items-center gap-2"
                    >
                      <Plus size={20} /> Masukkan ke List
                    </button>
                    <button onClick={() => setMode('scan')} className="w-full bg-gray-100 text-gray-600 py-3 rounded-lg hover:bg-gray-200">
                      Scan Lagi
                    </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* --- FLOATING BOTTOM BAR (MENU EXPORT) --- */}
      {!isSearching && exportList.length > 0 && (
          <div className="fixed bottom-20 left-4 right-4 z-20">
              <button 
                onClick={() => navigate('/list')} 
                className="w-full bg-blue-600 text-white p-4 rounded-xl shadow-xl flex justify-between items-center hover:bg-blue-700 transition transform hover:-translate-y-1"
              >
                  <div className="flex items-center gap-3">
                      <div className="bg-white text-blue-600 font-bold w-8 h-8 rounded-full flex items-center justify-center">
                          {exportList.length}
                      </div>
                      <div className="text-left">
                          <p className="font-bold text-sm">Barang Disimpan</p>
                          <p className="text-xs text-blue-200">Ketuk untuk lihat detail & export</p>
                      </div>
                  </div>
                  <ArrowRight size={20} />
              </button>
          </div>
      )}

      {/* --- INTEGRASI MODAL TAMBAH PRODUK --- */}
      <ProductModal 
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        product={{ sku: pendingSku }} 
        onSave={handleSaveNewProduct}
      />

    </div>
  );
};

export default ScanPage;