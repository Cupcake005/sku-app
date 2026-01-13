import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from './supabaseClient';
import { useAuth } from './AuthProvider'; 

const ExportContext = createContext();

export const useExportList = () => useContext(ExportContext);

export const ExportProvider = ({ children }) => {
  const { user } = useAuth(); 
  const [exportList, setExportList] = useState([]);

  // 1. Fetch data saat user login
  useEffect(() => {
    if (user) {
        fetchExportList();
    } else {
        setExportList([]); 
    }
  }, [user]);

  const fetchExportList = async () => {
    // Ambil semua kolom (*) agar brand dan varian ikut terbawa
    const { data } = await supabase
        .from('export_items')
        .select('*')
        .order('created_at', { ascending: false });
        
    setExportList(data || []);
  };

  // 2. Tambah Item (PERBAIKAN DI SINI)
  const addToExportList = async (product) => {
    if (!user) return alert("Harus login dulu!");

    const newItem = {
        user_id: user.id,
        sku: product.sku,
        item_name: product.item_name,
        price: product.price,
        category: product.category,
        // --- INI YANG TADI HILANG, SEKARANG DITAMBAHKAN ---
        brand_name: product.brand_name || '-', 
        variant_name: product.variant_name || '',
        qty: 1
    };

    const { error } = await supabase.from('export_items').insert([newItem]);
    
    if (error) {
        console.error("Error adding to export:", error);
        alert("Gagal simpan: " + error.message);
    } else {
        fetchExportList(); // Refresh list agar data baru muncul
    }
  };

  // 3. Hapus Item
  const removeFromExportList = async (id) => { 
    const { error } = await supabase.from('export_items').delete().eq('id', id);
    if (!error) fetchExportList();
  };

  // 4. Reset List
  const clearExportList = async () => {
    const { error } = await supabase.from('export_items').delete().neq('id', 0); 
    if (!error) setExportList([]);
  };

  return (
    <ExportContext.Provider value={{ exportList, addToExportList, removeFromExportList, clearExportList }}>
      {children}
    </ExportContext.Provider>
  );
};