// Promo4 — free-course promos (2026-10-17): snake-rescue (field guide) · family-health (calm clinic) · driving (night road).
// One engine, two shapes: 1920x1080 (Promo4H) and 1080x1920 (Promo4V, Facebook boost). Big Bangla captions from the VO.
// Spec public/promo4/<pid>/props.json = { spec, durs } (scripts/promo4_make.py), VO public/promo4/<pid>/vo/NN.mp3,
// media public/promo4/<assets>/{clips,rec}/*.mp4 + guru.jpg (+ hook images). Cloud: aiu-render kind=promo4.
import React from "react";
import { AbsoluteFill, Audio, Img, OffthreadVideo, Sequence, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig, Easing, delayRender, continueRender } from "remotion";
import { Award, BookOpen, Bot, Check, Clapperboard, Hospital, ListChecks, NotebookPen, Phone, Smartphone, Sparkles, Stethoscope, TriangleAlert, ShieldCheck, Car, Gift } from "lucide-react";

const BN = "Anek", EN = "Montserrat";
if (typeof document !== "undefined") {
  for (const [n, u] of [["Anek", "fonts/AnekBangla.ttf"], ["Montserrat", "fonts/Montserrat.ttf"]]) {
    const h = delayRender(`font ${n}`);
    const f = new FontFace(n, `url(${staticFile(u)})`, { weight: "100 900" });
    f.load().then(() => { document.fonts.add(f); continueRender(h); }).catch(() => continueRender(h));
  }
}

type Theme = { dark: boolean; bg: string; bg2: string; card: string; ink: string; mute: string; accent: string; accent2: string; warn: string; line: string; capBg: string; capInk: string };
const THEMES: Record<string, Theme> = {
  snake: { dark: true, bg: "#0E2A1E", bg2: "#163A2A", card: "#F5EEDC", ink: "#1E2A1F", mute: "#5E6B58", accent: "#7DBE6A", accent2: "#E0A12B", warn: "#C8402F", line: "#D9CCAA", capBg: "rgba(8,24,16,.82)", capInk: "#FFF9EA" },
  health: { dark: false, bg: "#F2F8F6", bg2: "#E3F4F0", card: "#FFFFFF", ink: "#0D2B2A", mute: "#5E7775", accent: "#0E8C7F", accent2: "#12A594", warn: "#D94148", line: "#DCEAE6", capBg: "rgba(13,43,42,.88)", capInk: "#FFFFFF" },
  drive: { dark: true, bg: "#0F1115", bg2: "#1A1D24", card: "#1E7A46", ink: "#FFFFFF", mute: "#A8B0BD", accent: "#F5B301", accent2: "#2FBF71", warn: "#E5484D", line: "#2A2F3A", capBg: "rgba(0,0,0,.8)", capInk: "#FFFFFF" },
};

export type Scene = { k: string; vo: string; [x: string]: any };
export type Spec = { id: string; pid: string; assets: string; theme: string; course: string; title: string; url: string; guru: string; scenes: Scene[] };
type Props = { spec: Spec; durs: number[] };

const FPS = 30, LEAD = 8, TAIL = 14, OUTRO = 45;
const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const ease = Easing.bezier(0.16, 1, 0.3, 1);
export const timeline = (durs: number[]) => { let at = 0; return durs.map((d) => { const len = Math.round(d * FPS) + LEAD + TAIL; const s = { from: at, len }; at += len; return s; }); };
export const promo4Len = (durs: number[]) => timeline(durs).reduce((n, s) => n + s.len, 0) + OUTRO;
const ent = (f: number, d = 0, dur = 20) => interpolate(f, [d, d + dur], [0, 1], { ...clamp, easing: ease });
const pop = (f: number, fps: number, d = 0) => spring({ frame: f - d, fps, config: { damping: 11, mass: 0.6 } });
const media = (spec: Spec, p: string) => staticFile(`promo4/${spec.assets}/${p}`);

