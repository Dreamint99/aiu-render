// AI University — Japanese for Work course promo (owner 2026-10-22): a Bangladeshi worker's first day in a Japanese factory.
// Copy of src/koreanpromo/KoreanPromo.tsx (itself the approved src/arabicpromo/ArabicPromo.tsx) with what Japanese needs: the Japanese
// lesson engine's look (src/japanese/JapaneseEngine.tsx: anime cast ラフィ / 田中さん / ユイ, factory world with 安全第一, kana karaoke),
// a "what you learn" topics scene, a lesson-flow scene cut from REAL lesson videos (hook → hands-on → roleplay → boss → mission),
// the এআই সহায়ক সেনসেই (real avatar) and the course cover on the CTA.
// Two comps: JapanesePromoH (1920x1080, course page) and JapanesePromoV (1080x1920 reel; nothing important in the top 240 / bottom 360 px).
// Spec = scenes of beats ({t} Tanvir Bangla VO, optional {cap} caption text; {j, who, ro, bn} native Japanese; {hold}); voiced and timed
// by scripts/japanese_promo_make.py → public/japanesepromo/<id>/props.json; cloud render scripts/japanese_promo_cloud.py.
// Honest: AI teacher labelled as AI, no visa/job guarantee, price ৳999 (regular ৳5,000), first 20% of lessons free, no stats/testimonials.
import React from "react";
import { AbsoluteFill, Audio, Img, OffthreadVideo, Sequence, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig, Easing } from "remotion";
import { Languages, Hand, HardHat, Clock, ShoppingBasket, GraduationCap, Mic, Check, Sparkles, Play, Bot, Flag, Users, Crown, Target, Zap } from "lucide-react";
import { Anime, KanaKaraoke, Confetti, Studio, WORLDS, Beat, Look } from "../japanese/JapaneseEngine";

const C = { ink: "#10142E", red: "#E63946", sun: "#FFC845", mint: "#3DDC97", sky: "#4CC9F0", sakura: "#FF8FB1", violet: "#8B5CF6", white: "#FFFFFF", mute: "#AEB5E2" };
const BN = "Anek", EN = "Montserrat", JP = "NotoJP", MARU = "Maru";
const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const ease = Easing.bezier(0.16, 1, 0.3, 1);
const pop = (f: number, fps: number, d: number) => spring({ frame: f - d, fps, config: { damping: 12, mass: 0.6 } });
const amp = (env: string | undefined, i: number) => (env && i >= 0 && i < env.length ? (env.charCodeAt(i) - 48) / 9 : 0);
const JPR = /([　-ヿ一-鿿！-｠]+)/;
const isJ = (c: string) => /[　-ヿ一-鿿！-｠]/.test(c);
// font size so a Japanese line fits in `width` px (kana/kanji ≈ 1 em, Latin/space ≈ 0.5 em)
const fit = (text: string, max: number, width: number) => Math.max(34, Math.min(max, Math.floor(width / Math.max(1, [...text].reduce((n, c) => n + (isJ(c) ? 1 : 0.5), 0)))));
// Bangla text with Japanese words inside → Japanese bits in the JP font
const mix = (t: string) => t.split(JPR).map((x, i) => (i % 2 ? <span key={i} style={{ fontFamily: JP, fontWeight: 800 }}>{x}</span> : x));

export type PScene = { type: string; world?: string; beats: Beat[]; len: number; cards?: [string, string, string][]; pairs?: [string, string][]; chips?: [string, string][]; steps?: [string, string, string][]; step?: number; [k: string]: any };
export type PSpec = { id: string; scenes: PScene[]; total: number };
export const pLen = (s: PSpec) => s.total || 300;
type SP = { s: PScene; spec: PSpec; v: boolean };
const LOOK: Record<string, Look> = { M: "rafi", B: "boss", F: "yui" };
const NAME: Record<string, string> = { M: "রাফি", B: "তানাকা-সান · সুপারভাইজার", F: "ইউই" };
const at = (s: PScene, f: number) => s.beats.find((b) => f >= b.a && f < b.b);
const talk = (s: PScene, f: number, who: string) => { const b = at(s, f); return b && b.j && b.who === who ? amp(b.amp, f - b.a) : 0; };
const Jp: React.FC<{ t: string; size: number; color?: string; font?: string }> = ({ t, size, color = C.ink, font = JP }) => <span style={{ fontFamily: font, fontWeight: 800, fontSize: size, color, lineHeight: 1.3, whiteSpace: "nowrap" }}>{t}</span>;

