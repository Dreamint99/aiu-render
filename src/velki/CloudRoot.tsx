// Cloud render entry (Dreamint99/aiu-render, kind=velki): the spec arrives as --props, the repo holds only the engine.
import React from "react";
import { Composition } from "remotion";
import { VelkiVideo, velkiLen, Spec } from "./VelkiEngine";
import { VelkiPromoVideo, promoLen } from "./Promo";

const EMPTY: Spec = { id: "x", course: "", module: "", lessonNo: "", title: "", next: "", scenes: [] };
export const CloudRoot: React.FC = () => (
  <>
  <Composition id="VelkiLesson" component={VelkiVideo as any} fps={30} width={1920} height={1080} durationInFrames={300}
    defaultProps={{ spec: EMPTY }} calculateMetadata={({ props }: any) => ({ durationInFrames: Math.max(30, velkiLen(props.spec)) })} />
  <Composition id="VelkiPromo" component={VelkiPromoVideo as any} fps={30} width={1920} height={1080} durationInFrames={300} defaultProps={{ spec: { scenes: [] } }}
    calculateMetadata={({ props }: any) => ({ durationInFrames: Math.max(30, promoLen(props.spec)) })} />
  <Composition id="VelkiReel" component={VelkiPromoVideo as any} fps={30} width={1080} height={1920} durationInFrames={300} defaultProps={{ spec: { scenes: [] } }}
    calculateMetadata={({ props }: any) => ({ durationInFrames: Math.max(30, promoLen(props.spec)) })} />
  </>
);
