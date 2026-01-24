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
//         <button 
//             onClick={handleLogout}
//             className="bg-red-500 hover:bg-red-600 p-2 rounded-lg transition shadow-lg flex items-center gap-2 text-xs font-bold border border-red-400"
//         >
//             <LogOut size={16} /> Keluar
//         </button>

//       </div>
//     </div>
//   );
// };

// export default TopHeader;


import React from 'react';
import { useNavigate } from 'react-router-dom';
import { UserCircle } from 'lucide-react'; // Ikon Profil
import { useAuth } from '../AuthProvider'; // Ambil data user untuk nampilin nama (opsional)

const TopHeader = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  // Ambil nama depan dari metadata, atau default 'User'
  const displayName = user?.user_metadata?.full_name?.split(' ')[0] || 'User';

  return (
    <div className="bg-white px-4 py-3 shadow-sm sticky top-0 z-30 flex justify-between items-center">
      {/* Kiri: Logo / Nama App */}
      <div className="flex items-center gap-2">
        <div className="bg-blue-600 text-white font-bold w-8 h-8 rounded-lg flex items-center justify-center text-sm shadow-md">
          SA
        </div>
        <h1 className="font-bold text-gray-800 text-lg tracking-tight">StockApp</h1>
      </div>

      {/* Kanan: Profil Icon */}
      <button 
        onClick={() => navigate('/account')} 
        className="flex items-center gap-2 bg-gray-50 hover:bg-gray-100 py-1.5 px-3 rounded-full border border-gray-200 transition active:scale-95"
      >
        <span className="text-xs font-semibold text-gray-600">Hai, {displayName}</span>
        <UserCircle size={24} className="text-blue-600" />
      </button>
    </div>
  );
};

export default TopHeader;