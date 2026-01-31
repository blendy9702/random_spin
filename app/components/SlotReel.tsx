"use client";

import {
  animate,
  motion,
  useMotionValue,
  type AnimationPlaybackControls,
} from "framer-motion";
import * as React from "react";
import { HeartFace } from "./HeartFace";

export type SlotValue = 1 | 2 | 3;

export type SlotReelHandle = {
  start: () => void;
  stop: (target: SlotValue) => Promise<SlotValue>;
};

const ITEM_HEIGHT = 96;
const BASE: readonly SlotValue[] = [1, 2, 3] as const;
const REPEAT = 40;
const ANCHOR_BASE_INDEX = BASE.length * Math.floor(REPEAT / 2); // keep y around middle

function mod(n: number, m: number) {
  return ((n % m) + m) % m;
}

export const SlotReel = React.forwardRef<
  SlotReelHandle,
  { className?: string }
>(function SlotReel({ className }, ref) {
  const y = useMotionValue(0);
  const spinPlayback = React.useRef<AnimationPlaybackControls | null>(null);

  const items = React.useMemo(() => {
    const out: SlotValue[] = [];
    for (let i = 0; i < BASE.length * REPEAT; i++)
      out.push(BASE[i % BASE.length]!);
    return out;
  }, []);

  const stopSpinning = React.useCallback(() => {
    spinPlayback.current?.stop();
    spinPlayback.current = null;
  }, []);

  const normalizeYToAnchor = React.useCallback(() => {
    // Keep translateY in a safe numeric range to avoid precision/render issues
    // after many start/stop cycles.
    const currentIndex = Math.round(-y.get() / ITEM_HEIGHT);
    const phase = mod(currentIndex, BASE.length); // 0..2
    const anchorIndex = ANCHOR_BASE_INDEX + phase;
    y.set(-anchorIndex * ITEM_HEIGHT);
    return anchorIndex;
  }, [y]);

  const start = React.useCallback(() => {
    stopSpinning();

    // Loop distance must be a multiple of BASE length to keep phase aligned.
    const loopsPerCycle = 8;
    const loopDistance = ITEM_HEIGHT * BASE.length * loopsPerCycle;

    normalizeYToAnchor();
    const from = y.get();
    const to = from - loopDistance;

    spinPlayback.current = animate(y, [from, to], {
      duration: 0.85,
      ease: "linear",
      repeat: Infinity,
    });
  }, [normalizeYToAnchor, stopSpinning, y]);

  const stop = React.useCallback(
    async (target: SlotValue) => {
      // Stop the infinite loop first, then decelerate into the target.
      stopSpinning();

      const anchorIndex = normalizeYToAnchor();
      const currentOffset = -y.get(); // positive number
      const currentIndex = Math.max(0, Math.round(currentOffset / ITEM_HEIGHT));

      // Force a few extra spins after pressing stop (for "slow down" feel).
      const extraItems = 18; // 6 full cycles (6 * 3 items)
      const baseIndex = Math.max(currentIndex, anchorIndex) + extraItems;

      const desiredMod = target - 1; // 0..2
      const delta = mod(desiredMod - mod(baseIndex, BASE.length), BASE.length);
      const targetIndex = baseIndex + delta;

      // Safety: keep target within rendered items.
      const safeIndex = Math.min(targetIndex, items.length - 1);
      const targetY = -safeIndex * ITEM_HEIGHT;

      const decel = animate(y, targetY, {
        duration: 1.7,
        ease: [0.16, 1, 0.3, 1], // easeOut-ish
      });

      await decel.finished;
      normalizeYToAnchor();
      return target;
    },
    [items.length, normalizeYToAnchor, stopSpinning, y],
  );

  React.useImperativeHandle(
    ref,
    () => ({
      start,
      stop,
    }),
    [start, stop],
  );

  React.useEffect(() => {
    return () => {
      spinPlayback.current?.stop();
    };
  }, []);

  return (
    <div
      className={[
        "relative w-[280px] overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm dark:border-white/10 dark:bg-zinc-950",
        className ?? "",
      ].join(" ")}
      style={{ height: ITEM_HEIGHT }}
    >
      {/* top/bottom fade for slot 느낌 */}
      <div className="pointer-events-none absolute inset-x-0 top-0 z-10 h-8 bg-linear-to-b from-white to-transparent dark:from-zinc-950" />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 z-10 h-8 bg-linear-to-t from-white to-transparent dark:from-zinc-950" />
      <div className="pointer-events-none absolute inset-0 z-10 ring-1 ring-inset ring-zinc-900/5 dark:ring-white/10" />

      <motion.div style={{ y }} className="will-change-transform">
        {items.map((count, idx) => (
          <div key={idx} className="flex h-[96px] items-center justify-center">
            <HeartFace count={count} />
          </div>
        ))}
      </motion.div>
    </div>
  );
});
