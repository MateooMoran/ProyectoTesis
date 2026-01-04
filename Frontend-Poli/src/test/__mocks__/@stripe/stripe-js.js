import { vi } from 'vitest';

export const mockLoadStripe = vi.fn(() =>
    Promise.resolve({
        elements: vi.fn(() => ({
            create: vi.fn(() => ({
                mount: vi.fn(),
                destroy: vi.fn(),
                on: vi.fn(),
                update: vi.fn(),
            })),
            getElement: vi.fn(),
        })),
        confirmCardPayment: vi.fn(() =>
            Promise.resolve({
                paymentIntent: { id: 'pi_mock', status: 'succeeded' },
            })
        ),
        createPaymentMethod: vi.fn(() =>
            Promise.resolve({
                paymentMethod: { id: 'pm_mock' },
            })
        ),
    })
);

export const loadStripe = mockLoadStripe;

export default { loadStripe };
