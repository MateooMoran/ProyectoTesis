export function getImageUrl(product) {
  if (!product) return '/placeholder.png';

  // If product is actually an image string passed directly
  if (typeof product === 'string') {
    if (product.trim() === '') return '/placeholder.png';
    return product;
  }

  // Priorizar imagenIA si existe (puede ser URL, data URL o objeto de Cloudinary)
  const ia = product.imagenIA;
  if (ia) {
    if (typeof ia === 'string') {
      if (ia.trim() === '') {
        // ignore empty
      } else if (ia.startsWith('data:') || ia.startsWith('http://') || ia.startsWith('https://')) {
        return ia;
      } else {
        return ia;
      }
    }
    return ia.secure_url || ia.url || '/placeholder.png';
  }

  // Fallback a `imagen` si no hay imagenIA
  if (product.imagen) return product.imagen;

  return '/placeholder.png';
}

export default getImageUrl;
