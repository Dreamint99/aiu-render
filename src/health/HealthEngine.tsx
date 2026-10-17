// AI University — family-health course lesson video engine ("পরিবারের স্বাস্থ্য ও প্রাথমিক চিকিৎসা").
// Look: calm clinic / first-aid cards — mint-white room, white cards with a coloured side band, teal + first-aid red,
// an ECG line that draws itself, and a permanent safety strip ("ডাক্তারের পরামর্শের বিকল্প নয় · ৯৯৯ · ১৬২৬৩").
// Spec: src/health/specs/<id>.json (timed by scripts/health_make.py). Scene types:
// title · points · steps · dodont · table · photo · dose · warn · emergency · quizQ · quizA · outro
import React from "react";
import { AbsoluteFill, Audio, Img, Sequence, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig, Easing, delayRender, continueRender } from "remotion";
import {
  HeartPulse, Thermometer, Pill, Droplet, Droplets, Siren, Phone, Hospital, Baby, ShieldCheck, TriangleAlert, Check, X, Clock, Hand, Eye, Ear, Brain,
  Activity, Stethoscope, Syringe, Apple, Footprints, Flame, Zap, Waves, Bug, Sun, Wind, Bandage, House, Users, Smile, Utensils, Bone, Dog, Cross,
  Ambulance, Salad, CircleCheck, CircleX, Lightbulb, BookOpen, Package, CalendarCheck, Scissors, Milk, Ban, Timer, Heart, Sparkles, ArrowRight,
  PhoneCall, ClipboardCheck, Scale, Bed, HandHeart, Leaf, Snowflake, ShowerHead, Bot,
} from "lucide-react";

const C = { bg: "#F2F8F6", card: "#FFFFFF", ink: "#0D2B2A", txt: "#1F3B3A", mute: "#5E7775", faint: "#93A8A6", line: "#DCEAE6",
  teal: "#0E8C7F", teal2: "#12A594", tsoft: "#E3F4F0", red: "#D94148", rsoft: "#FCEBEC", amber: "#E8930C", asoft: "#FDF2DF",
  green: "#178A55", gsoft: "#E5F6EC", navy: "#0B2540", blue: "#2563EB", bsoft: "#E8F0FE" };
const BN = "Anek", EN = "Montserrat";
if (typeof document !== "undefined") {
  for (const [n, u] of [["Anek", "fonts/AnekBangla.ttf"], ["Montserrat", "fonts/Montserrat.ttf"]]) {
    const h = delayRender(`font ${n}`);
    const f = new FontFace(n, `url(${staticFile(u)})`, { weight: "100 900" });
    f.load().then(() => { document.fonts.add(f); continueRender(h); }).catch(() => continueRender(h));
  }
}
export const ICONS: Record<string, React.FC<any>> = {
  heart: HeartPulse, thermometer: Thermometer, pill: Pill, drop: Droplet, drops: Droplets, siren: Siren, phone: Phone, hospital: Hospital, baby: Baby,
  shield: ShieldCheck, alert: TriangleAlert, check: Check, x: X, clock: Clock, hand: Hand, eye: Eye, ear: Ear, brain: Brain, pulse: Activity,
  doctor: Stethoscope, syringe: Syringe, apple: Apple, walk: Footprints, fire: Flame, zap: Zap, water: Waves, bug: Bug, sun: Sun, wind: Wind,
  bandage: Bandage, home: House, users: Users, smile: Smile, food: Utensils, bone: Bone, dog: Dog, cross: Cross, ambulance: Ambulance, salad: Salad,
  lightbulb: Lightbulb, book: BookOpen, box: Package, calendar: CalendarCheck, scissors: Scissors, milk: Milk, ban: Ban, timer: Timer, love: Heart,
  sparkles: Sparkles, call: PhoneCall, clipboard: ClipboardCheck, scale: Scale, bed: Bed, care: HandHeart, leaf: Leaf, cold: Snowflake, shower: ShowerHead,
};
const Ic: React.FC<{ n?: string; size?: number; color?: string }> = ({ n, size = 34, color = C.teal }) => { const I = ICONS[n || ""] || ShieldCheck; return <I size={size} color={color} strokeWidth={2.2} />; };
const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const ent = (f: number, fps: number, d: number, dur = 24) => spring({ frame: f - d, fps, config: { damping: 200 }, durationInFrames: dur });
const pop = (f: number, fps: number, d: number) => spring({ frame: f - d, fps, config: { damping: 12, mass: 0.6 } });

