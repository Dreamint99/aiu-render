// AI University অফিস মাস্টারক্লাস — Excel "screen share" lesson engine (2026-11-15).
// Draws an Excel-like window (title bar, ribbon tabs + buttons, name box, formula bar, grid, sheet tabs, status bar) and plays a
// timeline of actions over the Bangla VO: cursor moves + clicks, typing into the formula bar, Enter → computed value, fill handle,
// range highlight, ribbon tab switch, key-chip overlays (Ctrl+E), Bangla callouts, camera zoom, File backstage → Export → PDF.
// Cell values of formulas come from the spec (`v`) and are VERIFIED by scripts/office_make.py (formulajs) before any VO spend.
// Scenes: title · excel · quizQ · quizA · recap · outro
import React from "react";
import { AbsoluteFill, Audio, Img, Sequence, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig, Easing, delayRender, continueRender } from "remotion";
import {
  Clipboard, Scissors, Copy, Bold, Italic, PaintBucket, Baseline, WrapText, TableCellsMerge, Percent, DollarSign, Palette, Table, Sigma, ArrowDownAZ, ArrowDownZA,
  Search, ChartColumn, ChartLine, ChartPie, Image, Filter, WandSparkles, Columns3, CopyMinus, ListChecks, SquareFunction, Calculator, Calendar, Database, RefreshCw,
  FileText, Save, Printer, Share2, FileOutput, FilePlus, FolderOpen, Info, Undo2, Redo2, ChevronDown, Minus, Square, X, Lightbulb, TextCursorInput,
  Snowflake, Sparkles, Eye, Grid3x3, SquareCheck, PanelsTopLeft, Brain,
} from "lucide-react";
import { Over, overStep, Overlays, PANE_W, dialogBox, SPoints } from "./kit";
import { SWord } from "./WordEngine";
import { SPpt } from "./PptEngine";

const X_ = { green: "#107C41", green2: "#0B5A2F", greenSoft: "#E6F2EA", sel: "#217346", ink: "#1F1F1F", mute: "#5F6368", grid: "#E1E1E1", head: "#F3F3F3", headOn: "#D2E8D9", win: "#FFFFFF", ribbon: "#F8F8F8", line: "#D9D9D9", desk: "#E8EEF2", call: "#FFE58A", signal: "#FF5A1F" };
const BN = "Anek", UI = "'Segoe UI', 'Segoe UI Variable', Arial, sans-serif";
if (typeof document !== "undefined") {
  const h = delayRender("font Anek");
  const f = new FontFace("Anek", `url(${staticFile("fonts/AnekBangla.ttf")})`, { weight: "100 900" });
  f.load().then(() => { document.fonts.add(f); continueRender(h); }).catch(() => continueRender(h));
}
const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const ease = Easing.bezier(0.16, 1, 0.3, 1);
const bn = (n: number | string) => String(n).replace(/\d/g, (d) => "০১২৩৪৫৬৭৮৯"[+d]);
const pop = (f: number, fps: number, d: number) => spring({ frame: f - d, fps, config: { damping: 14, mass: 0.6 } });

export type Step = { at: number; act: string; [k: string]: any };
export type Scene = { type: string; vo: string; frames: number; hold?: number; [k: string]: any };
export type Spec = { id: string; course: string; lessonNo: string; title: string; next: string; file: string; scenes: Scene[] };
const LEAD = 12, TAIL = 18;
const sceneLen = (s: Scene) => LEAD + s.frames + (s.hold || 0) + TAIL;
export const officeLen = (spec: Spec) => spec.scenes.reduce((n, s) => n + sceneLen(s), 0) + 30;
type P = { s: Scene; spec: Spec; vo: number };
const v = (p: P, x: number) => LEAD + p.vo * x;

/* ---------------- geometry (window-local coordinates) ---------------- */
const W = 1840, H = 880;                  // window size
const TB = 46, TABS = 40, RIB = 104, FB = 40; // title bar, tab row, ribbon, formula bar heights
const GY = TB + TABS + RIB + FB;          // grid top (column header row starts here)
const RH = 34, CH = 30, RW = 50;          // row height, column header height, row header width
const SHEETBAR = 34, STATUS = 28;
const colW = (cols: Record<string, number>, c: string) => cols[c] ?? 120;
const COLS = "ABCDEFGHIJ".split("");
const colX = (cols: Record<string, number>, c: string) => { let x = RW; for (const k of COLS) { if (k === c) return x; x += colW(cols, k); } return x; };
const parseRef = (r: string) => { const m = r.match(/^([A-J])(\d+)$/)!; return { c: m[1], r: +m[2] }; };
const cellRect = (cols: Record<string, number>, ref: string) => { const { c, r } = parseRef(ref); return { x: colX(cols, c), y: GY + CH + (r - 1) * RH, w: colW(cols, c), h: RH }; };
const rangeRect = (cols: Record<string, number>, rg: string) => { const [a, b] = rg.split(":"); const A = cellRect(cols, a), B = cellRect(cols, b || a); return { x: A.x, y: A.y, w: B.x + B.w - A.x, h: B.y + B.h - A.y }; };

