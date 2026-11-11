'use client';

import { useState } from 'react';
import { useI18n } from '@/lib/i18n/i18n-context';
import { Search, MapPin, Filter, Sparkles, Building2 } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

export default function JobsPage() {
  const { t, locale } = useI18n();
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <div className="space-y-6">
      {/* Header section */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-foreground">
            {t.jobs.title}
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            {t.jobs.subtitle}
          </p>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <Card className="p-0 shadow-2xs">
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3.5 top-3 text-muted-foreground pointer-events-none" />
              <Input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={t.jobs.searchPlaceholder}
                className="h-10 pl-10 pr-4 bg-background"
              />
            </div>
            <div className="flex flex-wrap gap-2">
              <Button
                type="button"
                variant="outline"
                className="h-10 px-4 gap-2 text-sm font-medium cursor-pointer"
              >
                <MapPin className="w-4 h-4 text-muted-foreground" />
                <span>{locale === 'bn' ? 'অবস্থান' : 'Location'}</span>
              </Button>
              <Button
                type="button"
                variant="outline"
                className="h-10 px-4 gap-2 text-sm font-medium cursor-pointer"
              >
                <Filter className="w-4 h-4 text-muted-foreground" />
                <span>{locale === 'bn' ? 'ফিল্টার' : 'Filters'}</span>
              </Button>
              <Button
                type="button"
                className="h-10 px-5 gap-2 text-sm font-semibold shadow-xs cursor-pointer"
              >
                <Sparkles className="w-4 h-4" />
                <span>{locale === 'bn' ? 'অনুসন্ধান' : 'Search Jobs'}</span>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Job listings empty state / placeholder card */}
      <Card className="p-0 shadow-2xs">
        <CardContent className="p-8 text-center">
          <div className="w-12 h-12 rounded-md bg-primary/10 border border-primary/20 flex items-center justify-center text-primary mx-auto mb-3">
            <Building2 className="w-6 h-6" />
          </div>
          <h3 className="text-base font-semibold text-foreground">
            {locale === 'bn' ? 'কোন চাকরি লোড করা হয়নি' : 'No jobs searched yet'}
          </h3>
          <p className="text-sm text-muted-foreground max-w-md mx-auto mt-1 mb-4">
            {locale === 'bn'
              ? 'চাকরির পদবি বা প্রযুক্তি লিখে এআই দিয়ে চাকরি খুঁজুন এবং সরাসরি স্বয়ংক্রিয়ভাবে আবেদন করুন।'
              : 'Enter a role or keywords above to query Greenhouse, Lever, and Workable via Tavily/Brave/Serper.'}
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
