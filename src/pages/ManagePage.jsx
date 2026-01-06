import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { Search, Trash2, Edit, X, Save, AlertTriangle } from 'lucide-react';

const ManagePage = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [editingProduct, setEditingProduct] = useState(null); // Menyimpan data yang sedang diedit

  // Ambil semua data saat halaman dibuka
  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .order('created_at', { ascending: false }); // Urutkan dari yang terbaru
    
    if (error) console.error(error);
    else setProducts(data || []);
    setLoading(false);
  };

  // --- FUNGSI HAPUS ---
  const handleDelete = async (id, name) => {
    if (window.confirm(`Yakin mau menghapus "${name}" permanen?`)) {
      const { error } = await supabase.from('products').delete().eq('id', id);
      if (error) {
        alert('Gagal hapus: ' + error.message);
      } else {
        // Hapus dari state biar langsung hilang tanpa refresh
        setProducts(products.filter(item => item.id !== id));
      }
    }
  };

  // --- FUNGSI UPDATE/EDIT ---
  const handleUpdate = async (e) => {
    e.preventDefault();
    const { error } = await supabase
      .from('products')
      .update({
        sku: editingProduct.sku,
        item_name: editingProduct.item_name,
        category: editingProduct.category,
        variant_name: editingProduct.variant_name,
        price: parseFloat(editingProduct.price)
      })
      .eq('id', editingProduct.id);

    if (error) {
      alert('Gagal update: ' + error.message);
    } else {
      alert('✅ Data berhasil diperbarui!');
      setEditingProduct(null); // Tutup modal edit
      fetchProducts(); // Refresh data terbaru
    }
  };

  // Filter pencarian di sisi klien (biar cepat)
  const filteredProducts = products.filter(item => 
    item.item_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.sku.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="pb-24">
      <div className="bg-white p-4 rounded-lg shadow-md min-h-[80vh]">
        <h2 className="text-xl font-bold text-center mb-4 text-blue-600">Manajemen Database</h2>

        {/* SEARCH BAR */}
        <div className="relative mb-4">
          <input 
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari Nama / SKU untuk diedit..."
            className="w-full pl-10 pr-4 py-3 border rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 outline-none"
          />
          <Search className="absolute left-3 top-3.5 text-gray-400" size={20} />
        </div>

        {/* LIST DATA */}
        {loading ? (
          <p className="text-center py-10">Memuat data...</p>
        ) : (
          <div className="space-y-3">
            {filteredProducts.map((item) => (
              <div key={item.id} className="border p-3 rounded-lg shadow-sm bg-gray-50 flex justify-between items-center">
                <div className="flex-1">
                  <div className="font-bold text-gray-800">{item.item_name}</div>
                  <div className="text-xs text-gray-500">
                    SKU: {item.sku} | {item.category}
                  </div>
                  <div className="text-sm font-bold text-blue-600">
                    Rp {item.price.toLocaleString()}
                  </div>
                </div>

                <div className="flex gap-2 ml-2">
                  {/* Tombol Edit */}
                  <button 
                    onClick={() => setEditingProduct(item)}
                    className="bg-blue-100 text-blue-600 p-2 rounded-full hover:bg-blue-200"
                  >
                    <Edit size={18} />
                  </button>
                  {/* Tombol Hapus */}
                  <button 
                    onClick={() => handleDelete(item.id, item.item_name)}
                    className="bg-red-100 text-red-600 p-2 rounded-full hover:bg-red-200"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            ))}
            
            {filteredProducts.length === 0 && (
              <p className="text-center text-gray-400 mt-10">Tidak ada data ditemukan.</p>
            )}
          </div>
        )}
      </div>

      {/* --- MODAL EDIT (MUNCUL JIKA ADA DATA YANG DIEDIT) --- */}
      {editingProduct && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white w-full max-w-sm rounded-xl shadow-2xl p-6 animate-fade-in">
            <div className="flex justify-between items-center mb-4 border-b pb-2">
              <h3 className="font-bold text-lg">Edit Produk</h3>
              <button onClick={() => setEditingProduct(null)}><X size={24} /></button>
            </div>
            
            <form onSubmit={handleUpdate} className="space-y-3">
              <div>
                <label className="text-xs font-bold text-gray-500">Nama Barang</label>
                <input required className="w-full border p-2 rounded" 
                  value={editingProduct.item_name}
                  onChange={(e) => setEditingProduct({...editingProduct, item_name: e.target.value})}
                />
              </div>
              <div>
                <label className="text-xs font-bold text-gray-500">SKU / Kode</label>
                <input required className="w-full border p-2 rounded bg-gray-100" 
                  value={editingProduct.sku}
                  onChange={(e) => setEditingProduct({...editingProduct, sku: e.target.value})}
                />
              </div>
              <div className="flex gap-2">
                <div className="w-1/2">
                   <label className="text-xs font-bold text-gray-500">Kategori</label>
                   <input required className="w-full border p-2 rounded" 
                     value={editingProduct.category}
                     onChange={(e) => setEditingProduct({...editingProduct, category: e.target.value})}
                   />
                </div>
                <div className="w-1/2">
                   <label className="text-xs font-bold text-gray-500">Varian</label>
                   <input required className="w-full border p-2 rounded" 
                     value={editingProduct.variant_name}
                     onChange={(e) => setEditingProduct({...editingProduct, variant_name: e.target.value})}
                   />
                </div>
              </div>
              <div>
                <label className="text-xs font-bold text-gray-500">Harga</label>
                <input required type="number" className="w-full border p-2 rounded" 
                  value={editingProduct.price}
                  onChange={(e) => setEditingProduct({...editingProduct, price: e.target.value})}
                />
              </div>

              <button type="submit" className="w-full bg-blue-600 text-white font-bold py-3 rounded-lg mt-4 flex justify-center gap-2">
                <Save size={20} /> Simpan Perubahan
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManagePage;