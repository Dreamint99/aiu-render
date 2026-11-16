// AI University — "এআই ফর এভরিওয়ান" lesson engine (2026-11-15). Dark "AI lab" look in the brand navy/royal blue:
// glowing neural-net background, look-alike chat app windows (typing cursor + streaming answer, trademark note),
// token chips, next-word probability bars (real numbers measured from a model), pipeline with a travelling packet,
// training vs answering, myth/fact, good vs bad prompt, quiz, recap, outro.
// One spec per lesson: src/ai4e/specs/<id>.json, timed by scripts/ai4e_make.py (Bangla VO via OpenRouter Tanvir).
// Scenes: title · chat · phone · tokens · predict · pipeline · train · myth · compare · points · quizQ · quizA · recap · outro
import React from "react";
import { AbsoluteFill, Audio, Img, Sequence, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig, Easing, delayRender, continueRender } from "remotion";

const K = {
  bg: "#050A1C", bg2: "#0A1638", ink: "#F3F6FF", dim: "rgba(225,232,255,.66)", faint: "rgba(225,232,255,.14)", line: "rgba(140,170,255,.22)",
  blue: "#3D7BFF", royal: "#0050ED", sky: "#7FB2FF", cyan: "#4FE3D6", violet: "#A78BFA", pink: "#FF8FC7", gold: "#FFD166", green: "#5BE49B", red: "#FF6B6B", card: "rgba(16,28,66,.72)",
};
const BN = "Anek", EN = "Manrope";
if (typeof document !== "undefined") {
  for (const [n, u, w] of [["Anek", "fonts/AnekBangla.ttf", "100 900"], ["Manrope", "fonts/Manrope-700.ttf", "700"], ["Manrope", "fonts/Manrope-500.ttf", "500"]]) {
    const h = delayRender(`font ${n}${w}`);
    const f = new FontFace(n, `url(${staticFile(u)})`, { weight: w });
    f.load().then(() => { document.fonts.add(f); continueRender(h); }).catch(() => continueRender(h));
  }
}
const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const ease = Easing.bezier(0.16, 1, 0.3, 1);
const bn = (n: number | string) => String(n).replace(/\d/g, (d) => "০১২৩৪৫৬৭৮৯"[+d]);
const pop = (f: number, fps: number, d: number) => spring({ frame: f - d, fps, config: { damping: 14, mass: 0.6 } });
const GRAD = `linear-gradient(92deg, ${K.sky} 0%, ${K.cyan} 45%, ${K.violet} 100%)`;

export type Scene = { type: string; vo: string; frames: number; hold?: number; [k: string]: any };
export type Spec = { id: string; course: string; module: string; lessonNo: string; title: string; next: string; scenes: Scene[] };
const LEAD = 12, TAIL = 18;
const sceneLen = (s: Scene) => LEAD + s.frames + (s.hold || 0) + TAIL;
export const aiLen = (spec: Spec) => spec.scenes.reduce((n, s) => n + sceneLen(s), 0) + 30;
type P = { s: Scene; spec: Spec; vo: number };
const v = (p: P, x: number) => LEAD + p.vo * x;
const COL: Record<string, string> = { b: K.sky, c: K.cyan, v: K.violet, p: K.pink, y: K.gold, g: K.green, r: K.red, w: K.ink };

/* ---------- primitives ---------- */
const Fade: React.FC<{ at: number; children: React.ReactNode; style?: React.CSSProperties; y?: number }> = ({ at, children, style, y = 18 }) => {
  const f = useCurrentFrame(); const o = interpolate(f, [at, at + 12], [0, 1], { ...clamp, easing: ease });
  return <div style={{ opacity: o, transform: `translateY(${(1 - o) * y}px)`, ...style }}>{children}</div>;
};
const Pop: React.FC<{ at: number; children: React.ReactNode; style?: React.CSSProperties }> = ({ at, children, style }) => {
  const f = useCurrentFrame(); const { fps } = useVideoConfig(); const k = pop(f, fps, at);
  return <div style={{ opacity: Math.min(1, k * 1.4), transform: `scale(${0.6 + 0.4 * k})`, ...style }}>{children}</div>;
};
// "[c:টোকেন] মানে" → coloured spans
const Rich: React.FC<{ t: string; style?: React.CSSProperties }> = ({ t, style }) => (
  <span style={style}>{String(t).split(/(\[[a-z]:[^\]]+\])/).filter(Boolean).map((x, i) => {
    const m = x.match(/^\[([a-z]):([^\]]+)\]$/);
    return m ? <span key={i} style={{ color: COL[m[1]] || K.ink, fontWeight: 700 }}>{m[2]}</span> : <span key={i}>{x}</span>;
  })}</span>
);
const Head: React.FC<{ t: string; at?: number; kicker?: string }> = ({ t, at = 2, kicker }) => (
  <Fade at={at} style={{ marginBottom: 34 }}>
    {kicker && <div style={{ fontFamily: BN, fontSize: 28, color: K.cyan, fontWeight: 600, marginBottom: 6 }}>{kicker}</div>}
    <div style={{ fontFamily: BN, fontSize: 60, fontWeight: 700, color: K.ink, lineHeight: 1.2 }}><Rich t={t} /></div>
  </Fade>
);
const Box: React.FC<{ children: React.ReactNode; style?: React.CSSProperties }> = ({ children, style }) => (
  <div style={{ position: "absolute", left: 130, right: 130, top: 140, bottom: 170, display: "flex", flexDirection: "column", ...style }}>{children}</div>
);
const Card: React.FC<{ children: React.ReactNode; style?: React.CSSProperties; glow?: string }> = ({ children, style, glow = K.blue }) => (
  <div style={{ background: K.card, border: `1.5px solid ${K.line}`, borderRadius: 26, boxShadow: `0 30px 80px rgba(0,0,0,.45), 0 0 60px ${glow}22`, ...style }}>{children}</div>
);

