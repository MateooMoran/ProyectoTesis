import storeProfile from "../../context/storeProfile"

export const CardProfile = () => {
    const { user } = storeProfile();

    return (
        <aside className="fixed top-30 left-65  z-30 w-96 animate-slideIn">
            <div className="bg-white border border-blue-200 p-7 flex flex-col items-center shadow-2xl rounded-2xl transition-all duration-500 hover:shadow-blue-400">
                <div className="relative mb-3 group">
                    <img
                        src={user?.avatar || "https://cdn-icons-png.flaticon.com/512/4715/4715329.png"}
                        alt="img-client"
                        className="rounded-full border-4 border-blue-800 shadow-lg w-32 h-32 object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                    <label className="absolute bottom-2 right-2 bg-blue-700 text-white rounded-full p-2 cursor-pointer hover:bg-red-800 transition">
                        📷
                        <input type="file" accept="image/*" className="hidden" />
                    </label>
                </div>
                <div className="w-full space-y-2">
                    <div>
                        <span className="font-semibold text-blue-800">Nombre:</span>
                        <span className="ml-2 text-gray-700">{user?.nombre}</span>
                    </div>
                    <div>
                        <span className="font-semibold text-blue-800">Apellido:</span>
                        <span className="ml-2 text-gray-700">{user?.apellido}</span>
                    </div>
                    <div>
                        <span className="font-semibold text-blue-800">Dirección:</span>
                        <span className="ml-2 text-gray-700">{user?.direccion}</span>
                    </div>
                    <div>
                        <span className="font-semibold text-blue-800">Teléfono:</span>
                        <span className="ml-2 text-gray-700">{user?.celular}</span>
                    </div>
                    <div>
                        <span className="font-semibold text-blue-800">Correo:</span>
                        <span className="ml-2 text-gray-700">{user?.email}</span>
                    </div>
                </div>
            </div>
            <style>
                {`
                @keyframes slideIn {
                    from { opacity: 0; transform: translateX(-40px);}
                    to { opacity: 1; transform: translateX(0);}
                }
                .animate-slideIn {
                    animation: slideIn 0.7s cubic-bezier(.68,-0.55,.27,1.55) both;
                }
                `}
            </style>
        </aside>
    );
}