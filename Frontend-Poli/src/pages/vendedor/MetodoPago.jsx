import React, { useState } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { CreditCard, QrCode, DollarSign, Plus, Trash2, Save } from 'lucide-react';
import storeAuth from '../../context/storeAuth';

const MetodoPagoVendedorForm = () => {
    const [metodoActual, setMetodoActual] = useState(null);
    const [tipoSeleccionado, setTipoSeleccionado] = useState('transferencia');
    const [guardando, setGuardando] = useState(false);

    const token = storeAuth(state => state.token);

    const { register, handleSubmit, control, watch } = useForm({
        defaultValues: {
            banco: '',
            numeroCuenta: '',
            titular: '',
            cedula: '',
            lugarRetiro: [{ lugar: '' }],
            qr: null
        }
    });

    const { fields, append, remove } = useFieldArray({
        control,
        name: "lugarRetiro"
    });

    const qrFile = watch('qr');

    const onSubmit = async (formData) => {
        setGuardando(true);
        try {
            const body = new FormData();
            body.append('tipo', tipoSeleccionado);

            if (tipoSeleccionado === 'transferencia') {
                if (!formData.banco || !formData.numeroCuenta || !formData.titular || !formData.cedula) {
                    toast.error('Todos los campos son obligatorios');
                    setGuardando(false);
                    return;
                }
                body.append('banco', formData.banco);
                body.append('numeroCuenta', formData.numeroCuenta);
                body.append('titular', formData.titular);
                body.append('cedula', formData.cedula);
            } else if (tipoSeleccionado === 'qr') {
                if (qrFile?.[0]) {
                    body.append('comprobante', qrFile[0]);
                } else if (!metodoActual?.qr) {
                    toast.error('Debes subir una imagen QR');
                    setGuardando(false);
                    return;
                }
            } else if (tipoSeleccionado === 'efectivo') {
                const lugares = formData.lugarRetiro.map(l => l.lugar).filter(l => l.trim());
                if (lugares.length === 0) {
                    toast.error('Debes agregar al menos un lugar de retiro');
                    setGuardando(false);
                    return;
                }
                body.append('lugarRetiro', JSON.stringify(lugares));
            }

            const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/vendedor/metodo-pago`, {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${token}`
                },
                body
            });

            const data = await res.json();

            if (!res.ok) {
                toast.error(data.msg || 'Error al actualizar el método de pago');
                setGuardando(false);
                return;
            }

            toast.success('Método de pago actualizado exitosamente');
            setMetodoActual(data.metodo);

        } catch (err) {
            console.error(err);
            toast.error('Error desconocido al actualizar el método de pago');
        } finally {
            setGuardando(false);
        }
    };

    const tiposPago = [
        { value: 'transferencia', label: 'Transferencia Bancaria', icon: CreditCard },
        { value: 'qr', label: 'Código QR', icon: QrCode },
        { value: 'efectivo', label: 'Efectivo', icon: DollarSign }
    ];

    return (
        <>
            <ToastContainer />
            <div className="mt-34 md:mt-14"></div>

            <div className="bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 py-4 lg:py-8 px-4">
                <div className="max-w-4xl mx-auto">
                    {/* Encabezado */}
                    <div className="text-center mb-6 lg:mb-8">
                        <div className="flex items-center justify-center gap-2 lg:gap-3 mb-2 lg:mb-3">
                            <h1 className="text-2xl lg:text-3xl font-bold text-gray-700">
                                Configurar Método de Pago
                            </h1>
                        </div>
                        <p className="text-sm lg:text-base text-gray-600">
                            Define cómo recibirás los pagos de tus ventas
                        </p>
                    </div>

                    {/* Selector de tipo de pago */}
                    <div className="bg-white rounded-lg lg:rounded-xl shadow-md border border-gray-200 p-4 lg:p-6 mb-4 lg:mb-6">
                        <label className="block text-sm font-semibold text-gray-700 mb-3 lg:mb-4">
                            Selecciona el tipo de pago
                        </label>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 lg:gap-4">
                            {tiposPago.map(tipo => {
                                const Icon = tipo.icon;
                                return (
                                    <button
                                        key={tipo.value}
                                        type="button"
                                        onClick={() => setTipoSeleccionado(tipo.value)}
                                        className={`p-3 lg:p-4 rounded-lg border-2 transition-all duration-200 ${
                                            tipoSeleccionado === tipo.value
                                                ? 'border-blue-600 bg-blue-50 shadow-md'
                                                : 'border-gray-200 hover:border-blue-300 hover:bg-gray-50'
                                        }`}
                                    >
                                        <Icon
                                            className={`mx-auto mb-1 lg:mb-2 ${
                                                tipoSeleccionado === tipo.value ? 'text-blue-600' : 'text-gray-400'
                                            }`}
                                            size={24}
                                        />
                                        <span className={`block text-xs lg:text-sm font-medium ${
                                            tipoSeleccionado === tipo.value ? 'text-blue-600' : 'text-gray-700'
                                        }`}>{tipo.label}</span>
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* Formulario */}
                    <form onSubmit={handleSubmit(onSubmit)} className="bg-white rounded-lg lg:rounded-xl shadow-md border border-gray-200 p-4 lg:p-6">

                        {/* Transferencia */}
                        {tipoSeleccionado === 'transferencia' && (
                            <div className="space-y-4">
                                <div className="bg-blue-50 border-l-4 border-blue-600 p-3 lg:p-4 mb-4 lg:mb-6 rounded">
                                    <p className="text-xs lg:text-sm text-blue-800">
                                        <strong>Importante:</strong> Asegúrate de ingresar los datos bancarios correctos.
                                    </p>
                                </div>
                                {['banco', 'numeroCuenta', 'titular', 'cedula'].map(field => (
                                    <div key={field}>
                                        <label className="block text-xs lg:text-sm font-medium text-gray-700 mb-1 lg:mb-2">
                                            {field === 'banco' && 'Banco'}
                                            {field === 'numeroCuenta' && 'Número de Cuenta'}
                                            {field === 'titular' && 'Titular de la Cuenta'}
                                            {field === 'cedula' && 'Cédula del Titular'}
                                            {' *'}
                                        </label>
                                        <input
                                            {...register(field)}
                                            placeholder={field === 'numeroCuenta' ? 'Ej: 2100123456' : `Ingresa ${field}`}
                                            className="w-full border border-gray-300 rounded-lg p-2 lg:p-3 text-sm lg:text-base focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                                            disabled={guardando}
                                        />
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* QR */}
                        {tipoSeleccionado === 'qr' && (
                            <div className="space-y-4">
                                <div className="bg-purple-50 border-l-4 border-purple-600 p-3 lg:p-4 mb-4 lg:mb-6 rounded">
                                    <p className="text-xs lg:text-sm text-purple-800">Sube tu código QR de pago.</p>
                                </div>
                                <input
                                    type="file"
                                    {...register('qr')}
                                    accept="image/*"
                                    className="w-full text-xs lg:text-sm text-gray-600 file:mr-2 lg:file:mr-4 file:py-2 lg:file:py-3 file:px-3 lg:file:px-4 file:rounded-lg file:border-0 file:bg-purple-50 file:text-purple-700 hover:file:bg-purple-100 transition"
                                    disabled={guardando}
                                />
                                {(qrFile?.[0] || metodoActual?.qr) && (
                                    <img
                                        src={qrFile?.[0] ? URL.createObjectURL(qrFile[0]) : metodoActual?.qr}
                                        alt="Código QR"
                                        className="max-w-xs mt-4 rounded-lg shadow-md border border-gray-200"
                                    />
                                )}
                            </div>
                        )}

                        {/* Efectivo */}
                        {tipoSeleccionado === 'efectivo' && (
                            <div className="space-y-4">
                                <div className="bg-green-50 border-l-4 border-green-600 p-3 lg:p-4 mb-4 lg:mb-6 rounded">
                                    <p className="text-xs lg:text-sm text-green-800">Especifica los lugares donde los compradores podrán recoger el producto.</p>
                                </div>
                                {fields.map((field, index) => (
                                    <div key={field.id} className="flex gap-2 mb-2">
                                        <input
                                            {...register(`lugarRetiro.${index}.lugar`)}
                                            placeholder={`Ej: Campus Universidad - Edificio ${index + 1}`}
                                            className="flex-1 border border-gray-300 rounded-lg p-2 lg:p-3 text-sm lg:text-base focus:outline-none focus:ring-2 focus:ring-green-500 transition"
                                            disabled={guardando}
                                        />
                                        {fields.length > 1 && (
                                            <button
                                                type="button"
                                                onClick={() => remove(index)}
                                                className="bg-red-500 text-white px-3 lg:px-4 py-2 lg:py-3 rounded-lg hover:bg-red-600 transition flex items-center gap-1 lg:gap-2"
                                                disabled={guardando}
                                            >
                                                <Trash2 size={16} className="lg:block hidden" />
                                                <Trash2 size={14} className="lg:hidden" />
                                            </button>
                                        )}
                                    </div>
                                ))}
                                <button
                                    type="button"
                                    onClick={() => append({ lugar: '' })}
                                    className="w-full bg-green-50 text-green-700 border-2 border-dashed border-green-300 py-2 lg:py-3 px-4 rounded-lg hover:bg-green-100 transition flex items-center justify-center gap-2 font-medium text-sm lg:text-base"
                                    disabled={guardando}
                                >
                                    <Plus size={18} />
                                    Añadir otro lugar
                                </button>
                            </div>
                        )}

                        <div className="mt-6 lg:mt-8 pt-4 lg:pt-6 border-t border-gray-200">
                            <button
                                type="submit"
                                disabled={guardando}
                                className="w-full bg-gradient-to-r from-blue-800 to-blue-900 text-white py-3 lg:py-4 px-4 lg:px-6 rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all duration-200 font-semibold text-base lg:text-lg flex items-center justify-center gap-2 lg:gap-3 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <Save size={20} className="lg:block hidden" />
                                <Save size={18} className="lg:hidden" />
                                {guardando ? 'Guardando...' : 'Guardar Método de Pago'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </>
    );
};

export default MetodoPagoVendedorForm;