/* ---------- small parts ---------- */
const Rise: React.FC<{ f: number; d: number; children: React.ReactNode; style?: React.CSSProperties; y?: number }> = ({ f, d, children, style, y = 40 }) => {
  const s = ent(f, d); return <div style={{ opacity: s, transform: `translateY(${(1 - s) * y}px)`, ...style }}>{children}</div>;
};
const Chip: React.FC<{ t: Theme; children: React.ReactNode; color?: string; size?: number; style?: React.CSSProperties }> = ({ t, children, color, size = 30, style }) => (
  <div style={{ display: "inline-flex", alignItems: "center", gap: 12, padding: `${size * 0.32}px ${size * 0.8}px`, borderRadius: 999, background: color || t.accent, color: t.dark && !color ? t.bg : "#fff", fontFamily: BN, fontWeight: 700, fontSize: size, lineHeight: 1.3, ...style }}>{children}</div>
);

const Bg: React.FC<{ t: Theme; theme: string }> = ({ t, theme }) => {
  const f = useCurrentFrame(); const { width: W, height: H } = useVideoConfig();
  return (
    <AbsoluteFill style={{ background: t.dark ? `radial-gradient(circle at 70% 25%, ${t.bg2}, ${t.bg} 70%)` : `linear-gradient(160deg, #FFFFFF, ${t.bg} 55%, ${t.bg2})` }}>
      {theme === "drive" && (
        <svg width={W} height={H} style={{ position: "absolute", inset: 0, opacity: 0.35 }}>
          {[0.18, 0.5, 0.82].map((x) => Array.from({ length: 14 }, (_, i) => {
            const y = ((i * 160 + f * 14) % (H + 160)) - 160;
            return <rect key={x + "-" + i} x={W * x - 4} y={y} width={8} height={70} rx={4} fill={x === 0.5 ? t.accent : "#4A505C"} />;
          }))}
        </svg>
      )}
      {theme === "health" && (
        <svg width={W} height={H} style={{ position: "absolute", inset: 0, opacity: 0.18 }}>
          <path d={Array.from({ length: Math.ceil(W / 240) + 1 }, (_, i) => `M${i * 240} ${H * 0.86} l70 0 l18 -46 l22 92 l18 -70 l14 24 l98 0`).join(" ")} fill="none" stroke={t.accent} strokeWidth={4}
            strokeDasharray={W * 2} strokeDashoffset={W * 2 - ((f * 30) % (W * 2))} />
        </svg>
      )}
      {theme === "snake" && (
        <svg width={W} height={H} style={{ position: "absolute", inset: 0, opacity: 0.08 }}>
          {Array.from({ length: 9 }, (_, i) => <ellipse key={i} cx={(i * 337) % W} cy={(i * 521) % H + Math.sin((f + i * 20) / 40) * 12} rx={120} ry={46} transform={`rotate(${i * 40} ${(i * 337) % W} ${(i * 521) % H})`} fill={t.accent} />)}
        </svg>
      )}
    </AbsoluteFill>
  );
};

// big Bangla captions: the scene's VO split into short phrases, timed by length
const phrases = (vo: string) => {
  const parts = vo.replace(/\s+/g, " ").split(/(?<=[।?!])\s+|(?<=,)\s+/).map((s) => s.trim()).filter(Boolean);
  const out: string[] = [];
  for (const p of parts) {
    if (out.length && (out[out.length - 1] + " " + p).length <= 34 && !/[।?!]$/.test(out[out.length - 1])) out[out.length - 1] += " " + p;
    else out.push(p);
  }
  return out;
};
const Caption: React.FC<{ t: Theme; vo: string; voLen: number; vertical: boolean }> = ({ t, vo, voLen, vertical }) => {
  const f = useCurrentFrame() - LEAD;
  const ps = phrases(vo); const total = ps.reduce((n, p) => n + p.length, 0);
  let acc = 0, idx = ps.length - 1;
  for (let i = 0; i < ps.length; i++) { acc += ps[i].length; if (f < (acc / total) * voLen) { idx = i; break; } }
  if (f < 0 || f > voLen + TAIL) return null;
  const txt = ps[idx].replace(/[।,]$/, "");
  return (
    <div style={{ position: "absolute", left: 0, right: 0, ...(vertical ? { top: 1480 } : { bottom: 58 }), display: "flex", justifyContent: "center", padding: "0 60px" }}>
      <div key={idx} style={{ background: t.capBg, color: t.capInk, fontFamily: BN, fontWeight: 700, fontSize: vertical ? 60 : 50, lineHeight: 1.35, padding: vertical ? "16px 36px 20px" : "12px 34px 16px", borderRadius: 22, textAlign: "center", maxWidth: vertical ? 960 : 1500, boxShadow: "0 12px 40px rgba(0,0,0,.25)" }}>{txt}</div>
    </div>
  );
};

