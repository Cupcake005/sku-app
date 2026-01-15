//==================================================================


// import React, { useState, useEffect } from 'react';
// import { useAuth } from '../AuthProvider';
// import { useNavigate } from 'react-router-dom';
// import { Mail, Lock, ShieldCheck, ArrowRight, ArrowLeft, Eye, EyeOff, User, Send } from 'lucide-react';

// const LoginPage = () => {
//   const { login, register, verifyOtp, sendPasswordReset } = useAuth();
//   const navigate = useNavigate();

//   // State Form
//   const [email, setEmail] = useState('');
//   const [password, setPassword] = useState('');
//   const [name, setName] = useState(''); 
//   const [otp, setOtp] = useState('');
  
//   // State UI
//   const [loading, setLoading] = useState(false);
//   const [view, setView] = useState('login'); 
//   const [showPassword, setShowPassword] = useState(false);

//   // --- PERBAIKAN 1: PAKSA RESET SAAT HALAMAN DIBUKA ---
//   // Ini berguna saat User Logout dan kembali ke halaman ini, form dipastikan bersih.
//   useEffect(() => {
//     setEmail('');
//     setPassword('');
//     setOtp('');
//     setName('');
//   }, []); // [] artinya jalan sekali saat komponen dimuat (mount)

//   // --- ACTIONS ---
//   const handleLogin = async (e) => {
//     e.preventDefault();
//     setLoading(true);
//     try {
//         await login(email, password);
        
//         // Kosongkan state sebelum pindah (Opsional, karena useEffect di atas sudah handle saat balik lagi)
//         setEmail('');
//         setPassword('');

//         navigate('/'); 
//     } catch (error) {
//         alert("Gagal Login: " + error.message);
//         setPassword(''); 
//     } finally {
//         setLoading(false);
//     }
//   };

//   const handleRegister = async (e) => {
//     e.preventDefault();
//     setLoading(true);
//     try {
//         await register(email, password, name);
//         setView('otp');
//         alert(`Halo ${name}, kode OTP telah dikirim ke email Anda.`);
//     } catch (error) {
//         alert("Gagal Daftar: " + error.message);
//     } finally {
//         setLoading(false);
//     }
//   };

//   const handleVerify = async (e) => {
//     e.preventDefault();
//     setLoading(true);
//     try {
//         await verifyOtp(email, otp);
//         alert("Verifikasi Berhasil! Anda telah login.");
//         setOtp('');
//         navigate('/'); 
//     } catch (error) {
//         alert("Kode Salah: " + error.message);
//     } finally {
//         setLoading(false);
//     }
//   };

//   const handleForgot = async (e) => {
//       e.preventDefault();
//       setLoading(true);
//       try {
//           await sendPasswordReset(email);
//           alert("Link reset password telah dikirim ke email. Cek Inbox/Spam.");
//           setEmail('');
//           setView('login');
//       } catch (error) {
//           alert("Gagal kirim link: " + error.message);
//       } finally {
//           setLoading(false);
//       }
//   };

//   return (
//     <div className="min-h-screen flex items-center justify-center bg-blue-600 p-4 font-sans">
//       <div className="bg-white p-8 rounded-2xl shadow-2xl w-full max-w-sm animate-fade-in-down relative overflow-hidden">
        
//         {/* Dekorasi Background */}
//         <div className="absolute -top-10 -right-10 w-32 h-32 bg-blue-100 rounded-full opacity-50 pointer-events-none"></div>
//         <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-indigo-100 rounded-full opacity-50 pointer-events-none"></div>

//         {/* Header Logo */}
//         <div className="text-center mb-8 relative z-10">
//             <img src="/logo.png" className="w-20 mx-auto mb-4 drop-shadow-md" alt="Logo" />
//             <h1 className="text-2xl font-bold text-gray-800 tracking-tight">
//                 {view === 'login' && 'Selamat Datang'}
//                 {view === 'register' && 'Buat Akun Baru'}
//                 {view === 'otp' && 'Verifikasi Email'}
//                 {view === 'forgot' && 'Reset Password'}
//             </h1>
//             <p className="text-sm text-gray-500 mt-1">
//                 {view === 'login' && 'Masuk untuk kelola stok toko'}
//                 {view === 'register' && 'Mulai kelola inventaris Anda'}
//                 {view === 'otp' && `Kode dikirim ke: ${email}`}
//                 {view === 'forgot' && 'Masukkan email terdaftar'}
//             </p>
//         </div>

