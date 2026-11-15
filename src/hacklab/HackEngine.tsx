// AI University — ঘরে বসে হ্যাকিং শেখা (ethical / white-hat) lesson engine (2026-11-16).
// A dark "hacker screen-recording" look: a real-feeling terminal where commands type character-by-character and the
// real output prints line by line (output is written by hand / captured — never faked wrong), syntax-highlighted; plus
// clean dark cards for concepts, a white/grey/black-hat comparison, a red law & ethics warning (shown every lesson),
// tool-download cards (name · where · exact link · steps), a browser frame for web demos, and quiz scenes.
// Scenes: title · points · hats · warn · tool · term · browser · compare · recap · outro · quizQ · quizA
import React from "react";
import { AbsoluteFill, Audio, Img, Sequence, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig, Easing, delayRender, continueRender } from "remotion";
import {
  ShieldCheck, ShieldAlert, Skull, Scale, Lock, Terminal, Globe, Bug, KeyRound, Fish, Wifi, Cpu, Server, Search, Eye, EyeOff,
  Download, CheckCircle2, XCircle, AlertTriangle, ChevronRight, Sparkles, BookOpen, Wrench, Boxes, HardDrive, Network, Brain, Fingerprint, UserCheck,
} from "lucide-react";

/* ---------------- theme ---------------- */
const C = {
  bg0: "#05070B", bg1: "#0B0F16", grid: "#111826",
  win: "#0D1117", head: "#161B22", line: "#2A3240", line2: "#1C2430",
  ink: "#E6EDF3", mute: "#8B949E", faint: "#5A6472",
  green: "#3FE08B", green2: "#27A866", glow: "#00E676",
  cyan: "#56D4DD", blue: "#6CA8FF", purple: "#B98BFF",
  red: "#FF6B6B", amber: "#FFC65A", white: "#FFFFFF",
  card: "#111722", cardLine: "#242D3A",
};
const MONO = "'DejaVu Sans Mono', 'Cascadia Mono', Consolas, ui-monospace, monospace";
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
const ICO: Record<string, React.FC<any>> = { shield: ShieldCheck, alert: ShieldAlert, skull: Skull, scale: Scale, lock: Lock, terminal: Terminal, globe: Globe, bug: Bug, key: KeyRound, fish: Fish, wifi: Wifi, cpu: Cpu, server: Server, search: Search, eye: Eye, eyeoff: EyeOff, download: Download, check: CheckCircle2, x: XCircle, warn: AlertTriangle, spark: Sparkles, book: BookOpen, wrench: Wrench, box: Boxes, disk: HardDrive, net: Network, brain: Brain, finger: Fingerprint, user: UserCheck };

export type Scene = { type: string; vo: string; frames: number; hold?: number; [k: string]: any };
export type Spec = { id: string; course: string; lessonNo: string; module?: string; title: string; next: string; host?: string; scenes: Scene[] };
const LEAD = 12, TAIL = 16;
const sceneLen = (s: Scene) => LEAD + s.frames + (s.hold || 0) + TAIL;
export const hackLen = (spec: Spec) => spec.scenes.reduce((n, s) => n + sceneLen(s), 0) + 30;
type P = { s: Scene; spec: Spec; vo: number };
const v = (p: P, x: number) => LEAD + p.vo * x;

/* ---------------- shared bg + card ---------------- */
const Scan: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill style={{ background: `radial-gradient(1400px 820px at 78% -8%, #0E2A1E 0%, ${C.bg1} 46%, ${C.bg0} 100%)` }}>
      <AbsoluteFill style={{ backgroundImage: `linear-gradient(${C.grid} 1px, transparent 1px), linear-gradient(90deg, ${C.grid} 1px, transparent 1px)`, backgroundSize: "44px 44px", opacity: 0.5, maskImage: "radial-gradient(1200px 700px at 70% 0%, #000 30%, transparent 85%)" }} />
      <AbsoluteFill style={{ background: `repeating-linear-gradient(0deg, rgba(0,230,118,.035) 0 2px, transparent 2px 4px)`, opacity: interpolate(f % 180, [0, 90, 180], [0.5, 1, 0.5]) }} />
    </AbsoluteFill>
  );
};
const Card: React.FC<{ children: React.ReactNode; style?: React.CSSProperties; accent?: string }> = ({ children, style, accent }) => (
  <div style={{ position: "absolute", left: 120, right: 120, top: 96, bottom: 150, background: `linear-gradient(180deg, ${C.card}, #0C111A)`, borderRadius: 24, border: `1px solid ${C.cardLine}`, boxShadow: `0 40px 100px rgba(0,0,0,.6), inset 0 1px 0 rgba(255,255,255,.03)`, padding: "52px 64px", display: "flex", flexDirection: "column", overflow: "hidden", ...style }}>
    {accent && <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: 5, background: accent, boxShadow: `0 0 24px ${accent}` }} />}
    {children}
  </div>
);
const Eyebrow: React.FC<{ t: string; c?: string }> = ({ t, c = C.green }) => (
  <div style={{ fontFamily: MONO, fontSize: 24, letterSpacing: 2, color: c, textTransform: "uppercase", marginBottom: 10, display: "flex", alignItems: "center", gap: 10 }}>
    <span style={{ color: c }}>&gt;_</span>{t}
  </div>
);

