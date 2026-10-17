// "কচু বিজ্ঞানী" course promo — same chalkboard world as the lessons. Comps: VelkiPromo (1920×1080) + VelkiReel (1080×1920, ≤30 s).
// Spec: public/velki/promo/props.json (scenes with vo + frames + amp, written by scripts/velki_promo.py).
import React from "react";
import { AbsoluteFill, Audio, Img, Sequence, interpolate, staticFile, useCurrentFrame, useVideoConfig, random } from "remotion";
import { Prof, NamePlate, Board, Frame, ChalkDefs, Chalk, Pop, Rise, SFX, Icon } from "./VelkiEngine";
import { FIGS, CH, FONT } from "./diagrams";

const BN = "Anek";
const cl = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
export type PScene = { type: string; vo: string; frames: number; amp?: string; [k: string]: any };
export type PSpec = { dir?: string; scenes: PScene[] };
const LEAD = 6, TAIL = 8;
export const pLen = (s: PScene) => LEAD + s.frames + TAIL;
export const promoLen = (spec: PSpec) => spec.scenes.reduce((n, s) => n + pLen(s), 0) + 45;
const amp = (env: string | undefined, i: number) => (env && i >= 0 && i < env.length ? (env.charCodeAt(i) - 48) / 9 : 0);
const useV = () => { const { width, height } = useVideoConfig(); return height > width; };

const Fig: React.FC<{ name: string; s: PScene; x: number; y: number; w: number; from?: number; to?: number }> = ({ name, s, x, y, w, from = 0, to = 1 }) => {
  const f = useCurrentFrame(); const F = FIGS[name];
  const p = interpolate(f, [LEAD + s.frames * from, LEAD + s.frames * to], [0, 1], cl);
  return <svg style={{ position: "absolute", left: x, top: y, overflow: "visible" }} width={w} height={w * 0.7} viewBox="0 0 1000 700"><F p={p} t={f} /></svg>;
};
const Talker: React.FC<{ s: PScene; size: number; x: number; y: number; pose?: any }> = ({ s, size, x, y, pose = "point" }) => {
  const f = useCurrentFrame();
  return <div style={{ position: "absolute", left: x, top: y }}><Pop d={0}><Prof size={size} a={amp(s.amp, f - LEAD)} pose={pose} /></Pop>
    <div style={{ position: "absolute", left: 0, right: 0, bottom: -8, display: "flex", justifyContent: "center" }}><NamePlate big={size > 400} /></div></div>;
};

