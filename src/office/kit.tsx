// Shared pieces for the অফিস মাস্টারক্লাস engines (Excel / Word / PowerPoint look-alike "screen share" videos, 2026-11-15).
// Cursor, key chips, Bangla callouts, task pane (Copilot / ChatGPT / Claude chat, PivotTable fields, Navigation…), dialog boxes,
// drop-down menus, charts, and the "points" concept card. All coordinates are window-local (W×H) like ExcelEngine.
import React from "react";
import { interpolate, spring, useCurrentFrame, useVideoConfig, Easing } from "remotion";
import * as Lucide from "lucide-react";

export const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
export const ease = Easing.bezier(0.16, 1, 0.3, 1);
export const BN = "Anek", UI = "'Segoe UI', 'Segoe UI Variable', Arial, sans-serif", MONO = "Consolas, 'Cascadia Mono', monospace";
export const W = 1840, H = 880;
export const LEAD = 12, TAIL = 18;
export const pop = (f: number, fps: number, d: number) => spring({ frame: f - d, fps, config: { damping: 14, mass: 0.6 } });
export const bn = (n: number | string) => String(n).replace(/\d/g, (d) => "০১২৩৪৫৬৭৮৯"[+d]);
export type Step = { at: number; act: string; [k: string]: any };
export type Scene = { type: string; vo: string; frames: number; hold?: number; [k: string]: any };
export type Spec = { id: string; course: string; lessonNo: string; title: string; next: string; file: string; app?: string; scenes: Scene[] };
export type P = { s: Scene; spec: Spec; vo: number };
export const v = (p: P, x: number) => LEAD + p.vo * x;
export const fadeIO = (f: number, t0: number, len: number) => interpolate(f, [t0, t0 + 8, t0 + len, t0 + len + 10], [0, 1, 1, 0], clamp);
export const Icon: React.FC<{ name: string; size?: number; color?: string; sw?: number }> = ({ name, size = 28, color = "#1F1F1F", sw = 1.8 }) => {
  const key = String(name || "circle").split("-").map((x) => x[0].toUpperCase() + x.slice(1)).join("");
  const I: any = (Lucide as any)[key] || (Lucide as any)[key + "Icon"] || Lucide.Circle;
  return <I size={size} color={color} strokeWidth={sw} />;
};

/* ---------- cursor & keys ---------- */
export const Cursor: React.FC<{ x: number; y: number; click: number; color?: string }> = ({ x, y, click, color = "#FF5A1F" }) => {
  const f = useCurrentFrame(); const c = interpolate(f, [click, click + 12], [1, 0], clamp);
  return (
    <div style={{ position: "absolute", left: x, top: y, pointerEvents: "none", zIndex: 50 }}>
      {c > 0 && <div style={{ position: "absolute", left: -26, top: -26, width: 52, height: 52, borderRadius: "50%", border: `3px solid ${color}`, opacity: c, transform: `scale(${1.6 - c * 0.6})` }} />}
      <svg width="30" height="34" viewBox="0 0 30 34" style={{ position: "absolute", left: -3, top: -2, filter: "drop-shadow(0 2px 3px rgba(0,0,0,.35))" }}><path d="M3 2 L3 26 L9 20 L13 30 L18 28 L14 18 L22 18 Z" fill="#fff" stroke="#111" strokeWidth="2" strokeLinejoin="round" /></svg>
    </div>
  );
};
export const KeyChips: React.FC<{ keys: string[]; o: number }> = ({ keys, o }) => (
  <div style={{ position: "absolute", left: 0, right: 0, top: 300, display: "flex", justifyContent: "center", gap: 18, opacity: o, transform: `scale(${0.9 + 0.1 * o})`, zIndex: 60 }}>
    {keys.map((k, i) => <React.Fragment key={i}>{i > 0 && <span style={{ fontSize: 60, color: "#1F1F1F", fontWeight: 700, alignSelf: "center" }}>+</span>}<div style={{ minWidth: 130, padding: "18px 30px", borderRadius: 18, background: "#fff", border: "3px solid #1F1F1F", boxShadow: "0 8px 0 #1F1F1F", fontFamily: UI, fontSize: 52, fontWeight: 700, color: "#1F1F1F", textAlign: "center" }}>{k}</div></React.Fragment>)}
  </div>
);
export const Callout: React.FC<{ x: number; y: number; o: number; text: string }> = ({ x, y, o, text }) => (
  <div style={{ position: "absolute", left: Math.min(x, W - 540), top: Math.max(8, Math.min(y, H - 140)), maxWidth: 520, opacity: o, transform: `translateY(${(1 - o) * 10}px)`, background: "#FFE58A", border: "2px solid #1F1F1F", borderRadius: 14, padding: "12px 18px", fontFamily: BN, fontSize: 24, lineHeight: 1.45, color: "#1F1F1F", boxShadow: "4px 4px 0 #1F1F1F", zIndex: 40 }}>{text}</div>
);

