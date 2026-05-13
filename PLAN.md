# Veerha WMS — Admin & Manager Completion Plan

> Scope: **Admin (tenant owner)** and **Manager (warehouse-scoped)** flows only.
> Super Admin is **explicitly out of scope** — leave that app and its endpoints alone.
> Source of truth: [`Super Admin - Admin - Manager complete workflow..pdf`](Super%20Admin%20-%20Admin%20-%20Manager%20complete%20workflow..pdf), Parts 2–5.

---

## 1. Audit Summary

### What already exists (verified by reading the code)

| Area | Status | Where |
|---|---|---|
| Auth + JWT + bcrypt + force-password-change | ✅ Done | [auth.service.ts](apps/backend/src/modules/auth/auth.service.ts), [ForcePasswordChangePage.tsx](apps/frontend/src/features/auth/pages/ForcePasswordChangePage.tsx) |
| Multi-tenant isolation via `tenantId` AsyncLocalStorage | ✅ Done | [tenant.middleware.ts](apps/backend/src/modules/common/tenant.middleware.ts) |
| Manager warehouse scoping helper | ✅ Done | [scope-warehouse.ts](apps/backend/src/modules/common/scope-warehouse.ts) |
| 35 backend modules (warehouses → bins, SKUs, batches, serials, stock_levels, POs, GRN, QC, Putaway, SO, Pick Lists, Waves, Shipments, Returns, Invoices, Adjustments, Cycle Counts, Stock Transfers, Tasks, Alerts, Users, Reports, Dashboard) | ✅ Done | [src/modules/](apps/backend/src/modules/) |
| Picking strategies stored (`single` / `batch` / `wave`) + pick_waves table | ✅ Done | migrations 049, 050 |
| Cycle counts with scope (full_zone / specific_rack / specific_bin / sku_based) | ✅ Done | migration 046 |
| Stock transfers intra/inter | ✅ Done | migration 048, [stock-transfers.service.ts](apps/backend/src/modules/stock-transfers/stock-transfers.service.ts) — manager inter-warehouse forced to `requested` for admin approval |
| Manager Dashboard with 8 KPIs, Worker Activity Panel, Today's Shipments, Due Today column | ✅ Largely done | [ManagerDashboard.tsx](apps/frontend/src/features/dashboard/pages/ManagerDashboard.tsx), [dashboard.service.ts:getManagerStats](apps/backend/src/modules/dashboard/dashboard.service.ts) |
| Admin Dashboard with KPIs + Workflow Pipelines + Zone overview | ✅ Done | [Dashboard.tsx](apps/frontend/src/features/dashboard/pages/Dashboard.tsx) |
| Permissions Matrix UI + role_permissions table (20 modules × 5 actions × 3 roles) | ✅ Mostly done | [PermissionsMatrix.tsx](apps/frontend/src/features/users/components/PermissionsMatrix.tsx), migration 030 |
| Users invite returns temp password | ⚠️ Partial — works but doesn't email | [users.service.ts:invite](apps/backend/src/modules/users/users.service.ts) |
| 8 report types | ✅ Done | [reports.controller.ts](apps/backend/src/modules/reports/reports.controller.ts) |
| Zone wizard (zones → racks → bins) | ⚠️ Partial — exists but not wired into a first-login onboarding wizard | [CreateZoneWizard.tsx](apps/frontend/src/features/warehouse/components/CreateZoneWizard.tsx) |

### Gaps vs PDF spec (this is what the plan addresses)

