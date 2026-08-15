import React, { useState, useEffect, useRef } from "react";
import ImageGenerator from "./components/ImageGenerator.jsx";

const CONVOS_KEY = "doris_ai_conversations";
const CHAT_ENDPOINT = "https://text.pollinations.ai/openai";

function newConversation() {
  return {
    id: Date.now().toString(),
    title: "Nueva conversación",
    messages: [],
  };
}

export default function App() {
  const [tab, setTab] = useState("chat"); // "chat" | "images"
  const [conversations, setConversations] = useState(() => {
    const saved = localStorage.getItem(CONVOS_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.length) return parsed;
      } catch {
        /* ignore */
      }
    }
    return [newConversation()];
  });
  const [activeId, setActiveId] = useState(() => conversations[0].id);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef(null);

  const active = conversations.find((c) => c.id === activeId) || conversations[0];

  useEffect(() => {
    localStorage.setItem(CONVOS_KEY, JSON.stringify(conversations));
  }, [conversations]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [active?.messages]);

  const updateConvo = (id, updater) => {
    setConversations((prev) => prev.map((c) => (c.id === id ? updater(c) : c)));
  };

  const sendMessage = async () => {
    if (!input.trim()) return;

    const userMsg = { role: "user", text: input.trim() };
    const convoId = active.id;
    updateConvo(convoId, (c) => ({
      ...c,
      title: c.messages.length === 0 ? input.trim().slice(0, 30) : c.title,
      messages: [...c.messages, userMsg],
    }));
    setInput("");
    setLoading(true);

    try {
      const history = [...active.messages, userMsg].map((m) => ({
        role: m.role === "user" ? "user" : "assistant",
        content: m.text,
      }));

      const res = await fetch(CHAT_ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "openai",
          messages: [
            {
              role: "system",
              content: "Sos Doris AI, una asistente conversacional útil y directa. Respondé en español salvo que te pidan otro idioma.",
            },
            ...history,
          ],
        }),
      });

      if (!res.ok) {
        throw new Error(`Error ${res.status} al contactar el servicio`);
      }

      const data = await res.json();
      const reply = data?.choices?.[0]?.message?.content || "(sin respuesta)";

      updateConvo(convoId, (c) => ({
        ...c,
        messages: [...c.messages, { role: "model", text: reply }],
      }));
    } catch (err) {
      updateConvo(convoId, (c) => ({
        ...c,
        messages: [...c.messages, { role: "model", text: `⚠ Error: ${err.message}` }],
      }));
    } finally {
      setLoading(false);
    }
  };

  const createConversation = () => {
    const c = newConversation();
    setConversations((prev) => [c, ...prev]);
    setActiveId(c.id);
    setTab("chat");
  };

  const deleteConversation = (id) => {
    setConversations((prev) => {
      const next = prev.filter((c) => c.id !== id);
      return next.length ? next : [newConversation()];
    });
    if (id === activeId) {
      const remaining = conversations.filter((c) => c.id !== id);
      setActiveId(remaining[0]?.id || conversations[0].id);
    }
  };

  return (
    <div style={styles.app}>
      <aside style={styles.sidebar}>
        <div style={styles.logo}>DORIS_AI</div>
        <button style={styles.newBtn} onClick={createConversation}>
          + Nueva conversación
        </button>
        <nav style={styles.tabs}>
          <button
            style={{ ...styles.tabBtn, ...(tab === "chat" ? styles.tabBtnActive : {}) }}
            onClick={() => setTab("chat")}
          >
            💬 Chat
          </button>
          <button
            style={{ ...styles.tabBtn, ...(tab === "images" ? styles.tabBtnActive : {}) }}
            onClick={() => setTab("images")}
          >
            🖼 Imágenes
          </button>
        </nav>
        <div style={styles.convoList}>
          {conversations.map((c) => (
            <div
              key={c.id}
              style={{
                ...styles.convoItem,
                ...(c.id === activeId && tab === "chat" ? styles.convoItemActive : {}),
              }}
              onClick={() => {
                setActiveId(c.id);
                setTab("chat");
              }}
            >
              <span style={styles.convoTitle}>{c.title}</span>
              <button
                style={styles.convoDelete}
                onClick={(e) => {
                  e.stopPropagation();
                  deleteConversation(c.id);
                }}
              >
                ✕
              </button>
            </div>
          ))}
        </div>
      </aside>

      <main style={styles.main}>
        {tab === "images" ? (
          <ImageGenerator />
        ) : (
          <div style={styles.chatArea}>
            <div style={styles.messages} ref={scrollRef}>
              {active.messages.length === 0 && (
                <div style={styles.emptyState}>
                  Escribí algo para empezar a chatear con Doris AI.
                </div>
              )}
              {active.messages.map((m, i) => (
                <div
                  key={i}
                  style={{
                    ...styles.bubble,
                    ...(m.role === "user" ? styles.bubbleUser : styles.bubbleModel),
                  }}
                >
                  {m.text}
                </div>
              ))}
              {loading && <div style={styles.typing}>Doris AI está escribiendo…</div>}
            </div>
            <div style={styles.inputRow}>
              <input
                style={styles.chatInput}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Escribí tu mensaje..."
                onKeyDown={(e) => e.key === "Enter" && !loading && sendMessage()}
              />
              <button style={styles.sendBtn} onClick={sendMessage} disabled={loading}>
                Enviar
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

const styles = {
  app: { display: "flex", height: "100vh", background: "#0a0e17" },
  sidebar: {
    width: "260px",
    background: "#0d1220",
    borderRight: "1px solid #ff2fd033",
    display: "flex",
    flexDirection: "column",
    padding: "16px",
    gap: "12px",
  },
  logo: {
    color: "#ff2fd0",
    fontWeight: "bold",
    fontSize: "20px",
    letterSpacing: "2px",
    textShadow: "0 0 10px #ff2fd0aa",
    marginBottom: "8px",
  },
  newBtn: {
    background: "linear-gradient(90deg,#ff2fd0,#00f0ff)",
    border: "none",
    color: "#0a0e17",
    fontWeight: "bold",
    padding: "10px",
    borderRadius: "6px",
    cursor: "pointer",
  },
  tabs: { display: "flex", gap: "6px" },
  tabBtn: {
    flex: 1,
    background: "transparent",
    border: "1px solid #00f0ff44",
    color: "#9fb3c8",
    padding: "8px",
    borderRadius: "6px",
    cursor: "pointer",
    fontSize: "13px",
  },
  tabBtnActive: {
    color: "#00f0ff",
    borderColor: "#00f0ff",
    boxShadow: "0 0 8px #00f0ff55",
  },
  convoList: { flex: 1, overflowY: "auto", display: "flex", flexDirection: "column", gap: "4px" },
  convoItem: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "8px 10px",
    borderRadius: "6px",
    cursor: "pointer",
    color: "#9fb3c8",
    fontSize: "13px",
  },
  convoItemActive: { background: "#1a2333", color: "#e0f7ff" },
  convoTitle: { overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" },
  convoDelete: { background: "transparent", border: "none", color: "#ff2f5f", cursor: "pointer" },
  keyFooterBtn: {
    background: "transparent",
    border: "1px solid #ff2fd044",
    color: "#ff9fe8",
    padding: "8px",
    borderRadius: "6px",
    cursor: "pointer",
    fontSize: "12px",
  },
  main: { flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" },
  chatArea: { flex: 1, display: "flex", flexDirection: "column", padding: "16px", overflow: "hidden" },
  messages: { flex: 1, overflowY: "auto", display: "flex", flexDirection: "column", gap: "10px", padding: "8px" },
  emptyState: { color: "#5f7385", textAlign: "center", marginTop: "40px", fontSize: "14px" },
  bubble: {
    maxWidth: "70%",
    padding: "10px 14px",
    borderRadius: "10px",
    fontSize: "14px",
    lineHeight: 1.5,
    whiteSpace: "pre-wrap",
  },
  bubbleUser: {
    alignSelf: "flex-end",
    background: "linear-gradient(90deg,#ff2fd033,#00f0ff33)",
    border: "1px solid #00f0ff55",
    color: "#e0f7ff",
  },
  bubbleModel: {
    alignSelf: "flex-start",
    background: "#111827",
    border: "1px solid #ff2fd033",
    color: "#e0f7ff",
  },
  typing: { color: "#5f7385", fontSize: "12px", fontStyle: "italic", padding: "0 8px" },
  inputRow: { display: "flex", gap: "8px", marginTop: "12px" },
  chatInput: {
    flex: 1,
    background: "#111827",
    border: "1px solid #ff2fd055",
    color: "#e0f7ff",
    padding: "12px",
    borderRadius: "6px",
    fontFamily: "monospace",
  },
  sendBtn: {
    background: "linear-gradient(90deg,#ff2fd0,#00f0ff)",
    border: "none",
    color: "#0a0e17",
    fontWeight: "bold",
    padding: "0 20px",
    borderRadius: "6px",
    cursor: "pointer",
  },
};
