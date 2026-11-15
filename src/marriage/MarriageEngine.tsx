// AI University — "সুখী দাম্পত্য" lesson engine (2026-11-16). Warm counselling-room look: cream paper, dusty rose, warm gold,
// plum ink; storybook backgrounds (free Cloudflare model, no people), an illustrated couple রিনা-রাশেদ (SVG, expressive faces,
// always fully clothed and modest), the এআই পরামর্শক নীলা, "ভুল বনাম ঠিক" panels, research cards with sources, exercise cards.
// Every scene is a sequence of voiced segments: {c: counsellor text} or {who: "rina"|"rashed", t: line, think?, mood?}.
// scripts/marriage_make.py voices each segment (counsellor = Madhusmita, রিনা = Girija, রাশেদ = Ashwat) and writes f (frames) + src.
// Scenes: title · counsel · story · versus · enemy · fact · points · signals · myth · exercise · help · recap · outro
import React from "react";
import { AbsoluteFill, Audio, Img, Sequence, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig, Easing, delayRender, continueRender } from "remotion";

export const K = {
  cream: "#FBF4EA", paper: "#FFFBF5", ink: "#3A2235", dim: "rgba(58,34,53,.66)", faint: "rgba(58,34,53,.12)", line: "rgba(58,34,53,.14)",
  rose: "#D9677F", roseL: "#F6D3D9", rose2: "#B84A66", gold: "#C9973A", goldL: "#F4E2B8", plum: "#5B2C55", sage: "#6E9C82", sageL: "#DCEBDF",
  red: "#C8473F", redL: "#F8DAD5", green: "#3F8F63", greenL: "#D8EEDF", amber: "#D99A22", amberL: "#FBEBC7", sky: "#5E8CA8",
};
const BN = "Anek", SERIF = "Tiro";
if (typeof document !== "undefined") {
  for (const [n, u, w] of [["Anek", "fonts/AnekBangla.ttf", "100 900"], ["Tiro", "fonts/TiroBangla-Regular.ttf", "400"]]) {
    const h = delayRender(`font ${n}`);
    const ff = new FontFace(n, `url(${staticFile(u)})`, { weight: w });
    ff.load().then(() => { document.fonts.add(ff); continueRender(h); }).catch(() => continueRender(h));
  }
}
const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const ease = Easing.bezier(0.16, 1, 0.3, 1);
const bn = (n: number | string) => String(n).replace(/\d/g, (d) => "০১২৩৪৫৬৭৮৯"[+d]);
const pop = (f: number, fps: number, d: number) => spring({ frame: f - d, fps, config: { damping: 14, mass: 0.6 } });

export type Seg = { c?: string; who?: "rina" | "rashed"; t?: string; think?: boolean; side?: "bad" | "good"; mood?: Record<string, string>; f?: number; src?: string };
export type Scene = { type: string; seq: Seg[]; hold?: number; [k: string]: any };
export type Spec = { id: string; course: string; module: string; lessonNo: string; title: string; next: string; adult?: boolean; scenes: Scene[] };
const LEAD = 14, TAIL = 18, GAP = 9;
const segF = (g: Seg) => g.f || Math.max(45, Math.round(((g.c || g.t || "").length) * 2.1));
const voLen = (s: Scene) => s.seq.reduce((n, g, i) => n + segF(g) + (i ? GAP : 0), 0);
const segStarts = (s: Scene) => s.seq.reduce<number[]>((a, g, i) => [...a, i ? a[i - 1] + segF(s.seq[i - 1]) + GAP : 0], []);
const sceneLen = (s: Scene) => LEAD + voLen(s) + (s.hold || 0) + TAIL;
export const marLen = (spec: Spec) => spec.scenes.reduce((n, s) => n + sceneLen(s), 0) + 36;
type P = { s: Scene; spec: Spec; vo: number; st: number[] };
const v = (p: P, x: number) => LEAD + p.vo * x;                                   // fraction of the whole scene's speech
const at = (p: P, k: number, x = 0) => LEAD + (p.st[Math.min(k, p.st.length - 1)] || 0) + segF(p.s.seq[Math.min(k, p.s.seq.length - 1)]) * x; // inside segment k
const COL: Record<string, string> = { r: K.rose2, g: K.gold, p: K.plum, s: K.sage, d: K.red, k: K.green, i: K.ink };

/* ---------- primitives ---------- */
const Fade: React.FC<{ at: number; children: React.ReactNode; style?: React.CSSProperties; y?: number }> = ({ at: a, children, style, y = 18 }) => {
  const f = useCurrentFrame(); const o = interpolate(f, [a, a + 14], [0, 1], { ...clamp, easing: ease });
  return <div style={{ opacity: o, transform: `translateY(${(1 - o) * y}px)`, ...style }}>{children}</div>;
};
const Pop: React.FC<{ at: number; children: React.ReactNode; style?: React.CSSProperties }> = ({ at: a, children, style }) => {
  const f = useCurrentFrame(); const { fps } = useVideoConfig(); const k = pop(f, fps, a);
  return <div style={{ opacity: Math.min(1, k * 1.4), transform: `scale(${0.7 + 0.3 * k})`, ...style }}>{children}</div>;
};
const Rich: React.FC<{ t: string; style?: React.CSSProperties }> = ({ t, style }) => (
  <span style={style}>{String(t).split(/(\[[a-z]:[^\]]+\])/).filter(Boolean).map((x, i) => {
    const m = x.match(/^\[([a-z]):([^\]]+)\]$/);
    return m ? <span key={i} style={{ color: COL[m[1]] || K.ink, fontWeight: 700 }}>{m[2]}</span> : <span key={i}>{x}</span>;
  })}</span>
);
const Head: React.FC<{ t: string; at?: number; kicker?: string; size?: number }> = ({ t, at: a = 2, kicker, size = 58 }) => (
  <Fade at={a} style={{ marginBottom: 30 }}>
    {kicker && <div style={{ fontFamily: BN, fontSize: 28, color: K.rose2, fontWeight: 600, marginBottom: 6 }}>{kicker}</div>}
    <div style={{ fontFamily: BN, fontSize: size, fontWeight: 700, color: K.ink, lineHeight: 1.25 }}><Rich t={t} /></div>
  </Fade>
);
const Box: React.FC<{ children: React.ReactNode; style?: React.CSSProperties }> = ({ children, style }) => (
  <div style={{ position: "absolute", left: 130, right: 130, top: 140, bottom: 170, display: "flex", flexDirection: "column", ...style }}>{children}</div>
);
const Card: React.FC<{ children: React.ReactNode; style?: React.CSSProperties; tint?: string }> = ({ children, style, tint = K.rose }) => (
  <div style={{ background: K.paper, border: `1.5px solid ${tint}40`, borderRadius: 28, boxShadow: `0 24px 60px rgba(91,44,85,.13), 0 2px 0 ${tint}30`, ...style }}>{children}</div>
);
const Flourish: React.FC<{ w?: number; color?: string; at?: number }> = ({ w = 320, color = K.gold, at: a = 0 }) => {
  const f = useCurrentFrame(); const k = interpolate(f, [a, a + 30], [0, 1], { ...clamp, easing: ease });
  return (
    <svg width={w} height={30} viewBox="0 0 320 30">
      <path d="M10 15 H130 M190 15 H310" stroke={color} strokeWidth={2} strokeDasharray={300} strokeDashoffset={300 * (1 - k)} />
      <path d="M160 3 C152 10 152 20 160 27 C168 20 168 10 160 3 Z" fill={color} opacity={k} />
      <circle cx={140} cy={15} r={3} fill={color} opacity={k} /><circle cx={180} cy={15} r={3} fill={color} opacity={k} />
    </svg>
  );
};

