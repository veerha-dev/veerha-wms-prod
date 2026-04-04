import { useState, useEffect, useRef, useCallback } from 'react';
import { AppLayout } from '@/shared/components/layout/AppLayout';
import { useAuth } from '@/shared/contexts/AuthContext';
import { useTheme } from '@/shared/contexts/ThemeContext';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/shared/lib/api';
import {
  usePreferences, useUpdateGeneral, useUpdateNotifications, useUpdateSecurityPrefs,
  useTenantSettings, useUpdateTenantInfo, useIntegrations, useUpdateIntegration,
  useSendTestNotification, useUpdateProfile, useChangePassword,
  UserPreferences, TenantSettings, Integration,
} from '@/features/settings/hooks/useSettings';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import { Switch } from '@/shared/components/ui/switch';
import { Textarea } from '@/shared/components/ui/textarea';
import { Badge } from '@/shared/components/ui/badge';
import { Progress } from '@/shared/components/ui/progress';
import { Skeleton } from '@/shared/components/ui/skeleton';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/shared/components/ui/dialog';
import { Separator } from '@/shared/components/ui/separator';
import { cn } from '@/shared/lib/utils';
import {
  Settings, Building2, Bell, Shield, Database, Palette,
  Save, LogOut, Eye, EyeOff, CheckCircle2, AlertTriangle, Loader2,
  Sun, Moon, Monitor, Plug, Unplug, Send, RefreshCw,
} from 'lucide-react';

const TIMEZONES = [
  { value: 'Asia/Kolkata', label: 'India (IST +5:30)' },
  { value: 'UTC', label: 'UTC +0:00' },
  { value: 'America/New_York', label: 'New York (EST -5:00)' },
  { value: 'America/Los_Angeles', label: 'Los Angeles (PST -8:00)' },
  { value: 'America/Chicago', label: 'Chicago (CST -6:00)' },
  { value: 'Europe/London', label: 'London (GMT +0:00)' },
  { value: 'Europe/Paris', label: 'Paris (CET +1:00)' },
  { value: 'Europe/Berlin', label: 'Berlin (CET +1:00)' },
  { value: 'Asia/Dubai', label: 'Dubai (GST +4:00)' },
  { value: 'Asia/Singapore', label: 'Singapore (SGT +8:00)' },
  { value: 'Asia/Tokyo', label: 'Tokyo (JST +9:00)' },
  { value: 'Australia/Sydney', label: 'Sydney (AEST +10:00)' },
];

const LANGUAGES = [
  { value: 'en', label: 'English' },
  { value: 'hi', label: 'हिन्दी (Hindi)' },
  { value: 'es', label: 'Español (Spanish)' },
  { value: 'fr', label: 'Français (French)' },
  { value: 'de', label: 'Deutsch (German)' },
  { value: 'ar', label: 'العربية (Arabic)' },
];

// ─────────────────────────────────────────────────────────────────────────────

