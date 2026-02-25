
// //=======================================================


// import React, { useState, useEffect } from 'react';
// import { useExportList } from '../ExportContext';
// import { useNavigate } from 'react-router-dom';
// import { Trash2, FileDown, ArrowLeft, AlertCircle, XCircle, Tag, Clock, Calendar, Filter, RotateCcw, Package } from 'lucide-react';

// // Import komponen Modal
// import ConfirmationModal from '../components/ConfirmationModal'; 
// import NotificationModal from '../components/NotificationModal'; 

// const ListPage = () => {
//   const { exportList, clearExportList, removeFromExportList } = useExportList();
//   const navigate = useNavigate();

//   // --- 1. STATE DENGAN LOCAL STORAGE ---
//   const [startDate, setStartDate] = useState(() => localStorage.getItem('filter_startDate') || '');
//   const [endDate, setEndDate] = useState(() => localStorage.getItem('filter_endDate') || '');
  
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

//   // --- 2. EFFECT UNTUK MENYIMPAN KE LOCAL STORAGE ---
//   useEffect(() => {
//       if (startDate) localStorage.setItem('filter_startDate', startDate);
//       else localStorage.removeItem('filter_startDate');

//       if (endDate) localStorage.setItem('filter_endDate', endDate);
//       else localStorage.removeItem('filter_endDate');
//   }, [startDate, endDate]);

//   // --- HANDLER VALIDASI TANGGAL ---
//   const handleStartDateChange = (e) => {
//       const newStart = e.target.value;
//       if (endDate && newStart > endDate) {
//           showNotify('error', 'Tanggal Tidak Valid', 'Tanggal Mulai tidak boleh melebihi Tanggal Akhir. Tanggal Akhir direset.');
//           setEndDate(''); 
//       }
//       setStartDate(newStart);
//   };

//   const handleEndDateChange = (e) => {
//       const newEnd = e.target.value;
//       if (startDate && newEnd < startDate) {
//           showNotify('error', 'Tanggal Tidak Valid', 'Tanggal Akhir tidak boleh lebih kecil dari Tanggal Mulai!');
//           return; 
//       }
//       setEndDate(newEnd);
//   };

//   // --- 3. LOGIKA FILTER (SINKRONISASI DATA) ---
//   useEffect(() => {
//     const applyFilter = () => {
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
//         title: 'Mao hapus semua data Produk kah Bro?',
//         message: isFilterActive 
//             ? 'PERINGATAN: Aksi ini akan menghapus SEMUA data yang sesuai dengan filter tanggal saat ini.' 
//             : 'Benaran kosong ni list ekspor!.',
//         confirmLabel: 'Gass lah',
//         isDanger: true
//     });
//   };

//   const triggerDeleteItem = (id, name) => {
//     setModalConfig({
//         isOpen: true,
//         type: 'DELETE_ONE',
//         id: id,
//         name: name,
//         title: 'Hapus Kah?',
//         message: `Yakin mau hapus "${name}" dari list?`,
//         confirmLabel: 'Gass',
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

//   // --- LOGIKA DOWNLOAD (CANGGIH: MULTI HARGA OTOMATIS) ---
//   const handleDownload = () => {
//     if (filteredList.length === 0) {
//         showNotify('info', 'Data Kosong', 'Tidak ada data untuk diexport.');
//         return;
//     }

//     // Cek apakah ada barang yang punya harga grosir?
//     const hasWholesale = filteredList.some(item => item.wholesale_price && item.wholesale_price > 0);

//     // Header Dinamis
//     let headerParts = [
//         "Internal ID Variant (Do Not Edit)", "Category", "SKU", "Items Name (Do Not Edit)", 
//         "ecommerce item? (Yes/No)", "Pre-order ? (Yes/No)", "Processing days", 
//         "Weight (gm)", "Length (cm)", "Width (cm)", "Height (cm)", "Condition", 
//         "Brand Name", "Variant name", "Basic - Price", 
//         "Image 1 (for Online Store)", "Image 2 (for Online Store)", "Image 3 (for Online Store)", 
//         "Image 4 (for Online Store)", "Image 5 (for Online Store)", "Image 6 (for Online Store)", 
//         "Image 7 (for Online Store)", "Image 8 (for Online Store)", "Image 9 (for Online Store)", 
//         "Image 10 (for Online Store)", "Image 11 (for Online Store)", "Image 12 (for Online Store)"
//     ];

