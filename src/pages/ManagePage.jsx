import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import { useAuth } from '../AuthProvider'; 
import Scanner from '../components/Scanner';
import ProductModal from '../components/ProductModal';
import { Search, Trash2, Edit, ScanLine, Download, Upload, Plus, ArrowUp } from 'lucide-react';

const ManagePage = () => {
  const { user } = useAuth(); 
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  // --- STATE MODAL & SCANNER ---
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentProduct, setCurrentProduct] = useState(null); // null = Mode Tambah
  const [showScanner, setShowScanner] = useState(false);
  const fileInputRef = useRef(null);

  // --- 1. LOGIKA INIT & URL PARAM ---
  useEffect(() => {
    if (user) {
        fetchProducts();
    }
    
    const skuFromUrl = searchParams.get('sku');
    if (skuFromUrl) {
      setCurrentProduct({ sku: skuFromUrl }); 
      setIsModalOpen(true);
    }
  }, [searchParams, user]);

  // --- 2. FETCH DATA (CHUNK LOOP - BYPASS 1000 LIMIT) ---
  const fetchProducts = async () => {
    setLoading(true);
    try {
        let allData = [];
        let from = 0;
        const step = 1000; // Ambil per 1000 baris
        let more = true;

        while (more) {
            const { data, error } = await supabase
                .from('products')
                .select('*')
                .order('created_at', { ascending: false })
                .range(from, from + step - 1);

            if (error) throw error;

            if (data && data.length > 0) {
                allData = [...allData, ...data];
                from += step;
                if (data.length < step) more = false; // Data habis
            } else {
                more = false;
            }
        }
        
        setProducts(allData);
    } catch (error) {
        console.error("Error fetching products:", error);
    } finally {
        setLoading(false);
    }
  };

  // --- 3. SAVE PRODUCT (CREATE, UPDATE & VARIANT) ---
  const handleSaveProduct = async (formData, isVariantMode = false) => {
    if (!user) return alert("Sesi habis. Silakan login ulang.");
    setLoading(true);
    
    // Logika Update: HANYA JIKA bukan mode varian, ada produk, dan ada ID
    const isUpdate = !isVariantMode && currentProduct && currentProduct.id;

    let error;

    if (isUpdate) {
      // --- UPDATE (Edit Data Lama) ---
      const { error: err } = await supabase
        .from('products')
        .update({
          sku: formData.sku,
          item_name: formData.item_name,
          category: formData.category,
          brand_name: formData.brand_name,
          variant_name: formData.variant_name,
          price: parseFloat(formData.price),
          wholesale_price: parseFloat(formData.wholesale_price) || 0 // Update Grosir
        })
        .eq('id', currentProduct.id);
      error = err;
    } else {
      // --- CREATE (Data Baru / Varian Baru) ---
      const { error: err } = await supabase
        .from('products')
        .insert([{
          user_id: user.id, // Bind ke User
          sku: formData.sku || '-',
          item_name: formData.item_name,
          category: formData.category,
          brand_name: formData.brand_name || '-',
          variant_name: formData.variant_name,
          price: parseFloat(formData.price) || 0,
          wholesale_price: parseFloat(formData.wholesale_price) || 0 // Simpan Grosir
        }]);
      error = err;
    }

    setLoading(false);

    if (error) {
      alert(`Gagal ${isUpdate ? 'update' : 'tambah'}: ` + error.message);
    } else {
      const successMsg = isVariantMode 
        ? '✅ Varian baru berhasil dibuat!' 
        : (isUpdate ? '✅ Produk berhasil diperbarui!' : '✅ Produk berhasil ditambahkan!');
      
      alert(successMsg);
      setIsModalOpen(false);
      setCurrentProduct(null);
      setSearchParams({});
      fetchProducts();
    }
  };

  // --- 4. HAPUS DATA ---
  const handleDelete = async (id, name) => {
    if (window.confirm(`Yakin hapus "${name}"?`)) {
      const { error } = await supabase.from('products').delete().eq('id', id);
      if (error) alert('Gagal hapus: ' + error.message);
      else setProducts(products.filter(item => item.id !== id));
    }
  };

  // --- 5. MODAL CONTROL ---
  const handleOpenAdd = () => {
    setCurrentProduct(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (item) => {
    setCurrentProduct(item);
    setIsModalOpen(true);
  };

  // --- 6. EXPORT CSV (UPDATE: TAMBAH KOLOM GROSIR) ---
  const handleExport = () => { 
      if (products.length === 0) return alert("Data kosong!");
      const header = "Category,SKU,Items Name (Do Not Edit),Brand Name,Variant name,Basic - Price,Wholesale Price";
      const rows = products.map(item => {
        const category = `"${item.category || ''}"`;
        const sku = `"${item.sku || ''}"`; 
        const name = `"${item.item_name || ''}"`;
        const brand = `"${item.brand_name || ''}"`;
        const variant = `"${item.variant_name || ''}"`;
        const price = item.price || 0;
        const wholesale = item.wholesale_price || 0;
        return `${category},${sku},${name},${brand},${variant},${price},${wholesale}`;
      });
      const csvContent = [header, ...rows].join("\n");
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement("a");
      const url = URL.createObjectURL(blob);
      link.setAttribute("href", url);
      link.setAttribute("download", `Database_Toko_${new Date().toISOString().slice(0,10)}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
  };

  // --- 7. IMPORT CSV (UPDATE: TAMBAH KOLOM GROSIR) ---
  const handleImportClick = () => { 
      if (window.confirm("PERINGATAN: Import ini akan MENGHAPUS SEMUA data lama Anda. Lanjutkan?")) {
          fileInputRef.current.click(); 
      }
  };
  
  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async (evt) => { await processImport(evt.target.result); };
    reader.readAsText(file);
    e.target.value = null; 
  };

  const processImport = async (csvText) => { 
      if (!user) return alert("Harus login untuk import!");
      setLoading(true);
      try {
        const lines = csvText.split('\n');
        const dataToInsert = [];
        
        const parseCSVLine = (text) => {
            const result = []; let current = ''; let inQuotes = false;
            for (let i = 0; i < text.length; i++) {
                const char = text[i];
                if (char === '"') inQuotes = !inQuotes; 
                else if (char === ',' && !inQuotes) { result.push(current.trim()); current = ''; } 
                else current += char; 
            }
            result.push(current.trim()); return result;
        };

        for (let i = 1; i < lines.length; i++) {
            const line = lines[i].trim(); if (!line) continue;
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

                // Ambil harga grosir (kolom ke-7 jika ada)
                let wholesaleStr = columns[6] ? clean(columns[6]).replace(/[^0-9.]/g, '') : '0';
                const wholesale_price = parseFloat(wholesaleStr) || 0;
                
                if (!sku) sku = "-";
                
                if (item_name) { 
                    dataToInsert.push({ 
                        user_id: user.id, 
                        category, 
                        sku: String(sku), 
                        item_name, 
                        brand_name, 
                        variant_name, 
                        price,
                        wholesale_price // Simpan ke DB
                    }); 
                }
            }
        }

        if (dataToInsert.length > 0) {
            // Hapus data lama milik user ini saja (aman karena RLS)
            const { error: deleteError } = await supabase.from('products').delete().neq('id', 0); 
            if (deleteError) throw deleteError;

            // Insert data baru
            const { error: insertError } = await supabase.from('products').insert(dataToInsert);
            if (insertError) throw insertError;
            
            alert(`✅ Sukses! ${dataToInsert.length} data baru dimasukkan.`); 
            fetchProducts(); 
        } else { 
            alert("⚠️ File kosong atau format salah."); 
        }
      } catch (error) { 
          alert('Gagal Import: ' + error.message); 
      } finally { 
          setLoading(false); 
      }
  };

  // --- 8. UI HELPERS ---
  const handleScanSearch = (sku) => { setSearchQuery(sku); setShowScanner(false); alert(`🔍 Mencari SKU: ${sku}`); };
  const scrollToTop = () => { window.scrollTo({ top: 0, behavior: 'smooth' }); };
  
  const filteredProducts = products.filter(item => 
    (item.item_name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (item.sku || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="pb-24 relative">
      <div className="bg-white p-4 rounded-lg shadow-md min-h-[80vh]">
        
        {/* Header */}
        <div className="text-center mb-6">
            <h2 className="text-xl font-bold text-blue-600">Manajemen Database</h2>
            <div className="inline-flex items-center gap-2 mt-2 bg-blue-50 px-3 py-1 rounded-full border border-blue-100">
                <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></span>
                <p className="text-xs font-bold text-blue-700">Total : {products.length} Produk</p>
            </div>
        </div>

        {/* Tombol Aksi */}
        <div className="flex flex-col gap-2 mb-6">
          <div className="flex gap-2">
            <button onClick={handleExport} className="flex-1 bg-green-600 text-white py-2 rounded-lg font-bold text-sm flex items-center justify-center gap-2 hover:bg-green-700 shadow"><Download size={18} /> Export Excel</button>
            <button onClick={handleImportClick} className="flex-1 bg-blue-600 text-white py-2 rounded-lg font-bold text-sm flex items-center justify-center gap-2 hover:bg-blue-700 shadow"><Upload size={18} /> Import Excel</button>
          </div>
          
          <button 
            onClick={handleOpenAdd}
            className="w-full bg-indigo-600 text-white py-2 rounded-lg font-bold text-sm flex items-center justify-center gap-2 hover:bg-indigo-700 shadow"
          >
            <Plus size={18} /> Tambah Data Manual
          </button>

          <input type="file" ref={fileInputRef} onChange={handleFileChange} accept=".csv" className="hidden" />
        </div>

        {/* Scanner & Search */}
        {showScanner && (
          <div className="mb-4 animate-fade-in border p-2 rounded bg-gray-50">
            <p className="text-center text-sm font-bold mb-2">Scan Barcode untuk Mencari</p>
            <Scanner onScanResult={handleScanSearch} />
            <button onClick={() => setShowScanner(false)} className="w-full mt-2 bg-gray-200 text-gray-700 py-2 rounded">Tutup Kamera</button>
          </div>
        )}

        <div className="relative mb-4">
          <Search className="absolute left-3 top-3.5 text-gray-400" size={20} />
          <input 
            type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari Nama atau SKU..."
            className="w-full pl-10 pr-12 py-3 border rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 outline-none"
          />
          <button onClick={() => setShowScanner(!showScanner)} className="absolute right-2 top-2 bg-blue-100 p-1.5 rounded-md text-blue-600 hover:bg-blue-200 transition"><ScanLine size={24} /></button>
        </div>

        {/* List Data */}
        {loading ? <p className="text-center py-10">Memuat data...</p> : (
          <div className="space-y-3">
             <div className="text-xs text-gray-400 mb-2 text-right">Menampilkan {filteredProducts.length} dari {products.length} data</div>
            {filteredProducts.map((item) => (
              <div key={item.id} className="border p-3 rounded-lg shadow-sm bg-gray-50 flex justify-between items-center hover:bg-gray-50 transition">
                <div className="flex-1">
                  <div className="font-bold text-gray-800">{item.item_name}</div>
                  <div className="text-xs text-gray-500 flex flex-wrap gap-1 items-center mt-1">
                    <span className="bg-gray-200 px-1.5 py-0.5 rounded text-[10px]">SKU: {item.sku}</span>
                    <span className="bg-blue-50 text-blue-600 px-1.5 py-0.5 rounded text-[10px] border border-blue-100">{item.category}</span>
                    {item.brand_name && item.brand_name !== '-' && <span className="bg-purple-50 text-purple-600 px-1.5 py-0.5 rounded text-[10px] border border-purple-100">{item.brand_name}</span>}
                    {item.variant_name && <span className="bg-orange-50 text-orange-600 px-1.5 py-0.5 rounded text-[10px] border border-orange-100 font-medium">{item.variant_name}</span>}
                  </div>
                  
                  {/* Info Harga */}
                  <div className="flex gap-3 mt-1">
                      <div className="text-sm font-bold text-blue-600">
                        Rp {(item.price || 0).toLocaleString()}
                      </div>
                      {/* Tampilkan Label Grosir Jika Ada */}
                      {item.wholesale_price > 0 && (
                        <div className="text-xs font-bold text-green-600 flex items-center bg-green-50 px-1 rounded">
                           Grosir: Rp {(item.wholesale_price).toLocaleString()}
                        </div>
                      )}
                  </div>

                </div>

                <div className="flex gap-2 ml-2">
                  <button onClick={() => handleOpenEdit(item)} className="bg-blue-100 text-blue-600 p-2 rounded-full hover:bg-blue-200"><Edit size={18} /></button>
                  <button onClick={() => handleDelete(item.id, item.item_name)} className="bg-red-100 text-red-600 p-2 rounded-full hover:bg-red-200"><Trash2 size={18} /></button>
                </div>
              </div>
            ))}
            {filteredProducts.length === 0 && <p className="text-center text-gray-400 mt-10">{searchQuery ? "Barang tidak ditemukan." : "Data kosong."}</p>}
          </div>
        )}
      </div>

      <button onClick={scrollToTop} className="fixed bottom-24 right-6 bg-blue-600 text-white p-3 rounded-full shadow-lg hover:bg-blue-700 z-40 transition-all hover:scale-110 active:scale-95"><ArrowUp size={24} /></button>

      <ProductModal 
        isOpen={isModalOpen} 
        onClose={() => { setIsModalOpen(false); setSearchParams({}); }} 
        product={currentProduct}
        onSave={handleSaveProduct}
        onScanClick={() => { setIsModalOpen(false); setShowScanner(true); }} 
      />

    </div>
  );
};

export default ManagePage;