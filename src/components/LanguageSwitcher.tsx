'use client';

import { useLocale } from 'next-intl';
import { useRouter, usePathname } from 'next/navigation';
import { locales, localeNames } from '@/i18n/config';
import { Button } from '@/components/ui/button';

export function LanguageSwitcher() {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();

  const switchLocale = () => {
    // Toggle between locales
    const currentIndex = locales.indexOf(locale as any);
    const nextIndex = (currentIndex + 1) % locales.length;
    const newLocale = locales[nextIndex];
    
    // Remove current locale from pathname if it exists
    const pathnameWithoutLocale = pathname.replace(/^\/(en|id)/, '') || '/';
    
    // Add new locale prefix
    const newPath = `/${newLocale}${pathnameWithoutLocale}`;
    
    router.push(newPath);
    router.refresh();
  };

  // Flag emoji mapping
  const flagEmoji: Record<string, string> = {
    en: '🇬🇧',
    id: '🇮🇩',
  };

  const localeLabel: Record<string, string> = {
    en: 'EN',
    id: 'ID',
  };

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={switchLocale}
      className="h-9 px-3 text-sm font-medium"
      title={localeNames[locale]}
    >
      <span className="mr-1.5">{flagEmoji[locale]}</span>
      {localeLabel[locale]}
    </Button>
  );
}
