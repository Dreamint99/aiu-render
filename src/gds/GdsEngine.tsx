// AI University — GDS / air-ticketing lesson video engine ("ট্রাভেল এজেন্সি এয়ার টিকেটিং মাস্টার কোর্স").
// Same light classroom look as IeltsEngine (the owner liked it) + a "screen recording" of the site's টিকেটিং ল্যাব:
// mouse moves to the command line, the command is typed key by key (click sounds), Enter, the lab's REAL answer
// (captured by scripts/gds_capture.mjs) prints line by line, then the camera zooms to each marked part with a numbered callout.
// Spec: src/gds/specs/<id>.json, timed by scripts/gds_make.py. Scene types:
// title · points · term · anatomy · gds3 · flow · vs · note · myth · recap · quizQ · quizA · outro
import React from "react";
import { AbsoluteFill, Audio, Img, Sequence, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig, Easing, delayRender, continueRender } from "remotion";
import { loadFont } from "@remotion/google-fonts/JetBrainsMono";
import {
  Target, Check, X, ArrowRight, Timer, CircleCheck, TriangleAlert, Lightbulb, Sparkles, Bot, Plane, List, Send, Search, Ticket, Users, Baby,
  RotateCcw, Banknote, FileText, Clock, Globe, ShieldCheck, Briefcase, Luggage, CreditCard, MousePointer2, Keyboard, CornerDownLeft, Monitor,
} from "lucide-react";

const { fontFamily: MONO } = loadFont("normal", { weights: ["400", "700"], subsets: ["latin"] });
const C = { bg: "#F4F7FC", card: "#FFFFFF", ink: "#0B1430", txt: "#1C2440", mute: "#5B6382", faint: "#8B92AD", line: "#E2E7F1", brand: "#0050ED", brand2: "#0090DB", navy: "#011835", soft: "#E9F1FF", green: "#12936A", gsoft: "#E7F8F0", amber: "#F59E0B", asoft: "#FDF3E1", red: "#D63C3C", rsoft: "#FDECEC",
  term: "#0A1628", termTxt: "#CFE3FF", termCmd: "#FFD27A", termOk: "#7CF0B4", termErr: "#FF8A8A" };
const GRAD = `linear-gradient(95deg, ${C.brand}, ${C.brand2})`;
const BN = "Anek", EN = "Montserrat";
if (typeof document !== "undefined") {
  for (const [n, u] of [["Anek", "fonts/AnekBangla.ttf"], ["Montserrat", "fonts/Montserrat.ttf"]]) {
    const h = delayRender(`font ${n}`);
    const f = new FontFace(n, `url(${staticFile(u)})`, { weight: "100 900" });
    f.load().then(() => { document.fonts.add(f); continueRender(h); }).catch(() => continueRender(h));
  }
}
export const ICONS: Record<string, React.FC<any>> = { list: List, send: Send, search: Search, ticket: Ticket, users: Users, baby: Baby, plane: Plane, refund: RotateCcw, money: Banknote, "file-text": FileText, clock: Clock, globe: Globe, shield: ShieldCheck, briefcase: Briefcase, luggage: Luggage, card: CreditCard, lightbulb: Lightbulb, alert: TriangleAlert, target: Target, monitor: Monitor, keyboard: Keyboard };
const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const ease = Easing.bezier(0.16, 1, 0.3, 1);
const bn = (n: number | string) => String(n).replace(/\d/g, (d) => "০১২৩৪৫৬৭৮৯"[+d]);
const ent = (f: number, fps: number, d: number, dur = 24) => spring({ frame: f - d, fps, config: { damping: 200 }, durationInFrames: dur });
const pop = (f: number, fps: number, d: number) => spring({ frame: f - d, fps, config: { damping: 12, mass: 0.6 } });
const isBn = (s: string) => /[ঀ-৿]/.test(s);

export type Mark = { line: number; find: string; label: string; at?: number };
export type Scene = { type: string; vo: string; frames: number; hold?: number; [k: string]: any };
export type Spec = { id: string; course: string; module: string; lessonNo: string; title: string; next: string; scenes: Scene[] };
const LEAD = 12, TAIL = 16;
const sceneLen = (s: Scene) => LEAD + s.frames + (s.hold || 0) + TAIL + (s.type === "term" ? termExtra(s) : 0);
export const gdsLen = (spec: Spec) => spec.scenes.reduce((n, s) => n + sceneLen(s), 0) + 30;
type P = { s: Scene; spec: Spec; vo: number };
const v = (p: P, x: number) => LEAD + p.vo * x;

/* ---------- primitives (same as IeltsEngine) ---------- */
const Rise: React.FC<{ d: number; children: React.ReactNode; style?: React.CSSProperties; y?: number }> = ({ d, children, style, y = 40 }) => {
  const f = useCurrentFrame(); const { fps } = useVideoConfig(); const s = ent(f, fps, d);
  return <div style={{ opacity: s, transform: `translateY(${(1 - s) * y}px)`, ...style }}>{children}</div>;
};
const H: React.FC<{ d: number; size: number; children: React.ReactNode; color?: string }> = ({ d, size, children, color = C.ink }) => {
  const f = useCurrentFrame(); const { fps } = useVideoConfig(); const s = ent(f, fps, d, 28);
  return <div style={{ overflow: "hidden", paddingTop: size * 0.16, paddingBottom: size * 0.22, marginTop: -size * 0.16, marginBottom: -size * 0.22 }}><div style={{ fontFamily: BN, fontSize: size, fontWeight: 800, color, lineHeight: 1.25, transform: `translateY(${(1 - s) * 110}%)` }}>{children}</div></div>;
};
const Card: React.FC<{ children: React.ReactNode; style?: React.CSSProperties }> = ({ children, style }) => (
  <div style={{ background: C.card, borderRadius: 26, border: `1px solid ${C.line}`, boxShadow: "0 24px 60px rgba(16,24,64,.10)", ...style }}>{children}</div>
);
const Head: React.FC<{ h: [string, string] | string; d?: number; top?: number }> = ({ h, d = 4, top = 140 }) => (
  <div style={{ position: "absolute", left: 130, top, right: 130 }}><H d={d} size={58}>{Array.isArray(h) ? <>{h[0]}<span style={{ color: C.brand }}>{h[1]}</span></> : h}</H></div>
);
const Code: React.FC<{ children: React.ReactNode; size?: number; style?: React.CSSProperties }> = ({ children, size = 30, style }) => (
  <span style={{ fontFamily: MONO, fontWeight: 700, fontSize: size, color: C.navy, background: C.soft, border: `2px solid ${C.brand}33`, borderRadius: 12, padding: "4px 14px", letterSpacing: "0.02em", ...style }}>{children}</span>
);
// text with command-like tokens (SS2Y1, NN, HK …) set in the mono font
const Mixed: React.FC<{ t: string }> = ({ t }) => <>{t.split(/(\b[A-Z0-9]{2,}[A-Z0-9/]*\b)/).map((x, i) => (i % 2 ? <span key={i} style={{ fontFamily: MONO, fontWeight: 700 }}>{x}</span> : <span key={i}>{x}</span>))}</>;

