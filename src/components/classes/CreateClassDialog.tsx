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
import { Plus } from "lucide-react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";

interface CreateClassDialogProps {
  onClassCreated: (newClass: any) => void;
}

export default function CreateClassDialog({ onClassCreated }: CreateClassDialogProps) {
  const t = useTranslations('admin');
  const tCommon = useTranslations('common');
  
  const [open, setOpen] = React.useState(false);
  const [form, setForm] = React.useState({
    title: "",
    description: "",
    imageUrl: "",
    location: ""
  });
  const [formLoading, setFormLoading] = React.useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setFormLoading(true);
    
    try {
      const res = await fetch('/api/admin/classes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      
      if (res.ok) {
        const created = await res.json();
        onClassCreated(created);
        toast.success(t('classCreatedSuccess'));
        setForm({ title: "", description: "", imageUrl: "", location: "" });
        setOpen(false);
      } else {
        toast.error(t('classCreatedError'));
      }
    } catch (error) {
      toast.error(t('classCreatedErrorDesc'));
    } finally {
      setFormLoading(false);
    }
  };

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          {tCommon('create')}
        </Button>
      </DialogTrigger>
      <DialogContent>
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>{t('createClass')}</DialogTitle>
            <DialogDescription>
              {t('classManagementDesc')}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="title">{t('classTitle')}</Label>
              <Input 
                id="title" 
                name="title" 
                value={form.title} 
                onChange={handleChange} 
                placeholder="e.g., Advanced Mathematics" 
                required 
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="description">{t('classDescription')} ({tCommon('optional')})</Label>
              <Textarea 
                id="description" 
                name="description" 
                value={form.description} 
                onChange={handleChange}
                placeholder="Class details..."
                rows={3}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="imageUrl">{t('classImageUrl')} ({tCommon('optional')})</Label>
              <Input 
                id="imageUrl" 
                name="imageUrl" 
                type="url"
                value={form.imageUrl} 
                onChange={handleChange}
                placeholder="https://example.com/image.jpg"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="location">{t('classLocation')} ({tCommon('optional')})</Label>
              <Input 
                id="location" 
                name="location" 
                value={form.location} 
                onChange={handleChange}
                placeholder="e.g., Room 101"
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              {tCommon('cancel')}
            </Button>
            <Button type="submit" disabled={formLoading}>
              {formLoading ? `${tCommon('create')}...` : t('createClass')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
