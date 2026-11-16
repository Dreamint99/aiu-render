// AI University anthem music video — "টেকনাফ থেকে তেতুলিয়া" (song: Google Lyria 3 Pro via OpenRouter, take A).
// Data-driven: film.json = { total, shots[], lyrics[], flashes[] } in seconds. Assets in public/song/ (veo/, rec/, song.mp3, logo-dark.png).
import React from "react";
import { AbsoluteFill, Audio, Img, OffthreadVideo, Sequence, interpolate, spring, staticFile, useCurrentFrame, Easing } from "remotion";
import MAP from "./bdmap.json";

export const FPS = 30;
const S = (p: string) => staticFile("song/" + p);
const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const ease = Easing.bezier(0.16, 1, 0.3, 1);
const BN = "Anek";
const C = { navy: "#011835", blue: "#0050ED", sky: "#5B9BFF", gold: "#F5B942", ice: "#CFE0FF" };
const GOLDG = "linear-gradient(95deg,#FFE29A,#F5B942 50%,#FF9F43)";

if (typeof document !== "undefined") {
  const f = new FontFace("Anek", `url(${staticFile("fonts/AnekBangla.ttf")})`, { weight: "100 900" });
  f.load().then(() => document.fonts.add(f)).catch(() => {});
}

export type Shot = {
  from: number; to: number; kind: "full" | "phone" | "laptop" | "map" | "logo" | "split";
  src?: string; src2?: string; start?: number; rate?: number; zoom?: [number, number]; pan?: [number, number]; text?: string; sub?: string; tint?: string;
};
export type Lyric = { from: number; to: number; text: string; style?: "big" | "name" | "small" | "hook"; pos?: "bottom" | "center" | "left" };
export type Film = { total: number; shots: Shot[]; lyrics: Lyric[]; flashes: number[] };

const Vid: React.FC<{ s: Shot; len: number; src: string }> = ({ s, len, src }) => {
  const f = useCurrentFrame();
  const z = s.zoom || [1.05, 1.15];
  const k = interpolate(f, [0, len], z, clamp);
  const [px, py] = s.pan || [0, 0];
  const t = interpolate(f, [0, len], [0, 1], clamp);
  return (
    <AbsoluteFill style={{ overflow: "hidden", background: "#000" }}>
      <OffthreadVideo src={S(src)} muted playbackRate={s.rate || 1} startFrom={Math.round((s.start || 0) * FPS)}
        style={{ width: "100%", height: "100%", objectFit: "cover", transform: `scale(${k}) translate(${px * t}px, ${py * t}px)` }} />
    </AbsoluteFill>
  );
};

// warm cinematic grade + vignette
const Grade: React.FC<{ tint?: string }> = ({ tint }) => (
  <>
    <AbsoluteFill style={{ background: tint || "linear-gradient(180deg, rgba(0,40,90,.20), rgba(255,140,40,.12))", mixBlendMode: "soft-light" }} />
    <AbsoluteFill style={{ background: "radial-gradient(ellipse at center, transparent 52%, rgba(0,0,0,.6) 100%)" }} />
  </>
);

const Device: React.FC<{ s: Shot; len: number }> = ({ s, len }) => {
  const f = useCurrentFrame();
  const p = spring({ frame: f, fps: FPS, config: { damping: 16, mass: 0.7 } });
  const phone = s.kind === "phone";
  const W = phone ? 440 : 1240, H = phone ? 940 : 700;
  const rot = interpolate(f, [0, len], phone ? [-8, 4] : [5, -3], clamp);
  return (
    <AbsoluteFill>
      {s.src2 ? (
        <>
          <Vid s={{ ...s, rate: 1, start: 0, zoom: [1.2, 1.3] }} len={len} src={s.src2} />
          <AbsoluteFill style={{ background: "rgba(1,24,53,.62)" }} />
        </>
      ) : (
        <AbsoluteFill style={{ background: "radial-gradient(circle at 50% 40%, #0b3a8c, #011835 70%)" }} />
      )}
      <div style={{
        position: "absolute", left: "50%", top: "52%", width: W, height: H, borderRadius: phone ? 60 : 24, overflow: "hidden", background: "#000",
        transform: `translate(-50%,-50%) perspective(1600px) rotateY(${rot}deg) scale(${0.82 + 0.18 * p})`,
        boxShadow: "0 60px 140px rgba(0,0,0,.65), 0 0 0 14px #0c1220, 0 0 90px rgba(91,155,255,.5)",
      }}>
        <OffthreadVideo src={S(s.src!)} muted playbackRate={s.rate || 1} startFrom={Math.round((s.start || 0) * FPS)}
          style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "top", transform: "scale(1.16)", transformOrigin: "50% 100%" }} />
      </div>
    </AbsoluteFill>
  );
};

