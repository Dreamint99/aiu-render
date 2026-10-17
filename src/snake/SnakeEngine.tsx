// AI University — "সাপ চেনা, সর্পদংশন প্রতিরোধ ও নিরাপদ উদ্ধার" lesson video engine.
// Look: nature field guide — deep forest green, cream paper cards, real species photos (Wikimedia Commons, credited on screen),
// field-note pins, red/green/amber status badges. Spec: src/snake/specs/<id>.json, timed by scripts/snake_make.py.
// Scene types: title · species · compare · points · steps · photo · warn · myth · recap · quizQ · quizA · outro
import React from "react";
import { AbsoluteFill, Audio, Img, Sequence, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig, Easing, delayRender, continueRender } from "remotion";
import {
  Check, X, ArrowRight, Timer, CircleCheck, TriangleAlert, Lightbulb, Bot, Leaf, Moon, Flashlight, Footprints, Home, Phone, Hospital,
  ShieldCheck, Eye, Hand, Ban, Siren, Users, Wheat, Waves, Bed, Rat, Trash2, Ruler, Clock, HeartPulse, Scale, Bug, MapPin, Camera, DoorOpen, Droplets, Syringe,
} from "lucide-react";

const C = { bg: "#0E2A1E", bg2: "#163A2A", paper: "#F5EEDC", paper2: "#EDE3C9", ink: "#1E2A1F", mute: "#5E6B58", line: "#D9CCAA",
  moss: "#2F6B3F", leaf: "#7DBE6A", amber: "#E0A12B", asoft: "#FBEFD2", red: "#C8402F", rsoft: "#F9E1DA", green: "#2E8B57", gsoft: "#E1F2E3", cream: "#FFF9EA" };
const BN = "Anek", EN = "Montserrat";
if (typeof document !== "undefined") {
  for (const [n, u] of [["Anek", "fonts/AnekBangla.ttf"], ["Montserrat", "fonts/Montserrat.ttf"]]) {
    const h = delayRender(`font ${n}`);
    const f = new FontFace(n, `url(${staticFile(u)})`, { weight: "100 900" });
    f.load().then(() => { document.fonts.add(f); continueRender(h); }).catch(() => continueRender(h));
  }
}
export const ICONS: Record<string, React.FC<any>> = { leaf: Leaf, moon: Moon, torch: Flashlight, foot: Footprints, home: Home, phone: Phone, hospital: Hospital,
  shield: ShieldCheck, eye: Eye, hand: Hand, ban: Ban, siren: Siren, users: Users, wheat: Wheat, water: Waves, bed: Bed, rat: Rat, trash: Trash2, ruler: Ruler,
  clock: Clock, heart: HeartPulse, law: Scale, bug: Bug, pin: MapPin, camera: Camera, door: DoorOpen, drop: Droplets, syringe: Syringe, alert: TriangleAlert, idea: Lightbulb };
const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const ease = Easing.bezier(0.16, 1, 0.3, 1);
const bn = (n: number | string) => String(n).replace(/\d/g, (d) => "০১২৩৪৫৬৭৮৯"[+d]);
const ent = (f: number, fps: number, d: number, dur = 24) => spring({ frame: f - d, fps, config: { damping: 200 }, durationInFrames: dur });
const pop = (f: number, fps: number, d: number) => spring({ frame: f - d, fps, config: { damping: 12, mass: 0.6 } });

export type Credit = { bn: string; sci: string; author: string; license: string; pos?: string };
export type Scene = { type: string; vo: string; frames: number; hold?: number; [k: string]: any };
export type Spec = { id: string; course: string; module: string; lessonNo: string; title: string; next: string; scenes: Scene[]; credits?: Record<string, Credit> };
const LEAD = 12, TAIL = 16;
const sceneLen = (s: Scene) => LEAD + s.frames + (s.hold || 0) + TAIL;
export const snakeLen = (spec: Spec) => spec.scenes.reduce((n, s) => n + sceneLen(s), 0) + 30;
type P = { s: Scene; spec: Spec; vo: number };
const v = (p: P, x: number) => LEAD + p.vo * x;

