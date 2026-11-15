// AI University — Pocket-course video engine (warm, playful style; one JSON spec per course, timed by scripts/pocket_make.py).
// Scenes: intro (Veo clip + title + trainer card) · need (animated checklist) · step (photo with camera move to the hotspot,
// glowing ring, step number, title, tip) · outro (Veo clip + "আপনি তৈরি!" + CTA).  Music/SFX from public/aiu2, VO public/pocket/<id>/vo.
import React from "react";
import { AbsoluteFill, Audio, Img, OffthreadVideo, Sequence, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig, Easing, delayRender, continueRender } from "remotion";
import { icons, Sparkles, Lightbulb, Check, CircleCheck } from "lucide-react";

const BN = "Anek", EN = "Montserrat";
if (typeof document !== "undefined") {
  for (const [n, u] of [["Anek", "fonts/AnekBangla.ttf"], ["Montserrat", "fonts/Montserrat.ttf"]]) {
    // hold the render until the font is in: cloud runners don't have Anek Bangla installed, so frames rendered before it loads fall back to another font
    const h = delayRender(`font ${n}`);
    const f = new FontFace(n, `url(${staticFile(u)})`, { weight: "100 900" });
    f.load().then(() => { document.fonts.add(f); continueRender(h); }).catch(() => continueRender(h));
  }
}
const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const ease = Easing.bezier(0.16, 1, 0.3, 1);
const bn = (n: number | string) => String(n).replace(/\d/g, (d) => "০১২৩৪৫৬৭৮৯"[+d]);
const ent = (f: number, fps: number, d: number, dur = 24) => spring({ frame: f - d, fps, config: { damping: 200 }, durationInFrames: dur });
const pop = (f: number, fps: number, d: number) => spring({ frame: f - d, fps, config: { damping: 11, mass: 0.6 } });
const pascal = (k: string) => k.split("-").map((w) => w[0].toUpperCase() + w.slice(1)).join("");
const Ico: React.FC<{ name: string; size: number; color: string }> = ({ name, size, color }) => { const I = (icons as Record<string, React.FC<any>>)[pascal(name)] || Sparkles; return <I size={size} color={color} strokeWidth={2} />; };

export type KScene = { type: string; vo: string; frames: number; [k: string]: any };
export type KSpec = { id: string; title: string; sub: string; trainer: { name: string; tag: string; avatar: string }; color: [string, string]; voice?: string; scenes: KScene[] };
const LEAD = 10, TAIL = 14, FIRST = 24, LAST = 90;
const lens = (s: KSpec) => s.scenes.map((x, i) => (i === 0 ? FIRST : LEAD) + x.frames + (i === s.scenes.length - 1 ? LAST : TAIL));
export const pocketLen = (s: KSpec) => lens(s).reduce((a, b) => a + b, 0);
type P = { s: KScene; spec: KSpec; lead: number; vo: number; len: number; total: number };
const at = (p: P, x: number) => p.lead + p.vo * x;
const GRAD = (c: [string, string]) => `linear-gradient(110deg, ${c[0]}, ${c[1]})`;

/* ---------- shared bits ---------- */
const Trainer: React.FC<{ spec: KSpec; d: number; small?: boolean }> = ({ spec, d, small }) => {
  const f = useCurrentFrame(); const { fps } = useVideoConfig(); const s = ent(f, fps, d, 30); const k = small ? 0.72 : 1;
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 18 * k, padding: `${12 * k}px ${26 * k}px ${12 * k}px ${12 * k}px`, borderRadius: 999, background: "rgba(255,255,255,.94)", boxShadow: "0 20px 50px rgba(0,0,0,.25)", opacity: s, transform: `translateY(${(1 - s) * 40}px)` }}>
      <div style={{ width: 92 * k, height: 92 * k, borderRadius: "50%", padding: 4 * k, background: GRAD(spec.color) }}><Img src={staticFile(spec.trainer.avatar)} style={{ width: "100%", height: "100%", borderRadius: "50%", objectFit: "cover", border: `${3 * k}px solid #fff` }} /></div>
      <div style={{ fontFamily: BN, color: "#2a1630", lineHeight: 1.2 }}>
        <div style={{ fontSize: 22 * k, fontWeight: 700, color: spec.color[0] }}>{spec.trainer.tag}</div>
        <div style={{ fontSize: 34 * k, fontWeight: 800 }}>{spec.trainer.name}</div>
        <div style={{ fontSize: 16 * k, color: "#7a6a80", display: "flex", alignItems: "center", gap: 6 }}><Sparkles size={16 * k} /> এআই প্রশিক্ষক · AI University of Bangladesh</div>
      </div>
    </div>
  );
};
const Bug: React.FC<{ spec: KSpec }> = () => (
  <div style={{ position: "absolute", right: 44, top: 40, padding: "14px 22px 12px", borderRadius: 999, background: "rgba(20,21,27,.62)", backdropFilter: "blur(8px)", boxShadow: "0 8px 30px rgba(0,0,0,.25)" }}><Img src={staticFile("brand/aiu-logo-dark.svg")} style={{ height: 44, display: "block" }} /></div>
);
const Wrap: React.FC<{ len: number; children: React.ReactNode }> = ({ len, children }) => {
  const f = useCurrentFrame();
  const i = interpolate(f, [0, 12], [0, 1], { ...clamp, easing: ease }), o = interpolate(f, [len - 10, len], [1, 0], clamp);
  return <AbsoluteFill style={{ opacity: Math.min(i, o) }}>{children}</AbsoluteFill>;
};

