"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useTranslations } from "next-intl";
import { TrendingUp, Users, Calendar } from "lucide-react";

interface GrantSummaryCardProps {
  readonly summary: {
    totalGranted: number;
    totalTransactions: number;
  };
}

export function GrantSummaryCard({ summary }: GrantSummaryCardProps) {
  const t = useTranslations('admin');

  return (
    <div className="grid gap-6 md:grid-cols-3 mb-8">
      <Card className="border-2 border-green-200 bg-gradient-to-br from-green-50 to-emerald-100 shadow-lg shadow-green-500/10 transition-all duration-300 transform hover:scale-105 hover:shadow-xl">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium text-green-700 flex items-center gap-2">
            <div className="p-2 rounded-lg bg-gradient-to-br from-green-500 to-emerald-600">
              <TrendingUp className="h-4 w-4 text-white" />
            </div>
            {t('totalPointsGranted')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold text-green-900">
            {summary.totalGranted.toLocaleString()}
          </div>
          <div className="mt-2 text-xs text-green-600">
            {t('showingGrants', { count: summary.totalTransactions, total: summary.totalTransactions })}
          </div>
        </CardContent>
      </Card>

      <Card className="border-2 border-blue-200 bg-gradient-to-br from-blue-50 to-indigo-100 shadow-lg shadow-blue-500/10 transition-all duration-300 transform hover:scale-105 hover:shadow-xl">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium text-blue-700 flex items-center gap-2">
            <div className="p-2 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600">
              <Users className="h-4 w-4 text-white" />
            </div>
            {t('usersHelped')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold text-blue-900">
            {summary.totalTransactions}
          </div>
          <div className="mt-2 text-xs text-blue-600">
            {t('pointsPerTransaction')}
          </div>
        </CardContent>
      </Card>

      <Card className="border-2 border-purple-200 bg-gradient-to-br from-purple-50 to-pink-100 shadow-lg shadow-purple-500/10 transition-all duration-300 transform hover:scale-105 hover:shadow-xl">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium text-purple-700 flex items-center gap-2">
            <div className="p-2 rounded-lg bg-gradient-to-br from-purple-500 to-pink-600">
              <Calendar className="h-4 w-4 text-white" />
            </div>
            {t('averageGrant')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold text-purple-900">
            {summary.totalTransactions > 0
              ? Math.round(summary.totalGranted / summary.totalTransactions)
              : 0
            }
          </div>
          <div className="mt-2 text-xs text-purple-600">
            {t('pointsPerTransaction')}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}