// AI University চাকরি প্রস্তুতি — "পরীক্ষার হল" lesson engine (2026-11-15). New look, separate from the chalkboard (academy), GDS and Excel engines:
// graphite exam desk at night, cream question paper with red margin, amber exam-clock accent, real OMR sheet, stopwatch, red-pen trap stamp.
// One spec per lesson: src/jobprep/specs/<id>.json, timed by scripts/jobprep_make.py (Bangla VO via OpenRouter Tanvir).
// Scenes: hook · title · question · trap · steps · bars · formula · race · omr · marking · quizQ · quizA · recap · outro
import React from "react";
import { AbsoluteFill, Audio, Img, Sequence, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig, Easing, delayRender, continueRender } from "remotion";

const K = {
  desk: "#0F1217", desk2: "#1A1F28", ink: "#18233F", paper: "#FBF6E9", paper2: "#F1EAD6", rule: "rgba(40,70,140,.13)", margin: "#E2564B",
  amber: "#FFB020", amber2: "#FFCF6B", red: "#FF4D4D", green: "#22C55E", blue: "#3B82F6", txt: "#F3F5FA", dim: "rgba(243,245,250,.62)", faint: "rgba(243,245,250,.14)",
  omr: "#D9475E", omrBg: "#FFF4F4",
};
const BN = "Anek", SERIF = "Tiro", MATH = "Cambria, 'Cambria Math', Georgia, serif";
if (typeof document !== "undefined") {
  for (const [n, u] of [["Anek", "fonts/AnekBangla.ttf"], ["Tiro", "fonts/TiroBangla-Regular.ttf"]]) {
    const h = delayRender(`font ${n}`);
    const f = new FontFace(n, `url(${staticFile(u)})`, { weight: "100 900" });
    f.load().then(() => { document.fonts.add(f); continueRender(h); }).catch(() => continueRender(h));
  }
}
const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const ease = Easing.bezier(0.16, 1, 0.3, 1);
const bn = (n: number | string) => String(n).replace(/\d/g, (d) => "০১২৩৪৫৬৭৮৯"[+d]);
const pop = (f: number, fps: number, d: number, damping = 14) => spring({ frame: f - d, fps, config: { damping, mass: 0.6 } });
const OPT = "কখগঘ";

export type Scene = { type: string; vo: string; frames: number; hold?: number; [k: string]: any };
export type Spec = { id: string; course: string; part: string; lessonNo: string; title: string; next: string; scenes: Scene[] };
const LEAD = 14, TAIL = 16;
const sceneLen = (s: Scene) => LEAD + s.frames + (s.hold || 0) + TAIL;
export const jobLen = (spec: Spec) => spec.scenes.reduce((n, s) => n + sceneLen(s), 0) + 36;
type P = { s: Scene; spec: Spec; vo: number };
const v = (p: P, x: number) => LEAD + p.vo * x;
const COL: Record<string, string> = { a: K.amber, r: K.red, g: K.green, b: K.blue, i: K.ink, m: K.margin };

/* ---------- primitives ---------- */
const In: React.FC<{ at: number; children: React.ReactNode; style?: React.CSSProperties; y?: number; x?: number }> = ({ at, children, style, y = 18, x = 0 }) => {
  const f = useCurrentFrame(); const o = interpolate(f, [at, at + 14], [0, 1], { ...clamp, easing: ease });
  return <div style={{ opacity: o, transform: `translate(${(1 - o) * x}px, ${(1 - o) * y}px)`, ...style }}>{children}</div>;
};
// written left→right (pen on paper)
const Pen: React.FC<{ at: number; dur?: number; children: React.ReactNode; style?: React.CSSProperties }> = ({ at, dur = 18, children, style }) => {
  const f = useCurrentFrame(); const x = interpolate(f, [at, at + dur], [0, 100], { ...clamp, easing: Easing.inOut(Easing.quad) });
  return <div style={{ clipPath: `inset(-24px ${100 - x}% -24px -24px)`, ...style }}>{children}</div>;
};
// "[a:20] + [r:(−20)]" colour marks; Latin math in a maths serif, Bangla in Anek
const Mx: React.FC<{ t: string; size?: number; color?: string; at?: number; step?: number; font?: string; wrap?: boolean }> = ({ t, size = 60, color = K.txt, at = 0, step = 0, font, wrap }) => {
  const f = useCurrentFrame(); let k = 0;
  const parts = String(t).split(/(\[[a-z]:[^\]]+\])/).filter(Boolean);
  return <span style={{ fontFamily: font || `${MATH}, ${BN}`, fontSize: size, color, whiteSpace: wrap ? "normal" : "pre", lineHeight: 1.35 }}>{parts.map((x, i) => {
    const m = x.match(/^\[([a-z]):([^\]]+)\]$/);
    if (!m) return <span key={i}>{x}</span>;
    const d = at + step * k++, o = step ? interpolate(f, [d, d + 10], [0, 1], clamp) : 1;
    return <span key={i} style={{ color: COL[m[1]] || color, opacity: o, fontWeight: 700 }}>{m[2]}</span>;
  })}</span>;
};
const Kicker: React.FC<{ t: string; at?: number; color?: string }> = ({ t, at = 2, color = K.amber }) => (
  <In at={at}><div style={{ display: "inline-flex", alignItems: "center", gap: 14, fontFamily: BN, fontWeight: 600, fontSize: 30, color }}>
    <span style={{ width: 34, height: 4, borderRadius: 2, background: color }} />{t}</div></In>
);
const H: React.FC<{ t: string; at?: number; size?: number }> = ({ t, at = 6, size = 66 }) => (
  <Pen at={at} dur={18} style={{ fontFamily: BN, fontWeight: 800, fontSize: size, color: K.txt, lineHeight: 1.25, marginTop: 10 }}>{t}</Pen>
);
const Stage: React.FC<{ children: React.ReactNode; style?: React.CSSProperties }> = ({ children, style }) => (
  <div style={{ position: "absolute", left: 130, right: 130, top: 150, bottom: 180, display: "flex", flexDirection: "column", ...style }}>{children}</div>
);

