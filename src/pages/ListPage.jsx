

// //=============================================

// import React, { useState, useEffect } from 'react';
// import { useExportList } from '../ExportContext';
// import { useNavigate } from 'react-router-dom';
// import { Trash2, FileDown, ArrowLeft, AlertCircle, XCircle, Tag, Clock, Calendar, Filter, RotateCcw } from 'lucide-react';

// // Import komponen Modal
// import ConfirmationModal from '../components/ConfirmationModal'; 
// import NotificationModal from '../components/NotificationModal'; 

// const ListPage = () => {
//   const { exportList, clearExportList, removeFromExportList } = useExportList();
//   const navigate = useNavigate();

//   // --- 1. STATE UNTUK FILTER ---
//   const [startDate, setStartDate] = useState('');
//   const [endDate, setEndDate] = useState('');
//   const [filteredList, setFilteredList] = useState([]);
//   const [isFilterActive, setIsFilterActive] = useState(false);

//   // --- STATE MODAL ---
//   const [modalConfig, setModalConfig] = useState({
//     isOpen: false, type: null, id: null, name: '', title: '', message: '', confirmLabel: '', isDanger: false
//   });
//   const [notifyModal, setNotifyModal] = useState({ isOpen: false, type: 'success', title: '', message: '' });

//   // Helper Notifikasi
//   const showNotify = (type, title, message) => {
//     setNotifyModal({ isOpen: true, type, title, message });
//   };

//   // --- 2. HANDLER VALIDASI TANGGAL (BARU) ---
//   const handleStartDateChange = (e) => {
//       const newStart = e.target.value;
      
//       // Jika user memajukan tanggal mulai melebihi tanggal akhir yg sudah dipilih
//       if (endDate && newStart > endDate) {
//           showNotify('error', 'Tanggal Tidak Valid', 'Tanggal Mulai tidak boleh melebihi Tanggal Akhir. Tanggal Akhir akan direset.');
//           setEndDate(''); // Reset tanggal akhir biar user pilih ulang
//       }
//       setStartDate(newStart);
//   };

//   const handleEndDateChange = (e) => {
//       const newEnd = e.target.value;

//       // Validasi: Akhir tidak boleh kurang dari Mulai
//       if (startDate && newEnd < startDate) {
//           showNotify('error', 'Tanggal Tidak Valid', 'Tanggal Akhir tidak boleh lebih kecil dari Tanggal Mulai!');
//           return; // Jangan update state, biarkan tetap kosong/lama
//       }
//       setEndDate(newEnd);
//   };

//   // --- 3. SINKRONISASI DATA & LOGIKA FILTER ---
//   useEffect(() => {
//     const applyFilter = () => {
//         // Hanya filter jika KEDUA tanggal terisi
//         if (!startDate || !endDate) {
//             setFilteredList(exportList);
//             setIsFilterActive(false);
//             return;
//         }

//         const start = new Date(startDate);
//         start.setHours(0, 0, 0, 0); 

//         const end = new Date(endDate);
//         end.setHours(23, 59, 59, 999); 

//         const result = exportList.filter(item => {
//             const itemDate = new Date(item.created_at);
//             return itemDate >= start && itemDate <= end;
//         });

//         setFilteredList(result);
//         setIsFilterActive(true);
//     };

//     applyFilter();
//   }, [exportList, startDate, endDate]); 

//   // --- HANDLER RESET FILTER ---
//   const handleResetFilter = () => {
//       setStartDate('');
//       setEndDate('');
//       setFilteredList(exportList);
//       setIsFilterActive(false);
//   };

//   // --- HANDLER MODAL (Delete Logic) ---
//   const triggerClearAll = () => {
//     if (filteredList.length === 0) return;
//     setModalConfig({
//         isOpen: true,
//         type: 'DELETE_ALL',
//         title: 'Hapus Data Tampil?',
//         message: isFilterActive 
//             ? 'PERINGATAN: Aksi ini akan menghapus SEMUA data yang sesuai dengan filter tanggal saat ini.' 
//             : 'Tindakan ini akan mengosongkan seluruh list export Anda.',
//         confirmLabel: 'Hapus Semua',
//         isDanger: true
//     });
//   };

