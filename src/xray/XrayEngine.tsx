// AI University — "চলো প্রোগ্রামিং শিখি — কোড না লিখে (সুপার সিক্রেট কোর্স)" lesson engine (2026-11-16).
// Look: a clean, light "tech classroom" (paper-white board, soft dot grid, navy ink, brand blue) for concepts, and a dark
// blueprint "X-RAY" mode when the camera dives inside an app: phone/laptop mockups drawn in code, server/database/cloud nodes,
// request/response packets flying along the links, a live database table that gains rows, a server whose functions light up,
// push banners landing on another phone, and a dark code panel (HTTP/JSON/SQL, syntax-coloured) with Bangla notes.
// Scenes: troll · title · points · xray · code · cards · status · table · layers · phones · map · fare · scale · prompt · recap · outro
// Timing: every scene's animation is keyed to its own VO length; xray steps / code marks start at a "cue" (a phrase inside the
// scene's VO) — fraction = character position of the cue, same rule the subtitles use, so picture follows the voice.
import React from "react";
import { AbsoluteFill, Audio, Img, Sequence, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig, Easing, delayRender, continueRender } from "remotion";
import {
  Smartphone, Server, Database, Cloud, Laptop, Mail, Send, ShieldCheck, ShieldAlert, KeyRound, Lock, Unlock, Bug, Globe, Zap, Layers,
  CheckCircle2, XCircle, AlertTriangle, Sparkles, Copy, Bot, MapPin, Car, CreditCard, Bell, Users, Gauge, Route, Network, Boxes,
  ThumbsUp, MessageCircle, Share2, Code2, Cpu, Archive, Timer, Wallet, Settings, BarChart3, Search,
} from "lucide-react";

/* ---------------- theme ---------------- */
const C = {
  paper: "#F5F7FC", paper2: "#EAF0FB", dot: "#D5DEEE",
  ink: "#0E1A33", ink2: "#2B3A5A", mute: "#5B6782", faint: "#8C97AE",
  card: "#FFFFFF", line: "#E1E7F2",
  brand: "#0050ED", brand2: "#3B7BFF", navy: "#011835",
  green: "#12A150", orange: "#E8890C", red: "#E5484D", violet: "#7C4DFF", teal: "#0EA5A4", pink: "#D6336C", amber: "#F5B400",
  // x-ray blueprint
  xb0: "#020B1F", xb1: "#06173A", xgrid: "#0D2A5C", xline: "#2A5AA8", cyan: "#5CE1FF", xink: "#E8F1FF", xmute: "#8FA8D6",
  // code
  code: "#0D1426", codeHead: "#151E35", codeLine: "#25304D", cInk: "#DCE6FF", cMute: "#7E8BAA",
  cKey: "#C49BFF", cStr: "#7EE2A8", cNum: "#FFB86B", cBool: "#6CB6FF", cCmt: "#6B7899",
};
const METHOD: Record<string, string> = { GET: C.green, POST: C.brand2, PUT: C.orange, PATCH: C.violet, DELETE: C.red };
const MONO = "'DejaVu Sans Mono', 'Cascadia Mono', Consolas, ui-monospace, monospace, Anek";
const BN = "Anek", UI = "Manrope, 'Segoe UI', Arial, sans-serif";
if (typeof document !== "undefined") {
  for (const [fam, file] of [["Anek", "fonts/AnekBangla.ttf"], ["Manrope", "fonts/Manrope-700.ttf"]] as const) {
    const h = delayRender("font " + fam);
    const f = new FontFace(fam, `url(${staticFile(file)})`, { weight: "100 900" });
    f.load().then(() => { document.fonts.add(f); continueRender(h); }).catch(() => continueRender(h));
  }
}
const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const ease = Easing.bezier(0.16, 1, 0.3, 1);
const bn = (n: number | string) => String(n).replace(/\d/g, (d) => "০১২৩৪৫৬৭৮৯"[+d]);
const pop = (f: number, fps: number, d: number) => spring({ frame: f - d, fps, config: { damping: 14, mass: 0.7 } });
const fadeIn = (f: number, at: number, d = 10) => interpolate(f, [at, at + d], [0, 1], clamp);
const ICO: Record<string, React.FC<any>> = {
  phone: Smartphone, server: Server, db: Database, cloud: Cloud, laptop: Laptop, mail: Mail, send: Send, shield: ShieldCheck, alert: ShieldAlert,
  key: KeyRound, lock: Lock, unlock: Unlock, bug: Bug, globe: Globe, zap: Zap, layers: Layers, check: CheckCircle2, x: XCircle, warn: AlertTriangle,
  spark: Sparkles, bot: Bot, pin: MapPin, car: Car, card: CreditCard, bell: Bell, users: Users, gauge: Gauge, route: Route, net: Network, box: Boxes,
  code: Code2, cpu: Cpu, archive: Archive, timer: Timer, wallet: Wallet, gear: Settings, chart: BarChart3, search: Search,
};

export type Scene = { type: string; vo: string; frames: number; hold?: number; [k: string]: any };
export type Spec = { id: string; course: string; lessonNo: string; module?: string; title: string; next: string; scenes: Scene[] };
const LEAD = 12, TAIL = 16;
const sceneLen = (s: Scene) => LEAD + s.frames + (s.hold || 0) + TAIL;
export const xrayLen = (spec: Spec) => spec.scenes.reduce((n, s) => n + sceneLen(s), 0) + 30;
type P = { s: Scene; spec: Spec; vo: number };
const v = (p: P, x: number) => LEAD + p.vo * x;
// frame where a phrase of the scene's VO starts (character-proportional, like the subtitles)
const cueAt = (p: P, cue: string | undefined, fallback: number) => {
  if (!cue) return v(p, fallback);
  const i = p.s.vo.indexOf(cue);
  return i < 0 ? v(p, fallback) : v(p, i / Math.max(1, p.s.vo.length));
};

/* ---------------- light classroom background ---------------- */
const Board: React.FC = () => (
  <AbsoluteFill style={{ background: `radial-gradient(1500px 900px at 85% -10%, #E3ECFF 0%, ${C.paper} 50%, #EEF2F9 100%)` }}>
    <AbsoluteFill style={{ backgroundImage: `radial-gradient(${C.dot} 1.6px, transparent 1.7px)`, backgroundSize: "34px 34px", opacity: 0.75, maskImage: "radial-gradient(1400px 800px at 60% 30%, #000 40%, transparent 95%)" }} />
  </AbsoluteFill>
);
const Card: React.FC<{ children: React.ReactNode; style?: React.CSSProperties; accent?: string }> = ({ children, style, accent }) => (
  <div style={{ position: "absolute", left: 110, right: 110, top: 80, bottom: 150, background: C.card, borderRadius: 28, border: `1px solid ${C.line}`, boxShadow: `0 30px 80px rgba(14,26,51,.10), 0 2px 0 rgba(255,255,255,.8) inset`, padding: "48px 64px", display: "flex", flexDirection: "column", overflow: "hidden", ...style }}>
    {accent && <div style={{ position: "absolute", left: 0, top: 0, right: 0, height: 6, background: `linear-gradient(90deg, ${accent}, ${accent}55)` }} />}
    {children}
  </div>
);
const Eyebrow: React.FC<{ t: string; c?: string; icon?: string }> = ({ t, c = C.brand, icon }) => {
  const I = icon ? ICO[icon] : Code2;
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
      <span style={{ display: "inline-flex", alignItems: "center", gap: 9, padding: "6px 16px 6px 12px", borderRadius: 999, background: `${c}14`, border: `1px solid ${c}40`, color: c, fontFamily: BN, fontSize: 25, fontWeight: 600 }}><I size={22} color={c} strokeWidth={2.1} />{t}</span>
    </div>
  );
};
const Head: React.FC<{ t: string; size?: number; style?: React.CSSProperties }> = ({ t, size = 54, style }) => (
  <div style={{ fontFamily: BN, fontSize: size, fontWeight: 700, color: C.ink, lineHeight: 1.22, marginBottom: 22, ...style }}>{t}</div>
);
const Note: React.FC<{ t: string; o: number; style?: React.CSSProperties }> = ({ t, o, style }) => (
  <div style={{ position: "absolute", background: C.amber, color: "#2A1E00", borderRadius: 14, padding: "14px 20px", fontFamily: BN, fontSize: 27, fontWeight: 600, lineHeight: 1.4, boxShadow: "0 10px 30px rgba(0,0,0,.18)", opacity: o, transform: `rotate(-1.2deg) translateY(${(1 - o) * 14}px)`, ...style }}>💡 {t}</div>
);

/* ---------------- code highlighting (HTTP / JSON / SQL / JS) ---------------- */
const RULES: [RegExp, string][] = [
  [/\/\/.*$|--\s.*$/g, C.cCmt],
  [/^(GET|POST|PUT|PATCH|DELETE)\b/g, "M"],
  [/\bHTTP\/1\.1\b/g, C.cMute],
  [/\b([1-5]\d\d)(?= [A-Z])/g, "S"],
  [/"[^"]*"(?=\s*:)/g, C.cKey],
  [/"[^"]*"|'[^']*'/g, C.cStr],
  [/^[A-Za-z-]+(?=:\s)/g, C.cKey],
  [/\b(true|false|null|undefined)\b/g, C.cBool],
  [/\b(INSERT|INTO|VALUES|SELECT|FROM|WHERE|UPDATE|SET|AND|const|await|return|if|function|async)\b/g, C.cBool],
  [/(?<![\w-])-?\d+(\.\d+)?\b/g, C.cNum],
];
const statusCol = (code: string) => code[0] === "2" ? C.green : code[0] === "4" ? C.orange : code[0] === "5" ? C.red : C.brand2;
const hl = (s: string) => {
  const spans: { a: number; b: number; c: string }[] = [];
  for (const [re, col] of RULES) { re.lastIndex = 0; let m; while ((m = re.exec(s))) { if (!m[0].length) { re.lastIndex++; continue; } spans.push({ a: m.index, b: m.index + m[0].length, c: col === "M" ? (METHOD[m[0]] || C.cBool) : col === "S" ? statusCol(m[0]) : col }); } }
  spans.sort((x, y) => x.a - y.a || y.b - x.b);
  const out: React.ReactNode[] = []; let i = 0, k = 0;
  for (const sp of spans) { if (sp.a < i) continue; if (sp.a > i) out.push(<span key={k++}>{s.slice(i, sp.a)}</span>); out.push(<span key={k++} style={{ color: sp.c, fontWeight: sp.c === C.cCmt ? 400 : 600 }}>{s.slice(sp.a, sp.b)}</span>); i = sp.b; }
  if (i < s.length) out.push(<span key={k++}>{s.slice(i)}</span>);
  return out;
};
const CodeWin: React.FC<{ title?: string; lines: string[]; size?: number; style?: React.CSSProperties; shown?: number; hiLine?: number; marks?: { line: number; find?: string; c: string; o: number }[] }> = ({ title, lines, size = 27, style, shown, hiLine, marks = [] }) => (
  <div style={{ background: C.code, borderRadius: 18, border: `1px solid ${C.codeLine}`, boxShadow: "0 30px 70px rgba(2,8,24,.35)", overflow: "hidden", display: "flex", flexDirection: "column", ...style }}>
    <div style={{ height: 46, background: C.codeHead, display: "flex", alignItems: "center", gap: 9, padding: "0 16px", flex: "none" }}>
      <span style={{ width: 12, height: 12, borderRadius: "50%", background: "#FF5F57" }} /><span style={{ width: 12, height: 12, borderRadius: "50%", background: "#FEBC2E" }} /><span style={{ width: 12, height: 12, borderRadius: "50%", background: "#28C840" }} />
      <span style={{ marginLeft: 12, fontFamily: MONO, fontSize: 19, color: C.cMute }}>{title}</span>
    </div>
    <div style={{ padding: "16px 0", fontFamily: MONO, fontSize: size, lineHeight: 1.55, color: C.cInk }}>
      {lines.map((l, i) => {
        if (shown !== undefined && i >= shown) return <div key={i} style={{ height: size * 1.55 }} />;
        const mk = marks.filter((m) => m.line === i);
        return (
          <div key={i} style={{ position: "relative", display: "flex", padding: "0 22px 0 0", background: hiLine === i ? "rgba(92,225,255,.08)" : undefined }}>
            <span style={{ width: 54, flex: "none", textAlign: "right", paddingRight: 16, color: "#45506E", fontSize: size * 0.72, lineHeight: `${size * 1.55}px` }}>{i + 1}</span>
            <span style={{ whiteSpace: "pre", position: "relative" }}>
              {hl(l)}
              {mk.map((m, j) => {
                if (!m.find) return <span key={j} style={{ position: "absolute", left: -8, right: -10, top: 1, bottom: 1, border: `2.5px solid ${m.c}`, borderRadius: 8, opacity: m.o, boxShadow: `0 0 18px ${m.c}66` }} />;
                const a = l.indexOf(m.find); if (a < 0) return null;
                return <span key={j} style={{ position: "absolute", left: `calc(${a}ch - 5px)`, width: `calc(${m.find.length}ch + 10px)`, top: 1, bottom: 1, border: `2.5px solid ${m.c}`, borderRadius: 8, opacity: m.o, boxShadow: `0 0 18px ${m.c}66` }} />;
              })}
            </span>
          </div>);
      })}
    </div>
  </div>
);

