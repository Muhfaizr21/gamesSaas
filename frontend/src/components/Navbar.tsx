'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useRouter, usePathname } from 'next/navigation';
import { useState, useEffect, useRef } from 'react';
import { SearchIcon, Trophy, FileText, Calculator, AlignJustify, Search, Wallet, User as UserIcon, LogIn, ChevronDown, LogOut } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';

export default function Navbar() {
    const { user, logout, isLoading } = useAuth();
    const router = useRouter();
    const pathname = usePathname() || '';

    // Bulletproof: Immediately nullify if on reseller, admin, or writer
    const lowerPath = pathname.toLowerCase();
    if (lowerPath.includes('/reseller') || lowerPath.includes('/admin') || lowerPath.includes('/writer')) {
        return null;
    }

    // Search states
    const [searchQuery, setSearchQuery] = useState('');
    const [allVouchers, setAllVouchers] = useState<any[]>([]);
    const [searchResults, setSearchResults] = useState<any[]>([]);
    const [isSearchFocused, setIsSearchFocused] = useState(false);
    const searchRef = useRef<HTMLDivElement>(null);

    // Fetch all vouchers for search
    useEffect(() => {
        const fetchAllVouchers = async () => {
            try {
                const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/public/vouchers`);
                if (res.ok) {
                    const data = await res.json();
                    setAllVouchers(data);
                }
            } catch (error) {
                console.error("Gagal mengambil data pencarian:", error);
            }
        };
        fetchAllVouchers();
    }, []);

    // Filter search results
    useEffect(() => {
        if (!searchQuery.trim()) {
            setSearchResults([]);
            return;
        }
        const lowerQuery = searchQuery.toLowerCase();
        const filtered = allVouchers.filter((v: any) =>
            v.name.toLowerCase().includes(lowerQuery)
        ).slice(0, 5); // Max 5 results
        setSearchResults(filtered);
    }, [searchQuery, allVouchers]);

    // Handle click outside to close search dropdown
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
                setIsSearchFocused(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleResultClick = (slug: string) => {
        setIsSearchFocused(false);
        setSearchQuery('');

        if (!user) {
            router.push(`/login?redirect=/topup/${slug}`);
        } else {
            router.push(`/topup/${slug}`);
        }
    };

    return (
        <header className="sticky top-0 z-50 w-full glass-navbar transition-all duration-300">
            {/* Top Row: Logo, Search, User */}
            <div className="container mx-auto px-4 max-w-7xl h-16 flex items-center justify-between gap-4 relative z-20">

                {/* Logo */}
                <Link href="/" className="flex items-center space-x-2 shrink-0 group">
                    <motion.div
                        whileHover={{ rotate: 15, scale: 1.1 }}
                        className="relative h-9 w-9 rounded-full border-2 border-primary overflow-hidden shadow-[0_0_15px_rgba(250,204,21,0.3)]"
                    >
                        <Image src="/images/fallback.png" alt="Logo" fill className="object-cover" sizes="36px" />
                    </motion.div>
                    <span className="hidden sm:inline-block font-black text-2xl uppercase tracking-widest text-white">
                        SAM<span className="text-primary italic">STORE</span>
                    </span>
                </Link>

                {/* Search Bar (Center) */}
                <div className="flex-1 max-w-2xl hidden md:block" ref={searchRef}>
                    <div className="relative w-full group">
                        <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none">
                            <SearchIcon className="h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                        </div>
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            onFocus={() => setIsSearchFocused(true)}
                            className="flex h-11 w-full rounded-full border border-white/5 bg-white/5 px-4 py-2 pl-11 text-sm text-foreground shadow-inner transition-all placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:bg-white/10"
                            placeholder="Cari Game atau Voucher..."
                        />

                        {/* Search Results Dropdown */}
                        <AnimatePresence>
                            {isSearchFocused && searchQuery.trim() && (
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: 10 }}
                                    className="absolute top-full left-0 right-0 mt-3 bg-[#1a1a1a] border border-white/10 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] overflow-hidden z-[100]"
                                >
                                    {searchResults.length > 0 ? (
                                        <ul className="py-2">
                                            {searchResults.map((result) => (
                                                <motion.li
                                                    key={result.id}
                                                    whileHover={{ x: 5 }}
                                                >
                                                    <button
                                                        onClick={() => handleResultClick(result.slug)}
                                                        className="w-full text-left px-4 py-3 hover:bg-white/5 flex items-center gap-3 transition-colors"
                                                    >
                                                        <div className="relative w-11 h-11 rounded-xl overflow-hidden shrink-0 bg-[#121212] border border-white/5">
                                                            <Image
                                                                src={result.thumbnail || `/images/fallback.png`}
                                                                alt={result.name}
                                                                fill
                                                                className="object-cover"
                                                                sizes="44px"
                                                            />
                                                        </div>
                                                        <div className="flex flex-col overflow-hidden">
                                                            <span className="text-sm font-bold text-white truncate">{result.name}</span>
                                                            <span className="text-xs text-muted-foreground truncate">{result.Category?.name || 'Voucher'}</span>
                                                        </div>
                                                    </button>
                                                </motion.li>
                                            ))}
                                        </ul>
                                    ) : (
                                        <div className="px-4 py-8 text-center text-sm text-muted-foreground">
                                            Tidak ditemukan game dengan kata kunci "<span className="text-white font-bold">{searchQuery}</span>"
                                        </div>
                                    )}
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>

                {/* Right Actions */}
                <div className="flex items-center gap-3 shrink-0">
                    {/* Mobile Search Icon */}
                    <button className="md:hidden flex h-10 w-10 items-center justify-center rounded-full bg-white/5 border border-white/10 text-muted-foreground hover:text-foreground">
                        <Search className="h-4 w-4" />
                    </button>

                    {/* Currency / Region */}
                    <div className="hidden sm:flex items-center gap-2 h-10 px-4 rounded-full bg-white/5 border border-white/10 text-xs font-bold tracking-widest text-muted-foreground">
                        <div className="relative w-4 h-3 rounded-sm overflow-hidden">
                            <Image src="https://flagcdn.com/w20/id.png" alt="ID" fill className="object-cover" sizes="16px" />
                        </div>
                        <span>IDR</span>
                    </div>

                    {/* Auth Buttons / User Profile */}
                    {!isLoading && (
                        user ? (
                            <div className="hidden lg:flex items-center gap-4">
                                <div className="flex flex-col items-end mr-1">
                                    <span className="text-[10px] text-muted-foreground font-black uppercase tracking-widest">Saldo</span>
                                    <span className="text-sm font-black text-primary">Rp {user.balance.toLocaleString('id-ID')}</span>
                                </div>

                                <div className="relative group cursor-pointer">
                                    <div className="flex items-center gap-2 bg-white/5 border border-white/10 pl-2 pr-4 py-1.5 rounded-full hover:border-primary/50 transition-all hover:bg-white/10">
                                        <div className="h-8 w-8 rounded-full bg-gradient-to-br from-primary to-yellow-600 flex items-center justify-center text-black font-black text-sm shadow-lg">
                                            {user.name.charAt(0).toUpperCase()}
                                        </div>
                                        <span className="text-xs font-bold text-white max-w-[100px] truncate">{user.name}</span>
                                        <ChevronDown className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-transform group-hover:rotate-180" />
                                    </div>

                                    {/* Dropdown */}
                                    <div className="absolute right-0 top-full mt-3 w-56 rounded-2xl border border-white/10 bg-[#1a1a1a] p-2 shadow-2xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 translate-y-4 group-hover:translate-y-0 z-[100]">
                                        <div className="px-4 py-3 border-b border-white/5 mb-2">
                                            <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Akun Terdaftar</p>
                                            <p className="text-sm font-bold text-white truncate">{user.email}</p>
                                        </div>
                                        {user.role === 'admin' ? (
                                            <Link href="/admin" className="flex items-center w-full px-4 py-2.5 text-sm text-primary hover:bg-white/5 rounded-xl transition-colors font-black uppercase tracking-tighter">
                                                <UserIcon className="h-4 w-4 mr-2" /> Admin Panel
                                            </Link>
                                        ) : user.role === 'writer' ? (
                                            <Link href="/writer" className="flex items-center w-full px-4 py-2.5 text-sm text-primary hover:bg-white/5 rounded-xl transition-colors font-black uppercase tracking-tighter">
                                                <UserIcon className="h-4 w-4 mr-2" /> Writer Dashboard
                                            </Link>
                                        ) : (
                                            <Link href="/dashboard" className="flex items-center w-full px-4 py-2.5 text-sm text-white hover:bg-white/5 rounded-xl transition-colors font-bold">
                                                <UserIcon className="h-4 w-4 mr-2" /> Dashboard
                                            </Link>
                                        )}
                                        <div className="h-px bg-white/5 my-2" />
                                        <button
                                            onClick={logout}
                                            className="flex items-center w-full px-4 py-2.5 text-sm text-red-400 hover:bg-red-500/10 rounded-xl transition-colors font-bold"
                                        >
                                            <LogOut className="h-4 w-4 mr-2" /> Keluar
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="flex items-center gap-2">
                                <Link href="/reseller" className="hidden lg:flex items-center justify-center h-10 px-6 rounded-full bg-primary text-black font-black text-xs uppercase tracking-widest hover:scale-105 transition-transform shadow-[0_0_20px_rgba(250,204,21,0.2)]">
                                    Buka Toko Sendiri!
                                </Link>
                            </div>
                        )
                    )}

                    {/* Mobile/Tablet User Avatar Placeholder */}
                    <Link href={user ? "/dashboard" : "/reseller"} className="lg:hidden flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-tr from-primary to-yellow-600 text-black font-black cursor-pointer shadow-lg active:scale-95 transition-transform">
                        {user ? user.name.charAt(0).toUpperCase() : <LogIn className="h-4 w-4" />}
                    </Link>
                </div>
            </div>

            {/* Bottom Row: Navigation Links */}
            <div className="container mx-auto px-4 max-w-7xl h-12 flex items-center gap-8 overflow-x-auto no-scrollbar border-t border-white/5 relative z-10">
                <Link href="/" className={`flex items-center gap-2 text-sm h-full px-1 shrink-0 transition-colors ${pathname === '/' || pathname.startsWith('/topup') ? 'font-bold text-primary border-b-2 border-primary' : 'font-medium text-muted-foreground hover:text-foreground'}`}>
                    <Wallet className="h-4 w-4" /> Topup
                </Link>
                <Link href="/cek-pesanan" className={`flex items-center gap-2 text-sm h-full px-1 shrink-0 transition-colors ${pathname === '/cek-pesanan' ? 'font-bold text-primary border-b-2 border-primary' : 'font-medium text-muted-foreground hover:text-foreground'}`}>
                    <SearchIcon className="h-4 w-4" /> Cek Transaksi
                </Link>
                <Link href="/leaderboard" className={`flex items-center gap-2 text-sm h-full px-1 shrink-0 transition-colors ${pathname === '/leaderboard' ? 'font-bold text-primary border-b-2 border-primary' : 'font-medium text-muted-foreground hover:text-foreground'}`}>
                    <Trophy className="h-4 w-4" /> Leaderboard
                </Link>
                <Link href="/artikel" className={`flex items-center gap-2 text-sm h-full px-1 shrink-0 transition-colors ${pathname === '/artikel' || pathname.startsWith('/artikel/') ? 'font-bold text-primary border-b-2 border-primary' : 'font-medium text-muted-foreground hover:text-foreground'}`}>
                    <FileText className="h-4 w-4" /> Artikel
                </Link>
                <Link href="/kalkulator" className={`flex items-center gap-2 text-sm h-full px-1 shrink-0 transition-colors ${pathname === '/kalkulator' ? 'font-bold text-primary border-b-2 border-primary' : 'font-medium text-muted-foreground hover:text-foreground'}`}>
                    <Calculator className="h-4 w-4" /> Kalkulator
                </Link>
            </div>
        </header>
    );
}