//   const triggerDeleteItem = (id, name) => {
//     setModalConfig({
//         isOpen: true,
//         type: 'DELETE_ONE',
//         id: id,
//         name: name,
//         title: 'Hapus Barang?',
//         message: `Apakah Anda yakin ingin menghapus "${name}" dari list?`,
//         confirmLabel: 'Ya, Hapus',
//         isDanger: true
//     });
//   };

//   const handleConfirmAction = () => {
//     if (modalConfig.type === 'DELETE_ALL') {
//         if (isFilterActive) {
//             filteredList.forEach(item => removeFromExportList(item.id));
//             showNotify('success', 'Dihapus', 'Data yang difilter berhasil dihapus.');
//         } else {
//             clearExportList();
//             showNotify('success', 'Bersih', 'Semua data berhasil dihapus.');
//         }
//     } else if (modalConfig.type === 'DELETE_ONE') {
//         removeFromExportList(modalConfig.id);
//     }
//     setModalConfig({ ...modalConfig, isOpen: false });
//   };

//   // --- LOGIKA DOWNLOAD ---
//   const handleDownload = () => {
//     if (filteredList.length === 0) {
//         showNotify('info', 'Data Kosong', 'Tidak ada data untuk diexport.');
//         return;
//     }

//     const header = "Category,SKU,Items Name (Do Not Edit),Brand Name,Variant name,Price,Wholesale Price,Date Scanned";

//     const rows = filteredList.map(item => { 
//       const category = `"${item.category || ''}"`;
//       const sku = `"${item.sku || '-'}"`; 
//       const name = `"${(item.item_name || '').replace(/"/g, '""')}"`; 
//       const brand = `"${item.brand_name || '-'}"`; 
//       const variant = `"${item.variant_name || ''}"`;
//       const price = item.price || 0;
//       const wholesale = item.wholesale_price || 0; 
//       const date = `"${new Date(item.created_at).toLocaleString('id-ID')}"`;

//       return `${category},${sku},${name},${brand},${variant},${price},${wholesale},${date}`;
//     });

//     const csvContent = [header, ...rows].join("\n");
//     const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
//     const link = document.createElement("a");
//     const url = URL.createObjectURL(blob);
//     link.setAttribute("href", url);
    
//     const dateLabel = isFilterActive ? `_${startDate}_sd_${endDate}` : '_All';
//     link.setAttribute("download", `Export_Stok${dateLabel}.csv`);
    
//     document.body.appendChild(link);
//     link.click();
//     document.body.removeChild(link);
//   };

//   return (
//     <div className="min-h-screen bg-gray-50 pb-44">
      
//       {/* --- HEADER --- */}
//       <div className="bg-white p-4 shadow-sm sticky top-0 z-20">
//         <div className="flex items-center justify-between mb-2">
//             <div className="flex items-center gap-3">
//             <button onClick={() => navigate(-1)} className="p-2 rounded-full hover:bg-gray-100 transition">
//                 <ArrowLeft size={24} className="text-gray-600" />
//             </button>
//             <h1 className="text-xl font-bold text-gray-800">List Export</h1>
//             </div>
//             <div className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-xs font-bold">
//             {filteredList.length} / {exportList.length} Item
//             </div>
//         </div>

//         {/* --- AREA FILTER TANGGAL --- */}
//         <div className="bg-gray-50 p-3 rounded-xl border border-gray-200 mt-2">
//             <div className="flex items-center gap-2 mb-2 text-gray-500 text-xs font-bold uppercase tracking-wide">
//                 <Filter size={12} /> Filter Tanggal
//             </div>
//             <div className="flex gap-2">
                
//                 {/* INPUT TANGGAL MULAI */}
//                 <div className="flex-1 relative">
//                     <input 
//                         type="date" 
//                         value={startDate}
//                         onChange={handleStartDateChange} // Pakai handler baru
//                         max={endDate} // UI UX: Gak bisa pilih tanggal setelah End Date
//                         className="w-full text-xs p-2 rounded-lg border border-gray-300 outline-none focus:ring-2 focus:ring-blue-500"
//                     />
//                 </div>
                