export default function SettingsPage() {
  const { user, isAdmin, signOut } = useAuth();
  const { theme, setTheme, primaryColor, setPrimaryColor } = useTheme();
  const { data: prefs, isLoading: prefsLoading } = usePreferences();
  const { data: tenantData, isLoading: tenantLoading } = useTenantSettings();
  const { data: integrations = [], isLoading: intLoading } = useIntegrations();

  // Alerts summary for notification badge
  const { data: alertSummary } = useQuery({
    queryKey: ['alerts-summary'],
    queryFn: () => api.get('/api/v1/alerts/summary').then((r) => r.data.data),
    staleTime: 30_000,
    refetchInterval: 30_000,
  });
  const unreadCount: number = alertSummary?.unacknowledgedAlerts || 0;

  return (
    <AppLayout
      title="Settings"
      breadcrumbs={[{ label: 'Home', href: '/' }, { label: 'Settings' }]}
    >
      <Tabs defaultValue="general" className="space-y-6">
        <TabsList className="grid w-full grid-cols-6 lg:w-auto lg:inline-grid">
          <TabsTrigger value="general" className="gap-2">
            <Settings className="h-4 w-4" /><span className="hidden sm:inline">General</span>
          </TabsTrigger>
          <TabsTrigger value="tenant" className="gap-2">
            <Building2 className="h-4 w-4" /><span className="hidden sm:inline">Organization</span>
          </TabsTrigger>
          <TabsTrigger value="notifications" className="gap-2 relative">
            <Bell className="h-4 w-4" /><span className="hidden sm:inline">Notifications</span>
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-destructive text-[10px] text-white flex items-center justify-center">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger value="security" className="gap-2">
            <Shield className="h-4 w-4" /><span className="hidden sm:inline">Security</span>
          </TabsTrigger>
          <TabsTrigger value="integrations" className="gap-2">
            <Database className="h-4 w-4" /><span className="hidden sm:inline">Integrations</span>
          </TabsTrigger>
          <TabsTrigger value="appearance" className="gap-2">
            <Palette className="h-4 w-4" /><span className="hidden sm:inline">Appearance</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="general">
          <GeneralTab prefs={prefs} isLoading={prefsLoading} />
        </TabsContent>
        <TabsContent value="tenant">
          <TenantTab tenantData={tenantData} isLoading={tenantLoading} isAdmin={isAdmin} />
        </TabsContent>
        <TabsContent value="notifications">
          <NotificationsTab prefs={prefs} isLoading={prefsLoading} unreadCount={unreadCount} />
        </TabsContent>
        <TabsContent value="security">
          <SecurityTab prefs={prefs} user={user} signOut={signOut} />
        </TabsContent>
        <TabsContent value="integrations">
          <IntegrationsTab integrations={integrations} isLoading={intLoading} isAdmin={isAdmin} />
        </TabsContent>
        <TabsContent value="appearance">
          <AppearanceTab theme={theme} setTheme={setTheme} primaryColor={primaryColor} setPrimaryColor={setPrimaryColor} />
        </TabsContent>
      </Tabs>
    </AppLayout>
  );
}

// ─── Tab 1: General ───────────────────────────────────────────────────────────