/* ---------- background ---------- */
const PETALS = Array.from({ length: 16 }, (_, i) => { const a = Math.sin(i * 12.9898) * 43758.5453; const b = Math.sin(i * 78.233) * 12543.1; return { x: (a - Math.floor(a)) * 1920, y: (b - Math.floor(b)) * 1080, r: 6 + (i % 4) * 3, s: 0.4 + (i % 3) * 0.25 }; });
const Background: React.FC<{ img?: string; veil?: number }> = ({ img, veil = 0.55 }) => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill style={{ background: K.cream }}>
      {img ? (
        <>
          <Img src={staticFile(`marriage/_img/${img}.jpg`)} style={{ position: "absolute", width: 1920, height: 1080, objectFit: "cover", transform: `scale(${1.04 + f * 0.00004})`, filter: "blur(1.5px) saturate(1.05)" }} />
          <AbsoluteFill style={{ background: `linear-gradient(180deg, rgba(251,244,234,${veil * 0.8}) 0%, rgba(251,244,234,${veil}) 55%, rgba(251,244,234,${Math.min(1, veil + 0.3)}) 100%)` }} />
        </>
      ) : (
        <>
          <AbsoluteFill style={{ background: `radial-gradient(42% 45% at ${22 + 5 * Math.sin(f / 150)}% ${28 + 4 * Math.cos(f / 170)}%, rgba(217,103,127,.16), transparent 70%), radial-gradient(40% 40% at ${80 + 4 * Math.cos(f / 160)}% ${74 + 4 * Math.sin(f / 140)}%, rgba(201,151,58,.17), transparent 70%)` }} />
          <svg width={1920} height={1080} style={{ position: "absolute", inset: 0, opacity: 0.5 }}>
            {PETALS.map((q, i) => {
              const y = (q.y - f * q.s + 1200) % 1200 - 60, x = q.x + 18 * Math.sin((f + i * 40) / 60);
              return <ellipse key={i} cx={x} cy={y} rx={q.r} ry={q.r * 0.6} transform={`rotate(${(f + i * 30) % 360} ${x} ${y})`} fill={i % 3 ? "rgba(217,103,127,.25)" : "rgba(201,151,58,.3)"} />;
            })}
          </svg>
          <AbsoluteFill style={{ opacity: 0.35, backgroundImage: "radial-gradient(rgba(91,44,85,.18) 1px, transparent 1.3px)", backgroundSize: "34px 34px", maskImage: "radial-gradient(75% 65% at 50% 45%, #000 20%, transparent 100%)" }} />
        </>
      )}
    </AbsoluteFill>
  );
};

