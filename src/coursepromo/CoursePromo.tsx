// AI University — generic course promo (no price), the owner's Japanese v2 structure (2026-10-22) made reusable (2026-10-28):
// hook question → কেন <lang> শিখবেন (3 sourced facts) → this course → step-by-step classroom → app → quiz + challenge → এআই সহায়ক → "প্রথম ২০% ফ্রি" CTA.
// Everything course-specific lives in spec.brand (assets under public/<brand.dir>/). Comps CoursePromoH (1920x1080) / CoursePromoV (1080x1920).
// Spec src/coursepromo/specs/<id>.json → scripts/course_promo_make.py (VO + timing) → public/<brand.dir>/<id>/props.json → scripts/course_promo_cloud.py.
import React from "react";
import { AbsoluteFill, Audio, Img, OffthreadVideo, Sequence, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig, Easing, delayRender, continueRender } from "remotion";
import { Check, Bot, Play, Crown, Target, Smartphone, Sparkles, ShieldCheck } from "lucide-react";

const C = { bg: "#07070D", ink: "#0B0B14", yel: "#FFD60A", red: "#FF2D55", jp: "#E60026", mint: "#2EE59D", sky: "#3DB8FF", white: "#FFFFFF", mute: "#A9ADC6", bd: "#006A4E" };
const BN = "Anek", EN = "Montserrat", JP = "NotoJP, NotoKR";
if (typeof document !== "undefined") {
  for (const [n, u] of [["Anek", "fonts/AnekBangla.ttf"], ["Montserrat", "fonts/Montserrat.ttf"], ["NotoJP", "fonts/NotoSansJP.ttf"], ["NotoKR", "fonts/NotoSansKR.ttf"]]) {
    const h = delayRender(`font ${n}`);
    const f = new FontFace(n, `url(${staticFile(u)})`, { weight: "100 900" });
    f.load().then(() => { document.fonts.add(f); continueRender(h); }).catch(() => continueRender(h));
  }
}
const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const ease = Easing.bezier(0.16, 1, 0.3, 1);
const pop = (f: number, fps: number, d: number) => spring({ frame: f - d, fps, config: { damping: 11, mass: 0.55 } });
const JPR = /([　-ヿ一-鿿！-｠가-힣ㄱ-ㆎ]+)/;
const mix = (t: string) => t.split(JPR).map((x, i) => (i % 2 ? <span key={i} style={{ fontFamily: JP, fontWeight: 900 }}>{x}</span> : x));
const bnNum = (n: number) => { const s = String(Math.round(n)); const last3 = s.slice(-3); const rest = s.slice(0, -3); const g = rest ? rest.replace(/\B(?=(\d{2})+(?!\d))/g, ",") + "," + last3 : last3; return g.replace(/\d/g, (d) => "০১২৩৪৫৬৭৮৯"[+d]); };
// "*x*" highlight → [text, hot][]
const hot = (t: string) => t.split(/(\*[^*]+\*)/).filter(Boolean).map((x) => (x.startsWith("*") ? [x.slice(1, -1), true] : [x, false]) as [string, boolean]);
const Rich: React.FC<{ t: string; color?: string }> = ({ t, color = C.yel }) => <>{hot(t).map(([x, h], i) => <span key={i} style={{ color: h ? color : undefined }}>{mix(x)}</span>)}</>;

export type B = { t?: string; cap?: string; hold?: number; file?: string; frames: number; a: number; b: number; [k: string]: any };
export type S2 = { type: string; beats: B[]; len: number; [k: string]: any };
export type Brand = { dir: string; lang: string; word: string; wordEn?: boolean; accent: string; cover: string; guru: string; guruName: string; courseD: string; courseM: string; url: string; cta: string; honest: string };
export type Spec2 = { id: string; scenes: S2[]; total: number; brand: Brand };
const BrandCtx = React.createContext<Brand>({} as Brand);
const useBrand = () => React.useContext(BrandCtx);
export const p2Len = (s: Spec2) => s.total || 300;
type SP = { s: S2; v: boolean };
const cur = (s: S2, f: number) => { const ts = s.beats.filter((b) => b.t); let k = 0; ts.forEach((b, i) => { if (f >= b.a - 3) k = i; }); return k; };