/* ---------- background: slow glows + dot grid + neural net ---------- */
const NODES = Array.from({ length: 34 }, (_, i) => { const a = Math.sin(i * 12.9898) * 43758.5453; const b = Math.sin(i * 78.233) * 12543.123; return { x: (a - Math.floor(a)) * 1920, y: (b - Math.floor(b)) * 1080 }; });
const EDGES = NODES.flatMap((n, i) => NODES.map((m, j) => ({ i, j, d: Math.hypot(n.x - m.x, n.y - m.y) })).filter((e) => e.j > i && e.d < 330)).slice(0, 60);
const Background: React.FC<{ strong?: number }> = ({ strong = 0 }) => {
  const f = useCurrentFrame();
  const a = 0.35 + 0.65 * strong;
  return (
    <AbsoluteFill style={{ background: `radial-gradient(120% 90% at 50% 0%, ${K.bg2} 0%, ${K.bg} 60%)` }}>
      <AbsoluteFill style={{ background: `radial-gradient(40% 40% at ${30 + 8 * Math.sin(f / 140)}% ${35 + 6 * Math.cos(f / 170)}%, rgba(0,80,237,.32), transparent 70%), radial-gradient(35% 35% at ${74 + 6 * Math.cos(f / 160)}% ${68 + 5 * Math.sin(f / 130)}%, rgba(167,139,250,.18), transparent 70%)` }} />
      <AbsoluteFill style={{ opacity: 0.22, backgroundImage: "radial-gradient(rgba(160,190,255,.55) 1.2px, transparent 1.4px)", backgroundSize: "36px 36px", maskImage: "radial-gradient(80% 70% at 50% 45%, #000 30%, transparent 100%)" }} />
      <svg width={1920} height={1080} style={{ position: "absolute", inset: 0, opacity: a }}>
        {EDGES.map((e, k) => {
          const n = NODES[e.i], m = NODES[e.j]; const t = ((f + k * 23) % 150) / 150;
          return (
            <g key={k}>
              <line x1={n.x} y1={n.y} x2={m.x} y2={m.y} stroke="rgba(127,178,255,.13)" strokeWidth={1.2} />
              <circle cx={n.x + (m.x - n.x) * t} cy={n.y + (m.y - n.y) * t} r={2.4} fill={k % 3 ? K.sky : K.cyan} opacity={Math.sin(t * Math.PI) * 0.8} />
            </g>);
        })}
        {NODES.map((n, k) => <circle key={k} cx={n.x} cy={n.y} r={3.2 + 1.5 * Math.sin((f + k * 17) / 18)} fill="rgba(160,195,255,.55)" />)}
      </svg>
    </AbsoluteFill>
  );
};

