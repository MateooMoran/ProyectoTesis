import { vi } from 'vitest';

export const mockSwal = {
    fire: vi.fn(() => Promise.resolve({ isConfirmed: true })),
    mixin: vi.fn(() => ({
        fire: vi.fn(() => Promise.resolve()),
    })),
};

export default mockSwal;
