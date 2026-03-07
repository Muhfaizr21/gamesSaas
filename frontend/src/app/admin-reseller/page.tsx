"use client";

import { useEffect, useState } from "react";
import { Users, ShoppingCart, DollarSign, TrendingUp, Clock, CheckCircle, Wallet, Store } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

export default function ResellerDashboardPage() {
    const { token, user } = useAuth();
    const [stats, setStats] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            if (!token) return;
            try {
                // Endpoint ini secara otomatis membaca x-tenant dari domain/localStorage dan me-resolve koneksi database ke toko reseller.
                // adminController.js -> getDashboardStats()
                const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/dashboard`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (res.ok) {
                    const data = await res.json();
                    setStats(data);
                }
            } catch (error) {
                console.error("Failed to fetch dashboard stats", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchStats();
    }, [token]);

    const [analytics, setAnalytics] = useState<any[]>([]);
    useEffect(() => {
        const fetchAnalytics = async () => {
            if (!token) return;
            try {
                const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/analytics`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (res.ok) setAnalytics(await res.json());
            } catch (e) { console.error(e); }
        };
        fetchAnalytics();
    }, [token]);

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(amount);
    };

    if (isLoading) {
        return <div className="text-muted-foreground animate-pulse p-8">Memuat data toko...</div>;
    }

    const maxSales = Math.max(...analytics.map(d => Number(d.totalSales)), 1);

    return (
        <div className="space-y-8 pb-12">
            <div>
                <h1 className="text-3xl font-black text-white mb-2 tracking-tight">
                    Dashboard <span className="text-blue-500">Toko</span>
                </h1>
                <p className="text-zinc-400">Ringkasan performa penjualan dan cuan {user?.name} hari ini.</p>
            </div>

            {/* Stat Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
                <div className="bg-[#0A0A0A] border border-[#1a1a1a] p-6 rounded-2xl relative overflow-hidden group">
                    <div className="flex justify-between items-start mb-4">
                        <div>
                            <p className="text-xs font-bold text-zinc-500 uppercase tracking-wider mb-1">Total Pendapatan</p>
                            <h3 className="text-2xl font-black text-white">{formatCurrency(stats?.totalRevenue || 0)}</h3>
                        </div>
                        <div className="p-3 bg-emerald-500/10 rounded-xl text-emerald-500">
                            <DollarSign className="h-6 w-6" />
                        </div>
                    </div>
                </div>

                <div className="bg-[#0A0A0A] border border-[#1a1a1a] p-6 rounded-2xl relative overflow-hidden group">
                    <div className="flex justify-between items-start mb-4">
                        <div>
                            <p className="text-xs font-bold text-zinc-500 uppercase tracking-wider mb-1">Total Penjualan</p>
                            <h3 className="text-2xl font-black text-white">{stats?.totalOrders || 0} Trx</h3>
                        </div>
                        <div className="p-3 bg-blue-500/10 rounded-xl text-blue-500">
                            <ShoppingCart className="h-6 w-6" />
                        </div>
                    </div>
                </div>

                <div className="bg-[#0A0A0A] border border-[#1a1a1a] p-6 rounded-2xl relative overflow-hidden group">
                    <div className="flex justify-between items-start mb-4">
                        <div>
                            <p className="text-xs font-bold text-zinc-500 uppercase tracking-wider mb-1">Pelanggan Anda</p>
                            <h3 className="text-2xl font-black text-white">{stats?.totalUsers || 0} User</h3>
                        </div>
                        <div className="p-3 bg-purple-500/10 rounded-xl text-purple-500">
                            <Users className="h-6 w-6" />
                        </div>
                    </div>
                </div>

                <div className="bg-[#0f172a] border border-blue-900/50 p-6 rounded-2xl relative overflow-hidden group">
                    <div className="flex justify-between items-start mb-4">
                        <div>
                            <p className="text-xs font-bold text-blue-400 uppercase tracking-wider mb-1 text-shadow-sm">Sisa Saldo Provider</p>
                            <h3 className="text-xl md:text-2xl font-black text-white drop-shadow-md">
                                {stats?.digiflazzBalance !== undefined ? formatCurrency(stats.digiflazzBalance) : 'Rp0,00'}
                            </h3>
                        </div>
                        <div className="p-3 bg-blue-500/20 rounded-xl text-blue-400 border border-blue-500/30">
                            <Wallet className="h-6 w-6" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Analytics Chart */}
            <div className="grid grid-cols-1 gap-6">
                <div className="bg-[#0A0A0A] border border-[#1a1a1a] p-8 rounded-2xl">
                    <div className="flex justify-between items-center mb-10">
                        <h3 className="font-bold text-lg flex items-center gap-2 text-white">
                            <TrendingUp className="w-5 h-5 text-blue-500" /> Tren Omzet (7 Hari Terakhir)
                        </h3>
                    </div>
                    <div className="flex items-end justify-between h-56 gap-3 md:gap-6">
                        {analytics.length > 0 ? analytics.map((d, i) => (
                            <div key={i} className="flex-1 flex flex-col items-center gap-2 group">
                                <div className="text-[10px] sm:text-xs font-bold text-zinc-400 opacity-0 group-hover:opacity-100 transition-opacity mb-2">
                                    {formatCurrency(Number(d.totalSales))}
                                </div>
                                <div
                                    className="w-full bg-gradient-to-t from-blue-500/20 to-blue-500 rounded-t-lg transition-all duration-300 group-hover:brightness-125"
                                    style={{ height: `${(Number(d.totalSales) / maxSales) * 100}%`, minHeight: '8px' }}
                                />
                                <span className="text-[10px] font-semibold text-zinc-500 mt-2 truncate max-w-full uppercase">
                                    {new Date(d.date).toLocaleDateString('id-ID', { weekday: 'short' })}
                                </span>
                            </div>
                        )) : (
                            <div className="w-full h-full flex flex-col items-center justify-center text-zinc-600 gap-3">
                                <Store className="w-8 h-8 opacity-20" />
                                <p className="text-sm">Belum ada data penjualan 7 hari terakhir.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Recent Orders Table */}
            <div className="bg-[#0A0A0A] border border-[#1a1a1a] rounded-2xl overflow-hidden mt-8">
                <div className="p-6 border-b border-[#1a1a1a] flex justify-between items-center bg-[#050505]">
                    <h3 className="text-lg font-bold text-white flex items-center gap-2">
                        <Clock className="h-5 w-5 text-blue-500" /> Transaksi Terkini
                    </h3>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm whitespace-nowrap">
                        <thead className="bg-[#0A0A0A] text-zinc-500 uppercase text-[10px] tracking-widest">
                            <tr>
                                <th className="px-6 py-4 font-black">Tanggal</th>
                                <th className="px-6 py-4 font-black">Invoice</th>
                                <th className="px-6 py-4 font-black">Nominal</th>
                                <th className="px-6 py-4 font-black">Status Bayar</th>
                                <th className="px-6 py-4 font-black">Status Order</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-[#1a1a1a]">
                            {stats?.recentOrders?.length > 0 ? (
                                stats.recentOrders.map((order: any) => (
                                    <tr key={order.id} className="hover:bg-[#111] transition-colors">
                                        <td className="px-6 py-4 text-zinc-400 font-medium">{new Date(order.createdAt).toLocaleDateString('id-ID')}</td>
                                        <td className="px-6 py-4 font-mono text-zinc-200 font-bold">{order.invoice_number}</td>
                                        <td className="px-6 py-4 font-black text-emerald-400">{formatCurrency(order.price)}</td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2.5 py-1 rounded-md text-[10px] uppercase tracking-wider font-black border ${order.payment_status === 'Paid' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' : 'bg-amber-500/10 text-amber-500 border-amber-500/20'}`}>
                                                {order.payment_status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[10px] uppercase tracking-wider font-black w-fit border ${order.order_status === 'Success' ? 'text-blue-400 bg-blue-500/10 border-blue-500/20' : order.order_status === 'Pending' ? 'text-amber-500 bg-amber-500/10 border-amber-500/20' : 'text-rose-500 bg-rose-500/10 border-rose-500/20'}`}>
                                                {order.order_status === 'Success' && <CheckCircle className="h-3 w-3" />}
                                                {order.order_status}
                                            </span>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={5} className="px-6 py-16 text-center text-zinc-600">
                                        <div className="flex flex-col items-center gap-2">
                                            <ShoppingCart className="w-6 h-6 opacity-20 mb-2" />
                                            <p className="text-sm font-medium">Buka lapak, tunggu rezeki masuk.</p>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
