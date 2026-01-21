// import React, { useState, useEffect } from 'react';
// import { X, Plus, Edit, Tag, DollarSign, Layers, Package } from 'lucide-react';

// // Helper: Bersihkan string
// const cleanStr = (str) => {
//     if (!str) return '';
//     return String(str).toLowerCase().trim().replace(/\s+/g, ' ');
// };

// const ProductResultModal = ({ isOpen, onClose, product, onAddToExport, allProducts = [], onEditMaster }) => {
//   const [priceNormal, setPriceNormal] = useState('');
//   const [priceWholesale, setPriceWholesale] = useState('');
//   const [variants, setVariants] = useState([]);

//   useEffect(() => {
//     if (product && isOpen) {
//       setPriceNormal(product.price || 0);
//       setPriceWholesale(product.wholesale_price || 0);

//       // --- LOGIC CARI VARIAN ---
//       if (allProducts.length > 0) {
//         const targetName = cleanStr(product.item_name);
//         const targetBrand = cleanStr(product.brand_name || '');

//         const foundVariants = allProducts.filter(p => {
//             if (p.id === product.id) return false;
//             const pName = cleanStr(p.item_name);
//             const pBrand = cleanStr(p.brand_name || '');
//             const isNameMatch = pName === targetName;
//             const isBrandMatch = targetBrand === '' || pBrand === targetBrand; 
//             return isNameMatch && isBrandMatch;
//         }).map(v => ({
//             id: v.id,
//             sku: v.sku,
//             variant_display: v.variant_name || v.unit || 'Varian Lain',
//             price: v.price,
//             wholesale_price: v.wholesale_price,
//             isExisting: true 
//         }));
//         setVariants(foundVariants);
//       } else {
//         setVariants([]);
//       }
//     }
//   }, [product, isOpen, allProducts]);

//   if (!isOpen || !product) return null;

//   const handleConfirm = () => {
//     const modifiedProduct = {
//         ...product,
//         price: parseFloat(priceNormal) || 0,           
//         wholesale_price: parseFloat(priceWholesale) || 0,
//     };
//     onAddToExport(modifiedProduct);
//   };

//   return (
//     <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[60] p-4 animate-fade-in">
//       <div className="bg-white w-full max-w-sm rounded-xl shadow-2xl p-6 relative border border-blue-100 max-h-[90vh] overflow-y-auto custom-scrollbar">
        
//         <button onClick={onClose} className="absolute top-3 right-3 text-gray-400 hover:text-gray-600 bg-gray-100 p-1 rounded-full z-10"><X size={24} /></button>

//         <div className="text-center mb-6">
//             <div className="bg-green-100 text-green-800 px-3 py-1 rounded-full mb-3 inline-block text-xs font-bold shadow-sm uppercase tracking-wider">
//                 ✓ Produk Ditemukan
//             </div>
//             <h2 className="text-xl font-bold text-gray-800 leading-tight mb-1">
//                 {product.item_name}
//             </h2>
            
//             {/* --- UPDATE: TAMPILKAN SKU & UNIT --- */}
//             <div className="flex justify-center items-center gap-2 text-gray-500 text-xs mt-1">
//                 <span className="bg-gray-100 px-2 py-0.5 rounded border border-gray-200 font-mono">
//                     {product.sku}
//                 </span>
                
//                 {/* Tampilkan Nama Varian / Unit (Pcs, Pack, dll) */}
//                 {(product.variant_name || product.unit) && (
//                     <span className="bg-purple-50 text-purple-700 px-2 py-0.5 rounded border border-purple-100 font-bold uppercase flex items-center gap-1">
//                         <Package size={10} />
//                         {product.variant_name || product.unit}
//                     </span>
//                 )}
//             </div>

//             <div className="text-[10px] text-gray-400 mt-1 uppercase tracking-wide">
//                 {product.category} {product.brand_name !== '-' && `• ${product.brand_name}`}
//             </div>

//             {/* --- TOMBOL EDIT MASTER DATA --- */}
//             <button 
//                 onClick={() => onEditMaster(product)}
//                 className="mt-3 text-xs bg-orange-50 text-orange-600 border border-orange-200 px-3 py-1.5 rounded-lg font-bold flex items-center gap-1 mx-auto hover:bg-orange-100 transition"
//             >
//                 <Edit size={12} /> Edit Data / Tambah Varian
//             </button>
//         </div>

//         {/* --- FORM HARGA TRANSAKSI --- */}
//         <div className="space-y-3 mb-6">
//             {/* HARGA NORMAL */}
//             <div className="relative p-3 rounded-xl border border-blue-200 bg-blue-50/50">
//                 <div className="flex items-center gap-1 mb-1 text-xs font-bold text-blue-700"><Tag size={12} /> HARGA NORMAL</div>
//                 <div className="relative">
//                     <span className="absolute left-0 top-1.5 text-xs font-bold text-gray-400">Rp</span>
//                     <input 
//                         type="number" 
//                         className="w-full pl-5 pr-1 py-1 text-lg font-bold bg-transparent outline-none text-blue-700 placeholder-blue-300"
//                         value={priceNormal === 0 ? '' : priceNormal} // Kosong jika 0
//                         onChange={(e) => setPriceNormal(e.target.value)} 
//                         placeholder="0"
//                     />
//                 </div>
//             </div>

