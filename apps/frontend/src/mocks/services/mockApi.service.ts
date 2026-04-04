// Mock API Service - Simulates API calls with mock data

import { mockStorage } from './mockStorage.service';
import { MOCK_TENANT, MOCK_TOKENS, createMockUser } from '../data/auth.mock';
import {
  MOCK_DASHBOARD_STATS,
  MOCK_INVENTORY_OVERVIEW,
  MOCK_ORDERS_SUMMARY,
  MOCK_REALTIME_DATA,
  MOCK_TREND_DATA,
  MOCK_PO_STATS,
  MOCK_SO_STATS,
  MOCK_TASK_STATS,
  MOCK_WORKFLOW_METRICS,
  MOCK_USER_STATS,
  MOCK_INVOICE_STATS,
  MOCK_STOCK_REPORT,
  MOCK_MOVEMENT_REPORT,
  MOCK_PURCHASE_REGISTER,
  MOCK_SALES_REGISTER,
  MOCK_EXPIRY_REPORT,
  MOCK_LOW_STOCK_REPORT,
  MOCK_WAREHOUSE_UTILIZATION_REPORT,
  MOCK_AUDIT_TRAIL,
} from '../data';

const MOCK_DELAY_MS = 200;

async function delay(ms: number = MOCK_DELAY_MS): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function generateId(prefix: string): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

function success<T>(data: T, meta?: any) {
  return { success: true, data, meta };
}

function error(message: string, code: string = 'ERROR') {
  return { success: false, error: { message, code } };
}

// Mock tenant data
const MOCK_TENANT_DATA = {
  id: 'tenant-001',
  name: 'Veerha Demo Company',
  slug: 'veerha-demo',
  plan: 'enterprise',
  maxWarehouses: 10,
  maxSkus: 5000,
  maxUsers: 100,
  maxDailyMovements: 10000,
  enabledModules: ['warehouse-setup', 'inventory-sku', 'warehouse-mapping', 'storage-config', 'workflow-automation', 'returns-damaged', 'manager-operations', 'analytics-reports', 'user-management'],
  isActive: true,
  createdAt: new Date('2024-01-01').toISOString(),
  updatedAt: new Date().toISOString(),
};

