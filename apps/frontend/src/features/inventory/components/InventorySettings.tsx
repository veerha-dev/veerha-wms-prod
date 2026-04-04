import { useState, useEffect } from 'react';
import { safeParseInt } from '@/shared/utils/input';
import { cn } from '@/shared/lib/utils';
import {
  Settings,
  Save,
  Lock,
  AlertTriangle,
  Package,
  Shield,
  RefreshCw,
  Loader2,
} from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import { Switch } from '@/shared/components/ui/switch';
import { Badge } from '@/shared/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/components/ui/select';
import { useWMS } from '@/shared/contexts/WMSContext';
import { useInventorySettings, useUpsertInventorySettings, InventorySettingsUpdate } from '@/features/settings/hooks/useInventorySettings';

interface LocalSettings {
  stockLockingEnabled: boolean;
  negativeStockAllowed: boolean;
  fifoPreference: 'fifo' | 'fefo' | 'manual';
  autoBlockExpired: boolean;
  lowStockThreshold: number;
  expiryAlertDays: number;
  overstockThreshold: number;
  adjustmentApprovalRequired: boolean;
  maxAdjustmentWithoutApproval: number;
}

const defaultSettings: LocalSettings = {
  stockLockingEnabled: true,
  negativeStockAllowed: false,
  fifoPreference: 'fifo',
  autoBlockExpired: true,
  lowStockThreshold: 10,
  expiryAlertDays: 30,
  overstockThreshold: 150,
  adjustmentApprovalRequired: true,
  maxAdjustmentWithoutApproval: 50,
};