/* ---------------- phone / laptop mockups (own drawings — no real logos) ---------------- */
const MiniMap: React.FC<{ w: number; h: number; f: number; route?: boolean; cars?: number; car?: number; dark?: boolean }> = ({ w, h, f, route, cars = 0, car, dark }) => {
  const bg = dark ? "#0B2147" : "#E8EEF4", road = dark ? "#1D3C70" : "#FFFFFF", blk = dark ? "#0F2A55" : "#DCE5EE", park = dark ? "#123F3A" : "#CDEBD5";
  return (
    <svg width={w} height={h} viewBox="0 0 300 300" preserveAspectRatio="xMidYMid slice" style={{ display: "block" }}>
      <rect width="300" height="300" fill={bg} />
      {[[20, 20, 70, 60], [110, 20, 80, 60], [210, 20, 80, 60], [20, 105, 70, 80], [210, 105, 80, 80], [20, 210, 70, 80], [110, 210, 80, 80], [210, 210, 80, 80]].map(([x, y, a, b], i) => <rect key={i} x={x} y={y} width={a} height={b} rx="6" fill={blk} />)}
      <rect x="110" y="105" width="80" height="80" rx="8" fill={park} />
      <path d="M0 92 H300 M0 197 H300 M100 0 V300 M200 0 V300" stroke={road} strokeWidth="14" />
      <path d="M0 92 H300 M0 197 H300 M100 0 V300 M200 0 V300" stroke={dark ? "#2A5AA8" : "#E3E8EE"} strokeWidth="1.5" strokeDasharray="6 6" />
      {route && <path d="M60 250 L100 250 L100 92 L240 92 L240 60" fill="none" stroke={C.brand} strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" strokeDasharray="420" strokeDashoffset={interpolate(f % 400, [0, 60], [420, 0], clamp)} />}
      {Array.from({ length: cars }).map((_, i) => { const t = (f / 90 + i * 0.37) % 1; const pts = [[100, 30 + t * 240], [30 + t * 240, 197], [200, 270 - t * 240], [270 - t * 240, 92]][i % 4]; return <g key={i} transform={`translate(${pts[0]},${pts[1]})`}><rect x="-7" y="-5" width="14" height="10" rx="3" fill={dark ? C.cyan : C.ink} /></g>; })}
      {car !== undefined && (() => { const t = car; const P: [number, number][] = [[60, 250], [100, 250], [100, 92], [240, 92], [240, 60]]; const seg = Math.min(3, Math.floor(t * 4)); const q = t * 4 - seg; const [x1, y1] = P[seg], [x2, y2] = P[seg + 1]; return <g transform={`translate(${x1 + (x2 - x1) * q},${y1 + (y2 - y1) * q})`}><circle r="13" fill={C.brand} opacity=".2" /><rect x="-8" y="-6" width="16" height="12" rx="3" fill={C.ink} /></g>; })()}
      {route && <g transform="translate(240,52)"><path d="M0 0 C-10 -12 -10 -24 0 -28 C10 -24 10 -12 0 0Z" fill={C.red} /><circle cy="-18" r="4" fill="#fff" /></g>}
    </svg>
  );
};
const Btn: React.FC<{ t: string; c?: string; pressed?: number }> = ({ t, c = C.brand, pressed = 0 }) => (
  <div style={{ background: c, color: "#fff", borderRadius: 14, padding: "13px 0", textAlign: "center", fontFamily: BN, fontSize: 21, fontWeight: 700, transform: `scale(${1 - pressed * 0.06})`, boxShadow: `0 8px 18px ${c}55` }}>{t}</div>
);
const AppBar: React.FC<{ t: string; c?: string }> = ({ t, c = C.ink }) => (
  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "4px 2px 10px" }}>
    <span style={{ fontFamily: BN, fontSize: 21, fontWeight: 800, color: c }}>{t}</span>
    <span style={{ width: 26, height: 26, borderRadius: "50%", background: "#E5EAF3" }} />
  </div>
);
// one screen of a phone, by kind; f = local frame, k = progress helpers
const Screen: React.FC<{ kind: string; f: number; press?: number; push?: { title: string; body: string; o: number } | null; data?: any }> = ({ kind, f, press = 0, push, data = {} }) => {
  const box: React.CSSProperties = { position: "absolute", inset: 0, background: "#F6F8FC", padding: "40px 16px 16px", display: "flex", flexDirection: "column", gap: 10, fontFamily: BN };
  const pill = (t: string, c = C.mute) => <span style={{ fontSize: 15, color: c, background: "#EDF1F8", borderRadius: 999, padding: "3px 10px" }}>{t}</span>;
  let body: React.ReactNode = null;
  if (kind === "food") body = (
    <div style={box}>
      <AppBar t={data.app || "খাবারবাড়ি"} c={C.pink} />
      <div style={{ height: 120, borderRadius: 14, background: "linear-gradient(135deg,#FFB36B,#E5484D)", display: "grid", placeItems: "center", fontSize: 52 }}>🍛</div>
      <div style={{ fontSize: 22, fontWeight: 700, color: C.ink }}>কাচ্চি বিরিয়ানি</div>
      <div style={{ display: "flex", gap: 6 }}>{pill("৩৫ মিনিট")}{pill("ফুল প্লেট")}</div>
      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 19, color: C.ink2, marginTop: 4 }}><span>১ × ৳৩২০</span><b>৳৩২০</b></div>
      <div style={{ flex: 1 }} />
      <Btn t="অর্ডার করুন" c={C.pink} pressed={press} />
    </div>);
  else if (kind === "foodDone") body = (
    <div style={{ ...box, alignItems: "center", justifyContent: "center", textAlign: "center" }}>
      <CheckCircle2 size={84} color={C.green} />
      <div style={{ fontSize: 26, fontWeight: 800, color: C.ink }}>অর্ডার নিশ্চিত!</div>
      <div style={{ fontFamily: MONO, fontSize: 19, color: C.mute }}>#1029</div>
      <div style={{ fontSize: 18, color: C.mute }}>রাইডার খোঁজা হচ্ছে…</div>
    </div>);
  else if (kind === "rider") body = (
    <div style={box}>
      <AppBar t="রাইডার অ্যাপ" c={C.green} />
      <div style={{ fontSize: 17, color: C.mute }}>আজকের ডেলিভারি</div>
      {["#1021 · গুলশান", "#1024 · বনানী"].map((t, i) => <div key={i} style={{ background: "#fff", borderRadius: 12, padding: "12px 12px", fontSize: 18, color: C.ink2, border: `1px solid ${C.line}` }}>{t} <span style={{ float: "right", color: C.green }}>✓</span></div>)}
      <div style={{ flex: 1, borderRadius: 12, overflow: "hidden" }}><MiniMap w={200} h={160} f={f} cars={2} /></div>
    </div>);
  else if (kind === "ride" || kind === "rideSearch") body = (
    <div style={{ ...box, padding: 0 }}>
      <div style={{ position: "absolute", inset: 0 }}><MiniMap w={300} h={600} f={f} cars={4} /></div>
      {kind === "rideSearch" && <div style={{ position: "absolute", left: "50%", top: "38%", transform: "translate(-50%,-50%)" }}>{[0, 1, 2].map((i) => { const t = ((f + i * 20) % 60) / 60; return <div key={i} style={{ position: "absolute", left: -90 * t, top: -90 * t, width: 180 * t, height: 180 * t, borderRadius: "50%", border: `3px solid ${C.brand}`, opacity: 1 - t }} />; })}<MapPin size={40} color={C.brand} style={{ transform: "translate(-20px,-36px)" }} /></div>}
      <div style={{ position: "absolute", left: 12, right: 12, top: 40, background: "#fff", borderRadius: 14, padding: "12px 14px", boxShadow: "0 6px 20px rgba(0,0,0,.12)", fontSize: 19, color: C.ink, display: "flex", gap: 8, alignItems: "center" }}><Search size={18} color={C.mute} />{kind === "ride" ? "কোথায় যাবেন?" : "ধানমন্ডি ২৭"}</div>
      <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, background: "#fff", borderRadius: "18px 18px 0 0", padding: "14px 14px 16px", display: "flex", flexDirection: "column", gap: 8, boxShadow: "0 -6px 20px rgba(0,0,0,.1)" }}>
        {kind === "ride" ? <>
          {[["🏍️", "বাইক", "৳১২০"], ["🚗", "কার", "৳২৯০"], ["🛺", "সিএনজি", "৳১৮০"]].map(([e, n, pr], i) => <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 19, color: C.ink, padding: "6px 8px", borderRadius: 10, background: i === 1 ? "#EAF1FF" : undefined, border: i === 1 ? `1.5px solid ${C.brand}` : "1.5px solid transparent" }}><span style={{ fontSize: 24 }}>{e}</span>{n}<b style={{ marginLeft: "auto" }}>{pr}</b></div>)}
          <Btn t="রাইড চাই" c={C.ink} pressed={press} />
        </> : <div style={{ textAlign: "center", fontSize: 21, fontWeight: 700, color: C.ink, padding: "14px 0" }}>কাছের ড্রাইভার খোঁজা হচ্ছে…</div>}
      </div>
    </div>);
  else if (kind === "rideFound" || kind === "trip") body = (
    <div style={{ ...box, padding: 0 }}>
      <div style={{ position: "absolute", inset: 0 }}><MiniMap w={300} h={600} f={f} route car={kind === "trip" ? (f % 240) / 240 : 0.02} /></div>
      <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, background: "#fff", borderRadius: "18px 18px 0 0", padding: "14px", display: "flex", flexDirection: "column", gap: 8, boxShadow: "0 -6px 20px rgba(0,0,0,.1)" }}>
        <div style={{ fontSize: 19, color: C.green, fontWeight: 700 }}>{kind === "trip" ? "যাত্রা চলছে · ১২ মিনিট বাকি" : "ড্রাইভার আসছে · ৩ মিনিট"}</div>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}><span style={{ width: 42, height: 42, borderRadius: "50%", background: "#DDE6F5", display: "grid", placeItems: "center", fontSize: 22 }}>👤</span><div><div style={{ fontSize: 20, fontWeight: 700, color: C.ink }}>রহিম · ★ ৪.৯</div><div style={{ fontSize: 15, color: C.mute }}>সাদা কার · ঢাকা মেট্রো-গ ১২</div></div></div>
      </div>
    </div>);
  else if (kind === "driver" || kind === "driverIdle") body = (
    <div style={{ ...box, padding: 0, background: "#0F1B33" }}>
      <div style={{ position: "absolute", inset: 0, opacity: 0.55 }}><MiniMap w={300} h={600} f={f} dark /></div>
      <div style={{ position: "absolute", left: 12, right: 12, top: 40, fontSize: 18, color: "#fff", fontWeight: 700 }}>ড্রাইভার অ্যাপ · অনলাইন ●</div>
      {kind === "driverIdle" ? <div style={{ position: "absolute", left: 12, right: 12, bottom: 14, background: "rgba(255,255,255,.12)", borderRadius: 16, padding: 14, color: "#fff", fontSize: 18, textAlign: "center" }}>অনুরোধের অপেক্ষা…</div> :
      <div style={{ position: "absolute", left: 12, right: 12, bottom: 14, background: "#fff", borderRadius: 16, padding: 14, display: "flex", flexDirection: "column", gap: 8 }}>
        <div style={{ fontSize: 17, color: C.mute }}>নতুন রাইডের অনুরোধ</div>
        <div style={{ fontSize: 22, fontWeight: 800, color: C.ink }}>১.২ কিমি দূরে · ৳২৯০</div>
        <div style={{ height: 8, borderRadius: 4, background: "#E6EBF3", overflow: "hidden" }}><div style={{ width: `${100 - ((f % 450) / 450) * 100}%`, height: "100%", background: C.green }} /></div>
        <Btn t="গ্রহণ করুন" c={C.green} pressed={press} />
      </div>}
    </div>);
  else if (kind === "paid") body = (
    <div style={{ ...box, alignItems: "stretch" }}>
      <AppBar t="রসিদ" />
      <div style={{ textAlign: "center" }}><CheckCircle2 size={64} color={C.green} /></div>
      {[["বেস ভাড়া", "৳৫০"], ["৮ কিমি", "৳১৬০"], ["২০ মিনিট", "৳৪০"], ["মোট", "৳২৫০"]].map(([a, b], i) => <div key={i} style={{ display: "flex", justifyContent: "space-between", fontSize: 19, color: i === 3 ? C.ink : C.ink2, fontWeight: i === 3 ? 800 : 400, borderTop: i === 3 ? `1px dashed ${C.line}` : undefined, paddingTop: i === 3 ? 8 : 0 }}><span>{a}</span><span>{b}</span></div>)}
      <div style={{ flex: 1 }} />
      <div style={{ fontSize: 16, color: C.mute, textAlign: "center" }}>রেটিং দিন ★★★★★</div>
    </div>);
  return (
    <>
      {body}
      {push && <div style={{ position: "absolute", left: 8, right: 8, top: 34 + (1 - push.o) * -40, opacity: push.o, background: "rgba(255,255,255,.97)", borderRadius: 14, padding: "10px 12px", boxShadow: "0 10px 30px rgba(0,0,0,.25)", display: "flex", gap: 10, alignItems: "flex-start", zIndex: 5 }}>
        <span style={{ width: 30, height: 30, borderRadius: 8, background: C.brand, display: "grid", placeItems: "center", flex: "none" }}><Bell size={17} color="#fff" /></span>
        <span style={{ fontFamily: BN }}><b style={{ fontSize: 17, color: C.ink, display: "block" }}>{push.title}</b><span style={{ fontSize: 15, color: C.mute }}>{push.body}</span></span>
      </div>}
    </>
  );
};
const Phone: React.FC<{ w?: number; kind: string; f: number; press?: number; push?: any; data?: any; glow?: string; tap?: number }> = ({ w = 260, kind, f, press, push, data, glow, tap = 0 }) => {
  const h = w * 2.05, sc = w / 260;
  return (
    <div style={{ width: w, height: h, borderRadius: 38 * sc, background: "#0B0F18", padding: 9 * sc, boxShadow: `0 30px 60px rgba(2,8,24,.35)${glow ? `, 0 0 0 3px ${glow}, 0 0 50px ${glow}88` : ""}`, position: "relative", flex: "none" }}>
      <div style={{ position: "absolute", left: 9 * sc, top: 9 * sc, width: 260 - 18, height: 2.05 * 260 - 18, borderRadius: 30, overflow: "hidden", background: "#fff", transform: `scale(${sc})`, transformOrigin: "0 0" }}>
        <Screen kind={kind} f={f} press={press} push={push} data={data} />
        <div style={{ position: "absolute", left: "50%", top: 10, width: 84, height: 22, borderRadius: 12, background: "#0B0F18", transform: "translateX(-50%)" }} />
        {tap > 0 && <div style={{ position: "absolute", left: "50%", bottom: 42, width: 60 + tap * 70, height: 60 + tap * 70, transform: "translate(-50%,50%)", borderRadius: "50%", background: "rgba(0,80,237,.25)", opacity: 1 - tap * 0.9 }} />}
      </div>
    </div>
  );
};
const LaptopMock: React.FC<{ w?: number; f: number; glow?: string }> = ({ w = 520, f, glow }) => {
  const sc = w / 520;
  return (
    <div style={{ width: w, flex: "none" }}>
      <div style={{ width: w, height: w * 0.62, borderRadius: 18 * sc, background: "#0B0F18", padding: 12 * sc, boxShadow: `0 30px 60px rgba(2,8,24,.3)${glow ? `, 0 0 0 3px ${glow}, 0 0 50px ${glow}88` : ""}` }}>
        <div style={{ width: 496, height: 298, transform: `scale(${sc})`, transformOrigin: "0 0", background: "#F4F6FB", borderRadius: 8, overflow: "hidden", display: "flex", fontFamily: BN }}>
          <div style={{ width: 92, background: C.navy, padding: "12px 8px", display: "flex", flexDirection: "column", gap: 9 }}>{["ড্যাশবোর্ড", "ট্রিপ", "ড্রাইভার", "অভিযোগ", "রিফান্ড"].map((t, i) => <span key={i} style={{ fontSize: 12, color: i === 0 ? "#fff" : "#8FA8D6", background: i === 0 ? "#0050ED" : undefined, borderRadius: 6, padding: "4px 6px" }}>{t}</span>)}</div>
          <div style={{ flex: 1, padding: 12, display: "flex", flexDirection: "column", gap: 8 }}>
            <div style={{ fontSize: 15, fontWeight: 800, color: C.ink }}>অ্যাডমিন প্যানেল</div>
            <div style={{ display: "flex", gap: 6 }}>{[["চলমান ট্রিপ", "১,২৪০"], ["অনলাইন ড্রাইভার", "৩,৮০২"], ["নতুন অভিযোগ", "১৭"]].map(([a, b], i) => <div key={i} style={{ flex: 1, background: "#fff", borderRadius: 8, padding: "6px 8px", border: `1px solid ${C.line}` }}><div style={{ fontSize: 10, color: C.mute }}>{a}</div><div style={{ fontSize: 16, fontWeight: 800, color: [C.brand, C.green, C.red][i] }}>{b}</div></div>)}</div>
            <div style={{ flex: 1, display: "flex", gap: 6 }}>
              <div style={{ flex: 1.3, borderRadius: 8, overflow: "hidden" }}><MiniMap w={220} h={170} f={f} cars={6} /></div>
              <div style={{ flex: 1, background: "#fff", borderRadius: 8, border: `1px solid ${C.line}`, padding: 6, display: "flex", alignItems: "flex-end", gap: 4 }}>{[40, 62, 50, 78, 66, 90, 72].map((hh, i) => <div key={i} style={{ flex: 1, height: `${hh}%`, background: i === 5 ? C.brand : "#BFD2FA", borderRadius: 3 }} />)}</div>
            </div>
          </div>
        </div>
      </div>
      <div style={{ width: w * 1.12, marginLeft: -w * 0.06, height: 16 * sc, background: "linear-gradient(#C9D1DE,#9AA6BA)", borderRadius: `0 0 ${14 * sc}px ${14 * sc}px` }} />
    </div>
  );
};

