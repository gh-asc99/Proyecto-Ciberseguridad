import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";

// Funciones de fases
import cifrarArchivos from "./backend/fase1.js";
import { runPhase2 } from "./backend/fase2.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(express.json());

// Carpetas
const PUBLIC_DIR = path.join(__dirname, "public");
const ENCRYPTED_DIR = path.join(__dirname, "encrypted");
const DECRYPTED_DIR = path.join(__dirname, "decrypted");
const ADMIN_DIR = path.join(__dirname, "admin");

// Servir archivos estáticos
app.use(express.static(PUBLIC_DIR));
app.use("/encrypted", express.static(ENCRYPTED_DIR));
app.use("/decrypted", express.static(DECRYPTED_DIR));

// ====================
// FASE 1: Cifrar archivos
// ====================
app.post("/api/cifrar", async (req, res) => {
    try {
        await cifrarArchivos();
        res.json({ ok: true, message: "Archivos cifrados correctamente" });
    } catch (err) {
        console.error(err);
        res.status(500).json({ ok: false, error: err.message });
    }
});

// ====================
// FASE 2: Crear admin y cifrar claves AES
// ====================
app.post("/api/phase2", async (req, res) => {
    try {
        const passphrase = req.body.passphrase;
        if (!passphrase) {
            return res.status(400).json({ ok: false, error: "Debes introducir una passphrase" });
        }

        await runPhase2(passphrase);
        res.json({ ok: true, message: "Admin creado y claves AES cifradas" });
    } catch (err) {
        console.error(err);
        res.status(500).json({ ok: false, error: err.message });
    }
});

// ====================
// LISTAR ARCHIVOS CIFRADOS (.enc)
// ====================
app.get("/api/list-files", (req, res) => {
    try {
        if (!fs.existsSync(ENCRYPTED_DIR)) return res.json({ ok: true, files: [] });

        const allFiles = fs.readdirSync(ENCRYPTED_DIR);
        const onlyEncrypted = allFiles.filter(f => f.endsWith(".enc"));

        res.json({ ok: true, files: onlyEncrypted });
    } catch (err) {
        console.error(err);
        res.status(500).json({ ok: false, error: err.message });
    }
});

// ====================
// SERVIR INDEX.HTML
// ====================
app.get("/", (req, res) => {
    res.sendFile(path.join(PUBLIC_DIR, "index.html"));
});

// ====================
// PUERTO
// ====================
app.listen(3000, () => {
    console.log("Servidor iniciado en http://localhost:3000");
});
