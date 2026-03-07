import SaaSNavbar from "@/components/reseller/SaaSNavbar";
import Link from "next/link";
import {
    ArrowRight, CheckCircle2, Gamepad2, Globe, Rocket,
    ShieldCheck, Server, Database, BarChart2,
    Star, Clock, TrendingUp, Layers, Package, Headphones, Quote
} from "lucide-react";

const FEATURES = [
    { icon: Rocket, title: "Live Dalam 5 Menit", desc: "Daftar → setting produk → langsung bisa terima order. Tidak perlu server, tidak perlu coding sama sekali.", accent: "#f97316" },
    { icon: Globe, title: "Custom Domain Sendiri", desc: "Pasang domain tokogaming.com milik Anda. Pembeli lihat brand Anda, bukan nama platform kami.", accent: "#38bdf8" },
    { icon: ShieldCheck, title: "Sistem Anti-Rugi", desc: "Saldo hanya terpotong jika item berhasil terkirim ke game. Gagal? Otomatis refund ke wallet Anda.", accent: "#34d399" },
    { icon: Server, title: "Auto-Sync Harga", desc: "Harga modal Digiflazz ter-update real-time. Margin Anda tetap aman meski harga pusat berubah kapan pun.", accent: "#a78bfa" },
    { icon: Database, title: "Database Terisolasi", desc: "Setiap toko punya database sendiri yang terenkripsi. Data transaksi & pelanggan 100% private.", accent: "#fb7185" },
    { icon: BarChart2, title: "Dashboard Analitik", desc: "Pantau omzet harian, produk terlaris, dan histori penarikan saldo dari satu tampilan owner yang clean.", accent: "#fbbf24" },
];

const BASE_PRICES = [
    { game: "Mobile Legends 86 Diamond", market: "Rp 22.000", modal: "Rp 19.450", profit: "Rp 2.550" },
    { game: "Free Fire 720 Diamond", market: "Rp 100.000", modal: "Rp 88.300", profit: "Rp 11.700" },
    { game: "PUBG Mobile 325 UC", market: "Rp 65.000", modal: "Rp 58.100", profit: "Rp 6.900" },
    { game: "Genshin Impact Welkin", market: "Rp 79.000", modal: "Rp 66.500", profit: "Rp 12.500" },
    { game: "Valorant 420 VP", market: "Rp 58.000", modal: "Rp 50.200", profit: "Rp 7.800" },
];

const PLANS = [
    {
        name: "PRO",
        price: "99",
        badge: null,
        desc: "Untuk pemula yang ingin memulai jualan topup game.",
        features: ["Subdomain gratis (.samstore.id)", "500 transaksi/bulan", "Payment gateway standar", "Support via tiket", "Dashboard analitik dasar"],
    },
    {
        name: "LEGEND",
        price: "149",
        badge: "⚡ Paling Laku",
        strikethrough: "Rp 299.000",
        desc: "Paket favorit untuk toko yang sudah berjalan stabil.",
        features: ["Semua fitur PRO +", "Custom domain pribadi", "Transaksi unlimited", "Markup harga dinamis", "Prioritas WA support", "Auto-broadcast promo"],
    },
    {
        name: "SUPREME",
        price: "499",
        badge: null,
        desc: "Skala enterprise — full white-label & advanced features.",
        features: ["Semua fitur LEGEND +", "Aplikasi Android eksklusif", "Hapus semua iklan platform", "Private server layer", "Manager akun dedicated", "SLA uptime 99.9%"],
    },
];

const TESTIMONIALS = [
    { name: "Andi Rahmadhan", store: "AndiGaming.com", text: "Omzet Rp 40 juta bulan lalu, hampir semua autopilot. Sistem Legend-nya bener-bener mengubah cara saya jualan. Wajib coba!", rating: 5 },
    { name: "Siti Julaikha", store: "JuraganDiamond.id", text: "Dulu capek banget kirim diamond manual satu-satu. Sekarang pembeli bayar → langsung masuk game dalam detik. 10/10!", rating: 5 },
    { name: "Bima Arya P.", store: "TopupMurah.id", text: "Harga modal paling murah dibanding kompetitor lain. Margin kita jadi lebih tebal, pelanggan senang harga lebih murah.", rating: 5 },
];

