// AI University — "কচু বিজ্ঞানী" (biggan-velki) lesson video engine. Own look: a classroom chalkboard in a wooden frame,
// প্রফেসর চমক (এআই প্রশিক্ষক — wild white hair, gold glasses, yellow bow tie) whose mouth follows his voice, chalk diagrams that
// draw themselves while he talks, an eraser-wipe between scenes, notebook pages for the "খাতা-কলমে বিজ্ঞানী" experiments.
// One spec per lesson: src/velki/specs/<id>.json, timed by scripts/velki_make.py. Scene timeline: LEAD → vo → hold → TAIL.
// Scene types: hook · title · explain · fig · wow · bd · lab · observe · myth · quiz · recap · outro
import React from "react";
import { AbsoluteFill, Audio, Img, Sequence, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig, Easing, delayRender, continueRender, random } from "remotion";
import * as L from "lucide-react";
import { FIGS, CH, FONT } from "./diagrams";

const BN = "Anek";
if (typeof document !== "undefined") {
  for (const [n, u] of [["Anek", "fonts/AnekBangla.ttf"], ["Montserrat", "fonts/Montserrat.ttf"], ["Atma", "fonts/Atma-Bold.ttf"]]) {
    const h = delayRender(`font ${n}`);
    const f = new FontFace(n, `url(${staticFile(u)})`, { weight: n === "Atma" ? "700" : "100 900" });
    f.load().then(() => { document.fonts.add(f); continueRender(h); }).catch(() => continueRender(h));
  }
}
const cl = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const ease = Easing.bezier(0.16, 1, 0.3, 1);
const bn = (n: number | string) => String(n).replace(/\d/g, (d) => "০১২৩৪৫৬৭৮৯"[+d]);
const ent = (f: number, fps: number, d: number, dur = 20) => spring({ frame: f - d, fps, config: { damping: 200 }, durationInFrames: dur });
const pop = (f: number, fps: number, d: number) => spring({ frame: f - d, fps, config: { damping: 10, mass: 0.6 } });
const PAPER = "#FFFBEF", INK = "#24324A", RED = "#E85D5D";

/* ---------- spec + timing (keep in sync with velki_make.py: total()) ---------- */
export type Scene = { type: string; vo: string; frames: number; amp?: string; hold?: number; [k: string]: any };
export type Spec = { id: string; course: string; module: string; lessonNo: string; title: string; next: string; scenes: Scene[]; credits?: Record<string, string> };
export const LEAD = 14, TAIL = 16;
export const sceneLen = (s: Scene) => LEAD + s.frames + (s.hold || 0) + TAIL;
export const velkiLen = (spec: Spec) => spec.scenes.reduce((n, s) => n + sceneLen(s), 0) + 30;
type P = { s: Scene; spec: Spec; i: number };
const vAt = (s: Scene, x: number) => LEAD + s.frames * x;
const amp = (env: string | undefined, i: number) => (env && i >= 0 && i < env.length ? (env.charCodeAt(i) - 48) / 9 : 0);
export const Icon: React.FC<{ n?: string; size: number; color: string; sw?: number }> = ({ n, size, color, sw = 2.2 }) => {
  const key = (n || "sparkles").split("-").map((x) => x[0].toUpperCase() + x.slice(1)).join("");
  const I = ((L as any)[key] || L.Sparkles) as React.FC<any>;
  return <I size={size} color={color} strokeWidth={sw} />;
};

/* ---------- chalk text + reveal helpers ---------- */
export const Chalk: React.FC<{ children: React.ReactNode; size: number; color?: string; at?: number; dur?: number; style?: React.CSSProperties; font?: string }> = ({ children, size, color = CH.w, at = 0, dur = 22, style, font = FONT }) => {
  const f = useCurrentFrame(); const k = interpolate(f, [at, at + dur], [0, 1], { ...cl, easing: Easing.out(Easing.quad) });
  return <div style={{ fontFamily: font, fontWeight: 700, fontSize: size, color, lineHeight: 1.3, filter: "url(#chalkTxt)", clipPath: `inset(-20% ${100 - k * 100}% -20% -2%)`, ...style }}>{children}</div>;
};
export const Rise: React.FC<{ d: number; children: React.ReactNode; style?: React.CSSProperties; y?: number }> = ({ d, children, style, y = 30 }) => {
  const f = useCurrentFrame(); const { fps } = useVideoConfig(); const s = ent(f, fps, d);
  return <div style={{ opacity: s, transform: `translateY(${(1 - s) * y}px)`, ...style }}>{children}</div>;
};
export const Pop: React.FC<{ d: number; children: React.ReactNode; style?: React.CSSProperties; rot?: number }> = ({ d, children, style, rot = 0 }) => {
  const f = useCurrentFrame(); const { fps } = useVideoConfig(); const k = pop(f, fps, d);
  return <div style={{ opacity: Math.min(1, k * 1.6), transform: `scale(${0.3 + 0.7 * k}) rotate(${rot * k + (1 - k) * -12}deg)`, ...style }}>{children}</div>;
};
export const SFX: React.FC<{ at: number; name: string; vol?: number }> = ({ at, name, vol = 0.3 }) => (at >= 0 ? <Sequence from={Math.round(at)} durationInFrames={60}><Audio src={staticFile(name.includes("/") ? name : `aiu2/${name}.mp3`)} volume={vol} /></Sequence> : null);
const Notebook: React.FC<{ w: number; h: number; children: React.ReactNode; rot?: number; style?: React.CSSProperties }> = ({ w, h, children, rot = -1.2, style }) => (
  <div style={{ width: w, height: h, position: "relative", transform: `rotate(${rot}deg)`, borderRadius: 10, boxShadow: "0 30px 60px rgba(0,0,0,.45)", background: PAPER,
    backgroundImage: `linear-gradient(90deg, transparent 88px, ${RED}88 88px, ${RED}88 91px, transparent 91px), linear-gradient(rgba(60,120,200,.16) 1.5px, transparent 1.5px), linear-gradient(90deg, rgba(60,120,200,.10) 1.5px, transparent 1.5px)`,
    backgroundSize: "100% 100%, 100% 44px, 44px 100%", ...style }}>
    {Array.from({ length: Math.floor(h / 70) }, (_, i) => <div key={i} style={{ position: "absolute", left: 26, top: 36 + i * 70, width: 30, height: 30, borderRadius: 15, background: "#1d2a26", boxShadow: "inset 0 3px 6px rgba(0,0,0,.6)" }} />)}
    <div style={{ position: "absolute", inset: "30px 40px 30px 120px" }}>{children}</div>
  </div>
);

