# Veerha WMS — Development Log

## Current Status

**Phase**: Phase 2 — Backend Core (In Progress)

**Frontend**: Complete — all modules built with mock data  
**Backend**: Warehouses + Zones + Racks + Bins + SKUs + Batches + Inventory modules implemented  
**Database**: Neon PostgreSQL — 9 migrations executed (tenants, warehouses, zones, racks, bins, skus, batches, stock_levels, stock_movements)  
**Shared Types**: Package created — warehouse + inventory types updated

---

## Completed Work

### Frontend Application

- Dashboard with KPIs, inbound/outbound pipelines, charts
- Warehouse management with zones, racks, bins visualization
- Inventory module: SKU Master, Stock Levels, Batch & Expiry tracking
- Inbound: Purchase Orders, GRN, QC Inspections
- Outbound: Sales Orders, Pick Lists, Packing, Shipments
- Operations: Tasks, Workflows, Adjustments, Damaged Items
- Reports module with multiple report types
- User management with roles and permissions
- Mock API service with localStorage persistence
- React Query hooks for all data fetching

### Documentation and AI Setup

- Canonical documentation in `docs/`
- Windsurf context, skills, and workflows in `.windsurf/`
- Shared types package in `packages/shared-types/`
- `.windsurfrules` for AI consistency

---

## Pending Work

### Phase 2 — Backend Core

- [x] Initialize NestJS project in `apps/backend/`
- [x] Set up PostgreSQL connection module (pg driver, no ORM)
- [x] Create warehouse module (controller, service, repository)
- [x] Create SQL migrations (tenants, warehouses, zones, racks, bins)
- [x] Run migrations against Neon database
- [x] Implement zones module (controller, service, repository)
- [x] Implement racks module (controller, service, repository)
- [x] Implement bins module (controller, service, repository)
- [x] Implement SKUs module (controller, service, repository — auto-code SKU-001)
- [x] Implement batches module (controller, service, repository)
- [x] Implement inventory module (stock levels, transactional transfer, adjustment, movements)
- [x] Fix all frontend inventory API paths (/api/v1/ prefix)
- [ ] Implement auth module (JWT + refresh tokens)
- [ ] Set up Redis connection (Upstash)

### Phase 3 — Full Integration

- [ ] Replace mock API with real backend endpoints
- [ ] Implement inbound module
- [ ] Implement outbound module
- [ ] Implement operations module

### Phase 4 — Production

- [ ] BullMQ background jobs
- [ ] File storage (Cloudflare R2)
- [ ] CI/CD pipeline
- [ ] Monitoring and logging

---

## Decisions Log

| Date       | Decision                                      | Rationale                         |
|------------|-----------------------------------------------|-----------------------------------|
| 2024-01-01 | Use mock API for frontend development          | Faster iteration without backend  |
| 2024-03-13 | Canonical docs moved to `docs/`                | Single source of truth            |
| 2024-03-13 | Shared types in `packages/shared-types/`       | Type safety across frontend/backend |
| 2024-03-13 | Database schema expanded to 35 tables          | Full domain coverage              |
| 2026-03-13 | No ORM — use pg driver with raw SQL            | Better control for complex WMS queries |
| 2026-03-13 | SQL migration files instead of ORM migrations  | Explicit schema control           |
| 2026-03-13 | Skip auth initially, add after core modules    | Focus on domain logic first       |
| 2026-03-13 | Warehouse module as first backend module       | Foundation for zones/racks/bins   |

---

## Warehouse Module (2026-03-13)

**Tables created:**
- `tenants` — minimal tenant table with default tenant
- `warehouses` — enhanced with 17 columns (address, contact, capacity fields)

**API Endpoints:**
- `GET /api/v1/warehouses` — List with pagination, search, filters
- `GET /api/v1/warehouses/:id` — Get single warehouse
- `POST /api/v1/warehouses` — Create (auto-generates code if empty)
- `PUT /api/v1/warehouses/:id` — Update
- `DELETE /api/v1/warehouses/:id` — Delete

**Files:**
- `apps/backend/src/modules/warehouses/` — Full module
- `apps/backend/src/database/migrations/001_create_tenants.sql`
- `apps/backend/src/database/migrations/002_create_warehouses.sql`

**Frontend:**
- `apps/frontend/src/shared/lib/api.ts` — Updated to support `VITE_API_MODE=real`

---

## Zones Module (2026-03-14)

**Tables created:**
- `zones` — 17 columns with warehouse FK, capacity tracking, rack/bin counts

**API Endpoints:**
- `GET /api/v1/zones` — List with pagination, search, filters (by warehouse, type, status)
- `GET /api/v1/zones/:id` — Get single zone
- `POST /api/v1/zones` — Create (auto-generates code ZN-001, ZN-002, etc.)
- `PUT /api/v1/zones/:id` — Update
- `DELETE /api/v1/zones/:id` — Delete (cascades to racks/bins)

**Zone Types Supported:**
- receiving, storage, picking, packing, shipping, returns, staging, cold-storage, hazardous, bulk, fast-moving

