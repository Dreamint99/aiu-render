// AI University — "Be A Digital Marketer (Zero to Hero)" lesson engine (2026-11-16). Light "growth lab" look (paper desk,
// brand navy + royal blue, caret orange accents). Base pieces copied from src/income/IncomeEngine.tsx (title · ways · myth · vs ·
// points · mission · recap · outro) + marketing scenes: funnel · twoway · ui (look-alike app walkthrough with cursor, zoom,
// numbered callouts) · chat (look-alike AI chat with tool calls + approval) · term · mcp · secret · agent.
// No platform logos; every screen is a drawn look-alike, never a real account. Spec: src/dmkt/specs/<id>.json, timed by scripts/dmkt_make.py.
import React from "react";
import { AbsoluteFill, Audio, Img, Sequence, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig, Easing, delayRender, continueRender } from "remotion";

const K = {
  paper: "#F6F3EC", paper2: "#EDE8DC", ink: "#0B1B3F", ink2: "#33405E", dim: "#6B7389", line: "rgba(11,27,63,.12)", card: "#FFFFFF",
  navy: "#011835", royal: "#0050ED", sky: "#3D7BFF", green: "#0E9F6E", greenBg: "#E3F6EE", red: "#E5484D", redBg: "#FDECEC", amber: "#E8920C", amberBg: "#FFF3DC", caret: "#FF5A1F", violet: "#7C5CFC",
};
const BN = "Anek", EN = "Manrope";
if (typeof document !== "undefined") {
  for (const [n, u, w] of [["Anek", "fonts/AnekBangla.ttf", "100 900"], ["Manrope", "fonts/Manrope-700.ttf", "700"], ["Manrope", "fonts/Manrope-500.ttf", "500"]]) {
    const h = delayRender(`font ${n}${w}`);
    const f = new FontFace(n, `url(${staticFile(u)})`, { weight: w });
    f.load().then(() => { document.fonts.add(f); continueRender(h); }).catch(() => continueRender(h));
  }
}
const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const ease = Easing.bezier(0.16, 1, 0.3, 1);
const bn = (n: number | string) => String(n).replace(/\d/g, (d) => "০১২৩৪৫৬৭৮৯"[+d]);
const pop = (f: number, fps: number, d: number) => spring({ frame: f - d, fps, config: { damping: 14, mass: 0.6 } });

export type Scene = { type: string; vo: string; frames: number; hold?: number; [k: string]: any };
export type Spec = { id: string; course: string; module: string; lessonNo: string; title: string; next: string; scenes: Scene[] };
const LEAD = 12, TAIL = 18;
const sceneLen = (s: Scene) => LEAD + s.frames + (s.hold || 0) + TAIL;
export const dmLen = (spec: Spec) => spec.scenes.reduce((n, s) => n + sceneLen(s), 0) + 30;
type P = { s: Scene; spec: Spec; vo: number };
const v = (p: P, x: number) => LEAD + p.vo * x;
const COL: Record<string, string> = { b: K.royal, g: K.green, r: K.red, y: K.amber, o: K.caret, v: K.violet, k: K.ink };

/* ---------- primitives ---------- */
const Fade: React.FC<{ at: number; children: React.ReactNode; style?: React.CSSProperties; y?: number; x?: number }> = ({ at, children, style, y = 18, x = 0 }) => {
  const f = useCurrentFrame(); const o = interpolate(f, [at, at + 12], [0, 1], { ...clamp, easing: ease });
  return <div style={{ opacity: o, transform: `translate(${(1 - o) * x}px, ${(1 - o) * y}px)`, ...style }}>{children}</div>;
};
const Pop: React.FC<{ at: number; children: React.ReactNode; style?: React.CSSProperties }> = ({ at, children, style }) => {
  const f = useCurrentFrame(); const { fps } = useVideoConfig(); const k = pop(f, fps, at);
  return <div style={{ opacity: Math.min(1, k * 1.4), transform: `scale(${0.6 + 0.4 * k})`, ...style }}>{children}</div>;
};
// "[g:আসল] কথা" → coloured bold spans
const Rich: React.FC<{ t: string; style?: React.CSSProperties }> = ({ t, style }) => (
  <span style={style}>{String(t).split(/(\[[a-z]:[^\]]+\])/).filter(Boolean).map((x, i) => {
    const m = x.match(/^\[([a-z]):([^\]]+)\]$/);
    return m ? <span key={i} style={{ color: COL[m[1]] || K.ink, fontWeight: 700 }}>{m[2]}</span> : <span key={i}>{x}</span>;
  })}</span>
);
const Head: React.FC<{ t: string; at?: number; kicker?: string; size?: number }> = ({ t, at = 2, kicker, size = 58 }) => (
  <Fade at={at} style={{ marginBottom: 30 }}>
    {kicker && <div style={{ display: "inline-block", fontFamily: BN, fontSize: 26, color: K.caret, fontWeight: 700, marginBottom: 8, padding: "2px 16px", borderRadius: 8, background: "rgba(255,90,31,.1)" }}>{kicker}</div>}
    <div style={{ fontFamily: BN, fontSize: size, fontWeight: 700, color: K.ink, lineHeight: 1.22 }}><Rich t={t} /></div>
  </Fade>
);
const Box: React.FC<{ children: React.ReactNode; style?: React.CSSProperties }> = ({ children, style }) => (
  <div style={{ position: "absolute", left: 130, right: 130, top: 130, bottom: 160, display: "flex", flexDirection: "column", ...style }}>{children}</div>
);
const Card: React.FC<{ children: React.ReactNode; style?: React.CSSProperties; edge?: string }> = ({ children, style, edge }) => (
  <div style={{ background: K.card, borderRadius: 22, border: `1.5px solid ${K.line}`, boxShadow: "0 18px 50px rgba(11,27,63,.10), 0 2px 6px rgba(11,27,63,.06)", borderTop: edge ? `6px solid ${edge}` : undefined, ...style }}>{children}</div>
);
const Src: React.FC<{ t: string; style?: React.CSSProperties }> = ({ t, style }) => (
  <div style={{ display: "inline-flex", alignItems: "center", gap: 10, fontFamily: BN, fontSize: 22, color: K.ink2, background: "rgba(11,27,63,.06)", border: `1px solid ${K.line}`, padding: "5px 16px 6px", borderRadius: 30, ...style }}>
    <svg width="18" height="18" viewBox="0 0 24 24"><path d="M4 4h12l4 4v12H4zM8 10h8M8 14h8M8 18h5" stroke={K.ink2} strokeWidth="2" fill="none" strokeLinecap="round" /></svg>সূত্র: {t}
  </div>
);
const ICON: Record<string, string> = {
  work: "M4 8h16v11H4zM9 8V5h6v3M4 13h16", box: "M3 7l9-4 9 4-9 4zM3 7v10l9 4 9-4V7M12 11v10", link: "M10 14a4 4 0 005.7 0l3-3a4 4 0 00-5.7-5.7l-1 1M14 10a4 4 0 00-5.7 0l-3 3a4 4 0 005.7 5.7l1-1",
  eye: "M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12zM12 9a3 3 0 110 6 3 3 0 010-6z", users: "M9 11a4 4 0 100-8 4 4 0 000 8zM2 21v-1a6 6 0 0112 0v1M17 11a3 3 0 100-6M22 21v-1a5 5 0 00-4-5",
  job: "M4 8h16v11H4zM9 8V5h6v3", key: "M14 7a4 4 0 11-3.5 6L4 19v-3h3v-3h3", chart: "M3 20h18M6 16l4-5 4 3 6-8", money: "M3 7h18v10H3zM12 9.5a2.5 2.5 0 110 5 2.5 2.5 0 010-5z",
  clock: "M12 3a9 9 0 110 18 9 9 0 010-18zM12 7v5l3 2", bank: "M3 10l9-6 9 6M5 10v8M9 10v8M15 10v8M19 10v8M3 20h18", shield: "M12 3l8 3v6c0 5-4 8-8 9-4-1-8-4-8-9V6z", flag: "M5 21V4M5 4h11l-2 4 2 4H5",
  star: "M12 3l2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1-4.4-4.3 6.1-.9z", bolt: "M13 2L4 14h7l-1 8 9-12h-7z", mic: "M12 3a3 3 0 013 3v6a3 3 0 01-6 0V6a3 3 0 013-3zM5 11a7 7 0 0014 0M12 18v3",
  cart: "M3 4h2l2.4 11h11L21 7H6.2M9 20a1 1 0 100-2 1 1 0 000 2zM18 20a1 1 0 100-2 1 1 0 000 2z", server: "M4 4h16v6H4zM4 14h16v6H4zM8 7h.01M8 17h.01", phone: "M8 2h8a2 2 0 012 2v16a2 2 0 01-2 2H8a2 2 0 01-2-2V4a2 2 0 012-2zM11 18h2",
  plug: "M9 2v6M15 2v6M6 8h12v4a6 6 0 01-12 0zM12 18v4", bot: "M5 9h14v10H5zM12 5v4M9 13h.01M15 13h.01M9 16h6M12 3a1 1 0 100 2 1 1 0 000-2z", user: "M12 12a4 4 0 100-8 4 4 0 000 8zM4 21a8 8 0 0116 0",
  cursor: "M5 3l14 7-6 2-2 6z", target: "M12 3a9 9 0 110 18 9 9 0 010-18zM12 7a5 5 0 110 10 5 5 0 010-10zM12 11a1 1 0 110 2 1 1 0 010-2z", repeat: "M17 2l4 4-4 4M3 11V9a3 3 0 013-3h15M7 22l-4-4 4-4M21 13v2a3 3 0 01-3 3H3",
  lock: "M6 11h12v10H6zM8 11V7a4 4 0 018 0v4", sparkle: "M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8zM19 16l.8 2.2L22 19l-2.2.8L19 22l-.8-2.2L16 19l2.2-.8z", ad: "M4 5h16v14H4zM8 15l2.5-6 2.5 6M9 13h3M16 9v6",
  globe: "M12 3a9 9 0 110 18 9 9 0 010-18zM3 12h18M12 3c3 3 3 15 0 18M12 3c-3 3-3 15 0 18", search: "M11 4a7 7 0 110 14 7 7 0 010-14zM21 21l-5-5", pen: "M4 20l4-1 11-11-3-3L5 16zM14 6l3 3",
};
const Ico: React.FC<{ n: string; c?: string; s?: number; w?: number }> = ({ n, c = K.ink, s = 48, w = 1.9 }) => (
  <svg width={s} height={s} viewBox="0 0 24 24"><path d={ICON[n] || ICON.work} stroke={c} strokeWidth={w} fill="none" strokeLinecap="round" strokeLinejoin="round" /></svg>
);
const Cursor: React.FC<{ x: number; y: number; click?: number }> = ({ x, y, click = 0 }) => (
  <>
    {click > 0 && click < 1 && <div style={{ position: "absolute", left: x - 26, top: y - 26, width: 52, height: 52, borderRadius: 26, border: `4px solid ${K.caret}`, opacity: 1 - click, transform: `scale(${0.6 + click * 1.4})` }} />}
    <svg width="48" height="48" viewBox="0 0 24 24" style={{ position: "absolute", left: x - 6, top: y - 4, filter: "drop-shadow(0 4px 8px rgba(0,0,0,.35))" }}>
      <path d="M4 2l15 9-6.5 1.5L9.5 19z" fill="#111" stroke="#fff" strokeWidth="1.4" strokeLinejoin="round" />
    </svg>
  </>
);

