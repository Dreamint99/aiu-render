// AI University — Korean (EPS) course promo (owner 2026-10-22): "why learn Korean for EPS" for Bangladeshi workers going to Korea
// (factories, farms, shipyards). Copy of src/arabicpromo/ArabicPromo.tsx with only what Korean needs changed: LTR Hangul (NotoKR),
// cast 라피 / 김 반장 / 지수, the Korean lesson engine's look (src/korean/KoreanEngine.tsx: anime cast, Factory/Mart/Street worlds,
// per-syllable karaoke) and a word-order bridge scene (저는 밥을 먹어요 = আমি ভাত খাই).
// Two comps: KoreanPromoH (1920x1080, course page) and KoreanPromoV (1080x1920 reel; nothing important in the top 240 / bottom 360 px).
// Spec = scenes of beats ({t} Tanvir Bangla VO, {j, who, ro, bn} native Korean, {hold}); voiced and timed by
// scripts/korean_promo_make.py → public/koreanpromo/<id>/props.json; cloud render scripts/korean_promo_cloud.py.
// Honest: AI teacher labelled as AI, no EPS-pass/visa/job guarantee, price ৳999 (regular ৳5,000), first 20% of lessons free.
import React from "react";
import { AbsoluteFill, Audio, Img, OffthreadVideo, Sequence, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig, Easing } from "remotion";
import { HardHat, Package, TriangleAlert, Wallet, Mic, Users, Crown, Award, Headphones, Check, Sparkles, Play } from "lucide-react";
import { Anime, KanaKaraoke, Confetti, Studio, WORLDS, mix, Beat, Look } from "../korean/KoreanEngine";

const C = { ink: "#10142E", red: "#E63946", sun: "#FFC845", mint: "#3DDC97", sky: "#4CC9F0", blue: "#2D5BD6", white: "#FFFFFF", mute: "#AEB5E2" };
const BN = "Anek", EN = "Montserrat", KO = "NotoKR";
const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const ease = Easing.bezier(0.16, 1, 0.3, 1);
const pop = (f: number, fps: number, d: number) => spring({ frame: f - d, fps, config: { damping: 12, mass: 0.6 } });
const amp = (env: string | undefined, i: number) => (env && i >= 0 && i < env.length ? (env.charCodeAt(i) - 48) / 9 : 0);
// font size so a Hangul line fits in `width` px (a syllable block ≈ 1 em, Latin/space/punctuation ≈ 0.45 em)
const fit = (text: string, max: number, width: number) => Math.max(34, Math.min(max, Math.floor(width / Math.max(1, [...text].reduce((n, c) => n + (/[가-힣]/.test(c) ? 1 : 0.45), 0)))));

