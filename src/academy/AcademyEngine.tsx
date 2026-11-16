// AI University একাডেমি — lesson engine v2 (2026-11-16). Chalkboard look of MathEngine (kept for history), plus "see it, then name it" teaching:
//   predict → lab (animated chalk experiment: carts, rickshaws, buses, people, balls; force arrows; stroboscope ghosts; live meters)
//   → morph (the formula rearranges itself, tokens glide) → steps (worked example) → mistake → quiz → recap.
// Subject visuals: cube ((a+b)³ explodes into 8 blocks, CSS 3D), area ((a+b)²), molecule (ball-and-stick, atom masses add up to the molar mass),
// molemap (mass ↔ mole ↔ particles ↔ volume, a value travels along the arrows), particles (dozen → 10²³ zoom), graph, compare, memory, hook.
// Teaching basis: predict-observe-explain, concrete → picture → abstract, signalling (chalk underline on the key part), segmenting (one idea per scene).
// One spec per lesson: src/academy/specs/<id>.json, voiced/timed by scripts/academy_make.py. Old MathEngine specs render unchanged (superset).
import React from "react";
import { AbsoluteFill, Audio, Img, Sequence, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig, Easing, delayRender, continueRender } from "remotion";

const K = { board: "#1F3A2E", board2: "#14261C", chalk: "#F4F1E8", dim: "rgba(244,241,232,.62)", faint: "rgba(244,241,232,.18)", yellow: "#FFE58A", pink: "#FF9EB5", blue: "#9AD0FF", green: "#A8E6A1", red: "#FF6B5B", orange: "#FFB46B", wood: "#7A5530", wood2: "#5A3D20" };
const BN = "Anek", SERIF = "Tiro", HAND = "Galada", MATH = "STIX, Anek, serif";  // STIX Two Text (OFL) — bundled so the cloud render looks the same
if (typeof document !== "undefined") {
  for (const [n, u] of [["Anek", "fonts/AnekBangla.ttf"], ["Tiro", "fonts/TiroBangla-Regular.ttf"], ["Galada", "fonts/Galada-Regular.ttf"], ["STIX", "fonts/STIXTwoText.ttf"]]) {
    const h = delayRender(`font ${n}`);
    const f = new FontFace(n, `url(${staticFile(u)})`, { weight: "100 900" });
    f.load().then(() => { document.fonts.add(f); continueRender(h); }).catch(() => continueRender(h));
  }
}
const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const ease = Easing.bezier(0.16, 1, 0.3, 1);
const bn = (n: number | string) => String(n).replace(/\d/g, (d) => "০১২৩৪৫৬৭৮৯"[+d]);
const pop = (f: number, fps: number, d: number) => spring({ frame: f - d, fps, config: { damping: 13, mass: 0.6 } });
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

export type Scene = { type: string; vo: string; frames: number; hold?: number; [k: string]: any };
export type Spec = { id: string; course: string; chapter: string; lessonNo: string; title: string; next: string; scenes: Scene[]; map?: string[]; no?: number };
const LEAD = 12, TAIL = 18;
const sceneLen = (s: Scene) => LEAD + s.frames + (s.hold || 0) + TAIL;
export const academyLen = (spec: Spec) => spec.scenes.reduce((n, s) => n + sceneLen(s), 0) + 30;
type P = { s: Scene; spec: Spec; vo: number };
const v = (p: P, x: number) => LEAD + p.vo * x;
const COL: Record<string, string> = { y: K.yellow, p: K.pink, b: K.blue, g: K.green, r: K.red, o: K.orange, w: K.chalk };

