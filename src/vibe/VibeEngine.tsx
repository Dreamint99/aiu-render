// AI University — "ভাইব কোডিং মাস্টার কোর্স" lesson video engine. Own look: a dark code-editor / terminal / browser world
// (IDE title bar, file tabs, line numbers, typing prompts in an AI chat, a terminal that runs commands, a browser wireframe whose
// parts light up). Spec: src/vibe/specs/<id>.json, timed by scripts/vibe_make.py. Scene types:
// title · points · prompt · term · browser · code · layers · flow · vs · note · myth · recap · quizQ · quizA · outro
import React from "react";
import { AbsoluteFill, Audio, Img, Sequence, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig, Easing, delayRender, continueRender } from "remotion";
import { loadFont } from "@remotion/google-fonts/JetBrainsMono";
import {
  Target, Check, X, ArrowRight, Timer, CircleCheck, TriangleAlert, Lightbulb, Sparkles, Bot, Code, Globe, Server, Database, Plug, LayoutTemplate,
  ShieldCheck, Search, Rocket, GitBranch, Smartphone, SquareTerminal, KeyRound, Mail, Lock, Wallet, List, Folder, Package, Cloud, Zap, Eye, Bug,
  Users, Image, Layers, Palette, FileCode, Hammer, Store, Play, MessageSquare, Send, User, Wrench, Gauge, Link, Upload, Download, Save, Undo2,
} from "lucide-react";

const { fontFamily: MONO } = loadFont("normal", { weights: ["400", "700"], subsets: ["latin"] });
const C = { bg: "#0A0F1E", panel: "#111A2E", panel2: "#0D1526", bar: "#16213A", line: "#24304D", ink: "#F1F5FF", txt: "#D5DDF5", mute: "#8C9AC0", faint: "#5E6B90",
  teal: "#2DD4BF", indigo: "#818CF8", violet: "#A78BFA", amber: "#FBBF24", red: "#F87171", green: "#34D399", pink: "#F472B6", sky: "#38BDF8",
  tsoft: "rgba(45,212,191,.12)", isoft: "rgba(129,140,248,.14)", asoft: "rgba(251,191,36,.12)", rsoft: "rgba(248,113,113,.12)", gsoft: "rgba(52,211,153,.12)" };
const GRAD = `linear-gradient(100deg, ${C.teal}, ${C.indigo})`;
const BN = "Anek", EN = "Montserrat";
if (typeof document !== "undefined") {
  for (const [n, u] of [["Anek", "fonts/AnekBangla.ttf"], ["Montserrat", "fonts/Montserrat.ttf"]]) {
    const h = delayRender(`font ${n}`);
    const f = new FontFace(n, `url(${staticFile(u)})`, { weight: "100 900" });
    f.load().then(() => { document.fonts.add(f); continueRender(h); }).catch(() => continueRender(h));
  }
}
export const ICONS: Record<string, React.FC<any>> = { code: Code, globe: Globe, server: Server, database: Database, api: Plug, layout: LayoutTemplate, shield: ShieldCheck,
  search: Search, rocket: Rocket, git: GitBranch, phone: Smartphone, terminal: SquareTerminal, key: KeyRound, mail: Mail, lock: Lock, wallet: Wallet, list: List,
  folder: Folder, package: Package, cloud: Cloud, zap: Zap, eye: Eye, bug: Bug, users: Users, image: Image, layers: Layers, palette: Palette, file: FileCode,
  hammer: Hammer, store: Store, play: Play, chat: MessageSquare, send: Send, bot: Bot, user: User, wrench: Wrench, gauge: Gauge, link: Link, upload: Upload,
  download: Download, save: Save, undo: Undo2, target: Target, lightbulb: Lightbulb, alert: TriangleAlert, sparkles: Sparkles, check: CircleCheck };
const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const ease = Easing.bezier(0.16, 1, 0.3, 1);
const bn = (n: number | string) => String(n).replace(/\d/g, (d) => "০১২৩৪৫৬৭৮৯"[+d]);
const ent = (f: number, fps: number, d: number, dur = 24) => spring({ frame: f - d, fps, config: { damping: 200 }, durationInFrames: dur });
const pop = (f: number, fps: number, d: number) => spring({ frame: f - d, fps, config: { damping: 12, mass: 0.6 } });
const isBn = (s: string) => /[ঀ-৿]/.test(s);

export type Scene = { type: string; vo: string; frames: number; hold?: number; [k: string]: any };
export type Spec = { id: string; course: string; module: string; lessonNo: string; title: string; next: string; scenes: Scene[] };
const LEAD = 12, TAIL = 16;
const sceneLen = (s: Scene) => LEAD + s.frames + (s.hold || 0) + TAIL;
export const vibeLen = (spec: Spec) => spec.scenes.reduce((n, s) => n + sceneLen(s), 0) + 30;
type P = { s: Scene; spec: Spec; vo: number };
const v = (p: P, x: number) => LEAD + p.vo * x;

