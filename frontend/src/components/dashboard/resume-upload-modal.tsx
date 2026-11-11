'use client';

import React, { useState } from 'react';
import { AxiosError } from 'axios';
import { useI18n } from '@/lib/i18n/i18n-context';
import { UploadCloud, CheckCircle2, AlertCircle, Loader2, Sparkles } from 'lucide-react';
import api from '@/lib/api';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface ResumeUploadModalProps {
  isOpen: boolean;
  onSuccess: (data: unknown) => void;
  canClose?: boolean;
  onClose?: () => void;
}

export function ResumeUploadModal({
  isOpen,
  onSuccess,
  canClose = false,
  onClose,
}: ResumeUploadModalProps) {
  const { t, locale } = useI18n();
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState(false);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelected(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFileSelected(e.target.files[0]);
    }
  };

  const handleFileSelected = (selectedFile: File) => {
    setError(null);
    if (!selectedFile.name.toLowerCase().endsWith('.pdf')) {
      setError(
        locale === 'bn'
          ? 'শুধুমাত্র PDF ফাইল গ্রহণযোগ্য।'
          : 'Only PDF format is supported.',
      );
      return;
    }
    if (selectedFile.size > 5 * 1024 * 1024) {
      setError(
        locale === 'bn'
          ? 'ফাইলের সাইজ ৫MB এর বেশি হওয়া যাবে না।'
          : 'File size must be under 5MB.',
      );
      return;
    }
    setFile(selectedFile);
  };

  const handleUpload = async () => {
    if (!file) return;
    setIsUploading(true);
    setError(null);

    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await api.post('/users/resume/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      onSuccess(res.data);
    } catch (err: unknown) {
      const axiosErr = err as AxiosError<{ message?: string | string[] }>;
      const msg = axiosErr?.response?.data?.message;
      setError(
        (Array.isArray(msg) ? msg[0] : msg) ||
          (locale === 'bn'
            ? 'রিজিউম আপলোড বা পার্স করতে সমস্যা হয়েছে।'
            : 'Failed to upload or parse resume. Please check the PDF format.'),
      );
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <Dialog
      open={isOpen}
      disablePointerDismissal={!canClose}
      onOpenChange={(open) => {
        if (!open && canClose && onClose && !isUploading) {
          onClose();
        }
      }}
    >
      <DialogContent
        showCloseButton={canClose && !!onClose && !isUploading}
        className="sm:max-w-lg p-6 gap-5"
      >
        <DialogHeader className="flex-row items-center gap-3 space-y-0 text-left">
          <div className="w-10 h-10 rounded-md bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shrink-0">
            <Sparkles className="w-5 h-5" />
          </div>
          <div className="space-y-1">
            <DialogTitle className="text-lg font-bold text-foreground leading-tight">
              {locale === 'bn' ? 'রিজিউম আপলোড করুন' : 'Upload Your Resume'}
            </DialogTitle>
            <DialogDescription className="text-xs">
              {locale === 'bn'
                ? 'এআই স্বয়ংক্রিয়ভাবে তথ্য এক্সট্র্যাক্ট করে আপনার প্রোফাইল তৈরি করবে'
                : 'AI will parse your resume to build your autonomous application profile'}
            </DialogDescription>
          </div>
        </DialogHeader>

        {error && (
          <Alert variant="destructive" className="bg-destructive/5 border-destructive/25">
            <AlertCircle className="w-4 h-4" />
            <AlertDescription className="text-xs font-medium">{error}</AlertDescription>
          </Alert>
        )}

        <div
          role="button"
          tabIndex={0}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              document.getElementById('resume-file-input')?.click();
            }
          }}
          className={cn(
            'border-2 border-dashed rounded-md p-8 text-center transition-all cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-ring',
            dragActive
              ? 'border-primary bg-primary/5'
              : file
                ? 'border-success bg-success-muted/60'
                : 'border-border hover:border-primary bg-background',
          )}
          onClick={() => document.getElementById('resume-file-input')?.click()}
        >
          <input
            id="resume-file-input"
            type="file"
            accept=".pdf"
            className="hidden"
            onChange={handleFileChange}
            disabled={isUploading}
          />

          {file ? (
            <div className="space-y-1">
              <CheckCircle2 className="w-8 h-8 text-success mx-auto" />
              <p className="text-sm font-semibold text-foreground truncate">
                {file.name}
              </p>
              <p className="text-xs text-muted-foreground">
                {(file.size / 1024).toFixed(1)} KB —{' '}
                <span className="text-primary underline">Click to change</span>
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              <UploadCloud className="w-10 h-10 text-muted-foreground mx-auto" />
              <div>
                <p className="text-sm font-medium text-foreground">
                  {locale === 'bn'
                    ? 'পিডিএফ ফাইল ড্রপ করুন অথবা ক্লিক করে ব্রাউজ করুন'
                    : 'Drag & drop your PDF resume here, or browse'}
                </p>
                <p className="text-xs text-muted-foreground mt-1">PDF (Max 5MB)</p>
              </div>
            </div>
          )}
        </div>

        <DialogFooter className="-mx-6 -mb-6 px-6 py-4">
          {canClose && onClose && (
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isUploading}
              className="text-xs font-semibold cursor-pointer"
            >
              {t.common.cancel}
            </Button>
          )}

          <Button
            type="button"
            onClick={handleUpload}
            disabled={!file || isUploading}
            className="gap-2 text-xs font-semibold cursor-pointer"
          >
            {isUploading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>
                  {locale === 'bn' ? 'এআই পার্স করছে...' : 'Parsing with AI...'}
                </span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>
                  {locale === 'bn' ? 'আপলোড ও বিশ্লেষণ করুন' : 'Upload & Parse Resume'}
                </span>
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