/* ---------- প্রফেসর চমক ---------- */
export const Prof: React.FC<{ size: number; a: number; pose?: "idle" | "point" | "wave" | "wow"; flip?: boolean }> = ({ size, a, pose = "idle", flip }) => {
  const f = useCurrentFrame();
  const blink = f % 101 < 4 ? 0.1 : 1; const m = Math.min(1, a * 1.3); const brow = pose === "wow" ? -10 : -a * 5;
  const bob = Math.sin(f / 18) * 3 + a * 2; const hair = (i: number) => Math.sin(f / 11 + i) * 2.2;
  const arm = pose === "wave" ? Math.sin(f / 5) * 16 : pose === "point" ? Math.sin(f / 22) * 4 : 0;
  const skin = "#D9A27E", coat = "#F6F5EF", hairC = "#F3F3F1";
  return (
    <svg width={size} height={size * 1.2} viewBox="0 0 300 360" style={{ display: "block", overflow: "visible", transform: flip ? "scaleX(-1)" : undefined }}>
      <g transform={`translate(0 ${bob})`}>
        {/* body + coat */}
        <path d="M40 360 C44 290 86 262 150 262 C214 262 256 290 260 360 Z" fill={coat} stroke="#d6d4ca" strokeWidth={3} />
        <path d="M118 266 L150 330 L182 266 Z" fill="#BFD7F2" />
        <path d="M118 266 L104 360 M182 266 L196 360" stroke="#d6d4ca" strokeWidth={4} />
        <path d="M150 284 L128 272 L128 298 Z M150 284 L172 272 L172 298 Z" fill="#FFC83D" stroke="#e0a91a" strokeWidth={2} /><circle cx={150} cy={285} r={7} fill="#F2B21E" />
        <rect x="216" y="300" width="22" height="34" rx="4" fill="#8FE3FF" opacity={0.85} /><rect x="220" y="296" width="14" height="8" rx="2" fill="#7a8b99" />
        {/* arm */}
        {pose !== "idle" && pose !== "wow" && <g transform={`rotate(${(pose === "wave" ? 18 : 46) + arm} 232 290)`}>
          <rect x="222" y="190" width="30" height="104" rx="15" fill={coat} stroke="#d6d4ca" strokeWidth={3} />
          <circle cx="237" cy="186" r="17" fill={skin} />
          {pose === "point" && <rect x="232" y="150" width="9" height="34" rx="3" fill="#FFFDF2" stroke="#ddd" />}
        </g>}
        <rect x="134" y="226" width="32" height="40" rx="12" fill={skin} />
        {/* head */}
        <g>
          {[[-58, 92, 34], [-44, 50, 36], [-14, 30, 38], [24, 26, 38], [56, 44, 36], [70, 88, 34], [-70, 130, 26], [80, 132, 26], [-30, 60, 30], [36, 58, 30]].map(([dx, cy, r], i) =>
            <circle key={i} cx={150 + dx + hair(i)} cy={cy + hair(i + 3)} r={r} fill={hairC} stroke="#dcdcd6" strokeWidth={2} />)}
          <ellipse cx="96" cy="150" rx="12" ry="18" fill={skin} /><ellipse cx="204" cy="150" rx="12" ry="18" fill={skin} />
          <ellipse cx="150" cy="148" rx="56" ry="70" fill={skin} />
          <path d="M98 108 C108 82 192 82 202 108 C186 96 116 96 98 108 Z" fill={hairC} />
          <path d={`M108 ${118 + brow} Q124 ${106 + brow} 140 ${116 + brow}`} stroke={hairC} strokeWidth={9} fill="none" strokeLinecap="round" />
          <path d={`M160 ${116 + brow} Q176 ${106 + brow} 192 ${118 + brow}`} stroke={hairC} strokeWidth={9} fill="none" strokeLinecap="round" />
          <circle cx="124" cy="140" r="20" fill="#fff" /><circle cx="176" cy="140" r="20" fill="#fff" />
          <g transform={`translate(0 ${140 * (1 - blink)}) scale(1 ${blink})`}><circle cx={126 + Math.sin(f / 40) * 2} cy="141" r="8.5" fill="#3B2412" /><circle cx={178 + Math.sin(f / 40) * 2} cy="141" r="8.5" fill="#3B2412" />
            <circle cx={129} cy="137" r="2.6" fill="#fff" /><circle cx={181} cy="137" r="2.6" fill="#fff" /></g>
          <circle cx="124" cy="140" r="25" fill="rgba(255,255,255,.12)" stroke="#E0B33A" strokeWidth={5} /><circle cx="176" cy="140" r="25" fill="rgba(255,255,255,.12)" stroke="#E0B33A" strokeWidth={5} />
          <path d="M149 138 Q150 132 151 138" stroke="#E0B33A" strokeWidth={5} fill="none" />
          <path d="M140 160 Q150 182 160 160 Q158 176 150 178 Q142 176 140 160 Z" fill="#C98762" />
          <circle cx="108" cy="170" r="10" fill="#F08F86" opacity=".35" /><circle cx="192" cy="170" r="10" fill="#F08F86" opacity=".35" />
          {/* mouth (opens with the voice) + moustache */}
          {pose === "wow" ? <ellipse cx="150" cy="200" rx="13" ry="16" fill="#5B1D22" /> :
            m > 0.06 ? <g><ellipse cx="150" cy={196 + m * 3} rx={15 + m * 4} ry={3 + m * 11} fill="#5B1D22" /><ellipse cx="150" cy={202 + m * 7} rx={9} ry={3 + m * 3} fill="#D9606A" opacity={m} /></g>
              : <path d="M136 196 Q150 206 164 196" stroke="#5B1D22" strokeWidth={4} fill="none" strokeLinecap="round" />}
          <path d={`M150 ${182 - m * 3} C132 ${174 - m * 3} 110 ${178 - m * 2} 98 ${196 - m * 2} C112 ${186 - m * 2} 128 ${190 - m * 3} 150 ${188 - m * 3} C172 ${190 - m * 3} 188 ${186 - m * 2} 202 ${196 - m * 2} C190 ${178 - m * 2} 168 ${174 - m * 3} 150 ${182 - m * 3} Z`} fill={hairC} stroke="#dcdcd6" strokeWidth={2} />
        </g>
      </g>
    </svg>
  );
};
export const NamePlate: React.FC<{ big?: boolean }> = ({ big }) => (
  <div style={{ display: "inline-flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
    <div style={{ padding: big ? "8px 26px 10px" : "5px 18px 7px", borderRadius: 14, background: "#2B1E14", border: "3px solid #8B5E34", fontFamily: FONT, fontWeight: 700, fontSize: big ? 38 : 26, color: CH.y }}>প্রফেসর চমক</div>
    <div style={{ padding: big ? "4px 16px 6px" : "2px 12px 4px", borderRadius: 20, background: CH.c, color: "#0E2A33", fontFamily: BN, fontWeight: 700, fontSize: big ? 22 : 17 }}>এআই প্রশিক্ষক</div>
  </div>
);
// the professor standing at the board's left edge, mouth following the scene's voice
const Presenter: React.FC<P & { pose?: any; size?: number; x?: number }> = ({ s, pose = "point", size = 300, x = 40 }) => {
  const f = useCurrentFrame(); const a = amp(s.amp, Math.round(f - LEAD));
  const k = interpolate(f, [0, 14], [0, 1], { ...cl, easing: ease });
  return <div style={{ position: "absolute", left: x, bottom: 30, transform: `translateY(${(1 - k) * 80}px)`, opacity: k }}>
    <Prof size={size} a={a} pose={pose} />
    <div style={{ position: "absolute", left: 0, right: 0, bottom: -6, display: "flex", justifyContent: "center" }}><NamePlate /></div>
  </div>;
};

/* ---------- scene types ---------- */
const Heading: React.FC<{ text: string; tag?: string; tagColor?: string; icon?: string; at?: number }> = ({ text, tag, tagColor = CH.y, icon, at = 2 }) => (
  <div style={{ position: "absolute", left: 420, top: 128, right: 120 }}>
    {tag && <Pop d={at}><span style={{ display: "inline-flex", alignItems: "center", gap: 10, padding: "6px 20px 9px", borderRadius: 30, border: `3px solid ${tagColor}`, color: tagColor, fontFamily: FONT, fontSize: 28 }}>{icon && <Icon n={icon} size={28} color={tagColor} />}{tag}</span></Pop>}
    <Chalk size={58} at={at + 6} style={{ marginTop: 10 }}>{text}</Chalk>
    <svg width="560" height="16" style={{ marginTop: 2 }}><path d="M4 10 C140 2 300 14 556 6" stroke={tagColor} strokeWidth={5} fill="none" strokeLinecap="round" pathLength={1} strokeDasharray="1 1" strokeDashoffset={1 - interpolate(useCurrentFrame(), [at + 20, at + 36], [0, 1], cl)} filter="url(#chalk)" /></svg>
  </div>
);
const Fig: React.FC<{ name: string; s: Scene; args?: any; x: number; y: number; w: number }> = ({ name, s, args, x, y, w }) => {
  const f = useCurrentFrame(); const F = FIGS[name] || FIGS.big;
  const p = interpolate(f, [LEAD - 4, LEAD + s.frames * 0.95], [0, 1], cl);
  return <svg style={{ position: "absolute", left: x, top: y, overflow: "visible" }} width={w} height={w * 0.7} viewBox="0 0 1000 700"><F p={p} t={f} args={args} /></svg>;
};

const Hook: React.FC<P> = ({ s }) => {
  const f = useCurrentFrame(); const a = amp(s.amp, Math.round(f - LEAD));
  return <AbsoluteFill>
    <div style={{ position: "absolute", left: 90, bottom: 40 }}><Pop d={2}><Prof size={470} a={a} pose={f > vAt(s, 0.55) ? "wow" : "point"} /></Pop>
      <div style={{ position: "absolute", left: 0, right: 0, bottom: -10, display: "flex", justifyContent: "center" }}><NamePlate big /></div></div>
    <div style={{ position: "absolute", left: 700, top: 170, right: 100 }}>
      <Pop d={6} rot={-4}><span style={{ display: "inline-block", padding: "10px 30px 14px", background: CH.y, color: "#2b2210", fontFamily: FONT, fontSize: 44, borderRadius: 12, transform: "rotate(-3deg)" }}>তুমি কি জানতে?</span></Pop>
      <Chalk size={92} at={14} dur={30} style={{ marginTop: 40 }}>{s.q}</Chalk>
      {s.sub && <Chalk size={44} at={vAt(s, 0.5)} color={CH.c} style={{ marginTop: 26 }}>{s.sub}</Chalk>}
    </div>
    {s.fig && <div style={{ opacity: interpolate(f, [vAt(s, 0.3), vAt(s, 0.45)], [0, 0.95], cl) }}><Fig name={s.fig} s={s} args={s.args} x={1080} y={500} w={700} /></div>}
    {!s.fig && ["?", "!", "★", "?"].map((c, i) => <div key={i} style={{ position: "absolute", left: 640 + i * 320, top: 760 - (i % 2) * 120, fontFamily: FONT, fontSize: 90, color: [CH.p, CH.c, CH.y, CH.g][i], opacity: interpolate(f, [20 + i * 8, 34 + i * 8], [0, 0.55], cl), transform: `rotate(${Math.sin(f / 15 + i) * 10}deg)`, filter: "url(#chalkTxt)" }}>{c}</div>)}
    <SFX at={6} name="pop" /><SFX at={vAt(s, 0.55)} name="chime" vol={0.25} />
  </AbsoluteFill>;
};

const Title: React.FC<P> = ({ s, spec }) => {
  const f = useCurrentFrame();
  return <AbsoluteFill>
    <Presenter s={s} spec={spec} i={0} pose="wave" />
    <div style={{ position: "absolute", left: 470, top: 230, right: 140 }}>
      <Pop d={4}><span style={{ fontFamily: FONT, fontSize: 40, color: CH.p }}>পাঠ {bn(spec.lessonNo)} · {spec.module}</span></Pop>
      <Chalk size={84} at={12} dur={34} style={{ marginTop: 20, lineHeight: 1.25 }}>{spec.title}</Chalk>
      <Rise d={46}><div style={{ marginTop: 50, display: "flex", gap: 22 }}>
        {[["lightbulb", "সহজ ব্যাখ্যা", CH.y], ["flask-conical", "ঘরে পরীক্ষা", CH.c], ["notebook-pen", "বিজ্ঞানীর খাতা", CH.g]].map(([ic, t, c], i) =>
          <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 20px", border: `3px dashed ${c}`, borderRadius: 16, fontFamily: FONT, fontSize: 30, color: c as string, opacity: interpolate(f, [46 + i * 8, 56 + i * 8], [0, 1], cl) }}><Icon n={ic as string} size={32} color={c as string} />{t}</div>)}
      </div></Rise>
    </div>
    <SFX at={10} name="whoosh" vol={0.22} />
  </AbsoluteFill>;
};

const Explain: React.FC<P> = ({ s, spec, i }) => {
  const f = useCurrentFrame(); const pts: string[] = s.pts || [];
  return <AbsoluteFill>
    <Presenter s={s} spec={spec} i={i} />
    <Heading text={s.head} tag={s.tag || "সহজ ব্যাখ্যা"} icon={s.icon || "lightbulb"} />
    <div style={{ position: "absolute", left: 420, top: 330, width: s.fig ? 640 : 1300 }}>
      {pts.map((t, j) => { const at = vAt(s, 0.08 + (0.8 * j) / Math.max(1, pts.length)); const k = interpolate(f, [at, at + 12], [0, 1], cl);
        return <div key={j} style={{ display: "flex", gap: 18, alignItems: "flex-start", marginBottom: 26, opacity: k, transform: `translateX(${(1 - k) * -30}px)` }}>
          <div style={{ flex: "none", width: 46, height: 46, borderRadius: 23, border: `3px solid ${[CH.y, CH.c, CH.p, CH.g][j % 4]}`, display: "grid", placeItems: "center", fontFamily: FONT, fontSize: 28, color: [CH.y, CH.c, CH.p, CH.g][j % 4], marginTop: 4 }}>{bn(j + 1)}</div>
          <div style={{ fontFamily: BN, fontWeight: 600, fontSize: 38, color: CH.w, lineHeight: 1.4 }}>{t}</div>
        </div>; })}
    </div>
    {s.fig && <Fig name={s.fig} s={s} args={s.args} x={1070} y={290} w={800} />}
    <SFX at={4} name="whoosh" vol={0.15} />
  </AbsoluteFill>;
};

const FigScene: React.FC<P> = ({ s, spec, i }) => <AbsoluteFill>
  <Presenter s={s} spec={spec} i={i} size={260} />
  <Heading text={s.head} tag={s.tag || "বোর্ডে এঁকে দেখি"} icon={s.icon || "pencil"} tagColor={CH.c} />
  <Fig name={s.fig} s={s} args={s.args} x={s.figX || 620} y={250} w={s.figW || 1000} />
</AbsoluteFill>;

const Wow: React.FC<P> = ({ s }) => {
  const f = useCurrentFrame(); const { fps } = useVideoConfig(); const a = amp(s.amp, Math.round(f - LEAD));
  const burst = pop(f, fps, 8); const flash = interpolate(f, [6, 10, 22], [0, 0.6, 0], cl);
  return <AbsoluteFill>
    <div style={{ position: "absolute", inset: 0, background: "#fff", opacity: flash }} />
    <div style={{ position: "absolute", left: 80, bottom: 40 }}><Prof size={380} a={a} pose={f < vAt(s, 0.25) ? "wow" : "point"} /></div>
    <div style={{ position: "absolute", left: 560, top: 140, width: 1240, height: 700, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
      <svg width="1000" height="560" viewBox="-500 -280 1000 560" style={{ position: "absolute", transform: `scale(${burst}) rotate(${f / 6}deg)`, opacity: 0.9 }}>
        {Array.from({ length: 18 }, (_, i) => { const an = (i / 18) * Math.PI * 2; return <path key={i} d={`M${Math.cos(an) * 170} ${Math.sin(an) * 120} L${Math.cos(an + 0.08) * 460} ${Math.sin(an + 0.08) * 270} L${Math.cos(an - 0.08) * 460} ${Math.sin(an - 0.08) * 270} Z`} fill={i % 2 ? "rgba(255,226,122,.16)" : "rgba(255,158,196,.12)"} />; })}
      </svg>
      <Pop d={4} rot={-6}><div style={{ padding: "6px 30px 12px", borderRadius: 14, background: CH.p, color: "#3a1020", fontFamily: FONT, fontSize: 48 }}>ভেলকি!</div></Pop>
      <div style={{ marginTop: 20, fontFamily: FONT, fontSize: s.bigSize || 150, color: CH.y, transform: `scale(${0.5 + 0.5 * burst})`, filter: "url(#chalkTxt)", textAlign: "center", lineHeight: 1.1 }}>{s.big}</div>
      <Chalk size={46} at={vAt(s, 0.25)} style={{ marginTop: 26, textAlign: "center", maxWidth: 1100 }}>{s.text}</Chalk>
    </div>
    {Array.from({ length: 14 }, (_, i) => { const x = 600 + random(`sx${i}`) * 1200, y = 160 + random(`sy${i}`) * 700; const k = interpolate(f, [10 + i * 2, 24 + i * 2, 60 + i * 3], [0, 1, 0], cl);
      return <div key={i} style={{ position: "absolute", left: x, top: y, color: [CH.y, CH.c, CH.p][i % 3], fontSize: 40, opacity: k, transform: `scale(${k}) rotate(${i * 30}deg)` }}>✦</div>; })}
    <SFX at={6} name="hit" vol={0.3} /><SFX at={10} name="chime" vol={0.25} />
  </AbsoluteFill>;
};

const Bd: React.FC<P> = ({ s, spec, i }) => {
  const f = useCurrentFrame(); const items: { icon?: string; t: string }[] = s.items || [];
  return <AbsoluteFill>
    <Presenter s={s} spec={spec} i={i} size={260} />
    <Heading text={s.head || "আমাদের চারপাশে"} tag="বাংলাদেশে দেখো" icon="map-pin" tagColor={CH.g} />
    {s.photo && <div style={{ position: "absolute", left: 1240, top: 300, transform: `rotate(${3 - 3 * interpolate(f, [6, 26], [1, 0], cl)}deg) scale(${interpolate(f, [6, 26], [0.8, 1], { ...cl, easing: ease })})`, opacity: interpolate(f, [6, 20], [0, 1], cl) }}>
      <div style={{ padding: "18px 18px 70px", background: "#fdfdf8", boxShadow: "0 30px 60px rgba(0,0,0,.5)", width: 560 }}>
        <Img src={staticFile(`velki/scenes/${s.photo}.jpg`)} style={{ width: 524, height: 360, objectFit: "cover", transform: `scale(${1.04 + f * 0.0006})` }} />
        <div style={{ fontFamily: FONT, fontSize: 30, color: "#333", textAlign: "center", marginTop: 14 }}>{s.cap || ""}</div>
      </div>
      <div style={{ position: "absolute", left: 220, top: -16, width: 130, height: 36, background: "rgba(255,226,122,.75)", transform: "rotate(-4deg)" }} />
      <div style={{ position: "absolute", right: 14, bottom: 10, fontFamily: BN, fontSize: 15, color: "#888" }}>এআই দিয়ে আঁকা ছবি</div>
    </div>}
    <div style={{ position: "absolute", left: 420, top: 320, width: s.photo ? 780 : 1360, display: "flex", flexDirection: "column", gap: 22 }}>
      {items.map((it, j) => { const at = vAt(s, 0.06 + (0.82 * j) / Math.max(1, items.length)); const k = interpolate(f, [at, at + 12], [0, 1], cl);
        return <div key={j} style={{ display: "flex", gap: 20, alignItems: "center", padding: "16px 24px", borderRadius: 18, background: "rgba(255,255,255,.06)", border: `2px dashed ${CH.dim}`, opacity: k, transform: `translateY(${(1 - k) * 24}px)` }}>
          <div style={{ flex: "none", width: 64, height: 64, borderRadius: 18, background: [CH.g, CH.y, CH.c, CH.p][j % 4], display: "grid", placeItems: "center" }}><Icon n={it.icon} size={36} color="#14302a" /></div>
          <div style={{ fontFamily: BN, fontWeight: 600, fontSize: 34, color: CH.w, lineHeight: 1.35 }}>{it.t}</div>
        </div>; })}
    </div>
    <SFX at={4} name="whoosh" vol={0.15} />
  </AbsoluteFill>;
};

const Lab: React.FC<P> = ({ s, spec, i }) => {
  const f = useCurrentFrame(); const need: { icon?: string; t: string }[] = s.need || []; const steps: string[] = s.steps || [];
  return <AbsoluteFill>
    <Presenter s={s} spec={spec} i={i} size={250} />
    <div style={{ position: "absolute", left: 400, top: 110 }}><Pop d={2}><span style={{ display: "inline-flex", alignItems: "center", gap: 12, padding: "8px 26px 12px", borderRadius: 14, background: CH.c, color: "#0E2A33", fontFamily: FONT, fontSize: 38 }}><Icon n="flask-conical" size={36} color="#0E2A33" />খাতা-কলমে বিজ্ঞানী: পরীক্ষা করে দেখি</span></Pop></div>
    <div style={{ position: "absolute", left: 400, top: 200, transform: `translateY(${interpolate(f, [4, 24], [700, 0], { ...cl, easing: ease })}px)` }}>
      <Notebook w={s.fig ? 860 : 1420} h={720}>
        <div style={{ fontFamily: FONT, fontSize: 34, color: RED }}>যা লাগবে</div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 14, margin: "10px 0 22px" }}>
          {need.map((n, j) => { const k = interpolate(f, [16 + j * 6, 26 + j * 6], [0, 1], cl);
            return <div key={j} style={{ display: "flex", alignItems: "center", gap: 8, padding: "6px 14px", borderRadius: 12, background: "#EAF3FF", border: "2px solid #9CC1EE", fontFamily: BN, fontWeight: 600, fontSize: 25, color: INK, opacity: k, transform: `scale(${0.7 + 0.3 * k})` }}><Icon n={n.icon} size={26} color="#2E6FC0" />{n.t}</div>; })}
        </div>
        <div style={{ fontFamily: FONT, fontSize: 34, color: RED }}>ধাপগুলো</div>
        {steps.map((t, j) => { const at = vAt(s, 0.18 + (0.72 * j) / Math.max(1, steps.length)); const k = interpolate(f, [at, at + 10], [0, 1], cl); const done = f > at + 30;
          return <div key={j} style={{ display: "flex", gap: 14, alignItems: "flex-start", marginTop: 12, opacity: k }}>
            <div style={{ flex: "none", width: 36, height: 36, borderRadius: 8, border: `3px solid ${INK}`, display: "grid", placeItems: "center", marginTop: 4, background: done ? "#D9F7CF" : "transparent" }}>{done && <L.Check size={28} color="#1E8A3A" strokeWidth={3.5} />}</div>
            <div style={{ fontFamily: BN, fontWeight: 600, fontSize: s.fig ? 29 : 31, color: INK, lineHeight: 1.35 }}><span style={{ fontFamily: FONT, color: "#2E6FC0" }}>{bn(j + 1)}.</span> {t}</div>
          </div>; })}
        {s.safe && <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, padding: "10px 16px", borderRadius: 12, background: "#FFE8E0", border: `2px solid ${RED}`, fontFamily: BN, fontWeight: 600, fontSize: 24, color: "#8A2A1A", opacity: interpolate(f, [vAt(s, 0.85), vAt(s, 0.92)], [0, 1], cl) }}>⚠ নিরাপত্তা: {s.safe}</div>}
      </Notebook>
    </div>
    {s.fig && <Fig name={s.fig} s={s} args={s.args} x={1290} y={300} w={600} />}
    <SFX at={6} name="whoosh" vol={0.2} />
  </AbsoluteFill>;
};

const Observe: React.FC<P> = ({ s, spec, i }) => {
  const f = useCurrentFrame(); const rev = vAt(s, s.revealAt || 0.45);
  return <AbsoluteFill>
    <Presenter s={s} spec={spec} i={i} />
    <Heading text="তুমি কী দেখলে?" tag="খাতায় লেখো" icon="notebook-pen" tagColor={CH.p} />
    <div style={{ position: "absolute", left: 430, top: 330, right: 130, display: "flex", gap: 40 }}>
      <Rise d={10} style={{ flex: 1 }}><Notebook w={640} h={430} rot={-1.5}>
        <div style={{ fontFamily: FONT, fontSize: 32, color: RED }}>প্রশ্ন</div>
        {(s.qs || []).map((q: string, j: number) => <div key={j} style={{ fontFamily: BN, fontWeight: 600, fontSize: 30, color: INK, marginTop: 12, lineHeight: 1.35, opacity: interpolate(f, [14 + j * 14, 24 + j * 14], [0, 1], cl) }}>{bn(j + 1)}. {q}</div>)}
      </Notebook></Rise>
      <div style={{ flex: 1, opacity: interpolate(f, [rev, rev + 12], [0, 1], cl), transform: `scale(${interpolate(f, [rev, rev + 14], [0.85, 1], { ...cl, easing: ease })})` }}>
        <div style={{ padding: "26px 32px", borderRadius: 22, border: `4px solid ${CH.g}`, background: "rgba(166,242,143,.08)" }}>
          <div style={{ fontFamily: FONT, fontSize: 38, color: CH.g, display: "flex", alignItems: "center", gap: 10 }}><L.Eye size={38} color={CH.g} />যা দেখার কথা</div>
          <div style={{ fontFamily: BN, fontWeight: 600, fontSize: 34, color: CH.w, marginTop: 12, lineHeight: 1.4 }}>{s.a}</div>
        </div>
      </div>
    </div>
    <SFX at={rev} name="chime" vol={0.22} />
  </AbsoluteFill>;
};

const Myth: React.FC<P> = ({ s, spec, i }) => {
  const f = useCurrentFrame(); const { fps } = useVideoConfig(); const st = vAt(s, 0.36); const k = pop(f, fps, st); const r = vAt(s, 0.5);
  return <AbsoluteFill>
    <Presenter s={s} spec={spec} i={i} />
    <Heading text="ভুল ধারণা ভাঙি" tag="মিথ বনাম বিজ্ঞান" icon="shield-alert" tagColor={CH.r} />
    <div style={{ position: "absolute", left: 430, top: 330, right: 120, display: "flex", gap: 40 }}>
      <Rise d={8} style={{ flex: 1, position: "relative" }}><div style={{ padding: "28px 34px", borderRadius: 22, background: "rgba(255,122,122,.08)", border: `3px dashed ${CH.r}`, minHeight: 330 }}>
        <div style={{ fontFamily: FONT, fontSize: 38, color: CH.r }}>✗ অনেকে ভাবে…</div>
        <div style={{ fontFamily: BN, fontWeight: 600, fontSize: 36, color: CH.w, marginTop: 14, lineHeight: 1.4, textDecoration: f > st + 10 ? `line-through ${CH.r}` : "none", opacity: f > st + 10 ? 0.6 : 1 }}>{s.wrong}</div>
        <div style={{ position: "absolute", right: 30, bottom: 30, padding: "4px 26px 10px", border: `6px solid ${CH.r}`, borderRadius: 14, color: CH.r, fontFamily: FONT, fontSize: 62, transform: `rotate(-14deg) scale(${2 - k})`, opacity: Math.min(1, k * 1.5) }}>ভুল!</div>
      </div></Rise>
      <div style={{ flex: 1, opacity: interpolate(f, [r, r + 12], [0, 1], cl), transform: `translateX(${interpolate(f, [r, r + 14], [40, 0], { ...cl, easing: ease })}px)` }}>
        <div style={{ padding: "28px 34px", borderRadius: 22, background: "rgba(166,242,143,.10)", border: `3px solid ${CH.g}`, minHeight: 330 }}>
          <div style={{ fontFamily: FONT, fontSize: 38, color: CH.g }}>✓ আসলে</div>
          <div style={{ fontFamily: BN, fontWeight: 600, fontSize: 36, color: CH.w, marginTop: 14, lineHeight: 1.4 }}>{s.right}</div>
        </div>
      </div>
    </div>
    <SFX at={st} name="hit" vol={0.3} /><SFX at={r} name="chime" vol={0.2} />
  </AbsoluteFill>;
};

const Quiz: React.FC<P> = ({ s, spec, i }) => {
  const f = useCurrentFrame(); const hA = LEAD + s.frames, hB = hA + (s.hold || 0); const reveal = f >= hB; const left = Math.max(0, Math.ceil((hB - f) / 30));
  return <AbsoluteFill>
    <Presenter s={s} spec={spec} i={i} pose={reveal ? "wave" : "point"} />
    <Heading text="ছোট্ট কুইজ" tag="তুমি পারবে?" icon="circle-help" tagColor={CH.o} />
    <div style={{ position: "absolute", left: 430, top: 300, right: 130 }}>
      <Chalk size={46} at={8} dur={26} font={BN}>{s.q}</Chalk>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 22, marginTop: 34 }}>
        {(s.o || []).map((o: string, j: number) => { const k = interpolate(f, [vAt(s, 0.3 + j * 0.12), vAt(s, 0.3 + j * 0.12) + 10], [0, 1], cl); const ok = j === s.a;
          return <div key={j} style={{ display: "flex", gap: 16, alignItems: "center", padding: "18px 24px", borderRadius: 16, background: reveal ? (ok ? "#D9F7CF" : "rgba(255,255,255,.05)") : PAPER, border: reveal && ok ? `4px solid ${CH.g}` : "4px solid transparent",
            opacity: k * (reveal && !ok ? 0.45 : 1), transform: `rotate(${(j % 2 ? 1 : -1) * 0.8}deg) scale(${reveal && ok ? 1.04 : 1})`, boxShadow: "0 14px 30px rgba(0,0,0,.35)" }}>
            <div style={{ flex: "none", width: 50, height: 50, borderRadius: 25, background: reveal && ok ? "#1E8A3A" : "#2E6FC0", color: "#fff", display: "grid", placeItems: "center", fontFamily: FONT, fontSize: 30 }}>{reveal && ok ? "✓" : "কখগঘ"[j]}</div>
            <div style={{ fontFamily: BN, fontWeight: 600, fontSize: 32, color: reveal && !ok ? CH.w : INK, lineHeight: 1.3 }}>{o}</div>
          </div>; })}
      </div>
    </div>
    {f >= hA && !reveal && <div style={{ position: "absolute", right: 120, top: 120, width: 120, height: 120, borderRadius: 60, border: `6px solid ${CH.o}`, display: "grid", placeItems: "center", fontFamily: FONT, fontSize: 64, color: CH.o }}>{bn(left)}</div>}
    {f >= hA && !reveal && <Sequence from={hA} durationInFrames={hB - hA}><Audio src={staticFile("velki/sfx/tick.mp3")} volume={0.25} loop /></Sequence>}
    <SFX at={hB} name="chime" vol={0.3} />
  </AbsoluteFill>;
};