/* ---------------- ribbon ---------------- */
const TAB_NAMES = ["File", "Home", "Insert", "Page Layout", "Formulas", "Data", "Review", "View", "Help"]; // "Addins" ribbon is shown under Home
type Btn = { id: string; label: string; icon: React.FC<any>; big?: boolean };
const RIBBON: Record<string, Btn[][]> = {
  Home: [[{ id: "paste", label: "Paste", icon: Clipboard, big: true }, { id: "cut", label: "Cut", icon: Scissors }, { id: "copy", label: "Copy", icon: Copy }],
    [{ id: "bold", label: "Bold", icon: Bold }, { id: "italic", label: "Italic", icon: Italic }, { id: "fill", label: "Fill Color", icon: PaintBucket }, { id: "fontcolor", label: "Font Color", icon: Baseline }],
    [{ id: "wrap", label: "Wrap Text", icon: WrapText }, { id: "merge", label: "Merge & Center", icon: TableCellsMerge }],
    [{ id: "currency", label: "Number", icon: DollarSign }, { id: "percent", label: "Percent", icon: Percent }],
    [{ id: "cond", label: "Conditional Formatting", icon: Palette, big: true }, { id: "astable", label: "Format as Table", icon: Table, big: true }],
    [{ id: "autosum", label: "AutoSum", icon: Sigma, big: true }, { id: "sortfilter", label: "Sort & Filter", icon: ArrowDownAZ, big: true }, { id: "find", label: "Find & Select", icon: Search, big: true }], [{ id: "copilot", label: "Copilot", icon: Sparkles, big: true }]],
  Insert: [[{ id: "table", label: "Table", icon: Table, big: true }, { id: "pivot", label: "PivotTable", icon: Columns3, big: true }], [{ id: "pictures", label: "Pictures", icon: Image, big: true }, { id: "checkbox", label: "Checkbox", icon: SquareCheck, big: true }],
    [{ id: "colchart", label: "Column Chart", icon: ChartColumn, big: true }, { id: "linechart", label: "Line Chart", icon: ChartLine, big: true }, { id: "piechart", label: "Pie Chart", icon: ChartPie, big: true }], [{ id: "textbox", label: "Text Box", icon: TextCursorInput, big: true }]],
  Formulas: [[{ id: "fx", label: "Insert Function", icon: SquareFunction, big: true }, { id: "autosum2", label: "AutoSum", icon: Sigma, big: true }],
    [{ id: "logical", label: "Logical", icon: ListChecks, big: true }, { id: "text", label: "Text", icon: FileText, big: true }, { id: "date", label: "Date & Time", icon: Calendar, big: true }, { id: "lookup", label: "Lookup & Reference", icon: Search, big: true }, { id: "math", label: "Math & Trig", icon: Calculator, big: true }]],
  Data: [[{ id: "getdata", label: "Get Data", icon: Database, big: true }, { id: "refresh", label: "Refresh All", icon: RefreshCw, big: true }],
    [{ id: "az", label: "Sort A→Z", icon: ArrowDownAZ }, { id: "za", label: "Sort Z→A", icon: ArrowDownZA }, { id: "filter", label: "Filter", icon: Filter, big: true }],
    [{ id: "flash", label: "Flash Fill", icon: WandSparkles, big: true }, { id: "dupes", label: "Remove Duplicates", icon: CopyMinus, big: true }, { id: "valid", label: "Data Validation", icon: ListChecks, big: true }]],
  "Page Layout": [], Review: [], Help: [],
  View: [[{ id: "normal", label: "Normal", icon: Grid3x3, big: true }, { id: "pagebreak", label: "Page Break", icon: PanelsTopLeft, big: true }], [{ id: "freeze", label: "Freeze Panes", icon: Snowflake, big: true }, { id: "gridlines", label: "Gridlines", icon: Eye }]],
  Addins: [[{ id: "addins", label: "Add-ins", icon: Brain, big: true }]],
};
// x position of each tab label and each ribbon button (window coords) — used to aim the cursor
const tabX = (name: string) => { let x = 14; for (const t of TAB_NAMES) { if (t === name) return x; x += t.length * 9.6 + 34; } return x; };
const tabW = (name: string) => name.length * 9.6 + 22;
const btnPos = (tab: string, id: string) => {
  // mirrors <Ribbon>: padding 16, groups separated by gap 14 + paddingRight 14 + 1px border; big = 92 wide, small = 3 rows × 128-wide columns
  let x = 16; const top = TB + TABS + 6;
  for (const g of RIBBON[tab] || []) {
    const big = g.filter((b) => b.big), small = g.filter((b) => !b.big);
    for (const [i, b] of big.entries()) if (b.id === id) return { x: x + i * 92 + 46, y: top + 30 };
    for (const [j, b] of small.entries()) if (b.id === id) return { x: x + big.length * 92 + Math.floor(j / 3) * 150 + 60, y: top + (j % 3) * 26 + 13 };
    x += big.length * 92 + Math.ceil(small.length / 3) * 150 + 14 + 1 + 14;
  }
  return { x: 400, y: top + 30 };
};

const Ribbon: React.FC<{ tab: string; pressed?: string | null }> = ({ tab, pressed }) => (
  <div style={{ position: "absolute", left: 0, right: 0, top: TB + TABS, height: RIB, background: X_.ribbon, borderBottom: `1px solid ${X_.line}`, display: "flex", alignItems: "stretch", padding: "6px 16px 18px", gap: 14, fontFamily: UI }}>
    {(RIBBON[tab] || []).map((g, gi) => {
      const big = g.filter((b) => b.big), small = g.filter((b) => !b.big);
      return (
        <div key={gi} style={{ display: "flex", gap: 0, borderRight: `1px solid ${X_.line}`, paddingRight: 14 }}>
          {big.map((b) => <div key={b.id} style={{ width: 92, display: "flex", flexDirection: "column", alignItems: "center", gap: 4, borderRadius: 6, paddingTop: 6, background: pressed === b.id ? "#C6E0CF" : "transparent" }}><b.icon size={30} color={X_.green} strokeWidth={1.7} /><span style={{ fontSize: 13, color: X_.ink, textAlign: "center", lineHeight: 1.15 }}>{b.label}</span></div>)}
          {small.length > 0 && <div style={{ display: "grid", gridTemplateRows: "repeat(3, 26px)", gridAutoFlow: "column", gridAutoColumns: 150 }}>
            {small.map((b) => <div key={b.id} style={{ display: "flex", alignItems: "center", gap: 7, whiteSpace: "nowrap", fontSize: 13.5, color: X_.ink, padding: "0 6px", borderRadius: 4, background: pressed === b.id ? "#C6E0CF" : "transparent" }}><b.icon size={17} color={X_.ink} strokeWidth={1.8} />{b.label}</div>)}
          </div>}
        </div>);
    })}
    {!(RIBBON[tab] || []).length && <div style={{ alignSelf: "center", fontSize: 14, color: X_.mute }}>{tab}</div>}
  </div>
);

/* ---------------- sheet state from the step timeline ---------------- */
type Cell = { t: string; v?: string; bold?: boolean; fill?: string; color?: string; align?: string; cb?: boolean; ghost?: boolean };
type State = { cells: Record<string, Cell>; sel: string; selRange?: string; tab: string; formula: string; typing?: { cell: string; text: string }; pressed?: string | null;
  hl: { range: string; color: string; o: number }[]; keys?: { k: string[]; o: number }; call?: { cell?: string; x?: number; y?: number; text: string; o: number; side?: string }; zoom: { range?: string; k: number }; cursor: { x: number; y: number; click: number }; backstage?: { item?: string; o: number; pdf?: number }; marching?: string; sum?: string; o: Over; spill?: string; freeze?: string };

