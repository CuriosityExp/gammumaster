"use client";

import Link from "next/link";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowRight } from "lucide-react";

interface AdminMenuCardProps {
	title: string;
	description: string;
	icon: React.ReactNode;
	href: string;
}

export function AdminMenuCard({ title, description, icon, href }: AdminMenuCardProps) {
	return (
		<Link href={href} className="group">
			<Card className="h-full transition-all hover:shadow-lg hover:border-primary">
				<CardHeader>
					<div className="flex items-center justify-between mb-2">
						<div className="p-3 rounded-lg bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
							{icon}
						</div>
						<ArrowRight className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
					</div>
					<CardTitle>{title}</CardTitle>
					<CardDescription>{description}</CardDescription>
				</CardHeader>
			</Card>
		</Link>
	);
}
