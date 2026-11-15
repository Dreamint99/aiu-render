// অফিস মাস্টারক্লাস — Word look-alike "screen share" scene (scene type "word"), same spirit as ExcelEngine (2026-11-15).
// A document page with blocks (title/h1/h2/p/bullet/table/sign), typing, style changes, selection, header/footer, page numbers,
// Navigation pane (kit Pane), Mail Merge fields «Name» with Preview Results, File → Export → PDF, Copilot pane, callouts, zoom.
import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame, Easing } from "remotion";
import { Clipboard, Bold, Italic, Underline, Type, Search, Table, Image, PanelTop, PanelBottom, Hash, Mail, Users, Braces, Eye, Send, Palette, Ruler, RectangleHorizontal, ListTree, Sparkles, Save, Undo2, Redo2, Minus, Square, X, AlignLeft, AlignCenter, List } from "lucide-react";
import { P, Step, W, H, UI, BN, clamp, ease, v, fadeIO, Cursor, KeyChips, Callout, Over, overStep, Overlays, Backstage, PANE_W, dialogBox } from "./kit";

const C = { a: "#185ABD", a2: "#103F91", ink: "#1F1F1F", mute: "#5F6368", line: "#D9D9D9", rib: "#F8F8F8", desk: "#E9EBEF" };
const TB = 46, TABS = 40, RIB = 104, STATUS = 28, TOP = TB + TABS + RIB;
const TAB_NAMES = ["File", "Home", "Insert", "Design", "Layout", "References", "Mailings", "Review", "View"];
type Btn = { id: string; label: string; icon: React.FC<any>; big?: boolean };
const RIBBON: Record<string, Btn[][]> = {
  Home: [[{ id: "paste", label: "Paste", icon: Clipboard, big: true }], [{ id: "bold", label: "Bold", icon: Bold }, { id: "italic", label: "Italic", icon: Italic }, { id: "underline", label: "Underline", icon: Underline }, { id: "grow", label: "Grow Font", icon: Type }, { id: "bullets", label: "Bullets", icon: List }, { id: "center", label: "Center", icon: AlignCenter }],
    [{ id: "s-normal", label: "Normal", icon: AlignLeft, big: true }, { id: "s-title", label: "Title", icon: Type, big: true }, { id: "s-h1", label: "Heading 1", icon: Type, big: true }, { id: "s-h2", label: "Heading 2", icon: Type, big: true }], [{ id: "find", label: "Find", icon: Search, big: true }], [{ id: "copilot", label: "Copilot", icon: Sparkles, big: true }]],
  Insert: [[{ id: "table", label: "Table", icon: Table, big: true }, { id: "pictures", label: "Pictures", icon: Image, big: true }], [{ id: "header", label: "Header", icon: PanelTop, big: true }, { id: "footer", label: "Footer", icon: PanelBottom, big: true }, { id: "pagenum", label: "Page Number", icon: Hash, big: true }]],
  Design: [[{ id: "themes", label: "Themes", icon: Palette, big: true }]],
  Layout: [[{ id: "margins", label: "Margins", icon: Ruler, big: true }, { id: "orient", label: "Orientation", icon: RectangleHorizontal, big: true }]],
  References: [[{ id: "toc", label: "Table of Contents", icon: ListTree, big: true }]],
  Mailings: [[{ id: "startmm", label: "Start Mail Merge", icon: Mail, big: true }, { id: "recipients", label: "Select Recipients", icon: Users, big: true }], [{ id: "field", label: "Insert Merge Field", icon: Braces, big: true }], [{ id: "preview", label: "Preview Results", icon: Eye, big: true }], [{ id: "finish", label: "Finish & Merge", icon: Send, big: true }]],
  Review: [], View: [[{ id: "nav", label: "Navigation Pane", icon: ListTree, big: true }]],
};
const tabX = (n: string) => { let x = 14; for (const t of TAB_NAMES) { if (t === n) return x; x += t.length * 9.6 + 34; } return x; };
const tabW = (n: string) => n.length * 9.6 + 22;
const btnPos = (tab: string, id: string) => {
  let x = 16; const top = TB + TABS + 6;
  for (const g of RIBBON[tab] || []) {
    const big = g.filter((b) => b.big), small = g.filter((b) => !b.big);
    for (const [i, b] of big.entries()) if (b.id === id) return { x: x + i * 92 + 46, y: top + 30 };
    for (const [j, b] of small.entries()) if (b.id === id) return { x: x + big.length * 92 + Math.floor(j / 3) * 150 + 60, y: top + (j % 3) * 26 + 13 };
    x += big.length * 92 + Math.ceil(small.length / 3) * 150 + 29;
  }
  return { x: 400, y: top + 30 };
};
const Ribbon: React.FC<{ tab: string; pressed?: string | null }> = ({ tab, pressed }) => (
  <div style={{ position: "absolute", left: 0, right: 0, top: TB + TABS, height: RIB, background: C.rib, borderBottom: `1px solid ${C.line}`, display: "flex", padding: "6px 16px 18px", gap: 14, fontFamily: UI }}>
    {(RIBBON[tab] || []).map((g, gi) => { const big = g.filter((b) => b.big), small = g.filter((b) => !b.big); return (
      <div key={gi} style={{ display: "flex", borderRight: `1px solid ${C.line}`, paddingRight: 14 }}>
        {big.map((b) => <div key={b.id} style={{ width: 92, display: "flex", flexDirection: "column", alignItems: "center", gap: 4, borderRadius: 6, paddingTop: 6, background: pressed === b.id ? "#C7D7F2" : "transparent" }}><b.icon size={30} color={C.a} strokeWidth={1.7} /><span style={{ fontSize: 13, color: C.ink, textAlign: "center", lineHeight: 1.15 }}>{b.label}</span></div>)}
        {small.length > 0 && <div style={{ display: "grid", gridTemplateRows: "repeat(3, 26px)", gridAutoFlow: "column", gridAutoColumns: 150 }}>{small.map((b) => <div key={b.id} style={{ display: "flex", alignItems: "center", gap: 7, fontSize: 13.5, padding: "0 6px", borderRadius: 4, background: pressed === b.id ? "#C7D7F2" : "transparent" }}><b.icon size={17} color={C.ink} />{b.label}</div>)}</div>}
      </div>); })}
  </div>
);