/* ---------- background: paper + graph grid + slow light ---------- */
const Background: React.FC<{ dark?: boolean }> = ({ dark }) => {
  const f = useCurrentFrame();
  if (dark) return (
    <AbsoluteFill style={{ background: `radial-gradient(110% 90% at 30% 10%, #0A2A66 0%, ${K.navy} 55%, #00102A 100%)` }}>
      <AbsoluteFill style={{ opacity: 0.16, backgroundImage: "linear-gradient(rgba(255,255,255,.35) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.35) 1px, transparent 1px)", backgroundSize: "60px 60px", maskImage: "radial-gradient(70% 70% at 50% 50%, #000 20%, transparent 100%)" }} />
      <AbsoluteFill style={{ background: `radial-gradient(30% 30% at ${70 + 6 * Math.sin(f / 90)}% ${30 + 5 * Math.cos(f / 110)}%, rgba(255,90,31,.20), transparent 70%)` }} />
    </AbsoluteFill>
  );
  return (
    <AbsoluteFill style={{ background: `radial-gradient(120% 100% at 50% 0%, #FBF9F4 0%, ${K.paper} 55%, ${K.paper2} 100%)` }}>
      <AbsoluteFill style={{ opacity: 0.55, backgroundImage: "linear-gradient(rgba(11,27,63,.05) 1px, transparent 1px), linear-gradient(90deg, rgba(11,27,63,.05) 1px, transparent 1px)", backgroundSize: "48px 48px" }} />
      <AbsoluteFill style={{ background: `radial-gradient(35% 35% at ${18 + 5 * Math.sin(f / 150)}% ${85 + 4 * Math.cos(f / 120)}%, rgba(0,80,237,.07), transparent 70%), radial-gradient(30% 30% at ${86 + 4 * Math.cos(f / 140)}% ${18 + 4 * Math.sin(f / 160)}%, rgba(255,90,31,.07), transparent 70%)` }} />
    </AbsoluteFill>
  );
};

/* ---------- title ---------- */
const STitle: React.FC<P> = (p) => {
  const f = useCurrentFrame(); const { fps } = useVideoConfig();
  const sh = interpolate(f, [10, 70], [-30, 130], clamp);
  return (
    <Box style={{ alignItems: "flex-start", justifyContent: "center" }}>
      <Fade at={4}><div style={{ fontFamily: BN, fontSize: 30, color: "#FFB089", fontWeight: 600, padding: "6px 22px", borderRadius: 30, border: "1.5px solid rgba(255,140,90,.5)", background: "rgba(255,90,31,.10)" }}>{p.s.kicker || `${p.spec.course} · ${p.spec.lessonNo}`}</div></Fade>
      <Fade at={12} y={30}><div style={{ fontFamily: BN, fontSize: 100, fontWeight: 800, lineHeight: 1.16, margin: "30px 0 22px", maxWidth: 1500, backgroundImage: `linear-gradient(100deg, #fff 0%, #fff ${sh - 18}%, #FFB089 ${sh}%, #fff ${sh + 18}%, #fff 100%)`, WebkitBackgroundClip: "text", color: "transparent" }}>{p.s.title || p.spec.title}</div></Fade>
      {p.s.sub && <Fade at={v(p, 0.3)}><div style={{ fontFamily: BN, fontSize: 40, color: "rgba(230,236,255,.78)", maxWidth: 1350, lineHeight: 1.45 }}>{p.s.sub}</div></Fade>}
      <div style={{ display: "flex", gap: 18, marginTop: 44 }}>
        {(p.s.badges || ["কোনো লাভের গ্যারান্টি নেই", "সব স্ক্রিন নমুনা"]).map((b: string, i: number) => (
          <div key={i} style={{ transform: `scale(${pop(f, fps, v(p, 0.55) + i * 8)})`, fontFamily: BN, fontSize: 30, fontWeight: 700, color: i ? "#BFE9D6" : "#FFD9C8", background: i ? "rgba(14,159,110,.18)" : "rgba(229,72,77,.22)", border: `1.5px solid ${i ? "rgba(14,159,110,.6)" : "rgba(229,72,77,.6)"}`, padding: "8px 24px", borderRadius: 12 }}>{i ? "✓ " : "⚠ "}{b}</div>
        ))}
      </div>
    </Box>
  );
};

/* ---------- ways money really comes ---------- */
const SWays: React.FC<P> = (p) => {
  const it: { t: string; d: string; i: string; c: string }[] = p.s.items || [];
  return (
    <Box>
      <Head t={p.s.head} kicker={p.s.kicker} />
      <div style={{ display: "flex", gap: 34 }}>
        {it.map((x, i) => (
          <Pop key={i} at={v(p, 0.1 + (0.5 * i) / it.length)} style={{ flex: 1 }}>
            <Card style={{ padding: "34px 34px 30px", minHeight: 330 }} edge={COL[x.c] || K.royal}>
              <div style={{ width: 86, height: 86, borderRadius: 24, background: `${COL[x.c] || K.royal}18`, display: "grid", placeItems: "center", marginBottom: 20 }}><Ico n={x.i} c={COL[x.c] || K.royal} s={50} /></div>
              <div style={{ fontFamily: BN, fontSize: 40, fontWeight: 700, color: K.ink, lineHeight: 1.25 }}>{x.t}</div>
              <div style={{ fontFamily: BN, fontSize: 29, color: K.ink2, marginTop: 12, lineHeight: 1.45 }}><Rich t={x.d} /></div>
            </Card>
          </Pop>
        ))}
      </div>
      {p.s.rule && (
        <Fade at={v(p, p.s.ruleAt || 0.72)} style={{ marginTop: 40 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 24, padding: "24px 34px", borderRadius: 20, background: K.navy, color: "#fff", boxShadow: "0 20px 50px rgba(1,24,53,.3)" }}>
            <div style={{ flex: "none", width: 64, height: 64, borderRadius: 32, background: K.caret, display: "grid", placeItems: "center" }}><Ico n="key" c="#fff" s={36} w={2.2} /></div>
            <div style={{ fontFamily: BN, fontSize: 36, lineHeight: 1.4 }}><Rich t={p.s.rule} /></div>
          </div>
        </Fade>
      )}
    </Box>
  );
};

/* ---------- myth vs fact ---------- */
const SMyth: React.FC<P> = (p) => {
  const f = useCurrentFrame(); const { fps } = useVideoConfig();
  const tX = v(p, p.s.crossAt || 0.25), tF = v(p, (p.s.crossAt || 0.25) + 0.07);
  const cross = interpolate(f, [tX, tX + 10], [0, 1], clamp);
  const facts: string[] = Array.isArray(p.s.fact) ? p.s.fact : [p.s.fact];
  return (
    <Box style={{ justifyContent: "center", gap: 34 }}>
      <Fade at={4}>
        <Card style={{ padding: "30px 44px", position: "relative", background: K.redBg, borderColor: `${K.red}55` }}>
          <div style={{ fontFamily: BN, fontSize: 28, color: K.red, fontWeight: 700, marginBottom: 6 }}>{p.s.mythLabel || "যা শোনা যায়"}</div>
          <div style={{ fontFamily: BN, fontSize: 50, color: K.ink, lineHeight: 1.3, opacity: 1 - cross * 0.4 }}>“{p.s.myth}”</div>
          <div style={{ position: "absolute", left: 40, right: 140, top: "66%", height: 7, borderRadius: 4, background: K.red, transformOrigin: "left", transform: `scaleX(${cross}) rotate(-1.5deg)` }} />
          <div style={{ position: "absolute", right: 36, top: 30, width: 76, height: 76, borderRadius: 38, background: K.red, display: "grid", placeItems: "center", fontSize: 44, color: "#fff", fontFamily: EN, fontWeight: 700, transform: `scale(${pop(f, fps, tX + 6)})` }}>✕</div>
        </Card>
      </Fade>
      <Fade at={tF}>
        <Card style={{ padding: "30px 44px", position: "relative", background: K.greenBg, borderColor: `${K.green}55` }}>
          <div style={{ fontFamily: BN, fontSize: 28, color: K.green, fontWeight: 700, marginBottom: 10 }}>আসল কথা</div>
          {facts.map((x, i) => (
            <Fade key={i} at={tF + 6 + (i ? v(p, 0.15 + (0.55 * i) / facts.length) - tF : 0)} style={{ display: "flex", gap: 16, fontFamily: BN, fontSize: 38, color: K.ink, lineHeight: 1.42, margin: "8px 0" }}><span style={{ color: K.green, fontWeight: 800 }}>✓</span><Rich t={x} /></Fade>
          ))}
        </Card>
      </Fade>
      {p.s.src && <Fade at={v(p, 0.5)}><Src t={p.s.src} /></Fade>}
    </Box>
  );
};