//     if (hasWholesale) {
//         headerParts.push("1. HARGA NORMAL - Price");
//         headerParts.push("2. HARGA GROSIR - Price");
//     }

//     headerParts.push("In Stock", "Track Stock", "Track Alert", "Stock Alert", "Track Cost", "Cost Amount");

//     const header = headerParts.join(",");

//     const rows = filteredList.map(item => { 
//       const category = `"${item.category || ''}"`;
//       const sku = `"${item.sku || ''}"`; 
//       const name = `"${(item.item_name || '').replace(/"/g, '""')}"`; 
//       const brand = `"${item.brand_name || ''}"`; 
//       const variant = `"${item.variant_name || ''}"`;
      
//       const price = item.price || '';
//       const wholesale = item.wholesale_price || '';

//       // Jika ada grosir, Basic Price kosong. Jika tidak, Basic Price isi harga.
//       const basicPriceVal = hasWholesale ? '' : price;

//       let rowArray = [
//         '""', category, sku, name, '"No"', '"No"', '"0"', '""', '""', '""', '""', '""',
//         brand, variant, basicPriceVal,
//         '""','""','""','""','""','""','""','""','""','""','""','""'
//       ];

//       if (hasWholesale) {
//           rowArray.push(price);
//           rowArray.push(wholesale);
//       }

//     //   rowArray.push('""', '""', '""', '""', '""', '""');
//       rowArray.push('"0"', '"No"', '"No"', '"0"', '"No"', '""');

//       return rowArray.join(",");
//     });

//     const csvContent = [header, ...rows].join("\n");
//     const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
//     const link = document.createElement("a");
//     const url = URL.createObjectURL(blob);
//     link.setAttribute("href", url);
    
//     const typeLabel = hasWholesale ? '_MultiHarga' : '_SingleHarga';
//     const dateLabel = isFilterActive ? `_${startDate}_sd_${endDate}` : '_All';
//     link.setAttribute("download", `Export_Moka${typeLabel}${dateLabel}.csv`);
    
//     document.body.appendChild(link);
//     link.click();
//     document.body.removeChild(link);
//   };

//   // --- 4. HITUNG JUMLAH PRODUK UNIK (BARU) ---
//   // Logika: Gabungkan "Nama|Kategori" lalu masukkan ke Set agar unik
//   const uniqueProductCount = new Set(
//     filteredList.map(item => {
//         const name = (item.item_name || '').trim().toLowerCase();
//         const cat = (item.category || '').trim().toLowerCase();
//         return `${name}|${cat}`;
//     })
//   ).size;

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

//             {/* --- INFO JUMLAH (ITEM & PRODUK) --- */}
//             <div className="flex flex-col items-end">
//                 <div className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-xs font-bold shadow-sm">
//                     {filteredList.length} / {exportList.length} Item
//                 </div>
//                 {/* Tampilan Jumlah Produk */}
//                 <div className="text-[10px] text-gray-500 font-bold mt-1 mr-1 flex items-center gap-1">
//                     <Package size={12} className="text-gray-400"/> 
//                     {uniqueProductCount} Produk
//                 </div>
//             </div>
//         </div>

