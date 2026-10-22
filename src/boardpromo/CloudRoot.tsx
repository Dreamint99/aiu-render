// Cloud render entry (Dreamint99/aiu-render): props = public/boardpromo/board-reel/props.json
import React from "react";
import { Composition } from "remotion";
import { BoardPromo, promoLen, Spec } from "./BoardPromo";

const EMPTY: Spec = { id: "main", scenes: [], total: 300 };
export const CloudRoot: React.FC = () => (
  <Composition id="BoardPromoReel" component={BoardPromo as any} fps={30} width={1080} height={1920} durationInFrames={300}
    defaultProps={{ spec: EMPTY }} calculateMetadata={({ props }: any) => ({ durationInFrames: promoLen(props.spec) })} />
);
