"use client";

import { motion } from 'framer-motion';
import { Shield, Lock, Eye, CheckCircle2 } from 'lucide-react';

export default function PrivacyPage() {
    return (
        <div className="min-h-screen bg-background pt-24 pb-12">
            <div className="container mx-auto px-4 max-w-4xl">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-[#111] border border-white/5 rounded-3xl p-8 md:p-12 shadow-2xl"
                >
                    <header className="mb-12 text-center">
                        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-purple-500/10 mb-6">
                            <Shield className="text-purple-400 w-8 h-8" />
                        </div>
                        <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-white to-zinc-500 bg-clip-text text-transparent">
                            Kebijakan Privasi
                        </h1>
                        <p className="text-zinc-400">Menjaga privasi Anda adalah prioritas kami.</p>
                    </header>

                    <div className="space-y-10 text-zinc-300 leading-relaxed">
                        <section>
                            <h2 className="text-xl font-bold flex items-center gap-2 text-white mb-4">
                                <Eye className="w-5 h-5 text-purple-400" />
                                1. Informasi yang Kami Kumpulkan
                            </h2>
                            <p>
                                Kami mengumpulkan informasi yang Anda berikan saat melakukan transaksi, termasuk ID Game, Nomor WhatsApp, dan detail pembayaran. Kami tidak pernah meminta kata sandi (password) game Anda.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-xl font-bold flex items-center gap-2 text-white mb-4">
                                <Lock className="w-5 h-5 text-purple-400" />
                                2. Pengamanan Data
                            </h2>
                            <p>
                                Data Anda disimpan secara aman dan dienkripsi di server kami. Kami menggunakan protokol SSL (HTTPS) untuk memastikan setiap data yang dikirimkan terproteksi dari pihak yang tidak bertanggung jawab.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-xl font-bold flex items-center gap-2 text-white mb-4">
                                <CheckCircle2 className="w-5 h-5 text-purple-400" />
                                3. Penggunaan Informasi
                            </h2>
                            <p>Informasi Anda digunakan untuk:</p>
                            <ul className="list-disc pl-5 space-y-2 mt-2">
                                <li>Memproses pesanan topup Anda secara otomatis.</li>
                                <li>Mengirimkan notifikasi invoice dan status transaksi melalui WhatsApp.</li>
                                <li>Meningkatkan kualitas layanan kami berdasarkan pengalaman Anda.</li>
                            </ul>
                        </section>

                        <section className="bg-[#1a1a1a] p-6 rounded-2xl border border-white/5 mt-8">
                            <p className="text-sm text-center italic">
                                SamStore berkomitmen untuk tidak pernah menjual atau menyebarkan data pribadi Anda kepada pihak ketiga manapun untuk kepentingan komersial.
                            </p>
                        </section>
                    </div>
                </motion.div>
            </div>
        </div>
    );
}
