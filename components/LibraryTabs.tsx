'use client'

import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { UserBook } from "../components/LibraryData";

interface LibraryTabsProps {
  status: 'all' | UserBook['status'];
  setStatus: (v: 'all' | UserBook['status']) => void;
}

export default function LibraryTabs({ status, setStatus }: LibraryTabsProps) {
  return (
    <div className="flex-none mb-6">
      <Tabs value={status} onValueChange={v => setStatus(v as 'all' | UserBook['status'])}>
        <TabsList>
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="want">Want to Read</TabsTrigger>
          <TabsTrigger value="reading">Currently Reading</TabsTrigger>
          <TabsTrigger value="finished">Finished</TabsTrigger>
        </TabsList>
      </Tabs>
    </div>
  )
}
