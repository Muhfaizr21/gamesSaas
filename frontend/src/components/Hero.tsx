'use client';

import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useState, useEffect } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';

interface Banner {
    id: number;
    image: string;
    alt: string;
    title: string;
    subtitle: string;
    tag: string;
    color: string;
}

const banners: Banner[] = [
    {
        id: 1,
        image: '',
        alt: 'Premium MLBB Topup',
        title: 'TOPUP NOW',
        subtitle: 'LEGEND WITHIN',
        tag: 'GAMES FLASH SALE',
        color: 'from-amber-400 via-yellow-600 to-amber-900'
    },
    {
        id: 2,
        image: '',
        alt: 'Genshin Impact Topup',
        title: 'TOPUP NOW',
        subtitle: 'ADVENTURE AWAITS',
        tag: 'SPECIAL PROMO',
        color: 'from-cyan-400 via-blue-500 to-indigo-900'
    },
    {
        id: 3,
        image: '',
        alt: 'Valorant Points Promo',
        title: 'TOPUP NOW',
        subtitle: 'TACTICAL SKILLS',
        tag: 'NEW ARRIVAL',
        color: 'from-rose-500 via-red-600 to-red-950'
    }
];

export default function HeroSection() {
    const [currentSlide, setCurrentSlide] = useState(0);
    const [direction, setDirection] = useState(0);

    const nextSlide = () => {
        setDirection(1);
        setCurrentSlide((prev) => (prev === banners.length - 1 ? 0 : prev + 1));
    };

    const prevSlide = () => {
        setDirection(-1);
        setCurrentSlide((prev) => (prev === 0 ? banners.length - 1 : prev - 1));
    };

    // Auto-advance slides
    useEffect(() => {
        const timer = setInterval(() => {
            nextSlide();
        }, 5000);
        return () => clearInterval(timer);
    }, []);

    const variants = {
        enter: (direction: number) => ({
            x: direction > 0 ? '100%' : '-100%',
            opacity: 0,
            scale: 1.1
        }),
        center: {
            zIndex: 1,
            x: 0,
            opacity: 1,
            scale: 1
        },
        exit: (direction: number) => ({
            zIndex: 0,
            x: direction < 0 ? '100%' : '-100%',
            opacity: 0,
            scale: 0.9
        })
    };

    return (
        <div className="w-full bg-[#121212] pt-6 pb-2">
            <div className="container mx-auto px-4 max-w-7xl">
                {/* Banner Carousel Container */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                    className="relative w-full aspect-[21/9] sm:aspect-[3/1] md:aspect-[4/1] overflow-hidden rounded-2xl md:rounded-[2.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.5)] group border border-white/5 bg-[#1a1a1a]"
                >
                    {/* Text-Based Banners with AnimatePresence */}
                    <AnimatePresence initial={false} custom={direction}>
                        <motion.div
                            key={currentSlide}
                            custom={direction}
                            variants={variants}
                            initial="enter"
                            animate="center"
                            exit="exit"
                            transition={{
                                x: { type: "spring", stiffness: 300, damping: 30 },
                                opacity: { duration: 0.4 },
                                scale: { duration: 0.6 }
                            }}
                            className="absolute inset-0 w-full h-full"
                        >
                            {/* Premium Gradient Background */}
                            <div className={`absolute inset-0 bg-gradient-to-br ${banners[currentSlide].color} opacity-40`} />

                            {/* Abstract Shapes / Patterns */}
                            <div className="absolute inset-0 overflow-hidden opacity-20">
                                <div className="absolute top-[-20%] left-[-10%] w-[70%] h-[140%] rounded-full bg-white/10 blur-[100px] rotate-12" />
                                <div className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[120%] rounded-full bg-primary/20 blur-[120px] -rotate-12" />
                            </div>

                            {/* Center "TOPUP NOW" watermark-style background text */}
                            <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none overflow-hidden">
                                <motion.h1
                                    initial={{ opacity: 0, scale: 0.8 }}
                                    animate={{ opacity: 0.05, scale: 1 }}
                                    transition={{ duration: 2, repeat: Infinity, repeatType: "reverse" }}
                                    className="text-[20vw] font-black text-white italic tracking-tighter whitespace-nowrap overflow-visible"
                                >
                                    TOPUP NOW
                                </motion.h1>
                            </div>

                            {/* Layer 3: Cinematic Overlays */}
                            {/* Film Grain / Noise Overlay */}
                            <div className="absolute inset-0 opacity-[0.05] pointer-events-none mix-blend-overlay bg-[url('https://grainy-gradients.vercel.app/noise.svg')]" />

                            {/* Dark Gradient Vignette */}
                            <div className="absolute inset-0 bg-gradient-to-r from-black via-transparent to-black/20 opacity-80" />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-60" />
                        </motion.div>
                    </AnimatePresence>

                    {/* Banner Content */}
                    <div className="absolute inset-0 flex items-center px-8 md:px-16 pointer-events-none">
                        <motion.div
                            key={currentSlide + 'text'}
                            initial={{ opacity: 0, x: -50 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.3, duration: 0.8 }}
                            className="max-w-lg"
                        >
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.5 }}
                                className="inline-block px-4 py-1.5 rounded-full bg-black/40 backdrop-blur-md border border-white/10 text-white text-[10px] font-black uppercase tracking-[0.3em] mb-4 shadow-xl"
                            >
                                <span className={`bg-gradient-to-r ${banners[currentSlide].color} bg-clip-text text-transparent`}>
                                    {banners[currentSlide].tag}
                                </span>
                            </motion.div>
                            <h2 className="text-4xl md:text-6xl font-black text-white italic leading-[0.9] uppercase tracking-tighter drop-shadow-[0_10px_30px_rgba(0,0,0,0.8)] overflow-visible">
                                <span className="inline-block pr-6">{banners[currentSlide].title}</span> <br />
                                <span className={`bg-gradient-to-r ${banners[currentSlide].color} bg-clip-text text-transparent inline-block pr-6`}>
                                    {banners[currentSlide].subtitle}
                                </span>
                            </h2>
                            <motion.p
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.7 }}
                                className="text-zinc-400 text-sm font-bold mt-4 uppercase tracking-widest hidden md:block"
                            >
                                DAPATKAN PROMO TERBATAS HANYA DI SAMSTORE
                            </motion.p>
                        </motion.div>
                    </div>

                    {/* Navigation Buttons */}
                    <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={prevSlide}
                        className="absolute left-6 top-1/2 -translate-y-1/2 h-12 w-12 flex items-center justify-center rounded-full bg-black/40 text-white backdrop-blur-xl border border-white/10 opacity-0 group-hover:opacity-100 transition-all hover:bg-primary hover:text-black hover:border-primary z-10"
                        aria-label="Previous banner"
                    >
                        <ChevronLeft className="h-6 w-6" />
                    </motion.button>

                    <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={nextSlide}
                        className="absolute right-6 top-1/2 -translate-y-1/2 h-12 w-12 flex items-center justify-center rounded-full bg-black/40 text-white backdrop-blur-xl border border-white/10 opacity-0 group-hover:opacity-100 transition-all hover:bg-primary hover:text-black hover:border-primary z-10"
                        aria-label="Next banner"
                    >
                        <ChevronRight className="h-6 w-6" />
                    </motion.button>

                    {/* Indicators */}
                    <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-3 z-10">
                        {banners.map((_, index) => (
                            <button
                                key={index}
                                onClick={() => setCurrentSlide(index)}
                                className={`h-1.5 rounded-full transition-all duration-300 ${currentSlide === index ? 'w-10 bg-primary shadow-[0_0_15px_rgba(250,204,21,0.6)]' : 'w-2 bg-white/30 hover:bg-white/60'
                                    }`}
                                aria-label={`Go to slide ${index + 1}`}
                            />
                        ))}
                    </div>
                </motion.div>
            </div>
        </div>
    );
}
