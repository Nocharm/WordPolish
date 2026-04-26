"use client";

import clsx from "clsx";
import { useRef, useState } from "react";
import type { Block, Outline } from "@/lib/types";
import { ParagraphBlock } from "./ParagraphBlock";
import { TableBlock } from "./TableBlock";
import { ImageBlock } from "./ImageBlock";
import { FieldBlock } from "./FieldBlock";

interface Props {
  initial: Outline;
  onChange: (next: Outline) => void;
}

const MAX_LEVEL = 5;

function newId(): string {
  return `b-new-${Math.random().toString(36).slice(2, 10)}`;
}

export function OutlineEditor({ initial, onChange }: Props) {
  const [outline, setOutline] = useState(initial);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const lastClickedRef = useRef<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  function paragraphIds(): string[] {
    return outline.blocks.filter((b) => b.kind === "paragraph").map((b) => b.id);
  }

  function update(next: Outline) {
    setOutline(next);
    onChange(next);
  }

  function handleSelect(id: string, mods: { shift: boolean; meta: boolean }) {
    const block = outline.blocks.find((b) => b.id === id);
    if (!block || block.kind !== "paragraph") return;

    if (mods.shift && lastClickedRef.current) {
      const ids = paragraphIds();
      const start = ids.indexOf(lastClickedRef.current);
      const end = ids.indexOf(id);
      if (start === -1 || end === -1) {
        setSelected(new Set([id]));
      } else {
        const [a, b] = start <= end ? [start, end] : [end, start];
        setSelected(new Set(ids.slice(a, b + 1)));
      }
      containerRef.current?.focus();
      return;
    }

    if (mods.meta) {
      const next = new Set(selected);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      setSelected(next);
      lastClickedRef.current = id;
      containerRef.current?.focus();
      return;
    }

    setSelected(new Set([id]));
    lastClickedRef.current = id;
    containerRef.current?.focus();
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLDivElement>) {
    if (e.key === "Tab" && selected.size > 0) {
      e.preventDefault();
      const delta = e.shiftKey ? -1 : 1;
      update({
        ...outline,
        blocks: outline.blocks.map((b) => {
          if (!selected.has(b.id) || b.kind !== "paragraph") return b;
          const newLevel = Math.max(0, Math.min(MAX_LEVEL, b.level + delta));
          if (newLevel === b.level) return b;
          return { ...b, level: newLevel, detected_by: "user" as const };
        }),
      });
      return;
    }

    if ((e.key === "Backspace" || e.key === "Delete") && selected.size > 0) {
      e.preventDefault();
      handleDeleteSelected();
    }
  }

  function handleAddBelow(id: string) {
    const idx = outline.blocks.findIndex((b) => b.id === id);
    if (idx === -1) return;
    const ref = outline.blocks[idx];
    const refLevel = ref.kind === "paragraph" ? ref.level : 0;
    const newBlock: Block = {
      id: newId(),
      kind: "paragraph",
      // 헤딩 아래 추가 시 본문(0)으로, 본문 아래면 동일하게 본문(0)
      level: refLevel >= 1 ? 0 : 0,
      text: "",
      detected_by: "user",
    };
    const blocks = [...outline.blocks.slice(0, idx + 1), newBlock, ...outline.blocks.slice(idx + 1)];
    update({ ...outline, blocks });
  }

  function handleDelete(id: string) {
    const next = outline.blocks.filter((b) => b.id !== id);
    if (next.length !== outline.blocks.length) {
      const newSel = new Set(selected);
      newSel.delete(id);
      setSelected(newSel);
      update({ ...outline, blocks: next });
    }
  }

  function handleDeleteSelected() {
    if (selected.size === 0) return;
    if (!confirm(`선택한 ${selected.size}개 블록을 삭제하시겠습니까?`)) return;
    const next = outline.blocks.filter((b) => !selected.has(b.id));
    setSelected(new Set());
    update({ ...outline, blocks: next });
  }

  function handleTextChange(id: string, text: string) {
    update({
      ...outline,
      blocks: outline.blocks.map((b) => (b.id === id ? { ...b, text } : b)),
    });
  }

  const count = selected.size;

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-text-muted">
        <span>
          {count > 0 ? (
            <>
              <span className="font-medium text-primary">{count}개 선택됨</span>
              <span className="mx-2">·</span>
              <kbd className="rounded bg-surface px-1.5 py-0.5">Tab</kbd>
              <span className="mx-1">/</span>
              <kbd className="rounded bg-surface px-1.5 py-0.5">Shift+Tab</kbd>
              레벨 변경 ·{" "}
              <kbd className="rounded bg-surface px-1.5 py-0.5">Delete</kbd>
              로 일괄 삭제
            </>
          ) : (
            <>클릭으로 단일 선택 · Shift+클릭 범위 · ⌘/Ctrl+클릭 토글 · 더블클릭 편집</>
          )}
        </span>
        {count > 0 ? (
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={handleDeleteSelected}
              className="rounded-token border border-border px-2 py-0.5 text-xs text-danger hover:bg-danger/10"
            >
              {count}개 삭제
            </button>
            <button
              type="button"
              onClick={() => setSelected(new Set())}
              className="rounded-token border border-border px-2 py-0.5 text-xs hover:bg-surface"
            >
              선택 해제
            </button>
          </div>
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
                onTextChange={handleTextChange}
                onAddBelow={handleAddBelow}
                onDelete={handleDelete}
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
