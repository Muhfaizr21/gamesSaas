"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { Search, History, CheckCircle, Clock } from "lucide-react";

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
    createdAt: string;
}

export default function AdminPesananPage() {
    const { token } = useAuth();
    const [orders, setOrders] = useState<Order[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");

    const fetchOrders = async () => {
        if (!token) return;
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/orders`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                const data = await res.json();
                setOrders(data);
            }
        } catch (error) {
            console.error("Failed to fetch orders", error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchOrders();
    }, [token]);

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(amount);
    };

    const handleStatusChange = async (orderId: number, currentOrderSt: string, currentPaySt: string) => {
        const orderSt = prompt("Pilih Status Pesanan (Pending / Processing / Success / Failed):", currentOrderSt);
        if (!orderSt) return;

        const paySt = prompt("Pilih Status Pembayaran (Unpaid / Paid / Failed / Refunded):", currentPaySt);
        if (!paySt) return;

        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/orders/${orderId}/status`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ order_status: orderSt, payment_status: paySt })
            });

            if (res.ok) {
                fetchOrders();
            } else {
                alert("Gagal memperbarui status");
            }
        } catch (error) {
            console.error(error);
        }
    };

    const filteredOrders = orders.filter(order =>
        order.invoice_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (order.customer_id && order.customer_id.toLowerCase().includes(searchQuery.toLowerCase()))
    );

    if (isLoading) {
        return <div className="text-muted-foreground animate-pulse">Memuat riwayat transaksi...</div>;
    }

    return (
        <div className="space-y-6 lg:space-y-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-black text-foreground mb-1 tracking-tight">Riwayat <span className="text-primary">Transaksi</span></h1>
                    <p className="text-muted-foreground">Pantau seluruh pembelian produk, ubah status order atau pembayaran.</p>
                </div>

                <div className="relative w-full sm:w-80">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Search className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <input
                        type="text"
                        placeholder="Cari Invoice atau User ID Game..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl py-2.5 pl-10 pr-4 text-foreground text-sm focus:outline-none focus:border-primary transition-colors"
                    />
                </div>
            </div>

            <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-2xl overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm whitespace-nowrap">
                        <thead className="bg-[#222] text-muted-foreground text-xs uppercase tracking-wider">
                            <tr>
                                <th className="px-6 py-4 font-semibold">TANGGAL</th>
                                <th className="px-6 py-4 font-semibold">INVOICE & TARGET</th>
                                <th className="px-6 py-4 font-semibold">HARGA</th>
                                <th className="px-6 py-4 font-semibold text-center">PEMBAYARAN</th>
                                <th className="px-6 py-4 font-semibold text-center">PESANAN</th>
                                <th className="px-6 py-4 font-semibold text-right">AKSI</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-[#2a2a2a]">
                            {filteredOrders.length > 0 ? (
                                filteredOrders.map((order) => (
                                    <tr key={order.id} className="hover:bg-[#222]/50 transition-colors">
                                        <td className="px-6 py-4 text-muted-foreground whitespace-pre-line">
                                            {new Date(order.createdAt).toLocaleString('id-ID').replace(', ', '\n')}
                                        </td>
                                        <td className="px-6 py-4">
                                            <p className="font-bold text-primary mb-1 text-[13px]">{order.invoice_number}</p>
                                            <div className="flex items-center gap-1.5 text-muted-foreground text-xs">
                                                ID: <span className="text-foreground">{order.customer_id}</span>
                                                {order.zone_id && <span>({order.zone_id})</span>}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 font-medium text-foreground">
                                            {formatCurrency(order.price)}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex justify-center">
                                                <span className={`px-2.5 py-1 rounded-md text-[10px] font-bold border uppercase ${order.payment_status === 'Paid' ? 'bg-green-500/10 text-green-500 border-green-500/20' : order.payment_status === 'Failed' ? 'bg-red-500/10 text-red-500 border-red-500/20' : 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20'}`}>
                                                    {order.payment_status}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex justify-center">
                                                <span className={`px-2.5 py-1 rounded-md text-[10px] font-bold border uppercase flex items-center gap-1 ${order.order_status === 'Success' ? 'bg-green-500/10 text-green-500 border-green-500/20' : order.order_status === 'Pending' ? 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20' : 'bg-blue-500/10 text-blue-500 border-blue-500/20'}`}>
                                                    {order.order_status === 'Success' ? <CheckCircle className="h-3 w-3" /> : <Clock className="h-3 w-3" />}
                                                    {order.order_status}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <button
                                                onClick={() => handleStatusChange(order.id, order.order_status, order.payment_status)}
                                                className="px-3 py-1.5 rounded-lg border border-[#333] text-xs font-bold text-muted-foreground hover:bg-[#2a2a2a] hover:text-foreground transition-colors"
                                            >
                                                Ubah Status
                                            </button>
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
                                        <p className="text-muted-foreground text-sm max-w-sm mx-auto">Kami tidak menemukan data transaksi yang sesuai.</p>
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
