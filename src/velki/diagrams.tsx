// কচু বিজ্ঞানী — chalk diagrams drawn live on the board while প্রফেসর চমক talks.
// Every diagram: viewBox 1000×700, props p = progress through the narration (0..1), t = local frame. Pure SVG, deterministic.
import React from "react";
import { interpolate, Easing, random } from "remotion";
import { Sun, Eye, FlaskConical, Lightbulb, CircleHelp, ChartLine, Megaphone, Smartphone, Zap, Snowflake, Flame, Leaf, Droplet, Pill, Ear } from "lucide-react";

export const CH = { w: "#F4F1E8", y: "#FFE27A", p: "#FF9EC4", c: "#8FE3FF", g: "#A6F28F", o: "#FFB36B", r: "#FF7A7A", v: "#C9A7FF", b: "#7FB2FF", dim: "rgba(244,241,232,.35)" };
export const FONT = "Atma";
const cl = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const eo = Easing.bezier(0.33, 1, 0.68, 1);
export const kk = (p: number, a: number, b: number) => interpolate(p, [a, b], [0, 1], { ...cl, easing: eo });
const bn = (n: number | string) => String(n).replace(/\d/g, (d) => "০১২৩৪৫৬৭৮৯"[+d]);
export type FP = { p: number; t: number; args?: any };

/* ---------- chalk primitives ---------- */
export const D: React.FC<{ d: string; k: number; c?: string; w?: number; dash?: string; fill?: string; op?: number; cap?: "round" | "butt" }> = ({ d, k, c = CH.w, w = 5, dash, fill = "none", op = 1, cap = "round" }) =>
  k <= 0 ? null : dash ? <path d={d} stroke={c} strokeWidth={w} fill={fill} strokeDasharray={dash} strokeLinecap={cap} strokeLinejoin="round" opacity={op * Math.min(1, k * 3)} filter="url(#chalk)" />
    : <path d={d} pathLength={1} stroke={c} strokeWidth={w} fill={fill} fillOpacity={k} strokeDasharray="1 1" strokeDashoffset={1 - k} strokeLinecap={cap} strokeLinejoin="round" opacity={op} filter="url(#chalk)" />;
export const T: React.FC<{ x: number; y: number; k: number; s?: number; c?: string; a?: "start" | "middle" | "end"; children: React.ReactNode; w?: number }> = ({ x, y, k, s = 34, c = CH.w, a = "middle", children, w = 600 }) =>
  k <= 0 ? null : <text x={x} y={y + (1 - k) * 10} fontFamily={FONT} fontSize={s} fontWeight={w} fill={c} textAnchor={a} opacity={k} filter="url(#chalk)">{children}</text>;
export const Arrow: React.FC<{ x1: number; y1: number; x2: number; y2: number; k: number; c?: string; w?: number }> = ({ x1, y1, x2, y2, k, c = CH.w, w = 5 }) => {
  if (k <= 0) return null;
  const x = x1 + (x2 - x1) * k, y = y1 + (y2 - y1) * k, a = Math.atan2(y2 - y1, x2 - x1), h = 18;
  return <g filter="url(#chalk)"><line x1={x1} y1={y1} x2={x} y2={y} stroke={c} strokeWidth={w} strokeLinecap="round" />
    {k > 0.15 && <path d={`M${x - h * Math.cos(a - 0.45)} ${y - h * Math.sin(a - 0.45)} L${x} ${y} L${x - h * Math.cos(a + 0.45)} ${y - h * Math.sin(a + 0.45)}`} stroke={c} strokeWidth={w} fill="none" strokeLinecap="round" strokeLinejoin="round" />}</g>;
};
const Ic: React.FC<{ I: React.FC<any>; x: number; y: number; s: number; c: string; k: number }> = ({ I, x, y, s, c, k }) =>
  k <= 0 ? null : <g opacity={k} transform={`translate(${x} ${y}) scale(${0.6 + 0.4 * k}) translate(${-s / 2} ${-s / 2})`}><I width={s} height={s} color={c} strokeWidth={2.2} /></g>;
const circ = (cx: number, cy: number, r: number) => `M${cx - r} ${cy} a${r} ${r} 0 1 0 ${2 * r} 0 a${r} ${r} 0 1 0 ${-2 * r} 0`;
const SunG: React.FC<{ x: number; y: number; r?: number; k: number; t: number }> = ({ x, y, r = 46, k, t }) => (
  <g opacity={k}>
    <circle cx={x} cy={y} r={r} fill={CH.y} opacity={0.9} filter="url(#chalk)" />
    {Array.from({ length: 12 }, (_, i) => { const a = (i / 12) * Math.PI * 2 + t / 90; const r1 = r + 12, r2 = r + 30 + 6 * Math.sin(t / 6 + i);
      return <line key={i} x1={x + r1 * Math.cos(a)} y1={y + r1 * Math.sin(a)} x2={x + r2 * Math.cos(a)} y2={y + r2 * Math.sin(a)} stroke={CH.y} strokeWidth={5} strokeLinecap="round" filter="url(#chalk)" />; })}
  </g>
);
const RAIN = [CH.r, CH.o, CH.y, CH.g, CH.c, CH.b, CH.v];
const NAMES7 = ["লাল", "কমলা", "হলুদ", "সবুজ", "আসমানি", "নীল", "বেগুনি"];

/* ---------- 1. scientific method cycle ---------- */
const Method: React.FC<FP> = ({ p, t }) => {
  const N = [{ I: CircleHelp, l: "প্রশ্ন", c: CH.y }, { I: Lightbulb, l: "অনুমান", c: CH.o }, { I: FlaskConical, l: "পরীক্ষা", c: CH.c }, { I: ChartLine, l: "ফলাফল", c: CH.g }, { I: Megaphone, l: "শেয়ার", c: CH.p }];
  const cx = 500, cy = 350, R = 245;
  const pos = N.map((_, i) => { const a = -Math.PI / 2 + (i / 5) * Math.PI * 2; return [cx + R * Math.cos(a), cy + R * Math.sin(a)]; });
  const run = (t / 70) % 5;
  return <g>
    {N.map((n, i) => { const k = kk(p, i * 0.14, i * 0.14 + 0.1); const [x, y] = pos[i]; const [x2, y2] = pos[(i + 1) % 5];
      const on = Math.floor(run) === i && p > 0.75;
      return <g key={i}>
        <circle cx={x} cy={y} r={on ? 74 : 66} fill="rgba(255,255,255,.06)" stroke={n.c} strokeWidth={5} opacity={k} filter="url(#chalk)" />
        <Ic I={n.I} x={x} y={y - 12} s={54} c={n.c} k={k} />
        <T x={x} y={y + 42} k={k} s={28} c={n.c}>{n.l}</T>
        <Arrow x1={x + (x2 - x) * 0.3} y1={y + (y2 - y) * 0.3} x2={x + (x2 - x) * 0.7} y2={y + (y2 - y) * 0.7} k={kk(p, i * 0.14 + 0.08, i * 0.14 + 0.16)} c={CH.dim} w={4} />
      </g>; })}
    <T x={cx} y={cy + 6} k={kk(p, 0.72, 0.8)} s={40} c={CH.w}>বিজ্ঞানীর</T>
    <T x={cx} y={cy + 52} k={kk(p, 0.74, 0.82)} s={40} c={CH.y}>খাতা</T>
  </g>;
};

