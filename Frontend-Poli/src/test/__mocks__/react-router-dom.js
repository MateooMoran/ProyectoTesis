import { vi } from 'vitest';

export const mockNavigate = vi.fn();
export const mockUseNavigate = vi.fn(() => mockNavigate);

export const mockUseParams = vi.fn(() => ({}));
export const mockUseLocation = vi.fn(() => ({
    pathname: '/',
    search: '',
    hash: '',
    state: null,
}));

export const mockUseSearchParams = vi.fn(() => [new URLSearchParams(), vi.fn()]);

export const Link = ({ children, to, ...props }) => (
    <a href={to} {...props}>
        {children}
    </a>
);

export const Navigate = ({ to }) => null;
export const Outlet = () => <div>Outlet</div>;
export const BrowserRouter = ({ children }) => <div>{children}</div>;
export const Routes = ({ children }) => <div>{children}</div>;
export const Route = () => null;

export default {
    useNavigate: mockUseNavigate,
    useParams: mockUseParams,
    useLocation: mockUseLocation,
    useSearchParams: mockUseSearchParams,
    Link,
    Navigate,
    Outlet,
    BrowserRouter,
    Routes,
    Route,
};
