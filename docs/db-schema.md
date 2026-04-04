# Veerha WMS — Database Schema

## 1. Conventions

All tables follow these conventions unless noted otherwise.

| Convention       | Detail                                        |
|------------------|-----------------------------------------------|
| Primary key      | `id UUID PRIMARY KEY DEFAULT uuid_generate_v4()` |
| Timestamps       | `created_at TIMESTAMP DEFAULT NOW()` and `updated_at TIMESTAMP DEFAULT NOW()` |
| Multi-tenancy    | `tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE` on all tenant-scoped tables |
| Naming           | `snake_case` for all column and table names   |
| Soft deletes     | Not used by default; use `status` column instead |
| UUID extension   | `CREATE EXTENSION IF NOT EXISTS "uuid-ossp";` |

---

## 2. Domain: Tenant and Access Control

### tenants

Represents companies using the WMS.

```sql
CREATE TABLE tenants (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  code TEXT UNIQUE,
  plan TEXT DEFAULT 'free',
  status TEXT DEFAULT 'active',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### users

System users scoped to a tenant.

```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  name TEXT,
  phone TEXT,
  role TEXT DEFAULT 'worker',
  status TEXT DEFAULT 'active',
  avatar_url TEXT,
  last_login TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_users_tenant ON users(tenant_id);
CREATE INDEX idx_users_email ON users(email);
```

### roles

Defines system roles.

```sql
CREATE TABLE roles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT UNIQUE NOT NULL,
  description TEXT
);
```

Default roles: `admin`, `manager`, `warehouse_operator`, `worker`

### user_roles

Many-to-many user ↔ role mapping.

```sql
CREATE TABLE user_roles (
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  role_id UUID REFERENCES roles(id) ON DELETE CASCADE,
  PRIMARY KEY (user_id, role_id)
);
```

---

## 3. Domain: Warehouse Structure

### warehouses

```sql
CREATE TABLE warehouses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
  code TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  type TEXT DEFAULT 'distribution',
  address_line1 TEXT NOT NULL,
  address_line2 TEXT,
  city TEXT NOT NULL,
  state TEXT NOT NULL,
  postal_code TEXT,
  country TEXT DEFAULT 'India',
  total_capacity INTEGER NOT NULL DEFAULT 0,
  total_area_sqft NUMERIC,
  current_occupancy INTEGER DEFAULT 0,
  contact_phone TEXT,
  contact_email TEXT,
  status TEXT DEFAULT 'active',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_warehouse_tenant ON warehouses(tenant_id);
