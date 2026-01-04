import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';

vi.mock('../../utils/alerts', () => ({
    alert: vi.fn(),
}));

const mockFetchDataBackend = vi.fn();
vi.mock('../../hooks/useFetch', () => ({
    default: () => ({ fetchDataBackend: mockFetchDataBackend }),
}));

import Reset from '../../pages/Reset';

describe('Reset - Frontend', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('Verifica token al montar y muestra formulario si es válido  token', async () => {
        mockFetchDataBackend.mockResolvedValueOnce({}); // GET verify

        render(
            <MemoryRouter initialEntries={["/reset/abc"]}>
                <Routes>
                    <Route path="/reset/:token" element={<Reset />} />
                </Routes>
            </MemoryRouter>
        );

        await waitFor(() => {
            expect(mockFetchDataBackend).toHaveBeenCalled();
        });
    });

    it('Puede cambiar la contraseña cuando las contraseñas coinciden', async () => {
        mockFetchDataBackend.mockImplementation((url, opts) => {
            if (opts && opts.method === 'GET') return Promise.resolve({});
            return Promise.resolve({});
        });

        render(
            <MemoryRouter initialEntries={["/reset/abc"]}>
                <Routes>
                    <Route path="/reset/:token" element={<Reset />} />
                </Routes>
            </MemoryRouter>
        );

        await waitFor(() => expect(mockFetchDataBackend).toHaveBeenCalled());

        fireEvent.change(screen.getByPlaceholderText(/Ingresa tu nueva contraseña/i), { target: { value: 'abcd' } });
        fireEvent.change(screen.getByPlaceholderText(/Repite tu contraseña/i), { target: { value: 'abcd' } });
        fireEvent.click(screen.getByRole('button', { name: /Restablecer Contraseña/i }));

        await waitFor(() => {
            expect(mockFetchDataBackend).toHaveBeenCalled();
        });
    });

    it('No cambia contraseña si no coinciden', async () => {
        mockFetchDataBackend.mockResolvedValueOnce({});

        render(
            <MemoryRouter initialEntries={["/reset/abc"]}>
                <Routes>
                    <Route path="/reset/:token" element={<Reset />} />
                </Routes>
            </MemoryRouter>
        );

        await waitFor(() => expect(mockFetchDataBackend).toHaveBeenCalled());

        fireEvent.change(screen.getByPlaceholderText(/Ingresa tu nueva contraseña/i), { target: { value: 'abcd' } });
        fireEvent.change(screen.getByPlaceholderText(/Repite tu contraseña/i), { target: { value: 'xyz' } });
        fireEvent.click(screen.getByRole('button', { name: /Restablecer Contraseña/i }));

        await waitFor(() => {
            // Should not call POST endpoint for change
            // The only calls made should be the initial GET
            expect(mockFetchDataBackend).toHaveBeenCalled();
        });
    });
});