export type PScene = { type: string; world?: string; beats: Beat[]; len: number; cards?: [string, string, string][]; pairs?: [string, string][]; chips?: [string, string][]; feats?: [string, string][]; clip?: string; [k: string]: any };
export type PSpec = { id: string; scenes: PScene[]; total: number };
export const pLen = (s: PSpec) => s.total || 300;
type SP = { s: PScene; spec: PSpec; v: boolean };
const LOOK: Record<string, Look> = { M: "rafi", B: "boss", F: "yui" };
const NAME: Record<string, string> = { M: "রাফি", B: "কিম বানজাং", F: "জিসু" };
const at = (s: PScene, f: number) => s.beats.find((b) => f >= b.a && f < b.b);
const talk = (s: PScene, f: number, who: string) => { const b = at(s, f); return b && b.j && b.who === who ? amp(b.amp, f - b.a) : 0; };
const tchr = (s: PScene, f: number) => { const b = at(s, f); return b && b.t ? amp(b.amp, f - b.a) : 0; };
const Ko: React.FC<{ t: string; size: number; color?: string }> = ({ t, size, color = C.ink }) => <span style={{ fontFamily: KO, fontWeight: 800, fontSize: size, color, lineHeight: 1.3, whiteSpace: "nowrap" }}>{t}</span>;

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
    <div style={{ padding: v ? "16px 28px" : "12px 30px", borderRadius: 20, background: "rgba(8,11,36,.86)", fontFamily: BN, fontWeight: 700, fontSize: v ? 50 : 40, color: "#fff", textAlign: "center", lineHeight: 1.3 }}>{mix(parts[Math.max(0, k)])}</div></div>;
};
const Bubble: React.FC<{ b: Beat; v: boolean; side: "l" | "r"; max?: number }> = ({ b, v, side, max }) => {
  const W = max || (v ? 900 : 860);
  return <Pop d={b.a - 6}><div style={{ padding: v ? "20px 34px" : "22px 40px", borderRadius: 34, [side === "l" ? "borderBottomLeftRadius" : "borderBottomRightRadius"]: 6, background: "#fff", boxShadow: "0 24px 50px rgba(0,0,0,.4)", textAlign: "center", maxWidth: W, borderTop: `8px solid ${side === "l" ? C.sky : C.red}` } as any}>
    <KanaKaraoke b={b} text={b.j!} size={fit(b.j!, v ? 80 : 84, W - 80)} />
    <div style={{ fontFamily: EN, fontSize: v ? 32 : 30, fontWeight: 700, color: side === "l" ? "#1E7FA8" : C.red }}>{b.ro}</div>
    {b.bn && <div style={{ fontFamily: BN, fontSize: v ? 34 : 30, fontWeight: 600, color: "#4A5280" }}>{b.bn}</div>}
  </div></Pop>;
};
// (reel: the top logo is hidden over the factory scenes, where the 안전제일 banner sits)
// the lesson worlds are drawn for 1920x1080; in the reel they are scaled to cover the full 1920 px height (sides cropped)
const World: React.FC<{ name?: string; v: boolean; z: number }> = ({ name, v, z }) => {
  const W = WORLDS[name || "work"] || WORLDS.work; const k = v ? 1920 / 1080 : 1;
  return <AbsoluteFill style={{ overflow: "hidden" }}><div style={{ position: "absolute", width: 1920, height: 1080, left: v ? (1080 - 1920) / 2 : 0, top: 0, transform: `scale(${k * z})`, transformOrigin: v ? "50% 0" : "50% 50%" }}><W /></div></AbsoluteFill>;
};

