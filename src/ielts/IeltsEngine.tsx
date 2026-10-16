// AI University — IELTS lesson video engine ("বাংলায় IELTS" course). Light classroom style like LessonEngine, IELTS-specific scenes.
// One spec per lesson: src/ielts/specs/<id>.json, timed by scripts/ielts_make.py (Bangla VO via OpenRouter Tanvir; optional English
// exam-audio "clip" plays before the VO of a scene). Scene types:
// title · myth · points · spell · exam · compare · criteria · note · recap · quizQ · quizA · outro
import React from "react";
import { AbsoluteFill, Audio, Img, Sequence, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig, Easing, delayRender, continueRender } from "remotion";
import {
  GraduationCap, Target, Check, X, ArrowRight, Timer, CircleCheck, TriangleAlert, Headphones, PenLine, BookOpen, Mic, Lightbulb, Ear, Hash, Calendar, PoundSterling, MapPin,
  Phone, SpellCheck, ListChecks, Link, Layers, Sparkles, MessageSquareQuote, Bot, Scale, Ruler, FileText, Clock, Eye, Brain, Volume2,
} from "lucide-react";

const C = { bg: "#F4F7FC", card: "#FFFFFF", ink: "#0B1430", txt: "#1C2440", mute: "#5B6382", faint: "#8B92AD", line: "#E2E7F1", brand: "#0050ED", brand2: "#0090DB", navy: "#011835", soft: "#E9F1FF", green: "#12936A", gsoft: "#E7F8F0", amber: "#F59E0B", asoft: "#FDF3E1", red: "#D63C3C", rsoft: "#FDECEC", gold: "#B98A2F" };
const GRAD = `linear-gradient(95deg, ${C.brand}, ${C.brand2})`;
const BN = "Anek", EN = "Montserrat", PAPER = "Georgia, 'Times New Roman', 'Liberation Serif', 'DejaVu Serif', serif";
if (typeof document !== "undefined") {
  for (const [n, u] of [["Anek", "fonts/AnekBangla.ttf"], ["Montserrat", "fonts/Montserrat.ttf"]]) {
    const h = delayRender(`font ${n}`);
    const f = new FontFace(n, `url(${staticFile(u)})`, { weight: "100 900" });
    f.load().then(() => { document.fonts.add(f); continueRender(h); }).catch(() => continueRender(h));
  }
}
const ICONS: Record<string, React.FC<any>> = { headphones: Headphones, "pen-line": PenLine, "book-open": BookOpen, mic: Mic, lightbulb: Lightbulb, ear: Ear, hash: Hash, calendar: Calendar, pound: PoundSterling, "map-pin": MapPin, phone: Phone, "spell-check": SpellCheck, "list-checks": ListChecks, link: Link, layers: Layers, sparkles: Sparkles, quote: MessageSquareQuote, bot: Bot, scale: Scale, ruler: Ruler, "file-text": FileText, clock: Clock, eye: Eye, brain: Brain, target: Target, alert: TriangleAlert };
const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const ease = Easing.bezier(0.16, 1, 0.3, 1);
const bn = (n: number | string) => String(n).replace(/\d/g, (d) => "০১২৩৪৫৬৭৮৯"[+d]);
const ent = (f: number, fps: number, d: number, dur = 24) => spring({ frame: f - d, fps, config: { damping: 200 }, durationInFrames: dur });
const pop = (f: number, fps: number, d: number) => spring({ frame: f - d, fps, config: { damping: 12, mass: 0.6 } });

export type Scene = { type: string; vo: string; frames: number; clip?: string; clipFrames?: number; hold?: number; [k: string]: any };
export type Spec = { id: string; course: string; module: string; lessonNo: string; title: string; next: string; scenes: Scene[] };
const LEAD = 12, TAIL = 16, GAP = 14;
const clipLen = (s: Scene) => (s.clipFrames ? s.clipFrames + GAP : 0);
const sceneLen = (s: Scene) => LEAD + clipLen(s) + s.frames + (s.hold || 0) + TAIL;
export const ieltsLen = (spec: Spec) => spec.scenes.reduce((n, s) => n + sceneLen(s), 0) + 30;
type P = { s: Scene; spec: Spec; vo: number };
// time helpers: c(x) = point x (0..1) through the English clip, v(x) = point x through the Bangla VO
const c = (p: P, x: number) => LEAD + (p.s.clipFrames || 0) * x;
const v = (p: P, x: number) => LEAD + clipLen(p.s) + p.vo * x;

