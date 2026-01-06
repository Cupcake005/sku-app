import React, { useState, useEffect } from 'react';
import { supabase } from './supabaseClient';
import Scanner from './components/Scanner'; // Pastikan path ini sesuai file Scanner kamu

function App() {
  const [activeTab, setActiveTab] = useState('menu'); 
  const [productData, setProductData] = useState(null);
  const [loading, setLoading] = useState(false);

  // State Form
  const [formData, setFormData] = useState({
    sku: '',          // SKU sekarang bisa diedit lewat state ini
    category: '',     // Default kosong biar bisa diisi manual
    brand_name: '', 
    variant_name: '', 
    price: '', 
    item_name: ''
  });

  // Fungsi Cek Database saat Scan Berhasil
  const handleScanResult = async (sku) => {
    setLoading(true);
    
    // Reset form tapi isi SKU dari hasil scan
    setFormData({
      sku: sku, 
      category: '', 
      brand_name: '', 
      variant_name: '', 
      price: '', 
      item_name: '' 
    });

    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('sku', sku)
        .single();

      if (data) {
        setProductData(data);
        setActiveTab('result'); // Barang ketemu
      } else {
        setActiveTab('form');   // Barang baru, buka form
      }
    } catch (error) {
      // Jika error (misal data tidak ada), lanjut ke form input baru
      setActiveTab('form');
    } finally {
      setLoading(false);
    }
  };

  // Logic Auto-Generate Nama Barang
  useEffect(() => {
    const brand = formData.brand_name || '';
    const variant = formData.variant_name || '';
    const name = `${brand} ${variant}`.trim();
    setFormData(prev => ({ ...prev, item_name: name }));
  }, [formData.brand_name, formData.variant_name]);

  // Handle Input Berubah (Bisa untuk SKU, Kategori, Harga, dll)
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Simpan ke Supabase
  const handleSave = async (e) => {
    e.preventDefault();
    setLoading(true);

    const { error } = await supabase.from('products').insert([{
      sku: formData.sku,
      category: formData.category,
      brand_name: formData.brand_name,
      variant_name: formData.variant_name,
      price: parseFloat(formData.price),
      item_name: formData.item_name
    }]);

    setLoading(false);
    if (error) {
      alert('Gagal simpan: ' + error.message);
    } else {
      alert('✅ Berhasil Disimpan!');
      setActiveTab('menu');
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-4 font-sans text-gray-800">
      <div className="max-w-md mx-auto mb-6 text-center">
        <h1 className="text-3xl font-bold text-blue-600">Toko Acan 📦</h1>
      </div>

      <div className="max-w-md mx-auto bg-white rounded-xl shadow-lg p-6">
        
        {/* === MENU UTAMA === */}
        {activeTab === 'menu' && (
          <div className="space-y-4">
            <button onClick={() => setActiveTab('scan')} className="w-full bg-blue-600 text-white font-bold py-3 rounded-lg shadow hover:bg-blue-700 transition">
              📷 Scan Barcode
            </button>
            <button onClick={() => {
              setFormData({ sku: '', category: '', brand_name: '', variant_name: '', price: '', item_name: '' });
              setActiveTab('form');
            }} className="w-full bg-green-600 text-white font-bold py-3 rounded-lg shadow hover:bg-green-700 transition">
              ✍️ Input Manual
            </button>
          </div>
        )}

        {/* === SCANNER === */}
        {activeTab === 'scan' && (
          <div>
            <Scanner onScanResult={handleScanResult} />
            <button onClick={() => setActiveTab('menu')} className="mt-4 w-full bg-gray-300 py-2 rounded-lg">Batal</button>
          </div>
        )}

        {/* === LOADING === */}
        {loading && <p className="text-center py-10 font-bold text-gray-500">Memproses data...</p>}

        {/* === HASIL PENCARIAN (BARANG ADA) === */}
        {activeTab === 'result' && productData && (
          <div className="text-center">
            <div className="bg-green-100 text-green-800 p-2 rounded mb-4 inline-block font-bold">✓ Barang Terdaftar</div>
            <h2 className="text-2xl font-bold">{productData.item_name}</h2>
            <p className="text-gray-500">SKU: {productData.sku}</p>
            <p className="text-gray-500">Kategori: {productData.category}</p>
            <p className="text-3xl font-bold text-blue-600 my-4">Rp {productData.price.toLocaleString()}</p>
            <button onClick={() => setActiveTab('menu')} className="w-full bg-blue-600 text-white py-2 rounded-lg">Scan Lagi</button>
          </div>
        )}

        {/* === FORM INPUT / EDIT BARU === */}
        {activeTab === 'form' && !loading && (
          <form onSubmit={handleSave} className="space-y-4">
            <h2 className="text-xl font-bold text-center mb-4">Input Barang</h2>
            
            {/* 1. INPUT SKU (BISA DIEDIT) */}
            <div>
              <label className="block text-sm font-medium text-gray-700">SKU / Barcode</label>
              <input 
                required 
                type="text" 
                name="sku" 
                value={formData.sku} 
                onChange={handleInputChange} 
                placeholder="Scan atau ketik manual" 
                className="mt-1 w-full border border-gray-300 p-2 rounded focus:ring-blue-500 focus:border-blue-500" 
              />
            </div>
            
            {/* 2. INPUT KATEGORI (TEKS BEBAS) */}
            <div>
              <label className="block text-sm font-medium text-gray-700">Kategori</label>
              <input 
                required 
                type="text" 
                name="category" 
                value={formData.category} 
                onChange={handleInputChange} 
                placeholder="Contoh: Makanan Ringan" 
                className="mt-1 w-full border border-gray-300 p-2 rounded focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            {/* INPUT LAINNYA */}
            <div>
              <label className="block text-sm font-medium text-gray-700">Merk (Brand)</label>
              <input required name="brand_name" value={formData.brand_name} onChange={handleInputChange} placeholder="Contoh: Indomie" className="mt-1 w-full border border-gray-300 p-2 rounded" />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Varian</label>
              <input required name="variant_name" value={formData.variant_name} onChange={handleInputChange} placeholder="Contoh: Goreng Rendang" className="mt-1 w-full border border-gray-300 p-2 rounded" />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Harga Jual</label>
              <input required type="number" name="price" value={formData.price} onChange={handleInputChange} placeholder="0" className="mt-1 w-full border border-gray-300 p-2 rounded" />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Nama Barang (Otomatis)</label>
              <input disabled value={formData.item_name} className="mt-1 w-full bg-gray-100 text-gray-500 border border-gray-300 p-2 rounded cursor-not-allowed" />
            </div>

            <div className="flex gap-2 pt-4">
              <button type="button" onClick={() => setActiveTab('menu')} className="w-1/3 bg-gray-200 text-gray-700 py-2 rounded-lg hover:bg-gray-300">Batal</button>
              <button type="submit" className="w-2/3 bg-green-600 text-white font-bold py-2 rounded-lg hover:bg-green-700 shadow">Simpan Data</button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

export default App;