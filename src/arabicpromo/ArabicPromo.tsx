// AI University — Gulf Arabic course promo (owner 2026-10-22): "why learn spoken Gulf Arabic" for Bangladeshi workers in Saudi/Qatar.
// One engine, two comps: ArabicPromoH (1920x1080, course page) and ArabicPromoV (1080x1920 reel for Facebook boosts; nothing important
// in the top 240 / bottom 360 px). Reuses the lesson engine's cast, worlds and word karaoke (src/arabic/ArabicEngine.tsx).
// Spec = scenes of beats like a lesson ({t} Tanvir Bangla VO, {j, who, ro, bro, bn} native Gulf Arabic, {hold}); voiced and timed by
// scripts/arabic_promo_make.py → public/arabicpromo/<id>/props.json; cloud render scripts/arabic_promo_cloud.py.
// Honest: AI teacher labelled as AI, no visa/job guarantee, price = what the site charges (৳999, regular ৳5,000), first 20% free.
import React from "react";
import { AbsoluteFill, Audio, Img, OffthreadVideo, Sequence, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig, Easing } from "remotion";
import { Store as StoreIcon, Car, Stethoscope, Wallet, Mic, Users, Crown, Bot, Award, Headphones, Check, Sparkles, Play } from "lucide-react";
import { Anime, Ar, Bro, Confetti, KanaKaraoke, Look, Studio, WORLDS, Beat, fit } from "../arabic/ArabicEngine";

const C = { ink: "#10142E", red: "#E63946", sun: "#FFC845", mint: "#3DDC97", sky: "#4CC9F0", green: "#0E7A4A", white: "#FFFFFF", mute: "#AEB5E2" };
const BN = "Anek", EN = "Montserrat";
const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const ease = Easing.bezier(0.16, 1, 0.3, 1);
const pop = (f: number, fps: number, d: number) => spring({ frame: f - d, fps, config: { damping: 12, mass: 0.6 } });
const amp = (env: string | undefined, i: number) => (env && i >= 0 && i < env.length ? (env.charCodeAt(i) - 48) / 9 : 0);

export type PScene = { type: string; world?: string; beats: Beat[]; len: number; cards?: [string, string, string][]; pairs?: [string, string][]; feats?: [string, string][]; clip?: string; [k: string]: any };
export type PSpec = { id: string; scenes: PScene[]; total: number };
export const pLen = (s: PSpec) => s.total || 300;
type SP = { s: PScene; spec: PSpec; v: boolean };
const LOOK: Record<string, Look> = { M: "rafi", S: "qatari", B: "saudi", F: "madam" };
const NAME: Record<string, string> = { M: "রাফি", S: "আবু সালেহ", B: "সুপারভাইজার", F: "মাদাম" };
const at = (s: PScene, f: number) => s.beats.find((b) => f >= b.a && f < b.b);
const talk = (s: PScene, f: number, who: string) => { const b = at(s, f); return b && b.j && b.who === who ? amp(b.amp, f - b.a) : 0; };
const tchr = (s: PScene, f: number) => { const b = at(s, f); return b && b.t ? amp(b.amp, f - b.a) : 0; };