const Pop: React.FC<{ d: number; children: React.ReactNode; style?: React.CSSProperties; from?: number }> = ({ d, children, style, from = 0.4 }) => {
  const f = useCurrentFrame(); const { fps } = useVideoConfig(); const k = pop(f, fps, d);
  return <div style={{ opacity: Math.min(1, k * 1.6), transform: `scale(${from + (1 - from) * k})`, ...style }}>{children}</div>;
};
const Slam: React.FC<{ d: number; children: React.ReactNode; style?: React.CSSProperties }> = ({ d, children, style }) => {
  const f = useCurrentFrame(); const t = f - d; if (t < 0) return null;
  const s = interpolate(t, [0, 5, 9], [1.9, 0.94, 1], { ...clamp, easing: ease }); const o = interpolate(t, [0, 3], [0, 1], clamp);
  return <div style={{ transform: `scale(${s})`, opacity: o, ...style }}>{children}</div>;
};

// kinetic caption: the current phrase of the voiced line, words pop in as they are spoken
const Kinetic: React.FC<{ s: S2; v: boolean }> = ({ s, v }) => {
  const f = useCurrentFrame(); if (s.nocap) return null;
  const b = s.beats.filter((x) => x.t && f >= x.a - 2).pop(); if (!b || f > b.b + 6 || b.nocap) return null;
  const text = b.cap || b.t!; const phrases = text.split(/(?<=[।?!—:])\s+/);
  const tot = text.replace(/\*/g, "").length; let acc = 0;
  const ph = phrases.map((p) => { const st = acc; acc += p.replace(/\*/g, "").length + 1; return { p, st: b.a + (st / tot) * b.frames }; });
  const k = Math.max(0, ph.filter((x) => f >= x.st - 2).length - 1); const P = ph[k];
  const words = hot(P.p).flatMap(([x, h]) => x.split(/\s+/).filter(Boolean).map((w) => [w, h] as [string, boolean]));
  const plen = P.p.replace(/\*/g, "").length || 1; const pf = ((ph[k + 1]?.st ?? b.b) - P.st);
  let wacc = 0;
  return (
    <div style={{ position: "absolute", left: v ? 50 : 140, right: v ? 50 : 140, bottom: v ? 400 : 60, display: "flex", justifyContent: "center", pointerEvents: "none" }}>
      <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", columnGap: v ? 16 : 18, rowGap: 4, maxWidth: v ? 980 : 1560 }}>
        {words.map(([w, h], i) => { const ws = P.st + (wacc / plen) * pf * 0.9; wacc += w.length + 1; const t = f - ws;
          const sc = interpolate(t, [0, 4, 7], [0.5, 1.12, 1], { ...clamp, easing: ease }); const o = interpolate(t, [-1, 2], [0, 1], clamp);
          return <span key={k + "-" + i} style={{ display: "inline-block", opacity: o, transform: `scale(${sc})`, fontFamily: BN, fontWeight: 800, fontSize: v ? 62 : 64, lineHeight: 1.25, color: h ? C.ink : "#fff", background: h ? C.yel : "transparent", padding: h ? "0 12px" : 0, borderRadius: 10, textShadow: h ? "none" : "0 4px 0 #000, 0 0 24px rgba(0,0,0,.9)" }}>{mix(w)}</span>; })}
      </div>
    </div>
  );
};