const Frame: React.FC<{ t: Theme; w: number; h: number; children: React.ReactNode; style?: React.CSSProperties }> = ({ t, w, h, children, style }) => (
  <div style={{ width: w, height: h, borderRadius: 26, overflow: "hidden", border: `6px solid ${t.dark ? "rgba(255,255,255,.9)" : "#fff"}`, boxShadow: "0 40px 90px rgba(0,0,0,.35)", position: "relative", background: "#000", ...style }}>{children}</div>
);
// browser-like window with only the brand in the tab (never a URL bar)
const AppWin: React.FC<{ w: number; h: number; children: React.ReactNode; style?: React.CSSProperties }> = ({ w, h, children, style }) => (
  <div style={{ width: w, height: h, borderRadius: 18, overflow: "hidden", background: "#fff", boxShadow: "0 40px 100px rgba(0,0,0,.4)", display: "flex", flexDirection: "column", ...style }}>
    <div style={{ height: 44, flex: "none", display: "flex", alignItems: "center", gap: 9, padding: "0 18px", background: "#EEF1F7" }}>
      {["#FF5F57", "#FEBC2E", "#28C840"].map((c) => <div key={c} style={{ width: 13, height: 13, borderRadius: 7, background: c }} />)}
      <div style={{ marginLeft: 16, padding: "6px 18px", borderRadius: 9, background: "#fff", fontFamily: BN, fontSize: 18, fontWeight: 600, color: "#334" }}>এআই ইউনিভার্সিটি</div>
    </div>
    <div style={{ flex: 1, position: "relative", overflow: "hidden" }}>{children}</div>
  </div>
);
const Phone_: React.FC<{ w: number; children: React.ReactNode; style?: React.CSSProperties }> = ({ w, children, style }) => (
  <div style={{ width: w, height: w * 2.17, borderRadius: w * 0.12, background: "#0B0D12", padding: w * 0.03, boxShadow: "0 50px 110px rgba(0,0,0,.45)", position: "relative", ...style }}>
    <div style={{ width: "100%", height: "100%", borderRadius: w * 0.095, overflow: "hidden", position: "relative", background: "#fff" }}>{children}</div>
    <div style={{ position: "absolute", top: w * 0.05, left: "50%", width: w * 0.26, height: w * 0.06, marginLeft: -w * 0.13, borderRadius: 99, background: "#0B0D12" }} />
  </div>
);
// "name@start x rate" → screen recording
const Rec: React.FC<{ spec: Spec; name: string; pos?: string }> = ({ spec, name, pos = "top" }) => {
  const [n, tm = "0x1"] = name.split("@"); const [st, rate] = tm.split("x").map(Number);
  return <OffthreadVideo src={media(spec, `rec/${n}.mp4`)} muted startFrom={Math.round(st * FPS)} playbackRate={rate || 1} style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: pos }} />;
};
const Clip: React.FC<{ spec: Spec; name: string }> = ({ spec, name }) => (
  <OffthreadVideo src={media(spec, `clips/${name}.mp4`)} muted style={{ width: "100%", height: "100%", objectFit: "cover" }} />
);
const KB: React.FC<{ src: string; len: number; pos?: string; style?: React.CSSProperties }> = ({ src, len, pos = "center", style }) => {
  const f = useCurrentFrame(); const z = interpolate(f, [0, len], [1.04, 1.16], clamp);
  return <div style={{ overflow: "hidden", ...style }}><Img src={src} style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: pos, transform: `scale(${z})` }} /></div>;
};
// clips shown one after another (cross-fade) for the scene length
const ClipRun: React.FC<{ spec: Spec; clips: string[]; len: number }> = ({ spec, clips, len }) => {
  const f = useCurrentFrame(); const seg = len / clips.length;
  return (
    <>
      {clips.map((c, i) => {
        const a = i * seg; const o = i === 0 ? 1 : interpolate(f, [a - 8, a + 6], [0, 1], clamp);
        return f >= a - 8 ? <Sequence key={c} from={Math.max(0, Math.round(a - 8))} durationInFrames={Math.round(seg + 20)} layout="none"><AbsoluteFill style={{ opacity: o }}><Clip spec={spec} name={c} /></AbsoluteFill></Sequence> : null;
      })}
    </>
  );
};

