// src/components/admin/EditPrizeDialog.tsx
// src/components/prizes/EditPrizeDialog.tsx

"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { updatePrize } from "@/app/[locale]/admin/prizes/actions";
import { Switch } from "@/components/ui/switch";
import type { Prize } from "@/generated/prisma";
import { useRef, useState } from "react";
import { toast } from "sonner";
import { useTranslations } from "next-intl";

interface EditPrizeDialogProps {
 readonly prize: Prize;
}

export function EditPrizeDialog({ prize }: EditPrizeDialogProps) {
  // We bind the prizeId to the server action
  const updatePrizeWithId = updatePrize.bind(null, prize.prizeId);
  const formRef = useRef<HTMLFormElement>(null);
  const [isFormValid, setIsFormValid] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const t = useTranslations('prizes');
  const tCommon = useTranslations('common');

  const validateForm = () => {
    if (!formRef.current) return;
    const formData = new FormData(formRef.current);
    const name = formData.get('name') as string;
    const pointCost = formData.get('pointCost') as string;
    const stock = formData.get('stock') as string;

    const isValid = 
      name?.trim() !== '' && 
      pointCost?.trim() !== '' && 
      Number(pointCost) >= 0 &&
      stock?.trim() !== '' && 
      Number(stock) >= 0;
    setIsFormValid(isValid);
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">{tCommon('edit')}</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{t('editPrize')}</DialogTitle>
          <DialogDescription>
            {t('editPrizeDesc') || "Make changes to your prize here. Click save when you're done."}
          </DialogDescription>
        </DialogHeader>
        <form
          ref={formRef}
          onChange={validateForm}
          action={async (formData) => {
            setIsSubmitting(true);
            try {
              await updatePrizeWithId(formData);
              formRef.current?.reset();
              toast.success(t('editSuccess'));
            } finally {
              setIsSubmitting(false);
            }
          }}
        >
          <div className="grid gap-4 py-4 max-h-[60vh] overflow-y-auto px-1">
                        <div className="grid grid-cols-4 items-center gap-4">
                          <Label htmlFor="isEnabled" className="text-right">{t('enabled')}</Label>
                          <div className="col-span-3">
                            <Switch
                              id="isEnabled"
                              name="isEnabled"
                              label={prize.isEnabled ? t('enabled') : t('disabled')}
                              defaultChecked={prize.isEnabled}
                            />
                          </div>
                        </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">{t('name')}<span className="text-red-500">*</span></Label>
              <Input id="name" name="name" defaultValue={prize.name} required className="col-span-3" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="description" className="text-right">{t('description')}</Label>
              <Textarea id="description" name="description" defaultValue={prize.description || ""} className="col-span-3 min-h-[80px] max-h-[120px]" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="pointCost" className="text-right">{t('pointCost')}<span className="text-red-500">*</span></Label>
              <Input id="pointCost" name="pointCost" type="number" defaultValue={prize.pointCost} required className="col-span-3" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="stock" className="text-right">{t('stock')}<span className="text-red-500">*</span></Label>
              <Input id="stock" name="stock" type="number" defaultValue={prize.stock} required className="col-span-3" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="imageUrl" className="text-right">{t('imageUrl')}</Label>
              <Input id="imageUrl" name="imageUrl" defaultValue={prize.imageUrl || ""} placeholder="https://" className="col-span-3" />
            </div>
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button type="submit" disabled={!isFormValid || isSubmitting}>
                {isSubmitting ? t('saving') || 'Saving...' : t('saveChanges') || tCommon('save')}
              </Button>
            </DialogClose>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
