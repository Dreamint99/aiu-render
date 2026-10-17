// AI University — fish-feed course lesson video engine ("মাছের খাদ্য ও খাদ্য ব্যবস্থাপনা").
// Own look: light pond / aquaculture infographic — aqua water background with moving waves and rising bubbles,
// teal + sun-yellow accents, real species photos (Wikimedia Commons, credited on screen) and free Cloudflare AI scene photos.
// Spec: src/fish/specs/<id>.json, timed by scripts/fish_make.py. Scene types:
// title · points · photo · species · layers · bars · steps · calc · vs · note · recap · quizQ · quizA · outro
import React from "react";
import { AbsoluteFill, Audio, Img, Sequence, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig, Easing, delayRender, continueRender } from "remotion";
import {
  Fish, Droplets, Sun, Wheat, Scale, Calculator, Clock, TriangleAlert, Lightbulb, Leaf, ShieldCheck, Package, Thermometer, CloudRain, Waves,
  BookOpen, Building2, Check, X, Target, Bot, Sprout, FlaskConical, Bug, Snowflake, Moon, ShoppingCart, Gavel, Ban, Banknote, Ruler, Timer,
  Shrimp, Wind, Warehouse, ClipboardList, Hand, Eye, Tag, ArrowRight, Sparkles, Trophy, Calendar, Coins, Pill, Users, Sunrise, Camera,
} from "lucide-react";

const C = { bg: "#EAF6F4", card: "#FFFFFF", ink: "#0A2A33", txt: "#18393F", mute: "#4F6B70", faint: "#8AA3A6", line: "#D3E7E4",
  brand: "#0E8C7F", brand2: "#1A8FCB", deep: "#06404A", soft: "#DDF3EF", sun: "#F2B33D", ssoft: "#FDF3DC", green: "#2F9A4B", gsoft: "#E3F5E7",
  red: "#D2483C", rsoft: "#FCE9E6", water1: "#BFE6E0", water2: "#8FD0C7" };
const GRAD = `linear-gradient(100deg, ${C.brand}, ${C.brand2})`;
const BN = "Anek", EN = "Montserrat";
if (typeof document !== "undefined") {
  for (const [n, u] of [["Anek", "fonts/AnekBangla.ttf"], ["Montserrat", "fonts/Montserrat.ttf"]]) {
    const h = delayRender(`font ${n}`);
    const f = new FontFace(n, `url(${staticFile(u)})`, { weight: "100 900" });
    f.load().then(() => { document.fonts.add(f); continueRender(h); }).catch(() => continueRender(h));
  }
}
export const ICONS: Record<string, React.FC<any>> = {
  fish: Fish, water: Droplets, sun: Sun, wheat: Wheat, scale: Scale, calc: Calculator, clock: Clock, alert: TriangleAlert, lightbulb: Lightbulb,
  leaf: Leaf, shield: ShieldCheck, package: Package, temp: Thermometer, rain: CloudRain, waves: Waves, book: BookOpen, office: Building2,
  target: Target, sprout: Sprout, flask: FlaskConical, bug: Bug, cold: Snowflake, moon: Moon, cart: ShoppingCart, law: Gavel, ban: Ban,
  money: Banknote, ruler: Ruler, timer: Timer, shrimp: Shrimp, wind: Wind, store: Warehouse, list: ClipboardList, hand: Hand, eye: Eye,
  tag: Tag, sparkles: Sparkles, trophy: Trophy, calendar: Calendar, coins: Coins, pill: Pill, users: Users, sunrise: Sunrise, check: Check,
};
const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const ease = Easing.bezier(0.16, 1, 0.3, 1);
const ent = (f: number, fps: number, d: number, dur = 24) => spring({ frame: f - d, fps, config: { damping: 200 }, durationInFrames: dur });
const pop = (f: number, fps: number, d: number) => spring({ frame: f - d, fps, config: { damping: 12, mass: 0.6 } });

