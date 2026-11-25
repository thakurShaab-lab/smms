'use client';

import { useState } from 'react';
import toast from 'react-hot-toast';
import { PageHeader } from '@/components/ui/PageHeader';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Spinner } from '@/components/ui/Spinner';
import { EmptyState } from '@/components/ui/EmptyState';
import { ClassFormModal } from '@/components/classes/ClassFormModal';
import { SectionFormModal } from '@/components/classes/SectionFormModal';
import { useClasses, useDeleteClass, useDeleteSection } from '@/hooks/useClasses';
import { extractErrorMessage } from '@/lib/axios';

export default function ClassesPage() {
  const { data: classes, isLoading } = useClasses();
  const deleteClass = useDeleteClass();
  const deleteSection = useDeleteSection();

  const [isClassModalOpen, setIsClassModalOpen] = useState(false);
  const [sectionModalClassId, setSectionModalClassId] = useState(null);

  async function handleDeleteClass(id) {
    if (!confirm('Delete this class and all its sections?')) return;
    try {
      await deleteClass.mutateAsync(id);
      toast.success('Class deleted');
    } catch (error) {
      toast.error(extractErrorMessage(error));
    }
  }

  async function handleDeleteSection(id) {
    if (!confirm('Delete this section?')) return;
    try {
      await deleteSection.mutateAsync(id);
      toast.success('Section deleted');
    } catch (error) {
      toast.error(extractErrorMessage(error));
    }
  }

  return (
    <div>
      <PageHeader
        title="Classes & Sections"
        description="Organize students into classes and sections."
        action={<Button onClick={() => setIsClassModalOpen(true)}>Add Class</Button>}
      />

      {isLoading ? (
        <Spinner />
      ) : classes?.length ? (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {classes.map((classItem) => (
            <Card key={classItem.id}>
              <div className="mb-3 flex items-center justify-between">
                <h3 className="text-base font-semibold text-slate-100">{classItem.name}</h3>
                <Button variant="danger" className="px-2 py-1 text-xs" onClick={() => handleDeleteClass(classItem.id)}>
                  Delete
                </Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {classItem.sections?.length ? (
                  classItem.sections.map((section) => (
                    <Badge key={section.id} variant="info" className="group flex items-center gap-1">
                      {section.name}
                      <button
                        type="button"
                        className="ml-1 text-brand-300 hover:text-red-400"
                        onClick={() => handleDeleteSection(section.id)}
                        aria-label={`Delete section ${section.name}`}
                      >
                        ✕
                      </button>
                    </Badge>
                  ))
                ) : (
                  <span className="text-xs text-slate-500">No sections yet</span>
                )}
              </div>
              <Button
                variant="secondary"
                className="mt-4 w-full"
                onClick={() => setSectionModalClassId(classItem.id)}
              >
                + Add Section
              </Button>
            </Card>
          ))}
        </div>
      ) : (
        <EmptyState title="No classes yet" description="Create your first class to start organizing students." />
      )}

      <ClassFormModal open={isClassModalOpen} onClose={() => setIsClassModalOpen(false)} />
      <SectionFormModal
        open={Boolean(sectionModalClassId)}
        classId={sectionModalClassId}
        onClose={() => setSectionModalClassId(null)}
      />
    </div>
  );
}
