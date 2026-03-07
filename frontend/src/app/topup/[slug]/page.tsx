'use client';

import { useEffect, useState, use } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { Star, Ticket } from 'lucide-react';

export default function TopupDetail({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = use(params);
    const router = useRouter();
    const { user } = useAuth();
    const [voucher, setVoucher] = useState<any>(null);
    const [paymentChannels, setPaymentChannels] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);

    // Form states
    const [userId, setUserId] = useState('');
    const [zoneId, setZoneId] = useState('');
    const [whatsapp, setWhatsapp] = useState('');
    const [selectedProduct, setSelectedProduct] = useState<any>(null);
    const [selectedPayment, setSelectedPayment] = useState('');
    const [usePoints, setUsePoints] = useState(false);
    const [couponCode, setCouponCode] = useState('');
    const [appliedCoupon, setAppliedCoupon] = useState<any>(null);
    const [couponMessage, setCouponMessage] = useState({ text: '', type: '' });

    useEffect(() => {
        const fetchData = async () => {
            try {
                // Fetch Voucher
                const resVoucher = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/public/vouchers/${slug}`);
                if (resVoucher.ok) {
                    setVoucher(await resVoucher.json());
                } else {
                    router.push('/');
                    return;
                }

                // Fetch Payment Channels
                const resChannels = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/checkout/channels`);
                if (resChannels.ok) {
                    setPaymentChannels(await resChannels.json());
                }
            } catch (error) {
                console.error("Error fetching detail data", error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [slug, router]);

    const validateCouponCode = async () => {
        if (!couponCode.trim()) return;
        if (!selectedProduct) return setCouponMessage({ text: 'Pilih nominal topup dulu', type: 'error' });

        setCouponMessage({ text: 'Mengecek...', type: 'info' });
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/public/promo-codes/validate`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ code: couponCode, product_price: selectedProduct.price_sell })
            });
            const data = await res.json();
            if (data.valid) {
                setAppliedCoupon(data);
                setCouponMessage({ text: data.message, type: 'success' });
            } else {
                setAppliedCoupon(null);
                setCouponMessage({ text: data.message, type: 'error' });
            }
        } catch (error) {
            setCouponMessage({ text: 'Gagal mengecek kupon', type: 'error' });
        }
    };

    const handleCheckout = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!userId.trim()) return alert('Masukkan User ID / No. akun tujuan!');
        if (voucher?.requiresZoneId !== false && !zoneId.trim()) return alert('Masukkan Zone ID / Server!');
        if (!whatsapp.trim()) return alert('Masukkan nomor WhatsApp!');
        if (!selectedProduct) return alert('Pilih nominal topup terlebih dahulu!');
        if (!selectedPayment) return alert('Pilih metode pembayaran!');

        setSubmitting(true);
        try {
            const payload = {
                productId: selectedProduct.id,
                customerId: userId,
                zoneId: zoneId,
                paymentMethod: selectedPayment,
                whatsappNumber: whatsapp,
                promoCode: appliedCoupon ? couponCode : undefined,
                usePoints: usePoints
            };

            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/checkout/create`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            const result = await res.json();
            if (res.ok && result.success) {
                // Redirect to URL pembayaran / Invoice
                if (result.checkout_url) {
                    window.location.href = result.checkout_url;
                } else {
                    router.push(`/invoice/${result.invoice_number}`);
                }
            } else {
                alert(`Gagal membuat pesanan: ${result.message}`);
            }
        } catch (error) {
            console.error("Checkout Error", error);
            alert("Terjadi kesalahan jaringan.");
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-background flex justify-center items-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
        );
    }

    if (!voucher) return null;

    // Group payment channels by type
    const groupedChannels = paymentChannels.reduce((acc, channel) => {
        const type = channel.group || 'Lainnya';
        if (!acc[type]) acc[type] = [];
        acc[type].push(channel);
        return acc;
    }, {});

    return (
        <div className="min-h-screen bg-background pb-16">
            <div className="bg-[#1a1a1a] pb-16 pt-8 border-b border-[#2a2a2a]">
                <div className="container mx-auto px-4 max-w-7xl">
                    <div className="flex flex-col md:flex-row gap-6 md:items-end w-full">
                        <div className="relative w-32 h-32 rounded-2xl overflow-hidden border-4 border-primary/20 shadow-xl shrink-0">
                            <img
                                src={voucher.thumbnail ? (voucher.thumbnail.startsWith('http') ? voucher.thumbnail : `${process.env.NEXT_PUBLIC_API_URL}${voucher.thumbnail}`) : `https://ui-avatars.com/api/?name=${encodeURIComponent(voucher.name)}&background=1a1a1a&color=fff`}
                                alt={voucher.name}
                                referrerPolicy="no-referrer"
                                onError={(e) => { (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${encodeURIComponent(voucher.name)}&background=1a1a1a&color=facc15&bold=true&size=200`; }}
                                className="w-full h-full object-cover"
                            />
                        </div>
                        <div>
                            <h1 className="text-3xl md:text-5xl font-black text-foreground">{voucher.name}</h1>
                            <p className="text-muted-foreground mt-2 font-medium">Topup instan, otomatis masuk, buka 24 jam</p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="container mx-auto px-4 max-w-7xl -mt-8">
                <form onSubmit={handleCheckout} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left Column */}
                    <div className="lg:col-span-2 space-y-6">

                        {/* Box 1: User ID */}
                        <div className="bg-[#121212] border border-[#2a2a2a] rounded-2xl p-6 shadow-sm">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="bg-primary text-black font-black w-8 h-8 rounded-full flex items-center justify-center">1</div>
                                <h2 className="text-xl font-bold text-foreground">Masukkan Data Tujuan</h2>
                            </div>
                            <div className={`grid grid-cols-1 gap-4 ${(voucher as any).requiresZoneId !== false ? 'md:grid-cols-2' : ''}`}>
                                <div>
                                    <label className="block text-sm font-semibold text-muted-foreground mb-2">
                                        {(voucher as any).requiresZoneId === false ? 'No. Akun / Email / User ID *' : 'User ID *'}
                                    </label>
                                    <input
                                        type="text" required
                                        placeholder={(voucher as any).requiresZoneId === false ? 'Ketik No. Akun / Email' : 'Ketik User ID'}
                                        value={userId} onChange={(e) => setUserId(e.target.value)}
                                        className="w-full bg-[#1a1a1a] border border-[#333] rounded-xl py-3 px-4 text-foreground focus:outline-none focus:border-primary transition-colors"
                                    />
                                </div>
                                {(voucher as any).requiresZoneId !== false && (
                                    <div>
                                        <label className="block text-sm font-semibold text-muted-foreground mb-2">Zone ID / Server *</label>
                                        <input
                                            type="text"
                                            placeholder="Zone ID"
                                            value={zoneId} onChange={(e) => setZoneId(e.target.value)}
                                            className="w-full bg-[#1a1a1a] border border-[#333] rounded-xl py-3 px-4 text-foreground focus:outline-none focus:border-primary transition-colors"
                                        />
                                    </div>
                                )}
                            </div>
                            <p className="mt-3 text-xs text-muted-foreground">
                                {(voucher as any).requiresZoneId === false
                                    ? 'Masukkan No. Akun / Email sesuai akun yang terdaftar di platform.'
                                    : 'Petunjuk: Untuk mengetahui User ID & Zone ID, silakan masuk ke profil game Anda.'}
                            </p>
                        </div>

                        {/* Box 2: Nominal */}
                        <div className="bg-[#121212] border border-[#2a2a2a] rounded-2xl p-6 shadow-sm">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="bg-primary text-black font-black w-8 h-8 rounded-full flex items-center justify-center">2</div>
                                <h2 className="text-xl font-bold text-foreground">Pilih Nominal</h2>
                            </div>

                            {voucher.Products && voucher.Products.length > 0 ? (
                                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                                    {voucher.Products.map((p: any) => (
                                        <div
                                            key={p.id}
                                            onClick={() => setSelectedProduct(p)}
                                            className={`cursor-pointer rounded-xl border p-4 transition-all duration-200 flex items-center gap-3 ${selectedProduct?.id === p.id ? 'border-primary bg-primary/10 shadow-[0_0_15px_rgba(250,204,21,0.15)] ring-1 ring-primary' : 'border-[#333] hover:border-primary/50 bg-[#1a1a1a]'}`}
                                        >
                                            {p.image_url && (
                                                <div className="w-10 h-10 relative shrink-0 rounded-lg overflow-hidden border border-[#333] bg-[#222]">
                                                    <img
                                                        src={p.image_url.startsWith('http') ? p.image_url : `${process.env.NEXT_PUBLIC_API_URL}${p.image_url}`}
                                                        alt={p.name}
                                                        referrerPolicy="no-referrer"
                                                        onError={(e) => { (e.target as HTMLImageElement).onerror = null; (e.target as HTMLImageElement).style.display = 'none'; }}
                                                        className="w-full h-full object-cover"
                                                    />
                                                </div>
                                            )}
                                            <div>
                                                <p className="font-bold text-foreground text-sm leading-tight">{p.name}</p>
                                                {voucher.activePromo ? (
                                                    <div className="mt-1">
                                                        <p className="text-primary font-mono text-xs font-black">
                                                            Rp {(Number(p.price_sell) * (1 - Number(voucher.activePromo.discount_percentage) / 100)).toLocaleString('id-ID')}
                                                        </p>
                                                        <p className="text-[10px] text-zinc-500 line-through">Rp {Number(p.price_sell).toLocaleString('id-ID')}</p>
                                                    </div>
                                                ) : (
                                                    <p className="text-primary font-mono text-xs mt-1 font-bold">Rp {Number(p.price_sell).toLocaleString('id-ID')}</p>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-8 bg-[#1a1a1a] rounded-xl border border-[#333]">
                                    <p className="text-muted-foreground">Produk sedang tidak tersedia.</p>
                                </div>
                            )}
                        </div>

                        {/* Box 3: Payment */}
                        <div className="bg-[#121212] border border-[#2a2a2a] rounded-2xl p-6 shadow-sm">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="bg-primary text-black font-black w-8 h-8 rounded-full flex items-center justify-center">3</div>
                                <h2 className="text-xl font-bold text-foreground">Pilih Pembayaran</h2>
                            </div>

                            <div className="space-y-6">
                                {Object.keys(groupedChannels).length > 0 ? (
                                    Object.keys(groupedChannels).map(group => (
                                        <div key={group}>
                                            <h3 className="text-muted-foreground font-semibold mb-3">{group}</h3>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                                {groupedChannels[group].map((channel: any) => (
                                                    <div
                                                        key={channel.code}
                                                        onClick={() => {
                                                            if (channel.active) setSelectedPayment(channel.code);
                                                        }}
                                                        className={`flex items-center justify-between p-4 rounded-xl border transition-all ${!channel.active ? 'opacity-50 cursor-not-allowed border-[#333] bg-[#1a1a1a]' :
                                                            selectedPayment === channel.code ? 'border-primary bg-primary/10 cursor-pointer ring-1 ring-primary' : 'border-[#333] hover:border-[#555] cursor-pointer bg-[#1a1a1a]'
                                                            }`}
                                                    >
                                                        <div>
                                                            <p className="font-bold text-foreground">{channel.name}</p>
                                                            {/* fee mock */}
                                                        </div>
                                                        <div className="w-16 h-8 relative opacity-80">
                                                            {/* Tripay gives icon_url or we mapped it */}
                                                            {channel.icon_url && (
                                                                <Image src={channel.icon_url} alt={channel.name} fill className="object-contain" />
                                                            )}
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="bg-[#1a1a1a] border border-[#333] rounded-xl p-4 text-center">
                                        <p className="text-muted-foreground text-sm">Metode pembayaran belum dikonfigurasi. Pastikan TRIPAY_API_KEY valid.</p>
                                    </div>
                                )}
                            </div>
                        </div>

                    </div>

                    {/* Right Column Checkout */}
                    <div className="space-y-6">
                        <div className="bg-[#121212] flex flex-col border border-[#2a2a2a] rounded-2xl p-6 shadow-sm sticky top-24">
                            <h2 className="text-xl font-bold text-foreground border-b border-[#2a2a2a] pb-4 mb-4">Informasi Kontak & Beli</h2>

                            <div className="mb-6">
                                <label className="block text-sm font-semibold text-muted-foreground mb-2">WhatsApp *</label>
                                <input
                                    type="text" required
                                    placeholder="0812xxxxxx"
                                    value={whatsapp} onChange={(e) => setWhatsapp(e.target.value)}
                                    className="w-full bg-[#1a1a1a] border border-[#333] rounded-xl py-3 px-4 text-foreground focus:outline-none focus:border-primary transition-colors"
                                />
                                <p className="text-[11px] text-muted-foreground mt-1.5">Bukti pembelian akan dikirim melalui WhatsApp</p>
                            </div>

                            {/* Promo Code Form */}
                            <div className="bg-[#1a1a1a] rounded-xl p-4 border border-[#333] mb-6">
                                <label className="block text-sm font-semibold text-muted-foreground mb-2 flex items-center gap-2"><Ticket className="h-4 w-4" /> Punya Kode Promo?</label>
                                <div className="flex gap-2">
                                    <input
                                        type="text"
                                        placeholder="Ketik kode (opsional)"
                                        value={couponCode} onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                                        className="w-full bg-[#0a0a0a] border border-[#333] rounded-lg py-2 px-3 text-sm text-foreground focus:outline-none focus:border-primary transition-colors uppercase placeholder-zinc-600"
                                        disabled={!!appliedCoupon}
                                    />
                                    {appliedCoupon ? (
                                        <button type="button" onClick={() => { setAppliedCoupon(null); setCouponCode(''); setCouponMessage({ text: '', type: '' }) }} className="bg-red-500/10 text-red-500 px-3 py-2 rounded-lg text-sm font-bold hover:bg-red-500 hover:text-white transition">Hapus</button>
                                    ) : (
                                        <button type="button" onClick={validateCouponCode} className="bg-primary/20 text-primary px-3 py-2 rounded-lg text-sm font-bold hover:bg-primary hover:text-black transition">Pakai</button>
                                    )}
                                </div>
                                {couponMessage.text && (
                                    <p className={`text-xs mt-2 ${couponMessage.type === 'success' ? 'text-green-400' : couponMessage.type === 'error' ? 'text-red-400' : 'text-zinc-400'}`}>
                                        {couponMessage.text}
                                    </p>
                                )}
                            </div>

                            <div className="bg-[#1a1a1a] rounded-xl p-4 border border-[#333] mb-6 space-y-2">
                                <div className="flex justify-between text-sm">
                                    <span className="text-muted-foreground">Item</span>
                                    <span className="font-semibold text-foreground truncate max-w-[150px]">{selectedProduct ? selectedProduct.name : '-'}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-muted-foreground">Harga</span>
                                    <span className="font-semibold text-foreground">Rp {selectedProduct ? Number(selectedProduct.price_sell).toLocaleString('id-ID') : '0'}</span>
                                </div>
                                <div className="flex justify-between text-sm border-b border-[#333] pb-2">
                                    <span className="text-muted-foreground">Biaya Admin</span>
                                    <span className="font-semibold text-foreground">Rp {selectedProduct ? '1.000' : '0'}</span>
                                </div>

                                {/* Points Logic Start */}
                                {user && user.points > 0 && (
                                    <div className="flex items-center justify-between pt-2 pb-2 border-b border-[#333]">
                                        <div>
                                            <span className="text-sm font-bold text-yellow-400 flex items-center gap-1.5"><Star className="h-3 w-3 fill-current" /> Poin Kamu ({user.points.toLocaleString('id-ID')})</span>
                                            <p className="text-[10px] text-zinc-500">Bisa dipakai untuk potong harga.</p>
                                        </div>
                                        <label className="relative inline-flex items-center cursor-pointer">
                                            <input type="checkbox" className="sr-only peer" checked={usePoints} onChange={(e) => setUsePoints(e.target.checked)} />
                                            <div className="w-9 h-5 bg-zinc-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-primary"></div>
                                        </label>
                                    </div>
                                )}

                                {usePoints && user && (
                                    <div className="flex justify-between text-sm text-yellow-400 font-bold">
                                        <span>Diskon Poin</span>
                                        <span>- Rp {Math.min(user.points, (selectedProduct ? Number(selectedProduct.price_sell) + 1000 - 10000 : 0) > 0 ? (Number(selectedProduct.price_sell) + 1000 - 10000) : user.points).toLocaleString('id-ID')}</span>
                                    </div>
                                )}
                                {/* Coupon Logic Start */}
                                {appliedCoupon && (
                                    <div className="flex justify-between text-sm text-green-400 font-bold border-b border-[#333] pb-2">
                                        <span>Diskon Kupon</span>
                                        <span>- Rp {appliedCoupon.discount_amount.toLocaleString('id-ID')}</span>
                                    </div>
                                )}
                                {voucher.activePromo && selectedProduct && (
                                    <div className="flex justify-between text-sm text-red-500 font-bold border-b border-[#333] pb-2">
                                        <span className="flex items-center gap-1.5 animate-pulse">⚡ Flash Sale</span>
                                        <span>- Rp {((Number(selectedProduct.price_sell) * Number(voucher.activePromo.discount_percentage)) / 100).toLocaleString('id-ID')}</span>
                                    </div>
                                )}
                                {/* Coupon Logic End */}

                                <div className="flex justify-between pt-1">
                                    <span className="font-bold text-foreground">Total Pembayaran</span>
                                    <span className="font-bold text-primary text-lg">Rp {selectedProduct ? (() => {
                                        let price = Number(selectedProduct.price_sell);
                                        let subtotal = price + 1000;

                                        // Apply Active Promo Discount
                                        if (voucher.activePromo) {
                                            const promoDiscount = (price * Number(voucher.activePromo.discount_percentage)) / 100;
                                            subtotal -= promoDiscount;
                                        }

                                        if (appliedCoupon) {
                                            subtotal -= appliedCoupon.discount_amount;
                                        }
                                        if (usePoints && user) {
                                            let ptsDisc = user.points;
                                            if (subtotal - ptsDisc < 10000) ptsDisc = subtotal - 10000;
                                            if (ptsDisc < 0) ptsDisc = 0;
                                            subtotal -= ptsDisc;
                                        }
                                        return subtotal > 0 ? subtotal : 0;
                                    })().toLocaleString('id-ID') : '0'}</span>
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={submitting || !selectedProduct || !selectedPayment || !userId.trim() || !zoneId.trim() || !whatsapp.trim()}
                                className="w-full bg-primary hover:bg-yellow-500 text-primary-foreground font-black py-4 rounded-xl transition-all shadow-lg shadow-primary/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                            >
                                {submitting ? (
                                    <span className="flex items-center gap-2"><div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> Memproses...</span>
                                ) : (
                                    "BELI SEKARANG"
                                )}
                            </button>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
}
