import React, { useState, useEffect } from 'react';
import { X, Save, Plus, ScanLine } from 'lucide-react';

const ProductModal = ({ isOpen, onClose, product, onSave, onScanClick }) => {
  // State Form Internal
  const [formData, setFormData] = useState({
    sku: '',
    item_name: '',
    category: '',
    brand_name: '',
    variant_name: '',
    price: ''
  });

  // Reset/Isi Form saat modal dibuka atau product berubah
  useEffect(() => {
    if (isOpen) {
      if (product) {
        // Mode Edit: Isi dengan data produk
        setFormData({
          sku: product.sku || '',
          item_name: product.item_name || '',
          category: product.category || '',
          brand_name: product.brand_name || '',
          variant_name: product.variant_name || '',
          price: product.price || ''
        });
      } else {
        // Mode Tambah: Reset kosong
        setFormData({
          sku: '',
          item_name: '',
          category: '',
          brand_name: '',
          variant_name: '',
          price: ''
        });
      }
    }
  }, [isOpen, product]);

  // Handle Perubahan Input (AUTO UPPERCASE)
  const handleChange = (e) => {
    const { name, value } = e.target;
    // Ubah value menjadi huruf besar seketika
    setFormData(prev => ({ ...prev, [name]: value.toUpperCase() }));
  };

  // Handle Submit
  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData); // Kirim data kembali ke parent
  };

  if (!isOpen) return null;

  const isEditMode = !!product;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white w-full max-w-sm rounded-xl shadow-2xl p-6 animate-fade-in max-h-[90vh] overflow-y-auto">
        
        {/* Header Modal */}
        <div className="flex justify-between items-center mb-4 border-b pb-2">
          <h3 className={`font-bold text-lg ${isEditMode ? '' : 'text-indigo-600'}`}>
            {isEditMode ? 'Edit Produk' : 'Tambah Produk Baru'}
          </h3>
          <button onClick={onClose}><X size={24} /></button>
        </div>
        
        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-3">
          
          {/* Nama Barang (Wajib) */}
          <div>
            <label className="text-xs font-bold text-gray-500">
              Nama Barang <span className="text-red-500">*</span>
            </label>
            <input 
              required 
              name="item_name"
              className="w-full border p-2 rounded focus:ring-2 focus:ring-indigo-500 outline-none uppercase" 
              value={formData.item_name}
              onChange={handleChange}
              placeholder="CONTOH: LIFEBUOY TOTAL 10"
              autoFocus={!isEditMode}
            />
          </div>

          {/* SKU / Barcode (Opsional) */}
          <div>
            <label className="text-xs font-bold text-gray-500">SKU / Barcode</label>
            <div className={isEditMode ? "" : "flex gap-2"}>
                <input 
                  name="sku"
                  className={`w-full border p-2 rounded focus:ring-2 focus:ring-indigo-500 outline-none uppercase ${isEditMode ? 'bg-gray-100' : 'bg-gray-50'}`} 
                  value={formData.sku}
                  onChange={handleChange}
                  placeholder="SCAN ATAU KETIK MANUAL"
                />
                {!isEditMode && (
                    <button type="button" onClick={onScanClick} className="bg-gray-200 p-2 rounded">
                        <ScanLine size={18} />
                    </button>
                )}
            </div>
          </div>

          {/* Kategori & Brand (Opsional) */}
          <div className="flex gap-2">
            <div className="w-1/2">
                <label className="text-xs font-bold text-gray-500">Kategori</label>
                <input 
                  /* TIDAK ADA REQUIRED */
                  name="category"
                  className="w-full border p-2 rounded focus:ring-2 focus:ring-indigo-500 outline-none uppercase" 
                  value={formData.category}
                  onChange={handleChange}
                  placeholder="UNILEVER"
                />
            </div>
            <div className="w-1/2">
                <label className="text-xs font-bold text-gray-500">Brand Name</label>
                <input 
                  name="brand_name"
                  className="w-full border p-2 rounded focus:ring-2 focus:ring-indigo-500 outline-none uppercase" 
                  value={formData.brand_name}
                  onChange={handleChange}
                  placeholder="LIFEBUOY"
                />
            </div>
          </div>

          {/* Varian (Opsional) */}
          <div>
               <label className="text-xs font-bold text-gray-500">Varian</label>
               <input 
                 name="variant_name"
                 className="w-full border p-2 rounded focus:ring-2 focus:ring-indigo-500 outline-none uppercase" 
                 value={formData.variant_name}
                 onChange={handleChange}
                 placeholder="PCS / RENTENG"
               />
          </div>

          {/* Harga (Opsional - Jika kosong akan jadi 0 di database) */}
          <div>
            <label className="text-xs font-bold text-gray-500">
              Harga Jual
              {/* Tanda bintang merah dihapus karena opsional */}
            </label>
            <input 
              /* TIDAK ADA REQUIRED */
              type="number" 
              name="price"
              className="w-full border p-2 rounded focus:ring-2 focus:ring-indigo-500 outline-none" 
              value={formData.price}
              onChange={handleChange}
              placeholder="0"
            />
            <p className="text-[10px] text-gray-400 mt-1">*Kosongkan jika belum ada harga</p>
          </div>

          {/* Tombol Simpan */}
          <button 
            type="submit" 
            className={`w-full text-white font-bold py-3 rounded-lg mt-4 flex justify-center gap-2 ${isEditMode ? 'bg-blue-600' : 'bg-indigo-600 hover:bg-indigo-700'}`}
          >
            {isEditMode ? <><Save size={20} /> Simpan Perubahan</> : <><Plus size={20} /> Tambah Produk</>}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ProductModal;