/* ---------- generic overlay state (pane · dialog · menu · chart) shared by all three apps ---------- */
export type Msg = { who: "me" | "ai"; text: string; at: number; table?: string[][] };
export type Over = {
  pane?: { title: string; sub?: string; color?: string; o: number; msgs: Msg[]; items?: { t: string; on?: boolean; area?: string }[]; input?: string; side?: string };
  dialog?: { title: string; rows: [string, string][]; ok?: string; o: number; press?: number; note?: string };
  menu?: { x: number; y: number; items: string[]; hi: number; o: number; title?: string };
  charts: { kind: string; title?: string; labels: string[]; values: number[]; x: number; y: number; w: number; h: number; k: number; o: number; color?: string }[];
};
export const PANE_W = 470;
export const dialogBox = (rows: number) => { const w = 620, h = 150 + rows * 54; return { x: (W - w) / 2, y: (H - h) / 2, w, h, ok: { x: (W + w) / 2 - 150, y: (H + h) / 2 - 40 } }; };
/** Apply one overlay step (returns true when handled). `t0` = step start frame, `f` = current frame, `pt` = point helper for cells/xy. */
export function overStep(o: Over, step: Step, f: number, t0: number, pt: (s: Step) => { x: number; y: number } | null): boolean {
  switch (step.act) {
    case "pane": o.pane = { title: step.title, sub: step.sub, color: step.color, side: step.side, o: interpolate(f, [t0, t0 + 10], [0, 1], clamp), msgs: [], items: step.items }; return true;
    case "panex": o.pane = undefined; return true;
    case "ask": { // user types a prompt into the pane box, then it becomes a message
      if (!o.pane) return true;
      const d = step.dur ?? Math.max(20, step.text.length * 1.1); const n = Math.round(step.text.length * Math.min(1, (f - t0) / d));
      if (f < t0 + d + 8) o.pane.input = step.text.slice(0, n); else { o.pane.input = ""; o.pane.msgs = [...o.pane.msgs, { who: "me", text: step.text, at: t0 + d + 8 }]; }
      return true; }
    case "reply": if (o.pane) o.pane.msgs = [...o.pane.msgs, { who: "ai", text: step.text, at: t0, table: step.table }]; return true;
    case "item": if (o.pane && o.pane.items) o.pane.items = o.pane.items.map((it) => it.t === step.t ? { ...it, on: step.on ?? true, area: step.area ?? it.area } : it); return true;
    case "dialog": o.dialog = { title: step.title, rows: step.rows || [], ok: step.ok || "OK", note: step.note, o: interpolate(f, [t0, t0 + 8], [0, 1], clamp) }; return true;
    case "ok": if (o.dialog) { o.dialog.press = t0; if (f > t0 + 8) o.dialog = undefined; } return true;
    case "menu": { const p = pt(step) || { x: 600, y: 300 }; const L = step.len ?? 60, pick = step.pick ?? -1;
      if (f < t0 + L) o.menu = { x: p.x, y: p.y + 8, items: step.items, title: step.title, hi: pick >= 0 && f > t0 + L * 0.6 ? pick : -1, o: interpolate(f, [t0, t0 + 6], [0, 1], clamp) }; else o.menu = undefined; return true; }
    case "chart": o.charts = [...o.charts.filter((c) => c.title !== step.title), { kind: step.kind || "column", title: step.title, labels: step.labels, values: step.values, x: step.x ?? 760, y: step.y ?? 250, w: step.w ?? 640, h: step.h ?? 400, color: step.color, k: interpolate(f, [t0, t0 + 30], [0, 1], { ...clamp, easing: ease }), o: interpolate(f, [t0, t0 + 8], [0, 1], clamp) }]; return true;
    case "chartx": o.charts = []; return true;
  }
  return false;
}

