import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { X, Save, Plus } from 'lucide-react';

const AddProductModal = ({ isOpen, onClose, initialSku, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    sku: '',
    item_name: '',
    category: '',
    brand_name: '',
    variant_name: '',
    price: ''
  });

  // Setiap kali modal dibuka atau initialSku berubah (dari scan), update form
  useEffect(() => {
    if (isOpen) {
      setFormData(prev => ({
        ...prev,
        sku: initialSku || '', // Isi otomatis jika ada SKU dari scan
        item_name: '',
        category: '',
        brand_name: '',
        variant_name: '',
        price: ''
      }));
    }
  }, [isOpen, initialSku]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const { error } = await supabase
      .from('products')
      .insert([{
        sku: formData.sku || '-',
        item_name: formData.item_name,
        category: formData.category,
        brand_name: formData.brand_name || '-',
        variant_name: formData.variant_name,
        price: parseFloat(formData.price) || 0
      }]);

    setLoading(false);

    if (error) {
      alert('Gagal tambah: ' + error.message);
    } else {
      alert('✅ Produk berhasil ditambahkan!');
      onSuccess(); // Refresh data di halaman induk
      onClose();   // Tutup modal
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 animate-fade-in">
      <div className="bg-white w-full max-w-sm rounded-xl shadow-2xl p-6 max-h-[90vh] overflow-y-auto">
        
        {/* Header Modal */}
        <div className="flex justify-between items-center mb-4 border-b pb-2">
          <h3 className="font-bold text-lg text-indigo-600">Tambah Produk Baru</h3>
          <button onClick={onClose} className="text-gray-500 hover:text-red-500">
            <X size={24} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-3">
          
          {/* Nama Produk */}
          <div>
            <label className="text-xs font-bold text-gray-500">Nama Barang <span className="text-red-500">*</span></label>
            <input 
              name="item_name"
              required 
              className="w-full border p-2 rounded focus:ring-2 focus:ring-indigo-500 outline-none" 
              value={formData.item_name}
              onChange={handleChange}
              placeholder="Contoh: Lifebuoy Total 10"
              autoFocus
            />
          </div>

          {/* SKU */}
          <div>
            <label className="text-xs font-bold text-gray-500">SKU / Barcode</label>
            <input 
              name="sku"
              className={`w-full border p-2 rounded focus:ring-2 focus:ring-indigo-500 outline-none ${initialSku ? 'bg-gray-100' : ''}`}
              value={formData.sku}
              onChange={handleChange}
              placeholder="Scan atau ketik manual"
            />
          </div>

          {/* Kategori & Brand */}
          <div className="flex gap-2">
            <div className="w-1/2">
              <label className="text-xs font-bold text-gray-500">Kategori</label>
              <input 
                name="category"
                required 
                className="w-full border p-2 rounded focus:ring-2 focus:ring-indigo-500 outline-none" 
                value={formData.category}
                onChange={handleChange}
                placeholder="Unilever"
              />
            </div>
            <div className="w-1/2">
              <label className="text-xs font-bold text-gray-500">Brand</label>
              <input 
                name="brand_name"
                className="w-full border p-2 rounded focus:ring-2 focus:ring-indigo-500 outline-none" 
                value={formData.brand_name}
                onChange={handleChange}
                placeholder="Lifebuoy"
              />
            </div>
          </div>

          {/* Varian */}
          <div>
            <label className="text-xs font-bold text-gray-500">Varian</label>
            <input 
              name="variant_name"
              className="w-full border p-2 rounded focus:ring-2 focus:ring-indigo-500 outline-none" 
              value={formData.variant_name}
              onChange={handleChange}
              placeholder="PCS / Renteng"
            />
          </div>

          {/* Harga */}
          <div>
            <label className="text-xs font-bold text-gray-500">Harga Jual <span className="text-red-500">*</span></label>
            <input 
              name="price"
              required 
              type="number" 
              className="w-full border p-2 rounded focus:ring-2 focus:ring-indigo-500 outline-none" 
              value={formData.price}
              onChange={handleChange}
              placeholder="0"
            />
          </div>

          {/* Tombol Simpan */}
          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-indigo-600 text-white font-bold py-3 rounded-lg mt-4 flex justify-center gap-2 hover:bg-indigo-700 disabled:bg-gray-400"
          >
            {loading ? 'Menyimpan...' : <><Plus size={20} /> Tambah Produk</>}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AddProductModal;