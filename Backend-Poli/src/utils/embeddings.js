import fetch from "node-fetch";

const LOCALAI_URL = process.env.LOCALAI_URL || "http://localhost:8080";

export async function generarEmbedding(texto) {
    const response = await fetch(`${LOCALAI_URL}/embeddings`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            model: "text-embedding-ada-002", 
            input: texto,
        }),
    });

    const data = await response.json();
    return data.data[0].embedding;
}

export function similitudCoseno(vecA, vecB) {
    const dot = vecA.reduce((sum, val, i) => sum + val * vecB[i], 0);
    const magA = Math.sqrt(vecA.reduce((sum, val) => sum + val * val, 0));
    const magB = Math.sqrt(vecB.reduce((sum, val) => sum + val * val, 0));
    return dot / (magA * magB);
}