export type Scene = { type: string; vo: string; frames: number; hold?: number; [k: string]: any };
export type Credit = { file: string; author: string; license: string };
export type Spec = { id: string; course: string; module: string; lessonNo: string; title: string; next: string; scenes: Scene[]; credits?: Record<string, Credit> };
const LEAD = 12, TAIL = 16;
const sceneLen = (s: Scene) => LEAD + s.frames + (s.hold || 0) + TAIL;
export const fishLen = (spec: Spec) => spec.scenes.reduce((n, s) => n + sceneLen(s), 0) + 30;
type P = { s: Scene; spec: Spec; vo: number };
const v = (p: P, x: number) => LEAD + p.vo * x;
const pic = (k: string) => staticFile(`fishfx/${k}.jpg`);   // "photos/rui" or "ai/pond"

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
  <div style={{ background: C.card, borderRadius: 26, border: `1px solid ${C.line}`, boxShadow: "0 22px 56px rgba(6,64,74,.10)", ...style }}>{children}</div>
);
const Head: React.FC<{ h: [string, string] | string; d?: number; top?: number }> = ({ h, d = 4, top = 136 }) => (
  <div style={{ position: "absolute", left: 130, top, right: 130 }}><H d={d} size={58}>{Array.isArray(h) ? <>{h[0]}<span style={{ color: C.brand }}>{h[1]}</span></> : h}</H></div>
);
const IconBox: React.FC<{ icon?: string; size?: number; bg?: string }> = ({ icon, size = 84, bg = GRAD }) => {
  const I = (icon && ICONS[icon]) || Fish;
  return <div style={{ width: size, height: size, borderRadius: size * 0.28, background: bg, display: "grid", placeItems: "center", flex: "none" }}><I size={size * 0.52} color="#fff" strokeWidth={1.8} /></div>;
};
// photo that slowly zooms (Ken Burns)
const Photo: React.FC<{ k: string; style?: React.CSSProperties; from?: number; to?: number; pos?: string }> = ({ k, style, from = 1.04, to = 1.14, pos = "center" }) => {
  const f = useCurrentFrame(); const { durationInFrames } = useVideoConfig();
  const z = interpolate(f, [0, durationInFrames], [from, to], clamp);
  return <div style={{ overflow: "hidden", borderRadius: 26, background: C.water1, ...style }}><Img src={pic(k)} style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: pos, transform: `scale(${z})` }} /></div>;
};
const fishPath = "M0 0 C 18 -16 52 -16 70 0 C 52 16 18 16 0 0 Z M70 0 L 92 -14 L 88 0 L 92 14 Z";
const SwimFish: React.FC<{ x: number; y: number; s?: number; c?: string; flip?: boolean; speed?: number; w?: number }> = ({ x, y, s = 1, c = C.brand, flip, speed = 1.2, w = 1920 }) => {
  const f = useCurrentFrame();
  const dx = ((x + f * speed * (flip ? -1 : 1)) % (w + 200) + (w + 200)) % (w + 200) - 100;
  const wob = Math.sin(f / 7 + x) * 4;
  return <g transform={`translate(${dx} ${y + wob}) scale(${flip ? s : -s} ${s})`}><path d={fishPath} fill={c} opacity={0.9} /><circle cx={14} cy={-3} r={3} fill="#fff" /></g>;
};

