'use client';

import React, { useState } from 'react';
import { useI18n } from '@/lib/i18n/i18n-context';
import { UploadCloud, CheckCircle2, AlertCircle, Loader2, Sparkles, X } from 'lucide-react';
import api from '@/lib/api';

interface ResumeUploadModalProps {
  isOpen: boolean;
  onSuccess: (data: any) => void;
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

  if (!isOpen) return null;

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
    } catch (err: any) {
      setError(
        err.response?.data?.message ||
          (locale === 'bn'
            ? 'রিজিউম আপলোড বা পার্স করতে সমস্যা হয়েছে।'
            : 'Failed to upload or parse resume. Please check the PDF format.'),
      );
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-md border border-[#e5e7eb] max-w-lg w-full p-6 shadow-2xl relative text-left">
        {canClose && onClose && (
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 p-1 rounded-md"
          >
            <X className="w-5 h-5" />
          </button>
        )}

        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-md bg-[#371ee1]/10 border border-[#371ee1]/20 flex items-center justify-center text-[#371ee1]">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-900 leading-tight">
              {locale === 'bn' ? 'রিজিউম আপলোড করুন' : 'Upload Your Resume'}
            </h3>
            <p className="text-xs text-slate-500">
              {locale === 'bn'
                ? 'এআই স্বয়ংক্রিয়ভাবে তথ্য এক্সট্র্যাক্ট করে আপনার প্রোফাইল তৈরি করবে'
                : 'AI will parse your resume to build your autonomous application profile'}
            </p>
          </div>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-md bg-red-50 border border-red-200 flex items-center gap-2 text-red-700 text-xs">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <div
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          className={`border-2 border-dashed rounded-md p-8 text-center transition-all cursor-pointer ${
            dragActive
              ? 'border-[#371ee1] bg-[#371ee1]/5'
              : file
              ? 'border-emerald-500 bg-emerald-50/50'
              : 'border-[#d1d5db] hover:border-[#371ee1] bg-[#f8f9fd]'
          }`}
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
              <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto" />
              <p className="text-sm font-semibold text-slate-900 truncate">
                {file.name}
              </p>
              <p className="text-xs text-slate-500">
                {(file.size / 1024).toFixed(1)} KB —{' '}
                <span className="text-[#371ee1] underline">Click to change</span>
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              <UploadCloud className="w-10 h-10 text-slate-400 mx-auto" />
              <div>
                <p className="text-sm font-medium text-slate-800">
                  {locale === 'bn'
                    ? 'পিডিএফ ফাইল ড্রপ করুন অথবা ক্লিক করে ব্রাউজ করুন'
                    : 'Drag & drop your PDF resume here, or browse'}
                </p>
                <p className="text-xs text-slate-400 mt-1">PDF (Max 5MB)</p>
              </div>
            </div>
          )}
        </div>

        <div className="mt-6 flex items-center justify-end gap-3">
          {canClose && onClose && (
            <button
              onClick={onClose}
              disabled={isUploading}
              className="px-4 py-2 rounded-md border border-[#e5e7eb] text-xs font-semibold text-slate-700 hover:bg-[#f8f9fd] transition-colors"
            >
              {t.common.cancel}
            </button>
          )}

          <button
            onClick={handleUpload}
            disabled={!file || isUploading}
            className="flex items-center gap-2 px-5 py-2 rounded-md bg-[#371ee1] hover:bg-[#2e17c4] disabled:opacity-50 text-white text-xs font-semibold shadow-xs transition-colors"
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
          </button>
        </div>
      </div>
    </div>
  );
}

