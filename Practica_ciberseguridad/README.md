# Servicio Multimedia Seguro

Esta aplicación implementa un servicio multimedia seguro que permite cifrar archivos, gestionar usuarios y controlar el acceso a los archivos mediante criptografía híbrida (AES + RSA). El funcionamiento de la aplicación está dividido en fases que deben ejecutarse en orden.

Autores: Alejandro Soler Cruz, Javier Sánchez Solera, Daniel Ruíz.


## Puesta en marcha

Instalar dependencias: npm install
Iniciar el servidor: npm start

Abrir en el navegador: http://localhost:3000


## Funcionamiento general

La aplicación trabaja con los siguientes directorios:
multimedia/ → archivos originales
encrypted/ → archivos cifrados (.enc)
decrypted/ → archivos descifrados
admin/ → información del administrador y permisos
users/ → claves de los usuarios

Los directorios se crean automáticamente al arrancar el servidor.


### Fase 1 — Cifrado de archivos

Objetivo:
Cifrar todos los archivos del directorio multimedia/.

Qué hace:
- Genera una clave AES por archivo
- Cifra el contenido con AES-128-GCM
- Guarda los archivos cifrados en encrypted/ con extensión .enc

Cómo ejecutarla:
Pulsar el botón “Ejecutar fase 1 (cifrar)”

Esta fase debe ejecutarse antes de cualquier otra.


### Fase 2 — Creación del administrador

Objetivo:
Crear un administrador que controlará el acceso a los archivos.

Qué hace:
- Genera un par de claves RSA para el administrador
- Cifra las claves AES de los archivos con la clave pública del admin
- Protege la clave privada del admin con una passphrase

Cómo ejecutarla:
Introducir una "passphrase" (contraseña de administrador)
Pulsar “Crear admin y cifrar claves AES”

Sin esta fase no se pueden conceder permisos a usuarios.


## Fase 3 — Gestión de usuarios

· Crear usuario

Qué hace:
- Genera un par de claves RSA para el usuario
- Guarda las claves en el servidor

Cómo hacerlo:
Escribir el nombre del usuario
Pulsar “Crear usuario”


· Conceder acceso a archivos

Qué hace:
- El administrador cifra la clave AES de un archivo con la clave pública del usuario
- Se registra qué archivos puede descifrar cada usuario

Cómo hacerlo:
Introducir el nombre del usuario
Introducir la passphrase del administrador
Pulsar “Conceder acceso”


## Descifrado de archivos (como usuario)

Objetivo:
Permitir que un usuario descifre solo los archivos a los que tiene permiso.

Qué hace:
- Descifra la clave AES usando la clave privada del usuario
- Descifra el archivo en el servidor
- Guarda el archivo original en decrypted/

Cómo hacerlo:
Seleccionar un archivo cifrado
Introducir el nombre del usuario
Pulsar “Descifrar en servidor”
Descargar el archivo descifrado

El usuario solo puede descifrar archivos autorizados.


#### Orden correcto de ejecución

Fase 1 → Cifrar archivos
Fase 2 → Crear administrador
Fase 3 → Crear usuarios
Fase 3 → Conceder acceso
Descifrado → Descargar archivo autorizado