'use client';

import Link from "next/link";
import { FileText, PenTool, BarChart3, LogOut, Map } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

import { useSearchParams, usePathname } from 'next/navigation';

export function WriterSidebar() {
    const { user, logout } = useAuth();
    const searchParams = useSearchParams();
    const pathname = usePathname();
    const isNew = searchParams?.get('action') === 'new';
    const isSitemap = pathname === '/writer/sitemap';

    return (
        <aside className="w-64 bg-[#1a1a1a] border-r border-[#2a2a2a] min-h-screen hidden md:flex flex-col">
            <div className="p-6 border-b border-[#2a2a2a]">
                <h2 className="text-2xl font-black text-primary tracking-tighter uppercase">SAM<span className="text-foreground">WRITER</span></h2>
                <p className="text-xs text-muted-foreground mt-1">Content Management</p>
            </div>

            <nav className="flex-1 space-y-2 px-4 py-4">
                <Link href="/writer" className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${(!isNew && !isSitemap) ? 'bg-primary/10 text-primary font-bold' : 'text-muted-foreground hover:text-primary hover:bg-primary/10'}`}>
                    <FileText className="h-5 w-5" />
                    <span className="font-semibold text-sm">Artikel Saya</span>
                </Link>
                <Link href="/writer?action=new" className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${isNew ? 'bg-primary/10 text-primary font-bold' : 'text-muted-foreground hover:text-primary hover:bg-primary/10'}`}>
                    <PenTool className="h-5 w-5" />
                    <span className="font-semibold text-sm">Tulis Baru</span>
                </Link>
                <Link href="/writer/sitemap" className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${isSitemap ? 'bg-primary/10 text-primary font-bold' : 'text-muted-foreground hover:text-primary hover:bg-primary/10'}`}>
                    <Map className="h-5 w-5" />
                    <span className="font-semibold text-sm">SEO Sitemap</span>
                </Link>
            </nav>

            <div className="px-4 pb-6 mt-auto">
                {user && (
                    <div className="mb-4 px-4 py-3 bg-[#121212] rounded-xl border border-[#2a2a2a]">
                        <p className="text-sm font-bold text-foreground truncate">{user.name}</p>
                        <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                    </div>
                )}
                <button onClick={logout} className="w-full flex items-center gap-3 px-4 py-3 text-red-500 hover:bg-red-500/10 rounded-xl transition-all">
                    <LogOut className="h-5 w-5" />
                    <span className="font-semibold text-sm">Keluar</span>
                </button>
            </div>
        </aside>
    );
}