//             {/* HARGA GROSIR */}
//             <div className="relative p-3 rounded-xl border border-green-200 bg-green-50/50">
//                 <div className="flex items-center gap-1 mb-1 text-xs font-bold text-green-700"><DollarSign size={12} /> HARGA GROSIR</div>
//                 <div className="relative">
//                     <span className="absolute left-0 top-1.5 text-xs font-bold text-gray-400">Rp</span>
//                     <input 
//                         type="number" 
//                         className="w-full pl-5 pr-1 py-1 text-lg font-bold bg-transparent outline-none text-green-700 placeholder-green-300"
//                         value={priceWholesale === 0 ? '' : priceWholesale} // Kosong jika 0
//                         onChange={(e) => setPriceWholesale(e.target.value)} 
//                         placeholder="0"
//                     />
//                 </div>
//             </div>
//         </div>

//         {/* --- LIST VARIAN --- */}
//         {variants.length > 0 && (
//             <div className="border-t border-gray-100 pt-4 mb-4">
//                 <div className="flex justify-between items-center mb-3">
//                     <div className="text-xs font-bold text-gray-400 uppercase tracking-wide flex items-center gap-1">
//                         <Layers size={14}/> Varian Lain ({variants.length})
//                     </div>
//                 </div>
//                 <div className="space-y-2">
//                     {variants.map((v) => (
//                         <div key={v.id} className="p-3 rounded-xl border border-gray-200 bg-white flex justify-between items-center">
//                             <div>
//                                 <div className="flex items-center gap-2 mb-1">
//                                     <span className="text-xs font-bold text-gray-700 bg-gray-100 px-1.5 py-0.5 rounded flex items-center gap-1">
//                                         <Package size={10} className="inline"/>
//                                         {v.variant_display}
//                                     </span>
//                                 </div>
//                                 <div className="text-[10px] text-gray-400 font-mono">SKU: {v.sku}</div>
//                             </div>
//                             <div className="text-right text-xs font-bold text-blue-600">Rp {v.price.toLocaleString()}</div>
//                         </div>
//                     ))}
//                 </div>
//             </div>
//         )}

//         <button onClick={handleConfirm} className="w-full bg-blue-600 text-white font-bold py-3.5 rounded-xl shadow-lg hover:bg-blue-700 flex justify-center items-center gap-2">
//             <Plus size={20} /> Masukkan Ke List
//         </button>

//       </div>
//     </div>
//   );
// };

// export default ProductResultModal;


import React, { useState, useEffect } from 'react';
import { X, Plus, Edit, Tag, DollarSign, Layers, Package } from 'lucide-react';

// Helper: Bersihkan string
const cleanStr = (str) => {
    if (!str) return '';
    return String(str).toLowerCase().trim().replace(/\s+/g, ' ');
};