// Route handlers
const handlers: Record<string, (method: string, url: string, data?: any, params?: any) => any> = {
  // Auth
  '/auth/login': async (method, url, data) => {
    await delay();
    const user = createMockUser(data?.email || 'demo@veerha.com', data?.fullName);
    return success({ ...MOCK_TOKENS, user });
  },
  '/auth/signup': async (method, url, data) => {
    await delay();
    const user = createMockUser(data?.email, data?.fullName);
    return success({ ...MOCK_TOKENS, user, tenant: MOCK_TENANT });
  },
  '/auth/me': async () => {
    await delay();
    const users = mockStorage.getAll<any>('users');
    return success(users[0] || createMockUser('demo@veerha.com'));
  },
  '/auth/refresh': async () => {
    await delay();
    return success(MOCK_TOKENS);
  },
  '/auth/logout': async () => {
    await delay();
    return success({ message: 'Logged out' });
  },

  // Tenant
  '/tenant': async () => {
    await delay();
    return success(MOCK_TENANT_DATA);
  },
  '/tenants/current': async () => {
    await delay();
    return success(MOCK_TENANT_DATA);
  },

  // Modules
  '/modules': async () => {
    await delay();
    return success([
      { id: 'mod-001', module_code: 'warehouse-setup', name: 'Godown Setup', is_enabled: true },
      { id: 'mod-002', module_code: 'inventory-sku', name: 'Inventory & SKU', is_enabled: true },
      { id: 'mod-003', module_code: 'warehouse-mapping', name: 'Godown Mapping', is_enabled: true },
      { id: 'mod-004', module_code: 'storage-config', name: 'Storage Configuration', is_enabled: true },
      { id: 'mod-005', module_code: 'workflow-automation', name: 'Workflow Automation', is_enabled: true },
      { id: 'mod-006', module_code: 'returns-damaged', name: 'Returns & Damaged', is_enabled: true },
      { id: 'mod-007', module_code: 'manager-operations', name: 'Manager Operations', is_enabled: true },
      { id: 'mod-008', module_code: 'analytics-reports', name: 'Analytics & Reports', is_enabled: true },
      { id: 'mod-009', module_code: 'user-management', name: 'User Management', is_enabled: true },
    ]);
  },
  '/tenant-modules': async () => {
    await delay();
    return success([
      { id: 'mod-001', module_code: 'warehouse-setup', name: 'Godown Setup', is_enabled: true },
      { id: 'mod-002', module_code: 'inventory-sku', name: 'Inventory & SKU', is_enabled: true },
      { id: 'mod-003', module_code: 'warehouse-mapping', name: 'Godown Mapping', is_enabled: true },
      { id: 'mod-004', module_code: 'storage-config', name: 'Storage Configuration', is_enabled: true },
      { id: 'mod-005', module_code: 'workflow-automation', name: 'Workflow Automation', is_enabled: true },
      { id: 'mod-006', module_code: 'returns-damaged', name: 'Returns & Damaged', is_enabled: true },
      { id: 'mod-007', module_code: 'manager-operations', name: 'Manager Operations', is_enabled: true },
      { id: 'mod-008', module_code: 'analytics-reports', name: 'Analytics & Reports', is_enabled: true },
      { id: 'mod-009', module_code: 'user-management', name: 'User Management', is_enabled: true },
    ]);
  },

  // Dashboard
  '/dashboard/stats': async () => {
    await delay();
    return success(MOCK_DASHBOARD_STATS);
  },
  '/dashboard/inventory-overview': async () => {
    await delay();
    return success(MOCK_INVENTORY_OVERVIEW);
  },
  '/dashboard/orders-summary': async () => {
    await delay();
    return success(MOCK_ORDERS_SUMMARY);
  },
  '/dashboard/realtime': async () => {
    await delay(100);
    return success(MOCK_REALTIME_DATA);
  },
  '/dashboard/trend': async () => {
    await delay();
    return success(MOCK_TREND_DATA);
  },

  // Warehouses
  '/warehouses': async (method, url, data, params) => {
    await delay();
    if (method === 'GET') {
      const result = mockStorage.query('warehouses', params);
      return success(result.data, result.meta);
    }
    if (method === 'POST') {
      const warehouse = { ...data, id: generateId('wh'), createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() };
      mockStorage.create('warehouses', warehouse);
      return success(warehouse);
    }
  },

  // Zones
  '/zones': async (method, url, data, params) => {
    await delay();
    if (method === 'GET') {
      const result = mockStorage.query('zones', params);
      return success(result.data, result.meta);
    }
    if (method === 'POST') {
      const zone = { ...data, id: generateId('zone'), createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() };
      mockStorage.create('zones', zone);
      return success(zone);
    }
  },

  // Racks
  '/racks': async (method, url, data, params) => {
    await delay();
    if (method === 'GET') {
      const result = mockStorage.query('racks', params);
      return success(result.data, result.meta);
    }
    if (method === 'POST') {
      const rack = { ...data, id: generateId('rack'), createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() };
      mockStorage.create('racks', rack);
      return success(rack);
    }
  },

  // Bins
  '/bins': async (method, url, data, params) => {
    await delay();
    if (method === 'GET') {
      const result = mockStorage.query('bins', params);
      return success(result.data, result.meta);
    }
    if (method === 'POST') {
      const bin = { ...data, id: generateId('bin'), createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() };
      mockStorage.create('bins', bin);
      return success(bin);
    }
  },

  // SKUs
  '/skus': async (method, url, data, params) => {
    await delay();
    if (method === 'GET') {
      const result = mockStorage.query('skus', params);
      return success(result.data, result.meta);
    }
    if (method === 'POST') {
      const sku = { ...data, id: generateId('sku'), createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() };
      mockStorage.create('skus', sku);
      return success(sku);
    }
  },

  // Stock Levels
  '/stock-levels': async (method, url, data, params) => {
    await delay();
    const result = mockStorage.query('stockLevels', params);
    return success(result.data, result.meta);
  },
  '/inventory': async (method, url, data, params) => {
    await delay();
    const result = mockStorage.query('stockLevels', params);
    return success(result.data, result.meta);
  },

  // Batches
  '/batches': async (method, url, data, params) => {
    await delay();
    if (method === 'GET') {
      const result = mockStorage.query('batches', params);
      return success(result.data, result.meta);
    }
    if (method === 'POST') {
      const batch = { ...data, id: generateId('batch'), createdAt: new Date().toISOString() };
      mockStorage.create('batches', batch);
      return success(batch);
    }
  },

  // Movements
  '/inventory/movements': async (method, url, data, params) => {
    await delay();
    const result = mockStorage.query('movements', params);
    return success(result.data, result.meta);
  },
  '/movements': async (method, url, data, params) => {
    await delay();
    if (method === 'GET') {
      const result = mockStorage.query('movements', params);
      return success(result.data, result.meta);
    }
    if (method === 'POST') {
      const movement = { ...data, id: generateId('mov'), movementNumber: `MOV-${Date.now()}`, timestamp: new Date().toISOString() };
      mockStorage.create('movements', movement);
      return success(movement);
    }
  },

  // Customers
  '/customers': async (method, url, data, params) => {
    await delay();
    if (method === 'GET') {
      const result = mockStorage.query('customers', params);
      return success(result.data, result.meta);
    }
    if (method === 'POST') {
      const customer = { ...data, id: generateId('cust'), createdAt: new Date().toISOString() };
      mockStorage.create('customers', customer);
      return success(customer);
    }
  },

  // Suppliers
  '/suppliers': async (method, url, data, params) => {
    await delay();
    if (method === 'GET') {
      const result = mockStorage.query('suppliers', params);
      return success(result.data, result.meta);
    }
    if (method === 'POST') {
      const supplier = { ...data, id: generateId('sup'), createdAt: new Date().toISOString() };
      mockStorage.create('suppliers', supplier);
      return success(supplier);
    }
  },

  // Purchase Orders
  '/purchase-orders': async (method, url, data, params) => {
    await delay();
    if (method === 'GET') {
      const result = mockStorage.query('purchaseOrders', params);
      return success(result.data, result.meta);
    }
    if (method === 'POST') {
      const po = { ...data, id: generateId('po'), poNumber: `PO-${Date.now()}`, status: 'pending', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() };
      mockStorage.create('purchaseOrders', po);
      return success(po);
    }
  },
  '/purchase-orders/stats': async () => {
    await delay();
    return success(MOCK_PO_STATS);
  },

  // GRN
  '/grn': async (method, url, data, params) => {
    await delay();
    if (method === 'GET') {
      const result = mockStorage.query('grn', params);
      return success(result.data, result.meta);
    }
    if (method === 'POST') {
      const grn = { ...data, id: generateId('grn'), grnNumber: `GRN-${Date.now()}`, status: 'pending', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() };
      mockStorage.create('grn', grn);
      return success(grn);
    }
  },

  // QC Inspections
  '/qc': async (method, url, data, params) => {
    await delay();
    if (method === 'GET') {
      const result = mockStorage.query('qcInspections', params);
      return success(result.data, result.meta);
    }
    if (method === 'POST') {
      const qc = { ...data, id: generateId('qc'), qcNumber: `QC-${Date.now()}`, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() };
      mockStorage.create('qcInspections', qc);
      return success(qc);
    }
  },
  '/qc-inspections': async (method, url, data, params) => {
    await delay();
    const result = mockStorage.query('qcInspections', params);
    return success(result.data, result.meta);
  },

  // Sales Orders
  '/sales-orders': async (method, url, data, params) => {
    await delay();
    if (method === 'GET') {
      const result = mockStorage.query('salesOrders', params);
      return success(result.data, result.meta);
    }
    if (method === 'POST') {
      const so = { ...data, id: generateId('so'), soNumber: `SO-${Date.now()}`, status: 'pending', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() };
      mockStorage.create('salesOrders', so);
      return success(so);
    }
  },
  '/sales-orders/stats': async () => {
    await delay();
    return success(MOCK_SO_STATS);
  },

  // Pick Lists
  '/pick-lists': async (method, url, data, params) => {
    await delay();
    if (method === 'GET') {
      const result = mockStorage.query('pickLists', params);
      return success(result.data, result.meta);
    }
    if (method === 'POST') {
      const pl = { ...data, id: generateId('pl'), pickListNumber: `PL-${Date.now()}`, status: 'pending', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() };
      mockStorage.create('pickLists', pl);
      return success(pl);
    }
  },

  // Shipments
  '/shipments': async (method, url, data, params) => {
    await delay();
    if (method === 'GET') {
      const result = mockStorage.query('shipments', params);
      return success(result.data, result.meta);
    }
    if (method === 'POST') {
      const ship = { ...data, id: generateId('ship'), shipmentNumber: `SHP-${Date.now()}`, status: 'pending', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() };
      mockStorage.create('shipments', ship);
      return success(ship);
    }
  },

  // Returns
  '/returns': async (method, url, data, params) => {
    await delay();
    if (method === 'GET') {
      const result = mockStorage.query('returns', params);
      return success(result.data, result.meta);
    }
    if (method === 'POST') {
      const ret = { ...data, id: generateId('ret'), returnNumber: `RET-${Date.now()}`, status: 'pending', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() };
      mockStorage.create('returns', ret);
      return success(ret);
    }
  },

  // Tasks
  '/tasks': async (method, url, data, params) => {
    await delay();
    if (method === 'GET') {
      const result = mockStorage.query('tasks', params);
      return success(result.data, result.meta);
    }
    if (method === 'POST') {
      const task = { ...data, id: generateId('task'), taskNumber: `TSK-${Date.now()}`, status: 'pending', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() };
      mockStorage.create('tasks', task);
      return success(task);
    }
  },
  '/tasks/stats': async () => {
    await delay();
    return success(MOCK_TASK_STATS);
  },

  // Workflow Templates
  '/workflow-templates': async (method, url, data, params) => {
    await delay();
    if (method === 'GET') {
      const result = mockStorage.query('workflowTemplates', params);
      return success(result.data, result.meta);
    }
    if (method === 'POST') {
      const wft = { ...data, id: generateId('wft'), createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() };
      mockStorage.create('workflowTemplates', wft);
      return success(wft);
    }
  },
  '/workflows/metrics': async () => {
    await delay();
    return success(MOCK_WORKFLOW_METRICS);
  },

  // Task Exceptions
  '/task-exceptions': async (method, url, data, params) => {
    await delay();
    const result = mockStorage.query('taskExceptions', params);
    return success(result.data, result.meta);
  },

  // Alerts
  '/alerts': async (method, url, data, params) => {
    await delay();
    const result = mockStorage.query('alerts', params);
    return success(result.data, result.meta);
  },

  // Adjustments
  '/adjustments': async (method, url, data, params) => {
    await delay();
    if (method === 'GET') {
      const result = mockStorage.query('adjustments', params);
      return success(result.data, result.meta);
    }
    if (method === 'POST') {
      const adj = { ...data, id: generateId('adj'), adjustmentNumber: `ADJ-${Date.now()}`, status: 'pending', requestedAt: new Date().toISOString() };
      mockStorage.create('adjustments', adj);
      return success(adj);
    }
  },

  // Damaged Items
  '/damaged-items': async (method, url, data, params) => {
    await delay();
    if (method === 'GET') {
      const result = mockStorage.query('damagedItems', params);
      return success(result.data, result.meta);
    }
    if (method === 'POST') {
      const dmg = { ...data, id: generateId('dmg'), decision: 'pending', createdAt: new Date().toISOString() };
      mockStorage.create('damagedItems', dmg);
      return success(dmg);
    }
  },

  // Users
  '/users': async (method, url, data, params) => {
    await delay();
    if (method === 'GET') {
      const result = mockStorage.query('users', params);
      return success(result.data, result.meta);
    }
    if (method === 'POST') {
      const user = { ...data, id: generateId('user'), status: 'invited', createdAt: new Date().toISOString() };
      mockStorage.create('users', user);
      return success(user);
    }
  },
  '/users/stats': async () => {
    await delay();
    return success(MOCK_USER_STATS);
  },

  // Invoices
  '/invoices': async (method, url, data, params) => {
    await delay();
    if (method === 'GET') {
      const result = mockStorage.query('invoices', params);
      return success(result.data, result.meta);
    }
    if (method === 'POST') {
      const inv = { ...data, id: generateId('inv'), invoiceNumber: `INV-${Date.now()}`, status: 'pending', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() };
      mockStorage.create('invoices', inv);
      return success(inv);
    }
  },
  '/invoices/stats': async () => {
    await delay();
    return success(MOCK_INVOICE_STATS);
  },

  // Reports
  '/reports/stock': async () => {
    await delay();
    return success(MOCK_STOCK_REPORT);
  },
  '/reports/movements': async () => {
    await delay();
    return success(MOCK_MOVEMENT_REPORT);
  },
  '/reports/purchase-register': async () => {
    await delay();
    return success(MOCK_PURCHASE_REGISTER);
  },
  '/reports/sales-register': async () => {
    await delay();
    return success(MOCK_SALES_REGISTER);
  },
  '/reports/expiry': async () => {
    await delay();
    return success(MOCK_EXPIRY_REPORT);
  },
  '/reports/low-stock': async () => {
    await delay();
    return success(MOCK_LOW_STOCK_REPORT);
  },
  '/reports/warehouse-utilization': async () => {
    await delay();
    return success(MOCK_WAREHOUSE_UTILIZATION_REPORT);
  },
  '/reports/audit-trail': async () => {
    await delay();
    return success(MOCK_AUDIT_TRAIL);
  },
  '/reports/inventory': async () => {
    await delay();
    return success(MOCK_STOCK_REPORT);
  },
};