/* ---------- chalk primitives ---------- */
const chalkShadow = "0 0 1px rgba(244,241,232,.9), 0 0 6px rgba(244,241,232,.25)";
const Write: React.FC<{ at: number; dur?: number; children: React.ReactNode; style?: React.CSSProperties }> = ({ at, dur = 18, children, style }) => {
  const f = useCurrentFrame(); const x = interpolate(f, [at, at + dur], [0, 100], { ...clamp, easing: Easing.inOut(Easing.quad) });
  return <div style={{ position: "relative", clipPath: `inset(-30px ${100 - x}% -30px -30px)`, textShadow: chalkShadow, ...style }}>{children}</div>;
};
const Fade: React.FC<{ at: number; children: React.ReactNode; style?: React.CSSProperties }> = ({ at, children, style }) => {
  const f = useCurrentFrame(); const o = interpolate(f, [at, at + 10], [0, 1], { ...clamp, easing: ease });
  return <div style={{ opacity: o, transform: `translateY(${(1 - o) * 12}px)`, ...style }}>{children}</div>;
};
// "[y:a²] + [p:2ab]" — coloured parts get a chalk underline drawn just after they appear (signalling)
const Mx: React.FC<{ t: string; size?: number; at?: number; step?: number; under?: boolean }> = ({ t, size = 64, at = 0, step = 0, under }) => {
  const f = useCurrentFrame(); let k = 0;
  const parts = String(t ?? "").split(/(\[[a-z]:[^\]]+\])/).filter(Boolean);
  return <span style={{ fontFamily: MATH, fontSize: size, color: K.chalk, textShadow: chalkShadow, whiteSpace: "pre" }}>{parts.map((x, i) => {
    const m = x.match(/^\[([a-z]):([^\]]+)\]$/);
    if (!m) return <span key={i}>{x}</span>;
    const d = at + step * k++, o = step ? interpolate(f, [d, d + 10], [0, 1], clamp) : 1;
    const u = (under ?? step > 0) ? interpolate(f, [d + 12, d + 22], [0, 1], { ...clamp, easing: ease }) : 0;
    return <span key={i} style={{ color: COL[m[1]] || K.chalk, opacity: o, fontWeight: 700, position: "relative", display: "inline-block" }}>{m[2]}
      {u > 0 && <span style={{ position: "absolute", left: "-4%", bottom: -size * 0.04, height: Math.max(3, size * 0.05), width: `${108 * u}%`, background: COL[m[1]], borderRadius: 3, opacity: 0.85 }} />}</span>;
  })}</span>;
};
const plain = (t: string) => String(t ?? "").replace(/\[[a-z]:([^\]]+)\]/g, "$1");
const Head: React.FC<{ t: string; at?: number }> = ({ t, at = 2 }) => (
  <Write at={at} dur={16} style={{ fontFamily: HAND, fontSize: 54, color: K.yellow, marginBottom: 22 }}>{t}</Write>
);
const Box: React.FC<{ children: React.ReactNode; style?: React.CSSProperties }> = ({ children, style }) => (
  <div style={{ position: "absolute", left: 140, right: 140, top: 140, bottom: 170, display: "flex", flexDirection: "column", ...style }}>{children}</div>
);
const Txt: React.FC<{ t: string; size?: number; color?: string; style?: React.CSSProperties }> = ({ t, size = 44, color = K.chalk, style }) =>
  /\[|\^|²|³|√|=|×|÷/.test(t) && !/[ঀ-৿]{6,}/.test(t) ? <Mx t={t} size={size} /> : <span style={{ fontFamily: BN, fontSize: size, color, lineHeight: 1.4, ...style }}>{plain(t)}</span>;

/* ================= the chalk LAB (stage) ================= */
// world: 1600 × 600 (y grows down, ground at y = 540 unless a lane sets `y`)
type Move = { from: number; to: number; dx: number; ease?: "const" | "accel" | "decel" | "smooth" };
type Ent = { id: string; kind: string; x: number; y?: number; w?: number; label?: string; color?: string; move?: Move[]; follow?: string; dx?: number;
  lean?: [number, number][]; ghosts?: number; ghostLabels?: boolean; flip?: boolean; at?: number; jet?: [number, number] };
const EASE: Record<string, (t: number) => number> = { const: (t) => t, accel: (t) => t * t, decel: (t) => 1 - (1 - t) * (1 - t), smooth: (t) => t * t * (3 - 2 * t) };
const posAt = (e: Ent, frac: number, all: Ent[]): number => {
  if (e.follow) { const b = all.find((x) => x.id === e.follow); return b ? posAt(b, frac, all) + (e.dx || 0) : e.x; }
  let x = e.x;
  for (const m of e.move || []) { const t = Math.max(0, Math.min(1, (frac - m.from) / Math.max(0.001, m.to - m.from))); x += m.dx * (EASE[m.ease || "const"] || EASE.const)(t); }
  return x;
};
const leanAt = (e: Ent, frac: number) => {
  const L = e.lean || []; if (!L.length) return 0;
  if (frac <= L[0][0]) return 0;
  for (let i = 0; i < L.length; i++) {
    const [t, d] = L[i], prev = i ? L[i - 1] : [L[0][0] - 0.05, 0];
    if (frac < t) return lerp(prev[1], d, (frac - prev[0]) / (t - prev[0]));
  }
  return L[L.length - 1][1];
};
const S = { stroke: K.chalk, strokeWidth: 4, fill: "none", strokeLinecap: "round" as const, strokeLinejoin: "round" as const };
const Wheel: React.FC<{ cx: number; cy: number; r: number; rot: number }> = ({ cx, cy, r, rot }) => (
  <g transform={`translate(${cx} ${cy}) rotate(${rot})`}><circle r={r} {...S} /><circle r={r * 0.18} fill={K.chalk} />
    {[0, 60, 120].map((a) => <line key={a} x1={-r * Math.cos((a * Math.PI) / 180)} y1={-r * Math.sin((a * Math.PI) / 180)} x2={r * Math.cos((a * Math.PI) / 180)} y2={r * Math.sin((a * Math.PI) / 180)} stroke={K.chalk} strokeWidth={2} opacity={0.7} />)}</g>
);
const Person: React.FC<{ lean: number; push?: boolean; sit?: boolean; scale?: number; color?: string }> = ({ lean, push, sit, scale = 1, color = K.chalk }) => (
  <g transform={`scale(${scale}) rotate(${lean})`} stroke={color}>
    <circle cx={0} cy={-136} r={17} {...S} stroke={color} />
    <line x1={0} y1={-118} x2={0} y2={sit ? -70 : -60} {...S} stroke={color} />
    {sit ? <><line x1={0} y1={-70} x2={34} y2={-70} {...S} stroke={color} /><line x1={34} y1={-70} x2={34} y2={-30} {...S} stroke={color} /></>
      : <><line x1={0} y1={-60} x2={-20} y2={0} {...S} stroke={color} /><line x1={0} y1={-60} x2={20} y2={0} {...S} stroke={color} /></>}
    {push ? <><line x1={0} y1={-104} x2={40} y2={-94} {...S} stroke={color} /><line x1={0} y1={-100} x2={40} y2={-86} {...S} stroke={color} /></>
      : <><line x1={0} y1={-104} x2={-22} y2={-74} {...S} stroke={color} /><line x1={0} y1={-104} x2={22} y2={-74} {...S} stroke={color} /></>}
  </g>
);
// one drawn object, origin = bottom-centre on the ground
const Body: React.FC<{ e: Ent; x: number; frac: number; f: number }> = ({ e, x, frac, f }) => {
  const w = e.w || ({ cart: 220, box: 140, ball: 90, rickshaw: 260, bus: 460, person: 60, skater: 90, boat: 260, block: 180, wall: 40, balloon: 110, car: 300, truck: 380, stone: 70 } as any)[e.kind] || 160;
  const rot = (x / 30) * (180 / Math.PI) * (e.flip ? -1 : 1), c = e.color ? COL[e.color] || e.color : K.chalk, lean = leanAt(e, frac);
  const lab = (y: number, size = 34) => e.label ? <text x={0} y={y} textAnchor="middle" fontFamily={BN} fontSize={size} fill={c} style={{ textShadow: chalkShadow }}>{bn(e.label)}</text> : null;
  let g: React.ReactNode = null;
  switch (e.kind) {
    case "cart": g = <><rect x={-w / 2} y={-110} width={w} height={74} rx={8} {...S} stroke={c} fill="rgba(244,241,232,.06)" /><Wheel cx={-w / 2 + 44} cy={-24} r={24} rot={rot} /><Wheel cx={w / 2 - 44} cy={-24} r={24} rot={rot} />{lab(-62)}</>; break;
    case "car": g = <><path d={`M${-w / 2} -40 L${-w / 2} -90 L${-w / 4} -92 L${-w / 8} -150 L${w / 5} -150 L${w / 3} -92 L${w / 2} -84 L${w / 2} -40 Z`} {...S} stroke={c} fill="rgba(244,241,232,.06)" /><Wheel cx={-w / 3} cy={-32} r={32} rot={rot} /><Wheel cx={w / 3} cy={-32} r={32} rot={rot} />{lab(-102, 30)}</>; break;
    case "truck": g = <><rect x={-w / 2} y={-170} width={w * 0.66} height={130} rx={6} {...S} stroke={c} fill="rgba(244,241,232,.06)" /><path d={`M${w * 0.16} -40 L${w * 0.16} -130 L${w * 0.38} -130 L${w / 2} -90 L${w / 2} -40 Z`} {...S} stroke={c} /><Wheel cx={-w / 3} cy={-34} r={34} rot={rot} /><Wheel cx={w / 3} cy={-34} r={34} rot={rot} />{lab(-100)}</>; break;
    case "box": case "block": { const h = e.kind === "box" ? w : w * 0.55; g = <><rect x={-w / 2} y={-h} width={w} height={h} rx={6} {...S} stroke={c} fill="rgba(244,241,232,.07)" />{lab(-h / 2 + 12)}</>; break; }
    case "stone": g = <><path d={`M${-w / 2} 0 Q${-w / 2} ${-w * 0.7} 0 ${-w * 0.75} Q${w / 2} ${-w * 0.7} ${w / 2} 0 Z`} {...S} stroke={c} fill="rgba(244,241,232,.07)" />{lab(-w * 0.3, 26)}</>; break;
    case "ball": { const r = w / 2; g = <><g transform={`translate(0 ${-r}) rotate(${rot})`}><circle r={r} {...S} stroke={c} fill="rgba(244,241,232,.06)" /><path d={`M0 ${-r * 0.4} L${r * 0.38} ${-r * 0.12} L${r * 0.24} ${r * 0.32} L${-r * 0.24} ${r * 0.32} L${-r * 0.38} ${-r * 0.12} Z`} {...S} stroke={c} strokeWidth={3} /></g>{lab(-w - 14, 28)}</>; break; }
    case "wall": g = <><rect x={-w / 2} y={-300} width={w} height={300} {...S} stroke={c} />{[0, 1, 2, 3, 4, 5].map((i) => <line key={i} x1={-w / 2} y1={-40 - i * 48} x2={w / 2} y2={-70 - i * 48} stroke={c} strokeWidth={2} opacity={0.6} />)}</>; break;
    case "rickshaw": g = <><Wheel cx={-70} cy={-48} r={48} rot={rot} /><Wheel cx={110} cy={-30} r={30} rot={rot} />
      <path d="M-70 -48 L40 -60 L110 -30 M40 -60 L60 -130 M-120 -96 L-20 -96 L-10 -60 M-120 -96 L-120 -150 Q-70 -230 -10 -150 L-10 -96" {...S} stroke={c} />
      <g transform="translate(66 -128)"><Person lean={lean} sit scale={0.62} color={c} /></g>{lab(-240, 30)}</>; break;
    case "bus": { const n = 5; g = <><rect x={-w / 2} y={-190} width={w} height={150} rx={14} {...S} stroke={c} fill="rgba(244,241,232,.05)" />
      {Array.from({ length: n }, (_, i) => <rect key={i} x={-w / 2 + 24 + i * ((w - 48) / n)} y={-172} width={(w - 48) / n - 14} height={56} rx={6} {...S} strokeWidth={3} stroke={c} />)}
      <Wheel cx={-w / 2 + 80} cy={-34} r={34} rot={rot} /><Wheel cx={w / 2 - 80} cy={-34} r={34} rot={rot} />{lab(-60, 30)}</>; break; }
    case "person": g = <><Person lean={lean} push={/push/.test(e.label || "")} color={c} />{e.label && !/push/.test(e.label) ? lab(-170, 28) : null}</>; break;
    case "skater": g = <><g transform="translate(0 -18)"><Person lean={lean} push color={c} /></g><line x1={-46} y1={-14} x2={46} y2={-14} {...S} stroke={c} /><circle cx={-30} cy={-6} r={7} fill={c} /><circle cx={30} cy={-6} r={7} fill={c} />{lab(-190, 28)}</>; break;
    case "boat": g = <><path d={`M${-w / 2} -60 L${w / 2} -60 L${w / 2 - 40} 0 L${-w / 2 + 40} 0 Z`} {...S} stroke={c} fill="rgba(244,241,232,.06)" /><g transform="translate(0 -60)"><Person lean={lean} color={c} /></g>{lab(-26, 28)}</>; break;
    case "balloon": { const jet = e.jet ? interpolate(frac, e.jet, [0, 1], clamp) * (1 - interpolate(frac, [e.jet[1], e.jet[1] + 0.05], [0, 1], clamp)) : 0;
      g = <><ellipse cx={0} cy={-150} rx={w / 2} ry={w * 0.38} {...S} stroke={c} fill="rgba(255,158,181,.12)" /><path d={`M${-w / 2} -150 l-14 -8 l0 16 z`} fill={c} />
        {jet > 0 && [0, 1, 2].map((i) => <line key={i} x1={-w / 2 - 20 - i * 6} y1={-150 + (i - 1) * 14} x2={-w / 2 - 20 - 70 * jet - ((f + i * 7) % 20)} y2={-150 + (i - 1) * 22} stroke={K.blue} strokeWidth={4} strokeLinecap="round" opacity={0.8} />)}
        <line x1={-w / 2} y1={-150} x2={w / 2} y2={-150} stroke={c} strokeWidth={1} opacity={0} />{lab(-240, 28)}</>; break; }
    default: g = <><rect x={-w / 2} y={-100} width={w} height={100} {...S} stroke={c} />{lab(-40)}</>;
  }
  return <g transform={`translate(${x} ${e.y ?? 540}) scale(${e.flip ? -1 : 1} 1)`}>{e.flip ? <g transform="scale(-1 1)">{g}</g> : g}</g>;
};
const heightOf = (e: Ent) => ({ cart: 110, box: e.w || 140, block: (e.w || 180) * 0.55, ball: e.w || 90, bus: 190, rickshaw: 150, person: 150, skater: 170, boat: 120, car: 150, truck: 170, balloon: 190, stone: 50 } as any)[e.kind] || 100;
const Arrow: React.FC<{ x: number; y: number; dir: string; len: number; color: string; label?: string; grow: number; w?: number }> = ({ x, y, dir, len, color, label, grow, w = 9 }) => {
  if (grow <= 0) return null;
  const L = len * grow, [dx, dy] = ({ r: [1, 0], l: [-1, 0], u: [0, -1], d: [0, 1] } as any)[dir] || [1, 0];
  const x2 = x + dx * L, y2 = y + dy * L, hx = -dx * 24, hy = -dy * 24, px = -dy * 15, py = dx * 15;
  return <g opacity={Math.min(1, grow * 3)}>
    <line x1={x} y1={y} x2={x2 - dx * 14} y2={y2 - dy * 14} stroke={color} strokeWidth={w} strokeLinecap="round" />
    <path d={`M${x2} ${y2} L${x2 + hx + px} ${y2 + hy + py} L${x2 + hx - px} ${y2 + hy - py} Z`} fill={color} />
    {label && <text x={x2 + dx * 20 + (dy ? 26 : 0)} y={y2 + dy * 30 - (dy ? 0 : 18)} textAnchor={dx > 0 ? "start" : dx < 0 ? "end" : "start"} fontFamily={MATH} fontSize={38} fontWeight={700} fill={color}>{label}</text>}
  </g>;
};
type Force = { on: string; dir: string; len: number; label?: string; color?: string; at: number; until?: number; dy?: number };
type Counter = { label: string; from?: number; to?: number; unit?: string; fix?: number; at: number; until?: number; value?: string; color?: string };
const Stage: React.FC<{ p: P; st: any; top?: number; h?: number }> = ({ p, st, top = 0, h }) => {
  const f = useCurrentFrame(); const { fps } = useVideoConfig();
  const frac = Math.max(0, (f - LEAD) / Math.max(1, p.vo));
  const ents: Ent[] = st.ents || [];
  const ground = st.ground || "plain";
  const gy = st.groundY ?? 540;
  return (
    <svg viewBox={st.zoom ? `${800 - 800 / st.zoom} ${600 - 600 / st.zoom + 40} ${1600 / st.zoom} ${600 / st.zoom}` : "0 0 1600 600"} preserveAspectRatio="xMidYMax meet" style={{ position: "absolute", left: 0, right: 0, top, width: "100%", height: h || 600 * (1640 / 1600), overflow: "visible", filter: "url(#chalky)" }}>
      <defs><filter id="chalky"><feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves={2} seed={3} /><feDisplacementMap in="SourceGraphic" scale={2.2} /></filter></defs>
      {/* lanes / ground */}
      {(st.lanes || [gy]).map((y: number, i: number) => ground === "none" ? null : (
        <g key={i}>
          <line x1={0} y1={y} x2={1600} y2={y} stroke={K.chalk} strokeWidth={4} opacity={0.75} />
          {ground === "rough" && Array.from({ length: 64 }, (_, k) => <path key={k} d={`M${k * 25} ${y} l8 10 l8 -10`} stroke={K.chalk} strokeWidth={2.5} fill="none" opacity={0.6} />)}
          {ground === "ice" && Array.from({ length: 12 }, (_, k) => <line key={k} x1={k * 140 + 20} y1={y + 12} x2={k * 140 + 80} y2={y + 12} stroke={K.blue} strokeWidth={3} opacity={0.6} />)}
          {ground === "plain" && Array.from({ length: 40 }, (_, k) => <line key={k} x1={k * 40} y1={y + 4} x2={k * 40 - 16} y2={y + 22} stroke={K.chalk} strokeWidth={2} opacity={0.35} />)}
          {ground === "road" && Array.from({ length: 16 }, (_, k) => <line key={k} x1={k * 110} y1={y + 26} x2={k * 110 + 56} y2={y + 26} stroke={K.yellow} strokeWidth={4} opacity={0.5} />)}
        </g>))}
      {/* ticker-tape: a dot every equal time step under the lane (growing gaps = acceleration) + a faint ghost where there is room */}
      {ents.filter((e) => e.ghosts && e.move && e.move.length).map((e) => {
        const m0 = e.move![0].from, m1 = e.move![e.move!.length - 1].to, n = e.ghosts!, ly = (e.y ?? gy) + 40, w = e.w || 220;
        const xs = Array.from({ length: n }, (_, i) => posAt(e, m0 + ((m1 - m0) * i) / (n - 1), ents));
        const shown = xs.filter((_, i) => frac >= m0 + ((m1 - m0) * i) / (n - 1)).length;
        return <g key={e.id + "t"}>
          <line x1={xs[0] - 40} y1={ly} x2={Math.max(xs[0] - 40, (shown ? xs[shown - 1] : xs[0]) + 10)} y2={ly} stroke={K.chalk} strokeWidth={14} opacity={0.12} strokeLinecap="round" />
          {xs.slice(0, shown).map((x, i) => {
            const roomy = i > 0 && x - xs[i - 1] > w * 1.05 && i < n - 1;
            return <g key={i}>
              {roomy && <g opacity={0.22}><Body e={e} x={x} frac={m0 + ((m1 - m0) * i) / (n - 1)} f={f} /></g>}
              <circle cx={x} cy={ly} r={9} fill={K.yellow} />
              {e.ghostLabels && <text x={x} y={ly + 40} textAnchor="middle" fontFamily={BN} fontSize={28} fill={K.yellow}>{bn(i)} s</text>}
            </g>;
          })}
        </g>;
      })}
      {ents.map((e) => {
        const app = e.at ? pop(f, fps, v(p, e.at)) : 1;
        if (app <= 0.01) return null;
        return <g key={e.id} opacity={Math.min(1, app)}><Body e={e} x={posAt(e, frac, ents)} frac={frac} f={f} /></g>;
      })}
      {(st.forces || []).map((F: Force, i: number) => {
        const e = ents.find((x) => x.id === F.on); if (!e) return null;
        const grow = interpolate(frac, [F.at, F.at + 0.06], [0, 1], { ...clamp, easing: ease }) * (F.until ? interpolate(frac, [F.until, F.until + 0.03], [1, 0], clamp) : 1);
        const x = posAt(e, frac, ents), y = (e.y ?? gy) - heightOf(e) / 2 + (F.dy || 0);
        const start = F.dir === "r" ? x + (e.w || 120) / 2 * (e.kind === "person" ? 0.6 : 1) : F.dir === "l" ? x - (e.w || 120) / 2 : x;
        return <Arrow key={i} x={start} y={y} dir={F.dir} len={F.len} color={COL[F.color || "y"] || F.color || K.yellow} label={F.label} grow={grow} />;
      })}
      {(st.tags || []).map((t: any, i: number) => {
        const e = ents.find((x) => x.id === t.on); const o = interpolate(frac, [t.at, t.at + 0.04], [0, 1], clamp) * (t.until ? interpolate(frac, [t.until, t.until + 0.03], [1, 0], clamp) : 1);
        if (!e || o <= 0) return null;
        const x = posAt(e, frac, ents), y = (e.y ?? gy) - heightOf(e) - 34;
        return <text key={i} x={x} y={y} textAnchor="middle" fontFamily={BN} fontSize={34} fill={COL[t.color || "w"] || K.chalk} opacity={o} style={{ textShadow: chalkShadow }}>{t.text}</text>;
      })}
    </svg>
  );
};
// live meters on the right of a lab (numbers count while things move)
const Meters: React.FC<{ p: P; list: Counter[] }> = ({ p, list }) => {
  const f = useCurrentFrame(); const frac = Math.max(0, (f - LEAD) / Math.max(1, p.vo));
  return <div style={{ position: "absolute", right: 0, top: 0, display: "flex", flexDirection: "column", gap: 12, alignItems: "flex-end" }}>
    {list.map((c, i) => {
      const o = interpolate(frac, [c.at, c.at + 0.04], [0, 1], clamp); if (o <= 0) return null;
      const t = interpolate(frac, [c.at, c.until ?? c.at + 0.25], [0, 1], { ...clamp, easing: Easing.out(Easing.quad) });
      const val = c.value ?? (c.from !== undefined && c.to !== undefined ? lerp(c.from, c.to, t).toFixed(c.fix ?? 0) : "");
      return <div key={i} style={{ opacity: o, display: "flex", gap: 16, alignItems: "baseline", border: `2px dashed ${K.faint}`, borderRadius: 14, padding: "8px 20px", background: "rgba(10,20,14,.35)" }}>
        <span style={{ fontFamily: BN, fontSize: 30, color: K.dim }}>{c.label}</span>
        <span style={{ fontFamily: MATH, fontSize: 46, fontWeight: 700, color: COL[c.color || "y"] || K.yellow, minWidth: 70, textAlign: "right" }}>{val}</span>
        {c.unit && <span style={{ fontFamily: MATH, fontSize: 30, color: K.chalk }}>{c.unit}</span>}
      </div>;
    })}
  </div>;
};
// timed chalk notes at the top of a lab ("দেখো, ফাঁক বাড়ছে!")
const Notes: React.FC<{ p: P; list: { at: number; t: string; until?: number }[] }> = ({ p, list }) => {
  const f = useCurrentFrame(); const frac = Math.max(0, (f - LEAD) / Math.max(1, p.vo));
  const cur = [...list].reverse().find((n) => frac >= n.at && (!n.until || frac < n.until));
  if (!cur) return null;
  const st = LEAD + p.vo * cur.at;
  return <div key={cur.t} style={{ position: "absolute", left: 0, right: 0, top: 0 }}><Write at={st} dur={14} style={{ fontFamily: HAND, fontSize: 46, color: K.yellow }}>{cur.t}</Write></div>;
};

/* ================= scenes ================= */
const STitle: React.FC<P> = (p) => {
  const map = p.spec.map || [], no = p.spec.no ?? -1;
  return (
    <Box style={{ alignItems: "center", justifyContent: "center", textAlign: "center" }}>
      <Fade at={4}><div style={{ fontFamily: HAND, fontSize: 40, color: K.yellow }}>{p.s.kicker || p.spec.chapter}</div></Fade>
      <Write at={10} dur={26} style={{ fontFamily: SERIF, fontSize: (p.s.title || p.spec.title).length > 24 ? 84 : 104, color: K.chalk, lineHeight: 1.25, margin: "18px 0 10px" }}>{p.s.title || p.spec.title}</Write>
      {p.s.formula && <Fade at={40}><div style={{ marginTop: 18 }}><Mx t={p.s.formula} size={78} /></div></Fade>}
      {p.s.sub && <Fade at={v(p, 0.45)}><div style={{ fontFamily: BN, fontSize: 36, color: K.dim, marginTop: 26 }}>{p.s.sub}</div></Fade>}
      {map.length > 1 && <Fade at={v(p, 0.6)} style={{ marginTop: 46 }}><div style={{ display: "flex", gap: 14, alignItems: "center", justifyContent: "center" }}>
        {map.map((m, i) => <div key={i} style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <div style={{ width: i === no ? 54 : 38, height: i === no ? 54 : 38, borderRadius: "50%", display: "grid", placeItems: "center", fontFamily: BN, fontSize: i === no ? 28 : 22, fontWeight: 700,
            background: i === no ? K.yellow : i < no ? "rgba(168,230,161,.25)" : "transparent", color: i === no ? K.board : K.chalk, border: `2px solid ${i === no ? K.yellow : i < no ? K.green : K.faint}` }}>{bn(i + 1)}</div>
          {i < map.length - 1 && <div style={{ width: 34, height: 2, background: K.faint }} />}</div>)}
      </div><div style={{ fontFamily: BN, fontSize: 26, color: K.dim, marginTop: 12 }}>অধ্যায়ের {bn(map.length)}টি পাঠের {bn(no + 1)} নম্বর</div></Fade>}
    </Box>
  );
};

// hook: a big everyday question, optionally over a small lab animation
const SHook: React.FC<P> = (p) => (
  <Box style={{ alignItems: "center", textAlign: "center" }}>
    <Fade at={2}><div style={{ fontFamily: HAND, fontSize: 40, color: K.yellow }}>{p.s.kicker || "ভাবো তো…"}</div></Fade>
    <Write at={8} dur={30} style={{ fontFamily: SERIF, fontSize: p.s.q.length > 40 ? 62 : 76, color: K.chalk, lineHeight: 1.3, margin: "14px 0", maxWidth: 1500 }}>{p.s.q}</Write>
    {p.s.stage && <div style={{ position: "relative", width: "100%", height: 500 }}><Stage p={p} st={p.s.stage} h={500} /></div>}
  </Box>
);

// predict: "আগে অনুমান করো" — the next scene (lab) shows what really happens
const SPredict: React.FC<P> = (p) => {
  const f = useCurrentFrame(); const { fps } = useVideoConfig();
  const o: string[] = p.s.o || [], total = p.vo + (p.s.hold || 0), left = Math.max(0, Math.ceil((LEAD + total - f) / fps));
  return (
    <Box>
      <div style={{ display: "flex", alignItems: "baseline" }}><Head t={p.s.head || "আগে অনুমান করো!"} />
        {p.s.hold ? <div style={{ marginLeft: "auto", width: 110, height: 110, borderRadius: "50%", border: `4px solid ${K.yellow}`, display: "grid", placeItems: "center", fontFamily: HAND, fontSize: 64, color: K.yellow }}>{bn(left)}</div> : null}</div>
      <Write at={6} dur={24} style={{ marginBottom: 40 }}><Txt t={p.s.q} size={54} /></Write>
      <div style={{ display: "grid", gridTemplateColumns: `repeat(${o.length}, 1fr)`, gap: 26 }}>
        {o.map((x, i) => <Fade key={i} at={18 + i * 8}><div style={{ border: `3px dashed ${K.chalk}`, borderRadius: 22, padding: "34px 26px", textAlign: "center", minHeight: 190, display: "flex", flexDirection: "column", alignItems: "center", gap: 14,
          transform: `rotate(${(i - 1) * 0.8}deg) scale(${0.96 + 0.04 * Math.sin((f + i * 20) / 18)})` }}>
          <span style={{ fontFamily: HAND, fontSize: 56, color: K.yellow }}>{"কখগঘ"[i]}</span><Txt t={x} size={42} /></div></Fade>)}
      </div>
      <Fade at={v(p, 0.8)} style={{ marginTop: 34, textAlign: "center" }}><div style={{ fontFamily: BN, fontSize: 34, color: K.dim }}>মনে মনে একটা বেছে নাও — এখনই দেখব আসলে কী হয়</div></Fade>
    </Box>
  );
};

// lab: animated chalk experiment
const SLab: React.FC<P> = (p) => (
  <Box>
    {p.s.head && <Head t={p.s.head} />}
    <div style={{ position: "relative", flex: 1 }}>
      <Stage p={p} st={p.s} top={p.s.head ? -10 : 40} />
      {p.s.meters && <Meters p={p} list={p.s.meters} />}
      {p.s.notes && <div style={{ position: "absolute", left: 0, right: 420, top: p.s.head ? -6 : 0 }}><Notes p={p} list={p.s.notes} /></div>}
    </div>
    {p.s.verdict && <Fade at={v(p, p.s.verdictAt ?? 0.82)} style={{ position: "absolute", left: 0, right: 0, bottom: -10, textAlign: "center" }}>
      <span style={{ display: "inline-block", fontFamily: BN, fontSize: 40, color: K.board, background: K.yellow, padding: "8px 30px 12px", borderRadius: 14, fontWeight: 600 }}>{p.s.verdict}</span></Fade>}
  </Box>
);

// morph: one equation rewriting itself — tokens with the same text glide to their new place
let MEASURE: CanvasRenderingContext2D | null = null;
const tw = (t: string, size: number) => {
  if (typeof document === "undefined") return t.length * size * 0.55;
  if (!MEASURE) MEASURE = document.createElement("canvas").getContext("2d");
  MEASURE!.font = `${/[ঀ-৿]/.test(t) ? "700" : "400"} ${size}px ${MATH}`;
  return MEASURE!.measureText(t).width;
};
const SMorph: React.FC<P> = (p) => {
  const f = useCurrentFrame();
  const rows: string[][] = (p.s.rows || []).map((r: any) => (Array.isArray(r) ? r : String(r).split(/\s+/)));
  const size = p.s.size || 96, gap = size * 0.28, n = rows.length;
  const at = (i: number) => v(p, (p.s.times && p.s.times[i] !== undefined) ? p.s.times[i] : 0.06 + (0.78 * i) / Math.max(1, n - 1 || 1));
  // layout every row
  const lay = rows.map((r) => { const ws = r.map((t) => tw(plain(t), size)); const W = ws.reduce((a, b) => a + b, 0) + gap * (r.length - 1); let x = -W / 2;
    return r.map((t, i) => { const o = { t, x, w: ws[i] }; x += ws[i] + gap; return o; }); });
  // match tokens row→row by plain text (first unused)
  const links: number[][] = []; // links[k][i] = index in row k-1 of token i in row k, -1 = new
  for (let k = 1; k < n; k++) { const used = new Set<number>(); links[k] = rows[k].map((t) => { const j = rows[k - 1].findIndex((u, jj) => !used.has(jj) && plain(u) === plain(t)); if (j >= 0) used.add(j); return j; }); }
  let k = 0; for (let i = 0; i < n; i++) if (f >= at(i)) k = i;
  const tr = k > 0 ? interpolate(f, [at(k), at(k) + 22], [0, 1], { ...clamp, easing: Easing.inOut(Easing.cubic) }) : interpolate(f, [at(0), at(0) + 20], [0, 1], clamp);
  return (
    <Box style={{ alignItems: "center" }}>
      {p.s.head && <Head t={p.s.head} />}
      <div style={{ position: "relative", width: "100%", height: size * 1.6, marginTop: 70 }}>
        {k > 0 && lay[k - 1].map((o, j) => links[k].includes(j) ? null : <div key={"o" + j} style={{ position: "absolute", left: `calc(50% + ${o.x}px)`, top: 0, opacity: 1 - tr, transform: `translateY(${-30 * tr}px)` }}><Mx t={o.t} size={size} under={false} /></div>)}
        {lay[k].map((o, i) => {
          const j = k > 0 ? links[k][i] : -1, from = j >= 0 ? lay[k - 1][j].x : o.x;
          const x = j >= 0 ? lerp(from, o.x, tr) : o.x, op = j >= 0 || k === 0 ? (k === 0 ? tr : 1) : tr;
          const lift = j >= 0 && Math.abs(from - o.x) > 4 ? -Math.sin(Math.PI * tr) * size * 0.7 : 0;
          return <div key={i} style={{ position: "absolute", left: `calc(50% + ${x}px)`, top: 0, opacity: op, transform: `translateY(${lift + (j < 0 && k > 0 ? 30 * (1 - tr) : 0)}px)` }}><Mx t={o.t} size={size} under={false} /></div>;
        })}
      </div>
      {(p.s.notes || [])[k] && <Fade key={k} at={at(k) + 18} style={{ marginTop: 40 }}><div style={{ fontFamily: HAND, fontSize: 42, color: K.green }}>{p.s.notes[k]}</div></Fade>}
      {p.s.box && k === n - 1 && <div style={{ marginTop: 26, opacity: interpolate(f, [at(n - 1) + 24, at(n - 1) + 34], [0, 1], clamp), fontFamily: BN, fontSize: 34, color: K.dim }}>{p.s.box}</div>}
    </Box>
  );
};

const SPoints: React.FC<P> = (p) => {
  const it: string[] = p.s.items || [];
  return (
    <Box>
      <Head t={p.s.head} />
      {it.map((x, i) => (
        <Write key={i} at={v(p, 0.08 + (0.8 * i) / it.length)} dur={20} style={{ display: "flex", gap: 22, alignItems: "baseline", fontFamily: BN, fontSize: 46, color: K.chalk, lineHeight: 1.45, margin: "10px 0" }}>
          <span style={{ fontFamily: HAND, color: K.yellow, fontSize: 44 }}>{bn(i + 1)}.</span><Txt t={x} size={46} />
        </Write>
      ))}
    </Box>
  );
};

const SFormula: React.FC<P> = (p) => {
  const rows: string[] = p.s.rows || [p.s.formula];
  return (
    <Box style={{ justifyContent: "center", alignItems: "center", textAlign: "center" }}>
      <Head t={p.s.head} />
      {rows.map((r, i) => {
        const at = v(p, 0.06 + (0.62 * i) / rows.length);
        return <Write key={i} at={at} dur={26} style={{ margin: "16px 0" }}><Mx t={r} size={p.s.size || 92} at={at + 10} step={8} /></Write>;
      })}
      {p.s.note && <Fade at={v(p, 0.72)} style={{ marginTop: 40 }}><div style={{ fontFamily: BN, fontSize: 38, color: K.dim, border: `2px dashed ${K.faint}`, borderRadius: 16, padding: "14px 30px" }}>{p.s.note}</div></Fade>}
    </Box>
  );
};

const SArea: React.FC<P> = (p) => {
  const f = useCurrentFrame(); const { fps } = useVideoConfig();
  const A = 330, B = 190, Sz = A + B;
  const reg = [{ x: 0, y: 0, w: A, h: A, c: K.yellow, t: "a²", at: 0.28 }, { x: A, y: 0, w: B, h: A, c: K.pink, t: "ab", at: 0.42 }, { x: 0, y: A, w: A, h: B, c: K.pink, t: "ab", at: 0.5 }, { x: A, y: A, w: B, h: B, c: K.blue, t: "b²", at: 0.6 }];
  const draw = interpolate(f, [v(p, 0.04), v(p, 0.2)], [0, 1], clamp);
  return (
    <Box style={{ flexDirection: "row", alignItems: "center", gap: 90 }}>
      <svg width={Sz + 120} height={Sz + 120} viewBox={`-60 -60 ${Sz + 120} ${Sz + 120}`} style={{ flex: "none", overflow: "visible" }}>
        <rect x={0} y={0} width={Sz} height={Sz} fill="none" stroke={K.chalk} strokeWidth={5} strokeDasharray={4 * Sz} strokeDashoffset={4 * Sz * (1 - draw)} />
        {reg.map((r, i) => { const o = pop(f, fps, v(p, r.at)); return (
          <g key={i} opacity={Math.min(1, o)}><rect x={r.x + 6} y={r.y + 6} width={r.w - 12} height={r.h - 12} fill={r.c} fillOpacity={0.18} stroke={r.c} strokeWidth={3} rx={6} />
            <text x={r.x + r.w / 2} y={r.y + r.h / 2 + 22} textAnchor="middle" fontFamily={MATH} fontStyle="italic" fontSize={r.w > 250 ? 86 : 58} fill={r.c}>{r.t}</text></g>); })}
        {[["a", A / 2, -18], ["b", A + B / 2, -18], ["a", -30, A / 2 + 14], ["b", -30, A + B / 2 + 14]].map(([t, x, y], i) => (
          <text key={i} x={x as number} y={y as number} textAnchor="middle" fontFamily={MATH} fontStyle="italic" fontSize={46} fill={K.chalk} opacity={draw}>{t}</text>))}
      </svg>
      <div style={{ flex: 1 }}><Head t={p.s.head} />
        <Fade at={v(p, 0.22)}><div style={{ fontFamily: BN, fontSize: 40, color: K.dim, lineHeight: 1.5 }}>{p.s.side || "বাহুর দৈর্ঘ্য (a + b) — তাই ক্ষেত্রফল (a + b)²"}</div></Fade>
        <Write at={v(p, 0.72)} dur={28} style={{ marginTop: 50 }}><Mx t="(a + b)² = [y:a²] + [p:2ab] + [b:b²]" size={72} /></Write></div>
    </Box>
  );
};

// (a+b)³ — a 3D cube splits into 8 blocks: a³, 3 × a²b, 3 × ab², b³ (CSS 3D)
const Cuboid: React.FC<{ x: number; y: number; z: number; w: number; h: number; d: number; c: string; label?: string; o?: number }> = ({ x, y, z, w, h, d, c, label, o = 1 }) => {
  const face = (tf: string, W: number, H: number, txt?: boolean): React.CSSProperties => ({ position: "absolute", width: W, height: H, transform: tf, background: c + "33", border: `3px solid ${c}`, boxSizing: "border-box",
    display: "grid", placeItems: "center", fontFamily: MATH, fontStyle: "italic", fontSize: Math.min(W, H) > 150 ? 64 : 40, color: c, backfaceVisibility: "visible", textShadow: txt ? chalkShadow : undefined });
  return <div style={{ position: "absolute", transformStyle: "preserve-3d", transform: `translate3d(${x}px, ${y}px, ${z}px)`, opacity: o }}>
    <div style={face(`translateZ(${d / 2}px)`, w, h, true)}>{label}</div>
    <div style={face(`rotateY(180deg) translateZ(${d / 2}px)`, w, h)} />
    <div style={face(`rotateY(90deg) translateZ(${w - d / 2}px)`, d, h)} />
    <div style={face(`rotateY(-90deg) translateZ(${d / 2}px)`, d, h)} />
    <div style={face(`rotateX(90deg) translateZ(${d / 2}px)`, w, d)} />
    <div style={face(`rotateX(-90deg) translateZ(${h - d / 2}px)`, w, d)} />
  </div>;
};
const SCube: React.FC<P> = (p) => {
  const f = useCurrentFrame();
  const A = 240, B = 140, ex = interpolate(f, [v(p, 0.25), v(p, 0.45)], [0, 1], { ...clamp, easing: Easing.inOut(Easing.cubic) }), back = interpolate(f, [v(p, 0.86), v(p, 0.96)], [0, 1], clamp);
  const e = ex * (1 - back) * 70, spin = interpolate(f, [0, LEAD + p.vo], [-30, 30]);
  const blocks: any[] = [];
  for (const [ix, sx] of [[0, A], [1, B]] as const) for (const [iy, sy] of [[0, A], [1, B]] as const) for (const [iz, sz] of [[0, A], [1, B]] as const) {
    const nb = ix + iy + iz, c = [K.yellow, K.pink, K.blue, K.green][nb], label = ["a³", "a²b", "ab²", "b³"][nb];
    blocks.push({ x: (ix ? A : 0) + (ix ? e : -e) - (A + B) / 2, y: (iy ? A : 0) + (iy ? e : -e) - (A + B) / 2, z: (iz ? -A : 0) + (iz ? -e : e), w: sx, h: sy, d: sz, c, label, nb });
  }
  const show = (nb: number) => interpolate(f, [v(p, 0.48 + nb * 0.08), v(p, 0.52 + nb * 0.08)], [0.35, 1], clamp);
  return (
    <Box style={{ flexDirection: "row", alignItems: "center", gap: 40 }}>
      <div style={{ width: 820, height: 700, position: "relative", perspective: 2000, flex: "none" }}>
        <div style={{ position: "absolute", left: "58%", top: "62%", transformStyle: "preserve-3d", transform: `rotateX(-24deg) rotateY(${spin}deg)` }}>
          {blocks.map((b, i) => <Cuboid key={i} {...b} o={ex > 0.5 ? show(b.nb) : 1} />)}
        </div>
      </div>
      <div style={{ flex: 1 }}>
        <Head t={p.s.head || "(a + b)³ — একটা ঘনক, আটটা টুকরো"} />
        {[["a³", K.yellow, "১টা"], ["a²b", K.pink, "৩টা"], ["ab²", K.blue, "৩টা"], ["b³", K.green, "১টা"]].map(([t, c, n], i) => (
          <Fade key={i} at={v(p, 0.48 + i * 0.08)}><div style={{ display: "flex", gap: 20, alignItems: "baseline", margin: "8px 0" }}><span style={{ fontFamily: MATH, fontStyle: "italic", fontSize: 58, color: c as string, width: 120 }}>{t}</span><span style={{ fontFamily: BN, fontSize: 40, color: K.chalk }}>— {n}</span></div></Fade>))}
        <Write at={v(p, 0.8)} dur={30} style={{ marginTop: 30 }}><Mx t="(a + b)³ = [y:a³] + [p:3a²b] + [b:3ab²] + [g:b³]" size={58} /></Write>
      </div>
    </Box>
  );
};

// molecule: ball-and-stick; atoms show their atomic mass, the sum = molar mass (computed here, not by the writer)
const AM: Record<string, number> = { H: 1, C: 12, N: 14, O: 16, Na: 23, Mg: 24, Al: 27, S: 32, Cl: 35.5, K: 39, Ca: 40, Fe: 56, Cu: 63.5, Zn: 65 };
const ACOL: Record<string, string> = { H: "#F4F1E8", C: "#8E9AA0", N: "#7FB2FF", O: "#FF6B5B", Na: "#C9A0FF", Cl: "#8BE07A", S: "#FFE58A", Ca: "#FFB46B", Mg: "#B8F0D0", K: "#E0A0FF", Fe: "#D08860", Cu: "#E89060", Al: "#C0C8D0", Zn: "#A0B0C0" };
type Mol = { a: [string, number, number][]; b: [number, number, number][] };
const MOL: Record<string, Mol> = {
  H2O: { a: [["O", 0, 0], ["H", -95, 70], ["H", 95, 70]], b: [[0, 1, 1], [0, 2, 1]] },
  CO2: { a: [["O", -150, 0], ["C", 0, 0], ["O", 150, 0]], b: [[0, 1, 2], [1, 2, 2]] },
  CH4: { a: [["C", 0, 0], ["H", 0, -125], ["H", -118, 60], ["H", 118, 60], ["H", 0, 125]], b: [[0, 1, 1], [0, 2, 1], [0, 3, 1], [0, 4, 1]] },
  NH3: { a: [["N", 0, -20], ["H", -115, 60], ["H", 115, 60], ["H", 0, 110]], b: [[0, 1, 1], [0, 2, 1], [0, 3, 1]] },
  O2: { a: [["O", -70, 0], ["O", 70, 0]], b: [[0, 1, 2]] }, H2: { a: [["H", -55, 0], ["H", 55, 0]], b: [[0, 1, 1]] }, N2: { a: [["N", -65, 0], ["N", 65, 0]], b: [[0, 1, 3]] },
  Cl2: { a: [["Cl", -75, 0], ["Cl", 75, 0]], b: [[0, 1, 1]] }, HCl: { a: [["H", -80, 0], ["Cl", 70, 0]], b: [[0, 1, 1]] }, CO: { a: [["C", -65, 0], ["O", 65, 0]], b: [[0, 1, 3]] },
  NaCl: { a: [["Na", -90, 0], ["Cl", 90, 0]], b: [] }, NaOH: { a: [["Na", -150, 0], ["O", 0, 0], ["H", 110, 0]], b: [[1, 2, 1]] },
  H2SO4: { a: [["S", 0, 0], ["O", 0, -130], ["O", 0, 130], ["O", -135, 0], ["O", 135, 0], ["H", -235, -50], ["H", 235, 50]], b: [[0, 1, 2], [0, 2, 2], [0, 3, 1], [0, 4, 1], [3, 5, 1], [4, 6, 1]] },
  CaCO3: { a: [["C", 40, 0], ["O", 40, -125], ["O", 160, 60], ["O", -70, 60], ["Ca", -230, 40]], b: [[0, 1, 2], [0, 2, 1], [0, 3, 1]] },
  C2H5OH: { a: [["C", -90, 0], ["C", 40, 0], ["O", 160, -40], ["H", 250, 0], ["H", -90, -120], ["H", -90, 120], ["H", -205, 0], ["H", 40, -120], ["H", 40, 120]], b: [[0, 1, 1], [1, 2, 1], [2, 3, 1], [0, 4, 1], [0, 5, 1], [0, 6, 1], [1, 7, 1], [1, 8, 1]] },
  C6H12O6: { a: [["C", 0, 0]], b: [] },
};
const SUB = "₀₁₂₃₄₅₆₇₈₉";
const subF = (f: string) => f.replace(/(\d+)/g, (d) => d.split("").map((x) => SUB[+x]).join(""));
const SMolecule: React.FC<P> = (p) => {
  const f = useCurrentFrame(); const { fps } = useVideoConfig();
  const fm = String(p.s.f || "H2O"), m = MOL[fm] || MOL.H2O, spin = interpolate(f, [0, LEAD + p.vo], [-8, 8]);
  const counts: Record<string, number> = {}; m.a.forEach(([e]) => (counts[e] = (counts[e] || 0) + 1));
  const sum = Object.entries(counts).reduce((n, [e, c]) => n + AM[e] * c, 0);
  const R = (e: string) => (e === "H" ? 38 : e === "Na" || e === "Ca" || e === "Cl" || e === "S" ? 62 : 52);
  const showMass = p.s.sum !== false, mAt = v(p, 0.35), sAt = v(p, 0.6);
  const terms = Object.entries(counts).map(([e, c]) => (c > 1 ? `${c} × ${AM[e]}` : `${AM[e]}`));
  return (
    <Box style={{ flexDirection: "row", alignItems: "center", gap: 40 }}>
      <svg viewBox={(() => { const xs = m.a.map((q) => q[1]), ys = m.a.map((q) => q[2]); const x0 = Math.min(...xs) - 110, x1 = Math.max(...xs) + 110, y0 = Math.min(...ys) - 140, y1 = Math.max(...ys) + 100; const w = Math.max(420, x1 - x0), h = Math.max(330, y1 - y0); return `${(x0 + x1) / 2 - w / 2} ${(y0 + y1) / 2 - h / 2} ${w} ${h}`; })()} style={{ width: 820, height: 630, flex: "none", overflow: "visible" }}>
        <defs>{Object.entries(ACOL).map(([e, c]) => <radialGradient key={e} id={"at" + e} cx="35%" cy="30%"><stop offset="0" stopColor="#fff" stopOpacity={0.9} /><stop offset=".35" stopColor={c} /><stop offset="1" stopColor={c} stopOpacity={0.55} /></radialGradient>)}</defs>
        <g transform={`rotate(${spin})`}>
          {m.b.map(([i, j, n], k) => { const [, x1, y1] = m.a[i], [, x2, y2] = m.a[j], d = Math.hypot(x2 - x1, y2 - y1), nx = -(y2 - y1) / d, ny = (x2 - x1) / d, o = Math.min(1, pop(f, fps, 8 + k * 3));
            return <g key={k} opacity={o}>{Array.from({ length: n }, (_, q) => { const off = (q - (n - 1) / 2) * 16; return <line key={q} x1={x1 + nx * off} y1={y1 + ny * off} x2={x2 + nx * off} y2={y2 + ny * off} stroke={K.chalk} strokeWidth={9} strokeLinecap="round" opacity={0.8} />; })}</g>; })}
          {m.a.map(([e, x, y], i) => { const s = pop(f, fps, 4 + i * 4); return <g key={i} transform={`translate(${x} ${y}) scale(${Math.min(1.05, s)})`}>
            <circle r={R(e)} fill={`url(#at${e})`} stroke="rgba(0,0,0,.35)" strokeWidth={2} />
            <text y={R(e) > 40 ? 14 : 11} textAnchor="middle" fontFamily={MATH} fontWeight={700} fontSize={R(e) > 40 ? 40 : 30} fill="#14261C">{e}</text>
            {showMass && <g opacity={interpolate(f, [mAt + i * 6, mAt + i * 6 + 8], [0, 1], clamp)} transform={`rotate(${-spin})`}><rect x={-30} y={-R(e) - 54} width={60} height={40} rx={10} fill={K.yellow} /><text y={-R(e) - 24} textAnchor="middle" fontFamily={MATH} fontWeight={700} fontSize={28} fill={K.board}>{AM[e]}</text></g>}
          </g>; })}
        </g>
      </svg>
      <div style={{ flex: 1 }}>
        <Head t={p.s.head || `${subF(fm)} অণু`} />
        {Object.entries(counts).map(([e, c], i) => <Fade key={e} at={v(p, 0.18 + i * 0.05)}><div style={{ fontFamily: BN, fontSize: 40, color: K.chalk, margin: "6px 0" }}><span style={{ color: ACOL[e], fontFamily: MATH, fontWeight: 700 }}>{e}</span> পরমাণু — {bn(c)}টি{showMass ? <span style={{ color: K.dim }}> · ভর {bn(AM[e])}</span> : null}</div></Fade>)}
        {showMass && <Write at={sAt} dur={30} style={{ marginTop: 34 }}><Mx t={`${terms.join(" + ")} = [y:${sum}]`} size={58} /></Write>}
        {showMass && <Fade at={sAt + 30} style={{ marginTop: 18 }}><div style={{ fontFamily: BN, fontSize: 36, color: K.green }}>{p.s.note || `আণবিক ভর ${bn(sum)} · মোলার ভর ${bn(sum)} g/mol`}</div></Fade>}
      </div>
    </Box>
  );
};

// molemap: ভর ⇄ মোল ⇄ কণা, মোল ⇄ আয়তন — a glowing value travels along `path`
const NODES: Record<string, { x: number; y: number; t: string; u: string }> = {
  mass: { x: 230, y: 230, t: "ভর", u: "গ্রাম (g)" }, mole: { x: 800, y: 230, t: "মোল", u: "mol" },
  particles: { x: 1370, y: 230, t: "কণার সংখ্যা", u: "টি" }, volume: { x: 800, y: 600, t: "গ্যাসের আয়তন", u: "লিটার (STP)" },
};
const EDGE: Record<string, string> = { "mass>mole": "÷ M", "mole>mass": "× M", "mole>particles": "× 6.023×10²³", "particles>mole": "÷ 6.023×10²³", "mole>volume": "× 22.4 L", "volume>mole": "÷ 22.4 L" };
const SMoleMap: React.FC<P> = (p) => {
  const f = useCurrentFrame(); const { fps } = useVideoConfig();
  const path0: string[] = p.s.path || ["mass", "mole", "particles"], vals: string[] = p.s.vals || [];
  // any step that is not one of the 4 nodes → draw a generic left-to-right chain of boxes (same travelling value)
  const generic = path0.some((x) => !NODES[x]);
  const N: typeof NODES = generic ? Object.fromEntries(path0.map((t, i) => [`g${i}`, { x: 260 + (1080 * i) / Math.max(1, path0.length - 1), y: 300, t, u: "" }])) : NODES;
  const path = generic ? path0.map((_, i) => `g${i}`) : path0;
  const segs = path.length - 1, a0 = 0.18, a1 = 0.82;
  const prog = interpolate(f, [v(p, a0), v(p, a1)], [0, segs], clamp), si = Math.min(segs - 1, Math.floor(prog)), st = prog - si;
  const A = N[path[si]], B = N[path[si + 1]] || A;
  const tx = lerp(A.x, B.x, Easing.inOut(Easing.quad)(Math.min(1, st))), ty = lerp(A.y, B.y, Easing.inOut(Easing.quad)(Math.min(1, st)));
  const reached = (i: number) => prog >= i - 0.02;
  return (
    <Box>
      {p.s.head && <Head t={p.s.head} />}
      <svg viewBox="0 0 1600 720" style={{ position: "absolute", left: 0, top: p.s.head ? 60 : 0, width: "100%", height: 720 * 1640 / 1600, overflow: "visible" }}>
        {(generic ? path.slice(1).map((x, i) => [path[i], x]) : [["mass", "mole"], ["mole", "particles"], ["mole", "volume"]]).map(([a, b], i) => { const A1 = N[a], B1 = N[b], on = path.some((x, k) => k < segs && ((x === a && path[k + 1] === b) || (x === b && path[k + 1] === a)));
          const fw = generic ? (p.s.ops || [])[path.indexOf(a)] || "" : EDGE[`${a}>${b}`], bw = generic ? "" : EDGE[`${b}>${a}`], hor = A1.y === B1.y, mx = (A1.x + B1.x) / 2, my = (A1.y + B1.y) / 2;
          return <g key={i} opacity={on ? 1 : 0.45}>
            <line x1={A1.x + (hor ? 150 : 0)} y1={A1.y + (hor ? -18 : 80)} x2={B1.x - (hor ? 150 : 0)} y2={B1.y + (hor ? -18 : -80)} stroke={K.chalk} strokeWidth={4} markerEnd="url(#ah)" />
            <line x1={B1.x - (hor ? 150 : 0)} y1={B1.y + (hor ? 22 : -80)} x2={A1.x + (hor ? 150 : 0)} y2={A1.y + (hor ? 22 : 80)} stroke={K.chalk} strokeWidth={4} opacity={0.55} markerEnd="url(#ah)" transform={hor ? undefined : "translate(40 0)"} />
            <text x={hor ? mx : mx - 30} y={hor ? my - 40 : my} textAnchor={hor ? "middle" : "end"} fontFamily={MATH} fontSize={34} fontWeight={700} fill={K.yellow}>{fw}</text>
            <text x={hor ? mx : mx + 70} y={hor ? my + 66 : my} textAnchor={hor ? "middle" : "start"} fontFamily={MATH} fontSize={30} fill={K.dim}>{bw}</text></g>; })}
        <defs><marker id="ah" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto"><path d="M0 0 L10 5 L0 10 z" fill={K.chalk} /></marker></defs>
        {Object.entries(N).map(([k, n]) => { const idx = path.indexOf(k), lit = idx >= 0 && reached(idx);
          return <g key={k} transform={`translate(${n.x} ${n.y})`} opacity={Math.min(1, pop(f, fps, 6))}>
            <rect x={-145} y={-80} width={290} height={160} rx={26} fill={lit ? "rgba(255,229,138,.14)" : "rgba(10,20,14,.35)"} stroke={lit ? K.yellow : K.chalk} strokeWidth={lit ? 5 : 3} />
            <text y={-24} textAnchor="middle" fontFamily={BN} fontSize={40} fontWeight={600} fill={K.chalk}>{n.t}</text>
            <text y={18} textAnchor="middle" fontFamily={BN} fontSize={26} fill={K.dim}>{n.u}</text>
            {idx >= 0 && vals[idx] && <text y={64} textAnchor="middle" fontFamily={MATH} fontSize={36} fontWeight={700} fill={K.yellow} opacity={interpolate(prog, [idx - 0.05, idx + 0.05], [0, 1], clamp)}>{vals[idx]}</text>}
          </g>; })}
        {prog > 0 && prog < segs && <g transform={`translate(${tx} ${ty - 120})`}><circle r={26} fill={K.yellow} opacity={0.25} /><circle r={13} fill={K.yellow} /></g>}
      </svg>
      {p.s.note && <Fade at={v(p, 0.86)} style={{ position: "absolute", right: 0, top: 4 }}><span style={{ fontFamily: HAND, fontSize: 42, color: K.green }}>{p.s.note}</span></Fade>}
    </Box>
  );
};

// particles: from "a dozen" to "a mole" — a dot grid zooms out power by power
const SParticles: React.FC<P> = (p) => {
  const f = useCurrentFrame();
  const z = interpolate(f, [v(p, 0.3), v(p, 0.82)], [0, 1], { ...clamp, easing: Easing.in(Easing.quad) });
  const pow = Math.round(lerp(1, 23, z)), scale = Math.pow(0.12, z * 3.2);
  const levels = p.s.levels || [{ n: "১২", name: "এক ডজন", unit: "টি ডিম" }, { n: "6.023 × 10²³", name: "এক মোল", unit: "টি কণা" }];
  const cells = 9;
  return (
    <Box style={{ flexDirection: "row", gap: 60, alignItems: "center" }}>
      <div style={{ width: 720, height: 620, position: "relative", overflow: "hidden", border: `3px solid ${K.faint}`, borderRadius: 24, flex: "none" }}>
        <div style={{ position: "absolute", left: "50%", top: "50%", transform: `translate(-50%,-50%) scale(${scale})` }}>
          {Array.from({ length: 4 }, (_, L) => { const s = Math.pow(1 / 0.12, L) * 620; return <div key={L} style={{ position: "absolute", left: -s / 2, top: -s / 2, width: s, height: s, display: "grid", gridTemplateColumns: `repeat(${cells}, 1fr)`, opacity: L === 0 ? 1 : interpolate(z, [L * 0.25 - 0.15, L * 0.25], [0, 1], clamp) }}>
            {Array.from({ length: cells * cells }, (_, i) => <div key={i} style={{ display: "grid", placeItems: "center" }}><div style={{ width: s / cells * 0.42, height: s / cells * 0.42, borderRadius: "50%", background: L === 0 ? K.yellow : K.chalk, opacity: L === 0 ? 0.95 : 0.5 }} /></div>)}</div>; })}
        </div>
      </div>
      <div style={{ flex: 1 }}>
        <Head t={p.s.head || "এক মোল কতগুলো?"} />
        {levels.map((l: any, i: number) => <Fade key={i} at={v(p, i ? 0.62 : 0.08)}><div style={{ margin: "14px 0" }}><div style={{ fontFamily: HAND, fontSize: 40, color: K.yellow }}>{l.name}</div><div><Mx t={l.n} size={i ? 66 : 76} /> <span style={{ fontFamily: BN, fontSize: 38, color: K.chalk }}>{l.unit}</span></div></div></Fade>)}
        <div style={{ fontFamily: MATH, fontSize: 44, color: K.dim, marginTop: 20, opacity: z > 0.02 && z < 0.99 ? 1 : 0 }}>≈ 10<sup>{pow}</sup></div>
        {p.s.note && <Fade at={v(p, 0.85)}><div style={{ fontFamily: BN, fontSize: 36, color: K.green, marginTop: 20, lineHeight: 1.45 }}>{p.s.note}</div></Fade>}
      </div>
    </Box>
  );
};

// graph: points drop in, then the line is drawn
const SGraph: React.FC<P> = (p) => {
  const f = useCurrentFrame(); const { fps } = useVideoConfig();
  const pts: [number, number][] = p.s.points || [], X = p.s.x || { label: "x", max: 10 }, Y = p.s.y || { label: "y", max: 10 };
  const W = 1020, H = 620, sx = (x: number) => 90 + (x / X.max) * (W - 130), sy = (y: number) => H - 70 - (y / Y.max) * (H - 120);
  const line = interpolate(f, [v(p, 0.55), v(p, 0.75)], [0, 1], clamp);
  return (
    <Box style={{ flexDirection: "row", gap: 50, alignItems: "center" }}>
      <svg viewBox={`0 0 ${W} ${H}`} style={{ width: W, height: H, flex: "none", overflow: "visible" }}>
        <line x1={90} y1={H - 70} x2={W - 20} y2={H - 70} {...S} /><line x1={90} y1={H - 70} x2={90} y2={20} {...S} />
        <text x={W - 20} y={H - 20} textAnchor="end" fontFamily={BN} fontSize={32} fill={K.chalk}>{X.label}</text>
        <text x={20} y={30} fontFamily={BN} fontSize={32} fill={K.chalk}>{Y.label}</text>
        {pts.map(([x, y], i) => <g key={i} transform={`translate(${sx(x)} ${sy(y)}) scale(${Math.min(1, pop(f, fps, v(p, 0.12 + i * 0.08)))})`}><circle r={13} fill={K.yellow} /><text y={-24} textAnchor="middle" fontFamily={MATH} fontSize={26} fill={K.chalk}>({x}, {y})</text></g>)}
        {pts.length > 1 && p.s.line !== false && <line x1={sx(pts[0][0])} y1={sy(pts[0][1])} x2={lerp(sx(pts[0][0]), sx(pts[pts.length - 1][0]), line)} y2={lerp(sy(pts[0][1]), sy(pts[pts.length - 1][1]), line)} stroke={K.pink} strokeWidth={6} strokeLinecap="round" />}
      </svg>
      <div style={{ flex: 1 }}><Head t={p.s.head} />{p.s.note && <Fade at={v(p, 0.75)}><div style={{ fontFamily: BN, fontSize: 40, color: K.chalk, lineHeight: 1.5 }}><Txt t={p.s.note} size={40} /></div></Fade>}</div>
    </Box>
  );
};

const SCompare: React.FC<P> = (p) => {
  const side = (c: any, i: number) => { const tone = c.tone || (i ? "good" : "bad"), col = tone === "good" ? K.green : tone === "bad" ? K.red : K.blue;
    return <div style={{ flex: 1, border: `3px solid ${col}`, borderRadius: 24, padding: "26px 32px", background: "rgba(10,20,14,.25)" }}>
      <Fade at={v(p, i ? 0.45 : 0.06)}><div style={{ fontFamily: HAND, fontSize: 46, color: col, marginBottom: 14 }}>{tone === "good" ? "✓ " : tone === "bad" ? "✗ " : ""}{c.title}</div></Fade>
      {(c.items || []).map((x: string, k: number) => <Write key={k} at={v(p, (i ? 0.5 : 0.12) + k * 0.08)} dur={18} style={{ margin: "10px 0" }}><Txt t={x} size={40} /></Write>)}</div>; };
  return <Box>{p.s.head && <Head t={p.s.head} />}<div style={{ display: "flex", gap: 40, flex: 1 }}>{side(p.s.left || {}, 0)}{side(p.s.right || {}, 1)}</div></Box>;
};

const SMemory: React.FC<P> = (p) => {
  const f = useCurrentFrame(); const { fps } = useVideoConfig();
  return (
    <Box style={{ alignItems: "center", justifyContent: "center", textAlign: "center" }}>
      <Head t={p.s.head || "মনে রাখার কৌশল"} />
      <div style={{ transform: `rotate(-1.5deg) scale(${Math.min(1, pop(f, fps, 14))})`, background: "#FBF3C8", color: "#2B2B2B", borderRadius: 8, padding: "40px 70px", boxShadow: "0 20px 50px rgba(0,0,0,.45)", maxWidth: 1300 }}>
        <div style={{ fontFamily: SERIF, fontSize: 74, lineHeight: 1.3 }}>{p.s.big}</div>
        {(p.s.lines || []).map((x: string, i: number) => <div key={i} style={{ fontFamily: BN, fontSize: 38, marginTop: 16, opacity: interpolate(f, [v(p, 0.3 + i * 0.15), v(p, 0.3 + i * 0.15) + 10], [0, 1], clamp) }}>{plain(x)}</div>)}
      </div>
    </Box>
  );
};

const SSteps: React.FC<P> = (p) => {
  const f = useCurrentFrame(); const { fps } = useVideoConfig();
  const L: { t: string; why?: string }[] = p.s.lines || [];
  const n = L.length, start = p.s.given ? 0.16 : 0.06;
  return (
    <Box>
      <Head t={p.s.head} />
      {p.s.given && <Write at={v(p, 0.02)} dur={22} style={{ fontFamily: BN, fontSize: 40, color: K.dim, marginBottom: 18 }}>{p.s.given}</Write>}
      <div style={{ display: "grid", gap: 6 }}>
        {L.map((x, i) => {
          const at = v(p, start + ((0.92 - start) * i) / n), last = i === n - 1;
          return (
            <div key={i} style={{ display: "flex", flexWrap: "wrap", alignItems: "center", columnGap: 40, rowGap: 2 }}>
              <Write at={at} dur={20}><div style={{ display: "inline-block", padding: last ? "4px 22px" : 0, border: last ? `3px solid ${K.yellow}` : 0, borderRadius: 12, transform: last ? `scale(${0.9 + 0.1 * Math.min(1, pop(f, fps, at + 10))})` : undefined }}>
                <Mx t={x.t} size={x.t.length > 30 ? 56 : 66} at={at} step={6} /></div></Write>
              {x.why && <Fade at={at + 14}><div style={{ fontFamily: HAND, fontSize: 34, color: K.green }}>← {x.why}</div></Fade>}
            </div>);
        })}
      </div>
    </Box>
  );
};

const SMistake: React.FC<P> = (p) => {
  const f = useCurrentFrame(); const { fps } = useVideoConfig();
  const cross = interpolate(f, [v(p, 0.3), v(p, 0.4)], [0, 1], clamp);
  return (
    <Box style={{ alignItems: "center", textAlign: "center" }}>
      <Head t={p.s.head || "সাবধান! সবচেয়ে কমন ভুল"} />
      <div style={{ position: "relative", marginTop: 20 }}>
        <Write at={v(p, 0.05)} dur={22}><Txt t={p.s.wrong} size={80} /></Write>
        <svg style={{ position: "absolute", inset: "-20px -40px", width: "calc(100% + 80px)", height: "calc(100% + 40px)", overflow: "visible" }} viewBox="0 0 100 100" preserveAspectRatio="none">
          <line x1="2" y1="85" x2={2 + 96 * cross} y2={85 - 70 * cross} stroke={K.red} vectorEffect="non-scaling-stroke" style={{ strokeWidth: 10 }} />
        </svg>
        <div style={{ position: "absolute", right: -110, top: -10, fontFamily: MATH, fontSize: 90, color: K.red, transform: `scale(${pop(f, fps, v(p, 0.38))})` }}>✗</div>
      </div>
      <div style={{ position: "relative", marginTop: 60 }}>
        <Write at={v(p, 0.5)} dur={24}><Txt t={p.s.right} size={80} /></Write>
        <div style={{ position: "absolute", right: -110, top: -10, fontFamily: MATH, fontSize: 90, color: K.green, transform: `scale(${pop(f, fps, v(p, 0.62))})` }}>✓</div>
      </div>
      {p.s.why && <Fade at={v(p, 0.7)} style={{ marginTop: 50 }}><div style={{ fontFamily: BN, fontSize: 38, color: K.dim, maxWidth: 1300, lineHeight: 1.5 }}>{plain(p.s.why)}</div></Fade>}
    </Box>
  );
};

const SQuiz: React.FC<P & { answer?: boolean }> = (p) => {
  const f = useCurrentFrame(); const { fps } = useVideoConfig();
  const o: string[] = p.s.o || [], ans = p.answer, a = p.s.a;
  const total = p.vo + (p.s.hold || 0), left = Math.max(0, Math.ceil((LEAD + total - f) / fps));
  return (
    <Box>
      <div style={{ display: "flex", alignItems: "baseline", gap: 24 }}>
        <Head t={ans ? "উত্তর" : "এবার তোমার পালা!"} />
        {!ans && p.s.hold ? <div style={{ marginLeft: "auto", fontFamily: HAND, fontSize: 64, color: K.yellow }}>{bn(left)}</div> : null}
      </div>
      <Write at={6} dur={22} style={{ marginBottom: 34 }}><Txt t={p.s.q} size={50} /></Write>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 22 }}>
        {o.map((x, i) => {
          const ok = ans && i === a, dim = ans && i !== a;
          return (
            <Fade key={i} at={14 + i * 6}>
              <div style={{ display: "flex", alignItems: "center", gap: 22, padding: "20px 26px", borderRadius: 18, border: `3px solid ${ok ? K.green : K.faint}`, background: ok ? "rgba(168,230,161,.12)" : "transparent", opacity: dim ? 0.4 : 1, transform: ok ? `scale(${0.95 + 0.05 * Math.min(1, pop(f, fps, 10))})` : undefined }}>
                <span style={{ width: 58, height: 58, borderRadius: "50%", border: `3px solid ${ok ? K.green : K.chalk}`, background: ok ? K.green : "transparent", color: ok ? K.board : K.chalk, display: "grid", placeItems: "center", fontFamily: BN, fontSize: 32, fontWeight: 700, flex: "none" }}>{"কখগঘ"[i]}</span>
                <Txt t={x} size={46} />
              </div>
            </Fade>);
        })}
      </div>
      {ans && p.s.ex && <Fade at={v(p, 0.35)} style={{ marginTop: 34 }}><div style={{ fontFamily: BN, fontSize: 38, color: K.dim, lineHeight: 1.5 }}><span style={{ fontFamily: HAND, color: K.yellow }}>কারণ: </span>{plain(p.s.ex)}</div></Fade>}
    </Box>
  );
};