/* ---------- ফাঁদ বনাম আসল (row by row) ---------- */
const SVs: React.FC<P> = (p) => {
  const rows: [string, string][] = p.s.rows || [];
  return (
    <Box>
      <Head t={p.s.head} kicker={p.s.kicker} />
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px 30px" }}>
        <Fade at={4} style={{ fontFamily: BN, fontSize: 34, fontWeight: 800, color: K.red, display: "flex", gap: 12, alignItems: "center" }}><Ico n="flag" c={K.red} s={34} w={2.3} />{p.s.left || "ফাঁদ"}</Fade>
        <Fade at={8} style={{ fontFamily: BN, fontSize: 34, fontWeight: 800, color: K.green, display: "flex", gap: 12, alignItems: "center" }}><Ico n="shield" c={K.green} s={34} w={2.3} />{p.s.right || "আসল কাজ"}</Fade>
        {rows.map(([a, b], i) => {
          const at = v(p, 0.06 + (0.8 * i) / rows.length);
          return (
            <React.Fragment key={i}>
              <Fade at={at} x={-30} y={0}><div style={{ height: "100%", boxSizing: "border-box", padding: "20px 26px", borderRadius: 16, background: K.redBg, border: `1.5px solid ${K.red}44`, fontFamily: BN, fontSize: 32, color: K.ink, lineHeight: 1.35 }}>✕ <Rich t={a} /></div></Fade>
              <Fade at={at + 10} x={30} y={0}><div style={{ height: "100%", boxSizing: "border-box", padding: "20px 26px", borderRadius: 16, background: K.greenBg, border: `1.5px solid ${K.green}44`, fontFamily: BN, fontSize: 32, color: K.ink, lineHeight: 1.35 }}>✓ <Rich t={b} /></div></Fade>
            </React.Fragment>);
        })}
      </div>
    </Box>
  );
};

/* ---------- points, mission, recap, outro ---------- */
const SPoints: React.FC<P> = (p) => {
  const it: string[] = p.s.items || [];
  return (
    <Box>
      <Head t={p.s.head} kicker={p.s.kicker} />
      {it.map((x, i) => (
        <Fade key={i} at={v(p, 0.08 + (0.8 * i) / it.length)} style={{ display: "flex", gap: 22, alignItems: "flex-start", margin: "13px 0" }}>
          <div style={{ flex: "none", width: 52, height: 52, borderRadius: 16, background: K.navy, display: "grid", placeItems: "center", fontFamily: BN, fontSize: 28, color: "#fff", fontWeight: 700 }}>{bn(i + 1)}</div>
          <div style={{ fontFamily: BN, fontSize: 40, color: K.ink, lineHeight: 1.42 }}><Rich t={x} /></div>
        </Fade>
      ))}
      {p.s.src && <Fade at={v(p, 0.5)} style={{ marginTop: "auto" }}><Src t={p.s.src} /></Fade>}
    </Box>
  );
};
const SMission: React.FC<P> = (p) => {
  const f = useCurrentFrame(); const { fps } = useVideoConfig();
  const it: string[] = p.s.items || [];
  return (
    <Box style={{ alignItems: "center", justifyContent: "center" }}>
      <Pop at={2} style={{ width: 1360 }}>
        <div style={{ borderRadius: 28, overflow: "hidden", boxShadow: "0 30px 80px rgba(11,27,63,.25)" }}>
          <div style={{ background: `linear-gradient(100deg, ${K.caret}, #FF8A3D)`, padding: "24px 44px", display: "flex", alignItems: "center", gap: 20 }}>
            <Ico n="flag" c="#fff" s={46} w={2.3} />
            <div style={{ fontFamily: BN, fontSize: 46, fontWeight: 800, color: "#fff" }}>{p.s.head || "আজকের মিশন"}</div>
            <div style={{ marginLeft: "auto", fontFamily: BN, fontSize: 26, color: "#fff", background: "rgba(255,255,255,.2)", padding: "4px 16px", borderRadius: 20 }}>{p.s.time || "২০ মিনিট"}</div>
          </div>
          <div style={{ background: "#fff", padding: "26px 44px 30px" }}>
            {it.map((x, i) => {
              const at = v(p, 0.12 + (0.7 * i) / it.length); const k = interpolate(f, [at + 14, at + 24], [0, 1], clamp);
              return (
                <Fade key={i} at={at} style={{ display: "flex", gap: 22, alignItems: "flex-start", margin: "14px 0" }}>
                  <div style={{ flex: "none", width: 46, height: 46, borderRadius: 12, border: `3px solid ${K.green}`, background: k > 0.5 ? K.green : "#fff", display: "grid", placeItems: "center", color: "#fff", fontSize: 30, fontFamily: EN, fontWeight: 700, marginTop: 4 }}>{k > 0.5 ? "✓" : ""}</div>
                  <div style={{ fontFamily: BN, fontSize: 36, color: K.ink, lineHeight: 1.42 }}><Rich t={x} /></div>
                </Fade>);
            })}
          </div>
        </div>
      </Pop>
    </Box>
  );
};
const SRecap: React.FC<P> = (p) => {
  const it: string[] = p.s.items || [];
  return (
    <Box>
      <Head t={p.s.head || "আজ যা শিখলাম"} kicker="সারসংক্ষেপ" />
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 22 }}>
        {it.map((x, i) => (
          <Pop key={i} at={v(p, 0.06 + (0.75 * i) / it.length)}>
            <Card style={{ padding: "24px 28px", display: "flex", gap: 18, alignItems: "flex-start", minHeight: 130 }}>
              <div style={{ flex: "none", width: 46, height: 46, borderRadius: 23, background: K.green, color: "#fff", display: "grid", placeItems: "center", fontFamily: EN, fontSize: 26, fontWeight: 700 }}>✓</div>
              <div style={{ fontFamily: BN, fontSize: 32, color: K.ink, lineHeight: 1.42 }}><Rich t={x} /></div>
            </Card>
          </Pop>
        ))}
      </div>
    </Box>
  );
};
const SOutro: React.FC<P> = (p) => (
  <Box style={{ alignItems: "center", justifyContent: "center", textAlign: "center" }}>
    <Pop at={4}><Img src={staticFile("dmkt/_brand/aiu-logo-dark.svg")} style={{ height: 96 }} /></Pop>
    <Fade at={16}><div style={{ fontFamily: BN, fontSize: 64, fontWeight: 800, color: "#fff", margin: "40px 0 20px" }}>{p.s.head || "পরের পাঠে দেখা হবে!"}</div></Fade>
    {p.spec.next && <Fade at={26}><div style={{ fontFamily: BN, fontSize: 42, color: "rgba(230,236,255,.75)" }}>পরের পাঠ: <span style={{ color: "#FFB089", fontWeight: 700 }}>{p.spec.next}</span></div></Fade>}
    <Fade at={40}><div style={{ fontFamily: BN, fontSize: 32, color: "rgba(230,236,255,.7)", marginTop: 44, maxWidth: 1300, lineHeight: 1.5 }}>{p.s.note || "বিজ্ঞাপনে লাভের কোনো গ্যারান্টি নেই — শিখুন মেপে, পরীক্ষা করে, নিয়ম মেনে চালাতে।"}<br /><span style={{ color: "#fff", fontWeight: 700 }}>aiuniversitybd.com</span></div></Fade>
  </Box>
);


/* =====================================================================================================
   DIGITAL MARKETING scenes (2026-11-16): funnel · twoway · ui (look-alike app walkthrough) · chat (look-alike AI chat
   with tool calls + approval) · term · mcp · secret · agent (নিজে করুন / এজেন্টকে বলুন)
   ===================================================================================================== */
const MONO = "'DejaVu Sans Mono', 'Cascadia Mono', Consolas, ui-monospace, monospace, Anek";
const FB = "#1877F2";
const typed = (f: number, at: number, txt: string, cps = 2.2) => txt.slice(0, Math.max(0, Math.floor((f - at) * cps)));

