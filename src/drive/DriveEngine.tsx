// AI University — Driving course lesson video engine ("ড্রাইভিং শিক্ষা — ৩ডি সিমুলেটরসহ").
// Look: night asphalt + lane dashes, dashboard gauges, real-shaped traffic signs (drawn in SVG), green highway-board cards,
// real recordings of our own 3D simulator (sim/drive.js) and free-licence road photos (credit line on screen).
// Spec: src/drive/specs/<id>.json, timed by scripts/drive_make.py. Scene types:
// title · points · steps · signs · clip · photo · vs · note · recap · outro
import React from "react";
import { AbsoluteFill, Audio, Img, Loop, OffthreadVideo, Sequence, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig, Easing, delayRender, continueRender } from "remotion";
import { Check, X, TriangleAlert, Lightbulb, Bot, Car, Gauge, Navigation, ShieldCheck, Eye, Clock, Phone, Wrench, Fuel, CircleParking, Users, Bike, Bus, Siren, CloudRain, Moon, Sun, MoveRight, MoveLeft, Hand, Volume2, VolumeX, FileText, Route, Ban, CornerUpLeft, CornerUpRight, RotateCw, Droplets, Thermometer, Footprints, Camera, Gamepad2 } from "lucide-react";

const C = { road: "#15191F", road2: "#1E242C", ink: "#F4F6F9", mute: "#AEB6C2", faint: "#6E7785", line: "rgba(255,255,255,.12)", card: "#222932",
  yellow: "#F5C518", red: "#D7262E", blue: "#1E5AA8", green: "#0E6B43", green2: "#13895A", amber: "#F59E0B", white: "#FFFFFF", sky: "#5EB3FF" };
const BN = "Anek", EN = "Montserrat";
if (typeof document !== "undefined") {
  for (const [n, u] of [["Anek", "fonts/AnekBangla.ttf"], ["Montserrat", "fonts/Montserrat.ttf"]]) {
    const h = delayRender(`font ${n}`);
    const f = new FontFace(n, `url(${staticFile(u)})`, { weight: "100 900" });
    f.load().then(() => { document.fonts.add(f); continueRender(h); }).catch(() => continueRender(h));
  }
}
export const ICONS: Record<string, React.FC<any>> = { car: Car, gauge: Gauge, nav: Navigation, shield: ShieldCheck, eye: Eye, clock: Clock, phone: Phone, wrench: Wrench, fuel: Fuel, parking: CircleParking, users: Users, bike: Bike, bus: Bus, siren: Siren, rain: CloudRain, moon: Moon, sun: Sun, right: MoveRight, left: MoveLeft, hand: Hand, horn: Volume2, nohorn: VolumeX, doc: FileText, route: Route, ban: Ban, turnleft: CornerUpLeft, turnright: CornerUpRight, round: RotateCw, drop: Droplets, temp: Thermometer, walk: Footprints, camera: Camera, game: Gamepad2, alert: TriangleAlert, tip: Lightbulb, check: Check };
const Ic: React.FC<{ k?: string; size: number; color: string }> = ({ k, size, color }) => { const I = (k && ICONS[k]) || Check; return <I size={size} color={color} strokeWidth={2.4} />; };
const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const ease = Easing.bezier(0.16, 1, 0.3, 1);
const bn = (n: number | string) => String(n).replace(/\d/g, (d) => "০১২৩৪৫৬৭৮৯"[+d]);
const ent = (f: number, fps: number, d: number, dur = 24) => spring({ frame: f - d, fps, config: { damping: 200 }, durationInFrames: dur });

export type Scene = { type: string; vo: string; frames: number; hold?: number; [k: string]: any };
export type Spec = { id: string; course: string; module: string; lessonNo: string; title: string; next: string; scenes: Scene[]; clipLens?: Record<string, number> };
const LEAD = 12, TAIL = 16;
const sceneLen = (s: Scene) => LEAD + s.frames + (s.hold || 0) + TAIL;
export const driveLen = (spec: Spec) => spec.scenes.reduce((n, s) => n + sceneLen(s), 0) + 30;
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
// yellow kerb stripe under headings
const Kerb: React.FC<{ d: number; w?: number }> = ({ d, w = 260 }) => {
  const f = useCurrentFrame(); const k = interpolate(f, [d, d + 22], [0, 1], { ...clamp, easing: ease });
  return <div style={{ marginTop: 14, width: w * k, height: 12, borderRadius: 3, background: `repeating-linear-gradient(90deg, ${C.yellow} 0 34px, #111 34px 52px)` }} />;
};
const Head: React.FC<{ h: string; d?: number; top?: number }> = ({ h, d = 4, top = 136 }) => (
  <div style={{ position: "absolute", left: 120, top, right: 120 }}><H d={d} size={56}>{h}</H><Kerb d={d + 8} /></div>
);

