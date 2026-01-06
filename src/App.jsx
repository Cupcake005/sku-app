import React, { useState, useEffect } from 'react';
import { supabase } from './supabaseClient';
import Scanner from './components/Scanner';

function App() {
  const [activeTab, setActiveTab] = useState('menu'); 
  const [scanResult, setScanResult] = useState('');
  const [productData, setProductData] = useState(null);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    sku: '', category: 'Makanan', brand_name: '', variant_name: '', price: '', item_name: ''
  });

  // Fungsi Cek Database
  const checkSkuInDb = async (sku) => {
    setLoading(true);
    setScanResult(sku);
    
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('sku', sku)
        .single();

      if (data) {
        setProductData(data);
        setActiveTab('result');
      } else {
        setFormData(prev => ({ ...prev, sku: sku, brand_name: '', variant_name: '', price: '' }));
        setActiveTab('form');
      }
    } catch (error) {
      console.error(error);
      // Jika error karena data tidak ada (kode PGRST116), lanjut ke form
      setFormData(prev => ({ ...prev, sku: sku }));
      setActiveTab('form');
    } finally {
      setLoading(false);
    }
  };

  // Auto Nama Barang
  useEffect(() => {
    const name = `${formData.brand_name} ${formData.variant_name}`.trim();
    setFormData(prev => ({ ...prev, item_name: name }));
  }, [formData.brand_name, formData.variant_name]);

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

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
      alert('Gagal: ' + error.message);
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
        
        {/* MENU */}
        {activeTab === 'menu' && (
          <button onClick={() => setActiveTab('scan')} className="w-full bg-blue-600 text-white font-bold py-3 rounded-lg">
            📷 Mulai Scan
          </button>
        )}

        {/* SCANNER */}
        {activeTab === 'scan' && (
          <div>
            <Scanner onScanResult={checkSkuInDb} />
            <button onClick={() => setActiveTab('menu')} className="mt-4 w-full bg-gray-300 py-2 rounded-lg">Batal</button>
          </div>
        )}

        {/* LOADING */}
        {loading && <p className="text-center py-10">Loading...</p>}

        {/* HASIL KETEMU */}
        {activeTab === 'result' && productData && (
          <div className="text-center">
            <h2 className="text-2xl font-bold">{productData.item_name}</h2>
            <p className="text-xl text-blue-600 my-2">Rp {productData.price.toLocaleString()}</p>
            <button onClick={() => setActiveTab('menu')} className="w-full bg-blue-600 text-white py-2 rounded-lg">Scan Lagi</button>
          </div>
        )}

        {/* FORM BARU */}
        {activeTab === 'form' && !loading && (
          <form onSubmit={handleSave} className="space-y-4">
            <div className="bg-yellow-100 p-2 rounded text-center">SKU: <b>{scanResult}</b> (Baru)</div>
            
            <select name="category" onChange={handleInputChange} className="w-full border p-2 rounded">
              <option>Makanan</option><option>Minuman</option><option>Rumah Tangga</option>
            </select>
            
            <input required name="brand_name" onChange={handleInputChange} placeholder="Merk (cth: Indomie)" className="w-full border p-2 rounded" />
            <input required name="variant_name" onChange={handleInputChange} placeholder="Varian (cth: Goreng)" className="w-full border p-2 rounded" />
            <input required type="number" name="price" onChange={handleInputChange} placeholder="Harga" className="w-full border p-2 rounded" />
            <input disabled value={formData.item_name} className="w-full bg-gray-100 p-2 rounded" />

            <div className="flex gap-2">
              <button type="button" onClick={() => setActiveTab('menu')} className="w-1/3 bg-gray-300 py-2 rounded">Batal</button>
              <button type="submit" className="w-2/3 bg-green-600 text-white py-2 rounded">Simpan</button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

export default App;