import React, { useState, useEffect } from 'react';
import { X, Plus, Edit3, Tag, DollarSign } from 'lucide-react';

const ProductResultModal = ({ isOpen, onClose, product, onAddToExport }) => {
  // State untuk menampung editan harga (hanya sesi ini)
  const [priceNormal, setPriceNormal] = useState('');
  const [priceWholesale, setPriceWholesale] = useState('');
  
  // State untuk menentukan harga mana yang dipakai sebagai "Harga Deal" (Total)
  // 'normal' atau 'wholesale'
  const [activeTab, setActiveTab] = useState('normal'); 

  // Reset state saat produk berubah
  useEffect(() => {
    if (product) {
      setPriceNormal(product.price || 0);
      setPriceWholesale(product.wholesale_price || 0);
      
      // Otomatis pilih grosir jika produk punya harga grosir > 0
      if (product.wholesale_price > 0) {
        // Opsional: Tetap default normal, atau mau otomatis grosir bisa diatur disini
        // setActiveTab('wholesale'); 
        setActiveTab('normal'); 
      } else {
        setActiveTab('normal');
      }
    }
  }, [product]);

  if (!isOpen || !product) return null;

  const handleConfirm = () => {
    // 1. Siapkan object produk bayangan (Modified Product)
    // Ini agar di tabel export nanti tersimpan angka yang baru diedit, bukan angka database
    const modifiedProduct = {
        ...product,
        price: parseFloat(priceNormal) || 0,           // Timpa harga normal master
        wholesale_price: parseFloat(priceWholesale) || 0 // Timpa harga grosir master
    };

    // 2. Tentukan harga final yang harus dibayar (Deal Price)
    const finalDealPrice = activeTab === 'normal' 
        ? modifiedProduct.price 
        : modifiedProduct.wholesale_price;

    // 3. Kirim ke ScanPage
    onAddToExport(modifiedProduct, finalDealPrice);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[60] p-4 animate-fade-in">
      <div className="bg-white w-full max-w-sm rounded-xl shadow-2xl p-6 relative border border-blue-100 max-h-[90vh] overflow-y-auto">
        
        {/* Tombol Close */}
        <button 
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-400 hover:text-gray-600 bg-gray-100 p-1 rounded-full z-10"
        >
          <X size={24} />
        </button>

        {/* Header Info Produk */}
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

        {/* --- EDIT 2 HARGA --- */}
        <div className="mb-2 text-xs font-bold text-gray-400 uppercase tracking-wide text-center">
            Pilih & Edit Harga Transaksi
        </div>

        <div className="grid grid-cols-2 gap-3 mb-6">
            {/* --- OPSI 1: HARGA NORMAL --- */}
            <div 
                onClick={() => setActiveTab('normal')}
                className={`relative p-3 rounded-xl border-2 cursor-pointer transition-all ${
                    activeTab === 'normal' 
                    ? 'border-blue-500 bg-blue-50 ring-1 ring-blue-500' 
                    : 'border-gray-200 bg-white hover:border-blue-200'
                }`}
            >
                <div className={`flex items-center gap-1 mb-1 text-xs font-bold ${activeTab === 'normal' ? 'text-blue-700' : 'text-gray-500'}`}>
                    <Tag size={12} /> HARGA NORMAL
                </div>
                <div className="relative">
                    <span className="absolute left-0 top-1.5 text-xs font-bold text-gray-400">Rp</span>
                    <input 
                        type="number"
                        className={`w-full pl-5 pr-1 py-1 text-lg font-bold bg-transparent outline-none ${activeTab === 'normal' ? 'text-blue-700' : 'text-gray-700'}`}
                        value={priceNormal}
                        onChange={(e) => setPriceNormal(e.target.value)}
                        onClick={(e) => {
                            e.stopPropagation(); // Biar gak double trigger
                            setActiveTab('normal');
                        }}
                    />
                </div>
                {activeTab === 'normal' && <div className="absolute top-2 right-2 w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>}
            </div>

            {/* --- OPSI 2: HARGA GROSIR --- */}
            <div 
                onClick={() => setActiveTab('wholesale')}
                className={`relative p-3 rounded-xl border-2 cursor-pointer transition-all ${
                    activeTab === 'wholesale' 
                    ? 'border-green-500 bg-green-50 ring-1 ring-green-500' 
                    : 'border-gray-200 bg-white hover:border-green-200'
                }`}
            >
                <div className={`flex items-center gap-1 mb-1 text-xs font-bold ${activeTab === 'wholesale' ? 'text-green-700' : 'text-gray-500'}`}>
                    <DollarSign size={12} /> HARGA GROSIR
                </div>
                <div className="relative">
                    <span className="absolute left-0 top-1.5 text-xs font-bold text-gray-400">Rp</span>
                    <input 
                        type="number"
                        className={`w-full pl-5 pr-1 py-1 text-lg font-bold bg-transparent outline-none ${activeTab === 'wholesale' ? 'text-green-700' : 'text-gray-700'}`}
                        value={priceWholesale}
                        onChange={(e) => setPriceWholesale(e.target.value)}
                        onClick={(e) => {
                            e.stopPropagation(); 
                            setActiveTab('wholesale');
                        }}
                    />
                </div>
                {activeTab === 'wholesale' && <div className="absolute top-2 right-2 w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>}
            </div>
        </div>

        {/* Info Deal Final */}
        <div className="bg-gray-50 p-3 rounded-lg flex justify-between items-center mb-4 border border-gray-200">
            <span className="text-xs font-bold text-gray-500">Total Masuk List:</span>
            <span className={`text-xl font-bold ${activeTab === 'normal' ? 'text-blue-600' : 'text-green-600'}`}>
                Rp {(activeTab === 'normal' ? parseFloat(priceNormal) || 0 : parseFloat(priceWholesale) || 0).toLocaleString()}
            </span>
        </div>

        {/* Footer Actions */}
        <button 
            onClick={handleConfirm}
            className={`w-full text-white font-bold py-3.5 rounded-xl shadow-lg hover:shadow-xl flex justify-center items-center gap-2 transition transform active:scale-95 ${
                activeTab === 'wholesale'
                ? 'bg-green-600 hover:bg-green-700' 
                : 'bg-blue-600 hover:bg-blue-700'
            }`}
        >
            <Plus size={20} /> Simpan ke List
        </button>

      </div>
    </div>
  );
};

export default ProductResultModal;