//         {/* --- FORM LOGIN --- */}
//         {view === 'login' && (
//             // PERBAIKAN 2: Tambah autoComplete="off" di form
//             <form onSubmit={handleLogin} className="space-y-4 relative z-10" autoComplete="off">
//                 <div className="relative">
//                     <Mail className="absolute left-3 top-3 text-gray-400" size={20} />
//                     <input 
//                         type="email" required placeholder="Email Anda"
//                         className="w-full pl-10 pr-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 outline-none bg-gray-50"
//                         value={email} onChange={e => setEmail(e.target.value)}
//                         // PERBAIKAN 3: Matikan autocomplete email
//                         autoComplete="off"
//                         name="email_login_no_autofill" 
//                     />
//                 </div>
                
//                 <div className="relative">
//                     <Lock className="absolute left-3 top-3 text-gray-400" size={20} />
//                     <input 
//                         type={showPassword ? "text" : "password"}
//                         required placeholder="Password"
//                         className="w-full pl-10 pr-12 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 outline-none bg-gray-50"
//                         value={password} onChange={e => setPassword(e.target.value)}
//                         // PERBAIKAN 4: Trik 'new-password' agar browser bingung dan tidak isi password lama
//                         autoComplete="new-password"
//                         name="password_login_no_autofill"
//                     />
//                     <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-3 text-gray-400 hover:text-blue-600 transition">
//                         {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
//                     </button>
//                 </div>

//                 <div className="text-right">
//                     <button type="button" onClick={() => setView('forgot')} className="text-xs font-bold text-blue-600 hover:underline">
//                         Lupa Password?
//                     </button>
//                 </div>
                
//                 <button disabled={loading} className="w-full bg-blue-600 text-white font-bold py-3 rounded-xl hover:bg-blue-700 transition flex justify-center items-center gap-2 shadow-lg shadow-blue-200">
//                     {loading ? 'Memuat...' : <>Masuk Aplikasi <ArrowRight size={20} /></>}
//                 </button>

//                 <p className="text-center text-sm text-gray-600 mt-4">
//                     Belum punya akun? <button type="button" onClick={() => { setView('register'); setShowPassword(false); }} className="text-blue-600 font-bold hover:underline">Daftar Sekarang</button>
//                 </p>
//             </form>
//         )}

//         {/* --- FORM REGISTER --- */}
//         {view === 'register' && (
//             <form onSubmit={handleRegister} className="space-y-4 relative z-10" autoComplete="off">
//                  <div className="relative">
//                     <User className="absolute left-3 top-3 text-gray-400" size={20} />
//                     <input 
//                         type="text" required placeholder="Nama Lengkap"
//                         className="w-full pl-10 pr-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 outline-none bg-gray-50 capitalize"
//                         value={name} onChange={e => setName(e.target.value)}
//                         autoComplete="off"
//                     />
//                 </div>

//                  <div className="relative">
//                     <Mail className="absolute left-3 top-3 text-gray-400" size={20} />
//                     <input 
//                         type="email" required placeholder="Email Baru"
//                         className="w-full pl-10 pr-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 outline-none bg-gray-50"
//                         value={email} onChange={e => setEmail(e.target.value)}
//                         autoComplete="off"
//                     />
//                 </div>
                
//                 <div className="relative">
//                     <Lock className="absolute left-3 top-3 text-gray-400" size={20} />
//                     <input 
//                         type={showPassword ? "text" : "password"}
//                         required minLength={6} placeholder="Buat Password"
//                         className="w-full pl-10 pr-12 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 outline-none bg-gray-50"
//                         value={password} onChange={e => setPassword(e.target.value)}
//                         autoComplete="new-password"
//                     />
//                     <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-3 text-gray-400 hover:text-blue-600 transition">
//                         {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
//                     </button>
//                 </div>

//                 <button disabled={loading} className="w-full bg-indigo-600 text-white font-bold py-3 rounded-xl hover:bg-indigo-700 transition flex justify-center items-center gap-2 shadow-lg shadow-indigo-200">
//                     {loading ? 'Mendaftarkan...' : <>Kirim Kode OTP <ArrowRight size={20} /></>}
//                 </button>

//                 <button type="button" onClick={() => { setView('login'); setShowPassword(false); }} className="w-full text-gray-500 text-sm mt-2 hover:text-gray-800 flex items-center justify-center gap-1">
//                     <ArrowLeft size={16}/> Kembali ke Login
//                 </button>
//             </form>
//         )}