/* ---------- people (illustrated, modest; viewBox 300×360 bust) ---------- */
type Who = "rina" | "rashed" | "nila";
const SKIN: Record<Who, string> = { rina: "#C88B66", rashed: "#B07650", nila: "#C99572" };
const Person: React.FC<{ who: Who; mood?: string; talk?: boolean; look?: number; arms?: boolean; turn?: number; w?: number; seed?: number }> = ({ who, mood = "calm", talk, look = 0, arms, turn = 0, w = 300, seed = 0 }) => {
  const f = useCurrentFrame() + seed * 37;
  const sk = SKIN[who], dark = "#2B1A20";
  const blink = (f % 110) < 4 ? 0.12 : 1;
  const amp = talk ? Math.abs(Math.sin(f * 0.55) * 0.7 + Math.sin(f * 1.31 + 1) * 0.3) : 0;
  const breathe = Math.sin(f / 26) * 2;
  const dx = turn * 14, roll = mood === "contempt" ? -4 : 0, lx = look * 3 + dx * 0.2;
  const brow = {
    calm: ["M118 105 Q128 99 138 103", "M162 103 Q172 99 182 105"], happy: ["M118 103 Q128 95 138 101", "M162 101 Q172 95 182 103"],
    angry: ["M117 99 L139 109", "M161 109 L183 99"], hurt: ["M117 108 L139 99", "M161 99 L183 108"], sad: ["M117 108 L139 99", "M161 99 L183 108"],
    contempt: ["M118 105 Q128 101 138 104", "M162 99 Q172 90 183 97"], away: ["M118 106 Q128 103 138 106", "M162 106 Q172 103 182 106"],
    tired: ["M118 107 Q128 104 138 106", "M162 106 Q172 104 182 107"], shy: ["M118 104 Q128 98 138 103", "M162 103 Q172 98 182 104"],
  }[mood] || ["M118 105 Q128 99 138 103", "M162 103 Q172 99 182 105"];
  const mouth = { happy: "M134 153 Q150 170 166 153", shy: "M139 157 Q150 165 161 157", calm: "M138 157 Q150 163 162 157", sad: "M136 164 Q150 152 164 164", hurt: "M137 164 Q150 154 163 164", angry: "M135 164 Q150 155 165 164", contempt: "M137 160 Q152 161 167 150", away: "M139 160 L161 160", tired: "M139 160 Q150 158 161 160" }[mood] || "M138 157 Q150 163 162 157";
  const cloth = who === "rina" ? K.rose : who === "rashed" ? K.sky : K.sage;
  return (
    <svg width={w} height={w * 1.2} viewBox="0 0 300 360" style={{ overflow: "visible", transform: `translateY(${breathe}px)` }}>
      {/* back hair */}
      {who === "rina" && <><ellipse cx={150} cy={128} rx={70} ry={80} fill={dark} /><path d="M86 140 Q78 230 104 262 L196 262 Q222 230 214 140 Z" fill={dark} /></>}
      {who === "nila" && <><ellipse cx={150} cy={122} rx={64} ry={72} fill="#3A2A2E" /><circle cx={150 - dx} cy={58} r={24} fill="#3A2A2E" /></>}
      {/* torso */}
      <path d="M46 360 Q52 246 150 228 Q248 246 254 360 Z" fill={cloth} />
      {who === "rina" && <><path d="M120 228 Q150 252 180 228 L186 240 Q150 266 114 240 Z" fill={K.rose2} /><path d="M188 232 L236 258 L128 360 L82 360 Z" fill={K.goldL} /><path d="M188 232 L236 258 L128 360 L82 360 Z" fill="none" stroke={K.gold} strokeWidth={5} strokeDasharray="10 7" /></>}
      {who === "rashed" && <><path d="M128 228 L150 262 L172 228 L160 226 L150 246 L140 226 Z" fill="#F6F1E8" /><line x1={150} y1={262} x2={150} y2={360} stroke="rgba(0,0,0,.18)" strokeWidth={3} />{[285, 315, 345].map((y) => <circle key={y} cx={150} cy={y} r={4} fill="#F6F1E8" />)}</>}
      {who === "nila" && <><path d="M118 230 Q150 262 182 230 L182 360 L118 360 Z" fill="#F4E9DA" /><path d="M118 230 L150 300 L182 230" fill="none" stroke="#5E8A72" strokeWidth={4} /></>}
      {/* neck + head */}
      <rect x={133} y={176} width={34} height={58} rx={14} fill={sk} />
      <path d="M133 205 Q150 216 167 205 L167 222 Q150 230 133 222 Z" fill="rgba(0,0,0,.08)" />
      <ellipse cx={95 + dx * 0.4} cy={130} rx={9} ry={14} fill={sk} /><ellipse cx={205 + dx * 0.4} cy={130} rx={9} ry={14} fill={sk} />
      <ellipse cx={150} cy={125} rx={56} ry={64} fill={sk} />
      {/* front hair */}
      {who === "rina" && <path d={`M93 128 Q92 60 150 58 Q208 60 207 128 Q196 92 ${158 + dx} 82 Q150 90 ${142 + dx} 82 Q104 92 93 128 Z`} fill={dark} />}
      {who === "rashed" && <path d="M92 120 Q86 54 150 52 Q214 54 208 120 Q202 86 178 80 Q152 92 122 80 Q100 88 92 120 Z" fill={dark} />}
      {who === "nila" && <><path d="M93 124 Q92 62 150 60 Q208 62 207 124 Q198 88 150 84 Q110 86 93 124 Z" fill="#3A2A2E" /><path d="M150 60 Q176 64 192 84" stroke="#9C8A8F" strokeWidth={5} fill="none" /></>}
      {who === "rina" && <><circle cx={95 + dx * 0.4} cy={147} r={5} fill={K.gold} /><circle cx={205 + dx * 0.4} cy={147} r={5} fill={K.gold} /></>}
      {who === "rashed" && <path d="M98 138 Q102 196 150 194 Q198 196 202 138 Q196 178 150 180 Q104 178 98 138 Z" fill={dark} opacity={0.55} />}
      {/* face */}
      <g transform={`translate(${dx} 0)`}>
        {[128, 172].map((x) => (
          <g key={x}>
            <ellipse cx={x} cy={122} rx={9.5} ry={10.5 * blink} fill="#fff" />
            {blink > 0.5 && <circle cx={x + lx} cy={123 + roll + (mood === "sad" || mood === "away" || mood === "tired" ? 3 : 0)} r={5.8} fill="#2A1A1F" />}
            {who === "rina" && <path d={`M${x - 10} ${116} Q${x} ${110} ${x + 10} ${116}`} stroke="#2A1A1F" strokeWidth={2.4} fill="none" />}
          </g>
        ))}
        {(mood === "away" || mood === "tired") && blink > 0.5 && [128, 172].map((x) => <path key={x} d={`M${x - 10} 119 Q${x} 115 ${x + 10} 119`} fill={sk} stroke={sk} strokeWidth={6} />)}
        {who === "nila" && <g fill="none" stroke="#5B3A4A" strokeWidth={3}><rect x={113} y={110} width={30} height={25} rx={9} /><rect x={157} y={110} width={30} height={25} rx={9} /><path d="M143 120 Q150 116 157 120" /></g>}
        <path d={brow[0]} stroke="#2A1A1F" strokeWidth={4} strokeLinecap="round" fill="none" />
        <path d={brow[1]} stroke="#2A1A1F" strokeWidth={4} strokeLinecap="round" fill="none" />
        <path d="M150 128 Q146 142 151 145" stroke="rgba(0,0,0,.25)" strokeWidth={2.5} fill="none" strokeLinecap="round" />
        {(mood === "happy" || mood === "shy" || mood === "calm") && <><circle cx={120} cy={145} r={10} fill="#E58A8A" opacity={mood === "calm" ? 0.18 : 0.35} /><circle cx={180} cy={145} r={10} fill="#E58A8A" opacity={mood === "calm" ? 0.18 : 0.35} /></>}
        {mood === "angry" && <><circle cx={120} cy={145} r={12} fill="#D9473F" opacity={0.3} /><circle cx={180} cy={145} r={12} fill="#D9473F" opacity={0.3} /></>}
        {mood === "hurt" && <path d={`M182 136 q-5 9 0 13 q5 -4 0 -13 Z`} fill="#8EC5E8" opacity={0.85} />}
        {amp > 0.12
          ? <><ellipse cx={150} cy={160} rx={11} ry={3 + 9 * amp} fill="#5A2230" /><ellipse cx={150} cy={163 + 6 * amp} rx={7} ry={2 + 3 * amp} fill="#D9707E" /></>
          : <path d={mouth} stroke="#5A2230" strokeWidth={4} strokeLinecap="round" fill="none" />}
      </g>
      {arms && <><rect x={66} y={286} width={168} height={46} rx={23} fill={cloth} stroke="rgba(0,0,0,.15)" strokeWidth={3} /><ellipse cx={80} cy={306} rx={15} ry={13} fill={sk} /><ellipse cx={220} cy={312} rx={15} ry={13} fill={sk} /></>}
    </svg>
  );
};

/* ---------- speech / thought bubble ---------- */
const Bubble: React.FC<{ t: string; at: number; tail: "l" | "r"; think?: boolean; tone?: "bad" | "good" | "n"; style?: React.CSSProperties; size?: number }> = ({ t, at: a, tail, think, tone = "n", style, size = 38 }) => {
  const f = useCurrentFrame(); const { fps } = useVideoConfig(); const k = pop(f, fps, a);
  const bc = tone === "bad" ? K.red : tone === "good" ? K.green : think ? K.plum : K.rose2;
  const bg = tone === "bad" ? "#FFF6F4" : tone === "good" ? "#F5FBF6" : "#FFFFFF";
  return (
    <div style={{ position: "absolute", opacity: Math.min(1, k * 1.5), transform: `scale(${0.6 + 0.4 * k})`, transformOrigin: tail === "l" ? "15% 100%" : "85% 100%", ...style }}>
      <div style={{ position: "relative", background: bg, border: `3px ${think ? "dashed" : "solid"} ${bc}`, borderRadius: think ? 60 : 34, padding: "22px 32px", boxShadow: "0 18px 40px rgba(91,44,85,.16)", fontFamily: BN, fontSize: size, lineHeight: 1.45, color: K.ink, fontWeight: 500 }}>
        {think && <div style={{ fontFamily: BN, fontSize: 22, color: K.plum, fontWeight: 600, marginBottom: 4 }}>মনে মনে…</div>}
        <Rich t={t} />
        {think
          ? <>{[0, 1].map((i) => <div key={i} style={{ position: "absolute", bottom: -26 - i * 26, [tail === "l" ? "left" : "right"]: 60 - i * 18, width: 22 - i * 8, height: 22 - i * 8, borderRadius: 20, background: bg, border: `3px dashed ${bc}` } as React.CSSProperties} />)}</>
          : <svg width={46} height={36} style={{ position: "absolute", bottom: -33, [tail === "l" ? "left" : "right"]: 56 } as React.CSSProperties}><path d={tail === "l" ? "M2 0 L44 0 L8 34 Z" : "M2 0 L44 0 L38 34 Z"} fill={bg} stroke={bc} strokeWidth={3} /><path d="M4 0 L42 0" stroke={bg} strokeWidth={6} /></svg>}
      </div>
    </div>
  );
};