//                 <span className="self-center text-gray-400">-</span>
                
//                 {/* INPUT TANGGAL AKHIR */}
//                 <div className="flex-1 relative">
//                     <input 
//                         type="date" 
//                         value={endDate}
//                         onChange={handleEndDateChange} // Pakai handler baru
//                         min={startDate} // UI UX: Gak bisa pilih tanggal sebelum Start Date
//                         className="w-full text-xs p-2 rounded-lg border border-gray-300 outline-none focus:ring-2 focus:ring-blue-500"
//                     />
//                 </div>

//                 {isFilterActive && (
//                     <button 
//                         onClick={handleResetFilter}
//                         className="bg-gray-200 text-gray-600 p-2 rounded-lg hover:bg-gray-300 transition"
//                         title="Reset Filter"
//                     >
//                         <RotateCcw size={16} />
//                     </button>
//                 )}
//             </div>
//         </div>
//       </div>

//       <div className="p-4 max-w-md mx-auto mt-2">
        
//         {/* Header List & Tombol Hapus */}
//         <div className="flex justify-between items-end mb-3">
//             <h3 className="font-bold text-gray-700 text-lg">
//                 {isFilterActive ? 'Hasil Filter' : 'Semua Barang'}
//             </h3>
//             {filteredList.length > 0 && (
//                 <button 
//                     onClick={triggerClearAll} 
//                     className="text-red-500 text-xs font-semibold flex items-center gap-1 bg-red-50 px-3 py-1.5 rounded-lg hover:bg-red-100 border border-red-100 transition"
//                 >
//                     <XCircle size={14}/> {isFilterActive ? 'Hapus Hasil Filter' : 'Hapus Semua'}
//                 </button>
//             )}
//         </div>

//         {/* List Content */}
//         {filteredList.length === 0 ? (
//           <div className="text-center py-12 border-2 border-dashed border-gray-300 rounded-xl bg-white mt-4">
//             <AlertCircle size={48} className="mx-auto text-gray-300 mb-3" />
//             <p className="text-gray-500 font-medium">
//                 {isFilterActive ? 'Tidak ada data pada rentang tanggal ini' : 'List Masih Kosong'}
//             </p>
//             {isFilterActive ? (
//                 <button onClick={handleResetFilter} className="mt-4 text-blue-600 font-bold text-xs hover:underline">
//                     Reset Filter
//                 </button>
//             ) : (
//                 <p className="text-xs text-gray-400 mt-1">Data scan akan muncul disini</p>
//             )}
//           </div>
//         ) : (
//           <div className="space-y-3">
//             {filteredList.map((item, index) => (
//               <div key={`${item.id}-${index}`} className="bg-white p-3 rounded-lg shadow-sm border border-gray-200 flex justify-between items-start hover:shadow-md transition">
                
//                 {/* Detail Barang */}
//                 <div className="flex-1 pr-2">
//                   <div className="font-bold text-gray-800 text-base mb-1.5 leading-tight">{item.item_name}</div>
                  
//                   <div className="grid grid-cols-1 gap-1 text-sm text-gray-600 bg-gray-50 p-2 rounded-md border border-gray-100">
//                     <div className="flex items-center gap-2 flex-wrap">
//                       <span className="bg-white border px-1.5 rounded font-mono text-xs text-gray-500 font-bold tracking-wide">
//                         {item.sku}
//                       </span>
//                       <span className="flex items-center gap-1 text-blue-600 bg-blue-50 px-1.5 rounded text-[10px] font-bold border border-blue-100 uppercase tracking-wide">
//                         <Tag size={10} /> {item.category || 'NO-CAT'}
//                       </span>
//                     </div>

//                     <div className="flex flex-wrap gap-2 mt-1">
//                         {item.brand_name && item.brand_name !== '-' && (
//                             <span className="text-[10px] text-purple-600 bg-purple-50 px-1.5 rounded border border-purple-100">
//                                 {item.brand_name}
//                             </span>
//                         )}
//                         {item.variant_name && (
//                             <span className="text-[10px] text-orange-600 bg-orange-50 px-1.5 rounded border border-orange-100">
//                                 {item.variant_name}
//                             </span>
//                         )}
//                     </div>
                    
