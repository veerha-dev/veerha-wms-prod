// Mock Storage Service - LocalStorage persistence layer

const STORAGE_KEY = 'veerha_wms_mock_data';
const STORAGE_VERSION = '5.0.0'; // Bumped to force refresh after fixing hook return formats

import {
  MOCK_WAREHOUSES,
  MOCK_ZONES,
  MOCK_RACKS,
  MOCK_BINS,
  MOCK_SKUS,
  MOCK_STOCK_LEVELS,
  MOCK_BATCHES,
  MOCK_MOVEMENTS,
  MOCK_DAMAGED_ITEMS,
  MOCK_ADJUSTMENTS,
  MOCK_ALERTS,
  MOCK_CUSTOMERS,
  MOCK_SUPPLIERS,
  MOCK_PURCHASE_ORDERS,
  MOCK_GRN,
  MOCK_QC_INSPECTIONS,
  MOCK_SALES_ORDERS,
  MOCK_PICK_LISTS,
  MOCK_SHIPMENTS,
  MOCK_RETURNS,
  MOCK_TASKS,
  MOCK_WORKFLOW_TEMPLATES,
  MOCK_TASK_EXCEPTIONS,
  MOCK_USERS,
  MOCK_INVOICES,
} from '../data';

export interface MockDataStore {
  _version: string;
  _lastUpdated: string;
  warehouses: any[];
  zones: any[];
  racks: any[];
  bins: any[];
  skus: any[];
  stockLevels: any[];
  batches: any[];
  movements: any[];
  damagedItems: any[];
  adjustments: any[];
  alerts: any[];
  customers: any[];
  suppliers: any[];
  purchaseOrders: any[];
  grn: any[];
  qcInspections: any[];
  salesOrders: any[];
  pickLists: any[];
  shipments: any[];
  returns: any[];
  tasks: any[];
  workflowTemplates: any[];
  taskExceptions: any[];
  users: any[];
  invoices: any[];
}

function getInitialData(): MockDataStore {
  return {
    _version: STORAGE_VERSION,
    _lastUpdated: new Date().toISOString(),
    warehouses: [...MOCK_WAREHOUSES],
    zones: [...MOCK_ZONES],
    racks: [...MOCK_RACKS],
    bins: [...MOCK_BINS],
    skus: [...MOCK_SKUS],
    stockLevels: [...MOCK_STOCK_LEVELS],
    batches: [...MOCK_BATCHES],
    movements: [...MOCK_MOVEMENTS],
    damagedItems: [...MOCK_DAMAGED_ITEMS],
    adjustments: [...MOCK_ADJUSTMENTS],
    alerts: [...MOCK_ALERTS],
    customers: [...MOCK_CUSTOMERS],
    suppliers: [...MOCK_SUPPLIERS],
    purchaseOrders: [...MOCK_PURCHASE_ORDERS],
    grn: [...MOCK_GRN],
    qcInspections: [...MOCK_QC_INSPECTIONS],
    salesOrders: [...MOCK_SALES_ORDERS],
    pickLists: [...MOCK_PICK_LISTS],
    shipments: [...MOCK_SHIPMENTS],
    returns: [...MOCK_RETURNS],
    tasks: [...MOCK_TASKS],
    workflowTemplates: [...MOCK_WORKFLOW_TEMPLATES],
    taskExceptions: [...MOCK_TASK_EXCEPTIONS],
    users: [...MOCK_USERS],
    invoices: [...MOCK_INVOICES],
  };
}

class MockStorageService {
  private data: MockDataStore;

  constructor() {
    this.data = this.load();
  }

  private load(): MockDataStore {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed._version === STORAGE_VERSION) {
          return parsed;
        }
      }
    } catch (e) {
      console.warn('Failed to load mock data from localStorage:', e);
    }
    return getInitialData();
  }

  private save(): void {
    try {
      this.data._lastUpdated = new Date().toISOString();
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.data));
    } catch (e) {
      console.warn('Failed to save mock data to localStorage:', e);
    }
  }

  reset(): void {
    this.data = getInitialData();
    this.save();
  }

  // Generic CRUD operations
  getAll<T>(collection: keyof Omit<MockDataStore, '_version' | '_lastUpdated'>): T[] {
    return this.data[collection] as T[];
  }

  getById<T extends { id: string }>(collection: keyof Omit<MockDataStore, '_version' | '_lastUpdated'>, id: string): T | undefined {
    const items = this.data[collection] as T[];
    return items.find(item => item.id === id);
  }

  create<T extends { id: string }>(collection: keyof Omit<MockDataStore, '_version' | '_lastUpdated'>, item: T): T {
    (this.data[collection] as T[]).push(item);
    this.save();
    return item;
  }

  update<T extends { id: string }>(collection: keyof Omit<MockDataStore, '_version' | '_lastUpdated'>, id: string, updates: Partial<T>): T | undefined {
    const items = this.data[collection] as T[];
    const index = items.findIndex(item => item.id === id);
    if (index !== -1) {
      items[index] = { ...items[index], ...updates, updatedAt: new Date().toISOString() };
      this.save();
      return items[index];
    }
    return undefined;
  }

  delete(collection: keyof Omit<MockDataStore, '_version' | '_lastUpdated'>, id: string): boolean {
    const items = this.data[collection] as { id: string }[];
    const index = items.findIndex(item => item.id === id);
    if (index !== -1) {
      items.splice(index, 1);
      this.save();
      return true;
    }
    return false;
  }

  // Query with filters
  query<T>(
    collection: keyof Omit<MockDataStore, '_version' | '_lastUpdated'>,
    filters?: Record<string, any>,
    options?: { page?: number; limit?: number; sort?: string; order?: 'asc' | 'desc' }
  ): { data: T[]; meta: { total: number; page: number; limit: number; totalPages: number } } {
    let items = [...(this.data[collection] as T[])];

    // Apply filters
    if (filters) {
      items = items.filter(item => {
        return Object.entries(filters).every(([key, value]) => {
          if (value === undefined || value === null || value === '') return true;
          const itemValue = (item as any)[key];
          if (typeof value === 'string' && typeof itemValue === 'string') {
            return itemValue.toLowerCase().includes(value.toLowerCase());
          }
          return itemValue === value;
        });
      });
    }

    // Apply sorting
    if (options?.sort) {
      const sortKey = options.sort;
      const order = options.order === 'desc' ? -1 : 1;
      items.sort((a, b) => {
        const aVal = (a as any)[sortKey];
        const bVal = (b as any)[sortKey];
        if (aVal < bVal) return -1 * order;
        if (aVal > bVal) return 1 * order;
        return 0;
      });
    }

    const total = items.length;
    const page = options?.page || 1;
    const limit = options?.limit || 50;
    const totalPages = Math.ceil(total / limit);

    // Apply pagination
    const start = (page - 1) * limit;
    const paginatedItems = items.slice(start, start + limit);

    return {
      data: paginatedItems,
      meta: { total, page, limit, totalPages },
    };
  }
}

export const mockStorage = new MockStorageService();