export const Pane: React.FC<{ p: NonNullable<Over["pane"]>; top: number; bottom: number }> = ({ p, top, bottom }) => {
  const f = useCurrentFrame(); const col = p.color || "#5B5FC7";
  return (
    <div style={{ position: "absolute", right: p.side === "left" ? undefined : 0, left: p.side === "left" ? 0 : undefined, top, bottom, width: PANE_W, background: "#FAFAFC", borderLeft: "1px solid #D9D9D9", borderRight: "1px solid #D9D9D9", opacity: p.o, transform: `translateX(${(p.side === "left" ? -1 : 1) * (1 - p.o) * 40}px)`, display: "flex", flexDirection: "column", fontFamily: UI, zIndex: 20, boxShadow: "-8px 0 24px rgba(0,0,0,.06)" }}>
      <div style={{ padding: "14px 18px", borderBottom: "1px solid #E4E4EA", display: "flex", alignItems: "center", gap: 10 }}>
        <div style={{ width: 30, height: 30, borderRadius: 8, background: col, color: "#fff", display: "grid", placeItems: "center", fontWeight: 800, fontSize: 15 }}>{p.title.slice(0, 1)}</div>
        <div style={{ fontSize: 19, fontWeight: 600, color: "#1F1F1F" }}>{p.title}</div>
        {p.sub && <div style={{ marginLeft: "auto", fontSize: 13.5, color: "#6B6B76" }}>{p.sub}</div>}
      </div>
      {p.items && <div style={{ padding: "12px 18px", display: "flex", flexDirection: "column", gap: 8 }}>
        {p.items.map((it, i) => <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 17, color: "#1F1F1F" }}>
          {it.on !== undefined && !/^Navigation/i.test(p.title) ? <span style={{ width: 20, height: 20, border: `2px solid ${it.on ? col : "#999"}`, background: it.on ? col : "#fff", color: "#fff", borderRadius: 4, display: "grid", placeItems: "center", fontSize: 14 }}>{it.on ? "✓" : ""}</span> : <span style={{ width: 4, height: 22, background: col, borderRadius: 2 }} />}<span style={{ fontFamily: /[ঀ-৿]/.test(it.t) ? BN : UI }}>{it.t}</span>
          {it.area && <span style={{ marginLeft: "auto", fontSize: 13.5, padding: "2px 10px", borderRadius: 999, background: col + "22", color: col }}>{it.area}</span>}</div>)}
      </div>}
      <div style={{ flex: 1, padding: "14px 16px", display: "flex", flexDirection: "column", gap: 12, overflow: "hidden", justifyContent: "flex-end" }}>
        {p.msgs.map((m, i) => { const o = interpolate(f, [m.at, m.at + 8], [0, 1], clamp); const think = m.who === "ai" && f < m.at + 16;
          const chars = m.who === "ai" ? Math.round(m.text.length * interpolate(f, [m.at + 16, m.at + 16 + Math.max(20, m.text.length * 0.5)], [0, 1], clamp)) : m.text.length;
          return <div key={i} style={{ alignSelf: m.who === "me" ? "flex-end" : "flex-start", maxWidth: "90%", opacity: o, background: m.who === "me" ? col : "#fff", color: m.who === "me" ? "#fff" : "#1F1F1F", border: m.who === "me" ? 0 : "1px solid #E4E4EA", borderRadius: 14, padding: "10px 14px", fontFamily: /[ঀ-৿]/.test(m.text) ? BN : UI, fontSize: 18, lineHeight: 1.45, whiteSpace: "pre-wrap" }}>
            {think ? <span style={{ letterSpacing: 4 }}>{".".repeat(1 + (Math.floor(f / 5) % 3))}</span> : m.text.slice(0, chars)}
            {m.table && !think && chars >= m.text.length && <table style={{ marginTop: 8, borderCollapse: "collapse", fontFamily: UI, fontSize: 15 }}><tbody>{m.table.map((r, ri) => <tr key={ri}>{r.map((c, ci) => <td key={ci} style={{ border: "1px solid #DDD", padding: "3px 8px", fontWeight: ri ? 400 : 700 }}>{c}</td>)}</tr>)}</tbody></table>}
          </div>; })}
      </div>
      {!(p.items && !p.msgs.length && !p.input) && <div style={{ margin: 14, padding: "12px 14px", borderRadius: 12, border: `2px solid ${p.input ? col : "#D9D9E0"}`, background: "#fff", fontSize: 17, color: p.input ? "#1F1F1F" : "#9A9AA5", minHeight: 48, fontFamily: /[ঀ-৿]/.test(p.input || "") ? BN : UI }}>
        {p.input || "Ask anything…"}{p.input ? <span style={{ display: "inline-block", width: 2, height: 18, marginLeft: 1, background: "#1F1F1F", opacity: Math.floor(f / 8) % 2 ? 1 : 0.2 }} /> : null}</div>}
    </div>
  );
};

