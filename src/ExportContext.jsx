import React, { createContext, useState, useContext } from 'react';

const ExportContext = createContext();

export const ExportProvider = ({ children }) => {
  const [exportList, setExportList] = useState([]);

  const addToExportList = (product) => {
    // Cek duplikat agar tidak double scan (Opsional)
    const exists = exportList.find(item => item.sku === product.sku);
    if (exists) {
      alert("Barang ini sudah ada di list export!");
      return;
    }
    
    // Tambahkan jam scan
    const productWithTime = { ...product, scan_time: new Date() };
    setExportList(prev => [productWithTime, ...prev]);
    alert(`"${product.item_name}" masuk ke list export!`);
  };

  const clearExportList = () => setExportList([]);

  return (
    <ExportContext.Provider value={{ exportList, addToExportList, clearExportList }}>
      {children}
    </ExportContext.Provider>
  );
};

export const useExportList = () => useContext(ExportContext);