/* ---------------- title ---------------- */
const STitle: React.FC<P> = (p) => {
  const f = useCurrentFrame(); const { fps } = useVideoConfig();
  return (
    <Card style={{ justifyContent: "center" }}>
      <div style={{ transform: `scale(${pop(f, fps, 3)})`, transformOrigin: "left center", width: 118, height: 118, borderRadius: 24, background: "#0A0F17", border: `2px solid ${C.green}`, display: "grid", placeItems: "center", color: C.green, fontFamily: MONO, fontSize: 64, fontWeight: 700, boxShadow: `0 0 40px rgba(63,224,139,.35)` }}>&gt;_</div>
      <div style={{ fontFamily: MONO, fontSize: 30, color: C.cyan, letterSpacing: 1, marginTop: 30, opacity: interpolate(f, [8, 20], [0, 1], clamp) }}>{p.s.kicker || p.spec.module || p.spec.course}</div>
      <div style={{ fontFamily: BN, fontSize: 78, fontWeight: 700, color: C.ink, lineHeight: 1.18, margin: "10px 0", opacity: interpolate(f, [14, 28], [0, 1], clamp) }}>{p.s.title || p.spec.title}</div>
      {p.s.sub && <div style={{ fontFamily: BN, fontSize: 36, color: C.mute, opacity: interpolate(f, [22, 34], [0, 1], clamp) }}>{p.s.sub}</div>}
      {p.s.chips && <div style={{ display: "flex", gap: 14, marginTop: 34, flexWrap: "wrap" }}>{p.s.chips.map((c: string, i: number) => <span key={i} style={{ fontFamily: BN, fontSize: 27, padding: "9px 20px", borderRadius: 999, background: "rgba(63,224,139,.08)", border: `1px solid ${C.green2}`, color: C.green, opacity: interpolate(f, [v(p, 0.4 + i * 0.07), v(p, 0.4 + i * 0.07) + 10], [0, 1], clamp) }}>{c}</span>)}</div>}
    </Card>
  );
};

/* ---------------- points (concept bullets) ---------------- */
const SPoints: React.FC<P> = (p) => {
  const f = useCurrentFrame(); const it: any[] = p.s.items || []; const acc = p.s.accent || C.green;
  const norm = it.map((x) => Array.isArray(x) ? x : [null, x, null]);
  return (
    <Card accent={acc}>
      <Eyebrow t={p.s.tag || "notes"} c={acc} />
      <div style={{ fontFamily: BN, fontSize: 52, fontWeight: 700, color: C.ink, marginBottom: 26, lineHeight: 1.2 }}>{p.s.head}</div>
      <div style={{ display: "flex", flexDirection: "column", gap: norm.length > 4 ? 14 : 22, justifyContent: "center", flex: 1 }}>
        {norm.map(([icon, title, desc]: any, i: number) => { const at = v(p, 0.08 + (0.62 * i) / Math.max(1, norm.length)); const I = icon ? ICO[icon] : null;
          return (
            <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 22, opacity: interpolate(f, [at, at + 10], [0, 1], clamp), transform: `translateX(${interpolate(f, [at, at + 10], [-24, 0], clamp)}px)` }}>
              <div style={{ flex: "none", width: 56, height: 56, borderRadius: 14, background: "rgba(63,224,139,.08)", border: `1px solid ${acc}`, display: "grid", placeItems: "center" }}>{I ? <I size={28} color={acc} strokeWidth={1.9} /> : <span style={{ fontFamily: MONO, fontSize: 26, color: acc }}>{bn(i + 1)}</span>}</div>
              <div style={{ paddingTop: desc ? 0 : 8 }}>
                <div style={{ fontFamily: BN, fontSize: 38, fontWeight: 600, color: C.ink, lineHeight: 1.3 }}>{title}</div>
                {desc && <div style={{ fontFamily: BN, fontSize: 29, color: C.mute, lineHeight: 1.4, marginTop: 4 }}>{desc}</div>}
              </div>
            </div>); })}
      </div>
    </Card>
  );
};

