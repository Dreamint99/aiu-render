// Cloud render entry for the air-ticketing (GDS) lesson videos: the spec arrives as --props, the repo holds only the engine.
import React from "react";
import { Composition } from "remotion";
import { GdsVideo, gdsLen, Spec } from "./GdsEngine";

const EMPTY: Spec = { id: "x", course: "", module: "", lessonNo: "", title: "", next: "", scenes: [] };
export const CloudRoot: React.FC = () => (
  <Composition id="GdsLesson" component={GdsVideo as any} fps={30} width={1920} height={1080} durationInFrames={300}
    defaultProps={{ spec: EMPTY }} calculateMetadata={({ props }: any) => ({ durationInFrames: gdsLen(props.spec) })} />
);
