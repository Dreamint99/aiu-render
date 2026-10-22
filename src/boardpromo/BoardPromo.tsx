// AI University promo reel (1080×1920): "inside AI University — the 14-member AI board that builds every course".
// For Facebook/Instagram boosts: sound-off friendly big captions, reel safe areas (nothing important in the top 240 / bottom 360 px).
// Honest: the board members are AI agents and are always labelled "এআই"; the lesson footage is real (Japanese lesson 01).
// Voice + timing: scripts/boardpromo_make.py → public/boardpromo/board-reel/props.json. Cloud render: scripts/boardpromo_cloud.py.
import React from "react";
import { AbsoluteFill, Audio, Img, OffthreadVideo, Sequence, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig, Easing, delayRender, continueRender, random } from "remotion";
import { Search, GraduationCap, User, ShieldCheck, Cpu, KeyRound, Languages, Briefcase, Megaphone, Gamepad2, Clapperboard, ClipboardCheck, Wallet, Crown, Gavel, Globe, Mic, FileText, Check, Sparkles, Play, Film } from "lucide-react";

export const C = { bg0: "#030617", bg1: "#0A1240", blue: "#2F6BFF", brand: "#0050ED", cyan: "#3EE6FF", gold: "#FFC845", pink: "#FF4FB4", mint: "#3DDC97", red: "#FF4D5E", white: "#FFFFFF", mute: "#9AA6E0", ink: "#081030" };
export const BN = "Anek", EN = "Montserrat", MARU = "Maru";
if (typeof document !== "undefined") {
  for (const [n, u] of [["Anek", "fonts/AnekBangla.ttf"], ["Montserrat", "fonts/Montserrat.ttf"], ["Maru", "fonts/MPLUSRounded1c-ExtraBold.ttf"]]) {
    const h = delayRender(`font ${n}`);
    const f = new FontFace(n, `url(${staticFile(u)})`, { weight: "100 900" });
    f.load().then(() => { document.fonts.add(f); continueRender(h); }).catch(() => continueRender(h));
  }
}
export const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
export const ease = Easing.bezier(0.16, 1, 0.3, 1);
export const bn = (n: number | string) => String(n).replace(/\d/g, (d) => "০১২৩৪৫৬৭৮৯"[+d]);
export const sp = (f: number, fps: number, d: number, damping = 14) => spring({ frame: f - d, fps, config: { damping, mass: 0.7 } });
export const P = (id: string) => staticFile(`boardpromo/board-reel/${id}`);

export type Scene = { id: string; vo: string; file: string; frames: number; len: number };
export type Spec = { id: string; scenes: Scene[]; total: number };
export const promoLen = (s: Spec) => s.total || 1500;
type SP = { s: Scene };

export const MEMBERS: { n: string; I: React.FC<any>; c: string }[] = [
  { n: "গবেষক", I: Search, c: C.cyan }, { n: "সেরা শিক্ষক", I: GraduationCap, c: C.gold }, { n: "নতুন ছাত্র", I: User, c: C.mint },
  { n: "মান যাচাইকারী", I: ShieldCheck, c: C.blue }, { n: "নেটিভ স্পিকার", I: Languages, c: C.pink }, { n: "সিক্রেট গবেষক", I: KeyRound, c: C.gold },
  { n: "ক্যারিয়ার কোচ", I: Briefcase, c: C.cyan }, { n: "মার্কেটিং", I: Megaphone, c: C.red }, { n: "গেম ডিজাইনার", I: Gamepad2, c: C.mint },
  { n: "ভিডিও ডিরেক্টর", I: Clapperboard, c: C.pink }, { n: "পরীক্ষা বিশেষজ্ঞ", I: ClipboardCheck, c: C.blue }, { n: "টেকি", I: Cpu, c: C.cyan },
  { n: "খরচ ম্যানেজার", I: Wallet, c: C.mint }, { n: "সভাপতি", I: Crown, c: C.gold },
];

