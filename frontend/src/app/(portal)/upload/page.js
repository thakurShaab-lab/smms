'use client';

import { PageHeader } from '@/components/ui/PageHeader';
import { UploadPanel } from '@/components/media/UploadPanel';

export default function UploadPage() {
  return (
    <div>
      <PageHeader
        title="Upload Media"
        description="Upload a photo, video, document or audio file. Our AI automatically detects and tags the students involved — no manual selection needed."
      />
      <UploadPanel />
    </div>
  );
}
