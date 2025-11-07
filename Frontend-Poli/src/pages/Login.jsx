import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import useFetch from "../hooks/useFetch";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import storeAuth from "../context/storeAuth";

const Login = () => {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { register, handleSubmit, formState: { errors } } = useForm();
  const { fetchDataBackend } = useFetch();
  const { setToken, setRol } = storeAuth();

  const loginUser = async (data) => {
    setLoading(true);
    try {
      const url = `${import.meta.env.VITE_BACKEND_URL}/login`;
      const response = await fetchDataBackend(url, data, "POST");

      if (response && response.token) {
        setToken(response.token);
        setRol(response.rol);
        navigate("/dashboard");
      } else {
        toast.error(response?.msg || "Error al iniciar sesión");
      }
    } catch (error) {
      console.log(error);

    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col sm:flex-row h-screen">
      <ToastContainer />

      <div
        className="hidden sm:block sm:w-1/2 h-screen bg-[url('/src/assets/imgLogin.jpeg')] 
    bg-no-repeat bg-cover bg-center"
      ></div>

      <div className="w-full sm:w-1/2 h-screen bg-white flex justify-center items-center px-4 md:px-6 py-6">
        <div className="w-full max-w-md">
          <h1 className="text-3xl font-semibold mb-2 text-center uppercase text-blue-900">
            Bienvenido(a) de nuevo
          </h1>
          <small className="text-gray-500 block my-4 text-sm text-center">
            Por favor ingresa tus datos
          </small>

          <form onSubmit={handleSubmit(loginUser)} noValidate className="space-y-4">
            <div>
              <label className="mb-2 block text-sm font-semibold text-gray-700">Correo electrónico</label>
              <input
                type="email"
                placeholder="Ingresa tu correo"
                className="block w-full rounded-md border border-gray-300 focus:border-blue-800 focus:outline-none focus:ring-1 focus:ring-blue-700 py-2 px-3 text-gray-700"
                {...register('email', { required: "El correo es obligatoria" })}
              />
              {errors.email && <p className="text-red-500 text-xs">{errors.email.message}</p>}
            </div>

            <div className="relative">
              <label className="mb-2 block text-sm font-semibold text-gray-700">Contraseña</label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Ingresa tu contraseña"
                  className="block w-full rounded-md border border-gray-300 focus:border-blue-800 focus:outline-none focus:ring-1 focus:ring-blue-800 py-2 px-3 pr-10 text-gray-700"
                  {...register('password', { required: "La contraseña es obligatoria" })}
                />
                {errors.password && (
                  <p className="text-red-500 text-xs">{errors.password.message}</p>
                )}
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute top-2.5 right-3 text-gray-500 hover:text-blue-900"
                >
                  {showPassword ? (
                    <svg className="w-5 h-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A9.956 9.956 0 0112 19c-4.418 0-8.165-2.928-9.53-7a10.005 10.005 0 0119.06 0 9.956 9.956 0 01-1.845 3.35M9.9 14.32a3 3 0 114.2-4.2m.5 3.5l3.8 3.8m-3.8-3.8L5.5 5.5" />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0zm-9.95 0a9.96 9.96 0 0119.9 0m-19.9 0a9.96 9.96 0 0119.9 0M3 3l18 18" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            <button
              disabled={loading}
              className="py-2 w-full bg-blue-900 text-white border rounded-xl hover:scale-105 duration-300 hover:bg-red-800 disabled:opacity-50"
            >
              {loading ? "Iniciando..." : "Iniciar sesión"}
            </button>
          </form>

          <div className="mt-6 grid grid-cols-3 items-center text-gray-400">
            <hr className="border-gray-400" />
            <p className="text-center text-sm">O </p>
            <hr className="border-gray-400" />
          </div>

          <button
            type="button"
            className="bg-white border py-2 w-full rounded-xl mt-5 flex justify-center items-center text-sm hover:scale-105 duration-300 hover:bg-blue-700 hover:text-white"
            onClick={() => {
              window.location.href = `${import.meta.env.VITE_BACKEND_URL}/auth/google`;
            }}
          >
            <img
              className="w-5 mr-2"
              src="https://cdn-icons-png.flaticon.com/512/281/281764.png"
              alt="Google icon"
            />
            Iniciar sesión con Google
          </button>

          <div className="mt-5 text-xs border-b-2 py-4 text-center">
            <Link
              to="/forgot/id"
              className="underline text-sm text-gray-700 hover:text-red-700"
            >
              ¿Olvidaste tu contraseña?
            </Link>
          </div>

          <div className="mt-3 text-sm flex justify-between items-center">
            <Link
              to="/"
              className="py-2 px-5 bg-red-800 text-white border rounded-xl hover:scale-110 duration-300 hover:bg-red-700"
            >
              Regresar
            </Link>
            <Link
              to="/register"
              className="py-2 px-5 bg-blue-800 text-white border rounded-xl hover:scale-110 duration-300 hover:bg-red-800"
            >
              Registrarse
            </Link>
          </div>

        </div>
      </div>
    </div>

  );
};

export default Login;