CREATE INDEX idx_warehouse_code ON warehouses(code);
CREATE INDEX idx_warehouse_status ON warehouses(status);
CREATE INDEX idx_warehouse_type ON warehouses(type);
```

**Notes:**
- `code` is auto-generated if not provided (format: `WH-001`, `WH-002`, etc.)
- `type` values: `distribution`, `manufacturing`, `cold_storage`, `bonded`, `transit`, `retail`
- `status` values: `active`, `inactive`, `maintenance`

### zones

```sql
CREATE TABLE zones (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  warehouse_id UUID NOT NULL REFERENCES warehouses(id) ON DELETE CASCADE,
  
  code TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  type TEXT DEFAULT 'storage',
  
  capacity_weight NUMERIC DEFAULT 0,
  capacity_volume NUMERIC DEFAULT 0,
  current_weight NUMERIC DEFAULT 0,
  current_volume NUMERIC DEFAULT 0,
  
  rack_count INTEGER DEFAULT 0,
  bin_count INTEGER DEFAULT 0,
  occupied_bins INTEGER DEFAULT 0,
  
  is_active BOOLEAN DEFAULT true,
  is_locked BOOLEAN DEFAULT false,
  
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_zones_tenant ON zones(tenant_id);
CREATE INDEX idx_zones_warehouse ON zones(warehouse_id);
CREATE INDEX idx_zones_code ON zones(code);
CREATE INDEX idx_zones_type ON zones(type);
CREATE INDEX idx_zones_warehouse_type ON zones(warehouse_id, type);
```

**Zone types:** `receiving`, `storage`, `picking`, `packing`, `shipping`, `returns`, `staging`, `cold-storage`, `hazardous`, `bulk`, `fast-moving`

**Notes:**
- Auto-generated code: ZN-001, ZN-002, etc. (if not provided)
- Utilization calculated from weight or volume capacity (whichever is higher)
- Rack/bin counts updated by service when racks/bins are created/deleted
- CASCADE delete: deleting a warehouse deletes all its zones (and their racks/bins)

### racks

```sql
CREATE TABLE racks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  zone_id UUID NOT NULL REFERENCES zones(id) ON DELETE CASCADE,
  
  code TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  
  row_position INTEGER,
  column_position INTEGER,
  
  levels INTEGER DEFAULT 1,
  slots_per_level INTEGER DEFAULT 1,
  
  max_weight_kg NUMERIC DEFAULT 0,
  max_volume_m3 NUMERIC DEFAULT 0,
  
  current_weight_kg NUMERIC DEFAULT 0,
  current_volume_m3 NUMERIC DEFAULT 0,
  
  bin_count INTEGER DEFAULT 0,
  
  status TEXT DEFAULT 'active',
  
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_racks_tenant ON racks(tenant_id);
CREATE INDEX idx_racks_zone ON racks(zone_id);
CREATE INDEX idx_racks_code ON racks(code);
CREATE INDEX idx_racks_status ON racks(status);
CREATE INDEX idx_racks_zone_status ON racks(zone_id, status);
```

**Notes:**
- Auto-generated code: RK-001, RK-002, etc. (if not provided)
- Levels: 1-20 vertical shelves in the rack
- Slots per level: 1-50 bin positions per level
- Position tracking: row_position and column_position for physical layout
- Utilization calculated from weight or volume capacity (whichever is higher)
- Bin count updated by service when bins are created/deleted
- CASCADE delete: deleting a zone deletes all its racks (and their bins)

### bins

```sql
CREATE TABLE bins (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  rack_id UUID NOT NULL REFERENCES racks(id) ON DELETE CASCADE,
  zone_id UUID NOT NULL REFERENCES zones(id) ON DELETE CASCADE,
  warehouse_id UUID NOT NULL REFERENCES warehouses(id) ON DELETE CASCADE,
  
  code TEXT UNIQUE NOT NULL,
  level INTEGER NOT NULL,
  position INTEGER NOT NULL,
  
  capacity NUMERIC DEFAULT 0,
  max_weight NUMERIC DEFAULT 0,
  max_volume NUMERIC DEFAULT 0,
  
  current_weight NUMERIC DEFAULT 0,
  current_volume NUMERIC DEFAULT 0,
  
  status TEXT DEFAULT 'empty',
  
  is_locked BOOLEAN DEFAULT false,
  lock_reason TEXT,
  
  last_movement_at TIMESTAMP,
  
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_bins_tenant ON bins(tenant_id);
CREATE INDEX idx_bins_rack ON bins(rack_id);
CREATE INDEX idx_bins_zone ON bins(zone_id);
CREATE INDEX idx_bins_warehouse ON bins(warehouse_id);
CREATE INDEX idx_bins_code ON bins(code);
CREATE INDEX idx_bins_status ON bins(status);
CREATE INDEX idx_bins_rack_level ON bins(rack_id, level, position);
```

**Bin statuses:** `empty`, `partial`, `full`, `reserved`, `damaged`

**Notes:**
- Auto-generated code: BIN-001, BIN-002, etc. (if not provided)
- Level: Vertical shelf number in the rack (1-based)
- Position: Horizontal position on the level (1-based)
- Utilization calculated from weight or volume capacity (whichever is higher)
- Lock/unlock functionality for operational control
- CASCADE delete: deleting a rack deletes all its bins
- Automatic update of rack bin_count when bins created/deleted
- Automatic update of zone bin_count when bins created/deleted

**Hierarchy**: warehouse → zone → rack → bin

---

## 4. Domain: Inventory

### categories

```sql
CREATE TABLE categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### units

```sql
CREATE TABLE units (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  symbol TEXT
);
```

Default units: `piece`, `kg`, `box`, `pallet`, `litre`

### skus ✅ IMPLEMENTED

Product master — 31 columns. Migration: `006_create_skus.sql`

```sql
CREATE TABLE skus (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  code TEXT UNIQUE NOT NULL,          -- Auto-generated: SKU-001, SKU-002
  name TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'general',
  subcategory TEXT,
  brand TEXT,
  description TEXT,
  uom TEXT DEFAULT 'pcs',
  weight NUMERIC DEFAULT 0,
  length NUMERIC DEFAULT 0,
  width NUMERIC DEFAULT 0,
  height NUMERIC DEFAULT 0,
  barcode TEXT,
  hsn_code TEXT,
  gst_rate NUMERIC DEFAULT 0,
  cost_price NUMERIC DEFAULT 0,
  selling_price NUMERIC DEFAULT 0,
  reorder_point INTEGER DEFAULT 0,
  reorder_qty INTEGER DEFAULT 0,
  min_stock INTEGER DEFAULT 0,
  max_stock INTEGER DEFAULT 0,
  batch_tracking BOOLEAN DEFAULT false,
  expiry_tracking BOOLEAN DEFAULT false,
  serial_tracking BOOLEAN DEFAULT false,
  shelf_life_days INTEGER,
  storage_type TEXT DEFAULT 'ambient',
  hazardous BOOLEAN DEFAULT false,
  fragile BOOLEAN DEFAULT false,
  tags TEXT[],
  status TEXT DEFAULT 'active',       -- active, inactive, blocked, discontinued
  image_url TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_skus_tenant ON skus(tenant_id);
CREATE INDEX idx_skus_code ON skus(code);
CREATE INDEX idx_skus_category ON skus(category);
CREATE INDEX idx_skus_status ON skus(status);
CREATE INDEX idx_skus_barcode ON skus(barcode);
```

### sku_barcodes

Multiple barcodes per SKU.

```sql
CREATE TABLE sku_barcodes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  sku_id UUID REFERENCES skus(id) ON DELETE CASCADE,
  barcode TEXT UNIQUE NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);
```

### stock_levels ✅ IMPLEMENTED

Per-bin inventory tracking. Migration: `008_create_stock_levels.sql`

```sql
CREATE TABLE stock_levels (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  sku_id UUID NOT NULL REFERENCES skus(id) ON DELETE CASCADE,
  warehouse_id UUID NOT NULL REFERENCES warehouses(id) ON DELETE CASCADE,
  bin_id UUID REFERENCES bins(id) ON DELETE SET NULL,
  batch_id UUID REFERENCES batches(id) ON DELETE SET NULL,
  quantity_available INTEGER DEFAULT 0,
  quantity_reserved INTEGER DEFAULT 0,
  quantity_in_transit INTEGER DEFAULT 0,
  quantity_damaged INTEGER DEFAULT 0,
  last_counted_at TIMESTAMP,
  last_updated TIMESTAMP DEFAULT NOW(),
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_stock_levels_tenant ON stock_levels(tenant_id);
CREATE INDEX idx_stock_levels_sku ON stock_levels(sku_id);
CREATE INDEX idx_stock_levels_warehouse ON stock_levels(warehouse_id);
CREATE INDEX idx_stock_levels_bin ON stock_levels(bin_id);
CREATE INDEX idx_stock_levels_batch ON stock_levels(batch_id);
CREATE UNIQUE INDEX idx_stock_levels_unique ON stock_levels(tenant_id, sku_id, warehouse_id, COALESCE(bin_id, '00000000-...'), COALESCE(batch_id, '00000000-...'));
```

**Notes:**
- Replaces planned `bin_inventory` table — single unified table tracks both warehouse-level and bin-level stock
- `totalQuantity` computed in application layer: available + reserved + in-transit + damaged
- Unique constraint prevents duplicate stock entries per SKU/warehouse/bin/batch combo

### batches ✅ IMPLEMENTED

Batch tracking with FIFO rank. Migration: `007_create_batches.sql`

```sql
CREATE TABLE batches (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  sku_id UUID NOT NULL REFERENCES skus(id) ON DELETE CASCADE,
  batch_number TEXT NOT NULL,
  manufacture_date DATE,
  expiry_date DATE,
  supplier_reference TEXT,
  quantity INTEGER DEFAULT 0,
  status TEXT DEFAULT 'active',
  fifo_rank INTEGER,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE (tenant_id, sku_id, batch_number)
);

CREATE INDEX idx_batches_tenant ON batches(tenant_id);
CREATE INDEX idx_batches_sku ON batches(sku_id);
CREATE INDEX idx_batches_status ON batches(status);
CREATE INDEX idx_batches_expiry ON batches(expiry_date);
```

Batch statuses: `active`, `blocked`, `quarantine`, `expired`, `consumed`, `depleted`

### stock_movements ✅ IMPLEMENTED

Full audit trail for all inventory changes. Migration: `009_create_stock_movements.sql`

```sql
CREATE TABLE stock_movements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  movement_number TEXT UNIQUE NOT NULL,   -- Auto-generated: MOV-00001
  movement_type TEXT NOT NULL,
  sku_id UUID NOT NULL REFERENCES skus(id),
  batch_id UUID REFERENCES batches(id),
  warehouse_id UUID REFERENCES warehouses(id),
  from_bin_id UUID REFERENCES bins(id) ON DELETE SET NULL,
  to_bin_id UUID REFERENCES bins(id) ON DELETE SET NULL,
  quantity INTEGER NOT NULL,
  reference_type TEXT,
  reference_id UUID,
  notes TEXT,
  created_by UUID,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_stock_movements_tenant ON stock_movements(tenant_id);
CREATE INDEX idx_stock_movements_sku ON stock_movements(sku_id);
CREATE INDEX idx_stock_movements_type ON stock_movements(movement_type);
CREATE INDEX idx_stock_movements_warehouse ON stock_movements(warehouse_id);
CREATE INDEX idx_stock_movements_created ON stock_movements(created_at DESC);
CREATE INDEX idx_stock_movements_number ON stock_movements(movement_number);
```

Movement types: `stock-in`, `stock-out`, `transfer`, `adjustment`, `damage`, `return`, `scrap`, `putaway`, `picking`

---

## 5. Domain: Inbound Logistics

Flow: Supplier → Purchase Order → GRN → QC → Putaway

### suppliers

```sql
CREATE TABLE suppliers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
  code TEXT NOT NULL,
  name TEXT NOT NULL,
  contact_name TEXT,
  email TEXT,
  phone TEXT,
  address TEXT,
  city TEXT,
  state TEXT,
  pincode TEXT,
  gst_number TEXT,
  payment_terms TEXT,
  lead_time_days INTEGER DEFAULT 7,
  rating NUMERIC DEFAULT 0,
  status TEXT DEFAULT 'active',
  created_at TIMESTAMP DEFAULT NOW()
);
```

### purchase_orders

```sql
CREATE TABLE purchase_orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
  po_number TEXT UNIQUE NOT NULL,
  supplier_id UUID REFERENCES suppliers(id),
  warehouse_id UUID REFERENCES warehouses(id),
  status TEXT DEFAULT 'draft',
  priority TEXT DEFAULT 'normal',
  order_date TIMESTAMP,
  expected_date TIMESTAMP,
  received_date TIMESTAMP,
  subtotal NUMERIC DEFAULT 0,
  tax_amount NUMERIC DEFAULT 0,
  total_amount NUMERIC DEFAULT 0,
  paid_amount NUMERIC DEFAULT 0,
  notes TEXT,
  created_by UUID REFERENCES users(id),
  approved_by UUID REFERENCES users(id),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

PO statuses: `draft`, `submitted`, `approved`, `pending`, `partial`, `received`, `cancelled`

### purchase_order_items

```sql
CREATE TABLE purchase_order_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  purchase_order_id UUID REFERENCES purchase_orders(id) ON DELETE CASCADE,
  sku_id UUID REFERENCES skus(id),
  quantity INTEGER NOT NULL,
  unit_price NUMERIC NOT NULL,
  tax_rate NUMERIC DEFAULT 0,
  total_price NUMERIC DEFAULT 0,
  received_qty INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW()
);
```

### grn (Goods Received Notes)

```sql
CREATE TABLE grn (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
  grn_number TEXT UNIQUE NOT NULL,
  purchase_order_id UUID REFERENCES purchase_orders(id),
  supplier_id UUID REFERENCES suppliers(id),
  warehouse_id UUID REFERENCES warehouses(id),
  status TEXT DEFAULT 'draft',
  received_date TIMESTAMP,
  invoice_number TEXT,
  invoice_date TIMESTAMP,
  vehicle_number TEXT,
  driver_name TEXT,
  driver_phone TEXT,
  notes TEXT,
  received_by UUID REFERENCES users(id),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

GRN statuses: `draft`, `in_progress`, `completed`, `cancelled`

### grn_items

```sql
CREATE TABLE grn_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  grn_id UUID REFERENCES grn(id) ON DELETE CASCADE,
  sku_id UUID REFERENCES skus(id),
  ordered_qty INTEGER NOT NULL,
  received_qty INTEGER DEFAULT 0,
  accepted_qty INTEGER DEFAULT 0,
  rejected_qty INTEGER DEFAULT 0,
  bin_id UUID REFERENCES bins(id),
  created_at TIMESTAMP DEFAULT NOW()
);
```

### qc_inspections

```sql
CREATE TABLE qc_inspections (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
  qc_number TEXT UNIQUE NOT NULL,
  grn_id UUID REFERENCES grn(id),
  sku_id UUID REFERENCES skus(id),
  status TEXT DEFAULT 'pending',
  result TEXT,
  inspected_qty INTEGER DEFAULT 0,
  passed_qty INTEGER DEFAULT 0,
  failed_qty INTEGER DEFAULT 0,
  inspector_id UUID REFERENCES users(id),
  inspected_at TIMESTAMP,
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

QC statuses: `pending`, `in_progress`, `passed`, `failed`, `conditional_pass`

### qc_defects

```sql
CREATE TABLE qc_defects (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  qc_inspection_id UUID REFERENCES qc_inspections(id) ON DELETE CASCADE,
  defect_type TEXT NOT NULL,
  description TEXT,
  severity TEXT DEFAULT 'minor',
  quantity INTEGER DEFAULT 1,
  photo_url TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);
```

---

## 6. Domain: Outbound Logistics

Flow: Sales Order → Pick List → Packing → Shipment

### customers

```sql
CREATE TABLE customers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
  code TEXT NOT NULL,
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  address TEXT,
  city TEXT,
  state TEXT,
  pincode TEXT,
  gst_number TEXT,
  status TEXT DEFAULT 'active',
  created_at TIMESTAMP DEFAULT NOW()
);
```

### sales_orders

```sql
CREATE TABLE sales_orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
  so_number TEXT UNIQUE NOT NULL,
  customer_id UUID REFERENCES customers(id),
  warehouse_id UUID REFERENCES warehouses(id),
  status TEXT DEFAULT 'draft',
  priority TEXT DEFAULT 'normal',
  order_date TIMESTAMP,
  required_date TIMESTAMP,
  shipped_date TIMESTAMP,
  subtotal NUMERIC DEFAULT 0,
  tax_amount NUMERIC DEFAULT 0,
  shipping_charge NUMERIC DEFAULT 0,
  discount NUMERIC DEFAULT 0,
  total_amount NUMERIC DEFAULT 0,
  payment_status TEXT DEFAULT 'pending',
  shipping_address TEXT,
  notes TEXT,
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

SO statuses: `draft`, `confirmed`, `picking`, `packing`, `ready_to_ship`, `shipped`, `delivered`, `cancelled`

### sales_order_items

```sql
CREATE TABLE sales_order_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  sales_order_id UUID REFERENCES sales_orders(id) ON DELETE CASCADE,
  sku_id UUID REFERENCES skus(id),
  quantity INTEGER NOT NULL,
  unit_price NUMERIC NOT NULL,
  tax_rate NUMERIC DEFAULT 0,
  total_price NUMERIC DEFAULT 0,
  picked_qty INTEGER DEFAULT 0,
  packed_qty INTEGER DEFAULT 0,
  shipped_qty INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW()
);
```

### pick_lists

```sql
CREATE TABLE pick_lists (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
  pick_list_number TEXT UNIQUE NOT NULL,
  sales_order_id UUID REFERENCES sales_orders(id),
  warehouse_id UUID REFERENCES warehouses(id),
  status TEXT DEFAULT 'pending',
  priority TEXT DEFAULT 'normal',
  assigned_to UUID REFERENCES users(id),
  started_at TIMESTAMP,
  completed_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### pick_list_items

```sql
CREATE TABLE pick_list_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  pick_list_id UUID REFERENCES pick_lists(id) ON DELETE CASCADE,
  sku_id UUID REFERENCES skus(id),
  quantity INTEGER NOT NULL,
  picked_qty INTEGER DEFAULT 0,
  bin_id UUID REFERENCES bins(id),
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT NOW()
);
```

### shipments

```sql
CREATE TABLE shipments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
  shipment_number TEXT UNIQUE NOT NULL,
  sales_order_id UUID REFERENCES sales_orders(id),
  warehouse_id UUID REFERENCES warehouses(id),
  status TEXT DEFAULT 'pending',
  carrier TEXT,
  tracking_number TEXT,
  estimated_delivery TIMESTAMP,
  actual_delivery TIMESTAMP,
  shipping_cost NUMERIC DEFAULT 0,
  weight_kg NUMERIC DEFAULT 0,
  packages_count INTEGER DEFAULT 1,
  notes TEXT,
  shipped_by UUID REFERENCES users(id),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### returns

