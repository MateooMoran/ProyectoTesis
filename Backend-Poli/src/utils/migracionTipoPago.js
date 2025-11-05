import mongoose from 'mongoose';
import Orden from '../models/Orden.js';
import MetodoPagoVendedor from '../models/MetodoPagoVendedor.js';
import dotenv from 'dotenv';

dotenv.config();

/**
 * Script de migración para agregar el campo tipoPago a órdenes existentes
 * Ejecutar una sola vez después de actualizar el modelo
 */
const migrarTipoPago = async () => {
  try {
    console.log('🔄 Conectando a la base de datos...');
    await mongoose.connect(process.env.MONGODB_URI_LOCAL);
    console.log('✅ Conectado a MongoDB');

    // Obtener todas las órdenes sin tipoPago
    const ordenesSinTipo = await Orden.find({ 
      tipoPago: { $exists: false } 
    }).populate('metodoPagoVendedor');

    console.log(`📦 Encontradas ${ordenesSinTipo.length} órdenes para migrar`);

    let actualizadas = 0;
    let errores = 0;

    for (const orden of ordenesSinTipo) {
      try {
        let tipoPago = null;

        if (orden.metodoPagoVendedor) {
          // Si tiene método de pago, usar su tipo
          tipoPago = orden.metodoPagoVendedor.tipo;
        } else if (orden.confirmadoPagoVendedor && orden.fechaPagoConfirmado) {
          // Si el pago fue confirmado pero no hay metodoPagoVendedor, probablemente es tarjeta
          tipoPago = 'tarjeta';
        }

        if (tipoPago) {
          await Orden.findByIdAndUpdate(orden._id, { tipoPago });
          actualizadas++;
          console.log(`✅ Orden ${orden._id} → tipoPago: ${tipoPago}`);
        } else {
          console.log(`⚠️ Orden ${orden._id} → No se pudo determinar el tipoPago`);
        }
      } catch (error) {
        errores++;
        console.error(`❌ Error en orden ${orden._id}:`, error.message);
      }
    }

    console.log('\n📊 Resumen de migración:');
    console.log(`   ✅ Órdenes actualizadas: ${actualizadas}`);
    console.log(`   ❌ Errores: ${errores}`);
    console.log(`   ⚠️ Sin cambios: ${ordenesSinTipo.length - actualizadas - errores}`);

  } catch (error) {
    console.error('❌ Error en la migración:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Desconectado de MongoDB');
    process.exit(0);
  }
};

// Ejecutar migración
migrarTipoPago();
