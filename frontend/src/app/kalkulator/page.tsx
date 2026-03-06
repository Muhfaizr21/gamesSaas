'use client';

import { Calculator, Percent, Swords, Target } from "lucide-react";
import { useState } from "react";

export default function KalkulatorPage() {
    const [totalMatches, setTotalMatches] = useState<number | ''>('');
    const [currentWr, setCurrentWr] = useState<number | ''>('');
    const [targetWr, setTargetWr] = useState<number | ''>('');
    const [result, setResult] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    const calculateWR = () => {
        setError(null);
        setResult(null);

        if (!totalMatches || !currentWr || !targetWr) {
            setError("Semua kolom harus diisi!");
            return;
        }

        const tMatches = Number(totalMatches);
        const cWr = Number(currentWr);
        const tWr = Number(targetWr);

        if (tWr >= 100) {
            setError("Kezhaliman tingkat dewa! Target WR tidak boleh 100% atau lebih.");
            return;
        }
        if (tWr <= cWr) {
            setError("Target WR harus lebih besar dari WR saat ini, ngab!");
            return;
        }

        // Logic (Win Rate MLBB)
        // tMatches = current total Matches
        // cWr = current WR
        // tWr = Target WR
        // Rumus: (Total Win + Win Baru) / (Total Match + Match Baru) = Target WR / 100

        const totalWin = (tMatches * cWr) / 100;
        // x = (tMatches * tWr - 100 * totalWin) / (100 - tWr)

        const x = (tMatches * tWr - 100 * totalWin) / (100 - tWr);

        const requiredMatches = Math.ceil(x);

        setResult(`Kamu butuh sekitar **${requiredMatches}** kemenangan tanpa kalah (win streak) untuk mencapai WR **${tWr}%**!`);
    };
    return (
        <div className="min-h-screen bg-[#121212] py-12 px-4">
            <div className="container mx-auto max-w-2xl">

                {/* Header */}
                <div className="text-center mb-10">
                    <div className="inline-flex items-center justify-center p-4 bg-primary/10 rounded-full mb-4">
                        <Calculator className="h-8 w-8 text-primary" />
                    </div>
                    <h1 className="text-3xl font-black text-foreground tracking-tight uppercase mb-2">
                        Kalkulator <span className="text-primary">Win Rate (WR)</span>
                    </h1>
                    <p className="text-muted-foreground">Hitung berapa match yang dibutuhkan untuk mencapai Target Win Rate Anda.</p>
                </div>

                {/* Form Card */}
                <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-3xl p-6 sm:p-10 shadow-2xl relative overflow-hidden">
                    <div className="absolute top-[-20%] right-[-10%] w-[300px] h-[300px] bg-primary/10 rounded-full blur-[80px] pointer-events-none" />

                    <form className="space-y-6 relative z-10">
                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-foreground/90 ml-1">Total Pertandingan (Matches)</label>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-muted-foreground">
                                    <Swords className="h-5 w-5" />
                                </div>
                                <input
                                    type="number"
                                    value={totalMatches}
                                    onChange={(e) => setTotalMatches(e.target.value ? Number(e.target.value) : '')}
                                    placeholder="Contoh: 154"
                                    className="w-full bg-[#121212] border border-[#2a2a2a] rounded-xl py-4 pl-12 pr-4 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all font-medium"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-foreground/90 ml-1">Total Win Rate Saat Ini (%)</label>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-muted-foreground">
                                    <Percent className="h-5 w-5" />
                                </div>
                                <input
                                    type="number"
                                    value={currentWr}
                                    onChange={(e) => setCurrentWr(e.target.value ? Number(e.target.value) : '')}
                                    placeholder="Contoh: 54.2"
                                    step="0.1"
                                    className="w-full bg-[#121212] border border-[#2a2a2a] rounded-xl py-4 pl-12 pr-4 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all font-medium"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-foreground/90 ml-1">Target Win Rate (%)</label>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-muted-foreground">
                                    <Target className="h-5 w-5 text-primary" />
                                </div>
                                <input
                                    type="number"
                                    value={targetWr}
                                    onChange={(e) => setTargetWr(e.target.value ? Number(e.target.value) : '')}
                                    placeholder="Contoh: 70"
                                    step="0.1"
                                    className="w-full bg-[#121212] border border-primary/40 rounded-xl py-4 pl-12 pr-4 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all font-medium"
                                />
                            </div>
                        </div>

                        {error && (
                            <div className="p-3 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-sm text-center font-medium">
                                {error}
                            </div>
                        )}

                        <button
                            type="button"
                            onClick={calculateWR}
                            className="w-full h-14 rounded-xl bg-gradient-to-r from-primary to-yellow-500 text-primary-foreground font-bold text-lg shadow-[0_0_15px_rgba(250,204,21,0.3)] hover:shadow-[0_0_25px_rgba(250,204,21,0.5)] transition-all hover:-translate-y-1 mt-6"
                        >
                            Hitung Sekarang
                        </button>
                    </form>

                    {/* Result Placeholder */}
                    <div className="mt-8 pt-6 border-t border-[#2a2a2a] text-center min-h-[100px] flex items-center justify-center">
                        {result ? (
                            <p className="text-lg text-primary font-bold bg-primary/10 border border-primary/20 px-6 py-4 rounded-2xl animate-in fade-in zoom-in duration-300" dangerouslySetInnerHTML={{ __html: result.replace(/\*\*(.*?)\*\*/g, '<span class="text-white text-2xl px-1">$1</span>') }} />
                        ) : (
                            <p className="text-sm text-muted-foreground">Isi form di atas untuk melihat estimasi match tanpa kalah berturut-turut.</p>
                        )}
                    </div>

                </div>
            </div>
        </div>
    );
}