const Pop: React.FC<{ d: number; children: React.ReactNode; style?: React.CSSProperties }> = ({ d, children, style }) => {
  const f = useCurrentFrame(); const { fps } = useVideoConfig(); const k = pop(f, fps, d);
  return <div style={{ opacity: Math.min(1, k * 1.5), transform: `scale(${0.5 + 0.5 * k})`, ...style }}>{children}</div>;
};
// big caption = the current teacher line (or its `cap` text), sound-off friendly
const Caption: React.FC<{ s: PScene; v: boolean }> = ({ s, v }) => {
  const f = useCurrentFrame(); const b = s.beats.filter((x) => x.t && f >= x.a - 4).pop(); if (!b || f > b.b + 10) return null;
  const parts = ((b as any).cap || b.t!).split(/(?<=[।?!—])\s+/); const k = Math.min(parts.length - 1, Math.floor(((f - b.a) / Math.max(1, b.frames)) * parts.length));
  const o = interpolate(f, [b.a - 4, b.a + 4, b.b, b.b + 10], [0, 1, 1, 0], clamp);
  return <div style={{ position: "absolute", left: v ? 60 : 200, right: v ? 60 : 200, bottom: v ? 380 : 54, display: "flex", justifyContent: "center", opacity: o }}>
    <div style={{ padding: v ? "16px 28px" : "12px 30px", borderRadius: 20, background: "rgba(8,11,36,.86)", fontFamily: BN, fontWeight: 700, fontSize: v ? 50 : 40, color: "#fff", textAlign: "center", lineHeight: 1.3 }}>{mix(parts[Math.max(0, k)])}</div></div>;
};
const Bubble: React.FC<{ b: Beat; v: boolean; side: "l" | "r"; max?: number }> = ({ b, v, side, max }) => {
  const W = max || (v ? 920 : 1000);
  return <Pop d={b.a - 6}><div style={{ padding: v ? "20px 34px" : "22px 40px", borderRadius: 34, [side === "l" ? "borderBottomLeftRadius" : "borderBottomRightRadius"]: 6, background: "#fff", boxShadow: "0 24px 50px rgba(0,0,0,.4)", textAlign: "center", maxWidth: W, borderTop: `8px solid ${side === "l" ? C.mint : C.red}` } as any}>
    <KanaKaraoke b={b} text={b.j!} size={fit(b.j!, v ? 76 : 80, W - 80)} />
    <div style={{ fontFamily: EN, fontSize: v ? 32 : 30, fontWeight: 700, color: side === "l" ? "#14845A" : C.red }}>{b.ro}</div>
    {b.bn && <div style={{ fontFamily: BN, fontSize: v ? 34 : 30, fontWeight: 600, color: "#4A5280" }}>{b.bn}</div>}
  </div></Pop>;
};
// the lesson worlds are drawn for 1920x1080; in the reel they are scaled to cover the full 1920 px height (sides cropped)
const World: React.FC<{ name?: string; v: boolean; z: number }> = ({ name, v, z }) => {
  const W = WORLDS[name || "work"] || WORLDS.work; const k = v ? 1920 / 1080 : 1;
  return <AbsoluteFill style={{ overflow: "hidden" }}><div style={{ position: "absolute", width: 1920, height: 1080, left: v ? (1080 - 1920) / 2 : 0, top: 0, transform: `scale(${k * z})`, transformOrigin: v ? "50% 0" : "50% 50%" }}><W /></div></AbsoluteFill>;
};

