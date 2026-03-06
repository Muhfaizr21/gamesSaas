import { SearchIcon, Receipt, History } from "lucide-react";

export default function CekPesananPage() {
    return (
        <div className="min-h-screen bg-[#121212] py-12 px-4">
            <div className="container mx-auto max-w-3xl">

                {/* Header */}
                <div className="text-center mb-10">
                    <div className="inline-flex items-center justify-center p-4 bg-primary/10 rounded-full mb-4">
                        <SearchIcon className="h-8 w-8 text-primary" />
                    </div>
                    <h1 className="text-3xl font-black text-foreground tracking-tight uppercase mb-2">
                        Cek <span className="text-primary">Transaksi / Pesanan</span>
                    </h1>
                    <p className="text-muted-foreground">Pantau status pesanan topup Anda secara real-time menggunakan Nomor Invoice.</p>
                </div>

                {/* Form Card */}
                <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-3xl p-6 sm:p-10 shadow-xl relative overflow-hidden">

                    <form className="space-y-6">
                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-foreground/90 ml-1">Nomor Pesanan (Invoice)</label>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-muted-foreground">
                                    <Receipt className="h-5 w-5" />
                                </div>
                                <input
                                    type="text"
                                    placeholder="Contoh: INV-SAM-12345678"
                                    className="w-full bg-[#121212] border border-primary/40 rounded-xl py-4 pl-12 pr-4 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all font-medium uppercase"
                                />
                            </div>
                            <p className="text-xs text-muted-foreground ml-1">Kode Invoice bisa Anda temukan di riwayat transaksi atau WhatsApp.</p>
                        </div>

                        <button
                            type="button"
                            className="w-full h-14 rounded-xl bg-gradient-to-r from-primary to-yellow-500 text-primary-foreground font-bold text-lg shadow-[0_0_15px_rgba(250,204,21,0.3)] hover:shadow-[0_0_25px_rgba(250,204,21,0.5)] transition-all hover:-translate-y-1 mt-6 flex items-center justify-center"
                        >
                            <SearchIcon className="h-5 w-5 mr-2" />
                            Lacak Pesanan
                        </button>
                    </form>

                </div>

                {/* Instructions */}
                <div className="mt-12 bg-[#1a1a1a]/50 border border-[#2a2a2a] rounded-2xl p-6">
                    <h3 className="text-lg font-bold flex items-center gap-2 mb-4 text-foreground">
                        <History className="h-5 w-5 text-primary" /> Cara Mengecek Status Pesanan:
                    </h3>
                    <ul className="space-y-3 text-sm text-muted-foreground">
                        <li className="flex gap-3">
                            <span className="bg-[#2a2a2a] text-foreground h-6 w-6 rounded-full flex items-center justify-center shrink-0 font-bold text-xs">1</span>
                            Buka riwayat transaksi di dashboard akun Anda atau lihat pesan otomatis yang kami kirimkan ke WhatsApp Anda.
                        </li>
                        <li className="flex gap-3">
                            <span className="bg-[#2a2a2a] text-foreground h-6 w-6 rounded-full flex items-center justify-center shrink-0 font-bold text-xs">2</span>
                            Salin Nomor Invoice (misal: INV-SAM-XXX).
                        </li>
                        <li className="flex gap-3">
                            <span className="bg-[#2a2a2a] text-foreground h-6 w-6 rounded-full flex items-center justify-center shrink-0 font-bold text-xs">3</span>
                            Tempelkan pada kolom di atas dan klik Lacak Pesanan untuk melihat status terkini secara instan.
                        </li>
                    </ul>
                </div>

            </div>
        </div>
    );
}