function stateAt(p: P, f: number): State {
  const s = p.s, cols = s.cols || {};
  const st: State = { cells: JSON.parse(JSON.stringify(s.cells || {})), sel: s.sel || "A1", tab: s.tab || "Home", formula: "", hl: [], zoom: { k: 1 }, cursor: { x: 900, y: 500, click: -99 }, pressed: null, o: { charts: [] } };
  let prevCur = { x: 900, y: 520 }, curFrom = 0, curTo = 0, curTarget = { x: 900, y: 520 }, zoomFrom = { range: undefined as string | undefined, k: 1 }, zoomTo = { range: undefined as string | undefined, k: 1 }, zoomAt = -999;
  const aim = (st0: Step) => (st0.aim || st0.cell) ? (() => { const r = cellRect(cols, st0.aim || st0.cell); return { x: r.x + r.w * 0.3, y: r.y + r.h * 0.75 }; })()
    : st0.tabName ? { x: tabX(st0.tabName) + tabW(st0.tabName) / 2, y: TB + TABS / 2 + 2 } : st0.btn ? btnPos(st0.tabFor || st.tab, st0.btn) : st0.xy ? { x: st0.xy[0], y: st0.xy[1] } : st0.act === "ok" && st.o.dialog ? dialogBox(st.o.dialog.rows.length).ok : st0.act === "ask" ? { x: W - PANE_W / 2, y: H - STATUS - 80 } : null;
  for (const step of (s.steps || []) as Step[]) {
    const t0 = v(p, step.at), dur = step.dur ?? 20;
    if (f < t0 - 14) break;
    const target = aim(step);
    if (target && ["select", "click", "tab", "type", "fill", "drag", "backstage", "pdf", "move", "ok", "ask", "toggle", "menu"].includes(step.act) && !(step.act === "type" && step.dur !== undefined && step.dur < 8)) { prevCur = { ...curTarget }; curFrom = t0 - 14; curTo = t0; curTarget = target; }
    if (f < t0) continue;
    const k = Math.min(1, (f - t0) / Math.max(1, dur));
    switch (step.act) {
      case "select": st.sel = step.cell; st.selRange = step.range; st.cursor.click = t0; break;
      case "click": st.cursor.click = t0; st.pressed = step.btn || null; if (step.btn && f > t0 + 10) st.pressed = null; break;
      case "tab": st.tab = step.tabName; st.cursor.click = t0; break;
      case "type": {
        st.sel = step.cell; st.cursor.click = t0;
        const n = Math.round(step.text.length * Math.min(1, (f - t0) / (step.dur ?? Math.max(18, step.text.length * 2.2))));
        const shown = step.text.slice(0, n);
        if (n < step.text.length || !step.enter) { st.typing = { cell: step.cell, text: shown }; st.formula = shown; st.cells[step.cell] = { ...(st.cells[step.cell] || {}), t: shown, v: undefined }; }
        if (step.text.startsWith("=") && n > 1 && n <= step.text.length) st.marching = step.refs;
        if (step.enter && n >= step.text.length && f >= t0 + (step.dur ?? Math.max(18, step.text.length * 2.2)) + (step.wait ?? 6)) {
          st.typing = undefined; st.marching = undefined; st.cells[step.cell] = { ...(st.cells[step.cell] || {}), t: step.text, v: step.v }; st.sel = step.next || step.cell; st.formula = "";
          if (step.spill) { for (const [ref, val] of step.spill as [string, string][]) st.cells[ref] = { ...(st.cells[ref] || {}), t: "", v: val, ghost: true }; st.spill = step.spillRange; }
        }
        break; }
      case "fill": { // drag the fill handle: copy values down
        st.cursor.click = t0; const rows = step.vals as [string, string, string][]; const shown = Math.ceil(rows.length * k);
        rows.slice(0, shown).forEach(([ref, t, val]) => { st.cells[ref] = { ...(st.cells[ref] || {}), t, v: val }; });
        st.sel = step.cell; st.selRange = step.range; break; }
      case "flash": { const rows = step.vals as [string, string][]; const shown = Math.ceil(rows.length * k); rows.slice(0, shown).forEach(([ref, t]) => { st.cells[ref] = { ...(st.cells[ref] || {}), t, fill: "#EAF6EE" }; }); st.selRange = step.range; break; }
      case "style": for (const ref of step.cells) st.cells[ref] = { ...(st.cells[ref] || { t: "" }), ...step.set }; break;
      case "hl": st.hl.push({ range: step.range, color: step.color || X_.signal, o: interpolate(f, [t0, t0 + 8, t0 + (step.len ?? 90), t0 + (step.len ?? 90) + 10], [0, 1, 1, 0], clamp) }); break;
      case "keys": { const L = step.len ?? 60; st.keys = { k: step.keys, o: interpolate(f, [t0, t0 + 6, t0 + L, t0 + L + 8], [0, 1, 1, 0], clamp) }; break; }
      case "call": { const L = step.len ?? 110; st.call = { cell: step.cell, x: step.x, y: step.y, text: step.text, side: step.side, o: interpolate(f, [t0, t0 + 8, t0 + L, t0 + L + 10], [0, 1, 1, 0], clamp) }; break; }
      case "zoom": zoomFrom = { ...zoomTo, k: zoomTo.k }; zoomTo = { range: step.range, k: step.k ?? 1.6 }; zoomAt = t0; break;
      case "unzoom": zoomFrom = { ...zoomTo }; zoomTo = { range: undefined, k: 1 }; zoomAt = t0; break;
      case "backstage": st.backstage = { item: step.item, o: interpolate(f, [t0, t0 + 10], [0, 1], clamp) }; break;
      case "pdf": st.backstage = { ...(st.backstage || { o: 1 }), item: "Export", pdf: interpolate(f, [t0, t0 + 12], [0, 1], clamp) }; break;
      case "closebs": st.backstage = undefined; break;
      case "status": st.sum = step.text; break;
      case "toggle": for (const ref of (step.cells || [step.cell])) st.cells[ref] = { ...(st.cells[ref] || { t: "" }), cb: step.on ?? !(st.cells[ref]?.cb) }; st.cursor.click = t0; break;
      case "freeze": st.freeze = step.cell; break;
      case "clear": for (const ref of step.cells) delete st.cells[ref]; break;
      default: overStep(st.o, step, f, t0, (s0) => (s0.cell ? (() => { const r = cellRect(cols, s0.cell); return { x: r.x, y: r.y + r.h }; })() : s0.xy ? { x: s0.xy[0], y: s0.xy[1] } : null));
    }
  }
  const cm = interpolate(f, [curFrom, Math.max(curTo, curFrom + 1)], [0, 1], { ...clamp, easing: Easing.inOut(Easing.cubic) });
  st.cursor.x = prevCur.x + (curTarget.x - prevCur.x) * cm; st.cursor.y = prevCur.y + (curTarget.y - prevCur.y) * cm;
  const zk = interpolate(f, [zoomAt, zoomAt + 24], [0, 1], { ...clamp, easing: ease });
  const center = (z: { range?: string; k: number }) => { if (!z.range) return { x: W / 2, y: H / 2, k: 1 }; const r = rangeRect(cols, z.range); return { x: r.x + r.w / 2, y: r.y + r.h / 2, k: z.k }; };
  const A = center(zoomFrom), B = center(zoomTo);
  (st.zoom as any) = { x: A.x + (B.x - A.x) * zk, y: A.y + (B.y - A.y) * zk, k: A.k + (B.k - A.k) * zk };
  return st;
}