/* ---------- scenes ---------- */
const STitle: React.FC<P> = (p) => {
  const { s, spec } = p; const f = useCurrentFrame();
  const k = interpolate(f, [10, 130], [0, 1], { ...clamp, easing: Easing.inOut(Easing.cubic) });
  const px = 140 + k * 700, py = 900 - Math.sin(k * Math.PI) * 120;
  return (
    <AbsoluteFill>
      <svg width={1920} height={1080} style={{ position: "absolute", inset: 0 }}>
        <path d="M140 900 Q 490 660 840 900" stroke={C.brand} strokeWidth={4} strokeDasharray="4 16" strokeLinecap="round" fill="none" opacity={0.35} />
      </svg>
      <div style={{ position: "absolute", left: px - 26, top: py - 26, transform: `rotate(${interpolate(k, [0, 0.5, 1], [-35, 0, 35])}deg)` }}><Plane size={52} color={C.brand} fill={C.brand} /></div>
      <div style={{ position: "absolute", left: 130, top: 210, width: 880 }}>
        <Rise d={4}><span style={{ display: "inline-flex", gap: 10, alignItems: "center", padding: "10px 22px", borderRadius: 40, background: C.soft, color: C.brand, fontFamily: BN, fontSize: 30, fontWeight: 700 }}><Ticket size={30} /> {spec.module} · {spec.lessonNo}</span></Rise>
        <div style={{ marginTop: 30 }}><H d={10} size={84}>{spec.title}</H></div>
        <Rise d={24} style={{ marginTop: 26 }}><span style={{ fontFamily: BN, fontSize: 34, color: C.mute }}>{spec.course}</span></Rise>
      </div>
      <Card style={{ position: "absolute", right: 130, top: 220, width: 760, padding: "40px 44px" }}>
        <Rise d={v(p, 0.2)}><div style={{ display: "flex", alignItems: "center", gap: 14, fontFamily: BN, fontSize: 36, fontWeight: 800, color: C.ink }}><Target size={40} color={C.brand} /> এই পাঠে যা শিখবেন</div></Rise>
        {s.goals.map((g: string, i: number) => (
          <Rise key={i} d={v(p, 0.32 + i * 0.13)} y={24} style={{ display: "flex", gap: 18, alignItems: "flex-start", marginTop: 26 }}>
            <div style={{ width: 44, height: 44, borderRadius: 22, background: C.gsoft, display: "grid", placeItems: "center", flex: "none" }}><Check size={26} color={C.green} strokeWidth={3} /></div>
            <span style={{ fontFamily: BN, fontSize: 34, color: C.txt, lineHeight: 1.35 }}><Mixed t={g} /></span>
          </Rise>
        ))}
      </Card>
    </AbsoluteFill>
  );
};

