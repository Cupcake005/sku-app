
// //======================================================================================================================

// import React, { useState, useEffect, useCallback, useRef } from 'react';
// import { supabase } from '../supabaseClient';
// import { useExportList } from '../ExportContext';
// import { useNavigate } from 'react-router-dom';
// import { Search, Plus, X, Camera, CameraOff, Zap, ZapOff, ArrowRight, Copy, Check } from 'lucide-react';
// import { useAuth } from '../AuthProvider';

// // KOMPONEN:
// import Scanner from '../components/Scanner'; 
// import ProductModal from '../components/ProductModal'; 
// import ProductResultModal from '../components/ProductResultModal';
// import ConfirmationModal from '../components/ConfirmationModal'; 
// import NotificationModal from '../components/NotificationModal'; 

// const ScanPage = () => {
//   const { user } = useAuth();
//   const { exportList, addToExportList, updateExportItem } = useExportList();
//   const navigate = useNavigate();
  
//   const [loading, setLoading] = useState(false);
  
//   // State Data
//   const [productData, setProductData] = useState(null); 
//   const [pendingSku, setPendingSku] = useState('');     
//   const [showAddModal, setShowAddModal] = useState(false);
//   const [productFormDefault, setProductFormDefault] = useState(null); 
//   const [allProducts, setAllProducts] = useState([]); 

//   // --- STATE MODAL & NOTIFIKASI ---
//   const [showConfirmModal, setShowConfirmModal] = useState(false);
//   const [pendingUpdateProduct, setPendingUpdateProduct] = useState(null);
//   const [existingProductData, setExistingProductData] = useState(null);
//   const [notifyModal, setNotifyModal] = useState({ isOpen: false, type: 'success', title: '', message: '' });

//   // Scanner State
//   const previousCameraState = useRef(false);

//   const [isCameraActive, setIsCameraActive] = useState(() => {
//     return localStorage.getItem('camera_active') === 'false' ? false : true;
//   });
//   const [isFlashOn, setIsFlashOn] = useState(false);

//   // --- LOGIKA OTOMATIS MATIKAN KAMERA ---
//   const [isSearching, setIsSearching] = useState(false); 

//   useEffect(() => {
//     // Kondisi di mana kamera & flash harus MATI
//     const shouldPauseCamera = showAddModal || !!productData || isSearching || showConfirmModal;

//     if (shouldPauseCamera) {
//         if (isFlashOn) setIsFlashOn(false); // Matikan flash paksa

//         if (isCameraActive) {
//             previousCameraState.current = true; // Simpan state
//             setIsCameraActive(false);           // Matikan kamera
//         }
//     } else {
//         // Jika semua modal tutup dan search selesai, pulihkan kamera
//         if (previousCameraState.current) {
//             setIsCameraActive(true);
//             previousCameraState.current = false; 
//         }
//     }
//   }, [showAddModal, productData, isSearching, showConfirmModal]); 

//   useEffect(() => {
//     if (!showAddModal && !productData && !isSearching && !showConfirmModal) {
//         localStorage.setItem('camera_active', isCameraActive);
//     }
//   }, [isCameraActive]);

//   // --- AUDIO BEEP ---
//   const triggerBeep = useCallback(() => {
//     try {
//         const AudioContext = window.AudioContext || window.webkitAudioContext;
//         if (!AudioContext) return; 
//         const ctx = new AudioContext();
//         const osc = ctx.createOscillator();
//         const gain = ctx.createGain();
//         osc.connect(gain);
//         gain.connect(ctx.destination);
//         osc.type = 'square'; 
//         osc.frequency.setValueAtTime(1500, ctx.currentTime); 
//         gain.gain.setValueAtTime(0.1, ctx.currentTime); 
//         osc.start();
//         osc.stop(ctx.currentTime + 0.1); 
//         setTimeout(() => ctx.close(), 150);
//     } catch (e) { console.error("Audio error:", e); }
//   }, []);

//   const unlockAudioContext = () => {
//       const AudioContext = window.AudioContext || window.webkitAudioContext;
//       if (AudioContext) {
//           const ctx = new AudioContext();
//           ctx.resume().then(() => ctx.close());
//       }
//   };

//   const showNotify = (type, title, message) => {
//     setNotifyModal({ isOpen: true, type, title, message });
//   };

//   const closeNotify = () => setNotifyModal({ ...notifyModal, isOpen: false });

//   // --- FETCH DATA ---
//   useEffect(() => {
//     const fetchAllProducts = async () => {
//       try {
//         const { data, error } = await supabase.from('products').select('*');
//         if (error) throw error;
//         if (data) setAllProducts(data);
//       } catch (error) { console.error("Error fetching data:", error.message); }
//     };
//     if (user) fetchAllProducts();
//   }, [user]);

