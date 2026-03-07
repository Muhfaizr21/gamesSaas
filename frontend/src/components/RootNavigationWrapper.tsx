"use client";

import { usePathname } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export function RootNavigationWrapper({ children }: { children: React.ReactNode }) {
    const pathname = usePathname() || '';
    const safePath = pathname.toLowerCase();

    // Explicitly check for reseller, admin, writer
    const isResellerRoute = safePath.includes('/reseller');
    const isAdminRoute = safePath.includes('/admin');
    const isWriterRoute = safePath.includes('/writer');

    const hideNavbar = isAdminRoute || isWriterRoute || isResellerRoute;
    const hideFooter = isAdminRoute || isWriterRoute || isResellerRoute;

    return (
        <>
            {!hideNavbar && <Navbar />}
            <main>
                {children}
            </main>
            {!hideFooter && <Footer />}
        </>
    );
}