//                     <div className="flex items-center gap-1 text-[10px] text-gray-400 mt-1 border-t border-gray-100 pt-1">
//                         <Clock size={10} />
//                         {item.created_at ? new Date(item.created_at).toLocaleString('id-ID') : '-'}
//                     </div>
//                   </div>

//                   <div className="mt-2 flex items-baseline gap-3">
//                       <div>
//                           <span className="text-[10px] text-gray-400 font-semibold block leading-none">Normal</span>
//                           <span className="text-base font-bold text-blue-600">
//                             Rp {item.price ? item.price.toLocaleString() : '0'}
//                           </span>
//                       </div>
//                       {item.wholesale_price > 0 && (
//                           <div className="pl-3 border-l border-gray-200">
//                               <span className="text-[10px] text-gray-400 font-semibold block leading-none">Grosir</span>
//                               <span className="text-sm font-bold text-green-600">
//                                 Rp {item.wholesale_price.toLocaleString()}
//                               </span>
//                           </div>
//                       )}
//                   </div>
//                 </div>

//                 <button 
//                   onClick={() => triggerDeleteItem(item.id, item.item_name)} 
//                   className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition mt-1"
//                 >
//                   <Trash2 size={20} />
//                 </button>
//               </div>
//             ))}
//           </div>
//         )}
//       </div>

//       {/* Floating Download Button */}
//       {filteredList.length > 0 && (
//         <div className="fixed bottom-20 left-0 right-0 px-4 z-20 pointer-events-none">
//             <div className="max-w-md mx-auto pointer-events-auto">
//                 <button 
//                     onClick={handleDownload}
//                     className="w-full bg-green-600 text-white font-bold py-3.5 rounded-xl shadow-xl hover:bg-green-700 flex justify-center items-center gap-2 active:scale-95 transition border-2 border-white/20"
//                 >
//                     <FileDown size={20} />
//                     {isFilterActive ? 'Download (Filtered)' : 'Download Semua CSV'}
//                 </button>
//             </div>
//         </div>
//       )}

//       {/* MODALS */}
//       <ConfirmationModal 
//         isOpen={modalConfig.isOpen}
//         onClose={() => setModalConfig({ ...modalConfig, isOpen: false })}
//         onConfirm={handleConfirmAction}
//         title={modalConfig.title}
//         message={modalConfig.message}
//         confirmLabel={modalConfig.confirmLabel}
//         isDanger={modalConfig.isDanger}
//       />

//       <NotificationModal 
//         isOpen={notifyModal.isOpen}
//         onClose={() => setNotifyModal({ ...notifyModal, isOpen: false })}
//         type={notifyModal.type}
//         title={notifyModal.title}
//         message={notifyModal.message}
//       />

//     </div>
//   );
// };

// export default ListPage;


//=======================================================


import React, { useState, useEffect } from 'react';
import { useExportList } from '../ExportContext';
import { useNavigate } from 'react-router-dom';
import { Trash2, FileDown, ArrowLeft, AlertCircle, XCircle, Tag, Clock, Calendar, Filter, RotateCcw } from 'lucide-react';

// Import komponen Modal
import ConfirmationModal from '../components/ConfirmationModal'; 
import NotificationModal from '../components/NotificationModal'; 

