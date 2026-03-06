'use client';

import { useState, useEffect } from 'react';
import { Settings, Palette, CheckCircle2, AlertCircle, MessageSquare, Save, Loader2 } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

const THEMES = [
    {
        id: 'default',
        name: 'Default (SamStore Dark)',
        description: 'Tema gelap klasik dengan aksen kuning/emas SAMSTORE.',
        colors: ['#121212', '#1a1a1a', '#facc15']
    },
    {
        id: 'tahun_baru',
        name: 'Tahun Baru',
        description: 'Nuansa gelap elegan Midnight Blue menyambut malam pergantian tahun yang gemerlap.',
        colors: ['#09090b', '#18181b', '#fde047']
    },
    {
        id: 'imlek',
        name: 'Imlek Edition',
        description: 'Rayakan libur Imlek dengan tema dominasi Merah Gelap dan Kuning Emas China.',
        colors: ['#2b0404', '#450a0a', '#fbbf24']
    },
    {
        id: 'natal',
        name: 'Natal (Christmas)',
        description: 'Semarak Natal dengan balutan warna Hijau Pinus Gelap dan aksen Merah Crimson.',
        colors: ['#051a11', '#064e3b', '#dc2626']
    },
    {
        id: 'ramadhan',
        name: 'Ramadhan / Idul Fitri',
        description: 'Kesejukan bulan suci dengan perpaduan Hijau Emerald dan Kuning Gading yang kalem.',
        colors: ['#022c22', '#064e3b', '#fcd34d']
    },
    {
        id: 'kemerdekaan',
        name: 'Kemerdekaan RI',
        description: 'Tema merah dan dominasi aksen putih untuk 17 Agustus-an yang menyala.',
        colors: ['#450a0a', '#7f1d1d', '#f8fafc']
    }
];

