"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { api } from "@/lib/api";

export default function HomePage() {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setBusy(true);
    setError(null);
    try {
      const { job_id } = await api.upload(file);
      router.push(`/editor/${job_id}`);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="mx-auto max-w-2xl p-6 pt-16">
      <header className="flex items-center justify-between">
        <h1 className="text-3xl font-semibold tracking-tight">Word Templator</h1>
        <nav className="flex gap-2 text-sm">
          <Link href="/dashboard" className="rounded-token border border-border bg-surface-elevated px-3 py-1.5 text-text-muted hover:text-text">
            히스토리
          </Link>
          <Link href="/login" className="rounded-token bg-primary px-3 py-1.5 font-medium text-white hover:bg-primary-hover">
            로그인
          </Link>
        </nav>
      </header>

      <p className="mt-3 text-base text-text-muted">
        .docx 파일을 업로드해 표준 양식으로 변환하세요.
      </p>

      <div
        className="mt-8 rounded-token-xl border-2 border-dashed border-border bg-surface p-12 text-center transition hover:border-primary"
        onClick={() => inputRef.current?.click()}
        role="button"
        tabIndex={0}
      >
        <input
          ref={inputRef}
          type="file"
          accept=".docx"
          onChange={handleUpload}
          disabled={busy}
          className="hidden"
        />
        <div className="text-5xl">📄</div>
        <p className="mt-4 text-base font-medium">
          {busy ? "업로드 중..." : "클릭해서 .docx 파일 선택"}
        </p>
        <p className="mt-1 text-sm text-text-muted">최대 50MB · 로그인 필요</p>
        {error ? (
          <p className="mt-4 rounded-token bg-danger/10 px-3 py-2 text-sm text-danger">
            {error}
          </p>
        ) : null}
      </div>
    </main>
  );
}