// hook / turn: the factory moment, two characters, karaoke bubbles
const SMoment: React.FC<SP> = ({ s, v }) => {
  const f = useCurrentFrame(); const js = s.beats.filter((b) => b.j);
  const cur = js.filter((b) => f >= b.a - 6).pop(); const partner = js.find((b) => b.who !== "M")?.who || "B";
  const lost = s.type === "hook"; const last = js[js.length - 1];
  const size = v ? 330 : 300;
  const Tag: React.FC<{ t: string }> = ({ t }) => <div style={{ marginTop: 8, display: "inline-block", padding: "6px 20px", borderRadius: 20, background: C.ink, fontFamily: BN, fontSize: 30, fontWeight: 800, color: "#fff", whiteSpace: "nowrap" }}>{t}</div>;
  return (
    <AbsoluteFill>
      <World name={s.world} v={v} z={interpolate(f, [0, s.len], [1.02, 1.08])} />
      <AbsoluteFill style={{ background: "linear-gradient(transparent 40%, rgba(8,11,36,.55))" }} />
      <div style={{ position: "absolute", left: v ? 60 : 110, bottom: v ? 600 : 150, textAlign: "center" }}>
        <Anime look="rafi" size={size} a={talk(s, f, "M")} mood={lost ? (f > js[0].b ? "wow" : "calm") : f > last.b ? "happy" : "calm"} />
        <Tag t={NAME.M} />
        {lost && f > js[0].b && <Pop d={js[0].b} style={{ position: "absolute", right: -40, top: -50 }}><div style={{ width: 110, height: 110, borderRadius: 55, background: C.red, display: "grid", placeItems: "center", fontFamily: EN, fontWeight: 900, fontSize: 80, color: "#fff" }}>?</div></Pop>}
      </div>
      <div style={{ position: "absolute", right: v ? 60 : 110, bottom: v ? 600 : 150, textAlign: "center", display: "flex", flexDirection: "column", alignItems: "flex-end" }}>
        <Anime look={LOOK[partner]} size={size} a={talk(s, f, partner)} mood={!lost && f > last.b ? "happy" : "calm"} />
        <Tag t={NAME[partner]} />
      </div>
      {cur && f < cur.b + 24 && <div style={{ position: "absolute", left: 0, right: 0, top: v ? 420 : 300, display: "flex", justifyContent: "center" }}>
        {lost ? <div style={{ position: "relative" }}><Bubble b={cur} v={v} side={cur.who === "M" ? "l" : "r"} />
          {f > cur.b - 4 && <div style={{ position: "absolute", inset: 0, borderRadius: 34, background: "rgba(8,11,36,.6)", display: "grid", placeItems: "center", opacity: interpolate(f, [cur.b - 4, cur.b + 6], [0, 1], clamp) }}><span style={{ fontFamily: BN, fontWeight: 800, fontSize: v ? 56 : 52, color: "#fff" }}>…কিছুই বুঝলাম না</span></div>}</div>
          : <Bubble b={cur} v={v} side={cur.who === "M" ? "l" : "r"} />}
      </div>}
      {!lost && <Confetti at={last.b} x={v ? 540 : 960} y={v ? 700 : 400} />}
    </AbsoluteFill>
  );
};

