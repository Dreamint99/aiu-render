// AI University কিডস — অক্ষর/বর্ণ/হরফ শেখার ভিডিও (উজ্জ্বল আকাশ, টুনটুনি মাসকট, বড় অক্ষর, ছবি, ধাঁধা)।
// স্পেক: src/kids/specs/<id>.json → scripts/kids_make.py (ভয়েস + সময়) → <id>.timed.json। দৃশ্য: intro · letter · recap · quiz · outro
import React from "react";
import { AbsoluteFill, Audio, Sequence, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig, Easing, delayRender, continueRender, random } from "remotion";
import { loadFont as loadFredoka } from "@remotion/google-fonts/Fredoka";
import { loadFont as loadNaskh } from "@remotion/google-fonts/NotoNaskhArabic";
import { loadFont as loadEmoji } from "@remotion/google-fonts/NotoColorEmoji";

const FRED = loadFredoka("normal", { weights: ["600", "700"] }).fontFamily;
const NASKH = loadNaskh("normal", { weights: ["700"] }).fontFamily;
const EMOJI_FONT = loadEmoji().fontFamily; // same colour emoji locally and on the Linux cloud runners
const BN = "Anek", BALOO = "BalooDa";
if (typeof document !== "undefined") {
  for (const [n, u] of [["Anek", "fonts/AnekBangla.ttf"], ["BalooDa", "fonts/BalooDa2.ttf"]]) {
    const h = delayRender(`font ${n}`);
    const f = new FontFace(n, `url(${staticFile(u)})`, { weight: "100 900" });
    f.load().then(() => { document.fonts.add(f); continueRender(h); }).catch(() => continueRender(h));
  }
}
const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const pop = (f: number, fps: number, d: number) => spring({ frame: f - d, fps, config: { damping: 11, mass: 0.7 } });
const soft = (f: number, fps: number, d: number) => spring({ frame: f - d, fps, config: { damping: 200 }, durationInFrames: 18 });
const EMOJI = `${EMOJI_FONT},'Segoe UI Emoji','Apple Color Emoji',sans-serif`;
const INK = "#2A1B5C";

export type Part = { v: string; t: string; card?: boolean };
export type Scene = { type: string; vo: Part[]; audio: string; audioA?: string; frames: number; voAt: number; voFrames: number; aAt?: number; think?: number; [k: string]: any };
export type Spec = { id: string; title: string; sub: string; color: string; script: "latin" | "bangla" | "arabic"; scenes: Scene[]; total: number };

const letterFont = (s: Spec["script"]) => `${s === "arabic" ? NASKH : s === "bangla" ? BN : FRED}, ${EMOJI_FONT}`; // ইমোজি অক্ষরও (➡️, ☎️) সব মেশিনে

// নিজের আঁকা ছবি (যেগুলোর ইমোজি নেই)
const PicSvg: React.FC<{ k: string; size: number }> = ({ k, size }) => {
  if (k === "xylo") {
    const bars = ["#FF6B6B", "#FF9F1C", "#FFC93C", "#22B573", "#4D7CFE", "#9B5DE5"];
    return (
      <svg viewBox="0 0 220 200" width={size} height={size * 0.9}>
        <path d="M20 70 L200 40 M20 150 L200 170" stroke="#8B5A2B" strokeWidth={12} strokeLinecap="round" />
        {bars.map((c, i) => { const x = 30 + i * 30, h = 120 - i * 10; return <rect key={i} x={x} y={100 - h / 2 + i * 2} width={24} height={h} rx={8} fill={c} />; })}
        <g transform="rotate(-30 170 40)"><rect x={160} y={0} width={8} height={70} rx={4} fill="#8B5A2B" /><circle cx={164} cy={0} r={12} fill="#FF6B8B" /></g>
      </svg>
    );
  }
  return null;
};

