'use client';

import { useState, useEffect } from 'react';
import { Plus, Tag, Search, Edit, Trash2, Loader2, Link as LinkIcon, Calendar, Percent, Upload, X } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

export default function AdminPromoPage() {
    const { token } = useAuth();
    const [promos, setPromos] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingId, setEditingId] = useState<number | null>(null);
    const [isUploading, setIsUploading] = useState(false);

    const [formData, setFormData] = useState({
        name: '',
        discount_percentage: '',
        start_date: '',
        end_date: '',
        target_slug: '',
        banner_url: '',
        is_active: true
    });
    const [isSaving, setIsSaving] = useState(false);

    const handleUploadBanner = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file || !token) return;

        setIsUploading(true);
        const uploadData = new FormData();
        uploadData.append('image', file);

        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/upload/promo`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` },
                body: uploadData
            });
            const data = await res.json();
            if (res.ok) {
                setFormData(prev => ({ ...prev, banner_url: data.fileUrl }));
            } else {
                alert(data.message || 'Gagal upload banner');
            }
        } catch (error) {
            console.error("Upload Error:", error);
            alert("Terjadi kesalahan saat upload banner");
        } finally {
            setIsUploading(false);
        }
    };

    useEffect(() => {
        fetchPromos();
    }, []);

    const fetchPromos = async () => {
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/promos`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                const data = await res.json();
                setPromos(data);
            }
        } catch (error) {
            console.error('Error fetching promos:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);
        try {
            const url = editingId
                ? `${process.env.NEXT_PUBLIC_API_URL}/api/admin/promos/${editingId}`
                : `${process.env.NEXT_PUBLIC_API_URL}/api/admin/promos`;

            const res = await fetch(url, {
                method: editingId ? 'PUT' : 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    ...formData,
                    discount_percentage: parseFloat(formData.discount_percentage)
                })
            });

            if (res.ok) {
                setShowModal(false);
                fetchPromos();
                resetForm();
            } else {
                alert('Gagal menyimpan promo');
            }
        } catch (error) {
            console.error('Save error:', error);
        } finally {
            setIsSaving(false);
        }
    };

    const handleDelete = async (id: number) => {
        if (!confirm('Yakin ingin menghapus promo ini?')) return;
        try {
            await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/promos/${id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            fetchPromos();
        } catch (error) {
            console.error('Delete error:', error);
        }
    };

    const editPromo = (p: any) => {
        setEditingId(p.id);
        const formatForInput = (dateString: string) => {
            // to YYYY-MM-DDThh:mm format
            if (!dateString) return '';
            const d = new Date(dateString);
            // Ensure local timezone formatting simply
            d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
            return d.toISOString().slice(0, 16);
        };
        setFormData({
            name: p.name,
            discount_percentage: p.discount_percentage,
            start_date: formatForInput(p.start_date),
            end_date: formatForInput(p.end_date),
            target_slug: p.target_slug || '',
            banner_url: p.banner_url || '',
            is_active: p.is_active
        });
        setShowModal(true);
    };

    const resetForm = () => {
        setEditingId(null);
        setFormData({
            name: '',
            discount_percentage: '',
            start_date: '',
            end_date: '',
            target_slug: '',
            banner_url: '',
            is_active: true
        });
    };

    return (
        <div className="p-8">
            <div className="flex justify-between items-center mb-8">
                <div className="flex items-center gap-3">
                    <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center">
                        <Tag className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight text-white">Promo Flash Sale</h1>
                        <p className="text-zinc-400">Kelola event diskon untuk pengguna</p>
                    </div>
                </div>
                <button
                    onClick={() => { resetForm(); setShowModal(true); }}
                    className="flex items-center gap-2 bg-primary text-black px-5 py-2.5 rounded-xl font-bold hover:bg-primary/90 transition-all shadow-[0_0_15px_rgba(250,204,21,0.2)]"
                >
                    <Plus className="h-5 w-5" />
                    Buat Promo
                </button>
            </div>

            <div className="bg-[#1a1a1a] rounded-2xl border border-[#2a2a2a] overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm text-zinc-400">
                        <thead className="bg-[#2a2a2a]/50 text-xs uppercase text-zinc-500 font-semibold border-b border-[#2a2a2a]">
                            <tr>
                                <th className="px-6 py-4">Nama Promo</th>
                                <th className="px-6 py-4">Diskon</th>
                                <th className="px-6 py-4">Target Produk</th>
                                <th className="px-6 py-4">Masa Berlaku</th>
                                <th className="px-6 py-4">Status</th>
                                <th className="px-6 py-4 text-right">Aksi</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-[#2a2a2a]">
                            {isLoading ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-10 text-center">
                                        <Loader2 className="h-6 w-6 animate-spin mx-auto text-primary mb-2" />
                                        <p>Memuat data...</p>
                                    </td>
                                </tr>
                            ) : promos.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-10 text-center text-zinc-500">Belum ada promo yang dibuat</td>
                                </tr>
                            ) : promos.map((p) => {
                                const now = new Date();
                                const start = new Date(p.start_date);
                                const end = new Date(p.end_date);
                                const isOngoing = p.is_active && start <= now && end >= now;

                                return (
                                    <tr key={p.id} className="hover:bg-[#222] transition-colors">
                                        <td className="px-6 py-4 font-bold text-white max-w-[200px] truncate">{p.name}</td>
                                        <td className="px-6 py-4 text-green-400 font-bold">{p.discount_percentage}%</td>
                                        <td className="px-6 py-4">
                                            {p.target_slug ? (
                                                <span className="bg-primary/10 text-primary px-2 py-1 rounded-md text-xs font-mono">{p.target_slug}</span>
                                            ) : (
                                                <span className="text-zinc-500 text-xs italic">Semua Produk</span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-xs">
                                                <div>S: {start.toLocaleString('id-ID')}</div>
                                                <div className="text-red-400">E: {end.toLocaleString('id-ID')}</div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`px-3 py-1 text-xs font-bold rounded-full ${!p.is_active ? 'bg-red-500/10 text-red-500' : isOngoing ? 'bg-green-500/10 text-green-500 shadow-[0_0_10px_rgba(34,197,94,0.3)]' : 'bg-yellow-500/10 text-yellow-500'}`}>
                                                {!p.is_active ? 'Nonaktif' : isOngoing ? 'Sedang Berlangsung' : start > now ? 'Segera' : 'Berakhir'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <button onClick={() => editPromo(p)} className="p-2 text-zinc-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors">
                                                    <Edit className="h-4 w-4" />
                                                </button>
                                                <button onClick={() => handleDelete(p.id)} className="p-2 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-colors">
                                                    <Trash2 className="h-4 w-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                )
                            })}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
                    <div className="bg-[#121212] border border-[#2a2a2a] rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                        <div className="p-6 border-b border-[#2a2a2a]">
                            <h3 className="text-xl font-bold text-white">{editingId ? 'Edit Promo' : 'Buat Promo Baru'}</h3>
                        </div>
                        <form onSubmit={handleSave} className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-semibold text-zinc-400 mb-1.5">Nama Promo</label>
                                <input
                                    required
                                    type="text"
                                    placeholder="Contoh: Diskon Kemerdekaan 17an"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    className="w-full bg-[#1a1a1a] border border-[#333] rounded-xl px-4 py-3 text-white focus:border-primary focus:ring-1 focus:ring-primary/50 outline-none"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-semibold text-zinc-400 mb-1.5">Persentase Diskon</label>
                                    <div className="relative">
                                        <input
                                            required
                                            type="number"
                                            step="0.1"
                                            min="0"
                                            max="100"
                                            placeholder="5.0"
                                            value={formData.discount_percentage}
                                            onChange={(e) => setFormData({ ...formData, discount_percentage: e.target.value })}
                                            className="w-full bg-[#1a1a1a] border border-[#333] rounded-xl pl-10 pr-4 py-3 text-white focus:border-primary focus:ring-1 focus:ring-primary/50 outline-none"
                                        />
                                        <Percent className="absolute left-3.5 top-3.5 h-4 w-4 text-zinc-500" />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-zinc-400 mb-1.5 flex justify-between">
                                        Target Game <span className="text-xs font-normal text-zinc-500 mt-0.5">(Opsional)</span>
                                    </label>
                                    <div className="relative">
                                        <input
                                            type="text"
                                            placeholder="slug-game / m-legends"
                                            value={formData.target_slug}
                                            onChange={(e) => setFormData({ ...formData, target_slug: e.target.value })}
                                            className="w-full bg-[#1a1a1a] border border-[#333] rounded-xl pl-10 pr-4 py-3 text-white focus:border-primary focus:ring-1 focus:ring-primary/50 outline-none placeholder:text-zinc-600"
                                        />
                                        <LinkIcon className="absolute left-3.5 top-3.5 h-4 w-4 text-zinc-500" />
                                    </div>
                                </div>
                            </div>

                            {/* Banner Upload Area */}
                            <div>
                                <label className="block text-sm font-semibold text-zinc-400 mb-1.5">Banner Promo (WebP Otomatis)</label>
                                <div className="flex items-center gap-4">
                                    {(formData as any).banner_url ? (
                                        <div className="relative group">
                                            <img
                                                src={`${process.env.NEXT_PUBLIC_API_URL}${(formData as any).banner_url}`}
                                                alt="Preview Banner"
                                                className="h-16 w-32 rounded-xl object-cover border border-[#333]"
                                                onError={(e) => {
                                                    const target = e.target as HTMLImageElement;
                                                    target.src = 'https://ui-avatars.com/api/?name=Banner+Error&background=1a1a1a&color=fff';
                                                }}
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setFormData(prev => ({ ...prev, banner_url: '' }))}
                                                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                                            >
                                                <X className="w-3 h-3" />
                                            </button>
                                        </div>
                                    ) : (
                                        <div className="h-16 w-32 rounded-xl border-2 border-dashed border-[#333] flex items-center justify-center bg-[#1a1a1a]">
                                            <Upload className="w-5 h-5 text-zinc-500" />
                                        </div>
                                    )}
                                    <div className="flex-1">
                                        <input
                                            type="file"
                                            accept="image/*"
                                            onChange={handleUploadBanner}
                                            disabled={isUploading}
                                            className="block w-full text-sm text-zinc-400
                                            file:mr-4 file:py-2 file:px-4
                                            file:rounded-full file:border-0
                                            file:text-sm file:font-semibold
                                            file:bg-primary/10 file:text-primary
                                            hover:file:bg-primary/20 transition-colors"
                                        />
                                        {isUploading && <p className="text-xs text-primary mt-2 animate-pulse">Mengunggah banner...</p>}
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-semibold text-zinc-400 mb-1.5">Waktu Mulai</label>
                                    <input
                                        required
                                        type="datetime-local"
                                        value={formData.start_date}
                                        onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                                        className="w-full bg-[#1a1a1a] border border-[#333] rounded-xl px-4 py-3 text-white focus:border-primary outline-none [color-scheme:dark]"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-zinc-400 mb-1.5">Waktu Berakhir</label>
                                    <input
                                        required
                                        type="datetime-local"
                                        value={formData.end_date}
                                        onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                                        className="w-full bg-[#1a1a1a] border border-[#333] rounded-xl px-4 py-3 text-white focus:border-red-500 outline-none [color-scheme:dark]"
                                    />
                                </div>
                            </div>

                            <div className="flex items-center gap-3 pt-2">
                                <label className="relative inline-flex items-center cursor-pointer">
                                    <input type="checkbox" className="sr-only peer" checked={formData.is_active} onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })} />
                                    <div className="w-11 h-6 bg-zinc-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                                    <span className="ml-3 text-sm font-medium text-zinc-300">Aktifkan Promo</span>
                                </label>
                            </div>

                            <div className="flex justify-end gap-3 pt-6 border-t border-[#2a2a2a] mt-6">
                                <button type="button" onClick={() => setShowModal(false)} className="px-5 py-2.5 text-sm font-bold text-zinc-400 hover:text-white transition-colors">Batal</button>
                                <button type="submit" disabled={isSaving} className="px-6 py-2.5 bg-primary text-black font-bold rounded-xl hover:bg-primary/90 transition-all flex items-center gap-2">
                                    {isSaving && <Loader2 className="h-4 w-4 animate-spin" />}
                                    Simpan Promo
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
