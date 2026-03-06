'use client';

import Link from "next/link";
import { Gamepad2, Mail, Lock, LogIn, ArrowLeft } from "lucide-react";
import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter, useSearchParams } from "next/navigation";

export default function LoginPage() {
    const [identifier, setIdentifier] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    const { login, user } = useAuth();
    const router = useRouter();
    const searchParams = useSearchParams();
    const redirectUrl = searchParams?.get('redirect');

    useEffect(() => {
        if (user) {
            if (redirectUrl) {
                router.push(redirectUrl);
            } else if (user.role === 'admin') {
                router.push('/admin');
            } else if (user.role === 'writer') {
                router.push('/writer');
            } else {
                router.push('/dashboard');
            }
        }
    }, [user, router, redirectUrl]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");

        if (!identifier || !password) {
            setError("Harap isi Email/WhatsApp dan Password.");
            return;
        }

        setIsSubmitting(true);

        try {
            // Determine if identifier is email or whatsapp
            const isEmail = identifier.includes('@');
            const payload = isEmail
                ? { email: identifier, password }
                : { whatsapp: identifier, password };

            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/login`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload)
            });

            const data = await res.json();

            if (res.ok) {
                login(data.token, data.user);
            } else {
                setError(data.message || "Gagal masuk. Periksa kembali data Anda.");
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
                <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] bg-primary/20 rounded-full blur-[120px]" />
                <div className="absolute bottom-[-20%] right-[-10%] w-[500px] h-[500px] bg-purple-600/20 rounded-full blur-[120px]" />
            </div>

            <div className="w-full max-w-md bg-[#1a1a1a] rounded-3xl border border-[#2a2a2a] shadow-2xl overflow-hidden relative z-10">
                <div className="p-8 sm:p-10">

                    {/* Header */}
                    <div className="flex flex-col items-center justify-center space-y-3 mb-8">
                        <Link href="/" className="inline-flex items-center justify-center h-14 w-14 rounded-2xl bg-primary/10 border border-primary/20 mb-2 group transition-transform hover:scale-105">
                            <Gamepad2 className="h-8 w-8 text-primary shadow-primary/50 group-hover:rotate-12 transition-transform" />
                        </Link>
                        <h1 className="text-2xl font-black text-foreground uppercase tracking-wider">
                            SAM<span className="text-primary">STORE</span>
                        </h1>
                        <p className="text-sm text-muted-foreground text-center">
                            Masuk ke akun Anda untuk top up lebih cepat dan dapatkan promo menarik.
                        </p>
                    </div>

                    {error && (
                        <div className="mb-6 p-3 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-sm text-center">
                            {error}
                        </div>
                    )}

                    {/* Form */}
                    <form className="space-y-5" onSubmit={handleSubmit}>
                        <div className="space-y-1.5">
                            <label className="text-sm font-semibold text-foreground/90 ml-1">Email / WhatsApp</label>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-muted-foreground group-focus-within:text-primary transition-colors">
                                    <Mail className="h-5 w-5" />
                                </div>
                                <input
                                    type="text"
                                    placeholder="nama@email.com atau 0812..."
                                    value={identifier}
                                    onChange={(e) => setIdentifier(e.target.value)}
                                    className="w-full bg-[#121212] border border-[#2a2a2a] rounded-xl py-3 pl-11 pr-4 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all"
                                />
                            </div>
                        </div>

                        <div className="space-y-1.5">
                            <div className="flex items-center justify-between ml-1">
                                <label className="text-sm font-semibold text-foreground/90">Password</label>
                                <Link href="/forgot-password" className="text-xs font-medium text-primary hover:text-yellow-400 transition-colors">
                                    Lupa Password?
                                </Link>
                            </div>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-muted-foreground group-focus-within:text-primary transition-colors">
                                    <Lock className="h-5 w-5" />
                                </div>
                                <input
                                    type="password"
                                    placeholder="••••••••"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full bg-[#121212] border border-[#2a2a2a] rounded-xl py-3 pl-11 pr-4 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all"
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="w-full flex items-center justify-center h-12 rounded-xl bg-gradient-to-r from-primary to-yellow-500 text-primary-foreground font-bold text-sm shadow-[0_0_15px_rgba(250,204,21,0.3)] hover:shadow-[0_0_25px_rgba(250,204,21,0.5)] transition-all hover:scale-[1.02] mt-4 disabled:opacity-70 disabled:cursor-not-allowed disabled:hover:scale-100"
                        >
                            {isSubmitting ? (
                                <span className="animate-pulse">Memproses...</span>
                            ) : (
                                <>
                                    <LogIn className="h-5 w-5 mr-2" />
                                    Masuk Sekarang
                                </>
                            )}
                        </button>
                    </form>

                    {/* Footer / Register Link */}
                    <div className="mt-8 pt-6 border-t border-[#2a2a2a] text-center">
                        <p className="text-sm text-muted-foreground">
                            Belum punya akun?{" "}
                            <Link href="/register" className="font-bold text-primary hover:text-yellow-400 hover:underline transition-all">
                                Daftar di sini
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
