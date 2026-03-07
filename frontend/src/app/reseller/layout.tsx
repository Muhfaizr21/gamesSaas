import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'SAMSaaS — Buka Toko Topup Game Otomatis 24/7',
    description: 'Platform SaaS terbaik untuk membuat toko topup game otomatis. Mulai bisnis voucher game tanpa coding, tanpa server, langsung live 5 menit.',
};

/**
 * Dedicated layout for /reseller routes.
 * This layout renders INSIDE the root <html><body> but the Navbar
 * is excluded because RootNavigationWrapper checks pathname and returns null.
 * The Navbar component itself also has an early-return guard for /reseller.
 */
export default function ResellerLayout({ children }: { children: React.ReactNode }) {
    return <>{children}</>;
}