/* ---------- traffic sign (SVG) ---------- */
export const Sign: React.FC<{ shape: string; sym?: string; icon?: string; size: number; slash?: boolean }> = ({ shape, sym, icon, size, slash }) => {
  const S = size; const inner = (col: string) => icon ? <foreignObject x={S * 0.24} y={S * (shape === "triangle" ? 0.36 : 0.24)} width={S * 0.52} height={S * 0.52}><div style={{ display: "flex", alignItems: "center", justifyContent: "center", width: "100%", height: "100%" }}><Ic k={icon} size={S * 0.42} color={col} /></div></foreignObject>
    : sym ? <text x={S / 2} y={S * (shape === "triangle" ? 0.72 : 0.6)} textAnchor="middle" dominantBaseline="middle" fontFamily={/[ঀ-৿]/.test(sym) ? BN : EN} fontWeight={800} fontSize={S * (sym.length > 3 ? 0.2 : sym.length > 2 ? 0.27 : 0.36)} fill={col}>{sym}</text> : null;
  return (
    <svg width={S} height={S} viewBox={`0 0 ${S} ${S}`} style={{ filter: "drop-shadow(0 18px 30px rgba(0,0,0,.45))" }}>
      {shape === "circle-red" && <><circle cx={S / 2} cy={S / 2} r={S * 0.47} fill="#fff" /><circle cx={S / 2} cy={S / 2} r={S * 0.41} fill="none" stroke={C.red} strokeWidth={S * 0.1} />{inner("#111")}{slash && <line x1={S * 0.22} y1={S * 0.22} x2={S * 0.78} y2={S * 0.78} stroke={C.red} strokeWidth={S * 0.08} />}</>}
      {shape === "no-entry" && <><circle cx={S / 2} cy={S / 2} r={S * 0.47} fill={C.red} /><rect x={S * 0.18} y={S * 0.42} width={S * 0.64} height={S * 0.16} rx={6} fill="#fff" /></>}
      {shape === "circle-blue" && <><circle cx={S / 2} cy={S / 2} r={S * 0.47} fill={C.blue} stroke="#fff" strokeWidth={S * 0.03} />{inner("#fff")}</>}
      {shape === "triangle" && <><path d={`M${S / 2} ${S * 0.06} L${S * 0.96} ${S * 0.9} L${S * 0.04} ${S * 0.9} Z`} fill="#fff" stroke={C.red} strokeWidth={S * 0.08} strokeLinejoin="round" />{inner("#111")}</>}
      {shape === "give-way" && <><path d={`M${S * 0.04} ${S * 0.1} L${S * 0.96} ${S * 0.1} L${S / 2} ${S * 0.94} Z`} fill="#fff" stroke={C.red} strokeWidth={S * 0.09} strokeLinejoin="round" /></>}
      {shape === "octagon" && <><path d={Array.from({ length: 8 }, (_, i) => { const a = Math.PI / 8 + (i * Math.PI) / 4; return `${i ? "L" : "M"}${S / 2 + Math.cos(a) * S * 0.48} ${S / 2 + Math.sin(a) * S * 0.48}`; }).join(" ") + "Z"} fill={C.red} stroke="#fff" strokeWidth={S * 0.03} /><text x={S / 2} y={S * 0.53} textAnchor="middle" dominantBaseline="middle" fontFamily={EN} fontWeight={800} fontSize={S * 0.25} fill="#fff">STOP</text></>}
      {shape === "rect" && <><rect x={S * 0.06} y={S * 0.14} width={S * 0.88} height={S * 0.72} rx={S * 0.06} fill={C.blue} stroke="#fff" strokeWidth={S * 0.03} />{inner("#fff")}</>}
      {shape === "light" && <><rect x={S * 0.3} y={S * 0.02} width={S * 0.4} height={S * 0.96} rx={S * 0.08} fill="#111" />{["#ff3b30", "#ffcc00", "#34c759"].map((c, i) => <circle key={i} cx={S / 2} cy={S * (0.18 + i * 0.32)} r={S * 0.12} fill={sym === ["red", "amber", "green"][i] || !sym ? c : "#333"} />)}</>}
    </svg>
  );
};

