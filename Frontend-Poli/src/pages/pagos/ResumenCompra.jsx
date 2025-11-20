import { Package, CheckCircle } from 'lucide-react';
import getImageUrl from '../../utils/imageSrc';

const ResumenCompra = ({ producto, cantidad, total, currentStep, onCantidadChange }) => {
    if (!producto) return null;

    return (
        <div className="bg-white rounded-2xl border border-gray-200 p-6 sticky top-4">
            {/* Header */}
            <div className="flex items-center gap-3 mb-4">
                <div className="bg-gradient-to-br from-blue-500 to-blue-600 p-2.5 rounded-lg">
                    <Package className="w-5 h-5 text-white" />
                </div>
                <h3 className="text-lg font-bold text-gray-900">Resumen de Compra</h3>
            </div>
            
            <img
                src={getImageUrl(producto)}
                alt={producto.nombreProducto}
                className="w-full h-48 object-cover rounded-lg mb-4"
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
                            onChange={onCantidadChange}
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
        </div>
    );
};

export default ResumenCompra;
