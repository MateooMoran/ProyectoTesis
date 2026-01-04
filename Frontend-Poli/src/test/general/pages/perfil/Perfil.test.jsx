import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

const mockProfileFn = vi.fn();
const mockUpdateProfile = vi.fn();
const mockUpdatePassword = vi.fn();
const mockClearUser = vi.fn();

vi.mock('../../../../context/storeProfile', () => ({
    default: () => ({
        user: { _id: '1', nombre: 'Juan', apellido: 'Perez', email: 'juan@test.com', direccion: 'Calle 1', telefono: '099999' },
        profile: mockProfileFn,
        updateProfile: mockUpdateProfile,
        updatePasswordProfile: mockUpdatePassword,
        clearUser: mockClearUser,
    }),
}));

vi.mock('../../../../context/storeAuth', () => ({
    default: () => ({ token: 'mock-token', rol: 'estudiante', clearToken: vi.fn() }),
}));

vi.mock('../../../../layout/Header', () => ({ default: () => null }));
vi.mock('../../../../layout/Footer', () => ({ default: () => null }));

vi.mock('../../../../utils/alerts', () => ({ toast: vi.fn() }));
import * as alertsModule from '../../../../utils/alerts';

import Perfil from '../../../../pages/Perfil';

describe('Página Perfil de Usuario', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        mockProfileFn.mockResolvedValue();
        mockUpdateProfile.mockResolvedValue();
        mockUpdatePassword.mockResolvedValue();
        localStorage.setItem(
            'auth-token',
            JSON.stringify({ state: { token: 'mock-token', rol: 'estudiante' } })
        );
    });

    it('Renderiza la información personal del usuario correctamente', async () => {
        render(
            <MemoryRouter>
                <Perfil />
            </MemoryRouter>
        );

        await waitFor(() => expect(screen.getByText(/Perfil de Usuario/i)).toBeInTheDocument());
        expect(screen.getAllByText(/Juan/i).length).toBeGreaterThan(0);
        expect(screen.getAllByText(/Perez/i).length).toBeGreaterThan(0);
        expect(screen.getAllByText(/juan@test.com/i).length).toBeGreaterThan(0);
    });

    it('Permite editar los datos del perfil y ejecuta updateProfile', async () => {
        render(
            <MemoryRouter>
                <Perfil />
            </MemoryRouter>
        );

        await waitFor(() =>
            expect(document.querySelector('input[name="nombre"]')).toBeInTheDocument()
        );

        const nombreInput = document.querySelector('input[name="nombre"]');
        const apellidoInput = document.querySelector('input[name="apellido"]');

        fireEvent.change(nombreInput, { target: { value: 'Pedro' } });
        fireEvent.change(apellidoInput, { target: { value: 'Gonzales' } });

        fireEvent.click(screen.getByRole('button', { name: /Guardar Cambios/i }));

        await waitFor(() => {
            expect(mockUpdateProfile).toHaveBeenCalled();
            const calledWith = mockUpdateProfile.mock.calls[0][0];
            expect(calledWith).toEqual(
                expect.objectContaining({ nombre: 'Pedro', apellido: 'Gonzales' })
            );
        });
    });

    it('Actualiza la contraseña cuando las nuevas contraseñas coinciden', async () => {
        render(
            <MemoryRouter>
                <Perfil />
            </MemoryRouter>
        );

        await waitFor(() => {
            const pwInputs = document.querySelectorAll('input[type="password"]');
            expect(pwInputs.length).toBeGreaterThanOrEqual(3);

            fireEvent.change(pwInputs[0], { target: { value: 'oldpass' } });
            fireEvent.change(pwInputs[1], { target: { value: 'newpass' } });
            fireEvent.change(pwInputs[2], { target: { value: 'newpass' } });

            fireEvent.click(screen.getByRole('button', { name: /Actualizar/i }));
        });

        await waitFor(() => {
            expect(mockUpdatePassword).toHaveBeenCalled();
            expect(mockUpdatePassword.mock.calls[0][0]).toEqual(
                expect.objectContaining({
                    passwordactual: 'oldpass',
                    passwordnuevo: 'newpass',
                })
            );
        });
    });

    it('No actualiza la contraseña cuando las confirmaciones no coinciden', async () => {
        render(
            <MemoryRouter>
                <Perfil />
            </MemoryRouter>
        );

        await waitFor(() => {
            const pwInputs = document.querySelectorAll('input[type="password"]');
            expect(pwInputs.length).toBeGreaterThanOrEqual(3);

            fireEvent.change(pwInputs[0], { target: { value: 'oldpass' } });
            fireEvent.change(pwInputs[1], { target: { value: 'a' } });
            fireEvent.change(pwInputs[2], { target: { value: 'b' } });

            fireEvent.click(screen.getByRole('button', { name: /Actualizar/i }));
        });

        await waitFor(() => {
            expect(mockUpdatePassword).not.toHaveBeenCalled();
        });
    });

    it('Muestra el mensaje de carga mientras el perfil está cargando', async () => {
        mockProfileFn.mockImplementation(() => new Promise(() => {}));

        render(
            <MemoryRouter>
                <Perfil />
            </MemoryRouter>
        );

        expect(screen.getByText(/Cargando perfil/i)).toBeInTheDocument();
    });

    it('Maneja errores al actualizar el perfil sin romper la aplicación', async () => {
        mockUpdateProfile.mockRejectedValueOnce(new Error('Error update'));

        render(
            <MemoryRouter>
                <Perfil />
            </MemoryRouter>
        );

        await waitFor(() =>
            expect(document.querySelector('input[name="nombre"]')).toBeInTheDocument()
        );

        fireEvent.change(document.querySelector('input[name="nombre"]'), {
            target: { value: 'ErrorUser' },
        });

        fireEvent.click(screen.getByRole('button', { name: /Guardar Cambios/i }));

        await waitFor(() => {
            expect(mockUpdateProfile).toHaveBeenCalled();
        });
    });
});