/* ---------------- hats (white / grey / black) ---------------- */
const SHats: React.FC<P> = (p) => {
  const f = useCurrentFrame(); const cards: any[] = p.s.cards || [];
  const TH: Record<string, any> = {
    white: { a: C.green, I: ShieldCheck, bg: "rgba(63,224,139,.07)" },
    grey: { a: C.amber, I: ShieldAlert, bg: "rgba(255,198,90,.07)" },
    black: { a: C.red, I: Skull, bg: "rgba(255,107,107,.07)" },
  };
  return (
    <Card>
      <Eyebrow t="types" c={C.cyan} />
      <div style={{ fontFamily: BN, fontSize: 50, fontWeight: 700, color: C.ink, marginBottom: 24 }}>{p.s.head || "তিন ধরনের হ্যাকার"}</div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 22, flex: 1 }}>
        {cards.map((c: any, i: number) => { const t = TH[c.k] || TH.white; const at = v(p, 0.12 + i * 0.16);
          return (
            <div key={i} style={{ display: "flex", flexDirection: "column", gap: 14, padding: "28px 24px", borderRadius: 18, background: t.bg, border: `1.5px solid ${t.a}`, opacity: interpolate(f, [at, at + 12], [0, 1], clamp), transform: `translateY(${interpolate(f, [at, at + 12], [26, 0], clamp)}px)` }}>
              <div style={{ width: 62, height: 62, borderRadius: 16, background: "#0B0F17", border: `1.5px solid ${t.a}`, display: "grid", placeItems: "center" }}><t.I size={34} color={t.a} strokeWidth={1.8} /></div>
              <div style={{ fontFamily: BN, fontSize: 34, fontWeight: 700, color: t.a }}>{c.title}</div>
              <div style={{ fontFamily: BN, fontSize: 27, color: C.ink, lineHeight: 1.42, flex: 1 }}>{c.desc}</div>
              <div style={{ fontFamily: MONO, fontSize: 20, color: t.a, borderTop: `1px solid ${t.a}55`, paddingTop: 10 }}>{c.tag}</div>
            </div>); })}
      </div>
    </Card>
  );
};

/* ---------------- warn (law & ethics — every lesson) ---------------- */
const SWarn: React.FC<P> = (p) => {
  const f = useCurrentFrame(); const { fps } = useVideoConfig(); const it: string[] = p.s.items || [];
  return (
    <Card style={{ border: `1.5px solid ${C.red}`, background: `linear-gradient(180deg, #1A0E12, #120A0D)`, justifyContent: "center" }}>
      <div style={{ position: "absolute", inset: 0, background: `repeating-linear-gradient(45deg, rgba(255,107,107,.05) 0 18px, transparent 18px 36px)` }} />
      <div style={{ display: "flex", alignItems: "center", gap: 20, marginBottom: 10 }}>
        <div style={{ transform: `scale(${pop(f, fps, 2)})`, width: 84, height: 84, borderRadius: 20, background: "rgba(255,107,107,.1)", border: `2px solid ${C.red}`, display: "grid", placeItems: "center" }}><AlertTriangle size={46} color={C.red} strokeWidth={2} /></div>
        <div style={{ fontFamily: BN, fontSize: 46, fontWeight: 800, color: C.red }}>{p.s.head || "আইন ও নৈতিকতা"}</div>
      </div>
      <div style={{ fontFamily: BN, fontSize: 40, fontWeight: 600, color: C.ink, lineHeight: 1.5, margin: "14px 0 20px", opacity: interpolate(f, [14, 26], [0, 1], clamp) }}>{p.s.text}</div>
      {it.map((t, i) => { const at = v(p, 0.3 + i * 0.16); return (
        <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 14, margin: "7px 0", opacity: interpolate(f, [at, at + 10], [0, 1], clamp) }}>
          <span style={{ color: C.red, fontSize: 30, lineHeight: 1.3 }}>✕</span>
          <span style={{ fontFamily: BN, fontSize: 30, color: C.ink, lineHeight: 1.4 }}>{t}</span>
        </div>); })}
    </Card>
  );
};

