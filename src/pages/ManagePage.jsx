// import React, { useState, useEffect, useRef } from 'react';
// import { useSearchParams } from 'react-router-dom';
// import { supabase } from '../supabaseClient';
// import { useAuth } from '../AuthProvider'; 
// import Scanner from '../components/Scanner';
// import ProductModal from '../components/ProductModal';
// import { Search, Trash2, Edit, ScanLine, Download, Upload, Plus, ArrowUp, X } from 'lucide-react';

// // IMPORT MODALS
// import ConfirmationModal from '../components/ConfirmationModal'; 
// import NotificationModal from '../components/NotificationModal'; // 1. Import NotificationModal

// const ManagePage = () => {
//   const { user } = useAuth(); 
//   const [searchParams, setSearchParams] = useSearchParams();
//   const [products, setProducts] = useState([]);
//   const [loading, setLoading] = useState(false);
//   const [searchQuery, setSearchQuery] = useState('');
  
//   // --- STATE MODAL & SCANNER ---
//   const [isModalOpen, setIsModalOpen] = useState(false);
//   const [currentProduct, setCurrentProduct] = useState(null); 
//   const [showScanner, setShowScanner] = useState(false);
//   const fileInputRef = useRef(null);

//   // --- STATE KONFIGURASI MODAL KONFIRMASI (Delete/Import) ---
//   const [modalConfig, setModalConfig] = useState({
//     isOpen: false,
//     type: null, 
//     title: '',
//     message: '',
//     data: null, 
//     confirmLabel: '',
//     isDanger: false
//   });

//   // --- 2. STATE MODAL NOTIFIKASI (Pengganti Alert) ---
//   const [notifyModal, setNotifyModal] = useState({
//     isOpen: false,
//     type: 'success', // success, error, info
//     title: '',
//     message: ''
//   });

//   // Helper Notifikasi
//   const showNotify = (type, title, message) => {
//     setNotifyModal({ isOpen: true, type, title, message });
//   };

//   const closeNotify = () => {
//     setNotifyModal({ ...notifyModal, isOpen: false });
//   };

//   // --- LOGIKA INIT ---
//   useEffect(() => {
//     if (user) {
//         fetchProducts();
//     }
//     const skuFromUrl = searchParams.get('sku');
//     if (skuFromUrl) {
//       setCurrentProduct({ sku: skuFromUrl }); 
//       setIsModalOpen(true);
//     }
//   }, [searchParams, user]);

//   // --- FETCH DATA ---
//   const fetchProducts = async () => {
//     if (!user) return;
//     setLoading(true);
//     try {
//         let allData = [];
//         let from = 0;
//         const step = 1000; 
//         let more = true;

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
//         setProducts(allData);
//     } catch (error) {
//         console.error("Error fetching products:", error);
//     } finally {
//         setLoading(false);
//     }
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
//       showNotify(
//           'success', 
//           'Berhasil', 
//           isVariantMode ? 'Varian baru berhasil dibuat!' : (isUpdate ? 'Produk berhasil diperbarui!' : 'Produk berhasil ditambahkan!')
//       );
//       setIsModalOpen(false);
//       setCurrentProduct(null);
//       setSearchParams({});
//       fetchProducts();
//     }
//   };

//   // --- PEMICU MODAL DELETE ---
//   const triggerDelete = (id, name) => {
//     if (!user) return;
//     setModalConfig({
//         isOpen: true,
//         type: 'DELETE',
//         title: 'Hapus Produk?',
//         message: `Apakah Anda yakin ingin menghapus "${name}"? Data yang dihapus tidak dapat dikembalikan.`,
//         data: { id },
//         confirmLabel: 'Hapus',
//         isDanger: true 
//     });
//   };

//   // --- PEMICU MODAL IMPORT ---
//   const triggerImport = () => {
//     setModalConfig({
//         isOpen: true,
//         type: 'IMPORT',
//         title: 'Import Data Excel?',
//         message: 'PERINGATAN: Import ini akan MENGHAPUS SEMUA data lama Anda di database dan menggantinya dengan data baru. Lanjutkan?',
//         data: null,
//         confirmLabel: 'Import Data',
//         isDanger: false 
//     });
//   };

