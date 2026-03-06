"use client";

import Link from 'next/link';

export default function Footer() {
    return (
        <footer className="bg-background/80 backdrop-blur-md border-t border-white/5 py-12">
            <div className="container mx-auto px-4">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                    {/* Brand Section */}
                    <div className="col-span-1 md:col-span-2">
                        <h3 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent mb-4 italic">
                            SAMSTORE
                        </h3>
                        <p className="text-muted-foreground max-w-sm">
                            Platform top up game termurah, tercepat, dan teraman di Indonesia. Proses instan otomatis 24 jam nonstop setiap hari.
                        </p>
                    </div>

                    {/* Sitemaps/Links */}
                    <div>
                        <h4 className="font-semibold text-white mb-4">Informasi</h4>
                        <ul className="space-y-2 text-muted-foreground text-sm">
                            <li><Link href="/terms" className="hover:text-blue-400 transition-colors">Syarat & Ketentuan</Link></li>
                            <li><Link href="/privacy" className="hover:text-blue-400 transition-colors">Kebijakan Privasi</Link></li>
                            <li><Link href="/articles" className="hover:text-blue-400 transition-colors">Blog / Berita</Link></li>
                        </ul>
                    </div>

                    {/* Support Section */}
                    <div>
                        <h4 className="font-semibold text-white mb-4">Bantuan</h4>
                        <ul className="space-y-2 text-muted-foreground text-sm">
                            <li><Link href="/track" className="hover:text-blue-400 transition-colors">Lacak Pesanan</Link></li>
                            <li><Link href="/contact" className="hover:text-blue-400 transition-colors">Hubungi Kami</Link></li>
                            <li className="text-xs mt-4">© 2026 SamStore. All rights reserved.</li>
                        </ul>
                    </div>
                </div>
            </div>
        </footer>
    );
}
