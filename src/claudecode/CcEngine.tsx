// AI University — "Claude Code মাস্টারক্লাস — জিরো টু হিরো" lesson engine (2026-11-16).
// A premium "night studio" look: warm near-black stage, clay/teal/violet light, glass cards, slow camera drift.
// The star is `cli`: a replay of a REAL Claude Code session (headless `claude -p --output-format stream-json`
// transcript → events) — prompt typing, thinking spinner with a live token meter, tool-call cards, a permission
// dialog, a red/green diff, Claude's final answer and the real cost line. Nothing in a replay is invented.
// Scenes: myth · title · points · loop · surfaces · cost · compare · hub · sessions · secret · thanks · cli ·
//         browser · prompt · recap · outro · quizQ · quizA
// Not an official Anthropic product or course: no official logos; Claude / Claude Code are Anthropic trademarks.
import React from "react";
import { AbsoluteFill, Audio, Img, Sequence, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig, Easing, delayRender, continueRender } from "remotion";
import {
  Terminal, Monitor, Globe, Code2, Sparkles, Brain, Wrench, CheckCircle2, XCircle, MessageSquare, FileText, Search, Pencil,
  Coins, Wallet, Gauge, Server, Clapperboard, Bot, Layers, Moon, Sun, Lock, ShieldCheck, Lightbulb, Heart, Rocket,
  BookOpen, Cpu, Zap, Database, GitBranch, Users, FolderOpen, Undo2, KeyRound, Eye, Star, ArrowRight, Smartphone,
} from "lucide-react";

/* ---------------- theme ---------------- */
const C = {
  bg0: "#08070A", bg1: "#100E12", ink: "#F5EFE6", mute: "#B4AAA0", faint: "#776E68", line: "#2B2622", line2: "#1E1A18",
  clay: "#E8865E", clay2: "#C9663F", teal: "#5FD0BC", violet: "#A994FF", gold: "#F3C661", red: "#FF6F6F", green: "#62D98B",
  blue: "#7DB4FF", glass: "rgba(255,248,240,.045)", glassLine: "rgba(255,240,225,.10)",
  term: "#0D0C0E", termHead: "#18161A",
};
const BN = "Anek", MONO = "JBM, Anek, 'DejaVu Sans Mono', monospace", UI = "Manrope, Anek, Arial, sans-serif";
if (typeof document !== "undefined") {
  for (const [fam, file, w] of [["Anek", "fonts/AnekBangla.ttf", "100 900"], ["Manrope", "fonts/Manrope-700.ttf", "100 900"], ["JBM", "fonts/JetBrainsMono-Regular.ttf", "400"], ["JBM", "fonts/JetBrainsMono-Bold.ttf", "700"]] as const) {
    const h = delayRender("font " + fam + w);
    const f = new FontFace(fam, `url(${staticFile(file)})`, { weight: w });
    f.load().then(() => { document.fonts.add(f); continueRender(h); }).catch(() => continueRender(h));
  }
}
const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const ease = Easing.bezier(0.16, 1, 0.3, 1);
const bn = (n: number | string) => String(n).replace(/\d/g, (d) => "০১২৩৪৫৬৭৮৯"[+d]);
const pop = (f: number, fps: number, d: number, damping = 13) => spring({ frame: f - d, fps, config: { damping, mass: 0.7 } });
const io = (f: number, a: number, b: number, from = 0, to = 1) => interpolate(f, [a, b], [from, to], { ...clamp, easing: ease });
const ICO: Record<string, React.FC<any>> = { terminal: Terminal, monitor: Monitor, globe: Globe, code: Code2, spark: Sparkles, brain: Brain, wrench: Wrench, check: CheckCircle2, x: XCircle, chat: MessageSquare, file: FileText, search: Search, edit: Pencil, coins: Coins, wallet: Wallet, gauge: Gauge, server: Server, video: Clapperboard, bot: Bot, layers: Layers, moon: Moon, sun: Sun, lock: Lock, shield: ShieldCheck, bulb: Lightbulb, heart: Heart, rocket: Rocket, book: BookOpen, cpu: Cpu, zap: Zap, db: Database, git: GitBranch, users: Users, folder: FolderOpen, undo: Undo2, key: KeyRound, eye: Eye, star: Star, phone: Smartphone };
const Ico: React.FC<{ n?: string; size?: number; color?: string }> = ({ n, size = 28, color = C.ink }) => { const I = ICO[n || "spark"] || Sparkles; return <I size={size} color={color} strokeWidth={1.8} />; };

export type Scene = { type: string; vo: string; frames: number; hold?: number; [k: string]: any };
export type Spec = { id: string; course: string; lessonNo: string; module?: string; title: string; next: string; scenes: Scene[] };
const LEAD = 12, TAIL = 16;
const sceneLen = (s: Scene) => LEAD + s.frames + (s.hold || 0) + TAIL;
export const ccLen = (spec: Spec) => spec.scenes.reduce((n, s) => n + sceneLen(s), 0) + 30;
type P = { s: Scene; spec: Spec; vo: number };
const v = (p: P, x: number) => LEAD + p.vo * x;

/* ---------------- stage ---------------- */
const Stage: React.FC = () => {
  const f = useCurrentFrame();
  const a = f / 30;
  return (
    <AbsoluteFill style={{ background: C.bg0, overflow: "hidden" }}>
      <div style={{ position: "absolute", width: 1500, height: 1500, left: -420 + Math.sin(a * 0.13) * 80, top: -820 + Math.cos(a * 0.11) * 60, borderRadius: "50%", background: "radial-gradient(circle, rgba(232,134,94,.20), transparent 62%)" }} />
      <div style={{ position: "absolute", width: 1300, height: 1300, right: -520 + Math.cos(a * 0.09) * 90, bottom: -760 + Math.sin(a * 0.12) * 70, borderRadius: "50%", background: "radial-gradient(circle, rgba(95,208,188,.12), transparent 62%)" }} />
      <div style={{ position: "absolute", width: 900, height: 900, left: 700 + Math.sin(a * 0.07) * 120, top: 300, borderRadius: "50%", background: "radial-gradient(circle, rgba(169,148,255,.07), transparent 65%)" }} />
      <AbsoluteFill style={{ backgroundImage: "radial-gradient(rgba(255,240,225,.07) 1px, transparent 1.2px)", backgroundSize: "34px 34px", maskImage: "radial-gradient(1100px 650px at 50% 45%, #000 20%, transparent 80%)" }} />
      <AbsoluteFill style={{ background: "radial-gradient(1500px 900px at 50% 50%, transparent 55%, rgba(0,0,0,.55) 100%)" }} />
    </AbsoluteFill>
  );
};
const Glass: React.FC<{ children: React.ReactNode; style?: React.CSSProperties; glow?: string }> = ({ children, style, glow }) => (
  <div style={{ background: `linear-gradient(160deg, rgba(255,248,240,.07), rgba(255,248,240,.025))`, border: `1px solid ${C.glassLine}`, borderRadius: 26, boxShadow: `0 30px 80px rgba(0,0,0,.45), inset 0 1px 0 rgba(255,255,255,.06)${glow ? `, 0 0 70px ${glow}22` : ""}`, ...style }}>{children}</div>
);
const Kicker: React.FC<{ t: string; c?: string }> = ({ t, c = C.clay }) => (
  <div style={{ display: "inline-flex", alignItems: "center", gap: 12, fontFamily: BN, fontSize: 27, fontWeight: 600, color: c, marginBottom: 14 }}>
    <span style={{ width: 34, height: 3, borderRadius: 3, background: c, boxShadow: `0 0 14px ${c}` }} />{t}
  </div>
);
const H: React.FC<{ children: React.ReactNode; size?: number; style?: React.CSSProperties }> = ({ children, size = 62, style }) => (
  <div style={{ fontFamily: BN, fontSize: size, fontWeight: 700, color: C.ink, lineHeight: 1.22, ...style }}>{children}</div>
);
// gentle camera: each scene breathes in a little
const Cam: React.FC<{ len: number; children: React.ReactNode }> = ({ len, children }) => {
  const f = useCurrentFrame();
  const s = interpolate(f, [0, len], [1.0, 1.025]);
  const o = Math.min(io(f, 0, 10), interpolate(f, [len - 10, len], [1, 0], clamp));
  const y = io(f, 0, 14, 18, 0);
  return <AbsoluteFill style={{ opacity: o, transform: `translateY(${y}px) scale(${s})` }}>{children}</AbsoluteFill>;
};
const Area: React.FC<{ children: React.ReactNode; style?: React.CSSProperties }> = ({ children, style }) => (
  <div style={{ position: "absolute", left: 130, right: 130, top: 120, bottom: 170, display: "flex", flexDirection: "column", ...style }}>{children}</div>
);

