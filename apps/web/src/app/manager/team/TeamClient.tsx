'use client';

import { Profile } from '@prisma/client';
import { DataTable } from '@/components/ui/data-table';
import { getColumns } from './columns';
import { AddUserDialog } from './AddUserDialog';
import { useRouter } from 'next/navigation';
import { useTransition } from 'react';
import { Users, Search } from 'lucide-react';

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
    <div className="flex flex-col flex-1 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-gray-900">Team Directory</h2>
            <p className="text-xs text-gray-500">{initialData.length} active members</p>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <AddUserDialog onUserAdded={handleRefresh} />
        </div>
      </div>

      <div className="relative flex-1 bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        {isPending && (
          <div className="absolute inset-0 z-20 bg-white/60 backdrop-blur-[2px] flex items-center justify-center transition-all">
            <div className="flex flex-col items-center gap-3">
              <div className="w-8 h-8 border-3 border-[#1a73e8] border-t-transparent rounded-full animate-spin"></div>
              <p className="text-sm font-medium text-[#1a73e8] animate-pulse">Synchronizing...</p>
            </div>
          </div>
        )}
        <div className="p-1">
          <DataTable columns={columns} data={initialData} />
        </div>
      </div>
    </div>
  );
}
