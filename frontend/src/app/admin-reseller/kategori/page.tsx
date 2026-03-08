"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { Plus, Edit, Trash2, FolderPlus } from "lucide-react";

interface Category {
    id: number;
    name: string;
    slug: string;
    description: string;
}

export default function AdminKategoriPage() {
    const { token } = useAuth();
    const [categories, setCategories] = useState<Category[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [formData, setFormData] = useState({ id: 0, name: '', slug: '', description: '' });

    const fetchCategories = async () => {
        if (!token) return;
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/categories`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                const data = await res.json();
                setCategories(data);
            }
        } catch (error) {
            console.error("Failed to fetch categories", error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchCategories();
    }, [token]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const isEdit = formData.id !== 0;
        const method = isEdit ? 'PUT' : 'POST';
        const url = `${process.env.NEXT_PUBLIC_API_URL}/api/admin/categories${isEdit ? `/${formData.id}` : ''}`;

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
                fetchCategories();
                setIsModalOpen(false);
                setFormData({ id: 0, name: '', slug: '', description: '' });
            } else {
                alert("Gagal menyimpan kategori");
            }
        } catch (error) {
            console.error(error);
        }
    };

    const handleDelete = async (id: number) => {
        if (!confirm("Yakin ingin menghapus kategori ini?")) return;
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/categories/${id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                fetchCategories();
            } else {
                alert("Gagal menghapus kategori");
            }
        } catch (error) {
            console.error(error);
        }
    }

    const setEdit = (cat: Category) => {
        setFormData(cat);
        setIsModalOpen(true);
    }

    const setCreate = () => {
        setFormData({ id: 0, name: '', slug: '', description: '' });
        setIsModalOpen(true);
    }

    if (isLoading) {
        return <div className="text-muted-foreground animate-pulse">Memuat kategori...</div>;
    }

    return (
        <div className="space-y-6 lg:space-y-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-black text-foreground mb-1 tracking-tight">Kategori Utama</h1>
                    <p className="text-muted-foreground">Kelola pengelompokan game (misal: Mobile Games, PC Games, Voucher).</p>
                </div>

                <button
                    onClick={setCreate}
                    className="flex items-center gap-2 px-5 py-2.5 bg-primary text-primary-foreground font-bold rounded-xl hover:bg-yellow-500 transition-colors shadow-lg shadow-primary/20 w-fit"
                >
                    <Plus className="h-5 w-5" />
                    Tambah Kategori
                </button>
            </div>

            <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-2xl overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm whitespace-nowrap">
                        <thead className="bg-[#222] text-muted-foreground">
                            <tr>
                                <th className="px-6 py-4 font-semibold w-12">ID</th>
                                <th className="px-6 py-4 font-semibold">NAMA KATEGORI</th>
                                <th className="px-6 py-4 font-semibold">SLUG URL</th>
                                <th className="px-6 py-4 font-semibold">DESKRIPSI</th>
                                <th className="px-6 py-4 font-semibold text-right">AKSI</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-[#2a2a2a]">
                            {categories.length > 0 ? (
                                categories.map((cat) => (
                                    <tr key={cat.id} className="hover:bg-[#222]/50 transition-colors">
                                        <td className="px-6 py-4 text-muted-foreground">#{cat.id}</td>
                                        <td className="px-6 py-4 font-bold text-foreground">{cat.name}</td>
                                        <td className="px-6 py-4 font-mono text-muted-foreground">{cat.slug}</td>
                                        <td className="px-6 py-4 text-muted-foreground truncate max-w-xs">{cat.description || '-'}</td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <button onClick={() => setEdit(cat)} className="p-2 h-8 w-8 rounded-lg bg-blue-500/10 text-blue-500 hover:bg-blue-500/20 transition-colors flex items-center justify-center">
                                                    <Edit className="h-4 w-4" />
                                                </button>
                                                <button onClick={() => handleDelete(cat.id)} className="p-2 h-8 w-8 rounded-lg bg-red-500/10 text-red-500 hover:bg-red-500/20 transition-colors flex items-center justify-center">
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
                                            <FolderPlus className="h-6 w-6 text-muted-foreground" />
                                        </div>
                                        <p className="text-muted-foreground font-medium">Belum ada kategori terdaftar.</p>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                    <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-2xl w-full max-w-md shadow-2xl overflow-hidden">
                        <div className="p-6 border-b border-[#2a2a2a]">
                            <h2 className="text-xl font-bold text-foreground">{formData.id ? 'Edit Kategori' : 'Tambah Kategori Baru'}</h2>
                        </div>
                        <form onSubmit={handleSubmit} className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-semibold text-foreground/90 mb-1.5">Nama Kategori</label>
                                <input
                                    type="text"
                                    required
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    className="w-full bg-[#121212] border border-[#2a2a2a] rounded-xl py-2.5 px-4 text-foreground focus:outline-none focus:border-primary transition-colors"
                                    placeholder="Contoh: Mobile Games"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-foreground/90 mb-1.5">Slug URL</label>
                                <input
                                    type="text"
                                    required
                                    value={formData.slug}
                                    onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                                    className="w-full bg-[#121212] border border-[#2a2a2a] rounded-xl py-2.5 px-4 text-foreground font-mono focus:outline-none focus:border-primary transition-colors"
                                    placeholder="Contoh: mobile-games"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-foreground/90 mb-1.5">Deskripsi</label>
                                <textarea
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    className="w-full bg-[#121212] border border-[#2a2a2a] rounded-xl py-2.5 px-4 text-foreground focus:outline-none focus:border-primary transition-colors resize-none h-24"
                                    placeholder="Opsional..."
                                />
                            </div>
                            <div className="flex gap-3 pt-4">
                                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-3 px-4 rounded-xl border border-[#333] font-bold text-foreground hover:bg-[#222] transition-colors">
                                    Batal
                                </button>
                                <button type="submit" className="flex-1 py-3 px-4 rounded-xl bg-primary text-primary-foreground font-bold hover:bg-yellow-500 transition-colors shadow-lg shadow-primary/20">
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
