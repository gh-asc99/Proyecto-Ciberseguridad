import fs from 'fs/promises';
import path from 'path';
import { genRsaPair, rsaDecrypt, rsaEncrypt, readJson, writeJson, ADMIN_DIR, USERS_DIR } from './utils.js';

export async function createUser(username) {
  if (!username) throw new Error('username requerido');
  const { publicKey, privateKey } = genRsaPair(null);

  await fs.writeFile(path.join(USERS_DIR, `${username}_public.pem`), publicKey, 'utf8');
  await fs.writeFile(path.join(USERS_DIR, `${username}_private.pem`), privateKey, 'utf8');

  console.log(`Usuario ${username} creado`);
}

export async function grantAccess(username, adminPass) {

  // CORREGIDO: fase2 guarda aquí
  const encKeys = await readJson(path.join(ADMIN_DIR, 'encrypted_keys.json'));

  const adminPriv = await fs.readFile(path.join(ADMIN_DIR, 'admin_private.pem'), 'utf8');
  const userPub = await fs.readFile(path.join(USERS_DIR, `${username}_public.pem`), 'utf8');

  const access = {};

  for (const [fname, encKeyB64] of Object.entries(encKeys)) {
    const encBuf = Buffer.from(encKeyB64, 'base64');

    const aesKey = rsaDecrypt(adminPriv, encBuf, adminPass);

    const encForUser = rsaEncrypt(userPub, aesKey);

    access[fname] = encForUser.toString('base64');
  }

  await writeJson(path.join(ADMIN_DIR, `access_${username}.json`), access);

  console.log(`Acceso concedido a ${username}. Archivo access_${username}.json creado.`);
}