/* ---------- primitives ---------- */
const Rise: React.FC<{ d: number; children: React.ReactNode; style?: React.CSSProperties; y?: number }> = ({ d, children, style, y = 40 }) => {
  const f = useCurrentFrame(); const { fps } = useVideoConfig(); const s = ent(f, fps, d);
  return <div style={{ opacity: s, transform: `translateY(${(1 - s) * y}px)`, ...style }}>{children}</div>;
};
const H: React.FC<{ d: number; size: number; children: React.ReactNode; color?: string }> = ({ d, size, children, color = C.cream }) => {
  const f = useCurrentFrame(); const { fps } = useVideoConfig(); const s = ent(f, fps, d, 28);
  return <div style={{ overflow: "hidden", paddingTop: size * 0.16, paddingBottom: size * 0.22, marginTop: -size * 0.16, marginBottom: -size * 0.22 }}><div style={{ fontFamily: BN, fontSize: size, fontWeight: 800, color, lineHeight: 1.25, transform: `translateY(${(1 - s) * 110}%)` }}>{children}</div></div>;
};
const Paper: React.FC<{ children: React.ReactNode; style?: React.CSSProperties }> = ({ children, style }) => (
  <div style={{ background: C.paper, borderRadius: 22, border: `1px solid ${C.line}`, boxShadow: "0 26px 60px rgba(0,0,0,.35)", position: "relative", ...style }}>{children}</div>
);
const Head: React.FC<{ h: [string, string] | string; d?: number; top?: number }> = ({ h, d = 4, top = 140 }) => (
  <div style={{ position: "absolute", left: 130, top, right: 130 }}><H d={d} size={58}>{Array.isArray(h) ? <>{h[0].endsWith(" ") ? h[0] : h[0] + " "}<span style={{ color: C.leaf }}>{h[1]}</span></> : h}</H></div>
);
const BADGE: Record<string, [string, string, string]> = { venom: ["বিষধর", C.red, "#fff"], deadly: ["মারাত্মক বিষধর", C.red, "#fff"], mild: ["মৃদু বিষধর", C.amber, C.ink], safe: ["নির্বিষ", C.green, "#fff"] };
const Badge: React.FC<{ k: string; size?: number }> = ({ k, size = 28 }) => {
  const b = BADGE[k] || BADGE.venom; const I = k === "safe" ? ShieldCheck : TriangleAlert;
  return <span style={{ display: "inline-flex", alignItems: "center", gap: 10, padding: `${size * 0.28}px ${size * 0.7}px`, borderRadius: 40, background: b[1], color: b[2], fontFamily: BN, fontWeight: 800, fontSize: size }}><I size={size * 1.05} strokeWidth={2.4} /> {b[0]}</span>;
};
// slow Ken Burns on a photo; key = photos/<key>.jpg or scenes/<key>.jpg
const src = (k: string) => staticFile(`snakefx/${k.includes("/") ? k : "photos/" + k}.jpg`);
let POS: Record<string, string> = {};
const KB: React.FC<{ k: string; len: number; style?: React.CSSProperties; zoom?: number; pos?: string }> = ({ k, len, style, zoom = 1.12, pos }) => {
  const f = useCurrentFrame(); pos = pos || POS[k] || "center"; const z = interpolate(f, [0, len], [1.02, zoom], clamp);
  return <div style={{ overflow: "hidden", ...style }}><Img src={src(k)} style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: pos, transform: `scale(${z})` }} /></div>;
};
const CreditLine: React.FC<{ spec: Spec; k: string; style?: React.CSSProperties }> = ({ spec, k, style }) => {
  if (k.startsWith("scenes/")) return <div style={{ position: "absolute", fontFamily: BN, fontSize: 17, color: "rgba(255,255,255,.75)", background: "rgba(0,0,0,.45)", padding: "3px 10px", borderRadius: 6, ...style }}>এআই দিয়ে তৈরি দৃশ্য</div>;
  const c = spec.credits?.[k]; if (!c) return null;
  return <div style={{ position: "absolute", fontFamily: EN, fontSize: 16, color: "rgba(255,255,255,.85)", background: "rgba(0,0,0,.5)", padding: "3px 10px", borderRadius: 6, ...style }}>Photo: {c.author} · {c.license} · Wikimedia Commons</div>;
};
const Sci: React.FC<{ t: string; size?: number; color?: string }> = ({ t, size = 28, color = C.mute }) => <span style={{ fontFamily: EN, fontStyle: "italic", fontSize: size, color, fontWeight: 500 }}>{t}</span>;

