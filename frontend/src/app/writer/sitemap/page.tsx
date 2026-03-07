'use client';

import { useState } from 'react';
import { Map, ExternalLink, Copy, Check, Info } from 'lucide-react';
import { motion } from 'framer-motion';

interface SitemapItem {
    title: string;
    id: string | null;
    url: string;
    desc: string;
}

const SITEMAPS: SitemapItem[] = [
    { id: '1', title: 'Sitemap Index', url: '/sitemap.xml', desc: 'Induk dari semua sitemap. Gunakan link ini untuk submit ke Google Search Console.' },
    { id: '2', title: 'Sitemap Pages', url: '/sitemap/0.xml', desc: 'Daftar semua halaman statis (Home, Daftar Artikel, Cek Pesanan, dll).' },
    { id: '3', title: 'Sitemap Games', url: '/sitemap/1.xml', desc: 'Daftar semua link topup game/voucher aktif.' },
    { id: '4', title: 'Sitemap Articles', url: '/sitemap/2.xml', desc: 'Daftar semua artikel blog yang sudah dipublikasikan.' },
];

export default function SitemapPage() {
    const [copied, setCopied] = useState<string | null>(null);

    const handleCopy = (url: string) => {
        const fullUrl = `${window.location.origin}${url}`;
        navigator.clipboard.writeText(fullUrl);
        setCopied(url);
        setTimeout(() => setCopied(null), 2000);
    };

    return (
        <div className="max-w-5xl mx-auto py-10 px-4">
            <div className="flex items-center gap-4 mb-10">
                <div className="p-3 bg-primary/10 rounded-2xl border border-primary/20">
                    <Map className="h-8 w-8 text-primary" />
                </div>
                <div>
                    <h1 className="text-3xl font-black text-foreground uppercase tracking-tight">SEO Sitemap</h1>
                    <p className="text-muted-foreground text-sm font-medium mt-1">Monitoring jalur rayapan (crawling) mesin pencari.</p>
                </div>
            </div>

            <div className="bg-primary/5 border border-primary/20 rounded-2xl p-6 mb-10 flex items-start gap-4">
                <Info className="h-6 w-6 text-primary shrink-0 mt-0.5" />
                <div className="space-y-1">
                    <p className="text-sm font-bold text-foreground italic uppercase tracking-wider">Apa itu XML Sitemap?</p>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                        Sitemap adalah peta jalan XML yang membantu Google Bot menemukan dan mengindeks seluruh halaman di website kita dengan lebih cepat.
                        Sistem SamStore menggunakan <b>Dynamic Indexing</b>, yang berarti file-file di bawah ini selalu diperbarui otomatis setiap kali ada artikel atau game baru.
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {SITEMAPS.map((s, i) => (
                    <motion.div
                        key={s.url}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.1 }}
                        className="bg-[#1a1a1a] border border-white/5 rounded-3xl p-8 hover:border-primary/30 transition-all group relative overflow-hidden shadow-xl"
                    >
                        <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                            <Map className="h-24 w-24 text-primary" />
                        </div>

                        <div className="relative z-10">
                            <h3 className="text-lg font-black text-foreground uppercase italic tracking-tighter mb-2">{s.title}</h3>
                            <p className="text-xs text-muted-foreground leading-relaxed mb-6 h-10">{s.desc}</p>

                            <div className="bg-black/40 rounded-xl p-3 border border-white/5 flex items-center justify-between gap-3 group-hover:bg-black/60 transition-colors">
                                <code className="text-[10px] text-primary font-mono truncate">{s.url}</code>
                                <div className="flex items-center gap-2 shrink-0">
                                    <button
                                        onClick={() => handleCopy(s.url)}
                                        className="p-2 bg-white/5 hover:bg-white/10 rounded-lg transition-colors text-zinc-400 hover:text-foreground"
                                        title="Copy URL"
                                    >
                                        {copied === s.url ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
                                    </button>
                                    <a
                                        href={s.url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="p-2 bg-white/5 hover:bg-white/10 rounded-lg transition-colors text-zinc-400 hover:text-foreground"
                                        title="Buka XML"
                                    >
                                        <ExternalLink className="h-4 w-4" />
                                    </a>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                ))}
            </div>

            <div className="mt-16 pt-10 border-t border-white/5 text-center">
                <p className="text-[10px] font-black text-zinc-600 uppercase tracking-[0.3em]">SEO SamStore &copy; 2026</p>
            </div>
        </div>
    );
}
