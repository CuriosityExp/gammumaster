"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useTranslations } from "next-intl";

interface PointSummaryCardProps {
  readonly summary: {
    totalEarned: number;
    totalSpent: number;
    balance: number;
    byType: {
      ADMIN_GRANT: number;
      EVENT_TOPUP: number;
      PRIZE_REDEEM: number;
    };
  };
}

export function PointSummaryCard({ summary }: PointSummaryCardProps) {
  const t = useTranslations('dashboard.points');

  return (
    <div className="grid gap-4 md:grid-cols-3 mb-6">
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            {t('totalEarned')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold text-green-600">
            +{summary.totalEarned.toLocaleString()}
          </div>
          <div className="mt-2 text-xs text-muted-foreground space-y-1">
            <div className="flex justify-between">
              <span>{t('fromGrants')}</span>
              <span className="font-medium">{summary.byType.ADMIN_GRANT.toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span>{t('fromEvents')}</span>
              <span className="font-medium">{summary.byType.EVENT_TOPUP.toLocaleString()}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            {t('totalSpent')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold text-red-600">
            -{summary.totalSpent.toLocaleString()}
          </div>
          <div className="mt-2 text-xs text-muted-foreground">
            <div className="flex justify-between">
              <span>{t('onPrizes')}</span>
              <span className="font-medium">{summary.byType.PRIZE_REDEEM.toLocaleString()}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-gradient-to-br from-amber-500 to-orange-600 text-white">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium text-white/90">
            {t('balance')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold">
            💎 {summary.balance.toLocaleString()}
          </div>
          <div className="mt-2 text-xs text-white/80">
            {t('currentBalance')}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