| # | Gap | Severity | Spec section |
|---|---|---|---|
| G1 | No 5-step **Admin onboarding wizard** at first login | 🔴 High | 2.3 |
| G2 | No **email service** — invite/welcome/reset emails not sent (temp password returned in API response instead) | 🔴 High | 2.1, 3.9, 4.1 |
| G3 | No **Excel/CSV bulk SKU import** | 🔴 High | 2.3 Step 3 |
| G4 | Putaway has no **suggested-bin scoring** (zone +10 / same SKU +5 / empty +3 / mixed -5) | 🔴 High | 3.2 Step 4 |
| G5 | No **auto-create Purchase Invoice** when GRN completes | 🔴 High | 3.6 |
| G6 | No **auto-create Sales Invoice** when shipment dispatched | 🔴 High | 3.6 |
| G7 | No **Service Invoice (3PL)** schema/UI | 🟡 Med | 3.6 |
| G8 | No automatic **CGST+SGST vs IGST split** based on state comparison | 🔴 High | 3.6 GST Rule |
| G9 | No tenant-level **Audit Log** (only super-admin `sa_audit_logs` exists) | 🔴 High | 3.7 + 3.8 |
| G10 | No **adjustment >100 units approval gate** enforced server-side | 🟡 Med | 3.5 Adjustments Tab |
| G11 | No **worker presence** (Active/Idle/On Break) — only `is_active` boolean | 🟡 Med | 5.1 Worker Activity Panel |
| G12 | No **tote assignment** for Batch Picking | 🟡 Med | 3.3 Batch Picking |
| G13 | No **zone-picking consolidation** step between zone pick complete and packing | 🟡 Med | 3.3 Zone Picking |
| G14 | Cycle count **"Under Review" + Approve/Reject/Escalate** actions not fully wired | 🟡 Med | 3.5 Cycle Count |
| G15 | **Recurrence** for cycle counts (Daily/Weekly/Monthly + end date) not implemented | 🟡 Med | 3.5 Cycle Count |
| G16 | Returns Restock disposition doesn't prompt for destination bin | 🟡 Med | 3.4 |
| G17 | **Force Logout** action on user list missing | 🟢 Low | 3.8 |
| G18 | Settings tab in Users (password policy, session timeout, 2FA toggle) not exposed | 🟢 Low | 3.8 Settings Tab |
| G19 | Mobile worker app endpoints (bin scan to confirm putaway, scan to confirm pick) — currently web-only assumptions | 🟡 Med | 3.2, 3.3 |
| G20 | Admin Dashboard **Workflow Pipelines** counts may not include all PDF stages | 🟢 Low | 3.1 |
| G21 | Invoice **PDF download** for the 3 invoice types | 🟡 Med | 3.6 |
| G22 | **Live activity feed** on dashboards (SSE/WebSocket) | 🟢 Low | 3.1, 5.1 |
| G23 | Manager Dashboard **Quick Action buttons** (Create Task / GRN / Pick List / View Workers) need real handlers | 🟢 Low | 5.1 Header |

---

## 2. Delivery Plan

Five phases, ordered by user-visible impact and dependency. Each phase ends in a demoable slice.

### Phase 1 — Admin first-time experience (3–4 days)

**Goal:** Admin lands → forced password change → 5-step onboarding wizard → operational warehouse.

| Task | Backend | Frontend | DB | Acceptance |
|---|---|---|---|---|
| 1.1 Email service abstraction | Add `EmailService` (SMTP via nodemailer; provider-pluggable for SendGrid/SES). Templates: welcome, invite, password-reset, low-stock alert. Wire `SMTP_*` env vars. | — | — | Hitting `POST /users/invite` actually delivers an email; temp password no longer returned in API response |
| 1.2 Welcome email on tenant creation | Hook into super-admin tenant-create (existing endpoint) to send welcome email to Admin with login URL, email, temp password | — | — | New tenant → admin receives email within 10s |
| 1.3 Admin Onboarding Wizard | Add `GET /onboarding/status` returning `{ hasWarehouse, hasLayout, hasSkus, hasSuppliers, hasInvitedUsers }` | New `OnboardingWizardPage.tsx` shown after force-password-change if status is empty. 5 steps, each skippable. Live preview tree for layout. CSV/Excel upload widget for SKUs. | — | First login → wizard appears; can complete or skip each step; landing on dashboard after exit |
| 1.4 Wizard Step 2 — Layout one-shot creation | New `POST /warehouses/:id/layout/bulk` that creates zones + aisles + racks + bins + auto-generates levels/positions inside one DB transaction | `LayoutBuilder.tsx` with live preview tree | — | Single Save creates entire hierarchy atomically; rollback on any failure |
| 1.5 Wizard Step 3 — SKU bulk import | New `POST /skus/import` accepting CSV/XLSX (use `papaparse` server-side via `multer` or parse client-side and POST JSON array). Validate rows, return per-row error report | `SkuImportDialog.tsx` with preview + error table | — | Importing 100-row file → all valid rows created, invalid rows reported with row# + reason |
| 1.6 Wizard Step 5 — Bulk invite | Existing `POST /users/invite` already works; wire to bulk form `POST /users/invite/bulk` | `TeamInviteStep.tsx` — repeating rows of Name/Email/Role/Warehouse | — | Multiple invites trigger multiple emails |

