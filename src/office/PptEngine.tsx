// অফিস মাস্টারক্লাস — PowerPoint look-alike "screen share" scene (scene type "ppt"), same spirit as ExcelEngine (2026-11-15).
// Slide thumbnails + slide canvas (1280×720 slide units), elements (title/text/bullets/shape/icon/chart/img), typing, element
// changes that glide (= Morph look), Designer pane with design ideas, entrance animations, Slide Show full screen, Presenter View,
// File → Export (PDF / video), Copilot pane, dialogs, callouts, key chips, zoom.
import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame, Easing, spring, useVideoConfig } from "remotion";
import { Plus, LayoutTemplate, Sparkles, Palette, Shapes, Image, ChartColumn, Smile, Play, Presentation, Mic, Wand2, ArrowRightLeft, Layers, Save, Undo2, Redo2, Minus, Square, X, MonitorPlay, Timer, Rows3 } from "lucide-react";
import { P, Step, W, H, UI, BN, clamp, ease, v, fadeIO, Cursor, KeyChips, Callout, Over, overStep, Overlays, Backstage, PANE_W, dialogBox, Icon } from "./kit";

const C = { a: "#C43E1C", a2: "#8E2C12", ink: "#1F1F1F", mute: "#5F6368", line: "#D9D9D9", rib: "#F8F8F8", desk: "#E6E6E6" };
const TB = 46, TABS = 40, RIB = 104, STATUS = 28, TOP = TB + TABS + RIB, THUMB = 230;
const TAB_NAMES = ["File", "Home", "Insert", "Design", "Transitions", "Animations", "Slide Show", "Review", "View"];
type Btn = { id: string; label: string; icon: React.FC<any>; big?: boolean };
const RIBBON: Record<string, Btn[][]> = {
  Home: [[{ id: "newslide", label: "New Slide", icon: Plus, big: true }, { id: "layout", label: "Layout", icon: LayoutTemplate, big: true }], [{ id: "shapes", label: "Shapes", icon: Shapes, big: true }], [{ id: "designer", label: "Designer", icon: Wand2, big: true }, { id: "copilot", label: "Copilot", icon: Sparkles, big: true }]],
  Insert: [[{ id: "newslide2", label: "New Slide", icon: Plus, big: true }], [{ id: "pictures", label: "Pictures", icon: Image, big: true }, { id: "shapes2", label: "Shapes", icon: Shapes, big: true }, { id: "icons", label: "Icons", icon: Smile, big: true }, { id: "chart", label: "Chart", icon: ChartColumn, big: true }]],
  Design: [[{ id: "theme1", label: "Office", icon: Palette, big: true }, { id: "theme2", label: "Ion", icon: Palette, big: true }, { id: "theme3", label: "Facet", icon: Palette, big: true }], [{ id: "designer2", label: "Designer", icon: Wand2, big: true }]],
  Transitions: [[{ id: "morph", label: "Morph", icon: ArrowRightLeft, big: true }, { id: "fade", label: "Fade", icon: Layers, big: true }, { id: "push", label: "Push", icon: Rows3, big: true }]],
  Animations: [[{ id: "a-fade", label: "Fade", icon: Layers, big: true }, { id: "a-fly", label: "Fly In", icon: Play, big: true }, { id: "a-wipe", label: "Wipe", icon: Rows3, big: true }], [{ id: "apane", label: "Animation Pane", icon: Layers, big: true }]],
  "Slide Show": [[{ id: "fromstart", label: "From Beginning", icon: Play, big: true }, { id: "presenter", label: "Presenter View", icon: MonitorPlay, big: true }], [{ id: "rehearse", label: "Rehearse with Coach", icon: Mic, big: true }, { id: "timings", label: "Rehearse Timings", icon: Timer, big: true }]],
  Review: [], View: [[{ id: "normal", label: "Normal", icon: Presentation, big: true }]],
};
const tabX = (n: string) => { let x = 14; for (const t of TAB_NAMES) { if (t === n) return x; x += t.length * 9.6 + 34; } return x; };
const tabW = (n: string) => n.length * 9.6 + 22;
const btnPos = (tab: string, id: string) => {
  let x = 16; const top = TB + TABS + 6;
  for (const g of RIBBON[tab] || []) { for (const [i, b] of g.entries()) if (b.id === id) return { x: x + i * 92 + 46, y: top + 30 }; x += g.length * 92 + 29; }
  return { x: 400, y: top + 30 };
};