/* ---------- primitives ---------- */
export const Badge: React.FC<{ i: number; size: number; glow?: number; label?: boolean }> = ({ i, size, glow = 0, label = true }) => {
  const m = MEMBERS[i]; const f = useCurrentFrame();
  return (
    <div style={{ width: size, display: "flex", flexDirection: "column", alignItems: "center", gap: size * 0.08 }}>
      <div style={{ width: size, height: size, borderRadius: "50%", position: "relative", display: "grid", placeItems: "center",
        background: `radial-gradient(circle at 35% 30%, ${m.c}55, #0B1450 70%)`, border: `${Math.max(3, size * 0.03)}px solid ${m.c}`,
        boxShadow: `0 0 ${20 + glow * 60}px ${m.c}${glow > 0.3 ? "CC" : "66"}, inset 0 0 ${size * 0.25}px ${m.c}44` }}>
        <m.I size={size * 0.46} color="#fff" strokeWidth={1.8} />
        <div style={{ position: "absolute", inset: -size * 0.09, borderRadius: "50%", border: `2px dashed ${m.c}88`, transform: `rotate(${f * 1.2 + i * 20}deg)` }} />
        <div style={{ position: "absolute", right: -4, bottom: -2, padding: "2px 8px", borderRadius: 10, background: C.ink, border: `1.5px solid ${m.c}`, fontFamily: EN, fontSize: Math.max(12, size * 0.11), fontWeight: 900, color: m.c }}>AI</div>
      </div>
      {label && <div style={{ fontFamily: BN, fontSize: Math.max(22, size * 0.2), fontWeight: 700, color: "#fff", whiteSpace: "nowrap", textShadow: "0 2px 10px #000" }}>{m.n}</div>}
    </div>
  );
};
export const Particles: React.FC<{ n?: number }> = ({ n = 70 }) => {
  const f = useCurrentFrame();
  return <>{Array.from({ length: n }, (_, i) => {
    const x = random(`x${i}`) * 1080, sp2 = 0.4 + random(`s${i}`) * 1.6, y = (random(`y${i}`) * 2100 - f * sp2 * 2.2) % 2100;
    const r = 2 + random(`r${i}`) * 4;
    return <div key={i} style={{ position: "absolute", left: x, top: (y + 2100) % 2100 - 100, width: r, height: r, borderRadius: "50%", background: i % 3 ? C.cyan : C.gold, opacity: 0.25 + random(`o${i}`) * 0.5, boxShadow: `0 0 ${r * 3}px ${i % 3 ? C.cyan : C.gold}` }} />;
  })}</>;
};
export const Grid: React.FC<{ speed?: number }> = ({ speed = 1 }) => {
  const f = useCurrentFrame();
  return (
    <div style={{ position: "absolute", left: -600, right: -600, bottom: -200, height: 900, transform: "perspective(700px) rotateX(64deg)", transformOrigin: "50% 100%",
      backgroundImage: `linear-gradient(${C.blue}66 2px, transparent 2px), linear-gradient(90deg, ${C.blue}66 2px, transparent 2px)`, backgroundSize: "90px 90px",
      backgroundPosition: `0 ${(f * 4 * speed) % 90}px`, maskImage: "linear-gradient(transparent, #000 40%)", WebkitMaskImage: "linear-gradient(transparent, #000 40%)" }} />
  );
};
export const Backdrop: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill style={{ background: `radial-gradient(1200px 1400px at 50% 40%, ${C.bg1}, ${C.bg0})`, overflow: "hidden" }}>
      <div style={{ position: "absolute", left: 540 - 700 + Math.sin(f / 70) * 120, top: 300, width: 1400, height: 1400, borderRadius: "50%", background: `radial-gradient(${C.brand}55, transparent 60%)` }} />
      <div style={{ position: "absolute", left: -300 + Math.cos(f / 90) * 80, top: 1200, width: 900, height: 900, borderRadius: "50%", background: `radial-gradient(${C.pink}33, transparent 60%)` }} />
      <Grid /><Particles />
    </AbsoluteFill>
  );
};
// light streak + flash between scenes
export const Transition: React.FC = () => {
  const f = useCurrentFrame(); if (f > 14) return null;
  const x = interpolate(f, [0, 14], [-1400, 1600], { ...clamp, easing: Easing.inOut(Easing.cubic) });
  return <AbsoluteFill style={{ pointerEvents: "none" }}>
    <div style={{ position: "absolute", top: -300, left: x, width: 260, height: 2600, background: `linear-gradient(90deg, transparent, ${C.cyan}, #fff, ${C.cyan}, transparent)`, transform: "rotate(18deg)", filter: "blur(6px)", opacity: 0.9 }} />
    <AbsoluteFill style={{ background: "#fff", opacity: interpolate(f, [0, 3, 9], [0.45, 0.2, 0], clamp) }} />
  </AbsoluteFill>;
};
export const Wide: React.FC<{ src: string; w: number }> = ({ src, w }) => (
  <div style={{ width: w, borderRadius: 26, overflow: "hidden", boxShadow: `0 30px 80px rgba(0,0,0,.6), 0 0 0 3px ${C.cyan}88, 0 0 50px ${C.blue}66` }}>
    <OffthreadVideo src={P(`clips/${src}.mp4`)} muted style={{ width: "100%", display: "block" }} />
  </div>
);
export const Title: React.FC<{ text: string; at: number; size?: number; color?: string; top: number }> = ({ text, at, size = 92, color = "#fff", top }) => {
  const f = useCurrentFrame(); const { fps } = useVideoConfig(); const words = text.split(" ");
  return <div style={{ position: "absolute", left: 60, right: 60, top, textAlign: "center", fontFamily: BN, fontWeight: 800, fontSize: size, lineHeight: 1.18, color, textShadow: "0 8px 30px rgba(0,0,0,.6)" }}>
    {words.map((w, i) => { const k = sp(f, fps, at + i * 3, 12); return <span key={i} style={{ display: "inline-block", marginRight: size * 0.25, opacity: Math.min(1, k * 1.5), transform: `translateY(${(1 - k) * 60}px) scale(${0.7 + 0.3 * k})` }}>{w}</span>; })}
  </div>;
};
export const Chip: React.FC<{ children: React.ReactNode; c: string; style?: React.CSSProperties }> = ({ children, c, style }) => (
  <span style={{ display: "inline-flex", alignItems: "center", gap: 10, padding: "10px 24px", borderRadius: 40, background: `${c}22`, border: `2px solid ${c}`, fontFamily: BN, fontSize: 36, fontWeight: 700, color: "#fff", ...style }}>{children}</span>
);

