'use client';

import { useRef, useState } from 'react';
import toast from 'react-hot-toast';
import { Card, CardHeader } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Spinner } from '@/components/ui/Spinner';
import { EmptyState } from '@/components/ui/EmptyState';
import { useAddVoiceSample, useVoiceSamples, useRemoveVoiceSample } from '@/hooks/useStudents';
import { extractErrorMessage } from '@/lib/axios';

export function VoiceEnrollmentPanel({ studentId }) {
  const { data: voices, isLoading } = useVoiceSamples(studentId);
  const addVoice = useAddVoiceSample(studentId);
  const removeVoice = useRemoveVoiceSample(studentId);
  const fileInputRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);

  async function handleFiles(fileList) {
    const files = Array.from(fileList || []);
    for (const file of files) {
      try {
        await addVoice.mutateAsync(file);
        toast.success(`Enrolled voice from ${file.name}`);
      } catch (error) {
        toast.error(`${file.name}: ${extractErrorMessage(error)}`);
      }
    }
  }

  async function handleRemove(voiceId) {
    if (!confirm('Remove this enrolled voice sample?')) return;
    try {
      await removeVoice.mutateAsync(voiceId);
      toast.success('Voice sample removed');
    } catch (error) {
      toast.error(extractErrorMessage(error));
    }
  }

  return (
    <Card>
      <CardHeader
        title="Enrolled Voices"
        description="Upload a clear recording of this student speaking so the AI can recognize their voice in audio uploads automatically."
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
        <p className="text-sm text-slate-400">Drag & drop voice recordings here, or</p>
        <Button variant="secondary" onClick={() => fileInputRef.current?.click()} isLoading={addVoice.isPending}>
          Choose Audio
        </Button>
        <input
          ref={fileInputRef}
          type="file"
          accept="audio/mpeg,audio/mp4,audio/wav,audio/x-m4a"
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
      ) : voices?.length ? (
        <div className="flex flex-col gap-2">
          {voices.map((voice) => (
            <div key={voice.id} className="flex items-center gap-3 rounded-lg border border-slate-800 p-2">
              <audio controls src={voice.url} className="h-9 flex-1" />
              <Button variant="danger" className="px-2 py-1 text-xs" onClick={() => handleRemove(voice.id)}>
                Remove
              </Button>
            </div>
          ))}
        </div>
      ) : (
        <EmptyState title="No voice samples enrolled yet" description="Add at least one clear recording to enable automatic voice recognition." />
      )}
    </Card>
  );
}