/* ---------- primitives ---------- */
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
const Head: React.FC<{ h: [string, string] | string; d?: number }> = ({ h, d = 4 }) => (
  <div style={{ position: "absolute", left: 130, top: 140, right: 130 }}><H d={d} size={58}>{Array.isArray(h) ? <>{h[0]}<span style={{ color: C.brand }}>{h[1]}</span></> : h}</H></div>
);
// waveform that moves only while the English clip plays
const Wave: React.FC<{ on: boolean; color?: string; n?: number }> = ({ on, color = C.brand, n = 28 }) => {
  const f = useCurrentFrame();
  return <div style={{ display: "flex", alignItems: "center", gap: 6, height: 60 }}>{Array.from({ length: n }, (_, i) => <div key={i} style={{ width: 7, borderRadius: 4, background: color, height: on ? 12 + Math.abs(Math.sin(f / 3.2 + i * 0.7) * Math.cos(f / 7 + i)) * 46 : 8, opacity: on ? 1 : 0.35 }} />)}</div>;
};
// highlight / strike words inside an English line as time passes
const Marked: React.FC<{ text: string; hl?: string[]; strike?: string[]; at: number; size?: number }> = ({ text, hl = [], strike = [], at: t0, size = 34 }) => {
  const f = useCurrentFrame();
  const words = [...hl.map((w) => ({ w, k: "hl" })), ...strike.map((w) => ({ w, k: "st" }))];
  if (!words.length) return <span>{text}</span>;
  const re = new RegExp(`\\b(${words.map((x) => x.w.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")).join("|")})\\b`, "gi");
  return <span>{text.split(re).map((part, i) => {
    const m = words.find((x) => x.w.toLowerCase() === part.toLowerCase());
    if (!m) return <span key={i}>{part}</span>;
    const k = interpolate(f, [t0, t0 + 12], [0, 1], { ...clamp, easing: ease });
    return m.k === "hl"
      ? <span key={i} style={{ background: `linear-gradient(transparent 55%, ${C.amber}${Math.round(k * 140).toString(16).padStart(2, "0")} 55%)`, fontWeight: 700, color: C.ink }}>{part}</span>
      : <span key={i} style={{ position: "relative", color: k > 0.5 ? C.faint : C.ink }}>{part}<span style={{ position: "absolute", left: 0, top: "52%", height: 4, width: `${k * 100}%`, background: C.red, borderRadius: 2 }} /></span>;
  })}</span>;
};

/* ---------- scenes ---------- */
const STitle: React.FC<P> = (p) => {
  const { s, spec } = p;
  return (
    <AbsoluteFill>
      <div style={{ position: "absolute", left: 130, top: 220, width: 860 }}>
        <Rise d={4}><span style={{ display: "inline-flex", gap: 10, alignItems: "center", padding: "10px 22px", borderRadius: 40, background: C.soft, color: C.brand, fontFamily: BN, fontSize: 30, fontWeight: 700 }}>{spec.module} · {spec.lessonNo}</span></Rise>
        <div style={{ marginTop: 30 }}><H d={10} size={86}>{spec.title}</H></div>
        <Rise d={24} style={{ marginTop: 26 }}><span style={{ fontFamily: BN, fontSize: 34, color: C.mute }}>{spec.course}</span></Rise>
      </div>
      <Card style={{ position: "absolute", right: 130, top: 230, width: 760, padding: "40px 44px" }}>
        <Rise d={v(p, 0.25)}><div style={{ display: "flex", alignItems: "center", gap: 14, fontFamily: BN, fontSize: 36, fontWeight: 800, color: C.ink }}><Target size={40} color={C.brand} /> এই পাঠে যা শিখবেন</div></Rise>
        {s.goals.map((g: string, i: number) => (
          <Rise key={i} d={v(p, 0.38 + i * 0.14)} y={24} style={{ display: "flex", gap: 18, alignItems: "flex-start", marginTop: 26 }}>
            <div style={{ width: 44, height: 44, borderRadius: 22, background: C.gsoft, display: "grid", placeItems: "center", flex: "none" }}><Check size={26} color={C.green} strokeWidth={3} /></div>
            <span style={{ fontFamily: BN, fontSize: 34, color: C.txt, lineHeight: 1.35 }}>{g}</span>
          </Rise>
        ))}
      </Card>
    </AbsoluteFill>
  );
};