/* ---------- primitives ---------- */
const Rise: React.FC<{ d: number; children: React.ReactNode; style?: React.CSSProperties; y?: number }> = ({ d, children, style, y = 40 }) => {
  const f = useCurrentFrame(); const { fps } = useVideoConfig(); const s = ent(f, fps, d);
  return <div style={{ opacity: s, transform: `translateY(${(1 - s) * y}px)`, ...style }}>{children}</div>;
};
const H: React.FC<{ d: number; size: number; children: React.ReactNode; color?: string }> = ({ d, size, children, color = C.ink }) => {
  const f = useCurrentFrame(); const { fps } = useVideoConfig(); const s = ent(f, fps, d, 28);
  return <div style={{ overflow: "hidden", paddingTop: size * 0.16, paddingBottom: size * 0.22, marginTop: -size * 0.16, marginBottom: -size * 0.22 }}><div style={{ fontFamily: BN, fontSize: size, fontWeight: 800, color, lineHeight: 1.25, transform: `translateY(${(1 - s) * 110}%)` }}>{children}</div></div>;
};
const Panel: React.FC<{ children: React.ReactNode; style?: React.CSSProperties }> = ({ children, style }) => (
  <div style={{ background: C.panel, borderRadius: 22, border: `1px solid ${C.line}`, boxShadow: "0 30px 80px rgba(0,0,0,.45)", ...style }}>{children}</div>
);
// a window with the three dots + a file tab
const Win: React.FC<{ tab: string; icon?: React.FC<any>; children: React.ReactNode; style?: React.CSSProperties; accent?: string }> = ({ tab, icon: I = FileCode, children, style, accent = C.teal }) => (
  <div style={{ background: C.panel2, borderRadius: 18, border: `1px solid ${C.line}`, overflow: "hidden", boxShadow: "0 30px 90px rgba(0,0,0,.55)", display: "flex", flexDirection: "column", ...style }}>
    <div style={{ height: 52, display: "flex", alignItems: "center", gap: 10, padding: "0 18px", background: C.bar, borderBottom: `1px solid ${C.line}`, flex: "none" }}>
      {["#FF5F57", "#FEBC2E", "#28C840"].map((c) => <div key={c} style={{ width: 14, height: 14, borderRadius: 7, background: c }} />)}
      <div style={{ marginLeft: 16, display: "flex", alignItems: "center", gap: 8, padding: "6px 16px", borderRadius: "10px 10px 0 0", background: C.panel2, borderTop: `2px solid ${accent}`, fontFamily: isBn(tab) ? BN : MONO, fontSize: 20, color: C.txt }}><I size={18} color={accent} /> {tab}</div>
    </div>
    <div style={{ flex: 1, position: "relative" }}>{children}</div>
  </div>
);
const Head: React.FC<{ h: [string, string] | string; d?: number; top?: number }> = ({ h, d = 4, top = 130 }) => (
  <div style={{ position: "absolute", left: 120, top, right: 120, display: "flex", alignItems: "center", gap: 18 }}>
    <Rise d={d} y={10}><span style={{ fontFamily: MONO, fontSize: 40, fontWeight: 700, color: C.teal }}>{"//"}</span></Rise>
    <H d={d} size={56}>{Array.isArray(h) ? <>{h[0]}<span style={{ color: C.teal }}>{h[1]}</span></> : h}</H>
  </div>
);
// Latin tech tokens (React, API, .env, npm install …) in mono, coloured
const Mixed: React.FC<{ t: string; c?: string }> = ({ t, c = C.sky }) => <>{String(t).split(/([A-Za-z0-9_.\/\-:@#+]*[A-Za-z][A-Za-z0-9_.\/\-:@#+]*)/).map((x, i) => (i % 2 ? <span key={i} style={{ fontFamily: `${EN}, ${BN}`, fontWeight: 700, color: c }}>{x}</span> : <span key={i}>{x}</span>))}</>;
const Caret: React.FC<{ on: boolean; h?: number; c?: string }> = ({ on, h = 30, c = C.teal }) => { const f = useCurrentFrame(); return on && Math.floor(f / 14) % 2 === 0 ? <span style={{ display: "inline-block", width: 3, height: h, background: c, marginLeft: 3, verticalAlign: "middle" }} /> : null; };
const typed = (txt: string, f: number, from: number, cps: number) => txt.slice(0, Math.max(0, Math.min(txt.length, Math.floor((f - from) * cps))));

/* ---------- scenes ---------- */
const STitle: React.FC<P> = (p) => {
  const { s, spec } = p; const f = useCurrentFrame();
  const goals: string[] = s.goals || [];
  return (
    <AbsoluteFill>
      <div style={{ position: "absolute", left: 120, top: 230, width: 820 }}>
        <Rise d={4}><span style={{ display: "inline-flex", gap: 10, alignItems: "center", padding: "10px 22px", borderRadius: 40, background: C.tsoft, border: `1px solid ${C.teal}55`, color: C.teal, fontFamily: BN, fontSize: 28, fontWeight: 700 }}><Code size={28} /> {spec.module} · {spec.lessonNo}</span></Rise>
        <div style={{ marginTop: 34 }}><H d={10} size={80}>{spec.title}</H></div>
        <Rise d={24} style={{ marginTop: 28 }}><span style={{ fontFamily: BN, fontSize: 32, color: C.mute }}>{spec.course}</span></Rise>
      </div>
      <Rise d={8} style={{ position: "absolute", right: 110, top: 200, width: 860 }}>
        <Win tab="lesson-plan.md" style={{ height: 600 }}>
          <div style={{ display: "flex", height: "100%" }}>
            <div style={{ width: 64, padding: "28px 0", textAlign: "right", fontFamily: MONO, fontSize: 22, lineHeight: "62px", color: C.faint, borderRight: `1px solid ${C.line}` }}>{Array.from({ length: goals.length + 2 }, (_, i) => <div key={i} style={{ paddingRight: 14 }}>{i + 1}</div>)}</div>
            <div style={{ flex: 1, padding: "28px 30px", lineHeight: "62px" }}>
              <div style={{ fontFamily: BN, fontSize: 30, fontWeight: 800, color: C.indigo }}># এই পাঠে যা শিখবেন</div>
              <div style={{ height: 62 }} />
              {goals.map((g, i) => {
                const d = v(p, 0.18 + i * 0.16); const on = f >= d; const txt = typed(g, f, d, 1.6);
                return on ? (
                  <div key={i} style={{ display: "flex", alignItems: "center", gap: 14, fontFamily: BN, fontSize: 30, color: C.txt, whiteSpace: "nowrap", overflow: "hidden" }}>
                    <span style={{ width: 34, height: 34, borderRadius: 8, border: `2px solid ${C.green}`, display: "grid", placeItems: "center", flex: "none", background: txt.length === g.length ? C.gsoft : "transparent" }}>{txt.length === g.length && <Check size={22} color={C.green} strokeWidth={3} />}</span>
                    <span><Mixed t={txt} /></span><Caret on={txt.length < g.length} />
                  </div>) : <div key={i} style={{ height: 62 }} />;
              })}
            </div>
          </div>
        </Win>
      </Rise>
    </AbsoluteFill>
  );
};

const SPoints: React.FC<P> = (p) => {
  const { s } = p; const n = s.items.length; const cols = n > 3 ? 2 : 1;
  return (
    <AbsoluteFill>
      <Head h={s.head} />
      <div style={{ position: "absolute", left: 120, right: 120, top: 270, display: "grid", gridTemplateColumns: `repeat(${cols}, 1fr)`, gap: 24 }}>
        {s.items.map((it: any, i: number) => {
          const I = ICONS[it.icon] || Lightbulb; const col = [C.teal, C.indigo, C.amber, C.pink, C.sky, C.green][i % 6];
          return (
            <Rise key={i} d={v(p, 0.06 + (i / n) * 0.75)} y={26}>
              <Panel style={{ padding: n > 4 ? "22px 30px" : "28px 32px", display: "flex", gap: 26, alignItems: "center", boxShadow: "none", borderLeft: `5px solid ${col}` }}>
                <div style={{ width: 80, height: 80, borderRadius: 20, background: `${col}22`, border: `1px solid ${col}66`, display: "grid", placeItems: "center", flex: "none" }}><I size={42} color={col} strokeWidth={1.8} /></div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontFamily: BN, fontSize: 38, fontWeight: 800, color: C.ink, lineHeight: 1.25 }}><Mixed t={it.t} c={col} /></div>
                  {it.s && <div style={{ fontFamily: BN, fontSize: 28, color: C.mute, marginTop: 6, lineHeight: 1.4 }}><Mixed t={it.s} /></div>}
                </div>
                {it.code && <span style={{ fontFamily: MONO, fontWeight: 700, fontSize: 26, color: col, background: `${col}18`, border: `1px solid ${col}55`, borderRadius: 10, padding: "6px 14px", whiteSpace: "nowrap" }}>{it.code}</span>}
              </Panel>
            </Rise>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};

// AI chat: the user's prompt is typed, the AI's answer streams in line by line
const SPrompt: React.FC<P> = (p) => {
  const { s } = p; const f = useCurrentFrame(); const { fps } = useVideoConfig();
  const t0 = v(p, 0.05), user: string = s.user, cps = Math.max(1.2, user.length / (p.vo * 0.4));
  const done = t0 + user.length / cps, ai: string[] = s.ai || [];
  const tag = s.tag ? (s.bad ? [C.red, C.rsoft, X] : [C.green, C.gsoft, Check]) as [string, string, React.FC<any>] : null;
  return (
    <AbsoluteFill>
      <Head h={s.head} />
      <Rise d={4} style={{ position: "absolute", left: 220, right: 220, top: 260, height: 560 }}>
        <Win tab={s.tool || "AI চ্যাট"} icon={Bot} accent={C.indigo} style={{ height: "100%" }}>
          <div style={{ position: "absolute", inset: 0, padding: "30px 36px", display: "flex", flexDirection: "column", gap: 22 }}>
            <div style={{ alignSelf: "flex-end", maxWidth: "86%", display: "flex", gap: 14, alignItems: "flex-start" }}>
              <div style={{ padding: "20px 26px", borderRadius: "22px 22px 6px 22px", background: s.bad ? "#3A1E2A" : "#1D2B4F", border: `1px solid ${s.bad ? C.red + "66" : C.indigo + "55"}`, fontFamily: BN, fontSize: 30, lineHeight: 1.45, color: C.ink }}>
                {f >= t0 ? <Mixed t={typed(user, f, t0, cps)} /> : <span style={{ color: C.faint }}>…</span>}<Caret on={f >= t0 && f < done} h={28} c={C.indigo} />
              </div>
              <div style={{ width: 52, height: 52, borderRadius: 26, background: C.isoft, display: "grid", placeItems: "center", flex: "none" }}><User size={28} color={C.indigo} /></div>
            </div>
            {f >= done + 8 && ai.length > 0 && (
              <div style={{ alignSelf: "flex-start", maxWidth: "88%", display: "flex", gap: 14, alignItems: "flex-start" }}>
                <div style={{ width: 52, height: 52, borderRadius: 26, background: C.tsoft, display: "grid", placeItems: "center", flex: "none" }}><Bot size={28} color={C.teal} /></div>
                <div style={{ padding: "18px 26px", borderRadius: "22px 22px 22px 6px", background: C.panel, border: `1px solid ${C.teal}44`, display: "flex", flexDirection: "column", gap: 8 }}>
                  {ai.map((l, i) => { const d = done + 12 + i * Math.max(10, (LEAD + p.vo * 0.95 - done - 12) / ai.length); return f >= d ? <Rise key={i} d={d} y={10}><div style={{ fontFamily: BN, fontSize: 28, color: C.txt, lineHeight: 1.4 }}><Mixed t={l} c={C.teal} /></div></Rise> : null; })}
                </div>
              </div>
            )}
          </div>
        </Win>
      </Rise>
      {tag && f >= done && <div style={{ position: "absolute", right: 150, top: 220, transform: `scale(${Math.min(1, pop(f, fps, done))}) rotate(-4deg)`, display: "flex", alignItems: "center", gap: 10, padding: "12px 24px", borderRadius: 16, background: tag[1], border: `2px solid ${tag[0]}`, color: tag[0], fontFamily: BN, fontSize: 32, fontWeight: 800 }}>{React.createElement(tag[2], { size: 32, strokeWidth: 3 })} {s.tag}</div>}
    </AbsoluteFill>
  );
};

// terminal: commands typed after "$", output lines print
const STerm: React.FC<P> = (p) => {
  const { s } = p; const f = useCurrentFrame();
  const lines: { c?: string; o?: string; ok?: boolean; err?: boolean }[] = s.lines;
  // spread the lines over the narration: each command line gets typing time
  const w = lines.map((l) => (l.c ? 2 + l.c.length / 14 : 1)); const W = w.reduce((a, b) => a + b, 0);
  let acc = 0; const at = w.map((x) => { const t = v(p, 0.05 + (acc / W) * 0.8); acc += x; return t; });
  return (
    <AbsoluteFill>
      <Head h={s.head} />
      <Rise d={4} style={{ position: "absolute", left: 200, right: 200, top: 250, height: 620 }}>
        <Win tab={s.title || "Terminal"} icon={SquareTerminal} accent={C.green} style={{ height: "100%", background: "#060A14" }}>
          <div style={{ position: "absolute", inset: 0, padding: "26px 34px", fontFamily: MONO, fontSize: 30, lineHeight: "50px" }}>
            {lines.map((l, i) => {
              if (f < at[i]) return null;
              if (l.c) { const nxt = i + 1 < at.length ? at[i + 1] : 1e9; const t = typed(l.c, f, at[i], 1.2);
                return <div key={i} style={{ whiteSpace: "pre" }}><span style={{ color: C.green }}>$ </span><span style={{ color: C.ink }}>{t}</span><Caret on={f < nxt && t.length <= l.c.length} h={30} c={C.green} /></div>; }
              return <div key={i} style={{ fontFamily: isBn(l.o || "") ? `${MONO}, ${BN}` : MONO, color: l.err ? C.red : l.ok ? C.green : C.mute, whiteSpace: "pre" }}>{l.o}</div>;
            })}
          </div>
        </Win>
      </Rise>
    </AbsoluteFill>
  );
};

// a browser with a page wireframe; the parts light up one by one with a label
const BLOCK_H: Record<string, number> = { header: 64, hero: 190, cards: 130, form: 120, cta: 70, footer: 80, text: 70, gallery: 110 };
const SBrowser: React.FC<P> = (p) => {
  const { s } = p; const f = useCurrentFrame(); const { fps } = useVideoConfig();
  const blocks: { k: string; label: string }[] = s.blocks; const n = blocks.length;
  const total = blocks.reduce((a, b) => a + (BLOCK_H[b.k] || 90) + 12, 0); const sc = Math.min(1, 610 / total);
  const col = [C.teal, C.indigo, C.amber, C.pink, C.sky, C.green, C.violet];
  const inner = (b: { k: string }, on: boolean, c: string) => {
    const g = on ? `${c}55` : "#2A3654", g2 = on ? `${c}33` : "#1E2842";
    switch (b.k) {
      case "header": return <div style={{ display: "flex", alignItems: "center", height: "100%", padding: "0 20px", gap: 14 }}><div style={{ width: 90, height: 26, borderRadius: 6, background: g }} /><div style={{ marginLeft: "auto", display: "flex", gap: 12 }}>{[0, 1, 2, 3].map((i) => <div key={i} style={{ width: 54, height: 12, borderRadius: 6, background: g }} />)}</div><div style={{ width: 90, height: 30, borderRadius: 8, background: on ? c : g }} /></div>;
      case "hero": return <div style={{ display: "flex", height: "100%", padding: 22, gap: 20 }}><div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 12, justifyContent: "center" }}><div style={{ width: "85%", height: 28, borderRadius: 6, background: g }} /><div style={{ width: "60%", height: 16, borderRadius: 6, background: g2 }} /><div style={{ width: 140, height: 38, borderRadius: 10, background: on ? c : g, marginTop: 6 }} /></div><div style={{ width: "38%", borderRadius: 12, background: g2, display: "grid", placeItems: "center" }}><Image size={46} color={g} /></div></div>;
      case "cards": case "gallery": return <div style={{ display: "flex", height: "100%", padding: 16, gap: 14 }}>{[0, 1, 2, 3].map((i) => <div key={i} style={{ flex: 1, borderRadius: 10, background: g2, border: `1px solid ${g}` }} />)}</div>;
      case "form": return <div style={{ display: "flex", flexDirection: "column", height: "100%", padding: "14px 22px", gap: 10 }}>{[0, 1].map((i) => <div key={i} style={{ height: 24, borderRadius: 6, border: `2px solid ${g}` }} />)}<div style={{ width: 120, height: 28, borderRadius: 8, background: on ? c : g }} /></div>;
      case "cta": return <div style={{ display: "grid", placeItems: "center", height: "100%" }}><div style={{ width: 260, height: 40, borderRadius: 12, background: on ? c : g }} /></div>;
      case "footer": return <div style={{ display: "flex", height: "100%", padding: "16px 22px", gap: 30, background: on ? `${c}14` : "#0E1527" }}>{[0, 1, 2].map((i) => <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", gap: 8 }}><div style={{ width: "60%", height: 12, borderRadius: 6, background: g }} /><div style={{ width: "80%", height: 10, borderRadius: 6, background: g2 }} /></div>)}</div>;
      default: return <div style={{ display: "flex", flexDirection: "column", height: "100%", padding: "16px 22px", gap: 10 }}>{[90, 75, 82].map((x, i) => <div key={i} style={{ width: `${x}%`, height: 12, borderRadius: 6, background: g2 }} />)}</div>;
    }
  };
  return (
    <AbsoluteFill>
      <Head h={s.head} />
      <Rise d={4} style={{ position: "absolute", left: 110, top: 240, width: 1060, height: 720 }}>
        <Win tab={s.url || "example.com.bd"} icon={Globe} accent={C.sky} style={{ height: "100%", background: "#0C1222" }}>
          <div style={{ position: "absolute", inset: 0, padding: 22 }}>
            <div style={{ transform: `scale(${sc})`, transformOrigin: "0 0", width: `${100 / sc}%`, display: "flex", flexDirection: "column", gap: 12 }}>
              {blocks.map((b, i) => { const d = v(p, 0.08 + (i / n) * 0.8); const on = f >= d; const c = col[i % col.length]; const k = Math.min(1, pop(f, fps, d));
                return <div key={i} style={{ position: "relative", height: BLOCK_H[b.k] || 90, borderRadius: 12, border: `2px ${on ? "solid" : "dashed"} ${on ? c : C.line}`, boxShadow: on ? `0 0 ${24 * k}px ${c}55` : "none", overflow: "hidden" }}>
                  {inner(b, on, c)}
                  {on && <div style={{ position: "absolute", right: 10, top: 8, width: 36, height: 36, borderRadius: 18, background: c, color: C.bg, fontFamily: BN, fontWeight: 800, fontSize: 22, display: "grid", placeItems: "center", transform: `scale(${k})` }}>{bn(i + 1)}</div>}
                </div>; })}
            </div>
          </div>
        </Win>
      </Rise>
      <div style={{ position: "absolute", left: 1210, right: 90, top: 240, display: "flex", flexDirection: "column", gap: 14 }}>
        {blocks.map((b, i) => { const d = v(p, 0.08 + (i / n) * 0.8); const c = col[i % col.length]; return f >= d ? (
          <Rise key={i} d={d} y={16}><div style={{ display: "flex", gap: 14, alignItems: "center", padding: n > 6 ? "10px 16px" : "14px 18px", borderRadius: 14, background: C.panel, border: `1px solid ${c}66` }}>
            <div style={{ width: 38, height: 38, borderRadius: 19, background: c, color: C.bg, display: "grid", placeItems: "center", fontFamily: BN, fontWeight: 800, fontSize: 22, flex: "none" }}>{bn(i + 1)}</div>
            <span style={{ fontFamily: BN, fontSize: n > 6 ? 25 : 28, color: C.ink, fontWeight: 600, lineHeight: 1.3 }}><Mixed t={b.label} c={c} /></span>
          </div></Rise>) : null; })}
      </div>
    </AbsoluteFill>
  );
};

// a code/config file in the editor; highlighted lines get a numbered note on the right
const SCode: React.FC<P> = (p) => {
  const { s } = p; const f = useCurrentFrame(); const { fps } = useVideoConfig();
  const code: string[] = s.code; const hl: { line: number; label: string }[] = s.hl || [];
  const fs = Math.min(30, 980 / (Math.max(...code.map((l) => l.length), 20) * 0.62)), lh = fs * 1.7;
  const lineAt = (i: number) => v(p, 0.02 + (i / code.length) * 0.3);
  const hlAt = (i: number) => v(p, 0.36 + (i / Math.max(1, hl.length)) * 0.55);
  return (
    <AbsoluteFill>
      <Head h={s.head} />
      <Rise d={4} style={{ position: "absolute", left: 110, top: 240, width: 1100, height: 700 }}>
        <Win tab={s.file || "file.txt"} style={{ height: "100%" }}>
          <div style={{ position: "absolute", inset: 0, padding: "24px 0", fontFamily: MONO, fontSize: fs, lineHeight: `${lh}px` }}>
            {code.map((L, i) => { const hi = hl.findIndex((h) => h.line === i); const on = hi >= 0 && f >= hlAt(hi);
              return f >= lineAt(i) ? <div key={i} style={{ display: "flex", background: on ? `${C.amber}1E` : "transparent", borderLeft: `4px solid ${on ? C.amber : "transparent"}` }}>
                <span style={{ width: 70, textAlign: "right", paddingRight: 20, color: C.faint, flex: "none" }}>{i + 1}</span>
                <span style={{ color: /^\s*(\/\/|#)/.test(L) ? C.faint : /=/.test(L) ? C.teal : C.txt, whiteSpace: "pre", fontFamily: isBn(L) ? `${MONO}, ${BN}` : MONO }}>{L || " "}</span>
                {on && <span style={{ marginLeft: "auto", marginRight: 16, width: lh * 0.7, height: lh * 0.7, borderRadius: lh, background: C.amber, color: C.bg, fontFamily: BN, fontWeight: 800, fontSize: lh * 0.42, display: "grid", placeItems: "center", alignSelf: "center", transform: `scale(${Math.min(1, pop(f, fps, hlAt(hi)))})` }}>{bn(hi + 1)}</span>}
              </div> : null; })}
          </div>
        </Win>
      </Rise>
      <div style={{ position: "absolute", left: 1250, right: 90, top: 240, display: "flex", flexDirection: "column", gap: 16 }}>
        {hl.map((h, i) => (f >= hlAt(i) ? <Rise key={i} d={hlAt(i)} y={16}><div style={{ display: "flex", gap: 14, alignItems: "flex-start", padding: "16px 18px", borderRadius: 16, background: C.panel, border: `1px solid ${C.amber}66` }}>
          <div style={{ width: 40, height: 40, borderRadius: 20, background: C.amber, color: C.bg, display: "grid", placeItems: "center", fontFamily: BN, fontWeight: 800, fontSize: 24, flex: "none" }}>{bn(i + 1)}</div>
          <span style={{ fontFamily: BN, fontSize: 28, color: C.ink, lineHeight: 1.35, fontWeight: 600 }}><Mixed t={h.label} c={C.amber} /></span></div></Rise> : null))}
      </div>
    </AbsoluteFill>
  );
};

// stacked layers (frontend → API → backend → database …) with a packet travelling down
const SLayers: React.FC<P> = (p) => {
  const { s } = p; const f = useCurrentFrame(); const { fps } = useVideoConfig(); const n = s.items.length;
  const col = [C.sky, C.indigo, C.teal, C.amber, C.pink, C.green];
  const gap = 26, hgt = Math.min(140, (660 - gap * (n - 1)) / n);
  const travel = interpolate(f, [v(p, 0.85), v(p, 1)], [0, 1], clamp);
  return (
    <AbsoluteFill>
      <Head h={s.head} />
      <div style={{ position: "absolute", left: 300, right: 300, top: 260 }}>
        {s.items.map((it: any, i: number) => { const d = v(p, 0.05 + (i / n) * 0.75); const k = Math.min(1, pop(f, fps, d)); const I = ICONS[it.icon] || Layers; const c = col[i % col.length];
          return <div key={i} style={{ position: "relative", height: hgt, marginBottom: gap, opacity: k, transform: `translateX(${(1 - k) * (i % 2 ? 80 : -80)}px)` }}>
            <div style={{ height: "100%", borderRadius: 22, background: `linear-gradient(100deg, ${c}26, ${C.panel})`, border: `2px solid ${c}88`, display: "flex", alignItems: "center", gap: 28, padding: "0 34px" }}>
              <div style={{ width: hgt * 0.62, height: hgt * 0.62, borderRadius: 18, background: c, display: "grid", placeItems: "center", flex: "none" }}><I size={hgt * 0.36} color={C.bg} strokeWidth={2} /></div>
              <div style={{ fontFamily: BN, fontSize: Math.min(40, hgt * 0.34), fontWeight: 800, color: C.ink }}><Mixed t={it.t} c={c} /></div>
              {it.s && <div style={{ marginLeft: "auto", fontFamily: BN, fontSize: Math.min(29, hgt * 0.25), color: C.mute, textAlign: "right", maxWidth: 560, lineHeight: 1.35 }}><Mixed t={it.s} /></div>}
            </div>
            {i + 1 < n && <div style={{ position: "absolute", left: "50%", bottom: -gap, width: 3, height: gap, background: `${c}88` }} />}
          </div>; })}
        {travel > 0 && travel < 1 && <div style={{ position: "absolute", left: "calc(50% - 14px)", top: travel * (n * (hgt + gap) - gap - 28), width: 28, height: 28, borderRadius: 14, background: C.amber, boxShadow: `0 0 24px ${C.amber}` }} />}
      </div>
    </AbsoluteFill>
  );
};

const SFlow: React.FC<P> = (p) => {
  const { s } = p; const f = useCurrentFrame(); const { fps } = useVideoConfig(); const n = s.steps.length;
  const cols = n <= 4 ? n : Math.ceil(n / 2), rows = Math.ceil(n / cols), w = (1680 - (cols - 1) * 70) / cols;
  return (
    <AbsoluteFill>
      <Head h={s.head} />
      <div style={{ position: "absolute", left: 120, right: 120, top: rows > 1 ? 260 : 330, display: "grid", gridTemplateColumns: `repeat(${cols}, ${w}px)`, columnGap: 70, rowGap: 46 }}>
        {s.steps.map((x: any, i: number) => {
          const d = v(p, 0.06 + (i / n) * 0.82); const k = Math.min(1, pop(f, fps, d)); const on = f >= d;
          const next = i + 1 < n ? v(p, 0.06 + ((i + 1) / n) * 0.82) : 1e9; const cur = on && f < next; const I = ICONS[x.icon] || CircleCheck;
          return (
            <div key={i} style={{ position: "relative", opacity: 0.25 + 0.75 * k, transform: `translateY(${(1 - k) * 30}px)` }}>
              <Panel style={{ padding: "24px 24px", minHeight: rows > 1 ? 230 : 300, border: `2px solid ${cur ? C.teal : on ? `${C.teal}55` : C.line}`, boxShadow: cur ? `0 0 50px ${C.teal}33` : "none", display: "flex", flexDirection: "column", gap: 12 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                  <div style={{ width: 60, height: 60, borderRadius: 16, background: on ? GRAD : C.panel2, display: "grid", placeItems: "center", flex: "none" }}><I size={32} color={on ? C.bg : C.teal} /></div>
                  <span style={{ fontFamily: MONO, fontSize: 26, fontWeight: 700, color: C.teal }}>step_{i + 1}</span>
                </div>
                <div style={{ fontFamily: BN, fontSize: 32, fontWeight: 800, color: C.ink, lineHeight: 1.3 }}><Mixed t={x.t} /></div>
                {x.s && <div style={{ fontFamily: BN, fontSize: 25, color: C.mute, lineHeight: 1.4 }}><Mixed t={x.s} /></div>}
              </Panel>
              {i + 1 < n && (i + 1) % cols !== 0 && <div style={{ position: "absolute", right: -58, top: "45%", opacity: on ? 1 : 0.3 }}><ArrowRight size={46} color={C.teal} strokeWidth={2.6} /></div>}
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};

const SVs: React.FC<P> = (p) => {
  const { s } = p; const n = s.rows.length; const cols = [s.left, s.right];
  return (
    <AbsoluteFill>
      <Head h={s.head} />
      <div style={{ position: "absolute", left: 120, right: 120, top: 250, display: "grid", gridTemplateColumns: "1fr 1fr", columnGap: 30, rowGap: n > 3 ? 14 : 20 }}>
        {cols.map((c: any, j: number) => (
          <Rise key={j} d={6 + j * 8}><div style={{ padding: "20px 28px", borderRadius: 18, background: j ? `linear-gradient(100deg, ${C.indigo}, ${C.violet})` : `linear-gradient(100deg, ${C.teal}, ${C.sky})`, color: C.bg, fontFamily: BN, fontSize: 38, fontWeight: 800 }}>{c.t}</div></Rise>
        ))}
        {s.rows.map((r: any, i: number) => [r.l, r.r].map((x: string, j: number) => (
          <Rise key={i + "-" + j} d={v(p, 0.08 + (i / n) * 0.8 + j * 0.04)} y={20}>
            <Panel style={{ padding: n > 3 ? "14px 24px" : "20px 26px", boxShadow: "none", minHeight: n > 3 ? 78 : 96, display: "flex", alignItems: "center", gap: 16 }}>
              {r.k && <span style={{ fontFamily: BN, fontSize: 23, fontWeight: 700, color: j ? C.indigo : C.teal, background: j ? C.isoft : C.tsoft, padding: "4px 12px", borderRadius: 10, flex: "none" }}>{r.k}</span>}
              <span style={{ fontFamily: BN, fontSize: 29, color: C.ink, lineHeight: 1.35, fontWeight: 600 }}><Mixed t={x} /></span>
            </Panel>
          </Rise>
        )))}
      </div>
    </AbsoluteFill>
  );
};

const SNote: React.FC<P> = (p) => {
  const { s } = p; const f = useCurrentFrame(); const { fps } = useVideoConfig(); const k = pop(f, fps, 4);
  const tip = s.kind === "tip"; const c = tip ? C.teal : C.amber; const I = tip ? Lightbulb : TriangleAlert;
  return (
    <AbsoluteFill style={{ alignItems: "center", justifyContent: "center" }}>
      <Panel style={{ width: 1440, padding: "54px 62px", background: tip ? "#0F2128" : "#231C0E", border: `2px solid ${c}66`, display: "flex", gap: 46, alignItems: "center", marginTop: -40 }}>
        <div style={{ width: 150, height: 150, borderRadius: 38, background: c, display: "grid", placeItems: "center", flex: "none", transform: `scale(${k}) rotate(${(1 - k) * -20}deg)` }}><I size={86} color={C.bg} strokeWidth={1.8} /></div>
        <div>
          <H d={8} size={52} color={c}>{s.head}</H>
          <Rise d={v(p, 0.1)} style={{ marginTop: 12 }}><div style={{ fontFamily: BN, fontSize: 40, fontWeight: 800, color: C.ink, lineHeight: 1.3 }}><Mixed t={s.text} c={c} /></div></Rise>
          {s.sub && <Rise d={v(p, 0.55)} style={{ marginTop: 16 }}><div style={{ fontFamily: BN, fontSize: 30, color: C.mute, lineHeight: 1.4 }}><Mixed t={s.sub} /></div></Rise>}
        </div>
      </Panel>
    </AbsoluteFill>
  );
};

const SMyth: React.FC<P> = (p) => {
  const { s } = p; const f = useCurrentFrame();
  const strike = interpolate(f, [v(p, 0.3), v(p, 0.38)], [0, 1], { ...clamp, easing: ease });
  return (
    <AbsoluteFill>
      <div style={{ position: "absolute", left: 120, top: 160 }}><Rise d={4}><span style={{ fontFamily: MONO, fontSize: 28, fontWeight: 700, color: C.red }}>{"// bug: সাধারণ ভুল ধারণা"}</span></Rise></div>
      <Rise d={v(p, 0.04)} style={{ position: "absolute", left: 120, right: 120, top: 230 }}>
        <Panel style={{ padding: "34px 44px", background: "#24141B", border: `1px solid ${C.red}55`, boxShadow: "none" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}><div style={{ width: 52, height: 52, borderRadius: 26, background: C.red, display: "grid", placeItems: "center" }}><X size={32} color={C.bg} strokeWidth={3} /></div><span style={{ fontFamily: BN, fontSize: 30, color: C.red, fontWeight: 700 }}>ভুল</span></div>
          <div style={{ position: "relative", display: "inline-block", marginTop: 16 }}><span style={{ fontFamily: BN, fontSize: 50, fontWeight: 800, color: C.ink }}><Mixed t={s.wrong} c={C.red} /></span><div style={{ position: "absolute", left: 0, top: "55%", height: 6, borderRadius: 3, width: `${strike * 100}%`, background: C.red }} /></div>
        </Panel>
      </Rise>
      <Rise d={v(p, 0.42)} style={{ position: "absolute", left: 120, right: 120, top: 520 }}>
        <Panel style={{ padding: "34px 44px", background: "#0F2420", border: `1px solid ${C.green}55`, boxShadow: "none" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}><div style={{ width: 52, height: 52, borderRadius: 26, background: C.green, display: "grid", placeItems: "center" }}><Check size={32} color={C.bg} strokeWidth={3} /></div><span style={{ fontFamily: BN, fontSize: 30, color: C.green, fontWeight: 700 }}>সঠিক</span></div>
          <div style={{ fontFamily: BN, fontSize: 46, fontWeight: 800, color: C.ink, marginTop: 12, lineHeight: 1.3 }}><Mixed t={s.right} c={C.green} /></div>
          {s.sub && <div style={{ fontFamily: BN, fontSize: 30, color: C.mute, marginTop: 8 }}><Mixed t={s.sub} /></div>}
        </Panel>
      </Rise>
    </AbsoluteFill>
  );
};

const SRecap: React.FC<P> = (p) => (
  <AbsoluteFill>
    <Head h={["আজ যা ", "শিখলাম"]} />
    <div style={{ position: "absolute", left: 120, right: 120, top: 270, display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 20 }}>
      {p.s.items.map((t: string, i: number) => (
        <Rise key={i} d={v(p, 0.08 + i * 0.12)} y={26}>
          <Panel style={{ padding: "24px 28px", display: "flex", gap: 18, alignItems: "center", boxShadow: "none" }}>
            <CircleCheck size={42} color={C.green} strokeWidth={2} style={{ flex: "none" }} />
            <span style={{ fontFamily: BN, fontSize: 32, fontWeight: 700, color: C.ink, lineHeight: 1.3 }}><Mixed t={t} c={C.teal} /></span>
          </Panel>
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
      <div style={{ position: "absolute", left: 120, top: 135 }}><Rise d={2}><span style={{ fontFamily: MONO, fontSize: 26, fontWeight: 700, color: C.teal }}>{"> quick_check()"}</span></Rise></div>
      <Panel style={{ position: "absolute", left: 120, right: 120, top: 195, padding: "38px 46px" }}>
        <div style={{ fontFamily: BN, fontSize: 44, fontWeight: 800, color: C.ink, lineHeight: 1.3 }}><Mixed t={s.q} /></div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 18, marginTop: 30 }}>
          {s.o.map((o: string, i: number) => {
            const right = p.answer && i === s.a;
            return (
              <Rise key={i} d={p.answer ? 0 : v(p, 0.2 + i * 0.1)} y={18} style={{ display: "flex", alignItems: "center", gap: 20, padding: "20px 24px", borderRadius: 18, border: `2px solid ${right ? C.green : C.line}`, background: right ? C.gsoft : C.panel2, opacity: p.answer && !right ? 0.45 : 1 }}>
                <div style={{ width: 50, height: 50, borderRadius: 25, background: right ? C.green : C.isoft, color: right ? C.bg : C.indigo, display: "grid", placeItems: "center", fontFamily: BN, fontWeight: 800, fontSize: 26, flex: "none" }}>{right ? <Check size={30} strokeWidth={3.5} /> : "কখগঘ"[i]}</div>
                <span style={{ fontFamily: BN, fontSize: 34, fontWeight: 700, color: C.ink, lineHeight: 1.3 }}><Mixed t={o} /></span>
              </Rise>
            );
          })}
        </div>
        {p.answer && <Rise d={v(p, 0.25)} style={{ marginTop: 26, padding: "18px 24px", borderRadius: 16, background: C.gsoft, fontFamily: BN, fontSize: 30, color: C.green, fontWeight: 600, lineHeight: 1.4 }}>✔ <Mixed t={s.ex} c={C.green} /></Rise>}
      </Panel>
      {!p.answer && hold > 0 && f >= holdStart && (
        <div style={{ position: "absolute", left: "50%", top: 840, transform: "translateX(-50%)", display: "flex", alignItems: "center", gap: 18 }}>
          <svg width={92} height={92} style={{ transform: "rotate(-90deg)" }}><circle cx={46} cy={46} r={40} stroke={C.line} strokeWidth={8} fill="none" /><circle cx={46} cy={46} r={40} stroke={C.teal} strokeWidth={8} fill="none" strokeDasharray={251} strokeDashoffset={251 * (1 - ring)} strokeLinecap="round" /></svg>
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
      <div style={{ position: "absolute", top: 160, width: 150, height: 150, borderRadius: 40, background: GRAD, display: "grid", placeItems: "center", transform: `scale(${k}) rotate(${(1 - k) * 30}deg)`, boxShadow: `0 20px 70px ${C.teal}55` }}><Rocket size={84} color={C.bg} strokeWidth={2} /></div>
      <div style={{ position: "absolute", top: 370, textAlign: "center" }}><H d={10} size={74}>{s.head || "এবার নিজে চেষ্টা করুন!"}</H></div>
      {s.cta && <Rise d={v(p, 0.15)} style={{ position: "absolute", top: 510 }}><div style={{ display: "flex", alignItems: "center", gap: 16, padding: "18px 32px", borderRadius: 18, background: C.tsoft, border: `1px solid ${C.teal}55`, fontFamily: BN, fontSize: 32, fontWeight: 700, color: C.teal }}><Sparkles size={34} /> <Mixed t={s.cta} c={C.ink} /></div></Rise>}
      <Rise d={v(p, 0.35)} style={{ position: "absolute", top: 640 }}>
        <Panel style={{ display: "flex", alignItems: "center", gap: 24, padding: "24px 38px" }}>
          <span style={{ fontFamily: BN, fontSize: 30, color: C.mute }}>পরের পাঠ</span><ArrowRight size={34} color={C.teal} />
          <span style={{ fontFamily: BN, fontSize: 38, fontWeight: 800, color: C.ink }}>{spec.next}</span>
        </Panel>
      </Rise>
      <Rise d={v(p, 0.55)} style={{ position: "absolute", top: 810 }}><Img src={staticFile("vibe/assets/logo-dark.png")} style={{ height: 96 }} /></Rise>
    </AbsoluteFill>
  );
};

const MAP: Record<string, React.FC<any>> = { title: STitle, points: SPoints, prompt: SPrompt, term: STerm, browser: SBrowser, code: SCode, layers: SLayers, flow: SFlow, vs: SVs,
  note: SNote, myth: SMyth, recap: SRecap, quizQ: SQuiz, quizA: (p: P) => <SQuiz {...p} answer />, outro: SOutro };
export const SCENE_TYPES = Object.keys(MAP);

/* ---------- frame chrome ---------- */
const Header: React.FC<{ spec: Spec; starts: number[] }> = ({ spec, starts }) => {
  const f = useCurrentFrame(); const k = starts.filter((s) => f >= s).length;
  return (
    <div style={{ position: "absolute", left: 0, right: 0, top: 0, height: 88, display: "flex", alignItems: "center", gap: 20, padding: "0 48px", background: "rgba(13,21,38,.94)", borderBottom: `1px solid ${C.line}` }}>
      <Img src={staticFile("vibe/assets/logo-dark.png")} style={{ height: 50 }} />
      <div style={{ width: 1, height: 32, background: C.line }} />
      <div style={{ fontFamily: BN, fontSize: 25, fontWeight: 700, color: C.ink }}>{spec.course}</div>
      <div style={{ fontFamily: BN, fontSize: 23, color: C.mute }}>· {spec.lessonNo}</div>
      <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 6, width: 400 }}>
        <span style={{ fontFamily: MONO, fontSize: 18, color: C.teal, marginRight: 8 }}>{bn(Math.min(k, starts.length))}/{bn(starts.length)}</span>
        {starts.map((_, i) => <div key={i} style={{ flex: 1, height: 8, borderRadius: 4, background: i < k - 1 ? `${C.teal}88` : i === k - 1 ? C.teal : C.line }} />)}
      </div>
    </div>
  );
};
const AiTag: React.FC = () => (
  <div style={{ position: "absolute", right: 36, bottom: 130, display: "flex", alignItems: "center", gap: 8, padding: "8px 16px", borderRadius: 30, background: "rgba(17,26,46,.9)", border: `1px solid ${C.line}`, fontFamily: BN, fontSize: 19, color: C.mute }}><Bot size={20} color={C.teal} /> এআই প্রশিক্ষক · এআই কণ্ঠ</div>
);
// faint floating code glyphs in the background
const GLYPHS = ["</>", "{ }", "( )", "=>", "#", "[ ]", "&&", "npm", "git", "API"];
const Backdrop: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill>
      <AbsoluteFill style={{ backgroundImage: `radial-gradient(${C.line} 1.4px, transparent 1.4px)`, backgroundSize: "44px 44px", opacity: 0.55 }} />
      <AbsoluteFill style={{ background: `radial-gradient(1100px 650px at 88% 0%, ${C.indigo}22, transparent 70%), radial-gradient(900px 600px at 0% 100%, ${C.teal}1C, transparent 70%)` }} />
      {GLYPHS.map((g, i) => { const x = (i * 197 + 80) % 1840, y = ((i * 331 + 140 - f * (0.25 + (i % 3) * 0.1)) % 1100 + 1100) % 1100;
        return <div key={i} style={{ position: "absolute", left: x, top: y, fontFamily: MONO, fontSize: 34 + (i % 3) * 10, fontWeight: 700, color: i % 2 ? C.indigo : C.teal, opacity: 0.07 }}>{g}</div>; })}
    </AbsoluteFill>
  );
};
const subChunks = (spec: Spec, starts: number[]) => spec.scenes.flatMap((s, i) => {
  const parts = s.vo.split(/(?<=[।?!,—])\s+/).reduce<string[]>((a, x) => { if (a.length && (a[a.length - 1].length < 24 || x.length < 10)) a[a.length - 1] += " " + x; else a.push(x); return a; }, []);
  const total = parts.reduce((n, x) => n + x.length, 0); let acc = 0; const b = starts[i] + LEAD;
  return parts.map((x) => { const from = b + (s.frames * acc) / total; acc += x.length; return { s: x, from, to: b + (s.frames * acc) / total }; });
});

export const VibeVideo: React.FC<{ spec: Spec }> = ({ spec }) => {
  const f = useCurrentFrame();
  const lens = spec.scenes.map(sceneLen);
  const starts = lens.reduce<number[]>((a, _, i) => [...a, i ? a[i - 1] + lens[i - 1] : 15], []);
  const chunks = subChunks(spec, starts);
  const cur = chunks.find((x) => f >= x.from && f < x.to + 4);
  const total = vibeLen(spec);
  const busy = (fr: number) => spec.scenes.some((s, i) => fr >= starts[i] + LEAD - 6 && fr <= starts[i] + LEAD + s.frames + 4);
  return (
    <AbsoluteFill style={{ background: C.bg }}>
      <Backdrop />
      {spec.scenes.map((s, i) => {
        const S = MAP[s.type] || SNote; const len = lens[i];
        return (
          <Sequence key={i} from={starts[i]} durationInFrames={len}>
            <Fade len={len}><S s={s} spec={spec} vo={s.frames} /></Fade>
            <Sequence from={LEAD}><Audio src={staticFile(`vibe/${spec.id}/vo/${String(i + 1).padStart(2, "0")}.mp3`)} /></Sequence>
            <Sequence from={0}><Audio src={staticFile(`aiu2/${i === 0 ? "swell" : s.type === "quizA" || s.type === "outro" ? "chime" : "whoosh"}.mp3`)} volume={0.28} /></Sequence>
          </Sequence>
        );
      })}
      <Header spec={spec} starts={starts} />
      <AiTag />
      {cur && <div style={{ position: "absolute", left: 0, right: 0, bottom: 32, display: "flex", justifyContent: "center", opacity: interpolate(f, [cur.from, cur.from + 5, cur.to, cur.to + 4], [0, 1, 1, 0], clamp) }}><div style={{ maxWidth: 1500, padding: "10px 28px 14px", borderRadius: 14, background: "rgba(0,0,0,.78)", border: `1px solid ${C.line}`, fontFamily: BN, fontSize: 35, fontWeight: 500, color: "#fff", textAlign: "center", lineHeight: 1.35 }}>{cur.s.replace(/[।,]$/, "")}</div></div>}
      <Audio src={staticFile("aiu2/music.mp3")} volume={(fr) => (busy(fr) ? 0.05 : 0.14) * interpolate(fr, [0, 30, total - 60, total], [0, 1, 1, 0], clamp)} />
    </AbsoluteFill>
  );
};
const Fade: React.FC<{ len: number; children: React.ReactNode }> = ({ len, children }) => {
  const f = useCurrentFrame();
  const o = Math.min(interpolate(f, [0, 12], [0, 1], { ...clamp, easing: ease }), interpolate(f, [len - 10, len], [1, 0], clamp));
  return <AbsoluteFill style={{ opacity: o, transform: `scale(${0.985 + 0.015 * o})` }}>{children}</AbsoluteFill>;
};
