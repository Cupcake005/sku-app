


// import React, { useState, useEffect, useRef } from 'react';
// import { useSearchParams } from 'react-router-dom';
// import { supabase } from '../supabaseClient';
// import { useAuth } from '../AuthProvider'; 
// import Scanner from '../components/Scanner';
// import ProductModal from '../components/ProductModal';
// import { Search, Trash2, Edit, ScanLine, Download, Upload, Plus, ArrowUp, X, RefreshCw, ChevronLeft, ChevronRight } from 'lucide-react';

// // IMPORT MODALS
// import ConfirmationModal from '../components/ConfirmationModal'; 
// import NotificationModal from '../components/NotificationModal'; 

// const ManagePage = () => {
//   const { user } = useAuth(); 
//   const [searchParams, setSearchParams] = useSearchParams();
  
//   // State Data
//   const [products, setProducts] = useState([]); // Data yang ditampilkan (max 100)
//   const [totalProducts, setTotalProducts] = useState(0); // Total semua data di DB
//   const [loading, setLoading] = useState(false);
  
//   // State Pencarian
//   const [searchQuery, setSearchQuery] = useState('');
//   const [isSearching, setIsSearching] = useState(false);

//   // --- STATE MODAL & SCANNER ---
//   const [isModalOpen, setIsModalOpen] = useState(false);
//   const [currentProduct, setCurrentProduct] = useState(null); 
//   const [showScanner, setShowScanner] = useState(false);
//   const fileInputRef = useRef(null);

//   // --- STATE KONFIGURASI MODAL ---
//   const [modalConfig, setModalConfig] = useState({ isOpen: false, type: null, title: '', message: '', data: null, confirmLabel: '', isDanger: false });
//   const [notifyModal, setNotifyModal] = useState({ isOpen: false, type: 'success', title: '', message: '' });

//   // Helper Notifikasi
//   const showNotify = (type, title, message) => {
//     setNotifyModal({ isOpen: true, type, title, message });
//   };
//   const closeNotify = () => {
//     setNotifyModal({ ...notifyModal, isOpen: false });
//   };

//   // --- 1. INIT LOAD (Hanya 100 Data Teratas + Hitung Total) ---
//   useEffect(() => {
//     if (user) {
//         fetchInitialData();
//     }
//     const skuFromUrl = searchParams.get('sku');
//     if (skuFromUrl) {
//       setCurrentProduct({ sku: skuFromUrl }); 
//       setIsModalOpen(true);
//     }
//   }, [searchParams, user]);

//   const fetchInitialData = async () => {
//     if (!user) return;
//     setLoading(true);
//     try {
//         // 1. Ambil 100 data terbaru
//         const { data, error } = await supabase
//             .from('products')
//             .select('*')
//             .eq('user_id', user.id)
//             .order('created_at', { ascending: false })
//             .limit(50); // Batasi 100 agar ringan

//         if (error) throw error;
//         setProducts(data || []);

//         // 2. Hitung Total Semua Data (Tanpa download isinya, biar cepat)
//         const { count, error: countError } = await supabase
//             .from('products')
//             .select('*', { count: 'exact', head: true }) // head: true artinya cuma hitung jumlah
//             .eq('user_id', user.id);

//         if (!countError) setTotalProducts(count || 0);

//         setIsSearching(false); 
//     } catch (error) {
//         console.error("Error fetching data:", error);
//         showNotify('error', 'Gagal Load Data', error.message);
//     } finally {
//         setLoading(false);
//     }
//   };

//   // --- 2. LOGIKA PENCARIAN AKURAT (Server-Side) ---
//   const handleSearch = async (e) => {
//       e?.preventDefault();
//       const query = searchQuery.trim();
      
//       if (!query) {
//           fetchInitialData(); // Reset jika kosong
//           return;
//       }

//       setLoading(true);
//       setIsSearching(true);

//       try {
//         // Cari di server biar akurat (meskipun data belum terload di halaman 1)
//         const { data, error } = await supabase
//           .from('products')
//           .select('*')
//           .eq('user_id', user.id)
//           .or(`item_name.ilike.%${query}%,sku.ilike.%${query}%`) // Case-insensitive search
//           .limit(100); // Batasi hasil pencarian max 100

//         if (error) throw error;
//         setProducts(data || []);
//         setTotalProducts(data.length); // Update total sesuai hasil pencarian
//       } catch (error) {
//         showNotify('error', 'Gagal Mencari', error.message);
//       } finally {
//         setLoading(false);
//       }
//   };

//   // --- 3. EXPORT SEMUA DATA (Background Process) ---
//   const handleExport = async () => { 
//       setLoading(true); 
//       try {
//         let allData = [];
//         let from = 0;
//         const step = 1000; 
//         let more = true;

//         // Loop fetching sampai data habis
//         while (more) {
//             const { data, error } = await supabase
//                 .from('products')
//                 .select('*')
//                 .eq('user_id', user.id) 
//                 .order('created_at', { ascending: false })
//                 .range(from, from + step - 1);

//             if (error) throw error;

//             if (data && data.length > 0) {
//                 allData = [...allData, ...data];
//                 from += step;
//                 if (data.length < step) more = false; 
//             } else {
//                 more = false;
//             }
//         }

//         if (allData.length === 0) {
//             showNotify('info', 'Data Kosong', 'Tidak ada data untuk diexport.');
//             return;
//         }
      
//         const header = "Category,SKU,Items Name (Do Not Edit),Brand Name,Variant name,Basic - Price,Wholesale Price";
//         const rows = allData.map(item => {
//             const category = `"${item.category || ''}"`;
//             const sku = `"${item.sku || ''}"`; 
//             const name = `"${(item.item_name || '').replace(/"/g, '""')}"`;
//             const brand = `"${item.brand_name || ''}"`;
//             const variant = `"${item.variant_name || ''}"`;
//             const price = item.price || 0;
//             const wholesale = item.wholesale_price || 0;
//             return `${category},${sku},${name},${brand},${variant},${price},${wholesale}`;
//         });