const SRecap: React.FC<P> = (p) => {
  const it: string[] = p.s.items || [];
  return (
    <Box>
      <Head t={p.s.head || "আজ যা শিখলাম"} />
      {it.map((x, i) => (
        <Write key={i} at={v(p, 0.06 + (0.8 * i) / it.length)} dur={22} style={{ display: "flex", gap: 22, alignItems: "center", margin: "14px 0" }}>
          <span style={{ fontFamily: MATH, fontSize: 52, color: K.green }}>✓</span><Txt t={x} size={50} />
        </Write>
      ))}
    </Box>
  );
};

const SOutro: React.FC<P> = (p) => (
  <Box style={{ alignItems: "center", justifyContent: "center", textAlign: "center" }}>
    <Write at={4} dur={22} style={{ fontFamily: HAND, fontSize: 64, color: K.yellow }}>{p.s.head || "পরের পাঠে দেখা হবে!"}</Write>
    {p.spec.next && <Fade at={20}><div style={{ fontFamily: SERIF, fontSize: 60, color: K.chalk, margin: "26px 0 40px" }}>পরের পাঠ: {p.spec.next}</div></Fade>}
    <Fade at={34}><div style={{ fontFamily: BN, fontSize: 40, color: K.dim }}>অনুশীলন আর এআই শিক্ষক — <span style={{ color: K.chalk, fontWeight: 700 }}>aiuniversitybd.com/academy</span></div></Fade>
  </Box>
);