export type Scene = { type: string; vo: string; frames: number; hold?: number; [k: string]: any };
export type Spec = { id: string; course: string; module: string; lessonNo: string; title: string; next: string; scenes: Scene[] };
const LEAD = 12, TAIL = 16;
const sceneLen = (s: Scene) => LEAD + (s.frames || 60) + (s.hold || 0) + TAIL;
export const healthLen = (spec: Spec) => spec.scenes.reduce((n, s) => n + sceneLen(s), 0) + 30;
type P = { s: Scene; spec: Spec; vo: number };
// frame at which item i of n should appear (spread over the first 80% of the narration)
const at = (p: P, i: number, n: number) => LEAD + 6 + Math.round((p.vo * 0.8 * i) / Math.max(1, n));

/* ---------- primitives ---------- */
const Rise: React.FC<{ d: number; children: React.ReactNode; style?: React.CSSProperties; y?: number }> = ({ d, children, style, y = 36 }) => {
  const f = useCurrentFrame(); const { fps } = useVideoConfig(); const s = ent(f, fps, d);
  return <div style={{ opacity: s, transform: `translateY(${(1 - s) * y}px)`, ...style }}>{children}</div>;
};
const H: React.FC<{ d: number; size: number; children: React.ReactNode; color?: string }> = ({ d, size, children, color = C.ink }) => {
  const f = useCurrentFrame(); const { fps } = useVideoConfig(); const s = ent(f, fps, d, 28);
  return <div style={{ overflow: "hidden", paddingTop: size * 0.16, paddingBottom: size * 0.24, marginTop: -size * 0.16, marginBottom: -size * 0.24 }}><div style={{ fontFamily: BN, fontSize: size, fontWeight: 800, color, lineHeight: 1.25, transform: `translateY(${(1 - s) * 110}%)` }}>{children}</div></div>;
};
const Card: React.FC<{ children: React.ReactNode; band?: string; style?: React.CSSProperties }> = ({ children, band, style }) => (
  <div style={{ position: "relative", background: C.card, borderRadius: 24, border: `1px solid ${C.line}`, boxShadow: "0 18px 48px rgba(13,60,55,.09)", overflow: "hidden", ...style }}>
    {band && <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: 10, background: band }} />}
    {children}
  </div>
);
const Head: React.FC<{ h: [string, string] | string; d?: number; color?: string }> = ({ h, d = 4, color = C.teal }) => (
  <div style={{ position: "absolute", left: 130, top: 132, right: 130 }}><H d={d} size={56}>{Array.isArray(h) ? <>{h[0].trim()} <span style={{ color }}>{h[1]}</span></> : h}</H></div>
);
const Pic: React.FC<{ img: string; style?: React.CSSProperties; zoom?: boolean }> = ({ img, style, zoom = true }) => {
  const f = useCurrentFrame();
  return (
    <div style={{ position: "relative", borderRadius: 26, overflow: "hidden", boxShadow: "0 24px 60px rgba(13,60,55,.16)", border: "6px solid #fff", ...style }}>
      <Img src={staticFile(`healthfx/${img}.jpg`)} style={{ width: "100%", height: "100%", objectFit: "cover", transform: zoom ? `scale(${1.04 + f * 0.0004})` : undefined }} />
      <div style={{ position: "absolute", right: 12, bottom: 10, padding: "3px 10px", borderRadius: 10, background: "rgba(0,0,0,.45)", color: "#fff", fontFamily: BN, fontSize: 16 }}>প্রতীকী ছবি · এআই-নির্মিত</div>
    </div>
  );
};
const Ecg: React.FC<{ d: number; y: number; w?: number; color?: string; op?: number }> = ({ d, y, w = 1920, color = C.teal, op = 0.5 }) => {
  const f = useCurrentFrame();
  const k = interpolate(f, [d, d + 70], [0, 1], { ...clamp, easing: Easing.inOut(Easing.cubic) });
  const seg = (x: number) => `L${x} ${y} L${x + 30} ${y} L${x + 45} ${y - 70} L${x + 62} ${y + 55} L${x + 76} ${y - 20} L${x + 90} ${y} `;
  let p = `M0 ${y} `; for (let x = 120; x < w; x += 420) p += seg(x); p += `L${w} ${y}`;
  return <svg width={w} height={1080} style={{ position: "absolute", left: 0, top: 0 }}><path d={p} fill="none" stroke={color} strokeWidth={5} strokeLinejoin="round" strokeLinecap="round" opacity={op} strokeDasharray={4000} strokeDashoffset={4000 * (1 - k)} /></svg>;
};
const Pill2: React.FC<{ children: React.ReactNode; bg: string; fg: string; style?: React.CSSProperties }> = ({ children, bg, fg, style }) => (
  <span style={{ display: "inline-flex", alignItems: "center", gap: 10, padding: "8px 20px", borderRadius: 40, background: bg, color: fg, fontFamily: BN, fontSize: 28, fontWeight: 700, ...style }}>{children}</span>
);

