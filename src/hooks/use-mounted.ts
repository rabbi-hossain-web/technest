'use client';

import { useEffect, useState } from 'react';

/** True after the first client render — avoids hydration mismatches with persisted (localStorage) state. */
export function useMounted() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  return mounted;
}