// hook / turn: a real factory moment, two characters, karaoke bubbles
const SMoment: React.FC<SP> = ({ s, v }) => {
  const f = useCurrentFrame(); const js = s.beats.filter((b) => b.j);
  const cur = js.filter((b) => f >= b.a - 6).pop(); const partner = js.find((b) => b.who !== "M")?.who || "B";
  const lost = s.type === "hook"; const last = js[js.length - 1];
  const size = v ? 330 : 300;
  const helmet = js.find((b) => b.who === "M" && b.j!.includes("쓸게요"));
  return (
    <AbsoluteFill>
      <World name={s.world} v={v} z={interpolate(f, [0, s.len], [1.02, 1.08])} />
      <AbsoluteFill style={{ background: "linear-gradient(transparent 40%, rgba(8,11,36,.55))" }} />
      <div style={{ position: "absolute", left: v ? 60 : 110, bottom: v ? 600 : 150, textAlign: "center" }}>
        <div style={{ position: "relative" }}>
          <Anime look="rafi" size={size} a={talk(s, f, "M")} mood={lost ? (f > js[0].b ? "wow" : "calm") : f > last.b ? "happy" : "calm"} />
          {helmet && f >= helmet.b - 6 && <div style={{ position: "absolute", left: size * 0.22, top: interpolate(f, [helmet.b - 6, helmet.b + 6], [-size * 0.55, size * 0.005], { ...clamp, easing: ease }), width: size * 0.56, height: size * 0.28, borderRadius: `${size * 0.28}px ${size * 0.28}px 12px 12px`, background: `linear-gradient(${C.sun}, #E0A800)`, boxShadow: "0 8px 0 #B88A00, 0 16px 30px rgba(0,0,0,.35)" }}><div style={{ position: "absolute", left: size * 0.25, top: 6, width: size * 0.055, height: size * 0.23, borderRadius: 8, background: "rgba(255,255,255,.45)" }} /></div>}
        </div>
        <div style={{ marginTop: 8, display: "inline-block", padding: "6px 20px", borderRadius: 20, background: C.ink, fontFamily: BN, fontSize: 30, fontWeight: 800, color: "#fff" }}>{NAME.M}</div>
        {lost && f > js[0].b && <Pop d={js[0].b} style={{ position: "absolute", right: -40, top: -50 }}><div style={{ width: 110, height: 110, borderRadius: 55, background: C.red, display: "grid", placeItems: "center", fontFamily: EN, fontWeight: 900, fontSize: 80, color: "#fff" }}>?</div></Pop>}
      </div>
      <div style={{ position: "absolute", right: v ? 60 : 110, bottom: v ? 600 : 150, textAlign: "center" }}>
        <Anime look={LOOK[partner]} size={size} a={talk(s, f, partner)} mood={!lost && f > last.b ? "happy" : "calm"} />
        <div style={{ marginTop: 8, display: "inline-block", padding: "6px 20px", borderRadius: 20, background: C.ink, fontFamily: BN, fontSize: 30, fontWeight: 800, color: "#fff" }}>{NAME[partner]}</div>
      </div>
      {cur && f < cur.b + 24 && <div style={{ position: "absolute", left: 0, right: 0, top: v ? 420 : 215, display: "flex", justifyContent: "center" }}>
        {lost ? <div style={{ position: "relative" }}><Bubble b={cur} v={v} side={cur.who === "M" ? "l" : "r"} />
          {f > cur.b - 4 && <div style={{ position: "absolute", inset: 0, borderRadius: 34, background: "rgba(8,11,36,.6)", display: "grid", placeItems: "center", opacity: interpolate(f, [cur.b - 4, cur.b + 6], [0, 1], clamp) }}><span style={{ fontFamily: BN, fontWeight: 800, fontSize: v ? 56 : 52, color: "#fff" }}>…কিছুই বুঝলাম না</span></div>}</div>
          : <Bubble b={cur} v={v} side={cur.who === "M" ? "l" : "r"} />}
      </div>}
      {!lost && <Confetti at={last.b} x={v ? 540 : 960} y={v ? 700 : 400} />}
    </AbsoluteFill>
  );
};

// pain: what you hear at work and don't understand — situation cards
const ICONS: Record<string, React.FC<any>> = { safety: HardHat, box: Package, warn: TriangleAlert, money: Wallet };
const SPain: React.FC<SP> = ({ s, v }) => {
  const f = useCurrentFrame(); const t = s.beats.find((b) => b.t)!; const cards = s.cards || [];
  return (
    <AbsoluteFill style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: v ? "flex-start" : "center", paddingTop: v ? 300 : 0 }}>
      <Pop d={4}><div style={{ fontFamily: BN, fontWeight: 800, fontSize: v ? 70 : 72, color: "#fff", textAlign: "center", padding: "0 40px" }}>কাজে যেখানে <span style={{ color: C.red }}>আটকে যান</span></div></Pop>
      <div style={{ marginTop: 40, display: "flex", flexDirection: v ? "column" : "row", gap: 26, padding: "0 60px" }}>
        {cards.map(([ic, bn, ko], i) => { const I = ICONS[ic] || HardHat; const d = t.a + t.frames * (0.06 + i * 0.22);
          return <Pop key={i} d={d}><div style={{ width: v ? 760 : 440, padding: v ? "24px 30px" : "30px 24px", borderRadius: 30, background: "#fff", display: "flex", flexDirection: v ? "row" : "column", alignItems: "center", gap: v ? 28 : 0, textAlign: v ? "left" : "center", boxShadow: f >= d && f < d + 40 ? `0 0 0 8px ${C.red}, 0 30px 60px rgba(0,0,0,.5)` : "0 24px 50px rgba(0,0,0,.4)" }}>
            <div style={{ width: 110, height: 110, flex: "none", borderRadius: 30, background: [C.sun, C.sky, C.red, C.mint][i % 4], display: "grid", placeItems: "center" }}><I size={64} color={C.ink} /></div>
            <div><div style={{ marginTop: v ? 0 : 14, fontFamily: BN, fontWeight: 800, fontSize: 40, color: C.ink }}>{bn}</div>
              <Ko t={ko} size={40} color="#9AA0C0" /></div>
          </div></Pop>; })}
      </div>
    </AbsoluteFill>
  );
};

