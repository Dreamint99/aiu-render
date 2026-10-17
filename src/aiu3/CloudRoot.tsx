import React from "react";
import { Composition } from "remotion";
import { AIU3, totalOf, MAIN_ORDER, REEL_ORDER } from "./Promo";
import durs from "./durs.json";

const meta = ({ props }: any) => ({ durationInFrames: totalOf(props.durs, props.vertical ? REEL_ORDER : MAIN_ORDER), width: props.vertical ? 1080 : 1920, height: props.vertical ? 1920 : 1080 });
export const AIU3Comps: React.FC = () => (
  <>
    <Composition id="AIU3-Main" component={AIU3 as any} fps={30} width={1920} height={1080} durationInFrames={300} defaultProps={{ durs, vertical: false }} calculateMetadata={meta} />
    <Composition id="AIU3-Reel" component={AIU3 as any} fps={30} width={1080} height={1920} durationInFrames={300} defaultProps={{ durs, vertical: true }} calculateMetadata={meta} />
  </>
);
