import React, { useState } from 'react'; // useEffect dihapus karena tidak ada auto-name lagi
import { supabase } from './supabaseClient';
import Scanner from './Scanner'; // Pastikan file Scanner.jsx ada di folder src

function App() {
  const [activeTab, setActiveTab] = useState('menu'); 
  const [productData, setProductData] = useState(null);
  const [loading, setLoading] = useState(false);

  // State Form (Merk/brand_name kita hapus dari form, kita fokus ke item_name)
  const [formData, setFormData] = useState({
    sku: '',          
    category: '',     
    variant_name: '', 
    price: '', 
    item_name: ''     // Sekarang diisi manual
  });

  // Fungsi Cek Database saat Scan Berhasil
  const handleScanResult = async (sku) => {
    setLoading(true);
    
    // Reset form saat scan baru
    setFormData({
      sku: sku, 
      category: '', 
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
      setActiveTab('form');
    } finally {
      setLoading(false);
    }
  };

  // Handle Input Berubah
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
      variant_name: formData.variant_name,
      price: parseFloat(formData.price),
      item_name: formData.item_name, 
      brand_name: '-' // Kita isi dash (-) karena kolom merk di database mungkin masih ada
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
              setFormData({ sku: '', category: '', variant_name: '', price: '', item_name: '' });
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

        {/* === HASIL PENCARIAN === */}
        {activeTab === 'result' && productData && (
          <div className="text-center">
            <div className="bg-green-100 text-green-800 p-2 rounded mb-4 inline-block font-bold">✓ Barang Terdaftar</div>
            <h2 className="text-2xl font-bold">{productData.item_name}</h2>
            <p className="text-gray-500">SKU: {productData.sku}</p>
            <p className="text-gray-500">Varian: {productData.variant_name}</p>
            <p className="text-3xl font-bold text-blue-600 my-4">Rp {productData.price.toLocaleString()}</p>
            <button onClick={() => setActiveTab('menu')} className="w-full bg-blue-600 text-white py-2 rounded-lg">Scan Lagi</button>
          </div>
        )}

        {/* === FORM INPUT (SESUAI REQUEST) === */}
        {activeTab === 'form' && !loading && (
          <form onSubmit={handleSave} className="space-y-4">
            <h2 className="text-xl font-bold text-center mb-4">Input Barang Baru</h2>
            
            {/* 1. SKU / NO BARCODE */}
            <div>
              <label className="block text-sm font-medium text-gray-700">SKU / No Barcode</label>
              <input 
                required 
                type="text" 
                name="sku" 
                value={formData.sku} 
                onChange={handleInputChange} 
                placeholder="Scan atau ketik kode" 
                className="mt-1 w-full border border-gray-300 p-2 rounded focus:ring-blue-500 focus:border-blue-500" 
              />
            </div>
            
            {/* 2. KATEGORI (KOSONG TANPA PLACEHOLDER) */}
            <div>
              <label className="block text-sm font-medium text-gray-700">Kategori</label>
              <input 
                required 
                type="text" 
                name="category" 
                value={formData.category} 
                onChange={handleInputChange} 
                placeholder="" 
                className="mt-1 w-full border border-gray-300 p-2 rounded focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            {/* 3. NAMA BARANG (MANUAL) */}
            <div>
              <label className="block text-sm font-medium text-gray-700">Nama Barang</label>
              <input 
                required 
                name="item_name" 
                value={formData.item_name} 
                onChange={handleInputChange} 
                placeholder="Contoh: Indomie Goreng" 
                className="mt-1 w-full border border-gray-300 p-2 rounded" 
              />
            </div>

            {/* 4. VARIAN (PCS/KARTON) */}
            <div>
              <label className="block text-sm font-medium text-gray-700">Varian</label>
              <input 
                required 
                name="variant_name" 
                value={formData.variant_name} 
                onChange={handleInputChange} 
                placeholder="Pcs / Karton / Pack" 
                className="mt-1 w-full border border-gray-300 p-2 rounded" 
              />
            </div>

            {/* 5. HARGA */}
            <div>
              <label className="block text-sm font-medium text-gray-700">Harga Jual</label>
              <input 
                required 
                type="number" 
                name="price" 
                value={formData.price} 
                onChange={handleInputChange} 
                placeholder="0" 
                className="mt-1 w-full border border-gray-300 p-2 rounded" 
              />
            </div>

            {/* BAGIAN AUTO-NAME SUDAH DIHAPUS DISINI */}

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