
// import React, { useState, useEffect } from 'react';
// import { supabase } from '../supabaseClient';
// import { useExportList } from '../ExportContext';
// import { useNavigate } from 'react-router-dom';
// import { Search, Plus, X, Camera, CameraOff, Zap, ZapOff, ArrowRight, Copy, Check } from 'lucide-react';
// import { useAuth } from '../AuthProvider';

// // KOMPONEN:
// import Scanner from '../components/Scanner'; 
// import ProductModal from '../components/ProductModal'; 
// import ProductResultModal from '../components/ProductResultModal'; 

// const beepSound = new Audio("data:audio/wav;base64,UklGRl9vT19XQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YU");

// const ScanPage = () => {
//   const { user } = useAuth();
//   const { exportList, addToExportList } = useExportList();
//   const navigate = useNavigate();
  
//   const [loading, setLoading] = useState(false);
  
//   // State Data
//   const [productData, setProductData] = useState(null); 
//   const [pendingSku, setPendingSku] = useState('');     
//   const [showAddModal, setShowAddModal] = useState(false);

//   // State Template Edit
//   const [productFormDefault, setProductFormDefault] = useState(null); 

//   // Database Lokal
//   const [allProducts, setAllProducts] = useState([]);

//   // Scanner State
//   const [isCameraActive, setIsCameraActive] = useState(() => {
//     return localStorage.getItem('camera_active') === 'false' ? false : true;
//   });
//   const [isFlashOn, setIsFlashOn] = useState(false);

//   useEffect(() => {
//     localStorage.setItem('camera_active', isCameraActive);
//   }, [isCameraActive]);

//   // --- 1. FETCH ALL PRODUCTS ---
//   useEffect(() => {
//     const fetchAllProducts = async () => {
//       try {
//         const { data, error } = await supabase.from('products').select('*');
//         if (error) throw error;
//         if (data) setAllProducts(data);
//       } catch (error) {
//         console.error("Error fetching all products:", error.message);
//       }
//     };

//     if (user) {
//         fetchAllProducts();
//         const interval = setInterval(fetchAllProducts, 5000);
//         return () => clearInterval(interval);
//     }
//   }, [user]);

//   // Search State
//   const [searchQuery, setSearchQuery] = useState('');
//   const [searchResults, setSearchResults] = useState([]);
//   const [isSearching, setIsSearching] = useState(false);
//   const [copiedSku, setCopiedSku] = useState(null);

//   const playBeep = () => { beepSound.play().catch(e => console.log(e)); };

//   const handleCopySku = async (sku) => {
//     if (!sku || sku === '-') return;
//     try {
//       await navigator.clipboard.writeText(sku);
//       setCopiedSku(sku);
//       setTimeout(() => setCopiedSku(null), 2000);
//     } catch (err) { console.error('Copy Error:', err); }
//   };

//   // --- CEK DUPLIKAT SEBELUM ADD ---
//   const handleAddItem = (product) => {
//     // Cek apakah SKU sudah ada di exportList?
//     const isDuplicate = exportList.some((item) => item.sku === product.sku);
    
//     if (isDuplicate) {
//       alert(`⚠️ Produk "${product.item_name}" SUDAH ADA di list!`);
//       return; 
//     }
    
//     addToExportList(product);
//     setProductData(null); 
//     clearSearch();
//   };

//   // --- FUNGSI PENCARIAN INTI ---
//   const executeSearch = async (queryText) => {
//       const query = queryText.trim();
//       if (!query) return;

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
//   };

//   // --- LOGIKA SCAN ---
//   const handleScan = async (sku) => {
//     playBeep();
//     setSearchQuery(sku);
//     await executeSearch(sku);
//   };

//   // --- LOGIKA SEARCH MANUAL ---
//   const handleSearch = async (e) => {
//       e.preventDefault();
//       await executeSearch(searchQuery);
//   };

//   const clearSearch = () => { setSearchQuery(''); setSearchResults([]); setIsSearching(false); };
//   const handleItemClick = (item) => { setProductData(item); };

//   // --- LOGIKA SIMPAN ---
//   const handleSaveProduct = async (formData, isVariantMode = false) => {
//     if(!user) return alert("Sesi habis");
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
//         alert('Gagal menyimpan: ' + error.message);
//     } else {
//         alert(isUpdate ? '✅ Produk Berhasil Diupdate!' : '✅ Produk Baru Ditambahkan!');
//         setShowAddModal(false); 
//         setProductFormDefault(null); 

