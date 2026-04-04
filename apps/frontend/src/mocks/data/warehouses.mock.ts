// Mock Warehouse Data

export const MOCK_WAREHOUSES = [
  {
    id: 'wh-001',
    tenantId: 'tenant-001',
    code: 'WH-CBE',
    name: 'Coimbatore Main Warehouse',
    type: 'distribution',
    status: 'active',
    address: '123 Industrial Area, SIDCO',
    city: 'Coimbatore',
    state: 'Tamil Nadu',
    country: 'India',
    pincode: '641021',
    phone: '+91 422 2345678',
    email: 'cbe@veerha.com',
    managerId: 'user-001',
    managerName: 'Demo Admin',
    operationalHours: '08:00 - 20:00',
    totalArea: 50000,
    usableArea: 45000,
    capacity: 10000,
    utilization: 68,
    zoneCount: 4,
    rackCount: 24,
    binCount: 480,
    createdAt: new Date('2024-01-15').toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'wh-002',
    tenantId: 'tenant-001',
    code: 'WH-CHN',
    name: 'Chennai Distribution Center',
    type: 'fulfillment',
    status: 'active',
    address: '456 Logistics Park, Ambattur',
    city: 'Chennai',
    state: 'Tamil Nadu',
    country: 'India',
    pincode: '600053',
    phone: '+91 44 2345678',
    email: 'chn@veerha.com',
    managerId: 'user-002',
    managerName: 'Manager User',
    operationalHours: '06:00 - 22:00',
    totalArea: 75000,
    usableArea: 70000,
    capacity: 15000,
    utilization: 72,
    zoneCount: 6,
    rackCount: 36,
    binCount: 720,
    createdAt: new Date('2024-02-01').toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'wh-003',
    tenantId: 'tenant-001',
    code: 'WH-MDU',
    name: 'Madurai Storage Facility',
    type: 'storage',
    status: 'active',
    address: '789 Industrial Estate, Kappalur',
    city: 'Madurai',
    state: 'Tamil Nadu',
    country: 'India',
    pincode: '625008',
    phone: '+91 452 2345678',
    email: 'mdu@veerha.com',
    managerId: 'user-003',
    managerName: 'Worker User',
    operationalHours: '09:00 - 18:00',
    totalArea: 30000,
    usableArea: 27000,
    capacity: 6000,
    utilization: 45,
    zoneCount: 3,
    rackCount: 18,
    binCount: 360,
    createdAt: new Date('2024-03-01').toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

export const MOCK_ZONES = [
  // Coimbatore Warehouse Zones
  { id: 'zone-001', warehouseId: 'wh-001', code: 'RCV-01', name: 'Receiving Zone', type: 'receiving', color: '#f59e0b', position: { x: 0, y: 0 }, dimensions: { width: 100, height: 50 }, capacityWeight: 5000, capacityVolume: 1000, currentWeight: 2500, currentVolume: 500, utilization: 50, rackCount: 4, binCount: 80, occupiedBins: 40, isActive: true, isLocked: false, createdAt: new Date('2024-01-15').toISOString(), updatedAt: new Date().toISOString() },
  { id: 'zone-002', warehouseId: 'wh-001', code: 'STR-01', name: 'Storage Zone A', type: 'storage', color: '#22c55e', position: { x: 100, y: 0 }, dimensions: { width: 200, height: 100 }, capacityWeight: 20000, capacityVolume: 5000, currentWeight: 14000, currentVolume: 3500, utilization: 70, rackCount: 12, binCount: 240, occupiedBins: 168, isActive: true, isLocked: false, createdAt: new Date('2024-01-15').toISOString(), updatedAt: new Date().toISOString() },
  { id: 'zone-003', warehouseId: 'wh-001', code: 'PCK-01', name: 'Picking Zone', type: 'picking', color: '#3b82f6', position: { x: 0, y: 50 }, dimensions: { width: 100, height: 50 }, capacityWeight: 3000, capacityVolume: 800, currentWeight: 2100, currentVolume: 560, utilization: 70, rackCount: 4, binCount: 80, occupiedBins: 56, isActive: true, isLocked: false, createdAt: new Date('2024-01-15').toISOString(), updatedAt: new Date().toISOString() },
  { id: 'zone-004', warehouseId: 'wh-001', code: 'SHP-01', name: 'Shipping Zone', type: 'shipping', color: '#8b5cf6', position: { x: 100, y: 100 }, dimensions: { width: 100, height: 50 }, capacityWeight: 4000, capacityVolume: 1000, currentWeight: 2800, currentVolume: 700, utilization: 70, rackCount: 4, binCount: 80, occupiedBins: 56, isActive: true, isLocked: false, createdAt: new Date('2024-01-15').toISOString(), updatedAt: new Date().toISOString() },
  // Chennai Warehouse Zones
  { id: 'zone-005', warehouseId: 'wh-002', code: 'RCV-02', name: 'Receiving Dock', type: 'receiving', color: '#f59e0b', position: { x: 0, y: 0 }, dimensions: { width: 120, height: 60 }, capacityWeight: 8000, capacityVolume: 2000, currentWeight: 5600, currentVolume: 1400, utilization: 70, rackCount: 6, binCount: 120, occupiedBins: 84, isActive: true, isLocked: false, createdAt: new Date('2024-02-01').toISOString(), updatedAt: new Date().toISOString() },
  { id: 'zone-006', warehouseId: 'wh-002', code: 'STR-02', name: 'Main Storage', type: 'storage', color: '#22c55e', position: { x: 120, y: 0 }, dimensions: { width: 250, height: 150 }, capacityWeight: 30000, capacityVolume: 8000, currentWeight: 21600, currentVolume: 5760, utilization: 72, rackCount: 18, binCount: 360, occupiedBins: 259, isActive: true, isLocked: false, createdAt: new Date('2024-02-01').toISOString(), updatedAt: new Date().toISOString() },
  { id: 'zone-007', warehouseId: 'wh-002', code: 'CLD-01', name: 'Cold Storage', type: 'cold-storage', color: '#06b6d4', position: { x: 0, y: 60 }, dimensions: { width: 80, height: 80 }, capacityWeight: 5000, capacityVolume: 1200, currentWeight: 3500, currentVolume: 840, utilization: 70, rackCount: 4, binCount: 80, occupiedBins: 56, isActive: true, isLocked: false, createdAt: new Date('2024-02-01').toISOString(), updatedAt: new Date().toISOString() },
  { id: 'zone-008', warehouseId: 'wh-002', code: 'PCK-02', name: 'Packing Area', type: 'packing', color: '#a855f7', position: { x: 80, y: 60 }, dimensions: { width: 100, height: 60 }, capacityWeight: 4000, capacityVolume: 1000, currentWeight: 2800, currentVolume: 700, utilization: 70, rackCount: 4, binCount: 80, occupiedBins: 56, isActive: true, isLocked: false, createdAt: new Date('2024-02-01').toISOString(), updatedAt: new Date().toISOString() },
  { id: 'zone-009', warehouseId: 'wh-002', code: 'SHP-02', name: 'Shipping Bay', type: 'shipping', color: '#8b5cf6', position: { x: 180, y: 60 }, dimensions: { width: 100, height: 60 }, capacityWeight: 6000, capacityVolume: 1500, currentWeight: 4200, currentVolume: 1050, utilization: 70, rackCount: 4, binCount: 80, occupiedBins: 56, isActive: true, isLocked: false, createdAt: new Date('2024-02-01').toISOString(), updatedAt: new Date().toISOString() },
  // Madurai Warehouse Zones
  { id: 'zone-010', warehouseId: 'wh-003', code: 'RCV-03', name: 'Receiving Area', type: 'receiving', color: '#f59e0b', position: { x: 0, y: 0 }, dimensions: { width: 80, height: 40 }, capacityWeight: 3000, capacityVolume: 800, currentWeight: 1350, currentVolume: 360, utilization: 45, rackCount: 4, binCount: 80, occupiedBins: 36, isActive: true, isLocked: false, createdAt: new Date('2024-03-01').toISOString(), updatedAt: new Date().toISOString() },
  { id: 'zone-011', warehouseId: 'wh-003', code: 'STR-03', name: 'Storage Area', type: 'storage', color: '#22c55e', position: { x: 80, y: 0 }, dimensions: { width: 150, height: 80 }, capacityWeight: 15000, capacityVolume: 4000, currentWeight: 6750, currentVolume: 1800, utilization: 45, rackCount: 10, binCount: 200, occupiedBins: 90, isActive: true, isLocked: false, createdAt: new Date('2024-03-01').toISOString(), updatedAt: new Date().toISOString() },
  { id: 'zone-012', warehouseId: 'wh-003', code: 'SHP-03', name: 'Dispatch Zone', type: 'shipping', color: '#8b5cf6', position: { x: 0, y: 40 }, dimensions: { width: 80, height: 40 }, capacityWeight: 3000, capacityVolume: 800, currentWeight: 1350, currentVolume: 360, utilization: 45, rackCount: 4, binCount: 80, occupiedBins: 36, isActive: true, isLocked: false, createdAt: new Date('2024-03-01').toISOString(), updatedAt: new Date().toISOString() },
];

export const MOCK_RACKS = [
  // Zone 001 Racks (Receiving - Coimbatore)
  { id: 'rack-001', zoneId: 'zone-001', warehouseId: 'wh-001', code: 'R-RCV-A1', name: 'Receiving Rack A1', orientation: 'horizontal', position: { x: 10, y: 10, row: 1, column: 1 }, levels: 4, binsPerLevel: 5, maxWeight: 1000, currentWeight: 500, isPickFace: false, isReserve: false, utilization: 50, isActive: true, isLocked: false, createdAt: new Date('2024-01-15').toISOString(), updatedAt: new Date().toISOString() },
  { id: 'rack-002', zoneId: 'zone-001', warehouseId: 'wh-001', code: 'R-RCV-A2', name: 'Receiving Rack A2', orientation: 'horizontal', position: { x: 30, y: 10, row: 1, column: 2 }, levels: 4, binsPerLevel: 5, maxWeight: 1000, currentWeight: 600, isPickFace: false, isReserve: false, utilization: 60, isActive: true, isLocked: false, createdAt: new Date('2024-01-15').toISOString(), updatedAt: new Date().toISOString() },
  { id: 'rack-003', zoneId: 'zone-001', warehouseId: 'wh-001', code: 'R-RCV-B1', name: 'Receiving Rack B1', orientation: 'horizontal', position: { x: 10, y: 25, row: 2, column: 1 }, levels: 4, binsPerLevel: 5, maxWeight: 1000, currentWeight: 450, isPickFace: false, isReserve: false, utilization: 45, isActive: true, isLocked: false, createdAt: new Date('2024-01-15').toISOString(), updatedAt: new Date().toISOString() },
  { id: 'rack-004', zoneId: 'zone-001', warehouseId: 'wh-001', code: 'R-RCV-B2', name: 'Receiving Rack B2', orientation: 'horizontal', position: { x: 30, y: 25, row: 2, column: 2 }, levels: 4, binsPerLevel: 5, maxWeight: 1000, currentWeight: 550, isPickFace: false, isReserve: false, utilization: 55, isActive: true, isLocked: false, createdAt: new Date('2024-01-15').toISOString(), updatedAt: new Date().toISOString() },
  
  // Zone 002 Racks (Storage Zone A - Coimbatore)
  { id: 'rack-005', zoneId: 'zone-002', warehouseId: 'wh-001', code: 'R-STR-A1', name: 'Storage Rack A1', orientation: 'vertical', position: { x: 10, y: 10, row: 1, column: 1 }, levels: 5, binsPerLevel: 4, maxWeight: 2000, currentWeight: 1400, isPickFace: false, isReserve: true, utilization: 70, isActive: true, isLocked: false, createdAt: new Date('2024-01-15').toISOString(), updatedAt: new Date().toISOString() },
  { id: 'rack-006', zoneId: 'zone-002', warehouseId: 'wh-001', code: 'R-STR-A2', name: 'Storage Rack A2', orientation: 'vertical', position: { x: 30, y: 10, row: 1, column: 2 }, levels: 5, binsPerLevel: 4, maxWeight: 2000, currentWeight: 1500, isPickFace: false, isReserve: true, utilization: 75, isActive: true, isLocked: false, createdAt: new Date('2024-01-15').toISOString(), updatedAt: new Date().toISOString() },
  { id: 'rack-007', zoneId: 'zone-002', warehouseId: 'wh-001', code: 'R-STR-A3', name: 'Storage Rack A3', orientation: 'vertical', position: { x: 50, y: 10, row: 1, column: 3 }, levels: 5, binsPerLevel: 4, maxWeight: 2000, currentWeight: 1300, isPickFace: false, isReserve: true, utilization: 65, isActive: true, isLocked: false, createdAt: new Date('2024-01-15').toISOString(), updatedAt: new Date().toISOString() },
  { id: 'rack-008', zoneId: 'zone-002', warehouseId: 'wh-001', code: 'R-STR-B1', name: 'Storage Rack B1', orientation: 'vertical', position: { x: 10, y: 40, row: 2, column: 1 }, levels: 5, binsPerLevel: 4, maxWeight: 2000, currentWeight: 1600, isPickFace: false, isReserve: true, utilization: 80, isActive: true, isLocked: false, createdAt: new Date('2024-01-15').toISOString(), updatedAt: new Date().toISOString() },
  { id: 'rack-009', zoneId: 'zone-002', warehouseId: 'wh-001', code: 'R-STR-B2', name: 'Storage Rack B2', orientation: 'vertical', position: { x: 30, y: 40, row: 2, column: 2 }, levels: 5, binsPerLevel: 4, maxWeight: 2000, currentWeight: 1200, isPickFace: false, isReserve: true, utilization: 60, isActive: true, isLocked: false, createdAt: new Date('2024-01-15').toISOString(), updatedAt: new Date().toISOString() },
  { id: 'rack-010', zoneId: 'zone-002', warehouseId: 'wh-001', code: 'R-STR-B3', name: 'Storage Rack B3', orientation: 'vertical', position: { x: 50, y: 40, row: 2, column: 3 }, levels: 5, binsPerLevel: 4, maxWeight: 2000, currentWeight: 1100, isPickFace: false, isReserve: true, utilization: 55, isActive: true, isLocked: false, createdAt: new Date('2024-01-15').toISOString(), updatedAt: new Date().toISOString() },
  
  // Zone 003 Racks (Picking Zone - Coimbatore)
  { id: 'rack-011', zoneId: 'zone-003', warehouseId: 'wh-001', code: 'R-PCK-A1', name: 'Pick Rack A1', orientation: 'horizontal', position: { x: 10, y: 10, row: 1, column: 1 }, levels: 3, binsPerLevel: 6, maxWeight: 800, currentWeight: 560, isPickFace: true, isReserve: false, utilization: 70, isActive: true, isLocked: false, createdAt: new Date('2024-01-15').toISOString(), updatedAt: new Date().toISOString() },
  { id: 'rack-012', zoneId: 'zone-003', warehouseId: 'wh-001', code: 'R-PCK-A2', name: 'Pick Rack A2', orientation: 'horizontal', position: { x: 30, y: 10, row: 1, column: 2 }, levels: 3, binsPerLevel: 6, maxWeight: 800, currentWeight: 480, isPickFace: true, isReserve: false, utilization: 60, isActive: true, isLocked: false, createdAt: new Date('2024-01-15').toISOString(), updatedAt: new Date().toISOString() },
  
  // Zone 004 Racks (Shipping Zone - Coimbatore)
  { id: 'rack-013', zoneId: 'zone-004', warehouseId: 'wh-001', code: 'R-SHP-A1', name: 'Shipping Rack A1', orientation: 'horizontal', position: { x: 10, y: 10, row: 1, column: 1 }, levels: 2, binsPerLevel: 8, maxWeight: 1500, currentWeight: 900, isPickFace: false, isReserve: false, utilization: 60, isActive: true, isLocked: false, createdAt: new Date('2024-01-15').toISOString(), updatedAt: new Date().toISOString() },
  { id: 'rack-014', zoneId: 'zone-004', warehouseId: 'wh-001', code: 'R-SHP-A2', name: 'Shipping Rack A2', orientation: 'horizontal', position: { x: 35, y: 10, row: 1, column: 2 }, levels: 2, binsPerLevel: 8, maxWeight: 1500, currentWeight: 750, isPickFace: false, isReserve: false, utilization: 50, isActive: true, isLocked: false, createdAt: new Date('2024-01-15').toISOString(), updatedAt: new Date().toISOString() },
];

export const MOCK_BINS = [
  // Receiving Zone - Rack 001 Bins (Electronics)
  { id: 'bin-001', rackId: 'rack-001', zoneId: 'zone-001', warehouseId: 'wh-001', code: 'RCV-A1-L1-P1', level: 1, position: 1, dimensions: { width: 50, height: 40, depth: 60 }, maxWeight: 50, maxVolume: 120, currentWeight: 25, currentVolume: 60, palletCompatible: false, status: 'partial', skuId: 'sku-001', skuCode: 'SKU-ELEC-001', skuName: 'Wireless Mouse', quantity: 50, isLocked: false, createdAt: new Date('2024-01-15').toISOString(), updatedAt: new Date().toISOString() },
  { id: 'bin-002', rackId: 'rack-001', zoneId: 'zone-001', warehouseId: 'wh-001', code: 'RCV-A1-L1-P2', level: 1, position: 2, dimensions: { width: 50, height: 40, depth: 60 }, maxWeight: 50, maxVolume: 120, currentWeight: 0, currentVolume: 0, palletCompatible: false, status: 'empty', isLocked: false, createdAt: new Date('2024-01-15').toISOString(), updatedAt: new Date().toISOString() },
  { id: 'bin-003', rackId: 'rack-001', zoneId: 'zone-001', warehouseId: 'wh-001', code: 'RCV-A1-L2-P1', level: 2, position: 1, dimensions: { width: 50, height: 40, depth: 60 }, maxWeight: 50, maxVolume: 120, currentWeight: 45, currentVolume: 100, palletCompatible: false, status: 'full', skuId: 'sku-002', skuCode: 'SKU-ELEC-002', skuName: 'USB Keyboard', quantity: 30, isLocked: false, createdAt: new Date('2024-01-15').toISOString(), updatedAt: new Date().toISOString() },
  { id: 'bin-004', rackId: 'rack-001', zoneId: 'zone-001', warehouseId: 'wh-001', code: 'RCV-A1-L2-P2', level: 2, position: 2, dimensions: { width: 50, height: 40, depth: 60 }, maxWeight: 50, maxVolume: 120, currentWeight: 20, currentVolume: 40, palletCompatible: false, status: 'partial', skuId: 'sku-003', skuCode: 'SKU-ELEC-003', skuName: 'HDMI Cable', quantity: 100, isLocked: false, createdAt: new Date('2024-01-15').toISOString(), updatedAt: new Date().toISOString() },
  { id: 'bin-005', rackId: 'rack-001', zoneId: 'zone-001', warehouseId: 'wh-001', code: 'RCV-A1-L3-P1', level: 3, position: 1, dimensions: { width: 50, height: 40, depth: 60 }, maxWeight: 50, maxVolume: 120, currentWeight: 30, currentVolume: 70, palletCompatible: false, status: 'partial', skuId: 'sku-004', skuCode: 'SKU-OFF-001', skuName: 'A4 Paper Ream', quantity: 20, isLocked: false, createdAt: new Date('2024-01-15').toISOString(), updatedAt: new Date().toISOString() },
  { id: 'bin-006', rackId: 'rack-001', zoneId: 'zone-001', warehouseId: 'wh-001', code: 'RCV-A1-L3-P2', level: 3, position: 2, dimensions: { width: 50, height: 40, depth: 60 }, maxWeight: 50, maxVolume: 120, currentWeight: 0, currentVolume: 0, palletCompatible: false, status: 'empty', isLocked: false, createdAt: new Date('2024-01-15').toISOString(), updatedAt: new Date().toISOString() },
  
  // Receiving Zone - Rack 002 Bins
  { id: 'bin-007', rackId: 'rack-002', zoneId: 'zone-001', warehouseId: 'wh-001', code: 'RCV-A2-L1-P1', level: 1, position: 1, dimensions: { width: 50, height: 40, depth: 60 }, maxWeight: 50, maxVolume: 120, currentWeight: 35, currentVolume: 80, palletCompatible: false, status: 'partial', skuId: 'sku-001', skuCode: 'SKU-ELEC-001', skuName: 'Wireless Mouse', quantity: 35, isLocked: false, createdAt: new Date('2024-01-15').toISOString(), updatedAt: new Date().toISOString() },
  { id: 'bin-008', rackId: 'rack-002', zoneId: 'zone-001', warehouseId: 'wh-001', code: 'RCV-A2-L1-P2', level: 1, position: 2, dimensions: { width: 50, height: 40, depth: 60 }, maxWeight: 50, maxVolume: 120, currentWeight: 48, currentVolume: 115, palletCompatible: false, status: 'full', skuId: 'sku-003', skuCode: 'SKU-ELEC-003', skuName: 'HDMI Cable', quantity: 150, isLocked: false, createdAt: new Date('2024-01-15').toISOString(), updatedAt: new Date().toISOString() },
  { id: 'bin-009', rackId: 'rack-002', zoneId: 'zone-001', warehouseId: 'wh-001', code: 'RCV-A2-L2-P1', level: 2, position: 1, dimensions: { width: 50, height: 40, depth: 60 }, maxWeight: 50, maxVolume: 120, currentWeight: 0, currentVolume: 0, palletCompatible: false, status: 'empty', isLocked: false, createdAt: new Date('2024-01-15').toISOString(), updatedAt: new Date().toISOString() },
  
  // Storage Zone A - Rack 005 Bins (Furniture)
  { id: 'bin-010', rackId: 'rack-005', zoneId: 'zone-002', warehouseId: 'wh-001', code: 'STR-A1-L1-P1', level: 1, position: 1, dimensions: { width: 100, height: 80, depth: 120 }, maxWeight: 200, maxVolume: 960, currentWeight: 150, currentVolume: 720, palletCompatible: true, status: 'partial', skuId: 'sku-005', skuCode: 'SKU-FRN-001', skuName: 'Office Chair', quantity: 5, isLocked: false, createdAt: new Date('2024-01-15').toISOString(), updatedAt: new Date().toISOString() },
  { id: 'bin-011', rackId: 'rack-005', zoneId: 'zone-002', warehouseId: 'wh-001', code: 'STR-A1-L2-P1', level: 2, position: 1, dimensions: { width: 100, height: 80, depth: 120 }, maxWeight: 200, maxVolume: 960, currentWeight: 180, currentVolume: 850, palletCompatible: true, status: 'full', skuId: 'sku-006', skuCode: 'SKU-FRN-002', skuName: 'Standing Desk', quantity: 3, isLocked: false, createdAt: new Date('2024-01-15').toISOString(), updatedAt: new Date().toISOString() },
  { id: 'bin-012', rackId: 'rack-005', zoneId: 'zone-002', warehouseId: 'wh-001', code: 'STR-A1-L3-P1', level: 3, position: 1, dimensions: { width: 100, height: 80, depth: 120 }, maxWeight: 200, maxVolume: 960, currentWeight: 0, currentVolume: 0, palletCompatible: true, status: 'reserved', isLocked: true, lockReason: 'Reserved for incoming PO', createdAt: new Date('2024-01-15').toISOString(), updatedAt: new Date().toISOString() },
  { id: 'bin-013', rackId: 'rack-005', zoneId: 'zone-002', warehouseId: 'wh-001', code: 'STR-A1-L4-P1', level: 4, position: 1, dimensions: { width: 100, height: 80, depth: 120 }, maxWeight: 200, maxVolume: 960, currentWeight: 90, currentVolume: 400, palletCompatible: true, status: 'partial', skuId: 'sku-005', skuCode: 'SKU-FRN-001', skuName: 'Office Chair', quantity: 3, isLocked: false, createdAt: new Date('2024-01-15').toISOString(), updatedAt: new Date().toISOString() },
  
  // Storage Zone A - Rack 006 Bins
  { id: 'bin-014', rackId: 'rack-006', zoneId: 'zone-002', warehouseId: 'wh-001', code: 'STR-A2-L1-P1', level: 1, position: 1, dimensions: { width: 100, height: 80, depth: 120 }, maxWeight: 200, maxVolume: 960, currentWeight: 120, currentVolume: 600, palletCompatible: true, status: 'partial', skuId: 'sku-002', skuCode: 'SKU-ELEC-002', skuName: 'USB Keyboard', quantity: 80, isLocked: false, createdAt: new Date('2024-01-15').toISOString(), updatedAt: new Date().toISOString() },
  { id: 'bin-015', rackId: 'rack-006', zoneId: 'zone-002', warehouseId: 'wh-001', code: 'STR-A2-L2-P1', level: 2, position: 1, dimensions: { width: 100, height: 80, depth: 120 }, maxWeight: 200, maxVolume: 960, currentWeight: 0, currentVolume: 0, palletCompatible: true, status: 'empty', isLocked: false, createdAt: new Date('2024-01-15').toISOString(), updatedAt: new Date().toISOString() },
  { id: 'bin-016', rackId: 'rack-006', zoneId: 'zone-002', warehouseId: 'wh-001', code: 'STR-A2-L3-P1', level: 3, position: 1, dimensions: { width: 100, height: 80, depth: 120 }, maxWeight: 200, maxVolume: 960, currentWeight: 180, currentVolume: 900, palletCompatible: true, status: 'full', skuId: 'sku-001', skuCode: 'SKU-ELEC-001', skuName: 'Wireless Mouse', quantity: 200, isLocked: false, createdAt: new Date('2024-01-15').toISOString(), updatedAt: new Date().toISOString() },
  
  // Picking Zone - Rack 011 Bins
  { id: 'bin-017', rackId: 'rack-011', zoneId: 'zone-003', warehouseId: 'wh-001', code: 'PCK-A1-L1-P1', level: 1, position: 1, dimensions: { width: 40, height: 30, depth: 50 }, maxWeight: 30, maxVolume: 60, currentWeight: 15, currentVolume: 30, palletCompatible: false, status: 'partial', skuId: 'sku-001', skuCode: 'SKU-ELEC-001', skuName: 'Wireless Mouse', quantity: 25, isLocked: false, createdAt: new Date('2024-01-15').toISOString(), updatedAt: new Date().toISOString() },
  { id: 'bin-018', rackId: 'rack-011', zoneId: 'zone-003', warehouseId: 'wh-001', code: 'PCK-A1-L1-P2', level: 1, position: 2, dimensions: { width: 40, height: 30, depth: 50 }, maxWeight: 30, maxVolume: 60, currentWeight: 28, currentVolume: 55, palletCompatible: false, status: 'full', skuId: 'sku-002', skuCode: 'SKU-ELEC-002', skuName: 'USB Keyboard', quantity: 20, isLocked: false, createdAt: new Date('2024-01-15').toISOString(), updatedAt: new Date().toISOString() },
  { id: 'bin-019', rackId: 'rack-011', zoneId: 'zone-003', warehouseId: 'wh-001', code: 'PCK-A1-L1-P3', level: 1, position: 3, dimensions: { width: 40, height: 30, depth: 50 }, maxWeight: 30, maxVolume: 60, currentWeight: 10, currentVolume: 20, palletCompatible: false, status: 'partial', skuId: 'sku-003', skuCode: 'SKU-ELEC-003', skuName: 'HDMI Cable', quantity: 50, isLocked: false, createdAt: new Date('2024-01-15').toISOString(), updatedAt: new Date().toISOString() },
  { id: 'bin-020', rackId: 'rack-011', zoneId: 'zone-003', warehouseId: 'wh-001', code: 'PCK-A1-L2-P1', level: 2, position: 1, dimensions: { width: 40, height: 30, depth: 50 }, maxWeight: 30, maxVolume: 60, currentWeight: 25, currentVolume: 50, palletCompatible: false, status: 'partial', skuId: 'sku-004', skuCode: 'SKU-OFF-001', skuName: 'A4 Paper Ream', quantity: 10, isLocked: false, createdAt: new Date('2024-01-15').toISOString(), updatedAt: new Date().toISOString() },
  
  // Shipping Zone - Rack 013 Bins
  { id: 'bin-021', rackId: 'rack-013', zoneId: 'zone-004', warehouseId: 'wh-001', code: 'SHP-A1-L1-P1', level: 1, position: 1, dimensions: { width: 60, height: 50, depth: 80 }, maxWeight: 100, maxVolume: 240, currentWeight: 50, currentVolume: 120, palletCompatible: false, status: 'partial', skuId: 'sku-001', skuCode: 'SKU-ELEC-001', skuName: 'Wireless Mouse', quantity: 20, isLocked: false, createdAt: new Date('2024-01-15').toISOString(), updatedAt: new Date().toISOString() },
  { id: 'bin-022', rackId: 'rack-013', zoneId: 'zone-004', warehouseId: 'wh-001', code: 'SHP-A1-L1-P2', level: 1, position: 2, dimensions: { width: 60, height: 50, depth: 80 }, maxWeight: 100, maxVolume: 240, currentWeight: 0, currentVolume: 0, palletCompatible: false, status: 'empty', isLocked: false, createdAt: new Date('2024-01-15').toISOString(), updatedAt: new Date().toISOString() },
  { id: 'bin-023', rackId: 'rack-013', zoneId: 'zone-004', warehouseId: 'wh-001', code: 'SHP-A1-L1-P3', level: 1, position: 3, dimensions: { width: 60, height: 50, depth: 80 }, maxWeight: 100, maxVolume: 240, currentWeight: 95, currentVolume: 230, palletCompatible: false, status: 'full', skuId: 'sku-004', skuCode: 'SKU-OFF-001', skuName: 'A4 Paper Ream', quantity: 15, isLocked: false, createdAt: new Date('2024-01-15').toISOString(), updatedAt: new Date().toISOString() },
];

export function generateId(prefix: string): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}
