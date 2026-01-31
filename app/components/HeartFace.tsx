"use client";

import { animate, stagger } from "animejs";
import * as React from "react";
import { HeartIcon } from "./HeartIcon";

type Props = {
  count: 1 | 2 | 3;
  size?: number;
  beat?: boolean;
  beatStrength?: "soft" | "strong";
};

export function HeartFace({
  count,
  size = 22,
  beat = false,
  beatStrength = "soft",
}: Props) {
  const wrapRef = React.useRef<HTMLDivElement | null>(null);

  React.useEffect(() => {
    if (!beat) return;
    if (!wrapRef.current) return;

    const targets =
      wrapRef.current.querySelectorAll<HTMLElement>("[data-heart]");
    if (!targets.length) return;

    const scaleMax = beatStrength === "strong" ? 1.22 : 1.14;
    const duration = beatStrength === "strong" ? 520 : 620;

    const a = animate(targets, {
      scale: [1, scaleMax, 1],
      easing: "easeInOutSine",
      duration,
      delay: stagger(90),
      loop: true,
    });

    return () => {
      a.pause();
    };
  }, [beat, beatStrength, count]);

  return (
    <div ref={wrapRef} className="flex items-center justify-center gap-2">
      {Array.from({ length: count }).map((_, i) => (
        <span
          key={i}
          data-heart
          className="inline-flex items-center justify-center rounded-full bg-rose-500/10 p-2 ring-1 ring-rose-500/15 will-change-transform"
        >
          <HeartIcon
            width={size}
            height={size}
            className="text-rose-500 drop-shadow-sm"
            aria-label={`${count} hearts`}
          />
        </span>
      ))}
    </div>
  );
}
