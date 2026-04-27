"use client";

import clsx from "clsx";
import { useEffect, useRef, useState } from "react";
import type { Block } from "@/lib/types";

interface Props {
  block: Block;
  isSelected: boolean;
  onSelect: (id: string, mods: { shift: boolean; meta: boolean }) => void;
  onTextChange: (id: string, text: string) => void;
}

const LEVEL_INDENT = ["pl-0", "pl-0", "pl-6", "pl-12", "pl-16", "pl-20"];
const LEVEL_TEXT_SIZE = ["text-base", "text-2xl", "text-xl", "text-lg", "text-base", "text-base"];

export function ParagraphBlock({ block, isSelected, onSelect, onTextChange }: Props) {
  const [editing, setEditing] = useState(false);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const [draft, setDraft] = useState(block.text ?? "");

  useEffect(() => {
    setDraft(block.text ?? "");
  }, [block.text]);

  useEffect(() => {
    if (editing) {
      inputRef.current?.focus();
      inputRef.current?.select();
    }
  }, [editing]);

  const isHeading = block.level >= 1;
  const heuristic = block.detected_by === "heuristic";

  function handleClick(e: React.MouseEvent) {
    if (editing) return;
    onSelect(block.id, { shift: e.shiftKey, meta: e.metaKey || e.ctrlKey });
  }

  function commitEdit() {
    setEditing(false);
    if (draft !== (block.text ?? "")) {
      onTextChange(block.id, draft);
    }
  }

  function handleEditKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      commitEdit();
    } else if (e.key === "Escape") {
      e.preventDefault();
      setDraft(block.text ?? "");
      setEditing(false);
    }
  }

  return (
    <div
      role="button"
      aria-pressed={isSelected}
      onClick={handleClick}
      onDoubleClick={() => setEditing(true)}
      className={clsx(
        LEVEL_INDENT[block.level] ?? "pl-20",
        LEVEL_TEXT_SIZE[block.level] ?? "text-base",
        "group flex items-start gap-2 cursor-pointer rounded-token border-l-2 px-3 py-1.5 outline-none transition select-none",
        isHeading ? "font-semibold" : "font-normal",
        !isHeading && "text-text",
        isSelected
          ? "bg-primary/10 border-primary"
          : heuristic
            ? "border-warning/60"
            : "border-transparent hover:border-border",
      )}
    >
      <span
        className={clsx(
          "mr-1 inline-block min-w-[2.5rem] text-xs font-medium uppercase tracking-wide opacity-60 group-hover:opacity-100",
          heuristic ? "text-warning" : "text-text-muted",
        )}
      >
        {block.level === 0 ? "본문" : `H${block.level}`}
        {heuristic ? " ⚠" : ""}
      </span>

      {editing ? (
        <textarea
          ref={inputRef}
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onBlur={commitEdit}
          onKeyDown={handleEditKeyDown}
          onClick={(e) => e.stopPropagation()}
          rows={1}
          className="flex-1 resize-none rounded border border-primary/40 bg-bg px-2 py-0.5 outline-none focus:border-primary"
        />
      ) : (
        <span className="flex-1 whitespace-pre-wrap break-words">
          {block.text || <span className="italic text-text-muted">(빈 문단)</span>}
        </span>
      )}
    </div>
  );
}
