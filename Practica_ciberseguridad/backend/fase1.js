import fs from "fs";
import path from "path";
import crypto from "crypto";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const multimediaDir = path.join(__dirname, "..", "multimedia");
const encryptedDir = path.join(__dirname, "..", "encrypted");
const adminDir = path.join(__dirname, "..", "admin");

function encryptAES(buffer, key) {
    const iv = crypto.randomBytes(16); // IV de 16 bytes
    const cipher = crypto.createCipheriv("aes-128-cbc", key, iv);

    const encrypted = Buffer.concat([cipher.update(buffer), cipher.final()]);
    return { iv, encrypted };
}

export default async function cifrarArchivos() {
    const files = fs.readdirSync(multimediaDir);
    const clavesAES = {};

    for (const file of files) {
        const filePath = path.join(multimediaDir, file);
        const fileData = fs.readFileSync(filePath);

        const key = crypto.randomBytes(16);

        const { iv, encrypted } = encryptAES(fileData, key);

        const outputFile = path.join(encryptedDir, file + ".enc");

        fs.writeFileSync(outputFile, Buffer.concat([iv, encrypted]));

        clavesAES[file] = key.toString("base64");
    }

    const keysPath = path.join(adminDir, "aes-keys.json");
    fs.writeFileSync(keysPath, JSON.stringify(clavesAES, null, 4));

    return true;
}