**Features:**
- Auto-code generation (ZN-001, ZN-002, etc.)
- Warehouse relationship with CASCADE delete
- Utilization calculation from weight or volume capacity
- Multi-tenant support
- Filter zones by warehouse ID
- Rack/bin count tracking (updated by service/triggers)

**Files:**
- `apps/backend/src/modules/zones/` — Full module (controller, service, repository, DTOs)
- `apps/backend/src/database/migrations/003_create_zones.sql`

**Frontend:**
- `apps/frontend/src/features/warehouse/hooks/useZones.ts` — Updated with `/api/v1/` prefix

**Testing:**
- Created 2 test zones (ZN-001: Receiving Area, ZN-002: Storage Zone A)
- Verified auto-code generation
- Verified warehouse filtering
- Verified CRUD operations via API

**Next:** Racks module (depends on zones)

---

## Racks Module (2026-03-14)

**Tables created:**
- `racks` — 17 columns with zone FK, position tracking, capacity management

**API Endpoints:**
- `GET /api/v1/racks` — List with pagination, search, filters (by zone, status)
- `GET /api/v1/racks/:id` — Get single rack
- `POST /api/v1/racks` — Create (auto-generates code RK-001, RK-002, etc.)
- `PUT /api/v1/racks/:id` — Update
- `DELETE /api/v1/racks/:id` — Delete (cascades to bins)

**Features:**
- Auto-code generation (RK-001, RK-002, etc.)
- Zone relationship with CASCADE delete
- Position tracking (row_position, column_position)
- Levels: 1-20 vertical shelves
- Slots per level: 1-50 bin positions
- Capacity tracking (weight & volume)
- Utilization calculation from weight or volume capacity
- Multi-tenant support
- Filter racks by zone ID
- Bin count tracking (updated by service/triggers)

**Files:**
- `apps/backend/src/modules/racks/` — Full module (controller, service, repository, DTOs)
- `apps/backend/src/database/migrations/004_create_racks.sql`

**Frontend:**
- `apps/frontend/src/features/warehouse/hooks/useRacks.ts` — Updated with `/api/v1/` prefix

**Testing:**
- Created 2 test racks (RK-001: Rack A01 in Zone ZN-001, RK-002: Rack B01 in Zone ZN-002)
- Verified auto-code generation
- Verified zone filtering
- Verified CRUD operations via API

**Next:** Bins module (depends on racks)

---

## Bins Module (2026-03-14)

**Tables created:**
- `bins` — 20 columns with rack/zone/warehouse FKs, position tracking, capacity management

**API Endpoints:**
- `GET /api/v1/bins` — List with pagination, search, filters (by rack, zone, warehouse, status, locked)
- `GET /api/v1/bins/:id` — Get single bin
- `POST /api/v1/bins` — Create (auto-generates code BIN-001, BIN-002, etc.)
- `PUT /api/v1/bins/:id` — Update
- `POST /api/v1/bins/:id/lock` — Lock bin with reason
- `POST /api/v1/bins/:id/unlock` — Unlock bin
- `DELETE /api/v1/bins/:id` — Delete (updates rack/zone bin counts)

**Bin Statuses:**
- empty, partial, full, reserved, damaged

**Features:**
- Auto-code generation (BIN-001, BIN-002, etc.)
- Rack/Zone/Warehouse relationships with CASCADE delete
- Position tracking (level and position within rack)
- Capacity tracking (weight & volume)
- Utilization calculation from weight or volume capacity
- Lock/unlock functionality with reason tracking
- Multi-tenant support
- Filter bins by rack, zone, warehouse, status, or locked state
- Automatic update of rack bin_count when bins created/deleted
- Automatic update of zone bin_count when bins created/deleted

**Files:**
- `apps/backend/src/modules/bins/` — Full module (controller, service, repository, DTOs)
- `apps/backend/src/database/migrations/005_create_bins.sql`

**Frontend:**
- `apps/frontend/src/features/warehouse/hooks/useBins.ts` — Updated with `/api/v1/` prefix

**Testing:**
- Created 3 test bins:
  - BIN-001: Rack A01, Level 1, Position 1
  - BIN-002: Rack A01, Level 1, Position 2
  - BIN-003: Rack B01, Level 1, Position 1
- Verified auto-code generation
- Verified rack filtering
- Verified zone bin count updates
- Verified rack bin count updates
- Verified CRUD operations via API
- Verified complete integration: Warehouses → Zones → Racks → Bins

**Integration Verified:**
- Receiving Area zone: 1 rack, 2 bins
- Storage Zone A: 1 rack, 1 bin
- Rack A01: 2 bins
- Rack B01: 1 bin

**Next:** Inventory/SKU Master module (depends on bins)

---

## Inventory Module (2026-03-14)

### SKUs Module

**Tables created:**
- `skus` — 31 columns: product catalog with HSN/GST, dimensions, tracking flags, pricing

