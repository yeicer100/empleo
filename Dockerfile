# Una sola imagen: construye el frontend y el backend lo entrega junto con la API.

# --- 1. Construir el frontend (React + Vite) ---
FROM node:20-alpine AS frontend
WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm ci || npm install
COPY frontend/ ./
RUN npm run build

# --- 2. Backend (Express) + el sitio ya compilado ---
FROM node:20-alpine
ENV NODE_ENV=production
WORKDIR /app/backend
COPY backend/package*.json ./
RUN npm ci --omit=dev || npm install --omit=dev
COPY backend/ ./
COPY --from=frontend /app/frontend/dist /app/frontend/dist
USER node
EXPOSE 4000
CMD ["node", "server.js"]