/* who is speaking now + current moods (seg.mood applies from that segment on) */
const useCast = (p: P) => {
  const f = useCurrentFrame();
  const mood: Record<string, string> = { rina: "calm", rashed: "calm", ...(p.s.mood0 || {}) };
  let speaker: string | undefined;
  p.s.seq.forEach((g, k) => {
    const a = at(p, k), b = a + segF(g);
    if (f >= a - 4 && g.mood) Object.assign(mood, g.mood);
    if (f >= a && f < b && g.who && !g.think) speaker = g.who;
  });
  return { mood, speaker };
};
const Tag: React.FC<{ t: string; color: string; at?: number }> = ({ t, color, at: a = 4 }) => (
  <Pop at={a}><span style={{ fontFamily: BN, fontSize: 32, fontWeight: 700, color: "#fff", background: color, padding: "8px 28px", borderRadius: 40, boxShadow: `0 10px 24px ${color}55` }}>{t}</span></Pop>
);

/* ---------- scenes ---------- */
const STitle: React.FC<P> = (p) => (
  <AbsoluteFill>
    <Background img={p.s.bg || "room"} veil={0.62} />
    <Box style={{ alignItems: "center", justifyContent: "center", textAlign: "center" }}>
      <Fade at={4}><div style={{ display: "flex", gap: 16, alignItems: "center" }}>
        <span style={{ fontFamily: BN, fontSize: 30, color: K.rose2, fontWeight: 600, padding: "8px 26px", borderRadius: 30, border: `1.5px solid ${K.rose}88`, background: "rgba(255,255,255,.6)" }}>{p.s.kicker || `${p.spec.course} · ${p.spec.lessonNo}`}</span>
        {p.spec.adult && <span style={{ fontFamily: BN, fontSize: 30, color: "#fff", fontWeight: 700, padding: "8px 22px", borderRadius: 30, background: K.plum }}>১৮+ · বিবাহিতদের জন্য</span>}
      </div></Fade>
      <Fade at={14} y={30}><div style={{ fontFamily: SERIF, fontSize: 104, lineHeight: 1.22, margin: "34px 0 6px", color: K.plum, maxWidth: 1560 }}>{p.s.title || p.spec.title}</div></Fade>
      <Flourish at={24} w={360} />
      {p.s.sub && <Fade at={v(p, 0.3)}><div style={{ fontFamily: BN, fontSize: 40, color: K.ink, opacity: 0.8, maxWidth: 1300, lineHeight: 1.45, marginTop: 18 }}><Rich t={p.s.sub} /></div></Fade>}
    </Box>
  </AbsoluteFill>
);

const Counsellor: React.FC<{ talk: boolean; size?: number }> = ({ talk, size = 360 }) => (
  <div style={{ position: "relative", width: size, textAlign: "center" }}>
    <div style={{ width: size, height: size, borderRadius: size, background: `radial-gradient(circle at 50% 40%, #fff 0%, ${K.sageL} 70%)`, border: `6px solid #fff`, boxShadow: "0 24px 60px rgba(91,44,85,.18)", overflow: "hidden", display: "flex", alignItems: "flex-end", justifyContent: "center" }}>
      <div style={{ marginBottom: -size * 0.08 }}><Person who="nila" mood="happy" talk={talk} w={size * 0.86} seed={3} /></div>
    </div>
    <div style={{ marginTop: -26, position: "relative", display: "inline-block", background: K.plum, color: "#fff", fontFamily: BN, fontSize: 26, fontWeight: 600, padding: "8px 22px", borderRadius: 24 }}>এআই পরামর্শক · নীলা</div>
  </div>
);
const SCounsel: React.FC<P> = (p) => {
  const f = useCurrentFrame();
  const it: string[] = p.s.items || [];
  return (
    <AbsoluteFill>
      <Background img={p.s.bg} veil={0.82} />
      <Box style={{ flexDirection: "row", gap: 80, alignItems: "center" }}>
        <Pop at={2} style={{ flex: "none" }}><Counsellor talk={f > LEAD && f < LEAD + p.vo} /></Pop>
        <div style={{ flex: 1 }}>
          <Head t={p.s.head} kicker={p.s.kicker} />
          {p.s.quote && <Fade at={v(p, 0.15)}><Card style={{ padding: "30px 38px", borderLeft: `8px solid ${K.gold}` }} tint={K.gold}><div style={{ fontFamily: SERIF, fontSize: 46, color: K.plum, lineHeight: 1.45 }}>“<Rich t={p.s.quote} />”</div></Card></Fade>}
          {it.map((x, i) => (
            <Fade key={i} at={v(p, 0.1 + (0.78 * i) / Math.max(1, it.length))} style={{ display: "flex", gap: 20, alignItems: "flex-start", margin: "15px 0" }}>
              <svg width={40} height={40} viewBox="0 0 40 40" style={{ flex: "none", marginTop: 6 }}><path d="M20 35 C6 25 2 17 6 11 C10 5 18 6 20 13 C22 6 30 5 34 11 C38 17 34 25 20 35 Z" fill={i % 2 ? K.gold : K.rose} /></svg>
              <div style={{ fontFamily: BN, fontSize: 40, color: K.ink, lineHeight: 1.45 }}><Rich t={x} /></div>
            </Fade>
          ))}
        </div>
      </Box>
    </AbsoluteFill>
  );
};

const SStory: React.FC<P> = (p) => {
  const f = useCurrentFrame();
  const { mood, speaker } = useCast(p);
  const lines = p.s.seq.map((g, k) => ({ g, k })).filter((x) => x.g.who);
  // only the latest line per person stays (plus a fading previous one)
  const visible = lines.filter((x, i) => { const nxt = lines.slice(i + 1).find((y) => y.g.who === x.g.who); return f >= at(p, x.k) - 2 && (!nxt || f < at(p, nxt.k)); });
  return (
    <AbsoluteFill>
      <Background img={p.s.bg || "room"} veil={0.35} />
      <AbsoluteFill style={{ background: "linear-gradient(180deg, transparent 55%, rgba(251,244,234,.85) 100%)" }} />
      {p.s.head && <div style={{ position: "absolute", top: 120, left: 0, right: 0, textAlign: "center" }}><Tag t={p.s.head} color={p.s.tone === "bad" ? K.red : p.s.tone === "good" ? K.green : K.plum} /></div>}
      <div style={{ position: "absolute", left: 330, top: 470 }}><Person who="rina" mood={mood.rina} talk={speaker === "rina"} look={1} arms={mood.rina === "away"} turn={mood.rina === "away" ? -1 : 0} w={470} seed={1} /></div>
      <div style={{ position: "absolute", left: 1120, top: 470 }}><Person who="rashed" mood={mood.rashed} talk={speaker === "rashed"} look={-1} arms={mood.rashed === "away"} turn={mood.rashed === "away" ? 1 : 0} w={470} seed={2} /></div>
      <div style={{ position: "absolute", left: 250, top: 880, fontFamily: BN, fontSize: 28, fontWeight: 700, color: "#fff", background: K.rose2, padding: "4px 18px", borderRadius: 20 }}>রিনা</div>
      <div style={{ position: "absolute", left: 1580, top: 880, fontFamily: BN, fontSize: 28, fontWeight: 700, color: "#fff", background: K.sky, padding: "4px 18px", borderRadius: 20 }}>রাশেদ</div>
      {visible.map(({ g, k }) => {
        const L = g.who === "rina";
        return <Bubble key={k} t={g.t || ""} at={at(p, k) - 2} tail={L ? "l" : "r"} think={g.think} tone={g.side === "bad" ? "bad" : g.side === "good" ? "good" : "n"}
          style={{ [L ? "left" : "right"]: 150, top: 190, maxWidth: 760 } as React.CSSProperties} />;
      })}
    </AbsoluteFill>
  );
};