//   // --- SEARCH ---
//   const [searchQuery, setSearchQuery] = useState('');
//   const [searchResults, setSearchResults] = useState([]);
//   const [copiedSku, setCopiedSku] = useState(null);

//   const executeSearch = useCallback(async (queryText) => {
//       const query = queryText.trim();
//       if (!query) {
//           setSearchResults([]); 
//           setIsSearching(false);
//           return;
//       }
//       setLoading(true);
//       setIsSearching(true); 

//       try {
//         const { data, error } = await supabase
//           .from('products')
//           .select('*')
//           .or(`item_name.ilike.%${query}%,sku.ilike.%${query}%`) 
//           .limit(20);

//         if (error) throw error;
        
//         const sortedData = (data || []).sort((a, b) => {
//             const aExact = a.sku.toLowerCase() === query.toLowerCase();
//             const bExact = b.sku.toLowerCase() === query.toLowerCase();
//             if (aExact && !bExact) return -1;
//             if (!aExact && bExact) return 1;
//             return 0;
//         });
//         setSearchResults(sortedData);
//       } catch (error) {
//         console.error("Search Error:", error.message);
//       } finally {
//         setLoading(false);
//       }
//   }, []);

//   const handleCopySku = async (sku) => {
//     if (!sku || sku === '-') return;
//     try {
//       await navigator.clipboard.writeText(sku);
//       setCopiedSku(sku);
//       setTimeout(() => setCopiedSku(null), 2000);
//     } catch (err) { console.error('Copy Error:', err); }
//   };

//   const handleAddItem = (product) => {
//     const existingItem = exportList.find((item) => item.sku === product.sku);
    
//     if (existingItem) {
//       const isPriceChanged = 
//           existingItem.price !== product.price || 
//           existingItem.wholesale_price !== product.wholesale_price;

//       if (isPriceChanged) {
//           setExistingProductData(existingItem); 
//           setPendingUpdateProduct(product);     
//           setShowConfirmModal(true);            
//       } else {
//           showNotify('info', 'Produk Duplikat', `Produk "${product.item_name}" sudah ada di list!`);
//       }
//       return; 
//     }
    
//     addToExportList(product);
//     showNotify('success', 'Tersimpan', `${product.item_name} berhasil ditambahkan.`);
//     setProductData(null); 
//   };

//   const executeUpdate = () => {
//       if (pendingUpdateProduct) {
//           updateExportItem(pendingUpdateProduct);
//           showNotify('success', 'Berhasil Update', 'Harga produk diperbarui!');
//           setShowConfirmModal(false);
//           setPendingUpdateProduct(null);
//           setExistingProductData(null);
//           setProductData(null); 
//       }
//   };

//   // --- HANDLE SCAN (Di-wrap useCallback agar stabil untuk listener) ---
//   const handleScan = useCallback(async (sku) => {
//     triggerBeep(); 
//     setIsFlashOn(false); 
//     setSearchQuery(sku);
//     await executeSearch(sku);
//   }, [triggerBeep, executeSearch]); // Dependency penting

//   const handleSearch = async (e) => {
//       e.preventDefault();
//       await executeSearch(searchQuery);
//   };

//   const clearSearch = () => { 
//       setSearchQuery(''); 
//       setSearchResults([]); 
//       setIsSearching(false); 
//   };
  
//   const handleItemClick = (item) => { setProductData(item); };

//   const handleSaveProduct = async (formData, isVariantMode = false) => {
//     if(!user) return showNotify('error', 'Sesi Habis', 'Silakan login ulang.');
//     setLoading(true);
    
//     const isUpdate = !isVariantMode && productFormDefault && productFormDefault.id;
//     let error, data;
//     const payload = {
//         sku: formData.sku,
//         item_name: formData.item_name,
//         category: formData.category,
//         brand_name: formData.brand_name || '-',
//         variant_name: formData.variant_name,
//         price: parseFloat(formData.price) || 0,
//         wholesale_price: parseFloat(formData.wholesale_price) || 0
//     };

//     if (isUpdate) {
//         const res = await supabase.from('products').update(payload).eq('id', productFormDefault.id).select().single();
//         error = res.error; data = res.data;
//     } else {
//         const res = await supabase.from('products').insert([{ ...payload, user_id: user.id }]).select().single();
//         error = res.error; data = res.data;
//     }

//     setLoading(false);

//     if (error) {
//         showNotify('error', 'Gagal Menyimpan', error.message);
//     } else {
//         showNotify('success', 'Berhasil', isUpdate ? 'Produk diperbarui!' : 'Produk ditambahkan!');
//         setShowAddModal(false); 
//         setProductFormDefault(null); 

//         if (data) {
//             setAllProducts(prev => {
//                 if (isUpdate) return prev.map(p => p.id === data.id ? data : p);
//                 return [data, ...prev];
//             });
//             setSearchResults(prev => {
//                 if (isUpdate) return prev.map(p => p.id === data.id ? data : p);
//                 return [data, ...prev];
//             });
//             setProductData(data); 
//         }
//     }
//   };

