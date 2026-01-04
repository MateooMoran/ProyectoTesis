import { vi } from 'vitest';

const mockFire = vi.fn().mockResolvedValue({ isConfirmed: true, value: true });

const Toast = {
    fire: vi.fn().mockResolvedValue({ isConfirmed: true }),
};

const mixin = vi.fn(() => ({
    fire: vi.fn().mockResolvedValue({ isConfirmed: true }),
}));

export const toast = {
    success: vi.fn(),
    error: vi.fn(),
    info: vi.fn(),
    warn: vi.fn(),
};

export const alertConfirm = vi.fn().mockResolvedValue(true);

export const alert = vi.fn().mockResolvedValue({ isConfirmed: true });

const Swal = {
    fire: mockFire,
    mixin: mixin,
};

export { Toast };
export default Swal;
