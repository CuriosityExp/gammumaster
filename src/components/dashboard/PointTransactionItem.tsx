"use client";

import { useTranslations } from "next-intl";
import type { PointTransaction, Admin, UserFacilitator, User } from "@/generated/prisma";

interface PointTransactionItemProps {
  readonly transaction: PointTransaction & {
    admin: { email: string } | null;
    facilitator: { user: { name: string | null; email: string | null } } | null;
  };
}

export function PointTransactionItem({ transaction }: PointTransactionItemProps) {
  const t = useTranslations('dashboard.points');

  const isPositive = transaction.amount > 0;
  const icon = {
    ADMIN_GRANT: (
      <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
        </svg>
      </div>
    ),
    EVENT_TOPUP: (
      <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      </div>
    ),
    PRIZE_REDEEM: (
      <div className="h-10 w-10 rounded-full bg-orange-100 flex items-center justify-center">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-orange-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" />
        </svg>
      </div>
    ),
  }[transaction.type];

  const getSource = () => {
    if (transaction.type === 'ADMIN_GRANT') {
      if (transaction.admin) {
        return t('grantedBy', { name: transaction.admin.email });
      }
      if (transaction.facilitator) {
        return t('grantedBy', { 
          name: transaction.facilitator.user.name || transaction.facilitator.user.email || 'Facilitator'
        });
      }
    }
    return '';
  };

  return (
    <div className="flex items-center gap-4 py-4 border-b last:border-0">
      {icon}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <p className="font-medium text-sm">
            {t(`transactionType.${transaction.type}`)}
          </p>
          <span className="text-xs text-muted-foreground">
            {new Date(transaction.createdAt).toLocaleString(undefined, {
              year: 'numeric',
              month: 'short',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            })}
          </span>
        </div>
        {transaction.description && (
          <p className="text-sm text-muted-foreground truncate">
            {transaction.description}
          </p>
        )}
        {getSource() && (
          <p className="text-xs text-muted-foreground mt-1">
            {getSource()}
          </p>
        )}
      </div>
      <div className={`text-lg font-bold tabular-nums ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
        {isPositive ? '+' : ''}{transaction.amount.toLocaleString()}
      </div>
    </div>
  );
}
