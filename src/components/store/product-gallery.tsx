'use client';

import { useCallback, useEffect, useRef, useState, type PointerEvent } from 'react';
import { ZoomIn } from 'lucide-react';
import { ProductImage } from '@/components/shared/product-image';
import { cn } from '@/lib/utils';
import type { ProductImage as Img } from '@/types';

const MIN_ZOOM = 1.5;
const MAX_ZOOM = 5;
const DEFAULT_ZOOM = 2.5;
const ZOOM_STEP = 0.25;

const clamp = (v: number, min: number, max: number) => Math.min(max, Math.max(min, v));

export function ProductGallery({ images, art, name, badge }: { images: Img[]; art?: string; name: string; badge?: string }) {
  const [active, setActive] = useState(0);
  const [zoomed, setZoomed] = useState(false);
  const [scale, setScale] = useState(DEFAULT_ZOOM);
  const current = images[active];

  const stageRef = useRef<HTMLDivElement>(null);
  const zoomLayerRef = useRef<HTMLDivElement>(null);
  const viewportRef = useRef<HTMLDivElement>(null);
  // Cursor position as a fraction (0–1) of the stage. Kept in a ref so mouse moves don't re-render.
  const posRef = useRef({ x: 0.5, y: 0.5 });
  const scaleRef = useRef(scale);
  scaleRef.current = scale;

  /** Sync the zoom origin and the minimap viewport box with the current position and scale. */
  const applyView = useCallback(() => {
    const { x, y } = posRef.current;
    const s = scaleRef.current;
    if (zoomLayerRef.current) zoomLayerRef.current.style.transformOrigin = `${x * 100}% ${y * 100}%`;
    if (viewportRef.current) {
      // With origin (x, y) and scale s, the visible region starts at x·(1 − 1/s) and spans 1/s of the image.
      const size = 100 / s;
      const box = viewportRef.current.style;
      box.width = `${size}%`;
      box.height = `${size}%`;
      box.left = `${x * (100 - size)}%`;
      box.top = `${y * (100 - size)}%`;
    }
  }, []);

  const updatePos = (e: PointerEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    posRef.current = {
      x: clamp((e.clientX - rect.left) / rect.width, 0, 1),
      y: clamp((e.clientY - rect.top) / rect.height, 0, 1),
    };
    applyView();
  };

  const handleEnter = (e: PointerEvent<HTMLDivElement>) => {
    if (e.pointerType !== 'mouse') return; // hover zoom is for mouse users only
    updatePos(e);
    setZoomed(true);
  };

  const handleMove = (e: PointerEvent<HTMLDivElement>) => {
    if (e.pointerType !== 'mouse') return;
    if (!zoomed) setZoomed(true);
    updatePos(e);
  };

  // Re-sync whenever the scale changes or the minimap mounts.
  useEffect(() => {
    applyView();
  }, [scale, zoomed, applyView]);

  // Scroll wheel adjusts zoom level. Needs a non-passive native listener so we can stop the page scrolling.
  useEffect(() => {
    const stage = stageRef.current;
    if (!stage || !zoomed) return;
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      const dir = e.deltaY < 0 ? 1 : -1;
      setScale((s) => clamp(Math.round((s + dir * ZOOM_STEP) * 100) / 100, MIN_ZOOM, MAX_ZOOM));
    };
    stage.addEventListener('wheel', onWheel, { passive: false });
    return () => stage.removeEventListener('wheel', onWheel);
  }, [zoomed]);

  return (
    <div className="flex flex-col gap-3.5">
      <div
        ref={stageRef}
        className={cn(
          'group relative h-[300px] overflow-hidden rounded-2xl bg-secondary sm:h-[460px]',
          zoomed ? 'cursor-crosshair' : 'cursor-zoom-in',
        )}
        onPointerEnter={handleEnter}
        onPointerMove={handleMove}
        onPointerLeave={() => setZoomed(false)}
      >
        {badge && <span className="absolute left-4 top-4 z-20 rounded-full bg-navy px-2.5 py-1 text-xs font-semibold text-white">{badge}</span>}

        {/* Zoomable image layer */}
        <div
          ref={zoomLayerRef}
          className="h-full w-full p-6 transition-transform duration-200 ease-out will-change-transform sm:p-10"
          style={{ transform: zoomed ? `scale(${scale})` : 'scale(1)' }}
        >
          <ProductImage src={current?.url} art={art} alt={name} sizes="(max-width: 1024px) 100vw, 1200px" priority />
        </div>

        {/* Hint shown before zooming (mouse devices only) */}
        <div
          className={cn(
            'pointer-events-none absolute bottom-3 right-3 z-20 hidden items-center gap-1.5 rounded-full bg-background/85 px-3 py-1.5 text-xs font-medium text-muted-foreground shadow-sm backdrop-blur [@media(hover:hover)]:flex',
            'transition-opacity duration-200',
            zoomed ? 'opacity-0' : 'opacity-100',
          )}
        >
          <ZoomIn className="h-3.5 w-3.5" />
          Hover to zoom
        </div>

        {/* Zoom level readout + scroll hint */}
        <div
          className={cn(
            'pointer-events-none absolute bottom-3 left-3 z-20 flex items-center gap-2 rounded-full bg-background/90 px-3 py-1.5 text-xs shadow-md backdrop-blur transition-all duration-200',
            zoomed ? 'translate-y-0 opacity-100' : 'translate-y-2 opacity-0',
          )}
        >
          <span className="font-semibold tabular-nums text-foreground">{Number(scale.toFixed(2))}×</span>
          <span className="h-1 w-14 overflow-hidden rounded-full bg-muted">
            <span
              className="block h-full rounded-full bg-primary transition-[width] duration-150"
              style={{ width: `${((scale - MIN_ZOOM) / (MAX_ZOOM - MIN_ZOOM)) * 100}%` }}
            />
          </span>
          <span className="hidden text-muted-foreground sm:inline">Scroll to zoom</span>
        </div>

        {/* Minimap: whole image with a box marking the area currently visible. Same aspect ratio as the stage. */}
        <div
          aria-hidden
          className={cn(
            'pointer-events-none absolute right-3 top-3 z-20 h-1/4 w-1/4 overflow-hidden rounded-lg border border-border bg-secondary/95 shadow-lg ring-1 ring-black/5 backdrop-blur transition-all duration-200',
            zoomed ? 'scale-100 opacity-100' : 'scale-95 opacity-0',
          )}
        >
          {/* Padding is a quarter of the main layer's padding so the minimap matches it exactly. */}
          <div className="h-full w-full p-1.5 sm:p-2.5">
            <ProductImage src={current?.url} art={art} alt="" sizes="200px" />
          </div>
          {/* Dim everything outside the visible box using a large box-shadow */}
          <div
            ref={viewportRef}
            className="absolute rounded-[3px] border-2 border-primary shadow-[0_0_0_9999px_rgba(15,23,42,0.35)]"
          />
        </div>
      </div>

      {images.length > 1 && (
        <div className="grid grid-cols-4 gap-2 sm:grid-cols-5 sm:gap-3">
          {images.map((img, i) => (
            <button
              key={img.url}
              type="button"
              onClick={() => setActive(i)}
              aria-label={`Show image ${i + 1}`}
              aria-pressed={i === active}
              className={cn('relative h-[72px] rounded-lg bg-secondary p-2 sm:h-[88px]', i === active ? 'ring-2 ring-primary' : 'border')}
            >
              <ProductImage src={img.url} alt="" sizes="100px" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
