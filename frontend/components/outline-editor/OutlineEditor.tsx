"use client";

import clsx from "clsx";
import { useRef, useState } from "react";
import type { Outline } from "@/lib/types";
import { ParagraphBlock } from "./ParagraphBlock";
import { TableBlock } from "./TableBlock";
import { ImageBlock } from "./ImageBlock";
import { FieldBlock } from "./FieldBlock";

interface Props {
  initial: Outline;
  onChange: (next: Outline) => void;
}

export function OutlineEditor({ initial, onChange }: Props) {
  const [outline, setOutline] = useState(initial);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const lastClickedRef = useRef<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  function paragraphIds(): string[] {
    return outline.blocks.filter((b) => b.kind === "paragraph").map((b) => b.id);
  }

  function applySelection(next: Set<string>) {
    setSelected(next);
  }

  function handleSelect(id: string, mods: { shift: boolean; meta: boolean }) {
    const block = outline.blocks.find((b) => b.id === id);
    if (!block || block.kind !== "paragraph") return;

    if (mods.shift && lastClickedRef.current) {
      const ids = paragraphIds();
      const start = ids.indexOf(lastClickedRef.current);
      const end = ids.indexOf(id);
      if (start === -1 || end === -1) {
        applySelection(new Set([id]));
      } else {
        const [a, b] = start <= end ? [start, end] : [end, start];
        const range = ids.slice(a, b + 1);
        applySelection(new Set(range));
      }
      // shift-click 범위 선택 시 anchor는 유지
      containerRef.current?.focus();
      return;
    }

    if (mods.meta) {
      const next = new Set(selected);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      applySelection(next);
      lastClickedRef.current = id;
      containerRef.current?.focus();
      return;
    }

    // 단순 클릭 — 그 블록만
    applySelection(new Set([id]));
    lastClickedRef.current = id;
    containerRef.current?.focus();
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLDivElement>) {
    if (e.key !== "Tab") return;
    if (selected.size === 0) return;
    e.preventDefault();
    const delta = e.shiftKey ? -1 : 1;
    const next = {
      ...outline,
      blocks: outline.blocks.map((b) => {
        if (!selected.has(b.id) || b.kind !== "paragraph") return b;
        const newLevel = Math.max(0, Math.min(3, b.level + delta));
        if (newLevel === b.level) return b;
        return { ...b, level: newLevel, detected_by: "user" as const };
      }),
    };
    setOutline(next);
    onChange(next);
  }

  const count = selected.size;

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-xs text-text-muted">
        <span>
          {count > 0 ? (
            <>
              <span className="font-medium text-primary">{count}개 선택됨</span>
              <span className="mx-2">·</span>
              <kbd className="rounded bg-surface px-1.5 py-0.5">Tab</kbd>
              <span className="mx-1">/</span>
              <kbd className="rounded bg-surface px-1.5 py-0.5">Shift+Tab</kbd>
              으로 일괄 레벨 변경
            </>
          ) : (
            <>클릭으로 단일 선택 · Shift+클릭 범위 · ⌘/Ctrl+클릭 토글</>
          )}
        </span>
        {count > 0 ? (
          <button
            type="button"
            onClick={() => setSelected(new Set())}
            className="rounded-token border border-border px-2 py-0.5 text-xs hover:bg-surface"
          >
            선택 해제
          </button>
        ) : null}
      </div>

      <div
        ref={containerRef}
        tabIndex={0}
        onKeyDown={handleKeyDown}
        className={clsx(
          "flex flex-col gap-1 rounded-token-lg border bg-surface-elevated p-6 shadow-token-sm outline-none",
          count > 0 ? "border-primary/40" : "border-border",
        )}
      >
        {outline.blocks.map((b) => {
          if (b.kind === "paragraph")
            return (
              <ParagraphBlock
                key={b.id}
                block={b}
                isSelected={selected.has(b.id)}
                onSelect={handleSelect}
              />
            );
          if (b.kind === "table") return <TableBlock key={b.id} block={b} />;
          if (b.kind === "image") return <ImageBlock key={b.id} block={b} />;
          return <FieldBlock key={b.id} block={b} />;
        })}
      </div>
    </div>
  );
}