/* ---------- 2. why the sky is blue: scattering ---------- */
const Scatter: React.FC<FP> = ({ p, t }) => {
  const beam = kk(p, 0.05, 0.25), mol = kk(p, 0.2, 0.35), sc = kk(p, 0.35, 0.65), eye = kk(p, 0.6, 0.75);
  const ms = Array.from({ length: 16 }, (_, i) => [300 + random(`mx${i}`) * 520, 180 + random(`my${i}`) * 260]);
  return <g>
    <SunG x={100} y={110} k={kk(p, 0, 0.1)} t={t} />
    <rect x={250} y={150} width={620} height={330} rx={30} fill="rgba(143,227,255,.06)" stroke={CH.dim} strokeWidth={3} strokeDasharray="10 12" opacity={mol} />
    <T x={560} y={140} k={mol} s={28} c={CH.dim}>বায়ুমণ্ডল: নাইট্রোজেন আর অক্সিজেন অণু</T>
    {RAIN.map((c, i) => <D key={i} d={`M150 ${150 + i * 4} L${300 + 520 * beam} ${300 + i * 4}`} k={beam} c={c} w={4} />)}
    {ms.map(([x, y], i) => <g key={i} opacity={mol}>
      <circle cx={x} cy={y} r={9} fill={CH.w} filter="url(#chalk)" />
      {[0, 1, 2, 3].map((j) => { const a = random(`a${i}${j}`) * Math.PI * 2; const L = 30 + 34 * ((t / 20 + j * 0.25 + i * 0.07) % 1);
        return <line key={j} x1={x} y1={y} x2={x + L * Math.cos(a) * sc} y2={y + L * Math.sin(a) * sc} stroke={j < 3 ? CH.b : CH.r} strokeWidth={4} strokeLinecap="round" opacity={sc * (1 - ((t / 20 + j * 0.25 + i * 0.07) % 1)) * 1.4} />; })}
    </g>)}
    <g opacity={eye}><ellipse cx={870} cy={600} rx={60} ry={34} fill="none" stroke={CH.w} strokeWidth={5} filter="url(#chalk)" /><circle cx={870} cy={600} r={18} fill={CH.b} /></g>
    {[0, 1, 2].map((i) => <Arrow key={i} x1={560 + i * 90} y1={430} x2={830 + i * 10} y2={575} k={kk(p, 0.62 + i * 0.03, 0.76 + i * 0.03)} c={CH.b} w={4} />)}
    <T x={330} y={600} k={kk(p, 0.7, 0.8)} s={44} c={CH.b}>নীল ছড়ায় অনেক বেশি!</T>
    <T x={330} y={650} k={kk(p, 0.75, 0.85)} s={30} c={CH.dim}>লাল প্রায় সোজা চলে যায়</T>
  </g>;
};

/* ---------- 3. sunset: long path through air ---------- */
const Sunset: React.FC<FP> = ({ p, t }) => {
  const a = kk(p, 0, 0.15), noon = kk(p, 0.15, 0.4), eve = kk(p, 0.45, 0.8);
  return <g>
    <D d="M-20 760 A900 520 0 0 1 1020 760" k={a} c={CH.g} w={6} />
    <D d="M-20 760 A900 520 0 0 1 1020 760" k={a} c="rgba(143,227,255,.0)" w={0} />
    <path d="M-60 760 A960 640 0 0 1 1060 760" fill="none" stroke="rgba(143,227,255,.35)" strokeWidth={70} opacity={a} />
    <T x={820} y={300} k={a} s={26} c={CH.dim}>বাতাসের স্তর</T>
    <circle cx={500} cy={250} r={8} fill={CH.w} opacity={a} /><T x={500} y={290} k={a} s={24} c={CH.w}>তুমি</T>
    <SunG x={500} y={40} r={30} k={noon} t={t} />
    <Arrow x1={500} y1={90} x2={500} y2={230} k={noon} c={CH.y} />
    <T x={640} y={160} k={noon} s={30} c={CH.y}>দুপুর: ছোট পথ</T>
    <SunG x={60} y={330} r={30} k={eve} t={t} />
    <defs><linearGradient id="sg" x1="0" x2="1"><stop offset="0" stopColor={CH.w} /><stop offset=".5" stopColor={CH.o} /><stop offset="1" stopColor={CH.r} /></linearGradient></defs>
    <path d={`M100 320 L${100 + 380 * eve} ${320 - 66 * eve}`} stroke="url(#sg)" strokeWidth={10} strokeLinecap="round" opacity={eve} filter="url(#chalk)" />
    {[0, 1, 2, 3, 4].map((i) => <Arrow key={i} x1={150 + i * 65} y1={312 - i * 11} x2={130 + i * 65} y2={230 - i * 11} k={kk(p, 0.55 + i * 0.04, 0.68 + i * 0.04)} c={CH.b} w={4} />)}
    <T x={250} y={420} k={kk(p, 0.7, 0.85)} s={32} c={CH.o}>সন্ধ্যা: লম্বা পথ</T>
    <T x={250} y={462} k={kk(p, 0.75, 0.9)} s={26} c={CH.b}>পথেই নীল হারিয়ে যায়</T>
  </g>;
};

/* ---------- 4. prism ---------- */
const Prism: React.FC<FP> = ({ p }) => {
  const a = kk(p, 0, 0.15), b = kk(p, 0.15, 0.35), c = kk(p, 0.35, 0.65);
  return <g>
    <D d="M340 520 L480 200 L620 520 Z" k={a} c={CH.c} w={6} fill="rgba(143,227,255,.08)" />
    <D d="M20 420 L390 400" k={b} c={CH.w} w={10} />
    <T x={170} y={380} k={b} s={30}>সাদা আলো</T>
    {RAIN.map((col, i) => <D key={i} d={`M520 ${380 + i * 6} L840 ${200 + i * 52}`} k={kk(p, 0.35 + i * 0.03, 0.55 + i * 0.03)} c={col} w={8} />)}
    {NAMES7.map((n, i) => <T key={i} x={856} y={210 + i * 52} k={kk(p, 0.55 + i * 0.03, 0.62 + i * 0.03)} s={24} c={RAIN[i]} a="start">{n}</T>)}
    <T x={480} y={620} k={c} s={34} c={CH.y}>প্রতিটা রং আলাদা পরিমাণ বাঁকে</T>
  </g>;
};

/* ---------- 5. raindrop: refract → reflect → refract ---------- */
const Raindrop: React.FC<FP> = ({ p, t }) => {
  const a = kk(p, 0, 0.15), r1 = kk(p, 0.15, 0.35), r2 = kk(p, 0.35, 0.55), r3 = kk(p, 0.55, 0.75);
  return <g>
    <SunG x={70} y={90} r={34} k={a} t={t} />
    <D d={circ(520, 360, 210)} k={a} c={CH.c} w={6} fill="rgba(143,227,255,.06)" />
    <T x={520} y={620} k={a} s={28} c={CH.dim}>একটা বৃষ্টির ফোঁটা (অনেক বড় করে)</T>
    <D d="M60 190 L370 205" k={r1} c={CH.w} w={9} />
    <D d="M370 205 L700 470" k={r2} c={CH.w} w={6} />
    {[CH.r, CH.y, CH.g, CH.b, CH.v].map((c, i) => <D key={i} d={`M${700} 470 L${470 + i * 18} ${550 - i * 4}`} k={r3} c={c} w={5} />)}
    {[CH.r, CH.y, CH.g, CH.b, CH.v].map((c, i) => <D key={"o" + i} d={`M${470 + i * 18} ${550 - i * 4} L${140 + i * 30} ${650 - i * 2}`} k={kk(p, 0.68, 0.85)} c={c} w={5} />)}
    <T x={340} y={190} k={r1} s={26} c={CH.y}>১. ঢুকতে বাঁকে</T>
    <T x={790} y={480} k={r2} s={26} c={CH.y} a="start">২. পেছনে প্রতিফলন</T>
    <T x={240} y={540} k={r3} s={26} c={CH.y}>৩. বেরোতে আবার বাঁকে</T>
    <T x={800} y={150} k={kk(p, 0.8, 0.92)} s={40} c={CH.p}>প্রায় ৪২°</T>
    <T x={800} y={200} k={kk(p, 0.82, 0.94)} s={26} c={CH.dim}>সূর্য পেছনে, বৃষ্টি সামনে</T>
  </g>;
};

