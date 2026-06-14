"use client";

import { Profile } from "@prisma/client";
import { DataTable } from "@/components/ui/data-table";
import { getColumns } from "./columns";
import { AddUserDialog } from "./AddUserDialog";
import { useRouter } from "next/navigation";
import { useTransition } from "react";

export function TeamClient({ initialData }: { initialData: Profile[] }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const handleRefresh = () => {
    startTransition(() => {
      router.refresh();
    });
  };

  const columns = getColumns(handleRefresh);

  return (
    <div className="flex flex-col flex-1 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex-1" />
        <div className="flex items-center gap-2">
          <AddUserDialog onUserAdded={handleRefresh} />
        </div>
      </div>

      <div className="relative flex-1">
        {isPending && (
          <div className="absolute inset-0 z-20 bg-white/50 flex items-center justify-center">
            <div className="w-6 h-6 border-2 border-[#1a73e8] border-t-transparent rounded-full animate-spin"></div>
          </div>
        )}
        <DataTable columns={columns} data={initialData} />
      </div>
    </div>
  );
}