/* ---------------- myth (the funny hook) ---------------- */
const SMyth: React.FC<P> = (p) => {
  const f = useCurrentFrame(); const { fps } = useVideoConfig();
  const tilt = interpolate(f, [v(p, 0.18), v(p, 0.32)], [0, -9], { ...clamp, easing: ease }) + Math.sin(f / 9) * 0.6;
  const stampAt = Math.round(v(p, 0.52)), askAt = v(p, 0.72);
  const st = pop(f, fps, stampAt, 9);
  return (
    <Area style={{ alignItems: "center", textAlign: "center" }}>
      <Kicker t={p.s.kicker || "বাংলাদেশের নতুন ট্রেন্ড 😄"} c={C.gold} />
      <H size={82} style={{ opacity: io(f, 4, 18), transform: `scale(${io(f, 4, 18, 0.92, 1)})` }}>
        “{p.s.head}”
      </H>
      {/* balance: rice vs laptop */}
      <div style={{ position: "relative", width: 900, height: 330, marginTop: 30 }}>
        <div style={{ position: "absolute", left: 445, top: 70, width: 10, height: 230, background: `linear-gradient(${C.gold}, ${C.clay2})`, borderRadius: 6 }} />
        <div style={{ position: "absolute", left: 360, top: 285, width: 180, height: 22, background: C.clay2, borderRadius: 12 }} />
        <div style={{ position: "absolute", left: 90, top: 60, width: 720, height: 10, background: C.gold, borderRadius: 6, transformOrigin: "360px 5px", transform: `rotate(${tilt}deg)`, boxShadow: `0 0 20px ${C.gold}66` }}>
          {[{ x: 0, e: "🍚", t: p.s.left || "এক বেলার ভাত" }, { x: 560, e: "💻", t: p.s.right || "Claude" }].map((b, i) => (
            <div key={i} style={{ position: "absolute", left: b.x - 20, top: 10, width: 200, transform: `rotate(${-tilt}deg)`, transformOrigin: "100px 0", textAlign: "center" }}>
              <div style={{ height: 80, borderLeft: `2px solid ${C.gold}88`, borderRight: `2px solid ${C.gold}88`, margin: "0 50px" }} />
              <div style={{ background: "rgba(243,198,97,.12)", border: `2px solid ${C.gold}`, borderRadius: 18, padding: "10px 0", transform: `scale(${pop(f, fps, 8 + i * 8)})` }}>
                <div style={{ fontSize: 66 }}>{b.e}</div>
                <div style={{ fontFamily: BN, fontSize: 26, color: C.ink }}>{b.t}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
      {f >= stampAt && <div style={{ position: "absolute", right: 10, top: 150, transform: `rotate(-11deg) scale(${interpolate(st, [0, 1], [2.4, 1])})`, opacity: Math.min(1, st * 1.4), border: `5px solid ${C.red}`, color: C.red, borderRadius: 16, padding: "12px 26px", fontFamily: BN, fontSize: 34, fontWeight: 800, background: "rgba(255,111,111,.08)", maxWidth: 420, lineHeight: 1.25 }}>{p.s.stamp || "মজা করে বলা! না খেয়ে থাকবেন না 🙏"}</div>}
      <div style={{ marginTop: 10, fontFamily: BN, fontSize: 52, fontWeight: 700, color: C.clay, opacity: io(f, askAt, askAt + 12), transform: `translateY(${io(f, askAt, askAt + 12, 20, 0)}px)` }}>{p.s.ask}</div>
    </Area>
  );
};

/* ---------------- title ---------------- */
const STitle: React.FC<P> = (p) => {
  const f = useCurrentFrame(); const { fps } = useVideoConfig();
  const chips: string[] = p.s.chips || [];
  return (
    <Area style={{ justifyContent: "center" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 22, opacity: io(f, 2, 14) }}>
        <div style={{ width: 96, height: 96, borderRadius: 26, background: "linear-gradient(140deg, #2A1A12, #120D0B)", border: `1.5px solid ${C.clay}`, display: "grid", placeItems: "center", boxShadow: `0 0 50px ${C.clay}55`, transform: `scale(${pop(f, fps, 2)}) rotate(${interpolate(pop(f, fps, 2), [0, 1], [-20, 0])}deg)` }}>
          <span style={{ fontFamily: MONO, fontSize: 52, fontWeight: 700, color: C.clay }}>&gt;_</span>
        </div>
        <div style={{ fontFamily: BN, fontSize: 30, color: C.teal, fontWeight: 600 }}>{p.s.kicker || p.spec.module}</div>
      </div>
      <div style={{ fontFamily: BN, fontSize: 92, fontWeight: 800, lineHeight: 1.14, margin: "26px 0 12px", backgroundImage: `linear-gradient(100deg, ${C.ink} 0%, ${C.ink} 40%, ${C.clay} 70%, ${C.gold} 100%)`, WebkitBackgroundClip: "text", color: "transparent", opacity: io(f, 8, 24), transform: `translateY(${io(f, 8, 24, 30, 0)}px)` }}>{p.s.title || p.spec.title}</div>
      {p.s.sub && <div style={{ fontFamily: BN, fontSize: 38, color: C.mute, opacity: io(f, 18, 30) }}>{p.s.sub}</div>}
      <div style={{ display: "flex", gap: 14, marginTop: 36, flexWrap: "wrap" }}>{chips.map((c, i) => { const at = v(p, 0.35 + i * 0.08); return <span key={i} style={{ fontFamily: BN, fontSize: 28, padding: "10px 24px", borderRadius: 999, background: C.glass, border: `1px solid ${C.glassLine}`, color: C.ink, opacity: io(f, at, at + 10), transform: `translateY(${io(f, at, at + 10, 14, 0)}px)` }}>{c}</span>; })}</div>
      {p.s.note && <div style={{ marginTop: 40, fontFamily: BN, fontSize: 24, color: C.faint, opacity: io(f, v(p, 0.6), v(p, 0.6) + 12) }}>{p.s.note}</div>}
    </Area>
  );
};

/* ---------------- points ---------------- */
const SPoints: React.FC<P> = (p) => {
  const f = useCurrentFrame(); const it: any[] = p.s.items || []; const acc = p.s.accent ? (C as any)[p.s.accent] || p.s.accent : C.clay;
  const grid = it.length >= 4 && !p.s.list;
  return (
    <Area>
      <Kicker t={p.s.tag || "মূল কথা"} c={acc} />
      <H size={60} style={{ marginBottom: 30 }}>{p.s.head}</H>
      <div style={{ display: "grid", gridTemplateColumns: grid ? "1fr 1fr" : "1fr", gap: 20, flex: 1, alignContent: "center" }}>
        {it.map((x, i) => { const [icon, t, d] = Array.isArray(x) ? x : [null, x, null]; const at = v(p, 0.06 + (0.66 * i) / Math.max(1, it.length));
          return (
            <Glass key={i} glow={acc} style={{ display: "flex", gap: 22, alignItems: "center", padding: "22px 26px", opacity: io(f, at, at + 12), transform: `translateY(${io(f, at, at + 12, 22, 0)}px)` }}>
              <div style={{ flex: "none", width: 64, height: 64, borderRadius: 18, background: `${acc}1A`, border: `1px solid ${acc}66`, display: "grid", placeItems: "center" }}>{icon ? <Ico n={icon} size={32} color={acc} /> : <span style={{ fontFamily: BN, fontSize: 30, fontWeight: 700, color: acc }}>{bn(i + 1)}</span>}</div>
              <div>
                <div style={{ fontFamily: BN, fontSize: 36, fontWeight: 600, color: C.ink, lineHeight: 1.3 }}>{t}</div>
                {d && <div style={{ fontFamily: BN, fontSize: 27, color: C.mute, lineHeight: 1.4, marginTop: 4 }}>{d}</div>}
              </div>
            </Glass>); })}
      </div>
    </Area>
  );
};

/* ---------------- loop (how the agent works) ---------------- */
const SLoop: React.FC<P> = (p) => {
  const f = useCurrentFrame(); const { fps } = useVideoConfig(); const nodes: any[] = p.s.nodes || [];
  const cx = 520, cy = 390, R = 260, n = nodes.length || 4;
  const pos = (i: number) => { const a = -Math.PI / 2 + (i * 2 * Math.PI) / n; return [cx + R * Math.cos(a), cy + R * Math.sin(a)]; };
  const start = v(p, 0.1), lap = Math.max(60, p.vo * 0.22);
  const t = Math.max(0, f - start) / lap; const ang = -Math.PI / 2 + t * 2 * Math.PI;
  const active = Math.floor(((t % 1) * n) + 0.0001) % n;
  return (
    <Area style={{ flexDirection: "row", gap: 40 }}>
      <div style={{ position: "relative", width: 1040, height: 800, flex: "none", marginTop: -10 }}>
        <svg width={1040} height={800} style={{ position: "absolute", inset: 0 }}>
          <defs><linearGradient id="lg" x1="0" x2="1"><stop offset="0" stopColor={C.clay} /><stop offset="1" stopColor={C.teal} /></linearGradient></defs>
          <circle cx={cx} cy={cy} r={R} fill="none" stroke="url(#lg)" strokeWidth={3} strokeDasharray="10 12" opacity={io(f, 4, 20) * 0.7} strokeDashoffset={-f * 1.2} />
          {f > start && <circle cx={cx + R * Math.cos(ang)} cy={cy + R * Math.sin(ang)} r={13} fill={C.gold} style={{ filter: `drop-shadow(0 0 16px ${C.gold})` }} />}
        </svg>
        <div style={{ position: "absolute", left: cx - 150, top: cy - 90, width: 300, height: 180, display: "grid", placeItems: "center", textAlign: "center" }}>
          <div style={{ transform: `scale(${pop(f, fps, 6)})` }}>
            <div style={{ fontFamily: MONO, fontSize: 44, color: C.clay, fontWeight: 700 }}>✻</div>
            <div style={{ fontFamily: BN, fontSize: 36, fontWeight: 700, color: C.ink, lineHeight: 1.2 }}>{p.s.center || "এজেন্ট লুপ"}</div>
          </div>
        </div>
        {nodes.map((nd, i) => { const [x, y] = pos(i); const at = 8 + i * 6; const on = f > start && i === active;
          return (
            <div key={i} style={{ position: "absolute", left: x - 125, top: y - 70, width: 250, padding: "16px 12px", borderRadius: 22, textAlign: "center", background: on ? "rgba(243,198,97,.14)" : "rgba(20,17,16,.92)", border: `2px solid ${on ? C.gold : C.glassLine}`, boxShadow: on ? `0 0 40px ${C.gold}55` : "0 18px 40px rgba(0,0,0,.5)", transform: `scale(${pop(f, fps, at) * (on ? 1.06 : 1)})` }}>
              <Ico n={nd.icon} size={36} color={on ? C.gold : C.teal} />
              <div style={{ fontFamily: BN, fontSize: 29, fontWeight: 700, color: C.ink, marginTop: 6, lineHeight: 1.2 }}>{nd.t}</div>
              {nd.d && <div style={{ fontFamily: MONO, fontSize: 17, color: C.mute, marginTop: 4 }}>{nd.d}</div>}
            </div>); })}
      </div>
      <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center", gap: 18 }}>
        <Kicker t={p.s.tag || "ভেতরে কী হয়"} c={C.teal} />
        <H size={50}>{p.s.head}</H>
        {(p.s.items || []).map((t: string, i: number) => { const at = v(p, 0.45 + i * 0.12); return <div key={i} style={{ fontFamily: BN, fontSize: 30, color: C.mute, lineHeight: 1.45, opacity: io(f, at, at + 10), display: "flex", gap: 12 }}><span style={{ color: C.gold }}>●</span>{t}</div>; })}
      </div>
    </Area>
  );
};

/* ---------------- surfaces (terminal · desktop · web · IDE) ---------------- */
const Mini: React.FC<{ k: string; f: number }> = ({ k, f }) => {
  const bar = (title: string, light = false) => (
    <div style={{ height: 34, display: "flex", alignItems: "center", gap: 7, padding: "0 12px", background: light ? "#E9E4DE" : C.termHead, borderBottom: `1px solid ${light ? "#D5CEC6" : C.line}` }}>
      {["#FF5F57", "#FEBC2E", "#28C840"].map((c) => <span key={c} style={{ width: 10, height: 10, borderRadius: "50%", background: c }} />)}
      <span style={{ marginLeft: 8, fontFamily: MONO, fontSize: 13, color: light ? "#6A625A" : C.mute }}>{title}</span>
    </div>
  );
  const type = (s: string, at: number) => s.slice(0, Math.max(0, Math.floor((f - at) / 2)));
  if (k === "terminal") return (<>{bar("~/my-shop")}<div style={{ padding: 16, fontFamily: MONO, fontSize: 19, color: C.ink, lineHeight: 1.6 }}><span style={{ color: C.teal }}>$ </span>{type("claude", 10)}<br /><span style={{ color: C.clay }}>✻ </span><span style={{ color: C.mute }}>{f > 30 ? "স্বাগতম! কী বানাবো?" : ""}</span><br /><span style={{ color: C.faint }}>&gt; </span>{type("একটা ওয়েবসাইট বানাও", 40)}</div></>);
  if (k === "desktop") return (<>{bar("ডেস্কটপ অ্যাপ")}<div style={{ display: "flex", height: 226 }}><div style={{ width: 90, background: "#141215", borderRight: `1px solid ${C.line}`, padding: 10 }}>{[0, 1, 2, 3].map((i) => <div key={i} style={{ height: 14, borderRadius: 5, background: i === 0 ? `${C.clay}88` : "#2A2528", marginBottom: 10 }} />)}</div><div style={{ flex: 1, padding: 14 }}><div style={{ marginLeft: "auto", width: "70%", background: "#2A2226", borderRadius: 12, padding: "8px 12px", fontFamily: BN, fontSize: 17, color: C.ink }}>লগইন পেজ ঠিক করো</div><div style={{ marginTop: 12, width: "80%", background: "#1A1719", border: `1px solid ${C.line}`, borderRadius: 12, padding: "8px 12px", fontFamily: MONO, fontSize: 14, color: C.teal }}>● Edit(login.js) ✓</div><div style={{ marginTop: 10, width: "56%", height: 12, borderRadius: 6, background: "#2A2528" }} /></div></div></>);
  if (k === "web") return (<>{bar("claude.ai/code", true)}<div style={{ background: "#F7F3EE", height: 226, padding: 16 }}><div style={{ fontFamily: BN, fontSize: 19, color: "#3A332D", fontWeight: 700 }}>ব্রাউজারেই কাজ</div><div style={{ marginTop: 10, display: "flex", gap: 8 }}>{["রিপো", "টাস্ক", "PR"].map((x, i) => <span key={i} style={{ fontFamily: BN, fontSize: 15, padding: "4px 12px", borderRadius: 8, background: i === 1 ? "#E8865E33" : "#E7E0D8", color: "#5A4F46" }}>{x}</span>)}</div><div style={{ marginTop: 14, height: 70, borderRadius: 10, background: "#fff", border: "1px solid #E1D9CF", padding: 10, fontFamily: MONO, fontSize: 13, color: "#7A6F65" }}>cloud session · running…<div style={{ marginTop: 8, height: 8, borderRadius: 4, background: "#EADFD3" }}><div style={{ width: `${Math.min(100, (f % 90) * 1.3)}%`, height: 8, borderRadius: 4, background: C.clay }} /></div></div></div></>);
  return (<>{bar("VS Code")}<div style={{ display: "flex", height: 226 }}><div style={{ flex: 1.4, padding: 12, fontFamily: MONO, fontSize: 14, lineHeight: 1.7, color: C.mute }}><div><span style={{ color: C.violet }}>function</span> <span style={{ color: C.blue }}>pay</span>() {"{"}</div><div style={{ background: "rgba(98,217,139,.12)", color: C.green }}>+  verify(trx)</div><div style={{ background: "rgba(255,111,111,.12)", color: C.red }}>-  return ok</div><div>{"}"}</div></div><div style={{ flex: 1, borderLeft: `1px solid ${C.line}`, padding: 10, background: "#121013" }}><div style={{ fontFamily: BN, fontSize: 14, color: C.clay, marginBottom: 6 }}>Claude প্যানেল</div><div style={{ fontFamily: BN, fontSize: 14, color: C.ink, background: "#221D20", borderRadius: 8, padding: 6 }}>এই বাগটা কেন?</div></div></div></>);
};
const SSurfaces: React.FC<P> = (p) => {
  const f = useCurrentFrame(); const { fps } = useVideoConfig();
  const items: any[] = p.s.items || [["terminal", "টার্মিনাল (CLI)", "সবচেয়ে শক্তিশালী"], ["desktop", "ডেস্কটপ অ্যাপ", "টার্মিনাল ছাড়াই"], ["web", "ওয়েব", "ক্লাউডে চলে"], ["ide", "VS Code / JetBrains", "এডিটরের ভেতরে"]];
  return (
    <Area>
      <Kicker t={p.s.tag || "কোথায় চালাবেন"} c={C.teal} />
      <H size={56} style={{ marginBottom: 26 }}>{p.s.head}</H>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 22, flex: 1, alignItems: "center" }}>
        {items.map(([k, t, d], i) => { const at = Math.round(v(p, 0.1 + i * 0.17)); const lf = f - at; const on = f > at;
          return (
            <div key={i} style={{ opacity: on ? 1 : 0.25, transform: `translateY(${interpolate(pop(f, fps, at), [0, 1], [40, 0])}px)` }}>
              <div style={{ height: 300, borderRadius: 16, overflow: "hidden", border: `1px solid ${on ? C.clay + "88" : C.line}`, background: C.term, boxShadow: on ? `0 24px 60px rgba(0,0,0,.6), 0 0 40px ${C.clay}22` : "none" }}><Mini k={k} f={lf} /></div>
              <div style={{ fontFamily: BN, fontSize: 31, fontWeight: 700, color: C.ink, marginTop: 16 }}>{t}</div>
              <div style={{ fontFamily: BN, fontSize: 24, color: C.mute }}>{d}</div>
            </div>); })}
      </div>
      {p.s.note && <div style={{ fontFamily: BN, fontSize: 26, color: C.gold, opacity: io(f, v(p, 0.8), v(p, 0.8) + 10) }}>💡 {p.s.note}</div>}
    </Area>
  );
};

/* ---------------- cost (plans vs API + relative model price) ---------------- */
const SCost: React.FC<P> = (p) => {
  const f = useCurrentFrame(); const models: any[] = p.s.models || []; const max = Math.max(...models.map((m) => m.x), 1);
  const cols: any[] = p.s.cols || [];
  return (
    <Area>
      <Kicker t={p.s.tag || "টাকার সত্য কথা"} c={C.gold} />
      <H size={54} style={{ marginBottom: 22 }}>{p.s.head}</H>
      <div style={{ display: "flex", gap: 22 }}>
        {cols.map((c, i) => { const at = v(p, 0.06 + i * 0.14); const col = i ? C.teal : C.clay;
          return (
            <Glass key={i} glow={col} style={{ flex: 1, padding: "22px 28px", opacity: io(f, at, at + 12), transform: `translateY(${io(f, at, at + 12, 20, 0)}px)` }}>
              <div style={{ display: "flex", alignItems: "center", gap: 14 }}><Ico n={c.icon || (i ? "gauge" : "wallet")} size={34} color={col} /><span style={{ fontFamily: BN, fontSize: 36, fontWeight: 700, color: col }}>{c.t}</span></div>
              {(c.items || []).map((x: string, j: number) => <div key={j} style={{ fontFamily: BN, fontSize: 26, color: C.ink, marginTop: 10, lineHeight: 1.4 }}>▸ {x}</div>)}
            </Glass>); })}
      </div>
      {models.length > 0 && <Glass style={{ marginTop: 22, padding: "22px 30px", flex: 1, display: "flex", flexDirection: "column", justifyContent: "center", opacity: io(f, v(p, 0.4), v(p, 0.4) + 12) }}>
        <div style={{ fontFamily: BN, fontSize: 26, color: C.mute, marginBottom: 12 }}>{p.s.barsHead || "একই কাজ, কোন মডেলে কত গুণ খরচ (API, তুলনা)"}</div>
        {models.map((m, i) => { const at = v(p, 0.45 + i * 0.09); const w = interpolate(f, [at, at + 22], [0, (m.x / max) * 100], { ...clamp, easing: ease }); const col = [C.green, C.teal, C.clay, C.violet][i % 4];
          return (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: 18, margin: "8px 0" }}>
              <span style={{ width: 210, fontFamily: UI, fontSize: 27, color: C.ink }}>{m.n}</span>
              <div style={{ flex: 1, height: 34, background: "rgba(255,255,255,.05)", borderRadius: 10, overflow: "hidden" }}><div style={{ width: `${Math.max(w, 0.8)}%`, height: "100%", borderRadius: 10, background: `linear-gradient(90deg, ${col}AA, ${col})`, boxShadow: `0 0 18px ${col}66` }} /></div>
              <span style={{ width: 150, fontFamily: BN, fontSize: 28, fontWeight: 700, color: col, textAlign: "right" }}>{m.label || bn(m.x) + " গুণ"}</span>
            </div>); })}
        {p.s.src && <div style={{ fontFamily: BN, fontSize: 19, color: C.faint, marginTop: 8 }}>{p.s.src}</div>}
      </Glass>}
    </Area>
  );
};

