# Veerha WMS — Product Plan

## 1. Overview

Veerha WMS is a multi-tenant SaaS warehouse management platform.

**Core capabilities:**

- Warehouse operations and layout management
- Inventory management with batch and expiry tracking
- Inbound logistics (purchase orders, GRN, QC)
- Outbound logistics (sales orders, picking, packing, shipments)
- Operational workflows and task management
- Analytics and reporting

**Primary interfaces:**

- Admin web dashboard
- Warehouse worker mobile app (future)
- API integrations (ERP, ecommerce, TMS)

---

## 2. System Architecture

```
                Cloudflare CDN
                      │
             React Admin Dashboard
               (Vite + TypeScript)
                      │
                      │  REST API
                      │
                  API Gateway
                   (NestJS)
                      │
      ┌───────────────┼───────────────┐
      │               │               │
  PostgreSQL        Redis          Storage
   (Neon DB)       Cache       (Cloudflare R2)
      │
   BullMQ Queue
```

---

## 3. Technology Stack

### Frontend

| Technology     | Purpose            |
|----------------|--------------------|
| React 18       | UI framework       |
| TypeScript     | Type safety        |
| Vite           | Build tooling      |
| TailwindCSS    | Styling            |
| shadcn/ui      | Component library  |
| TanStack Query | Data fetching      |
| React Router   | Routing            |
| Recharts       | Charts             |
| Lucide         | Icons              |

### Backend

| Technology  | Purpose              |
|-------------|----------------------|
| NestJS      | API framework        |
| TypeScript  | Type safety          |
| PostgreSQL  | Primary database     |
| Redis       | Caching and sessions |
| BullMQ      | Background jobs      |

### Infrastructure

| Service          | Purpose         |
|------------------|-----------------|
| Neon             | PostgreSQL host |
| Upstash          | Redis host      |
| Cloudflare R2    | Object storage  |
| Cloudflare Pages | Frontend deploy |
| Railway / Fly.io | Backend deploy  |

---

## 4. Module Inventory

| Module       | Domain                                      |
|--------------|---------------------------------------------|
| Dashboard    | KPIs, metrics, pipelines, alerts             |
| Warehouse    | Warehouses, zones, racks, bins               |
| Inventory    | SKUs, stock levels, batches, movements       |
| Inbound      | Purchase orders, GRN, QC inspections         |
| Outbound     | Sales orders, pick lists, packing, shipments |
| Operations   | Tasks, workflows, adjustments, damaged items |
| Reports      | Stock, movement, audit, utilization reports  |
| Users        | User management, roles, permissions          |

---

## 5. Phased Delivery

### Phase 1 — Foundation (current)

- Frontend with mock data
- Monorepo structure
- Shared type system

### Phase 2 — Backend Core

- NestJS modular monolith
- PostgreSQL schema and migrations
- Auth module (JWT + refresh tokens)
- Warehouse and inventory modules

### Phase 3 — Full Integration

- Replace mock API with real backend
- Inbound and outbound modules
- Operations and task management

### Phase 4 — Production Readiness

- Redis caching layer
- BullMQ background jobs
- File storage (R2)
- Monitoring and logging
- CI/CD pipeline

### Phase 5 — Scale

- Read replicas
- Table partitioning
- Worker mobile app
- External integrations (ERP, ecommerce)

---

## 6. Security Architecture

- JWT authentication with refresh tokens
- Role-based access control (admin, manager, worker)
- Tenant isolation at database level
- Rate limiting
- Input validation with Zod
- Helmet and CORS middleware

---

## 7. Monitoring and Logging

| Tool       | Purpose        |
|------------|----------------|
| Winston    | Logging        |
| Prometheus | Metrics        |
| Grafana    | Dashboards     |
| Sentry     | Error tracking |