/* ---------- look-alike app windows ---------- */
type AppSkin = { name: string; bg: string; side: string; ink: string; dim: string; user: string; userInk: string; input: string; border: string; font: string; ansFont: string; ph: string; mark: React.ReactNode; send: string };
const SKIN: Record<string, AppSkin> = {
  chatgpt: { name: "ChatGPT", bg: "#FFFFFF", side: "#F9F9F9", ink: "#0D0D0D", dim: "#8F8F8F", user: "#F1F1F1", userInk: "#0D0D0D", input: "#FFFFFF", border: "#E3E3E3", font: EN, ansFont: BN, ph: "Ask anything", send: "#0D0D0D",
    mark: <div style={{ width: 34, height: 34, borderRadius: 10, background: "#0D0D0D" }} /> },
  gemini: { name: "Gemini", bg: "#FFFFFF", side: "#F0F4F9", ink: "#1F1F1F", dim: "#747775", user: "#E9EEF6", userInk: "#1F1F1F", input: "#F0F4F9", border: "#E1E5EA", font: EN, ansFont: BN, ph: "Ask Gemini", send: "#0B57D0",
    mark: <div style={{ width: 34, height: 34, borderRadius: 17, background: "linear-gradient(135deg,#4285F4,#9B72CB,#D96570)" }} /> },
  claude: { name: "Claude", bg: "#FAF9F5", side: "#F0EEE6", ink: "#3D3929", dim: "#8A8676", user: "#F0EEE6", userInk: "#3D3929", input: "#FFFFFF", border: "#E6E2D6", font: EN, ansFont: BN, ph: "How can I help you today?", send: "#C96442",
    mark: <div style={{ width: 34, height: 34, borderRadius: 9, background: "#C96442" }} /> },
};
const typed = (text: string, f: number, a: number, b: number) => text.slice(0, Math.round(interpolate(f, [a, b], [0, text.length], clamp)));
const SChat: React.FC<P> = (p) => {
  const f = useCurrentFrame(); const { fps } = useVideoConfig();
  const sk = SKIN[p.s.app || "chatgpt"]; const q: string = p.s.q, ans: string = p.s.a;
  const tIn = v(p, 0.04), tTypeA = v(p, 0.1), tTypeB = v(p, p.s.typeEnd || 0.3), tSend = tTypeB + 8, tThink = tSend + 10, tAns = v(p, p.s.ansAt || 0.42), tAnsB = v(p, 0.92);
  const sent = f >= tSend;
  // cursor path: from bottom-right → input box → send button
  const cx = interpolate(f, [0, tIn + 10, tTypeB, tSend - 2], [1750, 980, 980, 1470], { ...clamp, easing: ease });
  const cy = interpolate(f, [0, tIn + 10, tTypeB, tSend - 2], [1000, 860, 860, 862], { ...clamp, easing: ease });
  const click = f >= tSend - 3 && f < tSend + 4;
  const words = ans.split(/(\s+)/); const shown = Math.round(interpolate(f, [tAns, tAnsB], [0, words.length], clamp));
  const showQ = typed(q, f, tTypeA, tTypeB);
  const appear = interpolate(f, [0, 16], [0, 1], { ...clamp, easing: ease });
  return (
    <AbsoluteFill>
      <div style={{ position: "absolute", left: 170, top: 120, width: 1580, height: 790, borderRadius: 22, overflow: "hidden", background: sk.bg, boxShadow: "0 40px 120px rgba(0,0,0,.6), 0 0 0 1px rgba(255,255,255,.08)", opacity: appear, transform: `translateY(${(1 - appear) * 40}px) scale(${0.97 + 0.03 * appear})` }}>
        {/* browser bar */}
        <div style={{ height: 50, background: "#E9EBEF", display: "flex", alignItems: "center", gap: 10, padding: "0 20px" }}>
          {["#FF5F57", "#FEBC2E", "#28C840"].map((c) => <div key={c} style={{ width: 14, height: 14, borderRadius: 7, background: c }} />)}
          <div style={{ marginLeft: 20, flex: 1, maxWidth: 560, height: 30, borderRadius: 15, background: "#fff", fontFamily: EN, fontSize: 17, color: "#666", display: "flex", alignItems: "center", padding: "0 16px", fontWeight: 500 }}>{p.s.url || "chatgpt.com"}</div>
        </div>
        <div style={{ display: "flex", height: 740 }}>
          <div style={{ width: 250, background: sk.side, borderRight: `1px solid ${sk.border}`, padding: 22 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 28 }}>{sk.mark}<span style={{ fontFamily: sk.font, fontSize: 24, fontWeight: 700, color: sk.ink }}>{sk.name}</span></div>
            {[0.9, 0.7, 0.8, 0.55, 0.75].map((w, i) => <div key={i} style={{ height: 14, width: `${w * 100}%`, borderRadius: 7, background: sk.border, margin: "16px 0" }} />)}
          </div>
          <div style={{ flex: 1, position: "relative", padding: "40px 90px" }}>
            {!sent && <div style={{ position: "absolute", top: 230, left: 0, right: 0, textAlign: "center", fontFamily: sk.font, fontSize: 38, color: sk.ink, fontWeight: 500 }}>{p.s.hello || "What can I help with?"}</div>}
            {sent && (
              <>
                <div style={{ display: "flex", justifyContent: "flex-end" }}><div style={{ maxWidth: 760, background: sk.user, color: sk.userInk, borderRadius: 24, padding: "16px 26px", fontFamily: BN, fontSize: 32, lineHeight: 1.45 }}>{q}</div></div>
                <div style={{ marginTop: 34, display: "flex", gap: 18 }}>
                  <div style={{ flex: "none", transform: `scale(${f < tAns ? 0.85 + 0.15 * Math.sin(f / 4) : 1})` }}>{sk.mark}</div>
                  {f < tAns && f >= tThink
                    ? <div style={{ fontFamily: BN, fontSize: 28, color: sk.dim, paddingTop: 2 }}>{p.s.thinking || "ভাবছে"}{".".repeat(1 + (Math.floor(f / 8) % 3))}</div>
                    : <div style={{ fontFamily: sk.ansFont, fontSize: 32, color: sk.ink, lineHeight: 1.6, maxWidth: 1050, whiteSpace: "pre-wrap" }}>{words.slice(0, shown).join("")}{shown < words.length && f >= tAns && <span style={{ display: "inline-block", width: 14, height: 14, borderRadius: 7, background: sk.ink, marginLeft: 6 }} />}</div>}
                </div>
              </>
            )}
            {/* input box */}
            <div style={{ position: "absolute", left: 90, right: 90, bottom: 40, height: 84, borderRadius: 42, background: sk.input, border: `1.5px solid ${sk.border}`, boxShadow: "0 6px 24px rgba(0,0,0,.06)", display: "flex", alignItems: "center", padding: "0 18px 0 34px" }}>
              <div style={{ flex: 1, fontFamily: showQ && !sent ? BN : sk.font, fontSize: 30, color: showQ && !sent ? sk.ink : sk.dim, fontWeight: 500 }}>
                {sent ? sk.ph : showQ || sk.ph}{!sent && f >= tTypeA && Math.floor(f / 15) % 2 === 0 && <span style={{ color: sk.ink }}>|</span>}
              </div>
              <div style={{ width: 54, height: 54, borderRadius: 27, background: showQ && !sent ? sk.send : sk.border, display: "grid", placeItems: "center", transform: `scale(${click ? 0.88 : 1})` }}>
                <svg width="24" height="24" viewBox="0 0 24 24"><path d="M12 19V5M5 12l7-7 7 7" stroke="#fff" strokeWidth="2.6" fill="none" strokeLinecap="round" strokeLinejoin="round" /></svg>
              </div>
            </div>
          </div>
        </div>
        {/* mouse pointer */}
        <svg width="46" height="46" viewBox="0 0 24 24" style={{ position: "absolute", left: cx - 170, top: cy - 120, filter: "drop-shadow(0 3px 6px rgba(0,0,0,.35))" }}>
          <path d="M4 2l15 9-6.5 1.5L9.5 19z" fill="#111" stroke="#fff" strokeWidth="1.4" strokeLinejoin="round" />
        </svg>
        {click && <div style={{ position: "absolute", left: cx - 170 - 20, top: cy - 120 - 20, width: 40, height: 40, borderRadius: 20, border: `3px solid ${K.royal}`, opacity: 1 - (f - tSend + 3) / 7, transform: `scale(${1 + (f - tSend + 3) / 4})` }} />}
      </div>
      {p.s.caption && <Fade at={v(p, 0.5)} style={{ position: "absolute", left: 0, right: 0, top: 50, textAlign: "center" }}><span style={{ fontFamily: BN, fontSize: 34, color: K.ink, fontWeight: 600, background: "rgba(0,80,237,.85)", padding: "8px 26px", borderRadius: 30 }}>{p.s.caption}</span></Fade>}
      <div style={{ position: "absolute", left: 170, right: 170, top: 922, textAlign: "center", fontFamily: BN, fontSize: 19, color: K.dim }}>{sk.name} তার নিজ কোম্পানির ট্রেডমার্ক। স্ক্রিনটি বোঝানোর জন্য আঁকা — আসল অ্যাপ দেখতে কিছুটা আলাদা হতে পারে।</div>
    </AbsoluteFill>
  );
};

/* ---------- phone keyboard suggestion (autocomplete analogy) ---------- */
const SPhone: React.FC<P> = (p) => {
  const f = useCurrentFrame(); const { fps } = useVideoConfig();
  const text: string = p.s.text, sug: string[] = p.s.sug || [];
  const tType = v(p, 0.05), tSug = v(p, 0.28), tTap = v(p, 0.45);
  const shown = typed(text, f, tType, tSug - 4) + (f >= tTap + 4 ? " " + sug[0] : "");
  const items: string[] = p.s.items || [];
  return (
    <Box style={{ flexDirection: "row", gap: 90, alignItems: "center" }}>
      <Pop at={2} style={{ flex: "none" }}>
        <div style={{ width: 430, height: 800, borderRadius: 60, background: "#0B0F1A", border: "10px solid #1E2537", boxShadow: "0 40px 100px rgba(0,0,0,.6)", overflow: "hidden", position: "relative" }}>
          <div style={{ position: "absolute", top: 18, left: 160, width: 100, height: 26, borderRadius: 13, background: "#000" }} />
          <div style={{ position: "absolute", top: 90, left: 24, right: 24, padding: "18px 22px", borderRadius: 22, background: "#1C2333", fontFamily: BN, fontSize: 30, color: "#fff", minHeight: 70, lineHeight: 1.4 }}>{shown}<span style={{ opacity: Math.floor(f / 15) % 2 ? 0 : 1 }}>|</span></div>
          <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: 330, background: "#151B29" }}>
            <div style={{ display: "flex", height: 70, borderBottom: "1px solid #252D40" }}>
              {sug.map((x, i) => {
                const on = f >= tSug + i * 4; const tap = i === 0 && f >= tTap && f < tTap + 8;
                return <div key={i} style={{ flex: 1, display: "grid", placeItems: "center", fontFamily: BN, fontSize: 30, color: i === 0 ? K.cyan : "#C9D2E6", fontWeight: i === 0 ? 700 : 500, opacity: on ? 1 : 0, background: tap ? "rgba(79,227,214,.18)" : "transparent", borderRight: i < sug.length - 1 ? "1px solid #252D40" : "none" }}>{x}</div>;
              })}
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(10,1fr)", gap: 8, padding: 14 }}>
              {Array.from({ length: 30 }, (_, i) => <div key={i} style={{ height: 52, borderRadius: 8, background: "#252D40" }} />)}
            </div>
          </div>
        </div>
      </Pop>
      <div style={{ flex: 1 }}>
        <Head t={p.s.head} kicker={p.s.kicker} />
        {items.map((x, i) => (
          <Fade key={i} at={v(p, 0.5 + (0.42 * i) / Math.max(1, items.length))} style={{ display: "flex", gap: 20, alignItems: "flex-start", margin: "16px 0" }}>
            <div style={{ flex: "none", width: 46, height: 46, borderRadius: 14, background: "rgba(61,123,255,.18)", border: `1.5px solid ${K.blue}`, display: "grid", placeItems: "center", fontFamily: BN, fontSize: 26, color: K.sky, fontWeight: 700 }}>{bn(i + 1)}</div>
            <div style={{ fontFamily: BN, fontSize: 38, color: K.ink, lineHeight: 1.45 }}><Rich t={x} /></div>
          </Fade>
        ))}
      </div>
    </Box>
  );
};