/* ---------------- tool (download card) ---------------- */
const STool: React.FC<P> = (p) => {
  const f = useCurrentFrame(); const steps: string[] = p.s.steps || []; const plats: string[] = p.s.platforms || [];
  return (
    <Card accent={C.cyan}>
      <Eyebrow t="tool · কোথা থেকে নামাবে" c={C.cyan} />
      <div style={{ display: "flex", alignItems: "center", gap: 22, marginBottom: 6 }}>
        <div style={{ width: 92, height: 92, borderRadius: 20, background: "#0B1017", border: `1.5px solid ${C.cyan}`, display: "grid", placeItems: "center", transform: `scale(${pop(f, 30, 3)})` }}>{(() => { const I = ICO[p.s.icon || "download"]; return <I size={48} color={C.cyan} strokeWidth={1.8} />; })()}</div>
        <div>
          <div style={{ fontFamily: BN, fontSize: 52, fontWeight: 700, color: C.ink }}>{p.s.name}</div>
          <div style={{ fontFamily: BN, fontSize: 28, color: C.mute }}>{p.s.what}</div>
        </div>
        {p.s.free !== false && <div style={{ marginLeft: "auto", fontFamily: MONO, fontSize: 22, color: C.green, border: `1px solid ${C.green2}`, borderRadius: 8, padding: "6px 14px" }}>ফ্রি</div>}
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 12, background: "#0A0E14", border: `1px solid ${C.line}`, borderRadius: 12, padding: "16px 20px", margin: "20px 0 8px", opacity: interpolate(f, [v(p, 0.2), v(p, 0.2) + 10], [0, 1], clamp) }}>
        <Globe size={24} color={C.cyan} /><span style={{ fontFamily: MONO, fontSize: 30, color: C.cyan }}>{p.s.url}</span>
        <span style={{ marginLeft: "auto", fontFamily: MONO, fontSize: 18, color: C.faint }}>অফিসিয়াল সাইট</span>
      </div>
      <div style={{ display: "flex", gap: 10, marginBottom: 14 }}>{plats.map((pl, i) => <span key={i} style={{ fontFamily: MONO, fontSize: 20, color: C.mute, border: `1px solid ${C.line}`, borderRadius: 7, padding: "4px 12px" }}>{pl}</span>)}</div>
      <div style={{ display: "flex", flexDirection: "column", gap: 11, flex: 1, justifyContent: "center" }}>
        {steps.map((s, i) => { const at = v(p, 0.35 + (0.5 * i) / Math.max(1, steps.length)); return (
          <div key={i} style={{ display: "flex", alignItems: "center", gap: 16, opacity: interpolate(f, [at, at + 9], [0, 1], clamp), transform: `translateX(${interpolate(f, [at, at + 9], [-18, 0], clamp)}px)` }}>
            <span style={{ flex: "none", width: 40, height: 40, borderRadius: 10, background: "rgba(86,212,221,.1)", border: `1px solid ${C.cyan}`, display: "grid", placeItems: "center", fontFamily: MONO, fontSize: 22, color: C.cyan }}>{bn(i + 1)}</span>
            <span style={{ fontFamily: BN, fontSize: 31, color: C.ink, lineHeight: 1.35 }}>{s}</span>
          </div>); })}
      </div>
    </Card>
  );
};