// what the course teaches — six topic cards, each pops when the voice reaches it
const TI: Record<string, React.FC<any>> = { kana: Languages, bow: Hand, safety: HardHat, clock: Clock, shop: ShoppingBasket, exam: GraduationCap };
const STopics: React.FC<SP> = ({ s, v }) => {
  const f = useCurrentFrame(); const t = s.beats.find((b) => b.t)!; const cards = s.cards || []; const W = v ? 460 : 520;
  return (
    <AbsoluteFill style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: v ? "flex-start" : "center", paddingTop: v ? 290 : 0, paddingBottom: v ? 0 : 80 }}>
      <Pop d={4}><div style={{ fontFamily: BN, fontWeight: 800, fontSize: v ? 64 : 66, color: "#fff", textAlign: "center", padding: "0 40px" }}>এই কোর্সে <span style={{ color: C.sun }}>যা শিখবেন</span></div></Pop>
      <div style={{ marginTop: v ? 36 : 40, display: "grid", gridTemplateColumns: v ? "1fr 1fr" : "1fr 1fr 1fr", gap: v ? 22 : 26 }}>
        {cards.map(([ic, bn, jp], i) => { const I = TI[ic] || Sparkles; const d = t.a + t.frames * (0.03 + i * 0.15); const hot = f >= d && f < d + 40;
          return <Pop key={i} d={d}><div style={{ width: W, height: v ? 250 : 220, boxSizing: "border-box", padding: "22px 22px", borderRadius: 30, background: "#fff", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 8, textAlign: "center", boxShadow: hot ? `0 0 0 8px ${C.sun}, 0 30px 60px rgba(0,0,0,.5)` : "0 24px 50px rgba(0,0,0,.4)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
              <div style={{ width: 70, height: 70, flex: "none", borderRadius: 20, background: [C.sky, C.sun, C.red, C.mint, C.sakura, C.violet][i % 6], display: "grid", placeItems: "center" }}><I size={42} color={C.ink} /></div>
              <div style={{ fontFamily: BN, fontWeight: 800, fontSize: fit(bn, v ? 36 : 38, (W - 130) * 1.7) , color: C.ink, lineHeight: 1.2, textAlign: "left", maxWidth: W - 130 }}>{bn}</div>
            </div>
            <Jp t={jp} size={fit(jp, v ? 44 : 46, W - 60)} color="#7A80A8" />
          </div></Pop>; })}
      </div>
    </AbsoluteFill>
  );
};

// phrases you will say: the learner (ラフィ) says each line, card by card
const SPhrases: React.FC<SP> = ({ s, v }) => {
  const f = useCurrentFrame(); const js = s.beats.filter((b) => b.j); const cur = js.filter((b) => f >= b.a - 8).pop();
  const t0 = s.beats.find((b) => b.t); const W = v ? 960 : 1180; const KW = W - 160;
  return (
    <AbsoluteFill style={{ display: "flex", flexDirection: "column", alignItems: "center", paddingTop: v ? 280 : 130 }}>
      <Pop d={(t0?.a || 0) + 2}><div style={{ fontFamily: BN, fontWeight: 800, fontSize: 64, color: "#fff", textAlign: "center" }}>কোর্স শেষে <span style={{ color: C.sun }}>আপনি নিজেই</span> বলবেন</div></Pop>
      <div style={{ marginTop: v ? 50 : 40, display: "flex", alignItems: "center", gap: 40, flexDirection: v ? "column" : "row" }}>
        <Anime look="rafi" size={v ? 240 : 280} a={talk(s, f, "M")} mood="happy" />
        <div style={{ display: "flex", flexDirection: "column", gap: 16, width: W }}>
          {js.map((b, i) => { const on = f >= b.a - 8; const now = cur === b && f < b.b + 10; if (!on) return null; const sz = fit(b.j!, v ? 50 : 50, KW);
            return <Pop key={i} d={b.a - 8}><div style={{ display: "flex", alignItems: "center", gap: 24, padding: "12px 28px", borderRadius: 26, background: now ? "#fff" : "rgba(255,255,255,.88)", boxShadow: now ? `0 0 0 6px ${C.sun}, 0 0 50px ${C.sun}88` : "0 14px 30px rgba(0,0,0,.35)" }}>
              <div style={{ width: 66, height: 66, borderRadius: 33, background: now ? C.red : C.mint, display: "grid", placeItems: "center", flex: "none" }}>{now ? <Mic size={36} color="#fff" /> : <Check size={38} color={C.ink} strokeWidth={3} />}</div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div>{now ? <KanaKaraoke b={b} text={b.j!} size={sz} /> : <Jp t={b.j!} size={sz} font={MARU} />}</div>
                <div style={{ display: "flex", flexWrap: "wrap", columnGap: 18, alignItems: "baseline" }}><span style={{ fontFamily: EN, fontWeight: 700, fontSize: v ? 26 : 24, color: C.red }}>{b.ro}</span><span style={{ fontFamily: BN, fontWeight: 700, fontSize: v ? 30 : 28, color: "#4A5280" }}>{b.bn}</span></div>
              </div>
            </div></Pop>; })}
        </div>
      </div>
    </AbsoluteFill>
  );
};

