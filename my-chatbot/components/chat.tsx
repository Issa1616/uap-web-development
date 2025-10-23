"use client";

import { useState } from "react";
import DOMPurify from "dompurify";

interface Message {
  role: "user" | "assistant";
  content: string;
}

export default function Chat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  async function sendMessage(e: React.FormEvent) {
    e.preventDefault();
    const cleanInput = DOMPurify.sanitize(input.trim());
    if (!cleanInput) return;

    const newMessage: Message = { role: "user", content: cleanInput };
    setMessages((prev) => [...prev, newMessage]);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: cleanInput }),
      });

      const data = await res.json();
      if (data.reply) {
        setMessages((prev) => [
          ...prev,
          { role: "assistant", content: data.reply },
        ]);
      } else {
        setMessages((prev) => [
          ...prev,
          { role: "assistant", content: "Error al obtener respuesta." },
        ]);
      }
    } catch (error) {
      console.error(error);
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "Error en la conexión con el servidor." },
      ]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col max-w-2xl mx-auto p-4 h-[90vh] dark:bg-gray-900 transition-colors duration-300">
      <h1 className="text-3xl font-bold mb-4 text-center text-blue-600 dark:text-blue-400">
        💬 Chatbot AI
      </h1>

      <div className="flex-1 overflow-y-auto border rounded-lg p-3 bg-gray-50 dark:bg-gray-800 shadow-inner transition-colors duration-300">
        {messages.map((msg, i) => (
          <div
            key={i}
            className={`my-2 p-3 rounded-2xl shadow-md max-w-[80%] transition-all ${
              msg.role === "user"
                ? "bg-blue-500 text-white self-end ml-auto text-right dark:bg-blue-600"
                : "bg-white text-gray-800 self-start text-left border dark:bg-gray-700 dark:text-gray-100 dark:border-gray-600"
            }`}
          >
            <strong>{msg.role === "user" ? "Tú:" : "Bot:"}</strong> {msg.content}
          </div>
        ))}

        {loading && (
          <div className="text-gray-500 dark:text-gray-400 animate-pulse mt-2">
            Escribiendo...
          </div>
        )}
      </div>

      <form onSubmit={sendMessage} className="mt-4 flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Escribe tu mensaje..."
          className="flex-1 border rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-blue-400 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400"
        />
        <button
          type="submit"
          disabled={loading}
          className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition disabled:opacity-50 dark:bg-blue-600 dark:hover:bg-blue-500"
        >
          Enviar
        </button>
      </form>
    </div>
  );
}