/* ---------------- the Excel window ---------------- */
const Grid: React.FC<{ st: State; cols: Record<string, number>; rows: number }> = ({ st, cols, rows }) => {
  const sel = st.selRange ? rangeRect(cols, st.selRange) : cellRect(cols, st.sel);
  const active = cellRect(cols, st.sel), { c: selC, r: selR } = parseRef(st.sel);
  const gridW = W - 20, nRows = rows;
  return (
    <div style={{ position: "absolute", left: 0, top: GY, width: W, height: H - GY - SHEETBAR - STATUS, overflow: "hidden", fontFamily: UI }}>
      <div style={{ position: "absolute", left: 0, top: -GY }}>
        {/* column headers */}
        <div style={{ position: "absolute", left: 0, top: GY, width: RW, height: CH, background: X_.head, borderRight: `1px solid ${X_.line}`, borderBottom: `1px solid ${X_.line}` }} />
        {COLS.map((c) => <div key={c} style={{ position: "absolute", left: colX(cols, c), top: GY, width: colW(cols, c), height: CH, background: c === selC ? X_.headOn : X_.head, color: c === selC ? X_.green2 : X_.mute, borderRight: `1px solid ${X_.line}`, borderBottom: c === selC ? `2px solid ${X_.green}` : `1px solid ${X_.line}`, display: "grid", placeItems: "center", fontSize: 15 }}>{c}</div>)}
        {/* rows */}
        {Array.from({ length: nRows }, (_, i) => i + 1).map((r) => (
          <React.Fragment key={r}>
            <div style={{ position: "absolute", left: 0, top: GY + CH + (r - 1) * RH, width: RW, height: RH, background: r === selR ? X_.headOn : X_.head, color: r === selR ? X_.green2 : X_.mute, borderRight: r === selR ? `2px solid ${X_.green}` : `1px solid ${X_.line}`, borderBottom: `1px solid ${X_.line}`, display: "grid", placeItems: "center", fontSize: 15 }}>{r}</div>
            {COLS.map((c) => {
              const ref = c + r, cell = st.cells[ref]; const rc = cellRect(cols, ref);
              const shown = cell ? (cell.cb !== undefined ? "" : cell.v !== undefined ? cell.v : cell.t) : "";
              const num = /^-?[\d,.]+%?$/.test(shown || "") && !(cell?.t || "").match(/^[A-Za-z]/);
              return <div key={ref} style={{ position: "absolute", left: rc.x, top: rc.y, width: rc.w, height: RH, borderRight: `1px solid ${X_.grid}`, borderBottom: `1px solid ${X_.grid}`, background: cell?.fill || X_.win, color: cell?.color || X_.ink, fontWeight: cell?.bold ? 700 : 400, fontSize: 17, display: "flex", alignItems: "center", justifyContent: cell?.align || (num ? "flex-end" : "flex-start"), padding: "0 8px", whiteSpace: "nowrap", overflow: "visible" }}>{cell?.cb !== undefined ? <span style={{ width: 20, height: 20, margin: "0 auto", border: `2px solid ${cell.cb ? X_.green : "#777"}`, background: cell.cb ? X_.green : "#fff", color: "#fff", borderRadius: 3, display: "grid", placeItems: "center", fontSize: 15 }}>{cell.cb ? "✓" : ""}</span> : shown}</div>;
            })}
          </React.Fragment>))}
        {/* marching ants for formula refs */}
        {st.marching && st.marching.split(",").map((rg, i) => { const r = rangeRect(cols, rg); const col = ["#1F6FEB", "#C2185B", "#7B1FA2"][i % 3]; return <div key={rg} style={{ position: "absolute", left: r.x, top: r.y, width: r.w, height: r.h, border: `2px dashed ${col}`, background: col + "14" }} />; })}
        {st.spill && (() => { const r = rangeRect(cols, st.spill); return <div style={{ position: "absolute", left: r.x, top: r.y, width: r.w, height: r.h, border: "1.5px solid #4A86E8" }} />; })()}
        {st.freeze && (() => { const r = cellRect(cols, st.freeze); return <><div style={{ position: "absolute", left: 0, top: r.y - 1, width: 3000, height: 2, background: "#7F7F7F" }} /></>; })()}
        {/* highlights */}
        {st.hl.map((h, i) => { const r = rangeRect(cols, h.range); return <div key={i} style={{ position: "absolute", left: r.x - 3, top: r.y - 3, width: r.w + 6, height: r.h + 6, border: `4px solid ${h.color}`, borderRadius: 6, opacity: h.o, boxShadow: `0 0 0 6px ${h.color}22` }} />; })}
        {/* selection */}
        <div style={{ position: "absolute", left: sel.x - 1, top: sel.y - 1, width: sel.w + 1, height: sel.h + 1, border: `2px solid ${X_.sel}`, background: st.selRange ? "rgba(33,115,70,.07)" : "transparent" }} />
        <div style={{ position: "absolute", left: active.x, top: active.y, width: active.w - 1, height: active.h - 1, border: st.selRange ? `1px solid ${X_.sel}` : 0 }} />
        <div style={{ position: "absolute", left: sel.x + sel.w - 5, top: sel.y + sel.h - 5, width: 9, height: 9, background: X_.sel, border: "1.5px solid #fff" }} />
        {st.typing && <div style={{ position: "absolute", left: active.x + 8 + Math.min(active.w * 3, (st.typing.text.length * 9.4)), top: active.y + 6, width: 2, height: RH - 12, background: X_.ink }} />}
        <div style={{ width: gridW }} />
      </div>
    </div>
  );
};

