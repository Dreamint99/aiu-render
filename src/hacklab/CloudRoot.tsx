// Cloud render entry for ঘরে বসে হ্যাকিং lesson videos (Dreamint99/aiu-render): the spec arrives as --props, the repo holds only the engine.
import React from "react";
import { Composition } from "remotion";
import { HackVideo, hackLen, Spec } from "./HackEngine";

const EMPTY: Spec = { id: "x", course: "", lessonNo: "", title: "", next: "", scenes: [] };
export const CloudRoot: React.FC = () => (
  <Composition id="HackLesson" component={HackVideo as any} fps={30} width={1920} height={1080} durationInFrames={300}
    defaultProps={{ spec: EMPTY }} calculateMetadata={({ props }: any) => ({ durationInFrames: hackLen(props.spec) })} />
);