/* ---------- 6. blind spot: eye cross-section ---------- */
const BlindSpot: React.FC<FP> = ({ p }) => {
  const a = kk(p, 0, 0.2), b = kk(p, 0.2, 0.45), c = kk(p, 0.45, 0.7), d = kk(p, 0.7, 0.9);
  return <g>
    <D d={circ(420, 330, 200)} k={a} c={CH.w} w={6} />
    <D d="M240 250 Q205 330 240 410" k={a} c={CH.c} w={8} />
    <T x={170} y={200} k={a} s={26} c={CH.c}>লেন্স</T>
    <D d="M560 160 A200 200 0 0 1 560 500" k={b} c={CH.p} w={12} />
    <T x={720} y={150} k={b} s={28} c={CH.p} a="start">রেটিনা (আলো টের পায়)</T>
    <D d="M612 300 L860 260 M612 360 L860 400" k={c} c={CH.y} w={10} />
    <T x={880} y={340} k={c} s={28} c={CH.y} a="start">স্নায়ু → মগজ</T>
    <circle cx={616} cy={330} r={22 + 4 * Math.sin(p * 40)} fill="none" stroke={CH.r} strokeWidth={5} opacity={c} />
    <T x={640} y={580} k={c} s={34} c={CH.r}>এখানে আলো-কোষ নেই = অন্ধ বিন্দু</T>
    <g opacity={d}><rect x={60} y={560} width={300} height={110} rx={10} fill={CH.w} opacity={0.95} /><text x={120} y={630} fontSize={60} fontFamily="Montserrat" fontWeight={800} fill="#222">+</text><circle cx={290} cy={613} r={18} fill="#222" opacity={interpolate(p, [0.85, 0.9, 0.95], [1, 0, 0], cl)} /></g>
  </g>;
};

/* ---------- 7. Müller-Lyer ---------- */
const Illusion: React.FC<FP> = ({ p }) => {
  const a = kk(p, 0, 0.25), b = kk(p, 0.3, 0.55), r = kk(p, 0.6, 0.85);
  const fin = (x: number, y: number, dir: number) => `M${x} ${y} l${dir * 50} -45 M${x} ${y} l${dir * 50} 45`;
  return <g>
    <D d="M250 220 L750 220" k={a} w={9} /><D d={fin(250, 220, -1) + fin(750, 220, 1)} k={a} w={8} c={CH.y} />
    <D d="M250 470 L750 470" k={b} w={9} /><D d={fin(250, 470, 1) + fin(750, 470, -1)} k={b} w={8} c={CH.p} />
    <T x={500} y={140} k={kk(p, 0.2, 0.3)} s={34} c={CH.dim}>কোনটা লম্বা?</T>
    <D d="M250 120 L250 600 M750 120 L750 600" k={r} c={CH.g} w={4} dash="14 14" />
    <T x={500} y={640} k={kk(p, 0.75, 0.9)} s={48} c={CH.g}>দুটোই সমান!</T>
  </g>;
};

/* ---------- 8. buoyancy ---------- */
const Buoyancy: React.FC<FP> = ({ p, t }) => {
  const a = kk(p, 0, 0.15), ball = kk(p, 0.15, 0.45), boat = kk(p, 0.45, 0.7), f = kk(p, 0.7, 0.9);
  const wave = (y: number) => `M60 ${y} ${Array.from({ length: 24 }, (_, i) => `Q${80 + i * 38} ${y + (i % 2 ? 8 : -8) * Math.sin(t / 12)} ${98 + i * 38} ${y}`).join(" ")}`;
  return <g>
    <D d="M60 260 L60 640 L960 640 L960 260" k={a} w={6} />
    <rect x={64} y={300} width={892} height={336} fill="rgba(127,178,255,.16)" opacity={a} />
    <D d={wave(300)} k={a} c={CH.b} w={4} />
    <circle cx={280} cy={260 + 330 * ball} r={34} fill="#cfd6dd" stroke={CH.w} strokeWidth={4} opacity={Math.min(1, ball * 4)} filter="url(#chalk)" />
    <Arrow x1={280} y1={300 + 300 * ball} x2={280} y2={380 + 300 * ball} k={ball > 0.05 ? 1 : 0} c={CH.r} />
    <T x={280} y={200} k={ball} s={28} c={CH.r}>গোল্লা: ডুবে যায়</T>
    <g opacity={boat} transform={`translate(0 ${Math.sin(t / 14) * 4})`}>
      <path d="M560 270 L840 270 L800 330 L600 330 Z" fill="#cfd6dd" stroke={CH.w} strokeWidth={5} filter="url(#chalk)" />
      <path d="M600 330 L800 330 L840 270" fill="none" />
    </g>
    <T x={700} y={200} k={boat} s={28} c={CH.g}>নৌকা: ভাসে!</T>
    <Arrow x1={700} y1={470} x2={700} y2={345} k={f} c={CH.g} w={7} />
    <T x={700} y={520} k={f} s={30} c={CH.g}>পানির ঠেলা = সরানো পানির ওজন</T>
    <D d="M560 300 L840 300" k={f} c={CH.y} w={4} dash="10 10" />
  </g>;
};

/* ---------- 9. friction ---------- */
const Friction: React.FC<FP> = ({ p, t }) => {
  const a = kk(p, 0, 0.3), b = kk(p, 0.35, 0.65), c = kk(p, 0.65, 0.9);
  const jag = (y: number, up: number, off: number) => `M100 ${y} ` + Array.from({ length: 20 }, (_, i) => `L${120 + i * 40 + off} ${y + (i % 2 ? up : 0)}`).join(" ") + ` L940 ${y}`;
  const pull = Math.sin(t / 5) * 4 * a;
  return <g>
    {Array.from({ length: 9 }, (_, i) => <line key={i} x1={150 + pull * (i % 2 ? 1 : -1)} y1={90 + i * 18} x2={850 + pull * (i % 2 ? 1 : -1)} y2={90 + i * 18} stroke={i % 2 ? CH.y : CH.c} strokeWidth={6} opacity={a} filter="url(#chalk)" />)}
    <Arrow x1={150} y1={170} x2={40} y2={170} k={a} c={CH.r} /><Arrow x1={850} y1={170} x2={960} y2={170} k={a} c={CH.r} />
    <T x={500} y={300} k={a} s={30} c={CH.y}>দুটো খাতার পাতা একটার ফাঁকে আরেকটা</T>
    <D d={circ(500, 500, 150)} k={b} c={CH.dim} w={4} />
    <D d={jag(470, -26, 0)} k={b} c={CH.o} w={5} />
    <D d={jag(520, 26, 20)} k={b} c={CH.c} w={5} />
    <T x={500} y={690} k={b} s={28} c={CH.dim}>খুব কাছ থেকে: খাঁজে খাঁজে আটকে যায়</T>
    <T x={850} y={420} k={c} s={46} c={CH.p}>শত শত পাতা</T>
    <T x={850} y={470} k={c} s={30} c={CH.p}>= বিশাল ঘর্ষণ</T>
  </g>;
};

