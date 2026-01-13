import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from './supabaseClient';
import { useAuth } from './AuthProvider'; // Import auth

const ExportContext = createContext();

export const useExportList = () => useContext(ExportContext);

export const ExportProvider = ({ children }) => {
  const { user } = useAuth(); // Ambil user yang sedang login
  const [exportList, setExportList] = useState([]);

  // 1. Fetch data saat user login
  useEffect(() => {
    if (user) fetchExportList();
    else setExportList([]); // Kosongkan jika logout
  }, [user]);

  const fetchExportList = async () => {
    const { data } = await supabase.from('export_items').select('*').order('created_at', { ascending: false });
    setExportList(data || []);
  };

  // 2. Tambah Item (Simpan ke DB)
  const addToExportList = async (product) => {
    if (!user) return alert("Harus login dulu!");

    const newItem = {
        user_id: user.id, // Kunci utama: Punya siapa item ini?
        sku: product.sku,
        item_name: product.item_name,
        price: product.price,
        category: product.category,
        qty: 1
    };

    const { error } = await supabase.from('export_items').insert([newItem]);
    
    if (error) alert("Gagal simpan: " + error.message);
    else fetchExportList(); // Refresh list
  };

  // 3. Hapus Item (Hapus dari DB)
  const removeFromExportList = async (id) => { // id di sini adalah id tabel export_items
    const { error } = await supabase.from('export_items').delete().eq('id', id);
    if (!error) fetchExportList();
  };

  // 4. Reset List
  const clearExportList = async () => {
    const { error } = await supabase.from('export_items').delete().neq('id', 0); // Hapus semua punya user ini (RLS melindunginya)
    if (!error) setExportList([]);
  };

  return (
    <ExportContext.Provider value={{ exportList, addToExportList, removeFromExportList, clearExportList }}>
      {children}
    </ExportContext.Provider>
  );
};