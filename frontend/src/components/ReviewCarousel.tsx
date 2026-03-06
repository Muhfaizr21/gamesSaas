'use client';

import { useEffect, useState } from 'react';
import { Star, MessageSquareQuote, ChevronLeft, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function ReviewCarousel() {
    const [reviews, setReviews] = useState<any[]>([]);
    const [currentIndex, setCurrentIndex] = useState(0);

    useEffect(() => {
        const fetchReviews = async () => {
            try {
                const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/public/reviews`);
                if (!res.ok) return;
                const data = await res.json();
                if (Array.isArray(data)) setReviews(data);
            } catch (err) {
                console.error("Failed to fetch public reviews", err);
            }
        };
        fetchReviews();
    }, []);

    const nextReview = () => {
        setCurrentIndex((prev) => (prev + 1) % reviews.length);
    };

    const prevReview = () => {
        setCurrentIndex((prev) => (prev - 1 + reviews.length) % reviews.length);
    };

    if (reviews.length === 0) return null;

    return (
        <section className="py-24 bg-[#0a0a0a] relative overflow-hidden border-t border-white/5">
            {/* Background Decor */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary/5 rounded-full blur-[150px] pointer-events-none" />

            <div className="container mx-auto px-4 max-w-7xl relative z-10">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="text-center mb-16"
                >
                    <span className="text-primary font-black tracking-[0.3em] text-[10px] uppercase bg-primary/10 px-5 py-2 rounded-full inline-block mb-4 border border-primary/20 shadow-[0_0_20px_rgba(250,204,21,0.1)]">
                        Trusted by Gamers
                    </span>
                    <h2 className="text-4xl md:text-6xl font-black text-white italic tracking-tighter uppercase leading-tight">
                        SUARA <span className="text-gradient-gold">KOMUNITAS</span>
                    </h2>
                    <p className="text-zinc-500 mt-4 max-w-2xl mx-auto font-medium text-sm md:text-base">
                        Kepuasan pelanggan adalah prioritas utama kami. Berikut adalah pengalaman mereka belanja di SamStore.
                    </p>
                </motion.div>

                <div className="relative max-w-5xl mx-auto">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={currentIndex}
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            transition={{ duration: 0.5, ease: "anticipate" }}
                            className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-[3rem] p-8 md:p-16 relative shadow-2xl overflow-hidden"
                        >
                            <MessageSquareQuote className="absolute top-10 right-10 h-24 w-24 text-white/5 pointer-events-none" />

                            <div className="flex flex-col items-center text-center">
                                <div className="flex items-center gap-1 mb-8 text-primary scale-125">
                                    {[...Array(5)].map((_, i) => (
                                        <Star key={i} className={`h-5 w-5 ${i < reviews[currentIndex].rating ? 'fill-current shadow-lg' : 'text-zinc-800'}`} />
                                    ))}
                                </div>

                                <blockquote className="text-xl md:text-3xl font-bold text-white italic mb-10 leading-snug tracking-tight max-w-3xl">
                                    "{reviews[currentIndex].comment || 'Layanan luar biasa, proses sangat cepat!'}"
                                </blockquote>

                                <div className="flex flex-col items-center gap-4 border-t border-white/5 pt-8 w-full max-w-xs">
                                    <div className="h-16 w-16 rounded-full bg-gradient-to-br from-primary to-yellow-700 flex items-center justify-center font-black text-black text-xl shadow-xl border-4 border-white/5">
                                        {(reviews[currentIndex].User?.name || 'A').charAt(0).toUpperCase()}
                                    </div>
                                    <div>
                                        <p className="font-black text-white text-lg tracking-tight uppercase italic">{reviews[currentIndex].User?.name || 'Gamer Anonim'}</p>
                                        <p className="text-xs text-primary font-black uppercase tracking-widest mt-1">Pembeli {reviews[currentIndex].Product?.name || 'Voucher'}</p>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </AnimatePresence>

                    {/* Navigation Buttons */}
                    <div className="absolute top-1/2 -translate-y-1/2 -left-4 md:-left-12">
                        <motion.button
                            whileHover={{ scale: 1.1, x: -5 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={prevReview}
                            className="h-12 w-12 md:h-16 md:w-16 rounded-full bg-white/5 border border-white/10 text-white flex items-center justify-center backdrop-blur-xl hover:bg-primary hover:text-black transition-all shadow-xl"
                        >
                            <ChevronLeft className="h-6 w-6 md:h-8 md:w-8" />
                        </motion.button>
                    </div>
                    <div className="absolute top-1/2 -translate-y-1/2 -right-4 md:-right-12">
                        <motion.button
                            whileHover={{ scale: 1.1, x: 5 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={nextReview}
                            className="h-12 w-12 md:h-16 md:w-16 rounded-full bg-white/5 border border-white/10 text-white flex items-center justify-center backdrop-blur-xl hover:bg-primary hover:text-black transition-all shadow-xl"
                        >
                            <ChevronRight className="h-6 w-6 md:h-8 md:w-8" />
                        </motion.button>
                    </div>
                </div>

                {/* Progress Indicators */}
                <div className="flex justify-center gap-3 mt-12">
                    {reviews.map((_, i) => (
                        <button
                            key={i}
                            onClick={() => setCurrentIndex(i)}
                            className={`h-1.5 transition-all duration-500 rounded-full ${i === currentIndex ? 'w-12 bg-primary' : 'w-2 bg-white/10 hover:bg-white/20'}`}
                        />
                    ))}
                </div>
            </div>
        </section>
    );
}
