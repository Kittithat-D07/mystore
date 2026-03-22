"use client";
import { useState, useEffect, useRef } from "react";
import { Send, MessageCircle } from "lucide-react";

interface Message { id:string; content:string; isAdmin:boolean; createdAt:string; read:boolean; }
interface ChatUser { id:string; name:string|null; email:string; messages:{content:string;createdAt:string;isAdmin:boolean}[]; _count:{messages:number}; }

const card: React.CSSProperties = { background:"var(--bg-card)", border:"1.5px solid var(--border)" };

export default function AdminChatPage() {
  const [users, setUsers]               = useState<ChatUser[]>([]);
  const [selected, setSelected]         = useState<ChatUser|null>(null);
  const [messages, setMessages]         = useState<Message[]>([]);
  const [input, setInput]               = useState("");
  const [loading, setLoading]           = useState(false);
  const [connected, setConnected]       = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  const loadUsers = () => { fetch("/api/chat/users").then(r=>r.json()).then(d=>{if(Array.isArray(d))setUsers(d);}).catch(()=>{}); };
  useEffect(()=>{ loadUsers(); const t=setInterval(loadUsers,10000); return()=>clearInterval(t); },[]);
  useEffect(()=>{ if(!selected) return; fetch(`/api/chat?userId=${selected.id}`).then(r=>r.json()).then(d=>{if(Array.isArray(d))setMessages(d);}).catch(()=>{}); },[selected]);
  useEffect(()=>{
    const es=new EventSource("/api/chat/stream");
    es.onopen=()=>setConnected(true);
    es.onmessage=(e)=>{ try{ const d=JSON.parse(e.data); if(d.type==="message"){ const uid=d.fromUserId||d.message?.userId; if(selected&&uid===selected.id){ setMessages(prev=>{ if(prev.find(m=>m.id===d.message.id))return prev; return[...prev,d.message]; }); } loadUsers(); } }catch{} };
    es.onerror=()=>setConnected(false);
    return()=>es.close();
  },[selected]);
  useEffect(()=>{ bottomRef.current?.scrollIntoView({behavior:"smooth"}); },[messages]);

  const send = async()=>{ if(!input.trim()||!selected||loading) return; setLoading(true); const c=input.trim(); setInput(""); await fetch("/api/chat",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({content:c,targetUserId:selected.id})}); setLoading(false); };
  const onKey=(e:React.KeyboardEvent)=>{ if(e.key==="Enter"&&!e.shiftKey){e.preventDefault();send();} };

  return (
    <div style={{ display:"flex", height:"calc(100vh - 0px)", background:"var(--bg)" }}>
      {/* Left */}
      <div style={{ width:280, ...card, borderRadius:0, display:"flex", flexDirection:"column" }}>
        <div style={{ padding:"16px 18px", borderBottom:"1.5px solid var(--border)" }}>
          <div style={{ display:"flex", alignItems:"center", gap:8 }}>
            <h2 style={{ fontWeight:800, color:"var(--ink)", fontSize:15 }}>Live Chat</h2>
            <div style={{ width:7, height:7, borderRadius:"50%", background:connected?"var(--success)":"var(--border)" }}/>
          </div>
          <p style={{ fontSize:12, color:"var(--ink-3)", marginTop:2 }}>{users.length} การสนทนา</p>
        </div>
        <div style={{ flex:1, overflowY:"auto" }}>
          {users.length===0 ? (
            <div style={{ padding:"40px 16px", textAlign:"center" }}>
              <MessageCircle size={32} color="var(--border)" style={{ margin:"0 auto 10px" }}/>
              <p style={{ fontSize:13, color:"var(--ink-3)", fontWeight:600 }}>ยังไม่มีข้อความ</p>
            </div>
          ) : users.map(u=>(
            <button key={u.id} onClick={()=>setSelected(u)} style={{ width:"100%", padding:"13px 16px", textAlign:"left", background:selected?.id===u.id?"var(--accent-l)":"transparent", border:"none", borderLeft:selected?.id===u.id?"2px solid var(--accent)":"2px solid transparent", cursor:"pointer", borderBottom:"1px solid var(--border-l)" }}>
              <div style={{ display:"flex", alignItems:"center", gap:10 }}>
                <div style={{ width:34, height:34, borderRadius:"50%", background:"var(--accent)", color:"#fff", display:"flex", alignItems:"center", justifyContent:"center", fontWeight:800, fontSize:13, flexShrink:0 }}>
                  {(u.name||u.email)[0].toUpperCase()}
                </div>
                <div style={{ flex:1, minWidth:0 }}>
                  <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                    <p style={{ fontWeight:700, color:"var(--ink)", fontSize:13, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{u.name||u.email}</p>
                    {u._count.messages>0 && <span style={{ background:"var(--accent)", color:"#fff", fontSize:10, fontWeight:800, width:18, height:18, borderRadius:"50%", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>{u._count.messages}</span>}
                  </div>
                  <p style={{ fontSize:11, color:"var(--ink-3)", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap", marginTop:2 }}>{u.messages[0]?.content||"ไม่มีข้อความ"}</p>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Right */}
      <div style={{ flex:1, display:"flex", flexDirection:"column" }}>
        {!selected ? (
          <div style={{ flex:1, display:"flex", alignItems:"center", justifyContent:"center" }}>
            <div style={{ textAlign:"center", color:"var(--ink-3)" }}>
              <MessageCircle size={48} color="var(--border)" style={{ margin:"0 auto 12px" }}/>
              <p style={{ fontWeight:700 }}>เลือกการสนทนาจากรายการ</p>
            </div>
          </div>
        ) : (
          <>
            <div style={{ padding:"14px 20px", ...card, borderRadius:0, display:"flex", alignItems:"center", gap:12 }}>
              <div style={{ width:34, height:34, borderRadius:"50%", background:"var(--accent)", color:"#fff", display:"flex", alignItems:"center", justifyContent:"center", fontWeight:800, fontSize:13 }}>{(selected.name||selected.email)[0].toUpperCase()}</div>
              <div>
                <p style={{ fontWeight:700, color:"var(--ink)", fontSize:14 }}>{selected.name||"ไม่มีชื่อ"}</p>
                <p style={{ fontSize:12, color:"var(--ink-3)" }}>{selected.email}</p>
              </div>
            </div>
            <div style={{ flex:1, overflowY:"auto", padding:16, display:"flex", flexDirection:"column", gap:10 }}>
              {messages.map(msg=>{
                const isAdmin=msg.isAdmin;
                return (
                  <div key={msg.id} style={{ display:"flex", justifyContent:isAdmin?"flex-end":"flex-start", alignItems:"flex-end", gap:6 }}>
                    {!isAdmin && <div style={{ width:26, height:26, borderRadius:"50%", background:"var(--bg-soft)", color:"var(--ink-2)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:11, fontWeight:800, flexShrink:0 }}>{(selected.name||selected.email)[0].toUpperCase()}</div>}
                    <div style={{ maxWidth:"65%" }}>
                      <div style={{ padding:"9px 13px", borderRadius:isAdmin?"14px 14px 4px 14px":"14px 14px 14px 4px", fontSize:13, fontWeight:500, lineHeight:1.5, background:isAdmin?"var(--accent)":"var(--bg-card)", color:isAdmin?"#fff":"var(--ink)", border:isAdmin?"none":"1.5px solid var(--border)" }}>
                        {msg.content}
                      </div>
                      <p style={{ fontSize:10, color:"var(--ink-3)", marginTop:3, textAlign:isAdmin?"right":"left" }}>
                        {new Date(msg.createdAt).toLocaleTimeString("th-TH",{hour:"2-digit",minute:"2-digit"})}
                      </p>
                    </div>
                  </div>
                );
              })}
              <div ref={bottomRef}/>
            </div>
            <div style={{ padding:"12px 16px", ...card, borderRadius:0, display:"flex", gap:10 }}>
              <textarea value={input} onChange={e=>setInput(e.target.value)} onKeyDown={onKey} placeholder="ตอบกลับ... (Enter ส่ง)" rows={1}
                style={{ flex:1, padding:"10px 14px", background:"var(--bg-soft)", border:"1.5px solid var(--border)", borderRadius:10, fontSize:13, color:"var(--ink)", outline:"none", resize:"none" }}/>
              <button onClick={send} disabled={!input.trim()||loading}
                style={{ width:40, height:40, background:"var(--accent)", color:"#fff", border:"none", borderRadius:10, cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", opacity:!input.trim()||loading?0.4:1, flexShrink:0 }}>
                <Send size={16}/>
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