/* ---------- scenes ---------- */
const SHook: React.FC<SP> = ({ s }) => {
  const f = useCurrentFrame(); const { fps } = useVideoConfig(); const end = s.len;
  const dive = interpolate(f, [end - 34, end], [1, 14], { ...clamp, easing: Easing.in(Easing.cubic) });
  const glitch = f < 30 && f % 6 < 2 ? (random(`g${f}`) - 0.5) * 24 : 0;
  const k = sp(f, fps, 4, 10);
  return (
    <AbsoluteFill>
      <div style={{ position: "absolute", left: 0, right: 0, top: 360, textAlign: "center", transform: `translateX(${glitch}px)` }}>
        <div style={{ fontFamily: BN, fontSize: 104, fontWeight: 800, color: "#fff", lineHeight: 1.15, textShadow: `${-glitch / 3}px 0 ${C.pink}, ${glitch / 3}px 0 ${C.cyan}, 0 10px 40px #000`, opacity: Math.min(1, k * 1.4) }}>তোমার কোর্সটা<br /><span style={{ color: C.gold }}>আসলে কে বানায়?</span></div>
      </div>
      <div style={{ position: "absolute", left: 540, top: 1080, transform: `translate(-50%, -50%) scale(${(0.6 + 0.4 * sp(f, fps, 20)) * dive})`, opacity: interpolate(f, [end - 8, end], [1, 0], clamp) }}>
        <div style={{ width: 440, height: 440, borderRadius: "50%", display: "grid", placeItems: "center", background: `radial-gradient(${C.brand}, #061040 70%)`, boxShadow: `0 0 ${80 + Math.sin(f / 5) * 30}px ${C.cyan}, inset 0 0 80px ${C.cyan}66`, border: `4px solid ${C.cyan}` }}>
          <Img src={staticFile("brand/logo-dark.png")} style={{ width: 320 }} />
        </div>
        {[0, 1, 2].map((r) => <div key={r} style={{ position: "absolute", left: "50%", top: "50%", width: 520 + r * 120, height: 520 + r * 120, marginLeft: -(260 + r * 60), marginTop: -(260 + r * 60), borderRadius: "50%", border: `2px solid ${C.cyan}${["88", "55", "33"][r]}`, transform: `rotate(${f * (r % 2 ? -1 : 1) * 1.5}deg) scale(${1 + Math.sin(f / 10 + r) * 0.03})`, borderStyle: r === 1 ? "dashed" : "solid" }} />)}
      </div>
      <AbsoluteFill style={{ background: "#fff", opacity: interpolate(f, [end - 6, end], [0, 1], clamp) }} />
    </AbsoluteFill>
  );
};