function GeneralTab({ prefs, isLoading }: { prefs?: UserPreferences; isLoading: boolean }) {
  const update = useUpdateGeneral();
  const [form, setForm] = useState<Partial<UserPreferences>>({});

  useEffect(() => {
    if (prefs) setForm({
      systemName: prefs.systemName,
      language: prefs.language,
      timezone: prefs.timezone,
      dateFormat: prefs.dateFormat,
      autoRefresh: prefs.autoRefresh,
      compactView: prefs.compactView,
      refreshIntervalSeconds: prefs.refreshIntervalSeconds,
    });
  }, [prefs]);

  const set = (k: keyof UserPreferences, v: any) => setForm((f) => ({ ...f, [k]: v }));

  if (isLoading) return <SettingsSkeleton />;

  return (
    <div className="space-y-6">
      <SectionHeader title="General Settings" description="Configure system-wide preferences and display options" />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-4">
          <Field label="System Name">
            <Input value={form.systemName || ''} onChange={(e) => set('systemName', e.target.value)} />
          </Field>
          <Field label="Language">
            <Select value={form.language || 'en'} onValueChange={(v) => set('language', v)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>{LANGUAGES.map((l) => <SelectItem key={l.value} value={l.value}>{l.label}</SelectItem>)}</SelectContent>
            </Select>
          </Field>
          <Field label="Timezone">
            <Select value={form.timezone || 'Asia/Kolkata'} onValueChange={(v) => set('timezone', v)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>{TIMEZONES.map((t) => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}</SelectContent>
            </Select>
          </Field>
          <Field label="Date Format">
            <Select value={form.dateFormat || 'dmy'} onValueChange={(v) => set('dateFormat', v as any)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="dmy">DD/MM/YYYY</SelectItem>
                <SelectItem value="mdy">MM/DD/YYYY</SelectItem>
                <SelectItem value="ymd">YYYY-MM-DD</SelectItem>
              </SelectContent>
            </Select>
          </Field>
        </div>
        <div className="space-y-4">
          <ToggleRow
            label="Auto-Refresh Dashboard"
            description="Automatically refresh dashboard data"
            checked={!!form.autoRefresh}
            onCheckedChange={(v) => set('autoRefresh', v)}
          />
          {form.autoRefresh && (
            <Field label="Refresh Interval">
              <Select value={String(form.refreshIntervalSeconds || 60)} onValueChange={(v) => set('refreshIntervalSeconds', Number(v))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="15">Every 15 seconds</SelectItem>
                  <SelectItem value="30">Every 30 seconds</SelectItem>
                  <SelectItem value="60">Every 1 minute</SelectItem>
                  <SelectItem value="120">Every 2 minutes</SelectItem>
                  <SelectItem value="300">Every 5 minutes</SelectItem>
                </SelectContent>
              </Select>
            </Field>
          )}
          <ToggleRow
            label="Compact View"
            description="Reduce spacing for denser information display"
            checked={!!form.compactView}
            onCheckedChange={(v) => set('compactView', v)}
          />
        </div>
      </div>
      <SaveBar onSave={() => update.mutate(form)} isPending={update.isPending} />
    </div>
  );
}

// ─── Tab 2: Organization ──────────────────────────────────────────────────────

function TenantTab({ tenantData, isLoading, isAdmin }: { tenantData?: TenantSettings; isLoading: boolean; isAdmin: boolean }) {
  const update = useUpdateTenantInfo();
  const [form, setForm] = useState<Partial<TenantSettings & { gstNumber: string; industry: string }>>({});

  useEffect(() => {
    if (tenantData) setForm({
      companyName: tenantData.companyName,
      industry: tenantData.industry || '',
      address: tenantData.address || '',
      city: tenantData.city || '',
      country: tenantData.country || '',
      gstNumber: tenantData.gstNumber || '',
    });
  }, [tenantData]);

  const set = (k: string, v: any) => setForm((f) => ({ ...f, [k]: v }));

  if (isLoading) return <SettingsSkeleton />;

  const usagePct = (used: number, max: number) => max > 0 ? Math.round((used / max) * 100) : 0;
  const usageColor = (pct: number) => pct > 90 ? 'bg-destructive' : pct > 70 ? 'bg-warning' : 'bg-success';

  return (
    <div className="space-y-6">
      <SectionHeader title="Organization" description="Your organization profile and subscription plan details" />

      {/* Plan Info */}
      <div className="wms-card p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold">Current Plan</h3>
          <Badge className="bg-primary/10 text-primary border-primary/20 capitalize">
            {tenantData?.planName || 'Starter'}
          </Badge>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            { label: 'Users', used: tenantData?.userCount || 0, max: tenantData?.maxUsers || 10 },
            { label: 'Warehouses', used: tenantData?.warehouseCount || 0, max: tenantData?.maxWarehouses || 3 },
            { label: 'SKUs', used: tenantData?.skuCount || 0, max: tenantData?.maxSkus || 100 },
          ].map(({ label, used, max }) => {
            const pct = usagePct(used, max);
            return (
              <div key={label}>
                <div className="flex justify-between text-sm mb-1.5">
                  <span className="text-muted-foreground">{label}</span>
                  <span className="font-medium">{used} / {max}</span>
                </div>
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <div className={cn('h-full rounded-full transition-all', usageColor(pct))} style={{ width: `${Math.min(pct, 100)}%` }} />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Edit Form */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Field label="Organization Name">
          <Input value={form.companyName || ''} onChange={(e) => set('companyName', e.target.value)} disabled={!isAdmin} />
        </Field>
        <Field label="Industry">
          <Select value={form.industry || ''} onValueChange={(v) => set('industry', v)} disabled={!isAdmin}>
            <SelectTrigger><SelectValue placeholder="Select industry" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="logistics">Logistics & Distribution</SelectItem>
              <SelectItem value="manufacturing">Manufacturing</SelectItem>
              <SelectItem value="retail">Retail & E-commerce</SelectItem>
              <SelectItem value="healthcare">Healthcare & Pharma</SelectItem>
              <SelectItem value="fmcg">FMCG</SelectItem>
              <SelectItem value="automotive">Automotive</SelectItem>
              <SelectItem value="other">Other</SelectItem>
            </SelectContent>
          </Select>
        </Field>
        <Field label="City">
          <Input value={form.city || ''} onChange={(e) => set('city', e.target.value)} disabled={!isAdmin} />
        </Field>
        <Field label="Country">
          <Input value={form.country || ''} onChange={(e) => set('country', e.target.value)} disabled={!isAdmin} />
        </Field>
        <Field label="GST / Tax Number">
          <Input value={form.gstNumber || ''} onChange={(e) => set('gstNumber', e.target.value)} disabled={!isAdmin} />
        </Field>
        <Field label="Business Address">
          <Textarea value={form.address || ''} onChange={(e) => set('address', e.target.value)} rows={2} disabled={!isAdmin} />
        </Field>
      </div>
      {!isAdmin && (
        <p className="text-xs text-muted-foreground flex items-center gap-1.5">
          <Shield className="h-3.5 w-3.5" /> Only administrators can edit organization settings.
        </p>
      )}
      {isAdmin && <SaveBar onSave={() => update.mutate(form)} isPending={update.isPending} />}
    </div>
  );
}

// ─── Tab 3: Notifications ─────────────────────────────────────────────────────

function NotificationsTab({ prefs, isLoading, unreadCount }: { prefs?: UserPreferences; isLoading: boolean; unreadCount: number }) {
  const update = useUpdateNotifications();
  const testNotif = useSendTestNotification();
  const [form, setForm] = useState<Partial<UserPreferences>>({});

  useEffect(() => {
    if (prefs) setForm({
      notifEmailLowStock: prefs.notifEmailLowStock,
      notifEmailTaskException: prefs.notifEmailTaskException,
      notifEmailDailySummary: prefs.notifEmailDailySummary,
      notifEmailUserActivity: prefs.notifEmailUserActivity,
      notifEmailSystemUpdates: prefs.notifEmailSystemUpdates,
      notifInappRealtime: prefs.notifInappRealtime,
      notifInappSound: prefs.notifInappSound,
    });
  }, [prefs]);

  const set = (k: keyof UserPreferences, v: any) => setForm((f) => ({ ...f, [k]: v }));

  if (isLoading) return <SettingsSkeleton />;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <SectionHeader title="Notifications" description="Control how and when you receive alerts and updates" />
        {unreadCount > 0 && (
          <Badge variant="destructive" className="gap-1.5">
            <Bell className="h-3 w-3" />{unreadCount} unread
          </Badge>
        )}
      </div>

      <div className="wms-card p-5 space-y-4">
        <h3 className="text-sm font-semibold flex items-center gap-2"><Bell className="h-4 w-4 text-muted-foreground" /> Email Notifications</h3>
        <Separator />
        {[
          { key: 'notifEmailLowStock' as const, label: 'Low Stock Alerts', desc: 'When SKUs fall below reorder point' },
          { key: 'notifEmailTaskException' as const, label: 'Task Exceptions', desc: 'When tasks fail or need attention' },
          { key: 'notifEmailDailySummary' as const, label: 'Daily Summary', desc: 'End-of-day warehouse activity digest' },
          { key: 'notifEmailUserActivity' as const, label: 'User Activity', desc: 'Login events and user actions' },
          { key: 'notifEmailSystemUpdates' as const, label: 'System Updates', desc: 'Platform and feature announcements' },
        ].map(({ key, label, desc }) => (
          <ToggleRow key={key} label={label} description={desc}
            checked={!!form[key]} onCheckedChange={(v) => set(key, v)} />
        ))}
      </div>

      <div className="wms-card p-5 space-y-4">
        <h3 className="text-sm font-semibold flex items-center gap-2"><Monitor className="h-4 w-4 text-muted-foreground" /> In-App Notifications</h3>
        <Separator />
        <ToggleRow label="Real-time Alerts" description="Show live alerts as they happen in the dashboard"
          checked={!!form.notifInappRealtime} onCheckedChange={(v) => set('notifInappRealtime', v)} />
        <ToggleRow label="Sound Alerts" description="Play notification sound for critical alerts"
          checked={!!form.notifInappSound} onCheckedChange={(v) => set('notifInappSound', v)} />
      </div>

      <div className="flex items-center gap-3">
        <SaveBar onSave={() => update.mutate(form)} isPending={update.isPending} />
        <Button variant="outline" size="sm" onClick={() => testNotif.mutate()} disabled={testNotif.isPending} className="gap-2">
          {testNotif.isPending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Send className="h-3.5 w-3.5" />}
          Send Test Notification
        </Button>
      </div>
    </div>
  );
}

// ─── Tab 4: Security ──────────────────────────────────────────────────────────

function SecurityTab({ prefs, user, signOut }: { prefs?: UserPreferences; user: any; signOut: () => Promise<void> }) {
  const updateProfile = useUpdateProfile();
  const changePassword = useChangePassword();
  const updateSecurity = useUpdateSecurityPrefs();

  const [profileForm, setProfileForm] = useState({ fullName: '', phone: '' });
  const [pwForm, setPwForm] = useState({ current: '', next: '', confirm: '' });
  const [showPw, setShowPw] = useState({ current: false, next: false, confirm: false });
  const [pwError, setPwError] = useState('');

  useEffect(() => {
    if (user) setProfileForm({ fullName: user.fullName || '', phone: user.phone || '' });
  }, [user]);

  const handlePwSubmit = () => {
    setPwError('');
    if (pwForm.next !== pwForm.confirm) { setPwError('New passwords do not match'); return; }
    if (pwForm.next.length < 8) { setPwError('Password must be at least 8 characters'); return; }
    changePassword.mutate(
      { currentPassword: pwForm.current, newPassword: pwForm.next },
      { onSuccess: () => setPwForm({ current: '', next: '', confirm: '' }) },
    );
  };

  return (
    <div className="space-y-6">
      <SectionHeader title="Security" description="Manage your profile, password, and session settings" />

      {/* Profile */}
      <div className="wms-card p-5 space-y-4">
        <h3 className="text-sm font-semibold">Profile Information</h3>
        <Separator />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Full Name">
            <Input value={profileForm.fullName} onChange={(e) => setProfileForm((f) => ({ ...f, fullName: e.target.value }))} />
          </Field>
          <Field label="Phone Number">
            <Input value={profileForm.phone} onChange={(e) => setProfileForm((f) => ({ ...f, phone: e.target.value }))} placeholder="+91 9876543210" />
          </Field>
          <Field label="Email Address">
            <Input value={user?.email || ''} disabled className="bg-muted/50 cursor-not-allowed" />
          </Field>
          <Field label="Role">
            <Input value={user?.role || ''} disabled className="bg-muted/50 capitalize cursor-not-allowed" />
          </Field>
        </div>
        {user?.lastLogin && (
          <p className="text-xs text-muted-foreground">Last login: {new Date(user.lastLogin).toLocaleString('en-IN')}</p>
        )}
        <Button size="sm" onClick={() => updateProfile.mutate(profileForm)} disabled={updateProfile.isPending} className="gap-2">
          {updateProfile.isPending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />}
          Save Profile
        </Button>
      </div>

      {/* Change Password */}
      <div className="wms-card p-5 space-y-4">
        <h3 className="text-sm font-semibold">Change Password</h3>
        <Separator />
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {([
            { key: 'current' as const, label: 'Current Password' },
            { key: 'next' as const, label: 'New Password' },
            { key: 'confirm' as const, label: 'Confirm New Password' },
          ]).map(({ key, label }) => (
            <Field key={key} label={label}>
              <div className="relative">
                <Input
                  type={showPw[key] ? 'text' : 'password'}
                  value={pwForm[key]}
                  onChange={(e) => { setPwForm((f) => ({ ...f, [key]: e.target.value })); setPwError(''); }}
                  className="pr-10"
                />
                <button type="button" className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  onClick={() => setShowPw((s) => ({ ...s, [key]: !s[key] }))}>
                  {showPw[key] ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </Field>
          ))}
        </div>
        {pwError && <p className="text-xs text-destructive flex items-center gap-1"><AlertTriangle className="h-3 w-3" />{pwError}</p>}
        <Button size="sm" onClick={handlePwSubmit}
          disabled={changePassword.isPending || !pwForm.current || !pwForm.next || !pwForm.confirm}
          className="gap-2">
          {changePassword.isPending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Shield className="h-3.5 w-3.5" />}
          Change Password
        </Button>
      </div>

      {/* Session */}
      <div className="wms-card p-5 space-y-4">
        <h3 className="text-sm font-semibold">Session Settings</h3>
        <Separator />
        <div className="flex items-center gap-4">
          <Label className="text-sm min-w-[140px]">Session Timeout</Label>
          <Select
            value={String(prefs?.sessionTimeoutMinutes || 480)}
            onValueChange={(v) => updateSecurity.mutate({ sessionTimeoutMinutes: Number(v) })}
          >
            <SelectTrigger className="w-48"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="15">15 minutes</SelectItem>
              <SelectItem value="30">30 minutes</SelectItem>
              <SelectItem value="60">1 hour</SelectItem>
              <SelectItem value="480">8 hours (default)</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Sign Out */}
      <div className="wms-card p-5">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-semibold">Sign Out</h3>
            <p className="text-xs text-muted-foreground mt-0.5">End your current session</p>
          </div>
          <Button variant="destructive" size="sm" onClick={() => signOut()} className="gap-2">
            <LogOut className="h-3.5 w-3.5" />Sign Out
          </Button>
        </div>
      </div>
    </div>
  );
}

// ─── Tab 5: Integrations ──────────────────────────────────────────────────────

function IntegrationsTab({ integrations, isLoading, isAdmin }: { integrations: Integration[]; isLoading: boolean; isAdmin: boolean }) {
  const updateIntegration = useUpdateIntegration();
  const [modal, setModal] = useState<{ open: boolean; item: Integration | null }>({ open: false, item: null });
  const [modalForm, setModalForm] = useState({ connected: false, connectionDetails: '' });

  const openModal = (item: Integration) => {
    setModal({ open: true, item });
    setModalForm({ connected: item.connected, connectionDetails: item.connectionDetails || '' });
  };

  const saveIntegration = () => {
    if (!modal.item) return;
    updateIntegration.mutate(
      { key: modal.item.key, connected: modalForm.connected, connectionDetails: modalForm.connectionDetails },
      { onSuccess: () => setModal({ open: false, item: null }) },
    );
  };

  if (isLoading) return <SettingsSkeleton />;

  return (
    <div className="space-y-6">
      <SectionHeader title="Integrations" description="Manage third-party connections and API integrations" />
      <div className="grid grid-cols-1 gap-4">
        {integrations.map((item) => (
          <div key={item.key} className="wms-card p-5 flex items-center justify-between gap-4">
            <div className="flex items-center gap-4 flex-1">
              <div className={cn('h-10 w-10 rounded-xl flex items-center justify-center flex-shrink-0',
                item.connected ? 'bg-success/10' : 'bg-muted')}>
                {item.connected
                  ? <Plug className="h-5 w-5 text-success" />
                  : <Unplug className="h-5 w-5 text-muted-foreground" />}
              </div>
              <div>
                <p className="font-medium text-sm">{item.name}</p>
                <p className="text-xs text-muted-foreground">{item.description}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 flex-shrink-0">
              <Badge variant="outline" className={cn('text-xs', item.connected
                ? 'bg-success/10 text-success border-success/20'
                : 'bg-muted text-muted-foreground')}>
                {item.connected ? 'Connected' : 'Not Configured'}
              </Badge>
              <Button variant="outline" size="sm" onClick={() => openModal(item)} disabled={!isAdmin}>
                {item.connected ? 'Manage' : 'Configure'}
              </Button>
            </div>
          </div>
        ))}
      </div>
      {!isAdmin && <p className="text-xs text-muted-foreground flex items-center gap-1.5"><Shield className="h-3.5 w-3.5" />Only administrators can manage integrations.</p>}

      <Dialog open={modal.open} onOpenChange={(o) => !o && setModal({ open: false, item: null })}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{modal.item?.name}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">{modal.item?.description}</p>
            <ToggleRow label="Connected" description="Enable or disable this integration"
              checked={modalForm.connected} onCheckedChange={(v) => setModalForm((f) => ({ ...f, connected: v }))} />
            <Field label="Connection Details (optional)">
              <Textarea
                value={modalForm.connectionDetails}
                onChange={(e) => setModalForm((f) => ({ ...f, connectionDetails: e.target.value }))}
                placeholder="API endpoint, credentials notes, etc."
                rows={3}
              />
            </Field>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setModal({ open: false, item: null })}>Cancel</Button>
            <Button onClick={saveIntegration} disabled={updateIntegration.isPending} className="gap-2">
              {updateIntegration.isPending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />}
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ─── Tab 6: Appearance ────────────────────────────────────────────────────────

function AppearanceTab({ theme, setTheme, primaryColor, setPrimaryColor }: {
  theme: string; setTheme: (t: any) => void;
  primaryColor: string; setPrimaryColor: (c: string) => void;
}) {
  const [colorInput, setColorInput] = useState(primaryColor);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => { setColorInput(primaryColor); }, [primaryColor]);

  const handleColorChange = useCallback((val: string) => {
    setColorInput(val);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      if (/^#[0-9A-Fa-f]{6}$/.test(val)) setPrimaryColor(val);
    }, 500);
  }, [setPrimaryColor]);

  const THEMES = [
    { value: 'light', label: 'Light', icon: Sun, desc: 'Clean light interface' },
    { value: 'dark', label: 'Dark', icon: Moon, desc: 'Easy on the eyes' },
    { value: 'system', label: 'System', icon: Monitor, desc: 'Follows OS preference' },
  ] as const;

  return (
    <div className="space-y-6">
      <SectionHeader title="Appearance" description="Customize the look and feel of your workspace" />

      <div className="wms-card p-5 space-y-4">
        <h3 className="text-sm font-semibold">Theme</h3>
        <Separator />
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {THEMES.map(({ value, label, icon: Icon, desc }) => (
            <button
              key={value}
              onClick={() => setTheme(value)}
              className={cn(
                'p-4 rounded-xl border-2 text-left transition-all hover:border-primary/40',
                theme === value ? 'border-primary bg-primary/5' : 'border-border bg-card',
              )}
            >
              <Icon className={cn('h-6 w-6 mb-2', theme === value ? 'text-primary' : 'text-muted-foreground')} />
              <p className="font-medium text-sm">{label}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{desc}</p>
              {theme === value && <CheckCircle2 className="h-4 w-4 text-primary mt-2" />}
            </button>
          ))}
        </div>
      </div>

      <div className="wms-card p-5 space-y-4">
        <h3 className="text-sm font-semibold">Brand Color</h3>
        <Separator />
        <p className="text-xs text-muted-foreground">Sets the primary accent color across the interface</p>
        <div className="flex items-center gap-3">
          <div className="relative">
            <input
              type="color"
              value={colorInput}
              onChange={(e) => handleColorChange(e.target.value)}
              className="h-10 w-10 rounded-lg cursor-pointer border border-border p-0.5"
            />
          </div>
          <Input
            value={colorInput}
            onChange={(e) => handleColorChange(e.target.value)}
            placeholder="#2B9E8C"
            className="w-36 font-mono"
            maxLength={7}
          />
          <div className="h-10 w-10 rounded-lg border border-border" style={{ backgroundColor: colorInput }} />
          <Button variant="outline" size="sm" onClick={() => handleColorChange('#2B9E8C')} className="gap-1.5">
            <RefreshCw className="h-3.5 w-3.5" />Reset
          </Button>
        </div>
      </div>
    </div>
  );
}

// ─── Shared Components ───────────────────────────────────────────────────────

function SectionHeader({ title, description }: { title: string; description: string }) {
  return (
    <div>
      <h2 className="text-lg font-semibold">{title}</h2>
      <p className="text-sm text-muted-foreground mt-0.5">{description}</p>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <Label className="text-sm">{label}</Label>
      {children}
    </div>
  );
}

function ToggleRow({ label, description, checked, onCheckedChange }: {
  label: string; description: string; checked: boolean; onCheckedChange: (v: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between gap-4 py-1">
      <div>
        <p className="text-sm font-medium">{label}</p>
        <p className="text-xs text-muted-foreground">{description}</p>
      </div>
      <Switch checked={checked} onCheckedChange={onCheckedChange} />
    </div>
  );
}

function SaveBar({ onSave, isPending }: { onSave: () => void; isPending: boolean }) {
  return (
    <div className="flex justify-end pt-2">
      <Button onClick={onSave} disabled={isPending} className="gap-2">
        {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
        Save Changes
      </Button>
    </div>
  );
}

function SettingsSkeleton() {
  return (
    <div className="space-y-4">
      {[1, 2, 3].map((i) => <Skeleton key={i} className="h-16 w-full" />)}
    </div>
  );
}