export default function ResellerPage() {
    return (
        <div style={{ backgroundColor: '#07071a', color: '#ffffff', fontFamily: 'Inter, system-ui, sans-serif', overflowX: 'hidden' }}>
            <SaaSNavbar />

            {/* ── HERO ── */}
            <section style={{ position: 'relative', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '120px 24px 80px' }}>
                {/* Glow blobs */}
                <div style={{ position: 'absolute', top: '10%', left: '50%', transform: 'translateX(-50%)', width: 800, height: 600, background: 'radial-gradient(ellipse, rgba(245,200,66,0.12) 0%, transparent 70%)', pointerEvents: 'none' }} />
                <div style={{ position: 'absolute', bottom: 0, right: 0, width: 400, height: 400, background: 'radial-gradient(ellipse, rgba(124,58,237,0.09) 0%, transparent 70%)', pointerEvents: 'none' }} />

                <div style={{ position: 'relative', zIndex: 10, maxWidth: 900, margin: '0 auto', textAlign: 'center' }}>
                    {/* Pill badge */}
                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: 10, padding: '8px 18px', borderRadius: 999, border: '1px solid rgba(245,200,66,0.3)', background: 'rgba(245,200,66,0.06)', marginBottom: 32 }}>
                        <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#f5c842', boxShadow: '0 0 8px #f5c842', flexShrink: 0 }} />
                        <span style={{ fontSize: 13, fontWeight: 700, color: '#f5c842', letterSpacing: '0.1em' }}>PLATFORM TOP UP GAME SaaS #1 INDONESIA</span>
                    </div>

                    {/* Main headline */}
                    <h1 style={{ fontSize: 'clamp(42px, 8vw, 84px)', fontWeight: 900, lineHeight: 1, letterSpacing: '-0.04em', margin: '0 0 16px' }}>
                        Buka Toko Topup
                    </h1>
                    <h1 style={{ fontSize: 'clamp(42px, 8vw, 84px)', fontWeight: 900, lineHeight: 1.05, letterSpacing: '-0.04em', margin: '0 0 28px', background: 'linear-gradient(135deg, #f5c842 0%, #ffeda0 40%, #e07000 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
                        24/7 Otomatis
                    </h1>

                    <p style={{ fontSize: 'clamp(16px, 2.5vw, 20px)', color: '#94a3b8', lineHeight: 1.7, maxWidth: 580, margin: '0 auto 48px' }}>
                        Tidur pun cuan tetap masuk. Tanpa stok produk, tanpa server ribet, tanpa coding.
                        Sistem kami yang bekerja keras — Anda yang nikmati hasilnya.
                    </p>

                    {/* CTA Buttons */}
                    <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 16, marginBottom: 64 }}>
                        <Link href="/reseller/register" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '16px 36px', borderRadius: 999, background: '#f5c842', color: '#07071a', fontWeight: 900, fontSize: 16, textDecoration: 'none', boxShadow: '0 0 40px rgba(245,200,66,0.4)', transition: 'all 0.2s' }}>
                            Mulai Gratis Sekarang <ArrowRight style={{ width: 20, height: 20 }} />
                        </Link>
                        <Link href="#pricing-base" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '16px 36px', borderRadius: 999, border: '1px solid rgba(255,255,255,0.15)', color: '#ffffff', fontWeight: 700, fontSize: 16, textDecoration: 'none', background: 'transparent', transition: 'all 0.2s' }}>
                            Lihat Harga Modal
                        </Link>
                    </div>

                    {/* Stats bar */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 1, borderRadius: 24, overflow: 'hidden', border: '1px solid rgba(255,255,255,0.07)', background: 'rgba(255,255,255,0.04)' }}>
                        {[
                            { val: 'Rp 20M+', label: 'Total Omzet Reseller', icon: <TrendingUp style={{ width: 18, height: 18, color: '#f5c842' }} /> },
                            { val: '1.500+', label: 'Toko Aktif', icon: <Layers style={{ width: 18, height: 18, color: '#f5c842' }} /> },
                            { val: '500K+', label: 'Transaksi Berhasil', icon: <Package style={{ width: 18, height: 18, color: '#f5c842' }} /> },
                            { val: '< 5 det', label: 'Rata-rata Deliver', icon: <Clock style={{ width: 18, height: 18, color: '#f5c842' }} /> },
                        ].map((s, i) => (
                            <div key={i} style={{ background: '#0e0e24', padding: '24px 16px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
                                {s.icon}
                                <div style={{ fontSize: 'clamp(18px, 3vw, 26px)', fontWeight: 900, color: '#ffffff' }}>{s.val}</div>
                                <div style={{ fontSize: 11, color: '#64748b', fontWeight: 600, textAlign: 'center', lineHeight: 1.4 }}>{s.label}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ── TRUST BAR ── */}
            <div style={{ borderTop: '1px solid rgba(255,255,255,0.05)', borderBottom: '1px solid rgba(255,255,255,0.05)', background: '#0e0e24', padding: '24px 24px' }}>
                <div style={{ maxWidth: 800, margin: '0 auto', textAlign: 'center' }}>
                    <p style={{ fontSize: 11, fontWeight: 700, color: '#475569', letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: 16 }}>Terhubung dengan provider resmi</p>
                    <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', alignItems: 'center', gap: '24px 40px' }}>
                        {['DIGIFLAZZ', 'MOONTON', 'RIOT GAMES', 'STEAM', 'PRISMALINK'].map(b => (
                            <span key={b} style={{ fontSize: 13, fontWeight: 900, color: '#475569', letterSpacing: '0.08em' }}>{b}</span>
                        ))}
                    </div>
                </div>
            </div>

            {/* ── FEATURES ── */}
            <section id="features" style={{ padding: '96px 24px' }}>
                <div style={{ maxWidth: 1100, margin: '0 auto' }}>
                    <div style={{ textAlign: 'center', marginBottom: 64 }}>
                        <p style={{ fontSize: 12, fontWeight: 700, color: '#f5c842', letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: 12 }}>Kenapa Memilih Kami?</p>
                        <h2 style={{ fontSize: 'clamp(28px, 5vw, 48px)', fontWeight: 900, letterSpacing: '-0.03em', marginBottom: 16, lineHeight: 1.1 }}>Infrastruktur Kelas Enterprise,<br />Harga Terjangkau</h2>
                        <p style={{ color: '#94a3b8', maxWidth: 480, margin: '0 auto', lineHeight: 1.6 }}>Semua fitur sudah tersedia sejak hari pertama. Tidak ada biaya setup tambahan.</p>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 20 }}>
                        {FEATURES.map((f, i) => (
                            <div key={i} style={{ background: '#0e0e24', border: `1px solid rgba(255,255,255,0.07)`, borderRadius: 24, padding: 32, transition: 'all 0.2s', cursor: 'default' }}>
                                <div style={{ width: 52, height: 52, borderRadius: 16, background: `${f.accent}18`, border: `1px solid ${f.accent}30`, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 20 }}>
                                    <f.icon style={{ width: 24, height: 24, color: f.accent }} />
                                </div>
                                <h3 style={{ fontSize: 17, fontWeight: 700, color: '#ffffff', marginBottom: 8 }}>{f.title}</h3>
                                <p style={{ fontSize: 14, color: '#64748b', lineHeight: 1.6 }}>{f.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ── HARGA MODAL ── */}
            <section id="pricing-base" style={{ padding: '80px 24px', background: '#0a0a18', borderTop: '1px solid rgba(255,255,255,0.05)', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                <div style={{ maxWidth: 900, margin: '0 auto' }}>
                    <div style={{ textAlign: 'center', marginBottom: 56 }}>
                        <p style={{ fontSize: 12, fontWeight: 700, color: '#34d399', letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: 12 }}>Margin Juicy</p>
                        <h2 style={{ fontSize: 'clamp(28px, 5vw, 48px)', fontWeight: 900, letterSpacing: '-0.03em', marginBottom: 12, lineHeight: 1.1 }}>Harga Modal <span style={{ color: '#34d399' }}>Bersaing</span></h2>
                        <p style={{ color: '#94a3b8', maxWidth: 440, margin: '0 auto' }}>Koneksi H2H langsung ke provider resmi. Selisih harganya masuk kantong Anda.</p>
                    </div>
                    <div style={{ borderRadius: 24, border: '1px solid rgba(255,255,255,0.07)', overflow: 'hidden', background: '#0e0e24' }}>
                        <div style={{ overflowX: 'auto' }}>
                            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                <thead>
                                    <tr style={{ background: 'rgba(255,255,255,0.02)', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                                        <th style={{ padding: '16px 24px', textAlign: 'left', fontSize: 11, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Produk</th>
                                        <th style={{ padding: '16px 24px', textAlign: 'left', fontSize: 11, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Harga Pasaran</th>
                                        <th style={{ padding: '16px 24px', textAlign: 'left', fontSize: 11, fontWeight: 700, color: '#f5c842', textTransform: 'uppercase', letterSpacing: '0.1em', background: 'rgba(245,200,66,0.04)' }}>Harga Modal Anda</th>
                                        <th style={{ padding: '16px 24px', textAlign: 'left', fontSize: 11, fontWeight: 700, color: '#34d399', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Margin</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {BASE_PRICES.map((row, i) => (
                                        <tr key={i} style={{ borderBottom: i < BASE_PRICES.length - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none' }}>
                                            <td style={{ padding: '16px 24px' }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                                    <div style={{ width: 36, height: 36, borderRadius: 10, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                                        <Gamepad2 style={{ width: 16, height: 16, color: '#64748b' }} />
                                                    </div>
                                                    <span style={{ fontSize: 14, fontWeight: 600, color: '#e2e8f0' }}>{row.game}</span>
                                                </div>
                                            </td>
                                            <td style={{ padding: '16px 24px', fontSize: 14, color: '#475569', textDecoration: 'line-through' }}>{row.market}</td>
                                            <td style={{ padding: '16px 24px', fontSize: 15, fontWeight: 800, color: '#f5c842', background: 'rgba(245,200,66,0.03)' }}>{row.modal}</td>
                                            <td style={{ padding: '16px 24px', fontSize: 14, fontWeight: 700, color: '#34d399' }}>+{row.profit}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        <div style={{ background: 'rgba(52,211,153,0.05)', borderTop: '1px solid rgba(52,211,153,0.1)', padding: '12px 24px', textAlign: 'center', fontSize: 12, color: '#34d399', fontWeight: 500 }}>
                            *Harga simulasi, mengikuti update harga provider realtime
                        </div>
                    </div>
                </div>
            </section>

            {/* ── PRICING PLANS ── */}
            <section id="pricing-plans" style={{ padding: '96px 24px' }}>
                <div style={{ maxWidth: 1000, margin: '0 auto' }}>
                    <div style={{ textAlign: 'center', marginBottom: 64 }}>
                        <p style={{ fontSize: 12, fontWeight: 700, color: '#f5c842', letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: 12 }}>Pilih Paket</p>
                        <h2 style={{ fontSize: 'clamp(28px, 5vw, 48px)', fontWeight: 900, letterSpacing: '-0.03em', marginBottom: 12, lineHeight: 1.1 }}>Bayar Sekali,<br />Keuntungan Selamanya</h2>
                        <p style={{ color: '#94a3b8', maxWidth: 440, margin: '0 auto' }}>0% komisi per transaksi. 100% keuntungan masuk ke saldo Anda.</p>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 24, alignItems: 'end' }}>
                        {PLANS.map((plan, i) => {
                            const isHighlight = plan.name === 'LEGEND';
                            return (
                                <div key={i} style={{
                                    position: 'relative',
                                    background: isHighlight ? 'linear-gradient(160deg, #1a1500 0%, #0e0e24 60%)' : '#0e0e24',
                                    border: isHighlight ? '2px solid rgba(245,200,66,0.5)' : '1px solid rgba(255,255,255,0.07)',
                                    borderRadius: 28,
                                    padding: '36px 28px',
                                    boxShadow: isHighlight ? '0 0 60px rgba(245,200,66,0.1)' : 'none',
                                    transform: isHighlight ? 'translateY(-8px)' : 'none',
                                }}>
                                    {plan.badge && (
                                        <div style={{ position: 'absolute', top: -16, left: '50%', transform: 'translateX(-50%)', background: '#f5c842', color: '#07071a', fontSize: 12, fontWeight: 900, padding: '6px 16px', borderRadius: 999, whiteSpace: 'nowrap', boxShadow: '0 0 20px rgba(245,200,66,0.5)' }}>
                                            {plan.badge}
                                        </div>
                                    )}
                                    <h3 style={{ fontSize: 18, fontWeight: 900, color: isHighlight ? '#f5c842' : '#ffffff', marginBottom: 8 }}>{plan.name}</h3>
                                    <p style={{ fontSize: 13, color: '#64748b', marginBottom: 24, lineHeight: 1.5 }}>{plan.desc}</p>
                                    {plan.strikethrough && <p style={{ fontSize: 13, color: '#475569', textDecoration: 'line-through', marginBottom: 4 }}>{plan.strikethrough}</p>}
                                    <div style={{ display: 'flex', alignItems: 'flex-end', gap: 4, marginBottom: 28 }}>
                                        <span style={{ fontSize: 42, fontWeight: 900, color: '#ffffff', lineHeight: 1 }}>Rp {plan.price}k</span>
                                        <span style={{ fontSize: 14, color: '#64748b', paddingBottom: 4 }}>/bln</span>
                                    </div>
                                    <div style={{ height: 1, background: 'rgba(255,255,255,0.07)', marginBottom: 24 }} />
                                    <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 28px', display: 'flex', flexDirection: 'column', gap: 12 }}>
                                        {plan.features.map((f, fi) => (
                                            <li key={fi} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, fontSize: 14 }}>
                                                <CheckCircle2 style={{ width: 16, height: 16, marginTop: 2, flexShrink: 0, color: isHighlight ? '#f5c842' : '#475569' }} />
                                                <span style={{ color: isHighlight ? '#cbd5e1' : '#94a3b8' }}>{f}</span>
                                            </li>
                                        ))}
                                    </ul>
                                    <Link
                                        href={`/reseller/register?plan=${plan.name.toLowerCase()}`}
                                        style={{
                                            display: 'block',
                                            width: '100%',
                                            textAlign: 'center',
                                            padding: '14px 24px',
                                            borderRadius: 16,
                                            fontWeight: 800,
                                            fontSize: 14,
                                            textDecoration: 'none',
                                            boxSizing: 'border-box',
                                            background: isHighlight ? '#f5c842' : 'transparent',
                                            color: isHighlight ? '#07071a' : '#ffffff',
                                            border: isHighlight ? 'none' : '1px solid rgba(255,255,255,0.12)',
                                            transition: 'all 0.2s',
                                        }}
                                    >
                                        Mulai Paket {plan.name}
                                    </Link>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </section>

            {/* ── TESTIMONIALS ── */}
            <section id="testimonials" style={{ padding: '80px 24px', background: '#0a0a18', borderTop: '1px solid rgba(255,255,255,0.05)', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                <div style={{ maxWidth: 1000, margin: '0 auto' }}>
                    <div style={{ textAlign: 'center', marginBottom: 56 }}>
                        <h2 style={{ fontSize: 'clamp(28px, 5vw, 48px)', fontWeight: 900, letterSpacing: '-0.03em', marginBottom: 12, lineHeight: 1.1 }}>Kata Reseller Kami</h2>
                        <p style={{ color: '#94a3b8' }}>Mereka sudah membuktikan. Sekarang giliran Anda.</p>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 20 }}>
                        {TESTIMONIALS.map((t, i) => (
                            <div key={i} style={{ position: 'relative', background: '#0e0e24', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 24, padding: 28, overflow: 'hidden' }}>
                                <Quote style={{ position: 'absolute', top: 20, right: 20, width: 40, height: 40, color: 'rgba(255,255,255,0.03)' }} />
                                <div style={{ display: 'flex', gap: 3, marginBottom: 16 }}>
                                    {Array.from({ length: t.rating }).map((_, s) => (
                                        <Star key={s} style={{ width: 16, height: 16, fill: '#f5c842', color: '#f5c842' }} />
                                    ))}
                                </div>
                                <p style={{ fontSize: 14, color: '#cbd5e1', lineHeight: 1.7, marginBottom: 24, fontStyle: 'italic' }}>"{t.text}"</p>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                    <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'rgba(245,200,66,0.1)', border: '1px solid rgba(245,200,66,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, color: '#f5c842', fontSize: 16, flexShrink: 0 }}>
                                        {t.name[0]}
                                    </div>
                                    <div>
                                        <p style={{ fontWeight: 700, color: '#ffffff', fontSize: 14, marginBottom: 2 }}>{t.name}</p>
                                        <p style={{ fontSize: 12, color: '#f5c842', fontWeight: 600 }}>{t.store}</p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ── FINAL CTA ── */}
            <section style={{ padding: '96px 24px', position: 'relative', overflow: 'hidden' }}>
                <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: 700, height: 400, background: 'radial-gradient(ellipse, rgba(245,200,66,0.08) 0%, transparent 70%)', pointerEvents: 'none' }} />
                <div style={{ position: 'relative', zIndex: 10, maxWidth: 700, margin: '0 auto', textAlign: 'center' }}>
                    <h2 style={{ fontSize: 'clamp(32px, 6vw, 60px)', fontWeight: 900, letterSpacing: '-0.03em', lineHeight: 1.1, marginBottom: 20 }}>
                        Masih Ragu?<br /><span style={{ color: '#f5c842' }}>Coba Demo Dulu!</span>
                    </h2>
                    <p style={{ color: '#94a3b8', fontSize: 18, lineHeight: 1.7, marginBottom: 40, maxWidth: 500, margin: '0 auto 40px' }}>
                        Akses panel demo gratis selama 7 hari tanpa perlu kartu kredit. Kami percaya diri dengan produk ini.
                    </p>
                    <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 16 }}>
                        <Link href="/demo" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '16px 32px', borderRadius: 999, border: '1px solid rgba(255,255,255,0.12)', color: '#ffffff', fontWeight: 700, fontSize: 16, textDecoration: 'none', background: 'transparent' }}>
                            <Headphones style={{ width: 20, height: 20 }} /> Lihat Demo Toko
                        </Link>
                        <Link href="/reseller/register" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '16px 36px', borderRadius: 999, background: '#f5c842', color: '#07071a', fontWeight: 900, fontSize: 16, textDecoration: 'none', boxShadow: '0 0 40px rgba(245,200,66,0.4)' }}>
                            Daftar Sekarang Gratis <ArrowRight style={{ width: 20, height: 20 }} />
                        </Link>
                    </div>
                </div>
            </section>

            {/* ── FOOTER MINI ── */}
            <footer style={{ borderTop: '1px solid rgba(255,255,255,0.06)', background: '#0a0a18', padding: '28px 24px' }}>
                <div style={{ maxWidth: 900, margin: '0 auto', display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: 16, fontSize: 13, color: '#475569' }}>
                    <span style={{ fontWeight: 900, color: '#ffffff' }}>SAM<span style={{ color: '#f5c842' }}>SaaS</span></span>
                    <span>© 2025 SAMSTORE. All rights reserved.</span>
                    <div style={{ display: 'flex', gap: 20 }}>
                        <Link href="/privacy" style={{ color: '#475569', textDecoration: 'none' }}>Privasi</Link>
                        <Link href="/terms" style={{ color: '#475569', textDecoration: 'none' }}>Syarat</Link>
                        <Link href="/login" style={{ color: '#475569', textDecoration: 'none' }}>Login Reseller</Link>
                    </div>
                </div>
            </footer>
        </div>
    );
}
