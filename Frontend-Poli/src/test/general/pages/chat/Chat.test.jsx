import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';

// Mock socket context and auth store
vi.mock('../../../../context/SocketContext', () => ({
    useSocket: () => ({
        socket: { emit: vi.fn(), on: vi.fn(), off: vi.fn(), connected: true },
        resetearContador: vi.fn(),
        conversacionRestaurada: false,
    }),
}));

vi.mock('../../../../context/storeAuth', () => {
    const fn = () => ({ token: 't' });
    fn.getState = () => ({ token: 't' });
    return { default: fn };
});

describe('ChatPage - General', () => {
    let fetchMock;

    beforeEach(() => {
        vi.resetModules();
        vi.clearAllMocks();

        // Generic fetch mock routing by url
        fetchMock = vi.fn((url, opts) => {
            if (url.includes('/buscar')) {
                return Promise.resolve({ ok: true, json: async () => [{ _id: 'u1', nombre: 'Juan', apellido: 'Perez', rol: 'estudiante', email: 'j@p.com' }] });
            }
            if (url.includes('/conversaciones')) {
                return Promise.resolve({ ok: true, json: async () => [{ conversacionId: 'c1', otroMiembro: { _id: 'u1', nombre: 'Juan', apellido: 'Perez' }, ultimoMensaje: { contenido: 'hola' }, mensajesNoLeidos: 0 }] });
            }
            if (url.includes('/mensajes')) {
                return Promise.resolve({ ok: true, json: async () => ({ mensajes: [{ _id: 'm1', contenido: 'hello', emisor: { _id: 'me' }, tipo: 'texto', createdAt: new Date().toISOString() }] }) });
            }
            if (url.includes('/conversacion') && opts?.method === 'POST') {
                return Promise.resolve({ ok: true, json: async () => ({ _id: 'c-new', conversacionId: 'c-new' }) });
            }
            if (url.includes('/conversacion') && opts?.method === 'DELETE') {
                return Promise.resolve({ ok: true, json: async () => ({}) });
            }
            // fallback
            return Promise.resolve({ ok: true, json: async () => ({}) });
        });

        vi.stubGlobal('fetch', fetchMock);
    });

    it('Renderiza el header Mensajes', async () => {
        const ChatMod = await import('../../../../pages/ChatPage');
        render(
            <BrowserRouter>
                <ChatMod.default />
            </BrowserRouter>
        );

        expect(await screen.findByText(/Mensajes/i)).toBeInTheDocument();
    });

    it('Buscar muestra resultados cuando se escribe en el input', async () => {
        const ChatMod = await import('../../../../pages/ChatPage');
        render(
            <BrowserRouter>
                <ChatMod.default />
            </BrowserRouter>
        );

        const input = screen.getByPlaceholderText(/Buscar contactos.../i);
        await userEvent.type(input, 'Juan');

        const results = await screen.findAllByText(/Juan Perez/i);
        // first occurrence is the search result
        expect(results[0]).toBeInTheDocument();
    });

    it('Permite crear o abrir una conversación desde la búsqueda', async () => {
        const ChatMod = await import('../../../../pages/ChatPage');
        render(
            <BrowserRouter>
                <ChatMod.default />
            </BrowserRouter>
        );

        const input = screen.getByPlaceholderText(/Buscar contactos.../i);
        await userEvent.type(input, 'Juan');

        const all = await screen.findAllByText(/Juan Perez/i);
        const result = all[0];
        await userEvent.click(result);

        // crearOAbrirConversacion hace POST a /conversacion
        await waitFor(() => expect(fetchMock).toHaveBeenCalledWith(expect.stringContaining('/conversacion'), expect.any(Object)));
    });

    it('Carga conversaciones en mount y muestra elemento de lista', async () => {
        const ChatMod = await import('../../../../pages/ChatPage');
        render(
            <BrowserRouter>
                <ChatMod.default />
            </BrowserRouter>
        );

        // fetch to /conversaciones should have been called
        await waitFor(() => expect(fetchMock).toHaveBeenCalledWith(expect.stringContaining('/conversaciones'), expect.any(Object)));

        expect(await screen.findByText(/Juan Perez/i)).toBeInTheDocument();
    });

    it('Permite enviar un mensaje en una conversación', async () => {
        // Provide a socket spy via the mocked context module
        const socket = { emit: vi.fn(), on: vi.fn(), off: vi.fn(), connected: true };
        vi.doMock('../../../../context/SocketContext', () => ({ useSocket: () => ({ socket, resetearContador: vi.fn(), conversacionRestaurada: false }) }));

        const ChatMod = await import('../../../../pages/ChatPage');
        render(
            <BrowserRouter>
                <ChatMod.default />
            </BrowserRouter>
        );

        // Click the existing conversation to load mensajes (second occurrence)
        const all = await screen.findAllByText(/Juan Perez/i);
        const conv = all.length > 1 ? all[1] : all[0];
        await userEvent.click(conv);

        // Type a message and click send
        const input = await screen.findByPlaceholderText(/Escribe un mensaje.../i);
        await userEvent.type(input, 'hola test');
        const buttons = screen.getAllByRole('button');
        const sendBtn = buttons[buttons.length - 1];
        await userEvent.click(sendBtn);

        // socket.emit called with enviar-mensaje
        await waitFor(() => expect(socket.emit).toHaveBeenCalledWith('enviar-mensaje', expect.objectContaining({ contenido: 'hola test' })));
    });

    it('Permite eliminar un mensaje de la conversación', async () => {
        const socket = { emit: vi.fn(), on: vi.fn(), off: vi.fn(), connected: true };
        vi.doMock('../../../../context/SocketContext', () => ({ useSocket: () => ({ socket, resetearContador: vi.fn(), conversacionRestaurada: false }) }));

        const ChatMod = await import('../../../../pages/ChatPage');
        render(
            <BrowserRouter>
                <ChatMod.default />
            </BrowserRouter>
        );

        const conv = await screen.findByText(/Juan Perez/i);
        await userEvent.click(conv);

        // mensaje 'hello' should be present
        const msg = await screen.findByText(/hello/i);
        // delete button is sibling in parent container
        const parent = msg.closest('div')?.parentElement;
        const delBtn = parent?.querySelector('button');
        expect(delBtn).toBeTruthy();
        await userEvent.click(delBtn);

        await waitFor(() => expect(socket.emit).toHaveBeenCalledWith('eliminar-mensaje', expect.objectContaining({ mensajeId: expect.any(String) })));
    });

    it('Permite eliminar una conversación', async () => {
        const ChatMod = await import('../../../../pages/ChatPage');
        render(
            <BrowserRouter>
                <ChatMod.default />
            </BrowserRouter>
        );

        const allNames = await screen.findAllByText(/Juan Perez/i);
        let containerWithButton;
        for (const el of allNames) {
            let node = el;
            while (node && node !== document.body) {
                if (node.querySelector && node.querySelector('button')) {
                    containerWithButton = node;
                    break;
                }
                node = node.parentElement;
            }
            if (containerWithButton) break;
        }

        expect(containerWithButton).toBeTruthy();
        const del = containerWithButton.querySelector('button');
        expect(del).toBeTruthy();
        await userEvent.click(del);

        await waitFor(() => expect(fetchMock).toHaveBeenCalledWith(expect.stringContaining('/conversacion/'), expect.objectContaining({ method: 'DELETE' })));
    });
});
