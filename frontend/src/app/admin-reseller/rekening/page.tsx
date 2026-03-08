'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/context/AuthContext';
import {
    BanknoteIcon, Plus, Pencil, Trash2, X, CheckCircle2,
    AlertCircle, Loader2, ToggleLeft, ToggleRight, Building2,
    Wallet, GripVertical, Save
} from 'lucide-react';

interface BankAccount {
    id: number;
    bank_name: string;
    account_number: string;
    account_name: string;
    bank_type: 'bank' | 'ewallet';
    is_active: boolean;
    sort_order: number;
}

const emptyForm = {
    bank_name: '',
    account_number: '',
    account_name: '',
    bank_type: 'bank' as 'bank' | 'ewallet',
    is_active: true,
    sort_order: 0
};

const POPULAR_BANKS = ['BCA', 'BRI', 'BNI', 'Mandiri', 'BSI', 'CIMB Niaga', 'Permata'];
const POPULAR_EWALLETS = ['GoPay', 'OVO', 'DANA', 'ShopeePay', 'LinkAja'];

function Alert({ type, text }: { type: 'success' | 'error'; text: string }) {
    return (
        <div className={`flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-medium ${type === 'success' ? 'bg-green-500/10 text-green-400 border border-green-500/20' : 'bg-red-500/10 text-red-400 border border-red-500/20'}`}>
            {type === 'success' ? <CheckCircle2 className="h-4 w-4 shrink-0" /> : <AlertCircle className="h-4 w-4 shrink-0" />}
            {text}
        </div>
    );
}

