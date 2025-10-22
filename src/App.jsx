import { useRef, useState, useCallback } from "react";
import Header from "./components/Header";
import VideoPlayer from "./components/VideoPlayer";
import ControlBar from "./components/ControlBar";
import ExportPanel from "./components/ExportPanel";

export default function App() {
  const videoRef = useRef(null);
  const [videoUrl, setVideoUrl] = useState(null);
  const [duration, setDuration] = useState(0);

  const [trimStart, setTrimStart] = useState(0);
  const [trimEnd, setTrimEnd] = useState(0);
  const [muted, setMuted] = useState(false);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [overlayText, setOverlayText] = useState("");

  const handleLoadedMetadata = useCallback((d) => {
    setDuration(d);
    setTrimStart(0);
    setTrimEnd(d);
  }, []);

  const handleSelectFile = (file) => {
    if (!file) return;
    if (videoUrl) URL.revokeObjectURL(videoUrl);
    const url = URL.createObjectURL(file);
    setVideoUrl(url);
  };

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100">
      <Header />

      <main className="mx-auto max-w-6xl px-4 pb-24">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-12">
          <section className="md:col-span-8">
            <VideoPlayer
              videoRef={videoRef}
              videoUrl={videoUrl}
              onSelectFile={handleSelectFile}
              onLoadedMetadata={handleLoadedMetadata}
              overlayText={overlayText}
              playbackRate={playbackRate}
              muted={muted}
              trimStart={trimStart}
              trimEnd={trimEnd}
            />
          </section>

          <aside className="md:col-span-4 space-y-6">
            <ControlBar
              duration={duration}
              trimStart={trimStart}
              trimEnd={trimEnd}
              setTrimStart={setTrimStart}
              setTrimEnd={setTrimEnd}
              playbackRate={playbackRate}
              setPlaybackRate={setPlaybackRate}
              muted={muted}
              setMuted={setMuted}
              overlayText={overlayText}
              setOverlayText={setOverlayText}
              hasVideo={!!videoUrl}
            />

            <ExportPanel
              videoRef={videoRef}
              hasVideo={!!videoUrl}
              trimStart={trimStart}
              trimEnd={trimEnd}
              muted={muted}
              overlayText={overlayText}
            />
          </aside>
        </div>
      </main>
    </div>
  );
}
