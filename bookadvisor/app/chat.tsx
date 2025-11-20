"use client";

import { useState, useRef, useEffect } from "react";

type Message = { role: "user" | "ai"; content: string };

export default function ChatPage() {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Message[]>([
    { role: "ai", content: "¡Hola! Pídeme recomendaciones o busca un libro." },
  ]);
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages, loading]);

  const sendMessage = async () => {
    if (!input.trim()) return;
    const userMsg = { role: "user", content: input };
    setMessages(prev => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: input, userId: 1 }),
      });
      const data = await res.json();

      let aiText = "";
      switch (data.tool) {
        case "searchBooks":
          aiText =
            "Recomendaciones:\n" +
            data.books
              .map((b: any, i: number) => {
                const authors = Array.isArray(b.authors) ? b.authors.join(", ") : b.authors || "Desconocido";
                return `${i + 1}. ${b.title} — ${authors}`;
              })
              .join("\n");
          break;

        case "getBookDetails":
          const b = data.book;
          const authorsDetail = Array.isArray(b.authors) ? b.authors.join(", ") : b.authors || "Desconocido";
          aiText = `${b.title} — ${authorsDetail}\n${b.pageCount ? b.pageCount + " páginas\n" : ""}${
            b.description || ""
          }`;
          break;

        case "addToReadingList":
          aiText = data.result?.already ? "El libro ya estaba en tu lista." : "Libro agregado a tu lista";
          break;

        case "getReadingList":
          const list = data.list || [];
          aiText = list.length
            ? "Tu lista de lectura:\n" +
              list
                .map((x: any, i: number) => {
                  const authorsList = Array.isArray(x.authors) ? x.authors.join(", ") : x.authors || "Desconocido";
                  return `${i + 1}. ${x.title} — ${authorsList}`;
                })
                .join("\n")
            : "Tu lista está vacía.";
          break;

        case "markAsRead":
          aiText = "¡Genial! Libro marcado como leído";
          break;

        case "getReadingStats":
          const s = data.stats || {};
          aiText = `Tus estadísticas de lectura:\nLeídos: ${s.totalRead}\nEn lista: ${s.totalReading}\nPáginas totales: ${
            s.pagesTotal || 0
          }`;
          break;

        case "error":
          aiText = `⚠️ Error: ${data.error}`;
          break;

        default:
          aiText = data.message || "Respuesta recibida";
      }

      setMessages(prev => [...prev, { role: "ai", content: aiText }]);
    } catch (err) {
      console.error(err);
      setMessages(prev => [...prev, { role: "ai", content: "⚠️ Ocurrió un error en el servidor." }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={s.container}>
      <div style={s.header}>
        <h1 style={s.h1}>Book Advisor</h1>
        <p style={s.h2}>Tu asistente de lectura</p>
      </div>

      <div style={s.chatContainer}>
        <div style={s.messages} ref={scrollRef}>
          {messages.map((m, i) => (
            <div
              key={i}
              style={{
                ...s.message,
                alignSelf: m.role === "user" ? "flex-end" : "flex-start",
                backgroundColor: m.role === "user" ? "#f5e9d3" : "#fff6eb",
                color: "#5b4636",
              }}
            >
              <b>{m.role === "user" ? "Tú" : "AI"}:</b> {m.content}
            </div>
          ))}
          {loading && (
            <div style={{ ...s.message, alignSelf: "flex-start", backgroundColor: "#fff6eb", color: "#5b4636" }}>
              ⏳ AI pensando...
            </div>
          )}
        </div>

        <div style={s.inputContainer}>
          <input
            type="text"
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === "Enter" && sendMessage()}
            placeholder="Escribe tu mensaje..."
            style={s.input}
          />
          <button onClick={sendMessage} disabled={loading} style={s.sendBtn}>
            {loading ? "..." : "Enviar"}
          </button>
        </div>
      </div>
    </div>
  );
}

const s: Record<string, React.CSSProperties> = {
  container: {
    minHeight: "100vh",
    backgroundColor: "#fdf6f0",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    fontFamily: "Helvetica, Arial, sans-serif",
    paddingBottom: 40,
  },
  header: {
    backgroundColor: "#e3d5c2",
    width: "100%",
    padding: 40,
    textAlign: "center",
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    boxShadow: "0px 4px 8px rgba(0,0,0,0.1)",
    marginBottom: 20,
  },
  h1: { fontSize: 36, fontWeight: "700", color: "#5b4636", margin: 0 },
  h2: { fontSize: 18, fontWeight: "500", color: "#6f5845", marginTop: 4 },
  chatContainer: {
    flex: 1,
    width: "100%",
    maxWidth: 600,
    display: "flex",
    flexDirection: "column",
    padding: 20,
  },
  messages: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    gap: 10,
    overflowY: "auto",
    paddingBottom: 10,
    borderRadius: 12,
    border: "1px solid #e0cbbf",
    padding: 12,
    backgroundColor: "#fffaf0",
  },
  message: {
    maxWidth: "80%",
    padding: "10px 14px",
    borderRadius: 12,
    boxShadow: "0px 2px 4px rgba(0,0,0,0.1)",
    whiteSpace: "pre-wrap",
  },
  inputContainer: {
    display: "flex",
    marginTop: 10,
  },
  input: {
    flex: 1,
    padding: 12,
    borderRadius: 10,
    border: "1px solid #e0cbbf",
    backgroundColor: "#fff6eb",
    outline: "none",
    fontSize: 16,
    marginRight: 8,
    color: "#5b4636",
  },
  sendBtn: {
    padding: "12px 20px",
    borderRadius: 10,
    backgroundColor: "#d9bfa8",
    color: "#5b4636",
    fontWeight: 600,
    border: "none",
    cursor: "pointer",
    transition: "background-color 0.2s",
  },
};