// question paper sheet
const Paper: React.FC<{ children: React.ReactNode; style?: React.CSSProperties; label?: string; tilt?: number }> = ({ children, style, label, tilt = -0.6 }) => (
  <div style={{ position: "relative", background: `repeating-linear-gradient(180deg, transparent 0 61px, ${K.rule} 61px 63px), linear-gradient(180deg, ${K.paper}, ${K.paper2})`, borderRadius: 10, padding: "70px 60px 50px 110px", transform: `rotate(${tilt}deg)`,
    boxShadow: "0 30px 70px rgba(0,0,0,.55), 0 2px 0 rgba(255,255,255,.6) inset", ...style }}>
    <div style={{ position: "absolute", left: 78, top: 0, bottom: 0, width: 3, background: K.margin, opacity: 0.55 }} />
    {label && <div style={{ position: "absolute", left: 110, right: 40, top: 18, display: "flex", justifyContent: "space-between", fontFamily: BN, fontSize: 22, fontWeight: 600, color: "rgba(24,35,63,.55)" }}><span>{label}</span><span>AI University</span></div>}
    {children}
  </div>
);
// stopwatch: shows `sec` seconds; ring = part of `of`
const Watch: React.FC<{ sec: number; of: number; size?: number; warn?: boolean }> = ({ sec, of, size = 420, warn }) => {
  const R = 44, C = 2 * Math.PI * R, part = Math.max(0, Math.min(1, sec / of));
  const col = warn && sec <= of * 0.25 ? K.red : K.amber;
  return (
    <svg width={size} height={size * 1.12} viewBox="0 -12 100 112" style={{ overflow: "visible", filter: "drop-shadow(0 26px 40px rgba(0,0,0,.5))" }}>
      <rect x="44" y="-11" width="12" height="9" rx="2" fill="#C9CED8" /><rect x="40" y="-14" width="20" height="5" rx="2.5" fill="#E7EAF0" />
      <rect x="82" y="4" width="8" height="6" rx="2" fill="#C9CED8" transform="rotate(40 86 7)" />
      <circle cx="50" cy="50" r="49" fill="#202633" stroke="#3A4254" strokeWidth="1.5" />
      <circle cx="50" cy="50" r={R} fill="#151A23" />
      {Array.from({ length: 60 }, (_, i) => { const a = (i / 60) * 2 * Math.PI, l = i % 5 ? 2.2 : 4.5; return <line key={i} x1={50 + Math.sin(a) * (R - 1)} y1={50 - Math.cos(a) * (R - 1)} x2={50 + Math.sin(a) * (R - 1 - l)} y2={50 - Math.cos(a) * (R - 1 - l)} stroke={i % 5 ? "rgba(255,255,255,.25)" : "rgba(255,255,255,.6)"} strokeWidth={i % 5 ? 0.5 : 0.9} />; })}
      <circle cx="50" cy="50" r={R - 7} fill="none" stroke={col} strokeOpacity={0.15} strokeWidth="3.5" />
      <circle cx="50" cy="50" r={R - 7} fill="none" stroke={col} strokeWidth="3.5" strokeLinecap="round" strokeDasharray={2 * Math.PI * (R - 7)} strokeDashoffset={2 * Math.PI * (R - 7) * (1 - part)} transform="rotate(-90 50 50)" />
      <text x="50" y="58" textAnchor="middle" fontFamily={BN} fontWeight={800} fontSize="26" fill={K.txt}>{bn(Math.ceil(sec))}</text>
      <text x="50" y="70" textAnchor="middle" fontFamily={BN} fontWeight={500} fontSize="6.5" fill={K.dim}>সেকেন্ড</text>
      <circle cx="50" cy="50" r="0.1" fill="none" data-c={C} />
    </svg>
  );
};
// one OMR bubble; fill 0..1 (graphite)
const Bubble: React.FC<{ l: string; fill?: number; size?: number; mark?: "tick" | "light" | "double"; ok?: boolean }> = ({ l, fill = 0, size = 64, mark }) => (
  <div style={{ position: "relative", width: size, height: size, borderRadius: "50%", border: `3px solid ${K.omr}`, display: "grid", placeItems: "center", fontFamily: BN, fontWeight: 600, fontSize: size * 0.46, color: K.omr, background: "#fff", flex: "none" }}>
    {l}
    {fill > 0 && <div style={{ position: "absolute", inset: 3, borderRadius: "50%", background: "radial-gradient(circle at 40% 35%, #4A4E57, #1E2128 70%)", clipPath: `circle(${fill * 52}% at 50% 50%)` }} />}
    {mark === "tick" && <div style={{ position: "absolute", fontFamily: MATH, fontSize: size * 0.9, color: "#2A2D33", top: -size * 0.25 }}>✓</div>}
    {mark === "light" && <div style={{ position: "absolute", inset: 3, borderRadius: "50%", background: "rgba(40,44,52,.28)" }} />}
  </div>
);
// red-pen circle drawn around a box
const PenCircle: React.FC<{ p: number; color?: string }> = ({ p, color = K.red }) => (
  <svg style={{ position: "absolute", inset: "-22px -30px", width: "calc(100% + 60px)", height: "calc(100% + 44px)", overflow: "visible", pointerEvents: "none" }} viewBox="0 0 100 100" preserveAspectRatio="none">
    <path d="M6 52 C 4 18, 40 4, 60 6 S 98 22, 96 50 S 70 96, 44 95 S 2 80, 8 44" fill="none" stroke={color} strokeWidth="2.4" vectorEffect="non-scaling-stroke" style={{ strokeWidth: 6 }} pathLength={1} strokeDasharray={1} strokeDashoffset={1 - p} strokeLinecap="round" />
  </svg>
);
const Stamp: React.FC<{ t: string; at: number; color?: string; style?: React.CSSProperties }> = ({ t, at, color = K.red, style }) => {
  const f = useCurrentFrame(); const { fps } = useVideoConfig(); const s = pop(f, fps, at, 9);
  if (f < at) return null;
  return <div style={{ position: "absolute", transform: `rotate(-12deg) scale(${2.2 - 1.2 * Math.min(1, s)})`, opacity: Math.min(1, s * 1.5), border: `6px solid ${color}`, color, borderRadius: 14, padding: "4px 26px 8px", fontFamily: BN, fontWeight: 800, fontSize: 64, background: "rgba(255,255,255,.04)", boxShadow: `0 0 0 3px ${color}33 inset`, ...style }}>{t}</div>;
};

