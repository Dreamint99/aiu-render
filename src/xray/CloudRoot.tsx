// Cloud render entry for "চলো প্রোগ্রামিং বুঝি" lesson videos (Dreamint99/aiu-render): the spec arrives as --props, the repo holds only the engine.
import React from "react";
import { Composition } from "remotion";
import { XrayVideo, xrayLen, Spec } from "./XrayEngine";

const EMPTY: Spec = { id: "x", course: "", lessonNo: "", title: "", next: "", scenes: [] };
export const CloudRoot: React.FC = () => (
  <Composition id="XrayLesson" component={XrayVideo as any} fps={30} width={1920} height={1080} durationInFrames={300}
    defaultProps={{ spec: EMPTY }} calculateMetadata={({ props }: any) => ({ durationInFrames: xrayLen(props.spec) })} />
);
