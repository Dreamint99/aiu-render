// AI University of Bangladesh — main brand promo (v3, cinematic). One engine, two cuts:
//   AIU3-Main  1920x1080 (all 12 VO lines)   ·   AIU3-Reel  1080x1920 (lines 1,3,6,10,11,12 + big captions)
// Assets public/aiu3/main/: vo/NN.mp3 (Tanvir, OpenRouter eleven-v4), durs.json, music.mp3 (ElevenLabs music, 120 bpm grid
// from 4.0 s), sfx/, rec/*.mp4 (real screen recordings — live site + local test account, no URL bar), app/*.jpg (app build shots,
// course covers), bdmap.json (map outline from the site's home page), logo-dark.png.
import React from "react";
import { AbsoluteFill, Audio, Img, OffthreadVideo, Sequence, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig, Easing } from "remotion";
import { Smartphone, Sparkles, ShieldCheck, Play, Bot, MapPin } from "lucide-react";
import MAP from "./bdmap.json";

export const FPS = 30;
const A = (p: string) => staticFile("aiu3/main/" + p);
const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const ease = Easing.bezier(0.16, 1, 0.3, 1);
const inOut = Easing.bezier(0.65, 0, 0.35, 1);
const BN = "Anek", EN = "Montserrat";
const C = { navy: "#011835", deep: "#020B1E", blue: "#0050ED", sky: "#5B9BFF", ice: "#CFE0FF", text: "#F3F6FF", mute: "#9AABD6", gold: "#F5B942", bkash: "#E2136E", green: "#2BD99F" };
const GRAD = `linear-gradient(95deg, #8FB8FF, ${C.sky} 45%, #2F7BFF)`;
const gtext = (g = GRAD): React.CSSProperties => ({ background: g, WebkitBackgroundClip: "text", backgroundClip: "text", color: "transparent" });

if (typeof document !== "undefined") {
  for (const [n, u] of [["Anek", "fonts/AnekBangla.ttf"], ["Montserrat", "fonts/Montserrat.ttf"]]) {
    const f = new FontFace(n, `url(${staticFile(u)})`, { weight: "100 900" });
    f.load().then(() => document.fonts.add(f)).catch(() => {});
  }
}

// ---------- timing ----------
// scene = one VO line; its end is snapped up to the music's beat grid (beat 0.5 s; first hit at video 0.4 s = frame 12)
const MUSIC_START = 108; // skip the music's silent first 3.6 s
const snap = (fr: number) => 12 + Math.ceil((fr - 12) / 15) * 15;
export const VO_LINES = [
  "তোমার হাতের এই ফোনটাই এখন একটা পুরো ইউনিভার্সিটি।",
  "এআই ইউনিভার্সিটি অব বাংলাদেশ। বাংলায় শেখার নতুন ঠিকানা।",
  "কম্পিউটার শিক্ষা, একদম ফ্রি। বাংলায় IELTS, মক টেস্ট আর এআই দিয়ে রাইটিং-স্পিকিং ফিডব্যাক। জিডিএস এয়ার টিকেটিং ল্যাব। আর ইংলিশ মাস্টার।",
  "থ্রিডি সিমুলেটরে ড্রাইভিং। ভাইব কোডিং, সাপ চেনা, মাছের খাবার, পারিবারিক স্বাস্থ্য। আর ছোট্ট পকেট কোর্স।",
  "ছোটদের জন্য আছে আলাদা কিডস সেকশন।",
  "প্রতিটা কোর্সে ভিডিও পাঠ। আটকে গেলে এআই সহায়ক গুরুকে প্রশ্ন করো, বা স্ক্রিনশট দাও। উত্তর সাথে সাথে।",
  "সাথে স্পেশাল বই। পড়তে পড়তে নোট আর হাইলাইট।",
  "প্রগ্রেস রিপোর্টে দেখো, কতটা এগোলে। শেষে পাবে যাচাই করা যায় এমন সার্টিফিকেট।",
  "আর সবকিছু আছে অ্যান্ড্রয়েড অ্যাপেও।",
  "প্রতিটা কোর্সের প্রথম বিশ শতাংশ ফ্রি। আগে দেখো, তারপর সিদ্ধান্ত নাও। পেমেন্ট বিকাশে।",
  "টেকনাফ থেকে তেঁতুলিয়া। শিখবে তুমি, দেখবে দেশ। এইবার তোমার হাতে, আগামীর বাংলাদেশ।",
  "এআই ইউনিভার্সিটি বিডি ডট কম। আজই শুরু করো।",
];
// fraction of a VO line at which a phrase starts (by characters — Tanvir reads at an even pace)
const at = (i: number, phrase: string) => Math.max(0, VO_LINES[i].indexOf(phrase)) / VO_LINES[i].length;

export const OUTRO = 75;
export const plan = (durs: number[], order: number[]) => {
  let start = 0;
  return order.map((i, k) => {
    const lead = k === 0 ? 6 : 8;
    const vo = Math.round(durs[i] * FPS);
    const end = snap(start + lead + vo + 10);
    const s = { i, from: start, len: end - start, voAt: start + lead, vo };
    start = end;
    return s;
  });
};
export const outroOf = (order: number[]) => (order === REEL_ORDER ? 45 : OUTRO);
export const totalOf = (durs: number[], order: number[]) => { const p = plan(durs, order); return p[p.length - 1].from + p[p.length - 1].len + outroOf(order); };
export const MAIN_ORDER = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11];
export const REEL_ORDER = [0, 2, 5, 9, 10, 11];