const Pop: React.FC<{ d: number; children: React.ReactNode; style?: React.CSSProperties }> = ({ d, children, style }) => {
  const f = useCurrentFrame(); const { fps } = useVideoConfig(); const k = pop(f, fps, d);
  return <div style={{ opacity: Math.min(1, k * 1.5), transform: `scale(${0.5 + 0.5 * k})`, ...style }}>{children}</div>;
};
// big caption = the current teacher line, sound-off friendly
const Caption: React.FC<{ s: PScene; v: boolean }> = ({ s, v }) => {
  const f = useCurrentFrame(); const b = s.beats.filter((x) => x.t && f >= x.a - 4).pop(); if (!b || f > b.b + 10) return null;
  const parts = b.t!.split(/(?<=[।?!—])\s+/); const k = Math.min(parts.length - 1, Math.floor(((f - b.a) / Math.max(1, b.frames)) * parts.length));
  const o = interpolate(f, [b.a - 4, b.a + 4, b.b, b.b + 10], [0, 1, 1, 0], clamp);
  return <div style={{ position: "absolute", left: v ? 60 : 200, right: v ? 60 : 200, bottom: v ? 380 : 54, display: "flex", justifyContent: "center", opacity: o }}>
    <div style={{ padding: v ? "16px 28px" : "12px 30px", borderRadius: 20, background: "rgba(8,11,36,.86)", fontFamily: BN, fontWeight: 700, fontSize: v ? 50 : 40, color: "#fff", textAlign: "center", lineHeight: 1.3 }}>{parts[Math.max(0, k)]}</div></div>;
};
const Bubble: React.FC<{ b: Beat; v: boolean; side: "l" | "r"; max?: number }> = ({ b, v, side, max }) => {
  const W = max || (v ? 900 : 860);
  return <Pop d={b.a - 6}><div style={{ padding: v ? "20px 34px" : "22px 40px", borderRadius: 34, [side === "l" ? "borderBottomLeftRadius" : "borderBottomRightRadius"]: 6, background: "#fff", boxShadow: "0 24px 50px rgba(0,0,0,.4)", textAlign: "center", maxWidth: W } as any}>
    <KanaKaraoke b={b} text={b.j!} size={fit(b.j!, v ? 80 : 84, W - 80)} />
    <div style={{ fontFamily: EN, fontSize: v ? 32 : 30, fontWeight: 700, color: "#5B6390" }}>{b.ro}</div>
    <Bro b={b} size={v ? 38 : 34} color={C.red} />
    {b.bn && <div style={{ fontFamily: BN, fontSize: v ? 34 : 30, fontWeight: 600, color: "#4A5280" }}>{b.bn}</div>}
  </div></Pop>;
};

// hook / turn: a real moment in a Gulf world, two characters, karaoke bubbles
const SMoment: React.FC<SP> = ({ s, v }) => {
  const f = useCurrentFrame(); const W = WORLDS[s.world || "work"]; const js = s.beats.filter((b) => b.j);
  const cur = js.filter((b) => f >= b.a - 6).pop(); const partner = js.find((b) => b.who !== "M")?.who || "B";
  const lost = s.type === "hook"; const last = js[js.length - 1];
  const size = v ? 330 : 300;
  return (
    <AbsoluteFill>
      <AbsoluteFill style={{ transform: `scale(${interpolate(f, [0, s.len], [1.04, 1.12])})` }}><W /></AbsoluteFill>
      <AbsoluteFill style={{ background: "linear-gradient(transparent 40%, rgba(8,11,36,.55))" }} />
      <div style={{ position: "absolute", left: v ? 60 : 110, bottom: v ? 600 : 150, textAlign: "center" }}>
        <Anime look="rafi" size={size} a={talk(s, f, "M")} mood={lost ? (f > js[0].b ? "wow" : "calm") : f > last.b ? "happy" : "calm"} />
        <div style={{ marginTop: 8, display: "inline-block", padding: "6px 20px", borderRadius: 20, background: C.ink, fontFamily: BN, fontSize: 30, fontWeight: 800, color: "#fff" }}>{NAME.M}</div>
        {lost && f > js[0].b && <Pop d={js[0].b} style={{ position: "absolute", right: -40, top: -50 }}><div style={{ width: 110, height: 110, borderRadius: 55, background: C.red, display: "grid", placeItems: "center", fontFamily: EN, fontWeight: 900, fontSize: 80, color: "#fff" }}>?</div></Pop>}
      </div>
      <div style={{ position: "absolute", right: v ? 60 : 110, bottom: v ? 600 : 150, textAlign: "center" }}>
        <Anime look={LOOK[partner]} size={size} a={talk(s, f, partner)} mood={!lost && f > last.b ? "happy" : "calm"} />
        <div style={{ marginTop: 8, display: "inline-block", padding: "6px 20px", borderRadius: 20, background: C.ink, fontFamily: BN, fontSize: 30, fontWeight: 800, color: "#fff" }}>{NAME[partner]}</div>
      </div>
      {cur && f < cur.b + 24 && <div style={{ position: "absolute", left: 0, right: 0, top: v ? 300 : 120, display: "flex", justifyContent: "center" }}>
        {lost ? <div style={{ position: "relative" }}><Bubble b={cur} v={v} side={cur.who === "M" ? "l" : "r"} />
          {f > cur.b - 4 && <div style={{ position: "absolute", inset: 0, borderRadius: 34, background: "rgba(8,11,36,.55)", display: "grid", placeItems: "center", opacity: interpolate(f, [cur.b - 4, cur.b + 6], [0, 1], clamp) }}><span style={{ fontFamily: BN, fontWeight: 800, fontSize: v ? 56 : 52, color: "#fff" }}>…কিছুই বুঝলাম না 😟</span></div>}</div>
          : <Bubble b={cur} v={v} side={cur.who === "M" ? "l" : "r"} />}
      </div>}
      {!lost && <Confetti at={last.b} y={v ? 700 : 400} />}
    </AbsoluteFill>
  );
};

