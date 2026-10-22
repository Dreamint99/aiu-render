// 16:9 version of the board promo for the website's "কীভাবে আমাদের কোর্স তৈরি হয়" section (same voice + timing as the reel).
// Reuses the reel's building blocks; only the layout is landscape (content in 120–940 px, captions at the bottom).
import React from "react";
import { AbsoluteFill, Audio, Img, Sequence, interpolate, staticFile, useCurrentFrame, useVideoConfig, Easing, random } from "remotion";
import { Globe, FileText, Check, Gavel, Sparkles } from "lucide-react";
import { C, BN, EN, MARU, clamp, bn, sp, P, MEMBERS, Badge, Backdrop, Transition, Wide, Title, Chip, SOURCES, STEPS, CHECKS, WORDS, Spec, Scene, promoLen } from "./BoardPromo";

type SP = { s: Scene };

const HHook: React.FC<SP> = ({ s }) => {
  const f = useCurrentFrame(); const { fps } = useVideoConfig(); const end = s.len;
  const dive = interpolate(f, [end - 34, end], [1, 14], { ...clamp, easing: Easing.in(Easing.cubic) });
  const glitch = f < 30 && f % 6 < 2 ? (random(`g${f}`) - 0.5) * 24 : 0; const k = sp(f, fps, 4, 10);
  return (
    <AbsoluteFill>
      <div style={{ position: "absolute", left: 140, top: 330, width: 900, transform: `translateX(${glitch}px)` }}>
        <div style={{ fontFamily: BN, fontSize: 110, fontWeight: 800, color: "#fff", lineHeight: 1.15, textShadow: `${-glitch / 3}px 0 ${C.pink}, ${glitch / 3}px 0 ${C.cyan}, 0 10px 40px #000`, opacity: Math.min(1, k * 1.4) }}>তোমার কোর্সটা<br /><span style={{ color: C.gold }}>আসলে কে বানায়?</span></div>
      </div>
      <div style={{ position: "absolute", left: 1400, top: 500, transform: `translate(-50%, -50%) scale(${(0.6 + 0.4 * sp(f, fps, 20)) * dive})`, opacity: interpolate(f, [end - 8, end], [1, 0], clamp) }}>
        <div style={{ width: 460, height: 460, borderRadius: "50%", display: "grid", placeItems: "center", background: `radial-gradient(${C.brand}, #061040 70%)`, boxShadow: `0 0 ${80 + Math.sin(f / 5) * 30}px ${C.cyan}, inset 0 0 80px ${C.cyan}66`, border: `4px solid ${C.cyan}` }}>
          <Img src={staticFile("brand/logo-dark.png")} style={{ width: 330 }} />
        </div>
        {[0, 1, 2].map((r) => <div key={r} style={{ position: "absolute", left: "50%", top: "50%", width: 540 + r * 120, height: 540 + r * 120, marginLeft: -(270 + r * 60), marginTop: -(270 + r * 60), borderRadius: "50%", border: `2px ${r === 1 ? "dashed" : "solid"} ${C.cyan}${["88", "55", "33"][r]}`, transform: `rotate(${f * (r % 2 ? -1 : 1) * 1.5}deg)` }} />)}
      </div>
      <AbsoluteFill style={{ background: "#fff", opacity: interpolate(f, [end - 6, end], [0, 1], clamp) }} />
    </AbsoluteFill>
  );
};