// ---------- small helpers ----------
const ent = (f: number, d = 0, dur = 18) => interpolate(f, [d, d + dur], [0, 1], { ...clamp, easing: ease });
const Rise: React.FC<{ f: number; d: number; children: React.ReactNode; y?: number; style?: React.CSSProperties }> = ({ f, d, children, y = 46, style }) => {
  const p = ent(f, d, 20);
  return <div style={{ opacity: p, transform: `translateY(${(1 - p) * y}px)`, filter: `blur(${(1 - p) * 10}px)`, ...style }}>{children}</div>;
};
// one Bangla line, word by word (no letter-spacing anywhere — breaks Bangla shaping)
const Words: React.FC<{ f: number; d: number; text: string; gap?: number; style?: React.CSSProperties; grad?: boolean }> = ({ f, d, text, gap = 4, style, grad }) => (
  <div style={{ display: "flex", flexWrap: "wrap", columnGap: "0.28em", ...style }}>
    {text.split(" ").map((w, i) => {
      const p = ent(f, d + i * gap, 16);
      return <span key={i} style={{ display: "inline-block", opacity: p, transform: `translateY(${(1 - p) * 0.5}em) scale(${0.92 + 0.08 * p})`, filter: `blur(${(1 - p) * 8}px)`, ...(grad ? gtext() : {}) }}>{w}</span>;
    })}
  </div>
);
const Chip: React.FC<{ f: number; d: number; children: React.ReactNode; color?: string; size?: number; solid?: boolean }> = ({ f, d, children, color = C.sky, size = 30, solid }) => {
  const p = spring({ frame: f - d, fps: FPS, config: { damping: 14, mass: 0.6 } });
  return (
    <div style={{ display: "inline-flex", alignItems: "center", gap: 10, padding: `${size * 0.3}px ${size * 0.7}px`, borderRadius: 999, fontFamily: BN, fontWeight: 700, fontSize: size, color: solid ? "#fff" : color, background: solid ? color : `${color}1F`, border: `2px solid ${color}66`, transform: `scale(${p})`, opacity: Math.min(1, p * 1.5), whiteSpace: "nowrap" }}>{children}</div>
  );
};

// screen recording / clip
const Rec: React.FC<{ n: string; from?: number; rate?: number; pos?: string; fit?: "cover" | "contain" }> = ({ n, from = 0, rate = 1, pos = "top", fit = "cover" }) => (
  <OffthreadVideo src={A(`rec/${n}.mp4`)} muted startFrom={Math.round(from * FPS)} playbackRate={rate} style={{ width: "100%", height: "100%", objectFit: fit, objectPosition: pos }} />
);
const Shot: React.FC<{ src: string; pos?: string }> = ({ src, pos = "top" }) => <Img src={A(src)} style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: pos }} />;

// devices
const Laptop: React.FC<{ w: number; children: React.ReactNode; style?: React.CSSProperties }> = ({ w, children, style }) => {
  const h = (w * 9) / 16, b = w * 0.018;
  return (
    <div style={{ width: w + 2 * b, ...style }}>
      <div style={{ padding: b, paddingBottom: b * 1.6, background: "linear-gradient(#1A2236, #0B1020)", borderRadius: b * 1.4, boxShadow: `0 ${w * 0.05}px ${w * 0.1}px rgba(0,0,0,.55), 0 0 0 1px #ffffff1a inset` }}>
        <div style={{ width: w, height: h, borderRadius: b * 0.5, overflow: "hidden", background: "#000", position: "relative" }}>{children}</div>
      </div>
      <div style={{ height: w * 0.022, margin: `0 ${-w * 0.06}px`, background: "linear-gradient(#C9D2E6, #7D879F)", borderRadius: `0 0 ${w * 0.03}px ${w * 0.03}px`, boxShadow: "0 18px 40px rgba(0,0,0,.5)" }} />
    </div>
  );
};
const Phone: React.FC<{ w: number; children: React.ReactNode; style?: React.CSSProperties }> = ({ w, children, style }) => {
  const h = w * 2.167, b = w * 0.035;
  return (
    <div style={{ width: w, height: h, padding: b, background: "linear-gradient(140deg, #2A3348, #0A0E18)", borderRadius: w * 0.14, boxShadow: `0 ${w * 0.08}px ${w * 0.18}px rgba(0,0,0,.6), 0 0 0 2px #ffffff22 inset`, position: "relative", ...style }}>
      <div style={{ width: "100%", height: "100%", borderRadius: w * 0.11, overflow: "hidden", position: "relative", background: "#fff" }}>{children}</div>
      <div style={{ position: "absolute", top: b + w * 0.025, left: "50%", width: w * 0.28, height: w * 0.075, marginLeft: -w * 0.14, borderRadius: 99, background: "#000" }} />
    </div>
  );
};

// camera: slow push + gentle 3D drift over the whole scene
const Cam: React.FC<{ f: number; len: number; children: React.ReactNode; ry?: [number, number]; rx?: [number, number]; s?: [number, number]; x?: [number, number] }> = ({ f, len, children, ry = [0, 0], rx = [0, 0], s = [1, 1.05], x = [0, 0] }) => {
  const p = interpolate(f, [0, len], [0, 1], { ...clamp, easing: inOut });
  return (
    <AbsoluteFill style={{ perspective: 2200 }}>
      <AbsoluteFill style={{ transform: `translateX(${x[0] + (x[1] - x[0]) * p}px) scale(${s[0] + (s[1] - s[0]) * p}) rotateY(${ry[0] + (ry[1] - ry[0]) * p}deg) rotateX(${rx[0] + (rx[1] - rx[0]) * p}deg)`, transformStyle: "preserve-3d" }}>{children}</AbsoluteFill>
    </AbsoluteFill>
  );
};
// cut-in: each shot punches in from a slight zoom + blur
const Punch: React.FC<{ f: number; children: React.ReactNode }> = ({ f, children }) => {
  const p = ent(f, 0, 14);
  return <AbsoluteFill style={{ transform: `scale(${1.06 - 0.06 * p})`, filter: `blur(${(1 - p) * 14}px)`, opacity: Math.min(1, p * 2) }}>{children}</AbsoluteFill>;
};
// sub-shots inside one VO line, switching at phrase fractions
const Beats: React.FC<{ f: number; s: { voAt: number; from: number; vo: number; len: number }; cuts: number[]; render: (k: number, lf: number, ll: number) => React.ReactNode }> = ({ f, s, cuts, render }) => {
  const starts = cuts.map((c, k) => (k === 0 ? 0 : Math.round(s.voAt - s.from + c * s.vo) - 4));
  let k = 0;
  for (let j = 0; j < starts.length; j++) if (f >= starts[j]) k = j;
  const ll = (k + 1 < starts.length ? starts[k + 1] : s.len) - starts[k];
  return <Punch key={k} f={f - starts[k]}>{render(k, f - starts[k], ll)}</Punch>;
};