/* ---------------- compare (two columns) ---------------- */
const SCompare: React.FC<P> = (p) => {
  const f = useCurrentFrame(); const L = p.s.left || {}, R = p.s.right || {};
  const Col: React.FC<{ d: any; a: string; icon: string; at: number }> = ({ d, a, icon, at }) => (
    <Glass glow={a} style={{ flex: 1, padding: "28px 30px", border: `1.5px solid ${a}66`, opacity: io(f, at, at + 12), transform: `translateY(${io(f, at, at + 12, 24, 0)}px)` }}>
      <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 16 }}><div style={{ width: 58, height: 58, borderRadius: 16, background: `${a}1C`, display: "grid", placeItems: "center" }}><Ico n={d.icon || icon} size={32} color={a} /></div><div style={{ fontFamily: BN, fontSize: 36, fontWeight: 700, color: a }}>{d.title}</div></div>
      {(d.items || []).map((t: string, i: number) => { const t2 = at + 14 + i * 10; return <div key={i} style={{ display: "flex", gap: 12, margin: "12px 0", fontFamily: BN, fontSize: 29, color: C.ink, lineHeight: 1.4, opacity: io(f, t2, t2 + 8) }}><span style={{ color: a }}>▸</span>{t}</div>; })}
    </Glass>
  );
  return (
    <Area>
      <Kicker t={p.s.tag || "সৎ উত্তর"} c={C.gold} />
      <H size={54} style={{ marginBottom: 24 }}>{p.s.head}</H>
      <div style={{ display: "flex", gap: 24, flex: 1 }}>
        <Col d={L} a={(C as any)[L.c] || C.green} icon="check" at={v(p, 0.12)} />
        <Col d={R} a={(C as any)[R.c] || C.gold} icon="bulb" at={v(p, 0.45)} />
      </div>
    </Area>
  );
};