const ListPage = () => {
  const { exportList, clearExportList, removeFromExportList } = useExportList();
  const navigate = useNavigate();

  // --- 1. STATE DENGAN LOCAL STORAGE ---
  // Kita cek dulu di Local Storage, kalau ada pakai itu, kalau tidak kosongkan ('')
  const [startDate, setStartDate] = useState(() => localStorage.getItem('filter_startDate') || '');
  const [endDate, setEndDate] = useState(() => localStorage.getItem('filter_endDate') || '');
  
  const [filteredList, setFilteredList] = useState([]);
  const [isFilterActive, setIsFilterActive] = useState(false);

  // --- STATE MODAL ---
  const [modalConfig, setModalConfig] = useState({
    isOpen: false, type: null, id: null, name: '', title: '', message: '', confirmLabel: '', isDanger: false
  });
  const [notifyModal, setNotifyModal] = useState({ isOpen: false, type: 'success', title: '', message: '' });

  // Helper Notifikasi
  const showNotify = (type, title, message) => {
    setNotifyModal({ isOpen: true, type, title, message });
  };

  // --- 2. EFFECT UNTUK MENYIMPAN KE LOCAL STORAGE ---
  useEffect(() => {
      // Setiap kali startDate atau endDate berubah, simpan ke memori HP/Browser
      if (startDate) localStorage.setItem('filter_startDate', startDate);
      else localStorage.removeItem('filter_startDate');

      if (endDate) localStorage.setItem('filter_endDate', endDate);
      else localStorage.removeItem('filter_endDate');
  }, [startDate, endDate]);

  // --- HANDLER VALIDASI TANGGAL ---
  const handleStartDateChange = (e) => {
      const newStart = e.target.value;
      if (endDate && newStart > endDate) {
          showNotify('error', 'Tanggal Tidak Valid', 'Tanggal Mulai tidak boleh melebihi Tanggal Akhir. Tanggal Akhir direset.');
          setEndDate(''); 
      }
      setStartDate(newStart);
  };

  const handleEndDateChange = (e) => {
      const newEnd = e.target.value;
      if (startDate && newEnd < startDate) {
          showNotify('error', 'Tanggal Tidak Valid', 'Tanggal Akhir tidak boleh lebih kecil dari Tanggal Mulai!');
          return; 
      }
      setEndDate(newEnd);
  };

  // --- 3. LOGIKA FILTER (SINKRONISASI DATA) ---
  useEffect(() => {
    const applyFilter = () => {
        if (!startDate || !endDate) {
            setFilteredList(exportList);
            setIsFilterActive(false);
            return;
        }

        const start = new Date(startDate);
        start.setHours(0, 0, 0, 0); 

        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999); 

        const result = exportList.filter(item => {
            const itemDate = new Date(item.created_at);
            return itemDate >= start && itemDate <= end;
        });

        setFilteredList(result);
        setIsFilterActive(true);
    };

    applyFilter();
  }, [exportList, startDate, endDate]); 

  // --- HANDLER RESET FILTER ---
  const handleResetFilter = () => {
      setStartDate('');
      setEndDate('');
      // LocalStorage akan otomatis terhapus karena useEffect di poin nomor 2 mendeteksi perubahan state jadi kosong
      setFilteredList(exportList);
      setIsFilterActive(false);
  };

  // --- HANDLER MODAL (Delete Logic) ---
  const triggerClearAll = () => {
    if (filteredList.length === 0) return;
    setModalConfig({
        isOpen: true,
        type: 'DELETE_ALL',
        title: 'Hapus Data Tampil?',
        message: isFilterActive 
            ? 'PERINGATAN: Aksi ini akan menghapus SEMUA data yang sesuai dengan filter tanggal saat ini.' 
            : 'Tindakan ini akan mengosongkan seluruh list export Anda.',
        confirmLabel: 'Hapus Semua',
        isDanger: true
    });
  };

  const triggerDeleteItem = (id, name) => {
    setModalConfig({
        isOpen: true,
        type: 'DELETE_ONE',
        id: id,
        name: name,
        title: 'Hapus Barang?',
        message: `Apakah Anda yakin ingin menghapus "${name}" dari list?`,
        confirmLabel: 'Ya, Hapus',
        isDanger: true
    });
  };

  const handleConfirmAction = () => {
    if (modalConfig.type === 'DELETE_ALL') {
        if (isFilterActive) {
            filteredList.forEach(item => removeFromExportList(item.id));
            showNotify('success', 'Dihapus', 'Data yang difilter berhasil dihapus.');
        } else {
            clearExportList();
            showNotify('success', 'Bersih', 'Semua data berhasil dihapus.');
        }
    } else if (modalConfig.type === 'DELETE_ONE') {
        removeFromExportList(modalConfig.id);
    }
    setModalConfig({ ...modalConfig, isOpen: false });
  };

  // --- LOGIKA DOWNLOAD ---
//   const handleDownload = () => {
//     if (filteredList.length === 0) {
//         showNotify('info', 'Data Kosong', 'Tidak ada data untuk diexport.');
//         return;
//     }