// background: navy, moving blue light, grain, vignette
const Bg: React.FC<{ f: number; light?: boolean }> = ({ f, light }) => (
  <AbsoluteFill style={{ background: `radial-gradient(120% 90% at 50% 0%, #06245A 0%, ${C.navy} 45%, ${C.deep} 100%)` }}>
    <AbsoluteFill style={{ background: `radial-gradient(40% 50% at ${30 + 40 * Math.sin(f / 140)}% ${55 + 15 * Math.cos(f / 110)}%, ${C.blue}55, transparent 70%)` }} />
    <AbsoluteFill style={{ background: `linear-gradient(115deg, transparent 40%, #ffffff0a 48%, transparent 56%)`, transform: `translateX(${((f * 6) % 4000) - 2000}px)` }} />
    {light ? null : <AbsoluteFill style={{ backgroundImage: "radial-gradient(#ffffff10 1px, transparent 1px)", backgroundSize: "44px 44px", opacity: 0.5 }} />}
  </AbsoluteFill>
);
const Vignette = () => <AbsoluteFill style={{ background: "radial-gradient(85% 75% at 50% 50%, transparent 55%, rgba(0,0,10,.55))", pointerEvents: "none" }} />;

const Title: React.FC<{ f: number; n?: string; t: string; sub?: string; chips?: [string, string?][]; v?: boolean; align?: "left" | "center" }> = ({ f, n, t, sub, chips, v, align = "left" }) => (
  <div style={{ display: "flex", flexDirection: "column", alignItems: align === "center" ? "center" : "flex-start", gap: v ? 18 : 22, textAlign: align }}>
    {n ? <Rise f={f} d={0}><div style={{ fontFamily: EN, fontWeight: 800, fontSize: v ? 34 : 30, color: C.sky }}>{n}</div></Rise> : null}
    <Words f={f} d={2} text={t} style={{ fontFamily: BN, fontWeight: 800, fontSize: v ? 92 : 96, lineHeight: 1.12, color: C.text, justifyContent: align === "center" ? "center" : "flex-start" }} />
    {sub ? <Rise f={f} d={12}><div style={{ fontFamily: BN, fontWeight: 500, fontSize: v ? 44 : 40, color: C.mute, lineHeight: 1.35 }}>{sub}</div></Rise> : null}
    {chips ? <div style={{ display: "flex", flexWrap: "wrap", gap: 14, marginTop: 8, justifyContent: align === "center" ? "center" : "flex-start" }}>{chips.map(([c, col], i) => <Chip key={i} f={f} d={16 + i * 6} color={col || C.sky} size={v ? 38 : 32}>{c}</Chip>)}</div> : null}
  </div>
);

// big captions for the vertical cut: the sentence being spoken, in a pill
const Caption: React.FC<{ f: number; i: number; s: { voAt: number; from: number; vo: number } }> = ({ f, i, s }) => {
  const line = VO_LINES[i];
  const parts = line.split(/(?<=[।?])\s+/);
  const t = (f - (s.voAt - s.from)) / s.vo;
  let k = -1, acc = 0;
  const starts = parts.map((p) => { const a = acc / line.length; acc += p.length + 1; return a; });
  for (let j = 0; j < parts.length; j++) if (t >= starts[j] - 0.02) k = j;
  if (k < 0 || t > 1.08) return null;
  const local = f - (s.voAt - s.from) - starts[k] * s.vo;
  const p = ent(local, 0, 10);
  return (
    <div style={{ position: "absolute", left: 60, right: 60, top: 1560, display: "flex", justifyContent: "center" }}>
      <div style={{ fontFamily: BN, fontWeight: 800, fontSize: 64, lineHeight: 1.3, color: "#fff", textAlign: "center", background: "rgba(2,11,30,.82)", border: "2px solid #ffffff1f", borderRadius: 26, padding: "16px 34px", opacity: p, transform: `translateY(${(1 - p) * 20}px)`, boxShadow: "0 20px 50px rgba(0,0,0,.4)" }}>{parts[k].replace(/।$/, "")}</div>
    </div>
  );
};

type S = ReturnType<typeof plan>[number];

