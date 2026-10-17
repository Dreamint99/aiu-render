// Cloud render entry for the vibe-coding lesson videos: the spec arrives as --props, the repo holds only the engine.
import React from "react";
import { Composition } from "remotion";
import { VibeVideo, vibeLen, Spec } from "./VibeEngine";

const EMPTY: Spec = { id: "x", course: "", module: "", lessonNo: "", title: "", next: "", scenes: [] };
export const CloudRoot: React.FC = () => (
  <Composition id="VibeLesson" component={VibeVideo as any} fps={30} width={1920} height={1080} durationInFrames={300}
    defaultProps={{ spec: EMPTY }} calculateMetadata={({ props }: any) => ({ durationInFrames: vibeLen(props.spec) })} />
);