/* ---------------- troll (hook: a social post with comments) ---------------- */
const STroll: React.FC<P> = (p) => {
  const f = useCurrentFrame(); const { fps } = useVideoConfig(); const cm: any[] = p.s.comments || [];
  const stampAt = cueAt(p, p.s.stampCue, 0.85);
  return (
    <AbsoluteFill style={{ display: "flex", alignItems: "center", justifyContent: "center", paddingBottom: 90 }}>
      <div style={{ width: 1080, zoom: 1.25, background: "#fff", borderRadius: 24, border: `1px solid ${C.line}`, boxShadow: "0 30px 80px rgba(14,26,51,.14)", padding: "30px 36px", fontFamily: BN, transform: `translateY(${(1 - pop(f, fps, 2)) * 40}px)` }}>
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <span style={{ width: 58, height: 58, borderRadius: "50%", background: "linear-gradient(135deg,#7C4DFF,#0050ED)", display: "grid", placeItems: "center", color: "#fff", fontSize: 28 }}>😎</span>
          <div><div style={{ fontSize: 26, fontWeight: 700, color: C.ink }}>{p.s.author || "নতুন ডেভেলপার"}</div><div style={{ fontSize: 19, color: C.faint }}>ভাইব কোডিং গ্রুপ · এইমাত্র</div></div>
        </div>
        <div style={{ fontSize: 34, color: C.ink, margin: "18px 0 14px", lineHeight: 1.35 }}>{p.s.post}</div>
        <div style={{ display: "flex", gap: 30, color: C.mute, fontSize: 21, borderTop: `1px solid ${C.line}`, borderBottom: `1px solid ${C.line}`, padding: "10px 0" }}><span><ThumbsUp size={20} style={{ verticalAlign: -3 }} /> ২৪</span><span><MessageCircle size={20} style={{ verticalAlign: -3 }} /> {bn(cm.length + 37)} কমেন্ট</span><span><Share2 size={20} style={{ verticalAlign: -3 }} /> শেয়ার</span></div>
        <div style={{ display: "flex", flexDirection: "column", gap: 12, marginTop: 16 }}>
          {cm.map((c, i) => { const at = cueAt(p, c.cue, 0.2 + i * 0.15); return (
            <div key={i} style={{ display: "flex", gap: 12, alignItems: "flex-start", opacity: fadeIn(f, at, 8), transform: `translateX(${interpolate(f, [at, at + 8], [-20, 0], clamp)}px)` }}>
              <span style={{ width: 42, height: 42, borderRadius: "50%", background: ["#FFD8A8", "#C3FAE8", "#D0BFFF", "#FFC9C9"][i % 4], display: "grid", placeItems: "center", fontSize: 21, flex: "none" }}>{["🧑", "👩", "🧔", "👨‍💻"][i % 4]}</span>
              <div style={{ background: "#F0F2F7", borderRadius: 18, padding: "10px 16px" }}><b style={{ fontSize: 19, color: C.ink }}>{c.name}</b><div style={{ fontSize: 26, color: C.ink2 }}>{c.text} <span style={{ fontSize: 22 }}>{c.emoji}</span></div></div>
            </div>); })}
        </div>
      </div>
      {p.s.stamp && <div style={{ position: "absolute", right: 250, top: 150, transform: `rotate(-8deg) scale(${pop(f, fps, Math.round(stampAt))})`, border: `5px solid ${C.brand}`, color: C.brand, borderRadius: 16, padding: "10px 26px", fontFamily: BN, fontSize: 40, fontWeight: 800, background: "rgba(255,255,255,.92)" }}>{p.s.stamp}</div>}
    </AbsoluteFill>
  );
};

/* ---------------- title ---------------- */
const STitle: React.FC<P> = (p) => {
  const f = useCurrentFrame(); const { fps } = useVideoConfig(); const I = ICO[p.s.icon || "net"];
  return (
    <AbsoluteFill style={{ padding: "0 150px 150px", display: "flex", justifyContent: "center" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 18, opacity: fadeIn(f, 4) }}>
        <div style={{ transform: `scale(${pop(f, fps, 2)})`, width: 92, height: 92, borderRadius: 24, background: `linear-gradient(135deg, ${C.brand}, ${C.violet})`, display: "grid", placeItems: "center", boxShadow: `0 16px 40px ${C.brand}55` }}><I size={50} color="#fff" strokeWidth={1.9} /></div>
        <div style={{ fontFamily: BN, fontSize: 32, color: C.brand, fontWeight: 600 }}>{p.s.kicker || p.spec.module}</div>
      </div>
      <div style={{ fontFamily: BN, fontSize: 88, fontWeight: 800, color: C.ink, lineHeight: 1.15, margin: "26px 0 16px", maxWidth: 1500, opacity: fadeIn(f, 12, 12), transform: `translateY(${interpolate(f, [12, 26], [24, 0], clamp)}px)` }}>{p.s.title || p.spec.title}</div>
      {p.s.sub && <div style={{ fontFamily: BN, fontSize: 38, color: C.mute, opacity: fadeIn(f, 22) }}>{p.s.sub}</div>}
      {p.s.chips && <div style={{ display: "flex", gap: 14, marginTop: 40, flexWrap: "wrap" }}>{p.s.chips.map((c: string, i: number) => <span key={i} style={{ fontFamily: BN, fontSize: 28, padding: "10px 22px", borderRadius: 999, background: "#fff", border: `1.5px solid ${C.line}`, color: C.ink2, boxShadow: "0 6px 16px rgba(14,26,51,.06)", opacity: fadeIn(f, v(p, 0.35 + i * 0.08)) }}>{c}</span>)}</div>}
    </AbsoluteFill>
  );
};

/* ---------------- points ---------------- */
const SPoints: React.FC<P> = (p) => {
  const f = useCurrentFrame(); const it: any[] = p.s.items || []; const acc = p.s.accent ? (C as any)[p.s.accent] || p.s.accent : C.brand;
  const norm = it.map((x) => Array.isArray(x) ? x : [null, x, null]);
  return (
    <Card accent={acc}>
      <Eyebrow t={p.s.tag || "মূল কথা"} c={acc} icon={p.s.tagIcon} />
      <Head t={p.s.head} />
      <div style={{ display: "flex", flexDirection: "column", gap: norm.length > 4 ? 16 : 24, justifyContent: "center", flex: 1 }}>
        {norm.map(([icon, title, desc]: any, i: number) => { const at = p.s.cues ? cueAt(p, p.s.cues[i], 0.1) : v(p, 0.08 + (0.62 * i) / Math.max(1, norm.length)); const I = icon ? ICO[icon] : null;
          return (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: 24, opacity: fadeIn(f, at), transform: `translateX(${interpolate(f, [at, at + 10], [-24, 0], clamp)}px)` }}>
              <div style={{ flex: "none", width: 66, height: 66, borderRadius: 18, background: `${acc}12`, border: `1.5px solid ${acc}55`, display: "grid", placeItems: "center" }}>{I ? <I size={32} color={acc} strokeWidth={2} /> : <span style={{ fontFamily: BN, fontSize: 30, fontWeight: 700, color: acc }}>{bn(i + 1)}</span>}</div>
              <div>
                <div style={{ fontFamily: BN, fontSize: 38, fontWeight: 700, color: C.ink, lineHeight: 1.3 }}>{title}</div>
                {desc && <div style={{ fontFamily: BN, fontSize: 29, color: C.mute, lineHeight: 1.4, marginTop: 2 }}>{desc}</div>}
              </div>
            </div>); })}
      </div>
    </Card>
  );
};

