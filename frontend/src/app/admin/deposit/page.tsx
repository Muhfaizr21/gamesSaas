"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { Search, Wallet, CheckCircle, XCircle, Clock } from "lucide-react";

interface Deposit {
    id: number;
    amount: number;
    payment_method: string;
    status: string;
    note: string;
    userId: number;
    createdAt: string;
    User?: {
        name: string;
        email: string;
    }
}

export default function AdminDepositPage() {
    const { token } = useAuth();
    const [deposits, setDeposits] = useState<Deposit[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");

    const fetchDeposits = async () => {
        if (!token) return;
        try {
            // Note: Endpoint ini perlu dibuat di adminRoutes/adminController jika belum
            // Untuk sementara kita gunakan mock data atau endpoint placeholder
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/deposits`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                const data = await res.json();
                setDeposits(data);
            } else {
                setDeposits([]);
            }
        } catch (error) {
            console.error("Failed to fetch deposits", error);
            setDeposits([]);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchDeposits();
    }, [token]);

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(amount);
    };

    const handleAction = async (depositId: number, action: 'approve' | 'reject') => {
        if (!confirm(`Yakin ingin ${action === 'approve' ? 'Menyetujui' : 'Menolak'} deposit ini?`)) return;

        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/deposits/${depositId}/${action}`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (res.ok) {
                fetchDeposits();
            } else {
                alert(`Gagal memproses deposit. Pastikan endpoint backend tersedia.`);
            }
        } catch (error) {
            console.error(error);
        }
    }

    const filteredDeposits = deposits.filter(d =>
        (d.User?.name || "").toLowerCase().includes(searchQuery.toLowerCase())
    );

    if (isLoading) {
        return <div className="text-muted-foreground animate-pulse">Memuat riwayat deposit...</div>;
    }

    return (
        <div className="space-y-6 lg:space-y-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-black text-foreground mb-1 tracking-tight">Mutasi <span className="text-primary">Saldo</span></h1>
                    <p className="text-muted-foreground">Kelola permintaan pengisian saldo (Deposit) dari pengguna.</p>
                </div>

                <div className="relative w-full sm:w-80">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Search className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <input
                        type="text"
                        placeholder="Cari Username/Nama..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl py-2.5 pl-10 pr-4 text-foreground text-sm focus:outline-none focus:border-primary transition-colors"
                    />
                </div>
            </div>

            <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-2xl overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm whitespace-nowrap">
                        <thead className="bg-[#222] text-muted-foreground text-xs uppercase tracking-wider">
                            <tr>
                                <th className="px-6 py-4 font-semibold">TANGGAL</th>
                                <th className="px-6 py-4 font-semibold">PENGGUNA</th>
                                <th className="px-6 py-4 font-semibold">NOMINAL</th>
                                <th className="px-6 py-4 font-semibold">METODE</th>
                                <th className="px-6 py-4 font-semibold text-center">STATUS</th>
                                <th className="px-6 py-4 font-semibold text-right">AKSI</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-[#2a2a2a]">
                            {filteredDeposits.length > 0 ? (
                                filteredDeposits.map((d) => (
                                    <tr key={d.id} className="hover:bg-[#222]/50 transition-colors">
                                        <td className="px-6 py-4 text-muted-foreground whitespace-pre-line">
                                            {new Date(d.createdAt).toLocaleString('id-ID').replace(', ', '\n')}
                                        </td>
                                        <td className="px-6 py-4">
                                            <p className="font-bold text-foreground mb-0.5">{d.User?.name}</p>
                                            <p className="text-xs text-muted-foreground">{d.User?.email}</p>
                                        </td>
                                        <td className="px-6 py-4 font-mono font-medium text-green-400 text-base">
                                            +{formatCurrency(d.amount)}
                                        </td>
                                        <td className="px-6 py-4 uppercase font-semibold text-muted-foreground text-xs">
                                            {d.payment_method || 'MANUAL'}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex justify-center">
                                                <span className={`px-2.5 py-1 rounded-md text-[10px] font-bold border uppercase flex items-center gap-1 w-max ${d.status === 'Success' ? 'bg-green-500/10 text-green-500 border-green-500/20' : d.status === 'Failed' ? 'bg-red-500/10 text-red-500 border-red-500/20' : 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20'}`}>
                                                    {d.status === 'Success' && <CheckCircle className="h-3 w-3" />}
                                                    {d.status === 'Failed' && <XCircle className="h-3 w-3" />}
                                                    {d.status === 'Pending' && <Clock className="h-3 w-3" />}
                                                    {d.status}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            {d.status === 'Pending' ? (
                                                <div className="flex justify-end gap-2">
                                                    <button onClick={() => handleAction(d.id, 'reject')} className="px-3 py-1.5 rounded-lg border border-red-500/20 bg-red-500/10 text-red-500 text-xs font-bold hover:bg-red-500/20 transition-colors">Tolak</button>
                                                    <button onClick={() => handleAction(d.id, 'approve')} className="px-3 py-1.5 rounded-lg border border-green-500/20 bg-green-500/10 text-green-500 text-xs font-bold hover:bg-green-500/20 transition-colors">Terima</button>
                                                </div>
                                            ) : (
                                                <span className="text-muted-foreground text-xs font-semibold italic">Selesai</span>
                                            )}
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={6} className="px-6 py-16 text-center">
                                        <div className="inline-flex items-center justify-center p-4 bg-[#2a2a2a] rounded-full mb-4">
                                            <Wallet className="h-8 w-8 text-muted-foreground" />
                                        </div>
                                        <p className="text-foreground font-bold mb-1">Tidak Ada Riwayat Deposit</p>
                                        <p className="text-muted-foreground text-sm max-w-sm mx-auto">Kami tidak menemukan data mutasi saldo / deposit pengguna.</p>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
