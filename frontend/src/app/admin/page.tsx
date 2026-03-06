"use client";

import { useEffect, useState } from "react";
import { Users, ShoppingCart, DollarSign, TrendingUp, Clock, CheckCircle } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

export default function AdminDashboardPage() {
    const { token } = useAuth();
    const [stats, setStats] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            if (!token) return;
            try {
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
        return <div className="text-muted-foreground animate-pulse p-8">Memuat data dashboard...</div>;
    }

    const maxSales = Math.max(...analytics.map(d => Number(d.totalSales)), 1);

    return (
        <div className="space-y-8 pb-12">
            <div>
                <h1 className="text-3xl font-black text-foreground mb-2 tracking-tight">Ikhtisar <span className="text-primary">Admin</span></h1>
                <p className="text-muted-foreground">Ringkasan performa penjualan dan aktivitas pengguna.</p>
            </div>

            {/* Stat Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-[#1a1a1a] border border-[#2a2a2a] p-6 rounded-2xl relative overflow-hidden group">
                    <div className="flex justify-between items-start mb-4">
                        <div>
                            <p className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-1">Total Pendapatan</p>
                            <h3 className="text-2xl font-bold text-foreground">{formatCurrency(stats?.totalRevenue || 0)}</h3>
                        </div>
                        <div className="p-3 bg-primary/10 rounded-xl text-primary">
                            <DollarSign className="h-6 w-6" />
                        </div>
                    </div>
                </div>

                <div className="bg-[#1a1a1a] border border-[#2a2a2a] p-6 rounded-2xl relative overflow-hidden group">
                    <div className="flex justify-between items-start mb-4">
                        <div>
                            <p className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-1">Total Pesanan</p>
                            <h3 className="text-2xl font-bold text-foreground">{stats?.totalOrders || 0} Trx</h3>
                        </div>
                        <div className="p-3 bg-blue-500/10 rounded-xl text-blue-500">
                            <ShoppingCart className="h-6 w-6" />
                        </div>
                    </div>
                </div>

                <div className="bg-[#1a1a1a] border border-[#2a2a2a] p-6 rounded-2xl relative overflow-hidden group">
                    <div className="flex justify-between items-start mb-4">
                        <div>
                            <p className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-1">Total Pengguna</p>
                            <h3 className="text-2xl font-bold text-foreground">{stats?.totalUsers || 0} User</h3>
                        </div>
                        <div className="p-3 bg-purple-500/10 rounded-xl text-purple-500">
                            <Users className="h-6 w-6" />
                        </div>
                    </div>
                </div>

                <div className="bg-[#1a1a1a] border border-[#2a2a2a] p-6 rounded-2xl relative overflow-hidden group">
                    <div className="flex justify-between items-start mb-4">
                        <div>
                            <p className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-1">Status Sistem</p>
                            <h3 className="text-2xl font-bold text-green-500">Online</h3>
                        </div>
                        <div className="p-3 bg-green-500/10 rounded-xl text-green-500">
                            <TrendingUp className="h-6 w-6" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Analytics Chart */}
            <div className="grid grid-cols-1 gap-6">
                <div className="bg-[#1a1a1a] border border-[#2a2a2a] p-8 rounded-2xl">
                    <div className="flex justify-between items-center mb-10">
                        <h3 className="font-bold text-lg flex items-center gap-2">
                            <TrendingUp className="w-5 h-5 text-primary" /> Tren Penjualan (7 Hari Terakhir)
                        </h3>
                    </div>
                    <div className="flex items-end justify-between h-48 gap-3 md:gap-6">
                        {analytics.length > 0 ? analytics.map((d, i) => (
                            <div key={i} className="flex-1 flex flex-col items-center gap-2 group">
                                <div className="text-[10px] text-zinc-500 opacity-0 group-hover:opacity-100 transition-opacity mb-2">
                                    {formatCurrency(Number(d.totalSales))}
                                </div>
                                <div
                                    className="w-full bg-gradient-to-t from-primary/20 to-primary rounded-t-lg transition-all duration-500 hover:brightness-125"
                                    style={{ height: `${(Number(d.totalSales) / maxSales) * 100}%`, minHeight: '4px' }}
                                />
                                <span className="text-[10px] text-zinc-500 mt-2 truncate max-w-full">
                                    {new Date(d.date).toLocaleDateString('id-ID', { weekday: 'short' })}
                                </span>
                            </div>
                        )) : (
                            <div className="w-full h-full flex items-center justify-center text-zinc-600 text-sm">
                                Belum ada data penjualan 7 hari terakhir.
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Recent Orders Table */}
            <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-2xl overflow-hidden mt-8">
                <div className="p-6 border-b border-[#2a2a2a] flex justify-between items-center bg-[#1e1e1e]">
                    <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
                        <Clock className="h-5 w-5 text-primary" /> Pesanan Terbaru
                    </h3>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm whitespace-nowrap">
                        <thead className="bg-[#2a2a2a] text-muted-foreground">
                            <tr>
                                <th className="px-6 py-4 font-semibold">TANGGAL</th>
                                <th className="px-6 py-4 font-semibold">INVOICE</th>
                                <th className="px-6 py-4 font-semibold">HARGA</th>
                                <th className="px-6 py-4 font-semibold">PEMBAYARAN</th>
                                <th className="px-6 py-4 font-semibold">STATUS</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-[#2a2a2a]">
                            {stats?.recentOrders?.length > 0 ? (
                                stats.recentOrders.map((order: any) => (
                                    <tr key={order.id} className="hover:bg-[#222] transition-colors">
                                        <td className="px-6 py-4 text-muted-foreground">{new Date(order.createdAt).toLocaleDateString('id-ID')}</td>
                                        <td className="px-6 py-4 font-mono text-primary font-bold">{order.invoice_number}</td>
                                        <td className="px-6 py-4 font-medium">{formatCurrency(order.price)}</td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2.5 py-1 rounded-md text-xs font-bold border ${order.payment_status === 'Paid' ? 'bg-green-500/10 text-green-500 border-green-500/20' : 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20'}`}>
                                                {order.payment_status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-bold w-fit ${order.order_status === 'Success' ? 'text-green-500' : order.order_status === 'Pending' ? 'text-yellow-500' : 'text-blue-500'}`}>
                                                {order.order_status === 'Success' && <CheckCircle className="h-3 w-3" />}
                                                {order.order_status}
                                            </span>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={5} className="px-6 py-12 text-center text-muted-foreground">
                                        Belum ada data pesanan hari ini.
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
