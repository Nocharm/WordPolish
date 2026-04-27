"use client";

import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";
import {
  DEFAULT_SETTINGS,
  applySettings,
  readSettings,
  writeSettings,
  type FontScale,
  type Settings,
  type Theme,
} from "@/lib/settings";

interface SettingsContextValue extends Settings {
  setTheme: (t: Theme) => void;
  setFontScale: (s: FontScale) => void;
}

const SettingsContext = createContext<SettingsContextValue | null>(null);

export function SettingsProvider({ children }: { children: ReactNode }) {
  // SSR 단계는 default 로 시작. mount 후 localStorage 값으로 동기화.
  const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS);

  useEffect(() => {
    const loaded = readSettings();
    setSettings(loaded);
    applySettings(loaded);
  }, []);

  // system 테마일 때 OS 다크모드 토글을 실시간 반영
  useEffect(() => {
    if (settings.theme !== "system") return;
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const handleChange = () => applySettings(settings);
    mq.addEventListener("change", handleChange);
    return () => mq.removeEventListener("change", handleChange);
  }, [settings]);

  const update = useCallback((next: Settings) => {
    setSettings(next);
    writeSettings(next);
    applySettings(next);
  }, []);

  const setTheme = useCallback(
    (theme: Theme) => update({ ...settings, theme }),
    [settings, update],
  );

  const setFontScale = useCallback(
    (fontScale: FontScale) => update({ ...settings, fontScale }),
    [settings, update],
  );

  return (
    <SettingsContext.Provider value={{ ...settings, setTheme, setFontScale }}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings(): SettingsContextValue {
  const ctx = useContext(SettingsContext);
  if (!ctx) throw new Error("useSettings must be used inside <SettingsProvider>");
  return ctx;
}
