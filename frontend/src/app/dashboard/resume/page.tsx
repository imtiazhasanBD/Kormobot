'use client';

import { useState } from 'react';
import { useI18n } from '@/lib/i18n/i18n-context';
import { UploadCloud, FileText, CheckCircle2, Clock, Sparkles } from 'lucide-react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import { ResumeUploadModal } from '@/components/dashboard/resume-upload-modal';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';

interface ResumeItem {
  id: string;
  fileName: string;
  createdAt: string;
}

export default function ResumePage() {
  const { locale } = useI18n();
  const queryClient = useQueryClient();
  const [modalOpen, setModalOpen] = useState(false);

  const { data: profileData, isLoading } = useQuery({
    queryKey: ['profile'],
    queryFn: async () => {
      const res = await api.get('/users/profile');
      return res.data;
    },
  });

  const resumes: ResumeItem[] = profileData?.user?.resumes || [];

  const handleUploadSuccess = () => {
    setModalOpen(false);
    queryClient.invalidateQueries({ queryKey: ['profile'] });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-foreground">
            {locale === 'bn' ? 'রিজিউম' : 'Resume'}
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            {locale === 'bn'
              ? 'আপনার জীবনবৃত্তান্ত (PDF) আপলোড করুন। আমাদের এআই এটি পার্স করে স্বয়ংক্রিয়ভাবে ফর্ম পূরণ করবে।'
              : 'Upload your latest PDF resume. Our dynamic AI engine extracts your experience, skills, and projects.'}
          </p>
        </div>

        <Button
          type="button"
          onClick={() => setModalOpen(true)}
          className="gap-2 text-xs font-semibold shadow-xs self-start sm:self-auto cursor-pointer"
        >
          <UploadCloud className="w-4 h-4" />
          <span>{locale === 'bn' ? 'নতুন রিজিউম আপলোড' : 'Upload New Resume'}</span>
        </Button>
      </div>

      {/* Upload Box Trigger */}
      <Card
        role="button"
        tabIndex={0}
        onClick={() => setModalOpen(true)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            setModalOpen(true);
          }
        }}
        className="border-2 border-dashed border-border hover:border-primary ring-0 shadow-2xs cursor-pointer group transition-colors p-0"
      >
        <CardContent className="p-10 text-center">
          <div className="w-12 h-12 rounded-md bg-primary/10 border border-primary/20 flex items-center justify-center text-primary mx-auto mb-4 group-hover:scale-105 transition-transform">
            <UploadCloud className="w-6 h-6" />
          </div>
          <h3 className="text-base font-semibold text-foreground mb-1">
            {locale === 'bn' ? 'পিডিএফ রিজিউম আপলোড করুন' : 'Click to upload your resume'}
          </h3>
          <p className="text-xs text-muted-foreground mb-4">
            PDF format only (Max 5MB)
          </p>
          <Button type="button" size="sm" className="gap-1.5 text-xs font-semibold shadow-xs pointer-events-none">
            <Sparkles className="w-3.5 h-3.5" />
            <span>{locale === 'bn' ? 'ফাইল নির্বাচন করুন' : 'Browse Files'}</span>
          </Button>
        </CardContent>
      </Card>

      {/* Previous Resumes list */}
      <Card className="p-0 shadow-2xs gap-0">
        <CardHeader className="px-6 py-4 border-b border-border">
          <CardTitle className="text-sm font-bold text-foreground">
            {locale === 'bn' ? 'আপলোডকৃত রিজিউম ফাইলসমূহ' : 'Uploaded Resumes'}
          </CardTitle>
        </CardHeader>

        <CardContent className="p-6">
          {isLoading ? (
            <div className="space-y-3">
              <Skeleton className="h-14 w-full" />
              <Skeleton className="h-14 w-full" />
            </div>
          ) : resumes.length === 0 ? (
            <div className="text-center py-6 text-muted-foreground text-sm">
              <FileText className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
              <p>{locale === 'bn' ? 'এখনও কোন রিজিউম আপলোড করা হয়নি।' : 'No resumes uploaded yet.'}</p>
            </div>
          ) : (
            <div className="divide-y divide-border">
              {resumes.map((res) => (
                <div key={res.id} className="py-3 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-9 h-9 rounded-md bg-primary/10 text-primary flex items-center justify-center shrink-0">
                      <FileText className="w-5 h-5" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-foreground truncate">{res.fileName}</p>
                      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                        <Clock className="w-3.5 h-3.5" />
                        <span>{new Date(res.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                  <Badge
                    variant="outline"
                    className="gap-1 px-2.5 py-1 h-auto rounded-md text-[11px] font-semibold bg-success-muted text-success-muted-foreground border-success-border"
                  >
                    <CheckCircle2 className="w-3 h-3" />
                    <span>{locale === 'bn' ? 'সক্রিয়' : 'Active'}</span>
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <ResumeUploadModal
        isOpen={modalOpen}
        canClose={true}
        onClose={() => setModalOpen(false)}
        onSuccess={handleUploadSuccess}
      />
    </div>
  );
}
