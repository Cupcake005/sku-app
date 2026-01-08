import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient'; // Pastikan path import ini benar
import { X, Save, Plus, ScanLine, Copy, Loader2 } from 'lucide-react';

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

  const [isChecking, setIsChecking] = useState(false); // Loading saat cek database

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
    setFormData(prev => ({ ...prev, [name]: value.toUpperCase() }));
  };

  // --- LOGIKA 1: CEK DUPLIKAT SAAT SAVE ---
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsChecking(true);

    const skuToCheck = formData.sku.trim();

    // Jika SKU kosong atau "-", loloskan saja (biarkan logic backend yang handle atau anggap no-sku)
    if (!skuToCheck || skuToCheck === '-') {
        setIsChecking(false);
        onSave(formData);
        return;
    }

    try {
        // Cek ke database apakah SKU sudah ada
        const { data, error } = await supabase
            .from('products')
            .select('id, item_name')
            .eq('sku', skuToCheck);

        if (error) throw error;

        // Validasi Duplikat
        const isDuplicate = data.length > 0;
        
        // Jika mode edit, pastikan yang terdeteksi bukan diri sendiri
        // (product.id ada jika mode edit)
        const isSelf = product && isDuplicate && data[0].id === product.id;

        if (isDuplicate && !isSelf) {
            alert(`⛔ GAGAL: SKU "${skuToCheck}" sudah dipakai oleh produk: \n"${data[0].item_name}"`);
            setIsChecking(false);
            return; // Batalkan save
        }

        // Jika aman, lanjutkan save
        onSave(formData);

    } catch (err) {
        console.error("Error checking SKU:", err);
        alert("Gagal memvalidasi SKU. Cek koneksi internet.");
    } finally {
        setIsChecking(false);
    }
  };

  // --- LOGIKA 2: AUTO VARIANT (A, B, C...) ---
  const handleAutoVariant = async () => {
    if (!formData.sku || formData.sku === '-') {
        alert("Isi SKU utama terlebih dahulu sebelum membuat varian.");
        return;
    }

    setIsChecking(true);
    const baseSku = formData.sku;
    const suffixes = "ABCDEFGHIJKLMNOPQRSTUVWXYZ"; 
    let foundSku = "";
    
    // Loop cari A-Z yang kosong
    for (let i = 0; i < suffixes.length; i++) {
        const candidateSku = baseSku + suffixes[i];
        
        // Cek ketersediaan di DB
        const { data } = await supabase
            .from('products')
            .select('id')
            .eq('sku', candidateSku);
            
        // Jika data kosong (length 0), berarti SKU ini belum dipakai -> AMBIL
        if (data && data.length === 0) {
            foundSku = candidateSku;
            break; // Keluar loop
        }
    }

    setIsChecking(false);

    if (foundSku) {
        setFormData(prev => ({
            ...prev,
            sku: foundSku,
            variant_name: '', // Kosongkan varian biar diisi user
            price: ''         // Kosongkan harga biar diisi user
        }));
        // Opsional: Beri notifikasi kecil
        // alert(`Varian SKU dibuat: ${foundSku}`);
    } else {
        alert("Semua varian A-Z untuk SKU ini sudah penuh!");
    }
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

          {/* SKU / Barcode */}
          <div>
            <div className="flex justify-between items-center">
                <label className="text-xs font-bold text-gray-500">SKU / Barcode</label>
                
                {/* TOMBOL BUAT VARIAN OTOMATIS */}
                <button 
                    type="button" 
                    onClick={handleAutoVariant}
                    disabled={isChecking}
                    className="text-[10px] bg-purple-100 text-purple-700 px-2 py-1 rounded hover:bg-purple-200 flex items-center gap-1 transition"
                    title="Buat varian otomatis (SKU + A/B/C)"
                >
                    {isChecking ? <Loader2 size={10} className="animate-spin"/> : <Copy size={10} />} 
                    Buat Varian (+A)
                </button>
            </div>

            <div className="flex gap-2 mt-1">
                <input 
                  name="sku"
                  className={`w-full border p-2 rounded focus:ring-2 focus:ring-indigo-500 outline-none uppercase ${isEditMode ? 'bg-gray-100' : 'bg-gray-50'}`} 
                  value={formData.sku}
                  onChange={handleChange}
                  placeholder="SCAN ATAU KETIK MANUAL"
                />
                
                {/* Tombol Scan hanya muncul di Mode Tambah */}
                {!isEditMode && (
                    <button type="button" onClick={onScanClick} className="bg-gray-200 p-2 rounded hover:bg-gray-300 transition">
                        <ScanLine size={18} />
                    </button>
                )}
            </div>
          </div>

          {/* Kategori & Brand */}
          <div className="flex gap-2">
            <div className="w-1/2">
                <label className="text-xs font-bold text-gray-500">Kategori</label>
                <input 
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

          {/* Varian */}
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

          {/* Harga */}
          <div>
            <label className="text-xs font-bold text-gray-500">
              Harga Jual
            </label>
            <input 
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
            disabled={isChecking}
            className={`w-full text-white font-bold py-3 rounded-lg mt-4 flex justify-center items-center gap-2 transition disabled:opacity-50 disabled:cursor-not-allowed ${isEditMode ? 'bg-blue-600' : 'bg-indigo-600 hover:bg-indigo-700'}`}
          >
            {isChecking ? (
                <> <Loader2 size={20} className="animate-spin" /> Memvalidasi... </>
            ) : (
                isEditMode ? <><Save size={20} /> Simpan Perubahan</> : <><Plus size={20} /> Tambah Produk</>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ProductModal;