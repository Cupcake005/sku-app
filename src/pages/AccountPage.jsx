// import React, { useState, useEffect } from 'react';
// import { supabase } from '../supabaseClient';
// import { useAuth } from '../AuthProvider'; // Pastikan path benar
// import { useNavigate } from 'react-router-dom';
// import { User, Phone, Lock, Save, LogOut, ArrowLeft, Camera, Loader } from 'lucide-react';
// import NotificationModal from '../components/NotificationModal';

// const AccountPage = () => {
//   const { user } = useAuth(); // Kita tidak perlu destructure signOut dari sini untuk menghindari error jika tidak ada
//   const navigate = useNavigate();
//   const [loading, setLoading] = useState(false);
//   const [uploading, setUploading] = useState(false); 

//   // State Form Profil
//   const [fullName, setFullName] = useState('');
//   const [phone, setPhone] = useState('');
//   const [avatarUrl, setAvatarUrl] = useState(null); 

//   // State Form Password
//   const [password, setPassword] = useState('');
//   const [confirmPassword, setConfirmPassword] = useState('');

//   const [notify, setNotify] = useState({ isOpen: false, type: 'success', title: '', message: '' });

//   // Load data awal
//   useEffect(() => {
//     if (user && user.user_metadata) {
//       setFullName(user.user_metadata.full_name || '');
//       setPhone(user.user_metadata.phone || '');
//       setAvatarUrl(user.user_metadata.avatar_url || null);
//     }
//   }, [user]);

//   // --- FUNGSI LOGOUT YANG DIPERBAIKI ---
//   const handleLogout = async () => {
//       const confirmLogout = window.confirm("Apakah Anda yakin ingin keluar?");
//       if (!confirmLogout) return;

//       try {
//           // 1. Logout dari Supabase
//           await supabase.auth.signOut();
          
//           // 2. Bersihkan Local Storage (Opsional tapi bagus agar bersih)
//           localStorage.clear();
          
//           // 3. Paksa pindah ke halaman Login
//           navigate('/login', { replace: true });
          
//           // 4. Reload halaman agar state AuthProvider bersih total
//           window.location.reload(); 

//       } catch (error) {
//           console.error("Logout Error:", error);
//           setNotify({ isOpen: true, type: 'error', title: 'Gagal', message: 'Gagal logout. Coba lagi.' });
//       }
//   };

//   // --- FUNGSI UPLOAD FOTO ---
//   const handleUploadAvatar = async (event) => {
//     try {
//       setUploading(true);

//       if (!event.target.files || event.target.files.length === 0) {
//         throw new Error('Pilih gambar dulu!');
//       }

//       const file = event.target.files[0];
//       const fileExt = file.name.split('.').pop();
//       const fileName = `${user.id}/${Math.random()}.${fileExt}`;
//       const filePath = `${fileName}`;

//       const { error: uploadError } = await supabase.storage
//         .from('avatars')
//         .upload(filePath, file);

//       if (uploadError) throw uploadError;

//       const { data } = supabase.storage.from('avatars').getPublicUrl(filePath);
//       const publicUrl = data.publicUrl;

//       const { error: updateUserError } = await supabase.auth.updateUser({
//         data: { avatar_url: publicUrl }
//       });

//       if (updateUserError) throw updateUserError;

//       setAvatarUrl(publicUrl);
//       setNotify({ isOpen: true, type: 'success', title: 'Berhasil', message: 'Foto profil diperbarui!' });
      
//       // Refresh halaman sebentar
//       setTimeout(() => window.location.reload(), 1000);

//     } catch (error) {
//       setNotify({ isOpen: true, type: 'error', title: 'Gagal Upload', message: error.message });
//     } finally {
//       setUploading(false);
//     }
//   };