/* ---------- scenes ---------- */
const STitle: React.FC<P> = ({ s, spec }) => {
  const f = useCurrentFrame(); const { fps } = useVideoConfig();
  return (
    <AbsoluteFill>
      <Ecg d={6} y={930} op={0.35} />
      <div style={{ position: "absolute", left: 130, top: 190, width: 900 }}>
        <Rise d={4}><Pill2 bg={C.tsoft} fg={C.teal}><Cross size={28} color={C.red} fill={C.red} /> {spec.module} · {spec.lessonNo}</Pill2></Rise>
        <div style={{ marginTop: 28 }}><H d={10} size={78}>{spec.title}</H></div>
        <div style={{ marginTop: 34, display: "flex", flexDirection: "column", gap: 14 }}>
          {(s.goals || []).slice(0, 3).map((g: string, i: number) => (
            <Rise key={i} d={30 + i * 10}><div style={{ display: "flex", gap: 14, alignItems: "center", fontFamily: BN, fontSize: 32, color: C.txt }}><CircleCheck size={32} color={C.teal} /> {g}</div></Rise>
          ))}
        </div>
      </div>
      {s.img && <div style={{ position: "absolute", right: 120, top: 200, width: 700, height: 520, opacity: ent(f, fps, 14), transform: `scale(${0.94 + 0.06 * ent(f, fps, 14)})` }}><Pic img={s.img} style={{ width: "100%", height: "100%" }} /></div>}
    </AbsoluteFill>
  );
};

const SPoints: React.FC<P> = (p) => {
  const items = (p.s.items || []).slice(0, 4);
  return (
    <AbsoluteFill>
      <Head h={p.s.head} />
      <div style={{ position: "absolute", left: 130, right: 130, top: 300, display: "grid", gridTemplateColumns: items.length > 2 ? "1fr 1fr" : "1fr", gap: 26 }}>
        {items.map((it: any, i: number) => (
          <Rise key={i} d={at(p, i, items.length)}>
            <Card band={C.teal} style={{ padding: "28px 34px 28px 46px", display: "flex", gap: 24, alignItems: "flex-start", minHeight: 150 }}>
              <div style={{ flex: "none", width: 72, height: 72, borderRadius: 20, background: C.tsoft, display: "grid", placeItems: "center" }}><Ic n={it.icon} size={40} /></div>
              <div><div style={{ fontFamily: BN, fontSize: 42, fontWeight: 700, color: C.ink, lineHeight: 1.3 }}>{it.t}</div>{it.s && <div style={{ fontFamily: BN, fontSize: 32, color: C.mute, marginTop: 8, lineHeight: 1.4 }}>{it.s}</div>}</div>
            </Card>
          </Rise>
        ))}
      </div>
    </AbsoluteFill>
  );
};

const SSteps: React.FC<P> = (p) => {
  const items = (p.s.items || []).slice(0, 6); const f = useCurrentFrame(); const { fps } = useVideoConfig();
  const w = p.s.img ? 1000 : 1660;
  return (
    <AbsoluteFill>
      <Head h={p.s.head} />
      <div style={{ position: "absolute", left: 130, top: 290, width: w, display: "flex", flexDirection: "column", gap: items.length > 4 ? 14 : 20 }}>
        {items.map((it: any, i: number) => {
          const d = at(p, i, items.length); const on = pop(f, fps, d);
          return (
            <Rise key={i} d={d} y={20}>
              <Card style={{ padding: items.length > 4 ? "14px 26px" : "20px 28px", display: "flex", gap: 22, alignItems: "center" }}>
                <div style={{ flex: "none", width: 58, height: 58, borderRadius: 29, background: C.teal, color: "#fff", display: "grid", placeItems: "center", fontFamily: BN, fontSize: 32, fontWeight: 800, transform: `scale(${on})` }}>{"০১২৩৪৫৬৭৮৯"[i + 1]}</div>
                <div><div style={{ fontFamily: BN, fontSize: items.length > 4 ? 35 : 40, fontWeight: 700, color: C.ink, lineHeight: 1.3 }}>{it.t}</div>{it.s && <div style={{ fontFamily: BN, fontSize: 29, color: C.mute, lineHeight: 1.35 }}>{it.s}</div>}</div>
              </Card>
            </Rise>
          );
        })}
      </div>
      {p.s.img && <Rise d={8} style={{ position: "absolute", right: 120, top: 300, width: 600, height: 470 }}><Pic img={p.s.img} style={{ width: "100%", height: "100%" }} /></Rise>}
    </AbsoluteFill>
  );
};

