// AI University — "গ্রাফিক ডিজাইন মাস্টার কোর্স — ফটোশপ ছাড়াই" lesson engine (2026-11-16).
// Bright creative-studio look: white artboards on a dotted canvas, Figma-like selection handles + size labels,
// soft colour blobs, brand navy/royal + caret orange. Rule first → what to tell the AI → REAL result → right vs wrong → mission.
// Scenes: title · points · logotypes (7 own-drawn fictional logos) · small (logo at many sizes / one colour) · brands (brand stories, text + idea sketch, no logos)
//         prompt (coloured parts snap into one prompt) · chat (look-alike AI app window, typed prompt, REAL generated image)
//         compare (two real results side by side) · transparent (before/after slider + PNG vs SVG zoom) · sizes (platform frames)
//         wheel (colour wheel + harmonies) · psych · hex · palette (60-30-10 on a real poster) · contrast (real WCAG ratios)
//         postmortem (public-domain poster, numbered marks, measured palette, credit) · note · mission · recap · outro
// One spec per lesson: src/gdesign/specs/<id>.json, timed by scripts/gdesign_make.py. Images live in public/gdesign/_img (made by scripts/gdesign_images.py).
import React from "react";
import { AbsoluteFill, Audio, Img, Sequence, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig, Easing, delayRender, continueRender } from "remotion";

const K = {
  canvas: "#F4F5FA", ink: "#0B1B3F", ink2: "#3A4566", dim: "#6E7690", line: "rgba(11,27,63,.12)", card: "#FFFFFF",
  navy: "#011835", royal: "#0050ED", caret: "#FF5A1F", green: "#12A06B", red: "#E5484D", amber: "#E8920C", violet: "#7C5CFC", pink: "#E8458B", teal: "#0EA5A5", sel: "#2F7BFF",
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
const img = (p: string) => staticFile(`gdesign/${p}`);

export type Scene = { type: string; vo: string; frames: number; hold?: number; [k: string]: any };
export type Spec = { id: string; course: string; module: string; lessonNo: string; title: string; next: string; scenes: Scene[] };
const LEAD = 12, TAIL = 18;
const sceneLen = (s: Scene) => LEAD + s.frames + (s.hold || 0) + TAIL;
export const gdLen = (spec: Spec) => spec.scenes.reduce((n, s) => n + sceneLen(s), 0) + 30;
type P = { s: Scene; spec: Spec; vo: number };
const v = (p: P, x: number) => LEAD + p.vo * x;
const COL: Record<string, string> = { b: K.royal, g: K.green, r: K.red, y: K.amber, o: K.caret, v: K.violet, k: K.ink, p: K.pink, t: K.teal };

/* ---------- colour maths (real formulas) ---------- */
const rgb = (hex: string) => { const h = hex.replace("#", ""); return [0, 2, 4].map((i) => parseInt(h.slice(i, i + 2), 16)); };
const lum = (hex: string) => { const [r, g, b] = rgb(hex).map((c) => { const x = c / 255; return x <= 0.03928 ? x / 12.92 : Math.pow((x + 0.055) / 1.055, 2.4); }); return 0.2126 * r + 0.7152 * g + 0.0722 * b; };
export const ratio = (a: string, b: string) => { const [x, y] = [lum(a), lum(b)].sort((m, n) => n - m); return (x + 0.05) / (y + 0.05); };
const hsl = (h: number, s = 78, l = 56) => `hsl(${h} ${s}% ${l}%)`;

/* ---------- primitives ---------- */
const Fade: React.FC<{ at: number; children: React.ReactNode; style?: React.CSSProperties; y?: number; x?: number }> = ({ at, children, style, y = 18, x = 0 }) => {
  const f = useCurrentFrame(); const o = interpolate(f, [at, at + 12], [0, 1], { ...clamp, easing: ease });
  return <div style={{ opacity: o, transform: `translate(${(1 - o) * x}px, ${(1 - o) * y}px)`, ...style }}>{children}</div>;
};
const Pop: React.FC<{ at: number; children: React.ReactNode; style?: React.CSSProperties }> = ({ at, children, style }) => {
  const f = useCurrentFrame(); const { fps } = useVideoConfig(); const k = pop(f, fps, at);
  return <div style={{ opacity: Math.min(1, k * 1.4), transform: `scale(${0.6 + 0.4 * k})`, ...style }}>{children}</div>;
};
const Rich: React.FC<{ t: string; style?: React.CSSProperties }> = ({ t, style }) => (
  <span style={style}>{String(t || "").split(/(\[[a-z]:[^\]]+\])/).filter(Boolean).map((x, i) => {
    const m = x.match(/^\[([a-z]):([^\]]+)\]$/);
    return m ? <span key={i} style={{ color: COL[m[1]] || K.ink, fontWeight: 700 }}>{m[2]}</span> : <span key={i}>{x}</span>;
  })}</span>
);
const Head: React.FC<{ t: string; at?: number; kicker?: string; size?: number }> = ({ t, at = 2, kicker, size = 56 }) => (
  <Fade at={at} style={{ marginBottom: 26 }}>
    {kicker && <div style={{ display: "inline-block", fontFamily: BN, fontSize: 25, color: K.caret, fontWeight: 700, marginBottom: 8, padding: "2px 16px", borderRadius: 8, background: "rgba(255,90,31,.1)" }}>{kicker}</div>}
    <div style={{ fontFamily: BN, fontSize: size, fontWeight: 700, color: K.ink, lineHeight: 1.22 }}><Rich t={t} /></div>
  </Fade>
);
const Box: React.FC<{ children: React.ReactNode; style?: React.CSSProperties }> = ({ children, style }) => (
  <div style={{ position: "absolute", left: 120, right: 120, top: 120, bottom: 150, display: "flex", flexDirection: "column", ...style }}>{children}</div>
);
const Card: React.FC<{ children: React.ReactNode; style?: React.CSSProperties; edge?: string }> = ({ children, style, edge }) => (
  <div style={{ background: K.card, borderRadius: 22, border: `1.5px solid ${K.line}`, boxShadow: "0 18px 50px rgba(11,27,63,.10), 0 2px 6px rgba(11,27,63,.06)", borderTop: edge ? `6px solid ${edge}` : undefined, ...style }}>{children}</div>
);
// Figma-like artboard: label above, selection handles when "sel"
const Artboard: React.FC<{ label?: string; sel?: boolean; children: React.ReactNode; style?: React.CSSProperties; bg?: string }> = ({ label, sel, children, style, bg = "#fff" }) => (
  <div style={{ position: "relative", ...style }}>
    {label && <div style={{ position: "absolute", top: -34, left: 0, fontFamily: EN, fontSize: 19, fontWeight: 700, color: K.dim, whiteSpace: "nowrap" }}>{label}</div>}
    <div style={{ position: "absolute", inset: 0, background: bg, borderRadius: 6, boxShadow: "0 14px 40px rgba(11,27,63,.12), 0 0 0 1px rgba(11,27,63,.08)", overflow: "hidden" }}>{children}</div>
    {sel && <>
      <div style={{ position: "absolute", inset: -4, border: `2.5px solid ${K.sel}`, borderRadius: 8 }} />
      {[[0, 0], [1, 0], [0, 1], [1, 1]].map(([x, y], i) => <div key={i} style={{ position: "absolute", left: `calc(${x * 100}% - 9px)`, top: `calc(${y * 100}% - 9px)`, width: 14, height: 14, background: "#fff", border: `2.5px solid ${K.sel}` }} />)}
    </>}
  </div>
);
const Checker: React.FC<{ style?: React.CSSProperties }> = ({ style }) => (
  <div style={{ position: "absolute", inset: 0, backgroundColor: "#fff", backgroundImage: "linear-gradient(45deg,#D9DCE3 25%,transparent 25%),linear-gradient(-45deg,#D9DCE3 25%,transparent 25%),linear-gradient(45deg,transparent 75%,#D9DCE3 75%),linear-gradient(-45deg,transparent 75%,#D9DCE3 75%)", backgroundSize: "36px 36px", backgroundPosition: "0 0,0 18px,18px -18px,-18px 0", ...style }} />
);
const Tag: React.FC<{ t: string; c?: string; style?: React.CSSProperties }> = ({ t, c = K.royal, style }) => (
  <div style={{ display: "inline-block", fontFamily: BN, fontSize: 24, fontWeight: 700, color: c, background: `${c}16`, border: `1.5px solid ${c}55`, padding: "4px 16px", borderRadius: 10, ...style }}>{t}</div>
);
const ICON: Record<string, string> = {
  eye: "M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12zM12 9a3 3 0 110 6 3 3 0 010-6z", star: "M12 3l2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1-4.4-4.3 6.1-.9z",
  min: "M5 12h14", drop: "M12 3s6 7 6 11a6 6 0 01-12 0c0-4 6-11 6-11z", clock: "M12 3a9 9 0 110 18 9 9 0 010-18zM12 7v5l3 2", resize: "M4 4h6M4 4v6M20 20h-6M20 20v-6M4 4l7 7M20 20l-7-7",
  check: "M5 12l5 5 9-10", x: "M6 6l12 12M18 6L6 18", pen: "M4 20l4-1 11-11-3-3L5 16zM14 6l3 3", shield: "M12 3l8 3v6c0 5-4 8-8 9-4-1-8-4-8-9V6z", bulb: "M9 18h6M10 21h4M12 3a6 6 0 00-4 10c1 1 1 2 1 3h6c0-1 0-2 1-3a6 6 0 00-4-10z",
  img: "M3 5h18v14H3zM3 16l5-5 4 4 3-3 6 6M15 9a1.5 1.5 0 100 .1", type: "M5 6V4h14v2M12 4v16M9 20h6", layers: "M12 3l9 5-9 5-9-5zM3 13l9 5 9-5", money: "M3 7h18v10H3zM12 9.5a2.5 2.5 0 110 5 2.5 2.5 0 010-5z",
};
const Ico: React.FC<{ n: string; c?: string; s?: number; w?: number }> = ({ n, c = K.ink, s = 46, w = 2 }) => (
  <svg width={s} height={s} viewBox="0 0 24 24"><path d={ICON[n] || ICON.star} stroke={c} strokeWidth={w} fill="none" strokeLinecap="round" strokeLinejoin="round" /></svg>
);