//     const header = "Category,SKU,Items Name (Do Not Edit),Brand Name,Variant name,Price,Harga Grosir";
    

//     const rows = filteredList.map(item => { 
//       const category = `"${item.category || ''}"`;
      
//       const sku = `"${item.sku || ''}"`; 
//       const name = `"${(item.item_name || '').replace(/"/g, '""')}"`; 
//       const brand = `"${item.brand_name || ''}"`; 
//       const variant = `"${item.variant_name || ''}"`;
//       const price = item.price || '';
//       const wholesale = item.wholesale_price || ''; 
//     //   const date = `"${new Date(item.created_at).toLocaleString('id-ID')}"`;

//     //   return `${category},${sku},${name},${brand},${variant},${price},${wholesale},${date}`;
//     return `${category},${sku},${name},${brand},${variant},${price},${wholesale}`;
//     });

//     const csvContent = [header, ...rows].join("\n");
//     const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
//     const link = document.createElement("a");
//     const url = URL.createObjectURL(blob);
//     link.setAttribute("href", url);
    
//     const dateLabel = isFilterActive ? `_${startDate}_sd_${endDate}` : '_All';
//     link.setAttribute("download", `Export_Stok${dateLabel}.csv`);
    
//     document.body.appendChild(link);
//     link.click();
//     document.body.removeChild(link);
//   };