// phrases you will say: the learner (라피) says each line, card by card
const SPhrases: React.FC<SP> = ({ s, v }) => {
  const f = useCurrentFrame(); const js = s.beats.filter((b) => b.j); const cur = js.filter((b) => f >= b.a - 8).pop();
  const t0 = s.beats.find((b) => b.t); const W = v ? 960 : 1180; const KW = W - 160;
  return (
    <AbsoluteFill style={{ display: "flex", flexDirection: "column", alignItems: "center", paddingTop: v ? 280 : 130 }}>
      <Pop d={(t0?.a || 0) + 2}><div style={{ fontFamily: BN, fontWeight: 800, fontSize: 64, color: "#fff", textAlign: "center" }}>কোর্স শেষে <span style={{ color: C.sun }}>আপনি নিজেই</span> বলবেন</div></Pop>
      <div style={{ marginTop: v ? 50 : 40, display: "flex", alignItems: "center", gap: 40, flexDirection: v ? "column" : "row" }}>
        <Anime look="rafi" size={v ? 260 : 280} a={talk(s, f, "M")} mood="happy" />
        <div style={{ display: "flex", flexDirection: "column", gap: 16, width: W }}>
          {js.map((b, i) => { const on = f >= b.a - 8; const now = cur === b && f < b.b + 10; if (!on) return null; const sz = fit(b.j!, v ? 52 : 50, KW);
            return <Pop key={i} d={b.a - 8}><div style={{ display: "flex", alignItems: "center", gap: 24, padding: "12px 28px", borderRadius: 26, background: now ? "#fff" : "rgba(255,255,255,.88)", boxShadow: now ? `0 0 0 6px ${C.sun}, 0 0 50px ${C.sun}88` : "0 14px 30px rgba(0,0,0,.35)" }}>
              <div style={{ width: 66, height: 66, borderRadius: 33, background: now ? C.red : C.mint, display: "grid", placeItems: "center", flex: "none" }}>{now ? <Mic size={36} color="#fff" /> : <Check size={38} color={C.ink} strokeWidth={3} />}</div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div>{now ? <KanaKaraoke b={b} text={b.j!} size={sz} /> : <Ko t={b.j!} size={sz} />}</div>
                <div style={{ display: "flex", flexWrap: "wrap", columnGap: 18, alignItems: "baseline" }}><span style={{ fontFamily: EN, fontWeight: 700, fontSize: v ? 26 : 24, color: C.red }}>{b.ro}</span><span style={{ fontFamily: BN, fontWeight: 700, fontSize: v ? 30 : 28, color: "#4A5280" }}>{b.bn}</span></div>
              </div>
            </div></Pop>; })}
        </div>
      </div>
    </AbsoluteFill>
  );
};

