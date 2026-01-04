import { vi } from 'vitest';

export const Elements = ({ children }) => <div data-testid="stripe-elements">{children}</div>;
export const CardElement = () => <div data-testid="card-element">Card Element</div>;
export const useStripe = vi.fn(() => ({
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
}));

export const useElements = vi.fn(() => ({
    getElement: vi.fn(() => ({})),
}));

export default {
    Elements,
    CardElement,
    useStripe,
    useElements,
};
