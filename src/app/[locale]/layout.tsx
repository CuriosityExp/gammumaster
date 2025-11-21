import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { locales } from '@/i18n/config';
import { Geist, Geist_Mono } from 'next/font/google';
import { Toaster } from 'sonner';
import Providers from '../providers';
import PageTransition from '@/components/PageTransition';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export default async function LocaleLayout({
  children,
  params,
}: Readonly<{
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}>) {
  const { locale } = await params;

  // Ensure that the incoming `locale` is valid
  if (!locales.includes(locale as any)) {
    notFound();
  }

  // Providing all messages to the client
  // side is the easiest way to get started
  const messages = await getMessages();

  return (
    <div className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
      <NextIntlClientProvider messages={messages}>
        <Providers>
          {children}
          {/* <PageTransition>{children}</PageTransition> */}
        </Providers>
        <Toaster richColors />
      </NextIntlClientProvider>
    </div>
  );
}
