"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useTranslations } from "next-intl";

interface EventHistoryCardProps {
  readonly event: {
    eventId: string;
    title: string;
    description: string | null;
    eventBanner: string | null;
    pointAmount: number;
    attendedAt: Date;
  };
}

export function EventHistoryCard({ event }: EventHistoryCardProps) {
  const t = useTranslations('dashboard.events');

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow">
      {event.eventBanner && (
        <div className="aspect-video overflow-hidden bg-gray-100">
          <img
            src={event.eventBanner}
            alt={event.title}
            className="w-full h-full object-cover"
          />
        </div>
      )}
      <CardHeader>
        <div className="flex items-start justify-between gap-2">
          <CardTitle className="text-lg">{event.title}</CardTitle>
          <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-gradient-to-r from-amber-500 to-orange-600 text-white text-xs font-bold whitespace-nowrap">
            <span>💎</span>
            <span>{event.pointAmount}</span>
          </div>
        </div>
        {event.description && (
          <CardDescription className="line-clamp-2">
            {event.description}
          </CardDescription>
        )}
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <span>
            {t('attendedOn', { 
              date: new Date(event.attendedAt).toLocaleDateString(undefined, {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })
            })}
          </span>
        </div>
      </CardContent>
    </Card>
  );
}
