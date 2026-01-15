// import React, { createContext, useContext, useEffect, useState } from 'react';
// import { supabase } from './supabaseClient';

// const AuthContext = createContext({});

// export const useAuth = () => useContext(AuthContext);

// export const AuthProvider = ({ children }) => {
//   const [user, setUser] = useState(null);
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     // Cek sesi saat ini
//     const checkSession = async () => {
//         const { data: { session } } = await supabase.auth.getSession();
//         setUser(session?.user ?? null);
//         setLoading(false);
//     };
    
//     checkSession();

//     // Dengerin perubahan (Login/Logout)
//     const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
//       setUser(session?.user ?? null);
//       setLoading(false);
//     });

//     return () => listener.subscription.unsubscribe();
//   }, []);

//   const login = async (email, password) => {
//     const { error } = await supabase.auth.signInWithPassword({ email, password });
//     if (error) throw error;
//   };

//   // --- UPDATE: Register terima Nama Lengkap ---
//   const register = async (email, password, name) => {
//     const { error } = await supabase.auth.signUp({ 
//         email, 
//         password,
//         options: { 
//             emailRedirectTo: undefined,
//             // Simpan nama di metadata user Supabase
//             data: {
//                 full_name: name 
//             }
//         }
//     });
//     if (error) throw error;
//   };

//   const verifyOtp = async (email, token) => {
//       const { error } = await supabase.auth.verifyOtp({
//           email,
//           token,
//           type: 'signup'
//       });
//       if (error) throw error;
//   };

//   const sendPasswordReset = async (email) => {
//       const { error } = await supabase.auth.resetPasswordForEmail(email, {
//           redirectTo: window.location.origin + '/manage' 
//       });
//       if (error) throw error;
//   };

//   const updatePassword = async (newPassword) => {
//       const { error } = await supabase.auth.updateUser({ password: newPassword });
//       if (error) throw error;
//   };

//   const logout = async () => {
//     await supabase.auth.signOut();
//   };

//   return (
//     <AuthContext.Provider value={{ user, login, register, verifyOtp, sendPasswordReset, updatePassword, logout, loading }}>
//       {!loading && children}
//     </AuthContext.Provider>
//   );
// };

import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from './supabaseClient';
import { useNavigate } from 'react-router-dom'; // <--- 1. Import useNavigate

const AuthContext = createContext({});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate(); // <--- 2. Inisialisasi navigate

  useEffect(() => {
    // Cek sesi saat ini
    const checkSession = async () => {
        const { data: { session } } = await supabase.auth.getSession();
        setUser(session?.user ?? null);
        setLoading(false);
    };
    
    checkSession();

    // Dengerin perubahan (Login/Logout/Reset)
    const { data: listener } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null);
      setLoading(false);

      // <--- 3. LOGIKA PENTING: Deteksi Reset Password
      if (event === 'PASSWORD_RECOVERY') {
        // Otomatis pindahkan user ke halaman ganti password
        navigate('/update-password');
      }
    });

    return () => listener.subscription.unsubscribe();
  }, [navigate]);

  const login = async (email, password) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
  };

  const register = async (email, password, name) => {
    const { error } = await supabase.auth.signUp({ 
        email, 
        password,
        options: { 
            emailRedirectTo: undefined,
            data: {
                full_name: name 
            }
        }
    });
    if (error) throw error;
  };

  const verifyOtp = async (email, token) => {
      const { error } = await supabase.auth.verifyOtp({
          email,
          token,
          type: 'signup'
      });
      if (error) throw error;
  };

  const sendPasswordReset = async (email) => {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
          // <--- 4. Pastikan redirect URL mengarah ke halaman update-password
          redirectTo: window.location.origin + '/update-password' 
      });
      if (error) throw error;
  };

  const updatePassword = async (newPassword) => {
      const { error } = await supabase.auth.updateUser({ password: newPassword });
      if (error) throw error;
  };

  const logout = async () => {
    await supabase.auth.signOut();
    navigate('/login'); // Opsional: Paksa ke login setelah logout
  };

  return (
    <AuthContext.Provider value={{ user, login, register, verifyOtp, sendPasswordReset, updatePassword, logout, loading }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};