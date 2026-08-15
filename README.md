# Doris AI

Asistente de IA personal con chat y generación de imágenes, 100% gratis y sin necesidad de configurar ninguna API key. Funciona directo en el navegador usando [Pollinations.ai](https://pollinations.ai) como backend gratuito.

## Funciones

- 💬 Chat con IA (multi-conversación, con historial guardado en tu navegador)
- 🖼 Generación de imágenes desde texto
- Estilo cyberpunk, todo en español
- Sin backend propio, sin costos, sin login

## Cómo correrlo en tu computadora

```bash
npm install
npm run dev
```

Abrí http://localhost:5173

## Cómo publicarlo en GitHub Pages

1. Creá un repositorio nuevo en GitHub (por ejemplo `doris-ai`).
2. Si el nombre del repo NO es `doris-ai`, editá `vite.config.js` y cambiá la línea `base: "/doris-ai/"` por `base: "/nombre-de-tu-repo/"`.
3. Subí el proyecto:

```bash
git init
git add .
git commit -m "Doris AI inicial"
git branch -M main
git remote add origin https://github.com/TU_USUARIO/doris-ai.git
git push -u origin main
```

4. En GitHub, andá a **Settings → Pages** y en "Build and deployment" elegí **Source: GitHub Actions**.
5. El workflow en `.github/workflows/deploy.yml` se ejecuta solo en cada push a `main` y publica el sitio automáticamente.
6. Tu app va a quedar en `https://TU_USUARIO.github.io/doris-ai/`.

## Notas

- Todo el historial de chats e imágenes se guarda en `localStorage` del navegador de quien usa la app — no hay base de datos ni servidor.
- Pollinations.ai es un servicio comunitario gratuito; puede ser un poco más lento en horas pico, pero no requiere key ni cuenta.
