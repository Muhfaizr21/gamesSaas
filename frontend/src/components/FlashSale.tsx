'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Tag, Timer, ArrowRight, Zap } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function FlashSale() {
    const [promos, setPromos] = useState<any[]>([]);
    const [promo, setPromo] = useState<any>(null);

    useEffect(() => {
        const fetchPromos = async () => {
            try {
                const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/public/promos/active`);
                if (!res.ok) return;
                const data = await res.json();
                if (Array.isArray(data)) {
                    const activePromos = data.filter(p => new Date(p.end_date) > new Date());
                    setPromos(activePromos);
                    if (activePromos.length > 0) {
                        setPromo(activePromos[0]);
                    }
                }
            } catch (err) {
                console.error("Failed to fetch active promos", err);
            }
        };
        fetchPromos();
    }, []);

    if (!promo) return null;

    const endDate = new Date(promo.end_date);

    return (
        <section className="py-16 bg-[#0e0e0e] border-y border-white/5 relative overflow-hidden my-12">
            {/* Animated Background Gradients */}
            <motion.div
                animate={{
                    scale: [1, 1.2, 1],
                    opacity: [0.1, 0.2, 0.1]
                }}
                transition={{ duration: 8, repeat: Infinity }}
                className="absolute top-0 right-0 w-[600px] h-[600px] bg-primary/10 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/2 pointer-events-none"
            />
            <motion.div
                animate={{
                    scale: [1, 1.3, 1],
                    opacity: [0.05, 0.1, 0.05]
                }}
                transition={{ duration: 10, repeat: Infinity, delay: 1 }}
                className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-primary/10 rounded-full blur-[100px] translate-y-1/2 -translate-x-1/4 pointer-events-none"
            />

            <div className="container mx-auto px-4 max-w-7xl relative z-10">
                <Link href={promo.target_slug ? `/topup/${promo.target_slug}` : '#vouchers'}>
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="flex flex-col lg:flex-row items-center justify-between gap-8 mb-10 glass-card p-1 lg:p-2 rounded-[2.5rem] shadow-2xl overflow-hidden border border-white/10 hover:border-primary/40 transition-all group"
                    >
                        <div className="flex flex-col md:flex-row items-center gap-6 w-full lg:w-auto p-6">
                            <motion.div
                                animate={{ rotate: [0, 10, -10, 0] }}
                                transition={{ duration: 4, repeat: Infinity }}
                                className="h-16 w-16 md:h-20 md:w-20 rounded-[1.5rem] bg-primary flex items-center justify-center shadow-[0_0_30px_rgba(250,204,21,0.5)] group-hover:scale-105 transition-transform"
                            >
                                <Zap className="h-8 w-8 md:h-10 md:w-10 text-black fill-black" />
                            </motion.div>
                            <div className="text-center md:text-left">
                                <h2 className="text-2xl md:text-4xl font-black text-white italic tracking-tighter leading-[0.9] uppercase flex flex-wrap items-center justify-center md:justify-start gap-x-4 gap-y-2 overflow-visible">
                                    <span className="inline-block pr-4">FLASH SALE</span>
                                    <span className="text-gradient-gold drop-shadow-lg inline-block pr-8">{promo.name}</span>
                                </h2>
                                <p className="text-zinc-400 text-sm md:text-base font-bold mt-1 uppercase tracking-wider">
                                    Hemat gila-gilaan hingga <span className="text-primary text-lg ml-1">-{Math.floor(promo.discount_percentage)}%</span>!
                                </p>
                            </div>
                        </div>

                        <div className="flex flex-col items-center lg:items-end w-full lg:w-auto px-8 py-6 lg:border-l border-white/5 bg-white/5 lg:bg-transparent">
                            <div className="flex items-center gap-3 mb-2">
                                <Timer className="h-4 w-4 text-red-500 animate-pulse" />
                                <p className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.3em]">Promo Berakhir Dalam</p>
                            </div>
                            <p className="text-white font-mono font-black text-lg md:text-2xl tracking-tighter shadow-sm bg-black/40 px-4 py-2 rounded-xl border border-white/5">
                                {endDate.toLocaleString('id-ID', { dateStyle: 'long', timeStyle: 'short' })}
                            </p>
                        </div>
                    </motion.div>
                </Link>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    <motion.div
                        whileHover={{ y: -5 }}
                        className="group relative"
                    >
                        <Link
                            href={promo.target_slug ? `/topup/${promo.target_slug}` : '#vouchers'}
                            className="block relative bg-[#1a1a1a] rounded-[2rem] border border-white/5 overflow-hidden transition-all shadow-2xl"
                        >
                            {/* Discount Tag */}
                            <motion.div
                                animate={{ scale: [1, 1.1, 1] }}
                                transition={{ duration: 2, repeat: Infinity }}
                                className="absolute top-6 right-6 bg-red-600 text-white text-sm font-black px-4 py-2 rounded-2xl z-20 shadow-xl border border-white/20"
                            >
                                -{Math.floor(promo.discount_percentage)}%
                            </motion.div>

                            <div className="aspect-[16/9] relative w-full overflow-hidden bg-black">
                                <img
                                    src={promo.banner_url ? (promo.banner_url.startsWith('http') ? promo.banner_url : `${process.env.NEXT_PUBLIC_API_URL}${promo.banner_url}`) : "/images/fallback.png"}
                                    alt="Flash Sale"
                                    referrerPolicy="no-referrer"
                                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000 opacity-80 group-hover:opacity-100"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-80" />

                                <div className="absolute bottom-6 left-8 right-8">
                                    <h3 className="font-black text-white text-xl md:text-3xl italic uppercase tracking-tighter mb-2 truncate">
                                        {promo.target_slug ? promo.target_slug.replace(/-/g, ' ') : 'All Games'}
                                    </h3>
                                    <motion.div
                                        whileHover={{ x: 10 }}
                                        className="flex items-center gap-2 text-xs font-black text-primary uppercase tracking-widest"
                                    >
                                        Sikat Sekarang <ArrowRight className="h-4 w-4" />
                                    </motion.div>
                                </div>
                            </div>
                        </Link>

                        {/* Glow effect behind the card */}
                        <div className="absolute -inset-1 bg-gradient-to-r from-primary/20 to-transparent rounded-[2rem] blur-2xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
                    </motion.div>
                </div>
            </div>
        </section>
    );
}