/* ---------------- terminal (the star) ---------------- */
type TLine = { t: "cmd" | "out" | "cmt" | "ok" | "warn"; s: string; host?: string };
const HI: [RegExp, string][] = [
  [/\b(open|up|success|OK|PASS|ESTABLISHED|done|Running)\b/gi, C.green],
  [/\b(VULNERABLE|CRITICAL|FAILED|denied|error|closed|filtered|WARNING|unsafe)\b/gi, C.red],
  [/\b(\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3})\b/g, C.cyan],
  [/\b(\d+\/(?:tcp|udp)|:\d{2,5}\b|\b\d+(?:\.\d+)*\b)/g, C.cyan],
];
const tokenize = (s: string, base: string) => {
  const spans: { a: number; b: number; c: string }[] = [];
  for (const [re, col] of HI) { re.lastIndex = 0; let m; while ((m = re.exec(s))) spans.push({ a: m.index, b: m.index + m[0].length, c: col }); }
  spans.sort((x, y) => x.a - y.a);
  const out: React.ReactNode[] = []; let i = 0, k = 0;
  for (const sp of spans) { if (sp.a < i) continue; if (sp.a > i) out.push(<span key={k++}>{s.slice(i, sp.a)}</span>); out.push(<span key={k++} style={{ color: sp.c }}>{s.slice(sp.a, sp.b)}</span>); i = sp.b; }
  if (i < s.length) out.push(<span key={k++}>{s.slice(i)}</span>);
  return <span style={{ color: base }}>{out}</span>;
};
// evenly lay out the terminal lines across the scene's VO frames; cmd lines "type" char by char
function termRows(p: P, f: number) {
  const lines: TLine[] = p.s.lines || [];
  const host = p.s.host || p.spec.host || "kali@kali", cwd = p.s.cwd || "~";
  const weight = (l: TLine) => l.t === "cmd" ? Math.max(14, l.s.length * 1.5) + 8 : Math.max(9, l.s.length * 0.25 + 7);
  const W = lines.reduce((n, l) => n + weight(l), 0) || 1;
  const scale = (p.vo * 0.96) / W;
  let acc = 0; const rows: { l: TLine; n: number; typing: boolean; host: string; cwd: string; shown: boolean }[] = [];
  for (const l of lines) {
    const start = LEAD + acc * scale, end = LEAD + (acc + weight(l)) * scale; acc += weight(l);
    if (f < start) { rows.push({ l, n: 0, typing: false, host, cwd, shown: false }); continue; }
    if (l.t === "cmd") { const typeEnd = start + (end - start) * 0.75; const n = Math.round(l.s.length * Math.min(1, (f - start) / Math.max(1, typeEnd - start))); rows.push({ l, n, typing: n < l.s.length, host, cwd, shown: true }); }
    else { const n = Math.round(l.s.length * Math.min(1, (f - start) / Math.max(1, (end - start) * 0.5))); rows.push({ l, n, typing: false, host, cwd, shown: true }); }
  }
  return rows;
}
const PromptLine: React.FC<{ host: string; cwd: string }> = ({ host, cwd }) => (
  <span><span style={{ color: C.green }}>┌──(</span><span style={{ color: C.cyan }}>{host}</span><span style={{ color: C.green }}>)-[</span><span style={{ color: C.ink }}>{cwd}</span><span style={{ color: C.green }}>]</span></span>
);
const STerm: React.FC<P> = (p) => {
  const f = useCurrentFrame();
  const rows = termRows(p, f).filter((r) => r.shown);
  const MAXV = 15; const vis = rows.slice(-MAXV);
  const caret = Math.floor(f / 8) % 2 === 0;
  return (
    <AbsoluteFill style={{ padding: "70px 110px 150px" }}>
      <div style={{ width: "100%", height: "100%", background: C.win, borderRadius: 14, border: `1px solid ${C.line}`, boxShadow: `0 40px 110px rgba(0,0,0,.7), 0 0 60px rgba(63,224,139,.06)`, overflow: "hidden", display: "flex", flexDirection: "column" }}>
        <div style={{ height: 50, background: C.head, borderBottom: `1px solid ${C.line}`, display: "flex", alignItems: "center", gap: 10, padding: "0 18px" }}>
          <span style={{ width: 14, height: 14, borderRadius: "50%", background: "#FF5F57" }} /><span style={{ width: 14, height: 14, borderRadius: "50%", background: "#FEBC2E" }} /><span style={{ width: 14, height: 14, borderRadius: "50%", background: "#28C840" }} />
          <div style={{ flex: 1, textAlign: "center", fontFamily: MONO, fontSize: 21, color: C.mute }}><Terminal size={16} color={C.mute} style={{ verticalAlign: "-2px", marginRight: 8 }} />{(p.s.host || p.spec.host || "kali@kali")}: {p.s.cwd || "~"}</div>
          <span style={{ width: 60 }} />
        </div>
        <div style={{ flex: 1, padding: "22px 30px", fontFamily: MONO, fontSize: 29, lineHeight: 1.5, color: C.ink, display: "flex", flexDirection: "column", justifyContent: "flex-end", overflow: "hidden" }}>
          {vis.map((r, i) => {
            const text = r.l.s.slice(0, r.n);
            if (r.l.t === "cmd") return (
              <div key={i} style={{ marginTop: i ? 10 : 0 }}>
                <PromptLine host={r.host} cwd={r.cwd} />
                <div><span style={{ color: C.green }}>└─</span><span style={{ color: C.red, fontWeight: 700 }}>$ </span><span style={{ color: C.ink }}>{text}</span>{r.typing && <span style={{ color: C.green, opacity: caret ? 1 : 0.1 }}>▋</span>}</div>
              </div>);
            const base = r.l.t === "cmt" ? C.faint : r.l.t === "ok" ? C.green : r.l.t === "warn" ? C.red : C.mute;
            return <div key={i} style={{ whiteSpace: "pre-wrap" }}>{r.l.t === "cmt" ? <span style={{ color: C.faint }}>{text}</span> : tokenize(text, base)}</div>;
          })}
          {vis.length && !vis[vis.length - 1].typing && <span style={{ color: C.green, opacity: caret ? 1 : 0.15 }}>▋</span>}
        </div>
      </div>
      {p.s.note && <div style={{ position: "absolute", right: 130, bottom: 172, maxWidth: 560, background: C.amber, color: "#1A1205", borderRadius: 14, padding: "14px 20px", fontFamily: BN, fontSize: 27, fontWeight: 600, lineHeight: 1.4, boxShadow: "4px 4px 0 rgba(0,0,0,.4)", opacity: interpolate(f, [v(p, 0.5), v(p, 0.5) + 12], [0, 1], clamp), transform: `rotate(-1.5deg)` }}>💡 {p.s.note}</div>}
    </AbsoluteFill>
  );
};