/* ---------- 10. magnet field ---------- */
const Magnet: React.FC<FP> = ({ p, t }) => {
  const a = kk(p, 0, 0.15), f = kk(p, 0.15, 0.6), clip = kk(p, 0.65, 0.85);
  return <g>
    <g opacity={a} filter="url(#chalk)"><rect x={330} y={310} width={170} height={80} fill={CH.r} /><rect x={500} y={310} width={170} height={80} fill={CH.b} />
      <text x={415} y={368} fontFamily="Montserrat" fontWeight={800} fontSize={46} fill="#fff" textAnchor="middle">N</text><text x={585} y={368} fontFamily="Montserrat" fontWeight={800} fontSize={46} fill="#fff" textAnchor="middle">S</text></g>
    {[60, 110, 170, 240].map((h, i) => <g key={i}>
      <D d={`M340 330 C200 ${330 - h} 800 ${330 - h} 660 330`} k={kk(f, i * 0.15, i * 0.15 + 0.4)} c={CH.dim} w={4} />
      <D d={`M340 370 C200 ${370 + h} 800 ${370 + h} 660 370`} k={kk(f, i * 0.15 + 0.1, i * 0.15 + 0.5)} c={CH.dim} w={4} />
    </g>)}
    {[60, 110, 170, 240].map((h, i) => { const s = ((t / 50 + i * 0.3) % 1); const x = 340 + 320 * s, y = 330 - h * 0.75 * Math.sin(Math.PI * s);
      return <circle key={i} cx={x} cy={y} r={7} fill={CH.y} opacity={f} />; })}
    <T x={500} y={110} k={f} s={32} c={CH.y}>অদৃশ্য চৌম্বক ক্ষেত্র</T>
    {[0, 1, 2].map((i) => <g key={i} transform={`translate(${240 - 120 * (1 - clip) - i * 26} ${350 + i * 16}) rotate(${-30 + i * 20})`} opacity={clip}>
      <rect x={-24} y={-9} width={48} height={18} rx={9} fill="none" stroke={CH.w} strokeWidth={4} filter="url(#chalk)" /></g>)}
    <T x={500} y={620} k={kk(p, 0.75, 0.9)} s={34} c={CH.g}>একই মেরু ঠেলে, বিপরীত মেরু টানে</T>
  </g>;
};

/* ---------- 11. Earth as a magnet ---------- */
const EarthMag: React.FC<FP> = ({ p, t }) => {
  const a = kk(p, 0, 0.2), f = kk(p, 0.2, 0.6), c = kk(p, 0.6, 0.85);
  return <g>
    <circle cx={430} cy={350} r={170} fill="rgba(127,178,255,.22)" stroke={CH.b} strokeWidth={6} opacity={a} filter="url(#chalk)" />
    <D d="M330 260 C370 230 420 250 440 290 C460 330 400 360 380 330 Z M470 380 C520 360 560 400 540 450 C510 470 470 440 470 380 Z" k={a} c={CH.g} w={4} fill="rgba(166,242,143,.25)" />
    <g transform="rotate(-11 430 350)" opacity={a}><rect x={418} y={230} width={24} height={240} fill={CH.dim} /></g>
    {[90, 150, 220].map((h, i) => <g key={i}><D d={`M430 180 C${430 - h - 160} 120 ${430 - h - 160} 580 430 520`} k={kk(f, i * 0.2, i * 0.2 + 0.5)} c={CH.y} w={3} />
      <D d={`M430 180 C${430 + h + 160} 120 ${430 + h + 160} 580 430 520`} k={kk(f, i * 0.2, i * 0.2 + 0.5)} c={CH.y} w={3} /></g>)}
    <g transform={`translate(830 350)`} opacity={c}>
      <circle r={70} fill="rgba(255,255,255,.06)" stroke={CH.w} strokeWidth={5} filter="url(#chalk)" />
      <g transform={`rotate(${-90 + 20 * Math.sin(t / 8) * (1 - c)})`}><path d="M0 -8 L58 0 L0 8 Z" fill={CH.r} /><path d="M0 -8 L-58 0 L0 8 Z" fill={CH.w} /></g>
      <text y={-84} textAnchor="middle" fontFamily={FONT} fontSize={30} fill={CH.r}>উত্তর</text>
    </g>
    <T x={430} y={640} k={c} s={34} c={CH.y}>পৃথিবী নিজেই এক বিশাল চুম্বক</T>
  </g>;
};

/* ---------- 12. sound wave + echo ---------- */
const Wave: React.FC<FP> = ({ p, t }) => {
  const a = kk(p, 0, 0.15), w = kk(p, 0.15, 0.55), e = kk(p, 0.55, 0.9);
  const cols = 26;
  return <g>
    <g opacity={a} filter="url(#chalk)"><rect x={40} y={190} width={60} height={120} fill={CH.dim} /><path d={`M100 190 L${160 + 6 * Math.sin(t / 2)} 140 L${160 + 6 * Math.sin(t / 2)} 360 L100 310 Z`} fill="none" stroke={CH.w} strokeWidth={5} /></g>
    {Array.from({ length: cols }, (_, i) => { const x0 = 200 + i * 26; const dx = 10 * Math.sin(i * 0.7 - t / 4) * w; return Array.from({ length: 7 }, (_, j) =>
      <circle key={`${i}-${j}`} cx={x0 + dx} cy={170 + j * 26} r={5} fill={CH.c} opacity={w * (i / cols < w ? 1 : 0)} />); })}
    <g opacity={a}><Ic I={Ear} x={930} y={250} s={80} c={CH.w} k={w} /></g>
    <T x={520} y={400} k={w} s={30} c={CH.c}>বাতাসের কণা ধাক্কা দিয়ে দিয়ে কাঁপুনি পৌঁছে দেয়</T>
    <D d="M900 450 L900 690" k={e} c={CH.o} w={12} /><T x={900} y={440} k={e} s={26} c={CH.o}>দেয়াল</T>
    {[0, 1, 2].map((i) => { const s = ((t / 40 + i / 3) % 1) * 2; const x = s < 1 ? 160 + 720 * s : 880 - 720 * (s - 1);
      return <path key={i} d={`M${x} 520 a${50} ${80} 0 0 ${s < 1 ? 1 : 0} 0 140`} stroke={s < 1 ? CH.y : CH.p} strokeWidth={5} fill="none" opacity={e} filter="url(#chalk)" />; })}
    <T x={420} y={505} k={e} s={30} c={CH.p}>ফিরে এলেই প্রতিধ্বনি</T>
    <T x={420} y={700} k={kk(p, 0.75, 0.9)} s={28} c={CH.y}>বাতাসে প্রতি সেকেন্ডে প্রায় ৩৪৩ মিটার</T>
  </g>;
};