const SDoDont: React.FC<P> = (p) => {
  const col = (list: string[], ok: boolean, d0: number) => (
    <Card band={ok ? C.green : C.red} style={{ flex: 1, padding: "30px 34px 34px 48px" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 14, fontFamily: BN, fontSize: 46, fontWeight: 800, color: ok ? C.green : C.red, marginBottom: 22 }}>
        {ok ? <CircleCheck size={44} /> : <CircleX size={44} />} {ok ? "যা করবেন" : "যা করবেন না"}
      </div>
      {list.slice(0, 4).map((t, i) => (
        <Rise key={i} d={d0 + i * 14} y={16}><div style={{ display: "flex", gap: 14, alignItems: "flex-start", fontFamily: BN, fontSize: 38, color: C.txt, lineHeight: 1.35, padding: "16px 0", borderTop: i ? `1px dashed ${C.line}` : undefined }}>
          <span style={{ flex: "none", marginTop: 6 }}>{ok ? <Check size={30} color={C.green} strokeWidth={3} /> : <X size={30} color={C.red} strokeWidth={3} />}</span>{t}</div></Rise>
      ))}
    </Card>
  );
  return (
    <AbsoluteFill>
      <Head h={p.s.head} />
      <div style={{ position: "absolute", left: 130, right: 130, top: 290, display: "flex", gap: 32 }}>
        {col(p.s.do || [], true, LEAD + 6)}
        {col(p.s.dont || [], false, LEAD + Math.round(p.vo * 0.45))}
      </div>
    </AbsoluteFill>
  );
};

const STable: React.FC<P> = (p) => {
  const rows: string[][] = (p.s.rows || []).slice(0, 6); const cols: string[] = p.s.cols || [];
  return (
    <AbsoluteFill>
      <Head h={p.s.head} />
      <Rise d={10} style={{ position: "absolute", left: 130, right: 130, top: 300 }}>
        <Card style={{ padding: 0 }}>
          <div style={{ display: "grid", gridTemplateColumns: cols.map((_, i) => (i ? "1.3fr" : "1fr")).join(" "), background: C.teal, color: "#fff", fontFamily: BN, fontSize: 38, fontWeight: 700 }}>
            {cols.map((c, i) => <div key={i} style={{ padding: "22px 32px" }}>{c}</div>)}
          </div>
          {rows.map((r, j) => (
            <Rise key={j} d={at(p, j, rows.length)} y={14}>
              <div style={{ display: "grid", gridTemplateColumns: cols.map((_, i) => (i ? "1.3fr" : "1fr")).join(" "), background: j % 2 ? "#F7FBFA" : "#fff", borderTop: `1px solid ${C.line}`, fontFamily: BN, fontSize: 37, color: C.txt }}>
                {r.map((c, i) => <div key={i} style={{ padding: "22px 32px", fontWeight: i ? 600 : 500, color: i ? C.ink : C.txt, lineHeight: 1.35 }}>{c}</div>)}
              </div>
            </Rise>
          ))}
        </Card>
      </Rise>
      {p.s.foot && <Rise d={LEAD + Math.round(p.vo * 0.8)} style={{ position: "absolute", left: 130, right: 130, bottom: 190, fontFamily: BN, fontSize: 28, color: C.mute }}>{p.s.foot}</Rise>}
    </AbsoluteFill>
  );
};

const SPhoto: React.FC<P> = (p) => {
  const items = (p.s.items || []).slice(0, 4);
  return (
    <AbsoluteFill>
      <Head h={p.s.head} />
      <Rise d={8} style={{ position: "absolute", left: 130, top: 290, width: 820, height: 560 }}><Pic img={p.s.img} style={{ width: "100%", height: "100%" }} /></Rise>
      {p.s.cap && <Rise d={20} style={{ position: "absolute", left: 130, top: 864, width: 820, fontFamily: BN, fontSize: 28, color: C.mute }}>{p.s.cap}</Rise>}
      <div style={{ position: "absolute", left: 1010, right: 130, top: 300, display: "flex", flexDirection: "column", gap: 20 }}>
        {items.map((it: any, i: number) => (
          <Rise key={i} d={at(p, i, items.length)}>
            <Card band={C.teal} style={{ padding: "20px 26px 20px 40px", display: "flex", gap: 18, alignItems: "flex-start" }}>
              <Ic n={it.icon} size={38} />
              <div><div style={{ fontFamily: BN, fontSize: 33, fontWeight: 700, color: C.ink, lineHeight: 1.3 }}>{it.t}</div>{it.s && <div style={{ fontFamily: BN, fontSize: 26, color: C.mute, lineHeight: 1.35 }}>{it.s}</div>}</div>
            </Card>
          </Rise>
        ))}
      </div>
    </AbsoluteFill>
  );
};

