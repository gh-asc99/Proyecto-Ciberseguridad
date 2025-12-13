import fs from "fs";
import path from "path";
import crypto from "crypto";
import { fileURLToPath } from "url";
import { encryptAes128Gcm } from "./utils.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const multimediaDir = path.join(__dirname, "..", "multimedia");
const encryptedDir = path.join(__dirname, "..", "encrypted");
const adminDir = path.join(__dirname, "..", "admin");

export default async function cifrarArchivos() {
  if (!fs.existsSync(encryptedDir)) {
    fs.mkdirSync(encryptedDir, { recursive: true });
  }

  if (!fs.existsSync(adminDir)) {
    fs.mkdirSync(adminDir, { recursive: true });
  }

  const files = fs.readdirSync(multimediaDir);
  const clavesAES = {};

  for (const file of files) {
    const filePath = path.join(multimediaDir, file);
    const fileData = fs.readFileSync(filePath);

    const key = crypto.randomBytes(16);

    const outputFile = path.join(encryptedDir, file + ".enc");

    const encryptedBuffer = encryptAes128Gcm(fileData, key);
    fs.writeFileSync(outputFile, encryptedBuffer);

    clavesAES[file] = key.toString("base64");
  }

  const keysPath = path.join(adminDir, "aes-keys.json");
  fs.writeFileSync(keysPath, JSON.stringify(clavesAES, null, 4));

  return true;
}
