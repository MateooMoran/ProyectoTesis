import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import useFetch from '../../../hooks/useFetch';
import axios from 'axios';

vi.mock('axios');

describe('useFetch', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('Realiza una solicitud POST exitosa', async () => {
        const mockResponse = { data: { msg: 'Éxito', datos: { id: 1 } } };
        axios.post = vi.fn().mockResolvedValue(mockResponse);

        const { result } = renderHook(() => useFetch());

        const response = await result.current.fetchDataBackend('http://localhost:3000/test', {
            nombre: 'Test',
        });

        expect(axios.post).toHaveBeenCalledWith('http://localhost:3000/test', { nombre: 'Test' }, {});
        expect(response).toEqual(mockResponse.data);
    });

    it('Realiza una solicitud GET exitosa', async () => {
        const mockResponse = { data: { msg: 'Éxito', datos: [1, 2, 3] } };
        axios.get = vi.fn().mockResolvedValue(mockResponse);

        const { result } = renderHook(() => useFetch());

        const response = await result.current.fetchDataBackend('http://localhost:3000/test', {
            method: 'GET',
        });

        expect(axios.get).toHaveBeenCalledWith('http://localhost:3000/test', {});
        expect(response).toEqual(mockResponse.data);
    });

    it('Realiza una solicitud PUT exitosa', async () => {
        const mockResponse = { data: { msg: 'Actualizado' } };
        axios.put = vi.fn().mockResolvedValue(mockResponse);

        const { result } = renderHook(() => useFetch());

        const response = await result.current.fetchDataBackend('http://localhost:3000/test/1', {
            method: 'PUT',
            body: { nombre: 'Actualizado' },
        });

        expect(axios.put).toHaveBeenCalledWith('http://localhost:3000/test/1', { nombre: 'Actualizado' }, {});
        expect(response).toEqual(mockResponse.data);
    });

    it('Realiza una solicitud DELETE exitosa', async () => {
        const mockResponse = { data: { msg: 'Eliminado' } };
        axios.delete = vi.fn().mockResolvedValue(mockResponse);

        const { result } = renderHook(() => useFetch());

        const response = await result.current.fetchDataBackend('http://localhost:3000/test/1', {
            method: 'DELETE',
        });

        expect(axios.delete).toHaveBeenCalledWith('http://localhost:3000/test/1', {});
        expect(response).toEqual(mockResponse.data);
    });

    it('Maneja errores con un mensaje único', async () => {
        const errorResponse = {
            response: {
                data: {
                    msg: 'Error del servidor',
                },
            },
        };
        axios.post = vi.fn().mockRejectedValue(errorResponse);

        const { result } = renderHook(() => useFetch());

        await expect(
            result.current.fetchDataBackend('http://localhost:3000/test', { nombre: 'Test' })
        ).rejects.toThrow('Error del servidor');
    });

    it('Maneja errores con múltiples mensajes', async () => {
        const errorResponse = {
            response: {
                data: {
                    errores: [{ msg: 'Error 1' }, { msg: 'Error 2' }],
                },
            },
        };
        axios.post = vi.fn().mockRejectedValue(errorResponse);

        const { result } = renderHook(() => useFetch());

        await expect(
            result.current.fetchDataBackend('http://localhost:3000/test', { nombre: 'Test' })
        ).rejects.toThrow('Errores en el formulario');
    });

    it('Maneja errores sin mensaje', async () => {
        const errorResponse = {
            response: {},
        };
        axios.post = vi.fn().mockRejectedValue(errorResponse);

        const { result } = renderHook(() => useFetch());

        await expect(
            result.current.fetchDataBackend('http://localhost:3000/test', { nombre: 'Test' })
        ).rejects.toThrow('Error desconocido');
    });

    it('Incluye headers en la configuración', async () => {
        const mockResponse = { data: { msg: 'Éxito' } };
        axios.get = vi.fn().mockResolvedValue(mockResponse);

        const { result } = renderHook(() => useFetch());

        await result.current.fetchDataBackend('http://localhost:3000/test', {
            method: 'GET',
            config: {
                headers: {
                    Authorization: 'Bearer token123',
                },
            },
        });

        expect(axios.get).toHaveBeenCalledWith('http://localhost:3000/test', {
            headers: {
                Authorization: 'Bearer token123',
            },
        });
    });
});
