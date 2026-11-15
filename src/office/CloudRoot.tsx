// Cloud render entry for অফিস মাস্টারক্লাস lesson videos (Dreamint99/aiu-render): the spec arrives as --props, the repo holds only the engine.
import React from "react";
import { Composition } from "remotion";
import { OfficeVideo, officeLen, Spec } from "./ExcelEngine";

const EMPTY: Spec = { id: "x", course: "", lessonNo: "", title: "", next: "", file: "", scenes: [] };
export const CloudRoot: React.FC = () => (
  <Composition id="OfficeLesson" component={OfficeVideo as any} fps={30} width={1920} height={1080} durationInFrames={300}
    defaultProps={{ spec: EMPTY }} calculateMetadata={({ props }: any) => ({ durationInFrames: officeLen(props.spec) })} />
);
