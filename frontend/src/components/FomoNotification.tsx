'use client';

import { useEffect, useState } from 'react';
import { ShoppingBag, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface FomoData {
    id: string;
    name: string;
    product: string;
    time: string;
    type: 'real' | 'fake';
}

export default function FomoNotification() {
    const [notifications, setNotifications] = useState<FomoData[]>([]);
    const [currentNotif, setCurrentNotif] = useState<FomoData | null>(null);
    const [isVisible, setIsVisible] = useState(false);
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        setIsMounted(true);
    }, []);

    // Fetch FOMO data on mount
    useEffect(() => {
        const fetchFomo = async () => {
            try {
                const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/public/fomo-notifications`);
                if (res.ok) {
                    const data = await res.json();
                    if (Array.isArray(data) && data.length > 0) {
                        setNotifications(data);
                    }
                }
            } catch (error) {
                console.error("Failed fetching FOMO", error);
            }
        };
        fetchFomo();
    }, []);

    // Manage showing notifications one by one
    useEffect(() => {
        if (notifications.length === 0) return;

        let currentIndex = 0;
        let showTimer: NodeJS.Timeout;
        let hideTimer: NodeJS.Timeout;

        const cycleNotification = () => {
            setCurrentNotif(notifications[currentIndex]);
            setIsVisible(true);

            // Hide after 5 seconds
            hideTimer = setTimeout(() => {
                setIsVisible(false);
                currentIndex = (currentIndex + 1) % notifications.length;

                // Show next one after a gap of 10 seconds
                showTimer = setTimeout(cycleNotification, 10000);
            }, 5000);
        };

        // Initial delay before showing first notif (5 seconds)
        const initialDelay = setTimeout(cycleNotification, 5000);

        return () => {
            clearTimeout(initialDelay);
            clearTimeout(showTimer);
            clearTimeout(hideTimer);
        };
    }, [notifications]);

    if (!isMounted) return null;

    return (
        <AnimatePresence>
            {isVisible && currentNotif && (
                <motion.div
                    initial={{ x: -100, opacity: 0, scale: 0.8 }}
                    animate={{ x: 0, opacity: 1, scale: 1 }}
                    exit={{ x: -50, opacity: 0, scale: 0.9 }}
                    transition={{ type: "spring", stiffness: 200, damping: 20 }}
                    className="fixed bottom-24 left-6 z-[60] pointer-events-none"
                >
                    <div className="bg-[#1a1a1a]/90 backdrop-blur-xl border border-white/10 shadow-[0_20px_40px_rgba(0,0,0,0.5)] rounded-[1.5rem] p-4 flex items-center gap-4 min-w-[320px] pointer-events-auto relative group">
                        <button
                            onClick={() => setIsVisible(false)}
                            className="absolute top-3 right-3 text-zinc-600 hover:text-white transition-colors"
                        >
                            <X className="w-3.5 h-3.5" />
                        </button>

                        <div className="h-14 w-14 shrink-0 bg-primary/20 rounded-2xl border border-primary/30 flex items-center justify-center relative shadow-[0_0_15px_rgba(250,204,21,0.2)]">
                            <ShoppingBag className="w-7 h-7 text-primary" />
                            <span className="absolute -top-1 -right-1 flex h-4 w-4">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-4 w-4 bg-primary shadow-lg"></span>
                            </span>
                        </div>

                        <div className="pr-4">
                            <p className="text-sm font-black text-white leading-tight uppercase italic tracking-tighter">
                                {currentNotif.name} <span className="text-zinc-500 font-bold not-italic">BARU SAJA TOPUP</span>
                            </p>
                            <p className="text-xs font-black text-primary mt-1 uppercase tracking-widest">{currentNotif.product}</p>
                            <p className="text-[10px] font-bold text-zinc-600 mt-1 uppercase tracking-[0.1em]">{currentNotif.time}</p>
                        </div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