/* ---------- tokens: real tokenizer output as chips ---------- */
const CHIP = ["#3D7BFF", "#4FE3D6", "#A78BFA", "#FF8FC7", "#FFD166", "#5BE49B", "#7FB2FF", "#FF9F6B"];
const STokens: React.FC<P> = (p) => {
  const f = useCurrentFrame(); const { fps } = useVideoConfig();
  const rows: { label: string; text: string; toks: [string, number][] }[] = p.s.rows || [];
  return (
    <Box>
      <Head t={p.s.head} kicker={p.s.kicker} />
      {rows.map((r, ri) => {
        const t0 = v(p, (p.s.rowAt || [0.08, 0.45])[ri] ?? 0.1 + ri * 0.35);
        return (
          <div key={ri} style={{ marginBottom: 40 }}>
            <Fade at={t0} style={{ display: "flex", alignItems: "baseline", gap: 22, marginBottom: 16 }}>
              <span style={{ fontFamily: BN, fontSize: 26, color: K.dim }}>{r.label}</span>
              <span style={{ fontFamily: BN, fontSize: 40, color: K.ink, fontWeight: 600 }}>“{r.text}”</span>
            </Fade>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 14, alignItems: "flex-end" }}>
              {r.toks.map(([t, id], i) => {
                const at = t0 + 14 + i * 7; const k = pop(f, fps, at); const c = CHIP[i % CHIP.length];
                return (
                  <div key={i} style={{ opacity: Math.min(1, k * 1.5), transform: `translateY(${(1 - k) * 30}px)`, display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
                    <div style={{ fontFamily: BN, fontSize: 44, fontWeight: 600, color: K.ink, padding: "10px 20px", borderRadius: 14, background: `${c}2E`, border: `2px solid ${c}`, whiteSpace: "pre" }}>{t.replace(/^ /, "␣")}</div>
                    <div style={{ fontFamily: EN, fontSize: 20, color: c, fontWeight: 700 }}>{id}</div>
                  </div>);
              })}
              <Pop at={t0 + 18 + r.toks.length * 7} style={{ marginLeft: 26, alignSelf: "center" }}>
                <div style={{ fontFamily: BN, fontSize: 34, color: K.bg, background: K.gold, fontWeight: 700, padding: "8px 22px", borderRadius: 30 }}>{bn(r.toks.length)} টোকেন</div>
              </Pop>
            </div>
          </div>);
      })}
      {p.s.note && <Fade at={v(p, 0.8)} style={{ marginTop: "auto" }}><div style={{ fontFamily: BN, fontSize: 30, color: K.dim, lineHeight: 1.5 }}><Rich t={p.s.note} /></div></Fade>}
    </Box>
  );
};

/* ---------- next-word prediction with probability bars ---------- */
const SPredict: React.FC<P> = (p) => {
  const f = useCurrentFrame(); const { fps } = useVideoConfig();
  const c: [string, number][] = p.s.cands || []; const max = Math.max(...c.map((x) => x[1]));
  const tBars = v(p, p.s.barsAt || 0.22), tPick = v(p, p.s.pickAt || 0.62);
  const picked = f >= tPick + 10; const fly = interpolate(f, [tPick, tPick + 18], [0, 1], { ...clamp, easing: ease });
  return (
    <Box>
      <Head t={p.s.head} kicker={p.s.kicker} />
      <Card style={{ padding: "34px 44px", display: "flex", alignItems: "center", gap: 20, marginBottom: 46 }}>
        <span style={{ fontFamily: BN, fontSize: 54, color: K.ink, fontWeight: 600 }}>{p.s.prompt}</span>
        <span style={{ fontFamily: BN, fontSize: 54, fontWeight: 700, padding: "0 18px", borderRadius: 14, border: `3px dashed ${picked ? "transparent" : K.cyan}`, color: K.cyan, background: picked ? "rgba(79,227,214,.15)" : "transparent", transform: `scale(${picked ? 0.9 + 0.1 * pop(f, fps, tPick + 10) : 1})` }}>{picked ? c[0][0] : "?"}</span>
      </Card>
      <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
        {c.map(([w, pc], i) => {
          const at = tBars + i * 8; const g = interpolate(f, [at, at + 26], [0, pc / max], { ...clamp, easing: ease });
          const win = i === 0;
          return (
            <Fade key={i} at={at} style={{ display: "flex", alignItems: "center", gap: 26, opacity: picked && !win ? 0.45 : 1 }}>
              <div style={{ width: 210, textAlign: "right", fontFamily: BN, fontSize: 44, fontWeight: 700, color: win ? K.cyan : K.ink, transform: win && fly > 0 && !picked ? `translateY(${-160 * fly}px)` : undefined, opacity: win && fly > 0 && !picked ? 1 - fly * 0.5 : 1 }}>{w}</div>
              <div style={{ flex: 1, height: 52, borderRadius: 14, background: "rgba(255,255,255,.06)", overflow: "hidden" }}>
                <div style={{ width: `${Math.max(0.6, g * 100)}%`, height: "100%", borderRadius: 14, background: win ? `linear-gradient(90deg, ${K.royal}, ${K.cyan})` : `linear-gradient(90deg, #3a4670, ${K.violet})`, boxShadow: win ? `0 0 30px ${K.cyan}66` : "none" }} />
              </div>
              <div style={{ width: 150, fontFamily: BN, fontSize: 42, fontWeight: 700, color: win ? K.cyan : K.dim }}>{bn((pc * Math.min(1, g / (pc / max) || 0)).toFixed(pc < 1 ? 1 : 0))}%</div>
            </Fade>);
        })}
      </div>
      {p.s.note && <Fade at={v(p, 0.75)} style={{ marginTop: "auto" }}><div style={{ fontFamily: BN, fontSize: 24, color: K.dim }}>{p.s.note}</div></Fade>}
    </Box>
  );
};