/* ---------------- X-RAY (the star) ---------------- */
type XNode = { id: string; kind: string; x: number; y: number; label: string; sub?: string; screen?: string; screens?: [number, string][]; cols?: string[]; rows?: string[][]; fns?: string[]; w?: number };
type XStep = { from: string; to: string; label: string; cue?: string; c?: string; code?: { title: string; lines: string[] }; note?: string; badge?: string; addRow?: string[]; fn?: number; push?: { title: string; body: string } };
const XBg: React.FC<{ o: number }> = ({ o }) => (
  <AbsoluteFill style={{ opacity: o }}>
    <AbsoluteFill style={{ background: `radial-gradient(1300px 800px at 50% 20%, ${C.xb1} 0%, ${C.xb0} 75%)` }} />
    <AbsoluteFill style={{ backgroundImage: `linear-gradient(${C.xgrid} 1px, transparent 1px), linear-gradient(90deg, ${C.xgrid} 1px, transparent 1px)`, backgroundSize: "48px 48px", opacity: 0.55 }} />
    <AbsoluteFill style={{ backgroundImage: `linear-gradient(${C.xgrid} 1px, transparent 1px), linear-gradient(90deg, ${C.xgrid} 1px, transparent 1px)`, backgroundSize: "240px 240px", opacity: 0.9 }} />
  </AbsoluteFill>
);
const NodeBox: React.FC<{ n: XNode; f: number; active: number; xo: number; rows: string[][]; newRow: number; fn: number | undefined; push: any; screen: string; press: number; tap: number }> = ({ n, f, active, xo, rows, newRow, fn, push, screen, press, tap }) => {
  const glow = active > 0 ? C.cyan : undefined;
  const label = (
    <div style={{ marginTop: 12, textAlign: "center" }}>
      <div style={{ fontFamily: BN, fontSize: 27, fontWeight: 700, color: xo > 0.5 ? C.xink : C.ink, whiteSpace: "nowrap" }}>{n.label}</div>
      {n.sub && <div style={{ fontFamily: MONO, fontSize: 17, color: xo > 0.5 ? C.xmute : C.mute, whiteSpace: "nowrap" }}>{n.sub}</div>}
    </div>);
  const glass: React.CSSProperties = { background: "rgba(10,32,72,.85)", border: `2px solid ${active > 0 ? C.cyan : C.xline}`, borderRadius: 20, boxShadow: active > 0 ? `0 0 ${30 + 30 * active}px ${C.cyan}77` : "0 20px 40px rgba(0,0,0,.4)" };
  let body: React.ReactNode;
  if (n.kind === "phone") body = <Phone w={n.w || 200} kind={screen} f={f} press={press} push={push} glow={glow} tap={tap} />;
  else if (n.kind === "laptop") body = <LaptopMock w={n.w || 360} f={f} glow={glow} />;
  else if (n.kind === "db") body = (
    <div style={{ ...glass, width: n.w || 330, padding: "0 0 10px", borderRadius: "50% / 26px", overflow: "hidden" }}>
      <div style={{ height: 52, background: "rgba(92,225,255,.12)", borderBottom: `2px solid ${C.xline}`, borderRadius: "50%", display: "grid", placeItems: "center" }}><Database size={26} color={C.cyan} /></div>
      <div style={{ padding: "8px 16px 0", fontFamily: MONO, fontSize: 15.5, color: C.xink }}>
        {n.cols && <div style={{ display: "flex", color: C.cyan, borderBottom: `1px solid ${C.xline}`, paddingBottom: 4 }}>{n.cols.map((c, i) => <span key={i} style={{ flex: i ? 1 : 0.6 }}>{c}</span>)}</div>}
        {rows.slice(-4).map((r, i, arr) => { const isNew = newRow >= 0 && i === arr.length - 1 && rows.length > (n.rows || []).length; return <div key={i} style={{ display: "flex", padding: "3px 0", background: isNew ? `rgba(18,161,80,${0.45 * newRow})` : undefined, color: isNew ? "#B9FBD0" : C.xink, transform: isNew ? `translateX(${(1 - newRow) * 30}px)` : undefined }}>{r.map((c, j) => <span key={j} style={{ flex: j ? 1 : 0.6, overflow: "hidden", whiteSpace: "nowrap" }}>{c}</span>)}</div>; })}
      </div>
    </div>);
  else if (n.kind === "server" || n.kind === "lb") body = (
    <div style={{ ...glass, width: n.w || 300, padding: "14px 16px" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>{n.kind === "lb" ? <Network size={26} color={C.cyan} /> : <Server size={26} color={C.cyan} />}<div style={{ display: "flex", gap: 5 }}>{[0, 1, 2].map((i) => <span key={i} style={{ width: 9, height: 9, borderRadius: "50%", background: (Math.floor(f / 6) + i) % 3 === 0 ? C.green : "#1E3D6E" }} />)}</div></div>
      {(n.fns || []).map((t, i) => <div key={i} style={{ fontFamily: MONO, fontSize: 18, padding: "4px 8px", borderRadius: 7, color: fn === i ? "#06213D" : C.xmute, background: fn === i ? C.cyan : "transparent", marginTop: 2 }}>{fn === i ? "▶ " : "  "}{t}</div>)}
    </div>);
  else { const I = n.kind === "cache" ? Zap : n.kind === "queue" ? Archive : n.kind === "pay" ? CreditCard : n.kind === "map" ? MapPin : Cloud; body = (
    <div style={{ ...glass, width: n.w || 220, padding: "18px 14px", display: "flex", flexDirection: "column", alignItems: "center", gap: 6, borderRadius: n.kind === "cloud" ? 60 : 20 }}><I size={38} color={C.cyan} strokeWidth={1.8} /><span style={{ fontFamily: MONO, fontSize: 15, color: C.xmute }}>{n.kind === "cloud" ? "third-party" : n.kind}</span></div>); }
  return (
    <div style={{ position: "absolute", left: n.x, top: n.y, transform: `translate(-50%,-50%) scale(${1 + active * 0.04})`, display: "flex", flexDirection: "column", alignItems: "center" }}>
      {body}{label}
    </div>
  );
};
const SXray: React.FC<P> = (p) => {
  const f = useCurrentFrame(); const { fps } = useVideoConfig();
  const nodes: XNode[] = p.s.nodes || [], steps: XStep[] = p.s.steps || [], links: [string, string][] = p.s.links || [];
  const N = Object.fromEntries(nodes.map((n) => [n.id, n]));
  const zoomId = p.s.zoom as string | undefined;
  const pressAt = cueAt(p, p.s.pressCue, 0.06);
  const outA = pressAt + 8, outB = pressAt + 38;
  const xo = zoomId ? interpolate(f, [pressAt + 4, outB], [0, 1], clamp) : interpolate(f, [0, 12], [0, 1], clamp);
  // camera
  const z = zoomId ? N[zoomId] : null;
  const k = zoomId ? interpolate(f, [outA, outB], [0, 1], { ...clamp, easing: ease }) : 1;
  const zs = p.s.zoomScale || 1.9; const cs = z ? zs + (1 - zs) * k : 1, cx = z ? z.x + (960 - z.x) * k : 960, cy = z ? z.y + (540 - z.y) * k : 540;
  // step timing
  const sAt = steps.map((st, i) => cueAt(p, st.cue, (zoomId ? 0.2 : 0.06) + (0.78 * i) / Math.max(1, steps.length)));
  const sEnd = sAt.map((a, i) => (i + 1 < sAt.length ? sAt[i + 1] : LEAD + p.vo + (p.s.hold || 0)));
  let cur = -1; sAt.forEach((a, i) => { if (f >= a) cur = i; });
  const travel = (i: number) => Math.min(42, Math.max(16, (sEnd[i] - sAt[i]) * 0.45));
  const arrived = (i: number) => f >= sAt[i] + travel(i);
  // node states
  const rowsOf = (n: XNode) => { const r = [...(n.rows || [])]; steps.forEach((st, i) => { if (st.addRow && st.to === n.id && arrived(i)) r.push(st.addRow); }); return r; };
  const lastRowStep = (n: XNode) => { let j = -1; steps.forEach((st, i) => { if (st.addRow && st.to === n.id && arrived(i)) j = i; }); return j; };
  const screenOf = (n: XNode) => { let s = n.screen || "food"; (n.screens || []).forEach(([i, kind]) => { if (i < steps.length && arrived(i)) s = kind; }); return s; };
  const pushOf = (n: XNode) => { let pu: any = null; steps.forEach((st, i) => { if (st.push && st.to === n.id && arrived(i)) { const o = interpolate(f, [sAt[i] + travel(i), sAt[i] + travel(i) + 10], [0, 1], clamp); pu = { ...st.push, o }; } }); return pu; };
  const activeOf = (id: string) => { if (cur < 0) return 0; const st = steps[cur]; if (st.to !== id && !(st.from === id && !arrived(cur))) return 0; return st.to === id && arrived(cur) ? interpolate(f, [sAt[cur] + travel(cur), sAt[cur] + travel(cur) + 8], [0, 1], clamp) : 0.4; };
  const fnOf = (id: string) => { for (let i = cur; i >= 0; i--) { const q = steps[i]; if (q.fn === undefined) continue; if (q.from === id && q.to !== id) return q.fn; if (q.to === id && arrived(i)) return q.fn; } return undefined; };
  const st = cur >= 0 ? steps[cur] : null;
  const panel = p.s.panel as { x: number; y: number; w: number; size?: number } | undefined;
  const tapT = interpolate(f, [pressAt, pressAt + 14], [0, 1], clamp);
  return (
    <AbsoluteFill>
      <XBg o={xo} />
      <AbsoluteFill style={{ transform: `translate(${960 - cx * cs}px, ${540 - cy * cs}px) scale(${cs})`, transformOrigin: "0 0" }}>
        {/* links */}
        <svg width={1920} height={1080} style={{ position: "absolute", inset: 0, opacity: xo }}>
          {links.map(([a, b], i) => { const A = N[a], B = N[b]; if (!A || !B) return null; const on = st && ((st.from === a && st.to === b) || (st.from === b && st.to === a)); return <line key={i} x1={A.x} y1={A.y} x2={B.x} y2={B.y} stroke={on ? C.cyan : C.xline} strokeWidth={on ? 4 : 2.5} strokeDasharray="10 9" strokeDashoffset={-f * 1.2} opacity={on ? 1 : 0.7} />; })}
        </svg>
        {nodes.map((n) => <NodeBox key={n.id} n={n} f={f} active={activeOf(n.id) * xo} xo={xo} rows={rowsOf(n)} newRow={(() => { const j = lastRowStep(n); return j < 0 ? -1 : interpolate(f, [sAt[j] + travel(j), sAt[j] + travel(j) + 14], [0, 1], clamp); })()} fn={fnOf(n.id)} push={n.kind === "phone" ? pushOf(n) : null} screen={screenOf(n)} press={n.id === zoomId ? interpolate(f, [pressAt - 3, pressAt, pressAt + 6], [0, 1, 0], clamp) : 0} tap={n.id === zoomId && f >= pressAt && f < pressAt + 14 ? tapT : 0} />)}
        {/* packets */}
        {steps.map((s2, i) => {
          if (i !== cur) return null; const A = N[s2.from], B = N[s2.to]; if (!A || !B) return null;
          const t = interpolate(f, [sAt[i], sAt[i] + travel(i)], [0, 1], { ...clamp, easing: Easing.inOut(Easing.cubic) });
          const col = s2.c ? (C as any)[s2.c] || s2.c : C.cyan;
          const same = s2.from === s2.to; const x = A.x + (B.x - A.x) * t, y = A.y + (B.y - A.y) * t;
          const arrive = arrived(i);
          return (
            <React.Fragment key={i}>
              {!same && !arrive && [0.12, 0.24, 0.36].map((d, j) => { const tt = Math.max(0, t - d); return <div key={j} style={{ position: "absolute", left: A.x + (B.x - A.x) * tt, top: A.y + (B.y - A.y) * tt, width: 14 - j * 3, height: 14 - j * 3, borderRadius: "50%", background: col, opacity: 0.5 - j * 0.14, transform: "translate(-50%,-50%)" }} />; })}
              {!same && !arrive && <div style={{ position: "absolute", left: x, top: y, transform: "translate(-50%,-50%)", display: "flex", alignItems: "center", gap: 8, padding: "9px 18px", borderRadius: 999, background: col, color: "#04122E", fontFamily: MONO, fontSize: 22, fontWeight: 700, whiteSpace: "nowrap", boxShadow: `0 0 30px ${col}` }}><Mail size={20} />{s2.label}</div>}
              {arrive && (s2.badge || same) && <div style={{ position: "absolute", left: B.x, top: B.y - (B.kind === "phone" ? (B.w || 200) * 1.025 + 40 : 120), transform: `translate(-50%,-50%) scale(${pop(f, fps, Math.round(sAt[i] + travel(i)))})`, padding: "8px 18px", borderRadius: 12, background: col, color: "#04122E", fontFamily: MONO, fontSize: 22, fontWeight: 800, whiteSpace: "nowrap", boxShadow: `0 10px 30px rgba(0,0,0,.4)` }}>{s2.badge || s2.label}</div>}
            </React.Fragment>);
        })}
      </AbsoluteFill>
      {/* step header */}
      {st && <div style={{ position: "absolute", left: 70, top: 46, display: "flex", alignItems: "center", gap: 16, opacity: xo }}>
        <span style={{ fontFamily: BN, fontSize: 24, fontWeight: 700, color: C.xb0, background: C.cyan, borderRadius: 10, padding: "6px 14px" }}>ধাপ {bn(cur + 1)}/{bn(steps.length)}</span>
        <span style={{ fontFamily: BN, fontSize: 34, fontWeight: 700, color: C.xink }}>{st.note}</span>
      </div>}
      {zoomId && f < outB && <div style={{ position: "absolute", left: 70, top: 46, fontFamily: BN, fontSize: 34, fontWeight: 700, color: C.ink, opacity: 1 - xo }}>{p.s.introText || "বাটনে চাপ দিলেন…"}</div>}
      {zoomId && <div style={{ position: "absolute", right: 70, top: 46, fontFamily: MONO, fontSize: 22, color: C.cyan, opacity: xo, letterSpacing: 3 }}>◉ X-RAY VIEW</div>}
      {/* scan line during the dive */}
      {zoomId && f > pressAt && f < outB + 6 && <div style={{ position: "absolute", left: 0, right: 0, top: interpolate(f, [pressAt, outB + 6], [0, 1080], clamp), height: 6, background: C.cyan, boxShadow: `0 0 40px 12px ${C.cyan}`, opacity: 0.8 }} />}
      {/* code panel */}
      {panel && st && st.code && (() => { const o = interpolate(f, [sAt[cur] + 4, sAt[cur] + 14], [0, 1], clamp); const lines = st.code.lines; const shown = Math.ceil(lines.length * interpolate(f, [sAt[cur] + 4, sAt[cur] + 30], [0.2, 1], clamp)); return (
        <div style={{ position: "absolute", left: panel.x, top: panel.y, width: panel.w, opacity: o * xo, transform: `translateY(${(1 - o) * 16}px)` }}>
          <CodeWin title={st.code.title} lines={lines} shown={shown} size={panel.size || 22} />
        </div>); })()}
    </AbsoluteFill>
  );
};

/* ---------------- code (anatomy with numbered marks) ---------------- */
const SCode: React.FC<P> = (p) => {
  const f = useCurrentFrame(); const { fps } = useVideoConfig(); const lines: string[] = p.s.lines || []; const marks: any[] = p.s.marks || [];
  const shown = Math.ceil(lines.length * interpolate(f, [LEAD, v(p, 0.12)], [0.15, 1], clamp));
  const mAt = marks.map((m, i) => cueAt(p, m.cue, 0.15 + (0.7 * i) / Math.max(1, marks.length)));
  const COLS = [C.brand2, C.violet, C.teal, C.orange, C.pink, C.green];
  const colOf = (i: number) => marks[i].c ? (C as any)[marks[i].c] || marks[i].c : COLS[i % COLS.length];
  let curM = -1; mAt.forEach((a, i) => { if (f >= a) curM = i; });
  return (
    <AbsoluteFill style={{ padding: "70px 100px 150px", display: "flex", flexDirection: "row", gap: 40 }}>
      <div style={{ flex: 1.25, display: "flex", flexDirection: "column" }}>
        <Eyebrow t={p.s.tag || "কোড পড়ি — লিখি না"} c={C.violet} icon="code" />
        <Head t={p.s.head} size={46} style={{ marginBottom: 18 }} />
        <CodeWin title={p.s.file} lines={lines} shown={shown} size={p.s.size || 28} hiLine={curM >= 0 ? marks[curM].line : undefined} marks={marks.map((m, i) => ({ line: m.line, find: m.find, c: colOf(i), o: f >= mAt[i] ? (i === curM ? 1 : 0.35) : 0 }))} />
      </div>
      <div style={{ flex: 0.9, display: "flex", flexDirection: "column", gap: 14, justifyContent: "center", paddingTop: 60 }}>
        {marks.map((m, i) => { const o = fadeIn(f, mAt[i], 9); const c = colOf(i); const on = i === curM; return (
          <div key={i} style={{ display: "flex", gap: 16, alignItems: "flex-start", padding: "16px 18px", borderRadius: 18, background: on ? "#fff" : "rgba(255,255,255,.6)", border: `2px solid ${on ? c : C.line}`, boxShadow: on ? `0 16px 40px ${c}30` : "none", opacity: o * (on ? 1 : 0.75), transform: `translateX(${(1 - o) * 30}px) scale(${on ? 1 : 0.97})` }}>
            <span style={{ flex: "none", width: 44, height: 44, borderRadius: 12, background: c, color: "#fff", display: "grid", placeItems: "center", fontFamily: BN, fontSize: 24, fontWeight: 800, transform: `scale(${on ? pop(f, fps, Math.round(mAt[i])) : 1})` }}>{bn(i + 1)}</span>
            <div><div style={{ fontFamily: BN, fontSize: 30, fontWeight: 700, color: C.ink, lineHeight: 1.25 }}>{m.label}</div>{m.desc && <div style={{ fontFamily: BN, fontSize: 24, color: C.mute, lineHeight: 1.4, marginTop: 3 }}>{m.desc}</div>}</div>
          </div>); })}
      </div>
    </AbsoluteFill>
  );
};

/* ---------------- cards (e.g. GET/POST/PUT/DELETE) ---------------- */
const SCards: React.FC<P> = (p) => {
  const f = useCurrentFrame(); const cards: any[] = p.s.cards || [];
  return (
    <Card>
      <Eyebrow t={p.s.tag || "এক নজরে"} c={C.brand} icon={p.s.tagIcon || "layers"} />
      <Head t={p.s.head} size={50} />
      <div style={{ display: "grid", gridTemplateColumns: `repeat(${cards.length}, 1fr)`, gap: 20, flex: 1 }}>
        {cards.map((c, i) => { const col = METHOD[c.badge] || (C as any)[c.c] || C.brand; const at = p.s.cues ? cueAt(p, p.s.cues[i], 0.1) : v(p, 0.1 + i * 0.18); const o = fadeIn(f, at, 12); return (
          <div key={i} style={{ display: "flex", flexDirection: "column", gap: 14, padding: "26px 22px", borderRadius: 22, background: `${col}0C`, border: `2px solid ${col}55`, opacity: o, transform: `translateY(${(1 - o) * 30}px)` }}>
            <span style={{ alignSelf: "flex-start", fontFamily: MONO, fontSize: 32, fontWeight: 800, color: "#fff", background: col, borderRadius: 12, padding: "6px 18px" }}>{c.badge}</span>
            <div style={{ fontFamily: BN, fontSize: cards.length > 4 ? 32 : 46, fontWeight: 800, color: C.ink, lineHeight: 1.25 }}>{c.title}</div>
            <div style={{ fontFamily: BN, fontSize: 30, color: C.ink2, lineHeight: 1.45, flex: 1 }}>{c.desc}</div>
            {c.ex && <div style={{ fontFamily: MONO, fontSize: 21, color: C.cInk, background: C.code, borderRadius: 10, padding: "10px 12px", whiteSpace: "nowrap", overflow: "hidden" }}>{hl(c.ex)}</div>}
          </div>); })}
      </div>
      {p.s.foot && <div style={{ fontFamily: BN, fontSize: 27, color: C.ink2, marginTop: 20, opacity: fadeIn(f, v(p, 0.85)) }}>{p.s.foot}</div>}
    </Card>
  );
};

/* ---------------- status codes ---------------- */
const SStatus: React.FC<P> = (p) => {
  const f = useCurrentFrame(); const rows: any[] = p.s.rows || [];
  const fam = [["২xx", "সফল", C.green], ["৪xx", "অনুরোধে ভুল (অ্যাপ/ইউজার)", C.orange], ["৫xx", "সার্ভারের ভুল", C.red]];
  return (
    <Card>
      <Eyebrow t="স্ট্যাটাস কোড" c={C.orange} icon="gauge" />
      <Head t={p.s.head} size={48} style={{ marginBottom: 14 }} />
      <div style={{ display: "flex", gap: 14, marginBottom: 20 }}>{fam.map(([a, b, c], i) => <span key={i} style={{ fontFamily: BN, fontSize: 25, padding: "7px 16px", borderRadius: 12, background: `${c}14`, color: c as string, border: `1.5px solid ${c}55`, fontWeight: 600, opacity: fadeIn(f, v(p, 0.04 + i * 0.05)) }}><b style={{ fontFamily: MONO }}>{a}</b> = {b}</span>)}</div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px 26px", flex: 1, alignContent: "center" }}>
        {rows.map((r, i) => { const col = statusCol(r[0]); const at = p.s.cues ? cueAt(p, p.s.cues[i], 0.15) : v(p, 0.15 + (0.7 * i) / rows.length); const o = fadeIn(f, at); return (
          <div key={i} style={{ display: "flex", alignItems: "center", gap: 18, padding: "12px 16px", borderRadius: 16, background: "#F7F9FD", border: `1px solid ${C.line}`, opacity: o, transform: `translateY(${(1 - o) * 16}px)` }}>
            <span style={{ fontFamily: MONO, fontSize: 40, fontWeight: 800, color: col, width: 90 }}>{r[0]}</span>
            <div><div style={{ fontFamily: MONO, fontSize: 19, color: C.mute }}>{r[1]}</div><div style={{ fontFamily: BN, fontSize: 27, fontWeight: 600, color: C.ink, lineHeight: 1.3 }}>{r[2]}</div></div>
          </div>); })}
      </div>
    </Card>
  );
};

/* ---------------- table ---------------- */
const STable: React.FC<P> = (p) => {
  const f = useCurrentFrame(); const cols: string[] = p.s.cols || []; const rows: string[][] = p.s.rows || []; const hc = p.s.hiCol ?? -1;
  const widths: number[] = p.s.widths || cols.map(() => 1);
  return (
    <Card>
      <Eyebrow t={p.s.tag || "তুলনা"} c={C.teal} icon={p.s.tagIcon || "layers"} />
      <Head t={p.s.head} size={48} style={{ marginBottom: 18 }} />
      <div style={{ borderRadius: 18, border: `1px solid ${C.line}`, overflow: "hidden", flex: 1, display: "flex", flexDirection: "column" }}>
        <div style={{ display: "flex", background: C.navy }}>{cols.map((c, i) => <div key={i} style={{ flex: widths[i], padding: "14px 20px", fontFamily: BN, fontSize: 27, fontWeight: 700, color: i === hc ? C.cyan : "#fff" }}>{c}</div>)}</div>
        {rows.map((r, i) => { const at = p.s.cues ? cueAt(p, p.s.cues[i], 0.1) : v(p, 0.1 + (0.75 * i) / rows.length); const o = fadeIn(f, at); return (
          <div key={i} style={{ display: "flex", flex: 1, alignItems: "center", background: i % 2 ? "#F7F9FD" : "#fff", borderTop: `1px solid ${C.line}`, opacity: o }}>
            {r.map((c, j) => <div key={j} style={{ flex: widths[j], padding: "10px 20px", fontFamily: /[\/{}=]/.test(c) && !/[ঀ-৿]/.test(c) ? MONO : BN, fontSize: j === 0 ? 28 : 26, fontWeight: j === 0 ? 700 : 500, color: j === hc ? C.brand : j === 0 ? C.ink : C.ink2, lineHeight: 1.3 }}>{c}</div>)}
          </div>); })}
      </div>
    </Card>
  );
};

/* ---------------- layers (architecture map by category) ---------------- */
const SLayers: React.FC<P> = (p) => {
  const f = useCurrentFrame(); const cols: any[] = p.s.cols || [];
  const COL: Record<string, [string, string]> = { front: [C.brand, "phone"], back: [C.violet, "server"], data: [C.teal, "db"], third: [C.orange, "cloud"] };
  return (
    <Card style={{ padding: "40px 52px" }}>
      <div style={{ display: "flex", alignItems: "center" }}><Eyebrow t={p.s.tag || "আর্কিটেকচারের মানচিত্র"} c={C.violet} icon="net" />{p.s.assume && <span style={{ marginLeft: "auto", fontFamily: BN, fontSize: 23, color: C.orange, border: `1.5px dashed ${C.orange}`, borderRadius: 10, padding: "4px 12px" }}>সম্ভবত এভাবে — পাবলিক তথ্য + যুক্তিসঙ্গত অনুমান</span>}</div>
      <Head t={p.s.head} size={46} style={{ marginBottom: 16 }} />
      <div style={{ display: "grid", gridTemplateColumns: `repeat(${cols.length}, 1fr)`, gap: 18, flex: 1 }}>
        {cols.map((c, i) => { const [col, icon] = COL[c.k] || [C.brand, "box"]; const I = ICO[icon]; const at = p.s.cues ? cueAt(p, p.s.cues[i], 0.1) : v(p, 0.08 + i * 0.2); const o = fadeIn(f, at, 12); return (
          <div key={i} style={{ borderRadius: 20, background: `${col}0B`, border: `2px solid ${col}50`, padding: "20px 18px", display: "flex", flexDirection: "column", gap: 10, opacity: o, transform: `translateY(${(1 - o) * 26}px)` }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}><span style={{ width: 52, height: 52, borderRadius: 14, background: col, display: "grid", placeItems: "center" }}><I size={28} color="#fff" /></span><div><div style={{ fontFamily: BN, fontSize: 30, fontWeight: 800, color: col }}>{c.title}</div><div style={{ fontFamily: BN, fontSize: 19, color: C.mute }}>{c.sub}</div></div></div>
            {(c.items || []).map((t: string, j: number) => { const a2 = at + 10 + j * 7; return <div key={j} style={{ fontFamily: BN, fontSize: 25, color: C.ink, background: "#fff", borderRadius: 12, padding: "9px 14px", border: `1px solid ${C.line}`, opacity: fadeIn(f, a2, 8) }}>{t}</div>; })}
          </div>); })}
      </div>
    </Card>
  );
};

/* ---------------- phones (mockups with callouts) ---------------- */
const SPhones: React.FC<P> = (p) => {
  const f = useCurrentFrame(); const { fps } = useVideoConfig(); const devs: any[] = p.s.devices || []; const calls: any[] = p.s.callouts || [];
  return (
    <AbsoluteFill style={{ padding: "60px 110px 150px", display: "flex", flexDirection: "row", alignItems: "center", gap: 60 }}>
      <div style={{ display: "flex", gap: 34, alignItems: "flex-end", flex: "none" }}>
        {devs.map((d, i) => { const at = p.s.devCues ? cueAt(p, p.s.devCues[i], 0.05) : v(p, 0.02 + i * 0.12); const o = pop(f, fps, Math.round(at)); return (
          <div key={i} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 14, opacity: Math.min(1, o * 1.4), transform: `translateY(${(1 - o) * 50}px)` }}>
            {d.kind === "laptop" ? <LaptopMock w={d.w || 640} f={f} /> : <Phone w={d.w || (devs.length > 2 ? 230 : 280)} kind={d.screen} f={f} push={d.push ? { ...d.push, o: fadeIn(f, cueAt(p, d.push.cue, 0.5)) } : null} />}
            <span style={{ fontFamily: BN, fontSize: 26, fontWeight: 700, color: C.ink2, background: "#fff", border: `1px solid ${C.line}`, borderRadius: 999, padding: "6px 18px" }}>{d.label}</span>
          </div>); })}
      </div>
      <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 16 }}>
        {p.s.head && <Head t={p.s.head} size={44} style={{ marginBottom: 6 }} />}
        {calls.map((c, i) => { const at = cueAt(p, c.cue, 0.15 + (0.7 * i) / Math.max(1, calls.length)); const o = fadeIn(f, at); const col = (C as any)[c.c] || C.brand; const I = ICO[c.icon || "check"]; return (
          <div key={i} style={{ display: "flex", gap: 16, alignItems: "flex-start", background: "#fff", borderRadius: 18, padding: "14px 18px", border: `1px solid ${C.line}`, borderLeft: `6px solid ${col}`, boxShadow: "0 10px 30px rgba(14,26,51,.07)", opacity: o, transform: `translateX(${(1 - o) * 30}px)` }}>
            <I size={32} color={col} style={{ flex: "none", marginTop: 2 }} />
            <div><div style={{ fontFamily: BN, fontSize: 29, fontWeight: 700, color: C.ink, lineHeight: 1.3 }}>{c.t}</div>{c.d && <div style={{ fontFamily: BN, fontSize: 23, color: C.mute, lineHeight: 1.4 }}>{c.d}</div>}</div>
            {c.tag && <span style={{ marginLeft: "auto", flex: "none", fontFamily: BN, fontSize: 19, fontWeight: 700, color: col, background: `${col}14`, borderRadius: 8, padding: "3px 10px" }}>{c.tag}</span>}
          </div>); })}
      </div>
    </AbsoluteFill>
  );
};

