"use client";

import { useEffect, useState } from "react";

const fmt = (tz: string) => new Intl.DateTimeFormat("en-GB", { timeZone: tz, weekday: "short", hour: "2-digit", minute: "2-digit", hourCycle: "h23" });
const wat = fmt("Africa/Lagos");
const ny = fmt("America/New_York");

/** Nigeria time is the academy's working time; New York is shown for the CEO. */
export function DualClock() {
  const [now, setNow] = useState<Date | null>(null);
  useEffect(() => {
    const tick = () => setNow(new Date());
    const first = setTimeout(tick, 0);
    const t = setInterval(tick, 30_000);
    return () => {
      clearTimeout(first);
      clearInterval(t);
    };
  }, []);
  if (!now) return <span className="text-sm text-navy-400">Nigeria time (WAT)</span>;
  return (
    <p className="flex flex-wrap gap-x-3 text-sm" aria-label="Current times">
      <span>
        <span className="text-navy-400">Yola </span>
        <time className="font-medium text-white tabular-nums">{wat.format(now)} WAT</time>
      </span>
      <span>
        <span className="text-navy-400">New York </span>
        <time className="tabular-nums text-navy-200">{ny.format(now)}</time>
      </span>
    </p>
  );
}
