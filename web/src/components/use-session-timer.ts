"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { PracticeTimerMode } from "@/lib/practice-config";

export function formatSessionTime(seconds: number): string {
  const safeSeconds = Math.max(0, Math.floor(seconds));
  const minutes = Math.floor(safeSeconds / 60)
    .toString()
    .padStart(2, "0");
  const remainingSeconds = (safeSeconds % 60).toString().padStart(2, "0");
  return `${minutes}:${remainingSeconds}`;
}

export function useSessionTimer({
  mode,
  timeLimitSec,
  startedAtMs,
  onTimeout,
}: {
  mode: PracticeTimerMode;
  timeLimitSec: number | null;
  startedAtMs?: number | null;
  onTimeout?: () => void;
}) {
  const isActive = mode === "stopwatch" || mode === "fixed";
  const [effectiveStartedAtMs, setEffectiveStartedAtMs] = useState<number | null>(startedAtMs ?? null);
  const [elapsedSec, setElapsedSec] = useState(0);
  const [remainingSec, setRemainingSec] = useState(timeLimitSec ?? 0);
  const [isTimedOut, setIsTimedOut] = useState(false);
  const timeoutCalledRef = useRef(false);
  const onTimeoutRef = useRef(onTimeout);

  useEffect(() => {
    onTimeoutRef.current = onTimeout;
  }, [onTimeout]);

  useEffect(() => {
    if (isActive && effectiveStartedAtMs === null) {
      const startTimer = window.setTimeout(() => setEffectiveStartedAtMs(Date.now()), 0);
      return () => window.clearTimeout(startTimer);
    }
  }, [effectiveStartedAtMs, isActive]);

  const tick = useCallback(() => {
    if (!isActive || effectiveStartedAtMs === null) return;

    const elapsed = Math.max(0, Math.floor((Date.now() - effectiveStartedAtMs) / 1000));
    setElapsedSec(elapsed);

    if (mode === "fixed") {
      const remaining = Math.max(0, (timeLimitSec ?? 0) - elapsed);
      setRemainingSec(remaining);
      if (remaining === 0 && !timeoutCalledRef.current) {
        timeoutCalledRef.current = true;
        setIsTimedOut(true);
        onTimeoutRef.current?.();
      }
    }
  }, [effectiveStartedAtMs, isActive, mode, timeLimitSec]);

  useEffect(() => {
    if (!isActive || effectiveStartedAtMs === null) return;

    const firstTick = window.setTimeout(tick, 0);
    const interval = window.setInterval(tick, 1000);
    const handleVisibilityChange = () => {
      if (!document.hidden) tick();
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => {
      window.clearTimeout(firstTick);
      window.clearInterval(interval);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [effectiveStartedAtMs, isActive, tick]);

  return {
    startedAtMs: effectiveStartedAtMs,
    elapsedSec,
    remainingSec: mode === "fixed" ? remainingSec : elapsedSec,
    isTimedOut,
    formattedTime: formatSessionTime(mode === "fixed" ? remainingSec : elapsedSec),
  };
}
