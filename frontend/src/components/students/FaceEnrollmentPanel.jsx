'use client';

import { useRef, useState } from 'react';
import toast from 'react-hot-toast';
import { Card, CardHeader } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Spinner } from '@/components/ui/Spinner';
import { EmptyState } from '@/components/ui/EmptyState';
import { useAddFaceImage, useFaceImages, useRemoveFaceImage } from '@/hooks/useStudents';
import { extractErrorMessage } from '@/lib/axios';

export function FaceEnrollmentPanel({ studentId }) {
  const { data: faces, isLoading } = useFaceImages(studentId);
  const addFace = useAddFaceImage(studentId);
  const removeFace = useRemoveFaceImage(studentId);
  const fileInputRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);

  async function handleFiles(fileList) {
    const files = Array.from(fileList || []);
    for (const file of files) {
      try {
        await addFace.mutateAsync(file);
        toast.success(`Enrolled face from ${file.name}`);
      } catch (error) {
        toast.error(`${file.name}: ${extractErrorMessage(error)}`);
      }
    }
  }

  async function handleRemove(faceId) {
    if (!confirm('Remove this enrolled face image?')) return;
    try {
      await removeFace.mutateAsync(faceId);
      toast.success('Face image removed');
    } catch (error) {
      toast.error(extractErrorMessage(error));
    }
  }

  return (
    <Card>
      <CardHeader
        title="Enrolled Faces"
        description="Upload clear, front-facing photos so the AI can recognize this student automatically."
      />

      <div
        className={`mb-4 flex flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed p-6 text-center transition-colors ${
          isDragging ? 'border-brand-500 bg-brand-500/5' : 'border-slate-800'
        }`}
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
        <p className="text-sm text-slate-400">Drag & drop face photos here, or</p>
        <Button variant="secondary" onClick={() => fileInputRef.current?.click()} isLoading={addFace.isPending}>
          Choose Photos
        </Button>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          multiple
          className="hidden"
          onChange={(e) => {
            handleFiles(e.target.files);
            e.target.value = '';
          }}
        />
      </div>

      {isLoading ? (
        <Spinner />
      ) : faces?.length ? (
        <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-6">
          {faces.map((face) => (
            <div key={face.id} className="group relative aspect-square overflow-hidden rounded-lg border border-slate-800">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={face.url} alt="Enrolled face" className="h-full w-full object-cover" />
              <button
                type="button"
                onClick={() => handleRemove(face.id)}
                className="absolute inset-0 flex items-center justify-center bg-slate-950/70 text-sm font-medium text-red-400 opacity-0 transition-opacity group-hover:opacity-100"
              >
                Remove
              </button>
            </div>
          ))}
        </div>
      ) : (
        <EmptyState title="No face images enrolled yet" description="Add at least one clear photo to enable automatic recognition." />
      )}
    </Card>
  );
}