const Recap: React.FC<P> = ({ s, spec, i }) => {
  const f = useCurrentFrame(); const items: string[] = s.items || []; const cols = ["#FFF1B8", "#C9F7E1", "#D6ECFF", "#FFD9EC"];
  return <AbsoluteFill>
    <Presenter s={s} spec={spec} i={i} pose="wave" />
    <Heading text="মনে রাখো" tag="আজকের ভেলকি" icon="sparkles" tagColor={CH.y} />
    <div style={{ position: "absolute", left: 440, top: 320, right: 120, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 34 }}>
      {items.map((t, j) => { const at = vAt(s, 0.05 + (0.8 * j) / Math.max(1, items.length)); const k = pop(f, 30, at);
        return <div key={j} style={{ position: "relative", padding: "30px 30px 26px", background: cols[j % 4], borderRadius: 6, boxShadow: "0 18px 34px rgba(0,0,0,.4)", transform: `rotate(${(j % 2 ? 1.6 : -1.8)}deg) scale(${0.4 + 0.6 * k})`, opacity: Math.min(1, k * 1.5), minHeight: 150 }}>
          <div style={{ position: "absolute", left: "50%", top: -14, width: 28, height: 28, marginLeft: -14, borderRadius: 14, background: [CH.r, CH.b, CH.g, CH.o][j % 4], boxShadow: "0 4px 8px rgba(0,0,0,.4)" }} />
          <div style={{ fontFamily: BN, fontWeight: 700, fontSize: 33, color: INK, lineHeight: 1.35 }}>{t}</div>
        </div>; })}
    </div>
    {items.map((_, j) => <SFX key={j} at={vAt(s, 0.05 + (0.8 * j) / Math.max(1, items.length))} name="pop" vol={0.2} />)}
  </AbsoluteFill>;
};

