'use client';

import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import {
    Clock, User, ShieldCheck, LogOut, Settings, CreditCard,
    ArrowLeft, CheckCircle2, XCircle, Loader2, AlertCircle, Edit3,
    Phone, Mail, Lock, Eye, EyeOff, Copy, RefreshCw, Gamepad2,
    TrendingUp, Package, Receipt, ChevronRight, Star,
    CircleCheck, Timer, Ban, Gift
} from "lucide-react";
import RatingModal from "@/components/RatingModal";

type TabType = 'profile' | 'transactions' | 'security' | 'spin';


interface Order {
    id: number;
    invoice_number: string;
    customer_id: string;
    price: number;
    total_amount: number;
    payment_status: string;
    order_status: string;
    product_id: number;
    createdAt: string;
    Product?: {
        id: number;
        name: string;
        sku: string;
        Voucher?: { name: string };
    };
    Review?: any;
}

interface BankAccount {
    id: number;
    bank_name: string;
    account_number: string;
    account_name: string;
    bank_type: 'bank' | 'ewallet';
}

const ROLE_LABELS: Record<string, { label: string; color: string; bg: string }> = {
    member: { label: 'Member', color: 'text-blue-400', bg: 'bg-blue-500/20' },
    gold: { label: 'Gold', color: 'text-yellow-400', bg: 'bg-yellow-500/20' },
    platinum: { label: 'Platinum', color: 'text-purple-400', bg: 'bg-purple-500/20' },
    writer: { label: 'Writer', color: 'text-green-400', bg: 'bg-green-500/20' },
    admin: { label: 'Admin', color: 'text-red-400', bg: 'bg-red-500/20' },
};

const ORDER_STATUS_CONFIG: Record<string, { label: string; icon: React.ReactNode; color: string; bg: string }> = {
    Success: { label: 'Sukses', icon: <CircleCheck className="h-4 w-4" />, color: 'text-green-400', bg: 'bg-green-500/15' },
    Pending: { label: 'Pending', icon: <Timer className="h-4 w-4" />, color: 'text-yellow-400', bg: 'bg-yellow-500/15' },
    Processing: { label: 'Diproses', icon: <Loader2 className="h-4 w-4 animate-spin" />, color: 'text-blue-400', bg: 'bg-blue-500/15' },
    Failed: { label: 'Gagal', icon: <Ban className="h-4 w-4" />, color: 'text-red-400', bg: 'bg-red-500/15' },
};

const PAYMENT_STATUS_CONFIG: Record<string, { label: string; color: string }> = {
    Paid: { label: 'Dibayar', color: 'text-green-400' },
    Unpaid: { label: 'Belum Bayar', color: 'text-yellow-400' },
    Failed: { label: 'Gagal', color: 'text-red-400' },
    Refunded: { label: 'Refund', color: 'text-purple-400' },
};

