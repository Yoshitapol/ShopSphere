# ShopSphere — Full-Stack E-Commerce Marketplace & Inventory Management Platform

**ShopSphere** is a full-stack e-commerce marketplace and warehouse inventory management application built with the **Next.js App Router (TypeScript)**, **Tailwind CSS**, **MySQL + Prisma ORM**, **MongoDB + Mongoose ODM**, **Better Auth (Google & GitHub OAuth)**, **Role-Based Access Control (RBAC)**, **Zod Validation**, and **Docker Compose**.

Developed as an academic Full-Stack Development (FSD) Mini-Project, ShopSphere cohesively integrates all **10 Full Stack Lab Experiments** into a realistic, demonstrable Indian e-commerce platform priced in **Indian Rupees (₹ INR)**.

---

## 1. Project Objectives & Core Features

### Customer Storefront Experience
- **Catalog Exploration (`/`, `/products`)**: Browse studio-grade electronics, developer laptops, smart wearables, ergonomic workspace gear, and smart home appliances priced in ₹ INR.
- **Search & Multi-Faceted Filtering**: Filter products by keyword/SKU/tag, category, minimum/maximum price in ₹ INR, in-stock status, and sort order (`featured`, `price-asc`, `price-desc`, `rating`, `newest`).
- **Dynamic Product Details (`/products/[id]`)**: View high-resolution imagery with automatic broken-image fallback, MRP discount calculation, warehouse stock badges, warranty info, and embedded **MongoDB/Mongoose technical specifications**.
- **Interactive Shopping Cart (`/cart`)**: Add/remove items, adjust quantities within warehouse stock limits, and inspect itemized 18% GST and shipping calculations.
- **ACID Transactional Checkout (`/checkout`)**: Complete a clearly labeled **Simulated Checkout** backed by a real **MySQL Prisma `$transaction`** that validates stock, creates the `Order` and `OrderItem` records using authoritative server prices, decrements `InventoryItem` stock atomically, and synchronizes availability with MongoDB.
- **Order History & Ownership Protection (`/orders`, `/orders/[id]`)**: Customers can view their own order receipts while server-boundary ownership verification prevents viewing another customer's order via URL tampering (IDOR protection).

### Admin Operations Experience (`/dashboard`)
- **Protected Admin Console (`/dashboard`)**: Enforced at both the Next.js Middleware layer and the Node.js Server Component / Server Action / Route Handler boundary.
- **Operational Analytics**: Live cards for Gross Revenue (₹ INR), Total Orders, Catalog SKU Count, Low-Stock / Out-of-Stock Alerts, and Warehouse Stock by Category.
- **Layout State Preservation Demo (Experiment 3)**: Interactive **Audit Counter & Session Scratchpad** mounted in `src/app/dashboard/layout.tsx` that preserves React client state across sibling route transitions (`/dashboard`, `/dashboard/products`, `/dashboard/products/new`, `/dashboard/orders`).
- **Complete Product & Category CRUD (`/dashboard/products`, `/dashboard/products/new`, `/dashboard/products/[id]/edit`)**: Create, edit, and delete products (with confirmation) and categories using React Server Actions, REST Route Handlers, and Zod validation.
- **Live Order Fulfillment Updates (`/dashboard/orders`)**: Update order status (`PENDING`, `CONFIRMED`, `PROCESSING`, `SHIPPED`, `DELIVERED`, `CANCELLED`) with instant cache revalidation.
- **Environment Security Audit Panel (Experiment 10)**: Redacted live audit table comparing `server-only` private credentials against browser-safe `NEXT_PUBLIC_*` variables.

---

## 2. Technology Stack & Version Compatibility

