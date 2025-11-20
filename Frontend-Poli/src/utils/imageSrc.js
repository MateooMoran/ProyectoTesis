export function getImageUrl(product) {
  if (!product) return '/placeholder.png';

  // If product is actually an image string passed directly
  if (typeof product === 'string') {
    if (product.trim() === '') return '/placeholder.png';
    return product;
  }

  // Prefer explicit imagen
  if (product.imagen) return product.imagen;

  // imagenIA can be a string (url or base64) or an object (cloudinary)
  const ia = product.imagenIA;
  if (!ia) return '/placeholder.png';

  if (typeof ia === 'string') {
    // if it's a data URL or an http(s) URL, return it
    if (ia.startsWith('data:') || ia.startsWith('http://') || ia.startsWith('https://')) return ia;
    // otherwise return as-is (may be base64 without prefix)
    return ia;
  }

  // object form (e.g., Cloudinary upload result)
  return ia.secure_url || ia.url || '/placeholder.png';
}

export default getImageUrl;
