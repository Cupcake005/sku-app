import React, { createContext, useState, useEffect, useContext } from 'react';

const ExportContext = createContext();

export const ExportProvider = ({ children }) => {
  // 1. Cek Memori HP (localStorage) saat aplikasi dibuka
  const [exportList, setExportList] = useState(() => {
    const savedData = localStorage.getItem('tokoAcan_exportList');
    return savedData ? JSON.parse(savedData) : [];
  });

  // 2. Setiap kali exportList berubah, simpan ulang ke Memori HP
  useEffect(() => {
    localStorage.setItem('tokoAcan_exportList', JSON.stringify(exportList));
  }, [exportList]);

  const addToExportList = (item) => {
    setExportList((prev) => [...prev, item]);
  };

  const removeFromExportList = (skuToRemove) => {
    setExportList((prev) => prev.filter(item => item.sku !== skuToRemove));
  };

  const clearList = () => {
    setExportList([]);
    localStorage.removeItem('tokoAcan_exportList'); // Hapus dari memori juga
  };

  return (
    <ExportContext.Provider value={{ exportList, addToExportList, removeFromExportList, clearList }}>
      {children}
    </ExportContext.Provider>
  );
};

export const useExportList = () => useContext(ExportContext);