// a 16:9 clip/shot in a frame that punches in
const Media: React.FC<{ src: string; w: number; label?: string; z?: [number, number]; len: number; shot?: boolean; pos?: string }> = ({ src, w, label, z = [1.04, 1.14], len, shot, pos }) => {
  const f = useCurrentFrame(); const h = Math.round((w * 9) / 16); const sc = interpolate(f, [0, len], z);
  return <div style={{ width: w, height: h, borderRadius: 24, overflow: "hidden", position: "relative", border: "5px solid #fff", boxShadow: "0 40px 90px rgba(0,0,0,.7)", background: "#000" }}>
    <div style={{ position: "absolute", inset: 0, transform: `scale(${sc})` }}>
      {shot ? <Img src={staticFile(src)} style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: pos || "50% 0%" }} /> : <OffthreadVideo src={staticFile(src)} muted style={{ width: "100%", height: "100%", objectFit: "cover" }} />}
    </div>
    {label && <div style={{ position: "absolute", left: 16, top: 16, display: "flex", alignItems: "center", gap: 8, padding: "6px 16px", borderRadius: 12, background: C.red, fontFamily: BN, fontWeight: 800, fontSize: 28, color: "#fff" }}><Play size={22} fill="#fff" /> {label}</div>}
  </div>;
};
const Flash: React.FC<{ at: number }> = ({ at }) => { const f = useCurrentFrame(); const t = f - at; if (t < 0 || t > 5) return null; return <AbsoluteFill style={{ background: "#fff", opacity: interpolate(t, [0, 5], [0.55, 0]) }} />; };