const SPoints: React.FC<P> = (p) => {
  const { s } = p; const n = s.items.length; const cols = n > 3 ? 2 : 1;
  return (
    <AbsoluteFill>
      <Head h={s.head} />
      <div style={{ position: "absolute", left: 130, right: 130, top: 280, display: "grid", gridTemplateColumns: `repeat(${cols}, 1fr)`, gap: 26 }}>
        {s.items.map((it: any, i: number) => {
          const I = ICONS[it.icon] || Lightbulb;
          return (
            <Rise key={i} d={v(p, 0.06 + (i / n) * 0.75)} y={26}>
              <Card style={{ padding: "30px 34px", display: "flex", gap: 28, alignItems: "center", boxShadow: "none" }}>
                <div style={{ width: 88, height: 88, borderRadius: 24, background: GRAD, display: "grid", placeItems: "center", flex: "none" }}><I size={46} color="#fff" strokeWidth={1.8} /></div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontFamily: BN, fontSize: 42, fontWeight: 800, color: C.ink, lineHeight: 1.25 }}>{it.t}</div>
                  {it.s && <div style={{ fontFamily: BN, fontSize: 31, color: C.mute, marginTop: 6, lineHeight: 1.4 }}>{it.s}</div>}
                </div>
                {it.code && <Code size={34}>{it.code}</Code>}
              </Card>
            </Rise>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};

/* --- the "screen recording" of the টিকেটিং ল্যাব --- */
const CPS = 3, LPF = 3;   // frames per typed character, frames per printed line
function termExtra(s: Scene) {   // keep the scene on screen until every callout had time to be read
  const need = 22 + s.cmd.length * CPS + 16 + (s.screen?.length || 0) * LPF + (s.marks?.length || 0) * 10 + 60;
  return Math.max(0, need - s.frames);
}
const WIN = { x: 64, y: 124, w: 1250, h: 790 }, BAR = 54, TASK = 58, INPUT = 76;
const termTimes = (p: P) => {
  const s = p.s, t0 = LEAD + 22, typed = t0 + s.cmd.length * CPS, enter = typed + 10, shown = enter + 6 + (s.screen?.length || 0) * LPF;
  return { t0, typed, enter, shown };
};
const STerm: React.FC<P> = (p) => {
  const { s } = p; const f = useCurrentFrame(); const { fps } = useVideoConfig();
  const T = termTimes(p); const lines: string[] = (s.screen || []);
  const mono = lines.filter((l) => !/^টিপ/.test(l)), tips = lines.filter((l) => /^টিপ/.test(l));
  const maxLen = Math.max(40, ...mono.map((l) => (isBn(l) ? l.length * 0.8 : l.length)), s.cmd.length + 2);
  const fs = Math.min(28, (WIN.w - 90) / (maxLen * 0.6)), lh = fs * 1.5, cw = fs * 0.6;
  const typedN = Math.max(0, Math.min(s.cmd.length, Math.floor((f - T.t0) / CPS) + 1));
  const typing = f >= T.t0 && f < T.enter;
  const marks: (Mark & { t: number; n: number })[] = (s.marks || []).map((m: Mark, i: number) => ({ ...m, n: i + 1, t: Math.max(T.shown + 8 + i * 10, v(p, m.at ?? 0.4 + (0.5 * i) / Math.max(1, s.marks.length))) }));
  // camera: zoom towards the most recent mark (content-space coordinates)
  const bodyW = WIN.w, bodyH = WIN.h - BAR - TASK - INPUT, padX = 36, padY = 26;
  const posOf = (m: Mark) => { const L = m.line === -1 ? "" : mono[m.line] || ""; const col = m.find ? Math.max(0, L.indexOf(m.find)) : 0; const len = m.find ? m.find.length : L.length;
    return { x: padX + (col + len / 2) * cw, y: padY + (m.line + 1.5) * lh }; };
  const keys = [{ t: 0, x: bodyW / 2, y: bodyH / 2, z: 1 }, ...marks.map((m) => (m.find ? { t: m.t, ...posOf(m), z: s.zoom || 1.18 } : { t: m.t, x: bodyW / 2, y: bodyH / 2, z: 1 }))];
  let cam = keys[0];
  for (let i = 1; i < keys.length; i++) {
    const a = keys[i - 1], b = keys[i]; const k = interpolate(f, [b.t - 4, b.t + 16], [0, 1], { ...clamp, easing: Easing.inOut(Easing.cubic) });
    if (f >= b.t - 4) cam = { t: b.t, x: a.x + (b.x - a.x) * k, y: a.y + (b.y - a.y) * k, z: a.z + (b.z - a.z) * k };
  }
  const endBack = interpolate(f, [LEAD + p.vo - 10, LEAD + p.vo + 8], [0, 1], { ...clamp, easing: Easing.inOut(Easing.cubic) });
  const z = cam.z + (1 - cam.z) * endBack, cx = cam.x + (bodyW / 2 - cam.x) * endBack, cy = cam.y + (bodyH / 2 - cam.y) * endBack;
  // never pan past the printed text: short screens stay anchored top-left, wide ones may slide just enough
  const contentW = padX * 2 + maxLen * cw, contentH = padY * 2 + (mono.length + 2) * lh + tips.length * lh * 2.6;
  const tx = Math.min(0, Math.max(Math.min(0, bodyW - Math.max(bodyW, contentW) * z), bodyW / 2 - cx * z)), ty = Math.min(0, Math.max(Math.min(0, bodyH - Math.max(bodyH * 0.6, contentH) * z), bodyH / 2 - cy * z));
  // mouse pointer glides to the input line and clicks
  const mk = interpolate(f, [LEAD - 4, T.t0 - 6], [0, 1], { ...clamp, easing: Easing.inOut(Easing.cubic) });
  const mx = WIN.x + 1150 + (WIN.x + 260 - (WIN.x + 1150)) * mk, my = WIN.y + 300 + (WIN.y + WIN.h - INPUT / 2 + 10 - (WIN.y + 300)) * mk;
  const click = interpolate(f, [T.t0 - 6, T.t0 + 8], [0, 1], clamp);
  const enterK = f >= T.enter - 2 && f < T.enter + 10;
  const segLine = (L: string, li: number) => {
    const color = s.err && li === 0 ? C.termErr : /HK\d|OK |TICKET/.test(L) ? C.termOk : C.termTxt;
    // every visible mark on this line: [start, end, mark], left to right, no overlaps
    const ms = marks.filter((m) => m.line === li && f >= m.t).map((m) => { const at = m.find ? L.indexOf(m.find) : 0; return { m, at, end: at + (m.find ? m.find.length : L.length) }; })
      .filter((x) => x.at >= 0).sort((x, y) => x.at - y.at).filter((x, i, arr) => !i || x.at >= arr[i - 1].end);
    if (!ms.length) return <span style={{ color }}>{L || " "}</span>;
    const out: React.ReactNode[] = []; let pos = 0;
    for (const { m, at, end } of ms) {
      const k = Math.min(1, pop(f, fps, m.t)), b = lh * 0.62;
      out.push(<span key={"p" + m.n}>{L.slice(pos, at)}</span>);
      out.push(<span key={"m" + m.n} style={{ position: "relative", color: "#fff", background: `${C.amber}${Math.round(k * 90).toString(16).padStart(2, "0")}`, boxShadow: `0 0 0 ${3 * k}px ${C.amber}`, borderRadius: 4 }}>{L.slice(at, end)}
        <span style={{ position: "absolute", right: -b * 0.55, top: -b * 0.55, transform: `scale(${k})`, width: b, height: b, borderRadius: b, background: C.amber, color: C.navy, fontFamily: BN, fontWeight: 800, fontSize: b * 0.7, lineHeight: `${b}px`, textAlign: "center", boxShadow: "0 2px 6px rgba(0,0,0,.4)" }}>{bn(m.n)}</span></span>);
      pos = end;
    }
    out.push(<span key="end">{L.slice(pos)}</span>);
    return <span style={{ color }}>{out}</span>;
  };
  return (
    <AbsoluteFill>
      {/* app window */}
      <Rise d={2} y={30} style={{ position: "absolute", left: WIN.x, top: WIN.y, width: WIN.w, height: WIN.h }}>
        <div style={{ width: "100%", height: "100%", borderRadius: 18, overflow: "hidden", background: "#fff", border: `1px solid ${C.line}`, boxShadow: "0 30px 80px rgba(16,24,64,.22)", display: "flex", flexDirection: "column" }}>
          <div style={{ height: BAR, display: "flex", alignItems: "center", gap: 10, padding: "0 20px", background: "#EEF2F9", borderBottom: `1px solid ${C.line}` }}>
            {["#FF5F57", "#FEBC2E", "#28C840"].map((c) => <div key={c} style={{ width: 15, height: 15, borderRadius: 8, background: c }} />)}
            <div style={{ marginLeft: 18, fontFamily: BN, fontSize: 23, fontWeight: 700, color: C.ink }}>টিকেটিং ল্যাব</div>
            <div style={{ fontFamily: BN, fontSize: 19, color: C.mute }}>· শিক্ষামূলক GDS সিমুলেটর (Amadeus-ধাঁচ)</div>
            <div style={{ marginLeft: "auto", fontFamily: BN, fontSize: 17, color: C.red, background: C.rsoft, padding: "4px 12px", borderRadius: 20 }}>আসল GDS নয় · ফ্লাইট-ভাড়া কাল্পনিক</div>
          </div>
          <div style={{ height: TASK, display: "flex", alignItems: "center", gap: 12, padding: "0 22px", background: C.soft, borderBottom: `1px solid ${C.line}`, fontFamily: BN, fontSize: 25, color: C.ink, fontWeight: 600 }}>
            <Target size={26} color={C.brand} /> {s.task}
          </div>
          <div style={{ position: "relative", flex: 1, background: C.term, overflow: "hidden" }}>
            <div style={{ position: "absolute", left: 0, top: 0, width: bodyW, height: bodyH, transformOrigin: "0 0", transform: `translate(${tx}px, ${ty}px) scale(${z})` }}>
              <div style={{ position: "absolute", left: padX, top: padY, fontFamily: MONO, fontSize: fs, lineHeight: `${lh}px`, whiteSpace: "pre" }}>
                {f >= T.enter && <div style={{ color: C.termCmd, fontWeight: 700 }}>&gt;{s.cmd}</div>}
                {mono.map((L, i) => (f >= T.enter + 6 + i * LPF ? <div key={i} style={{ fontFamily: isBn(L) ? `${MONO}, ${BN}` : MONO }}>{segLine(L, i)}</div> : null))}
                {tips.map((L, i) => (f >= T.shown ? <div key={"t" + i} style={{ whiteSpace: "normal", width: bodyW - padX * 2 - 20, marginTop: 14, padding: "12px 18px", borderRadius: 12, background: "#1B2A44", borderLeft: `5px solid ${C.amber}`, fontFamily: BN, fontSize: fs * 0.95, lineHeight: 1.45, color: "#F4E3BC" }}>💡 {L.replace(/^টিপ[:\s]*/, "")}</div> : null))}
              </div>
            </div>
          </div>
          <div style={{ height: INPUT, display: "flex", alignItems: "center", gap: 14, padding: "0 22px", background: "#fff", borderTop: `1px solid ${C.line}` }}>
            <span style={{ fontFamily: MONO, fontSize: 30, fontWeight: 700, color: C.brand }}>&gt;</span>
            <div style={{ flex: 1, height: 50, borderRadius: 10, border: `2px solid ${f >= T.t0 - 6 && f < T.enter ? C.brand : C.line}`, display: "flex", alignItems: "center", padding: "0 16px", fontFamily: MONO, fontSize: 30, fontWeight: 700, color: C.navy }}>
              {f < T.enter ? s.cmd.slice(0, f >= T.t0 ? typedN : 0) : ""}
              {f >= T.t0 - 6 && f < T.enter + 30 && Math.floor(f / 15) % 2 === 0 && <span style={{ width: 3, height: 32, background: C.navy, marginLeft: 2 }} />}
              {f < T.t0 - 6 && <span style={{ fontFamily: BN, fontSize: 22, fontWeight: 400, color: C.faint }}>কমান্ড লিখে Enter চাপুন</span>}
            </div>
            {/* key caps: last key + Enter */}
            <div style={{ display: "flex", gap: 10 }}>
              {typing && f < T.typed + 2 && <div style={{ minWidth: 54, height: 50, borderRadius: 10, background: C.navy, color: "#fff", display: "grid", placeItems: "center", fontFamily: MONO, fontSize: 28, fontWeight: 700, boxShadow: `0 ${(f - T.t0) % CPS === 0 ? 1 : 4}px 0 #000`, transform: `translateY(${(f - T.t0) % CPS === 0 ? 3 : 0}px)` }}>{s.cmd[typedN - 1] === " " ? "␣" : s.cmd[typedN - 1]}</div>}
              <div style={{ height: 50, padding: "0 16px", borderRadius: 10, background: enterK ? C.green : C.soft, color: enterK ? "#fff" : C.brand, display: "flex", alignItems: "center", gap: 8, fontFamily: EN, fontSize: 20, fontWeight: 800, transform: `translateY(${enterK ? 3 : 0}px)` }}><CornerDownLeft size={24} /> ENTER</div>
            </div>
          </div>
        </div>
      </Rise>
      {/* pointer */}
      {f < T.enter + 20 && <div style={{ position: "absolute", left: mx, top: my, opacity: interpolate(f, [LEAD - 4, LEAD + 4, T.enter + 4, T.enter + 20], [0, 1, 1, 0], clamp) }}>
        {click > 0 && click < 1 && <div style={{ position: "absolute", left: -30 * click, top: -30 * click, width: 60 * click, height: 60 * click, borderRadius: 60, border: `3px solid ${C.brand}`, opacity: 1 - click }} />}
        <MousePointer2 size={44} color="#fff" fill={C.navy} strokeWidth={1.5} />
      </div>}
      {/* right panel: command + numbered callouts */}
      <div style={{ position: "absolute", left: WIN.x + WIN.w + 34, right: 50, top: WIN.y, display: "flex", flexDirection: "column", gap: 16 }}>
        <Rise d={T.t0}>
          <Card style={{ padding: "18px 22px", boxShadow: "none" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, fontFamily: BN, fontSize: 23, color: C.mute }}><Keyboard size={24} color={C.brand} /> কমান্ড</div>
            <div style={{ fontFamily: MONO, fontWeight: 700, fontSize: Math.min(40, 480 / (s.cmd.length * 0.6)), color: C.navy, marginTop: 6, whiteSpace: "nowrap" }}>{s.cmd.slice(0, f >= T.t0 ? typedN : 0)}</div>
          </Card>
        </Rise>
        {s.err && f >= T.shown && <Rise d={T.shown}><div style={{ display: "flex", alignItems: "center", gap: 12, padding: "14px 18px", borderRadius: 16, background: C.rsoft, border: `2px solid ${C.red}55`, fontFamily: BN, fontSize: 27, fontWeight: 700, color: C.red }}><X size={30} strokeWidth={3} /> সিস্টেম কমান্ডটা নেয়নি</div></Rise>}
        {marks.map((m) => (f >= m.t ? (
          <Rise key={m.n} d={m.t} y={20}>
            <div style={{ display: "flex", gap: 14, alignItems: "flex-start", padding: "14px 18px", borderRadius: 16, background: "#fff", border: `2px solid ${C.amber}66` }}>
              <div style={{ width: 40, height: 40, borderRadius: 20, background: C.amber, color: C.navy, display: "grid", placeItems: "center", fontFamily: BN, fontWeight: 800, fontSize: 24, flex: "none" }}>{bn(m.n)}</div>
              <span style={{ fontFamily: BN, fontSize: 27, color: C.ink, lineHeight: 1.35, fontWeight: 600 }}><Mixed t={m.label} /></span>
            </div>
          </Rise>) : null))}
      </div>
      {/* typing clicks */}
      {Array.from({ length: s.cmd.length }, (_, i) => <Sequence key={i} from={T.t0 + i * CPS} durationInFrames={6}><Audio src={staticFile("gdsfx/key.mp3")} volume={0.35} /></Sequence>)}
      <Sequence from={T.enter} durationInFrames={10}><Audio src={staticFile("gdsfx/enter.mp3")} volume={0.45} /></Sequence>
    </AbsoluteFill>
  );
};

// a command split into coloured chunks, each with its Bangla meaning below
const PAL = ["#0050ED", "#12936A", "#D97706", "#9333EA", "#DB2777", "#0891B2", "#65A30D", "#DC2626"];
const SAnatomy: React.FC<P> = (p) => {
  const { s } = p; const f = useCurrentFrame(); const { fps } = useVideoConfig(); const n = s.parts.length;
  const total = s.parts.reduce((a: number, x: any) => a + x.t.length, 0); const fs = Math.min(120, 1500 / (total * 0.6 + n * 0.9));
  return (
    <AbsoluteFill>
      <Head h={s.head} />
      {s.gds && <Rise d={8} style={{ position: "absolute", left: 130, top: 250 }}><span style={{ padding: "8px 20px", borderRadius: 30, background: C.navy, color: "#fff", fontFamily: EN, fontWeight: 700, fontSize: 24 }}>{s.gds}</span></Rise>}
      <div style={{ position: "absolute", left: 0, right: 0, top: 380, display: "flex", justifyContent: "center", gap: fs * 0.18 }}>
        {s.parts.map((x: any, i: number) => {
          const d = v(p, 0.1 + (i / n) * 0.78); const k = pop(f, fps, d); const on = f >= d;
          return (
            <div key={i} style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
              <div style={{ fontFamily: MONO, fontWeight: 700, fontSize: fs, lineHeight: 1.15, padding: `0 ${fs * 0.12}px`, borderRadius: 14, color: on ? "#fff" : C.navy, background: on ? PAL[i % PAL.length] : "#fff", border: `3px solid ${on ? PAL[i % PAL.length] : C.line}`, transform: `translateY(${on ? -8 * Math.min(1, k) : 0}px)`, boxShadow: on ? `0 16px 30px ${PAL[i % PAL.length]}44` : "none" }}>{x.t}</div>
              <div style={{ width: 3, height: 60 * Math.min(1, k), background: PAL[i % PAL.length], marginTop: 10 }} />
              <div style={{ opacity: Math.min(1, k), transform: `scale(${0.7 + 0.3 * Math.min(1, k)})`, fontFamily: BN, fontSize: Math.min(34, fs * 0.42), fontWeight: 700, color: PAL[i % PAL.length], textAlign: "center", maxWidth: Math.max(160, x.t.length * fs * 0.6 + 40), lineHeight: 1.25, marginTop: 6 }}>{x.l}</div>
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};

// the same task in Amadeus / Sabre / Galileo
const SGds3: React.FC<P> = (p) => {
  const { s } = p; const n = s.rows.length;
  const longest = Math.max(...s.rows.flatMap((r: any) => [r.a, r.s, r.g].map((x: string) => x.length)));
  const fs = Math.min(34, 400 / (longest * 0.6));
  const cols = "430px 1fr 1fr 1fr";
  return (
    <AbsoluteFill>
      <Head h={s.head} />
      <div style={{ position: "absolute", left: 110, right: 110, top: 270 }}>
        <Rise d={6}><div style={{ display: "grid", gridTemplateColumns: cols, gap: 14, marginBottom: 14 }}>
          <div />{[["Amadeus", "#0050ED"], ["Sabre", "#DC2626"], ["Galileo (Travelport)", "#12936A"]].map(([t, c]) => <div key={t} style={{ padding: "16px 0", borderRadius: 16, background: c, color: "#fff", textAlign: "center", fontFamily: EN, fontWeight: 800, fontSize: 28 }}>{t}</div>)}
        </div></Rise>
        {s.rows.map((r: any, i: number) => (
          <Rise key={i} d={v(p, 0.08 + (i / n) * 0.8)} y={24}>
            <div style={{ display: "grid", gridTemplateColumns: cols, gap: 14, marginBottom: 14 }}>
              <Card style={{ padding: "22px 24px", boxShadow: "none", display: "flex", alignItems: "center", fontFamily: BN, fontSize: 30, fontWeight: 700, color: C.ink, lineHeight: 1.3 }}>{r.t}</Card>
              {[r.a, r.s, r.g].map((x: string, j: number) => <Card key={j} style={{ padding: "22px 10px", boxShadow: "none", display: "grid", placeItems: "center", fontFamily: MONO, fontWeight: 700, fontSize: fs, color: C.navy, background: "#FAFCFF" }}>{x}</Card>)}
            </div>
          </Rise>
        ))}
      </div>
    </AbsoluteFill>
  );
};

const SNote: React.FC<P> = (p) => {
  const { s } = p; const f = useCurrentFrame(); const { fps } = useVideoConfig(); const k = pop(f, fps, 4);
  return (
    <AbsoluteFill style={{ alignItems: "center", justifyContent: "center" }}>
      <Card style={{ width: 1440, padding: "56px 64px", background: C.asoft, border: `2px solid ${C.amber}66`, display: "flex", gap: 46, alignItems: "center", marginTop: -40 }}>
        <div style={{ width: 160, height: 160, borderRadius: 40, background: C.amber, display: "grid", placeItems: "center", flex: "none", transform: `scale(${k}) rotate(${(1 - k) * -20}deg)` }}><TriangleAlert size={92} color="#fff" strokeWidth={1.8} /></div>
        <div>
          <H d={8} size={56} color={C.amber}>{s.head}</H>
          <Rise d={v(p, 0.1)} style={{ marginTop: 12 }}><div style={{ fontFamily: BN, fontSize: 42, fontWeight: 800, color: C.ink, lineHeight: 1.3 }}><Mixed t={s.text} /></div></Rise>
          {s.sub && <Rise d={v(p, 0.55)} style={{ marginTop: 16 }}><div style={{ fontFamily: BN, fontSize: 31, color: C.mute }}><Mixed t={s.sub} /></div></Rise>}
        </div>
      </Card>
    </AbsoluteFill>
  );
};

const SMyth: React.FC<P> = (p) => {
  const { s } = p; const f = useCurrentFrame();
  const strike = interpolate(f, [v(p, 0.3), v(p, 0.38)], [0, 1], { ...clamp, easing: ease });
  return (
    <AbsoluteFill>
      <div style={{ position: "absolute", left: 130, top: 170 }}><Rise d={4}><span style={{ fontFamily: BN, fontSize: 30, fontWeight: 800, color: C.red }}>সাধারণ ভুল</span></Rise></div>
      <Rise d={v(p, 0.04)} style={{ position: "absolute", left: 130, right: 130, top: 240 }}>
        <Card style={{ padding: "36px 44px", background: C.rsoft, border: `1px solid ${C.red}33`, boxShadow: "none" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 18 }}><div style={{ width: 56, height: 56, borderRadius: 28, background: C.red, display: "grid", placeItems: "center" }}><X size={34} color="#fff" strokeWidth={3} /></div><span style={{ fontFamily: BN, fontSize: 30, color: C.red, fontWeight: 700 }}>ভুল</span></div>
          <div style={{ position: "relative", display: "inline-block", marginTop: 18 }}><span style={{ fontFamily: BN, fontSize: 56, fontWeight: 800, color: C.ink }}><Mixed t={s.wrong} /></span><div style={{ position: "absolute", left: 0, top: "55%", height: 6, borderRadius: 3, width: `${strike * 100}%`, background: C.red }} /></div>
        </Card>
      </Rise>
      <Rise d={v(p, 0.42)} style={{ position: "absolute", left: 130, right: 130, top: 540 }}>
        <Card style={{ padding: "36px 44px", background: C.gsoft, border: `1px solid ${C.green}33`, boxShadow: "none" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 18 }}><div style={{ width: 56, height: 56, borderRadius: 28, background: C.green, display: "grid", placeItems: "center" }}><Check size={34} color="#fff" strokeWidth={3} /></div><span style={{ fontFamily: BN, fontSize: 30, color: C.green, fontWeight: 700 }}>সঠিক</span></div>
          <div style={{ fontFamily: BN, fontSize: 52, fontWeight: 800, color: C.ink, marginTop: 14 }}><Mixed t={s.right} /></div>
          {s.sub && <div style={{ fontFamily: BN, fontSize: 31, color: C.mute, marginTop: 8 }}><Mixed t={s.sub} /></div>}
        </Card>
      </Rise>
    </AbsoluteFill>
  );
};

const SRecap: React.FC<P> = (p) => (
  <AbsoluteFill>
    <Head h={["আজ যা ", "শিখলাম"]} />
    <div style={{ position: "absolute", left: 130, right: 130, top: 280, display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 20 }}>
      {p.s.items.map((t: string, i: number) => (
        <Rise key={i} d={v(p, 0.08 + i * 0.12)} y={26}>
          <Card style={{ padding: "26px 28px", display: "flex", gap: 18, alignItems: "center", boxShadow: "none" }}>
            <CircleCheck size={44} color={C.green} strokeWidth={2} style={{ flex: "none" }} />
            <span style={{ fontFamily: BN, fontSize: 34, fontWeight: 700, color: C.ink, lineHeight: 1.3 }}><Mixed t={t} /></span>
          </Card>
        </Rise>
      ))}
    </div>
  </AbsoluteFill>
);

const SQuiz: React.FC<P & { answer?: boolean }> = (p) => {
  const { s } = p; const f = useCurrentFrame();
  const holdStart = LEAD + p.vo, hold = s.hold || 0;
  const left = p.answer ? 0 : Math.max(0, Math.ceil((holdStart + hold - f) / 30));
  const ring = p.answer ? 0 : interpolate(f, [holdStart, holdStart + hold], [1, 0], clamp);
  return (
    <AbsoluteFill>
      <div style={{ position: "absolute", left: 130, top: 140 }}><Rise d={2}><span style={{ fontFamily: EN, fontSize: 22, fontWeight: 800, letterSpacing: "0.28em", color: C.green }}>QUICK CHECK</span></Rise></div>
      <Card style={{ position: "absolute", left: 130, right: 130, top: 200, padding: "40px 48px" }}>
        <div style={{ fontFamily: BN, fontSize: 46, fontWeight: 800, color: C.ink, lineHeight: 1.3 }}><Mixed t={s.q} /></div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 18, marginTop: 30 }}>
          {s.o.map((o: string, i: number) => {
            const right = p.answer && i === s.a;
            return (
              <Rise key={i} d={p.answer ? 0 : v(p, 0.2 + i * 0.1)} y={18} style={{ display: "flex", alignItems: "center", gap: 20, padding: "22px 26px", borderRadius: 20, border: `3px solid ${right ? C.green : C.line}`, background: right ? C.gsoft : "#fff", opacity: p.answer && !right ? 0.5 : 1 }}>
                <div style={{ width: 52, height: 52, borderRadius: 26, background: right ? C.green : C.soft, color: right ? "#fff" : C.brand, display: "grid", placeItems: "center", fontFamily: BN, fontWeight: 800, fontSize: 26, flex: "none" }}>{right ? <Check size={30} strokeWidth={3.5} /> : "কখগঘ"[i]}</div>
                <span style={{ fontFamily: isBn(o) ? BN : MONO, fontSize: 38, fontWeight: 700, color: C.ink }}>{o}</span>
              </Rise>
            );
          })}
        </div>
        {p.answer && <Rise d={v(p, 0.25)} style={{ marginTop: 26, padding: "18px 24px", borderRadius: 16, background: C.gsoft, fontFamily: BN, fontSize: 31, color: C.green, fontWeight: 600, lineHeight: 1.4 }}>✔ <Mixed t={s.ex} /></Rise>}
      </Card>
      {!p.answer && hold > 0 && f >= holdStart && (
        <div style={{ position: "absolute", left: "50%", top: 840, transform: "translateX(-50%)", display: "flex", alignItems: "center", gap: 18 }}>
          <svg width={92} height={92} style={{ transform: "rotate(-90deg)" }}><circle cx={46} cy={46} r={40} stroke={C.line} strokeWidth={8} fill="none" /><circle cx={46} cy={46} r={40} stroke={C.brand} strokeWidth={8} fill="none" strokeDasharray={251} strokeDashoffset={251 * (1 - ring)} strokeLinecap="round" /></svg>
          <span style={{ fontFamily: BN, fontSize: 40, fontWeight: 800, color: C.ink }}><Timer size={34} style={{ verticalAlign: -4 }} /> ভাবুন… {bn(left)}</span>
        </div>
      )}
    </AbsoluteFill>
  );
};

const SOutro: React.FC<P> = (p) => {
  const { spec, s } = p; const f = useCurrentFrame(); const { fps } = useVideoConfig(); const k = pop(f, fps, 4);
  return (
    <AbsoluteFill style={{ alignItems: "center" }}>
      <div style={{ position: "absolute", top: 170, width: 160, height: 160, borderRadius: 80, background: C.green, display: "grid", placeItems: "center", transform: `scale(${k})`, boxShadow: `0 20px 60px ${C.green}55` }}><Check size={96} color="#fff" strokeWidth={3} /></div>
      <div style={{ position: "absolute", top: 380, textAlign: "center" }}><H d={10} size={78}>{s.head || "এবার নিজে অনুশীলন করুন!"}</H></div>
      {s.cta && <Rise d={v(p, 0.15)} style={{ position: "absolute", top: 520 }}><div style={{ display: "flex", alignItems: "center", gap: 18, padding: "20px 34px", borderRadius: 20, background: C.soft, fontFamily: BN, fontSize: 34, fontWeight: 700, color: C.brand }}><Sparkles size={36} /> <Mixed t={s.cta} /></div></Rise>}
      <Rise d={v(p, 0.35)} style={{ position: "absolute", top: 650 }}>
        <Card style={{ display: "flex", alignItems: "center", gap: 24, padding: "26px 40px" }}>
          <span style={{ fontFamily: BN, fontSize: 30, color: C.mute }}>পরের পাঠ</span><ArrowRight size={34} color={C.brand} />
          <span style={{ fontFamily: BN, fontSize: 40, fontWeight: 800, color: C.ink }}>{spec.next}</span>
        </Card>
      </Rise>
      <Rise d={v(p, 0.55)} style={{ position: "absolute", top: 830 }}><Img src={staticFile("brand/logo.png")} style={{ height: 76 }} /></Rise>
    </AbsoluteFill>
  );
};

// a process as steps joined by arrows; the active step follows the narration
const SFlow: React.FC<P> = (p) => {
  const { s } = p; const f = useCurrentFrame(); const { fps } = useVideoConfig(); const n = s.steps.length;
  const cols = n <= 4 ? n : Math.ceil(n / 2), rows = Math.ceil(n / cols), w = (1660 - (cols - 1) * 70) / cols;
  return (
    <AbsoluteFill>
      <Head h={s.head} />
      <div style={{ position: "absolute", left: 130, right: 130, top: rows > 1 ? 270 : 340, display: "grid", gridTemplateColumns: `repeat(${cols}, ${w}px)`, columnGap: 70, rowGap: 50 }}>
        {s.steps.map((x: any, i: number) => {
          const d = v(p, 0.06 + (i / n) * 0.82); const k = Math.min(1, pop(f, fps, d)); const on = f >= d;
          const next = i + 1 < n ? v(p, 0.06 + ((i + 1) / n) * 0.82) : 1e9; const cur = on && f < next;
          const I = ICONS[x.icon] || CircleCheck;
          return (
            <div key={i} style={{ position: "relative", opacity: 0.25 + 0.75 * k, transform: `translateY(${(1 - k) * 30}px)` }}>
              <Card style={{ padding: "26px 24px", minHeight: rows > 1 ? 230 : 300, border: `3px solid ${cur ? C.brand : on ? `${C.brand}55` : C.line}`, boxShadow: cur ? `0 24px 60px ${C.brand}33` : "none", display: "flex", flexDirection: "column", gap: 12 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                  <div style={{ width: 62, height: 62, borderRadius: 18, background: on ? GRAD : C.soft, display: "grid", placeItems: "center", flex: "none" }}><I size={34} color={on ? "#fff" : C.brand} /></div>
                  <span style={{ fontFamily: BN, fontSize: 30, fontWeight: 800, color: C.brand }}>ধাপ {bn(i + 1)}</span>
                </div>
                <div style={{ fontFamily: BN, fontSize: 33, fontWeight: 800, color: C.ink, lineHeight: 1.3 }}><Mixed t={x.t} /></div>
                {x.s && <div style={{ fontFamily: BN, fontSize: 26, color: C.mute, lineHeight: 1.4 }}><Mixed t={x.s} /></div>}
                {x.code && <div style={{ marginTop: "auto" }}><Code size={26}>{x.code}</Code></div>}
              </Card>
              {i + 1 < n && (i + 1) % cols !== 0 && <div style={{ position: "absolute", right: -58, top: "45%", opacity: on ? 1 : 0.3 }}><ArrowRight size={46} color={C.brand} strokeWidth={2.6} /></div>}
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};

// two things side by side (void vs refund, B2C vs B2B …) with matching rows
const SVs: React.FC<P> = (p) => {
  const { s } = p; const n = s.rows.length; const cols = [s.left, s.right];
  return (
    <AbsoluteFill>
      <Head h={s.head} />
      <div style={{ position: "absolute", left: 130, right: 130, top: 250, display: "grid", gridTemplateColumns: "1fr 1fr", columnGap: 30, rowGap: n > 3 ? 14 : 22 }}>
        {cols.map((c: any, j: number) => (
          <Rise key={j} d={6 + j * 8}>
            <div style={{ padding: "20px 28px", borderRadius: 20, background: j ? C.navy : GRAD, color: "#fff", fontFamily: BN, fontSize: 40, fontWeight: 800, display: "flex", alignItems: "center", gap: 14 }}>{c.t}{c.code && <span style={{ marginLeft: "auto", fontFamily: MONO, fontSize: 28, background: "rgba(255,255,255,.18)", padding: "4px 14px", borderRadius: 10 }}>{c.code}</span>}</div>
          </Rise>
        ))}
        {s.rows.map((r: any, i: number) => [r.l, r.r].map((x: string, j: number) => (
          <Rise key={i + "-" + j} d={v(p, 0.08 + (i / n) * 0.8 + j * 0.04)} y={20}>
            <Card style={{ padding: n > 3 ? "14px 24px" : "20px 26px", boxShadow: "none", minHeight: n > 3 ? 80 : 96, display: "flex", alignItems: "center", gap: 16 }}>
              {r.k && <span style={{ fontFamily: BN, fontSize: 24, fontWeight: 700, color: C.brand, background: C.soft, padding: "4px 12px", borderRadius: 10, flex: "none" }}>{r.k}</span>}
              <span style={{ fontFamily: BN, fontSize: 31, color: C.ink, lineHeight: 1.35, fontWeight: 600 }}><Mixed t={x} /></span>
            </Card>
          </Rise>
        )))}
      </div>
    </AbsoluteFill>
  );
};

const MAP: Record<string, React.FC<any>> = { title: STitle, points: SPoints, term: STerm, anatomy: SAnatomy, gds3: SGds3, note: SNote, myth: SMyth, recap: SRecap, quizQ: SQuiz, quizA: (p: P) => <SQuiz {...p} answer />, outro: SOutro, flow: SFlow, vs: SVs };
export const SCENE_TYPES = Object.keys(MAP);

/* ---------- frame chrome ---------- */
const Header: React.FC<{ spec: Spec; starts: number[] }> = ({ spec, starts }) => {
  const f = useCurrentFrame(); const k = starts.filter((s) => f >= s).length;
  return (
    <div style={{ position: "absolute", left: 0, right: 0, top: 0, height: 96, display: "flex", alignItems: "center", gap: 22, padding: "0 56px", background: "rgba(255,255,255,.92)", borderBottom: `1px solid ${C.line}` }}>
      <Img src={staticFile("brand/logo.png")} style={{ height: 52 }} />
      <div style={{ width: 1, height: 34, background: C.line }} />
      <div style={{ fontFamily: BN, fontSize: 26, fontWeight: 700, color: C.ink }}>{spec.course}</div>
      <div style={{ fontFamily: BN, fontSize: 24, color: C.mute }}>· {spec.lessonNo}</div>
      <div style={{ marginLeft: "auto", display: "flex", gap: 6, width: 380 }}>
        {starts.map((_, i) => <div key={i} style={{ flex: 1, height: 8, borderRadius: 4, background: i < k - 1 ? `${C.brand}88` : i === k - 1 ? C.brand : C.line }} />)}
      </div>
    </div>
  );
};
const AiTag: React.FC = () => (
  <div style={{ position: "absolute", right: 40, bottom: 130, display: "flex", alignItems: "center", gap: 8, padding: "8px 16px", borderRadius: 30, background: "rgba(255,255,255,.9)", border: `1px solid ${C.line}`, fontFamily: BN, fontSize: 20, color: C.mute }}><Bot size={20} color={C.brand} /> এআই প্রশিক্ষক · এআই কণ্ঠ</div>
);
const subChunks = (spec: Spec, starts: number[]) => spec.scenes.flatMap((s, i) => {
  const parts = s.vo.split(/(?<=[।?!,—])\s+/).reduce<string[]>((a, x) => { if (a.length && (a[a.length - 1].length < 24 || x.length < 10)) a[a.length - 1] += " " + x; else a.push(x); return a; }, []);
  const total = parts.reduce((n, x) => n + x.length, 0); let acc = 0; const b = starts[i] + LEAD;
  return parts.map((x) => { const from = b + (s.frames * acc) / total; acc += x.length; return { s: x, from, to: b + (s.frames * acc) / total }; });
});

export const GdsVideo: React.FC<{ spec: Spec }> = ({ spec }) => {
  const f = useCurrentFrame();
  const lens = spec.scenes.map(sceneLen);
  const starts = lens.reduce<number[]>((a, _, i) => [...a, i ? a[i - 1] + lens[i - 1] : 15], []);
  const chunks = subChunks(spec, starts);
  const cur = chunks.find((x) => f >= x.from && f < x.to + 4);
  const total = gdsLen(spec);
  const busy = (fr: number) => spec.scenes.some((s, i) => fr >= starts[i] + LEAD - 6 && fr <= starts[i] + LEAD + s.frames + 4);
  return (
    <AbsoluteFill style={{ background: C.bg }}>
      <AbsoluteFill style={{ backgroundImage: `linear-gradient(${C.line} 1px, transparent 1px), linear-gradient(90deg, ${C.line} 1px, transparent 1px)`, backgroundSize: "64px 64px", opacity: 0.5 }} />
      <AbsoluteFill style={{ background: `radial-gradient(1000px 600px at 85% 0%, ${C.brand}14, transparent 70%), radial-gradient(900px 600px at 0% 100%, ${C.brand2}12, transparent 70%)` }} />
      {spec.scenes.map((s, i) => {
        const S = MAP[s.type]; const len = lens[i];
        return (
          <Sequence key={i} from={starts[i]} durationInFrames={len}>
            <Fade len={len}><S s={s} spec={spec} vo={s.frames} /></Fade>
            <Sequence from={LEAD}><Audio src={staticFile(`gds/${spec.id}/vo/${String(i + 1).padStart(2, "0")}.mp3`)} /></Sequence>
            <Sequence from={0}><Audio src={staticFile(`aiu2/${i === 0 ? "swell" : s.type === "quizA" || s.type === "outro" ? "chime" : "whoosh"}.mp3`)} volume={0.3} /></Sequence>
          </Sequence>
        );
      })}
      <Header spec={spec} starts={starts} />
      <AiTag />
      {cur && <div style={{ position: "absolute", left: 0, right: 0, bottom: 34, display: "flex", justifyContent: "center", opacity: interpolate(f, [cur.from, cur.from + 5, cur.to, cur.to + 4], [0, 1, 1, 0], clamp) }}><div style={{ maxWidth: 1500, padding: "10px 28px 14px", borderRadius: 14, background: "rgba(1,24,53,.88)", fontFamily: BN, fontSize: 36, fontWeight: 500, color: "#fff", textAlign: "center", lineHeight: 1.35 }}>{cur.s.replace(/[।,]$/, "")}</div></div>}
      <Audio src={staticFile("aiu2/music.mp3")} volume={(fr) => (busy(fr) ? 0.05 : 0.15) * interpolate(fr, [0, 30, total - 60, total], [0, 1, 1, 0], clamp)} />
    </AbsoluteFill>
  );
};
const Fade: React.FC<{ len: number; children: React.ReactNode }> = ({ len, children }) => {
  const f = useCurrentFrame();
  const o = Math.min(interpolate(f, [0, 12], [0, 1], { ...clamp, easing: ease }), interpolate(f, [len - 10, len], [1, 0], clamp));
  return <AbsoluteFill style={{ opacity: o, transform: `translateY(${(1 - o) * 14}px)` }}>{children}</AbsoluteFill>;
};
