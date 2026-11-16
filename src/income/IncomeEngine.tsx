// AI University — "অনলাইনে আয় করার উপায়" lesson engine (2026-11-16). Light "income lab / case file" look:
// warm paper desk with graph grid, brand navy ink + royal blue, emerald = আসল, red = ফাঁদ, amber = সাবধান.
// Scenes: title · ways · myth · scam (bait phone + case file + red flags + stamp) · test (scam checklist) · vs (ফাঁদ বনাম আসল)
//         browser (real public page screenshot, cursor + zoom-to-part + callouts) · reality (রিয়েলিটি কার্ড) · trends (sourced bars)
//         money (where an order's money goes) · points · mission · recap · outro
// Every number on screen carries a source chip. One spec per lesson: src/income/specs/<id>.json, timed by scripts/income_make.py.
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
export const incLen = (spec: Spec) => spec.scenes.reduce((n, s) => n + sceneLen(s), 0) + 30;
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
        {(p.s.badges || ["কোনো আয়ের গ্যারান্টি নেই", "সব সংখ্যা সূত্রসহ"]).map((b: string, i: number) => (
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

/* ---------- scam case file: bait on a phone + what really happens + flags + stamp ---------- */
const SScam: React.FC<P> = (p) => {
  const f = useCurrentFrame(); const { fps } = useVideoConfig();
  const s = p.s; const flags: string[] = s.flags || [];
  const tReal = v(p, s.realAt || 0.3), tFlag = v(p, s.flagAt || 0.6), tStamp = v(p, s.stampAt || 0.88);
  const st = pop(f, fps, tStamp);
  const shake = f > tStamp && f < tStamp + 8 ? Math.sin(f * 3) * 4 : 0;
  return (
    <Box style={{ flexDirection: "row", gap: 70, alignItems: "stretch", top: 120 }}>
      {/* bait phone */}
      <Fade at={2} x={-40} y={0} style={{ flex: "none", transform: `translateX(${shake}px)` }}>
        <div style={{ width: 430, height: 790, borderRadius: 58, background: "#10141F", padding: 12, boxShadow: "0 40px 90px rgba(11,27,63,.35)" }}>
          <div style={{ width: "100%", height: "100%", borderRadius: 46, background: "#F0F2F5", overflow: "hidden", position: "relative" }}>
            <div style={{ height: 70, background: "#fff", display: "flex", alignItems: "flex-end", padding: "0 22px 10px", fontFamily: EN, fontSize: 26, fontWeight: 700, color: "#1877F2", borderBottom: "1px solid #E4E6EB" }}>{s.app || "সোশ্যাল ফিড"}</div>
            <div style={{ margin: 14, borderRadius: 16, background: "#fff", padding: 18, boxShadow: "0 2px 6px rgba(0,0,0,.06)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12 }}>
                <div style={{ width: 46, height: 46, borderRadius: 23, background: "linear-gradient(135deg,#FFC94D,#FF7A45)" }} />
                <div><div style={{ fontFamily: BN, fontSize: 22, fontWeight: 700, color: "#050505" }}>{s.page || "সহজ আয় বিডি"}</div><div style={{ fontFamily: BN, fontSize: 17, color: "#65676B" }}>স্পনসর্ড · নমুনা</div></div>
              </div>
              <div style={{ fontFamily: BN, fontSize: 27, color: "#050505", lineHeight: 1.4, fontWeight: 600 }}>{s.bait}</div>
              <div style={{ marginTop: 14, height: 200, borderRadius: 12, background: `linear-gradient(135deg, ${s.baitColor || "#16A34A"}, #0B1B3F)`, display: "grid", placeItems: "center", textAlign: "center", padding: 16 }}>
                <div style={{ fontFamily: BN, fontSize: 44, fontWeight: 800, color: "#FFE58A", lineHeight: 1.15, textShadow: "0 3px 10px rgba(0,0,0,.4)" }}>{s.baitBig}</div>
              </div>
              <div style={{ marginTop: 14, padding: "14px 0", borderRadius: 10, background: "#1877F2", color: "#fff", fontFamily: BN, fontSize: 26, fontWeight: 700, textAlign: "center" }}>{s.baitBtn || "এখনই যোগ দিন"}</div>
            </div>
            <div style={{ position: "absolute", left: 0, right: 0, bottom: 22, textAlign: "center", fontFamily: BN, fontSize: 18, color: "#8A8D91" }}>বোঝানোর জন্য বানানো নমুনা বিজ্ঞাপন</div>
          </div>
        </div>
      </Fade>
      {/* case file */}
      <div style={{ flex: 1, position: "relative", display: "flex", flexDirection: "column" }}>
        <Fade at={6} style={{ display: "flex", alignItems: "baseline", gap: 18 }}>
          <span style={{ fontFamily: BN, fontSize: 30, fontWeight: 800, color: "#fff", background: K.red, padding: "4px 18px", borderRadius: 10 }}>ফাঁদ #{bn(s.no)}</span>
          <span style={{ fontFamily: BN, fontSize: 30, color: K.dim }}>{s.kicker}</span>
        </Fade>
        <Fade at={10}><div style={{ fontFamily: BN, fontSize: 60, fontWeight: 800, color: K.ink, lineHeight: 1.18, margin: "14px 0 24px" }}>{s.name}</div></Fade>
        <Fade at={tReal}>
          <Card style={{ padding: "24px 30px" }} edge={K.ink}>
            <div style={{ fontFamily: BN, fontSize: 26, fontWeight: 700, color: K.dim, marginBottom: 6 }}>আসলে যা হয়</div>
            {(s.real || []).map((x: string, i: number) => (
              <Fade key={i} at={tReal + 8 + i * Math.max(10, (tFlag - tReal - 10) / Math.max(1, (s.real || []).length))} style={{ display: "flex", gap: 14, fontFamily: BN, fontSize: 32, color: K.ink, lineHeight: 1.42, margin: "6px 0" }}><span style={{ color: K.red }}>▸</span><Rich t={x} /></Fade>
            ))}
          </Card>
        </Fade>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 12, marginTop: 24 }}>
          {flags.map((x, i) => (
            <Pop key={i} at={tFlag + i * 9}><div style={{ display: "flex", alignItems: "center", gap: 10, fontFamily: BN, fontSize: 27, fontWeight: 700, color: K.red, background: K.redBg, border: `1.5px solid ${K.red}66`, padding: "8px 18px", borderRadius: 30 }}><Ico n="flag" c={K.red} s={26} w={2.3} />{x}</div></Pop>
          ))}
        </div>
        {s.src && <Fade at={v(p, 0.45)} style={{ marginTop: "auto" }}><Src t={s.src} /></Fade>}
        <div style={{ position: "absolute", right: 10, top: 40, opacity: Math.min(1, st * 1.5), transform: `rotate(-12deg) scale(${2.2 - 1.2 * st})` }}>
          <div style={{ fontFamily: BN, fontSize: 64, fontWeight: 800, color: K.red, border: `7px solid ${K.red}`, borderRadius: 16, padding: "0 26px", letterSpacing: 0, opacity: 0.88, mixBlendMode: "multiply", background: "rgba(229,72,77,.06)" }}>{s.stamp || "ফাঁদ!"}</div>
        </div>
      </div>
    </Box>
  );
};

/* ---------- quick scam test: checklist ---------- */
const STest: React.FC<P> = (p) => {
  const f = useCurrentFrame(); const { fps } = useVideoConfig();
  const it: string[] = p.s.items || []; const tEnd = v(p, p.s.endAt || 0.86);
  return (
    <Box>
      <Head t={p.s.head} kicker={p.s.kicker} />
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
        {it.map((x, i) => {
          const at = v(p, 0.08 + (0.72 * i) / it.length); const k = pop(f, fps, at + 8);
          return (
            <Fade key={i} at={at} style={{ gridColumn: i === it.length - 1 && it.length % 2 ? "1 / span 2" : undefined }}>
              <Card style={{ padding: "22px 28px", display: "flex", gap: 20, alignItems: "center" }}>
                <div style={{ flex: "none", width: 58, height: 58, borderRadius: 14, border: `3px solid ${K.red}`, display: "grid", placeItems: "center", fontFamily: BN, fontSize: 34, fontWeight: 800, color: K.red, transform: `scale(${0.7 + 0.3 * Math.min(1, k)})` }}>{bn(i + 1)}</div>
                <div style={{ fontFamily: BN, fontSize: 34, color: K.ink, lineHeight: 1.35 }}><Rich t={x} /></div>
              </Card>
            </Fade>);
        })}
      </div>
      {p.s.verdict && <Pop at={tEnd} style={{ marginTop: 30, alignSelf: "center" }}><div style={{ fontFamily: BN, fontSize: 42, fontWeight: 800, color: "#fff", background: K.red, padding: "14px 40px", borderRadius: 18, boxShadow: "0 16px 40px rgba(229,72,77,.35)" }}>{p.s.verdict}</div></Pop>}
    </Box>
  );
};

/* ---------- ফাঁদ বনাম আসল (row by row) ----------
   tone: "bad-good" (default: left ✕ red, right ✓ green) · "good-bad" (left ✓ green, right ✕ red)
         "neutral" (two plain columns, no ✕/✓) · "table" (key → value rows; 3-item rows = key + two columns) */
const SVs: React.FC<P> = (p) => {
  const rows: string[][] = p.s.rows || [];
  const three = rows.some((r) => r.length >= 3);
  const tone: string = p.s.tone || (three ? "table" : "bad-good");
  const cell = (bg: string, bd: string, mark: string, t: string, bold = false) => (
    <div style={{ height: "100%", boxSizing: "border-box", padding: "20px 26px", borderRadius: 16, background: bg, border: `1.5px solid ${bd}`, fontFamily: BN, fontSize: 32, fontWeight: bold ? 800 : 400, color: K.ink, lineHeight: 1.35 }}>{mark}<Rich t={t} /></div>);
  const plain = (t: string, bold = false) => cell(bold ? K.paper2 : "#fff", K.line, "", t, bold);
  const hd = (t: string, c: string, ico: string | null, at: number) => (
    <Fade at={at} style={{ fontFamily: BN, fontSize: 34, fontWeight: 800, color: c, display: "flex", gap: 12, alignItems: "center" }}>{ico && <Ico n={ico} c={c} s={34} w={2.3} />}{t}</Fade>);
  if (tone === "table") {
    const cols = three ? "0.8fr 1fr 1fr" : "0.8fr 1.6fr";
    return (
      <Box>
        <Head t={p.s.head} kicker={p.s.kicker} />
        <div style={{ display: "grid", gridTemplateColumns: cols, gap: "14px 24px" }}>
          {three && <><div />{hd(p.s.left || "", K.royal, null, 4)}{hd(p.s.right || "", K.royal, null, 8)}</>}
          {rows.map((r, i) => {
            const at = v(p, 0.06 + (0.8 * i) / rows.length);
            return (
              <React.Fragment key={i}>
                <Fade at={at} x={-30} y={0}>{plain(r[0], true)}</Fade>
                <Fade at={at + 8} x={30} y={0}>{plain(r[1] || "")}</Fade>
                {three && <Fade at={at + 16} x={30} y={0}>{plain(r[2] || "")}</Fade>}
              </React.Fragment>);
          })}
        </div>
      </Box>
    );
  }
  const neutral = tone === "neutral", flip = tone === "good-bad";
  const bad = { c: K.red, bg: K.redBg, bd: `${K.red}44`, m: "✕ ", ico: "flag" };
  const good = { c: K.green, bg: K.greenBg, bd: `${K.green}44`, m: "✓ ", ico: "shield" };
  const L = neutral ? null : flip ? good : bad, R = neutral ? null : flip ? bad : good;
  return (
    <Box>
      <Head t={p.s.head} kicker={p.s.kicker} />
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px 30px" }}>
        {hd(p.s.left || (neutral ? "" : flip ? "আসল কাজ" : "ফাঁদ"), L ? L.c : K.royal, L ? L.ico : null, 4)}
        {hd(p.s.right || (neutral ? "" : flip ? "ফাঁদ" : "আসল কাজ"), R ? R.c : K.royal, R ? R.ico : null, 8)}
        {rows.map(([a, b], i) => {
          const at = v(p, 0.06 + (0.8 * i) / rows.length);
          return (
            <React.Fragment key={i}>
              <Fade at={at} x={-30} y={0}>{L ? cell(L.bg, L.bd, L.m, a) : plain(a)}</Fade>
              <Fade at={at + 10} x={30} y={0}>{R ? cell(R.bg, R.bd, R.m, b) : plain(b)}</Fade>
            </React.Fragment>);
        })}
      </div>
    </Box>
  );
};

/* ---------- browser walkthrough: real screenshot, cursor, zoom-to-part, callouts ---------- */
type Focus = { x: number; y: number; w: number; h: number; at: number; label?: string; zoom?: number; side?: "top" | "bottom" };
const FW = 1500, PW = 1440, PH = 900; // frame width, page CSS size of the capture
const SBrowser: React.FC<P> = (p) => {
  const f = useCurrentFrame(); const { fps } = useVideoConfig();
  const s = p.s; const foc: Focus[] = s.focus || [];
  const sc = FW / PW, FH = PH * sc * 0.82, left = (1920 - FW) / 2, top = 112, bar = 50;
  const appear = interpolate(f, [0, 16], [0, 1], { ...clamp, easing: ease });
  // camera keyframes: full view → each focus → (optional) back out at end
  const keys = [{ t: 0, z: 1, cx: PW / 2, cy: PH * 0.44 }];
  for (const q of foc) {
    const z = q.zoom || Math.min(2.6, (0.6 * PW) / q.w, (0.55 * PH) / q.h);
    keys.push({ t: v(p, q.at), z: Math.max(1, z), cx: q.x + q.w / 2, cy: q.y + q.h / 2 });
  }
  if (s.outAt) keys.push({ t: v(p, s.outAt), z: 1, cx: PW / 2, cy: PH * 0.44 });
  let k = 0; while (k < keys.length - 1 && f >= keys[k + 1].t) k++;
  const A = keys[k], B = keys[Math.min(k + 1, keys.length - 1)];
  const m = B === A ? 1 : interpolate(f, [B.t, B.t + 26], [0, 1], { ...clamp, easing: ease });
  const cur = f >= B.t ? { z: A.z + (B.z - A.z) * m, cx: A.cx + (B.cx - A.cx) * m, cy: A.cy + (B.cy - A.cy) * m } : A;
  const z = cur.z;
  // clamp so the page never leaves the frame
  const half = (n: number, zz: number) => n / (2 * zz);
  const VH = FH / sc; const cx = Math.min(PW - half(PW, z), Math.max(half(PW, z), cur.cx)), cy = Math.min(PH - half(VH, z), Math.max(half(VH, z), cur.cy));
  const tx = FW / 2 - cx * sc * z, ty = FH / 2 - cy * sc * z;
  const fi = foc.findIndex((q, i) => f >= v(p, q.at) && (i === foc.length - 1 || f < v(p, foc[i + 1].at)) && (!s.outAt || f < v(p, s.outAt)));
  const q = fi >= 0 ? foc[fi] : null;
  // cursor goes to the focused part (screen coords inside the frame)
  const toScr = (x: number, y: number) => ({ x: left + tx + x * sc * z, y: top + bar + ty + y * sc * z });
  const target = q ? toScr(q.x + q.w * 0.7, q.y + q.h * 0.62) : { x: left + FW * 0.8, y: top + bar + FH * 0.85 };
  const prevT = fi > 0 ? toScr(foc[fi - 1].x + foc[fi - 1].w * 0.7, foc[fi - 1].y + foc[fi - 1].h * 0.62) : { x: left + FW * 0.8, y: top + bar + FH * 0.85 };
  const cm = q ? interpolate(f, [v(p, q.at) + 18, v(p, q.at) + 34], [0, 1], { ...clamp, easing: ease }) : 1;
  const cX = prevT.x + (target.x - prevT.x) * cm, cY = prevT.y + (target.y - prevT.y) * cm;
  const click = q ? (f - (v(p, q.at) + 36)) / 10 : -1;
  const ring = q ? (() => { const a = toScr(q.x, q.y); return { x: a.x, y: a.y, w: q.w * sc * z, h: q.h * sc * z }; })() : null;
  const ro = q ? interpolate(f, [v(p, q.at) + 22, v(p, q.at) + 32], [0, 1], clamp) : 0;
  return (
    <AbsoluteFill>
      <div style={{ position: "absolute", left, top, width: FW, height: FH + bar, borderRadius: 18, overflow: "hidden", background: "#fff", boxShadow: "0 40px 100px rgba(11,27,63,.30), 0 0 0 1px rgba(11,27,63,.10)", opacity: appear, transform: `translateY(${(1 - appear) * 40}px)` }}>
        <div style={{ height: bar, background: "#E9ECF1", display: "flex", alignItems: "center", gap: 10, padding: "0 18px", borderBottom: "1px solid #D8DCE3" }}>
          {["#FF5F57", "#FEBC2E", "#28C840"].map((c) => <div key={c} style={{ width: 13, height: 13, borderRadius: 7, background: c }} />)}
          <div style={{ marginLeft: 18, width: 760, height: 32, borderRadius: 16, background: "#fff", fontFamily: EN, fontSize: 17, color: "#555", display: "flex", alignItems: "center", gap: 10, padding: "0 16px", fontWeight: 500, overflow: "hidden", whiteSpace: "nowrap" }}>
            <svg width="14" height="14" viewBox="0 0 24 24"><path d="M6 10V8a6 6 0 0112 0v2M5 10h14v11H5z" stroke="#555" strokeWidth="2.4" fill="none" /></svg>{s.url}
          </div>
          <BarNote t={s.note || "Fiverr.com-এর পাবলিক সার্চ পেজ (১৬ নভেম্বর ২০২৬) · বিক্রেতার নাম ও ছবি ঝাপসা করা · Fiverr তার কোম্পানির ট্রেডমার্ক"} />
        </div>
        <div style={{ position: "relative", width: FW, height: FH, overflow: "hidden" }}>
          <Img src={staticFile(s.img)} style={{ position: "absolute", left: 0, top: 0, width: FW, height: PH * sc, transformOrigin: "0 0", transform: `translate(${tx}px, ${ty}px) scale(${z})` }} />
        </div>
      </div>
      {ring && <div style={{ position: "absolute", left: ring.x - 8, top: ring.y - 8, width: ring.w + 16, height: ring.h + 16, borderRadius: 16, border: `5px solid ${K.caret}`, boxShadow: `0 0 0 9999px rgba(11,27,63,${0.28 * ro})`, opacity: ro }} />}
      {q?.label && ring && (() => {
        const above = (q.side || (ring.y > 330 ? "top" : "bottom")) === "top";
        const lx = Math.min(1920 - 760, Math.max(60, ring.x + ring.w / 2 - 340));
        return (
          <div style={{ position: "absolute", left: lx, top: above ? Math.max(70, ring.y - 96) : Math.min(1080 - 230, ring.y + ring.h + 22), transform: `scale(${pop(f, fps, v(p, q.at) + 30)})`, transformOrigin: "center" }}>
            <div style={{ maxWidth: 740, fontFamily: BN, fontSize: 34, fontWeight: 700, color: "#fff", background: K.navy, padding: "10px 26px 12px", borderRadius: 16, boxShadow: "0 14px 34px rgba(1,24,53,.35)", borderLeft: `8px solid ${K.caret}`, lineHeight: 1.3 }}><Rich t={q.label} /></div>
          </div>);
      })()}
      <Cursor x={cX} y={cY} click={click} />
      {s.chip && <Fade at={6} style={{ position: "absolute", left: 0, right: 0, top: 46, textAlign: "center" }}><span style={{ fontFamily: BN, fontSize: 30, color: "#fff", fontWeight: 700, background: K.royal, padding: "8px 26px", borderRadius: 30, boxShadow: "0 10px 26px rgba(0,80,237,.3)" }}><Rich t={s.chip} /></span></Fade>}
    </AbsoluteFill>
  );
};

/* ---------- look-alike search results drawn from real public listings (title, rating, price) ---------- */
type Gig = { t: string; r?: string; n?: string; p: string; lv?: string; e?: string; c?: string };
const SGigs: React.FC<P> = (p) => {
  const f = useCurrentFrame(); const { fps } = useVideoConfig();
  const s = p.s; const gigs: Gig[] = s.gigs || []; const q: string = s.query || "";
  const tType = 14, tTypeB = Math.min(v(p, 0.14), 14 + q.length * 2.2), tCards = tTypeB + 10;
  const tFoc = s.focusAt !== undefined ? v(p, s.focusAt) : 1e9; const fi = s.focus ?? 0;
  const fz = interpolate(f, [tFoc, tFoc + 22], [0, 1], { ...clamp, easing: ease });
  const left = 160, top = 112, W = 1600, bar = 50;
  return (
    <AbsoluteFill>
      <Fade at={0} y={30} style={{ position: "absolute", left, top, width: W, height: 740, borderRadius: 18, overflow: "hidden", background: "#fff", boxShadow: "0 40px 100px rgba(11,27,63,.28), 0 0 0 1px rgba(11,27,63,.10)" }}>
        <div style={{ height: bar, background: "#E9ECF1", display: "flex", alignItems: "center", gap: 10, padding: "0 18px", borderBottom: "1px solid #D8DCE3" }}>
          {["#FF5F57", "#FEBC2E", "#28C840"].map((c) => <div key={c} style={{ width: 13, height: 13, borderRadius: 7, background: c }} />)}
          <div style={{ marginLeft: 18, width: 760, height: 32, borderRadius: 16, background: "#fff", fontFamily: EN, fontSize: 17, color: "#555", display: "flex", alignItems: "center", padding: "0 16px", fontWeight: 500, whiteSpace: "nowrap", overflow: "hidden" }}>fiverr.com/search/gigs?query={q.replace(/ /g, "%20")}</div>
          <BarNote t={s.note || "Fiverr-এর পাবলিক তালিকার আসল শিরোনাম, রেটিং ও শুরুর দাম দিয়ে আঁকা (ছবি ও নাম বাদ) · নভেম্বর ২০২৬ · দাম বদলাতে পারে"} />
        </div>
        <div style={{ padding: "26px 44px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 16, height: 66, borderRadius: 12, border: "1.5px solid #C5C6C9", padding: "0 22px", width: 820 }}>
            <Ico n="search" c="#62646A" s={30} />
            <span style={{ fontFamily: EN, fontSize: 28, color: "#222325", fontWeight: 500 }}>{typed(q, f, tType, tTypeB)}{f < tCards && Math.floor(f / 14) % 2 === 0 && "|"}</span>
          </div>
          <Fade at={tCards} style={{ display: "flex", alignItems: "baseline", gap: 18, margin: "20px 0 18px" }}>
            <span style={{ fontFamily: EN, fontSize: 30, color: "#222325" }}>Results for <b>{q}</b></span>
            {s.count && <span style={{ fontFamily: EN, fontSize: 22, color: "#74767E" }}>{s.count} results</span>}
          </Fade>
          <div style={{ display: "grid", gridTemplateColumns: `repeat(${gigs.length}, 1fr)`, gap: 24 }}>
            {gigs.map((g, i) => {
              const k = pop(f, fps, tCards + 6 + i * 7); const on = i === fi && fz > 0; const off = fz > 0 && i !== fi;
              return (
                <div key={i} style={{ opacity: Math.min(1, k * 1.4) * (off ? 1 - 0.55 * fz : 1), transform: `translateY(${(1 - Math.min(1, k)) * 40}px) scale(${on ? 1 + 0.06 * fz : 1})`, transformOrigin: "50% 30%", borderRadius: 14, boxShadow: on ? `0 0 0 ${5 * fz}px ${K.caret}, 0 24px 50px rgba(11,27,63,${0.25 * fz})` : "none", background: "#fff", position: "relative", zIndex: on ? 2 : 1 }}>
                  <div style={{ height: 250, borderRadius: 12, background: `linear-gradient(135deg, ${g.c || "#BFD7FF"}, #EEF2F8)`, display: "grid", placeItems: "center", fontSize: 120 }}>{g.e || "🎬"}</div>
                  <div style={{ padding: "12px 4px 10px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
                      <div style={{ width: 28, height: 28, borderRadius: 14, background: "#D6D9DE" }} />
                      <div style={{ width: 110, height: 14, borderRadius: 7, background: "#E1E4E8" }} />
                      {g.lv && <span style={{ marginLeft: "auto", fontFamily: EN, fontSize: 17, fontWeight: 700, color: "#404145" }}>{g.lv}</span>}
                    </div>
                    <div style={{ fontFamily: EN, fontSize: 25, color: "#404145", lineHeight: 1.34, height: 101, overflow: "hidden" }}>{g.t}</div>
                    {g.r ? <div style={{ fontFamily: EN, fontSize: 23, color: "#222325", fontWeight: 700, marginTop: 6 }}>★ {g.r} <span style={{ color: "#74767E", fontWeight: 500 }}>({g.n})</span></div> : <div style={{ height: 25, marginTop: 6 }} />}
                    <div style={{ fontFamily: EN, fontSize: 28, color: "#222325", fontWeight: 700, marginTop: 8 }}>From {g.p}</div>
                  </div>
                </div>);
            })}
          </div>
        </div>
      </Fade>
      {s.label && fz > 0 && <div style={{ position: "absolute", left: 0, right: 0, top: 880, display: "flex", justifyContent: "center", transform: `scale(${pop(f, fps, tFoc + 10)})` }}><div style={{ maxWidth: 1300, fontFamily: BN, fontSize: 34, fontWeight: 700, color: "#fff", background: K.navy, padding: "10px 28px 12px", borderRadius: 16, borderLeft: `8px solid ${K.caret}`, boxShadow: "0 14px 34px rgba(1,24,53,.35)" }}><Rich t={s.label} /></div></div>}
      {s.chip && <Fade at={6} style={{ position: "absolute", left: 0, right: 0, top: 50, textAlign: "center" }}><span style={{ fontFamily: BN, fontSize: 30, color: "#fff", fontWeight: 700, background: K.royal, padding: "8px 26px", borderRadius: 30 }}><Rich t={s.chip} /></span></Fade>}
    </AbsoluteFill>
  );
};
const typed = (text: string, f: number, a: number, b: number) => text.slice(0, Math.round(interpolate(f, [a, b], [0, text.length], clamp)));

/* ---------- রিয়েলিটি কার্ড ---------- */
const SReality: React.FC<P> = (p) => {
  const f = useCurrentFrame(); const { fps } = useVideoConfig();
  const rows: { k: string; v: string; i: string; tone?: string; dots?: number }[] = p.s.rows || [];
  return (
    <Box style={{ alignItems: "center" }}>
      <Fade at={2} style={{ width: 1420 }}>
        <Card style={{ padding: 0, overflow: "hidden" }}>
          <div style={{ background: K.navy, padding: "24px 40px", display: "flex", alignItems: "center", gap: 22 }}>
            <div style={{ fontFamily: BN, fontSize: 26, fontWeight: 700, color: K.navy, background: "#FFD166", padding: "4px 16px", borderRadius: 8 }}>রিয়েলিটি কার্ড</div>
            <div style={{ fontFamily: BN, fontSize: 44, fontWeight: 800, color: "#fff" }}>{p.s.head}</div>
          </div>
          <div style={{ padding: "16px 40px 22px" }}>
            {rows.map((r, i) => {
              const at = v(p, 0.06 + (0.8 * i) / rows.length); const c = COL[r.tone || "k"] || K.ink;
              return (
                <Fade key={i} at={at} x={-20} y={0} style={{ display: "flex", alignItems: "center", gap: 22, padding: "13px 0", borderBottom: i < rows.length - 1 ? `1.5px dashed ${K.line}` : "none" }}>
                  <div style={{ flex: "none", width: 56, height: 56, borderRadius: 16, background: `${c}14`, display: "grid", placeItems: "center" }}><Ico n={r.i} c={c} s={32} w={2.1} /></div>
                  <div style={{ flex: "none", width: 330, fontFamily: BN, fontSize: 29, color: K.dim, fontWeight: 600 }}>{r.k}</div>
                  <div style={{ flex: 1, fontFamily: BN, fontSize: 33, color: K.ink, fontWeight: 600, lineHeight: 1.32 }}><Rich t={r.v} /></div>
                  {r.dots !== undefined && <div style={{ display: "flex", gap: 8 }}>{[0, 1, 2, 3, 4].map((d) => <div key={d} style={{ width: 24, height: 24, borderRadius: 12, background: d < r.dots! ? K.amber : K.line, transform: `scale(${d < r.dots! ? Math.min(1, pop(f, fps, at + 10 + d * 4)) : 1})` }} />)}</div>}
                </Fade>);
            })}
          </div>
        </Card>
      </Fade>
      {p.s.src && <Fade at={v(p, 0.6)} style={{ marginTop: 18, alignSelf: "flex-start", marginLeft: 120 }}><Src t={p.s.src} /></Fade>}
    </Box>
  );
};

/* ---------- sourced trend bars ---------- */
const STrends: React.FC<P> = (p) => {
  const f = useCurrentFrame();
  const bars: [string, number][] = p.s.bars || []; const max = Math.max(...bars.map((b) => b[1]));
  return (
    <Box>
      <Head t={p.s.head} kicker={p.s.kicker} />
      <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
        {bars.map(([l, n], i) => {
          const at = v(p, 0.12 + (0.6 * i) / bars.length); const g = interpolate(f, [at, at + 28], [0, n / max], { ...clamp, easing: ease });
          return (
            <Fade key={i} at={at} style={{ display: "flex", alignItems: "center", gap: 24 }}>
              <div style={{ width: 430, textAlign: "right", fontFamily: BN, fontSize: 34, fontWeight: 700, color: K.ink }}>{l}</div>
              <div style={{ flex: 1, height: 56, borderRadius: 14, background: "rgba(11,27,63,.06)", overflow: "hidden" }}>
                <div style={{ width: `${Math.max(1, g * 100)}%`, height: "100%", borderRadius: 14, background: i === 0 ? `linear-gradient(90deg, ${K.caret}, #FF9A5C)` : `linear-gradient(90deg, ${K.royal}, ${K.sky})` }} />
              </div>
              <div style={{ width: 170, fontFamily: BN, fontSize: 40, fontWeight: 800, color: i === 0 ? K.caret : K.royal }}>+{bn(Math.round(n * Math.min(1, g / (n / max) || 0)))}%</div>
            </Fade>);
        })}
      </div>
      {p.s.note && <Fade at={v(p, 0.74)} style={{ marginTop: 30 }}><div style={{ fontFamily: BN, fontSize: 30, color: K.ink2, lineHeight: 1.45, padding: "14px 24px", borderRadius: 14, background: K.amberBg, borderLeft: `6px solid ${K.amber}` }}><Rich t={p.s.note} /></div></Fade>}
      {p.s.src && <Fade at={v(p, 0.5)} style={{ marginTop: 18 }}><Src t={p.s.src} /></Fade>}
    </Box>
  );
};

/* ---------- where an order's money goes ---------- */
const SMoney: React.FC<P> = (p) => {
  const f = useCurrentFrame(); const { fps } = useVideoConfig();
  const st: { t: string; d: string; i: string; amt?: string; c?: string }[] = p.s.steps || []; const n = st.length;
  const at = (i: number) => v(p, 0.06 + (0.74 * i) / n);
  const W = 1660, gap = W / n;
  const prog = interpolate(f, st.map((_, i) => at(i)), st.map((_, i) => i), clamp);
  return (
    <Box>
      <Head t={p.s.head} kicker={p.s.kicker} />
      <div style={{ position: "relative", height: 470, marginTop: 20 }}>
        <div style={{ position: "absolute", left: gap / 2, width: W - gap, top: 74, height: 6, background: K.line, borderRadius: 3 }} />
        <div style={{ position: "absolute", left: gap / 2, width: (W - gap) * (prog / Math.max(1, n - 1)), top: 74, height: 6, background: `linear-gradient(90deg, ${K.green}, ${K.royal})`, borderRadius: 3 }} />
        <div style={{ position: "absolute", left: gap / 2 + gap * prog - 22, top: 55, width: 44, height: 44, borderRadius: 22, background: "#FFD166", border: "3px solid #E8A50C", display: "grid", placeItems: "center", fontFamily: EN, fontWeight: 700, fontSize: 24, color: "#7A5200", opacity: f >= at(0) ? 1 : 0, boxShadow: "0 6px 16px rgba(232,165,12,.4)" }}>$</div>
        {st.map((x, i) => {
          const on = f >= at(i); const k = Math.min(1, pop(f, fps, at(i))); const c = COL[x.c || "b"] || K.royal;
          return (
            <div key={i} style={{ position: "absolute", left: gap * i, width: gap, top: 0, display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center", opacity: 0.3 + 0.7 * k }}>
              <div style={{ width: 150, height: 150, borderRadius: 36, background: on ? "#fff" : "rgba(255,255,255,.5)", border: `3px solid ${on ? c : K.line}`, display: "grid", placeItems: "center", boxShadow: on ? `0 16px 36px ${c}33` : "none", transform: `scale(${0.9 + 0.1 * k})` }}><Ico n={x.i} c={on ? c : K.dim} s={66} /></div>
              {x.amt && <div style={{ fontFamily: BN, fontSize: 44, fontWeight: 800, color: c, marginTop: 16 }}>{x.amt}</div>}
              <div style={{ fontFamily: BN, fontSize: 32, fontWeight: 700, color: K.ink, marginTop: x.amt ? 4 : 20 }}>{x.t}</div>
              <div style={{ fontFamily: BN, fontSize: 25, color: K.ink2, marginTop: 6, lineHeight: 1.38, padding: "0 12px" }}><Rich t={x.d} /></div>
            </div>);
        })}
      </div>
      {p.s.src && <Fade at={v(p, 0.6)} style={{ marginTop: "auto" }}><Src t={p.s.src} /></Fade>}
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
    <Pop at={4}><Img src={staticFile("income/_brand/aiu-logo-dark.svg")} style={{ height: 96 }} /></Pop>
    <Fade at={16}><div style={{ fontFamily: BN, fontSize: 64, fontWeight: 800, color: "#fff", margin: "40px 0 20px" }}>{p.s.head || "পরের পাঠে দেখা হবে!"}</div></Fade>
    {p.spec.next && <Fade at={26}><div style={{ fontFamily: BN, fontSize: 42, color: "rgba(230,236,255,.75)" }}>পরের পাঠ: <span style={{ color: "#FFB089", fontWeight: 700 }}>{p.spec.next}</span></div></Fade>}
    <Fade at={40}><div style={{ fontFamily: BN, fontSize: 32, color: "rgba(230,236,255,.7)", marginTop: 44, maxWidth: 1300, lineHeight: 1.5 }}>{p.s.note || "এই কোর্স কোনো আয়ের নিশ্চয়তা দেয় না — শেখায় কীভাবে সৎভাবে চেষ্টা করবেন।"}<br /><span style={{ color: "#fff", fontWeight: 700 }}>aiuniversitybd.com</span></div></Fade>
  </Box>
);

const MAP: Record<string, React.FC<any>> = { title: STitle, ways: SWays, myth: SMyth, scam: SScam, test: STest, vs: SVs, browser: SBrowser, gigs: SGigs, reality: SReality, trends: STrends, money: SMoney, points: SPoints, mission: SMission, recap: SRecap, outro: SOutro };
const DARK = new Set(["title", "outro"]);

/* ---------- chrome, subtitles, audio ---------- */
const Chrome: React.FC<{ spec: Spec; total: number; dark: boolean }> = ({ spec, total, dark }) => {
  const f = useCurrentFrame();
  const ink = dark ? "#fff" : K.ink, dim = dark ? "rgba(230,236,255,.6)" : K.dim;
  return (
    <>
      <div style={{ position: "absolute", left: 0, top: 0, height: 5, width: `${(f / total) * 100}%`, background: `linear-gradient(90deg, ${K.royal}, ${K.caret})` }} />
      <div style={{ position: "absolute", left: 60, top: 38, display: "flex", alignItems: "center", gap: 16 }}>
        <Img src={staticFile(`income/_brand/aiu-logo-${dark ? "dark" : "ink"}.svg`)} style={{ height: 34 }} />
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

export const IncomeVideo: React.FC<{ spec: Spec }> = ({ spec }) => {
  const f = useCurrentFrame();
  const lens = spec.scenes.map(sceneLen);
  const starts = lens.reduce<number[]>((a, _, i) => [...a, i ? a[i - 1] + lens[i - 1] : 15], []);
  const chunks = subChunks(spec, starts);
  const cur = chunks.find((x) => f >= x.from && f < x.to + 4);
  const total = incLen(spec);
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
            <Sequence from={LEAD}><Audio src={staticFile(`income/${spec.id}/vo/${String(i + 1).padStart(2, "0")}.mp3`)} /></Sequence>
            <Sequence from={0}><Audio src={staticFile(`aiu2/${i === 0 ? "swell" : s.type === "outro" ? "chime" : "whoosh"}.mp3`)} volume={0.18} /></Sequence>
            {s.type === "scam" && <Sequence from={Math.round(v({ s, spec, vo: s.frames }, s.stampAt || 0.88))}><Audio src={staticFile("aiu2/hit.mp3")} volume={0.35} /></Sequence>}
          </Sequence>
        );
      })}
      <Chrome spec={spec} total={total} dark={dark} />
      {cur && <div style={{ position: "absolute", left: 0, right: 0, bottom: 50, display: "flex", justifyContent: "center", opacity: interpolate(f, [cur.from, cur.from + 5, cur.to, cur.to + 4], [0, 1, 1, 0], clamp) }}><div style={{ maxWidth: 1500, padding: "8px 26px 12px", borderRadius: 14, background: "rgba(1,24,53,.86)", fontFamily: BN, fontSize: 34, fontWeight: 500, color: "#fff", textAlign: "center", lineHeight: 1.35 }}>{cur.s.replace(/[।,]$/, "")}</div></div>}
      <Audio src={staticFile("aiu2/music.mp3")} volume={(fr) => (busy(fr) ? 0.04 : 0.12) * interpolate(fr, [0, 30, total - 60, total], [0, 1, 1, 0], clamp)} />
    </AbsoluteFill>
  );
};
