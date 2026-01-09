import { expect, afterEach, vi, beforeAll } from 'vitest';
import { cleanup } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';

// Cleanup después de cada test
afterEach(() => {
    cleanup();
    vi.clearAllMocks();
    localStorage.clear();
});

// Variables de entorno mock
beforeAll(() => {
    import.meta.env.VITE_BACKEND_URL = 'http://localhost:3000';
    import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY = 'pk_test_mock';
});

// Mock de URL.createObjectURL (no implementado en jsdom por defecto)
if (!global.URL) {
    // jsdom debería definir URL, pero por si acaso
    global.URL = {};
}

if (!global.URL.createObjectURL) {
    global.URL.createObjectURL = vi.fn(() => 'blob:mock-url');
}

// Mock de window.matchMedia
Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: vi.fn().mockImplementation(query => ({
        matches: false,
        media: query,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
    })),
});

// Mock de IntersectionObserver
global.IntersectionObserver = class IntersectionObserver {
    constructor() { }
    disconnect() { }
    observe() { }
    takeRecords() {
        return [];
    }
    unobserve() { }
};

// Mock de window.confirm
global.confirm = vi.fn(() => true);

// Mock de console.error para evitar ruido en tests
const originalError = console.error;
beforeAll(() => {
    console.error = (...args) => {
        if (
            typeof args[0] === 'string' &&
            (args[0].includes('Warning: ReactDOM.render') ||
                args[0].includes('Not implemented: HTMLFormElement.prototype.submit'))
        ) {
            return;
        }
        originalError.call(console, ...args);
    };
});