export const SCENES = ["title", "hook", "predict", "lab", "morph", "points", "formula", "area", "cube", "molecule", "molemap", "particles", "graph", "compare", "memory", "steps", "mistake", "quizQ", "quizA", "recap", "outro"];
const MAP: Record<string, React.FC<any>> = { title: STitle, hook: SHook, predict: SPredict, lab: SLab, morph: SMorph, points: SPoints, formula: SFormula, area: SArea, cube: SCube, molecule: SMolecule, molemap: SMoleMap,
  particles: SParticles, graph: SGraph, compare: SCompare, memory: SMemory, steps: SSteps, mistake: SMistake, quizQ: SQuiz, quizA: (p: P) => <SQuiz {...p} answer />, recap: SRecap, outro: SOutro };

/* ---------- frame chrome ---------- */
const Chrome: React.FC<{ spec: Spec; starts: number[] }> = ({ spec, starts }) => {
  const f = useCurrentFrame(); const k = starts.filter((s) => f >= s).length;
  return (
    <>
      <div style={{ position: "absolute", left: 70, top: 46, display: "flex", alignItems: "center", gap: 18 }}>
        <Img src={staticFile("academy/_brand/aiu-logo-dark.svg")} style={{ height: 40 }} />
        <div style={{ fontFamily: HAND, fontSize: 34, color: K.yellow }}>একাডেমি</div>
        <div style={{ fontFamily: BN, fontSize: 26, color: K.dim }}>· {spec.course} · {spec.lessonNo}</div>
      </div>
      <div style={{ position: "absolute", right: 70, top: 62, display: "flex", gap: 10 }}>
        {starts.map((_, i) => <div key={i} style={{ width: 14, height: 14, borderRadius: "50%", background: i < k ? K.chalk : "transparent", border: `2px solid ${K.dim}`, opacity: i === k - 1 ? 1 : 0.6 }} />)}
      </div>
      <div style={{ position: "absolute", right: 70, bottom: 120, fontFamily: BN, fontSize: 20, color: K.dim }}>এআই শিক্ষক · এআই কণ্ঠ</div>
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
  const o = Math.min(interpolate(f, [0, 10], [0, 1], clamp), interpolate(f, [len - 12, len], [1, 0], clamp));
  return <AbsoluteFill style={{ opacity: o, filter: `blur(${(1 - o) * 3}px)` }}>{children}</AbsoluteFill>;
};
const SFX: Record<string, string> = { quizA: "chime", outro: "chime", predict: "pop", lab: "whoosh", cube: "swell", molecule: "pop" };

export const AcademyVideo: React.FC<{ spec: Spec; noAudio?: boolean }> = ({ spec, noAudio }) => {
  const f = useCurrentFrame();
  const lens = spec.scenes.map(sceneLen);
  const starts = lens.reduce<number[]>((a, _, i) => [...a, i ? a[i - 1] + lens[i - 1] : 15], []);
  const chunks = subChunks(spec, starts);
  const cur = chunks.find((x) => f >= x.from && f < x.to + 4);
  const total = academyLen(spec);
  const busy = (fr: number) => spec.scenes.some((s, i) => fr >= starts[i] + LEAD - 6 && fr <= starts[i] + LEAD + s.frames + 4);
  return (
    <AbsoluteFill style={{ background: K.wood }}>
      <AbsoluteFill style={{ inset: 22, borderRadius: 10, background: `radial-gradient(120% 90% at 30% 20%, #2C4D3C 0%, ${K.board} 45%, ${K.board2} 100%)`, boxShadow: `inset 0 0 0 4px ${K.wood2}, inset 0 0 120px rgba(0,0,0,.45)` }} />
      <AbsoluteFill style={{ inset: 22, borderRadius: 10, opacity: 0.08, backgroundImage: "repeating-linear-gradient(115deg, rgba(255,255,255,.5) 0 1px, transparent 1px 7px), repeating-linear-gradient(25deg, rgba(255,255,255,.35) 0 1px, transparent 1px 11px)" }} />
      <div style={{ position: "absolute", left: 22, right: 22, bottom: 22, height: 26, background: `linear-gradient(${K.wood}, ${K.wood2})`, borderTop: "2px solid rgba(0,0,0,.25)" }}>
        <div style={{ position: "absolute", left: 300, top: -9, width: 90, height: 16, borderRadius: 4, background: "#F4F1E8" }} /><div style={{ position: "absolute", left: 420, top: -8, width: 60, height: 14, borderRadius: 4, background: K.yellow }} />
      </div>
      {spec.scenes.map((s, i) => {
        const Sc = MAP[s.type] || SPoints; const len = lens[i];
        return (
          <Sequence key={i} from={starts[i]} durationInFrames={len}>
            <SceneFade len={len}><Sc s={s} spec={spec} vo={s.frames} /></SceneFade>
            {!noAudio && <Sequence from={LEAD}><Audio src={staticFile(`academy/${spec.id}/vo/${String(i + 1).padStart(2, "0")}.mp3`)} /></Sequence>}
            {!noAudio && <Sequence from={0}><Audio src={staticFile(`aiu2/${i === 0 ? "swell" : SFX[s.type] || "whoosh"}.mp3`)} volume={0.22} /></Sequence>}
          </Sequence>
        );
      })}
      <Chrome spec={spec} starts={starts} />
      {cur && <div style={{ position: "absolute", left: 0, right: 0, bottom: 60, display: "flex", justifyContent: "center", opacity: interpolate(f, [cur.from, cur.from + 5, cur.to, cur.to + 4], [0, 1, 1, 0], clamp) }}><div style={{ maxWidth: 1500, padding: "8px 26px 12px", borderRadius: 12, background: "rgba(10,20,14,.78)", fontFamily: BN, fontSize: 34, fontWeight: 500, color: "#fff", textAlign: "center", lineHeight: 1.35 }}>{cur.s.replace(/[।,]$/, "")}</div></div>}
      {!noAudio && <Audio src={staticFile("aiu2/music.mp3")} volume={(fr) => (busy(fr) ? 0.04 : 0.12) * interpolate(fr, [0, 30, total - 60, total], [0, 1, 1, 0], clamp)} />}
    </AbsoluteFill>
  );
};