//         {/* --- FORM FORGOT PASSWORD --- */}
//         {view === 'forgot' && (
//             <form onSubmit={handleForgot} className="space-y-4 relative z-10" autoComplete="off">
//                  <div className="relative">
//                     <Mail className="absolute left-3 top-3 text-gray-400" size={20} />
//                     <input 
//                         type="email" required placeholder="Email Terdaftar"
//                         className="w-full pl-10 pr-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 outline-none bg-gray-50"
//                         value={email} onChange={e => setEmail(e.target.value)}
//                         autoComplete="off"
//                     />
//                 </div>

//                 <button disabled={loading} className="w-full bg-orange-500 text-white font-bold py-3 rounded-xl hover:bg-orange-600 transition flex justify-center items-center gap-2 shadow-lg shadow-orange-200">
//                     {loading ? 'Mengirim...' : <>Kirim Link Reset <Send size={18} /></>}
//                 </button>

//                 <button type="button" onClick={() => setView('login')} className="w-full text-gray-500 text-sm mt-2 hover:text-gray-800 flex items-center justify-center gap-1">
//                     <ArrowLeft size={16}/> Batal, Kembali Login
//                 </button>
//             </form>
//         )}

//         {/* --- FORM OTP --- */}
//         {view === 'otp' && (
//             <form onSubmit={handleVerify} className="space-y-4 relative z-10" autoComplete="off">
//                 <div className="relative">
//                     <ShieldCheck className="absolute left-3 top-3 text-green-500" size={20} />
//                     <input 
//                         type="text" required placeholder="Kode OTP (Cek Email)"
//                         className="w-full pl-10 pr-4 py-3 border-2 border-green-100 rounded-xl focus:ring-2 focus:ring-green-500 outline-none bg-green-50 text-lg font-bold tracking-widest text-center text-green-800"
//                         value={otp} onChange={e => setOtp(e.target.value)}
//                         autoComplete="off"
//                     />
//                 </div>

//                 <button disabled={loading} className="w-full bg-green-600 text-white font-bold py-3 rounded-xl hover:bg-green-700 transition flex justify-center items-center gap-2 shadow-lg shadow-green-200">
//                     {loading ? 'Memverifikasi...' : <>Konfirmasi OTP <ShieldCheck size={20} /></>}
//                 </button>

//                 <div className="text-center mt-4 space-y-2">
//                     <p className="text-xs text-gray-500">Salah email?</p>
//                     <button type="button" onClick={() => setView('register')} className="text-sm text-red-500 font-bold hover:underline">
//                         Ulangi Pendaftaran
//                     </button>
//                 </div>
//             </form>
//         )}

//       </div>
//     </div>
//   );
// };

// export default LoginPage;


//==========================================================================================================================

import React, { useState, useEffect } from 'react';
import { useAuth } from '../AuthProvider';
import { useNavigate } from 'react-router-dom';
import { Mail, Lock, ShieldCheck, ArrowRight, ArrowLeft, Eye, EyeOff, User, Send } from 'lucide-react';
import NotificationModal from '../components/NotificationModal'; // IMPORT MODAL

