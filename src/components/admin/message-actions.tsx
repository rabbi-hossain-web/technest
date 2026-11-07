'use client';

import { useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { deleteMessageAction, setMessageReadAction } from '@/actions/messages';
import { Button } from '@/components/ui/button';
import { DeleteButton } from './delete-button';

export function MessageActions({ id, read, email }: { id: string; read: boolean; email: string }) {
  const [pending, start] = useTransition();
  const router = useRouter();
  return (
    <div className="flex flex-wrap gap-2">
      <Button asChild size="sm"><a href={`mailto:${email}`}>Reply by email</a></Button>
      <Button size="sm" variant="outline" disabled={pending} onClick={() => start(async () => { await setMessageReadAction(id, !read); router.refresh(); })}>
        Mark as {read ? 'unread' : 'read'}
      </Button>
      <DeleteButton confirmText="Delete this message?" onDelete={() => deleteMessageAction(id)} />
    </div>
  );
}