/* ---------- 13. lightning + counting ---------- */
const Lightning: React.FC<FP> = ({ p, t }) => {
  const a = kk(p, 0, 0.15), ch = kk(p, 0.12, 0.3), bolt = kk(p, 0.3, 0.38), cnt = kk(p, 0.45, 0.85);
  const flash = interpolate(p, [0.3, 0.33, 0.42], [0, 1, 0], cl);
  return <g>
    <rect x={-100} y={-100} width={1200} height={900} fill="#fff" opacity={flash * 0.35} />
    <D d="M180 160 C140 90 260 40 320 90 C360 30 480 40 500 100 C580 70 650 130 610 190 C640 240 560 270 520 240 L230 240 C150 250 120 190 180 160 Z" k={a} c={CH.w} w={5} fill="rgba(255,255,255,.08)" />
    {Array.from({ length: 8 }, (_, i) => <T key={i} x={230 + i * 45} y={120 - (i % 2) * 20} k={ch} s={30} c={CH.r}>+</T>)}
    {Array.from({ length: 8 }, (_, i) => <T key={"n" + i} x={230 + i * 45} y={225} k={ch} s={34} c={CH.b}>−</T>)}
    <D d="M400 240 L360 330 L410 340 L350 450 L400 460 L330 600" k={bolt} c={CH.y} w={10} />
    <D d="M60 610 L760 610" k={a} c={CH.g} w={5} />
    <g opacity={cnt}>
      {[1, 2, 3].map((n, i) => <g key={n} opacity={kk(p, 0.5 + i * 0.08, 0.55 + i * 0.08)}><circle cx={600 + i * 110} cy={420} r={44} fill="none" stroke={CH.o} strokeWidth={5} filter="url(#chalk)" /><text x={600 + i * 110} y={436} textAnchor="middle" fontFamily={FONT} fontSize={46} fill={CH.o}>{bn(n)}</text></g>)}
      <T x={710} y={340} k={cnt} s={30} c={CH.w}>ঝিলিক দেখেই গোনো…</T>
      <T x={800} y={530} k={kk(p, 0.72, 0.82)} s={44} c={CH.y}>৩ সেকেন্ড ≈ ১ কিলোমিটার</T>
      <T x={800} y={590} k={kk(p, 0.78, 0.88)} s={28} c={CH.p}>গর্জন শুনলেই ঘরে ঢোকো</T>
    </g>
    {t % 120 < 3 && p > 0.4 && <rect x={-100} y={-100} width={1200} height={900} fill="#fff" opacity={0.12} />}
  </g>;
};

/* ---------- 14. lithium-ion battery ---------- */
const Battery: React.FC<FP> = ({ p, t }) => {
  const a = kk(p, 0, 0.15), chg = p < 0.55, io = kk(p, 0.15, 0.3);
  return <g>
    <D d="M150 150 L850 150 L850 520 L150 520 Z" k={a} c={CH.w} w={6} />
    <rect x={170} y={170} width={150} height={330} fill="rgba(127,178,255,.25)" opacity={a} /><rect x={680} y={170} width={150} height={330} fill="rgba(255,179,107,.25)" opacity={a} />
    <T x={245} y={560} k={a} s={26} c={CH.b}>গ্রাফাইট (−)</T><T x={755} y={560} k={a} s={26} c={CH.o}>ক্যাথোড (+)</T>
    {Array.from({ length: 10 }, (_, i) => { const ph = ((t / 60 + i / 10) % 1); const x = chg ? 700 - 480 * ph : 300 + 480 * ph; const y = 200 + (i * 31) % 290;
      return <g key={i} opacity={io}><circle cx={x} cy={y} r={14} fill={CH.y} filter="url(#chalk)" /><text x={x} y={y + 7} textAnchor="middle" fontSize={20} fontFamily="Montserrat" fontWeight={800} fill="#333">+</text></g>; })}
    <T x={500} y={110} k={io} s={34} c={chg ? CH.g : CH.p}>{chg ? "চার্জ: লিথিয়াম আয়ন যায় বাঁ দিকে" : "ব্যবহার: আয়ন ফেরে ডানে, ফোন চলে"}</T>
    <D d="M245 150 L245 60 L420 60 M580 60 L755 60 L755 150" k={kk(p, 0.55, 0.7)} c={CH.c} w={5} />
    <g opacity={kk(p, 0.6, 0.72)}><Ic I={Smartphone} x={500} y={60} s={70} c={CH.c} k={1} /></g>
    {Array.from({ length: 5 }, (_, i) => { const s = (t / 40 + i / 5) % 1; return <circle key={i} cx={245 + 510 * s} cy={60} r={6} fill={CH.c} opacity={!chg ? kk(p, 0.62, 0.7) : 0} />; })}
    <T x={500} y={650} k={kk(p, 0.8, 0.92)} s={36} c={CH.r}>সবচেয়ে বড় শত্রু: অতিরিক্ত গরম</T>
  </g>;
};

/* ---------- 15. rice starch swelling ---------- */
const Starch: React.FC<FP> = ({ p, t }) => {
  const a = kk(p, 0, 0.15), wet = kk(p, 0.2, 0.6), pc = kk(p, 0.65, 0.9);
  const sw = 1 + 0.9 * wet;
  return <g>
    <g transform={`translate(380 330) scale(${sw})`} opacity={a}>
      <ellipse rx={150} ry={70} fill="rgba(255,255,255,.08)" stroke={CH.w} strokeWidth={5 / sw} filter="url(#chalk)" />
      {Array.from({ length: 14 }, (_, i) => <ellipse key={i} cx={-100 + (i % 7) * 33} cy={-22 + Math.floor(i / 7) * 44} rx={13 * (1 + 0.5 * wet)} ry={10 * (1 + 0.5 * wet)} fill={CH.y} opacity={0.7} />)}
    </g>
    {Array.from({ length: 18 }, (_, i) => { const s = (t / 50 + i / 18) % 1; const ang = (i / 18) * Math.PI * 2; const r = 330 - 200 * s;
      return <circle key={i} cx={380 + r * Math.cos(ang)} cy={330 + r * 0.6 * Math.sin(ang)} r={8} fill={CH.b} opacity={wet > 0 && wet < 1 ? 0.9 * (1 - s) + 0.1 : 0} />; })}
    <T x={380} y={110} k={a} s={30} c={CH.w}>চালের দানায় স্টার্চের কণা</T>
    <T x={380} y={600} k={wet} s={32} c={CH.b}>গরম পানি ঢোকে → কণা ফুলে ওঠে</T>
    <g opacity={pc}><rect x={760} y={180} width={60} height={300} rx={30} fill="none" stroke={CH.w} strokeWidth={5} filter="url(#chalk)" /><rect x={772} y={480 - 270 * pc} width={36} height={270 * pc} rx={18} fill={CH.r} />
      <T x={890} y={220} k={pc} s={36} c={CH.r} a="start">১২০°</T><T x={890} y={430} k={pc} s={30} c={CH.w} a="start">১০০°</T>
      <T x={790} y={560} k={pc} s={28} c={CH.y}>প্রেশার কুকারে</T><T x={790} y={600} k={pc} s={28} c={CH.y}>পানি ফোটে বেশি তাপে</T></g>
  </g>;
};

