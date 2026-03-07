'use client';

import { useState } from 'react';
import { CreditCard, Save, Link2, ShieldAlert, Key } from 'lucide-react';

export default function PaymentGatewaySettingsPage() {
    const [isLoading, setIsLoading] = useState(false);
    const [formData, setFormData] = useState({
        prismalinkMerchant: 'mock_merchant_123',
        prismalinkKey: 'mock_secret_key_abc',
        tripayApiKey: '',
        tripayPrivateKey: '',
        tripayMerchantCode: '',
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setTimeout(() => {
            setIsLoading(false);
            alert('Pengaturan Payment Gateway berhasil disimpan!');
        }, 1000);
    };

    return (
        <div className="p-6 max-w-5xl mx-auto">
            <div className="mb-8">
                <h1 className="text-3xl font-black text-white flex items-center gap-3">
                    <CreditCard className="h-8 w-8 text-primary" />
                    Payment Gateway
                </h1>
                <p className="text-zinc-400 mt-1">Kelola integrasi gerbang pembayaran untuk seluruh transaksi di platform SaaS Anda.</p>
            </div>

            <form onSubmit={handleSave} className="space-y-6">

                {/* Prismalink Config */}
                <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-2xl p-6 shadow-xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-4">
                        <span className="bg-emerald-500/10 text-emerald-500 text-xs font-bold px-3 py-1 rounded-full">Primary Gateway</span>
                    </div>

                    <div className="flex items-center gap-3 mb-6 pb-4 border-b border-[#2a2a2a]">
                        <div className="h-10 w-10 bg-indigo-500/10 rounded-lg flex items-center justify-center">
                            <Link2 className="h-6 w-6 text-indigo-500" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-white">Prismalink</h2>
                            <p className="text-xs text-zinc-500">Provider VA, QRIS, & E-Wallets Utama</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-5">
                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-zinc-300 flex items-center gap-2">
                                <CreditCard className="h-4 w-4" /> Merchant Code
                            </label>
                            <input
                                type="text"
                                name="prismalinkMerchant"
                                value={formData.prismalinkMerchant}
                                onChange={handleChange}
                                className="w-full bg-[#121212] border border-[#333] rounded-xl px-4 py-3 text-white focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all font-mono"
                                placeholder="Masukkan Merchant Code"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-zinc-300 flex items-center gap-2">
                                <Key className="h-4 w-4" /> Secret Key
                            </label>
                            <input
                                type="password"
                                name="prismalinkKey"
                                value={formData.prismalinkKey}
                                onChange={handleChange}
                                className="w-full bg-[#121212] border border-[#333] rounded-xl px-4 py-3 text-white focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all font-mono"
                                placeholder="Masukkan Secret Key"
                            />
                        </div>
                    </div>

                    <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4 flex gap-4">
                        <ShieldAlert className="h-6 w-6 text-blue-500 flex-shrink-0" />
                        <div>
                            <p className="text-blue-500 font-semibold mb-1">Webhook Configuration</p>
                            <p className="text-sm text-zinc-400 mb-2">Gunakan URL berikut pada notifikasi/webhook di dashboard Prismalink:</p>
                            <code className="block bg-black px-3 py-2 rounded text-primary text-sm border border-[#333]">
                                https://api.domain-anda.com/api/superadmin/callback/prismalink
                            </code>
                        </div>
                    </div>
                </div>

                {/* Tripay Config */}
                <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-2xl p-6 shadow-xl relative opacity-60 hover:opacity-100 transition-opacity">
                    <div className="absolute top-0 right-0 p-4">
                        <span className="bg-zinc-800 text-zinc-400 text-xs font-bold px-3 py-1 rounded-full">Secondary Gateway</span>
                    </div>

                    <div className="flex items-center gap-3 mb-6 pb-4 border-b border-[#2a2a2a]">
                        <div className="h-10 w-10 bg-orange-500/10 rounded-lg flex items-center justify-center">
                            <CreditCard className="h-6 w-6 text-orange-500" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-white">Tripay (Optional)</h2>
                            <p className="text-xs text-zinc-500">Gateway alternatif jika Prismalink gangguan</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 mb-5">
                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-zinc-300">Merchant Code</label>
                            <input
                                type="text"
                                name="tripayMerchantCode"
                                value={formData.tripayMerchantCode}
                                onChange={handleChange}
                                className="w-full bg-[#121212] border border-[#333] rounded-xl px-4 py-3 text-white focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-all font-mono text-sm"
                                placeholder="TXXX..."
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-zinc-300">API Key</label>
                            <input
                                type="password"
                                name="tripayApiKey"
                                value={formData.tripayApiKey}
                                onChange={handleChange}
                                className="w-full bg-[#121212] border border-[#333] rounded-xl px-4 py-3 text-white focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-all font-mono text-sm"
                                placeholder="api_key..."
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-zinc-300">Private Key</label>
                            <input
                                type="password"
                                name="tripayPrivateKey"
                                value={formData.tripayPrivateKey}
                                onChange={handleChange}
                                className="w-full bg-[#121212] border border-[#333] rounded-xl px-4 py-3 text-white focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-all font-mono text-sm"
                                placeholder="private_key..."
                            />
                        </div>
                    </div>
                </div>

                <div className="flex justify-end pt-4">
                    <button
                        type="submit"
                        disabled={isLoading}
                        className="flex items-center gap-2 bg-primary hover:bg-primary/90 text-black px-8 py-3 rounded-xl font-black transition-all shadow-[0_0_20px_rgba(250,204,21,0.3)] disabled:opacity-50 text-lg"
                    >
                        <Save className="h-6 w-6" />
                        {isLoading ? 'Menyimpan...' : 'Simpan Kredensial Gateway'}
                    </button>
                </div>
            </form>
        </div>
    );
}