/* ---------- funnel: ad → click → landing → pixel → retarget → purchase, a data dot travels, event chips pop ---------- */
type FStep = { t: string; d?: string; i: string; c?: string; ev?: string; pixel?: boolean; back?: boolean };
const SFunnel: React.FC<P> = (p) => {
  const f = useCurrentFrame(); const { fps } = useVideoConfig();
  const st: FStep[] = p.s.steps || []; const n = st.length;
  const x0 = 170, x1 = 1750, y = 480, gap = (x1 - x0) / Math.max(1, n - 1);
  const t0 = v(p, p.s.from || 0.06), t1 = v(p, p.s.to || 0.82);
  const at = (i: number) => t0 + ((t1 - t0) * i) / Math.max(1, n - 1);
  const prog = interpolate(f, [t0, t1], [0, n - 1], { ...clamp, easing: Easing.inOut(Easing.cubic) });
  const dotX = x0 + prog * gap;
  const pi = st.findIndex((s) => s.pixel); const bi = st.findIndex((s) => s.back);
  return (
    <AbsoluteFill>
      <Box style={{ bottom: "auto" }}><Head t={p.s.head} kicker={p.s.kicker} /></Box>
      {/* rail */}
      <div style={{ position: "absolute", left: x0, width: x1 - x0, top: y - 4, height: 8, borderRadius: 4, background: "rgba(11,27,63,.10)" }} />
      <div style={{ position: "absolute", left: x0, width: Math.max(0, dotX - x0), top: y - 4, height: 8, borderRadius: 4, background: `linear-gradient(90deg, ${K.royal}, ${K.caret})` }} />
      {/* retarget loop: from the "back" node curving back to the start, drawn when reached */}
      {bi > 0 && (() => {
        const k = interpolate(f, [at(bi), at(bi) + 30], [0, 1], { ...clamp, easing: ease });
        const xa = x0 + bi * gap, xb = x0 + gap * 0.15;
        const d = `M ${xa} ${y + 190} C ${xa} ${y + 330}, ${xb} ${y + 330}, ${xb} ${y + 190}`;
        return (
          <svg style={{ position: "absolute", left: 0, top: 0 }} width={1920} height={1080}>
            <path d={d} stroke={K.violet} strokeWidth={5} fill="none" strokeDasharray="14 12" pathLength={1} style={{ strokeDasharray: `${k} 1` }} />
            {k > 0.9 && <text x={(xa + xb) / 2} y={y + 345} textAnchor="middle" style={{ fontFamily: BN, fontSize: 30, fontWeight: 700, fill: K.violet }}>{p.s.backLabel || "যারা কেনেনি, তাদের আবার বিজ্ঞাপন দেখানো"}</text>}
          </svg>);
      })()}
      {st.map((s, i) => {
        const x = x0 + i * gap; const on = f >= at(i); const k = pop(f, fps, at(i)); const col = COL[s.c || "b"] || K.royal;
        return (
          <React.Fragment key={i}>
            <div style={{ position: "absolute", left: x - 74, top: y - 74, width: 148, height: 148, borderRadius: 40, background: on ? col : "#fff", border: `3px solid ${on ? col : K.line}`, display: "grid", placeItems: "center", boxShadow: on ? `0 18px 40px ${col}55` : "0 8px 20px rgba(11,27,63,.08)", transform: `scale(${on ? 1 + 0.08 * Math.max(0, 1 - Math.abs(k - 1) * 4) : 0.92})` }}>
              <Ico n={s.i} c={on ? "#fff" : K.dim} s={70} w={1.8} />
            </div>
            {s.pixel && on && [0, 1, 2].map((r) => {
              const q = ((f - at(i) + r * 16) % 48) / 48;
              return <div key={r} style={{ position: "absolute", left: x - 74, top: y - 74, width: 148, height: 148, borderRadius: 40, border: `3px solid ${K.caret}`, opacity: (1 - q) * 0.8, transform: `scale(${1 + q * 0.7})` }} />;
            })}
            <div style={{ position: "absolute", left: x - 140, width: 280, top: y + 92, textAlign: "center", opacity: on ? 1 : 0.45 }}>
              <div style={{ fontFamily: BN, fontSize: 34, fontWeight: 700, color: K.ink }}>{bn(i + 1)}. {s.t}</div>
              {s.d && <div style={{ fontFamily: BN, fontSize: 25, color: K.ink2, lineHeight: 1.35, marginTop: 4 }}>{s.d}</div>}
            </div>
            {s.ev && on && (
              <div style={{ position: "absolute", left: x - 130, width: 260, top: y - 160, display: "flex", justifyContent: "center", transform: `translateY(${(1 - Math.min(1, k)) * 20}px)`, opacity: Math.min(1, k * 1.5) }}>
                <div style={{ fontFamily: EN, fontSize: 24, fontWeight: 700, color: "#fff", background: s.pixel ? K.caret : K.navy, padding: "7px 18px", borderRadius: 12, boxShadow: "0 10px 24px rgba(1,24,53,.25)", whiteSpace: "nowrap" }}>{s.pixel ? "◉ " : ""}{s.ev}</div>
              </div>
            )}
          </React.Fragment>);
      })}
      {/* travelling data dot */}
      <div style={{ position: "absolute", left: dotX - 16, top: y - 16, width: 32, height: 32, borderRadius: 16, background: K.caret, boxShadow: `0 0 0 8px rgba(255,90,31,.22), 0 0 30px ${K.caret}`, opacity: f >= t0 ? 1 : 0 }} />
      {pi >= 0 && p.s.note && <Fade at={at(pi) + 20} style={{ position: "absolute", left: 0, right: 0, top: 885, textAlign: "center" }}>
        <span style={{ fontFamily: BN, fontSize: 30, color: "#fff", background: K.navy, padding: "12px 30px", borderRadius: 16, borderLeft: `8px solid ${K.caret}` }}><Rich t={p.s.note} /></span>
      </Fade>}
    </AbsoluteFill>
  );
};

/* ---------- two ways data travels: browser pixel (gets blocked) vs server Conversions API (arrives) + dedup ---------- */
const STwoWay: React.FC<P> = (p) => {
  const f = useCurrentFrame(); const { fps } = useVideoConfig();
  const s = p.s; const blk: string[] = s.blockers || [];
  const tB = v(p, s.blockAt || 0.3), tS = v(p, s.serverAt || 0.5), tD = v(p, s.dedupAt || 0.78);
  const xs = 420, xe = 1500, yT = 420, yB = 720, bx = 900;
  const lane = (y: number, t: number, srv: boolean) => {
    const out: React.ReactNode[] = [];
    for (let i = 0; i < 14; i++) {
      const born = t + i * 26; const age = f - born; if (age < 0) continue;
      const blocked = !srv && born > tB - 40 && i % 3 !== 0;
      let x = xs + age * 14; let o = 1; let dy = 0; let c = srv ? K.green : K.royal;
      if (blocked && x > bx - 30) { x = bx - 30; c = K.red; const a2 = age - (bx - 30 - xs) / 14; o = 1 - a2 / 18; dy = a2 * 3; }
      if (x >= xe - 10) { o = interpolate(x, [xe - 10, xe + 20], [1, 0], clamp); }
      if (o <= 0) continue;
      out.push(<div key={i} style={{ position: "absolute", left: x - 13, top: y - 13 + dy, width: 26, height: 26, borderRadius: 8, background: c, opacity: o, boxShadow: `0 0 16px ${c}` }} />);
    }
    return out;
  };
  const node = (x: number, y: number, ic: string, t: string, d: string, col: string, at: number) => (
    <Pop at={at} style={{ position: "absolute", left: x - 170, top: y - 100, width: 340 }}>
      <Card style={{ padding: "18px 22px", display: "flex", gap: 16, alignItems: "center" }} edge={col}>
        <div style={{ flex: "none", width: 70, height: 70, borderRadius: 20, background: `${col}18`, display: "grid", placeItems: "center" }}><Ico n={ic} c={col} s={44} /></div>
        <div><div style={{ fontFamily: BN, fontSize: 30, fontWeight: 700, color: K.ink, lineHeight: 1.2 }}>{t}</div><div style={{ fontFamily: BN, fontSize: 22, color: K.ink2, lineHeight: 1.3 }}>{d}</div></div>
      </Card>
    </Pop>
  );
  const dk = interpolate(f, [tD, tD + 20], [0, 1], clamp);
  return (
    <AbsoluteFill>
      <Box style={{ bottom: "auto" }}><Head t={s.head} kicker={s.kicker} size={52} /></Box>
      <div style={{ position: "absolute", left: xs, width: xe - xs, top: yT - 3, height: 6, background: "rgba(0,80,237,.15)", borderRadius: 3 }} />
      <div style={{ position: "absolute", left: xs, width: (xe - xs) * interpolate(f, [tS - 10, tS + 20], [0, 1], clamp), top: yB - 3, height: 6, background: "rgba(14,159,110,.25)", borderRadius: 3 }} />
      {lane(yT, v(p, 0.08), false)}
      {f > tS && lane(yB, tS, true)}
      {node(xs - 120, yT + 4, "globe", s.top || "পিক্সেল", s.topD || "ব্রাউজার থেকে পাঠায়", K.royal, 4)}
      {node(xs - 120, yB + 4, "server", s.bottom || "কনভার্সন API", s.bottomD || "আপনার সার্ভার থেকে পাঠায়", K.green, tS - 12)}
      <Pop at={10} style={{ position: "absolute", left: xe + 10, top: (yT + yB) / 2 - 130, width: 300 }}>
        <div style={{ height: 260, borderRadius: 28, background: K.navy, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 12, boxShadow: "0 24px 60px rgba(1,24,53,.35)" }}>
          <Ico n="chart" c="#fff" s={70} />
          <div style={{ fontFamily: BN, fontSize: 32, fontWeight: 700, color: "#fff", textAlign: "center", lineHeight: 1.25 }}>{s.target || "বিজ্ঞাপন প্ল্যাটফর্ম"}</div>
        </div>
      </Pop>
      <div style={{ position: "absolute", left: bx - 520, width: 1040, top: yT - 110, display: "flex", gap: 16, justifyContent: "center" }}>
        {blk.map((b, i) => (
          <Pop key={i} at={tB + i * 10}><div style={{ fontFamily: BN, fontSize: 26, fontWeight: 700, color: K.red, background: K.redBg, border: `2px solid ${K.red}66`, padding: "6px 16px", borderRadius: 12, whiteSpace: "nowrap" }}>⛔ {b}</div></Pop>
        ))}
      </div>
      {f > tB && <div style={{ position: "absolute", left: bx - 8, top: yT - 40, width: 16, height: 80, borderRadius: 8, background: K.red, transform: `scaleY(${pop(f, fps, tB)})` }} />}
      {s.dedup && (
        <div style={{ position: "absolute", left: 330, right: 330, top: 820, opacity: dk, transform: `translateY(${(1 - dk) * 20}px)` }}>
          <div style={{ display: "flex", gap: 18, alignItems: "center", padding: "16px 26px", borderRadius: 18, background: "#fff", border: `2px solid ${K.violet}66`, boxShadow: "0 14px 34px rgba(11,27,63,.12)" }}>
            <div style={{ flex: "none", fontFamily: MONO, fontSize: 24, color: K.violet, background: `${K.violet}14`, padding: "6px 14px", borderRadius: 10 }}>event_id</div>
            <div style={{ fontFamily: BN, fontSize: 29, color: K.ink, lineHeight: 1.35 }}><Rich t={s.dedup} /></div>
          </div>
        </div>
      )}
    </AbsoluteFill>
  );
};

