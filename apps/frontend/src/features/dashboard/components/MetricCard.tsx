import { cn } from '@/shared/lib/utils';
import { LucideIcon } from 'lucide-react';

interface MetricCardProps {
  title: string;
  value: string | number;
  change?: {
    value: number;
    trend: 'up' | 'down' | 'neutral';
  };
  icon: LucideIcon;
  iconColor?: string;
  iconBg?: string;
  subtitle?: string;
  className?: string;
  variant?: 'default' | 'compact';
  accentColor?: string;
}

export function MetricCard({
  title,
  value,
  change,
  icon: Icon,
  iconColor = 'text-accent',
  iconBg,
  subtitle,
  className,
  variant = 'default',
  accentColor,
}: MetricCardProps) {
  if (variant === 'compact') {
    return (
      <div className={cn('wms-card p-4 group hover:shadow-md transition-all', className)}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <div className={cn(
              'h-10 w-10 rounded-xl flex items-center justify-center flex-shrink-0 transition-transform group-hover:scale-110',
              iconBg || 'bg-gradient-to-br from-accent/20 to-accent/5'
            )}>
              <Icon className={cn('h-5 w-5', iconColor)} />
            </div>
            <div className="min-w-0">
              <p className="text-xs text-muted-foreground font-medium truncate">{title}</p>
              <p className="text-2xl font-bold tracking-tight text-foreground leading-tight">
                {typeof value === 'number' ? value.toLocaleString() : value}
              </p>
            </div>
          </div>
          {change && (
            <div className={cn(
              'flex items-center gap-0.5 text-xs font-semibold px-2 py-1 rounded-full ml-2',
              change.trend === 'up' && 'bg-success/10 text-success',
              change.trend === 'down' && 'bg-destructive/10 text-destructive',
              change.trend === 'neutral' && 'bg-muted text-muted-foreground'
            )}>
              {change.trend === 'up' ? '↑' : change.trend === 'down' ? '↓' : '→'}
              {Math.abs(change.value)}%
            </div>
          )}
        </div>
        {subtitle && (
          <p className="text-xs text-muted-foreground mt-2 pl-[52px] truncate">{subtitle}</p>
        )}
        {accentColor && (
          <div className={cn('h-0.5 rounded-full mt-3', accentColor)} />
        )}
      </div>
    );
  }

  return (
    <div className={cn('wms-card-metric group', className)}>
      <div className="relative z-10">
        <div className="flex items-start justify-between mb-4">
          <div className={cn(
            'h-11 w-11 rounded-xl flex items-center justify-center transition-transform group-hover:scale-110',
            iconBg || 'bg-gradient-to-br from-accent/20 to-accent/5'
          )}>
            <Icon className={cn('h-5 w-5', iconColor)} />
          </div>
          {change && (
            <div className={cn(
              'flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full',
              change.trend === 'up' && 'bg-success/10 text-success',
              change.trend === 'down' && 'bg-destructive/10 text-destructive',
              change.trend === 'neutral' && 'bg-muted text-muted-foreground'
            )}>
              <span>
                {change.trend === 'up' && '↑'}
                {change.trend === 'down' && '↓'}
                {change.trend === 'neutral' && '→'}
              </span>
              <span>{Math.abs(change.value)}%</span>
            </div>
          )}
        </div>
        <div>
          <p className="text-sm text-muted-foreground mb-1">{title}</p>
          <p className="text-3xl font-bold tracking-tight text-foreground">
            {typeof value === 'number' ? value.toLocaleString() : value}
          </p>
          {subtitle && (
            <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>
          )}
        </div>
      </div>
    </div>
  );
}