/* ---------- scenes ---------- */
const STitle: React.FC<P> = (p) => {
  const { s, spec } = p; const len = sceneLen(s);
  return (
    <AbsoluteFill>
      <KB k={s.photo} len={len} style={{ position: "absolute", right: 0, top: 0, width: 1040, height: 1080 }} />
      <div style={{ position: "absolute", right: 0, top: 0, width: 1040, height: 1080, background: `linear-gradient(90deg, ${C.bg} 0%, ${C.bg}cc 22%, transparent 55%)` }} />
      <CreditLine spec={spec} k={s.photo} style={{ right: 24, bottom: 110 }} />
      <div style={{ position: "absolute", left: 120, top: 170, width: 900 }}>
        <Rise d={4}><span style={{ display: "inline-flex", gap: 10, alignItems: "center", padding: "10px 22px", borderRadius: 40, background: "rgba(125,190,106,.18)", color: C.leaf, fontFamily: BN, fontSize: 30, fontWeight: 700 }}><Leaf size={30} /> {spec.module} · {spec.lessonNo}</span></Rise>
        <div style={{ marginTop: 28 }}><H d={10} size={76}>{spec.title}</H></div>
        <Paper style={{ marginTop: 40, padding: "30px 36px", width: 780 }}>
          <Rise d={v(p, 0.15)}><div style={{ fontFamily: BN, fontSize: 32, fontWeight: 800, color: C.moss }}>এই পাঠে যা শিখবেন</div></Rise>
          {s.goals.map((g: string, i: number) => (
            <Rise key={i} d={v(p, 0.28 + i * 0.14)} y={20} style={{ display: "flex", gap: 16, alignItems: "flex-start", marginTop: 18 }}>
              <div style={{ width: 40, height: 40, borderRadius: 20, background: C.gsoft, display: "grid", placeItems: "center", flex: "none" }}><Check size={24} color={C.green} strokeWidth={3} /></div>
              <span style={{ fontFamily: BN, fontSize: 32, color: C.ink, lineHeight: 1.35 }}>{g}</span>
            </Rise>
          ))}
        </Paper>
      </div>
    </AbsoluteFill>
  );
};

// one species: big photo + field-guide card with numbered identification notes
const SSpecies: React.FC<P> = (p) => {
  const { s, spec } = p; const f = useCurrentFrame(); const { fps } = useVideoConfig(); const len = sceneLen(s);
  const c = spec.credits?.[s.photo]; const n = s.marks.length;
  return (
    <AbsoluteFill>
      <Rise d={0} y={0} style={{ position: "absolute", left: 70, top: 130, width: 1060, height: 780 }}>
        <div style={{ position: "relative", width: "100%", height: "100%", borderRadius: 24, overflow: "hidden", border: `6px solid ${C.paper}`, boxShadow: "0 30px 80px rgba(0,0,0,.5)" }}>
          <KB k={s.photo} len={len} style={{ width: "100%", height: "100%" }} pos={s.pos} />
          <CreditLine spec={spec} k={s.photo} style={{ left: 14, bottom: 14 }} />
        </div>
      </Rise>
      <Paper style={{ position: "absolute", left: 1170, right: 70, top: 130, height: 780, padding: "34px 36px", overflow: "hidden" }}>
        <div style={{ position: "absolute", right: -40, top: -40, opacity: 0.08 }}><Leaf size={260} color={C.moss} /></div>
        <Rise d={6}><Badge k={s.status || "venom"} size={26} /></Rise>
        <Rise d={10}><div style={{ fontFamily: BN, fontSize: 56, fontWeight: 800, color: C.ink, marginTop: 16, lineHeight: 1.2 }}>{s.name || c?.bn}</div></Rise>
        <Rise d={14}><Sci t={s.sci || c?.sci || ""} size={28} /></Rise>
        <div style={{ height: 2, background: C.line, margin: "20px 0 8px" }} />
        {s.marks.map((m: string, i: number) => {
          const d = v(p, 0.12 + (i / n) * 0.72); const k = Math.min(1, pop(f, fps, d));
          return (
            <div key={i} style={{ display: "flex", gap: 16, alignItems: "flex-start", marginTop: 16, opacity: k, transform: `translateX(${(1 - k) * 30}px)` }}>
              <div style={{ width: 42, height: 42, borderRadius: 21, background: C.moss, color: "#fff", display: "grid", placeItems: "center", fontFamily: BN, fontWeight: 800, fontSize: 24, flex: "none", transform: `scale(${k})` }}>{bn(i + 1)}</div>
              <span style={{ fontFamily: BN, fontSize: 31, color: C.ink, lineHeight: 1.35, fontWeight: 600 }}>{m}</span>
            </div>
          );
        })}
        {s.where && <Rise d={v(p, 0.85)} style={{ position: "absolute", left: 36, right: 36, bottom: 28, display: "flex", gap: 12, alignItems: "center", padding: "14px 18px", borderRadius: 14, background: C.paper2, fontFamily: BN, fontSize: 26, color: C.mute }}><MapPin size={28} color={C.moss} /> {s.where}</Rise>}
      </Paper>
    </AbsoluteFill>
  );
};

