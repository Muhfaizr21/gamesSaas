"use client";

import { ResellerSidebar } from "@/components/reseller/ResellerSidebar";
import { AdminHeader } from "@/components/admin/AdminHeader";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function ResellerLayout({ children }: { children: React.ReactNode }) {
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
                // Baik SuperAdmin / ResellerAdmin, role-nya sama 'admin', hanya database yg berbeda yang membedakan. 
                setIsAuthorized(true);
            }
        }
    }, [user, isLoading, isHydrated, router]);

    if (!isHydrated || isLoading || !isAuthorized) {
        return (
            <div className="min-h-screen bg-[#07071a] flex items-center justify-center">
                <div className="text-blue-500 font-bold animate-pulse">Memuat Panel Toko...</div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#07071a] flex">
            {/* Sidebar */}
            <ResellerSidebar />

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