/* ---------- background: dotted design canvas + soft colour blobs ---------- */
const Background: React.FC<{ dark?: boolean }> = ({ dark }) => {
  const f = useCurrentFrame();
  if (dark) return (
    <AbsoluteFill style={{ background: `radial-gradient(110% 90% at 30% 10%, #0B2C6B 0%, ${K.navy} 55%, #00102A 100%)` }}>
      <AbsoluteFill style={{ opacity: 0.22, backgroundImage: "radial-gradient(rgba(255,255,255,.55) 1.3px, transparent 1.4px)", backgroundSize: "34px 34px", maskImage: "radial-gradient(70% 70% at 50% 50%, #000 20%, transparent 100%)" }} />
      {[[K.caret, 72, 26], [K.pink, 20, 78], [K.teal, 88, 82]].map(([c, x, y], i) => (
        <AbsoluteFill key={i} style={{ background: `radial-gradient(22% 26% at ${+x + 5 * Math.sin(f / (80 + i * 20))}% ${+y + 5 * Math.cos(f / (100 + i * 15))}%, ${c}38, transparent 70%)` }} />
      ))}
    </AbsoluteFill>
  );
  return (
    <AbsoluteFill style={{ background: `linear-gradient(180deg, #FAFBFE 0%, ${K.canvas} 100%)` }}>
      <AbsoluteFill style={{ opacity: 0.9, backgroundImage: "radial-gradient(rgba(11,27,63,.13) 1.3px, transparent 1.4px)", backgroundSize: "30px 30px" }} />
      {[["rgba(255,90,31,.09)", 88, 14], ["rgba(0,80,237,.07)", 10, 88], ["rgba(232,69,139,.06)", 94, 90]].map(([c, x, y], i) => (
        <AbsoluteFill key={i} style={{ background: `radial-gradient(26% 30% at ${+x + 4 * Math.sin(f / (140 + i * 25))}% ${+y + 4 * Math.cos(f / (120 + i * 30))}%, ${c}, transparent 70%)` }} />
      ))}
    </AbsoluteFill>
  );
};

/* ---------- title ---------- */
const STitle: React.FC<P> = (p) => {
  const f = useCurrentFrame(); const { fps } = useVideoConfig();
  const sw: string[] = p.s.swatches || ["#0050ED", "#FF5A1F", "#E8458B", "#12A06B", "#F4C430"];
  return (
    <Box style={{ alignItems: "flex-start", justifyContent: "center" }}>
      <Fade at={4}><div style={{ fontFamily: BN, fontSize: 30, color: "#FFB089", fontWeight: 600, padding: "6px 22px", borderRadius: 30, border: "1.5px solid rgba(255,140,90,.5)", background: "rgba(255,90,31,.10)" }}>{p.s.kicker || `${p.spec.course} · ${p.spec.lessonNo}`}</div></Fade>
      <Fade at={12} y={30}><div style={{ fontFamily: BN, fontSize: 96, fontWeight: 800, lineHeight: 1.16, margin: "30px 0 22px", maxWidth: 1450, color: "#fff" }}><Rich t={p.s.title || p.spec.title} /></div></Fade>
      {p.s.sub && <Fade at={v(p, 0.3)}><div style={{ fontFamily: BN, fontSize: 38, color: "rgba(230,236,255,.8)", maxWidth: 1300, lineHeight: 1.45 }}>{p.s.sub}</div></Fade>}
      <div style={{ display: "flex", gap: 14, marginTop: 44 }}>
        {sw.map((c, i) => { const k = pop(f, fps, v(p, 0.45) + i * 5); return <div key={i} style={{ width: 86, height: 86, borderRadius: 20, background: c, transform: `scale(${k}) rotate(${(1 - k) * -30}deg)`, boxShadow: "0 10px 30px rgba(0,0,0,.35)" }} />; })}
      </div>
    </Box>
  );
};

/* ---------- points ---------- */
const SPoints: React.FC<P> = (p) => {
  const it: { t: string; d?: string; i?: string; c?: string }[] = p.s.items || [];
  return (
    <Box style={{ justifyContent: "center" }}>
      <Head t={p.s.head} kicker={p.s.kicker} />
      <div style={{ display: "grid", gridTemplateColumns: `repeat(${p.s.cols || (it.length > 4 ? 3 : 2)}, 1fr)`, gap: 26 }}>
        {it.map((x, i) => (
          <Pop key={i} at={v(p, 0.08 + (0.72 * i) / it.length)}>
            <Card style={{ padding: "34px 34px", display: "flex", gap: 24, alignItems: "flex-start", minHeight: 230 }} edge={COL[x.c || "b"]}>
              <div style={{ flex: "none", width: 92, height: 92, borderRadius: 24, background: `${COL[x.c || "b"]}16`, display: "grid", placeItems: "center" }}><Ico n={x.i || "star"} c={COL[x.c || "b"]} s={54} /></div>
              <div><div style={{ fontFamily: BN, fontSize: 44, fontWeight: 700, color: K.ink, lineHeight: 1.25 }}>{x.t}</div>
                {x.d && <div style={{ fontFamily: BN, fontSize: 31, color: K.ink2, marginTop: 8, lineHeight: 1.42 }}><Rich t={x.d} /></div>}</div>
            </Card>
          </Pop>
        ))}
      </div>
    </Box>
  );
};

/* ---------- the 7 logo types — our own fictional mini-brands, drawn here ---------- */
const LogoArt: React.FC<{ k: string }> = ({ k }) => {
  const s = { width: 230, height: 150 } as const;
  switch (k) {
    case "wordmark": return <svg {...s} viewBox="0 0 230 150"><text x="115" y="96" textAnchor="middle" fontFamily={EN} fontWeight={700} fontSize="70" fill={K.royal} letterSpacing="-3">nodi</text><circle cx="170" cy="40" r="10" fill={K.caret} /></svg>;
    case "lettermark": return <svg {...s} viewBox="0 0 230 150"><rect x="65" y="25" width="100" height="100" rx="26" fill={K.navy} /><text x="115" y="96" textAnchor="middle" fontFamily={EN} fontWeight={700} fontSize="56" fill="#fff" letterSpacing="-4">KT</text></svg>;
    case "pictorial": return <svg {...s} viewBox="0 0 230 150"><path d="M115 20c40 18 52 60 28 100-14-6-50-26-52-64 0-14 8-26 24-36z" fill={K.green} /><path d="M118 118c-6-30-4-58 4-86" stroke="#fff" strokeWidth="5" fill="none" strokeLinecap="round" /></svg>;
    case "abstract": return <svg {...s} viewBox="0 0 230 150"><circle cx="95" cy="70" r="42" fill={K.pink} opacity=".9" /><circle cx="135" cy="70" r="42" fill={K.royal} opacity=".85" /><rect x="100" y="98" width="30" height="30" rx="6" fill={K.caret} transform="rotate(45 115 113)" /></svg>;
    case "mascot": return <svg {...s} viewBox="0 0 230 150"><path d="M72 58l10-38 28 24M158 58l-10-38-28 24" fill={K.amber} /><circle cx="115" cy="82" r="50" fill={K.amber} /><circle cx="97" cy="76" r="8" fill={K.ink} /><circle cx="133" cy="76" r="8" fill={K.ink} /><circle cx="99" cy="73" r="2.5" fill="#fff" /><circle cx="135" cy="73" r="2.5" fill="#fff" /><path d="M104 98q11 10 22 0" stroke={K.ink} strokeWidth="5" fill="none" strokeLinecap="round" /><circle cx="115" cy="90" r="5" fill={K.caret} /></svg>;
    case "combination": return <svg {...s} viewBox="0 0 230 150"><path d="M30 92c18-34 50-44 74-30-18 2-30 12-36 28 14-8 30-8 40 2-30-2-52 8-78 0z" fill={K.teal} /><text x="112" y="92" fontFamily={EN} fontWeight={700} fontSize="40" fill={K.ink}>pakhi</text></svg>;
    case "emblem": return <svg {...s} viewBox="0 0 230 150"><defs><path id="em" d="M115 75m-50 0a50 50 0 1 1 100 0a50 50 0 1 1 -100 0" /></defs><circle cx="115" cy="75" r="68" fill={K.navy} /><circle cx="115" cy="75" r="62" fill="none" stroke="#F4C430" strokeWidth="2" /><text fontFamily={EN} fontWeight={700} fontSize="15" fill="#F4C430" letterSpacing="3"><textPath href="#em">DHAKA TEA HOUSE · EST 2026 ·</textPath></text><path d="M98 70h34v10a17 17 0 01-34 0zM132 72c10 0 10 12 0 12" fill="#fff" stroke="#fff" strokeWidth="2" /><path d="M108 56c0-6 6-6 6-12M120 56c0-6 6-6 6-12" stroke="#F4C430" strokeWidth="3" fill="none" strokeLinecap="round" /></svg>;
    default: return null;
  }
};
const SLogoTypes: React.FC<P> = (p) => {
  const f = useCurrentFrame();
  const it: { k: string; t: string; d: string; en: string }[] = p.s.items || [];
  const at = (i: number) => v(p, 0.06 + (0.84 * i) / it.length);
  const cur = it.reduce((c, _, i) => (f >= at(i) ? i : c), -1);
  return (
    <Box style={{ top: 105 }}>
      <Head t={p.s.head} kicker={p.s.kicker} size={50} />
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "46px 28px" }}>
        {it.map((x, i) => (
          <Pop key={i} at={at(i)}>
            <Artboard label={`${bn(i + 1)} · ${x.en}`} sel={cur === i} style={{ height: 300 }}>
              <div style={{ height: 185, display: "grid", placeItems: "center", background: cur === i ? "#FFFFFF" : "#FBFBFD" }}><LogoArt k={x.k} /></div>
              <div style={{ padding: "0 22px" }}><div style={{ fontFamily: BN, fontSize: 31, fontWeight: 700, color: K.ink }}>{x.t}</div><div style={{ fontFamily: BN, fontSize: 22, color: K.ink2, lineHeight: 1.35, marginTop: 2 }}>{x.d}</div></div>
            </Artboard>
          </Pop>
        ))}
        <Fade at={v(p, 0.93)}><div style={{ height: 300, borderRadius: 14, border: `2px dashed ${K.line}`, display: "grid", placeItems: "center", textAlign: "center", fontFamily: BN, fontSize: 25, color: K.dim, padding: 24, lineHeight: 1.45 }}>{p.s.foot || "সব লোগো এই ভিডিওর জন্য বানানো কাল্পনিক ব্র্যান্ড"}</div></Fade>
      </div>
    </Box>
  );
};

