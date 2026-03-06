"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { Plus, Edit, Trash2, PackageSearch, RefreshCw, Percent, Upload, X } from "lucide-react";

interface Voucher {
    id: number;
    name: string;
}

interface Product {
    id: number;
    name: string;
    sku: string;
    price_buy: string;
    price_sell: string;
    stock: number;
    isActive: boolean;
    image_url?: string;
    voucherId: number;
    Voucher?: Voucher;
}

export default function AdminProductPage() {
    const { token } = useAuth();
    const [products, setProducts] = useState<Product[]>([]);
    const [vouchers, setVouchers] = useState<Voucher[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isUploading, setIsUploading] = useState(false);
    const [syncStatus, setSyncStatus] = useState<{ used: number; limit: number; remaining: number; date: string } | null>(null);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [formData, setFormData] = useState({
        id: 0, name: '', sku: '',
        price_buy: '', price_sell: '',
        stock: -1, isActive: true, image_url: '', voucherId: 0
    });

    const handleUploadImage = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file || !token) return;

        setIsUploading(true);
        const uploadData = new FormData();
        uploadData.append('image', file);

        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/upload/product`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` },
                body: uploadData
            });
            const data = await res.json();
            if (res.ok) {
                setFormData(prev => ({ ...prev, image_url: data.fileUrl }));
            } else {
                alert(data.message || 'Gagal upload gambar');
            }
        } catch (error) {
            console.error("Upload Error:", error);
            alert("Terjadi kesalahan saat upload gambar");
        } finally {
            setIsUploading(false);
        }
    };

    const [isMarginModalOpen, setIsMarginModalOpen] = useState(false);
    const [marginData, setMarginData] = useState({
        voucherId: 'all',
        marginPercentage: ''
    });

    useEffect(() => {
        const fetchData = async () => {
            if (!token) return;
            try {
                // Fetch Products
                const resProducts = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/products`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (resProducts.ok) setProducts(await resProducts.json());

                // Fetch Vouchers for Dropdown
                const resVouchers = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/vouchers`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (resVouchers.ok) {
                    const vList = await resVouchers.json();
                    setVouchers(vList);
                    if (formData.voucherId === 0 && vList.length > 0) {
                        setFormData(prev => ({ ...prev, voucherId: vList[0].id }));
                    }
                }
            } catch (error) {
                console.error("Failed to fetch data", error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchData();
    }, [token, formData.voucherId]);

    const fetchSyncStatus = async () => {
        if (!token) return;
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/products/sync-status`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) setSyncStatus(await res.json());
        } catch (e) { console.error(e); }
    };

    useEffect(() => { fetchSyncStatus(); }, [token]);

    const formatCurrency = (amount: number | string) => {
        return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(Number(amount));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const isEdit = formData.id !== 0;
        const method = isEdit ? 'PUT' : 'POST';
        const url = `${process.env.NEXT_PUBLIC_API_URL}/api/admin/products${isEdit ? `/${formData.id}` : ''}`;

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
                const resProducts = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/products`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (resProducts.ok) setProducts(await resProducts.json());

                setIsModalOpen(false);
            } else {
                alert("Gagal menyimpan data produk / item");
            }
        } catch (error) {
            console.error(error);
        }
    };

    const handleDelete = async (id: number) => {
        if (!confirm("Hapus item/produk ini secara permanen?")) return;
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/products/${id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                setProducts(products.filter(p => p.id !== id));
            } else {
                alert("Gagal menghapus produk");
            }
        } catch (error) {
            console.error(error);
        }
    }

    const setEdit = (item: Product) => {
        setFormData({
            id: item.id,
            name: item.name,
            sku: item.sku || '',
            price_buy: item.price_buy,
            price_sell: item.price_sell,
            stock: item.stock,
            isActive: item.isActive,
            image_url: item.image_url || '',
            voucherId: item.voucherId
        });
        setIsModalOpen(true);
    }

    const setCreate = () => {
        setFormData({
            id: 0, name: '', sku: '',
            price_buy: '', price_sell: '',
            stock: -1, isActive: true,
            image_url: '',
            voucherId: vouchers[0]?.id || 0
        });
        setIsModalOpen(true);
    }

    const handleSyncDigiflazz = async () => {
        if (!confirm("Ambil data harga terbaru dari koneksi DigiFlazz sekarang? Proses ini mungkin memakan waktu beberapa detik.")) return;
        setIsLoading(true);
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/products/sync`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await res.json();
            if (res.ok) {
                alert(`✅ Sinkronisasi berhasil!\n${data.new} produk baru ditambahkan\n${data.updated} produk diperbarui`);
            } else {
                alert(`Gagal: ${data.message || "Sinkronisasi gagal"}`);
            }
        } catch (error) {
            console.error(error);
        } finally {
            setIsLoading(false);
            fetchSyncStatus();
            const resProducts = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/products`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (resProducts.ok) setProducts(await resProducts.json());
        }
    }

    const handleMarginSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            const payload = {
                marginPercentage: Number(marginData.marginPercentage),
                voucherId: marginData.voucherId === 'all' ? null : Number(marginData.voucherId)
            };

            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/products/margin`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(payload)
            });

            if (res.ok) {
                const data = await res.json();
                alert(`${data.message}. (${data.updatedCount} produk diperbarui)`);
                setIsMarginModalOpen(false);
                setMarginData({ voucherId: 'all', marginPercentage: '' });

                // Refresh list
                const resProducts = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/products`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (resProducts.ok) setProducts(await resProducts.json());
            } else {
                const err = await res.json();
                alert(`Gagal atur margin: ${err.message}`);
            }
        } catch (error) {
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    };

    if (isLoading) {
        return <div className="text-muted-foreground animate-pulse">Memuat list item produk...</div>;
    }

    return (
        <div className="space-y-6 lg:space-y-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-black text-foreground mb-1 tracking-tight">Daftar Item / Produk</h1>
                    <p className="text-muted-foreground">Kelola item topup, sku, harga modal (provider), dan harga jual ritel.</p>
                    <p className="text-muted-foreground mt-3 text-sm bg-yellow-500/10 text-yellow-500 p-3 border border-yellow-500/20 rounded-xl inline-block max-w-xl">
                        <strong className="text-yellow-400">Info Limit Server:</strong> API DigiFlazz membatasi pengecekan Sinkronisasi maksimal <b>1 Hari beberapa kali saja / 1 Menit sekali</b>. Jika ditekan terlalu sering akan muncul error limit.
                    </p>
                </div>

                <div className="flex items-center gap-3">
                    <button
                        onClick={handleSyncDigiflazz}
                        disabled={isLoading}
                        className="flex items-center gap-2 px-5 py-2.5 bg-blue-600/10 text-blue-500 font-bold rounded-xl hover:bg-blue-600/20 transition-colors w-fit border border-blue-500/20"
                    >
                        {isLoading ? <RefreshCw className="h-5 w-5 animate-spin" /> : <RefreshCw className="h-5 w-5" />}
                        Sync Harga
                    </button>
                    <button
                        onClick={() => setIsMarginModalOpen(true)}
                        disabled={isLoading}
                        className="flex items-center gap-2 px-5 py-2.5 bg-green-500/10 text-green-500 font-bold rounded-xl hover:bg-green-500/20 transition-colors border border-green-500/20 shadow-lg shadow-green-500/10 w-fit"
                    >
                        <Percent className="h-5 w-5" />
                        Atur Margin Global
                    </button>
                    <button
                        onClick={setCreate}
                        disabled={isLoading}
                        className="flex items-center gap-2 px-5 py-2.5 bg-primary text-primary-foreground font-bold rounded-xl hover:bg-yellow-500 transition-colors shadow-lg shadow-primary/20 w-fit"
                    >
                        <Plus className="h-5 w-5" />
                        Tambah Item
                    </button>
                </div>
            </div>

            {/* Rate Limit Indicator */}
            {syncStatus && (
                <div className={`rounded-xl border p-4 flex items-center gap-4 ${syncStatus.remaining === 0
                    ? 'bg-red-500/10 border-red-500/30'
                    : syncStatus.remaining <= 5
                        ? 'bg-yellow-500/10 border-yellow-500/30'
                        : 'bg-[#1a1a1a] border-[#2a2a2a]'
                    }`}>
                    <div className="flex-1">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-semibold text-muted-foreground">
                                🔄 API Sync DigiFlazz — Batas Harian
                            </span>
                            <span className={`text-sm font-bold ${syncStatus.remaining === 0 ? 'text-red-400'
                                : syncStatus.remaining <= 5 ? 'text-yellow-400'
                                    : 'text-green-400'
                                }`}>
                                {syncStatus.used}/{syncStatus.limit} digunakan · {syncStatus.remaining} tersisa
                            </span>
                        </div>
                        <div className="w-full bg-[#2a2a2a] rounded-full h-2 overflow-hidden">
                            <div
                                className={`h-2 rounded-full transition-all duration-500 ${syncStatus.remaining === 0 ? 'bg-red-500'
                                    : syncStatus.remaining <= 5 ? 'bg-yellow-500'
                                        : 'bg-green-500'
                                    }`}
                                style={{ width: `${(syncStatus.used / syncStatus.limit) * 100}%` }}
                            />
                        </div>
                        {syncStatus.remaining === 0 && (
                            <p className="text-xs text-red-400 mt-1.5">⚠️ Limit harian tercapai. Coba lagi besok (reset tengah malam WIB).</p>
                        )}
                        {syncStatus.remaining > 0 && syncStatus.remaining <= 5 && (
                            <p className="text-xs text-yellow-400 mt-1.5">⚠️ Sisa penggunaan API tinggal sedikit hari ini.</p>
                        )}
                    </div>
                </div>
            )}

            <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-2xl overflow-hidden shadow-sm">
                {products.length > 0 ? (
                    <div className="p-6 space-y-4">
                        {Array.from(new Set(products.map(p => p.Voucher?.name || 'Lainnya'))).map(brandName => {
                            const brandProducts = products.filter(p => (p.Voucher?.name || 'Lainnya') === brandName);
                            return (
                                <details key={brandName} className="group border border-[#2a2a2a] rounded-xl overflow-hidden shadow-sm">
                                    <summary className="flex items-center gap-3 p-4 bg-[#1e1e1e] cursor-pointer list-none hover:bg-[#252525] transition-colors outline-none [&::-webkit-details-marker]:hidden">
                                        <div className="w-1.5 h-6 bg-primary rounded-full group-open:bg-primary/50 transition-colors"></div>
                                        <h2 className="text-lg font-bold text-foreground border-r border-[#333] pr-3">
                                            {brandName}
                                        </h2>
                                        <span className="text-xs font-semibold text-muted-foreground bg-[#111] px-2.5 py-1 rounded-md shadow-inner">
                                            {brandProducts.length} Item
                                        </span>
                                        <div className="ml-auto text-muted-foreground group-open:rotate-180 transition-transform duration-300">
                                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                            </svg>
                                        </div>
                                    </summary>

                                    <div className="bg-[#151515] p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                                        {brandProducts.map(p => {
                                            const profit = Number(p.price_sell) - Number(p.price_buy);
                                            const margin = Number(p.price_buy) > 0 ? ((profit / Number(p.price_buy)) * 100).toFixed(1) : 0;

                                            return (
                                                <div key={p.id} className="bg-[#222] border border-[#2a2a2a] hover:border-primary/50 rounded-xl p-4 transition-all group flex flex-col justify-between h-full">
                                                    <div>
                                                        <div className="flex justify-between items-start mb-3 capitalize">
                                                            {p.image_url ? (
                                                                <img
                                                                    src={`${process.env.NEXT_PUBLIC_API_URL}${p.image_url}`}
                                                                    alt={p.name}
                                                                    className="w-10 h-10 rounded-lg object-cover border border-[#333] mb-2"
                                                                    onError={(e) => {
                                                                        const target = e.target as HTMLImageElement;
                                                                        target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(p.name)}&background=1a1a1a&color=fff`;
                                                                    }}
                                                                />
                                                            ) : (
                                                                <div className="w-10 h-10 rounded-lg bg-[#2a2a2a] border border-[#333] flex items-center justify-center text-[10px] font-bold text-muted-foreground mb-2">
                                                                    NO IMG
                                                                </div>
                                                            )}
                                                            <div className="text-right flex flex-col items-end">
                                                                <span className={`px-2 py-1 rounded text-[10px] font-bold border ${p.isActive ? 'bg-green-500/10 text-green-500 border-green-500/20' : 'bg-red-500/10 text-red-500 border-red-500/20'}`}>
                                                                    {p.isActive ? 'AKTIF' : 'NONAKTIF'}
                                                                </span>
                                                                <span className="font-mono text-[10px] text-muted-foreground mt-1">#{p.id}</span>
                                                            </div>
                                                        </div>
                                                        <h3 className="font-bold text-foreground text-base mb-1 line-clamp-2" title={p.name}>{p.name}</h3>
                                                        <p className="font-mono text-xs text-muted-foreground mb-4">SKU: {p.sku || '-'}</p>
                                                    </div>

                                                    <div className="mt-auto pt-4 border-t border-[#333]">
                                                        <div className="flex justify-between items-end mb-1">
                                                            <span className="text-xs text-muted-foreground">Harga Jual</span>
                                                            <span className="font-bold text-foreground text-lg">{formatCurrency(p.price_sell)}</span>
                                                        </div>
                                                        <div className="flex justify-between items-center mb-3">
                                                            <span className="text-xs text-muted-foreground">Modal</span>
                                                            <span className="text-xs text-muted-foreground">{formatCurrency(p.price_buy)}</span>
                                                        </div>

                                                        <div className="flex justify-between items-center bg-[#1a1a1a] rounded-lg p-2.5 mb-4">
                                                            <span className="text-xs font-semibold text-muted-foreground">Est. Profit</span>
                                                            <div className="text-right">
                                                                <span className="font-mono font-bold text-green-400 block max-h-4 leading-none">+{formatCurrency(profit)}</span>
                                                                {Number(p.price_buy) > 0 && (
                                                                    <span className="text-[10px] font-bold text-muted-foreground mt-1 inline-block">
                                                                        Margin: {margin}%
                                                                    </span>
                                                                )}
                                                            </div>
                                                        </div>

                                                        <div className="flex items-center gap-2">
                                                            <button onClick={() => setEdit(p)} className="flex-1 py-2 px-3 rounded-lg bg-blue-500/10 text-blue-500 hover:bg-blue-500/20 text-sm font-bold transition-colors flex items-center justify-center gap-2">
                                                                <Edit className="h-4 w-4" /> Edit
                                                            </button>
                                                            <button onClick={() => handleDelete(p.id)} className="p-2 rounded-lg bg-red-500/10 text-red-500 hover:bg-red-500/20 transition-colors flex items-center justify-center">
                                                                <Trash2 className="h-4 w-4" />
                                                            </button>
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </details>
                            );
                        })}
                    </div>
                ) : (
                    <div className="px-6 py-20 text-center">
                        <div className="inline-flex items-center justify-center p-4 bg-[#2a2a2a] rounded-full mb-4">
                            <PackageSearch className="h-8 w-8 text-muted-foreground" />
                        </div>
                        <p className="text-foreground text-xl font-bold mb-2">Belum Ada Item Produk</p>
                        <p className="text-muted-foreground text-sm max-w-md mx-auto">Tarik data dari DigiFlazz atau klik tombol "Tambah Item" di atas untuk membuat variasi produk topup (misal: 5 Diamond, Weekly Pass).</p>
                    </div>
                )}
            </div>

            {/* Modal Form */}
            {isModalOpen && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto pt-20 pb-10">
                    <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden my-auto">
                        <div className="p-6 border-b border-[#2a2a2a]">
                            <h2 className="text-xl font-bold text-foreground">{formData.id ? 'Edit Item Produk' : 'Tambah Produk Topup'}</h2>
                        </div>
                        <form onSubmit={handleSubmit} className="p-6 space-y-4">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="sm:col-span-2">
                                    <label className="block text-sm font-semibold text-foreground/90 mb-1.5">Nama Nominal (Contoh: 100 Diamond)</label>
                                    <input type="text" required value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="w-full bg-[#121212] border border-[#2a2a2a] rounded-xl py-2.5 px-4 text-foreground focus:outline-none focus:border-primary transition-colors" />
                                </div>
                                <div className="sm:col-span-2">
                                    <label className="block text-sm font-semibold text-foreground/90 mb-1.5">Pilih Game / Voucher Asal</label>
                                    <select required value={formData.voucherId || ""} onChange={(e) => setFormData({ ...formData, voucherId: parseInt(e.target.value) })} className="w-full bg-[#121212] border border-[#2a2a2a] rounded-xl py-2.5 px-4 text-foreground focus:outline-none focus:border-primary transition-colors appearance-none" >
                                        {vouchers.map(v => <option key={v.id} value={v.id}>{v.name}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-foreground/90 mb-1.5">Harga Modal API (Rp)</label>
                                    <input type="number" required value={formData.price_buy} onChange={(e) => setFormData({ ...formData, price_buy: e.target.value })} className="w-full bg-[#121212] border border-[#2a2a2a] rounded-xl py-2.5 px-4 text-foreground font-mono focus:outline-none focus:border-primary transition-colors" />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-foreground/90 mb-1.5">Harga Jual User (Rp)</label>
                                    <input type="number" required value={formData.price_sell} onChange={(e) => setFormData({ ...formData, price_sell: e.target.value })} className="w-full bg-[#121212] border border-[#2a2a2a] rounded-xl py-2.5 px-4 text-foreground font-mono focus:outline-none focus:border-primary transition-colors" />
                                </div>
                                <div className="sm:col-span-2">
                                    <label className="block text-sm font-semibold text-foreground/90 mb-1.5">Kode SKU Provider / DigiFlazz (Opsional)</label>
                                    <input type="text" value={formData.sku} onChange={(e) => setFormData({ ...formData, sku: e.target.value })} className="w-full bg-[#121212] border border-[#2a2a2a] rounded-xl py-2.5 px-4 text-foreground font-mono focus:outline-none focus:border-primary transition-colors" placeholder="misal: ML5" />
                                </div>

                                {/* Product Image Upload */}
                                <div className="sm:col-span-2">
                                    <label className="block text-sm font-semibold text-foreground/90 mb-1.5">Ikon Item (Opsional)</label>
                                    <div className="flex items-center gap-4">
                                        {formData.image_url ? (
                                            <div className="relative group">
                                                <img
                                                    src={`${process.env.NEXT_PUBLIC_API_URL}${formData.image_url}`}
                                                    alt="Preview"
                                                    className="w-16 h-16 rounded-xl object-cover border border-[#333]"
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => setFormData(prev => ({ ...prev, image_url: '' }))}
                                                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                                                >
                                                    <X className="w-3 h-3" />
                                                </button>
                                            </div>
                                        ) : (
                                            <div className="w-16 h-16 rounded-xl border-2 border-dashed border-[#333] flex items-center justify-center bg-[#121212]">
                                                <Upload className="w-5 h-5 text-muted-foreground" />
                                            </div>
                                        )}
                                        <div className="flex-1">
                                            <input
                                                type="file"
                                                accept="image/*"
                                                onChange={handleUploadImage}
                                                disabled={isUploading}
                                                className="block w-full text-xs text-zinc-400
                                                file:mr-3 file:py-2 file:px-4
                                                file:rounded-full file:border-0
                                                file:text-xs file:font-semibold
                                                file:bg-primary/10 file:text-primary
                                                hover:file:bg-primary/20 transition-colors"
                                            />
                                            {isUploading && <p className="text-[10px] text-primary mt-1 animate-pulse">Mengunggah ikon...</p>}
                                        </div>
                                    </div>
                                </div>

                                <div className="sm:col-span-2 flex items-center gap-3 pt-2">
                                    <input type="checkbox" id="isActive" checked={formData.isActive} onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })} className="w-5 h-5 rounded border-gray-600 focus:ring-primary focus:ring-offset-[#1a1a1a] bg-[#121212]" />
                                    <label htmlFor="isActive" className="text-sm font-semibold text-foreground cursor-pointer">Status Aktif (Ditampilkan & Bisa Dibeli)</label>
                                </div>
                            </div>

                            <div className="flex gap-3 pt-4 border-t border-[#2a2a2a] mt-6">
                                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-3 px-4 rounded-xl border border-[#333] font-bold text-foreground hover:bg-[#222] transition-colors">Batal</button>
                                <button type="submit" disabled={vouchers.length === 0} className="flex-1 py-3 px-4 rounded-xl bg-primary text-primary-foreground font-bold hover:bg-yellow-500 transition-colors shadow-lg shadow-primary/20 disabled:opacity-50">Simpan Item</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Modal Margin Bulk Edit */}
            {isMarginModalOpen && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto pt-20 pb-10">
                    <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-2xl w-full max-w-sm shadow-2xl overflow-hidden my-auto">
                        <div className="p-6 border-b border-[#2a2a2a]">
                            <h2 className="text-xl font-bold text-foreground">Atur Margin Jual (%)</h2>
                            <p className="text-sm text-muted-foreground mt-1">Sesuaikan profit untuk banyak opsi sekaligus.</p>
                        </div>
                        <form onSubmit={handleMarginSubmit} className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-semibold text-foreground/90 mb-1.5">Game / Produk Target</label>
                                <select
                                    required
                                    value={marginData.voucherId || ""}
                                    onChange={(e) => setMarginData({ ...marginData, voucherId: e.target.value })}
                                    className="w-full bg-[#121212] border border-[#2a2a2a] rounded-xl py-2.5 px-4 text-foreground focus:outline-none focus:border-primary transition-colors appearance-none"
                                >
                                    <option value="all">Satu Toko (Semua Produk)</option>
                                    {vouchers.map(v => <option key={v.id} value={v.id}>{v.name}</option>)}
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-foreground/90 mb-1.5">Target Keuntungan (%)</label>
                                <div className="relative">
                                    <input
                                        type="number"
                                        step="0.1"
                                        required
                                        placeholder="Contoh: 15"
                                        value={marginData.marginPercentage}
                                        onChange={(e) => setMarginData({ ...marginData, marginPercentage: e.target.value })}
                                        className="w-full bg-[#121212] border border-[#2a2a2a] rounded-xl py-2.5 pr-10 pl-4 text-foreground font-mono focus:outline-none focus:border-primary transition-colors"
                                    />
                                    <Percent className="absolute right-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                </div>
                                <p className="text-xs text-muted-foreground mt-2 leading-relaxed">
                                    Harga jual baru = Modal + Persentase ini. Kami otomatis membulatkan harga ke atas agar tampil cantik.
                                </p>
                            </div>

                            <div className="flex gap-3 pt-4 border-t border-[#2a2a2a] mt-6">
                                <button type="button" onClick={() => setIsMarginModalOpen(false)} className="flex-1 py-3 px-4 rounded-xl border border-[#333] font-bold text-foreground hover:bg-[#222] transition-colors">Batal</button>
                                <button type="submit" disabled={isLoading} className="flex-1 py-3 px-4 rounded-xl bg-green-500 text-white font-bold hover:bg-green-600 transition-colors shadow-lg shadow-green-500/20 disabled:opacity-50">Terapkan Harga</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