// Handle dynamic routes (e.g., /warehouses/:id)
function findHandler(url: string): { handler: any; id?: string } | null {
  // Strip /api/v1 prefix so handlers work with both prefixed and unprefixed paths
  const normalizedUrl = url.replace(/^\/api\/v1/, '');

  // Direct match (try normalized first, then original)
  if (handlers[normalizedUrl]) {
    return { handler: handlers[normalizedUrl] };
  }
  if (handlers[url]) {
    return { handler: handlers[url] };
  }

  // Pattern match for /:id routes
  const patterns = [
    { pattern: /^\/warehouses\/([^/]+)$/, collection: 'warehouses' },
    { pattern: /^\/zones\/([^/]+)$/, collection: 'zones' },
    { pattern: /^\/racks\/([^/]+)$/, collection: 'racks' },
    { pattern: /^\/bins\/([^/]+)$/, collection: 'bins' },
    { pattern: /^\/skus\/([^/]+)$/, collection: 'skus' },
    { pattern: /^\/customers\/([^/]+)$/, collection: 'customers' },
    { pattern: /^\/suppliers\/([^/]+)$/, collection: 'suppliers' },
    { pattern: /^\/purchase-orders\/([^/]+)$/, collection: 'purchaseOrders' },
    { pattern: /^\/grn\/([^/]+)$/, collection: 'grn' },
    { pattern: /^\/qc\/([^/]+)$/, collection: 'qcInspections' },
    { pattern: /^\/sales-orders\/([^/]+)$/, collection: 'salesOrders' },
    { pattern: /^\/pick-lists\/([^/]+)$/, collection: 'pickLists' },
    { pattern: /^\/shipments\/([^/]+)$/, collection: 'shipments' },
    { pattern: /^\/returns\/([^/]+)$/, collection: 'returns' },
    { pattern: /^\/tasks\/([^/]+)$/, collection: 'tasks' },
    { pattern: /^\/users\/([^/]+)$/, collection: 'users' },
    { pattern: /^\/invoices\/([^/]+)$/, collection: 'invoices' },
    { pattern: /^\/adjustments\/([^/]+)$/, collection: 'adjustments' },
    { pattern: /^\/damaged-items\/([^/]+)$/, collection: 'damagedItems' },
    { pattern: /^\/alerts\/([^/]+)$/, collection: 'alerts' },
  ];

  for (const { pattern, collection } of patterns) {
    const match = normalizedUrl.match(pattern);
    if (match) {
      const id = match[1];
      // Skip action routes like /submit, /approve, etc.
      if (['submit', 'approve', 'cancel', 'complete', 'acknowledge'].includes(id)) {
        return {
          handler: async (method: string) => {
            await delay();
            return success({ message: 'Action completed' });
          }
        };
      }
      return {
        handler: async (method: string, _url: string, data?: any) => {
          await delay();
          if (method === 'GET') {
            const item = mockStorage.getById(collection as any, id);
            return item ? success(item) : error('Not found', 'NOT_FOUND');
          }
          if (method === 'PUT' || method === 'PATCH') {
            const updated = mockStorage.update(collection as any, id, data);
            return updated ? success(updated) : error('Not found', 'NOT_FOUND');
          }
          if (method === 'DELETE') {
            const deleted = mockStorage.delete(collection as any, id);
            return deleted ? success({ message: 'Deleted' }) : error('Not found', 'NOT_FOUND');
          }
        },
        id,
      };
    }
  }

  return null;
}

