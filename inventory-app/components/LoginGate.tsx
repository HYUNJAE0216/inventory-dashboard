"use client";

import { useEffect, useRef, useState } from "react";
import type { FormEvent } from "react";

interface Props {
  onSuccess: () => void;
}

export default function LoginGate({ onSuccess }: Props) {
  const [pin, setPin] = useState("");
  const [error, setError] = useState("");
  const [lockedUntil, setLockedUntil] = useState(0);
  const [now, setNow] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  useEffect(() => {
    if (lockedUntil <= Date.now()) return;
    const id = setInterval(() => setNow(Date.now()), 250);
    return () => clearInterval(id);
  }, [lockedUntil]);

  const remainingMs = Math.max(0, lockedUntil - now);
  const isLocked = remainingMs > 0;

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (isLocked || submitting || !pin) return;
    setSubmitting(true);
    setError("");
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pin }),
      });
      const data = await res.json();
      if (res.ok && data.ok) {
        onSuccess();
        return;
      }
      if (data.lockedMs > 0) {
        setLockedUntil(Date.now() + data.lockedMs);
        setNow(Date.now());
        setError("시도 횟수를 초과했습니다. 잠시 후 다시 시도해주세요.");
      } else {
        setError("핀번호가 올바르지 않습니다.");
      }
      setPin("");
      inputRef.current?.focus();
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="login-wrap">
      <form className="login-card" onSubmit={handleSubmit}>
        <h1>재고 대사 현황</h1>
        <p className="login-sub">핀번호를 입력하세요</p>
        <input
          ref={inputRef}
          className="pin-input"
          type="password"
          inputMode="numeric"
          pattern="[0-9]*"
          maxLength={4}
          autoComplete="off"
          value={pin}
          disabled={isLocked || submitting}
          onChange={(e) => setPin(e.target.value.replace(/[^0-9]/g, ""))}
        />
        {error && (
          <p className="login-error">
            {error}
            {isLocked && ` (약 ${Math.ceil(remainingMs / 1000)}초 남음)`}
          </p>
        )}
        <button type="submit" className="login-submit" disabled={isLocked || submitting || !pin}>
          확인
        </button>
      </form>
    </div>
  );
}
