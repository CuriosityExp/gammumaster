"use client";

import { useState } from "react";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { Card } from "@/components/ui/card";
import { CheckCircle2, XCircle, Calendar, Users } from "lucide-react";
import { formatDate } from "@/lib/utils";

interface Attendance {
	attendanceId: string;
	userId: string;
	eventId: string;
	checkInDate: Date;
	user: {
		userId: string;
		name: string;
		email: string;
	};
}

interface EventAttendanceDialogProps {
	children: React.ReactNode;
	event: {
		eventId: string;
		title: string;
		pointAmount: number;
	};
}

export function EventAttendanceDialog({ children, event }: EventAttendanceDialogProps) {
	const [open, setOpen] = useState(false);
	const [attendances, setAttendances] = useState<Attendance[]>([]);
	const [loading, setLoading] = useState(false);

	const fetchAttendances = async () => {
		setLoading(true);
		try {
			const response = await fetch(`/api/events/${event.eventId}/attendances`);
			if (response.ok) {
				const data = await response.json();
				setAttendances(data);
			}
		} catch (error) {
			console.error("Error fetching attendances:", error);
		} finally {
			setLoading(false);
		}
	};

	const handleOpenChange = (isOpen: boolean) => {
		setOpen(isOpen);
		if (isOpen) {
			fetchAttendances();
		}
	};

	// Group attendances by user
	const userAttendances = attendances.reduce((acc, attendance) => {
		const userId = attendance.user.userId;
		if (!acc[userId]) {
			acc[userId] = {
				user: attendance.user,
				checkIns: [],
			};
		}
		acc[userId].checkIns.push(attendance.checkInDate);
		return acc;
	}, {} as Record<string, { user: Attendance["user"]; checkIns: Date[] }>);

	// Get all unique check-in dates across all users
	const allCheckInDates = Array.from(
		new Set(attendances.map((a) => formatDate(a.checkInDate)))
	).sort();

	const userList = Object.values(userAttendances);

	return (
		<Dialog open={open} onOpenChange={handleOpenChange}>
			<DialogTrigger asChild>{children}</DialogTrigger>
			<DialogContent className="max-w-4xl max-h-[80vh] overflow-hidden flex flex-col">
				<DialogHeader>
					<DialogTitle className="flex items-center gap-3">
						<div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
							<Calendar className="h-5 w-5 text-white" />
						</div>
						<div>
							<div className="text-xl bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
								{event.title}
							</div>
							<p className="text-sm text-muted-foreground font-normal">
								Attendance Records
							</p>
						</div>
					</DialogTitle>
				</DialogHeader>

				{loading ? (
					<div className="flex items-center justify-center py-12">
						<div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
					</div>
				) : userList.length === 0 ? (
					<div className="flex flex-col items-center justify-center py-12 text-center">
						<div className="h-16 w-16 rounded-full bg-blue-500/10 flex items-center justify-center mb-4">
							<Users className="h-8 w-8 text-blue-600" />
						</div>
						<p className="text-muted-foreground">No attendances recorded yet</p>
					</div>
				) : (
					<div className="flex-1 overflow-auto">
						<div className="mb-4 p-4 rounded-lg bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 border border-blue-100 dark:border-blue-900">
							<div className="flex items-center justify-between">
								<div className="flex items-center gap-2">
									<Users className="h-5 w-5 text-blue-600 dark:text-blue-400" />
									<span className="font-semibold text-blue-900 dark:text-blue-100">
										Total Users: {userList.length}
									</span>
								</div>
								<div className="flex items-center gap-2">
									<Calendar className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
									<span className="font-semibold text-indigo-900 dark:text-indigo-100">
										Check-in Dates: {allCheckInDates.length}
									</span>
								</div>
							</div>
						</div>

						<div className="rounded-md border">
							<Table>
								<TableHeader>
									<TableRow>
										<TableHead className="font-bold bg-blue-50 dark:bg-blue-950/20 sticky left-0 z-10">
											User
										</TableHead>
										<TableHead className="font-bold bg-blue-50 dark:bg-blue-950/20 text-center">
											Email
										</TableHead>
										{allCheckInDates.map((date) => (
											<TableHead
												key={date}
												className="font-bold bg-blue-50 dark:bg-blue-950/20 text-center min-w-[120px]"
											>
												{date}
											</TableHead>
										))}
									</TableRow>
								</TableHeader>
								<TableBody>
									{userList.map(({ user, checkIns }) => (
										<TableRow key={user.userId}>
											<TableCell className="font-medium sticky left-0 z-10 bg-background">
												{user.name}
											</TableCell>
											<TableCell className="text-sm text-muted-foreground">
												{user.email}
											</TableCell>
											{allCheckInDates.map((date) => {
												const hasCheckIn = checkIns.some(
													(checkInDate) => formatDate(checkInDate) === date
												);
												return (
													<TableCell key={date} className="text-center">
														{hasCheckIn ? (
															<div className="inline-flex items-center justify-center">
																<CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400" />
															</div>
														) : (
															<div className="inline-flex items-center justify-center">
																<XCircle className="h-5 w-5 text-gray-300 dark:text-gray-700" />
															</div>
														)}
													</TableCell>
												);
											})}
										</TableRow>
									))}
								</TableBody>
							</Table>
						</div>
					</div>
				)}
			</DialogContent>
		</Dialog>
	);
}