/* ---------- scenes ---------- */
type SP = { spec: Spec; s: Scene; t: Theme; f: number; len: number; V: boolean; fps: number };

const Hook: React.FC<SP> = ({ spec, s, t, f, len, V }) => {
  const bg = s.bg || {};
  return (
    <AbsoluteFill>
      {bg.img && <KB src={media(spec, bg.img)} len={len} pos={bg.pos} style={{ position: "absolute", inset: 0 }} />}
      {bg.clip && <AbsoluteFill><Clip spec={spec} name={bg.clip} /></AbsoluteFill>}
      {bg.imgs && (
        <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: V ? "column" : "row" }}>
          {bg.imgs.map((im: string, i: number) => <KB key={im} src={media(spec, im)} len={len} style={{ flex: 1, opacity: ent(f, i * 8, 16), borderRight: V ? undefined : "4px solid #fff", borderBottom: V ? "4px solid #fff" : undefined }} />)}
        </div>
      )}
      <AbsoluteFill style={{ background: V ? "linear-gradient(180deg, rgba(0,0,0,.78) 0%, rgba(0,0,0,.35) 45%, rgba(0,0,0,.75) 100%)" : "linear-gradient(90deg, rgba(0,0,0,.82) 0%, rgba(0,0,0,.55) 50%, rgba(0,0,0,.1) 100%)" }} />
      <div style={{ position: "absolute", left: V ? 70 : 120, right: V ? 70 : 640, top: V ? 300 : 230 }}>
        <Rise f={f} d={2}><div style={{ fontFamily: BN, fontWeight: 800, fontSize: V ? 104 : 96, lineHeight: 1.22, color: "#fff" }}>{s.q}</div></Rise>
        {s.warn && (
          <Rise f={f} d={Math.round(len * 0.45)} style={{ marginTop: 44 }}>
            <Chip t={t} color={t.warn} size={V ? 46 : 42}><TriangleAlert size={V ? 50 : 44} strokeWidth={2.4} /> {s.warn}</Chip>
          </Rise>
        )}
      </div>
      {bg.credit && <div style={{ position: "absolute", right: 24, bottom: V ? 330 : 18, fontFamily: EN, fontSize: 18, color: "rgba(255,255,255,.85)", background: "rgba(0,0,0,.5)", padding: "4px 12px", borderRadius: 6 }}>{bg.credit}</div>}
    </AbsoluteFill>
  );
};

