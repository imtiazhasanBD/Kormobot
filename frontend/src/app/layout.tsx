import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { QueryProvider } from '@/components/providers/query-provider';
import { I18nProvider } from '@/lib/i18n/i18n-context';
import { TooltipProvider } from '@/components/ui/tooltip';

const inter = Inter({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
  variable: '--font-sans',
});

export const metadata: Metadata = {
  title: 'Kormobot AI — Autonomous AI Job Application Agent',
  description: 'Full Stack Next.js + NestJS AI Job Application Agent SaaS',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${inter.variable} font-sans h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-background text-foreground tracking-[-0.01em]">
        <QueryProvider>
          <I18nProvider>
            <TooltipProvider>{children}</TooltipProvider>
          </I18nProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
