'use client';

import { useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';

type Result = { ok: true } | { ok: false; error: string };

export function DeleteButton({ onDelete, confirmText, label = 'Delete', redirectTo, iconOnly }: { onDelete: () => Promise<Result>; confirmText: string; label?: string; redirectTo?: string; iconOnly?: boolean }) {
  const [pending, start] = useTransition();
  const router = useRouter();
  return (
    <Button
      type="button"
      variant={iconOnly ? 'ghost' : 'outline'}
      size={iconOnly ? 'icon' : 'sm'}
      aria-label={iconOnly ? label : undefined}
      disabled={pending}
      className={iconOnly ? 'text-slate-500 hover:text-destructive' : 'border-red-200 text-destructive hover:bg-red-50'}
      onClick={() => {
        if (!window.confirm(confirmText)) return;
        start(async () => {
          const res = await onDelete();
          if (!res.ok) return void toast.error(res.error);
          toast.success('Deleted');
          if (redirectTo) router.push(redirectTo);
          else router.refresh();
        });
      }}
    >
      <Trash2 />
      {!iconOnly && label}
    </Button>
  );
}
