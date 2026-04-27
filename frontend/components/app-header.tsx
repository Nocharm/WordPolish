"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import clsx from "clsx";
import { api } from "@/lib/api";

interface NavItem {
  href: string;
  label: string;
}

const NAV_ITEMS: NavItem[] = [
  { href: "/", label: "변환" },
  { href: "/batch", label: "일괄 변환" },
  { href: "/dashboard", label: "히스토리" },
  { href: "/templates", label: "템플릿" },
  { href: "/feedback", label: "피드백" },
];

const ADMIN_NAV_ITEM: NavItem = { href: "/admin/feedback", label: "관리자" };

interface AppHeaderProps {
  email: string | null;
  role?: "user" | "admin" | null;
}

export function AppHeader({ email, role }: AppHeaderProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const menuRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (!menuRef.current) return;
      if (!menuRef.current.contains(e.target as Node)) setMenuOpen(false);
    }
    if (menuOpen) document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [menuOpen]);

  async function handleLogout() {
    setBusy(true);
    try {
      await api.logout();
    } catch {
      // ignore — 그래도 로그인 화면으로 이동
    }
    setMenuOpen(false);
    router.push("/login");
    router.refresh();
  }

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  return (
    <header className="sticky top-0 z-dropdown border-b border-border bg-bg/85 backdrop-blur supports-[backdrop-filter]:bg-bg/70">
      <div className="mx-auto flex h-12 max-w-6xl items-center gap-4 px-4">
        <Link
          href={email ? "/dashboard" : "/"}
          className="text-sm font-semibold tracking-tight"
        >
          Word Templator
        </Link>

        {email ? (
          <nav className="flex flex-1 items-center gap-1 overflow-x-auto">
            {NAV_ITEMS.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={clsx(
                  "rounded-token px-3 py-1.5 text-sm transition whitespace-nowrap",
                  isActive(item.href)
                    ? "bg-surface text-text"
                    : "text-text-muted hover:text-text hover:bg-surface",
                )}
              >
                {item.label}
              </Link>
            ))}
            {role === "admin" ? (
              <Link
                key={ADMIN_NAV_ITEM.href}
                href={ADMIN_NAV_ITEM.href}
                className={clsx(
                  "rounded-token px-3 py-1.5 text-sm transition whitespace-nowrap font-medium",
                  isActive(ADMIN_NAV_ITEM.href)
                    ? "bg-warning/15 text-warning"
                    : "text-warning hover:bg-warning/10",
                )}
              >
                {ADMIN_NAV_ITEM.label}
              </Link>
            ) : null}
          </nav>
        ) : (
          <div className="flex-1" />
        )}

        {email ? (
          <div className="relative" ref={menuRef}>
            <button
              type="button"
              onClick={() => setMenuOpen((o) => !o)}
              className="flex items-center gap-2 rounded-token border border-border bg-surface-elevated px-3 py-1.5 text-sm hover:bg-surface"
              aria-haspopup="menu"
              aria-expanded={menuOpen}
            >
              <span className="hidden sm:inline max-w-[180px] truncate text-text-muted">
                {email}
              </span>
              <span className="sm:hidden">👤</span>
              <span className="text-xs text-text-muted">▾</span>
            </button>

            {menuOpen ? (
              <div
                role="menu"
                className="absolute right-0 mt-2 w-56 overflow-hidden rounded-token-lg border border-border bg-surface-elevated shadow-token"
              >
                <div className="border-b border-border px-4 py-2 text-xs text-text-muted">
                  {email}
                </div>
                <Link
                  href="/settings"
                  role="menuitem"
                  onClick={() => setMenuOpen(false)}
                  className="block px-4 py-2 text-sm hover:bg-surface"
                >
                  설정
                </Link>
                <button
                  type="button"
                  role="menuitem"
                  onClick={handleLogout}
                  disabled={busy}
                  className="block w-full border-t border-border px-4 py-2 text-left text-sm text-danger hover:bg-danger/10 disabled:opacity-50"
                >
                  {busy ? "로그아웃 중..." : "로그아웃"}
                </button>
              </div>
            ) : null}
          </div>
        ) : (
          <Link
            href="/login"
            className="rounded-token bg-primary px-3 py-1.5 text-sm font-medium text-white hover:bg-primary-hover"
          >
            로그인
          </Link>
        )}
      </div>
    </header>
  );
}
