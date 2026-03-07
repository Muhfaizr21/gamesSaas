'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Loader2, ArrowRight, Store, CheckCircle2, AlertCircle } from 'lucide-react';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export default function ResellerRegisterPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const initialPlanQuery = searchParams.get('plan');

    const [plans, setPlans] = useState<any[]>([]);
    const [loadingPlans, setLoadingPlans] = useState(true);

    const [form, setForm] = useState({
        storeName: '',
        subdomain: '',
        ownerName: '',
        email: '',
        whatsapp: '',
        password: '',
        planId: ''
    });

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);
    const [createdStoreUrl, setCreatedStoreUrl] = useState('');

    useEffect(() => {
        fetch(`${API}/api/master/plans/public`)
            .then(res => res.json())
            .then(data => {
                const arr = Array.isArray(data) ? data : [];
                setPlans(arr);

                // Set default plan based on query
                if (initialPlanQuery && arr.length > 0) {
                    const matchedPlan = arr.find(p => p.name.toLowerCase() === initialPlanQuery.toLowerCase());
                    if (matchedPlan) {
                        setForm(f => ({ ...f, planId: matchedPlan.id }));
                    } else {
                        setForm(f => ({ ...f, planId: arr[0].id }));
                    }
                } else if (arr.length > 0) {
                    setForm(f => ({ ...f, planId: arr[0].id }));
                }
            })
            .catch(err => console.error('Gagal memuat paket:', err))
            .finally(() => setLoadingPlans(false));
    }, [initialPlanQuery]);

    // Format Subdomain live
    const handleSubdomainChange = (val: string) => {
        const clean = val.toLowerCase().replace(/[^a-z0-9]/g, '');
        setForm({ ...form, subdomain: clean });
    };

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const res = await fetch(`${API}/api/master/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(form)
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.message || 'Gagal mendaftar');
            }

            setSuccess(true);
            setCreatedStoreUrl(data.storeUrl);

        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#07071a] flex items-center justify-center p-4 py-24">
            <div className="max-w-[1000px] w-full grid grid-cols-1 md:grid-cols-5 bg-[#0e0e24] rounded-3xl overflow-hidden border border-white/5 shadow-2xl relative z-10">

                {/* Bagian Kiri: Info */}
                <div className="md:col-span-2 bg-[#141432] p-8 lg:p-12 border-r border-white/5 flex flex-col justify-between">
                    <div>
                        <Link href="/reseller" className="text-xl font-black text-white flex items-center gap-2 mb-12">
                            <span className="bg-primary text-[#07071a] w-8 h-8 rounded flex items-center justify-center font-bold">S</span>
                            SAM<span className="text-primary">SaaS</span>
                        </Link>

                        <h2 className="text-3xl font-black text-white mb-6 leading-tight">Mulai Bangun<br />Kerajaan Topupmu.</h2>

                        <p className="text-zinc-400 mb-8 max-w-sm">Siapkan dirimu untuk menerima ribuan pesanan otomatis setiap harinya.</p>

                        <ul className="space-y-4 mb-8">
                            {[
                                'Toko Online Jadi dalam 10 Detik',
                                'Sistem Otomatis (Auto Provision)',
                                'Terintegrasi Payment Gateway',
                                'Tidak Perlu Skill Coding'
                            ].map((item, i) => (
                                <li key={i} className="flex items-center gap-3 text-sm text-zinc-300 font-medium">
                                    <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0" />
                                    {item}
                                </li>
                            ))}
                        </ul>
                    </div>

                    <div className="bg-[#0e0e24] p-6 rounded-2xl border border-white/5">
                        <QuoteIcon className="w-8 h-8 text-primary/20 mb-3" />
                        <p className="text-sm text-zinc-300 italic mb-4">"Semenjak pakai ini, omzet saya naik gara-gara tidak perlu ngurus pesanan manual. Semuanya full otomatis H2H Pusat."</p>
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold text-xs">J</div>
                            <div>
                                <p className="text-xs font-bold text-white">Julio</p>
                                <p className="text-[10px] text-zinc-500">Omzet 50jt/bulan</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Bagian Kanan: Form Register */}
                <div className="md:col-span-3 p-8 lg:p-12">
                    {success ? (
                        <div className="h-full flex flex-col items-center justify-center text-center">
                            <div className="w-20 h-20 bg-emerald-500/20 rounded-full flex items-center justify-center mb-6">
                                <CheckCircle2 className="w-10 h-10 text-emerald-400" />
                            </div>
                            <h2 className="text-2xl font-black text-white mb-4">Toko Berhasil Dibangun!</h2>
                            <p className="text-zinc-400 mb-8 max-w-md">
                                Selamat! Database dan sistem tokomu berhasil diprovisioning secara otomatis. Tokomu kini sudah bisa diakses secara global!
                            </p>
                            <div className="bg-[#141432] border border-white/10 rounded-2xl p-6 w-full max-w-sm mb-8">
                                <p className="text-xs font-bold text-zinc-500 uppercase mb-2">URL Toko Anda</p>
                                <a href={createdStoreUrl} target="_blank" rel="noreferrer" className="text-primary hover:underline font-bold text-lg block break-all">
                                    {createdStoreUrl.replace('http://', '')}
                                </a>
                                <p className="text-xs text-zinc-500 mt-4 mb-2">Login Admin URL:</p>
                                <a href={`${createdStoreUrl}/admin-reseller`} target="_blank" rel="noreferrer" className="text-primary hover:underline font-bold text-sm block">
                                    {createdStoreUrl.replace('http://', '')}/admin-reseller
                                </a>
                                <p className="text-xs text-yellow-500 mt-4 bg-yellow-500/10 p-3 rounded-lg border border-yellow-500/20">
                                    Email: {form.email} <br /> Password: (Yang Anda buat)
                                </p>
                            </div>
                            <Link href="/reseller" className="text-zinc-400 hover:text-white text-sm font-medium">Buka Halaman Utama</Link>
                        </div>
                    ) : (
                        <form onSubmit={handleRegister} className="max-w-md w-full mx-auto">
                            <div className="mb-8">
                                <h3 className="text-2xl font-black text-white mb-2">Buat Toko Baru</h3>
                                <p className="text-sm text-zinc-400">Lengkapi data untuk memulai trial 14 hari</p>
                            </div>

                            {error && (
                                <div className="bg-red-500/10 border border-red-500/20 text-red-500 p-4 rounded-xl mb-6 text-sm flex gap-3">
                                    <AlertCircle className="w-5 h-5 flex-shrink-0" />
                                    {error}
                                </div>
                            )}

                            <div className="space-y-5">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-xs font-bold text-zinc-400 block mb-2">NAMA TOKO</label>
                                        <input required type="text" value={form.storeName} onChange={e => setForm({ ...form, storeName: e.target.value })}
                                            className="w-full bg-[#141432] border border-white/10 text-white px-4 py-3 rounded-xl focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
                                            placeholder="Contoh: SamStore" />
                                    </div>
                                    <div>
                                        <label className="text-xs font-bold text-zinc-400 block mb-2">SUBDOMAIN URL</label>
                                        <div className="relative">
                                            <input required type="text" value={form.subdomain} onChange={e => handleSubdomainChange(e.target.value)}
                                                className="w-full bg-[#141432] border border-white/10 text-white pl-4 pr-16 py-3 rounded-xl focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
                                                placeholder="samstore" />
                                            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-500 text-xs font-bold pointer-events-none">.xyz</span>
                                        </div>
                                        <p className="text-[10px] mt-2 text-zinc-500">Domain URL Toko Pilihan Anda</p>
                                    </div>
                                </div>

                                <div>
                                    <label className="text-xs font-bold text-zinc-400 block mb-2">PAKET LANGGANAN</label>
                                    {loadingPlans ? (
                                        <div className="bg-[#141432] border border-white/10 text-zinc-500 px-4 py-3 rounded-xl text-sm flex items-center justify-between">
                                            Mengambil paket... <Loader2 className="w-4 h-4 animate-spin" />
                                        </div>
                                    ) : (
                                        <select required value={form.planId} onChange={e => setForm({ ...form, planId: e.target.value })}
                                            className="w-full bg-[#141432] border border-white/10 text-white px-4 py-3 rounded-xl focus:border-primary outline-none appearance-none">
                                            {plans.map(p => (
                                                <option key={p.id} value={p.id}>{p.name} - Rp {Math.round(p.price).toLocaleString('id-ID')}/bln</option>
                                            ))}
                                        </select>
                                    )}
                                </div>

                                <div className="w-full h-[1px] bg-white/5 my-6"></div>

                                <div>
                                    <label className="text-xs font-bold text-zinc-400 block mb-2">NAMA PEMILIK</label>
                                    <input required type="text" value={form.ownerName} onChange={e => setForm({ ...form, ownerName: e.target.value })}
                                        className="w-full bg-[#141432] border border-white/10 text-white px-4 py-3 rounded-xl focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
                                        placeholder="Nama Lengkap Anda" />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-xs font-bold text-zinc-400 block mb-2">EMAIL AKSES</label>
                                        <input required type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })}
                                            className="w-full bg-[#141432] border border-white/10 text-white px-4 py-3 rounded-xl focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
                                            placeholder="admin@email.com" />
                                    </div>
                                    <div>
                                        <label className="text-xs font-bold text-zinc-400 block mb-2">WHATSAPP (OPSIONAL)</label>
                                        <input type="text" value={form.whatsapp} onChange={e => setForm({ ...form, whatsapp: e.target.value })}
                                            className="w-full bg-[#141432] border border-white/10 text-white px-4 py-3 rounded-xl focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
                                            placeholder="081234..." />
                                    </div>
                                </div>

                                <div>
                                    <label className="text-xs font-bold text-zinc-400 block mb-2">PASSWORD ADMIN</label>
                                    <input required type="password" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })}
                                        className="w-full bg-[#141432] border border-white/10 text-white px-4 py-3 rounded-xl focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
                                        placeholder="Minimal 6 karakter" />
                                    <p className="text-[10px] mt-2 text-zinc-500">Password ini akan digunakan di halaman Admin Reseller Anda.</p>
                                </div>

                                <button type="submit" disabled={loading || loadingPlans || !form.planId}
                                    className="w-full flex items-center justify-center gap-2 bg-primary text-[#07071a] font-black py-4 rounded-xl mt-8 hover:bg-primary/90 transition-all shadow-[0_0_30px_rgba(245,200,66,0.2)] disabled:opacity-50">
                                    {loading ? (
                                        <><Loader2 className="w-5 h-5 animate-spin" /> Membuat Toko...</>
                                    ) : (
                                        <>Deploy Toko Sekarang <Store className="w-5 h-5" /></>
                                    )}
                                </button>

                                <p className="text-center text-xs text-zinc-500 mt-6">
                                    Dengan mendaftar, Anda menyetujui <a href="#" className="text-primary hover:underline">Syarat & Ketentuan</a> layanan ini.
                                </p>
                            </div>
                        </form>
                    )}
                </div>
            </div>

            {/* Background Decor */}
            <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary/20 rounded-full blur-[150px] pointer-events-none opacity-20" />
        </div>
    );
}

function QuoteIcon(props: any) {
    return (
        <svg fill="currentColor" viewBox="0 0 24 24" {...props}>
            <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" />
        </svg>
    )
}
