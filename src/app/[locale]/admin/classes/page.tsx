import { getTranslations } from 'next-intl/server';
import { Metadata } from 'next';
import { PlusCircle } from 'lucide-react';
import ClassList from '@/components/classes/ClassList';

export const metadata: Metadata = {
  title: 'Class Management',
};

export default async function ClassManagementPage({ params }: { params: { locale: string } }) {
  const t = await getTranslations('admin');

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4 flex items-center gap-2">
        <PlusCircle className="h-7 w-7 text-yellow-600" />
        {t('classManagement')}
      </h1>
      <p className="mb-6 text-muted-foreground">{t('classManagementDesc')}</p>
      <ClassList />
    </div>
  );
}