const HBoard: React.FC<SP> = ({ s }) => {
  const f = useCurrentFrame(); const { fps } = useVideoConfig(); const n = MEMBERS.length;
  const count = Math.min(14, Math.floor(interpolate(f, [8, s.frames * 0.85], [0, 14.99], clamp)));
  return (
    <AbsoluteFill>
      <AbsoluteFill style={{ background: "#fff", opacity: interpolate(f, [0, 10], [0.8, 0], clamp) }} />
      <Title text="ভেতরে কোর্স বানায় যারা" at={4} size={54} top={40} />
      <div style={{ position: "absolute", left: 960 - 520, top: 560 - 150, width: 1040, height: 300, borderRadius: "50%", border: `4px solid ${C.cyan}`, boxShadow: `0 0 60px ${C.cyan}, inset 0 0 80px ${C.blue}88`, background: `radial-gradient(${C.brand}44, transparent 70%)` }} />
      <div style={{ position: "absolute", left: 0, right: 0, top: 470, textAlign: "center" }}>
        <div style={{ fontFamily: EN, fontSize: 140, fontWeight: 900, color: "#fff", textShadow: `0 0 40px ${C.cyan}`, lineHeight: 1 }}>{bn(count)}</div>
        <div style={{ fontFamily: BN, fontSize: 40, fontWeight: 800, color: C.cyan }}>সদস্যের এআই বোর্ড</div>
      </div>
      {MEMBERS.map((_, i) => {
        const a = (i / n) * Math.PI * 2 - Math.PI / 2; const x = 960 + Math.cos(a) * 790, y = 555 + Math.sin(a) * 300;
        const at = 8 + (i * (s.frames * 0.8)) / n; const k = sp(f, fps, at, 11);
        return <div key={i} style={{ position: "absolute", left: x - 56, top: y - 60, opacity: Math.min(1, k * 1.5), transform: `scale(${0.3 + 0.7 * k})` }}><Badge i={i} size={112} glow={interpolate(f, [at, at + 8, at + 20], [0, 1, 0.2], clamp)} /></div>;
      })}
    </AbsoluteFill>
  );
};

const HResearch: React.FC<SP> = ({ s }) => {
  const f = useCurrentFrame(); const { fps } = useVideoConfig();
  return (
    <AbsoluteFill>
      <Title text="আসল তথ্য, আসল সূত্র" at={4} size={70} top={110} color={C.cyan} />
      <div style={{ position: "absolute", left: 220, top: 300, width: 420, height: 420 }}>
        <Globe size={420} color={`${C.cyan}55`} strokeWidth={0.7} style={{ position: "absolute", transform: `rotate(${f * 0.8}deg)` }} />
        <div style={{ position: "absolute", left: 130, top: 120 }}><Badge i={0} size={160} glow={0.8} /></div>
      </div>
      <div style={{ position: "absolute", left: 800, right: 140, top: 270, display: "flex", flexDirection: "column", gap: 16 }}>
        {SOURCES.map((t, i) => { const at = 10 + i * (s.frames * 0.14); const k = sp(f, fps, at, 15); const ok = f > at + 14;
          return <div key={i} style={{ display: "flex", alignItems: "center", gap: 18, padding: "16px 26px", borderRadius: 20, background: "rgba(10,20,70,.85)", border: `2px solid ${ok ? C.mint : C.cyan}66`, opacity: Math.min(1, k * 1.4), transform: `translateX(${(1 - k) * 300}px)` }}>
            <FileText size={38} color={C.cyan} /><span style={{ flex: 1, fontFamily: BN, fontSize: 38, fontWeight: 600, color: "#fff" }}>{t}</span>{ok && <Check size={42} color={C.mint} strokeWidth={3.5} />}</div>; })}
      </div>
    </AbsoluteFill>
  );
};

