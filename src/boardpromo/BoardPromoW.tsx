// 16:9 board film for the website (home "কীভাবে আমাদের কোর্স তৈরি হয়") in the NEW brand (2026-11-15):
// "aiu|" caret logo, ink canvas, Anek Bangla (wdth 115) headlines, signal orange ONLY for the caret / progress / "now".
// Same voice + timing as the reel (public/boardpromo/board-reel/props.json). No prices. Board members are AI and labelled এআই.
// Lesson clips (Japanese lesson 01) still carry the old logo in their top bar → Clip crops that strip off.
import React from "react";
import { AbsoluteFill, Audio, Img, OffthreadVideo, Sequence, interpolate, staticFile, useCurrentFrame, useVideoConfig, Easing, random, delayRender, continueRender } from "remotion";
import { Globe, FileText, Check, Gavel } from "lucide-react";
import { clamp, bn, sp, P, MEMBERS, SOURCES, STEPS, CHECKS, Spec, Scene, promoLen } from "./BoardPromo";

const K = { bg: "#0D0E12", bg2: "#14151B", surf: "#1A1B22", surf2: "#22232B", line: "#2A2C35", line2: "#363844", txt: "#F3F3F0", mut: "#A3A6B2", dim: "#6B6E7A", sig: "#FF6A33", ink: "#14151B" };
const BN = "AnekW", EN = "Montserrat";
if (typeof document !== "undefined") {
  const h = delayRender("font AnekW");
  const f = new FontFace("AnekW", `url(${staticFile("fonts/AnekBangla.ttf")})`, { weight: "100 800", stretch: "75% 125%" });
  f.load().then(() => { document.fonts.add(f); continueRender(h); }).catch(() => continueRender(h));
}
const H: React.CSSProperties = { fontFamily: BN, fontStretch: "115%", fontWeight: 700, color: K.txt, lineHeight: 1.2 };
type SP = { s: Scene };

/* ---------- primitives ---------- */
const Caret: React.FC<{ h: number; w?: number; blink?: boolean }> = ({ h, w, blink = true }) => {
  const f = useCurrentFrame(); const on = !blink || Math.floor(f / 16) % 2 === 0;
  return <span style={{ display: "inline-block", width: w ?? Math.max(6, h * 0.11), height: h, background: K.sig, marginLeft: h * 0.12, verticalAlign: "-0.12em", opacity: on ? 1 : 0, borderRadius: 2 }} />;
};
const Logo: React.FC<{ w: number }> = ({ w }) => <Img src={staticFile("brand/logo-dark.png")} style={{ width: w, display: "block" }} />;

