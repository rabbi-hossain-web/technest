'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';

export function CopyCode({ code }: { code: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <Button
      size="lg"
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(code);
        } catch {}
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }}
    >
      {copied ? 'Copied!' : 'Copy code'}
    </Button>
  );
}
