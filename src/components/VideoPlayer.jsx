import { useEffect, useMemo, useRef, useState } from "react";

export default function VideoPlayer({
  videoRef,
  videoUrl,
  onSelectFile,
  onLoadedMetadata,
  overlayText,
  playbackRate,
  muted,
  trimStart,
  trimEnd,
}) {
  const [dragActive, setDragActive] = useState(false);
  const overlayRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    v.playbackRate = playbackRate || 1;
    v.muted = !!muted;
  }, [playbackRate, muted, videoRef]);

  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    const handleLoaded = () => {
      onLoadedMetadata?.(v.duration || 0);
    };
    v.addEventListener("loadedmetadata", handleLoaded);
    return () => v.removeEventListener("loadedmetadata", handleLoaded);
  }, [videoRef, onLoadedMetadata]);

  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    const ensureBounds = () => {
      if (!Number.isFinite(trimStart) || !Number.isFinite(trimEnd)) return;
      if (v.currentTime < trimStart) v.currentTime = trimStart;
      if (v.currentTime > trimEnd) v.currentTime = trimEnd;
    };
    const timeHandler = () => {
      if (v.currentTime >= trimEnd) {
        v.pause();
        v.currentTime = trimStart;
      }
    };
    const playHandler = ensureBounds;
    v.addEventListener("timeupdate", timeHandler);
    v.addEventListener("play", playHandler);
    return () => {
      v.removeEventListener("timeupdate", timeHandler);
      v.removeEventListener("play", playHandler);
    };
  }, [trimStart, trimEnd, videoRef]);

  const onDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith("video/")) onSelectFile(file);
  };

  const onFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith("video/")) onSelectFile(file);
  };

  const overlayStyles = useMemo(
    () => ({
      textShadow: "0 1px 2px rgba(0,0,0,0.8)",
    }),
    []
  );

  return (
    <div>
      {!videoUrl && (
        <div
          onDragEnter={() => setDragActive(true)}
          onDragLeave={() => setDragActive(false)}
          onDragOver={(e) => {
            e.preventDefault();
            e.stopPropagation();
          }}
          onDrop={onDrop}
          className={`relative flex aspect-video w-full items-center justify-center rounded-xl border border-dashed ${
            dragActive ? "border-indigo-500 bg-indigo-500/10" : "border-neutral-800 bg-neutral-900/50"
          }`}
        >
          <div className="text-center">
            <p className="text-sm text-neutral-300">Drag & drop a video here</p>
            <p className="mt-1 text-xs text-neutral-500">or</p>
            <button
              onClick={() => inputRef.current?.click()}
              className="mt-2 rounded-md bg-indigo-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-indigo-500"
            >
              Choose file
            </button>
            <input
              ref={inputRef}
              type="file"
              accept="video/*"
              className="hidden"
              onChange={onFileChange}
            />
          </div>
        </div>
      )}

      {videoUrl && (
        <div className="relative">
          <video
            ref={videoRef}
            src={videoUrl}
            className="aspect-video w-full rounded-xl bg-black"
            controls
            playsInline
          />

          {overlayText?.trim() && (
            <div
              ref={overlayRef}
              style={overlayStyles}
              className="pointer-events-none absolute inset-x-4 bottom-6 select-none text-center text-white"
            >
              <span className="rounded-md bg-black/30 px-2 py-1 text-lg font-semibold tracking-wide">
                {overlayText}
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
