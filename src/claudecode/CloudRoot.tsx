// Cloud render entry for Claude Code মাস্টারক্লাস videos (Dreamint99/aiu-render): the spec arrives as --props.
import React from "react";
import { Composition } from "remotion";
import { CcVideo, ccLen, Spec } from "./CcEngine";

const EMPTY: Spec = { id: "x", course: "", lessonNo: "", title: "", next: "", scenes: [] };
export const CloudRoot: React.FC = () => (
  <Composition id="CcLesson" component={CcVideo as any} fps={30} width={1920} height={1080} durationInFrames={300}
    defaultProps={{ spec: EMPTY }} calculateMetadata={({ props }: any) => ({ durationInFrames: ccLen(props.spec) })} />
);