//   // --- EKSEKUSI KONFIRMASI ---
//   const handleConfirmAction = async () => {
//       if (modalConfig.type === 'DELETE') {
//           const { id } = modalConfig.data;
//           const { error } = await supabase.from('products').delete().eq('id', id).eq('user_id', user.id);
          
//           if (error) {
//               showNotify('error', 'Gagal Hapus', error.message);
//           } else {
//               setProducts(products.filter(item => item.id !== id));
//               // Opsional: Tampilkan notifikasi sukses kecil jika mau, tapi biasanya list update sudah cukup
//           }
//       } else if (modalConfig.type === 'IMPORT') {
//           fileInputRef.current.click();
//       }
//       setModalConfig({ ...modalConfig, isOpen: false });
//   };

//   const handleOpenAdd = () => { setCurrentProduct(null); setIsModalOpen(true); };
//   const handleOpenEdit = (item) => { setCurrentProduct(item); setIsModalOpen(true); };

//   // --- EXPORT & IMPORT ---
//   const handleExport = () => { 
//       if (products.length === 0) return showNotify('info', 'Data Kosong', 'Tidak ada data untuk diexport.');
      
//       const header = "Category,SKU,Items Name (Do Not Edit),Brand Name,Variant name,Basic - Price,Wholesale Price";
//       const rows = products.map(item => {
//         const category = `"${item.category || ''}"`;
//         const sku = `"${item.sku || ''}"`; 
//         const name = `"${(item.item_name || '').replace(/"/g, '""')}"`;
//         const brand = `"${item.brand_name || ''}"`;
//         const variant = `"${item.variant_name || ''}"`;
//         const price = item.price || 0;
//         const wholesale = item.wholesale_price || 0;
//         return `${category},${sku},${name},${brand},${variant},${price},${wholesale}`;
//       });
//       const csvContent = [header, ...rows].join("\n");
//       const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
//       const link = document.createElement("a");
//       const url = URL.createObjectURL(blob);
//       link.setAttribute("href", url);
//       link.setAttribute("download", `Database_Toko_${new Date().toISOString().slice(0,10)}.csv`);
//       document.body.appendChild(link);
//       link.click();
//       document.body.removeChild(link);
//   };

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
//             fetchProducts(); 
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
//       // Ganti alert pencarian dengan notifikasi info
//       showNotify('info', 'Scan Berhasil', `Mencari SKU: ${sku}`);
//   };
  
//   const scrollToTop = () => { window.scrollTo({ top: 0, behavior: 'smooth' }); };
//   const clearSearch = () => { setSearchQuery(''); }; 

//   // --- FILTER PENCARIAN (HANYA NAMA & SKU) ---
//   const filteredProducts = products.filter(item => {
//     const query = searchQuery.toLowerCase().trim();
//     if (!query) return true; 

//     const itemName = (item.item_name || '').toLowerCase();
//     const sku = (item.sku || '').toLowerCase();

//     return itemName.includes(query) || sku.includes(query);
//   });

//   return (
//     <div className="pb-24 relative">
//       <div className="bg-white p-4 rounded-lg shadow-md min-h-[80vh]">
        
//         {/* Header */}
//         <div className="text-center mb-6">
//             <h2 className="text-xl font-bold text-blue-600">Manajemen Database</h2>
//             <div className="inline-flex items-center gap-2 mt-2 bg-blue-50 px-3 py-1 rounded-full border border-blue-100">
//                 <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></span>
//                 <p className="text-xs font-bold text-blue-700">Total : {products.length} Produk</p>
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

