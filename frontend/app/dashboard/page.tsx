import Link from "next/link";
import { fetchMe } from "@/lib/auth";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";

// 서버 컴포넌트 → 컨테이너 내부에서 backend로 직접 fetch
const INTERNAL_API_BASE = process.env.INTERNAL_API_BASE ?? "http://backend:8000";

async function fetchJobs() {
  const store = await cookies();
  const token = store.get("access_token")?.value;
  if (!token) return [];
  const r = await fetch(`${INTERNAL_API_BASE}/jobs`, {
    headers: { Cookie: `access_token=${token}` },
    cache: "no-store",
  });
  if (!r.ok) return [];
  return (await r.json()) as { id: string; original_filename: string; status: string; created_at: string }[];
}

export default async function DashboardPage() {
  const me = await fetchMe();
  if (!me) redirect("/login");
  const jobs = await fetchJobs();

  return (
    <main className="mx-auto max-w-3xl p-6 pt-12">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">히스토리</h1>
          <p className="mt-1 text-sm text-text-muted">{me.email}</p>
        </div>
        <Link
          href="/"
          className="rounded-token bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary-hover"
        >
          새 변환
        </Link>
      </header>

      {jobs.length === 0 ? (
        <div className="mt-12 rounded-token-xl border border-border bg-surface p-12 text-center text-sm text-text-muted">
          변환 이력이 없습니다.
          <div className="mt-4">
            <Link href="/" className="text-primary hover:underline">
              첫 .docx 업로드 →
            </Link>
          </div>
        </div>
      ) : (
        <ul className="mt-6 flex flex-col gap-2">
          {jobs.map((j) => (
            <li
              key={j.id}
              className="rounded-token-lg border border-border bg-surface-elevated transition hover:border-border-strong hover:shadow-token-sm"
            >
              <Link href={`/editor/${j.id}`} className="block px-5 py-4">
                <p className="font-medium">{j.original_filename}</p>
                <p className="mt-1 text-xs text-text-muted">
                  <span
                    className={
                      j.status === "rendered"
                        ? "text-success"
                        : j.status === "failed"
                          ? "text-danger"
                          : "text-text-muted"
                    }
                  >
                    {j.status}
                  </span>
                  <span className="mx-2">·</span>
                  {new Date(j.created_at).toLocaleString("ko-KR")}
                </p>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