const LoginPage = () => {
  const { login, register, verifyOtp, sendPasswordReset } = useAuth();
  const navigate = useNavigate();

  // State Form
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState(''); 
  const [otp, setOtp] = useState('');
  
  // State UI
  const [loading, setLoading] = useState(false);
  const [view, setView] = useState('login'); 
  const [showPassword, setShowPassword] = useState(false);

  // --- STATE NOTIFICATION MODAL ---
  const [modal, setModal] = useState({ 
    isOpen: false, 
    type: 'success', 
    title: '', 
    message: '',
    onCloseAction: null // Aksi setelah tombol OK diklik
  });

  // Fungsi Helper untuk Buka Modal
  const showModal = (type, title, message, action = null) => {
    setModal({ isOpen: true, type, title, message, onCloseAction: action });
  };

  const closeModal = () => {
    if (modal.onCloseAction) modal.onCloseAction(); // Jalankan aksi jika ada
    setModal({ ...modal, isOpen: false, onCloseAction: null });
  };

  useEffect(() => {
    setEmail(''); setPassword(''); setOtp(''); setName('');
  }, []); 

  // --- ACTIONS ---
  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
        await login(email, password);
        setEmail(''); setPassword('');
        navigate('/'); 
    } catch (error) {
        showModal('error', 'Gagal Login', error.message || 'Periksa email dan password Anda.');
        setPassword(''); 
    } finally {
        setLoading(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
        await register(email, password, name);
        setView('otp');
        showModal('success', 'Registrasi Berhasil', `Halo ${name}, kode OTP telah dikirim ke email Anda.`);
    } catch (error) {
        showModal('error', 'Gagal Daftar', error.message);
    } finally {
        setLoading(false);
    }
  };

  const handleVerify = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
        await verifyOtp(email, otp);
        // Tampilkan modal sukses, setelah diklik OK baru pindah halaman
        showModal('success', 'Verifikasi Berhasil', 'Selamat datang! Anda berhasil login.', () => {
            setOtp('');
            navigate('/');
        });
    } catch (error) {
        showModal('error', 'Kode Salah', error.message || 'Pastikan kode OTP sesuai.');
    } finally {
        setLoading(false);
    }
  };

  const handleForgot = async (e) => {
      e.preventDefault();
      setLoading(true);
      try {
          await sendPasswordReset(email);
          showModal('success', 'Link Terkirim', 'Link reset password telah dikirim ke email. Silakan cek Inbox/Spam.', () => {
             setEmail('');
             setView('login');
          });
      } catch (error) {
          showModal('error', 'Gagal Kirim Link', error.message);
      } finally {
          setLoading(false);
      }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-blue-600 p-4 font-sans">
      
      {/* RENDER MODAL */}
      <NotificationModal 
        isOpen={modal.isOpen} 
        onClose={closeModal} 
        type={modal.type} 
        title={modal.title} 
        message={modal.message} 
      />

      <div className="bg-white p-8 rounded-2xl shadow-2xl w-full max-w-sm animate-fade-in-down relative overflow-hidden">
        <div className="absolute -top-10 -right-10 w-32 h-32 bg-blue-100 rounded-full opacity-50 pointer-events-none"></div>
        <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-indigo-100 rounded-full opacity-50 pointer-events-none"></div>

        <div className="text-center mb-8 relative z-10">
            <img src="/logo.png" className="w-20 mx-auto mb-4 drop-shadow-md" alt="Logo" />
            <h1 className="text-2xl font-bold text-gray-800 tracking-tight">
                {view === 'login' && 'Selamat Datang'}
                {view === 'register' && 'Buat Akun Baru'}
                {view === 'otp' && 'Verifikasi Email'}
                {view === 'forgot' && 'Reset Password'}
            </h1>
            <p className="text-sm text-gray-500 mt-1">
                {view === 'login' && 'Masuk untuk kelola stok toko'}
                {view === 'register' && 'Mulai kelola inventaris Anda'}
                {view === 'otp' && `Kode dikirim ke: ${email}`}
                {view === 'forgot' && 'Masukkan email terdaftar'}
            </p>
        </div>

        {/* FORM LOGIN */}
        {view === 'login' && (
            <form onSubmit={handleLogin} className="space-y-4 relative z-10" autoComplete="off">
                <div className="relative">
                    <Mail className="absolute left-3 top-3 text-gray-400" size={20} />
                    <input type="email" required placeholder="Email Anda" className="w-full pl-10 pr-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 outline-none bg-gray-50" value={email} onChange={e => setEmail(e.target.value)} autoComplete="off" />
                </div>
                <div className="relative">
                    <Lock className="absolute left-3 top-3 text-gray-400" size={20} />
                    <input type={showPassword ? "text" : "password"} required placeholder="Password" className="w-full pl-10 pr-12 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 outline-none bg-gray-50" value={password} onChange={e => setPassword(e.target.value)} autoComplete="new-password" />
                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-3 text-gray-400 hover:text-blue-600 transition">{showPassword ? <EyeOff size={20} /> : <Eye size={20} />}</button>
                </div>
                <div className="text-right"><button type="button" onClick={() => setView('forgot')} className="text-xs font-bold text-blue-600 hover:underline">Lupa Password?</button></div>
                <button disabled={loading} className="w-full bg-blue-600 text-white font-bold py-3 rounded-xl hover:bg-blue-700 transition flex justify-center items-center gap-2 shadow-lg shadow-blue-200">{loading ? 'Memuat...' : <>Masuk Aplikasi <ArrowRight size={20} /></>}</button>
                <p className="text-center text-sm text-gray-600 mt-4">Belum punya akun? <button type="button" onClick={() => { setView('register'); setShowPassword(false); }} className="text-blue-600 font-bold hover:underline">Daftar Sekarang</button></p>
            </form>
        )}

        {/* FORM REGISTER */}
        {view === 'register' && (
            <form onSubmit={handleRegister} className="space-y-4 relative z-10" autoComplete="off">
                 <div className="relative"><User className="absolute left-3 top-3 text-gray-400" size={20} /><input type="text" required placeholder="Nama Lengkap" className="w-full pl-10 pr-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 outline-none bg-gray-50 capitalize" value={name} onChange={e => setName(e.target.value)} autoComplete="off" /></div>
                 <div className="relative"><Mail className="absolute left-3 top-3 text-gray-400" size={20} /><input type="email" required placeholder="Email Baru" className="w-full pl-10 pr-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 outline-none bg-gray-50" value={email} onChange={e => setEmail(e.target.value)} autoComplete="off" /></div>
                 <div className="relative"><Lock className="absolute left-3 top-3 text-gray-400" size={20} /><input type={showPassword ? "text" : "password"} required minLength={6} placeholder="Buat Password" className="w-full pl-10 pr-12 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 outline-none bg-gray-50" value={password} onChange={e => setPassword(e.target.value)} autoComplete="new-password" /><button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-3 text-gray-400 hover:text-blue-600 transition">{showPassword ? <EyeOff size={20} /> : <Eye size={20} />}</button></div>
                <button disabled={loading} className="w-full bg-indigo-600 text-white font-bold py-3 rounded-xl hover:bg-indigo-700 transition flex justify-center items-center gap-2 shadow-lg shadow-indigo-200">{loading ? 'Mendaftarkan...' : <>Kirim Kode OTP <ArrowRight size={20} /></>}</button>
                <button type="button" onClick={() => { setView('login'); setShowPassword(false); }} className="w-full text-gray-500 text-sm mt-2 hover:text-gray-800 flex items-center justify-center gap-1"><ArrowLeft size={16}/> Kembali ke Login</button>
            </form>
        )}

        {/* FORM FORGOT PASSWORD */}
        {view === 'forgot' && (
            <form onSubmit={handleForgot} className="space-y-4 relative z-10" autoComplete="off">
                 <div className="relative"><Mail className="absolute left-3 top-3 text-gray-400" size={20} /><input type="email" required placeholder="Email Terdaftar" className="w-full pl-10 pr-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 outline-none bg-gray-50" value={email} onChange={e => setEmail(e.target.value)} autoComplete="off" /></div>
                <button disabled={loading} className="w-full bg-orange-500 text-white font-bold py-3 rounded-xl hover:bg-orange-600 transition flex justify-center items-center gap-2 shadow-lg shadow-orange-200">{loading ? 'Mengirim...' : <>Kirim Link Reset <Send size={18} /></>}</button>
                <button type="button" onClick={() => setView('login')} className="w-full text-gray-500 text-sm mt-2 hover:text-gray-800 flex items-center justify-center gap-1"><ArrowLeft size={16}/> Batal, Kembali Login</button>
            </form>
        )}

        {/* FORM OTP */}
        {view === 'otp' && (
            <form onSubmit={handleVerify} className="space-y-4 relative z-10" autoComplete="off">
                <div className="relative"><ShieldCheck className="absolute left-3 top-3 text-green-500" size={20} /><input type="text" required placeholder="Kode OTP (Cek Email)" className="w-full pl-10 pr-4 py-3 border-2 border-green-100 rounded-xl focus:ring-2 focus:ring-green-500 outline-none bg-green-50 text-lg font-bold tracking-widest text-center text-green-800" value={otp} onChange={e => setOtp(e.target.value)} autoComplete="off" /></div>
                <button disabled={loading} className="w-full bg-green-600 text-white font-bold py-3 rounded-xl hover:bg-green-700 transition flex justify-center items-center gap-2 shadow-lg shadow-green-200">{loading ? 'Memverifikasi...' : <>Konfirmasi OTP <ShieldCheck size={20} /></>}</button>
                <div className="text-center mt-4 space-y-2"><p className="text-xs text-gray-500">Salah email?</p><button type="button" onClick={() => setView('register')} className="text-sm text-red-500 font-bold hover:underline">Ulangi Pendaftaran</button></div>
            </form>
        )}
      </div>
    </div>
  );
};

export default LoginPage;