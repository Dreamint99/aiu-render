// Cloud render entry (Dreamint99/aiu-render, kind=coursepromo): props = public/<brand.dir>/<id>/props.json
import React from "react";
import { Composition } from "remotion";
import { CoursePromo, p2Len, Spec2 } from "./CoursePromo";

const EMPTY: Spec2 = { id: "x", scenes: [], total: 300, brand: {} as any };
const meta = ({ props }: any) => ({ durationInFrames: p2Len(props.spec) });
export const CloudRoot: React.FC = () => (
  <>
    <Composition id="CoursePromoH" component={CoursePromo as any} fps={30} width={1920} height={1080} durationInFrames={300} defaultProps={{ spec: EMPTY }} calculateMetadata={meta} />
    <Composition id="CoursePromoV" component={CoursePromo as any} fps={30} width={1080} height={1920} durationInFrames={300} defaultProps={{ spec: EMPTY }} calculateMetadata={meta} />
  </>
);