/* ---------- scenes ---------- */
const STitle: React.FC<P> = (p) => {
  const { s, spec } = p;
  return (
    <AbsoluteFill>
      <div style={{ position: "absolute", left: 130, top: 200, width: 860 }}>
        <Rise d={4}><span style={{ display: "inline-flex", gap: 10, alignItems: "center", padding: "10px 22px", borderRadius: 40, background: C.soft, color: C.brand, fontFamily: BN, fontSize: 30, fontWeight: 700 }}><Fish size={30} /> {spec.module} · {spec.lessonNo}</span></Rise>
        <div style={{ marginTop: 30 }}><H d={10} size={78}>{spec.title}</H></div>
        <Rise d={24} style={{ marginTop: 24 }}><span style={{ fontFamily: BN, fontSize: 32, color: C.mute }}>{spec.course}</span></Rise>
        {s.img && <Rise d={30} style={{ marginTop: 40 }}><Photo k={s.img} style={{ width: 760, height: 300, border: `6px solid #fff`, boxShadow: "0 22px 56px rgba(6,64,74,.16)" }} /></Rise>}
      </div>
      <Card style={{ position: "absolute", right: 130, top: 210, width: 740, padding: "40px 44px" }}>
        <Rise d={v(p, 0.2)}><div style={{ display: "flex", alignItems: "center", gap: 14, fontFamily: BN, fontSize: 36, fontWeight: 800, color: C.ink }}><Target size={40} color={C.brand} /> এই পাঠে যা শিখবেন</div></Rise>
        {s.goals.map((g: string, i: number) => (
          <Rise key={i} d={v(p, 0.32 + i * 0.14)} y={24} style={{ display: "flex", gap: 18, alignItems: "flex-start", marginTop: 26 }}>
            <div style={{ width: 44, height: 44, borderRadius: 22, background: C.gsoft, display: "grid", placeItems: "center", flex: "none" }}><Check size={26} color={C.green} strokeWidth={3} /></div>
            <span style={{ fontFamily: BN, fontSize: 34, color: C.txt, lineHeight: 1.35 }}>{g}</span>
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
      <div style={{ position: "absolute", left: 130, right: 130, top: 270, display: "grid", gridTemplateColumns: `repeat(${cols}, 1fr)`, gap: 24 }}>
        {s.items.map((it: any, i: number) => (
          <Rise key={i} d={v(p, 0.06 + (i / n) * 0.75)} y={26}>
            <Card style={{ padding: "28px 32px", display: "flex", gap: 26, alignItems: "center", boxShadow: "none" }}>
              <IconBox icon={it.icon} />
              <div style={{ flex: 1 }}>
                <div style={{ fontFamily: BN, fontSize: 40, fontWeight: 800, color: C.ink, lineHeight: 1.25 }}>{it.t}</div>
                {it.s && <div style={{ fontFamily: BN, fontSize: 30, color: C.mute, marginTop: 6, lineHeight: 1.4 }}>{it.s}</div>}
              </div>
            </Card>
          </Rise>
        ))}
      </div>
    </AbsoluteFill>
  );
};

// big photo + bullet points
const SPhoto: React.FC<P> = (p) => {
  const { s } = p; const n = (s.items || []).length;
  return (
    <AbsoluteFill>
      <Head h={s.head} />
      <Rise d={6} style={{ position: "absolute", left: 130, top: 270, width: 960, height: 600 }}>
        <Photo k={s.img} style={{ width: 960, height: 600, border: "8px solid #fff", boxShadow: "0 26px 60px rgba(6,64,74,.18)" }} />
        {s.cap && <div style={{ position: "absolute", left: 28, bottom: 28, padding: "10px 22px", borderRadius: 16, background: "rgba(6,64,74,.86)", color: "#fff", fontFamily: BN, fontSize: 32, fontWeight: 700 }}>{s.cap}</div>}
      </Rise>
      <div style={{ position: "absolute", left: 1140, right: 110, top: 280, display: "flex", flexDirection: "column", gap: 22 }}>
        {(s.items || []).map((it: any, i: number) => (
          <Rise key={i} d={v(p, 0.1 + (i / Math.max(1, n)) * 0.75)} y={24}>
            <Card style={{ padding: "22px 26px", display: "flex", gap: 18, alignItems: "center", boxShadow: "none" }}>
              <IconBox icon={it.icon} size={62} />
              <div style={{ fontFamily: BN, fontSize: 31, color: C.ink, fontWeight: 700, lineHeight: 1.3 }}>{it.t}{it.s && <div style={{ fontWeight: 400, fontSize: 26, color: C.mute, marginTop: 4 }}>{it.s}</div>}</div>
            </Card>
          </Rise>
        ))}
      </div>
    </AbsoluteFill>
  );
};

// species cards (photo + name + tag such as protein %)
const SSpecies: React.FC<P> = (p) => {
  const { s } = p; const n = s.items.length; const cols = n <= 3 ? n : n === 4 ? 4 : 3;
  const f = useCurrentFrame(); const { fps } = useVideoConfig();
  const w = (1660 - (cols - 1) * 26) / cols, h = n > 4 ? 190 : 380, sm = n > 4;
  return (
    <AbsoluteFill>
      <Head h={s.head} />
      <div style={{ position: "absolute", left: 130, right: 130, top: 262, display: "grid", gridTemplateColumns: `repeat(${cols}, ${w}px)`, gap: 26 }}>
        {s.items.map((it: any, i: number) => {
          const d = v(p, 0.05 + (i / n) * 0.75); const k = pop(f, fps, d);
          return (
            <div key={i} style={{ opacity: Math.min(1, k * 1.4), transform: `scale(${0.85 + 0.15 * k})` }}>
              <Card style={{ overflow: "hidden", boxShadow: "none" }}>
                <Photo k={it.img} style={{ width: "100%", height: h, borderRadius: 0 }} from={1.02} to={1.08} />
                <div style={{ padding: sm ? "10px 18px 12px" : "16px 22px 20px", display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
                  <span style={{ fontFamily: BN, fontSize: sm ? 32 : 38, fontWeight: 800, color: C.ink }}>{it.t}</span>
                  {it.tag && <span style={{ marginLeft: "auto", fontFamily: BN, fontSize: 28, fontWeight: 800, color: C.deep, background: C.ssoft, border: `2px solid ${C.sun}`, borderRadius: 14, padding: "2px 14px" }}>{it.tag}</span>}
                  {it.s && !sm && <div style={{ width: "100%", fontFamily: BN, fontSize: 26, color: C.mute }}>{it.s}</div>}
                </div>
              </Card>
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};

// pond cross-section: surface / middle / bottom layers
const SLayers: React.FC<P> = (p) => {
  const { s } = p; const f = useCurrentFrame(); const { fps } = useVideoConfig();
  const X = 130, Y = 280, W = 1660, LH = 190;
  const cols = [["#CDEFEA", "#AEE3DA"], ["#9ED6CC", "#7EC7BB"], ["#6BAF9F", "#4E8F80"]];
  return (
    <AbsoluteFill>
      <Head h={s.head} />
      <svg width={1920} height={1080} style={{ position: "absolute", inset: 0 }}>
        <defs>{cols.map((c, i) => <linearGradient key={i} id={`L${i}`} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor={c[0]} /><stop offset="1" stopColor={c[1]} /></linearGradient>)}</defs>
        <rect x={X} y={Y} width={W} height={LH * 3 + 40} rx={30} fill="#5E4B3A" />
        {[0, 1, 2].map((i) => <rect key={i} x={X} y={Y + i * LH} width={W} height={LH} rx={i === 0 ? 30 : 0} fill={`url(#L${i})`} />)}
        <path d={`M${X} ${Y + 6} ${Array.from({ length: 34 }, (_, k) => `Q ${X + k * 50 + 25} ${Y + 6 + Math.sin(f / 9 + k) * 6} ${X + (k + 1) * 50} ${Y + 6}`).join(" ")}`} stroke="#fff" strokeWidth={4} fill="none" opacity={0.7} />
        {Array.from({ length: 22 }, (_, k) => <ellipse key={k} cx={X + 30 + k * 76} cy={Y + LH * 3 + 18 + (k % 3) * 6} rx={18 + (k % 4) * 6} ry={7} fill="#4A3A2C" />)}
      </svg>
      {s.rows.map((r: any, i: number) => {
        const d = v(p, 0.08 + i * 0.27); const k = ent(f, fps, d);
        return (
          <div key={i} style={{ position: "absolute", left: X + 34, top: Y + i * LH + 24, right: 1920 - X - W + 34, height: LH - 48, display: "flex", alignItems: "center", gap: 26, opacity: k, transform: `translateX(${(1 - k) * -60}px)` }}>
            <div style={{ width: 330, flex: "none" }}>
              <div style={{ fontFamily: BN, fontSize: 40, fontWeight: 800, color: i === 2 ? "#fff" : C.deep }}>{r.t}</div>
              {r.s && <div style={{ fontFamily: BN, fontSize: 26, color: i === 2 ? "#E8F5F2" : C.mute, marginTop: 4, lineHeight: 1.3 }}>{r.s}</div>}
            </div>
            <div style={{ display: "flex", gap: 18, flexWrap: "wrap" }}>
              {r.fish.map((x: any, j: number) => {
                const kk = pop(f, fps, d + 8 + j * 6);
                return (
                  <div key={j} style={{ display: "flex", alignItems: "center", gap: 12, background: "rgba(255,255,255,.92)", borderRadius: 60, padding: "6px 22px 6px 6px", transform: `scale(${kk})` }}>
                    {x.img ? <Img src={pic(x.img)} style={{ width: 96, height: 96, borderRadius: 48, objectFit: "cover" }} /> : <IconBox icon="fish" size={70} />}
                    <span style={{ fontFamily: BN, fontSize: 34, fontWeight: 800, color: C.ink }}>{x.t}</span>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </AbsoluteFill>
  );
};

// range bars (protein %, feeding rate % …)
const SBars: React.FC<P> = (p) => {
  const { s } = p; const f = useCurrentFrame(); const { fps } = useVideoConfig();
  const max = s.max || 50, n = s.rows.length; const X = 560, W = 1180, rh = n > 5 ? 96 : n > 4 ? 108 : 130;
  const bnN = (x: number) => String(x).replace(/\d/g, (d) => "০১২৩৪৫৬৭৮৯"[+d]);
  return (
    <AbsoluteFill>
      <Head h={s.head} />
      <div style={{ position: "absolute", left: X, top: 268, width: W, display: "flex", justifyContent: "space-between", fontFamily: BN, fontSize: 24, color: C.faint }}>
        {Array.from({ length: 6 }, (_, i) => <span key={i}>{bnN(max < 10 ? +((max * i) / 5).toFixed(1) : Math.round((max * i) / 5))}{s.unit || "%"}</span>)}
      </div>
      {s.rows.map((r: any, i: number) => {
        const d = v(p, 0.06 + (i / n) * 0.75); const k = ent(f, fps, d, 30);
        const a = r.a === r.b ? 0 : (r.a / max) * W, b = (r.b / max) * W;
        return (
          <div key={i} style={{ position: "absolute", left: 130, top: 320 + i * rh, width: 1660, height: rh - 22, display: "flex", alignItems: "center", opacity: Math.min(1, k * 2) }}>
            <div style={{ width: X - 160, display: "flex", alignItems: "center", gap: 16 }}>
              {r.img ? <Img src={pic(r.img)} style={{ width: 74, height: 74, borderRadius: 37, objectFit: "cover", border: `3px solid #fff` }} /> : <IconBox icon={r.icon || "fish"} size={64} />}
              <span style={{ fontFamily: BN, fontSize: 33, fontWeight: 800, color: C.ink, lineHeight: 1.2 }}>{r.t}</span>
            </div>
            <div style={{ position: "absolute", left: X - 130, width: W, height: 56, borderRadius: 28, background: C.line }}>
              <div style={{ position: "absolute", left: a, width: Math.max(8, (b - a) * k), height: 56, borderRadius: 28, background: r.warn ? C.red : GRAD }} />
              <span style={{ position: "absolute", left: a + (b - a) * k + 16, top: 4, fontFamily: BN, fontSize: 36, fontWeight: 800, color: C.deep, whiteSpace: "nowrap", opacity: k }}>{r.label}</span>
            </div>
          </div>
        );
      })}
      {s.foot && <Rise d={v(p, 0.85)} style={{ position: "absolute", left: 130, right: 130, top: 330 + n * rh, fontFamily: BN, fontSize: 28, color: C.mute }}>{s.foot}</Rise>}
    </AbsoluteFill>
  );
};

// numbered steps along a stream
const SSteps: React.FC<P> = (p) => {
  const { s } = p; const n = s.items.length; const f = useCurrentFrame(); const { fps } = useVideoConfig();
  const two = n > 4; const per = two ? Math.ceil(n / 2) : n;
  const bnN = (x: number) => String(x).replace(/\d/g, (d) => "০১২৩৪৫৬৭৮৯"[+d]);
  return (
    <AbsoluteFill>
      <Head h={s.head} />
      <div style={{ position: "absolute", left: 130, right: 130, top: 270, display: "grid", gridTemplateColumns: two ? "1fr 1fr" : "1fr", gridAutoFlow: two ? "column" : "row", gridTemplateRows: `repeat(${per}, auto)`, columnGap: 40, rowGap: 20 }}>
        {s.items.map((it: any, i: number) => {
          const d = v(p, 0.04 + (i / n) * 0.82); const k = ent(f, fps, d); const on = f >= d;
          return (
            <div key={i} style={{ display: "flex", gap: 24, alignItems: "center", opacity: 0.25 + 0.75 * k, transform: `translateX(${(1 - k) * 40}px)` }}>
              <div style={{ width: 76, height: 76, borderRadius: 38, flex: "none", display: "grid", placeItems: "center", background: on ? GRAD : C.line, color: "#fff", fontFamily: BN, fontSize: 38, fontWeight: 800, boxShadow: on ? `0 0 0 ${8 * pop(f, fps, d)}px ${C.brand}22` : "none" }}>{bnN(i + 1)}</div>
              <Card style={{ flex: 1, padding: "18px 26px", boxShadow: "none" }}>
                <div style={{ fontFamily: BN, fontSize: two ? 32 : 36, fontWeight: 800, color: C.ink, lineHeight: 1.3 }}>{it.t}</div>
                {it.s && <div style={{ fontFamily: BN, fontSize: two ? 25 : 28, color: C.mute, marginTop: 4, lineHeight: 1.35 }}>{it.s}</div>}
              </Card>
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};

// formula + worked lines on a "notebook" card
const SCalc: React.FC<P> = (p) => {
  const { s } = p; const n = s.lines.length; const f = useCurrentFrame(); const { fps } = useVideoConfig();
  return (
    <AbsoluteFill>
      <Head h={s.head} />
      {s.formula && <Rise d={8} style={{ position: "absolute", left: 130, right: 130, top: 262 }}>
        <div style={{ display: "inline-flex", alignItems: "center", gap: 18, padding: "18px 30px", borderRadius: 20, background: C.deep, color: "#fff", fontFamily: BN, fontSize: 38, fontWeight: 700 }}><Calculator size={40} color={C.sun} /> {s.formula}</div>
      </Rise>}
      <Card style={{ position: "absolute", left: 130, right: s.img ? 760 : 130, top: s.formula ? 380 : 280, padding: "30px 40px", backgroundImage: `repeating-linear-gradient(transparent 0 71px, ${C.line} 71px 72px)` }}>
        {s.lines.map((l: any, i: number) => {
          const d = v(p, 0.1 + (i / n) * 0.78); const k = ent(f, fps, d); const last = i === n - 1 && s.final !== false;
          return (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: 20, height: 72, opacity: k, transform: `translateY(${(1 - k) * 16}px)` }}>
              <span style={{ fontFamily: BN, fontSize: 34, color: C.mute, flex: 1 }}>{l.t}</span>
              <span style={{ fontFamily: BN, fontSize: last ? 46 : 38, fontWeight: 800, color: last ? "#fff" : C.ink, background: last ? GRAD : "transparent", borderRadius: 14, padding: last ? "2px 22px" : 0, transform: last ? `scale(${0.9 + 0.1 * pop(f, fps, d)})` : undefined }}>{l.v}</span>
            </div>
          );
        })}
      </Card>
      {s.img && <Rise d={10} style={{ position: "absolute", right: 130, top: s.formula ? 380 : 280, width: 580, height: 420 }}><Photo k={s.img} style={{ width: 580, height: 420, border: "8px solid #fff" }} /></Rise>}
    </AbsoluteFill>
  );
};

const SVs: React.FC<P> = (p) => {
  const { s } = p; const n = s.rows.length; const cols = [s.left, s.right];
  return (
    <AbsoluteFill>
      <Head h={s.head} />
      <div style={{ position: "absolute", left: 130, right: 130, top: 260, display: "grid", gridTemplateColumns: "1fr 1fr", columnGap: 30, rowGap: n > 3 ? 14 : 20 }}>
        {cols.map((c: any, j: number) => (
          <Rise key={j} d={6 + j * 8}>
            <div style={{ display: "flex", alignItems: "center", gap: 16, padding: "14px 24px", borderRadius: 20, background: j ? C.deep : GRAD, color: "#fff", fontFamily: BN, fontSize: 40, fontWeight: 800 }}>
              {c.img && <Img src={pic(c.img)} style={{ width: 88, height: 88, borderRadius: 16, objectFit: "cover" }} />}{c.t}
            </div>
          </Rise>
        ))}
        {s.rows.map((r: any, i: number) => [r.l, r.r].map((x: string, j: number) => (
          <Rise key={i + "-" + j} d={v(p, 0.08 + (i / n) * 0.8 + j * 0.04)} y={20}>
            <Card style={{ padding: n > 3 ? "14px 24px" : "20px 26px", boxShadow: "none", minHeight: n > 3 ? 80 : 96, display: "flex", alignItems: "center", gap: 16 }}>
              {r.k && <span style={{ fontFamily: BN, fontSize: 24, fontWeight: 700, color: C.brand, background: C.soft, padding: "4px 12px", borderRadius: 10, flex: "none" }}>{r.k}</span>}
              <span style={{ fontFamily: BN, fontSize: 31, color: C.ink, lineHeight: 1.35, fontWeight: 600 }}>{x}</span>
            </Card>
          </Rise>
        )))}
      </div>
    </AbsoluteFill>
  );
};

const SNote: React.FC<P> = (p) => {
  const { s } = p; const warn = s.kind === "warn"; const f = useCurrentFrame(); const { fps } = useVideoConfig();
  const col = warn ? C.red : C.sun, bg = warn ? C.rsoft : C.ssoft; const k = pop(f, fps, 6);
  return (
    <AbsoluteFill>
      {s.img && <Rise d={4} style={{ position: "absolute", right: 130, top: 200, width: 700, height: 680 }}><Photo k={s.img} style={{ width: 700, height: 680, border: "8px solid #fff" }} /></Rise>}
      <div style={{ position: "absolute", left: 130, top: 230, width: s.img ? 940 : 1660 }}>
        <div style={{ width: 130, height: 130, borderRadius: 36, background: col, display: "grid", placeItems: "center", transform: `scale(${k}) rotate(${(1 - k) * -20}deg)` }}>{warn ? <TriangleAlert size={72} color="#fff" /> : <Lightbulb size={72} color="#fff" />}</div>
        <div style={{ marginTop: 34 }}><H d={10} size={warn ? 60 : 58} color={warn ? C.red : C.ink}>{s.t}</H></div>
        {s.items && <div style={{ marginTop: 26, display: "flex", flexDirection: "column", gap: 16 }}>
          {s.items.map((x: string, i: number) => (
            <Rise key={i} d={v(p, 0.2 + (i / s.items.length) * 0.65)} y={20}>
              <div style={{ display: "flex", gap: 16, alignItems: "flex-start", padding: "16px 22px", borderRadius: 18, background: bg, borderLeft: `8px solid ${col}` }}>
                <span style={{ fontFamily: BN, fontSize: 34, color: C.ink, lineHeight: 1.35, fontWeight: 600 }}>{x}</span>
              </div>
            </Rise>
          ))}
        </div>}
      </div>
    </AbsoluteFill>
  );
};

const SRecap: React.FC<P> = (p) => {
  const { s } = p; const n = s.items.length;
  return (
    <AbsoluteFill>
      <Head h={s.head || ["মনে রাখুন: ", "মূল কথা"]} />
      <div style={{ position: "absolute", left: 130, right: 130, top: 270, display: "grid", gridTemplateColumns: n > 3 ? "1fr 1fr" : "1fr", gap: 22 }}>
        {s.items.map((x: string, i: number) => (
          <Rise key={i} d={v(p, 0.05 + (i / n) * 0.8)} y={24}>
            <Card style={{ padding: "24px 30px", display: "flex", gap: 22, alignItems: "center", boxShadow: "none" }}>
              <div style={{ width: 56, height: 56, borderRadius: 28, background: C.gsoft, display: "grid", placeItems: "center", flex: "none" }}><Check size={32} color={C.green} strokeWidth={3} /></div>
              <span style={{ fontFamily: BN, fontSize: 35, color: C.ink, fontWeight: 700, lineHeight: 1.3 }}>{x}</span>
            </Card>
          </Rise>
        ))}
      </div>
    </AbsoluteFill>
  );
};

const SQuiz: React.FC<P & { answer?: boolean }> = (p) => {
  const { s, answer } = p; const f = useCurrentFrame(); const { fps } = useVideoConfig();
  const L = ["ক", "খ", "গ", "ঘ"]; const hold = s.hold || 0; const end = LEAD + p.vo + hold;
  const left = Math.max(0, Math.ceil((end - f) / fps));
  return (
    <AbsoluteFill>
      <div style={{ position: "absolute", left: 130, top: 140, display: "flex", alignItems: "center", gap: 16 }}>
        <span style={{ padding: "10px 24px", borderRadius: 40, background: answer ? C.gsoft : C.ssoft, color: answer ? C.green : C.deep, fontFamily: BN, fontSize: 32, fontWeight: 800 }}>{answer ? "উত্তর" : "ছোট্ট প্রশ্ন"}</span>
        {!answer && hold > 0 && <span style={{ display: "inline-flex", alignItems: "center", gap: 8, fontFamily: BN, fontSize: 30, color: C.mute }}><Timer size={30} /> ভাবুন… {String(left).replace(/\d/g, (d) => "০১২৩৪৫৬৭৮৯"[+d])}</span>}
      </div>
      <div style={{ position: "absolute", left: 130, right: 130, top: 230 }}><H d={4} size={52}>{s.q}</H></div>
      <div style={{ position: "absolute", left: 130, right: 130, top: 420, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>
        {s.o.map((o: string, i: number) => {
          const ok = answer && i === s.a, dim = answer && i !== s.a;
          return (
            <Rise key={i} d={answer ? 2 : v(p, 0.3 + i * 0.12)} y={20}>
              <Card style={{ padding: "24px 28px", display: "flex", gap: 20, alignItems: "center", boxShadow: "none", opacity: dim ? 0.45 : 1, border: ok ? `3px solid ${C.green}` : `1px solid ${C.line}`, background: ok ? C.gsoft : C.card }}>
                <span style={{ width: 60, height: 60, borderRadius: 30, flex: "none", display: "grid", placeItems: "center", background: ok ? C.green : C.soft, color: ok ? "#fff" : C.brand, fontFamily: BN, fontSize: 32, fontWeight: 800 }}>{ok ? <Check size={34} strokeWidth={3} /> : L[i]}</span>
                <span style={{ fontFamily: BN, fontSize: 34, color: C.ink, fontWeight: 600, lineHeight: 1.3 }}>{o}</span>
              </Card>
            </Rise>
          );
        })}
      </div>
      {answer && s.why && <Rise d={v(p, 0.3)} style={{ position: "absolute", left: 130, right: 130, top: 760, fontFamily: BN, fontSize: 32, color: C.mute, lineHeight: 1.4 }}><Lightbulb size={30} color={C.sun} style={{ verticalAlign: "-4px" }} /> {s.why}</Rise>}
    </AbsoluteFill>
  );
};

const SOutro: React.FC<P> = (p) => {
  const { spec } = p; const f = useCurrentFrame(); const { fps } = useVideoConfig(); const k = pop(f, fps, 6);
  return (
    <AbsoluteFill style={{ alignItems: "center", justifyContent: "center" }}>
      <div style={{ textAlign: "center", marginTop: -60 }}>
        <div style={{ width: 150, height: 150, borderRadius: 75, background: GRAD, display: "grid", placeItems: "center", margin: "0 auto", transform: `scale(${k})` }}><Trophy size={78} color="#fff" /></div>
        <div style={{ marginTop: 36 }}><H d={10} size={66}>দারুণ! পাঠটি শেষ হলো</H></div>
        {spec.next && <Rise d={24} style={{ marginTop: 28 }}><span style={{ display: "inline-flex", alignItems: "center", gap: 14, padding: "16px 32px", borderRadius: 50, background: C.card, border: `1px solid ${C.line}`, fontFamily: BN, fontSize: 34, color: C.ink, fontWeight: 700 }}>পরের পাঠ <ArrowRight size={32} color={C.brand} /> {spec.next}</span></Rise>}
        <Rise d={34} style={{ marginTop: 26 }}><span style={{ fontFamily: BN, fontSize: 30, color: C.mute }}>কুইজ দিয়ে নিজেকে যাচাই করুন · সন্দেহ হলে উপজেলা মৎস্য অফিসের পরামর্শ নিন</span></Rise>
      </div>
    </AbsoluteFill>
  );
};

const MAP: Record<string, React.FC<any>> = { title: STitle, points: SPoints, photo: SPhoto, species: SSpecies, layers: SLayers, bars: SBars, steps: SSteps, calc: SCalc, vs: SVs, note: SNote, recap: SRecap, quizQ: SQuiz, quizA: (p: P) => <SQuiz {...p} answer />, outro: SOutro };
export const SCENE_TYPES = Object.keys(MAP);

/* ---------- frame chrome: pond background, header, credits, subtitles ---------- */
const Pond: React.FC = () => {
  const f = useCurrentFrame();
  const wave = (y: number, a: number, ph: number, sp: number) => `M0 ${y} ` + Array.from({ length: 25 }, (_, i) => { const x = i * 80; return `L${x} ${y + Math.sin(x / 140 + f / sp + ph) * a}`; }).join(" ") + ` L1920 1080 L0 1080 Z`;
  return (
    <AbsoluteFill>
      <AbsoluteFill style={{ background: `linear-gradient(180deg, #F3FAF9 0%, ${C.bg} 55%, #D7EFEB 100%)` }} />
      <AbsoluteFill style={{ background: `radial-gradient(900px 520px at 88% 4%, ${C.sun}22, transparent 70%), radial-gradient(900px 600px at 0% 100%, ${C.brand2}14, transparent 70%)` }} />
      <svg width={1920} height={1080} style={{ position: "absolute", inset: 0 }}>
        <path d={wave(985, 10, 0, 22)} fill={C.water1} opacity={0.55} />
        <path d={wave(1010, 8, 2, 16)} fill={C.water2} opacity={0.45} />
        <SwimFish x={300} y={1040} s={0.6} c={C.brand} speed={1.4} />
        <SwimFish x={1200} y={1052} s={0.45} c={C.deep} flip speed={1.0} />
        {Array.from({ length: 10 }, (_, i) => { const x = 90 + i * 190 + (i % 3) * 30; const t = ((f + i * 37) % 260) / 260; return <circle key={i} cx={x + Math.sin(f / 15 + i) * 8} cy={1070 - t * 900} r={4 + (i % 3) * 3} fill="none" stroke={C.brand} strokeWidth={2} opacity={0.18 * (1 - t)} />; })}
      </svg>
    </AbsoluteFill>
  );
};
const Header: React.FC<{ spec: Spec; starts: number[] }> = ({ spec, starts }) => {
  const f = useCurrentFrame(); const k = starts.filter((s) => f >= s).length;
  return (
    <div style={{ position: "absolute", left: 0, right: 0, top: 0, height: 96, display: "flex", alignItems: "center", gap: 22, padding: "0 56px", background: "rgba(255,255,255,.92)", borderBottom: `1px solid ${C.line}` }}>
      <Img src={staticFile("brand/logo.png")} style={{ height: 52 }} />
      <div style={{ width: 1, height: 34, background: C.line }} />
      <Fish size={30} color={C.brand} />
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
// which pictures a scene shows → small credit line (Commons photos) or "এআই দিয়ে তৈরি ছবি"
const scenePics = (s: Scene): string[] => [s.img, s.left?.img, s.right?.img, ...(s.items || []).map((x: any) => x?.img), ...(s.rows || []).flatMap((r: any) => [r?.img, ...((r?.fish || []).map((x: any) => x.img))])].filter(Boolean);
const CreditLine: React.FC<{ s: Scene; spec: Spec }> = ({ s, spec }) => {
  const ks = scenePics(s); if (!ks.length) return null;
  const photos = ks.filter((k) => k.startsWith("photos/")).map((k) => spec.credits?.[k.slice(7)]).filter(Boolean) as Credit[];
  const ai = ks.some((k) => k.startsWith("ai/"));
  const txt = [photos.length ? "ছবি: " + [...new Set(photos.map((c) => `${c.author} (${c.license})`))].join(" · ") + " — Wikimedia Commons" : "", ai ? "কিছু ছবি এআই দিয়ে তৈরি" : ""].filter(Boolean).join("  |  ");
  return <div style={{ position: "absolute", left: 40, bottom: 112, maxWidth: 1180, padding: "3px 12px", borderRadius: 10, background: "rgba(255,255,255,.8)", fontFamily: BN, fontSize: 15, color: C.mute, display: "flex", gap: 8, alignItems: "center", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}><Camera size={15} style={{ flex: "none" }} /> <span style={{ overflow: "hidden", textOverflow: "ellipsis" }}>{txt}</span></div>;
};
const subChunks = (spec: Spec, starts: number[]) => spec.scenes.flatMap((s, i) => {
  const parts = s.vo.split(/(?<=[।?!,—])\s+/).reduce<string[]>((a, x) => { if (a.length && (a[a.length - 1].length < 24 || x.length < 10)) a[a.length - 1] += " " + x; else a.push(x); return a; }, []);
  const total = parts.reduce((n, x) => n + x.length, 0); let acc = 0; const b = starts[i] + LEAD;
  return parts.map((x) => { const from = b + (s.frames * acc) / total; acc += x.length; return { s: x, from, to: b + (s.frames * acc) / total }; });
});

export const FishVideo: React.FC<{ spec: Spec }> = ({ spec }) => {
  const f = useCurrentFrame();
  const lens = spec.scenes.map(sceneLen);
  const starts = lens.reduce<number[]>((a, _, i) => [...a, i ? a[i - 1] + lens[i - 1] : 15], []);
  const chunks = subChunks(spec, starts);
  const cur = chunks.find((x) => f >= x.from && f < x.to + 4);
  const total = fishLen(spec);
  const busy = (fr: number) => spec.scenes.some((s, i) => fr >= starts[i] + LEAD - 6 && fr <= starts[i] + LEAD + s.frames + 4);
  return (
    <AbsoluteFill style={{ background: C.bg }}>
      <Pond />
      {spec.scenes.map((s, i) => {
        const S = MAP[s.type]; const len = lens[i];
        return (
          <Sequence key={i} from={starts[i]} durationInFrames={len}>
            <Fade len={len}><S s={s} spec={spec} vo={s.frames} /><CreditLine s={s} spec={spec} /></Fade>
            <Sequence from={LEAD}><Audio src={staticFile(`fish/${spec.id}/vo/${String(i + 1).padStart(2, "0")}.mp3`)} /></Sequence>
            <Sequence from={0}><Audio src={staticFile(`aiu2/${i === 0 ? "swell" : s.type === "quizA" || s.type === "outro" ? "chime" : "whoosh"}.mp3`)} volume={0.3} /></Sequence>
          </Sequence>
        );
      })}
      <Header spec={spec} starts={starts} />
      <AiTag />
      {cur && <div style={{ position: "absolute", left: 0, right: 0, bottom: 34, display: "flex", justifyContent: "center", opacity: interpolate(f, [cur.from, cur.from + 5, cur.to, cur.to + 4], [0, 1, 1, 0], clamp) }}><div style={{ maxWidth: 1500, padding: "10px 28px 14px", borderRadius: 14, background: "rgba(6,64,74,.9)", fontFamily: BN, fontSize: 36, fontWeight: 500, color: "#fff", textAlign: "center", lineHeight: 1.35 }}>{cur.s.replace(/[।,]$/, "")}</div></div>}
      <Audio src={staticFile("aiu2/music.mp3")} volume={(fr) => (busy(fr) ? 0.05 : 0.15) * interpolate(fr, [0, 30, total - 60, total], [0, 1, 1, 0], clamp)} />
    </AbsoluteFill>
  );
};
const Fade: React.FC<{ len: number; children: React.ReactNode }> = ({ len, children }) => {
  const f = useCurrentFrame();
  const o = Math.min(interpolate(f, [0, 12], [0, 1], { ...clamp, easing: ease }), interpolate(f, [len - 10, len], [1, 0], clamp));
  return <AbsoluteFill style={{ opacity: o, transform: `translateY(${(1 - o) * 14}px)` }}>{children}</AbsoluteFill>;
};