// two snakes side by side (look-alikes)
const SCompare: React.FC<P> = (p) => {
  const { s, spec } = p; const len = sceneLen(s); const n = s.rows.length;
  const side = (x: any, j: number) => (
    <Rise key={j} d={6 + j * 10} style={{ flex: 1 }}>
      <div style={{ position: "relative", height: 400, borderRadius: 22, overflow: "hidden", border: `5px solid ${C.paper}` }}>
        <KB k={x.photo} len={len} style={{ width: "100%", height: "100%" }} pos={x.pos} />
        <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, padding: "40px 22px 14px", background: "linear-gradient(transparent, rgba(0,0,0,.75))", display: "flex", alignItems: "flex-end", justifyContent: "space-between" }}>
          <div><div style={{ fontFamily: BN, fontSize: 44, fontWeight: 800, color: "#fff" }}>{x.name || spec.credits?.[x.photo]?.bn}</div><Sci t={spec.credits?.[x.photo]?.sci || ""} size={22} color="#E8E8E8" /></div>
          <Badge k={x.status} size={22} />
        </div>
        <CreditLine spec={spec} k={x.photo} style={{ left: 10, top: 10, fontSize: 13 }} />
      </div>
    </Rise>
  );
  return (
    <AbsoluteFill>
      <Head h={s.head} top={120} />
      <div style={{ position: "absolute", left: 110, right: 110, top: 225, display: "flex", gap: 36 }}>{[s.left, s.right].map(side)}</div>
      <div style={{ position: "absolute", left: 110, right: 110, top: 665, display: "grid", gridTemplateColumns: "1fr 1fr", columnGap: 36, rowGap: 10 }}>
        {s.rows.map((r: any, i: number) => [r.l, r.r].map((x: string, j: number) => (
          <Rise key={i + "-" + j} d={v(p, 0.15 + (i / n) * 0.7 + j * 0.05)} y={16}>
            <Paper style={{ padding: "12px 20px", boxShadow: "none", display: "flex", gap: 14, alignItems: "center", minHeight: 62 }}>
              {r.k && <span style={{ fontFamily: BN, fontSize: 22, fontWeight: 700, color: C.moss, background: C.gsoft, padding: "3px 10px", borderRadius: 8, flex: "none" }}>{r.k}</span>}
              <span style={{ fontFamily: BN, fontSize: 27, color: C.ink, fontWeight: 600, lineHeight: 1.3 }}>{x}</span>
            </Paper>
          </Rise>
        )))}
      </div>
    </AbsoluteFill>
  );
};