const Outro: React.FC<P> = ({ s, spec }) => {
  const f = useCurrentFrame(); const a = amp(s.amp, Math.round(f - LEAD));
  return <AbsoluteFill>
    <div style={{ position: "absolute", left: 110, bottom: 40 }}><Pop d={2}><Prof size={430} a={a} pose="wave" /></Pop>
      <div style={{ position: "absolute", left: 0, right: 0, bottom: -10, display: "flex", justifyContent: "center" }}><NamePlate big /></div></div>
    <div style={{ position: "absolute", left: 700, top: 180, right: 120 }}>
      <Chalk size={76} at={6} dur={26} color={CH.y}>এবার তোমার পালা!</Chalk>
      <Chalk size={44} at={30} dur={24} style={{ marginTop: 18 }}>{s.line || "খাতা খোলো, পরীক্ষাটা করে ফেলো, যা দেখলে লিখে রাখো।"}</Chalk>
      {spec.next && <Rise d={56}><div style={{ marginTop: 50, padding: "22px 30px", border: `3px dashed ${CH.c}`, borderRadius: 20, display: "inline-block" }}>
        <div style={{ fontFamily: FONT, fontSize: 30, color: CH.c }}>পরের পাঠে</div>
        <div style={{ fontFamily: BN, fontWeight: 700, fontSize: 40, color: CH.w, marginTop: 6 }}>{spec.next}</div></div></Rise>}
      <Rise d={70}><div style={{ marginTop: 50, display: "flex", alignItems: "center", gap: 22 }}>
        <Img src={staticFile("brand/logo-dark.png")} style={{ height: 70 }} />
        <div style={{ fontFamily: BN, fontSize: 24, color: CH.dim, lineHeight: 1.4 }}>প্রফেসর চমক একজন এআই প্রশিক্ষক।<br />ছোটরা পরীক্ষাগুলো বড়দের সাথে করবে।</div>
      </div></Rise>
    </div>
    <SFX at={6} name="swell" vol={0.25} />
  </AbsoluteFill>;
};