export const Dialog: React.FC<{ d: NonNullable<Over["dialog"]>; accent: string }> = ({ d, accent }) => {
  const f = useCurrentFrame(); const b = dialogBox(d.rows.length); const pressed = d.press !== undefined && f >= d.press && f < d.press + 8;
  return (
    <div style={{ position: "absolute", inset: 0, background: `rgba(0,0,0,${0.18 * d.o})`, zIndex: 30 }}>
      <div style={{ position: "absolute", left: b.x, top: b.y, width: b.w, height: b.h, background: "#fff", borderRadius: 10, boxShadow: "0 20px 60px rgba(0,0,0,.3)", opacity: d.o, transform: `scale(${0.96 + 0.04 * d.o})`, fontFamily: UI, overflow: "hidden" }}>
        <div style={{ padding: "16px 22px", fontSize: 19, fontWeight: 600, borderBottom: "1px solid #E5E5E5" }}>{d.title}</div>
        <div style={{ padding: "16px 22px", display: "flex", flexDirection: "column", gap: 12 }}>
          {d.rows.map(([k, val], i) => <div key={i} style={{ display: "flex", alignItems: "center", gap: 14, fontSize: 17 }}><span style={{ width: 210, color: "#444" }}>{k}</span>
            <span style={{ flex: 1, padding: "7px 10px", border: "1px solid #C8C8C8", borderRadius: 4, fontFamily: /[ঀ-৿]/.test(val) ? BN : UI }}>{val}</span></div>)}
          {d.note && <div style={{ fontFamily: BN, fontSize: 17, color: "#666" }}>{d.note}</div>}
        </div>
        <div style={{ position: "absolute", right: 22, bottom: 18, display: "flex", gap: 12 }}>
          <span style={{ padding: "8px 26px", borderRadius: 4, background: pressed ? "#0B3D2A" : accent, color: "#fff", fontSize: 16 }}>{d.ok}</span>
          <span style={{ padding: "8px 22px", borderRadius: 4, border: "1px solid #BDBDBD", fontSize: 16 }}>Cancel</span></div>
      </div>
    </div>
  );
};

export const Menu: React.FC<{ m: NonNullable<Over["menu"]>; accent: string }> = ({ m, accent }) => (
  <div style={{ position: "absolute", left: m.x, top: m.y, minWidth: 220, background: "#fff", border: "1px solid #C8C8C8", boxShadow: "0 10px 30px rgba(0,0,0,.18)", borderRadius: 6, opacity: m.o, fontFamily: UI, fontSize: 17, zIndex: 35, padding: "4px 0" }}>
    {m.title && <div style={{ padding: "6px 14px", fontSize: 13.5, color: "#777" }}>{m.title}</div>}
    {m.items.map((it, i) => <div key={i} style={{ padding: "7px 16px", background: i === m.hi ? accent + "26" : "transparent", fontWeight: i === m.hi ? 600 : 400, fontFamily: /[ঀ-৿]/.test(it) ? BN : UI }}>{it}</div>)}
  </div>
);

