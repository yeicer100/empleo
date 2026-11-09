# Empleo Quibdó

```
quibdo-empleo/
├── database/     → script SQL para crear la base de datos en MySQL
├── backend/      → API en Express que habla con MySQL (puerto 4000)
└── frontend/     → sitio en React + Vite (puerto 5173)
```

Necesitas **Node.js 18+** y **MySQL 8**.

## 1. Base de datos

1. En MySQL Workbench ejecuta `database/quibdo_empleo.sql` completo (crea la base, las tablas y los sectores; **no trae empresas ni ofertas de ejemplo**).
   - Si ya tenías la base con datos de ejemplo y quieres quitarlos **sin perder las cuentas que creaste**, ejecuta `database/limpiar_datos_ejemplo.sql`.
2. Crea el usuario de la aplicación (una sola vez):

```sql
CREATE USER IF NOT EXISTS 'quibdo_app'@'localhost' IDENTIFIED BY 'app_quibdo_2026';
ALTER USER 'quibdo_app'@'localhost' IDENTIFIED BY 'app_quibdo_2026';
GRANT ALL PRIVILEGES ON quibdo_empleo.* TO 'quibdo_app'@'localhost';
FLUSH PRIVILEGES;
```

## 2. Backend

Revisa `backend/.env` (usuario, clave y **DB_PORT**: el puerto de tu MySQL, 3306 por defecto; en este equipo es 3307).

```bash
cd backend
npm install
npm run dev
```

Debe mostrar `Conexion a MySQL exitosa` y `Esquema de la base de datos al dia`
(al arrancar agrega solo las columnas nuevas que falten). Prueba http://localhost:4000/api/health.
Si cambias el `.env`, detén con Ctrl+C y vuelve a ejecutar `npm run dev`.

## 3. Frontend (otra terminal)

```bash
cd frontend
npm install
npm run dev
```

Abre http://localhost:5173. El backend tiene que estar encendido.

## Cómo funciona

**Empresa** (se registra en `/registro-empresa`, con su WhatsApp):
- Al iniciar sesión entra a **Mi panel**, no ve las ofertas de otras empresas.
- Publica ofertas, las pausa/cierra y ve cuántas postulaciones tiene cada una.
- Cuando un candidato se postula le aparece una **notificación** (número en el menú) y la postulación en su bandeja con los datos del candidato.
- Puede **Aceptar** (indica el WhatsApp con el que quiere que la contacten y un mensaje) o **Rechazar**.

**Candidato** (se registra en `/registro`):
- Ve las ofertas publicadas, puede **guardarlas** y **postularse**.
- Al postularse llena sus datos (nombre, estudio, años de experiencia, WhatsApp, mensaje).
- En **Mis postulaciones** ve el estado. Si la empresa acepta, aparece el contacto de la empresa con un botón para escribirle por WhatsApp.

## Publicar en internet

Mira `DESPLIEGUE.md` (opción gratis con TiDB Cloud y Render).

## Docker

Mira `DOCKER.md` (un solo comando: `docker compose up -d --build`).
