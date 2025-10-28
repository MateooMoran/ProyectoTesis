import { Navigate, Outlet } from "react-router";
import storeAuth from "../context/storeAuth";

const ProtectedRoute = () => {
    const token = storeAuth((state) => state.token);
    return token ? <Outlet /> : <Navigate to="/" replace />;
};

export default ProtectedRoute;