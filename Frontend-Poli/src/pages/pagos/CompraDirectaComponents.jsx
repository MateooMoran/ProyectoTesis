import React from 'react';
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
    AlertCircle
} from 'lucide-react';

// ==================== PASO 1: DETALLE DEL PEDIDO ====================
export const Paso1DetalleDelPedido = ({ producto, cantidad, total, onContinuar }) => {
    return (
        <div>
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                <ShoppingBag className="w-6 h-6" />
                Detalle del Pedido
            </h2>
            
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6">
                <div className="space-y-3">
                    <div className="flex justify-between">
                        <span className="text-gray-700">Producto:</span>
                        <span className="font-semibold">{producto?.nombreProducto}</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-gray-700">Precio unitario:</span>
                        <span className="font-semibold">${producto?.precio.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-gray-700">Cantidad:</span>
                        <span className="font-semibold">{cantidad}</span>
                    </div>
                    <div className="border-t-2 border-blue-300 pt-3 flex justify-between">
                        <span className="text-lg font-bold text-gray-800">Total a pagar:</span>
                        <span className="text-2xl font-bold text-blue-600">${total}</span>
                    </div>
                </div>
            </div>

            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-6">
                <p className="text-sm text-gray-600">
                    <strong>Vendedor:</strong> {producto?.vendedor?.nombre} {producto?.vendedor?.apellido}
                </p>
                <p className="text-sm text-gray-600 mt-1">
                    <strong>Stock disponible:</strong> {producto?.stock} unidades
                </p>
            </div>

            <button
                onClick={onContinuar}
                className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition flex items-center justify-center gap-2"
            >
                Continuar
                <ChevronRight className="w-5 h-5" />
            </button>
        </div>
    );
};

// ==================== PASO 2: ELEGIR LUGAR DE RETIRO ====================
export const Paso2LugarRetiro = ({ lugares, lugarRetiro, onSelectLugar, onContinuar, onRegresar }) => {
    return (
        <div>
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                <MapPin className="w-6 h-6" />
                Elige el Lugar de Retiro
            </h2>

            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
                <p className="text-sm text-gray-700 mb-4">
                    Selecciona el lugar donde recogerás tu producto:
                </p>
                
                {lugares?.map((lugar) => (
                    <label 
                        key={lugar} 
                        className={`flex items-center gap-3 p-4 border-2 rounded-lg mb-3 cursor-pointer transition ${
                            lugarRetiro === lugar ? 'border-blue-600 bg-blue-50' : 'border-gray-300 hover:border-blue-400'
                        }`}
                    >
                        <input
                            type="radio"
                            name="lugarRetiro"
                            value={lugar}
                            checked={lugarRetiro === lugar}
                            onChange={(e) => onSelectLugar(e.target.value)}
                            className="w-5 h-5 text-blue-600"
                        />
                        <span className="text-gray-800 font-medium">{lugar}</span>
                        {lugarRetiro === lugar && (
                            <CheckCircle className="w-5 h-5 text-blue-600 ml-auto" />
                        )}
                    </label>
                ))}
            </div>

            <div className="flex gap-3">
                <button
                    onClick={onRegresar}
                    className="w-1/3 bg-gray-200 text-gray-700 py-3 rounded-lg font-semibold hover:bg-gray-300 transition flex items-center justify-center gap-2"
                >
                    <ChevronRight className="w-5 h-5 rotate-180" />
                    Regresar
                </button>
                <button
                    onClick={onContinuar}
                    disabled={!lugarRetiro}
                    className="w-2/3 bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition disabled:opacity-50 flex items-center justify-center gap-2"
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
    return (
        <div>
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                <CreditCard className="w-6 h-6" />
                Elige tu Método de Pago
            </h2>

            {metodosPago.filter(m => m.tipo !== 'retiro').length === 0 ? (
                <div className="text-center py-12">
                    <AlertCircle className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
                    <h3 className="text-xl font-bold text-gray-800 mb-2">Métodos de pago no disponibles</h3>
                    <p className="text-gray-600 mb-2">Este vendedor aún no ha configurado métodos de pago.</p>
                    <p className="text-sm text-gray-500 mb-4">Por favor, contacta al vendedor o selecciona otro producto.</p>
                    <div className="flex gap-3 justify-center mt-6">
                        <button
                            onClick={() => navigate(-1)}
                            className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition"
                        >
                            Volver al producto
                        </button>
                    </div>
                </div>
            ) : (
                <div className="space-y-4 mb-6">
                    {/* Métodos del vendedor (transferencia, QR) */}
                    {metodosPago.filter(m => m.tipo !== 'retiro').map((metodo) => (
                        <div
                            key={metodo._id}
                            onClick={() => onSelectMetodo(metodo._id)}
                            className={`border-2 rounded-lg p-4 cursor-pointer transition ${
                                metodoPagoSeleccionado === metodo._id
                                    ? 'border-blue-600 bg-blue-50'
                                    : 'border-gray-300 hover:border-blue-400'
                            }`}
                        >
                            <div className="flex items-start justify-between">
                                <div className="flex-1">
                                    <h3 className="font-semibold text-lg flex items-center gap-2">
                                        {metodo.tipo === 'transferencia' && (
                                            <>
                                                <FileText className="w-5 h-5 text-blue-600" />
                                                Transferencia Bancaria
                                            </>
                                        )}
                                        {metodo.tipo === 'qr' && (
                                            <>
                                                <Package className="w-5 h-5 text-purple-600" />
                                                Código QR
                                            </>
                                        )}
                                    </h3>
                                    {metodo.tipo === 'transferencia' && (
                                        <div className="mt-2 text-sm text-gray-600 space-y-1">
                                            <p><strong>Banco:</strong> {metodo.banco}</p>
                                            <p><strong>Cuenta:</strong> {metodo.numeroCuenta}</p>
                                            <p><strong>Titular:</strong> {metodo.titular}</p>
                                        </div>
                                    )}
                                    {metodo.tipo === 'qr' && metodo.imagenComprobante && (
                                        <img 
                                            src={metodo.imagenComprobante} 
                                            alt="QR" 
                                            className="mt-3 w-48 h-48 object-contain border border-gray-300 rounded-lg"
                                        />
                                    )}
                                </div>
                                {metodoPagoSeleccionado === metodo._id && (
                                    <CheckCircle className="w-6 h-6 text-blue-600" />
                                )}
                            </div>
                        </div>
                    ))}

                    {/* Opción de pago con tarjeta Stripe */}
                    <div
                        onClick={() => onSelectMetodo('stripe')}
                        className={`border-2 rounded-lg p-4 cursor-pointer transition ${
                            metodoPagoSeleccionado === 'stripe'
                                ? 'border-blue-600 bg-blue-50'
                                : 'border-gray-300 hover:border-blue-400'
                        }`}
                    >
                        <div className="flex items-start justify-between">
                            <div className="flex-1">
                                <h3 className="font-semibold text-lg flex items-center gap-2">
                                    <CreditCard className="w-5 h-5 text-green-600" />
                                    Pagar con Tarjeta
                                </h3>
                                <p className="text-sm text-gray-600 mt-1">Pago seguro procesado por Stripe</p>
                            </div>
                            {metodoPagoSeleccionado === 'stripe' && (
                                <CheckCircle className="w-6 h-6 text-blue-600" />
                            )}
                        </div>
                    </div>
                </div>
            )}

            <div className="flex gap-3">
                <button
                    onClick={onRegresar}
                    className="w-1/3 bg-gray-200 text-gray-700 py-3 rounded-lg font-semibold hover:bg-gray-300 transition flex items-center justify-center gap-2"
                >
                    <ChevronRight className="w-5 h-5 rotate-180" />
                    Regresar
                </button>
                {metodoPagoSeleccionado && (
                    <button
                        onClick={onContinuar}
                        disabled={loading}
                        className="w-2/3 bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition disabled:opacity-50 flex items-center justify-center gap-2"
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
        <div>
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                <Upload className="w-6 h-6" />
                Subir Comprobante de Pago
            </h2>

            {metodoPagoElegido?.tipo === 'transferencia' && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                    <h3 className="font-semibold mb-2 flex items-center gap-2">
                        <FileText className="w-5 h-5" />
                        Recuerda transferir a:
                    </h3>
                    <div className="space-y-1 text-sm">
                        <p><strong>Banco:</strong> {metodoPagoElegido.banco}</p>
                        <p><strong>Número de cuenta:</strong> {metodoPagoElegido.numeroCuenta}</p>
                        <p><strong>Titular:</strong> {metodoPagoElegido.titular}</p>
                        <p><strong>Monto:</strong> <span className="text-lg font-bold text-blue-600">${total}</span></p>
                    </div>
                </div>
            )}

            {metodoPagoElegido?.tipo === 'qr' && metodoPagoElegido.imagenComprobante && (
                <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 mb-6 text-center">
                    <h3 className="font-semibold mb-3">Escanea el código QR para pagar:</h3>
                    <img 
                        src={metodoPagoElegido.imagenComprobante} 
                        alt="QR" 
                        className="mx-auto w-64 h-64 object-contain border-2 border-purple-300 rounded-lg"
                    />
                    <p className="mt-3 text-sm"><strong>Monto:</strong> <span className="text-lg font-bold text-purple-600">${total}</span></p>
                </div>
            )}

            <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                    Subir Comprobante de Pago *
                </label>
                <input
                    type="file"
                    accept="image/*"
                    onChange={onFileChange}
                    className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                />
                {archivoComprobante && (
                    <p className="mt-2 text-sm text-green-600 flex items-center gap-1">
                        <CheckCircle className="w-4 h-4" />
                        {archivoComprobante.name}
                    </p>
                )}
            </div>

            <div className="flex gap-3">
                <button
                    onClick={onRegresar}
                    className="w-1/3 bg-gray-200 text-gray-700 py-3 rounded-lg font-semibold hover:bg-gray-300 transition flex items-center justify-center gap-2"
                >
                    <ChevronRight className="w-5 h-5 rotate-180" />
                    Regresar
                </button>
                <button
                    onClick={onSubmit}
                    disabled={loading || !archivoComprobante}
                    className="w-2/3 bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition disabled:opacity-50 flex items-center justify-center gap-2"
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