//         {/* --- AREA FILTER TANGGAL --- */}
//         <div className="bg-gray-50 p-3 rounded-xl border border-gray-200 mt-2">
//             <div className="flex items-center gap-2 mb-2 text-gray-500 text-xs font-bold uppercase tracking-wide">
//                 <Filter size={12} /> Filter Tanggal
//             </div>
//             <div className="flex gap-2">
//                 <div className="flex-1 relative">
//                     <input 
//                         type="date" 
//                         value={startDate}
//                         onChange={handleStartDateChange} 
//                         max={endDate} 
//                         className="w-full text-xs p-2 rounded-lg border border-gray-300 outline-none focus:ring-2 focus:ring-blue-500"
//                     />
//                 </div>
//                 <span className="self-center text-gray-400">-</span>
//                 <div className="flex-1 relative">
//                     <input 
//                         type="date" 
//                         value={endDate}
//                         onChange={handleEndDateChange} 
//                         min={startDate} 
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

//       {filteredList.length > 0 && (
//         <div className="fixed bottom-20 left-0 right-0 px-4 z-20 pointer-events-none">
//             <div className="max-w-md mx-auto pointer-events-auto">
//                 <button 
//                     onClick={handleDownload}
//                     className="w-full bg-green-600 text-white font-bold py-3.5 rounded-xl shadow-xl hover:bg-green-700 flex justify-center items-center gap-2 active:scale-95 transition border-2 border-white/20"
//                 >
//                     <FileDown size={20} />
//                     {isFilterActive ? 'Download Filter Data' : 'Download Semua Data'}
//                 </button>
//             </div>
//         </div>
//       )}

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

//====================================================================

import React, { useState, useEffect, useMemo } from 'react';
import { useExportList } from '../ExportContext';
import { useNavigate } from 'react-router-dom';
import { Trash2, FileDown, ArrowLeft, AlertCircle, XCircle, Tag, Clock, Calendar, Filter, RotateCcw, Package, Search, X, Info, AlertTriangle, ChevronRight } from 'lucide-react';

// Import komponen Modal
import ConfirmationModal from '../components/ConfirmationModal'; 
import NotificationModal from '../components/NotificationModal'; 