const ExcelWindow: React.FC<{ st: State; spec: Spec; cols: Record<string, number>; rows: number }> = ({ st, spec, cols, rows }) => {
  const f = useCurrentFrame();
  const selCell = st.cells[st.sel];
  const fx = st.typing ? st.typing.text : selCell ? selCell.t : "";
  return (
    <div style={{ position: "absolute", left: 0, top: 0, width: W, height: H, background: X_.win, borderRadius: 10, overflow: "hidden", boxShadow: "0 30px 80px rgba(16,40,30,.25), 0 0 0 1px rgba(0,0,0,.08)", fontFamily: UI }}>
      {/* title bar */}
      <div style={{ position: "absolute", left: 0, right: 0, top: 0, height: TB, background: X_.green, color: "#fff", display: "flex", alignItems: "center", gap: 18, padding: "0 16px" }}>
        <div style={{ width: 26, height: 26, borderRadius: 5, background: "#fff", color: X_.green, display: "grid", placeItems: "center", fontWeight: 800, fontSize: 17 }}>X</div>
        <Save size={18} color="#fff" /><Undo2 size={18} color="#fff" /><Redo2 size={18} color="#fff" />
        <div style={{ flex: 1, textAlign: "center", fontSize: 15.5 }}>{spec.file} - Excel</div>
        <div style={{ display: "flex", gap: 26 }}><Minus size={18} color="#fff" /><Square size={15} color="#fff" /><X size={18} color="#fff" /></div>
      </div>
      {/* tabs */}
      <div style={{ position: "absolute", left: 0, right: 0, top: TB, height: TABS, background: X_.ribbon, display: "flex", alignItems: "flex-end" }}>
        {TAB_NAMES.map((t) => <div key={t} style={{ position: "absolute", left: tabX(t), bottom: 0, width: tabW(t), height: 32, display: "grid", placeItems: "center", fontSize: 15, color: t === "File" ? "#fff" : t === st.tab ? X_.green2 : X_.ink, background: t === "File" ? X_.green : "transparent", borderRadius: t === "File" ? "4px 4px 0 0" : 0, fontWeight: t === st.tab ? 600 : 400, borderBottom: t === st.tab ? `3px solid ${X_.green}` : "3px solid transparent" }}>{t}</div>)}
      </div>
      <Ribbon tab={st.tab} pressed={st.pressed} />
      {/* name box + formula bar */}
      <div style={{ position: "absolute", left: 0, right: 0, top: TB + TABS + RIB, height: FB, display: "flex", alignItems: "center", gap: 10, padding: "0 10px", borderBottom: `1px solid ${X_.line}`, background: X_.win }}>
        <div style={{ width: 120, height: 28, border: `1px solid ${X_.line}`, display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 8px", fontSize: 15 }}>{st.selRange || st.sel}<ChevronDown size={14} color={X_.mute} /></div>
        <div style={{ color: X_.mute, fontSize: 15, padding: "0 6px", borderRight: `1px solid ${X_.line}` }}>✕ ✓</div>
        <div style={{ fontStyle: "italic", fontFamily: "Cambria, Georgia, serif", fontSize: 18, color: X_.mute }}>fx</div>
        <div style={{ flex: 1, height: 28, border: `1px solid ${X_.line}`, display: "flex", alignItems: "center", padding: "0 10px", fontSize: 17, fontFamily: "Consolas, 'Cascadia Mono', monospace", color: X_.ink }}>{fx}{st.typing && <span style={{ width: 2, height: 20, background: X_.ink, display: "inline-block", marginLeft: 1, opacity: Math.floor(f / 8) % 2 ? 1 : 0.2 }} />}</div>
      </div>
      <Grid st={st} cols={cols} rows={rows} />
      {/* sheet tabs + status */}
      <div style={{ position: "absolute", left: 0, right: 0, bottom: STATUS, height: SHEETBAR, background: X_.head, borderTop: `1px solid ${X_.line}`, display: "flex", alignItems: "stretch", paddingLeft: 60 }}>
        <div style={{ padding: "0 22px", background: X_.win, color: X_.green2, fontWeight: 600, borderBottom: `3px solid ${X_.green}`, display: "grid", placeItems: "center", fontSize: 14.5 }}>Sheet1</div>
        <div style={{ padding: "0 14px", color: X_.mute, display: "grid", placeItems: "center", fontSize: 20 }}>+</div>
      </div>
      <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: STATUS, background: X_.head, display: "flex", alignItems: "center", gap: 30, padding: "0 16px", fontSize: 13.5, color: X_.mute }}>
        <span>{st.typing ? "Enter" : "Ready"}</span><span style={{ marginLeft: "auto" }}>{st.selRange && (st as any).sum ? `Sum: ${(st as any).sum}` : ""}</span><span>100%</span>
      </div>
      {/* backstage (File) */}
      {st.backstage && <div style={{ position: "absolute", inset: 0, opacity: st.backstage.o, background: "#fff", display: "flex" }}>
        <div style={{ width: 260, background: X_.green, color: "#fff", padding: "26px 0", display: "flex", flexDirection: "column", gap: 4, fontSize: 17 }}>
          <div style={{ padding: "6px 26px 20px", display: "flex", gap: 10, alignItems: "center" }}>⟵</div>
          {[["Home", Info], ["New", FilePlus], ["Open", FolderOpen], ["Info", Info], ["Save", Save], ["Save As", Save], ["Print", Printer], ["Share", Share2], ["Export", FileOutput]].map(([t, I]: any) => (
            <div key={t} style={{ display: "flex", gap: 14, alignItems: "center", padding: "10px 26px", background: st.backstage!.item === t ? X_.green2 : "transparent" }}><I size={19} color="#fff" />{t}</div>))}
        </div>
        <div style={{ flex: 1, padding: "34px 50px", color: X_.ink }}>
          <div style={{ fontSize: 34, fontWeight: 300, marginBottom: 26 }}>{st.backstage.item || "Info"}</div>
          {st.backstage.item === "Export" && <div style={{ display: "flex", gap: 40 }}>
            <div style={{ width: 360, display: "flex", flexDirection: "column", gap: 6 }}>
              <div style={{ padding: "16px 18px", background: "#E6F2EA", border: `1px solid ${X_.green}`, display: "flex", gap: 14, alignItems: "center", fontSize: 17 }}><FileText size={30} color="#C62828" />Create PDF/XPS Document</div>
              <div style={{ padding: "16px 18px", display: "flex", gap: 14, alignItems: "center", fontSize: 17 }}><FileOutput size={30} color={X_.green} />Change File Type</div>
            </div>
            <div style={{ fontSize: 16, color: X_.mute, lineHeight: 1.6, width: 420 }}>Create a PDF/XPS Document<br />• Preserves layout, formatting, fonts, and images<br />• Content can't be easily changed<br /><div style={{ marginTop: 18, width: 190, height: 96, border: `1px solid ${X_.line}`, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 6, color: X_.ink, background: st.backstage.pdf ? `rgba(16,124,65,${0.12 * (st.backstage.pdf || 0)})` : "#fff" }}><FileText size={34} color="#C62828" />Create PDF/XPS</div></div>
          </div>}
        </div>
      </div>}
    </div>
  );
};

