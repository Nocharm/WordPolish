"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { api } from "@/lib/api";

export default function SignupPage() {
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
      await api.signup(email, password);
      router.push("/login");
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col justify-center p-6">
      <div className="rounded-token-xl border border-border bg-surface-elevated p-8 shadow-token">
        <h1 className="text-2xl font-semibold tracking-tight">회원가입</h1>
        <p className="mt-1 text-sm text-text-muted">새 계정을 만드세요.</p>

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
            minLength={6}
          />
          <button
            type="submit"
            disabled={busy}
            className="mt-2 rounded-token bg-primary px-4 py-3 text-base font-medium text-white transition hover:bg-primary-hover disabled:opacity-50"
          >
            {busy ? "가입 중..." : "가입"}
          </button>
          {error ? <p className="text-sm text-danger">{error}</p> : null}
        </form>

        <p className="mt-6 text-center text-sm text-text-muted">
          이미 계정이 있으신가요?{" "}
          <Link href="/login" className="font-medium text-primary hover:underline">
            로그인
          </Link>
        </p>
      </div>
    </main>
  );
}
