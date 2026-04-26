import { cookies } from "next/headers";

// 서버 컴포넌트 → 컨테이너 내부 hostname 으로 fetch (NEXT_PUBLIC_*은 브라우저용이라 부적합)
const BASE = process.env.INTERNAL_API_BASE ?? "http://backend:8000";

export async function fetchMe(): Promise<{ id: string; email: string } | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get("access_token")?.value;
  if (!token) return null;
  const res = await fetch(`${BASE}/auth/me`, {
    headers: { Cookie: `access_token=${token}` },
    cache: "no-store",
  });
  if (!res.ok) return null;
  return (await res.json()) as { id: string; email: string };
}