const SCENES: Record<string, React.FC<P>> = { hook: Hook, title: Title, explain: Explain, fig: FigScene, wow: Wow, bd: Bd, lab: Lab, observe: Observe, myth: Myth, quiz: Quiz, recap: Recap, outro: Outro };

/* ---------- board, frame, header, captions ---------- */
export const Board: React.FC = () => {
  const smudges = React.useMemo(() => Array.from({ length: 16 }, (_, i) => ({ x: random(`bx${i}`) * 1920, y: random(`by${i}`) * 1080, r: 160 + random(`br${i}`) * 300, o: 0.025 + random(`bo${i}`) * 0.035 })), []);
  return <AbsoluteFill style={{ background: "radial-gradient(ellipse at 50% 40%, #2C5247 0%, #1E3D35 55%, #142A24 100%)" }}>
    {smudges.map((s, i) => <div key={i} style={{ position: "absolute", left: s.x - s.r, top: s.y - s.r, width: s.r * 2, height: s.r * 1.2, borderRadius: "50%", background: `radial-gradient(ellipse, rgba(255,255,255,${s.o}) 0%, transparent 70%)` }} />)}
    <svg width="1920" height="1080" style={{ position: "absolute", opacity: 0.07 }}>
      {Array.from({ length: 10 }, (_, i) => <path key={i} d={`M${random(`sx${i}`) * 1900} ${random(`sy${i}`) * 1060} q${60 + random(`q${i}`) * 120} ${-40 + random(`w${i}`) * 80} ${200 + random(`e${i}`) * 200} ${-20 + random(`r${i}`) * 40}`} stroke="#fff" strokeWidth={20} fill="none" strokeLinecap="round" />)}
    </svg>
  </AbsoluteFill>;
};
export const Frame: React.FC = () => (
  <AbsoluteFill style={{ pointerEvents: "none" }}>
    <div style={{ position: "absolute", inset: 0, border: "22px solid #6B4423", boxShadow: "inset 0 0 0 4px #4A2E16, inset 0 0 40px rgba(0,0,0,.6)", borderImage: "linear-gradient(135deg,#8B5E34,#5C3A1C 40%,#7A5030 70%,#4F3118) 1" }} />
    <div style={{ position: "absolute", left: 22, right: 22, bottom: 22, height: 20, background: "linear-gradient(#8B5E34,#5C3A1C)", boxShadow: "0 -4px 10px rgba(0,0,0,.4)" }} />
    {[[300, "#F4F1E8"], [360, "#FFE27A"], [1600, "#FF9EC4"]].map(([x, c], i) => <div key={i} style={{ position: "absolute", left: x as number, bottom: 34, width: 54, height: 13, borderRadius: 4, background: c as string, transform: `rotate(${i * 4 - 3}deg)` }} />)}
    <div style={{ position: "absolute", left: 1680, bottom: 30, width: 120, height: 26, borderRadius: 6, background: "linear-gradient(#3a3a3a 0 45%, #c8b08a 45%)" }} />
  </AbsoluteFill>
);
const Header: React.FC<{ spec: Spec; idx: number; n: number }> = ({ spec, idx, n }) => (
  <div style={{ position: "absolute", left: 60, right: 60, top: 44, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
    <div style={{ display: "flex", alignItems: "center", gap: 14, fontFamily: FONT, fontSize: 30, color: CH.y, filter: "url(#chalkTxt)" }}><L.FlaskConical size={32} color={CH.y} />কচু বিজ্ঞানী <span style={{ color: CH.dim, fontSize: 26 }}>· পাঠ {bn(spec.lessonNo)}</span></div>
    <div style={{ display: "flex", gap: 10 }}>{Array.from({ length: n }, (_, i) => <div key={i} style={{ width: i === idx ? 30 : 12, height: 12, borderRadius: 6, background: i <= idx ? CH.y : "rgba(255,255,255,.18)" }} />)}</div>
    <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
      <span style={{ padding: "4px 14px 6px", borderRadius: 20, background: CH.c, color: "#0E2A33", fontFamily: BN, fontWeight: 700, fontSize: 19 }}>এআই প্রশিক্ষক</span>
      <Img src={staticFile("brand/logo-dark.png")} style={{ height: 46 }} />
    </div>
  </div>
);
// eraser wipe at the start of every scene (felt eraser + chalk dust), new content is revealed behind it
const Wipe: React.FC = () => {
  const f = useCurrentFrame(); const k = interpolate(f, [0, 12], [0, 1], { ...cl, easing: Easing.inOut(Easing.quad) });
  if (f > 14) return null;
  const x = -300 + 2400 * k;
  return <>
    <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: Math.max(0, x), background: "linear-gradient(90deg, transparent, rgba(255,255,255,.05) 80%, rgba(255,255,255,.12))" }} />
    <div style={{ position: "absolute", left: x - 90, top: 380 + Math.sin(k * 12) * 60, width: 240, height: 110, borderRadius: 14, transform: "rotate(-8deg)", background: "linear-gradient(#5a3a1f 0 52%, #d9c7a4 52%)", boxShadow: "0 20px 40px rgba(0,0,0,.5)" }} />
  </>;
};
const Captions: React.FC<{ s: Scene }> = ({ s }) => {
  const f = useCurrentFrame();
  const parts = s.vo.split(/(?<=[।?!])\s+/).filter(Boolean); const tot = parts.reduce((n, x) => n + x.length, 0); let acc = 0;
  const lf = f - LEAD; if (lf < 0 || lf > s.frames + 6) return null;
  const cur = parts.map((x) => { const a = (acc / tot) * s.frames; acc += x.length; return { x, a, b: (acc / tot) * s.frames }; }).find((c) => lf >= c.a && lf < c.b + 6);
  if (!cur || s.type === "hook" || s.type === "outro" || s.noCap) return null;
  return <div style={{ position: "absolute", left: 400, right: 80, bottom: 62, display: "flex", justifyContent: "center" }}>
    <div style={{ maxWidth: 1360, padding: "8px 26px 11px", borderRadius: 12, background: "rgba(10,24,20,.78)", fontFamily: BN, fontWeight: 500, fontSize: 31, color: "#F4F1E8", textAlign: "center", lineHeight: 1.35 }}>{cur.x.replace(/[।,]$/, "")}</div>
  </div>;
};

