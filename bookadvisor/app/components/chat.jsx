"use client";
import { useState, useRef, useEffect } from "react";
import axios from "axios";

export default function ChatUI({ userId = 1 }) {
  const [messages, setMessages] = useState([
    { role: "ai", content: "¡Hola! Pídeme recomendaciones o busca un libro." },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef();

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages, loading]);

  const sendMessage = async () => {
    if (!input.trim()) return;
    const userMsg = { role: "user", content: input };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    try {
      const res = await axios.post("/api/aiAssistant", { message: input, userId });
      const data = res.data;

      let aiText = "";
      if (data.tool === "searchBooks") {
        aiText = "Recomendaciones:\n" + data.books.map((b, i) => `${i + 1}. ${b.title} — ${b.authors}`).join("\n");
      } else if (data.tool === "getBookDetails") {
        const b = data.book;
        aiText = `${b.title} — ${b.authors}\n${b.pageCount ? b.pageCount + " páginas\n" : ""}${b.description || ""}`;
      } else if (data.tool === "getReadingList") {
        const list = data.list || [];
        aiText = list.length ? list.map((x, i) => `${i + 1}. ${x.title} — ${x.authors}`).join("\n") : "Tu lista está vacía.";
      } else if (data.tool === "getReadingStats") {
        const s = data.stats || {};
        aiText = `Lectura:\nLeídos: ${s.totalRead}\nEn lista: ${s.totalReading}\nPáginas totales: ${s.pagesTotal}\nGénero favorito: ${s.favoriteGenre || "N/A"}`;
      } else if (data.tool === "addToReadingList") {
        aiText = data.result?.already ? "El libro ya estaba en tu lista." : "Libro agregado a tu lista";
      } else if (data.tool === "markAsRead") {
        aiText = "¡Genial! Libro marcado como leído";
      } else if (data.message) {
        aiText = data.message;
      } else if (data.error) {
        aiText = `Error: ${data.error}`;
      } else {
        aiText = "Respuesta recibida";
      }

      setMessages((prev) => [...prev, { role: "ai", content: aiText }]);
    } catch (err) {
      console.error(err);
      setMessages((prev) => [...prev, { role: "ai", content: "Ocurrió un error en el servidor" }]);
    } finally {
      setLoading(false);
    }
  };

  const handleKey = (e) => {
    if (e.key === "Enter") sendMessage();
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1 style={styles.h1}>AI</h1>
        <h2 style={styles.h2}>Book Advisor</h2>
      </div>

      <div style={styles.card}>
        <div style={styles.chatBox} ref={scrollRef}>
          {messages.map((m, i) => (
            <div key={i} style={{ ...styles.msg, ...(m.role === "user" ? styles.user : styles.ai) }}>
              <pre style={{ margin: 0, whiteSpace: "pre-wrap" }}>{m.content}</pre>
            </div>
          ))}
          {loading && <div style={{ ...styles.msg, ...styles.ai }}>AI pensando...</div>}
        </div>

        <div style={styles.inputArea}>
          <input
            style={styles.input}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKey}
            placeholder='Ej: "Recomiéndame libros de ciencia ficción"'
          />
          <button style={styles.btn} onClick={sendMessage} disabled={loading}>
            {loading ? "Enviando..." : "Enviar"}
          </button>
        </div>
      </div>

      <div style={styles.bottomLeft} />
      <div style={styles.bottomRight} />
    </div>
  );
}

const styles = {
  container: { minHeight: "100vh", backgroundColor: "#fff", display: "flex", flexDirection: "column", alignItems: "center" },
  header: { backgroundColor: "#0E3A46", width: "130%", height: 180, display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", borderBottomLeftRadius: 300, borderBottomRightRadius: 300 },
  h1: { color: "#fff", fontSize: 36, margin: 0 },
  h2: { color: "#E6F1F4", fontSize: 14, margin: 2 },
  card: { width: 420, backgroundColor: "#fff", marginTop: -40, borderRadius: 16, border: "1px solid #E5E7EB", padding: 18, boxShadow: "0 4px 12px rgba(0,0,0,0.08)" },
  chatBox: { height: 380, overflowY: "auto", marginBottom: 12, display: "flex", flexDirection: "column", gap: 8 },
  msg: { padding: 10, borderRadius: 10, maxWidth: "85%", wordBreak: "break-word" },
  user: { backgroundColor: "#0E3A46", color: "#fff", alignSelf: "flex-end" },
  ai: { backgroundColor: "#F9FAFB", color: "#111827", alignSelf: "flex-start", border: "1px solid #E5E7EB" },
  inputArea: { display: "flex", gap: 8 },
  input: { flex: 1, height: 42, borderRadius: 8, border: "1px solid #E5E7EB", padding: "0 12px", backgroundColor: "#F9FAFB" },
  btn: { backgroundColor: "#0E3A46", color: "#fff", border: "none", padding: "0 16px", borderRadius: 8, fontWeight: 700, cursor: "pointer" },
  bottomLeft: { position: "absolute", bottom: 0, left: -10, width: 90, height: 80, backgroundColor: "#0E3A46", borderTopRightRadius: 80 },
  bottomRight: { position: "absolute", bottom: 0, right: -10, width: 90, height: 80, backgroundColor: "#0E3A46", borderTopLeftRadius: 80 },
};
