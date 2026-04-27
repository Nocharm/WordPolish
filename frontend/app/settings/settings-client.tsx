"use client";

import clsx from "clsx";
import { useState, type FormEvent } from "react";
import { api } from "@/lib/api";
import { useSettings } from "@/components/settings-provider";
import type { FontScale, Theme } from "@/lib/settings";

const THEME_OPTIONS: { value: Theme; label: string; hint: string }[] = [
  { value: "light", label: "라이트", hint: "밝은 화면" },
  { value: "dark", label: "다크", hint: "어두운 화면" },
  { value: "system", label: "시스템", hint: "OS 설정 따라감" },
];

const FONT_OPTIONS: { value: FontScale; label: string; hint: string }[] = [
  { value: "sm", label: "작게", hint: "14px" },
  { value: "md", label: "기본", hint: "16px" },
  { value: "lg", label: "크게", hint: "18px" },
];

export function SettingsClient({ email }: { email: string }) {
  const { theme, fontScale, setTheme, setFontScale } = useSettings();

  return (
    <main className="mx-auto max-w-2xl p-6 pt-12">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight">설정</h1>
        <p className="mt-1 text-sm text-text-muted">
          계정 정보와 화면 표시 옵션을 변경합니다.
        </p>
      </header>

      <Section title="계정" description="로그인된 이메일">
        <p className="text-sm">{email}</p>
      </Section>

      <Section title="비밀번호 변경" description="현재 비밀번호 확인 후 변경됩니다.">
        <PasswordForm />
      </Section>

      <Section title="테마" description="라이트/다크/시스템 자동 따라감">
        <SegmentedGroup
          name="theme"
          options={THEME_OPTIONS}
          value={theme}
          onChange={setTheme}
        />
      </Section>

      <Section title="기본 글자 크기" description="화면 전체 텍스트 배율을 조정합니다.">
        <SegmentedGroup
          name="font-scale"
          options={FONT_OPTIONS}
          value={fontScale}
          onChange={setFontScale}
        />
        <div className="mt-4 rounded-token border border-border bg-surface p-4">
          <p className="text-sm text-text-muted">미리보기</p>
          <p className="mt-2 text-base">본문 텍스트는 이 크기로 표시됩니다.</p>
          <p className="mt-1 text-xs text-text-muted">보조 캡션 / 힌트 텍스트</p>
        </div>
      </Section>
    </main>
  );
}

function Section({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="mt-8 rounded-token-lg border border-border bg-surface-elevated p-6">
      <h2 className="text-base font-semibold">{title}</h2>
      {description ? (
        <p className="mt-1 text-xs text-text-muted">{description}</p>
      ) : null}
      <div className="mt-4">{children}</div>
    </section>
  );
}

interface SegmentedOption<T extends string> {
  value: T;
  label: string;
  hint: string;
}

function SegmentedGroup<T extends string>({
  name,
  options,
  value,
  onChange,
}: {
  name: string;
  options: SegmentedOption<T>[];
  value: T;
  onChange: (next: T) => void;
}) {
  return (
    <div role="radiogroup" aria-label={name} className="grid grid-cols-3 gap-2">
      {options.map((opt) => {
        const selected = opt.value === value;
        return (
          <button
            type="button"
            key={opt.value}
            role="radio"
            aria-checked={selected}
            onClick={() => onChange(opt.value)}
            className={clsx(
              "rounded-token border px-3 py-2 text-sm transition",
              selected
                ? "border-primary bg-primary/10 text-text"
                : "border-border bg-bg text-text-muted hover:text-text hover:bg-surface",
            )}
          >
            <div className="font-medium">{opt.label}</div>
            <div className="mt-0.5 text-xs text-text-muted">{opt.hint}</div>
          </button>
        );
      })}
    </div>
  );
}

function PasswordForm() {
  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [confirm, setConfirm] = useState("");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<{ kind: "ok" | "err"; text: string } | null>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setMessage(null);

    if (next.length < 4) {
      setMessage({ kind: "err", text: "새 비밀번호는 4자 이상이어야 합니다." });
      return;
    }
    if (next !== confirm) {
      setMessage({ kind: "err", text: "새 비밀번호 확인이 일치하지 않습니다." });
      return;
    }
    if (next === current) {
      setMessage({ kind: "err", text: "현재 비밀번호와 동일합니다." });
      return;
    }

    setBusy(true);
    try {
      await api.changePassword(current, next);
      setCurrent("");
      setNext("");
      setConfirm("");
      setMessage({ kind: "ok", text: "비밀번호가 변경되었습니다." });
    } catch (err) {
      const raw = (err as Error).message;
      // "400: ..." 패턴에서 본문만 추출 시도
      const detail = raw.includes("current password incorrect")
        ? "현재 비밀번호가 올바르지 않습니다."
        : raw;
      setMessage({ kind: "err", text: detail });
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3">
      <Field
        label="현재 비밀번호"
        type="password"
        value={current}
        onChange={setCurrent}
        autoComplete="current-password"
        required
      />
      <Field
        label="새 비밀번호"
        type="password"
        value={next}
        onChange={setNext}
        autoComplete="new-password"
        required
      />
      <Field
        label="새 비밀번호 확인"
        type="password"
        value={confirm}
        onChange={setConfirm}
        autoComplete="new-password"
        required
      />
      <div className="flex items-center justify-between">
        {message ? (
          <p
            className={clsx(
              "text-sm",
              message.kind === "ok" ? "text-success" : "text-danger",
            )}
          >
            {message.text}
          </p>
        ) : (
          <span />
        )}
        <button
          type="submit"
          disabled={busy || !current || !next || !confirm}
          className="rounded-token bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary-hover disabled:opacity-50"
        >
          {busy ? "변경 중..." : "변경"}
        </button>
      </div>
    </form>
  );
}

function Field({
  label,
  type,
  value,
  onChange,
  autoComplete,
  required,
}: {
  label: string;
  type: string;
  value: string;
  onChange: (v: string) => void;
  autoComplete?: string;
  required?: boolean;
}) {
  return (
    <label className="flex flex-col gap-1 text-sm">
      <span className="text-text-muted">{label}</span>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        autoComplete={autoComplete}
        required={required}
        className="form-input"
      />
    </label>
  );
}