/* ---------- a good logo works small and in one colour ---------- */
const SSmall: React.FC<P> = (p) => {
  const sizes: number[] = p.s.sizes || [220, 120, 64, 32];
  const src = img(p.s.img);
  const variants = [{ l: "আসল রং", bg: "#fff", fl: "none" }, { l: "এক রঙে (কালো)", bg: "#fff", fl: "brightness(0)" }, { l: "গাঢ় পটভূমিতে সাদা", bg: K.navy, fl: "brightness(0) invert(1)" }];
  return (
    <Box>
      <Head t={p.s.head} kicker={p.s.kicker} />
      <Fade at={v(p, 0.05)}>
        <Card style={{ padding: "30px 40px", display: "flex", alignItems: "flex-end", gap: 60 }}>
          {sizes.map((z, i) => (
            <Pop key={i} at={v(p, 0.08 + i * 0.07)} style={{ textAlign: "center" }}>
              <Img src={src} style={{ height: z, display: "block", margin: "0 auto" }} />
              <div style={{ fontFamily: EN, fontSize: 20, color: K.dim, marginTop: 10, fontWeight: 700 }}>{z}px</div>
            </Pop>
          ))}
          <Fade at={v(p, 0.36)} style={{ marginLeft: "auto", maxWidth: 520, fontFamily: BN, fontSize: 28, color: K.ink2, lineHeight: 1.45, alignSelf: "center" }}><Rich t={p.s.sizeNote || "ছোট হলেও চেনা যায়? তাহলে লোগোটা [g:সফল]।"} /></Fade>
        </Card>
      </Fade>
      <div style={{ display: "flex", gap: 30, marginTop: 34 }}>
        {variants.map((x, i) => (
          <Pop key={i} at={v(p, 0.5 + i * 0.12)} style={{ flex: 1 }}>
            <div style={{ height: 250, borderRadius: 20, background: x.bg, display: "grid", placeItems: "center", boxShadow: "0 14px 40px rgba(11,27,63,.12)", border: `1.5px solid ${K.line}` }}><Img src={src} style={{ height: 170, filter: x.fl }} /></div>
            <div style={{ fontFamily: BN, fontSize: 27, fontWeight: 700, color: K.ink, textAlign: "center", marginTop: 12 }}>{x.l}</div>
          </Pop>
        ))}
      </div>
    </Box>
  );
};

/* ---------- brand stories (company names in text only — no real logos) ---------- */
const IdeaArt: React.FC<{ k: string; c: string }> = ({ k, c }) => {
  if (k === "price") return <svg width="200" height="130" viewBox="0 0 200 130"><path d="M30 30h90l50 35-50 35H30z" fill={c} /><circle cx="52" cy="65" r="8" fill="#fff" /><text x="105" y="78" textAnchor="middle" fontFamily={EN} fontWeight={700} fontSize="34" fill="#fff">$35</text></svg>;
  if (k === "negspace") return <svg width="200" height="130" viewBox="0 0 200 130"><rect x="28" y="20" width="70" height="90" fill={c} /><rect x="102" y="20" width="70" height="90" fill={c} /><path d="M78 45h34l-6-14 30 34-30 34 6-14H78z" fill="#fff" /></svg>;
  if (k === "smile") return <svg width="200" height="130" viewBox="0 0 200 130"><text x="40" y="70" fontFamily={EN} fontWeight={700} fontSize="44" fill={K.ink}>A</text><text x="140" y="70" fontFamily={EN} fontWeight={700} fontSize="44" fill={K.ink}>Z</text><path d="M48 86q60 34 108 0" stroke={c} strokeWidth="9" fill="none" strokeLinecap="round" /><path d="M146 74l14 10-16 8" stroke={c} strokeWidth="8" fill="none" strokeLinecap="round" strokeLinejoin="round" /></svg>;
  if (k === "bite") return <svg width="200" height="130" viewBox="0 0 200 130"><circle cx="100" cy="68" r="46" fill={c} /><circle cx="148" cy="58" r="20" fill="#fff" /><path d="M100 22c4-10 12-14 20-14" stroke={K.green} strokeWidth="6" fill="none" strokeLinecap="round" /></svg>;
  return <div style={{ width: 120, height: 120, borderRadius: 30, background: c }} />;
};
const SBrands: React.FC<P> = (p) => {
  const it: { name: string; meta: string; idea: string; art?: string; sw?: string }[] = p.s.items || [];
  return (
    <Box>
      <Head t={p.s.head} kicker={p.s.kicker} />
      <div style={{ display: "flex", gap: 28 }}>
        {it.map((x, i) => (
          <Pop key={i} at={v(p, 0.06 + (0.8 * i) / it.length)} style={{ flex: 1 }}>
            <Card style={{ padding: "26px 30px 28px", minHeight: 520 }} edge={x.sw || K.royal}>
              <div style={{ height: 150, borderRadius: 16, background: "#F6F7FB", display: "grid", placeItems: "center", marginBottom: 18 }}><IdeaArt k={x.art || "sw"} c={x.sw || K.royal} /></div>
              <div style={{ fontFamily: EN, fontSize: 40, fontWeight: 700, color: K.ink }}>{x.name}</div>
              <div style={{ fontFamily: BN, fontSize: 23, color: K.dim, marginTop: 2 }}>{x.meta}</div>
              <div style={{ fontFamily: BN, fontSize: 28, color: K.ink2, marginTop: 14, lineHeight: 1.45 }}><Rich t={x.idea} /></div>
            </Card>
          </Pop>
        ))}
      </div>
      <Fade at={v(p, 0.9)} style={{ marginTop: 22, fontFamily: BN, fontSize: 21, color: K.dim, textAlign: "center" }}>{p.s.note || "নামগুলো তাদের মালিক কোম্পানির ট্রেডমার্ক। আসল লোগো এখানে দেখানো হয়নি — ছবিগুলো শুধু আইডিয়া বোঝানোর জন্য আমাদের আঁকা।"}</Fade>
    </Box>
  );
};

/* ---------- prompt builder: coloured parts fly in and snap together ---------- */
const SPrompt: React.FC<P> = (p) => {
  const f = useCurrentFrame(); const { fps } = useVideoConfig();
  const parts: { k: string; bn: string; en: string; c: string }[] = p.s.parts || [];
  const at = (i: number) => v(p, 0.07 + (0.66 * i) / parts.length);
  const snap = v(p, 0.8);
  return (
    <Box>
      <Head t={p.s.head} kicker={p.s.kicker} />
      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        {parts.map((x, i) => {
          const k = pop(f, fps, at(i)); const c = COL[x.c] || K.royal;
          return (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: 22, opacity: Math.min(1, k * 1.5), transform: `translateX(${(1 - k) * -120}px)` }}>
              <div style={{ flex: "none", width: 250, fontFamily: BN, fontSize: 30, fontWeight: 700, color: "#fff", background: c, padding: "10px 20px", borderRadius: 14, textAlign: "center" }}>{bn(i + 1)}. {x.k}</div>
              <div style={{ fontFamily: BN, fontSize: 28, color: K.ink2, width: 560, lineHeight: 1.35 }}>{x.bn}</div>
              <div style={{ flex: 1, fontFamily: EN, fontSize: 25, fontWeight: 500, color: c, background: `${c}10`, border: `1.5px dashed ${c}66`, padding: "10px 18px", borderRadius: 12, lineHeight: 1.35 }}>{x.en}</div>
            </div>
          );
        })}
      </div>
      <Fade at={snap} style={{ marginTop: 26 }}>
        <Card style={{ padding: "20px 28px", display: "flex", gap: 18, alignItems: "flex-start" }}>
          <div style={{ flex: "none", fontFamily: BN, fontSize: 24, fontWeight: 700, color: K.caret, paddingTop: 4 }}>পুরো প্রম্পট</div>
          <div style={{ fontFamily: EN, fontSize: 23, lineHeight: 1.5, fontWeight: 500 }}>
            {parts.map((x, i) => <span key={i} style={{ color: COL[x.c] || K.royal, background: `${COL[x.c] || K.royal}12`, borderRadius: 6, padding: "1px 4px", marginRight: 6 }}>{x.en}{i < parts.length - 1 ? "," : ""}</span>)}
          </div>
        </Card>
      </Fade>
    </Box>
  );
};

