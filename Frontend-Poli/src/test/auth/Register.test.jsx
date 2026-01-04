import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

// Mock SweetAlert2 (and avoid its CSS loader)
vi.mock('sweetalert2', () => ({
    fire: vi.fn(),
    mixin: () => ({ fire: vi.fn() }),
}));
vi.mock('sweetalert2/dist/sweetalert2.min.css', () => ({}));

// Mock alerts util
vi.mock('../../utils/alerts', () => ({
    alert: vi.fn(),
}));

// Mock axios default export
vi.mock('axios', () => ({ default: { post: vi.fn(() => Promise.resolve({ data: { msg: 'Registrado' } })) } }));

import axiosModule from 'axios';
import * as alertsModule from '../../utils/alerts';
import Register from '../../pages/Register';

describe('Register - Frontend', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        localStorage.clear();
    });

    it('Renderiza formulario y la imagen de fondo', () => {
        const { container } = render(
            <MemoryRouter>
                <Register />
            </MemoryRouter>
        );

        expect(screen.getByPlaceholderText(/Ingresa tu nombre/i)).toBeInTheDocument();
        expect(screen.getByPlaceholderText(/Ingresa tu correo/i)).toBeInTheDocument();
        expect(screen.getByText(/Registrarse/i)).toBeInTheDocument();
        // Verificar que la clase/url de la imagen de fondo está presente en el HTML
        expect(container.innerHTML).toContain('imgRegister.jpg');
    });

    it('Registro exitoso llama a axios.post', async () => {
        render(
            <MemoryRouter>
                <Register />
            </MemoryRouter>
        );

        fireEvent.change(screen.getByPlaceholderText(/Ingresa tu nombre/i), { target: { value: 'Juan' } });
        fireEvent.change(screen.getByPlaceholderText(/Ingresa tu apellido/i), { target: { value: 'Perez' } });
        fireEvent.change(screen.getByPlaceholderText(/Ingresa tu número de teléfono/i), { target: { value: '0999999999' } });
        fireEvent.change(screen.getByPlaceholderText(/Ingresa tu dirección/i), { target: { value: 'Calle 1' } });
        fireEvent.change(screen.getByPlaceholderText(/Ingresa tu correo/i), { target: { value: 'juan@test.com' } });
        fireEvent.change(screen.getByPlaceholderText(/\*{5,}/), { target: { value: 'pass1234' } });

        fireEvent.click(screen.getByText(/Registrarse/i));

        await waitFor(() => {
            const postFn = axiosModule?.default?.post || axiosModule.post;
            expect(postFn).toHaveBeenCalledTimes(1);
        });
    });

    it('Muestra la alerta con el mensaje del backend al registrarse', async () => {
        render(
            <MemoryRouter>
                <Register />
            </MemoryRouter>
        );

        fireEvent.change(screen.getByPlaceholderText(/Ingresa tu nombre/i), { target: { value: 'Juan' } });
        fireEvent.change(screen.getByPlaceholderText(/Ingresa tu apellido/i), { target: { value: 'Perez' } });
        fireEvent.change(screen.getByPlaceholderText(/Ingresa tu número de teléfono/i), { target: { value: '0999999999' } });
        fireEvent.change(screen.getByPlaceholderText(/Ingresa tu dirección/i), { target: { value: 'Calle 1' } });
        fireEvent.change(screen.getByPlaceholderText(/Ingresa tu correo/i), { target: { value: 'juan@test.com' } });
        fireEvent.change(screen.getByPlaceholderText(/\*{5,}/), { target: { value: 'pass1234' } });

        fireEvent.click(screen.getByText(/Registrarse/i));

        await waitFor(() => {
            expect(alertsModule.alert).toHaveBeenCalledWith(expect.objectContaining({ title: 'Registrado' }));
        });
    });

    it('No envía si faltan campos obligatorios', async () => {
        render(
            <MemoryRouter>
                <Register />
            </MemoryRouter>
        );

        fireEvent.click(screen.getByText(/Registrarse/i));

        await waitFor(() => {
            const postFn = axiosModule?.default?.post || axiosModule.post;
            expect(postFn).not.toHaveBeenCalled();
            expect(alertsModule.alert).not.toHaveBeenCalled();
        });
    });
});
