/**
 * Compresses and resizes an uploaded image file into a lightweight data URL
 * to avoid exceeding Firestore's 1MB document limit or localStorage quota.
 */
export function optimizeImage(
  file: File,
  maxWidth = 480,
  maxHeight = 480,
  quality = 0.85
): Promise<string> {
  return new Promise((resolve) => {
    // If not an image, resolve empty
    if (!file || !file.type.startsWith('image/')) {
      resolve('');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target?.result as string;
      if (!dataUrl) {
        resolve('');
        return;
      }

      const img = new Image();
      img.onload = () => {
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > maxWidth) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width = Math.round((width * maxHeight) / height);
            height = maxHeight;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = Math.max(1, width);
        canvas.height = Math.max(1, height);
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(dataUrl);
          return;
        }

        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        ctx.drawImage(img, 0, 0, width, height);

        // Try WebP first for optimal compression, fallback to PNG
        try {
          const optimized = canvas.toDataURL('image/webp', quality);
          if (optimized && optimized.startsWith('data:image/webp')) {
            resolve(optimized);
            return;
          }
        } catch {
          // ignore
        }

        resolve(canvas.toDataURL('image/png', quality));
      };

      img.onerror = () => {
        resolve(dataUrl);
      };

      img.src = dataUrl;
    };

    reader.onerror = () => {
      resolve('');
    };

    reader.readAsDataURL(file);
  });
}
