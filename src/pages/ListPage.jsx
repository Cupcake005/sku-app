import React from 'react';
import { useExportList } from '../ExportContext';
import { useNavigate } from 'react-router-dom';
import { Trash2, FileDown, ArrowLeft, AlertCircle, XCircle, Tag, Clock } from 'lucide-react';

const ListPage = () => {
  const { exportList, clearExportList, removeFromExportList } = useExportList();
  const navigate = useNavigate();

  // --- LOGIKA HAPUS SEMUA ---
  const handleClearAll = () => {
    if (exportList.length === 0) return;

    if (window.confirm("⚠️ Yakin ingin menghapus SEMUA barang di list?")) {
      if (typeof clearExportList === 'function') {
        clearExportList();
      } else {
        [...exportList].forEach(item => {
           if (item.sku) removeFromExportList(item.sku);
        });
      }
    }
  };

  // --- LOGIKA HAPUS SATUAN DENGAN KONFIRMASI ---
  const handleDeleteItem = (sku, name) => {
    if (window.confirm(`Yakin ingin menghapus "${name}" dari list?`)) {
        removeFromExportList(sku);
    }
  };

  // --- LOGIKA DOWNLOAD SESUAI FORMAT EXCEL ---
  const handleDownload = () => {
    if (exportList.length === 0) return alert("List kosong!");

    const header = "Category,SKU,Items Name (Do Not Edit),Brand Name,Variant name,Basic - Price";

    const rows = exportList.map(item => {
      const category = `"${item.category || ''}"`;
      const sku = `"${item.sku || '-'}"`; 
      const name = `"${(item.item_name || '').replace(/"/g, '""')}"`; 
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
    link.setAttribute("download", `Stok_Export_${new Date().toLocaleDateString('id-ID').replace(/\//g, '-')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-40">
      
      {/* Header Sticky */}
      <div className="bg-white p-4 shadow-sm sticky top-0 z-10 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="p-2 rounded-full hover:bg-gray-100 transition">
            <ArrowLeft size={24} className="text-gray-600" />
          </button>
          <h1 className="text-xl font-bold text-gray-800">List Export</h1>
        </div>
        <div className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-xs font-bold">
          {exportList.length} Item
        </div>
      </div>

      <div className="p-4 max-w-md mx-auto mt-2">
        
        {/* Header List & Tombol Hapus */}
        <div className="flex justify-between items-end mb-3">
            <h3 className="font-bold text-gray-700 text-lg">Rincian Barang</h3>
            {exportList.length > 0 && (
                <button 
                    onClick={handleClearAll}
                    className="text-red-500 text-xs font-semibold flex items-center gap-1 bg-red-50 px-3 py-1.5 rounded-lg hover:bg-red-100 border border-red-100 transition"
                >
                    <XCircle size={14}/> Hapus Semua
                </button>
            )}
        </div>

        {/* List Content */}
        {exportList.length === 0 ? (
          <div className="text-center py-12 border-2 border-dashed border-gray-300 rounded-xl bg-white mt-4">
            <AlertCircle size={48} className="mx-auto text-gray-300 mb-3" />
            <p className="text-gray-500 font-medium">List Masih Kosong</p>
            <p className="text-xs text-gray-400 mt-1">Data scan akan muncul disini</p>
            <button onClick={() => navigate(-1)} className="mt-6 text-blue-600 font-bold text-sm hover:underline bg-blue-50 px-4 py-2 rounded-lg">
                + Mulai Scan Barang
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {exportList.map((item, index) => (
              <div key={`${item.sku}-${index}`} className="bg-white p-3 rounded-lg shadow-sm border border-gray-200 flex justify-between items-start hover:shadow-md transition">
                
                {/* Detail Barang */}
                <div className="flex-1 pr-2">
                  <div className="font-bold text-gray-800 text-base mb-1.5 leading-tight">{item.item_name}</div>
                  
                  {/* Grid Data Lengkap */}
                  <div className="grid grid-cols-1 gap-1 text-sm text-gray-600 bg-gray-50 p-2 rounded-md border border-gray-100">
                    
                    {/* Baris 1: SKU & Kategori */}
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="bg-white border px-1.5 rounded font-mono text-xs text-gray-500 font-bold tracking-wide">
                        {item.sku}
                      </span>
                      <span className="flex items-center gap-1 text-blue-600 bg-blue-50 px-1.5 rounded text-[10px] font-bold border border-blue-100 uppercase tracking-wide">
                        <Tag size={10} /> {item.category || 'NO-CAT'}
                      </span>
                    </div>

                    {/* Baris 2: Brand & Varian */}
                    <div className="flex flex-wrap gap-2 mt-1">
                        {item.brand_name && (
                            <span className="text-[10px] text-purple-600 bg-purple-50 px-1.5 rounded border border-purple-100">
                                {item.brand_name}
                            </span>
                        )}
                        {item.variant_name && (
                            <span className="text-[10px] text-orange-600 bg-orange-50 px-1.5 rounded border border-orange-100">
                                {item.variant_name}
                            </span>
                        )}
                    </div>
                    
                    {/* Baris 3: Waktu Scan */}
                    <div className="flex items-center gap-1 text-[10px] text-gray-400 mt-1 border-t border-gray-100 pt-1">
                        <Clock size={10} />
                        {item.scan_time ? new Date(item.scan_time).toLocaleString('id-ID') : '-'}
                    </div>

                  </div>

                  {/* Harga */}
                  <div className="text-base font-bold text-blue-600 mt-2">
                    Rp {item.price ? item.price.toLocaleString() : '0'}
                  </div>
                </div>

                {/* Tombol Hapus Per Item (LOGO JADI MERAH) */}
                <button 
                  onClick={() => handleDeleteItem(item.sku, item.item_name)} 
                  // SAYA UBAH DISINI: text-gray-300 JADI text-red-500
                  className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition mt-1"
                >
                  <Trash2 size={20} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Floating Download Button */}
      {exportList.length > 0 && (
        <div className="fixed bottom-20 left-0 right-0 px-4 z-20 pointer-events-none">
            <div className="max-w-md mx-auto pointer-events-auto">
                <button 
                    onClick={handleDownload}
                    className="w-full bg-green-600 text-white font-bold py-3.5 rounded-xl shadow-xl hover:bg-green-700 flex justify-center items-center gap-2 active:scale-95 transition border-2 border-white/20"
                >
                    <FileDown size={20} />
                    Download CSV
                </button>
            </div>
        </div>
      )}

    </div>
  );
};

export default ListPage;