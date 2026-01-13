import React, { useState, useEffect } from 'react';
import { X, Plus, Edit3 } from 'lucide-react';

const ProductResultModal = ({ isOpen, onClose, product, onAddToExport }) => {
  // State harga khusus untuk sesi ini (dipindah dari ScanPage ke sini)
  const [customPrice, setCustomPrice] = useState('');

  // Setiap kali produk berubah (scan baru/klik list baru), reset harga ke default
  useEffect(() => {
    if (product) {
      setCustomPrice(product.price);
    }
  }, [product]);

  if (!isOpen || !product) return null;

  const handleConfirm = () => {
    // Kirim data balik ke parent (ScanPage) beserta harga final yang dipilih
    onAddToExport(product, parseFloat(customPrice) || 0);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[60] p-4 animate-fade-in">
      <div className="bg-white w-full max-w-sm rounded-xl shadow-2xl p-6 relative border border-blue-100 max-h-[90vh] overflow-y-auto">
        
        {/* Tombol Close */}
        <button 
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-400 hover:text-gray-600 bg-gray-100 p-1 rounded-full"
        >
          <X size={24} />
        </button>

        {/* Header Status */}
        <div className="text-center">
            <div className="bg-green-100 text-green-800 px-3 py-1 rounded-full mb-4 inline-block text-sm font-bold shadow-sm">
                ✓ Ditemukan
            </div>
            <h2 className="text-xl font-bold text-gray-800 leading-tight mb-1">
                {product.item_name}
            </h2>
            <div className="text-gray-500 mb-4 text-xs">
                SKU: {product.sku} <br/>
                {product.brand_name !== '-' && `Brand: ${product.brand_name}`}
            </div>
            
            <div className="flex justify-center gap-2 mb-4">
                {product.category && <span className="text-xs bg-blue-50 text-blue-700 px-2 py-1 rounded border border-blue-100">{product.category}</span>}
                {product.variant_name && <span className="text-xs bg-orange-50 text-orange-700 px-2 py-1 rounded border border-orange-100">{product.variant_name}</span>}
            </div>
        </div>

        {/* --- PILIHAN HARGA (NORMAL VS GROSIR) --- */}
        {product.wholesale_price > 0 && (
            <div className="grid grid-cols-2 gap-2 mb-4">
                <button 
                    onClick={() => setCustomPrice(product.price)}
                    className={`p-2 rounded-lg border text-xs font-bold transition flex flex-col items-center justify-center ${customPrice == product.price ? 'bg-blue-100 border-blue-500 text-blue-700 ring-1 ring-blue-500 shadow-inner' : 'bg-gray-50 text-gray-500 hover:bg-gray-100'}`}
                >
                    <span>Normal</span>
                    <span className="text-sm">Rp {product.price.toLocaleString()}</span>
                </button>
                <button 
                    onClick={() => setCustomPrice(product.wholesale_price)}
                    className={`p-2 rounded-lg border text-xs font-bold transition flex flex-col items-center justify-center ${customPrice == product.wholesale_price ? 'bg-green-100 border-green-500 text-green-700 ring-1 ring-green-500 shadow-inner' : 'bg-gray-50 text-gray-500 hover:bg-gray-100'}`}
                >
                    <span>Grosir</span>
                    <span className="text-sm">Rp {product.wholesale_price.toLocaleString()}</span>
                </button>
            </div>
        )}

        {/* --- INPUT HARGA FINAL --- */}
        <div className="mb-6 bg-gray-50 p-4 rounded-xl border border-gray-200">
            <label className="text-xs font-bold text-gray-500 block mb-1 text-center">
                Harga Deal (Edit jika perlu)
            </label>
            <div className="relative max-w-[200px] mx-auto">
                <span className="absolute left-3 top-2.5 text-gray-500 font-bold">Rp</span>
                <input 
                    type="number" 
                    className={`w-full pl-10 pr-4 py-2 text-xl font-bold border rounded-lg focus:ring-2 outline-none text-center bg-white shadow-sm ${
                        product.wholesale_price > 0 && customPrice == product.wholesale_price 
                        ? 'text-green-600 border-green-300 focus:ring-green-500' 
                        : 'text-blue-600 border-blue-300 focus:ring-blue-500'
                    }`}
                    value={customPrice}
                    onChange={(e) => setCustomPrice(e.target.value)}
                />
                <Edit3 size={16} className="absolute right-3 top-3 text-gray-400" />
            </div>
        </div>

        {/* Footer Actions */}
        <div className="space-y-3">
            <button 
              onClick={handleConfirm}
              className={`w-full text-white font-bold py-3.5 rounded-xl shadow-lg hover:shadow-xl flex justify-center items-center gap-2 transition transform active:scale-95 ${
                 product.wholesale_price > 0 && customPrice == product.wholesale_price 
                 ? 'bg-green-600 hover:bg-green-700' 
                 : 'bg-orange-500 hover:bg-orange-600'
              }`}
            >
              <Plus size={20} /> Masukkan ke List
            </button>
        </div>

      </div>
    </div>
  );
};

export default ProductResultModal;