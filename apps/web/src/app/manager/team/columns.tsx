'use client';

import { ColumnDef } from '@tanstack/react-table';
import { Profile } from '@prisma/client';
import { MoreHorizontal, Trash2, UserCheck } from 'lucide-react';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import { useState } from 'react';
import { deactivateUser, reactivateUser } from '@/server/actions/user-actions';
import { format } from 'date-fns';

function ActionCell({ user, onRefresh }: { user: Profile; onRefresh: () => void }) {
  const [isProcessing, setIsProcessing] = useState(false);

  const handleDeactivate = async () => {
    if (!window.confirm('Are you sure you want to deactivate this account? Any pending tasks will be reassigned to you.')) return;
    setIsProcessing(true);
    try {
      await deactivateUser(user.id);
      onRefresh();
    } catch (error: any) {
      console.error('Failed to deactivate user', error);
      alert(error.message || 'Failed to deactivate user.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReactivate = async () => {
    if (!window.confirm('Are you sure you want to reactivate this account?')) return;
    setIsProcessing(true);
    try {
      await reactivateUser(user.id);
      onRefresh();
    } catch (error: any) {
      console.error('Failed to reactivate user', error);
      alert(error.message || 'Failed to reactivate user.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger asChild>
        <button className="h-8 w-8 p-0 flex items-center justify-center rounded-md hover:bg-gray-100 transition-colors">
          <span className="sr-only">Open menu</span>
          <MoreHorizontal className="h-4 w-4 text-gray-500" />
        </button>
      </DropdownMenu.Trigger>
      <DropdownMenu.Portal>
        <DropdownMenu.Content align="end" className="z-50 min-w-[8rem] overflow-hidden rounded-md border border-gray-200 bg-white p-1 text-gray-700 shadow-md data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2">
          {user.is_active ? (
            <DropdownMenu.Item
              onClick={handleDeactivate}
              disabled={isProcessing}
              className="relative flex cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors focus:bg-red-50 focus:text-red-600 data-[disabled]:pointer-events-none data-[disabled]:opacity-50 text-red-600"
            >
              <Trash2 className="mr-2 h-4 w-4" />
              {isProcessing ? 'Deactivating...' : 'Deactivate Account'}
            </DropdownMenu.Item>
          ) : (
            <DropdownMenu.Item
              onClick={handleReactivate}
              disabled={isProcessing}
              className="relative flex cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors focus:bg-emerald-50 focus:text-emerald-600 data-[disabled]:pointer-events-none data-[disabled]:opacity-50 text-emerald-600"
            >
              <UserCheck className="mr-2 h-4 w-4" />
              {isProcessing ? 'Reactivating...' : 'Reactivate Account'}
            </DropdownMenu.Item>
          )}
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
}

export function getColumns(onRefresh: () => void): ColumnDef<Profile>[] {
  return [
    {
      accessorKey: 'name',
      header: 'Name',
      cell: ({ row }) => (
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-semibold text-xs">
            {row.original.name.substring(0, 2).toUpperCase()}
          </div>
          <div>
            <div className="font-medium text-gray-900">{row.original.name}</div>
            <div className="text-xs text-gray-500 md:hidden">{row.original.email}</div>
          </div>
        </div>
      ),
    },
    {
      accessorKey: 'email',
      header: 'Email',
      cell: ({ row }) => (
        <div className="text-gray-600 hidden md:block">{row.original.email}</div>
      )
    },
    {
      accessorKey: 'role',
      header: 'Role',
      cell: ({ row }) => (
        <div className="capitalize px-2 py-1 bg-gray-100 text-gray-700 rounded-md inline-block text-xs font-medium">
          {row.original.role}
        </div>
      ),
    },
    {
      accessorKey: 'is_active',
      header: 'Status',
      cell: ({ row }) => (
        <div className={`capitalize px-2 py-1 rounded-md inline-block text-xs font-medium ${row.original.is_active ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
          {row.original.is_active ? 'Active' : 'Deactivated'}
        </div>
      ),
    },
    {
      accessorKey: 'created_at',
      header: 'Joined',
      cell: ({ row }) => (
        <div className="text-gray-500 text-sm hidden md:block">
          {format(new Date(row.original.created_at), 'MMM d, yyyy')}
        </div>
      ),
    },
    {
      id: 'actions',
      cell: ({ row }) => <ActionCell user={row.original} onRefresh={onRefresh} />,
    },
  ];
}
