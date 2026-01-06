import React, { createContext, useState, useContext } from 'react';

const ExportContext = createContext();

export const ExportProvider = ({ children }) => {
  const [exportList, setExportList] = useState([]);

  // Tambah ke list
  const addToExportList = (product) => {
    const productWithTime = { ...product, scan_time: new Date() };
    setExportList(prev => [productWithTime, ...prev]);
    alert(`"${product.item_name}" masuk ke list export!`);
  };

  // Hapus SEMUA
  const clearExportList = () => setExportList([]);

  // --- FUNGSI BARU: Hapus SATU Item ---
  const removeFromExportList = (indexToRemove) => {
    setExportList(prev => prev.filter((_, index) => index !== indexToRemove));
  };

  return (
    <ExportContext.Provider value={{ exportList, addToExportList, clearExportList, removeFromExportList }}>
      {children}
    </ExportContext.Provider>
  );
};

export const useExportList = () => useContext(ExportContext);