const SBoard: React.FC<SP> = ({ s }) => {
  const f = useCurrentFrame(); const { fps } = useVideoConfig();
  const n = MEMBERS.length; const count = Math.min(14, Math.floor(interpolate(f, [8, s.frames * 0.85], [0, 14.99], clamp)));
  return (
    <AbsoluteFill>
      <AbsoluteFill style={{ background: "#fff", opacity: interpolate(f, [0, 10], [0.8, 0], clamp) }} />
      <div style={{ position: "absolute", left: 540, top: 880, width: 900, height: 360, marginLeft: -450, marginTop: -180, borderRadius: "50%", border: `4px solid ${C.cyan}`, boxShadow: `0 0 60px ${C.cyan}, inset 0 0 80px ${C.blue}88`, background: `radial-gradient(${C.brand}44, transparent 70%)` }} />
      <div style={{ position: "absolute", left: 0, right: 0, top: 780, textAlign: "center" }}>
        <div style={{ fontFamily: EN, fontSize: 170, fontWeight: 900, color: "#fff", textShadow: `0 0 40px ${C.cyan}` }}>{bn(count)}</div>
        <div style={{ fontFamily: BN, fontSize: 46, fontWeight: 800, color: C.cyan, marginTop: -20 }}>সদস্যের এআই বোর্ড</div>
      </div>
      {MEMBERS.map((_, i) => {
        const a = (i / n) * Math.PI * 2 - Math.PI / 2; const x = 540 + Math.cos(a) * 420, y = 880 + Math.sin(a) * 470;
        const at = 8 + (i * (s.frames * 0.8)) / n; const k = sp(f, fps, at, 11);
        return <div key={i} style={{ position: "absolute", left: x - 75, top: y - 80, opacity: Math.min(1, k * 1.5), transform: `scale(${0.3 + 0.7 * k})` }}><Badge i={i} size={150} glow={interpolate(f, [at, at + 8, at + 20], [0, 1, 0.2], clamp)} /></div>;
      })}
      <Title text="ভেতরে কোর্স বানায় যারা" at={4} size={70} top={260} />
    </AbsoluteFill>
  );
};

export const SOURCES = ["JLPT অফিসিয়াল গাইড", "Japan Foundation · JFT-Basic", "জাপানের SSW ভিসা তথ্য", "বাংলাদেশি শিক্ষার্থীদের সাধারণ ভুল", "নেটিভ স্পিকারদের বাস্তব কথা"];
const SResearch: React.FC<SP> = ({ s }) => {
  const f = useCurrentFrame(); const { fps } = useVideoConfig();
  return (
    <AbsoluteFill>
      <div style={{ position: "absolute", left: 540, top: 560, transform: "translate(-50%,-50%)" }}>
        <div style={{ position: "relative", width: 380, height: 380 }}>
          <Globe size={380} color={`${C.cyan}55`} strokeWidth={0.7} style={{ position: "absolute", transform: `rotate(${f * 0.8}deg)` }} />
          <div style={{ position: "absolute", left: 115, top: 110 }}><Badge i={0} size={150} glow={0.8} /></div>
        </div>
        <div style={{ position: "absolute", left: -600, right: -600, top: interpolate(f % 50, [0, 50], [0, 380]), height: 4, background: `linear-gradient(90deg, transparent, ${C.cyan}, transparent)`, opacity: 0.7 }} />
      </div>
      <div style={{ position: "absolute", left: 90, right: 90, top: 800, display: "flex", flexDirection: "column", gap: 14 }}>
        {SOURCES.map((t, i) => { const at = 10 + i * (s.frames * 0.14); const k = sp(f, fps, at, 15); const ok = f > at + 14;
          return <div key={i} style={{ display: "flex", alignItems: "center", gap: 18, padding: "14px 28px", borderRadius: 22, background: "rgba(10,20,70,.85)", border: `2px solid ${ok ? C.mint : C.cyan}66`, opacity: Math.min(1, k * 1.4), transform: `translateX(${(1 - k) * (i % 2 ? 300 : -300)}px)` }}>
            <FileText size={40} color={C.cyan} /><span style={{ flex: 1, fontFamily: BN, fontSize: 40, fontWeight: 600, color: "#fff" }}>{t}</span>
            {ok && <Check size={44} color={C.mint} strokeWidth={3.5} />}</div>; })}
      </div>
      <Title text="আসল তথ্য, আসল সূত্র" at={4} size={78} top={260} color={C.cyan} />
    </AbsoluteFill>
  );
};

