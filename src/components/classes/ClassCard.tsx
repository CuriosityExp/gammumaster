"use client";
import * as React from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useTranslations } from "next-intl";
import { toast } from "sonner";

interface Class {
  classId: string;
  title: string;
  description: string | null;
  imageUrl: string | null;
  location: string | null;
}

interface ClassCardProps {
  cls: Class;
  onClassClick: (classId: string) => void;
  onClassUpdated: (updatedClass: Class) => void;
  onClassDeleted: (classId: string) => void;
}

export default function ClassCard({ cls, onClassClick, onClassUpdated, onClassDeleted }: ClassCardProps) {
  const t = useTranslations('admin');
  const tCommon = useTranslations('common');

  const handleEdit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    try {
      const formData = new FormData(e.currentTarget);
      const updated = {
        title: formData.get('title') as string,
        description: formData.get('description') as string,
        imageUrl: formData.get('imageUrl') as string,
        location: formData.get('location') as string,
      };
      
      const res = await fetch('/api/admin/classes', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: cls.classId, ...updated }),
      });
      
      if (res.ok) {
        const newCls = await res.json();
        onClassUpdated(newCls);
        toast.success(t('classUpdatedSuccess'));
      } else {
        toast.error(t('classUpdatedError'));
      }
    } catch (error) {
      toast.error(t('classUpdatedErrorDesc'));
    }
  };

  const handleDelete = async () => {
    if (!confirm(t('confirmDeleteClass'))) return;
    
    try {
      const res = await fetch('/api/admin/classes', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: cls.classId }),
      });
      
      if (res.ok) {
        onClassDeleted(cls.classId);
        toast.success(t('classDeletedSuccess'));
      } else {
        toast.error(t('classDeletedError'));
      }
    } catch (error) {
      toast.error(t('classDeletedErrorDesc'));
    }
  };

  return (
    <div className="border rounded-lg p-4 bg-white shadow-sm">
      <div 
        className="cursor-pointer hover:opacity-80 transition-opacity"
        onClick={() => onClassClick(cls.classId)}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            onClassClick(cls.classId);
          }
        }}
      >
        {cls.imageUrl && (
          <img src={cls.imageUrl} alt={cls.title} className="w-full h-32 object-cover rounded mb-2" />
        )}
        <h3 className="font-bold text-lg mb-1">{cls.title}</h3>
        <p className="text-sm text-muted-foreground mb-2">{cls.description}</p>
        <div className="text-xs text-muted-foreground mb-2">{cls.location}</div>
      </div>
      
      <div className="flex gap-2 mt-2">
        <Dialog>
          <DialogTrigger asChild>
            <Button variant="outline" size="sm">
              {tCommon('edit')}
            </Button>
          </DialogTrigger>
          <DialogContent>
            <form onSubmit={handleEdit}>
              <DialogHeader>
                <DialogTitle>{tCommon('edit')} {t('classTitle')}</DialogTitle>
                <DialogDescription>
                  {t('classManagementDesc')}
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="edit-title">{t('classTitle')}</Label>
                  <Input id="edit-title" name="title" defaultValue={cls.title} required />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="edit-description">{t('classDescription')} ({tCommon('optional')})</Label>
                  <Textarea id="edit-description" name="description" defaultValue={cls.description || ''} rows={3} />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="edit-imageUrl">{t('classImageUrl')} ({tCommon('optional')})</Label>
                  <Input id="edit-imageUrl" name="imageUrl" type="url" defaultValue={cls.imageUrl || ''} />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="edit-location">{t('classLocation')} ({tCommon('optional')})</Label>
                  <Input id="edit-location" name="location" defaultValue={cls.location || ''} />
                </div>
              </div>
              <DialogFooter>
                <Button type="submit">{tCommon('save')}</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
        
        <Button
          variant="destructive"
          size="sm"
          onClick={handleDelete}
        >
          {tCommon('delete')}
        </Button>
      </div>
    </div>
  );
}
