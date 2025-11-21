"use client";

import { useState } from "react";
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
	AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { deleteEvent } from "@/app/[locale]/admin/events/actions";
import { toast } from "sonner";
import { Trash2 } from "lucide-react";
import { useTranslations } from "next-intl";

interface DeleteEventAlertProps {
  eventId: string;
  eventTitle: string;
}

export function DeleteEventAlert({ eventId, eventTitle }: DeleteEventAlertProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const t = useTranslations('events');
  const tCommon = useTranslations('common');

  const handleDelete = async () => {
    setLoading(true);
    const result = await deleteEvent(eventId);

    if (result.success) {
      toast.success(result.message);
      setOpen(false);
    } else {
      toast.error(result.message);
    }

    setLoading(false);
  };

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild>
        <Button variant="destructive" size="default" className="h-9 px-2 sm:px-4 min-w-0" title={t('delete')}>
          <Trash2 className="h-4 w-4 shrink-0" />
          <span className="hidden sm:inline ml-1 lg:ml-2">{t('delete')}</span>
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{t('deleteConfirmTitle') || t('deleteEvent', { title: eventTitle })}</AlertDialogTitle>
          <AlertDialogDescription>
            {t('deleteConfirmDesc', { title: eventTitle }) || (
              <>This will delete the event "{eventTitle}". This action cannot be undone.</>
            )}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={loading}>{tCommon('cancel')}</AlertDialogCancel>
          <AlertDialogAction onClick={handleDelete} disabled={loading}>
            {loading ? t('deleting') || 'Deleting...' : t('delete')}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

