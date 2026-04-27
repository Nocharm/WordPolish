"use client";

import clsx from "clsx";
import { useEffect, useState, type FormEvent } from "react";
import { api } from "@/lib/api";
import type { Feedback, FeedbackCategory, FeedbackStatus } from "@/lib/types";

const CATEGORY_LABEL: Record<FeedbackCategory, string> = {
  bug: "🐞 버그",
  feature: "✨ 기능 요청",
  other: "💬 기타",
};

const STATUS_LABEL: Record<FeedbackStatus, string> = {
  open: "접수됨",
  in_progress: "처리 중",
  closed: "완료",
};

const STATUS_BADGE: Record<FeedbackStatus, string> = {
  open: "bg-info/10 text-info",
  in_progress: "bg-warning/15 text-warning",
  closed: "bg-success/15 text-success",
};

export function FeedbackClient() {
  const [list, setList] = useState<Feedback[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // form state
  const [category, setCategory] = useState<FeedbackCategory>("bug");
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [okMessage, setOkMessage] = useState<string | null>(null);

  async function reload() {
    setLoading(true);
    try {
      setList(await api.listMyFeedback());
      setError(null);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    reload();
  }, []);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!title.trim() || !body.trim()) {
      setError("제목과 내용을 입력해주세요.");
      return;
    }
    setSubmitting(true);
    setError(null);
    setOkMessage(null);
    try {
      await api.submitFeedback(category, title.trim(), body.trim());
      setTitle("");
      setBody("");
      setOkMessage("피드백이 접수되었습니다. 감사합니다!");
      await reload();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="mx-auto max-w-3xl p-6 pt-12">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight">피드백</h1>
        <p className="mt-1 text-sm text-text-muted">
          버그·개선 제안·문의를 남겨주세요. 관리자가 확인 후 답변을 남길 수 있습니다.
        </p>
      </header>

      <section className="mt-6 rounded-token-lg border border-border bg-surface-elevated p-6">
        <h2 className="text-base font-semibold">새 피드백 작성</h2>
        <form onSubmit={handleSubmit} className="mt-4 flex flex-col gap-3">
          <div className="grid grid-cols-3 gap-2">
            {(Object.keys(CATEGORY_LABEL) as FeedbackCategory[]).map((c) => {
              const selected = c === category;
              return (
                <button
                  type="button"
                  key={c}
                  role="radio"
                  aria-checked={selected}
                  onClick={() => setCategory(c)}
                  className={clsx(
                    "rounded-token border px-3 py-2 text-sm transition",
                    selected
                      ? "border-primary bg-primary/10 text-text"
                      : "border-border bg-bg text-text-muted hover:text-text hover:bg-surface",
                  )}
                >
                  {CATEGORY_LABEL[c]}
                </button>
              );
            })}
          </div>

          <label className="flex flex-col gap-1 text-sm">
            <span className="text-text-muted">제목</span>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              maxLength={200}
              required
              className="form-input"
              placeholder="한 줄 요약"
            />
          </label>

          <label className="flex flex-col gap-1 text-sm">
            <span className="text-text-muted">내용</span>
            <textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              maxLength={5000}
              required
              rows={6}
              className="form-input resize-y"
              placeholder="상세히 적어주시면 큰 도움이 됩니다. 재현 단계, 기대 동작 등."
            />
          </label>

          <div className="flex items-center justify-between">
            {error ? (
              <p className="text-sm text-danger">{error}</p>
            ) : okMessage ? (
              <p className="text-sm text-success">{okMessage}</p>
            ) : (
              <span />
            )}
            <button
              type="submit"
              disabled={submitting || !title.trim() || !body.trim()}
              className="rounded-token bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary-hover disabled:opacity-50"
            >
              {submitting ? "보내는 중..." : "보내기"}
            </button>
          </div>
        </form>
      </section>

      <section className="mt-8">
        <h2 className="text-base font-semibold">내 피드백 ({list.length})</h2>
        {loading ? (
          <p className="mt-3 text-sm text-text-muted">불러오는 중...</p>
        ) : list.length === 0 ? (
          <p className="mt-3 text-sm text-text-muted">아직 보낸 피드백이 없습니다.</p>
        ) : (
          <ul className="mt-3 flex flex-col gap-3">
            {list.map((fb) => (
              <li
                key={fb.id}
                className="rounded-token-lg border border-border bg-surface-elevated p-4"
              >
                <div className="flex items-center gap-2">
                  <span className="text-xs text-text-muted">
                    {CATEGORY_LABEL[fb.category]}
                  </span>
                  <span
                    className={clsx(
                      "rounded-token px-2 py-0.5 text-xs font-medium",
                      STATUS_BADGE[fb.status],
                    )}
                  >
                    {STATUS_LABEL[fb.status]}
                  </span>
                  <span className="ml-auto text-xs text-text-muted">
                    {new Date(fb.created_at).toLocaleString("ko-KR")}
                  </span>
                </div>
                <h3 className="mt-2 font-medium">{fb.title}</h3>
                <p className="mt-1 whitespace-pre-wrap text-sm text-text-muted">{fb.body}</p>
                {fb.admin_note ? (
                  <div className="mt-3 rounded-token border border-warning/30 bg-warning/5 p-3 text-sm">
                    <p className="text-xs font-medium text-warning">관리자 답변</p>
                    <p className="mt-1 whitespace-pre-wrap">{fb.admin_note}</p>
                  </div>
                ) : null}
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  );
}