```sql
CREATE TABLE returns (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
  return_number TEXT UNIQUE NOT NULL,
  sales_order_id UUID REFERENCES sales_orders(id),
  customer_id UUID REFERENCES customers(id),
  warehouse_id UUID REFERENCES warehouses(id),
  status TEXT DEFAULT 'pending',
  reason TEXT,
  return_date TIMESTAMP,
  received_date TIMESTAMP,
  refund_amount NUMERIC DEFAULT 0,
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

---

## 7. Domain: Operations

### tasks

```sql
CREATE TABLE tasks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
  task_type TEXT NOT NULL,
  status TEXT DEFAULT 'pending',
  priority TEXT DEFAULT 'normal',
  title TEXT NOT NULL,
  description TEXT,
  assigned_to UUID REFERENCES users(id),
  warehouse_id UUID REFERENCES warehouses(id),
  reference_type TEXT,
  reference_id UUID,
  due_at TIMESTAMP,
  started_at TIMESTAMP,
  completed_at TIMESTAMP,
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

Task types: `receiving`, `putaway`, `picking`, `packing`, `shipping`, `cycle_count`, `maintenance`, `transfer`, `other`

### workflow_templates

```sql
CREATE TABLE workflow_templates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  code TEXT UNIQUE NOT NULL,
  type TEXT NOT NULL,
  description TEXT,
  steps JSONB DEFAULT '[]',
  sla_minutes INTEGER,
  default_priority TEXT DEFAULT 'normal',
  auto_assign BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### adjustments

```sql
CREATE TABLE adjustments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
  adjustment_number TEXT UNIQUE NOT NULL,
  sku_id UUID REFERENCES skus(id),
  warehouse_id UUID REFERENCES warehouses(id),
  bin_id UUID REFERENCES bins(id),
  system_qty INTEGER,
  physical_qty INTEGER,
  variance INTEGER,
  reason TEXT,
  status TEXT DEFAULT 'pending',
  requested_by UUID REFERENCES users(id),
  approved_by UUID REFERENCES users(id),
  applied_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### damaged_items

