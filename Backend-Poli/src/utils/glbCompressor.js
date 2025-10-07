import { NodeIO } from "@gltf-transform/core";
import { textureCompress } from "@gltf-transform/functions";
import sharp from "sharp";
import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const tempDir = path.join(__dirname, "src", "temp");


async function ensureTempDir() {
  await fs.mkdir(tempDir, { recursive: true });
}

export async function compressGLBBuffer(buffer) {
  await ensureTempDir();

  const tempPathIn = path.join(tempDir, "temp_input.glb");
  const tempPathOut = path.join(tempDir, "temp_output.glb");

  await fs.writeFile(tempPathIn, buffer);

  const io = new NodeIO();
  const document = await io.read(tempPathIn);

  await document.transform(
    textureCompress({
      encoder: sharp,
      targetFormat: "webp",
      resize: [2048, 2048], 
    })
  );

  await io.write(tempPathOut, document);
  const compressedBuffer = await fs.readFile(tempPathOut);

  await fs.unlink(tempPathIn).catch(() => {});
  await fs.unlink(tempPathOut).catch(() => {});

  return compressedBuffer;
}