const Bubble: React.FC<{ i: number; at: number; text: React.ReactNode; side: "l" | "r"; top: number }> = ({ i, at, text, side, top }) => {
  const f = useCurrentFrame(); const { fps } = useVideoConfig(); const k = sp(f, fps, at, 12); const m = MEMBERS[i];
  return <div style={{ position: "absolute", top, [side === "l" ? "left" : "right"]: 50, display: "flex", flexDirection: side === "l" ? "row" : "row-reverse", alignItems: "center", gap: 22, opacity: Math.min(1, k * 1.5), transform: `scale(${0.6 + 0.4 * k})`, transformOrigin: side === "l" ? "left center" : "right center" } as any}>
    <Badge i={i} size={160} glow={0.5} />
    <div style={{ maxWidth: 640, padding: "26px 32px", borderRadius: 30, background: "#fff", border: `5px solid ${m.c}`, fontFamily: BN, fontSize: 42, fontWeight: 700, color: C.ink, lineHeight: 1.3, boxShadow: `0 20px 50px rgba(0,0,0,.5), 0 0 40px ${m.c}66` }}>{text}</div>
  </div>;
};
const SDebate: React.FC<SP> = ({ s }) => {
  const f = useCurrentFrame(); const L = s.frames; const strike = interpolate(f, [L * 0.78, L * 0.86], [0, 1], clamp);
  return (
    <AbsoluteFill>
      <Title text="টেবিলে তর্ক" at={2} size={80} top={250} color={C.gold} />
      <Bubble i={1} at={L * 0.02} side="l" top={420} text={<>শেখার পথ: <b style={{ color: C.brand }}>শোনো → বলো → ব্যবহার করো</b></>} />
      <Bubble i={2} at={L * 0.36} side="r" top={760} text={<>এখানে আমি বুঝব না 😕<br />আরেকটু সহজ করো!</>} />
      <Bubble i={4} at={L * 0.62} side="l" top={1090} text={<><span style={{ fontFamily: MARU, position: "relative" }}>さようなら<span style={{ position: "absolute", left: 0, top: "52%", height: 6, width: `${strike * 100}%`, background: C.red, borderRadius: 3 }} /></span> বইয়ের ভাষা।<br />বাস্তবে বলে <b style={{ fontFamily: MARU, color: C.pink }}>またね！</b></>} />
    </AbsoluteFill>
  );
};

const SDecide: React.FC<SP> = ({ s }) => {
  const f = useCurrentFrame(); const { fps } = useVideoConfig(); const hit = Math.round(s.frames * 0.5);
  const g = interpolate(f, [hit - 12, hit], [-50, 10], { ...clamp, easing: Easing.in(Easing.quad) }); const st = sp(f, fps, hit, 9);
  const shake = f >= hit && f < hit + 8 ? Math.sin(f * 9) * 12 : 0;
  return (
    <AbsoluteFill style={{ transform: `translate(${shake}px, ${shake / 2}px)` }}>
      <div style={{ position: "absolute", left: 540, top: 700, transform: "translate(-50%,-50%)" }}><Badge i={13} size={260} glow={0.9} /></div>
      <div style={{ position: "absolute", left: 640, top: 520, transformOrigin: "80% 80%", transform: `rotate(${g}deg)` }}><Gavel size={190} color={C.gold} strokeWidth={1.6} /></div>
      {f >= hit && <div style={{ position: "absolute", left: 0, right: 0, top: 1060, display: "flex", justifyContent: "center" }}>
        <div style={{ padding: "20px 60px", borderRadius: 24, border: `8px solid ${C.mint}`, color: C.mint, fontFamily: BN, fontSize: 96, fontWeight: 900, transform: `scale(${2.2 - 1.2 * st}) rotate(-6deg)`, opacity: Math.min(1, st * 2), boxShadow: `0 0 60px ${C.mint}88`, background: "rgba(3,6,23,.6)" }}>সিদ্ধান্ত ✓</div></div>}
      {f >= hit + 8 && ["৩০টি লেসন", "প্রতিটায় হুক", "রোলপ্লে + মিশন", "বাংলার সাথে সিক্রেট"].map((t, i) => {
        const k = sp(f, fps, hit + 8 + i * 4, 13);
        return <div key={i} style={{ position: "absolute", left: 540 + (i - 1.5) * 230 - 110, top: 1250, width: 220, padding: "18px 10px", borderRadius: 18, background: "#fff", textAlign: "center", fontFamily: BN, fontSize: 30, fontWeight: 800, color: C.ink, transform: `translateY(${(1 - k) * 200}px) rotate(${(i - 1.5) * 5}deg)`, opacity: k }}>{t}</div>;
      })}
      <AbsoluteFill style={{ background: C.gold, opacity: interpolate(f, [hit, hit + 2, hit + 8], [0, 0.35, 0], clamp) }} />
    </AbsoluteFill>
  );
};

