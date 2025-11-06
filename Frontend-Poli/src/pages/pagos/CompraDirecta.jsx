import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { toast } from 'react-toastify';
import {
    CreditCard,
    CheckCircle,
    Package,
    Loader2,
    Check,
    ChevronRight,
    ShieldCheck
} from 'lucide-react';
import Header from '../../layout/Header';
import useFetch from '../../hooks/useFetch';
import storeAuth from '../../context/storeAuth';
import {
    Paso1DetalleDelPedido,
    Paso2LugarRetiro,
    Paso3MetodoPago,
    Paso4SubirComprobante
} from './CompraDirectaComponents';
import ResumenCompra from './ResumenCompra';

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY);

// ==================== COMPONENTE FORMULARIO STRIPE ====================
const FormularioStripe = ({ productoId, cantidad, metodoPagoVendedorId, lugarRetiro, onSuccess, onRegresar }) => {
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

            onSuccess();
        } catch (error) {
            toast.error(error.message || 'Error al procesar el pago');
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handlePagoStripe} className="space-y-6">
            {/* Card principal */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
                <div className="p-8">
                    {/* Header con sombra e indicador de seguridad */}
                    <div className="flex items-center gap-4 mb-8">

                        <div>
                            <h3 className="text-lg font-semibold text-gray-800">
                                Información de pago
                            </h3>
                            <div className="flex items-center gap-2 mt-1">
                                <ShieldCheck className="w-5 h-5 text-blue-600" />
                                <p className="text-sm text-gray-600 font-medium">
                                    Transacción encriptada (Stripe)
                                </p>
                            </div>

                        </div>
                    </div>

                    {/* Campo de tarjeta sin hover llamativo */}
                    <div className="mb-6">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Detalles de la tarjeta
                        </label>

                        <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                            {!stripe ? (
                                <div className="py-10 text-center">
                                    <Loader2 className="w-6 h-6 animate-spin mx-auto text-blue-600 mb-2" />
                                    <p className="text-sm text-gray-600">
                                        Cargando formulario de pago...
                                    </p>
                                </div>
                            ) : (
                                <CardElement
                                    options={{
                                        style: {
                                            base: {
                                                fontSize: '16px',
                                                color: '#1f2937',
                                                fontFamily:
                                                    '"Inter", "SF Pro Display", system-ui, sans-serif',
                                                '::placeholder': { color: '#9ca3af' },
                                            },
                                            invalid: { color: '#dc2626' },
                                            complete: { color: '#059669' },
                                        },
                                    }}
                                />
                            )}
                        </div>
                    </div>

                    {/* Logos de tarjetas con hover suave */}
                    <div className="mb-6 flex items-center justify-center gap-3">
                        <span className="text-xs font-semibold text-gray-500">
                            Aceptamos:
                        </span>
                        <div className="flex gap-2.5">
                            {/* Visa */}
                            <div className="w-12 h-8 bg-gradient-to-br from-blue-600 via-blue-700 to-blue-800 rounded-md flex items-center justify-center shadow-md transition-transform duration-200 hover:scale-105">
                                <span className="text-white text-[11px] font-bold tracking-wider">
                                    VISA
                                </span>
                            </div>
                            {/* Mastercard */}
                            <div className="w-12 h-8 bg-gradient-to-br from-gray-700 via-gray-800 to-gray-900 rounded-md flex items-center justify-center shadow-md transition-transform duration-200 hover:scale-105">
                                <div className="flex gap-[1px]">
                                    <div className="w-2.5 h-2.5 bg-gradient-to-br from-red-500 to-red-600 rounded-full"></div>
                                    <div className="w-2.5 h-2.5 bg-gradient-to-br from-orange-400 to-orange-500 rounded-full -ml-1"></div>
                                </div>
                            </div>
                            {/* Amex */}
                            <div className="w-12 h-8 bg-gradient-to-br from-blue-800 via-blue-900 to-slate-900 rounded-md flex items-center justify-center shadow-md transition-transform duration-200 hover:scale-105">
                                <span className="text-white text-[10px] font-bold tracking-wide">
                                    AMEX
                                </span>
                            </div>
                            {/* Discover */}
                            <div className="w-12 h-8 bg-gradient-to-br from-orange-500 via-orange-600 to-orange-700 rounded-md flex items-center justify-center shadow-md transition-transform duration-200 hover:scale-105">
                                <span className="text-white text-[9px] font-bold tracking-wide">
                                    DISCOVER
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Badge de seguridad */}
                    <div className="flex items-center justify-center text-sm text-green-600">
                        <CheckCircle className="w-5 h-5 mr-1" />
                        <span>Pagos seguros</span>
                    </div>
                </div>
            </div>

            {/* Botones */}
            <div className="flex gap-4">
                <button
                    type="button"
                    onClick={onRegresar}
                    className="w-1/3 bg-gray-100 text-gray-700 py-3 rounded-lg font-medium border border-gray-300 flex items-center justify-center gap-2"
                >
                    <ChevronRight className="w-5 h-5 rotate-180" />
                    Regresar
                </button>

                <button
                    type="submit"
                    disabled={!stripe || loading}
                    className="w-2/3 bg-blue-600 text-white py-3 rounded-lg font-medium flex items-center justify-center gap-2 disabled:opacity-50"
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

                // Cargar métodos de pago del vendedor específico del producto
                if (dataProducto?.vendedor?._id) {

                    try {
                        const responseMetodos = await fetchDataBackend(
                            `${import.meta.env.VITE_BACKEND_URL}/vendedor/pago?vendedorId=${dataProducto.vendedor._id}`,
                            { method: 'GET', config: { headers: { Authorization: `Bearer ${token}` } } }
                        );

                        console.log('✅ Respuesta del backend:', responseMetodos);

                        const metodos = responseMetodos?.metodos || [];

                        setMetodosPago(metodos);

                        // Verificar si tiene retiro disponible
                        const metodoRetiro = metodos.find(m => m.tipo === 'retiro');
                        setTieneRetiro(!!metodoRetiro);

                        if (metodos.length === 0) {
                            console.warn(` El vendedor ${dataProducto.vendedor.nombre} (ID: ${dataProducto.vendedor._id}) no tiene métodos de pago configurados`);
                        } else {
                            console.log(`Métodos de pago configurados:`, metodos.map(m => ({ tipo: m.tipo, id: m._id })));
                        }
                    } catch (errorMetodos) {
                        setMetodosPago([]);
                        setTieneRetiro(false);
                    }
                } else {
                    setMetodosPago([]);
                    setTieneRetiro(false);
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

            setTimeout(() => navigate('/dashboard/estudiante/historial-pagos'), 2000);
        } catch (error) {
            toast.error(error.message || 'Error al subir comprobante');
        } finally {
            setLoading(false);
        }
    };

    // Pago exitoso con Stripe
    const handlePagoStripeExitoso = () => {
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
            <div className="container mx-auto px-4 py-8 max-w-6xl mt-12">
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
                        <ResumenCompra
                            producto={producto}
                            cantidad={cantidad}
                            total={total}
                            currentStep={currentStep}
                            onCantidadChange={(e) => setCantidad(Math.min(producto.stock, Math.max(1, parseInt(e.target.value) || 1)))}
                        />
                    </div>

                    {/* Contenido Principal */}
                    <div className="lg:col-span-2">
                        <div className="bg-white rounded-lg shadow-md p-6">

                            {/* PASO 1: Detalle del Pedido */}
                            {currentStep === 1 && (
                                <Paso1DetalleDelPedido
                                    producto={producto}
                                    cantidad={cantidad}
                                    total={total}
                                    onContinuar={continuarDesdePaso1}
                                />
                            )}

                            {/* PASO 2: Elegir Lugar de Retiro (solo si tiene retiro) */}
                            {currentStep === 2 && tieneRetiro && (
                                <Paso2LugarRetiro
                                    lugares={metodosPago.find(m => m.tipo === 'retiro')?.lugares}
                                    lugarRetiro={lugarRetiro}
                                    onSelectLugar={setLugarRetiro}
                                    onContinuar={continuarDesdePaso2}
                                    onRegresar={() => setCurrentStep(1)}
                                />
                            )}


                            {/* PASO 3: Elegir Método de Pago */}
                            {currentStep === 3 && (
                                <Paso3MetodoPago
                                    metodosPago={metodosPago}
                                    metodoPagoSeleccionado={metodoPagoSeleccionado}
                                    onSelectMetodo={setMetodoPagoSeleccionado}
                                    onContinuar={crearOrdenConPago}
                                    onRegresar={() => setCurrentStep(tieneRetiro ? 2 : 1)}
                                    loading={loading}
                                    tieneRetiro={tieneRetiro}
                                    navigate={navigate}
                                />
                            )}

                            {/* PASO 4: Subir Comprobante o Mensaje Final */}
                            {currentStep === 4 && (
                                <div>
                                    {metodoPagoSeleccionado === 'stripe' ? (
                                        <>
                                            <div className="flex items-center gap-3 mb-6">
                                                <div className="bg-gradient-to-br from-blue-500 to-blue-600 p-2.5 rounded-lg">
                                                    <CreditCard className="w-6 h-6 text-white" />
                                                </div>
                                                <h2 className="text-xl font-bold text-gray-900">
                                                    Pago Seguro con Tarjeta
                                                </h2>
                                            </div>

                                            <div className=" border border-gray-200 rounded-lg p-4 mb-6">
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
                                                    onRegresar={() => setCurrentStep(3)}
                                                />
                                            </Elements>
                                        </>
                                    ) : (
                                        <Paso4SubirComprobante
                                            metodoPagoElegido={metodoPagoElegido}
                                            total={total}
                                            archivoComprobante={archivoComprobante}
                                            onFileChange={(e) => setArchivoComprobante(e.target.files[0])}
                                            onSubmit={subirComprobante}
                                            onRegresar={() => setCurrentStep(3)}
                                            loading={loading}
                                        />
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
