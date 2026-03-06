'use client';

import Link from "next/link";
import { Gamepad2, Mail, Lock, ArrowLeft, User, Phone, CheckCircle2 } from "lucide-react";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function RegisterPage() {
    const router = useRouter();
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [whatsapp, setWhatsapp] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [successMsg, setSuccessMsg] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setSuccessMsg("");

        if (!name || (!email && !whatsapp) || !password) {
            setError("Nama, Password, dan (Email atau WhatsApp) wajib diisi.");
            return;
        }

        setIsSubmitting(true);

        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/register`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name, email, whatsapp, password })
            });

            const data = await res.json();

            if (res.ok) {
                // Show success message and redirect to login after 2 seconds
                setSuccessMsg("Pendaftaran berhasil! Mengalihkan ke halaman Login...");
                setTimeout(() => {
                    router.push('/login');
                }, 2000);
            } else {
                setError(data.message || "Gagal mendaftar. Periksa kembali data Anda.");
            }
        } catch (err) {
            setError("Gagal terhubung ke server. Coba beberapa saat lagi.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#121212] flex items-center justify-center p-4 relative overflow-hidden">
            {/* Background Decorations */}
            <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none opacity-40">
                <div className="absolute top-[-20%] right-[-10%] w-[500px] h-[500px] bg-primary/20 rounded-full blur-[120px]" />
                <div className="absolute bottom-[-20%] left-[-10%] w-[500px] h-[500px] bg-purple-600/20 rounded-full blur-[120px]" />
            </div>

            <div className="w-full max-w-md bg-[#1a1a1a] rounded-3xl border border-[#2a2a2a] shadow-2xl overflow-hidden relative z-10 my-8">
                <div className="p-8 sm:p-10">

                    {/* Header */}
                    <div className="flex flex-col items-center justify-center space-y-3 mb-8">
                        <Link href="/" className="inline-flex items-center justify-center h-14 w-14 rounded-2xl bg-primary/10 border border-primary/20 mb-2 group transition-transform hover:scale-105">
                            <Gamepad2 className="h-8 w-8 text-primary shadow-primary/50 group-hover:rotate-12 transition-transform" />
                        </Link>
                        <h1 className="text-2xl font-black text-foreground uppercase tracking-wider">
                            Daftar Akun
                        </h1>
                        <p className="text-sm text-muted-foreground text-center">
                            Bergabung dengan ribuan gamer lainnya di <strong className="text-primary font-bold">SamStore</strong>.
                        </p>
                    </div>

                    {error && (
                        <div className="mb-6 p-3 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-sm text-center">
                            {error}
                        </div>
                    )}

                    {successMsg && (
                        <div className="mb-6 p-3 rounded-xl bg-green-500/10 border border-green-500/20 text-green-500 text-sm text-center">
                            {successMsg}
                        </div>
                    )}

                    {/* Form */}
                    <form className="space-y-4" onSubmit={handleSubmit}>
                        <div className="space-y-1.5">
                            <label className="text-sm font-semibold text-foreground/90 ml-1">Nama Lengkap</label>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-muted-foreground group-focus-within:text-primary transition-colors">
                                    <User className="h-5 w-5" />
                                </div>
                                <input
                                    type="text"
                                    placeholder="Masukkan nama Anda"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    className="w-full bg-[#121212] border border-[#2a2a2a] rounded-xl py-3 pl-11 pr-4 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all"
                                />
                            </div>
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-sm font-semibold text-foreground/90 ml-1">Email <span className="text-muted-foreground font-normal">(Opsional)</span></label>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-muted-foreground group-focus-within:text-primary transition-colors">
                                    <Mail className="h-5 w-5" />
                                </div>
                                <input
                                    type="email"
                                    placeholder="nama@email.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full bg-[#121212] border border-[#2a2a2a] rounded-xl py-3 pl-11 pr-4 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all"
                                />
                            </div>
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-sm font-semibold text-foreground/90 ml-1">Nomor WhatsApp</label>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-muted-foreground group-focus-within:text-primary transition-colors">
                                    <Phone className="h-5 w-5" />
                                </div>
                                <input
                                    type="text"
                                    placeholder="081234567890"
                                    value={whatsapp}
                                    onChange={(e) => setWhatsapp(e.target.value)}
                                    className="w-full bg-[#121212] border border-[#2a2a2a] rounded-xl py-3 pl-11 pr-4 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all"
                                />
                            </div>
                            <p className="text-[11px] text-muted-foreground ml-1 mt-1 flex items-center gap-1">
                                <CheckCircle2 className="h-3 w-3 text-green-500" /> WhatsApp digunakan untuk verifikasi pesanan.
                            </p>
                        </div>

                        <div className="space-y-1.5 pt-2">
                            <label className="text-sm font-semibold text-foreground/90 ml-1">Password</label>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-muted-foreground group-focus-within:text-primary transition-colors">
                                    <Lock className="h-5 w-5" />
                                </div>
                                <input
                                    type="password"
                                    placeholder="Buat password yang kuat"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full bg-[#121212] border border-[#2a2a2a] rounded-xl py-3 pl-11 pr-4 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all"
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="w-full flex items-center justify-center h-12 rounded-xl bg-gradient-to-r from-primary to-yellow-500 text-primary-foreground font-bold text-sm shadow-[0_0_15px_rgba(250,204,21,0.3)] hover:shadow-[0_0_25px_rgba(250,204,21,0.5)] transition-all hover:scale-[1.02] mt-6 disabled:opacity-70 disabled:cursor-not-allowed disabled:hover:scale-100"
                        >
                            {isSubmitting ? (
                                <span className="animate-pulse">Memproses...</span>
                            ) : "Buat Akun Baru"}
                        </button>
                    </form>

                    {/* Footer / Login Link */}
                    <div className="mt-8 pt-6 border-t border-[#2a2a2a] text-center">
                        <p className="text-sm text-muted-foreground">
                            Sudah punya akun?{" "}
                            <Link href="/login" className="font-bold text-primary hover:text-yellow-400 hover:underline transition-all">
                                Masuk di sini
                            </Link>
                        </p>

                        <div className="mt-6 flex justify-center">
                            <Link href="/" className="inline-flex items-center text-xs font-medium text-muted-foreground hover:text-foreground transition-colors bg-[#121212] px-4 py-2 rounded-full border border-[#2a2a2a]">
                                <ArrowLeft className="h-3 w-3 mr-1" />
                                Kembali ke Beranda
                            </Link>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
}
