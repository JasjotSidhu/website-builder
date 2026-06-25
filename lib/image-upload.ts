const IMAGE_EXTENSIONS = /\.(jpe?g|png|gif|webp|svg|bmp|avif|heic|heif)$/i;
const MAX_IMAGE_BYTES = 8 * 1024 * 1024;
const MAX_DIMENSION = 1920;

function isImageFile(file: File): boolean {
  if (file.type.startsWith("image/")) {
    return true;
  }
  return IMAGE_EXTENSIONS.test(file.name);
}

export function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result;
      if (typeof result !== "string" || !result.startsWith("data:")) {
        reject(new Error("Could not read the image file."));
        return;
      }
      resolve(result);
    };
    reader.onerror = () => reject(new Error("Could not read the image file."));
    reader.readAsDataURL(file);
  });
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("Could not decode image."));
    img.src = src;
  });
}

function compressRasterImage(img: HTMLImageElement, usePng: boolean): string {
  let width = img.naturalWidth;
  let height = img.naturalHeight;

  if (!width || !height) {
    throw new Error("Could not read image dimensions.");
  }

  if (width > MAX_DIMENSION || height > MAX_DIMENSION) {
    const scale = MAX_DIMENSION / Math.max(width, height);
    width = Math.round(width * scale);
    height = Math.round(height * scale);
  }

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;

  const ctx = canvas.getContext("2d");
  if (!ctx) {
    throw new Error("Could not process image.");
  }

  if (!usePng) {
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, width, height);
  }

  ctx.drawImage(img, 0, 0, width, height);

  return canvas.toDataURL(usePng ? "image/png" : "image/jpeg", usePng ? undefined : 0.85);
}

export function formatCssBackgroundUrl(url: string): string {
  return `url("${url.replace(/\\/g, "\\\\").replace(/"/g, '\\"')}")`;
}

export function isHeicFile(file: File): boolean {
  return (
    file.type === "image/heic" ||
    file.type === "image/heif" ||
    /\.heic$/i.test(file.name) ||
    /\.heif$/i.test(file.name)
  );
}

export async function optimizeImageDataUrl(
  rawDataUrl: string,
  file: File,
): Promise<string> {
  if (file.type === "image/svg+xml" || /\.svg$/i.test(file.name)) {
    return rawDataUrl;
  }

  const img = await loadImage(rawDataUrl);
  const usePng = file.type === "image/png" || rawDataUrl.startsWith("data:image/png");
  return compressRasterImage(img, usePng);
}

export async function readImageFileAsDataUrl(file: File): Promise<string> {
  if (!isImageFile(file)) {
    throw new Error("Please choose an image file.");
  }

  if (file.size > MAX_IMAGE_BYTES) {
    throw new Error("Image must be 8 MB or smaller.");
  }

  if (isHeicFile(file)) {
    throw new Error(
      "HEIC images are not supported in this browser. Save as JPEG or PNG and try again.",
    );
  }

  const raw = await readFileAsDataUrl(file);

  try {
    return await optimizeImageDataUrl(raw, file);
  } catch {
    return raw;
  }
}

export function createPreviewObjectUrl(file: File): string {
  return URL.createObjectURL(file);
}

function dataUrlToBlob(dataUrl: string): Blob {
  const [header, base64] = dataUrl.split(",");
  const mime = header.match(/:(.*?);/)?.[1] ?? "image/jpeg";
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let index = 0; index < binary.length; index += 1) {
    bytes[index] = binary.charCodeAt(index);
  }
  return new Blob([bytes], { type: mime });
}

export async function uploadImageFile(file: File): Promise<string> {
  const dataUrl = await readImageFileAsDataUrl(file);
  const blob = dataUrlToBlob(dataUrl);
  const ext = blob.type === "image/png" ? "png" : blob.type === "image/svg+xml" ? "svg" : "jpg";
  const uploadFile = new File([blob], `upload.${ext}`, { type: blob.type });
  const formData = new FormData();
  formData.append("file", uploadFile);

  const response = await fetch("/api/upload", {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    throw new Error("Upload failed.");
  }

  const payload = (await response.json()) as { url?: string };
  if (!payload.url) {
    throw new Error("Upload failed.");
  }

  return payload.url;
}