/* ---------------- hub (AI University case study) ---------------- */
const SHub: React.FC<P> = (p) => {
  const f = useCurrentFrame(); const { fps } = useVideoConfig(); const nodes: any[] = p.s.nodes || [];
  const W = 1660, Hh = 680, cx = W / 2, cy = 330;
  const pos = nodes.map((_, i) => { const a = -Math.PI / 2 + (i * 2 * Math.PI) / nodes.length; return [cx + 620 * Math.cos(a), cy + 245 * Math.sin(a)]; });
  return (
    <AbsoluteFill>
      <div style={{ position: "absolute", left: 130, top: 96 }}><Kicker t={p.s.tag || "বাস্তব কেস স্টাডি"} c={C.teal} /><H size={50}>{p.s.head}</H></div>
      <div style={{ position: "absolute", left: 130, top: 236, width: W, height: Hh }}>
        <svg width={W} height={Hh} style={{ position: "absolute", inset: 0, overflow: "visible" }}>
          {pos.map(([x, y], i) => { const at = v(p, 0.1 + (0.7 * i) / nodes.length); const k = io(f, at, at + 14); const tt = ((f - at) % 50) / 50;
            return (<g key={i} opacity={k}>
              <line x1={cx} y1={cy} x2={cx + (x - cx) * k} y2={cy + (y - cy) * k} stroke={C.clay} strokeOpacity={0.45} strokeWidth={2} strokeDasharray="6 8" />
              {f > at + 14 && <circle cx={cx + (x - cx) * tt} cy={cy + (y - cy) * tt} r={6} fill={C.gold} style={{ filter: `drop-shadow(0 0 10px ${C.gold})` }} />}
            </g>); })}
        </svg>
        <div style={{ position: "absolute", left: cx - 150, top: cy - 92, width: 300, height: 184, borderRadius: 30, display: "grid", placeItems: "center", textAlign: "center", background: "linear-gradient(150deg, #2C1B13, #120D0B)", border: `2px solid ${C.clay}`, boxShadow: `0 0 ${50 + Math.sin(f / 10) * 18}px ${C.clay}66`, transform: `scale(${pop(f, fps, 4)})` }}>
          <div><div style={{ fontFamily: MONO, fontSize: 42, color: C.clay, fontWeight: 700 }}>&gt;_ ✻</div><div style={{ fontFamily: UI, fontSize: 34, fontWeight: 800, color: C.ink }}>{p.s.center || "Claude Code"}</div></div>
        </div>
        {nodes.map((nd, i) => { const [x, y] = pos[i]; const at = Math.round(v(p, 0.1 + (0.7 * i) / nodes.length) + 8);
          return (
            <div key={i} style={{ position: "absolute", left: x - 175, top: y - 72, width: 350, padding: "16px 18px", borderRadius: 20, background: "rgba(22,19,18,.94)", border: `1px solid ${C.glassLine}`, boxShadow: "0 20px 50px rgba(0,0,0,.55)", display: "flex", gap: 14, alignItems: "center", transform: `scale(${pop(f, fps, at)})` }}>
              <div style={{ flex: "none", width: 56, height: 56, borderRadius: 16, background: `${C.teal}1A`, display: "grid", placeItems: "center" }}><Ico n={nd.icon} size={30} color={C.teal} /></div>
              <div><div style={{ fontFamily: BN, fontSize: 27, fontWeight: 700, color: C.ink, lineHeight: 1.2 }}>{nd.t}</div>{nd.d && <div style={{ fontFamily: BN, fontSize: 21, color: C.gold, marginTop: 3 }}>{nd.d}</div>}</div>
            </div>); })}
      </div>
    </AbsoluteFill>
  );
};

