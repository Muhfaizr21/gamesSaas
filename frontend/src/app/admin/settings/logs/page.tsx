'use client';

import { Server, Activity, ArrowRight, CheckCircle, XCircle, Search, RefreshCw, ShieldAlert } from 'lucide-react';
import { useState } from 'react';

export default function ProviderLogsPage() {
    const [isLoading, setIsLoading] = useState(false);

    // Mock webhooks
    const [logs] = useState([
        { id: '1', provider: 'Digiflazz', event: 'status_update', timestamp: '2026-03-07 14:15:00', status: 'success', payload: '{"data": {"trx_id": "DG123", "status": "Sukses", "sn": "123456789"}}' },
        { id: '2', provider: 'Tripay', event: 'payment_paid', timestamp: '2026-03-07 14:10:00', status: 'success', payload: '{"merchant_ref": "INV-001", "status": "PAID", "reference": "T123"}' },
        { id: '3', provider: 'Digiflazz', event: 'status_update', timestamp: '2026-03-07 14:05:00', status: 'failed', payload: '{"data": {"trx_id": "DG122", "status": "Gagal", "message": "Nomor tujuan salah"}}', error: 'User invalid' },
        { id: '4', provider: 'Digiflazz', event: 'status_update', timestamp: '2026-03-07 14:00:00', status: 'invalid_signature', payload: '{"data":{...}}', error: 'Signature mismatch' },
    ]);

    const refreshLogs = () => {
        setIsLoading(true);
        setTimeout(() => setIsLoading(false), 800);
    };

    return (
        <div className="p-6 max-w-7xl mx-auto">
            <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
                <div>
                    <h1 className="text-3xl font-black text-white flex items-center gap-3">
                        <Server className="h-8 w-8 text-primary" />
                        Provider Webhook Logs
                    </h1>
                    <p className="text-zinc-400 mt-1">Pantau seluruh trafik masuk (callback) dari penyedia ke server pusat Anda.</p>
                </div>
                <div className="flex items-center gap-3">
                    <div className="relative">
                        <input
                            type="text"
                            placeholder="Cari trx_id / invoice..."
                            className="bg-[#1a1a1a] border border-[#333] rounded-xl pl-10 pr-4 py-2.5 text-white focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary w-[250px] text-sm"
                        />
                        <Search className="h-4 w-4 text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    </div>
                    <button
                        onClick={refreshLogs}
                        disabled={isLoading}
                        className="bg-[#2a2a2a] hover:bg-[#333] text-white p-2.5 rounded-xl transition-all"
                    >
                        <RefreshCw className={`h-5 w-5 ${isLoading ? 'animate-spin text-primary' : ''}`} />
                    </button>
                </div>
            </div>

            <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-3xl overflow-hidden shadow-2xl">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-[#121212] border-b border-[#2a2a2a] text-xs uppercase tracking-wider text-zinc-500 font-bold">
                                <th className="p-4">Waktu</th>
                                <th className="p-4">Provider</th>
                                <th className="p-4">Event Type</th>
                                <th className="p-4">Status</th>
                                <th className="p-4">Payload/Message</th>
                                <th className="p-4 text-center">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-[#2a2a2a]">
                            {logs.map((log) => (
                                <tr key={log.id} className="hover:bg-white/5 transition-colors group">
                                    <td className="p-4 text-sm text-zinc-400 font-mono">{log.timestamp}</td>
                                    <td className="p-4">
                                        <div className="flex items-center gap-2">
                                            <div className={`h-2 w-2 rounded-full ${log.provider === 'Digiflazz' ? 'bg-blue-500' : 'bg-indigo-500'}`}></div>
                                            <span className="font-bold text-white">{log.provider}</span>
                                        </div>
                                    </td>
                                    <td className="p-4">
                                        <span className="bg-[#2a2a2a] text-zinc-300 text-xs px-2 py-1 rounded font-mono border border-[#333]">
                                            {log.event}
                                        </span>
                                    </td>
                                    <td className="p-4">
                                        {log.status === 'success' && (
                                            <span className="bg-emerald-500/10 text-emerald-500 text-xs font-bold px-3 py-1 rounded-full flex items-center justify-center gap-1 w-fit border border-emerald-500/20">
                                                <CheckCircle className="h-3 w-3" /> Sukses
                                            </span>
                                        )}
                                        {log.status === 'failed' && (
                                            <span className="bg-red-500/10 text-red-500 text-xs font-bold px-3 py-1 rounded-full flex items-center justify-center gap-1 w-fit border border-red-500/20">
                                                <XCircle className="h-3 w-3" /> Gagal ({log.error})
                                            </span>
                                        )}
                                        {log.status === 'invalid_signature' && (
                                            <span className="bg-yellow-500/10 text-yellow-500 text-xs font-bold px-3 py-1 rounded-full flex items-center justify-center gap-1 w-fit border border-yellow-500/20">
                                                <ShieldAlert className="h-3 w-3" /> Signature Salah
                                            </span>
                                        )}
                                    </td>
                                    <td className="p-4 text-xs font-mono text-zinc-500 max-w-xs truncate cursor-help group-hover:text-primary transition-colors" title={log.payload}>
                                        {log.payload}
                                    </td>
                                    <td className="p-4 text-center">
                                        <button className="bg-[#2a2a2a] hover:bg-primary hover:text-black text-zinc-400 p-2 rounded-lg transition-all" title="Lihat Full JSON">
                                            <ArrowRight className="h-4 w-4" />
                                        </button>
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