//   // --- FUNGSI UPDATE DATA DIRI ---
//   const handleUpdateProfile = async (e) => {
//     e.preventDefault();
//     setLoading(true);
//     try {
//       const { error } = await supabase.auth.updateUser({
//         data: { full_name: fullName, phone: phone }
//       });
//       if (error) throw error;
//       setNotify({ isOpen: true, type: 'success', title: 'Berhasil', message: 'Profil berhasil diperbarui!' });
//     } catch (error) {
//       setNotify({ isOpen: true, type: 'error', title: 'Gagal', message: error.message });
//     } finally {
//       setLoading(false);
//     }
//   };

//   // --- FUNGSI GANTI PASSWORD ---
//   const handleUpdatePassword = async (e) => {
//     e.preventDefault();
//     if (password !== confirmPassword) return setNotify({ isOpen: true, type: 'error', title: 'Error', message: 'Password tidak cocok.' });
//     if (password.length < 6) return setNotify({ isOpen: true, type: 'error', title: 'Error', message: 'Minimal 6 karakter.' });

//     setLoading(true);
//     try {
//       const { error } = await supabase.auth.updateUser({ password: password });
//       if (error) throw error;
//       setNotify({ isOpen: true, type: 'success', title: 'Berhasil', message: 'Password berhasil diubah!' });
//       setPassword(''); setConfirmPassword('');
//     } catch (error) {
//       setNotify({ isOpen: true, type: 'error', title: 'Gagal', message: error.message });
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div className="pb-24">
//       {/* Header Back */}
//       <div className="bg-white p-4 sticky top-0 z-20 shadow-sm flex items-center gap-3">
//         <button onClick={() => navigate(-1)} className="p-2 rounded-full hover:bg-gray-100">
//             <ArrowLeft size={24} />
//         </button>
//         <h1 className="text-xl font-bold text-gray-800">Akun Saya</h1>
//       </div>

//       <div className="p-4 space-y-6 max-w-md mx-auto">
        
//         {/* --- AREA FOTO PROFIL --- */}
//         <div className="flex flex-col items-center justify-center -mt-2">
//             <div className="relative group">
//                 <div className="w-28 h-28 rounded-full border-4 border-white shadow-lg overflow-hidden bg-gray-100">
//                     {uploading ? (
//                         <div className="flex items-center justify-center h-full bg-gray-200">
//                             <Loader className="animate-spin text-gray-500" size={30} />
//                         </div>
//                     ) : avatarUrl ? (
//                         <img src={avatarUrl} alt="Profil" className="w-full h-full object-cover" />
//                     ) : (
//                         <div className="flex items-center justify-center h-full bg-blue-50 text-blue-300">
//                             <User size={50} />
//                         </div>
//                     )}
//                 </div>
                
//                 <label 
//                     htmlFor="avatar-upload" 
//                     className="absolute bottom-0 right-0 bg-blue-600 text-white p-2 rounded-full shadow-md cursor-pointer hover:bg-blue-700 transition transform hover:scale-110"
//                 >
//                     <Camera size={18} />
//                 </label>
//                 <input 
//                     type="file" 
//                     id="avatar-upload" 
//                     accept="image/*" 
//                     onChange={handleUploadAvatar} 
//                     disabled={uploading}
//                     className="hidden" 
//                 />
//             </div>
//             <p className="text-xs text-gray-400 mt-2">Ketuk kamera untuk ganti foto</p>
//         </div>