const HBubble: React.FC<{ i: number; at: number; text: React.ReactNode; x: number; y: number }> = ({ i, at, text, x, y }) => {
  const f = useCurrentFrame(); const { fps } = useVideoConfig(); const k = sp(f, fps, at, 12); const m = MEMBERS[i];
  return <div style={{ position: "absolute", left: x, top: y, width: 520, display: "flex", flexDirection: "column", alignItems: "center", gap: 18, opacity: Math.min(1, k * 1.5), transform: `scale(${0.6 + 0.4 * k})` }}>
    <Badge i={i} size={150} glow={0.5} />
    <div style={{ padding: "22px 28px", borderRadius: 28, background: "#fff", border: `5px solid ${m.c}`, fontFamily: BN, fontSize: 36, fontWeight: 700, color: C.ink, lineHeight: 1.3, textAlign: "center", boxShadow: `0 20px 50px rgba(0,0,0,.5), 0 0 40px ${m.c}66` }}>{text}</div>
  </div>;
};
const HDebate: React.FC<SP> = ({ s }) => {
  const f = useCurrentFrame(); const L = s.frames; const strike = interpolate(f, [L * 0.78, L * 0.86], [0, 1], clamp);
  return (
    <AbsoluteFill>
      <Title text="টেবিলে তর্ক" at={2} size={70} top={100} color={C.gold} />
      <HBubble i={1} at={L * 0.02} x={110} y={250} text={<>শেখার পথ:<br /><b style={{ color: C.brand }}>শোনো → বলো → ব্যবহার করো</b></>} />
      <HBubble i={2} at={L * 0.36} x={700} y={250} text={<>এখানে আমি বুঝব না 😕<br />আরেকটু সহজ করো!</>} />
      <HBubble i={4} at={L * 0.62} x={1290} y={250} text={<><span style={{ fontFamily: MARU, position: "relative" }}>さようなら<span style={{ position: "absolute", left: 0, top: "52%", height: 6, width: `${strike * 100}%`, background: C.red, borderRadius: 3 }} /></span> বইয়ের ভাষা।<br />বাস্তবে বলে <b style={{ fontFamily: MARU, color: C.pink }}>またね！</b></>} />
    </AbsoluteFill>
  );
};

const HDecide: React.FC<SP> = ({ s }) => {
  const f = useCurrentFrame(); const { fps } = useVideoConfig(); const hit = Math.round(s.frames * 0.5);
  const g = interpolate(f, [hit - 12, hit], [-50, 10], { ...clamp, easing: Easing.in(Easing.quad) }); const st = sp(f, fps, hit, 9);
  const shake = f >= hit && f < hit + 8 ? Math.sin(f * 9) * 12 : 0;
  return (
    <AbsoluteFill style={{ transform: `translate(${shake}px, ${shake / 2}px)` }}>
      <div style={{ position: "absolute", left: 420, top: 450, transform: "translate(-50%,-50%)" }}><Badge i={13} size={260} glow={0.9} /></div>
      <div style={{ position: "absolute", left: 520, top: 260, transformOrigin: "80% 80%", transform: `rotate(${g}deg)` }}><Gavel size={190} color={C.gold} strokeWidth={1.6} /></div>
      {f >= hit && <div style={{ position: "absolute", left: 800, top: 260 }}><div style={{ padding: "20px 60px", borderRadius: 24, border: `8px solid ${C.mint}`, color: C.mint, fontFamily: BN, fontSize: 96, fontWeight: 900, transform: `scale(${2.2 - 1.2 * st}) rotate(-6deg)`, opacity: Math.min(1, st * 2), boxShadow: `0 0 60px ${C.mint}88`, background: "rgba(3,6,23,.6)" }}>সিদ্ধান্ত ✓</div></div>}
      {f >= hit + 8 && ["৩০টি লেসন", "প্রতিটায় হুক", "রোলপ্লে + মিশন", "বাংলার সাথে সিক্রেট"].map((t, i) => {
        const k = sp(f, fps, hit + 8 + i * 4, 13);
        return <div key={i} style={{ position: "absolute", left: 800 + i * 250, top: 560, width: 230, padding: "18px 10px", borderRadius: 18, background: "#fff", textAlign: "center", fontFamily: BN, fontSize: 30, fontWeight: 800, color: C.ink, transform: `translateY(${(1 - k) * 200}px) rotate(${(i - 1.5) * 4}deg)`, opacity: k }}>{t}</div>;
      })}
      <AbsoluteFill style={{ background: C.gold, opacity: interpolate(f, [hit, hit + 2, hit + 8], [0, 0.35, 0], clamp) }} />
    </AbsoluteFill>
  );
};