export const mockApi = {
  async get(url: string, config?: { params?: any }) {
    const result = findHandler(url);
    if (result) {
      const response = await result.handler('GET', url, undefined, config?.params);
      return { data: response };
    }
    console.warn(`[MockAPI] No handler for GET ${url}`);
    return { data: success([]) };
  },

  async post(url: string, data?: any) {
    const result = findHandler(url);
    if (result) {
      const response = await result.handler('POST', url, data);
      return { data: response };
    }
    console.warn(`[MockAPI] No handler for POST ${url}`);
    return { data: success(data) };
  },

  async put(url: string, data?: any) {
    const result = findHandler(url);
    if (result) {
      const response = await result.handler('PUT', url, data);
      return { data: response };
    }
    console.warn(`[MockAPI] No handler for PUT ${url}`);
    return { data: success(data) };
  },

  async patch(url: string, data?: any) {
    const result = findHandler(url);
    if (result) {
      const response = await result.handler('PATCH', url, data);
      return { data: response };
    }
    console.warn(`[MockAPI] No handler for PATCH ${url}`);
    return { data: success(data) };
  },

  async delete(url: string) {
    const result = findHandler(url);
    if (result) {
      const response = await result.handler('DELETE', url);
      return { data: response };
    }
    console.warn(`[MockAPI] No handler for DELETE ${url}`);
    return { data: success({ message: 'Deleted' }) };
  },
};

export default mockApi;
