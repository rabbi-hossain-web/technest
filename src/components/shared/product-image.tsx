import Image from 'next/image';
import { cn } from '@/lib/utils';
import { ProductArt } from './product-art';

type Props = {
  src?: string | null;
  art?: string;
  alt: string;
  sizes?: string;
  className?: string;
  priority?: boolean;
};

/** Shows the Cloudinary image when present, otherwise the vector illustration. Fills its (relative) parent. */
export function ProductImage({ src, art, alt, sizes = '(max-width: 768px) 50vw, 240px', className, priority }: Props) {
  if (src) {
    return (
      <div className={cn('relative h-full w-full', className)}>
        <Image src={src} alt={alt} fill sizes={sizes} priority={priority} className="object-contain" />
      </div>
    );
  }
  return (
    <div className={cn('flex h-full w-full items-center justify-center', className)}>
      <ProductArt kind={art} className="max-h-full w-full max-w-[85%]" />
    </div>
  );
}
