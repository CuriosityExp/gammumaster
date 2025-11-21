
"use client";
// src/components/prizes/CreatePrizeDialog.tsx
import { Switch } from "@/components/ui/switch";

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
import { useTranslations } from "next-intl";
import { createPrize } from "@/app/[locale]/admin/prizes/actions";
import { useRef, useState } from "react";

export function CreatePrizeDialog() {
  const formRef = useRef<HTMLFormElement>(null);
  const [isFormValid, setIsFormValid] = useState(false);
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

  const handleSubmit = async (formData: FormData) => {
    setIsSubmitting(true);
    try {
      await createPrize(formData);
      formRef.current?.reset();
      setIsFormValid(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button>{t('createNew')}</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{t('createNew')}</DialogTitle>
          <DialogDescription>
            {t('createPrizeDesc') || 'Add the details for the new prize. Click save when you\'re done.'}
          </DialogDescription>
        </DialogHeader>
        <form
          ref={formRef}
          onChange={validateForm}
          action={handleSubmit}
        >
          <div className="grid gap-4 py-4 max-h-[60vh] overflow-y-auto px-1">
                        <div className="grid grid-cols-4 items-center gap-4">
                          <Label htmlFor="isEnabled" className="text-right">{t('enabled')}</Label>
                          <div className="col-span-3">
                            <Switch
                              id="isEnabled"
                              name="isEnabled"
                              label={t('enabled')}
                              defaultChecked={true}
                            />
                          </div>
                        </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">
                {t('name')}<span className="text-red-500">*</span>
              </Label>
              <Input id="name" name="name" required className="col-span-3" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="description" className="text-right">{t('description')}</Label>
              <Textarea id="description" name="description" className="col-span-3 min-h-[80px] max-h-[120px]" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="pointCost" className="text-right">
                {t('pointCost')}<span className="text-red-500">*</span>
              </Label>
              <Input id="pointCost" name="pointCost" type="number" min="0" required className="col-span-3" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="stock" className="text-right">
                {t('stock')}<span className="text-red-500">*</span>
              </Label>
              <Input id="stock" name="stock" type="number" min="0" required defaultValue="0" className="col-span-3" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="imageUrl" className="text-right">{t('imageUrl')}</Label>
              <Input id="imageUrl" name="imageUrl" placeholder="https://" className="col-span-3" />
            </div>
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button 
                type="submit" 
                disabled={!isFormValid || isSubmitting}
              >
                {isSubmitting ? t('saving') || 'Saving...' : tCommon('save')}
              </Button>
            </DialogClose>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}