const MapShot: React.FC<{ len: number }> = ({ len }) => {
  const f = useCurrentFrame();
  const draw = interpolate(f, [0, 36], [0, 1], { ...clamp, easing: ease });
  const line = interpolate(f, [16, Math.max(30, len - 12)], [0, 1], { ...clamp, easing: ease });
  const pin = (x: number, y: number, name: string, d: number, left: boolean) => {
    const p = spring({ frame: f - d, fps: FPS, config: { damping: 11 } });
    return (
      <g transform={`translate(${x} ${y})`} opacity={Math.min(1, p * 2)}>
        <circle r={18 + 26 * ((f % 30) / 30)} fill="none" stroke={C.gold} strokeWidth={3} opacity={1 - (f % 30) / 30} />
        <circle r={13 * p} fill={C.gold} />
        <text x={left ? -28 : 28} y={15} textAnchor={left ? "end" : "start"} fontFamily={BN} fontWeight={800} fontSize={52} fill="#fff">{name}</text>
      </g>
    );
  };
  return (
    <AbsoluteFill style={{ background: "radial-gradient(circle at 60% 45%, #0a3a8f, #011835 65%, #000 100%)" }}>
      <svg viewBox="-40 -20 740 898" style={{ position: "absolute", height: 960, left: "68%", top: 60, transform: `translateX(-50%) scale(${interpolate(f, [0, len], [1, 1.07], clamp)})`, overflow: "visible" }}>
        <defs><linearGradient id="sg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#7fb0ff" /><stop offset="1" stopColor="#2f6bff" /></linearGradient></defs>
        <path d={(MAP as any).d} pathLength={1} fill="url(#sg)" fillOpacity={0.5 * draw} stroke="#9CC2FF" strokeWidth={3} strokeDasharray="1 1" strokeDashoffset={1 - draw} />
        <path d="M543,805 Q 420,360 44,30" pathLength={1} fill="none" stroke={C.gold} strokeWidth={6} strokeDasharray="1 1" strokeDashoffset={1 - line} strokeLinecap="round" />
        {pin(543, 805, "টেকনাফ", 4, true)}
        {pin(44, 30, "তেঁতুলিয়া", Math.max(20, len - 24), false)}
      </svg>
    </AbsoluteFill>
  );
};

const Logo: React.FC<{ s: Shot; len: number }> = ({ s }) => {
  const f = useCurrentFrame();
  const p = spring({ frame: f, fps: FPS, config: { damping: 14 } });
  const q = spring({ frame: f - 14, fps: FPS, config: { damping: 16 } });
  return (
    <AbsoluteFill style={{ background: "radial-gradient(circle at 50% 45%, #0b47b8, #011835 60%, #000 100%)", alignItems: "center", justifyContent: "center" }}>
      <div style={{ position: "absolute", width: 900, height: 900, borderRadius: 999, border: "2px solid rgba(91,155,255,.35)", transform: `scale(${0.6 + 0.5 * ((f % 45) / 45)})`, opacity: 1 - (f % 45) / 45 }} />
      <Img src={S("logo-dark.png")} style={{ height: 200, transform: `scale(${0.7 + 0.3 * p})`, opacity: p }} />
      {s.text && <div style={{ fontFamily: BN, fontWeight: 800, fontSize: 88, color: "#fff", marginTop: 44, opacity: q, transform: `translateY(${30 * (1 - q)}px)` }}>{s.text}</div>}
      {s.sub && <div style={{ fontFamily: BN, fontWeight: 700, fontSize: 56, marginTop: 14, opacity: q, background: GOLDG, WebkitBackgroundClip: "text", color: "transparent" }}>{s.sub}</div>}
    </AbsoluteFill>
  );
};