/* ---------------- sessions (many agents overnight) ---------------- */
const SSessions: React.FC<P> = (p) => {
  const f = useCurrentFrame(); const { fps } = useVideoConfig(); const ss: any[] = p.s.sessions || [];
  const hour = Math.floor(interpolate(f, [LEAD, LEAD + p.vo], [23, 30], clamp)) % 24;
  const night = hour >= 23 || hour < 5;
  return (
    <Area>
      <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between" }}>
        <div><Kicker t={p.s.tag || "একসাথে অনেক এজেন্ট"} c={C.violet} /><H size={52}>{p.s.head}</H></div>
        <Glass style={{ padding: "12px 24px", display: "flex", alignItems: "center", gap: 14 }}>{night ? <Moon size={34} color={C.violet} /> : <Sun size={34} color={C.gold} />}<span style={{ fontFamily: MONO, fontSize: 40, color: C.ink }}>{String(hour).padStart(2, "0")}:{String(Math.floor((f * 7) % 60)).padStart(2, "0")}</span></Glass>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 18, marginTop: 26, flex: 1 }}>
        {ss.map((s, i) => { const at = 6 + i * 5; const logs: string[] = s.log || []; const shown = Math.min(logs.length, Math.max(0, Math.floor((f - at - 10) / (p.vo / (logs.length + 2)))) + 1); const done = shown >= logs.length && f > LEAD + p.vo * 0.85;
          return (
            <div key={i} style={{ borderRadius: 16, overflow: "hidden", background: C.term, border: `1px solid ${done ? C.green + "88" : C.line}`, transform: `scale(${pop(f, fps, at)})`, display: "flex", flexDirection: "column" }}>
              <div style={{ height: 40, background: C.termHead, display: "flex", alignItems: "center", gap: 10, padding: "0 14px" }}>
                <span style={{ width: 10, height: 10, borderRadius: "50%", background: done ? C.green : C.clay, boxShadow: `0 0 10px ${done ? C.green : C.clay}`, opacity: done ? 1 : 0.5 + 0.5 * Math.sin(f / 4 + i) }} />
                <span style={{ fontFamily: MONO, fontSize: 18, color: C.ink }}>{s.name}</span>
                <span style={{ marginLeft: "auto", fontFamily: BN, fontSize: 16, color: done ? C.green : C.mute }}>{done ? "সম্পন্ন ✓" : "কাজ চলছে…"}</span>
              </div>
              <div style={{ padding: "10px 14px", fontFamily: MONO, fontSize: 16, lineHeight: 1.6, color: C.mute, flex: 1 }}>
                <div style={{ fontFamily: BN, fontSize: 19, color: C.gold, marginBottom: 4 }}>{s.task}</div>
                {logs.slice(0, shown).map((l, j) => <div key={j}><span style={{ color: C.teal }}>● </span>{l}</div>)}
              </div>
            </div>); })}
      </div>
      {p.s.note && <div style={{ marginTop: 14, fontFamily: BN, fontSize: 25, color: C.mute }}>{p.s.note}</div>}
    </Area>
  );
};

/* ---------------- secret (TOP SECRET card) ---------------- */
const SSecret: React.FC<P> = (p) => {
  const f = useCurrentFrame(); const { fps } = useVideoConfig();
  const open = io(f, v(p, 0.12), v(p, 0.26));
  const stamp = pop(f, fps, 6, 8);
  return (
    <AbsoluteFill style={{ alignItems: "center", justifyContent: "center" }}>
      <div style={{ position: "absolute", inset: 0, background: `radial-gradient(900px 500px at 50% 50%, rgba(255,111,111,${0.10 + 0.04 * Math.sin(f / 7)}), transparent 70%)` }} />
      <div style={{ position: "relative", width: 1380, height: 720, marginTop: -40 }}>
        {/* folder back */}
        <div style={{ position: "absolute", inset: 0, borderRadius: 26, background: "linear-gradient(160deg, #3A2A1C, #22180F)", border: "1px solid #5A4430", boxShadow: "0 50px 120px rgba(0,0,0,.7)" }} />
        <div style={{ position: "absolute", left: 40, top: -36, width: 300, height: 60, borderRadius: "16px 16px 0 0", background: "#3A2A1C", border: "1px solid #5A4430", borderBottom: "none" }} />
        {/* card sliding out */}
        <div style={{ position: "absolute", left: 70, right: 70, top: 60, bottom: 50, borderRadius: 18, background: "linear-gradient(170deg, #FBF5EA, #EFE5D4)", transform: `translateY(${interpolate(open, [0, 1], [440, -20])}px) rotate(${interpolate(open, [0, 1], [3, -0.6])}deg)`, padding: "44px 56px", boxShadow: "0 30px 70px rgba(0,0,0,.45)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 14, fontFamily: MONO, fontSize: 24, color: "#9A3B2A", fontWeight: 700 }}><Lock size={26} color="#9A3B2A" /> {p.s.code || "FILE #০০১"} · শুধু AI University-র ছাত্রদের জন্য</div>
          <div style={{ fontFamily: BN, fontSize: 60, fontWeight: 800, color: "#1E1712", marginTop: 18, lineHeight: 1.2 }}>{p.s.head}</div>
          <div style={{ fontFamily: BN, fontSize: 34, color: "#4A3E34", marginTop: 18, lineHeight: 1.5, opacity: io(f, v(p, 0.32), v(p, 0.32) + 12) }}>{p.s.text}</div>
          {p.s.cmd && <div style={{ marginTop: 26, display: "inline-flex", alignItems: "center", gap: 14, background: "#1A1614", color: C.gold, fontFamily: MONO, fontSize: 34, padding: "14px 26px", borderRadius: 14, opacity: io(f, v(p, 0.5), v(p, 0.5) + 10), transform: `scale(${io(f, v(p, 0.5), v(p, 0.5) + 10, 0.9, 1)})` }}><span style={{ color: C.teal }}>›</span>{p.s.cmd}</div>}
          {p.s.why && <div style={{ marginTop: 22, fontFamily: BN, fontSize: 27, color: "#7A5A3A", opacity: io(f, v(p, 0.66), v(p, 0.66) + 10) }}>🔍 {p.s.why}</div>}
        </div>
        {/* folder front lip */}
        <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: 120, borderRadius: "0 0 26px 26px", background: "linear-gradient(180deg, #4A3523, #2E2015)", borderTop: "1px solid #6A5038", opacity: 1 - open * 0.0 }} />
        {/* stamp */}
        <div style={{ position: "absolute", right: -30, top: -60, transform: `rotate(-12deg) scale(${interpolate(stamp, [0, 1], [2.6, 1])})`, opacity: Math.min(1, stamp * 1.5), border: `6px solid ${C.red}`, borderRadius: 14, padding: "8px 30px", color: C.red, fontFamily: UI, fontSize: 64, fontWeight: 800, letterSpacing: 6, background: "rgba(20,8,8,.55)", textShadow: `0 0 20px ${C.red}88` }}>TOP SECRET</div>
      </div>
    </AbsoluteFill>
  );
};