/* ---------------- overlays ---------------- */
const Cursor: React.FC<{ x: number; y: number; click: number }> = ({ x, y, click }) => {
  const f = useCurrentFrame(); const c = interpolate(f, [click, click + 12], [1, 0], clamp);
  return (
    <div style={{ position: "absolute", left: x, top: y, pointerEvents: "none" }}>
      {c > 0 && <div style={{ position: "absolute", left: -26, top: -26, width: 52, height: 52, borderRadius: "50%", border: `3px solid ${X_.signal}`, opacity: c, transform: `scale(${1.6 - c * 0.6})` }} />}
      <svg width="30" height="34" viewBox="0 0 30 34" style={{ position: "absolute", left: -3, top: -2, filter: "drop-shadow(0 2px 3px rgba(0,0,0,.35))" }}><path d="M3 2 L3 26 L9 20 L13 30 L18 28 L14 18 L22 18 Z" fill="#fff" stroke="#111" strokeWidth="2" strokeLinejoin="round" /></svg>
    </div>
  );
};
const KeyChips: React.FC<{ keys: string[]; o: number }> = ({ keys, o }) => {
  const f = useCurrentFrame(); const { fps } = useVideoConfig();
  return (
    <div style={{ position: "absolute", left: 0, right: 0, top: 300, display: "flex", justifyContent: "center", gap: 18, opacity: o, transform: `scale(${0.9 + 0.1 * o})` }}>
      {keys.map((k, i) => <React.Fragment key={i}>{i > 0 && <span style={{ fontSize: 60, color: X_.ink, fontWeight: 700, alignSelf: "center" }}>+</span>}<div style={{ minWidth: 130, padding: "18px 30px", borderRadius: 18, background: "#fff", border: "3px solid #1F1F1F", boxShadow: "0 8px 0 #1F1F1F", fontFamily: UI, fontSize: 52, fontWeight: 700, color: X_.ink, textAlign: "center" }}>{k}</div></React.Fragment>)}
    </div>
  );
};

/* ---------------- scenes ---------------- */
const SExcel: React.FC<P> = (p) => {
  const f = useCurrentFrame();
  const st = stateAt(p, f), cols = p.s.cols || {};
  // window placed at (40, 26) in the 1920×1080 frame; camera = scale around the zoom centre
  const z = st.zoom as any, k = z.k;
  const tx = W / 2 - z.x * k + (z.x - W / 2) * 0, ty = H / 2 - z.y * k;
  const cx = Math.min(0, Math.max(W - W * k, tx)), cy = Math.min(0, Math.max(H - H * k, ty));
  const call = st.call;
  let callPos = { x: 0, y: 0 };
  if (call) { if (call.cell) { const r = cellRect(cols, call.cell); callPos = { x: r.x + r.w + 26, y: r.y - 10 }; } else callPos = { x: call.x || 900, y: call.y || 400 }; }
  return (
    <AbsoluteFill>
      <div style={{ position: "absolute", left: 40, top: 26, width: W, height: H, overflow: "hidden", borderRadius: 10 }}>
        <div style={{ position: "absolute", left: 0, top: 0, width: W, height: H, transform: `translate(${cx}px, ${cy}px) scale(${k})`, transformOrigin: "0 0" }}>
          <ExcelWindow st={st} spec={p.spec} cols={cols} rows={p.s.rows || 18} />
          <Overlays o={st.o} accent={X_.green} top={GY} bottom={SHEETBAR + STATUS} />
          {call && <div style={{ position: "absolute", left: callPos.x, top: callPos.y, maxWidth: 520, opacity: call.o, transform: `translateY(${(1 - call.o) * 10}px)`, background: X_.call, border: "2px solid #1F1F1F", borderRadius: 14, padding: "12px 18px", fontFamily: BN, fontSize: 24, lineHeight: 1.45, color: "#1F1F1F", boxShadow: "4px 4px 0 #1F1F1F" }}>{call.text}</div>}
          <Cursor x={st.cursor.x} y={st.cursor.y} click={st.cursor.click} />
        </div>
      </div>
      {st.keys && <KeyChips keys={st.keys.k} o={st.keys.o} />}
    </AbsoluteFill>
  );
};

