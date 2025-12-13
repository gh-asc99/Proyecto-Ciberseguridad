import fs from "fs/promises";
import fsSync from "fs";
import path from "path";
import crypto from "crypto";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const ROOT = path.join(__dirname, "..");
export const MULTI_DIR = path.join(ROOT, "multimedia");
export const ENC_DIR = path.join(ROOT, "encrypted");
export const DEC_DIR = path.join(ROOT, "decrypted");
export const ADMIN_DIR = path.join(ROOT, "admin");
export const USERS_DIR = path.join(ROOT, "users");

export function ensureDirs() {
  [ENC_DIR, DEC_DIR, ADMIN_DIR, USERS_DIR].forEach((d) => {
    if (!fsSync.existsSync(d)) fsSync.mkdirSync(d, { recursive: true });
  });
}

export function encryptAes128Gcm(plainBuffer, keyBuffer) {
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv("aes-128-gcm", keyBuffer, iv);
  const ciphertext = Buffer.concat([
    cipher.update(plainBuffer),
    cipher.final(),
  ]);
  const tag = cipher.getAuthTag();
  return Buffer.concat([iv, ciphertext, tag]);
}

export function decryptAes128Gcm(encBuffer, keyBuffer) {
  const iv = encBuffer.slice(0, 12);
  const tag = encBuffer.slice(encBuffer.length - 16);
  const ciphertext = encBuffer.slice(12, encBuffer.length - 16);
  const decipher = crypto.createDecipheriv("aes-128-gcm", keyBuffer, iv);
  decipher.setAuthTag(tag);
  const plain = Buffer.concat([decipher.update(ciphertext), decipher.final()]);
  return plain;
}

export function genAesKey() {
  return crypto.randomBytes(16);
}

export function genRsaPair(passphrase = null) {
  const opts = {
    modulusLength: 2048,
    publicKeyEncoding: { type: "spki", format: "pem" },
    privateKeyEncoding: passphrase
      ? {
          type: "pkcs8",
          format: "pem",
          cipher: "aes-256-cbc",
          passphrase,
        }
      : {
          type: "pkcs8",
          format: "pem",
        },
  };
  return crypto.generateKeyPairSync("rsa", opts);
}

export function rsaEncrypt(publicPem, buffer) {
  return crypto.publicEncrypt({ key: publicPem, oaepHash: "sha256" }, buffer);
}
export function rsaDecrypt(privatePem, buffer, passphrase = null) {
  const opts = passphrase
    ? { key: privatePem, passphrase, oaepHash: "sha256" }
    : { key: privatePem, oaepHash: "sha256" };
  return crypto.privateDecrypt(opts, buffer);
}

export async function readJson(p) {
  const txt = await fs.readFile(p, "utf8");
  return JSON.parse(txt);
}
export async function writeJson(p, obj) {
  await fs.writeFile(p, JSON.stringify(obj, null, 2), "utf8");
}
