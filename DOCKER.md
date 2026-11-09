# Docker

## Requisito
Instala **Docker Desktop** (https://www.docker.com/products/docker-desktop) y ábrelo.
Comprueba con `docker --version`.

## Levantar todo (base de datos + backend + sitio)

En la carpeta `quibdo-empleo` (donde está `docker-compose.yml`):

```bash
docker compose up -d --build
```

La primera vez tarda unos minutos. Después:

- Sitio: http://localhost:8080
- Prueba: http://localhost:8080/api/health  → debe decir `"api":"ok","db":"ok"`
- La base queda con las tablas y los sectores (sin empresas ni ofertas de ejemplo).

Comandos útiles:

```bash
docker compose ps               # ver si estan corriendo
docker compose logs -f app      # ver los mensajes del backend
docker compose down             # apagar (conserva los datos)
docker compose down -v          # apagar y BORRAR la base de datos
```

Si cambias el SQL y quieres que la base se cree de nuevo: `docker compose down -v` y luego `docker compose up -d --build`.

## Subir la imagen a Docker Hub

Docker Hub solo **guarda** la imagen (como un Drive para imágenes); no la ejecuta.

1. Crea una cuenta en https://hub.docker.com
2. En la terminal:

```bash
docker login
docker build -t TU_USUARIO/empleo-quibdo:1.0 .
docker push TU_USUARIO/empleo-quibdo:1.0
```

3. En cualquier servidor con Docker puedes bajarla y correrla (necesita una base MySQL aparte):

```bash
docker run -d -p 8080:4000 \
  -e DB_HOST=... -e DB_PORT=3306 -e DB_USER=... -e DB_PASSWORD=... \
  -e DB_NAME=quibdo_empleo -e JWT_SECRET=... \
  TU_USUARIO/empleo-quibdo:1.0
```