// Medicine card — names/doses only from the verified lesson text; always with the cautions + "follow doctor/pharmacist"
const SDose: React.FC<P> = (p) => {
  const lines = (p.s.lines || []).slice(0, 4); const cau: string[] = (p.s.cautions || []).slice(0, 4);
  return (
    <AbsoluteFill>
      <Head h={p.s.head} />
      <div style={{ position: "absolute", left: 130, top: 290, width: p.s.img ? 1060 : 1660 }}>
        <Rise d={8}>
          <Card band={C.blue} style={{ padding: "28px 36px 30px 52px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 16, fontFamily: BN, fontSize: 44, fontWeight: 800, color: C.navy }}><Pill size={46} color={C.blue} /> {p.s.med}</div>
            <div style={{ marginTop: 14 }}>
              {lines.map((l: any, i: number) => (
                <Rise key={i} d={at(p, i, lines.length + 1)} y={12}><div style={{ display: "flex", justifyContent: "space-between", gap: 30, padding: "18px 0", borderTop: `1px solid ${C.line}`, fontFamily: BN, fontSize: 36, lineHeight: 1.35 }}>
                  <span style={{ color: C.mute, flex: "none", maxWidth: 420 }}>{l.t}</span><span style={{ color: C.ink, fontWeight: 700, textAlign: "right" }}>{l.v}</span></div></Rise>
              ))}
            </div>
          </Card>
        </Rise>
        <Rise d={LEAD + Math.round(p.vo * 0.6)} style={{ marginTop: 20, display: "flex", flexWrap: "wrap", gap: 12 }}>
          {cau.map((c, i) => <Pill2 key={i} bg={C.asoft} fg="#8A5400" style={{ fontSize: 29 }}><TriangleAlert size={24} /> {c}</Pill2>)}
        </Rise>
        <Rise d={LEAD + Math.round(p.vo * 0.75)} style={{ marginTop: 16 }}><Pill2 bg={C.tsoft} fg={C.teal} style={{ fontSize: 30 }}><Stethoscope size={30} /> মাত্রা ও ব্যবহার — প্যাকেটের নির্দেশ ও ডাক্তার/ফার্মাসিস্টের পরামর্শ মানুন</Pill2></Rise>
      </div>
      {p.s.img && <Rise d={10} style={{ position: "absolute", right: 120, top: 300, width: 520, height: 420 }}><Pic img={p.s.img} style={{ width: "100%", height: "100%" }} /></Rise>}
    </AbsoluteFill>
  );
};

const SWarn: React.FC<P> = (p) => {
  const f = useCurrentFrame(); const { fps } = useVideoConfig(); const tip = p.s.kind === "tip";
  const col = tip ? C.teal : C.red, soft = tip ? C.tsoft : C.rsoft;
  const pulse = 1 + 0.06 * Math.sin(f / 6);
  return (
    <AbsoluteFill>
      <div style={{ position: "absolute", left: 130, right: p.s.img ? 760 : 130, top: 200 }}>
        <Rise d={4}><div style={{ width: 110, height: 110, borderRadius: 30, background: soft, display: "grid", placeItems: "center", transform: `scale(${pop(f, fps, 4) * (tip ? 1 : pulse)})` }}>{tip ? <Lightbulb size={60} color={col} /> : <TriangleAlert size={60} color={col} />}</div></Rise>
        <div style={{ marginTop: 26 }}><H d={10} size={54} color={col}>{p.s.t}</H></div>
        <div style={{ marginTop: 26, display: "flex", flexDirection: "column", gap: 14 }}>
          {(p.s.items || []).slice(0, 4).map((t: string, i: number) => (
            <Rise key={i} d={at(p, i + 1, 5)}><div style={{ display: "flex", gap: 16, alignItems: "flex-start", fontFamily: BN, fontSize: 40, color: C.txt, lineHeight: 1.35 }}><span style={{ flex: "none", width: 16, height: 16, borderRadius: 8, background: col, marginTop: 20 }} />{t}</div></Rise>
          ))}
        </div>
      </div>
      {p.s.img && <Rise d={12} style={{ position: "absolute", right: 120, top: 260, width: 580, height: 460 }}><Pic img={p.s.img} style={{ width: "100%", height: "100%" }} /></Rise>}
    </AbsoluteFill>
  );
};

const Numbers: React.FC<{ d: number; big?: boolean }> = ({ d, big }) => {
  const f = useCurrentFrame(); const { fps } = useVideoConfig();
  const box = (n: string, t: string, s: string, col: string, k: number) => (
    <div style={{ flex: 1, transform: `scale(${pop(f, fps, d + k)})`, background: "#fff", borderRadius: 24, border: `3px solid ${col}`, padding: big ? "26px 30px" : "18px 24px", display: "flex", gap: 20, alignItems: "center" }}>
      <div style={{ width: big ? 86 : 64, height: big ? 86 : 64, borderRadius: 22, background: col, display: "grid", placeItems: "center" }}>{n === "৯৯৯" ? <Siren size={big ? 48 : 36} color="#fff" /> : <PhoneCall size={big ? 46 : 34} color="#fff" />}</div>
      <div><div style={{ fontFamily: BN, fontSize: big ? 64 : 48, fontWeight: 800, color: col, lineHeight: 1.1 }}>{n}</div><div style={{ fontFamily: BN, fontSize: big ? 28 : 24, color: C.txt }}>{t}</div><div style={{ fontFamily: BN, fontSize: big ? 22 : 20, color: C.mute }}>{s}</div></div>
    </div>
  );
  return <div style={{ display: "flex", gap: 24 }}>{box("৯৯৯", "জাতীয় জরুরি সেবা", "২৪ ঘণ্টা · কল ফ্রি", C.red, 0)}{box("১৬২৬৩", "স্বাস্থ্য বাতায়ন", "২৪ ঘণ্টা ডাক্তারের পরামর্শ", C.teal, 8)}</div>;
};

const SEmergency: React.FC<P> = (p) => {
  const items = (p.s.items || []).slice(0, 5);
  return (
    <AbsoluteFill>
      <div style={{ position: "absolute", left: 130, right: 130, top: 132 }}><H d={4} size={52}><span style={{ color: C.red }}>কখন দেরি না করে</span> ডাক্তার বা হাসপাতালে যাবেন</H></div>
      <div style={{ position: "absolute", left: 130, width: 1060, top: 280, display: "flex", flexDirection: "column", gap: 18 }}>
        {items.map((t: string, i: number) => (
          <Rise key={i} d={at(p, i, items.length)} y={16}>
            <Card band={C.red} style={{ padding: "22px 28px 22px 44px", display: "flex", gap: 20, alignItems: "center" }}><Siren size={38} color={C.red} /><span style={{ fontFamily: BN, fontSize: 37, color: C.ink, lineHeight: 1.35 }}>{t}</span></Card>
          </Rise>
        ))}
      </div>
      <Rise d={LEAD + 4} style={{ position: "absolute", right: 130, top: 290, width: 470 }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}><NumbersCol d={LEAD + 4} /></div>
      </Rise>
    </AbsoluteFill>
  );
};
const NumbersCol: React.FC<{ d: number }> = ({ d }) => {
  const f = useCurrentFrame(); const { fps } = useVideoConfig();
  const one = (n: string, t: string, col: string, k: number, Icon: React.FC<any>) => (
    <div style={{ transform: `scale(${pop(f, fps, d + k)})`, background: "#fff", borderRadius: 24, border: `3px solid ${col}`, padding: "22px 26px", display: "flex", gap: 18, alignItems: "center" }}>
      <div style={{ width: 70, height: 70, borderRadius: 20, background: col, display: "grid", placeItems: "center" }}><Icon size={38} color="#fff" /></div>
      <div><div style={{ fontFamily: BN, fontSize: 54, fontWeight: 800, color: col, lineHeight: 1.1 }}>{n}</div><div style={{ fontFamily: BN, fontSize: 25, color: C.txt }}>{t}</div></div>
    </div>
  );
  return <>{one("৯৯৯", "জীবন-হুমকি · কল ফ্রি", C.red, 0, Siren)}{one("১৬২৬৩", "স্বাস্থ্য বাতায়ন · পরামর্শ", C.teal, 8, PhoneCall)}</>;
};

const Opts: React.FC<{ s: Scene; reveal: boolean; d: number }> = ({ s, reveal, d }) => {
  const f = useCurrentFrame(); const { fps } = useVideoConfig();
  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 22 }}>
      {(s.o || []).map((o: string, i: number) => {
        const ok = reveal && i === s.a, bad = reveal && i !== s.a;
        return (
          <Rise key={i} d={d + i * 6} y={16}>
            <div style={{ display: "flex", gap: 18, alignItems: "center", padding: "34px 32px", borderRadius: 24, background: ok ? C.gsoft : "#fff", border: `3px solid ${ok ? C.green : C.line}`, opacity: bad ? 0.45 : 1, fontFamily: BN, fontSize: 40, color: C.ink, lineHeight: 1.3, transform: ok ? `scale(${1 + 0.03 * pop(f, fps, d + 10)})` : undefined }}>
              <span style={{ flex: "none", width: 52, height: 52, borderRadius: 26, background: ok ? C.green : C.tsoft, color: ok ? "#fff" : C.teal, display: "grid", placeItems: "center", fontWeight: 800 }}>{ok ? <Check size={30} strokeWidth={3} /> : "কখগঘ"[i]}</span>{o}
            </div>
          </Rise>
        );
      })}
    </div>
  );
};
const SQuizQ: React.FC<P> = (p) => {
  const f = useCurrentFrame(); const hold = p.s.hold || 90; const t0 = LEAD + p.vo;
  const k = interpolate(f, [t0, t0 + hold], [1, 0], clamp);
  return (
    <AbsoluteFill>
      <div style={{ position: "absolute", left: 130, right: 130, top: 140 }}>
        <Rise d={2}><Pill2 bg={C.asoft} fg="#8A5400"><Lightbulb size={28} /> ছোট্ট প্রশ্ন</Pill2></Rise>
        <div style={{ marginTop: 26 }}><H d={8} size={58}>{p.s.q}</H></div>
        <div style={{ marginTop: 60 }}><Opts s={p.s} reveal={false} d={20} /></div>
      </div>
      <div style={{ position: "absolute", right: 130, top: 140, display: "flex", alignItems: "center", gap: 14, fontFamily: BN, fontSize: 30, color: C.mute }}>
        <Timer size={34} color={C.amber} />
        <div style={{ width: 220, height: 14, borderRadius: 7, background: C.line, overflow: "hidden" }}><div style={{ width: `${k * 100}%`, height: "100%", background: C.amber }} /></div>
      </div>
    </AbsoluteFill>
  );
};
const SQuizA: React.FC<P> = (p) => (
  <AbsoluteFill>
    <div style={{ position: "absolute", left: 130, right: 130, top: 140 }}>
      <Rise d={2}><Pill2 bg={C.gsoft} fg={C.green}><CircleCheck size={28} /> সঠিক উত্তর</Pill2></Rise>
      <div style={{ marginTop: 26 }}><H d={4} size={58}>{p.s.q}</H></div>
      <div style={{ marginTop: 50 }}><Opts s={p.s} reveal={true} d={6} /></div>
      {p.s.why && <Rise d={30} style={{ marginTop: 30 }}><Card band={C.green} style={{ padding: "22px 30px 22px 46px", fontFamily: BN, fontSize: 36, color: C.txt }}>{p.s.why}</Card></Rise>}
    </div>
  </AbsoluteFill>
);

