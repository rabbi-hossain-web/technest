'use client';

import { useEffect, useState } from 'react';

function parts(ms: number) {
  const t = Math.max(0, Math.floor(ms / 1000));
  return [
    { v: Math.floor(t / 86400), l: 'Days' },
    { v: Math.floor((t % 86400) / 3600), l: 'Hours' },
    { v: Math.floor((t % 3600) / 60), l: 'Mins' },
    { v: t % 60, l: 'Secs' },
  ];
}

export function Countdown({ endsAt }: { endsAt: string }) {
  const end = new Date(endsAt).getTime();
  const [now, setNow] = useState<number | null>(null);
  useEffect(() => {
    setNow(Date.now());
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);
  const units = parts(now == null ? 0 : end - now);
  return (
    <div role="timer" aria-label="Time left in sale" className="flex gap-2 sm:gap-2.5">
      {units.map((u) => (
        <div key={u.l} className="flex h-[72px] w-[62px] flex-col sm:h-[84px] sm:w-[76px] items-center justify-center gap-1 rounded-xl border border-white/15 bg-white/10">
          <span className="font-display text-2xl font-semibold tabular-nums sm:text-3xl">{now == null ? '--' : String(u.v).padStart(2, '0')}</span>
          <span className="text-[10px] uppercase tracking-wider text-slate-300 sm:text-[11px]">{u.l}</span>
        </div>
      ))}
    </div>
  );
}
