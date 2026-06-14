"use client";

import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import * as Avatar from "@radix-ui/react-avatar";
import { LogOut, Settings, User } from "lucide-react";
import { logoutUser } from "@/server/actions/auth-login-actions";
import { useTransition } from "react";

export function UserNavDropdown({ userRole }: { userRole?: string | null }) {
  const [isPending, startTransition] = useTransition();

  const handleLogout = () => {
    startTransition(() => {
      logoutUser();
    });
  };

  const getInitials = () => {
    // We would ideally pass down the actual User Name here, 
    // but for now we default to Role initials or 'Me'
    if (!userRole) return "U";
    return userRole.substring(0, 2).toUpperCase();
  };

  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger asChild>
        <button className="flex items-center justify-center outline-none focus-visible:ring-2 focus-visible:ring-blue-500 rounded-full transition-transform hover:scale-105 active:scale-95">
          <Avatar.Root className="inline-flex h-9 w-9 select-none items-center justify-center overflow-hidden rounded-full bg-blue-100 align-middle">
            <Avatar.Fallback className="text-sm font-medium text-blue-700">
              {getInitials()}
            </Avatar.Fallback>
          </Avatar.Root>
        </button>
      </DropdownMenu.Trigger>

      <DropdownMenu.Portal>
        <DropdownMenu.Content 
          align="end" 
          sideOffset={8}
          className="z-50 w-56 rounded-xl border border-gray-100 bg-white p-1.5 shadow-xl will-change-[opacity,transform] data-[side=bottom]:animate-slideUpAndFade data-[side=left]:animate-slideRightAndFade data-[side=right]:animate-slideLeftAndFade data-[side=top]:animate-slideDownAndFade"
        >
          <div className="px-3 py-2.5 mb-1 border-b border-gray-100">
            <p className="text-sm font-medium text-gray-900 capitalize">{userRole || "User"} Account</p>
            <p className="text-xs text-gray-500 mt-0.5 truncate">lawfirm@system.local</p>
          </div>

          <DropdownMenu.Item className="group relative flex cursor-pointer select-none items-center rounded-lg px-3 py-2 text-sm text-gray-700 outline-none hover:bg-[#f4f7fc] hover:text-blue-700 focus:bg-[#f4f7fc] data-[disabled]:pointer-events-none data-[disabled]:opacity-50 transition-colors">
            <User className="mr-2.5 h-4 w-4 text-gray-500 group-hover:text-blue-600" />
            Profile Settings
          </DropdownMenu.Item>
          
          <DropdownMenu.Item className="group relative flex cursor-pointer select-none items-center rounded-lg px-3 py-2 text-sm text-gray-700 outline-none hover:bg-[#f4f7fc] hover:text-blue-700 focus:bg-[#f4f7fc] data-[disabled]:pointer-events-none data-[disabled]:opacity-50 transition-colors">
            <Settings className="mr-2.5 h-4 w-4 text-gray-500 group-hover:text-blue-600" />
            Preferences
          </DropdownMenu.Item>

          <DropdownMenu.Separator className="m-1 h-px bg-gray-100" />

          <DropdownMenu.Item 
            onClick={handleLogout}
            disabled={isPending}
            className="group relative flex cursor-pointer select-none items-center rounded-lg px-3 py-2 text-sm text-red-600 outline-none hover:bg-red-50 focus:bg-red-50 data-[disabled]:pointer-events-none data-[disabled]:opacity-50 transition-colors"
          >
            <LogOut className="mr-2.5 h-4 w-4 text-red-500 group-hover:text-red-600" />
            {isPending ? "Signing out..." : "Sign Out"}
          </DropdownMenu.Item>
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
}