/* ---------- slide model (1280×720 units) ---------- */
export type El = { id: string; kind: string; x: number; y: number; w: number; h: number; text?: string; items?: string[]; size?: number; color?: string; fill?: string; icon?: string; r?: number; hidden?: boolean; bold?: boolean; align?: string; values?: number[]; labels?: string[] };
export type Slide = { bg?: string; els: El[]; notes?: string };
const SW = 1067, SH = 600, SC = SW / 1280; // canvas size on screen
const canvas = () => ({ x: THUMB + (W - THUMB - SW) / 2, y: TOP + (H - TOP - STATUS - SH) / 2 });
const lerp = (a: number, b: number, k: number) => a + (b - a) * k;

const SlideView: React.FC<{ sl: Slide; scale: number; anim?: Record<string, number>; caret?: string }> = ({ sl, scale, anim, caret }) => {
  const f = useCurrentFrame();
  return (
    <div style={{ position: "absolute", left: 0, top: 0, width: 1280, height: 720, transform: `scale(${scale})`, transformOrigin: "0 0", background: sl.bg || "#fff", overflow: "hidden" }}>
      {sl.els.map((e) => { const a = anim?.[e.id] ?? (e.hidden ? 0 : 1); if (a <= 0) return null;
        const bn = /[ঀ-৿]/.test(e.text || (e.items || []).join(""));
        const base: React.CSSProperties = { position: "absolute", left: e.x, top: e.y + (1 - a) * 40, width: e.w, height: e.h, opacity: a, color: e.color || "#1F1F1F", fontFamily: bn ? BN : UI, fontSize: e.size || 28, fontWeight: e.bold || e.kind === "title" ? 700 : 400, textAlign: (e.align as any) || "left", lineHeight: 1.3 };
        if (e.kind === "shape") return <div key={e.id} style={{ ...base, background: e.fill || C.a, borderRadius: e.r ?? 16, display: "grid", placeItems: "center", color: e.color || "#fff" }}>{e.text}</div>;
        if (e.kind === "icon") return <div key={e.id} style={{ ...base, display: "grid", placeItems: "center", background: e.fill || "transparent", borderRadius: e.r ?? 999 }}><Icon name={e.icon || "star"} size={Math.min(e.w, e.h) * 0.6} color={e.color || C.a} /></div>;
        if (e.kind === "img") return <div key={e.id} style={{ ...base, background: e.fill || "linear-gradient(135deg,#F6C28B,#C43E1C)", borderRadius: e.r ?? 12, display: "grid", placeItems: "center", color: "#fff", fontSize: 26 }}>{e.text || "🖼"}</div>;
        if (e.kind === "chart") { const mx = Math.max(...(e.values || [1])) * 1.1; const n = (e.values || []).length; return <div key={e.id} style={{ ...base }}><svg width={e.w} height={e.h}>{(e.values || []).map((val, i) => { const bh = (val / mx) * (e.h - 40) * a; return <g key={i}><rect x={(e.w / n) * (i + 0.2)} y={e.h - 30 - bh} width={(e.w / n) * 0.6} height={bh} fill={e.fill || C.a} rx={4} /><text x={(e.w / n) * (i + 0.5)} y={e.h - 6} fontSize={20} textAnchor="middle" fill="#555">{e.labels?.[i]}</text></g>; })}</svg></div>; }
        if (e.kind === "bullets") return <div key={e.id} style={{ ...base }}>{(e.items || []).map((it, i) => <div key={i} style={{ display: "flex", gap: 14, marginBottom: 12 }}><span style={{ color: e.fill || C.a }}>■</span><span>{it}</span></div>)}</div>;
        return <div key={e.id} style={{ ...base, whiteSpace: "pre-wrap" }}>{e.text}{caret === e.id && <span style={{ display: "inline-block", width: 3, height: (e.size || 28) * 1.1, marginLeft: 2, verticalAlign: "middle", background: "#1F1F1F", opacity: Math.floor(f / 8) % 2 ? 1 : 0.2 }} />}</div>;
      })}
    </div>
  );
};

