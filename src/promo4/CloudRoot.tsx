// Cloud render entry for the promo4 free-course promos: { spec, durs } arrive as --props, the repo holds only the engine.
import React from "react";
import { Composition } from "remotion";
import { Promo4, promo4Len, Spec } from "./Promo4";

const EMPTY: Spec = { id: "x", pid: "x", assets: "x", theme: "snake", course: "", title: "", url: "", guru: "", scenes: [] };
const meta = ({ props }: any) => ({ durationInFrames: promo4Len(props.durs) });
export const CloudRoot: React.FC = () => (
  <>
    <Composition id="Promo4H" component={Promo4 as any} fps={30} width={1920} height={1080} durationInFrames={300} defaultProps={{ spec: EMPTY, durs: [] }} calculateMetadata={meta} />
    <Composition id="Promo4V" component={Promo4 as any} fps={30} width={1080} height={1920} durationInFrames={300} defaultProps={{ spec: EMPTY, durs: [] }} calculateMetadata={meta} />
  </>
);
