export interface ResizeSquareImageOptions {
  sizePx?: number;
  maxRawBytes?: number;
  maxDataUrlLength?: number;
}

const DEFAULT_SIZE_PX = 192;
const DEFAULT_MAX_RAW_BYTES = 5 * 1024 * 1024;
const DEFAULT_MAX_DATA_URL_LENGTH = 200_000;
const ALLOWED_MIME_TYPES = new Set(["image/png", "image/jpeg", "image/webp"]);

export function resizeSquareImage(
  file: File,
  options: ResizeSquareImageOptions = {},
): Promise<string> {
  const sizePx = options.sizePx ?? DEFAULT_SIZE_PX;
  const maxRawBytes = options.maxRawBytes ?? DEFAULT_MAX_RAW_BYTES;
  const maxDataUrlLength =
    options.maxDataUrlLength ?? DEFAULT_MAX_DATA_URL_LENGTH;

  return new Promise((resolve, reject) => {
    if (!ALLOWED_MIME_TYPES.has(file.type)) {
      reject(new Error("Please choose a PNG, JPEG, or WebP image."));
      return;
    }

    if (file.size > maxRawBytes) {
      const maxMb = Math.round(maxRawBytes / (1024 * 1024));
      reject(new Error(`Image must be ${maxMb} MB or smaller.`));
      return;
    }

    const objectUrl = URL.createObjectURL(file);
    const img = new window.Image();

    img.onload = () => {
      try {
        if (img.naturalWidth <= 0 || img.naturalHeight <= 0) {
          reject(new Error("Selected image file has invalid dimensions."));
          return;
        }

        const canvas = document.createElement("canvas");
        canvas.width = sizePx;
        canvas.height = sizePx;

        const ctx = canvas.getContext("2d");
        if (!ctx) {
          reject(new Error("Could not process image in this browser."));
          return;
        }

        const cropSize = Math.min(img.naturalWidth, img.naturalHeight);
        const sx = Math.floor((img.naturalWidth - cropSize) / 2);
        const sy = Math.floor((img.naturalHeight - cropSize) / 2);

        const drawCropped = (fillWhiteBackground: boolean) => {
          ctx.clearRect(0, 0, sizePx, sizePx);
          if (fillWhiteBackground) {
            ctx.fillStyle = "#FFFFFF";
            ctx.fillRect(0, 0, sizePx, sizePx);
          }
          ctx.drawImage(
            img,
            sx,
            sy,
            cropSize,
            cropSize,
            0,
            0,
            sizePx,
            sizePx,
          );
        };

        drawCropped(false);
        let dataUrl = canvas.toDataURL("image/webp", 0.82);

        // Fill white before JPEG export so transparent PNGs do not turn black.
        if (
          !dataUrl.startsWith("data:image/webp") ||
          dataUrl.length > maxDataUrlLength
        ) {
          drawCropped(true);
          dataUrl = canvas.toDataURL("image/jpeg", 0.8);
        }
        if (dataUrl.length > maxDataUrlLength) {
          dataUrl = canvas.toDataURL("image/jpeg", 0.6);
        }
        if (dataUrl.length > maxDataUrlLength) {
          reject(
            new Error(
              "Image is still too large after compression. Try another photo.",
            ),
          );
          return;
        }

        resolve(dataUrl);
      } catch {
        reject(new Error("Could not process the selected image."));
      } finally {
        URL.revokeObjectURL(objectUrl);
      }
    };

    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error("Could not read the selected image file."));
    };

    img.src = objectUrl;
  });
}
