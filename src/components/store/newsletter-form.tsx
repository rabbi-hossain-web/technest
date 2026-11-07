'use client';

import { useState } from 'react';
import { toast } from 'sonner';

export function NewsletterForm() {
  const [email, setEmail] = useState('');
  return (
    <form
      className="flex max-w-md flex-wrap gap-2"
      onSubmit={(e) => {
        e.preventDefault();
        if (!/^\S+@\S+\.\S+$/.test(email)) return toast.error('Enter a valid email address.');
        toast.success('Thanks for subscribing!');
        setEmail('');
      }}
    >
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        aria-label="Email address"
        placeholder="you@example.com"
        className="h-11 min-w-0 flex-1 basis-48 rounded-lg border border-[#2A3B5C] bg-navy-800 px-3.5 text-sm text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-brand"
      />
      <button type="submit" className="h-11 rounded-lg bg-primary px-5 text-sm font-semibold text-white hover:bg-primary/90">
        Subscribe
      </button>
    </form>
  );
}
