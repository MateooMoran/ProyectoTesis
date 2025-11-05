import React, { useState, useEffect } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { CreditCard, QrCode, DollarSign, Plus, Trash2, Save, Eye, X, MapPin } from 'lucide-react';
import storeAuth from '../../context/storeAuth';

const MetodoPagoVendedorForm = () => {
    const [tipoSeleccionado, setTipoSeleccionado] = useState('transferencia');
    const [guardando, setGuardando] = useState(false);
    const [metodosGuardados, setMetodosGuardados] = useState({});
    const [modalVisible, setModalVisible] = useState(false);
    const [modalContent, setModalContent] = useState(null);
    const token = storeAuth(state => state.token);

    const { register, handleSubmit, control, watch, reset } = useForm({
        defaultValues: {
            banco: '',
            numeroCuenta: '',
            titular: '',
            cedula: '',
            lugares: [{ lugar: '' }], // ← CORRECTO: lugar
            qr: null
        }
    });

    const { fields, append, remove } = useFieldArray({
        control,
        name: 'lugares' // ← CORRECTO
    });

    const qrFile = watch('qr');

    const cargarMetodos = async () => {
        try {
            const tipos = ['transferencia', 'qr', 'retiro'];
            const resultados = {};

            for (const tipo of tipos) {
                const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/vendedor/pago/${tipo}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });

                if (res.ok) {
                    const data = await res.json();
                    resultados[tipo] = data.metodos?.[0] || data.metodo || data || null;
                }
            }

            setMetodosGuardados(resultados);
        } catch (err) {
            console.error(err);
        }
    };

    useEffect(() => {
        cargarMetodos();
    }, []);

    const onSubmit = async (formData) => {
        setGuardando(true);
        try {
            let endpoint = '';
            let body = null;
            let headers = { Authorization: `Bearer ${token}` };

            if (tipoSeleccionado === 'transferencia') {
                endpoint = '/vendedor/pago/transferencia';
                if (!formData.banco || !formData.numeroCuenta || !formData.titular || !formData.cedula) {
                    toast.error('Todos los campos son obligatorios');
                    setGuardando(false);
                    return;
                }
                body = JSON.stringify({
                    banco: formData.banco,
                    numeroCuenta: formData.numeroCuenta,
                    titular: formData.titular,
                    cedula: formData.cedula
                });
                headers['Content-Type'] = 'application/json';

            } else if (tipoSeleccionado === 'qr') {
                endpoint = '/vendedor/pago/qr';
                body = new FormData();
                if (qrFile?.[0]) {
                    body.append('comprobante', qrFile[0]);
                } else {
                    toast.error('Debes subir una imagen QR');
                    setGuardando(false);
                    return;
                }

            } else if (tipoSeleccionado === 'retiro') {
                endpoint = '/vendedor/pago/retiro';
                const lugares = formData.lugares
                    .map(l => l.lugar)
                    .filter(l => l?.trim());

                if (lugares.length === 0) {
                    toast.error('Debes agregar al menos un lugar de retiro');
                    setGuardando(false);
                    return;
                }

                body = JSON.stringify({ lugares }); // ← CORRECTO: { lugares: [...] }
                headers['Content-Type'] = 'application/json';
            }

            const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}${endpoint}`, {
                method: 'POST',
                headers,
                body
            });

            const data = await res.json();

            if (!res.ok) {
                if (Array.isArray(data.errores) && data.errores.length > 0) {
                    data.errores.forEach(err => toast.error(err.msg));
                } else {
                    toast.error(data.msg || 'Error al guardar el método de pago');
                }
                setGuardando(false);
                return;
            }

            toast.success('Método de pago guardado correctamente');
            reset();
            cargarMetodos();

        } catch (err) {
            console.error(err);
            toast.error('Error de conexión');
        } finally {
            setGuardando(false);
        }
    };

    const tiposPago = [
        { value: 'transferencia', label: 'Transferencia Bancaria', icon: CreditCard },
        { value: 'qr', label: 'Código QR', icon: QrCode },
        { value: 'retiro', label: 'Retiro', icon: DollarSign }
    ];

    return (
        <>
            <ToastContainer />
            <div className="mt-24 md:mt-10"></div>

            <div className="bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 py-4 lg:py-8 px-4">
                <div className="max-w-5xl mx-auto">

                    {/* Encabezado */}
                    <div className="text-center mb-6 lg:mb-8">
                        <h1 className="text-2xl lg:text-3xl font-bold text-gray-700">
                            Configurar Método de Pago
                        </h1>
                        <p className="text-sm lg:text-base text-gray-600">
                            Define cómo recibirás los pagos de tus ventas
                        </p>
                    </div>

                    {/* ADVERTENCIA */}
                    <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded mb-4">
                        <p className="text-yellow-800 text-sm">
                            Solo puedes tener un método de pago por tipo. Si ya existe, puedes actualizarlo.
                        </p>
                    </div>

                    {/* Selector de tipo */}
                    <div className="bg-white rounded-lg shadow-md border border-gray-200 p-4 mb-4">
                        <label className="block text-sm font-semibold text-gray-700 mb-3">
                            Selecciona el tipo de pago
                        </label>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                            {tiposPago.map(tipo => {
                                const Icon = tipo.icon;
                                return (
                                    <div key={tipo.value} className="flex flex-col gap-2">
                                        <button
                                            type="button"
                                            onClick={() => setTipoSeleccionado(tipo.value)}
                                            className={`p-4 rounded-lg border-2 transition-all duration-200 w-full ${tipoSeleccionado === tipo.value
                                                    ? 'border-blue-600 bg-blue-50 shadow-md'
                                                    : 'border-gray-200 hover:border-blue-300 hover:bg-gray-50'
                                                }`}
                                        >
                                            <Icon
                                                className={`mx-auto mb-2 ${tipoSeleccionado === tipo.value ? 'text-blue-600' : 'text-gray-400'}`}
                                                size={24}
                                            />
                                            <span className={`block text-sm font-medium ${tipoSeleccionado === tipo.value ? 'text-blue-600' : 'text-gray-700'}`}>
                                                {tipo.label}
                                            </span>
                                        </button>

                                        {/* BOTÓN VER MÉTODO */}
                                        {metodosGuardados[tipo.value] && (
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    setModalContent({ ...metodosGuardados[tipo.value], tipo: tipo.label });
                                                    setModalVisible(true);
                                                }}
                                                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-3 rounded-lg transition flex items-center justify-center gap-2 text-sm font-medium shadow"
                                            >
                                                <Eye size={16} /> Ver Método Guardado
                                            </button>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Formulario */}
                    <form onSubmit={handleSubmit(onSubmit)} className="bg-white rounded-lg shadow-md border border-gray-200 p-4">

                        {/* Transferencia */}
                        {tipoSeleccionado === 'transferencia' && (
                            <div className="space-y-4">
                                {['banco', 'numeroCuenta', 'titular', 'cedula'].map(field => (
                                    <div key={field}>
                                        <label className="block text-sm font-medium text-gray-800 mb-1">
                                            {field === 'banco' && 'Banco'}
                                            {field === 'numeroCuenta' && 'Número de Cuenta'}
                                            {field === 'titular' && 'Titular de la Cuenta'}
                                            {field === 'cedula' && 'Cédula del Titular'} *
                                        </label>
                                        <input
                                            {...register(field)}
                                            placeholder={`Ingresa ${field === 'banco' ? 'el banco' : field === 'numeroCuenta' ? 'el número' : field === 'titular' ? 'el titular' : 'la cédula'}`}
                                            className="w-full border border-gray-300 rounded-lg p-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            disabled={guardando}
                                        />
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* QR */}
                        {tipoSeleccionado === 'qr' && (
                            <div className="space-y-4">
                                <input
                                    type="file"
                                    {...register('qr')}
                                    accept="image/*"
                                    className="w-full text-sm text-gray-600 file:mr-3 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-purple-50 file:text-purple-700 hover:file:bg-purple-100 transition"
                                    disabled={guardando}
                                />
                                {qrFile?.[0] && (
                                    <img
                                        src={URL.createObjectURL(qrFile[0])}
                                        alt="Código QR"
                                        className="max-w-xs mt-4 rounded-lg shadow-md border border-gray-200"
                                    />
                                )}
                            </div>
                        )}

                        {/* RETIRO - CORREGIDO */}
                        {tipoSeleccionado === 'retiro' && (
                            <div className="space-y-4">
                                {fields.map((field, index) => (
                                    <div key={field.id} className="flex gap-2 mb-2">
                                        <input
                                            {...register(`lugares.${index}.lugar`)} // ← CORRECTO
                                            placeholder={`Lugar ${index + 1}`}
                                            className="flex-1 border border-gray-300 rounded-lg p-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                                            disabled={guardando}
                                        />
                                        {fields.length > 1 && (
                                            <button
                                                type="button"
                                                onClick={() => remove(index)}
                                                className="bg-red-500 text-white px-3 py-2 rounded-lg hover:bg-red-600 transition"
                                                disabled={guardando}
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        )}
                                    </div>
                                ))}

                                {fields.length < 3 && (
                                    <button
                                        type="button"
                                        onClick={() => append({ lugar: '' })} // ← CORRECTO
                                        className="w-full bg-green-50 text-green-700 border-2 border-dashed border-green-300 py-2 rounded-lg hover:bg-green-100 transition flex items-center justify-center gap-2 font-medium"
                                        disabled={guardando}
                                    >
                                        <Plus size={18} />
                                        Añadir otro lugar
                                    </button>
                                )}

                                {fields.length >= 3 && (
                                    <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded mb-4">
                                        <p className="text-yellow-800 text-sm">
                                            Solo puedes agregar hasta 3 lugares.
                                        </p>
                                    </div>
                                )}
                            </div>
                        )}

                        <div className="mt-6 pt-4 border-t border-gray-200">
                            <button
                                type="submit"
                                disabled={guardando}
                                className="w-full bg-gradient-to-r from-blue-800 to-blue-900 text-white py-3 px-4 rounded-lg hover:from-blue-700 hover:to-blue-800 transition font-semibold text-base flex items-center justify-center gap-2 shadow-lg disabled:opacity-50"
                            >
                                <Save size={18} />
                                {guardando ? 'Guardando...' : 'Guardar Método de Pago'}
                            </button>
                        </div>
                    </form>

                    {/* MODAL */}
                    {modalVisible && modalContent && (
                        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                            <div className="bg-white p-6 rounded-lg max-w-md w-full relative shadow-xl">
                                <button
                                    className="absolute top-3 right-3 text-gray-500 hover:text-gray-700 transition"
                                    onClick={() => setModalVisible(false)}
                                >
                                    <X size={20} />
                                </button>

                                <h2 className="text-xl font-bold text-gray-800 mb-4 pr-8">
                                    {modalContent.tipo || 'Método de Pago'}
                                </h2>

                                {modalContent.banco && (
                                    <div className="space-y-2">
                                        <p className="text-sm text-gray-500 font-semibold mb-3">Detalles de Transferencia:</p>
                                        <div className="bg-gray-50 p-3 rounded-lg space-y-2">
                                            <p className="text-sm"><span className="font-semibold text-gray-700">Banco:</span> <span className="text-gray-600">{modalContent.banco}</span></p>
                                            <p className="text-sm"><span className="font-semibold text-gray-700">N° Cuenta:</span> <span className="text-gray-600">{modalContent.numeroCuenta}</span></p>
                                            <p className="text-sm"><span className="font-semibold text-gray-700">Titular:</span> <span className="text-gray-600">{modalContent.titular}</span></p>
                                            <p className="text-sm"><span className="font-semibold text-gray-700">Cédula:</span> <span className="text-gray-600">{modalContent.cedula}</span></p>
                                        </div>
                                    </div>
                                )}

                                {modalContent.lugares?.length > 0 && (
                                    <div>
                                        <p className="text-sm text-gray-500 font-semibold mb-3">Lugares de Retiro:</p>
                                        <ul className="bg-gray-50 p-3 rounded-lg space-y-2">
                                            {modalContent.lugares.map((lugar, idx) => (
                                                <li
                                                    key={idx}
                                                    className="text-sm text-gray-700 flex items-center gap-2 p-2 rounded-md hover:bg-gray-200 transition"
                                                >
                                                    <MapPin size={16} className="text-neutral-700" />
                                                    <span className="font-medium">{lugar}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                )}

                                {modalContent.imagenComprobante && (
                                    <div>
                                        <p className="text-sm text-gray-500 font-semibold mb-3">Código QR:</p>
                                        <img
                                            src={modalContent.imagenComprobante}
                                            alt="QR"
                                            className="w-full max-w-sm mx-auto rounded-lg border shadow-md"
                                        />
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
};

export default MetodoPagoVendedorForm;