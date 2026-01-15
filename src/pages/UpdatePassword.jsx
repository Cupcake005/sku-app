import React, { useState } from 'react';
import { supabase } from '../supabaseClient';
import { useNavigate } from 'react-router-dom';

const UpdatePassword = () => {
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);

    const { error } = await supabase.auth.updateUser({ 
      password: password 
    });

    if (error) {
      alert("Gagal: " + error.message);
    } else {
      alert("✅ Password berhasil diubah! Silakan login.");
      navigate('/login'); // Arahkan kembali ke login
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
      <div className="bg-white p-8 rounded-xl shadow-md w-full max-w-sm">
        <h2 className="text-2xl font-bold text-center mb-6 text-gray-800">Buat Password Baru</h2>
        <form onSubmit={handleUpdate} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Password Baru</label>
            <input
              type="password"
              required
              className="w-full border px-3 py-2 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Minimal 6 karakter"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-2 rounded-lg font-bold hover:bg-blue-700 transition"
          >
            {loading ? 'Memproses...' : 'Update Password'}
          </button>
        </form>
      </div>
    </div>
  );
};

// --- PASTIKAN BARIS INI ADA ---
export default UpdatePassword;