/* ---------------- browser (web demo) ---------------- */
const SBrowser: React.FC<P> = (p) => {
  const f = useCurrentFrame();
  const payN = p.s.payload ? Math.round(p.s.payload.length * interpolate(f, [v(p, 0.15), v(p, 0.5)], [0, 1], clamp)) : 0;
  const shown = (p.s.payload || "").slice(0, payN);
  const fired = p.s.alert && f > v(p, 0.6);
  return (
    <AbsoluteFill style={{ padding: "78px 150px 150px" }}>
      <div style={{ width: "100%", height: "100%", background: "#fff", borderRadius: 14, overflow: "hidden", border: `1px solid ${C.line}`, boxShadow: "0 40px 110px rgba(0,0,0,.7)", display: "flex", flexDirection: "column" }}>
        <div style={{ height: 54, background: "#DEE1E6", display: "flex", alignItems: "center", gap: 10, padding: "0 16px" }}>
          <span style={{ width: 13, height: 13, borderRadius: "50%", background: "#FF5F57" }} /><span style={{ width: 13, height: 13, borderRadius: "50%", background: "#FEBC2E" }} /><span style={{ width: 13, height: 13, borderRadius: "50%", background: "#28C840" }} />
          <div style={{ marginLeft: 16, flex: 1, height: 34, background: "#fff", borderRadius: 18, display: "flex", alignItems: "center", gap: 10, padding: "0 16px", fontFamily: MONO, fontSize: 19, color: "#5F6368" }}><Lock size={15} color="#1A8754" />{p.s.url || "http://localhost/hack-lab"}</div>
        </div>
        <div style={{ flex: 1, background: "#F6F7F9", padding: "44px 60px", color: "#1F2328", fontFamily: UI }}>
          <div style={{ fontFamily: BN, fontSize: 40, fontWeight: 700, color: "#111", marginBottom: 6 }}>{p.s.pageTitle || "আমাদের নিরাপদ হ্যাক ল্যাব"}</div>
          <div style={{ fontFamily: BN, fontSize: 24, color: "#5F6368", marginBottom: 30 }}>{p.s.pageSub || "নিজের ব্রাউজারে — বাইরের কোনো সাইটে কিছু হচ্ছে না।"}</div>
          <div style={{ background: "#fff", borderRadius: 14, border: "1px solid #E1E4E8", padding: 28, maxWidth: 760, boxShadow: "0 8px 30px rgba(0,0,0,.06)" }}>
            <div style={{ fontFamily: BN, fontSize: 24, color: "#444", marginBottom: 10 }}>{p.s.label || "আপনার নাম লিখুন:"}</div>
            <div style={{ height: 52, border: `2px solid ${fired ? C.red : "#1A73E8"}`, borderRadius: 10, display: "flex", alignItems: "center", padding: "0 16px", fontFamily: MONO, fontSize: 24, color: "#111" }}>{shown}{payN < (p.s.payload || "").length && f > v(p, 0.15) && <span style={{ color: "#1A73E8" }}>▋</span>}</div>
            <div style={{ marginTop: 18, display: "inline-block", background: "#1A73E8", color: "#fff", borderRadius: 10, padding: "12px 28px", fontFamily: BN, fontSize: 24, fontWeight: 600 }}>{p.s.btn || "পাঠান"}</div>
          </div>
          {fired && <div style={{ marginTop: 26, transform: `scale(${pop(f, 30, Math.round(v(p, 0.6)))})`, display: "inline-block", background: "#fff", border: "1px solid #C9CDD2", borderRadius: 12, overflow: "hidden", boxShadow: "0 20px 60px rgba(0,0,0,.25)", maxWidth: 520 }}>
            <div style={{ background: "#F1F3F4", padding: "12px 18px", fontFamily: UI, fontSize: 20, fontWeight: 600, color: "#111" }}>localhost বলছে</div>
            <div style={{ padding: "18px 20px", fontFamily: MONO, fontSize: 24, color: "#111" }}>{p.s.alert}</div>
            <div style={{ padding: "0 18px 16px", textAlign: "right" }}><span style={{ background: "#1A73E8", color: "#fff", borderRadius: 8, padding: "8px 22px", fontFamily: UI, fontSize: 19 }}>OK</span></div>
          </div>}
        </div>
      </div>
      {p.s.note && <div style={{ position: "absolute", right: 170, bottom: 168, maxWidth: 520, background: C.amber, color: "#1A1205", borderRadius: 14, padding: "14px 20px", fontFamily: BN, fontSize: 26, fontWeight: 600, lineHeight: 1.4, boxShadow: "4px 4px 0 rgba(0,0,0,.4)", opacity: interpolate(f, [v(p, 0.7), v(p, 0.7) + 12], [0, 1], clamp) }}>💡 {p.s.note}</div>}
    </AbsoluteFill>
  );
};

/* ---------------- compare (attack vs defense) ---------------- */
const SCompare: React.FC<P> = (p) => {
  const f = useCurrentFrame(); const L = p.s.left || {}, R = p.s.right || {};
  const Col: React.FC<{ d: any; a: string; I: React.FC<any>; delay: number }> = ({ d, a, I, delay }) => (
    <div style={{ flex: 1, padding: "28px 26px", borderRadius: 18, background: `${a}10`, border: `1.5px solid ${a}`, opacity: interpolate(f, [delay, delay + 12], [0, 1], clamp), transform: `translateY(${interpolate(f, [delay, delay + 12], [24, 0], clamp)}px)` }}>
      <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 16 }}><div style={{ width: 54, height: 54, borderRadius: 13, background: "#0B0F17", border: `1.5px solid ${a}`, display: "grid", placeItems: "center" }}><I size={30} color={a} /></div><div style={{ fontFamily: BN, fontSize: 36, fontWeight: 700, color: a }}>{d.title}</div></div>
      {(d.items || []).map((t: string, i: number) => <div key={i} style={{ display: "flex", gap: 12, margin: "10px 0", fontFamily: BN, fontSize: 29, color: C.ink, lineHeight: 1.4 }}><span style={{ color: a }}>▸</span>{t}</div>)}
    </div>
  );
  return (
    <Card>
      <Eyebrow t="attack vs defense" c={C.amber} />
      <div style={{ fontFamily: BN, fontSize: 48, fontWeight: 700, color: C.ink, marginBottom: 22 }}>{p.s.head}</div>
      <div style={{ display: "flex", gap: 22, flex: 1 }}>
        <Col d={L} a={C.red} I={Bug} delay={v(p, 0.14)} />
        <Col d={R} a={C.green} I={ShieldCheck} delay={v(p, 0.4)} />
      </div>
    </Card>
  );
};