/* ---------- 16. fridge heat pump ---------- */
const Fridge: React.FC<FP> = ({ p, t }) => {
  const a = kk(p, 0, 0.15), loop = kk(p, 0.15, 0.4), heat = kk(p, 0.4, 0.75);
  const path = "M300 170 L300 470 L680 470 L680 170 Z";
  return <g>
    <D d="M200 90 L560 90 L560 620 L200 620 Z" k={a} c={CH.w} w={6} />
    <T x={380} y={70} k={a} s={28} c={CH.dim}>ফ্রিজের ভেতর</T>
    <D d="M240 160 C260 140 280 180 300 160 C320 140 340 180 360 160 C380 140 400 180 420 160 C440 140 460 180 480 160 C500 140 520 180 530 160" k={loop} c={CH.c} w={8} />
    <T x={380} y={230} k={loop} s={26} c={CH.c}>ঠান্ডা কয়েল: তাপ শুষে নেয়</T>
    <D d="M700 160 C720 140 740 180 760 160 C780 140 800 180 820 160 L820 560" k={loop} c={CH.r} w={8} />
    <rect x={600} y={520} width={120} height={90} rx={14} fill="rgba(255,255,255,.08)" stroke={CH.w} strokeWidth={5} opacity={loop} filter="url(#chalk)" />
    <T x={660} y={650} k={loop} s={24} c={CH.w}>কম্প্রেসর</T>
    <D d={path} k={0} />
    {Array.from({ length: 12 }, (_, i) => { const s = (t / 80 + i / 12) % 1; const pts = [[530, 160], [700, 160], [820, 160], [820, 560], [720, 565], [560, 565], [530, 160]];
      const seg = s * (pts.length - 1); const j = Math.floor(seg), f = seg - j; const [x1, y1] = pts[j], [x2, y2] = pts[j + 1];
      return <circle key={i} cx={x1 + (x2 - x1) * f} cy={y1 + (y2 - y1) * f} r={7} fill={j < 1 ? CH.c : j < 3 ? CH.r : CH.o} opacity={loop} />; })}
    {[0, 1, 2].map((i) => <g key={i}><Arrow x1={330 + i * 80} y1={420} x2={330 + i * 80} y2={250} k={heat} c={CH.o} w={4} />
      <Arrow x1={840} y1={220 + i * 110} x2={960} y2={220 + i * 110} k={heat} c={CH.r} w={5} /></g>)}
    <T x={380} y={480} k={heat} s={26} c={CH.o}>খাবারের তাপ</T>
    <T x={900} y={600} k={heat} s={26} c={CH.r}>পেছনে গরম বাতাস</T>
    <T x={500} y={690} k={kk(p, 0.78, 0.92)} s={36} c={CH.y}>ফ্রিজ ঠান্ডা বানায় না, তাপ বের করে দেয়!</T>
  </g>;
};

/* ---------- 17. pH + turmeric ---------- */
const Ph: React.FC<FP> = ({ p }) => {
  const a = kk(p, 0, 0.2), m = kk(p, 0.25, 0.75), stain = kk(p, 0.55, 0.7);
  const cols = ["#ff4d4d", "#ff7a3d", "#ffa63d", "#ffd23d", "#e8f04a", "#b8f04a", "#7ee07e", "#5cd6a0", "#4cc9c9", "#4c9ee8", "#5a74e8", "#7a5ae8", "#9a4ce8", "#b23cd6", "#c02eb8"];
  const x = 145 + 728 * (0.1 + 0.8 * m);
  return <g>
    {cols.map((c, i) => <rect key={i} x={120 + i * 52} y={150} width={50} height={60} fill={c} opacity={a * 0.85} filter="url(#chalk)" />)}
    {[0, 7, 14].map((n) => <T key={n} x={145 + n * 52} y={250} k={a} s={30}>{bn(n)}</T>)}
    <T x={190} y={120} k={a} s={28} c={CH.r}>অম্ল (লেবু, তেঁতুল)</T><T x={820} y={120} k={a} s={28} c={CH.v}>ক্ষার (সাবান, সোডা)</T>
    <path d={`M${x} 280 l-16 26 l32 0 Z`} fill={CH.y} opacity={m} />
    <g opacity={kk(p, 0.25, 0.4)}><rect x={300} y={360} width={400} height={240} rx={18} fill="#f3efe4" filter="url(#chalk)" />
      <ellipse cx={500} cy={480} rx={130} ry={70} fill="#b8322a" opacity={0.92} />
      <ellipse cx={500} cy={480} rx={130} ry={70} fill="#e8b923" opacity={1 - stain} /></g>
    <T x={500} y={650} k={kk(p, 0.6, 0.75)} s={36} c={CH.y}>হলুদের দাগে সাবান লাগলে → লাল!</T>
  </g>;
};

/* ---------- 18. photosynthesis ---------- */
const LeafFig: React.FC<FP> = ({ p, t }) => {
  const a = kk(p, 0, 0.15), sun = kk(p, 0.15, 0.3), co2 = kk(p, 0.3, 0.45), h2o = kk(p, 0.45, 0.6), out = kk(p, 0.6, 0.8), eq = kk(p, 0.8, 0.95);
  return <g>
    <D d="M300 520 C280 360 420 200 640 180 C660 360 540 520 300 520 Z" k={a} c={CH.g} w={6} fill="rgba(166,242,143,.18)" />
    <D d="M300 520 L600 220 M380 440 L440 330 M450 370 L540 330 M380 440 L480 450" k={a} c={CH.g} w={4} />
    <D d="M300 520 L250 660" k={a} c={CH.g} w={8} />
    <SunG x={120} y={100} r={40} k={sun} t={t} />
    {[0, 1, 2].map((i) => <Arrow key={i} x1={180 + i * 20} y1={150 + i * 20} x2={400 + i * 40} y2={300 + i * 30} k={sun} c={CH.y} />)}
    <T x={860} y={250} k={co2} s={40} c={CH.w}>CO₂</T><Arrow x1={820} y1={270} x2={620} y2={320} k={co2} c={CH.w} />
    {[0, 1, 2].map((i) => { const s = (t / 30 + i / 3) % 1; return <circle key={i} cx={250 + 50 * s} cy={660 - 140 * s} r={9} fill={CH.b} opacity={h2o} />; })}
    <T x={160} y={640} k={h2o} s={34} c={CH.b}>পানি</T>
    {[0, 1, 2, 3].map((i) => { const s = (t / 45 + i / 4) % 1; return <circle key={i} cx={620 + 40 * i} cy={420 - 160 * s} r={11} fill="none" stroke={CH.c} strokeWidth={4} opacity={out * (1 - s)} />; })}
    <T x={820} y={470} k={out} s={40} c={CH.c}>O₂</T>
    <D d="M450 400 l20 -12 l20 12 l0 24 l-20 12 l-20 -12 Z" k={out} c={CH.y} w={4} fill="rgba(255,226,122,.3)" />
    <T x={500} y={680} k={eq} s={34} c={CH.y}>আলো + CO₂ + পানি → চিনি + অক্সিজেন</T>
  </g>;
};

