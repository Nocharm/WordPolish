// 사용자 UI 설정 — 테마/폰트 스케일. localStorage 에 저장하고 <html> 의 data-* 로 노출.

export type Theme = "light" | "dark" | "system";
export type FontScale = "sm" | "md" | "lg";

export interface Settings {
  theme: Theme;
  fontScale: FontScale;
}

export const DEFAULT_SETTINGS: Settings = { theme: "system", fontScale: "md" };
export const STORAGE_KEY = "wt-settings";

export function isTheme(v: unknown): v is Theme {
  return v === "light" || v === "dark" || v === "system";
}

export function isFontScale(v: unknown): v is FontScale {
  return v === "sm" || v === "md" || v === "lg";
}

// SSR/CSR 양쪽에서 안전하게 호출 가능. 잘못된 값은 기본값으로 폴백.
export function readSettings(): Settings {
  if (typeof window === "undefined") return DEFAULT_SETTINGS;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_SETTINGS;
    const parsed = JSON.parse(raw) as Partial<Settings>;
    return {
      theme: isTheme(parsed.theme) ? parsed.theme : DEFAULT_SETTINGS.theme,
      fontScale: isFontScale(parsed.fontScale) ? parsed.fontScale : DEFAULT_SETTINGS.fontScale,
    };
  } catch {
    return DEFAULT_SETTINGS;
  }
}

export function writeSettings(s: Settings): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(s));
  } catch {
    // quota / private mode 무시
  }
}

// <html> 에 data-theme, data-theme-resolved, data-font-scale 적용.
// "system" 일 때만 OS 다크모드를 resolved 로 기록 → CSS 가 이걸로 분기.
export function applySettings(s: Settings): void {
  if (typeof document === "undefined") return;
  const html = document.documentElement;
  html.dataset.theme = s.theme;
  if (s.theme === "system") {
    const prefersDark =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-color-scheme: dark)").matches;
    html.dataset.themeResolved = prefersDark ? "dark" : "light";
  } else {
    delete html.dataset.themeResolved;
  }
  html.dataset.fontScale = s.fontScale;
}