/* ---------------- quiz (for separate quiz videos) ---------------- */
const SQuiz: React.FC<P & { answer?: boolean }> = (p) => {
  const f = useCurrentFrame(); const { fps } = useVideoConfig(); const o: string[] = p.s.o || [], ans = p.answer, a = p.s.a;
  const left = Math.max(0, Math.ceil((LEAD + p.vo + (p.s.hold || 0) - f) / fps));
  return (
    <Card accent={ans ? C.green : C.cyan}>
      <div style={{ display: "flex", alignItems: "center" }}><Eyebrow t={ans ? "উত্তর" : "কুইজ"} c={ans ? C.green : C.cyan} />{!ans && p.s.hold ? <div style={{ marginLeft: "auto", fontFamily: MONO, fontSize: 50, fontWeight: 700, color: C.amber }}>{bn(left)}</div> : null}</div>
      <div style={{ fontFamily: BN, fontSize: 46, fontWeight: 600, color: C.ink, margin: "6px 0 26px", lineHeight: 1.35 }}>{p.s.q}</div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 18 }}>
        {o.map((x, i) => { const ok = ans && i === a; return (
          <div key={i} style={{ display: "flex", alignItems: "center", gap: 16, padding: "18px 22px", borderRadius: 14, border: `2px solid ${ok ? C.green : C.line}`, background: ok ? "rgba(63,224,139,.1)" : "#0C111A", opacity: ans && !ok ? 0.4 : interpolate(f, [10 + i * 5, 20 + i * 5], [0, 1], clamp) }}>
            <span style={{ width: 48, height: 48, borderRadius: "50%", background: ok ? C.green : "#1A2230", color: ok ? "#06130B" : C.ink, display: "grid", placeItems: "center", fontFamily: BN, fontSize: 26, fontWeight: 700, flex: "none" }}>{"কখগঘ"[i]}</span>
            <span style={{ fontFamily: BN, fontSize: 32, color: C.ink }}>{x}</span></div>); })}
      </div>
      {ans && p.s.ex && <div style={{ fontFamily: BN, fontSize: 30, color: C.mute, marginTop: 26, lineHeight: 1.5 }}>{p.s.ex}</div>}
    </Card>
  );
};

/* ---------------- recap ---------------- */
const SRecap: React.FC<P> = (p) => {
  const f = useCurrentFrame(); const it: any[] = p.s.items || [];
  return (
    <Card accent={C.green}>
      <Eyebrow t="recap · আজ যা শিখলাম" c={C.green} />
      <div style={{ fontFamily: BN, fontSize: 50, fontWeight: 700, color: C.ink, marginBottom: 20 }}>{p.s.head || "সংক্ষেপে"}</div>
      <div style={{ display: "flex", flexDirection: "column", gap: 16, flex: 1, justifyContent: "center" }}>
        {it.map((x: any, i: number) => { const [k, t] = Array.isArray(x) ? x : [bn(i + 1), x]; const at = v(p, 0.1 + (0.72 * i) / Math.max(1, it.length)); return (
          <div key={i} style={{ display: "flex", alignItems: "center", gap: 20, opacity: interpolate(f, [at, at + 10], [0, 1], clamp), transform: `translateX(${interpolate(f, [at, at + 10], [-20, 0], clamp)}px)` }}>
            <CheckCircle2 size={40} color={C.green} style={{ flex: "none" }} />
            <span style={{ fontFamily: BN, fontSize: 35, color: C.ink, lineHeight: 1.35 }}>{t}</span></div>); })}
      </div>
    </Card>
  );
};

/* ---------------- outro ---------------- */
const SOutro: React.FC<P> = (p) => {
  const f = useCurrentFrame();
  return (
    <Card style={{ alignItems: "center", justifyContent: "center", textAlign: "center" }}>
      <div style={{ fontFamily: MONO, fontSize: 30, color: C.green, opacity: interpolate(f, [2, 12], [0, 1], clamp) }}>&gt;_ keep hacking (the right way)</div>
      <div style={{ fontFamily: BN, fontSize: 60, fontWeight: 700, color: C.ink, margin: "16px 0", opacity: interpolate(f, [8, 20], [0, 1], clamp) }}>{p.s.head || "পরের পাঠে দেখা হবে!"}</div>
      {p.spec.next && <div style={{ fontFamily: BN, fontSize: 38, color: C.cyan, marginBottom: 28, opacity: interpolate(f, [16, 28], [0, 1], clamp) }}>পরের পাঠ: {p.spec.next}</div>}
      <div style={{ fontFamily: BN, fontSize: 30, color: C.mute, opacity: interpolate(f, [24, 36], [0, 1], clamp) }}>নিরাপদে অনুশীলন করো — <b style={{ color: C.green }}>aiuniversitybd.com</b></div>
      <div style={{ fontFamily: BN, fontSize: 20, color: C.faint, marginTop: 44, opacity: 0.85, maxWidth: 900, lineHeight: 1.5 }}>শুধু নিজের সিস্টেমে বা লিখিত অনুমতি আছে এমন সিস্টেমে শেখো। অন্যের অনুমতি ছাড়া কিছু করা বাংলাদেশের সাইবার আইনে দণ্ডনীয় অপরাধ।</div>
    </Card>
  );
};