export default function AdminSettingsPage() {
    const { token } = useAuth();
    const [currentTheme, setCurrentTheme] = useState('default');
    const [waToken, setWaToken] = useState('');
    const [isSavingTheme, setIsSavingTheme] = useState(false);
    const [isSavingWa, setIsSavingWa] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchSettings = async () => {
            try {
                const [themeRes, waRes] = await Promise.all([
                    fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/public/settings/theme`),
                    fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/settings/whatsapp`, {
                        headers: { 'Authorization': `Bearer ${token}` }
                    })
                ]);

                if (themeRes.ok) {
                    const data = await themeRes.json();
                    setCurrentTheme(data.theme || 'default');
                }
                if (waRes.ok) {
                    const data = await waRes.json();
                    setWaToken(data.token || '');
                }
            } catch (error) {
                console.error("Gagal mengambil pengaturan:", error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchSettings();
    }, []);

    const handleApplyTheme = async (themeId: string) => {
        setIsSavingTheme(true);
        setMessage({ type: '', text: '' });

        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/settings/theme`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ theme: themeId })
            });

            if (res.ok) {
                setCurrentTheme(themeId);
                setMessage({ type: 'success', text: 'Tema berhasil diperbarui! Halaman akan dimuat ulang...' });
                setTimeout(() => {
                    window.location.reload();
                }, 1500);
            } else {
                const error = await res.json();
                setMessage({ type: 'error', text: error.message || 'Gagal memperbarui tema' });
            }
        } catch (error) {
            setMessage({ type: 'error', text: 'Gagal terhubung ke server' });
        } finally {
            setIsSavingTheme(false);
        }
    };

    const handleSaveWaToken = async () => {
        setIsSavingWa(true);
        setMessage({ type: '', text: '' });
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/settings/whatsapp`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ token: waToken })
            });

            if (res.ok) {
                setMessage({ type: 'success', text: 'Token WhatsApp berhasil disimpan!' });
            } else {
                const error = await res.json();
                setMessage({ type: 'error', text: error.message || 'Gagal menyimpan token WA' });
            }
        } catch (error) {
            setMessage({ type: 'error', text: 'Gagal terhubung ke server' });
        } finally {
            setIsSavingWa(false);
        }
    };

    if (isLoading) {
        return <div className="p-8 text-center text-muted-foreground animate-pulse">Memuat pengaturan...</div>;
    }

    return (
        <div className="p-8 max-w-5xl mx-auto">
            <div className="flex items-center gap-3 mb-8">
                <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center">
                    <Settings className="h-6 w-6 text-primary" />
                </div>
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-foreground">Pengaturan Sistem</h1>
                    <p className="text-muted-foreground">Kelola konfigurasi global aplikasi SamStore.</p>
                </div>
            </div>

            {message.text && (
                <div className={`mb-6 p-4 rounded-xl flex items-center gap-3 ${message.type === 'success' ? 'bg-green-500/10 text-green-500 border border-green-500/20' : 'bg-red-500/10 text-red-500 border border-red-500/20'}`}>
                    {message.type === 'success' ? <CheckCircle2 className="h-5 w-5" /> : <AlertCircle className="h-5 w-5" />}
                    <p className="font-medium text-sm">{message.text}</p>
                </div>
            )}

            <div className="space-y-8">
                {/* Event Theme Section */}
                <section className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-2xl overflow-hidden p-6 md:p-8">
                    <div className="flex items-start gap-3 mb-6">
                        <Palette className="h-6 w-6 text-primary shrink-0 mt-1" />
                        <div>
                            <h2 className="text-xl font-bold text-foreground">Tema Spesial (Event)</h2>
                            <p className="text-sm text-muted-foreground mt-1">
                                Ubah tampilan dan nuansa website secara global untuk menyambut acara khusus. Perubahan akan langsung terlihat oleh semua pengunjung.
                            </p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {THEMES.map((theme) => {
                            const isActive = currentTheme === theme.id;
                            return (
                                <div
                                    key={theme.id}
                                    className={`relative p-5 rounded-xl border-2 transition-all duration-300 ${isActive ? 'border-primary bg-primary/5' : 'border-[#2a2a2a] bg-[#121212] hover:border-[#3a3a3a]'} flex flex-col h-full`}
                                >
                                    {isActive && (
                                        <div className="absolute top-4 right-4 bg-primary text-primary-foreground text-xs font-bold px-2 py-1 rounded-md flex items-center gap-1 shadow-sm shadow-primary/20">
                                            <CheckCircle2 className="h-3 w-3" /> Aktif
                                        </div>
                                    )}
                                    <h3 className="text-lg font-bold text-foreground mb-1 pr-16">{theme.name}</h3>
                                    <p className="text-sm text-muted-foreground mb-4 flex-1">{theme.description}</p>

                                    <div className="flex items-center gap-2 mb-5">
                                        {theme.colors.map((color, idx) => (
                                            <div
                                                key={idx}
                                                className="w-8 h-8 rounded-full border border-white/10 shadow-sm"
                                                style={{ backgroundColor: color }}
                                                title={`Color snippet: ${color}`}
                                            />
                                        ))}
                                    </div>

                                    <button
                                        onClick={() => handleApplyTheme(theme.id)}
                                        disabled={isActive || isSavingTheme}
                                        className={`w-full py-2.5 rounded-lg text-sm font-semibold transition-all ${isActive ? 'bg-[#2a2a2a] text-muted-foreground cursor-not-allowed' : 'bg-primary text-primary-foreground hover:bg-primary/90 hover:scale-[1.02] shadow-[0_0_15px_rgba(250,204,21,0.2)]'}`}
                                    >
                                        {isActive ? 'Tema Dipakai' : (isSavingTheme ? 'Menerapkan...' : 'Terapkan Tema Ini')}
                                    </button>
                                </div>
                            );
                        })}
                    </div>
                </section>

                {/* WhatsApp Token Section */}
                <section className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-2xl overflow-hidden p-6 md:p-8">
                    <div className="flex items-start gap-3 mb-6">
                        <MessageSquare className="h-6 w-6 text-green-500 shrink-0 mt-1" />
                        <div>
                            <h2 className="text-xl font-bold text-foreground">WhatsApp API (Fonnte)</h2>
                            <p className="text-sm text-muted-foreground mt-1">
                                Konfigurasi token API Fonnte untuk mengaktifkan notifikasi WhatsApp otomatis ke pengguna saat transaksi dibuat, sukses, atau gagal.
                            </p>
                        </div>
                    </div>

                    <div className="bg-[#121212] border border-[#2a2a2a] rounded-xl p-5">
                        <label className="block text-sm font-semibold text-foreground mb-2">
                            Token API Fonnte
                        </label>
                        <div className="flex gap-3">
                            <input
                                type="text"
                                value={waToken}
                                onChange={(e) => setWaToken(e.target.value)}
                                placeholder="Masukkan token Fonnte Anda di sini..."
                                className="flex-1 bg-[#1a1a1a] border border-[#333] rounded-lg px-4 py-2.5 text-foreground text-sm focus:outline-none focus:border-primary transition-colors font-mono"
                            />
                            <button
                                onClick={handleSaveWaToken}
                                disabled={isSavingWa}
                                className="px-6 py-2.5 bg-primary text-black font-bold rounded-lg hover:bg-primary/90 transition-all flex items-center gap-2 whitespace-nowrap disabled:opacity-70 disabled:cursor-not-allowed text-sm"
                            >
                                {isSavingWa ? (
                                    <><Loader2 className="h-4 w-4 animate-spin" /> Menyimpan...</>
                                ) : (
                                    <><Save className="h-4 w-4" /> Simpan Token</>
                                )}
                            </button>
                        </div>
                        <p className="text-xs text-muted-foreground mt-3 flex items-center gap-1.5">
                            <AlertCircle className="h-3.5 w-3.5" />
                            Dapatkan token API Anda di <a href="https://fonnte.com" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline font-medium">fonnte.com</a>. Kosongkan untuk menonaktifkan fitur WhatsApp blast.
                        </p>
                    </div>
                </section>
            </div>
        </div>
    );
}