// 1 · hook: full-bleed real lesson clips, huge question that changes per beat (first words on screen at frame 0)
const SHook: React.FC<SP> = ({ s, v }) => {
  const f = useCurrentFrame(); const B = useBrand(); const ts = s.beats.filter((b) => b.t); const k = cur(s, f); const heads: string[] = s.heads || []; const clips: string[] = s.clips || [];
  const st = (i: number) => (i ? ts[i].a - 3 : 0);
  return (
    <AbsoluteFill>
      {clips.map((c, i) => { const a = st(i), e = i + 1 < ts.length ? st(i + 1) : s.len;
        return <Sequence key={i} from={a} durationInFrames={Math.max(1, e - a)} layout="none"><AbsoluteFill style={{ transform: `scale(${interpolate(f - a, [0, e - a], [1.12, 1.24])})`, filter: v ? "blur(18px)" : undefined }}><OffthreadVideo src={staticFile(c)} muted style={{ width: "100%", height: "100%", objectFit: "cover" }} /></AbsoluteFill>
          {v && <div style={{ position: "absolute", left: 0, top: 290, width: 1080, height: 608, overflow: "hidden", borderTop: `6px solid ${C.yel}`, borderBottom: `6px solid ${C.yel}` }}><div style={{ width: "100%", height: "100%", transform: `scale(${interpolate(f - a, [0, e - a], [1.0, 1.1])})` }}><OffthreadVideo src={staticFile(c)} muted style={{ width: "100%", height: "100%", objectFit: "cover" }} /></div></div>}<Flash at={0} /></Sequence>; })}
      <AbsoluteFill style={{ background: v ? "linear-gradient(180deg, rgba(7,7,13,.2) 0%, rgba(7,7,13,.2) 45%, rgba(7,7,13,.85) 55%)" : "linear-gradient(180deg, rgba(7,7,13,.55), rgba(7,7,13,.82))" }} />
      <div style={{ position: "absolute", left: 0, right: 0, top: v ? 1010 : 90, textAlign: "center", fontFamily: B.wordEn ? EN : JP, fontWeight: 900, fontSize: (v ? 240 : 360) * (B.wordEn ? 0.75 : 1), color: "transparent", WebkitTextStroke: `4px ${B.accent}`, opacity: v ? 0.5 : 0.32, lineHeight: 1 }}>{B.word}</div>
      <AbsoluteFill style={{ display: "flex", alignItems: "center", justifyContent: "center", padding: v ? "0 60px" : "0 120px", paddingTop: v ? 880 : 40 }}>
        <Slam key={k} d={st(k)}><div style={{ fontFamily: BN, fontWeight: 800, fontSize: v ? 112 : 128, lineHeight: 1.18, color: "#fff", textAlign: "center", textShadow: "0 8px 0 #000, 0 0 40px rgba(0,0,0,.8)" }}>{(heads[k] || "").split("<br>").map((ln, i) => <div key={i}><Rich t={ln} /></div>)}</div></Slam>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

// 2 · কেন জাপানি শিখবেন: title, then one sourced fact card per beat
const Flags: React.FC<{ size: number }> = ({ size }) => <div style={{ display: "flex", gap: size * 0.25, alignItems: "center", justifyContent: "center" }}>
  <div style={{ width: size * 1.6, height: size, borderRadius: 8, background: C.bd, position: "relative", boxShadow: "0 6px 20px rgba(0,0,0,.4)" }}><div style={{ position: "absolute", left: size * 0.55, top: size * 0.2, width: size * 0.6, height: size * 0.6, borderRadius: "50%", background: "#F42A41" }} /></div>
  <span style={{ fontFamily: EN, fontWeight: 900, fontSize: size * 0.7, color: C.yel }}>+</span>
  <div style={{ width: size * 1.6, height: size, borderRadius: 8, background: "#fff", position: "relative", boxShadow: "0 6px 20px rgba(0,0,0,.4)" }}><div style={{ position: "absolute", left: size * 0.5, top: size * 0.2, width: size * 0.6, height: size * 0.6, borderRadius: "50%", background: C.jp }} /></div>
</div>;
const SWhy: React.FC<SP> = ({ s, v }) => {
  const f = useCurrentFrame(); const B = useBrand(); const ts = s.beats.filter((b) => b.t); const k = cur(s, f); const cards: any[] = s.cards || []; const off = s.cardFrom ?? 1;
  const ci = k - off; const c = cards[ci]; const b = ts[k];
  const n = c?.count ? interpolate(f, [b.a, b.a + 40], [0, c.count], { ...clamp, easing: ease }) : 0;
  return (
    <AbsoluteFill style={{ display: "flex", flexDirection: "column", alignItems: "center", paddingTop: v ? 280 : 70 }}>
      <AbsoluteFill style={{ background: `radial-gradient(900px 700px at 50% ${v ? 45 : 55}%, rgba(230,0,38,.35), transparent 70%)` }} />
      <div style={{ position: "absolute", left: "50%", top: v ? 980 : 560, width: v ? 760 : 820, height: v ? 760 : 820, marginLeft: v ? -380 : -410, marginTop: v ? -380 : -410, borderRadius: "50%", background: B.accent, opacity: 0.18 }} />
      <Pop d={2}><div style={{ fontFamily: BN, fontWeight: 800, fontSize: ci < 0 ? (v ? 108 : 120) : v ? 64 : 64, color: "#fff", textAlign: "center", lineHeight: 1.15, transition: "none", marginTop: ci < 0 ? (v ? 380 : 260) : 0 }}>কেন <span style={{ color: C.yel }}>{B.lang}</span> শিখবেন?</div></Pop>
      {ci < 0 && <Pop d={ts[0].a + 20} style={{ marginTop: 30 }}><div style={{ display: "flex", gap: 22 }}>{[1, 2, 3].map((i) => <div key={i} style={{ width: 110, height: 110, borderRadius: 55, background: C.yel, display: "grid", placeItems: "center", fontFamily: BN, fontWeight: 900, fontSize: 70, color: C.ink }}>{"১২৩"[i - 1]}</div>)}</div></Pop>}
      {c && <Slam key={ci} d={b.a - 3} style={{ marginTop: v ? 70 : 50 }}>
        <div style={{ width: v ? 960 : 1300, boxSizing: "border-box", padding: v ? "40px 40px 30px" : "40px 60px 30px", borderRadius: 40, background: "#fff", boxShadow: `0 0 0 8px ${C.yel}, 0 50px 100px rgba(0,0,0,.6)`, textAlign: "center", position: "relative" }}>
          <div style={{ position: "absolute", left: 30, top: -44, width: 88, height: 88, borderRadius: 44, background: C.red, display: "grid", placeItems: "center", fontFamily: BN, fontWeight: 900, fontSize: 56, color: "#fff" }}>{"১২৩"[ci]}</div>
          {c.flags && <div style={{ marginBottom: 10 }}><Flags size={v ? 70 : 76} /></div>}
          <div style={{ fontFamily: c.en ? EN : BN, fontWeight: 900, fontSize: c.count ? (v ? 150 : 170) : c.en ? (v ? 84 : 104) : v ? 140 : 160, color: B.accent, lineHeight: 1.05 }}>{c.count ? bnNum(n) : c.big}</div>
          <div style={{ marginTop: 14, fontFamily: BN, fontWeight: 800, fontSize: v ? 44 : 48, color: C.ink, lineHeight: 1.3 }}><Rich t={c.label} color={C.red} /></div>
          <div style={{ marginTop: 20, display: "inline-flex", alignItems: "center", gap: 10, padding: "8px 20px", borderRadius: 14, background: "#EEF0F7", fontFamily: BN, fontWeight: 600, fontSize: v ? 26 : 26, color: "#4B5070", lineHeight: 1.35 }}><ShieldCheck size={26} color="#4B5070" /> {c.src}</div>
        </div></Slam>}
    </AbsoluteFill>
  );
};

// 3 · reveal: the real course page (logged-out capture) scrolling in a browser frame + course name
const Browser: React.FC<{ src: string; w: number; h: number; url: string; scroll: [number, number]; len: number; d?: number }> = ({ src, w, h, url, scroll, len, d = 0 }) => {
  const f = useCurrentFrame(); const y = interpolate(f, [d + 10, len - 6], scroll, { ...clamp, easing: Easing.inOut(Easing.cubic) });
  return <div style={{ width: w, height: h, borderRadius: 26, overflow: "hidden", background: "#0A0E1F", border: "4px solid #2A3156", boxShadow: "0 50px 100px rgba(0,0,0,.7)", display: "flex", flexDirection: "column" }}>
    <div style={{ height: 54, flex: "none", display: "flex", alignItems: "center", gap: 10, padding: "0 20px", background: "#151A33" }}>
      {["#FF5F57", "#FEBC2E", "#28C840"].map((c) => <div key={c} style={{ width: 14, height: 14, borderRadius: 7, background: c }} />)}
      <div style={{ marginLeft: 14, flex: 1, height: 34, borderRadius: 17, background: "#0A0E1F", display: "flex", alignItems: "center", padding: "0 18px", fontFamily: EN, fontWeight: 700, fontSize: 20, color: "#C9CEE8" }}>{url}</div>
    </div>
    <div style={{ flex: 1, overflow: "hidden", position: "relative" }}><Img src={staticFile(src)} style={{ position: "absolute", left: 0, top: -y, width: "100%" }} /></div>
  </div>;
};
const SReveal: React.FC<SP> = ({ s, v }) => {
  const f = useCurrentFrame(); const B = useBrand();
  return (
    <AbsoluteFill style={{ display: "flex", flexDirection: "column", alignItems: "center", paddingTop: v ? 270 : 60, gap: v ? 26 : 22 }}>
      <AbsoluteFill style={{ background: `radial-gradient(1000px 700px at 50% 50%, rgba(0,80,237,.35), transparent 70%)` }} />
      <Pop d={2}><Img src={staticFile("brand/logo-dark.png")} style={{ height: v ? 90 : 70 }} /></Pop>
      <div style={{ transform: `scale(${interpolate(f, [0, 14], [0.85, 1], { ...clamp, easing: ease })}) rotate(${interpolate(f, [0, 14], [-2, 0], clamp)}deg)` }}>
        {v ? <Browser src={B.courseM} w={760} h={860} url="aiuniversitybd.com" scroll={[0, 1500]} len={s.len} />
          : <Browser src={B.courseD} w={1200} h={660} url={B.url} scroll={[0, 1150]} len={s.len} />}
      </div>
    </AbsoluteFill>
  );
};

// 4 · montage: fast cuts of real clips / page captures, one label each
const SMontage: React.FC<SP> = ({ s, v }) => {
  const f = useCurrentFrame(); const items: [string, string][] = s.items || []; const n = items.length; const per = Math.ceil(s.len / n);
  const W = v ? 1040 : s.head ? 1220 : 1340;
  return (
    <AbsoluteFill style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "flex-start", paddingTop: v ? (s.head ? 380 : 480) : 60 }}>
      {s.head && <Pop d={2} style={{ marginBottom: v ? 40 : 22 }}><div style={{ fontFamily: BN, fontWeight: 800, fontSize: v ? 66 : 58, color: "#fff", textAlign: "center", lineHeight: 1.2, padding: "0 30px" }}><Rich t={s.head} /></div></Pop>}
      <div style={{ position: "relative", width: W, height: Math.round((W * 9) / 16) + 10 }}>
        {items.map(([src, label], i) => <Sequence key={i} from={i * per} durationInFrames={i === n - 1 ? s.len - i * per : per} layout="none">
          <div style={{ position: "absolute", inset: 0 }}><Media src={src} w={W} label={label} len={per} shot={/\.(jpg|png)$/.test(src)} z={[1.0, 1.12]} /></div><Flash at={0} />
        </Sequence>)}
      </div>
      <div style={{ marginTop: 24, display: "flex", gap: 14 }}>{items.map((_, i) => <div key={i} style={{ width: i === Math.min(n - 1, Math.floor(f / per)) ? 60 : 20, height: 12, borderRadius: 6, background: i <= Math.floor(f / per) ? C.yel : "rgba(255,255,255,.25)" }} />)}</div>
    </AbsoluteFill>
  );
};