export const STEPS = [{ t: "স্ক্রিপ্ট", I: FileText, c: C.cyan }, { t: "নেটিভ কণ্ঠ", I: Mic, c: C.pink }, { t: "অ্যানিমেশন", I: Film, c: C.gold }, { t: "রেন্ডার", I: Play, c: C.mint }];
const SBuild: React.FC<SP> = ({ s }) => {
  const f = useCurrentFrame(); const { fps } = useVideoConfig(); const L = s.frames;
  const active = Math.min(3, Math.floor(interpolate(f, [6, L * 0.75], [0, 3.99], clamp)));
  return (
    <AbsoluteFill>
      <Title text="তারপর তৈরি হয় লেসন" at={2} size={76} top={250} />
      <div style={{ position: "absolute", left: 60, right: 60, top: 420, display: "flex", justifyContent: "space-between" }}>
        {STEPS.map((st, i) => { const on = i <= active; const k = sp(f, fps, 6 + i * (L * 0.18), 12);
          return <div key={i} style={{ width: 220, textAlign: "center", opacity: 0.35 + 0.65 * (on ? k : 0) }}>
            <div style={{ width: 140, height: 140, margin: "0 auto", borderRadius: 34, display: "grid", placeItems: "center", background: on ? `${st.c}33` : "rgba(255,255,255,.06)", border: `3px solid ${on ? st.c : "#334"}`, boxShadow: i === active ? `0 0 50px ${st.c}` : "none" }}><st.I size={70} color={on ? "#fff" : "#667"} /></div>
            <div style={{ marginTop: 12, fontFamily: BN, fontSize: 36, fontWeight: 800, color: on ? "#fff" : "#667" }}>{st.t}</div></div>; })}
      </div>
      <div style={{ position: "absolute", left: 170, right: 170, top: 488, height: 6, background: "#223", zIndex: -1 }}><div style={{ width: `${(active / 3) * 100}%`, height: "100%", background: `linear-gradient(90deg, ${C.cyan}, ${C.mint})`, boxShadow: `0 0 20px ${C.cyan}` }} /></div>
      <div style={{ position: "absolute", left: 60, right: 60, top: 680, opacity: sp(f, fps, L * 0.3, 15), transform: `scale(${0.85 + 0.15 * sp(f, fps, L * 0.3, 15)})` }}><Wide src="kana" w={960} /></div>
      <div style={{ position: "absolute", left: 0, right: 0, top: 1250, display: "flex", justifyContent: "center", gap: 6, alignItems: "center", height: 120 }}>
        {Array.from({ length: 40 }, (_, i) => <div key={i} style={{ width: 12, borderRadius: 6, height: 20 + Math.abs(Math.sin(f / 3 + i * 0.7)) * 90 * (0.4 + random(`w${i}`) * 0.6), background: i % 2 ? C.pink : C.cyan }} />)}
      </div>
    </AbsoluteFill>
  );
};

export const CHECKS = ["সিনেমাটিক হুক", "হাতে-কলমে অনুশীলন", "বাস্তব রোলপ্লে", "বস চ্যালেঞ্জ", "বাংলার সাথে সিক্রেট", "নির্ভুল উচ্চারণ ও তথ্য", "অডিও-ভিডিও সিঙ্ক"];
const SGate: React.FC<SP> = ({ s }) => {
  const f = useCurrentFrame(); const { fps } = useVideoConfig(); const L = s.frames; const pass = Math.round(L * 0.82); const k = sp(f, fps, pass, 9);
  return (
    <AbsoluteFill>
      <Title text="মান যাচাইয়ের গেট" at={2} size={80} top={250} color={C.blue} />
      <div style={{ position: "absolute", left: 120, right: 120, top: 400, display: "flex", flexDirection: "column", gap: 12 }}>
        {CHECKS.map((t, i) => { const at = 6 + i * (L * 0.1); const ok = f >= at + 6; const kk = sp(f, fps, at, 15);
          return <div key={i} style={{ display: "flex", alignItems: "center", gap: 20, padding: "18px 26px", borderRadius: 20, background: ok ? "rgba(61,220,151,.14)" : "rgba(255,255,255,.05)", border: `2px solid ${ok ? C.mint : "#334"}`, opacity: kk, transform: `translateX(${(1 - kk) * -200}px)` }}>
            <div style={{ width: 54, height: 54, borderRadius: 14, background: ok ? C.mint : "transparent", border: `3px solid ${ok ? C.mint : "#556"}`, display: "grid", placeItems: "center" }}>{ok && <Check size={38} color={C.ink} strokeWidth={4} />}</div>
            <span style={{ fontFamily: BN, fontSize: 42, fontWeight: 700, color: "#fff" }}>{t}</span></div>; })}
      </div>
      {f >= pass && <div style={{ position: "absolute", left: 0, right: 0, top: 1290, display: "flex", justifyContent: "center" }}><div style={{ padding: "16px 70px", borderRadius: 26, background: C.mint, fontFamily: EN, fontSize: 110, fontWeight: 900, color: C.ink, transform: `scale(${2 - k}) rotate(-4deg)`, opacity: Math.min(1, k * 2), boxShadow: `0 0 80px ${C.mint}` }}>PASS ✓</div></div>}
    </AbsoluteFill>
  );
};

