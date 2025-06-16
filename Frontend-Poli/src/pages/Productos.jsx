import React from 'react';

const Productos = () => {
    const productos = [
        { id: 1, nombre: 'Producto 1', precio: '$10', imagen: 'https://via.placeholder.com/150' },
        { id: 2, nombre: 'Producto 2', precio: '$20', imagen: 'https://via.placeholder.com/150' },
        { id: 3, nombre: 'Producto 3', precio: '$30', imagen: 'https://via.placeholder.com/150' },
    ];

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {productos.map((producto) => (
                <div key={producto.id} className="border p-4 rounded-lg shadow-md">
                    <img src={producto.imagen} alt={producto.nombre} className="w-full h-40 object-cover rounded-md" />
                    <h3 className="text-lg font-bold mt-2">{producto.nombre}</h3>
                    <p className="text-gray-700">{producto.precio}</p>
                </div>
            ))}
        </div>
    );
};

export default Productos;