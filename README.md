# Veerha WMS — Warehouse Management System

A full-stack, multi-tenant Warehouse Management System built with a **modular monolithic** architecture.

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | React 18, Vite, TypeScript, TailwindCSS, shadcn/ui, React Query |
| **Backend** | Fastify, TypeScript, Prisma ORM |
| **Database** | PostgreSQL |
| **Auth** | JWT (access + refresh tokens) |
| **Deployment** | Render (backend), Netlify/Cloudflare (frontend) |
| **Monorepo** | npm workspaces |

---

## Project Structure

```
veerha-wms/
├── apps/
│   ├── backend/           # Fastify API server
│   │   ├── prisma/        # Prisma schema & migrations
│   │   └── src/
│   │       ├── core/      # App setup, server, auth middleware
│   │       ├── modules/   # Feature modules (26 total)
│   │       │   ├── adjustments/
│   │       │   ├── alerts/
│   │       │   ├── auth/
│   │       │   ├── bins/
│   │       │   ├── customers/
│   │       │   ├── damaged-items/
│   │       │   ├── dashboard/
│   │       │   ├── grn/
│   │       │   ├── inventory/
│   │       │   ├── invoices/
│   │       │   ├── pick-lists/
│   │       │   ├── purchase-orders/
│   │       │   ├── qc/
│   │       │   ├── racks/
│   │       │   ├── reports/
│   │       │   ├── returns/
│   │       │   ├── sales-orders/
│   │       │   ├── seed/
│   │       │   ├── shipments/
│   │       │   ├── skus/
│   │       │   ├── suppliers/
│   │       │   ├── tasks/
│   │       │   ├── users/
│   │       │   ├── warehouses/
│   │       │   └── zones/
│   │       └── shared/    # Utilities, errors, codegen, stock-level-helper
│   └── frontend/          # React SPA
│       └── src/
│           ├── features/  # Feature-based modules
│           │   ├── dashboard/
│           │   ├── inbound/       # PO, GRN, QC
│           │   ├── inventory/     # SKUs, stock, batches, movements
│           │   ├── operations/    # Tasks, adjustments, damaged, workflows
│           │   ├── outbound/      # SO, pick lists, shipments
│           │   ├── settings/
│           │   ├── suppliers/
│           │   └── warehouse/     # Warehouses, zones, racks, bins
│           └── shared/    # Contexts, hooks, components, types
├── packages/
│   └── shared-types/      # Shared TypeScript types
├── scripts/               # DB & deployment scripts
└── infrastructure/        # Wrangler, CI configs
```

---

## Getting Started

### Prerequisites

- **Node.js** >= 18
- **PostgreSQL** >= 14
- **npm** >= 9

### 1. Clone & Install

```bash
git clone <repo-url> veerha-wms
cd veerha-wms
npm install
```

### 2. Configure Environment

```bash
# Backend
cp apps/backend/.env.example apps/backend/.env
# Edit apps/backend/.env with your DATABASE_URL, JWT_SECRET, etc.
```

### 3. Set Up Database

```bash
cd apps/backend
npx prisma generate
npx prisma db push
# Optional: seed demo data
npx tsx src/modules/seed/seed.service.ts
```

### 4. Run Development Servers

```bash
# From project root — starts both backend and frontend
npm run dev

# Or separately:
npm run dev:backend    # Fastify on http://localhost:3000
npm run dev:frontend   # Vite on http://localhost:5173
```

---

## API Overview

All API routes are prefixed with `/api/v1` and require JWT authentication (except `/auth/login` and `/auth/register`).

| Module | Endpoints |
|--------|-----------|
| Auth | `POST /auth/login`, `POST /auth/register`, `POST /auth/refresh` |
| Warehouses | `GET/POST /warehouses`, `GET/PUT/DELETE /warehouses/:id` |
| Zones | `GET/POST /zones`, `GET/PUT/DELETE /zones/:id` |
| Racks | `GET/POST /racks`, `GET/PUT/DELETE /racks/:id` |
| Bins | `GET/POST /bins`, `GET/PUT/DELETE /bins/:id` |
| SKUs | `GET/POST /skus`, `GET/PUT/DELETE /skus/:id` |
| Inventory | `GET/POST /inventory`, `GET /inventory/movements` |
| Batches | `GET/POST /batches`, `GET/PUT /batches/:id` |
| Suppliers | `GET/POST /suppliers`, `GET/PUT/DELETE /suppliers/:id` |
| Customers | `GET/POST /customers`, `GET/PUT/DELETE /customers/:id` |
| Purchase Orders | `GET/POST /purchase-orders`, `PUT /purchase-orders/:id` |
| GRN | `GET/POST /grn`, `PUT /grn/:id/complete` |
| QC | `GET/POST /qc`, `PUT /qc/:id` |
| Sales Orders | `GET/POST /sales-orders`, `PUT /sales-orders/:id` |
| Pick Lists | `GET/POST /pick-lists`, `PUT /pick-lists/:id` |
| Shipments | `GET/POST /shipments`, `PUT /shipments/:id` |
| Returns | `GET/POST /returns`, `PUT /returns/:id` |
| Damaged Items | `GET/POST /damaged-items`, `PUT /damaged-items/:id` |
| Adjustments | `GET/POST /adjustments`, `PUT /adjustments/:id/approve` |
| Tasks | `GET/POST /tasks`, `PUT /tasks/:id` |
| Alerts | `GET /alerts`, `PUT /alerts/:id/acknowledge` |
| Users | `GET/POST /users`, `GET/PUT /users/:id` |
| Dashboard | `GET /dashboard/stats` |
| Reports | `GET /reports/inventory` |
| Invoices | `GET/POST /invoices`, `GET/PUT /invoices/:id` |

---

## Deployment

### Render (Backend)

The project includes a `render.yaml` for one-click deploy:

1. Connect your GitHub repo to Render
2. Set environment variables: `DATABASE_URL`, `JWT_SECRET`, `JWT_REFRESH_SECRET`, `FRONTEND_URL`
3. Deploy

### Frontend

Build and deploy the frontend to any static hosting (Netlify, Cloudflare Pages, Vercel):

```bash
npm run build
# Output: apps/frontend/dist/
```

Set `VITE_API_URL` to your backend URL.

---

## Architecture

The system follows a **modular monolithic** pattern:

- **Backend**: Each module has its own `service.ts`, `routes.ts`, and `schema.ts` (Zod validation)
- **Frontend**: Feature-based folder structure with dedicated hooks, components, and pages per domain
- **Shared utilities**: Stock-level helper, code generation, error handling
- **Multi-tenant**: All data is scoped by `tenantId` extracted from JWT

---

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start both frontend and backend |
| `npm run dev:frontend` | Start frontend only |
| `npm run dev:backend` | Start backend only |
| `npm run build` | Build frontend for production |
| `npm run build:backend` | Build backend |
| `npm run migrate` | Run Prisma migrations |
| `npm run seed` | Seed database with demo data |
| `npm run lint` | Lint frontend code |

---

## License

Private — Veerha Technologies