/* ---------- background: night road with moving lane dashes ---------- */
const RoadBg: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill style={{ background: `radial-gradient(1200px 700px at 80% -10%, #2A3442 0%, ${C.road} 60%)` }}>
      <svg width={1920} height={1080} style={{ position: "absolute", inset: 0, opacity: 0.55 }}>
        <defs><linearGradient id="fadeR" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#000" stopOpacity="0" /><stop offset="1" stopColor="#000" stopOpacity="0.6" /></linearGradient></defs>
        <path d="M760 1080 L940 640 L980 640 L1160 1080 Z" fill="#0F1217" opacity={0.0} />
        {Array.from({ length: 9 }, (_, i) => {
          const t = ((i / 9 + f / 240) % 1); const y = 640 + Math.pow(t, 2.2) * 460; const w = 3 + t * 20; const h = 8 + t * 70;
          return <rect key={i} x={960 - w / 2} y={y} width={w} height={h} fill={C.yellow} opacity={0.18 + t * 0.5} />;
        })}
        <line x1={940} y1={640} x2={560} y2={1080} stroke="#fff" strokeOpacity={0.12} strokeWidth={6} />
        <line x1={980} y1={640} x2={1360} y2={1080} stroke="#fff" strokeOpacity={0.12} strokeWidth={6} />
      </svg>
      <AbsoluteFill style={{ backgroundImage: "radial-gradient(rgba(255,255,255,.035) 1px, transparent 1px)", backgroundSize: "6px 6px" }} />
      <AbsoluteFill style={{ background: "linear-gradient(180deg, rgba(21,25,31,.0) 40%, rgba(21,25,31,.85) 100%)" }} />
    </AbsoluteFill>
  );
};