| Layer | Technology | Version | Purpose |
| :--- | :--- | :--- | :--- |
| **Framework** | Next.js (App Router) | `15.2.4` | Server Components, Client Components, Route Handlers, Server Actions, Standalone Docker output |
| **Language** | TypeScript | `^5.8.2` | End-to-end static type checking |
| **UI & Styling** | React 19 + Tailwind CSS | `^19.0.0` / `^3.4.17` | Mobile-first responsive design system (`indigo-600` accent on `slate-50` surface) |
| **Relational DB** | MySQL 8.0 + Prisma ORM | `^6.5.0` | Users, Sessions, Roles, Categories, `InventoryItem` stock, `Order` & `OrderItem` ACID transactions |
| **Document DB** | MongoDB + Mongoose ODM | `^8.12.1` | Product catalog documents, embedded specifications, tags, search indexes, connection caching |
| **Authentication** | Better Auth | `^1.2.5` | Email/Password, Google OAuth 2.0, GitHub OAuth 2.0, Prisma MySQL adapter, HTTP-only cookies |
| **Validation** | Zod | `^3.24.2` | Schema validation & input sanitization for API Route Handlers and Server Actions |
| **Security** | `server-only` | `^0.0.1` | Build-time enforcement preventing secret or DB modules from entering client bundles |
| **Containerization** | Docker & Docker Compose | Compose v2 | Multi-stage production `Dockerfile` (non-root user) + `mysql:8.0` + `mongo:7.0` |

---

## 3. Dual-Database Architecture Overview

```mermaid
flowchart TB
  subgraph Client["Browser Client (React 19 + Tailwind CSS)"]
    PublicUI["Public Storefront & Cart"]
    AdminUI["Admin Dashboard (Layout State Preserved)"]
  end

  subgraph NextServer["Next.js App Router Server (Node.js Runtime)"]
    MW["Edge Middleware (src/middleware.ts)"]
    RSC["React Server Components"]
    SA["Server Actions (src/actions/*)"]
    API["REST Route Handlers (/api/products, /api/orders)"]
    RBAC["RBAC & Session Guard (src/lib/permissions/rbac.ts)"]
  end

  subgraph Databases["Hybrid Persistence Layer"]
    MY[("MySQL 8.0 (Prisma ORM)\nUsers, Sessions, Roles,\nCategories, InventoryItems,\nOrders & OrderItems")]
    MG[("MongoDB (Mongoose ODM)\nProduct Catalog Documents,\nEmbedded Specifications, Tags")]
    FB[("Local Persistent Fallback\n(.data/shopsphere-store.json)\nActive when DB containers offline")]
  end

  PublicUI --> MW
  AdminUI --> MW
  MW --> RSC
  PublicUI --> SA
  AdminUI --> SA
  PublicUI --> API
  RSC --> RBAC
  SA --> RBAC
  API --> RBAC
  RBAC --> MY
  RBAC --> MG
  RBAC -.-> FB
  MY <-->|"Linked via stable catalogProductId"| MG
```