// --- LOGIKA DOWNLOAD (UPDATED V3) ---
  const handleDownload = () => {
    if (filteredList.length === 0) {
        showNotify('info', 'Data Kosong', 'Tidak ada data untuk diexport.');
        return;
    }

    // 1. CEK APAKAH ADA BARANG YANG PUNYA HARGA GROSIR?
    const hasWholesale = filteredList.some(item => item.wholesale_price && item.wholesale_price > 0);

    // 2. SUSUN HEADER DINAMIS
    // Bagian 1: Header Awal sampai Image 12
    let headerParts = [
        "Internal ID Variant (Do Not Edit)", "Category", "SKU", "Items Name (Do Not Edit)", 
        "ecommerce item? (Yes/No)", "Pre-order ? (Yes/No)", "Processing days", 
        "Weight (gm)", "Length (cm)", "Width (cm)", "Height (cm)", "Condition", 
        "Brand Name", "Variant name", "Basic - Price", // <--- Basic Price Tetap Ada
        "Image 1 (for Online Store)", "Image 2 (for Online Store)", "Image 3 (for Online Store)", 
        "Image 4 (for Online Store)", "Image 5 (for Online Store)", "Image 6 (for Online Store)", 
        "Image 7 (for Online Store)", "Image 8 (for Online Store)", "Image 9 (for Online Store)", 
        "Image 10 (for Online Store)", "Image 11 (for Online Store)", "Image 12 (for Online Store)"
    ];

    // Bagian 2: Kondisional Header (Normal & Grosir)
    if (hasWholesale) {
        headerParts.push("1. HARGA NORMAL - Price");
        headerParts.push("2. HARGA GROSIR - Price");
    }

    // Bagian 3: Header Akhir
    headerParts.push("In Stock", "Track Stock", "Track Alert", "Stock Alert", "Track Cost", "Cost Amount");

    // Gabungkan Header jadi string
    const header = headerParts.join(",");

    // 3. SUSUN BARIS DATA
    const rows = filteredList.map(item => { 
      const category = `"${item.category || ''}"`;
      const sku = `"${item.sku || ''}"`; 
      const name = `"${(item.item_name || '').replace(/"/g, '""')}"`; 
      const brand = `"${item.brand_name || ''}"`; 
      const variant = `"${item.variant_name || ''}"`;
      
      const price = item.price || 0;
      const wholesale = item.wholesale_price || 0;

      // Logika Isi Basic Price
      // Kalau ada mode grosir, Basic Price dikosongkan. Kalau tidak ada, diisi harga normal.
      const basicPriceVal = hasWholesale ? '' : price;

      // Array Baris Dasar
      let rowArray = [
        '""',           // Internal ID
        category,       
        sku,            
        name,           
        '""', '""', '""', '""', '""', '""', '""', '""', // E-commerce fields kosong
        brand,          
        variant,        
        basicPriceVal,  // Basic - Price (Isi atau Kosong tergantung kondisi)
        
        // --- 12 IMAGE KOSONG ---
        '""','""','""','""','""','""','""','""','""','""','""','""'
      ];

      // Kondisional Isi (Normal & Grosir)
      if (hasWholesale) {
          rowArray.push(price);     // 1. HARGA NORMAL
          rowArray.push(wholesale); // 2. HARGA GROSIR
      }

      // Array Akhir (Stock dll)
      rowArray.push('""', '""', '""', '""', '""', '""');

      return rowArray.join(",");
    });

    // 4. BIKIN FILE CSV
    const csvContent = [header, ...rows].join("\n");
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    
    // Nama File: Tambahkan penanda jika ada grosir
    const typeLabel = hasWholesale ? '_MultiHarga' : '_SingleHarga';
    const dateLabel = isFilterActive ? `_${startDate}_sd_${endDate}` : '_All';
    link.setAttribute("download", `Export_Moka${typeLabel}${dateLabel}.csv`);
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-44">
      
      {/* --- HEADER --- */}
      <div className="bg-white p-4 shadow-sm sticky top-0 z-20">
        <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-3">
            <button onClick={() => navigate(-1)} className="p-2 rounded-full hover:bg-gray-100 transition">
                <ArrowLeft size={24} className="text-gray-600" />
            </button>
            <h1 className="text-xl font-bold text-gray-800">List Export</h1>
            </div>
            <div className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-xs font-bold">
            {filteredList.length} / {exportList.length} Item
            </div>
        </div>

        {/* --- AREA FILTER TANGGAL --- */}
        <div className="bg-gray-50 p-3 rounded-xl border border-gray-200 mt-2">
            <div className="flex items-center gap-2 mb-2 text-gray-500 text-xs font-bold uppercase tracking-wide">
                <Filter size={12} /> Filter Tanggal
            </div>
            <div className="flex gap-2">
                
                {/* INPUT TANGGAL MULAI */}
                <div className="flex-1 relative">
                    <input 
                        type="date" 
                        value={startDate}
                        onChange={handleStartDateChange} 
                        max={endDate} 
                        className="w-full text-xs p-2 rounded-lg border border-gray-300 outline-none focus:ring-2 focus:ring-blue-500"
                    />
                </div>
                
                <span className="self-center text-gray-400">-</span>
                
                {/* INPUT TANGGAL AKHIR */}
                <div className="flex-1 relative">
                    <input 
                        type="date" 
                        value={endDate}
                        onChange={handleEndDateChange} 
                        min={startDate} 
                        className="w-full text-xs p-2 rounded-lg border border-gray-300 outline-none focus:ring-2 focus:ring-blue-500"
                    />
                </div>

                {isFilterActive && (
                    <button 
                        onClick={handleResetFilter}
                        className="bg-gray-200 text-gray-600 p-2 rounded-lg hover:bg-gray-300 transition"
                        title="Reset Filter"
                    >
                        <RotateCcw size={16} />
                    </button>
                )}
            </div>
        </div>
      </div>

      <div className="p-4 max-w-md mx-auto mt-2">
        
        {/* Header List & Tombol Hapus */}
        <div className="flex justify-between items-end mb-3">
            <h3 className="font-bold text-gray-700 text-lg">
                {isFilterActive ? 'Hasil Filter' : 'Semua Barang'}
            </h3>
            {filteredList.length > 0 && (
                <button 
                    onClick={triggerClearAll} 
                    className="text-red-500 text-xs font-semibold flex items-center gap-1 bg-red-50 px-3 py-1.5 rounded-lg hover:bg-red-100 border border-red-100 transition"
                >
                    <XCircle size={14}/> {isFilterActive ? 'Hapus Hasil Filter' : 'Hapus Semua'}
                </button>
            )}
        </div>

        {/* List Content */}
        {filteredList.length === 0 ? (
          <div className="text-center py-12 border-2 border-dashed border-gray-300 rounded-xl bg-white mt-4">
            <AlertCircle size={48} className="mx-auto text-gray-300 mb-3" />
            <p className="text-gray-500 font-medium">
                {isFilterActive ? 'Tidak ada data pada rentang tanggal ini' : 'List Masih Kosong'}
            </p>
            {isFilterActive ? (
                <button onClick={handleResetFilter} className="mt-4 text-blue-600 font-bold text-xs hover:underline">
                    Reset Filter
                </button>
            ) : (
                <p className="text-xs text-gray-400 mt-1">Data scan akan muncul disini</p>
            )}
          </div>
        ) : (
          <div className="space-y-3">
            {filteredList.map((item, index) => (
              <div key={`${item.id}-${index}`} className="bg-white p-3 rounded-lg shadow-sm border border-gray-200 flex justify-between items-start hover:shadow-md transition">
                
                {/* Detail Barang */}
                <div className="flex-1 pr-2">
                  <div className="font-bold text-gray-800 text-base mb-1.5 leading-tight">{item.item_name}</div>
                  
                  <div className="grid grid-cols-1 gap-1 text-sm text-gray-600 bg-gray-50 p-2 rounded-md border border-gray-100">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="bg-white border px-1.5 rounded font-mono text-xs text-gray-500 font-bold tracking-wide">
                        {item.sku}
                      </span>
                      <span className="flex items-center gap-1 text-blue-600 bg-blue-50 px-1.5 rounded text-[10px] font-bold border border-blue-100 uppercase tracking-wide">
                        <Tag size={10} /> {item.category || 'NO-CAT'}
                      </span>
                    </div>

                    <div className="flex flex-wrap gap-2 mt-1">
                        {item.brand_name && item.brand_name !== '-' && (
                            <span className="text-[10px] text-purple-600 bg-purple-50 px-1.5 rounded border border-purple-100">
                                {item.brand_name}
                            </span>
                        )}
                        {item.variant_name && (
                            <span className="text-[10px] text-orange-600 bg-orange-50 px-1.5 rounded border border-orange-100">
                                {item.variant_name}
                            </span>
                        )}
                    </div>
                    
                    <div className="flex items-center gap-1 text-[10px] text-gray-400 mt-1 border-t border-gray-100 pt-1">
                        <Clock size={10} />
                        {item.created_at ? new Date(item.created_at).toLocaleString('id-ID') : '-'}
                    </div>
                  </div>

                  <div className="mt-2 flex items-baseline gap-3">
                      <div>
                          <span className="text-[10px] text-gray-400 font-semibold block leading-none">Normal</span>
                          <span className="text-base font-bold text-blue-600">
                            Rp {item.price ? item.price.toLocaleString() : '0'}
                          </span>
                      </div>
                      {item.wholesale_price > 0 && (
                          <div className="pl-3 border-l border-gray-200">
                              <span className="text-[10px] text-gray-400 font-semibold block leading-none">Grosir</span>
                              <span className="text-sm font-bold text-green-600">
                                Rp {item.wholesale_price.toLocaleString()}
                              </span>
                          </div>
                      )}
                  </div>
                </div>

                <button 
                  onClick={() => triggerDeleteItem(item.id, item.item_name)} 
                  className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition mt-1"
                >
                  <Trash2 size={20} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Floating Download Button */}
      {filteredList.length > 0 && (
        <div className="fixed bottom-20 left-0 right-0 px-4 z-20 pointer-events-none">
            <div className="max-w-md mx-auto pointer-events-auto">
                <button 
                    onClick={handleDownload}
                    className="w-full bg-green-600 text-white font-bold py-3.5 rounded-xl shadow-xl hover:bg-green-700 flex justify-center items-center gap-2 active:scale-95 transition border-2 border-white/20"
                >
                    <FileDown size={20} />
                    {isFilterActive ? 'Download (Filtered)' : 'Download Semua CSV'}
                </button>
            </div>
        </div>
      )}

      {/* MODALS */}
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
        onClose={() => setNotifyModal({ ...notifyModal, isOpen: false })}
        type={notifyModal.type}
        title={notifyModal.title}
        message={notifyModal.message}
      />

    </div>
  );
};

export default ListPage;