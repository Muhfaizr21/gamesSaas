'use client';

import { useState } from 'react';
import { ListVideo, Plus, Edit, Trash2, Check, Video, MonitorPlay } from 'lucide-react';

export default function SaaSPlansPage() {
    const [plans, setPlans] = useState([
        { id: 1, name: 'Basic Starter', price: 0, durationDays: 30, features: ['Subdomain Otomatis', 'Gratis Saldo Awal', '1000 Maks Transaksi'], isActive: true },
        { id: 2, name: 'Pro Business', price: 150000, durationDays: 30, features: ['Subdomain Otomatis', 'Custom Domain', 'Tanpa Batas Transaksi', 'Spin Wheel & Gacha', 'Fitur Reseller'], isActive: true },
    ]);

    return (
        <div className="p-6 max-w-6xl mx-auto">
            <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
                <div>
                    <h1 className="text-3xl font-black text-white flex items-center gap-3">
                        <ListVideo className="h-8 w-8 text-primary" />
                        Paket Langganan SaaS
                    </h1>
                    <p className="text-zinc-400 mt-1">Kelola harga berlangganan bulanan untuk para reseller atau penyewa toko.</p>
                </div>
                <button className="flex items-center gap-2 bg-primary hover:bg-primary/90 text-black px-5 py-2.5 rounded-xl font-bold transition-all shadow-lg shadow-primary/20">
                    <Plus className="h-5 w-5" />
                    Buat Paket Baru
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {plans.map((plan) => (
                    <div key={plan.id} className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-3xl p-6 shadow-xl relative overflow-hidden group hover:border-primary/50 transition-all">
                        {/* Status Badge */}
                        <div className={`absolute top-4 right-4 text-xs font-bold px-3 py-1 rounded-full ${plan.isActive ? 'bg-emerald-500/10 text-emerald-500' : 'bg-red-500/10 text-red-500'}`}>
                            {plan.isActive ? 'AKTIF' : 'NONAKTIF'}
                        </div>

                        <div className="mb-6">
                            <div className="h-12 w-12 bg-primary/10 rounded-xl flex items-center justify-center mb-4 border border-primary/20">
                                {plan.price > 0 ? <MonitorPlay className="h-6 w-6 text-primary" /> : <Video className="h-6 w-6 text-primary" />}
                            </div>
                            <h2 className="text-2xl font-black text-white">{plan.name}</h2>
                            <p className="text-zinc-400 text-sm mt-1">{plan.durationDays} Hari Akses</p>
                        </div>

                        <div className="mb-6">
                            <span className="text-4xl font-black text-white">
                                {plan.price === 0 ? 'Gratis' : `Rp ${(plan.price / 1000)}k`}
                            </span>
                            {plan.price > 0 && <span className="text-zinc-500"> / bulan</span>}
                        </div>

                        <ul className="space-y-3 mb-8">
                            {plan.features.map((feature, idx) => (
                                <li key={idx} className="flex flex-start gap-3 items-center text-sm text-zinc-300">
                                    <Check className="h-5 w-5 text-emerald-500 flex-shrink-0" />
                                    <span>{feature}</span>
                                </li>
                            ))}
                        </ul>

                        <div className="flex gap-3">
                            <button className="flex-1 flex items-center justify-center gap-2 bg-[#2a2a2a] hover:bg-[#333] text-white py-3 rounded-xl font-bold transition-all group-hover:bg-primary group-hover:text-black">
                                <Edit className="h-4 w-4" /> Edit
                            </button>
                            <button className="flex items-center justify-center bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white p-3 rounded-xl transition-all">
                                <Trash2 className="h-5 w-5" />
                            </button>
                        </div>
                    </div>
                ))}

                {/* Placeholder Add New */}
                <div className="bg-[#121212] border-2 border-dashed border-[#2a2a2a] hover:border-primary/50 rounded-3xl p-6 shadow-xl flex flex-col items-center justify-center min-h-[400px] cursor-pointer transition-all group">
                    <div className="h-16 w-16 bg-[#1a1a1a] group-hover:bg-primary border border-[#2a2a2a] group-hover:border-primary rounded-full flex items-center justify-center mb-4 transition-all shadow-lg">
                        <Plus className="h-8 w-8 text-zinc-500 group-hover:text-black transition-all" />
                    </div>
                    <h3 className="text-xl font-bold text-zinc-400 group-hover:text-white transition-all">Tambah Paket</h3>
                    <p className="text-zinc-500 text-sm mt-2 text-center">Buat variasi harga berlangganan baru untuk ditawarkan.</p>
                </div>
            </div>
        </div>
    );
}