/* ---------- look-alike AI app window: typed prompt → REAL generated image ---------- */
type Skin = { name: string; url: string; bg: string; side: string; ink: string; dim: string; user: string; input: string; border: string; send: string; mark: React.ReactNode; hello: string; ph: string };
const SKIN: Record<string, Skin> = {
  chat: { name: "চ্যাট এআই", url: "chat-ai.example", bg: "#FFFFFF", side: "#F9F9F9", ink: "#0D0D0D", dim: "#8F8F8F", user: "#F1F1F1", input: "#FFFFFF", border: "#E3E3E3", send: "#0D0D0D", mark: <div style={{ width: 34, height: 34, borderRadius: 10, background: "#0D0D0D" }} />, hello: "What can I help with?", ph: "Ask anything" },
  gem: { name: "জেম এআই", url: "gem-ai.example", bg: "#FFFFFF", side: "#F0F4F9", ink: "#1F1F1F", dim: "#747775", user: "#E9EEF6", input: "#F0F4F9", border: "#E1E5EA", send: "#0B57D0", mark: <div style={{ width: 34, height: 34, borderRadius: 17, background: "linear-gradient(135deg,#4285F4,#9B72CB,#D96570)" }} />, hello: "Hello, what shall we create?", ph: "Describe your image" },
  canva: { name: "ডিজাইন এআই", url: "design-ai.example", bg: "#FFFFFF", side: "#F3F0FF", ink: "#1B1B2F", dim: "#7A7890", user: "#EDE8FF", input: "#FFFFFF", border: "#E2DCF7", send: "#7C3AED", mark: <div style={{ width: 34, height: 34, borderRadius: 17, background: "linear-gradient(135deg,#00C4CC,#7C3AED)" }} />, hello: "What will you design today?", ph: "Describe what you want" },
};
const typed = (text: string, f: number, a: number, b: number) => text.slice(0, Math.round(interpolate(f, [a, b], [0, text.length], clamp)));
const SChat: React.FC<P> = (p) => {
  const f = useCurrentFrame();
  const sk = SKIN[p.s.skin || "chat"]; const q: string = p.s.prompt;
  const tTypeA = v(p, 0.04), tTypeB = v(p, p.s.typeEnd || 0.32), tSend = tTypeB + 8, tGen = tSend + 8, tShow = v(p, p.s.showAt || 0.55);
  const sent = f >= tSend; const showQ = typed(q, f, tTypeA, tTypeB);
  const cx = interpolate(f, [0, 20, tTypeB, tSend - 2], [1600, 900, 900, 1450], { ...clamp, easing: ease });
  const cy = interpolate(f, [0, 20, tTypeB, tSend - 2], [960, 840, 840, 842], { ...clamp, easing: ease });
  const click = f >= tSend - 3 && f < tSend + 5;
  const appear = interpolate(f, [0, 16], [0, 1], { ...clamp, easing: ease });
  const rev = interpolate(f, [tShow, tShow + 30], [0, 1], { ...clamp, easing: ease });
  return (
    <AbsoluteFill>
      <div style={{ position: "absolute", left: 140, top: 110, width: 1640, height: 800, borderRadius: 22, overflow: "hidden", background: sk.bg, boxShadow: "0 40px 110px rgba(11,27,63,.28), 0 0 0 1px rgba(11,27,63,.08)", opacity: appear, transform: `translateY(${(1 - appear) * 40}px)` }}>
        <div style={{ height: 50, background: "#E9EBEF", display: "flex", alignItems: "center", gap: 10, padding: "0 20px" }}>
          {["#FF5F57", "#FEBC2E", "#28C840"].map((c) => <div key={c} style={{ width: 14, height: 14, borderRadius: 7, background: c }} />)}
          <div style={{ marginLeft: 20, width: 460, height: 30, borderRadius: 15, background: "#fff", fontFamily: EN, fontSize: 17, color: "#666", display: "flex", alignItems: "center", padding: "0 16px", fontWeight: 500 }}>{sk.url}</div>
        </div>
        <div style={{ display: "flex", height: 750 }}>
          <div style={{ width: 230, background: sk.side, borderRight: `1px solid ${sk.border}`, padding: 22 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 28 }}>{sk.mark}<span style={{ fontFamily: BN, fontSize: 24, fontWeight: 700, color: sk.ink }}>{sk.name}</span></div>
            {[0.9, 0.7, 0.8, 0.55, 0.75].map((w, i) => <div key={i} style={{ height: 14, width: `${w * 100}%`, borderRadius: 7, background: sk.border, margin: "16px 0" }} />)}
          </div>
          <div style={{ flex: 1, position: "relative", padding: "30px 70px" }}>
            {!sent && <div style={{ position: "absolute", top: 230, left: 0, right: 0, textAlign: "center", fontFamily: EN, fontSize: 38, color: sk.ink, fontWeight: 500 }}>{sk.hello}</div>}
            {sent && <>
              <div style={{ display: "flex", justifyContent: "flex-end" }}><div style={{ maxWidth: 900, background: sk.user, color: sk.ink, borderRadius: 22, padding: "12px 22px", fontFamily: EN, fontSize: 19, lineHeight: 1.45, fontWeight: 500 }}>{q}</div></div>
              <div style={{ marginTop: 22, display: "flex", gap: 16 }}>
                <div style={{ flex: "none" }}>{sk.mark}</div>
                <div style={{ position: "relative", width: p.s.wide ? 640 : p.s.tall ? 322 : 470, height: p.s.wide ? 360 : 470, borderRadius: 18, overflow: "hidden", background: "#EEF0F5" }}>
                  {f >= tGen && <div style={{ position: "absolute", inset: 0, background: `linear-gradient(110deg, #E9ECF3 20%, #F8F9FC ${30 + ((f * 2) % 60)}%, #E9ECF3 80%)` }} />}
                  {f >= tGen && rev < 1 && <div style={{ position: "absolute", left: 22, bottom: 18, fontFamily: BN, fontSize: 24, color: sk.dim }}>ছবি তৈরি হচ্ছে{".".repeat(1 + (Math.floor(f / 8) % 3))}</div>}
                  <Img src={img(p.s.img)} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "contain", background: "#fff", opacity: rev, filter: `blur(${(1 - rev) * 18}px)` }} />
                </div>
              </div>
            </>}
            <div style={{ position: "absolute", left: 70, right: 70, bottom: 30, height: 80, borderRadius: 40, background: sk.input, border: `1.5px solid ${sk.border}`, boxShadow: "0 6px 24px rgba(0,0,0,.06)", display: "flex", alignItems: "center", padding: "0 16px 0 30px" }}>
              <div style={{ flex: 1, fontFamily: EN, fontSize: 21, color: showQ && !sent ? sk.ink : sk.dim, fontWeight: 500, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", direction: showQ && !sent ? "rtl" : "ltr", textAlign: "left" }}>
                {sent ? sk.ph : showQ || sk.ph}{!sent && f >= tTypeA && Math.floor(f / 15) % 2 === 0 && <span style={{ color: sk.ink }}>|</span>}
              </div>
              <div style={{ width: 52, height: 52, borderRadius: 26, background: showQ && !sent ? sk.send : sk.border, display: "grid", placeItems: "center", transform: `scale(${click ? 0.88 : 1})` }}>
                <svg width="24" height="24" viewBox="0 0 24 24"><path d="M12 19V5M5 12l7-7 7 7" stroke="#fff" strokeWidth="2.6" fill="none" strokeLinecap="round" strokeLinejoin="round" /></svg>
              </div>
            </div>
          </div>
        </div>
        <svg width="46" height="46" viewBox="0 0 24 24" style={{ position: "absolute", left: cx - 140, top: cy - 110, filter: "drop-shadow(0 3px 6px rgba(0,0,0,.35))" }}><path d="M4 2l15 9-6.5 1.5L9.5 19z" fill="#111" stroke="#fff" strokeWidth="1.4" strokeLinejoin="round" /></svg>
      </div>
      {p.s.callout && <Fade at={v(p, 0.72)} style={{ position: "absolute", right: 170, top: 330, width: 560 }}><Card style={{ padding: "22px 26px" }} edge={K.caret}><div style={{ fontFamily: BN, fontSize: 28, color: K.ink, lineHeight: 1.45 }}><Rich t={p.s.callout} /></div></Card></Fade>}
      <div style={{ position: "absolute", left: 140, right: 140, top: 922, textAlign: "center", fontFamily: BN, fontSize: 19, color: K.dim }}>বোঝানোর জন্য আঁকা উদাহরণ-উইন্ডো (কোনো আসল অ্যাপ নয়)। ছবিটি আসল — এই প্রম্পট দিয়েই বানানো: {p.s.model}</div>
    </AbsoluteFill>
  );
};

