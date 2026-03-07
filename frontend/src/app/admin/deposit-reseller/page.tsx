'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { CreditCard, Plus, Clock, CheckCircle2, XCircle, Info, RefreshCw } from 'lucide-react';

export default function ResellerDepositPage() {
    const { token } = useAuth();
    const [deposits, setDeposits] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Form state
    const [amount, setAmount] = useState('');
    const [paymentMethod, setPaymentMethod] = useState('');
    const [note, setNote] = useState('');

    const fetchDeposits = async () => {
        try {
            setLoading(true);
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/finance/deposit-requests`, {
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

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!amount || parseInt(amount) < 10000) return alert('Minimal transfer Rp 10.000');
        if (!paymentMethod) return alert('Pilih metode transfer');

        try {
            setIsSubmitting(true);
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/finance/deposit-requests`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({ amount: parseInt(amount), paymentMethod, note })
            });

            const data = await res.json();
            if (res.ok) {
                alert('Pengajuan terkirim. Silakan transfer!');
                setAmount(''); setNote(''); setPaymentMethod('');
                fetchDeposits();
            } else {
                alert(data.message || 'Gagal mengirim pengajuan');
            }
        } catch (error) {
            alert('Koneksi bermasalah');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="p-6 max-w-7xl mx-auto space-y-6">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-black tracking-tight flex items-center gap-3">
                        <CreditCard className="h-8 w-8 text-primary" />
                        Topup Saldo Toko
                    </h1>
                    <p className="text-zinc-400 mt-2">Saldo master yang digunakan untuk memproses transaksi otomatis (Digiflazz).</p>
                </div>
                <button onClick={fetchDeposits} className="flex items-center justify-center gap-2 px-4 py-2 bg-zinc-800 hover:bg-zinc-700 rounded-lg text-sm font-medium transition-colors">
                    <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                    Segarkan Data
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* FORM PENGAJUAN */}
                <div className="lg:col-span-1 space-y-4">
                    <div className="bg-[#1a1a1a] rounded-xl border border-[#2a2a2a] p-6 shadow-xl">
                        <h2 className="text-lg font-bold flex items-center gap-2 mb-4">
                            <Plus className="h-5 w-5 text-primary" /> Ajukan Isi Saldo
                        </h2>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2">Pilih Bank / E-Wallet Tujuan</label>
                                <select
                                    value={paymentMethod}
                                    onChange={(e) => setPaymentMethod(e.target.value)}
                                    className="w-full bg-[#121212] border border-[#333] rounded-lg p-3 text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
                                    required
                                >
                                    <option value="" disabled>-- Pilih Rekening SuperAdmin --</option>
                                    <option value="BCA - 1234567890 (A/N Budi)">BCA - 1234567890 (A/N Budi)</option>
                                    <option value="MANDIRI - 0987654321 (A/N Budi)">MANDIRI - 0987654321 (A/N Budi)</option>
                                    <option value="DANA - 08123456789 (A/N Budi)">DANA - 08123456789 (A/N Budi)</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2">Nominal Topup (Rp)</label>
                                <div className="relative">
                                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500 font-bold">Rp</span>
                                    <input
                                        type="number"
                                        min="10000"
                                        value={amount}
                                        onChange={(e) => setAmount(e.target.value)}
                                        placeholder="Min. 10.000"
                                        className="w-full bg-[#121212] border border-[#333] rounded-lg p-3 pl-10 text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
                                        required
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2">Catatan Tambahan (Opsional)</label>
                                <textarea
                                    value={note}
                                    onChange={(e) => setNote(e.target.value)}
                                    placeholder="Contoh: Sudah tf dari rek A/n Paijo"
                                    className="w-full bg-[#121212] border border-[#333] rounded-lg p-3 text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all resize-none h-20"
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="w-full bg-primary hover:bg-yellow-500 text-black font-bold py-3 px-4 rounded-lg shadow-[0_0_15px_rgba(250,204,21,0.2)] hover:shadow-[0_0_20px_rgba(250,204,21,0.4)] transition-all flex justify-center items-center gap-2 mt-2 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isSubmitting ? (
                                    <><RefreshCw className="h-4 w-4 animate-spin" /> Memproses...</>
                                ) : (
                                    <>Kirim Pengajuan</>
                                )}
                            </button>
                        </form>
                    </div>

                    <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4 flex gap-3">
                        <Info className="h-5 w-5 text-blue-400 shrink-0 mt-0.5" />
                        <div className="text-sm text-blue-200 leading-relaxed">
                            <strong className="block text-blue-400 mb-1">Cara Topup:</strong>
                            1. Isi form di atas dengan benar.<br />
                            2. Lakukan transfer sesuai nominal ke rekening yang dipilih.<br />
                            3. Hubungi Super Admin via WhatsApp dengan menyertakan bukti struk / screenshot transaksi.<br />
                            4. Saldo akan diinput setelah admin memvalidasi mutasi bank.
                        </div>
                    </div>
                </div>

                {/* TABEL RIWAYAT */}
                <div className="lg:col-span-2">
                    <div className="bg-[#1a1a1a] rounded-xl border border-[#2a2a2a] shadow-xl overflow-hidden">
                        <div className="px-6 py-4 border-b border-[#2a2a2a] bg-[#1f1f1f]">
                            <h2 className="font-bold flex items-center gap-2">
                                <Clock className="h-4 w-4 text-zinc-400" /> Riwayat Topup
                            </h2>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-sm whitespace-nowrap">
                                <thead className="bg-[#1f1f1f]/50">
                                    <tr>
                                        <th className="px-6 py-4 text-xs font-black text-zinc-500 uppercase tracking-widest">Tanggal</th>
                                        <th className="px-6 py-4 text-xs font-black text-zinc-500 uppercase tracking-widest">Nominal</th>
                                        <th className="px-6 py-4 text-xs font-black text-zinc-500 uppercase tracking-widest">Metode / Bank</th>
                                        <th className="px-6 py-4 text-xs font-black text-zinc-500 uppercase tracking-widest text-right">Status</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-[#2a2a2a]">
                                    {loading ? (
                                        <tr><td colSpan={4} className="p-8 text-center text-zinc-500 animate-pulse">Memuat data...</td></tr>
                                    ) : deposits.length === 0 ? (
                                        <tr><td colSpan={4} className="p-8 text-center text-zinc-500">Belum ada riwayat pengajuan deposit.</td></tr>
                                    ) : (
                                        deposits.map((d: any) => (
                                            <tr key={d.id} className="hover:bg-white/5 transition-colors">
                                                <td className="px-6 py-4 text-zinc-300">
                                                    {new Date(d.createdAt).toLocaleString('id-ID', {
                                                        day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
                                                    })}
                                                </td>
                                                <td className="px-6 py-4 font-bold text-white">
                                                    Rp {parseFloat(d.amount).toLocaleString('id-ID')}
                                                </td>
                                                <td className="px-6 py-4 text-zinc-400 text-xs">
                                                    <div className="max-w-[200px] truncate" title={d.paymentMethod}>{d.paymentMethod}</div>
                                                    {d.note && <div className="mt-1 text-zinc-500 italic truncate" title={d.note}>"{d.note}"</div>}
                                                </td>
                                                <td className="px-6 py-4 text-right">
                                                    {d.status === 'pending' && <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-yellow-500/10 text-yellow-500 border border-yellow-500/20 text-xs font-bold"><Clock className="h-3 w-3" /> Pending</span>}
                                                    {d.status === 'approved' && <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-green-500/10 text-green-500 border border-green-500/20 text-xs font-bold"><CheckCircle2 className="h-3 w-3" /> Disetujui</span>}
                                                    {d.status === 'rejected' && <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-red-500/10 text-red-500 border border-red-500/20 text-xs font-bold"><XCircle className="h-3 w-3" /> Ditolak</span>}
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
