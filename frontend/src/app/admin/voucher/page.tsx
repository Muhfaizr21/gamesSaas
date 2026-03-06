"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { Plus, Edit, Trash2, FolderCode, Upload, X } from "lucide-react";

interface Category {
    id: number;
    name: string;
}

interface Voucher {
    id: number;
    name: string;
    slug: string;
    thumbnail: string;
    isActive: boolean;
    categoryId: number;
    Category?: Category;
}

export default function AdminVoucherPage() {
    const { token } = useAuth();
    const [vouchers, setVouchers] = useState<Voucher[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [formData, setFormData] = useState({ id: 0, name: '', slug: '', categoryId: 0, isActive: true, thumbnail: '' });
    const [isUploading, setIsUploading] = useState(false);

    const handleUploadImage = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file || !token) return;

        setIsUploading(true);
        const uploadData = new FormData();
        uploadData.append('image', file);

        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/upload/voucher`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` },
                body: uploadData
            });
            const data = await res.json();
            if (res.ok) {
                // Update form state directly with the returned URL string
                setFormData(prev => ({ ...prev, thumbnail: data.fileUrl }));
            } else {
                alert(data.message || 'Gagal upload gambar');
            }
        } catch (error) {
            console.error("Upload Error:", error);
            alert("Terjadi kesalahan saat upload");
        } finally {
            setIsUploading(false);
        }
    };

    useEffect(() => {
        const fetchData = async () => {
            if (!token) return;
            try {
                // Fetch Vouchers
                const resVouchers = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/vouchers`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (resVouchers.ok) setVouchers(await resVouchers.json());

                // Fetch Categories for Dropdown
                const resCats = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/categories`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (resCats.ok) {
                    const cats = await resCats.json();
                    setCategories(cats);
                    if (formData.categoryId === 0 && cats.length > 0) {
                        setFormData(prev => ({ ...prev, categoryId: cats[0].id }));
                    }
                }
            } catch (error) {
                console.error("Failed to fetch data", error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchData();
    }, [token, formData.categoryId]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const isEdit = formData.id !== 0;
        const method = isEdit ? 'PUT' : 'POST';
        const url = `${process.env.NEXT_PUBLIC_API_URL}/api/admin/vouchers${isEdit ? `/${formData.id}` : ''}`;

        try {
            const res = await fetch(url, {
                method,
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(formData)
            });

            if (res.ok) {
                // Refresh vouchers list
                const resVouchers = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/vouchers`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (resVouchers.ok) setVouchers(await resVouchers.json());

                setIsModalOpen(false);
                setFormData({ id: 0, name: '', slug: '', categoryId: categories[0]?.id || 0, isActive: true, thumbnail: '' });
            } else {
                alert("Gagal menyimpan data game/voucher");
            }
        } catch (error) {
            console.error(error);
        }
    };

    const handleDelete = async (id: number) => {
        if (!confirm("Hapus Game/Voucher ini secara permanen?")) return;
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/vouchers/${id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                setVouchers(vouchers.filter(v => v.id !== id));
            } else {
                alert("Gagal menghapus game");
            }
        } catch (error) {
            console.error(error);
        }
    }

    const setEdit = (item: Voucher) => {
        setFormData({
            id: item.id,
            name: item.name,
            slug: item.slug,
            categoryId: item.categoryId,
            isActive: item.isActive,
            thumbnail: item.thumbnail || ''
        });
        setIsModalOpen(true);
    }

    const setCreate = () => {
        setFormData({ id: 0, name: '', slug: '', categoryId: categories[0]?.id || 0, isActive: true, thumbnail: '' });
        setIsModalOpen(true);
    }

    if (isLoading) {
        return <div className="text-muted-foreground animate-pulse">Memuat list game...</div>;
    }

    return (
        <div className="space-y-6 lg:space-y-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-black text-foreground mb-1 tracking-tight">Manajemen <span className="text-primary">Game</span></h1>
                    <p className="text-muted-foreground">Tambah dan kelola daftar game atau voucher (Mobile Legends, Valorant, dll).</p>
                </div>

                <button
                    onClick={setCreate}
                    className="flex items-center gap-2 px-5 py-2.5 bg-primary text-primary-foreground font-bold rounded-xl hover:bg-yellow-500 transition-colors shadow-lg shadow-primary/20 w-fit"
                >
                    <Plus className="h-5 w-5" />
                    Tambah Game
                </button>
            </div>

            <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-2xl overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm whitespace-nowrap">
                        <thead className="bg-[#222] text-muted-foreground">
                            <tr>
                                <th className="px-6 py-4 font-semibold w-12">ID</th>
                                <th className="px-6 py-4 font-semibold">GAME / VOUCHER</th>
                                <th className="px-6 py-4 font-semibold">KATEGORI INDUK</th>
                                <th className="px-6 py-4 font-semibold">STATUS</th>
                                <th className="px-6 py-4 font-semibold text-right">AKSI</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-[#2a2a2a]">
                            {vouchers.length > 0 ? (
                                vouchers.map((v) => (
                                    <tr key={v.id} className="hover:bg-[#222]/50 transition-colors">
                                        <td className="px-6 py-4 text-muted-foreground">#{v.id}</td>
                                        <td className="px-6 py-4 flex items-center gap-3">
                                            {v.thumbnail ? (
                                                <img
                                                    src={v.thumbnail.startsWith('http') ? v.thumbnail : `${process.env.NEXT_PUBLIC_API_URL}${v.thumbnail}`}
                                                    alt={v.name}
                                                    className="w-10 h-10 rounded-lg object-cover border border-[#333]"
                                                    onError={(e) => {
                                                        const target = e.target as HTMLImageElement;
                                                        target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(v.name)}&background=1a1a1a&color=fff`;
                                                    }}
                                                />
                                            ) : (
                                                <div className="w-10 h-10 rounded-lg bg-[#2a2a2a] border border-[#333] flex items-center justify-center text-xs font-bold text-muted-foreground">
                                                    {v.name.substring(0, 2).toUpperCase()}
                                                </div>
                                            )}
                                            <div>
                                                <p className="font-bold text-foreground">{v.name}</p>
                                                <p className="text-xs text-muted-foreground font-mono">{v.slug}</p>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="px-2.5 py-1 rounded-md text-xs font-bold bg-[#2a2a2a] text-muted-foreground border border-[#333]">
                                                {v.Category?.name || 'Unknown'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2.5 py-1 rounded-md text-xs font-bold border ${v.isActive ? 'bg-green-500/10 text-green-500 border-green-500/20' : 'bg-red-500/10 text-red-500 border-red-500/20'}`}>
                                                {v.isActive ? 'AKTIF' : 'NONAKTIF'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <button onClick={() => setEdit(v)} className="p-2 h-8 w-8 rounded-lg bg-blue-500/10 text-blue-500 hover:bg-blue-500/20 transition-colors flex items-center justify-center">
                                                    <Edit className="h-4 w-4" />
                                                </button>
                                                <button onClick={() => handleDelete(v.id)} className="p-2 h-8 w-8 rounded-lg bg-red-500/10 text-red-500 hover:bg-red-500/20 transition-colors flex items-center justify-center">
                                                    <Trash2 className="h-4 w-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={5} className="px-6 py-12 text-center border-t border-[#2a2a2a]">
                                        <div className="inline-flex items-center justify-center p-4 bg-[#2a2a2a] rounded-full mb-4">
                                            <FolderCode className="h-6 w-6 text-muted-foreground" />
                                        </div>
                                        <p className="text-muted-foreground font-medium">Belum ada game terdaftar. Pastikan kategori sudah dibuat.</p>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Modal Form */}
            {isModalOpen && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto">
                    <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-2xl w-full max-w-md shadow-2xl overflow-hidden my-auto">
                        <div className="p-6 border-b border-[#2a2a2a]">
                            <h2 className="text-xl font-bold text-foreground">{formData.id ? 'Edit Game/Voucher' : 'Tambah Game Baru'}</h2>
                        </div>
                        <form onSubmit={handleSubmit} className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-semibold text-foreground/90 mb-1.5">Nama Game</label>
                                <input
                                    type="text" required
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    className="w-full bg-[#121212] border border-[#2a2a2a] rounded-xl py-2.5 px-4 text-foreground focus:outline-none focus:border-primary transition-colors"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-foreground/90 mb-1.5">Slug URL</label>
                                <input
                                    type="text" required
                                    value={formData.slug}
                                    onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                                    className="w-full bg-[#121212] border border-[#2a2a2a] rounded-xl py-2.5 px-4 text-foreground font-mono focus:outline-none focus:border-primary transition-colors"
                                />
                            </div>

                            {/* Image Upload Area */}
                            <div>
                                <label className="block text-sm font-semibold text-foreground/90 mb-1.5">Logo/Gambar Game (Otomatis WebP)</label>
                                <div className="flex items-center gap-4">
                                    {formData.thumbnail ? (
                                        <div className="relative group">
                                            <img
                                                src={`${process.env.NEXT_PUBLIC_API_URL}${formData.thumbnail}`}
                                                alt="Preview"
                                                className="w-16 h-16 rounded-xl object-cover border border-[#333]"
                                                onError={(e) => {
                                                    const target = e.target as HTMLImageElement;
                                                    target.src = 'https://ui-avatars.com/api/?name=Image+Error&background=1a1a1a&color=fff';
                                                }}
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setFormData(prev => ({ ...prev, thumbnail: '' }))}
                                                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                                            >
                                                <X className="w-3 h-3" />
                                            </button>
                                        </div>
                                    ) : (
                                        <div className="w-16 h-16 rounded-xl border-2 border-dashed border-[#333] flex items-center justify-center bg-[#121212]">
                                            <Upload className="w-5 h-5 text-zinc-500" />
                                        </div>
                                    )}
                                    <div className="flex-1">
                                        <input
                                            type="file"
                                            accept="image/*"
                                            onChange={handleUploadImage}
                                            disabled={isUploading}
                                            className="block w-full text-sm text-zinc-400
                                            file:mr-4 file:py-2 file:px-4
                                            file:rounded-full file:border-0
                                            file:text-sm file:font-semibold
                                            file:bg-primary/10 file:text-primary
                                            hover:file:bg-primary/20 transition-colors"
                                        />
                                        {isUploading && <p className="text-xs text-primary mt-2 animate-pulse">Mengunggah dan kompresi WebP...</p>}
                                    </div>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-foreground/90 mb-1.5">Pilih Kategori Induk</label>
                                <select
                                    required
                                    value={formData.categoryId || ""}
                                    onChange={(e) => setFormData({ ...formData, categoryId: parseInt(e.target.value) })}
                                    className="w-full bg-[#121212] border border-[#2a2a2a] rounded-xl py-2.5 px-4 text-foreground focus:outline-none focus:border-primary transition-colors appearance-none"
                                >
                                    {categories.map(c => (
                                        <option key={c.id} value={c.id}>{c.name}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="flex items-center gap-3 pt-2 pb-2">
                                <input
                                    type="checkbox"
                                    id="isActive"
                                    checked={formData.isActive}
                                    onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                                    className="w-5 h-5 rounded border-gray-600 text-primary focus:ring-primary focus:ring-offset-[#1a1a1a] bg-[#121212]"
                                />
                                <label htmlFor="isActive" className="text-sm font-semibold text-foreground cursor-pointer">Game Aktif (Ditampilkan) / Bisa Dibeli</label>
                            </div>

                            <div className="flex gap-3 pt-4 border-t border-[#2a2a2a]">
                                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-3 px-4 rounded-xl border border-[#333] font-bold text-foreground hover:bg-[#222] transition-colors">
                                    Batal
                                </button>
                                <button type="submit" disabled={categories.length === 0 || isUploading} className="flex-1 py-3 px-4 rounded-xl bg-primary text-primary-foreground font-bold hover:bg-yellow-500 transition-colors shadow-lg shadow-primary/20 disabled:opacity-50 disabled:cursor-not-allowed">
                                    Simpan
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
