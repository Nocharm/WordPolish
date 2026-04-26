"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { api } from "@/lib/api";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setBusy(true);
    try {
      await api.login(email, password);
      router.push("/dashboard");
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col justify-center p-6">
      <div className="rounded-token-xl border border-border bg-surface-elevated p-8 shadow-token">
        <h1 className="text-2xl font-semibold tracking-tight">로그인</h1>
        <p className="mt-1 text-sm text-text-muted">계정에 로그인하세요.</p>

        <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-3">
          <input
            type="email"
            placeholder="이메일"
            className="rounded-token border border-border bg-bg px-4 py-3 text-base outline-none transition focus:border-primary"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="비밀번호"
            className="rounded-token border border-border bg-bg px-4 py-3 text-base outline-none transition focus:border-primary"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <button
            type="submit"
            disabled={busy}
            className="mt-2 rounded-token bg-primary px-4 py-3 text-base font-medium text-white transition hover:bg-primary-hover disabled:opacity-50"
          >
            {busy ? "로그인 중..." : "로그인"}
          </button>
          {error ? <p className="text-sm text-danger">{error}</p> : null}
        </form>

        <div className="mt-8 border-t border-border pt-4 text-center text-xs text-text-muted">
          OAuth 로그인 추가 예정 ·{" "}
          <Link href="/signup" className="text-text-muted underline hover:text-primary">
            계정 만들기
          </Link>
        </div>
      </div>
    </main>
  );
}
