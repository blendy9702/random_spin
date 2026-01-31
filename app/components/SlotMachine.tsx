"use client";

import * as React from "react";
import { weightedRandom } from "../lib/weightedRandom";
import { HeartFace } from "./HeartFace";
import { SlotReel, type SlotReelHandle, type SlotValue } from "./SlotReel";

type Phase = "idle" | "spinning" | "stopping";

const OPTIONS: Array<{ value: SlotValue; weight: number }> = [
  { value: 1, weight: 60 },
  { value: 2, weight: 30 },
  { value: 3, weight: 10 },
];

type Counts = Record<SlotValue, number>;
const EMPTY_COUNTS: Counts = { 1: 0, 2: 0, 3: 0 };

function pct(n: number, total: number) {
  if (total <= 0) return "0.0";
  return ((n / total) * 100).toFixed(1);
}

export function SlotMachine() {
  const reelRef = React.useRef<SlotReelHandle | null>(null);
  const [phase, setPhase] = React.useState<Phase>("idle");
  const [result, setResult] = React.useState<SlotValue | null>(null);
  const [counts, setCounts] = React.useState<Counts>(EMPTY_COUNTS);
  const total = counts[1] + counts[2] + counts[3];

  const [simCounts, setSimCounts] = React.useState<Counts | null>(null);
  const [isSimulating, setIsSimulating] = React.useState(false);

  const onStart = React.useCallback(() => {
    if (phase !== "idle") return;
    setResult(null);
    setPhase("spinning");
    reelRef.current?.start();
  }, [phase]);

  const onStop = React.useCallback(async () => {
    if (phase !== "spinning") return;
    setPhase("stopping");

    const target = weightedRandom(OPTIONS);
    const finalValue = await reelRef.current!.stop(target);

    setResult(finalValue);
    setCounts((prev) => ({ ...prev, [finalValue]: prev[finalValue] + 1 }));
    setPhase("idle");
  }, [phase]);

  const onResetStats = React.useCallback(() => {
    setCounts(EMPTY_COUNTS);
    setSimCounts(null);
  }, []);

  const onSimulate = React.useCallback(async () => {
    if (isSimulating) return;
    setIsSimulating(true);
    setSimCounts(null);

    // 작은 루프지만 UI 멈춤을 줄이기 위해 한 프레임 양보
    await new Promise<void>((resolve) => {
      requestAnimationFrame(() => resolve());
    });

    const n = 10000;
    const next: Counts = { 1: 0, 2: 0, 3: 0 };
    for (let i = 0; i < n; i++) {
      const v = weightedRandom(OPTIONS);
      next[v] += 1;
    }
    setSimCounts(next);
    setIsSimulating(false);
  }, [isSimulating]);

  return (
    <section className="w-full max-w-xl rounded-3xl border border-zinc-200 bg-white/80 p-6 shadow-sm backdrop-blur dark:border-white/10 dark:bg-zinc-950/60 sm:p-8">
      <header className="mb-6 flex flex-col items-center gap-6">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-zinc-950 dark:text-zinc-50">
            하트 룰렛
          </h1>
        </div>
        <div className="text-right text-xs text-zinc-500 dark:text-zinc-400">
          {phase === "spinning"
            ? "돌아가는 중"
            : phase === "stopping"
              ? "멈추는 중"
              : "대기"}
        </div>
      </header>

      <div className="flex flex-col items-center gap-5">
        <SlotReel ref={reelRef} />

        <div className="flex w-full gap-3">
          <button
            type="button"
            onClick={onStart}
            disabled={phase !== "idle"}
            className="flex h-12 flex-1 items-center justify-center gap-2 rounded-xl bg-zinc-900 text-sm font-semibold text-white transition hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-200"
          >
            <i aria-hidden className="fa-solid fa-play text-[14px]" />
            시작
          </button>
          <button
            type="button"
            onClick={onStop}
            disabled={phase !== "spinning"}
            className="flex h-12 flex-1 items-center justify-center gap-2 rounded-xl border border-zinc-200 bg-white text-sm font-semibold text-zinc-900 transition hover:bg-zinc-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-white/10 dark:bg-zinc-950 dark:text-zinc-50 dark:hover:bg-zinc-900"
          >
            <i aria-hidden className="fa-solid fa-stop text-[14px]" />
            정지
          </button>
        </div>

        <div className="w-full rounded-2xl border border-zinc-200 bg-zinc-50 p-4 dark:border-white/10 dark:bg-zinc-900/30">
          <div className="flex items-center justify-between gap-4">
            <div className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
              결과
            </div>
            <div className="text-xs text-zinc-500 dark:text-zinc-400">
              {result ? `${result}개` : "—"}
            </div>
          </div>
          <div className="mt-3 flex items-center justify-center">
            {result ? (
              <HeartFace count={result} beat beatStrength="strong" />
            ) : (
              <div className="h-10" />
            )}
          </div>
        </div>

        {/* <div className="w-full rounded-2xl border border-zinc-200 bg-white p-4 dark:border-white/10 dark:bg-zinc-950">
          <div className="flex items-center justify-between gap-3">
            <div className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">
              누적 통계
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onSimulate}
                disabled={isSimulating}
                className="inline-flex h-9 items-center justify-center gap-2 rounded-lg border border-zinc-200 bg-white px-3 text-xs font-semibold text-zinc-900 transition hover:bg-zinc-50 disabled:opacity-50 dark:border-white/10 dark:bg-zinc-950 dark:text-zinc-50 dark:hover:bg-zinc-900"
              >
                <i aria-hidden className="fa-solid fa-flask text-[12px]" />
                {isSimulating ? "검증 중..." : "10,000회 검증"}
              </button>
              <button
                type="button"
                onClick={onResetStats}
                className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-zinc-200 bg-white text-zinc-900 transition hover:bg-zinc-50 dark:border-white/10 dark:bg-zinc-950 dark:text-zinc-50 dark:hover:bg-zinc-900"
                aria-label="통계 초기화"
              >
                <i
                  aria-hidden
                  className="fa-solid fa-rotate-right text-[12px]"
                />
              </button>
            </div>
          </div>

          <div className="mt-3 grid gap-2 text-sm">
            <div className="flex items-center justify-between text-xs text-zinc-500 dark:text-zinc-400">
              <span>실제 결과 기준</span>
              <span>{total}회</span>
            </div>

            {([1, 2, 3] as const).map((v) => (
              <div key={v} className="grid gap-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-medium text-zinc-800 dark:text-zinc-200">
                    하트 {v}개
                  </span>
                  <span className="text-zinc-600 dark:text-zinc-400">
                    {counts[v]}회 · {pct(counts[v], total)}%
                  </span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-zinc-100 dark:bg-white/10">
                  <div
                    className="h-full rounded-full bg-rose-500"
                    style={{ width: `${pct(counts[v], total)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>

          {simCounts ? (
            <div className="mt-4 rounded-xl border border-zinc-200 bg-zinc-50 p-3 text-xs text-zinc-600 dark:border-white/10 dark:bg-zinc-900/30 dark:text-zinc-300">
              <div className="flex items-center justify-between">
                <span className="font-semibold">10,000회 검증 결과</span>
                <span className="text-zinc-500 dark:text-zinc-400">
                  1개 {pct(simCounts[1], 10000)}% · 2개{" "}
                  {pct(simCounts[2], 10000)}% · 3개 {pct(simCounts[3], 10000)}%
                </span>
              </div>
              <div className="mt-2 text-zinc-500 dark:text-zinc-400">
                (표본이 충분히 커지면 60/30/10에 수렴하는지 확인용)
              </div>
            </div>
          ) : null}
        </div> */}
      </div>
    </section>
  );
}