// 5 · app: three real app screens in phone frames
const Phone: React.FC<{ src: string; w: number }> = ({ src, w }) => <div style={{ width: w, height: w * 2.16, borderRadius: w * 0.13, background: "#111", padding: w * 0.035, boxShadow: "0 40px 80px rgba(0,0,0,.6)", boxSizing: "border-box" }}>
  <div style={{ width: "100%", height: "100%", borderRadius: w * 0.1, overflow: "hidden", background: "#fff" }}><Img src={staticFile(src)} style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "50% 0%" }} /></div></div>;
const SApp: React.FC<SP> = ({ s, v }) => {
  const f = useCurrentFrame(); const { fps } = useVideoConfig(); const shots: string[] = s.shots || []; const W = v ? 300 : 285;
  return (
    <AbsoluteFill style={{ display: "flex", flexDirection: "column", alignItems: "center", paddingTop: v ? 290 : 60 }}>
      <AbsoluteFill style={{ background: `radial-gradient(900px 600px at 50% 60%, rgba(46,229,157,.25), transparent 70%)` }} />
      <Pop d={2}><div style={{ display: "flex", alignItems: "center", gap: 16, padding: "10px 30px", borderRadius: 40, background: C.mint, fontFamily: BN, fontWeight: 800, fontSize: v ? 44 : 42, color: C.ink }}><Smartphone size={44} /> AI University অ্যাপ</div></Pop>
      <div style={{ marginTop: v ? 60 : 40, display: "flex", gap: v ? 26 : 50, alignItems: "flex-start" }}>
        {shots.map((sh, i) => { const k = pop(f, fps, 6 + i * 7); const mid = i === 1;
          return <div key={i} style={{ transform: `translateY(${(1 - k) * 400 + (mid ? -30 : 20)}px) rotate(${(i - 1) * 5 * k}deg) scale(${mid ? 1.06 : 0.96})`, opacity: Math.min(1, k * 1.5) }}><Phone src={sh} w={W} /></div>; })}
      </div>
    </AbsoluteFill>
  );
};

