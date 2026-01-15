// import React, { useState, useEffect } from 'react';
// import { supabase } from '../supabaseClient';
// import { X, Save, Plus, ScanLine, Copy, Loader2 } from 'lucide-react';

// const ProductModal = ({ isOpen, onClose, product, onSave, onScanClick }) => {
//   // State Form Internal
//   const [formData, setFormData] = useState({
//     sku: '',
//     item_name: '',
//     category: '',
//     brand_name: '',
//     variant_name: '',
//     price: ''
//   });

//   const [isChecking, setIsChecking] = useState(false);
//   const [isVariantMode, setIsVariantMode] = useState(false);

//   // Reset/Isi Form saat modal dibuka atau product berubah
//   useEffect(() => {
//     if (isOpen) {
//       setIsVariantMode(false); 
      
//       if (product) {
//         setFormData({
//           sku: product.sku || '',
//           item_name: product.item_name || '',
//           category: product.category || '',
//           brand_name: product.brand_name || '',
//           variant_name: product.variant_name || '',
//           price: product.price || ''
//         });
//       } else {
//         setFormData({
//           sku: '',
//           item_name: '',
//           category: '',
//           brand_name: '',
//           variant_name: '',
//           price: ''
//         });
//       }
//     }
//   }, [isOpen, product]);

//   const handleChange = (e) => {
//     const { name, value } = e.target;
//     setFormData(prev => ({ ...prev, [name]: value }));
//   };

//   // --- LOGIKA UTAMA: VALIDASI GANDA ---
//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setIsChecking(true);

//     // 1. Siapkan Data (Uppercase)
//     const finalData = {
//         sku: formData.sku.toUpperCase().trim(),
//         item_name: formData.item_name.toUpperCase().trim(),
//         category: formData.category.toUpperCase().trim(),
//         brand_name: formData.brand_name.toUpperCase().trim(),
//         variant_name: formData.variant_name.toUpperCase().trim(),
//         price: formData.price
//     };

//     try {
//         // --- VALIDASI 1: CEK SKU DUPLIKAT ---
//         const skuToCheck = finalData.sku;
        
//         // Hanya cek SKU jika SKU diisi dan bukan tanda strip
//         if (skuToCheck && skuToCheck !== '-') {
//             const { data: skuData, error: skuError } = await supabase
//                 .from('products')
//                 .select('id, item_name')
//                 .eq('sku', skuToCheck);

//             if (skuError) throw skuError;

//             if (skuData.length > 0) {
//                 // Logika: Apakah ini produk lain?
//                 let isSkuDuplicate = true;

//                 if (!isVariantMode && product && skuData[0].id === product.id) {
//                     // Ini produk sendiri (sedang edit), jadi bukan duplikat
//                     isSkuDuplicate = false;
//                 }

//                 if (isSkuDuplicate) {
//                     alert(`⛔ GAGAL: SKU "${skuToCheck}" sudah dipakai oleh produk:\n"${skuData[0].item_name}"`);
//                     setIsChecking(false);
//                     return; // Stop disini
//                 }
//             }
//         }

//         // --- VALIDASI 2: CEK KOMBINASI NAMA + VARIAN (FITUR BARU) ---
//         // Query: Cari produk yang NAMANYA sama DAN VARIANNYA sama
//         const { data: nameData, error: nameError } = await supabase
//             .from('products')
//             .select('id')
//             .eq('item_name', finalData.item_name)
//             .eq('variant_name', finalData.variant_name);

//         if (nameError) throw nameError;

//         if (nameData.length > 0) {
//             // Logika: Apakah ini produk lain?
//             let isNameDuplicate = true;

//             if (!isVariantMode && product && nameData[0].id === product.id) {
//                 // Ini produk sendiri (misal cuma edit harga, tapi nama & varian gak berubah), jadi aman
//                 isNameDuplicate = false;
//             }

//             if (isNameDuplicate) {
//                 alert(`⛔ GAGAL: Produk "${finalData.item_name}" dengan varian "${finalData.variant_name}" SUDAH ADA di database.`);
//                 setIsChecking(false);
//                 return; // Stop disini
//             }
//         }

//         // --- LOLOS SEMUA VALIDASI -> SIMPAN ---
//         onSave(finalData, isVariantMode);

//     } catch (err) {
//         console.error("Error validating:", err);
//         alert("Terjadi kesalahan saat validasi database. Cek koneksi internet.");
//     } finally {
//         setIsChecking(false);
//     }
//   };

//   // --- LOGIKA AUTO VARIANT ---
//   const handleAutoVariant = async () => {
//     const currentSku = formData.sku.toUpperCase().trim();

//     if (!currentSku || currentSku === '-') {
//         alert("Isi SKU utama terlebih dahulu sebelum membuat varian.");
//         return;
//     }