/* ---------- pipeline: what happens after Send ---------- */
const ICON: Record<string, string> = {
  type: "M4 6h16M4 12h10M4 18h7", chips: "M3 7h6v6H3zM11 7h6v6h-6zM7 15h6v6H7z", num: "M7 4L5 20M15 4l-2 16M3 9h17M2 15h17", brain: "M9 4a3 3 0 00-3 3 3 3 0 00-2 5 3 3 0 002 5 3 3 0 003 3h1V4zM15 4a3 3 0 013 3 3 3 0 012 5 3 3 0 01-2 5 3 3 0 01-3 3h-1V4z",
  word: "M5 12h14M13 6l6 6-6 6", chat: "M4 5h16v11H8l-4 4z", book: "M4 4h7a3 3 0 013 3v13a2 2 0 00-2-2H4zM20 4h-5a3 3 0 00-1 .2", gpu: "M4 7h16v10H4zM8 7V4M12 7V4M16 7V4M8 20v-3M12 20v-3M16 20v-3", bolt: "M13 2L4 14h7l-1 8 9-12h-7z", shield: "M12 3l8 3v6c0 5-4 8-8 9-4-1-8-4-8-9V6z",
};
const Ico: React.FC<{ n: string; c?: string; s?: number }> = ({ n, c = K.ink, s = 56 }) => (
  <svg width={s} height={s} viewBox="0 0 24 24"><path d={ICON[n] || ICON.chat} stroke={c} strokeWidth={1.8} fill="none" strokeLinecap="round" strokeLinejoin="round" /></svg>
);
const SPipeline: React.FC<P> = (p) => {
  const f = useCurrentFrame(); const { fps } = useVideoConfig();
  const st: { t: string; d: string; i: string }[] = p.s.steps || []; const n = st.length;
  const at = (i: number) => v(p, 0.06 + (0.7 * i) / n);
  const W = 1660, gap = W / n;
  const tLoop = v(p, 0.8);
  // packet position
  const prog = interpolate(f, st.map((_, i) => at(i)), st.map((_, i) => i), clamp);
  return (
    <Box>
      <Head t={p.s.head} kicker={p.s.kicker} />
      <div style={{ position: "relative", height: 420, marginTop: 30 }}>
        <div style={{ position: "absolute", left: gap / 2, width: W - gap, top: 70, height: 4, background: K.line, borderRadius: 2 }} />
        <div style={{ position: "absolute", left: gap / 2, width: (W - gap) * (prog / Math.max(1, n - 1)), top: 70, height: 4, background: GRAD, borderRadius: 2, boxShadow: `0 0 18px ${K.cyan}` }} />
        <div style={{ position: "absolute", left: gap / 2 + gap * prog - 13, top: 59, width: 26, height: 26, borderRadius: 13, background: K.cyan, boxShadow: `0 0 30px ${K.cyan}, 0 0 60px ${K.blue}`, opacity: f >= at(0) ? 1 : 0 }} />
        {st.map((x, i) => {
          const on = f >= at(i); const k = pop(f, fps, at(i));
          return (
            <div key={i} style={{ position: "absolute", left: gap * i, width: gap, top: 0, display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center", opacity: 0.35 + 0.65 * Math.min(1, k) }}>
              <div style={{ width: 140, height: 140, borderRadius: 34, background: on ? "rgba(0,80,237,.35)" : "rgba(255,255,255,.04)", border: `2px solid ${on ? K.sky : K.line}`, display: "grid", placeItems: "center", boxShadow: on ? `0 0 40px ${K.blue}66` : "none", transform: `scale(${0.9 + 0.1 * Math.min(1, k)})` }}><Ico n={x.i} c={on ? K.ink : K.dim} s={64} /></div>
              <div style={{ fontFamily: BN, fontSize: 34, fontWeight: 700, color: on ? K.ink : K.dim, marginTop: 22 }}>{x.t}</div>
              <div style={{ fontFamily: BN, fontSize: 25, color: K.dim, marginTop: 8, lineHeight: 1.4, padding: "0 10px" }}>{x.d}</div>
            </div>);
        })}
        {p.s.loop && (
          <Fade at={tLoop} style={{ position: "absolute", left: gap * (n - 3), width: gap * 3, top: 345 }}>
            <svg width={gap} height="70" viewBox="0 0 400 70" preserveAspectRatio="none" style={{ display: "block", marginLeft: gap * 1.5 }}><path d="M395 5 C395 60, 5 60, 5 5" stroke={K.gold} strokeWidth="3" fill="none" strokeDasharray="10 8" strokeDashoffset={-f * 1.5} /><path d="M0 14 L5 2 L12 14" stroke={K.gold} strokeWidth="3" fill="none" /></svg>
            <div style={{ textAlign: "center", fontFamily: BN, fontSize: 32, color: K.gold, fontWeight: 700, marginLeft: gap }}>{p.s.loop}</div>
          </Fade>
        )}
      </div>
    </Box>
  );
};

/* ---------- training vs answering ---------- */
const STrain: React.FC<P> = (p) => {
  const f = useCurrentFrame();
  const L = p.s.left, R = p.s.right; const tR = v(p, p.s.rightAt || 0.5);
  const dials = Array.from({ length: 48 }, (_, i) => i);
  const panel = (side: any, at: number, active: boolean, kind: "train" | "use") => (
    <Fade at={at} style={{ flex: 1 }}>
      <Card style={{ padding: "34px 40px", height: 640, opacity: active ? 1 : 0.55 }} glow={kind === "train" ? K.violet : K.cyan}>
        <div style={{ display: "flex", alignItems: "center", gap: 18, marginBottom: 20 }}>
          <Ico n={kind === "train" ? "book" : "bolt"} c={kind === "train" ? K.violet : K.cyan} s={54} />
          <div style={{ fontFamily: BN, fontSize: 44, fontWeight: 700, color: K.ink }}>{side.head}</div>
        </div>
        {kind === "train" ? (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(12, 1fr)", gap: 10, margin: "8px 0 26px" }}>
            {dials.map((i) => { const r = (f - at) * (2 + (i % 5)) * (f < tR ? 1 : 0.0) + i * 37; const rr = f < tR ? r : (tR - at) * (2 + (i % 5)) + i * 37; return (
              <div key={i} style={{ aspectRatio: "1", borderRadius: "50%", border: `2px solid ${K.violet}88`, position: "relative" }}><div style={{ position: "absolute", left: "50%", top: "12%", width: 3, height: "38%", background: K.violet, transformOrigin: "50% 100%", transform: `translateX(-50%) rotate(${rr}deg)` }} /></div>); })}
          </div>
        ) : (
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap", margin: "8px 0 26px", minHeight: 150 }}>
            {(R.demo || []).map((w: string, i: number) => <Pop key={i} at={tR + 16 + i * 6}><div style={{ fontFamily: BN, fontSize: 32, color: K.ink, padding: "8px 16px", borderRadius: 12, background: `${K.cyan}26`, border: `1.5px solid ${K.cyan}` }}>{w}</div></Pop>)}
          </div>
        )}
        {(side.items || []).map((x: string, i: number) => (
          <Fade key={i} at={at + 20 + i * 10} style={{ fontFamily: BN, fontSize: 31, color: K.ink, lineHeight: 1.45, margin: "10px 0", display: "flex", gap: 14 }}><span style={{ color: kind === "train" ? K.violet : K.cyan }}>●</span><Rich t={x} /></Fade>
        ))}
      </Card>
    </Fade>
  );
  return (
    <Box>
      <Head t={p.s.head} kicker={p.s.kicker} />
      <div style={{ display: "flex", gap: 44 }}>{panel(L, v(p, 0.04), f < tR + 10, "train")}{panel(R, tR, f >= tR, "use")}</div>
    </Box>
  );
};

/* ---------- myth vs fact ---------- */
const SMyth: React.FC<P> = (p) => {
  const f = useCurrentFrame(); const { fps } = useVideoConfig();
  const tX = v(p, 0.28), tF = v(p, 0.36);
  const cross = interpolate(f, [tX, tX + 10], [0, 1], clamp);
  return (
    <Box style={{ justifyContent: "center", gap: 40 }}>
      <Fade at={4}>
        <Card style={{ padding: "34px 46px", position: "relative", borderColor: `${K.red}66` }} glow={K.red}>
          <div style={{ fontFamily: BN, fontSize: 28, color: K.red, fontWeight: 700, marginBottom: 8 }}>ভুল ধারণা</div>
          <div style={{ fontFamily: BN, fontSize: 48, color: K.ink, lineHeight: 1.35, opacity: 1 - cross * 0.45 }}>{p.s.myth}</div>
          <div style={{ position: "absolute", left: 40, right: 40, top: "70%", height: 6, borderRadius: 3, background: K.red, transformOrigin: "left", transform: `scaleX(${cross}) rotate(-2deg)` }} />
          <div style={{ position: "absolute", right: 36, top: 26, width: 70, height: 70, borderRadius: 35, background: K.red, display: "grid", placeItems: "center", fontSize: 44, color: "#fff", fontFamily: EN, fontWeight: 700, transform: `scale(${pop(f, fps, tX + 6)})` }}>✕</div>
        </Card>
      </Fade>
      <Fade at={tF}>
        <Card style={{ padding: "34px 46px", position: "relative", borderColor: `${K.green}66` }} glow={K.green}>
          <div style={{ fontFamily: BN, fontSize: 28, color: K.green, fontWeight: 700, marginBottom: 8 }}>আসল কথা</div>
          <div style={{ fontFamily: BN, fontSize: 44, color: K.ink, lineHeight: 1.45 }}><Rich t={p.s.fact} /></div>
          <div style={{ position: "absolute", right: 36, top: 26, width: 70, height: 70, borderRadius: 35, background: K.green, display: "grid", placeItems: "center", fontSize: 44, color: K.bg, fontFamily: EN, fontWeight: 700, transform: `scale(${pop(f, fps, tF + 8)})` }}>✓</div>
        </Card>
      </Fade>
    </Box>
  );
};

/* ---------- good vs bad prompt ---------- */
const SCompare: React.FC<P> = (p) => {
  const f = useCurrentFrame(); const { fps } = useVideoConfig();
  const tGood = v(p, p.s.goodAt || 0.3);
  const tags: [string, string][] = p.s.tags || [];
  return (
    <Box>
      <Head t={p.s.head} kicker={p.s.kicker} />
      <div style={{ display: "flex", gap: 40, flex: 1 }}>
        <Fade at={v(p, 0.04)} style={{ flex: 0.8 }}>
          <Card style={{ padding: "30px 36px", height: "100%", borderColor: `${K.red}55` }} glow={K.red}>
            <div style={{ fontFamily: BN, fontSize: 30, color: K.red, fontWeight: 700, marginBottom: 18 }}>✕ {p.s.badLabel || "দুর্বল প্রম্পট"}</div>
            <div style={{ fontFamily: BN, fontSize: 40, color: K.ink, lineHeight: 1.5, padding: "18px 24px", borderRadius: 18, background: "rgba(255,255,255,.05)" }}>{p.s.bad}</div>
            {p.s.badOut && <Fade at={v(p, 0.16)} style={{ fontFamily: BN, fontSize: 28, color: K.dim, marginTop: 22, lineHeight: 1.5 }}>ফল: {p.s.badOut}</Fade>}
          </Card>
        </Fade>
        <Fade at={tGood} style={{ flex: 1.2 }}>
          <Card style={{ padding: "30px 36px", height: "100%", borderColor: `${K.green}55` }} glow={K.green}>
            <div style={{ fontFamily: BN, fontSize: 30, color: K.green, fontWeight: 700, marginBottom: 18 }}>✓ {p.s.goodLabel || "ভালো প্রম্পট"}</div>
            <div style={{ fontFamily: BN, fontSize: 34, color: K.ink, lineHeight: 1.6, padding: "18px 24px", borderRadius: 18, background: "rgba(255,255,255,.05)" }}><Rich t={p.s.good} /></div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 12, marginTop: 22 }}>
              {tags.map(([c, t], i) => <Pop key={i} at={tGood + 30 + i * 9}><span style={{ fontFamily: BN, fontSize: 26, fontWeight: 700, color: K.bg, background: COL[c] || K.sky, padding: "6px 18px", borderRadius: 20 }}>{t}</span></Pop>)}
            </div>
          </Card>
        </Fade>
      </div>
    </Box>
  );
};

