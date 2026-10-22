// Cloud render entry (Dreamint99/aiu-render): props = public/boardpromo/board-reel/props.json
import React from "react";
import { Composition } from "remotion";
import { BoardPromo, promoLen, Spec } from "./BoardPromo";
import { BoardPromoH } from "./BoardPromoH";

const EMPTY: Spec = { id: "main", scenes: [], total: 300 };
export const CloudRoot: React.FC = () => (
  <>
  <Composition id="BoardPromoWide" component={BoardPromoH as any} fps={30} width={1920} height={1080} durationInFrames={300}
    defaultProps={{ spec: EMPTY }} calculateMetadata={({ props }: any) => ({ durationInFrames: promoLen(props.spec) })} />
  <Composition id="BoardPromoReel" component={BoardPromo as any} fps={30} width={1080} height={1920} durationInFrames={300}
    defaultProps={{ spec: EMPTY }} calculateMetadata={({ props }: any) => ({ durationInFrames: promoLen(props.spec) })} />
  </>
);
