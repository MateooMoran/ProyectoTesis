import { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import storeAuth from '../context/storeAuth';

export default function AuthCallback() {
  const navigate = useNavigate();
  const location = useLocation();
  const { setToken, setRol } = storeAuth();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const token = params.get("token");
    const rol = params.get("rol");

    if (token) {
      setToken(token);
      if (rol) setRol(rol);

      navigate('/dashboard', { replace: true });
    } else {
      navigate('/login', { replace: true });
    }
  }, [location.search, navigate, setToken, setRol]);

  return (
    <div className="flex justify-center items-center h-screen text-blue-700 font-semibold">
      Cargando autenticación...
    </div>
  );
}
