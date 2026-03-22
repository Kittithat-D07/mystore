"use client";
import { useState, useEffect, useRef } from "react";
import { useSession } from "next-auth/react";
import { Send, MessageCircle } from "lucide-react";

interface Message {
  id: string;
  content: string;
  isAdmin: boolean;
  createdAt: string;
  user: { name: string | null; email: string };
}

export default function ChatPage() {
  const { data: session } = useSession();
  const [messages, setMessages]   = useState<Message[]>([]);
  const [input, setInput]         = useState("");
  const [loading, setLoading]     = useState(false);
  const [connected, setConnected] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const eventSourceRef = useRef<EventSource | null>(null);

  // โหลดประวัติแชท
  useEffect(() => {
    fetch("/api/chat")
      .then((r) => r.json())
      .then((data) => { if (Array.isArray(data)) setMessages(data); })
      .catch(() => {});
  }, []);

  // เปิด SSE connection
  useEffect(() => {
    const es = new EventSource("/api/chat/stream");
    eventSourceRef.current = es;

    es.onopen = () => setConnected(true);

    es.onmessage = (e) => {
      try {
        const data = JSON.parse(e.data);
        if (data.type === "message") {
          setMessages((prev) => {
            const exists = prev.find((m) => m.id === data.message.id);
            if (exists) return prev;
            return [...prev, data.message];
          });
        }
      } catch {}
    };

    es.onerror = () => {
      setConnected(false);
      es.close();
      // reconnect หลัง 3 วินาที
      setTimeout(() => {
        const newEs = new EventSource("/api/chat/stream");
        eventSourceRef.current = newEs;
      }, 3000);
    };

    return () => { es.close(); };
  }, []);

  // Scroll ลงล่างเมื่อมีข้อความใหม่
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim() || loading) return;
    setLoading(true);
    const content = input.trim();
    setInput("");

    await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content }),
    });
    setLoading(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(); }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col">
      {/* Header */}
      <div className="bg-white border-b border-slate-100 px-6 py-4 sticky top-0 z-10">
        <div className="max-w-2xl mx-auto flex items-center gap-3">
          <div className="w-10 h-10 bg-teal-500 rounded-xl flex items-center justify-center">
            <MessageCircle size={20} className="text-white" />
          </div>
          <div>
            <h1 className="font-black text-slate-900">ติดต่อเรา</h1>
            <div className="flex items-center gap-1.5">
              <div className={`w-2 h-2 rounded-full ${connected ? "bg-green-400" : "bg-slate-300"}`} />
              <p className="text-xs text-slate-400">{connected ? "ออนไลน์" : "กำลังเชื่อมต่อ..."}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-6 py-6">
        <div className="max-w-2xl mx-auto space-y-4">
          {messages.length === 0 && (
            <div className="text-center py-16">
              <div className="w-16 h-16 bg-teal-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <MessageCircle size={28} className="text-teal-500" strokeWidth={1.5} />
              </div>
              <p className="font-bold text-slate-900">ส่งข้อความหาเราได้เลย</p>
              <p className="text-slate-400 text-sm mt-1">ทีมงานจะตอบกลับโดยเร็วที่สุด</p>
            </div>
          )}

          {messages.map((msg) => {
            const isMe = !msg.isAdmin;
            return (
              <div key={msg.id} className={`flex ${isMe ? "justify-end" : "justify-start"}`}>
                {!isMe && (
                  <div className="w-8 h-8 bg-teal-500 rounded-full flex items-center justify-center text-white text-xs font-black shrink-0 mr-2 mt-1">
                    A
                  </div>
                )}
                <div className={`max-w-[70%] ${isMe ? "items-end" : "items-start"} flex flex-col gap-1`}>
                  <div className={`px-4 py-3 rounded-2xl text-sm font-medium leading-relaxed ${
                    isMe
                      ? "bg-slate-900 text-white rounded-br-sm"
                      : "bg-white border border-slate-100 text-slate-900 shadow-sm rounded-bl-sm"
                  }`}>
                    {msg.content}
                  </div>
                  <p className="text-[10px] text-slate-400 px-1">
                    {new Date(msg.createdAt).toLocaleTimeString("th-TH", { hour: "2-digit", minute: "2-digit" })}
                  </p>
                </div>
              </div>
            );
          })}
          <div ref={bottomRef} />
        </div>
      </div>

      {/* Input */}
      <div className="bg-white border-t border-slate-100 px-6 py-4 sticky bottom-0">
        <div className="max-w-2xl mx-auto flex gap-3">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="พิมพ์ข้อความ... (Enter ส่ง, Shift+Enter ขึ้นบรรทัดใหม่)"
            rows={1}
            className="flex-1 px-4 py-3 bg-slate-50 border-2 border-slate-100 rounded-2xl text-sm font-medium text-slate-900 focus:border-teal-400 focus:bg-white outline-none resize-none transition-all placeholder:text-slate-300"
          />
          <button
            onClick={sendMessage}
            disabled={!input.trim() || loading}
            className="w-12 h-12 bg-slate-900 hover:bg-teal-600 text-white rounded-2xl flex items-center justify-center transition-all active:scale-95 disabled:opacity-40 shrink-0"
          >
            <Send size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}