const SOutro: React.FC<P> = ({ s, spec }) => (
  <AbsoluteFill>
    <Ecg d={4} y={180} op={0.3} />
    <div style={{ position: "absolute", left: 130, right: 130, top: 250 }}>
      <Rise d={4}><Pill2 bg={C.tsoft} fg={C.teal}><HandHeart size={30} /> নিজে নিরাপদ থাকুন, পরিবারকে নিরাপদ রাখুন</Pill2></Rise>
      <div style={{ marginTop: 26 }}><H d={10} size={60}>এটি ডাক্তারের পরামর্শের <span style={{ color: C.red }}>বিকল্প নয়</span></H></div>
      <Rise d={22} style={{ marginTop: 14, fontFamily: BN, fontSize: 32, color: C.mute }}>বিপদচিহ্ন দেখলে দেরি না করে হাসপাতালে যান — জরুরি নম্বর মনে রাখুন</Rise>
      <Rise d={30} style={{ marginTop: 40 }}><Numbers d={30} big /></Rise>
      {spec.next && <Rise d={50} style={{ marginTop: 44 }}><div style={{ display: "inline-flex", alignItems: "center", gap: 16, fontFamily: BN, fontSize: 32, color: C.txt }}><span style={{ color: C.mute }}>পরের পাঠ</span><ArrowRight size={30} color={C.teal} /><b style={{ color: C.ink }}>{spec.next}</b></div></Rise>}
    </div>
  </AbsoluteFill>
);

