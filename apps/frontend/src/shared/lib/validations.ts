import { z } from 'zod';

// Purchase Order
export const createPOSchema = z.object({
  supplier_name: z.string().min(1, 'Supplier name is required').max(255),
  supplier_contact: z.string().optional(),
  supplier_email: z.string().email('Invalid email').optional().or(z.literal('')),
  warehouse_id: z.string().uuid('Select a warehouse'),
  expected_delivery: z.string().optional(),
  notes: z.string().max(1000).optional(),
  items: z.array(z.object({
    sku_id: z.string().uuid('Select a SKU'),
    ordered_quantity: z.number().int().positive('Quantity must be positive'),
    unit_price: z.number().nonnegative('Price cannot be negative'),
  })).min(1, 'At least one item is required'),
});

// Sales Order
export const createSOSchema = z.object({
  customer_name: z.string().min(1, 'Customer name is required').max(255),
  customer_code: z.string().optional(),
  customer_contact: z.string().optional(),
  customer_address: z.string().optional(),
  warehouse_id: z.string().uuid('Select a warehouse'),
  expected_delivery_date: z.string().optional(),
  priority: z.enum(['low', 'medium', 'high', 'urgent']).default('medium'),
  notes: z.string().max(1000).optional(),
  items: z.array(z.object({
    sku_id: z.string().uuid('Select a SKU'),
    ordered_quantity: z.number().int().positive('Quantity must be positive'),
    unit_price: z.number().nonnegative('Price cannot be negative'),
    tax_percentage: z.number().min(0).max(100).optional(),
    notes: z.string().max(500).optional(),
  })).min(1, 'At least one item is required'),
});

// GRN
export const createGRNSchema = z.object({
  purchase_order_id: z.string().uuid('Select a purchase order'),
  warehouse_id: z.string().uuid('Select a warehouse'),
  received_date: z.string().optional(),
  dock_door: z.string().max(50).optional(),
  vehicle_number: z.string().max(50).optional(),
  notes: z.string().max(1000).optional(),
});

// GRN Item Update
export const updateGRNItemSchema = z.object({
  received_quantity: z.number().int().nonnegative('Cannot be negative'),
  rejected_quantity: z.number().int().nonnegative('Cannot be negative'),
  condition: z.enum(['good', 'damaged', 'partial']).default('good'),
  bin_id: z.string().uuid().optional().nullable(),
  batch_number: z.string().max(100).optional(),
  expiry_date: z.string().optional(),
  notes: z.string().max(500).optional(),
});

// Shipment
export const createShipmentSchema = z.object({
  order_id: z.string().uuid('Select an order'),
  warehouse_id: z.string().uuid('Select a warehouse'),
  carrier_name: z.string().min(1, 'Carrier name is required').max(255),
  tracking_number: z.string().max(100).optional(),
  vehicle_number: z.string().max(50).optional(),
  driver_name: z.string().max(100).optional(),
  driver_contact: z.string().max(50).optional(),
  total_packages: z.number().int().positive().default(1),
  total_weight: z.number().nonnegative().optional(),
  notes: z.string().max(1000).optional(),
});

// Return
export const createReturnSchema = z.object({
  order_id: z.string().uuid('Select an order'),
  sku_id: z.string().uuid('Select a SKU'),
  quantity: z.number().int().positive('Quantity must be positive'),
  warehouse_id: z.string().uuid('Select a warehouse'),
  reason: z.string().min(1, 'Reason is required').max(500),
  return_type: z.enum(['customer_return', 'damaged', 'wrong_item', 'quality_issue']).default('customer_return'),
  notes: z.string().max(1000).optional(),
});

// Stock Movement
export const stockMovementSchema = z.object({
  movement_type: z.enum(['stock_in', 'stock_out', 'transfer', 'adjustment', 'damage', 'return', 'putaway', 'pick']),
  sku_id: z.string().uuid('Select a SKU'),
  quantity: z.number().int().positive('Quantity must be positive'),
  source_warehouse_id: z.string().uuid().optional().nullable(),
  source_zone_id: z.string().uuid().optional().nullable(),
  source_bin_id: z.string().uuid().optional().nullable(),
  dest_warehouse_id: z.string().uuid().optional().nullable(),
  dest_zone_id: z.string().uuid().optional().nullable(),
  dest_bin_id: z.string().uuid().optional().nullable(),
  batch_id: z.string().uuid().optional().nullable(),
  reference_type: z.string().max(50).optional(),
  reference_id: z.string().uuid().optional().nullable(),
  reason: z.string().max(500).optional(),
  notes: z.string().max(1000).optional(),
});

// Warehouse
export const createWarehouseSchema = z.object({
  name: z.string().min(1, 'Name is required').max(255),
  code: z.string().min(1, 'Code is required').max(50),
  address: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  country: z.string().optional(),
  total_capacity: z.number().nonnegative().default(0),
  warehouse_type: z.enum(['ambient', 'cold', 'frozen', 'hazmat']).default('ambient'),
});

// SKU
export const createSKUSchema = z.object({
  sku_code: z.string().min(1, 'SKU code is required').max(50),
  name: z.string().min(1, 'Name is required').max(255),
  description: z.string().max(1000).optional(),
  category: z.string().max(100).optional(),
  unit_of_measure: z.string().min(1, 'Unit is required').max(20),
  weight: z.number().nonnegative().optional(),
  volume: z.number().nonnegative().optional(),
  reorder_point: z.number().int().nonnegative().optional(),
  max_stock_level: z.number().int().nonnegative().optional(),
  batch_tracking: z.boolean().default(false),
  serial_tracking: z.boolean().default(false),
});

// Helper to extract error messages
export function getValidationErrors(result: z.SafeParseReturnType<any, any>): Record<string, string> {
  if (result.success) return {};
  const errors: Record<string, string> = {};
  for (const issue of result.error.issues) {
    const path = issue.path.join('.');
    if (!errors[path]) {
      errors[path] = issue.message;
    }
  }
  return errors;
}