// Bangla bridge secret: same word order (SOV), は/を ≈ বিভক্তি, さん ≈ সাহেব
const PC = [C.sky, C.sun, C.mint];
const SBridge: React.FC<SP> = ({ s, v }) => {
  const f = useCurrentFrame(); const j = s.beats.find((b) => b.j)!; const t2 = s.beats.filter((b) => b.t)[1] || j; const pairs = s.pairs || []; const chips = s.chips || [];
  const cs = (() => { const st: number[] = []; let k = 0; const txt = j.cc || j.j!; for (const [jp] of pairs) { const p = txt.indexOf(jp, k); st.push(j.cs && p >= 0 ? j.cs[p] : 0); k = Math.max(k, p + jp.length); } return st; })();
  const BW = v ? 310 : 360;
  return (
    <AbsoluteFill style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: v ? "flex-start" : "center", paddingTop: v ? 300 : 0, paddingBottom: v ? 0 : 60 }}>
      <Pop d={4}><div style={{ display: "flex", alignItems: "center", gap: 16, padding: "12px 30px", borderRadius: 40, background: C.sun, fontFamily: BN, fontWeight: 800, fontSize: 38, color: C.ink }}><Sparkles size={38} /> বাংলা সেতু · সিক্রেট</div></Pop>
      <Pop d={10} style={{ marginTop: 24 }}><div style={{ fontFamily: BN, fontWeight: 800, fontSize: v ? 60 : 64, color: "#fff", textAlign: "center", padding: "0 40px" }}>জাপানি বাক্য <span style={{ color: C.sun }}>বাংলার মতোই!</span></div></Pop>
      <div style={{ marginTop: 44, display: "flex", gap: v ? 18 : 30 }}>
        {pairs.map(([jp, b], i) => { const d = j.a + (cs[i] || 0) - 4; const lit = f >= d;
          return <Pop key={i} d={d}><div style={{ width: BW, textAlign: "center" }}>
            <div style={{ padding: "14px 10px", borderRadius: 24, background: "#fff", boxShadow: lit && f < d + 30 ? `0 0 0 6px ${PC[i]}, 0 0 40px ${PC[i]}` : `0 0 0 4px ${PC[i]}` }}><Jp t={jp} size={fit(jp, v ? 64 : 72, BW - 30)} font={MARU} /></div>
            <div style={{ fontFamily: EN, fontWeight: 900, fontSize: 44, color: PC[i], lineHeight: 1.2 }}>↓</div>
            <div style={{ padding: "10px 10px", borderRadius: 24, background: PC[i], fontFamily: BN, fontWeight: 800, fontSize: v ? 58 : 62, color: C.ink }}>{b}</div>
          </div></Pop>; })}
      </div>
      <Pop d={j.a + 2} style={{ marginTop: 18 }}><div style={{ fontFamily: EN, fontWeight: 700, fontSize: 32, color: C.mute }}>{j.ro}</div></Pop>
      <div style={{ marginTop: 26, display: "flex", flexDirection: v ? "column" : "row", gap: 20, alignItems: "center" }}>
        {chips.map(([jp, b], i) => <Pop key={i} d={t2.a + t2.frames * (0.3 + i * 0.35)}><div style={{ display: "flex", alignItems: "center", gap: 16, padding: "12px 30px", borderRadius: 30, background: "linear-gradient(135deg, #3A2A05, #6B4A0A)", border: `4px solid ${C.sun}` }}>
          <Jp t={jp} size={44} color="#fff" /><span style={{ fontFamily: EN, fontWeight: 900, fontSize: 40, color: C.sun }}>=</span><span style={{ fontFamily: BN, fontWeight: 800, fontSize: 42, color: "#fff" }}>{b}</span></div></Pop>)}
      </div>
    </AbsoluteFill>
  );
};

