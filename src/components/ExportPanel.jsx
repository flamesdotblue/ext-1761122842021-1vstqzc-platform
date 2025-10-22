import { useRef, useState } from "react";
import { Download, PlayCircle, Scissors } from "lucide-react";

export default function ExportPanel({ videoRef, hasVideo, trimStart, trimEnd, muted, overlayText }) {
  const [exporting, setExporting] = useState(false);
  const [downloadUrl, setDownloadUrl] = useState(null);
  const [status, setStatus] = useState("");
  const [blobSize, setBlobSize] = useState(0);
  const recorderRef = useRef(null);

  const cleanupUrl = () => {
    if (downloadUrl) URL.revokeObjectURL(downloadUrl);
    setDownloadUrl(null);
  };

  const exportClip = async () => {
    if (!videoRef.current) return;
    const video = videoRef.current;

    cleanupUrl();
    setExporting(true);
    setStatus("Preparing...");

    try {
      // Ensure metadata is loaded
      if (!Number.isFinite(video.duration) || video.duration === 0) {
        await new Promise((res) => {
          const onMeta = () => {
            video.removeEventListener("loadedmetadata", onMeta);
            res();
          };
          video.addEventListener("loadedmetadata", onMeta);
        });
      }

      // Create canvas for drawing frames with overlay
      const width = video.videoWidth || 1280;
      const height = video.videoHeight || 720;
      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext("2d");

      const fps = 30;
      const canvasStream = canvas.captureStream(fps);

      // Optionally add audio
      const finalStream = new MediaStream();
      const [videoTrack] = canvasStream.getVideoTracks();
      if (videoTrack) finalStream.addTrack(videoTrack);

      if (!muted) {
        try {
          const vs = video.captureStream?.() || video.mozCaptureStream?.();
          const audioTrack = vs?.getAudioTracks?.()[0];
          if (audioTrack) finalStream.addTrack(audioTrack);
        } catch (e) {
          // ignore if captureStream isn't available
        }
      }

      const mimeType =
        (MediaRecorder.isTypeSupported && MediaRecorder.isTypeSupported("video/webm;codecs=vp9,opus") &&
          "video/webm;codecs=vp9,opus") ||
        (MediaRecorder.isTypeSupported && MediaRecorder.isTypeSupported("video/webm;codecs=vp8,opus") &&
          "video/webm;codecs=vp8,opus") ||
        "video/webm";

      const chunks = [];
      const recorder = new MediaRecorder(finalStream, { mimeType, videoBitsPerSecond: 6_000_000 });
      recorderRef.current = recorder;

      recorder.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) chunks.push(e.data);
      };

      const recordingPromise = new Promise((resolve) => {
        recorder.onstop = () => resolve();
      });

      // Prepare drawing loop
      const drawOverlay = () => {
        if (!overlayText?.trim()) return;
        const text = overlayText.trim();
        const paddingY = 24;
        ctx.font = `${Math.floor(height * 0.05)}px Inter, system-ui, -apple-system, Roboto, sans-serif`;
        ctx.textAlign = "center";
        ctx.textBaseline = "bottom";
        // Shadow
        ctx.fillStyle = "rgba(0,0,0,0.6)";
        const metrics = ctx.measureText(text);
        const textHeight = metrics.actualBoundingBoxAscent + metrics.actualBoundingBoxDescent;
        const rectWidth = metrics.width + 24;
        const rectHeight = textHeight + 12;
        const rectX = width / 2 - rectWidth / 2;
        const rectY = height - paddingY - rectHeight / 2;
        ctx.fillRect(rectX, rectY - rectHeight + 8, rectWidth, rectHeight);
        // Text
        ctx.fillStyle = "#ffffff";
        ctx.fillText(text, width / 2, height - paddingY);
      };

      // Seek and start
      video.pause();
      video.muted = muted; // ensure user setting applies during export

      const ensureSeek = (time) =>
        new Promise((res) => {
          const onSeek = () => {
            video.removeEventListener("seeked", onSeek);
            res();
          };
          video.addEventListener("seeked", onSeek);
          video.currentTime = Math.min(Math.max(0, time), video.duration || time);
        });

      await ensureSeek(trimStart);

      // Start recording
      recorder.start(100);
      setStatus("Recording...");

      // Start playback at normal speed for accurate duration
      const prevRate = video.playbackRate;
      video.playbackRate = 1;
      await video.play().catch(() => {});

      let rafId;
      const render = () => {
        // Stop when out of range
        if (video.currentTime >= trimEnd) {
          cancelAnimationFrame(rafId);
          video.pause();
          recorder.stop();
          return;
        }
        // Draw current frame
        ctx.drawImage(video, 0, 0, width, height);
        drawOverlay();
        rafId = requestAnimationFrame(render);
      };
      render();

      await recordingPromise;

      setStatus("Finalizing...");

      const blob = new Blob(chunks, { type: mimeType });
      setBlobSize(blob.size);
      const url = URL.createObjectURL(blob);
      setDownloadUrl(url);

      // restore playback rate
      video.playbackRate = prevRate;
      setStatus("Done");
    } catch (err) {
      console.error(err);
      setStatus("Export failed. Your browser may not support capture/record.");
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="rounded-xl border border-neutral-800 bg-neutral-900/50 p-4">
      <h2 className="mb-3 flex items-center gap-2 text-sm font-medium text-neutral-200">
        <Scissors className="size-4" /> Export
      </h2>

      <div className="space-y-3">
        <button
          onClick={exportClip}
          disabled={!hasVideo || exporting}
          className="inline-flex w-full items-center justify-center gap-2 rounded-md bg-indigo-600 px-3 py-2 text-sm font-medium text-white hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <PlayCircle className="size-4" />
          {exporting ? "Exporting..." : "Export Clip (WebM)"}
        </button>

        {status && <p className="text-xs text-neutral-400">{status}</p>}

        {downloadUrl && (
          <a
            href={downloadUrl}
            download="clipcraft-export.webm"
            className="inline-flex w-full items-center justify-between rounded-md border border-neutral-800 bg-neutral-900/70 px-3 py-2 text-sm hover:bg-neutral-800"
          >
            <span className="flex items-center gap-2"><Download className="size-4" /> Download export</span>
            <span className="text-xs text-neutral-400">{(blobSize / (1024 * 1024)).toFixed(2)} MB</span>
          </a>
        )}

        <p className="text-xs leading-relaxed text-neutral-500">
          Notes: Export runs in your browser using Canvas and MediaRecorder. Audio export requires browser support for
          captureStream. For best results, use locally uploaded files. Cross-origin videos may block export due to
          security restrictions.
        </p>
      </div>
    </div>
  );
}
