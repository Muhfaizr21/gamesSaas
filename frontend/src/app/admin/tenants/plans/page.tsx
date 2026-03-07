'use client';
import { useState, useEffect, useCallback } from 'react';
import { Plus, Edit, Trash2, ListVideo, Save, X, CheckCircle, Package } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

type SaaSPlan = {
    id: string;
    name: string;
    price: string;
    originalPrice: string | null;
    durationDays: number;
    description: string | null;
    badge: string | null;
    features: string | null; // stored as JSON array string
    isActive: boolean;
};

export default function SaaSPlansPage() {
    const { token } = useAuth();
    const [plans, setPlans] = useState<SaaSPlan[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const [formData, setFormData] = useState({
        id: '',
        name: '',
        price: '',
        originalPrice: '',
        durationDays: 30,
        description: '',
        badge: '',
        features: '',
        isActive: true
    });

    const fetchPlans = useCallback(async () => {
        if (!token) return;
        setLoading(true);
        try {
            const res = await fetch(`${API}/api/superadmin/plans`, { headers: { Authorization: `Bearer ${token}` } });
            if (res.ok) {
                const data = await res.json();
                setPlans(data);
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    }, [token]);

    useEffect(() => {
        if (token) fetchPlans();
    }, [token, fetchPlans]);

    const formatCurrency = (amount: number | string) => {
        return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(Number(amount));
    };

    const handleOpenModal = (plan?: SaaSPlan) => {
        if (plan) {
            setFormData({
                id: plan.id,
                name: plan.name,
                price: Number(plan.price).toString(),
                originalPrice: plan.originalPrice ? Number(plan.originalPrice).toString() : '',
                durationDays: plan.durationDays,
                description: plan.description || '',
                badge: plan.badge || '',
                features: (() => {
                    if (!plan.features) return '';
                    try {
                        const parsed = JSON.parse(plan.features);
                        return Array.isArray(parsed) ? parsed.join('\n') : String(plan.features);
                    } catch (e) {
                        return String(plan.features);
                    }
                })(),
                isActive: plan.isActive
            });
        } else {
            setFormData({
                id: '',
                name: '',
                price: '',
                originalPrice: '',
                durationDays: 30,
                description: '',
                badge: '',
                features: 'Storefront Publik\nDashboard Reseller',
                isActive: true
            });
        }
        setIsModalOpen(true);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        const payload = {
            ...formData,
            features: JSON.stringify(formData.features.split('\n').filter(f => f.trim() !== ''))
        };

        const url = formData.id ? `${API}/api/superadmin/plans/${formData.id}` : `${API}/api/superadmin/plans`;
        const method = formData.id ? 'PUT' : 'POST';

        try {
            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                body: JSON.stringify(payload)
            });
            if (res.ok) {
                await fetchPlans();
                setIsModalOpen(false);
            } else {
                alert('Gagal menyimpan paket');
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: string, name: string) => {
        if (!confirm(`Hapus paket ${name}? Ini tidak membatalkan paket yang sudah dibeli tenant.`)) return;
        setLoading(true);
        try {
            const res = await fetch(`${API}/api/superadmin/plans/${id}`, {
                method: 'DELETE',
                headers: { Authorization: `Bearer ${token}` }
            });
            if (res.ok) await fetchPlans();
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const toggleStatus = async (plan: SaaSPlan) => {
        setLoading(true);
        try {
            const res = await fetch(`${API}/api/superadmin/plans/${plan.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                body: JSON.stringify({ isActive: !plan.isActive })
            });
            if (res.ok) await fetchPlans();
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-6 lg:space-y-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-black text-foreground mb-1 tracking-tight">Paket SaaS</h1>
                    <p className="text-muted-foreground">Kelola harga dan fitur paket langganan reseller (Pro, Supreme, dll).</p>
                </div>
                <button
                    onClick={() => handleOpenModal()}
                    className="flex items-center gap-2 px-5 py-2.5 bg-primary text-primary-foreground font-bold rounded-xl hover:bg-yellow-500 transition-colors shadow-lg shadow-primary/20 w-fit"
                >
                    <Plus className="h-5 w-5" />
                    Buat Paket Baru
                </button>
            </div>

            {loading && plans.length === 0 ? (
                <div className="animate-pulse p-6 bg-[#1a1a1a] rounded-2xl border border-[#2a2a2a] text-muted-foreground">Memuat data paket...</div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    {plans.map(p => {
                        let featuresList: string[] = [];
                        if (p.features) {
                            try {
                                const parsed = JSON.parse(p.features);
                                featuresList = Array.isArray(parsed) ? parsed : [String(p.features)];
                            } catch (e) {
                                featuresList = [String(p.features)];
                            }
                        }
                        return (
                            <div key={p.id} className={`bg-[#1a1a1a] border ${p.isActive ? 'border-[#2a2a2a] hover:border-primary/50' : 'border-red-900/30 opacity-75'} rounded-2xl overflow-hidden transition-all flex flex-col group relative`}>
                                {!p.isActive && (
                                    <div className="absolute top-0 right-0 bg-red-500 text-white text-[10px] font-bold px-3 py-1 rounded-bl-lg z-10">
                                        NONAKTIF
                                    </div>
                                )}
                                {p.badge && (
                                    <div className="absolute -right-12 top-6 bg-primary text-primary-foreground text-xs font-bold px-12 py-1 rotate-45 shadow-lg z-10">
                                        {p.badge}
                                    </div>
                                )}

                                <div className="p-6 border-b border-[#2a2a2a] bg-[#1e1e1e]">
                                    <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center mb-4">
                                        <Package className="h-6 w-6" />
                                    </div>
                                    <h3 className="text-2xl font-black text-foreground mb-1">{p.name}</h3>
                                    <p className="text-sm text-muted-foreground line-clamp-2 min-h-[40px]">{p.description || 'Tidak ada deskripsi'}</p>

                                    <div className="mt-4 flex items-end gap-2">
                                        <span className="text-3xl font-black text-white">{formatCurrency(p.price)}</span>
                                        <span className="text-muted-foreground font-medium mb-1">/{p.durationDays} hari</span>
                                    </div>
                                    {p.originalPrice && (
                                        <div className="text-sm text-zinc-500 line-through font-semibold mt-1">
                                            {formatCurrency(p.originalPrice)}
                                        </div>
                                    )}
                                </div>
                                <div className="p-6 flex-1 flex flex-col">
                                    <ul className="space-y-3 mb-6 flex-1">
                                        {featuresList.map((f: string, i: number) => (
                                            <li key={i} className="flex gap-3 text-sm text-zinc-300">
                                                <CheckCircle className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
                                                <span className="leading-snug">{f}</span>
                                            </li>
                                        ))}
                                    </ul>
                                    <div className="flex gap-2 pt-4 border-t border-[#2a2a2a]">
                                        <button onClick={() => toggleStatus(p)} className={`flex-1 py-2 px-3 rounded-lg font-bold text-sm transition-colors ${p.isActive ? 'bg-amber-500/10 text-amber-500 hover:bg-amber-500/20' : 'bg-green-500/10 text-green-500 hover:bg-green-500/20'}`}>
                                            {p.isActive ? 'Nonaktifkan' : 'Aktifkan'}
                                        </button>
                                        <button onClick={() => handleOpenModal(p)} className="p-2 bg-blue-500/10 text-blue-500 hover:bg-blue-500/20 rounded-lg transition-colors">
                                            <Edit className="h-5 w-5" />
                                        </button>
                                        <button onClick={() => handleDelete(p.id, p.name)} className="p-2 bg-red-500/10 text-red-500 hover:bg-red-500/20 rounded-lg transition-colors">
                                            <Trash2 className="h-5 w-5" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {isModalOpen && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto pt-20 pb-10">
                    <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden my-auto">
                        <div className="p-6 border-b border-[#2a2a2a] flex justify-between items-center">
                            <h2 className="text-xl font-bold text-foreground">{formData.id ? 'Edit Paket' : 'Buat Paket Baru'}</h2>
                            <button onClick={() => setIsModalOpen(false)} className="text-muted-foreground hover:text-white"><X className="w-6 h-6" /></button>
                        </div>
                        <form onSubmit={handleSubmit} className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-semibold text-foreground/90 mb-1.5">Nama Paket (Contoh: Supreme)</label>
                                <input type="text" required value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} className="w-full bg-[#121212] border border-[#2a2a2a] rounded-xl py-2.5 px-4 focus:border-primary" />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-semibold text-foreground/90 mb-1.5">Harga Jual (Rp)</label>
                                    <input type="number" required value={formData.price} onChange={e => setFormData({ ...formData, price: e.target.value })} className="w-full bg-[#121212] border border-[#2a2a2a] rounded-xl py-2.5 px-4 focus:border-primary" />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-foreground/90 mb-1.5">Harga Coret (Rp)</label>
                                    <input type="number" value={formData.originalPrice} onChange={e => setFormData({ ...formData, originalPrice: e.target.value })} className="w-full bg-[#121212] border border-[#2a2a2a] rounded-xl py-2.5 px-4 focus:border-primary" placeholder="Opsional" />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-semibold text-foreground/90 mb-1.5">Masa Aktif (Hari)</label>
                                    <input type="number" required value={formData.durationDays} onChange={e => setFormData({ ...formData, durationDays: Number(e.target.value) })} className="w-full bg-[#121212] border border-[#2a2a2a] rounded-xl py-2.5 px-4 focus:border-primary" placeholder="30 = 1 Bulan" />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-foreground/90 mb-1.5">Badge/Pita</label>
                                    <input type="text" value={formData.badge} onChange={e => setFormData({ ...formData, badge: e.target.value })} className="w-full bg-[#121212] border border-[#2a2a2a] rounded-xl py-2.5 px-4 focus:border-primary" placeholder="Terlaris" />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-foreground/90 mb-1.5">Deskripsi Singkat</label>
                                <input type="text" value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} className="w-full bg-[#121212] border border-[#2a2a2a] rounded-xl py-2.5 px-4 focus:border-primary" />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-foreground/90 mb-1.5">Daftar Fitur (1 baris = 1 fitur)</label>
                                <textarea rows={5} required value={formData.features} onChange={e => setFormData({ ...formData, features: e.target.value })} className="w-full bg-[#121212] border border-[#2a2a2a] rounded-xl py-2.5 px-4 focus:border-primary resize-none placeholder:text-zinc-600" placeholder={`Custom Domain\nInstant Withdraw\nDukungan Prioritas`} />
                            </div>

                            <div className="flex gap-3 pt-4 border-t border-[#2a2a2a] mt-6">
                                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-3 px-4 rounded-xl border border-[#333] font-bold text-foreground hover:bg-[#222]">Batal</button>
                                <button type="submit" disabled={loading} className="flex-1 py-3 px-4 rounded-xl bg-primary text-primary-foreground font-bold hover:bg-yellow-500 shadow-lg shadow-primary/20 flex justify-center items-center gap-2">
                                    <Save className="w-5 h-5" /> Simpan Paket
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