/* ---------------- map (driver matching with a hexagon grid) ---------------- */
const hexPts = (cx: number, cy: number, r: number) => Array.from({ length: 6 }, (_, i) => { const a = (Math.PI / 3) * i + Math.PI / 6; return `${cx + r * Math.cos(a)},${cy + r * Math.sin(a)}`; }).join(" ");
const SMap: React.FC<P> = (p) => {
  const f = useCurrentFrame(); const caps: any[] = p.s.captions || [];
  const cAt = caps.map((c, i) => cueAt(p, c.cue, 0.05 + (0.85 * i) / Math.max(1, caps.length)));
  const W = 1040, H = 800, R = 58;
  const hexOn = f >= cAt[1], searchOn = f >= cAt[2], pickOn = f >= cAt[3];
  const rider = { x: 520, y: 420 };
  const cells: { x: number; y: number; q: number; r: number }[] = [];
  for (let r = -4; r <= 4; r++) for (let q = -6; q <= 6; q++) { const x = rider.x + R * Math.sqrt(3) * (q + r / 2), y = rider.y + R * 1.5 * r; if (x > -40 && x < W + 40 && y > -40 && y < H + 40) cells.push({ x, y, q, r }); }
  const ring = (c: any) => Math.max(Math.abs(c.q), Math.abs(c.r), Math.abs(-c.q - c.r));
  const drivers = [[180, 150], [820, 120], [700, 560], [300, 640], [900, 420], [560, 300], [120, 420]].map(([x, y], i) => ({ x: x + Math.sin(f / 40 + i) * 18, y: y + Math.cos(f / 50 + i * 2) * 14, i }));
  const best = 5;
  const ping = (i: number) => ((f + i * 23) % 120) / 120;
  return (
    <AbsoluteFill style={{ padding: "60px 90px 150px", display: "flex", flexDirection: "row", gap: 40 }}>
      <div style={{ width: W, height: H, borderRadius: 26, overflow: "hidden", position: "relative", boxShadow: "0 30px 70px rgba(14,26,51,.18)", border: `1px solid ${C.line}`, flex: "none" }}>
        <div style={{ position: "absolute", inset: 0 }}><MiniMap w={W} h={H} f={0} /></div>
        <svg width={W} height={H} style={{ position: "absolute", inset: 0 }}>
          {cells.map((c, i) => { const rg = ring(c); const fill = searchOn && rg <= 1 ? "rgba(0,80,237,.20)" : "rgba(0,80,237,.03)"; return <polygon key={i} points={hexPts(c.x, c.y, R - 1)} fill={fill} stroke={C.brand} strokeOpacity={0.45} strokeWidth={1.5} opacity={hexOn ? fadeIn(f, cAt[1] + rg * 3, 10) : 0} />; })}
          {drivers.map((d) => { const pt = ping(d.i); return <circle key={"p" + d.i} cx={d.x} cy={d.y} r={10 + pt * 40} fill="none" stroke={C.green} strokeWidth={2} opacity={(1 - pt) * 0.8} />; })}
          {pickOn && (() => { const d = drivers[best]; const t = interpolate(f, [cAt[3], cAt[3] + 30], [0, 1], clamp); return <line x1={d.x} y1={d.y} x2={d.x + (rider.x - d.x) * t} y2={d.y + (rider.y - d.y) * t} stroke={C.green} strokeWidth={7} strokeLinecap="round" />; })()}
        </svg>
        {drivers.map((d) => <div key={d.i} style={{ position: "absolute", left: d.x, top: d.y, transform: "translate(-50%,-50%)", width: 46, height: 46, borderRadius: 14, background: pickOn && d.i === best ? C.green : "#fff", border: `2px solid ${pickOn && d.i === best ? C.green : C.ink}`, display: "grid", placeItems: "center", boxShadow: "0 6px 14px rgba(0,0,0,.2)" }}><Car size={26} color={pickOn && d.i === best ? "#fff" : C.ink} /></div>)}
        <div style={{ position: "absolute", left: rider.x, top: rider.y, transform: "translate(-50%,-100%)" }}><MapPin size={64} color={C.red} fill="#fff" strokeWidth={2.4} /></div>
        {pickOn && <div style={{ position: "absolute", left: drivers[best].x + 30, top: drivers[best].y - 70, background: C.green, color: "#fff", fontFamily: BN, fontSize: 24, fontWeight: 700, borderRadius: 12, padding: "6px 14px", opacity: fadeIn(f, cAt[3] + 20) }}>৩ মিনিট দূরে ✓</div>}
      </div>
      <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 16, justifyContent: "center" }}>
        <Eyebrow t={p.s.tag || "ম্যাচিং"} c={C.green} icon="route" />
        {caps.map((c, i) => { const o = fadeIn(f, cAt[i]); const on = i === caps.length - 1 ? f >= cAt[i] : f >= cAt[i] && f < cAt[i + 1]; return (
          <div key={i} style={{ display: "flex", gap: 14, alignItems: "flex-start", padding: "14px 16px", borderRadius: 16, background: on ? "#fff" : "transparent", border: `1.5px solid ${on ? C.green : "transparent"}`, boxShadow: on ? "0 12px 30px rgba(14,26,51,.08)" : "none", opacity: o * (on ? 1 : 0.6) }}>
            <span style={{ flex: "none", width: 40, height: 40, borderRadius: 12, background: on ? C.green : "#DDE6F2", color: on ? "#fff" : C.mute, display: "grid", placeItems: "center", fontFamily: BN, fontSize: 22, fontWeight: 800 }}>{bn(i + 1)}</span>
            <div style={{ fontFamily: BN, fontSize: 28, color: C.ink, lineHeight: 1.35, fontWeight: on ? 700 : 500 }}>{c.t}</div>
          </div>); })}
        {p.s.src && <div style={{ fontFamily: BN, fontSize: 19, color: C.faint, marginTop: 6 }}>সূত্র: {p.s.src}</div>}
      </div>
    </AbsoluteFill>
  );
};

