"use client";

import { useState } from "react";
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
import { updateEvent } from "@/app/[locale]/admin/events/actions";
import { toast } from "sonner";
import { Pencil } from "lucide-react";
import { useTranslations } from "next-intl";

interface EditEventDialogProps {
	readonly event: {
		eventId: string;
		title: string;
		description: string | null;
		eventBanner: string | null;
		pointAmount: number;
	};
}

export function EditEventDialog({ event }: EditEventDialogProps) {
	const [open, setOpen] = useState(false);
	const [loading, setLoading] = useState(false);

	const t = useTranslations('events');
	const tCommon = useTranslations('common');

	const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		setLoading(true);

		const formData = new FormData(e.currentTarget);
		const result = await updateEvent(event.eventId, formData);

		if (result.success) {
			toast.success(result.message);
			setOpen(false);
		} else {
			toast.error(result.message);
		}

		setLoading(false);
	};

	return (
		<Dialog open={open} onOpenChange={setOpen}>
			<DialogTrigger asChild>
				<Button variant="outline" size="default" className="h-9 px-2 sm:px-4 min-w-0" title={t('edit')}>
					<Pencil className="h-4 w-4 shrink-0" />
					<span className="hidden sm:inline ml-1 lg:ml-2">{t('edit')}</span>
				</Button>
			</DialogTrigger>
			<DialogContent>
				<form onSubmit={handleSubmit}>
					<DialogHeader>
						<DialogTitle>{t('edit')}</DialogTitle>
						<DialogDescription>
							{t('editEventDesc') || 'Update the event details.'}
						</DialogDescription>
					</DialogHeader>
					<div className="grid gap-4 py-4">
						<div className="grid gap-2">
							<Label htmlFor="title">{t('title_field')}</Label>
							<Input
								id="title"
								name="title"
								defaultValue={event.title}
								required
							/>
						</div>
						<div className="grid gap-2">
							<Label htmlFor="description">{t('description')} ({tCommon('optional') || 'Optional'})</Label>
							<Textarea
								id="description"
								name="description"
								defaultValue={event.description || ""}
								rows={3}
							/>
						</div>
						<div className="grid gap-2">
							<Label htmlFor="eventBanner">{t('eventBanner')} ({tCommon('optional') || 'Optional'})</Label>
							<Input
								id="eventBanner"
								name="eventBanner"
								type="url"
								defaultValue={event.eventBanner || ""}
								placeholder="https://example.com/banner.jpg"
							/>
						</div>
						<div className="grid gap-2">
							<Label htmlFor="pointAmount">{t('pointAmount')}</Label>
							<Input
								id="pointAmount"
								name="pointAmount"
								type="number"
								min="0"
								defaultValue={event.pointAmount}
								required
							/>
						</div>
					</div>
					<DialogFooter>
						<Button type="button" variant="outline" onClick={() => setOpen(false)}>
							{tCommon('cancel')}
						</Button>
						<Button type="submit" disabled={loading}>
							{loading ? t('updating') || 'Updating...' : t('updateEvent') || 'Update Event'}
						</Button>
					</DialogFooter>
				</form>
			</DialogContent>
		</Dialog>
	);
}

