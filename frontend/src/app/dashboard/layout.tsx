'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useI18n } from '@/lib/i18n/i18n-context';
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
  Globe,
  Sparkles,
  Menu,
  X,
} from 'lucide-react';
import api from '@/lib/api';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { t, locale, setLocale } = useI18n();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

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

  const toggleLanguage = () => {
    setLocale(locale === 'en' ? 'bn' : 'en');
  };

  const isActive = (href: string) => {
    if (href === '/dashboard/jobs' && pathname === '/dashboard') return true;
    return pathname.startsWith(href);
  };

  return (
    <div className="min-h-screen bg-[#f8f9fd] flex text-foreground font-sans antialiased">
      {/* Mobile Backdrop */}
      {mobileOpen && (
        <div
          onClick={() => setMobileOpen(false)}
          className="fixed inset-0 bg-black/40 backdrop-blur-xs z-40 lg:hidden"
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 bg-white border-r border-[#e5e7eb] flex flex-col transition-all duration-300 ease-in-out ${
          collapsed ? 'w-20' : 'w-64'
        } ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Sidebar Header */}
        <div className="h-16 px-4 border-b border-[#f1f2f6] flex items-center justify-between">
          <Link
            href="/dashboard"
            className="flex items-center gap-3 overflow-hidden group"
          >
            <div className="w-9 h-9 rounded-md bg-[#371ee1] flex items-center justify-center text-white shrink-0 shadow-sm shadow-[#371ee1]/25 group-hover:scale-105 transition-transform">
              <Bot className="w-5 h-5" />
            </div>
            {!collapsed && (
              <div className="flex flex-col">
                <span className="font-bold text-base tracking-tight text-slate-900 leading-tight">
                  Kormobot AI
                </span>
                <span className="text-[10px] text-muted-foreground uppercase font-semibold tracking-wider">
                  Autonomous Agent
                </span>
              </div>
            )}
          </Link>

          {/* Desktop collapse toggle */}
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="hidden lg:flex w-7 h-7 rounded-md border border-[#e5e7eb] items-center justify-center text-muted-foreground hover:text-foreground hover:bg-[#f8f9fd] transition-colors"
            title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {collapsed ? (
              <ChevronRight className="w-4 h-4" />
            ) : (
              <ChevronLeft className="w-4 h-4" />
            )}
          </button>

          {/* Mobile close button */}
          <button
            onClick={() => setMobileOpen(false)}
            className="lg:hidden p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-slate-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Links */}
        <div className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                title={collapsed ? item.label : undefined}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-all ${
                  active
                    ? 'bg-[#371ee1] text-white shadow-sm shadow-[#371ee1]/20 font-semibold'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-[#f4f5fa]'
                }`}
              >
                <Icon
                  className={`w-5 h-5 shrink-0 ${
                    active ? 'text-white' : 'text-slate-500'
                  }`}
                />
                {!collapsed && <span className="truncate">{item.label}</span>}
              </Link>
            );
          })}
        </div>

        {/* Pro / Credits Banner (when expanded) */}
        {!collapsed && (
          <div className="p-3 mx-3 mb-2 rounded-md bg-gradient-to-br from-[#371ee1]/10 via-[#371ee1]/5 to-transparent border border-[#371ee1]/20">
            <div className="flex items-center gap-2 mb-1">
              <Sparkles className="w-4 h-4 text-[#371ee1]" />
              <span className="text-xs font-semibold text-[#371ee1]">
                Daily AI Applies
              </span>
            </div>
            <div className="flex justify-between items-center text-xs text-slate-600 mb-2">
              <span>Remaining: 5 / 5 free</span>
            </div>
            <Link
              href="/dashboard/billing"
              className="block w-full text-center py-1.5 px-2 bg-[#371ee1] hover:bg-[#2e17c4] text-white text-xs font-semibold rounded-md transition-colors shadow-xs"
            >
              {t.billing.upgrade}
            </Link>
          </div>
        )}

        {/* Sidebar Footer */}
        <div className="p-3 border-t border-[#f1f2f6] space-y-1">
          {/* Billing Link */}
          <Link
            href="/dashboard/billing"
            title={collapsed ? t.nav.billing : undefined}
            className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
              pathname === '/dashboard/billing'
                ? 'bg-[#371ee1]/10 text-[#371ee1] font-semibold'
                : 'text-slate-600 hover:text-slate-900 hover:bg-[#f4f5fa]'
            }`}
          >
            <CreditCard className="w-5 h-5 shrink-0 text-slate-500" />
            {!collapsed && <span className="truncate">{t.nav.billing}</span>}
          </Link>

          {/* Profile Settings Link */}
          <Link
            href="/dashboard/profile"
            title={collapsed ? t.nav.settings : undefined}
            className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
              pathname === '/dashboard/profile'
                ? 'bg-[#371ee1]/10 text-[#371ee1] font-semibold'
                : 'text-slate-600 hover:text-slate-900 hover:bg-[#f4f5fa]'
            }`}
          >
            <Settings className="w-5 h-5 shrink-0 text-slate-500" />
            {!collapsed && <span className="truncate">{t.nav.settings}</span>}
          </Link>

          {/* Logout */}
          <button
            onClick={handleLogout}
            title={collapsed ? t.common.logout : undefined}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium text-red-600 hover:bg-red-50 hover:text-red-700 transition-colors"
          >
            <LogOut className="w-5 h-5 shrink-0 text-red-500" />
            {!collapsed && <span className="truncate">{t.common.logout}</span>}
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div
        className={`flex-1 flex flex-col transition-all duration-300 ease-in-out min-w-0 ${
          collapsed ? 'lg:pl-20' : 'lg:pl-64'
        }`}
      >
        {/* Top Header */}
        <header className="h-16 sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-[#e5e7eb] px-4 sm:px-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileOpen(true)}
              className="lg:hidden p-2 rounded-md border border-[#e5e7eb] text-slate-600 hover:bg-[#f8f9fd]"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className="flex flex-col">
              <h1 className="text-base sm:text-lg font-bold text-slate-900 leading-tight">
                {navItems.find((n) => isActive(n.href))?.label ||
                  (pathname.includes('billing') ? t.nav.billing : t.common.dashboard)}
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Language Toggle */}
            <button
              onClick={toggleLanguage}
              className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold rounded-md border border-[#e5e7eb] bg-white hover:bg-[#f8f9fd] text-slate-700 transition-colors shadow-2xs"
            >
              <Globe className="w-3.5 h-3.5 text-[#371ee1]" />
              <span>{locale === 'en' ? 'বাংলা' : 'English'}</span>
            </button>

            {/* User Avatar Placeholder */}
            <Link
              href="/dashboard/profile"
              className="w-8 h-8 rounded-md bg-[#371ee1]/10 border border-[#371ee1]/20 flex items-center justify-center text-[#371ee1] font-bold text-xs hover:ring-2 hover:ring-[#371ee1]/30 transition-all"
            >
              <User className="w-4 h-4" />
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

