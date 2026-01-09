import React from 'react';
import { useSwipeable } from 'react-swipeable';
import { useNavigate, useLocation } from 'react-router-dom';

const SwipeWrapper = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();

  // Urutan halaman: Scan -> List -> Manage
  const paths = ['/', '/list', '/manage'];

  const handlers = useSwipeable({
    onSwipedLeft: () => {
      // Geser Kiri (Jempol ke kiri) -> Maju ke halaman berikutnya
      const currentIndex = paths.indexOf(location.pathname);
      if (currentIndex < paths.length - 1) {
        navigate(paths[currentIndex + 1]);
      }
    },
    onSwipedRight: () => {
      // Geser Kanan (Jempol ke kanan) -> Mundur ke halaman sebelumnya
      const currentIndex = paths.indexOf(location.pathname);
      if (currentIndex > 0) {
        navigate(paths[currentIndex - 1]);
      }
    },
    // Konfigurasi sensitivitas
    delta: 50,              // Minimal geser 50px baru dianggap swipe
    preventDefaultTouchmoveEvent: false,
    trackTouch: true,
    trackMouse: false       // Ubah true jika mau tes pakai mouse di laptop
  });

  return (
    <div {...handlers} style={{ minHeight: '100vh' }}>
      {children}
    </div>
  );
};

export default SwipeWrapper;