import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { useExportList } from '../ExportContext';
import { useNavigate } from 'react-router-dom';
import { Search, Plus, X, Camera, CameraOff, Zap, ZapOff, ArrowRight, Copy, Check } from 'lucide-react';
import { useAuth } from '../AuthProvider';

// KOMPONEN:
import Scanner from '../components/Scanner'; 
import ProductModal from '../components/ProductModal'; // Modal Tambah Baru (Master Data)
import ProductResultModal from '../components/ProductResultModal'; // Modal Hasil Scan (Edit Harga Transaksi)

const beepSound = new Audio("data:audio/wav;base64,UklGRl9vT19XQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YU");

const ScanPage = () => {
  const { user } = useAuth();
  const { exportList, addToExportList } = useExportList();
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(false);
  
  // State Data
  const [productData, setProductData] = useState(null); // Jika ini terisi, Modal Result Muncul
  const [pendingSku, setPendingSku] = useState('');     // Jika terisi, Modal Tambah Baru Muncul
  const [showAddModal, setShowAddModal] = useState(false);

  // [BARU] State untuk template data saat Edit/Tambah Varian
  const [productFormDefault, setProductFormDefault] = useState(null);

  // [BARU] Database Lokal untuk deteksi varian
  const [allProducts, setAllProducts] = useState([]);

  // Scanner State
  const [isCameraActive, setIsCameraActive] = useState(() => {
    return localStorage.getItem('camera_active') === 'false' ? false : true;
  });
  const [isFlashOn, setIsFlashOn] = useState(false);

  useEffect(() => {
    localStorage.setItem('camera_active', isCameraActive);
  }, [isCameraActive]);

  // --- 1. FETCH ALL PRODUCTS (Agar Modal bisa baca varian) ---
  useEffect(() => {
    const fetchAllProducts = async () => {
      try {
        const { data, error } = await supabase.from('products').select('*');
        if (error) throw error;
        if (data) setAllProducts(data);
      } catch (error) {
        console.error("Error fetching all products:", error.message);
      }
    };

    if (user) {
        fetchAllProducts();
    }
  }, [user]);

  // Search State
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [copiedSku, setCopiedSku] = useState(null);

  const playBeep = () => { beepSound.play().catch(e => console.log(e)); };

  const handleCopySku = async (sku) => {
    if (!sku || sku === '-') return;
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(sku);
      } else {
        // Fallback copy manual
        const textArea = document.createElement("textarea");
        textArea.value = sku;
        textArea.style.position = "fixed";
        textArea.style.left = "-9999px";
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
      }
      setCopiedSku(sku);
      setTimeout(() => setCopiedSku(null), 2000);
    } catch (err) {
      console.error('Copy Error:', err);
    }
  };

  // --- LOGIKA ADD ITEM KE LIST (Dipanggil dari Modal Result) ---
  const handleAddItem = (product) => {
    const isDuplicate = exportList.some((item) => item.sku === product.sku);
    if (isDuplicate) {
      alert(`⚠️ Produk "${product.item_name}" SUDAH ADA di list!`);
      return; 
    }
    
    // Langsung kirim product ke ExportContext
    addToExportList(product);
    
    // Tutup Modal & Reset
    setProductData(null); 
    clearSearch();
  };

  // --- LOGIKA SCAN ---
  const handleScan = async (sku) => {
    playBeep();
    setLoading(true);
    clearSearch(); 
    try {
      // Optimasi: Cek di local state dulu
      const localProduct = allProducts.find(p => p.sku === sku);
      
      if (localProduct) {
         setProductData(localProduct);
      } else {
         // Fallback ke DB
         const { data } = await supabase.from('products').select('*').eq('sku', sku).single();
         
         if (data) { 
            setProductData(data);
            setAllProducts(prev => [...prev, data]);
         } else { 
            setPendingSku(sku); 
            setShowAddModal(true); 
         }
      }
    } catch (error) { 
      console.error(error); 
    } finally { 
      setLoading(false); 
    }
  };

  // --- LOGIKA SIMPAN PRODUK (HANDLE INSERT & UPDATE) ---
  const handleSaveProduct = async (formData, isVariantMode = false) => {
    if(!user) return alert("Sesi habis");
    setLoading(true);
    
    // Cek apakah Edit (Update) atau Baru (Insert)
    const isUpdate = !isVariantMode && productFormDefault && productFormDefault.id;
    let error, data;

    const payload = {
        sku: formData.sku,
        item_name: formData.item_name,
        category: formData.category,
        brand_name: formData.brand_name || '-',
        variant_name: formData.variant_name,
        price: parseFloat(formData.price) || 0,
        wholesale_price: parseFloat(formData.wholesale_price) || 0,
        unit: formData.unit || 'Pcs'
    };

    if (isUpdate) {
        // UPDATE
        const res = await supabase.from('products')
            .update(payload)
            .eq('id', productFormDefault.id)
            .select().single();
        error = res.error;
        data = res.data;
    } else {
        // INSERT
        const res = await supabase.from('products')
            .insert([{ ...payload, user_id: user.id }])
            .select().single();
        error = res.error;
        data = res.data;
    }

    setLoading(false);

    if (error) {
        alert('Gagal menyimpan: ' + error.message);
    } else {
        alert(isUpdate ? '✅ Produk Berhasil Diupdate!' : '✅ Produk Baru Ditambahkan!');
        setShowAddModal(false); 
        setProductFormDefault(null); 

        // Update State Lokal
        if (data) {
            if (isUpdate) {
                setAllProducts(prev => prev.map(p => p.id === data.id ? data : p));
                setSearchResults(prev => prev.map(p => p.id === data.id ? data : p));
            } else {
                setAllProducts(prev => [...prev, data]);
            }
            // Buka kembali modal result dengan data terbaru
            setProductData(data); 
        }
    }
  };

  // --- LOGIKA EDIT MASTER / TAMBAH VARIAN ---
  const handleEditMaster = (productToEdit) => {
      setProductData(null); // Tutup modal result
      setProductFormDefault(productToEdit); // Isi template form
      setShowAddModal(true); // Buka modal master
  };
  
  // --- LOGIKA SEARCH (Local Filter) ---
  const handleSearch = (e) => {
      e.preventDefault();
      const query = searchQuery.toLowerCase().trim();
      if (!query) return;

      setLoading(true);
      setIsSearching(true);

      const results = allProducts.filter(item => {
          const name = (item.item_name || '').toLowerCase();
          const sku = (item.sku || '').toLowerCase();
          // Filter sederhana: Nama atau SKU
          return name.includes(query) || sku.includes(query);
      }).slice(0, 20); // Limit 20 biar ringan

      setSearchResults(results);
      setLoading(false);
  };

  const clearSearch = () => { setSearchQuery(''); setSearchResults([]); setIsSearching(false); };

  const handleItemClick = (item) => {
      setProductData(item); 
  };

  return (
    <div className="pb-24 max-w-md mx-auto relative min-h-screen"> 
      {/* Header Search */}
      <div className="bg-white p-4 rounded-lg shadow-md mb-4 sticky top-0 z-40">
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
        {isSearching ? (
          <div>
            <div className="flex justify-between items-center mb-2">
               <h3 className="font-bold text-gray-700">Hasil Pencarian ({searchResults.length})</h3>
               <button onClick={clearSearch} className="text-l text-white rounded-lg bg-black px-4 py-2">Tutup</button>
            </div>
             <div className="space-y-3">
                {searchResults.map((item) => (
                  <div 
                    key={item.id} 
                    onClick={() => handleItemClick(item)} 
                    className="border p-3 rounded-lg shadow-sm flex justify-between items-center bg-white cursor-pointer hover:bg-blue-50 transition active:scale-[0.98]"
                  >
                    <div className="flex-1">
                      <div className="font-bold text-gray-800">{item.item_name}</div>
                      <div className="flex items-center gap-2 mb-1">
                        <div className="text-xs text-gray-500">{item.sku}</div>
                        <button 
                            onClick={(e) => { e.stopPropagation(); handleCopySku(item.sku); }}
                            className="text-gray-400 hover:text-blue-600 transition p-1 bg-gray-50 rounded"
                        >
                            {copiedSku === item.sku ? <Check size={14} className="text-green-500" /> : <Copy size={14} />}
                        </button>
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {item.category && <span className="text-[10px] bg-blue-50 text-blue-600 px-1.5 py-0.5 rounded border border-blue-100 font-medium">{item.category}</span>}
                        {item.variant_name && <span className="text-[10px] bg-orange-50 text-orange-600 px-1.5 py-0.5 rounded border border-orange-100 font-medium">{item.variant_name}</span>}
                      </div>
                    </div>
                    <button 
                        onClick={(e) => {
                            e.stopPropagation(); 
                            addToExportList(item); 
                            clearSearch();
                        }} 
                        className="ml-3 bg-orange-100 text-orange-600 p-2 rounded-full hover:bg-orange-200"
                        title="Quick Add (Tanpa Edit)"
                    >
                        <Plus size={20} />
                    </button>
                  </div>
                ))}
                {searchResults.length === 0 && <p className="text-center text-gray-400 mt-4">Tidak ditemukan.</p>}
             </div>
          </div>
        ) : (
          <>
            {/* Tampilan Scanner */}
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
      </div>

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

      {/* --- MODAL 1: CREATE / EDIT PRODUCT (Master Data) --- */}
      <ProductModal 
        isOpen={showAddModal}
        onClose={() => { setShowAddModal(false); setProductFormDefault(null); }} 
        // Logic: Jika ada productFormDefault (dari edit), pakai itu. Jika tidak, pakai sku pending (dari scan baru)
        product={productFormDefault || { sku: pendingSku }} 
        onSave={handleSaveProduct}
        allProducts={allProducts} // Kirim data untuk cek duplikat/varian di dalam modal
      />

      {/* --- MODAL 2: RESULT & ADD TO LIST (Untuk Edit Harga Transaksi) --- */}
      <ProductResultModal 
        isOpen={!!productData} 
        onClose={() => setProductData(null)}
        product={productData}
        onAddToExport={handleAddItem}
        
        // Props tambahan untuk fitur varian & edit
        allProducts={allProducts} 
        setIsScannerActive={setIsCameraActive} 
        onEditMaster={handleEditMaster} 
      />

    </div>
  );
};

export default ScanPage;