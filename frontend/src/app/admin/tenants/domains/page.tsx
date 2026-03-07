'use client';

import { Globe, Plus, Link, Check, X, AlertCircle } from 'lucide-react';
import { useState } from 'react';

export default function CustomDomainRequestsPage() {
    const [domains] = useState([
        { id: 1, tenant: 'Alfian Store', subdomain: 'alfian.samstore.id', custom: 'alfianstore.com', status: 'pending', date: '2026-03-07' },
        { id: 2, tenant: 'Jago Topup', subdomain: 'jago.samstore.id', custom: 'jagotopup.id', status: 'active', date: '2026-03-05' },
        { id: 3, tenant: 'Gaming Kuy', subdomain: 'gamingkuy.samstore.id', custom: 'gk-store.net', status: 'rejected', date: '2026-03-01', notes: 'Domain belum diarahkan ke IP server Anda' },
    ]);

    return (
        <div className="p-6 max-w-7xl mx-auto">
            <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
                <div>
                    <h1 className="text-3xl font-black text-white flex items-center gap-3">
                        <Globe className="h-8 w-8 text-primary" />
                        Custom Domain Requests
                    </h1>
                    <p className="text-zinc-400 mt-1">Kelola permintaan nama domain khusus dari para agen/reseller Anda.</p>
                </div>
                <div className="bg-primary/10 border border-primary/20 text-primary px-4 py-2.5 rounded-xl font-bold flex items-center gap-2">
                    <AlertCircle className="h-5 w-5" />
                    <span>IP A Record: <span className="text-white font-mono bg-black/50 px-2 py-0.5 rounded ml-1">103.150.xxx.xxx</span></span>
                </div>
            </div>

            <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-3xl overflow-hidden shadow-2xl">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-[#121212] border-b border-[#2a2a2a] text-xs uppercase tracking-wider text-zinc-500 font-bold">
                            <th className="p-5">Tanggal</th>
                            <th className="p-5">Toko (Tenant) / Subdomain</th>
                            <th className="p-5">Permintaan Domain</th>
                            <th className="p-5 text-center">Status</th>
                            <th className="p-5 text-center">Action</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-[#2a2a2a]">
                        {domains.map((req) => (
                            <tr key={req.id} className="hover:bg-white/5 transition-colors group">
                                <td className="p-5 text-sm text-zinc-400 font-mono">{req.date}</td>
                                <td className="p-5">
                                    <div className="font-bold text-white text-lg">{req.tenant}</div>
                                    <div className="text-xs text-zinc-500 font-mono mt-1">{req.subdomain}</div>
                                </td>
                                <td className="p-5 font-mono">
                                    <div className="flex items-center gap-2 group-hover:text-primary transition-colors">
                                        <Link className="h-4 w-4" />
                                        <span className="font-bold text-lg">{req.custom}</span>
                                    </div>
                                    {req.notes && <p className="text-xs text-red-500 mt-1 italic">{req.notes}</p>}
                                </td>
                                <td className="p-5 text-center">
                                    {req.status === 'pending' && <span className="bg-yellow-500/10 text-yellow-500 border border-yellow-500/20 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">Menunggu</span>}
                                    {req.status === 'active' && <span className="bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">Aktif</span>}
                                    {req.status === 'rejected' && <span className="bg-red-500/10 text-red-500 border border-red-500/20 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">Ditolak</span>}
                                </td>
                                <td className="p-5 text-center">
                                    {req.status === 'pending' ? (
                                        <div className="flex justify-center gap-2">
                                            <button className="bg-emerald-500/10 hover:bg-emerald-500 text-emerald-500 hover:text-white p-2 rounded-lg transition-all" title="Setujui (Verify DNS)">
                                                <Check className="h-5 w-5" />
                                            </button>
                                            <button className="bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white p-2 rounded-lg transition-all" title="Tolak / DNS Gagal">
                                                <X className="h-5 w-5" />
                                            </button>
                                        </div>
                                    ) : (
                                        <span className="text-zinc-600 font-mono text-xs">-- Checked --</span>
                                    )}
                                </td>
                            </tr>
                        ))}
                        {domains.length === 0 && (
                            <tr>
                                <td colSpan={5} className="p-10 text-center text-zinc-500">Belum ada pengajuan custom domain.</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