//         const csvContent = [header, ...rows].join("\n");
//         const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
//         const link = document.createElement("a");
//         const url = URL.createObjectURL(blob);
//         link.setAttribute("href", url);
//         link.setAttribute("download", `Database_Toko_${new Date().toISOString().slice(0,10)}.csv`);
//         document.body.appendChild(link);
//         link.click();
//         document.body.removeChild(link);

//       } catch (error) {
//           showNotify('error', 'Gagal Export', error.message);
//       } finally {
//           setLoading(false);
//       }
//   };

//   // --- SAVE PRODUCT ---
//   const handleSaveProduct = async (formData, isVariantMode = false) => {
//     if (!user) return showNotify('error', 'Sesi Habis', 'Silakan login ulang.');
//     setLoading(true);
    
//     const isUpdate = !isVariantMode && currentProduct && currentProduct.id;
//     let error;

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
//       const { error: err } = await supabase.from('products').update(payload).eq('id', currentProduct.id).eq('user_id', user.id); 
//       error = err;
//     } else {
//       const { error: err } = await supabase.from('products').insert([{ ...payload, user_id: user.id }]);
//       error = err;
//     }

//     setLoading(false);

//     if (error) {
//       showNotify('error', 'Gagal Menyimpan', error.message);
//     } else {
//       showNotify('success', 'Berhasil', isUpdate ? 'Produk diperbarui!' : 'Produk ditambahkan!');
//       setIsModalOpen(false);
//       setCurrentProduct(null);
//       setSearchParams({});
      
//       // Refresh Data (Cek apakah sedang search atau tidak)
//       if (isSearching) handleSearch();
//       else fetchInitialData();
//     }
//   };

//   // --- DELETE & IMPORT (Trigger Modal) ---
//   const triggerDelete = (id, name) => {
//     if (!user) return;
//     setModalConfig({
//         isOpen: true, type: 'DELETE', title: 'Hapus Produk?', message: `Apakah Anda yakin ingin menghapus "${name}"?`,
//         data: { id }, confirmLabel: 'Hapus', isDanger: true 
//     });
//   };

//   const triggerImport = () => {
//     setModalConfig({
//         isOpen: true, type: 'IMPORT', title: 'Import Data Excel?', message: 'PERINGATAN: Import ini akan MENGHAPUS SEMUA data lama Anda. Lanjutkan?',
//         data: null, confirmLabel: 'Import Data', isDanger: false 
//     });
//   };

//   const handleConfirmAction = async () => {
//       if (modalConfig.type === 'DELETE') {
//           const { id } = modalConfig.data;
//           const { error } = await supabase.from('products').delete().eq('id', id).eq('user_id', user.id);
//           if (error) {
//               showNotify('error', 'Gagal Hapus', error.message);
//           } else {
//               setProducts(products.filter(item => item.id !== id));
//               setTotalProducts(prev => prev - 1); // Kurangi counter total
//           }
//       } else if (modalConfig.type === 'IMPORT') {
//           fileInputRef.current.click();
//       }
//       setModalConfig({ ...modalConfig, isOpen: false });
//   };

//   const handleOpenAdd = () => { setCurrentProduct(null); setIsModalOpen(true); };
//   const handleOpenEdit = (item) => { setCurrentProduct(item); setIsModalOpen(true); };

//   // --- IMPORT LOGIC ---
//   const handleFileChange = async (e) => {
//     const file = e.target.files[0];
//     if (!file) return;
//     const reader = new FileReader();
//     reader.onload = async (evt) => { await processImport(evt.target.result); };
//     reader.readAsText(file);
//     e.target.value = null; 
//   };

//   const processImport = async (csvText) => { 
//       if (!user) return showNotify('error', 'Akses Ditolak', 'Harus login untuk import!');
//       setLoading(true);
//       try {
//         const lines = csvText.split('\n');
//         const dataToInsert = [];
//         const parseCSVLine = (text) => {
//             const result = []; let current = ''; let inQuotes = false;
//             for (let i = 0; i < text.length; i++) {
//                 const char = text[i];
//                 if (char === '"') inQuotes = !inQuotes; 
//                 else if (char === ',' && !inQuotes) { result.push(current.trim()); current = ''; } 
//                 else current += char; 
//             }
//             result.push(current.trim()); return result;
//         };

//         for (let i = 1; i < lines.length; i++) {
//             const line = lines[i].trim(); if (!line) continue;
//             const columns = parseCSVLine(line);
//             if (columns.length >= 6) { 
//                 const clean = (str) => str ? str.replace(/^"|"$/g, '').trim() : '';
//                 const category = clean(columns[0]); 
//                 let sku = clean(columns[1]); 
//                 const item_name = clean(columns[2]); 
//                 const brand_name = clean(columns[3]); 
//                 const variant_name = clean(columns[4]);
//                 let priceStr = clean(columns[5]).replace(/[^0-9.]/g, ''); 
//                 const price = parseFloat(priceStr) || 0;
//                 let wholesaleStr = columns[6] ? clean(columns[6]).replace(/[^0-9.]/g, '') : '0';
//                 const wholesale_price = parseFloat(wholesaleStr) || 0;
//                 if (!sku) sku = "-";
//                 if (item_name) { 
//                     dataToInsert.push({ user_id: user.id, category, sku: String(sku), item_name, brand_name, variant_name, price, wholesale_price }); 
//                 }
//             }
//         }

//         if (dataToInsert.length > 0) {
//             const { error: deleteError } = await supabase.from('products').delete().eq('user_id', user.id); 
//             if (deleteError) throw deleteError;
//             const { error: insertError } = await supabase.from('products').insert(dataToInsert);
//             if (insertError) throw insertError;
            
//             showNotify('success', 'Import Berhasil', `${dataToInsert.length} data baru berhasil dimasukkan.`);
//             fetchInitialData(); // Reset ulang data dan total
//         } else { 
//             showNotify('info', 'File Kosong', "File kosong atau format tidak sesuai.");
//         }
//       } catch (error) { 
//           showNotify('error', 'Gagal Import', error.message);
//       } finally { 
//           setLoading(false); 
//       }
//   };

