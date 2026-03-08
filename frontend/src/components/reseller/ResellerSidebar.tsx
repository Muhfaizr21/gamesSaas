'use client';

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
    LayoutDashboard, Users, Gamepad2, ShoppingCart,
    Settings, LogOut, Tag, MessageSquare, Globe, Link as LinkIcon,
    BarChart2, Wallet, ChevronDown, PackageSearch, Gift, Box, Store, Banknote, ListVideo, CreditCard
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

const NavGroup = ({ title, icon: Icon, children, activePrefixes, currentPath }: any) => {
    const isActive = activePrefixes
        ? activePrefixes.some((prefix: string) => currentPath === prefix || currentPath.startsWith(`${prefix}/`))
        : false;

    const [isOpen, setIsOpen] = useState(isActive);

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

export function ResellerSidebar() {
    const { logout } = useAuth();
    const pathname = usePathname() || '';

    return (
        <aside className="w-[280px] bg-[#0A0A0A] border-r border-[#1a1a1a] min-h-screen hidden lg:flex flex-col shadow-2xl relative z-40">
            {/* Header / Logo */}
            <div className="p-6 border-b border-[#1a1a1a] bg-[#0A0A0A]">
                <h2 className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-600 tracking-tighter uppercase flex items-center gap-2">
                    <span className="bg-blue-600 text-white px-2 py-0.5 rounded shadow-lg text-lg">RESELLER</span>
                    PANEL
                </h2>
            </div>

            {/* Scrolling Menu */}
            <div className="flex-1 overflow-y-auto py-6 px-3 custom-scrollbar">

                {/* Dashboard Single Link */}
                <div className="px-2 mb-6">
                    <Link
                        href="/admin-reseller"
                        className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${pathname === '/admin-reseller' ? 'bg-blue-600/10 text-blue-500 font-bold border border-blue-600/20' : 'text-zinc-400 hover:text-white hover:bg-white/5 font-semibold'}`}
                    >
                        <LayoutDashboard className={`h-5 w-5 ${pathname === '/admin-reseller' ? 'text-blue-500' : 'text-zinc-500'}`} />
                        <span className="text-sm">Dashboard Toko</span>
                    </Link>
                </div>

                <div className="space-y-2 px-2">
                    <p className="text-[10px] font-black text-zinc-600 uppercase tracking-widest px-4 mb-2">Manajemen Topup</p>

                    <NavGroup title="Toko & Produk" icon={Store} activePrefixes={['/admin-reseller/produk', '/admin-reseller/kategori', '/admin-reseller/voucher']} currentPath={pathname}>
                        <NavItem href="/admin-reseller/produk" icon={ShoppingCart} label="Produk & Harga" currentPath={pathname} />
                        <NavItem href="/admin-reseller/kategori" icon={Box} label="Kategori Game" currentPath={pathname} />
                        <NavItem href="/admin-reseller/voucher" icon={Gamepad2} label="Daftar Game" currentPath={pathname} />
                    </NavGroup>

                    <NavGroup title="Promosi & Diskon" icon={Gift} activePrefixes={['/admin-reseller/promo', '/admin-reseller/promo-code', '/admin-reseller/spin-prize']} currentPath={pathname}>
                        <NavItem href="/admin-reseller/promo" icon={Tag} label="Flash Sale" currentPath={pathname} />
                        <NavItem href="/admin-reseller/promo-code" icon={Tag} label="Kupon Diskon" currentPath={pathname} />
                        <NavItem href="/admin-reseller/spin-prize" icon={Gift} label="Gacha (Spin)" currentPath={pathname} />
                    </NavGroup>

                    <NavGroup title="Transaksi" icon={Wallet} activePrefixes={['/admin-reseller/pesanan', '/admin-reseller/deposit-user', '/admin-reseller/keuangan']} currentPath={pathname}>
                        <NavItem href="/admin-reseller/pesanan" icon={ShoppingCart} label="Pesanan Pelanggan" currentPath={pathname} />
                        <NavItem href="/admin-reseller/deposit-user" icon={CreditCard} label="M-Banking (User)" currentPath={pathname} />
                        <NavItem href="/admin-reseller/keuangan" icon={BarChart2} label="Laporan Keuangan" currentPath={pathname} />
                    </NavGroup>

                    <div className="my-6 border-t border-white/5 mx-4" />

                    <p className="text-[10px] font-black text-zinc-600 uppercase tracking-widest px-4 mb-2">Keuangan & Sistem</p>

                    <NavGroup title="Saldo API" icon={Banknote} activePrefixes={['/admin-reseller/deposit', '/admin-reseller/mutasi']} currentPath={pathname}>
                        <NavItem href="/admin-reseller/deposit" icon={CreditCard} label="Topup Saldo Toko" currentPath={pathname} />
                        <NavItem href="/admin-reseller/mutasi" icon={BarChart2} label="Riwayat Saldo" currentPath={pathname} />
                    </NavGroup>

                    <NavGroup title="Pengaturan Toko" icon={Settings} activePrefixes={['/admin-reseller/domain', '/admin-reseller/langganan', '/admin-reseller/pengaturan', '/admin-reseller/users', '/admin-reseller/review', '/admin-reseller/rekening']} currentPath={pathname}>
                        <NavItem href="/admin-reseller/users" icon={Users} label="User Terdaftar" currentPath={pathname} />
                        <NavItem href="/admin-reseller/review" icon={MessageSquare} label="Ulasan Pelanggan" currentPath={pathname} />
                        <NavItem href="/admin-reseller/rekening" icon={Banknote} label="Rekening Bank" currentPath={pathname} />
                        <NavItem href="/admin-reseller/domain" icon={Globe} label="Custom Domain" currentPath={pathname} />
                        <NavItem href="/admin-reseller/langganan" icon={ListVideo} label="Paket Langganan" currentPath={pathname} />
                        <NavItem href="/admin-reseller/pengaturan" icon={Settings} label="Global Settings" currentPath={pathname} />
                    </NavGroup>
                </div>
            </div>

            {/* Footer / Logout */}
            <div className="p-4 border-t border-[#1a1a1a] bg-[#050505]">
                <button
                    onClick={logout}
                    className="flex w-full items-center justify-center gap-2 px-4 py-3 rounded-lg text-red-500 hover:bg-red-500/10 transition-colors font-bold text-sm"
                >
                    <LogOut className="h-4 w-4" /> Keluar
                </button>
            </div>
        </aside>
    );
}