// 6 · এআই সহায়ক সেনসেই: real avatar + example chat (clearly labelled উদাহরণ)
const SSensei: React.FC<SP> = ({ s, v }) => {
  const f = useCurrentFrame(); const B = useBrand(); const t = s.beats.find((b) => b.t)!; const ans: string = s.ans || ""; const d2 = t.a + 22;
  const typed = Math.round(interpolate(f, [d2, d2 + 34], [0, [...ans].length], clamp));
  return (
    <AbsoluteFill style={{ display: "flex", flexDirection: v ? "column" : "row", alignItems: "center", justifyContent: v ? "flex-start" : "center", gap: v ? 40 : 70, paddingTop: v ? 290 : 0, paddingBottom: v ? 0 : 140 }}>
      <AbsoluteFill style={{ background: `radial-gradient(800px 600px at ${v ? "50% 35%" : "30% 45%"}, rgba(255,45,85,.3), transparent 70%)` }} />
      <Pop d={2}><div style={{ textAlign: "center" }}>
        <div style={{ width: v ? 330 : 380, height: v ? 330 : 380, borderRadius: "50%", overflow: "hidden", border: `10px solid ${C.yel}`, margin: "0 auto", boxShadow: `0 0 80px ${C.yel}66` }}><Img src={staticFile(B.guru)} style={{ width: "100%", height: "100%", objectFit: "cover", transform: `scale(${interpolate(f, [0, s.len], [1, 1.08])})` }} /></div>
        <div style={{ marginTop: 18, display: "inline-flex", alignItems: "center", gap: 12, padding: "10px 26px", borderRadius: 30, background: C.yel, fontFamily: BN, fontWeight: 800, fontSize: 38, color: C.ink }}><Bot size={38} /> এআই সহায়ক · {B.guruName}</div>
      </div></Pop>
      <div style={{ width: v ? 920 : 820, display: "flex", flexDirection: "column", gap: 18 }}>
        <div style={{ alignSelf: "flex-start", padding: "4px 16px", borderRadius: 10, background: "rgba(255,255,255,.14)", fontFamily: BN, fontWeight: 700, fontSize: 26, color: C.mute }}>উদাহরণ</div>
        <Pop d={8} style={{ alignSelf: "flex-end" }}><div style={{ padding: "18px 28px", borderRadius: 28, borderBottomRightRadius: 6, background: C.sky, fontFamily: BN, fontWeight: 700, fontSize: v ? 40 : 38, color: C.ink }}>{mix(s.q || "")}</div></Pop>
        {f >= d2 && <div style={{ alignSelf: "flex-start", maxWidth: v ? 860 : 760, padding: "18px 28px", borderRadius: 28, borderBottomLeftRadius: 6, background: "#fff", fontFamily: BN, fontWeight: 700, fontSize: v ? 38 : 36, color: C.ink, lineHeight: 1.35 }}>{mix([...ans].slice(0, typed).join(""))}{typed < [...ans].length && <span style={{ color: C.red }}>▍</span>}</div>}
      </div>
    </AbsoluteFill>
  );
};