const Backdrop: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill style={{ background: `radial-gradient(1400px 900px at 50% 45%, ${K.bg2}, ${K.bg})`, overflow: "hidden" }}>
      <AbsoluteFill style={{ backgroundImage: `radial-gradient(${K.line2} 1.6px, transparent 1.6px)`, backgroundSize: "48px 48px", backgroundPosition: `${(f * 0.25) % 48}px 0`, opacity: 0.55,
        maskImage: "radial-gradient(1100px 700px at 50% 50%, #000 30%, transparent 80%)", WebkitMaskImage: "radial-gradient(1100px 700px at 50% 50%, #000 30%, transparent 80%)" }} />
      <div style={{ position: "absolute", left: 1300 + Math.sin(f / 80) * 60, top: 620, width: 900, height: 900, borderRadius: "50%", background: `radial-gradient(${K.sig}14, transparent 62%)` }} />
    </AbsoluteFill>
  );
};
// scene change: one orange caret bar sweeps across and wipes the old frame
const Wipe: React.FC = () => {
  const f = useCurrentFrame(); if (f > 16) return null;
  const x = interpolate(f, [0, 16], [-40, 1960], { ...clamp, easing: Easing.inOut(Easing.cubic) });
  return <AbsoluteFill style={{ pointerEvents: "none" }}>
    <div style={{ position: "absolute", left: x, top: 0, bottom: 0, width: 18, background: K.sig, boxShadow: `0 0 40px ${K.sig}88` }} />
    <div style={{ position: "absolute", left: x + 18, right: 0, top: 0, bottom: 0, background: K.bg, opacity: 0.85 }} />
  </AbsoluteFill>;
};
const Title: React.FC<{ text: string; at: number; size?: number; top: number; left?: number; align?: "left" | "center"; caret?: boolean }> = ({ text, at, size = 70, top, left = 120, align = "left", caret = true }) => {
  const f = useCurrentFrame(); const { fps } = useVideoConfig(); const words = text.split(" ");
  return <div style={{ position: "absolute", left: align === "center" ? 0 : left, right: align === "center" ? 0 : undefined, top, textAlign: align, ...H, fontSize: size }}>
    {words.map((w, i) => { const k = sp(f, fps, at + i * 3, 16); return <span key={i} style={{ display: "inline-block", marginRight: size * 0.24, opacity: Math.min(1, k * 1.5), transform: `translateY(${(1 - k) * 40}px)` }}>{w}</span>; })}
    {caret && <Caret h={size * 0.82} />}
  </div>;
};
const Badge: React.FC<{ i: number; size: number; on?: number; label?: boolean; lsize?: number }> = ({ i, size, on = 0, label = true, lsize }) => {
  const m = MEMBERS[i]; const ring = on > 0.05;
  return (
    <div style={{ width: size, display: "flex", flexDirection: "column", alignItems: "center", gap: size * 0.1 }}>
      <div style={{ width: size, height: size, borderRadius: "50%", position: "relative", display: "grid", placeItems: "center",
        background: `linear-gradient(160deg, ${K.surf2}, ${K.surf})`, border: `${Math.max(2, size * 0.02)}px solid ${ring ? K.sig : K.line2}`,
        boxShadow: ring ? `0 0 ${size * 0.4 * on}px ${K.sig}66, 0 ${size * 0.08}px ${size * 0.2}px rgba(0,0,0,.45)` : `0 ${size * 0.08}px ${size * 0.2}px rgba(0,0,0,.45)` }}>
        <m.I size={size * 0.42} color={K.txt} strokeWidth={1.6} />
        <div style={{ position: "absolute", right: -size * 0.06, bottom: -size * 0.02, padding: `${size * 0.012}px ${size * 0.07}px ${size * 0.03}px`, borderRadius: 999, background: K.txt, color: K.ink, fontFamily: BN, fontSize: Math.max(13, size * 0.13), fontWeight: 700, lineHeight: 1.25 }}>এআই</div>
      </div>
      {label && <div style={{ fontFamily: BN, fontSize: lsize ?? Math.max(22, size * 0.21), fontWeight: 600, color: ring ? K.txt : K.mut, whiteSpace: "nowrap", lineHeight: 1.3 }}>{m.n}</div>}
    </div>
  );
};
// lesson clip with the old-logo top bar cropped off (top 8 %)
const Clip: React.FC<{ src: string; w: number }> = ({ src, w }) => {
  const h = w * 9 / 16, cut = h * 0.08;
  return <div style={{ width: w, height: h - cut, borderRadius: 24, overflow: "hidden", position: "relative", border: `1.5px solid ${K.line2}`, boxShadow: "0 40px 90px rgba(0,0,0,.55)" }}>
    <OffthreadVideo src={P(`clips/${src}.mp4`)} muted style={{ width: w, height: h, display: "block", position: "absolute", top: -cut, left: 0 }} />
  </div>;
};
const Pill: React.FC<{ children: React.ReactNode; on?: boolean; style?: React.CSSProperties }> = ({ children, on, style }) => (
  <span style={{ display: "inline-flex", alignItems: "center", gap: 10, padding: "10px 26px 12px", borderRadius: 999, background: on ? K.txt : K.surf, border: `1.5px solid ${on ? K.txt : K.line2}`, fontFamily: BN, fontSize: 34, fontWeight: 600, color: on ? K.ink : K.txt, lineHeight: 1.25, ...style }}>{children}</span>
);

