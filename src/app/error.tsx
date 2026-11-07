'use client';

import { Button } from '@/components/ui/button';

export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  const dbMissing = error.message?.includes('MONGODB_URI');
  return (
    <main className="flex min-h-[70vh] flex-col items-center justify-center gap-4 px-6 text-center">
      <h1 className="text-2xl font-semibold">Something went wrong</h1>
      <p className="max-w-md text-muted-foreground">
        {dbMissing ? 'The database is not configured. Add MONGODB_URI to .env.local and restart the server.' : 'Please try again in a moment.'}
      </p>
      <Button onClick={reset}>Try again</Button>
    </main>
  );
}
