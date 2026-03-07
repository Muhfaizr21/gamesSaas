'use client';

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
    LayoutDashboard, Users, Gamepad2, ShoppingCart,
    Settings, LogOut, Tag, MessageSquare, Globe, Link as LinkIcon,
    BarChart2, Wallet, ChevronDown, PackageSearch, Gift, Box, Server, Megaphone, ListVideo
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Store, CreditCard } from "lucide-react";

const NavGroup = ({ title, icon: Icon, children, activePrefixes, currentPath }: any) => {
    // Tentukan apakah ada anak link yang sedang aktif berdasarkan array activePrefixes
    const isActive = activePrefixes
        ? activePrefixes.some((prefix: string) => currentPath === prefix || currentPath.startsWith(`${prefix}/`))
        : false;

    const [isOpen, setIsOpen] = useState(isActive);

    // Auto-open jika path sesuai
    useEffect(() => {
        if (isActive) setIsOpen(true);
    }, [isActive]);

    return (
        <div className="flex flex-col mb-1 w-full relative">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={`flex items-center justify-between px-4 py-3 rounded-xl transition-all w-full group ${isActive ? 'bg-primary/5 text-primary' : 'text-zinc-400 hover:text-white hover:bg-white/5'}`}
            >
                <div className="flex items-center gap-3">
                    <Icon className={`h-5 w-5 ${isActive ? 'text-primary' : 'text-zinc-500 group-hover:text-zinc-300'} transition-colors`} />
                    <span className={`text-sm font-bold tracking-wide ${isActive ? 'text-primary' : ''}`}>{title}</span>
                </div>
                <ChevronDown className={`h-4 w-4 transition-transform duration-300 ${isOpen ? 'rotate-180 text-primary' : 'text-zinc-600'} ${isActive ? 'text-primary' : ''}`} />
            </button>
            <AnimatePresence initial={false}>
                {isOpen && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="overflow-hidden"
                    >
                        <div className="flex flex-col gap-1 border-l-2 border-white/5 ml-6 pl-4 py-2 mt-1">
                            {children}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

const NavItem = ({ href, icon: Icon, label, currentPath }: any) => {
    const isActive = currentPath === href || currentPath.startsWith(`${href}/`);
    return (
        <Link
            href={href}
            className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-all ${isActive ? 'bg-primary text-black font-bold shadow-[0_0_15px_rgba(250,204,21,0.2)]' : 'text-zinc-400 hover:text-white hover:bg-white/5 font-medium'}`}
        >
            <Icon className={`h-4 w-4 ${isActive ? 'text-black' : 'text-zinc-500'}`} />
            <span className="text-sm">{label}</span>
        </Link>
    );
};

export function AdminSidebar() {
    const { logout } = useAuth();
    const pathname = usePathname() || '';

    return (
        <aside className="w-[280px] bg-[#121212] border-r border-[#2a2a2a] min-h-screen hidden lg:flex flex-col shadow-2xl relative z-40">
            {/* Header / Logo */}
            <div className="p-6 border-b border-[#2a2a2a] bg-[#1a1a1a]">
                <h2 className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-primary to-yellow-600 tracking-tighter uppercase flex items-center gap-2">
                    <span className="bg-primary text-black px-2 py-0.5 rounded shadow-lg text-lg">SAM</span>
                    ADMIN
                </h2>
            </div>

            {/* Scrolling Menu */}
            <div className="flex-1 overflow-y-auto py-6 px-3 custom-scrollbar">

                {/* Dashboard Single Link */}
                <div className="px-2 mb-6">
                    <Link
                        href="/admin"
                        className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${pathname === '/admin' ? 'bg-primary/10 text-primary font-bold border border-primary/20' : 'text-zinc-400 hover:text-white hover:bg-white/5 font-semibold'}`}
                    >
                        <LayoutDashboard className={`h-5 w-5 ${pathname === '/admin' ? 'text-primary' : 'text-zinc-500'}`} />
                        <span className="text-sm">Dashboard Utama</span>
                    </Link>
                </div>

                <div className="space-y-2 px-2">
                    <p className="text-[10px] font-black text-zinc-600 uppercase tracking-widest px-4 mb-2">Modul Aplikasi</p>

                    {/* Katalog Produk Group */}
                    <NavGroup title="Katalog Produk" icon={PackageSearch} activePrefixes={['/admin/kategori', '/admin/voucher', '/admin/produk']} currentPath={pathname}>
                        <NavItem href="/admin/kategori" icon={Box} label="Kategori Game" currentPath={pathname} />
                        <NavItem href="/admin/voucher" icon={Gamepad2} label="Daftar Game" currentPath={pathname} />
                        <NavItem href="/admin/produk" icon={ShoppingCart} label="Produk Item" currentPath={pathname} />
                    </NavGroup>

                    {/* Promosi & Event Group */}
                    <NavGroup title="Promosi & Diskon" icon={Gift} activePrefixes={['/admin/promo', '/admin/promo-code', '/admin/spin-prize']} currentPath={pathname}>
                        <NavItem href="/admin/promo" icon={Tag} label="Flash Sale" currentPath={pathname} />
                        <NavItem href="/admin/promo-code" icon={Tag} label="Kupon Diskon" currentPath={pathname} />
                        <NavItem href="/admin/spin-prize" icon={Gift} label="Gacha (Spin)" currentPath={pathname} />
                    </NavGroup>

                    {/* Transaksi & Keuangan Group */}
                    <NavGroup title="Transaksi" icon={Wallet} activePrefixes={['/admin/pesanan', '/admin/deposit', '/admin/keuangan', '/admin/deposit-reseller']} currentPath={pathname}>
                        <NavItem href="/admin/pesanan" icon={ShoppingCart} label="Pesanan" currentPath={pathname} />
                        <NavItem href="/admin/deposit" icon={Wallet} label="M-Banking (User)" currentPath={pathname} />
                        <NavItem href="/admin/deposit-reseller" icon={CreditCard} label="Topup Saldo Toko" currentPath={pathname} />
                        <NavItem href="/admin/keuangan" icon={BarChart2} label="Lap. Keuangan" currentPath={pathname} />
                    </NavGroup>

                    {/* Pengguna & Interaksi Group */}
                    <NavGroup title="Pengguna & Sistem" icon={Users} activePrefixes={['/admin/users', '/admin/review', '/admin/pengaturan']} currentPath={pathname}>
                        <NavItem href="/admin/users" icon={Users} label="User Terdaftar" currentPath={pathname} />
                        <NavItem href="/admin/review" icon={MessageSquare} label="Ulasan Pelanggan" currentPath={pathname} />
                        <NavItem href="/admin/pengaturan" icon={Settings} label="Pengaturan Web" currentPath={pathname} />
                    </NavGroup>

                    {/* Manajemen Reseller (Superadmin) */}
                    <NavGroup title="Reseller Hub (SaaS)" icon={Store} activePrefixes={['/admin/tenants']} currentPath={pathname}>
                        <NavItem href="/admin/tenants" icon={Store} label="Daftar Toko" currentPath={pathname} />
                        <NavItem href="/admin/tenants/deposit" icon={CreditCard} label="Deposit Reseller" currentPath={pathname} />
                        <NavItem href="/admin/tenants/domains" icon={Globe} label="Custom Domain" currentPath={pathname} />
                        <NavItem href="/admin/tenants/plans" icon={ListVideo} label="Paket Langganan" currentPath={pathname} />
                        <NavItem href="/admin/tenants/broadcasts" icon={Megaphone} label="Broadcast News" currentPath={pathname} />
                    </NavGroup>

                    {/* Konfigurasi Global Platform (Superadmin) */}
                    <NavGroup title="Platform Settings" icon={Server} activePrefixes={['/admin/settings']} currentPath={pathname}>
                        <NavItem href="/admin/settings/general" icon={Settings} label="General & Markup" currentPath={pathname} />
                        <NavItem href="/admin/settings/providers" icon={LinkIcon} label="API Provider" currentPath={pathname} />
                        <NavItem href="/admin/settings/payment" icon={Wallet} label="Payment Gateway" currentPath={pathname} />
                        <NavItem href="/admin/settings/logs" icon={Server} label="Provider Logs" currentPath={pathname} />
                    </NavGroup>
                </div>
            </div>

            {/* Footer / Logout */}
            <div className="p-4 border-t border-[#2a2a2a] bg-[#1a1a1a]">
                <button
                    onClick={logout}
                    className="w-full flex items-center justify-center gap-3 px-4 py-3 bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white rounded-xl transition-all font-bold tracking-wide border border-red-500/20 shadow-[0_0_15px_rgba(239,68,68,0.05)] hover:shadow-[0_0_20px_rgba(239,68,68,0.4)]"
                >
                    <LogOut className="h-5 w-5" />
                    <span>Keluar (Logout)</span>
                </button>
            </div>

            <style jsx>{`
                .custom-scrollbar::-webkit-scrollbar {
                    width: 4px;
                }
                .custom-scrollbar::-webkit-scrollbar-track {
                    background: transparent;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background: #333;
                    border-radius: 10px;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                    background: var(--primary);
                }
            `}</style>
        </aside>
    );
}