export const ChalkDefs: React.FC = () => (
  <svg width="0" height="0" style={{ position: "absolute" }}>
      <filter id="chalk" x="-5%" y="-5%" width="110%" height="110%"><feTurbulence type="fractalNoise" baseFrequency="1.1" numOctaves="1" seed="7" result="n" /><feColorMatrix in="n" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  -1.5 0 0 0 1.45" result="h" /><feComposite in="SourceGraphic" in2="h" operator="in" result="g" /><feDisplacementMap in="g" in2="n" scale="2.4" /></filter>
      <filter id="chalkTxt" x="-5%" y="-10%" width="110%" height="120%"><feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="1" seed="3" result="n" /><feColorMatrix in="n" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  -1.2 0 0 0 1.4" result="h" /><feComposite in="SourceGraphic" in2="h" operator="in" /></filter>
    </svg>
);

export const VelkiVideo: React.FC<{ spec: Spec }> = ({ spec }) => {
  const f = useCurrentFrame(); const total = velkiLen(spec);
  let from = 0; const seqs = spec.scenes.map((s, i) => { const len = sceneLen(s); const st = from; from += len; return { s, i, st, len }; });
  const busy = (fr: number) => seqs.some(({ s, st }) => fr >= st + LEAD && fr < st + LEAD + s.frames);
  const idx = Math.max(0, seqs.findIndex(({ st, len }) => f >= st && f < st + len));
  return <AbsoluteFill style={{ background: "#142A24" }}>
    <ChalkDefs />
    <Board />
    {seqs.map(({ s, i, st, len }) => { const C = SCENES[s.type] || Explain;
      return <Sequence key={i} from={st} durationInFrames={len}>
        <AbsoluteFill style={{ opacity: interpolate(f - st, [len - 8, len], [1, 0], cl) }}><C s={s} spec={spec} i={i} /></AbsoluteFill>
        <Captions s={s} />
        <Wipe />
        <Sequence from={LEAD}><Audio src={staticFile(`velki/${spec.id}/vo/${String(i + 1).padStart(2, "0")}.mp3`)} /></Sequence>
      </Sequence>; })}
    <Header spec={spec} idx={idx} n={seqs.length} />
    {spec.credits && Object.keys(spec.credits).length > 0 && <div style={{ position: "absolute", right: 70, bottom: 46, fontFamily: BN, fontSize: 15, color: "rgba(244,241,232,.45)" }}>ছবি: {Object.values(spec.credits).join(" · ")}</div>}
    <Frame />
    <Audio src={staticFile("velki/music.mp3")} loop volume={(fr) => (busy(fr) ? 0.045 : 0.12) * interpolate(fr, [0, 30, total - 60, total], [0, 1, 1, 0], cl)} />
  </AbsoluteFill>;
};