//     setIsChecking(true);
//     const suffixes = "ABCDEFGHIJKLMNOPQRSTUVWXYZ"; 
//     let foundSku = "";
    
//     for (let i = 0; i < suffixes.length; i++) {
//         const candidateSku = currentSku + suffixes[i];
//         const { data } = await supabase.from('products').select('id').eq('sku', candidateSku); 
//         if (data && data.length === 0) {
//             foundSku = candidateSku;
//             break; 
//         }
//     }

//     setIsChecking(false);

//     if (foundSku) {
//         setFormData(prev => ({
//             ...prev,
//             sku: foundSku,
//             variant_name: '', 
//             price: ''         
//         }));
//         setIsVariantMode(true); 
//     } else {
//         alert("Semua varian A-Z untuk SKU ini sudah penuh!");
//     }
//   };

//   if (!isOpen) return null;

//   const isEditMode = !!product && !isVariantMode; 
//   const isVariantDisplay = isVariantMode;

//   return (
//     <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
//       <div className="bg-white w-full max-w-sm rounded-xl shadow-2xl p-6 animate-fade-in max-h-[90vh] overflow-y-auto">
        
//         {/* Header Modal */}
//         <div className="flex justify-between items-center mb-4 border-b pb-2">
//           <h3 className={`font-bold text-lg flex items-center gap-2 ${isVariantDisplay ? 'text-purple-600' : (isEditMode ? 'text-gray-800' : 'text-indigo-600')}`}>
//             {isVariantDisplay ? (
//                 <> <Copy size={20}/> Tambah Varian Baru </>
//             ) : (
//                 isEditMode ? 'Edit Produk' : 'Tambah Produk Baru'
//             )}
//           </h3>
//           <button onClick={onClose}><X size={24} /></button>
//         </div>
        
//         {/* Form */}
//         <form onSubmit={handleSubmit} className="space-y-3">
          
//           {/* Nama Barang */}
//           <div>
//             <label className="text-xs font-bold text-gray-500">
//               Nama Barang <span className="text-red-500">*</span>
//             </label>
//             <input 
//               required 
//               name="item_name"
//               className="w-full border p-2 rounded focus:ring-2 focus:ring-indigo-500 outline-none uppercase" 
//               value={formData.item_name}
//               onChange={handleChange}
//               placeholder="CONTOH: LIFEBUOY TOTAL 10"
//               autoFocus={!isEditMode && !isVariantDisplay}
//             />
//           </div>

//           {/* SKU / Barcode */}
//           <div>
//             <div className="flex justify-between items-center">
//                 <label className="text-xs font-bold text-gray-500">SKU / Barcode</label>
                
//                 {!isVariantMode && (
//                     <button 
//                         type="button" 
//                         onClick={handleAutoVariant}
//                         disabled={isChecking}
//                         className="text-[10px] bg-purple-100 text-purple-700 px-2 py-1 rounded hover:bg-purple-200 flex items-center gap-1 transition"
//                     >
//                         {isChecking ? <Loader2 size={10} className="animate-spin"/> : <Copy size={10} />} 
//                         Buat Varian (+A)
//                     </button>
//                 )}
//             </div>

//             <div className="flex gap-2 mt-1">
//                 <input 
//                   name="sku"
//                   className={`w-full border p-2 rounded focus:ring-2 focus:ring-indigo-500 outline-none uppercase ${isEditMode ? 'bg-gray-100' : 'bg-gray-50'}`} 
//                   value={formData.sku}
//                   onChange={handleChange}
//                   placeholder="SCAN ATAU KETIK MANUAL"
//                 />
//                 {!isEditMode && !isVariantDisplay && (
//                     <button type="button" onClick={onScanClick} className="bg-gray-200 p-2 rounded hover:bg-gray-300 transition">
//                         <ScanLine size={18} />
//                     </button>
//                 )}
//             </div>
//           </div>

//           {/* Kategori & Brand */}
//           <div className="flex gap-2">
//             <div className="w-1/2">
//                 <label className="text-xs font-bold text-gray-500">Kategori</label>
//                 <input 
//                   name="category"
//                   className="w-full border p-2 rounded focus:ring-2 focus:ring-indigo-500 outline-none uppercase" 
//                   value={formData.category}
//                   onChange={handleChange}
//                   placeholder="UNILEVER"
//                 />
//             </div>
//             <div className="w-1/2">
//                 <label className="text-xs font-bold text-gray-500">Brand Name</label>
//                 <input 
//                   name="brand_name"
//                   className="w-full border p-2 rounded focus:ring-2 focus:ring-indigo-500 outline-none uppercase" 
//                   value={formData.brand_name}
//                   onChange={handleChange}
//                   placeholder="LIFEBUOY"
//                 />
//             </div>
//           </div>

