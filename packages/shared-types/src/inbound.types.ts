// Inbound logistics types: suppliers, POs, GRN, QC

import { TenantScopedEntity, BaseEntity } from './common.types';

// --- Enums ---

export type POStatus = 'draft' | 'submitted' | 'approved' | 'pending' | 'partial' | 'received' | 'cancelled';

export type POPriority = 'low' | 'normal' | 'high' | 'urgent';

export type GRNStatus = 'draft' | 'in_progress' | 'completed' | 'cancelled';

export type QCStatus = 'pending' | 'in_progress' | 'passed' | 'failed' | 'conditional_pass';

export type DefectSeverity = 'minor' | 'major' | 'critical';

// --- Entities ---

export interface Supplier extends TenantScopedEntity {
  code: string;
  name: string;
  contactName?: string;
  email?: string;
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
  pincode?: string;
  gstNumber?: string;
  paymentTerms?: string;
  leadTimeDays: number;
  rating: number;
  status: 'active' | 'inactive';
}

export interface PurchaseOrder extends TenantScopedEntity {
  poNumber: string;
  supplierId: string;
  supplierName?: string;
  warehouseId: string;
  warehouseName?: string;
  status: POStatus;
  priority: POPriority;
  orderDate: string;
  expectedDate?: string;
  receivedDate?: string;
  subtotal: number;
  taxAmount: number;
  totalAmount: number;
  paidAmount: number;
  notes?: string;
  items: PurchaseOrderItem[];
  createdBy?: string;
  createdByName?: string;
  approvedBy?: string;
  approvedByName?: string;
}

export interface PurchaseOrderItem {
  id: string;
  skuId: string;
  skuCode: string;
  skuName: string;
  quantity: number;
  unitPrice: number;
  taxRate: number;
  totalPrice: number;
  receivedQty: number;
}

export interface GRN extends TenantScopedEntity {
  grnNumber: string;
  purchaseOrderId: string;
  poNumber?: string;
  supplierId: string;
  supplierName?: string;
  warehouseId: string;
  warehouseName?: string;
  status: GRNStatus;
  receivedDate: string;
  invoiceNumber?: string;
  invoiceDate?: string;
  vehicleNumber?: string;
  driverName?: string;
  driverPhone?: string;
  notes?: string;
  items: GRNItem[];
  receivedBy?: string;
  receivedByName?: string;
}

export interface GRNItem {
  id: string;
  skuId: string;
  skuCode: string;
  skuName: string;
  orderedQty: number;
  receivedQty: number;
  acceptedQty: number;
  rejectedQty: number;
  binCode?: string;
}

export interface QCInspection extends TenantScopedEntity {
  qcNumber: string;
  grnId: string;
  grnNumber?: string;
  skuId: string;
  skuCode?: string;
  skuName?: string;
  status: QCStatus;
  result?: string;
  inspectedQty: number;
  passedQty: number;
  failedQty: number;
  inspectorId?: string;
  inspectorName?: string;
  inspectedAt?: string;
  notes?: string;
  defects?: QCDefect[];
}

export interface QCDefect {
  id: string;
  qcInspectionId: string;
  defectType: string;
  description?: string;
  severity: DefectSeverity;
  quantity: number;
  photoUrl?: string;
  createdAt: string;
}

// --- Stats ---

export interface POStats {
  draft: number;
  submitted: number;
  approved: number;
  pending: number;
  partial: number;
  received: number;
  cancelled: number;
  total: number;
  totalValue: number;
}