**API Endpoints:**
- `GET /api/v1/skus` — List with pagination, search, filter by category/status
- `GET /api/v1/skus/:id` — Get single SKU
- `POST /api/v1/skus` — Create (auto-generates code SKU-001, SKU-002, etc.)
- `PUT /api/v1/skus/:id` — Update
- `DELETE /api/v1/skus/:id` — Delete

**Features:**
- Auto-code generation (SKU-001, SKU-002, etc.)
- Batch/expiry/serial tracking flags
- HSN code and GST rate for India compliance
- Storage type, hazardous, fragile flags
- Tags array for flexible categorization
- Cost price / selling price tracking
- Min/max stock and reorder point/qty

**Files:**
- `apps/backend/src/modules/skus/` — Full module (controller, service, repository, DTOs)
- `apps/backend/src/database/migrations/006_create_skus.sql`
- `apps/frontend/src/features/inventory/hooks/useSKUs.ts` — Updated with `/api/v1/` prefix

### Batches Module

**Tables created:**
- `batches` — 11 columns: batch tracking with FIFO rank, expiry dates, SKU relationship

**API Endpoints:**
- `GET /api/v1/batches` — List with pagination, search, filter by SKU/status
- `GET /api/v1/batches/:id` — Get single batch
- `POST /api/v1/batches` — Create
- `PUT /api/v1/batches/:id` — Update
- `DELETE /api/v1/batches/:id` — Delete

**Features:**
- Linked to SKUs via foreign key
- Manufacture/expiry date tracking
- FIFO rank for warehouse picking order
- Status: active, blocked, quarantine, expired, consumed, depleted
- Unique constraint: (tenant_id, sku_id, batch_number)

**Files:**
- `apps/backend/src/modules/batches/` — Full module (controller, service, repository, DTOs)
- `apps/backend/src/database/migrations/007_create_batches.sql`
- `apps/frontend/src/features/inventory/hooks/useBatches.ts` — Updated with `/api/v1/` prefix

### Inventory Engine (Stock Levels + Movements)

**Tables created:**
- `stock_levels` — Per-bin inventory tracking (available/reserved/in-transit/damaged)
- `stock_movements` — Full audit trail for all inventory changes

**API Endpoints:**
- `GET /api/v1/inventory` — List stock levels (filter by SKU, warehouse, bin, batch)
- `GET /api/v1/inventory/:id` — Get single stock level
- `GET /api/v1/inventory/low-stock` — Items below reorder point
- `GET /api/v1/inventory/expiring` — Batches expiring within 30 days
- `GET /api/v1/inventory/movements` — Movement history (filter by SKU, type, warehouse)
- `POST /api/v1/inventory` — Create/seed stock level
- `PUT /api/v1/inventory/:id` — Update stock level
- `DELETE /api/v1/inventory/:id` — Delete stock level
- `POST /api/v1/inventory/transfer` — **Transactional** bin-to-bin transfer
- `POST /api/v1/inventory/adjustment` — **Transactional** stock adjustment (damage/correction/scrap)
- `POST /api/v1/inventory/movements` — Record movement directly

**Transactional Operations:**
- Transfer: validates source qty, checks dest bin not locked, decrements source, upserts destination, records movement — all in single DB transaction with `FOR UPDATE` row locking
- Adjustment: validates available qty for negative adjustments, moves to damaged bucket for damage reason, records movement — all transactional

**Features:**
- Computed totalQuantity (available + reserved + in-transit + damaged)
- Auto-generated movement numbers (MOV-00001, MOV-00002, etc.)
- Rich JOIN responses: skuCode, skuName, warehouseName, binCode, zoneName, batchNumber
- Low stock detection based on SKU reorder_point
- Expiring batch detection (30-day window)
- Edge case validation: insufficient stock, same-bin transfer, locked bin

**Files:**
- `apps/backend/src/modules/inventory/` — Full module (controller, service, repository, DTOs)
- `apps/backend/src/database/migrations/008_create_stock_levels.sql`
- `apps/backend/src/database/migrations/009_create_stock_movements.sql`

**Frontend hooks updated (all with `/api/v1/` prefix):**
- `useStockLevels.ts`, `useMovements.ts`, `useBatches.ts`, `useSKUs.ts`
- `useProcessStockMovement.ts`, `useBinInventory.ts`
- `useAuditTrail.ts`, `useMappingAuditLogs.ts`
- `DataSeedingPage.tsx`

**Testing:**
- Created SKU-001 (iPhone 15 Pro), SKU-002 (Samsung Galaxy S24)
- Created batch BATCH-2026-001 linked to SKU-001
- Seeded stock: BIN-001=100 avail/20 reserved, BIN-002=50 avail
- Transfer: 25 units BIN-001→BIN-003 (MOV-00001) — verified quantities
- Adjustment: 5 units damaged in BIN-001 (MOV-00002) — verified damage bucket
- Final state: BIN-001=70/20/5, BIN-002=50, BIN-003=25
- Edge case: Transfer 9999 units → 400 "Insufficient stock" ✅
- Movement history: 2 records with correct types and quantities ✅

**Next:** Auth module or Inbound module