import React from "react";
import { Composition } from "remotion";
import { KidsVideo, Spec } from "./KidsEngine";

const EMPTY: Spec = { id: "x", title: "", sub: "", color: "#4D7CFE", script: "latin", scenes: [], total: 300 };
export const CloudRoot: React.FC = () => (
  <Composition id="KidsLesson" component={KidsVideo as any} fps={30} width={1920} height={1080} durationInFrames={300}
    defaultProps={{ spec: EMPTY }} calculateMetadata={({ props }: any) => ({ durationInFrames: props.spec.total })} />
);
