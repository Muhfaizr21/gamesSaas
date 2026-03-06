'use client';

import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Settings, Gift, RefreshCw } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';

export default function AdminSpinPrizePage() {
    const { user, isLoading } = useAuth();
    const router = useRouter();
    const [prizes, setPrizes] = useState<any[]>([]);
    const [minTransaction, setMinTransaction] = useState('50000');
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);

    // Form States
    const [formData, setFormData] = useState({
        id: '',
        name: '',
        type: 'points',
        value: '1000',
        chance_weight: '10',
        is_active: true
    });

    useEffect(() => {
        if (!isLoading && (!user || user.role !== 'admin')) {
            router.push('/login');
            return;
        }

        fetchData();
    }, [user, isLoading]);

    const fetchData = async () => {
        try {
            const [prizeRes, settingRes] = await Promise.all([
                fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/spin-prizes`, {
                    headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
                }),
                fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/spin-settings`, {
                    headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
                })
            ]);

            if (prizeRes.ok) setPrizes(await prizeRes.json());
            if (settingRes.ok) {
                const settData = await settingRes.json();
                setMinTransaction(settData.min_transaction);
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleSaveSetting = async () => {
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/spin-settings`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify({ min_transaction: minTransaction })
            });

            if (res.ok) alert('Pengaturan Minimal Transaksi Disimpan!');
        } catch (error) {
            console.error(error);
        }
    };

    const handleSavePrize = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const isEdit = !!formData.id;
            const url = isEdit ? `${process.env.NEXT_PUBLIC_API_URL}/api/admin/spin-prizes/${formData.id}` : `${process.env.NEXT_PUBLIC_API_URL}/api/admin/spin-prizes`;
            const method = isEdit ? 'PUT' : 'POST';

            const payload: any = { ...formData };
            if (payload.type === 'zonk') payload.value = 0;

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
                fetchData();
            } else {
                const data = await res.json();
                alert(data.message || 'Gagal menyimpan');
            }
        } catch (error) {
            console.error(error);
        }
    };

    const handleDelete = async (id: number) => {
        if (!confirm('Hapus hadiah gacha ini?')) return;
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/spin-prizes/${id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
            });
            if (res.ok) {
                fetchData();
            }
        } catch (error) {
            console.error(error);
        }
    };

    const openEditForm = (prize: any) => {
        setFormData({
            id: prize.id,
            name: prize.name,
            type: prize.type,
            value: prize.value || '0',
            chance_weight: prize.chance_weight,
            is_active: prize.is_active
        });
        setShowForm(true);
    };

    const totalWeight = prizes.reduce((sum, p) => sum + (p.is_active ? parseInt(p.chance_weight) : 0), 0);

    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-black text-white flex items-center gap-3">
                        <Gift className="h-8 w-8 text-primary" /> Pengaturan Spin to Win
                    </h1>
                    <p className="text-zinc-400 mt-1">Konfigurasi hadiah gacha, persentase menang, dan syarat tiket</p>
                </div>
            </div>

            {/* Top Config */}
            <div className="bg-[#1a1a1a] border border-[#333] p-6 rounded-2xl mb-8 flex gap-8 items-end shadow-xl">
                <div className="flex-1">
                    <label className="block text-sm font-semibold text-zinc-300 mb-2 flex items-center gap-2">
                        <Settings className="w-4 h-4 text-primary" /> Minimal Transaksi (Rp) untuk 1 Tiket Gacha
                    </label>
                    <input
                        type="number"
                        className="w-full bg-[#0a0a0a] border border-[#333] rounded-xl px-4 py-3 text-white text-lg font-bold"
                        value={minTransaction}
                        onChange={e => setMinTransaction(e.target.value)}
                    />
                </div>
                <button
                    onClick={handleSaveSetting}
                    className="bg-zinc-800 hover:bg-zinc-700 text-white font-bold px-6 py-3 rounded-xl border border-zinc-600 transition h-[52px]"
                >
                    Simpan Syarat
                </button>
            </div>

            <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                    <RefreshCw className="w-5 h-5 text-indigo-400" /> Daftar Hadiah Roda Putar
                </h2>
                <button
                    onClick={() => {
                        setFormData({ id: '', name: '', type: 'points', value: '', chance_weight: '10', is_active: true });
                        setShowForm(true);
                    }}
                    className="bg-primary hover:bg-primary/90 text-black font-bold px-4 py-2 rounded-xl flex items-center gap-2 shadow-lg shadow-primary/20"
                >
                    <Plus className="h-5 w-5" /> Tambah Hadiah
                </button>
            </div>

            {/* Table */}
            {loading ? (
                <div className="flex justify-center py-20"><div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div></div>
            ) : (
                <div className="bg-[#1a1a1a] border border-[#333] rounded-2xl overflow-hidden shadow-xl">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-[#222] text-zinc-400 text-sm border-b border-[#333]">
                                <th className="p-4 font-semibold">NAMA HADIAH</th>
                                <th className="p-4 font-semibold">TIPE</th>
                                <th className="p-4 font-semibold">VALUE / NOMINAL</th>
                                <th className="p-4 font-semibold">BOBOT (PELUANG)</th>
                                <th className="p-4 font-semibold">STATUS</th>
                                <th className="p-4 font-semibold text-right">AKSI</th>
                            </tr>
                        </thead>
                        <tbody>
                            {prizes.map((prize) => {
                                const chancePercentage = prize.is_active && totalWeight > 0 ? ((parseInt(prize.chance_weight) / totalWeight) * 100).toFixed(2) : '0';
                                return (
                                    <tr key={prize.id} className="border-b border-[#333] hover:bg-[#252525] transition-colors">
                                        <td className="p-4 font-bold text-white text-base">
                                            {prize.name}
                                        </td>
                                        <td className="p-4">
                                            <span className={`px-2 py-1 text-xs font-bold rounded-lg uppercase tracking-wider ${prize.type === 'zonk' ? 'bg-zinc-800 text-zinc-400' :
                                                prize.type === 'points' ? 'bg-yellow-500/20 text-yellow-400' :
                                                    'bg-emerald-500/20 text-emerald-400'
                                                }`}>
                                                {prize.type}
                                            </span>
                                        </td>
                                        <td className="p-4 font-mono text-zinc-300">
                                            {prize.type !== 'zonk' ? prize.value : '-'}
                                        </td>
                                        <td className="p-4">
                                            <div className="flex items-center gap-3">
                                                <span className="font-bold text-indigo-400 w-8">{prize.chance_weight}</span>
                                                <span className="bg-[#333] px-2 py-0.5 rounded text-xs text-zinc-400 border border-[#444]">{chancePercentage}%</span>
                                            </div>
                                        </td>
                                        <td className="p-4">
                                            <div className={`w-3 h-3 rounded-full ${prize.is_active ? 'bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.5)]' : 'bg-red-500'}`} title={prize.is_active ? 'Aktif' : 'Nonaktif'} />
                                        </td>
                                        <td className="p-4 flex items-center justify-end gap-2">
                                            <button onClick={() => openEditForm(prize)} className="p-2 bg-blue-500/10 text-blue-400 hover:bg-blue-500 hover:text-white rounded-lg transition" title="Edit">
                                                <Edit2 className="w-4 h-4" />
                                            </button>
                                            <button onClick={() => handleDelete(prize.id)} className="p-2 bg-red-500/10 text-red-400 hover:bg-red-500 hover:text-white rounded-lg transition" title="Hapus">
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </td>
                                    </tr>
                                )
                            })}
                            {prizes.length === 0 && (
                                <tr>
                                    <td colSpan={6} className="p-8 text-center text-zinc-500">
                                        Belum ada data hadiah.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Modal Form */}
            {showForm && (
                <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
                    <div className="bg-[#1a1a1a] border border-[#333] p-6 rounded-2xl w-full max-w-md shadow-2xl">
                        <h2 className="text-2xl font-bold text-white mb-6">
                            {formData.id ? 'Edit Hadiah' : 'Tambah Hadiah'}
                        </h2>
                        <form onSubmit={handleSavePrize} className="space-y-4">
                            <div>
                                <label className="block text-sm text-zinc-400 mb-1">Nama Hadiah (Tampil di Roda)</label>
                                <input required type="text" className="w-full bg-[#0a0a0a] border border-[#333] rounded-xl px-4 py-2 text-white"
                                    placeholder="Contoh: 1000 Poin, Coba Lagi" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm text-zinc-400 mb-1">Tipe</label>
                                    <select className="w-full bg-[#0a0a0a] border border-[#333] rounded-xl px-4 py-2 text-white"
                                        value={formData.type || ""} onChange={e => setFormData({ ...formData, type: e.target.value })}>
                                        <option value="points">Poin Saldo</option>
                                        <option value="promo">Kupon Diskon</option>
                                        <option value="zonk">Zonk (Coba Lagi)</option>
                                    </select>
                                </div>
                                {formData.type !== 'zonk' && (
                                    <div>
                                        <label className="block text-sm text-zinc-400 mb-1">Nilai (Value)</label>
                                        <input required type="number" className="w-full bg-[#0a0a0a] border border-[#333] rounded-xl px-4 py-2 text-white"
                                            placeholder="Contoh: 1000" value={formData.value} onChange={e => setFormData({ ...formData, value: e.target.value })} />
                                    </div>
                                )}
                            </div>

                            <div>
                                <label className="block text-sm text-zinc-400 mb-1">Bobot Kemungkinan (Chance Weight)</label>
                                <input required type="number" className="w-full bg-[#0a0a0a] border border-[#333] rounded-xl px-4 py-2 text-white"
                                    placeholder="Semakin besar angka, peluang muncul semakin tinggi" value={formData.chance_weight} onChange={e => setFormData({ ...formData, chance_weight: e.target.value })} />
                                <p className="text-xs text-indigo-400 mt-1">Tips Zonk: Beri bobot sangat besar (misal 500) agar mudah keluar.</p>
                            </div>

                            <div className="flex items-center gap-2 mt-4 pt-2">
                                <input type="checkbox" id="isActive" className="w-4 h-4 rounded bg-[#0a0a0a] border-[#333] text-primary focus:ring-primary/50"
                                    checked={formData.is_active} onChange={e => setFormData({ ...formData, is_active: e.target.checked })} />
                                <label htmlFor="isActive" className="text-white text-sm">Masih Tersedia di Roda Putar</label>
                            </div>

                            <div className="pt-4 flex justify-end gap-3 border-t border-[#333]">
                                <button type="button" onClick={() => setShowForm(false)} className="px-6 py-2 rounded-xl border border-[#333] text-zinc-300 hover:bg-[#333] transition">
                                    Batal
                                </button>
                                <button type="submit" className="px-6 py-2 rounded-xl bg-primary text-black font-bold hover:bg-primary/90 transition shadow-lg shadow-primary/20">
                                    Simpan Slot Hadiah
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