/* ---------- generic: points, quiz, recap, title, outro ---------- */
const SPoints: React.FC<P> = (p) => {
  const it: string[] = p.s.items || [];
  return (
    <Box>
      <Head t={p.s.head} kicker={p.s.kicker} />
      {it.map((x, i) => (
        <Fade key={i} at={v(p, 0.08 + (0.8 * i) / it.length)} style={{ display: "flex", gap: 22, alignItems: "flex-start", margin: "14px 0" }}>
          <div style={{ flex: "none", width: 54, height: 54, borderRadius: 16, background: `${CHIP[i % CHIP.length]}26`, border: `2px solid ${CHIP[i % CHIP.length]}`, display: "grid", placeItems: "center", fontFamily: BN, fontSize: 30, color: K.ink, fontWeight: 700 }}>{bn(i + 1)}</div>
          <div style={{ fontFamily: BN, fontSize: 42, color: K.ink, lineHeight: 1.45 }}><Rich t={x} /></div>
        </Fade>
      ))}
    </Box>
  );
};
const SQuiz: React.FC<P & { answer?: boolean }> = (p) => {
  const f = useCurrentFrame(); const { fps } = useVideoConfig();
  const o: string[] = p.s.o || [], ans = p.answer, a = p.s.a;
  const total = p.vo + (p.s.hold || 0), left = Math.max(0, Math.ceil((LEAD + total - f) / fps));
  const ring = !ans && p.s.hold ? interpolate(f, [LEAD + p.vo, LEAD + total], [1, 0], clamp) : 0;
  return (
    <Box>
      <div style={{ display: "flex", alignItems: "center", gap: 24, marginBottom: 20 }}>
        <div style={{ fontFamily: BN, fontSize: 32, fontWeight: 700, color: K.bg, background: ans ? K.green : K.gold, padding: "6px 22px", borderRadius: 24 }}>{ans ? "উত্তর" : "কুইজ — আপনি বলুন তো?"}</div>
        {!ans && p.s.hold ? (
          <div style={{ marginLeft: "auto", position: "relative", width: 110, height: 110 }}>
            <svg width="110" height="110" viewBox="0 0 110 110"><circle cx="55" cy="55" r="48" stroke={K.faint} strokeWidth="8" fill="none" /><circle cx="55" cy="55" r="48" stroke={K.gold} strokeWidth="8" fill="none" strokeDasharray={301.6} strokeDashoffset={301.6 * (1 - ring)} transform="rotate(-90 55 55)" strokeLinecap="round" /></svg>
            <div style={{ position: "absolute", inset: 0, display: "grid", placeItems: "center", fontFamily: BN, fontSize: 46, fontWeight: 700, color: K.gold }}>{bn(left)}</div>
          </div>) : null}
      </div>
      <Fade at={4} style={{ fontFamily: BN, fontSize: 50, fontWeight: 600, color: K.ink, lineHeight: 1.35, marginBottom: 36 }}>{p.s.q}</Fade>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 22 }}>
        {o.map((x, i) => {
          const ok = ans && i === a, dim = ans && i !== a;
          return (
            <Fade key={i} at={12 + i * 6}>
              <div style={{ display: "flex", alignItems: "center", gap: 22, padding: "22px 26px", borderRadius: 20, background: ok ? "rgba(91,228,155,.14)" : K.card, border: `2px solid ${ok ? K.green : K.line}`, opacity: dim ? 0.4 : 1, transform: ok ? `scale(${0.96 + 0.04 * Math.min(1, pop(f, fps, 10))})` : undefined }}>
                <span style={{ width: 58, height: 58, borderRadius: 18, background: ok ? K.green : "rgba(255,255,255,.08)", color: ok ? K.bg : K.ink, display: "grid", placeItems: "center", fontFamily: BN, fontSize: 32, fontWeight: 700, flex: "none" }}>{"কখগঘ"[i]}</span>
                <span style={{ fontFamily: BN, fontSize: 38, color: K.ink, lineHeight: 1.35 }}>{x}</span>
              </div>
            </Fade>);
        })}
      </div>
      {ans && p.s.ex && <Fade at={v(p, 0.3)} style={{ marginTop: 34 }}><div style={{ fontFamily: BN, fontSize: 34, color: K.dim, lineHeight: 1.5 }}><span style={{ color: K.cyan, fontWeight: 700 }}>কারণ: </span>{p.s.ex}</div></Fade>}
    </Box>
  );
};
const SRecap: React.FC<P> = (p) => {
  const it: string[] = p.s.items || [];
  return (
    <Box>
      <Head t={p.s.head || "আজ যা শিখলাম"} kicker="সারসংক্ষেপ" />
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>
        {it.map((x, i) => (
          <Pop key={i} at={v(p, 0.06 + (0.75 * i) / it.length)}>
            <Card style={{ padding: "26px 30px", display: "flex", gap: 20, alignItems: "flex-start", minHeight: 150 }}>
              <div style={{ flex: "none", width: 50, height: 50, borderRadius: 25, background: K.green, color: K.bg, display: "grid", placeItems: "center", fontFamily: EN, fontSize: 28, fontWeight: 700 }}>✓</div>
              <div style={{ fontFamily: BN, fontSize: 34, color: K.ink, lineHeight: 1.45 }}><Rich t={x} /></div>
            </Card>
          </Pop>
        ))}
      </div>
    </Box>
  );
};
const STitle: React.FC<P> = (p) => {
  const f = useCurrentFrame();
  const sh = interpolate(f, [10, 70], [-30, 130], clamp);
  return (
    <Box style={{ alignItems: "center", justifyContent: "center", textAlign: "center" }}>
      <Fade at={4}><div style={{ fontFamily: BN, fontSize: 32, color: K.cyan, fontWeight: 600, padding: "8px 26px", borderRadius: 30, border: `1.5px solid ${K.cyan}66`, background: "rgba(79,227,214,.08)" }}>{p.s.kicker || `${p.spec.course} · ${p.spec.lessonNo}`}</div></Fade>
      <Fade at={12} y={30}><div style={{ fontFamily: BN, fontSize: 108, fontWeight: 800, lineHeight: 1.18, margin: "30px 0 18px", backgroundImage: `linear-gradient(100deg, ${K.ink} 0%, ${K.ink} ${sh - 20}%, ${K.cyan} ${sh}%, ${K.ink} ${sh + 20}%, ${K.ink} 100%)`, WebkitBackgroundClip: "text", color: "transparent", maxWidth: 1500 }}>{p.s.title || p.spec.title}</div></Fade>
      {p.s.sub && <Fade at={v(p, 0.35)}><div style={{ fontFamily: BN, fontSize: 40, color: K.dim, maxWidth: 1300, lineHeight: 1.45 }}><Rich t={p.s.sub} /></div></Fade>}
    </Box>
  );
};
const SOutro: React.FC<P> = (p) => (
  <Box style={{ alignItems: "center", justifyContent: "center", textAlign: "center" }}>
    <Pop at={4}><Img src={staticFile("ai4e/_brand/aiu-logo-dark.svg")} style={{ height: 90 }} /></Pop>
    <Fade at={16}><div style={{ fontFamily: BN, fontSize: 66, fontWeight: 800, color: K.ink, margin: "40px 0 20px" }}>{p.s.head || "পরের পাঠে দেখা হবে!"}</div></Fade>
    {p.spec.next && <Fade at={26}><div style={{ fontFamily: BN, fontSize: 44, color: K.dim }}>পরের পাঠ: <span style={{ color: K.cyan, fontWeight: 700 }}>{p.spec.next}</span></div></Fade>}
    <Fade at={40}><div style={{ fontFamily: BN, fontSize: 36, color: K.dim, marginTop: 40 }}>ফ্রি কোর্স · প্র্যাকটিস · সার্টিফিকেট — <span style={{ color: K.ink, fontWeight: 700 }}>aiuniversitybd.com</span></div></Fade>
  </Box>
);