/* ---------- look-alike app screen walkthrough (Events Manager, Ads Manager, Claude settings …), drawn from JSON ---------- */
type UiEl = { id?: string; k: string; x: number; y: number; w: number; h: number; t?: string; v?: string; sub?: string; on?: boolean; from?: number; until?: number; cols?: string[]; hdr?: boolean; c?: string; size?: number; type?: boolean; dots?: string[] };
type UiStep = { at: number; el: string; label?: string; zoom?: number; side?: "top" | "bottom"; click?: boolean };
const UW0 = 1440, UH0 = 790;
const UiEls: React.FC<{ els: UiEl[]; step: number; f: number; tStep: number[] }> = ({ els, step, f, tStep }) => (
  <>
    {els.filter((e) => (e.from === undefined || step >= e.from) && (e.until === undefined || step < e.until)).map((e, i) => {
      const fresh = e.from !== undefined ? interpolate(f, [tStep[e.from] + 30, tStep[e.from] + 42], [0, 1], clamp) : 1;
      const base: React.CSSProperties = { position: "absolute", left: e.x, top: e.y, width: e.w, height: e.h, boxSizing: "border-box", opacity: fresh };
      const col = e.c ? COL[e.c] || e.c : FB;
      switch (e.k) {
        case "side": return <div key={i} style={{ ...base, background: "#fff", borderRight: "1px solid #DADDE1" }} />;
        case "top": return <div key={i} style={{ ...base, background: "#fff", borderBottom: "1px solid #DADDE1", display: "flex", alignItems: "center", padding: "0 22px", gap: 14, fontFamily: BN, fontSize: 24, fontWeight: 700, color: "#1C2B33" }}><div style={{ width: 30, height: 30, borderRadius: 8, background: col }} />{e.t}</div>;
        case "box": return <div key={i} style={{ ...base, background: "#fff", borderRadius: 12, border: "1px solid #DADDE1", boxShadow: "0 1px 3px rgba(0,0,0,.05)" }} />;
        case "nav": return <div key={i} style={{ ...base, borderRadius: 10, background: e.on ? "#E7F0FE" : "transparent", color: e.on ? FB : "#1C2B33", fontFamily: BN, fontSize: 22, fontWeight: e.on ? 700 : 500, display: "flex", alignItems: "center", padding: "0 16px", gap: 12 }}><div style={{ width: 20, height: 20, borderRadius: 6, border: `2.5px solid ${e.on ? FB : "#65676B"}` }} />{e.t}</div>;
        case "tab": return <div key={i} style={{ ...base, borderBottom: `4px solid ${e.on ? FB : "transparent"}`, color: e.on ? FB : "#4B4F56", fontFamily: BN, fontSize: 22, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center" }}>{e.t}</div>;
        case "h": return <div key={i} style={{ ...base, fontFamily: BN, fontSize: e.size || 30, fontWeight: 700, color: "#1C2B33", display: "flex", alignItems: "center" }}>{e.t}</div>;
        case "text": return <div key={i} style={{ ...base, fontFamily: BN, fontSize: e.size || 21, color: "#4B4F56", lineHeight: 1.35 }}>{e.t}</div>;
        case "kpi": return <div key={i} style={{ ...base, background: "#fff", borderRadius: 12, border: "1px solid #DADDE1", padding: "16px 20px" }}><div style={{ fontFamily: BN, fontSize: 20, color: "#65676B" }}>{e.t}</div><div style={{ fontFamily: EN, fontSize: 38, fontWeight: 700, color: "#1C2B33", marginTop: 6 }}>{e.v}</div>{e.sub && <div style={{ fontFamily: BN, fontSize: 18, color: COL[e.c || "g"] || K.green, marginTop: 2 }}>{e.sub}</div>}</div>;
        case "row": return <div key={i} style={{ ...base, display: "flex", alignItems: "center", borderBottom: "1px solid #E4E6EB", background: e.hdr ? "#F5F6F7" : "#fff", fontFamily: BN, fontSize: e.hdr ? 19 : 21, fontWeight: e.hdr ? 700 : 500, color: e.hdr ? "#65676B" : "#1C2B33", padding: "0 18px" }}>
          {(e.cols || []).map((c, j) => <div key={j} style={{ flex: j ? 1 : 1.6, fontFamily: /^[\x00-\x7F]+$/.test(c) ? EN : BN, display: "flex", gap: 8, alignItems: "center" }}>{c.split("|").map((x, m) => m ? <span key={m} style={{ fontSize: 16, fontWeight: 700, color: x.startsWith("!") ? "#B54708" : "#067647", background: x.startsWith("!") ? "#FEF0C7" : "#DCFAE6", padding: "2px 10px", borderRadius: 10 }}>{x.replace(/^!/, "")}</span> : <span key={m}>{x}</span>)}</div>)}
        </div>;
        case "btn": return <div key={i} style={{ ...base, borderRadius: 10, background: e.on ? col : "#E4E6EB", color: e.on ? "#fff" : "#1C2B33", fontFamily: BN, fontSize: 21, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center" }}>{e.t}</div>;
        case "chip": return <div key={i} style={{ ...base, borderRadius: 20, background: `${col}1F`, color: col, fontFamily: BN, fontSize: 19, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center" }}>{e.t}</div>;
        case "field": {
          const tt = e.type && e.from !== undefined ? typed(f, tStep[e.from] + 40, e.v || "", 1.6) : e.v || "";
          return <div key={i} style={base}><div style={{ fontFamily: BN, fontSize: 19, color: "#65676B", marginBottom: 6 }}>{e.t}</div><div style={{ height: e.h - 32, borderRadius: 10, border: `2px solid ${e.on ? FB : "#CCD0D5"}`, background: "#fff", fontFamily: /^[\x00-\x7F]*$/.test(e.v || "") ? MONO : BN, fontSize: 21, color: "#1C2B33", display: "flex", alignItems: "center", padding: "0 14px" }}>{tt}</div></div>;
        }
        case "score": {
          const val = parseFloat(e.v || "0"); const k = e.from !== undefined ? interpolate(f, [tStep[e.from] + 36, tStep[e.from] + 70], [0, 1], clamp) : 1;
          const r = Math.min(e.w, e.h) / 2 - 12;
          return <div key={i} style={base}><svg width={e.w} height={e.h}><circle cx={e.w / 2} cy={e.h / 2} r={r} stroke="#E4E6EB" strokeWidth={14} fill="none" /><circle cx={e.w / 2} cy={e.h / 2} r={r} stroke={col} strokeWidth={14} fill="none" strokeLinecap="round" pathLength={10} strokeDasharray={`${val * k} 10`} transform={`rotate(-90 ${e.w / 2} ${e.h / 2})`} /></svg>
            <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}><div style={{ fontFamily: EN, fontSize: 40, fontWeight: 700, color: "#1C2B33" }}>{(val * k).toFixed(1)}</div><div style={{ fontFamily: BN, fontSize: 18, color: "#65676B" }}>{e.t || "/১০"}</div></div></div>;
        }
        case "toggle": return <div key={i} style={{ ...base, display: "flex", alignItems: "center", gap: 14, fontFamily: BN, fontSize: 21, color: "#1C2B33" }}><div style={{ width: 54, height: 30, borderRadius: 15, background: e.on ? col : "#CCD0D5", position: "relative" }}><div style={{ position: "absolute", top: 3, left: e.on ? 27 : 3, width: 24, height: 24, borderRadius: 12, background: "#fff" }} /></div>{e.t}</div>;
        case "code": return <div key={i} style={{ ...base, borderRadius: 10, background: "#1E2430", color: "#D6E2FF", fontFamily: MONO, fontSize: e.size || 18, padding: "12px 16px", whiteSpace: "pre", lineHeight: 1.45, overflow: "hidden" }}>{e.t}</div>;
        default: return null;
      }
    })}
  </>
);
const SUi: React.FC<P> = (p) => {
  const f = useCurrentFrame(); const { fps } = useVideoConfig();
  const s = p.s; const els: UiEl[] = s.els || []; const steps: UiStep[] = s.steps || [];
  const UW = s.w || UW0, UH = s.h || UH0; const sc = Math.min(1500 / UW, 800 / UH), FW = UW * sc, FH = UH * sc, left = (1920 - FW) / 2, top = 108, bar = 46;
  const imgs: { from?: number; src: string }[] = s.imgs || [];
  const tStep = steps.map((q) => v(p, q.at));
  const step = tStep.filter((t) => f >= t + 30).length - 1; // page changes right after the click
  const elOf = (id: string) => els.find((e) => e.id === id) || { x: UW / 2, y: UH / 2, w: 10, h: 10 } as UiEl;
  const keys = [{ t: 0, z: 1, cx: UW / 2, cy: UH / 2 }];
  steps.forEach((q, i) => { const e = elOf(q.el); keys.push({ t: tStep[i], z: q.zoom || 1, cx: e.x + e.w / 2, cy: e.y + e.h / 2 }); });
  if (s.outAt) keys.push({ t: v(p, s.outAt), z: 1, cx: UW / 2, cy: UH / 2 });
  let k = 0; while (k < keys.length - 1 && f >= keys[k + 1].t) k++;
  const A = keys[k], B = keys[Math.min(k + 1, keys.length - 1)];
  const prevK = keys[Math.max(0, k - 1)];
  const m = interpolate(f, [A.t, A.t + 26], [0, 1], { ...clamp, easing: ease });
  const cur = { z: prevK.z + (A.z - prevK.z) * m, cx: prevK.cx + (A.cx - prevK.cx) * m, cy: prevK.cy + (A.cy - prevK.cy) * m };
  void B;
  const z = cur.z; const half = (nn: number) => nn / (2 * z);
  const cx = Math.min(UW - half(UW), Math.max(half(UW), cur.cx)), cy = Math.min(UH - half(UH), Math.max(half(UH), cur.cy));
  const tx = FW / 2 - cx * sc * z, ty = FH / 2 - cy * sc * z;
  const toScr = (x: number, y: number) => ({ x: left + tx + x * sc * z, y: top + bar + ty + y * sc * z });
  const fi = tStep.filter((t) => f >= t).length - 1; const q = fi >= 0 && (!s.outAt || f < v(p, s.outAt)) ? steps[fi] : null;
  const tq = fi >= 0 ? tStep[fi] : 0;
  const tgtOf = (i: number) => { if (i < 0) return { x: left + FW * 0.82, y: top + bar + FH * 0.9 }; const e = elOf(steps[i].el); return toScr(e.x + e.w * 0.55, e.y + e.h * 0.6); };
  const cm = q ? interpolate(f, [tq + 4, tq + 22], [0, 1], { ...clamp, easing: ease }) : 1;
  const a0 = tgtOf(fi - 1), a1 = tgtOf(fi);
  const cX = a0.x + (a1.x - a0.x) * cm, cY = a0.y + (a1.y - a0.y) * cm;
  const click = q && q.click !== false ? (f - (tq + 24)) / 10 : -1;
  const e = q ? elOf(q.el) : null;
  const ring = e ? (() => { const a = toScr(e.x, e.y); return { x: a.x, y: a.y, w: e.w * sc * z, h: e.h * sc * z }; })() : null;
  const ro = q ? interpolate(f, [tq + 20, tq + 30], [0, 1], clamp) : 0;
  const appear = interpolate(f, [0, 16], [0, 1], { ...clamp, easing: ease });
  return (
    <AbsoluteFill>
      <div style={{ position: "absolute", left, top, width: FW, height: FH + bar, borderRadius: 18, overflow: "hidden", background: "#F0F2F5", boxShadow: "0 40px 100px rgba(11,27,63,.30), 0 0 0 1px rgba(11,27,63,.10)", opacity: appear, transform: `translateY(${(1 - appear) * 40}px)` }}>
        <div style={{ height: bar, background: "#E9ECF1", display: "flex", alignItems: "center", gap: 10, padding: "0 18px", borderBottom: "1px solid #D8DCE3" }}>
          {["#FF5F57", "#FEBC2E", "#28C840"].map((c) => <div key={c} style={{ width: 13, height: 13, borderRadius: 7, background: c }} />)}
          <div style={{ marginLeft: 18, width: 640, height: 30, borderRadius: 15, background: "#fff", fontFamily: EN, fontSize: 16, color: "#555", display: "flex", alignItems: "center", padding: "0 16px", fontWeight: 500, overflow: "hidden", whiteSpace: "nowrap" }}>{s.url}</div>
          <div style={{ marginLeft: "auto", maxWidth: 620, fontFamily: BN, fontSize: 15, lineHeight: 1.2, color: "#5A6275", textAlign: "right" }}>{s.note || "নমুনা স্ক্রিন — আসলটার মতো করে আঁকা, কোনো আসল অ্যাকাউন্ট নয় · নাম ও লোগো যার যার কোম্পানির ট্রেডমার্ক"}</div>
        </div>
        <div style={{ position: "relative", width: FW, height: FH, overflow: "hidden" }}>
          <div style={{ position: "absolute", left: 0, top: 0, width: UW, height: UH, transformOrigin: "0 0", transform: `translate(${tx}px, ${ty}px) scale(${sc * z})` }}>
            {imgs.filter((im) => (im.from ?? -1) <= step).slice(-1).map((im) => <Img key={im.src} src={staticFile(im.src)} style={{ position: "absolute", left: 0, top: 0, width: UW, height: UH }} />)}
            <UiEls els={els} step={step} f={f} tStep={tStep} />
          </div>
        </div>
      </div>
      {ring && <div style={{ position: "absolute", left: ring.x - 8, top: ring.y - 8, width: ring.w + 16, height: ring.h + 16, borderRadius: 14, border: `5px solid ${K.caret}`, boxShadow: `0 0 0 9999px rgba(11,27,63,${0.22 * ro})`, opacity: ro }} />}
      {ring && <div style={{ position: "absolute", left: ring.x - 30, top: ring.y - 30, width: 46, height: 46, borderRadius: 23, background: K.caret, color: "#fff", display: "grid", placeItems: "center", fontFamily: BN, fontSize: 28, fontWeight: 800, transform: `scale(${pop(f, fps, tq + 22)})`, boxShadow: "0 6px 16px rgba(255,90,31,.5)" }}>{bn(fi + 1)}</div>}
      {q?.label && ring && (() => {
        const above = (q.side || (ring.y > 520 ? "top" : "bottom")) === "top";
        const lx = Math.min(1920 - 800, Math.max(60, ring.x + ring.w / 2 - 380));
        return (
          <div style={{ position: "absolute", left: lx, top: above ? Math.max(70, ring.y - 110) : Math.min(1080 - 250, ring.y + ring.h + 24), transform: `scale(${pop(f, fps, tq + 30)})` }}>
            <div style={{ maxWidth: 780, fontFamily: BN, fontSize: 33, fontWeight: 700, color: "#fff", background: K.navy, padding: "10px 26px 12px", borderRadius: 16, boxShadow: "0 14px 34px rgba(1,24,53,.35)", borderLeft: `8px solid ${K.caret}`, lineHeight: 1.3 }}><Rich t={q.label} /></div>
          </div>);
      })()}
      <Cursor x={cX} y={cY} click={click} />
    </AbsoluteFill>
  );
};

/* ---------- look-alike AI chat: prompt typed → tool calls (read ✓ / change → approval card) → answer (table + bullets) ---------- */
type Tool = { name: string; args?: string; at: number; kind?: "read" | "write"; ask?: "allow" | "deny"; askAt?: number };
const SChat: React.FC<P> = (p) => {
  const f = useCurrentFrame(); const { fps } = useVideoConfig();
  const s = p.s; const tools: Tool[] = s.tools || [];
  const tP = v(p, s.typeAt || 0.03); const prompt = String(s.prompt || "");
  const pt = typed(f, tP, prompt, prompt.length / Math.max(30, (s.typeLen || 0.16) * p.vo));
  const tA = v(p, s.answerAt || 0.5); const ans = s.answer || {};
  const W = 1500, left = 210, top = 108;
  const scr: { at: number; y: number }[] = s.scroll || [];
  let sy = 0; for (const q of scr) sy = interpolate(f, [v(p, q.at), v(p, q.at) + 24], [sy, q.y], { ...clamp, easing: ease }) as number;
  const lines: string[] = ans.bullets || [];
  return (
    <AbsoluteFill>
      <div style={{ position: "absolute", left, top, width: W, height: 830, borderRadius: 22, overflow: "hidden", background: "#FAF9F5", boxShadow: "0 40px 100px rgba(11,27,63,.30), 0 0 0 1px rgba(11,27,63,.10)" }}>
        <div style={{ height: 64, display: "flex", alignItems: "center", gap: 14, padding: "0 26px", borderBottom: "1px solid #E8E4D8", background: "#F3F0E7" }}>
          <div style={{ width: 34, height: 34, borderRadius: 10, background: "#D97757" }} />
          <div style={{ fontFamily: EN, fontSize: 24, fontWeight: 700, color: "#2B2A26" }}>{s.app || "Claude"}</div>
          <div style={{ fontFamily: BN, fontSize: 18, color: "#77736A" }}>· নমুনা স্ক্রিন</div>
          {(s.conn || []).map((c: string) => <div key={c} style={{ marginLeft: 14, fontFamily: BN, fontSize: 19, fontWeight: 700, color: K.green, background: K.greenBg, padding: "4px 14px", borderRadius: 14 }}>🔌 {c} · সংযুক্ত</div>)}
          <div style={{ marginLeft: "auto", fontFamily: BN, fontSize: 18, color: "#77736A" }}>{s.demo || "ডেমো অ্যাকাউন্ট · সব সংখ্যা কাল্পনিক"}</div>
        </div>
        <div style={{ position: "relative", height: 766, overflow: "hidden" }}>
          <div style={{ position: "absolute", left: 0, right: 0, top: 0, padding: "28px 60px", transform: `translateY(${-sy}px)` }}>
            {/* user prompt */}
            <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 22 }}>
              <div style={{ maxWidth: 1050, background: "#EDE9DE", borderRadius: 20, padding: "16px 24px", fontFamily: BN, fontSize: 29, color: "#2B2A26", lineHeight: 1.45, minHeight: 40 }}>{pt}{pt.length < prompt.length && f >= tP && <span style={{ opacity: f % 16 < 8 ? 1 : 0 }}>▍</span>}</div>
            </div>
            {/* tool calls */}
            {tools.map((t, i) => {
              const at = v(p, t.at); if (f < at) return null;
              const done = t.ask ? f > v(p, t.askAt || t.at + 0.08) + 12 : f > at + 34;
              const denied = t.ask === "deny" && done;
              const spin = (f * 12) % 360;
              return (
                <Fade key={i} at={at} style={{ marginBottom: 14 }}>
                  <div style={{ display: "inline-flex", alignItems: "center", gap: 14, fontFamily: MONO, fontSize: 21, color: "#4A473F", background: "#fff", border: `1.5px solid ${t.kind === "write" ? K.amber : "#E2DDD0"}`, borderRadius: 14, padding: "10px 18px" }}>
                    {done ? <span style={{ color: denied ? K.red : K.green, fontWeight: 700, fontFamily: EN }}>{denied ? "✕" : "✓"}</span> : <span style={{ display: "inline-block", width: 18, height: 18, borderRadius: 9, border: "3px solid #D9D3C3", borderTopColor: "#D97757", transform: `rotate(${spin}deg)` }} />}
                    <span style={{ fontWeight: 700 }}>{t.name}</span>{t.args && <span style={{ color: "#8A857A" }}>{t.args}</span>}
                    <span style={{ fontFamily: BN, fontSize: 18, fontWeight: 700, color: t.kind === "write" ? K.amber : K.green, background: t.kind === "write" ? K.amberBg : K.greenBg, padding: "2px 10px", borderRadius: 10 }}>{t.kind === "write" ? "বদলায়" : "শুধু পড়ে"}</span>
                  </div>
                  {t.ask && (() => {
                    const ta = v(p, t.askAt || t.at + 0.08); const pressed = f > ta;
                    return (
                      <div style={{ marginTop: 12, width: 900, background: "#fff", border: `2px solid ${K.amber}`, borderRadius: 16, padding: "18px 24px", boxShadow: "0 12px 30px rgba(232,146,12,.18)" }}>
                        <div style={{ fontFamily: BN, fontSize: 26, fontWeight: 700, color: K.ink }}>⚠ {s.askText || "এই কাজটা অ্যাকাউন্টে পরিবর্তন আনবে — অনুমতি দেবেন?"}</div>
                        <div style={{ display: "flex", gap: 16, marginTop: 14 }}>
                          {[["allow", s.allowText || "অনুমতি দিন", K.ink], ["deny", s.denyText || "না, শুধু প্রস্তাব দেখাও", K.red]].map(([kk, tt, cc]) => (
                            <div key={kk} style={{ fontFamily: BN, fontSize: 23, fontWeight: 700, padding: "8px 22px", borderRadius: 12, border: `2px solid ${cc}`, color: pressed && t.ask === kk ? "#fff" : cc, background: pressed && t.ask === kk ? cc : "#fff", transform: `scale(${pressed && t.ask === kk ? 1 + 0.06 * Math.max(0, 1 - (f - ta) / 8) : 1})` }}>{tt}</div>
                          ))}
                        </div>
                      </div>);
                  })()}
                </Fade>);
            })}
            {/* answer */}
            {f >= tA && (
              <Fade at={tA} style={{ marginTop: 10 }}>
                {ans.lead && <div style={{ fontFamily: BN, fontSize: 29, color: "#2B2A26", lineHeight: 1.5, marginBottom: 16 }}><Rich t={ans.lead} /></div>}
                {ans.table && (
                  <div style={{ border: "1.5px solid #E2DDD0", borderRadius: 14, overflow: "hidden", marginBottom: 18, background: "#fff" }}>
                    {[ans.table.head, ...ans.table.rows].map((r: string[], i: number) => (
                      <div key={i} style={{ display: "flex", padding: "10px 20px", background: i ? (i % 2 ? "#fff" : "#FBFAF6") : "#F1EEE5", borderTop: i ? "1px solid #EEEAE0" : undefined, fontFamily: BN, fontSize: i ? 24 : 21, fontWeight: i ? 500 : 700, color: "#2B2A26", opacity: i ? interpolate(f, [tA + 8 + i * 7, tA + 16 + i * 7], [0, 1], clamp) : 1 }}>
                        {r.map((c, j) => <div key={j} style={{ flex: j ? 1 : 1.7, color: c.startsWith("!") ? K.red : c.startsWith("+") ? K.green : undefined, fontWeight: c.startsWith("!") || c.startsWith("+") ? 700 : undefined }}>{c.replace(/^[!+]/, "")}</div>)}
                      </div>))}
                  </div>
                )}
                {lines.map((x, i) => (
                  <Fade key={i} at={v(p, (ans.bulletsAt || 0.62) + ((ans.bulletsSpan || 0.25) * i) / lines.length)} style={{ display: "flex", gap: 14, fontFamily: BN, fontSize: 27, color: "#2B2A26", lineHeight: 1.45, margin: "8px 0" }}>
                    <span style={{ color: "#D97757", fontWeight: 800 }}>●</span><Rich t={x} />
                  </Fade>))}
              </Fade>
            )}
          </div>
        </div>
      </div>
      {s.chip && <Fade at={6} style={{ position: "absolute", left: 0, right: 0, top: 46, textAlign: "center" }}><span style={{ fontFamily: BN, fontSize: 28, color: "#fff", fontWeight: 700, background: K.royal, padding: "7px 24px", borderRadius: 30 }}><Rich t={s.chip} /></span></Fade>}
    </AbsoluteFill>
  );
};

/* ---------- terminal: commands typed, outputs appear ---------- */
const STerm: React.FC<P> = (p) => {
  const f = useCurrentFrame();
  const ls: { at: number; t: string; out?: boolean; c?: string }[] = p.s.lines || [];
  return (
    <Box style={{ top: 120 }}>
      {p.s.head && <Head t={p.s.head} kicker={p.s.kicker} size={50} />}
      <Fade at={2}>
        <div style={{ borderRadius: 18, overflow: "hidden", background: "#0F1420", boxShadow: "0 40px 90px rgba(11,27,63,.35)" }}>
          <div style={{ height: 46, background: "#1B2130", display: "flex", alignItems: "center", gap: 10, padding: "0 18px" }}>
            {["#FF5F57", "#FEBC2E", "#28C840"].map((c) => <div key={c} style={{ width: 13, height: 13, borderRadius: 7, background: c }} />)}
            <div style={{ marginLeft: 14, fontFamily: MONO, fontSize: 18, color: "#8C96AD" }}>{p.s.title || "Terminal — Claude Code"}</div>
          </div>
          <div style={{ padding: "22px 30px", minHeight: 420 }}>
            {ls.map((l, i) => {
              const at = v(p, l.at); if (f < at) return null;
              const txt = l.out ? l.t : typed(f, at, l.t, 1.8);
              const last = !l.out && txt.length < l.t.length;
              return (
                <div key={i} style={{ fontFamily: /[ঀ-৿]/.test(l.t) ? BN : MONO, fontSize: 27, lineHeight: 1.55, color: l.c ? COL[l.c] || l.c : l.out ? "#9FB0D0" : "#F2F5FF", whiteSpace: "pre-wrap", opacity: l.out ? interpolate(f, [at, at + 8], [0, 1], clamp) : 1 }}>
                  {!l.out && <span style={{ color: "#5BE3A0" }}>{"$ "}</span>}{txt}{last && <span style={{ opacity: f % 16 < 8 ? 1 : 0 }}>▍</span>}
                </div>);
            })}
          </div>
        </div>
      </Fade>
      {p.s.warn && <Fade at={v(p, p.s.warnAt || 0.7)} style={{ marginTop: 26 }}>
        <div style={{ display: "flex", gap: 16, alignItems: "flex-start", padding: "16px 24px", borderRadius: 16, background: K.amberBg, border: `2px solid ${K.amber}66`, fontFamily: BN, fontSize: 29, color: K.ink, lineHeight: 1.4 }}>⚠ <Rich t={p.s.warn} /></div>
      </Fade>}
    </Box>
  );
};

/* ---------- MCP diagram: you → AI → MCP server (tools) → ad account, request out, answer back ---------- */
const SMcp: React.FC<P> = (p) => {
  const f = useCurrentFrame(); const { fps } = useVideoConfig();
  const s = p.s; const nodes: { t: string; d: string; i: string; c: string }[] = s.nodes || [];
  const tools: string[] = s.tools || []; const n = nodes.length;
  const xs = (i: number) => 230 + (i * 1460) / Math.max(1, n - 1); const y = 470;
  const tGo = v(p, s.goAt || 0.25), tBack = v(p, s.backAt || 0.5), tT = v(p, s.toolsAt || 0.6);
  const goX = interpolate(f, [tGo, tGo + 60], [xs(0), xs(n - 1)], { ...clamp, easing: Easing.inOut(Easing.cubic) });
  const bkX = interpolate(f, [tBack, tBack + 60], [xs(n - 1), xs(0)], { ...clamp, easing: Easing.inOut(Easing.cubic) });
  return (
    <AbsoluteFill>
      <Box style={{ bottom: "auto" }}><Head t={s.head} kicker={s.kicker} /></Box>
      <div style={{ position: "absolute", left: xs(0), width: xs(n - 1) - xs(0), top: y - 30, height: 4, background: "rgba(0,80,237,.25)" }} />
      <div style={{ position: "absolute", left: xs(0), width: xs(n - 1) - xs(0), top: y + 30, height: 4, background: "rgba(14,159,110,.25)" }} />
      {f > tGo && f < tGo + 66 && <div style={{ position: "absolute", left: goX - 70, top: y - 52, fontFamily: BN, fontSize: 22, fontWeight: 700, color: "#fff", background: K.royal, padding: "4px 14px", borderRadius: 12 }}>{s.ask || "প্রশ্ন →"}</div>}
      {f > tBack && f < tBack + 66 && <div style={{ position: "absolute", left: bkX - 70, top: y + 18, fontFamily: BN, fontSize: 22, fontWeight: 700, color: "#fff", background: K.green, padding: "4px 14px", borderRadius: 12 }}>{s.ans || "← উত্তর"}</div>}
      {nodes.map((q, i) => {
        const col = COL[q.c] || K.royal;
        return (
          <Pop key={i} at={v(p, 0.04 + i * 0.05)} style={{ position: "absolute", left: xs(i) - 150, top: y - 110, width: 300, textAlign: "center" }}>
            <div style={{ width: 160, height: 160, margin: "0 auto", borderRadius: 44, background: i === 2 ? col : "#fff", border: `3px solid ${col}`, display: "grid", placeItems: "center", boxShadow: `0 20px 44px ${col}33` }}><Ico n={q.i} c={i === 2 ? "#fff" : col} s={80} w={1.7} /></div>
            <div style={{ fontFamily: BN, fontSize: 34, fontWeight: 700, color: K.ink, marginTop: 18 }}>{q.t}</div>
            <div style={{ fontFamily: BN, fontSize: 24, color: K.ink2, lineHeight: 1.35 }}>{q.d}</div>
          </Pop>);
      })}
      {tools.length > 0 && (
        <div style={{ position: "absolute", left: 160, right: 160, top: 790, display: "flex", flexWrap: "wrap", gap: 14, justifyContent: "center" }}>
          {tools.map((t, i) => <div key={i} style={{ transform: `scale(${pop(f, fps, tT + i * 5)})`, fontFamily: /[ঀ-৿]/.test(t) ? BN : MONO, fontSize: 24, fontWeight: 700, color: K.ink, background: "#fff", border: `2px solid ${K.violet}55`, padding: "8px 18px", borderRadius: 12 }}>{t}</div>)}
        </div>
      )}
      {s.analogy && <Fade at={v(p, s.analogyAt || 0.14)} style={{ position: "absolute", right: 130, top: 140 }}>
        <div style={{ fontFamily: BN, fontSize: 30, fontWeight: 700, color: "#fff", background: K.caret, padding: "10px 26px", borderRadius: 16, boxShadow: "0 14px 30px rgba(255,90,31,.35)" }}>🔌 <Rich t={s.analogy} /></div>
      </Fade>}
    </AbsoluteFill>
  );
};

/* ---------- secret card ---------- */
const SSecret: React.FC<P> = (p) => {
  const f = useCurrentFrame(); const { fps } = useVideoConfig();
  const it: string[] = p.s.items || []; const open = interpolate(f, [8, 26], [0, 1], { ...clamp, easing: ease });
  return (
    <Box style={{ alignItems: "center", justifyContent: "center" }}>
      <div style={{ width: 1480, borderRadius: 30, background: `linear-gradient(135deg, ${K.navy} 0%, #0A2A66 100%)`, padding: "40px 54px 44px", boxShadow: "0 40px 100px rgba(1,24,53,.45)", position: "relative", overflow: "hidden", transform: `scale(${0.85 + 0.15 * pop(f, fps, 2)})` }}>
        <div style={{ position: "absolute", inset: 0, background: `linear-gradient(110deg, transparent ${-30 + open * 160}%, rgba(255,255,255,.12) ${-20 + open * 160}%, transparent ${-10 + open * 160}%)` }} />
        <div style={{ display: "flex", alignItems: "center", gap: 20, marginBottom: 24 }}>
          <div style={{ width: 74, height: 74, borderRadius: 22, background: "#FFC94D", display: "grid", placeItems: "center" }}>
            <svg width="44" height="44" viewBox="0 0 24 24"><path d={`M7 11V${8 - open * 3}a5 5 0 0110 0`} stroke={K.navy} strokeWidth="2.4" fill="none" strokeLinecap="round" /><rect x="5" y="11" width="14" height="10" rx="2.5" fill={K.navy} /></svg>
          </div>
          <div style={{ fontFamily: BN, fontSize: 30, fontWeight: 700, color: "#FFC94D" }}>{p.s.kicker || "সিক্রেট কার্ড — কম মানুষ জানে"}</div>
        </div>
        <div style={{ fontFamily: BN, fontSize: 52, fontWeight: 800, color: "#fff", lineHeight: 1.25, marginBottom: 22 }}><Rich t={p.s.head} /></div>
        {it.map((x, i) => (
          <Fade key={i} at={v(p, 0.15 + (0.6 * i) / it.length)} style={{ display: "flex", gap: 18, fontFamily: BN, fontSize: 34, color: "rgba(235,240,255,.92)", lineHeight: 1.45, margin: "10px 0" }}>
            <span style={{ color: "#FFC94D", fontWeight: 800 }}>★</span><Rich t={x} />
          </Fade>))}
        {p.s.code && <Fade at={v(p, p.s.codeAt || 0.5)} style={{ marginTop: 18 }}>
          <div style={{ fontFamily: MONO, fontSize: 25, color: "#CFE0FF", background: "rgba(0,0,0,.35)", border: "1px solid rgba(255,255,255,.15)", borderRadius: 14, padding: "16px 22px", whiteSpace: "pre-wrap", lineHeight: 1.5 }}>{p.s.code}</div>
        </Fade>}
      </div>
    </Box>
  );
};

/* ---------- mission split: নিজে করুন (checklist) | এজেন্টকে বলুন (prompt) ---------- */
const SAgent: React.FC<P> = (p) => {
  const f = useCurrentFrame();
  const it: string[] = p.s.items || []; const pr = String(p.s.prompt || "");
  const tP = v(p, p.s.promptAt || 0.55);
  return (
    <Box style={{ top: 120 }}>
      <Head t={p.s.head || "আজকের মিশন"} kicker={p.s.kicker || "হাতে-কলমে"} size={52} />
      <div style={{ display: "flex", gap: 34, alignItems: "stretch" }}>
        <Card style={{ flex: 1, padding: "26px 34px" }} edge={K.green}>
          <div style={{ fontFamily: BN, fontSize: 32, fontWeight: 800, color: K.green, marginBottom: 8 }}>✋ নিজে করুন</div>
          {it.map((x, i) => {
            const at = v(p, 0.08 + (0.42 * i) / it.length); const k = interpolate(f, [at + 14, at + 24], [0, 1], clamp);
            return (
              <Fade key={i} at={at} style={{ display: "flex", gap: 18, alignItems: "flex-start", margin: "12px 0" }}>
                <div style={{ flex: "none", width: 40, height: 40, borderRadius: 10, border: `3px solid ${K.green}`, background: k > 0.5 ? K.green : "#fff", display: "grid", placeItems: "center", color: "#fff", fontSize: 26, fontFamily: EN, fontWeight: 700, marginTop: 3 }}>{k > 0.5 ? "✓" : ""}</div>
                <div style={{ fontFamily: BN, fontSize: 30, color: K.ink, lineHeight: 1.42 }}><Rich t={x} /></div>
              </Fade>);
          })}
        </Card>
        <Fade at={tP - 6} style={{ flex: 1 }}>
          <Card style={{ height: "100%", boxSizing: "border-box", padding: "26px 34px", background: "#1E2430", borderColor: "#1E2430" }} edge={K.violet}>
            <div style={{ fontFamily: BN, fontSize: 32, fontWeight: 800, color: "#C9B8FF", marginBottom: 14 }}>🤖 এজেন্টকে বলুন</div>
            <div style={{ fontFamily: BN, fontSize: 28, color: "#EEF2FF", lineHeight: 1.55, whiteSpace: "pre-wrap" }}>“{typed(f, tP, pr, pr.length / Math.max(30, 0.25 * p.vo))}”</div>
            {p.s.agentNote && <div style={{ fontFamily: BN, fontSize: 22, color: "#9AA6C4", marginTop: 16 }}>{p.s.agentNote}</div>}
          </Card>
        </Fade>
      </div>
    </Box>
  );
};

const MAP: Record<string, React.FC<any>> = { title: STitle, ways: SWays, myth: SMyth, vs: SVs, points: SPoints, mission: SMission, recap: SRecap, outro: SOutro, funnel: SFunnel, twoway: STwoWay, ui: SUi, chat: SChat, term: STerm, mcp: SMcp, secret: SSecret, agent: SAgent };
const DARK = new Set(["title", "outro"]);

/* ---------- chrome, subtitles, audio ---------- */
const Chrome: React.FC<{ spec: Spec; total: number; dark: boolean }> = ({ spec, total, dark }) => {
  const f = useCurrentFrame();
  const ink = dark ? "#fff" : K.ink, dim = dark ? "rgba(230,236,255,.6)" : K.dim;
  return (
    <>
      <div style={{ position: "absolute", left: 0, top: 0, height: 5, width: `${(f / total) * 100}%`, background: `linear-gradient(90deg, ${K.royal}, ${K.caret})` }} />
      <div style={{ position: "absolute", left: 60, top: 38, display: "flex", alignItems: "center", gap: 16 }}>
        <Img src={staticFile(`dmkt/_brand/aiu-logo-${dark ? "dark" : "ink"}.svg`)} style={{ height: 34 }} />
        <div style={{ width: 2, height: 28, background: dark ? "rgba(255,255,255,.2)" : K.line }} />
        <div style={{ fontFamily: BN, fontSize: 25, color: ink, fontWeight: 700 }}>{spec.course}</div>
        <div style={{ fontFamily: BN, fontSize: 23, color: dim }}>· {spec.lessonNo}</div>
      </div>
      <div style={{ position: "absolute", right: 60, top: 46, fontFamily: BN, fontSize: 20, color: dim }}>এআই শিক্ষক · এআই কণ্ঠ</div>
    </>
  );
};
const subChunks = (spec: Spec, starts: number[]) => spec.scenes.flatMap((s, i) => {
  const parts = s.vo.split(/(?<=[।?!,—])\s+/).reduce<string[]>((a, x) => { if (a.length && (a[a.length - 1].length < 26 || x.length < 10)) a[a.length - 1] += " " + x; else a.push(x); return a; }, []);
  const total = parts.reduce((n, x) => n + x.length, 0); let acc = 0; const b = starts[i] + LEAD;
  return parts.map((x) => { const from = b + (s.frames * acc) / total; acc += x.length; return { s: x, from, to: b + (s.frames * acc) / total }; });
});
const SceneFade: React.FC<{ len: number; children: React.ReactNode }> = ({ len, children }) => {
  const f = useCurrentFrame();
  const o = Math.min(interpolate(f, [0, 12], [0, 1], clamp), interpolate(f, [len - 12, len], [1, 0], clamp));
  return <AbsoluteFill style={{ opacity: o, transform: `scale(${0.985 + 0.015 * o})` }}>{children}</AbsoluteFill>;
};

export const DmktVideo: React.FC<{ spec: Spec }> = ({ spec }) => {
  const f = useCurrentFrame();
  const lens = spec.scenes.map(sceneLen);
  const starts = lens.reduce<number[]>((a, _, i) => [...a, i ? a[i - 1] + lens[i - 1] : 15], []);
  const chunks = subChunks(spec, starts);
  const cur = chunks.find((x) => f >= x.from && f < x.to + 4);
  const total = dmLen(spec);
  const busy = (fr: number) => spec.scenes.some((s, i) => fr >= starts[i] + LEAD - 6 && fr <= starts[i] + LEAD + s.frames + 4);
  const si = Math.max(0, starts.filter((s) => f >= s).length - 1); const dark = DARK.has(spec.scenes[si]?.type);
  const dk = (i: number) => DARK.has(spec.scenes[i]?.type);
  return (
    <AbsoluteFill style={{ background: K.paper }}>
      <Background />
      {spec.scenes.map((s, i) => {
        const S = MAP[s.type]; const len = lens[i];
        return (
          <Sequence key={i} from={starts[i]} durationInFrames={len}>
            {dk(i) && <SceneFade len={len}><Background dark /></SceneFade>}
            <SceneFade len={len}><S s={s} spec={spec} vo={s.frames} /></SceneFade>
            <Sequence from={LEAD}><Audio src={staticFile(`dmkt/${spec.id}/vo/${String(i + 1).padStart(2, "0")}.mp3`)} /></Sequence>
            <Sequence from={0}><Audio src={staticFile(`aiu2/${i === 0 ? "swell" : s.type === "outro" ? "chime" : "whoosh"}.mp3`)} volume={0.18} /></Sequence>
            
          </Sequence>
        );
      })}
      <Chrome spec={spec} total={total} dark={dark} />
      {cur && <div style={{ position: "absolute", left: 0, right: 0, bottom: 50, display: "flex", justifyContent: "center", opacity: interpolate(f, [cur.from, cur.from + 5, cur.to, cur.to + 4], [0, 1, 1, 0], clamp) }}><div style={{ maxWidth: 1500, padding: "8px 26px 12px", borderRadius: 14, background: "rgba(1,24,53,.86)", fontFamily: BN, fontSize: 34, fontWeight: 500, color: "#fff", textAlign: "center", lineHeight: 1.35 }}>{cur.s.replace(/[।,]$/, "")}</div></div>}
      <Audio src={staticFile("aiu2/music.mp3")} volume={(fr) => (busy(fr) ? 0.04 : 0.12) * interpolate(fr, [0, 30, total - 60, total], [0, 1, 1, 0], clamp)} />
    </AbsoluteFill>
  );
};
