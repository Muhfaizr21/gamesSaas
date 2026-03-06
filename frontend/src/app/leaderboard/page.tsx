import { Trophy, Crown, Medal, TrendingUp } from "lucide-react";

export default function LeaderboardPage() {
    // Dummy Data for visual display
    const topUsers = [
        { rank: 1, name: "Sam*******", total: "Rp 15.450.000", image: "/images/fallback.png" },
        { rank: 2, name: "ProG*******", total: "Rp 12.100.000", image: "/images/fallback.png" },
        { rank: 3, name: "DarkL******", total: "Rp  9.800.000", image: "/images/fallback.png" },
        { rank: 4, name: "KimiN******", total: "Rp  7.250.000", image: "/images/fallback.png" },
        { rank: 5, name: "JessN******", total: "Rp  6.400.000", image: "/images/fallback.png" },
        { rank: 6, name: "Lemo*******", total: "Rp  5.100.000", image: "/images/fallback.png" },
        { rank: 7, name: "Bntg*******", total: "Rp  4.800.000", image: "/images/fallback.png" },
        { rank: 8, name: "King*******", total: "Rp  4.500.000", image: "/images/fallback.png" },
        { rank: 9, name: "Xin********", total: "Rp  3.900.000", image: "/images/fallback.png" },
        { rank: 10, name: "R7*********", total: "Rp  3.500.000", image: "/images/fallback.png" },
    ];

    return (
        <div className="min-h-screen bg-[#121212] py-12 px-4 relative overflow-hidden">

            {/* Background Glow */}
            <div className="fixed top-0 inset-x-0 h-[400px] bg-gradient-to-b from-primary/10 to-transparent pointer-events-none" />

            <div className="container mx-auto max-w-4xl relative z-10">
                {/* Header */}
                <div className="text-center mb-20 md:mb-28">
                    <div className="inline-flex items-center justify-center p-4 bg-[#1a1a1a] rounded-full border border-primary/30 mb-6 shadow-[0_0_30px_rgba(250,204,21,0.2)]">
                        <Trophy className="h-10 w-10 text-primary" />
                    </div>
                    <h1 className="text-4xl font-black text-foreground uppercase tracking-wider mb-2 flex items-center justify-center gap-3">
                        <TrendingUp className="h-6 w-6 text-primary" />
                        Sultan <span className="text-primary">Leaderboard</span>
                    </h1>
                    <p className="text-muted-foreground text-lg">Ranking Top Spender SamStore Bulan Ini. Tingkatkan transaksi & jadilah #1!</p>
                </div>

                {/* Top 3 Podium Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 items-end">

                    {/* Rank 2 */}
                    <div className="bg-[#1a1a1a] border border-[#2a2a2a] hover:border-zinc-400/50 rounded-b-2xl rounded-t-xl p-6 text-center shadow-lg transform hover:-translate-y-2 transition-all md:order-1 h-[220px] flex flex-col justify-end relative">
                        <div className="absolute -top-10 left-1/2 -translate-x-1/2">
                            <div className="relative">
                                <img src={topUsers[1].image} className="w-20 h-20 rounded-full border-4 border-zinc-300 shadow-xl" />
                                <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 bg-zinc-300 text-zinc-900 font-bold px-3 py-0.5 rounded-xl border-2 border-[#1a1a1a] text-sm">2</div>
                            </div>
                        </div>
                        <h3 className="font-bold text-foreground text-lg mb-1 mt-6">{topUsers[1].name}</h3>
                        <p className="text-primary font-black">{topUsers[1].total}</p>
                        <p className="text-xs text-muted-foreground mt-2 uppercase tracking-widest font-semibold flex items-center justify-center gap-1">
                            <Medal className="h-3 w-3 text-zinc-400" /> Runner Up
                        </p>
                    </div>

                    {/* Rank 1 */}
                    <div className="bg-gradient-to-b from-[#2a2a2a] to-[#1a1a1a] border border-primary/50 hover:border-primary rounded-b-2xl rounded-t-xl p-6 text-center shadow-[0_0_30px_rgba(250,204,21,0.15)] transform hover:-translate-y-2 transition-all md:order-2 h-[260px] flex flex-col justify-end relative z-10">
                        <div className="absolute -top-12 left-1/2 -translate-x-1/2">
                            <div className="relative">
                                <Crown className="absolute -top-8 left-1/2 -translate-x-1/2 h-8 w-8 text-primary animate-bounce shadow-primary drop-shadow-[0_0_10px_rgba(250,204,21,0.8)]" />
                                <img src={topUsers[0].image} className="w-24 h-24 rounded-full border-4 border-primary shadow-[0_0_20px_rgba(250,204,21,0.5)]" />
                                <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 bg-primary text-zinc-900 font-bold px-4 py-0.5 rounded-xl border-2 border-[#1a1a1a] text-sm flex items-center">
                                    <Trophy className="h-3 w-3 mr-1" /> 1
                                </div>
                            </div>
                        </div>
                        <h3 className="font-black text-foreground text-xl mb-1 mt-8">{topUsers[0].name}</h3>
                        <p className="text-primary font-black text-xl">{topUsers[0].total}</p>
                        <p className="text-xs text-primary mt-2 uppercase tracking-widest font-bold flex items-center justify-center gap-1">
                            <Crown className="h-4 w-4" /> Sang Sultan
                        </p>
                    </div>

                    {/* Rank 3 */}
                    <div className="bg-[#1a1a1a] border border-[#2a2a2a] hover:border-orange-400/50 rounded-b-2xl rounded-t-xl p-6 text-center shadow-lg transform hover:-translate-y-2 transition-all md:order-3 h-[200px] flex flex-col justify-end relative">
                        <div className="absolute -top-10 left-1/2 -translate-x-1/2">
                            <div className="relative">
                                <img src={topUsers[2].image} className="w-20 h-20 rounded-full border-4 border-orange-400 shadow-xl" />
                                <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 bg-orange-400 text-zinc-900 font-bold px-3 py-0.5 rounded-xl border-2 border-[#1a1a1a] text-sm">3</div>
                            </div>
                        </div>
                        <h3 className="font-bold text-foreground text-lg mb-1 mt-6">{topUsers[2].name}</h3>
                        <p className="text-primary font-black">{topUsers[2].total}</p>
                        <p className="text-xs text-muted-foreground mt-2 uppercase tracking-widest font-semibold flex items-center justify-center gap-1">
                            <Medal className="h-3 w-3 text-orange-400" /> Bronze
                        </p>
                    </div>

                </div>

                {/* Rest of Leaderboard Table */}
                <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-3xl overflow-hidden shadow-2xl">
                    <div className="p-1">
                        {topUsers.slice(3).map((user, index) => (
                            <div key={user.rank} className="flex items-center justify-between p-4 hover:bg-[#252525] rounded-2xl transition-colors border-b border-[#2a2a2a] last:border-0">
                                <div className="flex items-center gap-4">
                                    <div className="w-8 font-bold text-muted-foreground text-center flex-shrink-0">
                                        #{user.rank}
                                    </div>
                                    <img src={user.image} alt={user.name} className="w-10 h-10 rounded-full border border-[#2a2a2a]" />
                                    <div>
                                        <h4 className="font-medium text-foreground">{user.name}</h4>
                                        <p className="text-xs text-muted-foreground">Top Spender</p>
                                    </div>
                                </div>
                                <div className="font-black text-primary text-sm sm:text-base">
                                    {user.total}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <p className="text-center text-xs text-muted-foreground mt-8">
                    * Data leaderboard direset pada awal bulan pukul 00:00 WIB. Pertahankan posisi #1 Anda!
                </p>

            </div>
        </div>
    );
}