const SVersus: React.FC<P> = (p) => {
  const f = useCurrentFrame();
  const { speaker } = useCast(p);
  const bi = p.s.seq.findIndex((g) => g.side === "bad"), gi = p.s.seq.findIndex((g) => g.side === "good");
  const B = p.s.seq[bi], G = p.s.seq[gi];
  const Panel: React.FC<{ g: Seg; k: number; good: boolean }> = ({ g, k, good }) => {
    const other = g.who === "rina" ? "rashed" : "rina";
    const react = good ? (p.s.goodReact || "calm") : (p.s.badReact || "hurt");
    const sp = g.mood?.[g.who as string] || (good ? "calm" : "angry");
    const talk = speaker === g.who && f >= at(p, k) && f < at(p, k) + segF(g);
    const c = good ? K.green : K.red, cl = good ? K.greenL : K.redL;
    const people: Record<string, React.ReactNode> = {
      rina: <Person who="rina" mood={g.who === "rina" ? sp : react} talk={talk && g.who === "rina"} look={1} w={330} seed={good ? 4 : 1} arms={g.who === "rina" && sp === "away"} />,
      rashed: <Person who="rashed" mood={g.who === "rashed" ? sp : react} talk={talk && g.who === "rashed"} look={-1} w={330} seed={good ? 5 : 2} arms={g.who === "rashed" && sp === "away"} turn={g.who === "rashed" && sp === "away" ? 1 : 0} />,
    };
    return (
      <Fade at={at(p, k) - 10} style={{ flex: 1 }}>
        <div style={{ position: "relative", height: 750, borderRadius: 34, background: `linear-gradient(180deg, ${cl} 0%, ${K.paper} 60%)`, border: `3px solid ${c}55`, overflow: "hidden", boxShadow: "0 24px 60px rgba(91,44,85,.12)" }}>
          <div style={{ position: "absolute", top: 26, left: 30, display: "flex", alignItems: "center", gap: 14 }}>
            <span style={{ width: 54, height: 54, borderRadius: 27, background: c, color: "#fff", display: "grid", placeItems: "center", fontFamily: BN, fontSize: 34, fontWeight: 800 }}>{good ? "✓" : "✕"}</span>
            <span style={{ fontFamily: BN, fontSize: 34, fontWeight: 700, color: c }}>{good ? p.s.goodLabel || "ঠিক পথ" : p.s.badLabel || "ভুল পথ"}</span>
          </div>
          <Bubble t={g.t || ""} at={at(p, k)} tail={g.who === "rina" ? "l" : "r"} tone={good ? "good" : "bad"} size={38} style={{ left: 30, right: 30, top: 110 }} />
          <div style={{ position: "absolute", bottom: -70, left: 30 }}>{people.rina}</div>
          <div style={{ position: "absolute", bottom: -70, right: 30 }}>{people.rashed}</div>
          {good && p.s.goodNote && <Fade at={at(p, k, 0.6)} style={{ position: "absolute", left: 30, right: 30, top: 330, textAlign: "center" }}><span style={{ fontFamily: BN, fontSize: 30, fontWeight: 600, color: "#fff", background: K.green, padding: "6px 18px", borderRadius: 18 }}>{p.s.goodNote}</span></Fade>}
          {!good && p.s.badNote && <Fade at={at(p, k, 0.6)} style={{ position: "absolute", left: 30, right: 30, top: 330, textAlign: "center" }}><span style={{ fontFamily: BN, fontSize: 30, fontWeight: 600, color: "#fff", background: K.red, padding: "6px 18px", borderRadius: 18 }}>{p.s.badNote}</span></Fade>}
        </div>
      </Fade>
    );
  };
  return (
    <AbsoluteFill>
      <Background />
      <div style={{ position: "absolute", left: 110, right: 110, top: 112, display: "flex", flexDirection: "column" }}>
        <Fade at={2} style={{ fontFamily: BN, fontSize: 44, fontWeight: 700, color: K.ink, marginBottom: 20, textAlign: "center" }}><Rich t={p.s.head} /></Fade>
        <div style={{ display: "flex", gap: 44 }}>
          {B && <Panel g={B} k={bi} good={false} />}
          {G && <Panel g={G} k={gi} good />}
        </div>
      </div>
    </AbsoluteFill>
  );
};

const SEnemy: React.FC<P> = (p) => {
  const f = useCurrentFrame(); const { fps } = useVideoConfig();
  const tA = p.s.seq.length > 1 ? at(p, 1) - 6 : v(p, 0.55);
  const signs: string[] = p.s.signs || [];
  const crack = interpolate(f, [tA, tA + 20], [0, 1], { ...clamp, easing: ease });
  return (
    <AbsoluteFill>
      <Background />
      <Box style={{ flexDirection: "row", gap: 50, alignItems: "stretch" }}>
        <Fade at={2} style={{ flex: 1.15 }}>
          <Card style={{ height: "100%", padding: "38px 44px", display: "flex", flexDirection: "column", position: "relative", overflow: "hidden" }} tint={K.red}>
            <div style={{ display: "flex", alignItems: "center", gap: 24 }}>
              <div style={{ width: 120, height: 120, borderRadius: 60, background: K.redL, border: `4px solid ${K.red}`, display: "grid", placeItems: "center", fontFamily: SERIF, fontSize: 70, color: K.red, transform: `rotate(${-6 * crack}deg)` }}>{bn(p.s.n)}</div>
              <div>
                <div style={{ fontFamily: BN, fontSize: 28, color: K.red, fontWeight: 600 }}>সংসার ভাঙার শত্রু {bn(p.s.n)} · <span style={{ fontFamily: "sans-serif", fontSize: 24 }}>{p.s.en}</span></div>
                <div style={{ fontFamily: SERIF, fontSize: 76, color: K.ink, lineHeight: 1.15 }}>{p.s.name}</div>
              </div>
            </div>
            <Fade at={v(p, 0.08)} style={{ fontFamily: BN, fontSize: 38, color: K.ink, lineHeight: 1.5, marginTop: 28 }}><Rich t={p.s.what} /></Fade>
            <div style={{ marginTop: 22, display: "flex", flexDirection: "column", gap: 14 }}>
              {signs.map((x, i) => (
                <Fade key={i} at={v(p, 0.18 + (0.3 * i) / Math.max(1, signs.length))}>
                  <span style={{ display: "inline-block", fontFamily: BN, fontSize: 32, color: K.red, background: "#FFF6F4", border: `2px dashed ${K.red}88`, padding: "8px 22px", borderRadius: 20 }}>{x}</span>
                </Fade>
              ))}
            </div>
            {p.s.face && <div style={{ position: "absolute", right: 30, bottom: -6 }}><Person who={p.s.face.who} mood={p.s.face.mood} arms={p.s.face.mood === "away"} turn={p.s.face.mood === "away" ? 1 : 0} look={p.s.face.who === "rina" ? 1 : -1} w={270} seed={8} /></div>}
          </Card>
        </Fade>
        <div style={{ flex: 0.85, display: "flex", flexDirection: "column", justifyContent: "center", opacity: interpolate(f, [tA, tA + 12], [0.25, 1], clamp) }}>
          <div style={{ transform: `scale(${0.85 + 0.15 * pop(f, fps, tA)})` }}>
            <Card style={{ padding: "38px 40px", background: `linear-gradient(180deg, ${K.goldL} 0%, ${K.paper} 70%)` }} tint={K.gold}>
              <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                <svg width={70} height={70} viewBox="0 0 70 70"><path d="M35 4 L62 15 V34 C62 50 50 61 35 66 C20 61 8 50 8 34 V15 Z" fill={K.gold} /><path d="M22 35 L31 44 L49 25" stroke="#fff" strokeWidth={6} fill="none" strokeLinecap="round" strokeLinejoin="round" /></svg>
                <div style={{ fontFamily: BN, fontSize: 30, color: K.gold, fontWeight: 700 }}>প্রতিষেধক</div>
              </div>
              <div style={{ fontFamily: SERIF, fontSize: 60, color: K.plum, lineHeight: 1.2, margin: "16px 0 14px" }}>{p.s.antidote}</div>
              <div style={{ fontFamily: BN, fontSize: 34, color: K.ink, lineHeight: 1.5 }}><Rich t={p.s.anti} /></div>
            </Card>
          </div>
        </div>
      </Box>
    </AbsoluteFill>
  );
};