//         if (data) {
//             if (isUpdate) {
//                 setAllProducts(prev => prev.map(p => p.id === data.id ? data : p));
//                 setSearchResults(prev => prev.map(p => p.id === data.id ? data : p));
//             } else {
//                 setAllProducts(prev => [...prev, data]);
//                 setSearchResults(prev => [data, ...prev]);
//             }
//         }
//     }
//   };

//   const handleEditMaster = (productToEdit) => {
//       setProductData(null); 
//       setProductFormDefault(productToEdit); 
//       setShowAddModal(true); 
//   };

//   return (
//     <div className="pb-24 max-w-md mx-auto relative min-h-screen"> 
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
//                             {item.variant_name && <span className="text-[10px] bg-orange-50 text-orange-600 px-1.5 py-0.5 rounded border border-orange-100 font-medium">{item.variant_name}</span>}
//                           </div>
//                         </div>
//                         <button 
//                             onClick={(e) => {
//                                 e.stopPropagation(); 
//                                 // --- UPDATE: Pakai handleAddItem biar dicek duplikat ---
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
//                     onClick={() => setIsCameraActive(!isCameraActive)}
//                     className={`flex items-center justify-center gap-2 py-2 rounded-lg font-bold text-white shadow transition text-sm ${
//                         isCameraActive ? 'bg-gray-800' : 'bg-green-600'
//                     }`}
//                 >
//                     {isCameraActive ? <><CameraOff size={18}/> Matikan</> : <><Camera size={18}/> Hidupkan</>}
//                 </button>

//                 <button 
//                     onClick={() => setIsFlashOn(!isFlashOn)}
//                     disabled={!isCameraActive}
//                     className={`flex items-center justify-center gap-2 py-2 rounded-lg font-bold shadow transition text-sm ${
//                         !isCameraActive ? 'bg-gray-300 text-gray-400' : isFlashOn ? 'bg-yellow-400 text-black' : 'bg-white text-gray-800 border'
//                     }`}
//                 >
//                     {isFlashOn ? <><ZapOff size={18}/> Flash Off</> : <><Zap size={18}/> Flash On</>}
//                 </button>
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

///=============================================================================================================


// import React, { useState, useEffect } from 'react';
// import { supabase } from '../supabaseClient';
// import { useExportList } from '../ExportContext';
// import { useNavigate } from 'react-router-dom';
// import { Search, Plus, X, Camera, CameraOff, Zap, ZapOff, ArrowRight, Copy, Check } from 'lucide-react';
// import { useAuth } from '../AuthProvider';

// // KOMPONEN:
// import Scanner from '../components/Scanner'; 
// import ProductModal from '../components/ProductModal'; 
// import ProductResultModal from '../components/ProductResultModal'; 

// const beepSound = new Audio("data:audio/wav;base64,UklGRl9vT19XQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YU");

// const ScanPage = () => {
//   const { user } = useAuth();
//   // 1. AMBIL updateExportItem DARI CONTEXT
//   const { exportList, addToExportList, updateExportItem } = useExportList();
//   const navigate = useNavigate();
  
//   const [loading, setLoading] = useState(false);
  
//   // State Data
//   const [productData, setProductData] = useState(null); 
//   const [pendingSku, setPendingSku] = useState('');     
//   const [showAddModal, setShowAddModal] = useState(false);

//   // State Template Edit
//   const [productFormDefault, setProductFormDefault] = useState(null); 

//   // Database Lokal
//   const [allProducts, setAllProducts] = useState([]);

//   // Scanner State
//   const [isCameraActive, setIsCameraActive] = useState(() => {
//     return localStorage.getItem('camera_active') === 'false' ? false : true;
//   });
//   const [isFlashOn, setIsFlashOn] = useState(false);

//   useEffect(() => {
//     localStorage.setItem('camera_active', isCameraActive);
//   }, [isCameraActive]);

//   // --- 1. FETCH ALL PRODUCTS ---
//   useEffect(() => {
//     const fetchAllProducts = async () => {
//       try {
//         const { data, error } = await supabase.from('products').select('*');
//         if (error) throw error;
//         if (data) setAllProducts(data);
//       } catch (error) {
//         console.error("Error fetching all products:", error.message);
//       }
//     };