// ── আকাশ, সূর্য, মেঘ, পাহাড় ──
const Sky: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill style={{ background: "linear-gradient(180deg,#7CC8FF 0%,#B9E3FF 55%,#E6F6FF 100%)" }}>
      <svg viewBox="0 0 100 100" style={{ position: "absolute", top: 40, right: 120, width: 190 }}>
        <g transform={`rotate(${f * 0.6} 50 50)`} stroke="#FFD34D" strokeWidth={6} strokeLinecap="round">
          {Array.from({ length: 10 }, (_, i) => <line key={i} x1={50} y1={4} x2={50} y2={17} transform={`rotate(${i * 36} 50 50)`} />)}
        </g>
        <circle cx={50} cy={50} r={25} fill="#FFC93C" />
      </svg>
      {[0, 1, 2].map((i) => {
        const x = ((f * (0.6 + i * 0.25) + i * 700) % 2400) - 300;
        return <svg key={i} viewBox="0 0 120 60" style={{ position: "absolute", left: x, top: 60 + i * 110, width: 200 - i * 40, opacity: 0.95 }}><path d="M20 50 a18 18 0 0 1 6 -34 a24 24 0 0 1 44 -6 a20 20 0 0 1 32 22 a14 14 0 0 1 -4 18z" fill="#fff" /></svg>;
      })}
      <svg viewBox="0 0 1200 160" preserveAspectRatio="none" style={{ position: "absolute", bottom: 0, left: 0, width: "100%", height: 230 }}>
        <path d="M0 90 C200 20 380 40 560 90 S920 150 1200 60 V160 H0z" fill="#9BE07A" />
        <path d="M0 130 C260 70 520 150 760 110 S1060 80 1200 120 V160 H0z" fill="#6CCB5F" />
      </svg>
    </AbsoluteFill>
  );
};

// ── টুনটুনি (কথা বলার সময় ঠোঁট নড়ে) ──
const Tuni: React.FC<{ size: number; talking: boolean; x: number; y: number }> = ({ size, talking, x, y }) => {
  const f = useCurrentFrame();
  const bob = Math.sin(f / 9) * 8, wing = Math.sin(f / 4) * 14, tail = Math.sin(f / 12) * 6;
  const beak = talking ? Math.abs(Math.sin(f / 2.6)) * 9 : 0;
  return (
    <svg viewBox="0 0 200 200" style={{ position: "absolute", left: x, top: y + bob, width: size, height: size, overflow: "visible" }}>
      <g transform={`rotate(${tail} 70 110)`}><path d="M58 118 C28 92 22 60 34 38 C48 64 62 86 80 104 Z" fill="#5FA83A" /></g>
      <ellipse cx={104} cy={122} rx={54} ry={50} fill="#7CC04B" />
      <ellipse cx={112} cy={136} rx={36} ry={32} fill="#FFF6DD" />
      <g transform={`rotate(${-Math.abs(wing)} 90 110)`}><path d="M70 112 C64 140 84 160 108 156 C98 140 92 124 96 108 Z" fill="#5FA83A" /></g>
      <circle cx={124} cy={80} r={40} fill="#7CC04B" />
      <path d="M90 66 C98 40 140 34 158 58 C140 52 118 54 90 66 Z" fill="#E9783A" />
      <circle cx={128} cy={80} r={16} fill="#fff" /><circle cx={132} cy={80} r={9} fill="#1F2A44" /><circle cx={135} cy={76} r={3} fill="#fff" />
      <g transform={`rotate(${-beak} 160 88)`}><path d="M160 86 L194 80 L162 90 Z" fill="#F4A300" /></g>
      <g transform={`rotate(${beak} 160 90)`}><path d="M160 90 L188 94 L162 96 Z" fill="#E08E00" /></g>
      <circle cx={112} cy={98} r={7} fill="#FF9AA2" opacity={0.7} />
      <path d="M96 168 v14 M114 168 v14" stroke="#E9783A" strokeWidth={5} strokeLinecap="round" />
    </svg>
  );
};

const Confetti: React.FC<{ from: number; seed: string }> = ({ from, seed }) => {
  const f = useCurrentFrame() - from;
  if (f < 0) return null;
  const C = ["#FF6B6B", "#FFC93C", "#4D7CFE", "#22B573", "#9B5DE5", "#FF9F1C"];
  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      {Array.from({ length: 70 }, (_, i) => {
        const x = random(seed + i) * 1920, sp = 9 + random(seed + "s" + i) * 9, y = -40 + (f - random(seed + "d" + i) * 20) * sp, r = f * (6 + random(seed + "r" + i) * 10);
        return <div key={i} style={{ position: "absolute", left: x, top: y, width: 18, height: 28, borderRadius: 5, background: C[i % 6], transform: `rotate(${r}deg)` }} />;
      })}
    </AbsoluteFill>
  );
};

const Bubble: React.FC<{ text: string; x: number; y: number; s: number }> = ({ text, x, y, s }) => (
  <div style={{ position: "absolute", left: x, top: y, transform: `scale(${s})`, transformOrigin: "0% 100%", background: "#fff", borderRadius: "36px 36px 36px 8px", padding: "22px 34px", fontFamily: BN, fontWeight: 800, fontSize: 52, color: INK, boxShadow: "0 10px 0 rgba(42,27,92,.12)" }}>{text}</div>
);

