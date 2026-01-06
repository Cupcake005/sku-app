import React, { useState } from 'react';
import { supabase } from '../supabaseClient';
import Scanner from '../components/Scanner'; 
import { useExportList } from '../ExportContext';

const ScanPage = () => {
  const { addToExportList } = useExportList();
  const [mode, setMode] = useState('scan'); // scan, result, form
  const [loading, setLoading] = useState(false);
  const [productData, setProductData] = useState(null);

  // Form State
  const [formData, setFormData] = useState({
    sku: '', category: '', variant_name: '', price: '', item_name: ''
  });

  // 1. CEK DATABASE
  const handleScan = async (sku) => {
    setLoading(true);
    setFormData({ sku, category: '', variant_name: '', price: '', item_name: '' });

    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('sku', sku)
        .single();

      if (data) {
        setProductData(data);
        setMode('result'); // Barang Ada -> Tampilkan Info
      } else {
        setMode('form');   // Barang Tidak Ada -> Buka Form Input
      }
    } catch (error) {
      setMode('form');
    } finally {
      setLoading(false);
    }
  };

  // 2. SIMPAN BARANG BARU (KE DATABASE UTAMA)
  const handleSaveNew = async (e) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.from('products').insert([{
      ...formData, brand_name: '-'
    }]);

    setLoading(false);
    if (error) {
      alert('Gagal simpan: ' + error.message);
    } else {
      alert('✅ Data baru tersimpan di Database!');
      setMode('scan'); // Reset ke scan
    }
  };

  const handleInput = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  return (
    <div className="pb-20"> {/* Padding bawah biar ga ketutup menu */}
      <div className="bg-white p-4 rounded-lg shadow-md mb-4">
        <h2 className="text-xl font-bold text-center mb-4 text-blue-600">Scan & Cek Barang</h2>

        {/* --- MODE SCANNER --- */}
        {mode === 'scan' && (
          <>
            <Scanner onScanResult={handleScan} />
            <div className="text-center mt-4">Atau</div>
            <button onClick={() => setMode('form')} className="w-full mt-2 bg-gray-200 py-3 rounded-lg font-bold">
              ⌨️ Input SKU Manual
            </button>
          </>
        )}

        {/* --- MODE HASIL: BARANG DITEMUKAN --- */}
        {mode === 'result' && productData && (
          <div className="text-center">
            <div className="bg-green-100 text-green-800 p-2 rounded mb-4 inline-block font-bold">✓ Terdaftar di Database</div>
            <h2 className="text-2xl font-bold">{productData.item_name}</h2>
            <p className="text-gray-600">{productData.sku}</p>
            <p className="text-gray-600 mb-4">{productData.category} - {productData.variant_name}</p>
            <p className="text-3xl font-bold text-blue-600 mb-6">Rp {productData.price.toLocaleString()}</p>

            {/* TOMBOL ADD TO EXPORT LIST */}
            <button 
              onClick={() => {
                addToExportList(productData);
                setMode('scan'); // Balik scan lagi biar cepat
              }}
              className="w-full bg-orange-500 text-white font-bold py-4 rounded-lg shadow-lg hover:bg-orange-600 mb-3"
            >
              ➕ Masukkan ke List Export
            </button>

            <button onClick={() => setMode('scan')} className="w-full bg-gray-200 py-3 rounded-lg">Batal / Scan Lagi</button>
          </div>
        )}

        {/* --- MODE FORM: BARANG BARU --- */}
        {mode === 'form' && (
          <form onSubmit={handleSaveNew} className="space-y-3">
            <div className="bg-yellow-100 p-2 text-yellow-800 text-center rounded text-sm">
              Barang belum ada di database. Silakan input baru.
            </div>
            <input required name="sku" value={formData.sku} onChange={handleInput} placeholder="SKU" className="w-full border p-2 rounded" />
            <input required name="item_name" value={formData.item_name} onChange={handleInput} placeholder="Nama Barang" className="w-full border p-2 rounded" />
            <input required name="category" value={formData.category} onChange={handleInput} placeholder="Kategori" className="w-full border p-2 rounded" />
            <input required name="variant_name" value={formData.variant_name} onChange={handleInput} placeholder="Varian" className="w-full border p-2 rounded" />
            <input required type="number" name="price" value={formData.price} onChange={handleInput} placeholder="Harga" className="w-full border p-2 rounded" />
            
            <div className="flex gap-2 pt-2">
              <button type="button" onClick={() => setMode('scan')} className="w-1/3 bg-gray-200 py-2 rounded">Batal</button>
              <button type="submit" className="w-2/3 bg-green-600 text-white py-2 rounded">Simpan ke DB</button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default ScanPage;