### Ownership & Cross-Database Consistency Strategy
1. **MySQL + Prisma (`prisma/schema.prisma`)** owns all **transactional and relational entities**:
   - `User`, `Session`, `Account`, `Verification` (managed with Better Auth's Prisma MySQL adapter) + `UserRole` (`GUEST`, `CUSTOMER`, `ADMIN`).
   - `Category` (`id`, `name`, `slug`, `description`).
   - `InventoryItem` (`catalogProductId` `@unique`, `sku` `@unique`, `unitPriceInr`, `stockQuantity`, `reorderThreshold`, `categoryId`).
   - `Order` and `OrderItem` (with `ON DELETE RESTRICT` referential integrity to `User` and `InventoryItem`).
2. **MongoDB + Mongoose (`models/Product.ts`)** owns **rich document-oriented product catalog data**:
   - `Product` documents containing `catalogId` (matching `InventoryItem.catalogProductId`), `name`, `slug`, `sku`, `shortDescription`, `description`, `images`, `tags`, and embedded `specifications: [{ label, value }]`.
3. **Consistency Strategy**:
   - Every product shares a stable `catalogProductId` (e.g. `prod_aether_anc_pro`) across MongoDB (`Product.catalogId`) and MySQL (`InventoryItem.catalogProductId` and `OrderItem.catalogProductId`).
   - Because a single ACID transaction cannot span MySQL and MongoDB simultaneously, **MySQL `InventoryItem` is the authoritative source of truth for stock quantity and unit price**. During checkout, `prisma.$transaction()` atomically verifies and decrements `InventoryItem.stockQuantity` and inserts `Order` + `OrderItem` rows. Immediately after commit, `Product.stockSnapshot` in MongoDB is updated for fast catalog filtering.
   - When local MySQL/MongoDB containers are not running, the data layer automatically persists to `.data/shopsphere-store.json` on disk and displays an explicit status badge in the UI.

---

## 4. Mapping of All 10 Lab Experiments to ShopSphere

| Exp # | Lab Experiment Title | ShopSphere Feature & Implementation | Key Files |
| :--- | :--- | :--- | :--- |
| **Exp 1** | **Next.js App Router Fundamentals** | Route groups `(public)` & `(customer)`, nested `/dashboard/*` routes, async dynamic routes (`/products/[id]`, `/orders/[id]`, `/dashboard/products/[id]/edit`), RSC vs Client Components, TypeScript interfaces | `src/app/layout.tsx`, `src/app/(public)/products/[id]/page.tsx`, `src/types/index.ts` |
| **Exp 2** | **Responsive Tailwind CSS Interface** | Mobile-first storefront & dashboard, search/filter bar, INR product cards with broken-image fallback, analytics cards, responsive tables, loading & empty states, toast notifications | `src/components/layout/navbar.tsx`, `src/components/products/product-card.tsx`, `src/components/ui/product-image.tsx` |
| **Exp 3** | **Root Layouts, Nested Layouts & State Preservation** | Root layout, shared storefront layout, nested dashboard layout with an interactive **Audit Counter & Session Scratchpad** that retains state across sibling routes without remounting | `src/app/dashboard/layout.tsx`, `src/components/dashboard/state-preservation-widget.tsx` |
| **Exp 4** | **Route Handlers & Server Actions** | Complete REST CRUD (`GET`, `POST`, `PUT`, `PATCH`, `DELETE`) under `/api/products` & `/api/products/[id]`, plus Server Actions for forms with Zod validation, HTTP status codes (`200`, `201`, `400`, `401`, `403`, `404`, `409`), and `revalidatePath` | `src/app/api/products/route.ts`, `src/app/api/products/[id]/route.ts`, `src/actions/product-actions.ts`, `src/lib/validation/schemas.ts` |
| **Exp 5** | **Prisma, MySQL, Relationships & Transactions** | Relational schema (`User`, `Category`, `InventoryItem`, `Order`, `OrderItem`), foreign keys, migrations, seed script, and interactive `prisma.$transaction` during checkout | `prisma/schema.prisma`, `prisma/seed.ts`, `src/lib/prisma/order-service.ts` |
| **Exp 6** | **MongoDB & Mongoose** | Mongoose `Product` schema with validators, compound/text indexes, embedded `SpecificationSchema` subdocuments, and `globalThis` cached connection helper | `models/Product.ts`, `src/lib/mongodb/connect.ts`, `src/lib/mongodb/product-service.ts` |
| **Exp 7** | **Better Auth with Google & GitHub OAuth** | Better Auth configured with `prismaAdapter` (`provider: "mysql"`), Google & GitHub OAuth providers, `/api/auth/[...all]` handler, honest OAuth setup diagnostics, and local dev persona switcher using HTTP-only HMAC-signed cookies | `src/lib/auth/auth.ts`, `src/lib/auth/auth-client.ts`, `src/app/api/auth/[...all]/route.ts`, `src/app/login/page.tsx` |
| **Exp 8** | **Role-Based Access Control (RBAC)** | Three roles (`GUEST`, `CUSTOMER`, `ADMIN`), Edge middleware early check + authoritative server-boundary verification (`requireAdminUser`, `verifyApiAdmin`), and Customer order ownership check (IDOR prevention) | `src/middleware.ts`, `src/lib/permissions/rbac.ts`, `src/app/access-denied/page.tsx`, `src/app/(customer)/orders/[id]/page.tsx` |
| **Exp 9** | **Docker & Production Deployment** | Multi-stage `Dockerfile` (`deps` -> `builder` -> `runner`) with Next.js `standalone` output, non-root `nextjs` user, healthchecks, and `docker-compose.yml` connecting `app`, `mysql`, and `mongodb` via service hostnames | `Dockerfile`, `docker-compose.yml`, `.dockerignore`, `next.config.ts` |
| **Exp 10** | **Environment Variable Security** | `.env.example`, `.gitignore` rules, `import "server-only"` guards on all DB/auth/env modules, zero secret leakage in client bundles, and an Admin Environment Security Audit table | `.env.example`, `src/lib/env.ts`, `src/app/dashboard/page.tsx` |

---

## 5. Project Folder Structure

```text
ShopSphere/
├── prisma/
│   ├── migrations/
│   │   └── 20261028000000_init/
│   │       └── migration.sql       # MySQL 8.0 DDL migration
│   ├── schema.prisma               # Prisma relational schema (Exp 5, 7, 8)
│   └── seed.ts                     # Unified MySQL + MongoDB seeder
├── models/
│   └── Product.ts                  # Mongoose Product catalog model (Exp 6)
├── src/
│   ├── actions/
│   │   ├── auth-actions.ts         # Sign-in, sign-out & dev persona Server Actions
│   │   ├── order-actions.ts        # Checkout & order status Server Actions
│   │   └── product-actions.ts      # Product & category CRUD Server Actions
│   ├── app/
│   │   ├── (public)/               # Public route group (Exp 1 & 3)
│   │   │   ├── products/
│   │   │   │   ├── [id]/page.tsx   # Dynamic product detail page
│   │   │   │   └── page.tsx        # Catalog search & filter page
│   │   │   ├── cart/page.tsx       # Shopping cart page
│   │   │   └── layout.tsx
│   │   ├── (customer)/             # Customer protected route group
│   │   │   ├── checkout/page.tsx   # Transactional checkout page (Exp 5)
│   │   │   ├── orders/
│   │   │   │   ├── [id]/page.tsx   # Order receipt with ownership check (Exp 8)
│   │   │   │   └── page.tsx        # Customer order history
│   │   │   └── layout.tsx
│   │   ├── dashboard/              # Admin protected routes (Exp 3 & 8)
│   │   │   ├── products/
│   │   │   │   ├── new/page.tsx
│   │   │   │   ├── [id]/edit/page.tsx
│   │   │   │   └── page.tsx
│   │   │   ├── orders/page.tsx
│   │   │   ├── layout.tsx          # Nested layout with persistent state widget
│   │   │   └── page.tsx            # Analytics & Env Security Audit
│   │   ├── api/                    # REST Route Handlers (Exp 4, 7, 9)
│   │   │   ├── auth/[...all]/route.ts
│   │   │   ├── products/route.ts
│   │   │   ├── products/[id]/route.ts
│   │   │   ├── categories/route.ts
│   │   │   ├── orders/route.ts
│   │   │   ├── orders/[id]/route.ts
│   │   │   └── health/route.ts
│   │   ├── login/page.tsx          # Better Auth sign-in & OAuth page (Exp 7)
│   │   ├── access-denied/page.tsx  # RBAC 403 page (Exp 8)
│   │   ├── layout.tsx              # Root layout
│   │   ├── page.tsx                # Storefront homepage
│   │   └── globals.css
│   ├── components/
│   │   ├── cart/
│   │   ├── dashboard/
│   │   ├── forms/
│   │   ├── layout/
│   │   ├── products/
│   │   └── ui/
│   ├── lib/
│   │   ├── auth/                   # Better Auth server & client config
│   │   ├── mongodb/                # Cached Mongoose connection & product service
│   │   ├── permissions/            # Server-boundary RBAC & HMAC session guard
│   │   ├── prisma/                 # Prisma singleton & transactional order service
│   │   ├── utils/                  # INR currency & date formatters
│   │   ├── validation/             # Zod schemas & XSS input sanitizer
│   │   ├── env.ts                  # Server-only environment validator & audit
│   │   ├── fallback-store.ts       # Persistent disk fallback (.data/)
│   │   └── seed-data.ts            # Initial Indian e-commerce dataset
│   ├── types/
│   │   └── index.ts
│   └── middleware.ts               # Edge middleware early route protection
├── Dockerfile                      # Multi-stage production Dockerfile (Exp 9)
├── docker-compose.yml              # App + MySQL + MongoDB orchestration
├── .dockerignore
├── .env.example                    # Safe environment variable template (Exp 10)
└── README.md
```

---

## 6. Prerequisites & Local Installation

### Prerequisites
- **Node.js** `v20+` or `v22+` and **npm** `v10+`
- **Docker Desktop** (recommended for starting MySQL 8.0 and MongoDB 7 with one command) OR local installations of MySQL and MongoDB.

### Step 1: Install Dependencies
```bash
npm install
```

### Step 2: Configure Environment Variables
Copy `.env.example` to `.env`:
```powershell
Copy-Item .env.example .env
```

Required variables in `.env`:
- `DATABASE_URL`: MySQL connection string (`mysql://shopsphere_user:shopsphere_password@localhost:3306/shopsphere_db`)
- `MONGODB_URI`: MongoDB connection string (`mongodb://shopsphere_admin:shopsphere_mongo_password@localhost:27017/shopsphere_catalog?authSource=admin`)
- `BETTER_AUTH_SECRET`: Random 32+ character secret key for signing sessions
- `BETTER_AUTH_URL`: `http://localhost:3000`
- `GOOGLE_CLIENT_ID` & `GOOGLE_CLIENT_SECRET`: Google OAuth 2.0 credentials
- `GITHUB_CLIENT_ID` & `GITHUB_CLIENT_SECRET`: GitHub OAuth 2.0 credentials

### Step 3: Start MySQL & MongoDB (or Use Resilient Local Mode)
With Docker Desktop running, start only the database containers for local development:
```bash
docker compose up -d mysql mongodb
```

### Step 4: Generate Prisma Client, Run Migrations & Seed Databases
```bash
npx prisma generate
npx prisma migrate deploy
npm run db:seed
```
> **Note**: `npm run db:seed` seeds MySQL, MongoDB, and also initializes the local persistent fallback file (`.data/shopsphere-store.json`) so the application works out-of-the-box even if Docker is not running during a classroom demonstration.

### Step 5: Start the Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000).

---

## 7. Configuring Google & GitHub OAuth (Experiment 7)

### Google Cloud Console Setup
1. Open [Google Cloud Console](https://console.cloud.google.com/) -> **APIs & Services** -> **Credentials**.
2. Click **Create Credentials** -> **OAuth client ID** -> **Web application**.
3. Add Authorized JavaScript Origin: `http://localhost:3000`
4. Add Authorized Redirect URI:
   ```text
   http://localhost:3000/api/auth/callback/google
   ```
5. Paste the generated Client ID and Client Secret into `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` in `.env`.

### GitHub OAuth App Setup
1. Open GitHub -> **Settings** -> **Developer settings** -> **OAuth Apps** -> **New OAuth App**.
2. Set Homepage URL: `http://localhost:3000`
3. Set Authorization callback URL:
   ```text
   http://localhost:3000/api/auth/callback/github
   ```
4. Paste the Client ID and Client Secret into `GITHUB_CLIENT_ID` and `GITHUB_CLIENT_SECRET` in `.env`.

---

## 8. Demo Accounts & Role Setup (Experiment 7 & 8)

ShopSphere seeds three distinct user personas and provides a **1-Click Viva / Lab Role Switcher** in both the top navigation bar and `/login` (gated by `ENABLE_DEV_AUTH_SWITCHER="true"`):

| Persona | Email | Role | Capabilities |
| :--- | :--- | :--- | :--- |
| **Guest Visitor** | *(Unauthenticated)* | `GUEST` | Browse `/`, `/products`, `/products/[id]`, `/cart`, `/login`. Redirected to `/login` if visiting `/checkout`, `/orders`, or `/dashboard`. |
| **Priya Nair** | `priya.nair@shopsphere.in` | `CUSTOMER` | Manage cart, complete checkout, view own orders (`SPH-2026-1001`). Blocked with HTTP 403 (`Access Denied`) if visiting `/dashboard` or Rohan's order (`/orders/ord_sample_1002`). |
| **Rohan Deshmukh** | `rohan.deshmukh@shopsphere.in` | `CUSTOMER` | Manage cart, complete checkout, view own orders (`SPH-2026-1002`). Blocked from viewing Priya's order (`/orders/ord_sample_1001`). |
| **Aarav Mehta** | `admin@shopsphere.in` | `ADMIN` | Full access to `/dashboard`, Product CRUD, Category creation, Inventory updates, Order status management, and viewing all customer orders. |

---

## 9. Docker & Production Deployment Commands (Experiment 9)

### Build and Start All Containers (App + MySQL + MongoDB)
```bash
docker compose up --build -d
```

### Run Database Migrations & Seed Inside the Running App Container
```bash
docker compose exec app npx prisma migrate deploy
```

### View Container Logs & Health Status
```bash
docker compose ps
docker compose logs -f app
```

### Stop Containers (Preserving Database Volumes)
```bash
docker compose down
```

### Full Reset (Stop Containers & Wipe Database Volumes)
```bash
docker compose down -v
```

---

## 10. REST API Endpoint Documentation & Examples (Experiment 4)

### 1. List & Filter Products (`GET /api/products`)
```bash
curl "http://localhost:3000/api/products?category=audio-headphones&sort=price-asc"
```

### 2. Retrieve Single Product by ID or Slug (`GET /api/products/[id]`)
```bash
curl "http://localhost:3000/api/products/aethersonic-pro-anc-wireless-headphones"
```

### 3. Create a New Product (`POST /api/products` — Requires `ADMIN` Session Cookie)
```bash
curl -X POST "http://localhost:3000/api/products" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "PulseWave USB-C Studio Condenser Microphone",
    "sku": "SPH-AUD-055",
    "shortDescription": "24-bit/192kHz cardioid condenser microphone with zero-latency monitoring.",
    "description": "Designed for podcasting, streaming, and studio vocals with an integrated shock mount and pop filter.",
    "priceInr": 8499,
    "originalPriceInr": 10999,
    "images": ["https://images.unsplash.com/photo-1590602847861-f357a9332bbc?auto=format&fit=crop&w=1000&q=80"],
    "categoryId": "cat_audio",
    "tags": ["microphone", "usb-c", "studio"],
    "specifications": [{"label": "Sample Rate", "value": "24-bit / 192kHz"}],
    "stockQuantity": 20,
    "reorderThreshold": 4
  }'
```

### 4. Update a Product (`PATCH /api/products/[id]` — Requires `ADMIN` Session Cookie)
```bash
curl -X PATCH "http://localhost:3000/api/products/prod_aether_anc_pro" \
  -H "Content-Type: application/json" \
  -d '{"priceInr": 13999, "stockQuantity": 35}'
```

### 5. Delete a Product (`DELETE /api/products/[id]` — Requires `ADMIN` Session Cookie)
```bash
curl -X DELETE "http://localhost:3000/api/products/prod_aether_anc_pro"
```

### 6. Check System Health & Sanitized Environment Audit (`GET /api/health`)
```bash
curl "http://localhost:3000/api/health"
```

---

## 11. Environment Security Audit Checklist (Experiment 10)

To verify during the lab practical that zero server secrets are exposed to the browser:
1. **Source Code Guard**: Every file in `src/lib/env.ts`, `src/lib/prisma/`, `src/lib/mongodb/`, `src/lib/auth/auth.ts`, and `src/lib/permissions/rbac.ts` begins with `import "server-only";`. Attempting to import any of these modules into a `"use client"` file fails the Next.js build immediately.
2. **Browser Bundle Inspection**:
   - Open Chrome DevTools -> **Sources** / **Network** tab on `http://localhost:3000`.
   - Search all loaded JS bundles (`Ctrl+Shift+F`) for `DATABASE_URL`, `MONGODB_URI`, `BETTER_AUTH_SECRET`, `GOOGLE_CLIENT_SECRET`, or `GITHUB_CLIENT_SECRET`. Zero occurrences appear in client bundles.
3. **Git Tracking Verification**:
   - Run `git status` — `.env` and `.env.local` are ignored via `.gitignore`, while `.env.example` is tracked with safe placeholders.

---

## 12. Step-by-Step Practical Viva Demonstration Sequence (5 Minutes)

1. **Experiments 1 & 2 (App Router & Tailwind UI)**:
   - Open `/` and `/products`. Demonstrate category filtering, ₹ INR price range filtering, and dynamic routing to `/products/aethersonic-pro-anc-wireless-headphones`.
2. **Experiments 7 & 8 (Authentication & RBAC)**:
   - As **Guest**, try navigating to `/dashboard` -> observe automatic redirect to `/login?callbackUrl=/dashboard`.
   - Switch role to **Priya Nair (`CUSTOMER`)** using the top navbar switcher. Try visiting `/dashboard` -> observe **HTTP 403 Access Denied (`/access-denied`)**.
   - Open `/orders` as Priya Nair and click the **"Test Unauthorized Order URL"** button (`/orders/ord_sample_1002`, which belongs to Rohan Deshmukh) -> observe server-side IDOR protection blocking access!
3. **Experiment 5 (Transactional Checkout)**:
   - Add an item to `/cart` (note initial stock count, e.g., `28 units`). Complete `/checkout`.
   - View the generated receipt at `/orders/[id]` and return to `/products` to show the stock count decremented to `27 units`.
4. **Experiments 3, 4, 6 & 10 (Admin Dashboard, Layout State, CRUD & Env Audit)**:
   - Switch role to **Aarav Mehta (`ADMIN`)** and open `/dashboard`.
   - Increment the **Exp 3 Audit Counter** in the sidebar to `5` and type a note in the scratchpad, then click between **Overview**, **Products & Inventory**, **Add New Product**, and **Order Management** — observe the counter and note stay intact without remounting!
   - Create a new product with embedded Mongoose specifications on `/dashboard/products/new`, edit its stock, and inspect the **Experiment 10 Environment Security Audit** table on `/dashboard`.
5. **Experiment 9 (Docker Deployment)**:
   - Show `Dockerfile`, `docker-compose.yml` (service hostnames `mysql` and `mongodb`, healthchecks, non-root `nextjs` user), and `/api/health`.

---

## 13. Troubleshooting & Known Limitations

- **MySQL or MongoDB not running locally**: ShopSphere automatically detects offline database ports within 1.5 seconds and switches to the persistent disk store at `.data/shopsphere-store.json` so all CRUD and checkout flows remain demonstrable. Start Docker (`docker compose up -d mysql mongodb`) and run `npm run db:seed` to switch to live hybrid mode.
- **Cross-Database Distributed Transactions**: Because MySQL and MongoDB are separate database engines without a two-phase commit (2PC) coordinator, transactional stock locking and order creation execute atomically inside MySQL (`prisma.$transaction`), followed by a post-commit snapshot update to MongoDB.