// pain: the daily walls — 4 situation cards
const ICONS: Record<string, React.FC<any>> = { store: StoreIcon, taxi: Car, clinic: Stethoscope, money: Wallet };
const SPain: React.FC<SP> = ({ s, v }) => {
  const f = useCurrentFrame(); const t = s.beats.find((b) => b.t)!; const cards = s.cards || [];
  return (
    <AbsoluteFill style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: v ? "flex-start" : "center", paddingTop: v ? 300 : 0 }}>
      <Pop d={4}><div style={{ fontFamily: BN, fontWeight: 800, fontSize: v ? 70 : 72, color: "#fff", textAlign: "center", padding: "0 40px" }}>প্রতিদিন যেখানে <span style={{ color: C.red }}>আটকে যান</span></div></Pop>
      <div style={{ marginTop: 40, display: "grid", gridTemplateColumns: v ? "1fr 1fr" : "1fr 1fr 1fr 1fr", gap: 26, padding: "0 60px" }}>
        {cards.map(([ic, bn, ar], i) => { const I = ICONS[ic] || StoreIcon; const d = t.a + t.frames * (0.08 + i * 0.18);
          return <Pop key={i} d={d}><div style={{ width: v ? 440 : 380, padding: "30px 24px", borderRadius: 30, background: "#fff", textAlign: "center", boxShadow: f >= d && f < d + 40 ? `0 0 0 8px ${C.red}, 0 30px 60px rgba(0,0,0,.5)` : "0 24px 50px rgba(0,0,0,.4)" }}>
            <div style={{ width: 110, height: 110, margin: "0 auto", borderRadius: 30, background: [C.sky, C.sun, C.mint, C.red][i % 4], display: "grid", placeItems: "center" }}><I size={64} color={C.ink} /></div>
            <div style={{ marginTop: 14, fontFamily: BN, fontWeight: 800, fontSize: 40, color: C.ink }}>{bn}</div>
            <Ar t={ar} size={40} color="#9AA0C0" />
          </div></Pop>; })}
      </div>
    </AbsoluteFill>
  );
};

// phrases you will say: the learner (রাফি) says each line, card by card
const SPhrases: React.FC<SP> = ({ s, v }) => {
  const f = useCurrentFrame(); const js = s.beats.filter((b) => b.j); const cur = js.filter((b) => f >= b.a - 8).pop();
  const t0 = s.beats.find((b) => b.t);
  return (
    <AbsoluteFill style={{ display: "flex", flexDirection: "column", alignItems: "center", paddingTop: v ? 280 : 130 }}>
      <Pop d={(t0?.a || 0) + 2}><div style={{ fontFamily: BN, fontWeight: 800, fontSize: v ? 64 : 64, color: "#fff", textAlign: "center" }}>কোর্স শেষে <span style={{ color: C.sun }}>আপনি নিজেই</span> বলবেন</div></Pop>
      <div style={{ marginTop: v ? 60 : 40, display: "flex", alignItems: "center", gap: 40, flexDirection: v ? "column" : "row" }}>
        <Anime look="rafi" size={v ? 300 : 280} a={talk(s, f, "M")} mood="happy" />
        <div style={{ display: "flex", flexDirection: "column", gap: 18, width: v ? 960 : 1180 }}>
          {js.map((b, i) => { const on = f >= b.a - 8; const now = cur === b && f < b.b + 10; if (!on) return null;
            return <Pop key={i} d={b.a - 8}><div style={{ display: "flex", alignItems: "center", gap: 24, padding: "12px 28px", borderRadius: 26, background: now ? "#fff" : "rgba(255,255,255,.88)", boxShadow: now ? `0 0 0 6px ${C.sun}, 0 0 50px ${C.sun}88` : "0 14px 30px rgba(0,0,0,.35)" }}>
              <div style={{ width: 66, height: 66, borderRadius: 33, background: now ? C.red : C.mint, display: "grid", placeItems: "center", flex: "none" }}>{now ? <Mic size={36} color="#fff" /> : <Check size={38} color={C.ink} strokeWidth={3} />}</div>
              <div style={{ flex: 1, display: "flex", flexDirection: v ? "column-reverse" : "row", alignItems: v ? "flex-end" : "center", gap: v ? 0 : 20 }}><div style={{ flex: 1, textAlign: v ? "right" : "left" }}><div style={{ fontFamily: BN, fontWeight: 800, fontSize: v ? 34 : 32, color: C.ink }}>{b.bn}</div><div style={{ fontFamily: BN, fontWeight: 700, fontSize: v ? 30 : 28, color: C.red }}>{b.bro}</div></div>
              <div style={{ textAlign: "right" }}>{now ? <KanaKaraoke b={b} text={b.j!} size={fit(b.j!, v ? 58 : 54, v ? 760 : 560)} /> : <Ar t={b.j!} size={fit(b.j!, v ? 58 : 54, v ? 760 : 560)} />}</div></div>
            </div></Pop>; })}
        </div>
      </div>
    </AbsoluteFill>
  );
};

