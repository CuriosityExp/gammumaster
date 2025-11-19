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

interface DeleteEventAlertProps {
	eventId: string;
	eventTitle: string;
}

export function DeleteEventAlert({ eventId, eventTitle }: DeleteEventAlertProps) {
	const [open, setOpen] = useState(false);
	const [loading, setLoading] = useState(false);

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
				<Button variant="destructive" size="default" className="h-9 px-2 sm:px-4 min-w-0" title="Delete event">
					<Trash2 className="h-4 w-4 shrink-0" />
					<span className="hidden sm:inline ml-1 lg:ml-2">Delete</span>
				</Button>
			</AlertDialogTrigger>
			<AlertDialogContent>
				<AlertDialogHeader>
					<AlertDialogTitle>Are you sure?</AlertDialogTitle>
					<AlertDialogDescription>
						This will delete the event "{eventTitle}". This action cannot be undone.
					</AlertDialogDescription>
				</AlertDialogHeader>
				<AlertDialogFooter>
					<AlertDialogCancel disabled={loading}>Cancel</AlertDialogCancel>
					<AlertDialogAction onClick={handleDelete} disabled={loading}>
						{loading ? "Deleting..." : "Delete"}
					</AlertDialogAction>
				</AlertDialogFooter>
			</AlertDialogContent>
		</AlertDialog>
	);
}