type PS = { slides: Slide[]; cur: number; tab: string; pressed?: string | null; sel?: string; caret?: string; o: Over; anim: Record<string, number>; morph?: { from: Slide; k: number };
  show?: { o: number; presenter?: boolean; t0: number }; keys?: { k: string[]; o: number }; call?: { el?: string; x?: number; y?: number; text: string; o: number }; zoom: { x: number; y: number; k: number }; cursor: { x: number; y: number; click: number }; bs?: { item?: string; o: number; pdf?: number; video?: boolean } };

function stateAt(p: P, f: number, fps: number): PS {
  const s = p.s;
  const st: PS = { slides: JSON.parse(JSON.stringify(s.slides || [{ els: [] }])), cur: s.cur || 0, tab: s.tab || "Home", o: { charts: [] }, anim: {}, zoom: { x: W / 2, y: H / 2, k: 1 }, cursor: { x: 900, y: 500, click: -99 }, pressed: null };
  let prev = { x: 900, y: 520 }, tgt = { x: 900, y: 520 }, c0 = 0, c1 = 0, zFrom = { x: W / 2, y: H / 2, k: 1 }, zTo = { ...zFrom }, zAt = -99;
  const elRect = (id: string) => { const c = canvas(); const e = st.slides[st.cur]?.els.find((x) => x.id === id); return e ? { x: c.x + e.x * SC, y: c.y + e.y * SC, w: e.w * SC, h: e.h * SC } : null; };
  const aim = (x: Step) => {
    if (x.el) { const r = elRect(x.el); if (r) return { x: r.x + Math.min(r.w * 0.4, 200), y: r.y + Math.min(r.h * 0.5, 40) }; }
    if (x.thumb !== undefined) return { x: 120, y: TOP + 30 + x.thumb * 140 + 50 };
    if (x.tabName) return { x: tabX(x.tabName) + tabW(x.tabName) / 2, y: TB + TABS / 2 + 2 };
    if (x.btn) return btnPos(x.tabFor || st.tab, x.btn);
    if (x.xy) return { x: x.xy[0], y: x.xy[1] };
    if (x.act === "ok" && st.o.dialog) return dialogBox(st.o.dialog.rows.length).ok;
    if (x.act === "ask") return { x: W - PANE_W / 2, y: H - STATUS - 70 };
    return null;
  };
  for (const step of (s.steps || []) as Step[]) {
    const t0 = v(p, step.at); if (f < t0 - 14) break;
    const t = aim(step);
    if (t && ["select", "click", "tab", "type", "goto", "backstage", "pdf", "ok", "ask", "move", "set"].includes(step.act) && !(step.act === "set" && !step.el)) { prev = { ...tgt }; c0 = t0 - 14; c1 = t0; tgt = t; }
    if (f < t0) continue;
    const sl = () => st.slides[st.cur]; const el = (id: string) => sl()?.els.find((e) => e.id === id);
    switch (step.act) {
      case "tab": st.tab = step.tabName; st.cursor.click = t0; break;
      case "click": st.cursor.click = t0; st.pressed = f < t0 + 10 ? step.btn : null; break;
      case "select": st.sel = step.el; st.cursor.click = t0; break;
      case "unselect": st.sel = undefined; break;
      case "addslide": st.slides.splice(step.index ?? st.slides.length, 0, step.slide || { els: [] }); st.cur = step.index ?? st.slides.length - 1; st.cursor.click = t0; break;
      case "goto": { const from = sl(); st.cur = step.slide; st.cursor.click = t0; st.morph = step.morph ? { from, k: interpolate(f, [t0, t0 + (step.dur ?? 36)], [0, 1], { ...clamp, easing: Easing.inOut(Easing.cubic) }) } : undefined; break; }
      case "type": { let e = el(step.el); if (!e) { e = { id: step.el, kind: "text", x: 100, y: 200, w: 1080, h: 120, text: "", ...(step.new || {}) }; sl().els.push(e); }
        const d = step.dur ?? Math.max(18, step.text.length * 1.4); const n = Math.round(step.text.length * Math.min(1, (f - t0) / d));
        e.text = (e.text || "") + step.text.slice(0, n); st.caret = n < step.text.length ? e.id : undefined; st.sel = e.id; break; }
      case "set": { // change one element (glides over `dur` frames) or the slide background / several elements (design idea)
        const k = interpolate(f, [t0, t0 + (step.dur ?? 24)], [0, 1], { ...clamp, easing: ease });
        if (step.bg && k > 0.5) sl().bg = step.bg;
        for (const [id, patch] of Object.entries(step.els || (step.el ? { [step.el]: step.set } : {})) as [string, Partial<El>][]) {
          let e = el(id); if (!e) { e = { id, kind: "shape", x: 0, y: 0, w: 100, h: 100, hidden: true, ...patch } as El; sl().els.push(e); }
          for (const [kk, val] of Object.entries(patch)) { const cur0 = (e as any)[kk]; (e as any)[kk] = typeof val === "number" && typeof cur0 === "number" ? lerp(cur0, val, k) : (k > 0.5 ? val : cur0); }
        }
        break; }
      case "anim": { // entrance animation of hidden elements, one after another
        (step.els || [step.el]).forEach((id: string, i: number) => { st.anim[id] = interpolate(f, [t0 + i * (step.gap ?? 14), t0 + i * (step.gap ?? 14) + 14], [0, 1], clamp); }); break; }
      case "reveal": for (const id of step.els || [step.el]) { const e = el(id); if (e) e.hidden = false; } break;
      case "show": st.show = { o: interpolate(f, [t0, t0 + 10], [0, 1], clamp), presenter: step.presenter, t0 }; break;
      case "endshow": st.show = undefined; break;
      case "keys": st.keys = { k: step.keys, o: fadeIO(f, t0, step.len ?? 60) }; break;
      case "call": st.call = { el: step.el, x: step.x, y: step.y, text: step.text, o: fadeIO(f, t0, step.len ?? 110) }; break;
      case "zoom": { zFrom = { ...zTo }; const r = step.el ? elRect(step.el) : null; zTo = r ? { x: r.x + r.w / 2, y: r.y + r.h / 2, k: step.k ?? 1.5 } : { x: step.x ?? W / 2, y: step.y ?? H / 2, k: step.k ?? 1.5 }; zAt = t0; break; }
      case "unzoom": zFrom = { ...zTo }; zTo = { x: W / 2, y: H / 2, k: 1 }; zAt = t0; break;
      case "backstage": st.bs = { item: step.item, o: interpolate(f, [t0, t0 + 10], [0, 1], clamp), video: step.video }; break;
      case "pdf": st.bs = { ...(st.bs || { o: 1 }), item: "Export", pdf: interpolate(f, [t0, t0 + 12], [0, 1], clamp) }; break;
      case "closebs": st.bs = undefined; break;
      default: overStep(st.o, step, f, t0, (x) => aim(x));
    }
  }
  const cm = interpolate(f, [c0, Math.max(c1, c0 + 1)], [0, 1], { ...clamp, easing: Easing.inOut(Easing.cubic) });
  st.cursor.x = prev.x + (tgt.x - prev.x) * cm; st.cursor.y = prev.y + (tgt.y - prev.y) * cm;
  const zk = interpolate(f, [zAt, zAt + 24], [0, 1], { ...clamp, easing: ease });
  st.zoom = { x: zFrom.x + (zTo.x - zFrom.x) * zk, y: zFrom.y + (zTo.y - zFrom.y) * zk, k: zFrom.k + (zTo.k - zFrom.k) * zk };
  return st;
}

