'use client';
import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Store, Plus, Search, Edit, Power, Eye, Wallet, Banknote, History, ArrowDownCircle, ArrowUpCircle } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

type Tenant = {
    id: string; name: string; subdomain: string; status: string; balance: number;
};

export default function DepositResellerPage() {
    const { token } = useAuth();
    const [tenants, setTenants] = useState<Tenant[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [actionLoading, setActionLoading] = useState<string | null>(null);

    // Modal state
    const [selectedTenant, setSelectedTenant] = useState<Tenant | null>(null);
    const [amount, setAmount] = useState('');
    const [note, setNote] = useState('');
    const [type, setType] = useState<'kredit' | 'debit'>('kredit'); // kredit = tambah saldo, debit = potong saldo

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

    const handleDeposit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedTenant || !amount || !token) return;

        setActionLoading(selectedTenant.id);
        try {
            const res = await fetch(`${API}/api/superadmin/tenants/${selectedTenant.id}/balance`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                body: JSON.stringify({
                    amount: Number(amount),
                    type,
                    note
                })
            });

            if (!res.ok) {
                const err = await res.json();
                throw new Error(err.message || 'Gagal mengubah saldo');
            }

            alert('Saldo berhasil diperbarui!');
            setSelectedTenant(null);
            setAmount('');
            setNote('');
            await fetchTenants();
        } catch (err: any) {
            alert(err.message);
        } finally {
            setActionLoading(null);
        }
    };

    const filtered = tenants.filter(t => {
        const q = search.toLowerCase();
        return t.name.toLowerCase().includes(q) || t.subdomain.toLowerCase().includes(q);
    });

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(Number(amount));
    };

    if (loading) return <div className="text-primary p-8 animate-pulse font-bold">Memuat Data Saldo Reseller...</div>;

    return (
        <div className="space-y-6 pb-12 text-zinc-100 relative">
            {/* Header Area */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-[#1a1a1a] p-6 rounded-2xl border border-[#2a2a2a]">
                <div>
                    <h1 className="text-2xl font-black text-white flex items-center gap-3">
                        <Banknote className="text-primary w-7 h-7" /> Deposit & Saldo Reseller
                    </h1>
                    <p className="text-zinc-400 mt-1 text-sm">Transfer uang masuk dari cabang ke saldo sistem Pusat (Manual Top-up).</p>
                </div>
            </div>

            {/* Content Area */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                {/* Left Column: Tenant Search & List */}
                <div className="lg:col-span-2 space-y-4">
                    <div className="relative">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500 w-5 h-5" />
                        <input
                            type="text"
                            placeholder="Cari toko untuk ditambah saldonya..."
                            className="w-full bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl pl-12 pr-4 py-3 text-white focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary transition-colors shadow-lg"
                            value={search} onChange={e => setSearch(e.target.value)}
                        />
                    </div>

                    <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-2xl overflow-hidden shadow-lg">
                        <table className="w-full text-left text-sm whitespace-nowrap">
                            <thead className="bg-[#222] text-zinc-400">
                                <tr>
                                    <th className="px-6 py-4 font-semibold">TOKO (SUBDOMAIN)</th>
                                    <th className="px-6 py-4 font-semibold text-right">SALDO TERSISA</th>
                                    <th className="px-6 py-4 font-semibold text-center">AKSI MANAJEMEN</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-[#2a2a2a]">
                                {filtered.length === 0 ? (
                                    <tr>
                                        <td colSpan={3} className="px-6 py-8 text-center text-zinc-500 font-medium">
                                            Tidak ada toko ditemukan.
                                        </td>
                                    </tr>
                                ) : (
                                    filtered.map(t => (
                                        <tr key={t.id} className="hover:bg-[#252525] transition-colors">
                                            <td className="px-6 py-4">
                                                <div className="font-bold text-white text-base">{t.name}</div>
                                                <div className="text-xs text-primary font-mono">{t.subdomain}.samstore.id</div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex justify-end">
                                                    <span className="bg-primary/10 text-primary font-black px-3 py-1.5 rounded-lg border border-primary/20">
                                                        {formatCurrency(t.balance || 0)}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex justify-center gap-2">
                                                    <button
                                                        onClick={() => setSelectedTenant(t)}
                                                        className="bg-zinc-800 hover:bg-zinc-700 text-white px-4 py-2 rounded-lg font-bold transition-all text-xs flex items-center gap-2 border border-zinc-700 hover:border-zinc-500"
                                                    >
                                                        <Wallet className="w-3.5 h-3.5" /> Kelola Saldo
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Right Column: Global Deposit Metrics / History Overview */}
                <div className="space-y-6">
                    <div className="bg-gradient-to-br from-[#1a1a1a] to-[#121212] border border-[#2a2a2a] p-6 rounded-2xl shadow-lg relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-4 opacity-5">
                            <Banknote className="w-24 h-24" />
                        </div>
                        <h3 className="text-zinc-400 font-bold text-sm uppercase tracking-wider mb-2">Total Uang Mengendap (Seluruh Tenant)</h3>
                        <div className="text-4xl font-black text-white shrink-0">
                            {formatCurrency(tenants.reduce((sum, t) => sum + Number(t.balance || 0), 0))}
                        </div>
                        <p className="text-xs text-zinc-500 mt-2 font-medium">Uang ini adalah "kewajiban" Anda untuk memproses transaksi mereka ke Digiflazz.</p>
                    </div>

                    <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-2xl p-6 shadow-lg">
                        <h3 className="text-white font-bold text-lg mb-4 flex items-center gap-2">
                            <History className="w-5 h-5 text-primary" /> Log Terakhir
                        </h3>
                        <div className="text-sm text-zinc-500 text-center py-6 border-2 border-dashed border-[#333] rounded-xl">
                            Fitur log riwayat saldo reseller akan segera hadir.
                        </div>
                    </div>
                </div>
            </div>

            {/* Modal Manajemen Saldo */}
            {selectedTenant && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm shadow-2xl">
                    <div className="bg-[#18181b] border border-[#333] rounded-2xl w-full max-w-md overflow-hidden relative shadow-[0_0_50px_rgba(0,0,0,0.5)]">
                        <div className="p-6 border-b border-[#2a2a2a]">
                            <h2 className="text-xl font-black text-white flex items-center gap-2">
                                <Wallet className="text-primary w-5 h-5" /> Kelola Saldo Toko
                            </h2>
                            <p className="text-sm text-zinc-400 mt-1">Tenant: <strong className="text-primary">[{selectedTenant.name}]</strong></p>
                        </div>

                        <form onSubmit={handleDeposit} className="p-6 space-y-5">
                            {/* Type Selector */}
                            <div className="grid grid-cols-2 gap-3">
                                <button type="button" onClick={() => setType('kredit')} className={`flex items-center justify-center gap-2 py-3 rounded-xl font-bold border transition-all ${type === 'kredit' ? 'bg-green-500/10 text-green-500 border-green-500 shadow-[0_0_15px_rgba(34,197,94,0.15)]' : 'bg-zinc-900 border-zinc-800 text-zinc-500 hover:text-white'}`}>
                                    <ArrowDownCircle className="w-5 h-5" /> Tambah (Kredit)
                                </button>
                                <button type="button" onClick={() => setType('debit')} className={`flex items-center justify-center gap-2 py-3 rounded-xl font-bold border transition-all ${type === 'debit' ? 'bg-red-500/10 text-red-500 border-red-500 shadow-[0_0_15px_rgba(239,68,68,0.15)]' : 'bg-zinc-900 border-zinc-800 text-zinc-500 hover:text-white'}`}>
                                    <ArrowUpCircle className="w-5 h-5" /> Potong (Debit)
                                </button>
                            </div>

                            <div className="flex flex-col gap-2">
                                <label className="text-xs font-bold text-zinc-400 uppercase tracking-widest">Nominal Saldo (Rp)</label>
                                <input
                                    type="number" min="1" required
                                    className="w-full bg-[#121212] border border-[#333] rounded-xl px-4 py-3 text-white text-lg font-bold focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary transition-all"
                                    placeholder="Contoh: 500000"
                                    value={amount} onChange={e => setAmount(e.target.value)}
                                />
                            </div>

                            <div className="flex flex-col gap-2">
                                <label className="text-xs font-bold text-zinc-400 uppercase tracking-widest">Catatan Tambahan (Opsional)</label>
                                <input
                                    type="text"
                                    className="w-full bg-[#121212] border border-[#333] rounded-xl px-4 py-3 text-white font-medium focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary transition-all"
                                    placeholder="Contoh: Transfer via BCA tgl 26 Mar"
                                    value={note} onChange={e => setNote(e.target.value)}
                                />
                            </div>

                            <div className="pt-4 flex gap-3">
                                <button type="button" onClick={() => setSelectedTenant(null)} className="flex-1 py-3 bg-zinc-800 text-zinc-300 rounded-xl font-bold hover:bg-zinc-700 transition-colors">
                                    Batal
                                </button>
                                <button type="submit" disabled={!!actionLoading} className="flex-1 py-3 bg-primary text-black rounded-xl font-black hover:brightness-110 shadow-[0_0_15px_rgba(250,204,21,0.2)] transition-all">
                                    {actionLoading === selectedTenant.id ? 'Memproses...' : 'Eksekusi Saldo'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

        </div>
    );
}
