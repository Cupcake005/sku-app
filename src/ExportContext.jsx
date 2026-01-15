// import React, { createContext, useContext, useState, useEffect } from 'react';
// import { supabase } from './supabaseClient';
// import { useAuth } from './AuthProvider'; 

// const ExportContext = createContext();

// export const useExportList = () => useContext(ExportContext);

// export const ExportProvider = ({ children }) => {
//   const { user } = useAuth(); 
//   const [exportList, setExportList] = useState([]);

//   useEffect(() => {
//     if (user) fetchExportList();
//     else setExportList([]); 
//   }, [user]);

//   const fetchExportList = async () => {
//     const { data } = await supabase
//         .from('export_items')
//         .select('*')
//         .order('created_at', { ascending: false });
//     setExportList(data || []);
//   };

//   // --- BAGIAN YANG DIUPDATE ---
//   const addToExportList = async (product) => {
//     if (!user) return alert("Harus login dulu!");

//     const newItem = {
//         user_id: user.id,
//         sku: product.sku,
//         item_name: product.item_name,
//         category: product.category,
//         brand_name: product.brand_name || '-', 
//         variant_name: product.variant_name || '',
        
//         // SIMPAN KEDUA HARGA
//         price: parseFloat(product.price) || 0, // Harga Normal
//         wholesale_price: parseFloat(product.wholesale_price) || 0, // Harga Grosir
        
//         qty: 1
//     };

//     const { error } = await supabase.from('export_items').insert([newItem]);
    
//     if (error) {
//         console.error("Error adding to export:", error);
//         alert("Gagal simpan: " + error.message);
//     } else {
//         fetchExportList(); 
//     }
//   };

//   const removeFromExportList = async (id) => { 
//     const { error } = await supabase.from('export_items').delete().eq('id', id);
//     if (!error) fetchExportList();
//   };

//   const clearExportList = async () => {
//     const { error } = await supabase.from('export_items').delete().neq('id', 0); 
//     if (!error) setExportList([]);
//   };

//   return (
//     <ExportContext.Provider value={{ exportList, addToExportList, removeFromExportList, clearExportList }}>
//       {children}
//     </ExportContext.Provider>
//   );
// };



///============================================================================================================
import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from './supabaseClient';
import { useAuth } from './AuthProvider'; 

const ExportContext = createContext();

export const useExportList = () => useContext(ExportContext);

export const ExportProvider = ({ children }) => {
  const { user } = useAuth(); 
  const [exportList, setExportList] = useState([]);

  useEffect(() => {
    if (user) fetchExportList();
    else setExportList([]); 
  }, [user]);

  const fetchExportList = async () => {
    const { data } = await supabase
        .from('export_items')
        .select('*')
        .order('created_at', { ascending: false });
    setExportList(data || []);
  };

  // --- 1. TAMBAH ITEM (INSERT) ---
  const addToExportList = async (product) => {
    if (!user) return alert("Harus login dulu!");

    const newItem = {
        user_id: user.id,
        sku: product.sku,
        item_name: product.item_name,
        category: product.category,
        brand_name: product.brand_name || '-', 
        variant_name: product.variant_name || '',
        
        // SIMPAN KEDUA HARGA
        price: parseFloat(product.price) || 0, // Harga Normal
        wholesale_price: parseFloat(product.wholesale_price) || 0, // Harga Grosir
        
        qty: 1
    };

    const { error } = await supabase.from('export_items').insert([newItem]);
    
    if (error) {
        console.error("Error adding to export:", error);
        alert("Gagal simpan: " + error.message);
    } else {
        fetchExportList(); 
    }
  };

  // --- 2. UPDATE ITEM (BARU DITAMBAHKAN) ---
  // Fungsi ini dipanggil jika User memilih "Update Harga" di ScanPage
  const updateExportItem = async (updatedProduct) => {
    if (!user) return;

    const { error } = await supabase
        .from('export_items')
        .update({
            price: parseFloat(updatedProduct.price) || 0,
            wholesale_price: parseFloat(updatedProduct.wholesale_price) || 0,
            // Kita update juga namanya jaga-jaga ada revisi nama di master
            item_name: updatedProduct.item_name,
        })
        .eq('sku', updatedProduct.sku) // Cari berdasarkan SKU
        .eq('user_id', user.id);       // Pastikan punya user sendiri

    if (error) {
        console.error("Error updating export item:", error);
        alert("Gagal update: " + error.message);
    } else {
        // Refresh data agar tampilan terupdate
        fetchExportList();
    }
  };

  // --- 3. HAPUS ITEM (DELETE) ---
  const removeFromExportList = async (id) => { 
    const { error } = await supabase.from('export_items').delete().eq('id', id);
    if (!error) fetchExportList();
  };

  // --- 4. BERSIHKAN LIST (DELETE ALL) ---
  const clearExportList = async () => {
    const { error } = await supabase.from('export_items').delete().eq('user_id', user.id); 
    if (!error) setExportList([]);
  };

  return (
    <ExportContext.Provider value={{ 
        exportList, 
        addToExportList, 
        updateExportItem, // <--- JANGAN LUPA DIBUKA DI SINI
        removeFromExportList, 
        clearExportList 
    }}>
      {children}
    </ExportContext.Provider>
  );
};