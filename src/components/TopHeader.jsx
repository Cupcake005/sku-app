// import React from 'react';
// import { useAuth } from '../AuthProvider';
// import { LogOut, UserCircle } from 'lucide-react';

// const TopHeader = () => {
//   const { user, logout } = useAuth();

//   // Ambil nama dari metadata, atau pakai email jika nama kosong
//   const displayName = user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'User';

//   const handleLogout = async () => {
//       if(window.confirm("Yakin ingin keluar akun?")) {
//           await logout();
//       }
//   }

//   return (
//     <div className="bg-blue-600 p-4 text-white shadow-md sticky top-0 z-50">
//       <div className="flex justify-between items-center">
        
//         {/* Info User */}
//         <div className="flex items-center gap-3">
//             <div className="bg-white/20 p-2 rounded-full backdrop-blur-sm">
//                 <UserCircle size={24} className="text-white" />
                
//             </div>
//             <div>
//                 <p className="text-[10px] text-blue-200 uppercase tracking-wider font-bold">Halo, Admin</p>
//                 <p className="text-sm font-bold truncate max-w-[150px] leading-tight capitalize">
//                     {displayName}
//                 </p>
//             </div>
//         </div>

//         {/* Tombol Logout */}
//         {/* <button 
//             onClick={handleLogout}
//             className="bg-red-500 hover:bg-red-600 p-2 rounded-lg transition shadow-lg flex items-center gap-2 text-xs font-bold border border-red-400"
//         >
//             <LogOut size={16} /> Keluar
//         </button> */}

//       </div>
//     </div>
//   );
// };

// export default TopHeader;

//=================================================================

import React, { useState } from 'react';
import { useAuth } from '../AuthProvider';
import { UserCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const TopHeader = () => {
  const { user } = useAuth(); // Kita hapus logout dari sini karena sudah pindah ke halaman akun
  const navigate = useNavigate();
  
  // State untuk handle jika gambar error/rusak
  const [imgError, setImgError] = useState(false);

  // Ambil nama dari metadata
  const displayName = user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'User';
  
  // Ambil link foto dari metadata
  const photoUrl = user?.user_metadata?.avatar_url;

  return (
    <div className="bg-blue-600 p-4 text-white shadow-md sticky top-0 z-50">
      <div className="flex justify-between items-center">
        
        {/* Info User (DIBUAT BISA DIKLIK) */}
        <div 
            onClick={() => navigate('/account')} 
            className="flex items-center gap-3 cursor-pointer hover:opacity-90 transition active:scale-95"
        >
            {/* Logika Avatar: Foto atau Icon */}
            <div className="bg-white/20 rounded-full backdrop-blur-sm flex items-center justify-center w-10 h-10 overflow-hidden border border-white/20">
                {photoUrl && !imgError ? (
                    <img 
                        src={photoUrl} 
                        alt="Profil" 
                        className="w-full h-full object-cover"
                        onError={() => setImgError(true)} // Jika gagal load, balik ke icon
                    />
                ) : (
                    <UserCircle size={24} className="text-white" />
                )}
            </div>
            
            {/* Teks Nama */}
            <div>
                <p className="text-[10px] text-blue-200 uppercase tracking-wider font-bold">Halo, Admin</p>
                <p className="text-sm font-bold truncate max-w-[150px] leading-tight capitalize">
                    {displayName}
                </p>
            </div>
        </div>

        {/* Bagian Kanan (Bisa diisi Nama Aplikasi atau Kosong) */}
        {/* <div className="text-xs font-bold bg-blue-700 px-2 py-1 rounded text-blue-200">
            StockApp
        </div> */}

      </div>
    </div>
  );
};

export default TopHeader;