/* ---------- scenes ---------- */
const SHook: React.FC<P> = (p) => {
  const f = useCurrentFrame(); const { fps } = useVideoConfig();
  const from = p.s.from || 36, sec = interpolate(f, [v(p, 0.55), v(p, 0.98)], [from, 0], clamp);
  const stats: [string, string, boolean][] = p.s.stats || [];
  return (
    <Stage style={{ flexDirection: "row", alignItems: "center", gap: 110 }}>
      <div style={{ flex: "none", transform: `scale(${0.85 + 0.15 * Math.min(1, pop(f, fps, 4))}) rotate(${interpolate(f, [0, 300], [-3, 2], clamp)}deg)` }}><Watch sec={sec} of={from} size={430} warn /></div>
      <div style={{ flex: 1 }}>
        <Kicker t={p.s.kicker} />
        <H t={p.s.head} size={84} />
        <div style={{ display: "flex", gap: 22, marginTop: 50 }}>
          {stats.map(([n, l, hi], i) => (
            <In key={i} at={v(p, 0.18 + i * 0.13)} style={{ flex: 1 }}>
              <div style={{ borderRadius: 22, padding: "26px 26px 22px", background: hi ? K.amber : "rgba(255,255,255,.05)", border: `2px solid ${hi ? K.amber : K.faint}`, color: hi ? "#1B1300" : K.txt }}>
                <div style={{ fontFamily: BN, fontWeight: 800, fontSize: 76, lineHeight: 1 }}>{n}</div>
                <div style={{ fontFamily: BN, fontWeight: 500, fontSize: 30, marginTop: 12, opacity: hi ? 0.85 : 0.7 }}>{l}</div>
              </div>
            </In>))}
        </div>
        {p.s.src && <In at={v(p, 0.6)}><div style={{ fontFamily: BN, fontSize: 22, color: K.dim, marginTop: 22 }}>সূত্র: {p.s.src}</div></In>}
      </div>
    </Stage>
  );
};

const STitle: React.FC<P> = (p) => {
  const f = useCurrentFrame();
  return (
    <Stage style={{ justifyContent: "center" }}>
      <Kicker t={p.s.kicker || `${p.spec.part} · ${p.spec.lessonNo}`} />
      <Pen at={10} dur={26} style={{ fontFamily: BN, fontWeight: 800, fontSize: 124, color: K.txt, lineHeight: 1.15, margin: "22px 0 8px" }}>{p.s.title || p.spec.title}</Pen>
      {p.s.sub && <In at={v(p, 0.35)}><div style={{ fontFamily: BN, fontSize: 40, color: K.dim, maxWidth: 1300, lineHeight: 1.45 }}>{p.s.sub}</div></In>}
      <div style={{ display: "flex", gap: 18, marginTop: 70 }}>
        {Array.from({ length: 12 }, (_, i) => { const at = 26 + i * 4; const fl = interpolate(f, [at, at + 8], [0, 1], clamp); return (
          <In key={i} at={at - 8} y={10}><Bubble l={OPT[i % 4]} size={52} fill={i % 4 === (i * 7) % 4 ? fl : 0} /></In>); })}
      </div>
    </Stage>
  );
};

const Options: React.FC<{ o: string[]; at: number; ans?: number; size?: number; hi?: number; dimOthers?: boolean }> = ({ o, at, ans, size = 46, hi, dimOthers }) => {
  const f = useCurrentFrame(); const { fps } = useVideoConfig();
  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px 40px", marginTop: 34 }}>
      {o.map((x, i) => {
        const ok = ans === i, dim = dimOthers && ans !== undefined && !ok;
        return (
          <In key={i} at={at + i * 5} y={10}>
            <div style={{ position: "relative", display: "flex", alignItems: "center", gap: 20, padding: "12px 18px", borderRadius: 14, background: ok ? "rgba(34,197,94,.14)" : hi === i ? "rgba(255,176,32,.16)" : "transparent", opacity: dim ? 0.35 : 1, transform: ok ? `scale(${0.96 + 0.04 * Math.min(1, pop(f, fps, at))})` : undefined }}>
              <span style={{ width: 56, height: 56, borderRadius: "50%", border: `3px solid ${ok ? K.green : K.ink}`, background: ok ? K.green : "transparent", color: ok ? "#fff" : K.ink, display: "grid", placeItems: "center", fontFamily: BN, fontWeight: 700, fontSize: 30, flex: "none" }}>{OPT[i]}</span>
              <span style={{ fontFamily: SERIF, fontSize: size, color: K.ink }}>{x}</span>
            </div>
          </In>);
      })}
    </div>
  );
};

