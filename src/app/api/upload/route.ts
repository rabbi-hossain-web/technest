import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { deleteImage, isCloudinaryConfigured, uploadImage } from '@/lib/cloudinary';

export const runtime = 'nodejs';

const MAX_BYTES = 8 * 1024 * 1024;
const TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/avif', 'image/gif'];

async function guard() {
  const session = await getSession();
  if (!session || session.role !== 'admin') return NextResponse.json({ error: 'Not authorized' }, { status: 401 });
  if (!isCloudinaryConfigured()) return NextResponse.json({ error: 'Cloudinary is not configured. Add CLOUDINARY_* keys to .env.local.' }, { status: 500 });
  return null;
}

export async function POST(req: Request) {
  const blocked = await guard();
  if (blocked) return blocked;

  const form = await req.formData();
  const files = form.getAll('files').filter((f): f is File => f instanceof File);
  const folder = String(form.get('folder') || 'technest/products');
  if (!files.length) return NextResponse.json({ error: 'No files received' }, { status: 400 });

  const uploaded: { url: string; publicId: string }[] = [];
  for (const file of files) {
    if (!TYPES.includes(file.type)) return NextResponse.json({ error: `${file.name}: unsupported file type` }, { status: 400 });
    if (file.size > MAX_BYTES) return NextResponse.json({ error: `${file.name}: larger than 8 MB` }, { status: 400 });
    uploaded.push(await uploadImage(file, folder));
  }
  return NextResponse.json({ images: uploaded });
}

export async function DELETE(req: Request) {
  const blocked = await guard();
  if (blocked) return blocked;
  const { publicId } = (await req.json()) as { publicId?: string };
  if (!publicId) return NextResponse.json({ error: 'publicId required' }, { status: 400 });
  await deleteImage(publicId);
  return NextResponse.json({ ok: true });
}
