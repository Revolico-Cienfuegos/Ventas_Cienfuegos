import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// IMPORTANTE: cambiá "doris-ai" por el nombre EXACTO de tu repositorio en GitHub
// si el repo se llama distinto. Si tu repo es "usuario.github.io" (repo de usuario),
// dejá base: "/"
export default defineConfig({
  plugins: [react()],
  base: "/doris-ai/",
});
