// Fungsi membuat Image Object
export const createImage = (url) =>
  new Promise((resolve, reject) => {
    const image = new Image();
    image.addEventListener('load', () => resolve(image));
    image.addEventListener('error', (error) => reject(error));
    image.setAttribute('crossOrigin', 'anonymous'); 
    image.src = url;
  });

// Fungsi Utama: Crop & Kompres
export default async function getCroppedImg(imageSrc, pixelCrop) {
  const image = await createImage(imageSrc);
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');

  if (!ctx) {
    return null;
  }

  // Set ukuran canvas sesuai hasil crop
  canvas.width = pixelCrop.width;
  canvas.height = pixelCrop.height;

  // Gambar ulang foto di canvas (Proses Crop)
  ctx.drawImage(
    image,
    pixelCrop.x,
    pixelCrop.y,
    pixelCrop.width,
    pixelCrop.height,
    0,
    0,
    pixelCrop.width,
    pixelCrop.height
  );

  // Jadikan Blob (File) & Kompres
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (!blob) {
          reject(new Error('Canvas is empty'));
          return;
        }
        // Ubah nama file agar unik
        blob.name = 'profile.jpeg';
        resolve(blob);
      },
      'image/jpeg', // Ubah jadi JPEG (lebih kecil dari PNG untuk foto)
      0.7 // KUALITAS KOMPRESI (0.1 - 1.0). 0.7 = 70% kualitas (hemat size)
    );
  });
}