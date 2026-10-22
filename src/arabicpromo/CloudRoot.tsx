// Cloud render entry (Dreamint99/aiu-render, kind=arabicpromo): props = public/arabicpromo/<id>/props.json
import React from "react";
import { Composition } from "remotion";
import { ArabicPromo, pLen, PSpec } from "./ArabicPromo";

const EMPTY: PSpec = { id: "x", scenes: [], total: 300 };
const meta = ({ props }: any) => ({ durationInFrames: pLen(props.spec) });
export const CloudRoot: React.FC = () => (
  <>
    <Composition id="ArabicPromoH" component={ArabicPromo as any} fps={30} width={1920} height={1080} durationInFrames={300} defaultProps={{ spec: EMPTY }} calculateMetadata={meta} />
    <Composition id="ArabicPromoV" component={ArabicPromo as any} fps={30} width={1080} height={1920} durationInFrames={300} defaultProps={{ spec: EMPTY }} calculateMetadata={meta} />
  </>
);
