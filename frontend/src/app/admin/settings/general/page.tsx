'use client';

import { useState } from 'react';
import { Settings, Percent, CircleDollarSign, Save, AlertTriangle } from 'lucide-react';

export default function GeneralSettingsPage() {
    const [isLoading, setIsLoading] = useState(false);
    const [formData, setFormData] = useState({
        markupPercent: 5,
        markupFixed: 500,
        appName: 'SAMSTORE SaaS',
        supportWa: '081234567890'
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        // Simulate API call
        setTimeout(() => {
            setIsLoading(false);
            alert('Pengaturan Global berhasil disimpan!');
        }, 1000);
    };

    return (
        <div className="p-6 max-w-5xl mx-auto">
            <div className="mb-8">
                <h1 className="text-3xl font-black text-white flex items-center gap-3">
                    <Settings className="h-8 w-8 text-primary" />
                    General & Global Margin
                </h1>
                <p className="text-zinc-400 mt-1">Atur nama platform SaaS dan keuntungan dari penjualan semua reseller.</p>
            </div>

            <form onSubmit={handleSave} className="space-y-6">

                {/* General Info */}
                <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-2xl p-6 shadow-xl">
                    <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2 border-b border-[#2a2a2a] pb-4">
                        <Settings className="h-5 w-5 text-zinc-400" /> Informasi Platform Dasar
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-zinc-300">Nama SaaS Platform</label>
                            <input
                                type="text"
                                name="appName"
                                value={formData.appName}
                                onChange={handleChange}
                                className="w-full bg-[#121212] border border-[#333] rounded-xl px-4 py-3 text-white focus:outline-none focus:border-primary transition-all"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-zinc-300">WhatsApp Bantuan (CS Pusat)</label>
                            <input
                                type="text"
                                name="supportWa"
                                value={formData.supportWa}
                                onChange={handleChange}
                                className="w-full bg-[#121212] border border-[#333] rounded-xl px-4 py-3 text-white focus:outline-none focus:border-primary transition-all font-mono"
                            />
                        </div>
                    </div>
                </div>

                {/* Pricing Margin Config */}
                <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-2xl p-6 shadow-xl border-t-4 border-t-primary">
                    <h2 className="text-xl font-bold text-white mb-2 flex items-center gap-2">
                        <CircleDollarSign className="h-5 w-5 text-primary" /> Global Markup Keuntungan
                    </h2>
                    <p className="text-zinc-400 text-sm mb-6 pb-4 border-b border-[#2a2a2a]">
                        Tentukan margin otomatis yang akan ditambahkan dari harga dasar (API Provider) untuk diteruskan ke Tenant / Reseller.
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Markup Persentase */}
                        <div className="bg-[#121212] border border-[#333] rounded-xl p-5 hover:border-primary/50 transition-colors">
                            <div className="flex justify-between items-start mb-4">
                                <div>
                                    <h3 className="font-bold text-white flex items-center gap-2">Markup Persentase</h3>
                                    <p className="text-xs text-zinc-500 mt-1">Ditambahkan sekian persen dari harga asli.</p>
                                </div>
                                <Percent className="h-6 w-6 text-primary" />
                            </div>
                            <div className="relative">
                                <input
                                    type="number"
                                    name="markupPercent"
                                    value={formData.markupPercent}
                                    onChange={handleChange}
                                    className="w-full bg-black border border-[#333] rounded-lg pl-4 pr-10 py-3 text-white text-lg font-bold focus:outline-none focus:border-primary transition-all"
                                />
                                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-400 text-lg font-bold">%</span>
                            </div>
                        </div>

                        {/* Markup Fix */}
                        <div className="bg-[#121212] border border-[#333] rounded-xl p-5 hover:border-primary/50 transition-colors">
                            <div className="flex justify-between items-start mb-4">
                                <div>
                                    <h3 className="font-bold text-white flex items-center gap-2">Markup Tetap (Fix)</h3>
                                    <p className="text-xs text-zinc-500 mt-1">Ditambahkan nominal pas setelah markup persen.</p>
                                </div>
                                <p className="h-6 w-full text-right text-primary font-black uppercase tracking-widest text-lg">Rp</p>
                            </div>
                            <div className="relative">
                                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 text-lg font-bold">Rp</span>
                                <input
                                    type="number"
                                    name="markupFixed"
                                    value={formData.markupFixed}
                                    onChange={handleChange}
                                    className="w-full bg-black border border-[#333] rounded-lg pl-12 pr-4 py-3 text-white text-lg font-bold focus:outline-none focus:border-primary transition-all"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Simulasi Harga */}
                    <div className="mt-6 bg-primary/5 border border-primary/20 rounded-xl p-5">
                        <div className="flex items-center gap-3 mb-3">
                            <AlertTriangle className="h-5 w-5 text-primary" />
                            <h3 className="font-bold text-white">Simulasi Perhitungan Harga Modal Reseller</h3>
                        </div>
                        <ul className="space-y-2 text-sm text-zinc-300 font-mono bg-black/50 p-4 rounded-lg">
                            <li className="flex justify-between border-b border-white/10 pb-2">
                                <span>1. Harga Asli dari Provider (Contoh Digiflazz):</span>
                                <span className="font-bold">Rp 10,000</span>
                            </li>
                            <li className="flex justify-between border-b border-white/10 pb-2 text-primary">
                                <span>2. Markup Persen (+{formData.markupPercent}%):</span>
                                <span>+ Rp {(10000 * (Number(formData.markupPercent) / 100)).toLocaleString()}</span>
                            </li>
                            <li className="flex justify-between border-b border-white/10 pb-2 text-primary">
                                <span>3. Markup Fix (+Rp {formData.markupFixed}):</span>
                                <span>+ Rp {Number(formData.markupFixed).toLocaleString()}</span>
                            </li>
                            <li className="flex justify-between pt-2 text-white font-black text-lg">
                                <span>TOTAL HARGA MODAL RESELLER:</span>
                                <span>Rp {(10000 + (10000 * (Number(formData.markupPercent) / 100)) + Number(formData.markupFixed)).toLocaleString()}</span>
                            </li>
                        </ul>
                    </div>

                </div>

                <div className="flex justify-end pt-4">
                    <button
                        type="submit"
                        disabled={isLoading}
                        className="flex items-center gap-2 bg-primary hover:bg-primary/90 text-black px-8 py-3 rounded-xl font-black transition-all shadow-[0_0_20px_rgba(250,204,21,0.3)] disabled:opacity-50 text-lg"
                    >
                        <Save className="h-6 w-6" />
                        {isLoading ? 'Menyimpan...' : 'Simpan Konfigurasi'}
                    </button>
                </div>

            </form>
        </div>
    );
}
