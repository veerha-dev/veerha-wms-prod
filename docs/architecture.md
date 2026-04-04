# Veerha WMS — Architecture

## 1. Monorepo Structure

```
veerha-wms/
├── apps/
│   ├── frontend/          # React SPA
│   └── backend/           # NestJS API (planned)
├── packages/
│   └── shared-types/      # Shared TypeScript types
├── docs/                  # Canonical documentation
├── .windsurf/             # AI context, skills, workflows
└── .windsurfrules         # AI constraints
```

Package manager: **npm workspaces**

---

## 2. Frontend Architecture

### Stack

React 18 · TypeScript · Vite · TailwindCSS · shadcn/ui · TanStack Query · React Router · Recharts · Lucide

### Folder Structure

```
apps/frontend/src/
├── app/                   # App entry, router, providers
├── features/              # Feature-based modules
│   ├── dashboard/
│   ├── warehouse/
│   ├── inventory/
│   ├── inbound/
│   ├── outbound/
│   ├── operations/
│   ├── reports/
│   └── users/
├── shared/
│   ├── components/        # Layout, UI primitives
│   ├── contexts/          # AuthContext, WMSContext, InventoryContext
│   ├── hooks/             # Shared hooks
│   ├── lib/               # API client, utilities
│   └── types/             # Legacy frontend types
├── mocks/
│   ├── data/              # Mock data per domain
│   └── services/          # Mock API + storage service
└── test/
```

### Data Flow

```
Page Component
     ↓
React Query Hook (useQuery / useMutation)
     ↓
API Client (shared/lib/api.ts)
     ↓
Mock API Service (current) → Backend API (future)
     ↓
Returns: { success, data, meta }
```

### State Management

- **Server state**: TanStack Query (caching, invalidation, optimistic updates)
- **Global state**: React Context (AuthContext, WMSContext, InventoryContext)
- **Local state**: React useState/useReducer within components

---

## 3. Backend Architecture (Planned)

### Stack

NestJS · TypeScript · PostgreSQL · Redis · BullMQ

### Architecture Style

Modular monolith — each domain is a self-contained NestJS module with clear boundaries. Can be extracted to microservices later if needed.

### Folder Structure

```
apps/backend/src/
├── config/                # Environment, database, redis config
├── common/                # Guards, decorators, filters, pipes
├── modules/
│   ├── auth/
│   ├── tenants/
│   ├── users/
│   ├── warehouses/
│   ├── zones/
│   ├── racks/
│   ├── bins/
│   ├── inventory/
│   ├── stock-movements/
│   ├── inbound/
│   ├── outbound/
│   ├── operations/
│   └── reports/
├── database/              # Migrations, seeds
└── queues/                # BullMQ job processors
```

### Module Structure

Every backend module follows:

```
modules/<name>/
├── <name>.module.ts
├── <name>.controller.ts
├── <name>.service.ts
├── <name>.repository.ts
├── dto/
│   ├── create-<name>.dto.ts
│   └── update-<name>.dto.ts
└── entities/
    └── <name>.entity.ts
```

---

## 4. Database Architecture

- **Engine**: PostgreSQL hosted on Neon
- **ORM**: TypeORM or Prisma (TBD)
- **Schema changes**: Migration-based (no auto-sync in production)
- **Multi-tenancy**: Row-level isolation via `tenant_id` foreign key

See `docs/db-schema.md` for full schema reference.

---

## 5. Caching Layer

- **Engine**: Redis hosted on Upstash
- **Use cases**: Dashboard metrics, SKU lookups, session cache, rate limiting
- **TTL strategy**: Short for real-time data (30s), longer for reference data (5m)

---

## 6. Background Jobs

- **Engine**: BullMQ (Redis-backed)
- **Use cases**: Report generation, inventory reconciliation, notifications, large exports
- **Retry policy**: Exponential backoff with dead-letter queue

---

## 7. File Storage

- **Engine**: Cloudflare R2
- **Use cases**: Product images, documents, labels, attachments
- **Access**: Pre-signed URLs via backend API

---

## 8. API Design

- **Style**: REST
- **Base path**: `/api/v1`
- **Auth**: JWT Bearer token + refresh token rotation
- **Response envelope**: `{ success: boolean, data: T, meta?: object }`

See `docs/api-contracts.md` for full endpoint reference.

---

## 9. Deployment

| Component | Platform         |
|-----------|------------------|
| Frontend  | Cloudflare Pages |
| Backend   | Railway / Fly.io |
| Database  | Neon PostgreSQL  |
| Cache     | Upstash Redis    |
| Storage   | Cloudflare R2    |
| CI/CD     | GitHub Actions   |

---

## 10. Scaling Strategy

| Stage | Description                                    |
|-------|------------------------------------------------|
| 1     | Single backend, single database                |
| 2     | Multiple backend instances, Redis caching      |
| 3     | Read replicas, table partitioning              |
| 4     | Microservices extraction for heavy workloads   |