const SQuestion: React.FC<P & { quiz?: boolean; answer?: boolean }> = (p) => {
  const f = useCurrentFrame(); const { fps } = useVideoConfig();
  const hold = p.s.hold || 0, cdFrom = Math.round(hold / fps);
  const sec = hold ? interpolate(f, [LEAD + p.vo, LEAD + p.vo + hold], [cdFrom, 0], clamp) : 0;
  const label = p.s.label || (p.quiz ? "অনুশীলন · নিজে করুন" : "প্রশ্ন");
  return (
    <Stage style={{ flexDirection: "row", alignItems: "center", gap: 70 }}>
      <div style={{ flex: 1 }}>
        <In at={2} y={40}>
          <Paper label={label}>
            <div style={{ fontFamily: SERIF, fontSize: 50, color: K.ink, lineHeight: 1.55 }}><b style={{ fontFamily: BN }}>{bn(p.s.no || 1)}. </b>{p.s.q}</div>
            <Options o={p.s.o || []} at={16} ans={p.answer ? p.s.a : undefined} dimOthers={p.answer} />
            {p.answer && p.s.ex && <In at={v(p, 0.22)}><div style={{ marginTop: 26, padding: "18px 24px", borderRadius: 14, background: "rgba(24,35,63,.06)", borderLeft: `6px solid ${K.green}` }}><Mx t={p.s.ex} size={40} color={K.ink} wrap /></div></In>}
          </Paper>
        </In>
      </div>
      {!p.answer && (
        <div style={{ flex: "none", width: 380, textAlign: "center" }}>
          <In at={v(p, 0.4)}>
            <Watch sec={hold ? sec : cdFrom} of={Math.max(1, cdFrom)} size={330} warn />
            <div style={{ fontFamily: BN, fontWeight: 700, fontSize: 36, color: K.amber, marginTop: 6 }}>{p.s.tryText || "ভিডিও থামিয়ে চেষ্টা করুন"}</div>
          </In>
        </div>
      )}
      {p.answer && <Stamp t="সঠিক ✓" at={v(p, 0.08)} color={K.green} style={{ right: 30, bottom: -10 }} />}
    </Stage>
  );
};

const STrap: React.FC<P> = (p) => {
  const f = useCurrentFrame();
  const circ = interpolate(f, [v(p, 0.18), v(p, 0.3)], [0, 1], clamp);
  return (
    <Stage style={{ flexDirection: "row", alignItems: "center", gap: 80 }}>
      <div style={{ flex: 1.1 }}>
        <Paper label="সবচেয়ে বেশি মানুষ যেটা দাগান" tilt={0.5}>
          <div style={{ position: "relative", display: "inline-flex", alignItems: "center", gap: 22, padding: "10px 16px" }}>
            <span style={{ width: 60, height: 60, borderRadius: "50%", border: `3px solid ${K.ink}`, display: "grid", placeItems: "center", fontFamily: BN, fontWeight: 700, fontSize: 32, color: K.ink }}>{OPT[p.s.trap]}</span>
            <span style={{ fontFamily: SERIF, fontSize: 64, color: K.ink }}>{p.s.o}</span>
            <PenCircle p={circ} color={K.amber} />
          </div>
          <div style={{ fontFamily: SERIF, fontSize: 40, color: "rgba(24,35,63,.7)", marginTop: 30 }}>{p.s.think}</div>
          <Stamp t="ফাঁদ!" at={v(p, 0.36)} style={{ right: 50, top: 60 }} />
        </Paper>
      </div>
      <div style={{ flex: 1 }}>
        <Kicker t="পরীক্ষকের ফাঁদ" color={K.red} at={v(p, 0.3)} />
        <In at={v(p, 0.42)}><div style={{ marginTop: 26 }}><Mx t={p.s.big} size={p.s.bigSize || 84} wrap /></div></In>
        <In at={v(p, 0.6)}><div style={{ fontFamily: BN, fontSize: 40, color: K.dim, lineHeight: 1.5, marginTop: 28 }}>{p.s.why}</div></In>
      </div>
    </Stage>
  );
};

// long-way working on paper, line by line, with a step counter
const SSteps: React.FC<P> = (p) => {
  const f = useCurrentFrame(); const { fps } = useVideoConfig();
  const L: { t: string; why?: string }[] = p.s.lines || []; const n = L.length;
  const at = (i: number) => v(p, 0.05 + (0.86 * i) / n);
  const done = L.filter((_, i) => f >= at(i)).length;
  return (
    <Stage style={{ flexDirection: "row", gap: 70, alignItems: "center" }}>
      <div style={{ flex: 1 }}>
        <Paper label={p.s.head} style={{ paddingTop: 84, paddingBottom: 60 }} tilt={-0.4}>
          {L.map((x, i) => { const last = i === n - 1; return (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: 30, height: 63, marginBottom: 0 }}>
              <Pen at={at(i)} dur={22}><div style={{ display: "inline-block", padding: last ? "0 16px" : 0, borderRadius: 10, border: last ? `3px solid ${K.margin}` : 0, transform: last ? `scale(${0.9 + 0.1 * Math.min(1, pop(f, fps, at(i) + 14))})` : undefined }}><Mx t={x.t} size={44} color={K.ink} font={`${SERIF}, ${MATH}`} /></div></Pen>
              {x.why && <In at={at(i) + 16} x={-10} y={0}><span style={{ fontFamily: BN, fontSize: 28, color: "rgba(24,35,63,.55)" }}>← {x.why}</span></In>}
            </div>); })}
        </Paper>
      </div>
      <div style={{ flex: "none", width: 330, display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", gap: 18 }}>
        <div style={{ fontFamily: BN, fontWeight: 600, fontSize: 32, color: K.dim }}>{p.s.side || "লম্বা পথ"}</div>
        <div style={{ fontFamily: BN, fontWeight: 800, fontSize: 150, color: K.amber, lineHeight: 1 }}>{bn(done)}<span style={{ fontSize: 60, color: K.dim }}>/{bn(n)}</span></div>
        <div style={{ fontFamily: BN, fontSize: 32, color: K.dim }}>ধাপ</div>
        <div style={{ display: "flex", gap: 8, marginTop: 10 }}>{L.map((_, i) => <div key={i} style={{ width: 36, height: 8, borderRadius: 4, background: i < done ? K.amber : K.faint }} />)}</div>
      </div>
    </Stage>
  );
};