/* ---------- document model ---------- */
export type Block = { id: string; kind: string; text?: string; rows?: string[][]; align?: string; bold?: boolean; hl?: string };
const KIND: Record<string, { size: number; weight: number; color: string; lh: number; gap: number }> = {
  title: { size: 48, weight: 300, color: "#1F1F1F", lh: 1.25, gap: 14 }, h1: { size: 33, weight: 600, color: "#1F4E9A", lh: 1.3, gap: 10 }, h2: { size: 27, weight: 600, color: "#2F5597", lh: 1.3, gap: 8 },
  p: { size: 24, weight: 400, color: "#1F1F1F", lh: 1.55, gap: 10 }, bullet: { size: 24, weight: 400, color: "#1F1F1F", lh: 1.5, gap: 4 }, sign: { size: 24, weight: 600, color: "#1F1F1F", lh: 1.5, gap: 10 },
};
const PAGE_W = 1040, PAD = 80;
const blockH = (b: Block) => {
  if (b.kind === "table") return (b.rows?.length || 1) * 40 + 18;
  const k = KIND[b.kind] || KIND.p; const per = Math.floor((PAGE_W - PAD * 2 - (b.kind === "bullet" ? 28 : 0)) / (k.size * 0.52));
  const lines = Math.max(1, (b.text || " ").split("\n").reduce((n, l) => n + Math.max(1, Math.ceil(l.length / per)), 0));
  return lines * k.size * k.lh + k.gap;
};
const merge = (t: string, rec?: Record<string, string>) => t.split(/(«[^»]+»)/).map((part, i) => {
  const m = part.match(/^«([^»]+)»$/); if (!m) return <React.Fragment key={i}>{part}</React.Fragment>;
  return rec ? <b key={i} style={{ background: "#FFF4C2" }}>{rec[m[1]] ?? part}</b> : <span key={i} style={{ background: "#E3E3E3", padding: "0 2px" }}>{part}</span>;
});

