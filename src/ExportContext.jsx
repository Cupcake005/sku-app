
// ///============================================================================================================
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

//   // --- 1. TAMBAH ITEM (INSERT) ---
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

//   // --- 2. UPDATE ITEM (BARU DITAMBAHKAN) ---
//   // Fungsi ini dipanggil jika User memilih "Update Harga" di ScanPage
//   const updateExportItem = async (updatedProduct) => {
//     if (!user) return;

//     const { error } = await supabase
//         .from('export_items')
//         .update({
//             price: parseFloat(updatedProduct.price) || 0,
//             wholesale_price: parseFloat(updatedProduct.wholesale_price) || 0,
//             // Kita update juga namanya jaga-jaga ada revisi nama di master
//             item_name: updatedProduct.item_name,
//         })
//         .eq('sku', updatedProduct.sku) // Cari berdasarkan SKU
//         .eq('user_id', user.id);       // Pastikan punya user sendiri

//     if (error) {
//         console.error("Error updating export item:", error);
//         alert("Gagal update: " + error.message);
//     } else {
//         // Refresh data agar tampilan terupdate
//         fetchExportList();
//     }
//   };

//   // --- 3. HAPUS ITEM (DELETE) ---
//   const removeFromExportList = async (id) => { 
//     const { error } = await supabase.from('export_items').delete().eq('id', id);
//     if (!error) fetchExportList();
//   };

//   // --- 4. BERSIHKAN LIST (DELETE ALL) ---
//   const clearExportList = async () => {
//     const { error } = await supabase.from('export_items').delete().eq('user_id', user.id); 
//     if (!error) setExportList([]);
//   };

//   return (
//     <ExportContext.Provider value={{ 
//         exportList, 
//         addToExportList, 
//         updateExportItem, // <--- JANGAN LUPA DIBUKA DI SINI
//         removeFromExportList, 
//         clearExportList 
//     }}>
//       {children}
//     </ExportContext.Provider>
//   );
// };


///============================================================
import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from './supabaseClient';
import { useAuth } from './AuthProvider'; 

const ExportContext = createContext();

export const useExportList = () => useContext(ExportContext);

export const ExportProvider = ({ children }) => {
  const { user } = useAuth(); 
  const [exportList, setExportList] = useState([]);

  // --- 1. FETCH DATA DENGAN LOOPING (FIX BATAS 1000 DATA) ---
  const fetchExportList = async () => {
    if (!user) return;

    try {
        let allData = [];
        let from = 0;
        const step = 1000; // Batas limit per request Supabase
        let more = true;

        while (more) {
            // Ambil data secara bertahap (0-999, 1000-1999, dst)
            const { data, error } = await supabase
                .from('export_items')
                .select('*')
                // Pastikan hanya ambil data milik user yang sedang login (keamanan)
                .eq('user_id', user.id) 
                .order('created_at', { ascending: false })
                .range(from, from + step - 1);

            if (error) throw error;

            if (data && data.length > 0) {
                allData = [...allData, ...data]; // Gabungkan data
                
                // Jika data yang diambil kurang dari step, berarti sudah habis
                if (data.length < step) {
                    more = false;
                } else {
                    from += step; // Lanjut ke halaman berikutnya
                }
            } else {
                more = false; // Tidak ada data
            }
        }

        setExportList(allData || []);
    } catch (error) {
        console.error("Error fetching export list:", error.message);
    }
  };

  // Panggil fetch saat user berubah/login
  useEffect(() => {
    if (user) fetchExportList();
    else setExportList([]); 
  }, [user]);

  // --- 2. TAMBAH ITEM (INSERT) ---
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

  // --- 3. UPDATE ITEM (BARU DITAMBAHKAN) ---
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

  // --- 4. HAPUS ITEM (DELETE) ---
  const removeFromExportList = async (id) => { 
    const { error } = await supabase.from('export_items').delete().eq('id', id);
    if (!error) fetchExportList();
  };

  // --- 5. BERSIHKAN LIST (DELETE ALL) ---
  const clearExportList = async () => {
    const { error } = await supabase.from('export_items').delete().eq('user_id', user.id); 
    if (!error) setExportList([]);
  };

  return (
    <ExportContext.Provider value={{ 
        exportList, 
        fetchExportList, // Expose fungsi fetch agar bisa dipanggil manual jika perlu
        addToExportList, 
        updateExportItem, 
        removeFromExportList, 
        clearExportList 
    }}>
      {children}
    </ExportContext.Provider>
  );
};