import { useState } from 'react';
import {
  UserPlus, Mail, Lock, Building2, ShieldCheck, Shield, ShieldAlert, AlertTriangle, Eye, EyeOff,
} from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import { Separator } from '@/shared/components/ui/separator';
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from '@/shared/components/ui/dialog';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/shared/components/ui/select';
import { UserInvitePayload } from '@/shared/types/users';
import { toast } from 'sonner';

type UserRole = 'admin' | 'manager' | 'worker';

interface CreateUserDialogProps {
  open: boolean;
  onClose: () => void;
  onInvite: (payload: any) => void;
  warehouses: { id: string; name: string }[];
  userStats: { totalUsers: number; maxUsers: number };
}

// Export name matches existing import in UsersPage
export function InviteUserDialog({
  open, onClose, onInvite, warehouses, userStats,
}: CreateUserDialogProps) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [role, setRole] = useState<UserRole>('worker');
  const [warehouseId, setWarehouseId] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const isAtLimit = userStats.totalUsers >= userStats.maxUsers;

  const validate = () => {
    const e: Record<string, string> = {};
    if (!name.trim()) e.name = 'Name is required';
    if (!email.trim()) e.email = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) e.email = 'Invalid email';
    if (!password) e.password = 'Password is required';
    else if (password.length < 6) e.password = 'Min 6 characters';
    if (role !== 'admin' && !warehouseId) e.warehouse = 'Required for manager/worker';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = () => {
    if (!validate()) return;
    onInvite({
      name, email, password, role,
      fullName: name,
      warehouseIds: warehouseId ? [warehouseId] : [],
      warehouseId: warehouseId || undefined,
    });
    setName(''); setEmail(''); setPassword(''); setRole('worker'); setWarehouseId(''); setErrors({});
    onClose();
    toast.success(`${role.charAt(0).toUpperCase() + role.slice(1)} account created — they can now login`);
  };

  const roles = [
    { value: 'manager', label: 'Manager', desc: 'Manages warehouse, assigns tasks, reviews', icon: Shield, color: 'text-blue-600' },
    { value: 'worker', label: 'Worker', desc: 'Executes tasks — picking, putaway, counting', icon: ShieldAlert, color: 'text-amber-600' },
    { value: 'admin', label: 'Admin', desc: 'Full access to all warehouses', icon: ShieldCheck, color: 'text-emerald-600' },
  ];

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UserPlus className="h-5 w-5 text-primary" />Create User Account
          </DialogTitle>
          <DialogDescription>Create a manager or worker account. They can login immediately with these credentials.</DialogDescription>
        </DialogHeader>

        {isAtLimit && (
          <div className="flex items-center gap-3 p-3 bg-destructive/10 rounded-lg border border-destructive/20">
            <AlertTriangle className="h-5 w-5 text-destructive flex-shrink-0" />
            <div>
              <p className="font-medium text-destructive text-sm">User Limit Reached</p>
              <p className="text-xs text-destructive/80">Plan limit of {userStats.maxUsers} users reached.</p>
            </div>
          </div>
        )}

        <div className="space-y-4 py-1">
          <div className="space-y-1.5">
            <Label className="text-sm font-medium">Full Name <span className="text-red-500">*</span></Label>
            <Input placeholder="e.g., Ramesh Kumar" value={name} onChange={e => setName(e.target.value)} disabled={isAtLimit}
              className={errors.name ? 'border-destructive' : ''} />
            {errors.name && <p className="text-xs text-destructive">{errors.name}</p>}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-sm font-medium">Email <span className="text-red-500">*</span></Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                <Input type="email" placeholder="user@company.com" className={`pl-9 ${errors.email ? 'border-destructive' : ''}`}
                  value={email} onChange={e => setEmail(e.target.value)} disabled={isAtLimit} />
              </div>
              {errors.email && <p className="text-xs text-destructive">{errors.email}</p>}
            </div>
            <div className="space-y-1.5">
              <Label className="text-sm font-medium">Password <span className="text-red-500">*</span></Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                <Input type={showPassword ? 'text' : 'password'} placeholder="Min 6 chars"
                  className={`pl-9 pr-9 ${errors.password ? 'border-destructive' : ''}`}
                  value={password} onChange={e => setPassword(e.target.value)} disabled={isAtLimit} />
                <button type="button" className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  onClick={() => setShowPassword(!showPassword)}>
                  {showPassword ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                </button>
              </div>
              {errors.password && <p className="text-xs text-destructive">{errors.password}</p>}
            </div>
          </div>

          <Separator />

          <div className="space-y-1.5">
            <Label className="text-sm font-medium">Role <span className="text-red-500">*</span></Label>
            <div className="grid grid-cols-3 gap-2">
              {roles.map(r => {
                const Icon = r.icon;
                const isSelected = role === r.value;
                return (
                  <button key={r.value} type="button" onClick={() => setRole(r.value as UserRole)} disabled={isAtLimit}
                    className={`p-3 rounded-lg border-2 text-left transition-all ${isSelected ? 'border-primary bg-primary/5' : 'border-border hover:border-muted-foreground/30'}`}>
                    <Icon className={`h-5 w-5 mb-1 ${isSelected ? 'text-primary' : r.color}`} />
                    <p className="text-sm font-medium">{r.label}</p>
                    <p className="text-[10px] text-muted-foreground leading-tight mt-0.5">{r.desc}</p>
                  </button>
                );
              })}
            </div>
          </div>

          {role !== 'admin' && (
            <div className="space-y-1.5">
              <Label className="flex items-center gap-1.5 text-sm font-medium">
                <Building2 className="h-3.5 w-3.5" />Assign Warehouse <span className="text-red-500">*</span>
              </Label>
              {warehouses.length === 0 ? (
                <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
                  <p className="text-sm text-amber-700 font-medium">No warehouses found</p>
                  <p className="text-xs text-amber-600">Create a warehouse first before adding managers or workers.</p>
                </div>
              ) : (
                <>
                  <Select value={warehouseId} onValueChange={setWarehouseId}>
                    <SelectTrigger className={errors.warehouse ? 'border-destructive' : ''}><SelectValue placeholder="Select warehouse" /></SelectTrigger>
                    <SelectContent>{warehouses.map(w => <SelectItem key={w.id} value={w.id}>{w.name}</SelectItem>)}</SelectContent>
                  </Select>
                  {errors.warehouse && <p className="text-xs text-destructive">{errors.warehouse}</p>}
                  <p className="text-[10px] text-muted-foreground">
                    {role === 'manager' ? 'Manager sees only this warehouse\'s data' : 'Worker assigned to tasks in this warehouse'}
                  </p>
                </>
              )}
            </div>
          )}

          {role === 'admin' && (
            <p className="text-sm text-muted-foreground p-3 bg-muted/30 rounded-lg">
              Admins have full access to all warehouses and system permissions.
            </p>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSubmit} disabled={isAtLimit} className="gap-2">
            <UserPlus className="h-4 w-4" />Create Account
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
