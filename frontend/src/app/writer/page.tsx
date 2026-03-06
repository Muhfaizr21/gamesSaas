'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter, useSearchParams } from 'next/navigation';
import { FileText, Plus, Edit, Trash2, Send, Save, Search, ChevronDown, ChevronUp, Eye, CircleDot, AlertCircle, CheckCircle2, XCircle, Bold, Italic, Heading1, Heading2, List, ListOrdered, Undo, Redo, Quote, Code, Upload, X } from 'lucide-react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';

interface Article {
    id: number; title: string; slug: string; excerpt: string; content: string;
    thumbnail: string; category: string; tags: string;
    meta_title: string; meta_description: string; meta_keywords: string;
    canonical_url: string; og_title: string; og_description: string; og_image: string;
    status: 'draft' | 'published' | 'archived'; views: number;
    published_at: string | null; createdAt: string;
}
type FormType = {
    id: number; title: string; content: string; excerpt: string; thumbnail: string;
    category: string; tags: string; focus_keyphrase: string;
    meta_title: string; meta_description: string; meta_keywords: string;
    canonical_url: string; og_title: string; og_description: string; og_image: string;
    status: 'draft' | 'published' | 'archived';
};

const CATEGORIES = ['Tips & Trick', 'News', 'Promo', 'Panduan', 'Review', 'Update'];

// ========== Helper to strip HTML for SEO analysis ==========
function stripHtml(html: string) {
    if (typeof window === 'undefined') return html;
    const tmp = document.createElement("DIV");
    tmp.innerHTML = html;
    return tmp.textContent || tmp.innerText || "";
}

// ========== Yoast-style SEO Analysis ==========
function analyzeSEO(form: FormType) {
    const checks: { label: string; status: 'good' | 'ok' | 'bad' }[] = [];
    const kp = form.focus_keyphrase.toLowerCase();
    const title = form.meta_title || form.title;
    const desc = form.meta_description || form.excerpt;
    const plainContent = stripHtml(form.content).toLowerCase();

    // Focus keyphrase
    if (!kp) { checks.push({ label: 'Focus keyphrase belum diisi', status: 'bad' }); }
    else { checks.push({ label: 'Focus keyphrase sudah diisi', status: 'good' }); }

    // Keyphrase in SEO title
    if (kp && title.toLowerCase().includes(kp)) { checks.push({ label: 'Keyphrase muncul di SEO title', status: 'good' }); }
    else if (kp) { checks.push({ label: 'Keyphrase tidak ada di SEO title', status: 'bad' }); }

    // Keyphrase in meta description
    if (kp && desc.toLowerCase().includes(kp)) { checks.push({ label: 'Keyphrase muncul di meta description', status: 'good' }); }
    else if (kp) { checks.push({ label: 'Keyphrase tidak ada di meta description', status: 'ok' }); }

    // Keyphrase in content
    if (kp && plainContent.includes(kp)) { checks.push({ label: 'Keyphrase ditemukan di konten', status: 'good' }); }
    else if (kp) { checks.push({ label: 'Keyphrase tidak ditemukan di konten', status: 'bad' }); }

    // SEO Title length
    if (title.length >= 30 && title.length <= 70) { checks.push({ label: `Panjang SEO title bagus (${title.length}/70)`, status: 'good' }); }
    else if (title.length > 0 && title.length < 30) { checks.push({ label: `SEO title terlalu pendek (${title.length}/70)`, status: 'ok' }); }
    else if (title.length > 70) { checks.push({ label: `SEO title terlalu panjang (${title.length}/70)`, status: 'bad' }); }
    else { checks.push({ label: 'SEO title belum diisi', status: 'bad' }); }

    // Meta description length
    if (desc.length >= 120 && desc.length <= 160) { checks.push({ label: `Meta description ideal (${desc.length}/160)`, status: 'good' }); }
    else if (desc.length > 0 && desc.length < 120) { checks.push({ label: `Meta description bisa lebih panjang (${desc.length}/160)`, status: 'ok' }); }
    else if (desc.length > 160) { checks.push({ label: `Meta description terlalu panjang (${desc.length}/160)`, status: 'bad' }); }
    else { checks.push({ label: 'Meta description belum diisi', status: 'bad' }); }

    // Content length
    const wordCount = plainContent.trim().split(/\s+/).filter(Boolean).length;
    if (wordCount >= 300) { checks.push({ label: `Konten cukup panjang (${wordCount} kata)`, status: 'good' }); }
    else if (wordCount >= 100) { checks.push({ label: `Konten cukup (${wordCount} kata), disarankan 300+`, status: 'ok' }); }
    else { checks.push({ label: `Konten terlalu pendek (${wordCount} kata), minimal 300`, status: 'bad' }); }

    // Image
    if (form.thumbnail) { checks.push({ label: 'Featured image sudah diisi', status: 'good' }); }
    else { checks.push({ label: 'Featured image belum diisi', status: 'ok' }); }

    // Score
    const good = checks.filter(c => c.status === 'good').length;
    const total = checks.length;
    const score = Math.round((good / total) * 100);
    const overall: 'good' | 'ok' | 'bad' = score >= 70 ? 'good' : score >= 40 ? 'ok' : 'bad';

    return { checks, score, overall };
}

