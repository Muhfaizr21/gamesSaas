"use client";

import { usePathname } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export function RootNavigationWrapper({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const isAdminRoute = pathname?.startsWith('/admin');
    const isWriterRoute = pathname?.startsWith('/writer');
    const hideNavbar = isAdminRoute || isWriterRoute;

    return (
        <>
            {!hideNavbar && <Navbar />}
            <main>
                {children}
            </main>
            {!isAdminRoute && !isWriterRoute && <Footer />}
        </>
    );
}
