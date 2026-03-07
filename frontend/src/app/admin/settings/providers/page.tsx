'use client';

import { useState, useEffect } from 'react';
import { Link, Save, RefreshCw, Key, User, CheckCircle, ShieldAlert } from 'lucide-react';

export default function ProviderSettingsPage() {
    const [isLoading, setIsLoading] = useState(false);
    const [balance, setBalance] = useState<number | null>(null);
    const [formData, setFormData] = useState({
        digiflazzUsername: 'mock_username',
        digiflazzKey: 'mock_key_abc123',
        vipApiKey: '',
    });

    // Mock fetch data
    useEffect(() => {
        // Fetch provider settings from API
    }, []);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        // Simulate API call
        setTimeout(() => {
            setIsLoading(false);
            alert('Pengaturan API Provider berhasil disimpan!');
        }, 1000);
    };

    const checkBalance = () => {
        setIsLoading(true);
        // Simulate checking balance from Digiflazz
        setTimeout(() => {
            setBalance(15050000);
            setIsLoading(false);
        }, 1500);
    };

    return (
        <div className="p-6 max-w-5xl mx-auto">
            <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
                <div>
                    <h1 className="text-3xl font-black text-white flex items-center gap-3">
                        <Link className="h-8 w-8 text-primary" />
                        Integrasi API Provider
                    </h1>
                    <p className="text-zinc-400 mt-1">Kelola kredensial penyedia produk digital (H2H) untuk platform SaaS Anda.</p>
                </div>
                <button
                    onClick={checkBalance}
                    disabled={isLoading}
                    className="flex items-center gap-2 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white px-5 py-2.5 rounded-xl font-bold transition-all shadow-lg shadow-emerald-500/20 disabled:opacity-50"
                >
                    <RefreshCw className={`h-5 w-5 ${isLoading ? 'animate-spin' : ''}`} />
                    {balance !== null ? 'Refresh Saldo' : 'Cek Saldo Pusat'}
                </button>
            </div>

            {/* Cek Saldo Card */}
            {balance !== null && (
                <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-2xl p-6 mb-8 flex items-center justify-between">
                    <div>
                        <p className="text-emerald-400 font-semibold mb-1 flex items-center gap-2">
                            <CheckCircle className="h-5 w-5" />
                            Koneksi API Digiflazz Aktif
                        </p>
                        <h3 className="text-3xl font-black text-white">
                            Rp {balance.toLocaleString('id-ID')}
                        </h3>
                        <p className="text-zinc-400 text-sm mt-1">Saldo pusat platform Anda saat ini.</p>
                    </div>
                </div>
            )}

            <div className="grid grid-cols-1 gap-6">
                {/* Digiflazz Config */}
                <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-2xl p-6 shadow-xl">
                    <div className="flex items-center gap-3 mb-6 pb-4 border-b border-[#2a2a2a]">
                        <div className="h-10 w-10 bg-blue-500/10 rounded-lg flex items-center justify-center">
                            <Link className="h-6 w-6 text-blue-500" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-white">Kredensial Digiflazz</h2>
                            <p className="text-xs text-zinc-500">Provider utama untuk produk Pulsa & Game</p>
                        </div>
                    </div>

                    <form onSubmit={handleSave} className="space-y-5">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-zinc-300 flex items-center gap-2">
                                    <User className="h-4 w-4" /> Username Digiflazz
                                </label>
                                <input
                                    type="text"
                                    name="digiflazzUsername"
                                    value={formData.digiflazzUsername}
                                    onChange={handleChange}
                                    className="w-full bg-[#121212] border border-[#333] rounded-xl px-4 py-3 text-white focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
                                    placeholder="Masukkan username H2H"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-zinc-300 flex items-center gap-2">
                                    <Key className="h-4 w-4" /> Production API Key
                                </label>
                                <input
                                    type="password"
                                    name="digiflazzKey"
                                    value={formData.digiflazzKey}
                                    onChange={handleChange}
                                    className="w-full bg-[#121212] border border-[#333] rounded-xl px-4 py-3 text-white focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all font-mono"
                                    placeholder="Masukkan production key"
                                />
                            </div>
                        </div>

                        <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-xl p-4 flex gap-4">
                            <ShieldAlert className="h-6 w-6 text-yellow-500 flex-shrink-0" />
                            <div>
                                <p className="text-yellow-500 font-semibold mb-1">Webhook URL Configuration</p>
                                <p className="text-sm text-zinc-400 mb-2">Pastikan Anda memasukkan URL Callback ini di pengaturan webhook dashboard Digiflazz Anda:</p>
                                <code className="block bg-black px-3 py-2 rounded text-primary text-sm border border-[#333]">
                                    https://api.domain-anda.com/api/superadmin/callback/digiflazz
                                </code>
                            </div>
                        </div>

                        <div className="flex justify-end pt-4">
                            <button
                                type="submit"
                                disabled={isLoading}
                                className="flex items-center gap-2 bg-primary hover:bg-primary/90 text-black px-6 py-3 rounded-xl font-bold transition-all shadow-[0_0_20px_rgba(250,204,21,0.3)] disabled:opacity-50"
                            >
                                <Save className="h-5 w-5" />
                                {isLoading ? 'Menyimpan...' : 'Simpan Kredensial'}
                            </button>
                        </div>
                    </form>
                </div>

                {/* You can add more providers here (VIP Reseller, Apigames, dll) */}

            </div>
        </div>
    );
}