/* ---------- 19. microbes size ladder ---------- */
const Microbes: React.FC<FP> = ({ p, t }) => {
  const a = kk(p, 0, 0.2), b = kk(p, 0.2, 0.45), c = kk(p, 0.45, 0.7), d = kk(p, 0.72, 0.92);
  return <g>
    <D d={circ(170, 330, 130)} k={a} c={CH.o} w={6} fill="rgba(255,179,107,.12)" />
    <T x={170} y={510} k={a} s={28} c={CH.o}>একটা চুলের প্রস্থ</T>
    <D d="M240 300 L420 200 M240 360 L420 460" k={b} c={CH.dim} w={3} />
    <D d={circ(530, 330, 120)} k={b} c={CH.dim} w={4} />
    {[0, 1, 2].map((i) => <rect key={i} x={470 + i * 18} y={260 + i * 40 + 6 * Math.sin(t / 10 + i)} width={100} height={30} rx={15} fill={CH.g} opacity={b} filter="url(#chalk)" />)}
    <T x={530} y={510} k={b} s={28} c={CH.g}>ব্যাকটেরিয়া: জীবন্ত কোষ</T>
    <D d="M640 300 L760 260 M640 360 L760 400" k={c} c={CH.dim} w={3} />
    <g transform={`translate(840 330) rotate(${t})`} opacity={c}>
      <circle r={40} fill={CH.p} filter="url(#chalk)" />{Array.from({ length: 10 }, (_, i) => { const an = (i / 10) * Math.PI * 2; return <line key={i} x1={40 * Math.cos(an)} y1={40 * Math.sin(an)} x2={58 * Math.cos(an)} y2={58 * Math.sin(an)} stroke={CH.p} strokeWidth={5} />; })}</g>
    <T x={840} y={510} k={c} s={28} c={CH.p}>ভাইরাস: আরও অনেক ছোট</T>
    <g opacity={d}><Ic I={Pill} x={330} y={620} s={60} c={CH.y} k={1} /><T x={500} y={610} k={d} s={32} c={CH.g}>অ্যান্টিবায়োটিক: ব্যাকটেরিয়ায় কাজ করে ✓</T>
      <T x={500} y={660} k={d} s={32} c={CH.r}>ভাইরাসে কাজ করে না ✗</T></g>
  </g>;
};

/* ---------- 20. taste lives in the nose ---------- */
const Taste: React.FC<FP> = ({ p, t }) => {
  const a = kk(p, 0, 0.2), tg = kk(p, 0.2, 0.45), ar = kk(p, 0.45, 0.75), pin = kk(p, 0.8, 0.92);
  return <g>
    <D d="M620 120 C460 100 380 200 400 300 L370 360 L410 380 L400 420 L430 450 C420 500 460 540 520 540 L560 640 M620 120 C760 140 800 300 720 420 L700 640" k={a} c={CH.w} w={6} />
    <D d="M420 300 C480 290 520 300 560 320" k={a} c={CH.dim} w={4} />
    <D d="M410 410 C470 420 540 420 580 400" k={tg} c={CH.p} w={14} />
    <T x={240} y={500} k={tg} s={26} c={CH.p}>জিভ: মিষ্টি, টক, নোনতা, তেতো, উমামি</T>
    {[0, 1, 2, 3].map((i) => { const s = (t / 40 + i / 4) % 1; const x = 590 - 120 * s * 0, y = 400 - 120 * s;
      return <path key={i} d={`M${590 + 10 * Math.sin(t / 6 + i)} ${y} q10 -10 0 -20 q-10 -10 0 -20`} stroke={CH.y} strokeWidth={4} fill="none" opacity={ar * (1 - s)} />; })}
    <Arrow x1={590} y1={400} x2={500} y2={290} k={ar} c={CH.y} />
    <T x={800} y={290} k={ar} s={30} c={CH.y}>মুখের পেছন দিয়ে</T><T x={800} y={330} k={ar} s={30} c={CH.y}>গন্ধ যায় নাকে</T>
    <g opacity={pin}><Arrow x1={260} y1={300} x2={380} y2={300} k={1} c={CH.r} w={7} /><T x={210} y={260} k={pin} s={32} c={CH.r}>নাক চাপো</T><T x={210} y={360} k={pin} s={28} c={CH.r}>স্বাদ উধাও!</T></g>
  </g>;
};

/* ---------- 21. seasons: tilt, not distance ---------- */
const Seasons: React.FC<FP> = ({ p, t }) => {
  const a = kk(p, 0, 0.15), j = kk(p, 0.2, 0.5), d = kk(p, 0.5, 0.8);
  const E: React.FC<{ x: number; k: number; lit: number }> = ({ x, k, lit }) => <g opacity={k}>
    <circle cx={x} cy={350} r={62} fill="rgba(127,178,255,.25)" stroke={CH.b} strokeWidth={5} filter="url(#chalk)" />
    <path d={`M${x} 350 m0 -62 a62 62 0 0 ${lit} 0 124`} fill="rgba(255,226,122,.35)" />
    <g transform={`rotate(23.5 ${x} 350)`}><line x1={x} y1={260} x2={x} y2={440} stroke={CH.w} strokeWidth={4} strokeDasharray="8 8" /></g>
    <circle cx={x + 18} cy={318} r={7} fill={CH.r} />
  </g>;
  return <g>
    <ellipse cx={500} cy={350} rx={400} ry={140} fill="none" stroke={CH.dim} strokeWidth={4} strokeDasharray="12 14" opacity={a} />
    <SunG x={500} y={350} r={50} k={a} t={t} />
    <E x={100} k={j} lit={0} /><T x={110} y={500} k={j} s={28} c={CH.y}>জুন: উত্তর ভাগ</T><T x={110} y={540} k={j} s={28} c={CH.y}>সূর্যের দিকে হেলে</T>
    <E x={900} k={d} lit={1} /><T x={880} y={500} k={d} s={28} c={CH.c}>জানুয়ারি: সূর্যের</T><T x={880} y={540} k={d} s={28} c={CH.c}>সবচেয়ে কাছে, তবু শীত!</T>
    <T x={500} y={110} k={kk(p, 0.8, 0.95)} s={40} c={CH.p}>ঋতু হয় হেলে থাকার জন্য, দূরত্বের জন্য নয়</T>
    <T x={100} y={250} k={j} s={22} c={CH.r}>বাংলাদেশ</T>
  </g>;
};

/* ---------- 22. day & night ---------- */
const DayNight: React.FC<FP> = ({ p, t }) => {
  const a = kk(p, 0, 0.2), rot = (t / 120) % 1;
  const ang = rot * Math.PI * 2; const bx = 600 + 150 * Math.cos(ang), lit = Math.cos(ang) < 0;
  return <g>
    <SunG x={120} y={350} r={60} k={a} t={t} />
    {[0, 1, 2, 3].map((i) => <Arrow key={i} x1={220} y1={250 + i * 66} x2={420} y2={250 + i * 66} k={a} c={CH.y} w={4} />)}
    <circle cx={600} cy={350} r={160} fill="rgba(127,178,255,.25)" stroke={CH.b} strokeWidth={6} opacity={a} filter="url(#chalk)" />
    <path d="M600 190 A160 160 0 0 1 600 510 Z" fill="rgba(0,0,0,.45)" opacity={a} />
    <circle cx={bx} cy={350 - 40 * Math.sin(ang) * 0.3} r={12} fill={CH.r} opacity={a} />
    <T x={850} y={200} k={a} s={30} c={CH.w} a="start">পৃথিবী ঘোরে</T><T x={850} y={240} k={a} s={30} c={CH.w} a="start">প্রায় ২৪ ঘণ্টায় একবার</T>
    <T x={600} y={600} k={kk(p, 0.3, 0.45)} s={40} c={lit ? CH.y : CH.c}>{lit ? "বাংলাদেশে এখন দিন" : "বাংলাদেশে এখন রাত"}</T>
  </g>;
};

