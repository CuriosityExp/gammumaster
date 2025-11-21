// src/components/admin/AccountDropdown.tsx
"use client";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { LogOut, Settings, User } from "lucide-react";
import { signOut } from "next-auth/react";
import Link from "next/link";
import { useLocale } from "next-intl";

interface AccountDropdownProps {
  readonly email: string | null | undefined;
  readonly name?: string;
  readonly availablePoints?: number;
  readonly role: "admin" | "facilitator";
}

export function AccountDropdown({ email, name, availablePoints, role }: AccountDropdownProps) {
  const locale = useLocale();
  const handleLogout = async () => {
    await signOut({ callbackUrl: `/${locale}/admin/login` });
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="flex flex-col items-end h-auto py-2">
          <span className="text-sm font-medium">{name || email || 'User'}</span>
          {availablePoints !== undefined && (
            <span className="text-xs text-muted-foreground">
              {availablePoints.toLocaleString()} points {role === "admin" ? "remaining" : "available"}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>My Account</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link href={`/${locale}/admin/account`} className="cursor-pointer">
            <Settings className="mr-2 h-4 w-4" />
            <span>Account Settings</span>
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href={`/${locale}/admin`} className="cursor-pointer">
            <User className="mr-2 h-4 w-4" />
            <span>Dashboard</span>
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleLogout} className="cursor-pointer text-red-600">
          <LogOut className="mr-2 h-4 w-4" />
          <span>Logout</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