**DB migrations:** none — uses existing tables. Add `tenants.onboarding_completed_at TIMESTAMP NULL` if we want to track skip-state durably.

---

### Phase 2 — Inventory accuracy & auto-flows (3–4 days)

| Task | Backend | Frontend | DB | Acceptance |
|---|---|---|---|---|
| 2.1 Putaway suggested-bin scoring | New `PutawayService.suggestBin(grnItem, warehouseId)` implementing: zone-type match +10, same-SKU bin +5, empty bin +3, mixed-items bin -5. Return top 5 with scores. | `PutawayTaskDialog.tsx` shows suggested bin with score + manual override dropdown | — | Creating putaway from a GRN line → API returns ranked suggestions; UI defaults to top-scored |
| 2.2 Auto-create Purchase Invoice on GRN complete | In `grn.service.ts` after status=`completed`: insert `invoices` row (type=`purchase`) linked to PO + GRN, copy line items, compute totals. Idempotent via unique(grn_id, type=purchase). | Invoices page: surface auto-generated purchase invoices with badge "auto-generated" | Migration 064: `invoices.source_event TEXT`, partial unique index `(grn_id) where type='purchase'` | Completing GRN → purchase invoice visible in /invoices within 1s; calling complete twice doesn't duplicate |
| 2.3 Auto-create Sales Invoice on shipment dispatch | In `shipments.service.ts` when status→`in_transit` (dispatched): insert `invoices` row (type=`sales`) linked to SO + shipment. | Sales Invoice tab in /invoices | Migration 064: partial unique index `(shipment_id) where type='sales'` | Marking shipment "Dispatched" → sales invoice generated |
| 2.4 GST split (CGST+SGST vs IGST) | Add `calculateGst(warehouseStateCode, partyStateCode, taxableAmount, gstRate)` util. Use in both invoice creators. | Show CGST/SGST or IGST breakdown rows on invoice detail | — | Same-state party → CGST+SGST shown; cross-state → IGST shown |
| 2.5 Service Invoice (3PL) | New endpoints `POST/GET /invoices/service`. Schema: client_id, billing_period_start/end, storage_charges, handling_charges, vas_charges. Only visible when `tenants.company_type='3PL'`. | New ServiceInvoiceDialog + tab gated on tenant.company_type | Migration 065: `service_invoices` table + `tenants.company_type TEXT` (3PL/Distributor/Retailer/Manufacturer/etc) | 3PL tenant sees Service Invoice option; others don't |
| 2.6 Invoice PDF download | Use existing `jspdf` + `jspdf-autotable` (already installed). Build one shared template covering all 3 invoice types | "Download PDF" button on every invoice row | — | PDF contains correct line items, GST breakdown, totals, GSTIN |

---

### Phase 3 — Approvals, audit, and admin enforcement (2–3 days)

| Task | Backend | Frontend | DB | Acceptance |
|---|---|---|---|---|
| 3.1 Adjustment >100 units approval gate | In `adjustments.service.ts`: if abs(qty_diff) > 100 → force `status='pending_approval'`; manager cannot self-approve. New `POST /adjustments/:id/approve` admin-only | Adjustment dialog shows warning above 100; pending list for admin | — | Manager submits 150-unit adjustment → status pending_approval; admin can approve; admin's own 150-unit adjustment also requires approval (per PDF rule) |
| 3.2 Inter-warehouse transfer approval (already exists — verify + UX) | Confirm `stock-transfers.service.ts` blocks manager execution of inter-warehouse | Admin: pending-approval inbox on Transfers page | — | Manager initiating inter-warehouse → status=`requested`; admin sees in approval queue |
| 3.3 Tenant Audit Log | New `audit_logs` table: `id, tenant_id, user_id, module, action, entity_type, entity_id, before JSONB, after JSONB, ip, user_agent, created_at`. Add NestJS interceptor `AuditInterceptor` that auto-logs mutations. | New `AuditTrailPage.tsx` under /reports/audit-trail (already routed) — filterable by user/module/date | Migration 066: `audit_logs` table | Editing a SKU → audit row with before/after; report shows it |
| 3.4 Force Logout user action | `POST /users/:id/force-logout` — invalidate refresh tokens for that user (add `users.token_version INT` and bump it; JWT strategy checks `token_version`) | Action menu on user list | Migration 067: `users.token_version INT DEFAULT 0` | Admin force-logs-out user → user's next API call returns 401 |
| 3.5 Settings tab (password policy, session timeout, 2FA) | New `tenant_settings` table — password_min_length, require_upper/lower/digit/special, session_timeout_min, require_2fa_for_admins | Settings page → Security tab | Migration 068: `tenant_settings` table | Admin sets min length 12 → next password change enforces it |

