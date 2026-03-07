"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { Search, History, CheckCircle, Clock, XCircle, RefreshCw } from "lucide-react";

interface Order {
    id: number;
    invoice_number: string;
    customer_id: string;
    zone_id: string;
    customer_name: string;
    price: number;
    payment_method: string;
    payment_status: string;
    order_status: string;
    provider_order_id: string;
    sn: string;
    createdAt: string;
    Product?: { id: number; name: string; sku: string; };
}

export default function AdminPesananPage() {
    const { token } = useAuth();
    const [orders, setOrders] = useState<Order[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");
    const [checkingId, setCheckingId] = useState<number | null>(null);

    const fetchOrders = async () => {
        if (!token) return;
        try {
            const url = statusFilter !== "all"
                ? `${process.env.NEXT_PUBLIC_API_URL}/api/admin/orders?status=${statusFilter}`
                : `${process.env.NEXT_PUBLIC_API_URL}/api/admin/orders`;
            const res = await fetch(url, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) setOrders(await res.json());
        } catch (error) {
            console.error("Failed to fetch orders", error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => { fetchOrders(); }, [token, statusFilter]);

    const formatCurrency = (amount: number) =>
        new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(amount);

    const handleStatusChange = async (orderId: number, currentOrderSt: string, currentPaySt: string) => {
        const orderSt = prompt("Status Pesanan (Pending / Processing / Success / Failed):", currentOrderSt);
        if (!orderSt) return;
        const paySt = prompt("Status Pembayaran (Unpaid / Paid / Failed / Refunded):", currentPaySt);
        if (!paySt) return;
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/orders/${orderId}/status`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify({ order_status: orderSt, payment_status: paySt })
            });
            if (res.ok) { fetchOrders(); }
            else { alert("Gagal memperbarui status"); }
        } catch (error) { console.error(error); }
    };

    const handleCheckProvider = async (orderId: number) => {
        if (!confirm("Cek status terbaru dari Digiflazz untuk order ini?")) return;
        setCheckingId(orderId);
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/orders/${orderId}/check-provider`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await res.json();
            alert(data.message + (data.sn ? `\nSN: ${data.sn}` : ''));
            fetchOrders();
        } catch (error) {
            alert("Gagal cek status provider.");
        } finally {
            setCheckingId(null);
        }
    };

    const filteredOrders = orders.filter(order =>
        order.invoice_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (order.customer_id && order.customer_id.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (order.Product?.name && order.Product.name.toLowerCase().includes(searchQuery.toLowerCase()))
    );

    const statusBadge = (status: string) => {
        const map: Record<string, string> = {
            Success: 'bg-green-500/10 text-green-500 border-green-500/20',
            Pending: 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20',
            Processing: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
            Failed: 'bg-red-500/10 text-red-500 border-red-500/20',
        };
        return map[status] || 'bg-zinc-500/10 text-zinc-400 border-zinc-500/20';
    };

    if (isLoading) return <div className="text-muted-foreground animate-pulse">Memuat riwayat transaksi...</div>;

    return (
        <div className="space-y-6 lg:space-y-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-black text-foreground mb-1 tracking-tight">Riwayat <span className="text-primary">Transaksi</span></h1>
                    <p className="text-muted-foreground">Pantau seluruh pembelian produk, ubah status order atau pembayaran.</p>
                </div>
                <div className="flex gap-2 flex-wrap">
                    {['all', 'Pending', 'Processing', 'Success', 'Failed'].map(s => (
                        <button key={s} onClick={() => setStatusFilter(s)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-colors ${statusFilter === s ? 'bg-primary text-black border-primary' : 'border-[#333] text-muted-foreground hover:border-primary hover:text-primary'}`}>
                            {s === 'all' ? 'Semua' : s}
                        </button>
                    ))}
                </div>
            </div>

            <div className="relative w-full max-w-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Search className="h-4 w-4 text-muted-foreground" />
                </div>
                <input type="text" placeholder="Cari Invoice, User ID, atau Produk..." value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl py-2.5 pl-10 pr-4 text-foreground text-sm focus:outline-none focus:border-primary transition-colors" />
            </div>

            <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-2xl overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm whitespace-nowrap">
                        <thead className="bg-[#222] text-muted-foreground text-xs uppercase tracking-wider">
                            <tr>
                                <th className="px-5 py-4 font-semibold">TANGGAL</th>
                                <th className="px-5 py-4 font-semibold">INVOICE & TARGET</th>
                                <th className="px-5 py-4 font-semibold">HARGA</th>
                                <th className="px-5 py-4 font-semibold text-center">BAYAR</th>
                                <th className="px-5 py-4 font-semibold text-center">STATUS</th>
                                <th className="px-5 py-4 font-semibold text-right">AKSI</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-[#2a2a2a]">
                            {filteredOrders.length > 0 ? (
                                filteredOrders.map((order) => (
                                    <tr key={order.id} className="hover:bg-[#222]/50 transition-colors">
                                        <td className="px-5 py-4 text-muted-foreground text-xs whitespace-pre-line">
                                            {new Date(order.createdAt).toLocaleString('id-ID').replace(', ', '\n')}
                                        </td>
                                        <td className="px-5 py-4">
                                            <div className="flex flex-col">
                                                <p className="font-bold text-primary mb-0.5 text-[13px]">{order.invoice_number}</p>
                                                <p className="text-white text-xs font-semibold mb-1">{order.Product?.name || 'Produk'}</p>
                                                <div className="flex items-center gap-1.5 text-muted-foreground text-[10px]">
                                                    ID: <span className="text-foreground font-mono">{order.customer_id}</span>
                                                    {order.zone_id && <span className="text-zinc-500">[{order.zone_id}]</span>}
                                                </div>
                                                {order.sn && (
                                                    <div className="mt-1 text-[10px] text-emerald-400 font-mono">SN: {order.sn}</div>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-5 py-4 font-bold text-emerald-400">
                                            {formatCurrency(order.price)}
                                        </td>
                                        <td className="px-5 py-4">
                                            <div className="flex justify-center">
                                                <span className={`px-2.5 py-1 rounded-md text-[10px] font-bold border uppercase ${order.payment_status === 'Paid' ? 'bg-green-500/10 text-green-500 border-green-500/20' : order.payment_status === 'Failed' ? 'bg-red-500/10 text-red-500 border-red-500/20' : 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20'}`}>
                                                    {order.payment_status}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-5 py-4">
                                            <div className="flex justify-center">
                                                <span className={`px-2.5 py-1 rounded-md text-[10px] font-bold border uppercase flex items-center gap-1 ${statusBadge(order.order_status)}`}>
                                                    {order.order_status === 'Success' ? <CheckCircle className="h-3 w-3" /> : order.order_status === 'Failed' ? <XCircle className="h-3 w-3" /> : <Clock className="h-3 w-3" />}
                                                    {order.order_status}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-5 py-4 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                {(order.order_status === 'Processing' || order.order_status === 'Pending') && order.provider_order_id && (
                                                    <button
                                                        onClick={() => handleCheckProvider(order.id)}
                                                        disabled={checkingId === order.id}
                                                        title="Cek status terbaru ke Digiflazz"
                                                        className="px-2.5 py-1.5 rounded-lg border border-blue-500/30 text-[10px] font-bold text-blue-400 hover:bg-blue-500/10 transition-colors flex items-center gap-1 disabled:opacity-50"
                                                    >
                                                        <RefreshCw className={`h-3 w-3 ${checkingId === order.id ? 'animate-spin' : ''}`} />
                                                        Cek
                                                    </button>
                                                )}
                                                <button
                                                    onClick={() => handleStatusChange(order.id, order.order_status, order.payment_status)}
                                                    className="px-3 py-1.5 rounded-lg border border-[#333] text-xs font-bold text-muted-foreground hover:bg-[#2a2a2a] hover:text-foreground transition-colors"
                                                >
                                                    Ubah
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={6} className="px-6 py-16 text-center">
                                        <div className="inline-flex items-center justify-center p-4 bg-[#2a2a2a] rounded-full mb-4">
                                            <History className="h-8 w-8 text-muted-foreground" />
                                        </div>
                                        <p className="text-foreground font-bold mb-1">Tidak Ada Transaksi</p>
                                        <p className="text-muted-foreground text-sm max-w-sm mx-auto">Tidak ada data transaksi yang sesuai filter.</p>
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
