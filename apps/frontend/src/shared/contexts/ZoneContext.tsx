import React, { createContext, useContext, ReactNode, useMemo } from 'react';
import { useZones, useZonesByWarehouse, useCreateZone, useUpdateZone, useDeleteZone } from '@/features/warehouse/hooks/useZones';

import { toast } from 'sonner';

type Zone = any;
type ZoneInsert = any;
type ZoneUpdate = any;

interface ZoneWithUtilization extends Zone {
  utilization: number;
  status: 'optimal' | 'warning' | 'critical' | 'empty';
}

interface ZoneContextType {
  zones: ZoneWithUtilization[];
  zonesByWarehouse: ZoneWithUtilization[];
  isLoading: boolean;
  createZone: (zone: Omit<ZoneInsert, 'tenant_id'>) => Promise<void>;
  updateZone: (id: string, updates: ZoneUpdate) => Promise<void>;
  deleteZone: (id: string) => Promise<void>;
  getZoneById: (id: string) => ZoneWithUtilization | undefined;
  getZonesByType: (type: string) => ZoneWithUtilization[];
  getHighUtilizationZones: (threshold?: number) => ZoneWithUtilization[];
  getEmptyZones: () => ZoneWithUtilization[];
  calculateTotalUtilization: () => number;
}

const ZoneContext = createContext<ZoneContextType | undefined>(undefined);

export function ZoneProvider({ children }: { children: ReactNode }) {
  const { data: zones = [], isLoading } = useZones();
  const { data: zonesByWarehouse = [] } = useZonesByWarehouse(null); // Will be filtered by warehouse in components
  const createZoneMutation = useCreateZone();
  const updateZoneMutation = useUpdateZone();
  const deleteZoneMutation = useDeleteZone();

  // Calculate utilization and status for each zone
  const calculateZoneUtilization = (zone: Zone): ZoneWithUtilization => {
    const cap = zone.capacity ?? 0;
    const used = zone.currentOccupancy ?? 0;
    const utilization = cap > 0 
      ? Math.round((used / cap) * 100) 
      : 0;

    let status: 'optimal' | 'warning' | 'critical' | 'empty';
    if (utilization === 0) {
      status = 'empty';
    } else if (utilization >= 90) {
      status = 'critical';
    } else if (utilization >= 70) {
      status = 'warning';
    } else {
      status = 'optimal';
    }

    return {
      ...zone,
      utilization,
      status,
    };
  };

  // Process zones with utilization data
  const processedZones = useMemo(() => {
    return zones.map(calculateZoneUtilization);
  }, [zones]);

  const processedZonesByWarehouse = useMemo(() => {
    return zonesByWarehouse.map(calculateZoneUtilization);
  }, [zonesByWarehouse]);

  const createZone = async (zone: Omit<ZoneInsert, 'tenant_id'>) => {
    try {
      await createZoneMutation.mutateAsync(zone);
      toast.success('Zone created successfully');
    } catch (error) {
      console.error('Error creating zone:', error);
      throw error;
    }
  };

  const updateZone = async (id: string, updates: ZoneUpdate) => {
    try {
      await updateZoneMutation.mutateAsync({ id, ...updates });
      toast.success('Zone updated successfully');
    } catch (error) {
      console.error('Error updating zone:', error);
      throw error;
    }
  };

  const deleteZone = async (id: string) => {
    try {
      await deleteZoneMutation.mutateAsync(id);
      toast.success('Zone deleted successfully');
    } catch (error) {
      console.error('Error deleting zone:', error);
      throw error;
    }
  };

  const getZoneById = (id: string): ZoneWithUtilization | undefined => {
    return processedZones.find(zone => zone.id === id);
  };

  const getZonesByType = (type: string): ZoneWithUtilization[] => {
    return processedZones.filter(zone => zone.type === type);
  };

  const getHighUtilizationZones = (threshold: number = 80): ZoneWithUtilization[] => {
    return processedZones.filter(zone => zone.utilization >= threshold);
  };

  const getEmptyZones = (): ZoneWithUtilization[] => {
    return processedZones.filter(zone => zone.utilization === 0);
  };

  const calculateTotalUtilization = (): number => {
    if (processedZones.length === 0) return 0;
    
    const totalCapacity = processedZones.reduce((sum, zone) => sum + (zone.capacity ?? 0), 0);
    const totalUsed = processedZones.reduce((sum, zone) => sum + (zone.currentOccupancy ?? 0), 0);
    
    return totalCapacity > 0 ? Math.round((totalUsed / totalCapacity) * 100) : 0;
  };

  const value: ZoneContextType = {
    zones: processedZones,
    zonesByWarehouse: processedZonesByWarehouse,
    isLoading,
    createZone,
    updateZone,
    deleteZone,
    getZoneById,
    getZonesByType,
    getHighUtilizationZones,
    getEmptyZones,
    calculateTotalUtilization,
  };

  return (
    <ZoneContext.Provider value={value}>
      {children}
    </ZoneContext.Provider>
  );
}

export function useZoneContext() {
  const context = useContext(ZoneContext);
  if (context === undefined) {
    throw new Error('useZoneContext must be used within a ZoneProvider');
  }
  return context;
}
