import { getTranslations } from "next-intl/server";
import { Metadata } from "next";
import { PlusCircle, ArrowLeft } from "lucide-react";
import Link from "next/link";
import ClassList from "@/components/classes/ClassList";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Class Management",
};

export default async function ClassManagementPage({
  params,
}: {
  params: { locale: string };
}) {
  const t = await getTranslations("admin");

  return (
    <div className="container mx-auto p-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8 gap-4">
        <Button 
          asChild
          variant="outline"
          className="flex items-center gap-2 w-fit" >
          <Link href={`/${params.locale}/admin`}>
            <ArrowLeft className="h-4 w-4" />
            {t("backToDashboard")}
          </Link>
        </Button>
      </div>
        <h1 className="text-2xl font-bold mb-4 flex items-center gap-2">
          <PlusCircle className="h-7 w-7 text-yellow-600" />
          {t("classManagement")}
        </h1>
        <p className="mb-6 text-muted-foreground">{t("classManagementDesc")}</p>
      <ClassList />
    </div>
  );
}
