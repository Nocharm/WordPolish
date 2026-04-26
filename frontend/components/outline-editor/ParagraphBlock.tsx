"use client";

import clsx from "clsx";
import type { Block } from "@/lib/types";

interface Props {
  block: Block;
  isSelected: boolean;
  onSelect: (id: string, mods: { shift: boolean; meta: boolean }) => void;
}

const LEVEL_INDENT = ["pl-0", "pl-0", "pl-8", "pl-16"];
const LEVEL_TEXT_SIZE = ["text-base", "text-xl", "text-lg", "text-base"];

export function ParagraphBlock({ block, isSelected, onSelect }: Props) {
  const isHeading = block.level >= 1;
  const heuristic = block.detected_by === "heuristic";

  function handleClick(e: React.MouseEvent) {
    onSelect(block.id, { shift: e.shiftKey, meta: e.metaKey || e.ctrlKey });
  }

  return (
    <div
      role="button"
      aria-pressed={isSelected}
      onClick={handleClick}
      className={clsx(
        LEVEL_INDENT[block.level] ?? "pl-16",
        LEVEL_TEXT_SIZE[block.level] ?? "text-base",
        "group cursor-pointer rounded-token border-l-2 px-3 py-1.5 outline-none transition select-none",
        isHeading ? "font-semibold" : "font-normal",
        !isHeading && "text-text",
        isSelected
          ? "bg-primary/10 border-primary"
          : heuristic
            ? "border-warning/60"
            : "border-transparent",
      )}
    >
      <span
        className={clsx(
          "mr-2 inline-block min-w-[2.5rem] text-xs font-medium uppercase tracking-wide opacity-60 group-hover:opacity-100",
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
