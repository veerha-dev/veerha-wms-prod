import { useState } from 'react';
import { Settings, Lock, Unlock, AlertCircle, CheckCircle2, Network } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Button } from '@/shared/components/ui/button';
import { Badge } from '@/shared/components/ui/badge';
import { Switch } from '@/shared/components/ui/switch';
import { Label } from '@/shared/components/ui/label';
import { Alert, AlertDescription, AlertTitle } from '@/shared/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/components/ui/tabs';
import { useToast } from '@/shared/hooks/use-toast';
import { useModuleRegistry, useTenantModules, useToggleModule } from '@/shared/hooks/useModuleRegistry';

export default function ModuleManagementPage() {
  const { toast } = useToast();
  const { data: allModules, isLoading: modulesLoading } = useModuleRegistry();
  const { data: tenantModules, isLoading: tenantLoading } = useTenantModules();
  const toggleModule = useToggleModule();

  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const isModuleEnabled = (moduleCode: string) => {
    const module = tenantModules?.find(m => m.module_code === moduleCode);
    return module?.is_enabled ?? false;
  };

  const handleToggle = (moduleCode: string, currentState: boolean) => {
    toggleModule.mutate({ moduleCode, enabled: !currentState });
  };

  const categories = [
    { value: 'all', label: 'All Modules' },
    { value: 'core', label: 'Core' },
    { value: 'inbound', label: 'Inbound' },
    { value: 'outbound', label: 'Outbound' },
    { value: 'inventory', label: 'Inventory' },
    { value: 'operations', label: 'Operations' },
    { value: 'reports', label: 'Reports' },
    { value: 'admin', label: 'Admin' },
  ];

  const filteredModules = allModules?.filter(
    m => selectedCategory === 'all' || m.category === selectedCategory
  );

  const getModuleStats = () => {
    if (!allModules || !tenantModules) return { total: 0, enabled: 0, disabled: 0 };
    const enabled = tenantModules.filter(tm => tm.is_enabled).length;
    return {
      total: allModules.length,
      enabled,
      disabled: allModules.length - enabled,
    };
  };

  const stats = getModuleStats();

  if (modulesLoading || tenantLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Module Management</h1>
          <p className="text-muted-foreground">Control which modules are enabled for your tenant</p>
        </div>
        <Settings className="h-8 w-8 text-muted-foreground" />
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Modules</CardTitle>
            <Network className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Enabled</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.enabled}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Disabled</CardTitle>
            <AlertCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.disabled}</div>
          </CardContent>
        </Card>
      </div>

      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Module Dependencies</AlertTitle>
        <AlertDescription>
          Some modules have dependencies on other modules. Enabling a module will automatically enable its dependencies.
          Disabling a module that other modules depend on will be prevented.
        </AlertDescription>
      </Alert>

      <Tabs value={selectedCategory} onValueChange={setSelectedCategory}>
        <TabsList className="grid w-full grid-cols-8">
          {categories.map(cat => (
            <TabsTrigger key={cat.value} value={cat.value}>
              {cat.label}
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value={selectedCategory} className="space-y-4 mt-6">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredModules?.map(module => (
              <ModuleCard
                key={module.id}
                module={module}
                isEnabled={isModuleEnabled(module.module_code)}
                onToggle={handleToggle}
                isToggling={toggleModule.isPending}
              />
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function ModuleCard({ module, isEnabled, onToggle, isToggling }: any) {
  const getDependencyNames = (codes: string[]) => {
    if (!codes || codes.length === 0) return 'None';
    return codes.join(', ');
  };

  return (
    <Card className={isEnabled ? 'border-green-500' : ''}>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <CardTitle className="flex items-center gap-2">
              {module.module_name}
              {module.is_system_module && (
                <Badge variant="secondary" className="gap-1">
                  <Lock className="h-3 w-3" />
                  System
                </Badge>
              )}
            </CardTitle>
            <CardDescription>{module.description || 'No description available'}</CardDescription>
          </div>
          <div className="flex items-center gap-2">
            {isEnabled ? (
              <CheckCircle2 className="h-5 w-5 text-green-600" />
            ) : (
              <AlertCircle className="h-5 w-5 text-muted-foreground" />
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Category:</span>
            <Badge variant="outline" className="capitalize">{module.category}</Badge>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Route:</span>
            <code className="text-xs bg-muted px-2 py-1 rounded">{module.route_path}</code>
          </div>
          <div className="flex justify-between items-start">
            <span className="text-muted-foreground">Dependencies:</span>
            <span className="text-xs text-right max-w-[200px]">
              {getDependencyNames(module.requires_modules)}
            </span>
          </div>
        </div>

        <div className="flex items-center justify-between pt-4 border-t">
          <Label htmlFor={`module-${module.id}`} className="cursor-pointer">
            {isEnabled ? 'Enabled' : 'Disabled'}
          </Label>
          <Switch
            id={`module-${module.id}`}
            checked={isEnabled}
            onCheckedChange={() => onToggle(module.module_code, isEnabled)}
            disabled={module.is_system_module || isToggling}
          />
        </div>

        {module.is_system_module && (
          <p className="text-xs text-muted-foreground">
            System modules cannot be disabled as they are required for core functionality.
          </p>
        )}
      </CardContent>
    </Card>
  );
}