/* ---------------- frame ---------------- */
const MAP: Record<string, React.FC<any>> = { title: STitle, points: SPoints, hats: SHats, warn: SWarn, tool: STool, term: STerm, browser: SBrowser, compare: SCompare, recap: SRecap, outro: SOutro, quizQ: SQuiz, quizA: (p: P) => <SQuiz {...p} answer /> };

const subChunks = (spec: Spec, starts: number[]) => spec.scenes.flatMap((s, i) => {
  const parts = s.vo.split(/(?<=[।?!,—])\s+/).reduce<string[]>((a, x) => { if (a.length && (a[a.length - 1].length < 26 || x.length < 10)) a[a.length - 1] += " " + x; else a.push(x); return a; }, []);
  const total = parts.reduce((n, x) => n + x.length, 0) || 1; let acc = 0; const b = starts[i] + LEAD;
  return parts.map((x) => { const from = b + (s.frames * acc) / total; acc += x.length; return { s: x, from, to: b + (s.frames * acc) / total }; });
});
const Fade: React.FC<{ len: number; children: React.ReactNode }> = ({ len, children }) => {
  const f = useCurrentFrame(); const o = Math.min(interpolate(f, [0, 9], [0, 1], clamp), interpolate(f, [len - 9, len], [1, 0], clamp));
  return <AbsoluteFill style={{ opacity: o }}>{children}</AbsoluteFill>;
};
export const HackVideo: React.FC<{ spec: Spec }> = ({ spec }) => {
  const f = useCurrentFrame();
  const lens = spec.scenes.map(sceneLen);
  const starts = lens.reduce<number[]>((a, _, i) => [...a, i ? a[i - 1] + lens[i - 1] : 15], []);
  const chunks = subChunks(spec, starts), cur = chunks.find((x) => f >= x.from && f < x.to + 4);
  const total = hackLen(spec);
  const busy = (fr: number) => spec.scenes.some((s, i) => s.type === "term" && fr >= starts[i] && fr <= starts[i] + sceneLen(s));
  return (
    <AbsoluteFill style={{ background: C.bg0 }}>
      <Scan />
      {spec.scenes.map((s, i) => { const S = MAP[s.type] || SPoints; const len = lens[i]; return (
        <Sequence key={i} from={starts[i]} durationInFrames={len}>
          <Fade len={len}><S s={s} spec={spec} vo={s.frames} /></Fade>
          <Sequence from={LEAD}><Audio src={staticFile(`hacklab/${spec.id}/vo/${String(i + 1).padStart(2, "0")}.mp3`)} /></Sequence>
          <Sequence from={0}><Audio src={staticFile(`aiu2/${i === 0 ? "swell" : s.type === "warn" ? "hit" : s.type === "recap" || s.type === "outro" || s.type === "quizA" ? "chime" : "whoosh"}.mp3`)} volume={0.16} /></Sequence>
        </Sequence>); })}
      {/* bottom strip: brand · subtitle · lesson */}
      <div style={{ position: "absolute", left: 44, bottom: 24, display: "flex", alignItems: "center", gap: 12 }}><Img src={staticFile("academy/_brand/aiu-logo-dark.svg")} style={{ height: 30 }} /><span style={{ fontFamily: BN, fontSize: 22, color: C.faint }}>{spec.course}</span></div>
      <div style={{ position: "absolute", right: 44, bottom: 28, fontFamily: BN, fontSize: 22, color: C.faint }}>{spec.lessonNo} · এআই কণ্ঠ</div>
      {cur && <div style={{ position: "absolute", left: 0, right: 0, bottom: 74, display: "flex", justifyContent: "center", opacity: interpolate(f, [cur.from, cur.from + 5, cur.to, cur.to + 4], [0, 1, 1, 0], clamp) }}><div style={{ maxWidth: 1280, padding: "8px 26px", borderRadius: 12, background: "rgba(5,8,12,.86)", border: `1px solid ${C.line2}`, fontFamily: BN, fontSize: 32, fontWeight: 500, color: "#fff", textAlign: "center", lineHeight: 1.35 }}>{cur.s.replace(/[।,]$/, "")}</div></div>}
      <Audio src={staticFile("aiu2/music.mp3")} volume={(fr) => (busy(fr) ? 0.03 : 0.08) * interpolate(fr, [0, 30, total - 60, total], [0, 1, 1, 0], clamp)} />
    </AbsoluteFill>
  );
};