// Bangla bridge secret: words you already know
const SBridge: React.FC<SP> = ({ s, v }) => {
  const f = useCurrentFrame(); const t = s.beats.find((b) => b.t)!; const pairs = s.pairs || [];
  return (
    <AbsoluteFill style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: v ? "flex-start" : "center", paddingTop: v ? 300 : 0 }}>
      <Pop d={4}><div style={{ display: "flex", alignItems: "center", gap: 16, padding: "12px 30px", borderRadius: 40, background: C.sun, fontFamily: BN, fontWeight: 800, fontSize: 38, color: C.ink }}><Sparkles size={38} /> বাংলা সেতু · সিক্রেট</div></Pop>
      <Pop d={10} style={{ marginTop: 24 }}><div style={{ fontFamily: BN, fontWeight: 800, fontSize: v ? 60 : 64, color: "#fff", textAlign: "center", padding: "0 40px" }}>এই আরবি শব্দগুলো <span style={{ color: C.sun }}>আপনি আগেই জানেন!</span></div></Pop>
      <div style={{ marginTop: 40, display: "grid", gridTemplateColumns: v ? "1fr 1fr" : "1fr 1fr 1fr 1fr", gap: 24 }}>
        {pairs.map(([b, a], i) => <Pop key={i} d={t.a + t.frames * (0.15 + i * 0.12)}><div style={{ width: v ? 440 : 370, padding: "22px 20px", borderRadius: 28, background: "linear-gradient(135deg, #3A2A05, #6B4A0A)", border: `4px solid ${C.sun}`, textAlign: "center" }}>
          <div style={{ fontFamily: BN, fontWeight: 800, fontSize: 50, color: "#fff" }}>{b}</div><div style={{ fontFamily: EN, fontWeight: 900, fontSize: 40, color: C.sun }}>=</div>
          <div style={{ background: "#fff", borderRadius: 18, padding: "0 10px" }}><Ar t={a} size={48} /></div></div></Pop>)}
      </div>
    </AbsoluteFill>
  );
};

