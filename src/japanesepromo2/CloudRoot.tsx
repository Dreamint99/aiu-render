// Cloud render entry (Dreamint99/aiu-render, kind=japanesepromo2): props = public/japanesepromo2/<id>/props.json
import React from "react";
import { Composition } from "remotion";
import { JapanesePromo2, p2Len, Spec2 } from "./JapanesePromo2";

const EMPTY: Spec2 = { id: "x", scenes: [], total: 300 };
const meta = ({ props }: any) => ({ durationInFrames: p2Len(props.spec) });
export const CloudRoot: React.FC = () => (
  <>
    <Composition id="JapanesePromo2H" component={JapanesePromo2 as any} fps={30} width={1920} height={1080} durationInFrames={300} defaultProps={{ spec: EMPTY }} calculateMetadata={meta} />
    <Composition id="JapanesePromo2V" component={JapanesePromo2 as any} fps={30} width={1080} height={1920} durationInFrames={300} defaultProps={{ spec: EMPTY }} calculateMetadata={meta} />
  </>
);
