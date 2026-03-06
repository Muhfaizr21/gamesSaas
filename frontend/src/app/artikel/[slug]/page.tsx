'use client';

import { useEffect, useState, use } from 'react';
import { useRouter } from 'next/navigation';
import { Calendar, User, Eye, ArrowLeft, Tag } from 'lucide-react';
import Link from 'next/link';

export default function ArticleDetailPage({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = use(params);
    const router = useRouter();
    const [article, setArticle] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchArticle = async () => {
            try {
                const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/public/articles/${slug}`);
                if (res.ok) {
                    setArticle(await res.json());
                } else {
                    router.push('/artikel');
                }
            } catch (e) {
                console.error(e);
            } finally {
                setLoading(false);
            }
        };
        fetchArticle();
    }, [slug, router]);

    if (loading) {
        return <div className="min-h-screen bg-background flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div></div>;
    }
    if (!article) return null;

    return (
        <>
            {/* Dynamic SEO Head */}
            <head>
                <title>{article.meta_title || article.title}</title>
                <meta name="description" content={article.meta_description || article.excerpt || ''} />
                <meta name="keywords" content={article.meta_keywords || ''} />
                {article.canonical_url && <link rel="canonical" href={article.canonical_url} />}
                <meta property="og:title" content={article.og_title || article.title} />
                <meta property="og:description" content={article.og_description || article.excerpt || ''} />
                {article.og_image && <meta property="og:image" content={article.og_image} />}
                <meta property="og:type" content="article" />
            </head>

            <div className="min-h-screen bg-[#0a0a0a]">
                {/* Hero */}
                <div className="relative h-[400px] w-full overflow-hidden">
                    <img
                        src={article.thumbnail ? (article.thumbnail.startsWith('http') ? article.thumbnail : `${process.env.NEXT_PUBLIC_API_URL}${article.thumbnail}`) : `/images/fallback.png`}
                        alt={article.title}
                        onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                        className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-[#0a0a0a]/60 to-transparent" />
                    <div className="absolute bottom-0 left-0 w-full p-8">
                        <div className="container mx-auto max-w-4xl">
                            <Link href="/artikel" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-primary transition-colors mb-4">
                                <ArrowLeft className="h-4 w-4" /> Kembali ke Artikel
                            </Link>
                            <span className="block bg-primary text-zinc-900 font-bold px-3 py-1 rounded-full text-xs w-fit uppercase tracking-wider mb-4">{article.category}</span>
                            <h1 className="text-3xl md:text-5xl font-black text-foreground leading-tight">{article.title}</h1>
                            <div className="flex items-center gap-5 mt-5 text-sm text-muted-foreground flex-wrap">
                                {article.Author && <span className="flex items-center gap-1.5"><User className="h-4 w-4" /> {article.Author.name}</span>}
                                <span className="flex items-center gap-1.5"><Calendar className="h-4 w-4" /> {new Date(article.published_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
                                <span className="flex items-center gap-1.5"><Eye className="h-4 w-4" /> {article.views} views</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Content */}
                <div className="container mx-auto max-w-4xl px-4 py-12">
                    {article.excerpt && (
                        <p className="text-lg text-muted-foreground font-medium mb-8 border-l-4 border-primary pl-4 italic">{article.excerpt}</p>
                    )}

                    <article className="prose prose-invert prose-lg max-w-none
                        prose-headings:text-foreground prose-headings:font-black
                        prose-p:text-[#ccc] prose-p:leading-relaxed
                        prose-a:text-primary prose-a:no-underline hover:prose-a:underline
                        prose-strong:text-foreground
                        prose-img:rounded-2xl prose-img:border prose-img:border-[#2a2a2a]"
                        dangerouslySetInnerHTML={{ __html: article.content }} />

                    {/* Tags */}
                    {article.tags && (
                        <div className="mt-12 pt-8 border-t border-[#2a2a2a]">
                            <div className="flex items-center gap-2 flex-wrap">
                                <Tag className="h-4 w-4 text-muted-foreground" />
                                {article.tags.split(',').map((tag: string, i: number) => (
                                    <span key={i} className="px-3 py-1 bg-[#1a1a1a] border border-[#2a2a2a] text-muted-foreground text-xs font-medium rounded-full">{tag.trim()}</span>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}