const ListPage = () => {
  const { exportList, clearExportList, removeFromExportList } = useExportList();
  const navigate = useNavigate();

  // --- 1. STATE ---
  const [startDate, setStartDate] = useState(() => localStorage.getItem('filter_startDate') || '');
  const [endDate, setEndDate] = useState(() => localStorage.getItem('filter_endDate') || '');
  const [searchQuery, setSearchQuery] = useState(''); 
  
  const [filteredList, setFilteredList] = useState([]); 
  const [isFilterActive, setIsFilterActive] = useState(false);

  // State Modal Masalah Data
  const [showDupModal, setShowDupModal] = useState(false);

  // --- STATE MODAL CONFIG ---
  const [modalConfig, setModalConfig] = useState({
    isOpen: false, type: null, id: null, name: '', title: '', message: '', confirmLabel: '', isDanger: false
  });
  const [notifyModal, setNotifyModal] = useState({ isOpen: false, type: 'success', title: '', message: '' });

  const showNotify = (type, title, message) => {
    setNotifyModal({ isOpen: true, type, title, message });
  };

  // --- 2. LOGIKA DETEKSI MASALAH (DUPLIKAT SKU & INKONSISTENSI NAMA) ---
  const duplicateData = useMemo(() => {
      const issues = [];
      const processedIds = new Set(); // Agar item tidak masuk 2x

      // A. CEK SKU GANDA
      const skuMap = {};
      exportList.forEach(item => {
          const sku = item.sku ? item.sku.toLowerCase().trim() : '';
          if (sku && sku !== '-') {
              if (!skuMap[sku]) skuMap[sku] = [];
              skuMap[sku].push(item);
          }
      });

      Object.values(skuMap).forEach(group => {
          if (group.length > 1) {
              group.forEach(item => {
                  if (!processedIds.has(item.id)) {
                      issues.push({ ...item, issueType: 'SKU Ganda' });
                      processedIds.add(item.id);
                  }
              });
          }
      });

      // B. CEK NAMA SAMA TAPI BEDA KATEGORI/BRAND
      const nameMap = {};
      exportList.forEach(item => {
          const name = item.item_name ? item.item_name.toLowerCase().trim() : '';
          if (name) {
              if (!nameMap[name]) nameMap[name] = [];
              nameMap[name].push(item);
          }
      });

      Object.values(nameMap).forEach(group => {
          if (group.length > 1) {
              // Ambil data pertama sebagai acuan
              const baseCat = (group[0].category || '').toLowerCase().trim();
              const baseBrand = (group[0].brand_name || '').toLowerCase().trim();

              // Cek apakah ada yang beda dengan acuan
              const hasConflict = group.some(i => 
                  (i.category || '').toLowerCase().trim() !== baseCat ||
                  (i.brand_name || '').toLowerCase().trim() !== baseBrand
              );

              if (hasConflict) {
                  group.forEach(item => {
                      if (!processedIds.has(item.id)) {
                          issues.push({ ...item, issueType: 'Beda Kategori/Brand' });
                          processedIds.add(item.id);
                      }
                  });
              }
          }
      });

      // Sort: Prioritaskan SKU Ganda di atas
      return issues.sort((a, b) => {
          if (a.issueType === b.issueType) return a.item_name.localeCompare(b.item_name);
          return a.issueType === 'SKU Ganda' ? -1 : 1;
      });
  }, [exportList]);

  // --- 3. EFFECT LOCAL STORAGE ---
  useEffect(() => {
      if (startDate) localStorage.setItem('filter_startDate', startDate);
      else localStorage.removeItem('filter_startDate');

      if (endDate) localStorage.setItem('filter_endDate', endDate);
      else localStorage.removeItem('filter_endDate');
  }, [startDate, endDate]);

  // --- HANDLER TANGGAL ---
  const handleStartDateChange = (e) => {
      const newStart = e.target.value;
      if (endDate && newStart > endDate) {
          showNotify('error', 'Tanggal Tidak Valid', 'Tanggal Mulai tidak boleh melebihi Tanggal Akhir.');
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

  // --- 4. LOGIKA FILTER UTAMA ---
  useEffect(() => {
    const applyFilter = () => {
        let result = exportList;
        let dateActive = false;

        if (startDate && endDate) {
            const start = new Date(startDate); start.setHours(0, 0, 0, 0); 
            const end = new Date(endDate); end.setHours(23, 59, 59, 999); 
            result = result.filter(item => {
                const itemDate = new Date(item.created_at);
                return itemDate >= start && itemDate <= end;
            });
            dateActive = true;
        }

        if (searchQuery) {
            const lowerQuery = searchQuery.toLowerCase();
            result = result.filter(item => 
                (item.item_name && item.item_name.toLowerCase().includes(lowerQuery)) ||
                (item.sku && item.sku.toLowerCase().includes(lowerQuery))
            );
        }

        setFilteredList(result);
        setIsFilterActive(dateActive || searchQuery.length > 0); 
    };

    applyFilter();
  }, [exportList, startDate, endDate, searchQuery]); 

  // --- 5. DATA DITAMPILKAN (MAX 100) ---
  const displayedList = filteredList.slice(0, 100); 

  // --- HANDLER LAINNYA ---
  const handleResetFilter = () => {
      setStartDate(''); setEndDate(''); setSearchQuery(''); 
      setFilteredList(exportList); setIsFilterActive(false);
  };

  const triggerClearAll = () => {
    if (filteredList.length === 0) return;
    setModalConfig({
        isOpen: true, type: 'DELETE_ALL',
        title: 'Hapus Data?',
        message: isFilterActive ? `Hapus ${filteredList.length} data hasil filter?` : 'Hapus SELURUH data list export?',
        confirmLabel: 'Ya, Hapus', isDanger: true
    });
  };

  const triggerDeleteItem = (id, name) => {
    setModalConfig({
        isOpen: true, type: 'DELETE_ONE', id: id, name: name,
        title: 'Hapus Item?', message: `Hapus "${name}"?`,
        confirmLabel: 'Hapus', isDanger: true
    });
  };

  const handleConfirmAction = () => {
    if (modalConfig.type === 'DELETE_ALL') {
        if (isFilterActive) {
            filteredList.forEach(item => removeFromExportList(item.id));
            showNotify('success', 'Dihapus', 'Data filter dihapus.');
        } else {
            clearExportList();
            showNotify('success', 'Bersih', 'Semua data dihapus.');
        }
    } else if (modalConfig.type === 'DELETE_ONE') {
        removeFromExportList(modalConfig.id);
    }
    setModalConfig({ ...modalConfig, isOpen: false });
  };

  const handleDownload = () => {
    if (filteredList.length === 0) {
        showNotify('info', 'Data Kosong', 'Tidak ada data.');
        return;
    }
    const hasWholesale = filteredList.some(item => item.wholesale_price && item.wholesale_price > 0);

    let headerParts = [
        "Internal ID Variant (Do Not Edit)", "Category", "SKU", "Items Name (Do Not Edit)", 
        "ecommerce item? (Yes/No)", "Pre-order ? (Yes/No)", "Processing days", 
        "Weight (gm)", "Length (cm)", "Width (cm)", "Height (cm)", "Condition", 
        "Brand Name","Gender", "Age group", "Color", "Size", "Material", "Variant name", "Basic - Price", 
        "Image 1 (for Online Store)", "Image 2 (for Online Store)", "Image 3 (for Online Store)", 
        "Image 4 (for Online Store)", "Image 5 (for Online Store)", "Image 6 (for Online Store)", 
        "Image 7 (for Online Store)", "Image 8 (for Online Store)", "Image 9 (for Online Store)", 
        "Image 10 (for Online Store)", "Image 11 (for Online Store)", "Image 12 (for Online Store)"
    ];

    if (hasWholesale) {
        headerParts.push("1. HARGA NORMAL - Price", "2. HARGA GROSIR - Price");
    }
    headerParts.push("In Stock", "Track Stock", "Track Alert", "Stock Alert", "Track Cost", "Cost Amount");

    const header = headerParts.join(",");
    const rows = filteredList.map(item => { 
      const category = `"${item.category || ''}"`;
      const sku = `"${item.sku || ''}"`; 
      const name = `"${(item.item_name || '').replace(/"/g, '""')}"`; 
      const brand = `"${item.brand_name || ''}"`; 
      const variant = `"${item.variant_name || ''}"`;
      const price = item.price || '';
      const wholesale = item.wholesale_price || '';
      const basicPriceVal = hasWholesale ? '' : price;

      let rowArray = [
        '""', category, sku, name, '"No"', '"No"', '"0"', '""', '""', '""', '""', '""',
        brand,'"','"','"','"','"', variant, basicPriceVal,
        '""','""','""','""','""','""','""','""','""','""','""','""'
      ];

      if (hasWholesale) { rowArray.push(price, wholesale); }
      rowArray.push('"0"', '"No"', '"No"', '"0"', '"No"', '""');
      return rowArray.join(",");
    });

    const csvContent = [header, ...rows].join("\n");
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `Export_Moka${isFilterActive ? '_Filtered' : '_All'}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const uniqueProductCount = new Set(
    filteredList.map(item => `${(item.item_name||'').trim()}|${(item.category||'').trim()}`)
  ).size;

  return (
    <div className="min-h-screen bg-gray-50 pb-44 relative">
      
      {/* --- HEADER --- */}
      <div className="bg-white p-4 shadow-sm sticky top-0 z-20">
        <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-3">
            <button onClick={() => navigate(-1)} className="p-2 rounded-full hover:bg-gray-100 transition">
                <ArrowLeft size={24} className="text-gray-600" />
            </button>
            <h1 className="text-xl font-bold text-gray-800">List Export</h1>
            </div>

            <div className="flex flex-col items-end">
                <div className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-xs font-bold shadow-sm">
                    {filteredList.length} Item
                </div>
                <div className="text-[10px] text-gray-500 font-bold mt-1 mr-1 flex items-center gap-1">
                    <Package size={12} className="text-gray-400"/> 
                    {uniqueProductCount} Produk
                </div>
            </div>
        </div>

        {/* --- AREA FILTER (SEARCH + DATE) --- */}
        <div className="bg-gray-50 p-3 rounded-xl border border-gray-200 mt-2 space-y-3">
            <div className="relative">
                <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
                <input 
                    type="text" placeholder="Cari Nama Produk / SKU..." value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-10 py-2 rounded-lg border border-gray-300 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                />
                {searchQuery && (
                    <button onClick={() => setSearchQuery('')} className="absolute right-2 top-2 text-gray-400 hover:text-gray-600 p-0.5">
                        <X size={18} />
                    </button>
                )}
            </div>

            <div>
                <div className="flex items-center gap-2 mb-1.5 text-gray-500 text-xs font-bold uppercase tracking-wide">
                    <Filter size={12} /> Filter Tanggal
                </div>
                <div className="flex gap-2">
                    <div className="flex-1 relative"><input type="date" value={startDate} onChange={handleStartDateChange} max={endDate} className="w-full text-xs p-2 rounded-lg border border-gray-300 outline-none focus:ring-2 focus:ring-blue-500" /></div>
                    <span className="self-center text-gray-400">-</span>
                    <div className="flex-1 relative"><input type="date" value={endDate} onChange={handleEndDateChange} min={startDate} className="w-full text-xs p-2 rounded-lg border border-gray-300 outline-none focus:ring-2 focus:ring-blue-500" /></div>
                    {isFilterActive && (
                        <button onClick={handleResetFilter} className="bg-gray-200 text-gray-600 p-2 rounded-lg hover:bg-gray-300 transition" title="Reset Filter">
                            <RotateCcw size={16} />
                        </button>
                    )}
                </div>
            </div>
        </div>

        {/* --- ALERT DUPLIKAT (JIKA ADA) --- */}
        {duplicateData.length > 0 && (
            <div 
                onClick={() => setShowDupModal(true)}
                className="mt-3 bg-red-100 border border-red-200 rounded-lg p-3 flex items-center justify-between cursor-pointer hover:bg-red-200 transition animate-pulse"
            >
                <div className="flex items-center gap-2 text-red-700">
                    <AlertTriangle size={18} />
                    <div className="flex flex-col">
                        <span className="text-xs font-bold">Ditemukan {duplicateData.length} Data Bermasalah</span>
                        <span className="text-[10px]">Klik untuk periksa & perbaiki</span>
                    </div>
                </div>
                <ChevronRight size={16} className="text-red-500" />
            </div>
        )}
      </div>

      {/* --- LIST ITEM --- */}
      <div className="p-4 max-w-md mx-auto mt-2">
        <div className="flex justify-between items-end mb-3">
            <div>
                <h3 className="font-bold text-gray-700 text-lg">{isFilterActive ? 'Hasil Pencarian' : 'Semua Barang'}</h3>
                {filteredList.length > 100 && (
                    <p className="text-[10px] text-orange-600 font-medium flex items-center gap-1 mt-1">
                        <Info size={10} /> Menampilkan 100 dari {filteredList.length} data
                    </p>
                )}
            </div>
            {filteredList.length > 0 && (
                <button onClick={triggerClearAll} className="text-red-500 text-xs font-semibold flex items-center gap-1 bg-red-50 px-3 py-1.5 rounded-lg hover:bg-red-100 border border-red-100 transition">
                    <XCircle size={14}/> {isFilterActive ? 'Hapus Filter' : 'Hapus Semua'}
                </button>
            )}
        </div>

        {filteredList.length === 0 ? (
          <div className="text-center py-12 border-2 border-dashed border-gray-300 rounded-xl bg-white mt-4">
            <AlertCircle size={48} className="mx-auto text-gray-300 mb-3" />
            <p className="text-gray-500 font-medium">{isFilterActive ? 'Tidak ada data' : 'List Kosong'}</p>
            {isFilterActive && <button onClick={handleResetFilter} className="mt-4 text-blue-600 font-bold text-xs hover:underline">Reset Filter</button>}
          </div>
        ) : (
          <div className="space-y-3">
            {displayedList.map((item, index) => (
              <div key={`${item.id}-${index}`} className="bg-white p-3 rounded-lg shadow-sm border border-gray-200 flex justify-between items-start hover:shadow-md transition">
                <div className="flex-1 pr-2">
                  <div className="font-bold text-gray-800 text-base mb-1.5 leading-tight">{item.item_name}</div>
                  <div className="grid grid-cols-1 gap-1 text-sm text-gray-600 bg-gray-50 p-2 rounded-md border border-gray-100">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={`border px-1.5 rounded font-mono text-xs font-bold tracking-wide ${searchQuery && item.sku?.toLowerCase().includes(searchQuery.toLowerCase()) ? 'bg-yellow-200 text-yellow-800 border-yellow-300' : 'bg-white text-gray-500'}`}>
                        {item.sku}
                      </span>
                      <span className="flex items-center gap-1 text-blue-600 bg-blue-50 px-1.5 rounded text-[10px] font-bold border border-blue-100 uppercase tracking-wide">
                        <Tag size={10} /> {item.category || 'NO-CAT'}
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-2 mt-1">
                        {item.brand_name && item.brand_name !== '-' && <span className="text-[10px] text-purple-600 bg-purple-50 px-1.5 rounded border border-purple-100">{item.brand_name}</span>}
                        {item.variant_name && <span className="text-[10px] text-orange-600 bg-orange-50 px-1.5 rounded border border-orange-100">{item.variant_name}</span>}
                    </div>
                    <div className="flex items-center gap-1 text-[10px] text-gray-400 mt-1 border-t border-gray-100 pt-1">
                        <Clock size={10} /> {item.created_at ? new Date(item.created_at).toLocaleString('id-ID') : '-'}
                    </div>
                  </div>
                  <div className="mt-2 flex items-baseline gap-3">
                      <div><span className="text-[10px] text-gray-400 font-semibold block leading-none">Normal</span><span className="text-base font-bold text-blue-600">Rp {item.price ? item.price.toLocaleString() : '0'}</span></div>
                      {item.wholesale_price > 0 && (<div className="pl-3 border-l border-gray-200"><span className="text-[10px] text-gray-400 font-semibold block leading-none">Grosir</span><span className="text-sm font-bold text-green-600">Rp {item.wholesale_price.toLocaleString()}</span></div>)}
                  </div>
                </div>
                <button onClick={() => triggerDeleteItem(item.id, item.item_name)} className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition mt-1"><Trash2 size={20} /></button>
              </div>
            ))}
            {filteredList.length > 100 && <div className="text-center py-4 text-gray-400 text-xs italic">... dan {filteredList.length - 100} item lainnya. Download untuk melihat semua.</div>}
          </div>
        )}
      </div>

      {filteredList.length > 0 && (
        <div className="fixed bottom-20 left-0 right-0 px-4 z-20 pointer-events-none">
            <div className="max-w-md mx-auto pointer-events-auto">
                <button onClick={handleDownload} className="w-full bg-green-600 text-white font-bold py-3.5 rounded-xl shadow-xl hover:bg-green-700 flex justify-center items-center gap-2 active:scale-95 transition border-2 border-white/20">
                    <FileDown size={20} /> {isFilterActive ? 'Download Filter Data' : 'Download Semua Data'}
                </button>
            </div>
        </div>
      )}

      {/* --- MODAL FULLSCREEN KHUSUS DUPLIKAT & INKONSISTENSI --- */}
      {/* --- MODAL FULLSCREEN KHUSUS DUPLIKAT & INKONSISTENSI --- */}
      {showDupModal && (
        // 1. WRAPPER:
        // z-[100] -> Pastikan angka ini lebih tinggi dari Bottom Nav (biasanya z-50)
        // md:p-4  -> Di laptop ada jarak padding luar, di HP (default) 0 (full layar)
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 md:p-4 animate-fade-in">
            
            {/* 2. MODAL BOX: */}
            {/* h-full -> Di HP tinggi penuh menutupi layar */}
            {/* md:h-auto -> Di Laptop tinggi menyesuaikan isi */}
            {/* md:rounded-xl -> Di Laptop sudut tumpul, di HP kotak penuh */}
            <div className="bg-gray-50 w-full h-full md:w-full md:max-w-md md:h-auto md:max-h-[90vh] md:rounded-xl shadow-2xl overflow-hidden flex flex-col">
                
                {/* Header Modal */}
                <div className="bg-red-600 p-4 text-white shadow-md flex justify-between items-center shrink-0">
                    <h2 className="font-bold text-lg flex items-center gap-2"><AlertTriangle size={24}/> Bersihkan Data</h2>
                    <button onClick={() => setShowDupModal(false)} className="bg-white/20 p-1 rounded-full hover:bg-white/30"><X size={24}/></button>
                </div>
                
                <div className="bg-red-50 p-3 border-b border-red-100 shrink-0">
                    <p className="text-xs text-red-800">
                        Ditemukan <b>{duplicateData.length} item</b> bermasalah (SKU Ganda atau Nama sama tapi beda Kategori/Brand).
                    </p>
                </div>

                {/* List Scrollable */}
                <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar bg-gray-100">
                    {duplicateData.map((item, index) => (
                        <div key={`${item.id}-dup-${index}`} className="bg-white p-3 rounded-lg border-l-4 border-red-500 shadow-sm flex justify-between items-center">
                            <div className="flex-1 pr-2">
                                <div className="flex items-center gap-2 mb-1">
                                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded border uppercase ${
                                        item.issueType === 'SKU Ganda' 
                                        ? 'bg-red-100 text-red-700 border-red-200' 
                                        : 'bg-yellow-100 text-yellow-700 border-yellow-200'
                                    }`}>
                                        {item.issueType}
                                    </span>
                                </div>
                                <div className="font-bold text-gray-800">{item.item_name}</div>
                                <div className="text-xs font-mono bg-gray-100 inline-block px-1 rounded mt-1 border border-gray-200 text-gray-600 font-bold">
                                    SKU: {item.sku}
                                </div>
                                <div className="text-[10px] text-gray-500 mt-1 flex flex-wrap gap-2">
                                    <span className={item.issueType === 'Beda Kategori/Brand' ? 'text-red-600 font-bold' : ''}>
                                        {item.category}
                                    </span>
                                    <span>•</span>
                                    <span className={item.issueType === 'Beda Kategori/Brand' ? 'text-red-600 font-bold' : ''}>
                                        {item.brand_name || '-'}
                                    </span>
                                </div>
                            </div>
                            <button 
                                onClick={() => {
                                    if(window.confirm(`Hapus "${item.item_name}"?`)) {
                                        removeFromExportList(item.id);
                                        if(duplicateData.length <= 1) setShowDupModal(false); 
                                    }
                                }} 
                                className="bg-red-100 text-red-600 p-2 rounded-lg hover:bg-red-200"
                            >
                                <Trash2 size={20} />
                            </button>
                        </div>
                    ))}
                </div>
            </div>
        </div>
      )}

      <ConfirmationModal isOpen={modalConfig.isOpen} onClose={() => setModalConfig({ ...modalConfig, isOpen: false })} onConfirm={handleConfirmAction} title={modalConfig.title} message={modalConfig.message} confirmLabel={modalConfig.confirmLabel} isDanger={modalConfig.isDanger} />
      <NotificationModal isOpen={notifyModal.isOpen} onClose={() => setNotifyModal({ ...notifyModal, isOpen: false })} type={notifyModal.type} title={notifyModal.title} message={notifyModal.message} />

    </div>
  );
};

export default ListPage;