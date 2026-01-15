// import React from 'react';
// import { AlertTriangle, X } from 'lucide-react';

// const ConfirmationModal = ({ isOpen, onClose, onConfirm, title, message, details }) => {
//   if (!isOpen) return null;

//   return (
//     <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
//       {/* Overlay Gelap */}
//       <div 
//         className="absolute inset-0 bg-black bg-opacity-50 transition-opacity animate-fade-in"
//         onClick={onClose}
//       ></div>

//       {/* Konten Modal */}
//       <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm relative z-10 overflow-hidden animate-scale-up">
        
//         {/* Header dengan Icon Warning */}
//         <div className="bg-orange-50 p-6 flex flex-col items-center text-center border-b border-orange-100">
//             <div className="bg-orange-100 p-3 rounded-full mb-3 text-orange-600">
//                 <AlertTriangle size={32} />
//             </div>
//             <h3 className="text-xl font-bold text-gray-800">{title}</h3>
//             <p className="text-sm text-gray-500 mt-2 leading-relaxed">
//                 {message}
//             </p>
//         </div>

//         {/* Detail Perubahan (Opsional) */}
//         {details && (
//             <div className="p-4 bg-gray-50 text-sm border-b border-gray-100">
//                 {details}
//             </div>
//         )}

//         {/* Tombol Aksi */}
//         <div className="p-4 flex gap-3">
//             <button 
//                 onClick={onClose}
//                 className="flex-1 py-2.5 px-4 bg-white border border-gray-300 rounded-xl text-gray-700 font-bold hover:bg-gray-50 transition"
//             >
//                 Batal
//             </button>
//             <button 
//                 onClick={onConfirm}
//                 className="flex-1 py-2.5 px-4 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 shadow-lg shadow-blue-200 transition"
//             >
//                 Ya, Update
//             </button>
//         </div>

//         {/* Tombol Close Pojok */}
//         <button onClick={onClose} className="absolute top-3 right-3 text-gray-400 hover:text-gray-600">
//             <X size={20} />
//         </button>
//       </div>
//     </div>
//   );
// };

// export default ConfirmationModal;

import React from 'react';
import { AlertTriangle, X } from 'lucide-react';

const ConfirmationModal = ({ 
  isOpen, 
  onClose, 
  onConfirm, 
  title, 
  message, 
  details,
  confirmLabel = "Ya, Lanjutkan", // Default teks
  isDanger = false // Default warna (false = Biru, true = Merah)
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
      {/* Overlay Gelap */}
      <div 
        className="absolute inset-0 bg-black bg-opacity-50 transition-opacity animate-fade-in"
        onClick={onClose}
      ></div>

      {/* Konten Modal */}
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm relative z-10 overflow-hidden animate-scale-up">
        
        {/* Header dengan Icon Warning */}
        <div className={`p-6 flex flex-col items-center text-center border-b ${isDanger ? 'bg-red-50 border-red-100' : 'bg-orange-50 border-orange-100'}`}>
            <div className={`p-3 rounded-full mb-3 ${isDanger ? 'bg-red-100 text-red-600' : 'bg-orange-100 text-orange-600'}`}>
                <AlertTriangle size={32} />
            </div>
            <h3 className="text-xl font-bold text-gray-800">{title}</h3>
            <p className="text-sm text-gray-500 mt-2 leading-relaxed">
                {message}
            </p>
        </div>

        {/* Detail Perubahan (Opsional) */}
        {details && (
            <div className="p-4 bg-gray-50 text-sm border-b border-gray-100">
                {details}
            </div>
        )}

        {/* Tombol Aksi */}
        <div className="p-4 flex gap-3">
            <button 
                onClick={onClose}
                className="flex-1 py-2.5 px-4 bg-white border border-gray-300 rounded-xl text-gray-700 font-bold hover:bg-gray-50 transition"
            >
                Batal
            </button>
            <button 
                onClick={onConfirm}
                className={`flex-1 py-2.5 px-4 text-white rounded-xl font-bold shadow-lg transition ${
                    isDanger 
                    ? 'bg-red-600 hover:bg-red-700 shadow-red-200' 
                    : 'bg-blue-600 hover:bg-blue-700 shadow-blue-200'
                }`}
            >
                {confirmLabel}
            </button>
        </div>

        {/* Tombol Close Pojok */}
        <button onClick={onClose} className="absolute top-3 right-3 text-gray-400 hover:text-gray-600">
            <X size={20} />
        </button>
      </div>
    </div>
  );
};

export default ConfirmationModal;