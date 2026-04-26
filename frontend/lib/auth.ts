import { cookies } from "next/headers";

const BASE = process.env.NEXT_PUBLIC_API_BASE ?? "http://backend:8000";

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
