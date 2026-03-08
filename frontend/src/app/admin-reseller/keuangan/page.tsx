"use client";

import { useEffect, useState, useCallback } from "react";
import { useAuth } from "@/context/AuthContext";
import {
    BarChart2, Wallet, TrendingUp, DollarSign, ArrowUpRight,
    ArrowDownRight, PieChart, Info, Settings, History,
    ChevronDown, Download, AlertCircle, RefreshCw, Plus,
    CheckCircle2, XCircle, Wrench, Megaphone, PiggyBank
} from "lucide-react";

interface SavingPot {
    id: number;
    name: string;
    slug: string;
    description: string;
    allocation_percent: string;
    balance: string;
    color: string;
    icon: string;
}

interface OrderReport {
    id: number;
    invoice_number: string;
    product_name: string;
    revenue: number;
    modal: number;
    fee: number;
    profit: number;
    created_at: string;
}

interface FinanceData {
    period: string;
    summary: {
        total_orders: number;
        total_revenue: number;
        total_modal: number;
        total_fee: number;
        total_profit: number;
        margin_percent: number;
    };
    orders: OrderReport[];
}

export default function AdminKeuanganPage() {
    const { token } = useAuth();
    const [period, setPeriod] = useState("30d");
    const [financeData, setFinanceData] = useState<FinanceData | null>(null);
    const [savingPots, setSavingPots] = useState<SavingPot[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isPotsLoading, setIsPotsLoading] = useState(true);
    const [isRecalculating, setIsRecalculating] = useState(false);

    const [isWithdrawModalOpen, setIsWithdrawModalOpen] = useState(false);
    const [withdrawData, setWithdrawData] = useState({ potId: 0, potName: '', amount: '', description: '' });

    const [isAllocationModalOpen, setIsAllocationModalOpen] = useState(false);
    const [tempAllocations, setTempAllocations] = useState<any[]>([]);

    const fetchData = useCallback(async () => {
        if (!token) return;
        setIsLoading(true);
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/finance/report?period=${period}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                setFinanceData(await res.json());
            }
        } catch (error) {
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    }, [token, period]);

    const fetchPots = useCallback(async () => {
        if (!token) return;
        setIsPotsLoading(true);
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/finance/pots`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                setSavingPots(await res.json());
            }
        } catch (error) {
            console.error(error);
        } finally {
            setIsPotsLoading(false);
        }
    }, [token]);

    useEffect(() => {
        fetchData();
        fetchPots();
    }, [fetchData, fetchPots]);

    const formatCurrency = (amount: number | string) => {
        return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(Number(amount));
    };

    const handleRecalculate = async () => {
        if (!confirm("⚠️ PERHATIAN: Fitur ini akan menghapus semua catatan alokasi Dana Masuk (income) yang ada dan menghitung ulang saldo dari seluruh riwayat pesanan Sukses.\n\nLanjutkan re-kalkulasi saldo?")) return;
        setIsRecalculating(true);
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/finance/recalculate`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                const data = await res.json();
                alert(data.message);
                fetchData();
                fetchPots();
            }
        } catch (e) { console.error(e); }
        finally { setIsRecalculating(false); }
    };

    const openWithdrawModal = (pot: SavingPot) => {
        setWithdrawData({ potId: pot.id, potName: pot.name, amount: '', description: '' });
        setIsWithdrawModalOpen(true);
    };

    const handleWithdraw = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/finance/pots/${withdrawData.potId}/withdraw`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    amount: withdrawData.amount,
                    description: withdrawData.description
                })
            });
            if (res.ok) {
                setIsWithdrawModalOpen(false);
                fetchPots();
                fetchData();
            } else {
                const err = await res.json();
                alert(err.message || "Gagal mencatat penarikan");
            }
        } catch (e) { console.error(e); }
    };

    const openAllocationModal = () => {
        setTempAllocations(savingPots.map(p => ({ id: p.id, name: p.name, allocation_percent: p.allocation_percent })));
        setIsAllocationModalOpen(true);
    };

    const handleAllocationSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/finance/pots/allocation`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ allocations: tempAllocations })
            });
            if (res.ok) {
                setIsAllocationModalOpen(false);
                fetchPots();
            } else {
                const err = await res.json();
                alert(err.message || "Gagal mengubah alokasi");
            }
        } catch (e) { console.error(e); }
    };

    const getPotIcon = (slug: string) => {
        switch (slug) {
            case 'operational': return <Wrench className="h-5 w-5" />;
            case 'marketing': return <Megaphone className="h-5 w-5" />;
            case 'retained': return <PiggyBank className="h-5 w-5" />;
            default: return <Wallet className="h-5 w-5" />;
        }
    };

    const getPotColor = (color: string) => {
        switch (color) {
            case 'blue': return 'text-blue-500 bg-blue-500/10 border-blue-500/20';
            case 'orange': return 'text-orange-500 bg-orange-500/10 border-orange-500/20';
            case 'green': return 'text-green-500 bg-green-500/10 border-green-500/20';
            default: return 'text-primary bg-primary/10 border-primary/20';
        }
    };

    const getProgressColor = (color: string) => {
        switch (color) {
            case 'blue': return 'bg-blue-500';
            case 'orange': return 'bg-orange-500';
            case 'green': return 'bg-green-500';
            default: return 'bg-primary';
        }
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* Header Area */}
            <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-6">
                <div>
                    <h1 className="text-3xl font-black text-foreground mb-2 tracking-tight flex items-center gap-3">
                        <BarChart2 className="h-8 w-8 text-primary" /> Laporan <span className="text-primary">Keuangan</span>
                    </h1>
                    <p className="text-muted-foreground max-w-2xl">Laporan Laba Rugi (P&L) dan pengelolaan Dana Cadangan (Saving Pots) otomatis dari setiap profit transaksi.</p>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                    <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl p-1 flex">
                        {["today", "7d", "30d", "all"].map((p) => (
                            <button
                                key={p}
                                onClick={() => setPeriod(p)}
                                className={`px-4 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${period === p ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20" : "text-muted-foreground hover:text-foreground"
                                    }`}
                            >
                                {p === "today" ? "Hari Ini" : p === "7d" ? "7 HARI" : p === "30d" ? "30 HARI" : "SEMUA"}
                            </button>
                        ))}
                    </div>
                    <button
                        onClick={handleRecalculate}
                        disabled={isRecalculating}
                        className="flex items-center gap-2 px-5 py-2.5 bg-[#1a1a1a] border border-[#2a2a2a] text-muted-foreground font-bold rounded-xl hover:border-primary/50 hover:text-primary transition-all text-xs"
                    >
                        <RefreshCw className={`h-4 w-4 ${isRecalculating ? 'animate-spin' : ''}`} />
                        {isRecalculating ? 'Menghitung...' : 'Sync Saldo'}
                    </button>
                </div>
            </div>

            {/* Top Stat Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-[#1a1a1a] border border-[#2a2a2a] p-6 rounded-3xl relative overflow-hidden ring-1 ring-[#2a2a2a] hover:ring-primary/30 transition-all">
                    <div className="flex justify-between items-start mb-6">
                        <div className="p-3 bg-primary/10 rounded-2xl text-primary">
                            <TrendingUp className="h-6 w-6" />
                        </div>
                        <span className="text-[10px] font-black uppercase text-primary bg-primary/10 px-2 py-1 rounded-md tracking-tighter">Gross Revenue</span>
                    </div>
                    <p className="text-muted-foreground text-sm font-bold mb-1 uppercase tracking-widest">Total Pendapatan</p>
                    <h3 className="text-2xl font-black text-foreground">{formatCurrency(financeData?.summary.total_revenue || 0)}</h3>
                </div>

                <div className="bg-[#1a1a1a] border border-[#2a2a2a] p-6 rounded-3xl relative overflow-hidden group">
                    <div className="flex justify-between items-start mb-6">
                        <div className="p-3 bg-red-500/10 rounded-2xl text-red-500">
                            <DollarSign className="h-6 w-6" />
                        </div>
                        <span className="text-[10px] font-black uppercase text-red-500 bg-red-500/10 px-2 py-1 rounded-md tracking-tighter">COGS / MODAL</span>
                    </div>
                    <p className="text-muted-foreground text-sm font-bold mb-1 uppercase tracking-widest">Total Biaya & Modal</p>
                    <h3 className="text-2xl font-black text-foreground">{formatCurrency((financeData?.summary.total_modal || 0) + (financeData?.summary.total_fee || 0))}</h3>
                </div>

                <div className="bg-[#1a1a1a] border border-[#2a2a2a] p-6 rounded-3xl relative overflow-hidden group shadow-xl shadow-green-500/5">
                    <div className="flex justify-between items-start mb-6">
                        <div className="p-3 bg-green-500/10 rounded-2xl text-green-500">
                            <ArrowUpRight className="h-6 w-6" />
                        </div>
                        <span className="text-[10px] font-black uppercase text-green-500 bg-green-500/10 px-2 py-1 rounded-md tracking-tighter">Net Profit</span>
                    </div>
                    <p className="text-muted-foreground text-sm font-bold mb-1 uppercase tracking-widest">Laba Bersih</p>
                    <h3 className="text-2xl font-black text-green-500">{formatCurrency(financeData?.summary.total_profit || 0)}</h3>
                </div>

                <div className="bg-[#1a1a1a] border border-[#2a2a2a] p-6 rounded-3xl relative overflow-hidden group">
                    <div className="flex justify-between items-start mb-6">
                        <div className="p-3 bg-blue-500/10 rounded-2xl text-blue-500">
                            <PieChart className="h-6 w-6" />
                        </div>
                        <span className="text-[10px] font-black uppercase text-blue-500 bg-blue-500/10 px-2 py-1 rounded-md tracking-tighter">Profit Margin</span>
                    </div>
                    <p className="text-muted-foreground text-sm font-bold mb-1 uppercase tracking-widest">Persentase Margin</p>
                    <h3 className="text-2xl font-black text-foreground">{financeData?.summary.margin_percent || 0}%</h3>
                </div>
            </div>

            {/* Financial Pots Section */}
            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
                        <Wallet className="h-6 w-6 text-primary" /> Alokasi 3 Kantong Saving
                    </h2>
                    <button
                        onClick={openAllocationModal}
                        className="text-xs font-bold text-primary hover:underline flex items-center gap-1.5"
                    >
                        <Settings className="h-4 w-4" /> Atur % Alokasi
                    </button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {savingPots.map((pot) => (
                        <div key={pot.id} className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-3xl p-6 flex flex-col justify-between group hover:border-primary/20 transition-all">
                            <div>
                                <div className="flex justify-between items-center mb-6">
                                    <div className={`p-3 rounded-2xl ${getPotColor(pot.color)}`}>
                                        {getPotIcon(pot.slug)}
                                    </div>
                                    <span className="text-xs font-black text-muted-foreground bg-[#222] px-3 py-1 rounded-full border border-[#333]">
                                        Alokasi: {Number(pot.allocation_percent)}%
                                    </span>
                                </div>
                                <h3 className="text-xl font-black text-foreground mb-1">{pot.name}</h3>
                                <p className="text-xs text-muted-foreground leading-relaxed h-8 line-clamp-2">{pot.description}</p>
                            </div>

                            <div className="mt-8">
                                <div className="flex justify-between items-end mb-3">
                                    <span className="text-3xl font-black text-foreground">{formatCurrency(pot.balance)}</span>
                                    <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-1.5">Saldo Tersedia</span>
                                </div>
                                <div className="w-full h-1.5 bg-[#2a2a2a] rounded-full overflow-hidden mb-6">
                                    <div
                                        className={`h-full rounded-full transition-all duration-1000 ${getProgressColor(pot.color)}`}
                                        style={{ width: `${Math.min(100, (Number(pot.balance) / 1000000) * 100)}%` }} // arbitrary scale for visual
                                    />
                                </div>
                                <button
                                    onClick={() => openWithdrawModal(pot)}
                                    className="w-full py-3 bg-[#222] border border-[#2a2a2a] text-foreground font-bold rounded-2xl hover:bg-primary hover:text-primary-foreground hover:border-primary transition-all flex items-center justify-center gap-2 text-sm shadow-lg shadow-black/20"
                                >
                                    <Plus className="h-4 w-4" /> Catat Penarikan Dana
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Profit Detail Table */}
            <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-3xl overflow-hidden">
                <div className="p-6 border-b border-[#2a2a2a] flex justify-between items-center bg-[#1e1e1e]">
                    <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
                        <History className="h-5 w-5 text-primary" /> Rincian Profit Per Transaksi
                    </h3>
                    <button className="p-2 text-muted-foreground hover:text-foreground">
                        <Download className="h-4 w-4" />
                    </button>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm whitespace-nowrap">
                        <thead className="bg-[#2a2a2a] text-muted-foreground border-b border-[#333]">
                            <tr>
                                <th className="px-8 py-5 font-bold uppercase tracking-widest text-[10px]">Tanggal</th>
                                <th className="px-8 py-5 font-bold uppercase tracking-widest text-[10px]">Invoice</th>
                                <th className="px-8 py-5 font-bold uppercase tracking-widest text-[10px]">Produk</th>
                                <th className="px-8 py-5 font-bold uppercase tracking-widest text-[10px]">Harga Jual</th>
                                <th className="px-8 py-5 font-bold uppercase tracking-widest text-[10px]">Modal API</th>
                                <th className="px-8 py-5 font-bold uppercase tracking-widest text-[10px] text-green-500">Net Profit</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-[#2a2a2a]">
                            {!isLoading && financeData?.orders.map((o) => (
                                <tr key={o.id} className="hover:bg-[#222] transition-colors group">
                                    <td className="px-8 py-4 text-muted-foreground text-xs">{new Date(o.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}</td>
                                    <td className="px-8 py-4 font-mono text-primary font-bold">{o.invoice_number}</td>
                                    <td className="px-8 py-4 text-foreground font-bold">{o.product_name}</td>
                                    <td className="px-8 py-4 text-foreground">{formatCurrency(o.revenue)}</td>
                                    <td className="px-8 py-4 text-muted-foreground">{formatCurrency(o.modal)}</td>
                                    <td className="px-8 py-4 font-black text-green-500 bg-green-500/5 group-hover:bg-green-500/10 transition-colors">
                                        +{formatCurrency(o.profit)}
                                    </td>
                                </tr>
                            ))}
                            {isLoading && Array.from({ length: 5 }).map((_, i) => (
                                <tr key={i} className="animate-pulse">
                                    <td colSpan={6} className="px-8 py-6 h-12 bg-white/5 border-b border-black/20"></td>
                                </tr>
                            ))}
                            {!isLoading && financeData?.orders.length === 0 && (
                                <tr>
                                    <td colSpan={6} className="px-8 py-20 text-center text-muted-foreground">
                                        <Info className="h-8 w-8 mx-auto mb-4 opacity-20" />
                                        Belum ada data transaksi sukses untuk periode ini.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Withdraw Modal */}
            {isWithdrawModalOpen && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto">
                    <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-3xl w-full max-w-md shadow-2xl scale-in-center">
                        <div className="p-8 border-b border-[#2a2a2a]">
                            <h2 className="text-2xl font-black text-foreground mb-1">Catat Penarikan</h2>
                            <p className="text-sm text-muted-foreground">Mengurangi saldo <span className="text-primary font-bold">{withdrawData.potName}</span></p>
                        </div>
                        <form onSubmit={handleWithdraw} className="p-8 space-y-5">
                            <div>
                                <label className="block text-xs font-black text-muted-foreground uppercase tracking-widest mb-2">Jumlah Penarikan (Rp)</label>
                                <input
                                    type="number"
                                    required
                                    placeholder="Contoh: 50000"
                                    value={withdrawData.amount}
                                    onChange={(e) => setWithdrawData({ ...withdrawData, amount: e.target.value })}
                                    className="w-full bg-[#121212] border border-[#2a2a2a] rounded-2xl py-4 px-5 text-xl font-mono text-foreground focus:outline-none focus:border-primary transition-all"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-black text-muted-foreground uppercase tracking-widest mb-2">Keterangan / Keperluan</label>
                                <textarea
                                    required
                                    placeholder="Misal: Biaya Perpanjang Server, Dana Voucher Promo..."
                                    value={withdrawData.description}
                                    onChange={(e) => setWithdrawData({ ...withdrawData, description: e.target.value })}
                                    className="w-full bg-[#121212] border border-[#2a2a2a] rounded-2xl py-4 px-5 text-sm text-foreground focus:outline-none focus:border-primary transition-all h-24"
                                />
                            </div>

                            <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-2xl p-4 flex gap-3">
                                <Info className="h-5 w-5 text-yellow-500 shrink-0 mt-0.5" />
                                <p className="text-[10px] text-yellow-500 font-bold leading-relaxed uppercase">Saldo akan otomatis didebet setelah kamu klik Konfirmasi. Pastikan saldo pot mencukupi.</p>
                            </div>

                            <div className="flex gap-3 pt-6">
                                <button type="button" onClick={() => setIsWithdrawModalOpen(false)} className="flex-1 py-4 font-bold text-muted-foreground hover:bg-white/5 rounded-2xl transition-all">Batal</button>
                                <button type="submit" className="flex-1 py-4 bg-primary text-primary-foreground font-black rounded-2xl shadow-xl shadow-primary/20 hover:bg-yellow-500 transition-all">Konfirmasi</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Allocation Setting Modal */}
            {isAllocationModalOpen && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto">
                    <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-3xl w-full max-w-md shadow-2xl scale-in-center">
                        <div className="p-8 border-b border-[#2a2a2a]">
                            <h2 className="text-2xl font-black text-foreground mb-1">Set Persentase Alokasi</h2>
                            <p className="text-sm text-muted-foreground">Total dari semua pot harus <span className="text-primary font-bold">100%</span></p>
                        </div>
                        <form onSubmit={handleAllocationSubmit} className="p-8 space-y-6">
                            <div className="space-y-4">
                                {tempAllocations.map((alloc, idx) => (
                                    <div key={alloc.id} className="flex items-center gap-4 bg-[#121212] p-4 rounded-2xl border border-[#2a2a2a]">
                                        <div className="flex-1 text-sm font-bold text-foreground">{alloc.name}</div>
                                        <div className="flex items-center gap-2">
                                            <input
                                                type="number"
                                                step="0.01"
                                                value={alloc.allocation_percent}
                                                onChange={(e) => {
                                                    const newList = [...tempAllocations];
                                                    newList[idx].allocation_percent = e.target.value;
                                                    setTempAllocations(newList);
                                                }}
                                                className="w-20 bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl py-2 px-3 text-center text-sm font-bold text-primary focus:outline-none focus:border-primary"
                                            />
                                            <span className="text-xs font-bold text-muted-foreground">%</span>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className={`p-4 rounded-2xl flex items-center justify-between font-black ${Math.abs(tempAllocations.reduce((s, a) => s + Number(a.allocation_percent), 0) - 100) < 0.01
                                    ? 'bg-green-500/10 text-green-500'
                                    : 'bg-red-500/10 text-red-500'
                                }`}>
                                <span className="text-xs uppercase tracking-widest">Total Saat Ini:</span>
                                <span>{tempAllocations.reduce((s, a) => s + Number(a.allocation_percent), 0).toFixed(2)}%</span>
                            </div>

                            <div className="flex gap-3 pt-4">
                                <button type="button" onClick={() => setIsAllocationModalOpen(false)} className="flex-1 py-4 font-bold text-muted-foreground hover:bg-white/5 rounded-2xl transition-all">Batal</button>
                                <button
                                    type="submit"
                                    disabled={Math.abs(tempAllocations.reduce((s, a) => s + Number(a.allocation_percent), 0) - 100) > 0.01}
                                    className="flex-1 py-4 bg-primary text-primary-foreground font-black rounded-2xl shadow-xl shadow-primary/20 hover:bg-yellow-500 transition-all disabled:opacity-30"
                                >
                                    Terapkan
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
