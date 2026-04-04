import { ReactNode } from 'react';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { useWMS } from '@/shared/contexts/WMSContext';
import { cn } from '@/shared/lib/utils';

interface AppLayoutProps {
  children: ReactNode;
  title: string;
  breadcrumbs?: { label: string; href?: string }[];
}

export function AppLayout({ children, title, breadcrumbs }: AppLayoutProps) {
  const { isSidebarCollapsed } = useWMS();

  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      <div
        className={cn(
          'transition-all duration-300',
          isSidebarCollapsed ? 'ml-[72px]' : 'ml-64'
        )}
      >
        <Header title={title} breadcrumbs={breadcrumbs} />
        <main className="p-6 animate-fade-in">
          {children}
        </main>
      </div>
    </div>
  );
}
