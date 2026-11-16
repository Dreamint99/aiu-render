// Cloud render entry for the public render repo (Dreamint99/aiu-render): the academy lesson spec arrives as --props.
import React from "react";
import { Composition } from "remotion";
import { AcademyVideo, academyLen, Spec } from "./AcademyEngine";

const EMPTY: Spec = { id: "x", course: "", chapter: "", lessonNo: "", title: "", next: "", scenes: [] };
export const CloudRoot: React.FC = () => (
  <Composition id="AcadLesson" component={AcademyVideo as any} fps={30} width={1920} height={1080} durationInFrames={300}
    defaultProps={{ spec: EMPTY }} calculateMetadata={({ props }: any) => ({ durationInFrames: Math.max(60, academyLen(props.spec)) })} />
);
