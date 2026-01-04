import { vi } from 'vitest';

export const mockAxios = {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    patch: vi.fn(),
    delete: vi.fn(),
    create: vi.fn(() => mockAxios),
    defaults: {
        headers: {
            common: {},
        },
    },
    interceptors: {
        request: {
            use: vi.fn(),
            eject: vi.fn(),
        },
        response: {
            use: vi.fn(),
            eject: vi.fn(),
        },
    },
};

export default mockAxios;