const SMyth: React.FC<P> = (p) => {
  const { s } = p; const f = useCurrentFrame();
  const strike = interpolate(f, [v(p, 0.3), v(p, 0.38)], [0, 1], { ...clamp, easing: ease });
  return (
    <AbsoluteFill>
      <div style={{ position: "absolute", left: 130, top: 170 }}><Rise d={4}><span style={{ fontFamily: EN, fontSize: 22, fontWeight: 800, letterSpacing: "0.28em", color: C.red }}>MYTH vs FACT</span></Rise></div>
      <Rise d={v(p, 0.05)} style={{ position: "absolute", left: 130, right: 130, top: 240 }}>
        <Card style={{ padding: "36px 44px", background: C.rsoft, border: `1px solid ${C.red}33`, boxShadow: "none" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 18 }}><div style={{ width: 56, height: 56, borderRadius: 28, background: C.red, display: "grid", placeItems: "center" }}><X size={34} color="#fff" strokeWidth={3} /></div><span style={{ fontFamily: BN, fontSize: 30, color: C.red, fontWeight: 700 }}>ভুল ধারণা</span></div>
          <div style={{ position: "relative", display: "inline-block", marginTop: 18 }}><span style={{ fontFamily: BN, fontSize: 56, fontWeight: 800, color: C.ink }}>{s.wrong}</span><div style={{ position: "absolute", left: 0, top: "55%", height: 6, borderRadius: 3, width: `${strike * 100}%`, background: C.red }} /></div>
        </Card>
      </Rise>
      <Rise d={v(p, 0.42)} style={{ position: "absolute", left: 130, right: 130, top: 540 }}>
        <Card style={{ padding: "36px 44px", background: C.gsoft, border: `1px solid ${C.green}33`, boxShadow: "none" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 18 }}><div style={{ width: 56, height: 56, borderRadius: 28, background: C.green, display: "grid", placeItems: "center" }}><Check size={34} color="#fff" strokeWidth={3} /></div><span style={{ fontFamily: BN, fontSize: 30, color: C.green, fontWeight: 700 }}>সঠিক কথা</span></div>
          <div style={{ fontFamily: BN, fontSize: 50, fontWeight: 800, color: C.ink, marginTop: 14 }}>{s.right}</div>
          {s.sub && <div style={{ fontFamily: BN, fontSize: 32, color: C.mute, marginTop: 8 }}>{s.sub}</div>}
        </Card>
      </Rise>
    </AbsoluteFill>
  );
};