const Media: React.FC<{ s: KScene; len: number }> = ({ s, len }) => {
  const f = useCurrentFrame();
  if (s.clip) return <OffthreadVideo src={staticFile(s.clip)} muted style={{ width: "100%", height: "100%", objectFit: "cover" }} />;
  const z = interpolate(f, [0, len], [1.04, 1.16]);
  return <Img src={staticFile(s.img)} style={{ width: "100%", height: "100%", objectFit: "cover", transform: `scale(${z}) translateX(${interpolate(f, [0, len], [0, -1.5])}%)` }} />;
};

/* ---------- scenes ---------- */
const SIntro: React.FC<P> = (p) => {
  const f = useCurrentFrame(); const { fps } = useVideoConfig(); const { spec, s } = p;
  const t1 = ent(f, fps, at(p, 0.05), 30), t2 = ent(f, fps, at(p, 0.15), 30);
  return (
    <AbsoluteFill>
      <Media s={s} len={p.len} />
      <AbsoluteFill style={{ background: "linear-gradient(90deg, rgba(42,22,48,.82) 0%, rgba(42,22,48,.45) 40%, transparent 65%)" }} />
      <div style={{ position: "absolute", left: 110, top: 200, width: 820 }}>
        <div style={{ display: "inline-flex", alignItems: "center", gap: 10, padding: "10px 22px", borderRadius: 99, background: GRAD(spec.color), color: "#fff", fontFamily: BN, fontWeight: 800, fontSize: 30, transform: `scale(${pop(f, fps, 6)})` }}><Sparkles size={28} /> পকেট কোর্স</div>
        <div style={{ fontFamily: BN, fontWeight: 800, fontSize: 112, color: "#fff", lineHeight: 1.1, marginTop: 26, opacity: t1, transform: `translateY(${(1 - t1) * 60}px)`, textShadow: "0 8px 30px rgba(0,0,0,.4)" }}>{spec.title}</div>
        <div style={{ fontFamily: BN, fontWeight: 600, fontSize: 46, color: "#ffd9a8", marginTop: 12, opacity: t2, transform: `translateY(${(1 - t2) * 40}px)` }}>{spec.sub}</div>
      </div>
      <div style={{ position: "absolute", left: 110, bottom: 150 }}><Trainer spec={spec} d={at(p, 0.3)} /></div>
    </AbsoluteFill>
  );
};
const SNeed: React.FC<P> = (p) => {
  const f = useCurrentFrame(); const { fps } = useVideoConfig(); const { spec, s } = p;
  const n = s.items.length;
  return (
    <AbsoluteFill>
      <Img src={staticFile(s.bg)} style={{ width: "100%", height: "100%", objectFit: "cover", filter: "blur(14px) brightness(.55)", transform: "scale(1.1)" }} />
      <AbsoluteFill style={{ background: "linear-gradient(135deg, rgba(42,22,48,.6), rgba(42,22,48,.2))" }} />
      <div style={{ position: "absolute", left: 120, top: 120, fontFamily: BN, fontWeight: 800, fontSize: 72, color: "#fff", opacity: ent(f, fps, 4) }}>শুরুর আগে হাতের কাছে রাখুন</div>
      <div style={{ position: "absolute", left: 120, right: 120, top: 280, display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 26 }}>
        {s.items.map(([icon, t]: string[], i: number) => {
          const d = at(p, 0.05 + (i / n) * 0.8), q = pop(f, fps, d), done = f > d + 18;
          return (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: 20, padding: "26px 28px", borderRadius: 28, background: "rgba(255,255,255,.95)", boxShadow: "0 20px 50px rgba(0,0,0,.25)", transform: `scale(${q}) rotate(${(1 - q) * (i % 2 ? 6 : -6)}deg)`, opacity: Math.min(1, q * 1.4) }}>
              <div style={{ width: 76, height: 76, borderRadius: 22, display: "grid", placeItems: "center", background: GRAD(spec.color), flex: "none" }}><Ico name={icon} size={40} color="#fff" /></div>
              <div style={{ fontFamily: BN, fontWeight: 700, fontSize: 36, color: "#2a1630", lineHeight: 1.25, flex: 1 }}>{t}</div>
              <div style={{ width: 46, height: 46, borderRadius: 14, display: "grid", placeItems: "center", background: done ? "#10b981" : "#efe6f0", transition: "none", flex: "none" }}>{done && <Check size={30} color="#fff" strokeWidth={3.5} />}</div>
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};
const SStep: React.FC<P> = (p) => {
  const f = useCurrentFrame(); const { fps } = useVideoConfig(); const { spec, s } = p;
  const W = 1920, H = 1080;
  // camera: full view → push into the hotspot → hold
  const z = interpolate(f, [at(p, 0.08), at(p, 0.45)], [1, s.zoom || 1.7], { ...clamp, easing: ease });
  const cx = interpolate(z, [1, s.zoom || 1.7], [0.5, s.hx]), cy = interpolate(z, [1, s.zoom || 1.7], [0.5, s.hy]);
  const tx = (0.5 - cx) * W * z, ty = (0.5 - cy) * H * z;
  const ring = pop(f, fps, at(p, 0.42)), num = pop(f, fps, 4), cap = ent(f, fps, 8, 30), tip = pop(f, fps, at(p, 0.55));
  const total = spec.scenes.filter((x) => x.type === "step").length;
  return (
    <AbsoluteFill style={{ background: "#1a0f1f" }}>
      <AbsoluteFill style={{ transform: `translate(${tx}px, ${ty}px) scale(${z})` }}>
        <Img src={staticFile(s.img)} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
        {s.ring !== false && <div style={{ position: "absolute", left: s.hx * W, top: s.hy * H, transform: `translate(-50%,-50%) scale(${ring / z})`, width: 300, height: 300, borderRadius: "50%", border: `8px solid ${spec.color[1]}`, boxShadow: `0 0 0 ${10 + Math.sin(f / 5) * 8}px ${spec.color[1]}55, inset 0 0 40px ${spec.color[1]}55`, opacity: ring }} />}
      </AbsoluteFill>
      <AbsoluteFill style={{ background: "linear-gradient(0deg, rgba(42,22,48,.85) 0%, transparent 40%), linear-gradient(90deg, rgba(42,22,48,.55), transparent 35%)" }} />
      {/* step number + progress */}
      <div style={{ position: "absolute", left: 80, top: 70, display: "flex", alignItems: "center", gap: 20 }}>
        <div style={{ width: 120, height: 120, borderRadius: 34, display: "grid", placeItems: "center", background: GRAD(spec.color), color: "#fff", fontFamily: BN, fontWeight: 800, fontSize: 72, boxShadow: "0 20px 50px rgba(0,0,0,.4)", transform: `scale(${num}) rotate(${(1 - num) * -25}deg)` }}>{bn(s.n)}</div>
        <div style={{ fontFamily: BN, color: "#fff" }}><div style={{ fontSize: 28, opacity: 0.85 }}>ধাপ {bn(s.n)} / {bn(total)}</div>
          <div style={{ display: "flex", gap: 8, marginTop: 10 }}>{Array.from({ length: total }, (_, i) => <div key={i} style={{ width: i + 1 === s.n ? 48 : 22, height: 10, borderRadius: 10, background: i + 1 <= s.n ? spec.color[1] : "rgba(255,255,255,.35)" }} />)}</div></div>
      </div>
      {/* caption */}
      <div style={{ position: "absolute", left: 80, right: 80, bottom: 70, display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: 40 }}>
        <div style={{ opacity: cap, transform: `translateY(${(1 - cap) * 50}px)` }}>
          <div style={{ fontFamily: BN, fontWeight: 800, fontSize: 92, color: "#fff", lineHeight: 1.1, textShadow: "0 8px 30px rgba(0,0,0,.45)" }}>{s.t}</div>
        </div>
        {s.tip && <div style={{ display: "flex", alignItems: "center", gap: 14, padding: "20px 28px", borderRadius: 26, background: "#fff7e6", boxShadow: "0 20px 50px rgba(0,0,0,.3)", maxWidth: 640, transform: `scale(${tip}) translateY(${(1 - tip) * 20}px)`, transformOrigin: "bottom right", opacity: Math.min(1, tip * 1.3) }}>
          <Lightbulb size={42} color="#d97706" style={{ flex: "none" }} /><span style={{ fontFamily: BN, fontWeight: 700, fontSize: 34, color: "#3b2410", lineHeight: 1.3 }}>{s.tip}</span></div>}
      </div>
    </AbsoluteFill>
  );
};
const SOutro: React.FC<P> = (p) => {
  const f = useCurrentFrame(); const { fps } = useVideoConfig(); const { spec, s } = p;
  const big = pop(f, fps, at(p, 0.02)), cta = pop(f, fps, at(p, 0.62));
  const conf = Array.from({ length: 36 }, (_, i) => i);
  return (
    <AbsoluteFill>
      <Media s={s} len={p.len} />
      <AbsoluteFill style={{ background: "linear-gradient(90deg, rgba(42,22,48,.85) 0%, rgba(42,22,48,.4) 45%, transparent 70%)" }} />
      {conf.map((i) => { const x = ((i * 137) % 100) / 100, sp = 0.6 + ((i * 53) % 10) / 12, y = ((f - at(p, 0)) * 6 * sp + i * 40) % 1300 - 120; const c = [spec.color[0], spec.color[1], "#fff", "#7c3aed"][i % 4];
        return <div key={i} style={{ position: "absolute", left: x * 1920, top: y, width: 14, height: 26, borderRadius: 4, background: c, transform: `rotate(${(f + i * 20) * 6}deg)`, opacity: interpolate(f, [at(p, 0), at(p, 0) + 10, p.len - 40, p.len], [0, 0.9, 0.9, 0], clamp) }} />; })}
      <div style={{ position: "absolute", left: 110, top: 230, width: 1150 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 18, transform: `scale(${big})`, transformOrigin: "left center" }}><CircleCheck size={86} color="#3ddc97" strokeWidth={2.4} style={{ flex: "none" }} /><span style={{ fontFamily: BN, fontWeight: 800, fontSize: (s.head || "").length > 12 ? 88 : 120, whiteSpace: "nowrap", color: "#fff", textShadow: "0 10px 30px rgba(0,0,0,.4)" }}>{s.head || "আপনি তৈরি!"}</span></div>
        <div style={{ fontFamily: BN, fontWeight: 600, fontSize: 44, color: "#ffd9a8", marginTop: 18, opacity: ent(f, fps, at(p, 0.2)) }}>{s.sub || "কয়েকবার পরলেই ৫ মিনিটে হয়ে যাবে"}</div>
        <div style={{ marginTop: 50, display: "inline-flex", alignItems: "center", gap: 14, padding: "24px 40px", borderRadius: 26, background: GRAD(spec.color), color: "#fff", fontFamily: BN, fontWeight: 800, fontSize: 42, boxShadow: `0 20px 60px ${spec.color[0]}88`, transform: `scale(${cta * (1 + Math.sin(f / 7) * 0.02)})`, opacity: cta }}>কুইজ দিয়ে নিন পকেট সার্টিফিকেট</div>
      </div>
      <div style={{ position: "absolute", left: 110, bottom: 110 }}><Trainer spec={spec} d={at(p, 0.4)} small /></div>
      {/* brand end card (brand C: ink + white wordmark with the orange caret) */}
      <div style={{ position: "absolute", right: 110, bottom: 118, display: "flex", alignItems: "center", gap: 26, padding: "26px 38px", borderRadius: 28, background: "rgba(20,21,27,.78)", boxShadow: "0 24px 70px rgba(0,0,0,.35)", opacity: ent(f, fps, at(p, 0.5)), transform: `translateY(${(1 - ent(f, fps, at(p, 0.5))) * 40}px)` }}>
        <Img src={staticFile("brand/aiu-logo-dark.svg")} style={{ height: 70, display: "block" }} />
        <div style={{ width: 2, height: 64, background: "rgba(255,255,255,.25)" }} />
        <div style={{ fontFamily: EN, fontWeight: 700, fontSize: 34, color: "#fff", letterSpacing: 0.5 }}>aiuniversitybd.com</div>
      </div>
    </AbsoluteFill>
  );
};
const MAP: Record<string, React.FC<P>> = { intro: SIntro, need: SNeed, step: SStep, outro: SOutro };
const SFX: Record<string, [string, number, number][]> = { intro: [["hit", 0, 0.6], ["chime", -0.3, 0.35]], need: [["whoosh", 0, 0.4]], step: [["whoosh", 0, 0.35], ["pop", -0.42, 0.45]], outro: [["hit", 0, 0.6], ["chime", -0.6, 0.45]] };

/* ---------- subtitles ---------- */
const Subs: React.FC<{ spec: KSpec; starts: number[] }> = ({ spec, starts }) => {
  const f = useCurrentFrame();
  const cs = spec.scenes.flatMap((sc, i) => {
    const lead = i === 0 ? FIRST : LEAD;
    const parts = (sc.sv || sc.vo).split(/(?<=[।?!,—])\s+/).reduce<string[]>((a, s) => { if (a.length && (a[a.length - 1].length < 22 || s.length < 10)) a[a.length - 1] += " " + s; else a.push(s); return a; }, []);
    const total = parts.reduce((n, s) => n + s.length, 0); let acc = 0;
    return parts.map((s) => { const from = starts[i] + lead + (sc.frames * acc) / total; acc += s.length; return { s, from, to: starts[i] + lead + (sc.frames * acc) / total, step: sc.type === "step" }; });
  });
  const c = cs.find((x) => f >= x.from && f < x.to + 4); if (!c) return null;
  const o = interpolate(f, [c.from, c.from + 5, c.to, c.to + 4], [0, 1, 1, 0], clamp);
  return <div style={{ position: "absolute", left: 0, right: 0, top: c.step ? 210 : undefined, bottom: c.step ? undefined : 36, display: "flex", justifyContent: c.step ? "flex-start" : "center", paddingLeft: c.step ? 80 : 0, opacity: o }}><div style={{ maxWidth: 1100, padding: "10px 24px 14px", borderRadius: 14, background: "rgba(42,22,48,.7)", fontFamily: BN, fontSize: 34, fontWeight: 500, color: "#fff", lineHeight: 1.35 }}>{c.s.replace(/[।,]$/, "")}</div></div>;
};

export const PocketVideo: React.FC<{ spec: KSpec }> = ({ spec }) => {
  const L = lens(spec); const starts = L.reduce<number[]>((a, _, i) => [...a, i ? a[i - 1] + L[i - 1] : 0], []); const total = pocketLen(spec);
  const musicVol = (fr: number) => { let sp = false; spec.scenes.forEach((sc, i) => { const s0 = starts[i] + (i === 0 ? FIRST : LEAD); if (fr >= s0 - 8 && fr <= s0 + sc.frames + 4) sp = true; }); return (sp ? 0.12 : 0.36) * interpolate(fr, [0, 30], [0, 1], clamp) * interpolate(fr, [total - 70, total], [1, 0], clamp); };
  return (
    <AbsoluteFill style={{ background: "#1a0f1f" }}>
      {spec.scenes.map((sc, i) => {
        const S = MAP[sc.type]; const lead = i === 0 ? FIRST : LEAD;
        const p: P = { s: sc, spec, lead, vo: sc.frames, len: L[i], total };
        return (
          <Sequence key={i} from={starts[i]} durationInFrames={L[i]}>
            <Wrap len={L[i]}>{S ? <S {...p} /> : null}</Wrap>
            <Sequence from={lead}><Audio src={staticFile(`pocket/${spec.id}/vo/${String(i + 1).padStart(2, "0")}.mp3`)} /></Sequence>
            {(SFX[sc.type] || []).map(([n, o, v], k) => <Sequence key={k} from={Math.max(0, Math.round(o < 0 ? lead + sc.frames * -o : o))}><Audio src={staticFile(`aiu2/${n}.mp3`)} volume={v} /></Sequence>)}
          </Sequence>
        );
      })}
      <Bug spec={spec} />
      <Subs spec={spec} starts={starts} />
      <Audio src={staticFile("aiu2/music.mp3")} volume={musicVol} />
    </AbsoluteFill>
  );
};