const Free: React.FC<SP> = ({ spec, s, t, f, V, fps }) => {
  const p = pop(f, fps, 4);
  return (
    <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", flexDirection: "column", gap: V ? 50 : 34, paddingBottom: V ? 260 : 80 }}>
      <Rise f={f} d={0}><div style={{ fontFamily: BN, fontWeight: 700, fontSize: V ? 54 : 46, color: t.dark ? "rgba(255,255,255,.85)" : t.mute, textAlign: "center", padding: "0 60px" }}>{spec.title}</div></Rise>
      <div style={{ transform: `scale(${p}) rotate(${(1 - p) * -8}deg)`, display: "flex", alignItems: "center", gap: 30, background: t.accent, color: t.dark ? t.bg : "#fff", borderRadius: 40, padding: V ? "36px 60px" : "30px 70px", boxShadow: `0 30px 80px ${t.accent}55` }}>
        <Gift size={V ? 110 : 120} strokeWidth={2} />
        <div style={{ fontFamily: BN, fontWeight: 800, fontSize: V ? 120 : 140, lineHeight: 1.15 }}>{s.big || "সম্পূর্ণ ফ্রি"}</div>
      </div>
      {s.sub && <Rise f={f} d={18}><div style={{ fontFamily: BN, fontWeight: 600, fontSize: V ? 48 : 42, color: t.dark ? "#fff" : t.ink, textAlign: "center", padding: "0 60px" }}>{s.sub}</div></Rise>}
    </AbsoluteFill>
  );
};

