"use client";

import clsx from "clsx";
import type { Block } from "@/lib/types";

interface Props {
  block: Block;
  onChangeLevel: (id: string, newLevel: number) => void;
}

const LEVEL_INDENT = ["pl-0", "pl-0", "pl-8", "pl-16"];
const LEVEL_TEXT_SIZE = ["text-base", "text-xl", "text-lg", "text-base"];

export function ParagraphBlock({ block, onChangeLevel }: Props) {
  function handleKeyDown(e: React.KeyboardEvent<HTMLDivElement>) {
    if (e.key === "Tab" && !e.shiftKey) {
      e.preventDefault();
      onChangeLevel(block.id, Math.min(3, block.level + 1));
    } else if (e.key === "Tab" && e.shiftKey) {
      e.preventDefault();
      onChangeLevel(block.id, Math.max(0, block.level - 1));
    }
  }

  const isHeading = block.level >= 1;
  const heuristic = block.detected_by === "heuristic";

  return (
    <div
      tabIndex={0}
      role="textbox"
      aria-label={`paragraph level ${block.level}`}
      onKeyDown={handleKeyDown}
      className={clsx(
        LEVEL_INDENT[block.level] ?? "pl-16",
        LEVEL_TEXT_SIZE[block.level] ?? "text-base",
        "group cursor-pointer rounded-token border-l-2 px-3 py-1.5 outline-none transition focus:bg-primary/5 focus:border-primary",
        isHeading ? "font-semibold" : "font-normal",
        !isHeading && "text-text",
        heuristic ? "border-warning/60" : "border-transparent",
      )}
    >
      <span
        className={clsx(
          "mr-2 inline-block min-w-[2.5rem] text-xs font-medium uppercase tracking-wide opacity-60 group-focus:opacity-100",
          heuristic ? "text-warning" : "text-text-muted",
        )}
      >
        {block.level === 0 ? "본문" : `H${block.level}`}
        {heuristic ? " ⚠" : ""}
      </span>
      {block.text}
    </div>
  );
}