// 7 · CTA: প্রথম ২০% ফ্রি + url + honest line
const SCta: React.FC<SP> = ({ s, v }) => {
  const f = useCurrentFrame(); const B = useBrand(); const ts = s.beats.filter((b) => b.t); const k = cur(s, f); const last = ts[ts.length - 1];
  return (
    <AbsoluteFill>
      <AbsoluteFill style={{ transform: `scale(${interpolate(f, [0, s.len], [1.05, 1.14])})` }}><Img src={staticFile(B.cover)} style={{ width: "100%", height: "100%", objectFit: "cover", opacity: 0.35 }} /></AbsoluteFill>
      <AbsoluteFill style={{ background: "radial-gradient(ellipse at 50% 50%, rgba(7,7,13,.55), rgba(7,7,13,.94))" }} />
      <AbsoluteFill style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: v ? "flex-start" : "center", paddingTop: v ? 300 : 0, paddingBottom: v ? 0 : 120, gap: v ? 30 : 24 }}>
        {k === 0 && ts.length > 1 ? <Slam d={ts[0].a - 3}><div style={{ fontFamily: BN, fontWeight: 800, fontSize: v ? 100 : 110, color: "#fff", textAlign: "center", lineHeight: 1.2, padding: "0 50px" }}>বিশ্বাস হচ্ছে না<br /><span style={{ color: C.yel }}>এতকিছু একসাথে?</span></div></Slam> : <>
          <Pop d={last.a - 4}><Img src={staticFile("brand/logo-dark.png")} style={{ height: v ? 110 : 96 }} /></Pop>
          <Slam d={last.a + 6}><div style={{ padding: v ? "20px 50px" : "18px 60px", borderRadius: 30, background: C.yel, boxShadow: `0 0 ${50 + Math.sin(f / 5) * 20}px ${C.yel}`, fontFamily: BN, fontWeight: 900, fontSize: v ? 104 : 116, color: C.ink, lineHeight: 1.15, textAlign: "center" }}>প্রথম ২০% ফ্রি</div></Slam>
          <Pop d={last.a + 16}><div style={{ fontFamily: BN, fontWeight: 800, fontSize: v ? 48 : 48, color: "#fff", textAlign: "center" }}>{mix(B.cta)}</div></Pop>
          <Pop d={last.a + 24}><div style={{ padding: "16px 46px", borderRadius: 40, background: "#fff", fontFamily: EN, fontWeight: 900, fontSize: v ? 60 : 58, color: "#0050ED" }}>aiuniversitybd.com</div></Pop>
          <Pop d={last.a + 32}><div style={{ fontFamily: BN, fontWeight: 600, fontSize: v ? 30 : 28, color: C.mute, textAlign: "center" }}>{B.honest}</div></Pop>
        </>}
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

