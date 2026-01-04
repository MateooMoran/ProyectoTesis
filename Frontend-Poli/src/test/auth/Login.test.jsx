import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';


vi.mock('../../utils/alerts', () => ({
    alert: vi.fn(),
}));

const mockFetchDataBackend = vi.fn();
vi.mock('../../hooks/useFetch', () => ({
    default: () => ({ fetchDataBackend: mockFetchDataBackend }),
}));

const mockSetToken = vi.fn();
const mockSetRol = vi.fn();
vi.mock('../../context/storeAuth', () => ({
    default: () => ({ setToken: mockSetToken, setRol: mockSetRol }),
}));

import Login from '../../pages/Login';

describe('Login - Frontend', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        localStorage.clear();
    });

    it('Renderiza inputs y botones', () => {
        render(
            <MemoryRouter>
                <Login />
            </MemoryRouter>
        );

        expect(screen.getByPlaceholderText(/Ingresa tu correo/i)).toBeTruthy();
        expect(screen.getByPlaceholderText(/Ingresa tu contraseña/i)).toBeTruthy();
    });

    it('Login exitoso guarda token y rol', async () => {
        mockFetchDataBackend.mockResolvedValueOnce({ token: 'tkn', rol: 'estudiante' });

        render(
            <MemoryRouter>
                <Login />
            </MemoryRouter>
        );

        fireEvent.change(screen.getByPlaceholderText(/Ingresa tu correo/i), { target: { value: 'juan@test.com' } });
        fireEvent.change(screen.getByPlaceholderText(/Ingresa tu contraseña/i), { target: { value: 'pass123' } });
        fireEvent.click(screen.getByRole('button', { name: /^Iniciar sesión$/i }));

        await waitFor(() => {
            expect(mockFetchDataBackend).toHaveBeenCalled();
            expect(mockSetToken).toHaveBeenCalledWith('tkn');
            expect(mockSetRol).toHaveBeenCalledWith('estudiante');
        });
    });

    it('Muestra estado de carga mientras ocurre la petición', async () => {
        mockFetchDataBackend.mockImplementation(() => new Promise(() => { }));

        render(
            <MemoryRouter>
                <Login />
            </MemoryRouter>
        );

        fireEvent.change(screen.getByPlaceholderText(/Ingresa tu correo/i), { target: { value: 'juan@test.com' } });
        fireEvent.change(screen.getByPlaceholderText(/Ingresa tu contraseña/i), { target: { value: 'pass123' } });
        fireEvent.click(screen.getByRole('button', { name: /^Iniciar sesión$/i }));

        await waitFor(() => {
            expect(screen.getByText(/Iniciando.../i)).toBeTruthy();
        });
    });

    it('Manejo de error de login (respuesta sin token)', async () => {
        mockFetchDataBackend.mockResolvedValueOnce({ msg: 'Credenciales inválidas' });

        render(
            <MemoryRouter>
                <Login />
            </MemoryRouter>
        );

        fireEvent.change(screen.getByPlaceholderText(/Ingresa tu correo/i), { target: { value: 'juan@test.com' } });
        fireEvent.change(screen.getByPlaceholderText(/Ingresa tu contraseña/i), { target: { value: 'wrong' } });
        fireEvent.click(screen.getByRole('button', { name: /^Iniciar sesión$/i }));

        await waitFor(() => {
            expect(mockFetchDataBackend).toHaveBeenCalled();
            expect(mockSetToken).not.toHaveBeenCalled();
        });
    });
});
