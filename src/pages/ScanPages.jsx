import React, { useState } from 'react';
import { supabase } from '../supabaseClient';
import Scanner from '../components/Scanner'; 
import { useExportList } from '../ExportContext';
import { Search, Plus, X } from 'lucide-react'; // Import ikon tambahan

const ScanPage = () => {
  const { addToExportList } = useExportList();
  const [mode, setMode] = useState('scan'); // scan, result, form
  const [loading, setLoading] = useState(false);
  const [productData, setProductData] = useState(null);

  // --- STATE BARU UNTUK PENCARIAN ---
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false); // Penanda sedang mode cari

  // State Form Input Baru
  const [formData, setFormData] = useState({
    sku: '', category: '', variant_name: '', price: '', item_name: ''
  });

  // --- 1. FUNGSI SEARCH (BARU) ---
  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    
    setLoading(true);
    setIsSearching(true); // Aktifkan mode tampilan hasil cari
    
    try {
      // Query Supabase: Cari di kolom SKU ATAU item_name (ilike = insensitive case)
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .or(`sku.ilike.%${searchQuery}%,item_name.ilike.%${searchQuery}%`)
        .limit(20); // Batasi 20 hasil saja biar ringan

      if (error) throw error;
      setSearchResults(data || []);
    } catch (error) {
      alert('Error searching: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  // Fungsi Reset Pencarian
  const clearSearch = () => {
    setSearchQuery('');
    setSearchResults([]);
    setIsSearching(false);
  };

  // --- 2. LOGIKA SCANNER (LAMA - TETAP ADA) ---
  const handleScan = async (sku) => {
    setLoading(true);
    // Reset pencarian manual jika ada
    clearSearch(); 
    
    setFormData({ sku, category: '', variant_name: '', price: '', item_name: '' });

    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('sku', sku)
        .single();

      if (data) {
        setProductData(data);
        setMode('result'); 
      } else {
        setMode('form');   
      }
    } catch (error) {
      setMode('form');
    } finally {
      setLoading(false);
    }
  };

  // --- 3. SIMPAN BARANG BARU (LAMA - TETAP ADA) ---
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
      setMode('scan'); 
    }
  };

  const handleInput = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  return (
    <div className="pb-24"> 
      <div className="bg-white p-4 rounded-lg shadow-md mb-4">
        
        {/* HEADER & SEARCH BAR (SELALU MUNCUL) */}
        <h2 className="text-xl font-bold text-center mb-4 text-blue-600">Cek Stok & Scan</h2>
        
        <form onSubmit={handleSearch} className="relative mb-6">
          <input 
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari Nama Barang / SKU..."
            className="w-full pl-10 pr-4 py-3 border rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 outline-none"
          />
          <Search className="absolute left-3 top-3.5 text-gray-400" size={20} />
          
          {/* Tombol X untuk clear search */}
          {searchQuery && (
            <button type="button" onClick={clearSearch} className="absolute right-3 top-3.5 text-gray-400">
              <X size={20} />
            </button>
          )}
        </form>

        {/* --- TAMPILAN 1: HASIL PENCARIAN (LIST CARD) --- */}
        {isSearching ? (
          <div>
            <div className="flex justify-between items-center mb-2">
              <h3 className="font-bold text-gray-700">Hasil Pencarian ({searchResults.length})</h3>
              <button onClick={clearSearch} className="text-sm text-red-500 underline">Tutup</button>
            </div>

            {loading && <p className="text-center py-4">Mencari...</p>}

            {searchResults.length === 0 && !loading ? (
               <div className="text-center py-8 text-gray-500">
                 <p>Produk tidak ditemukan.</p>
                 <button onClick={() => setMode('form')} className="mt-2 text-blue-600 underline">
                   + Tambah Barang Baru
                 </button>
               </div>
            ) : (
              <div className="space-y-3">
                {searchResults.map((item) => (
                  <div key={item.id} className="border p-3 rounded-lg shadow-sm flex justify-between items-center bg-gray-50 hover:bg-blue-50 transition">
                    <div className="flex-1">
                      <div className="font-bold text-gray-800">{item.item_name}</div>
                      <div className="text-xs text-gray-500">
                        SKU: {item.sku} | {item.category}
                      </div>
                      <div className="text-sm font-bold text-blue-600">
                        Rp {item.price.toLocaleString()}
                      </div>
                    </div>
                    
                    {/* TOMBOL ADD TO LIST */}
                    <button 
                      onClick={() => addToExportList(item)}
                      className="ml-3 bg-orange-500 hover:bg-orange-600 text-white p-2 rounded-full shadow-md"
                      title="Tambahkan ke List"
                    >
                      <Plus size={20} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : (
          /* --- TAMPILAN 2: SCANNER & FORM (MUNCUL JIKA TIDAK SEARCH) --- */
          <>
            {mode === 'scan' && (
              <>
                <Scanner onScanResult={handleScan} />
                <div className="text-center mt-4 text-sm text-gray-400">- atau gunakan kolom pencarian di atas -</div>
                
                <button onClick={() => setMode('form')} className="w-full mt-4 bg-gray-100 text-gray-600 py-3 rounded-lg font-medium border border-gray-300">
                  ⌨️ Input Barang Baru Manual
                </button>
              </>
            )}

            {/* --- MODE RESULT (HASIL SCAN) --- */}
            {mode === 'result' && productData && (
              <div className="text-center animate-fade-in">
                <div className="bg-green-100 text-green-800 p-2 rounded mb-4 inline-block font-bold">✓ Ditemukan</div>
                <h2 className="text-2xl font-bold">{productData.item_name}</h2>
                <p className="text-gray-600">{productData.sku}</p>
                <p className="text-3xl font-bold text-blue-600 mb-6">Rp {productData.price.toLocaleString()}</p>

                <button 
                  onClick={() => {
                    addToExportList(productData);
                    setMode('scan');
                  }}
                  className="w-full bg-orange-500 text-white font-bold py-4 rounded-lg shadow-lg hover:bg-orange-600 mb-3 flex justify-center items-center gap-2"
                >
                  <Plus size={24} /> Masukkan ke List
                </button>

                <button onClick={() => setMode('scan')} className="w-full bg-gray-200 py-3 rounded-lg">Scan Lagi</button>
              </div>
            )}

            {/* --- MODE FORM (INPUT BARU) --- */}
            {mode === 'form' && (
              <form onSubmit={handleSaveNew} className="space-y-3">
                <div className="bg-yellow-50 border-l-4 border-yellow-400 p-3 mb-4">
                  <p className="text-yellow-800 font-bold text-sm">Barang Baru / Tidak Ditemukan</p>
                  <p className="text-xs text-yellow-600">Silakan input data produk ini ke database.</p>
                </div>
                
                <input required name="sku" value={formData.sku} onChange={handleInput} placeholder="SKU / Kode Barang" className="w-full border p-2 rounded" />
                <input required name="item_name" value={formData.item_name} onChange={handleInput} placeholder="Nama Barang" className="w-full border p-2 rounded" />
                <input required name="category" value={formData.category} onChange={handleInput} placeholder="Kategori" className="w-full border p-2 rounded" />
                <input required name="variant_name" value={formData.variant_name} onChange={handleInput} placeholder="Varian" className="w-full border p-2 rounded" />
                <input required type="number" name="price" value={formData.price} onChange={handleInput} placeholder="Harga Jual" className="w-full border p-2 rounded" />
                
                <div className="flex gap-2 pt-2">
                  <button type="button" onClick={() => setMode('scan')} className="w-1/3 bg-gray-200 py-2 rounded">Batal</button>
                  <button type="submit" className="w-2/3 bg-green-600 text-white py-2 rounded font-bold">Simpan Data</button>
                </div>
              </form>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default ScanPage;