const MAP: Record<string, React.FC<SP>> = { hook: SHook, why: SWhy, reveal: SReveal, montage: SMontage, app: SApp, sensei: SSensei, cta: SCta };

export const CoursePromo: React.FC<{ spec: Spec2 }> = ({ spec }) => {
  const f = useCurrentFrame(); const { width, height } = useVideoConfig(); const v = height > width;
  const starts = spec.scenes.reduce<number[]>((a, _, i) => [...a, i ? a[i - 1] + spec.scenes[i - 1].len : 0], []); const total = p2Len(spec);
  const speech = (fr: number) => spec.scenes.some((s, i) => s.beats.some((b) => b.t && fr >= starts[i] + b.a - 3 && fr < starts[i] + b.b + 3));
  const prog = f / total;
  return (
    <BrandCtx.Provider value={spec.brand}><AbsoluteFill style={{ background: C.bg }}>
      {spec.scenes.map((s, i) => { const S = MAP[s.type] || SCta; const lf = f - starts[i];
        return <Sequence key={i} from={starts[i]} durationInFrames={s.len}>
          <AbsoluteFill style={{ transform: `scale(${interpolate(lf, [0, 8], [1.06, 1], { ...clamp, easing: ease })})`, opacity: interpolate(lf, [0, 3], [0, 1], clamp) }}><S s={s} v={v} /></AbsoluteFill>
          <Kinetic s={s} v={v} />
          {i > 0 && <><Flash at={0} /><Sequence durationInFrames={30}><Audio src={staticFile("aiu2/whoosh.mp3")} volume={0.3} /></Sequence></>}
          {s.beats.filter((b) => b.file).map((b, j) => <Sequence key={j} from={b.a}><Audio src={staticFile(`${spec.brand.dir}/${spec.id}/${b.file}`)} /></Sequence>)}
          {s.type === "why" && s.beats.filter((b) => b.t).slice(s.cardFrom ?? 1).map((b, j) => <Sequence key={"h" + j} from={Math.max(0, b.a - 3)} durationInFrames={30}><Audio src={staticFile("aiu2/hit.mp3")} volume={0.35} /></Sequence>)}
        </Sequence>; })}
      {!spec.scenes.some((s, i) => (s.type === "reveal" || s.type === "cta") && f >= starts[i] && f < starts[i] + s.len) && <Img src={staticFile("brand/logo-dark.png")} style={{ position: "absolute", left: v ? 0 : 40, right: v ? 0 : undefined, margin: v ? "0 auto" : undefined, top: v ? 150 : 30, height: v ? 60 : 46, opacity: 0.92 }} />}
      <div style={{ position: "absolute", left: 0, top: 0, height: 8, width: `${prog * 100}%`, background: C.yel }} />
      <Audio src={staticFile("aiu2/music.mp3")} volume={(fr) => (speech(fr) ? 0.07 : 0.2) * interpolate(fr, [0, 10, total - 30, total], [0, 1, 1, 0], clamp)} />
    </AbsoluteFill></BrandCtx.Provider>
  );
};
