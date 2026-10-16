// AI University — English Master Course lesson video engine ("ইংলিশ মাস্টার কোর্স", ai-university `spoken-english`).
// Dark, colourful "studio class": an animated স্যার (এআই প্রশিক্ষক) whose mouth follows his voice, two cartoon characters who act out
// dialogues with karaoke bubbles, sticker chunks, a slot-machine sentence pattern, "Repeat after me" pauses, mistake stamps, a game-show
// quiz and a mission card. One spec per lesson: src/english/specs/<id>.json, timed by scripts/english_make.py.
// Scene timeline: LEAD → vo (teacher) → English lines (each + optional learner gap) → hold → vo2 (teacher) → TAIL.
// Scene types: hook · title · dialogue · chunks · pattern · repeat · fix · sound · quiz · mission · recap · outro
import React from "react";
import { AbsoluteFill, Audio, Img, Sequence, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig, Easing, delayRender, continueRender, random } from "remotion";
import {
  Check, X, ArrowRight, Mic, Headphones, Sparkles, Target, Bot, Zap, MapPin, Users, Briefcase, Coffee, Plane, Phone, ShoppingBag, MessageCircle,
  Lightbulb, Star, Trophy, Volume2, Repeat, BookOpen, Heart, Smile, Building2, GraduationCap, Stethoscope, Clock, Globe, Pin,
} from "lucide-react";

/* ---------- design tokens ---------- */
const C = {
  bg0: "#070B26", bg1: "#121A4A", ink: "#0B1033", white: "#FFFFFF", mute: "#A9B1E0", line: "rgba(255,255,255,.12)",
  coral: "#FF5E5B", sun: "#FFC845", mint: "#3DDC97", sky: "#4CC9F0", violet: "#8B5CF6", pink: "#FF7AC6", cream: "#FFF6E0", skin: "#C68A63",
};
const STICKY = ["#FFF1B8", "#C9F7E1", "#D6ECFF", "#FFD9EC", "#E8DEFF", "#FFE2C7"];
const ACC = [C.sun, C.mint, C.sky, C.pink, C.violet, C.coral];
const BN = "Anek", EN = "Montserrat";
if (typeof document !== "undefined") {
  for (const [n, u] of [["Anek", "fonts/AnekBangla.ttf"], ["Montserrat", "fonts/Montserrat.ttf"]]) {
    const h = delayRender(`font ${n}`);
    const f = new FontFace(n, `url(${staticFile(u)})`, { weight: "100 900" });
    f.load().then(() => { document.fonts.add(f); continueRender(h); }).catch(() => continueRender(h));
  }
}
const ICONS: Record<string, React.FC<any>> = { users: Users, briefcase: Briefcase, coffee: Coffee, plane: Plane, phone: Phone, shop: ShoppingBag, chat: MessageCircle, idea: Lightbulb, star: Star, heart: Heart, smile: Smile, office: Building2, school: GraduationCap, doctor: Stethoscope, clock: Clock, globe: Globe, book: BookOpen, mic: Mic, pin: MapPin };
const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const ease = Easing.bezier(0.16, 1, 0.3, 1);
const bn = (n: number | string) => String(n).replace(/\d/g, (d) => "০১২৩৪৫৬৭৮৯"[+d]);
const ent = (f: number, fps: number, d: number, dur = 22) => spring({ frame: f - d, fps, config: { damping: 200 }, durationInFrames: dur });
const pop = (f: number, fps: number, d: number) => spring({ frame: f - d, fps, config: { damping: 11, mass: 0.6 } });

/* ---------- spec + timing (keep in sync with english_make.py: total()) ---------- */
export type Line = { who: string; text: string; bn?: string; file?: string; frames?: number; gap?: number; amp?: string };
export type Scene = { type: string; vo: string; frames: number; vo2?: string; frames2?: number; hold?: number; lines?: Line[]; voAmp?: string; vo2Amp?: string; [k: string]: any };
export type Cast = Record<string, { name: string; look: "f" | "m"; color?: string }>;
export type Spec = { id: string; course: string; level: string; lessonNo: string; title: string; next: string; cast?: Cast; scenes: Scene[] };
const LEAD = 10, TAIL = 14, LGAP = 8, PRE = 8, POST = 6;
type T = { voA: number; voB: number; lines: { a: number; b: number; g: number }[]; linesB: number; holdA: number; holdB: number; vo2A: number; vo2B: number; len: number };
export const timing = (s: Scene): T => {
  const voA = LEAD, voB = LEAD + s.frames;
  let t = voB + (s.lines?.length ? PRE : 0);
  const lines = (s.lines || []).map((l) => { const a = t, b = a + (l.frames || 60), g = b + (l.gap || 0); t = g + LGAP; return { a, b, g }; });
  const linesB = lines.length ? t - LGAP : voB;
  const holdA = linesB, holdB = holdA + (s.hold || 0);
  const vo2A = holdB + (s.frames2 ? POST : 0), vo2B = vo2A + (s.frames2 || 0);
  return { voA, voB, lines, linesB, holdA, holdB, vo2A, vo2B, len: vo2B + TAIL };
};
export const engLen = (spec: Spec) => spec.scenes.reduce((n, s) => n + timing(s).len, 0) + 30;
type P = { s: Scene; spec: Spec; t: T };
const v = (p: P, x: number) => p.t.voA + (p.t.voB - p.t.voA) * x;
const v2 = (p: P, x: number) => p.t.vo2A + (p.t.vo2B - p.t.vo2A) * x;
const amp = (env: string | undefined, i: number) => (env && i >= 0 && i < env.length ? (env.charCodeAt(i) - 48) / 9 : 0);

/* ---------- primitives ---------- */
const Rise: React.FC<{ d: number; children: React.ReactNode; style?: React.CSSProperties; y?: number }> = ({ d, children, style, y = 40 }) => {
  const f = useCurrentFrame(); const { fps } = useVideoConfig(); const s = ent(f, fps, d);
  return <div style={{ opacity: s, transform: `translateY(${(1 - s) * y}px)`, ...style }}>{children}</div>;
};
const Pop: React.FC<{ d: number; children: React.ReactNode; style?: React.CSSProperties; rot?: number }> = ({ d, children, style, rot = 0 }) => {
  const f = useCurrentFrame(); const { fps } = useVideoConfig(); const k = pop(f, fps, d);
  return <div style={{ opacity: Math.min(1, k * 1.5), transform: `scale(${0.4 + 0.6 * k}) rotate(${rot * k + (1 - k) * -14}deg)`, ...style }}>{children}</div>;
};
const Kicker: React.FC<{ text: string; color?: string; icon?: React.FC<any>; d?: number }> = ({ text, color = C.sun, icon: I = Sparkles, d = 2 }) => (
  <div style={{ position: "absolute", left: 120, top: 128 }}>
    <Pop d={d}><span style={{ display: "inline-flex", alignItems: "center", gap: 12, padding: "10px 24px 12px", borderRadius: 40, background: color, color: C.ink, fontFamily: BN, fontSize: 30, fontWeight: 800, boxShadow: `0 10px 30px ${color}55` }}><I size={30} strokeWidth={2.6} /> {text}</span></Pop>
  </div>
);
const SFX: React.FC<{ at: number; name: string; vol?: number }> = ({ at, name, vol = 0.32 }) => (at >= 0 ? <Sequence from={Math.round(at)} durationInFrames={45}><Audio src={staticFile(`aiu2/${name}.mp3`)} volume={vol} /></Sequence> : null);