const SFact: React.FC<P> = (p) => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill>
      <Background img={p.s.bg} veil={0.86} />
      <Box style={{ alignItems: "center", justifyContent: "center" }}>
        <Fade at={2}><Card style={{ padding: "50px 70px", maxWidth: 1400, textAlign: "center" }} tint={K.gold}>
          <div style={{ fontFamily: BN, fontSize: 30, color: K.gold, fontWeight: 700 }}>{p.s.kicker || "গবেষণা কী বলে"}</div>
          {p.s.big && <div style={{ fontFamily: SERIF, fontSize: String(p.s.big).length > 8 ? 88 : 150, color: K.rose2, lineHeight: 1.1, margin: "14px 0 0", transform: `scale(${interpolate(f, [8, 30], [0.85, 1], { ...clamp, easing: ease })})` }}>{p.s.big}</div>}
          {p.s.unit && <div style={{ fontFamily: BN, fontSize: 40, color: K.plum, fontWeight: 600 }}>{p.s.unit}</div>}
          <Flourish at={18} />
          <Fade at={v(p, 0.2)} style={{ fontFamily: BN, fontSize: 42, color: K.ink, lineHeight: 1.5, marginTop: 10 }}><Rich t={p.s.text} /></Fade>
          <Fade at={v(p, 0.45)} style={{ fontFamily: BN, fontSize: 24, color: K.dim, marginTop: 26 }}>সূত্র: {p.s.src}</Fade>
        </Card></Fade>
      </Box>
    </AbsoluteFill>
  );
};

const SPoints: React.FC<P> = (p) => {
  const it: string[] = p.s.items || [];
  return (
    <AbsoluteFill>
      <Background img={p.s.bg} veil={0.88} />
      <Box>
        <Head t={p.s.head} kicker={p.s.kicker} />
        {it.map((x, i) => (
          <Fade key={i} at={v(p, 0.08 + (0.8 * i) / it.length)} style={{ display: "flex", gap: 22, alignItems: "center", margin: "12px 0", maxWidth: p.s.couple ? 1180 : undefined }}>
            <div style={{ flex: "none", width: 60, height: 60, borderRadius: 30, background: i % 2 ? K.goldL : K.roseL, border: `2px solid ${i % 2 ? K.gold : K.rose}`, display: "grid", placeItems: "center", fontFamily: BN, fontSize: 32, color: K.plum, fontWeight: 700 }}>{bn(i + 1)}</div>
            <div style={{ fontFamily: BN, fontSize: 42, color: K.ink, lineHeight: 1.45, background: "rgba(255,251,245,.8)", borderRadius: 20, padding: "10px 24px", boxShadow: "0 8px 24px rgba(91,44,85,.07)" }}><Rich t={x} /></div>
          </Fade>
        ))}
      </Box>
      {p.s.couple && <Fade at={8} style={{ position: "absolute", right: 70, bottom: -30, display: "flex" }}><Person who="rina" mood="happy" look={1} w={300} seed={9} /><div style={{ marginLeft: -40 }}><Person who="rashed" mood="happy" look={-1} w={300} seed={10} /></div></Fade>}
    </AbsoluteFill>
  );
};

const SIG: Record<string, [string, string, string]> = { g: [K.green, K.greenL, "সবুজ"], y: [K.amber, K.amberL, "হলুদ"], r: [K.red, K.redL, "লাল"] };
const SSignals: React.FC<P> = (p) => {
  const f = useCurrentFrame();
  const it: { c: string; t: string; d: string }[] = p.s.items || [];
  return (
    <AbsoluteFill>
      <Background />
      <Box>
        <Head t={p.s.head} kicker={p.s.kicker} />
        <div style={{ display: "flex", gap: 34, flex: 1 }}>
          {it.map((x, i) => {
            const [c, cl] = SIG[x.c]; const a = p.s.seq.length >= it.length + 1 ? at(p, i + 1) - 6 : v(p, 0.12 + 0.27 * i);
            const glow = interpolate(f, [a, a + 10], [0, 1], clamp);
            return (
              <Fade key={i} at={a} style={{ flex: 1 }}>
                <div style={{ height: "100%", borderRadius: 30, background: `linear-gradient(180deg, ${cl} 0%, ${K.paper} 75%)`, border: `3px solid ${c}`, padding: "30px 30px", boxShadow: `0 20px 50px ${c}${glow > 0.5 ? "40" : "10"}` }}>
                  <div style={{ width: 96, height: 96, borderRadius: 48, background: c, boxShadow: `0 0 ${40 * glow}px ${c}`, margin: "0 auto 20px" }} />
                  <div style={{ fontFamily: BN, fontSize: 54, fontWeight: 700, color: c, textAlign: "center", marginBottom: 14 }}>{x.t}</div>
                  <div style={{ fontFamily: BN, fontSize: 40, color: K.ink, lineHeight: 1.5, textAlign: "center" }}><Rich t={x.d} /></div>
                </div>
              </Fade>);
          })}
        </div>
      </Box>
    </AbsoluteFill>
  );
};