export const THEME = (spec: Spec) => ({
  excel: { a: "#107C41", a2: "#0B5A2F", soft: "#E6F2EA", letter: "X", lab: "এক্সেল ল্যাবে নিজে করে দেখো", tm: "Microsoft Excel is a trademark of Microsoft Corporation." },
  word: { a: "#185ABD", a2: "#103F91", soft: "#E8EFFB", letter: "W", lab: "নিজে করে দেখো", tm: "Microsoft Word is a trademark of Microsoft Corporation." },
  ppt: { a: "#C43E1C", a2: "#8E2C12", soft: "#FBEAE5", letter: "P", lab: "নিজে করে দেখো", tm: "Microsoft PowerPoint is a trademark of Microsoft Corporation." },
  ai: { a: "#5B5FC7", a2: "#3B3F9E", soft: "#ECECFA", letter: "AI", lab: "এক্সেল ল্যাবে নিজে করে দেখো", tm: "Microsoft 365, Copilot and Excel are trademarks of Microsoft; ChatGPT of OpenAI; Claude of Anthropic." },
} as any)[spec.app || (spec.id.startsWith("word") ? "word" : spec.id.startsWith("ppt") ? "ppt" : spec.id.startsWith("ai") ? "ai" : "excel")];
const ACC = (spec: Spec) => THEME(spec).a;
const Card: React.FC<{ children: React.ReactNode; style?: React.CSSProperties }> = ({ children, style }) => (
  <div style={{ position: "absolute", left: 140, right: 140, top: 110, bottom: 200, background: "#fff", borderRadius: 26, boxShadow: "0 30px 80px rgba(16,40,30,.18)", padding: "56px 70px", display: "flex", flexDirection: "column", ...style }}>{children}</div>
);
const STitle: React.FC<P> = (p) => {
  const f = useCurrentFrame(); const { fps } = useVideoConfig(); const T = THEME(p.spec);
  return (
    <Card style={{ alignItems: "center", justifyContent: "center", textAlign: "center" }}>
      <div style={{ width: 120, height: 120, borderRadius: 26, background: T.a, color: "#fff", display: "grid", placeItems: "center", fontFamily: UI, fontWeight: 800, fontSize: 70, transform: `scale(${pop(f, fps, 4)})` }}>{T.letter}</div>
      <div style={{ fontFamily: BN, fontSize: 36, color: T.a2, marginTop: 26, opacity: interpolate(f, [8, 20], [0, 1], clamp) }}>{p.s.kicker || p.spec.course}</div>
      <div style={{ fontFamily: BN, fontSize: 82, fontWeight: 700, color: X_.ink, lineHeight: 1.2, margin: "12px 0", opacity: interpolate(f, [14, 28], [0, 1], clamp) }}>{p.s.title || p.spec.title}</div>
      {p.s.sub && <div style={{ fontFamily: BN, fontSize: 34, color: X_.mute, opacity: interpolate(f, [v(p, 0.4), v(p, 0.4) + 12], [0, 1], clamp) }}>{p.s.sub}</div>}
      {p.s.chips && <div style={{ display: "flex", gap: 14, marginTop: 30, flexWrap: "wrap", justifyContent: "center" }}>{p.s.chips.map((c: string, i: number) => <span key={i} style={{ fontFamily: BN, fontSize: 26, padding: "8px 18px", borderRadius: 999, background: T.soft, color: T.a2, opacity: interpolate(f, [v(p, 0.5 + i * 0.08), v(p, 0.5 + i * 0.08) + 10], [0, 1], clamp) }}>{c}</span>)}</div>}
    </Card>
  );
};
const SQuiz: React.FC<P & { answer?: boolean }> = (p) => {
  const f = useCurrentFrame(); const { fps } = useVideoConfig();
  const T = THEME(p.spec); const o: string[] = p.s.o || [], ans = p.answer, a = p.s.a;
  const left = Math.max(0, Math.ceil((LEAD + p.vo + (p.s.hold || 0) - f) / fps));
  return (
    <Card>
      <div style={{ display: "flex", alignItems: "center" }}><div style={{ fontFamily: BN, fontSize: 40, fontWeight: 700, color: T.a2 }}>{ans ? "উত্তর" : "এবার তোমার পালা!"}</div>{!ans && p.s.hold ? <div style={{ marginLeft: "auto", fontFamily: BN, fontSize: 52, fontWeight: 700, color: X_.signal }}>{bn(left)}</div> : null}</div>
      <div style={{ fontFamily: BN, fontSize: 48, fontWeight: 600, color: X_.ink, margin: "22px 0 30px", lineHeight: 1.35 }}>{p.s.q}</div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
        {o.map((x, i) => { const ok = ans && i === a; return (
          <div key={i} style={{ display: "flex", alignItems: "center", gap: 18, padding: "18px 24px", borderRadius: 16, border: `3px solid ${ok ? T.a : X_.line}`, background: ok ? T.soft : "#fff", opacity: ans && !ok ? 0.45 : interpolate(f, [10 + i * 5, 20 + i * 5], [0, 1], clamp), transform: ok ? `scale(${0.96 + 0.04 * Math.min(1, pop(f, fps, 8))})` : undefined }}>
            <span style={{ width: 52, height: 52, borderRadius: "50%", background: ok ? T.a : X_.head, color: ok ? "#fff" : X_.ink, display: "grid", placeItems: "center", fontFamily: BN, fontSize: 28, fontWeight: 700, flex: "none" }}>{"কখগঘ"[i]}</span>
            <span style={{ fontFamily: BN, fontSize: 34, color: X_.ink }}>{x}</span></div>); })}
      </div>
      {ans && p.s.ex && <div style={{ fontFamily: BN, fontSize: 32, color: X_.mute, marginTop: 30, lineHeight: 1.5, opacity: interpolate(f, [v(p, 0.3), v(p, 0.3) + 12], [0, 1], clamp) }}>{p.s.ex}</div>}
    </Card>
  );
};
const SRecap: React.FC<P> = (p) => {
  const f = useCurrentFrame(); const T = THEME(p.spec); const it: string[][] = p.s.items || [];
  return (
    <Card>
      <div style={{ fontFamily: BN, fontSize: 46, fontWeight: 700, color: T.a2, marginBottom: 24 }}>{p.s.head || "আজ যা শিখলাম"}</div>
      {it.map(([k, t], i) => { const at = v(p, 0.05 + (0.8 * i) / it.length); return (
        <div key={i} style={{ display: "flex", alignItems: "center", gap: 24, margin: "12px 0", opacity: interpolate(f, [at, at + 10], [0, 1], clamp), transform: `translateX(${interpolate(f, [at, at + 10], [-20, 0], clamp)}px)` }}>
          <span style={{ minWidth: 220, textAlign: "center", fontFamily: UI, fontSize: 28, fontWeight: 700, padding: "10px 16px", borderRadius: 12, background: X_.ink, color: "#fff" }}>{k}</span>
          <span style={{ fontFamily: BN, fontSize: 36, color: X_.ink }}>{t}</span></div>); })}
    </Card>
  );
};
const SOutro: React.FC<P> = (p) => {
  const f = useCurrentFrame(); const T = THEME(p.spec);
  return (
    <Card style={{ alignItems: "center", justifyContent: "center", textAlign: "center" }}>
      <div style={{ fontFamily: BN, fontSize: 64, fontWeight: 700, color: X_.ink, opacity: interpolate(f, [4, 16], [0, 1], clamp) }}>{p.s.head || "পরের পাঠে দেখা হবে!"}</div>
      {p.spec.next && <div style={{ fontFamily: BN, fontSize: 40, color: T.a2, margin: "22px 0 34px", opacity: interpolate(f, [14, 26], [0, 1], clamp) }}>পরের পাঠ: {p.spec.next}</div>}
      <div style={{ fontFamily: BN, fontSize: 32, color: X_.mute, opacity: interpolate(f, [24, 36], [0, 1], clamp) }}>{T.lab} — <b style={{ color: X_.ink }}>aiuniversitybd.com</b></div>
      <div style={{ fontFamily: UI, fontSize: 18, color: X_.mute, marginTop: 50, opacity: 0.8 }}>{T.tm} AI University is not affiliated with Microsoft.</div>
    </Card>
  );
};
const MAP: Record<string, React.FC<any>> = { points: (p: P) => <SPoints {...p} accent={ACC(p.spec)} />, word: SWord, ppt: SPpt, title: STitle, excel: SExcel, quizQ: SQuiz, quizA: (p: P) => <SQuiz {...p} answer />, recap: SRecap, outro: SOutro };

