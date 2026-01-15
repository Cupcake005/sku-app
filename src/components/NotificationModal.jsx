import React from 'react';
import { CheckCircle, XCircle, AlertCircle, X } from 'lucide-react';

const NotificationModal = ({ isOpen, onClose, type = 'success', title, message }) => {
  if (!isOpen) return null;

  // Tentukan warna dan ikon berdasarkan tipe
  const styles = {
    success: { bg: 'bg-green-50', border: 'border-green-100', iconColor: 'text-green-600', btn: 'bg-green-600 hover:bg-green-700', icon: <CheckCircle size={32} /> },
    error: { bg: 'bg-red-50', border: 'border-red-100', iconColor: 'text-red-600', btn: 'bg-red-600 hover:bg-red-700', icon: <XCircle size={32} /> },
    info: { bg: 'bg-blue-50', border: 'border-blue-100', iconColor: 'text-blue-600', btn: 'bg-blue-600 hover:bg-blue-700', icon: <AlertCircle size={32} /> }
  };

  const currentStyle = styles[type] || styles.success;

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black bg-opacity-40 transition-opacity" onClick={onClose}></div>
      
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm relative z-10 overflow-hidden animate-scale-up">
        <div className={`${currentStyle.bg} p-6 flex flex-col items-center text-center border-b ${currentStyle.border}`}>
            <div className={`p-3 rounded-full mb-3 bg-white shadow-sm ${currentStyle.iconColor}`}>
                {currentStyle.icon}
            </div>
            <h3 className="text-xl font-bold text-gray-800">{title}</h3>
            <p className="text-sm text-gray-500 mt-2 leading-relaxed px-2">{message}</p>
        </div>

        <div className="p-4">
            <button 
                onClick={onClose}
                className={`w-full py-3 px-4 text-white rounded-xl font-bold shadow-lg transition ${currentStyle.btn}`}
            >
                OK, Mengerti
            </button>
        </div>
      </div>
    </div>
  );
};

export default NotificationModal;