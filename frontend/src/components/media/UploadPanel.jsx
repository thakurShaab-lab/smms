'use client';

import { useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import clsx from 'clsx';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Select } from '@/components/ui/Select';
import { useUploadMedia } from '@/hooks/useMedia';
import { useClasses } from '@/hooks/useClasses';
import { extractErrorMessage } from '@/lib/axios';
import { MEDIA_TYPE_ICONS } from '@/lib/mediaHelpers';

const TABS = [
  { type: 'photo', label: 'Photo', accept: 'image/jpeg,image/png,image/webp' },
  { type: 'video', label: 'Video', accept: 'video/mp4,video/quicktime,video/x-matroska' },
  { type: 'document', label: 'Document', accept: 'application/pdf,.docx,image/jpeg,image/png' },
  { type: 'audio', label: 'Audio', accept: 'audio/mpeg,audio/mp4,audio/wav,audio/x-m4a' }
];

export function UploadPanel() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('photo');
  const [classId, setClassId] = useState('');
  const [sectionId, setSectionId] = useState('');
  const [progress, setProgress] = useState(0);
  const [isDragging, setIsDragging] = useState(false);

  const { data: classes } = useClasses();
  const uploadMedia = useUploadMedia();
  const fileInputRef = useRef(null);

  const currentTab = TABS.find((tab) => tab.type === activeTab);
  const sections = useMemo(() => classes?.find((c) => String(c.id) === String(classId))?.sections || [], [classes, classId]);

  async function handleFiles(fileList) {
    const files = Array.from(fileList || []);
    let lastUploadedId = null;

    for (const file of files) {
      setProgress(0);
      try {
        const result = await uploadMedia.mutateAsync({
          mediaType: activeTab,
          file,
          meta: { classId: classId || undefined, sectionId: sectionId || undefined },
          onUploadProgress: (event) => {
            if (event.total) setProgress(Math.round((event.loaded / event.total) * 100));
          }
        });
        toast.success(`${file.name} uploaded — AI recognition is running in the background`);
        lastUploadedId = result.id;
      } catch (error) {
        toast.error(`${file.name}: ${extractErrorMessage(error)}`);
      } finally {
        setProgress(0);
      }
    }

    if (files.length === 1 && lastUploadedId) {
      router.push(`/media/${lastUploadedId}`);
    }
  }

  return (
    <Card>
      <div className="mb-6 flex gap-2 overflow-x-auto">
        {TABS.map((tab) => (
          <button
            key={tab.type}
            type="button"
            onClick={() => setActiveTab(tab.type)}
            className={clsx(
              'flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors',
              activeTab === tab.type ? 'bg-brand-600 text-white' : 'bg-slate-800 text-slate-400 hover:text-slate-100'
            )}
          >
            <span>{MEDIA_TYPE_ICONS[tab.type]}</span>
            {tab.label}
          </button>
        ))}
      </div>

      <div className="mb-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Select label="Class (optional)" value={classId} onChange={(e) => setClassId(e.target.value)}>
          <option value="">No class</option>
          {classes?.map((classItem) => (
            <option key={classItem.id} value={classItem.id}>
              {classItem.name}
            </option>
          ))}
        </Select>
        <Select label="Section (optional)" value={sectionId} onChange={(e) => setSectionId(e.target.value)} disabled={!classId}>
          <option value="">No section</option>
          {sections.map((section) => (
            <option key={section.id} value={section.id}>
              {section.name}
            </option>
          ))}
        </Select>
      </div>

      <div
        className={clsx(
          'flex flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed p-12 text-center transition-colors',
          isDragging ? 'border-brand-500 bg-brand-500/5' : 'border-slate-800'
        )}
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setIsDragging(false);
          handleFiles(e.dataTransfer.files);
        }}
      >
        <span className="text-5xl">{MEDIA_TYPE_ICONS[activeTab]}</span>
        <p className="text-sm text-slate-400">
          Drag & drop a {currentTab.label.toLowerCase()} here, or
        </p>
        <Button onClick={() => fileInputRef.current?.click()} isLoading={uploadMedia.isPending}>
          Choose {currentTab.label}
        </Button>
        <p className="text-xs text-slate-600">
          No need to tag students — our AI will automatically detect and attach the right student profiles.
        </p>
        {uploadMedia.isPending && (
          <div className="mt-2 h-2 w-full max-w-xs overflow-hidden rounded-full bg-slate-800">
            <div className="h-full bg-brand-500 transition-all" style={{ width: `${progress}%` }} />
          </div>
        )}
        <input
          ref={fileInputRef}
          type="file"
          accept={currentTab.accept}
          className="hidden"
          onChange={(e) => {
            handleFiles(e.target.files);
            e.target.value = '';
          }}
        />
      </div>
    </Card>
  );
}