// how a lesson works: 5 steps, each with a short clip from a REAL lesson video
const FI: Record<string, React.FC<any>> = { hook: Zap, hands: Mic, role: Users, boss: Crown, mission: Target };
const SFlow: React.FC<SP> = ({ s, v }) => {
  const f = useCurrentFrame(); const steps = s.steps || []; const step = s.step || 120; const a0 = 8;
  const k = Math.max(0, Math.min(steps.length - 1, Math.floor((f - a0) / step)));
  const VW = v ? 900 : 1040, VH = Math.round(VW * 9 / 16);
  return (
    <AbsoluteFill style={{ display: "flex", flexDirection: v ? "column" : "row", alignItems: "center", justifyContent: v ? "flex-start" : "center", gap: v ? 24 : 50, paddingTop: v ? 270 : 0, paddingBottom: v ? 0 : 70 }}>
      <Pop d={2}><div style={{ width: VW, height: VH, borderRadius: 26, overflow: "hidden", boxShadow: "0 40px 80px rgba(0,0,0,.6)", border: "6px solid #fff", position: "relative", background: "#000" }}>
        {steps.map(([, , clip], i) => <Sequence key={i} from={a0 + i * step - (i ? 0 : a0)} durationInFrames={i === steps.length - 1 ? Math.max(1, s.len - (a0 + i * step)) : i ? step : step + a0} layout="none">
          <AbsoluteFill style={{ opacity: i ? interpolate(f - (a0 + i * step), [0, 6], [0, 1], clamp) : 1 }}><OffthreadVideo src={staticFile(clip)} muted style={{ width: "100%", height: "100%", objectFit: "cover" }} /></AbsoluteFill></Sequence>)}
        <div style={{ position: "absolute", left: 16, top: 16, padding: "6px 16px", borderRadius: 14, background: C.red, fontFamily: BN, fontWeight: 800, fontSize: 26, color: "#fff", display: "flex", alignItems: "center", gap: 8 }}><Play size={24} fill="#fff" /> আসল পাঠের দৃশ্য</div>
      </div></Pop>
      <div style={{ display: "flex", flexDirection: "column", gap: v ? 10 : 16, width: v ? 900 : 560 }}>
        <div style={{ fontFamily: BN, fontWeight: 800, fontSize: v ? 40 : 46, color: "#fff", marginBottom: 4 }}>একটি পাঠ যেভাবে চলে</div>
        {steps.map(([ic, txt], i) => { const I = FI[ic] || Check; const on = i === k; const done = i < k;
          return <div key={i} style={{ display: "flex", alignItems: "center", gap: 18, padding: v ? "8px 20px" : "14px 22px", borderRadius: 22, background: on ? "#fff" : "rgba(255,255,255,.1)", border: `2px solid ${on ? C.sun : "rgba(255,255,255,.18)"}`, transform: `scale(${on ? 1.03 : 1})`, boxShadow: on ? `0 0 40px ${C.sun}66` : "none" }}>
            <div style={{ width: v ? 50 : 58, height: v ? 50 : 58, borderRadius: 16, background: done ? C.mint : [C.sky, C.red, C.mint, C.sun, C.violet][i % 5], display: "grid", placeItems: "center", flex: "none" }}>{done ? <Check size={34} color={C.ink} strokeWidth={3} /> : <I size={32} color={C.ink} />}</div>
            <span style={{ fontFamily: EN, fontWeight: 900, fontSize: 30, color: on ? C.red : C.mute, width: 30 }}>{i + 1}</span>
            <span style={{ fontFamily: BN, fontWeight: 800, fontSize: v ? 34 : 36, color: on ? C.ink : "#fff" }}>{txt}</span></div>; })}
      </div>
    </AbsoluteFill>
  );
};