/* ---------------- thanks ---------------- */
const SThanks: React.FC<P> = (p) => {
  const f = useCurrentFrame(); const { fps } = useVideoConfig();
  return (
    <Area style={{ alignItems: "center", justifyContent: "center", textAlign: "center" }}>
      {Array.from({ length: 14 }).map((_, i) => { const x = (i * 137) % 1660, sp = 0.6 + (i % 5) * 0.25; const y = 700 - ((f * sp * 2 + i * 60) % 820); return <div key={i} style={{ position: "absolute", left: x, top: y, fontSize: 26 + (i % 3) * 10, opacity: 0.35, color: [C.clay, C.gold, C.teal][i % 3] }}>{["♥", "✻", "✦"][i % 3]}</div>; })}
      <div style={{ transform: `scale(${pop(f, fps, 4)})`, fontSize: 90 }}>🙏</div>
      <div style={{ fontFamily: BN, fontSize: 84, fontWeight: 800, color: C.ink, margin: "12px 0", backgroundImage: `linear-gradient(90deg, ${C.gold}, ${C.clay})`, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>{p.s.head}</div>
      <Glass style={{ padding: "26px 40px", maxWidth: 1300, opacity: io(f, v(p, 0.2), v(p, 0.2) + 14) }}>
        <div style={{ fontFamily: BN, fontSize: 36, color: C.ink, lineHeight: 1.5 }}>“{p.s.quote}”</div>
        {p.s.by && <div style={{ fontFamily: BN, fontSize: 26, color: C.mute, marginTop: 12 }}>— {p.s.by}</div>}
      </Glass>
      {p.s.note && <div style={{ fontFamily: BN, fontSize: 24, color: C.faint, marginTop: 26, maxWidth: 1200, lineHeight: 1.45, opacity: io(f, v(p, 0.6), v(p, 0.6) + 12) }}>{p.s.note}</div>}
    </Area>
  );
};

/* ---------------- cli (REAL session replay — the star) ---------------- */
type Ev = { k: string; s?: string; [x: string]: any };
const evWeight = (e: Ev) => {
  switch (e.k) {
    case "banner": return 10; case "user": return Math.max(16, (e.s || "").length * 0.55) + 10; case "shell": return Math.max(14, (e.s || "").length * 0.9) + 8 + (e.out?.length || 0) * 5;
    case "think": return e.w || 18; case "tool": return 16; case "perm": return 30; case "diff": return 14 + (e.lines?.length || 0) * 3.4;
    case "text": return Math.max(16, (e.s || "").length * 0.2); case "cost": return 10; default: return 10;
  }
};
const SCli: React.FC<P> = (p) => {
  const f = useCurrentFrame(); const { fps } = useVideoConfig();
  const evs: Ev[] = p.s.events || [];
  // event start times: a `cue` (words from the narration) pins the event to the moment the voice says them;
  // the rest are spread by weight between their pinned neighbours
  const vo = p.s.vo || ""; const END = LEAD + p.vo * 0.97;
  const pin: (number | null)[] = evs.map((e, i) => i === 0 ? LEAD : e.cue && vo.indexOf(e.cue) >= 0 ? LEAD + p.vo * (vo.indexOf(e.cue) / vo.length) : null);
  for (let i = 0; i < evs.length; i++) if (pin[i] === null) {
    let j = i; while (j < evs.length && pin[j] === null) j++;
    const a0 = pin[i - 1] as number, a1 = j < evs.length ? (pin[j] as number) : END;
    const ws = evs.slice(i - 1, j).map(evWeight); const tot = ws.reduce((x, y) => x + y, 0) || 1;
    let acc2 = ws[0]; for (let k = i; k < j; k++) { pin[k] = a0 + (a1 - a0) * (acc2 / tot); acc2 += ws[k - i + 1]; }
  }
  const rows = evs.map((e, i) => { const a = pin[i] as number; const b = i + 1 < evs.length ? Math.max(a + 6, pin[i + 1] as number) : Math.max(a + 10, END); return { e, a, b, t: interpolate(f, [a, b], [0, 1], clamp) }; });
  const shown = rows.filter((r) => f >= r.a);
  const caret = Math.floor(f / 8) % 2 === 0;
  const last = shown[shown.length - 1];
  const permRow = rows.find((r) => r.e.k === "perm" && f >= r.a && f < r.b + 6);
  // live token meter: counts up to the real usage numbers given in the spec
  const tok = p.s.tokens ? Math.round(p.s.tokens * interpolate(f, [LEAD, LEAD + p.vo * 0.9], [0, 1], clamp)) : 0;
  const zoom = 1;
  const render = (r: typeof rows[0], i: number) => {
    const e = r.e;
    if (e.k === "banner") return (
      <div key={i} style={{ border: `1.5px solid ${C.clay}`, borderRadius: 12, padding: "14px 22px", marginBottom: 14, display: "flex", gap: 24, alignItems: "center", opacity: io(f, r.a, r.a + 8) }}>
        <span style={{ color: C.clay, fontSize: 40 }}>✻</span>
        <div><div style={{ color: C.ink, fontWeight: 700 }}>{e.s || "Welcome to Claude Code!"}</div><div style={{ color: C.mute, fontSize: 21 }}>{e.sub}</div></div>
      </div>);
    if (e.k === "user" || e.k === "shell") {
      const s = e.s || ""; const typeEnd = r.a + (r.b - r.a) * (e.k === "shell" && e.out ? 0.5 : 0.8); const n = Math.round(s.length * interpolate(f, [r.a, typeEnd], [0, 1], clamp)); const typing = n < s.length;
      const outN = e.out ? Math.floor(e.out.length * interpolate(f, [typeEnd + 4, r.b], [0, 1], clamp)) : 0;
      return (
        <div key={i} style={{ marginTop: 12 }}>
          {e.k === "user"
            ? <div style={{ background: "rgba(255,255,255,.05)", borderLeft: `3px solid ${C.faint}`, padding: "8px 14px", borderRadius: 6 }}><span style={{ color: C.mute }}>&gt; </span><span style={{ fontFamily: BN, color: C.ink }}>{s.slice(0, n)}</span>{typing && <span style={{ color: C.clay, opacity: caret ? 1 : 0.15 }}>▋</span>}</div>
            : <div><span style={{ color: C.teal }}>{e.ps || "PS C:\\Users\\ami>"} </span><span style={{ color: C.ink }}>{s.slice(0, n)}</span>{typing && <span style={{ color: C.clay, opacity: caret ? 1 : 0.15 }}>▋</span>}</div>}
          {(e.out || []).slice(0, outN).map((o: string, j: number) => <div key={j} style={{ color: /✓|ok|\d+\.\d+/.test(o) ? C.green : C.mute, fontFamily: /[\u0980-\u09FF]/.test(o) ? BN : MONO }}>{o}</div>)}
        </div>);
    }
    if (e.k === "think") { const live = f < r.b; const glyph = "·✢✳✶✻✽"[Math.floor(f / 3) % 6];
      return <div key={i} style={{ marginTop: 12, color: C.clay, opacity: live ? 1 : 0.55 }}><span>{live ? glyph : "✻"} </span><span style={{ fontFamily: BN }}>{e.s || "ভাবছে…"}</span>{live && <span style={{ color: C.faint }}> ({bn(Math.round(interpolate(f, [r.a, r.b], [1, e.sec || 4], clamp)))}s · esc দিয়ে থামানো যায়)</span>}</div>; }
    if (e.k === "tool") { const done = f > r.a + (r.b - r.a) * 0.55;
      return (
        <div key={i} style={{ marginTop: 12, opacity: io(f, r.a, r.a + 6), transform: `translateX(${io(f, r.a, r.a + 6, -16, 0)}px)` }}>
          <div><span style={{ color: done ? C.green : C.ink, opacity: done ? 1 : caret ? 1 : 0.3 }}>● </span><span style={{ color: C.ink, fontWeight: 700 }}>{e.name}</span><span style={{ color: C.mute }}>({e.arg})</span>
            {e.label && <span style={{ marginLeft: 16, fontFamily: BN, fontSize: 21, padding: "2px 12px", borderRadius: 8, background: `${C.teal}22`, color: C.teal }}>{e.label}</span>}</div>
          {done && <div style={{ color: C.mute, paddingLeft: 28 }}>└  <span style={{ fontFamily: /[\u0980-\u09FF]/.test(e.res || "") ? BN : MONO }}>{e.res}</span></div>}
        </div>); }
    if (e.k === "diff") { const ln: any[] = e.lines || []; const nShow = Math.ceil(ln.length * interpolate(f, [r.a + 4, r.b - 6], [0, 1], clamp));
      return (
        <div key={i} style={{ marginTop: 8, marginLeft: 28, border: `1px solid ${C.line}`, borderRadius: 10, overflow: "hidden", opacity: io(f, r.a, r.a + 6) }}>
          <div style={{ background: C.termHead, padding: "4px 14px", fontSize: 19, color: C.mute }}>{e.file} <span style={{ color: C.green }}>+{ln.filter((x) => x.t === "add").length}</span> <span style={{ color: C.red }}>-{ln.filter((x) => x.t === "del").length}</span></div>
          {ln.slice(0, nShow).map((x, j) => <div key={j} style={{ display: "flex", background: x.t === "add" ? "rgba(98,217,139,.13)" : x.t === "del" ? "rgba(255,111,111,.13)" : "transparent", fontSize: 21 }}>
            <span style={{ width: 54, textAlign: "right", paddingRight: 10, color: C.faint }}>{x.n}</span><span style={{ width: 22, color: x.t === "add" ? C.green : x.t === "del" ? C.red : C.faint }}>{x.t === "add" ? "+" : x.t === "del" ? "-" : " "}</span>
            <span style={{ whiteSpace: "pre", color: x.t === "add" ? "#BFF5D1" : x.t === "del" ? "#FFC9C9" : C.mute }}>{x.s}</span></div>)}
        </div>); }
    if (e.k === "text") { const s = e.s || ""; const n = Math.round(s.length * interpolate(f, [r.a, r.a + (r.b - r.a) * 0.85], [0, 1], clamp));
      return <div key={i} style={{ marginTop: 14, display: "flex", gap: 10 }}><span style={{ color: C.ink }}>●</span><span style={{ fontFamily: BN, color: C.ink, whiteSpace: "pre-wrap", lineHeight: 1.5 }}>{s.slice(0, n)}</span></div>; }
    if (e.k === "cost") return <div key={i} style={{ marginTop: 14, color: C.gold, fontFamily: BN, fontSize: 23, opacity: io(f, r.a, r.a + 8) }}>{e.s}</div>;
    if (e.k === "perm") return <div key={i} style={{ marginTop: 6 }} />;
    return null;
  };
  // perm dialog rendered as an overlay box at the bottom of the terminal
  const perm = permRow?.e; const pk = permRow ? interpolate(f, [permRow.a, permRow.a + 8], [0, 1], clamp) : 0; const pick = permRow && f > permRow.a + (permRow.b - permRow.a) * 0.65;
  return (
    <AbsoluteFill style={{ padding: "112px 120px 172px" }}>
      <div style={{ width: "100%", height: "100%", transform: `scale(${interpolate(f, [0, 1], [zoom, zoom])})`, transformOrigin: "50% 90%", transition: "none" }}>
        <div style={{ width: "100%", height: "100%", background: C.term, borderRadius: 18, border: `1px solid ${C.line}`, boxShadow: `0 50px 120px rgba(0,0,0,.75), 0 0 80px ${C.clay}14`, overflow: "hidden", display: "flex", flexDirection: "column", position: "relative" }}>
          <div style={{ height: 52, background: C.termHead, borderBottom: `1px solid ${C.line}`, display: "flex", alignItems: "center", gap: 10, padding: "0 20px", flex: "none" }}>
            {["#FF5F57", "#FEBC2E", "#28C840"].map((c) => <span key={c} style={{ width: 14, height: 14, borderRadius: "50%", background: c }} />)}
            <div style={{ flex: 1, textAlign: "center", fontFamily: MONO, fontSize: 21, color: C.mute }}><Terminal size={16} color={C.mute} style={{ verticalAlign: "-2px", marginRight: 8 }} />{p.s.window || "~/cha-dokan — claude"}</div>
            {p.s.real !== false && <span style={{ fontFamily: BN, fontSize: 19, color: C.red, display: "flex", alignItems: "center", gap: 8 }}><span style={{ width: 11, height: 11, borderRadius: "50%", background: C.red, opacity: caret ? 1 : 0.35 }} />আসল সেশন</span>}
          </div>
          <div style={{ flex: 1, padding: "24px 34px", fontFamily: MONO, fontSize: 28, lineHeight: 1.5, color: C.ink, display: "flex", flexDirection: "column", justifyContent: "flex-start", overflow: "hidden" }}>
            {shown.slice(-(p.s.keep || 9)).map((r, i) => render(r, i))}
            {last && last.e.k !== "user" && f > last.b && <div style={{ marginTop: 14, borderTop: `1px solid ${C.line}`, paddingTop: 10 }}><span style={{ color: C.mute }}>&gt; </span><span style={{ color: C.clay, opacity: caret ? 1 : 0.15 }}>▋</span></div>}
          </div>
          {/* status bar: model + live tokens */}
          <div style={{ height: 40, flex: "none", borderTop: `1px solid ${C.line}`, background: "#121013", display: "flex", alignItems: "center", gap: 26, padding: "0 22px", fontFamily: MONO, fontSize: 18, color: C.faint }}>
            <span>model: <span style={{ color: C.teal }}>{p.s.model || "claude-haiku-5-5"}</span></span>
            {p.s.mode && <span>mode: <span style={{ color: C.gold }}>{p.s.mode}</span></span>}
            {p.s.tokens && <span style={{ marginLeft: "auto" }}>tokens: <span style={{ color: C.gold }}>{tok.toLocaleString("en-US")}</span></span>}
          </div>
          {perm && <div style={{ position: "absolute", left: 40, right: 40, bottom: 60, background: "#141114", border: `2px solid ${C.clay}`, borderRadius: 14, padding: "20px 26px", boxShadow: `0 -20px 60px rgba(0,0,0,.7), 0 0 50px ${C.clay}44`, opacity: pk, transform: `translateY(${(1 - pk) * 40}px)`, fontFamily: MONO, fontSize: 24 }}>
            <div style={{ color: C.ink, fontWeight: 700 }}>{perm.title || "Create file"}</div>
            <div style={{ color: C.mute, margin: "4px 0 12px" }}>{perm.file}</div>
            <div style={{ color: C.ink, marginBottom: 8 }}>{perm.q || "Do you want to create this file?"}</div>
            {(perm.opts || ["1. Yes", "2. Yes, allow all edits during this session", "3. No, and tell Claude what to do differently"]).map((o: string, j: number) => <div key={j} style={{ color: pick && j === 0 ? C.clay : C.mute, fontWeight: pick && j === 0 ? 700 : 400 }}>{pick && j === 0 ? "❯ " : "  "}{o}</div>)}
          </div>}
        </div>
      </div>
      {perm?.note && <div style={{ position: "absolute", right: 170, top: 380, maxWidth: 520, background: C.gold, color: "#1C1408", borderRadius: 16, padding: "16px 22px", fontFamily: BN, fontSize: 28, fontWeight: 600, lineHeight: 1.4, boxShadow: "6px 6px 0 rgba(0,0,0,.45)", transform: `rotate(-1.5deg) scale(${pop(f, fps, Math.round(permRow!.a + 6))})` }}>💡 {perm.note}</div>}
      {p.s.note && !permRow && <div style={{ position: "absolute", right: 150, top: 120, maxWidth: 520, background: C.gold, color: "#1C1408", borderRadius: 16, padding: "16px 22px", fontFamily: BN, fontSize: 28, fontWeight: 600, lineHeight: 1.4, boxShadow: "6px 6px 0 rgba(0,0,0,.45)", opacity: io(f, v(p, p.s.noteAt || 0.55), v(p, p.s.noteAt || 0.55) + 12), transform: "rotate(-1.5deg)" }}>💡 {p.s.note}</div>}
    </AbsoluteFill>
  );
};

/* ---------------- browser (the real result) ---------------- */
const SBrowser: React.FC<P> = (p) => {
  const f = useCurrentFrame(); const { fps } = useVideoConfig();
  const imgs: string[] = p.s.imgs || []; const k = pop(f, fps, 4, 16);
  const swap = p.s.swapAt ? v(p, p.s.swapAt) : 1e9; const which = f > swap ? 1 : 0; const xf = io(f, swap, swap + 14);
  const kb = interpolate(f, [0, LEAD + p.vo], [1, 1.06]);
  return (
    <AbsoluteFill style={{ padding: "90px 120px 180px", flexDirection: "row", gap: 40, alignItems: "center" }}>
      <div style={{ flex: 1, height: "100%", borderRadius: 16, overflow: "hidden", background: "#fff", boxShadow: "0 50px 120px rgba(0,0,0,.7)", transform: `translateY(${(1 - k) * 60}px) scale(${0.94 + 0.06 * k})`, display: "flex", flexDirection: "column" }}>
        <div style={{ height: 54, background: "#E9E4DE", display: "flex", alignItems: "center", gap: 10, padding: "0 16px", flex: "none" }}>
          {["#FF5F57", "#FEBC2E", "#28C840"].map((c) => <span key={c} style={{ width: 13, height: 13, borderRadius: "50%", background: c }} />)}
          <div style={{ marginLeft: 16, flex: 1, height: 34, background: "#fff", borderRadius: 18, display: "flex", alignItems: "center", gap: 10, padding: "0 16px", fontFamily: MONO, fontSize: 18, color: "#5F6368" }}><Globe size={15} color="#5F6368" />{p.s.url || "index.html"}</div>
        </div>
        <div style={{ flex: 1, position: "relative", overflow: "hidden", background: "#FCF2E3" }}>
          {imgs.map((im, i) => <Img key={i} src={staticFile(im)} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", objectPosition: "top", transform: `scale(${kb})`, transformOrigin: "50% 20%", opacity: i === 0 ? 1 : i === which ? xf : 0 }} />)}
        </div>
      </div>
      {p.s.phone && <div style={{ flex: "none", width: 330, height: 690, borderRadius: 48, background: "#111", padding: 12, boxShadow: "0 50px 100px rgba(0,0,0,.7)", border: "2px solid #333", transform: `translateY(${interpolate(pop(f, fps, Math.round(v(p, 0.35))), [0, 1], [700, 0])}px) rotate(3deg)` }}>
        <div style={{ width: "100%", height: "100%", borderRadius: 38, overflow: "hidden", background: "#FCF2E3" }}><Img src={staticFile(p.s.phone)} style={{ width: "100%" }} /></div>
      </div>}
      {p.s.badge && <div style={{ position: "absolute", left: 160, top: 120, background: C.green, color: "#06200F", borderRadius: 14, padding: "12px 22px", fontFamily: BN, fontSize: 30, fontWeight: 700, boxShadow: `0 0 40px ${C.green}88`, transform: `scale(${pop(f, fps, Math.round(v(p, 0.2)))})` }}>✓ {p.s.badge}</div>}
    </AbsoluteFill>
  );
};

/* ---------------- prompt (before vs after) ---------------- */
const SPrompt: React.FC<P> = (p) => {
  const f = useCurrentFrame(); const B = p.s.bad || {}, G = p.s.good || {};
  const Box: React.FC<{ d: any; ok: boolean; at: number }> = ({ d, ok, at }) => { const col = ok ? C.green : C.red; const n = Math.round((d.text || "").length * interpolate(f, [at, at + 40], [0, 1], clamp));
    return (
      <Glass glow={col} style={{ flex: 1, padding: "24px 28px", border: `1.5px solid ${col}77`, opacity: io(f, at - 6, at + 4) }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, fontFamily: BN, fontSize: 32, fontWeight: 700, color: col }}>{ok ? <CheckCircle2 size={34} color={col} /> : <XCircle size={34} color={col} />}{d.title || (ok ? "ভালো প্রম্পট" : "দুর্বল প্রম্পট")}</div>
        <div style={{ marginTop: 16, background: C.term, borderRadius: 12, padding: "16px 20px", fontFamily: BN, fontSize: 29, color: C.ink, lineHeight: 1.5, minHeight: 150 }}><span style={{ color: C.mute, fontFamily: MONO }}>&gt; </span>{(d.text || "").slice(0, n)}</div>
        {(d.notes || []).map((t: string, i: number) => { const t2 = at + 44 + i * 10; return <div key={i} style={{ marginTop: 10, fontFamily: BN, fontSize: 25, color: C.mute, opacity: io(f, t2, t2 + 8) }}>{ok ? "✓" : "✗"} {t}</div>; })}
      </Glass>); };
  return (
    <Area>
      <Kicker t={p.s.tag || "প্রম্পট: আগে বনাম পরে"} c={C.violet} />
      <H size={52} style={{ marginBottom: 24 }}>{p.s.head}</H>
      <div style={{ display: "flex", gap: 24, flex: 1 }}><Box d={B} ok={false} at={v(p, 0.08)} /><Box d={G} ok at={v(p, 0.42)} /></div>
    </Area>
  );
};

/* ---------------- recap / outro / quiz ---------------- */
const SRecap: React.FC<P> = (p) => {
  const f = useCurrentFrame(); const it: string[] = p.s.items || [];
  return (
    <Area>
      <Kicker t="আজ যা শিখলাম" c={C.green} />
      <H size={56} style={{ marginBottom: 24 }}>{p.s.head || "সংক্ষেপে"}</H>
      <div style={{ display: "flex", flexDirection: "column", gap: 16, flex: 1, justifyContent: "center" }}>
        {it.map((t, i) => { const at = v(p, 0.06 + (0.72 * i) / Math.max(1, it.length)); return (
          <Glass key={i} style={{ display: "flex", alignItems: "center", gap: 20, padding: "16px 24px", opacity: io(f, at, at + 10), transform: `translateX(${io(f, at, at + 10, -26, 0)}px)` }}>
            <CheckCircle2 size={38} color={C.green} style={{ flex: "none" }} /><span style={{ fontFamily: BN, fontSize: 33, color: C.ink, lineHeight: 1.35 }}>{t}</span></Glass>); })}
      </div>
    </Area>
  );
};
const SOutro: React.FC<P> = (p) => {
  const f = useCurrentFrame(); const { fps } = useVideoConfig();
  return (
    <Area style={{ alignItems: "center", justifyContent: "center", textAlign: "center" }}>
      <Img src={staticFile("academy/_brand/aiu-logo-dark.svg")} style={{ height: 74, transform: `scale(${pop(f, fps, 2)})` }} />
      <div style={{ fontFamily: BN, fontSize: 70, fontWeight: 800, color: C.ink, margin: "26px 0 12px", opacity: io(f, 8, 20) }}>{p.s.head || "পরের পাঠে দেখা হবে!"}</div>
      {p.spec.next && <div style={{ fontFamily: BN, fontSize: 38, color: C.clay, opacity: io(f, 16, 28) }}>পরের পাঠ: {p.spec.next}</div>}
      <div style={{ fontFamily: BN, fontSize: 30, color: C.mute, marginTop: 26, opacity: io(f, 24, 36) }}>{p.s.sub || "aiuniversitybd.com"}</div>
      <div style={{ fontFamily: BN, fontSize: 21, color: C.faint, marginTop: 50, maxWidth: 1250, lineHeight: 1.5, opacity: io(f, 30, 44) }}>এটি AI University-র নিজস্ব কোর্স — Anthropic-এর অফিসিয়াল কোর্স নয়। Claude ও Claude Code হলো Anthropic-এর ট্রেডমার্ক।</div>
    </Area>
  );
};
const SQuiz: React.FC<P & { answer?: boolean }> = (p) => {
  const f = useCurrentFrame(); const { fps } = useVideoConfig(); const o: string[] = p.s.o || [], ans = p.answer, a = p.s.a;
  const left = Math.max(0, Math.ceil((LEAD + p.vo + (p.s.hold || 0) - f) / fps));
  return (
    <Area>
      <div style={{ display: "flex", alignItems: "center" }}><Kicker t={ans ? "উত্তর" : "চেকপয়েন্ট"} c={ans ? C.green : C.violet} />{!ans && p.s.hold ? <div style={{ marginLeft: "auto", fontFamily: MONO, fontSize: 56, fontWeight: 700, color: C.gold }}>{bn(left)}</div> : null}</div>
      <H size={48} style={{ marginBottom: 26 }}>{p.s.q}</H>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 18 }}>
        {o.map((x, i) => { const ok = ans && i === a; return (
          <Glass key={i} style={{ display: "flex", alignItems: "center", gap: 16, padding: "18px 22px", border: `2px solid ${ok ? C.green : C.glassLine}`, opacity: ans && !ok ? 0.4 : io(f, 8 + i * 5, 18 + i * 5) }}>
            <span style={{ width: 50, height: 50, borderRadius: "50%", background: ok ? C.green : "rgba(255,255,255,.08)", color: ok ? "#06200F" : C.ink, display: "grid", placeItems: "center", fontFamily: BN, fontSize: 26, fontWeight: 700, flex: "none" }}>{"কখগঘ"[i]}</span>
            <span style={{ fontFamily: BN, fontSize: 31, color: C.ink }}>{x}</span></Glass>); })}
      </div>
      {ans && p.s.ex && <div style={{ fontFamily: BN, fontSize: 29, color: C.mute, marginTop: 24, lineHeight: 1.5 }}>{p.s.ex}</div>}
    </Area>
  );
};

/* ---------------- frame ---------------- */
const MAP: Record<string, React.FC<any>> = { myth: SMyth, title: STitle, points: SPoints, loop: SLoop, surfaces: SSurfaces, cost: SCost, compare: SCompare, hub: SHub, sessions: SSessions, secret: SSecret, thanks: SThanks, cli: SCli, browser: SBrowser, prompt: SPrompt, recap: SRecap, outro: SOutro, quizQ: SQuiz, quizA: (p: P) => <SQuiz {...p} answer /> };
const sfx = (s: Scene, i: number) => i === 0 ? "swell" : s.type === "secret" || s.type === "myth" ? "hit" : s.type === "recap" || s.type === "outro" || s.type === "quizA" || s.type === "thanks" ? "chime" : s.type === "cli" ? "pop" : "whoosh";

const subChunks = (spec: Spec, starts: number[]) => spec.scenes.flatMap((s, i) => {
  const parts = s.vo.split(/(?<=[।?!,—])\s+/).reduce<string[]>((a, x) => { if (a.length && (a[a.length - 1].length < 26 || x.length < 10)) a[a.length - 1] += " " + x; else a.push(x); return a; }, []);
  const total = parts.reduce((n, x) => n + x.length, 0) || 1; let acc = 0; const b = starts[i] + LEAD;
  return parts.map((x) => { const from = b + (s.frames * acc) / total; acc += x.length; return { s: x, from, to: b + (s.frames * acc) / total }; });
});
export const CcVideo: React.FC<{ spec: Spec }> = ({ spec }) => {
  const f = useCurrentFrame();
  const lens = spec.scenes.map(sceneLen);
  const starts = lens.reduce<number[]>((a, _, i) => [...a, i ? a[i - 1] + lens[i - 1] : 15], []);
  const chunks = subChunks(spec, starts), cur = chunks.find((x) => f >= x.from && f < x.to + 4);
  const total = ccLen(spec);
  const busy = (fr: number) => spec.scenes.some((s, i) => s.type === "cli" && fr >= starts[i] && fr <= starts[i] + lens[i]);
  return (
    <AbsoluteFill style={{ background: C.bg0 }}>
      <Stage />
      {spec.scenes.map((s, i) => { const S = MAP[s.type] || SPoints; const len = lens[i]; return (
        <Sequence key={i} from={starts[i]} durationInFrames={len}>
          <Cam len={len}><S s={s} spec={spec} vo={s.frames} /></Cam>
          <Sequence from={LEAD}><Audio src={staticFile(`claudecode/${spec.id}/vo/${String(i + 1).padStart(2, "0")}.mp3`)} /></Sequence>
          <Sequence from={0}><Audio src={staticFile(`aiu2/${sfx(s, i)}.mp3`)} volume={0.15} /></Sequence>
        </Sequence>); })}
      {/* top chrome */}
      <div style={{ position: "absolute", left: 50, top: 36, display: "flex", alignItems: "center", gap: 16 }}><Img src={staticFile("academy/_brand/aiu-logo-dark.svg")} style={{ height: 32 }} /><span style={{ width: 1, height: 26, background: C.line }} /><span style={{ fontFamily: BN, fontSize: 22, color: C.mute }}>{spec.course}</span></div>
      <div style={{ position: "absolute", right: 50, top: 38, fontFamily: BN, fontSize: 22, color: C.mute, padding: "6px 16px", borderRadius: 999, border: `1px solid ${C.glassLine}`, background: C.glass }}>{spec.lessonNo}</div>
      {/* bottom: subtitle + progress */}
      {cur && <div style={{ position: "absolute", left: 0, right: 0, bottom: 64, display: "flex", justifyContent: "center", opacity: interpolate(f, [cur.from, cur.from + 5, cur.to, cur.to + 4], [0, 1, 1, 0], clamp) }}><div style={{ maxWidth: 1300, padding: "9px 28px", borderRadius: 14, background: "rgba(8,7,10,.86)", border: `1px solid ${C.line2}`, fontFamily: BN, fontSize: 33, fontWeight: 500, color: "#fff", textAlign: "center", lineHeight: 1.35 }}>{cur.s.replace(/[।,]$/, "")}</div></div>}
      <div style={{ position: "absolute", left: 50, right: 50, bottom: 26, height: 4, borderRadius: 4, background: "rgba(255,255,255,.07)" }}>
        <div style={{ width: `${(f / total) * 100}%`, height: 4, borderRadius: 4, background: `linear-gradient(90deg, ${C.clay}, ${C.gold})` }} />
        {starts.map((st, i) => <span key={i} style={{ position: "absolute", left: `${(st / total) * 100}%`, top: -3, width: 2, height: 10, background: f >= st ? C.gold : C.faint, opacity: 0.6 }} />)}
      </div>
      <div style={{ position: "absolute", right: 50, bottom: 36, fontFamily: BN, fontSize: 17, color: C.faint }}>AI University-র নিজস্ব কোর্স · অফিসিয়াল Anthropic কোর্স নয় · এআই কণ্ঠ</div>
      <Audio src={staticFile("aiu2/music.mp3")} loop volume={(fr) => (busy(fr) ? 0.03 : 0.075) * interpolate(fr, [0, 30, total - 60, total], [0, 1, 1, 0], clamp)} />
    </AbsoluteFill>
  );
};
