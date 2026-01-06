import React, { createContext, useState, useContext } from 'react';

const ExportContext = createContext();

export const ExportProvider = ({ children }) => {
  const [exportList, setExportList] = useState([]);

  // Tambah ke list
  const addToExportList = (item) => {
    setExportList((prev) => [...prev, item]);
  };

  // --- TAMBAHKAN INI: Hapus dari list berdasarkan SKU ---
  const removeFromExportList = (skuToRemove) => {
    setExportList((prev) => prev.filter(item => item.sku !== skuToRemove));
  };

  // Reset list
  const clearList = () => setExportList([]);

  return (
    <ExportContext.Provider value={{ exportList, addToExportList, removeFromExportList, clearList }}>
      {children}
    </ExportContext.Provider>
  );
};

export const useExportList = () => useContext(ExportContext);