// ── দৃশ্যগুলো ──
const Intro: React.FC<{ sp: Spec; sc: Scene }> = ({ sp, sc }) => {
  const f = useCurrentFrame(), { fps } = useVideoConfig();
  const chars = [...sp.title.split(" ")];
  return (
    <AbsoluteFill>
      <Tuni size={420} talking={f > sc.voAt && f < sc.voAt + sc.voFrames} x={180} y={420} />
      <Bubble text="হ্যালো বন্ধুরা!" x={520} y={330} s={pop(f, fps, 10)} />
      <div style={{ position: "absolute", left: 640, right: 120, top: 470, display: "flex", gap: 34, justifyContent: "center", flexWrap: "wrap", direction: sp.script === "arabic" ? "ltr" : "ltr" }}>
        {chars.map((c, i) => {
          const s = pop(f, fps, 24 + i * 8);
          return <div key={i} style={{ transform: `scale(${s}) rotate(${(1 - s) * -30 + (i % 2 ? 4 : -4)}deg)`, background: ["#FF6B6B", "#FFC93C", "#4D7CFE", "#22B573", "#9B5DE5"][i % 5], color: "#fff", borderRadius: 40, minWidth: 190, height: 190, padding: "0 24px", display: "grid", placeItems: "center", fontFamily: BN + "," + FRED, fontWeight: 800, fontSize: 110, boxShadow: "0 14px 0 rgba(0,0,0,.15)" }}>{c}</div>;
        })}
      </div>
      <div style={{ position: "absolute", top: 60, left: 80, background: "rgba(255,255,255,.92)", borderRadius: 99, padding: "14px 34px", fontFamily: BN, fontWeight: 700, fontSize: 40, color: INK, opacity: soft(f, fps, 0) }}>{sp.sub}</div>
    </AbsoluteFill>
  );
};

const Word: React.FC<{ sp: Spec; sc: Scene }> = ({ sp, sc }) => {
  if (sp.script === "arabic") return <span style={{ fontFamily: NASKH, color: sp.color, direction: "rtl" }}>{sc.word}</span>;
  const word: string = sc.word, at = sc.letter && !word.startsWith(sc.letter) ? word.indexOf(sc.letter) : -1;
  if (at > 0) // শব্দের ভেতরের বর্ণ (ব্যাঙ-এর ঙ): সেটাই রঙিন
    return <span style={{ fontFamily: BN }}>{word.slice(0, at)}<span style={{ color: sp.color }}>{sc.letter}</span>{word.slice(at + sc.letter.length)}</span>;
  const [first, ...rest] = [...word];
  return <span style={{ fontFamily: sp.script === "bangla" ? BN : FRED }}><span style={{ color: sp.color }}>{first}</span>{rest.join("")}</span>;
};