const MAP: Record<string, React.FC<any>> = { title: STitle, chat: SChat, phone: SPhone, tokens: STokens, predict: SPredict, pipeline: SPipeline, train: STrain, myth: SMyth, compare: SCompare, points: SPoints, quizQ: SQuiz, quizA: (p: P) => <SQuiz {...p} answer />, recap: SRecap, outro: SOutro };

/* ---------- chrome, subtitles, audio ---------- */
const Chrome: React.FC<{ spec: Spec; starts: number[]; total: number }> = ({ spec, starts, total }) => {
  const f = useCurrentFrame();
  return (
    <>
      <div style={{ position: "absolute", left: 0, top: 0, height: 5, width: `${(f / total) * 100}%`, background: GRAD }} />
      <div style={{ position: "absolute", left: 64, top: 40, display: "flex", alignItems: "center", gap: 18 }}>
        <Img src={staticFile("ai4e/_brand/aiu-logo-dark.svg")} style={{ height: 38 }} />
        <div style={{ width: 2, height: 30, background: K.faint }} />
        <div style={{ fontFamily: BN, fontSize: 27, color: K.ink, fontWeight: 700 }}>{spec.course}</div>
        <div style={{ fontFamily: BN, fontSize: 25, color: K.dim }}>· {spec.lessonNo}</div>
      </div>
      <div style={{ position: "absolute", right: 64, top: 50, fontFamily: BN, fontSize: 21, color: K.dim }}>এআই শিক্ষক · এআই কণ্ঠ</div>
    </>
  );
};
const subChunks = (spec: Spec, starts: number[]) => spec.scenes.flatMap((s, i) => {
  const parts = s.vo.split(/(?<=[।?!,—])\s+/).reduce<string[]>((a, x) => { if (a.length && (a[a.length - 1].length < 26 || x.length < 10)) a[a.length - 1] += " " + x; else a.push(x); return a; }, []);
  const total = parts.reduce((n, x) => n + x.length, 0); let acc = 0; const b = starts[i] + LEAD;
  return parts.map((x) => { const from = b + (s.frames * acc) / total; acc += x.length; return { s: x, from, to: b + (s.frames * acc) / total }; });
});
const SceneFade: React.FC<{ len: number; children: React.ReactNode }> = ({ len, children }) => {
  const f = useCurrentFrame();
  const o = Math.min(interpolate(f, [0, 12], [0, 1], clamp), interpolate(f, [len - 12, len], [1, 0], clamp));
  return <AbsoluteFill style={{ opacity: o, transform: `scale(${0.985 + 0.015 * o})` }}>{children}</AbsoluteFill>;
};

