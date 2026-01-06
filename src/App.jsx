import React, { useState } from 'react'; 
import { supabase } from './supabaseClient';
import Scanner from './components/Scanner'; // Pastikan path Scanner benar

function App() {
  const [activeTab, setActiveTab] = useState('menu'); 
  const [productData, setProductData] = useState(null);
  const [loading, setLoading] = useState(false);
  
  // State untuk menampung List Barang (Data Laporan)
  const [productList, setProductList] = useState([]);

  // State Form
  const [formData, setFormData] = useState({
    sku: '',          
    category: '',     
    variant_name: '', 
    price: '', 
    item_name: ''     
  });

  // --- FUNGSI BARU: Ambil Semua Data dari Database ---
  const fetchProductList = async () => {
    setLoading(true);
    try {
      // Ambil data diurutkan dari yang terbaru (created_at descending)
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      setProductList(data);
      setActiveTab('list'); // Pindah ke tab List
    } catch (error) {
      alert('Gagal mengambil data: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  // --- FUNGSI BARU: Export ke CSV/Excel ---
  const handleExport = () => {
    if (productList.length === 0) {
      alert("Tidak ada data untuk diekspor!");
      return;
    }

    // 1. Buat Header CSV
    let csvContent = "data:text/csv;charset=utf-8,";
    csvContent += "SKU,Nama Barang,Kategori,Varian,Harga,Tanggal Input\n";

    // 2. Masukkan Data Baris per Baris
    productList.forEach(item => {
      // Format tanggal biar rapi
      const date = new Date(item.created_at).toLocaleDateString('id-ID');
      const row = `${item.sku},"${item.item_name}",${item.category},${item.variant_name},${item.price},${date}`;
      csvContent += row + "\n";
    });

    // 3. Proses Download
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "Laporan_Stok_Toko_Acan.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // --- Fungsi Cek Database saat Scan Berhasil ---
  const handleScanResult = async (sku) => {
    setLoading(true);
    setFormData({ sku: sku, category: '', variant_name: '', price: '', item_name: '' });

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
        setActiveTab('form');   
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
      brand_name: '-' 
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
            <button onClick={() => setActiveTab('scan')} className="w-full bg-blue-600 text-white font-bold py-3 rounded-lg shadow hover:bg-blue-700 transition flex items-center justify-center gap-2">
              📷 Scan Barcode
            </button>
            
            <button onClick={() => {
              setFormData({ sku: '', category: '', variant_name: '', price: '', item_name: '' });
              setActiveTab('form');
            }} className="w-full bg-green-600 text-white font-bold py-3 rounded-lg shadow hover:bg-green-700 transition flex items-center justify-center gap-2">
              ✍️ Input Manual
            </button>

            {/* TOMBOL BARU: LIHAT DATA */}
            <button onClick={fetchProductList} className="w-full bg-orange-500 text-white font-bold py-3 rounded-lg shadow hover:bg-orange-600 transition flex items-center justify-center gap-2">
              📂 Lihat Data Stok
            </button>
          </div>
        )}

        {/* === TABEL LIST DATA (HALAMAN BARU) === */}
        {activeTab === 'list' && (
          <div>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Data Stok ({productList.length})</h2>
              <button onClick={() => setActiveTab('menu')} className="text-sm text-gray-500 underline">Kembali</button>
            </div>

            {/* Area Tabel dengan Scroll Horizontal */}
            <div className="overflow-x-auto mb-4 border rounded-lg">
              <table className="w-full text-sm text-left">
                <thead className="text-xs text-gray-700 uppercase bg-gray-100">
                  <tr>
                    <th className="px-3 py-2">Nama Barang</th>
                    <th className="px-3 py-2">SKU</th>
                    <th className="px-3 py-2">Harga</th>
                  </tr>
                </thead>
                <tbody>
                  {productList.length > 0 ? (
                    productList.map((item) => (
                      <tr key={item.id} className="bg-white border-b hover:bg-gray-50">
                        <td className="px-3 py-2 font-medium text-gray-900">
                          {item.item_name} <br/>
                          <span className="text-xs text-gray-500">{item.variant_name}</span>
                        </td>
                        <td className="px-3 py-2 text-gray-500">{item.sku}</td>
                        <td className="px-3 py-2">Rp {item.price.toLocaleString()}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="3" className="text-center py-4 text-gray-500">Belum ada data.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Tombol Export */}
            <button 
              onClick={handleExport}
              className="w-full bg-green-700 text-white font-bold py-2 rounded-lg shadow hover:bg-green-800 transition mb-2"
            >
              📥 Download Excel (CSV)
            </button>
            
            <button onClick={() => setActiveTab('menu')} className="w-full bg-gray-200 text-gray-700 py-2 rounded-lg">
              Kembali ke Menu
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
        {loading && <p className="text-center py-10 font-bold text-gray-500">Sedang memproses...</p>}

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

        {/* === FORM INPUT === */}
        {activeTab === 'form' && !loading && (
          <form onSubmit={handleSave} className="space-y-4">
            <h2 className="text-xl font-bold text-center mb-4">Input Barang Baru</h2>
            
            {/* 1. SKU */}
            <div>
              <label className="block text-sm font-medium text-gray-700">SKU / No Barcode</label>
              <input required type="text" name="sku" value={formData.sku} onChange={handleInputChange} placeholder="Scan atau ketik kode" className="mt-1 w-full border border-gray-300 p-2 rounded focus:ring-blue-500 focus:border-blue-500" />
            </div>
            
            {/* 2. KATEGORI */}
            <div>
              <label className="block text-sm font-medium text-gray-700">Kategori</label>
              <input required type="text" name="category" value={formData.category} onChange={handleInputChange} placeholder="" className="mt-1 w-full border border-gray-300 p-2 rounded focus:ring-blue-500 focus:border-blue-500" />
            </div>

            {/* 3. NAMA BARANG */}
            <div>
              <label className="block text-sm font-medium text-gray-700">Nama Barang</label>
              <input required name="item_name" value={formData.item_name} onChange={handleInputChange} placeholder="Contoh: Indomie Goreng" className="mt-1 w-full border border-gray-300 p-2 rounded" />
            </div>

            {/* 4. VARIAN */}
            <div>
              <label className="block text-sm font-medium text-gray-700">Varian</label>
              <input required name="variant_name" value={formData.variant_name} onChange={handleInputChange} placeholder="Pcs / Karton / Pack" className="mt-1 w-full border border-gray-300 p-2 rounded" />
            </div>

            {/* 5. HARGA */}
            <div>
              <label className="block text-sm font-medium text-gray-700">Harga Jual</label>
              <input required type="number" name="price" value={formData.price} onChange={handleInputChange} placeholder="0" className="mt-1 w-full border border-gray-300 p-2 rounded" />
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