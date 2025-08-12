import { useEffect, useState } from "react";
import useFetch from "../../hooks/useFetch";
import { ToastContainer, toast } from "react-toastify";
import Header from "../../layout/Header";

function GestionarQuejasSugerencias() {
  const { fetchDataBackend } = useFetch();
  const [quejas, setQuejas] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const obtenerQuejas = async () => {
      try {
        const url = `${import.meta.env.VITE_BACKEND_URL}/admin/quejas-sugerencias`;
        const storedUser = JSON.parse(localStorage.getItem("auth-token"));
        const headers = {
          "Content-Type": "application/json",
          Authorization: `Bearer ${storedUser?.state?.token || ""}`,
        };
        const response = await fetchDataBackend(url, {
          method: "GET",
          config: { headers },
        });
        setQuejas(response);
      } catch (error) {
        console.error("Error al obtener quejas/sugerencias", error);
      } finally {
        setLoading(false);
      }
    };
    obtenerQuejas();
  }, []);

  const responderQueja = async (id, respuesta) => {
    if (!respuesta || respuesta.trim() === "") {
      toast.error("La respuesta no puede estar vacía");
      return;
    }
    try {
      const url = `${import.meta.env.VITE_BACKEND_URL}/admin/quejas-sugerencias/${id}`;
      const storedUser = JSON.parse(localStorage.getItem("auth-token"));
      const headers = {
        "Content-Type": "application/json",
        Authorization: `Bearer ${storedUser?.state?.token || ""}`,
      };
      const body = { respuesta };
      console.log("Enviando PUT con body:", body);

      await fetchDataBackend(url, {
        method: "PUT",
        body: body,
        config: { headers },
      });
      toast.success("Respuesta guardada correctamente");
    } catch (error) {
      console.error("Error al responder la queja/sugerencia", error);
      toast.error("Error al guardar la respuesta");
    }
  };

  const handleRespuestaChange = (id, value) => {
    setQuejas((prev) =>
      prev.map((q) => (q._id === id ? { ...q, respuesta: value } : q))
    );
  };

  return (
    <>
      <Header />
      <div className="p-6 max-w-6xl mx-auto mt-26">
        <ToastContainer />
        <h2 className="text-2xl font-semibold mb-6 text-gray-500">
          Gestión de Quejas y Sugerencias
        </h2>

        {loading ? (
          <p className="text-center text-gray-500">
            Cargando quejas y sugerencias...
          </p>
        ) : quejas.length === 0 ? (
          <p className="text-center text-gray-500">
            No hay quejas o sugerencias registradas.
          </p>
        ) : (
          <>
            {/* Header solo visible en md+ */}
            <div className="hidden md:grid grid-cols-[1.8fr_1fr_3fr_3fr_1fr_1fr] gap-6 text-sm font-semibold text-blue-800 mb-4 px-4">
              <div>Usuario</div>
              <div>Tipo</div>
              <div>Mensaje</div>
              <div>Respuesta</div>
              <div>Estado</div>
              <div>Acción</div>
            </div>

            <div className="flex flex-col gap-6">
              {quejas.map((q) => (
                <div
                  key={q._id}
                  className="bg-white rounded-lg shadow-md p-4
                    md:grid md:grid-cols-[1.8fr_1fr_3fr_3fr_1fr_1fr] md:gap-6 md:items-center"
                >
                  {/* Móvil: etiquetas + valor en bloque con texto pequeño */}
                  <div className="block md:hidden mb-2 text-xs">
                    <span className="font-semibold text-gray-600">Usuario: </span>
                    <span>
                      {q.usuario?.nombre} {q.usuario?.apellido}
                    </span>
                  </div>
                  <div className="block md:hidden mb-2 text-xs">
                    <span className="font-semibold text-gray-600">Tipo: </span>
                    <span>
                      {q.tipo === "queja" ? (
                        <span className="inline-block px-2 py-0.5 text-[11px] text-orange-800 bg-orange-100 rounded-full">
                          Queja
                        </span>
                      ) : q.tipo === "sugerencia" ? (
                        <span className="inline-block px-2 py-0.5 text-[11px] text-blue-600 bg-blue-200 rounded-full">
                          Sugerencia
                        </span>
                      ) : (
                        <span className="inline-block px-2 py-0.5 text-[11px] text-gray-800 bg-gray-100 rounded-full">
                          {q.tipo}
                        </span>
                      )}
                    </span>
                  </div>
                  <div className="block md:hidden mb-2 text-xs">
                    <span className="font-semibold text-gray-600">Mensaje: </span>
                    <span className="whitespace-pre-wrap">{q.mensaje}</span>
                  </div>

                  {/* Desktop - Usuario */}
                  <div className="hidden md:block text-gray-800 font-medium text-sm whitespace-pre-wrap">
                    {q.usuario?.nombre} {q.usuario?.apellido}
                  </div>
                  {/* Desktop - Tipo */}
                  <div className="hidden md:block text-xs font-semibold text-start">
                    {q.tipo === "queja" ? (
                      <span className="inline-block px-3 py-1 text-orange-800 bg-orange-100 rounded-full">
                        Queja
                      </span>
                    ) : q.tipo === "sugerencia" ? (
                      <span className="inline-block px-3 py-1 text-blue-600 bg-blue-200 rounded-full">
                        Sugerencia
                      </span>
                    ) : (
                      <span className="inline-block px-3 py-1 text-gray-800 bg-gray-100 rounded-full">
                        {q.tipo}
                      </span>
                    )}
                  </div>
                  {/* Desktop - Mensaje */}
                  <div className="hidden md:block text-gray-600 text-sm whitespace-pre-wrap">
                    {q.mensaje}
                  </div>

                  {/* Respuesta textarea */}
                  <div className="flex flex-col">
                    <label className="sr-only md:not-sr-only font-semibold mb-1">
                      {/* Aquí podrías poner un label si quieres */}
                    </label>
                    <textarea
                      value={q.respuesta || ""}
                      onChange={(e) => handleRespuestaChange(q._id, e.target.value)}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm md:text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 min-h-[56px] max-h-[120px] resize-none
                        md:px-3 md:py-2 md:text-sm
                        px-2 py-1 text-xs
                      "
                      placeholder="Escribe una respuesta..."
                      maxLength={250}
                    />
                    <div className="text-xs text-gray-500 text-right mt-1">
                      {(q.respuesta?.length || 0)}/250 caracteres
                    </div>
                  </div>

                  {/* Estado */}
                  <div className="hidden md:flex text-xs font-semibold justify-center">
                    {q.estado === "resuelto" ? (
                      <span className="inline-block px-3 py-1 text-green-800 bg-green-100 rounded-full">
                        Resuelto
                      </span>
                    ) : (
                      <span className="inline-block px-3 py-1 text-red-800 bg-red-100 rounded-full">
                        Pendiente
                      </span>
                    )}
                  </div>
                  <div className="block md:hidden mt-2 text-xs">
                    <span className="font-semibold text-gray-600">Estado: </span>
                    {q.estado === "resuelto" ? (
                      <span className="inline-block px-3 py-1 text-green-800 bg-green-100 rounded-full">
                        Resuelto
                      </span>
                    ) : (
                      <span className="inline-block px-3 py-1 text-red-800 bg-red-100 rounded-full">
                        Pendiente
                      </span>
                    )}
                  </div>

                  {/* Botón Guardar */}
                  <div className="mt-3 md:mt-0 flex justify-start md:justify-center">
                    <button
                      disabled={!q.respuesta || q.respuesta.trim() === ""}
                      onClick={() => responderQueja(q._id, q.respuesta || "")}
                      className={`px-4 py-2 rounded-md text-sm font-semibold transition
                        ${
                          !q.respuesta || q.respuesta.trim() === ""
                            ? "bg-gray-400/85 text-white cursor-not-allowed"
                            : "bg-blue-800 hover:bg-blue-700 text-white"
                        }`}
                    >
                      Guardar
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </>
  );
}

export default GestionarQuejasSugerencias;