export const AiVideo: React.FC<{ spec: Spec }> = ({ spec }) => {
  const f = useCurrentFrame();
  const lens = spec.scenes.map(sceneLen);
  const starts = lens.reduce<number[]>((a, _, i) => [...a, i ? a[i - 1] + lens[i - 1] : 15], []);
  const chunks = subChunks(spec, starts);
  const cur = chunks.find((x) => f >= x.from && f < x.to + 4);
  const total = aiLen(spec);
  const busy = (fr: number) => spec.scenes.some((s, i) => fr >= starts[i] + LEAD - 6 && fr <= starts[i] + LEAD + s.frames + 4);
  const si = starts.filter((s) => f >= s).length - 1; const st = spec.scenes[Math.max(0, si)]?.type;
  return (
    <AbsoluteFill style={{ background: K.bg }}>
      <Background strong={st === "title" || st === "outro" ? 1 : 0} />
      {spec.scenes.map((s, i) => {
        const S = MAP[s.type]; const len = lens[i];
        return (
          <Sequence key={i} from={starts[i]} durationInFrames={len}>
            <SceneFade len={len}><S s={s} spec={spec} vo={s.frames} /></SceneFade>
            <Sequence from={LEAD}><Audio src={staticFile(`ai4e/${spec.id}/vo/${String(i + 1).padStart(2, "0")}.mp3`)} /></Sequence>
            <Sequence from={0}><Audio src={staticFile(`aiu2/${i === 0 ? "swell" : s.type === "quizA" || s.type === "outro" ? "chime" : "whoosh"}.mp3`)} volume={0.2} /></Sequence>
          </Sequence>
        );
      })}
      <Chrome spec={spec} starts={starts} total={total} />
      {cur && <div style={{ position: "absolute", left: 0, right: 0, bottom: 56, display: "flex", justifyContent: "center", opacity: interpolate(f, [cur.from, cur.from + 5, cur.to, cur.to + 4], [0, 1, 1, 0], clamp) }}><div style={{ maxWidth: 1500, padding: "8px 26px 12px", borderRadius: 14, background: "rgba(3,8,24,.82)", border: `1px solid ${K.faint}`, fontFamily: BN, fontSize: 34, fontWeight: 500, color: "#fff", textAlign: "center", lineHeight: 1.35 }}>{cur.s.replace(/[।,]$/, "")}</div></div>}
      <Audio src={staticFile("aiu2/music.mp3")} volume={(fr) => (busy(fr) ? 0.04 : 0.12) * interpolate(fr, [0, 30, total - 60, total], [0, 1, 1, 0], clamp)} />
    </AbsoluteFill>
  );
};