// karaoke: words light up in step with the English audio (character-proportional timing)
const Karaoke: React.FC<{ text: string; a: number; b: number; size: number; color?: string; hi?: string; base?: string; hl?: string[]; hlAt?: number; weight?: number }> = ({ text, a, b, size, color = C.ink, hi = C.coral, base = "rgba(11,16,51,.42)", hl = [], hlAt = 1e9, weight = 700 }) => {
  const f = useCurrentFrame();
  const words = text.split(" "); const tot = text.length;
  const p = interpolate(f, [a, b], [0, 1], clamp); let acc = 0;
  const hlSet = hl.flatMap((x) => x.toLowerCase().split(" "));
  return <span style={{ fontFamily: EN, fontSize: size, fontWeight: weight, lineHeight: 1.3 }}>{words.map((w, i) => {
    const st = acc / tot; acc += w.length + 1; const en = acc / tot;
    const said = f >= b || p >= st; const now = f < b && p >= st && p < en;
    const mark = f >= hlAt && hlSet.includes(w.toLowerCase().replace(/[^a-z']/g, "")) && hlSet.length > 0;
    return <span key={i} style={{ color: said ? color : base, display: "inline-block", marginRight: size * 0.26, transform: now ? "translateY(-4px) scale(1.06)" : "none", background: mark ? `linear-gradient(transparent 58%, ${C.sun} 58%)` : now ? `linear-gradient(transparent 80%, ${hi} 80%)` : "none" }}>{w}</span>;
  })}</span>;
};

/* ---------- characters ---------- */
// স্যার — friendly Bangladeshi teacher (glasses, neat beard); mouth opens with his own voice level
export const Teacher: React.FC<{ size: number; a: number; wave?: boolean }> = ({ size, a, wave }) => {
  const f = useCurrentFrame();
  const blink = f % 97 < 4 ? 0.12 : 1; const nod = Math.sin(f / 9) * a * 3; const m = Math.min(1, a * 1.25);
  const arm = wave ? Math.sin(f / 4) * 14 : 0;
  return (
    <svg width={size} height={size} viewBox="0 0 200 200" style={{ display: "block" }}>
      <defs><linearGradient id="tbg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor={C.sun} /><stop offset="1" stopColor={C.coral} /></linearGradient><clipPath id="tclip"><circle cx="100" cy="100" r="96" /></clipPath></defs>
      <circle cx="100" cy="100" r="96" fill="url(#tbg)" />
      <g clipPath="url(#tclip)">
        {wave && <g transform={`rotate(${-20 + arm} 150 168)`}><rect x="146" y="92" width="22" height="80" rx="11" fill="#2F6FED" /><circle cx="157" cy="88" r="13" fill={C.skin} /></g>}
        <path d="M30 200 C34 160 62 146 100 146 C138 146 166 160 170 200 Z" fill="#2F6FED" />
        <path d="M84 146 L100 172 L116 146 Z" fill="#fff" /><path d="M96 158 L100 196 L104 158 Z" fill={C.coral} />
        <rect x="88" y="128" width="24" height="22" rx="8" fill={C.skin} />
        <g transform={`rotate(${nod} 100 100)`}>
          <ellipse cx="57" cy="96" rx="8" ry="12" fill={C.skin} /><ellipse cx="143" cy="96" rx="8" ry="12" fill={C.skin} />
          <ellipse cx="100" cy="92" rx="42" ry="50" fill={C.skin} />
          <path d="M58 86 C56 46 80 34 102 36 C126 36 146 50 142 86 C138 66 124 58 102 60 C82 60 66 66 58 86 Z" fill="#1B1726" />
          <path d="M64 108 C66 140 84 144 100 144 C116 144 134 140 136 108 C130 126 118 132 100 132 C82 132 70 126 64 108 Z" fill="#2A2233" opacity=".85" />
          <path d="M80 72 Q88 68 95 72" stroke="#1B1726" strokeWidth="4" fill="none" strokeLinecap="round" /><path d="M105 72 Q112 68 120 72" stroke="#1B1726" strokeWidth="4" fill="none" strokeLinecap="round" />
          <g transform={`translate(0 ${84 * (1 - blink)}) scale(1 ${blink})`}><circle cx="88" cy="84" r="4.5" fill="#1B1726" /><circle cx="112" cy="84" r="4.5" fill="#1B1726" /></g>
          <rect x="74" y="74" width="24" height="20" rx="7" fill="rgba(255,255,255,.18)" stroke="#111" strokeWidth="3" /><rect x="102" y="74" width="24" height="20" rx="7" fill="rgba(255,255,255,.18)" stroke="#111" strokeWidth="3" /><path d="M98 82 L102 82" stroke="#111" strokeWidth="3" />
          <path d="M96 96 Q100 104 104 96" stroke="#9A5C3C" strokeWidth="3" fill="none" strokeLinecap="round" />
          <path d="M86 110 Q100 116 114 110" stroke="#2A2233" strokeWidth="5" fill="none" strokeLinecap="round" />
          {m > 0.06 ? <ellipse cx="100" cy={117 + m * 2} rx={9 + m * 3} ry={2 + m * 8} fill="#5B1D22" /> : <path d="M90 117 Q100 124 110 117" stroke="#5B1D22" strokeWidth="3.5" fill="none" strokeLinecap="round" />}
        </g>
      </g>
      <circle cx="100" cy="100" r="96" fill="none" stroke="#fff" strokeOpacity=".9" strokeWidth="5" />
    </svg>
  );
};
// dialogue characters: "f" (long hair) / "m" (short hair)
const Kid: React.FC<{ look: "f" | "m"; color: string; size: number; a: number }> = ({ look, color, size, a }) => {
  const f = useCurrentFrame(); const blink = (f + (look === "f" ? 40 : 0)) % 113 < 4 ? 0.12 : 1; const m = Math.min(1, a * 1.3);
  const skin = look === "f" ? "#D69A73" : "#B97A55";
  return (
    <svg width={size} height={size} viewBox="0 0 200 200">
      <circle cx="100" cy="100" r="96" fill={color} />
      <clipPath id={`k${look}`}><circle cx="100" cy="100" r="96" /></clipPath>
      <g clipPath={`url(#k${look})`}>
        {look === "f" && <path d="M48 96 C40 40 160 40 152 96 L160 170 L40 170 Z" fill="#1E1626" />}
        <path d="M34 200 C38 162 64 150 100 150 C136 150 162 162 166 200 Z" fill={look === "f" ? "#FFFFFF" : "#22305E"} />
        <rect x="89" y="132" width="22" height="22" rx="8" fill={skin} />
        <ellipse cx="100" cy="94" rx="40" ry="46" fill={skin} />
        {look === "f" ? <path d="M60 92 C58 50 142 50 140 92 C130 66 112 62 100 62 C86 62 70 66 60 92 Z" fill="#1E1626" /> : <path d="M60 86 C58 46 84 38 104 40 C128 40 144 54 140 86 C134 64 120 60 102 60 C84 60 68 64 60 86 Z" fill="#1E1626" />}
        <g transform={`translate(0 ${88 * (1 - blink)}) scale(1 ${blink})`}><circle cx="86" cy="88" r="5" fill="#1E1626" /><circle cx="114" cy="88" r="5" fill="#1E1626" /></g>
        <circle cx="76" cy="104" r="7" fill="#FF8FA3" opacity=".45" /><circle cx="124" cy="104" r="7" fill="#FF8FA3" opacity=".45" />
        {m > 0.06 ? <ellipse cx="100" cy={114 + m * 2} rx={8 + m * 3} ry={2 + m * 8} fill="#6B2230" /> : <path d="M90 113 Q100 121 110 113" stroke="#6B2230" strokeWidth="3.5" fill="none" strokeLinecap="round" />}
      </g>
      <circle cx="100" cy="100" r="96" fill="none" stroke="#fff" strokeWidth="5" />
    </svg>
  );
};

/* ---------- scenes ---------- */
const SHook: React.FC<P> = (p) => {
  const { s } = p; const f = useCurrentFrame(); const I = ICONS[s.icon] || Users;
  const words = (s.text as string).split(" ");
  return (
    <AbsoluteFill>
      <div style={{ position: "absolute", left: 130, top: 230 }}>
        <Pop d={4}><div style={{ filter: "drop-shadow(0 30px 60px rgba(0,0,0,.45))" }}><Teacher size={470} a={amp(s.voAmp, Math.round(f - p.t.voA))} /></div></Pop>
        <Rise d={14} style={{ marginTop: -26, display: "flex", justifyContent: "center" }}><span style={{ padding: "10px 26px", borderRadius: 30, background: C.white, fontFamily: BN, fontSize: 30, fontWeight: 800, color: C.ink }}>স্যার · <span style={{ color: C.coral }}>এআই প্রশিক্ষক</span></span></Rise>
      </div>
      <div style={{ position: "absolute", left: 720, right: 120, top: 240 }}>
        <Pop d={8}><span style={{ display: "inline-flex", alignItems: "center", gap: 12, padding: "10px 24px", borderRadius: 40, background: C.coral, fontFamily: BN, fontSize: 30, fontWeight: 800, color: C.white }}><I size={30} /> {s.kicker || "একটা ছোট গল্প"}</span></Pop>
        <div style={{ marginTop: 36, fontFamily: BN, fontSize: 64, fontWeight: 800, color: C.white, lineHeight: 1.32 }}>
          {words.map((w, i) => { const d = v(p, 0.04 + (0.72 * i) / words.length); const k = interpolate(f, [d, d + 8], [0, 1], clamp); const q = /[“"]/.test(w) || /[A-Za-z]/.test(w);
            return <span key={i} style={{ opacity: 0.15 + 0.85 * k, color: q ? C.sun : C.white, display: "inline-block", marginRight: 16, transform: `translateY(${(1 - k) * 18}px)` }}>{w}</span>; })}
        </div>
      </div>
    </AbsoluteFill>
  );
};

const STitle: React.FC<P> = (p) => {
  const { s, spec } = p; const f = useCurrentFrame();
  const draw = interpolate(f, [16, 40], [0, 1], { ...clamp, easing: ease });
  return (
    <AbsoluteFill>
      <div style={{ position: "absolute", left: 130, top: 210, width: 900 }}>
        <Rise d={2}><span style={{ fontFamily: BN, fontSize: 32, fontWeight: 700, color: C.sky }}>{spec.level} · {spec.lessonNo}</span></Rise>
        <Rise d={6} style={{ marginTop: 18 }}><div style={{ fontFamily: BN, fontSize: 96, fontWeight: 800, color: C.white, lineHeight: 1.18 }}>{spec.title}</div></Rise>
        <svg width={620} height={34} style={{ marginTop: 6 }}><path d="M6 22 C150 4 300 30 610 12" stroke={C.sun} strokeWidth={12} fill="none" strokeLinecap="round" pathLength={1} strokeDasharray={1} strokeDashoffset={1 - draw} /></svg>
        <Rise d={20} style={{ marginTop: 18 }}><span style={{ fontFamily: BN, fontSize: 34, color: C.mute }}>{spec.course}</span></Rise>
      </div>
      <div style={{ position: "absolute", left: 1080, right: 110, top: 190, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 26 }}>
        {(s.goals as string[]).map((g, i) => (
          <Pop key={i} d={v(p, 0.2 + i * 0.16)} rot={i % 2 ? 3 : -3}>
            <div style={{ background: STICKY[i % STICKY.length], borderRadius: 10, padding: "40px 26px 30px", minHeight: 230, boxShadow: "0 22px 40px rgba(0,0,0,.35)", position: "relative" }}>
              <div style={{ position: "absolute", top: -14, left: "50%", marginLeft: -50, width: 100, height: 28, background: "rgba(255,255,255,.55)", transform: "rotate(-4deg)" }} />
              <div style={{ width: 52, height: 52, borderRadius: 26, background: C.ink, display: "grid", placeItems: "center" }}><Check size={30} color={C.mint} strokeWidth={3.5} /></div>
              <div style={{ fontFamily: BN, fontSize: 34, fontWeight: 700, color: C.ink, marginTop: 16, lineHeight: 1.3 }}>{g}</div>
            </div>
          </Pop>
        ))}
      </div>
    </AbsoluteFill>
  );
};

const SDialogue: React.FC<P> = (p) => {
  const { s, spec, t } = p; const f = useCurrentFrame(); const { fps } = useVideoConfig();
  const cast = spec.cast || { A: { name: "Mina", look: "f" }, B: { name: "Rafi", look: "m" } };
  const lines = s.lines || [];
  const shown = t.lines.filter((x) => f >= x.a - 6).length;
  const speaking = t.lines.findIndex((x) => f >= x.a && f < x.b);
  const bubbleH = 158; const maxVis = 4;
  const scroll = interpolate(f, t.lines.map((x) => x.a - 6), t.lines.map((_, i) => Math.max(0, i - maxVis + 1) * bubbleH), clamp);
  const who = (k: string) => cast[k] || { name: k, look: "m" as const };
  const col = (k: string) => (k === "A" ? C.pink : C.sky);
  const side = (k: string) => (k === "A" ? "left" : "right");
  return (
    <AbsoluteFill>
      <Kicker text={s.place ? `ডায়ালগ · ${s.place}` : "ডায়ালগ"} color={C.sky} icon={MessageCircle} />
      {["A", "B"].map((k) => {
        const i = speaking >= 0 && lines[speaking].who === k ? speaking : -1;
        const a = i >= 0 ? amp(lines[i].amp, Math.round(f - t.lines[i].a)) : 0;
        const k2 = ent(f, fps, k === "A" ? 4 : 8);
        return (
          <div key={k} style={{ position: "absolute", top: 300, [side(k)]: 90, width: 270, textAlign: "center", opacity: k2, transform: `translateY(${(1 - k2) * 60}px) scale(${i >= 0 ? 1.06 : 1})` } as any}>
            <div style={{ display: "inline-block", borderRadius: "50%", boxShadow: i >= 0 ? `0 0 0 10px ${col(k)}55, 0 0 60px ${col(k)}` : "0 20px 50px rgba(0,0,0,.4)" }}><Kid look={who(k).look} color={col(k)} size={240} a={a} /></div>
            <div style={{ marginTop: 14, fontFamily: EN, fontSize: 34, fontWeight: 800, color: C.white }}>{who(k).name}</div>
          </div>
        );
      })}
      <div style={{ position: "absolute", left: 400, right: 400, top: 214, height: maxVis * bubbleH + 10, overflow: "hidden" }}>
        <div style={{ transform: `translateY(${-scroll}px)` }}>
          {lines.map((l, i) => {
            if (i >= shown) return null; const x = t.lines[i]; const k = pop(f, fps, x.a - 6); const L = side(l.who) === "left";
            return (
              <div key={i} style={{ height: bubbleH, paddingTop: 12, boxSizing: "border-box", display: "flex", flexDirection: "column", alignItems: L ? "flex-start" : "flex-end", justifyContent: "flex-start" }}>
                <div style={{ maxWidth: 1000, padding: "18px 30px 20px", borderRadius: 30, borderBottomLeftRadius: L ? 6 : 30, borderBottomRightRadius: L ? 30 : 6, background: L ? C.white : C.cream, boxShadow: `0 14px 34px rgba(0,0,0,.35)`, borderTop: `6px solid ${col(l.who)}`, transform: `scale(${0.6 + 0.4 * k})`, transformOrigin: L ? "left bottom" : "right bottom", opacity: Math.min(1, k * 1.5) }}>
                  <Karaoke text={l.text} a={x.a} b={x.b} size={38} hl={s.hl} hlAt={t.vo2A} />
                </div>
                {l.bn && <div style={{ marginTop: 6, padding: "0 12px", fontFamily: BN, fontSize: 25, color: C.mint, opacity: interpolate(f, [x.b, x.b + 10], [0, 1], clamp) }}>{l.bn}</div>}
              </div>
            );
          })}
        </div>
      </div>
      {t.lines.map((x, i) => <SFX key={i} at={x.a - 6} name="pop" vol={0.18} />)}
    </AbsoluteFill>
  );
};

const SChunks: React.FC<P> = (p) => {
  const { s, t } = p; const f = useCurrentFrame(); const items = s.items as { en: string; ex?: string; bn: string }[];
  const n = items.length; const cols = n > 4 ? 3 : 2;
  const at = (i: number) => (t.lines[i] ? t.lines[i].a - 4 : v(p, 0.12 + (0.8 * i) / n));
  return (
    <AbsoluteFill>
      <Kicker text={s.head || "আজকের জাদুর টুকরো (chunk)"} color={C.mint} icon={Sparkles} />
      <div style={{ position: "absolute", left: 120, right: 120, top: 240, display: "grid", gridTemplateColumns: `repeat(${cols}, 1fr)`, gap: 30 }}>
        {items.map((it, i) => {
          const x = t.lines[i]; const live = x && f >= x.a && f < x.b;
          return (
            <Pop key={i} d={at(i)} rot={[-2.5, 2, -1.5, 2.5, -2, 1.5][i % 6]}>
              <div style={{ background: C.white, borderRadius: 24, overflow: "hidden", boxShadow: live ? `0 0 0 8px ${ACC[i % 6]}, 0 26px 50px rgba(0,0,0,.45)` : "0 22px 44px rgba(0,0,0,.4)", transform: live ? "scale(1.05)" : "none" }}>
                <div style={{ height: 16, background: ACC[i % 6] }} />
                <div style={{ padding: "22px 28px 26px" }}>
                  <div style={{ fontFamily: EN, fontSize: 44, fontWeight: 800, color: C.ink, lineHeight: 1.15 }}>{it.en}</div>
                  <div style={{ fontFamily: BN, fontSize: 30, fontWeight: 600, color: "#4A5280", marginTop: 8 }}>{it.bn}</div>
                  {it.ex && <div style={{ marginTop: 12, display: "flex", alignItems: "center", gap: 10 }}><Volume2 size={26} color={live ? C.coral : "#9AA2C8"} />{x ? <Karaoke text={it.ex} a={x.a} b={x.b} size={28} weight={600} /> : <span style={{ fontFamily: EN, fontSize: 28, color: "#4A5280" }}>{it.ex}</span>}</div>}
                </div>
              </div>
            </Pop>
          );
        })}
      </div>
      {items.map((_, i) => <SFX key={i} at={at(i)} name="pop" vol={0.22} />)}
    </AbsoluteFill>
  );
};

// slot machine: fixed start + rolling ending
const SPattern: React.FC<P> = (p) => {
  const { s, t } = p; const f = useCurrentFrame(); const slots = s.slots as { en: string; bn: string }[];
  const n = slots.length; const H = 150;
  const starts = slots.map((_, i) => (t.lines[i] ? t.lines[i].a - 10 : v(p, 0.15 + (0.75 * i) / n)));
  let pos = 0; starts.forEach((st, i) => { pos += i === 0 ? 0 : interpolate(f, [st, st + 14], [0, 1], { ...clamp, easing: Easing.bezier(0.5, 1.6, 0.4, 1) }); });
  const cur = Math.min(n - 1, Math.round(pos));
  return (
    <AbsoluteFill>
      <Kicker text="বাক্যের কাঠামো" color={C.violet} icon={Zap} />
      <Rise d={6} style={{ position: "absolute", left: 120, right: 120, top: 220, textAlign: "center" }}><span style={{ fontFamily: BN, fontSize: 40, fontWeight: 700, color: C.mute }}>{s.formula}</span></Rise>
      <div style={{ position: "absolute", left: 0, right: 0, top: 360, display: "flex", justifyContent: "center", alignItems: "center", gap: 26 }}>
        <Pop d={8}><div style={{ height: H, padding: "0 46px", borderRadius: 28, background: C.sun, display: "grid", placeItems: "center", fontFamily: EN, fontSize: 84, fontWeight: 900, color: C.ink, boxShadow: `0 20px 0 #C9951C, 0 30px 50px rgba(0,0,0,.4)` }}>{s.left}</div></Pop>
        <Pop d={12}><div style={{ fontFamily: EN, fontSize: 80, fontWeight: 900, color: C.white }}>+</div></Pop>
        <Pop d={14}>
          <div style={{ width: 820, height: H, borderRadius: 28, background: C.white, overflow: "hidden", position: "relative", boxShadow: `0 20px 0 #B9C2EA, 0 30px 50px rgba(0,0,0,.4)` }}>
            <div style={{ transform: `translateY(${-pos * H}px)` }}>
              {slots.map((sl, i) => <div key={i} style={{ height: H, display: "grid", placeItems: "center", fontFamily: EN, fontSize: 78, fontWeight: 800, color: i === cur ? C.coral : C.ink }}>{sl.en}</div>)}
            </div>
            <div style={{ position: "absolute", inset: 0, background: "linear-gradient(#fff 0%, transparent 22%, transparent 78%, #fff 100%)" }} />
          </div>
        </Pop>
      </div>
      <div style={{ position: "absolute", left: 0, right: 0, top: 580, display: "flex", justifyContent: "center" }}>
        <div key={cur} style={{ padding: "16px 36px", borderRadius: 22, background: "rgba(255,255,255,.1)", border: `2px solid ${C.line}`, fontFamily: BN, fontSize: 44, fontWeight: 700, color: C.mint, opacity: interpolate(f, [starts[cur] + 8, starts[cur] + 16], [0, 1], clamp) }}>{slots[cur]?.bn}</div>
      </div>
      <div style={{ position: "absolute", left: 0, right: 0, top: 720, display: "flex", justifyContent: "center", gap: 14 }}>
        {slots.map((_, i) => <div key={i} style={{ width: i === cur ? 46 : 16, height: 16, borderRadius: 8, background: i <= cur ? C.sun : C.line }} />)}
      </div>
      {starts.map((st, i) => (i ? <SFX key={i} at={st} name="whoosh" vol={0.16} /> : null))}
    </AbsoluteFill>
  );
};

// "Repeat after me": a line plays with karaoke, then a mic + countdown gives the learner time to say it
const SRepeat: React.FC<P> = (p) => {
  const { s, t } = p; const f = useCurrentFrame(); const lines = s.lines || [];
  let i = t.lines.findIndex((x) => f < x.g + LGAP); if (i < 0) i = lines.length - 1;
  const x = t.lines[i] || { a: 0, b: 0, g: 0 }; const yours = f >= x.b && f < x.g; const k = interpolate(f, [x.b, x.g], [1, 0], clamp);
  const started = f >= (t.lines[0]?.a ?? 1e9) - 10;
  return (
    <AbsoluteFill>
      <Kicker text="Repeat after me · আমার সাথে বলো" color={C.coral} icon={Repeat} />
      {!started && <Rise d={6} style={{ position: "absolute", left: 0, right: 0, top: 380, textAlign: "center" }}><div style={{ fontFamily: BN, fontSize: 70, fontWeight: 800, color: C.white }}>শোনো <span style={{ color: C.sun }}>→</span> তারপর <span style={{ color: C.coral }}>তুমি বলো</span></div></Rise>}
      {started && lines[i] && (
        <div style={{ position: "absolute", left: 200, right: 200, top: 270, display: "flex", flexDirection: "column", alignItems: "center", gap: 40 }}>
          <div key={i} style={{ padding: "40px 60px", borderRadius: 36, background: C.white, boxShadow: "0 30px 70px rgba(0,0,0,.45)", textAlign: "center", transform: `scale(${0.9 + 0.1 * interpolate(f, [x.a - 10, x.a], [0, 1], clamp)})` }}>
            <Karaoke text={lines[i].text} a={x.a} b={x.b} size={70} weight={800} />
            {lines[i].bn && <div style={{ fontFamily: BN, fontSize: 32, color: "#5B6390", marginTop: 12 }}>{lines[i].bn}</div>}
          </div>
          <div style={{ height: 190, display: "flex", alignItems: "center", gap: 36 }}>
            {yours ? <>
              <div style={{ position: "relative", width: 170, height: 170 }}>
                <svg width={170} height={170} style={{ position: "absolute", transform: "rotate(-90deg)" }}><circle cx={85} cy={85} r={76} stroke="rgba(255,255,255,.15)" strokeWidth={10} fill="none" /><circle cx={85} cy={85} r={76} stroke={C.coral} strokeWidth={10} fill="none" strokeDasharray={478} strokeDashoffset={478 * (1 - k)} strokeLinecap="round" /></svg>
                <div style={{ position: "absolute", inset: 22, borderRadius: "50%", background: C.coral, display: "grid", placeItems: "center", transform: `scale(${1 + Math.sin(f / 4) * 0.06})`, boxShadow: `0 0 ${30 + Math.sin(f / 4) * 20}px ${C.coral}` }}><Mic size={64} color="#fff" /></div>
              </div>
              <div style={{ fontFamily: BN, fontSize: 64, fontWeight: 800, color: C.white }}>এবার <span style={{ color: C.coral }}>তুমি</span> বলো!</div>
            </> : <div style={{ display: "flex", alignItems: "center", gap: 20, fontFamily: BN, fontSize: 44, fontWeight: 700, color: C.sky }}><Headphones size={54} /> মন দিয়ে শোনো…</div>}
          </div>
          <div style={{ display: "flex", gap: 14 }}>{lines.map((_, j) => <div key={j} style={{ width: j === i ? 50 : 18, height: 18, borderRadius: 9, background: j < i ? C.mint : j === i ? C.coral : C.line }} />)}</div>
        </div>
      )}
      {t.lines.map((y, j) => <SFX key={j} at={y.b} name="pop" vol={0.2} />)}
    </AbsoluteFill>
  );
};

// word diff (LCS) for the mistake fixer
const diff = (a: string[], b: string[]) => {
  const n = a.length, m = b.length; const L = Array.from({ length: n + 1 }, () => Array(m + 1).fill(0)); const W = (w: string) => w.toLowerCase().replace(/[^a-z0-9']/g, "");
  for (let i = n - 1; i >= 0; i--) for (let j = m - 1; j >= 0; j--) L[i][j] = W(a[i]) === W(b[j]) ? L[i + 1][j + 1] + 1 : Math.max(L[i + 1][j], L[i][j + 1]);
  const delA = new Set<number>(), addB = new Set<number>(); let i = 0, j = 0;
  while (i < n && j < m) { if (W(a[i]) === W(b[j])) { i++; j++; } else if (L[i + 1][j] >= L[i][j + 1]) delA.add(i++); else addB.add(j++); }
  while (i < n) delA.add(i++); while (j < m) addB.add(j++);
  return { delA, addB };
};
const SFix: React.FC<P> = (p) => {
  const { s } = p; const f = useCurrentFrame(); const { fps } = useVideoConfig(); const rows = s.rows as { wrong: string; right: string; why: string }[];
  const n = rows.length; const span = 0.92 / n;
  return (
    <AbsoluteFill>
      <Kicker text="ভুল ধরো, শুধরে নাও" color={C.coral} icon={X} />
      <div style={{ position: "absolute", left: 140, right: 140, top: 225, display: "flex", flexDirection: "column", gap: 26 }}>
        {rows.map((r, i) => {
          const d0 = v(p, 0.02 + i * span), dSt = v(p, 0.02 + i * span + span * 0.28), dOk = v(p, 0.02 + i * span + span * 0.5);
          const A = r.wrong.split(" "), B = r.right.split(" "); const { delA, addB } = diff(A, B);
          const st = pop(f, fps, dSt); const ok = f >= dOk;
          const kOk = interpolate(f, [dOk, dOk + 10], [0, 1], clamp);
          return (
            <Rise key={i} d={d0}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24, alignItems: "stretch" }}>
                <div style={{ position: "relative", padding: "26px 32px", borderRadius: 24, background: "rgba(255,94,91,.12)", border: `3px solid ${C.coral}88` }}>
                  <div style={{ fontFamily: EN, fontSize: 44, fontWeight: 700, color: C.white }}>{A.map((w, k) => <span key={k} style={{ marginRight: 14, color: ok && delA.has(k) ? C.coral : C.white, textDecoration: ok && delA.has(k) ? `line-through ${C.coral} 5px` : "none" }}>{w}</span>)}</div>
                  <div style={{ position: "absolute", right: 22, top: "50%", marginTop: -46, width: 92, height: 92, borderRadius: 46, border: `6px solid ${C.coral}`, display: "grid", placeItems: "center", color: C.coral, fontFamily: BN, fontWeight: 900, fontSize: 30, opacity: Math.min(1, st * 2), transform: `scale(${2.4 - 1.4 * st}) rotate(-14deg)` }}>ভুল</div>
                </div>
                <div style={{ padding: "26px 32px", borderRadius: 24, background: ok ? C.white : "rgba(255,255,255,.06)", border: `3px solid ${ok ? C.mint : C.line}`, transform: `scale(${0.96 + 0.04 * kOk})` }}>
                  {ok ? <div style={{ fontFamily: EN, fontSize: 44, fontWeight: 800, color: C.ink }}>{B.map((w, k) => { const add = addB.has(k); const q = pop(f, fps, dOk + 4 + k * 2);
                    return <span key={k} style={{ marginRight: 14, display: "inline-block", color: add ? "#0E9F6E" : C.ink, transform: add ? `scale(${q})` : "none", background: add ? `linear-gradient(transparent 60%, ${C.mint}88 60%)` : "none" }}>{w}</span>; })}</div>
                    : <div style={{ fontFamily: BN, fontSize: 36, color: C.mute }}>ঠিকটা কী হবে…?</div>}
                  <div style={{ marginTop: 10, fontFamily: BN, fontSize: 28, fontWeight: 600, color: "#4A5280", opacity: kOk }}><Check size={26} color="#0E9F6E" strokeWidth={3} style={{ verticalAlign: -4 }} /> {r.why}</div>
                </div>
              </div>
            </Rise>
          );
        })}
      </div>
      {rows.map((_, i) => <React.Fragment key={i}><SFX at={v(p, 0.02 + i * span + span * 0.28)} name="hit" vol={0.3} /><SFX at={v(p, 0.02 + i * span + span * 0.5)} name="chime" vol={0.18} /></React.Fragment>)}
    </AbsoluteFill>
  );
};

// pronunciation: two words side by side, each pulses while its audio plays, then the learner gets a gap
const SSound: React.FC<P> = (p) => {
  const { s, t } = p; const f = useCurrentFrame(); const words = s.words as { en: string; ipa?: string; bn?: string }[];
  return (
    <AbsoluteFill>
      <Kicker text={s.head || "উচ্চারণ"} color={C.sky} icon={Volume2} />
      <div style={{ position: "absolute", left: 0, right: 0, top: 260, display: "flex", justifyContent: "center", gap: 60 }}>
        {words.map((w, i) => {
          const x = t.lines[i]; const live = x && f >= x.a && f < x.b; const yours = x && f >= x.b && f < x.g;
          return (
            <Pop key={i} d={v(p, 0.1 + i * 0.2)} rot={i ? 2 : -2}>
              <div style={{ width: 560, padding: "44px 30px", borderRadius: 36, background: C.white, textAlign: "center", boxShadow: live ? `0 0 0 10px ${ACC[i]}, 0 0 80px ${ACC[i]}` : "0 26px 60px rgba(0,0,0,.45)" }}>
                <div style={{ fontFamily: EN, fontSize: 120, fontWeight: 900, color: C.ink, lineHeight: 1 }}>{w.en}</div>
                {w.ipa && <div style={{ fontFamily: EN, fontSize: 40, color: "#5B6390", marginTop: 16 }}>/{w.ipa}/</div>}
                {w.bn && <div style={{ fontFamily: BN, fontSize: 32, color: "#5B6390", marginTop: 8 }}>{w.bn}</div>}
                <div style={{ marginTop: 20, height: 40, fontFamily: BN, fontSize: 34, fontWeight: 800, color: yours ? C.coral : C.sky }}>{yours ? "🎤 এবার তুমি বলো" : live ? "শোনো…" : ""}</div>
              </div>
            </Pop>
          );
        })}
      </div>
      {s.tip && <Rise d={v(p, 0.5)} style={{ position: "absolute", left: 260, right: 260, top: 760 }}><div style={{ display: "flex", gap: 18, alignItems: "center", padding: "20px 30px", borderRadius: 24, background: "rgba(255,200,69,.14)", border: `2px solid ${C.sun}88` }}><Lightbulb size={40} color={C.sun} style={{ flex: "none" }} /><span style={{ fontFamily: BN, fontSize: 34, color: C.white, lineHeight: 1.35 }}>{s.tip}</span></div></Rise>}
    </AbsoluteFill>
  );
};

const Confetti: React.FC<{ at: number; x?: number; y?: number; n?: number }> = ({ at, x = 960, y = 500, n = 70 }) => {
  const f = useCurrentFrame(); const t = f - at; if (t < 0 || t > 70) return null;
  return <>{Array.from({ length: n }, (_, i) => {
    const ang = random(`a${i}`) * Math.PI * 2, sp = 10 + random(`s${i}`) * 22;
    const px = x + Math.cos(ang) * sp * t, py = y + Math.sin(ang) * sp * t + 0.6 * t * t;
    return <div key={i} style={{ position: "absolute", left: px, top: py, width: 14, height: 22, borderRadius: 3, background: ACC[i % 6], transform: `rotate(${t * 12 + i * 30}deg)`, opacity: interpolate(t, [50, 70], [1, 0], clamp) }} />;
  })}</>;
};

// game-show quiz in one scene: question (vo) → countdown (hold) → reveal + explanation (vo2)
const SQuiz: React.FC<P> = (p) => {
  const { s, t } = p; const f = useCurrentFrame(); const { fps } = useVideoConfig();
  const reveal = f >= t.holdB; const left = Math.max(0, Math.ceil((t.holdB - f) / 30)); const bar = interpolate(f, [t.holdA, t.holdB], [1, 0], clamp);
  return (
    <AbsoluteFill>
      <Kicker text="কুইজ টাইম!" color={C.sun} icon={Zap} />
      <Rise d={6} style={{ position: "absolute", left: 160, right: 160, top: 215 }}><div style={{ fontFamily: BN, fontSize: 54, fontWeight: 800, color: C.white, lineHeight: 1.3, textAlign: "center" }}>{s.q}</div></Rise>
      <div style={{ position: "absolute", left: 260, right: 260, top: 360, display: "flex", flexDirection: "column", gap: 20 }}>
        {(s.o as string[]).map((o, i) => {
          const right = reveal && i === s.a; const k = pop(f, fps, t.holdB + 2);
          return (
            <Rise key={i} d={v(p, 0.3 + i * 0.12)} y={30}>
              <div style={{ display: "flex", alignItems: "center", gap: 26, padding: "22px 30px", borderRadius: 26, background: right ? C.mint : C.white, opacity: reveal && !right ? 0.35 : 1, transform: right ? `scale(${1 + 0.05 * k})` : "none", boxShadow: right ? `0 0 60px ${C.mint}` : "0 16px 36px rgba(0,0,0,.35)" }}>
                <div style={{ width: 66, height: 66, borderRadius: 33, background: right ? C.white : [C.sky, C.sun, C.pink, C.violet][i], display: "grid", placeItems: "center", fontFamily: EN, fontWeight: 900, fontSize: 34, color: C.ink, flex: "none" }}>{right ? <Check size={38} color="#0E9F6E" strokeWidth={4} /> : "ABCD"[i]}</div>
                <span style={{ fontFamily: /[a-z]/i.test(o) ? EN : BN, fontSize: 46, fontWeight: 800, color: C.ink }}>{o}</span>
              </div>
            </Rise>
          );
        })}
      </div>
      {!reveal && f >= t.holdA && (
        <div style={{ position: "absolute", left: 460, right: 460, top: 790, display: "flex", alignItems: "center", gap: 24 }}>
          <div style={{ flex: 1, height: 22, borderRadius: 11, background: "rgba(255,255,255,.15)", overflow: "hidden" }}><div style={{ width: `${bar * 100}%`, height: "100%", background: `linear-gradient(90deg, ${C.coral}, ${C.sun})` }} /></div>
          <div style={{ fontFamily: BN, fontSize: 60, fontWeight: 900, color: C.sun, width: 70, textAlign: "center" }}>{bn(left)}</div>
        </div>
      )}
      {reveal && s.ex && <Rise d={t.holdB + 10} style={{ position: "absolute", left: 360, right: 360, top: 780 }}><div style={{ padding: "16px 26px", borderRadius: 20, background: "rgba(61,220,151,.16)", border: `2px solid ${C.mint}`, fontFamily: BN, fontSize: 36, fontWeight: 700, color: C.white, textAlign: "center" }}>✔ {s.ex}</div></Rise>}
      <Confetti at={t.holdB} y={520} />
      <SFX at={t.holdB} name="chime" vol={0.35} />
    </AbsoluteFill>
  );
};

const SMission: React.FC<P> = (p) => {
  const { s } = p; const f = useCurrentFrame(); const { fps } = useVideoConfig(); const xp = pop(f, fps, v(p, 0.75));
  return (
    <AbsoluteFill>
      <Kicker text="আজকের মিশন" color={C.mint} icon={Target} />
      <Pop d={8} style={{ position: "absolute", left: 260, right: 260, top: 220 }}>
        <div style={{ borderRadius: 40, padding: "46px 56px", background: `linear-gradient(135deg, ${C.violet}, #3B2A9E)`, boxShadow: "0 40px 80px rgba(0,0,0,.5)", border: "3px solid rgba(255,255,255,.25)", position: "relative" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 18 }}><div style={{ width: 84, height: 84, borderRadius: 24, background: C.sun, display: "grid", placeItems: "center" }}><Target size={52} color={C.ink} /></div>
            <div><div style={{ fontFamily: BN, fontSize: 28, color: "#D9D2FF" }}>তোমার ভূমিকা</div><div style={{ fontFamily: BN, fontSize: 44, fontWeight: 800, color: C.white }}>{s.role}</div></div></div>
          <Rise d={v(p, 0.2)} style={{ marginTop: 26 }}><div style={{ fontFamily: BN, fontSize: 38, fontWeight: 600, color: C.white, lineHeight: 1.4 }}>{s.goal}</div></Rise>
          <div style={{ marginTop: 26, display: "flex", gap: 16, flexWrap: "wrap" }}>
            {(s.must as string[]).map((m, i) => <Pop key={i} d={v(p, 0.4 + i * 0.1)}><span style={{ display: "inline-block", padding: "12px 24px", borderRadius: 16, background: C.white, fontFamily: EN, fontSize: 34, fontWeight: 800, color: C.ink }}>{m}</span></Pop>)}
          </div>
          <div style={{ marginTop: 28, display: "flex", alignItems: "center", gap: 12, fontFamily: BN, fontSize: 30, color: "#D9D2FF" }}><Bot size={34} /> এআই প্রশিক্ষকের সাথে রোলপ্লে করো, অথবা বন্ধুর সাথে</div>
          <div style={{ position: "absolute", right: -40, top: -50, width: 170, height: 170, borderRadius: 85, background: C.sun, display: "grid", placeItems: "center", transform: `scale(${xp}) rotate(${(1 - xp) * 180 + 10}deg)`, boxShadow: "0 20px 40px rgba(0,0,0,.4)" }}>
            <div style={{ textAlign: "center", fontFamily: EN, fontWeight: 900, color: C.ink }}><Trophy size={40} /><div style={{ fontSize: 40 }}>+{s.xp || 50}</div><div style={{ fontSize: 22 }}>XP</div></div>
          </div>
        </div>
      </Pop>
      <SFX at={v(p, 0.75)} name="chime" vol={0.25} />
    </AbsoluteFill>
  );
};

const SRecap: React.FC<P> = (p) => (
  <AbsoluteFill>
    <Kicker text="এক নজরে আজকের ক্লাস" color={C.sun} icon={BookOpen} />
    <div style={{ position: "absolute", left: 170, right: 170, top: 240, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 40 }}>
      {(p.s.items as string[]).map((t, i) => (
        <Pop key={i} d={v(p, 0.05 + i * 0.2)} rot={[-2, 2.5, 1.5, -2.5][i % 4]}>
          <div style={{ background: STICKY[i % STICKY.length], borderRadius: 8, padding: "38px 34px 32px", minHeight: 190, boxShadow: "0 24px 44px rgba(0,0,0,.4)", position: "relative" }}>
            <Pin size={40} color={C.coral} fill={C.coral} style={{ position: "absolute", top: -18, left: "50%", marginLeft: -20 }} />
            <div style={{ fontFamily: BN, fontSize: 40, fontWeight: 800, color: C.ink, lineHeight: 1.3 }}>{t}</div>
          </div>
        </Pop>
      ))}
    </div>
  </AbsoluteFill>
);

const SOutro: React.FC<P> = (p) => {
  const { spec, s } = p; const f = useCurrentFrame();
  return (
    <AbsoluteFill>
      <div style={{ position: "absolute", left: 170, top: 250 }}><Pop d={4}><Teacher size={420} a={amp(s.voAmp, Math.round(f - p.t.voA))} wave /></Pop></div>
      <div style={{ position: "absolute", left: 700, right: 140, top: 250 }}>
        <Rise d={8}><div style={{ fontFamily: BN, fontSize: 80, fontWeight: 800, color: C.white, lineHeight: 1.2 }}>{s.head || "দারুণ! আজকের ক্লাস শেষ"}</div></Rise>
        {s.cta && <Rise d={v(p, 0.15)} style={{ marginTop: 30 }}><div style={{ display: "inline-flex", alignItems: "center", gap: 16, padding: "18px 30px", borderRadius: 22, background: C.mint, fontFamily: BN, fontSize: 36, fontWeight: 800, color: C.ink }}><Sparkles size={34} /> {s.cta}</div></Rise>}
        <Rise d={v(p, 0.4)} style={{ marginTop: 34 }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 22, padding: "22px 34px", borderRadius: 24, background: "rgba(255,255,255,.08)", border: `2px solid ${C.line}` }}>
            <span style={{ fontFamily: BN, fontSize: 30, color: C.mute }}>পরের ক্লাস</span><ArrowRight size={34} color={C.sun} /><span style={{ fontFamily: BN, fontSize: 40, fontWeight: 800, color: C.white }}>{spec.next}</span>
          </div>
        </Rise>
        <Rise d={v(p, 0.6)} style={{ marginTop: 44 }}><Img src={staticFile("brand/logo-dark.png")} style={{ height: 80 }} /></Rise>
      </div>
      <Confetti at={6} x={1200} y={300} n={90} />
    </AbsoluteFill>
  );
};

const MAP: Record<string, React.FC<any>> = { hook: SHook, title: STitle, dialogue: SDialogue, chunks: SChunks, pattern: SPattern, repeat: SRepeat, fix: SFix, sound: SSound, quiz: SQuiz, mission: SMission, recap: SRecap, outro: SOutro };
const BIG_TEACHER = new Set(["hook", "outro"]);

/* ---------- chrome ---------- */
const Backdrop: React.FC = () => {
  const f = useCurrentFrame();
  const blob = (x: number, y: number, r: number, c: string, ph: number) => <div style={{ position: "absolute", left: x + Math.sin(f / 90 + ph) * 80, top: y + Math.cos(f / 110 + ph) * 60, width: r, height: r, borderRadius: "50%", background: c, filter: "blur(120px)", opacity: 0.38 }} />;
  return (
    <AbsoluteFill style={{ background: `radial-gradient(1400px 900px at 50% 40%, ${C.bg1}, ${C.bg0})`, overflow: "hidden" }}>
      {blob(-200, -200, 700, C.violet, 0)}{blob(1400, -100, 600, C.sky, 2)}{blob(1300, 700, 700, C.coral, 4)}{blob(-100, 750, 600, C.mint, 1)}
      <AbsoluteFill style={{ backgroundImage: "radial-gradient(rgba(255,255,255,.10) 1.5px, transparent 1.5px)", backgroundSize: "36px 36px" }} />
    </AbsoluteFill>
  );
};
const Header: React.FC<{ spec: Spec; starts: number[] }> = ({ spec, starts }) => {
  const f = useCurrentFrame(); const k = starts.filter((s) => f >= s).length;
  return (
    <div style={{ position: "absolute", left: 0, right: 0, top: 0, height: 92, display: "flex", alignItems: "center", gap: 22, padding: "0 50px" }}>
      <Img src={staticFile("brand/logo-dark.png")} style={{ height: 50 }} />
      <div style={{ width: 2, height: 34, background: C.line }} />
      <div style={{ fontFamily: BN, fontSize: 26, fontWeight: 700, color: C.white }}>{spec.course}</div>
      <div style={{ fontFamily: BN, fontSize: 24, color: C.mute }}>· {spec.lessonNo}</div>
      <div style={{ marginLeft: "auto", display: "flex", gap: 7, width: 440 }}>{starts.map((_, i) => <div key={i} style={{ flex: 1, height: 9, borderRadius: 5, background: i < k - 1 ? `${C.sun}AA` : i === k - 1 ? C.sun : "rgba(255,255,255,.14)" }} />)}</div>
    </div>
  );
};
// the teacher's corner badge (mouth follows whichever teacher voice is playing)
const Badge: React.FC<{ spec: Spec; starts: number[]; ts: T[] }> = ({ spec, starts, ts }) => {
  const f = useCurrentFrame();
  const i = starts.findIndex((st, j) => f >= st && f < st + ts[j].len); if (i < 0) return null;
  const s = spec.scenes[i], t = ts[i], lf = f - starts[i];
  if (BIG_TEACHER.has(s.type)) return null;
  const a = lf >= t.voA && lf < t.voB ? amp(s.voAmp, lf - t.voA) : lf >= t.vo2A && lf < t.vo2B ? amp(s.vo2Amp, lf - t.vo2A) : 0;
  const talking = a > 0.05;
  const k = interpolate(lf, [0, 12], [0, 1], { ...clamp, easing: ease });
  return (
    <div style={{ position: "absolute", left: 34, bottom: 30, display: "flex", alignItems: "center", gap: 14, opacity: k, transform: `translateY(${(1 - k) * 30}px)` }}>
      <div style={{ borderRadius: "50%", boxShadow: talking ? `0 0 0 6px ${C.sun}66, 0 0 40px ${C.sun}88` : "0 12px 30px rgba(0,0,0,.5)" }}><Teacher size={190} a={a} /></div>
      <div style={{ padding: "6px 14px 8px", borderRadius: 14, background: "rgba(7,11,38,.75)", fontFamily: BN, fontSize: 20, color: C.mute, lineHeight: 1.3 }}><b style={{ color: C.white, fontSize: 24 }}>স্যার</b><br />এআই প্রশিক্ষক · এআই কণ্ঠ</div>
    </div>
  );
};
const Wipe: React.FC<{ color: string }> = ({ color }) => {
  const f = useCurrentFrame(); if (f > 16) return null;
  const x = interpolate(f, [0, 16], [-2400, 2400], { ...clamp, easing: Easing.inOut(Easing.cubic) });
  return <AbsoluteFill style={{ pointerEvents: "none" }}><div style={{ position: "absolute", top: -400, left: x, width: 900, height: 1900, background: `linear-gradient(90deg, ${color}, ${C.violet})`, transform: "rotate(14deg)", opacity: 0.95 }} /></AbsoluteFill>;
};
const subChunks = (spec: Spec, starts: number[], ts: T[]) => spec.scenes.flatMap((s, i) => {
  const one = (text: string | undefined, a: number, frames: number) => {
    if (!text || !frames) return [];
    const parts = text.split(/(?<=[।?!,—])\s+/).reduce<string[]>((acc, x) => { if (acc.length && (acc[acc.length - 1].length < 26 || x.length < 10)) acc[acc.length - 1] += " " + x; else acc.push(x); return acc; }, []);
    const tot = parts.reduce((n, x) => n + x.length, 0); let c = 0; const b = starts[i] + a;
    return parts.map((x) => { const from = b + (frames * c) / tot; c += x.length; return { s: x, from, to: b + (frames * c) / tot }; });
  };
  return [...one(s.vo, ts[i].voA, s.frames), ...one(s.vo2, ts[i].vo2A, s.frames2 || 0)];
});

export const EnglishVideo: React.FC<{ spec: Spec }> = ({ spec }) => {
  const f = useCurrentFrame();
  const ts = spec.scenes.map(timing);
  const starts = ts.reduce<number[]>((a, _, i) => [...a, i ? a[i - 1] + ts[i - 1].len : 15], []);
  const chunks = subChunks(spec, starts, ts);
  const cur = chunks.find((x) => f >= x.from && f < x.to + 4);
  const total = engLen(spec);
  const busy = (fr: number) => spec.scenes.some((s, i) => fr >= starts[i] + LEAD - 6 && fr <= starts[i] + ts[i].len - TAIL + 4);
  return (
    <AbsoluteFill style={{ background: C.bg0 }}>
      <Backdrop />
      {spec.scenes.map((s, i) => {
        const S = MAP[s.type] || SRecap; const t = ts[i]; const n = String(i + 1).padStart(2, "0");
        return (
          <Sequence key={i} from={starts[i]} durationInFrames={t.len}>
            <Fade len={t.len}><S s={s} spec={spec} t={t} /></Fade>
            <Sequence from={t.voA}><Audio src={staticFile(`english/${spec.id}/vo/${n}a.mp3`)} /></Sequence>
            {(s.lines || []).map((l, j) => <Sequence key={j} from={t.lines[j].a}><Audio src={staticFile(`english/${spec.id}/${l.file}`)} /></Sequence>)}
            {s.vo2 && <Sequence from={t.vo2A}><Audio src={staticFile(`english/${spec.id}/vo/${n}b.mp3`)} /></Sequence>}
            {i > 0 && <><Wipe color={ACC[i % 6]} /><Sequence from={0} durationInFrames={40}><Audio src={staticFile("aiu2/whoosh.mp3")} volume={0.28} /></Sequence></>}
            {i === 0 && <Sequence from={0} durationInFrames={90}><Audio src={staticFile("aiu2/swell.mp3")} volume={0.3} /></Sequence>}
          </Sequence>
        );
      })}
      <Header spec={spec} starts={starts} />
      <Badge spec={spec} starts={starts} ts={ts} />
      {cur && <div style={{ position: "absolute", left: 470, right: 140, bottom: 40, display: "flex", justifyContent: "center", opacity: interpolate(f, [cur.from, cur.from + 5, cur.to, cur.to + 4], [0, 1, 1, 0], clamp) }}><div style={{ maxWidth: 1300, padding: "10px 28px 14px", borderRadius: 16, background: "rgba(7,11,38,.82)", border: `1px solid ${C.line}`, fontFamily: BN, fontSize: 36, fontWeight: 500, color: C.white, textAlign: "center", lineHeight: 1.35 }}>{cur.s.replace(/[।,]$/, "")}</div></div>}
      <Audio src={staticFile("aiu2/music.mp3")} volume={(fr) => (busy(fr) ? 0.05 : 0.14) * interpolate(fr, [0, 30, total - 60, total], [0, 1, 1, 0], clamp)} />
    </AbsoluteFill>
  );
};
const Fade: React.FC<{ len: number; children: React.ReactNode }> = ({ len, children }) => {
  const f = useCurrentFrame();
  const o = Math.min(interpolate(f, [6, 16], [0, 1], { ...clamp, easing: ease }), interpolate(f, [len - 8, len], [1, 0], clamp));
  return <AbsoluteFill style={{ opacity: o }}>{children}</AbsoluteFill>;
};