const SMyth: React.FC<P> = (p) => {
  const f = useCurrentFrame();
  const it: { m: string; t: string }[] = p.s.items || [];
  return (
    <AbsoluteFill>
      <Background />
      <Box>
        <Head t={p.s.head || "ভুল ধারণা বনাম সত্য"} kicker={p.s.kicker} />
        <div style={{ display: "flex", flexDirection: "column", gap: 22 }}>
          {it.map((x, i) => {
            const a = p.s.seq.length >= it.length + 1 ? at(p, i + 1) - 6 : v(p, 0.1 + (0.8 * i) / it.length);
            const strike = interpolate(f, [a + 22, a + 40], [0, 1], clamp);
            return (
              <Fade key={i} at={a} style={{ display: "flex", gap: 24, alignItems: "stretch" }}>
                <div style={{ flex: 1, position: "relative", padding: "20px 28px", borderRadius: 22, background: "#FFF6F4", border: `2px solid ${K.red}44` }}>
                  <div style={{ fontFamily: BN, fontSize: 24, color: K.red, fontWeight: 700 }}>ভুল ধারণা</div>
                  <div style={{ fontFamily: BN, fontSize: 32, color: K.ink, lineHeight: 1.4, opacity: 1 - 0.35 * strike }}>{x.m}</div>
                  <div style={{ position: "absolute", left: 24, top: "62%", height: 4, width: `${strike * 88}%`, background: K.red, borderRadius: 2 }} />
                </div>
                <div style={{ flex: 1.15, padding: "20px 28px", borderRadius: 22, background: K.greenL, border: `2px solid ${K.green}55`, opacity: interpolate(f, [a + 30, a + 44], [0, 1], clamp) }}>
                  <div style={{ fontFamily: BN, fontSize: 24, color: K.green, fontWeight: 700 }}>সত্য</div>
                  <div style={{ fontFamily: BN, fontSize: 32, color: K.ink, lineHeight: 1.4 }}><Rich t={x.t} /></div>
                </div>
              </Fade>);
          })}
        </div>
      </Box>
    </AbsoluteFill>
  );
};

const SExercise: React.FC<P> = (p) => {
  const f = useCurrentFrame();
  const steps: string[] = p.s.steps || [];
  const ring = interpolate(f, [LEAD, LEAD + p.vo], [0, 1], clamp);
  return (
    <AbsoluteFill>
      <Background img={p.s.bg || "window"} veil={0.8} />
      <Box style={{ flexDirection: "row", gap: 60 }}>
        <div style={{ flex: "none", width: 420, display: "flex", flexDirection: "column", alignItems: "center", paddingTop: 20 }}>
          <Pop at={2}><div style={{ position: "relative", width: 300, height: 300 }}>
            <svg width={300} height={300} viewBox="0 0 300 300"><circle cx={150} cy={150} r={130} stroke={K.roseL} strokeWidth={20} fill="#fff" /><circle cx={150} cy={150} r={130} stroke={K.rose} strokeWidth={20} fill="none" strokeDasharray={816.8} strokeDashoffset={816.8 * (1 - ring)} transform="rotate(-90 150 150)" strokeLinecap="round" /></svg>
            <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
              <div style={{ fontFamily: SERIF, fontSize: 110, color: K.plum, lineHeight: 1 }}>{bn(p.s.mins || 10)}</div>
              <div style={{ fontFamily: BN, fontSize: 32, color: K.rose2, fontWeight: 600 }}>মিনিট</div>
            </div>
          </div></Pop>
          <Fade at={10} style={{ marginTop: 26, display: "flex", gap: 0 }}>
            <Person who="rina" mood="happy" w={170} seed={6} /><Person who="rashed" mood="happy" w={170} seed={7} />
          </Fade>
        </div>
        <div style={{ flex: 1 }}>
          <Fade at={2}><span style={{ fontFamily: BN, fontSize: 30, fontWeight: 700, color: "#fff", background: K.rose2, padding: "8px 24px", borderRadius: 30 }}>দুজনে একসাথে করুন</span></Fade>
          <Head t={p.s.head} at={6} size={52} />
          {steps.map((x, i) => {
            const a = p.s.seq.length >= steps.length + 1 ? at(p, i + 1) - 6 : v(p, 0.1 + (0.82 * i) / steps.length);
            return (
              <Fade key={i} at={a} style={{ display: "flex", gap: 20, alignItems: "flex-start", margin: "0 0 16px" }}>
                <div style={{ flex: "none", width: 50, height: 50, borderRadius: 14, background: K.plum, color: "#fff", display: "grid", placeItems: "center", fontFamily: BN, fontSize: 28, fontWeight: 700 }}>{bn(i + 1)}</div>
                <div style={{ fontFamily: BN, fontSize: 34, color: K.ink, lineHeight: 1.45, background: "rgba(255,255,255,.75)", borderRadius: 18, padding: "8px 18px" }}><Rich t={x} /></div>
              </Fade>);
          })}
        </div>
      </Box>
    </AbsoluteFill>
  );
};

const SHelp: React.FC<P> = (p) => {
  const it: string[] = p.s.items || [];
  const nums: { n: string; t: string }[] = p.s.lines || [];
  return (
    <AbsoluteFill>
      <Background />
      <Box>
        <Head t={p.s.head || "কখন পেশাদার সাহায্য নেবেন"} kicker={p.s.kicker || "নিরাপত্তা আগে"} />
        <div style={{ display: "flex", gap: 50, flex: 1 }}>
          <div style={{ flex: 1.3 }}>
            {it.map((x, i) => (
              <Fade key={i} at={v(p, 0.08 + (0.6 * i) / Math.max(1, it.length))} style={{ display: "flex", gap: 18, alignItems: "flex-start", margin: "0 0 18px" }}>
                <div style={{ flex: "none", width: 18, height: 18, borderRadius: 9, background: K.rose, marginTop: 22 }} />
                <div style={{ fontFamily: BN, fontSize: 40, color: K.ink, lineHeight: 1.45 }}><Rich t={x} /></div>
              </Fade>
            ))}
          </div>
          <div style={{ flex: 0.8, display: "flex", flexDirection: "column", gap: 22 }}>
            {nums.map((x, i) => (
              <Pop key={i} at={v(p, 0.55 + 0.12 * i)}>
                <Card style={{ padding: "22px 28px", display: "flex", gap: 22, alignItems: "center" }} tint={K.plum}>
                  <div style={{ fontFamily: SERIF, fontSize: 96, color: K.plum, lineHeight: 1 }}>{x.n}</div>
                  <div style={{ fontFamily: BN, fontSize: 31, color: K.ink, lineHeight: 1.4 }}>{x.t}</div>
                </Card>
              </Pop>
            ))}
          </div>
        </div>
      </Box>
    </AbsoluteFill>
  );
};

const SRecap: React.FC<P> = (p) => {
  const it: string[] = p.s.items || [];
  return (
    <AbsoluteFill>
      <Background img={p.s.bg || "garden"} veil={0.82} />
      <Box>
        <Head t={p.s.head || "আজ যা শিখলাম"} kicker="সারসংক্ষেপ" />
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>
          {it.map((x, i) => (
            <Pop key={i} at={v(p, 0.06 + (0.75 * i) / it.length)}>
              <Card style={{ padding: "24px 28px", display: "flex", gap: 18, alignItems: "center", minHeight: 170 }} tint={i % 2 ? K.gold : K.rose}>
                <svg width={46} height={46} viewBox="0 0 40 40" style={{ flex: "none" }}><path d="M20 35 C6 25 2 17 6 11 C10 5 18 6 20 13 C22 6 30 5 34 11 C38 17 34 25 20 35 Z" fill={i % 2 ? K.gold : K.rose} /></svg>
                <div style={{ fontFamily: BN, fontSize: 38, color: K.ink, lineHeight: 1.45 }}><Rich t={x} /></div>
              </Card>
            </Pop>
          ))}
        </div>
      </Box>
    </AbsoluteFill>
  );
};

