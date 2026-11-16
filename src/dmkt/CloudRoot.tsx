// Cloud render entry for the public render repo (Dreamint99/aiu-render): the lesson spec arrives as --props.
import React from "react";
import { Composition } from "remotion";
import { DmktVideo, dmLen, Spec } from "./DmktEngine";

const EMPTY: Spec = { id: "x", course: "", module: "", lessonNo: "", title: "", next: "", scenes: [] };
export const CloudRoot: React.FC = () => (
  <Composition id="DmktLesson" component={DmktVideo as any} fps={30} width={1920} height={1080} durationInFrames={300}
    defaultProps={{ spec: EMPTY }} calculateMetadata={({ props }: any) => ({ durationInFrames: dmLen(props.spec) })} />
);