/* ---------- scenes ---------- */
const WHook: React.FC<SP> = ({ s }) => {
  const f = useCurrentFrame(); const { fps } = useVideoConfig(); const end = s.len;
  const k = sp(f, fps, 4, 16), k2 = sp(f, fps, 16, 16), lk = sp(f, fps, 26, 18);
  // the logo's caret grows into a full orange screen at the end → next scene
  const grow = interpolate(f, [end - 30, end - 4], [0, 1], { ...clamp, easing: Easing.in(Easing.cubic) });
  return (
    <AbsoluteFill>
      <div style={{ position: "absolute", left: 150, top: 330, opacity: interpolate(grow, [0, 0.35], [1, 0], clamp) }}>
        <div style={{ ...H, fontSize: 112, opacity: Math.min(1, k * 1.4), transform: `translateY(${(1 - k) * 40}px)` }}>তোমার কোর্সটা</div>
        <div style={{ ...H, fontSize: 112, color: K.txt, opacity: Math.min(1, k2 * 1.4), transform: `translateY(${(1 - k2) * 40}px)` }}>আসলে কে বানায়?<Caret h={96} /></div>
        <div style={{ marginTop: 34, fontFamily: BN, fontSize: 36, color: K.mut, opacity: sp(f, fps, 40) }}>চলো, এআই ইউনিভার্সিটির ভেতরে ঢুকি</div>
      </div>
      <div style={{ position: "absolute", left: 1150, top: 250, width: 620, height: 520, borderRadius: 40, background: `linear-gradient(160deg, ${K.surf2}, ${K.bg2})`, border: `1.5px solid ${K.line2}`, display: "grid", placeItems: "center",
        opacity: Math.min(1, lk * 1.4) * interpolate(grow, [0.05, 0.4], [1, 0], clamp), transform: `translateY(${(1 - lk) * 60}px)`, boxShadow: "0 50px 120px rgba(0,0,0,.6)" }}>
        <Logo w={460} />
      </div>
      {grow > 0 && <div style={{ position: "absolute", left: interpolate(grow, [0.4, 1], [1596, 0], clamp), top: interpolate(grow, [0, 0.4], [440, 0], clamp), width: interpolate(grow, [0.4, 1], [26, 1920], clamp), height: interpolate(grow, [0, 0.4], [138, 1080], clamp), background: K.sig }} />}
    </AbsoluteFill>
  );
};

const WBoard: React.FC<SP> = ({ s }) => {
  const f = useCurrentFrame(); const { fps } = useVideoConfig(); const n = MEMBERS.length;
  const count = Math.min(14, Math.floor(interpolate(f, [8, s.frames * 0.85], [0, 14.99], clamp)));
  const lit = Math.floor(interpolate(f, [8, s.frames * 0.8 + 8], [0, n], clamp));
  return (
    <AbsoluteFill>
      <AbsoluteFill style={{ background: K.sig, opacity: interpolate(f, [0, 12], [1, 0], clamp) }} />
      <Title text="ভেতরে কোর্স বানায় যারা" at={4} size={58} top={56} align="center" caret={false} />
      <div style={{ position: "absolute", left: 0, right: 0, top: 455, textAlign: "center" }}>
        <div style={{ ...H, fontSize: 150, lineHeight: 1 }}>{bn(count)}<Caret h={120} w={14} /></div>
        <div style={{ fontFamily: BN, fontSize: 40, fontWeight: 600, color: K.mut, marginTop: 14 }}>সদস্যের এআই বোর্ড</div>
      </div>
      {MEMBERS.map((_, i) => {
        const row = i < 7 ? 0 : 1, col = i % 7; const x = 960 + (col - 3) * 248, y = row ? 790 : 255;
        const at = 8 + (i * (s.frames * 0.8)) / n; const k = sp(f, fps, at, 13);
        const on = i === lit - 1 ? interpolate(f, [at, at + 6], [0, 1], clamp) : 0;
        return <div key={i} style={{ position: "absolute", left: x - 60, top: y - 60, opacity: Math.min(1, k * 1.5), transform: `translateY(${(1 - k) * (row ? 40 : -40)}px)` }}><Badge i={i} size={120} on={on} lsize={26} /></div>;
      })}
    </AbsoluteFill>
  );
};