const SOutro: React.FC<P> = (p) => (
  <AbsoluteFill>
    <Background img={p.s.bg || "garden"} veil={0.7} />
    <Box style={{ alignItems: "center", justifyContent: "center", textAlign: "center" }}>
      <Pop at={4}><Img src={staticFile("marriage/_brand/aiu-logo-ink.svg")} style={{ height: 84 }} /></Pop>
      <Fade at={16}><div style={{ fontFamily: SERIF, fontSize: 76, color: K.plum, margin: "36px 0 14px" }}>{p.s.head || "পরের পাঠে দেখা হবে"}</div></Fade>
      <Flourish at={22} />
      {p.spec.next && <Fade at={28}><div style={{ fontFamily: BN, fontSize: 42, color: K.ink, marginTop: 18 }}>পরের পাঠ: <span style={{ color: K.rose2, fontWeight: 700 }}>{p.spec.next}</span></div></Fade>}
      <Fade at={42}><div style={{ fontFamily: BN, fontSize: 30, color: K.dim, marginTop: 36, maxWidth: 1300, lineHeight: 1.5 }}>এই কোর্স শিক্ষা ও সচেতনতার জন্য — চিকিৎসা বা থেরাপির বিকল্প নয়। <span style={{ color: K.ink, fontWeight: 700 }}>aiuniversitybd.com</span></div></Fade>
    </Box>
  </AbsoluteFill>
);

const MAP: Record<string, React.FC<any>> = { title: STitle, counsel: SCounsel, story: SStory, versus: SVersus, enemy: SEnemy, fact: SFact, points: SPoints, signals: SSignals, myth: SMyth, exercise: SExercise, help: SHelp, recap: SRecap, outro: SOutro };

/* ---------- chrome, subtitles, audio ---------- */
const Chrome: React.FC<{ spec: Spec; total: number }> = ({ spec, total }) => {
  const f = useCurrentFrame();
  return (
    <>
      <div style={{ position: "absolute", left: 0, top: 0, height: 6, width: `${(f / total) * 100}%`, background: `linear-gradient(90deg, ${K.rose}, ${K.gold})` }} />
      <div style={{ position: "absolute", left: 60, top: 38, display: "flex", alignItems: "center", gap: 18, background: "rgba(255,251,245,.82)", padding: "10px 22px", borderRadius: 40 }}>
        <Img src={staticFile("marriage/_brand/aiu-logo-ink.svg")} style={{ height: 32 }} />
        <div style={{ width: 2, height: 28, background: K.faint }} />
        <div style={{ fontFamily: BN, fontSize: 26, color: K.ink, fontWeight: 700 }}>{spec.course}</div>
        <div style={{ fontFamily: BN, fontSize: 24, color: K.dim }}>· {spec.lessonNo}</div>
      </div>
      <div style={{ position: "absolute", right: 60, top: 46, display: "flex", gap: 12, alignItems: "center" }}>
        {spec.adult && <span style={{ fontFamily: BN, fontSize: 22, fontWeight: 700, color: "#fff", background: K.plum, padding: "4px 14px", borderRadius: 16 }}>১৮+</span>}
        <span style={{ fontFamily: BN, fontSize: 21, color: K.dim, background: "rgba(255,251,245,.82)", padding: "4px 14px", borderRadius: 16 }}>এআই পরামর্শক · এআই কণ্ঠ</span>
      </div>
    </>
  );
};
type Chunk = { s: string; from: number; to: number };
const subChunks = (spec: Spec, starts: number[]): Chunk[] => spec.scenes.flatMap((s, i) => {
  const ss = segStarts(s);
  return s.seq.flatMap((g, k) => {
    if (!g.c) return [];
    const parts = g.c.split(/(?<=[।?!,—])\s+/).reduce<string[]>((a, x) => { if (a.length && (a[a.length - 1].length < 26 || x.length < 10)) a[a.length - 1] += " " + x; else a.push(x); return a; }, []);
    const total = parts.reduce((n, x) => n + x.length, 0); let acc = 0; const b = starts[i] + LEAD + ss[k]; const F = segF(g);
    return parts.map((x) => { const from = b + (F * acc) / total; acc += x.length; return { s: x, from, to: b + (F * acc) / total }; });
  });
});
const SceneFade: React.FC<{ len: number; children: React.ReactNode }> = ({ len, children }) => {
  const f = useCurrentFrame();
  const o = Math.min(interpolate(f, [0, 14], [0, 1], clamp), interpolate(f, [len - 14, len], [1, 0], clamp));
  return <AbsoluteFill style={{ opacity: o }}>{children}</AbsoluteFill>;
};

export const MarriageVideo: React.FC<{ spec: Spec }> = ({ spec }) => {
  const f = useCurrentFrame();
  const lens = spec.scenes.map(sceneLen);
  const starts = lens.reduce<number[]>((a, _, i) => [...a, i ? a[i - 1] + lens[i - 1] : 18], []);
  const chunks = subChunks(spec, starts);
  const cur = chunks.find((x) => f >= x.from && f < x.to + 4);
  const total = marLen(spec);
  const busy = (fr: number) => spec.scenes.some((s, i) => fr >= starts[i] + LEAD - 6 && fr <= starts[i] + LEAD + voLen(s) + 4);
  return (
    <AbsoluteFill style={{ background: K.cream }}>
      {spec.scenes.map((s, i) => {
        const S = MAP[s.type]; const len = lens[i]; const st = segStarts(s);
        return (
          <Sequence key={i} from={starts[i]} durationInFrames={len}>
            <SceneFade len={len}><S s={s} spec={spec} vo={voLen(s)} st={st} /></SceneFade>
            {s.seq.map((g, k) => g.src ? <Sequence key={k} from={LEAD + st[k]}><Audio src={staticFile(`marriage/${spec.id}/vo/${g.src}`)} /></Sequence> : null)}
            <Sequence from={0}><Audio src={staticFile(`marriage/_brand/${i === 0 ? "swell" : s.type === "outro" || s.type === "recap" ? "chime" : "whoosh"}.mp3`)} volume={0.14} /></Sequence>
          </Sequence>
        );
      })}
      <Chrome spec={spec} total={total} />
      {cur && <div style={{ position: "absolute", left: 0, right: 0, bottom: 50, display: "flex", justifyContent: "center", opacity: interpolate(f, [cur.from, cur.from + 5, cur.to, cur.to + 4], [0, 1, 1, 0], clamp) }}><div style={{ maxWidth: 1500, padding: "8px 26px 12px", borderRadius: 16, background: "rgba(58,34,53,.86)", fontFamily: BN, fontSize: 34, fontWeight: 500, color: "#fff", textAlign: "center", lineHeight: 1.35 }}>{cur.s.replace(/[।,]$/, "")}</div></div>}
      <Audio src={staticFile("marriage/_brand/music.mp3")} loop volume={(fr) => (busy(fr) ? 0.035 : 0.1) * interpolate(fr, [0, 30, total - 60, total], [0, 1, 1, 0], clamp)} />
    </AbsoluteFill>
  );
};
