import React from "react";
import { Composition } from "remotion";
import { PocketVideo, pocketLen, KSpec } from "./PocketEngine";

const EMPTY = { id: "x", title: "", sub: "", trainer: { name: "", tag: "", avatar: "" }, color: ["#000", "#000"], scenes: [] } as unknown as KSpec;
export const CloudRoot: React.FC = () => (
  <Composition id="PocketLesson" component={PocketVideo as any} fps={30} width={1920} height={1080} durationInFrames={300}
    defaultProps={{ spec: EMPTY }} calculateMetadata={({ props }: any) => ({ durationInFrames: pocketLen(props.spec) })} />
);
