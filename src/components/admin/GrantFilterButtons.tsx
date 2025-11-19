"use client";

import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { TransactionType } from "@/generated/prisma";

interface GrantFilterButtonsProps {
  readonly currentFilter?: TransactionType;
  readonly locale: string;
}

export function GrantFilterButtons({ currentFilter, locale }: GrantFilterButtonsProps) {
  const router = useRouter();
  const t = useTranslations('admin');

  const handleFilterChange = (filterType?: TransactionType) => {
    const params = new URLSearchParams(globalThis.location?.search || '');
    if (filterType) {
      params.set('type', filterType);
    } else {
      params.delete('type');
    }
    params.delete('page'); // Reset to first page when filtering

    const queryString = params.toString();
    const newUrl = queryString ? `/${locale}/admin/grant-history?${queryString}` : `/${locale}/admin/grant-history`;
    router.push(newUrl, { scroll: false });
  };

  return (
    <div className="mb-6 flex flex-wrap gap-3">
      <button
        onClick={() => handleFilterChange()}
        className={`px-5 py-2.5 rounded-lg border-2 font-medium transition-all hover:shadow-sm ${
          currentFilter === undefined
            ? 'bg-primary border-primary text-primary-foreground shadow-md'
            : 'bg-white border-gray-300 text-gray-700 hover:border-gray-400'
        }`}
      >
        {t('allGrants')}
      </button>
      <button
        onClick={() => handleFilterChange('ADMIN_GRANT')}
        className={`px-5 py-2.5 rounded-lg border-2 font-medium transition-all hover:shadow-sm ${
          currentFilter === 'ADMIN_GRANT'
            ? 'bg-primary border-primary text-primary-foreground shadow-md'
            : 'bg-white border-gray-300 text-gray-700 hover:border-gray-400'
        }`}
      >
        {t('manualGrants')}
      </button>
    </div>
  );
}