const Stats: React.FC<SP> = ({ s, t, f, len, V, fps }) => {
  const items: [string, string][] = s.stats;
  return (
    <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 56, paddingBottom: V ? 300 : 90 }}>
      {s.head && <Rise f={f} d={0}><div style={{ fontFamily: BN, fontWeight: 800, fontSize: V ? 70 : 64, color: t.dark ? "#fff" : t.ink, textAlign: "center" }}>{s.head}</div></Rise>}
      <div style={{ display: "grid", gridTemplateColumns: V ? "1fr 1fr" : `repeat(${items.length}, 1fr)`, gap: V ? 34 : 36, width: V ? 940 : 1640 }}>
        {items.map(([n, l], i) => {
          const d = 6 + Math.round((len * 0.7 * i) / items.length); const p = pop(f, fps, d);
          return (
            <div key={l} style={{ transform: `scale(${0.6 + 0.4 * p})`, opacity: Math.min(1, p * 1.4), background: t.dark ? "rgba(255,255,255,.07)" : "#fff", border: `2px solid ${t.dark ? "rgba(255,255,255,.12)" : t.line}`, borderTop: `8px solid ${i % 2 ? t.accent2 : t.accent}`, borderRadius: 28, padding: V ? "34px 20px" : "38px 24px", textAlign: "center", boxShadow: t.dark ? "none" : "0 20px 50px rgba(13,60,55,.08)" }}>
              <div style={{ fontFamily: BN, fontWeight: 800, fontSize: V ? 120 : 128, lineHeight: 1.1, color: i % 2 ? t.accent2 : t.accent }}>{n}</div>
              <div style={{ fontFamily: BN, fontWeight: 600, fontSize: V ? 42 : 40, color: t.dark ? "#fff" : t.ink, marginTop: 8 }}>{l}</div>
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};

const Clips: React.FC<SP> = ({ spec, s, t, f, len, V }) => {
  const w = V ? 980 : 1240, h = Math.round(w * 9 / 16);
  const pts: string[] = s.pts || [];
  return (
    <AbsoluteFill>
      <div style={{ position: "absolute", left: V ? 50 : 110, top: V ? 330 : 130, display: "flex", flexDirection: "column", gap: 22 }}>
        <Rise f={f} d={0}><Chip t={t} size={V ? 36 : 30}><Clapperboard size={V ? 40 : 32} /> {s.label || "কোর্সের আসল ভিডিও থেকে"}</Chip></Rise>
        <Rise f={f} d={6}><Frame t={t} w={w} h={h}><ClipRun spec={spec} clips={s.clips} len={len} /></Frame></Rise>
      </div>
      {!V && pts.length > 0 && (
        <div style={{ position: "absolute", left: 1420, right: 50, top: 260, display: "flex", flexDirection: "column", gap: 22 }}>
          {pts.map((p, i) => (
            <Rise key={p} f={f} d={14 + Math.round((len * 0.6 * i) / pts.length)} y={24}>
              <div style={{ display: "flex", gap: 12, alignItems: "flex-start", fontFamily: BN, fontWeight: 700, fontSize: 34, lineHeight: 1.3, color: t.dark ? "#fff" : t.ink }}>
                <div style={{ flex: "none", marginTop: 6, width: 36, height: 36, borderRadius: 18, background: t.accent, display: "flex", alignItems: "center", justifyContent: "center" }}><Check size={24} color={t.dark ? t.bg : "#fff"} strokeWidth={3} /></div>{p}
              </div>
            </Rise>
          ))}
        </div>
      )}
      {V && pts.length > 0 && (
        <div style={{ position: "absolute", left: 50, right: 50, top: 330 + 90 + h + 40, display: "flex", flexWrap: "wrap", gap: 16 }}>
          {pts.map((p, i) => <Rise key={p} f={f} d={14 + Math.round((len * 0.6 * i) / pts.length)} y={20}><Chip t={t} color={t.dark ? "rgba(255,255,255,.14)" : t.accent2} size={36}>{p}</Chip></Rise>)}
        </div>
      )}
    </AbsoluteFill>
  );
};

// screen recording: desktop window (H) or phone (V); guru variant zooms into the chat panel
const RecScene: React.FC<SP & { guru?: boolean }> = ({ spec, s, t, f, len, V, guru }) => {
  const z = guru && !V ? interpolate(f, [len * 0.2, len * 0.55], [1, 2.5], { ...clamp, easing: ease }) : 1;
  return (
    <AbsoluteFill>
      <div style={{ position: "absolute", left: V ? 60 : 110, right: V ? 60 : undefined, top: V ? 240 : 104, display: "flex", alignItems: "center", gap: 18 }}>
        {guru && <Img src={media(spec, "guru.jpg")} style={{ width: V ? 96 : 76, height: V ? 96 : 76, borderRadius: 999, border: `4px solid ${t.accent}`, opacity: ent(f, 0) }} />}
        <Rise f={f} d={2}>
          <div style={{ fontFamily: BN, fontWeight: 800, fontSize: V ? 60 : 54, color: t.dark ? "#fff" : t.ink, lineHeight: 1.25 }}>{s.head}</div>
          {s.label && <div style={{ fontFamily: BN, fontWeight: 600, fontSize: V ? 38 : 32, color: t.dark ? t.accent : t.accent }}>{s.label}</div>}
        </Rise>
      </div>
      <Rise f={f} d={6} y={60} style={{ position: "absolute", ...(V ? { left: (1080 - 470) / 2, top: 420 } : { left: s.badge ? 110 : 340, top: 262 }) }}>
        {V ? (
          <Phone_ w={470}><Rec spec={spec} name={s.rec} /></Phone_>
        ) : (
          <AppWin w={1180} h={650}>
            <div style={{ width: "100%", height: "100%", transform: `scale(${z})`, transformOrigin: "100% 70%" }}><Rec spec={spec} name={s.rec} /></div>
          </AppWin>
        )}
      </Rise>
      {s.badge && !V && (
        <Rise f={f} d={20} style={{ position: "absolute", left: 1400, top: 330, width: 480 }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
            {(s.badge as string[]).map((b, i) => <Rise key={b} f={f} d={20 + i * 12}><Chip t={t} size={30} color={i % 2 ? t.accent2 : t.accent}><Check size={30} strokeWidth={3} /> {b}</Chip></Rise>)}
          </div>
        </Rise>
      )}
    </AbsoluteFill>
  );
};

const FEAT_ICONS: Record<string, React.FC<any>> = { notes: NotebookPen, app: Smartphone, cert: Award, quiz: ListChecks, video: Clapperboard, book: BookOpen, bot: Bot, car: Car };
const Feats: React.FC<SP> = ({ s, t, f, len, V, fps }) => {
  const items: [string, string, string][] = s.items;
  return (
    <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 50, paddingBottom: V ? 300 : 90 }}>
      {s.head && <Rise f={f} d={0}><div style={{ fontFamily: BN, fontWeight: 800, fontSize: V ? 68 : 62, color: t.dark ? "#fff" : t.ink }}>{s.head}</div></Rise>}
      <div style={{ display: "flex", flexDirection: V ? "column" : "row", gap: 34 }}>
        {items.map(([ic, a, b], i) => {
          const I = FEAT_ICONS[ic] || Sparkles; const p = pop(f, fps, 6 + Math.round((len * 0.65 * i) / items.length));
          return (
            <div key={a} style={{ width: V ? 900 : 480, display: "flex", flexDirection: V ? "row" : "column", alignItems: V ? "center" : "flex-start", gap: 24, transform: `translateY(${(1 - p) * 50}px)`, opacity: Math.min(1, p * 1.5), background: t.dark ? "rgba(255,255,255,.07)" : "#fff", border: `2px solid ${t.dark ? "rgba(255,255,255,.12)" : t.line}`, borderRadius: 30, padding: "36px 40px", boxShadow: t.dark ? "none" : "0 20px 50px rgba(13,60,55,.08)" }}>
              <div style={{ width: 96, height: 96, flex: "none", borderRadius: 26, background: i % 2 ? t.accent2 : t.accent, display: "flex", alignItems: "center", justifyContent: "center" }}><I size={54} color={t.dark ? t.bg : "#fff"} strokeWidth={2.2} /></div>
              <div>
                <div style={{ fontFamily: BN, fontWeight: 800, fontSize: 46, color: t.dark ? "#fff" : t.ink, lineHeight: 1.25 }}>{a}</div>
                <div style={{ fontFamily: BN, fontWeight: 500, fontSize: 32, color: t.dark ? "rgba(255,255,255,.72)" : t.mute, lineHeight: 1.35, marginTop: 6 }}>{b}</div>
              </div>
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};

const SAFE_ICONS: Record<string, React.FC<any>> = { hospital: Hospital, doctor: Stethoscope, shield: ShieldCheck, car: Car };
const Safety: React.FC<SP> = ({ s, t, f, V, fps }) => {
  const I = SAFE_ICONS[s.icon] || ShieldCheck; const p = pop(f, fps, 2);
  return (
    <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", paddingBottom: V ? 300 : 90 }}>
      <div style={{ transform: `scale(${0.85 + 0.15 * p})`, opacity: Math.min(1, p * 1.5), width: V ? 940 : 1400, background: t.dark ? "#fff" : "#fff", borderRadius: 36, borderLeft: `18px solid ${t.warn}`, padding: V ? "56px 54px" : "60px 70px", display: "flex", flexDirection: V ? "column" : "row", alignItems: V ? "flex-start" : "center", gap: 44, boxShadow: "0 40px 90px rgba(0,0,0,.25)" }}>
        <div style={{ width: 150, height: 150, flex: "none", borderRadius: 40, background: t.warn, display: "flex", alignItems: "center", justifyContent: "center" }}><I size={90} color="#fff" strokeWidth={2} /></div>
        <div>
          <div style={{ fontFamily: BN, fontWeight: 800, fontSize: V ? 72 : 70, color: "#1A1A1A", lineHeight: 1.22 }}>{s.line}</div>
          {s.sub && <div style={{ fontFamily: BN, fontWeight: 600, fontSize: V ? 42 : 38, color: "#555", lineHeight: 1.35, marginTop: 16, opacity: ent(f, 16) }}>{s.sub}</div>}
          {s.call && <div style={{ marginTop: 22, opacity: ent(f, 24) }}><Chip t={t} color={t.warn} size={V ? 40 : 36}><Phone size={V ? 40 : 36} /> {s.call}</Chip></div>}
        </div>
      </div>
    </AbsoluteFill>
  );
};

const Cta: React.FC<SP> = ({ spec, s, t, f, V, fps }) => {
  const p = pop(f, fps, 6);
  return (
    <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", flexDirection: "column", gap: V ? 54 : 40, paddingBottom: V ? 220 : 60 }}>
      <Img src={staticFile(t.dark ? "brand/logo-dark.png" : "brand/logo.png")} style={{ width: V ? 520 : 460, opacity: ent(f, 0), transform: `translateY(${(1 - ent(f, 0)) * 30}px)` }} />
      <Rise f={f} d={8}><div style={{ fontFamily: BN, fontWeight: 800, fontSize: V ? 84 : 80, color: t.dark ? "#fff" : t.ink, textAlign: "center", lineHeight: 1.2 }}>{s.line || "এখনই ফ্রি শুরু করুন"}</div></Rise>
      <div style={{ transform: `scale(${p})`, background: t.accent, color: t.dark ? t.bg : "#fff", fontFamily: EN, fontWeight: 800, fontSize: V ? 46 : 52, padding: V ? "22px 40px" : "24px 54px", borderRadius: 999, boxShadow: `0 24px 60px ${t.accent}55` }}>{spec.url}</div>
      <Rise f={f} d={22}><Chip t={t} color={t.dark ? "rgba(255,255,255,.14)" : t.accent2} size={V ? 38 : 34}><Gift size={V ? 40 : 36} /> সম্পূর্ণ ফ্রি · সার্টিফিকেটসহ</Chip></Rise>
    </AbsoluteFill>
  );
};

const RENDER: Record<string, React.FC<SP>> = { hook: Hook, free: Free, stats: Stats, clips: Clips, rec: RecScene, guru: (p) => <RecScene {...p} guru />, feats: Feats, safety: Safety, cta: Cta };

const SceneBox: React.FC<{ spec: Spec; s: Scene; t: Theme; len: number; voLen: number; last: boolean }> = ({ spec, s, t, len, voLen, last }) => {
  const f = useCurrentFrame(); const { fps, width, height } = useVideoConfig(); const V = height > width;
  const R = RENDER[s.k] || Free;
  const fadeIn = interpolate(f, [0, 8], [0, 1], clamp);
  return (
    <AbsoluteFill style={{ opacity: fadeIn }}>
      <R spec={spec} s={s} t={t} f={f} len={len} V={V} fps={fps} />
      {s.k !== "hook" && s.k !== "cta" && (
        <div style={{ position: "absolute", ...(V ? { left: 60, top: 90 } : { left: 60, top: 40 }), display: "flex", alignItems: "center", gap: 14 }}>
          <Img src={staticFile(t.dark ? "brand/logo-dark.png" : "brand/logo.png")} style={{ height: V ? 70 : 56 }} />
        </div>
      )}
      {s.k !== "cta" && !last && <Caption t={t} vo={s.vo} voLen={voLen} vertical={V} />}
    </AbsoluteFill>
  );
};

export const Promo4: React.FC<Props> = ({ spec, durs }) => {
  const t = THEMES[spec.theme] || THEMES.snake; const tl = timeline(durs); const total = promo4Len(durs);
  const vo = (i: number) => staticFile(`promo4/${spec.pid}/vo/${String(i + 1).padStart(2, "0")}.mp3`);
  return (
    <AbsoluteFill style={{ background: t.bg }}>
      <Bg t={t} theme={spec.theme} />
      {spec.scenes.map((s, i) => (
        <Sequence key={i} from={tl[i].from} durationInFrames={tl[i].len + (i === spec.scenes.length - 1 ? OUTRO : 0)}>
          <SceneBox spec={spec} s={s} t={t} len={tl[i].len} voLen={Math.round(durs[i] * FPS)} last={false} />
        </Sequence>
      ))}
      <Audio src={staticFile("aiu2/music.mp3")} volume={(f) => interpolate(f, [0, 20, total - 50, total], [0, 0.11, 0.11, 0], clamp)} />
      {tl.map((s, i) => <Sequence key={"v" + i} from={s.from + LEAD} durationInFrames={s.len}><Audio src={vo(i)} /></Sequence>)}
      {tl.slice(1).map((s, i) => <Sequence key={"w" + i} from={Math.max(0, s.from - 6)} durationInFrames={30}><Audio src={staticFile("aiu2/whoosh.mp3")} volume={0.2} /></Sequence>)}
    </AbsoluteFill>
  );
};
