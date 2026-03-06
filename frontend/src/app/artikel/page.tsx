'use client';

import { useEffect, useState } from 'react';
import { FileText, Calendar, ChevronRight, User } from "lucide-react";
import Link from 'next/link';

interface Article {
    id: number;
    title: string;
    slug: string;
    excerpt: string;
    thumbnail: string;
    category: string;
    views: number;
    published_at: string;
    Author?: { name: string };
}

export default function ArtikelPage() {
    const [articles, setArticles] = useState<Article[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchArticles = async () => {
            try {
                const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/public/articles`);
                if (res.ok) setArticles(await res.json());
            } catch (e) {
                console.error(e);
            } finally {
                setLoading(false);
            }
        };
        fetchArticles();
    }, []);

    const featured = articles[0];
    const rest = articles.slice(1);

    return (
        <div className="min-h-screen bg-[#121212] py-12 px-4">
            <div className="container mx-auto max-w-6xl">

                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 pb-6 border-b border-[#2a2a2a] gap-4">
                    <div>
                        <div className="inline-flex items-center gap-2 mb-2 text-primary font-bold tracking-widest uppercase text-sm">
                            <FileText className="h-4 w-4" /> SamStore Blog
                        </div>
                        <h1 className="text-4xl font-black text-foreground uppercase tracking-tight">
                            Artikel & <span className="text-primary">Berita</span>
                        </h1>
                    </div>
                    <p className="text-muted-foreground max-w-sm text-sm">
                        Bocoran update game terbaru, tips bermain layaknya pro player, dan informasi promo eksklusif SamStore.
                    </p>
                </div>

                {loading ? (
                    <div className="flex justify-center py-20"><div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div></div>
                ) : articles.length === 0 ? (
                    <div className="py-20 text-center">
                        <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                        <p className="text-muted-foreground text-lg">Belum ada artikel yang dipublikasikan.</p>
                    </div>
                ) : (
                    <>
                        {/* Featured Article */}
                        {featured && (
                            <div className="mb-12">
                                <Link href={`/artikel/${featured.slug}`} className="block">
                                    <div className="bg-[#1a1a1a] rounded-3xl overflow-hidden border border-[#2a2a2a] hover:border-primary/50 transition-colors group cursor-pointer flex flex-col md:flex-row">
                                        <div className="md:w-1/2 overflow-hidden relative h-64 md:h-auto">
                                            <img
                                                src={featured.thumbnail ? (featured.thumbnail.startsWith('http') ? featured.thumbnail : `${process.env.NEXT_PUBLIC_API_URL}${featured.thumbnail}`) : `/images/fallback.png`}
                                                alt={featured.title}
                                                onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                            />
                                            <div className="absolute top-4 left-4 bg-primary text-zinc-900 font-bold px-3 py-1 rounded-full text-xs uppercase tracking-wider backdrop-blur-md">
                                                {featured.category}
                                            </div>
                                        </div>
                                        <div className="md:w-1/2 p-8 md:p-12 flex flex-col justify-center">
                                            <div className="flex items-center gap-4 text-xs text-muted-foreground mb-4">
                                                <span className="flex items-center gap-1"><Calendar className="h-3 w-3" /> {new Date(featured.published_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                                                {featured.Author && <span className="flex items-center gap-1"><User className="h-3 w-3" /> {featured.Author.name}</span>}
                                            </div>
                                            <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-4 group-hover:text-primary transition-colors">{featured.title}</h2>
                                            <p className="text-muted-foreground mb-6 line-clamp-3">{featured.excerpt}</p>
                                            <span className="inline-flex items-center text-primary font-bold hover:underline self-start">
                                                Baca Selengkapnya <ChevronRight className="h-4 w-4 ml-1" />
                                            </span>
                                        </div>
                                    </div>
                                </Link>
                            </div>
                        )}

                        {/* Grid Articles */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            {rest.map((item) => (
                                <Link href={`/artikel/${item.slug}`} key={item.id}>
                                    <div className="bg-[#1a1a1a] rounded-2xl overflow-hidden border border-[#2a2a2a] hover:-translate-y-2 hover:border-primary/50 transition-all group flex flex-col h-full">
                                        <div className="h-48 overflow-hidden relative">
                                            <img
                                                src={item.thumbnail ? (item.thumbnail.startsWith('http') ? item.thumbnail : `${process.env.NEXT_PUBLIC_API_URL}${item.thumbnail}`) : `/images/fallback.png`}
                                                alt={item.title}
                                                onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                                                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                            />
                                            <div className="absolute top-3 left-3 bg-[#121212]/80 backdrop-blur-md text-primary font-bold px-2.5 py-1 rounded border border-[#2a2a2a] text-[10px] uppercase tracking-wider">
                                                {item.category}
                                            </div>
                                        </div>
                                        <div className="p-5 flex-1 flex flex-col">
                                            <div className="flex items-center gap-2 text-[11px] text-muted-foreground mb-3">
                                                <Calendar className="h-3 w-3" /> {new Date(item.published_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                                            </div>
                                            <h3 className="font-bold text-foreground mb-2 line-clamp-2 leading-tight group-hover:text-primary transition-colors">{item.title}</h3>
                                            <p className="text-muted-foreground text-sm line-clamp-3 mb-4 flex-1">{item.excerpt}</p>
                                            <span className="text-xs font-bold text-primary flex items-center hover:underline mt-auto">
                                                Baca <ChevronRight className="h-3 w-3 ml-0.5" />
                                            </span>
                                        </div>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}
