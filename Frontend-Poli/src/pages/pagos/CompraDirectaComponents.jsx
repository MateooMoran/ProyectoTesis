import {
    ShoppingBag,
    MapPin,
    CreditCard,
    Upload,
    CheckCircle,
    ChevronRight,
    Loader2,
    FileText,
    Package,
    AlertCircle,
    User,
    MessageCircle,
} from 'lucide-react';

// ==================== PASO 1: DETALLE DEL PEDIDO ====================
export const Paso1DetalleDelPedido = ({ producto, cantidad, total, onContinuar, disabled = false }) => {
    return (
        <div className="max-w-2xl mx-auto space-y-6">
            {/* Header */}
            <div className="flex items-center gap-3">
                <div className="bg-gradient-to-br from-blue-500 to-blue-600 p-2.5 rounded-lg">
                    <ShoppingBag className="w-5 h-5 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900">Detalle del Pedido</h2>
            </div>

            {/* Información del vendedor */}
            <div className="bg-white border border-gray-200 rounded-2xl p-5">
                <div className="flex gap-3">
                    <div className="bg-gray-50 p-2 rounded-lg h-fit">
                        <User className="w-4 h-4 text-gray-600" />
                    </div>
                    <div className="flex-1 space-y-1">
                        <p className="text-sm font-medium text-gray-900">
                            {producto?.vendedor?.nombre} {producto?.vendedor?.apellido}
                        </p>
                        <p className="text-sm text-gray-600">
                            Stock disponible: <span className="font-semibold text-green-600">{producto?.stock} unidades</span>
                        </p>
                    </div>
                </div>
            </div>

            {/* Producto Card */}
            <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
                {/* Producto Info */}
                <div className="p-6 space-y-5">
                    <div>
                        <p className="text-sm text-gray-500 mb-1">Producto</p>
                        <p className="text-lg font-semibold text-gray-900">
                            {producto?.nombreProducto}
                        </p>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <p className="text-sm text-gray-500 mb-1">Precio unitario</p>
                            <p className="text-lg font-semibold text-black">
                                ${producto?.precio.toFixed(2)}
                            </p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-500 mb-1">Cantidad</p>
                            <p className="text-lg font-semibold text-gray-900">{cantidad}</p>
                        </div>
                    </div>
                </div>

                {/* Total Section */}
                <div className="px-6 py-5 border-t border-gray-200">
                    <div className="flex justify-between items-center">
                        <span className="text-base font-medium text-gray-700">Total a pagar</span>
                        <div className="bg-blue-600 px-6 py-2.5 rounded-lg">
                            <span className="text-2xl font-bold text-white">${total}</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Botón continuar - DESHABILITABLE */}
            {!disabled && (
                <button
                    onClick={onContinuar}
                    className="w-full bg-blue-600 text-white py-3.5 rounded-lg font-semibold flex items-center justify-center gap-2 shadow-md hover:bg-blue-700 transition"
                >
                    Continuar
                    <ChevronRight className="w-5 h-5" />
                </button>
            )}
        </div>
    );
};

