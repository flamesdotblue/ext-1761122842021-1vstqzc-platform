import { Film } from "lucide-react";

export default function Header() {
  return (
    <header className="sticky top-0 z-10 border-b border-neutral-800 bg-neutral-950/70 backdrop-blur supports-[backdrop-filter]:bg-neutral-950/60">
      <div className="mx-auto flex max-w-6xl items-center gap-3 px-4 py-3">
        <div className="flex size-9 items-center justify-center rounded-md bg-indigo-600">
          <Film className="size-5 text-white" />
        </div>
        <div>
          <h1 className="text-lg font-semibold tracking-tight">Clipcraft</h1>
          <p className="text-xs text-neutral-400">Lightweight in-browser video editor</p>
        </div>
      </div>
    </header>
  );
}