//   const handleEditMaster = (productToEdit) => {
//       setProductData(null); 
//       setProductFormDefault(productToEdit); 
//       setShowAddModal(true); 
//   };

//   // --- TAMBAHAN FITUR: GLOBAL SCANNER LISTENER (Bluetooth/USB) ---
//   useEffect(() => {
//     let buffer = '';
//     let lastKeyTime = Date.now();

//     const handleGlobalKeyDown = (e) => {
//         const currentTime = Date.now();
        
//         // 1. Deteksi Kecepatan Ketik (Scanner fisik sangat cepat, <50ms antar tombol)
//         // Jika gap terlalu lama, reset buffer (karena itu manual typing)
//         if (currentTime - lastKeyTime > 50) {
//             buffer = '';
//         }
//         lastKeyTime = currentTime;

//         // 2. Tangkap Karakter
//         if (e.key === 'Enter') {
//             // Jika buffer terisi karakter cepat sebelumnya, berarti itu barcode
//             if (buffer.length > 1) { 
//                 e.preventDefault(); // Cegah form submit default (biar gak bentrok)
//                 handleScan(buffer); // Jalankan logika scan
//                 buffer = '';
//             }
//         } else if (e.key.length === 1) {
//             // Tambahkan huruf/angka ke buffer
//             buffer += e.key;
//         }
//     };

//     window.addEventListener('keydown', handleGlobalKeyDown);
//     return () => window.removeEventListener('keydown', handleGlobalKeyDown);
//   }, [handleScan]);

//   return (
//     <div className="pb-24 max-w-md mx-auto relative min-h-screen"> 
      
//       <NotificationModal 
//         isOpen={notifyModal.isOpen}
//         onClose={closeNotify}
//         type={notifyModal.type}
//         title={notifyModal.title}
//         message={notifyModal.message}
//       />

//       {/* Header Search */}
//       <div className="bg-white p-4 rounded-lg shadow-md mb-4 sticky top-0 z-40">
//         <h2 className="text-xl font-bold text-center mb-4 text-blue-600">Scan Barang</h2>
//         <form onSubmit={handleSearch} className="relative mb-2">
//           <input 
//             type="text"
//             value={searchQuery}
//             onChange={(e) => setSearchQuery(e.target.value)}
//             placeholder="Cari Nama / SKU..."
//             className="w-full pl-10 pr-4 py-3 border rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 outline-none"
//           />
//           <Search className="absolute left-3 top-3.5 text-gray-400" size={20} />
//           {searchQuery && (
//             <div className="absolute right-3 top-2 flex items-center gap-2">
//                  <button type="button" onClick={clearSearch} className="text-gray-400 p-1"><X size={20} /></button>
//                  <button type="submit" className="bg-blue-600 text-white p-1.5 rounded-md"><Search size={16}/></button>
//              </div>
//           )}
//         </form>
//       </div>

//       <div className="px-4">
//         {isSearching ? (
//           <div>
//             <div className="flex justify-between items-center mb-2">
//                <h3 className="font-bold text-gray-700">Hasil Pencarian ({searchResults.length})</h3>
//                <button onClick={clearSearch} className="text-sm text-white rounded-lg bg-gray-800 px-3 py-1">Tutup</button>
//             </div>
             
//              {loading ? (
//                  <div className="text-center py-10 text-gray-500 animate-pulse">Mencari di Database...</div>
//              ) : (
//                  <div className="space-y-3 pb-20">
//                     {searchResults.map((item) => (
//                       <div 
//                         key={item.id} 
//                         onClick={() => handleItemClick(item)} 
//                         className="border p-3 rounded-lg shadow-sm flex justify-between items-center bg-white cursor-pointer hover:bg-blue-50 transition active:scale-[0.98]"
//                       >
//                         <div className="flex-1">
//                           <div className="font-bold text-gray-800">{item.item_name}</div>
//                           <div className="flex items-center gap-2 mb-1">
//                             <div className="text-xs text-gray-500 font-mono bg-gray-100 px-1 rounded">{item.sku}</div>
//                             <button 
//                                 onClick={(e) => { e.stopPropagation(); handleCopySku(item.sku); }}
//                                 className="text-gray-400 hover:text-blue-600 transition p-1"
//                             >
//                                 {copiedSku === item.sku ? <Check size={14} className="text-green-500" /> : <Copy size={14} />}
//                             </button>
//                           </div>
//                           <div className="flex flex-wrap gap-1">
//                             {item.category && <span className="text-[10px] bg-blue-50 text-blue-600 px-1.5 py-0.5 rounded border border-blue-100 font-medium">{item.category}</span>}
//                             {item.brand_name && <span className="text-[10px] bg-green-50 text-green-600-600 px-1.5 py-0.5 rounded border border-blue-100 font-medium">{item.brand_name}</span>}
//                             {item.variant_name && <span className="text-[10px] bg-orange-50 text-orange-600 px-1.5 py-0.5 rounded border border-orange-100 font-medium">{item.variant_name}</span>}
//                           </div>
//                         </div>
//                         <button 
//                             onClick={(e) => {
//                                 e.stopPropagation(); 
//                                 handleAddItem(item); 
//                             }} 
//                             className="ml-3 bg-orange-100 text-orange-600 p-2 rounded-full hover:bg-orange-200"
//                             title="Quick Add"
//                         >
//                             <Plus size={20} />
//                         </button>
//                       </div>
//                     ))}
                    