/* ---------- two real results side by side ---------- */
const SCompare: React.FC<P> = (p) => {
  const side = (x: any, i: number) => {
    const good = i === 1; const c = good ? K.green : K.red;
    return (
      <Pop at={v(p, i ? 0.42 : 0.05)} style={{ flex: 1 }}>
        <Card style={{ padding: 24, display: "flex", flexDirection: "column", alignItems: "center", gap: 18, minHeight: 700 }} edge={c}>
          <div style={{ flex: "none", width: 330, height: 330, borderRadius: 14, overflow: "hidden", background: "#fff", border: `1px solid ${K.line}` }}><Img src={img(x.img)} style={{ width: "100%", height: "100%", objectFit: "contain" }} /></div>
          <div style={{ alignSelf: "stretch" }}>
            <Tag t={x.label} c={c} />
            <div style={{ fontFamily: EN, fontSize: 18, color: K.ink2, margin: "12px 0 10px", lineHeight: 1.4, fontWeight: 500 }}>“{x.prompt}”</div>
            {(x.notes || []).map((n: string, j: number) => (
              <Fade key={j} at={v(p, (i ? 0.5 : 0.14) + j * 0.07)} style={{ display: "flex", gap: 10, alignItems: "flex-start", marginTop: 12 }}>
                <div style={{ flex: "none", marginTop: 3 }}><Ico n={n.startsWith("!") ? "bulb" : good ? "check" : "x"} c={n.startsWith("!") ? K.amber : c} s={28} w={2.6} /></div>
                <div style={{ fontFamily: BN, fontSize: 26, color: K.ink, lineHeight: 1.38 }}><Rich t={n.replace(/^!/, "")} /></div>
              </Fade>
            ))}
          </div>
        </Card>
      </Pop>
    );
  };
  return (
    <Box style={{ top: 110 }}>
      <Head t={p.s.head} kicker={p.s.kicker} size={50} />
      <div style={{ display: "flex", gap: 26 }}>{side(p.s.a, 0)}{side(p.s.b, 1)}</div>
    </Box>
  );
};

/* ---------- transparent PNG (before/after slider) + PNG vs SVG zoom ---------- */
const STransparent: React.FC<P> = (p) => {
  const f = useCurrentFrame();
  const sl = interpolate(f, [v(p, 0.08), v(p, 0.36)], [0, 100], { ...clamp, easing: Easing.inOut(Easing.cubic) });
  const z = interpolate(f, [v(p, 0.55), v(p, 0.75)], [1, 4.2], { ...clamp, easing: ease });
  const pane = (label: string, children: React.ReactNode, c: string, sub: string) => (
    <div style={{ flex: 1 }}>
      <div style={{ position: "relative", height: 440, borderRadius: 18, overflow: "hidden", background: "#fff", boxShadow: "0 14px 40px rgba(11,27,63,.12)", border: `1.5px solid ${K.line}` }}>{children}</div>
      <div style={{ marginTop: 12, display: "flex", gap: 12, alignItems: "center" }}><Tag t={label} c={c} /><span style={{ fontFamily: BN, fontSize: 24, color: K.ink2 }}>{sub}</span></div>
    </div>
  );
  const two = f >= v(p, 0.47);
  // zoom towards the leaf (≈ 38% / 18% of the logo): pixels vs vector
  const q = (z - 1) / 3.2;
  const zs = (px: boolean): React.CSSProperties => ({ position: "absolute", left: "50%", top: "50%", width: 300 * z, transform: `translate(${-50 + 12 * q}%, ${-50 + 32 * q}%)`, ...(px ? { imageRendering: "pixelated" } : {}) });
  return (
    <Box>
      <Head t={two ? p.s.head2 : p.s.head} kicker={p.s.kicker} />
      {!two ? (
        <div style={{ display: "flex", gap: 40 }}>
          <div style={{ position: "relative", width: 900, height: 560, borderRadius: 20, overflow: "hidden", boxShadow: "0 18px 50px rgba(11,27,63,.14)" }}>
            <div style={{ position: "absolute", inset: 0, background: "#fff" }} />
            <div style={{ position: "absolute", inset: 0, clipPath: `inset(0 ${100 - sl}% 0 0)` }}><Checker /></div>
            <Img src={img(p.s.img)} style={{ position: "absolute", left: "50%", top: "50%", height: 420, transform: "translate(-50%,-50%)" }} />
            <div style={{ position: "absolute", top: 0, bottom: 0, left: `${sl}%`, width: 4, background: K.sel }}><div style={{ position: "absolute", top: "50%", left: -22, width: 48, height: 48, marginTop: -24, borderRadius: 24, background: "#fff", border: `3px solid ${K.sel}`, display: "grid", placeItems: "center", fontFamily: EN, fontWeight: 700, color: K.sel, fontSize: 20 }}>⇆</div></div>
            <div style={{ position: "absolute", left: 18, top: 16 }}><Tag t="ট্রান্সপারেন্ট" c={K.green} /></div>
            <div style={{ position: "absolute", right: 18, top: 16 }}><Tag t="সাদা পটভূমি" c={K.dim} /></div>
          </div>
          <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 16 }}>
            {(p.s.steps || []).map((x: string, i: number) => (
              <Fade key={i} at={v(p, 0.1 + i * 0.08)}><Card style={{ padding: "16px 22px", display: "flex", gap: 14 }}><div style={{ flex: "none", width: 40, height: 40, borderRadius: 20, background: K.royal, color: "#fff", fontFamily: BN, fontSize: 24, fontWeight: 700, display: "grid", placeItems: "center" }}>{bn(i + 1)}</div><div style={{ fontFamily: BN, fontSize: 26, color: K.ink, lineHeight: 1.4 }}><Rich t={x} /></div></Card></Fade>
            ))}
          </div>
        </div>
      ) : (
        <div style={{ display: "flex", gap: 40 }}>
          {pane("PNG / JPG", <Img src={img(p.s.small)} style={zs(true)} />, K.red, "ছবি = বিন্দু (পিক্সেল) দিয়ে তৈরি, বড় করলে ঝাপসা")}
          {pane("SVG (ভেক্টর)", <Img src={img(p.s.svg)} style={zs(false)} />, K.green, "অঙ্ক দিয়ে আঁকা, যত বড়ই করুন ঝকঝকে")}
        </div>
      )}
      {two && <Fade at={v(p, 0.8)} style={{ marginTop: 18, fontFamily: BN, fontSize: 25, color: K.ink2, textAlign: "center" }}><Rich t={p.s.foot || ""} /></Fade>}
    </Box>
  );
};

/* ---------- platform size frames ---------- */
const SSizes: React.FC<P> = (p) => {
  const fr: { w: number; h: number; l: string }[] = p.s.boards || [];
  const k = 0.3;
  return (
    <Box>
      <Head t={p.s.head} kicker={p.s.kicker} />
      <div style={{ display: "flex", gap: 60, alignItems: "flex-end", marginTop: 40 }}>
        {fr.map((x, i) => (
          <Pop key={i} at={v(p, 0.1 + (0.6 * i) / fr.length)}>
            <Artboard label={`${x.w} × ${x.h}`} sel style={{ width: x.w * k * (x.h > 1500 ? 0.85 : 1), height: x.h * k * (x.h > 1500 ? 0.85 : 1) }}>
              <div style={{ position: "absolute", inset: 0, background: `linear-gradient(160deg, #FFF4E0, #FDE3C7)` }} />
              {p.s.img && <Img src={img(p.s.img)} style={{ position: "absolute", left: "50%", top: "42%", height: Math.min(x.w, x.h) * k * 0.5, transform: "translate(-50%,-50%)" }} />}
              <div style={{ position: "absolute", left: 0, right: 0, bottom: 14, textAlign: "center", fontFamily: EN, fontSize: 22, fontWeight: 700, color: "#3B2A20" }}>{p.s.brand || ""}</div>
            </Artboard>
            <div style={{ fontFamily: BN, fontSize: 27, fontWeight: 700, color: K.ink, marginTop: 14, maxWidth: x.w * k + 60 }}>{x.l}</div>
          </Pop>
        ))}
      </div>
    </Box>
  );
};