// bar model: base → after first change → after second change
const SBars: React.FC<P> = (p) => {
  const f = useCurrentFrame();
  const B: { label: string; base: number; add?: number; cut?: number; val: string; note?: string }[] = p.s.bars || [];
  const max = Math.max(...B.map((b) => b.base + (b.add || 0)));
  const W = 1180;
  return (
    <Stage>
      <Kicker t={p.s.kicker || "ছবিতে বুঝি"} />
      <H t={p.s.head} />
      <div style={{ marginTop: 50, display: "grid", gap: 36 }}>
        {B.map((b, i) => {
          const at = v(p, 0.1 + i * 0.25), g = interpolate(f, [at, at + 22], [0, 1], { ...clamp, easing: ease });
          const g2 = interpolate(f, [at + 18, at + 36], [0, 1], { ...clamp, easing: ease });
          const keep = b.base - (b.cut || 0);
          return (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: 30, opacity: interpolate(f, [at - 6, at + 4], [0, 1], clamp) }}>
              <div style={{ width: 300, fontFamily: BN, fontWeight: 600, fontSize: 34, color: K.dim, textAlign: "right" }}>{b.label}</div>
              <div style={{ position: "relative", width: W, height: 86 }}>
                <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: (W * keep / max) * g, borderRadius: "14px 0 0 14px", background: "linear-gradient(180deg,#E9EDF5,#C6CDDB)" }} />
                {b.add ? <div style={{ position: "absolute", left: W * b.base / max, top: 0, bottom: 0, width: (W * b.add / max) * g2, borderRadius: "0 14px 14px 0", background: K.green, boxShadow: `0 0 30px ${K.green}66` }}><div style={{ position: "absolute", inset: 0, display: "grid", placeItems: "center", fontFamily: BN, fontWeight: 800, fontSize: 36, color: "#05250F", opacity: g2 }}>+{bn(b.add)}</div></div> : null}
                {b.cut ? <div style={{ position: "absolute", left: W * keep / max, top: 0, bottom: 0, width: (W * b.cut / max) * g2, borderRadius: "0 14px 14px 0", background: `repeating-linear-gradient(135deg, ${K.red} 0 10px, ${K.red}AA 10px 20px)`, opacity: 0.9 }}><div style={{ position: "absolute", inset: 0, display: "grid", placeItems: "center", fontFamily: BN, fontWeight: 800, fontSize: 36, color: "#fff", opacity: g2 }}>−{bn(b.cut)}</div></div> : null}
                <div style={{ position: "absolute", left: 24, top: 0, bottom: 0, display: "flex", alignItems: "center", fontFamily: BN, fontWeight: 800, fontSize: 42, color: K.ink, opacity: g }}>{b.val}</div>
              </div>
              {b.note && <In at={at + 30} x={-14} y={0}><div style={{ fontFamily: BN, fontSize: 30, color: b.cut ? K.red : K.green, width: 150 }}>{b.note}</div></In>}
            </div>);
        })}
      </div>
      {p.s.foot && <In at={v(p, 0.8)} style={{ marginTop: 44 }}><div style={{ fontFamily: BN, fontSize: 40, color: K.txt }}>{p.s.foot}</div></In>}
    </Stage>
  );
};

const SFormula: React.FC<P> = (p) => {
  const f = useCurrentFrame(); const { fps } = useVideoConfig();
  const glow = 0.5 + 0.5 * Math.sin(f / 9);
  return (
    <Stage style={{ alignItems: "center", justifyContent: "center", textAlign: "center" }}>
      <Kicker t={p.s.kicker || "শর্টকাট সূত্র"} />
      <div style={{ marginTop: 40, padding: "54px 80px", borderRadius: 32, background: "linear-gradient(180deg, rgba(255,176,32,.14), rgba(255,176,32,.04))", border: `3px solid ${K.amber}`, boxShadow: `0 0 ${40 + glow * 30}px rgba(255,176,32,.25)`, transform: `scale(${0.9 + 0.1 * Math.min(1, pop(f, fps, 6))})` }}>
        <div style={{ fontFamily: BN, fontWeight: 600, fontSize: 40, color: K.amber2, marginBottom: 20 }}>{p.s.lhs}</div>
        <Pen at={16} dur={30}><Mx t={p.s.formula} size={104} at={30} step={10} /></Pen>
      </div>
      <div style={{ display: "flex", gap: 30, marginTop: 56 }}>
        {(p.s.legend || []).map((x: string, i: number) => (
          <In key={i} at={v(p, 0.45 + i * 0.12)}><div style={{ padding: "16px 30px", borderRadius: 16, background: "rgba(255,255,255,.06)", border: `2px solid ${K.faint}` }}><Mx t={x} size={40} /></div></In>))}
      </div>
    </Stage>
  );
};

// long way vs shortcut, side by side
const SRace: React.FC<P> = (p) => {
  const f = useCurrentFrame(); const { fps } = useVideoConfig();
  const L: string[] = p.s.long || [], S: string[] = p.s.short || [];
  const la = (i: number) => v(p, 0.08 + (0.8 * i) / L.length), sa = (i: number) => v(p, 0.1 + (0.4 * i) / S.length);
  const sDone = sa(S.length - 1) + 22, lDone = la(L.length - 1) + 22;
  const Col: React.FC<{ title: string; lines: string[]; ats: (i: number) => number; fin: number; hot?: boolean }> = ({ title, lines, ats, fin, hot }) => (
    <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 18 }}>
        <div style={{ fontFamily: BN, fontWeight: 800, fontSize: 44, color: hot ? K.amber : K.txt }}>{title}</div>
        <div style={{ fontFamily: BN, fontWeight: 700, fontSize: 34, color: K.dim }}>{bn(lines.filter((_, i) => f >= ats(i)).length)} ধাপ</div>
      </div>
      <div style={{ flex: 1, position: "relative", borderRadius: 18, padding: "30px 34px", background: hot ? "linear-gradient(180deg, rgba(255,176,32,.13), rgba(255,176,32,.03))" : "rgba(255,255,255,.04)", border: `2px solid ${hot ? K.amber : K.faint}` }}>
        {lines.map((x, i) => <Pen key={i} at={ats(i)} dur={20} style={{ margin: "8px 0" }}><Mx t={x} size={hot ? 46 : 38} /></Pen>)}
        {f >= fin && <div style={{ position: "absolute", right: 24, bottom: 20, fontFamily: BN, fontWeight: 800, fontSize: 40, color: K.green, transform: `scale(${Math.min(1, pop(f, fps, fin))})` }}>✓ শেষ</div>}
      </div>
    </div>
  );
  return (
    <Stage>
      <Kicker t={p.s.kicker || "দুই পথ পাশাপাশি"} />
      <div style={{ flex: 1, display: "flex", gap: 46, marginTop: 24 }}>
        <Col title="লম্বা পথ" lines={L} ats={la} fin={lDone} />
        <Col title="শর্টকাট" lines={S} ats={sa} fin={sDone} hot />
      </div>
    </Stage>
  );
};