const Letter: React.FC<{ sp: Spec; sc: Scene }> = ({ sp, sc }) => {
  const f = useCurrentFrame(), { fps } = useVideoConfig();
  const a = pop(f, fps, 2), picAt = sc.voAt + Math.round(sc.voFrames * 0.28), p = pop(f, fps, picAt), w = soft(f, fps, picAt + 10), m = pop(f, fps, picAt + 22);
  const wob = Math.sin(f / 7) * 3, talking = f > sc.voAt && f < sc.voAt + sc.voFrames;
  return (
    <AbsoluteFill>
      <Sequence from={2} durationInFrames={20}><Audio src={staticFile("kids/_shared/pop.mp3")} volume={0.5} /></Sequence>
      <Sequence from={picAt} durationInFrames={20}><Audio src={staticFile("kids/_shared/pop.mp3")} volume={0.4} /></Sequence>
      {/* অক্ষর-কার্ড */}
      <div style={{ position: "absolute", left: 170, top: 150, width: 640, height: 640, borderRadius: 90, background: sp.color, transform: `scale(${a}) rotate(${(1 - a) * -25 + wob}deg)`, boxShadow: "0 24px 0 rgba(0,0,0,.16)", display: "grid", placeItems: "center", overflow: "hidden" }}>
        <div style={{ position: "absolute", inset: 0, background: "radial-gradient(circle at 22% 20%,rgba(255,255,255,.35) 0 16%,transparent 17%),radial-gradient(circle at 82% 80%,rgba(255,255,255,.2) 0 12%,transparent 13%)" }} />
        {(() => {
          const st: React.CSSProperties = { fontFamily: letterFont(sp.script), fontWeight: 700, fontSize: sp.script === "arabic" ? 340 : sp.script === "bangla" ? 380 : 440, color: "#fff", lineHeight: 1, textShadow: "0 12px 0 rgba(0,0,0,.15)", marginTop: sp.script === "arabic" ? -170 : sp.script === "bangla" ? 70 : 0, whiteSpace: "nowrap" };
          const body = <>{sc.letter}{sc.small ? <span style={{ fontSize: 230, opacity: 0.9, marginLeft: 20 }}>{sc.small}</span> : null}</>;
          if (!sc.draw) return <div style={st}>{body}</div>;
          // পেনসিল দিয়ে লেখা: হালকা দাগ, তারপর বাঁ থেকে ডানে রং ভরে ওঠে
          const d0 = sc.voAt + Math.round(sc.voFrames * 0.5), d1 = Math.max(d0 + 30, sc.frames - 16), pr = interpolate(f, [d0, d1], [0, 1], { ...clamp, easing: Easing.inOut(Easing.cubic) });
          const drawing = f >= d0;
          return (
            <div style={{ position: "relative" }}>
              <div style={{ ...st, opacity: drawing ? 0.28 : 1 }}>{body}</div>
              {drawing ? <div style={{ ...st, position: "absolute", left: 0, top: 0, color: "#FFE07A", clipPath: `inset(0 ${100 - pr * 100}% 0 0)` }}>{body}</div> : null}
              {drawing && pr < 1 ? <div style={{ position: "absolute", left: `${pr * 100}%`, top: `${45 + Math.sin(f / 2.2) * 28}%`, fontFamily: EMOJI, fontSize: 110, transform: "translate(-30%,-80%) rotate(-10deg)" }}>✏️</div> : null}
            </div>
          );
        })()}
        {sc.name ? <div style={{ position: "absolute", bottom: 40, background: "#fff", color: sp.color, borderRadius: 99, padding: "6px 40px", fontFamily: BN, fontWeight: 800, fontSize: 64 }}>{sc.name}</div> : null}
      </div>
      {/* ছবি + শব্দ */}
      <div style={{ position: "absolute", left: 930, top: 120, width: 820, height: 560, borderRadius: 70, background: "#fff", boxShadow: "0 18px 0 rgba(42,27,92,.12)", transform: `scale(${p})`, display: "grid", placeItems: "center" }}>
        <div style={{ fontFamily: EMOJI, fontSize: 290, lineHeight: 1, transform: `translateY(${-40 + Math.sin(f / 8) * 10}px) rotate(${Math.sin(f / 11) * 5}deg)` }}>{String(sc.pic).startsWith("svg:") ? <PicSvg k={String(sc.pic).slice(4)} size={300} /> : sc.pic}</div>
        <div style={{ position: "absolute", bottom: 34, fontSize: sp.script === "arabic" ? 120 : 110, fontWeight: 800, color: INK, opacity: w, transform: `translateY(${(1 - w) * 30}px)`, lineHeight: 1.1 }}><Word sp={sp} sc={sc} /></div>
      </div>
      <div style={{ position: "absolute", left: 930, width: 820, top: 720, display: "flex", justifyContent: "center", gap: 24, transform: `scale(${m})` }}>
        {sc.tr ? <span style={{ background: "#FFF4CC", color: "#8A5A00", borderRadius: 99, padding: "12px 34px", fontFamily: BN, fontWeight: 800, fontSize: 52 }}>{sc.tr}</span> : null}
        <span style={{ background: sp.color, color: "#fff", borderRadius: 99, padding: "12px 38px", fontFamily: BN, fontWeight: 800, fontSize: 52 }}>{sc.tr || sp.script === "latin" ? "মানে " : ""}{sc.meaning}</span>
      </div>
      {sc.sound ? <div style={{ position: "absolute", left: 170, width: 640, top: 830, display: "flex", justifyContent: "center", opacity: soft(f, fps, 24) }}><span style={{ background: "#FFF4CC", color: "#8A5A00", borderRadius: 99, padding: "10px 34px", fontFamily: BN, fontWeight: 800, fontSize: 50 }}>🔊 বলে: {sc.sound}</span></div> : null}
      {sc.dots ? <div style={{ position: "absolute", left: 170, width: 640, top: 830, textAlign: "center", fontFamily: BN, fontWeight: 800, fontSize: 48, color: INK, opacity: soft(f, fps, 30) }}>● {sc.dots}</div> : null}
      <Tuni size={250} talking={talking} x={1640} y={790} />
    </AbsoluteFill>
  );
};