//         <div className="relative mb-4">
//           <Search className="absolute left-3 top-3.5 text-gray-400" size={20} />
//           <input 
//             type="text" 
//             value={searchQuery} 
//             onChange={(e) => setSearchQuery(e.target.value)}
//             placeholder="Cari Nama Barang atau SKU..." 
//             className="w-full pl-10 pr-12 py-3 border rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 outline-none"
//           />
//           {searchQuery && (
//              <button onClick={clearSearch} className="absolute right-12 top-2 bg-gray-100 p-1.5 rounded-full text-gray-500 hover:bg-gray-200 transition">
//                 <X size={16} />
//              </button>
//           )}
//           <button onClick={() => setShowScanner(!showScanner)} className="absolute right-2 top-2 bg-blue-100 p-1.5 rounded-md text-blue-600 hover:bg-blue-200 transition"><ScanLine size={24} /></button>
//         </div>

//         {/* List Data */}
//         {loading ? <p className="text-center py-10">Memuat data...</p> : (
//           <div className="space-y-3">
//              <div className="text-xs text-gray-400 mb-2 text-right">Menampilkan {filteredProducts.length} dari {products.length} data</div>
//             {filteredProducts.map((item) => (
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
//             {filteredProducts.length === 0 && <p className="text-center text-gray-400 mt-10">{searchQuery ? `Tidak ada Nama/SKU: "${searchQuery}"` : "Data kosong."}</p>}
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

////===================================================================================================



import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import { useAuth } from '../AuthProvider'; 
import Scanner from '../components/Scanner';
import ProductModal from '../components/ProductModal';
import { Search, Trash2, Edit, ScanLine, Download, Upload, Plus, ArrowUp, X, RefreshCw } from 'lucide-react';

// IMPORT MODALS
import ConfirmationModal from '../components/ConfirmationModal'; 
import NotificationModal from '../components/NotificationModal'; 

