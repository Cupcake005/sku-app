import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import Scanner from '../components/Scanner';
import AddProductModal from '../components/AddProductModal'; // <--- IMPORT COMPONENT BARU
import { Search, Trash2, Edit, X, Save, ScanLine, Download, Upload, Plus, ArrowUp } from 'lucide-react';

const ManagePage = () => {
  const [searchParams, setSearchParams] = useSearchParams(); // Pakai setSearchParams juga untuk clear URL
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  // State Edit
  const [editingProduct, setEditingProduct] = useState(null);
  
  // State Tambah Baru (Sekarang lebih simpel)
  const [showAddModal, setShowAddModal] = useState(false);
  const [pendingSku, setPendingSku] = useState(''); // SKU yang mau ditambah

  const [showScanner, setShowScanner] = useState(false);
  const fileInputRef = useRef(null);

  // --- 1. LOGIKA CEK URL (REDIRECT DARI SCANNER) ---
  useEffect(() => {
    fetchProducts();

    const skuFromUrl = searchParams.get('sku');
    if (skuFromUrl) {
      setPendingSku(skuFromUrl); // Set SKU ke state
      setShowAddModal(true);     // Buka Modal Tambah
    }
  }, [searchParams]);

  const fetchProducts = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) console.error(error);
    else setProducts(data || []);
    setLoading(false);
  };

  // --- HANDLE MODAL CLOSE ---
  const handleCloseAddModal = () => {
    setShowAddModal(false);
    setPendingSku(''); 
    // Bersihkan URL agar kalau di-refresh tidak muncul modal lagi
    setSearchParams({});
  };

  // --- EXPORT & IMPORT (TETAP SAMA SEPERTI SEBELUMNYA) ---
  const handleExport = () => { /* ... kode export sama ... */ };
  const handleImportClick = () => { /* ... kode import sama ... */ };
  const handleFileChange = async (e) => { /* ... kode file change sama ... */ };
  const processImport = async (csvText) => { /* ... kode process import sama ... */ };

  // --- UPDATE DATA (EDIT) ---
  const handleUpdate = async (e) => {
    e.preventDefault();
    const { error } = await supabase
      .from('products')
      .update({
        sku: editingProduct.sku,
        item_name: editingProduct.item_name,
        category: editingProduct.category,
        brand_name: editingProduct.brand_name,
        variant_name: editingProduct.variant_name,
        price: parseFloat(editingProduct.price)
      })
      .eq('id', editingProduct.id);

    if (error) alert('Gagal update: ' + error.message);
    else {
      alert('✅ Data diperbarui!');
      setEditingProduct(null);
      fetchProducts();
    }
  };

  const handleDelete = async (id, name) => {
    if (window.confirm(`Yakin hapus "${name}"?`)) {
      const { error } = await supabase.from('products').delete().eq('id', id);
      if (error) alert('Gagal hapus: ' + error.message);
      else setProducts(products.filter(item => item.id !== id));
    }
  };

  // --- SCANNER UNTUK SEARCH ---
  const handleScanSearch = (sku) => {
    setSearchQuery(sku);
    setShowScanner(false);
  };

  const filteredProducts = products.filter(item => 
    item.item_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.sku.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="pb-24 relative">
      <div className="bg-white p-4 rounded-lg shadow-md min-h-[80vh]">
        
        {/* Header */}
        <div className="text-center mb-6">
            <h2 className="text-xl font-bold text-blue-600">Manajemen Database</h2>
            <div className="inline-flex items-center gap-2 mt-2 bg-blue-50 px-3 py-1 rounded-full border border-blue-100">
             <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></span>
             <p className="text-xs font-bold text-blue-700">Total: {products.length} Produk</p>
            </div>
        </div>

        {/* Tombol Atas */}
        <div className="flex flex-col gap-2 mb-6">
          <div className="flex gap-2">
            {/* Tombol Export Import ada disini (disingkat) */}
             <button onClick={() => alert("Fitur Export")} className="flex-1 bg-green-600 text-white py-2 rounded-lg text-sm font-bold"><Download size={16}/> Export</button>
             <button onClick={() => alert("Fitur Import")} className="flex-1 bg-blue-600 text-white py-2 rounded-lg text-sm font-bold"><Upload size={16}/> Import</button>
          </div>
          
          <button 
            onClick={() => { setPendingSku(''); setShowAddModal(true); }} 
            className="w-full bg-indigo-600 text-white py-2 rounded-lg font-bold text-sm flex items-center justify-center gap-2 hover:bg-indigo-700 shadow"
          >
            <Plus size={18} /> Tambah Data Manual
          </button>
        </div>

        {/* Scanner Search & Search Bar */}
        {showScanner && (
          <div className="mb-4 border p-2 rounded bg-gray-50">
            <Scanner onScanResult={handleScanSearch} />
            <button onClick={() => setShowScanner(false)} className="w-full mt-2 bg-gray-200 text-gray-700 py-2 rounded">Tutup Kamera</button>
          </div>
        )}

        <div className="relative mb-4">
          <Search className="absolute left-3 top-3.5 text-gray-400" size={20} />
          <input 
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari Nama atau SKU..."
            className="w-full pl-10 pr-12 py-3 border rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 outline-none"
          />
          <button onClick={() => setShowScanner(!showScanner)} className="absolute right-2 top-2 bg-blue-100 p-1.5 rounded-md text-blue-600">
            <ScanLine size={24} />
          </button>
        </div>

        {/* List Produk */}
        {loading ? <p className="text-center">Loading...</p> : (
          <div className="space-y-3">
            {filteredProducts.map((item) => (
              <div key={item.id} className="border p-3 rounded-lg shadow-sm bg-gray-50 flex justify-between items-center">
                <div className="flex-1">
                  <div className="font-bold text-gray-800">{item.item_name}</div>
                  <div className="text-xs text-gray-500 mt-1">SKU: {item.sku} | {item.category}</div>
                  <div className="text-sm font-bold text-blue-600 mt-1">Rp {item.price.toLocaleString()}</div>
                </div>
                <div className="flex gap-2 ml-2">
                  <button onClick={() => setEditingProduct(item)} className="bg-blue-100 text-blue-600 p-2 rounded-full"><Edit size={18}/></button>
                  <button onClick={() => handleDelete(item.id, item.item_name)} className="bg-red-100 text-red-600 p-2 rounded-full"><Trash2 size={18}/></button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* --- MODAL EDIT (Masih inline karena logic edit butuh data existing) --- */}
      {editingProduct && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
           {/* ... (Kode Form Edit sama seperti sebelumnya) ... */}
           {/* Biar singkat tidak saya tulis ulang, isinya form edit biasa */}
           <div className="bg-white p-6 rounded-lg">
             <h3 className="mb-4 font-bold">Edit Produk</h3>
             {/* Tombol Cancel Edit */}
             <button onClick={() => setEditingProduct(null)} className="text-red-500">Batal</button>
           </div>
        </div>
      )}

      {/* --- PEMANGGILAN KOMPONEN TAMBAH BARU --- */}
      <AddProductModal 
        isOpen={showAddModal} 
        onClose={handleCloseAddModal} 
        initialSku={pendingSku} 
        onSuccess={fetchProducts} 
      />

    </div>
  );
};

export default ManagePage;