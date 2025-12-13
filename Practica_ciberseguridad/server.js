import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";
import { createUser, grantAccess } from "./backend/fase3.js";
import { decryptAes128Gcm, rsaDecrypt, ensureDirs } from "./backend/utils.js";

import cifrarArchivos from "./backend/fase1.js";
import { runPhase2 } from "./backend/fase2.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(express.json());

ensureDirs();

const PUBLIC_DIR = path.join(__dirname, "public");
const ENCRYPTED_DIR = path.join(__dirname, "encrypted");
const DECRYPTED_DIR = path.join(__dirname, "decrypted");
const ADMIN_DIR = path.join(__dirname, "admin");

app.use(express.static(PUBLIC_DIR));
app.use("/encrypted", express.static(ENCRYPTED_DIR));
app.use("/decrypted", express.static(DECRYPTED_DIR));

app.post("/api/cifrar", async (req, res) => {
  try {
    await cifrarArchivos();
    res.json({ ok: true, message: "Archivos cifrados correctamente" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ ok: false, error: err.message });
  }
});

app.post("/api/phase2", async (req, res) => {
  try {
    const passphrase = req.body.passphrase;
    if (!passphrase) {
      return res
        .status(400)
        .json({ ok: false, error: "Debes introducir una passphrase" });
    }

    await runPhase2(passphrase);
    res.json({ ok: true, message: "Admin creado y claves AES cifradas" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ ok: false, error: err.message });
  }
});

app.get("/api/list-files", (req, res) => {
  try {
    if (!fs.existsSync(ENCRYPTED_DIR)) return res.json({ ok: true, files: [] });

    const allFiles = fs.readdirSync(ENCRYPTED_DIR);
    const onlyEncrypted = allFiles.filter((f) => f.endsWith(".enc"));

    res.json({ ok: true, files: onlyEncrypted });
  } catch (err) {
    console.error(err);
    res.status(500).json({ ok: false, error: err.message });
  }
});

app.get("/", (req, res) => {
  res.sendFile(path.join(PUBLIC_DIR, "index.html"));
});

app.post("/api/create-user", async (req, res) => {
  try {
    const { username } = req.body;
    await createUser(username);
    res.json({ ok: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ ok: false, error: err.message });
  }
});

app.post("/api/grant-access", async (req, res) => {
  try {
    const { username, adminPass } = req.body;
    await grantAccess(username, adminPass);
    res.json({ ok: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ ok: false, error: err.message });
  }
});

app.post("/api/decrypt-for-user", async (req, res) => {
  try {
    const { username, filename } = req.body;
    const originalName = filename.replace(".enc", "");
    const userPriv = fs.readFileSync(
      path.join(__dirname, "users", `${username}_private.pem`),
      "utf8"
    );

    if (!username || !filename) {
      return res.status(400).json({ ok: false, error: "Datos incompletos" });
    }

    const ADMIN_DIR = path.join(__dirname, "admin");

    const accessPath = path.join(ADMIN_DIR, `access_${username}.json`);
    if (!fs.existsSync(accessPath)) {
      return res.status(403).json({ ok: false, error: "Usuario sin acceso" });
    }

    const access = JSON.parse(fs.readFileSync(accessPath, "utf8"));
    if (!access[originalName]) {
      return res
        .status(403)
        .json({ ok: false, error: "Archivo no autorizado" });
    }

    const encAesKey = Buffer.from(access[originalName], "base64");
    const aesKey = rsaDecrypt(userPriv, encAesKey);

    if (aesKey.length !== 16) {
      throw new Error("Clave AES inválida tras descifrado RSA");
    }

    const encPath = path.join(__dirname, "encrypted", filename);
    const encData = fs.readFileSync(encPath);

    const plain = decryptAes128Gcm(encData, aesKey);

    const outPath = path.join(
      __dirname,
      "decrypted",
      filename.replace(".enc", "")
    );

    fs.mkdirSync(path.dirname(outPath), { recursive: true });

    fs.writeFileSync(outPath, plain);

    res.json({ ok: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ ok: false, error: err.message });
  }
});

app.listen(3000, () => {
  console.log("Servidor iniciado en http://localhost:3000");
});