/* ---------- colour wheel + harmonies ---------- */
const SWheel: React.FC<P> = (p) => {
  const f = useCurrentFrame(); const { fps } = useVideoConfig();
  const sch: { n: string; d: string; idx: number[] }[] = p.s.schemes || [];
  const at = (i: number) => v(p, 0.28 + (0.62 * i) / Math.max(1, sch.length));
  const cur = sch.reduce((c, _, i) => (f >= at(i) ? i : c), -1);
  const R = 300, cx = 340, cy = 340;
  const rot = interpolate(f, [0, 40], [-90, 0], { ...clamp, easing: ease });
  const seg = (i: number) => { const a0 = ((i * 30 - 15 - 90) * Math.PI) / 180, a1 = ((i * 30 + 15 - 90) * Math.PI) / 180, r0 = 130;
    return `M${cx + r0 * Math.cos(a0)} ${cy + r0 * Math.sin(a0)}L${cx + R * Math.cos(a0)} ${cy + R * Math.sin(a0)}A${R} ${R} 0 0 1 ${cx + R * Math.cos(a1)} ${cy + R * Math.sin(a1)}L${cx + r0 * Math.cos(a1)} ${cy + r0 * Math.sin(a1)}A${r0} ${r0} 0 0 0 ${cx + r0 * Math.cos(a0)} ${cy + r0 * Math.sin(a0)}z`; };
  const on = cur >= 0 ? sch[cur].idx : [];
  const pt = (i: number, r = 215) => [cx + r * Math.cos(((i * 30 - 90) * Math.PI) / 180), cy + r * Math.sin(((i * 30 - 90) * Math.PI) / 180)];
  return (
    <Box style={{ flexDirection: "row", gap: 70, alignItems: "center", top: 100 }}>
      <svg width="680" height="680" viewBox="0 0 680 680" style={{ flex: "none", transform: `rotate(${rot}deg)` }}>
        {Array.from({ length: 12 }, (_, i) => { const k = pop(f, fps, 4 + i * 2); const lit = !on.length || on.includes(i);
          return <path key={i} d={seg(i)} fill={hsl(i * 30)} opacity={k * (lit ? 1 : 0.18)} stroke="#fff" strokeWidth="4" style={{ transformOrigin: `${cx}px ${cy}px`, transform: `scale(${(0.7 + 0.3 * k) * (on.includes(i) ? 1.05 : 1)})` }} />; })}
        {on.length > 1 && <polygon points={on.map((i) => pt(i).join(",")).join(" ")} fill="none" stroke={K.ink} strokeWidth="5" strokeLinejoin="round" opacity={interpolate(f, [at(cur), at(cur) + 10], [0, 1], clamp)} />}
        {on.map((i) => { const [x, y] = pt(i); return <circle key={i} cx={x} cy={y} r="16" fill="#fff" stroke={K.ink} strokeWidth="5" />; })}
        <circle cx={cx} cy={cy} r="118" fill="#fff" />
      </svg>
      <div style={{ flex: 1 }}>
        <Head t={p.s.head} kicker={p.s.kicker} size={52} />
        {sch.map((x, i) => (
          <Fade key={i} at={at(i)} style={{ marginBottom: 16 }}>
            <Card style={{ padding: "18px 24px", display: "flex", gap: 18, alignItems: "center", outline: cur === i ? `3px solid ${K.sel}` : "none" }}>
              <div style={{ display: "flex", gap: 6 }}>{x.idx.map((j) => <div key={j} style={{ width: 44, height: 44, borderRadius: 12, background: hsl(j * 30) }} />)}</div>
              <div><div style={{ fontFamily: BN, fontSize: 32, fontWeight: 700, color: K.ink }}>{x.n}</div><div style={{ fontFamily: BN, fontSize: 24, color: K.ink2, lineHeight: 1.35 }}>{x.d}</div></div>
            </Card>
          </Fade>
        ))}
      </div>
    </Box>
  );
};

/* ---------- colour psychology ---------- */
const SPsych: React.FC<P> = (p) => {
  const it: { hex: string; n: string; d: string }[] = p.s.items || [];
  return (
    <Box>
      <Head t={p.s.head} kicker={p.s.kicker} />
      <div style={{ display: "grid", gridTemplateColumns: `repeat(${it.length > 6 ? 4 : 3}, 1fr)`, gap: 22 }}>
        {it.map((x, i) => (
          <Pop key={i} at={v(p, 0.06 + (0.72 * i) / it.length)}>
            <div style={{ borderRadius: 22, overflow: "hidden", boxShadow: "0 14px 40px rgba(11,27,63,.12)", background: "#fff" }}>
              <div style={{ height: 110, background: x.hex, display: "flex", alignItems: "flex-end", padding: "0 18px 10px" }}><span style={{ fontFamily: EN, fontSize: 19, fontWeight: 700, color: lum(x.hex) > 0.4 ? "#111" : "#fff", opacity: 0.85 }}>{x.hex}</span></div>
              <div style={{ padding: "14px 20px 18px" }}><div style={{ fontFamily: BN, fontSize: 32, fontWeight: 700, color: K.ink }}>{x.n}</div><div style={{ fontFamily: BN, fontSize: 24, color: K.ink2, lineHeight: 1.35 }}>{x.d}</div></div>
            </div>
          </Pop>
        ))}
      </div>
      {p.s.warn && <Fade at={v(p, 0.84)} style={{ marginTop: 24 }}><Card style={{ padding: "16px 24px", display: "flex", gap: 14, alignItems: "center", background: "#FFF6E5" }}><Ico n="bulb" c={K.amber} s={36} /><div style={{ fontFamily: BN, fontSize: 27, color: K.ink, lineHeight: 1.4 }}><Rich t={p.s.warn} /></div></Card></Fade>}
    </Box>
  );
};

/* ---------- HEX code anatomy ---------- */
const SHex: React.FC<P> = (p) => {
  const f = useCurrentFrame();
  const hex: string = p.s.hex || "#F28C28"; const [r, g, b] = rgb(hex); const pairs = [hex.slice(1, 3), hex.slice(3, 5), hex.slice(5, 7)];
  const ch = [{ n: "লাল (R)", v: r, c: "#E5484D" }, { n: "সবুজ (G)", v: g, c: "#12A06B" }, { n: "নীল (B)", v: b, c: "#0050ED" }];
  return (
    <Box>
      <Head t={p.s.head} kicker={p.s.kicker} />
      <div style={{ display: "flex", gap: 60, alignItems: "center" }}>
        <Pop at={v(p, 0.05)}><div style={{ width: 380, height: 380, borderRadius: 40, background: hex, boxShadow: "0 24px 60px rgba(11,27,63,.2)", display: "flex", alignItems: "flex-end", padding: 26 }}><span style={{ fontFamily: EN, fontSize: 44, fontWeight: 700, color: "#fff" }}>{hex}</span></div></Pop>
        <div style={{ flex: 1 }}>
          <Fade at={v(p, 0.14)} style={{ display: "flex", gap: 8, fontFamily: EN, fontSize: 92, fontWeight: 700, color: K.ink, marginBottom: 26 }}>
            <span style={{ color: K.dim }}>#</span>{pairs.map((x, i) => <span key={i} style={{ color: ch[i].c, background: `${ch[i].c}12`, borderRadius: 14, padding: "0 12px" }}>{x}</span>)}
          </Fade>
          {ch.map((x, i) => { const w = interpolate(f, [v(p, 0.3 + i * 0.12), v(p, 0.42 + i * 0.12)], [0, x.v / 255], { ...clamp, easing: ease });
            return (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 20, marginBottom: 18, opacity: f >= v(p, 0.28 + i * 0.12) ? 1 : 0.15 }}>
                <div style={{ width: 170, fontFamily: BN, fontSize: 30, fontWeight: 700, color: x.c }}>{x.n}</div>
                <div style={{ flex: 1, height: 40, borderRadius: 20, background: "#E8EAF1", overflow: "hidden" }}><div style={{ width: `${w * 100}%`, height: "100%", background: x.c, borderRadius: 20 }} /></div>
                <div style={{ width: 210, fontFamily: EN, fontSize: 30, fontWeight: 700, color: K.ink }}>{pairs[i]} = {Math.round(w * 255)}<span style={{ color: K.dim, fontSize: 22 }}> /255</span></div>
              </div>
            ); })}
          <Fade at={v(p, 0.78)} style={{ fontFamily: BN, fontSize: 28, color: K.ink2, lineHeight: 1.45, marginTop: 10 }}><Rich t={p.s.foot || ""} /></Fade>
        </div>
      </div>
    </Box>
  );
};

