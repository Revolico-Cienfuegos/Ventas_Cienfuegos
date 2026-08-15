import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// base relativa: funciona en GitHub Pages sin importar el nombre del repo
// (usuario.github.io/CUALQUIER-NOMBRE/) y también en local.
export default defineConfig({
  plugins: [react()],
  base: "./",
});