const Questions: React.FC<{ s: PScene }> = ({ s }) => {
  const f = useCurrentFrame(); const V = useV(); const qs: string[] = s.qs;
  return <AbsoluteFill>{qs.map((q, i) => { const at = LEAD + (s.frames * i) / qs.length; const k = interpolate(f, [at, at + 8], [0, 1], cl);
    return <div key={i} style={{ position: "absolute", left: V ? 80 : 160 + i * 90, right: V ? 80 : undefined, top: V ? 420 + i * 300 : 230 + i * 220, opacity: k, transform: `scale(${0.6 + 0.4 * k}) rotate(${(i % 2 ? 2 : -2) * k}deg)`, transformOrigin: "left center" }}>
      <Chalk size={V ? 92 : 100} at={at} dur={14} color={[CH.c, CH.y, CH.p][i % 3]}>{q}</Chalk></div>; })}
    {qs.map((_, i) => <SFX key={i} at={LEAD + (s.frames * i) / qs.length} name="pop" vol={0.3} />)}
  </AbsoluteFill>;
};
const Reveal: React.FC<{ s: PScene }> = ({ s }) => {
  const V = useV(); const f = useCurrentFrame();
  return <AbsoluteFill>
    <div style={{ position: "absolute", inset: 0, background: "#fff", opacity: interpolate(f, [0, 3, 14], [0, 0.6, 0], cl) }} />
    <Talker s={s} size={V ? 620 : 520} x={V ? 230 : 140} y={V ? 980 : 330} pose="wave" />
    <div style={{ position: "absolute", left: V ? 70 : 800, right: V ? 70 : 100, top: V ? 280 : 300, textAlign: V ? "center" : "left" }}>
      <Pop d={4}><div style={{ display: "inline-block", padding: "8px 26px 12px", background: CH.y, color: "#2b2210", fontFamily: FONT, fontSize: V ? 44 : 40, borderRadius: 12, transform: "rotate(-2deg)" }}>নতুন কোর্স · AI University</div></Pop>
      <Chalk size={V ? 150 : 150} at={10} dur={20} color={CH.w} style={{ marginTop: 30 }}>কচু বিজ্ঞানী</Chalk>
      <Chalk size={V ? 64 : 64} at={30} dur={18} color={CH.c} style={{ marginTop: 10 }}>বিজ্ঞানী না হও, বিজ্ঞান জানবে</Chalk>
    </div>
    <SFX at={2} name="hit" vol={0.35} /><SFX at={10} name="whoosh" vol={0.25} />
  </AbsoluteFill>;
};
const Montage: React.FC<{ s: PScene }> = ({ s }) => {
  const V = useV(); const f = useCurrentFrame(); const figs: string[] = s.figs; const labels: string[] = s.labels;
  const n = figs.length; const seg = s.frames / n; const i = Math.min(n - 1, Math.max(0, Math.floor((f - LEAD) / seg)));
  const w = V ? 980 : 1240;
  return <AbsoluteFill>
    <div key={i} style={{ position: "absolute", inset: 0, opacity: interpolate(f - LEAD - i * seg, [0, 6], [0, 1], cl) }}>
      <svg style={{ position: "absolute", left: V ? 50 : 560, top: V ? 520 : 200, overflow: "visible" }} width={w} height={w * 0.7} viewBox="0 0 1000 700">
        {React.createElement(FIGS[figs[i]], { p: interpolate(f - LEAD - i * seg, [0, seg * 0.95], [0.15, 1], cl), t: f })}</svg>
      <div style={{ position: "absolute", left: V ? 0 : 560, right: V ? 0 : 120, top: V ? 300 : 110, textAlign: "center" }}><Chalk size={V ? 80 : 64} at={LEAD + i * seg} dur={10} color={[CH.y, CH.c, CH.p, CH.g, CH.o][i % 5]}>{labels[i]}</Chalk></div>
    </div>
    {!V && <Talker s={s} size={330} x={80} y={600} />}
    {V && <Talker s={s} size={360} x={360} y={1340} />}
    {figs.map((_, j) => <SFX key={j} at={LEAD + j * seg} name="whoosh" vol={0.15} />)}
  </AbsoluteFill>;
};
const Lab: React.FC<{ s: PScene }> = ({ s }) => {
  const V = useV(); const f = useCurrentFrame(); const steps: string[] = s.steps;
  return <AbsoluteFill>
    {!V && <Talker s={s} size={340} x={70} y={580} />}
    <div style={{ position: "absolute", left: V ? 60 : 520, right: V ? 60 : 140, top: V ? 260 : 150 }}>
      <Pop d={2}><span style={{ display: "inline-flex", gap: 12, alignItems: "center", padding: "8px 26px 12px", borderRadius: 14, background: CH.c, color: "#0E2A33", fontFamily: FONT, fontSize: V ? 52 : 44 }}><Icon n="notebook-pen" size={44} color="#0E2A33" />খাতা-কলমে বিজ্ঞানী</span></Pop>
      <div style={{ marginTop: 30, padding: "34px 40px 34px 110px", background: "#FFFBEF", borderRadius: 12, transform: "rotate(-1deg)", boxShadow: "0 30px 60px rgba(0,0,0,.45)", position: "relative",
        backgroundImage: "linear-gradient(90deg, transparent 80px, #E85D5D88 80px, #E85D5D88 83px, transparent 83px), linear-gradient(rgba(60,120,200,.16) 1.5px, transparent 1.5px)", backgroundSize: "100% 100%, 100% 48px" }}>
        {steps.map((t, j) => { const at = LEAD + (s.frames * (0.1 + 0.8 * j / steps.length)); const k = interpolate(f, [at, at + 8], [0, 1], cl);
          return <div key={j} style={{ display: "flex", gap: 18, alignItems: "center", marginBottom: 18, opacity: k }}>
            <div style={{ width: 46, height: 46, borderRadius: 8, border: "3px solid #24324A", display: "grid", placeItems: "center", background: f > at + 14 ? "#D9F7CF" : "transparent", fontSize: 32, color: "#1E8A3A", fontWeight: 900 }}>{f > at + 14 ? "✓" : ""}</div>
            <div style={{ fontFamily: BN, fontWeight: 700, fontSize: V ? 46 : 42, color: "#24324A" }}>{t}</div></div>; })}
      </div>
    </div>
    {V && <Talker s={s} size={380} x={350} y={1300} />}
  </AbsoluteFill>;
};
const Wow: React.FC<{ s: PScene }> = ({ s }) => {
  const V = useV(); const f = useCurrentFrame();
  return <AbsoluteFill>
    <div style={{ position: "absolute", inset: 0, background: "#fff", opacity: interpolate(f, [2, 6, 16], [0, 0.5, 0], cl) }} />
    <div style={{ position: "absolute", left: V ? 60 : 640, right: V ? 60 : 120, top: V ? 300 : 200, textAlign: "center" }}>
      <Pop d={2} rot={-6}><span style={{ display: "inline-block", padding: "6px 30px 12px", borderRadius: 14, background: CH.p, color: "#3a1020", fontFamily: FONT, fontSize: 56 }}>ভেলকি!</span></Pop>
      <Chalk size={V ? 74 : 72} at={8} dur={20} color={CH.y} style={{ marginTop: 30 }}>{s.text}</Chalk>
    </div>
    <Fig name="seasons" s={s} x={V ? 60 : 700} y={V ? 760 : 470} w={V ? 960 : 900} from={0.05} to={0.9} />
    <Talker s={s} size={V ? 360 : 360} x={V ? 360 : 90} y={V ? 1420 : 560} pose={f < LEAD + s.frames * 0.3 ? "wow" : "point"} />
    <SFX at={2} name="hit" vol={0.3} />
  </AbsoluteFill>;
};
const Feats: React.FC<{ s: PScene }> = ({ s }) => {
  const V = useV(); const f = useCurrentFrame(); const items: { icon: string; t: string }[] = s.items;
  return <AbsoluteFill>
    {!V && <Talker s={s} size={330} x={80} y={600} pose="wave" />}
    <div style={{ position: "absolute", left: V ? 60 : 520, right: V ? 60 : 120, top: V ? 300 : 170, display: "grid", gridTemplateColumns: V ? "1fr" : "1fr 1fr", gap: 26 }}>
      {items.map((it, j) => { const at = LEAD + s.frames * (0.05 + 0.85 * j / items.length); const k = interpolate(f, [at, at + 8], [0, 1], cl);
        return <div key={j} style={{ display: "flex", gap: 20, alignItems: "center", padding: "22px 26px", borderRadius: 20, border: `3px dashed ${[CH.y, CH.c, CH.p, CH.g, CH.o][j % 5]}`, background: "rgba(255,255,255,.06)", opacity: k, transform: `scale(${0.8 + 0.2 * k})` }}>
          <div style={{ width: 72, height: 72, borderRadius: 18, background: [CH.y, CH.c, CH.p, CH.g, CH.o][j % 5], display: "grid", placeItems: "center", flex: "none" }}><Icon n={it.icon} size={42} color="#14302a" /></div>
          <div style={{ fontFamily: BN, fontWeight: 700, fontSize: V ? 46 : 40, color: CH.w }}>{it.t}</div></div>; })}
    </div>
    {V && <Talker s={s} size={380} x={350} y={1300} pose="wave" />}
    {items.map((_, j) => <SFX key={j} at={LEAD + s.frames * (0.05 + 0.85 * j / items.length)} name="pop" vol={0.2} />)}
  </AbsoluteFill>;
};
const Cta: React.FC<{ s: PScene }> = ({ s }) => {
  const V = useV();
  return <AbsoluteFill>
    <Talker s={s} size={V ? 560 : 480} x={V ? 260 : 120} y={V ? 1060 : 400} pose="wave" />
    <div style={{ position: "absolute", left: V ? 60 : 760, right: V ? 60 : 100, top: V ? 260 : 220, textAlign: V ? "center" : "left" }}>
      <Chalk size={V ? 130 : 120} at={2} dur={16}>কচু বিজ্ঞানী</Chalk>
      <Pop d={16}><div style={{ display: "inline-block", marginTop: 24, padding: "14px 34px 18px", borderRadius: 18, background: CH.g, color: "#123018", fontFamily: FONT, fontSize: V ? 58 : 52 }}>ফ্রি · শেয়ার করেই পুরো কোর্স</div></Pop>
      <Rise d={30}><div style={{ marginTop: 34, fontFamily: "Montserrat", fontWeight: 800, fontSize: V ? 58 : 56, color: CH.y }}>aiuniversitybd.com</div></Rise>
      <Rise d={40}><div style={{ marginTop: 30, display: "flex", gap: 20, alignItems: "center", justifyContent: V ? "center" : "flex-start" }}><Img src={staticFile("brand/logo-dark.png")} style={{ height: V ? 90 : 80 }} />
        <span style={{ fontFamily: BN, fontSize: 26, color: CH.dim, textAlign: "left" }}>প্রফেসর চমক একজন এআই প্রশিক্ষক</span></div></Rise>
    </div>
    <SFX at={2} name="swell" vol={0.3} />
  </AbsoluteFill>;
};
const SC: Record<string, React.FC<{ s: PScene }>> = { questions: Questions, reveal: Reveal, montage: Montage, lab: Lab, wow: Wow, feats: Feats, cta: Cta };