//   // --- UI HELPERS ---
//   const handleScanSearch = (sku) => { 
//       setSearchQuery(sku); 
//       setShowScanner(false); 
//       // Search langsung tanpa nunggu user tekan enter
//       performDirectSearch(sku);
//   };

//   const performDirectSearch = async (val) => {
//       setLoading(true);
//       setIsSearching(true);
//       try {
//         const { data, error } = await supabase
//           .from('products')
//           .select('*')
//           .eq('user_id', user.id)
//           .or(`item_name.ilike.%${val}%,sku.ilike.%${val}%`)
//           .limit(100);
//         if (error) throw error;
//         setProducts(data || []);
//       } catch (error) {
//         showNotify('error', 'Error', error.message);
//       } finally {
//         setLoading(false);
//       }
//   };
  
//   const scrollToTop = () => { window.scrollTo({ top: 0, behavior: 'smooth' }); };
  
//   const clearSearch = () => { 
//       setSearchQuery(''); 
//       fetchInitialData(); // Kembali ke mode awal
//   }; 

//   return (
//     <div className="pb-24 relative">
//       <div className="bg-white p-4 rounded-lg shadow-md min-h-[80vh]">
        
//         {/* Header */}
//         <div className="text-center mb-6">
//             <h2 className="text-xl font-bold text-blue-600">Manajemen Database</h2>
//             <div className="inline-flex items-center gap-2 mt-2 bg-blue-50 px-3 py-1 rounded-full border border-blue-100">
//                 <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></span>
//                 <p className="text-xs font-bold text-blue-700">
//                     {/* Tampilkan Total Asli dari DB */}
//                     Total Data Tersimpan : {totalProducts.toLocaleString()} 
//                 </p>
//             </div>
//         </div>

//         {/* Tombol Aksi */}
//         <div className="flex flex-col gap-2 mb-6">
//           <div className="flex gap-2">
//             <button onClick={handleExport} className="flex-1 bg-green-600 text-white py-2 rounded-lg font-bold text-sm flex items-center justify-center gap-2 hover:bg-green-700 shadow"><Download size={18} /> Export Excel</button>
//             <button onClick={triggerImport} className="flex-1 bg-blue-600 text-white py-2 rounded-lg font-bold text-sm flex items-center justify-center gap-2 hover:bg-blue-700 shadow"><Upload size={18} /> Import Excel</button>
//           </div>
//           <button onClick={handleOpenAdd} className="w-full bg-indigo-600 text-white py-2 rounded-lg font-bold text-sm flex items-center justify-center gap-2 hover:bg-indigo-700 shadow">
//             <Plus size={18} /> Tambah Data Manual
//           </button>
//           <input type="file" ref={fileInputRef} onChange={handleFileChange} accept=".csv" className="hidden" />
//         </div>

//         {/* Scanner & Search */}
//         {showScanner && (
//           <div className="mb-4 animate-fade-in border p-2 rounded bg-gray-50">
//             <p className="text-center text-sm font-bold mb-2">Scan Barcode untuk Mencari</p>
//             <Scanner onScanResult={handleScanSearch} />
//             <button onClick={() => setShowScanner(false)} className="w-full mt-2 bg-gray-200 text-gray-700 py-2 rounded">Tutup Kamera</button>
//           </div>
//         )}

//         <form onSubmit={handleSearch} className="relative mb-4">
//           <Search className="absolute left-3 top-3.5 text-gray-400" size={20} />
//           <input 
//             type="text" 
//             value={searchQuery} 
//             onChange={(e) => setSearchQuery(e.target.value)}
//             placeholder="Cari Nama Barang atau SKU..." 
//             className="w-full pl-10 pr-12 py-3 border rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 outline-none"
//           />
//           {searchQuery && (
//              <button type="button" onClick={clearSearch} className="absolute right-12 top-2 bg-gray-100 p-1.5 rounded-full text-gray-500 hover:bg-gray-200 transition">
//                 <X size={16} />
//              </button>
//           )}
//           <button type="button" onClick={() => setShowScanner(!showScanner)} className="absolute right-2 top-2 bg-blue-100 p-1.5 rounded-md text-blue-600 hover:bg-blue-200 transition"><ScanLine size={24} /></button>
//         </form>

//         {/* List Data */}
//         {loading ? <p className="text-center py-10 text-gray-500 animate-pulse">Sedang memuat data...</p> : (
//           <div className="space-y-3">
            
//             {/* Info Mode Tampilan */}
//             <div className="flex justify-between items-center text-xs text-gray-400 mb-2">
//                 <span>{isSearching ? 'Hasil Pencarian' : 'Data Terbaru (Max 100)'}</span>
//                 <span>Menampilkan {products.length} data</span>
//             </div>
            
//             {products.map((item) => (
//               <div key={item.id} className="border p-3 rounded-lg shadow-sm bg-gray-50 flex justify-between items-center hover:bg-gray-50 transition">
//                 <div className="flex-1">
//                   <div className="font-bold text-gray-800">{item.item_name}</div>
//                   <div className="text-xs text-gray-500 flex flex-wrap gap-1 items-center mt-1">
//                     <span className={`px-1.5 py-0.5 rounded text-[10px] ${searchQuery && item.sku.toLowerCase().includes(searchQuery.toLowerCase()) ? 'bg-yellow-200 text-yellow-800 font-bold' : 'bg-gray-200'}`}>
//                         SKU: {item.sku}
//                     </span>
//                     <span className="bg-blue-50 text-blue-600 px-1.5 py-0.5 rounded text-[10px] border border-blue-100">{item.category}</span>
//                     {item.brand_name && item.brand_name !== '-' && (
//                         <span className="px-1.5 py-0.5 rounded text-[10px] border bg-purple-50 text-purple-600 border-purple-100">
//                             {item.brand_name}
//                         </span>
//                     )}
//                     {item.variant_name && <span className="bg-orange-50 text-orange-600 px-1.5 py-0.5 rounded text-[10px] border border-orange-100 font-medium">{item.variant_name}</span>}
//                   </div>
                  
