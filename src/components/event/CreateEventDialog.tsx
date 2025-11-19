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
import { createEvent } from "@/app/[locale]/admin/events/actions";
import { toast } from "sonner";
import { Plus } from "lucide-react";

export function CreateEventDialog() {
	const [open, setOpen] = useState(false);
	const [loading, setLoading] = useState(false);

	const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		setLoading(true);

		const formData = new FormData(e.currentTarget);
		const result = await createEvent(formData);

		if (result.success) {
			toast.success(result.message);
			setOpen(false);
			e.currentTarget.reset();
		} else {
			toast.error(result.message);
		}

		setLoading(false);
	};

	return (
		<Dialog open={open} onOpenChange={setOpen}>
			<DialogTrigger asChild>
				<Button>
					<Plus className="mr-2 h-4 w-4" />
					Create Event
				</Button>
			</DialogTrigger>
			<DialogContent>
				<form onSubmit={handleSubmit}>
					<DialogHeader>
						<DialogTitle>Create New Event</DialogTitle>
						<DialogDescription>
							Add a new event that users can check in to and earn points.
						</DialogDescription>
					</DialogHeader>
					<div className="grid gap-4 py-4">
						<div className="grid gap-2">
							<Label htmlFor="title">Event Title</Label>
							<Input
								id="title"
								name="title"
								placeholder="e.g., Grand Opening"
								required
							/>
						</div>
						<div className="grid gap-2">
							<Label htmlFor="description">Description (Optional)</Label>
							<Textarea
								id="description"
								name="description"
								placeholder="Event details..."
								rows={3}
							/>
						</div>
						<div className="grid gap-2">
							<Label htmlFor="eventBanner">Event Banner URL (Optional)</Label>
							<Input
								id="eventBanner"
								name="eventBanner"
								type="url"
								placeholder="https://example.com/banner.jpg"
							/>
						</div>
						<div className="grid gap-2">
							<Label htmlFor="pointAmount">Points Awarded</Label>
							<Input
								id="pointAmount"
								name="pointAmount"
								type="number"
								min="0"
								placeholder="e.g., 50"
								required
							/>
						</div>
					</div>
					<DialogFooter>
						<Button type="button" variant="outline" onClick={() => setOpen(false)}>
							Cancel
						</Button>
						<Button type="submit" disabled={loading}>
							{loading ? "Creating..." : "Create Event"}
						</Button>
					</DialogFooter>
				</form>
			</DialogContent>
		</Dialog>
	);
}