const ProductResultModal = ({ isOpen, onClose, product, onAddToExport, allProducts = [], onEditMaster }) => {
  const [priceNormal, setPriceNormal] = useState('');
  const [priceWholesale, setPriceWholesale] = useState('');
  const [variants, setVariants] = useState([]);

  // --- PERBAIKAN 1: PISAHKAN LOGIC INIT HARGA ---
  // Effect ini HANYA jalan saat modal dibuka atau ID produk berubah.
  // Kita HAPUS 'allProducts' dari dependency array di sini agar input tidak reset saat auto-refresh background jalan.
  useEffect(() => {
    if (product && isOpen) {
      setPriceNormal(product.price);
      setPriceWholesale(product.wholesale_price);
    }
  }, [isOpen, product?.id]); // Gunakan optional chaining product?.id agar lebih aman

  // --- PERBAIKAN 2: LOGIC CARI VARIAN (Terpisah) ---
  // Effect ini boleh jalan saat allProducts berubah (auto refresh), karena hanya update list varian
  // dan TIDAK mengganggu input harga yang sedang diketik.
  useEffect(() => {
    if (product && isOpen && allProducts.length > 0) {
        const targetName = cleanStr(product.item_name);
        const targetBrand = cleanStr(product.brand_name || '');

        const foundVariants = allProducts.filter(p => {
            if (p.id === product.id) return false;
            const pName = cleanStr(p.item_name);
            const pBrand = cleanStr(p.brand_name || '');
            const isNameMatch = pName === targetName;
            const isBrandMatch = targetBrand === '' || pBrand === targetBrand; 
            return isNameMatch && isBrandMatch;
        }).map(v => ({
            id: v.id,
            sku: v.sku,
            variant_display: v.variant_name || v.unit || 'Varian Lain',
            price: v.price,
            wholesale_price: v.wholesale_price,
            isExisting: true 
        }));
        setVariants(foundVariants);
    } else {
        setVariants([]);
    }
  }, [isOpen, product?.id, allProducts]); // Di sini allProducts tetap ada biar varian selalu update

  if (!isOpen || !product) return null;

  const handleConfirm = () => {
    const modifiedProduct = {
        ...product,
        price: parseFloat(priceNormal),          
        wholesale_price: parseFloat(priceWholesale),
    };
    onAddToExport(modifiedProduct);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[60] p-4 animate-fade-in">
      <div className="bg-white w-full max-w-sm rounded-xl shadow-2xl p-6 relative border border-blue-100 max-h-[90vh] overflow-y-auto custom-scrollbar">
        
        <button onClick={onClose} className="absolute top-3 right-3 text-gray-400 hover:text-gray-600 bg-gray-100 p-1 rounded-full z-10"><X size={24} /></button>

        <div className="text-center mb-6">
            <div className="bg-green-100 text-green-800 px-3 py-1 rounded-full mb-3 inline-block text-xs font-bold shadow-sm uppercase tracking-wider">
                ✓ Produk Ditemukan
            </div>
            <h2 className="text-xl font-bold text-gray-800 leading-tight mb-1">
                {product.item_name}
            </h2>
            
            <div className="flex justify-center items-center gap-2 text-gray-500 text-xs mt-1">
                <span className="bg-gray-100 px-2 py-0.5 rounded border border-gray-200 font-mono">
                    {product.sku}
                </span>
                
                {(product.variant_name || product.unit) && (
                    <span className="bg-purple-50 text-purple-700 px-2 py-0.5 rounded border border-purple-100 font-bold uppercase flex items-center gap-1">
                        <Package size={10} />
                        {product.variant_name || product.unit}
                    </span>
                )}
            </div>

            <div className="text-[10px] text-gray-400 mt-1 uppercase tracking-wide">
                {product.category} {product.brand_name !== '-' && `• ${product.brand_name}`}
            </div>

            <button 
                onClick={() => onEditMaster(product)}
                className="mt-3 text-xs bg-orange-50 text-orange-600 border border-orange-200 px-3 py-1.5 rounded-lg font-bold flex items-center gap-1 mx-auto hover:bg-orange-100 transition"
            >
                <Edit size={12} /> Edit Data / Tambah Varian
            </button>
        </div>

        {/* --- FORM HARGA TRANSAKSI --- */}
        <div className="space-y-3 mb-6">
            {/* HARGA NORMAL */}
            <div className="relative p-3 rounded-xl border border-blue-200 bg-blue-50/50">
                <div className="flex items-center gap-1 mb-1 text-xs font-bold text-blue-700"><Tag size={12} /> HARGA NORMAL</div>
                <div className="relative">
                    <span className="absolute left-0 top-1.5 text-xs font-bold text-gray-400">Rp</span>
                    <input 
                        type="number" 
                        className="w-full pl-5 pr-1 py-1 text-lg font-bold bg-transparent outline-none text-blue-700 placeholder-blue-300"
                        value={priceNormal} 
                        onChange={(e) => setPriceNormal(e.target.value)} 
                        placeholder="0"
                    />
                </div>
            </div>

            {/* HARGA GROSIR */}
            <div className="relative p-3 rounded-xl border border-green-200 bg-green-50/50">
                <div className="flex items-center gap-1 mb-1 text-xs font-bold text-green-700"><DollarSign size={12} /> HARGA GROSIR</div>
                <div className="relative">
                    <span className="absolute left-0 top-1.5 text-xs font-bold text-gray-400">Rp</span>
                    <input 
                        type="number" 
                        className="w-full pl-5 pr-1 py-1 text-lg font-bold bg-transparent outline-none text-green-700 placeholder-green-300"
                        value={priceWholesale}
                        onChange={(e) => setPriceWholesale(e.target.value)} 
                        placeholder="0"
                    />
                </div>
            </div>
        </div>

        {/* --- LIST VARIAN --- */}
        {variants.length > 0 && (
            <div className="border-t border-gray-100 pt-4 mb-4">
                <div className="flex justify-between items-center mb-3">
                    <div className="text-xs font-bold text-gray-400 uppercase tracking-wide flex items-center gap-1">
                        <Layers size={14}/> Varian Lain ({variants.length})
                    </div>
                </div>
                <div className="space-y-2">
                    {variants.map((v) => (
                        <div key={v.id} className="p-3 rounded-xl border border-gray-200 bg-white flex justify-between items-center">
                            <div>
                                <div className="flex items-center gap-2 mb-1">
                                    <span className="text-xs font-bold text-gray-700 bg-gray-100 px-1.5 py-0.5 rounded flex items-center gap-1">
                                        <Package size={10} className="inline"/>
                                        {v.variant_display}
                                    </span>
                                </div>
                                <div className="text-[10px] text-gray-400 font-mono">SKU: {v.sku}</div>
                            </div>
                            <div className="text-right text-xs font-bold text-blue-600">Rp {v.price.toLocaleString()}</div>
                        </div>
                    ))}
                </div>
            </div>
        )}

        <button onClick={handleConfirm} className="w-full bg-blue-600 text-white font-bold py-3.5 rounded-xl shadow-lg hover:bg-blue-700 flex justify-center items-center gap-2">
            <Plus size={20} /> Masukkan Ke List
        </button>

      </div>
    </div>
  );
};

export default ProductResultModal;