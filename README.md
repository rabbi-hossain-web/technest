# TechNest — Next.js e-commerce store + admin panel

A full electronics store built from the TechNest design.

**Stack:** Next.js 15 (App Router, Server Actions) · React 19 · TypeScript · MongoDB (Mongoose) · Cloudinary (product images) · Tailwind CSS · shadcn/ui (Radix) · Zustand (cart & wishlist)

---

## 1. Requirements

- **Node.js 18.18+** (Node 20 or 22 recommended)
- A **MongoDB** database — free cluster on [MongoDB Atlas](https://www.mongodb.com/atlas) or a local `mongod`
- A **Cloudinary** account (free tier is fine) — only needed to upload product photos

## 2. Setup

```bash
# 1. install dependencies
npm install

# 2. create your environment file
cp .env.example .env.local
#    then open .env.local and fill in MONGODB_URI, JWT_SECRET and the CLOUDINARY_* keys

# 3. load demo data (categories, 17 products, coupons, demo customers, ~90 orders, reviews)
npm run seed

# 4. start the dev server
npm run dev
```

Open <http://localhost:3000> for the store and <http://localhost:3000/admin> for the admin panel.

### Logins created by the seed

| Role | Email | Password |
|------|-------|----------|
| Admin | value of `ADMIN_EMAIL` (default `admin@technest.com`) | value of `ADMIN_PASSWORD` (default `Admin@12345`) |
| Demo customer | `rahim.ahmed@example.com` (any of the 12 demo customers) | `Customer@123` |

> Change the admin password right away for anything public — sign in as admin, or update `ADMIN_PASSWORD` and re-seed on a fresh database.

`npm run seed -- --reset` wipes the store data (products, orders, coupons, reviews, messages, customers) and seeds again. The admin account is kept.

Demo products ship with real photos from `public/products/` (credits in [public/products/CREDITS.md](public/products/CREDITS.md)). Already seeded before the photos were added? Run `npm run seed:images` — it adds them to products that have no images, without touching anything else.

### Environment variables

| Variable | Purpose |
|----------|---------|
| `MONGODB_URI` | MongoDB connection string |
| `JWT_SECRET` | Long random string used to sign login cookies (`openssl rand -base64 32`) |
| `CLOUDINARY_CLOUD_NAME` / `CLOUDINARY_API_KEY` / `CLOUDINARY_API_SECRET` | From Cloudinary → Settings → API Keys |
| `NEXT_PUBLIC_SITE_URL` | Your public URL (used for metadata) |
| `ADMIN_EMAIL` / `ADMIN_PASSWORD` | First admin account created by `npm run seed` |

## 3. What's included

### Storefront
| Route | Page |
|-------|------|
| `/` | Home — hero, categories, promo banners, popular products, top brands |
| `/shop` | Catalog with search, category / brand / price / stock / sale filters, sorting, pagination |
| `/product/[slug]` | Product detail — image gallery, quantity, add to cart / buy now, wishlist, specs, reviews (signed-in users can post) |
| `/deals` | Sale products, live countdown, featured coupon |
| `/brands` | All brands with product counts |
| `/cart` | Cart with quantity editing, coupon codes, live totals (shipping + tax) |
| `/checkout` | Contact, address, delivery method, payment method → creates the order |
| `/order/[id]` | Order confirmation & status tracker |
| `/login`, `/register` | Customer accounts |
| `/account` | Order history, live order tracker, profile & default address, password change |
| `/wishlist` | Saved products (stored in the browser) |
| `/support` | FAQ + contact form (messages appear in admin) |

### Admin panel (`/admin`, admin role only)
| Route | Page |
|-------|------|
| `/admin/login` | Staff sign-in |
| `/admin` | Dashboard — revenue, orders, new customers, AOV (vs last month), 12-month revenue chart, sales by category, recent orders, top products, low stock |
| `/admin/orders` | Orders by status with search and pagination |
| `/admin/orders/[id]` | Order detail — change status / payment status, courier & tracking number, timeline notes (cancelling returns stock) |
| `/admin/products` | Product list with search and category / status filters |
| `/admin/products/new`, `/admin/products/[id]` | Product editor — **Cloudinary image upload**, cover image, pricing with profit/margin, stock, SKU, specs, tags, featured flag, badge, draft / active / archived |
| `/admin/categories` | Create, edit, delete categories |
| `/admin/customers` | Customers with order count, total spent, last order, segment |
| `/admin/discounts` | Coupon codes — percent or fixed, minimum order, usage limit, expiry, on/off |
| `/admin/messages` | Contact-form messages (mark read, reply, delete) |
| `/admin/settings` | Store name, support contacts, currency, free-shipping threshold, tax rate, shipping rates, deals end date, payment methods |

### How it works
- **Data:** Mongoose models in `src/models`. Reads happen in server components via `src/lib/queries.ts`; writes go through Server Actions in `src/actions`.
- **Auth:** email + password (bcrypt), session stored as a signed JWT in an httpOnly cookie (`src/lib/auth.ts`). `src/middleware.ts` protects `/admin/*` and `/account/*`, and every admin action re-checks the role on the server.
- **Images:** `POST /api/upload` (admin only) streams files to Cloudinary into `technest/products`, with automatic format and quality. Images removed in the editor are deleted from Cloudinary when you save. Products without photos show a built-in vector illustration, so the seeded store looks complete before you upload anything.
- **Orders:** totals are always recalculated on the server from database prices. Stock is reserved atomically when an order is placed and returned if the order is cancelled. Order numbers are sequential (`TN-20581`, …).
- **Cart & wishlist:** kept in the browser (localStorage) with Zustand, so guests can shop. Checkout works for guests and signed-in customers.

## 4. Payments — what you need to add

Orders are created with payment status **unpaid**. Cash on delivery and bKash (manual confirmation) are on by default. Admins mark orders **Paid** on the order screen.
Online card / PayPal payments need a payment gateway (Stripe, SSLCommerz, PayPal, bKash Checkout API, …). Card and PayPal are switched **off** in Settings until you connect one. The place to plug a gateway in is `placeOrderAction` in `src/actions/orders.ts`: after the order is created, create a payment session and redirect to it, then mark the order paid from the gateway's webhook.

## 5. Project structure

```
src/
  app/
    (store)/…          storefront pages (shared header/footer layout)
    admin/login        admin sign-in
    admin/(panel)/…    admin pages (sidebar layout)
    api/upload         Cloudinary upload/delete endpoint
  actions/             server actions (auth, orders, products, coupons, reviews, messages, settings, account)
  components/
    ui/                shadcn/ui components
    store/             storefront components
    admin/             admin components
    shared/            product art, images, stars, logo, status badge, pagination
  lib/                 db connection, auth, cloudinary, queries, pricing, cart store, utils
  models/              Mongoose models
  types/               shared TypeScript types
scripts/seed.ts        demo data
```

Add more shadcn components any time with `npx shadcn@latest add <component>` (`components.json` is already configured).

## 6. Deploying (Vercel)

1. Push the project to GitHub and import it in Vercel.
2. Add the same environment variables in Vercel → Project → Settings → Environment Variables.
3. In MongoDB Atlas → Network Access, allow Vercel to connect (`0.0.0.0/0`, or Vercel's IP ranges).
4. Deploy. Run `npm run seed` once from your machine against the production `MONGODB_URI` if you want the demo data.

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start the dev server |
| `npm run build` / `npm start` | Production build / serve |
| `npm run seed` | Seed demo data (`-- --reset` to start fresh) |
| `npm run typecheck` | TypeScript check |