const ShotView: React.FC<{ s: Shot; len: number }> = ({ s, len }) => {
  if (s.kind === "map") return <MapShot len={len} />;
  if (s.kind === "logo") return <Logo s={s} len={len} />;
  if (s.kind === "phone" || s.kind === "laptop") return <><Device s={s} len={len} /><Grade tint="transparent" /></>;
  if (s.kind === "split") return (
    <AbsoluteFill style={{ flexDirection: "row", background: "#000" }}>
      <div style={{ flex: 1, position: "relative", overflow: "hidden" }}><Vid s={s} len={len} src={s.src!} /></div>
      <div style={{ width: 8, background: C.gold }} />
      <div style={{ flex: 1, position: "relative", overflow: "hidden" }}><Vid s={{ ...s, start: 0 }} len={len} src={s.src2!} /></div>
      <Grade tint={s.tint} />
    </AbsoluteFill>
  );
  return <><Vid s={s} len={len} src={s.src!} /><Grade tint={s.tint} /></>;
};

// big lyric text, word-by-word pop; "*word*" or style name = gold
const LyricView: React.FC<{ l: Lyric; len: number }> = ({ l, len }) => {
  const f = useCurrentFrame();
  const words = l.text.split(" ");
  const step = l.style === "small" ? 2 : Math.max(2, Math.min(7, Math.floor((len * 0.4) / words.length)));
  const out = interpolate(f, [len - 5, len], [1, 0], clamp);
  const size = l.style === "hook" ? 150 : l.style === "name" ? 132 : l.style === "small" ? 62 : 98;
  const center = l.pos === "center" || l.style === "hook" || l.style === "name";
  return (
    <AbsoluteFill style={{ justifyContent: center ? "center" : l.pos === "left" ? "center" : "flex-end", alignItems: l.pos === "left" ? "flex-start" : "center", padding: center ? 0 : l.pos === "left" ? "0 0 0 130px" : "0 120px 110px", opacity: out }}>
      <div style={{ display: "flex", flexWrap: "wrap", justifyContent: l.pos === "left" ? "flex-start" : "center", gap: "0 28px", maxWidth: l.pos === "left" ? 820 : 1680 }}>
        {words.map((w, i) => {
          const p = spring({ frame: f - i * step, fps: FPS, config: { damping: 12, mass: 0.5 } });
          const gold = l.style === "name" || w.includes("*");
          return (
            <span key={i} style={{
              fontFamily: BN, fontWeight: 800, fontSize: size, lineHeight: 1.2, display: "inline-block",
              transform: `translateY(${50 * (1 - p)}px) scale(${0.7 + 0.3 * p})`, opacity: Math.min(1, p * 1.6),
              ...(gold ? { background: GOLDG, WebkitBackgroundClip: "text", color: "transparent", filter: "drop-shadow(0 6px 22px rgba(0,0,0,.8))" }
                : { color: "#fff", textShadow: "0 6px 30px rgba(0,0,0,.9), 0 0 44px rgba(0,80,237,.65)" }),
            }}>{w.replace(/\*/g, "")}</span>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};

const Flash: React.FC = () => {
  const f = useCurrentFrame();
  return <AbsoluteFill style={{ background: "#fff", opacity: interpolate(f, [0, 5], [0.7, 0], clamp) }} />;
};

export const SongFilm: React.FC<{ film: Film }> = ({ film }) => {
  const fr = (s: number) => Math.round(s * FPS);
  return (
    <AbsoluteFill style={{ background: "#000" }}>
      <Audio src={S("song.mp3")} />
      {film.shots.map((s, i) => (
        <Sequence key={"s" + i} from={fr(s.from)} durationInFrames={Math.max(1, fr(s.to) - fr(s.from))}>
          <ShotView s={s} len={fr(s.to) - fr(s.from)} />
        </Sequence>
      ))}
      {film.flashes.map((t, i) => <Sequence key={"f" + i} from={fr(t)} durationInFrames={6}><Flash /></Sequence>)}
      {film.lyrics.map((l, i) => (
        <Sequence key={"l" + i} from={fr(l.from)} durationInFrames={Math.max(1, fr(l.to) - fr(l.from))}>
          <LyricView l={l} len={fr(l.to) - fr(l.from)} />
        </Sequence>
      ))}
      <div style={{ position: "absolute", left: 0, right: 0, top: 0, height: 50, background: "#000" }} />
      <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: 50, background: "#000" }} />
      <Img src={S("logo-dark.png")} style={{ position: "absolute", right: 56, top: 72, height: 44, opacity: 0.85 }} />
    </AbsoluteFill>
  );
};