//         {/* --- FORM DATA DIRI --- */}
//         <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100">
//             <h3 className="font-bold text-gray-700 mb-4 flex items-center gap-2">
//                 <User size={20} className="text-blue-600"/> Data Diri
//             </h3>
//             <form onSubmit={handleUpdateProfile} className="space-y-4">
//                 <div>
//                     <label className="text-xs font-bold text-gray-500">Nama Lengkap</label>
//                     <input 
//                         type="text" 
//                         className="w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
//                         value={fullName}
//                         onChange={(e) => setFullName(e.target.value)}
//                         placeholder="Nama Anda"
//                     />
//                 </div>
//                 <div>
//                     <label className="text-xs font-bold text-gray-500">Nomor HP</label>
//                     <input 
//                         type="tel" 
//                         className="w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
//                         value={phone}
//                         onChange={(e) => setPhone(e.target.value)}
//                         placeholder="08..."
//                     />
//                 </div>
//                 <button disabled={loading} className="w-full bg-blue-600 text-white font-bold py-2.5 rounded-lg hover:bg-blue-700 transition flex justify-center items-center gap-2">
//                     <Save size={18} /> {loading ? 'Menyimpan...' : 'Simpan Profil'}
//                 </button>
//             </form>
//         </div>

//         {/* --- FORM GANTI PASSWORD --- */}
//         <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100">
//             <h3 className="font-bold text-gray-700 mb-4 flex items-center gap-2">
//                 <Lock size={20} className="text-orange-600"/> Ganti Password
//             </h3>
//             <form onSubmit={handleUpdatePassword} className="space-y-4">
//                 <div>
//                     <label className="text-xs font-bold text-gray-500">Password Baru</label>
//                     <input 
//                         type="password" 
//                         className="w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-orange-500 outline-none"
//                         value={password}
//                         onChange={(e) => setPassword(e.target.value)}
//                         placeholder="Minimal 6 karakter"
//                     />
//                 </div>
//                 <div>
//                     <label className="text-xs font-bold text-gray-500">Konfirmasi Password</label>
//                     <input 
//                         type="password" 
//                         className="w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-orange-500 outline-none"
//                         value={confirmPassword}
//                         onChange={(e) => setConfirmPassword(e.target.value)}
//                         placeholder="Ulangi password"
//                     />
//                 </div>
//                 <button disabled={loading} className="w-full bg-orange-600 text-white font-bold py-2.5 rounded-lg hover:bg-orange-700 transition flex justify-center items-center gap-2">
//                     <Lock size={18} /> {loading ? 'Memproses...' : 'Ubah Password'}
//                 </button>
//             </form>
//         </div>

//         {/* --- TOMBOL LOGOUT --- */}
//         <button 
//             onClick={handleLogout}
//             className="w-full bg-red-50 text-red-600 font-bold py-3 rounded-xl border border-red-100 hover:bg-red-100 transition flex items-center justify-center gap-2"
//         >
//             <LogOut size={20} /> Keluar Aplikasi
//         </button>

//       </div>

//       <NotificationModal 
//         isOpen={notify.isOpen} 
//         onClose={() => setNotify({...notify, isOpen: false})} 
//         type={notify.type} 
//         title={notify.title} 
//         message={notify.message} 
//       />
//     </div>
//   );
// };

// export default AccountPage;


//============================================================
import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '../supabaseClient';
import { useAuth } from '../AuthProvider';
import { useNavigate } from 'react-router-dom';
import { User, Store, MapPin, Lock, Save, LogOut, ArrowLeft, Camera, Loader, Trash2, X, Check, ZoomIn } from 'lucide-react';
import NotificationModal from '../components/NotificationModal';
import Cropper from 'react-easy-crop'; // Library Crop
import getCroppedImg from '../utils/imageUtils'; // Helper yg kita buat tadi

const AccountPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);

  // State Profil
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [avatarUrl, setAvatarUrl] = useState(null);

  // State Toko
  const [stores, setStores] = useState([]);
  const [activeStoreId, setActiveStoreId] = useState(null);
  const [showCreateStore, setShowCreateStore] = useState(false);
  const [newStoreName, setNewStoreName] = useState('');
  const [newStoreAddress, setNewStoreAddress] = useState('');

  // State Password
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // State Modal & Notif
  const [notify, setNotify] = useState({ isOpen: false, type: 'success', title: '', message: '' });
  
  // --- STATE BARU UNTUK GAMBAR ---
  const [fullScreenImage, setFullScreenImage] = useState(null); // Untuk lihat foto full
  const [cropModalOpen, setCropModalOpen] = useState(false); // Untuk modal crop
  const [imageSrc, setImageSrc] = useState(null); // Gambar mentah yg dipilih user
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);

  // --- INIT LOAD ---
  useEffect(() => {
    if (user) {
      setFullName(user.user_metadata.full_name || '');
      setPhone(user.user_metadata.phone || '');
      setAvatarUrl(user.user_metadata.avatar_url || null);
      setActiveStoreId(user.user_metadata.active_store_id || null);
      fetchStores();
    }
  }, [user]);

  const fetchStores = async () => {
      try {
          const { data } = await supabase.from('stores').select('*').eq('user_id', user.id).order('created_at', { ascending: true });
          setStores(data || []);
      } catch (error) { console.error(error); }
  };

  // --- HELPER: HAPUS FILE LAMA DARI BUCKET ---
  const deleteOldAvatar = async (url) => {
      if (!url) return;
      
      // Cek apakah URL ini milik Supabase kita (jangan hapus foto Google/eksternal)
      const projectUrl = supabase.storageUrl || 'supabase.co'; // Deteksi simpel
      if (!url.includes('avatars')) return; // Bukan dari bucket avatars

      try {
          // Ambil path relative: user_id/namafile.jpg
          const path = url.split('/avatars/')[1]; 
          if (path) {
              await supabase.storage.from('avatars').remove([path]);
          }
      } catch (err) {
          console.error("Gagal hapus file lama:", err);
      }
  };

  // --- 1. PILIH FILE & BUKA CROPPER ---
  const handleFileSelect = async (event) => {
    if (event.target.files && event.target.files.length > 0) {
      const file = event.target.files[0];
      const reader = new FileReader();
      reader.addEventListener('load', () => {
        setImageSrc(reader.result); // Set gambar ke state untuk dicrop
        setCropModalOpen(true); // Buka modal crop
      });
      reader.readAsDataURL(file);
    }
  };

  const onCropComplete = useCallback((croppedArea, croppedAreaPixels) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  // --- 2. PROSES CROP, KOMPRES & UPLOAD ---
  const handleUploadCroppedImage = async () => {
    try {
      setUploading(true);
      setCropModalOpen(false); // Tutup modal

      // 1. Proses Crop & Kompres via Helper
      const croppedBlob = await getCroppedImg(imageSrc, croppedAreaPixels);
      
      // 2. Hapus foto lama jika ada
      if (avatarUrl) {
          await deleteOldAvatar(avatarUrl);
      }

      // 3. Upload File Baru (Format .jpeg hasil kompresi)
      const fileName = `${user.id}/${Date.now()}.jpeg`; // Pakai Timestamp biar cache fresh
      const { error: uploadError } = await supabase.storage.from('avatars').upload(fileName, croppedBlob);

      if (uploadError) throw uploadError;

      // 4. Dapatkan URL
      const { data } = supabase.storage.from('avatars').getPublicUrl(fileName);
      const publicUrl = data.publicUrl;

      // 5. Update Metadata User
      const { error: updateUserError } = await supabase.auth.updateUser({
        data: { avatar_url: publicUrl }
      });
      if (updateUserError) throw updateUserError;

      setAvatarUrl(publicUrl);
      setNotify({ isOpen: true, type: 'success', title: 'Berhasil', message: 'Foto baru disimpan!' });
      
      // Refresh agar header update
      setTimeout(() => window.location.reload(), 1000);

    } catch (e) {
      console.error(e);
      setNotify({ isOpen: true, type: 'error', title: 'Gagal', message: 'Gagal memproses gambar.' });
    } finally {
      setUploading(false);
      setImageSrc(null); // Reset
    }
  };

  // --- 3. HAPUS FOTO PROFIL ---
  const handleDeleteAvatar = async () => {
      if(!window.confirm("Hapus foto profil?")) return;
      
      setUploading(true);
      try {
          // Hapus dari Storage
          await deleteOldAvatar(avatarUrl);

          // Update Metadata jadi NULL
          const { error } = await supabase.auth.updateUser({
              data: { avatar_url: null }
          });
          if(error) throw error;

          setAvatarUrl(null);
          setNotify({ isOpen: true, type: 'success', title: 'Dihapus', message: 'Foto profil dihapus.' });
          setTimeout(() => window.location.reload(), 1000);
      } catch (error) {
          setNotify({ isOpen: true, type: 'error', title: 'Gagal', message: error.message });
      } finally {
          setUploading(false);
      }
  };

  // --- FUNGSI TOKO & PROFIL LAINNYA ---
  const handleSelectStore = async (storeId) => {
      setLoading(true);
      try {
          await supabase.auth.updateUser({ data: { active_store_id: storeId } });
          setActiveStoreId(storeId);
          setNotify({ isOpen: true, type: 'success', title: 'Toko Diganti', message: 'Berhasil pindah toko.' });
          setTimeout(() => window.location.reload(), 1000);
      } catch (error) { console.error(error); } finally { setLoading(false); }
  };

  const handleCreateStore = async (e) => {
      e.preventDefault();
      if (!newStoreName.trim()) return alert("Isi nama toko");
      setLoading(true);
      try {
          const { data, error } = await supabase.from('stores').insert([{ user_id: user.id, name: newStoreName, address: newStoreAddress }]).select().single();
          if (error) throw error;
          setNewStoreName(''); setNewStoreAddress(''); setShowCreateStore(false);
          fetchStores(); handleSelectStore(data.id);
      } catch (error) { setNotify({ isOpen: true, type: 'error', title: 'Gagal', message: error.message }); } finally { setLoading(false); }
  };

  const handleUpdateProfile = async (e) => {
      e.preventDefault(); setLoading(true);
      try {
          await supabase.auth.updateUser({ data: { full_name: fullName, phone: phone } });
          setNotify({ isOpen: true, type: 'success', title: 'Berhasil', message: 'Profil disimpan.' });
      } catch (error) { setNotify({ isOpen: true, type: 'error', title: 'Gagal', message: error.message }); } finally { setLoading(false); }
  };

  const handleUpdatePassword = async (e) => {
      e.preventDefault();
      if (password !== confirmPassword || password.length < 6) return setNotify({ isOpen: true, type: 'error', title: 'Error', message: 'Password invalid.' });
      setLoading(true);
      try {
          await supabase.auth.updateUser({ password: password });
          setNotify({ isOpen: true, type: 'success', title: 'Berhasil', message: 'Password diubah!' });
          setPassword(''); setConfirmPassword('');
      } catch (error) { setNotify({ isOpen: true, type: 'error', title: 'Gagal', message: error.message }); } finally { setLoading(false); }
  };

  const handleLogout = async () => {
    if(window.confirm("Keluar dari aplikasi?")) {
        await supabase.auth.signOut(); localStorage.clear(); navigate('/login', { replace: true }); window.location.reload();
    }
  };

  return (
    <div className="pb-24">
      {/* Header */}
      <div className="bg-white p-4 sticky top-0 z-20 shadow-sm flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="p-2 rounded-full hover:bg-gray-100"><ArrowLeft size={24} /></button>
        <h1 className="text-xl font-bold text-gray-800">Akun & Toko</h1>
      </div>

      <div className="p-4 space-y-6 max-w-md mx-auto">
        
        {/* --- AREA FOTO PROFIL CANGGIH --- */}
        <div className="flex flex-col items-center justify-center -mt-2">
            <div className="relative group">
                <div 
                    className="w-28 h-28 rounded-full border-4 border-white shadow-lg overflow-hidden bg-gray-100 cursor-pointer relative"
                    onClick={() => avatarUrl && setFullScreenImage(avatarUrl)} // Klik untuk full screen
                >
                    {uploading ? (
                        <div className="flex items-center justify-center h-full bg-gray-200"><Loader className="animate-spin text-gray-500" /></div>
                    ) : avatarUrl ? (
                        <>
                            <img src={avatarUrl} alt="Profil" className="w-full h-full object-cover" />
                            <div className="absolute inset-0 bg-black/0 hover:bg-black/20 transition flex items-center justify-center">
                                <ZoomIn className="text-white opacity-0 group-hover:opacity-100 transition" size={24} />
                            </div>
                        </>
                    ) : (
                        <div className="flex items-center justify-center h-full bg-blue-50 text-blue-300"><User size={50} /></div>
                    )}
                </div>
                
                {/* Tombol Kamera (Ganti/Upload) */}
                <label htmlFor="avatar-upload" className="absolute bottom-0 right-0 bg-blue-600 text-white p-2 rounded-full shadow-md cursor-pointer hover:bg-blue-700 transition transform hover:scale-110 z-10">
                    <Camera size={18} />
                </label>
                <input type="file" id="avatar-upload" accept="image/*" onChange={handleFileSelect} disabled={uploading} className="hidden" />

                {/* Tombol Hapus (Hanya muncul jika ada foto) */}
                {avatarUrl && !uploading && (
                    <button 
                        onClick={handleDeleteAvatar}
                        className="absolute bottom-0 -left-2 bg-red-500 text-white p-2 rounded-full shadow-md hover:bg-red-600 transition transform hover:scale-110 z-10"
                        title="Hapus Foto"
                    >
                        <Trash2 size={18} />
                    </button>
                )}
            </div>
            <p className="text-xs text-gray-400 mt-2">Ketuk foto untuk memperbesar</p>
        </div>

        {/* --- FORM PILIH TOKO --- */}
        <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100">
            <div className="flex justify-between items-center mb-4">
                <h3 className="font-bold text-gray-700 flex items-center gap-2"><Store size={20} className="text-purple-600"/> Toko Aktif</h3>
                <button onClick={() => setShowCreateStore(!showCreateStore)} className="text-xs bg-purple-50 text-purple-600 px-2 py-1 rounded-lg font-bold border border-purple-100 hover:bg-purple-100">
                    {showCreateStore ? 'Batal' : '+ Toko Baru'}
                </button>
            </div>
            
            {showCreateStore && (
                <form onSubmit={handleCreateStore} className="mb-4 bg-purple-50 p-3 rounded-lg border border-purple-100 animate-fade-in">
                    <input className="w-full p-2 text-sm border rounded mb-2" placeholder="Nama Toko" value={newStoreName} onChange={e => setNewStoreName(e.target.value)} required />
                    <input className="w-full p-2 text-sm border rounded mb-2" placeholder="Alamat" value={newStoreAddress} onChange={e => setNewStoreAddress(e.target.value)} />
                    <button disabled={loading} className="w-full bg-purple-600 text-white text-xs font-bold py-2 rounded">{loading ? '...' : 'Simpan'}</button>
                </form>
            )}

            <div className="space-y-2 max-h-60 overflow-y-auto custom-scrollbar">
                {stores.length === 0 ? <p className="text-center text-gray-400 text-xs py-4">Belum ada toko.</p> : stores.map(store => (
                    <div key={store.id} onClick={() => store.id !== activeStoreId && handleSelectStore(store.id)}
                        className={`p-3 rounded-lg border flex justify-between items-center cursor-pointer transition ${store.id === activeStoreId ? 'bg-green-50 border-green-500 ring-1 ring-green-500' : 'bg-white hover:border-purple-300'}`}>
                        <div><p className={`font-bold text-sm ${store.id === activeStoreId ? 'text-green-800' : 'text-gray-700'}`}>{store.name}</p><div className="flex items-center gap-1 text-xs text-gray-500"><MapPin size={10} /><span className="truncate max-w-[150px]">{store.address || '-'}</span></div></div>
                        {store.id === activeStoreId && <Check size={20} className="text-green-600" />}
                    </div>
                ))}
            </div>
        </div>

        {/* --- FORM DATA DIRI --- */}
        <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100">
            <h3 className="font-bold text-gray-700 mb-4 flex items-center gap-2"><User size={20} className="text-blue-600"/> Data Diri</h3>
            <form onSubmit={handleUpdateProfile} className="space-y-3">
                <input type="text" className="w-full px-4 py-2 border rounded-lg text-sm" value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="Nama Anda" />
                <input type="tel" className="w-full px-4 py-2 border rounded-lg text-sm" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="Nomor HP" />
                <button disabled={loading} className="w-full bg-blue-600 text-white font-bold py-2 rounded-lg text-sm hover:bg-blue-700">Simpan Profil</button>
            </form>
        </div>

        {/* --- FORM PASSWORD --- */}
        <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100">
            <h3 className="font-bold text-gray-700 mb-4 flex items-center gap-2"><Lock size={20} className="text-orange-600"/> Ganti Password</h3>
            <form onSubmit={handleUpdatePassword} className="space-y-3">
                <input type="password" className="w-full px-4 py-2 border rounded-lg text-sm" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password Baru" />
                <input type="password" className="w-full px-4 py-2 border rounded-lg text-sm" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="Ulangi Password" />
                <button disabled={loading} className="w-full bg-orange-600 text-white font-bold py-2 rounded-lg text-sm hover:bg-orange-700">Ubah Password</button>
            </form>
        </div>

        <button onClick={handleLogout} className="w-full bg-red-50 text-red-600 font-bold py-3 rounded-xl border border-red-100 hover:bg-red-100 flex items-center justify-center gap-2">
            <LogOut size={20} /> Keluar Aplikasi
        </button>
      </div>

      {/* --- MODAL CROP GAMBAR --- */}
      {cropModalOpen && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-90 flex flex-col">
            <div className="relative flex-1 bg-black">
                <Cropper
                    image={imageSrc}
                    crop={crop}
                    zoom={zoom}
                    aspect={1} // Rasio 1:1 (Lingkaran/Kotak)
                    onCropChange={setCrop}
                    onZoomChange={setZoom}
                    onCropComplete={onCropComplete}
                />
            </div>
            <div className="p-4 bg-white flex flex-col gap-3 pb-8 rounded-t-2xl">
                <p className="text-center text-sm font-bold text-gray-600">Sesuaikan Posisi Foto</p>
                <div className="flex gap-3">
                    <button onClick={() => { setCropModalOpen(false); setImageSrc(null); }} className="flex-1 py-3 bg-gray-200 rounded-xl font-bold text-gray-700">Batal</button>
                    <button onClick={handleUploadCroppedImage} disabled={uploading} className="flex-1 py-3 bg-blue-600 text-white rounded-xl font-bold flex justify-center items-center gap-2">
                        {uploading ? <Loader className="animate-spin" size={20}/> : 'Simpan Foto'}
                    </button>
                </div>
            </div>
        </div>
      )}

      {/* --- MODAL FULL SCREEN IMAGE --- */}
      {fullScreenImage && (
          <div className="fixed inset-0 z-50 bg-black bg-opacity-95 flex items-center justify-center p-4" onClick={() => setFullScreenImage(null)}>
              <button className="absolute top-4 right-4 text-white p-2 bg-white/20 rounded-full"><X size={24}/></button>
              <img src={fullScreenImage} alt="Full Profil" className="max-w-full max-h-[80vh] rounded-lg shadow-2xl" />
          </div>
      )}

      <NotificationModal isOpen={notify.isOpen} onClose={() => setNotify({...notify, isOpen: false})} type={notify.type} title={notify.title} message={notify.message} />
    </div>
  );
};

export default AccountPage;