const PAL = ["#2E75B6", "#ED7D31", "#A5A5A5", "#FFC000", "#5B9BD5", "#70AD47", "#264478", "#9E480E"];
export const Chart: React.FC<{ c: Over["charts"][number] }> = ({ c }) => {
  const max = Math.max(...c.values, 1) * 1.15, pw = c.w - 90, ph = c.h - 110, n = c.values.length;
  const fmt = (x: number) => x >= 1000 ? (x / 1000).toFixed(x % 1000 ? 1 : 0) + "k" : String(x);
  return (
    <div style={{ position: "absolute", left: c.x, top: c.y, width: c.w, height: c.h, background: "#fff", border: "1px solid #BFBFBF", boxShadow: "0 8px 24px rgba(0,0,0,.12)", opacity: c.o, fontFamily: UI, zIndex: 15 }}>
      <div style={{ textAlign: "center", fontSize: 20, color: "#404040", padding: "12px 0 0", fontFamily: /[ঀ-৿]/.test(c.title || "") ? BN : UI }}>{c.title}</div>
      {c.kind === "pie" ? (() => { const tot = c.values.reduce((a, b) => a + b, 0) || 1; let acc = 0; const R = Math.min(pw, ph) / 2, cx = c.w / 2 - 80, cy = 50 + ph / 2 + 10;
        return <svg width={c.w} height={c.h - 40} style={{ position: "absolute", left: 0, top: 40 }}>
          {c.values.map((val, i) => { const a0 = (acc / tot) * Math.PI * 2 * c.k - Math.PI / 2; acc += val; const a1 = (acc / tot) * Math.PI * 2 * c.k - Math.PI / 2; const big = a1 - a0 > Math.PI ? 1 : 0;
            return <path key={i} d={`M${cx},${cy - 40} L${cx + R * Math.cos(a0)},${cy - 40 + R * Math.sin(a0)} A${R},${R} 0 ${big} 1 ${cx + R * Math.cos(a1)},${cy - 40 + R * Math.sin(a1)} Z`} fill={PAL[i % PAL.length]} stroke="#fff" strokeWidth={2} />; })}
          {c.labels.map((l, i) => <g key={i}><rect x={c.w - 190} y={40 + i * 30} width={16} height={16} fill={PAL[i % PAL.length]} /><text x={c.w - 166} y={53 + i * 30} fontSize={16} fill="#404040">{l} ({Math.round((c.values[i] / tot) * 100)}%)</text></g>)}
        </svg>; })() : (
        <svg width={c.w} height={c.h - 40} style={{ position: "absolute", left: 0, top: 40 }}>
          {[0, 0.25, 0.5, 0.75, 1].map((g) => <g key={g}><line x1={70} x2={70 + pw} y1={20 + ph * (1 - g)} y2={20 + ph * (1 - g)} stroke="#E6E6E6" /><text x={62} y={25 + ph * (1 - g)} fontSize={14} fill="#7F7F7F" textAnchor="end">{fmt(Math.round(max * g))}</text></g>)}
          {c.kind === "line" ? <polyline fill="none" stroke={c.color || PAL[0]} strokeWidth={4} points={c.values.map((val, i) => `${70 + (pw / n) * (i + 0.5)},${20 + ph - (val / max) * ph * c.k}`).join(" ")} />
            : c.values.map((val, i) => { const bw = (pw / n) * 0.6, hh = (val / max) * ph * c.k; return <rect key={i} x={70 + (pw / n) * (i + 0.2)} y={20 + ph - hh} width={bw} height={hh} fill={c.color || PAL[0]} rx={2} />; })}
          {c.kind === "line" && c.values.map((val, i) => <circle key={i} cx={70 + (pw / n) * (i + 0.5)} cy={20 + ph - (val / max) * ph * c.k} r={6} fill={c.color || PAL[0]} />)}
          {c.labels.map((l, i) => <text key={i} x={70 + (pw / n) * (i + 0.5)} y={ph + 46} fontSize={15} fill="#595959" textAnchor="middle">{l}</text>)}
        </svg>)}
    </div>
  );
};
export const Overlays: React.FC<{ o: Over; accent: string; top: number; bottom: number }> = ({ o, accent, top, bottom }) => (
  <>{o.charts.map((c, i) => <Chart key={i} c={c} />)}{o.pane && <Pane p={o.pane} top={top} bottom={bottom} />}{o.menu && <Menu m={o.menu} accent={accent} />}{o.dialog && <Dialog d={o.dialog} accent={accent} />}</>
);