function SeoIcon({ status }: { status: 'good' | 'ok' | 'bad' }) {
    if (status === 'good') return <CheckCircle2 className="h-4 w-4 text-green-500 shrink-0" />;
    if (status === 'ok') return <AlertCircle className="h-4 w-4 text-orange-400 shrink-0" />;
    return <XCircle className="h-4 w-4 text-red-500 shrink-0" />;
}

function ScoreBadge({ score, overall }: { score: number; overall: 'good' | 'ok' | 'bad' }) {
    const color = overall === 'good' ? 'bg-green-500' : overall === 'ok' ? 'bg-orange-400' : 'bg-red-500';
    return (
        <div className="flex items-center gap-2">
            <div className={`w-3 h-3 rounded-full ${color}`} />
            <span className="text-sm font-bold text-foreground">{score}/100</span>
        </div>
    );
}

// ========== Toolbar Component for TipTap ==========
const MenuBar = ({ editor }: { editor: any }) => {
    if (!editor) return null;

    const items = [
        { icon: <Bold className="h-4 w-4" />, title: 'Bold', action: () => editor.chain().focus().toggleBold().run(), isActive: () => editor.isActive('bold') },
        { icon: <Italic className="h-4 w-4" />, title: 'Italic', action: () => editor.chain().focus().toggleItalic().run(), isActive: () => editor.isActive('italic') },
        { type: 'divider' },
        { icon: <Heading1 className="h-4 w-4" />, title: 'Heading 1', action: () => editor.chain().focus().toggleHeading({ level: 1 }).run(), isActive: () => editor.isActive('heading', { level: 1 }) },
        { icon: <Heading2 className="h-4 w-4" />, title: 'Heading 2', action: () => editor.chain().focus().toggleHeading({ level: 2 }).run(), isActive: () => editor.isActive('heading', { level: 2 }) },
        { type: 'divider' },
        { icon: <List className="h-4 w-4" />, title: 'Bullet List', action: () => editor.chain().focus().toggleBulletList().run(), isActive: () => editor.isActive('bulletList') },
        { icon: <ListOrdered className="h-4 w-4" />, title: 'Ordered List', action: () => editor.chain().focus().toggleOrderedList().run(), isActive: () => editor.isActive('orderedList') },
        { type: 'divider' },
        { icon: <Quote className="h-4 w-4" />, title: 'Blockquote', action: () => editor.chain().focus().toggleBlockquote().run(), isActive: () => editor.isActive('blockquote') },
        { icon: <Code className="h-4 w-4" />, title: 'Code Block', action: () => editor.chain().focus().toggleCodeBlock().run(), isActive: () => editor.isActive('codeBlock') },
        { type: 'divider' },
        { icon: <Undo className="h-4 w-4" />, title: 'Undo', action: () => editor.chain().focus().undo().run() },
        { icon: <Redo className="h-4 w-4" />, title: 'Redo', action: () => editor.chain().focus().redo().run() },
    ];

    return (
        <div className="flex flex-wrap items-center gap-1 p-2 bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg mb-4 sticky top-0 z-10 shadow-sm">
            {items.map((item: any, index: number) => (
                item.type === 'divider' ? (
                    <div key={index} className="w-[1px] h-6 bg-[#2a2a2a] mx-1" />
                ) : (
                    <button
                        key={index}
                        type="button"
                        onClick={(e) => {
                            e.preventDefault();
                            item.action?.();
                        }}
                        title={item.title}
                        className={`p-2 rounded hover:bg-[#2a2a2a] transition-colors ${item.isActive && item.isActive() ? 'text-primary bg-primary/10' : 'text-muted-foreground'}`}
                    >
                        {item.icon}
                    </button>
                )
            ))}
        </div>
    );
};