//                     {searchResults.length === 0 && !loading && (
//                         <div className="text-center py-10">
//                             <p className="text-gray-400">Produk tidak ditemukan.</p>
//                             <button 
//                                 onClick={() => {
//                                     setPendingSku(searchQuery); 
//                                     setShowAddModal(true);
//                                 }}
//                                 className="mt-4 text-blue-600 font-bold text-sm hover:underline"
//                             >
//                                 + Tambah Produk Baru "{searchQuery}"
//                             </button>
//                         </div>
//                     )}
//                  </div>
//              )}
//           </div>
//         ) : (
//           <>
//             {/* Tampilan Scanner */}
//             <div className="relative bg-black rounded-lg overflow-hidden h-56 w-full max-w-xs mx-auto flex items-center justify-center shadow-lg transition-all">
//                 {isCameraActive ? (
//                     <Scanner onScanResult={handleScan} flashOn={isFlashOn} />
//                 ) : (
//                     <div className="text-white flex flex-col items-center opacity-70 animate-fade-in">
//                         <CameraOff size={40} className="mb-2"/>
//                         <p className="text-sm">Kamera Mati</p>
//                     </div>
//                 )}
//             </div>

//             <div className="grid grid-cols-2 gap-3 mt-4 max-w-xs mx-auto">
//                 <button 
//                     onClick={() => {
//                         setIsCameraActive(!isCameraActive);
//                         if(!isCameraActive) unlockAudioContext(); 
//                     }}
//                     className={`flex items-center justify-center gap-2 py-2 rounded-lg font-bold text-white shadow transition text-sm ${
//                         isCameraActive ? 'bg-gray-800' : 'bg-green-600'
//                     }`}
//                 >
//                     {isCameraActive ? <><CameraOff size={18}/> Matikan</> : <><Camera size={18}/> Hidupkan</>}</button>

//                 <button 
//                     onClick={() => setIsFlashOn(!isFlashOn)}
//                     disabled={!isCameraActive}
//                     className={`flex items-center justify-center gap-2 py-2 rounded-lg font-bold shadow transition text-sm ${
//                         !isCameraActive ? 'bg-gray-300 text-gray-400' : isFlashOn ? 'bg-yellow-400 text-black' : 'bg-white text-gray-800 border'
//                     }`}
//                 >
//                     {isFlashOn ? <><ZapOff size={18}/> Flash Off</> : <><Zap size={18}/> Flash On</>}</button>
//             </div>
//           </>
//         )}
//       </div>

//       {!isSearching && exportList.length > 0 && (
//           <div className="fixed bottom-20 left-4 right-4 z-20">
//               <button 
//                 onClick={() => navigate('/list')} 
//                 className="w-full bg-blue-600 text-white p-4 rounded-xl shadow-xl flex justify-between items-center hover:bg-blue-700 transition transform hover:-translate-y-1"
//               >
//                   <div className="flex items-center gap-3">
//                       <div className="bg-white text-blue-600 font-bold w-8 h-8 rounded-full flex items-center justify-center">
//                           {exportList.length}
//                       </div>
//                       <div className="text-left">
//                           <p className="font-bold text-sm">Barang Disimpan</p>
//                           <p className="text-xs text-blue-200">Ketuk untuk lihat detail & export</p>
//                       </div>
//                   </div>
//                   <ArrowRight size={20} />
//               </button>
//           </div>
//       )}

