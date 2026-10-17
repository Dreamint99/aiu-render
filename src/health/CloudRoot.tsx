// Cloud render entry for the family-health lesson videos: the spec arrives as --props, the repo holds only the engine.
import React from "react";
import { Composition } from "remotion";
import { HealthVideo, healthLen, Spec } from "./HealthEngine";

const EMPTY: Spec = { id: "x", course: "", module: "", lessonNo: "", title: "", next: "", scenes: [] };
export const CloudRoot: React.FC = () => (
  <Composition id="HealthLesson" component={HealthVideo as any} fps={30} width={1920} height={1080} durationInFrames={300}
    defaultProps={{ spec: EMPTY }} calculateMetadata={({ props }: any) => ({ durationInFrames: healthLen(props.spec) })} />
);