const SPoints: React.FC<P> = (p) => {
  const { s } = p; const n = s.items.length; const cols = n > 3 ? 2 : 1;
  return (
    <AbsoluteFill>
      <Head h={s.head} />
      <div style={{ position: "absolute", left: 130, right: 130, top: 270, display: "grid", gridTemplateColumns: `repeat(${cols}, 1fr)`, gap: 22 }}>
        {s.items.map((it: any, i: number) => {
          const I = ICONS[it.icon] || Lightbulb;
          return (
            <Rise key={i} d={v(p, 0.08 + (i / n) * 0.8)} y={26}>
              <Card style={{ padding: "26px 30px", display: "flex", gap: 24, alignItems: "flex-start", boxShadow: "none" }}>
                <div style={{ width: 74, height: 74, borderRadius: 20, background: C.soft, display: "grid", placeItems: "center", flex: "none" }}><I size={40} color={C.brand} strokeWidth={1.8} /></div>
                <div>
                  <div style={{ fontFamily: BN, fontSize: 38, fontWeight: 800, color: C.ink, lineHeight: 1.25 }}>{it.t}</div>
                  {it.s && <div style={{ fontFamily: BN, fontSize: 29, color: C.mute, marginTop: 6, lineHeight: 1.4 }}>{it.s}</div>}
                  {it.en && <div style={{ fontFamily: PAPER, fontSize: 30, color: C.brand, marginTop: 8, fontStyle: "italic" }}>{it.en}</div>}
                </div>
              </Card>
            </Rise>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};

// letters of a spelled name appear one by one while the English clip plays (tokens like "double N" grow into two letters)
const SSpell: React.FC<P> = (p) => {
  const { s } = p; const f = useCurrentFrame(); const { fps } = useVideoConfig();
  const toks: string[] = s.tokens; const playing = f >= LEAD && f < LEAD + (s.clipFrames || 0);
  const t0 = s.clipFrames ? c(p, s.from ?? 0.25) : v(p, 0.1), t1 = s.clipFrames ? c(p, s.to ?? 0.9) : v(p, 0.7);
  return (
    <AbsoluteFill>
      <Head h={s.head} />
      <Rise d={6} style={{ position: "absolute", left: 130, top: 270, display: "flex", alignItems: "center", gap: 24 }}>
        <div style={{ width: 78, height: 78, borderRadius: 39, background: playing ? C.brand : C.soft, display: "grid", placeItems: "center" }}><Volume2 size={40} color={playing ? "#fff" : C.brand} /></div>
        <Wave on={playing} />
        <span style={{ fontFamily: PAPER, fontSize: 34, color: C.mute, fontStyle: "italic" }}>“{s.said}”</span>
      </Rise>
      <div style={{ position: "absolute", left: 130, right: 130, top: 430, display: "flex", gap: 18, justifyContent: "center", flexWrap: "wrap" }}>
        {toks.map((t, i) => {
          const d = t0 + ((t1 - t0) * i) / toks.length; const k = pop(f, fps, d); const dbl = /^double /i.test(t);
          const L = dbl ? t.split(" ")[1] : t;
          return (
            <div key={i} style={{ opacity: Math.min(1, k * 1.4), transform: `scale(${0.6 + 0.4 * k})`, display: "flex", flexDirection: "column", alignItems: "center", gap: 10 }}>
              <div style={{ display: "flex", gap: 8 }}>{(dbl ? [L, L] : [L]).map((x, j) => <div key={j} style={{ width: 104, height: 128, borderRadius: 20, background: dbl ? C.asoft : C.card, border: `3px solid ${dbl ? C.amber : C.line}`, display: "grid", placeItems: "center", fontFamily: EN, fontWeight: 800, fontSize: 70, color: C.ink, boxShadow: "0 12px 30px rgba(16,24,64,.10)" }}>{x}</div>)}</div>
              {dbl && <span style={{ fontFamily: EN, fontSize: 24, fontWeight: 700, color: C.amber }}>“double {L}”</span>}
            </div>
          );
        })}
      </div>
      <Rise d={v(p, 0.05)} style={{ position: "absolute", left: 0, right: 0, top: 690, display: "flex", justifyContent: "center" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 18, padding: "18px 34px", borderRadius: 20, background: C.gsoft, border: `2px solid ${C.green}55` }}>
          <Check size={36} color={C.green} strokeWidth={3} /><span style={{ fontFamily: BN, fontSize: 34, color: C.green, fontWeight: 700 }}>উত্তরপত্রে লিখুন:</span><span style={{ fontFamily: PAPER, fontSize: 46, fontWeight: 700, color: C.ink }}>{s.answer}</span>
        </div>
      </Rise>
    </AbsoluteFill>
  );
};

// exam form on the left (gap highlighted, answer typed in after the clip) + what the speakers say on the right
const SExam: React.FC<P> = (p) => {
  const { s } = p; const f = useCurrentFrame(); const { fps } = useVideoConfig();
  const playing = f >= LEAD && f < LEAD + (s.clipFrames || 0);
  const typeAt = s.clipFrames ? c(p, 1) : v(p, 0.4); const ans: string = s.answer || "";
  const typed = ans.slice(0, Math.max(0, Math.floor((f - typeAt) / 2.2)));
  return (
    <AbsoluteFill>
      <Head h={s.head} />
      <Rise d={6} style={{ position: "absolute", left: 130, top: 260, width: 820 }}>
        <div style={{ background: "#fff", border: `3px solid ${C.ink}`, borderRadius: 6, padding: "26px 30px", fontFamily: PAPER, boxShadow: "0 24px 60px rgba(16,24,64,.12)" }}>
          <div style={{ textAlign: "center", fontWeight: 700, fontSize: 30, color: C.ink, marginBottom: 14 }}>{s.paper.title}</div>
          {s.paper.rows.map((r: any) => {
            const on = r.n === s.focus;
            return (
              <div key={r.label} style={{ display: "grid", gridTemplateColumns: "320px 1fr", alignItems: "center", gap: 14, padding: "12px 0", borderBottom: `1px dashed ${C.line}`, fontSize: 28, color: C.ink, opacity: s.focus && !on ? 0.45 : 1 }}>
                <span>{r.label}</span>
                <span style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  {r.n ? <b style={{ width: 40, height: 40, border: `2px solid ${C.ink}`, borderRadius: 5, display: "grid", placeItems: "center", fontFamily: EN, fontSize: 20 }}>{r.n}</b> : null}
                  {r.n ? <span style={{ flex: 1, minHeight: 50, padding: "6px 14px", borderRadius: 8, border: `3px solid ${on ? (f >= typeAt ? C.green : C.amber) : C.line}`, background: on && f >= typeAt ? C.gsoft : "#fff", fontWeight: 700, boxShadow: on && f < typeAt ? `0 0 0 ${6 + Math.sin(f / 5) * 4}px ${C.amber}44` : "none" }}>{on ? typed : r.ans || ""}{on && f >= typeAt && typed.length < ans.length ? "|" : ""}</span>
                    : <em style={{ color: C.mute }}>{r.ans}</em>}
                </span>
              </div>
            );
          })}
        </div>
      </Rise>
      <div style={{ position: "absolute", left: 1010, right: 120, top: 260, display: "flex", flexDirection: "column", gap: 18 }}>
        {s.clipFrames ? <Rise d={8} style={{ display: "flex", alignItems: "center", gap: 18 }}>
          <div style={{ width: 70, height: 70, borderRadius: 35, background: playing ? C.brand : C.soft, display: "grid", placeItems: "center" }}><Headphones size={36} color={playing ? "#fff" : C.brand} /></div>
          <Wave on={playing} n={22} />
        </Rise> : null}
        {s.lines.map((l: any, i: number) => (
          <Rise key={i} d={s.clipFrames ? c(p, i / s.lines.length) : v(p, 0.05 + i * 0.1)} y={18}>
            <Card style={{ padding: "18px 24px", boxShadow: "none", borderLeft: `6px solid ${l.who === "A" ? C.brand : C.brand2}` }}>
              <div style={{ fontFamily: EN, fontSize: 18, fontWeight: 800, color: l.who === "A" ? C.brand : C.brand2, letterSpacing: "0.08em" }}>{(l.name || (!s.clipFrames ? "Passage" : l.who === "A" ? "RECEPTIONIST" : "CALLER")).toUpperCase()}</div>
              <div style={{ fontFamily: PAPER, fontSize: 32, color: C.ink, lineHeight: 1.4, marginTop: 4 }}><Marked text={l.text} hl={s.hl} strike={s.strike} at={s.clipFrames ? c(p, 0.95) : v(p, 0.3)} /></div>
            </Card>
          </Rise>
        ))}
        {s.tip && <Rise d={v(p, 0.55)}><div style={{ display: "flex", gap: 14, alignItems: "flex-start", padding: "16px 20px", borderRadius: 16, background: C.asoft, border: `2px solid ${C.amber}55` }}><Lightbulb size={32} color={C.amber} style={{ flex: "none" }} /><span style={{ fontFamily: BN, fontSize: 29, color: C.ink, lineHeight: 1.4 }}>{s.tip}</span></div></Rise>}
      </div>
    </AbsoluteFill>
  );
};

const SCompare: React.FC<P> = (p) => {
  const { s } = p; const n = s.rows.length;
  return (
    <AbsoluteFill>
      <Head h={s.head} />
      <div style={{ position: "absolute", left: 130, right: 130, top: 260, display: "flex", flexDirection: "column", gap: 24 }}>
        {s.rows.map((r: any, i: number) => (
          <div key={i} style={{ display: "grid", gridTemplateColumns: r.tag ? "120px 1fr 1fr" : "1fr 1fr", gap: 18, alignItems: "stretch" }}>
            {r.tag && <Rise d={v(p, (i / n) * 0.85)}><div style={{ height: "100%", borderRadius: 20, background: GRAD, display: "grid", placeItems: "center", fontFamily: EN, fontWeight: 800, fontSize: 34, color: "#fff" }}>{r.tag}</div></Rise>}
            <Rise d={v(p, (i / n) * 0.85 + 0.02)}><Card style={{ height: "100%", padding: "22px 26px", background: C.rsoft, border: `2px solid ${C.red}44`, boxShadow: "none" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, fontFamily: BN, fontSize: 26, fontWeight: 700, color: C.red }}><X size={28} strokeWidth={3} /> {r.badLabel || "দুর্বল"}</div>
              <div style={{ fontFamily: PAPER, fontSize: 31, color: C.ink, marginTop: 8, lineHeight: 1.4 }}>{r.bad}</div></Card></Rise>
            <Rise d={v(p, (i / n) * 0.85 + 0.12)}><Card style={{ height: "100%", padding: "22px 26px", background: C.gsoft, border: `2px solid ${C.green}44`, boxShadow: "none" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, fontFamily: BN, fontSize: 26, fontWeight: 700, color: C.green }}><Check size={28} strokeWidth={3} /> {r.goodLabel || "উন্নত"}</div>
              <div style={{ fontFamily: PAPER, fontSize: 31, color: C.ink, marginTop: 8, lineHeight: 1.4 }}>{r.good}</div>
              {r.why && <div style={{ fontFamily: BN, fontSize: 25, color: C.mute, marginTop: 10, lineHeight: 1.4 }}>{r.why}</div>}</Card></Rise>
          </div>
        ))}
      </div>
    </AbsoluteFill>
  );
};

const SCriteria: React.FC<P> = (p) => {
  const { s } = p; const f = useCurrentFrame(); const { fps } = useVideoConfig();
  return (
    <AbsoluteFill>
      <Head h={s.head} />
      <div style={{ position: "absolute", left: 130, right: 130, top: 270, display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 22 }}>
        {s.items.map((it: any, i: number) => {
          const I = ICONS[it.icon] || Target; const d = v(p, 0.1 + i * 0.2); const k = ent(f, fps, d, 30);
          return (
            <div key={i} style={{ opacity: k, transform: `translateY(${(1 - k) * 50}px)` }}>
              <Card style={{ padding: "30px 26px", height: 560, display: "flex", flexDirection: "column", gap: 14 }}>
                <div style={{ width: 84, height: 84, borderRadius: 24, background: GRAD, display: "grid", placeItems: "center" }}><I size={46} color="#fff" strokeWidth={1.8} /></div>
                <div style={{ fontFamily: EN, fontSize: 48, fontWeight: 800, color: C.brand }}>{it.k}</div>
                <div style={{ fontFamily: EN, fontSize: 22, fontWeight: 700, color: C.mute, lineHeight: 1.3 }}>{it.en}</div>
                <div style={{ fontFamily: BN, fontSize: 30, color: C.ink, lineHeight: 1.4, fontWeight: 600 }}>{it.bn}</div>
                <div style={{ marginTop: "auto", display: "flex", alignItems: "center", gap: 10 }}>
                  <div style={{ flex: 1, height: 12, borderRadius: 6, background: C.line, overflow: "hidden" }}><div style={{ width: `${25 * Math.min(1, k)}%`, height: "100%", background: GRAD }} /></div>
                  <span style={{ fontFamily: BN, fontSize: 28, fontWeight: 800, color: C.ink }}>২৫%</span>
                </div>
              </Card>
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};

const SNote: React.FC<P> = (p) => {
  const { s } = p; const f = useCurrentFrame(); const { fps } = useVideoConfig(); const k = pop(f, fps, 4);
  return (
    <AbsoluteFill style={{ alignItems: "center", justifyContent: "center" }}>
      <Card style={{ width: 1400, padding: "56px 64px", background: C.asoft, border: `2px solid ${C.amber}66`, display: "flex", gap: 46, alignItems: "center", marginTop: -40 }}>
        <div style={{ width: 160, height: 160, borderRadius: 40, background: C.amber, display: "grid", placeItems: "center", flex: "none", transform: `scale(${k}) rotate(${(1 - k) * -20}deg)` }}><TriangleAlert size={92} color="#fff" strokeWidth={1.8} /></div>
        <div>
          <H d={8} size={58} color={C.amber}>{s.head}</H>
          <Rise d={v(p, 0.1)} style={{ marginTop: 12 }}><div style={{ fontFamily: BN, fontSize: 44, fontWeight: 800, color: C.ink, lineHeight: 1.3 }}>{s.text}</div></Rise>
          {s.sub && <Rise d={v(p, 0.55)} style={{ marginTop: 16 }}><div style={{ fontFamily: BN, fontSize: 31, color: C.mute }}>{s.sub}</div></Rise>}
        </div>
      </Card>
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
            <span style={{ fontFamily: BN, fontSize: 34, fontWeight: 700, color: C.ink, lineHeight: 1.3 }}>{t}</span>
          </Card>
        </Rise>
      ))}
    </div>
  </AbsoluteFill>
);

const SQuiz: React.FC<P & { answer?: boolean }> = (p) => {
  const { s } = p; const f = useCurrentFrame();
  const holdStart = LEAD + clipLen(s) + p.vo, hold = s.hold || 0;
  const left = p.answer ? 0 : Math.max(0, Math.ceil((holdStart + hold - f) / 30));
  const ring = p.answer ? 0 : interpolate(f, [holdStart, holdStart + hold], [1, 0], clamp);
  return (
    <AbsoluteFill>
      <div style={{ position: "absolute", left: 130, top: 140 }}><Rise d={2}><span style={{ fontFamily: EN, fontSize: 22, fontWeight: 800, letterSpacing: "0.28em", color: C.green }}>QUICK CHECK</span></Rise></div>
      <Card style={{ position: "absolute", left: 130, right: 130, top: 200, padding: "40px 48px" }}>
        <div style={{ fontFamily: BN, fontSize: 48, fontWeight: 800, color: C.ink, lineHeight: 1.3 }}>{s.q}</div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 18, marginTop: 30 }}>
          {s.o.map((o: string, i: number) => {
            const right = p.answer && i === s.a;
            return (
              <Rise key={i} d={p.answer ? 0 : v(p, 0.2 + i * 0.1)} y={18} style={{ display: "flex", alignItems: "center", gap: 20, padding: "22px 26px", borderRadius: 20, border: `3px solid ${right ? C.green : C.line}`, background: right ? C.gsoft : "#fff", opacity: p.answer && !right ? 0.5 : 1 }}>
                <div style={{ width: 52, height: 52, borderRadius: 26, background: right ? C.green : C.soft, color: right ? "#fff" : C.brand, display: "grid", placeItems: "center", fontFamily: BN, fontWeight: 800, fontSize: 26, flex: "none" }}>{right ? <Check size={30} strokeWidth={3.5} /> : "কখগঘ"[i]}</div>
                <span style={{ fontFamily: /[a-z]/i.test(o) ? PAPER : BN, fontSize: 36, fontWeight: 600, color: C.ink }}>{o}</span>
              </Rise>
            );
          })}
        </div>
        {p.answer && <Rise d={v(p, 0.25)} style={{ marginTop: 26, padding: "18px 24px", borderRadius: 16, background: C.gsoft, fontFamily: BN, fontSize: 31, color: C.green, fontWeight: 600, lineHeight: 1.4 }}>✔ {s.ex}</Rise>}
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
      <div style={{ position: "absolute", top: 380, textAlign: "center" }}><H d={10} size={80}>{s.head || "এবার নিজে অনুশীলন করুন!"}</H></div>
      {s.cta && <Rise d={v(p, 0.15)} style={{ position: "absolute", top: 520 }}><div style={{ display: "flex", alignItems: "center", gap: 18, padding: "20px 34px", borderRadius: 20, background: C.soft, fontFamily: BN, fontSize: 36, fontWeight: 700, color: C.brand }}><Sparkles size={36} /> {s.cta}</div></Rise>}
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

const MAP: Record<string, React.FC<any>> = { title: STitle, myth: SMyth, points: SPoints, spell: SSpell, exam: SExam, compare: SCompare, criteria: SCriteria, note: SNote, recap: SRecap, quizQ: SQuiz, quizA: (p: P) => <SQuiz {...p} answer />, outro: SOutro };

/* ---------- frame chrome ---------- */
const Header: React.FC<{ spec: Spec; starts: number[] }> = ({ spec, starts }) => {
  const f = useCurrentFrame(); const k = starts.filter((s) => f >= s).length;
  return (
    <div style={{ position: "absolute", left: 0, right: 0, top: 0, height: 96, display: "flex", alignItems: "center", gap: 22, padding: "0 56px", background: "rgba(255,255,255,.9)", borderBottom: `1px solid ${C.line}` }}>
      <Img src={staticFile("brand/logo.png")} style={{ height: 52 }} />
      <div style={{ width: 1, height: 34, background: C.line }} />
      <div style={{ fontFamily: BN, fontSize: 26, fontWeight: 700, color: C.ink }}>{spec.course}</div>
      <div style={{ fontFamily: BN, fontSize: 24, color: C.mute }}>· {spec.lessonNo}</div>
      <div style={{ marginLeft: "auto", display: "flex", gap: 6, width: 420 }}>
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
  const total = parts.reduce((n, x) => n + x.length, 0); let acc = 0; const b = starts[i] + LEAD + clipLen(s);
  return parts.map((x) => { const from = b + (s.frames * acc) / total; acc += x.length; return { s: x, from, to: b + (s.frames * acc) / total }; });
});

export const IeltsVideo: React.FC<{ spec: Spec }> = ({ spec }) => {
  const f = useCurrentFrame();
  const lens = spec.scenes.map(sceneLen);
  const starts = lens.reduce<number[]>((a, _, i) => [...a, i ? a[i - 1] + lens[i - 1] : 15], []);
  const chunks = subChunks(spec, starts);
  const cur = chunks.find((x) => f >= x.from && f < x.to + 4);
  const total = ieltsLen(spec);
  const busy = (fr: number) => spec.scenes.some((s, i) => fr >= starts[i] + LEAD - 6 && fr <= starts[i] + LEAD + clipLen(s) + s.frames + 4);
  return (
    <AbsoluteFill style={{ background: C.bg }}>
      <AbsoluteFill style={{ backgroundImage: `linear-gradient(${C.line} 1px, transparent 1px), linear-gradient(90deg, ${C.line} 1px, transparent 1px)`, backgroundSize: "64px 64px", opacity: 0.5 }} />
      <AbsoluteFill style={{ background: `radial-gradient(1000px 600px at 85% 0%, ${C.brand}14, transparent 70%), radial-gradient(900px 600px at 0% 100%, ${C.brand2}12, transparent 70%)` }} />
      {spec.scenes.map((s, i) => {
        const S = MAP[s.type]; const len = lens[i];
        return (
          <Sequence key={i} from={starts[i]} durationInFrames={len}>
            <Fade len={len}><S s={s} spec={spec} vo={s.frames} /></Fade>
            {s.clip && <Sequence from={LEAD}><Audio src={staticFile(`ielts/${spec.id}/${s.clip}`)} /></Sequence>}
            <Sequence from={LEAD + clipLen(s)}><Audio src={staticFile(`ielts/${spec.id}/vo/${String(i + 1).padStart(2, "0")}.mp3`)} /></Sequence>
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