/* ---------------- fare (formula) ---------------- */
const SFare: React.FC<P> = (p) => {
  const f = useCurrentFrame(); const { fps } = useVideoConfig(); const parts: any[] = p.s.parts || [];
  const pAt = parts.map((x, i) => cueAt(p, x.cue, 0.1 + i * 0.15));
  const totAt = cueAt(p, p.s.totalCue, 0.85);
  return (
    <Card accent={C.orange}>
      <div style={{ display: "flex", alignItems: "center" }}><Eyebrow t="ভাড়ার হিসাব — সার্ভারে" c={C.orange} icon="wallet" /><span style={{ marginLeft: "auto", fontFamily: BN, fontSize: 23, color: C.orange, border: `1.5px dashed ${C.orange}`, borderRadius: 10, padding: "4px 12px" }}>উদাহরণের সংখ্যা — আসল রেট নয়</span></div>
      <Head t={p.s.head} size={48} />
      <div style={{ display: "flex", alignItems: "stretch", gap: 14, flex: 1, flexWrap: "nowrap" }}>
        {parts.map((x, i) => { const o = pop(f, fps, Math.round(pAt[i])); const col = (C as any)[x.c] || C.brand; return (
          <React.Fragment key={i}>
            {i > 0 && <div style={{ alignSelf: "center", fontFamily: MONO, fontSize: 56, fontWeight: 800, color: C.faint, opacity: Math.min(1, o) }}>{x.op || "+"}</div>}
            <div style={{ flex: 1, borderRadius: 22, background: `${col}0D`, border: `2px solid ${col}55`, padding: "22px 18px", display: "flex", flexDirection: "column", gap: 8, justifyContent: "center", opacity: Math.min(1, o), transform: `scale(${0.85 + 0.15 * Math.min(1, o)})` }}>
              <span style={{ fontFamily: BN, fontSize: 27, fontWeight: 700, color: col }}>{x.t}</span>
              <span style={{ fontFamily: BN, fontSize: 22, color: C.mute, lineHeight: 1.35 }}>{x.d}</span>
              <span style={{ fontFamily: BN, fontSize: 42, fontWeight: 800, color: C.ink }}>{x.v}</span>
            </div>
          </React.Fragment>); })}
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 20, marginTop: 22, opacity: fadeIn(f, totAt), transform: `translateY(${(1 - fadeIn(f, totAt)) * 20}px)` }}>
        <span style={{ fontFamily: BN, fontSize: 34, fontWeight: 700, color: C.ink }}>{p.s.totalLabel || "মোট"}</span>
        <span style={{ fontFamily: BN, fontSize: 56, fontWeight: 800, color: "#fff", background: C.orange, borderRadius: 16, padding: "4px 26px" }}>{p.s.total}</span>
        {p.s.why && <span style={{ fontFamily: BN, fontSize: 26, color: C.ink2, lineHeight: 1.35, flex: 1 }}>{p.s.why}</span>}
      </div>
    </Card>
  );
};

