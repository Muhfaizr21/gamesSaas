"use client";

import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { AdminHeader } from "@/components/admin/AdminHeader";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    const { user, isLoading, isHydrated } = useAuth();
    const router = useRouter();
    const [isAuthorized, setIsAuthorized] = useState(false);

    useEffect(() => {
        if (isHydrated && !isLoading) {
            if (!user) {
                router.push('/login');
            } else if (user.role !== 'admin') {
                router.push('/');
            } else {
                setIsAuthorized(true);
            }
        }
    }, [user, isLoading, isHydrated, router]);

    if (!isHydrated || isLoading || !isAuthorized) {
        return (
            <div className="min-h-screen bg-[#121212] flex items-center justify-center">
                <div className="text-primary font-bold animate-pulse">Memuat Admin Panel...</div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#121212] flex">
            {/* Sidebar */}
            <AdminSidebar />

            {/* Main Content */}
            <div className="flex-1 flex flex-col min-w-0">
                <AdminHeader />
                <main className="flex-1 p-6 lg:p-10 overflow-y-auto">
                    {children}
                </main>
            </div>
        </div>
    );
}
