'use client'

import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { UserBook } from "../components/LibraryData";
import { useLanguage } from "@/context/LanguageContext";

interface LibraryTabsProps {
  status: 'all' | UserBook['status'];
  setStatus: (v: 'all' | UserBook['status']) => void;
}

export default function LibraryTabs({ status, setStatus }: LibraryTabsProps) {
  const { t } = useLanguage();
  return (
    <div className="flex-none mb-6">
      <Tabs value={status} onValueChange={v => setStatus(v as 'all' | UserBook['status'])}>
        <TabsList>
          <TabsTrigger value="all">{t("All")}</TabsTrigger>
          <TabsTrigger value="want">{t("Want to Read")}</TabsTrigger>
          <TabsTrigger value="reading">{t("Reading")}</TabsTrigger>
          <TabsTrigger value="finished">{t("Finished")}</TabsTrigger>
        </TabsList>
      </Tabs>
    </div>
  )
}
