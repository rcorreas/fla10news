'use client';

export interface UploadImageResult {
  url: string;
  provider: 'cloudflare-r2' | 'firebase-gcs';
  sizeKB: number;
}

/**
 * Redimensiona e comprime automaticamente a imagem no navegador para JPEG HD (~90-160 KB)
 * antes de enviar ao servidor, preservando PNG apenas para ícones/escudos pequenos com transparência.
 */
async function compressImageInBrowser(
  file: File,
  options?: { maxWidth?: number; quality?: number }
): Promise<Blob> {
  if (typeof window === 'undefined' || file.type === 'image/gif') {
    return file;
  }

  return new Promise<Blob>((resolve) => {
    const img = new window.Image();
    const objectUrl = URL.createObjectURL(file);

    img.onload = () => {
      URL.revokeObjectURL(objectUrl);

      const isVerticalStrip = img.height > img.width * 1.45;
      const maxWidth = options?.maxWidth ?? (isVerticalStrip ? 1400 : 1280);
      const quality = options?.quality ?? 0.85;

      let targetWidth = img.width;
      let targetHeight = img.height;

      if (targetWidth > maxWidth) {
        const ratio = maxWidth / targetWidth;
        targetWidth = Math.round(targetWidth * ratio);
        targetHeight = Math.round(targetHeight * ratio);
      }

      const canvas = document.createElement('canvas');
      canvas.width = targetWidth;
      canvas.height = targetHeight;

      const ctx = canvas.getContext('2d');
      if (!ctx) {
        resolve(file);
        return;
      }

      // Se for PNG pequeno (ex: escudo de time ou selo de coluna <= 512px), verifica transparência
      const keepPngForLogo =
        file.type === 'image/png' && targetWidth <= 512 && targetHeight <= 512;

      if (!keepPngForLogo) {
        // Preenche fundo branco caso o PNG original tenha áreas transparentes
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(0, 0, targetWidth, targetHeight);
      }

      ctx.drawImage(img, 0, 0, targetWidth, targetHeight);

      const outputMime = keepPngForLogo ? 'image/png' : 'image/jpeg';
      canvas.toBlob(
        (blob) => {
          if (!blob) {
            resolve(file);
            return;
          }
          // Se por algum motivo o arquivo original já era um JPEG menor que o recomprimido, mantém o menor
          if (file.type === 'image/jpeg' && file.size < blob.size && img.width <= maxWidth) {
            resolve(file);
            return;
          }
          resolve(blob);
        },
        outputMime,
        outputMime === 'image/jpeg' ? quality : undefined
      );
    };

    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      resolve(file);
    };

    img.src = objectUrl;
  });
}

export async function compressAndUploadImage(
  file: File,
  options?: { maxWidth?: number; quality?: number; folder?: string }
): Promise<UploadImageResult> {
  const compressedBlob = await compressImageInBrowser(file, options);
  const ext = compressedBlob.type === 'image/png' ? 'png' : 'jpg';
  const fileName = (file.name || `image.${ext}`).replace(/\.[^.]+$/, '') + `.${ext}`;

  const formData = new FormData();
  formData.append('file', compressedBlob, fileName);
  formData.append('folder', options?.folder || 'materias');

  const response = await fetch('/api/upload-image', {
    method: 'POST',
    body: formData,
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok || !data.url) {
    throw new Error(data.error || `Falha no upload da imagem (HTTP ${response.status})`);
  }

  return {
    url: data.url,
    provider: data.provider || 'firebase-gcs',
    sizeKB: Math.max(1, Math.round((data.sizeBytes || compressedBlob.size) / 1024)),
  };
}
