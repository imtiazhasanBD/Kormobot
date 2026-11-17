'use client';

import { useState } from 'react';
import { useI18n } from '@/lib/i18n/i18n-context';
import {
  UploadCloud,
  FileText,
  Clock,
  Sparkles,
  Download,
  Trash2,
  Loader2,
  AlertCircle,
} from 'lucide-react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import { ResumeUploadModal } from '@/components/dashboard/resume-upload-modal';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface ResumeItem {
  id: string;
  fileName: string;
  fileUrl?: string;
  fileSize?: number | null;
  createdAt: string;
}

function formatFileSize(bytes?: number | null): string {
  if (!bytes || bytes <= 0) return '—';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function formatDate(dateStr: string, locale: string): string {
  try {
    const d = new Date(dateStr);
    return d.toLocaleDateString(locale === 'bn' ? 'bn-BD' : 'en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  } catch {
    return dateStr;
  }
}

export default function ResumePage() {
  const { locale } = useI18n();
  const queryClient = useQueryClient();
  const [modalOpen, setModalOpen] = useState(false);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [resumeToDelete, setResumeToDelete] = useState<ResumeItem | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

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

  const handleDownload = async (resume: ResumeItem) => {
    try {
      setDownloadingId(resume.id);
      setActionError(null);
      const response = await api.get(`/users/resume/${resume.id}/download`, {
        responseType: 'blob',
      });
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', resume.fileName || 'resume.pdf');
      document.body.appendChild(link);
      link.click();
      link.parentNode?.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (err: unknown) {
      console.error('Failed to download resume:', err);
      setActionError(
        locale === 'bn'
          ? 'রিজিউম ফাইলটি ডাউনলোড করতে সমস্যা হয়েছে।'
          : 'Failed to download the resume file. Please try again.',
      );
    } finally {
      setDownloadingId(null);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!resumeToDelete) return;
    try {
      setDeletingId(resumeToDelete.id);
      setActionError(null);
      await api.delete(`/users/resume/${resumeToDelete.id}`);
      setResumeToDelete(null);
      queryClient.invalidateQueries({ queryKey: ['profile'] });
    } catch (err: unknown) {
      console.error('Failed to delete resume:', err);
      setActionError(
        locale === 'bn'
          ? 'রিজিউমটি মুছে ফেলা সম্ভব হয়নি।'
          : 'Failed to delete the resume. Please try again.',
      );
    } finally {
      setDeletingId(null);
    }
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

      {actionError && (
        <div className="p-3 text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-lg flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{actionError}</span>
        </div>
      )}

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
          <p className="text-xs text-muted-foreground mb-4">PDF format only (Max 5MB)</p>
          <Button
            type="button"
            size="sm"
            className="gap-1.5 text-xs font-semibold shadow-xs pointer-events-none"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>{locale === 'bn' ? 'ফাইল নির্বাচন করুন' : 'Browse Files'}</span>
          </Button>
        </CardContent>
      </Card>

      {/* Your Resumes Section */}
      <Card className="p-0 shadow-2xs gap-0 overflow-hidden">
        <CardHeader className="px-6 py-4 border-b border-border">
          <CardTitle className="text-base font-bold text-foreground">
            {locale === 'bn' ? 'আপনার রিজিউমসমূহ' : 'Your resumes'}
          </CardTitle>
        </CardHeader>

        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-6 space-y-3">
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
            </div>
          ) : resumes.length === 0 ? (
            <div className="text-center py-10 text-muted-foreground text-sm">
              <FileText className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
              <p>{locale === 'bn' ? 'এখনও কোন রিজিউম আপলোড করা হয়নি।' : 'No resumes uploaded yet.'}</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-border text-xs font-medium text-muted-foreground">
                    <th className="py-3 px-6">{locale === 'bn' ? 'ফাইল' : 'File'}</th>
                    <th className="py-3 px-6">{locale === 'bn' ? 'আপলোডের তারিখ' : 'Uploaded'}</th>
                    <th className="py-3 px-6">{locale === 'bn' ? 'সাইজ' : 'Size'}</th>
                    <th className="py-3 px-6">{locale === 'bn' ? 'স্ট্যাটাস' : 'Status'}</th>
                    <th className="py-3 px-6 text-right">{locale === 'bn' ? 'অ্যাকশন' : 'Actions'}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border text-sm">
                  {resumes.map((res, index) => {
                    const isPrimary = index === 0;
                    const isDownloading = downloadingId === res.id;
                    const isDeleting = deletingId === res.id;

                    return (
                      <tr key={res.id} className="hover:bg-muted/40 transition-colors">
                        {/* File Name + Primary Tag */}
                        <td className="py-4 px-6 font-medium text-foreground">
                          <div className="flex items-center gap-2">
                            <span className="truncate max-w-xs md:max-w-md font-semibold text-foreground">
                              {res.fileName}
                            </span>
                            {isPrimary && (
                              <Badge
                                variant="secondary"
                                className="px-2 py-0.5 text-[11px] font-medium bg-muted text-muted-foreground rounded-md shrink-0"
                              >
                                {locale === 'bn' ? 'প্রাথমিক' : 'Primary'}
                              </Badge>
                            )}
                          </div>
                        </td>

                        {/* Uploaded Date */}
                        <td className="py-4 px-6 text-muted-foreground text-sm whitespace-nowrap">
                          {formatDate(res.createdAt, locale)}
                        </td>

                        {/* Size */}
                        <td className="py-4 px-6 text-muted-foreground text-sm whitespace-nowrap">
                          {formatFileSize(res.fileSize)}
                        </td>

                        {/* Status (Parsed pill) */}
                        <td className="py-4 px-6 whitespace-nowrap">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#84cc16]/20 text-[#4d7c0f] dark:bg-[#84cc16]/25 dark:text-[#a3e635]">
                            {locale === 'bn' ? 'পার্সড' : 'Parsed'}
                          </span>
                        </td>

                        {/* Actions: Download & Delete */}
                        <td className="py-4 px-6 text-right whitespace-nowrap">
                          <div className="flex items-center justify-end gap-1">
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon-sm"
                              onClick={() => handleDownload(res)}
                              disabled={isDownloading || isDeleting}
                              title={locale === 'bn' ? 'ডাউনলোড করুন' : 'Download'}
                              aria-label={locale === 'bn' ? 'ডাউনলোড করুন' : 'Download'}
                              className="text-muted-foreground hover:text-foreground cursor-pointer"
                            >
                              {isDownloading ? (
                                <Loader2 className="w-4 h-4 animate-spin text-primary" />
                              ) : (
                                <Download className="w-4 h-4" />
                              )}
                            </Button>

                            <Button
                              type="button"
                              variant="ghost"
                              size="icon-sm"
                              onClick={() => setResumeToDelete(res)}
                              disabled={isDownloading || isDeleting}
                              title={locale === 'bn' ? 'মুছে ফেলুন' : 'Delete'}
                              aria-label={locale === 'bn' ? 'মুছে ফেলুন' : 'Delete'}
                              className="text-muted-foreground hover:text-destructive cursor-pointer"
                            >
                              {isDeleting ? (
                                <Loader2 className="w-4 h-4 animate-spin text-destructive" />
                              ) : (
                                <Trash2 className="w-4 h-4" />
                              )}
                            </Button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Delete Confirmation Modal */}
      <Dialog
        open={!!resumeToDelete}
        onOpenChange={(open) => {
          if (!open && !deletingId) {
            setResumeToDelete(null);
          }
        }}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-foreground">
              {locale === 'bn' ? 'রিজিউম মুছে ফেলা' : 'Delete Resume'}
            </DialogTitle>
            <DialogDescription className="text-muted-foreground text-sm pt-1">
              {locale === 'bn'
                ? `আপনি কি নিশ্চিত যে "${resumeToDelete?.fileName}" রিজিউমটি মুছে ফেলতে চান? এটি স্থায়ীভাবে মুছে যাবে।`
                : `Are you sure you want to delete "${resumeToDelete?.fileName}"? This action cannot be undone.`}
            </DialogDescription>
          </DialogHeader>

          <DialogFooter className="gap-2 sm:gap-0 mt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setResumeToDelete(null)}
              disabled={!!deletingId}
              className="cursor-pointer"
            >
              {locale === 'bn' ? 'বাতিল' : 'Cancel'}
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={handleDeleteConfirm}
              disabled={!!deletingId}
              className="gap-2 cursor-pointer"
            >
              {deletingId ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>{locale === 'bn' ? 'মুছে ফেলা হচ্ছে...' : 'Deleting...'}</span>
                </>
              ) : (
                <>
                  <Trash2 className="w-4 h-4" />
                  <span>{locale === 'bn' ? 'মুছে ফেলুন' : 'Delete'}</span>
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ResumeUploadModal
        isOpen={modalOpen}
        canClose={true}
        onClose={() => setModalOpen(false)}
        onSuccess={handleUploadSuccess}
      />
    </div>
  );
}