// এআই সহায়ক সেনসেই: real avatar + an example question/answer
const SSensei: React.FC<SP> = ({ s, v }) => {
  const f = useCurrentFrame(); const t = s.beats.find((b) => b.t)!; const q = s.q || ""; const ans = s.ans || "";
  const d2 = t.a + t.frames * 0.45; const typed = Math.round(interpolate(f, [d2, d2 + 40], [0, [...ans].length], clamp));
  const Bub: React.FC<{ me?: boolean; children: React.ReactNode }> = ({ me, children }) => <div style={{ alignSelf: me ? "flex-end" : "flex-start", maxWidth: v ? 820 : 760, padding: "18px 26px", borderRadius: 28, [me ? "borderBottomRightRadius" : "borderBottomLeftRadius"]: 6, background: me ? C.sky : "#fff", fontFamily: BN, fontWeight: 700, fontSize: v ? 38 : 36, color: C.ink, lineHeight: 1.35 } as any}>{children}</div>;
  return (
    <AbsoluteFill style={{ display: "flex", flexDirection: v ? "column" : "row", alignItems: "center", justifyContent: v ? "flex-start" : "center", gap: v ? 36 : 70, paddingTop: v ? 290 : 0, paddingBottom: v ? 0 : 80 }}>
      <Pop d={4}><div style={{ textAlign: "center" }}>
        <div style={{ width: v ? 300 : 380, height: v ? 300 : 380, borderRadius: "50%", overflow: "hidden", border: `8px solid ${C.sakura}`, boxShadow: `0 0 60px ${C.sakura}88`, margin: "0 auto" }}><Img src={staticFile("japanesepromo/img/sensei.jpg")} style={{ width: "100%", height: "100%", objectFit: "cover" }} /></div>
        <div style={{ marginTop: 18, display: "inline-flex", alignItems: "center", gap: 12, padding: "10px 26px", borderRadius: 30, background: C.sun, fontFamily: BN, fontWeight: 800, fontSize: 36, color: C.ink }}><Bot size={36} /> এআই সহায়ক · সেনসেই</div>
      </div></Pop>
      <div style={{ display: "flex", flexDirection: "column", gap: 20, width: v ? 900 : 780 }}>
        <div style={{ fontFamily: BN, fontWeight: 700, fontSize: 28, color: C.mute }}>উদাহরণ প্রশ্ন</div>
        <Pop d={t.a + 6} style={{ alignSelf: "flex-end" }}><Bub me>{mix(q)}</Bub></Pop>
        {f >= d2 && <Bub>{mix([...ans].slice(0, typed).join(""))}{typed < [...ans].length && <span style={{ color: C.red }}>▍</span>}</Bub>}
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

// CTA over the course cover + honest note + sensei badge
const SCta: React.FC<SP> = ({ s, v }) => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill>
      <AbsoluteFill style={{ transform: `scale(${interpolate(f, [0, s.len], [1.05, 1.12])})` }}><Img src={staticFile("japanesepromo/img/cover.jpg")} style={{ width: "100%", height: "100%", objectFit: "cover", opacity: 0.4 }} /></AbsoluteFill>
      <AbsoluteFill style={{ background: "radial-gradient(ellipse at 50% 50%, rgba(8,11,36,.55), rgba(8,11,36,.92))" }} />
      <AbsoluteFill style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: v ? "flex-start" : "center", paddingTop: v ? 300 : 0, gap: 24 }}>
        <Pop d={2}><Img src={staticFile("brand/logo-dark.png")} style={{ height: v ? 120 : 110 }} /></Pop>
        <Pop d={8}><div style={{ fontFamily: BN, fontWeight: 800, fontSize: v ? 66 : 70, color: "#fff", textAlign: "center", lineHeight: 1.25, padding: "0 40px" }}>জাপানি ভাষা — কাজের জাপানি{v ? <br /> : " · "}<span style={{ color: C.sun }}>শূন্য থেকে JLPT N5</span></div></Pop>
        <Pop d={12}><div style={{ textAlign: "center" }}><Jp t="じしんを もって にほんごを はなそう！" size={v ? 52 : 54} color={C.sun} font={MARU} /><div style={{ fontFamily: EN, fontWeight: 700, fontSize: 26, color: C.mute }}>Jishin o motte nihongo o hanasō! · আত্মবিশ্বাস নিয়ে জাপানি বলুন</div></div></Pop>
        <Pop d={16}><div style={{ padding: "16px 44px", borderRadius: 40, background: "#fff", fontFamily: EN, fontWeight: 900, fontSize: v ? 58 : 56, color: "#0050ED" }}>aiuniversitybd.com</div></Pop>
        <Pop d={22}><div style={{ display: "flex", alignItems: "center", gap: 18, padding: "0 40px" }}><Img src={staticFile("japanesepromo/img/sensei.jpg")} style={{ width: v ? 130 : 110, height: v ? 130 : 110, borderRadius: "50%", border: `4px solid ${C.sakura}`, objectFit: "cover" }} /><div style={{ fontFamily: BN, fontSize: v ? 30 : 28, color: C.mute, lineHeight: 1.4, maxWidth: v ? 760 : 940 }}><b style={{ color: "#fff" }}>সেনসেই — এআই সহায়ক, এআই কণ্ঠ</b><br />এআই প্রশিক্ষক · ভিসা বা চাকরির নিশ্চয়তা নয়</div></div></Pop>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

