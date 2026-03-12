"use client";

import { File, Folder } from "lucide-react";
import { cn } from "@/lib/utils";

interface FileTreeProps {
  files: Record<string, string>;
  selectedFile: string | null;
  onSelect: (filename: string) => void;
}

export function FileTree({ files, selectedFile, onSelect }: FileTreeProps) {
  const filenames = Object.keys(files).sort();

  if (filenames.length === 0) {
    return (
      <div className="p-4 text-sm text-muted-foreground">No files generated yet.</div>
    );
  }

  const grouped: Record<string, string[]> = {};
  for (const f of filenames) {
    const parts = f.split("/");
    const dir = parts.length > 1 ? parts.slice(0, -1).join("/") : "";
    if (!grouped[dir]) grouped[dir] = [];
    grouped[dir].push(f);
  }

  return (
    <div className="py-2">
      {Object.entries(grouped).map(([dir, dirFiles]) => (
        <div key={dir}>
          {dir && (
            <div className="flex items-center gap-2 px-3 py-1 text-xs text-muted-foreground">
              <Folder className="w-3 h-3" />
              {dir}
            </div>
          )}
          {dirFiles.map((f) => (
            <button
              key={f}
              onClick={() => onSelect(f)}
              className={cn(
                "w-full flex items-center gap-2 px-3 py-1.5 text-sm text-left hover:bg-accent transition",
                f === selectedFile && "bg-accent text-accent-foreground"
              )}
            >
              <File className="w-3.5 h-3.5 flex-shrink-0" />
              <span className="truncate">{f.split("/").pop()}</span>
            </button>
          ))}
        </div>
      ))}
    </div>
  );
}
