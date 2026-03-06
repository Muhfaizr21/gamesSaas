'use client';

import { useState } from 'react';
import { MessageCircle, X } from 'lucide-react';

export default function FloatingChat() {
    const [isOpen, setIsOpen] = useState(false);
    const whatsappNumber = '6281234567890'; // Replace with real admin WA
    const greeting = encodeURIComponent('Halo Admin SamStore, saya butuh bantuan mengenai topup.');

    return (
        <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
            {/* Tooltip / Menu Popup */}
            {isOpen && (
                <div className="mb-4 bg-[#1a1a1a] border border-[#2a2a2a] rounded-2xl p-4 shadow-2xl w-64 animate-in slide-in-from-bottom-5 fade-in duration-300">
                    <div className="flex justify-between items-center mb-3 border-b border-[#333] pb-2">
                        <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                            <span className="text-white font-bold text-sm">Customer Service</span>
                        </div>
                        <button onClick={() => setIsOpen(false)} className="text-zinc-500 hover:text-white transition">
                            <X className="w-4 h-4" />
                        </button>
                    </div>
                    <p className="text-xs text-zinc-400 mb-4">
                        Halo! Ada kendala saat transaksi? Jangan ragu untuk chat admin kami. Online 24/7.
                    </p>
                    <a
                        href={`https://wa.me/${whatsappNumber}?text=${greeting}`}
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center justify-center gap-2 w-full py-2.5 bg-green-500 hover:bg-green-600 text-white text-sm font-bold rounded-xl transition-colors shadow-lg shadow-green-500/20"
                    >
                        <MessageCircle className="w-4 h-4" />
                        Chat WhatsApp
                    </a>
                </div>
            )}

            {/* Bubble Button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={`flex items-center justify-center w-14 h-14 rounded-full shadow-[0_0_20px_rgba(34,197,94,0.3)] transition-all duration-300 hover:scale-105 active:scale-95 ${isOpen ? 'bg-[#2a2a2a] text-white hover:bg-[#333]' : 'bg-green-500 text-white hover:bg-green-600'}`}
                aria-label="Live Chat"
            >
                {isOpen ? <X className="w-6 h-6" /> : <MessageCircle className="w-6 h-6" />}
            </button>
        </div>
    );
}
