"use client";

import { motion } from 'framer-motion';
import { ShieldAlert, FileText, Scale, ShieldCheck } from 'lucide-react';

export default function TermsPage() {
    return (
        <div className="min-h-screen bg-background pt-24 pb-12">
            <div className="container mx-auto px-4 max-w-4xl">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-[#111] border border-white/5 rounded-3xl p-8 md:p-12 shadow-2xl"
                >
                    <header className="mb-12 text-center">
                        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-blue-500/10 mb-6">
                            <Scale className="text-blue-400 w-8 h-8" />
                        </div>
                        <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-white to-zinc-500 bg-clip-text text-transparent">
                            Syarat & Ketentuan
                        </h1>
                        <p className="text-zinc-400">Terakhir diperbarui: 5 Maret 2026</p>
                    </header>

                    <div className="space-y-10 text-zinc-300 leading-relaxed">
                        <section>
                            <h2 className="text-xl font-bold flex items-center gap-2 text-white mb-4">
                                <ShieldCheck className="w-5 h-5 text-blue-400" />
                                1. Penggunaan Layanan
                            </h2>
                            <p>
                                Dengan mengakses dan menggunakan SamStore, Anda setuju untuk terikat oleh Syarat dan Ketentuan ini. Layanan kami disediakan "sebagaimana adanya" untuk memfasilitasi kebutuhan topup game Anda secara aman dan cepat.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-xl font-bold flex items-center gap-2 text-white mb-4">
                                <FileText className="w-5 h-5 text-blue-400" />
                                2. Kewajiban Pengguna
                            </h2>
                            <ul className="list-disc pl-5 space-y-2">
                                <li>Pengguna wajib memberikan informasi ID Game dan Server yang benar.</li>
                                <li>Kesalahan pengisian data oleh pengguna sepenuhnya menjadi tanggung jawab pengguna.</li>
                                <li>Dilarang menggunakan layanan kami untuk aktivitas ilegal atau penipuan.</li>
                            </ul>
                        </section>

                        <section>
                            <h2 className="text-xl font-bold flex items-center gap-2 text-white mb-4">
                                <ShieldAlert className="w-5 h-5 text-red-400" />
                                3. Pembatalan & Pengembalian
                            </h2>
                            <p>
                                Karena sifat produk digital yang dikirim secara instan, pesanan yang sudah diproses dan sukses tidak dapat dibatalkan atau dikembalikan (Refund). Jika terjadi kendala sistem, kami akan melakukan verifikasi maksimal 1x24 jam.
                            </p>
                        </section>

                        <section className="p-6 bg-blue-500/5 rounded-2xl border border-blue-500/10">
                            <p className="text-sm italic">
                                Catatan: Syarat dan ketentuan ini dapat berubah sewaktu-waktu tanpa pemberitahuan sebelumnya. Kami menyarankan Anda untuk membacanya secara berkala.
                            </p>
                        </section>
                    </div>
                </motion.div>
            </div>
        </div>
    );
}