/* ---------- scenes ---------- */
const Speedo: React.FC<{ d: number }> = ({ d }) => {
  const f = useCurrentFrame(); const k = interpolate(f, [d, d + 70], [0, 1], { ...clamp, easing: Easing.inOut(Easing.cubic) });
  const ang = -220 + k * 160 + Math.sin(f / 9) * 2 * k; const R = 230;
  return (
    <svg width={560} height={560} viewBox="-280 -280 560 560">
      <circle r={R + 30} fill="#0E1116" stroke="#2C3440" strokeWidth={6} />
      <path d={`M ${Math.cos((-220 * Math.PI) / 180) * R} ${Math.sin((-220 * Math.PI) / 180) * R} A ${R} ${R} 0 1 1 ${Math.cos((40 * Math.PI) / 180) * R} ${Math.sin((40 * Math.PI) / 180) * R}`} fill="none" stroke="#2C3440" strokeWidth={18} strokeLinecap="round" />
      {Array.from({ length: 13 }, (_, i) => { const a = ((-220 + i * 21.67) * Math.PI) / 180; return <g key={i}><line x1={Math.cos(a) * (R - 34)} y1={Math.sin(a) * (R - 34)} x2={Math.cos(a) * (R - 8)} y2={Math.sin(a) * (R - 8)} stroke={i > 9 ? C.red : "#C9D1DC"} strokeWidth={i % 2 ? 3 : 6} />{i % 2 === 0 && <text x={Math.cos(a) * (R - 70)} y={Math.sin(a) * (R - 70)} textAnchor="middle" dominantBaseline="middle" fill="#C9D1DC" fontFamily={BN} fontSize={30} fontWeight={700}>{bn(i * 10)}</text>}</g>; })}
      <g transform={`rotate(${ang})`}><line x1={-20} y1={0} x2={R - 40} y2={0} stroke={C.red} strokeWidth={10} strokeLinecap="round" /></g>
      <circle r={26} fill={C.yellow} />
      <text y={120} textAnchor="middle" fill={C.mute} fontFamily={EN} fontSize={26} fontWeight={700}>km/h</text>
    </svg>
  );
};
const STitle: React.FC<P> = ({ spec }) => (
  <AbsoluteFill>
    <div style={{ position: "absolute", right: 120, top: 250 }}><Speedo d={6} /></div>
    <div style={{ position: "absolute", left: 120, top: 250, width: 1060 }}>
      <Rise d={4}><span style={{ display: "inline-flex", gap: 12, alignItems: "center", padding: "10px 22px", borderRadius: 10, background: C.green, border: "3px solid #fff", color: "#fff", fontFamily: BN, fontSize: 30, fontWeight: 700 }}><Navigation size={28} /> {spec.module} · {spec.lessonNo}</span></Rise>
      <div style={{ marginTop: 34 }}><H d={10} size={80}>{spec.title}</H></div>
      <Kerb d={20} w={360} />
      <Rise d={26} style={{ marginTop: 26 }}><span style={{ fontFamily: BN, fontSize: 34, color: C.mute }}>{spec.course}</span></Rise>
    </div>
  </AbsoluteFill>
);
// green highway-board cards
const SPoints: React.FC<P> = (p) => {
  const { s } = p; const n = s.items.length; const big = n <= 3; const many = n > 4;
  return (
    <AbsoluteFill>
      <Head h={s.h} />
      <div style={{ position: "absolute", left: 120, right: 120, top: many ? 310 : 330, display: "grid", gridTemplateColumns: many ? "1fr 1fr 1fr" : n === 4 ? "1fr 1fr" : `repeat(${n}, 1fr)`, gap: many ? 20 : 28 }}>
        {s.items.map((it: any, i: number) => (
          <Rise key={i} d={v(p, 0.04 + (i / n) * 0.78)}>
            <div style={{ background: C.green, border: "4px solid #fff", borderRadius: 18, padding: big ? "34px 34px" : many ? "18px 22px" : "24px 30px", minHeight: big ? 300 : many ? 128 : 150, display: "flex", flexDirection: big ? "column" : "row", gap: 22, alignItems: big ? "flex-start" : "center", boxShadow: "0 24px 50px rgba(0,0,0,.4)" }}>
              <div style={{ width: 76, height: 76, borderRadius: 16, background: "rgba(255,255,255,.16)", display: "flex", alignItems: "center", justifyContent: "center", flex: "none" }}><Ic k={it.icon} size={44} color="#fff" /></div>
              <div>
                {it.b && <div style={{ fontFamily: BN, fontSize: big ? 40 : 34, fontWeight: 800, color: "#fff", lineHeight: 1.3 }}>{it.b}</div>}
                <div style={{ fontFamily: BN, fontSize: big ? 32 : 29, color: "#E6F4EC", lineHeight: 1.4, marginTop: it.b ? 8 : 0 }}>{it.t}</div>
              </div>
            </div>
          </Rise>
        ))}
      </div>
    </AbsoluteFill>
  );
};
// numbered steps along a road with a moving car
const SSteps: React.FC<P> = (p) => {
  const { s } = p; const f = useCurrentFrame(); const n = s.steps.length;
  const at = (i: number) => v(p, 0.04 + (i / n) * 0.82);
  const cur = s.steps.filter((_: any, i: number) => f >= at(i)).length;
  const top = 330, gap = Math.min(150, 560 / n);
  const carY = interpolate(f, s.steps.map((_: any, i: number) => at(i)), s.steps.map((_: any, i: number) => top + i * gap + 10), clamp);
  return (
    <AbsoluteFill>
      <Head h={s.h} />
      <div style={{ position: "absolute", left: 150, top: top - 10, width: 70, height: gap * (n - 1) + 90, background: "#0E1116", borderRadius: 12, border: "2px solid #2C3440" }}>
        <div style={{ position: "absolute", left: 32, top: 10, bottom: 10, width: 6, background: `repeating-linear-gradient(180deg, ${C.yellow} 0 22px, transparent 22px 40px)` }} />
      </div>
      {n > 1 && <div style={{ position: "absolute", left: 156, top: carY, width: 58, height: 58, borderRadius: 14, background: C.yellow, display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 0 30px rgba(245,197,24,.6)" }}><Car size={36} color="#111" /></div>}
      {s.steps.map((t: string, i: number) => (
        <Rise key={i} d={at(i)} style={{ position: "absolute", left: 270, right: 120, top: top + i * gap }} y={20}>
          <div style={{ display: "flex", gap: 22, alignItems: "center", padding: "16px 26px", borderRadius: 16, background: i < cur - 1 ? C.road2 : C.card, border: `2px solid ${i === cur - 1 ? C.yellow : C.line}`, minHeight: Math.min(110, gap - 16) }}>
            <span style={{ fontFamily: BN, fontSize: 34, fontWeight: 800, color: "#111", background: C.yellow, width: 56, height: 56, borderRadius: 28, display: "flex", alignItems: "center", justifyContent: "center", flex: "none" }}>{bn(i + 1)}</span>
            <span style={{ fontFamily: BN, fontSize: n > 5 ? 28 : 32, color: C.ink, lineHeight: 1.35, fontWeight: 600 }}>{t}</span>
          </div>
        </Rise>
      ))}
    </AbsoluteFill>
  );
};
const SSigns: React.FC<P> = (p) => {
  const { s } = p; const n = s.signs.length; const size = n <= 3 ? 300 : n === 4 ? 250 : 210;
  return (
    <AbsoluteFill>
      <Head h={s.h} />
      <div style={{ position: "absolute", left: 100, right: 100, top: 340, display: "flex", justifyContent: "center", gap: n > 4 ? 30 : 60 }}>
        {s.signs.map((g: any, i: number) => {
          const d = v(p, 0.04 + (i / n) * 0.8);
          return (
            <Rise key={i} d={d} y={60} style={{ width: size + 40, display: "flex", flexDirection: "column", alignItems: "center" }}>
              <Pop d={d}><Sign shape={g.shape} sym={g.sym} icon={g.icon} slash={g.slash} size={size} /></Pop>
              <div style={{ marginTop: 26, padding: "10px 18px", borderRadius: 12, background: C.card, border: `1px solid ${C.line}`, fontFamily: BN, fontSize: 30, fontWeight: 700, color: C.ink, textAlign: "center", lineHeight: 1.3 }}>{g.label}</div>
              {g.sub && <div style={{ marginTop: 10, fontFamily: BN, fontSize: 25, color: C.mute, textAlign: "center", lineHeight: 1.35 }}>{g.sub}</div>}
            </Rise>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};
const Pop: React.FC<{ d: number; children: React.ReactNode }> = ({ d, children }) => {
  const f = useCurrentFrame(); const { fps } = useVideoConfig(); const s = spring({ frame: f - d, fps, config: { damping: 11, mass: 0.7 } });
  return <div style={{ transform: `scale(${0.4 + s * 0.6}) rotate(${(1 - s) * -12}deg)` }}>{children}</div>;
};
const Caps: React.FC<{ p: P; caps: string[]; top?: number }> = ({ p, caps, top = 360 }) => (
  <div style={{ position: "absolute", left: 1270, right: 90, top, display: "flex", flexDirection: "column", gap: 20 }}>
    {caps.map((t, i) => (
      <Rise key={i} d={v(p, 0.08 + (i / caps.length) * 0.75)} y={20}>
        <div style={{ display: "flex", gap: 16, alignItems: "flex-start", padding: "16px 22px", borderRadius: 14, background: C.card, border: `1px solid ${C.line}` }}>
          <span style={{ width: 40, height: 40, borderRadius: 20, background: C.yellow, display: "flex", alignItems: "center", justifyContent: "center", flex: "none", marginTop: 2 }}><Check size={24} color="#111" strokeWidth={3} /></span>
          <span style={{ fontFamily: BN, fontSize: 29, color: C.ink, lineHeight: 1.38, fontWeight: 600 }}>{t}</span>
        </div>
      </Rise>
    ))}
  </div>
);
// real simulator recording inside a windshield/dashboard frame
const SClip: React.FC<P> = (p) => {
  const { s, spec } = p; const f = useCurrentFrame(); const len = spec.clipLens?.[s.src] || 300;
  const z = interpolate(f, [0, sceneLen(s)], [1, 1.06]);
  return (
    <AbsoluteFill>
      <Head h={s.h} top={120} />
      <div style={{ position: "absolute", left: 90, top: 300, width: 1140, height: 641, borderRadius: 26, overflow: "hidden", border: "6px solid #0B0D10", boxShadow: "0 30px 70px rgba(0,0,0,.6)" }}>
        <div style={{ position: "absolute", inset: 0, transform: `scale(${z})` }}>
          <Loop durationInFrames={len}><OffthreadVideo src={staticFile(s.src)} muted style={{ width: "100%", height: "100%", objectFit: "cover" }} /></Loop>
        </div>
        <div style={{ position: "absolute", left: 18, top: 18, display: "flex", gap: 10, alignItems: "center", padding: "8px 16px", borderRadius: 10, background: "rgba(0,0,0,.65)", fontFamily: BN, fontSize: 24, color: "#fff", fontWeight: 700 }}><Gamepad2 size={24} color={C.yellow} /> এআই ইউনিভার্সিটির ৩ডি সিমুলেটর</div>
      </div>
      <Caps p={p} caps={s.caps || []} top={310} />
    </AbsoluteFill>
  );
};
const SPhoto: React.FC<P> = (p) => {
  const { s } = p; const f = useCurrentFrame(); const z = interpolate(f, [0, sceneLen(s)], [1.02, 1.12]); const x = interpolate(f, [0, sceneLen(s)], [0, -30]);
  return (
    <AbsoluteFill>
      <Head h={s.h} top={120} />
      <div style={{ position: "absolute", left: 90, top: 300, width: 1140, height: 641, borderRadius: 26, overflow: "hidden", boxShadow: "0 30px 70px rgba(0,0,0,.6)" }}>
        <Img src={staticFile(s.src)} style={{ width: "100%", height: "100%", objectFit: "cover", transform: `scale(${z}) translateX(${x}px)` }} />
        {s.credit && <div style={{ position: "absolute", right: 12, bottom: 10, padding: "4px 10px", borderRadius: 6, background: "rgba(0,0,0,.6)", fontFamily: EN, fontSize: 15, color: "#ddd" }}>{s.credit}</div>}
      </div>
      <Caps p={p} caps={s.caps || []} top={310} />
    </AbsoluteFill>
  );
};
const SVs: React.FC<P> = (p) => {
  const { s } = p; const n = s.rows.length;
  return (
    <AbsoluteFill>
      <Head h={s.h} />
      <div style={{ position: "absolute", left: 120, right: 120, top: 320, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 18 }}>
        {s.cols.map((c: string, j: number) => <Rise key={j} d={6 + j * 8}><div style={{ padding: "18px 26px", borderRadius: 14, background: j ? C.blue : C.green, border: "3px solid #fff", color: "#fff", fontFamily: BN, fontSize: 36, fontWeight: 800 }}>{c}</div></Rise>)}
        {s.rows.map((r: any, i: number) => [r.l, r.r].map((x: string, j: number) => (
          <Rise key={i + "-" + j} d={v(p, 0.08 + (i / n) * 0.8 + j * 0.05)} y={20}>
            <div style={{ padding: n > 3 ? "14px 24px" : "20px 26px", minHeight: n > 3 ? 84 : 104, display: "flex", alignItems: "center", borderRadius: 14, background: C.card, border: `1px solid ${C.line}`, fontFamily: BN, fontSize: 30, color: C.ink, lineHeight: 1.35, fontWeight: 600 }}>{x}</div>
          </Rise>
        )))}
      </div>
    </AbsoluteFill>
  );
};
const SNote: React.FC<P> = (p) => {
  const { s } = p; const warn = s.kind !== "tip"; const col = warn ? C.amber : C.sky;
  return (
    <AbsoluteFill style={{ alignItems: "center", justifyContent: "center" }}>
      <Rise d={4} style={{ width: 1400 }}>
        <div style={{ display: "flex", gap: 44, alignItems: "center", padding: "56px 64px", borderRadius: 30, background: C.card, border: `4px solid ${col}`, boxShadow: `0 0 80px ${col}33` }}>
          <Pop d={8}>{warn ? <Sign shape="triangle" sym="!" size={230} /> : <div style={{ width: 200, height: 200, borderRadius: 100, background: `${col}22`, display: "flex", alignItems: "center", justifyContent: "center" }}><Lightbulb size={120} color={col} /></div>}</Pop>
          <div>
            <div style={{ fontFamily: BN, fontSize: 40, fontWeight: 800, color: col }}>{warn ? "সাবধান" : "টিপস"}</div>
            <div style={{ fontFamily: BN, fontSize: 44, fontWeight: 700, color: C.ink, lineHeight: 1.4, marginTop: 12 }}>{s.t}</div>
          </div>
        </div>
      </Rise>
    </AbsoluteFill>
  );
};
const SRecap: React.FC<P> = (p) => {
  const { s } = p; const n = s.items.length;
  return (
    <AbsoluteFill>
      <Head h={s.h || "এক নজরে মনে রাখুন"} />
      <div style={{ position: "absolute", left: 120, right: 120, top: 330, display: "flex", flexDirection: "column", gap: 20 }}>
        {s.items.map((t: string, i: number) => (
          <Rise key={i} d={v(p, 0.05 + (i / n) * 0.8)} y={20}>
            <div style={{ display: "flex", gap: 22, alignItems: "center", padding: "18px 28px", borderRadius: 16, background: C.card, borderLeft: `10px solid ${C.green2}` }}>
              <Check size={40} color={C.green2} strokeWidth={3} />
              <span style={{ fontFamily: BN, fontSize: 34, color: C.ink, fontWeight: 600, lineHeight: 1.35 }}>{t}</span>
            </div>
          </Rise>
        ))}
      </div>
    </AbsoluteFill>
  );
};
const SOutro: React.FC<P> = ({ spec }) => (
  <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", textAlign: "center" }}>
    <Pop d={4}><Sign shape="circle-blue" icon="right" size={220} /></Pop>
    <div style={{ marginTop: 36 }}><H d={10} size={60}>পরের পাঠ</H></div>
    <Rise d={18} style={{ marginTop: 18 }}><div style={{ fontFamily: BN, fontSize: 46, fontWeight: 700, color: C.yellow, maxWidth: 1500 }}>{spec.next}</div></Rise>
    <Rise d={28} style={{ marginTop: 40 }}><div style={{ display: "inline-flex", gap: 14, alignItems: "center", padding: "14px 28px", borderRadius: 40, background: C.card, border: `1px solid ${C.line}`, fontFamily: BN, fontSize: 30, color: C.ink }}><Gamepad2 size={32} color={C.yellow} /> কোর্সের প্র্যাকটিস পাঠে ৩ডি সিমুলেটরে নিজে চালিয়ে দেখুন</div></Rise>
  </AbsoluteFill>
);

const MAP: Record<string, React.FC<any>> = { title: STitle, points: SPoints, steps: SSteps, signs: SSigns, clip: SClip, photo: SPhoto, vs: SVs, note: SNote, recap: SRecap, outro: SOutro };
export const SCENE_TYPES = Object.keys(MAP);

/* ---------- chrome: dashboard strip ---------- */
const Header: React.FC<{ spec: Spec; starts: number[] }> = ({ spec, starts }) => {
  const f = useCurrentFrame(); const k = starts.filter((s) => f >= s).length; const blink = Math.floor(f / 15) % 2 === 0;
  return (
    <div style={{ position: "absolute", left: 0, right: 0, top: 0, height: 92, display: "flex", alignItems: "center", gap: 22, padding: "0 50px", background: "linear-gradient(180deg, #0B0D10, #13171D)", borderBottom: "2px solid #2C3440" }}>
      <Img src={staticFile("brand/logo-dark.png")} style={{ height: 48 }} />
      <div style={{ width: 1, height: 34, background: "#2C3440" }} />
      <div style={{ fontFamily: BN, fontSize: 26, fontWeight: 700, color: C.ink }}>{spec.course}</div>
      <div style={{ fontFamily: BN, fontSize: 24, color: C.mute }}>· {spec.lessonNo}</div>
      <div style={{ marginLeft: "auto", display: "flex", gap: 8, alignItems: "center" }}>
        <MoveLeft size={26} color={blink ? "#22C55E" : "#1B3A26"} />
        <div style={{ display: "flex", gap: 6, width: 360 }}>{starts.map((_, i) => <div key={i} style={{ flex: 1, height: 8, borderRadius: 4, background: i < k - 1 ? `${C.yellow}99` : i === k - 1 ? C.yellow : "#2C3440" }} />)}</div>
        <MoveRight size={26} color={blink ? "#22C55E" : "#1B3A26"} />
      </div>
    </div>
  );
};
const AiTag: React.FC = () => (
  <div style={{ position: "absolute", right: 40, bottom: 130, display: "flex", alignItems: "center", gap: 8, padding: "8px 16px", borderRadius: 30, background: "rgba(0,0,0,.55)", border: "1px solid #2C3440", fontFamily: BN, fontSize: 20, color: C.mute }}><Bot size={20} color={C.yellow} /> এআই প্রশিক্ষক · এআই কণ্ঠ</div>
);
const subChunks = (spec: Spec, starts: number[]) => spec.scenes.flatMap((s, i) => {
  const parts = s.vo.split(/(?<=[।?!,—])\s+/).reduce<string[]>((a, x) => { if (a.length && (a[a.length - 1].length < 24 || x.length < 10)) a[a.length - 1] += " " + x; else a.push(x); return a; }, []);
  const total = parts.reduce((n, x) => n + x.length, 0); let acc = 0; const b = starts[i] + LEAD;
  return parts.map((x) => { const from = b + (s.frames * acc) / total; acc += x.length; return { s: x, from, to: b + (s.frames * acc) / total }; });
});

export const DriveVideo: React.FC<{ spec: Spec }> = ({ spec }) => {
  const f = useCurrentFrame();
  const lens = spec.scenes.map(sceneLen);
  const starts = lens.reduce<number[]>((a, _, i) => [...a, i ? a[i - 1] + lens[i - 1] : 15], []);
  const chunks = subChunks(spec, starts);
  const cur = chunks.find((x) => f >= x.from && f < x.to + 4);
  const total = driveLen(spec);
  const busy = (fr: number) => spec.scenes.some((s, i) => fr >= starts[i] + LEAD - 6 && fr <= starts[i] + LEAD + s.frames + 4);
  return (
    <AbsoluteFill style={{ background: C.road }}>
      <RoadBg />
      {spec.scenes.map((s, i) => {
        const S = MAP[s.type] || SPoints; const len = lens[i];
        return (
          <Sequence key={i} from={starts[i]} durationInFrames={len}>
            <Fade len={len}><S s={s} spec={spec} vo={s.frames} /></Fade>
            <Sequence from={LEAD}><Audio src={staticFile(`drive/${spec.id}/vo/${String(i + 1).padStart(2, "0")}.mp3`)} /></Sequence>
            <Sequence from={0}><Audio src={staticFile(`aiu2/${i === 0 ? "swell" : s.type === "outro" ? "chime" : "whoosh"}.mp3`)} volume={0.3} /></Sequence>
          </Sequence>
        );
      })}
      <Header spec={spec} starts={starts} />
      <AiTag />
      {cur && <div style={{ position: "absolute", left: 0, right: 0, bottom: 34, display: "flex", justifyContent: "center", opacity: interpolate(f, [cur.from, cur.from + 5, cur.to, cur.to + 4], [0, 1, 1, 0], clamp) }}><div style={{ maxWidth: 1500, padding: "10px 28px 14px", borderRadius: 14, background: "rgba(0,0,0,.82)", borderBottom: `4px solid ${C.yellow}`, fontFamily: BN, fontSize: 36, fontWeight: 500, color: "#fff", textAlign: "center", lineHeight: 1.35 }}>{cur.s.replace(/[।,]$/, "")}</div></div>}
      <Audio src={staticFile("aiu2/music.mp3")} volume={(fr) => (busy(fr) ? 0.05 : 0.15) * interpolate(fr, [0, 30, total - 60, total], [0, 1, 1, 0], clamp)} />
    </AbsoluteFill>
  );
};
const Fade: React.FC<{ len: number; children: React.ReactNode }> = ({ len, children }) => {
  const f = useCurrentFrame();
  const o = Math.min(interpolate(f, [0, 12], [0, 1], { ...clamp, easing: ease }), interpolate(f, [len - 10, len], [1, 0], clamp));
  return <AbsoluteFill style={{ opacity: o, transform: `translateY(${(1 - o) * 14}px)` }}>{children}</AbsoluteFill>;
};