/* ---------- concept card scene ("points"): heading + icon rows that appear along the VO ---------- */
export const Card: React.FC<{ children: React.ReactNode; style?: React.CSSProperties }> = ({ children, style }) => (
  <div style={{ position: "absolute", left: 140, right: 140, top: 110, bottom: 200, background: "#fff", borderRadius: 26, boxShadow: "0 30px 80px rgba(16,40,30,.18)", padding: "56px 70px", display: "flex", flexDirection: "column", ...style }}>{children}</div>
);
export const SPoints: React.FC<P & { accent: string }> = (p) => {
  const f = useCurrentFrame(); const { fps } = useVideoConfig(); const it: { icon?: string; t: string; d?: string }[] = p.s.items || [];
  return (
    <Card style={{ justifyContent: "center" }}>
      {p.s.kicker && <div style={{ fontFamily: BN, fontSize: 30, color: p.accent, opacity: interpolate(f, [4, 14], [0, 1], clamp) }}>{p.s.kicker}</div>}
      <div style={{ fontFamily: BN, fontSize: 58, fontWeight: 700, color: "#1F1F1F", lineHeight: 1.25, marginBottom: 34, opacity: interpolate(f, [6, 18], [0, 1], clamp) }}>{p.s.head}</div>
      <div style={{ display: "grid", gridTemplateColumns: it.length > 4 ? "1fr 1fr" : "1fr", gap: "26px 50px" }}>
        {it.map((x, i) => { const at = v(p, 0.06 + (0.78 * i) / Math.max(1, it.length)); const o = interpolate(f, [at, at + 10], [0, 1], clamp); return (
          <div key={i} style={{ display: "flex", gap: 20, alignItems: "flex-start", opacity: o, transform: `translateY(${(1 - o) * 14}px) scale(${0.97 + 0.03 * Math.min(1, pop(f, fps, at))})` }}>
            <div style={{ flex: "none", width: 76, height: 76, borderRadius: 18, background: p.accent + "1F", display: "grid", placeItems: "center" }}><Icon name={x.icon || "check"} size={40} color={p.accent} /></div>
            <div><div style={{ fontFamily: /[ঀ-৿]/.test(x.t) ? BN : UI, fontSize: 38, fontWeight: 600, color: "#1F1F1F", lineHeight: 1.3 }}>{x.t}</div>{x.d && <div style={{ fontFamily: BN, fontSize: 29, color: "#5F6368", lineHeight: 1.4 }}>{x.d}</div>}</div>
          </div>); })}
      </div>
    </Card>
  );
};

/* ---------- File backstage (Word / PowerPoint): Export → PDF or video ---------- */
export const Backstage: React.FC<{ b: { item?: string; o: number; pdf?: number }; color: string; color2: string; video?: boolean }> = ({ b, color, color2, video }) => (
  <div style={{ position: "absolute", inset: 0, opacity: b.o, background: "#fff", display: "flex", zIndex: 25, fontFamily: UI }}>
    <div style={{ width: 260, background: color, color: "#fff", padding: "26px 0", display: "flex", flexDirection: "column", gap: 4, fontSize: 17 }}>
      <div style={{ padding: "6px 26px 20px" }}>⟵</div>
      {["Home", "New", "Open", "Info", "Save", "Save As", "Print", "Share", "Export"].map((t) => <div key={t} style={{ padding: "10px 26px", background: b.item === t ? color2 : "transparent" }}>{t}</div>)}
    </div>
    <div style={{ flex: 1, padding: "34px 50px", color: "#1F1F1F" }}>
      <div style={{ fontSize: 34, fontWeight: 300, marginBottom: 26 }}>{b.item || "Info"}</div>
      {b.item === "Export" && <div style={{ display: "flex", gap: 40 }}>
        <div style={{ width: 360, display: "flex", flexDirection: "column", gap: 6, fontSize: 17 }}>
          <div style={{ padding: "16px 18px", background: !video ? color + "18" : "transparent", border: !video ? `1px solid ${color}` : "1px solid transparent" }}>📄 Create PDF/XPS Document</div>
          {video !== undefined && <div style={{ padding: "16px 18px", background: video ? color + "18" : "transparent", border: video ? `1px solid ${color}` : "1px solid transparent" }}>🎬 Create a Video</div>}
          <div style={{ padding: "16px 18px" }}>Change File Type</div>
        </div>
        <div style={{ fontSize: 16, color: "#5F6368", lineHeight: 1.6, width: 440 }}>{video ? <>Create a Video<br />• Full HD (1080p)<br />• Use recorded timings and narrations</> : <>Create a PDF/XPS Document<br />• Preserves layout, formatting, fonts, and images</>}
          <div style={{ marginTop: 18, width: 200, height: 90, border: "1px solid #D9D9D9", display: "grid", placeItems: "center", color: "#1F1F1F", background: b.pdf ? color + Math.round(0x22 * b.pdf).toString(16).padStart(2, "0") : "#fff" }}>{video ? "Create Video" : "Create PDF/XPS"}</div></div>
      </div>}
    </div>
  </div>
);
