import type { Metadata } from "next";
import Script from "next/script";
import { Providers } from "@/components/providers";
import { AppHeader } from "@/components/app-header";
import { fetchMe } from "@/lib/auth";
import "./globals.css";

export const metadata: Metadata = {
  title: "Word Templator",
  description: "Word 문서를 표준 양식으로 변환",
};

// Hydration 전에 localStorage 의 테마/폰트 설정을 <html> 에 반영 — FOUC 방지.
const NO_FLASH_SCRIPT = `
(function(){
  try {
    var raw = localStorage.getItem('wt-settings');
    var s = raw ? JSON.parse(raw) : {};
    var theme = (s && (s.theme === 'light' || s.theme === 'dark' || s.theme === 'system')) ? s.theme : 'system';
    var scale = (s && (s.fontScale === 'sm' || s.fontScale === 'md' || s.fontScale === 'lg')) ? s.fontScale : 'md';
    var html = document.documentElement;
    html.setAttribute('data-theme', theme);
    if (theme === 'system') {
      var dark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      html.setAttribute('data-theme-resolved', dark ? 'dark' : 'light');
    }
    html.setAttribute('data-font-scale', scale);
  } catch (e) {}
})();
`;

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const me = await fetchMe();
  return (
    <html lang="ko">
      <head>
        <Script id="wt-no-flash" strategy="beforeInteractive">
          {NO_FLASH_SCRIPT}
        </Script>
      </head>
      <body>
        <Providers>
          <AppHeader email={me?.email ?? null} role={me?.role ?? null} />
          {children}
        </Providers>
      </body>
    </html>
  );
}