const Caption: React.FC<{ s: PScene }> = ({ s }) => {
  const f = useCurrentFrame(); const V = useV(); const lf = f - LEAD;
  if (lf < 0 || lf > s.frames || s.type === "questions" || s.type === "reveal" || s.type === "cta") return null;
  const parts = s.vo.split(/(?<=[।?!,])\s+/).filter(Boolean); const tot = parts.reduce((n, x) => n + x.length, 0); let acc = 0;
  const cur = parts.map((x) => { const a = (acc / tot) * s.frames; acc += x.length; return { x, a, b: (acc / tot) * s.frames }; }).find((c) => lf >= c.a && lf < c.b + 4);
  if (!cur) return null;
  return <div style={{ position: "absolute", left: V ? 50 : 420, right: V ? 50 : 100, bottom: V ? 120 : 64, display: "flex", justifyContent: "center" }}>
    <div style={{ padding: "8px 24px 12px", borderRadius: 14, background: "rgba(10,24,20,.82)", fontFamily: BN, fontWeight: 600, fontSize: V ? 44 : 34, color: "#F4F1E8", textAlign: "center", lineHeight: 1.3 }}>{cur.x.replace(/[।,]$/, "")}</div></div>;
};

export const VelkiPromoVideo: React.FC<{ spec: PSpec }> = ({ spec }) => {
  const f = useCurrentFrame(); const total = promoLen(spec);
  let from = 0; const seqs = spec.scenes.map((s) => { const st = from; from += pLen(s); return { s, st }; });
  return <AbsoluteFill style={{ background: "#142A24" }}>
    <ChalkDefs /><Board />
    {seqs.map(({ s, st }, i) => { const C = SC[s.type]; return <Sequence key={i} from={st} durationInFrames={pLen(s) + (i === seqs.length - 1 ? 45 : 0)}>
      <C s={s} /><Caption s={s} /><Sequence from={LEAD}><Audio src={staticFile(`velki/${spec.dir || "promo"}/vo/${String(i + 1).padStart(2, "0")}.mp3`)} /></Sequence></Sequence>; })}
    <Frame />
    <Audio src={staticFile("velki/music.mp3")} volume={(fr) => 0.16 * interpolate(fr, [0, 20, total - 45, total], [0, 1, 1, 0], cl)} />
  </AbsoluteFill>;
};
