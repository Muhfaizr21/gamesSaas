'use client';
import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Store, Plus, Search, Edit, Power, Eye, Wallet, User, Mail, Smartphone, Globe, Calendar, BadgeCheck, X } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

type Tenant = {
    id: string;
    name: string;
    subdomain: string;
    customDomain: string | null;
    db_name: string;
    status: string;
    created_at: string;
    balance: number;
    dagangCash: number;
    adminName: string | null;
    adminEmail: string | null;
    adminWhatsapp: string | null;
    plan?: { name: string };
    subscriptionExpiresAt: string | null;
    TenantConfig?: { digiflazzUsername?: string; markupPercent?: number };
};

export default function TenantsPage() {
    const router = useRouter();
    const { token } = useAuth();
    const [tenants, setTenants] = useState<Tenant[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [actionLoading, setActionLoading] = useState<string | null>(null);

    // Detail Modal State
    const [selectedTenant, setSelectedTenant] = useState<Tenant | null>(null);
    const [isDetailOpen, setIsDetailOpen] = useState(false);

    const fetchTenants = useCallback(async () => {
        if (!token) return;
        setLoading(true);
        try {
            const res = await fetch(`${API}/api/superadmin/tenants`, { headers: { Authorization: `Bearer ${token}` } });
            if (!res.ok) throw new Error("Failed to fetch");
            const data = await res.json();
            setTenants(data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    }, [token]);

    useEffect(() => {
        if (token) fetchTenants();
    }, [token, fetchTenants]);

    const toggleStatus = async (t: Tenant) => {
        if (!token) return;
        const next = t.status === 'active' ? 'suspended' : 'active';
        if (!confirm(`${next === 'suspended' ? 'SUSPEND' : 'AKTIFKAN'} toko "${t.name}"?`)) return;
        setActionLoading(t.id);
        await fetch(`${API}/api/superadmin/tenants/${t.id}/status`, {
            method: 'PUT', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify({ status: next })
        });
        await fetchTenants();
        setActionLoading(null);
    };

    const impersonate = async (t: Tenant) => {
        if (!token) return;
        setActionLoading('imp_' + t.id);
        const res = await fetch(`${API}/api/superadmin/tenants/${t.id}/impersonate`, {
            method: 'POST', headers: { Authorization: `Bearer ${token}` }
        });
        const d = await res.json();
        setActionLoading(null);
        if (d.token) {
            localStorage.setItem('token', d.token);
            localStorage.setItem('impersonateTenant', t.subdomain);
            window.open(`/admin-reseller?tenant=${t.subdomain}`, '_blank');
        }
    };

    const filtered = tenants.filter(t => {
        const q = search.toLowerCase();
        const matchSearch = t.name.toLowerCase().includes(q) || t.subdomain.toLowerCase().includes(q);
        const matchStatus = statusFilter === 'all' || t.status === statusFilter;
        return matchSearch && matchStatus;
    });

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(Number(amount));
    };

    if (loading) return <div className="text-primary p-8 animate-pulse font-bold">Memuat Data Reseller...</div>;

    return (
        <div className="space-y-6 pb-12 text-zinc-100">
            {/* Header Area */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-[#1a1a1a] p-6 rounded-2xl border border-[#2a2a2a]">
                <div>
                    <h1 className="text-2xl font-black text-white flex items-center gap-3">
                        <Store className="text-primary w-7 h-7" /> Manajemen Toko Reseller
                    </h1>
                    <p className="text-zinc-400 mt-1 text-sm">Kelola daftar toko, saldo deposit mereka, dan status aktif cabang H2H Anda.</p>
                </div>
            </div>

            {/* Filters Area */}
            <div className="flex flex-col md:flex-row gap-4 bg-[#1a1a1a] p-4 rounded-xl border border-[#2a2a2a]">
                <div className="flex-1 relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500 w-5 h-5" />
                    <input
                        type="text"
                        placeholder="Cari nama toko atau subdomain..."
                        className="w-full bg-[#121212] border border-[#333] rounded-xl pl-12 pr-4 py-3 text-white focus:border-primary focus:outline-none transition-colors"
                        value={search} onChange={e => setSearch(e.target.value)}
                    />
                </div>
                <select
                    className="w-full md:w-48 bg-[#121212] border border-[#333] rounded-xl px-4 py-3 text-white focus:border-primary focus:outline-none transition-colors"
                    value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
                >
                    <option value="all">Semua Status</option>
                    <option value="active">🟢 Status: Aktif</option>
                    <option value="suspended">🔴 Status: Suspended</option>
                </select>
            </div>

            {/* Tenants List Component */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {filtered.map(t => (
                    <div key={t.id} className={`bg-[#1a1a1a] rounded-2xl border ${t.status === 'suspended' ? 'border-red-500/30 opacity-75' : 'border-[#2a2a2a]'} overflow-hidden transition-all hover:border-primary/50 group`}>
                        {/* Card Header */}
                        <div className="p-5 border-b border-[#2a2a2a] flex justify-between items-start">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center border border-primary/20 text-primary font-black text-xl">
                                    {t.name.charAt(0).toUpperCase()}
                                </div>
                                <div>
                                    <h3 className="font-bold text-lg text-white group-hover:text-primary transition-colors">{t.name}</h3>
                                    <a href={`http://${t.subdomain}.localhost:3000`} target="_blank" rel="noreferrer" className="text-zinc-400 text-sm hover:text-white transition-colors">
                                        🔗 {t.subdomain}.samstore.id
                                    </a>
                                </div>
                            </div>
                            <span className={`px-3 py-1 rounded-full text-xs font-bold ${t.status === 'active' ? 'bg-green-500/10 text-green-500 border border-green-500/20' : 'bg-red-500/10 text-red-500 border border-red-500/20'}`}>
                                {t.status.toUpperCase()}
                            </span>
                        </div>

                        {/* Card Body (Stats) */}
                        <div className="p-5 bg-[#141414] grid grid-cols-2 gap-4">
                            <div>
                                <p className="text-xs text-zinc-500 mb-1 font-semibold uppercase tracking-wider">Saldo Deposit</p>
                                <p className="font-bold text-white flex items-center gap-1">
                                    <Wallet className="w-4 h-4 text-primary" /> {formatCurrency(t.balance || 0)}
                                </p>
                            </div>
                            <div>
                                <p className="text-xs text-zinc-500 mb-1 font-semibold uppercase tracking-wider">Markup Default</p>
                                <p className="font-bold text-white">
                                    {(t.TenantConfig?.markupPercent ?? 10)}%
                                </p>
                            </div>
                            <div className="col-span-2">
                                <p className="text-xs text-zinc-500 mb-1 font-semibold uppercase tracking-wider">Database Name</p>
                                <code className="text-xs bg-[#222] text-zinc-300 px-2 py-1 rounded font-mono">{t.db_name}</code>
                            </div>
                        </div>

                        {/* Card Footer (Actions) */}
                        <div className="p-4 border-t border-[#2a2a2a] flex gap-2">
                            <button
                                onClick={() => toggleStatus(t)}
                                disabled={actionLoading === t.id}
                                className={`flex-1 py-2 rounded-lg text-sm font-bold border transition-colors flex items-center justify-center gap-2 ${t.status === 'active' ? 'bg-red-500/10 text-red-500 border-red-500/20 hover:bg-red-500 hover:text-white' : 'bg-green-500/10 text-green-500 border-green-500/20 hover:bg-green-500 hover:text-white'}`}
                            >
                                <Power className="w-4 h-4" /> {actionLoading === t.id ? '...' : t.status === 'active' ? 'Suspend' : 'Aktifkan'}
                            </button>
                            <button
                                onClick={() => { setSelectedTenant(t); setIsDetailOpen(true); }}
                                className="flex-[0.5] py-2 bg-zinc-800 text-zinc-300 rounded-lg text-sm font-bold border border-zinc-700 hover:bg-zinc-700 transition-colors flex items-center justify-center gap-2"
                            >
                                <Edit className="w-4 h-4" />
                            </button>
                            {/* Impersonate */}
                            <button
                                onClick={() => impersonate(t)}
                                disabled={actionLoading === 'imp_' + t.id}
                                title="Login sebagai Reseller"
                                className="flex-[0.5] py-2 bg-primary/10 text-primary rounded-lg text-sm font-bold border border-primary/20 hover:bg-primary hover:text-black transition-colors flex items-center justify-center gap-2"
                            >
                                <Eye className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {/* DETAIL MODAL */}
            {isDetailOpen && selectedTenant && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
                    <div className="bg-[#1a1a1a] border border-[#2a2a2a] w-full max-w-2xl rounded-3xl shadow-2xl relative overflow-hidden animate-in fade-in zoom-in duration-200">
                        {/* Header Image/Background */}
                        <div className="h-24 bg-gradient-to-r from-primary/30 to-blue-500/10 border-b border-[#2a2a2a]" />

                        {/* Avatar Overlay */}
                        <div className="absolute top-12 left-8 w-24 h-24 rounded-3xl bg-[#0e0e0e] border-4 border-[#1a1a1a] flex items-center justify-center overflow-hidden shadow-xl">
                            <div className="w-full h-full bg-gradient-to-br from-primary/30 to-primary/10 flex items-center justify-center text-primary font-black text-4xl">
                                {selectedTenant.name.charAt(0).toUpperCase()}
                            </div>
                        </div>

                        {/* Top Close Button */}
                        <button onClick={() => setIsDetailOpen(false)} className="absolute top-6 right-6 p-2 bg-black/20 hover:bg-black/40 rounded-full text-white/50 hover:text-white transition-all">
                            <X className="w-5 h-5" />
                        </button>

                        <div className="p-8 pt-16">
                            <div className="flex justify-between items-start mb-8">
                                <div>
                                    <h2 className="text-3xl font-black text-white">{selectedTenant.name}</h2>
                                    <div className="flex items-center gap-2 text-zinc-400 mt-1">
                                        <Globe className="w-4 h-4" />
                                        <span className="font-mono text-sm">{selectedTenant.subdomain}.samstore.id</span>
                                    </div>
                                </div>
                                <div className={`px-4 py-1.5 rounded-full text-xs font-black tracking-widest uppercase ${selectedTenant.status === 'active' ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'}`}>
                                    {selectedTenant.status}
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                {/* Biodata Samping Kiri */}
                                <div className="space-y-5">
                                    <h4 className="text-xs font-black text-zinc-500 uppercase tracking-widest border-b border-[#2a2a2a] pb-2">Biodata Owner</h4>

                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-xl bg-zinc-800/50 flex items-center justify-center text-zinc-400">
                                            <User className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <p className="text-[10px] text-zinc-500 font-bold uppercase">Nama Pemilik</p>
                                            <p className="text-white font-semibold">{selectedTenant.adminName || '-'}</p>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-xl bg-zinc-800/50 flex items-center justify-center text-zinc-400">
                                            <Mail className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <p className="text-[10px] text-zinc-500 font-bold uppercase">Email Akses</p>
                                            <p className="text-white font-semibold">{selectedTenant.adminEmail || '-'}</p>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-xl bg-zinc-800/50 flex items-center justify-center text-zinc-400">
                                            <Smartphone className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <p className="text-[10px] text-zinc-500 font-bold uppercase">WhatsApp No</p>
                                            <p className="text-white font-semibold">{selectedTenant.adminWhatsapp || '-'}</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Info Bisnis Samping Kanan */}
                                <div className="space-y-5">
                                    <h4 className="text-xs font-black text-zinc-500 uppercase tracking-widest border-b border-[#2a2a2a] pb-2">Status Bisnis</h4>

                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                                            <BadgeCheck className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <p className="text-[10px] text-zinc-500 font-bold uppercase">Paket Langganan</p>
                                            <p className="text-white font-black">{selectedTenant.plan?.name || 'Trial / Custom'}</p>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-500">
                                            <Wallet className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <p className="text-[10px] text-zinc-500 font-bold uppercase">Saldo Dagang Point</p>
                                            <p className="text-emerald-400 font-black">{formatCurrency(selectedTenant.balance)}</p>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-xl bg-zinc-800/50 flex items-center justify-center text-zinc-400">
                                            <Calendar className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <p className="text-[10px] text-zinc-500 font-bold uppercase">Terdaftar Pada</p>
                                            <p className="text-white font-semibold">
                                                {(() => {
                                                    const d = selectedTenant.created_at || (selectedTenant as any).createdAt;
                                                    return d ? new Date(d).toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' }) : 'Baru Saja';
                                                })()}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="mt-12 flex gap-4">
                                <button
                                    onClick={() => impersonate(selectedTenant)}
                                    className="flex-1 bg-primary text-black font-black py-4 rounded-2xl hover:brightness-110 shadow-lg shadow-primary/20 flex items-center justify-center gap-3"
                                >
                                    <Eye className="w-5 h-5" /> Login Sebagai Admin Toko
                                </button>
                                <button
                                    onClick={() => setIsDetailOpen(false)}
                                    className="px-8 py-4 bg-zinc-800 text-zinc-300 font-bold rounded-2xl hover:bg-zinc-700 border border-zinc-700"
                                >
                                    Tutup
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {filtered.length === 0 && !loading && (
                <div className="text-center py-20 bg-[#1a1a1a] rounded-2xl border border-[#2a2a2a]">
                    <Store className="w-16 h-16 text-zinc-600 mx-auto mb-4" />
                    <h3 className="text-xl font-bold text-white mb-2">Tidak ada toko ditemukan</h3>
                    <p className="text-zinc-400">Belum ada reseller yang mendaftar atau cocok dengan pencarian Anda.</p>
                </div>
            )}
        </div>
    );
}