const MAP: Record<string, React.FC<P>> = { title: STitle, points: SPoints, steps: SSteps, dodont: SDoDont, table: STable, photo: SPhoto, dose: SDose, warn: SWarn, emergency: SEmergency, quizQ: SQuizQ, quizA: SQuizA, outro: SOutro };

/* ---------- chrome ---------- */
const Fade: React.FC<{ len: number; children: React.ReactNode }> = ({ len, children }) => {
  const f = useCurrentFrame();
  const o = interpolate(f, [0, 10, len - 10, len], [0, 1, 1, 0], clamp);
  return <AbsoluteFill style={{ opacity: o, transform: `translateY(${interpolate(f, [0, 12], [14, 0], clamp)}px)` }}>{children}</AbsoluteFill>;
};
const Header: React.FC<{ spec: Spec; starts: number[] }> = ({ spec, starts }) => {
  const f = useCurrentFrame(); const total = healthLen(spec);
  return (
    <div style={{ position: "absolute", left: 0, right: 0, top: 0, height: 92, display: "flex", alignItems: "center", gap: 18, padding: "0 60px", background: "rgba(255,255,255,.92)", borderBottom: `1px solid ${C.line}` }}>
      <div style={{ width: 46, height: 46, borderRadius: 12, background: C.red, display: "grid", placeItems: "center" }}><Cross size={28} color="#fff" fill="#fff" /></div>
      <div style={{ fontFamily: BN, fontSize: 27, fontWeight: 700, color: C.ink }}>{spec.course}</div>
      <div style={{ fontFamily: BN, fontSize: 25, color: C.mute }}>· {spec.module} · {spec.lessonNo}</div>
      <div style={{ flex: 1 }} />
      <Img src={staticFile("brand/logo.png")} style={{ height: 46 }} />
      <div style={{ position: "absolute", left: 0, bottom: -1, height: 4, width: `${(f / total) * 100}%`, background: C.teal }} />
    </div>
  );
};
const Safety: React.FC = () => (
  <div style={{ position: "absolute", left: 40, bottom: 26, display: "flex", alignItems: "center", gap: 10, padding: "8px 16px", borderRadius: 30, background: "rgba(255,255,255,.92)", border: `1px solid ${C.line}`, fontFamily: BN, fontSize: 21, color: C.mute }}>
    <ShieldCheck size={22} color={C.teal} /> ডাক্তারের পরামর্শের বিকল্প নয় · জরুরি <b style={{ color: C.red }}>৯৯৯</b> · স্বাস্থ্য বাতায়ন <b style={{ color: C.teal }}>১৬২৬৩</b>
  </div>
);
const AiTag: React.FC = () => (
  <div style={{ position: "absolute", right: 40, bottom: 26, display: "flex", alignItems: "center", gap: 8, padding: "8px 16px", borderRadius: 30, background: "rgba(255,255,255,.92)", border: `1px solid ${C.line}`, fontFamily: BN, fontSize: 21, color: C.mute }}><Bot size={22} color={C.teal} /> এআই প্রশিক্ষক · এআই কণ্ঠ</div>
);
const subChunks = (spec: Spec, starts: number[]) => spec.scenes.flatMap((s, i) => {
  const parts = s.vo.split(/(?<=[।?!,—])\s+/).reduce<string[]>((a, x) => { if (a.length && (a[a.length - 1].length < 24 || x.length < 10)) a[a.length - 1] += " " + x; else a.push(x); return a; }, []);
  const total = parts.reduce((n, x) => n + x.length, 0); let acc = 0; const b = starts[i] + LEAD;
  return parts.map((x) => { const from = b + (s.frames * acc) / total; acc += x.length; return { s: x, from, to: b + (s.frames * acc) / total }; });
});