const WResearch: React.FC<SP> = ({ s }) => {
  const f = useCurrentFrame(); const { fps } = useVideoConfig();
  return (
    <AbsoluteFill>
      <Title text="আসল তথ্য, আসল সূত্র" at={4} size={72} top={110} />
      <div style={{ position: "absolute", left: 170, top: 300, width: 460, height: 460 }}>
        <Globe size={460} color={K.line2} strokeWidth={0.6} style={{ position: "absolute", transform: `rotate(${f * 0.5}deg)` }} />
        <div style={{ position: "absolute", left: 140, top: 125 }}><Badge i={0} size={180} on={0.7} lsize={34} /></div>
      </div>
      <div style={{ position: "absolute", left: 780, right: 150, top: 290, display: "flex", flexDirection: "column", gap: 16 }}>
        {SOURCES.map((t, i) => { const at = 10 + i * (s.frames * 0.14); const k = sp(f, fps, at, 16); const ok = f > at + 14;
          return <div key={i} style={{ display: "flex", alignItems: "center", gap: 20, padding: "16px 26px", borderRadius: 18, background: K.surf, border: `1.5px solid ${K.line2}`, opacity: Math.min(1, k * 1.4), transform: `translateX(${(1 - k) * 200}px)` }}>
            <FileText size={34} color={K.mut} /><span style={{ flex: 1, fontFamily: BN, fontSize: 36, fontWeight: 600, color: K.txt, lineHeight: 1.3 }}>{t}</span>
            <div style={{ width: 42, height: 42, borderRadius: "50%", display: "grid", placeItems: "center", background: ok ? K.sig : "transparent", border: `2px solid ${ok ? K.sig : K.line2}` }}>{ok && <Check size={26} color={K.ink} strokeWidth={3.5} />}</div></div>; })}
      </div>
    </AbsoluteFill>
  );
};

const Bubble: React.FC<{ i: number; at: number; text: React.ReactNode; x: number }> = ({ i, at, text, x }) => {
  const f = useCurrentFrame(); const { fps } = useVideoConfig(); const k = sp(f, fps, at, 14);
  const talking = f >= at && f < at + 75;
  return <div style={{ position: "absolute", left: x, top: 260, width: 520, display: "flex", flexDirection: "column", alignItems: "center", gap: 22, opacity: Math.min(1, k * 1.5), transform: `translateY(${(1 - k) * 50}px)` }}>
    <Badge i={i} size={150} on={talking ? 1 : 0} lsize={32} />
    <div style={{ position: "relative", width: "100%", boxSizing: "border-box", padding: "26px 30px 30px", borderRadius: 26, background: K.txt, fontFamily: BN, fontSize: 36, fontWeight: 600, color: K.ink, lineHeight: 1.4, textAlign: "center", boxShadow: "0 30px 70px rgba(0,0,0,.5)" }}>
      <div style={{ position: "absolute", left: "50%", top: -12, width: 24, height: 24, background: K.txt, transform: "translateX(-50%) rotate(45deg)" }} />
      {text}
    </div>
  </div>;
};
const WDebate: React.FC<SP> = ({ s }) => {
  const f = useCurrentFrame(); const L = s.frames; const strike = interpolate(f, [L * 0.78, L * 0.86], [0, 1], clamp);
  return (
    <AbsoluteFill>
      <Title text="টেবিলে তর্ক" at={2} size={72} top={100} align="center" />
      <Bubble i={1} at={L * 0.02} x={110} text={<>শেখার পথ:<br /><b style={{ fontWeight: 800 }}>শোনো → বলো → ব্যবহার করো</b></>} />
      <Bubble i={2} at={L * 0.36} x={700} text={<>এখানে আমি বুঝব না 😕<br />আরেকটু সহজ করো!</>} />
      <Bubble i={4} at={L * 0.62} x={1290} text={<><span style={{ fontFamily: "Maru", position: "relative" }}>さようなら<span style={{ position: "absolute", left: 0, top: "52%", height: 6, width: `${strike * 100}%`, background: K.sig, borderRadius: 3 }} /></span> বইয়ের ভাষা।<br />বাস্তবে বলে <b style={{ fontFamily: "Maru" }}>またね！</b></>} />
    </AbsoluteFill>
  );
};