const ManagePage = () => {
  const { user } = useAuth(); 
  const [searchParams, setSearchParams] = useSearchParams();
  
  // State Data
  const [products, setProducts] = useState([]); // Hanya menyimpan data yang TAMPIL
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false); // Mode pencarian aktif/tidak
  
  // --- STATE MODAL & SCANNER ---
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentProduct, setCurrentProduct] = useState(null); 
  const [showScanner, setShowScanner] = useState(false);
  const fileInputRef = useRef(null);

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

  // --- 1. INIT LOAD (HANYA 50 DATA TERBARU) ---
  // Ini bikin aplikasi ringan karena tidak load ribuan data di awal
  useEffect(() => {
    if (user) {
        fetchRecentProducts();
    }
    const skuFromUrl = searchParams.get('sku');
    if (skuFromUrl) {
      setCurrentProduct({ sku: skuFromUrl }); 
      setIsModalOpen(true);
    }
  }, [searchParams, user]);

  const fetchRecentProducts = async () => {
    if (!user) return;
    setLoading(true);
    try {
        // Ambil 50 data terbaru saja untuk tampilan awal
        const { data, error } = await supabase
            .from('products')
            .select('*')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false })
            .limit(50);

        if (error) throw error;
        setProducts(data || []);
        setIsSearching(false); // Reset mode search
    } catch (error) {
        console.error("Error fetching recent:", error);
    } finally {
        setLoading(false);
    }
  };

  // --- 2. LOGIKA PENCARIAN SERVER-SIDE (AKURAT) ---
  // Mencari langsung ke DB berdasarkan SKU atau Nama
  const handleSearch = async (e) => {
      e?.preventDefault();
      const query = searchQuery.trim();
      
      if (!query) {
          fetchRecentProducts(); // Kembali ke tampilan awal jika kosong
          return;
      }

      setLoading(true);
      setIsSearching(true);

      try {
        const { data, error } = await supabase
          .from('products')
          .select('*')
          .eq('user_id', user.id) // Pastikan hanya data user ini
          // Filter: Nama ILIKE query OR SKU ILIKE query
          .or(`item_name.ilike.%${query}%,sku.ilike.%${query}%`)
          .limit(100); // Batasi hasil pencarian agar UI tidak berat

        if (error) throw error;
        setProducts(data || []);
      } catch (error) {
        showNotify('error', 'Gagal Mencari', error.message);
      } finally {
        setLoading(false);
      }
  };

  // --- 3. LOGIKA EKSPOR SEMUA DATA (LOOPING) ---
  // Fungsi ini khusus mengambil SEMUA data hanya saat tombol diklik
  const handleExport = async () => { 
      setLoading(true); // Tampilkan indikator loading karena ini mungkin agak lama
      try {
        let allData = [];
        let from = 0;
        const step = 1000; 
        let more = true;

        // Loop fetching sampai data habis
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
      
        // Generate CSV
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
      showNotify(
          'success', 
          'Berhasil', 
          isVariantMode ? 'Varian baru berhasil dibuat!' : (isUpdate ? 'Produk berhasil diperbarui!' : 'Produk berhasil ditambahkan!')
      );
      setIsModalOpen(false);
      setCurrentProduct(null);
      setSearchParams({});
      
      // Jika dalam mode search, kita refresh search-nya agar data baru muncul (jika sesuai keyword)
      // Jika mode biasa, refresh recent products
      if (isSearching) handleSearch();
      else fetchRecentProducts();
    }
  };

  // --- DELETE & IMPORT (Trigger Modal) ---
  const triggerDelete = (id, name) => {
    if (!user) return;
    setModalConfig({
        isOpen: true, type: 'DELETE', title: 'Hapus Produk?', message: `Apakah Anda yakin ingin menghapus "${name}"?`,
        data: { id }, confirmLabel: 'Hapus', isDanger: true 
    });
  };

  const triggerImport = () => {
    setModalConfig({
        isOpen: true, type: 'IMPORT', title: 'Import Data Excel?', message: 'PERINGATAN: Import ini akan MENGHAPUS SEMUA data lama Anda. Lanjutkan?',
        data: null, confirmLabel: 'Import Data', isDanger: false 
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
      try {
        const lines = csvText.split('\n');
        const dataToInsert = [];
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
            const line = lines[i].trim(); if (!line) continue;
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
                if (item_name) { 
                    dataToInsert.push({ user_id: user.id, category, sku: String(sku), item_name, brand_name, variant_name, price, wholesale_price }); 
                }
            }
        }

        if (dataToInsert.length > 0) {
            const { error: deleteError } = await supabase.from('products').delete().eq('user_id', user.id); 
            if (deleteError) throw deleteError;
            const { error: insertError } = await supabase.from('products').insert(dataToInsert);
            if (insertError) throw insertError;
            
            showNotify('success', 'Import Berhasil', `${dataToInsert.length} data baru berhasil dimasukkan.`);
            fetchRecentProducts(); 
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
      // Panggil fungsi search otomatis saat scan
      // Karena setSearchQuery async, kita panggil fungsi search manual dengan parameter
      performDirectSearch(sku);
  };

  // Fungsi helper untuk search langsung tanpa nunggu state update (buat scanner)
  const performDirectSearch = async (val) => {
      setLoading(true);
      setIsSearching(true);
      try {
        const { data, error } = await supabase
          .from('products')
          .select('*')
          .eq('user_id', user.id)
          .or(`item_name.ilike.%${val}%,sku.ilike.%${val}%`) // LOGIC SAMA DENGAN ATAS
          .limit(50);
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
      fetchRecentProducts(); // Reset ke data awal
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
                    {isSearching ? `Hasil Pencarian: ${products.length}` : `50 Data Terbaru`}
                </p>
            </div>
        </div>

        {/* Tombol Aksi */}
        <div className="flex flex-col gap-2 mb-6">
          <div className="flex gap-2">
            <button onClick={handleExport} className="flex-1 bg-green-600 text-white py-2 rounded-lg font-bold text-sm flex items-center justify-center gap-2 hover:bg-green-700 shadow"><Download size={18} /> Export Excel</button>
            <button onClick={triggerImport} className="flex-1 bg-blue-600 text-white py-2 rounded-lg font-bold text-sm flex items-center justify-center gap-2 hover:bg-blue-700 shadow"><Upload size={18} /> Import Excel</button>
          </div>
          <button onClick={handleOpenAdd} className="w-full bg-indigo-600 text-white py-2 rounded-lg font-bold text-sm flex items-center justify-center gap-2 hover:bg-indigo-700 shadow">
            <Plus size={18} /> Tambah Data Manual
          </button>
          <input type="file" ref={fileInputRef} onChange={handleFileChange} accept=".csv" className="hidden" />
        </div>

        {/* Scanner & Search */}
        {showScanner && (
          <div className="mb-4 animate-fade-in border p-2 rounded bg-gray-50">
            <p className="text-center text-sm font-bold mb-2">Scan Barcode untuk Mencari</p>
            <Scanner onScanResult={handleScanSearch} />
            <button onClick={() => setShowScanner(false)} className="w-full mt-2 bg-gray-200 text-gray-700 py-2 rounded">Tutup Kamera</button>
          </div>
        )}

        <form onSubmit={handleSearch} className="relative mb-4">
          <Search className="absolute left-3 top-3.5 text-gray-400" size={20} />
          <input 
            type="text" 
            value={searchQuery} 
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari Nama Barang atau SKU..." 
            className="w-full pl-10 pr-12 py-3 border rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 outline-none"
          />
          {searchQuery && (
             <button type="button" onClick={clearSearch} className="absolute right-12 top-2 bg-gray-100 p-1.5 rounded-full text-gray-500 hover:bg-gray-200 transition">
                <X size={16} />
             </button>
          )}
          <button type="button" onClick={() => setShowScanner(!showScanner)} className="absolute right-2 top-2 bg-blue-100 p-1.5 rounded-md text-blue-600 hover:bg-blue-200 transition"><ScanLine size={24} /></button>
        </form>

        {/* List Data */}
        {loading ? <p className="text-center py-10 text-gray-500 animate-pulse">Sedang memuat data...</p> : (
          <div className="space-y-3">
            {products.map((item) => (
              <div key={item.id} className="border p-3 rounded-lg shadow-sm bg-gray-50 flex justify-between items-center hover:bg-gray-50 transition">
                <div className="flex-1">
                  <div className="font-bold text-gray-800">{item.item_name}</div>
                  <div className="text-xs text-gray-500 flex flex-wrap gap-1 items-center mt-1">
                    <span className={`px-1.5 py-0.5 rounded text-[10px] ${searchQuery && item.sku.toLowerCase().includes(searchQuery.toLowerCase()) ? 'bg-yellow-200 text-yellow-800 font-bold' : 'bg-gray-200'}`}>
                        SKU: {item.sku}
                    </span>
                    <span className="bg-blue-50 text-blue-600 px-1.5 py-0.5 rounded text-[10px] border border-blue-100">{item.category}</span>
                    {item.brand_name && item.brand_name !== '-' && (
                        <span className="px-1.5 py-0.5 rounded text-[10px] border bg-purple-50 text-purple-600 border-purple-100">
                            {item.brand_name}
                        </span>
                    )}
                    {item.variant_name && <span className="bg-orange-50 text-orange-600 px-1.5 py-0.5 rounded text-[10px] border border-orange-100 font-medium">{item.variant_name}</span>}
                  </div>
                  
                  <div className="flex gap-3 mt-1">
                      <div className="text-sm font-bold text-blue-600">
                        Rp {(item.price || 0).toLocaleString()}
                      </div>
                      {item.wholesale_price > 0 && (
                        <div className="text-xs font-bold text-green-600 flex items-center bg-green-50 px-1 rounded">
                           Grosir: Rp {(item.wholesale_price).toLocaleString()}
                        </div>
                      )}
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
                    <p className="text-gray-400 mb-2">
                        {isSearching ? `Tidak ada Nama/SKU: "${searchQuery}"` : "Data kosong."}
                    </p>
                    {isSearching && (
                        <button onClick={clearSearch} className="text-blue-600 font-bold text-sm hover:underline flex items-center justify-center gap-1 mx-auto">
                            <RefreshCw size={14} /> Reset Pencarian
                        </button>
                    )}
                </div>
            )}
          </div>
        )}
      </div>

      <button onClick={scrollToTop} className="fixed bottom-24 right-6 bg-blue-600 text-white p-3 rounded-full shadow-lg hover:bg-blue-700 z-40 transition-all hover:scale-110 active:scale-95"><ArrowUp size={24} /></button>

      {/* RENDER MODALS */}
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