'use client';

import { useState, useEffect } from 'react';
import { ListVideo, Plus, Edit, Trash2, Check, Save, X, Loader2, Crown, Zap, Rocket } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

const EMPTY_PLAN = { name: '', price: 0, durationDays: 30, features: [''], isActive: true };

const PlanIcon = ({ name }: { name: string }) => {
    const n = name?.toUpperCase();
    if (n === 'SUPREME') return <Crown className="h-6 w-6 text-amber-400" />;
    if (n === 'LEGEND') return <Zap className="h-6 w-6 text-blue-400" />;
    return <Rocket className="h-6 w-6 text-emerald-400" />;
};

const PlanAccent = (name: string) => {
    const n = name?.toUpperCase();
    if (n === 'SUPREME') return { border: 'border-amber-500/40', glow: 'shadow-amber-500/10', badge: 'bg-amber-500/10 text-amber-400', btnBg: 'bg-amber-500 text-black', icon: '#fbbf24' };
    if (n === 'LEGEND') return { border: 'border-blue-500/40', glow: 'shadow-blue-500/10', badge: 'bg-blue-500/10 text-blue-400', btnBg: 'bg-blue-500 text-white', icon: '#60a5fa' };
    return { border: 'border-emerald-500/40', glow: 'shadow-emerald-500/10', badge: 'bg-emerald-500/10 text-emerald-400', btnBg: 'bg-emerald-500 text-black', icon: '#34d399' };
};

