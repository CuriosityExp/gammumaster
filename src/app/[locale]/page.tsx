"use client";

import Image from "next/image";
import Link from "next/link";
import { useTranslations } from "next-intl";

export default function Home({ params }: { params: { locale: string } }) {
  const t = useTranslations("home");

  return (
    <div className="h-screen w-full bg-white dark:bg-slate-900 flex items-center justify-center relative overflow-hidden">
      <div className="absolute inset-0 animate-gradient opacity-20 dark:opacity-10"></div>
      <div className="w-full max-w-7xl px-6 py-12 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          {/* Hero */}
          <section className="space-y-8">
            <div className="inline-flex items-center gap-4">
              <Image src="/logo192.png" alt="GammuMaster" width={64} height={64} className="rounded-full shadow-xl" />
              <h1 className="text-6xl sm:text-7xl lg:text-8xl font-extrabold text-indigo-600 dark:text-indigo-400">
                {t("title")}
              </h1>
            </div>

            <p className="text-xl sm:text-2xl text-slate-700 dark:text-slate-300 max-w-2xl leading-relaxed">{t("subtitle")}</p>

            <div className="flex flex-wrap gap-4 items-center">
              <Link
                href={`/${params.locale}/login`}
                className="inline-flex items-center px-8 py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg shadow-lg font-semibold text-lg transform transition-all active:scale-95"
              >
                {t("getStarted")}
              </Link>

              <span className="px-4 py-2 rounded-full bg-slate-200 dark:bg-slate-700 text-base font-medium text-slate-800 dark:text-slate-200 shadow-sm">✨ {t("feature1Title")}</span>
              <span className="px-4 py-2 rounded-full bg-slate-200 dark:bg-slate-700 text-base font-medium text-slate-800 dark:text-slate-200 shadow-sm">⚡ {t("feature2Title")}</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mt-12">
              <div className="p-6 rounded-xl shadow-lg bg-slate-100 dark:bg-slate-800">
                <div className="text-3xl mb-4">🎯</div>
                <h4 className="font-semibold text-lg mb-2">{t("feature1Title")}</h4>
                <p className="text-base text-slate-600 dark:text-slate-400">{t("feature1Desc")}</p>
              </div>

              <div className="p-6 rounded-xl shadow-lg bg-slate-100 dark:bg-slate-800">
                <div className="text-3xl mb-4">🚀</div>
                <h4 className="font-semibold text-lg mb-2">{t("feature2Title")}</h4>
                <p className="text-base text-slate-600 dark:text-slate-400">{t("feature2Desc")}</p>
              </div>

              <div className="p-6 rounded-xl shadow-lg bg-slate-100 dark:bg-slate-800">
                <div className="text-3xl mb-4">💡</div>
                <h4 className="font-semibold text-lg mb-2">{t("feature3Title")}</h4>
                <p className="text-base text-slate-600 dark:text-slate-400">{t("feature3Desc")}</p>
              </div>
            </div>
          </section>

        </div>
      </div>
    </div>
  );
}
