# aiu-render

Public GitHub Actions render worker for **AI University of Bangladesh** lesson videos (Remotion).

- Contains only the video engine (`src/ielts`), free OFL fonts and the AIU logo — no API keys, no course videos.
- Each render is started by a private script that uploads the lesson's spec and voice files as a temporary release,
  renders it in parallel chunks, and deletes the release and the 1-day artifact right after download.

© AI University of Bangladesh. The AIU name and logo are not licensed for reuse.

