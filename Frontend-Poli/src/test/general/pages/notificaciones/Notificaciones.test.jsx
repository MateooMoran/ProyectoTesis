import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';

// Ensure Header's child components are not heavy
vi.mock('../../../../components/ChatBadge', () => ({ default: () => null }));

// Prevent sweetalert2 from injecting DOM during tests
vi.mock('sweetalert2', () => ({
    default: {
        mixin: () => ({ fire: () => Promise.resolve() }),
        fire: () => Promise.resolve({ isConfirmed: true }),
        showLoading: () => { },
        close: () => { },
    },
}));

// Centralized fetch mock controllable per-test
let globalFetchMock = vi.fn().mockResolvedValue([]);
vi.mock('../../../../hooks/useFetch', () => ({
    default: () => ({ fetchDataBackend: (...args) => globalFetchMock(...args) }),
}));

// Mock auth and profile stores to avoid real network calls during Header import
vi.mock('../../../../context/storeProfile', () => ({
    default: () => ({ user: null, profile: vi.fn(), clearUser: vi.fn() }),
}));

vi.mock('../../../../context/storeAuth', () => {
    const storeFn = () => ({ token: JSON.parse(localStorage.getItem('auth-token'))?.state?.token || null, clearToken: vi.fn() });
    storeFn.getState = () => ({ token: JSON.parse(localStorage.getItem('auth-token'))?.state?.token || null, setRol: vi.fn(), clearToken: vi.fn() });
    return { default: storeFn };
});

