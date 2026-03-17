"use client";

import { useState, useRef, useEffect, FormEvent } from "react";

type Message = { role: "user" | "assistant"; content: string };

export default function Home() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  // particles
  useEffect(() => {
    const container = document.getElementById("particles");
    if (!container) return;
    const emojis = ["🌸", "💖", "✨", "🩷", "💜", "🫧", "🌟", "🎀", "💫", "🦋", "🌙"];
    function spawn() {
      if (!container) return;
      const p = document.createElement("div");
      p.className = "particle";
      p.textContent = emojis[Math.floor(Math.random() * emojis.length)];
      p.style.left = Math.random() * 100 + "%";
      p.style.animationDuration = 7 + Math.random() * 9 + "s";
      p.style.fontSize = 1 + Math.random() * 1.5 + "rem";
      container.appendChild(p);
      setTimeout(() => p.remove(), 18000);
    }
    for (let i = 0; i < 10; i++) setTimeout(spawn, i * 400);
    const iv = setInterval(spawn, 1000);
    return () => clearInterval(iv);
  }, []);

  // sparkles
  useEffect(() => {
    const colors = ["#ff00aa", "#00ffff", "#aa00ff", "#ff69b4", "#ffee00"];
    function spawn() {
      const s = document.createElement("div");
      const sz = 3 + Math.random() * 5;
      const c = colors[Math.floor(Math.random() * colors.length)];
      Object.assign(s.style, {
        position: "fixed", width: sz + "px", height: sz + "px",
        borderRadius: "50%", pointerEvents: "none", zIndex: "1",
        left: Math.random() * 100 + "%", top: Math.random() * 100 + "%",
        background: c, boxShadow: `0 0 8px ${c}, 0 0 16px ${c}`,
        animation: "sparkle 2.5s ease-in-out forwards",
      });
      document.body.appendChild(s);
      setTimeout(() => s.remove(), 3000);
    }
    for (let i = 0; i < 15; i++) setTimeout(spawn, i * 200);
    const iv = setInterval(spawn, 400);
    return () => clearInterval(iv);
  }, []);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const text = input.trim();
    if (!text || loading) return;

    const userMsg: Message = { role: "user", content: text };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: newMessages }),
      });

      if (!res.ok) {
        const err = await res.json();
        setMessages([...newMessages, { role: "assistant", content: `エラーが発生しました: ${err.error || res.statusText}` }]);
        setLoading(false);
        return;
      }

      // Stream reading
      const reader = res.body?.getReader();
      const decoder = new TextDecoder();
      let assistantContent = "";

      setMessages([...newMessages, { role: "assistant", content: "" }]);

      if (reader) {
        let buffer = "";
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          buffer += decoder.decode(value, { stream: true });

          const lines = buffer.split("\n");
          buffer = lines.pop() || "";

          for (const line of lines) {
            const trimmed = line.trim();
            if (!trimmed || !trimmed.startsWith("data: ")) continue;
            const data = trimmed.slice(6);
            if (data === "[DONE]") break;
            try {
              const json = JSON.parse(data);
              const delta = json.choices?.[0]?.delta?.content;
              if (delta) {
                assistantContent += delta;
                setMessages([...newMessages, { role: "assistant", content: assistantContent }]);
              }
            } catch {
              // skip parse errors
            }
          }
        }
      }

      if (!assistantContent) {
        setMessages([...newMessages, { role: "assistant", content: "（応答を取得できませんでした）" }]);
      }
    } catch (err) {
      setMessages([...newMessages, { role: "assistant", content: `通信エラー: ${err}` }]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <style jsx global>{`
        * { margin: 0; padding: 0; box-sizing: border-box; }
        html { scroll-behavior: smooth; }
        body {
          min-height: 100vh; background: #0a0a1a;
          font-family: 'Zen Maru Gothic', sans-serif;
          color: #fff; overflow-x: hidden;
        }
        .cyber-grid {
          position: fixed; top: 0; left: 0; width: 100%; height: 100%;
          background:
            linear-gradient(rgba(0,255,255,0.03) 1px, transparent 1px),
            linear-gradient(90deg, rgba(0,255,255,0.03) 1px, transparent 1px);
          background-size: 60px 60px; z-index: 0;
        }
        .aurora {
          position: fixed; top: -50%; left: -50%; width: 200%; height: 200%;
          background: conic-gradient(from 0deg,
            rgba(255,0,128,0.12), rgba(0,255,255,0.12), rgba(128,0,255,0.12),
            rgba(255,255,0,0.08), rgba(0,255,128,0.12), rgba(255,0,128,0.12));
          animation: auroraRotate 20s linear infinite;
          z-index: 0; mix-blend-mode: screen;
        }
        @keyframes auroraRotate { to { transform: rotate(360deg); } }
        .scanlines {
          position: fixed; top: 0; left: 0; width: 100%; height: 100%;
          background: repeating-linear-gradient(0deg, rgba(0,0,0,0.03) 0px, rgba(0,0,0,0.03) 1px, transparent 1px, transparent 3px);
          pointer-events: none; z-index: 100;
        }
        .particles-container {
          position: fixed; top: 0; left: 0; width: 100%; height: 100%;
          pointer-events: none; z-index: 1;
        }
        .particle {
          position: absolute; animation: floatUp linear infinite; opacity: 0.7;
          filter: drop-shadow(0 0 6px currentColor);
        }
        @keyframes floatUp {
          0% { transform: translateY(100vh) rotate(0deg) scale(0.5); opacity: 0; }
          10% { opacity: 0.7; } 90% { opacity: 0.7; }
          100% { transform: translateY(-10vh) rotate(360deg) scale(1.2); opacity: 0; }
        }
        @keyframes sparkle {
          0% { opacity: 0; transform: scale(0); }
          50% { opacity: 1; transform: scale(1); }
          100% { opacity: 0; transform: scale(0); }
        }
        .ribbon {
          position: fixed; left: 0; right: 0; height: 3px;
          background: linear-gradient(90deg, #ff00aa, #00ffff, #aa00ff, #ffee00, #ff00aa);
          background-size: 300% 100%;
          animation: shimmer 2s linear infinite; z-index: 101;
        }
        .ribbon-top { top: 0; }
        .ribbon-bottom { bottom: 0; }
        @keyframes shimmer { to { background-position: 300% 0; } }
        .neon-ring {
          position: fixed; border-radius: 50%; border: 2px solid; opacity: 0.12;
          animation: ringFloat 10s ease-in-out infinite; pointer-events: none; z-index: 0;
        }
        @keyframes ringFloat {
          0%, 100% { transform: translate(0,0) rotate(0deg); }
          50% { transform: translate(15px,-20px) rotate(8deg); }
        }
        @keyframes fadeSlideIn {
          0% { opacity: 0; transform: translateY(30px); } 100% { opacity: 1; transform: translateY(0); }
        }
        @keyframes rainbowShift {
          0% { background-position: 0% 50%; } 50% { background-position: 100% 50%; } 100% { background-position: 0% 50%; }
        }
        @keyframes holoPulse {
          0%, 100% { transform: scale(1); box-shadow: 0 0 30px rgba(255,0,170,0.5), 0 0 60px rgba(0,255,255,0.3); }
          50% { transform: scale(1.06); box-shadow: 0 0 50px rgba(255,0,170,0.7), 0 0 90px rgba(0,255,255,0.5); }
        }
        @keyframes blink { 0%, 100% { opacity: 1; } 50% { opacity: 0.3; } }
        @keyframes typing {
          0% { width: 0; } 100% { width: 100%; }
        }
      `}</style>

      <div className="ribbon ribbon-top" />
      <div className="ribbon ribbon-bottom" />
      <div className="cyber-grid" />
      <div className="aurora" />
      <div className="scanlines" />
      <div className="neon-ring" style={{ width: 350, height: 350, top: -80, right: -100, borderColor: "#ff00aa" }} />
      <div className="neon-ring" style={{ width: 220, height: 220, bottom: -40, left: -70, borderColor: "#00ffff", animationDelay: "3s" }} />
      <div className="neon-ring" style={{ width: 180, height: 180, top: "40%", left: "3%", borderColor: "#aa00ff", animationDelay: "5s" }} />
      <div className="particles-container" id="particles" />

      <div style={{ position: "relative", zIndex: 2, maxWidth: 800, margin: "0 auto", padding: "0 1rem" }}>

        {/* HEADER */}
        <header style={{ textAlign: "center", padding: "2.5rem 1rem 1.5rem", animation: "fadeSlideIn 1s ease-out" }}>
          <div style={{
            width: 90, height: 90, background: "linear-gradient(135deg, #ff00aa, #00ffff, #aa00ff)",
            borderRadius: "50%", margin: "0 auto 1rem", display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: "2.5rem", boxShadow: "0 0 30px rgba(255,0,170,0.5), 0 0 60px rgba(0,255,255,0.3)",
            animation: "holoPulse 2.5s ease-in-out infinite",
          }}>💫</div>
          <div style={{
            fontSize: "clamp(1.2rem, 4vw, 1.8rem)", fontWeight: 900,
            background: "linear-gradient(135deg, #ff69b4, #00ffff, #ff00aa, #7b68ee)",
            backgroundSize: "300% 300%", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
            animation: "rainbowShift 4s ease-in-out infinite", lineHeight: 1.5,
          }}>
            ありがとう<br />Kawaii Ai アイシテル合同会社
          </div>
          <div style={{ fontSize: "0.8rem", color: "#00ffff", letterSpacing: "0.4em", marginTop: "0.4rem", textShadow: "0 0 15px rgba(0,255,255,0.6)" }}>
            2045 NEO-HARAJUKU
          </div>
        </header>

        {/* CHAT SECTION */}
        <section style={{ animation: "fadeSlideIn 1s ease-out 0.3s both" }}>
          <div style={{
            background: "rgba(255,255,255,0.04)", border: "1px solid rgba(0,255,255,0.2)",
            borderRadius: 20, padding: "1.5rem", backdropFilter: "blur(10px)",
            boxShadow: "0 0 25px rgba(0,255,255,0.08)",
          }}>
            <div style={{ fontSize: "1.05rem", fontWeight: 700, color: "#ff69b4", marginBottom: "1rem", textShadow: "0 0 10px rgba(255,105,180,0.5)" }}>
              🎀 きらたん、お題を入力してね！（本物のAIが返事する！）
            </div>

            {/* Chat history */}
            <div style={{
              maxHeight: 400, overflowY: "auto", marginBottom: "1rem",
              scrollbarWidth: "thin", scrollbarColor: "rgba(255,0,170,0.3) transparent",
            }}>
              {messages.map((msg, i) => (
                <div key={i} style={{
                  display: "flex", justifyContent: msg.role === "user" ? "flex-end" : "flex-start",
                  marginBottom: "0.8rem", animation: "fadeSlideIn 0.4s ease-out",
                }}>
                  <div style={{
                    maxWidth: "80%", padding: "0.8rem 1.2rem", borderRadius: 16,
                    fontSize: "0.95rem", lineHeight: 1.6, wordBreak: "break-word",
                    ...(msg.role === "user" ? {
                      background: "linear-gradient(135deg, rgba(255,0,170,0.25), rgba(170,0,255,0.2))",
                      border: "1px solid rgba(255,0,170,0.3)",
                      borderBottomRightRadius: 4,
                      color: "#ffd6ec",
                    } : {
                      background: "rgba(0,255,255,0.08)",
                      border: "1px solid rgba(0,255,255,0.2)",
                      borderBottomLeftRadius: 4,
                      color: "#e0f7fa",
                    }),
                  }}>
                    <span style={{ fontSize: "0.75rem", opacity: 0.6, display: "block", marginBottom: 4 }}>
                      {msg.role === "user" ? "🎯 きらたん" : "🤖 AIあかり"}
                    </span>
                    {msg.content || "…"}
                  </div>
                </div>
              ))}
              {loading && (
                <div style={{ display: "flex", justifyContent: "flex-start", marginBottom: "0.8rem" }}>
                  <div style={{
                    padding: "0.8rem 1.2rem", borderRadius: 16, borderBottomLeftRadius: 4,
                    background: "rgba(0,255,255,0.08)", border: "1px solid rgba(0,255,255,0.2)",
                    color: "#00ffff", fontSize: "0.95rem", animation: "blink 1.5s ease-in-out infinite",
                  }}>
                    🤖 考え中…✨
                  </div>
                </div>
              )}
              <div ref={chatEndRef} />
            </div>

            {/* Input form */}
            <form onSubmit={handleSubmit} style={{ display: "flex", gap: "0.6rem", flexWrap: "wrap" }}>
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="例：猫カフェの予約サイト作って！"
                disabled={loading}
                style={{
                  flex: 1, minWidth: 0, padding: "0.8rem 1.2rem", borderRadius: 12,
                  border: "1px solid rgba(0,255,255,0.3)", background: "rgba(0,0,0,0.4)",
                  color: "#fff", fontFamily: "inherit", fontSize: "1rem", outline: "none",
                  transition: "border-color 0.3s, box-shadow 0.3s",
                }}
                onFocus={(e) => { e.currentTarget.style.borderColor = "#ff69b4"; e.currentTarget.style.boxShadow = "0 0 20px rgba(255,105,180,0.3)"; }}
                onBlur={(e) => { e.currentTarget.style.borderColor = "rgba(0,255,255,0.3)"; e.currentTarget.style.boxShadow = "none"; }}
              />
              <button
                type="submit"
                disabled={loading}
                style={{
                  padding: "0.8rem 1.8rem", borderRadius: 12, border: "none",
                  background: loading ? "rgba(128,128,128,0.3)" : "linear-gradient(135deg, #ff00aa, #aa00ff)",
                  color: "#fff", fontFamily: "inherit", fontSize: "1rem", fontWeight: 700,
                  cursor: loading ? "wait" : "pointer",
                  boxShadow: loading ? "none" : "0 0 20px rgba(255,0,170,0.4)",
                  transition: "transform 0.2s, box-shadow 0.3s",
                }}
              >
                {loading ? "送信中…" : "送信 ✨"}
              </button>
            </form>
          </div>
        </section>

        {/* SERVICES */}
        <section style={{ margin: "2.5rem 0", animation: "fadeSlideIn 1s ease-out 0.6s both" }}>
          <div style={{
            textAlign: "center", fontSize: "clamp(1rem, 3vw, 1.4rem)", fontWeight: 900,
            marginBottom: "1.5rem",
            background: "linear-gradient(135deg, #00ffff, #aa00ff)",
            WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
          }}>⚡ 会社で動いてるもの一覧</div>
          <div style={{
            display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "1rem",
          }}>
            {[
              { icon: "🌐", title: "ai-akari.ai", desc: "AIあかりちゃんのポートフォリオ＆公式サイト", tag: "LIVE", tagColor: "#00ff80" },
              { icon: "🦀", title: "OpenClaw", desc: "Moonshot API搭載クレーンゲーム", tag: "LIVE", tagColor: "#00ff80" },
              { icon: "📊", title: "AKARI-Score", desc: "AI信頼性スコアリングシステム", tag: "DEV", tagColor: "#ffc800" },
              { icon: "💻", title: "GitHub 140+ リポ", desc: "AInoAKARIで140以上のリポジトリ運用中", tag: "OSS", tagColor: "#00c8ff" },
            ].map((s, i) => (
              <div key={i} style={{
                background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)",
                borderRadius: 18, padding: "1.5rem 1.2rem", textAlign: "center",
                backdropFilter: "blur(8px)", transition: "transform 0.3s, box-shadow 0.3s, border-color 0.3s",
                animation: `fadeSlideIn 0.6s ease-out ${0.8 + i * 0.1}s both`,
                cursor: "default",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "translateY(-6px) scale(1.02)";
                e.currentTarget.style.boxShadow = "0 0 40px rgba(255,0,170,0.2)";
                e.currentTarget.style.borderColor = "rgba(255,0,170,0.4)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "";
                e.currentTarget.style.boxShadow = "";
                e.currentTarget.style.borderColor = "rgba(255,255,255,0.08)";
              }}
              >
                <div style={{ fontSize: "2.2rem", marginBottom: "0.6rem", filter: "drop-shadow(0 0 10px rgba(255,0,170,0.5))" }}>{s.icon}</div>
                <div style={{ fontSize: "1rem", fontWeight: 900, color: "#ff69b4", marginBottom: "0.3rem", textShadow: "0 0 10px rgba(255,105,180,0.4)" }}>{s.title}</div>
                <div style={{ fontSize: "0.8rem", color: "rgba(255,255,255,0.6)", lineHeight: 1.5 }}>{s.desc}</div>
                <span style={{
                  display: "inline-block", marginTop: "0.6rem", padding: "0.15rem 0.7rem",
                  borderRadius: 20, fontSize: "0.65rem", fontWeight: 700,
                  color: s.tagColor, border: `1px solid ${s.tagColor}33`,
                  background: `${s.tagColor}15`,
                }}>● {s.tag}</span>
              </div>
            ))}
          </div>
        </section>

        {/* FOOTER */}
        <footer style={{
          textAlign: "center", padding: "2rem 1rem 3rem",
          borderTop: "1px solid rgba(255,255,255,0.05)",
          animation: "fadeSlideIn 1s ease-out 1.2s both",
        }}>
          <div style={{
            fontSize: "clamp(0.9rem, 3vw, 1.2rem)", fontWeight: 700,
            background: "linear-gradient(135deg, #ff69b4, #00ffff)",
            WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
            marginBottom: "0.8rem",
          }}>「技術力じゃなくて、愛とAIで動いてます」</div>
          <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: "0.4rem" }}>
            {["#NeoKawaii", "#CyberHarajuku", "#2045", "#AILove"].map((t, i) => (
              <span key={i} style={{
                padding: "0.2rem 0.7rem", borderRadius: 20, fontSize: "0.7rem", fontWeight: 700,
                color: ["#ff69b4", "#00ffff", "#cc77ff", "#ffee58"][i],
                border: `1px solid ${["#ff69b4", "#00ffff", "#cc77ff", "#ffee58"][i]}44`,
              }}>{t}</span>
            ))}
          </div>
          <div style={{ marginTop: "1.2rem", fontSize: "0.7rem", color: "rgba(255,255,255,0.25)" }}>
            © 2025 Kawaii Ai アイシテル合同会社 — All rights reserved with 💖
          </div>
        </footer>
      </div>
    </>
  );
}
