
"use client";
import * as React from "react";
import { getAllClasses } from '@/app/[locale]/admin/classes/actions';
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import CreateClassDialog from './CreateClassDialog';
import ClassCard from './ClassCard';
import ManageStudentsDialog from './ManageStudentsDialog';

export default function ClassList() {
  const t = useTranslations('admin');
  const tCommon = useTranslations('common');
  const [classes, setClasses] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [selectedClassId, setSelectedClassId] = React.useState<string | null>(null);
  const [manageDialogOpen, setManageDialogOpen] = React.useState(false);

  const loadClasses = React.useCallback(async () => {
    setLoading(true);
    try {
      const data = await getAllClasses();
      setClasses(data);
    } catch (error) {
      toast.error(t('classCreatedErrorDesc'));
    } finally {
      setLoading(false);
    }
  }, [t]);

  React.useEffect(() => {
    loadClasses();
  }, [loadClasses]);

  const handleClassCreated = (newClass: any) => {
    setClasses((prev) => [newClass, ...prev]);
  };

  const handleClassClick = (classId: string) => {
    setSelectedClassId(classId);
    setManageDialogOpen(true);
  };

  const handleClassUpdated = (updatedClass: any) => {
    setClasses((prev) => 
      prev.map((c) => c.classId === updatedClass.classId ? updatedClass : c)
    );
  };

  const handleClassDeleted = (classId: string) => {
    setClasses((prev) => prev.filter((c) => c.classId !== classId));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold">{t('classManagement')}</h2>
        <CreateClassDialog onClassCreated={handleClassCreated} />
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading && (
          <div className="col-span-full text-center text-muted-foreground py-12">
            {tCommon('loading')}
          </div>
        )}
        {!loading && classes.length === 0 && (
          <div className="col-span-full text-center text-muted-foreground py-12">
            <p className="text-lg font-semibold mb-2">{tCommon('noData')}</p>
            <p className="text-sm">Click the "{tCommon('create')}" button to add your first class.</p>
          </div>
        )}
        {!loading && classes.length > 0 && (
          <>
            {classes.map((cls) => (
              <ClassCard
                key={cls.classId}
                cls={cls}
                onClassClick={handleClassClick}
                onClassUpdated={handleClassUpdated}
                onClassDeleted={handleClassDeleted}
              />
            ))}
          </>
        )}
      </div>

      <ManageStudentsDialog
        open={manageDialogOpen}
        onOpenChange={setManageDialogOpen}
        classId={selectedClassId}
      />
    </div>
  );
}
