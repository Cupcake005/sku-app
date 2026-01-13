import React, { useState, useEffect } from 'react';
import { X, Plus, Edit3, Tag, DollarSign } from 'lucide-react';

const ProductResultModal = ({ isOpen, onClose, product, onAddToExport }) => {
  const [priceNormal, setPriceNormal] = useState('');
  const [priceWholesale, setPriceWholesale] = useState('');

  useEffect(() => {
    if (product) {
      setPriceNormal(product.price || 0);
      setPriceWholesale(product.wholesale_price || 0);
    }
  }, [product]);

  if (!isOpen || !product) return null;

  const handleConfirm = () => {
    // Kita update object produk dengan DUA harga terbaru yang diedit user
    const modifiedProduct = {
        ...product,
        price: parseFloat(priceNormal) || 0,           
        wholesale_price: parseFloat(priceWholesale) || 0 
    };

    // Kirim object lengkap ini ke ScanPage -> ExportContext
    onAddToExport(modifiedProduct);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[60] p-4 animate-fade-in">
      <div className="bg-white w-full max-w-sm rounded-xl shadow-2xl p-6 relative border border-blue-100 max-h-[90vh] overflow-y-auto">
        
        <button 
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-400 hover:text-gray-600 bg-gray-100 p-1 rounded-full z-10"
        >
          <X size={24} />
        </button>

        <div className="text-center mb-6">
            <div className="bg-green-100 text-green-800 px-3 py-1 rounded-full mb-3 inline-block text-xs font-bold shadow-sm uppercase tracking-wider">
                ✓ Produk Ditemukan
            </div>
            <h2 className="text-xl font-bold text-gray-800 leading-tight mb-1">
                {product.item_name}
            </h2>
            <div className="text-gray-500 text-xs">
                SKU: {product.sku}
                {product.brand_name !== '-' && <span className="mx-1">•</span>}
                {product.brand_name !== '-' && product.brand_name}
            </div>
        </div>

        {/* --- EDIT 2 HARGA (KEDUANYA AKTIF) --- */}
        <div className="mb-2 text-xs font-bold text-gray-400 uppercase tracking-wide text-center">
            Edit Harga Untuk Export
        </div>

        <div className="space-y-3 mb-6">
            {/* INPUT HARGA NORMAL */}
            <div className="relative p-3 rounded-xl border border-blue-200 bg-blue-50/50">
                <div className="flex items-center gap-1 mb-1 text-xs font-bold text-blue-700">
                    <Tag size={12} /> HARGA NORMAL
                </div>
                <div className="relative">
                    <span className="absolute left-0 top-1.5 text-xs font-bold text-gray-400">Rp</span>
                    <input 
                        type="number"
                        className="w-full pl-5 pr-1 py-1 text-lg font-bold bg-transparent outline-none text-blue-700 placeholder-blue-300"
                        value={priceNormal}
                        onChange={(e) => setPriceNormal(e.target.value)}
                        placeholder="0"
                    />
                    <Edit3 size={14} className="absolute right-0 top-2 text-blue-300 pointer-events-none" />
                </div>
            </div>

            {/* INPUT HARGA GROSIR */}
            <div className="relative p-3 rounded-xl border border-green-200 bg-green-50/50">
                <div className="flex items-center gap-1 mb-1 text-xs font-bold text-green-700">
                    <DollarSign size={12} /> HARGA GROSIR
                </div>
                <div className="relative">
                    <span className="absolute left-0 top-1.5 text-xs font-bold text-gray-400">Rp</span>
                    <input 
                        type="number"
                        className="w-full pl-5 pr-1 py-1 text-lg font-bold bg-transparent outline-none text-green-700 placeholder-green-300"
                        value={priceWholesale}
                        onChange={(e) => setPriceWholesale(e.target.value)}
                        placeholder="0"
                    />
                    <Edit3 size={14} className="absolute right-0 top-2 text-green-300 pointer-events-none" />
                </div>
            </div>
        </div>

        <button 
            onClick={handleConfirm}
            className="w-full bg-blue-600 text-white font-bold py-3.5 rounded-xl shadow-lg hover:bg-blue-700 flex justify-center items-center gap-2 transition transform active:scale-95"
        >
            <Plus size={20} /> Simpan Keduanya ke List
        </button>

      </div>
    </div>
  );
};

export default ProductResultModal;