// Bangla bridge secret: same word order (SOV), particles ≈ বিভক্তি, -님 ≈ সাহেব
const PC = [C.sky, C.sun, C.mint];
const SBridge: React.FC<SP> = ({ s, v }) => {
  const f = useCurrentFrame(); const j = s.beats.find((b) => b.j)!; const t2 = s.beats.filter((b) => b.t)[1] || j; const pairs = s.pairs || []; const chips = s.chips || [];
  const cs = (() => { const st: number[] = []; let k = 0; const txt = j.cc || j.j!; for (const [ko] of pairs) { const p = txt.indexOf(ko, k); st.push(j.cs && p >= 0 ? j.cs[p] : 0); k = p + ko.length; } return st; })();
  const BW = v ? 300 : 330;
  return (
    <AbsoluteFill style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: v ? "flex-start" : "center", paddingTop: v ? 300 : 0 }}>
      <Pop d={4}><div style={{ display: "flex", alignItems: "center", gap: 16, padding: "12px 30px", borderRadius: 40, background: C.sun, fontFamily: BN, fontWeight: 800, fontSize: 38, color: C.ink }}><Sparkles size={38} /> বাংলা সেতু · সিক্রেট</div></Pop>
      <Pop d={10} style={{ marginTop: 24 }}><div style={{ fontFamily: BN, fontWeight: 800, fontSize: v ? 60 : 64, color: "#fff", textAlign: "center", padding: "0 40px" }}>কোরিয়ান বাক্য <span style={{ color: C.sun }}>বাংলার মতোই!</span></div></Pop>
      <div style={{ marginTop: 44, display: "flex", gap: v ? 18 : 30 }}>
        {pairs.map(([ko, b], i) => { const d = j.a + (cs[i] || 0) - 4; const lit = f >= d;
          return <Pop key={i} d={d}><div style={{ width: BW, textAlign: "center" }}>
            <div style={{ padding: "14px 10px", borderRadius: 24, background: "#fff", boxShadow: lit && f < d + 30 ? `0 0 0 6px ${PC[i]}, 0 0 40px ${PC[i]}` : `0 0 0 4px ${PC[i]}` }}><Ko t={ko} size={v ? 70 : 76} /></div>
            <div style={{ fontFamily: EN, fontWeight: 900, fontSize: 44, color: PC[i], lineHeight: 1.2 }}>↓</div>
            <div style={{ padding: "10px 10px", borderRadius: 24, background: PC[i], fontFamily: BN, fontWeight: 800, fontSize: v ? 58 : 62, color: C.ink }}>{b}</div>
          </div></Pop>; })}
      </div>
      <Pop d={j.a + 2} style={{ marginTop: 18 }}><div style={{ fontFamily: EN, fontWeight: 700, fontSize: 32, color: C.mute }}>{j.ro}</div></Pop>
      <div style={{ marginTop: 26, display: "flex", flexDirection: v ? "column" : "row", gap: 20, alignItems: "center" }}>
        {chips.map(([ko, b], i) => <Pop key={i} d={t2.a + t2.frames * (0.45 + i * 0.3)}><div style={{ display: "flex", alignItems: "center", gap: 16, padding: "12px 30px", borderRadius: 30, background: "linear-gradient(135deg, #3A2A05, #6B4A0A)", border: `4px solid ${C.sun}` }}>
          <Ko t={ko} size={44} color="#fff" /><span style={{ fontFamily: EN, fontWeight: 900, fontSize: 40, color: C.sun }}>=</span><span style={{ fontFamily: BN, fontWeight: 800, fontSize: 42, color: "#fff" }}>{b}</span></div></Pop>)}
      </div>
    </AbsoluteFill>
  );
};