const HBuild: React.FC<SP> = ({ s }) => {
  const f = useCurrentFrame(); const { fps } = useVideoConfig(); const L = s.frames;
  const active = Math.min(3, Math.floor(interpolate(f, [6, L * 0.75], [0, 3.99], clamp)));
  return (
    <AbsoluteFill>
      <Title text="তারপর তৈরি হয় লেসন" at={2} size={66} top={100} />
      <div style={{ position: "absolute", left: 120, width: 520, top: 260, display: "flex", flexDirection: "column", gap: 26 }}>
        {STEPS.map((st, i) => { const on = i <= active; const k = sp(f, fps, 6 + i * (L * 0.18), 12);
          return <div key={i} style={{ display: "flex", alignItems: "center", gap: 24, opacity: 0.35 + 0.65 * (on ? k : 0) }}>
            <div style={{ width: 110, height: 110, borderRadius: 28, display: "grid", placeItems: "center", background: on ? `${st.c}33` : "rgba(255,255,255,.06)", border: `3px solid ${on ? st.c : "#334"}`, boxShadow: i === active ? `0 0 50px ${st.c}` : "none" }}><st.I size={56} color={on ? "#fff" : "#667"} /></div>
            <div style={{ fontFamily: BN, fontSize: 42, fontWeight: 800, color: on ? "#fff" : "#667" }}>{st.t}</div></div>; })}
      </div>
      <div style={{ position: "absolute", left: 720, top: 250, opacity: sp(f, fps, L * 0.3, 15), transform: `scale(${0.85 + 0.15 * sp(f, fps, L * 0.3, 15)})` }}><Wide src="kana" w={1080} /></div>
      <div style={{ position: "absolute", left: 720, width: 1080, top: 880, display: "flex", justifyContent: "center", gap: 6, alignItems: "center", height: 90 }}>
        {Array.from({ length: 50 }, (_, i) => <div key={i} style={{ width: 10, borderRadius: 5, height: 14 + Math.abs(Math.sin(f / 3 + i * 0.7)) * 70 * (0.4 + random(`w${i}`) * 0.6), background: i % 2 ? C.pink : C.cyan }} />)}
      </div>
    </AbsoluteFill>
  );
};

const HGate: React.FC<SP> = ({ s }) => {
  const f = useCurrentFrame(); const { fps } = useVideoConfig(); const L = s.frames; const pass = Math.round(L * 0.82); const k = sp(f, fps, pass, 9);
  return (
    <AbsoluteFill>
      <Title text="মান যাচাইয়ের গেট" at={2} size={70} top={100} color={C.blue} />
      <div style={{ position: "absolute", left: 160, width: 900, top: 220, display: "grid", gridTemplateColumns: "1fr", gap: 9 }}>
        {CHECKS.map((t, i) => { const at = 6 + i * (L * 0.1); const ok = f >= at + 6; const kk = sp(f, fps, at, 15);
          return <div key={i} style={{ display: "flex", alignItems: "center", gap: 20, padding: "9px 24px", borderRadius: 18, background: ok ? "rgba(61,220,151,.14)" : "rgba(255,255,255,.05)", border: `2px solid ${ok ? C.mint : "#334"}`, opacity: kk, transform: `translateX(${(1 - kk) * -200}px)` }}>
            <div style={{ width: 48, height: 48, borderRadius: 12, background: ok ? C.mint : "transparent", border: `3px solid ${ok ? C.mint : "#556"}`, display: "grid", placeItems: "center" }}>{ok && <Check size={34} color={C.ink} strokeWidth={4} />}</div>
            <span style={{ fontFamily: BN, fontSize: 38, fontWeight: 700, color: "#fff" }}>{t}</span></div>; })}
      </div>
      {f >= pass && <div style={{ position: "absolute", left: 1180, top: 440 }}><div style={{ padding: "20px 80px", borderRadius: 30, background: C.mint, fontFamily: EN, fontSize: 130, fontWeight: 900, color: C.ink, transform: `scale(${2 - k}) rotate(-4deg)`, opacity: Math.min(1, k * 2), boxShadow: `0 0 80px ${C.mint}` }}>PASS ✓</div></div>}
    </AbsoluteFill>
  );
};

