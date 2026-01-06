import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '../supabaseClient';
import Scanner from '../components/Scanner';
import { Search, Trash2, Edit, X, Save, ScanLine, Download, Upload } from 'lucide-react';

const ManagePage = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [editingProduct, setEditingProduct] = useState(null);
  const [showScanner, setShowScanner] = useState(false);
  
  // Ref untuk input file (hidden)
  const fileInputRef = useRef(null);

  useEffect(() => {
    fetchProducts();
  }, []);

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

  // --- FUNGSI EXPORT (DOWNLOAD CSV) ---
  const handleExport = () => {
    if (products.length === 0) return alert("Data kosong!");

    const header = "Category,SKU,Items Name (Do Not Edit),Brand Name,Variant name,Basic - Price";
    
    const rows = products.map(item => {
      const category = `"${item.category || ''}"`;
      const sku = `"${item.sku || '-'}"`; 
      const name = `"${item.item_name || ''}"`;
      const brand = `"${item.brand_name || '-'}"`;
      const variant = `"${item.variant_name || ''}"`;
      const price = item.price || 0;

      return `${category},${sku},${name},${brand},${variant},${price}`;
    });

    const csvContent = [header, ...rows].join("\n");
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", "Database_Produk_Toko_Acan.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // --- FUNGSI IMPORT (UPLOAD CSV) ---
  const handleImportClick = () => {
    if (window.confirm("PERINGATAN: Import ini akan MENGHAPUS SEMUA data lama di aplikasi dan menggantinya dengan data dari Excel. Lanjutkan?")) {
      fileInputRef.current.click(); 
    }
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (evt) => {
      const text = evt.target.result;
      await processImport(text);
    };
    reader.readAsText(file);
    e.target.value = null; 
  };

  // --- LOGIKA IMPORT: HAPUS DULU BARU INSERT ---
  const processImport = async (csvText) => {
    setLoading(true);
    try {
      const lines = csvText.split('\n');
      const dataToInsert = [];

      // Fungsi Pembaca CSV Manual
      const parseCSVLine = (text) => {
        const result = [];
        let current = '';
        let inQuotes = false;

        for (let i = 0; i < text.length; i++) {
          const char = text[i];
          if (char === '"') {
            inQuotes = !inQuotes; 
          } else if (char === ',' && !inQuotes) {
            result.push(current.trim()); 
            current = '';
          } else {
            current += char; 
          }
        }
        result.push(current.trim());
        return result;
      };

      // Loop parsing data
      for (let i = 1; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue;

        const columns = parseCSVLine(line);
        
        if (columns.length >= 6) {
          const clean = (str) => str ? str.replace(/^"|"$/g, '').trim() : '';

          const category = clean(columns[0]);
          let sku = clean(columns[1]); 
          const item_name = clean(columns[2]); 
          const brand_name = clean(columns[3]);
          const variant_name = clean(columns[4]);
          let priceStr = clean(columns[5]).replace(/[^0-9.]/g, ''); 
          const price = parseFloat(priceStr) || 0;

          if (!sku) sku = "-";

          if (item_name) {
            dataToInsert.push({
              category,
              sku: String(sku), 
              item_name,
              brand_name,
              variant_name,
              price
            });
          }
        }
      }

      if (dataToInsert.length > 0) {
        // --- LANGKAH 1: HAPUS SEMUA DATA LAMA ---
        // Kita menghapus semua data yang kolom 'id' tidak null (artinya semua baris)
        const { error: deleteError } = await supabase
          .from('products')
          .delete()
          .not('id', 'is', null);

        if (deleteError) throw deleteError;

        // --- LANGKAH 2: INSERT DATA BARU ---
        const { error: insertError } = await supabase
          .from('products')
          .insert(dataToInsert);

        if (insertError) throw insertError;
        
        alert(`✅ Sukses! Data lama dihapus. ${dataToInsert.length} data baru telah dimasukkan.`);
        fetchProducts(); 
      } else {
        alert("⚠️ File kosong atau format tidak terbaca.");
      }

    } catch (error) {
      alert('Gagal Import: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  // --- FUNGSI HAPUS SATUAN ---
  const handleDelete = async (id, name) => {
    if (window.confirm(`Yakin mau menghapus "${name}" permanen?`)) {
      const { error } = await supabase.from('products').delete().eq('id', id);
      if (error) {
        alert('Gagal hapus: ' + error.message);
      } else {
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
      setEditingProduct(null);
      fetchProducts();
    }
  };

  const handleScanSearch = (sku) => {
    setSearchQuery(sku);
    setShowScanner(false);
  };

  const filteredProducts = products.filter(item => 
    item.item_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.sku.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="pb-24">
      <div className="bg-white p-4 rounded-lg shadow-md min-h-[80vh]">
        <h2 className="text-xl font-bold text-center mb-4 text-blue-600">Manajemen Database</h2>

        {/* --- TOMBOL IMPORT / EXPORT --- */}
        <div className="flex gap-2 mb-6">
          <button 
            onClick={handleExport}
            className="flex-1 bg-green-600 text-white py-2 rounded-lg font-bold text-sm flex items-center justify-center gap-2 hover:bg-green-700 shadow"
          >
            <Download size={18} /> Export Excel
          </button>
          
          <button 
            onClick={handleImportClick}
            className="flex-1 bg-blue-600 text-white py-2 rounded-lg font-bold text-sm flex items-center justify-center gap-2 hover:bg-blue-700 shadow"
          >
            <Upload size={18} /> Import Excel
          </button>
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleFileChange} 
            accept=".csv" 
            className="hidden" 
          />
        </div>

        {/* --- SCANNER --- */}
        {showScanner && (
          <div className="mb-4 animate-fade-in border p-2 rounded bg-gray-50">
            <p className="text-center text-sm font-bold mb-2">Scan Barcode untuk Mencari</p>
            <Scanner onScanResult={handleScanSearch} />
            <button onClick={() => setShowScanner(false)} className="w-full mt-2 bg-gray-200 text-gray-700 py-2 rounded">
              Batal / Tutup Kamera
            </button>
          </div>
        )}

        {/* --- SEARCH BAR --- */}
        <div className="relative mb-4">
          <Search className="absolute left-3 top-3.5 text-gray-400" size={20} />
          <input 
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Scan atau ketik Nama/SKU..."
            className="w-full pl-10 pr-12 py-3 border rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 outline-none"
          />
          <button 
            onClick={() => setShowScanner(!showScanner)}
            className="absolute right-2 top-2 bg-blue-100 p-1.5 rounded-md text-blue-600 hover:bg-blue-200 transition"
          >
            <ScanLine size={24} />
          </button>
        </div>

        {/* --- LIST DATA --- */}
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
                  <button onClick={() => setEditingProduct(item)} className="bg-blue-100 text-blue-600 p-2 rounded-full hover:bg-blue-200">
                    <Edit size={18} />
                  </button>
                  <button onClick={() => handleDelete(item.id, item.item_name)} className="bg-red-100 text-red-600 p-2 rounded-full hover:bg-red-200">
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            ))}
            
            {filteredProducts.length === 0 && (
              <p className="text-center text-gray-400 mt-10">
                {searchQuery ? "Barang tidak ditemukan." : "Data kosong."}
              </p>
            )}
          </div>
        )}
      </div>

      {/* --- MODAL EDIT --- */}
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