const WDecide: React.FC<SP> = ({ s }) => {
  const f = useCurrentFrame(); const { fps } = useVideoConfig(); const hit = Math.round(s.frames * 0.5);
  const g = interpolate(f, [hit - 12, hit], [-50, 10], { ...clamp, easing: Easing.in(Easing.quad) }); const st = sp(f, fps, hit, 10);
  const shake = f >= hit && f < hit + 8 ? Math.sin(f * 9) * 10 : 0;
  return (
    <AbsoluteFill style={{ transform: `translate(${shake}px, ${shake / 2}px)` }}>
      <div style={{ position: "absolute", left: 400, top: 470, transform: "translate(-50%,-50%)" }}><Badge i={13} size={260} on={f >= hit ? 1 : 0.3} lsize={44} /></div>
      <div style={{ position: "absolute", left: 500, top: 230, transformOrigin: "80% 80%", transform: `rotate(${g}deg)` }}><Gavel size={180} color={K.txt} strokeWidth={1.4} /></div>
      {f >= hit && <div style={{ position: "absolute", left: 800, top: 250, transform: `scale(${1.8 - 0.8 * st})`, transformOrigin: "left center", opacity: Math.min(1, st * 2) }}>
        <div style={{ ...H, fontSize: 100 }}>সিদ্ধান্ত<Caret h={84} blink={false} /></div></div>}
      {f >= hit + 8 && ["৩০টি লেসন", "প্রতিটায় হুক", "রোলপ্লে + মিশন", "বাংলার সাথে সিক্রেট"].map((t, i) => {
        const k = sp(f, fps, hit + 8 + i * 4, 15);
        return <div key={i} style={{ position: "absolute", left: 800 + i * 262, top: 520, width: 240, padding: "20px 10px 22px", borderRadius: 18, background: K.surf, border: `1.5px solid ${K.line2}`, textAlign: "center", fontFamily: BN, fontSize: 30, fontWeight: 600, color: K.txt, lineHeight: 1.3, transform: `translateY(${(1 - k) * 160}px)`, opacity: k }}>{t}</div>;
      })}
      <AbsoluteFill style={{ background: K.sig, opacity: interpolate(f, [hit, hit + 2, hit + 8], [0, 0.22, 0], clamp) }} />
    </AbsoluteFill>
  );
};

const WBuild: React.FC<SP> = ({ s }) => {
  const f = useCurrentFrame(); const { fps } = useVideoConfig(); const L = s.frames;
  const active = Math.min(3, Math.floor(interpolate(f, [6, L * 0.75], [0, 3.99], clamp)));
  return (
    <AbsoluteFill>
      <Title text="তারপর তৈরি হয় লেসন" at={2} size={66} top={100} />
      <div style={{ position: "absolute", left: 120, width: 520, top: 270, display: "flex", flexDirection: "column", gap: 24 }}>
        {STEPS.map((st, i) => { const on = i <= active; const now = i === active;
          return <div key={i} style={{ display: "flex", alignItems: "center", gap: 24 }}>
            <div style={{ width: 100, height: 100, borderRadius: 26, display: "grid", placeItems: "center", background: now ? K.txt : K.surf, border: `1.5px solid ${on ? K.txt : K.line}`, position: "relative" }}>
              <st.I size={48} color={now ? K.ink : on ? K.txt : K.dim} />
              {now && <div style={{ position: "absolute", left: -18, top: 20, bottom: 20, width: 7, borderRadius: 4, background: K.sig }} />}</div>
            <div style={{ fontFamily: BN, fontSize: 42, fontWeight: 700, fontStretch: "115%", color: on ? K.txt : K.dim }}>{st.t}</div></div>; })}
      </div>
      <div style={{ position: "absolute", left: 720, top: 250, opacity: sp(f, fps, L * 0.3, 16), transform: `translateY(${(1 - sp(f, fps, L * 0.3, 16)) * 50}px)` }}><Clip src="kana" w={1080} /></div>
      <div style={{ position: "absolute", left: 720, width: 1080, top: 845, display: "flex", justifyContent: "center", gap: 6, alignItems: "center", height: 80 }}>
        {Array.from({ length: 56 }, (_, i) => { const p = (f * 0.9) % 56; return <div key={i} style={{ width: 8, borderRadius: 4, height: 10 + Math.abs(Math.sin(f / 3 + i * 0.7)) * 56 * (0.4 + random(`w${i}`) * 0.6), background: i < p ? K.sig : K.line2 }} />; })}
      </div>
    </AbsoluteFill>
  );
};

