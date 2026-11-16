// Cloud render entry (Dreamint99/aiu-render): film.json arrives as --props.
import React from "react";
import { Composition } from "remotion";
import { SongFilm } from "./SongFilm";

export const CloudRoot: React.FC = () => (
  <Composition id="AIUSong" component={SongFilm as any} fps={30} width={1920} height={1080} durationInFrames={300}
    defaultProps={{ film: { total: 10, shots: [], lyrics: [], flashes: [] } }}
    calculateMetadata={({ props }: any) => ({ durationInFrames: Math.round(props.film.total * 30) })} />
);