// how the course teaches: feature chips (+ optional real lesson clip)
const FI: Record<string, React.FC<any>> = { voice: Headphones, mic: Mic, role: Users, boss: Crown, ai: Bot, cert: Award };
const SHow: React.FC<SP> = ({ s, v }) => {
  const f = useCurrentFrame(); const t = s.beats.find((b) => b.t)!; const feats = s.feats || [];
  return (
    <AbsoluteFill style={{ display: "flex", flexDirection: v ? "column" : "row", alignItems: "center", justifyContent: "center", gap: 50, paddingTop: v ? 120 : 0 }}>
      {s.clip && <Pop d={4}><div style={{ width: v ? 940 : 980, height: v ? 529 : 551, borderRadius: 26, overflow: "hidden", boxShadow: "0 40px 80px rgba(0,0,0,.6)", border: "6px solid #fff", position: "relative" }}>
        <OffthreadVideo src={staticFile(s.clip)} muted style={{ width: "100%", height: "100%", objectFit: "cover" }} />
        <div style={{ position: "absolute", left: 16, top: 16, padding: "6px 16px", borderRadius: 14, background: C.red, fontFamily: BN, fontWeight: 800, fontSize: 26, color: "#fff", display: "flex", alignItems: "center", gap: 8 }}><Play size={24} fill="#fff" /> আসল পাঠের দৃশ্য</div>
      </div></Pop>}
      <div style={{ display: "grid", gridTemplateColumns: v ? "1fr 1fr" : "1fr", gap: 16, width: v ? 960 : 640 }}>
        {feats.map(([ic, txt], i) => { const I = FI[ic] || Check; const d = t.a + t.frames * (0.05 + i * 0.14);
          return <Pop key={i} d={d}><div style={{ display: "flex", alignItems: "center", gap: 18, padding: "16px 22px", borderRadius: 22, background: "rgba(255,255,255,.1)", border: `2px solid ${f >= d && f < d + 30 ? C.sun : "rgba(255,255,255,.18)"}` }}>
            <div style={{ width: 64, height: 64, borderRadius: 18, background: [C.sky, C.red, C.mint, C.sun, "#8B5CF6", C.sky][i % 6], display: "grid", placeItems: "center", flex: "none" }}><I size={36} color={C.ink} /></div>
            <span style={{ fontFamily: BN, fontWeight: 700, fontSize: v ? 32 : 34, color: "#fff" }}>{txt}</span></div></Pop>; })}
      </div>
    </AbsoluteFill>
  );
};

// price: ৳5,000 struck → ৳999, first 20% free
const SPrice: React.FC<SP> = ({ s, v }) => {
  const f = useCurrentFrame(); const { fps } = useVideoConfig(); const t = s.beats.find((b) => b.t)!;
  const strike = interpolate(f, [t.a + t.frames * 0.3, t.a + t.frames * 0.4], [0, 1], { ...clamp, easing: ease }); const k = pop(f, fps, t.a + t.frames * 0.42);
  return (
    <AbsoluteFill style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: v ? "flex-start" : "center", paddingTop: v ? 380 : 0 }}>
      <Pop d={4}><div style={{ fontFamily: BN, fontWeight: 800, fontSize: v ? 54 : 56, color: C.mute }}>পুরো কোর্স · নিয়মিত দাম</div></Pop>
      <Pop d={8}><div style={{ position: "relative", fontFamily: BN, fontWeight: 800, fontSize: v ? 120 : 130, color: "#fff" }}>৳৫,০০০<div style={{ position: "absolute", left: -10, right: -10, top: "52%", height: 12, borderRadius: 6, background: C.red, transform: `scaleX(${strike}) rotate(-6deg)`, transformOrigin: "left" }} /></div></Pop>
      <div style={{ marginTop: 10, transform: `scale(${0.4 + 0.6 * k})`, opacity: Math.min(1, k * 1.5), padding: "18px 60px", borderRadius: 40, background: C.sun, boxShadow: `0 0 ${60 + Math.sin(f / 6) * 20}px ${C.sun}`, fontFamily: BN, fontWeight: 900, fontSize: v ? 150 : 170, color: C.ink, lineHeight: 1.1 }}>৳৯৯৯</div>
      <Pop d={t.a + t.frames * 0.7} style={{ marginTop: 34 }}><div style={{ display: "flex", alignItems: "center", gap: 14, padding: "14px 34px", borderRadius: 30, background: C.mint, fontFamily: BN, fontWeight: 800, fontSize: v ? 44 : 46, color: C.ink }}><Check size={44} strokeWidth={3} /> প্রথম ২০% পাঠ একদম ফ্রি</div></Pop>
      <Confetti at={Math.round(t.a + t.frames * 0.42)} y={v ? 760 : 520} />
    </AbsoluteFill>
  );
};