const WGate: React.FC<SP> = ({ s }) => {
  const f = useCurrentFrame(); const { fps } = useVideoConfig(); const L = s.frames; const pass = Math.round(L * 0.82); const k = sp(f, fps, pass, 10);
  return (
    <AbsoluteFill>
      <Title text="মান যাচাইয়ের গেট" at={2} size={70} top={90} />
      <div style={{ position: "absolute", left: 140, width: 880, top: 220, display: "flex", flexDirection: "column", gap: 10 }}>
        {CHECKS.map((t, i) => { const at = 6 + i * (L * 0.1); const ok = f >= at + 6; const kk = sp(f, fps, at, 16);
          return <div key={i} style={{ display: "flex", alignItems: "center", gap: 20, padding: "10px 24px", borderRadius: 16, background: K.surf, border: `1.5px solid ${ok ? K.line2 : K.line}`, opacity: kk, transform: `translateX(${(1 - kk) * -160}px)` }}>
            <div style={{ width: 44, height: 44, borderRadius: 12, background: ok ? K.txt : "transparent", border: `2px solid ${ok ? K.txt : K.line2}`, display: "grid", placeItems: "center" }}>{ok && <Check size={30} color={K.ink} strokeWidth={3.5} />}</div>
            <span style={{ fontFamily: BN, fontSize: 36, fontWeight: 600, color: ok ? K.txt : K.mut, lineHeight: 1.3 }}>{t}</span></div>; })}
      </div>
      <div style={{ position: "absolute", left: 1180, top: 300, width: 600, height: 440, borderRadius: 36, border: `1.5px solid ${K.line2}`, background: K.surf, display: "grid", placeItems: "center" }}>
        {f < pass ? <div style={{ fontFamily: BN, fontSize: 40, color: K.dim }}>যাচাই চলছে…</div> :
          <div style={{ textAlign: "center", transform: `scale(${1.6 - 0.6 * k})`, opacity: Math.min(1, k * 2) }}>
            <div style={{ ...H, fontSize: 120, lineHeight: 1 }}>পাস<Caret h={100} blink={false} /></div>
            <div style={{ fontFamily: BN, fontSize: 34, color: K.mut, marginTop: 18 }}>এবার লেসন প্রকাশ হবে</div></div>}
      </div>
    </AbsoluteFill>
  );
};

const WORDS2 = [{ t: "শোনো", clip: "street" }, { t: "বলো", clip: "speak" }, { t: "খেলো", clip: "quiz" }, { t: "শেখো", clip: "store" }];
const WResult: React.FC<SP> = ({ s }) => {
  const f = useCurrentFrame(); const { fps } = useVideoConfig(); const seg = (s.len - 10) / 4; const i = Math.min(3, Math.floor(f / seg)); const w = WORDS2[i]; const k = sp(f - i * seg, fps, 0, 14);
  return (
    <AbsoluteFill>
      <div style={{ position: "absolute", left: 120, top: 270, width: 560, ...H, fontSize: 168, lineHeight: 1.1, transform: `translateY(${(1 - k) * 50}px)`, opacity: Math.min(1, k * 1.5) }}>{w.t}<Caret h={140} w={16} /></div>
      <div style={{ position: "absolute", left: 120, top: 540, display: "flex", gap: 12 }}>{WORDS2.map((x, j) => <Pill key={j} on={j === i} style={{ opacity: j <= i ? 1 : 0.4 }}>{x.t}</Pill>)}</div>
      <div style={{ position: "absolute", left: 120, top: 650, fontFamily: BN, fontSize: 28, color: K.mut }}>আসল দৃশ্য: জাপানি পাঠ ০১</div>
      <div style={{ position: "absolute", left: 720, top: 220 }}><Sequence from={Math.round(i * seg)} durationInFrames={Math.round(seg) + 2} layout="none"><Clip src={w.clip} w={1080} /></Sequence></div>
    </AbsoluteFill>
  );
};

const WCta: React.FC<SP> = () => {
  const f = useCurrentFrame(); const { fps } = useVideoConfig();
  return (
    <AbsoluteFill>
      <div style={{ position: "absolute", left: 0, right: 0, top: 150, display: "flex", justifyContent: "center", opacity: sp(f, fps, 2), transform: `translateY(${(1 - sp(f, fps, 2)) * 40}px)` }}><Logo w={440} /></div>
      <Title text="যেকোনো কোর্সের প্রথম ২০% একদম ফ্রি" at={8} size={80} top={400} align="center" caret={false} />
      <div style={{ position: "absolute", left: 0, right: 0, top: 560, display: "flex", justifyContent: "center", gap: 14 }}>
        {["ইংলিশ", "IELTS", "জাপানি", "আরবি", "কোরিয়ান", "এয়ার টিকেটিং"].map((t, i) => { const k = sp(f, fps, 14 + i * 3, 15); return <div key={i} style={{ opacity: k, transform: `translateY(${(1 - k) * 30}px)` }}><Pill>{t}</Pill></div>; })}
      </div>
      <div style={{ position: "absolute", left: 0, right: 0, top: 700, display: "flex", justifyContent: "center", opacity: sp(f, fps, 34) }}>
        <div style={{ padding: "22px 56px 26px", borderRadius: 999, background: K.txt, fontFamily: EN, fontSize: 58, fontWeight: 800, color: K.ink, display: "flex", alignItems: "center" }}>aiuniversitybd.com</div>
      </div>
      <div style={{ position: "absolute", left: 0, right: 0, top: 850, textAlign: "center", ...H, fontSize: 44, opacity: sp(f, fps, 44) }}>আজই শুরু করো</div>
    </AbsoluteFill>
  );
};

