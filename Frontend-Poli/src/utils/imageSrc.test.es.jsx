import { describe, it, expect } from 'vitest';
import getImageUrl from './imageSrc';

describe('getImageUrl - Español', () => {
  it('retorna placeholder cuando el producto es null', () => {
    expect(getImageUrl(null)).toBe('/placeholder.png');
  });

  it('devuelve la cadena cuando se pasa una URL', () => {
    expect(getImageUrl('https://ejemplo.com/imagen.jpg')).toBe('https://ejemplo.com/imagen.jpg');
  });

  it('devuelve data URL cuando está en imagenIA', () => {
    const prod = { imagenIA: 'data:image/png;base64,AAA' };
    expect(getImageUrl(prod)).toBe('data:image/png;base64,AAA');
  });

  it('devuelve secure_url cuando imagenIA es un objeto de Cloudinary', () => {
    const prod = { imagenIA: { secure_url: 'https://res.cloudinary.com/ejemplo.jpg' } };
    expect(getImageUrl(prod)).toBe('https://res.cloudinary.com/ejemplo.jpg');
  });

  it('usa imagen como fallback cuando no hay imagenIA', () => {
    const prod = { imagen: '/uploads/archivo.jpg' };
    expect(getImageUrl(prod)).toBe('/uploads/archivo.jpg');
  });
});