---

### Phase 4 — Picking enrichment & manager polish (2–3 days)

| Task | Backend | Frontend | DB | Acceptance |
|---|---|---|---|---|
| 4.1 Tote assignment (Batch Picking) | `pick_lists.batch_size` exists. Add `pick_list_items.tote_code TEXT` populated when batch picks generated — one tote per SO. | Pick list detail shows tote per order (SO-001 = Tote A, …) | Migration 069: `pick_list_items.tote_code TEXT` | Generating batch pick for 3 orders → 3 totes assigned automatically |
| 4.2 Zone Picking consolidation step | When all zone sub-pick-lists complete, create a single `pack_consolidation_tasks` row that holds all sub-picks until acknowledged at the consolidation point. | New "Consolidation" sub-tab under Outbound | Migration 070: `pack_consolidation_tasks` | Zone pick: 3 zones complete → consolidation task surfaces; ack → packing unlocked |
| 4.3 Wave Planning UI | Backend `pick_waves` already exists. Wire `WavePlanningTab.tsx` under Pick Lists with status board (items assigned/picked/remaining per worker, ETA bar). Socket.IO events for live updates. | New `WavePlanningTab.tsx` + `WaveStatusBoard.tsx` | — | Releasing wave → workers receive their slice; manager sees live progress |
| 4.4 Worker presence (Active/Idle/On Break) | Add `users.presence_status TEXT` ('active','idle','break','offline') + `users.last_heartbeat_at TIMESTAMP`. Socket.IO heartbeat from worker app every 30s. Auto-mark idle after 5 min no heartbeat. | Worker Activity Panel reads presence; "Assign Task" button on idle cards | Migration 071: presence columns + index | Worker idle 6 min → card flips to yellow; admin/manager sees real-time |
| 4.5 Manager Dashboard Quick Actions | Wire 4 buttons (Create Task / Create GRN / Create Pick List / View My Workers) to open their respective dialogs/pages pre-filtered | — | — | Click → correct dialog opens with manager's warehouse pre-selected |

---

### Phase 5 — Cycle counts, returns, mobile, polish (2–3 days)

| Task | Backend | Frontend | DB | Acceptance |
|---|---|---|---|---|
| 5.1 Cycle Count variance review actions | `POST /cycle-counts/:id/approve|reject|escalate`. Approve → auto-creates stock adjustment to reconcile. Escalate → notifies admin. | Variance Review screen with the 3 buttons | — | Worker submits with variance → manager sees review screen; approve → stock_levels updated |
| 5.2 Cycle Count recurrence | Add `cycle_counts.recurrence_type` (one_time/daily/weekly/monthly), `recurrence_until DATE`. Background job (NestJS scheduler) clones next instance on completion. | Recurrence picker on create form | Migration 072: recurrence columns | Create weekly recurring count → next week's count auto-appears |
| 5.3 Returns Restock destination bin | When disposition=`restock`, show bin picker (zone match + capacity check). Update stock_levels for chosen bin. | Restock dialog with bin dropdown | — | Restock → stock arrives at chosen bin; movement logged |
| 5.4 Mobile-friendly worker endpoints | Add `POST /putaway/:id/scan-bin {barcode}` and `POST /pick-lists/:id/scan-item {barcode}` that validate barcode→bin/sku and update status. | Worker mobile pages (touch-optimized) at `/m/putaway`, `/m/pick`, `/m/cycle-count` | — | Worker scans wrong bin → friendly error; correct bin → status advances |
| 5.5 Live activity feed via Socket.IO | Backend already has Socket.IO. Emit `audit.created` on every audit-log insert. | `ActivityFeed.tsx` on dashboards subscribes and prepends | — | Two browsers open: action in browser A appears in feed in browser B within 1s |
| 5.6 Admin Dashboard Workflow Pipelines | Verify stage counts include: PO Approved-awaiting, GRN Pending, QC Pending, Putaway Pending, SO Confirmed, Pick Active, Packing, Ready to Ship, In Transit | Card per stage with click-through filter | — | Each card click → drills into the matching list page pre-filtered |