//                   <div className="flex gap-3 mt-1">
//                       <div className="text-sm font-bold text-blue-600">
//                         Rp {(item.price || 0).toLocaleString()}
//                       </div>
//                       {item.wholesale_price > 0 && (
//                         <div className="text-xs font-bold text-green-600 flex items-center bg-green-50 px-1 rounded">
//                            Grosir: Rp {(item.wholesale_price).toLocaleString()}
//                         </div>
//                       )}
//                   </div>
//                 </div>

//                 <div className="flex gap-2 ml-2">
//                   <button onClick={() => handleOpenEdit(item)} className="bg-blue-100 text-blue-600 p-2 rounded-full hover:bg-blue-200"><Edit size={18} /></button>
//                   <button onClick={() => triggerDelete(item.id, item.item_name)} className="bg-red-100 text-red-600 p-2 rounded-full hover:bg-red-200"><Trash2 size={18} /></button>
//                 </div>
//               </div>
//             ))}
            
//             {products.length === 0 && (
//                 <div className="text-center py-10">
//                     <p className="text-gray-400 mb-2">
//                         {isSearching ? `Tidak ada Nama/SKU: "${searchQuery}"` : "Data kosong."}
//                     </p>
//                     {isSearching && (
//                         <button onClick={clearSearch} className="text-blue-600 font-bold text-sm hover:underline flex items-center justify-center gap-1 mx-auto">
//                             <RefreshCw size={14} /> Reset Pencarian
//                         </button>
//                     )}
//                 </div>
//             )}
//           </div>
//         )}
//       </div>

//       <button onClick={scrollToTop} className="fixed bottom-24 right-6 bg-blue-600 text-white p-3 rounded-full shadow-lg hover:bg-blue-700 z-40 transition-all hover:scale-110 active:scale-95"><ArrowUp size={24} /></button>

//       {/* RENDER MODALS */}
//       <ConfirmationModal 
//           isOpen={modalConfig.isOpen}
//           onClose={() => setModalConfig({ ...modalConfig, isOpen: false })}
//           onConfirm={handleConfirmAction}
//           title={modalConfig.title}
//           message={modalConfig.message}
//           confirmLabel={modalConfig.confirmLabel}
//           isDanger={modalConfig.isDanger}
//       />

//       <NotificationModal 
//           isOpen={notifyModal.isOpen}
//           onClose={closeNotify}
//           type={notifyModal.type}
//           title={notifyModal.title}
//           message={notifyModal.message}
//       />

//       <ProductModal 
//         isOpen={isModalOpen} 
//         onClose={() => { setIsModalOpen(false); setSearchParams({}); }} 
//         product={currentProduct}
//         onSave={handleSaveProduct}
//         onScanClick={() => { setIsModalOpen(false); setShowScanner(true); }} 
//         allProducts={products} 
//       />

//     </div>
//   );
// };

// export default ManagePage;


//======================================================================


import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import { useAuth } from '../AuthProvider'; 
import Scanner from '../components/Scanner';
import ProductModal from '../components/ProductModal';
import { Search, Trash2, Edit, ScanLine, Download, Upload, Plus, ArrowUp, X, RefreshCw, Clipboard, Zap, ZapOff, AlertTriangle, FileWarning, Copy, Check, ShieldCheck, FastForward } from 'lucide-react';

// IMPORT MODALS
import ConfirmationModal from '../components/ConfirmationModal'; 
import NotificationModal from '../components/NotificationModal'; 