//     if (user) {
//         fetchAllProducts();
//         const interval = setInterval(fetchAllProducts, 5000);
//         return () => clearInterval(interval);
//     }
//   }, [user]);

//   // Search State
//   const [searchQuery, setSearchQuery] = useState('');
//   const [searchResults, setSearchResults] = useState([]);
//   const [isSearching, setIsSearching] = useState(false);
//   const [copiedSku, setCopiedSku] = useState(null);

//   const playBeep = () => { beepSound.play().catch(e => console.log(e)); };

//   const handleCopySku = async (sku) => {
//     if (!sku || sku === '-') return;
//     try {
//       await navigator.clipboard.writeText(sku);
//       setCopiedSku(sku);
//       setTimeout(() => setCopiedSku(null), 2000);
//     } catch (err) { console.error('Copy Error:', err); }
//   };

//   // --- 2. UPDATE LOGIKA ADD ITEM ---
//   const handleAddItem = (product) => {
//     // Cek apakah SKU sudah ada di exportList?
//     const existingItem = exportList.find((item) => item.sku === product.sku);
    
//     if (existingItem) {
//       // Cek apakah harganya berbeda?
//       const isPriceChanged = 
//           existingItem.price !== product.price || 
//           existingItem.wholesale_price !== product.wholesale_price;

//       if (isPriceChanged) {
//           // Jika harga beda, tawarkan update
//           const confirmUpdate = window.confirm(
//               `⚠️ Produk "${product.item_name}" SUDAH ADA di list.\n\nHarga Lama: ${existingItem.price}\nHarga Baru: ${product.price}\n\nApakah Anda ingin mengupdate harganya?`
//           );

//           if (confirmUpdate) {
//               updateExportItem(product); // <--- Panggil fungsi update
//               alert("✅ Harga berhasil diperbarui!");
//               setProductData(null); 
//               clearSearch();
//           }
//       } else {
//           // Jika harga sama persis, anggap duplikat dan tolak
//           alert(`⚠️ Produk "${product.item_name}" SUDAH ADA di list dengan harga yang sama!`);
//       }
//       return; 
//     }
    
//     // Jika belum ada, tambahkan baru
//     addToExportList(product);
//     setProductData(null); 
//     clearSearch();
//   };

//   // --- FUNGSI PENCARIAN INTI ---
//   const executeSearch = async (queryText) => {
//       const query = queryText.trim();
//       if (!query) return;

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
//   };

//   // --- LOGIKA SCAN ---
//   const handleScan = async (sku) => {
//     playBeep();
//     setSearchQuery(sku);
//     await executeSearch(sku);
//   };

//   // --- LOGIKA SEARCH MANUAL ---
//   const handleSearch = async (e) => {
//       e.preventDefault();
//       await executeSearch(searchQuery);
//   };

//   const clearSearch = () => { setSearchQuery(''); setSearchResults([]); setIsSearching(false); };
//   const handleItemClick = (item) => { setProductData(item); };

//   // --- LOGIKA SIMPAN ---
//   const handleSaveProduct = async (formData, isVariantMode = false) => {
//     if(!user) return alert("Sesi habis");
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
//         alert('Gagal menyimpan: ' + error.message);
//     } else {
//         alert(isUpdate ? '✅ Produk Berhasil Diupdate!' : '✅ Produk Baru Ditambahkan!');
//         setShowAddModal(false); 
//         setProductFormDefault(null); 

//         if (data) {
//             if (isUpdate) {
//                 setAllProducts(prev => prev.map(p => p.id === data.id ? data : p));
//                 setSearchResults(prev => prev.map(p => p.id === data.id ? data : p));
//             } else {
//                 setAllProducts(prev => [...prev, data]);
//                 setSearchResults(prev => [data, ...prev]);
//             }
//         }
//     }
//   };

//   const handleEditMaster = (productToEdit) => {
//       setProductData(null); 
//       setProductFormDefault(productToEdit); 
//       setShowAddModal(true); 
//   };

