"use client";

import { WriterSidebar } from "@/components/writer/WriterSidebar";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function WriterLayout({ children }: { children: React.ReactNode }) {
    const { user, isLoading, isHydrated } = useAuth();
    const router = useRouter();
    const [isAuthorized, setIsAuthorized] = useState(false);

    useEffect(() => {
        if (isHydrated && !isLoading) {
            if (!user) {
                router.push('/login');
            } else if (user.role !== 'writer' && user.role !== 'admin') {
                router.push('/');
            } else {
                setIsAuthorized(true);
            }
        }
    }, [user, isLoading, isHydrated, router]);

    if (!isHydrated || isLoading || !isAuthorized) {
        return (
            <div className="min-h-screen bg-[#121212] flex items-center justify-center">
                <div className="text-primary font-bold animate-pulse">Memuat Writer Panel...</div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#0a0a0a] flex">
            <WriterSidebar />
            <main className="flex-1 p-6 lg:p-10 overflow-y-auto">
                {children}
            </main>
        </div>
    );
}