/* ---------- 23. moon phases ---------- */
const MoonPh: React.FC<FP> = ({ p, t }) => {
  const a = kk(p, 0, 0.15), s = (t / 300) % 1;
  const ang = Math.PI - s * Math.PI * 2; const mx = 430 + 230 * Math.cos(ang), my = 330 + 230 * Math.sin(ang);
  const lit = (1 - Math.cos(2 * Math.PI * s)) / 2, R = 90, rx = Math.max(0.1, R * Math.abs(Math.cos(2 * Math.PI * s))), wax = s < 0.5, cres = lit < 0.5;
  const view = wax ? `M0 ${-R} A${R} ${R} 0 0 1 0 ${R} A${rx} ${R} 0 0 ${cres ? 0 : 1} 0 ${-R} Z` : `M0 ${-R} A${R} ${R} 0 0 0 0 ${R} A${rx} ${R} 0 0 ${cres ? 1 : 0} 0 ${-R} Z`;
  const names = ["অমাবস্যা", "বাঁকা চাঁদ", "অর্ধেক চাঁদ", "প্রায় পূর্ণ", "পূর্ণিমা", "প্রায় পূর্ণ", "অর্ধেক চাঁদ", "বাঁকা চাঁদ"];
  return <g>
    {[0, 1, 2, 3, 4].map((i) => <Arrow key={i} x1={-10} y1={140 + i * 95} x2={110} y2={140 + i * 95} k={a} c={CH.y} w={4} />)}
    <T x={60} y={100} k={a} s={26} c={CH.y}>সূর্যের আলো</T>
    <circle cx={430} cy={330} r={230} fill="none" stroke={CH.dim} strokeWidth={3} strokeDasharray="10 12" opacity={a} />
    <circle cx={430} cy={330} r={56} fill="rgba(127,178,255,.3)" stroke={CH.b} strokeWidth={5} opacity={a} filter="url(#chalk)" />
    <T x={430} y={342} k={a} s={26}>পৃথিবী</T>
    <g opacity={a}><circle cx={mx} cy={my} r={34} fill="#3a4a44" /><path d={`M${mx} ${my - 34} A34 34 0 0 0 ${mx} ${my + 34} Z`} fill={CH.w} /></g>
    <g transform="translate(860 330)" opacity={kk(p, 0.2, 0.35)}>
      <circle r={R} fill="#2c3833" />
      {lit > 0.02 && <path d={view} fill={CH.w} />}
      <text y={-120} textAnchor="middle" fontFamily={FONT} fontSize={34} fill={CH.p}>{names[Math.round(s * 8) % 8]}</text>
      <text y={140} textAnchor="middle" fontFamily={FONT} fontSize={28} fill={CH.y}>পৃথিবী থেকে যেমন দেখি</text>
    </g>
    <T x={430} y={650} k={kk(p, 0.6, 0.8)} s={34} c={CH.p}>চাঁদের অর্ধেক সবসময় আলোকিত, আমরা দেখি একটু একটু</T>
  </g>;
};

/* ---------- 24. 1089 trick ---------- */
const N1089: React.FC<FP> = ({ p, args }) => {
  const n = String(args?.n || 742); const r = n.split("").reverse().join(""); const big = Math.max(+n, +r), small = Math.min(+n, +r);
  const d = String(big - small).padStart(3, "0"); const dr = d.split("").reverse().join(""); const sum = +d + +dr;
  const rows = [[n, "সংখ্যা ভাবো", CH.w], [r, "উল্টে লেখো", CH.c], [`${big} − ${small} = ${d}`, "বড় থেকে ছোট বিয়োগ", CH.o], [`${d} + ${dr}`, "উত্তর উল্টে যোগ", CH.p]] as const;
  return <g>
    {rows.map(([x, l, c], i) => <g key={i}><T x={380} y={130 + i * 110} k={kk(p, i * 0.17, i * 0.17 + 0.1)} s={60} c={c} w={700}>{bn(x)}</T><T x={780} y={120 + i * 110} k={kk(p, i * 0.17 + 0.04, i * 0.17 + 0.12)} s={28} c={CH.dim} a="start">{l}</T></g>)}
    <D d="M150 540 L620 540" k={kk(p, 0.68, 0.74)} w={5} />
    <T x={380} y={640} k={kk(p, 0.72, 0.82)} s={110} c={CH.y} w={700}>{bn(sum)}</T>
    <T x={780} y={620} k={kk(p, 0.8, 0.9)} s={34} c={CH.y} a="start">সবসময়!</T>
  </g>;
};

/* ---------- 25. Kaprekar 6174 ---------- */
const Kaprekar: React.FC<FP> = ({ p, args }) => {
  let n = String(args?.n || 2009).padStart(4, "0"); const steps: string[] = [];
  for (let i = 0; i < 7 && n !== "6174"; i++) { const dsc = n.split("").sort().reverse().join(""), asc = n.split("").sort().join(""); const r = String(+dsc - +asc).padStart(4, "0"); steps.push(`${dsc} − ${asc} = ${r}`); n = r; }
  return <g>
    {steps.map((s, i) => <T key={i} x={500} y={110 + i * 78} k={kk(p, i / (steps.length + 1), (i + 0.7) / (steps.length + 1))} s={46} c={i === steps.length - 1 ? CH.y : CH.w}>{bn(s)}</T>)}
    <T x={500} y={110 + steps.length * 78 + 40} k={kk(p, 0.85, 0.95)} s={48} c={CH.p}>কাপরেকারের জাদু: ৬১৭৪</T>
  </g>;
};

/* ---------- 26. nine-times finger trick ---------- */
const Nines: React.FC<FP> = ({ p, args }) => {
  const n = args?.n || 4;
  return <g>
    {Array.from({ length: 10 }, (_, i) => { const down = i === n - 1 && p > 0.35; const x = 140 + i * 78 + (i > 4 ? 40 : 0);
      return <g key={i} opacity={kk(p, i * 0.02, 0.2 + i * 0.02)}><rect x={x} y={down ? 330 : 200} width={50} height={down ? 60 : 190} rx={25} fill={down ? CH.r : CH.w} opacity={0.9} filter="url(#chalk)" />
        <text x={x + 25} y={440} textAnchor="middle" fontFamily={FONT} fontSize={28} fill={CH.dim}>{bn(i + 1)}</text></g>; })}
    <T x={500} y={540} k={kk(p, 0.45, 0.6)} s={44} c={CH.y}>{`৯ × ${bn(n)}: বাঁয়ে ${bn(n - 1)}, ডানে ${bn(10 - n)} → ${bn(9 * n)}`}</T>
  </g>;
};

/* ---------- 27. generic big question (fallback) ---------- */
const Big: React.FC<FP> = ({ p, args }) => <g>
  <T x={500} y={360} k={kk(p, 0, 0.2)} s={args?.s || 120} c={args?.c || CH.y} w={700}>{args?.text || "?"}</T>
  {args?.sub && <T x={500} y={460} k={kk(p, 0.15, 0.3)} s={40} c={CH.w}>{args.sub}</T>}
</g>;

export const FIGS: Record<string, React.FC<FP>> = {
  method: Method, scatter: Scatter, sunset: Sunset, prism: Prism, raindrop: Raindrop, blindspot: BlindSpot, illusion: Illusion, buoyancy: Buoyancy,
  friction: Friction, magnet: Magnet, earthmag: EarthMag, wave: Wave, lightning: Lightning, battery: Battery, starch: Starch, fridge: Fridge, ph: Ph,
  leaf: LeafFig, microbes: Microbes, taste: Taste, seasons: Seasons, daynight: DayNight, moon: MoonPh, n1089: N1089, kaprekar: Kaprekar, nines: Nines, big: Big,
};
export const ICONS_FIG = { Sun, Eye, FlaskConical, Zap, Snowflake, Flame, Leaf, Droplet };