/** Morph: elements with the same id glide from the previous slide's place to the new one. */
const morphSlide = (from: Slide, to: Slide, k: number): Slide => ({ bg: k < 0.5 ? from.bg : to.bg, els: [
  ...to.els.map((e) => { const a = from.els.find((x) => x.id === e.id); if (!a) return { ...e, hidden: false, x: e.x, y: e.y } as El & { _o?: number };
    return { ...e, x: lerp(a.x, e.x, k), y: lerp(a.y, e.y, k), w: lerp(a.w, e.w, k), h: lerp(a.h, e.h, k), size: lerp(a.size || 28, e.size || 28, k), r: lerp(a.r ?? 16, e.r ?? 16, k), fill: k < 0.5 ? a.fill : e.fill }; }),
] });

export const SPpt: React.FC<P> = (p) => {
  const f = useCurrentFrame(); const { fps } = useVideoConfig(); const st = stateAt(p, f, fps); const z = st.zoom, k = z.k;
  const cx = Math.min(0, Math.max(W - W * k, W / 2 - z.x * k)), cy = Math.min(0, Math.max(H - H * k, H / 2 - z.y * k));
  const c = canvas(); const cur = st.slides[st.cur] || { els: [] };
  const view = st.morph && st.morph.k < 1 ? morphSlide(st.morph.from, cur, st.morph.k) : cur;
  const anim: Record<string, number> = { ...st.anim }; if (st.morph && st.morph.k < 1) for (const e of cur.els) if (!st.morph.from.els.find((x) => x.id === e.id)) anim[e.id] = st.morph.k;
  const selE = st.sel ? cur.els.find((e) => e.id === st.sel) : undefined;
  let cp: { x: number; y: number } | null = null;
  if (st.call) { const e = st.call.el ? cur.els.find((x) => x.id === st.call!.el) : undefined; cp = e ? { x: c.x + (e.x + e.w) * SC * 0.8, y: c.y + (e.y + e.h) * SC + 10 } : { x: st.call.x ?? 900, y: st.call.y ?? 400 }; }
  return (
    <AbsoluteFill>
      <div style={{ position: "absolute", left: 40, top: 26, width: W, height: H, overflow: "hidden", borderRadius: 10, boxShadow: "0 30px 80px rgba(60,20,10,.22), 0 0 0 1px rgba(0,0,0,.08)" }}>
        <div style={{ position: "absolute", left: 0, top: 0, width: W, height: H, transform: `translate(${cx}px, ${cy}px) scale(${k})`, transformOrigin: "0 0", background: "#fff", fontFamily: UI }}>
          <div style={{ position: "absolute", left: 0, right: 0, top: 0, height: TB, background: C.a, color: "#fff", display: "flex", alignItems: "center", gap: 18, padding: "0 16px" }}>
            <div style={{ width: 26, height: 26, borderRadius: 5, background: "#fff", color: C.a, display: "grid", placeItems: "center", fontWeight: 800, fontSize: 17 }}>P</div><Save size={18} color="#fff" /><Undo2 size={18} color="#fff" /><Redo2 size={18} color="#fff" />
            <div style={{ flex: 1, textAlign: "center", fontSize: 15.5 }}>{p.s.file || p.spec.file} - PowerPoint</div><div style={{ display: "flex", gap: 26 }}><Minus size={18} color="#fff" /><Square size={15} color="#fff" /><X size={18} color="#fff" /></div>
          </div>
          <div style={{ position: "absolute", left: 0, right: 0, top: TB, height: TABS, background: C.rib }}>
            {TAB_NAMES.map((t) => <div key={t} style={{ position: "absolute", left: tabX(t), bottom: 0, width: tabW(t), height: 32, display: "grid", placeItems: "center", fontSize: 15, color: t === "File" ? "#fff" : t === st.tab ? C.a2 : C.ink, background: t === "File" ? C.a : "transparent", fontWeight: t === st.tab ? 600 : 400, borderBottom: t === st.tab ? `3px solid ${C.a}` : "3px solid transparent" }}>{t}</div>)}
          </div>
          <div style={{ position: "absolute", left: 0, right: 0, top: TB + TABS, height: RIB, background: C.rib, borderBottom: `1px solid ${C.line}`, display: "flex", padding: "6px 16px 18px", gap: 14 }}>
            {(RIBBON[st.tab] || []).map((g, gi) => <div key={gi} style={{ display: "flex", borderRight: `1px solid ${C.line}`, paddingRight: 14 }}>{g.map((b) => <div key={b.id} style={{ width: 92, display: "flex", flexDirection: "column", alignItems: "center", gap: 4, borderRadius: 6, paddingTop: 6, background: st.pressed === b.id ? "#F4CDBF" : "transparent" }}><b.icon size={30} color={C.a} strokeWidth={1.7} /><span style={{ fontSize: 13, color: C.ink, textAlign: "center", lineHeight: 1.15 }}>{b.label}</span></div>)}</div>)}
          </div>
          {/* work area */}
          <div style={{ position: "absolute", left: 0, right: 0, top: TOP, bottom: STATUS, background: C.desk }} />
          <div style={{ position: "absolute", left: 0, top: TOP, width: THUMB, bottom: STATUS, background: "#F3F3F3", borderRight: `1px solid ${C.line}` }}>
            {st.slides.slice(0, 5).map((sl, i) => <div key={i} style={{ position: "absolute", left: 34, top: 30 + i * 140, width: 180, height: 101, outline: i === st.cur ? `3px solid ${C.a}` : "1px solid #C8C8C8", background: "#fff", overflow: "hidden" }}>
              <SlideView sl={sl} scale={180 / 1280} /><span style={{ position: "absolute", left: -24, top: 0, fontSize: 14, color: C.mute }}>{i + 1}</span></div>)}
          </div>
          <div style={{ position: "absolute", left: c.x, top: c.y, width: SW, height: SH, boxShadow: "0 2px 12px rgba(0,0,0,.18)", overflow: "hidden" }}><SlideView sl={view} scale={SC} anim={anim} caret={st.caret} /></div>
          {selE && <div style={{ position: "absolute", left: c.x + selE.x * SC - 4, top: c.y + selE.y * SC - 4, width: selE.w * SC + 8, height: selE.h * SC + 8, border: "1.5px solid #5A5A5A", pointerEvents: "none" }} />}
          <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: STATUS, background: "#F3F3F3", display: "flex", alignItems: "center", gap: 30, padding: "0 16px", fontSize: 13.5, color: C.mute }}><span>Slide {st.cur + 1} of {st.slides.length}</span><span style={{ marginLeft: "auto" }}>Notes</span><span>100%</span></div>
          <Overlays o={st.o} accent={C.a} top={TOP} bottom={STATUS} />
          {st.bs && <Backstage b={st.bs} color={C.a} color2={C.a2} video={!!st.bs.video} />}
          {st.show && (st.show.presenter ? (
            <div style={{ position: "absolute", inset: 0, background: "#1E1E1E", opacity: st.show.o, zIndex: 45, color: "#fff", fontFamily: UI }}>
              <div style={{ position: "absolute", left: 40, top: 30, fontSize: 28, fontFamily: "Consolas, monospace" }}>{(() => { const sec = Math.max(0, Math.floor((f - st.show!.t0) / fps)); return `0:${String(Math.floor(sec / 60)).padStart(2, "0")}:${String(sec % 60).padStart(2, "0")}`; })()}</div>
              <div style={{ position: "absolute", left: 40, top: 90, width: 1060, height: 596, overflow: "hidden" }}><SlideView sl={view} scale={1060 / 1280} anim={anim} /></div>
              <div style={{ position: "absolute", left: 1140, top: 90, fontSize: 18, color: "#BBB" }}>Next slide</div>
              <div style={{ position: "absolute", left: 1140, top: 120, width: 640, height: 360, overflow: "hidden", opacity: 0.85 }}>{st.slides[st.cur + 1] && <SlideView sl={st.slides[st.cur + 1]} scale={640 / 1280} />}</div>
              <div style={{ position: "absolute", left: 1140, top: 510, width: 640, fontFamily: BN, fontSize: 24, lineHeight: 1.5, color: "#EEE" }}>{cur.notes || ""}</div>
            </div>) : (
            <div style={{ position: "absolute", inset: 0, background: "#000", opacity: st.show.o, zIndex: 45 }}><div style={{ position: "absolute", left: (W - 1564) / 2, top: 0, width: 1564, height: 880, overflow: "hidden" }}><SlideView sl={view} scale={1564 / 1280} anim={anim} /></div></div>))}
          {st.call && cp && <Callout x={cp.x} y={cp.y} o={st.call.o} text={st.call.text} />}
          {!st.show && <Cursor x={st.cursor.x} y={st.cursor.y} click={st.cursor.click} />}
        </div>
      </div>
      {st.keys && <KeyChips keys={st.keys.k} o={st.keys.o} />}
    </AbsoluteFill>
  );
};
