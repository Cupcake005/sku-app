// import React, { useState } from 'react';
// import { supabase } from '../supabaseClient';
// import { useNavigate } from 'react-router-dom';

// const UpdatePassword = () => {
//   const [password, setPassword] = useState('');
//   const [loading, setLoading] = useState(false);
//   const navigate = useNavigate();

//   const handleUpdate = async (e) => {
//     e.preventDefault();
//     setLoading(true);

//     const { error } = await supabase.auth.updateUser({ 
//       password: password 
//     });

//     if (error) {
//       alert("Gagal: " + error.message);
//     } else {
//       alert("✅ Password berhasil diubah! Silakan login.");
//       navigate('/login'); // Arahkan kembali ke login
//     }
//     setLoading(false);
//   };

//   return (
//     <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
//       <div className="bg-white p-8 rounded-xl shadow-md w-full max-w-sm">
//         <h2 className="text-2xl font-bold text-center mb-6 text-gray-800">Buat Password Baru</h2>
//         <form onSubmit={handleUpdate} className="space-y-4">
//           <div>
//             <label className="block text-sm font-medium text-gray-700 mb-1">Password Baru</label>
//             <input
//               type="password"
//               required
//               className="w-full border px-3 py-2 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
//               placeholder="Minimal 6 karakter"
//               value={password}
//               onChange={(e) => setPassword(e.target.value)}
//             />
//           </div>
//           <button
//             type="submit"
//             disabled={loading}
//             className="w-full bg-blue-600 text-white py-2 rounded-lg font-bold hover:bg-blue-700 transition"
//           >
//             {loading ? 'Memproses...' : 'Update Password'}
//           </button>
//         </form>
//       </div>
//     </div>
//   );
// };

// // --- PASTIKAN BARIS INI ADA ---
// export default UpdatePassword;


//========================================================================================================

import React, { useState } from 'react';
import { supabase } from '../supabaseClient';
import { useNavigate } from 'react-router-dom';
import { Lock, KeyRound, CheckCircle, AlertCircle } from 'lucide-react'; // Import ikon

const UpdatePassword = () => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState(''); // State untuk konfirmasi password
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState(''); // State untuk pesan error validasi
  const navigate = useNavigate();

  const handleUpdate = async (e) => {
    e.preventDefault();
    setErrorMsg(''); // Reset pesan error

    // --- VALIDASI ---
    if (password.length < 6) {
        setErrorMsg("Password harus memiliki minimal 6 karakter.");
        return;
    }

    if (password !== confirmPassword) {
        setErrorMsg("Konfirmasi password tidak cocok dengan password baru.");
        return;
    }
    // ----------------

    setLoading(true);

    const { error } = await supabase.auth.updateUser({ 
      password: password 
    });

    setLoading(false);

    if (error) {
      setErrorMsg(error.message);
    } else {
      // Tampilkan alert sukses atau gunakan modal yang lebih bagus
      alert("✅ Sukses! Password Anda telah diperbarui. Silakan login dengan password baru.");
      navigate('/login'); 
    }
  };

  return (
    // Container utama dengan background gradient
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-600 to-indigo-800 p-4 font-sans">
      {/* Card Form */}
      <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden p-8 animate-fade-in-up">
        
        {/* --- HEADER & LOGO --- */}
        <div className="text-center mb-8">
          {/* GANTI '/logo.png' dengan path logo Anda yang sebenarnya di folder public */}
          <img src="/logo.png" alt="App Logo" className="w-24 h-24 mx-auto mb-4 drop-shadow-lg object-contain animate-bounce-slow" />
          <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight">Reset Password</h2>
          <p className="text-gray-500 text-sm mt-3 leading-relaxed">
            Amankan akun Anda. Masukkan password baru dan konfirmasi di bawah ini.
          </p>
        </div>

        {/* --- PESAN ERROR VALIDASI --- */}
        {errorMsg && (
            <div className="mb-6 bg-red-50 border-l-4 border-red-500 text-red-700 p-4 rounded-md flex items-start gap-3 text-sm animate-pulse">
                <AlertCircle size={20} className="mt-0.5 shrink-0" />
                <p>{errorMsg}</p>
            </div>
        )}

        <form onSubmit={handleUpdate} className="space-y-6">
          
          {/* INPUT 1: Password Baru */}
          <div className="space-y-2">
            <label className="text-sm font-bold text-gray-700 block pl-1">Password Baru</label>
            <div className="relative group">
                <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 group-focus-within:text-blue-500 transition" size={20} />
                <input
                  type="password"
                  required
                  className="w-full pl-12 pr-4 py-3.5 border-2 border-gray-200 rounded-xl outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all bg-gray-50 focus:bg-white font-medium"
                  placeholder="Minimal 6 karakter"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
            </div>
          </div>

          {/* INPUT 2: Konfirmasi Password */}
          <div className="space-y-2">
             <label className="text-sm font-bold text-gray-700 block pl-1">Konfirmasi Password</label>
             <div className="relative group">
                <KeyRound className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 group-focus-within:text-blue-500 transition" size={20} />
                <input
                  type="password"
                  required
                  className="w-full pl-12 pr-4 py-3.5 border-2 border-gray-200 rounded-xl outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all bg-gray-50 focus:bg-white font-medium"
                  placeholder="Ketik ulang password baru"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
            </div>
             {/* Indikator Cocok/Tidak (Opsional visual feedback) */}
             {confirmPassword && password && (
                 <div className={`text-xs flex items-center gap-1 mt-1 pl-1 ${password === confirmPassword ? 'text-green-600' : 'text-red-500'}`}>
                     {password === confirmPassword ? (
                        <><CheckCircle size={14} /> Password cocok</>
                     ) : (
                        <>Password belum cocok</>
                     )}
                 </div>
             )}
          </div>
          
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-4 rounded-xl font-bold text-lg shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 flex justify-center items-center gap-2 mt-8 disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {loading ? (
                <span className="flex items-center gap-2">
                    <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Menyimpan...
                </span>
            ) : (
                'Simpan Password Baru'
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default UpdatePassword;