/* ---------- palette 60-30-10 applied to a real AI poster ---------- */
const SPalette: React.FC<P> = (p) => {
  const f = useCurrentFrame(); const { fps } = useVideoConfig();
  const cs: { hex: string; role: string; pct?: number }[] = p.s.colors || [];
  const bar = interpolate(f, [v(p, 0.32), v(p, 0.5)], [0, 1], { ...clamp, easing: ease });
  const showPoster = v(p, 0.55);
  return (
    <Box style={{ flexDirection: "row", gap: 60 }}>
      <div style={{ flex: 1 }}>
        <Head t={p.s.head} kicker={p.s.kicker} size={52} />
        <div style={{ display: "flex", gap: 16, marginBottom: 30 }}>
          {cs.map((x, i) => { const k = pop(f, fps, v(p, 0.06 + i * 0.06));
            return <div key={i} style={{ flex: 1, transform: `translateY(${(1 - k) * 60}px)`, opacity: Math.min(1, k * 1.4) }}>
              <div style={{ height: 150, borderRadius: 18, background: x.hex, boxShadow: "0 12px 30px rgba(11,27,63,.15)", border: `1px solid ${K.line}` }} />
              <div style={{ fontFamily: EN, fontSize: 22, fontWeight: 700, color: K.ink, marginTop: 10 }}>{x.hex}</div>
              <div style={{ fontFamily: BN, fontSize: 23, color: K.ink2, lineHeight: 1.3 }}>{x.role}</div>
            </div>; })}
        </div>
        <Fade at={v(p, 0.3)}>
          <div style={{ fontFamily: BN, fontSize: 28, fontWeight: 700, color: K.ink, marginBottom: 10 }}>{p.s.ruleHead || "৬০-৩০-১০ নিয়ম"}</div>
          <div style={{ display: "flex", height: 70, borderRadius: 16, overflow: "hidden", width: `${bar * 100}%`, boxShadow: "0 10px 24px rgba(11,27,63,.12)" }}>
            {cs.filter((x) => x.pct).map((x, i) => <div key={i} style={{ flex: x.pct, background: x.hex, display: "grid", placeItems: "center", fontFamily: EN, fontWeight: 700, fontSize: 26, color: lum(x.hex) > 0.4 ? "#3B2A20" : "#fff" }}>{x.pct}%</div>)}
          </div>
        </Fade>
        <Fade at={v(p, 0.82)} style={{ marginTop: 24, fontFamily: BN, fontSize: 26, color: K.ink2, lineHeight: 1.45 }}><Rich t={p.s.foot || ""} /></Fade>
      </div>
      {p.s.img && <Pop at={showPoster} style={{ flex: "none" }}>
        <Artboard label="পোস্টার · ১০৮০ × ১৫৮০" sel style={{ width: 470, height: 690 }}>
          <Img src={img(p.s.img)} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }} />
          <Fade at={showPoster + 20} style={{ position: "absolute", left: 34, right: 34, top: 50 }}>
            <div style={{ fontFamily: EN, fontSize: 26, fontWeight: 700, color: p.s.brandColor || "#1F6B4F", letterSpacing: 3 }}>{p.s.brand}</div>
            <div style={{ fontFamily: BN, fontSize: 52, fontWeight: 800, color: p.s.headColor || "#3B2A20", lineHeight: 1.12, marginTop: 6 }}>{p.s.headline}</div>
            <div style={{ display: "inline-block", marginTop: 16, fontFamily: BN, fontSize: 24, fontWeight: 700, color: "#fff", background: p.s.ctaColor || "#1F6B4F", padding: "6px 18px", borderRadius: 10 }}>{p.s.cta}</div>
          </Fade>
        </Artboard>
        <div style={{ fontFamily: BN, fontSize: 19, color: K.dim, marginTop: 10, maxWidth: 470 }}>{p.s.posterNote || "ছবি: এআই দিয়ে বানানো (আসল ফল) · লেখা আমরা পরে বসিয়েছি"}</div>
      </Pop>}
    </Box>
  );
};

/* ---------- contrast: real WCAG ratios ---------- */
const SContrast: React.FC<P> = (p) => {
  const pr: { fg: string; bg: string; t: string }[] = p.s.pairs || [];
  return (
    <Box>
      <Head t={p.s.head} kicker={p.s.kicker} />
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>
        {pr.map((x, i) => { const r = ratio(x.fg, x.bg); const ok = r >= 4.5;
          return (
            <Pop key={i} at={v(p, 0.08 + (0.6 * i) / pr.length)}>
              <div style={{ display: "flex", borderRadius: 20, overflow: "hidden", boxShadow: "0 14px 40px rgba(11,27,63,.12)", background: "#fff" }}>
                <div style={{ flex: 1, background: x.bg, padding: "30px 30px", fontFamily: BN, fontSize: 40, fontWeight: 700, color: x.fg, lineHeight: 1.25 }}>{x.t}<div style={{ fontFamily: EN, fontSize: 17, fontWeight: 700, marginTop: 8, opacity: 0.9 }}>{x.fg} on {x.bg}</div></div>
                <div style={{ width: 220, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 6, background: ok ? "#E6F7EF" : "#FDECEC" }}>
                  <div style={{ fontFamily: EN, fontSize: 40, fontWeight: 700, color: ok ? K.green : K.red }}>{r.toFixed(1)}:1</div>
                  <div style={{ display: "flex", alignItems: "center", gap: 6, fontFamily: BN, fontSize: 26, fontWeight: 700, color: ok ? K.green : K.red }}><Ico n={ok ? "check" : "x"} c={ok ? K.green : K.red} s={28} w={3} />{ok ? "পড়া যায়" : "কষ্ট হয়"}</div>
                </div>
              </div>
            </Pop>
          ); })}
      </div>
      <Fade at={v(p, 0.8)} style={{ marginTop: 22, fontFamily: BN, fontSize: 26, color: K.ink2, lineHeight: 1.45 }}><Rich t={p.s.foot || "নিয়ম (WCAG): সাধারণ লেখায় অন্তত [g:৪.৫:১] কনট্রাস্ট। সংখ্যাগুলো আসল সূত্রে হিসাব করা।"} /></Fade>
    </Box>
  );
};

/* ---------- design post-mortem of a public-domain poster ---------- */
const SPost: React.FC<P> = (p) => {
  const f = useCurrentFrame();
  const mk: { x: number; y: number; t: string; d: string; c?: string }[] = p.s.marks || [];
  const at = (i: number) => v(p, 0.08 + (0.66 * i) / Math.max(1, mk.length));
  const cur = mk.reduce((c, _, i) => (f >= at(i) ? i : c), -1);
  const H = 790, W = Math.round(H * (p.s.aspect || 0.78));
  const zoomOn = cur >= 0 && f < v(p, 0.76);
  const tgt = zoomOn ? mk[cur] : { x: 50, y: 50 };
  const zk = interpolate(f, [cur >= 0 ? at(cur) : 0, (cur >= 0 ? at(cur) : 0) + 18], [0, 1], { ...clamp, easing: ease });
  const sc = zoomOn ? 1 + 0.35 * zk : 1;
  const pal: string[] = p.s.palette || [];
  return (
    <AbsoluteFill>
      <div style={{ position: "absolute", left: 120, top: 115, width: W, height: H }}>
        <div style={{ position: "absolute", inset: 0, borderRadius: 8, overflow: "hidden", boxShadow: "0 30px 80px rgba(11,27,63,.25)" }}>
          <div style={{ position: "absolute", inset: 0, transform: `scale(${sc})`, transformOrigin: `${tgt.x}% ${tgt.y}%` }}>
            <Img src={img(p.s.img)} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            {mk.map((m, i) => f >= at(i) && (
              <div key={i} style={{ position: "absolute", left: `${m.x}%`, top: `${m.y}%`, transform: `translate(-50%,-50%) scale(${(i === cur ? 1.15 : 0.85) / sc})`, width: 54, height: 54, borderRadius: 27, background: i === cur ? K.caret : "rgba(11,27,63,.85)", color: "#fff", border: "3px solid #fff", display: "grid", placeItems: "center", fontFamily: BN, fontWeight: 700, fontSize: 28, boxShadow: "0 6px 18px rgba(0,0,0,.4)" }}>{bn(i + 1)}</div>
            ))}
          </div>
        </div>
        <div style={{ position: "absolute", top: H + 10, left: 0, width: W + 200, fontFamily: BN, fontSize: 18, color: K.dim, lineHeight: 1.35 }}>{p.s.credit}</div>
      </div>
      <div style={{ position: "absolute", left: 120 + W + 60, right: 110, top: 105 }}>
        <Head t={p.s.head} kicker={p.s.kicker} size={46} />
        {mk.map((m, i) => (
          <div key={i} style={{ display: f >= at(i) ? "flex" : "none", gap: 14, alignItems: "flex-start", marginBottom: 10, opacity: i === cur ? 1 : 0.5 }}>
            <div style={{ flex: "none", width: 40, height: 40, borderRadius: 20, background: i === cur ? K.caret : K.ink, color: "#fff", fontFamily: BN, fontWeight: 700, fontSize: 22, display: "grid", placeItems: "center" }}>{bn(i + 1)}</div>
            <div><span style={{ fontFamily: BN, fontSize: 28, fontWeight: 700, color: K.ink }}>{m.t}</span>{i === cur && <div style={{ fontFamily: BN, fontSize: 24, color: K.ink2, lineHeight: 1.38 }}><Rich t={m.d} /></div>}</div>
          </div>
        ))}
        {pal.length > 0 && <Fade at={v(p, 0.78)} style={{ marginTop: 14 }}>
          <div style={{ fontFamily: BN, fontSize: 25, fontWeight: 700, color: K.ink, marginBottom: 8 }}>{p.s.palHead || "পোস্টার থেকে মাপা রং"}</div>
          <div style={{ display: "flex", gap: 10 }}>{pal.map((c, i) => <div key={i} style={{ flex: 1 }}><div style={{ height: 66, borderRadius: 12, background: c, border: `1px solid ${K.line}` }} /><div style={{ fontFamily: EN, fontSize: 16, fontWeight: 700, color: K.ink2, marginTop: 4 }}>{c}</div></div>)}</div>
        </Fade>}
      </div>
    </AbsoluteFill>
  );
};