const HResult: React.FC<SP> = ({ s }) => {
  const f = useCurrentFrame(); const { fps } = useVideoConfig(); const seg = (s.len - 10) / 4; const i = Math.min(3, Math.floor(f / seg)); const w = WORDS[i]; const k = sp(f - i * seg, fps, 0, 10);
  return (
    <AbsoluteFill>
      <div style={{ position: "absolute", left: 120, top: 300, width: 520, fontFamily: BN, fontSize: 170, fontWeight: 900, color: w.c, textShadow: `0 0 50px ${w.c}`, transform: `scale(${0.5 + 0.5 * k})`, opacity: Math.min(1, k * 1.5) }}>{w.t}</div>
      <div style={{ position: "absolute", left: 120, top: 560, display: "flex", gap: 14 }}>{WORDS.map((x, j) => <Chip key={j} c={x.c} style={{ opacity: j <= i ? 1 : 0.3, transform: j === i ? "scale(1.1)" : "none" }}>{x.t}</Chip>)}</div>
      <div style={{ position: "absolute", left: 120, top: 680, fontFamily: BN, fontSize: 30, color: C.mute }}>আসল দৃশ্য: জাপানি পাঠ ০১ · এআই ইউনিভার্সিটি</div>
      <div style={{ position: "absolute", left: 720, top: 200 }}><Sequence from={Math.round(i * seg)} durationInFrames={Math.round(seg) + 2} layout="none"><Wide src={w.clip} w={1080} /></Sequence></div>
    </AbsoluteFill>
  );
};

const HCta: React.FC<SP> = () => {
  const f = useCurrentFrame(); const { fps } = useVideoConfig(); const pulse = 1 + Math.sin(f / 6) * 0.04;
  return (
    <AbsoluteFill>
      <div style={{ position: "absolute", left: 0, right: 0, top: 120, display: "flex", justifyContent: "center", transform: `scale(${sp(f, fps, 2)})` }}><Img src={staticFile("brand/logo-dark.png")} style={{ width: 420 }} /></div>
      <Title text="যেকোনো কোর্সের প্রথম ২০% একদম ফ্রি" at={8} size={84} top={330} color={C.gold} />
      <div style={{ position: "absolute", left: 0, right: 0, top: 500, display: "flex", justifyContent: "center", gap: 16 }}>
        {["ইংলিশ", "IELTS", "জাপানি", "আরবি", "কোরিয়ান", "এয়ার টিকেটিং"].map((t, i) => <div key={i} style={{ opacity: sp(f, fps, 14 + i * 3), transform: `scale(${0.6 + 0.4 * sp(f, fps, 14 + i * 3)})` }}><Chip c={[C.cyan, C.pink, C.gold, C.mint, C.blue, C.red][i]}>{t}</Chip></div>)}
      </div>
      <div style={{ position: "absolute", left: 0, right: 0, top: 650, display: "flex", justifyContent: "center", opacity: sp(f, fps, 34) }}>
        <div style={{ padding: "26px 60px", borderRadius: 60, background: `linear-gradient(90deg, ${C.brand}, ${C.cyan})`, fontFamily: EN, fontSize: 64, fontWeight: 900, color: "#fff", transform: `scale(${pulse})`, boxShadow: `0 0 ${50 + Math.sin(f / 6) * 20}px ${C.cyan}` }}>aiuniversitybd.com</div>
      </div>
      <div style={{ position: "absolute", left: 0, right: 0, top: 800, textAlign: "center", fontFamily: BN, fontSize: 40, fontWeight: 800, color: "#fff", opacity: sp(f, fps, 44) }}><Sparkles size={32} color={C.gold} style={{ verticalAlign: -5 }} /> পেইড কোর্স মাত্র <span style={{ color: C.gold }}>৳৯৯৯</span> · আজই শুরু করো</div>
    </AbsoluteFill>
  );
};

