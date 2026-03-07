'use client';

import { Megaphone, Send, BellRing, Clock, ShieldAlert } from 'lucide-react';
import { useState } from 'react';

export default function BroadcastNewsPage() {
    const [isLoading, setIsLoading] = useState(false);
    const [formData, setFormData] = useState({
        title: '',
        message: '',
        level: 'info',
        targetAudience: 'all'
    });

    const [broadcasts] = useState([
        { id: 1, title: 'Gangguan MLBB Server Pusat', level: 'critical', target: 'Semua Reseller', date: 'Bulan lalu', status: 'sent' },
        { id: 2, title: 'Promo Diskon Akhir Tahun', level: 'info', target: 'Semua Reseller', date: '3 Bulan lalu', status: 'sent' }
    ]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSend = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setTimeout(() => {
            setIsLoading(false);
            alert('Pesan Broadcast berhasil dikirim ke dashboard semua Reseller!');
            setFormData({ title: '', message: '', level: 'info', targetAudience: 'all' });
        }, 1500);
    };

    return (
        <div className="p-6 max-w-7xl mx-auto flex flex-col lg:flex-row gap-8">

            {/* Form Buat Broadcast (Kiri) */}
            <div className="flex-1">
                <div className="mb-6">
                    <h1 className="text-3xl font-black text-white flex items-center gap-3">
                        <Megaphone className="h-8 w-8 text-primary" />
                        Pusat Pemberitahuan
                    </h1>
                    <p className="text-zinc-400 mt-1">Kirim pengumuman massal langsung ke beranda Admin Panel semua tenant/reseller.</p>
                </div>

                <form onSubmit={handleSend} className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-3xl p-6 shadow-2xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-4 opacity-10">
                        <BellRing className="h-40 w-40 text-primary rotate-12 translate-x-10 -translate-y-10" />
                    </div>

                    <div className="relative z-10 space-y-6">
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-zinc-300">Judul Pengumuman</label>
                            <input
                                type="text"
                                name="title"
                                value={formData.title}
                                onChange={handleChange}
                                required
                                placeholder="Contoh: Server Free Fire Gangguan!"
                                className="w-full bg-[#121212] border border-[#333] rounded-xl px-4 py-3 text-white focus:outline-none focus:border-primary transition-all text-xl font-bold"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-bold text-zinc-300">Isi Pesan Singkat</label>
                            <textarea
                                name="message"
                                value={formData.message}
                                onChange={handleChange}
                                required
                                rows={4}
                                placeholder="Tulis rincian informasi di sini..."
                                className="w-full bg-[#121212] border border-[#333] rounded-xl px-4 py-3 text-zinc-300 focus:outline-none focus:border-primary transition-all resize-none"
                            ></textarea>
                        </div>

                        <div className="grid grid-cols-2 gap-5">
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-zinc-300">Tingkat Urgensi</label>
                                <select
                                    name="level"
                                    value={formData.level}
                                    onChange={handleChange}
                                    className="w-full bg-[#121212] border border-[#333] rounded-xl px-4 py-3 text-white focus:outline-none focus:border-primary transition-all font-bold"
                                >
                                    <option value="info">💬 Info Biasa (Biru)</option>
                                    <option value="warning">⚠️ Peringatan (Kuning)</option>
                                    <option value="critical">🚨 Kritis / Penting (Merah)</option>
                                </select>
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-zinc-300">Target Penerima</label>
                                <select
                                    name="targetAudience"
                                    value={formData.targetAudience}
                                    onChange={handleChange}
                                    className="w-full bg-[#121212] border border-[#333] rounded-xl px-4 py-3 text-white focus:outline-none focus:border-primary transition-all font-bold"
                                >
                                    <option value="all">🌐 Semua Toko (Reseller)</option>
                                    <option value="active">✅ Toko Aktif Saja</option>
                                    <option value="trial">🆓 Toko Masa Percobaan (Trial)</option>
                                </select>
                            </div>
                        </div>

                        <div className="pt-4 border-t border-[#333] flex justify-end">
                            <button
                                type="submit"
                                disabled={isLoading || formData.message.length < 5 || formData.title.length < 5}
                                className="flex items-center gap-3 bg-gradient-to-r from-primary to-yellow-600 hover:opacity-90 text-black px-8 py-3 rounded-xl font-black transition-all shadow-[0_0_20px_rgba(250,204,21,0.3)] disabled:opacity-50 text-xl"
                            >
                                {isLoading ? <Clock className="h-6 w-6 animate-spin" /> : <Send className="h-6 w-6" />}
                                {isLoading ? 'Mengirim...' : 'Kirim Sekarang'}
                            </button>
                        </div>
                    </div>
                </form>
            </div>

            {/* Riwayat Pengumuman (Kanan) */}
            <div className="w-full lg:w-[400px]">
                <div className="mb-6 flex items-center justify-between">
                    <h2 className="text-xl font-bold text-white flex items-center gap-2">
                        <Clock className="h-5 w-5 text-zinc-500" /> Riwayat Terakhir
                    </h2>
                </div>

                <div className="space-y-4">
                    {broadcasts.map(post => (
                        <div key={post.id} className="bg-[#121212] border border-[#2a2a2a] rounded-2xl p-5 hover:border-primary/50 transition-all cursor-pointer group">
                            <div className="flex justify-between items-start mb-2">
                                <span className={`text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded ${post.level === 'critical' ? 'bg-red-500/10 text-red-500' : 'bg-blue-500/10 text-blue-500'}`}>
                                    {post.level === 'critical' ? 'Urgent' : 'Info'}
                                </span>
                                <span className="text-xs text-zinc-500 font-mono">{post.date}</span>
                            </div>
                            <h3 className="font-bold text-white mb-2 leading-tight group-hover:text-primary transition-colors">{post.title}</h3>
                            <p className="text-xs text-zinc-500 flex items-center gap-1">
                                <Megaphone className="h-3 w-3" /> Kepada: {post.target}
                            </p>
                        </div>
                    ))}
                </div>

                <div className="mt-6 p-5 bg-zinc-800/30 border border-zinc-800 rounded-2xl flex items-start gap-4">
                    <ShieldAlert className="h-6 w-6 text-zinc-400 flex-shrink-0" />
                    <p className="text-xs text-zinc-400 leading-relaxed">
                        Pengumuman yang dikirim akan otomatis muncul dalam bentuk *banner alert* atau *modal dialog* di halaman depan Admin Panel masing-masing Reseller hingga mereka menutupnya.
                    </p>
                </div>
            </div>

        </div>
    );
}
