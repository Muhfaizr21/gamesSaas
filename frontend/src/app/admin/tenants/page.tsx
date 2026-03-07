'use client';
import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Store, Plus, Search, Edit, Power, Eye, Wallet } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

type Tenant = {
    id: string; name: string; subdomain: string; custom_domain: string | null;
    db_name: string; status: string; created_at: string; balance: number;
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
                <button className="flex items-center gap-2 bg-primary text-black px-6 py-3 rounded-xl font-bold hover:brightness-110 transition-all shadow-[0_0_20px_rgba(250,204,21,0.2)]">
                    <Plus className="w-5 h-5" /> Buat Toko Baru
                </button>
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
                            <button className="flex-[0.5] py-2 bg-zinc-800 text-zinc-300 rounded-lg text-sm font-bold border border-zinc-700 hover:bg-zinc-700 transition-colors flex items-center justify-center gap-2">
                                <Edit className="w-4 h-4" />
                            </button>
                            {/* Impersonate */}
                            <button
                                onClick={() => impersonate(t)}
                                disabled={actionLoading === 'imp_' + t.id}
                                className="flex-[0.5] py-2 bg-primary/10 text-primary rounded-lg text-sm font-bold border border-primary/20 hover:bg-primary hover:text-black transition-colors flex items-center justify-center gap-2"
                            >
                                <Eye className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                ))}
            </div>

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