// ======================= scenes =======================
function scene(s: S, f: number, v: boolean): React.ReactNode {
  const W = v ? 1080 : 1920, H = v ? 1920 : 1080;
  const len = s.len;
  switch (s.i) {
    case 0: { // HOOK — extreme close-up on the phone pulls out, words slam in
      const z = interpolate(f, [0, 34], [2.6, 1], { ...clamp, easing: ease });
      const flash = interpolate(f, [10, 13, 26], [0, 0.9, 0], clamp);
      const pw = v ? 560 : 430;
      return (
        <AbsoluteFill>
          <Bg f={f} />
          <Cam f={f} len={len} s={[1, 1.04]} ry={v ? [0, 0] : [-14, -6]}>
            <div style={{ position: "absolute", left: v ? (W - pw) / 2 : 1250, top: v ? 560 : 120, transform: `scale(${z})`, transformOrigin: "50% 35%" }}>
              <Phone w={pw}><Shot src="app/03-home-guest.jpg" /></Phone>
            </div>
          </Cam>
          <div style={{ position: "absolute", left: v ? 70 : 140, right: v ? 70 : 860, top: v ? 170 : 330 }}>
            <Words f={f} d={14} gap={3} text="তোমার হাতের এই ফোনটাই" style={{ fontFamily: BN, fontWeight: 600, fontSize: v ? 62 : 58, color: C.ice, justifyContent: v ? "center" : "flex-start" }} />
            <Words f={f} d={Math.round(0.45 * s.vo) + 6} gap={4} text="একটা পুরো" style={{ fontFamily: BN, fontWeight: 800, fontSize: v ? 112 : 124, color: "#fff", lineHeight: 1.15, marginTop: 14, justifyContent: v ? "center" : "flex-start" }} />
            <Words f={f} d={Math.round(0.62 * s.vo) + 6} text="ইউনিভার্সিটি" grad style={{ fontFamily: BN, fontWeight: 800, fontSize: v ? 128 : 150, lineHeight: 1.15, justifyContent: v ? "center" : "flex-start" }} />
          </div>
          <AbsoluteFill style={{ background: "#fff", opacity: flash }} />
        </AbsoluteFill>
      );
    }
    case 1: { // BRAND — logo reveal with light sweep, then the laptop rises with the live home page
      const up = ent(f, Math.round(len * 0.42), 30);
      const sweep = interpolate(f, [8, 40], [-30, 130], clamp);
      return (
        <AbsoluteFill>
          <Bg f={f} />
          <div style={{ position: "absolute", left: 0, right: 0, top: interpolate(up, [0, 1], [300, 70]), display: "flex", flexDirection: "column", alignItems: "center", transform: `scale(${interpolate(up, [0, 1], [1, 0.62])})` }}>
            <div style={{ position: "relative", opacity: ent(f, 2, 22), filter: `blur(${(1 - ent(f, 2, 22)) * 16}px)`, transform: `scale(${0.9 + 0.1 * ent(f, 2, 30)})` }}>
              <Img src={A("logo-dark.png")} style={{ width: 620 }} />
              <div style={{ position: "absolute", inset: 0, background: `linear-gradient(100deg, transparent ${sweep - 12}%, #ffffffaa ${sweep}%, transparent ${sweep + 12}%)`, mixBlendMode: "overlay", WebkitMaskImage: `url(${A("logo-dark.png")})`, WebkitMaskSize: "100% 100%" }} />
            </div>
            <Rise f={f} d={26}><div style={{ fontFamily: BN, fontWeight: 600, fontSize: 52, color: C.ice, marginTop: 24 }}>বাংলায় শেখার নতুন ঠিকানা</div></Rise>
          </div>
          <div style={{ position: "absolute", left: "50%", top: interpolate(up, [0, 1], [1250, 420]), transform: "translateX(-50%) perspective(2000px) rotateX(12deg)" }}>
            <Laptop w={1180}><Rec n="home" from={0.5} /></Laptop>
          </div>
          <Vignette />
        </AbsoluteFill>
      );
    }
    case 2: { // COURSES A — four sharp cuts on the music
      const cuts = [0, at(2, "বাংলায় IELTS"), at(2, "জিডিএস"), at(2, "আর ইংলিশ")];
      const items: { n: string; t: string; sub: string; chips: [string, string?][]; dev: React.ReactNode }[] = [
        { n: "০১", t: "কম্পিউটার শিক্ষা", sub: "শুরু থেকে, একদম হাতে-কলমে", chips: [["সম্পূর্ণ ফ্রি", C.green]], dev: <Rec n="cfe-inside-parts" from={4} pos="center" /> },
        { n: "০২", t: "বাংলায় IELTS", sub: "Academic + General Training", chips: [["মক টেস্ট"], ["এআই Writing ফিডব্যাক"], ["এআই Speaking ফিডব্যাক"]], dev: <Rec n="course-ielts" from={0.3} /> },
        { n: "০৩", t: "GDS এয়ার টিকেটিং", sub: "টিকেট বানানো শিখুন প্র্যাকটিস ল্যাবে", chips: [["টিকেটিং ল্যাব", C.gold]], dev: <Rec n="sim-first-steps" from={8} pos="center" /> },
        { n: "০৪", t: "ইংলিশ মাস্টার", sub: "বলতে শেখা, প্রতিদিনের ইংরেজি", chips: [["স্পোকেন ইংলিশ"]], dev: <Rec n="introduce-yourself" from={2} pos="center" /> },
      ];
      return (
        <AbsoluteFill>
          <Bg f={f} />
          <Beats f={f} s={s} cuts={cuts} render={(k, lf, ll) => {
            const it = items[k], right = k % 2 === 0;
            if (v) return (
              <AbsoluteFill>
                <div style={{ position: "absolute", left: 70, right: 70, top: 150 }}><Title f={lf} n={it.n} t={it.t} chips={it.chips} v align="center" /></div>
                <Cam f={lf} len={ll} s={[1, 1.06]}>
                  <div style={{ position: "absolute", left: 40, top: 720, transform: "perspective(1800px) rotateX(8deg)" }}><Laptop w={960}>{it.dev}</Laptop></div>
                </Cam>
              </AbsoluteFill>
            );
            return (
              <AbsoluteFill>
                <Cam f={lf} len={ll} ry={right ? [-16, -9] : [16, 9]} s={[0.98, 1.04]} x={right ? [30, 0] : [-30, 0]}>
                  <div style={{ position: "absolute", top: 190, left: right ? 820 : 70 }}><Laptop w={1040}>{it.dev}</Laptop></div>
                </Cam>
                <div style={{ position: "absolute", top: 300, left: right ? 120 : 1200, width: 640 }}><Title f={lf} n={it.n} t={it.t} sub={it.sub} chips={it.chips} /></div>
                {k === 1 ? <div style={{ position: "absolute", left: 880, top: 500, transform: `translateY(${(1 - ent(lf, 8, 24)) * 500}px) rotate(4deg)` }}><Phone w={250}><Rec n="m-learn-ielts" from={2} /></Phone></div> : null}
              </AbsoluteFill>
            );
          }} />
          <Vignette />
        </AbsoluteFill>
      );
    }
    case 3: { // COURSES B — sim full-bleed, then a wall of covers, then pocket
      const cuts = [0, at(3, "ভাইব"), at(3, "আর ছোট্ট")];
      const covers: [string, string][] = [["vibe-coding", "ভাইব কোডিং"], ["snake-rescue", "সাপ চেনা"], ["fish-feed", "মাছের খাবার"], ["family-health", "পারিবারিক স্বাস্থ্য"]];
      return (
        <AbsoluteFill>
          <Bg f={f} />
          <Beats f={f} s={s} cuts={cuts} render={(k, lf, ll) => {
            if (k === 0) return (
              <AbsoluteFill>
                <AbsoluteFill style={{ transform: `scale(${interpolate(lf, [0, ll], [1.12, 1.02])})` }}><Rec n="busy-day" from={6} pos="center" /></AbsoluteFill>
                <AbsoluteFill style={{ background: "linear-gradient(0deg, rgba(1,24,53,.92) 0%, rgba(1,24,53,.2) 45%, transparent 70%)" }} />
                <div style={{ position: "absolute", left: v ? 70 : 120, right: 70, bottom: v ? 520 : 110 }}><Title f={lf} n="০৫" t="৩ডি সিমুলেটরে ড্রাইভিং" chips={[["নিজে চালিয়ে প্র্যাকটিস", C.gold]]} v={v} /></div>
              </AbsoluteFill>
            );
            if (k === 1) {
              const cw = v ? 470 : 400;
              return (
                <AbsoluteFill style={{ justifyContent: "center", alignItems: "center" }}>
                  <div style={{ display: "grid", gridTemplateColumns: v ? "1fr 1fr" : "repeat(4, 1fr)", gap: v ? 30 : 34 }}>
                    {covers.map(([c, t], j) => {
                      const p = spring({ frame: lf - j * Math.round(ll / 5.5), fps: FPS, config: { damping: 15, mass: 0.7 } });
                      return (
                        <div key={c} style={{ width: cw, borderRadius: 26, overflow: "hidden", background: "#0B1A3A", boxShadow: "0 30px 60px rgba(0,0,0,.45)", border: "1px solid #ffffff1c", opacity: Math.min(1, p * 1.4), transform: `translateY(${(1 - p) * 120}px) rotateX(${(1 - p) * 30}deg) scale(${0.9 + 0.1 * p})` }}>
                          <div style={{ height: cw * 0.62 }}><Shot src={`app/cover-${c}.jpg`} pos="center" /></div>
                          <div style={{ padding: "20px 24px", fontFamily: BN, fontWeight: 800, fontSize: v ? 44 : 40, color: "#fff" }}>{t}</div>
                        </div>
                      );
                    })}
                  </div>
                </AbsoluteFill>
              );
            }
            return (
              <AbsoluteFill>
                <Cam f={lf} len={ll} s={[1, 1.05]}>
                  <div style={{ position: "absolute", left: v ? 40 : 640, top: v ? 760 : 200 }}><Laptop w={v ? 960 : 1120}><Rec n="pocket" from={0.4} /></Laptop></div>
                </Cam>
                <div style={{ position: "absolute", left: v ? 70 : 120, right: v ? 70 : undefined, top: v ? 220 : 360, width: v ? undefined : 520 }}><Title f={lf} t="পকেট কোর্স" sub="অল্প সময়ে কাজের দক্ষতা" v={v} align={v ? "center" : "left"} /></div>
              </AbsoluteFill>
            );
          }} />
          <Vignette />
        </AbsoluteFill>
      );
    }
    case 4: { // KIDS
      return (
        <AbsoluteFill>
          <AbsoluteFill style={{ background: "linear-gradient(160deg, #DFF3FF, #FFF3D6)" }} />
          <Cam f={f} len={len} ry={[10, 4]} s={[0.98, 1.04]}>
            <div style={{ position: "absolute", left: 80, top: 220 }}><Laptop w={1060}><Rec n="kids" from={0.2} /></Laptop></div>
            <div style={{ position: "absolute", left: 1220, top: 150, transform: `translateY(${(1 - ent(f, 6, 26)) * 500}px) rotate(-3deg)` }}><Phone w={300}><Shot src="app/15-kids.jpg" /></Phone></div>
          </Cam>
          <div style={{ position: "absolute", left: 1580, top: 360, width: 320 }}>
            <Rise f={f} d={8}><div style={{ fontFamily: BN, fontWeight: 800, fontSize: 92, lineHeight: 1.1, color: "#FF4F8B" }}>কিডস</div></Rise>
            <Rise f={f} d={14}><div style={{ fontFamily: BN, fontWeight: 700, fontSize: 46, color: "#16336B", lineHeight: 1.25 }}>ছোটদের জন্য আলাদা সেকশন</div></Rise>
          </div>
        </AbsoluteFill>
      );
    }
    case 5: { // VIDEO LESSONS + GURU
      const cuts = [0, at(5, "আটকে গেলে")];
      return (
        <AbsoluteFill>
          <Bg f={f} />
          <Beats f={f} s={s} cuts={cuts} render={(k, lf, ll) => {
            if (v) return k === 0 ? (
              <AbsoluteFill>
                <div style={{ position: "absolute", left: 70, right: 70, top: 200 }}><Title f={lf} t="প্রতিটা কোর্সে ভিডিও পাঠ" v align="center" chips={[["ভিডিও পাঠ"]]} /></div>
                <Cam f={lf} len={ll} s={[1, 1.06]}><div style={{ position: "absolute", left: 40, top: 760 }}><Laptop w={960}><Rec n="learn-gds" from={6} /></Laptop></div></Cam>
              </AbsoluteFill>
            ) : (
              <AbsoluteFill>
                <div style={{ position: "absolute", left: 70, right: 70, top: 120 }}><Title f={lf} t="এআই প্রশিক্ষক গুরু" v align="center" chips={[["প্রশ্ন করো"], ["স্ক্রিনশট দাও", C.gold]]} /></div>
                <Cam f={lf} len={ll} s={[1, 1.04]}><div style={{ position: "absolute", left: (1080 - 470) / 2, top: 500 }}><Phone w={470}><Rec n="m-guru-ielts" from={5} rate={1.3} /></Phone></div></Cam>
              </AbsoluteFill>
            );
            return k === 0 ? (
              <AbsoluteFill>
                <Cam f={lf} len={ll} ry={[-14, -8]} s={[1, 1.05]}><div style={{ position: "absolute", left: 760, top: 200 }}><Laptop w={1080}><Rec n="learn-gds" from={6} /></Laptop></div></Cam>
                <div style={{ position: "absolute", left: 120, top: 330, width: 580 }}><Title f={lf} t="প্রতিটা কোর্সে ভিডিও পাঠ" chips={[["ভিডিও", C.sky], ["কুইজ"], ["পরীক্ষা"]]} /></div>
              </AbsoluteFill>
            ) : (
              <AbsoluteFill>
                <Cam f={lf} len={ll} ry={[14, 7]} s={[1, 1.05]}><div style={{ position: "absolute", left: 70, top: 200 }}><Laptop w={1080}><Rec n="guru-cfe" from={4} rate={1.5} pos="right top" /></Laptop></div></Cam>
                <div style={{ position: "absolute", left: 1240, top: 250, width: 620 }}>
                  <Rise f={lf} d={0}><div style={{ display: "inline-flex", alignItems: "center", gap: 12, padding: "10px 22px", borderRadius: 14, background: `${C.blue}`, color: "#fff", fontFamily: BN, fontWeight: 700, fontSize: 30 }}><Bot size={34} /> এআই প্রশিক্ষক</div></Rise>
                  <div style={{ height: 22 }} />
                  <Title f={lf - 4} t="গুরুকে জিজ্ঞেস করো" sub="প্রশ্ন লেখো বা স্ক্রিনশট দাও — উত্তর সাথে সাথে" />
                </div>
              </AbsoluteFill>
            );
          }} />
          <Vignette />
        </AbsoluteFill>
      );
    }
    case 6: { // BOOK + NOTES
      const cuts = [0, at(6, "পড়তে পড়তে")];
      return (
        <AbsoluteFill>
          <Bg f={f} />
          <Beats f={f} s={s} cuts={cuts} render={(k, lf, ll) => (
            <AbsoluteFill>
              <Cam f={lf} len={ll} ry={k ? [12, 6] : [-12, -6]} s={[1, 1.05]}>
                <div style={{ position: "absolute", left: k ? 80 : 760, top: 200 }}><Laptop w={1080}>{k ? <Rec n="notes" from={6} /> : <Rec n="books" from={1.5} />}</Laptop></div>
              </Cam>
              <div style={{ position: "absolute", left: k ? 1250 : 120, top: 360, width: 580 }}>
                {k ? <Title f={lf} t="নোট আর হাইলাইট" chips={[["হলুদ", "#E8C547"], ["সবুজ", C.green], ["নীল", C.sky]]} /> : <Title f={lf} t="স্পেশাল বই" sub="প্রতিটা পাঠের সাথে মিলিয়ে" />}
              </div>
            </AbsoluteFill>
          )} />
          <Vignette />
        </AbsoluteFill>
      );
    }
    case 7: { // REPORT + CERTIFICATE
      const cuts = [0, at(7, "শেষে পাবে")];
      return (
        <AbsoluteFill>
          <Bg f={f} />
          <Beats f={f} s={s} cuts={cuts} render={(k, lf, ll) => k === 0 ? (
            <AbsoluteFill>
              <Cam f={lf} len={ll} ry={[-12, -6]} s={[1, 1.06]}><div style={{ position: "absolute", left: 760, top: 200 }}><Laptop w={1080}><Rec n="report" from={4.6} /></Laptop></div></Cam>
              <div style={{ position: "absolute", left: 120, top: 360, width: 580 }}><Title f={lf} t="প্রগ্রেস রিপোর্ট" sub="কোন দিন কতক্ষণ পড়লে, সব এক জায়গায়" /></div>
            </AbsoluteFill>
          ) : (
            <AbsoluteFill>
              <Cam f={lf} len={ll} ry={[12, 5]} s={[1, 1.06]}><div style={{ position: "absolute", left: 80, top: 200 }}><Laptop w={1080}><Rec n="cert" from={0.6} /></Laptop></div></Cam>
              <div style={{ position: "absolute", left: 1250, top: 340, width: 600 }}><Title f={lf} t="সার্টিফিকেট" sub="কোর্স শেষে, পরীক্ষায় পাস করলে" chips={[["কিউআর কোডে যাচাই", C.gold]]} /></div>
            </AbsoluteFill>
          )} />
          <Vignette />
        </AbsoluteFill>
      );
    }
    case 8: { // APP — three phones fan out
      const shots = ["15-kids", "03-home-guest", "11-my-learning"];
      return (
        <AbsoluteFill>
          <Bg f={f} />
          <AbsoluteFill style={{ justifyContent: "center", alignItems: "center" }}>
            <div style={{ position: "relative", width: 1000, height: 760, marginLeft: 520 }}>
              {shots.map((sh, j) => {
                const p = spring({ frame: f - j * 3, fps: FPS, config: { damping: 16, mass: 0.8 } });
                const o = j - 1;
                return <div key={sh} style={{ position: "absolute", left: 340 + o * 290 * p, top: 20 + Math.abs(o) * 50, transform: `rotate(${o * 9 * p}deg) translateY(${(1 - p) * 400}px)`, zIndex: j === 1 ? 2 : 1 }}><Phone w={320}><Shot src={`app/${sh}.jpg`} /></Phone></div>;
              })}
            </div>
          </AbsoluteFill>
          <div style={{ position: "absolute", left: 120, top: 380, width: 640 }}>
            <Rise f={f} d={0}><div style={{ display: "inline-flex", alignItems: "center", gap: 12, color: C.green, fontFamily: EN, fontWeight: 800, fontSize: 34 }}><Smartphone size={40} /> Android</div></Rise>
            <div style={{ height: 14 }} />
            <Title f={f - 2} t="সব আছে অ্যাপেও" />
          </div>
          <Vignette />
        </AbsoluteFill>
      );
    }
    case 9: { // PRICE — kinetic type
      const d2 = Math.round(at(9, "আগে দেখো") * s.vo) + (s.voAt - s.from), d3 = Math.round(at(9, "পেমেন্ট") * s.vo) + (s.voAt - s.from);
      const big = v ? 196 : 260;
      return (
        <AbsoluteFill>
          <Bg f={f} />
          <AbsoluteFill style={{ opacity: 0.16, filter: "blur(6px)" }}><Rec n={v ? "m-courses" : "courses"} from={3} /></AbsoluteFill>
          <AbsoluteFill style={{ justifyContent: "center", alignItems: "center", flexDirection: "column", gap: v ? 26 : 10, paddingBottom: v ? 260 : 0 }}>
            <Rise f={f} d={4}><div style={{ fontFamily: BN, fontWeight: 700, fontSize: v ? 60 : 56, color: C.ice }}>প্রতিটা কোর্সের</div></Rise>
            <div style={{ display: "flex", flexDirection: v ? "column" : "row", alignItems: "center", gap: v ? 0 : 40 }}>
              <div style={{ fontFamily: BN, fontWeight: 800, fontSize: big, lineHeight: 1.05, ...gtext(), transform: `scale(${spring({ frame: f - 10, fps: FPS, config: { damping: 12 } })})` }}>প্রথম ২০%</div>
              <div style={{ fontFamily: BN, fontWeight: 800, fontSize: big * 0.8, color: C.gold, transform: `scale(${spring({ frame: f - 24, fps: FPS, config: { damping: 10 } })})` }}>ফ্রি</div>
            </div>
            <Words f={f} d={d2} text="আগে দেখো, তারপর সিদ্ধান্ত নাও" style={{ fontFamily: BN, fontWeight: 700, fontSize: v ? 60 : 58, color: "#fff", justifyContent: "center", marginTop: 10 }} />
            <div style={{ display: "flex", gap: 18, marginTop: 26, flexWrap: "wrap", justifyContent: "center" }}>
              <Chip f={f} d={d3} color={C.bkash} solid size={v ? 46 : 42}>পেমেন্ট বিকাশে</Chip>
              <Chip f={f} d={d3 + 6} color={C.green} size={v ? 46 : 42}>কম্পিউটার শিক্ষা পুরো ফ্রি</Chip>
            </div>
          </AbsoluteFill>
          <Vignette />
        </AbsoluteFill>
      );
    }
    case 10: { // MAP — Teknaf to Tetulia, the tagline
      const draw = interpolate(f, [0, 50], [0, 1], { ...clamp, easing: inOut });
      const fill = ent(f, 30, 30);
      const line = interpolate(f, [26, 60], [0, 1], { ...clamp, easing: inOut });
      const d2 = Math.round(at(10, "শিখবে তুমি") * s.vo) + (s.voAt - s.from), d3 = Math.round(at(10, "এইবার") * s.vo) + (s.voAt - s.from);
      const mh = v ? 860 : 900, mw = (mh * 740) / 898;
      const pin = (x: number, y: number, name: string, d: number, left: boolean) => {
        const p = spring({ frame: f - d, fps: FPS, config: { damping: 11 } });
        return (
          <g transform={`translate(${x} ${y})`} opacity={Math.min(1, p * 2)}>
            <circle r={18 + 22 * ((f % 40) / 40)} fill="none" stroke={C.gold} strokeWidth={3} opacity={1 - (f % 40) / 40} />
            <circle r={12 * p} fill={C.gold} />
            <text x={left ? -26 : 26} y={14} textAnchor={left ? "end" : "start"} fontFamily={BN} fontWeight={800} fontSize={44} fill="#fff">{name}</text>
          </g>
        );
      };
      return (
        <AbsoluteFill>
          <Bg f={f} />
          <Cam f={f} len={len} s={[1.04, 1]}>
            <svg viewBox="-40 -20 740 898" style={{ position: "absolute", width: mw, height: mh, left: v ? (1080 - mw) / 2 : 1060, top: v ? 640 : 90, overflow: "visible" }}>
              <defs><linearGradient id="mg3" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#7fb0ff" /><stop offset="1" stopColor="#2f6bff" /></linearGradient></defs>
              <path d={(MAP as any).d} pathLength={1} fill="url(#mg3)" fillOpacity={0.55 * fill} stroke="#9CC2FF" strokeWidth={3} strokeDasharray="1 1" strokeDashoffset={1 - draw} />
              <path d="M44,30 Q 420,360 543,805" pathLength={1} fill="none" stroke={C.gold} strokeWidth={4} strokeDasharray="1 1" strokeDashoffset={1 - line} strokeLinecap="round" />
              {pin(44, 30, "তেঁতুলিয়া", 22, false)}
              {pin(543, 805, "টেকনাফ", 50, true)}
            </svg>
          </Cam>
          <div style={{ position: "absolute", left: v ? 60 : 120, right: v ? 60 : 900, top: v ? 150 : 250, textAlign: v ? "center" : "left" }}>
            <Words f={f} d={4} text="টেকনাফ থেকে তেঁতুলিয়া" style={{ fontFamily: BN, fontWeight: 700, fontSize: v ? 56 : 52, color: C.gold, justifyContent: v ? "center" : "flex-start" }} />
            <Words f={f} d={d2} gap={5} text="শিখবে তুমি," style={{ fontFamily: BN, fontWeight: 800, fontSize: v ? 120 : 132, color: "#fff", lineHeight: 1.12, marginTop: 18, justifyContent: v ? "center" : "flex-start" }} />
            <Words f={f} d={d2 + 14} gap={5} text="দেখবে দেশ" grad style={{ fontFamily: BN, fontWeight: 800, fontSize: v ? 120 : 132, lineHeight: 1.12, justifyContent: v ? "center" : "flex-start" }} />
            <Rise f={f} d={d3}><div style={{ fontFamily: BN, fontWeight: 600, fontSize: v ? 50 : 48, color: C.ice, marginTop: 26, lineHeight: 1.3 }}>এইবার তোমার হাতে আগামীর বাংলাদেশ</div></Rise>
          </div>
          <Vignette />
        </AbsoluteFill>
      );
    }
    case 11: { // CTA
      const p = ent(f, 0, 26);
      return (
        <AbsoluteFill>
          <Bg f={f} />
          <AbsoluteFill style={{ justifyContent: "center", alignItems: "center", flexDirection: "column", gap: v ? 40 : 34, paddingBottom: v ? 200 : 0 }}>
            <div style={{ opacity: p, transform: `scale(${0.85 + 0.15 * p})`, filter: `blur(${(1 - p) * 12}px)` }}><Img src={A("logo-dark.png")} style={{ width: v ? 620 : 560 }} /></div>
            <div style={{ transform: `scale(${spring({ frame: f - 10, fps: FPS, config: { damping: 13 } })})`, padding: v ? "24px 52px" : "22px 56px", borderRadius: 999, background: `linear-gradient(95deg, ${C.blue}, #2F7BFF)`, boxShadow: `0 20px 60px ${C.blue}88`, fontFamily: EN, fontWeight: 800, fontSize: v ? 66 : 64, color: "#fff" }}>aiuniversitybd.com</div>
            <Rise f={f} d={22}><div style={{ display: "flex", gap: 30, alignItems: "center", fontFamily: BN, fontWeight: 600, fontSize: v ? 44 : 38, color: C.ice, flexWrap: "wrap", justifyContent: "center" }}>
              <span style={{ display: "inline-flex", alignItems: "center", gap: 10 }}><Play size={34} color={C.sky} /> আজই শুরু করো</span>
              <span style={{ display: "inline-flex", alignItems: "center", gap: 10 }}><Smartphone size={34} color={C.green} /> Android অ্যাপও আছে</span>
            </div></Rise>
          </AbsoluteFill>
          <Vignette />
        </AbsoluteFill>
      );
    }
  }
  return null;
}