export const HealthVideo: React.FC<{ spec: Spec }> = ({ spec }) => {
  const f = useCurrentFrame();
  const lens = spec.scenes.map(sceneLen);
  const starts = lens.reduce<number[]>((a, _, i) => [...a, i ? a[i - 1] + lens[i - 1] : 15], []);
  const chunks = subChunks(spec, starts);
  const cur = chunks.find((x) => f >= x.from && f < x.to + 4);
  const total = healthLen(spec);
  const busy = (fr: number) => spec.scenes.some((s, i) => fr >= starts[i] + LEAD - 6 && fr <= starts[i] + LEAD + s.frames + 4);
  return (
    <AbsoluteFill style={{ background: C.bg }}>
      <AbsoluteFill style={{ background: `radial-gradient(1100px 700px at 90% 10%, ${C.teal2}18, transparent 70%), radial-gradient(900px 600px at 0% 100%, ${C.red}0D, transparent 70%)` }} />
      <AbsoluteFill style={{ backgroundImage: `radial-gradient(${C.line} 2px, transparent 2px)`, backgroundSize: "44px 44px", opacity: 0.6 }} />
      {spec.scenes.map((s, i) => {
        const S = MAP[s.type] || SPoints; const len = lens[i];
        return (
          <Sequence key={i} from={starts[i]} durationInFrames={len}>
            <Fade len={len}><S s={s} spec={spec} vo={s.frames} /></Fade>
            <Sequence from={LEAD}><Audio src={staticFile(`health/${spec.id}/vo/${String(i + 1).padStart(2, "0")}.mp3`)} /></Sequence>
            <Sequence from={0}><Audio src={staticFile(`aiu2/${i === 0 ? "swell" : s.type === "quizA" || s.type === "outro" ? "chime" : "whoosh"}.mp3`)} volume={0.25} /></Sequence>
          </Sequence>
        );
      })}
      <Header spec={spec} starts={starts} />
      <Safety />
      <AiTag />
      {cur && <div style={{ position: "absolute", left: 0, right: 0, bottom: 86, display: "flex", justifyContent: "center", opacity: interpolate(f, [cur.from, cur.from + 5, cur.to, cur.to + 4], [0, 1, 1, 0], clamp) }}><div style={{ maxWidth: 1500, padding: "10px 28px 14px", borderRadius: 14, background: "rgba(11,37,64,.86)", fontFamily: BN, fontSize: 34, fontWeight: 500, color: "#fff", textAlign: "center", lineHeight: 1.35 }}>{cur.s.replace(/[।,]$/, "")}</div></div>}
      <Audio src={staticFile("aiu2/music.mp3")} volume={(fr) => (busy(fr) ? 0.04 : 0.12) * interpolate(fr, [0, 30, total - 60, total], [0, 1, 1, 0], clamp)} />
    </AbsoluteFill>
  );
};