// CTA + honest note + teacher badge
const SCta: React.FC<SP> = ({ s, v }) => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: v ? "flex-start" : "center", paddingTop: v ? 300 : 0, gap: 26 }}>
      <Pop d={2}><Img src={staticFile("brand/logo-dark.png")} style={{ height: v ? 120 : 110 }} /></Pop>
      <Pop d={8}><div style={{ fontFamily: BN, fontWeight: 800, fontSize: v ? 66 : 70, color: "#fff", textAlign: "center", lineHeight: 1.2 }}>আরবি ভাষা — <span style={{ color: C.sun }}>গালফের কথ্য আরবি</span></div></Pop>
      <Pop d={12}><Ar t="تَكَلَّم عَرَبِي بِثِقَة" size={v ? 64 : 60} color={C.sun} /></Pop>
      <Pop d={16}><div style={{ padding: "16px 44px", borderRadius: 40, background: "#fff", fontFamily: EN, fontWeight: 900, fontSize: v ? 58 : 56, color: "#0050ED" }}>aiuniversitybd.com</div></Pop>
      <Pop d={22}><div style={{ display: "flex", alignItems: "center", gap: 16 }}><Anime look="sensei" size={v ? 140 : 120} a={tchr(s, f)} mood="happy" /><div style={{ fontFamily: BN, fontSize: v ? 30 : 28, color: C.mute, lineHeight: 1.4, maxWidth: v ? 720 : 900 }}><b style={{ color: "#fff" }}>উস্তাদ — এআই প্রশিক্ষক, এআই কণ্ঠ</b><br />ভাষা শেখার কোর্স · ভিসা বা চাকরির নিশ্চয়তা নয় · নিজস্ব কোর্স সার্টিফিকেট</div></div></Pop>
    </AbsoluteFill>
  );
};

const MAP: Record<string, React.FC<SP>> = { hook: SMoment, turn: SMoment, pain: SPain, phrases: SPhrases, bridge: SBridge, how: SHow, price: SPrice, cta: SCta };
const Wipe: React.FC = () => { const f = useCurrentFrame(); if (f > 14) return null; const x = interpolate(f, [0, 14], [-2400, 2400], { ...clamp, easing: Easing.inOut(Easing.cubic) });
  return <AbsoluteFill><div style={{ position: "absolute", top: -600, left: x, width: 900, height: 3200, background: `linear-gradient(90deg, ${C.green}, ${C.sun})`, transform: "rotate(14deg)" }} /></AbsoluteFill>; };

export const ArabicPromo: React.FC<{ spec: PSpec }> = ({ spec }) => {
  const f = useCurrentFrame(); const { width, height } = useVideoConfig(); const v = height > width;
  const starts = spec.scenes.reduce<number[]>((a, _, i) => [...a, i ? a[i - 1] + spec.scenes[i - 1].len : 0], []); const total = pLen(spec);
  const speech = (fr: number) => spec.scenes.some((s, i) => s.beats.some((b) => (b.t || b.j) && fr >= starts[i] + b.a - 4 && fr < starts[i] + b.b + 4));
  return (
    <AbsoluteFill style={{ background: "#080B24" }}>
      <Studio />
      {spec.scenes.map((s, i) => { const S = MAP[s.type] || SCta;
        return <Sequence key={i} from={starts[i]} durationInFrames={s.len}>
          <AbsoluteFill style={{ opacity: Math.min(interpolate(f - starts[i], [0, 8], [0, 1], clamp), interpolate(f - starts[i], [s.len - 8, s.len], [1, 0], clamp)) }}><S s={s} spec={spec} v={v} /><Caption s={s} v={v} /></AbsoluteFill>
          {s.beats.filter((b) => b.file).map((b, j) => <Sequence key={j} from={b.a}><Audio src={staticFile(`arabicpromo/${spec.id}/${b.file}`)} /></Sequence>)}
          {i > 0 && <><Wipe /><Sequence durationInFrames={40}><Audio src={staticFile("aiu2/whoosh.mp3")} volume={0.25} /></Sequence></>}
          {s.type === "price" && <Sequence from={Math.round((s.beats.find((b) => b.t)!.a) + s.beats.find((b) => b.t)!.frames * 0.42)} durationInFrames={60}><Audio src={staticFile("aiu2/chime.mp3")} volume={0.4} /></Sequence>}
        </Sequence>; })}
      {!v && <Img src={staticFile("brand/logo-dark.png")} style={{ position: "absolute", left: 40, top: 30, height: 46, opacity: 0.9 }} />}
      {v && spec.scenes[spec.scenes.length - 1].type === "cta" && f < total - spec.scenes[spec.scenes.length - 1].len && <Img src={staticFile("brand/logo-dark.png")} style={{ position: "absolute", left: 0, right: 0, margin: "0 auto", top: 150, height: 64, opacity: 0.95 }} />}
      <Audio src={staticFile("aiu2/music.mp3")} volume={(fr) => (speech(fr) ? 0.06 : 0.16) * interpolate(fr, [0, 20, total - 40, total], [0, 1, 1, 0], clamp)} />
    </AbsoluteFill>
  );
};
