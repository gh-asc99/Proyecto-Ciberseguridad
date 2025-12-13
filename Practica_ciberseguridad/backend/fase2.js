import path from "path";
import fs from "fs/promises";
import {
  genRsaPair,
  rsaEncrypt,
  readJson,
  writeJson,
  ADMIN_DIR,
} from "./utils.js";

export async function runPhase2(passphrase) {
  if (!passphrase) throw new Error("passphrase requerida");

  const keysPath = path.join(ADMIN_DIR, "aes-keys.json");
  const keys = await readJson(keysPath);

  const { publicKey, privateKey } = genRsaPair(passphrase);

  await fs.writeFile(
    path.join(ADMIN_DIR, "admin_public.pem"),
    publicKey,
    "utf8"
  );
  await fs.writeFile(
    path.join(ADMIN_DIR, "admin_private.pem"),
    privateKey,
    "utf8"
  );

  const encKeys = {};
  for (const [fname, keyB64] of Object.entries(keys)) {
    const keyBuf = Buffer.from(keyB64, "base64");
    const encrypted = rsaEncrypt(publicKey, keyBuf);
    encKeys[fname] = encrypted.toString("base64");
  }

  await writeJson(path.join(ADMIN_DIR, "encrypted_keys.json"), encKeys);

  console.log("Fase2 completa: claves creadas y encrypted_keys.json generado.");
}
