'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Pencil } from 'lucide-react';
import { toast } from 'sonner';
import { deleteCategoryAction, saveCategoryAction } from '@/actions/products';
import { ProductArt } from '@/components/shared/product-art';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { NativeSelect } from '@/components/ui/native-select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import type { CategoryDTO } from '@/types';
import { DeleteButton } from './delete-button';

const ART_KINDS = ['laptop', 'phone', 'headphones', 'watch', 'earbuds', 'tablet', 'gamepad', 'console', 'camera', 'mouse', 'speaker', 'keyboard', 'accessories'];
const EMPTY = { name: '', description: '', art: 'accessories', order: 0 };

export function CategoryManager({ categories, counts }: { categories: CategoryDTO[]; counts: Record<string, number> }) {
  const router = useRouter();
  const [editing, setEditing] = useState<string | null>(null);
  const [form, setForm] = useState(EMPTY);
  const [pending, start] = useTransition();

  return (
    <div className="flex flex-wrap items-start gap-5">
      <Card className="min-w-0 flex-[2_1_320px] overflow-hidden">
        <Table className="min-w-[520px]">
          <TableHeader><TableRow><TableHead>Category</TableHead><TableHead>Slug</TableHead><TableHead className="text-right">Products</TableHead><TableHead className="text-right">Order</TableHead><TableHead><span className="sr-only">Actions</span></TableHead></TableRow></TableHeader>
          <TableBody>
            {categories.length === 0 && <TableRow><TableCell colSpan={5} className="py-10 text-center text-muted-foreground">No categories yet.</TableCell></TableRow>}
            {categories.map((c) => (
              <TableRow key={c._id}>
                <TableCell><span className="flex items-center gap-3"><span className="w-10"><ProductArt kind={c.art} /></span><span className="font-semibold">{c.name}</span></span></TableCell>
                <TableCell className="font-mono text-[13px] text-slate-700">{c.slug}</TableCell>
                <TableCell className="text-right">{counts[c._id] ?? 0}</TableCell>
                <TableCell className="text-right">{c.order ?? 0}</TableCell>
                <TableCell>
                  <div className="flex justify-end gap-1">
                    <Button variant="ghost" size="icon" aria-label={`Edit ${c.name}`} onClick={() => { setEditing(c._id); setForm({ name: c.name, description: c.description ?? '', art: c.art ?? 'accessories', order: c.order ?? 0 }); }}>
                      <Pencil />
                    </Button>
                    <DeleteButton iconOnly label={`Delete ${c.name}`} confirmText={`Delete the “${c.name}” category?`} onDelete={() => deleteCategoryAction(c._id)} />
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
      <Card className="min-w-0 flex-[1_1_300px]">
        <CardHeader><CardTitle>{editing ? 'Edit category' : 'New category'}</CardTitle></CardHeader>
        <CardContent>
          <form
            className="flex flex-col gap-3.5"
            onSubmit={(e) => {
              e.preventDefault();
              start(async () => {
                const res = await saveCategoryAction(editing, form);
                if (!res.ok) return void toast.error(res.error);
                toast.success(editing ? 'Category updated' : 'Category created');
                setEditing(null);
                setForm(EMPTY);
                router.refresh();
              });
            }}
          >
            <div className="flex flex-col gap-1.5"><Label htmlFor="c-name">Name</Label><Input id="c-name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required /></div>
            <div className="flex flex-col gap-1.5"><Label htmlFor="c-desc">Description</Label><Input id="c-desc" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></div>
            <div className="flex items-end gap-3">
              <div className="flex flex-1 flex-col gap-1.5">
                <Label htmlFor="c-art">Illustration</Label>
                <NativeSelect id="c-art" value={form.art} onChange={(e) => setForm({ ...form, art: e.target.value })}>
                  {ART_KINDS.map((k) => <option key={k}>{k}</option>)}
                </NativeSelect>
              </div>
              <div className="w-14 pb-1"><ProductArt kind={form.art} /></div>
            </div>
            <div className="flex flex-col gap-1.5"><Label htmlFor="c-order">Sort order</Label><Input id="c-order" type="number" value={form.order} onChange={(e) => setForm({ ...form, order: Number(e.target.value) })} /></div>
            <div className="flex gap-2">
              <Button type="submit" disabled={pending}>{pending ? 'Saving…' : editing ? 'Save changes' : 'Create category'}</Button>
              {editing && <Button type="button" variant="outline" onClick={() => { setEditing(null); setForm(EMPTY); }}>Cancel</Button>}
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
