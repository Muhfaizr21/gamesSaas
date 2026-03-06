'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

const SkeletonCard = () => (
    <div className="flex flex-col overflow-hidden rounded-2xl border border-white/5 bg-white/5 p-0">
        <div className="aspect-square w-full bg-white/5 animate-pulse" />
        <div className="p-3 flex flex-col gap-2">
            <div className="h-4 w-3/4 bg-white/5 rounded animate-pulse" />
            <div className="h-3 w-1/2 bg-white/5 rounded animate-pulse" />
        </div>
    </div>
);

export default function GameCategories() {
    const [vouchers, setVouchers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchGames = async () => {
            try {
                const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/public/vouchers`);
                if (res.ok) {
                    const data = await res.json();
                    setVouchers(data);
                }
            } catch (error) {
                console.error("Gagal memuat game:", error);
            } finally {
                // Simulate slight delay for "wah" loading effect
                setTimeout(() => setLoading(false), 800);
            }
        };
        fetchGames();
    }, []);

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1
            }
        }
    };

    const itemVariants = {
        hidden: { y: 20, opacity: 0 },
        visible: {
            y: 0,
            opacity: 1,
            transition: {
                type: "spring" as any,
                stiffness: 260,
                damping: 20
            }
        }
    };

    return (
        <section id="vouchers" className="bg-[#121212] section-gap relative overflow-hidden">
            {/* Background Glow Decor */}
            <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[120px] pointer-events-none" />

            <div className="container mx-auto px-4 max-w-7xl relative z-10">
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    className="mb-10 flex items-end justify-between"
                >
                    <div>
                        <div className="flex items-center gap-2 mb-2">
                            <span className="h-1 w-8 bg-primary rounded-full" />
                            <span className="text-[10px] font-black text-primary uppercase tracking-[0.3em]">Top Rated</span>
                        </div>
                        <h2 className="text-3xl md:text-4xl font-black text-white flex items-center gap-3 tracking-tighter italic uppercase overflow-visible">
                            <span className="inline-block pr-2">POPULER</span>
                            <span className="text-gradient-gold inline-block pr-8">SEKARANG!</span>
                        </h2>
                        <p className="mt-2 text-sm md:text-base text-zinc-500 font-medium">Top up game favoritmu dengan proses instan dan harga termurah!</p>
                    </div>
                </motion.div>

                {loading ? (
                    <div className="max-w-4xl mx-auto">
                        <div className="grid grid-cols-2 gap-5 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4">
                            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                                <SkeletonCard key={i} />
                            ))}
                        </div>
                    </div>
                ) : (
                    <div className="max-w-4xl mx-auto">
                        <motion.div
                            variants={containerVariants}
                            initial="hidden"
                            whileInView="visible"
                            viewport={{ once: true }}
                            className="grid grid-cols-2 gap-5 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4"
                        >
                            {vouchers.map((voucher) => (
                                <motion.div key={voucher.id} variants={itemVariants}>
                                    <Link
                                        href={`/topup/${voucher.slug}`}
                                        className="group relative flex flex-col overflow-hidden rounded-[1.5rem] border border-white/5 bg-white/5 backdrop-blur-md p-0 shadow-lg transition-all duration-300 hover:border-primary/40 hover:shadow-[0_20px_40px_rgba(0,0,0,0.6),0_0_20px_rgba(250,204,21,0.1)]"
                                    >
                                        <div className="relative aspect-square w-full overflow-hidden bg-[#1a1a1a]">
                                            <img
                                                src={voucher.thumbnail ? (voucher.thumbnail.startsWith('http') ? voucher.thumbnail : `${process.env.NEXT_PUBLIC_API_URL}${voucher.thumbnail}`) : `https://ui-avatars.com/api/?name=${encodeURIComponent(voucher.name)}&background=1a1a1a&color=fff`}
                                                alt={voucher.name}
                                                referrerPolicy="no-referrer"
                                                onError={(e) => { (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${encodeURIComponent(voucher.name)}&background=1a1a1a&color=facc15&bold=true&size=200`; }}
                                                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 group-hover:rotate-1"
                                            />
                                            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-80 transition-opacity group-hover:opacity-60"></div>

                                            {/* Badge Hot */}
                                            <div className="absolute top-3 left-3 flex items-center space-x-1 rounded-full bg-primary/20 border border-primary/30 px-3 py-1 text-[9px] font-black text-primary backdrop-blur-md uppercase tracking-wider shadow-lg">
                                                <span className="w-1.5 h-1.5 bg-primary rounded-full animate-ping mr-1" />
                                                HOT ITEM
                                            </div>
                                        </div>
                                        <div className="p-4 flex flex-col bg-gradient-to-b from-transparent to-black/20">
                                            <span className="truncate text-sm font-black text-white uppercase tracking-tight group-hover:text-primary transition-colors">{voucher.name}</span>
                                            <span className="truncate text-[10px] font-bold text-zinc-500 uppercase tracking-widest mt-0.5">{voucher.Category?.name || 'Voucher'}</span>
                                        </div>

                                        {/* Hover Overlay Icon */}
                                        <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-x-2 group-hover:translate-x-0">
                                            <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center text-black shadow-lg">
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 4v16m8-8H4" />
                                                </svg>
                                            </div>
                                        </div>
                                    </Link>
                                </motion.div>
                            ))}
                        </motion.div>
                    </div>
                )}
            </div>
        </section>
    );
}
