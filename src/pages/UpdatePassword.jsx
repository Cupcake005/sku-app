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


import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { useNavigate } from 'react-router-dom';
import { Lock, KeyRound, AlertCircle, Eye, EyeOff } from 'lucide-react';
import NotificationModal from '../components/NotificationModal'; // IMPORT MODAL

const UpdatePassword = () => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [verifyingSession, setVerifyingSession] = useState(true); 
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // --- STATE MODAL ---
  const [modal, setModal] = useState({ isOpen: false, type: 'success', title: '', message: '' });

  const navigate = useNavigate();

  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) navigate('/login', { replace: true });
      else setVerifyingSession(false);
    };
    checkSession();
  }, [navigate]);

  const handleUpdate = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (password.length < 6) return setErrorMsg("Password harus memiliki minimal 6 karakter.");
    if (password !== confirmPassword) return setErrorMsg("Konfirmasi password tidak cocok.");

    setLoading(true);
    const { error } = await supabase.auth.updateUser({ password: password });
    setLoading(false);

    if (error) {
      setErrorMsg(error.message);
    } else {
      // Tampilkan Modal Sukses
      setModal({
          isOpen: true,
          type: 'success',
          title: 'Berhasil!',
          message: 'Password Anda telah diperbarui. Silakan login kembali.'
      });
    }
  };

  const handleCloseModal = () => {
      setModal({ ...modal, isOpen: false });
      navigate('/login'); // Pindah halaman setelah tutup modal
  };

  if (verifyingSession) return <div className="min-h-screen flex items-center justify-center bg-gray-100"><p className="text-gray-500 font-bold animate-pulse">Memeriksa izin akses...</p></div>;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-600 to-indigo-800 p-4 font-sans">
      
      {/* RENDER MODAL */}
      <NotificationModal 
        isOpen={modal.isOpen} 
        onClose={handleCloseModal} 
        type={modal.type} 
        title={modal.title} 
        message={modal.message} 
      />

      <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden p-8 animate-fade-in-up">
        <div className="text-center mb-8">
          <img src="/logo.png" alt="App Logo" className="w-24 h-24 mx-auto mb-4 drop-shadow-lg object-contain" />
          <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight">Reset Password</h2>
          <p className="text-gray-500 text-sm mt-3 leading-relaxed">Amankan akun Anda. Masukkan password baru dan konfirmasi di bawah ini.</p>
        </div>

        {errorMsg && (
            <div className="mb-6 bg-red-50 border-l-4 border-red-500 text-red-700 p-4 rounded-md flex items-start gap-3 text-sm animate-pulse">
                <AlertCircle size={20} className="mt-0.5 shrink-0" />
                <p>{errorMsg}</p>
            </div>
        )}

        <form onSubmit={handleUpdate} className="space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-bold text-gray-700 block pl-1">Password Baru</label>
            <div className="relative group">
                <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 group-focus-within:text-blue-500 transition" size={20} />
                <input type={showPassword ? "text" : "password"} required className="w-full pl-12 pr-12 py-3.5 border-2 border-gray-200 rounded-xl outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all bg-gray-50 focus:bg-white font-medium" placeholder="Minimal 6 karakter" value={password} onChange={(e) => setPassword(e.target.value)} />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-blue-600 transition focus:outline-none">{showPassword ? <EyeOff size={20} /> : <Eye size={20} />}</button>
            </div>
          </div>

          <div className="space-y-2">
             <label className="text-sm font-bold text-gray-700 block pl-1">Konfirmasi Password</label>
             <div className="relative group">
                <KeyRound className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 group-focus-within:text-blue-500 transition" size={20} />
                <input type={showConfirmPassword ? "text" : "password"} required className="w-full pl-12 pr-12 py-3.5 border-2 border-gray-200 rounded-xl outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all bg-gray-50 focus:bg-white font-medium" placeholder="Ketik ulang password baru" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} />
                <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-blue-600 transition focus:outline-none">{showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}</button>
            </div>
          </div>
          
          <button type="submit" disabled={loading} className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-4 rounded-xl font-bold text-lg shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 flex justify-center items-center gap-2 mt-8 disabled:opacity-70 disabled:cursor-not-allowed">
            {loading ? 'Menyimpan...' : 'Simpan Password Baru'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default UpdatePassword;