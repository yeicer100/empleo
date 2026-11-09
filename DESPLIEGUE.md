# Despliegue a producción (gratis): TiDB + Render

Se publica **un solo servicio**: el backend entrega la API y también el sitio.
La base de datos va aparte, en TiDB Cloud (MySQL en la nube).

Antes de empezar, prueba que todo funciona junto en tu computador:

```bash
cd frontend
npm install
npm run build          # crea frontend/dist
cd ../backend
npm start              # abre http://localhost:4000 (sitio + API juntos)
```

---

## Parte 1. Base de datos en TiDB Cloud

1. Crea una cuenta en https://tidbcloud.com (no pide tarjeta).
2. Crea una instancia **Starter** (la gratuita), compatible con MySQL.
3. Entra a **Connect** y genera la contraseña. Anota: **Host**, **Puerto** (4000), **Usuario** y **Contraseña**.
   (La contraseña solo se muestra una vez.)
4. Abre el **SQL Editor** de TiDB, pega todo `database/quibdo_empleo.sql` y ejecútalo.
   - Si te dice que no puede crear la base de datos, borra las 3 primeras líneas del archivo
     (`DROP DATABASE`, `CREATE DATABASE`, `USE`), elige la base `test` y usa `DB_NAME=test`.
5. Revisa que existan las tablas y que `SELECT * FROM categoria;` devuelva los sectores.

Límite del plan gratis: si se gasta la cuota mensual, la base rechaza conexiones hasta el mes siguiente.

## Parte 2. Subir el proyecto a GitHub

1. Crea un repositorio nuevo en https://github.com (privado está bien).
2. Sube la carpeta `quibdo-empleo` con git:

```bash
cd quibdo-empleo
git init
git add .
git commit -m "Empleo Quibdo"
git branch -M main
git remote add origin https://github.com/TU_USUARIO/TU_REPO.git
git push -u origin main
```

**Importante:** el archivo `.env` NO debe subirse (ya está en `.gitignore`).
Si subes los archivos arrastrándolos en la página de GitHub, no incluyas `backend/.env`.

## Parte 3. Publicar en Render

1. Crea una cuenta en https://render.com e inicia sesión con GitHub.
2. **New → Blueprint** y elige tu repositorio (lee `render.yaml`).
   Si prefieres hacerlo a mano: **New → Web Service**, con
   - Build Command: `cd frontend && npm install && npm run build && cd ../backend && npm install`
   - Start Command: `cd backend && npm start`
   - Plan: Free
3. Agrega las variables de entorno:

| Variable | Valor |
|---|---|
| `DB_HOST` | el host de TiDB |
| `DB_PORT` | `4000` |
| `DB_USER` | el usuario de TiDB |
| `DB_PASSWORD` | la contraseña de TiDB |
| `DB_NAME` | `quibdo_empleo` (o `test`) |
| `DB_SSL` | `true` |
| `JWT_SECRET` | un texto largo y secreto, distinto al de tu computador |

   Para generar el `JWT_SECRET`:
   `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`

4. Pulsa **Deploy**. Cuando termine tendrás una dirección tipo `https://empleo-quibdo.onrender.com`.
5. Comprueba `https://TU-DIRECCION/api/health`: debe decir `"api":"ok","db":"ok"`.
6. Entra al sitio, crea una empresa, publica una oferta y postúlate con un candidato.

## Cosas a tener en cuenta (plan gratis)

- Render **duerme** el servicio tras 15 minutos sin visitas; la primera visita después tarda cerca de un minuto.
- Render indica que el plan gratis no es para producción real. Si el sitio va a usarse en serio, un plan pago pequeño (alrededor de 7 USD/mes) evita que se duerma.
- Cada vez que hagas `git push`, Render vuelve a publicar solo.
- Si algo falla, mira **Logs** en Render: ahí aparece el mensaje de error del backend.
