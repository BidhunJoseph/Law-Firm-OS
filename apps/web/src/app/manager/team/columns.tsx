"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Profile } from "@prisma/client";
import { MoreHorizontal, Trash2 } from "lucide-react";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { useState } from "react";
import { deleteTeamMember } from "@/server/actions/auth-actions";
import { format } from "date-fns";

function ActionCell({ user, onUserDeleted }: { user: Profile; onUserDeleted: () => void }) {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    if (!window.confirm("Are you sure you want to deactivate this account? They will lose all access immediately.")) return;
    setIsDeleting(true);
    try {
      await deleteTeamMember(user.id);
      onUserDeleted();
    } catch (error: any) {
      console.error("Failed to deactivate user", error);
      alert(error.message || "Failed to deactivate user.");
    } finally {
      setIsDeleting(false);
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
          <DropdownMenu.Item
            onClick={handleDelete}
            disabled={isDeleting}
            className="relative flex cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors focus:bg-red-50 focus:text-red-600 data-[disabled]:pointer-events-none data-[disabled]:opacity-50 text-red-600"
          >
            <Trash2 className="mr-2 h-4 w-4" />
            {isDeleting ? "Deactivating..." : "Deactivate Account"}
          </DropdownMenu.Item>
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
}

export function getColumns(onUserDeleted: () => void): ColumnDef<Profile>[] {
  return [
    {
      accessorKey: "name",
      header: "Name",
      cell: ({ row }) => (
        <div className="font-medium text-gray-900">{row.original.name}</div>
      ),
    },
    {
      accessorKey: "email",
      header: "Email",
    },
    {
      accessorKey: "role",
      header: "Role",
      cell: ({ row }) => (
        <div className="capitalize px-2 py-1 bg-gray-100 text-gray-700 rounded-md inline-block text-xs font-medium">
          {row.original.role}
        </div>
      ),
    },
    {
      accessorKey: "created_at",
      header: "Joined",
      cell: ({ row }) => (
        <div className="text-gray-500">
          {format(new Date(row.original.created_at), "MMM d, yyyy")}
        </div>
      ),
    },
    {
      id: "actions",
      cell: ({ row }) => <ActionCell user={row.original} onUserDeleted={onUserDeleted} />,
    },
  ];
}
