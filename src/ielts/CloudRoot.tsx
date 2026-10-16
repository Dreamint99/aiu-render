// Cloud render entry for the public render repo (Dreamint99/aiu-render): the lesson spec arrives as --props, so the repo
// needs no course content — only this engine. Local renders keep using IeltsRoot.tsx.
import React from "react";
import { Composition } from "remotion";
import { IeltsVideo, ieltsLen, Spec } from "./IeltsEngine";

const EMPTY: Spec = { id: "x", course: "", module: "", lessonNo: "", title: "", next: "", scenes: [] };
export const CloudRoot: React.FC = () => (
  <Composition id="IeltsLesson" component={IeltsVideo as any} fps={30} width={1920} height={1080} durationInFrames={300}
    defaultProps={{ spec: EMPTY }} calculateMetadata={({ props }: any) => ({ durationInFrames: ieltsLen(props.spec) })} />
);
