import React, { useState, useEffect } from "react";

/**
 * ImageGenerator - Módulo de generación de imágenes con IA para Doris AI
 * Usa Pollinations.ai (https://pollinations.ai), gratis, sin API key,
 * sin límite de usuarios. La imagen se genera directo por URL.
 */

function buildImageUrl(prompt, seed) {
  const encoded = encodeURIComponent(prompt.trim());
  return `https://image.pollinations.ai/prompt/${encoded}?width=768&height=768&seed=${seed}&nologo=true`;
}

export default function ImageGenerator() {
  const [prompt, setPrompt] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [images, setImages] = useState([]); // { url, prompt, timestamp }

  useEffect(() => {
    const savedImages = localStorage.getItem("doris_ai_generated_images");
    if (savedImages) {
      try {
        setImages(JSON.parse(savedImages));
      } catch {
        /* ignore corrupted cache */
      }
    }
  }, []);

  const persistImages = (next) => {
    setImages(next);
    localStorage.setItem("doris_ai_generated_images", JSON.stringify(next));
  };

  const generateImage = () => {
    if (!prompt.trim()) return;
    setLoading(true);
    setError(null);

    const seed = Math.floor(Math.random() * 1_000_000);
    const url = buildImageUrl(prompt, seed);
    const testImg = new Image();

    testImg.onload = () => {
      const newImage = { url, prompt, timestamp: Date.now() };
      persistImages([newImage, ...images].slice(0, 30));
      setPrompt("");
      setLoading(false);
    };
    testImg.onerror = () => {
      setError("No se pudo generar la imagen. Probá de nuevo en unos segundos.");
      setLoading(false);
    };
    testImg.src = url;
  };

  const removeImage = (timestamp) => {
    persistImages(images.filter((img) => img.timestamp !== timestamp));
  };

  const downloadImage = async (img) => {
    try {
      const res = await fetch(img.url);
      const blob = await res.blob();
      const objUrl = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = objUrl;
      a.download = `doris-ai-${img.timestamp}.png`;
      a.click();
      URL.revokeObjectURL(objUrl);
    } catch {
      window.open(img.url, "_blank");
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h2 style={styles.title}>⚡ GENERADOR DE IMÁGENES</h2>
      </div>

      <div style={styles.promptRow}>
        <input
          type="text"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="Describí la imagen que querés generar..."
          style={styles.promptInput}
          onKeyDown={(e) => e.key === "Enter" && !loading && generateImage()}
        />
        <button
          style={{ ...styles.genBtn, opacity: loading ? 0.6 : 1 }}
          onClick={generateImage}
          disabled={loading}
        >
          {loading ? "Generando..." : "Generar"}
        </button>
      </div>

      {error && <div style={styles.error}>⚠ {error}</div>}

      <div style={styles.grid}>
        {images.map((img) => (
          <div key={img.timestamp} style={styles.card}>
            <img src={img.url} alt={img.prompt} style={styles.image} />
            <div style={styles.cardFooter}>
              <span style={styles.cardPrompt} title={img.prompt}>
                {img.prompt}
              </span>
              <div style={styles.cardActions}>
                <button style={styles.iconBtn} onClick={() => downloadImage(img)}>
                  ⬇
                </button>
                <button style={styles.iconBtn} onClick={() => removeImage(img.timestamp)}>
                  ✕
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

const styles = {
  container: {
    background: "#0a0e17",
    color: "#e0f7ff",
    padding: "24px",
    borderRadius: "12px",
    fontFamily: "monospace",
    minHeight: "100%",
    overflowY: "auto",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "16px",
    flexWrap: "wrap",
    gap: "8px",
  },
  title: {
    color: "#ff2fd0",
    textShadow: "0 0 8px #ff2fd0aa",
    letterSpacing: "1px",
    margin: 0,
    fontSize: "18px",
  },
  promptRow: { display: "flex", gap: "8px", marginBottom: "16px" },
  promptInput: {
    flex: 1,
    background: "#111827",
    border: "1px solid #ff2fd055",
    color: "#e0f7ff",
    padding: "10px",
    borderRadius: "6px",
    fontFamily: "monospace",
  },
  genBtn: {
    background: "linear-gradient(90deg,#ff2fd0,#00f0ff)",
    border: "none",
    color: "#0a0e17",
    fontWeight: "bold",
    padding: "10px 18px",
    borderRadius: "6px",
    cursor: "pointer",
  },
  error: {
    background: "#3a0d1c",
    border: "1px solid #ff2f5f",
    color: "#ff9fb5",
    padding: "8px 12px",
    borderRadius: "6px",
    marginBottom: "16px",
    fontSize: "13px",
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))",
    gap: "12px",
  },
  card: {
    background: "#111827",
    border: "1px solid #00f0ff33",
    borderRadius: "8px",
    overflow: "hidden",
  },
  image: { width: "100%", display: "block", aspectRatio: "1", objectFit: "cover" },
  cardFooter: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "6px 8px",
    gap: "4px",
  },
  cardPrompt: {
    fontSize: "10px",
    color: "#9fb3c8",
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
    flex: 1,
  },
  cardActions: { display: "flex", gap: "4px" },
  iconBtn: {
    background: "transparent",
    border: "none",
    color: "#00f0ff",
    cursor: "pointer",
    fontSize: "12px",
  },
};