function AlertMessage({ type, message }: { type: 'success' | 'error'; message: string }) {
    return (
        <div className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium mb-4 ${type === 'success' ? 'bg-green-500/15 text-green-400 border border-green-500/20' : 'bg-red-500/15 text-red-400 border border-red-500/20'}`}>
            {type === 'success' ? <CheckCircle2 className="h-4 w-4 shrink-0" /> : <XCircle className="h-4 w-4 shrink-0" />}
            {message}
        </div>
    );
}

export default function DashboardPage() {
    const { user, isLoading, isHydrated, logout, token, updateUser } = useAuth();
    const router = useRouter();
    const [activeTab, setActiveTab] = useState<TabType>('profile');

    // Profile state
    const [profileName, setProfileName] = useState('');
    const [profileEmail, setProfileEmail] = useState('');
    const [profileWa, setProfileWa] = useState('');
    const [profileMsg, setProfileMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
    const [profileLoading, setProfileLoading] = useState(false);

    // Security state
    const [currentPass, setCurrentPass] = useState('');
    const [newPass, setNewPass] = useState('');
    const [confirmPass, setConfirmPass] = useState('');
    const [showCurrent, setShowCurrent] = useState(false);
    const [showNew, setShowNew] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    const [passMsg, setPassMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
    const [passLoading, setPassLoading] = useState(false);

    // Transactions state
    const [orders, setOrders] = useState<Order[]>([]);
    const [orderLoading, setOrderLoading] = useState(false);
    const [orderError, setOrderError] = useState('');

    // Review Modal State
    const [reviewModalOpen, setReviewModalOpen] = useState(false);
    const [selectedReviewOrder, setSelectedReviewOrder] = useState<any>(null);

    // Spin State
    const [prizes, setPrizes] = useState<any[]>([]);
    const [spinLoading, setSpinLoading] = useState(false);
    const [isSpinning, setIsSpinning] = useState(false);
    const [rotation, setRotation] = useState(0);
    const [spinResult, setSpinResult] = useState<any>(null);

    useEffect(() => {
        if (isHydrated && !isLoading && !user) {
            router.push('/login');
        }
    }, [user, isLoading, isHydrated, router]);

    useEffect(() => {
        if (user) {
            setProfileName(user.name || '');
            setProfileEmail(user.email || '');
            setProfileWa(user.whatsapp || '');
        }
    }, [user]);

    const fetchOrders = useCallback(async () => {
        if (!token) return;
        setOrderLoading(true);
        setOrderError('');
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/my-orders`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            const data = await res.json();
            if (res.ok) setOrders(data.orders || []);
            else setOrderError(data.message || 'Gagal memuat transaksi.');
        } catch {
            setOrderError('Gagal terhubung ke server.');
        } finally {
            setOrderLoading(false);
        }
    }, [token]);

    const fetchPrizes = useCallback(async () => {
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/spin-wheel/prizes`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (res.ok) setPrizes(await res.json());
        } catch (error) {
            console.error(error);
        }
    }, [token]);

    useEffect(() => {
        if (activeTab === 'spin' && prizes.length === 0) {
            fetchPrizes();
        }
    }, [activeTab, fetchPrizes, prizes.length]);

    const handleSpinClick = async () => {
        if (!user || (user.tickets || 0) < 1) return alert('Tiket tidak cukup!');
        if (isSpinning) return;
        setSpinLoading(true);
        setSpinResult(null);

        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/spin-wheel`, {
                method: 'POST',
                headers: { Authorization: `Bearer ${token}` }
            });
            const data = await res.json();

            if (res.ok && data.success) {
                // Find index of prize
                const prizeIndex = prizes.findIndex(p => p.id === data.prize_id);
                if (prizeIndex !== -1) {
                    const sliceAngle = 360 / prizes.length;
                    const minRot = 360 * 5; // Putar 5x
                    const randomOffset = Math.floor(Math.random() * (sliceAngle - 10)) + 5;
                    const finalRotation = minRot + (360 - (prizeIndex * sliceAngle)) - randomOffset;

                    setIsSpinning(true);
                    setRotation(r => r + finalRotation);

                    setTimeout(() => {
                        setIsSpinning(false);
                        setSpinResult(data);
                        updateUser({ ...user, tickets: data.remaining_tickets, points: user.points + (data.prize_type === 'points' ? data.prize_value : 0) });
                    }, 5000); // 5s spin duration
                }
            } else {
                alert(data.message || 'Gagal mamutar roda');
            }
        } catch (e) {
            alert('Kesalahan jaringan');
        } finally {
            setSpinLoading(false);
        }
    };

    const handleSaveProfile = async () => {
        if (!profileName.trim()) return setProfileMsg({ type: 'error', text: 'Nama tidak boleh kosong.' });
        setProfileLoading(true);
        setProfileMsg(null);
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/profile`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                body: JSON.stringify({ name: profileName, email: profileEmail, whatsapp: profileWa })
            });
            const data = await res.json();
            if (res.ok) {
                updateUser(data.user);
                setProfileMsg({ type: 'success', text: 'Profil berhasil disimpan!' });
            } else {
                setProfileMsg({ type: 'error', text: data.message || 'Gagal menyimpan profil.' });
            }
        } catch {
            setProfileMsg({ type: 'error', text: 'Gagal terhubung ke server.' });
        } finally {
            setProfileLoading(false);
        }
    };

    const handleChangePassword = async () => {
        if (!currentPass || !newPass || !confirmPass)
            return setPassMsg({ type: 'error', text: 'Semua field wajib diisi.' });
        if (newPass !== confirmPass)
            return setPassMsg({ type: 'error', text: 'Konfirmasi password tidak cocok.' });
        if (newPass.length < 6)
            return setPassMsg({ type: 'error', text: 'Password baru minimal 6 karakter.' });

        setPassLoading(true);
        setPassMsg(null);
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/change-password`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                body: JSON.stringify({ currentPassword: currentPass, newPassword: newPass })
            });
            const data = await res.json();
            if (res.ok) {
                setPassMsg({ type: 'success', text: 'Password berhasil diubah!' });
                setCurrentPass(''); setNewPass(''); setConfirmPass('');
            } else {
                setPassMsg({ type: 'error', text: data.message || 'Gagal mengubah password.' });
            }
        } catch {
            setPassMsg({ type: 'error', text: 'Gagal terhubung ke server.' });
        } finally {
            setPassLoading(false);
        }
    };



    if (!isHydrated || isLoading || !user) {
        return (
            <div className="min-h-screen bg-[#121212] flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
        );
    }

    const roleConfig = ROLE_LABELS[user.role] || ROLE_LABELS.member;
    const joinDate = user.createdAt ? new Date(user.createdAt).toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' }) : '-';

    const TABS = [
        { key: 'profile' as TabType, label: 'Profil Saya', icon: <User className="h-4 w-4" /> },
        { key: 'transactions' as TabType, label: 'Transaksi', icon: <Receipt className="h-4 w-4" /> },
        { key: 'security' as TabType, label: 'Keamanan', icon: <Lock className="h-4 w-4" /> },
        { key: 'spin' as TabType, label: 'Spin to Win', icon: <Gift className="h-4 w-4" /> },
    ];


    const BANK_INFO = [
        { bank: 'BCA', no: '1234567890', name: 'SAM STORE' },
        { bank: 'BRI', no: '0987654321', name: 'SAM STORE' },
        { bank: 'Mandiri', no: '1122334455', name: 'SAM STORE' },
    ];

    const QUICK_AMOUNTS = [10000, 25000, 50000, 100000, 150000, 200000];

    return (
        <div className="min-h-screen bg-[#0e0e0e] py-8">
            <div className="container mx-auto px-4 max-w-6xl">

                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-3xl font-black text-white">Dashboard</h1>
                        <p className="text-sm text-zinc-500 mt-1">Kelola akun dan transaksi kamu</p>
                    </div>
                    <Link href="/" className="flex items-center gap-2 text-sm font-semibold text-zinc-500 hover:text-primary transition-colors group">
                        <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
                        Kembali
                    </Link>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">

                    {/* === SIDEBAR === */}
                    <div className="lg:col-span-1 space-y-4">

                        {/* Avatar Card */}
                        <div className="bg-[#1a1a1a] rounded-2xl border border-[#2a2a2a] p-6 text-center relative overflow-hidden">
                            <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-transparent pointer-events-none" />
                            <div className="relative">
                                <div className="relative h-20 w-20 mx-auto mb-4">
                                    <div className="h-20 w-20 rounded-full bg-gradient-to-tr from-primary via-yellow-400 to-orange-500 flex items-center justify-center text-3xl font-black text-black shadow-[0_0_30px_rgba(250,204,21,0.3)]">
                                        {user.name.charAt(0).toUpperCase()}
                                    </div>
                                    <div className="absolute -bottom-1 -right-1 h-6 w-6 rounded-full bg-green-500 border-2 border-[#1a1a1a] flex items-center justify-center">
                                        <div className="h-2 w-2 rounded-full bg-white animate-pulse" />
                                    </div>
                                </div>
                                <h2 className="text-lg font-bold text-white truncate">{user.name}</h2>
                                <p className="text-xs text-zinc-500 mt-0.5 truncate">{user.email || user.whatsapp}</p>
                                <div className={`inline-flex items-center gap-1.5 mt-3 px-3 py-1 rounded-full text-xs font-bold ${roleConfig.bg} ${roleConfig.color}`}>
                                    <ShieldCheck className="h-3 w-3" />
                                    {roleConfig.label}
                                </div>
                            </div>
                        </div>


                        {/* Nav Menu */}
                        <div className="bg-[#1a1a1a] rounded-2xl border border-[#2a2a2a] p-2 space-y-1">
                            {TABS.map(tab => (
                                <button
                                    key={tab.key}
                                    onClick={() => setActiveTab(tab.key)}
                                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${activeTab === tab.key ? 'bg-primary/15 text-primary border border-primary/20' : 'text-zinc-400 hover:bg-[#252525] hover:text-white'}`}
                                >
                                    {tab.icon}
                                    {tab.label}
                                    {activeTab === tab.key && <ChevronRight className="h-3.5 w-3.5 ml-auto" />}
                                </button>
                            ))}
                            <div className="border-t border-[#2a2a2a] pt-2 mt-2">
                                <button
                                    onClick={logout}
                                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-red-400 hover:bg-red-500/10 transition-all"
                                >
                                    <LogOut className="h-4 w-4" /> Keluar
                                </button>
                            </div>
                        </div>

                        {/* Stats */}
                        <div className="bg-[#1a1a1a] rounded-2xl border border-[#2a2a2a] p-4 space-y-3">
                            <p className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Info Akun</p>
                            <div className="flex items-center gap-3">
                                <div className="h-8 w-8 rounded-lg bg-blue-500/15 flex items-center justify-center">
                                    <Clock className="h-4 w-4 text-blue-400" />
                                </div>
                                <div>
                                    <p className="text-xs text-zinc-500">Bergabung</p>
                                    <p className="text-xs font-bold text-white">{joinDate}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="h-8 w-8 rounded-lg bg-purple-500/15 flex items-center justify-center">
                                    <TrendingUp className="h-4 w-4 text-purple-400" />
                                </div>
                                <div>
                                    <p className="text-xs text-zinc-500">Total Transaksi</p>
                                    <p className="text-xs font-bold text-white">{orders.length} order</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="h-8 w-8 rounded-lg bg-yellow-500/15 flex items-center justify-center">
                                    <Star className="h-4 w-4 text-yellow-400 fill-yellow-400" />
                                </div>
                                <div>
                                    <p className="text-xs text-zinc-500">Poin Loyalty</p>
                                    <p className="text-xs font-bold text-yellow-400">{user.points?.toLocaleString('id-ID') || 0} Pts</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* === MAIN CONTENT === */}
                    <div className="lg:col-span-3">

                        {/* ── TAB: PROFIL ── */}
                        {activeTab === 'profile' && (
                            <div className="bg-[#1a1a1a] rounded-2xl border border-[#2a2a2a] p-8">
                                <div className="flex items-center gap-3 mb-6">
                                    <div className="h-10 w-10 rounded-xl bg-primary/15 flex items-center justify-center">
                                        <Edit3 className="h-5 w-5 text-primary" />
                                    </div>
                                    <div>
                                        <h2 className="text-lg font-bold text-white">Profil Saya</h2>
                                        <p className="text-sm text-zinc-500">Perbarui informasi akun kamu</p>
                                    </div>
                                </div>

                                {profileMsg && <AlertMessage type={profileMsg.type} message={profileMsg.text} />}

                                <div className="space-y-5">
                                    <div>
                                        <label className="block text-sm font-semibold text-zinc-300 mb-2 flex items-center gap-2">
                                            <User className="h-3.5 w-3.5 text-primary" /> Nama Lengkap
                                        </label>
                                        <input
                                            type="text"
                                            value={profileName}
                                            onChange={e => setProfileName(e.target.value)}
                                            placeholder="Masukkan nama lengkap"
                                            className="w-full h-11 px-4 rounded-xl bg-[#121212] border border-[#2a2a2a] text-white text-sm placeholder:text-zinc-600 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/30 transition-all"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-semibold text-zinc-300 mb-2 flex items-center gap-2">
                                            <Mail className="h-3.5 w-3.5 text-primary" /> Email <span className="text-zinc-600 font-normal">(opsional)</span>
                                        </label>
                                        <input
                                            type="email"
                                            value={profileEmail}
                                            onChange={e => setProfileEmail(e.target.value)}
                                            placeholder="contoh@email.com"
                                            className="w-full h-11 px-4 rounded-xl bg-[#121212] border border-[#2a2a2a] text-white text-sm placeholder:text-zinc-600 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/30 transition-all"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-semibold text-zinc-300 mb-2 flex items-center gap-2">
                                            <Phone className="h-3.5 w-3.5 text-primary" /> Nomor WhatsApp
                                        </label>
                                        <input
                                            type="tel"
                                            value={profileWa}
                                            onChange={e => setProfileWa(e.target.value)}
                                            placeholder="08xxxxxxxxxx"
                                            className="w-full h-11 px-4 rounded-xl bg-[#121212] border border-[#2a2a2a] text-white text-sm placeholder:text-zinc-600 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/30 transition-all"
                                        />
                                    </div>

                                    <div className="pt-2">
                                        <button
                                            onClick={handleSaveProfile}
                                            disabled={profileLoading}
                                            className="flex items-center justify-center gap-2 w-full h-11 rounded-xl bg-primary text-black font-bold text-sm hover:bg-yellow-300 disabled:opacity-60 disabled:cursor-not-allowed transition-all shadow-[0_0_20px_rgba(250,204,21,0.2)] hover:shadow-[0_0_30px_rgba(250,204,21,0.35)]"
                                        >
                                            {profileLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
                                            {profileLoading ? 'Menyimpan...' : 'Simpan Perubahan'}
                                        </button>
                                    </div>
                                </div>

                                {/* Member Badge Info */}
                                <div className="mt-8 border-t border-[#2a2a2a] pt-6">
                                    <p className="text-sm font-bold text-zinc-400 mb-4">Level Member</p>
                                    <div className="grid grid-cols-3 gap-3">
                                        {[
                                            { level: 'Member', desc: 'Level awal', active: user.role === 'member', color: 'blue' },
                                            { level: 'Gold', desc: 'Diskon 5%', active: user.role === 'gold', color: 'yellow' },
                                            { level: 'Platinum', desc: 'Diskon 10%', active: user.role === 'platinum', color: 'purple' },
                                        ].map(m => (
                                            <div key={m.level} className={`p-3 rounded-xl border text-center ${m.active ? `border-${m.color}-500/40 bg-${m.color}-500/10` : 'border-[#2a2a2a] bg-[#121212] opacity-50'}`}>
                                                <p className={`text-sm font-bold ${m.active ? `text-${m.color}-400` : 'text-zinc-500'}`}>{m.level}</p>
                                                <p className="text-xs text-zinc-600 mt-0.5">{m.desc}</p>
                                                {m.active && <div className="mt-1.5 text-xs font-bold text-green-400">✓ Aktif</div>}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* ── TAB: TRANSAKSI ── */}
                        {activeTab === 'transactions' && (
                            <div className="bg-[#1a1a1a] rounded-2xl border border-[#2a2a2a] p-8">
                                <div className="flex items-center justify-between mb-6">
                                    <div className="flex items-center gap-3">
                                        <div className="h-10 w-10 rounded-xl bg-blue-500/15 flex items-center justify-center">
                                            <Receipt className="h-5 w-5 text-blue-400" />
                                        </div>
                                        <div>
                                            <h2 className="text-lg font-bold text-white">Riwayat Transaksi</h2>
                                            <p className="text-sm text-zinc-500">{orders.length} transaksi ditemukan</p>
                                        </div>
                                    </div>
                                    <button onClick={fetchOrders} disabled={orderLoading} className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-[#2a2a2a] text-xs font-medium text-zinc-400 hover:text-white hover:border-[#3a3a3a] transition-all">
                                        <RefreshCw className={`h-3.5 w-3.5 ${orderLoading ? 'animate-spin' : ''}`} /> Refresh
                                    </button>
                                </div>

                                {orderLoading ? (
                                    <div className="flex items-center justify-center py-20">
                                        <Loader2 className="h-8 w-8 text-primary animate-spin" />
                                    </div>
                                ) : orderError ? (
                                    <div className="flex flex-col items-center justify-center py-16 text-center">
                                        <AlertCircle className="h-12 w-12 text-red-400 mb-3 opacity-70" />
                                        <p className="text-red-400 font-medium">{orderError}</p>
                                    </div>
                                ) : orders.length === 0 ? (
                                    <div className="flex flex-col items-center justify-center py-20 text-center border-2 border-dashed border-[#2a2a2a] rounded-2xl">
                                        <div className="h-16 w-16 rounded-2xl bg-[#252525] flex items-center justify-center mb-4">
                                            <Package className="h-8 w-8 text-zinc-600" />
                                        </div>
                                        <h4 className="text-white font-bold mb-1">Belum ada transaksi</h4>
                                        <p className="text-sm text-zinc-500 max-w-xs">Kamu belum melakukan topup apapun. Yuk mulai topup game pertamamu!</p>
                                        <Link href="/" className="mt-4 px-5 py-2 rounded-xl bg-primary text-black text-sm font-bold hover:bg-yellow-300 transition-colors">
                                            Topup Sekarang
                                        </Link>
                                    </div>
                                ) : (
                                    <div className="space-y-3">
                                        {orders.map(order => {
                                            const status = ORDER_STATUS_CONFIG[order.order_status] || ORDER_STATUS_CONFIG.Pending;
                                            const payment = PAYMENT_STATUS_CONFIG[order.payment_status] || PAYMENT_STATUS_CONFIG.Unpaid;
                                            const gameName = order.Product?.Voucher?.name || 'Game';
                                            const productName = order.Product?.name || 'Produk';
                                            const date = new Date(order.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });

                                            return (
                                                <div key={order.id} className="flex items-center gap-4 p-4 bg-[#121212] rounded-xl border border-[#252525] hover:border-[#3a3a3a] transition-all group">
                                                    <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-primary/20 to-orange-500/10 flex items-center justify-center shrink-0">
                                                        <Gamepad2 className="h-6 w-6 text-primary" />
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <div className="flex items-start justify-between gap-2">
                                                            <div className="min-w-0">
                                                                <p className="text-sm font-bold text-white truncate">{productName}</p>
                                                                <p className="text-xs text-zinc-500 truncate">{gameName} · {order.invoice_number}</p>
                                                                <p className="text-xs text-zinc-600 mt-0.5">{date}</p>
                                                            </div>
                                                            <div className="text-right shrink-0">
                                                                <p className="text-sm font-black text-white">Rp {Number(order.total_amount).toLocaleString('id-ID')}</p>
                                                                <span className={`text-xs ${payment.color}`}>{payment.label}</span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className="flex flex-col items-end gap-2 shrink-0">
                                                        <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold ${status.bg} ${status.color}`}>
                                                            {status.icon}
                                                            {status.label}
                                                        </div>
                                                        {order.order_status === 'Success' && !order.Review && (
                                                            <button
                                                                onClick={() => {
                                                                    setSelectedReviewOrder({
                                                                        orderId: order.id,
                                                                        productId: order.product_id || order.Product?.id,
                                                                        productName: order.Product?.name || 'Produk'
                                                                    });
                                                                    setReviewModalOpen(true);
                                                                }}
                                                                className="text-[10px] font-bold text-yellow-500 bg-yellow-500/10 hover:bg-yellow-500/20 px-2 py-1 rounded border border-yellow-500/20 transition-colors"
                                                            >
                                                                Beri Ulasan
                                                            </button>
                                                        )}
                                                        {order.Review && (
                                                            <span className="text-[10px] text-zinc-500 flex items-center gap-1"><Star className="h-3 w-3 fill-current text-yellow-500" /> Diulas</span>
                                                        )}
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>
                        )}

                        {/* ── TAB: KEAMANAN ── */}
                        {activeTab === 'security' && (
                            <div className="bg-[#1a1a1a] rounded-2xl border border-[#2a2a2a] p-8">
                                <div className="flex items-center gap-3 mb-6">
                                    <div className="h-10 w-10 rounded-xl bg-red-500/15 flex items-center justify-center">
                                        <Lock className="h-5 w-5 text-red-400" />
                                    </div>
                                    <div>
                                        <h2 className="text-lg font-bold text-white">Keamanan Akun</h2>
                                        <p className="text-sm text-zinc-500">Ubah password untuk menjaga keamanan akun kamu</p>
                                    </div>
                                </div>

                                {passMsg && <AlertMessage type={passMsg.type} message={passMsg.text} />}

                                <div className="space-y-5">
                                    {[
                                        { label: 'Password Saat Ini', val: currentPass, setter: setCurrentPass, show: showCurrent, toggle: () => setShowCurrent(p => !p) },
                                        { label: 'Password Baru', val: newPass, setter: setNewPass, show: showNew, toggle: () => setShowNew(p => !p) },
                                        { label: 'Konfirmasi Password Baru', val: confirmPass, setter: setConfirmPass, show: showConfirm, toggle: () => setShowConfirm(p => !p) },
                                    ].map((field, i) => (
                                        <div key={i}>
                                            <label className="block text-sm font-semibold text-zinc-300 mb-2">{field.label}</label>
                                            <div className="relative">
                                                <input
                                                    type={field.show ? 'text' : 'password'}
                                                    value={field.val}
                                                    onChange={e => field.setter(e.target.value)}
                                                    placeholder="••••••••"
                                                    className="w-full h-11 px-4 pr-11 rounded-xl bg-[#121212] border border-[#2a2a2a] text-white text-sm placeholder:text-zinc-600 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/30 transition-all"
                                                />
                                                <button type="button" onClick={field.toggle} className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white transition-colors">
                                                    {field.show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                                </button>
                                            </div>
                                        </div>
                                    ))}

                                    <div className="bg-[#121212] rounded-xl border border-[#2a2a2a] p-4">
                                        <p className="text-xs font-bold text-zinc-500 mb-2 flex items-center gap-1.5"><AlertCircle className="h-3.5 w-3.5" /> Tips Keamanan</p>
                                        <ul className="space-y-1">
                                            {['Minimal 8 karakter', 'Kombinasi huruf besar & kecil', 'Sertakan angka & simbol', 'Jangan gunakan tanggal lahir'].map(tip => (
                                                <li key={tip} className="text-xs text-zinc-600 flex items-center gap-2">
                                                    <div className="h-1.5 w-1.5 rounded-full bg-zinc-600" /> {tip}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>

                                    <button
                                        onClick={handleChangePassword}
                                        disabled={passLoading}
                                        className="flex items-center justify-center gap-2 w-full h-11 rounded-xl bg-red-500 text-white font-bold text-sm hover:bg-red-400 disabled:opacity-60 disabled:cursor-not-allowed transition-all"
                                    >
                                        {passLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Lock className="h-4 w-4" />}
                                        {passLoading ? 'Menyimpan...' : 'Ubah Password'}
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* ── TAB: SPIN TO WIN ── */}
                        {activeTab === 'spin' && (
                            <div className="bg-[#1a1a1a] rounded-2xl border border-[#2a2a2a] p-8 text-center min-h-[500px] flex flex-col items-center justify-center relative overflow-hidden">
                                <div className="absolute top-0 right-0 p-6 flex flex-col items-end gap-2 z-10">
                                    <div className="bg-yellow-500/10 border border-yellow-500/20 text-yellow-400 px-4 py-2 rounded-xl flex items-center gap-2 font-black shadow-[0_0_15px_rgba(234,179,8,0.15)]">
                                        <Gift className="w-5 h-5" /> {user.tickets || 0} Tiket Gacha
                                    </div>
                                    <p className="text-xs text-zinc-500 text-right max-w-[200px]">Top up minimal Rp 50.000 untuk dapat 1 tiket gratis!</p>
                                </div>

                                <div className="mb-8 relative z-10">
                                    <h2 className="text-3xl font-black text-white mb-2">Roda Keberuntungan</h2>
                                    <p className="text-zinc-400">Putar roda dan menangkan saldo poin gratis!</p>
                                </div>

                                {prizes.length === 0 ? (
                                    <div className="text-zinc-500">Memuat hadiah roda putar...</div>
                                ) : (
                                    <div className="relative w-[300px] h-[300px] md:w-[400px] md:h-[400px] mb-8">
                                        {/* Jarum penunjuk */}
                                        <div className="absolute -top-4 left-1/2 -translate-x-1/2 z-20 w-8 h-10 overflow-hidden drop-shadow-[0_4px_4px_rgba(0,0,0,0.5)]">
                                            <div className="w-6 h-6 bg-red-500 rotate-45 mx-auto mt-[-10px] border-4 border-[#1a1a1a]" />
                                        </div>

                                        {/* Roda Putar */}
                                        <div
                                            className="w-full h-full rounded-full border-[10px] border-zinc-800 relative overflow-hidden shadow-[0_0_30px_rgba(250,204,21,0.2)] transition-transform ease-[cubic-bezier(0.1,0.7,0.1,1)]"
                                            style={{
                                                transform: `rotate(${rotation}deg)`,
                                                transitionDuration: isSpinning ? '5s' : '0s',
                                                background: `conic-gradient(${prizes.map((p, i) => `${i % 2 === 0 ? '#ea580c' : '#ca8a04'} ${i * (360 / prizes.length)}deg ${(i + 1) * (360 / prizes.length)}deg`).join(', ')})`
                                            }}
                                        >
                                            {prizes.map((prize, i) => {
                                                const rotationAngle = (i * (360 / prizes.length)) + (360 / prizes.length / 2);
                                                return (
                                                    <div
                                                        key={`prize-${i}`}
                                                        className="absolute w-full top-0 left-0 pt-4 text-center text-white font-bold drop-shadow-md origin-center"
                                                        style={{ height: '100%', transform: `rotate(${rotationAngle}deg)` }}
                                                    >
                                                        <span className="inline-block transform px-2 text-sm max-w-[120px] truncate" style={{ textShadow: '0 2px 4px rgba(0,0,0,0.5)' }}>{prize.name}</span>
                                                    </div>
                                                );
                                            })}
                                        </div>

                                        {/* Dot tengah */}
                                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-12 h-12 bg-[#1a1a1a] border-4 border-zinc-800 rounded-full z-10 shadow-inner flex items-center justify-center">
                                            <div className="w-4 h-4 rounded-full bg-primary/80" />
                                        </div>
                                    </div>
                                )}

                                <button
                                    onClick={handleSpinClick}
                                    disabled={isSpinning || spinLoading || !user || (user.tickets || 0) < 1}
                                    className="bg-primary hover:bg-primary/90 text-black font-black text-xl px-12 py-4 rounded-full shadow-[0_0_30px_rgba(250,204,21,0.3)] disabled:opacity-50 disabled:cursor-not-allowed transition transform active:scale-95"
                                >
                                    {isSpinning ? 'Memutar...' : spinLoading ? 'Menyiapkan...' : 'PUTAR SEKARANG'}
                                </button>

                                {spinResult && (
                                    <div className="fixed inset-0 bg-black/80 z-[100] flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in duration-300">
                                        <div className="bg-[#1a1a1a] border border-primary/30 p-8 rounded-3xl w-full max-w-sm text-center shadow-[0_0_50px_rgba(250,204,21,0.2)]">
                                            <div className="w-20 h-20 bg-primary/20 rounded-full mx-auto mb-6 flex items-center justify-center">
                                                <Gift className="w-10 h-10 text-primary" />
                                            </div>
                                            <h3 className="text-2xl font-black text-white mb-2">
                                                {spinResult.prize_type === 'zonk' ? 'Yah Sayang Sekali' : 'Selamat!'}
                                            </h3>
                                            <p className="text-zinc-400 mb-6 font-medium">
                                                Kamu mendapatkan <span className="text-primary font-bold text-lg">{spinResult.prize_name}</span>
                                            </p>
                                            <button
                                                onClick={() => setSpinResult(null)}
                                                className="w-full bg-zinc-800 text-white font-bold py-3 rounded-xl border border-zinc-700 hover:bg-zinc-700 transition"
                                            >
                                                Tutup & Coba Lagi
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}

                    </div>
                </div>
            </div>

            {selectedReviewOrder && (
                <RatingModal
                    isOpen={reviewModalOpen}
                    onClose={() => setReviewModalOpen(false)}
                    orderId={selectedReviewOrder.orderId}
                    productId={selectedReviewOrder.productId}
                    productName={selectedReviewOrder.productName}
                    onSuccess={() => {
                        fetchOrders();
                        fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/me`, { headers: { Authorization: `Bearer ${token}` } })
                            .then(res => res.json())
                            .then(data => { if (data.user) updateUser(data.user) });
                    }}
                />
            )}
        </div>
    );
}
