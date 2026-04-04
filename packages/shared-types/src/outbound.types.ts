// Outbound logistics types: sales orders, pick lists, shipments, returns

import { TenantScopedEntity } from './common.types';

// --- Enums ---

export type SOStatus =
  | 'draft'
  | 'confirmed'
  | 'picking'
  | 'packing'
  | 'ready_to_ship'
  | 'shipped'
  | 'delivered'
  | 'cancelled';

export type SOPriority = 'low' | 'normal' | 'high' | 'urgent';

export type PaymentStatus = 'pending' | 'partial' | 'paid' | 'refunded';

export type PickListStatus = 'pending' | 'assigned' | 'in_progress' | 'completed' | 'cancelled';

export type PickItemStatus = 'pending' | 'picked' | 'short' | 'skipped';

export type ShipmentStatus = 'pending' | 'dispatched' | 'in_transit' | 'delivered' | 'cancelled';

export type ReturnStatus = 'pending' | 'received' | 'inspected' | 'processed' | 'rejected';

// --- Entities ---

export interface SalesOrder extends TenantScopedEntity {
  soNumber: string;
  customerId: string;
  customerName?: string;
  warehouseId: string;
  warehouseName?: string;
  status: SOStatus;
  priority: SOPriority;
  orderDate: string;
  requiredDate?: string;
  shippedDate?: string;
  subtotal: number;
  taxAmount: number;
  shippingCharge: number;
  discount: number;
  totalAmount: number;
  paymentStatus: PaymentStatus;
  shippingAddress?: string;
  notes?: string;
  items: SalesOrderItem[];
  createdBy?: string;
  createdByName?: string;
}

export interface SalesOrderItem {
  id: string;
  skuId: string;
  skuCode: string;
  skuName: string;
  quantity: number;
  unitPrice: number;
  taxRate: number;
  totalPrice: number;
  pickedQty: number;
  packedQty: number;
  shippedQty: number;
}

export interface Customer extends TenantScopedEntity {
  code: string;
  name: string;
  email?: string;
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
  pincode?: string;
  gstNumber?: string;
  status: 'active' | 'inactive';
}

export interface PickList extends TenantScopedEntity {
  pickListNumber: string;
  salesOrderId: string;
  soNumber?: string;
  warehouseId: string;
  warehouseName?: string;
  status: PickListStatus;
  priority: SOPriority;
  assignedTo?: string;
  assignedToName?: string;
  startedAt?: string;
  completedAt?: string;
  items: PickListItem[];
  totalItems: number;
  totalQuantity: number;
  pickedQuantity: number;
}

export interface PickListItem {
  id: string;
  skuId: string;
  skuCode: string;
  skuName: string;
  quantity: number;
  pickedQty: number;
  binId?: string;
  binCode?: string;
  status: PickItemStatus;
}

export interface Shipment extends TenantScopedEntity {
  shipmentNumber: string;
  salesOrderId: string;
  soNumber?: string;
  warehouseId: string;
  warehouseName?: string;
  status: ShipmentStatus;
  carrier?: string;
  trackingNumber?: string;
  estimatedDelivery?: string;
  actualDelivery?: string;
  shippingCost: number;
  weightKg: number;
  packagesCount: number;
  notes?: string;
  shippedBy?: string;
  shippedByName?: string;
}

export interface Return extends TenantScopedEntity {
  returnNumber: string;
  salesOrderId: string;
  soNumber?: string;
  customerId: string;
  customerName?: string;
  warehouseId: string;
  warehouseName?: string;
  status: ReturnStatus;
  reason?: string;
  returnDate?: string;
  receivedDate?: string;
  refundAmount: number;
  notes?: string;
}

// --- Stats ---

export interface SOStats {
  draft: number;
  confirmed: number;
  picking: number;
  packing: number;
  shipped: number;
  delivered: number;
  cancelled: number;
  total: number;
  totalValue: number;
}
