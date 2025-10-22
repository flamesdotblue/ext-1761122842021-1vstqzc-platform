import { Volume2, VolumeX } from "lucide-react";

function formatTime(s) {
  if (!Number.isFinite(s)) return "0:00";
  const sign = s < 0 ? "-" : "";
  s = Math.max(0, Math.floor(Math.abs(s)));
  const m = Math.floor(s / 60)
    .toString()
    .padStart(1, "0");
  const sec = (s % 60).toString().padStart(2, "0");
  return `${sign}${m}:${sec}`;
}

export default function ControlBar({
  duration,
  trimStart,
  trimEnd,
  setTrimStart,
  setTrimEnd,
  playbackRate,
  setPlaybackRate,
  muted,
  setMuted,
  overlayText,
  setOverlayText,
  hasVideo,
}) {
  const minGap = 0.1;

  return (
    <div className="rounded-xl border border-neutral-800 bg-neutral-900/50 p-4">
      <h2 className="mb-3 text-sm font-medium text-neutral-200">Editor Controls</h2>

      <div className="space-y-4">
        <div>
          <label className="flex items-center justify-between text-xs text-neutral-400">
            <span>Trim Start</span>
            <span className="tabular-nums text-neutral-300">{formatTime(trimStart)}</span>
          </label>
          <input
            type="range"
            min={0}
            max={Math.max(minGap, duration - minGap)}
            step={0.01}
            value={Math.min(trimStart, Math.max(minGap, duration - minGap))}
            onChange={(e) => {
              const v = parseFloat(e.target.value);
              setTrimStart(Math.min(v, trimEnd - minGap));
            }}
            className="range range-sm mt-1 w-full accent-indigo-500"
            disabled={!hasVideo}
          />
        </div>

        <div>
          <label className="flex items-center justify-between text-xs text-neutral-400">
            <span>Trim End</span>
            <span className="tabular-nums text-neutral-300">{formatTime(trimEnd)}</span>
          </label>
          <input
            type="range"
            min={minGap}
            max={duration}
            step={0.01}
            value={Math.max(trimEnd, minGap)}
            onChange={(e) => {
              const v = parseFloat(e.target.value);
              setTrimEnd(Math.max(v, trimStart + minGap));
            }}
            className="range range-sm mt-1 w-full accent-indigo-500"
            disabled={!hasVideo}
          />
        </div>

        <div className="grid grid-cols-3 gap-3">
          <div className="col-span-2">
            <label className="flex items-center justify-between text-xs text-neutral-400">
              <span>Playback Speed</span>
              <span className="text-neutral-300">{playbackRate.toFixed(2)}×</span>
            </label>
            <input
              type="range"
              min={0.25}
              max={2}
              step={0.05}
              value={playbackRate}
              onChange={(e) => setPlaybackRate(parseFloat(e.target.value))}
              className="range range-sm mt-1 w-full accent-indigo-500"
              disabled={!hasVideo}
            />
          </div>

          <div className="flex items-end">
            <button
              onClick={() => setMuted((m) => !m)}
              className="inline-flex w-full items-center justify-center gap-2 rounded-md border border-neutral-800 bg-neutral-900/70 px-3 py-2 text-sm font-medium hover:bg-neutral-800"
              disabled={!hasVideo}
            >
              {muted ? <VolumeX className="size-4" /> : <Volume2 className="size-4" />}
              {muted ? "Muted" : "Sound On"}
            </button>
          </div>
        </div>

        <div>
          <label className="mb-1 block text-xs text-neutral-400">Overlay Text</label>
          <input
            value={overlayText}
            onChange={(e) => setOverlayText(e.target.value)}
            placeholder="Enter text to overlay on video"
            className="w-full rounded-md border border-neutral-800 bg-neutral-900/70 px-3 py-2 text-sm outline-none placeholder:text-neutral-500 focus:border-indigo-600"
            disabled={!hasVideo}
          />
          <p className="mt-1 text-xs text-neutral-500">Text appears centered near the bottom.</p>
        </div>
      </div>
    </div>
  );
}