const MAP: Record<string, React.FC<SP>> = { hook: WHook, board: WBoard, research: WResearch, debate: WDebate, decide: WDecide, build: WBuild, gate: WGate, result: WResult, cta: WCta };

const CaptionW: React.FC<{ text: string; frames: number }> = ({ text, frames }) => {
  const f = useCurrentFrame(); const words = text.split(" "); const tot = text.length; let acc = 0;
  const p = interpolate(f, [0, frames], [0, 1], clamp); const chunk = Math.min(words.length - 1, Math.floor(p * Math.ceil(words.length / 7)) * 7);
  return <div style={{ position: "absolute", left: 200, right: 200, bottom: 44, display: "flex", justifyContent: "center", opacity: interpolate(f, [frames, frames + 8], [1, 0], clamp) }}>
    <div style={{ padding: "10px 28px 14px", borderRadius: 16, background: "rgba(13,14,18,.86)", border: `1px solid ${K.line}`, fontFamily: BN, fontSize: 36, fontWeight: 600, textAlign: "center", lineHeight: 1.35 }}>
      {words.map((w, i) => { const st = acc / tot; acc += w.length + 1; if (i < chunk || i >= chunk + 7) return null;
        return <span key={i} style={{ color: p >= st ? K.txt : "rgba(243,243,240,.35)", marginRight: 10 }}>{w}</span>; })}
    </div>
  </div>;
};

export const BoardPromoW: React.FC<{ spec: Spec }> = ({ spec }) => {
  const total = promoLen(spec); const f = useCurrentFrame();
  const starts = spec.scenes.reduce<number[]>((a, _, i) => [...a, i ? a[i - 1] + spec.scenes[i - 1].len : 10], []);
  return (
    <AbsoluteFill style={{ background: K.bg }}>
      <Backdrop />
      {spec.scenes.map((s, i) => { const S = MAP[s.id] || WCta; return (
        <Sequence key={i} from={starts[i]} durationInFrames={s.len}>
          <S s={s} /><CaptionW text={s.vo} frames={s.frames} /><Audio src={P(s.file)} />
          {i > 1 && <><Wipe /><Sequence durationInFrames={40}><Audio src={staticFile("aiu2/whoosh.mp3")} volume={0.3} /></Sequence></>}
          {s.id === "decide" && <Sequence from={Math.round(s.frames * 0.5)} durationInFrames={40}><Audio src={staticFile("aiu2/hit.mp3")} volume={0.55} /></Sequence>}
          {s.id === "gate" && <Sequence from={Math.round(s.frames * 0.82)} durationInFrames={40}><Audio src={staticFile("aiu2/chime.mp3")} volume={0.5} /></Sequence>}
          {s.id === "board" && MEMBERS.map((_, j) => <Sequence key={j} from={Math.round(8 + (j * (s.frames * 0.8)) / 14)} durationInFrames={20}><Audio src={staticFile("aiu2/pop.mp3")} volume={0.15} /></Sequence>)}
        </Sequence>); })}
      <Sequence durationInFrames={90}><Audio src={staticFile("aiu2/swell.mp3")} volume={0.3} /></Sequence>
      <Audio src={P("music.mp3")} volume={(fr) => 0.15 * interpolate(fr, [0, 20, total - 50, total], [0, 1, 1, 0], clamp)} />
      {/* film progress = the brand's one "progress" use of orange */}
      <div style={{ position: "absolute", left: 0, top: 0, height: 5, width: `${(f / total) * 100}%`, background: K.sig }} />
      <div style={{ position: "absolute", right: 44, top: 34, fontFamily: BN, fontSize: 22, color: K.dim }}>এআই বোর্ড · এআই কণ্ঠ · আসল লেসনের দৃশ্য</div>
    </AbsoluteFill>
  );
};