const SPoints: React.FC<P> = (p) => {
  const { s, spec } = p; const n = s.items.length; const len = sceneLen(s); const ph = s.photo;
  return (
    <AbsoluteFill>
      {ph && <><KB k={ph} len={len} style={{ position: "absolute", inset: 0, opacity: 0.35 }} /><AbsoluteFill style={{ background: `linear-gradient(180deg, ${C.bg}ee, ${C.bg}aa 50%, ${C.bg}ee)` }} /><CreditLine spec={spec} k={ph} style={{ right: 24, bottom: 110 }} /></>}
      <Head h={s.head} />
      <div style={{ position: "absolute", left: 130, right: 130, top: 280, display: "grid", gridTemplateColumns: `repeat(${n > 3 ? 2 : 1}, 1fr)`, gap: 24 }}>
        {s.items.map((it: any, i: number) => {
          const I = ICONS[it.icon] || Lightbulb;
          return (
            <Rise key={i} d={v(p, 0.06 + (i / n) * 0.75)} y={26}>
              <Paper style={{ padding: "26px 30px", display: "flex", gap: 26, alignItems: "center", boxShadow: "none" }}>
                <div style={{ width: 84, height: 84, borderRadius: 22, background: it.bad ? C.red : C.moss, display: "grid", placeItems: "center", flex: "none" }}><I size={44} color="#fff" strokeWidth={1.8} /></div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontFamily: BN, fontSize: 40, fontWeight: 800, color: C.ink, lineHeight: 1.25 }}>{it.t}</div>
                  {it.s && <div style={{ fontFamily: BN, fontSize: 29, color: C.mute, marginTop: 6, lineHeight: 1.4 }}>{it.s}</div>}
                </div>
              </Paper>
            </Rise>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};

// numbered actions on a trail; the active step follows the narration
const SSteps: React.FC<P> = (p) => {
  const { s } = p; const f = useCurrentFrame(); const { fps } = useVideoConfig(); const n = s.steps.length;
  const gap = Math.min(150, 620 / n);
  return (
    <AbsoluteFill>
      <Head h={s.head} />
      <div style={{ position: "absolute", left: 210, top: 300, width: 6, height: gap * (n - 1) + 10, background: `repeating-linear-gradient(${C.leaf} 0 14px, transparent 14px 26px)`, opacity: 0.6 }} />
      {s.steps.map((x: any, i: number) => {
        const d = v(p, 0.05 + (i / n) * 0.82); const k = Math.min(1, pop(f, fps, d)); const on = f >= d;
        const next = i + 1 < n ? v(p, 0.05 + ((i + 1) / n) * 0.82) : 1e9; const cur = on && f < next;
        const I = ICONS[x.icon] || CircleCheck;
        return (
          <div key={i} style={{ position: "absolute", left: 160, right: 130, top: 270 + i * gap, display: "flex", gap: 30, alignItems: "center", opacity: 0.3 + 0.7 * k }}>
            <div style={{ width: 106, height: 106, borderRadius: 53, background: on ? (x.bad ? C.red : C.moss) : C.bg2, border: `4px solid ${cur ? C.leaf : C.paper}`, display: "grid", placeItems: "center", flex: "none", transform: `scale(${0.8 + 0.2 * k})` }}>
              {on ? <I size={50} color="#fff" /> : <span style={{ fontFamily: BN, fontSize: 40, fontWeight: 800, color: C.paper }}>{bn(i + 1)}</span>}
            </div>
            <Paper style={{ flex: 1, padding: "18px 28px", boxShadow: cur ? `0 0 0 4px ${C.leaf}` : "none", transform: `translateX(${(1 - k) * 40}px)` }}>
              <div style={{ fontFamily: BN, fontSize: Math.min(38, gap * 0.3), fontWeight: 800, color: C.ink, lineHeight: 1.25 }}><span style={{ color: C.moss }}>{bn(i + 1)}.</span> {x.t}</div>
              {x.s && gap > 110 && <div style={{ fontFamily: BN, fontSize: 26, color: C.mute, marginTop: 4 }}>{x.s}</div>}
            </Paper>
          </div>
        );
      })}
    </AbsoluteFill>
  );
};

// a full-frame scene image with caption card
const SPhoto: React.FC<P> = (p) => {
  const { s, spec } = p; const len = sceneLen(s);
  return (
    <AbsoluteFill>
      <KB k={s.photo} len={len} style={{ position: "absolute", inset: 0 }} zoom={1.15} pos={s.pos} />
      <AbsoluteFill style={{ background: "linear-gradient(90deg, rgba(8,24,16,.88) 0%, rgba(8,24,16,.55) 45%, transparent 75%)" }} />
      <CreditLine spec={spec} k={s.photo} style={{ right: 24, bottom: 110 }} />
      <div style={{ position: "absolute", left: 130, top: 260, width: 860 }}>
        <H d={6} size={64}>{s.head}</H>
        {(s.lines || []).map((t: string, i: number) => (
          <Rise key={i} d={v(p, 0.15 + i * 0.22)} style={{ marginTop: 22, display: "flex", gap: 16, alignItems: "flex-start" }}>
            <div style={{ width: 14, height: 14, borderRadius: 7, background: C.leaf, marginTop: 18, flex: "none" }} />
            <span style={{ fontFamily: BN, fontSize: 38, color: C.cream, lineHeight: 1.4, fontWeight: 600 }}>{t}</span>
          </Rise>
        ))}
      </div>
    </AbsoluteFill>
  );
};

const SWarn: React.FC<P> = (p) => {
  const { s } = p; const f = useCurrentFrame(); const { fps } = useVideoConfig(); const k = pop(f, fps, 4);
  const red = s.level !== "tip"; const col = red ? C.red : C.amber;
  return (
    <AbsoluteFill style={{ alignItems: "center", justifyContent: "center" }}>
      <Paper style={{ width: 1480, padding: "54px 60px", background: red ? C.rsoft : C.asoft, border: `3px solid ${col}`, display: "flex", gap: 46, alignItems: "center", marginTop: -40 }}>
        <div style={{ width: 160, height: 160, borderRadius: 40, background: col, display: "grid", placeItems: "center", flex: "none", transform: `scale(${k}) rotate(${(1 - k) * -20}deg)` }}>{red ? <Siren size={90} color="#fff" strokeWidth={1.8} /> : <Lightbulb size={90} color="#fff" strokeWidth={1.8} />}</div>
        <div>
          <H d={8} size={54} color={col}>{s.head}</H>
          <Rise d={v(p, 0.1)} style={{ marginTop: 12 }}><div style={{ fontFamily: BN, fontSize: 42, fontWeight: 800, color: C.ink, lineHeight: 1.3 }}>{s.text}</div></Rise>
          {s.sub && <Rise d={v(p, 0.55)} style={{ marginTop: 16 }}><div style={{ fontFamily: BN, fontSize: 31, color: C.mute }}>{s.sub}</div></Rise>}
        </div>
      </Paper>
    </AbsoluteFill>
  );
};

const SMyth: React.FC<P> = (p) => {
  const { s, spec } = p; const f = useCurrentFrame(); const len = sceneLen(s);
  const strike = interpolate(f, [v(p, 0.3), v(p, 0.38)], [0, 1], { ...clamp, easing: ease });
  const w = s.photo ? 1180 : 1660;
  return (
    <AbsoluteFill>
      {s.photo && <Rise d={2} style={{ position: "absolute", right: 110, top: 240, width: 440, height: 600 }}><div style={{ position: "relative", width: "100%", height: "100%", borderRadius: 22, overflow: "hidden", border: `5px solid ${C.paper}` }}><KB k={s.photo} len={len} style={{ width: "100%", height: "100%" }} /><CreditLine spec={spec} k={s.photo} style={{ left: 8, bottom: 8, fontSize: 12 }} /></div></Rise>}
      <div style={{ position: "absolute", left: 130, top: 160 }}><Rise d={4}><span style={{ fontFamily: BN, fontSize: 32, fontWeight: 800, color: C.amber }}>কুসংস্কার বনাম বিজ্ঞান</span></Rise></div>
      <Rise d={v(p, 0.04)} style={{ position: "absolute", left: 130, width: w, top: 240 }}>
        <Paper style={{ padding: "32px 40px", background: C.rsoft, boxShadow: "none" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}><div style={{ width: 52, height: 52, borderRadius: 26, background: C.red, display: "grid", placeItems: "center" }}><X size={32} color="#fff" strokeWidth={3} /></div><span style={{ fontFamily: BN, fontSize: 30, color: C.red, fontWeight: 700 }}>ভুল ধারণা</span></div>
          <div style={{ position: "relative", display: "inline-block", marginTop: 16 }}><span style={{ fontFamily: BN, fontSize: 48, fontWeight: 800, color: C.ink, lineHeight: 1.3 }}>{s.wrong}</span><div style={{ position: "absolute", left: 0, top: "52%", height: 6, borderRadius: 3, width: `${strike * 100}%`, background: C.red }} /></div>
        </Paper>
      </Rise>
      <Rise d={v(p, 0.42)} style={{ position: "absolute", left: 130, width: w, top: 540 }}>
        <Paper style={{ padding: "32px 40px", background: C.gsoft, boxShadow: "none" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}><div style={{ width: 52, height: 52, borderRadius: 26, background: C.green, display: "grid", placeItems: "center" }}><Check size={32} color="#fff" strokeWidth={3} /></div><span style={{ fontFamily: BN, fontSize: 30, color: C.green, fontWeight: 700 }}>সত্য</span></div>
          <div style={{ fontFamily: BN, fontSize: 44, fontWeight: 800, color: C.ink, marginTop: 12, lineHeight: 1.3 }}>{s.right}</div>
          {s.sub && <div style={{ fontFamily: BN, fontSize: 29, color: C.mute, marginTop: 8 }}>{s.sub}</div>}
        </Paper>
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
          <Paper style={{ padding: "26px 28px", display: "flex", gap: 18, alignItems: "center", boxShadow: "none" }}>
            <CircleCheck size={44} color={C.green} strokeWidth={2} style={{ flex: "none" }} />
            <span style={{ fontFamily: BN, fontSize: 33, fontWeight: 700, color: C.ink, lineHeight: 1.3 }}>{t}</span>
          </Paper>
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
      <div style={{ position: "absolute", left: 130, top: 140 }}><Rise d={2}><span style={{ fontFamily: BN, fontSize: 32, fontWeight: 800, color: C.leaf }}>নিজেকে যাচাই করুন</span></Rise></div>
      <Paper style={{ position: "absolute", left: 130, right: 130, top: 205, padding: "38px 46px" }}>
        <div style={{ fontFamily: BN, fontSize: 44, fontWeight: 800, color: C.ink, lineHeight: 1.3 }}>{s.q}</div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 18, marginTop: 28 }}>
          {s.o.map((o: string, i: number) => {
            const right = p.answer && i === s.a;
            return (
              <Rise key={i} d={p.answer ? 0 : v(p, 0.2 + i * 0.1)} y={18} style={{ display: "flex", alignItems: "center", gap: 18, padding: "20px 24px", borderRadius: 18, border: `3px solid ${right ? C.green : C.line}`, background: right ? C.gsoft : C.cream, opacity: p.answer && !right ? 0.5 : 1 }}>
                <div style={{ width: 50, height: 50, borderRadius: 25, background: right ? C.green : C.paper2, color: right ? "#fff" : C.moss, display: "grid", placeItems: "center", fontFamily: BN, fontWeight: 800, fontSize: 26, flex: "none" }}>{right ? <Check size={30} strokeWidth={3.5} /> : "কখগঘ"[i]}</div>
                <span style={{ fontFamily: BN, fontSize: 34, fontWeight: 700, color: C.ink, lineHeight: 1.3 }}>{o}</span>
              </Rise>
            );
          })}
        </div>
        {p.answer && <Rise d={v(p, 0.25)} style={{ marginTop: 24, padding: "16px 22px", borderRadius: 14, background: C.gsoft, fontFamily: BN, fontSize: 30, color: C.green, fontWeight: 600, lineHeight: 1.4 }}>✔ {s.ex}</Rise>}
      </Paper>
      {!p.answer && hold > 0 && f >= holdStart && (
        <div style={{ position: "absolute", left: "50%", top: 850, transform: "translateX(-50%)", display: "flex", alignItems: "center", gap: 18 }}>
          <svg width={92} height={92} style={{ transform: "rotate(-90deg)" }}><circle cx={46} cy={46} r={40} stroke={C.bg2} strokeWidth={8} fill="none" /><circle cx={46} cy={46} r={40} stroke={C.leaf} strokeWidth={8} fill="none" strokeDasharray={251} strokeDashoffset={251 * (1 - ring)} strokeLinecap="round" /></svg>
          <span style={{ fontFamily: BN, fontSize: 40, fontWeight: 800, color: C.cream }}><Timer size={34} style={{ verticalAlign: -4 }} /> ভাবুন… {bn(left)}</span>
        </div>
      )}
    </AbsoluteFill>
  );
};

const SOutro: React.FC<P> = (p) => {
  const { spec, s } = p; const f = useCurrentFrame(); const { fps } = useVideoConfig(); const k = pop(f, fps, 4);
  return (
    <AbsoluteFill style={{ alignItems: "center" }}>
      <div style={{ position: "absolute", top: 160, width: 150, height: 150, borderRadius: 75, background: C.moss, display: "grid", placeItems: "center", transform: `scale(${k})`, boxShadow: `0 0 0 10px ${C.leaf}44` }}><Leaf size={84} color="#fff" strokeWidth={2} /></div>
      <div style={{ position: "absolute", top: 360, textAlign: "center", width: 1600 }}><H d={10} size={68}>{s.head || "দূরে থাকুন, নিরাপদ থাকুন"}</H></div>
      {s.cta && <Rise d={v(p, 0.15)} style={{ position: "absolute", top: 500 }}><div style={{ display: "flex", alignItems: "center", gap: 16, padding: "18px 32px", borderRadius: 18, background: "rgba(125,190,106,.16)", fontFamily: BN, fontSize: 32, fontWeight: 700, color: C.leaf }}><Hospital size={34} /> {s.cta}</div></Rise>}
      <Rise d={v(p, 0.35)} style={{ position: "absolute", top: 640 }}>
        <Paper style={{ display: "flex", alignItems: "center", gap: 24, padding: "24px 38px" }}>
          <span style={{ fontFamily: BN, fontSize: 30, color: C.mute }}>পরের পাঠ</span><ArrowRight size={34} color={C.moss} />
          <span style={{ fontFamily: BN, fontSize: 38, fontWeight: 800, color: C.ink }}>{spec.next}</span>
        </Paper>
      </Rise>
      <Rise d={v(p, 0.55)} style={{ position: "absolute", top: 820 }}><Img src={staticFile("brand/logo-dark.png")} style={{ height: 72 }} /></Rise>
    </AbsoluteFill>
  );
};

const MAP: Record<string, React.FC<any>> = { title: STitle, species: SSpecies, compare: SCompare, points: SPoints, steps: SSteps, photo: SPhoto, warn: SWarn, myth: SMyth, recap: SRecap, quizQ: SQuiz, quizA: (p: P) => <SQuiz {...p} answer />, outro: SOutro };
export const SCENE_TYPES = Object.keys(MAP);

/* ---------- frame chrome ---------- */
const Header: React.FC<{ spec: Spec; starts: number[] }> = ({ spec, starts }) => {
  const f = useCurrentFrame(); const k = starts.filter((s) => f >= s).length;
  return (
    <div style={{ position: "absolute", left: 0, right: 0, top: 0, height: 92, display: "flex", alignItems: "center", gap: 22, padding: "0 56px", background: "rgba(10,32,22,.92)", borderBottom: `1px solid ${C.leaf}33` }}>
      <Img src={staticFile("brand/logo-dark.png")} style={{ height: 48 }} />
      <div style={{ width: 1, height: 34, background: `${C.leaf}55` }} />
      <Leaf size={26} color={C.leaf} />
      <div style={{ fontFamily: BN, fontSize: 25, fontWeight: 700, color: C.cream }}>{spec.course}</div>
      <div style={{ fontFamily: BN, fontSize: 23, color: "#A9BFA9" }}>· {spec.lessonNo}</div>
      <div style={{ marginLeft: "auto", display: "flex", gap: 6, width: 360 }}>
        {starts.map((_, i) => <div key={i} style={{ flex: 1, height: 8, borderRadius: 4, background: i < k - 1 ? `${C.leaf}88` : i === k - 1 ? C.leaf : "rgba(255,255,255,.14)" }} />)}
      </div>
    </div>
  );
};
const AiTag: React.FC = () => (
  <div style={{ position: "absolute", right: 40, bottom: 128, display: "flex", alignItems: "center", gap: 8, padding: "7px 15px", borderRadius: 30, background: "rgba(10,32,22,.8)", border: `1px solid ${C.leaf}44`, fontFamily: BN, fontSize: 19, color: "#CFE3CF" }}><Bot size={19} color={C.leaf} /> এআই প্রশিক্ষক · এআই কণ্ঠ</div>
);
const subChunks = (spec: Spec, starts: number[]) => spec.scenes.flatMap((s, i) => {
  const parts = s.vo.split(/(?<=[।?!,—])\s+/).reduce<string[]>((a, x) => { if (a.length && (a[a.length - 1].length < 24 || x.length < 10)) a[a.length - 1] += " " + x; else a.push(x); return a; }, []);
  const total = parts.reduce((n, x) => n + x.length, 0); let acc = 0; const b = starts[i] + LEAD;
  return parts.map((x) => { const from = b + (s.frames * acc) / total; acc += x.length; return { s: x, from, to: b + (s.frames * acc) / total }; });
});

export const SnakeVideo: React.FC<{ spec: Spec }> = ({ spec }) => {
  const f = useCurrentFrame();
  POS = Object.fromEntries(Object.entries(spec.credits || {}).filter(([, c]) => c.pos).map(([k, c]) => [k, c.pos as string]));
  const lens = spec.scenes.map(sceneLen);
  const starts = lens.reduce<number[]>((a, _, i) => [...a, i ? a[i - 1] + lens[i - 1] : 15], []);
  const chunks = subChunks(spec, starts);
  const cur = chunks.find((x) => f >= x.from && f < x.to + 4);
  const total = snakeLen(spec);
  const busy = (fr: number) => spec.scenes.some((s, i) => fr >= starts[i] + LEAD - 6 && fr <= starts[i] + LEAD + s.frames + 4);
  return (
    <AbsoluteFill style={{ background: C.bg }}>
      <AbsoluteFill style={{ background: `radial-gradient(1100px 700px at 85% 10%, ${C.moss}55, transparent 70%), radial-gradient(900px 600px at 0% 100%, #0A1F15, transparent 70%)` }} />
      <AbsoluteFill style={{ opacity: 0.06, backgroundImage: "radial-gradient(#fff 1px, transparent 1px)", backgroundSize: "28px 28px" }} />
      {spec.scenes.map((s, i) => {
        const S = MAP[s.type]; const len = lens[i];
        return (
          <Sequence key={i} from={starts[i]} durationInFrames={len}>
            <Fade len={len}><S s={s} spec={spec} vo={s.frames} /></Fade>
            <Sequence from={LEAD}><Audio src={staticFile(`snake/${spec.id}/vo/${String(i + 1).padStart(2, "0")}.mp3`)} /></Sequence>
            <Sequence from={0}><Audio src={staticFile(`aiu2/${i === 0 ? "swell" : s.type === "quizA" || s.type === "outro" ? "chime" : "whoosh"}.mp3`)} volume={0.28} /></Sequence>
          </Sequence>
        );
      })}
      <Header spec={spec} starts={starts} />
      <AiTag />
      {cur && <div style={{ position: "absolute", left: 0, right: 0, bottom: 32, display: "flex", justifyContent: "center", opacity: interpolate(f, [cur.from, cur.from + 5, cur.to, cur.to + 4], [0, 1, 1, 0], clamp) }}><div style={{ maxWidth: 1500, padding: "10px 28px 14px", borderRadius: 14, background: "rgba(6,20,13,.9)", fontFamily: BN, fontSize: 36, fontWeight: 500, color: "#fff", textAlign: "center", lineHeight: 1.35 }}>{cur.s.replace(/[।,]$/, "")}</div></div>}
      <Audio src={staticFile("aiu2/music.mp3")} volume={(fr) => (busy(fr) ? 0.05 : 0.14) * interpolate(fr, [0, 30, total - 60, total], [0, 1, 1, 0], clamp)} />
    </AbsoluteFill>
  );
};
const Fade: React.FC<{ len: number; children: React.ReactNode }> = ({ len, children }) => {
  const f = useCurrentFrame();
  const o = Math.min(interpolate(f, [0, 12], [0, 1], { ...clamp, easing: ease }), interpolate(f, [len - 10, len], [1, 0], clamp));
  return <AbsoluteFill style={{ opacity: o, transform: `translateY(${(1 - o) * 14}px)` }}>{children}</AbsoluteFill>;
};
