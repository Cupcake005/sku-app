import React from 'react';
import { useExportList } from '../ExportContext';

const ListPage = () => {
  const { exportList, clearExportList } = useExportList();

  const handleDownload = () => {
    if (exportList.length === 0) return alert("List kosong!");

    let csv = "SKU,Nama Barang,Kategori,Varian,Harga,Waktu Scan\n";
    exportList.forEach(item => {
      const time = new Date(item.scan_time).toLocaleTimeString();
      csv += `${item.sku},"${item.item_name}",${item.category},${item.variant_name},${item.price},${time}\n`;
    });

    const link = document.createElement("a");
    link.href = "data:text/csv;charset=utf-8," + encodeURI(csv);
    link.download = "Hasil_Scan_Export.csv";
    link.click();
  };

  return (
    <div className="pb-20">
      <div className="bg-white p-4 rounded-lg shadow-md min-h-[80vh]">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-blue-600">List Siap Export ({exportList.length})</h2>
          {exportList.length > 0 && (
            <button onClick={clearExportList} className="text-red-500 text-sm underline">Hapus Semua</button>
          )}
        </div>

        {exportList.length === 0 ? (
          <div className="text-center text-gray-400 py-10">
            <p>Belum ada barang di list.</p>
            <p className="text-sm">Scan barang dulu lalu klik "Add to Export".</p>
          </div>
        ) : (
          <div className="space-y-2">
            {exportList.map((item, index) => (
              <div key={index} className="border p-3 rounded-lg flex justify-between items-center bg-gray-50">
                <div>
                  <div className="font-bold">{item.item_name}</div>
                  <div className="text-xs text-gray-500">{item.sku} | {item.variant_name}</div>
                </div>
                <div className="font-bold text-blue-600">Rp {item.price.toLocaleString()}</div>
              </div>
            ))}
          </div>
        )}

        {exportList.length > 0 && (
          <button 
            onClick={handleDownload}
            className="w-full mt-6 bg-green-600 text-white font-bold py-3 rounded-lg shadow-lg hover:bg-green-700"
          >
            📥 Download CSV
          </button>
        )}
      </div>
    </div>
  );
};

export default ListPage;