/* ---------------- scale (one server → many) ---------------- */
const SScale: React.FC<P> = (p) => {
  const f = useCurrentFrame(); const bAt = cueAt(p, p.s.bigCue, 0.4); const items: any[] = p.s.items || [];
  const o2 = fadeIn(f, bAt, 14);
  const Dot: React.FC<{ x: number; y: number; c: string }> = ({ x, y, c }) => <div style={{ position: "absolute", left: x, top: y, width: 14, height: 14, borderRadius: "50%", background: c, transform: "translate(-50%,-50%)" }} />;
  const Srv: React.FC<{ x: number; y: number; t: string; c?: string; I?: React.FC<any>; w?: number; hot?: boolean }> = ({ x, y, t, c = C.violet, I = Server, w = 150, hot }) => (
    <div style={{ position: "absolute", left: x, top: y, transform: "translate(-50%,-50%)", width: w, padding: "12px 8px", borderRadius: 16, background: hot ? "#FFECEC" : "#fff", border: `2px solid ${hot ? C.red : c}`, display: "flex", flexDirection: "column", alignItems: "center", gap: 4, boxShadow: hot ? `0 0 ${20 + 10 * Math.sin(f / 4)}px ${C.red}88` : "0 10px 24px rgba(14,26,51,.08)" }}><I size={30} color={hot ? C.red : c} /><span style={{ fontFamily: BN, fontSize: 20, fontWeight: 700, color: C.ink, textAlign: "center", lineHeight: 1.2 }}>{t}</span></div>
  );
  // left: one overloaded server
  const leftDots = Array.from({ length: 14 }, (_, i) => { const t = ((f + i * 9) % 90) / 90; return { x: 70 + t * 250, y: 130 + (i % 7) * 50, c: t > 0.8 ? C.red : C.brand2 }; });
  // right: lb → 4 servers, cache, queue
  const rDots = Array.from({ length: 18 }, (_, i) => { const t = ((f + i * 7) % 70) / 70; const lane = i % 4; const x = t < 0.5 ? 40 + t * 2 * 180 : 220 + (t - 0.5) * 2 * 210; const y = t < 0.5 ? 285 : 285 + (lane - 1.5) * 110 * ((t - 0.5) * 2); return { x, y, c: C.brand2 }; });
  return (
    <Card style={{ padding: "40px 56px" }}>
      <Eyebrow t={p.s.tag || "স্কেলিং — লাখো মানুষ একসাথে"} c={C.violet} icon="gauge" />
      <Head t={p.s.head} size={44} style={{ marginBottom: 12 }} />
      <div style={{ display: "flex", gap: 30, flex: 1 }}>
        <div style={{ flex: 0.8, position: "relative", borderRadius: 20, background: "#F7F9FD", border: `1px solid ${C.line}` }}>
          <div style={{ position: "absolute", left: 20, top: 14, fontFamily: BN, fontSize: 25, fontWeight: 700, color: C.red }}>{p.s.left || "শুরুতে: একটাই সার্ভার"}</div>
          {leftDots.map((d, i) => <Dot key={i} {...d} />)}
          <Srv x={420} y={290} t="একটা সার্ভার" hot />
          <div style={{ position: "absolute", left: 340, top: 380, fontFamily: BN, fontSize: 24, color: C.red, fontWeight: 700 }}>ধীর · ক্র্যাশ 😵</div>
        </div>
        <div style={{ flex: 1.2, position: "relative", borderRadius: 20, background: "#F7F9FD", border: `1px solid ${C.line}`, opacity: o2, transform: `translateX(${(1 - o2) * 40}px)` }}>
          <div style={{ position: "absolute", left: 20, top: 14, fontFamily: BN, fontSize: 25, fontWeight: 700, color: C.green }}>{p.s.right || "বড় হলে: কাজ ভাগ করে দেওয়া"}</div>
          {rDots.map((d, i) => <Dot key={i} {...d} />)}
          <Srv x={220} y={285} t="লোড ব্যালান্সার" c={C.brand} I={Network} w={160} />
          {[0, 1, 2, 3].map((i) => <Srv key={i} x={480} y={120 + i * 110} t={["ট্রিপ সার্ভিস", "ম্যাচিং সার্ভিস", "পেমেন্ট সার্ভিস", "নোটিফিকেশন"][i]} w={190} />)}
          <Srv x={720} y={175} t="ক্যাশ (দ্রুত মেমরি)" c={C.orange} I={Zap} w={180} />
          <Srv x={720} y={400} t="কিউ (লাইন)" c={C.teal} I={Archive} w={180} />
        </div>
      </div>
      <div style={{ display: "flex", gap: 14, marginTop: 16 }}>{items.map((t, i) => { const at = cueAt(p, t.cue, 0.6 + i * 0.1); return <div key={i} style={{ flex: 1, fontFamily: BN, fontSize: 23, color: C.ink2, background: "#fff", border: `1px solid ${C.line}`, borderRadius: 14, padding: "10px 14px", lineHeight: 1.35, opacity: fadeIn(f, at) }}><b style={{ color: (C as any)[t.c] || C.violet }}>{t.k}</b> — {t.t}</div>; })}</div>
    </Card>
  );
};

/* ---------------- prompt card ("এজেন্টকে বলুন") ---------------- */
const SPrompt: React.FC<P> = (p) => {
  const f = useCurrentFrame(); const { fps } = useVideoConfig(); const txt: string = p.s.prompt || "";
  const n = Math.round(txt.length * interpolate(f, [v(p, 0.08), v(p, 0.75)], [0, 1], clamp));
  const done = n >= txt.length;
  return (
    <AbsoluteFill style={{ padding: "70px 160px 160px", display: "flex", flexDirection: "column", justifyContent: "center" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 20 }}>
        <span style={{ width: 70, height: 70, borderRadius: 20, background: `linear-gradient(135deg, ${C.violet}, ${C.brand})`, display: "grid", placeItems: "center", transform: `scale(${pop(f, fps, 2)})`, boxShadow: `0 14px 30px ${C.violet}55` }}><Bot size={40} color="#fff" /></span>
        <div><div style={{ fontFamily: BN, fontSize: 48, fontWeight: 800, color: C.ink }}>এজেন্টকে বলুন</div><div style={{ fontFamily: BN, fontSize: 26, color: C.mute }}>{p.s.sub || "কপি করে আপনার এআই এজেন্টকে দিন — Claude, ChatGPT, Cursor, Lovable যেটাই হোক"}</div></div>
      </div>
      <div style={{ background: "#fff", borderRadius: 26, border: `2px solid ${C.violet}55`, boxShadow: `0 30px 80px rgba(124,77,255,.16)`, padding: "30px 36px", position: "relative" }}>
        <div style={{ fontFamily: BN, fontSize: 33, color: C.ink, lineHeight: 1.55, minHeight: 300, whiteSpace: "pre-wrap" }}>{txt.slice(0, n)}{!done && <span style={{ color: C.violet, opacity: Math.floor(f / 8) % 2 ? 1 : 0.2 }}>▍</span>}</div>
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginTop: 18, borderTop: `1px solid ${C.line}`, paddingTop: 16 }}>
          <span style={{ display: "inline-flex", alignItems: "center", gap: 8, fontFamily: BN, fontSize: 24, fontWeight: 700, color: done ? "#fff" : C.violet, background: done ? C.green : `${C.violet}12`, borderRadius: 12, padding: "8px 18px" }}><Copy size={20} />{done ? "কপি হয়েছে ✓" : "কপি করুন"}</span>
          <span style={{ fontFamily: BN, fontSize: 22, color: C.faint }}>লেসনের নিচে এই প্রম্পটটা দেওয়া আছে</span>
          <span style={{ marginLeft: "auto", width: 52, height: 52, borderRadius: 14, background: C.violet, display: "grid", placeItems: "center" }}><Send size={26} color="#fff" /></span>
        </div>
      </div>
      {p.s.why && <div style={{ fontFamily: BN, fontSize: 27, color: C.ink2, marginTop: 22, lineHeight: 1.45, opacity: fadeIn(f, v(p, 0.8)) }}>👉 {p.s.why}</div>}
    </AbsoluteFill>
  );
};

/* ---------------- recap / outro ---------------- */
const SRecap: React.FC<P> = (p) => {
  const f = useCurrentFrame(); const it: any[] = p.s.items || [];
  return (
    <Card accent={C.green}>
      <Eyebrow t="আজ যা বুঝলাম" c={C.green} icon="check" />
      <Head t={p.s.head || "সংক্ষেপে"} size={50} />
      <div style={{ display: "flex", flexDirection: "column", gap: 16, flex: 1, justifyContent: "center" }}>
        {it.map((t: string, i: number) => { const at = v(p, 0.08 + (0.75 * i) / Math.max(1, it.length)); return (
          <div key={i} style={{ display: "flex", alignItems: "center", gap: 20, opacity: fadeIn(f, at), transform: `translateX(${interpolate(f, [at, at + 10], [-20, 0], clamp)}px)` }}>
            <CheckCircle2 size={42} color={C.green} style={{ flex: "none" }} />
            <span style={{ fontFamily: BN, fontSize: 35, color: C.ink, lineHeight: 1.35 }}>{t}</span></div>); })}
      </div>
    </Card>
  );
};
const SOutro: React.FC<P> = (p) => {
  const f = useCurrentFrame(); const src: string[] = p.s.sources || [];
  return (
    <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", textAlign: "center", paddingBottom: 140 }}>
      <Img src={staticFile("academy/_brand/aiu-logo.svg")} style={{ height: 90, opacity: fadeIn(f, 2) }} />
      <div style={{ fontFamily: BN, fontSize: 64, fontWeight: 800, color: C.ink, margin: "26px 0 12px", opacity: fadeIn(f, 8, 12) }}>{p.s.head || "পরের পাঠে দেখা হবে!"}</div>
      {p.spec.next && <div style={{ fontFamily: BN, fontSize: 38, color: C.brand, marginBottom: 26, opacity: fadeIn(f, 16, 12) }}>পরের পাঠ: {p.spec.next}</div>}
      <div style={{ fontFamily: BN, fontSize: 30, color: C.mute, opacity: fadeIn(f, 24) }}>{p.spec.course} — <b style={{ color: C.ink }}>aiuniversitybd.com</b></div>
      {src.length > 0 && <div style={{ marginTop: 34, fontFamily: BN, fontSize: 21, color: C.faint, lineHeight: 1.6, maxWidth: 1400, opacity: fadeIn(f, 30) }}>সূত্র: {src.join(" · ")}</div>}
      {p.s.tm && <div style={{ marginTop: 10, fontFamily: BN, fontSize: 19, color: C.faint, maxWidth: 1400, opacity: fadeIn(f, 34) }}>{p.s.tm}</div>}
    </AbsoluteFill>
  );
};