const MAP: Record<string, React.FC<SP>> = { hook: HHook, board: HBoard, research: HResearch, debate: HDebate, decide: HDecide, build: HBuild, gate: HGate, result: HResult, cta: HCta };

const CaptionH: React.FC<{ text: string; frames: number }> = ({ text, frames }) => {
  const f = useCurrentFrame(); const words = text.split(" "); const tot = text.length; let acc = 0;
  const p = interpolate(f, [0, frames], [0, 1], clamp); const chunk = Math.min(words.length - 1, Math.floor(p * Math.ceil(words.length / 7)) * 7);
  return <div style={{ position: "absolute", left: 200, right: 200, bottom: 40, display: "flex", justifyContent: "center", opacity: interpolate(f, [frames, frames + 8], [1, 0], clamp) }}>
    <div style={{ padding: "12px 26px", borderRadius: 18, background: "rgba(3,6,23,.8)", fontFamily: BN, fontSize: 38, fontWeight: 700, textAlign: "center" }}>
      {words.map((w, i) => { const st = acc / tot; acc += w.length + 1; if (i < chunk || i >= chunk + 7) return null;
        return <span key={i} style={{ color: p >= st ? "#fff" : "rgba(255,255,255,.35)", marginRight: 10 }}>{w}</span>; })}
    </div>
  </div>;
};

export const BoardPromoH: React.FC<{ spec: Spec }> = ({ spec }) => {
  const total = promoLen(spec);
  const starts = spec.scenes.reduce<number[]>((a, _, i) => [...a, i ? a[i - 1] + spec.scenes[i - 1].len : 10], []);
  return (
    <AbsoluteFill style={{ background: C.bg0 }}>
      <Backdrop />
      {spec.scenes.map((s, i) => { const S = MAP[s.id] || HCta; return (
        <Sequence key={i} from={starts[i]} durationInFrames={s.len}>
          <S s={s} /><CaptionH text={s.vo} frames={s.frames} /><Audio src={P(s.file)} />
          {i > 0 && <><Transition /><Sequence durationInFrames={40}><Audio src={staticFile("aiu2/whoosh.mp3")} volume={0.35} /></Sequence></>}
          {s.id === "decide" && <Sequence from={Math.round(s.frames * 0.5)} durationInFrames={40}><Audio src={staticFile("aiu2/hit.mp3")} volume={0.6} /></Sequence>}
          {s.id === "gate" && <Sequence from={Math.round(s.frames * 0.82)} durationInFrames={40}><Audio src={staticFile("aiu2/chime.mp3")} volume={0.5} /></Sequence>}
          {s.id === "board" && MEMBERS.map((_, j) => <Sequence key={j} from={Math.round(8 + (j * (s.frames * 0.8)) / 14)} durationInFrames={20}><Audio src={staticFile("aiu2/pop.mp3")} volume={0.18} /></Sequence>)}
        </Sequence>); })}
      <Sequence durationInFrames={90}><Audio src={staticFile("aiu2/swell.mp3")} volume={0.35} /></Sequence>
      <Audio src={P("music.mp3")} volume={(fr) => 0.16 * interpolate(fr, [0, 20, total - 50, total], [0, 1, 1, 0], clamp)} />
      <div style={{ position: "absolute", right: 40, top: 30, padding: "8px 18px", borderRadius: 14, background: "rgba(3,6,23,.6)", fontFamily: BN, fontSize: 22, color: C.mute }}>এআই বোর্ড · এআই কণ্ঠ · আসল লেসনের দৃশ্য</div>
    </AbsoluteFill>
  );
};