// how the course teaches: feature chips (+ real lesson clip)
const FI: Record<string, React.FC<any>> = { voice: Headphones, mic: Mic, role: Users, boss: Crown, cert: Award };
const SHow: React.FC<SP> = ({ s, v }) => {
  const f = useCurrentFrame(); const t = s.beats.find((b) => b.t)!; const feats = s.feats || [];
  return (
    <AbsoluteFill style={{ display: "flex", flexDirection: v ? "column" : "row", alignItems: "center", justifyContent: v ? "flex-start" : "center", gap: v ? 40 : 50, paddingTop: v ? 300 : 0 }}>
      {s.clip && <Pop d={4}><div style={{ width: v ? 940 : 980, height: v ? 529 : 551, borderRadius: 26, overflow: "hidden", boxShadow: "0 40px 80px rgba(0,0,0,.6)", border: "6px solid #fff", position: "relative" }}>
        <OffthreadVideo src={staticFile(s.clip)} muted style={{ width: "100%", height: "100%", objectFit: "cover" }} />
        <div style={{ position: "absolute", left: 16, top: 16, padding: "6px 16px", borderRadius: 14, background: C.red, fontFamily: BN, fontWeight: 800, fontSize: 26, color: "#fff", display: "flex", alignItems: "center", gap: 8 }}><Play size={24} fill="#fff" /> আসল পাঠের দৃশ্য</div>
      </div></Pop>}
      <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: 16, width: v ? 940 : 640 }}>
        {feats.map(([ic, txt], i) => { const I = FI[ic] || Check; const d = t.a + t.frames * (0.05 + i * 0.16);
          return <Pop key={i} d={d}><div style={{ display: "flex", alignItems: "center", gap: 18, padding: "16px 22px", borderRadius: 22, background: "rgba(255,255,255,.1)", border: `2px solid ${f >= d && f < d + 30 ? C.sun : "rgba(255,255,255,.18)"}` }}>
            <div style={{ width: 64, height: 64, borderRadius: 18, background: [C.sky, C.red, C.mint, C.sun, "#8B5CF6"][i % 5], display: "grid", placeItems: "center", flex: "none" }}><I size={36} color={C.ink} /></div>
            <span style={{ fontFamily: BN, fontWeight: 700, fontSize: v ? 34 : 34, color: "#fff" }}>{txt}</span></div></Pop>; })}
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
      <Confetti at={Math.round(t.a + t.frames * 0.42)} x={v ? 540 : 960} y={v ? 760 : 520} />
    </AbsoluteFill>
  );
};

// CTA + honest note + teacher badge
const SCta: React.FC<SP> = ({ s, v }) => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: v ? "flex-start" : "center", paddingTop: v ? 300 : 0, gap: 26 }}>
      <Pop d={2}><Img src={staticFile("brand/logo-dark.png")} style={{ height: v ? 120 : 110 }} /></Pop>
      <Pop d={8}><div style={{ fontFamily: BN, fontWeight: 800, fontSize: v ? 66 : 70, color: "#fff", textAlign: "center", lineHeight: 1.25, padding: "0 40px" }}>কোরিয়ান ভাষা{v ? <br /> : " · "}<span style={{ color: C.sun }}>EPS-TOPIK-এর পথে</span></div></Pop>
      <Pop d={12}><div style={{ textAlign: "center" }}><Ko t="자신 있게 한국어로 말해요" size={v ? 56 : 54} color={C.sun} /><div style={{ fontFamily: EN, fontWeight: 700, fontSize: 26, color: C.mute }}>Jasin itge hangugeoro malhaeyo · আত্মবিশ্বাসের সাথে কোরিয়ান বলুন</div></div></Pop>
      <Pop d={16}><div style={{ padding: "16px 44px", borderRadius: 40, background: "#fff", fontFamily: EN, fontWeight: 900, fontSize: v ? 58 : 56, color: "#0050ED" }}>aiuniversitybd.com</div></Pop>
      <Pop d={22}><div style={{ display: "flex", alignItems: "center", gap: 16, padding: "0 40px" }}><Anime look="sensei" size={v ? 140 : 120} a={tchr(s, f)} mood="happy" /><div style={{ fontFamily: BN, fontSize: v ? 30 : 28, color: C.mute, lineHeight: 1.4, maxWidth: v ? 760 : 940 }}><b style={{ color: "#fff" }}>সনসেংনিম — এআই প্রশিক্ষক, এআই কণ্ঠ</b><br />ভাষা শেখার কোর্স · EPS পাস, ভিসা বা চাকরির নিশ্চয়তা নয়</div></div></Pop>
    </AbsoluteFill>
  );
};

