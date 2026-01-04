import { vi } from 'vitest';
import { render } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';

export const renderWithRouter = (ui, { route = '/' } = {}) => {
    window.history.pushState({}, 'Test page', route);
    return render(ui, { wrapper: BrowserRouter });
};

export const mockLocalStorage = () => {
    const store = {};
    return {
        getItem: vi.fn((key) => store[key] || null),
        setItem: vi.fn((key, value) => {
            store[key] = value.toString();
        }),
        removeItem: vi.fn((key) => {
            delete store[key];
        }),
        clear: vi.fn(() => {
            Object.keys(store).forEach(key => delete store[key]);
        }),
    };
};

export const createMockAuthToken = (rol = 'estudiante', token = 'mock-token') => ({
    state: {
        token,
        rol,
    },
});

export const setupAuthLocalStorage = (rol = 'estudiante', token = 'mock-token') => {
    localStorage.setItem('auth-token', JSON.stringify(createMockAuthToken(rol, token)));
};

export const clearAuthLocalStorage = () => {
    localStorage.removeItem('auth-token');
};

export const waitForLoadingToFinish = async (container) => {
    const { findByText, queryByText } = container;
    try {
        await findByText(/cargando/i, {}, { timeout: 100 });
        await waitFor(() => expect(queryByText(/cargando/i)).not.toBeInTheDocument());
    } catch {
        // Si no hay loading, continuar
    }
};
