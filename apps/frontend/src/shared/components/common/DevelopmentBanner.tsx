import { Badge } from '@/shared/components/ui/badge';

interface DevelopmentBannerProps {
  message?: string;
  className?: string;
}

export function DevelopmentBanner({ 
  message = "This page is currently in development and will be available in production soon.",
  className = "" 
}: DevelopmentBannerProps) {
  return (
    <div className={`mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg ${className}`}>
      <div className="flex items-center gap-2">
        <div className="h-3 w-3 bg-yellow-400 rounded-full animate-pulse"></div>
        <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 border-yellow-300">
          Under Development (Need to push Production)
        </Badge>
        <span className="text-sm text-yellow-700">{message}</span>
      </div>
    </div>
  );
}