export default function AdminRekeningPage() {
    const { token } = useAuth();
    const [accounts, setAccounts] = useState<BankAccount[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingAccount, setEditingAccount] = useState<BankAccount | null>(null);
    const [form, setForm] = useState(emptyForm);
    const [isSaving, setIsSaving] = useState(false);
    const [deleteId, setDeleteId] = useState<number | null>(null);
    const [msg, setMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

    const headers = { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` };

    const fetchAccounts = useCallback(async () => {
        setIsLoading(true);
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/bank-accounts`, { headers });
            const data = await res.json();
            setAccounts(Array.isArray(data) ? data : []);
        } catch {
            setMsg({ type: 'error', text: 'Gagal memuat data rekening.' });
        } finally {
            setIsLoading(false);
        }
    }, [token]);

    useEffect(() => { fetchAccounts(); }, [fetchAccounts]);

    const openAddModal = () => {
        setEditingAccount(null);
        setForm(emptyForm);
        setShowModal(true);
    };

    const openEditModal = (acc: BankAccount) => {
        setEditingAccount(acc);
        setForm({
            bank_name: acc.bank_name,
            account_number: acc.account_number,
            account_name: acc.account_name,
            bank_type: acc.bank_type,
            is_active: acc.is_active,
            sort_order: acc.sort_order
        });
        setShowModal(true);
    };

    const handleSave = async () => {
        if (!form.bank_name || !form.account_number || !form.account_name) {
            return setMsg({ type: 'error', text: 'Nama bank, nomor rekening, dan atas nama wajib diisi.' });
        }
        setIsSaving(true);
        setMsg(null);
        try {
            const url = editingAccount
                ? `${process.env.NEXT_PUBLIC_API_URL}/api/admin/bank-accounts/${editingAccount.id}`
                : `${process.env.NEXT_PUBLIC_API_URL}/api/admin/bank-accounts`;
            const method = editingAccount ? 'PUT' : 'POST';
            const res = await fetch(url, { method, headers, body: JSON.stringify(form) });
            if (res.ok) {
                setMsg({ type: 'success', text: editingAccount ? 'Rekening berhasil diperbarui.' : 'Rekening berhasil ditambahkan.' });
                setShowModal(false);
                fetchAccounts();
            } else {
                const err = await res.json();
                setMsg({ type: 'error', text: err.message || 'Gagal menyimpan rekening.' });
            }
        } catch {
            setMsg({ type: 'error', text: 'Gagal terhubung ke server.' });
        } finally {
            setIsSaving(false);
        }
    };

    const handleToggleActive = async (acc: BankAccount) => {
        try {
            await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/bank-accounts/${acc.id}`, {
                method: 'PUT',
                headers,
                body: JSON.stringify({ ...acc, is_active: !acc.is_active })
            });
            fetchAccounts();
        } catch {
            setMsg({ type: 'error', text: 'Gagal mengubah status rekening.' });
        }
    };

    const handleDelete = async () => {
        if (!deleteId) return;
        try {
            await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/bank-accounts/${deleteId}`, { method: 'DELETE', headers });
            setDeleteId(null);
            setMsg({ type: 'success', text: 'Rekening berhasil dihapus.' });
            fetchAccounts();
        } catch {
            setMsg({ type: 'error', text: 'Gagal menghapus rekening.' });
        }
    };

    return (
        <div className="max-w-5xl mx-auto">
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-3">
                    <div className="h-12 w-12 rounded-2xl bg-green-500/10 flex items-center justify-center">
                        <BanknoteIcon className="h-6 w-6 text-green-400" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-black text-foreground">Rekening Bank</h1>
                        <p className="text-sm text-muted-foreground">Kelola rekening tujuan deposit user</p>
                    </div>
                </div>
                <button
                    onClick={openAddModal}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-black font-bold text-sm hover:bg-yellow-300 transition-all shadow-[0_0_15px_rgba(250,204,21,0.2)]"
                >
                    <Plus className="h-4 w-4" /> Tambah Rekening
                </button>
            </div>

            {msg && (
                <div className="mb-6">
                    <Alert type={msg.type} text={msg.text} />
                </div>
            )}

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4 mb-6">
                {[
                    { label: 'Total Rekening', value: accounts.length, icon: <BanknoteIcon className="h-5 w-5 text-primary" />, color: 'primary' },
                    { label: 'Aktif', value: accounts.filter(a => a.is_active).length, icon: <CheckCircle2 className="h-5 w-5 text-green-400" />, color: 'green' },
                    { label: 'Non-aktif', value: accounts.filter(a => !a.is_active).length, icon: <AlertCircle className="h-5 w-5 text-zinc-500" />, color: 'zinc' },
                ].map(s => (
                    <div key={s.label} className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-2xl p-4 flex items-center gap-3">
                        <div className="h-10 w-10 rounded-xl bg-[#252525] flex items-center justify-center shrink-0">{s.icon}</div>
                        <div>
                            <p className="text-xs text-muted-foreground">{s.label}</p>
                            <p className="text-2xl font-black text-foreground">{s.value}</p>
                        </div>
                    </div>
                ))}
            </div>

            {/* Accounts Table */}
            <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-2xl overflow-hidden">
                {isLoading ? (
                    <div className="flex items-center justify-center py-20">
                        <Loader2 className="h-7 w-7 text-primary animate-spin" />
                    </div>
                ) : accounts.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 text-center">
                        <BanknoteIcon className="h-12 w-12 text-muted-foreground opacity-30 mb-3" />
                        <p className="font-bold text-foreground">Belum ada rekening</p>
                        <p className="text-sm text-muted-foreground mt-1">Tambah rekening bank atau e-wallet untuk ditampilkan ke user</p>
                    </div>
                ) : (
                    <table className="w-full">
                        <thead className="border-b border-[#2a2a2a]">
                            <tr className="text-xs font-bold uppercase text-muted-foreground/60 tracking-wider">
                                <th className="px-6 py-4 text-left">Bank / E-Wallet</th>
                                <th className="px-6 py-4 text-left">Nomor</th>
                                <th className="px-6 py-4 text-left">Atas Nama</th>
                                <th className="px-6 py-4 text-center">Tipe</th>
                                <th className="px-6 py-4 text-center">Status</th>
                                <th className="px-6 py-4 text-right">Aksi</th>
                            </tr>
                        </thead>
                        <tbody>
                            {accounts.map((acc, idx) => (
                                <tr key={acc.id} className={`border-b border-[#252525] hover:bg-[#222] transition-colors ${idx === accounts.length - 1 ? 'border-0' : ''}`}>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="h-9 w-14 rounded-lg bg-[#252525] border border-[#2a2a2a] flex items-center justify-center">
                                                <span className="text-xs font-black text-primary">{acc.bank_name.substring(0, 4).toUpperCase()}</span>
                                            </div>
                                            <span className="font-bold text-sm text-foreground">{acc.bank_name}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 font-mono text-sm text-foreground">{acc.account_number}</td>
                                    <td className="px-6 py-4 text-sm text-muted-foreground">{acc.account_name}</td>
                                    <td className="px-6 py-4 text-center">
                                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold ${acc.bank_type === 'bank' ? 'bg-blue-500/15 text-blue-400' : 'bg-purple-500/15 text-purple-400'}`}>
                                            {acc.bank_type === 'bank' ? <Building2 className="h-3 w-3" /> : <Wallet className="h-3 w-3" />}
                                            {acc.bank_type === 'bank' ? 'Bank' : 'E-Wallet'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        <button onClick={() => handleToggleActive(acc)} className="group flex items-center justify-center">
                                            {acc.is_active
                                                ? <ToggleRight className="h-6 w-6 text-green-400 group-hover:text-green-300 transition-colors" />
                                                : <ToggleLeft className="h-6 w-6 text-zinc-600 group-hover:text-zinc-400 transition-colors" />
                                            }
                                        </button>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center justify-end gap-2">
                                            <button
                                                onClick={() => openEditModal(acc)}
                                                className="h-8 w-8 rounded-lg bg-[#252525] hover:bg-blue-500/15 hover:text-blue-400 text-muted-foreground flex items-center justify-center transition-all"
                                            >
                                                <Pencil className="h-3.5 w-3.5" />
                                            </button>
                                            <button
                                                onClick={() => setDeleteId(acc.id)}
                                                className="h-8 w-8 rounded-lg bg-[#252525] hover:bg-red-500/15 hover:text-red-400 text-muted-foreground flex items-center justify-center transition-all"
                                            >
                                                <Trash2 className="h-3.5 w-3.5" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>

            {/* Add/Edit Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-2xl w-full max-w-md shadow-2xl">
                        <div className="flex items-center justify-between p-6 border-b border-[#2a2a2a]">
                            <h3 className="text-lg font-bold text-foreground">
                                {editingAccount ? 'Edit Rekening' : 'Tambah Rekening Baru'}
                            </h3>
                            <button onClick={() => setShowModal(false)} className="h-8 w-8 rounded-lg bg-[#252525] hover:bg-[#333] text-muted-foreground flex items-center justify-center transition-all">
                                <X className="h-4 w-4" />
                            </button>
                        </div>
                        <div className="p-6 space-y-4">
                            {/* Bank Type Toggle */}
                            <div>
                                <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">Tipe Rekening</label>
                                <div className="grid grid-cols-2 gap-2">
                                    {(['bank', 'ewallet'] as const).map(type => (
                                        <button
                                            key={type}
                                            onClick={() => setForm(f => ({ ...f, bank_type: type }))}
                                            className={`flex items-center justify-center gap-2 py-2 rounded-xl text-sm font-bold border transition-all ${form.bank_type === type ? 'bg-primary/15 border-primary/40 text-primary' : 'bg-[#121212] border-[#333] text-muted-foreground hover:border-[#444]'}`}
                                        >
                                            {type === 'bank' ? <Building2 className="h-4 w-4" /> : <Wallet className="h-4 w-4" />}
                                            {type === 'bank' ? 'Bank Transfer' : 'E-Wallet'}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Quick Select */}
                            <div>
                                <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">Pilih Cepat</label>
                                <div className="flex flex-wrap gap-1.5">
                                    {(form.bank_type === 'bank' ? POPULAR_BANKS : POPULAR_EWALLETS).map(name => (
                                        <button
                                            key={name}
                                            onClick={() => setForm(f => ({ ...f, bank_name: name }))}
                                            className={`px-3 py-1 rounded-lg text-xs font-bold border transition-all ${form.bank_name === name ? 'bg-primary/15 border-primary/40 text-primary' : 'bg-[#121212] border-[#333] text-muted-foreground hover:border-primary/30 hover:text-foreground'}`}
                                        >
                                            {name}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Fields */}
                            {[
                                { label: 'Nama Bank / E-Wallet', key: 'bank_name', placeholder: 'contoh: BCA' },
                                { label: 'Nomor Rekening / Nomor HP', key: 'account_number', placeholder: '1234567890' },
                                { label: 'Atas Nama', key: 'account_name', placeholder: 'SAM STORE' },
                            ].map(field => (
                                <div key={field.key}>
                                    <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1.5">{field.label}</label>
                                    <input
                                        type="text"
                                        value={(form as any)[field.key]}
                                        onChange={e => setForm(f => ({ ...f, [field.key]: e.target.value }))}
                                        placeholder={field.placeholder}
                                        className="w-full h-10 px-3 rounded-xl bg-[#121212] border border-[#2a2a2a] text-foreground text-sm placeholder:text-muted-foreground/40 focus:outline-none focus:border-primary transition-all"
                                    />
                                </div>
                            ))}

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1.5">Urutan Tampil</label>
                                    <input
                                        type="number"
                                        value={form.sort_order}
                                        onChange={e => setForm(f => ({ ...f, sort_order: parseInt(e.target.value) || 0 }))}
                                        className="w-full h-10 px-3 rounded-xl bg-[#121212] border border-[#2a2a2a] text-foreground text-sm focus:outline-none focus:border-primary transition-all"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1.5">Status</label>
                                    <button
                                        onClick={() => setForm(f => ({ ...f, is_active: !f.is_active }))}
                                        className={`w-full h-10 px-3 rounded-xl border text-sm font-bold flex items-center justify-center gap-2 transition-all ${form.is_active ? 'bg-green-500/15 border-green-500/30 text-green-400' : 'bg-[#121212] border-[#333] text-muted-foreground'}`}
                                    >
                                        {form.is_active ? <ToggleRight className="h-4 w-4" /> : <ToggleLeft className="h-4 w-4" />}
                                        {form.is_active ? 'Aktif' : 'Non-aktif'}
                                    </button>
                                </div>
                            </div>
                        </div>
                        <div className="px-6 pb-6 flex gap-3">
                            <button onClick={() => setShowModal(false)} className="flex-1 h-10 rounded-xl border border-[#333] text-muted-foreground text-sm font-bold hover:bg-[#252525] transition-all">
                                Batal
                            </button>
                            <button
                                onClick={handleSave}
                                disabled={isSaving}
                                className="flex-1 h-10 rounded-xl bg-primary text-black text-sm font-bold flex items-center justify-center gap-2 hover:bg-yellow-300 disabled:opacity-60 transition-all"
                            >
                                {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                                {isSaving ? 'Menyimpan...' : 'Simpan'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Delete Confirm Modal */}
            {deleteId && (
                <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-2xl w-full max-w-sm p-6 text-center shadow-2xl">
                        <div className="h-14 w-14 rounded-2xl bg-red-500/15 flex items-center justify-center mx-auto mb-4">
                            <Trash2 className="h-7 w-7 text-red-400" />
                        </div>
                        <h3 className="text-lg font-bold text-foreground mb-2">Hapus Rekening?</h3>
                        <p className="text-sm text-muted-foreground mb-6">Rekening ini akan dihapus permanen dan tidak akan ditampilkan ke user.</p>
                        <div className="flex gap-3">
                            <button onClick={() => setDeleteId(null)} className="flex-1 h-10 rounded-xl border border-[#333] text-muted-foreground text-sm font-bold hover:bg-[#252525] transition-all">
                                Batal
                            </button>
                            <button onClick={handleDelete} className="flex-1 h-10 rounded-xl bg-red-500 text-white text-sm font-bold hover:bg-red-400 transition-all">
                                Hapus
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
