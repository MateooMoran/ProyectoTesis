import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import storeAuth from '../context/storeAuth';

const AuthCallback = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { setToken, setRol } = storeAuth();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const token = params.get('token');
    const rol = params.get('rol');

    if (token && rol) {
      setToken(token);
      setRol(rol);
      navigate('/dashboard');
    } else {
      navigate('/login');
    }
  }, [navigate, setToken, setRol, location.search]);

  return <div className="text-center text-gray-700">Procesando autenticación...</div>;
};

export default AuthCallback;