//       {/* --- RENDER MODAL KONFIRMASI --- */}
//       <ConfirmationModal 
//         isOpen={showConfirmModal}
//         onClose={() => {
//             setShowConfirmModal(false);
//             setPendingUpdateProduct(null);
//             setExistingProductData(null);
//         }}
//         onConfirm={executeUpdate}
//         title="Update Harga?"
//         message={`Produk "${pendingUpdateProduct?.item_name}" sudah ada di list, tapi harganya berbeda.`}
//         confirmLabel="Ya, Update" 
//         isDanger={false}
//         details={
//             existingProductData && pendingUpdateProduct ? (
//                 <div className="grid grid-cols-2 gap-4 text-center">
//                     <div className="bg-white p-2 rounded border">
//                         <p className="text-xs text-gray-400 mb-1">Harga Lama</p>
//                         <p className="font-bold text-gray-600">Rp {existingProductData.price.toLocaleString()}</p>
//                     </div>
//                     <div className="bg-blue-50 p-2 rounded border border-blue-200">
//                         <p className="text-xs text-blue-400 mb-1">Harga Baru</p>
//                         <p className="font-bold text-blue-600">Rp {pendingUpdateProduct.price.toLocaleString()}</p>
//                     </div>
//                 </div>
//             ) : null
//         }
//       />

//       <ProductModal 
//         isOpen={showAddModal}
//         onClose={() => { setShowAddModal(false); setProductFormDefault(null); }} 
//         product={productFormDefault || { sku: pendingSku }} 
//         onSave={handleSaveProduct}
//         allProducts={allProducts} 
//         setIsScannerActive={setIsCameraActive} 
//       />

//       <ProductResultModal 
//         isOpen={!!productData} 
//         onClose={() => setProductData(null)}
//         product={productData}
//         onAddToExport={handleAddItem}
//         allProducts={allProducts} 
//         setIsScannerActive={setIsCameraActive} 
//         onEditMaster={handleEditMaster} 
//       />

//     </div>
//   );
// };

// export default ScanPage;


//==========================================================================================