/* ---------------- PROMO scenes (course promo in the x-ray style) ---------------- */
// promoHook: dark blueprint, big kinetic lines appear one by one, a scan beam sweeps; {"lines":[{"t","c"?,"big"?,"cue"}], "tag"?}
const SPromoHook: React.FC<P> = (p) => {
  const f = useCurrentFrame(); const { fps } = useVideoConfig(); const lines: any[] = p.s.lines || [];
  return (
    <AbsoluteFill>
      <XBg o={1} />
      <div style={{ position: "absolute", left: 0, right: 0, top: interpolate(f % 120, [0, 120], [-40, 1100]), height: 4, background: C.cyan, boxShadow: `0 0 50px 14px ${C.cyan}`, opacity: 0.35 }} />
      <AbsoluteFill style={{ padding: "0 170px 160px", display: "flex", flexDirection: "column", justifyContent: "center", gap: 18 }}>
        {p.s.tag && <div style={{ fontFamily: MONO, fontSize: 26, color: C.cyan, letterSpacing: 3, opacity: fadeIn(f, 2) }}>◉ {p.s.tag}</div>}
        {lines.map((l, i) => { const at = cueAt(p, l.cue, 0.05 + i * 0.22); const o = Math.min(1, pop(f, fps, Math.round(at))); const col = l.c ? (C as any)[l.c] || l.c : C.xink; return (
          <div key={i} style={{ fontFamily: BN, fontSize: l.big ? 104 : 72, fontWeight: 800, color: col, lineHeight: 1.15, opacity: o, transform: `translateY(${(1 - o) * 40}px)`, textShadow: l.c ? `0 0 40px ${col}66` : undefined }}>{l.t}</div>); })}
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
// modules: wall of module tiles lighting up in turn; {"head","mods":[{"n","t","icon"}],"cue"?}
const SModules: React.FC<P> = (p) => {
  const f = useCurrentFrame(); const mods: any[] = p.s.mods || [];
  const start = cueAt(p, p.s.cue, 0.06); const span = Math.max(30, v(p, 0.85) - start);
  const cols = mods.length > 9 ? 5 : 4;
  return (
    <AbsoluteFill>
      <XBg o={1} />
      <AbsoluteFill style={{ padding: "56px 90px 150px", display: "flex", flexDirection: "column" }}>
        <div style={{ fontFamily: MONO, fontSize: 24, color: C.cyan, letterSpacing: 3, marginBottom: 8 }}>◉ COURSE MAP</div>
        <div style={{ fontFamily: BN, fontSize: 54, fontWeight: 800, color: C.xink, marginBottom: 22 }}>{p.s.head}</div>
        <div style={{ display: "grid", gridTemplateColumns: `repeat(${cols}, 1fr)`, gap: 16, flex: 1, alignContent: "start" }}>
          {mods.map((m, i) => { const at = start + (span * i) / mods.length; const o = fadeIn(f, at, 10); const I = ICO[m.icon] || Code2; const hot = f >= at && f < at + span / mods.length + 6; return (
            <div key={i} style={{ padding: "18px 18px", borderRadius: 18, background: hot ? "rgba(92,225,255,.16)" : "rgba(10,32,72,.8)", border: `2px solid ${hot ? C.cyan : C.xline}`, boxShadow: hot ? `0 0 40px ${C.cyan}66` : "none", opacity: 0.25 + 0.75 * o, transform: `scale(${0.94 + 0.06 * o})`, display: "flex", gap: 14, alignItems: "flex-start" }}>
              <span style={{ flex: "none", width: 50, height: 50, borderRadius: 14, background: hot ? C.cyan : "#0E2C5E", display: "grid", placeItems: "center" }}><I size={26} color={hot ? C.xb0 : C.cyan} /></span>
              <div><div style={{ fontFamily: MONO, fontSize: 17, color: C.xmute }}>MODULE {String(m.n).padStart(2, "0")}</div><div style={{ fontFamily: BN, fontSize: 26, fontWeight: 700, color: C.xink, lineHeight: 1.3 }}>{m.t}</div></div>
            </div>); })}
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
// inside: what the course includes — big value tiles; {"tag"?,"head","items":[{"k","t","d"?,"icon","c","cue"}]}
const SInside: React.FC<P> = (p) => {
  const f = useCurrentFrame(); const { fps } = useVideoConfig(); const it: any[] = p.s.items || [];
  return (
    <Card style={{ padding: "44px 56px" }}>
      <Eyebrow t={p.s.tag || "কোর্সে যা যা পাবেন"} c={C.brand} icon="box" />
      <Head t={p.s.head} size={50} />
      <div style={{ display: "grid", gridTemplateColumns: `repeat(${it.length > 4 ? 3 : 2}, 1fr)`, gap: 18, flex: 1 }}>
        {it.map((x, i) => { const at = cueAt(p, x.cue, 0.08 + i * 0.13); const o = Math.min(1, pop(f, fps, Math.round(at))); const col = (C as any)[x.c] || C.brand; const I = ICO[x.icon] || CheckCircle2; return (
          <div key={i} style={{ borderRadius: 22, background: `${col}0D`, border: `2px solid ${col}45`, padding: "20px 22px", display: "flex", gap: 18, alignItems: "center", opacity: o, transform: `scale(${0.9 + 0.1 * o})` }}>
            <span style={{ flex: "none", width: 70, height: 70, borderRadius: 20, background: col, display: "grid", placeItems: "center", boxShadow: `0 12px 26px ${col}55` }}><I size={36} color="#fff" /></span>
            <div><div style={{ fontFamily: BN, fontSize: 40, fontWeight: 800, color: col, lineHeight: 1.1 }}>{x.k}</div><div style={{ fontFamily: BN, fontSize: 27, fontWeight: 700, color: C.ink, lineHeight: 1.3 }}>{x.t}</div>{x.d && <div style={{ fontFamily: BN, fontSize: 21, color: C.mute, lineHeight: 1.35 }}>{x.d}</div>}</div>
          </div>); })}
      </div>
    </Card>
  );
};
// price: ticket card with the struck regular price; {"was","now","badge"?,"note"?,"perks":[…],"cta","url","sub"?,"priceCue"}
const SPrice: React.FC<P> = (p) => {
  const f = useCurrentFrame(); const { fps } = useVideoConfig(); const at = cueAt(p, p.s.priceCue, 0.15); const perks: string[] = p.s.perks || [];
  const strike = interpolate(f, [at + 10, at + 24], [0, 100], clamp); const o = Math.min(1, pop(f, fps, Math.round(at + 22)));
  return (
    <AbsoluteFill>
      <XBg o={1} />
      <AbsoluteFill style={{ padding: "60px 120px 160px", display: "flex", flexDirection: "row", alignItems: "center", gap: 64 }}>
        <div style={{ flex: 1.15, background: "#fff", borderRadius: 34, padding: "44px 52px", boxShadow: `0 40px 100px rgba(0,0,0,.5), 0 0 0 4px ${C.cyan}55`, position: "relative", overflow: "hidden" }}>
          <div style={{ position: "absolute", right: -70, top: 40, transform: "rotate(35deg)", background: C.red, color: "#fff", fontFamily: BN, fontSize: 24, fontWeight: 800, padding: "8px 90px" }}>{p.s.badge || "বিশেষ মূল্য"}</div>
          <div style={{ fontFamily: BN, fontSize: 28, fontWeight: 700, color: C.mute, maxWidth: 560, lineHeight: 1.35 }}>{p.spec.course}</div>
          <div style={{ display: "flex", alignItems: "baseline", gap: 26, margin: "16px 0 6px" }}>
            <span style={{ position: "relative", fontFamily: BN, fontSize: 64, fontWeight: 700, color: C.faint, opacity: fadeIn(f, at - 4) }}>{p.s.was}<span style={{ position: "absolute", left: -6, top: "52%", height: 6, width: `calc(${strike}% + 12px)`, background: C.red, borderRadius: 3, transform: "rotate(-8deg)" }} /></span>
            <span style={{ fontFamily: BN, fontSize: 150, fontWeight: 800, color: C.brand, lineHeight: 1, transform: `scale(${0.6 + 0.4 * o})`, transformOrigin: "left bottom", display: "inline-block", opacity: o }}>{p.s.now}</span>
          </div>
          {p.s.note && <div style={{ fontFamily: BN, fontSize: 26, color: C.ink2, marginBottom: 16 }}>{p.s.note}</div>}
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>{perks.map((t, i) => <div key={i} style={{ display: "flex", gap: 12, alignItems: "center", fontFamily: BN, fontSize: 28, color: C.ink, opacity: fadeIn(f, at + 30 + i * 10) }}><CheckCircle2 size={30} color={C.green} />{t}</div>)}</div>
        </div>
        <div style={{ flex: 0.85, display: "flex", flexDirection: "column", gap: 26, alignItems: "flex-start" }}>
          <Img src={staticFile("academy/_brand/aiu-logo-dark.svg")} style={{ height: 80, opacity: fadeIn(f, 6) }} />
          <div style={{ fontFamily: BN, fontSize: 56, fontWeight: 800, color: C.xink, lineHeight: 1.2, opacity: fadeIn(f, 12) }}>{p.s.cta}</div>
          <div style={{ fontFamily: MONO, fontSize: 38, fontWeight: 700, color: "#04122E", background: C.cyan, borderRadius: 16, padding: "12px 26px", boxShadow: `0 0 50px ${C.cyan}88`, transform: `scale(${1 + 0.03 * Math.sin(f / 6)})`, opacity: fadeIn(f, 20) }}>{p.s.url}</div>
          {p.s.sub && <div style={{ fontFamily: BN, fontSize: 26, color: C.xmute, lineHeight: 1.45, opacity: fadeIn(f, 28) }}>{p.s.sub}</div>}
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

/* ---------------- frame ---------------- */
const MAP: Record<string, React.FC<any>> = { troll: STroll, title: STitle, points: SPoints, xray: SXray, code: SCode, cards: SCards, status: SStatus, table: STable, layers: SLayers, phones: SPhones, map: SMap, fare: SFare, scale: SScale, prompt: SPrompt, recap: SRecap, outro: SOutro, promoHook: SPromoHook, modules: SModules, inside: SInside, price: SPrice };
const subChunks = (spec: Spec, starts: number[]) => spec.scenes.flatMap((s, i) => {
  const parts = s.vo.split(/(?<=[।?!,—])\s+/).reduce<string[]>((a, x) => { if (a.length && (a[a.length - 1].length < 26 || x.length < 10)) a[a.length - 1] += " " + x; else a.push(x); return a; }, []);
  const total = parts.reduce((n, x) => n + x.length, 0) || 1; let acc = 0; const b = starts[i] + LEAD;
  return parts.map((x) => { const from = b + (s.frames * acc) / total; acc += x.length; return { s: x, from, to: b + (s.frames * acc) / total, dark: s.type === "xray" }; });
});
const Fade: React.FC<{ len: number; children: React.ReactNode }> = ({ len, children }) => {
  const f = useCurrentFrame(); const o = Math.min(interpolate(f, [0, 9], [0, 1], clamp), interpolate(f, [len - 9, len], [1, 0], clamp));
  return <AbsoluteFill style={{ opacity: o }}>{children}</AbsoluteFill>;
};
export const XrayVideo: React.FC<{ spec: Spec }> = ({ spec }) => {
  const f = useCurrentFrame();
  const lens = spec.scenes.map(sceneLen);
  const starts = lens.reduce<number[]>((a, _, i) => [...a, i ? a[i - 1] + lens[i - 1] : 15], []);
  const chunks = subChunks(spec, starts), cur = chunks.find((x) => f >= x.from && f < x.to + 4);
  const total = xrayLen(spec);
  const inX = spec.scenes.some((s, i) => ["xray", "promoHook", "modules", "price"].includes(s.type) && f >= starts[i] + 20 && f < starts[i] + lens[i] - 6);
  return (
    <AbsoluteFill style={{ background: C.paper }}>
      <Board />
      {spec.scenes.map((s, i) => { const S = MAP[s.type] || SPoints; const len = lens[i]; return (
        <Sequence key={i} from={starts[i]} durationInFrames={len}>
          <Fade len={len}><S s={s} spec={spec} vo={s.frames} /></Fade>
          <Sequence from={LEAD}><Audio src={staticFile(`xray/${spec.id}/vo/${String(i + 1).padStart(2, "0")}.mp3`)} /></Sequence>
          <Sequence from={0}><Audio src={staticFile(`aiu2/${i === 0 ? "swell" : s.type === "xray" ? "swell" : s.type === "recap" || s.type === "outro" ? "chime" : s.type === "troll" ? "pop" : "whoosh"}.mp3`)} volume={0.15} /></Sequence>
        </Sequence>); })}
      {/* bottom strip: brand · subtitle · lesson */}
      <div style={{ position: "absolute", left: 44, bottom: 24, display: "flex", alignItems: "center", gap: 12 }}><Img src={staticFile(inX ? "academy/_brand/aiu-logo-dark.svg" : "academy/_brand/aiu-logo.svg")} style={{ height: 30 }} /><span style={{ fontFamily: BN, fontSize: 22, color: inX ? C.xmute : C.faint }}>{spec.course}</span></div>
      <div style={{ position: "absolute", right: 44, bottom: 28, fontFamily: BN, fontSize: 22, color: inX ? C.xmute : C.faint }}>{spec.lessonNo} · এআই কণ্ঠ</div>
      {cur && <div style={{ position: "absolute", left: 0, right: 0, bottom: 72, display: "flex", justifyContent: "center", opacity: interpolate(f, [cur.from, cur.from + 5, cur.to, cur.to + 4], [0, 1, 1, 0], clamp) }}><div style={{ maxWidth: 1300, padding: "8px 26px", borderRadius: 12, background: "rgba(1,24,53,.88)", border: "1px solid rgba(92,225,255,.18)", fontFamily: BN, fontSize: 32, fontWeight: 500, color: "#fff", textAlign: "center", lineHeight: 1.35 }}>{cur.s.replace(/[।,]$/, "")}</div></div>}
      <Audio src={staticFile("aiu2/music.mp3")} volume={(fr) => 0.07 * interpolate(fr, [0, 30, total - 60, total], [0, 1, 1, 0], clamp)} />
    </AbsoluteFill>
  );
};