export default function WriterDashboard() {
    const { token, user } = useAuth();
    const router = useRouter();
    const searchParams = useSearchParams();
    const [articles, setArticles] = useState<Article[]>([]);
    const [loading, setLoading] = useState(true);
    const [isEditing, setIsEditing] = useState(false);
    const [seoTab, setSeoTab] = useState<'seo' | 'social'>('seo');
    const [isUploading, setIsUploading] = useState(false);

    const emptyForm: FormType = {
        id: 0, title: '', content: '', excerpt: '', thumbnail: '',
        category: 'Tips & Trick', tags: '', focus_keyphrase: '',
        meta_title: '', meta_description: '', meta_keywords: '',
        canonical_url: '', og_title: '', og_description: '', og_image: '',
        status: 'draft'
    };
    const [form, setForm] = useState<FormType>(emptyForm);

    const handleUploadThumbnail = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file || !token) return;

        setIsUploading(true);
        const uploadData = new FormData();
        uploadData.append('image', file);

        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/writer/upload/article`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` },
                body: uploadData
            });
            const data = await res.json();
            if (res.ok) {
                setForm(prev => ({ ...prev, thumbnail: data.fileUrl }));
            } else {
                alert(data.message || 'Gagal upload thumbnail');
            }
        } catch (error) {
            console.error("Upload Error:", error);
            alert("Terjadi kesalahan saat upload thumbnail");
        } finally {
            setIsUploading(false);
        }
    };

    const editor = useEditor({
        extensions: [StarterKit],
        content: '',
        immediatelyRender: false,
        onUpdate: ({ editor }) => {
            setForm(prev => ({ ...prev, content: editor.getHTML() }));
        },
        editorProps: {
            attributes: {
                class: 'tiptap prose prose-invert prose-sm sm:prose-base lg:prose-lg xl:prose-2xl focus:outline-none min-h-[500px] w-full max-w-none text-foreground leading-relaxed',
            },
        },
    });

    useEffect(() => {
        if (editor && isEditing && form.id && editor.getHTML() !== form.content) {
            editor.commands.setContent(form.content);
        } else if (editor && isEditing && !form.id && editor.isEmpty) {
            editor.commands.setContent('');
        }
    }, [isEditing, form.id, editor]);

    useEffect(() => {
        if (user && user.role !== 'writer' && user.role !== 'admin') { router.push('/'); return; }
        fetchArticles();
    }, [token, user, router]);

    useEffect(() => {
        const action = searchParams?.get('action');
        if (action === 'new') {
            startCreate();
        } else if (!action) {
            setIsEditing(false);
        }
    }, [searchParams]);

    const fetchArticles = async () => {
        if (!token) return;
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/writer/my-articles`, { headers: { 'Authorization': `Bearer ${token}` } });
            if (res.ok) setArticles(await res.json());
        } catch (e) { console.error(e); }
        finally { setLoading(false); }
    };

    const handleSave = async (publishStatus?: string) => {
        if (!form.title.trim()) return alert('Judul artikel wajib diisi!');
        if (!form.content.trim()) return alert('Konten artikel wajib diisi!');

        const method = form.id ? 'PUT' : 'POST';
        const url = form.id ? `${process.env.NEXT_PUBLIC_API_URL}/api/writer/${form.id}` : `${process.env.NEXT_PUBLIC_API_URL}/api/writer/`;
        const payload = { ...form, status: publishStatus || form.status };

        try {
            const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` }, body: JSON.stringify(payload) });
            const result = await res.json();
            if (res.ok && result.success) {
                setIsEditing(false); setForm(emptyForm); fetchArticles();
                alert(publishStatus === 'published' ? 'Artikel berhasil dipublish! 🎉' : 'Draft tersimpan.');
            } else { alert(`Gagal: ${result.message}`); }
        } catch (e) { alert('Error jaringan'); }
    };

    const handleDelete = async (id: number) => {
        if (!confirm('Hapus artikel ini?')) return;
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/writer/${id}`, { method: 'DELETE', headers: { 'Authorization': `Bearer ${token}` } });
            if (res.ok) fetchArticles();
        } catch (e) { console.error(e); }
    };

    const startEdit = (a: Article) => {
        setForm({ id: a.id, title: a.title, content: a.content, excerpt: a.excerpt || '', thumbnail: a.thumbnail || '', category: a.category || 'Tips & Trick', tags: a.tags || '', focus_keyphrase: '', meta_title: a.meta_title || '', meta_description: a.meta_description || '', meta_keywords: a.meta_keywords || '', canonical_url: a.canonical_url || '', og_title: a.og_title || '', og_description: a.og_description || '', og_image: a.og_image || '', status: a.status as FormType['status'] });
        setIsEditing(true);
    };
    const startCreate = () => { setForm(emptyForm); setIsEditing(true); };

    if (loading) return <div className="flex items-center justify-center h-full"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" /></div>;

    const seo = analyzeSEO(form);

    // ==================== WORDPRESS-STYLE EDITOR ====================
    if (isEditing) {
        return (
            <div className="max-w-[1400px] mx-auto pb-20">
                {/* Header Toolbar - Compact & Sleek */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-10 pb-6 border-b border-white/5 sticky top-0 bg-background/80 backdrop-blur-md z-30 pt-4">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => setIsEditing(false)}
                            className="p-2 rounded-full hover:bg-white/5 text-muted-foreground hover:text-primary transition-all"
                            title="Kembali"
                        >
                            <X className="h-6 w-6" />
                        </button>
                        <div>
                            <p className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em]">Editor Artikel</p>
                            <h2 className="text-sm font-bold text-foreground">
                                {form.id ? 'Edit Artikel' : 'Tulis Artikel Baru'}
                                {form.status === 'draft' && <span className="ml-2 px-2 py-0.5 rounded bg-yellow-500/10 text-yellow-500 text-[10px] uppercase">Draft</span>}
                            </h2>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => handleSave('draft')}
                            className="flex items-center gap-2 px-5 py-2.5 bg-white/5 border border-white/10 text-foreground text-sm font-bold rounded-xl hover:bg-white/10 transition-all active:scale-95"
                        >
                            <Save className="h-4 w-4" />
                            <span>Simpan Draft</span>
                        </button>
                        <button
                            onClick={() => handleSave('published')}
                            className="flex items-center gap-2 px-6 py-2.5 bg-primary text-primary-foreground text-sm font-black rounded-xl hover:bg-yellow-500 transition-all shadow-lg shadow-primary/20 active:scale-95 group"
                        >
                            <Send className="h-4 w-4 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                            <span>Publish Sekarang</span>
                        </button>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-8 items-start">

                    {/* ===== MAIN CONTENT AREA (Kiri) ===== */}
                    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        {/* Title Input - Focus Mode */}
                        <div className="group">
                            <input
                                type="text"
                                value={form.title}
                                onChange={(e) => setForm({ ...form, title: e.target.value })}
                                placeholder="Masukkan Judul Artikel Di Sini..."
                                className="w-full bg-transparent border-none text-4xl lg:text-5xl font-black text-foreground placeholder:text-zinc-800 focus:outline-none py-4 transition-all"
                            />
                            <div className="h-0.5 w-0 group-focus-within:w-full bg-primary transition-all duration-700" />
                        </div>

                        {/* TipTap Editor Container */}
                        <div className="relative">
                            <MenuBar editor={editor} />
                            <div className="bg-[#1a1a1a]/30 border border-white/5 rounded-2xl min-h-[600px] p-8 lg:p-12 hover:border-white/10 transition-colors">
                                <EditorContent editor={editor} />
                            </div>
                        </div>

                        {/* ===== YOAST SEO PANEL (Bawah) ===== */}
                        <div className="bg-[#121212] border border-[#2a2a2a] rounded-2xl overflow-hidden shadow-2xl">
                            <div className="px-6 py-4 bg-[#1a1a1a] border-b border-[#2a2a2a] flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-yellow-500/10 rounded-lg">
                                        <Search className="h-4 w-4 text-primary" />
                                    </div>
                                    <h3 className="text-sm font-black uppercase tracking-wider text-muted-foreground">SEO Optimization (Yoast Style)</h3>
                                </div>
                                <ScoreBadge score={seo.score} overall={seo.overall} />
                            </div>

                            <div className="flex border-b border-[#2a2a2a]">
                                <button onClick={() => setSeoTab('seo')} className={`flex-1 py-4 text-xs font-black uppercase tracking-widest transition-all ${seoTab === 'seo' ? 'text-primary bg-primary/5 border-b-2 border-primary' : 'text-zinc-500 hover:text-foreground'}`}>Google Search</button>
                                <button onClick={() => setSeoTab('social')} className={`flex-1 py-4 text-xs font-black uppercase tracking-widest transition-all ${seoTab === 'social' ? 'text-primary bg-primary/5 border-b-2 border-primary' : 'text-zinc-500 hover:text-foreground'}`}>Social Media</button>
                            </div>

                            <div className="p-8">
                                {seoTab === 'seo' ? (
                                    <div className="space-y-8">
                                        {/* Focus Keyphrase */}
                                        <div className="grid grid-cols-1 md:grid-cols-[200px_1fr] gap-4 items-center">
                                            <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Focus Keyphrase</label>
                                            <input type="text" value={form.focus_keyphrase}
                                                onChange={(e) => setForm({ ...form, focus_keyphrase: e.target.value })}
                                                placeholder="Keyword utama yang ingin diranking..."
                                                className="w-full bg-black/40 border border-[#333] rounded-xl py-3 px-4 text-foreground text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all" />
                                        </div>

                                        {/* Google Preview */}
                                        <div className="space-y-3">
                                            <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-2">
                                                <span>Google Search Preview</span>
                                                <div className="h-px flex-1 bg-white/5" />
                                            </label>
                                            <div className="p-6 bg-black/40 rounded-2xl border border-white/5 shadow-inner">
                                                <p className="text-[13px] text-zinc-500 mb-1">samstore.id › artikel › {form.title ? form.title.toLowerCase().replace(/\s+/g, '-').substring(0, 40) : '...'}</p>
                                                <p className="text-[#8ab4f8] text-xl font-medium mt-0.5 truncate group-hover:underline cursor-pointer">{form.meta_title || form.title || 'Judul halaman'}</p>
                                                <p className="text-zinc-400 text-sm mt-2 line-clamp-2 leading-relaxed">{form.meta_description || form.excerpt || 'Tambahkan meta description untuk meningkatkan CTR dari hasil pencarian.'}</p>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-10">
                                            {/* SEO Title Input */}
                                            <div className="space-y-4">
                                                <label className="flex items-center justify-between text-xs font-bold text-muted-foreground uppercase tracking-wider">
                                                    <span>SEO Title</span>
                                                    <span className={`text-[10px] px-2 py-0.5 rounded ${(form.meta_title || form.title).length > 70 ? 'bg-red-500/10 text-red-500' : (form.meta_title || form.title).length >= 30 ? 'bg-green-500/10 text-green-500' : 'bg-orange-500/10 text-orange-400'}`}>{(form.meta_title || form.title).length}/70</span>
                                                </label>
                                                <input type="text" maxLength={70} value={form.meta_title}
                                                    onChange={(e) => setForm({ ...form, meta_title: e.target.value })}
                                                    placeholder={form.title || 'SEO title'}
                                                    className="w-full bg-black/40 border border-[#333] rounded-xl py-3 px-4 text-foreground text-sm focus:border-primary transition-all" />
                                            </div>

                                            {/* Meta Description Input */}
                                            <div className="space-y-4">
                                                <label className="flex items-center justify-between text-xs font-bold text-muted-foreground uppercase tracking-wider">
                                                    <span>Meta Description</span>
                                                    <span className={`text-[10px] px-2 py-0.5 rounded ${(form.meta_description || form.excerpt).length > 160 ? 'bg-red-500/10 text-red-500' : (form.meta_description || form.excerpt).length >= 120 ? 'bg-green-500/10 text-green-500' : 'bg-orange-500/10 text-orange-400'}`}>{(form.meta_description || form.excerpt).length}/160</span>
                                                </label>
                                                <textarea rows={2} maxLength={160} value={form.meta_description}
                                                    onChange={(e) => setForm({ ...form, meta_description: e.target.value })}
                                                    placeholder={form.excerpt || 'Deskripsi menarik...'}
                                                    className="w-full bg-black/40 border border-[#333] rounded-xl py-3 px-4 text-foreground text-sm focus:border-primary transition-all resize-none" />
                                            </div>
                                        </div>

                                        {/* Content Analysis */}
                                        <div className="bg-white/5 rounded-2xl p-6">
                                            <label className="block text-xs font-black text-muted-foreground uppercase tracking-[0.2em] mb-4">Content Checklist</label>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                {seo.checks.map((c, i) => (
                                                    <div key={i} className="flex items-center gap-3 p-3 bg-black/20 rounded-xl border border-white/5 transition-all hover:border-white/10 group">
                                                        <SeoIcon status={c.status} />
                                                        <span className="text-xs font-medium text-zinc-400 group-hover:text-zinc-200 transition-colors">{c.label}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="space-y-6">
                                        <div className="p-4 bg-primary/5 border border-primary/10 rounded-xl flex items-start gap-3">
                                            <Eye className="h-5 w-5 text-primary shrink-0" />
                                            <p className="text-xs text-zinc-400 leading-relaxed">Pratinjau tampilan artikel saat dibagikan ke platform Facebook, Twitter, atau WhatsApp. Mengatur Open Graph akan meningkatkan engagement klik.</p>
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-[1.5fr_1fr] gap-8">
                                            <div className="space-y-6">
                                                <div>
                                                    <label className="block text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-2">OG Title</label>
                                                    <input type="text" value={form.og_title}
                                                        onChange={(e) => setForm({ ...form, og_title: e.target.value })}
                                                        placeholder={form.title || 'Judul social media'}
                                                        className="w-full bg-black/40 border border-[#333] rounded-xl py-3 px-4 text-sm focus:border-primary" />
                                                </div>
                                                <div>
                                                    <label className="block text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-2">OG Description</label>
                                                    <textarea rows={3} value={form.og_description}
                                                        onChange={(e) => setForm({ ...form, og_description: e.target.value })}
                                                        placeholder={form.excerpt || 'Deskripsi social media'}
                                                        className="w-full bg-black/40 border border-[#333] rounded-xl py-3 px-4 text-sm focus:border-primary resize-none" />
                                                </div>
                                            </div>
                                            <div className="space-y-4">
                                                <label className="block text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-2">Social Preview Card</label>
                                                <div className="bg-black/60 rounded-2xl border border-white/10 overflow-hidden shadow-2xl group cursor-help">
                                                    <div className="aspect-video bg-[#1a1a1a] flex items-center justify-center relative overflow-hidden">
                                                        {form.og_image || form.thumbnail ? (
                                                            <img src={form.og_image || (form.thumbnail.startsWith('http') ? form.thumbnail : `${process.env.NEXT_PUBLIC_API_URL}${form.thumbnail}`)} alt="OG" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                                                        ) : (
                                                            <FileText className="h-10 w-10 text-zinc-700" />
                                                        )}
                                                        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent p-4 opacity-0 group-hover:opacity-100 transition-opacity">
                                                            <p className="text-[10px] text-white/60">samstore.id</p>
                                                        </div>
                                                    </div>
                                                    <div className="p-4 border-t border-white/5">
                                                        <p className="text-xs text-primary font-bold mb-1">SAMSTORE ARTIKEL</p>
                                                        <p className="text-sm font-black text-foreground truncate">{form.og_title || form.title || 'Un-titled Article'}</p>
                                                        <p className="text-xs text-zinc-500 mt-1 line-clamp-1">{form.og_description || form.excerpt || 'Click to read more...'}</p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* ===== SIDEBAR CONTROLS (Kanan) ===== */}
                    <div className="space-y-6 lg:sticky lg:top-32 animate-in fade-in slide-in-from-right-4 duration-500 delay-200">

                        {/* Publish Box (Gutenberg Style) */}
                        <div className="bg-[#121212] border border-[#2a2a2a] rounded-2xl overflow-hidden shadow-xl">
                            <div className="px-5 py-4 bg-[#1a1a1a] border-b border-[#2a2a2a] flex items-center gap-3">
                                <Send className="h-4 w-4 text-primary" />
                                <h3 className="text-xs font-black uppercase tracking-widest text-foreground">Publishing</h3>
                            </div>
                            <div className="p-6 space-y-4">
                                <div className="flex items-center justify-between text-sm py-2 px-3 rounded-lg bg-green-500/5 border border-green-500/10">
                                    <span className="text-zinc-500">Visibility:</span>
                                    <span className="font-bold text-green-500 flex items-center gap-1.5">
                                        < Eye className="h-3 w-3" /> Publik
                                    </span>
                                </div>
                                <div className="flex items-center justify-between text-sm py-2 px-3 rounded-lg bg-white/5 border border-white/5">
                                    <span className="text-zinc-500">Format:</span>
                                    <span className="font-bold text-zinc-300">Standard Post</span>
                                </div>
                                <div className="flex items-center justify-between text-sm py-2 px-3 rounded-lg bg-white/5 border border-white/5">
                                    <span className="text-zinc-500">Readability:</span>
                                    <div className={`w-3 h-3 rounded-full ${seo.score >= 70 ? 'bg-green-500' : 'bg-orange-500'}`} />
                                </div>
                                <div className="pt-2">
                                    <button
                                        onClick={() => handleSave('published')}
                                        className="w-full py-3 bg-primary text-black font-black text-sm rounded-xl hover:shadow-[0_0_20px_rgba(250,204,21,0.3)] transition-all active:scale-95"
                                    >
                                        Update & Publish
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Featured Image Box */}
                        <div className="bg-[#121212] border border-[#2a2a2a] rounded-2xl overflow-hidden shadow-xl">
                            <div className="px-5 py-4 bg-[#1a1a1a] border-b border-[#2a2a2a] flex items-center gap-3">
                                <Upload className="h-4 w-4 text-primary" />
                                <h3 className="text-xs font-black uppercase tracking-widest text-foreground">Featured Image</h3>
                            </div>
                            <div className="p-0">
                                {form.thumbnail ? (
                                    <div className="relative group aspect-[16/10]">
                                        <img
                                            src={form.thumbnail.startsWith('http') ? form.thumbnail : `${process.env.NEXT_PUBLIC_API_URL}${form.thumbnail}`}
                                            alt="Preview"
                                            className="w-full h-full object-cover transition-all"
                                        />
                                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2">
                                            <button
                                                onClick={() => setForm(prev => ({ ...prev, thumbnail: '' }))}
                                                className="bg-red-500 text-white p-3 rounded-full hover:scale-110 transition-transform shadow-xl"
                                                title="Hapus Gambar"
                                            >
                                                <X className="h-5 w-5" />
                                            </button>
                                            <p className="text-[10px] font-bold text-white uppercase tracking-widest">Ganti Gambar</p>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="p-6">
                                        <div className="w-full aspect-video bg-black/40 border-2 border-dashed border-[#333] rounded-2xl flex flex-col items-center justify-center text-center p-4 hover:border-primary/50 transition-colors cursor-pointer group">
                                            <Upload className="h-8 w-8 text-zinc-600 mb-3 group-hover:text-primary transition-colors" />
                                            <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Klik Untuk Upload</p>
                                            <input
                                                type="file"
                                                className="absolute inset-0 opacity-0 cursor-pointer"
                                                onChange={handleUploadThumbnail}
                                            />
                                        </div>
                                    </div>
                                )}
                                <div className="px-6 pb-6 pt-2">
                                    <input
                                        type="url"
                                        value={form.thumbnail}
                                        onChange={(e) => setForm({ ...form, thumbnail: e.target.value })}
                                        placeholder="Pake URL Gambar Luar..."
                                        className="w-full bg-black/40 border border-[#333] rounded-xl py-2 px-3 text-[10px] focus:border-primary transition-all text-zinc-500"
                                    />
                                    {isUploading && <p className="text-[10px] text-primary mt-2 flex items-center gap-2 font-black uppercase"><CircleDot className="h-2 w-2 animate-pulse" /> Mengunggah...</p>}
                                </div>
                            </div>
                        </div>

                        {/* Category Box */}
                        <div className="bg-[#121212] border border-[#2a2a2a] rounded-2xl overflow-hidden shadow-xl">
                            <div className="px-5 py-4 bg-[#1a1a1a] border-b border-[#2a2a2a]">
                                <h3 className="text-xs font-black uppercase tracking-widest text-foreground">Categories</h3>
                            </div>
                            <div className="p-4 grid grid-cols-2 gap-2">
                                {CATEGORIES.map(c => (
                                    <label key={c} className={`flex items-center justify-center py-2.5 px-3 rounded-xl border text-[10px] font-black uppercase tracking-tighter cursor-pointer transition-all ${form.category === c ? 'bg-primary border-primary text-black shadow-lg shadow-primary/20 scale-[1.02]' : 'bg-black/20 border-white/5 text-zinc-500 hover:text-white hover:border-white/10'}`}>
                                        <input type="radio" name="category" value={c} checked={form.category === c}
                                            onChange={() => setForm({ ...form, category: c })}
                                            className="hidden" />
                                        <span>{c}</span>
                                    </label>
                                ))}
                            </div>
                        </div>

                        {/* Tags Box */}
                        <div className="bg-[#121212] border border-[#2a2a2a] rounded-2xl overflow-hidden shadow-xl">
                            <div className="px-5 py-4 bg-[#1a1a1a] border-b border-[#2a2a2a]">
                                <h3 className="text-xs font-black uppercase tracking-widest text-foreground">Tags Konten</h3>
                            </div>
                            <div className="p-6 space-y-4">
                                <input type="text" value={form.tags}
                                    onChange={(e) => setForm({ ...form, tags: e.target.value })}
                                    placeholder="tips, guide, update..."
                                    className="w-full bg-black/40 border border-[#333] rounded-xl py-3 px-4 text-xs focus:border-primary transition-all shadow-inner" />
                                {form.tags && (
                                    <div className="flex flex-wrap gap-2">
                                        {form.tags.split(',').filter(Boolean).map((tag, i) => (
                                            <span key={i} className="px-3 py-1.5 bg-primary/10 text-primary text-[10px] font-black uppercase rounded-lg border border-primary/20 flex items-center gap-1.5">
                                                #{tag.trim()}
                                            </span>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Excerpt Box */}
                        <div className="bg-[#121212] border border-[#2a2a2a] rounded-2xl overflow-hidden shadow-xl">
                            <div className="px-5 py-4 bg-[#1a1a1a] border-b border-[#2a2a2a]">
                                <h3 className="text-xs font-black uppercase tracking-widest text-foreground">Excerpt (Ringkasan)</h3>
                            </div>
                            <div className="p-6">
                                <textarea rows={4} value={form.excerpt}
                                    onChange={(e) => setForm({ ...form, excerpt: e.target.value })}
                                    placeholder="Tulis ringkasan singkat artikel..."
                                    className="w-full bg-black/40 border border-[#333] rounded-xl py-3 px-4 text-xs focus:border-primary transition-all resize-none italic text-zinc-400" />
                                <p className="text-[10px] text-zinc-600 mt-2 font-medium italic">*Muncul di kartu artikel halaman depan.</p>
                            </div>
                        </div>

                    </div>
                </div>
            </div>
        );
    }

    // ==================== ARTICLE LIST ====================
    return (
        <div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-3xl font-black text-foreground">Artikel <span className="text-primary">Saya</span></h1>
                    <p className="text-sm text-muted-foreground mt-1">Kelola artikel dan konten blog SamStore</p>
                </div>
                <button onClick={startCreate} className="flex items-center gap-2 px-5 py-2.5 bg-primary text-primary-foreground font-bold rounded-xl hover:bg-yellow-500 transition-colors shadow-lg shadow-primary/20">
                    <Plus className="h-5 w-5" /> Tulis Artikel Baru
                </button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4 mb-8">
                <div className="bg-[#121212] border border-[#2a2a2a] rounded-xl p-4 text-center">
                    <p className="text-2xl font-black text-foreground">{articles.length}</p>
                    <p className="text-xs text-muted-foreground">Total</p>
                </div>
                <div className="bg-[#121212] border border-[#2a2a2a] rounded-xl p-4 text-center">
                    <p className="text-2xl font-black text-green-500">{articles.filter(a => a.status === 'published').length}</p>
                    <p className="text-xs text-muted-foreground">Published</p>
                </div>
                <div className="bg-[#121212] border border-[#2a2a2a] rounded-xl p-4 text-center">
                    <p className="text-2xl font-black text-yellow-500">{articles.filter(a => a.status === 'draft').length}</p>
                    <p className="text-xs text-muted-foreground">Draft</p>
                </div>
            </div>

            {/* Table */}
            <div className="bg-[#121212] border border-[#2a2a2a] rounded-2xl overflow-hidden">
                <table className="w-full text-left text-sm">
                    <thead className="bg-[#1a1a1a] text-muted-foreground">
                        <tr>
                            <th className="px-6 py-4 font-semibold">JUDUL</th>
                            <th className="px-6 py-4 font-semibold">KATEGORI</th>
                            <th className="px-6 py-4 font-semibold">STATUS</th>
                            <th className="px-6 py-4 font-semibold text-center">VIEWS</th>
                            <th className="px-6 py-4 font-semibold text-right">AKSI</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-[#2a2a2a]">
                        {articles.length > 0 ? articles.map(a => (
                            <tr key={a.id} className="hover:bg-[#1a1a1a]/50 transition-colors">
                                <td className="px-6 py-4">
                                    <p className="font-bold text-foreground truncate max-w-[300px]">{a.title}</p>
                                    <p className="text-xs text-muted-foreground mt-0.5">{new Date(a.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                                </td>
                                <td className="px-6 py-4"><span className="px-2.5 py-1 rounded-md text-xs font-bold bg-[#2a2a2a] text-muted-foreground border border-[#333]">{a.category}</span></td>
                                <td className="px-6 py-4">
                                    <span className={`px-2.5 py-1 rounded-md text-xs font-bold border ${a.status === 'published' ? 'bg-green-500/10 text-green-500 border-green-500/20' : 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20'}`}>{a.status.toUpperCase()}</span>
                                </td>
                                <td className="px-6 py-4 text-center text-muted-foreground font-mono">{a.views}</td>
                                <td className="px-6 py-4 text-right">
                                    <div className="flex items-center justify-end gap-2">
                                        <button onClick={() => startEdit(a)} className="p-2 rounded-lg bg-blue-500/10 text-blue-500 hover:bg-blue-500/20"><Edit className="h-4 w-4" /></button>
                                        <button onClick={() => handleDelete(a.id)} className="p-2 rounded-lg bg-red-500/10 text-red-500 hover:bg-red-500/20"><Trash2 className="h-4 w-4" /></button>
                                    </div>
                                </td>
                            </tr>
                        )) : (
                            <tr>
                                <td colSpan={5} className="px-6 py-12 text-center">
                                    <FileText className="h-8 w-8 text-muted-foreground mx-auto mb-3" />
                                    <p className="text-muted-foreground font-medium">Belum ada artikel. Mulai menulis sekarang!</p>
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
