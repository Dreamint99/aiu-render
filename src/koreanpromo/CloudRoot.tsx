// Cloud render entry (Dreamint99/aiu-render, kind=koreanpromo): props = public/koreanpromo/<id>/props.json
import React from "react";
import { Composition } from "remotion";
import { KoreanPromo, pLen, PSpec } from "./KoreanPromo";

const EMPTY: PSpec = { id: "x", scenes: [], total: 300 };
const meta = ({ props }: any) => ({ durationInFrames: pLen(props.spec) });
export const CloudRoot: React.FC = () => (
  <>
    <Composition id="KoreanPromoH" component={KoreanPromo as any} fps={30} width={1920} height={1080} durationInFrames={300} defaultProps={{ spec: EMPTY }} calculateMetadata={meta} />
    <Composition id="KoreanPromoV" component={KoreanPromo as any} fps={30} width={1080} height={1920} durationInFrames={300} defaultProps={{ spec: EMPTY }} calculateMetadata={meta} />
  </>
);