type WS = { blocks: Block[]; tab: string; pressed?: string | null; sel?: string; caret?: string; scroll: number; header?: string; footer?: string; pagenum?: boolean; rec?: Record<string, string>; o: Over;
  keys?: { k: string[]; o: number }; call?: { block?: string; x?: number; y?: number; text: string; o: number }; zoom: { x: number; y: number; k: number }; cursor: { x: number; y: number; click: number }; bs?: { item?: string; o: number; pdf?: number }; flash?: { id: string; at: number } };

function layout(st: WS, navW: number) {
  const px = navW + (W - navW - PAGE_W) / 2; let y = TOP + 30 + 60 - st.scroll; const pos: Record<string, { x: number; y: number; w: number; h: number }> = {};
  for (const b of st.blocks) { const h = blockH(b); pos[b.id] = { x: px + PAD, y, w: PAGE_W - PAD * 2, h }; y += h; }
  return { px, pos, bottom: y };
}

function stateAt(p: P, f: number): WS {
  const s = p.s;
  const st: WS = { blocks: JSON.parse(JSON.stringify(s.blocks || [])), tab: s.tab || "Home", scroll: s.scroll || 0, header: s.header, footer: s.footer, pagenum: s.pagenum, o: { charts: [] }, zoom: { x: W / 2, y: H / 2, k: 1 }, cursor: { x: 900, y: 500, click: -99 }, pressed: null };
  let prev = { x: 900, y: 520 }, tgt = { x: 900, y: 520 }, c0 = 0, c1 = 0, zFrom = { x: W / 2, y: H / 2, k: 1 }, zTo = { ...zFrom }, zAt = -99;
  const navW = () => (st.o.pane && st.o.pane.side === "left" ? PANE_W : 0);
  const aim = (x: Step) => {
    if (x.block) { const L = layout(st, navW()).pos[x.block]; if (L) return { x: L.x + Math.min(L.w, 260), y: L.y + 18 }; }
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
    if (t && ["select", "click", "tab", "type", "style", "backstage", "pdf", "ok", "ask", "move"].includes(step.act)) { prev = { ...tgt }; c0 = t0 - 14; c1 = t0; tgt = t; }
    if (f < t0) continue;
    const blk = (id: string) => st.blocks.find((b) => b.id === id);
    switch (step.act) {
      case "tab": st.tab = step.tabName; st.cursor.click = t0; break;
      case "click": st.cursor.click = t0; st.pressed = f < t0 + 10 ? step.btn : null; break;
      case "select": st.sel = step.block; st.cursor.click = t0; break;
      case "unselect": st.sel = undefined; break;
      case "type": { // append text into a block (created when missing)
        let b = blk(step.block); if (!b) { b = { id: step.block, kind: step.kind || "p", text: "" }; const i = step.after ? st.blocks.findIndex((x) => x.id === step.after) + 1 : st.blocks.length; st.blocks.splice(i || st.blocks.length, 0, b); }
        const d = step.dur ?? Math.max(18, step.text.length * 1.4); const n = Math.round(step.text.length * Math.min(1, (f - t0) / d));
        b.text = (b.text || "") + step.text.slice(0, n); if (n < step.text.length) st.caret = b.id; else st.caret = undefined; st.sel = undefined; break; }
      case "style": { const b = blk(step.block); if (b) { Object.assign(b, step.set || { kind: step.kind }); st.flash = { id: b.id, at: t0 }; } st.cursor.click = t0; break; }
      case "set": { const b = blk(step.block); if (b) Object.assign(b, step.set); else st.blocks.push({ id: step.block, ...step.set }); break; }
      case "remove": st.blocks = st.blocks.filter((b) => b.id !== step.block); break;
      case "hf": if (step.header !== undefined) st.header = step.header; if (step.footer !== undefined) st.footer = step.footer; if (step.pagenum !== undefined) st.pagenum = step.pagenum; break;
      case "scroll": st.scroll = (step.from ?? st.scroll) + ((step.to ?? 0) - (step.from ?? st.scroll)) * interpolate(f, [t0, t0 + 24], [0, 1], { ...clamp, easing: ease }); break;
      case "preview": st.rec = step.rec || undefined; break;
      case "keys": { const L = step.len ?? 60; st.keys = { k: step.keys, o: fadeIO(f, t0, L) }; break; }
      case "call": st.call = { block: step.block, x: step.x, y: step.y, text: step.text, o: fadeIO(f, t0, step.len ?? 110) }; break;
      case "zoom": { zFrom = { ...zTo }; const L = step.block ? layout(st, navW()).pos[step.block] : null; zTo = L ? { x: L.x + L.w / 2, y: L.y + L.h / 2, k: step.k ?? 1.6 } : { x: step.x ?? W / 2, y: step.y ?? H / 2, k: step.k ?? 1.6 }; zAt = t0; break; }
      case "unzoom": zFrom = { ...zTo }; zTo = { x: W / 2, y: H / 2, k: 1 }; zAt = t0; break;
      case "backstage": st.bs = { item: step.item, o: interpolate(f, [t0, t0 + 10], [0, 1], clamp) }; break;
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

const Doc: React.FC<{ st: WS }> = ({ st }) => {
  const f = useCurrentFrame(); const navW = st.o.pane && st.o.pane.side === "left" ? PANE_W : 0; const L = layout(st, navW);
  const pageTop = TOP + 30 - st.scroll, pageH = Math.max(1100, L.bottom - pageTop + 160);
  return (
    <div style={{ position: "absolute", left: 0, right: 0, top: TOP, bottom: STATUS, overflow: "hidden", background: C.desk }}>
      <div style={{ position: "absolute", left: 0, top: -TOP, width: W, height: H }}>
        <div style={{ position: "absolute", left: L.px, top: pageTop, width: PAGE_W, height: pageH, background: "#fff", boxShadow: "0 2px 10px rgba(0,0,0,.15)" }}>
          {st.header && <div style={{ position: "absolute", left: PAD, right: PAD, top: 22, fontSize: 15, color: C.mute, borderBottom: "1px dashed #C9C9C9", paddingBottom: 6, fontFamily: /[ঀ-৿]/.test(st.header) ? BN : UI }}>{st.header}</div>}
          {(st.footer || st.pagenum) && <div style={{ position: "absolute", left: PAD, right: PAD, top: 1030, fontSize: 15, color: C.mute, display: "flex", justifyContent: "space-between", borderTop: "1px dashed #C9C9C9", paddingTop: 6, fontFamily: BN }}><span>{st.footer}</span><span>{st.pagenum ? "Page 1 of 1" : ""}</span></div>}
        </div>
        {st.blocks.map((b) => { const r = L.pos[b.id]; const k = KIND[b.kind] || KIND.p; const sel = st.sel === b.id; const fl = st.flash && st.flash.id === b.id ? interpolate(f, [st.flash.at, st.flash.at + 20], [1, 0], clamp) : 0;
          const font = /[ঀ-৿]/.test(b.text || JSON.stringify(b.rows || "")) ? BN : UI;
          return (
            <div key={b.id} style={{ position: "absolute", left: r.x, top: r.y, width: r.w, fontFamily: font, fontSize: k.size, fontWeight: b.bold ? 700 : k.weight, color: k.color, lineHeight: k.lh, textAlign: (b.align as any) || "left", background: sel ? "rgba(24,90,189,.16)" : fl ? `rgba(255,214,0,${0.4 * fl})` : b.hl || "transparent", whiteSpace: "pre-wrap", borderBottom: b.kind === "title" ? "2px solid #185ABD" : undefined, paddingBottom: b.kind === "title" ? 6 : 0 }}>
              {b.kind === "table" ? <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 21, fontFamily: font }}><tbody>{(b.rows || []).map((row, ri) => <tr key={ri} style={{ background: ri === 0 ? "#185ABD" : ri % 2 ? "#fff" : "#EEF3FB", color: ri === 0 ? "#fff" : C.ink }}>{row.map((c, ci) => <td key={ci} style={{ border: "1px solid #B4C6E7", padding: "8px 10px", fontWeight: ri === 0 ? 600 : 400 }}>{merge(c, st.rec)}</td>)}</tr>)}</tbody></table>
                : <>{b.kind === "bullet" && <span style={{ marginRight: 12 }}>•</span>}{merge(b.text || "", st.rec)}{st.caret === b.id && <span style={{ display: "inline-block", width: 2, height: k.size, background: C.ink, marginLeft: 1, verticalAlign: "middle", opacity: Math.floor(f / 8) % 2 ? 1 : 0.2 }} />}</>}
            </div>); })}
      </div>
    </div>
  );
};

export const SWord: React.FC<P> = (p) => {
  const f = useCurrentFrame(); const st = stateAt(p, f); const z = st.zoom, k = z.k;
  const cx = Math.min(0, Math.max(W - W * k, W / 2 - z.x * k)), cy = Math.min(0, Math.max(H - H * k, H / 2 - z.y * k));
  const navW = st.o.pane && st.o.pane.side === "left" ? PANE_W : 0; const L = layout(st, navW);
  let cp: { x: number; y: number } | null = null; if (st.call) cp = st.call.block && L.pos[st.call.block] ? { x: L.pos[st.call.block].x + L.pos[st.call.block].w * 0.55, y: L.pos[st.call.block].y + L.pos[st.call.block].h + 8 } : { x: st.call.x ?? 900, y: st.call.y ?? 400 };
  return (
    <AbsoluteFill>
      <div style={{ position: "absolute", left: 40, top: 26, width: W, height: H, overflow: "hidden", borderRadius: 10, boxShadow: "0 30px 80px rgba(16,30,60,.25), 0 0 0 1px rgba(0,0,0,.08)" }}>
        <div style={{ position: "absolute", left: 0, top: 0, width: W, height: H, transform: `translate(${cx}px, ${cy}px) scale(${k})`, transformOrigin: "0 0", background: "#fff", fontFamily: UI }}>
          <div style={{ position: "absolute", left: 0, right: 0, top: 0, height: TB, background: C.a, color: "#fff", display: "flex", alignItems: "center", gap: 18, padding: "0 16px" }}>
            <div style={{ width: 26, height: 26, borderRadius: 5, background: "#fff", color: C.a, display: "grid", placeItems: "center", fontWeight: 800, fontSize: 17 }}>W</div><Save size={18} color="#fff" /><Undo2 size={18} color="#fff" /><Redo2 size={18} color="#fff" />
            <div style={{ flex: 1, textAlign: "center", fontSize: 15.5 }}>{p.s.file || p.spec.file} - Word</div><div style={{ display: "flex", gap: 26 }}><Minus size={18} color="#fff" /><Square size={15} color="#fff" /><X size={18} color="#fff" /></div>
          </div>
          <div style={{ position: "absolute", left: 0, right: 0, top: TB, height: TABS, background: C.rib }}>
            {TAB_NAMES.map((t) => <div key={t} style={{ position: "absolute", left: tabX(t), bottom: 0, width: tabW(t), height: 32, display: "grid", placeItems: "center", fontSize: 15, color: t === "File" ? "#fff" : t === st.tab ? C.a2 : C.ink, background: t === "File" ? C.a : "transparent", fontWeight: t === st.tab ? 600 : 400, borderBottom: t === st.tab ? `3px solid ${C.a}` : "3px solid transparent" }}>{t}</div>)}
          </div>
          <Ribbon tab={st.tab} pressed={st.pressed} />
          <Doc st={st} />
          <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: STATUS, background: "#F3F3F3", display: "flex", alignItems: "center", gap: 30, padding: "0 16px", fontSize: 13.5, color: C.mute }}><span>Page 1 of 1</span><span>{st.blocks.reduce((n, b) => n + (b.text || "").split(/\s+/).filter(Boolean).length, 0)} words</span><span style={{ marginLeft: "auto" }}>100%</span></div>
          <Overlays o={st.o} accent={C.a} top={TOP} bottom={STATUS} />
          {st.bs && <Backstage b={st.bs} color={C.a} color2={C.a2} />}
          {st.call && cp && <Callout x={cp.x} y={cp.y} o={st.call.o} text={st.call.text} />}
          <Cursor x={st.cursor.x} y={st.cursor.y} click={st.cursor.click} />
        </div>
      </div>
      {st.keys && <KeyChips keys={st.keys.k} o={st.keys.o} />}
    </AbsoluteFill>
  );
};