const SOmr: React.FC<P> = (p) => {
  const f = useCurrentFrame(); const { fps } = useVideoConfig();
  const fillAt = v(p, 0.22), fl = interpolate(f, [fillAt, fillAt + 26], [0, 1], { ...clamp, easing: Easing.inOut(Easing.quad) });
  const rows = p.s.rows || 5, q0 = p.s.no || 1, a = p.s.a;
  // pencil follows the fill
  const ang = fl * Math.PI * 6, px = Math.cos(ang) * 16 * (1 - fl * 0.5), py = Math.sin(ang) * 16 * (1 - fl * 0.5);
  const rules: [string, "tick" | "light" | "double" | undefined, boolean][] = p.s.rules || [];
  return (
    <Stage style={{ flexDirection: "row", gap: 90, alignItems: "center" }}>
      <In at={2} y={40} style={{ flex: "none" }}>
        <div style={{ position: "relative", width: 620, padding: "34px 40px 30px", borderRadius: 12, background: K.omrBg, boxShadow: "0 30px 70px rgba(0,0,0,.55)", transform: "rotate(-1deg)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", fontFamily: BN, fontWeight: 700, fontSize: 26, color: K.omr, borderBottom: `3px solid ${K.omr}`, paddingBottom: 12, marginBottom: 18 }}><span>উত্তরপত্র (OMR)</span><span>নমুনা</span></div>
          {Array.from({ length: rows }, (_, r) => (
            <div key={r} style={{ display: "flex", alignItems: "center", gap: 26, padding: "12px 0", borderBottom: `1px dashed ${K.omr}55`, background: r === 0 ? `rgba(255,176,32,${0.18 * interpolate(f, [10, 24], [0, 1], clamp)})` : undefined }}>
              <div style={{ width: 60, fontFamily: BN, fontWeight: 700, fontSize: 34, color: K.omr, textAlign: "right" }}>{bn(q0 + r)}</div>
              {[0, 1, 2, 3].map((i) => (
                <div key={i} style={{ position: "relative" }}>
                  <Bubble l={OPT[i]} size={70} fill={r === 0 && i === a ? fl : 0} />
                  {r === 0 && i === a && f >= fillAt - 8 && f <= fillAt + 40 && <div style={{ position: "absolute", left: 35 + px, top: 35 + py, width: 180, height: 22, transformOrigin: "0 50%", transform: "rotate(-55deg)", borderRadius: "2px 12px 12px 2px", background: "linear-gradient(90deg, #2B2B2B 0 8%, #E8C27A 8% 22%, #F7B500 22% 88%, #E46A6A 88%)", boxShadow: "0 10px 20px rgba(0,0,0,.4)" }} />}
                </div>))}
            </div>))}
        </div>
      </In>
      <div style={{ flex: 1 }}>
        <Kicker t={p.s.kicker || "উত্তর দাগানোর নিয়ম"} />
        <H t={p.s.head} size={60} />
        <div style={{ display: "grid", gap: 20, marginTop: 34 }}>
          {rules.map(([t, m, ok], i) => (
            <In key={i} at={v(p, 0.42 + i * 0.12)} x={20} y={0}>
              <div style={{ display: "flex", alignItems: "center", gap: 22 }}>
                <div style={{ transform: "scale(.8)" }}><Bubble l={OPT[1]} size={64} fill={ok ? 1 : 0} mark={m} /></div>
                <span style={{ fontFamily: MATH, fontSize: 46, color: ok ? K.green : K.red, width: 40 }}>{ok ? "✓" : "✗"}</span>
                <span style={{ fontFamily: BN, fontSize: 38, color: K.txt }}>{t}</span>
              </div>
            </In>))}
        </div>
      </div>
      <Sequence from={Math.round(fillAt + 20)} durationInFrames={30}><Audio src={staticFile("aiu2/pop.mp3")} volume={0.35} /></Sequence>
    </Stage>
  );
};

// negative marking scoreboard
const SMarking: React.FC<P> = (p) => {
  const f = useCurrentFrame(); const { fps } = useVideoConfig();
  const C: [string, string, string][] = p.s.cards || [];
  return (
    <Stage>
      <Kicker t={p.s.kicker || "নেগেটিভ মার্কিং"} color={K.red} />
      <H t={p.s.head} />
      <div style={{ display: "flex", gap: 30, marginTop: 50 }}>
        {C.map(([n, l, c], i) => { const at = v(p, 0.12 + i * 0.14); return (
          <div key={i} style={{ flex: 1, borderRadius: 24, padding: "30px 30px 26px", background: `${c}1F`, border: `3px solid ${c}`, transform: `translateY(${(1 - Math.min(1, pop(f, fps, at))) * 40}px)`, opacity: interpolate(f, [at, at + 8], [0, 1], clamp) }}>
            <div style={{ fontFamily: BN, fontWeight: 800, fontSize: 96, color: c, lineHeight: 1 }}>{n}</div>
            <div style={{ fontFamily: BN, fontSize: 36, color: K.txt, marginTop: 14 }}>{l}</div>
          </div>); })}
      </div>
      {p.s.foot && <In at={v(p, 0.62)} style={{ marginTop: 50 }}><div style={{ display: "inline-block", padding: "22px 34px", borderRadius: 18, background: "rgba(255,255,255,.05)", borderLeft: `8px solid ${K.amber}`, fontFamily: BN, fontSize: 42, color: K.txt, lineHeight: 1.45 }}>{p.s.foot}</div></In>}
      {p.s.src && <In at={v(p, 0.7)}><div style={{ fontFamily: BN, fontSize: 22, color: K.dim, marginTop: 18 }}>সূত্র: {p.s.src}</div></In>}
    </Stage>
  );
};

