import axios from "axios";
import dotenv from "dotenv";

dotenv.config();

const COHERE_API_KEY = process.env.COHERE_API_KEY;
const COHERE_URL = "https://api.cohere.com/v1/embed";

export async function generarEmbedding(texto) {
    try {
        if (!COHERE_API_KEY) {
            console.warn("⚠️ COHERE_API_KEY no configurada, retornando embedding vacío");
            return new Array(1536).fill(0);
        }

        const textoLimpio = texto.trim().substring(0, 5000);

        if (!textoLimpio) {
            console.warn("⚠️ Texto vacío para embedding");
            return new Array(1536).fill(0);
        }

        console.log(`🔍 Generando embedding para: "${textoLimpio.substring(0, 50)}..."`);

        const response = await axios.post(
            COHERE_URL,
            {
                model: "embed-v4.0",
                texts: [textoLimpio],
                input_type: "search_document"
            },
            {
                headers: {
                    Authorization: `Bearer ${COHERE_API_KEY}`,
                    "Content-Type": "application/json"
                },
                timeout: 10000
            }
        );

        const embedding = response.data.embeddings[0];

        console.log(`📊 Embedding recibido: ${embedding?.length} dimensiones`);
        console.log(`📊 Primeros 5 valores: [${embedding?.slice(0, 5).map(v => v.toFixed(4)).join(', ')}...]`);

        if (!Array.isArray(embedding) || embedding.length !== 1536) {
            console.error(`❌ Embedding inválido: ${embedding?.length} dimensiones`);
            return new Array(1536).fill(0);
        }

        console.log("✅ Embedding generado correctamente (1536 dimensiones)");
        return embedding;

    } catch (error) {
        console.error("❌ Error generando embedding:", {
            mensaje: error.message,
            status: error.response?.status,
            data: error.response?.data
        });

        return new Array(1536).fill(0);
    }
}

export function similitudCoseno(vecA, vecB) {
    if (!Array.isArray(vecA) || !Array.isArray(vecB) ||
        vecA.length !== vecB.length || vecA.length === 0) {
        console.warn("Vectores inválidos para similitud coseno");
        return 0;
    }

    const dot = vecA.reduce((sum, a, i) => sum + a * vecB[i], 0);
    const magA = Math.sqrt(vecA.reduce((sum, a) => sum + a * a, 0));
    const magB = Math.sqrt(vecB.reduce((sum, b) => sum + b * b, 0));

    if (magA === 0 || magB === 0) {
        console.warn("Vector con magnitud cero");
        return 0;
    }

    return dot / (magA * magB);
}  
Actualiza y actualzoia este 
import mongoose from "mongoose";
import { generarEmbedding } from "./embeddings.js"; 
import Producto from "../models/Producto.js";
import "dotenv/config";

await mongoose.connect(process.env.MONGODB_URI_LOCAL);

console.log("🚀 Conectado a MongoDB... Migrando embeddings a 1024 dimensiones (Cohere)");

// Buscar todos los productos (incluso sin embedding para regenerarlos)
const productos = await Producto.find({});

console.log(`📦 Total productos a procesar: ${productos.length}\n`);

let exitosos = 0;
let errores = 0;
let sinNormalizar = 0;

for (let i = 0; i < productos.length; i++) {
    const prod = productos[i];
    const num = i + 1;
    
    // Verificar que tenga campos normalizados
    if (!prod.nombreNormalizado || !prod.descripcionNormalizada) {
        console.log(`⚠️  ${num}/${productos.length} - SIN NORMALIZAR: ${prod.nombreProducto} - Guardando para normalizar...`);
        try {
            // El pre-save hook normalizará automáticamente
            await prod.save();
            sinNormalizar++;
        } catch (err) {
            console.log(`❌ ${num}/${productos.length} - Error normalizando ${prod.nombreProducto}:`, err.message);
            errores++;
            continue;
        }
    }
    
    const texto = `${prod.nombreNormalizado} ${prod.descripcionNormalizada}`;
    
    try {
        const nuevoEmbedding = await generarEmbedding(texto);
        prod.embedding = nuevoEmbedding;
        await prod.save();
        exitosos++;
        console.log(`✅ ${num}/${productos.length} - OK: ${prod.nombreProducto}`);
    } catch (err) {
        errores++;
        console.log(`❌ ${num}/${productos.length} - Error en ${prod.nombreProducto}:`, err.message);
    }
    
    // Pequeña pausa para no saturar la API de Cohere
    if (num % 10 === 0) {
        console.log(`⏸️  Pausa de 1 segundo cada 10 productos...\n`);
        await new Promise(resolve => setTimeout(resolve, 1000));
    }
}

console.log("\n" + "=".repeat(60));
console.log("🎉 ¡MIGRACIÓN COMPLETA!");
console.log("=".repeat(60));
console.log(`✅ Exitosos: ${exitosos}`);
console.log(`❌ Errores: ${errores}`);
console.log(`⚠️  Sin normalizar (ahora normalizados): ${sinNormalizar}`);
console.log(`📊 Total procesados: ${productos.length}`);
console.log("=".repeat(60));

process.exit();