```sql
CREATE TABLE damaged_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
  sku_id UUID REFERENCES skus(id),
  batch_id UUID REFERENCES batches(id),
  warehouse_id UUID REFERENCES warehouses(id),
  bin_id UUID REFERENCES bins(id),
  quantity INTEGER NOT NULL,
  damage_category TEXT NOT NULL,
  description TEXT,
  photos JSONB DEFAULT '[]',
  decision TEXT DEFAULT 'pending',
  decided_by UUID REFERENCES users(id),
  decided_at TIMESTAMP,
  reported_by UUID REFERENCES users(id),
  created_at TIMESTAMP DEFAULT NOW()
);
```

### alerts

```sql
CREATE TABLE alerts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  severity TEXT DEFAULT 'warning',
  sku_id UUID REFERENCES skus(id),
  warehouse_id UUID REFERENCES warehouses(id),
  message TEXT NOT NULL,
  threshold_value NUMERIC,
  current_value NUMERIC,
  is_acknowledged BOOLEAN DEFAULT false,
  acknowledged_by UUID REFERENCES users(id),
  acknowledged_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);
```

Alert types: `low_stock`, `expiry_warning`, `expiry_critical`, `overstock`, `damage_reported`

---

## 8. Domain: Audit and System Activity

### audit_logs

