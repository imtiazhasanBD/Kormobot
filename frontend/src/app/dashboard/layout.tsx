'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useI18n } from '@/lib/i18n/i18n-context';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import {
  Briefcase,
  FileText,
  User,
  Bookmark,
  CheckCircle2,
  CreditCard,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Bot,
  Sparkles,
  Menu,
} from 'lucide-react';
import api from '@/lib/api';
import { ResumeUploadModal } from '@/components/dashboard/resume-upload-modal';
import { LanguageSwitcher } from '@/components/language-switcher';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Sheet, SheetContent, SheetTitle } from '@/components/ui/sheet';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const pathname = usePathname();
  const router = useRouter();
  const queryClient = useQueryClient();
  const { t } = useI18n();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const { data: profileData, isLoading: isProfileLoading } = useQuery({
    queryKey: ['profile'],
    queryFn: async () => {
      const res = await api.get('/users/profile');
      return res.data;
    },
    retry: 1,
  });

  const hasResume =
    (profileData?.user?.resumes && profileData.user.resumes.length > 0) || false;

  const showOnboardingModal = !isProfileLoading && profileData && !hasResume;

  const navItems = [
    {
      href: '/dashboard/jobs',
      label: t.nav.jobs,
      icon: Briefcase,
    },
    {
      href: '/dashboard/resume',
      label: t.nav.resume,
      icon: FileText,
    },
    {
      href: '/dashboard/profile',
      label: t.nav.profile,
      icon: User,
    },
    {
      href: '/dashboard/saved-jobs',
      label: t.nav.savedJobs,
      icon: Bookmark,
    },
    {
      href: '/dashboard/application-status',
      label: t.nav.applicationStatus,
      icon: CheckCircle2,
    },
  ];

  const handleLogout = async () => {
    try {
      await api.post('/auth/logout');
    } catch {
      // ignore
    }
    localStorage.removeItem('kormobot_token');
    document.cookie = 'kormobot_token=; path=/; max-age=0;';
    router.push('/sign-in');
  };

  const isActive = (href: string) => {
    if (href === '/dashboard/jobs' && pathname === '/dashboard') return true;
    return pathname.startsWith(href);
  };

  const handleOnboardingUploadSuccess = () => {
    queryClient.invalidateQueries({ queryKey: ['profile'] });
  };

  const renderNavLink = (
    href: string,
    label: string,
    Icon: React.ComponentType<{ className?: string }>,
    active: boolean,
    isCollapsed: boolean,
    variant: 'primary' | 'subtle' = 'primary',
  ) => {
    const linkClass = cn(
      'flex items-center gap-3 px-3 rounded-md text-sm font-medium transition-all',
      variant === 'primary' ? 'py-2.5' : 'py-2',
      isCollapsed && 'justify-center px-0',
      active
        ? variant === 'primary'
          ? 'bg-primary text-primary-foreground shadow-sm shadow-primary/20 font-semibold'
          : 'bg-primary/10 text-primary font-semibold'
        : 'text-slate-600 hover:text-foreground hover:bg-muted',
    );

    const iconClass = cn(
      'w-5 h-5 shrink-0',
      active && variant === 'primary'
        ? 'text-primary-foreground'
        : active
          ? 'text-primary'
          : 'text-slate-500',
    );

    const linkElement = (
      <Link
        href={href}
        onClick={() => setMobileOpen(false)}
        className={linkClass}
      >
        <Icon className={iconClass} />
        {!isCollapsed && <span className="truncate">{label}</span>}
      </Link>
    );

    if (!isCollapsed) {
      return <React.Fragment key={href}>{linkElement}</React.Fragment>;
    }

    return (
      <Tooltip key={href}>
        <TooltipTrigger render={linkElement} />
        <TooltipContent side="right">{label}</TooltipContent>
      </Tooltip>
    );
  };

  const renderSidebarBody = (isCollapsed: boolean, isMobile = false) => (
    <div className="flex flex-col h-full bg-sidebar text-sidebar-foreground">
      {/* Sidebar Header */}
      <div className="h-16 px-4 border-b border-sidebar-border flex items-center justify-between shrink-0">
        <Link
          href="/dashboard"
          onClick={() => setMobileOpen(false)}
          className="flex items-center gap-3 overflow-hidden group"
        >
          <div className="w-9 h-9 rounded-md bg-primary flex items-center justify-center text-primary-foreground shrink-0 shadow-sm shadow-primary/25 group-hover:scale-105 transition-transform">
            <Bot className="w-5 h-5" />
          </div>
          {!isCollapsed && (
            <div className="flex flex-col">
              <span className="font-bold text-base tracking-tight text-foreground leading-tight">
                Kormobot AI
              </span>
              <span className="text-[10px] text-muted-foreground uppercase font-semibold tracking-wider">
                Autonomous Agent
              </span>
            </div>
          )}
        </Link>

        {!isMobile && (
          <Button
            type="button"
            variant="outline"
            size="icon-sm"
            onClick={() => setCollapsed(!collapsed)}
            className="hidden lg:inline-flex w-7 h-7 text-muted-foreground hover:text-foreground cursor-pointer"
            title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {isCollapsed ? (
              <ChevronRight className="w-4 h-4" />
            ) : (
              <ChevronLeft className="w-4 h-4" />
            )}
          </Button>
        )}
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
        {navItems.map((item) =>
          renderNavLink(
            item.href,
            item.label,
            item.icon,
            isActive(item.href),
            isCollapsed,
            'primary',
          ),
        )}
      </nav>

      {/* Pro / Credits Banner (when expanded) */}
      {!isCollapsed && (
        <Card className="mx-3 mb-2 p-0 bg-gradient-to-br from-primary/10 via-primary/5 to-transparent border-primary/20 ring-0 border shadow-none">
          <CardContent className="p-3 space-y-2">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-primary" />
              <span className="text-xs font-semibold text-primary">
                Daily AI Applies
              </span>
            </div>
            <div className="flex justify-between items-center text-xs text-muted-foreground">
              <span>
                Remaining:{' '}
                {profileData?.user?.credits !== undefined
                  ? profileData.user.credits
                  : 5}{' '}
                / 5 free
              </span>
            </div>
            <Button
              size="sm"
              nativeButton={false}
              render={<Link href="/dashboard/billing" onClick={() => setMobileOpen(false)} />}
              className="w-full text-xs font-semibold shadow-xs"
            >
              {t.billing.upgrade}
            </Button>
          </CardContent>
        </Card>
      )}

      <Separator />

      {/* Sidebar Footer */}
      <div className="p-3 space-y-1">
        {renderNavLink(
          '/dashboard/billing',
          t.nav.billing,
          CreditCard,
          pathname === '/dashboard/billing',
          isCollapsed,
          'subtle',
        )}

        {renderNavLink(
          '/dashboard/profile',
          t.nav.settings,
          Settings,
          pathname === '/dashboard/profile',
          isCollapsed,
          'subtle',
        )}

        {isCollapsed ? (
          <Tooltip>
            <TooltipTrigger
              render={
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={handleLogout}
                  className="w-full text-destructive hover:bg-destructive/10 hover:text-destructive cursor-pointer"
                  aria-label={t.common.logout}
                />
              }
            >
              <LogOut className="w-5 h-5 shrink-0" />
            </TooltipTrigger>
            <TooltipContent side="right">{t.common.logout}</TooltipContent>
          </Tooltip>
        ) : (
          <Button
            type="button"
            variant="ghost"
            onClick={handleLogout}
            className="w-full justify-start gap-3 px-3 py-2 h-9 text-sm font-medium text-destructive hover:bg-destructive/10 hover:text-destructive cursor-pointer"
          >
            <LogOut className="w-5 h-5 shrink-0" />
            <span className="truncate">{t.common.logout}</span>
          </Button>
        )}
      </div>
    </div>
  );

  const initials = profileData?.profile?.fullName
    ? String(profileData.profile.fullName)
        .trim()
        .split(/\s+/)
        .map((n: string) => n[0])
        .slice(0, 2)
        .join('')
        .toUpperCase()
    : '';

  return (
    <div className="min-h-screen bg-background flex text-foreground font-sans antialiased">
      {/* Non-closable Onboarding Modal for First Login when no resume exists */}
      <ResumeUploadModal
        isOpen={showOnboardingModal}
        canClose={false}
        onSuccess={handleOnboardingUploadSuccess}
      />

      {/* Mobile Sidebar Drawer */}
      <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
        <SheetContent side="left" className="w-64 p-0 gap-0 lg:hidden">
          <SheetTitle className="sr-only">Navigation Menu</SheetTitle>
          {renderSidebarBody(false, true)}
        </SheetContent>
      </Sheet>

      {/* Desktop Fixed Sidebar */}
      <aside
        className={cn(
          'hidden lg:flex fixed top-0 bottom-0 left-0 z-40 border-r border-sidebar-border flex-col transition-all duration-300 ease-in-out',
          collapsed ? 'w-20' : 'w-64',
        )}
      >
        {renderSidebarBody(collapsed, false)}
      </aside>

      {/* Main Content Area */}
      <div
        className={cn(
          'flex-1 flex flex-col transition-all duration-300 ease-in-out min-w-0',
          collapsed ? 'lg:pl-20' : 'lg:pl-64',
        )}
      >
        {/* Top Header */}
        <header className="h-16 sticky top-0 z-30 bg-card/80 backdrop-blur-md border-b border-border px-4 sm:px-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button
              type="button"
              variant="outline"
              size="icon"
              onClick={() => setMobileOpen(true)}
              className="lg:hidden cursor-pointer"
              aria-label="Open navigation menu"
            >
              <Menu className="w-5 h-5" />
            </Button>
            <div className="flex flex-col">
              <h1 className="text-base sm:text-lg font-bold text-foreground leading-tight">
                {navItems.find((n) => isActive(n.href))?.label ||
                  (pathname.includes('billing') ? t.nav.billing : t.common.dashboard)}
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <LanguageSwitcher className="bg-card shadow-2xs" />

            <Link
              href="/dashboard/profile"
              className="rounded-md hover:ring-2 hover:ring-primary/30 transition-all"
              aria-label={t.nav.profile}
            >
              <Avatar className="rounded-md after:rounded-md">
                <AvatarFallback className="rounded-md bg-primary/10 text-primary font-bold text-xs border border-primary/20">
                  {initials || <User className="w-4 h-4" />}
                </AvatarFallback>
              </Avatar>
            </Link>
          </div>
        </header>

        {/* Page Children */}
        <main className="flex-1 p-4 sm:p-6 md:p-8 max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