const Recap: React.FC<{ sp: Spec; sc: Scene }> = ({ sp, sc }) => {
  const f = useCurrentFrame(), { fps } = useVideoConfig();
  const n = sc.letters.length, prog = interpolate(f, [sc.voAt + sc.voFrames * 0.18, sc.voAt + sc.voFrames], [0, n], clamp), on = Math.min(n - 1, Math.floor(prog));
  return (
    <AbsoluteFill>
      <div style={{ position: "absolute", top: 90, width: "100%", textAlign: "center", fontFamily: BN, fontWeight: 800, fontSize: 84, color: "#fff", textShadow: "0 6px 0 #3A7BD5" }}>এবার একসাথে বলি!</div>
      <div style={{ position: "absolute", top: 270, left: 0, right: 0, display: "flex", justifyContent: "center", gap: 44, flexDirection: sp.script === "arabic" ? "row-reverse" : "row" }}>
        {sc.letters.map((L: string, i: number) => {
          const s = pop(f, fps, 6 + i * 6), hot = f > sc.voAt + sc.voFrames * 0.18 && i === on;
          return (
            <div key={i} style={{ width: 340, height: 520, borderRadius: 60, background: hot ? sp.color : "#fff", color: hot ? "#fff" : INK, transform: `scale(${s * (hot ? 1.08 : 1)}) translateY(${hot ? -24 : 0}px)`, boxShadow: "0 16px 0 rgba(42,27,92,.14)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 10 }}>
              <div style={{ fontFamily: letterFont(sp.script), fontWeight: 700, fontSize: 210, lineHeight: 1.1 }}>{L}</div>
              {sc.names ? <div style={{ fontFamily: BN, fontWeight: 800, fontSize: 56 }}>{sc.names[i]}</div> : null}
              <div style={{ fontFamily: EMOJI, fontSize: 120 }}>{sc.pics[i]}</div>
            </div>
          );
        })}
      </div>
      <Tuni size={230} talking={f > sc.voAt && f < sc.voAt + sc.voFrames} x={70} y={800} />
    </AbsoluteFill>
  );
};

const Quiz: React.FC<{ sp: Spec; sc: Scene }> = ({ sp, sc }) => {
  const f = useCurrentFrame(), { fps } = useVideoConfig();
  const aAt = sc.aAt!, think = sc.think!, shown = f >= aAt, left = Math.ceil((aAt - f) / fps);
  return (
    <AbsoluteFill>
      <Sequence from={aAt}><Audio src={staticFile(sc.audioA!)} /></Sequence>
      <Sequence from={aAt} durationInFrames={60}><Audio src={staticFile("kids/_shared/yay.mp3")} volume={0.45} /></Sequence>
      <div style={{ position: "absolute", top: 70, left: 0, right: 0, display: "flex", justifyContent: "center" }}>
        <div style={{ background: "#fff", borderRadius: 50, padding: "26px 60px", fontFamily: BN, fontWeight: 800, fontSize: 76, color: INK, boxShadow: "0 12px 0 rgba(42,27,92,.12)", transform: `scale(${pop(f, fps, 2)})` }}>🤔 {sc.q}</div>
      </div>
      {sc.pic ? <div style={{ position: "absolute", top: 250, width: "100%", textAlign: "center", fontFamily: EMOJI, fontSize: 200, transform: `scale(${pop(f, fps, 10)})` }}>{sc.pic}</div> : null}
      <div style={{ position: "absolute", top: sc.pic ? 540 : 380, left: 0, right: 0, display: "flex", justifyContent: "center", gap: 70 }}>
        {sc.options.map((o: string, i: number) => {
          const s = pop(f, fps, 16 + i * 6), ok = i === sc.answer, c = shown ? (ok ? "#22B573" : "#fff") : "#fff";
          return (
            <div key={i} style={{ width: 300, height: 300, borderRadius: 60, background: c, color: shown && ok ? "#fff" : INK, opacity: shown && !ok ? 0.35 : 1, transform: `scale(${s * (shown && ok ? 1 + 0.1 * pop(f, fps, aAt) : 1)})`, boxShadow: "0 16px 0 rgba(42,27,92,.14)", display: "grid", placeItems: "center", fontFamily: letterFont(sp.script), fontWeight: 700, fontSize: 190, lineHeight: 1, position: "relative" }}>
              {o}
              {shown && ok ? <div style={{ position: "absolute", top: -40, right: -40, width: 110, height: 110, borderRadius: "50%", background: "#FFC93C", display: "grid", placeItems: "center", fontSize: 70, color: "#fff", fontFamily: FRED }}>✓</div> : null}
            </div>
          );
        })}
      </div>
      {!shown && f > aAt - think ? (
        <div style={{ position: "absolute", right: 120, top: 330, width: 170, height: 170, borderRadius: "50%", background: "#FF6B8B", color: "#fff", display: "grid", placeItems: "center", fontFamily: BN, fontWeight: 800, fontSize: 110, transform: `scale(${1 + 0.12 * Math.sin(f / 3)})` }}>{"০১২৩"[Math.max(0, Math.min(3, left))]}</div>
      ) : null}
      {shown ? <Confetti from={aAt} seed={sp.id + "q"} /> : null}
      <Tuni size={230} talking={(f > sc.voAt && f < sc.voAt + sc.voFrames) || f > aAt} x={70} y={800} />
    </AbsoluteFill>
  );
};

const Outro: React.FC<{ sp: Spec; sc: Scene }> = ({ sp, sc }) => {
  const f = useCurrentFrame(), { fps } = useVideoConfig();
  return (
    <AbsoluteFill>
      <Sequence from={4} durationInFrames={60}><Audio src={staticFile("kids/_shared/yay.mp3")} volume={0.4} /></Sequence>
      <Tuni size={460} talking={f > sc.voAt && f < sc.voAt + sc.voFrames} x={160} y={380} />
      <div style={{ position: "absolute", left: 700, right: 100, top: 200, textAlign: "center" }}>
        <div style={{ display: "flex", justifyContent: "center", gap: 20 }}>
          {[0, 1, 2].map((i) => <div key={i} style={{ fontFamily: EMOJI, fontSize: i === 1 ? 190 : 150, transform: `scale(${pop(f, fps, 6 + i * 7)}) rotate(${Math.sin(f / 6 + i) * 8}deg)` }}>⭐</div>)}
        </div>
        <div style={{ fontFamily: BN, fontWeight: 800, fontSize: 170, color: "#fff", textShadow: "0 10px 0 #3A7BD5", transform: `scale(${pop(f, fps, 20)})` }}>সাবাশ!</div>
        <div style={{ display: "inline-block", marginTop: 30, background: "#fff", borderRadius: 99, padding: "18px 50px", fontFamily: FRED, fontWeight: 700, fontSize: 58, color: sp.color, boxShadow: "0 10px 0 rgba(42,27,92,.12)", opacity: soft(f, fps, 40) }}>aiuniversitybd.com/kids</div>
      </div>
      <Confetti from={0} seed={sp.id + "o"} />
    </AbsoluteFill>
  );
};

// ভিডিওর শেষে: এবার নিচে কী করবে (বাচ্চাকে ভিডিওই বলে দেয়)
const Next: React.FC<{ sp: Spec; sc: Scene }> = ({ sp, sc }) => {
  const f = useCurrentFrame(), { fps } = useVideoConfig();
  const steps: [string, string][] = sc.steps || [];
  const per = sc.voFrames / Math.max(1, steps.length + 1);
  return (
    <AbsoluteFill>
      <div style={{ position: "absolute", top: 70, width: "100%", textAlign: "center", fontFamily: BN, fontWeight: 800, fontSize: 92, color: "#fff", textShadow: "0 6px 0 #3A7BD5", transform: `scale(${pop(f, fps, 4)})` }}>ভিডিও শেষ! এবার নিচে চলো</div>
      <div style={{ position: "absolute", top: 260, left: 0, right: 0, display: "flex", justifyContent: "center", gap: 40 }}>
        {steps.map(([e, t], i) => {
          const at = sc.voAt + Math.round(per * (i + 1)), s = pop(f, fps, at), hot = f >= at && f < at + per;
          return (
            <div key={i} style={{ width: 360, height: 400, borderRadius: 60, background: hot ? sp.color : "#fff", color: hot ? "#fff" : INK, transform: `scale(${s * (hot ? 1.07 : 1)})`, boxShadow: "0 16px 0 rgba(42,27,92,.14)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 18, position: "relative" }}>
              <div style={{ position: "absolute", top: -34, left: -20, width: 84, height: 84, borderRadius: "50%", background: "#FFC93C", color: INK, display: "grid", placeItems: "center", fontFamily: BN, fontWeight: 800, fontSize: 50 }}>{"১২৩৪"[i]}</div>
              <div style={{ fontFamily: EMOJI, fontSize: 150, lineHeight: 1 }}>{e}</div>
              <div style={{ fontFamily: BN, fontWeight: 800, fontSize: 50, textAlign: "center", padding: "0 20px", lineHeight: 1.2 }}>{t}</div>
            </div>
          );
        })}
      </div>
      <div style={{ position: "absolute", bottom: 40, left: "50%", transform: `translate(-50%, ${Math.abs(Math.sin(f / 6)) * 30}px)`, fontFamily: EMOJI, fontSize: 130 }}>👇</div>
      <Tuni size={230} talking={f > sc.voAt && f < sc.voAt + sc.voFrames} x={60} y={800} />
    </AbsoluteFill>
  );
};

// ABC গান: সব অক্ষর একে একে জ্বলে ওঠে
const Song: React.FC<{ sp: Spec; sc: Scene }> = ({ sp, sc }) => {
  const f = useCurrentFrame(), { fps } = useVideoConfig();
  const L: string[] = sc.letters, n = L.length, on = Math.floor(interpolate(f, [sc.voAt + 6, sc.voAt + sc.voFrames - 10], [0, n], clamp));
  const COLS = ["#FF6B6B", "#FF9F1C", "#FFC93C", "#22B573", "#4D7CFE", "#9B5DE5", "#FF6B8B"];
  return (
    <AbsoluteFill>
      <div style={{ position: "absolute", top: 50, width: "100%", textAlign: "center", fontFamily: BN, fontWeight: 800, fontSize: 84, color: "#fff", textShadow: "0 6px 0 #3A7BD5" }}>🎵 ABC গান — সবাই মিলে!</div>
      <div style={{ position: "absolute", top: 200, left: 140, right: 140, display: "grid", gridTemplateColumns: "repeat(9, 1fr)", gap: 22 }}>
        {L.map((x, i) => {
          const lit = i < on, cur = i === on - 1;
          return <div key={i} style={{ height: 170, borderRadius: 36, background: lit ? COLS[i % COLS.length] : "#fff", color: lit ? "#fff" : "#C9C2E6", display: "grid", placeItems: "center", fontFamily: FRED, fontWeight: 700, fontSize: 120, transform: `scale(${(pop(f, fps, 4 + i) * (cur ? 1.18 : 1))}) translateY(${cur ? -16 : 0}px)`, boxShadow: "0 10px 0 rgba(42,27,92,.14)" }}>{x}</div>;
        })}
      </div>
      <Tuni size={220} talking={f > sc.voAt && f < sc.voAt + sc.voFrames} x={1660} y={820} />
    </AbsoluteFill>
  );
};

// ভাষার জাদু: এক ছবি, তিন ভাষার কার্ড — যে ভাষায় বলা হচ্ছে সেই কার্ড জ্বলে ওঠে
const LANG_LABEL: Record<string, string> = { bn: "বাংলা", en: "English", ar: "আরবি" };
const partStarts = (sc: Scene) => { const out: number[] = []; let t = sc.voAt; for (const pf of sc.partFrames || []) { out.push(t); t += pf + 5; } return out; };
const Word3: React.FC<{ sp: Spec; sc: Scene }> = ({ sp, sc }) => {
  const f = useCurrentFrame(), { fps } = useVideoConfig();
  const ps = partStarts(sc), parts: Part[] = sc.vo;
  const langs = ["bn", "en", "ar"], firstOf = (lg: string) => { const i = parts.findIndex((p) => p.v === lg && p.card); return i < 0 ? sc.voAt + 20 : ps[i]; };
  const playingLang = (() => { for (let i = ps.length - 1; i >= 0; i--) if (f >= ps[i]) return f < ps[i] + (sc.partFrames[i] || 0) && parts[i].card ? parts[i].v : ""; return ""; })();
  return (
    <AbsoluteFill>
      <Sequence from={2} durationInFrames={20}><Audio src={staticFile("kids/_shared/pop.mp3")} volume={0.45} /></Sequence>
      <div style={{ position: "absolute", left: 660, top: 50, width: 600, height: 420, borderRadius: 70, background: "#fff", boxShadow: "0 18px 0 rgba(42,27,92,.12)", display: "grid", placeItems: "center", transform: `scale(${pop(f, fps, 2)})` }}>
        <div style={{ fontFamily: EMOJI, fontSize: 280, lineHeight: 1, transform: `translateY(${Math.sin(f / 8) * 12}px) rotate(${Math.sin(f / 11) * 5}deg)` }}>{sc.pic}</div>
      </div>
      <div style={{ position: "absolute", top: 540, left: 0, right: 0, display: "flex", justifyContent: "center", gap: 40 }}>
        {langs.map((lg) => {
          const at = firstOf(lg), s = pop(f, fps, at), hot = playingLang === lg;
          return (
            <div key={lg} style={{ width: 500, height: 300, borderRadius: 50, background: hot ? sp.color : "#fff", color: hot ? "#fff" : INK, transform: `scale(${s * (hot ? 1.08 : 1)}) translateY(${hot ? -14 : 0}px)`, boxShadow: "0 14px 0 rgba(42,27,92,.14)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 6 }}>
              <div style={{ fontFamily: BN, fontWeight: 700, fontSize: 40, opacity: 0.8 }}>{LANG_LABEL[lg]}</div>
              <div style={{ fontFamily: lg === "ar" ? NASKH : lg === "en" ? FRED : BN, fontWeight: 700, fontSize: lg === "ar" ? 100 : 96, lineHeight: 1.15, direction: lg === "ar" ? "rtl" : "ltr" }}>{sc[lg]}</div>
              {lg === "ar" ? <div style={{ fontFamily: BN, fontWeight: 700, fontSize: 40, opacity: 0.85 }}>{sc.tr}</div> : null}
            </div>
          );
        })}
      </div>
      <Tuni size={220} talking={f > sc.voAt && f < sc.voAt + sc.voFrames} x={70} y={160} />
    </AbsoluteFill>
  );
};

// তিন ভাষার রিক্যাপ: ৪টি ছবি, একে একে
const Recap3: React.FC<{ sp: Spec; sc: Scene }> = ({ sp, sc }) => {
  const f = useCurrentFrame(), { fps } = useVideoConfig();
  const W: any[] = sc.words, n = W.length, on = Math.min(n - 1, Math.floor(interpolate(f, [sc.voAt + sc.voFrames * 0.12, sc.voAt + sc.voFrames], [0, n], clamp)));
  return (
    <AbsoluteFill>
      <div style={{ position: "absolute", top: 70, width: "100%", textAlign: "center", fontFamily: BN, fontWeight: 800, fontSize: 84, color: "#fff", textShadow: "0 6px 0 #3A7BD5" }}>এবার একসাথে বলি!</div>
      <div style={{ position: "absolute", top: 240, left: 0, right: 0, display: "flex", justifyContent: "center", gap: 36 }}>
        {W.map((w, i) => {
          const hot = f > sc.voAt + sc.voFrames * 0.12 && i === on;
          return (
            <div key={i} style={{ width: 400, height: 560, borderRadius: 56, background: hot ? sp.color : "#fff", color: hot ? "#fff" : INK, transform: `scale(${pop(f, fps, 6 + i * 6) * (hot ? 1.06 : 1)}) translateY(${hot ? -20 : 0}px)`, boxShadow: "0 16px 0 rgba(42,27,92,.14)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 8 }}>
              <div style={{ fontFamily: EMOJI, fontSize: 170, lineHeight: 1.1 }}>{w.pic}</div>
              <div style={{ fontFamily: BN, fontWeight: 800, fontSize: 64 }}>{w.bn}</div>
              <div style={{ fontFamily: FRED, fontWeight: 700, fontSize: 58 }}>{w.en}</div>
              <div style={{ fontFamily: NASKH, fontWeight: 700, fontSize: 66, direction: "rtl" }}>{w.ar}</div>
            </div>
          );
        })}
      </div>
      <Tuni size={200} talking={f > sc.voAt && f < sc.voAt + sc.voFrames} x={60} y={840} />
    </AbsoluteFill>
  );
};

const VIEW: Record<string, React.FC<{ sp: Spec; sc: Scene }>> = { intro: Intro, letter: Letter, recap: Recap, quiz: Quiz, next: Next, song: Song, word3: Word3, recap3: Recap3, outro: Outro };

export const KidsVideo: React.FC<{ spec: Spec }> = ({ spec }) => {
  const f = useCurrentFrame();
  let at = 0;
  return (
    <AbsoluteFill style={{ fontFamily: BN }}>
      <Sky />
      <Audio src={staticFile("kids/_shared/music.mp3")} loop volume={(fr) => interpolate(fr, [0, 20, spec.total - 40, spec.total], [0, 0.11, 0.11, 0], clamp)} />
      {spec.scenes.map((sc, i) => {
        const from = at; at += sc.frames;
        const V = VIEW[sc.type];
        const local = f - from, inS = interpolate(local, [0, 10], [0, 1], { ...clamp, easing: Easing.out(Easing.cubic) }), outS = interpolate(local, [sc.frames - 8, sc.frames], [1, 0], clamp);
        return (
          <Sequence key={i} from={from} durationInFrames={sc.frames}>
            <AbsoluteFill style={{ opacity: Math.min(inS, i === spec.scenes.length - 1 ? 1 : outS), transform: `translateX(${(1 - inS) * 80}px)` }}>
              <Sequence from={sc.voAt}><Audio src={staticFile(sc.audio)} /></Sequence>
              {V ? <V sp={spec} sc={sc} /> : null}
            </AbsoluteFill>
          </Sequence>
        );
      })}
      <div style={{ position: "absolute", right: 40, top: 34, background: "rgba(255,255,255,.9)", borderRadius: 99, padding: "8px 26px", fontFamily: FRED, fontWeight: 700, fontSize: 30, color: INK }}>AI University <span style={{ color: "#FF6B8B" }}>Kids</span></div>
    </AbsoluteFill>
  );
};
