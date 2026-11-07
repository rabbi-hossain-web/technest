/**
 * Real product photos for the demo catalog, served from /public/products.
 * Sourced from Wikimedia Commons under free licenses — see public/products/CREDITS.md.
 * Keys are the product names used in scripts/seed.ts.
 */
export const productImages: Record<string, string> = {
  'Apple AirPods Pro (2nd Gen)': '/products/airpods-pro-2.webp',
  'Apple Watch Series 10': '/products/apple-watch-series-10.webp',
  'MacBook Air M3 (13-inch)': '/products/macbook-air.webp',
  'iPhone 16 (128GB)': '/products/iphone-16.webp',
  'Sony WH-1000XM5': '/products/sony-wh-1000x.webp',
  'PlayStation 5 Slim': '/products/playstation-5.webp',
  'Samsung Galaxy S25 Ultra': '/products/galaxy-s25-ultra.webp',
  'Dell XPS 14': '/products/dell-xps.webp',
  'ASUS Zenbook 14 OLED': '/products/asus-zenbook.webp',
  'Samsung Galaxy Watch7': '/products/galaxy-watch7.webp',
  'iPad Air 11-inch (M2)': '/products/ipad-air-m2.webp',
  'Wireless Pro Controller': '/products/pro-controller.webp',
  'Canon EOS R50 Kit': '/products/canon-eos-r50.webp',
  'Logitech MX Master 3S': '/products/mx-master-3s.webp',
  'Logitech MX Keys S': '/products/mx-keys.webp',
  'JBL Flip 6 Speaker': '/products/jbl-flip.webp',
  '20,000 mAh USB‑C Power Bank': '/products/anker-power-bank.webp',
};

/** Product `images` array for a seed product name (empty when no photo is mapped). */
export const imagesFor = (name: string) => (productImages[name] ? [{ url: productImages[name], publicId: '' }] : []);