/* ---------------- frame ---------------- */
const subChunks = (spec: Spec, starts: number[]) => spec.scenes.flatMap((s, i) => {
  const parts = s.vo.split(/(?<=[।?!,—])\s+/).reduce<string[]>((a, x) => { if (a.length && (a[a.length - 1].length < 26 || x.length < 10)) a[a.length - 1] += " " + x; else a.push(x); return a; }, []);
  const total = parts.reduce((n, x) => n + x.length, 0); let acc = 0; const b = starts[i] + LEAD;
  return parts.map((x) => { const from = b + (s.frames * acc) / total; acc += x.length; return { s: x, from, to: b + (s.frames * acc) / total }; });
});
const Fade: React.FC<{ len: number; children: React.ReactNode }> = ({ len, children }) => {
  const f = useCurrentFrame(); const o = Math.min(interpolate(f, [0, 10], [0, 1], clamp), interpolate(f, [len - 10, len], [1, 0], clamp));
  return <AbsoluteFill style={{ opacity: o }}>{children}</AbsoluteFill>;
};
export const OfficeVideo: React.FC<{ spec: Spec }> = ({ spec }) => {
  const f = useCurrentFrame();
  const lens = spec.scenes.map(sceneLen);
  const starts = lens.reduce<number[]>((a, _, i) => [...a, i ? a[i - 1] + lens[i - 1] : 15], []);
  const chunks = subChunks(spec, starts), cur = chunks.find((x) => f >= x.from && f < x.to + 4);
  const total = officeLen(spec);
  const busy = (fr: number) => spec.scenes.some((s, i) => fr >= starts[i] + LEAD - 6 && fr <= starts[i] + LEAD + s.frames + 4);
  return (
    <AbsoluteFill style={{ background: `radial-gradient(1200px 700px at 80% 0%, ${THEME(spec).soft}, ${X_.desk} 60%)` }}>
      {spec.scenes.map((s, i) => { const S = MAP[s.type]; const len = lens[i]; return (
        <Sequence key={i} from={starts[i]} durationInFrames={len}>
          <Fade len={len}><S s={s} spec={spec} vo={s.frames} /></Fade>
          <Sequence from={LEAD}><Audio src={staticFile(`office/${spec.id}/vo/${String(i + 1).padStart(2, "0")}.mp3`)} /></Sequence>
          <Sequence from={0}><Audio src={staticFile(`aiu2/${i === 0 ? "swell" : s.type === "quizA" || s.type === "outro" ? "chime" : "whoosh"}.mp3`)} volume={0.18} /></Sequence>
        </Sequence>); })}
      {/* bottom strip: brand · subtitles · lesson */}
      <div style={{ position: "absolute", left: 40, bottom: 22, display: "flex", alignItems: "center", gap: 12 }}><Img src={staticFile("academy/_brand/aiu-logo.svg")} style={{ height: 30 }} /><span style={{ fontFamily: BN, fontSize: 22, color: X_.mute }}>{spec.course}</span></div>
      <div style={{ position: "absolute", right: 40, bottom: 26, fontFamily: BN, fontSize: 22, color: X_.mute }}>{spec.lessonNo} · এআই কণ্ঠ</div>
      {cur && <div style={{ position: "absolute", left: 0, right: 0, bottom: 16, display: "flex", justifyContent: "center", opacity: interpolate(f, [cur.from, cur.from + 5, cur.to, cur.to + 4], [0, 1, 1, 0], clamp) }}><div style={{ maxWidth: 1200, padding: "6px 24px 10px", borderRadius: 12, background: "rgba(20,21,27,.9)", fontFamily: BN, fontSize: 32, fontWeight: 500, color: "#fff", textAlign: "center", lineHeight: 1.35 }}>{cur.s.replace(/[।,]$/, "")}</div></div>}
      <Audio src={staticFile("aiu2/music.mp3")} volume={(fr) => (busy(fr) ? 0.035 : 0.1) * interpolate(fr, [0, 30, total - 60, total], [0, 1, 1, 0], clamp)} />
    </AbsoluteFill>
  );
};