/* ---------- note / mission / recap / outro ---------- */
const SNote: React.FC<P> = (p) => {
  const c = COL[p.s.tone || "y"] || K.amber;
  return (
    <Box style={{ justifyContent: "center", alignItems: "center" }}>
      <Pop at={4} style={{ width: 1380 }}>
        <Card style={{ padding: "44px 56px" }} edge={c}>
          <div style={{ display: "flex", gap: 22, alignItems: "center", marginBottom: 20 }}><div style={{ width: 80, height: 80, borderRadius: 22, background: `${c}18`, display: "grid", placeItems: "center" }}><Ico n={p.s.icon || "shield"} c={c} s={46} /></div><div style={{ fontFamily: BN, fontSize: 50, fontWeight: 700, color: K.ink }}><Rich t={p.s.head} /></div></div>
          {(p.s.lines || []).map((x: string, i: number) => (
            <Fade key={i} at={v(p, 0.1 + (0.7 * i) / p.s.lines.length)} style={{ display: "flex", gap: 14, marginTop: 14 }}><div style={{ flex: "none", width: 12, height: 12, borderRadius: 6, background: c, marginTop: 16 }} /><div style={{ fontFamily: BN, fontSize: 31, color: K.ink2, lineHeight: 1.45 }}><Rich t={x} /></div></Fade>
          ))}
        </Card>
      </Pop>
    </Box>
  );
};
const SMission: React.FC<P> = (p) => (
  <Box>
    <Head t={p.s.head} kicker={p.s.kicker || "আপনার মিশন"} />
    <div style={{ display: "flex", gap: 24 }}>
      {(p.s.steps || []).map((x: string, i: number) => (
        <Pop key={i} at={v(p, 0.08 + i * 0.16)} style={{ flex: 1 }}>
          <Card style={{ padding: "28px 28px", minHeight: 330 }} edge={[K.royal, K.caret, K.pink, K.green][i % 4]}>
            <div style={{ fontFamily: EN, fontSize: 64, fontWeight: 700, color: [K.royal, K.caret, K.pink, K.green][i % 4], lineHeight: 1 }}>{i + 1}</div>
            <div style={{ fontFamily: BN, fontSize: 30, color: K.ink, marginTop: 14, lineHeight: 1.42 }}><Rich t={x} /></div>
          </Card>
        </Pop>
      ))}
    </div>
    {p.s.foot && <Fade at={v(p, 0.8)} style={{ marginTop: 26, fontFamily: BN, fontSize: 27, color: K.ink2 }}><Rich t={p.s.foot} /></Fade>}
  </Box>
);
const SRecap: React.FC<P> = (p) => (
  <Box style={{ justifyContent: "center" }}>
    <Head t={p.s.head || "এক নজরে"} />
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
      {(p.s.items || []).map((x: string, i: number) => (
        <Fade key={i} at={v(p, 0.06 + (0.75 * i) / p.s.items.length)} x={-30} y={0}>
          <Card style={{ padding: "20px 26px", display: "flex", gap: 16, alignItems: "center" }}><div style={{ flex: "none", width: 46, height: 46, borderRadius: 14, background: hsl(i * 55 + 210, 75, 55), display: "grid", placeItems: "center" }}><Ico n="check" c="#fff" s={30} w={3} /></div><div style={{ fontFamily: BN, fontSize: 30, color: K.ink, lineHeight: 1.35 }}><Rich t={x} /></div></Card>
        </Fade>
      ))}
    </div>
  </Box>
);
const SOutro: React.FC<P> = (p) => (
  <Box style={{ justifyContent: "center", alignItems: "center", textAlign: "center" }}>
    <Pop at={4}><Img src={img("_brand/aiu-logo-dark.svg")} style={{ height: 96 }} /></Pop>
    <Fade at={16}><div style={{ fontFamily: BN, fontSize: 30, color: "rgba(230,236,255,.7)", marginTop: 40 }}>পরের পাঠ</div><div style={{ fontFamily: BN, fontSize: 60, fontWeight: 700, color: "#fff", marginTop: 8 }}>{p.spec.next}</div></Fade>
    <Fade at={34}><div style={{ fontFamily: BN, fontSize: 30, color: "rgba(230,236,255,.7)", marginTop: 44, maxWidth: 1300, lineHeight: 1.5 }}>{p.s.note || "আগে নিয়ম বুঝুন, তারপর এআই-কে কাজ বুঝিয়ে দিন।"}<br /><span style={{ color: "#fff", fontWeight: 700 }}>aiuniversitybd.com</span></div></Fade>
  </Box>
);

const MAP: Record<string, React.FC<any>> = {
  title: STitle, points: SPoints, logotypes: SLogoTypes, small: SSmall, brands: SBrands, prompt: SPrompt, chat: SChat, compare: SCompare,
  transparent: STransparent, sizes: SSizes, wheel: SWheel, psych: SPsych, hex: SHex, palette: SPalette, contrast: SContrast, postmortem: SPost,
  note: SNote, mission: SMission, recap: SRecap, outro: SOutro,
};
const DARK = new Set(["title", "outro"]);

/* ---------- chrome, subtitles, audio ---------- */
const Chrome: React.FC<{ spec: Spec; total: number; dark: boolean }> = ({ spec, total, dark }) => {
  const f = useCurrentFrame();
  const ink = dark ? "#fff" : K.ink, dim = dark ? "rgba(230,236,255,.6)" : K.dim;
  return (
    <>
      <div style={{ position: "absolute", left: 0, top: 0, height: 5, width: `${(f / total) * 100}%`, background: `linear-gradient(90deg, ${K.royal}, ${K.pink}, ${K.caret})` }} />
      <div style={{ position: "absolute", left: 60, top: 38, display: "flex", alignItems: "center", gap: 16 }}>
        <Img src={img(`_brand/aiu-logo-${dark ? "dark" : "ink"}.svg`)} style={{ height: 34 }} />
        <div style={{ width: 2, height: 28, background: dark ? "rgba(255,255,255,.2)" : K.line }} />
        <div style={{ fontFamily: BN, fontSize: 25, color: ink, fontWeight: 700 }}>{spec.course}</div>
        <div style={{ fontFamily: BN, fontSize: 23, color: dim }}>· {spec.lessonNo}</div>
      </div>
      <div style={{ position: "absolute", right: 60, top: 46, fontFamily: BN, fontSize: 20, color: dim }}>এআই শিক্ষক · এআই কণ্ঠ</div>
    </>
  );
};
const subChunks = (spec: Spec, starts: number[]) => spec.scenes.flatMap((s, i) => {
  const parts = (s.sv || s.vo).split(/(?<=[।?!,—])\s+/).reduce<string[]>((a: string[], x: string) => { if (a.length && (a[a.length - 1].length < 26 || x.length < 10)) a[a.length - 1] += " " + x; else a.push(x); return a; }, []);
  const total = parts.reduce((n: number, x: string) => n + x.length, 0); let acc = 0; const b = starts[i] + LEAD;
  return parts.map((x: string) => { const from = b + (s.frames * acc) / total; acc += x.length; return { s: x, from, to: b + (s.frames * acc) / total }; });
});
const SceneFade: React.FC<{ len: number; children: React.ReactNode }> = ({ len, children }) => {
  const f = useCurrentFrame();
  const o = Math.min(interpolate(f, [0, 12], [0, 1], clamp), interpolate(f, [len - 12, len], [1, 0], clamp));
  return <AbsoluteFill style={{ opacity: o, transform: `scale(${0.985 + 0.015 * o})` }}>{children}</AbsoluteFill>;
};

export const DesignVideo: React.FC<{ spec: Spec }> = ({ spec }) => {
  const f = useCurrentFrame();
  const lens = spec.scenes.map(sceneLen);
  const starts = lens.reduce<number[]>((a, _, i) => [...a, i ? a[i - 1] + lens[i - 1] : 15], []);
  const chunks = subChunks(spec, starts);
  const cur = chunks.find((x) => f >= x.from && f < x.to + 4);
  const total = gdLen(spec);
  const busy = (fr: number) => spec.scenes.some((s, i) => fr >= starts[i] + LEAD - 6 && fr <= starts[i] + LEAD + s.frames + 4);
  const si = Math.max(0, starts.filter((s) => f >= s).length - 1); const dark = DARK.has(spec.scenes[si]?.type);
  const dk = (i: number) => DARK.has(spec.scenes[i]?.type);
  return (
    <AbsoluteFill style={{ background: K.canvas }}>
      <Background />
      {spec.scenes.map((s, i) => {
        const S = MAP[s.type]; const len = lens[i];
        return (
          <Sequence key={i} from={starts[i]} durationInFrames={len}>
            {dk(i) && <SceneFade len={len}><Background dark /></SceneFade>}
            <SceneFade len={len}><S s={s} spec={spec} vo={s.frames} /></SceneFade>
            <Sequence from={LEAD}><Audio src={staticFile(`gdesign/${spec.id}/vo/${String(i + 1).padStart(2, "0")}.mp3`)} /></Sequence>
            <Sequence from={0}><Audio src={staticFile(`aiu2/${i === 0 ? "swell" : s.type === "outro" ? "chime" : "whoosh"}.mp3`)} volume={0.18} /></Sequence>
            {s.type === "chat" && <Sequence from={Math.round(v({ s, spec, vo: s.frames }, s.showAt || 0.55))}><Audio src={staticFile("aiu2/pop.mp3")} volume={0.3} /></Sequence>}
          </Sequence>
        );
      })}
      <Chrome spec={spec} total={total} dark={dark} />
      {cur && <div style={{ position: "absolute", left: 0, right: 0, bottom: 46, display: "flex", justifyContent: "center", opacity: interpolate(f, [cur.from, cur.from + 5, cur.to, cur.to + 4], [0, 1, 1, 0], clamp) }}><div style={{ maxWidth: 1500, padding: "8px 26px 12px", borderRadius: 14, background: "rgba(1,24,53,.86)", fontFamily: BN, fontSize: 33, fontWeight: 500, color: "#fff", textAlign: "center", lineHeight: 1.35 }}>{cur.s.replace(/[।,]$/, "")}</div></div>}
      <Audio src={staticFile("aiu2/music.mp3")} volume={(fr) => (busy(fr) ? 0.04 : 0.12) * interpolate(fr, [0, 30, total - 60, total], [0, 1, 1, 0], clamp)} />
    </AbsoluteFill>
  );
};