//   return (
//     <div className="pb-24 max-w-md mx-auto relative min-h-screen"> 
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
//                             {item.variant_name && <span className="text-[10px] bg-orange-50 text-orange-600 px-1.5 py-0.5 rounded border border-orange-100 font-medium">{item.variant_name}</span>}
//                           </div>
//                         </div>
//                         <button 
//                             onClick={(e) => {
//                                 e.stopPropagation(); 
//                                 // --- Pakai handleAddItem biar dicek duplikat ---
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
//                     onClick={() => setIsCameraActive(!isCameraActive)}
//                     className={`flex items-center justify-center gap-2 py-2 rounded-lg font-bold text-white shadow transition text-sm ${
//                         isCameraActive ? 'bg-gray-800' : 'bg-green-600'
//                     }`}
//                 >
//                     {isCameraActive ? <><CameraOff size={18}/> Matikan</> : <><Camera size={18}/> Hidupkan</>}
//                 </button>

//                 <button 
//                     onClick={() => setIsFlashOn(!isFlashOn)}
//                     disabled={!isCameraActive}
//                     className={`flex items-center justify-center gap-2 py-2 rounded-lg font-bold shadow transition text-sm ${
//                         !isCameraActive ? 'bg-gray-300 text-gray-400' : isFlashOn ? 'bg-yellow-400 text-black' : 'bg-white text-gray-800 border'
//                     }`}
//                 >
//                     {isFlashOn ? <><ZapOff size={18}/> Flash Off</> : <><Zap size={18}/> Flash On</>}
//                 </button>
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



//===================================================================================


import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { useExportList } from '../ExportContext';
import { useNavigate } from 'react-router-dom';
import { Search, Plus, X, Camera, CameraOff, Zap, ZapOff, ArrowRight, Copy, Check } from 'lucide-react';
import { useAuth } from '../AuthProvider';

// KOMPONEN:
import Scanner from '../components/Scanner'; 
import ProductModal from '../components/ProductModal'; 
import ProductResultModal from '../components/ProductResultModal';
import ConfirmationModal from '../components/ConfirmationModal'; 
import NotificationModal from '../components/NotificationModal'; // 1. IMPORT MODAL NOTIFIKASI