import React, { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '../supabaseClient';
import { useExportList } from '../ExportContext';
import { useNavigate } from 'react-router-dom';
import { Search, Plus, X, Camera, CameraOff, Zap, ZapOff, ArrowRight, Copy, Check, Clipboard } from 'lucide-react';
import { useAuth } from '../AuthProvider';

// KOMPONEN:
import Scanner from '../components/Scanner'; 
import ProductModal from '../components/ProductModal'; 
import ProductResultModal from '../components/ProductResultModal';
import ConfirmationModal from '../components/ConfirmationModal'; 
import NotificationModal from '../components/NotificationModal'; 

const ScanPage = () => {
  const { user } = useAuth();
  const { exportList, addToExportList, updateExportItem } = useExportList();
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(false);
  
  // State Data
  const [productData, setProductData] = useState(null); 
  const [pendingSku, setPendingSku] = useState('');     
  const [showAddModal, setShowAddModal] = useState(false);
  const [productFormDefault, setProductFormDefault] = useState(null); 
  const [allProducts, setAllProducts] = useState([]); 

  // --- STATE MODAL & NOTIFIKASI ---
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [pendingUpdateProduct, setPendingUpdateProduct] = useState(null);
  const [existingProductData, setExistingProductData] = useState(null);
  const [notifyModal, setNotifyModal] = useState({ isOpen: false, type: 'success', title: '', message: '' });

  // Scanner State
  const previousCameraState = useRef(false);

  const [isCameraActive, setIsCameraActive] = useState(() => {
    return localStorage.getItem('camera_active') === 'false' ? false : true;
  });
  const [isFlashOn, setIsFlashOn] = useState(false);

  // --- LOGIKA OTOMATIS MATIKAN KAMERA ---
  const [isSearching, setIsSearching] = useState(false); 

  useEffect(() => {
    const shouldPauseCamera = showAddModal || !!productData || isSearching || showConfirmModal;

    if (shouldPauseCamera) {
        if (isFlashOn) setIsFlashOn(false); 

        if (isCameraActive) {
            previousCameraState.current = true; 
            setIsCameraActive(false);           
        }
    } else {
        if (previousCameraState.current) {
            setIsCameraActive(true);
            previousCameraState.current = false; 
        }
    }
  }, [showAddModal, productData, isSearching, showConfirmModal]); 

  useEffect(() => {
    if (!showAddModal && !productData && !isSearching && !showConfirmModal) {
        localStorage.setItem('camera_active', isCameraActive);
    }
  }, [isCameraActive]);

  // --- AUDIO BEEP ---
  const triggerBeep = useCallback(() => {
    try {
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        if (!AudioContext) return; 
        const ctx = new AudioContext();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.type = 'square'; 
        osc.frequency.setValueAtTime(1500, ctx.currentTime); 
        gain.gain.setValueAtTime(0.1, ctx.currentTime); 
        osc.start();
        osc.stop(ctx.currentTime + 0.1); 
        setTimeout(() => ctx.close(), 150);
    } catch (e) { console.error("Audio error:", e); }
  }, []);

  const unlockAudioContext = () => {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (AudioContext) {
          const ctx = new AudioContext();
          ctx.resume().then(() => ctx.close());
      }
  };

  const showNotify = (type, title, message) => {
    setNotifyModal({ isOpen: true, type, title, message });
  };

  const closeNotify = () => setNotifyModal({ ...notifyModal, isOpen: false });

  // --- FETCH DATA ---
  useEffect(() => {
    const fetchAllProducts = async () => {
      try {
        const { data, error } = await supabase.from('products').select('*');
        if (error) throw error;
        if (data) setAllProducts(data);
      } catch (error) { console.error("Error fetching data:", error.message); }
    };
    if (user) fetchAllProducts();
  }, [user]);

  // --- SEARCH ---
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [copiedSku, setCopiedSku] = useState(null);

  const executeSearch = useCallback(async (queryText) => {
      const query = queryText.trim();
      if (!query) {
          setSearchResults([]); 
          setIsSearching(false);
          return;
      }
      setLoading(true);
      setIsSearching(true); 

      try {
        const { data, error } = await supabase
          .from('products')
          .select('*')
          .or(`item_name.ilike.%${query}%,sku.ilike.%${query}%`) 
          .limit(20);

        if (error) throw error;
        
        const sortedData = (data || []).sort((a, b) => {
            const aExact = a.sku.toLowerCase() === query.toLowerCase();
            const bExact = b.sku.toLowerCase() === query.toLowerCase();
            if (aExact && !bExact) return -1;
            if (!aExact && bExact) return 1;
            return 0;
        });
        setSearchResults(sortedData);
      } catch (error) {
        console.error("Search Error:", error.message);
      } finally {
        setLoading(false);
      }
  }, []);

  const handleCopySku = async (sku) => {
    if (!sku || sku === '-') return;
    try {
      await navigator.clipboard.writeText(sku);
      setCopiedSku(sku);
      setTimeout(() => setCopiedSku(null), 2000);
    } catch (err) { console.error('Copy Error:', err); }
  };

  const handleAddItem = (product) => {
    const existingItem = exportList.find((item) => item.sku === product.sku);
    
    if (existingItem) {
      const isPriceChanged = 
          existingItem.price !== product.price || 
          existingItem.wholesale_price !== product.wholesale_price;

      if (isPriceChanged) {
          setExistingProductData(existingItem); 
          setPendingUpdateProduct(product);     
          setShowConfirmModal(true);            
      } else {
          showNotify('info', 'Produk Duplikat', `Produk "${product.item_name}" sudah ada di list!`);
      }
      return; 
    }
    
    addToExportList(product);
    showNotify('success', 'Tersimpan', `${product.item_name} berhasil ditambahkan.`);
    setProductData(null); 
  };

  const executeUpdate = () => {
      if (pendingUpdateProduct) {
          updateExportItem(pendingUpdateProduct);
          showNotify('success', 'Berhasil Update', 'Harga produk diperbarui!');
          setShowConfirmModal(false);
          setPendingUpdateProduct(null);
          setExistingProductData(null);
          setProductData(null); 
      }
  };

  const handleScan = useCallback(async (sku) => {
    triggerBeep(); 
    setIsFlashOn(false); 
    setSearchQuery(sku);
    await executeSearch(sku);
  }, [triggerBeep, executeSearch]); 

  const handleSearch = async (e) => {
      e.preventDefault();
      await executeSearch(searchQuery);
  };

  const clearSearch = () => { 
      setSearchQuery(''); 
      setSearchResults([]); 
      setIsSearching(false); 
  };
  
  const handleItemClick = (item) => { setProductData(item); };

  // --- LOGIKA PASTE (Tempel) ---
  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (text) setSearchQuery(text);
    } catch (err) {
      showNotify('error', 'Gagal Paste', 'Browser tidak mengizinkan akses clipboard.');
    }
  };

  const handleSaveProduct = async (formData, isVariantMode = false) => {
    if(!user) return showNotify('error', 'Sesi Habis', 'Silakan login ulang.');
    setLoading(true);
    
    const isUpdate = !isVariantMode && productFormDefault && productFormDefault.id;
    let error, data;
    const payload = {
        sku: formData.sku,
        item_name: formData.item_name,
        category: formData.category,
        brand_name: formData.brand_name || '-',
        variant_name: formData.variant_name,
        price: parseFloat(formData.price) || 0,
        wholesale_price: parseFloat(formData.wholesale_price) || 0
    };

    if (isUpdate) {
        const res = await supabase.from('products').update(payload).eq('id', productFormDefault.id).select().single();
        error = res.error; data = res.data;
    } else {
        const res = await supabase.from('products').insert([{ ...payload, user_id: user.id }]).select().single();
        error = res.error; data = res.data;
    }

    setLoading(false);

    if (error) {
        showNotify('error', 'Gagal Menyimpan', error.message);
    } else {
        showNotify('success', 'Berhasil', isUpdate ? 'Produk diperbarui!' : 'Produk ditambahkan!');
        setShowAddModal(false); 
        setProductFormDefault(null); 

        if (data) {
            setAllProducts(prev => {
                if (isUpdate) return prev.map(p => p.id === data.id ? data : p);
                return [data, ...prev];
            });
            setSearchResults(prev => {
                if (isUpdate) return prev.map(p => p.id === data.id ? data : p);
                return [data, ...prev];
            });
            setProductData(data); 
        }
    }
  };

  const handleEditMaster = (productToEdit) => {
      setProductData(null); 
      setProductFormDefault(productToEdit); 
      setShowAddModal(true); 
  };

  // --- GLOBAL SCANNER LISTENER ---
  useEffect(() => {
    let buffer = '';
    let lastKeyTime = Date.now();

    const handleGlobalKeyDown = (e) => {
        const currentTime = Date.now();
        if (currentTime - lastKeyTime > 50) {
            buffer = '';
        }
        lastKeyTime = currentTime;

        if (e.key === 'Enter') {
            if (buffer.length > 1) { 
                e.preventDefault(); 
                handleScan(buffer); 
                buffer = '';
            }
        } else if (e.key.length === 1) {
            buffer += e.key;
        }
    };

    window.addEventListener('keydown', handleGlobalKeyDown);
    return () => window.removeEventListener('keydown', handleGlobalKeyDown);
  }, [handleScan]);

  return (
    <div className="pb-24 max-w-md mx-auto relative min-h-screen"> 
      
      <NotificationModal 
        isOpen={notifyModal.isOpen}
        onClose={closeNotify}
        type={notifyModal.type}
        title={notifyModal.title}
        message={notifyModal.message}
      />

      {/* Header Search */}
      <div className="bg-white p-4 rounded-lg shadow-md mb-4 sticky top-0 z-40">
        <h2 className="text-xl font-bold text-center mb-4 text-blue-600">Scan Barang</h2>
        <form onSubmit={handleSearch} className="relative mb-4">
          <input 
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari Nama / SKU..."
            className="w-full pl-10 pr-12 py-3 border rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 outline-none"
          />
          <Search className="absolute left-3 top-3.5 text-black z-10" size={20} />
          
          {/* TOMBOL PASTE / CLEAR */}
          {searchQuery ? (
             <button type="button" onClick={clearSearch} className="absolute right-12 top-2 bg-gray-100 p-1.5 rounded-full text-gray-500 hover:bg-gray-200 transition">
                <X size={16} />
             </button>
          ) : (
             <button type="button" onClick={handlePaste} className="absolute right-12 top-2 bg-gray-100 p-1.5 rounded-full text-gray-500 hover:bg-blue-100 hover:text-blue-600 transition" title="Tempel dari Clipboard">
                <Clipboard size={16} />
             </button>
          )}

          {/* TOMBOL SCANNER */}
          {/* (Dihapus karena sudah ada di search bar di kode sebelumnya? Sesuaikan jika perlu) */}
        </form>
      </div>

      <div className="px-4">
        {isSearching ? (
          <div>
            <div className="flex justify-between items-center mb-2">
               <h3 className="font-bold text-gray-700">Hasil Pencarian ({searchResults.length})</h3>
               <button onClick={clearSearch} className="text-sm text-white rounded-lg bg-gray-800 px-3 py-1">Tutup</button>
            </div>
             
             {loading ? (
                 <div className="text-center py-10 text-gray-500 animate-pulse">Mencari di Database...</div>
             ) : (
                 <div className="space-y-3 pb-20">
                    {searchResults.map((item) => {
                        // --- 1. CEK APAKAH SKU SUDAH ADA DI EXPORT LIST ---
                        const isAlreadyInList = exportList.some(exported => 
                            exported.sku && exported.sku !== '-' && exported.sku === item.sku
                        );

                        return (
                          <div 
                            key={item.id} 
                            onClick={() => handleItemClick(item)} 
                            className={`border p-3 rounded-lg shadow-sm flex justify-between items-center cursor-pointer transition active:scale-[0.98] ${
                                isAlreadyInList ? 'bg-green-50 border-green-200' : 'bg-white hover:bg-blue-50'
                            }`}
                          >
                            <div className="flex-1">
                              <div className="font-bold text-gray-800">{item.item_name}</div>
                              <div className="flex items-center gap-2 mb-1">
                                <div className="text-xs text-gray-500 font-mono bg-gray-100 px-1 rounded">{item.sku}</div>
                                <button 
                                    onClick={(e) => { e.stopPropagation(); handleCopySku(item.sku); }}
                                    className="text-gray-400 hover:text-blue-600 transition p-1"
                                >
                                    {copiedSku === item.sku ? <Check size={14} className="text-green-500" /> : <Copy size={14} />}
                                </button>
                              </div>
                              <div className="flex flex-wrap gap-1">
                                {item.category && <span className="text-[10px] bg-blue-50 text-blue-600 px-1.5 py-0.5 rounded border border-blue-100 font-medium">{item.category}</span>}
                                {item.brand_name && <span className="text-[10px] bg-green-50 text-green-600 px-1.5 py-0.5 rounded border border-blue-100 font-medium">{item.brand_name}</span>}
                                {item.variant_name && <span className="text-[10px] bg-orange-50 text-orange-600 px-1.5 py-0.5 rounded border border-orange-100 font-medium">{item.variant_name}</span>}
                              </div>
                            </div>
                            
                            {/* --- 2. TOMBOL BERUBAH (HIJAU JIKA ADA, ORANGE JIKA BELUM) --- */}
                            {isAlreadyInList ? (
                                <button 
                                    onClick={(e) => e.stopPropagation()} // Stop klik biar gak nambah lagi
                                    className="ml-3 bg-green-100 text-green-600 p-2 rounded-full cursor-default border border-green-200"
                                    title="Sudah Masuk List"
                                >
                                    <Check size={20} />
                                </button>
                            ) : (
                                <button 
                                    onClick={(e) => {
                                        e.stopPropagation(); 
                                        handleAddItem(item); 
                                    }} 
                                    className="ml-3 bg-orange-100 text-orange-600 p-2 rounded-full hover:bg-orange-200"
                                    title="Quick Add"
                                >
                                    <Plus size={20} />
                                </button>
                            )}
                          </div>
                        );
                    })}
                    
                    {searchResults.length === 0 && !loading && (
                        <div className="text-center py-10">
                            <p className="text-gray-400">Produk tidak ditemukan.</p>
                            <button 
                                onClick={() => {
                                    setPendingSku(searchQuery); 
                                    setShowAddModal(true);
                                }}
                                className="mt-4 text-blue-600 font-bold text-sm hover:underline"
                            >
                                + Tambah Produk Baru "{searchQuery}"
                            </button>
                        </div>
                    )}
                 </div>
             )}
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
                    onClick={() => {
                        setIsCameraActive(!isCameraActive);
                        if(!isCameraActive) unlockAudioContext(); 
                    }}
                    className={`flex items-center justify-center gap-2 py-2 rounded-lg font-bold text-white shadow transition text-sm ${
                        isCameraActive ? 'bg-gray-800' : 'bg-green-600'
                    }`}
                >
                    {isCameraActive ? <><CameraOff size={18}/> Matikan</> : <><Camera size={18}/> Hidupkan</>}</button>

                <button 
                    onClick={() => setIsFlashOn(!isFlashOn)}
                    disabled={!isCameraActive}
                    className={`flex items-center justify-center gap-2 py-2 rounded-lg font-bold shadow transition text-sm ${
                        !isCameraActive ? 'bg-gray-300 text-gray-400' : isFlashOn ? 'bg-yellow-400 text-black' : 'bg-white text-gray-800 border'
                    }`}
                >
                    {isFlashOn ? <><ZapOff size={18}/> Flash Off</> : <><Zap size={18}/> Flash On</>}</button>
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

      {/* --- RENDER MODAL KONFIRMASI --- */}
      <ConfirmationModal 
        isOpen={showConfirmModal}
        onClose={() => {
            setShowConfirmModal(false);
            setPendingUpdateProduct(null);
            setExistingProductData(null);
        }}
        onConfirm={executeUpdate}
        title="Update Harga?"
        message={`Produk "${pendingUpdateProduct?.item_name}" sudah ada di list, tapi harganya berbeda.`}
        confirmLabel="Ya, Update" 
        isDanger={false}
        details={
            existingProductData && pendingUpdateProduct ? (
                <div className="grid grid-cols-2 gap-4 text-center">
                    <div className="bg-white p-2 rounded border">
                        <p className="text-xs text-gray-400 mb-1">Harga Lama</p>
                        <p className="font-bold text-gray-600">Rp {existingProductData.price.toLocaleString()}</p>
                    </div>
                    <div className="bg-blue-50 p-2 rounded border border-blue-200">
                        <p className="text-xs text-blue-400 mb-1">Harga Baru</p>
                        <p className="font-bold text-blue-600">Rp {pendingUpdateProduct.price.toLocaleString()}</p>
                    </div>
                </div>
            ) : null
        }
      />

      <ProductModal 
        isOpen={showAddModal}
        onClose={() => { setShowAddModal(false); setProductFormDefault(null); }} 
        product={productFormDefault || { sku: pendingSku }} 
        onSave={handleSaveProduct}
        allProducts={allProducts} 
        setIsScannerActive={setIsCameraActive} 
      />

      <ProductResultModal 
        isOpen={!!productData} 
        onClose={() => setProductData(null)}
        product={productData}
        onAddToExport={handleAddItem}
        allProducts={allProducts} 
        setIsScannerActive={setIsCameraActive} 
        onEditMaster={handleEditMaster} 
      />

    </div>
  );
};

export default ScanPage;