export function InventorySettings() {
  const { currentUser, tenant } = useWMS();
  const { data: dbSettings, isLoading } = useInventorySettings();
  const upsertSettings = useUpsertInventorySettings();
  
  const [settings, setSettings] = useState<LocalSettings>(defaultSettings);
  const [hasChanges, setHasChanges] = useState(false);

  const isAdmin = currentUser?.role === 'admin';
  const isPremiumPlan = tenant?.plan === 'enterprise' || tenant?.plan === 'professional';

  // Load settings from database when available
  useEffect(() => {
    if (dbSettings) {
      setSettings({
        stockLockingEnabled: dbSettings.stock_locking_enabled,
        negativeStockAllowed: dbSettings.negative_stock_allowed,
        fifoPreference: dbSettings.fifo_preference,
        autoBlockExpired: dbSettings.auto_block_expired,
        lowStockThreshold: dbSettings.low_stock_threshold,
        expiryAlertDays: dbSettings.expiry_alert_days,
        overstockThreshold: dbSettings.overstock_threshold,
        adjustmentApprovalRequired: dbSettings.adjustment_approval_required,
        maxAdjustmentWithoutApproval: dbSettings.max_adjustment_without_approval,
      });
    }
  }, [dbSettings]);

  const updateSetting = <K extends keyof LocalSettings>(key: K, value: LocalSettings[K]) => {
    setSettings(prev => ({ ...prev, [key]: value }));
    setHasChanges(true);
  };

  const handleSave = async () => {
    const dbSettingsUpdate: InventorySettingsUpdate = {
      stock_locking_enabled: settings.stockLockingEnabled,
      negative_stock_allowed: settings.negativeStockAllowed,
      fifo_preference: settings.fifoPreference,
      auto_block_expired: settings.autoBlockExpired,
      low_stock_threshold: settings.lowStockThreshold,
      expiry_alert_days: settings.expiryAlertDays,
      overstock_threshold: settings.overstockThreshold,
      adjustment_approval_required: settings.adjustmentApprovalRequired,
      max_adjustment_without_approval: settings.maxAdjustmentWithoutApproval,
    };
    
    await upsertSettings.mutateAsync(dbSettingsUpdate);
    setHasChanges(false);
  };

  if (!isAdmin) {
    return (
      <div className="wms-card p-12 text-center">
        <Shield className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
        <h3 className="text-lg font-semibold mb-2">Admin Only</h3>
        <p className="text-muted-foreground">
          Inventory settings can only be modified by Admin users.
        </p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stock Locking Rules */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lock className="h-5 w-5" />
            Stock Locking Rules
          </CardTitle>
          <CardDescription>
            Control how stock can be reserved and locked
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div>
              <p className="font-medium">Enable Stock Locking</p>
              <p className="text-sm text-muted-foreground">Allow stock to be reserved for orders</p>
            </div>
            <Switch 
              checked={settings.stockLockingEnabled} 
              onCheckedChange={(checked) => updateSetting('stockLockingEnabled', checked)}
            />
          </div>
          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div>
              <p className="font-medium">Allow Negative Stock</p>
              <p className="text-sm text-muted-foreground">
                Permit stock to go below zero (back-order scenarios)
              </p>
            </div>
            <Switch 
              checked={settings.negativeStockAllowed} 
              onCheckedChange={(checked) => updateSetting('negativeStockAllowed', checked)}
            />
          </div>
        </CardContent>
      </Card>

      {/* FIFO / FEFO Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <RefreshCw className="h-5 w-5" />
            Stock Rotation Preference
          </CardTitle>
          <CardDescription>
            Define how stock should be picked based on age
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Default Picking Method</Label>
            <Select 
              value={settings.fifoPreference} 
              onValueChange={(value: 'fifo' | 'fefo' | 'manual') => updateSetting('fifoPreference', value)}
            >
              <SelectTrigger className="w-[300px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="fifo">
                  <div>
                    <p className="font-medium">FIFO (First In, First Out)</p>
                    <p className="text-xs text-muted-foreground">Pick oldest received stock first</p>
                  </div>
                </SelectItem>
                <SelectItem value="fefo">
                  <div>
                    <p className="font-medium">FEFO (First Expiry, First Out)</p>
                    <p className="text-xs text-muted-foreground">Pick stock closest to expiry first</p>
                  </div>
                </SelectItem>
                <SelectItem value="manual">
                  <div>
                    <p className="font-medium">Manual Selection</p>
                    <p className="text-xs text-muted-foreground">Allow manual batch selection</p>
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div>
              <p className="font-medium">Auto-Block Expired Stock</p>
              <p className="text-sm text-muted-foreground">
                Automatically block batches when expiry date passes
              </p>
            </div>
            <Switch 
              checked={settings.autoBlockExpired} 
              onCheckedChange={(checked) => updateSetting('autoBlockExpired', checked)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Alert Thresholds */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5" />
            Alert Thresholds
          </CardTitle>
          <CardDescription>
            Configure when inventory alerts are triggered
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>Low Stock Threshold (%)</Label>
              <Input 
                type="number" 
                value={settings.lowStockThreshold}
                onChange={(e) => updateSetting('lowStockThreshold', safeParseInt(e.target.value, 0))}
              />
              <p className="text-xs text-muted-foreground">
                Alert when stock falls below this % of min level
              </p>
            </div>
            <div className="space-y-2">
              <Label>Expiry Alert (days before)</Label>
              <Input 
                type="number" 
                value={settings.expiryAlertDays}
                onChange={(e) => updateSetting('expiryAlertDays', safeParseInt(e.target.value, 0))}
              />
              <p className="text-xs text-muted-foreground">
                Alert this many days before expiry
              </p>
            </div>
            <div className="space-y-2">
              <Label>Overstock Threshold (%)</Label>
              <Input 
                type="number" 
                value={settings.overstockThreshold}
                onChange={(e) => updateSetting('overstockThreshold', safeParseInt(e.target.value, 0))}
              />
              <p className="text-xs text-muted-foreground">
                Alert when stock exceeds this % of max level
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Adjustment Controls */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Adjustment Controls
          </CardTitle>
          <CardDescription>
            Govern stock adjustment permissions and limits
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div>
              <p className="font-medium">Require Approval for Adjustments</p>
              <p className="text-sm text-muted-foreground">
                All stock adjustments must be approved by an Admin
              </p>
            </div>
            <Switch 
              checked={settings.adjustmentApprovalRequired} 
              onCheckedChange={(checked) => updateSetting('adjustmentApprovalRequired', checked)}
            />
          </div>
          {settings.adjustmentApprovalRequired && (
            <div className="space-y-2 pl-4 border-l-2 border-accent">
              <Label>Max Adjustment Without Approval</Label>
              <Input 
                type="number" 
                value={settings.maxAdjustmentWithoutApproval}
                onChange={(e) => updateSetting('maxAdjustmentWithoutApproval', safeParseInt(e.target.value, 0))}
                className="w-[200px]"
              />
              <p className="text-xs text-muted-foreground">
                Adjustments of this quantity or less can proceed without approval
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Plan-Gated Advanced Settings */}
      <Card className={cn(!isPremiumPlan && 'border-dashed opacity-75')}>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Advanced Settings
            </CardTitle>
            {!isPremiumPlan && (
              <Badge variant="secondary">Premium Plan Required</Badge>
            )}
          </div>
          <CardDescription>
            Advanced inventory configuration options
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div>
              <p className="font-medium">Multi-Location Inventory</p>
              <p className="text-sm text-muted-foreground">
                Track same SKU across multiple bin locations
              </p>
            </div>
            <Switch disabled={!isPremiumPlan} />
          </div>
          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div>
              <p className="font-medium">Serial Number Tracking</p>
              <p className="text-sm text-muted-foreground">
                Track individual items by serial number
              </p>
            </div>
            <Switch disabled={!isPremiumPlan} />
          </div>
          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div>
              <p className="font-medium">Consignment Inventory</p>
              <p className="text-sm text-muted-foreground">
                Track supplier-owned stock in your warehouse
              </p>
            </div>
            <Switch disabled={!isPremiumPlan} />
          </div>
          {!isPremiumPlan && (
            <Button variant="outline" className="w-full">Upgrade to Premium</Button>
          )}
        </CardContent>
      </Card>

      {/* Save Button */}
      <div className="flex justify-end gap-3">
        {hasChanges && (
          <p className="text-sm text-muted-foreground self-center">You have unsaved changes</p>
        )}
        <Button 
          onClick={handleSave} 
          className="gap-2"
          disabled={upsertSettings.isPending || !hasChanges}
        >
          {upsertSettings.isPending ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Save className="h-4 w-4" />
          )}
          Save Settings
        </Button>
      </div>
    </div>
  );
}