// AUDIO BEEP
const beepSound = new Audio("data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVDWHZ+gImbfnOEiId9YE9KZYCNmn1tS1R0gIqWemhLVXOAhpV6aUpVdICGlXppSlV0gIaVemlKVXSxhpV6aUpVc4CGlXppSlVzgIaVemlKVXOAhpV6aUpVc4CGlXppSlVzgIaVemlKVXOAhpV6aUpVc4CGlXppSlVzgIaVemlKVXOAhpV6aUpVc4CGlXppSlVzgIaVemlKVXOAhpV6aUpVc4CGlXppSlVzgIaVemlKVXOAhpV6aUpVc4CGlXppSlVzgIaVemlKVXOAhpV6aUpVc4CGlXppSlVzgIaVemlKVXOAhpV6aUpVc4CGlXppSlVzgIaVemlKVXOAhpV6aUpVc4CGlXppSlVzgIaVemlKVXOAhpV6aUpVc4CGlXppSlVzgIaVemlKVXOAhpV6aUpVc4CGlXppSlVzgIaVemlKVXOAhpV6aUpVc4CGlXppSlVzgIaVemlKVXOAhpV6aUpVc4CGlXppSlVzgIaVemlKVXOAhpV6aUpVc4CGlXppSlVzgIaVemlKVXOAhpV6aUpVc4CGlXppSlVzgIaVemlKVXOAhpV6aUpVc4CGlXppSlVzgIaVemlKVXOAhpV6aUpVc4CGlXppSlVzgIaVemlKVXOAhpV6aUpVc4CGlXppSlVzgIaVemlKVXOAhpV6aUpVc4CGlXppSlVzgIaVemlKVXOAhpV6aUpVc4CGlXppSlVzgIaVemlKVXOAhpV6aUpVc4CGlXppSlVzgIaVemlKVXOAhpV6aUpVc4CGlXppSlVzgIaVemlKVXOAhpV6aUpVc4CGlXppSlVzgIaVemlKVXOAhpV6aUpVc4CGlXppSlVzgIaVemlKVXOAhpV6aUpVc4CGlXppSlVzgIaVemlKVXOAhpV6aUpVc4CGlXppSlVzgIaVemlKVXOAhpV6aUpVc4CGlXppSlVzgIaVemlKVXOAhpV6aUpVc4CGlXppSlVzgIaVemlKVXOAhpV6aUpVc4CGlXppSlVzgIaVemlKVXOAhpV6aUpVc4CGlXppSlVzgIaVemlKVXOAhpV6aUpVc4CGlXppSlVzgIaVemlKVXOAhpV6aUpVc4CGlXppSlVzgIaVemlKVXOAhpV6aUpVc4CGlXppSlVzgIaVemlKVXOAhpV6aUpVc4CGlXppSlVzgIaVemlKVXOAhpV6aUpVc4CGlXppSlVzgIaVemlKVXOAhpV6aUpVc4CGlXppSlVzgIaVemlKVXOAhpV6aUpVc4CGlXppSlVzgIaVemlKVXOAhpV6aUpVc4CGlXppSlVzgIaVemlKVXOAhpV6aUpVc4CGlXppSlVzgIaVemlKVXOAhpV6aUpVc4CGlXppSlVzgIaVemlKVXOAhpV6aUpVc4CGlXppSlVzgIaVemlKVXOAhpV6aUpVc4CGlXppSlVzgIaVemlKVXOAhpV6aUpVc4CGlXppSlVzgIaVemlKVXOAhpV6aUpVc4CGlXppSlVzgIaVemlKVXOAhpV6aUpVc4CGlXppSlVzgIaVemlKVXOAhpV6aUpVc4CGlXppSlVzgIaVemlKVXOAhpV6aUpVc4CGlXppSlVzgIaVemlKVXOAhpV6aUpVc4CGlXppSlVzgIaVemlKVXOAhpV6aUpVc4CGlXppSlVzgIaVemlKVXOAhpV6aUpVc4CGlXppSlVzgIaVemlKVXOAhpV6aUpVc4CGlXppSlVzgIaVemlKVXOAhpV6aUpVc4CGlXppSlVzgIaVemlKVXOAhpV6aUpVc4CGlXppSlVzgIaVemlKVXOAhpV6aUpVc4CGlXppSlVzgIaVemlKVXOAhpV6aUpVc4CGlXppSlVzgIaVemlKVXOAhpV6aUpVc4CGlXppSlVzgIaVemlKVXOAhpV6aUpVc4CGlXppSlVzgIaVemlKVXOAhpV6aUpVc4CGlXppSlVzgIaVemlKVXOAhpV6aUpVc4CGlXppSlVzgIaVemlKVXOAhpV6aUpVc4CGlXppSlVzgIaVemlKVXOAhpV6aUpVc4CGlXppSlVzgIaVemlKVXOAhpV6aUpVc4CGlXppSlVzgIaVemlKVXOAhpV6aUpVc4CGlXppSlVzgIaVemlKVXOAhpV6aUpVc4CGlXppSlVzgIaVemlKVXOAhpV6aUpVc4CGlXppSlVzgIaVemlKVXOAhpV6aUpVc4CGlXppSlVzgIaVemlKVXOAhpV6aUpVc4CGlXppSlVzgIaVemlKVXOAhpV6aUpVc4CGlXppSlVzgIaVemlKVXOAhpV6aUpVc4CGlXppSlVzgIaVemlKVXOAhpV6aUpVc4CGlXppSlVzgIaVemlKVXOAhpV6aUpVc4CGlXppSlVzgIaVemlKVXOAhpV6aUpVc4CGlXppSlVzgIaVemlKVXOAhpV6aUpVc4CGlXppSlVzgIaVemlKVXOAhpV6aUpVc4CGlXppSlVzgIaVemlKVXOAhpV6aUpVc4CGlXppSlVzgIaVemlKVXOAhpV6aUpVc4CGlXppSlVzgIaVemlKVXOAhpV6aUpVc4CGlXppSlVzgIaVemlKVXOAhpV6aUpVc4CGlXppSlVzgIaVemlKVXOAhpV6aUpVc4CGlXppSlVzgIaVemlKVXOAhpV6aUpVc4CGlXppSlVzgIaVemlKVXOAhpV6aUpVc4CGlXppSlVzgIaVemlKVXOAhpV6aUpVc4CGlXppSlVzgIaVemlKVXOAhpV6aUpVc4CGlXppSlVzgIaVemlKVXOAhpV6aUpVc4CGlXppSlVzgIaVemlKVXOAhpV6aUpVc4CGlXppSlVzgIaVemlKVXOAhpV6aUpVc4CGlXppSlVzgIaVemlKVXOAhpV6aUpVc4CGlXppSlVzgIaVemlKVXOAhpV6aUpVc4CGlXppSlVzgIaVemlKVXOAhpV6aUpVc4CGlXppSlVzgIaVemlKVXOAhpV6aUpVc4CGlXppSlVzgIaVemlKVXOAhpV6aUpVc4CGlXppSlVzgIaVemlKVXOAhpV6aUpVc4CGlXppSlVzgIaVemlKVXOAhpV6aUpVc4CGlXppSlVzgIaVemlKVXOAhpV6aUpVc4CGlXppSlVzgIaVemlKVXOAhpV6aUpVc4CGlXppSlVzgIaVemlKVXOAhpV6aUpVc4CGlXppSlVzgIaVemlKVXOAhpV6aUpVc4CGlXppSlVzgIaVemlKVXOAhpV6aUpVc4CGlXppSlVzgIaVemlKVXOAhpV6aUpVc4CGlXppSlVzgIaVemlKVXOAhpV6aUpVc4CGlXppSlVzgIaVemlKVXOAhpV6aUpVc4CGlXppSlVzgIaVemlKVXOAhpV6aUpVc4CGlXppSlVzgIaVemlKVXOAhpV6aUpVc4CGlXppSlVzgIaVemlKVXOAhpV6aUpVc4CGlXppSlVzgIaVemlKVXOAhpV6aUpVc4CGlXppSlVzgIaVemlKVXOAhpV6aUpVc4CGlXppSlVzgIaVemlKVXOAhpV6aUpVc4CGlXppSlVzgIaVemlKVXOAhpV6aUpVc4CGlXppSlVzgIaVemlKVXOAhpV6aUpVc4CGlXppSlVzgIaVemlKVXOAhpV6aUpVc4CGlXppSlVzgIaVemlKVXOAhpV6aUpVc4CGlXppSlVzgIaVemlKVXOAhpV6aUpVc4CGlXppSlVzgIaVemlKVXOAhpV6aUpVc4CGlXppSlVzgIaVemlKVXOAhpV6aUpVc4CGlXppSlVzgIaVemlKVXOAhpV6aUpVc4CGlXppSlVzgIaVemlKVXOAhpV6aUpVc4CGlXppSlVzgIaVemlKVXOAhpV6aUpVc4CGlXppSlVzgIaVemlKVXOAhpV6aUpVc4CGlXppSlVzgIaVemlKVXOAhpV6aUpVc4CGlXppSlVzgIaVemlKVXOAhpV6aUpVc4CGlXppSlVzgIaVemlKVXOAhpV6aUpVc4CGlXppSlVzgIaVemlKVXOAhpV6aUpVc4CGlXppSlVzgIaVemlKVXOAhpV6aUpVc4CGlXppSlVzgIaVemlKVXOAhpV6aUpVc4CGlXppSlVzgIaVemlKVXOAhpV6aUpVc4CGlXppSlVzgIaVemlKVXOAhpV6aUpVc4CGlXppSlVzgIaVemlKVXOAhpV6aUpVc4CGlXppSlVzgIaVemlKVXOAhpV6aUpVc4CGlXppSlVzgIaVemlKVXOAhpV6aUpVc4CGlXppSlVzgIaVemlKVXOAhpV6aUpVc4CGlXppSlVzgIaVemlKVXOAhpV6aUpVc4CGlXppSlVzgIaVemlKVXOAhpV6aUpVc4CGlXppSlVzgIaVemlKVXOAhpV6aUpVc4CGlXppSlVzgIaVemlKVXOAhpV6aUpVc4CGlXppSlVzgIaVemlKVXOAhpV6aUpVc4CGlXppSlVzgIaVemlKVXOAhpV6aUpVc4CGlXppSlVzgIaVemlKVXOAhpV6aUpVc4CGlXppSlVzgIaVemlKVXOAhpV6aUpVc4CGlXppSlVzgIaVemlKVXOAhpV6aUpVc4CGlXppSlVzgIaVemlKVXOAhpV6aUpVc4CGlXppSlVzgIaVemlKVXOAhpV6aUpVc4CGlXppSlVzgIaVemlKVXOAhpV6aUpVc4CGlXppSlVzgIaVemlKVXOAhpV6aUpVc4CGlXppSlVzgIaVemlKVXOAhpV6aUpVc4CGlXppSlVzgIaVemlKVXOAhpV6aUpVc4CGlXppSlVzgIaVemlKVXOAhpV6aUpVc4CGlXppSlVzgIaVemlKVXOAhpV6aUpVc4CGlXppSlVzgIaVemlKVXOAhpV6aUpVc4CGlXppSlVzgIaVemlKVXOAhpV6aUpVc4CGlXppSlVzgIaVemlKVXOAhpV6aUpVc4CGlXppSlVzgIaVemlKVXOAhpV6aUpVc4CGlXppSlVzgIaVemlKVXOAhpV6aUpVc4CGlXppSlVzgIaVemlKVXOAhpV6aUpVc4CGlXppSlVzgIaVemlKVXOAhpV6aUpVc4CGlXppSlVzgIaVemlKVXOAhpV6aUpVc4CGlXppSlVzgIaVemlKVXOAhpV6aUpVc4CGlXppSlVzgIaVemlKVXOAhpV6aUpVc4CGlXppSlVzgIaVemlKVXOAhpV6aUpVc4CGlXppSlVzgIaVemlKVXOAhpV6aUpVc4CGlXppSlVzgIaVemlKVXOAhpV6aUpVc4CGlXppSlVzgIaVemlKVXOAhpV6aUpVc4CGlXppSlVzgIaVemlKVXOAhpV6aUpVc4CGlXppSlVzgIaVemlKVXOAhpV6aUpVc4CGlXppSlVzgIaVemlKVXOAhpV6aUpVc4CGlXppSlVzgIaVemlKVXOAhpV6aUpVc4CGlXppSlVzgIaVemlKVXOAhpV6aUpVc4CGlXppSlVzgIaVemlKVXOAhpV6aUpVc4CGlXppSlVzgIaVemlKVXOAhpV6aUpVc4CGlXppSlVzgIaVemlKVXOAhpV6aUpVc4CGlXppSlVzgIaVemlKVXOAhpV6aUpVc4CGlXppSlVzgIaVemlKVXOAhpV6aUpVc4CGlXppSlVzgIaVemlKVXOAhpV6aUpVc4CGlXppSlVzgIaVemlKVXOAhpV6aUpVc4CGl");

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

  // --- STATE MODAL KONFIRMASI (CONFIRMATION) ---
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [pendingUpdateProduct, setPendingUpdateProduct] = useState(null);
  const [existingProductData, setExistingProductData] = useState(null);

  // --- 2. STATE MODAL NOTIFIKASI (ALERT REPLACEMENT) ---
  const [notifyModal, setNotifyModal] = useState({
    isOpen: false,
    type: 'success', // success, error, info
    title: '',
    message: ''
  });

  // HELPER UNTUK MEMUNCULKAN NOTIFIKASI
  const showNotify = (type, title, message) => {
    setNotifyModal({ isOpen: true, type, title, message });
  };

  const closeNotify = () => {
    setNotifyModal({ ...notifyModal, isOpen: false });
  };

  // Scanner State
  const [isCameraActive, setIsCameraActive] = useState(() => {
    return localStorage.getItem('camera_active') === 'false' ? false : true;
  });
  const [isFlashOn, setIsFlashOn] = useState(false);

  useEffect(() => {
    localStorage.setItem('camera_active', isCameraActive);
  }, [isCameraActive]);

  // --- FETCH ALL PRODUCTS ---
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
        const interval = setInterval(fetchAllProducts, 5000);
        return () => clearInterval(interval);
    }
  }, [user]);

  // Search State
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [copiedSku, setCopiedSku] = useState(null);

  // --- PLAY BEEP FUNCTION ---
  const playBeep = () => { 
      beepSound.currentTime = 0; 
      beepSound.play().catch(e => console.log("Gagal memutar audio:", e)); 
  };

  const handleCopySku = async (sku) => {
    if (!sku || sku === '-') return;
    try {
      await navigator.clipboard.writeText(sku);
      setCopiedSku(sku);
      setTimeout(() => setCopiedSku(null), 2000);
    } catch (err) { console.error('Copy Error:', err); }
  };

  // --- 3. UPDATE LOGIKA ADD ITEM ---
  const handleAddItem = (product) => {
    const existingItem = exportList.find((item) => item.sku === product.sku);
    
    if (existingItem) {
      const isPriceChanged = 
          existingItem.price !== product.price || 
          existingItem.wholesale_price !== product.wholesale_price;

      if (isPriceChanged) {
          // Buka Modal Konfirmasi
          setExistingProductData(existingItem); 
          setPendingUpdateProduct(product);     
          setShowConfirmModal(true);            
      } else {
          // Ganti Alert Browser dengan Modal Notifikasi
          showNotify('info', 'Produk Duplikat', `Produk "${product.item_name}" sudah ada di list dengan harga yang sama!`);
      }
      return; 
    }
    
    addToExportList(product);
    setProductData(null); 
    clearSearch();
  };

  // --- FUNGSI EKSEKUSI UPDATE ---
  const executeUpdate = () => {
      if (pendingUpdateProduct) {
          updateExportItem(pendingUpdateProduct);
          // Ganti Alert Browser dengan Modal Notifikasi
          showNotify('success', 'Berhasil Update', 'Harga produk dalam list berhasil diperbarui!');
          
          setShowConfirmModal(false);
          setPendingUpdateProduct(null);
          setExistingProductData(null);
          setProductData(null); 
          clearSearch();
      }
  };

  // --- FUNGSI PENCARIAN INTI ---
  const executeSearch = async (queryText) => {
      const query = queryText.trim();
      if (!query) return;

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
  };

  const handleScan = async (sku) => {
    playBeep();
    setSearchQuery(sku);
    await executeSearch(sku);
  };

  const handleSearch = async (e) => {
      e.preventDefault();
      await executeSearch(searchQuery);
  };

  const clearSearch = () => { setSearchQuery(''); setSearchResults([]); setIsSearching(false); };
  const handleItemClick = (item) => { setProductData(item); };

  // --- LOGIKA SIMPAN ---
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
        // Ganti Alert Error
        showNotify('error', 'Gagal Menyimpan', error.message);
    } else {
        // Ganti Alert Sukses
        showNotify('success', 'Berhasil', isUpdate ? 'Produk berhasil diperbarui!' : 'Produk baru berhasil ditambahkan!');
        
        setShowAddModal(false); 
        setProductFormDefault(null); 

        if (data) {
            if (isUpdate) {
                setAllProducts(prev => prev.map(p => p.id === data.id ? data : p));
                setSearchResults(prev => prev.map(p => p.id === data.id ? data : p));
            } else {
                setAllProducts(prev => [...prev, data]);
                setSearchResults(prev => [data, ...prev]);
            }
        }
    }
  };

  const handleEditMaster = (productToEdit) => {
      setProductData(null); 
      setProductFormDefault(productToEdit); 
      setShowAddModal(true); 
  };

  return (
    <div className="pb-24 max-w-md mx-auto relative min-h-screen"> 
      
      {/* --- RENDER NOTIFICATION MODAL (Pengganti Alert) --- */}
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
            <div className="absolute right-3 top-2 flex items-center gap-2">
                 <button type="button" onClick={clearSearch} className="text-gray-400 p-1"><X size={20} /></button>
                 <button type="submit" className="bg-blue-600 text-white p-1.5 rounded-md"><Search size={16}/></button>
             </div>
          )}
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
                    {searchResults.map((item) => (
                      <div 
                        key={item.id} 
                        onClick={() => handleItemClick(item)} 
                        className="border p-3 rounded-lg shadow-sm flex justify-between items-center bg-white cursor-pointer hover:bg-blue-50 transition active:scale-[0.98]"
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
                            {item.variant_name && <span className="text-[10px] bg-orange-50 text-orange-600 px-1.5 py-0.5 rounded border border-orange-100 font-medium">{item.variant_name}</span>}
                          </div>
                        </div>
                        <button 
                            onClick={(e) => {
                                e.stopPropagation(); 
                                // Pakai handleAddItem
                                handleAddItem(item); 
                            }} 
                            className="ml-3 bg-orange-100 text-orange-600 p-2 rounded-full hover:bg-orange-200"
                            title="Quick Add"
                        >
                            <Plus size={20} />
                        </button>
                      </div>
                    ))}
                    
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
                    onClick={() => setIsCameraActive(!isCameraActive)}
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

      {/* --- RENDER MODAL KONFIRMASI (Untuk Update Harga) --- */}
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