// ======================= composition =======================
export type Props = { durs: number[]; vertical?: boolean };
export const AIU3: React.FC<Props> = ({ durs, vertical }) => {
  const v = !!vertical;
  const order = v ? REEL_ORDER : MAIN_ORDER;
  const P = plan(durs, order);
  const total = totalOf(durs, order);
  return (
    <AbsoluteFill style={{ background: C.deep }}>
      {P.map((s, k) => (
        <Sequence key={k} from={s.from} durationInFrames={s.len + (k === P.length - 1 ? outroOf(order) : 0)}>
          <SceneBox s={s} v={v} />
        </Sequence>
      ))}
      <Audio src={A("music.mp3")} startFrom={MUSIC_START} volume={(f) => interpolate(f, [0, 6, total - 45, total], [0, v ? 0.3 : 0.28, v ? 0.3 : 0.28, 0], clamp)} />
      {P.map((s, k) => (
        <Sequence key={"vo" + k} from={s.voAt} durationInFrames={s.vo + 20}>
          <Audio src={A(`vo/${String(s.i + 1).padStart(2, "0")}.mp3`)} volume={1.0} />
        </Sequence>
      ))}
      {P.slice(1).map((s, k) => (
        <Sequence key={"w" + k} from={Math.max(0, s.from - 7)} durationInFrames={30}><Audio src={A("sfx/whoosh.mp3")} volume={0.2} /></Sequence>
      ))}
      <Sequence from={P[P.length - 1].from + 8} durationInFrames={60}><Audio src={A("sfx/chime.mp3")} volume={0.35} /></Sequence>
    </AbsoluteFill>
  );
};
const SceneBox: React.FC<{ s: S; v: boolean }> = ({ s, v }) => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill>
      {scene(s, f, v)}
      {v && (s.i === 2 || s.i === 5) ? <Caption f={f} i={s.i} s={s} /> : null}
    </AbsoluteFill>
  );
};
