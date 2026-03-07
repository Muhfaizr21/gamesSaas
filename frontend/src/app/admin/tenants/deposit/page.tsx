'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Check, X, Clock, Wallet, Search, TrendingUp, SearchX, CheckCircle2, XCircle } from 'lucide-react';

export default function SuperAdminDepositPage() {
    const { token } = useAuth();
    const [deposits, setDeposits] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    const fetchDeposits = async () => {
        try {
            setLoading(true);
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/superadmin/deposits`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            const data = await res.json();
            if (res.ok) setDeposits(data);
            else alert(data.message || 'Gagal memuat deposit');
        } catch (error) {
            alert('Koneksi bermasalah');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (token) fetchDeposits();
    }, [token]);

    const handleAction = async (id: string, action: 'approve' | 'reject') => {
        let reason = '';
        if (action === 'reject') {
            const temp = prompt('Alasan penolakan? (Opsional)');
            if (temp === null) return; // User cancelled
            reason = temp;
        } else {
            if (!confirm('Yakin setujui deposit ini? Saldo toko akan otomatis bertambah.')) return;
        }

        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/superadmin/deposits/${id}/${action}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({ reason })
            });

            const data = await res.json();
            if (res.ok) {
                alert(data.message);
                fetchDeposits();
            } else {
                alert(data.message || 'Gagal merubah status');
            }
        } catch (error) {
            alert('Koneksi bermasalah');
        }
    };

    const filtered = deposits.filter((d: any) =>
        (d.tenant?.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (d.tenant?.subdomain || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (d.paymentMethod || '').toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Kinerja & Statistik
    const pendingCount = deposits.filter((d: any) => d.status === 'pending').length;
    const totalApprovedAmount = deposits
        .filter((d: any) => d.status === 'approved')
        .reduce((sum: number, cur: any) => sum + parseFloat(cur.amount), 0);

    return (
        <div className="p-6 max-w-7xl mx-auto space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
                <div>
                    <h1 className="text-3xl font-black tracking-tight flex items-center gap-3">
                        <Wallet className="h-8 w-8 text-primary" />
                        Validasi Deposit Reseller
                    </h1>
                    <p className="text-zinc-400 mt-2">Daftar permintaan topup saldo pusat dari seluruh toko.</p>
                </div>

                <div className="flex bg-[#1a1a1a] rounded-xl border border-[#2a2a2a] overflow-hidden p-1 shadow-md">
                    <div className="px-4 py-2 border-r border-[#2a2a2a]">
                        <p className="text-xs text-zinc-500 font-bold uppercase tracking-widest mb-1">Total Pending</p>
                        <p className="text-xl font-black text-yellow-500">{pendingCount} <span className="text-xs text-zinc-600 font-normal">Antrian</span></p>
                    </div>
                    <div className="px-4 py-2">
                        <p className="text-xs text-zinc-500 font-bold uppercase tracking-widest mb-1">Deposit Diterima</p>
                        <p className="text-xl font-black text-green-500 tracking-tight">Rp {totalApprovedAmount.toLocaleString('id-ID')}</p>
                    </div>
                </div>
            </div>

            <div className="bg-[#1a1a1a] rounded-xl border border-[#2a2a2a] shadow-xl overflow-hidden">
                <div className="p-4 border-b border-[#2a2a2a] flex flex-col sm:flex-row justify-between items-center gap-4 bg-[#1f1f1f]">
                    <div className="relative w-full sm:w-80">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
                        <input
                            type="text"
                            placeholder="Cari toko / metode..."
                            className="w-full pl-10 pr-4 py-2 bg-[#121212] border border-[#333] rounded-lg text-sm text-white focus:outline-none focus:border-primary transition-colors"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>

                    {/* Placeholder Filter if needed */}
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm whitespace-nowrap">
                        <thead className="bg-[#1f1f1f]/80">
                            <tr>
                                <th className="px-6 py-4 text-xs font-black text-zinc-500 uppercase tracking-widest">Toko (Reseller)</th>
                                <th className="px-6 py-4 text-xs font-black text-zinc-500 uppercase tracking-widest">Waktu</th>
                                <th className="px-6 py-4 text-xs font-black text-zinc-500 uppercase tracking-widest">Nominal / Pembayaran</th>
                                <th className="px-6 py-4 text-xs font-black text-zinc-500 uppercase tracking-widest text-center">Status</th>
                                <th className="px-6 py-4 text-xs font-black text-zinc-500 uppercase tracking-widest text-right">Aksi</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-[#2a2a2a]">
                            {loading ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-12 text-center text-zinc-500 animate-pulse">Memuat data dari server pusat...</td>
                                </tr>
                            ) : filtered.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-12 text-center">
                                        <SearchX className="h-12 w-12 text-zinc-600 mx-auto mb-3 opacity-50" />
                                        <p className="text-zinc-500 font-medium">Tidak ada permintaan deposit ditemukan.</p>
                                    </td>
                                </tr>
                            ) : (
                                filtered.map((d: any) => (
                                    <tr key={d.id} className="hover:bg-white/5 transition-colors group">
                                        <td className="px-6 py-4">
                                            <p className="font-bold text-white text-base">{d.tenant?.name || 'Unknown Toko'}</p>
                                            <p className="text-xs text-primary font-mono bg-primary/10 inline-block px-2 py-0.5 rounded-md mt-1">{d.tenant?.subdomain}.samstore.id</p>
                                        </td>
                                        <td className="px-6 py-4 text-zinc-400">
                                            <p>{new Date(d.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                                            <p className="text-xs text-zinc-500">{new Date(d.createdAt).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })} WIB</p>
                                        </td>
                                        <td className="px-6 py-4">
                                            <p className="font-black text-white text-base">Rp {parseFloat(d.amount).toLocaleString('id-ID')}</p>
                                            <p className="text-xs text-zinc-400 mt-1 max-w-[180px] truncate" title={d.paymentMethod}>{d.paymentMethod}</p>
                                            {d.note && <p className="text-xs text-blue-400 mt-1 truncate max-w-[180px]" title={d.note}>📝 {d.note}</p>}
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            {d.status === 'pending' && <span className="inline-flex flex-col items-center gap-1.5 px-3 py-1.5 rounded-lg bg-yellow-500/10 text-yellow-500 border border-yellow-500/20 text-xs font-bold w-full"><Clock className="h-4 w-4" /> PENDING</span>}
                                            {d.status === 'approved' && <span className="inline-flex flex-col items-center gap-1.5 px-3 py-1.5 rounded-lg bg-green-500/10 text-green-500 border border-green-500/20 text-xs font-bold w-full"><CheckCircle2 className="h-4 w-4" /> BERHASIL</span>}
                                            {d.status === 'rejected' && <span className="inline-flex flex-col items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-500/10 text-red-500 border border-red-500/20 text-xs font-bold w-full"><XCircle className="h-4 w-4" /> DITOLAK</span>}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            {d.status === 'pending' ? (
                                                <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <button
                                                        onClick={() => handleAction(d.id, 'approve')}
                                                        className="h-9 px-3 bg-green-500 hover:bg-green-600 text-white rounded-lg shadow-[0_0_15px_rgba(34,197,94,0.3)] hover:shadow-[0_0_20px_rgba(34,197,94,0.5)] transition-all flex items-center justify-center gap-2 font-bold text-xs"
                                                    >
                                                        <Check className="h-4 w-4" /> Terima
                                                    </button>
                                                    <button
                                                        onClick={() => handleAction(d.id, 'reject')}
                                                        className="h-9 w-9 bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white border border-red-500/20 hover:border-red-500 rounded-lg transition-all flex items-center justify-center font-bold text-xs"
                                                        title="Tolak Deposit"
                                                    >
                                                        <X className="h-4 w-4" />
                                                    </button>
                                                </div>
                                            ) : (
                                                <span className="text-xs text-zinc-600 font-bold uppercase tracking-wider">
                                                    Selesai
                                                </span>
                                            )}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
