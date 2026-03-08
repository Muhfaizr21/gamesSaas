'use client';

import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Ticket, Percent, DollarSign, Activity } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';

export default function AdminPromoCodePage() {
    const { user, isLoading } = useAuth();
    const router = useRouter();
    const [coupons, setCoupons] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);

    // Form States
    const [formData, setFormData] = useState({
        id: '',
        code: '',
        discount_type: 'fixed',
        discount_value: '',
        max_discount: '',
        min_purchase: '0',
        quota: '100',
        is_active: true
    });

    useEffect(() => {
        if (!isLoading && (!user || user.role !== 'admin')) {
            router.push('/login');
            return;
        }

        fetchCoupons();
    }, [user, isLoading]);

    const fetchCoupons = async () => {
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/promo-codes`, {
                headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
            });
            if (res.ok) setCoupons(await res.json());
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const isEdit = !!formData.id;
            const url = isEdit ? `${process.env.NEXT_PUBLIC_API_URL}/api/admin/promo-codes/${formData.id}` : `${process.env.NEXT_PUBLIC_API_URL}/api/admin/promo-codes`;
            const method = isEdit ? 'PUT' : 'POST';

            const payload: any = { ...formData };
            if (!payload.max_discount) payload.max_discount = null;
            if (!isEdit) delete payload.id;

            const res = await fetch(url, {
                method,
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify(payload)
            });

            if (res.ok) {
                setShowForm(false);
                fetchCoupons();
                alert('Kode promo berhasil disimpan!');
            } else {
                const data = await res.json();
                alert(data.message || 'Gagal menyimpan');
            }
        } catch (error) {
            console.error(error);
        }
    };

    const handleDelete = async (id: number) => {
        if (!confirm('Hapus kode promo ini?')) return;
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/promo-codes/${id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
            });
            if (res.ok) {
                fetchCoupons();
            }
        } catch (error) {
            console.error(error);
        }
    };

    const openEditForm = (coupon: any) => {
        setFormData({
            id: coupon.id,
            code: coupon.code,
            discount_type: coupon.discount_type,
            discount_value: coupon.discount_value,
            max_discount: coupon.max_discount || '',
            min_purchase: coupon.min_purchase,
            quota: coupon.quota,
            is_active: coupon.is_active
        });
        setShowForm(true);
    };

    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-black text-white flex items-center gap-3">
                        <Ticket className="h-8 w-8 text-primary" /> Manajer Kode Promo
                    </h1>
                    <p className="text-zinc-400 mt-1">Buat kode diskon/kupon manual untuk event & marketing</p>
                </div>
                <button
                    onClick={() => {
                        setFormData({ id: '', code: '', discount_type: 'fixed', discount_value: '', max_discount: '', min_purchase: '0', quota: '100', is_active: true });
                        setShowForm(true);
                    }}
                    className="bg-primary hover:bg-primary/90 text-black font-bold px-4 py-2 rounded-xl flex items-center gap-2"
                >
                    <Plus className="h-5 w-5" /> Buat Kupon
                </button>
            </div>

            {/* Form Modal */}
            {showForm && (
                <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
                    <div className="bg-[#1a1a1a] border border-[#333] p-6 rounded-2xl w-full max-w-lg shadow-2xl">
                        <h2 className="text-2xl font-bold text-white mb-6">
                            {formData.id ? 'Edit Kode Promo' : 'Buat Kode Promo Baru'}
                        </h2>
                        <form onSubmit={handleSave} className="space-y-4">
                            <div>
                                <label className="block text-sm text-zinc-400 mb-1">Kode Promo <span className="text-red-500">*</span></label>
                                <input required type="text" className="w-full bg-[#0a0a0a] border border-[#333] rounded-xl px-4 py-2 uppercase text-white placeholder-zinc-600 focus:border-primary/50 focus:ring-1 focus:ring-primary/50"
                                    placeholder="Contoh: GAJIAN2026" value={formData.code} onChange={e => setFormData({ ...formData, code: e.target.value.toUpperCase() })} />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm text-zinc-400 mb-1">Tipe Diskon</label>
                                    <select className="w-full bg-[#0a0a0a] border border-[#333] rounded-xl px-4 py-2 text-white"
                                        value={formData.discount_type || ""} onChange={e => setFormData({ ...formData, discount_type: e.target.value })}>
                                        <option value="fixed">Nominal Rupiah (Rp)</option>
                                        <option value="percentage">Persen (%)</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm text-zinc-400 mb-1">Nilai Diskon <span className="text-red-500">*</span></label>
                                    <input required type="number" className="w-full bg-[#0a0a0a] border border-[#333] rounded-xl px-4 py-2 text-white"
                                        placeholder="Contoh: 10 atau 5000" value={formData.discount_value} onChange={e => setFormData({ ...formData, discount_value: e.target.value })} />
                                </div>
                            </div>

                            {formData.discount_type === 'percentage' && (
                                <div>
                                    <label className="block text-sm text-zinc-400 mb-1">Maksimal Potongan Rupiah (Opsional)</label>
                                    <input type="number" className="w-full bg-[#0a0a0a] border border-[#333] rounded-xl px-4 py-2 text-white placeholder-zinc-600"
                                        placeholder="Contoh: 10000 (maks. potongan 10rb)" value={formData.max_discount} onChange={e => setFormData({ ...formData, max_discount: e.target.value })} />
                                </div>
                            )}

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm text-zinc-400 mb-1">Minimal Belanja (Rp)</label>
                                    <input required type="number" className="w-full bg-[#0a0a0a] border border-[#333] rounded-xl px-4 py-2 text-white"
                                        value={formData.min_purchase} onChange={e => setFormData({ ...formData, min_purchase: e.target.value })} />
                                </div>
                                <div>
                                    <label className="block text-sm text-zinc-400 mb-1">Kuota Pemindahan Kupon</label>
                                    <input required type="number" className="w-full bg-[#0a0a0a] border border-[#333] rounded-xl px-4 py-2 text-white"
                                        value={formData.quota} onChange={e => setFormData({ ...formData, quota: e.target.value })} />
                                </div>
                            </div>

                            <div className="flex items-center gap-2 mt-4">
                                <input type="checkbox" id="isActive" className="w-4 h-4 rounded bg-[#0a0a0a] border-[#333] text-primary focus:ring-primary/50"
                                    checked={formData.is_active} onChange={e => setFormData({ ...formData, is_active: e.target.checked })} />
                                <label htmlFor="isActive" className="text-white">Aktifkan Kode Promo Ini</label>
                            </div>

                            <div className="pt-4 flex justify-end gap-3 border-t border-[#333]">
                                <button type="button" onClick={() => setShowForm(false)} className="px-6 py-2 rounded-xl border border-[#333] text-zinc-300 hover:bg-[#333] font-medium transition">
                                    Batal
                                </button>
                                <button type="submit" className="px-6 py-2 rounded-xl bg-primary text-black font-bold hover:bg-primary/90 transition shadow-lg shadow-primary/20">
                                    Simpan Kupon
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Tabel Kupon */}
            {loading ? (
                <div className="flex justify-center py-20"><div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div></div>
            ) : (
                <div className="bg-[#1a1a1a] border border-[#333] rounded-2xl overflow-hidden shadow-xl">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-[#222] text-zinc-400 text-sm border-b border-[#333]">
                                    <th className="p-4 font-semibold">KODE</th>
                                    <th className="p-4 font-semibold">TIPE & NILAI</th>
                                    <th className="p-4 font-semibold">MIN. BELANJA</th>
                                    <th className="p-4 font-semibold">KUOTA</th>
                                    <th className="p-4 font-semibold">STATUS</th>
                                    <th className="p-4 font-semibold text-right">AKSI</th>
                                </tr>
                            </thead>
                            <tbody>
                                {coupons.map((coupon) => (
                                    <tr key={coupon.id} className="border-b border-[#333] hover:bg-[#252525] transition-colors">
                                        <td className="p-4 font-bold text-white text-lg">
                                            {coupon.code}
                                        </td>
                                        <td className="p-4">
                                            <div className="flex items-center gap-2 text-sm text-zinc-300">
                                                {coupon.discount_type === 'percentage' ? (
                                                    <Percent className="w-4 h-4 text-orange-400" />
                                                ) : (
                                                    <DollarSign className="w-4 h-4 text-green-400" />
                                                )}
                                                {coupon.discount_type === 'percentage' ? `${coupon.discount_value}%` : `Rp ${parseInt(coupon.discount_value).toLocaleString('id-ID')}`}
                                                {coupon.max_discount && <span className="text-zinc-500 text-xs">(Max Rp{parseInt(coupon.max_discount).toLocaleString('id-ID')})</span>}
                                            </div>
                                        </td>
                                        <td className="p-4 text-zinc-300 font-medium">Rp {parseInt(coupon.min_purchase).toLocaleString('id-ID')}</td>
                                        <td className="p-4">
                                            <div className="flex flex-col">
                                                <span className="text-white font-medium">{coupon.used} / {coupon.quota}</span>
                                                <div className="w-full bg-[#333] h-1.5 mt-1.5 rounded-full overflow-hidden">
                                                    <div className="bg-primary h-full" style={{ width: `${Math.min(100, (coupon.used / coupon.quota) * 100)}%` }}></div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="p-4">
                                            <span className={`px-3 py-1 text-xs font-bold rounded-full border ${coupon.is_active ? 'bg-green-500/10 text-green-500 border-green-500/20' : 'bg-red-500/10 text-red-500 border-red-500/20'}`}>
                                                {coupon.is_active ? 'AKTIF' : 'NONAKTIF'}
                                            </span>
                                        </td>
                                        <td className="p-4 flex items-center justify-end gap-2">
                                            <button onClick={() => openEditForm(coupon)} className="p-2 bg-blue-500/10 text-blue-400 hover:bg-blue-500 hover:text-white rounded-lg transition" title="Edit">
                                                <Edit2 className="w-4 h-4" />
                                            </button>
                                            <button onClick={() => handleDelete(coupon.id)} className="p-2 bg-red-500/10 text-red-400 hover:bg-red-500 hover:text-white rounded-lg transition" title="Hapus">
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                                {coupons.length === 0 && (
                                    <tr>
                                        <td colSpan={6} className="p-8 text-center text-zinc-500">
                                            Belum ada kode promo. Klik 'Buat Kupon' untuk memulai.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
}
