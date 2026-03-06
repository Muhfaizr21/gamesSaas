'use client';

import { useEffect, useState, use } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

export default function InvoicePage({ params }: { params: Promise<{ orderId: string }> }) {
    const { orderId } = use(params);
    const router = useRouter();
    const [order, setOrder] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchOrder = async () => {
            try {
                const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/checkout/${orderId}`);
                if (res.ok) {
                    setOrder(await res.json());
                } else {
                    router.push('/');
                }
            } catch (error) {
                console.error('Fetch invoice error', error);
            } finally {
                setLoading(false);
            }
        };

        fetchOrder();

        // Polling status per 10 detik jika belum lunas
        const interval = setInterval(() => {
            if (order && order.payment_status === 'Unpaid') {
                fetchOrder();
            }
        }, 10000);

        return () => clearInterval(interval);
    }, [orderId, order?.payment_status, router]);

    if (loading) {
        return (
            <div className="min-h-screen bg-background flex justify-center items-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
        );
    }

    if (!order) return null;

    const isPaid = order.payment_status === 'Paid';
    const isFailed = order.payment_status === 'Failed' || order.order_status === 'Failed';
    const isSuccess = order.order_status === 'Success';

    return (
        <div className="min-h-screen bg-background py-16">
            <div className="container mx-auto px-4 max-w-3xl">
                <div className="bg-[#121212] border border-[#2a2a2a] rounded-3xl overflow-hidden shadow-2xl">

                    {/* Header */}
                    <div className="bg-[#1a1a1a] p-8 border-b border-[#2a2a2a] text-center">
                        <h1 className="text-2xl font-black text-foreground mb-2">Detail Pesanan</h1>
                        <p className="font-mono text-primary text-lg font-bold">{order.invoice_number}</p>
                    </div>

                    {/* Content */}
                    <div className="p-8 space-y-8">
                        {/* Status Alert */}
                        {isPaid ? (
                            isSuccess ? (
                                <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-4 flex items-center gap-4">
                                    <div className="w-12 h-12 bg-green-500/20 text-green-500 flex items-center justify-center rounded-full text-2xl">✓</div>
                                    <div>
                                        <h3 className="font-bold text-green-500">Transaksi Berhasil!</h3>
                                        <p className="text-sm text-green-500/80 mt-1">Sistem kami telah berhasil mengirimkan pesanan ke ID tujuan Anda.</p>
                                    </div>
                                </div>
                            ) : (
                                <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4 flex items-center gap-4">
                                    <div className="w-12 h-12 bg-blue-500/20 text-blue-500 flex items-center justify-center rounded-full text-2xl animate-spin">⚪</div>
                                    <div>
                                        <h3 className="font-bold text-blue-500">Pembayaran Diterima</h3>
                                        <p className="text-sm text-blue-500/80 mt-1">Kami sedang memproses pesanan Anda. Mohon tunggu beberapa saat.</p>
                                    </div>
                                </div>
                            )
                        ) : isFailed ? (
                            <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 flex items-center gap-4">
                                <div className="w-12 h-12 bg-red-500/20 text-red-500 flex items-center justify-center rounded-full text-2xl">✕</div>
                                <div>
                                    <h3 className="font-bold text-red-500">Transaksi Dibatalkan / Gagal</h3>
                                    <p className="text-sm text-red-500/80 mt-1">Waktu pembayaran telah habis atau pesanan dibatalkan sistem.</p>
                                </div>
                            </div>
                        ) : (
                            <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-xl p-6 text-center">
                                <h3 className="font-bold text-yellow-500 mb-2">Menunggu Pembayaran</h3>
                                <p className="text-sm text-yellow-500/80 mb-6">Segera selesaikan pembayaran agar pesanan dapat diproses.</p>

                                {order.payment_url && (
                                    <a
                                        href={order.payment_url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="inline-block bg-primary text-primary-foreground font-black px-8 py-3 rounded-xl hover:bg-yellow-500 transition-colors shadow-lg shadow-primary/20"
                                    >
                                        Buka Cara Pembayaran
                                    </a>
                                )}
                            </div>
                        )}

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            {/* Rincian Produk */}
                            <div className="space-y-4">
                                <h3 className="font-bold text-muted-foreground uppercase text-sm tracking-wider border-b border-[#2a2a2a] pb-2">Rincian Item</h3>

                                <div className="flex gap-4 items-center bg-[#1a1a1a] p-4 rounded-xl border border-[#2a2a2a]">
                                    <div className="w-16 h-16 relative rounded-lg overflow-hidden shrink-0">
                                        <Image
                                            src={order.Product?.Voucher?.thumbnail || `/images/fallback.png`}
                                            alt="Game Thumbnail" fill className="object-cover"
                                        />
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-foreground text-lg">{order.Product?.name}</h4>
                                        <p className="text-muted-foreground text-sm">{order.Product?.Voucher?.name}</p>
                                    </div>
                                </div>

                                <div className="bg-[#1a1a1a] rounded-xl p-4 border border-[#2a2a2a] space-y-3">
                                    <div className="flex justify-between items-center text-sm">
                                        <span className="text-muted-foreground">User ID</span>
                                        <span className="font-bold text-foreground font-mono">{order.customer_id}</span>
                                    </div>
                                    {order.zone_id && (
                                        <div className="flex justify-between items-center text-sm">
                                            <span className="text-muted-foreground">Zone ID</span>
                                            <span className="font-bold text-foreground font-mono">{order.zone_id}</span>
                                        </div>
                                    )}
                                    <div className="flex justify-between items-center text-sm">
                                        <span className="text-muted-foreground">WhatsApp</span>
                                        <span className="font-bold text-foreground">{order.whatsapp_number}</span>
                                    </div>
                                    <div className="flex justify-between items-center text-sm">
                                        <span className="text-muted-foreground">Metode Bayar</span>
                                        <span className="font-bold text-foreground">{order.payment_method || order.payment_channel || 'Lainnya'}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Rincian Harga */}
                            <div className="space-y-4">
                                <h3 className="font-bold text-muted-foreground uppercase text-sm tracking-wider border-b border-[#2a2a2a] pb-2">Rincian Harga</h3>

                                <div className="bg-[#1a1a1a] rounded-xl p-5 border border-[#2a2a2a] space-y-3">
                                    <div className="flex justify-between items-center">
                                        <span className="text-muted-foreground text-sm">Harga Item</span>
                                        <span className="font-semibold text-foreground">Rp {Number(order.price).toLocaleString('id-ID')}</span>
                                    </div>
                                    <div className="flex justify-between items-center border-b border-[#333] pb-3">
                                        <span className="text-muted-foreground text-sm">Biaya Admin (Payment Gateway)</span>
                                        <span className="font-semibold text-foreground">Rp {Number(order.fee).toLocaleString('id-ID')}</span>
                                    </div>
                                    <div className="flex justify-between items-center pt-2">
                                        <span className="font-black text-foreground">Total Tagihan</span>
                                        <span className="font-black text-primary text-2xl">Rp {Number(order.total_amount).toLocaleString('id-ID')}</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                    </div>
                </div>
            </div>
        </div>
    );
}
