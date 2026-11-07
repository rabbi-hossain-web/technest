'use client';

import { useActionState, useState } from 'react';
import { Star } from 'lucide-react';
import { addReviewAction } from '@/actions/reviews';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';

export function ReviewForm({ productId, slug }: { productId: string; slug: string }) {
  const [state, action, pending] = useActionState(addReviewAction.bind(null, productId, slug), undefined);
  const [rating, setRating] = useState(0);
  return (
    <form action={action} className="flex flex-col gap-4 rounded-xl border p-5">
      <h3 className="font-sans text-base font-semibold">Write a review</h3>
      <fieldset>
        <legend className="mb-2 text-[13px] font-medium text-slate-700">Your rating</legend>
        <div className="flex gap-1">
          {[1, 2, 3, 4, 5].map((n) => (
            <button key={n} type="button" aria-label={`${n} star${n > 1 ? 's' : ''}`} aria-pressed={rating === n} onClick={() => setRating(n)} className="p-1">
              <Star className={cn('h-6 w-6', n <= rating ? 'fill-star text-star' : 'text-slate-300')} />
            </button>
          ))}
        </div>
        <input type="hidden" name="rating" value={rating} />
      </fieldset>
      <div className="flex flex-col gap-1.5"><Label htmlFor="r-title">Title</Label><Input id="r-title" name="title" required /></div>
      <div className="flex flex-col gap-1.5"><Label htmlFor="r-body">Review</Label><Textarea id="r-body" name="body" rows={4} required /></div>
      {state?.error && <p className="text-sm text-destructive" role="alert">{state.error}</p>}
      {state?.success && <p className="text-sm text-green-700" role="status">{state.success}</p>}
      <Button type="submit" disabled={pending} className="self-start">{pending ? 'Posting…' : 'Post review'}</Button>
    </form>
  );
}