export const WORDS = [{ t: "শোনো", c: C.cyan, clip: "street" }, { t: "বলো", c: C.pink, clip: "speak" }, { t: "খেলো", c: C.gold, clip: "quiz" }, { t: "শেখো", c: C.mint, clip: "store" }];
const SResult: React.FC<SP> = ({ s }) => {
  const f = useCurrentFrame(); const { fps } = useVideoConfig(); const L = s.len; const seg = (L - 10) / 4; const i = Math.min(3, Math.floor(f / seg)); const w = WORDS[i]; const lf = f - i * seg;
  const k = sp(lf, fps, 0, 10);
  return (
    <AbsoluteFill>
      <div style={{ position: "absolute", left: 0, right: 0, top: 250, textAlign: "center", fontFamily: BN, fontSize: 150, fontWeight: 900, color: w.c, textShadow: `0 0 50px ${w.c}`, transform: `scale(${0.5 + 0.5 * k})`, opacity: Math.min(1, k * 1.5) }}>{w.t}</div>
      <div style={{ position: "absolute", left: 60, right: 60, top: 560 }}>
        <Sequence from={Math.round(i * seg)} durationInFrames={Math.round(seg) + 2} layout="none"><Wide src={w.clip} w={960} /></Sequence>
      </div>
      <div style={{ position: "absolute", left: 0, right: 0, top: 1180, display: "flex", justifyContent: "center", gap: 18 }}>
        {WORDS.map((x, j) => <Chip key={j} c={x.c} style={{ opacity: j <= i ? 1 : 0.3, transform: j === i ? "scale(1.12)" : "none" }}>{x.t}</Chip>)}
      </div>
      <div style={{ position: "absolute", left: 0, right: 0, top: 1300, textAlign: "center", fontFamily: BN, fontSize: 34, color: C.mute }}>আসল দৃশ্য: জাপানি পাঠ ০১ · এআই ইউনিভার্সিটি</div>
    </AbsoluteFill>
  );
};

const SCta: React.FC<SP> = ({ s }) => {
  const f = useCurrentFrame(); const { fps } = useVideoConfig(); const pulse = 1 + Math.sin(f / 6) * 0.04;
  return (
    <AbsoluteFill>
      <div style={{ position: "absolute", left: 0, right: 0, top: 270, display: "flex", justifyContent: "center", transform: `scale(${sp(f, fps, 2)})` }}><Img src={staticFile("brand/logo-dark.png")} style={{ width: 520 }} /></div>
      <Title text="প্রথম ২০% একদম ফ্রি" at={8} size={104} top={560} color={C.gold} />
      <div style={{ position: "absolute", left: 60, right: 60, top: 820, display: "flex", flexWrap: "wrap", justifyContent: "center", gap: 16 }}>
        {["IELTS", "স্পোকেন ইংলিশ", "এয়ার টিকেটিং", "কম্পিউটার"].map((t, i) => <div key={i} style={{ opacity: sp(f, fps, 16 + i * 4), transform: `scale(${0.6 + 0.4 * sp(f, fps, 16 + i * 4)})` }}><Chip c={[C.cyan, C.pink, C.gold, C.mint][i]}>{t}</Chip></div>)}
      </div>
      <div style={{ position: "absolute", left: 0, right: 0, top: 1000, textAlign: "center", fontFamily: BN, fontSize: 40, fontWeight: 700, color: C.mute, opacity: sp(f, fps, 34) }}><Sparkles size={34} color={C.gold} style={{ verticalAlign: -6 }} /> শীঘ্রই: জাপানি · আরবি · কোরিয়ান</div>
      <div style={{ position: "absolute", left: 0, right: 0, top: 1130, display: "flex", justifyContent: "center", opacity: sp(f, fps, 40) }}>
        <div style={{ padding: "30px 60px", borderRadius: 60, background: `linear-gradient(90deg, ${C.brand}, ${C.cyan})`, fontFamily: EN, fontSize: 64, fontWeight: 900, color: "#fff", transform: `scale(${pulse})`, boxShadow: `0 0 ${50 + Math.sin(f / 6) * 20}px ${C.cyan}` }}>aiuniversitybd.com</div>
      </div>
      <div style={{ position: "absolute", left: 0, right: 0, top: 1300, textAlign: "center", fontFamily: BN, fontSize: 40, fontWeight: 700, color: "#fff", opacity: sp(f, fps, 50) }}>আজই শুরু করো 👆</div>
    </AbsoluteFill>
  );
};