---

## 3. Cross-cutting concerns

### 3.1 Permissions enforcement (must run through every endpoint added)
- Manager endpoints **always** apply `scopeWarehouseForUser(req.user, ...)` from [scope-warehouse.ts](apps/backend/src/modules/common/scope-warehouse.ts).
- Use `assertManagerWarehouseAccess()` on writes that name a `warehouse_id`.
- Frontend: respect `role_permissions` matrix when rendering action buttons.

### 3.2 What Manager CANNOT do (enforce in routes, not just UI)
- Create warehouses (`POST /warehouses` → 403 if role=manager)
- View other warehouses' data (already enforced via scoping)
- Create/manage manager or admin accounts (`POST /users` if role∈{admin,manager} requested by manager → 403)
- Change subscription/billing (n/a — super-admin module)
- Approve inter-warehouse transfers (`POST /stock-transfers/:id/approve` admin-only)
- View platform-level reports (only super-admin module)
- Delete SKUs (`DELETE /skus/:id` → 403 for manager)
- Approve own >100 adjustments (Phase 3.1)

### 3.3 Email templates needed
1. Tenant welcome (Super-admin → Admin onboarding) — *triggered by super-admin app, not in scope here, but provide template*
2. User invite (Admin → Manager/Worker, includes temp password + warehouse name)
3. Password reset
4. Low-stock alert digest (daily)
5. Inter-warehouse transfer pending approval (to admin)
6. Adjustment >100 pending approval (to admin)
7. Cycle count escalated (to admin)

### 3.4 Environment variables to add
```
SMTP_HOST=
SMTP_PORT=587
SMTP_USER=
SMTP_PASS=
SMTP_FROM=
EMAIL_PROVIDER=smtp   # smtp | sendgrid | ses
SENDGRID_API_KEY=     # if sendgrid
APP_URL=              # for links in emails — defaults to FRONTEND_URL
```

### 3.5 DB migration numbering
Next free slot is **064**. Plan uses 064–072. Keep adding sequentially.

---

## 4. Test plan (minimum)

For each phase:
- Backend: Jest specs for new services (happy path + permission denial + tenant isolation).
- Frontend: Vitest for new dialogs/wizards; smoke check via `npm run dev` and clicking through.
- Manual E2E: create fresh tenant → run admin onboarding wizard → invite manager → manager logs in → manager creates GRN → all flows complete to invoice generation.

---

## 5. Out of scope (do NOT touch)

- `apps/super-admin/` — entire app
- `apps/backend/src/modules/super-admin/` — module + routes (`/api/v1/sa/*`)
- Super Admin login, 2FA, impersonation, plans/billing/feature-flags/system-config
- Migrations 032–036, 052–053 (super-admin schema additions) — unless we extend `tenants` with onboarding flag (1.3) or `company_type` (2.5)

---

## 6. Estimated timeline

| Phase | Days | Cumulative |
|---|---|---|
| 1 — Admin onboarding | 3–4 | ~4 |
| 2 — Inventory & invoices | 3–4 | ~8 |
| 3 — Approvals & audit | 2–3 | ~11 |
| 4 — Picking & manager polish | 2–3 | ~14 |
| 5 — Cycle counts, returns, mobile | 2–3 | ~17 |

~3 weeks single dev, less in parallel. Phase 1 is the unblock — without onboarding + email, the rest can't be demoed end-to-end on a fresh tenant.
