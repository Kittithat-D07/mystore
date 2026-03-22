"use client";
import { useState, useEffect, useRef } from "react";
import { useSession } from "next-auth/react";
import { MessageCircle, X, Send, Minus } from "lucide-react";

interface Message { id:string; content:string; isAdmin:boolean; createdAt:string; }

export default function FloatingChat() {
  const { data: session } = useSession();
  const [open, setOpen]           = useState(false);
  const [minimized, setMinimized] = useState(false);
  const [messages, setMessages]   = useState<Message[]>([]);
  const [input, setInput]         = useState("");
  const [loading, setLoading]     = useState(false);
  const [unread, setUnread]       = useState(0);
  const [connected, setConnected] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const esRef     = useRef<EventSource|null>(null);
  const isAdmin   = session?.user?.role==="ADMIN";
  const loggedIn  = !!session?.user;

  useEffect(() => {
    if (!loggedIn||isAdmin) return;
    fetch("/api/chat").then(r=>r.json()).then(d=>{if(Array.isArray(d))setMessages(d);}).catch(()=>{});
  },[loggedIn,isAdmin]);

  useEffect(() => {
    if (!loggedIn||isAdmin) return;
    const es = new EventSource("/api/chat/stream");
    esRef.current=es;
    es.onopen=()=>setConnected(true);
    es.onmessage=(e)=>{
      try{const d=JSON.parse(e.data);if(d.type==="message"){setMessages(prev=>{if(prev.find(m=>m.id===d.message.id))return prev;return[...prev,d.message];});if(!open&&d.message.isAdmin)setUnread(n=>n+1);}}catch{}
    };
    es.onerror=()=>{setConnected(false);setTimeout(()=>{const ne=new EventSource("/api/chat/stream");esRef.current=ne;setConnected(true);},3000);};
    return()=>{es.close();};
  },[loggedIn,isAdmin]);

  useEffect(()=>{if(open)bottomRef.current?.scrollIntoView({behavior:"smooth"});},[messages,open]);
  useEffect(()=>{if(open)setUnread(0);},[open]);

  if(!loggedIn||isAdmin) return null;

  const send = async()=>{
    if(!input.trim()||loading) return;
    setLoading(true);const c=input.trim();setInput("");
    await fetch("/api/chat",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({content:c})});
    setLoading(false);
  };
  const onKey=(e:React.KeyboardEvent)=>{if(e.key==="Enter"&&!e.shiftKey){e.preventDefault();send();}};

  return (
    <div style={{ position:"fixed", bottom:24, right:24, zIndex:200, display:"flex", flexDirection:"column", alignItems:"flex-end", gap:10 }}>
      {open && !minimized && (
        <div style={{ width:320, height:420, background:"var(--bg-card)", border:"1.5px solid var(--border)", borderRadius:20, display:"flex", flexDirection:"column", overflow:"hidden", boxShadow:"0 12px 48px rgba(109,40,217,0.2)" }}>
          {/* Header */}
          <div style={{ background:"var(--accent)", padding:"12px 14px", display:"flex", alignItems:"center", justifyContent:"space-between", flexShrink:0 }}>
            <div style={{ display:"flex", alignItems:"center", gap:10 }}>
              <div style={{ width:32, height:32, background:"rgba(255,255,255,0.2)", borderRadius:10, display:"flex", alignItems:"center", justifyContent:"center" }}>
                <MessageCircle size={16} color="#fff"/>
              </div>
              <div>
                <p style={{ fontWeight:700, color:"#fff", fontSize:13, lineHeight:1.2 }}>ติดต่อเรา</p>
                <div style={{ display:"flex", alignItems:"center", gap:4 }}>
                  <div style={{ width:6, height:6, borderRadius:"50%", background:connected?"#6EE7B7":"rgba(255,255,255,0.3)" }}/>
                  <p style={{ fontSize:10, color:"rgba(255,255,255,0.7)" }}>{connected?"ออนไลน์":"กำลังเชื่อมต่อ..."}</p>
                </div>
              </div>
            </div>
            <div style={{ display:"flex", gap:2 }}>
              <button onClick={()=>setMinimized(true)} style={{ background:"none", border:"none", cursor:"pointer", padding:6, color:"rgba(255,255,255,0.7)" }}><Minus size={15}/></button>
              <button onClick={()=>setOpen(false)} style={{ background:"none", border:"none", cursor:"pointer", padding:6, color:"rgba(255,255,255,0.7)" }}><X size={15}/></button>
            </div>
          </div>
          {/* Messages */}
          <div style={{ flex:1, overflowY:"auto", padding:14, display:"flex", flexDirection:"column", gap:10, background:"var(--bg)" }}>
            {messages.length===0 && (
              <div style={{ textAlign:"center", padding:"40px 0", color:"var(--ink-3)" }}>
                <p style={{ fontWeight:600, fontSize:14 }}>สวัสดีครับ!</p>
                <p style={{ fontSize:12, marginTop:4 }}>มีอะไรให้ช่วยไหมครับ?</p>
              </div>
            )}
            {messages.map(msg=>{
              const isMe=!msg.isAdmin;
              return (
                <div key={msg.id} style={{ display:"flex", justifyContent:isMe?"flex-end":"flex-start", alignItems:"flex-end", gap:6 }}>
                  {!isMe && <div style={{ width:24, height:24, background:"var(--accent)", borderRadius:"50%", display:"flex", alignItems:"center", justifyContent:"center", color:"#fff", fontSize:10, fontWeight:700, flexShrink:0 }}>A</div>}
                  <div style={{ maxWidth:"75%" }}>
                    <div style={{ padding:"8px 12px", borderRadius:isMe?"14px 14px 4px 14px":"14px 14px 14px 4px", fontSize:13, fontWeight:500, lineHeight:1.5, background:isMe?"var(--accent)":"var(--bg-card)", color:isMe?"#fff":"var(--ink)", border:isMe?"none":"1.5px solid var(--border)" }}>
                      {msg.content}
                    </div>
                    <p style={{ fontSize:9, color:"var(--ink-3)", marginTop:3, textAlign:isMe?"right":"left" }}>
                      {new Date(msg.createdAt).toLocaleTimeString("th-TH",{hour:"2-digit",minute:"2-digit"})}
                    </p>
                  </div>
                </div>
              );
            })}
            <div ref={bottomRef}/>
          </div>
          {/* Input */}
          <div style={{ padding:10, background:"var(--bg-card)", borderTop:"1.5px solid var(--border)", display:"flex", gap:8, flexShrink:0 }}>
            <input value={input} onChange={e=>setInput(e.target.value)} onKeyDown={onKey} placeholder="พิมพ์ข้อความ..."
              style={{ flex:1, padding:"8px 12px", background:"var(--bg-soft)", border:"1.5px solid var(--border)", borderRadius:10, fontSize:13, color:"var(--ink)", outline:"none" }}/>
            <button onClick={send} disabled={!input.trim()||loading}
              style={{ width:36, height:36, background:"var(--accent)", color:"#fff", border:"none", borderRadius:10, cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", opacity:!input.trim()||loading?0.4:1, flexShrink:0 }}>
              <Send size={15}/>
            </button>
          </div>
        </div>
      )}

      {open && minimized && (
        <button onClick={()=>setMinimized(false)} style={{ background:"var(--accent)", color:"#fff", border:"none", borderRadius:20, padding:"10px 16px", cursor:"pointer", display:"flex", alignItems:"center", gap:8, fontWeight:700, fontSize:13, boxShadow:"0 4px 20px rgba(109,40,217,0.3)" }}>
          <MessageCircle size={16}/>ติดต่อเรา
          {unread>0 && <span style={{ background:"#DC2626", color:"#fff", fontSize:10, fontWeight:800, width:18, height:18, borderRadius:"50%", display:"flex", alignItems:"center", justifyContent:"center" }}>{unread}</span>}
        </button>
      )}

      {!open && (
        <button onClick={()=>{setOpen(true);setMinimized(false);setUnread(0);}}
          style={{ width:52, height:52, background:"var(--accent)", color:"#fff", border:"none", borderRadius:16, cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", boxShadow:"0 6px 24px rgba(109,40,217,0.4)", position:"relative", transition:"transform 0.2s" }}
          onMouseEnter={e=>(e.currentTarget.style.transform="scale(1.1)")}
          onMouseLeave={e=>(e.currentTarget.style.transform="")}>
          <MessageCircle size={22}/>
          {unread>0 && <span style={{ position:"absolute", top:-4, right:-4, background:"#DC2626", color:"#fff", fontSize:9, fontWeight:800, minWidth:18, height:18, borderRadius:9, display:"flex", alignItems:"center", justifyContent:"center", padding:"0 3px", border:"2px solid var(--bg)" }}>{unread}</span>}
        </button>
      )}
    </div>
  );
}