const MAP: Record<string, React.FC<SP>> = { hook: SMoment, turn: SMoment, topics: STopics, phrases: SPhrases, bridge: SBridge, flow: SFlow, sensei: SSensei, price: SPrice, cta: SCta };
const Wipe: React.FC = () => { const f = useCurrentFrame(); if (f > 14) return null; const x = interpolate(f, [0, 14], [-2400, 2400], { ...clamp, easing: Easing.inOut(Easing.cubic) });
  return <AbsoluteFill><div style={{ position: "absolute", top: -600, left: x, width: 900, height: 3200, background: `linear-gradient(90deg, ${C.red}, ${C.sakura})`, transform: "rotate(14deg)" }} /></AbsoluteFill>; };

export const JapanesePromo: React.FC<{ spec: PSpec }> = ({ spec }) => {
  const f = useCurrentFrame(); const { width, height } = useVideoConfig(); const v = height > width;
  const starts = spec.scenes.reduce<number[]>((a, _, i) => [...a, i ? a[i - 1] + spec.scenes[i - 1].len : 0], []); const total = pLen(spec);
  const speech = (fr: number) => spec.scenes.some((s, i) => s.beats.some((b) => (b.t || b.j) && fr >= starts[i] + b.a - 4 && fr < starts[i] + b.b + 4));
  const last = spec.scenes[spec.scenes.length - 1];
  return (
    <AbsoluteFill style={{ background: "#080B24" }}>
      <Studio />
      {spec.scenes.map((s, i) => { const S = MAP[s.type] || SCta;
        return <Sequence key={i} from={starts[i]} durationInFrames={s.len}>
          <AbsoluteFill style={{ opacity: Math.min(interpolate(f - starts[i], [0, 8], [0, 1], clamp), interpolate(f - starts[i], [s.len - 8, s.len], [1, 0], clamp)) }}><S s={s} spec={spec} v={v} /><Caption s={s} v={v} /></AbsoluteFill>
          {s.beats.filter((b) => b.file).map((b, j) => <Sequence key={j} from={b.a}><Audio src={staticFile(`japanesepromo/${spec.id}/${b.file}`)} /></Sequence>)}
          {i > 0 && <><Wipe /><Sequence durationInFrames={40}><Audio src={staticFile("aiu2/whoosh.mp3")} volume={0.25} /></Sequence></>}
          {s.type === "price" && <Sequence from={Math.round((s.beats.find((b) => b.t)!.a) + s.beats.find((b) => b.t)!.frames * 0.42)} durationInFrames={60}><Audio src={staticFile("aiu2/chime.mp3")} volume={0.4} /></Sequence>}
        </Sequence>; })}
      {!v && <Img src={staticFile("brand/logo-dark.png")} style={{ position: "absolute", left: 40, top: 30, height: 46, opacity: 0.9 }} />}
      {v && last.type === "cta" && f < total - last.len && !spec.scenes.some((s, i) => s.world && f >= starts[i] && f < starts[i] + s.len) && <Img src={staticFile("brand/logo-dark.png")} style={{ position: "absolute", left: 0, right: 0, margin: "0 auto", top: 150, height: 64, opacity: 0.95 }} />}
      <Audio src={staticFile("aiu2/music.mp3")} volume={(fr) => (speech(fr) ? 0.06 : 0.16) * interpolate(fr, [0, 20, total - 40, total], [0, 1, 1, 0], clamp)} />
    </AbsoluteFill>
  );
};