export default function SaaSPlansPage() {
    const { token } = useAuth();
    const [plans, setPlans] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editForm, setEditForm] = useState<any>(null);
    const [showCreate, setShowCreate] = useState(false);
    const [createForm, setCreateForm] = useState<any>({ ...EMPTY_PLAN, features: [''] });

    const API = process.env.NEXT_PUBLIC_API_URL;

    const fetchPlans = async () => {
        setLoading(true);
        try {
            const res = await fetch(`${API}/api/superadmin/plans`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (res.ok) setPlans(await res.json());
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { if (token) fetchPlans(); }, [token]);

    const handleCreate = async () => {
        if (!createForm.name.trim()) return alert('Nama plan harus diisi!');
        setSaving(true);
        try {
            const res = await fetch(`${API}/api/superadmin/plans`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                body: JSON.stringify({ ...createForm, features: createForm.features.filter((f: string) => f.trim()) })
            });
            if (res.ok) { setShowCreate(false); setCreateForm({ ...EMPTY_PLAN, features: [''] }); fetchPlans(); }
            else { const d = await res.json(); alert(d.message || 'Gagal membuat plan'); }
        } finally { setSaving(false); }
    };

    const handleUpdate = async (id: string) => {
        setSaving(true);
        try {
            const res = await fetch(`${API}/api/superadmin/plans/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                body: JSON.stringify({ ...editForm, features: editForm.features.filter((f: string) => f.trim()) })
            });
            if (res.ok) { setEditingId(null); fetchPlans(); }
            else { const d = await res.json(); alert(d.message || 'Gagal update plan'); }
        } finally { setSaving(false); }
    };

    const handleDelete = async (id: string, name: string) => {
        if (!confirm(`Yakin hapus paket "${name}"? Reseller yang pakai paket ini bisa terdampak!`)) return;
        const res = await fetch(`${API}/api/superadmin/plans/${id}`, {
            method: 'DELETE',
            headers: { Authorization: `Bearer ${token}` }
        });
        if (res.ok) fetchPlans();
        else { const d = await res.json(); alert(d.message || 'Gagal hapus plan'); }
    };

    const startEdit = (plan: any) => {
        setEditingId(plan.id);
        setEditForm({ ...plan, features: Array.isArray(plan.features) ? [...plan.features] : [] });
    };

    const updateFeature = (form: any, setForm: any, idx: number, val: string) => {
        const arr = [...form.features];
        arr[idx] = val;
        setForm({ ...form, features: arr });
    };
    const addFeature = (form: any, setForm: any) => setForm({ ...form, features: [...form.features, ''] });
    const removeFeature = (form: any, setForm: any, idx: number) => setForm({ ...form, features: form.features.filter((_: any, i: number) => i !== idx) });

    return (
        <div className="space-y-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-black text-white flex items-center gap-3">
                        <ListVideo className="h-8 w-8 text-primary" />Paket Langganan SaaS
                    </h1>
                    <p className="text-zinc-400 mt-1">Kelola paket yang ditampilkan di halaman reseller <span className="text-primary">/reseller</span> secara real-time.</p>
                </div>
                <button onClick={() => setShowCreate(true)} className="flex items-center gap-2 bg-primary hover:bg-primary/90 text-black px-5 py-2.5 rounded-xl font-bold transition-all shadow-lg shadow-primary/20 whitespace-nowrap">
                    <Plus className="h-5 w-5" /> Buat Paket Baru
                </button>
            </div>

            {loading ? (
                <div className="flex items-center justify-center py-24 text-zinc-500">
                    <Loader2 className="h-8 w-8 animate-spin mr-3" /> Memuat data paket...
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    {plans.map((plan) => {
                        const accent = PlanAccent(plan.name);
                        const isEditing = editingId === plan.id;
                        const form = isEditing ? editForm : plan;
                        return (
                            <div key={plan.id} className={`bg-[#111] border ${accent.border} rounded-3xl p-6 relative overflow-hidden shadow-xl ${accent.glow}`}>
                                <span className={`absolute top-4 right-4 text-[10px] font-black px-3 py-1 rounded-full ${plan.isActive ? accent.badge : 'bg-red-500/10 text-red-400'}`}>
                                    {plan.isActive ? 'AKTIF' : 'NONAKTIF'}
                                </span>

                                <div className="mb-4 flex items-center gap-3">
                                    <div className="h-12 w-12 bg-white/5 rounded-2xl flex items-center justify-center border border-white/10">
                                        <PlanIcon name={plan.name} />
                                    </div>
                                    {isEditing ? (
                                        <input value={editForm.name} onChange={e => setEditForm({ ...editForm, name: e.target.value })}
                                            className="bg-[#1a1a1a] border border-white/10 text-white text-xl font-black px-3 py-1.5 rounded-lg w-full" placeholder="Nama Paket" />
                                    ) : (
                                        <h2 className="text-2xl font-black text-white">{plan.name}</h2>
                                    )}
                                </div>

                                {isEditing && (
                                    <div className="mb-4 space-y-3">
                                        <div>
                                            <input value={editForm.badge || ''} onChange={e => setEditForm({ ...editForm, badge: e.target.value })}
                                                className="bg-[#1a1a1a] border border-white/10 text-white text-xs font-bold px-3 py-2 rounded-lg w-full" placeholder="Cth: PALING BANJIR CUAN" />
                                        </div>
                                        <div>
                                            <input value={editForm.description || ''} onChange={e => setEditForm({ ...editForm, description: e.target.value })}
                                                className="bg-[#1a1a1a] border border-white/10 text-white text-xs px-3 py-2 rounded-lg w-full" placeholder="Deskripsi Singkat" />
                                        </div>
                                    </div>
                                )}
                                {!isEditing && plan.description && (
                                    <p className="text-sm text-zinc-400 mb-4">{plan.description}</p>
                                )}

                                {isEditing ? (
                                    <div className="mb-4 flex flex-col gap-3">
                                        <div className="flex gap-3">
                                            <div className="flex-1">
                                                <label className="text-[10px] text-zinc-500 uppercase font-bold mb-1 block">Harga/Bulan (Rp)</label>
                                                <input type="number" value={editForm.price} onChange={e => setEditForm({ ...editForm, price: Number(e.target.value) })}
                                                    className="bg-[#1a1a1a] border border-white/10 text-white font-bold px-3 py-2 rounded-lg w-full" />
                                            </div>
                                            <div className="flex-1">
                                                <label className="text-[10px] text-zinc-500 uppercase font-bold mb-1 block">Harga Coret (Rp)</label>
                                                <input type="number" value={editForm.originalPrice || ''} onChange={e => setEditForm({ ...editForm, originalPrice: Number(e.target.value) })}
                                                    className="bg-[#1a1a1a] border border-white/10 text-white font-bold px-3 py-2 rounded-lg w-full" placeholder="Opsi" />
                                            </div>
                                            <div className="w-20">
                                                <label className="text-[10px] text-zinc-500 uppercase font-bold mb-1 block">Hari</label>
                                                <input type="number" value={editForm.durationDays} onChange={e => setEditForm({ ...editForm, durationDays: Number(e.target.value) })}
                                                    className="bg-[#1a1a1a] border border-white/10 text-white font-bold px-3 py-2 rounded-lg w-full" />
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="mb-4">
                                        {plan.originalPrice > 0 && (
                                            <span className="text-sm text-zinc-500 line-through block mb-1">Rp {Math.round(plan.originalPrice).toLocaleString('id-ID')} /tahun</span>
                                        )}
                                        <span className="text-3xl font-black text-white">
                                            {plan.price === 0 ? 'Gratis' : `Rp ${Math.round(plan.price).toLocaleString('id-ID')}`}
                                        </span>
                                        {plan.price > 0 && <span className="text-zinc-500 ml-1.5 text-sm">/ bulan</span>}
                                        <p className="text-zinc-600 text-xs mt-1">{plan.durationDays} hari akses</p>
                                    </div>
                                )}

                                <div className="border-t border-white/5 pt-4 mb-4">
                                    {isEditing ? (
                                        <div className="space-y-2">
                                            <div className="flex items-center justify-between mb-2">
                                                <span className="text-[10px] font-black text-zinc-500 uppercase">Fitur</span>
                                                <button onClick={() => addFeature(editForm, setEditForm)} className="text-[10px] text-primary font-bold hover:underline">+ Tambah Fitur</button>
                                            </div>
                                            {editForm.features.map((f: string, fi: number) => (
                                                <div key={fi} className="flex gap-2">
                                                    <input value={f} onChange={e => updateFeature(editForm, setEditForm, fi, e.target.value)}
                                                        className="flex-1 bg-[#1a1a1a] border border-white/10 text-white text-xs px-2.5 py-1.5 rounded-lg" placeholder={`Fitur ${fi + 1}`} />
                                                    <button onClick={() => removeFeature(editForm, setEditForm, fi)} className="text-red-400 hover:text-red-300 px-1">
                                                        <X className="h-3.5 w-3.5" />
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <ul className="space-y-2 max-h-48 overflow-y-auto pr-1">
                                            {(Array.isArray(plan.features) ? plan.features : []).slice(0, 8).map((f: string, fi: number) => (
                                                <li key={fi} className="flex items-start gap-2.5 text-sm text-zinc-300">
                                                    <Check className="h-4 w-4 text-emerald-500 flex-shrink-0 mt-0.5" />
                                                    <span className="leading-tight">{f}</span>
                                                </li>
                                            ))}
                                            {plan.features?.length > 8 && (
                                                <li className="text-xs text-zinc-500 pl-6">+{plan.features.length - 8} fitur lainnya...</li>
                                            )}
                                        </ul>
                                    )}
                                </div>

                                {isEditing ? (
                                    <div className="flex gap-2">
                                        <button onClick={() => handleUpdate(plan.id)} disabled={saving}
                                            className="flex-1 flex items-center justify-center gap-2 bg-primary text-black py-2.5 rounded-xl font-black text-sm transition-all hover:bg-primary/90 disabled:opacity-60">
                                            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />} Simpan
                                        </button>
                                        <button onClick={() => setEditingId(null)} className="px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-zinc-300 text-sm font-bold transition-all">
                                            Batal
                                        </button>
                                    </div>
                                ) : (
                                    <div className="flex gap-2 mt-4">
                                        <button onClick={() => startEdit(plan)} className="flex-1 flex items-center justify-center gap-2 bg-white/5 hover:bg-white/10 text-white py-2.5 rounded-xl font-bold text-sm transition-all">
                                            <Edit className="h-4 w-4" /> Edit
                                        </button>
                                        <button onClick={() => handleDelete(plan.id, plan.name)} className="px-4 py-2.5 rounded-xl bg-red-500/10 hover:bg-red-500 text-red-400 hover:text-white transition-all">
                                            <Trash2 className="h-4 w-4" />
                                        </button>
                                    </div>
                                )}
                            </div>
                        );
                    })}

                    {/* Create new plan card */}
                    {!showCreate ? (
                        <button onClick={() => setShowCreate(true)} className="bg-[#0a0a0a] border-2 border-dashed border-[#1a1a1a] hover:border-primary/50 rounded-3xl p-6 flex flex-col items-center justify-center min-h-[350px] transition-all group cursor-pointer">
                            <div className="h-16 w-16 bg-[#111] group-hover:bg-primary border border-[#1a1a1a] group-hover:border-primary rounded-full flex items-center justify-center mb-4 transition-all">
                                <Plus className="h-8 w-8 text-zinc-500 group-hover:text-black transition-all" />
                            </div>
                            <h3 className="text-lg font-bold text-zinc-400 group-hover:text-white">Tambah Paket</h3>
                            <p className="text-zinc-600 text-sm mt-1 text-center">Buat paket langganan baru</p>
                        </button>
                    ) : (
                        <div className="bg-[#111] border-2 border-primary/30 rounded-3xl p-6 space-y-4">
                            <div className="flex items-center justify-between">
                                <h3 className="font-black text-white">Buat Paket Baru</h3>
                                <button onClick={() => setShowCreate(false)} className="text-zinc-500 hover:text-white"><X className="h-5 w-5" /></button>
                            </div>
                            <div>
                                <label className="text-[10px] font-black text-zinc-500 uppercase mb-1 block">Nama Paket</label>
                                <input value={createForm.name} onChange={e => setCreateForm({ ...createForm, name: e.target.value })}
                                    className="bg-[#1a1a1a] border border-white/10 text-white px-3 py-2 rounded-lg w-full font-bold" placeholder="e.g. PRO, LEGEND, SUPREME" />
                            </div>
                            <div>
                                <label className="text-[10px] font-black text-zinc-500 uppercase mb-1 block">Badge & Deskripsi</label>
                                <div className="space-y-2">
                                    <input value={createForm.badge || ''} onChange={e => setCreateForm({ ...createForm, badge: e.target.value })}
                                        className="bg-[#1a1a1a] border border-white/10 text-white px-3 py-2 rounded-lg w-full text-xs" placeholder="Badge (opsional)" />
                                    <input value={createForm.description || ''} onChange={e => setCreateForm({ ...createForm, description: e.target.value })}
                                        className="bg-[#1a1a1a] border border-white/10 text-white px-3 py-2 rounded-lg w-full text-xs" placeholder="Deskripsi Singkat" />
                                </div>
                            </div>
                            <div className="grid grid-cols-3 gap-3">
                                <div>
                                    <label className="text-[10px] font-black text-zinc-500 uppercase mb-1 block">Harga/Bulan (Rp)</label>
                                    <input type="number" value={createForm.price} onChange={e => setCreateForm({ ...createForm, price: Number(e.target.value) })}
                                        className="bg-[#1a1a1a] border border-white/10 text-white px-3 py-2 rounded-lg w-full font-bold text-xs" />
                                </div>
                                <div>
                                    <label className="text-[10px] font-black text-zinc-500 uppercase mb-1 block">Harga Coret</label>
                                    <input type="number" value={createForm.originalPrice || ''} onChange={e => setCreateForm({ ...createForm, originalPrice: Number(e.target.value) })}
                                        className="bg-[#1a1a1a] border border-white/10 text-white px-3 py-2 rounded-lg w-full font-bold text-xs" placeholder="Opsi" />
                                </div>
                                <div>
                                    <label className="text-[10px] font-black text-zinc-500 uppercase mb-1 block">Hari</label>
                                    <input type="number" value={createForm.durationDays} onChange={e => setCreateForm({ ...createForm, durationDays: Number(e.target.value) })}
                                        className="bg-[#1a1a1a] border border-white/10 text-white px-3 py-2 rounded-lg w-full font-bold text-xs" />
                                </div>
                            </div>
                            <div>
                                <div className="flex items-center justify-between mb-2">
                                    <label className="text-[10px] font-black text-zinc-500 uppercase">Daftar Fitur</label>
                                    <button onClick={() => addFeature(createForm, setCreateForm)} className="text-[10px] text-primary font-bold hover:underline">+ Tambah</button>
                                </div>
                                <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
                                    {createForm.features.map((f: string, fi: number) => (
                                        <div key={fi} className="flex gap-2">
                                            <input value={f} onChange={e => updateFeature(createForm, setCreateForm, fi, e.target.value)}
                                                className="flex-1 bg-[#1a1a1a] border border-white/10 text-white text-xs px-2.5 py-1.5 rounded-lg" placeholder={`Fitur ${fi + 1}`} />
                                            <button onClick={() => removeFeature(createForm, setCreateForm, fi)} className="text-red-400 hover:text-red-300">
                                                <X className="h-3.5 w-3.5" />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                            <button onClick={handleCreate} disabled={saving}
                                className="w-full flex items-center justify-center gap-2 bg-primary text-black py-3 rounded-xl font-black text-sm hover:bg-primary/90 disabled:opacity-60 transition-all">
                                {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />} Simpan Paket Baru
                            </button>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