//           {/* Varian */}
//           <div>
//                <label className="text-xs font-bold text-gray-500">Varian</label>
//                <input 
//                  name="variant_name"
//                  className={`w-full border p-2 rounded focus:ring-2 focus:ring-indigo-500 outline-none uppercase ${isVariantDisplay ? 'ring-2 ring-purple-300 bg-purple-50' : ''}`}
//                  value={formData.variant_name}
//                  onChange={handleChange}
//                  placeholder="PCS / RENTENG"
//                  autoFocus={isVariantDisplay} 
//                />
//           </div>

//           {/* Harga */}
//           <div>
//             <label className="text-xs font-bold text-gray-500">Harga Jual</label>
//             <input 
//               type="number" 
//               name="price"
//               className="w-full border p-2 rounded focus:ring-2 focus:ring-indigo-500 outline-none" 
//               value={formData.price}
//               onChange={handleChange}
//               placeholder="0"
//             />
//           </div>

//           {/* Tombol Simpan */}
//           <button 
//             type="submit" 
//             disabled={isChecking}
//             className={`w-full text-white font-bold py-3 rounded-lg mt-4 flex justify-center items-center gap-2 transition disabled:opacity-50 disabled:cursor-not-allowed ${isVariantDisplay ? 'bg-purple-600 hover:bg-purple-700' : (isEditMode ? 'bg-blue-600' : 'bg-indigo-600')}`}
//           >
//             {isChecking ? (
//                 <> <Loader2 size={20} className="animate-spin" /> Memvalidasi... </>
//             ) : (
//                 isVariantDisplay ? <><Plus size={20} /> Simpan Varian Baru</> : 
//                 (isEditMode ? <><Save size={20} /> Simpan Perubahan</> : <><Plus size={20} /> Tambah Produk</>)
//             )}
//           </button>
//         </form>
//       </div>
//     </div>
//   );
// };

// export default ProductModal;

import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { X, ScanLine } from 'lucide-react';

