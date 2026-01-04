import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

import Forgot from '../../pages/Forgot';

vi.mock('../../utils/alerts', () => ({
    toast: vi.fn(),
}));

const mockFetchDataBackend = vi.fn();
vi.mock('../../hooks/useFetch', () => ({
    default: () => ({ fetchDataBackend: mockFetchDataBackend }),
}));

describe('Forgot - Frontend', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        localStorage.clear();
    });

    it('Renderiza el formulario de correo', () => {
        render(
            <MemoryRouter>
                <Forgot />
            </MemoryRouter>
        );

        expect(screen.getByPlaceholderText(/Ingresa un correo electrónico válido/i)).toBeTruthy();
        expect(screen.getByText(/Enviar correo/i)).toBeTruthy();
    });

    it('Envía correo y llama a fetchDataBackend', async () => {
        mockFetchDataBackend.mockResolvedValueOnce({ msg: 'OK' });

        render(
            <MemoryRouter>
                <Forgot />
            </MemoryRouter>
        );

        fireEvent.change(screen.getByPlaceholderText(/Ingresa un correo electrónico válido/i), { target: { value: 'test@x.com' } });
        fireEvent.click(screen.getByText(/Enviar correo/i));

        await waitFor(() => {
            expect(mockFetchDataBackend).toHaveBeenCalled();
        });
    });

    it('No envía si correo vacío', async () => {
        render(
            <MemoryRouter>
                <Forgot />
            </MemoryRouter>
        );

        fireEvent.click(screen.getByText(/Enviar correo/i));

        await waitFor(() => {
            expect(mockFetchDataBackend).not.toHaveBeenCalled();
        });
    });

    it('Manejo de error en petición', async () => {
        mockFetchDataBackend.mockRejectedValueOnce(new Error('Error'));

        render(
            <MemoryRouter>
                <Forgot />
            </MemoryRouter>
        );

        fireEvent.change(screen.getByPlaceholderText(/Ingresa un correo electrónico válido/i), { target: { value: 'ok@x.com' } });
        fireEvent.click(screen.getByText(/Enviar correo/i));

        await waitFor(() => {
            expect(mockFetchDataBackend).toHaveBeenCalled();
        });
    });
});
