// ---------------------------------------------------------------------------
// Image upload validation & resize utility
//
// IMPORTANT — read this before assuming this runs on the server:
// Cloudflare Workers (and most edge runtimes) cannot run native image-processing
// libraries like `sharp` — it requires a native binary, which the Workers
// runtime does not support. There is no server-side Node.js image resizing
// available in this deployment target.
//
// The correct, working alternative — and what this file actually does — is
// resize and validate the image in the BROWSER, before it's ever uploaded,
// using the HTML5 Canvas API. This runs client-side in admin forms (see
// ImageUploadField in components/AdminClient.jsx), so by the time an image
// reaches the server/database, it has already been validated and resized.
// ---------------------------------------------------------------------------

const DEFAULT_OPTIONS = {
  maxDimension: 1200,       // longest side, in pixels, after resize
  maxOutputBytes: 350_000,  // ~350KB target ceiling after compression
  initialQuality: 0.85,
  minQuality: 0.5,
  acceptedTypes: ["image/jpeg", "image/png", "image/webp", "image/gif"],
};

/**
 * Validates an uploaded File is actually an image of an accepted type.
 * Returns { ok: true } or { ok: false, error: string }.
 */
export function validateImageFile(file, options = {}) {
  const opts = { ...DEFAULT_OPTIONS, ...options };
  if (!file) return { ok: false, error: "No file selected." };
  if (!file.type || !file.type.startsWith("image/")) {
    return { ok: false, error: "Please choose an image file." };
  }
  if (!opts.acceptedTypes.includes(file.type)) {
    return { ok: false, error: "Unsupported image type. Use JPEG, PNG, WebP, or GIF." };
  }
  return { ok: true };
}

/**
 * Loads a File into an HTMLImageElement for canvas processing.
 */
function loadImage(file) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve(img);
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Could not read this image file — it may be corrupted."));
    };
    img.src = url;
  });
}

/**
 * Resizes an image down to fit within maxDimension (preserving aspect ratio),
 * then compresses it as JPEG, stepping quality down until it's under
 * maxOutputBytes or minQuality is reached. Returns a base64 data URL string,
 * ready to store directly (e.g. in a Supabase text/jsonb column).
 *
 * Throws with a user-readable message on failure — callers should catch and
 * surface `error.message` to the user.
 */
export async function validateAndResizeImage(file, options = {}) {
  const opts = { ...DEFAULT_OPTIONS, ...options };

  const validation = validateImageFile(file, opts);
  if (!validation.ok) throw new Error(validation.error);

  const img = await loadImage(file);

  const { width: srcW, height: srcH } = img;
  if (!srcW || !srcH) throw new Error("Could not read this image's dimensions.");

  const scale = Math.min(1, opts.maxDimension / Math.max(srcW, srcH));
  const targetW = Math.round(srcW * scale);
  const targetH = Math.round(srcH * scale);

  const canvas = document.createElement("canvas");
  canvas.width = targetW;
  canvas.height = targetH;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Image processing is not supported in this browser.");
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";
  ctx.drawImage(img, 0, 0, targetW, targetH);

  // Step quality down until under the target size, or we hit the floor.
  let quality = opts.initialQuality;
  let dataUrl = canvas.toDataURL("image/jpeg", quality);

  while (estimateBase64Bytes(dataUrl) > opts.maxOutputBytes && quality > opts.minQuality) {
    quality -= 0.1;
    dataUrl = canvas.toDataURL("image/jpeg", quality);
  }

  const finalBytes = estimateBase64Bytes(dataUrl);
  if (finalBytes > opts.maxOutputBytes) {
    throw new Error(
      `This image is still too large after compression (${Math.round(finalBytes / 1024)}KB). Try a smaller photo, or paste an image URL instead.`
    );
  }

  return {
    dataUrl,
    width: targetW,
    height: targetH,
    bytes: finalBytes,
    quality,
  };
}

function estimateBase64Bytes(dataUrl) {
  const base64 = dataUrl.split(",")[1] || "";
  // Each base64 char encodes 6 bits; 4 chars = 3 bytes. Minus padding.
  const padding = (base64.match(/=+$/) || [""])[0].length;
  return Math.floor((base64.length * 3) / 4) - padding;
}