// ==================== PASO 2: ELEGIR LUGAR DE RETIRO ====================
export const Paso2LugarRetiro = ({ lugares, lugarRetiro, onSelectLugar, onContinuar, onRegresar, navigate }) => {
    //  Si no hay lugares disponibles, mostrar mensaje 
    if (!lugares || lugares.length === 0) {
        return (
            <div className="max-w-2xl mx-auto space-y-6">
                {/* Header */}
                <div className="flex items-center gap-3">
                    <div className="bg-gradient-to-br from-yellow-500 to-yellow-600 p-2.5 rounded-lg">
                        <AlertCircle className="w-5 h-5 text-white" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900">Lugar de Retiro No Disponible</h2>
                </div>

                {/* Mensaje de advertencia */}
                <div className="bg-white border-2 border-yellow-200 rounded-2xl p-8 text-center">
                    <div className="bg-yellow-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
                        <MapPin className="w-10 h-10 text-yellow-600" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-3">
                        El vendedor no ha configurado lugares de retiro
                    </h3>
                    <p className="text-gray-600 mb-2">
                        Para continuar con tu compra, necesitas contactar al vendedor para coordinar un lugar de retiro.
                    </p>
                    <p className="text-sm text-gray-500 mb-6">
                        Usa el chat para comunicarte directamente con el vendedor.
                    </p>

                    {/* Botones */}
                    <div className="flex flex-col sm:flex-row gap-3 justify-center">
                        <button
                            onClick={onRegresar}
                            className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg font-semibold hover:bg-gray-300 transition flex items-center justify-center gap-2"
                        >
                            <ChevronRight className="w-5 h-5 rotate-180" />
                            Regresar
                        </button>
                        <button
                            onClick={() => navigate('/dashboard/chat')}
                            className="px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition flex items-center justify-center gap-2 shadow-md"
                        >
                            <MessageCircle className="w-5 h-5" />
                            Contactar al Vendedor
                        </button>
                    </div>
                    {/* Botón continuar deshabilitado y oculto */}
                    <button disabled className="hidden" />
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-2xl mx-auto space-y-6">
            {/* Header */}
            <div className="flex items-center gap-3">
                <div className="bg-gradient-to-br from-blue-500 to-blue-600 p-2.5 rounded-lg">
                    <MapPin className="w-5 h-5 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900">Lugar de Retiro</h2>
            </div>

            {/* Instrucción */}
            <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
                <p className="text-gray-700 text-base font-medium">
                    Selecciona el lugar donde recogerás tu producto:
                </p>
            </div>

            <p className="mt-3 text-sm text-red-500 font-medium">
                No olvides coordinar la hora de entrega con el vendedor.
                Usa el chat para comunicarte directamente con él.
            </p>


            {/* Lugares de retiro */}
            <div className="space-y-3">
                {lugares?.map((lugar) => (
                    <label
                        key={lugar}
                        className={`flex items-center gap-3 p-4 border-2 rounded-xl cursor-pointer transition-all ${lugarRetiro === lugar
                            ? 'border-blue-600 bg-blue-50'
                            : 'border-gray-200 hover:border-gray-300 bg-white'
                            }`}
                    >
                        <input
                            type="radio"
                            name="lugarRetiro"
                            value={lugar}
                            checked={lugarRetiro === lugar}
                            onChange={(e) => onSelectLugar(e.target.value)}
                            className="w-5 h-5 text-blue-600 focus:ring-2 focus:ring-blue-500"
                        />
                        <span className={`flex-1 font-medium ${lugarRetiro === lugar ? 'text-blue-900' : 'text-gray-800'
                            }`}>
                            {lugar}
                        </span>
                        {lugarRetiro === lugar && (
                            <CheckCircle className="w-5 h-5 text-blue-600" />
                        )}
                    </label>
                ))}
            </div>

            {/* Botones */}
            <div className="flex gap-3">
                <button
                    onClick={onRegresar}
                    className="w-1/3 bg-gray-200 text-gray-700 py-3.5 rounded-lg font-semibold hover:bg-gray-300 transition flex items-center justify-center gap-2"
                >
                    <ChevronRight className="w-5 h-5 rotate-180" />
                    Regresar
                </button>
                <button
                    onClick={onContinuar}
                    disabled={!lugarRetiro}
                    className="w-2/3 bg-blue-600 text-white py-3.5 rounded-lg font-semibold hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-md"
                >
                    Continuar
                    <ChevronRight className="w-5 h-5" />
                </button>
            </div>
        </div>
    );
};


// ==================== PASO 3: MÉTODO DE PAGO ====================
export const Paso3MetodoPago = ({
    metodosPago,
    metodoPagoSeleccionado,
    onSelectMetodo,
    onContinuar,
    onRegresar,
    loading,
    tieneRetiro,
    navigate
}) => {
    // Filtrar métodos válidos del vendedor 
    const metodosVendedorValidos = metodosPago.filter(m => {
        if (m.tipo === 'retiro') return false;
        if (m.tipo === 'transferencia') return m.banco && m.numeroCuenta && m.titular && m.cedula;
        if (m.tipo === 'qr') return m.imagenComprobante;
        return false;
    });

    return (
        <div className="max-w-2xl mx-auto space-y-6">
            {/* Header */}
            <div className="flex items-center gap-3">
                <div className="bg-gradient-to-br from-blue-500 to-blue-600 p-2.5 rounded-lg">
                    <CreditCard className="w-5 h-5 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900">Método de Pago</h2>
            </div>

            {metodosVendedorValidos.length === 0 ? (
                <div className="bg-white border-2 border-yellow-300 rounded-2xl p-8 text-center">
                    <div className="bg-yellow-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
                        <AlertCircle className="w-10 h-10 text-yellow-600" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-3">Métodos de pago no disponibles</h3>
                    <p className="text-gray-700 mb-2">Este vendedor aún no ha configurado métodos de pago.</p>
                    <p className="text-sm text-gray-600 mb-6">Por favor, contacta al vendedor o selecciona otro producto.</p>

                    <div className="flex flex-col sm:flex-row gap-3 justify-center">
                        <button
                            onClick={() => navigate('/dashboard/chat', { replace: true })}
                            className="px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition flex items-center justify-center gap-2 shadow-md"
                        >
                            <MessageCircle className="w-5 h-5" />
                            Ir al chat
                        </button>
                        <button
                            onClick={() => navigate(-1)}
                            className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg font-semibold hover:bg-gray-300 transition flex items-center justify-center gap-2"
                        >
                            Volver al producto
                        </button>
                    </div>
                </div>
            ) : (
                <>
                    {/* Métodos de pago */}
                    <div className="space-y-3">
                        {/* Métodos del vendedor */}
                        {metodosVendedorValidos.map((metodo) => (
                            <div
                                key={metodo._id}
                                onClick={() => onSelectMetodo(metodo._id)}
                                className={`border-2 rounded-xl p-5 cursor-pointer transition-all ${metodoPagoSeleccionado === metodo._id
                                    ? 'border-blue-600 bg-blue-50'
                                    : 'border-gray-200 hover:border-gray-300 bg-white'
                                    }`}
                            >
                                <div className="flex items-center justify-between gap-4">
                                    <div className="flex-1">
                                        <h3 className={`font-semibold text-lg ${metodoPagoSeleccionado === metodo._id ? 'text-blue-900' : 'text-gray-900'
                                            }`}>
                                            {metodo.tipo === 'transferencia' && 'Transferencia Bancaria'}
                                            {metodo.tipo === 'qr' && 'Código QR'}
                                        </h3>
                                        {metodo.tipo === 'transferencia' && (
                                            <div className="mt-2 space-y-1 text-sm">
                                                <p className="text-gray-600">
                                                    <span className="font-semibold text-gray-900 ">Banco:</span> {metodo.banco}
                                                </p>
                                                <p className="text-gray-600">
                                                    <span className="font-semibold text-gray-900 ">Cuenta:</span> {metodo.numeroCuenta}
                                                </p>
                                                <p className="text-gray-600">
                                                    <span className="font-semibold text-gray-900 ">Titular:</span> {metodo.titular}
                                                </p>
                                            </div>
                                        )}
                                        {metodo.tipo === 'qr' && metodo.imagenComprobante && (
                                            <div className="mt-3">
                                                <img
                                                    src={metodo.imagenComprobante}
                                                    alt="QR"
                                                    className="w-40 h-40 object-contain border border-gray-200 rounded-lg bg-gray-50"
                                                />
                                            </div>
                                        )}
                                    </div>
                                    {metodoPagoSeleccionado === metodo._id && (
                                        <CheckCircle className="w-5 h-5 text-blue-600 flex-shrink-0" />
                                    )}
                                </div>
                            </div>
                        ))}

                        {/* Opción Stripe */}
                        <div
                            onClick={() => onSelectMetodo('stripe')}
                            className={`border-2 rounded-xl p-5 cursor-pointer transition-all ${metodoPagoSeleccionado === 'stripe'
                                ? 'border-blue-600 bg-blue-50'
                                : 'border-gray-200 hover:border-gray-300 bg-white'
                                }`}
                        >
                            <div className="flex items-center justify-between gap-4">
                                <div className="flex-1">
                                    <h3 className={`font-semibold text-lg ${metodoPagoSeleccionado === 'stripe' ? 'text-blue-900' : 'text-gray-900'
                                        }`}>
                                        Pagar con Tarjeta
                                    </h3>
                                    <p className="text-sm text-gray-600 mt-1">Pago seguro procesado por Stripe</p>
                                </div>
                                {metodoPagoSeleccionado === 'stripe' && (
                                    <CheckCircle className="w-5 h-5 text-blue-600 flex-shrink-0" />
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Botones */}
                    <div className="flex gap-3">
                        <button
                            onClick={onRegresar}
                            className="w-1/3 bg-gray-200 text-gray-700 py-3.5 rounded-lg font-semibold hover:bg-gray-300 transition flex items-center justify-center gap-2"
                        >
                            <ChevronRight className="w-5 h-5 rotate-180" />
                            Regresar
                        </button>
                        {metodoPagoSeleccionado && (
                            <button
                                onClick={onContinuar}
                                disabled={loading}
                                className="w-2/3 bg-blue-600 text-white py-3.5 rounded-lg font-semibold hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-md"
                            >
                                {loading ? (
                                    <>
                                        <Loader2 className="w-5 h-5 animate-spin" />
                                        Procesando...
                                    </>
                                ) : (
                                    <>
                                        Continuar
                                        <ChevronRight className="w-5 h-5" />
                                    </>
                                )}
                            </button>
                        )}
                    </div>
                </>
            )}
        </div>
    );
};

// ==================== PASO 4: SUBIR COMPROBANTE ====================
export const Paso4SubirComprobante = ({
    metodoPagoElegido,
    total,
    archivoComprobante,
    onFileChange,
    onSubmit,
    onRegresar,
    loading
}) => {
    return (
        <div className="max-w-2xl mx-auto space-y-6">
            {/* Header */}
            <div className="flex items-center gap-3">
                <div className="bg-gradient-to-br from-blue-500 to-blue-600 p-2.5 rounded-lg">
                    <Upload className="w-5 h-5 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900">Subir Comprobante</h2>
            </div>

            {/* Info Transferencia */}
            {metodoPagoElegido?.tipo === 'transferencia' && (
                <div className="bg-white border border-gray-200 rounded-2xl p-5">
                    <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                        <FileText className="w-5 h-5 text-blue-600" />
                        Datos para la transferencia
                    </h3>
                    <div className="space-y-2 text-sm">
                        <p className="text-gray-600">
                            <span className="font-medium text-gray-900">Banco:</span> {metodoPagoElegido.banco}
                        </p>
                        <p className="text-gray-600">
                            <span className="font-medium text-gray-900">Número de cuenta:</span> {metodoPagoElegido.numeroCuenta}
                        </p>
                        <p className="text-gray-600">
                            <span className="font-medium text-gray-900">Titular:</span> {metodoPagoElegido.titular}
                        </p>
                        <div className="pt-2 border-t border-gray-200 mt-3">
                            <p className="text-gray-600">
                                <span className="font-medium text-gray-900">Monto a transferir:</span> <span className="text-lg font-bold text-blue-600">${total}</span>
                            </p>
                        </div>
                    </div>
                </div>
            )}

            {/* Info QR */}
            {metodoPagoElegido?.tipo === 'qr' && metodoPagoElegido.imagenComprobante && (
                <div className="bg-white border border-gray-200 rounded-2xl p-6 text-center">
                    <h3 className="font-semibold text-gray-900 mb-4">Escanea el código QR para pagar</h3>
                    <div className="inline-block p-4 bg-gray-50 rounded-xl">
                        <img
                            src={metodoPagoElegido.imagenComprobante}
                            alt="QR"
                            className="w-64 h-64 object-contain"
                        />
                    </div>
                    <div className="mt-4">
                        <p className="text-sm text-gray-600">
                            Monto a pagar: <span className="text-lg font-bold text-purple-600">${total}</span>
                        </p>
                    </div>
                </div>
            )}

            {/* Upload Comprobante */}
            <div className="bg-white border border-gray-200 rounded-2xl p-5">
                <label className="block text-sm font-medium text-gray-900 mb-3">
                    Subir Comprobante de Pago *
                </label>
                <div className="flex items-center gap-3">
                    <input
                        type="file"
                        accept="image/*"
                        onChange={onFileChange}
                        className="hidden"
                        id="file-upload-input"
                    />
                    <label
                        htmlFor="file-upload-input"
                        className="px-4 py-2 bg-blue-50 text-blue-700 text-sm font-semibold rounded-lg hover:bg-blue-100 cursor-pointer transition"
                    >
                        Seleccionar archivo
                    </label>
                    {archivoComprobante ? (
                        <div className="flex items-center gap-2 text-sm text-green-600 bg-green-50 px-3 py-2 rounded-lg">
                            <CheckCircle className="w-4 h-4" />
                            <span className="font-medium">{archivoComprobante.name}</span>
                        </div>
                    ) : (
                        <span className="text-sm text-gray-500">Ningún archivo seleccionado</span>
                    )}
                </div>
            </div>

            {/* Botones */}
            <div className="flex gap-3">
                <button
                    onClick={onRegresar}
                    className="w-1/3 bg-gray-200 text-gray-700 py-3.5 rounded-lg font-semibold hover:bg-gray-300 transition flex items-center justify-center gap-2"
                >
                    <ChevronRight className="w-5 h-5 rotate-180" />
                    Regresar
                </button>
                <button
                    onClick={onSubmit}
                    disabled={loading || !archivoComprobante}
                    className="w-2/3 bg-blue-600 text-white py-3.5 rounded-lg font-semibold hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-md"
                >
                    {loading ? (
                        <>
                            <Loader2 className="w-5 h-5 animate-spin" />
                            Subiendo...
                        </>
                    ) : (
                        <>
                            <Upload className="w-5 h-5" />
                            Confirmar y Subir Comprobante
                        </>
                    )}
                </button>
            </div>
        </div>
    );
};