const ProductModal = ({ isOpen, onClose, product, onSave, onScanClick, setIsScannerActive }) => {
  const [formData, setFormData] = useState({
    sku: '',
    item_name: '',
    category: '',
    brand_name: '',
    variant_name: '',
    price: '',
    wholesale_price: ''
  });

  const [isChecking, setIsChecking] = useState(false);
  const [isVariantMode, setIsVariantMode] = useState(false);

  // --- 1. LOGIKA KAMERA (Matikan saat modal buka) ---
  useEffect(() => {
    if (isOpen && setIsScannerActive) {
        setIsScannerActive(false);
    }
    return () => {
        if (setIsScannerActive) setIsScannerActive(true);
    };
  }, [isOpen, setIsScannerActive]);

  // --- 2. LOGIKA INITIAL LOAD (PERBAIKAN UTAMA DISINI) ---
  useEffect(() => {
    // Hanya jalan saat modal DIBUKA (isOpen berubah jadi true)
    if (isOpen) {
      setIsVariantMode(false); 
      
      if (product) {
        // Mode Edit: Isi form dari data produk yang dikirim
        setFormData({
          sku: product.sku || '',
          item_name: product.item_name || '',
          category: product.category || '',
          brand_name: product.brand_name || '',
          variant_name: product.variant_name || '',
          price: product.price || '',
          wholesale_price: product.wholesale_price || '' 
        });
      } else {
        // Mode Tambah: Reset form jadi kosong
        setFormData({
          sku: '',
          item_name: '',
          category: '',
          brand_name: '',
          variant_name: '',
          price: '',
          wholesale_price: '' 
        });
      }
    }
    // HAPUS 'product' DARI SINI AGAR TIDAK RESET SAAT NGETIK
  }, [isOpen]); 

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsChecking(true);

    const finalData = {
        sku: formData.sku.toUpperCase().trim(),
        item_name: formData.item_name.toUpperCase().trim(),
        category: formData.category.toUpperCase().trim(),
        brand_name: formData.brand_name.toUpperCase().trim(),
        variant_name: formData.variant_name.toUpperCase().trim(),
        price: formData.price,
        wholesale_price: formData.wholesale_price 
    };

    try {
        // Cek Duplikat Sederhana
        const skuToCheck = finalData.sku;
        if (skuToCheck && skuToCheck !== '-') {
             const { data: skuData } = await supabase.from('products').select('id, item_name').eq('sku', skuToCheck);
             let isDuplicate = skuData && skuData.length > 0;
             // Jika sedang edit produk yang sama, jangan anggap duplikat
             if (!isVariantMode && product && skuData.length > 0 && skuData[0].id === product.id) isDuplicate = false;
             
             if (isDuplicate) {
                 alert(`⛔ SKU "${skuToCheck}" sudah dipakai: ${skuData[0].item_name}`);
                 setIsChecking(false);
                 return;
             }
        }
        
        onSave(finalData, isVariantMode);

    } catch (err) {
        console.error(err);
        alert("Error validasi.");
    } finally {
        setIsChecking(false);
    }
  };

  const handleAutoVariant = async () => {
     const currentSku = formData.sku.toUpperCase().trim();
     if (!currentSku || currentSku === '-') return alert("Isi SKU dulu");
     
     setIsChecking(true);
     const suffixes = "ABCDEFGHIJKLMNOPQRSTUVWXYZ"; 
     let foundSku = "";
     
     for (let i = 0; i < suffixes.length; i++) {
        const candidateSku = currentSku + suffixes[i];
        const { data } = await supabase.from('products').select('id').eq('sku', candidateSku); 
        if (data && data.length === 0) { foundSku = candidateSku; break; }
     }
     
     setIsChecking(false);
     
     if (foundSku) {
        // Saat bikin varian, harga di-reset agar user isi baru
        setFormData(prev => ({ ...prev, sku: foundSku, variant_name: '', price: '', wholesale_price: '' })); 
        setIsVariantMode(true); 
     } else { 
        alert("Varian penuh!"); 
     }
  };

  if (!isOpen) return null;
  const isEditMode = !!product && !isVariantMode; 
  const isVariantDisplay = isVariantMode;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white w-full max-w-sm rounded-xl shadow-2xl p-6 animate-fade-in max-h-[90vh] overflow-y-auto custom-scrollbar">
        <div className="flex justify-between items-center mb-4 border-b pb-2">
          <h3 className="font-bold text-lg">{isVariantDisplay ? 'Tambah Varian' : (isEditMode ? 'Edit Produk' : 'Tambah Produk')}</h3>
          <button onClick={onClose}><X size={24} /></button>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-3">
           <div>
            <label className="text-xs font-bold text-gray-500">Nama Barang *</label>
            <input required name="item_name" className="w-full border p-2 rounded uppercase focus:ring-2 focus:ring-blue-500 outline-none" value={formData.item_name} onChange={handleChange} />
          </div>
          <div>
            <div className="flex justify-between"><label className="text-xs font-bold text-gray-500">SKU</label> {!isVariantMode && <button type="button" onClick={handleAutoVariant} className="text-[10px] text-purple-700 bg-purple-100 px-2 rounded hover:bg-purple-200">Buat Varian</button>}</div>
            <div className="flex gap-2"><input name="sku" className="w-full border p-2 rounded uppercase focus:ring-2 focus:ring-blue-500 outline-none" value={formData.sku} onChange={handleChange} /> {!isEditMode && !isVariantDisplay && <button type="button" onClick={onScanClick} className="bg-gray-100 p-2 rounded hover:bg-gray-200"><ScanLine size={20}/></button>}</div>
          </div>
           <div className="flex gap-2">
            <div className="w-1/2"><label className="text-xs font-bold text-gray-500">Kategori</label><input name="category" className="w-full border p-2 rounded uppercase focus:ring-2 focus:ring-blue-500 outline-none" value={formData.category} onChange={handleChange} /></div>
            <div className="w-1/2"><label className="text-xs font-bold text-gray-500">Brand</label><input name="brand_name" className="w-full border p-2 rounded uppercase focus:ring-2 focus:ring-blue-500 outline-none" value={formData.brand_name} onChange={handleChange} /></div>
          </div>
          <div><label className="text-xs font-bold text-gray-500">Varian</label><input name="variant_name" className="w-full border p-2 rounded uppercase focus:ring-2 focus:ring-blue-500 outline-none" value={formData.variant_name} onChange={handleChange} /></div>

          <div className="flex gap-2">
              <div className="w-1/2">
                <label className="text-xs font-bold text-blue-600">Harga Normal</label>
                <input type="number" name="price" className="w-full border border-blue-200 p-2 rounded focus:ring-2 focus:ring-blue-500 outline-none font-bold" value={formData.price} onChange={handleChange} placeholder="0" />
              </div>
              <div className="w-1/2">
                <label className="text-xs font-bold text-green-600">Harga Grosir (Opsional)</label>
                <input type="number" name="wholesale_price" className="w-full border border-green-200 p-2 rounded focus:ring-2 focus:ring-green-500 outline-none" value={formData.wholesale_price} onChange={handleChange} placeholder="0" />
              </div>
          </div>

          <button type="submit" disabled={isChecking} className="w-full bg-blue-600 text-white font-bold py-3 rounded-lg mt-4 hover:bg-blue-700 transition">
            {isChecking ? 'Loading...' : 'Simpan'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ProductModal;