const SRecap: React.FC<P> = (p) => {
  const f = useCurrentFrame(); const { fps } = useVideoConfig();
  const it: string[] = p.s.items || [];
  return (
    <Stage>
      <Kicker t="এক নজরে" />
      <H t={p.s.head || "আজ যা শিখলাম"} />
      <div style={{ display: "grid", gridTemplateColumns: "minmax(0,1fr) minmax(0,1fr)", gap: 26, marginTop: 40 }}>
        {it.map((x, i) => { const at = v(p, 0.06 + (0.8 * i) / it.length); return (
          <In key={i} at={at}>
            <div style={{ display: "flex", gap: 22, alignItems: "center", padding: "26px 28px", borderRadius: 20, background: "rgba(255,255,255,.05)", border: `2px solid ${K.faint}`, minHeight: 120, boxSizing: "border-box" }}>
              <div style={{ flex: "none", width: 58, height: 58, borderRadius: "50%", background: K.amber, display: "grid", placeItems: "center", fontFamily: MATH, fontSize: 36, color: "#1B1300", transform: `scale(${Math.min(1, pop(f, fps, at + 6))})` }}>✓</div>
              <div style={{ minWidth: 0 }}><Mx t={x} size={38} font={`${BN}, ${MATH}`} wrap /></div>
            </div>
          </In>); })}
      </div>
    </Stage>
  );
};

const SOutro: React.FC<P> = (p) => (
  <Stage style={{ alignItems: "center", justifyContent: "center", textAlign: "center" }}>
    <In at={4}><Img src={staticFile("academy/_brand/aiu-logo-dark.svg")} style={{ height: 96 }} /></In>
    <Pen at={14} dur={22} style={{ fontFamily: BN, fontWeight: 800, fontSize: 76, color: K.txt, marginTop: 40 }}>{p.s.head || "পরের পাঠে দেখা হবে"}</Pen>
    {p.spec.next && <In at={30}><div style={{ fontFamily: BN, fontSize: 46, color: K.amber, margin: "20px 0 44px" }}>পরের পাঠ: {p.spec.next}</div></In>}
    <In at={44}><div style={{ fontFamily: BN, fontSize: 38, color: K.dim }}>{p.s.line || "AI University · চাকরি প্রস্তুতি"} — <span style={{ color: K.txt, fontWeight: 700 }}>aiuniversitybd.com</span></div></In>
  </Stage>
);

// plain list of key points (orientation lessons)
const SPoints: React.FC<P> = (p) => {
  const f = useCurrentFrame(); const { fps } = useVideoConfig();
  const it: string[] = p.s.items || [];
  return (
    <Stage>
      <Kicker t={p.s.kicker || "মনে রাখুন"} />
      <H t={p.s.head} />
      <div style={{ display: "grid", gap: 20, marginTop: 36 }}>
        {it.map((x, i) => { const at = v(p, 0.08 + (0.8 * i) / it.length); return (
          <In key={i} at={at} x={24} y={0}>
            <div style={{ display: "flex", gap: 24, alignItems: "center", padding: "20px 28px", borderRadius: 18, background: "rgba(255,255,255,.05)", borderLeft: `6px solid ${K.amber}` }}>
              <div style={{ flex: "none", width: 54, height: 54, borderRadius: 14, background: K.amber, color: "#1B1300", display: "grid", placeItems: "center", fontFamily: BN, fontWeight: 800, fontSize: 32, transform: `scale(${Math.min(1, pop(f, fps, at + 4))})` }}>{bn(i + 1)}</div>
              <div style={{ minWidth: 0 }}><Mx t={x} size={40} font={`${BN}, ${MATH}`} wrap /></div>
            </div>
          </In>); })}
      </div>
    </Stage>
  );
};

// data table (exam patterns etc.); hi = row index to highlight
const STable: React.FC<P> = (p) => {
  const cols: string[] = p.s.cols || [], rows: string[][] = p.s.rows || [];
  return (
    <Stage>
      <Kicker t={p.s.kicker || "এক নজরে"} />
      <H t={p.s.head} size={58} />
      <div style={{ marginTop: 30, borderRadius: 20, overflow: "hidden", border: `2px solid ${K.faint}` }}>
        <div style={{ display: "grid", gridTemplateColumns: `1.4fr repeat(${cols.length - 1}, 1fr)`, background: "rgba(255,176,32,.16)" }}>
          {cols.map((c, i) => <div key={i} style={{ padding: "16px 22px", fontFamily: BN, fontWeight: 700, fontSize: 30, color: K.amber2 }}>{c}</div>)}
        </div>
        {rows.map((r, j) => (
          <In key={j} at={v(p, 0.08 + (0.75 * j) / rows.length)} y={10}>
            <div style={{ display: "grid", gridTemplateColumns: `1.4fr repeat(${cols.length - 1}, 1fr)`, borderTop: `1px solid ${K.faint}`, background: p.s.hi === j ? "rgba(255,176,32,.10)" : j % 2 ? "rgba(255,255,255,.025)" : "transparent" }}>
              {r.map((c, i) => <div key={i} style={{ padding: "14px 22px", fontFamily: BN, fontWeight: i ? 500 : 700, fontSize: 30, color: K.txt }}><Mx t={c} size={30} font={`${BN}, ${MATH}`} wrap /></div>)}
            </div>
          </In>))}
      </div>
      {p.s.src && <In at={v(p, 0.85)}><div style={{ fontFamily: BN, fontSize: 22, color: K.dim, marginTop: 16 }}>সূত্র: {p.s.src}</div></In>}
    </Stage>
  );
};

const MAP: Record<string, React.FC<any>> = {
  hook: SHook, title: STitle, question: SQuestion, trap: STrap, steps: SSteps, bars: SBars, formula: SFormula, race: SRace, omr: SOmr, marking: SMarking,
  quizQ: (p: P) => <SQuestion {...p} quiz />, quizA: (p: P) => <SQuestion {...p} quiz answer />, recap: SRecap, outro: SOutro, points: SPoints, table: STable,
};