const MAP: Record<string, React.FC<SP>> = { hook: SMoment, turn: SMoment, pain: SPain, phrases: SPhrases, bridge: SBridge, how: SHow, price: SPrice, cta: SCta };
const Wipe: React.FC = () => { const f = useCurrentFrame(); if (f > 14) return null; const x = interpolate(f, [0, 14], [-2400, 2400], { ...clamp, easing: Easing.inOut(Easing.cubic) });
  return <AbsoluteFill><div style={{ position: "absolute", top: -600, left: x, width: 900, height: 3200, background: `linear-gradient(90deg, ${C.red}, ${C.blue})`, transform: "rotate(14deg)" }} /></AbsoluteFill>; };

export const KoreanPromo: React.FC<{ spec: PSpec }> = ({ spec }) => {
  const f = useCurrentFrame(); const { width, height } = useVideoConfig(); const v = height > width;
  const starts = spec.scenes.reduce<number[]>((a, _, i) => [...a, i ? a[i - 1] + spec.scenes[i - 1].len : 0], []); const total = pLen(spec);
  const speech = (fr: number) => spec.scenes.some((s, i) => s.beats.some((b) => (b.t || b.j) && fr >= starts[i] + b.a - 4 && fr < starts[i] + b.b + 4));
  return (
    <AbsoluteFill style={{ background: "#080B24" }}>
      <Studio />
      {spec.scenes.map((s, i) => { const S = MAP[s.type] || SCta;
        return <Sequence key={i} from={starts[i]} durationInFrames={s.len}>
          <AbsoluteFill style={{ opacity: Math.min(interpolate(f - starts[i], [0, 8], [0, 1], clamp), interpolate(f - starts[i], [s.len - 8, s.len], [1, 0], clamp)) }}><S s={s} spec={spec} v={v} /><Caption s={s} v={v} /></AbsoluteFill>
          {s.beats.filter((b) => b.file).map((b, j) => <Sequence key={j} from={b.a}><Audio src={staticFile(`koreanpromo/${spec.id}/${b.file}`)} /></Sequence>)}
          {i > 0 && <><Wipe /><Sequence durationInFrames={40}><Audio src={staticFile("aiu2/whoosh.mp3")} volume={0.25} /></Sequence></>}
          {s.type === "price" && <Sequence from={Math.round((s.beats.find((b) => b.t)!.a) + s.beats.find((b) => b.t)!.frames * 0.42)} durationInFrames={60}><Audio src={staticFile("aiu2/chime.mp3")} volume={0.4} /></Sequence>}
        </Sequence>; })}
      {!v && <Img src={staticFile("brand/logo-dark.png")} style={{ position: "absolute", left: 40, top: 30, height: 46, opacity: 0.9 }} />}
      {v && spec.scenes[spec.scenes.length - 1].type === "cta" && f < total - spec.scenes[spec.scenes.length - 1].len && !spec.scenes.some((s, i) => s.world && f >= starts[i] && f < starts[i] + s.len) && <Img src={staticFile("brand/logo-dark.png")} style={{ position: "absolute", left: 0, right: 0, margin: "0 auto", top: 150, height: 64, opacity: 0.95 }} />}
      <Audio src={staticFile("aiu2/music.mp3")} volume={(fr) => (speech(fr) ? 0.06 : 0.16) * interpolate(fr, [0, 20, total - 40, total], [0, 1, 1, 0], clamp)} />
    </AbsoluteFill>
  );
};
