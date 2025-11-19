"use client";

import { useTranslations } from "next-intl";
import { Coins } from "lucide-react";
import type { PointTransaction, User } from "@/generated/prisma";

interface GrantTransactionItemProps {
  readonly transaction: PointTransaction & {
    user: { name: string | null; email: string | null };
  };
}

export function GrantTransactionItem({ transaction }: GrantTransactionItemProps) {
  const t = useTranslations('admin');

  return (
    <div className="flex items-center gap-4 px-6 py-6 border-b last:border-0 hover:bg-gradient-to-r hover:from-green-50 hover:to-emerald-50 transition-all duration-200 border-l-4 border-l-green-500 bg-gradient-to-r from-green-50/50 to-emerald-50/30 rounded-lg mx-2 mb-2 shadow-sm hover:shadow-md">
      <div className="flex-shrink-0">
        <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center shadow-lg shadow-green-500/25">
          <Coins className="h-6 w-6 text-white" />
        </div>
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-start gap-2 mb-1">
          <p className="font-semibold text-sm text-gray-900">
            {t('grantedTo', { name: transaction.user.name || transaction.user.email || 'Unknown User' })}
          </p>
        </div>
        <div className="text-xs text-gray-500 mb-1">
          {new Date(transaction.createdAt).toLocaleString(undefined, {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
          })}
        </div>
        {transaction.description && (
          <p className="text-sm text-gray-600 line-clamp-2 mt-1">
            {transaction.description}
          </p>
        )}
      </div>
      <div className="text-2xl font-bold tabular-nums flex-shrink-0 ml-2 bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
        +{transaction.amount.toLocaleString()}
      </div>
    </div>
  );
}