/* ---------- chrome ---------- */
const Chrome: React.FC<{ spec: Spec; starts: number[]; total: number }> = ({ spec, starts, total }) => {
  const f = useCurrentFrame(); const k = starts.filter((s) => f >= s).length;
  return (
    <>
      <div style={{ position: "absolute", left: 70, top: 46, display: "flex", alignItems: "center", gap: 20 }}>
        <Img src={staticFile("academy/_brand/aiu-logo-dark.svg")} style={{ height: 40 }} />
        <div style={{ fontFamily: BN, fontWeight: 700, fontSize: 26, color: "#1B1300", background: K.amber, padding: "4px 16px 6px", borderRadius: 999 }}>চাকরি প্রস্তুতি</div>
        <div style={{ fontFamily: BN, fontSize: 26, color: K.dim }}>{spec.part} · {spec.lessonNo}</div>
      </div>
      <div style={{ position: "absolute", right: 70, top: 60, display: "flex", gap: 6 }}>
        {starts.map((s, i) => { const e = i + 1 < starts.length ? starts[i + 1] : total; const fill = interpolate(f, [s, e], [0, 1], clamp); return (
          <div key={i} style={{ width: 34, height: 6, borderRadius: 3, background: K.faint, overflow: "hidden" }}><div style={{ width: `${fill * 100}%`, height: "100%", background: i < k - 1 ? K.dim : K.amber }} /></div>); })}
      </div>
      <div style={{ position: "absolute", right: 70, bottom: 26, fontFamily: BN, fontSize: 20, color: K.dim }}>এআই শিক্ষক · এআই কণ্ঠ</div>
    </>
  );
};
const subChunks = (spec: Spec, starts: number[]) => spec.scenes.flatMap((s, i) => {
  const parts = s.vo.split(/(?<=[।?!,—])\s+/).reduce<string[]>((a, x) => { if (a.length && (a[a.length - 1].length < 26 || x.length < 10)) a[a.length - 1] += " " + x; else a.push(x); return a; }, []);
  const total = parts.reduce((n, x) => n + x.length, 0); let acc = 0; const b = starts[i] + LEAD;
  return parts.map((x) => { const from = b + (s.frames * acc) / total; acc += x.length; return { s: x, from, to: b + (s.frames * acc) / total }; });
});
// scene in/out: slight camera push + rise; out: lift + fade
const SceneMove: React.FC<{ len: number; children: React.ReactNode }> = ({ len, children }) => {
  const f = useCurrentFrame();
  const i = interpolate(f, [0, 14], [0, 1], { ...clamp, easing: ease }), o = interpolate(f, [len - 14, len], [1, 0], { ...clamp, easing: Easing.in(Easing.quad) });
  const push = interpolate(f, [0, len], [1, 1.025], clamp);
  return <AbsoluteFill style={{ opacity: Math.min(i, o), transform: `translateY(${(1 - i) * 30 - (1 - o) * 24}px) scale(${push})` }}>{children}</AbsoluteFill>;
};

export const JobVideo: React.FC<{ spec: Spec }> = ({ spec }) => {
  const f = useCurrentFrame();
  const lens = spec.scenes.map(sceneLen);
  const starts = lens.reduce<number[]>((a, _, i) => [...a, i ? a[i - 1] + lens[i - 1] : 18], []);
  const chunks = subChunks(spec, starts);
  const cur = chunks.find((x) => f >= x.from && f < x.to + 4);
  const total = jobLen(spec);
  const busy = (fr: number) => spec.scenes.some((s, i) => fr >= starts[i] + LEAD - 6 && fr <= starts[i] + LEAD + s.frames + 4);
  const sweep = (f % 420) / 420;
  return (
    <AbsoluteFill style={{ background: K.desk }}>
      {/* desk: graphite gradient, warm desk-lamp pool, fine grain */}
      <AbsoluteFill style={{ background: `radial-gradient(70% 80% at 32% 38%, #232A37 0%, ${K.desk2} 40%, ${K.desk} 100%)` }} />
      <AbsoluteFill style={{ background: `radial-gradient(40% 50% at ${24 + sweep * 4}% 30%, rgba(255,176,32,.10), transparent 70%)` }} />
      <AbsoluteFill style={{ opacity: 0.06, backgroundImage: "radial-gradient(rgba(255,255,255,.9) 1px, transparent 1.2px)", backgroundSize: "34px 34px" }} />
      <AbsoluteFill style={{ boxShadow: "inset 0 0 220px rgba(0,0,0,.65)" }} />
      {spec.scenes.map((s, i) => {
        const S = MAP[s.type]; const len = lens[i];
        return (
          <Sequence key={i} from={starts[i]} durationInFrames={len}>
            <SceneMove len={len}><S s={s} spec={spec} vo={s.frames} /></SceneMove>
            <Sequence from={LEAD}><Audio src={staticFile(`jobprep/${spec.id}/vo/${String(i + 1).padStart(2, "0")}.mp3`)} /></Sequence>
            <Sequence from={0}><Audio src={staticFile(`aiu2/${i === 0 ? "swell" : s.type === "quizA" || s.type === "outro" ? "chime" : s.type === "trap" ? "hit" : "whoosh"}.mp3`)} volume={0.2} /></Sequence>
          </Sequence>
        );
      })}
      <Chrome spec={spec} starts={starts} total={total} />
      {cur && <div style={{ position: "absolute", left: 0, right: 0, bottom: 74, display: "flex", justifyContent: "center", opacity: interpolate(f, [cur.from, cur.from + 5, cur.to, cur.to + 4], [0, 1, 1, 0], clamp) }}>
        <div style={{ maxWidth: 1500, padding: "10px 28px 14px 24px", borderRadius: 14, background: "rgba(8,10,14,.82)", borderLeft: `5px solid ${K.amber}`, fontFamily: BN, fontSize: 34, fontWeight: 500, color: "#fff", textAlign: "center", lineHeight: 1.35 }}>{cur.s.replace(/[।,]$/, "")}</div></div>}
      <Audio src={staticFile("aiu2/music.mp3")} volume={(fr) => (busy(fr) ? 0.04 : 0.12) * interpolate(fr, [0, 30, total - 60, total], [0, 1, 1, 0], clamp)} />
    </AbsoluteFill>
  );
};