```sql
CREATE TABLE audit_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID REFERENCES tenants(id),
  entity_type TEXT NOT NULL,
  entity_id UUID,
  action TEXT NOT NULL,
  actor_id UUID REFERENCES users(id),
  actor_role TEXT,
  old_value JSONB,
  new_value JSONB,
  reason TEXT,
  ip_address TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_audit_entity ON audit_logs(entity_type, entity_id);
CREATE INDEX idx_audit_actor ON audit_logs(actor_id);
```

### activity_logs

```sql
CREATE TABLE activity_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID REFERENCES tenants(id),
  user_id UUID REFERENCES users(id),
  action TEXT NOT NULL,
  description TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_activity_user ON activity_logs(user_id);
```

---

## 9. Relationship Summary

```
tenant → users, warehouses, skus, suppliers, customers
warehouse → zones → racks → bins
sku → categories, units, sku_barcodes
sku + warehouse → stock_levels
bin + sku → bin_inventory
sku → batches → stock_movements
supplier → purchase_orders → purchase_order_items
purchase_order → grn → grn_items → qc_inspections → qc_defects
customer → sales_orders → sales_order_items
sales_order → pick_lists → pick_list_items
sales_order → shipments
sales_order → returns
task → workflow_templates
sku → adjustments, damaged_items, alerts
```

---

## 10. Total Tables

| Domain                  | Tables |
|-------------------------|--------|
| Tenant & Access Control | 4      |
| Warehouse Structure     | 4      |
| Inventory               | 8      |
| Inbound                 | 6      |
| Outbound                | 6      |
| Operations              | 5      |
| Audit                   | 2      |
| **Total**               | **35** |
