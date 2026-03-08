"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { Search, Edit, Shield, ShieldAlert, CirclePlus, CircleMinus, User as UserIcon } from "lucide-react";

interface User {
    id: number;
    name: string;
    email: string;
    whatsapp: string;
    role: string;
    balance: number;
    createdAt: string;
}

export default function AdminUsersPage() {
    const { token, user: currentUser } = useAuth();
    const [users, setUsers] = useState<User[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");

    const fetchUsers = async () => {
        if (!token) return;
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/users`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                const data = await res.json();
                setUsers(data);
            }
        } catch (error) {
            console.error("Failed to fetch users", error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, [token]);

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(amount);
    };

    const handleRoleChange = async (userId: number, currentRole: string) => {
        if (!confirm(`Konfirmasi perubahan role untuk user ini?`)) return;
        const newRole = currentRole === 'admin' ? 'user' : 'admin';

        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/users/${userId}/role`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ role: newRole })
            });

            if (res.ok) {
                fetchUsers(); // Refresh data
            } else {
                alert("Gagal memperbarui role");
            }
        } catch (error) {
            console.error(error);
        }
    };

    const handleBalanceAdjust = async (userId: number, type: 'add' | 'deduct') => {
        const amountStr = prompt(`Masukkan nominal saldo yang akan di${type === 'add' ? 'tambahkan' : 'potong'}:`);
        if (!amountStr) return;

        const amount = parseFloat(amountStr);
        if (isNaN(amount) || amount <= 0) {
            alert("Nominal tidak valid!");
            return;
        }

        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/users/${userId}/adjust-balance`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ amount, type })
            });

            if (res.ok) {
                fetchUsers(); // Refresh data
            } else {
                alert("Gagal menyesuaikan saldo");
            }
        } catch (error) {
            console.error(error);
        }
    };

    const filteredUsers = users.filter(user =>
        (user.name || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
        (user.email || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
        (user.whatsapp || "").toLowerCase().includes(searchQuery.toLowerCase())
    );

    if (isLoading) {
        return <div className="text-muted-foreground animate-pulse">Memuat data pengguna...</div>;
    }

    return (
        <div className="space-y-6 lg:space-y-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-black text-foreground mb-1 tracking-tight">Manajemen <span className="text-primary">Pengguna</span></h1>
                    <p className="text-muted-foreground">Kelola hak akses, saldo, dan data pengguna SamStore.</p>
                </div>

                <div className="relative w-full sm:w-72">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Search className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <input
                        type="text"
                        placeholder="Cari nama / email..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl py-2.5 pl-10 pr-4 text-foreground text-sm focus:outline-none focus:border-primary transition-colors"
                    />
                </div>
            </div>

            <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-2xl overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm whitespace-nowrap">
                        <thead className="bg-[#222] text-muted-foreground">
                            <tr>
                                <th className="px-6 py-4 font-semibold w-12">ID</th>
                                <th className="px-6 py-4 font-semibold">PENGGUNA</th>
                                <th className="px-6 py-4 font-semibold">ROLE</th>
                                <th className="px-6 py-4 font-semibold">SALDO KOTAK</th>
                                <th className="px-6 py-4 font-semibold text-right">AKSI CEPAT</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-[#2a2a2a]">
                            {filteredUsers.length > 0 ? (
                                filteredUsers.map((user) => (
                                    <tr key={user.id} className="hover:bg-[#222]/50 transition-colors">
                                        <td className="px-6 py-4 text-muted-foreground">#{user.id}</td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="h-8 w-8 rounded-full bg-primary/20 text-primary flex items-center justify-center shrink-0">
                                                    <UserIcon className="h-4 w-4" />
                                                </div>
                                                <div>
                                                    <p className="font-bold text-foreground">{user.name}</p>
                                                    <p className="text-xs text-muted-foreground">{user.email || user.whatsapp}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <button
                                                onClick={() => handleRoleChange(user.id, user.role)}
                                                disabled={user.id === currentUser?.id}
                                                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold w-fit border transition-colors ${user.role === 'admin' ? 'bg-primary/10 text-primary border-primary/20 hover:bg-primary/20' : 'bg-[#2a2a2a] text-muted-foreground border-transparent hover:border-[#333]'}`}
                                                title={user.id === currentUser?.id ? "Milik Sendiri" : "Klik untuk Ubah Role"}
                                            >
                                                {user.role === 'admin' ? <Shield className="h-3 w-3" /> : <ShieldAlert className="h-3 w-3" />}
                                                {user.role}
                                            </button>
                                        </td>
                                        <td className="px-6 py-4 font-mono font-medium text-green-400">
                                            {formatCurrency(user.balance || 0)}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <button
                                                    onClick={() => handleBalanceAdjust(user.id, 'add')}
                                                    className="p-2 h-8 w-8 rounded-lg bg-green-500/10 text-green-500 hover:bg-green-500/20 transition-colors flex items-center justify-center"
                                                    title="Tambah Saldo"
                                                >
                                                    <CirclePlus className="h-4 w-4" />
                                                </button>
                                                <button
                                                    onClick={() => handleBalanceAdjust(user.id, 'deduct')}
                                                    className="p-2 h-8 w-8 rounded-lg bg-red-500/10 text-red-500 hover:bg-red-500/20 transition-colors flex items-center justify-center"
                                                    title="Potong Saldo"
                                                >
                                                    <CircleMinus className="h-4 w-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={5} className="px-6 py-12 text-center">
                                        <div className="inline-flex items-center justify-center p-4 bg-[#2a2a2a] rounded-full mb-4">
                                            <Search className="h-6 w-6 text-muted-foreground" />
                                        </div>
                                        <p className="text-muted-foreground font-medium">Tidak ada data pengguna yang ditemukan.</p>
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