const MAP: Record<string, React.FC<SP>> = { hook: SHook, board: SBoard, research: SResearch, debate: SDebate, decide: SDecide, build: SBuild, gate: SGate, result: SResult, cta: SCta };

// big sound-off captions, word by word with the voice
export const Caption: React.FC<{ text: string; frames: number }> = ({ text, frames }) => {
  const f = useCurrentFrame(); const words = text.split(" "); const tot = text.length; let acc = 0;
  const p = interpolate(f, [0, frames], [0, 1], clamp);
  const chunk = Math.min(words.length - 1, Math.floor(p * Math.ceil(words.length / 5)) * 5);
  return <div style={{ position: "absolute", left: 50, right: 50, bottom: 400, display: "flex", justifyContent: "center", opacity: interpolate(f, [frames, frames + 8], [1, 0], clamp) }}>
    <div style={{ padding: "16px 28px", borderRadius: 22, background: "rgba(3,6,23,.78)", fontFamily: BN, fontSize: 50, fontWeight: 800, lineHeight: 1.35, textAlign: "center" }}>
      {words.map((w, i) => { const st = acc / tot; acc += w.length + 1; if (i < chunk || i >= chunk + 5) return null;
        return <span key={i} style={{ color: p >= st ? "#fff" : "rgba(255,255,255,.35)", marginRight: 12 }}>{w}</span>; })}
    </div>
  </div>;
};

export const BoardPromo: React.FC<{ spec: Spec }> = ({ spec }) => {
  const f = useCurrentFrame(); const total = promoLen(spec);
  const starts = spec.scenes.reduce<number[]>((a, _, i) => [...a, i ? a[i - 1] + spec.scenes[i - 1].len : 10], []);
  return (
    <AbsoluteFill style={{ background: C.bg0 }}>
      <Backdrop />
      {spec.scenes.map((s, i) => { const S = MAP[s.id] || SCta; return (
        <Sequence key={i} from={starts[i]} durationInFrames={s.len}>
          <S s={s} />
          <Caption text={s.vo} frames={s.frames} />
          <Audio src={P(s.file)} />
          {i > 0 && <><Transition /><Sequence durationInFrames={40}><Audio src={staticFile("aiu2/whoosh.mp3")} volume={0.35} /></Sequence></>}
          {s.id === "decide" && <Sequence from={Math.round(s.frames * 0.5)} durationInFrames={40}><Audio src={staticFile("aiu2/hit.mp3")} volume={0.6} /></Sequence>}
          {s.id === "gate" && <Sequence from={Math.round(s.frames * 0.82)} durationInFrames={40}><Audio src={staticFile("aiu2/chime.mp3")} volume={0.5} /></Sequence>}
          {s.id === "board" && MEMBERS.map((_, j) => <Sequence key={j} from={Math.round(8 + (j * (s.frames * 0.8)) / 14)} durationInFrames={20}><Audio src={staticFile("aiu2/pop.mp3")} volume={0.18} /></Sequence>)}
        </Sequence>); })}
      <Sequence durationInFrames={90}><Audio src={staticFile("aiu2/swell.mp3")} volume={0.35} /></Sequence>
      <Audio src={P("music.mp3")} volume={(fr) => 0.16 * interpolate(fr, [0, 20, total - 50, total], [0, 1, 1, 0], clamp)} />
      <div style={{ position: "absolute", left: 40, top: 60, padding: "8px 18px", borderRadius: 14, background: "rgba(3,6,23,.6)", fontFamily: BN, fontSize: 24, color: C.mute }}>এআই বোর্ড · এআই কণ্ঠ · আসল লেসনের দৃশ্য</div>
    </AbsoluteFill>
  );
};
