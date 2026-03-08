'use client';

import { useState, useEffect } from 'react';
import { MessageSquare, Star, Trash2, Loader2, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

export default function AdminReviewPage() {
    const { token } = useAuth();
    const [reviews, setReviews] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        fetchReviews();
    }, []);

    const fetchReviews = async () => {
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/reviews`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                const data = await res.json();
                setReviews(data);
            }
        } catch (error) {
            console.error('Error fetching reviews:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleToggle = async (id: number) => {
        try {
            await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/reviews/${id}/toggle`, {
                method: 'PUT',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            fetchReviews();
        } catch (error) {
            console.error('Toggle error:', error);
        }
    };

    const handleDelete = async (id: number) => {
        if (!confirm('Yakin ingin menghapus ulasan ini secara permanen?')) return;
        try {
            await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/reviews/${id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            fetchReviews();
        } catch (error) {
            console.error('Delete error:', error);
        }
    };

    return (
        <div className="p-8">
            <div className="flex justify-between items-center mb-8">
                <div className="flex items-center gap-3">
                    <div className="h-12 w-12 rounded-2xl bg-yellow-500/10 flex items-center justify-center border border-yellow-500/20">
                        <MessageSquare className="h-6 w-6 text-yellow-500" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight text-white">Ulasan Pengguna</h1>
                        <p className="text-zinc-400">Moderasi testimoni dari pembeli</p>
                    </div>
                </div>
            </div>

            <div className="bg-[#1a1a1a] rounded-2xl border border-[#2a2a2a] overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm text-zinc-400">
                        <thead className="bg-[#2a2a2a]/50 text-xs uppercase text-zinc-500 font-semibold border-b border-[#2a2a2a]">
                            <tr>
                                <th className="px-6 py-4">Pembeli</th>
                                <th className="px-6 py-4">Produk / Order</th>
                                <th className="px-6 py-4">Rating & Komentar</th>
                                <th className="px-6 py-4">Status Tampil</th>
                                <th className="px-6 py-4 text-right">Aksi</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-[#2a2a2a]">
                            {isLoading ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-10 text-center">
                                        <Loader2 className="h-6 w-6 animate-spin mx-auto text-primary mb-2" />
                                    </td>
                                </tr>
                            ) : reviews.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-10 text-center text-zinc-500">Belum ada ulasan masuk.</td>
                                </tr>
                            ) : reviews.map((r) => (
                                <tr key={r.id} className="hover:bg-[#222] transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="text-white font-bold">{r.User?.name || 'Anonim'}</div>
                                        <div className="text-xs text-zinc-500">{r.User?.email || '-'}</div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="text-primary font-medium">{r.Product?.name || 'Produk Dihapus'}</div>
                                        <div className="text-xs font-mono text-zinc-500">{r.Order?.invoice_number || '-'}</div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex text-yellow-500 mb-1">
                                            {[...Array(5)].map((_, i) => (
                                                <Star key={i} className={`h-3.5 w-3.5 ${i < r.rating ? 'fill-current' : 'text-zinc-700'}`} />
                                            ))}
                                        </div>
                                        <p className="text-sm italic text-zinc-300 max-w-sm truncate line-clamp-2 white-space-normal">"{r.comment || 'Tidak ada komentar'}"</p>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`px-3 py-1 text-xs font-bold rounded-full ${r.is_visible ? 'bg-green-500/10 text-green-500' : 'bg-zinc-800 text-zinc-400'}`}>
                                            {r.is_visible ? 'Public' : 'Hidden'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            <button
                                                onClick={() => handleToggle(r.id)}
                                                title={r.is_visible ? 'Sembunyikan dari Publik' : 'Tampilkan ke Publik'}
                                                className={`p-2 rounded-lg transition-colors ${r.is_visible ? 'text-zinc-400 hover:text-orange-400 hover:bg-orange-500/10' : 'text-zinc-400 hover:text-green-400 hover:bg-green-500/10'}`}
                                            >
                                                {r.is_visible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                            </button>
                                            <button onClick={() => handleDelete(r.id)} className="p-2 text-red-500/70 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors">
                                                <Trash2 className="h-4 w-4" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
