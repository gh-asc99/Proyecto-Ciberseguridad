async function api(path, opts = {}) {
  const res = await fetch(
    path,
    Object.assign({ headers: { "Content-Type": "application/json" } }, opts)
  );
  return res.json();
}

document.getElementById("btnCifrar").onclick = async () => {
  const r = await api("/api/cifrar", { method: "POST" });
  document.getElementById("phase1msg").innerText = r.ok
    ? "Fase1 ejecutada"
    : "Error: " + r.error;
  loadFileList();
};

document.getElementById("btnPhase2").onclick = async () => {
  const pass = document.getElementById("adminPass").value;
  const r = await api("/api/phase2", {
    method: "POST",
    body: JSON.stringify({ passphrase: pass }),
  });
  document.getElementById("phase2msg").innerText = r.ok
    ? "Admin creado"
    : "Error: " + r.error;
};

document.getElementById("btnCreateUser").onclick = async () => {
  const u = document.getElementById("newUser").value;
  const r = await api("/api/create-user", {
    method: "POST",
    body: JSON.stringify({ username: u }),
  });
  document.getElementById("phase3msg").innerText = r.ok
    ? "Usuario creado"
    : "Error: " + r.error;
  loadFileList();
};

document.getElementById("btnGrant").onclick = async () => {
  const u = document.getElementById("grantUser").value;
  const pass = document.getElementById("adminPassGrant").value;
  const r = await api("/api/grant-access", {
    method: "POST",
    body: JSON.stringify({ username: u, adminPass: pass }),
  });
  document.getElementById("phase3msg").innerText = r.ok
    ? "Acceso concedido"
    : "Error: " + r.error;
};

async function loadFileList() {
  const r = await api("/api/list-files", { method: "GET" });
  const sel = document.getElementById("fileList");
  sel.innerHTML = "";
  if (r.ok && r.files) {
    r.files.forEach((f) => {
      const opt = document.createElement("option");
      opt.value = f;
      opt.innerText = f;
      sel.appendChild(opt);
    });
  }
}
document.getElementById("btnDecrypt").onclick = async () => {
  const user = document.getElementById("userForDecrypt").value;
  const file = document.getElementById("fileList").value;

  const r = await api("/api/decrypt-for-user", {
    method: "POST",
    body: JSON.stringify({ username: user, filename: file }),
  });

  const msg = document.getElementById("decryptMsg");
  const link = document.getElementById("downloadLink");

  if (r.ok) {
    const cleanName = file.replace(".enc", "");
    msg.innerText = "Descifrado en server -> /decrypted/" + cleanName;
    link.href = "/decrypted/" + cleanName;
    link.style.display = "inline-block";
  } else {
    msg.innerText = "Error: " + r.error;
  }
};

loadFileList();
