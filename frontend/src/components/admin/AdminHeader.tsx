"use client";

import { useAuth } from "@/context/AuthContext";
import { UserCircle, Menu } from "lucide-react";

export function AdminHeader() {
    const { user } = useAuth();

    return (
        <header className="h-20 bg-[#1a1a1a] border-b border-[#2a2a2a] flex items-center justify-between px-6 lg:px-10">
            <div className="flex items-center gap-4">
                <button className="md:hidden text-muted-foreground hover:text-foreground">
                    <Menu className="h-6 w-6" />
                </button>
                <h1 className="text-xl font-bold hidden sm:block">Admin Panel</h1>
            </div>

            <div className="flex items-center gap-4">
                <div className="flex items-center gap-3 bg-[#121212] px-4 py-2 rounded-full border border-[#2a2a2a]">
                    <UserCircle className="h-6 w-6 text-primary" />
                    <div className="flex flex-col hidden sm:flex">
                        <span className="text-sm font-bold leading-none">{user?.name || 'Admin'}</span>
                        <span className="text-xs text-muted-foreground uppercase">{user?.role || 'Administrator'}</span>
                    </div>
                </div>
            </div>
        </header>
    );
}