const ManagePage = () => {
  const { user } = useAuth(); 
  const [searchParams, setSearchParams] = useSearchParams();
  
  // State Data
  const [products, setProducts] = useState([]); 
  const [totalProducts, setTotalProducts] = useState(0); 
  const [loading, setLoading] = useState(false);
  
  // State Pencarian
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);

  // --- STATE MODAL & SCANNER ---
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentProduct, setCurrentProduct] = useState(null); 
  const [showScanner, setShowScanner] = useState(false);
  const [isFlashOn, setIsFlashOn] = useState(false);
  const fileInputRef = useRef(null);

  // --- IMPORT CONFIG ---
  const [importErrors, setImportErrors] = useState([]); 
  const [copyFeedback, setCopyFeedback] = useState('');
  const [showImportOptions, setShowImportOptions] = useState(false); // Modal Pilihan Import
  const importModeRef = useRef('VALIDATE'); // 'VALIDATE' or 'FORCE'

  // --- STATE KONFIGURASI MODAL ---
  const [modalConfig, setModalConfig] = useState({ isOpen: false, type: null, title: '', message: '', data: null, confirmLabel: '', isDanger: false });
  const [notifyModal, setNotifyModal] = useState({ isOpen: false, type: 'success', title: '', message: '' });

  // Helper Notifikasi
  const showNotify = (type, title, message) => {
    setNotifyModal({ isOpen: true, type, title, message });
  };
  const closeNotify = () => {
    setNotifyModal({ ...notifyModal, isOpen: false });
  };

  // --- 1. INIT LOAD ---
  useEffect(() => {
    if (user) {
        fetchInitialData();
    }
    const skuFromUrl = searchParams.get('sku');
    if (skuFromUrl) {
      setCurrentProduct({ sku: skuFromUrl }); 
      setIsModalOpen(true);
    }
  }, [searchParams, user]);

  const fetchInitialData = async () => {
    if (!user) return;
    setLoading(true);
    try {
        const { data, error } = await supabase
            .from('products')
            .select('*')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false })
            .limit(50);

        if (error) throw error;
        setProducts(data || []);

        const { count, error: countError } = await supabase
            .from('products')
            .select('*', { count: 'exact', head: true })
            .eq('user_id', user.id);

        if (!countError) setTotalProducts(count || 0);
        setIsSearching(false); 
    } catch (error) {
        console.error("Error fetching data:", error);
        showNotify('error', 'Gagal Load Data', error.message);
    } finally {
        setLoading(false);
    }
  };

  // --- 2. LOGIKA PENCARIAN ---
  const handleSearch = async (e) => {
      e?.preventDefault();
      const query = searchQuery.trim();
      
      if (!query) {
          fetchInitialData(); 
          return;
      }

      setLoading(true);
      setIsSearching(true);

      try {
        const { data, error } = await supabase
          .from('products')
          .select('*')
          .eq('user_id', user.id)
          .or(`item_name.ilike.%${query}%,sku.ilike.%${query}%`)
          .limit(100);

        if (error) throw error;
        setProducts(data || []);
        setTotalProducts(data.length); 
      } catch (error) {
        showNotify('error', 'Gagal Mencari', error.message);
      } finally {
        setLoading(false);
      }
  };

  // --- 3. EXPORT DATA ---
  const handleExport = async () => { 
      setLoading(true); 
      try {
        let allData = [];
        let from = 0;
        const step = 1000; 
        let more = true;

        while (more) {
            const { data, error } = await supabase
                .from('products')
                .select('*')
                .eq('user_id', user.id) 
                .order('created_at', { ascending: false })
                .range(from, from + step - 1);

            if (error) throw error;

            if (data && data.length > 0) {
                allData = [...allData, ...data];
                from += step;
                if (data.length < step) more = false; 
            } else {
                more = false;
            }
        }

        if (allData.length === 0) {
            showNotify('info', 'Data Kosong', 'Tidak ada data untuk diexport.');
            return;
        }
      
        const header = "Category,SKU,Items Name (Do Not Edit),Brand Name,Variant name,Basic - Price,Wholesale Price";
        const rows = allData.map(item => {
            const category = `"${item.category || ''}"`;
            const sku = `"${item.sku || ''}"`; 
            const name = `"${(item.item_name || '').replace(/"/g, '""')}"`;
            const brand = `"${item.brand_name || ''}"`;
            const variant = `"${item.variant_name || ''}"`;
            const price = item.price || 0;
            const wholesale = item.wholesale_price || 0;
            return `${category},${sku},${name},${brand},${variant},${price},${wholesale}`;
        });

        const csvContent = [header, ...rows].join("\n");
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement("a");
        const url = URL.createObjectURL(blob);
        link.setAttribute("href", url);
        link.setAttribute("download", `Database_Toko_${new Date().toISOString().slice(0,10)}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

      } catch (error) {
          showNotify('error', 'Gagal Export', error.message);
      } finally {
          setLoading(false);
      }
  };

  // --- SAVE PRODUCT ---
  const handleSaveProduct = async (formData, isVariantMode = false) => {
    if (!user) return showNotify('error', 'Sesi Habis', 'Silakan login ulang.');
    setLoading(true);
    
    const isUpdate = !isVariantMode && currentProduct && currentProduct.id;
    let error;

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
      const { error: err } = await supabase.from('products').update(payload).eq('id', currentProduct.id).eq('user_id', user.id); 
      error = err;
    } else {
      const { error: err } = await supabase.from('products').insert([{ ...payload, user_id: user.id }]);
      error = err;
    }

    setLoading(false);

    if (error) {
      showNotify('error', 'Gagal Menyimpan', error.message);
    } else {
      showNotify('success', 'Berhasil', isUpdate ? 'Produk diperbarui!' : 'Produk ditambahkan!');
      setIsModalOpen(false);
      setCurrentProduct(null);
      setSearchParams({});
      if (isSearching) handleSearch();
      else fetchInitialData();
    }
  };

  const triggerDelete = (id, name) => {
    if (!user) return;
    setModalConfig({
        isOpen: true, type: 'DELETE', title: 'Hapus Produk?', message: `Apakah Anda yakin ingin menghapus "${name}"?`,
        data: { id }, confirmLabel: 'Hapus', isDanger: true 
    });
  };

  // --- LOGIC BARU: SELECT MODE IMPORT ---
  const triggerImportSelection = () => {
      setShowImportOptions(true);
  };

  const handleSelectImportMode = (mode) => {
      importModeRef.current = mode;
      setShowImportOptions(false);
      
      // Setelah pilih mode, baru trigger konfirmasi hapus data
      const message = mode === 'FORCE' 
        ? 'PERINGATAN: Mode "Langsung Upload" akan MENGHAPUS SEMUA data lama & MENABRAK validasi duplikat. Lanjutkan?' 
        : 'PERINGATAN: Import ini akan MENGHAPUS SEMUA data lama Anda. Lanjutkan?';

      setModalConfig({
        isOpen: true, type: 'IMPORT', title: 'Import Data Excel?', message,
        data: null, confirmLabel: 'Lanjut Pilih File', isDanger: mode === 'FORCE'
      });
  };

  const handleConfirmAction = async () => {
      if (modalConfig.type === 'DELETE') {
          const { id } = modalConfig.data;
          const { error } = await supabase.from('products').delete().eq('id', id).eq('user_id', user.id);
          if (error) {
              showNotify('error', 'Gagal Hapus', error.message);
          } else {
              setProducts(products.filter(item => item.id !== id));
              setTotalProducts(prev => prev - 1);
          }
      } else if (modalConfig.type === 'IMPORT') {
          fileInputRef.current.click();
      }
      setModalConfig({ ...modalConfig, isOpen: false });
  };

  const handleOpenAdd = () => { setCurrentProduct(null); setIsModalOpen(true); };
  const handleOpenEdit = (item) => { setCurrentProduct(item); setIsModalOpen(true); };

  // --- IMPORT LOGIC ---
  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async (evt) => { await processImport(evt.target.result); };
    reader.readAsText(file);
    e.target.value = null; 
  };

  const processImport = async (csvText) => { 
      if (!user) return showNotify('error', 'Akses Ditolak', 'Harus login untuk import!');
      setLoading(true);
      setImportErrors([]); 

      try {
        const lines = csvText.split('\n');
        const dataToInsert = [];
        const validationErrors = []; 

        const seenSKUs = new Set();
        const seenFullProducts = new Set(); 
        const productConsistencyMap = new Map(); 
        
        // CEK MODE IMPORT
        const isStrict = importModeRef.current === 'VALIDATE';

        const parseCSVLine = (text) => {
            const result = []; let current = ''; let inQuotes = false;
            for (let i = 0; i < text.length; i++) {
                const char = text[i];
                if (char === '"') inQuotes = !inQuotes; 
                else if (char === ',' && !inQuotes) { result.push(current.trim()); current = ''; } 
                else current += char; 
            }
            result.push(current.trim()); return result;
        };

        for (let i = 1; i < lines.length; i++) {
            const line = lines[i].trim(); 
            if (!line) continue;
            const columns = parseCSVLine(line);
            
            if (columns.length >= 6) { 
                const clean = (str) => str ? str.replace(/^"|"$/g, '').trim() : '';
                
                const category = clean(columns[0]); 
                let sku = clean(columns[1]); 
                const item_name = clean(columns[2]); 
                const brand_name = clean(columns[3]); 
                const variant_name = clean(columns[4]);
                let priceStr = clean(columns[5]).replace(/[^0-9.]/g, ''); 
                const price = parseFloat(priceStr) || 0;
                let wholesaleStr = columns[6] ? clean(columns[6]).replace(/[^0-9.]/g, '') : '0';
                const wholesale_price = parseFloat(wholesaleStr) || 0;

                if (!sku) sku = "-";
                
                const rowNum = i + 1; 

                // 1. VALIDASI WAJIB (Selalu Aktif)
                if (!item_name) {
                    validationErrors.push({ row: rowNum, msg: "Nama Produk Kosong" });
                    continue;
                }

                // --- LOGIKA VALIDASI STRICT (Hanya jika mode VALIDATE) ---
                if (isStrict) {
                    // 2. CEK SKU DUPLIKAT
                    const skuKey = sku.toLowerCase();
                    if (skuKey !== '-' && seenSKUs.has(skuKey)) {
                        validationErrors.push({ 
                            row: rowNum, 
                            name: item_name, 
                            msg: `SKU "${sku}" Duplikat (Sudah ada di baris sebelumnya)` 
                        });
                    } else if (skuKey !== '-') {
                        seenSKUs.add(skuKey);
                    }

                    // 3. CEK FULL DUPLIKAT
                    const fullKey = `${item_name.toLowerCase()}|${category.toLowerCase()}|${brand_name.toLowerCase()}|${variant_name.toLowerCase()}`;
                    if (seenFullProducts.has(fullKey)) {
                        validationErrors.push({ 
                            row: rowNum, 
                            name: item_name, 
                            msg: `Produk Duplikat Persis (Nama, Brand, Varian sama)` 
                        });
                    } else {
                        seenFullProducts.add(fullKey);
                    }

                    // 4. CEK INKONSISTENSI
                    const consistencyKey = `${item_name.toLowerCase()}|${variant_name.toLowerCase()}`;
                    const currentData = { cat: category.toLowerCase(), brand: brand_name.toLowerCase() };

                    if (productConsistencyMap.has(consistencyKey)) {
                        const existingData = productConsistencyMap.get(consistencyKey);
                        if (existingData.cat !== currentData.cat || existingData.brand !== currentData.brand) {
                            validationErrors.push({ 
                                row: rowNum, 
                                name: item_name, 
                                msg: `Inkonsistensi Data! Produk "${item_name} ${variant_name}" memiliki Brand/Kategori berbeda dengan baris sebelumnya.` 
                            });
                        }
                    } else {
                        productConsistencyMap.set(consistencyKey, currentData);
                    }
                }

                dataToInsert.push({ user_id: user.id, category, sku: String(sku), item_name, brand_name, variant_name, price, wholesale_price }); 
            }
        }

        if (validationErrors.length > 0) {
            setImportErrors(validationErrors);
            setLoading(false);
            return; 
        }

        if (dataToInsert.length > 0) {
            const { error: deleteError } = await supabase.from('products').delete().eq('user_id', user.id); 
            if (deleteError) throw deleteError;
            const { error: insertError } = await supabase.from('products').insert(dataToInsert);
            if (insertError) throw insertError;
            
            showNotify('success', 'Import Berhasil', `${dataToInsert.length} data baru berhasil dimasukkan.`);
            fetchInitialData(); 
        } else { 
            showNotify('info', 'File Kosong', "File kosong atau format tidak sesuai.");
        }
      } catch (error) { 
          showNotify('error', 'Gagal Import', error.message);
      } finally { 
          setLoading(false); 
      }
  };

  // --- UI HELPERS ---
  const handleScanSearch = (sku) => { 
      setSearchQuery(sku); 
      setShowScanner(false); 
      performDirectSearch(sku);
  };

  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (text) setSearchQuery(text);
    } catch (err) {
      showNotify('error', 'Gagal Paste', 'Izin clipboard ditolak browser.');
    }
  };

  const performDirectSearch = async (val) => {
      setLoading(true);
      setIsSearching(true);
      try {
        const { data, error } = await supabase
          .from('products')
          .select('*')
          .eq('user_id', user.id)
          .or(`item_name.ilike.%${val}%,sku.ilike.%${val}%`)
          .limit(100);
        if (error) throw error;
        setProducts(data || []);
      } catch (error) {
        showNotify('error', 'Error', error.message);
      } finally {
        setLoading(false);
      }
  };
  
  const scrollToTop = () => { window.scrollTo({ top: 0, behavior: 'smooth' }); };
  
  const clearSearch = () => { 
      setSearchQuery(''); 
      fetchInitialData(); 
  }; 

  return (
    <div className="pb-24 relative">
      <div className="bg-white p-4 rounded-lg shadow-md min-h-[80vh]">
        
        {/* Header */}
        <div className="text-center mb-6">
            <h2 className="text-xl font-bold text-blue-600">Manajemen Database</h2>
            <div className="inline-flex items-center gap-2 mt-2 bg-blue-50 px-3 py-1 rounded-full border border-blue-100">
                <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></span>
                <p className="text-xs font-bold text-blue-700">
                    Total Data Tersimpan : {totalProducts.toLocaleString()} 
                </p>
            </div>
        </div>

        {/* Tombol Aksi */}
        <div className="flex flex-col gap-2 mb-6">
          <div className="flex gap-2">
            <button onClick={handleExport} className="flex-1 bg-green-600 text-white py-2 rounded-lg font-bold text-sm flex items-center justify-center gap-2 hover:bg-green-700 shadow"><Download size={18} /> Export Excel</button>
            <button onClick={triggerImportSelection} className="flex-1 bg-blue-600 text-white py-2 rounded-lg font-bold text-sm flex items-center justify-center gap-2 hover:bg-blue-700 shadow"><Upload size={18} /> Import Excel</button>
          </div>
          <button onClick={handleOpenAdd} className="w-full bg-indigo-600 text-white py-2 rounded-lg font-bold text-sm flex items-center justify-center gap-2 hover:bg-indigo-700 shadow">
            <Plus size={18} /> Tambah Data Manual
          </button>
          <input type="file" ref={fileInputRef} onChange={handleFileChange} accept=".csv" className="hidden" />
        </div>

        {/* Scanner & Search */}
        {showScanner && (
            <div className="mb-4 animate-fade-in border p-2 rounded bg-gray-50">
                <div className="relative bg-black rounded-lg overflow-hidden h-56 w-full max-w-xs mx-auto flex items-center justify-center shadow-lg">
                    <Scanner onScanResult={handleScanSearch} flashOn={isFlashOn} />
                </div>
                <div className="flex gap-2 mt-2">
                    <button onClick={() => setIsFlashOn(!isFlashOn)} className={`flex-1 py-2 rounded-lg font-bold text-sm flex items-center justify-center gap-2 border transition ${isFlashOn ? 'bg-yellow-400 text-black border-yellow-500' : 'bg-white text-gray-700 border-gray-300'}`}>
                        {isFlashOn ? <><ZapOff size={16}/> Off</> : <><Zap size={16}/> On</>}
                    </button>
                    <button onClick={() => { setShowScanner(false); setIsFlashOn(false); }} className="flex-1 bg-gray-200 text-gray-700 py-2 rounded-lg font-bold text-sm hover:bg-gray-300 transition">Tutup</button>
                </div>
            </div>
        )}

        <form onSubmit={handleSearch} className="relative mb-4">
          <Search className="absolute left-3 top-3.5 text-gray-400 z-10" size={20} />
          <input 
            type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari Nama / SKU..." 
            className="w-full pl-10 pr-24 py-3 border rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 outline-none"
          />
          <div className="absolute right-2 top-2 flex items-center gap-1">
              {searchQuery ? (
                 <button type="button" onClick={clearSearch} className="bg-gray-100 p-1.5 rounded-full text-gray-500 hover:bg-gray-200 transition"><X size={18} /></button>
              ) : (
                 <button type="button" onClick={handlePaste} className="bg-gray-100 p-1.5 rounded-full text-gray-500 hover:bg-blue-100 hover:text-blue-600 transition"><Clipboard size={18} /></button>
              )}
              <button type="button" onClick={() => setShowScanner(!showScanner)} className={`p-1.5 rounded-md transition ${showScanner ? 'bg-blue-600 text-white' : 'bg-blue-100 text-blue-600 hover:bg-blue-200'}`}><ScanLine size={20} /></button>
          </div>
        </form>

        {/* List Data */}
        {loading ? <p className="text-center py-10 text-gray-500 animate-pulse">Sedang memuat data...</p> : (
          <div className="space-y-3">
            <div className="flex justify-between items-center text-xs text-gray-400 mb-2">
                <span>{isSearching ? 'Hasil Pencarian' : 'Data Terbaru (Max 50)'}</span>
                <span>{products.length} Data Tampil</span>
            </div>
            {products.map((item) => (
              <div key={item.id} className="border p-3 rounded-lg shadow-sm bg-gray-50 flex justify-between items-center hover:bg-gray-50 transition">
                <div className="flex-1">
                  <div className="font-bold text-gray-800">{item.item_name}</div>
                  <div className="text-xs text-gray-500 flex flex-wrap gap-1 items-center mt-1">
                    <span className={`px-1.5 py-0.5 rounded text-[10px] ${searchQuery && item.sku.toLowerCase().includes(searchQuery.toLowerCase()) ? 'bg-yellow-200 text-yellow-800 font-bold' : 'bg-gray-200'}`}>
                        SKU: {item.sku}
                    </span>
                    <span className="bg-blue-50 text-blue-600 px-1.5 py-0.5 rounded text-[10px] border border-blue-100">{item.category}</span>
                    {item.brand_name && item.brand_name !== '-' && <span className="px-1.5 py-0.5 rounded text-[10px] border bg-purple-50 text-purple-600 border-purple-100">{item.brand_name}</span>}
                    {item.variant_name && <span className="bg-orange-50 text-orange-600 px-1.5 py-0.5 rounded text-[10px] border border-orange-100 font-medium">{item.variant_name}</span>}
                  </div>
                  <div className="flex gap-3 mt-1">
                      <div className="text-sm font-bold text-blue-600">Rp {(item.price || 0).toLocaleString()}</div>
                      {item.wholesale_price > 0 && <div className="text-xs font-bold text-green-600 flex items-center bg-green-50 px-1 rounded">Grosir: Rp {(item.wholesale_price).toLocaleString()}</div>}
                  </div>
                </div>
                <div className="flex gap-2 ml-2">
                  <button onClick={() => handleOpenEdit(item)} className="bg-blue-100 text-blue-600 p-2 rounded-full hover:bg-blue-200"><Edit size={18} /></button>
                  <button onClick={() => triggerDelete(item.id, item.item_name)} className="bg-red-100 text-red-600 p-2 rounded-full hover:bg-red-200"><Trash2 size={18} /></button>
                </div>
              </div>
            ))}
            {products.length === 0 && (
                <div className="text-center py-10">
                    <p className="text-gray-400 mb-2">{isSearching ? `Tidak ada Nama/SKU: "${searchQuery}"` : "Data kosong."}</p>
                    {isSearching && <button onClick={clearSearch} className="text-blue-600 font-bold text-sm hover:underline flex items-center justify-center gap-1 mx-auto"><RefreshCw size={14} /> Reset Pencarian</button>}
                </div>
            )}
          </div>
        )}
      </div>

      <button onClick={scrollToTop} className="fixed bottom-24 right-6 bg-blue-600 text-white p-3 rounded-full shadow-lg hover:bg-blue-700 z-40 transition-all hover:scale-110 active:scale-95"><ArrowUp size={24} /></button>

      {/* --- MODAL PILIH MODE IMPORT --- */}
      {showImportOptions && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 animate-fade-in">
            <div className="bg-white w-full max-w-sm rounded-xl shadow-2xl overflow-hidden">
                <div className="bg-blue-600 p-4 text-white text-center">
                    <h3 className="font-bold text-lg">Pilih Metode Import</h3>
                    <p className="text-xs text-blue-100 mt-1">Bagaimana Anda ingin memasukkan data?</p>
                </div>
                <div className="p-5 flex flex-col gap-3">
                    <button 
                        onClick={() => handleSelectImportMode('VALIDATE')}
                        className="flex items-center gap-3 p-3 border border-green-200 bg-green-50 rounded-lg hover:bg-green-100 transition text-left"
                    >
                        <div className="bg-green-200 text-green-700 p-2 rounded-full"><ShieldCheck size={24}/></div>
                        <div>
                            <p className="font-bold text-gray-800 text-sm">Validasi Ketat (Aman)</p>
                            <p className="text-xs text-gray-500">Mencegah duplikat SKU & data inkonsisten. Rekomendasi.</p>
                        </div>
                    </button>

                    <button 
                        onClick={() => handleSelectImportMode('FORCE')}
                        className="flex items-center gap-3 p-3 border border-orange-200 bg-orange-50 rounded-lg hover:bg-orange-100 transition text-left"
                    >
                        <div className="bg-orange-200 text-orange-700 p-2 rounded-full"><FastForward size={24}/></div>
                        <div>
                            <p className="font-bold text-gray-800 text-sm">Langsung Upload (Paksa)</p>
                            <p className="text-xs text-gray-500">Melewati validasi. Cepat tapi berisiko duplikat. Gunakan jika data sudah pasti bersih.</p>
                        </div>
                    </button>
                </div>
                <div className="p-3 bg-gray-50 text-center">
                    <button onClick={() => setShowImportOptions(false)} className="text-gray-500 text-sm font-bold hover:text-gray-700">Batal</button>
                </div>
            </div>
        </div>
      )}

      {/* --- MODAL ERROR IMPORT --- */}
      {importErrors.length > 0 && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 animate-fade-in">
            <div className="bg-white w-full max-w-lg rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-[80vh] relative">
                
                {/* Header Modal Error */}
                <div className="bg-red-600 p-4 text-white flex justify-between items-center">
                    <h2 className="font-bold text-lg flex items-center gap-2"><FileWarning size={24}/> Import Gagal!</h2>
                    <button onClick={() => setImportErrors([])} className="bg-white/20 p-1 rounded-full"><X size={20}/></button>
                </div>
                <div className="p-4 bg-red-50 border-b border-red-100">
                    <p className="text-red-800 text-sm font-bold">Ditemukan {importErrors.length} kesalahan dalam file CSV.</p>
                    <p className="text-red-600 text-xs mt-1">Perbaiki baris berikut di Excel & upload ulang.</p>
                </div>

                {/* List Error */}
                <div className="flex-1 overflow-y-auto p-4 custom-scrollbar bg-gray-50 relative">
                    <div className="space-y-2">
                        {importErrors.map((err, idx) => (
                            <div key={idx} className="bg-white p-3 rounded border-l-4 border-red-500 shadow-sm">
                                <div className="flex justify-between items-start">
                                    <span className="bg-red-100 text-red-800 text-xs font-bold px-2 py-0.5 rounded">Baris {err.row}</span>
                                    
                                    {/* Copy Name Button */}
                                    {err.name && (
                                        <button 
                                            onClick={() => {
                                                navigator.clipboard.writeText(err.name);
                                                setCopyFeedback(`"${err.name}" disalin`);
                                                setTimeout(() => setCopyFeedback(''), 4000);
                                            }}
                                            className="flex items-center gap-1 text-xs text-gray-500 font-mono hover:text-blue-600 hover:bg-blue-50 px-1.5 py-0.5 rounded transition cursor-pointer"
                                            title="Klik untuk copy nama"
                                        >
                                            <span className="truncate max-w-[150px]">{err.name}</span>
                                            <Copy size={10} className="opacity-70"/>
                                        </button>
                                    )}
                                </div>
                                <p className="text-red-600 text-sm mt-1 font-medium">{err.msg}</p>
                            </div>
                        ))}
                    </div>
                </div>

                {/* SNACKBAR KECIL (TOAST) DI DALAM MODAL */}
                {copyFeedback && (
                    <div className="absolute bottom-20 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs py-2 px-4 rounded-full shadow-lg animate-fade-in-up z-50 flex items-center gap-2">
                        <Check size={12} className="text-green-400" />
                        {copyFeedback}
                    </div>
                )}

                <div className="p-4 bg-white border-t">
                    <button onClick={() => setImportErrors([])} className="w-full bg-gray-800 text-white py-3 rounded-lg font-bold hover:bg-gray-900">Tutup & Perbaiki File</button>
                </div>
            </div>
        </div>
      )}

      <ConfirmationModal 
          isOpen={modalConfig.isOpen}
          onClose={() => setModalConfig({ ...modalConfig, isOpen: false })}
          onConfirm={handleConfirmAction}
          title={modalConfig.title}
          message={modalConfig.message}
          confirmLabel={modalConfig.confirmLabel}
          isDanger={modalConfig.isDanger}
      />

      <NotificationModal 
          isOpen={notifyModal.isOpen}
          onClose={closeNotify}
          type={notifyModal.type}
          title={notifyModal.title}
          message={notifyModal.message}
      />

      <ProductModal 
        isOpen={isModalOpen} 
        onClose={() => { setIsModalOpen(false); setSearchParams({}); }} 
        product={currentProduct}
        onSave={handleSaveProduct}
        onScanClick={() => { setIsModalOpen(false); setShowScanner(true); }} 
        allProducts={products} 
      />

    </div>
  );
};

export default ManagePage;