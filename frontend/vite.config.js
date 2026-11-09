import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// /api se redirige al backend local (puerto 4000).

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: { "/api": "http://localhost:4000" },
  },
});
