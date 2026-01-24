import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { useAuth } from '../AuthProvider'; // Pastikan path benar
import { useNavigate } from 'react-router-dom';
import { User, Phone, Lock, Save, LogOut, ArrowLeft, Camera, Loader } from 'lucide-react';
import NotificationModal from '../components/NotificationModal';

const AccountPage = () => {
  const { user } = useAuth(); // Kita tidak perlu destructure signOut dari sini untuk menghindari error jika tidak ada
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false); 

  // State Form Profil
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [avatarUrl, setAvatarUrl] = useState(null); 

  // State Form Password
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [notify, setNotify] = useState({ isOpen: false, type: 'success', title: '', message: '' });

  // Load data awal
  useEffect(() => {
    if (user && user.user_metadata) {
      setFullName(user.user_metadata.full_name || '');
      setPhone(user.user_metadata.phone || '');
      setAvatarUrl(user.user_metadata.avatar_url || null);
    }
  }, [user]);

  // --- FUNGSI LOGOUT YANG DIPERBAIKI ---
  const handleLogout = async () => {
      const confirmLogout = window.confirm("Apakah Anda yakin ingin keluar?");
      if (!confirmLogout) return;

      try {
          // 1. Logout dari Supabase
          await supabase.auth.signOut();
          
          // 2. Bersihkan Local Storage (Opsional tapi bagus agar bersih)
          localStorage.clear();
          
          // 3. Paksa pindah ke halaman Login
          navigate('/login', { replace: true });
          
          // 4. Reload halaman agar state AuthProvider bersih total
          window.location.reload(); 

      } catch (error) {
          console.error("Logout Error:", error);
          setNotify({ isOpen: true, type: 'error', title: 'Gagal', message: 'Gagal logout. Coba lagi.' });
      }
  };

  // --- FUNGSI UPLOAD FOTO ---
  const handleUploadAvatar = async (event) => {
    try {
      setUploading(true);

      if (!event.target.files || event.target.files.length === 0) {
        throw new Error('Pilih gambar dulu!');
      }

      const file = event.target.files[0];
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}/${Math.random()}.${fileExt}`;
      const filePath = `${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data } = supabase.storage.from('avatars').getPublicUrl(filePath);
      const publicUrl = data.publicUrl;

      const { error: updateUserError } = await supabase.auth.updateUser({
        data: { avatar_url: publicUrl }
      });

      if (updateUserError) throw updateUserError;

      setAvatarUrl(publicUrl);
      setNotify({ isOpen: true, type: 'success', title: 'Berhasil', message: 'Foto profil diperbarui!' });
      
      // Refresh halaman sebentar
      setTimeout(() => window.location.reload(), 1000);

    } catch (error) {
      setNotify({ isOpen: true, type: 'error', title: 'Gagal Upload', message: error.message });
    } finally {
      setUploading(false);
    }
  };

  // --- FUNGSI UPDATE DATA DIRI ---
  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({
        data: { full_name: fullName, phone: phone }
      });
      if (error) throw error;
      setNotify({ isOpen: true, type: 'success', title: 'Berhasil', message: 'Profil berhasil diperbarui!' });
    } catch (error) {
      setNotify({ isOpen: true, type: 'error', title: 'Gagal', message: error.message });
    } finally {
      setLoading(false);
    }
  };

  // --- FUNGSI GANTI PASSWORD ---
  const handleUpdatePassword = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) return setNotify({ isOpen: true, type: 'error', title: 'Error', message: 'Password tidak cocok.' });
    if (password.length < 6) return setNotify({ isOpen: true, type: 'error', title: 'Error', message: 'Minimal 6 karakter.' });

    setLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({ password: password });
      if (error) throw error;
      setNotify({ isOpen: true, type: 'success', title: 'Berhasil', message: 'Password berhasil diubah!' });
      setPassword(''); setConfirmPassword('');
    } catch (error) {
      setNotify({ isOpen: true, type: 'error', title: 'Gagal', message: error.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="pb-24">
      {/* Header Back */}
      <div className="bg-white p-4 sticky top-0 z-20 shadow-sm flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="p-2 rounded-full hover:bg-gray-100">
            <ArrowLeft size={24} />
        </button>
        <h1 className="text-xl font-bold text-gray-800">Akun Saya</h1>
      </div>

      <div className="p-4 space-y-6 max-w-md mx-auto">
        
        {/* --- AREA FOTO PROFIL --- */}
        <div className="flex flex-col items-center justify-center -mt-2">
            <div className="relative group">
                <div className="w-28 h-28 rounded-full border-4 border-white shadow-lg overflow-hidden bg-gray-100">
                    {uploading ? (
                        <div className="flex items-center justify-center h-full bg-gray-200">
                            <Loader className="animate-spin text-gray-500" size={30} />
                        </div>
                    ) : avatarUrl ? (
                        <img src={avatarUrl} alt="Profil" className="w-full h-full object-cover" />
                    ) : (
                        <div className="flex items-center justify-center h-full bg-blue-50 text-blue-300">
                            <User size={50} />
                        </div>
                    )}
                </div>
                
                <label 
                    htmlFor="avatar-upload" 
                    className="absolute bottom-0 right-0 bg-blue-600 text-white p-2 rounded-full shadow-md cursor-pointer hover:bg-blue-700 transition transform hover:scale-110"
                >
                    <Camera size={18} />
                </label>
                <input 
                    type="file" 
                    id="avatar-upload" 
                    accept="image/*" 
                    onChange={handleUploadAvatar} 
                    disabled={uploading}
                    className="hidden" 
                />
            </div>
            <p className="text-xs text-gray-400 mt-2">Ketuk kamera untuk ganti foto</p>
        </div>

        {/* --- FORM DATA DIRI --- */}
        <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100">
            <h3 className="font-bold text-gray-700 mb-4 flex items-center gap-2">
                <User size={20} className="text-blue-600"/> Data Diri
            </h3>
            <form onSubmit={handleUpdateProfile} className="space-y-4">
                <div>
                    <label className="text-xs font-bold text-gray-500">Nama Lengkap</label>
                    <input 
                        type="text" 
                        className="w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        placeholder="Nama Anda"
                    />
                </div>
                <div>
                    <label className="text-xs font-bold text-gray-500">Nomor HP</label>
                    <input 
                        type="tel" 
                        className="w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="08..."
                    />
                </div>
                <button disabled={loading} className="w-full bg-blue-600 text-white font-bold py-2.5 rounded-lg hover:bg-blue-700 transition flex justify-center items-center gap-2">
                    <Save size={18} /> {loading ? 'Menyimpan...' : 'Simpan Profil'}
                </button>
            </form>
        </div>

        {/* --- FORM GANTI PASSWORD --- */}
        <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100">
            <h3 className="font-bold text-gray-700 mb-4 flex items-center gap-2">
                <Lock size={20} className="text-orange-600"/> Ganti Password
            </h3>
            <form onSubmit={handleUpdatePassword} className="space-y-4">
                <div>
                    <label className="text-xs font-bold text-gray-500">Password Baru</label>
                    <input 
                        type="password" 
                        className="w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-orange-500 outline-none"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Minimal 6 karakter"
                    />
                </div>
                <div>
                    <label className="text-xs font-bold text-gray-500">Konfirmasi Password</label>
                    <input 
                        type="password" 
                        className="w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-orange-500 outline-none"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="Ulangi password"
                    />
                </div>
                <button disabled={loading} className="w-full bg-orange-600 text-white font-bold py-2.5 rounded-lg hover:bg-orange-700 transition flex justify-center items-center gap-2">
                    <Lock size={18} /> {loading ? 'Memproses...' : 'Ubah Password'}
                </button>
            </form>
        </div>

        {/* --- TOMBOL LOGOUT --- */}
        <button 
            onClick={handleLogout}
            className="w-full bg-red-50 text-red-600 font-bold py-3 rounded-xl border border-red-100 hover:bg-red-100 transition flex items-center justify-center gap-2"
        >
            <LogOut size={20} /> Keluar Aplikasi
        </button>

      </div>

      <NotificationModal 
        isOpen={notify.isOpen} 
        onClose={() => setNotify({...notify, isOpen: false})} 
        type={notify.type} 
        title={notify.title} 
        message={notify.message} 
      />
    </div>
  );
};

export default AccountPage;