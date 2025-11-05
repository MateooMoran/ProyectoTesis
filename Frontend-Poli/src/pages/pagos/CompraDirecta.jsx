import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { toast } from 'react-toastify';
import {
    ShoppingBag,
    CreditCard,
    CheckCircle,
    Upload,
    MapPin,
    Package,
    ChevronRight,
    Loader2,
    FileText,
    AlertCircle,
    Check
} from 'lucide-react';
import Header from '../../layout/Header';
import useFetch from '../../hooks/useFetch';
import storeAuth from '../../context/storeAuth';

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY);

// ==================== COMPONENTE FORMULARIO STRIPE ====================
const FormularioStripe = ({ productoId, cantidad, metodoPagoVendedorId, lugarRetiro, onSuccess }) => {
    const stripe = useStripe();
    const elements = useElements();
    const [loading, setLoading] = useState(false);
    const { token } = storeAuth();

    useEffect(() => {
        console.log('Stripe cargado:', !!stripe);
        console.log('Elements cargado:', !!elements);
    }, [stripe, elements]);

    const handlePagoStripe = async (e) => {
        e.preventDefault();
        if (!stripe || !elements) {
            toast.error('Stripe no está listo. Por favor espera un momento.');
            return;
        }

        setLoading(true);
        try {
            const { error, paymentMethod } = await stripe.createPaymentMethod({
                type: 'card',
                card: elements.getElement(CardElement),
            });

            if (error) throw new Error(error.message);

            const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/estudiante/orden/pago-tarjeta`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    paymentMethodId: paymentMethod.id,
                    productoId,
                    cantidad: cantidad.toString(),
                    metodoPagoVendedorId,
                    lugarRetiro: lugarRetiro || undefined
                })
            });

            const data = await response.json();
            if (!response.ok) throw new Error(data.msg);

            toast.success('¡Pago procesado exitosamente!');
            onSuccess();
        } catch (error) {
            toast.error(error.message || 'Error al procesar el pago');
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handlePagoStripe} className="space-y-6">
            {/* Card con diseño limpio */}
            <div className="bg-white rounded-lg border-2 border-gray-200 shadow-md">
                <div className="p-6">
                    {/* Header con icono */}
                    <div className="flex items-center gap-3 mb-6">
                        <div className="bg-blue-600 p-3 rounded-lg shadow-sm">
                            <CreditCard className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-gray-800">Información de la tarjeta</h3>
                            <p className="text-xs text-gray-600">Pago seguro procesado por Stripe</p>
                        </div>
                    </div>

                    {/* Campo de tarjeta */}
                    <div className="bg-gray-50 rounded-lg border-2 border-gray-300 hover:border-blue-400 transition-colors focus-within:border-blue-500">
                        <div className="p-4">
                            {!stripe ? (
                                <div className="py-6 text-center">
                                    <Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-3" />
                                    <p className="text-sm font-medium text-gray-600">Cargando formulario de pago...</p>
                                </div>
                            ) : (
                                <CardElement
                                    options={{
                                        style: {
                                            base: {
                                                fontSize: '16px',
                                                color: '#1f2937',
                                                fontFamily: 'system-ui, -apple-system, sans-serif',
                                                '::placeholder': { 
                                                    color: '#9ca3af'
                                                },
                                                iconColor: '#3b82f6',
                                            },
                                            invalid: { 
                                                color: '#ef4444',
                                                iconColor: '#ef4444'
                                            },
                                            complete: {
                                                iconColor: '#10b981'
                                            }
                                        }
                                    }}
                                />
                            )}
                        </div>
                    </div>

                    {/* Íconos de seguridad */}
                    <div className="mt-4 flex items-center justify-center gap-4 text-xs text-gray-500">
                        <div className="flex items-center gap-1">
                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                            </svg>
                            <span className="font-medium">Conexión segura</span>
                        </div>
                        <span>•</span>
                        <span className="font-medium">SSL Encriptado</span>
                    </div>
                </div>
            </div>

            {/* Botón con estilo consistente */}
            <button
                type="submit"
                disabled={!stripe || loading}
                className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition disabled:opacity-50 flex items-center justify-center gap-2"
            >
                {loading ? (
                    <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Procesando pago...
                    </>
                ) : !stripe ? (
                    <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Cargando...
                    </>
                ) : (
                    <>
                        <CreditCard className="w-5 h-5" />
                        Pagar con tarjeta
                    </>
                )}
            </button>

            {/* Badge de confianza */}
            <div className="text-center">
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-50 border border-green-200 rounded-lg">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    <span className="text-xs font-semibold text-green-700">Pago 100% seguro y confiable</span>
                </div>
            </div>
        </form>
    );
};

// ==================== COMPONENTE PRINCIPAL ====================
const CompraDirecta = () => {
    const { productoId } = useParams();
    const navigate = useNavigate();
    const { fetchDataBackend } = useFetch();
    const { token } = storeAuth();

    // Estados
    const [currentStep, setCurrentStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [producto, setProducto] = useState(null);
    const [cantidad, setCantidad] = useState(1);
    const [metodoPagoSeleccionado, setMetodoPagoSeleccionado] = useState('');
    const [metodosPago, setMetodosPago] = useState([]);
    const [lugarRetiro, setLugarRetiro] = useState('');
    const [ordenCreada, setOrdenCreada] = useState(null);
    const [archivoComprobante, setArchivoComprobante] = useState(null);
    const [tieneRetiro, setTieneRetiro] = useState(false);

    // Cargar producto y métodos de pago
    useEffect(() => {
        const cargarDatos = async () => {
            try {
                setLoading(true);
                // Cargar producto
                const dataProducto = await fetchDataBackend(
                    `${import.meta.env.VITE_BACKEND_URL}/estudiante/productos/${productoId}`,
                    { method: 'GET', config: { headers: { Authorization: `Bearer ${token}` } } }
                );
                console.log(dataProducto)
                setProducto(dataProducto);

                // Cargar métodos de pago del vendedor del producto
                if (dataProducto?.vendedor?._id) {
                    try {
                        const responseMetodos = await fetchDataBackend(
                            `${import.meta.env.VITE_BACKEND_URL}/vendedor/pago?vendedorId=${dataProducto.vendedor._id}`,
                            { method: 'GET', config: { headers: { Authorization: `Bearer ${token}` } } }
                        );
                        const metodos = responseMetodos.metodos || [];
                        setMetodosPago(metodos);
                        
                        // Verificar si tiene retiro disponible
                        const metodoRetiro = metodos.find(m => m.tipo === 'retiro');
                        setTieneRetiro(!!metodoRetiro);
                    } catch (errorMetodos) {
                        console.error('Error al cargar métodos de pago:', errorMetodos);
                        toast.warning('No se pudieron cargar los métodos de pago del vendedor');
                        setMetodosPago([]);
                        setTieneRetiro(false);
                    }
                }

            } catch (error) {
                console.error('Error al cargar datos:', error);
                toast.error(error.message || 'Error al cargar los datos del producto');
            } finally {
                setLoading(false);
            }
        };

        if (productoId && token) {
            cargarDatos();
        }
    }, [productoId, token]);

    // Continuar desde paso 1 (Ver detalle)
    const continuarDesdePaso1 = () => {
        if (tieneRetiro) {
            setCurrentStep(2); // Ir a elegir lugar de retiro
        } else {
            setCurrentStep(3); // Saltar directo a métodos de pago
        }
    };

    // Continuar desde paso 2 (Elegir retiro)
    const continuarDesdePaso2 = () => {
        if (!lugarRetiro) {
            toast.error('Selecciona un lugar de retiro');
            return;
        }
        setCurrentStep(3); // Ir a métodos de pago
    };

    // Crear orden después de seleccionar método de pago
    const crearOrdenConPago = async () => {
        if (!metodoPagoSeleccionado) {
            toast.error('Selecciona un método de pago');
            return;
        }

        // Si es Stripe, no crear orden todavía, ir directo al formulario de pago
        if (metodoPagoSeleccionado === 'stripe') {
            setCurrentStep(4);
            return;
        }

        // Para QR y Transferencia, crear la orden primero
        try {
            setLoading(true);
            const data = await fetchDataBackend(
                `${import.meta.env.VITE_BACKEND_URL}/estudiante/orden`,
                {
                    method: 'POST',
                    body: {
                        productoId,
                        cantidad: cantidad.toString(),
                        metodoPagoVendedorId: metodoPagoSeleccionado,
                        lugarRetiro: lugarRetiro || undefined
                    },
                    config: { 
                        headers: { Authorization: `Bearer ${token}` } 
                    }
                }
            );

            setOrdenCreada(data.orden);
            setCurrentStep(4); // Ir a subir comprobante
        } catch (error) {
            toast.error(error.message || 'Error al crear la orden');
        } finally {
            setLoading(false);
        }
    };

    // Subir comprobante (para QR y Transferencia)
    const subirComprobante = async () => {
        if (!archivoComprobante) {
            toast.error('Selecciona un comprobante de pago');
            return;
        }

        try {
            setLoading(true);
            const formData = new FormData();
            formData.append('comprobante', archivoComprobante);

            const response = await fetch(
                `${import.meta.env.VITE_BACKEND_URL}/estudiante/orden/${ordenCreada._id}/comprobante`,
                {
                    method: 'POST',
                    headers: { Authorization: `Bearer ${token}` },
                    body: formData
                }
            );

            const data = await response.json();
            if (!response.ok) throw new Error(data.msg);

            toast.success('¡Comprobante subido! Tu orden está pendiente de confirmación');
            setTimeout(() => navigate('/dashboard/estudiante/historial-pagos'), 2000);
        } catch (error) {
            toast.error(error.message || 'Error al subir comprobante');
        } finally {
            setLoading(false);
        }
    };

    // Pago exitoso con Stripe
    const handlePagoStripeExitoso = () => {
        toast.success('¡Pago completado exitosamente!');
        setTimeout(() => navigate('/dashboard/estudiante/historial-pagos'), 2000);
    };

    const metodoPagoElegido = metodosPago.find(m => m._id === metodoPagoSeleccionado);
    const total = producto ? (producto.precio * cantidad).toFixed(2) : '0.00';

    if (loading && !producto) {
        return (
            <>
                <Header />
                <div className="flex justify-center items-center min-h-screen">
                    <Loader2 className="w-12 h-12 animate-spin text-blue-600" />
                </div>
            </>
        );
    }

    return (
        <>
            <Header />
            <div className="container mx-auto px-4 py-8 max-w-6xl">
                {/* Steps Indicator */}
                <div className="mb-8">
                    <div className="flex items-center justify-between">
                        {[
                            { num: 1, label: 'Detalle del Pedido' },
                            ...(tieneRetiro ? [{ num: 2, label: 'Lugar de Retiro' }] : []),
                            { num: tieneRetiro ? 3 : 2, label: 'Método de Pago' },
                            { num: tieneRetiro ? 4 : 3, label: 'Confirmación' }
                        ].map((step, idx, arr) => (
                            <React.Fragment key={step.num}>
                                <div className="flex flex-col items-center">
                                    <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg
                                        ${currentStep >= step.num ? 'bg-blue-600 text-white' : 'bg-gray-300 text-gray-600'}`}>
                                        {currentStep > step.num ? <Check className="w-6 h-6" /> : step.num}
                                    </div>
                                    <span className="text-xs mt-2 text-center">{step.label}</span>
                                </div>
                                {idx < arr.length - 1 && (
                                    <div className={`flex-1 h-1 mx-2 ${currentStep > step.num ? 'bg-blue-600' : 'bg-gray-300'}`} />
                                )}
                            </React.Fragment>
                        ))}
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Resumen del Producto */}
                    <div className="lg:col-span-1">
                        <div className="bg-white rounded-lg shadow-md p-6 sticky top-4">
                            <h3 className="text-lg font-bold mb-4 flex items-center gap-2 text-blue-800">
                                <Package className="w-5 h-5" />
                                Resumen de Compra
                            </h3>
                            {producto && (
                                <>
                                    <img
                                        src={producto.imagen || '/placeholder.jpg'}
                                        alt={producto.nombreProducto}
                                        className="w-full h-48 object-cover rounded-lg mb-4 shadow-sm"
                                    />

                                    {/* Info del Producto */}
                                    <div className="mb-4">
                                        <h4 className="font-bold text-lg text-gray-800 mb-1">{producto.nombreProducto}</h4>
                                        <p className="text-sm text-gray-600 line-clamp-2">{producto.descripcion}</p>
                                    </div>

                                    {/* Categoría */}
                                    {producto.categoria && (
                                        <div className="mb-3">
                                            <span className="inline-block bg-blue-100 text-blue-800 text-xs font-semibold px-3 py-1 rounded-full">
                                                {producto?.categoria?.nombreCategoria || 'Sin categoría'}
                                            </span>
                                        </div>
                                    )}

                                    {/* Vendedor */}
                                    <div className="bg-gray-50 rounded-lg p-3 mb-4">
                                        <p className="text-xs text-gray-500 mb-1">Vendedor</p>
                                        <p className="font-semibold text-gray-800">
                                            {producto.vendedor?.nombre || 'PoliVentas'} {producto.vendedor?.apellido || ''}
                                        </p>
                                    </div>

                                    {/* Stock disponible */}
                                    <div className="mb-4">
                                        <p className="text-sm text-gray-600">
                                            Stock disponible: <span className="font-semibold text-green-600">{producto.stock} unidades</span>
                                        </p>
                                    </div>

                                    {/* Detalles de compra */}
                                    <div className="border-t border-gray-200 pt-4 space-y-3">
                                        <div className="flex justify-between items-center">
                                            <span className="text-gray-600">Precio unitario:</span>
                                            <span className="font-semibold text-gray-800">${producto.precio.toFixed(2)}</span>
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <span className="text-gray-600">Cantidad:</span>
                                            {currentStep === 1 ? (
                                                <input
                                                    type="number"
                                                    min="1"
                                                    max={producto.stock}
                                                    value={cantidad}
                                                    onChange={(e) => setCantidad(Math.min(producto.stock, Math.max(1, parseInt(e.target.value) || 1)))}
                                                    className="w-20 px-3 py-1 border-2 border-blue-300 rounded-lg text-center font-semibold focus:border-blue-500 focus:outline-none"
                                                />
                                            ) : (
                                                <span className="font-semibold text-gray-800">{cantidad}</span>
                                            )}
                                        </div>
                                        <div className="border-t-2 border-blue-200 pt-3 mt-3 flex justify-between items-center">
                                            <span className="text-lg font-bold text-gray-800">Total:</span>
                                            <span className="text-2xl font-bold text-blue-600">${total}</span>
                                        </div>
                                    </div>

                                    {/* Estado del producto */}
                                    <div className="mt-4 flex items-center gap-2 text-sm">
                                        <div className="flex items-center gap-1 text-green-600">
                                            <CheckCircle className="w-4 h-4" />
                                            <span className="font-medium">Disponible</span>
                                        </div>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>

                    {/* Contenido Principal */}
                    <div className="lg:col-span-2">
                        <div className="bg-white rounded-lg shadow-md p-6">
                            
                            {/* PASO 1: Detalle del Pedido */}
                            {currentStep === 1 && (
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
                                        onClick={continuarDesdePaso1}
                                        className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition flex items-center justify-center gap-2"
                                    >
                                        Continuar
                                        <ChevronRight className="w-5 h-5" />
                                    </button>
                                </div>
                            )}

                            {/* PASO 2: Elegir Lugar de Retiro (solo si tiene retiro) */}
                            {currentStep === 2 && tieneRetiro && (
                                <div>
                                    <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                                        <MapPin className="w-6 h-6" />
                                        Elige el Lugar de Retiro
                                    </h2>

                                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
                                        <p className="text-sm text-gray-700 mb-4">
                                            Selecciona el lugar donde recogerás tu producto:
                                        </p>
                                        
                                        {metodosPago.find(m => m.tipo === 'retiro')?.lugares?.map((lugar) => (
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
                                                    onChange={(e) => setLugarRetiro(e.target.value)}
                                                    className="w-5 h-5 text-blue-600"
                                                />
                                                <span className="text-gray-800 font-medium">{lugar}</span>
                                                {lugarRetiro === lugar && (
                                                    <CheckCircle className="w-5 h-5 text-blue-600 ml-auto" />
                                                )}
                                            </label>
                                        ))}
                                    </div>

                                    <button
                                        onClick={continuarDesdePaso2}
                                        disabled={!lugarRetiro}
                                        className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition disabled:opacity-50 flex items-center justify-center gap-2"
                                    >
                                        Continuar
                                        <ChevronRight className="w-5 h-5" />
                                    </button>
                                </div>
                            )}


                            {/* PASO 3: Elegir Método de Pago */}
                            {currentStep === 3 && (
                                <div>
                                    <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                                        <CreditCard className="w-6 h-6" />
                                        Elige tu Método de Pago
                                    </h2>

                                    {metodosPago.length === 0 ? (
                                        <div className="text-center py-12">
                                            <AlertCircle className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
                                            <p className="text-gray-600 mb-2">Este vendedor aún no ha configurado métodos de pago.</p>
                                            <button
                                                onClick={() => navigate(-1)}
                                                className="mt-4 text-blue-600 hover:underline"
                                            >
                                                Volver al producto
                                            </button>
                                        </div>
                                    ) : (
                                        <div className="space-y-4 mb-6">
                                            {/* Filtrar solo métodos que NO sean retiro */}
                                            {metodosPago.filter(m => m.tipo !== 'retiro').map((metodo) => (
                                                <div
                                                    key={metodo._id}
                                                    onClick={() => setMetodoPagoSeleccionado(metodo._id)}
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
                                                onClick={() => setMetodoPagoSeleccionado('stripe')}
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

                                    {metodoPagoSeleccionado && (
                                        <button
                                            onClick={crearOrdenConPago}
                                            disabled={loading}
                                            className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition disabled:opacity-50 flex items-center justify-center gap-2"
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
                            )}

                            {/* PASO 4: Subir Comprobante o Mensaje Final */}
                            {currentStep === 4 && (
  <div>
    {metodoPagoSeleccionado === 'stripe' ? (
      <>
        <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
          <CreditCard className="w-6 h-6" />
          Pagar con Tarjeta
        </h2>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <p className="text-sm"><strong>Total a pagar:</strong> <span className="text-lg font-bold text-blue-600">${total}</span></p>
          {lugarRetiro && (
            <p className="text-sm mt-2"><strong>Lugar de retiro:</strong> {lugarRetiro}</p>
          )}
        </div>

        <Elements stripe={stripePromise}>
          <FormularioStripe
            productoId={productoId}
            cantidad={cantidad}
            metodoPagoVendedorId="stripe"
            lugarRetiro={lugarRetiro}
            onSuccess={handlePagoStripeExitoso}
          />
        </Elements>
      </>
    ) : (
      <>
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
            onChange={(e) => setArchivoComprobante(e.target.files[0])}
            className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
          />
          {archivoComprobante && (
            <p className="mt-2 text-sm text-green-600 flex items-center gap-1">
              <CheckCircle className="w-4 h-4" />
              {archivoComprobante.name}
            </p>
          )}
        </div>

        <button
          onClick={subirComprobante}
          disabled={loading || !archivoComprobante}
          className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition disabled:opacity-50 flex items-center justify-center gap-2"
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
      </>
    )}
  </div>
)}

                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default CompraDirecta;