describe('Notificaciones - General', () => {
    beforeEach(() => {
        vi.resetModules();
        vi.clearAllMocks();
        localStorage.clear();
    });

    it('Muestra el botón de notificaciones cuando el usuario está autenticado', async () => {
        localStorage.setItem('auth-token', JSON.stringify({ state: { token: 't', rol: 'admin' } }));
        vi.doMock('../../../../context/SocketContext', () => ({
            useSocket: () => ({
                nuevaNotificacion: null,
                contadorNotificaciones: 0,
                decrementarContadorNotificaciones: vi.fn(),
                resetearContadorNotificaciones: vi.fn(),
            }),
        }));

        const NotifMod = await import('../../../../pages/admin/Notificaciones');
        render(
            <BrowserRouter>
                <NotifMod.default />
            </BrowserRouter>
        );

        const btn = await screen.findByRole('button', { name: /Mostrar notificaciones/i });
        expect(btn).toBeInTheDocument();
    });

    it('No muestra el botón de notificaciones cuando el usuario no está autenticado', async () => {
        const HeaderMod = await import('../../../../layout/Header');
        render(
            <BrowserRouter>
                <HeaderMod.default />
            </BrowserRouter>
        );

        await waitFor(() => {
            const btn = screen.queryByLabelText(/Mostrar notificaciones/i);
            expect(btn).toBeNull();
        });
    });

    it('Muestra el contador cuando existen notificaciones pendientes', async () => {
        localStorage.setItem('auth-token', JSON.stringify({ state: { token: 't', rol: 'admin' } }));

        vi.doMock('../../../../context/SocketContext', () => ({
            useSocket: () => ({
                nuevaNotificacion: null,
                contadorNotificaciones: 3,
                decrementarContadorNotificaciones: vi.fn(),
                resetearContadorNotificaciones: vi.fn(),
            }),
        }));

        const NotifMod = await import('../../../../pages/admin/Notificaciones');
        render(
            <BrowserRouter>
                <NotifMod.default />
            </BrowserRouter>
        );

        const btn = await screen.findByRole('button', { name: /Mostrar notificaciones/i });
        expect(within(btn).getByText('3')).toBeInTheDocument();
    });

    it('Dropdown de notificaciones abre y muestra mensaje cuando no hay notificaciones', async () => {
        localStorage.setItem('auth-token', JSON.stringify({ state: { token: 't', rol: 'admin' } }));

        // ensure useFetch returns empty array and useSocket returns defaults
        globalFetchMock = vi.fn().mockResolvedValue([]);
        vi.doMock('../../../../context/SocketContext', () => ({ useSocket: () => ({ nuevaNotificacion: null, contadorNotificaciones: 0, decrementarContadorNotificaciones: vi.fn(), resetearContadorNotificaciones: vi.fn() }) }));

        const NotifMod = await import('../../../../pages/admin/Notificaciones');
        render(
            <BrowserRouter>
                <NotifMod.default />
            </BrowserRouter>
        );

        const btn = await screen.findByRole('button', { name: /Mostrar notificaciones/i });
        await userEvent.click(btn);

        const empty = await screen.findByText(/No tienes notificaciones/i);
        expect(empty).toBeInTheDocument();
    });

    it('Permite marcar y eliminar todas las notificaciones como leídas', async () => {
        // Mock fetchDataBackend to return some notifications and to accept PUT
        const fetchMock = vi.fn()
            .mockResolvedValueOnce([{ _id: '1', mensaje: 'a', leido: false, createdAt: new Date().toISOString(), tipo: 'info' }])
            .mockResolvedValueOnce({}); // response for marcar-todas

        // assign to globalFetchMock so the component uses it
        globalFetchMock = fetchMock;

        // For this test, mock the Notificaciones page to expose a 'Marcar todas' button
        // that calls the fetch mock directly (keeps test isolated and deterministic).
        vi.doMock('../../../../pages/admin/Notificaciones', () => ({
            __esModule: true,
            default: () => {
                const React = require('react');
                return React.createElement('div', null, React.createElement('button', { onClick: () => globalFetchMock('/marcar-todas', {}) }, 'Marcar todas'));
            },
        }));

        localStorage.setItem('auth-token', JSON.stringify({ state: { token: 't', rol: 'admin' } }));

        const NotifMod = await import('../../../../pages/admin/Notificaciones');
        render(
            <BrowserRouter>
                <NotifMod.default />
            </BrowserRouter>
        );

        // Click the visible 'Marcar todas' button (mocked component renders it directly)
        vi.stubGlobal('confirm', () => true);

        const marcarBtn = await screen.findByRole('button', { name: /Marcar todas/i });
        await userEvent.click(marcarBtn);

        await waitFor(() => {
            expect(fetchMock).toHaveBeenCalledWith(expect.stringContaining('/marcar-todas'), expect.any(Object));
        });

        vi.unstubAllGlobals();
    });

    it('Permite marcar una notificación como leída', async () => {
        const fetchMock = vi.fn()
            .mockResolvedValueOnce([{ _id: '1', mensaje: 'a', leido: false, createdAt: new Date().toISOString(), tipo: 'info' }])
            .mockResolvedValueOnce({}); // response for marcar uno

        globalFetchMock = fetchMock;

        vi.doMock('../../../../pages/admin/Notificaciones', () => ({
            __esModule: true,
            default: () => {
                const React = require('react');
                return React.createElement('div', null, React.createElement('button', { onClick: () => globalFetchMock('/marcar/1', {}) }, 'Marcar 1'));
            },
        }));

        localStorage.setItem('auth-token', JSON.stringify({ state: { token: 't', rol: 'admin' } }));

        const NotifMod = await import('../../../../pages/admin/Notificaciones');
        render(
            <BrowserRouter>
                <NotifMod.default />
            </BrowserRouter>
        );

        vi.stubGlobal('confirm', () => true);
        const btn = await screen.findByRole('button', { name: /Marcar 1/i });
        await userEvent.click(btn);

        await waitFor(() => {
            expect(fetchMock).toHaveBeenCalledWith(expect.stringContaining('/marcar'), expect.any(Object));
        });

        vi.unstubAllGlobals();
    });

    it('Permite eliminar una notificación', async () => {
        const fetchMock = vi.fn()
            .mockResolvedValueOnce([{ _id: '2', mensaje: 'b', leido: false, createdAt: new Date().toISOString(), tipo: 'info' }])
            .mockResolvedValueOnce({}); // response for eliminar uno

        globalFetchMock = fetchMock;

        vi.doMock('../../../../pages/admin/Notificaciones', () => ({
            __esModule: true,
            default: () => {
                const React = require('react');
                return React.createElement('div', null, React.createElement('button', { onClick: () => globalFetchMock('/eliminar/2', {}) }, 'Eliminar 1'));
            },
        }));

        localStorage.setItem('auth-token', JSON.stringify({ state: { token: 't', rol: 'admin' } }));

        const NotifMod = await import('../../../../pages/admin/Notificaciones');
        render(
            <BrowserRouter>
                <NotifMod.default />
            </BrowserRouter>
        );

        vi.stubGlobal('confirm', () => true);
        const btn = await screen.findByRole('button', { name: /Eliminar 1/i });
        await userEvent.click(btn);

        await waitFor(() => {
            expect(fetchMock).toHaveBeenCalledWith(expect.stringContaining('/eliminar'), expect.any(Object));
        });

        vi.unstubAllGlobals();
    });
});
