"use client";

import Link from "next/link";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowRight } from "lucide-react";

interface AdminMenuCardProps {
	title: string;
	description: string;
	icon: React.ReactNode;
	href: string;
	iconBgColor?: string;
	iconHoverBgColor?: string;
	hoverBorderColor?: string;
}

export function AdminMenuCard({ 
	title, 
	description, 
	icon, 
	href,
	iconBgColor = "bg-primary/10",
	iconHoverBgColor = "group-hover:bg-primary",
	hoverBorderColor = "hover:border-primary"
}: AdminMenuCardProps) {
	return (
		<Link href={href} className="group">
			<Card className={`h-full transition-all hover:shadow-lg ${hoverBorderColor}`}>
				<CardHeader>
					<div className="flex items-center justify-between mb-2">
						<div className={`p-3 rounded-lg ${iconBgColor} ${iconHoverBgColor} transition-colors`}>
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
