import { MetadataRoute } from 'next';

const BASE_URL = 'https://samstore.id'; // Ganti dengan domain asli saat produksi
const API_URL = `${process.env.NEXT_PUBLIC_API_URL}/api/public`;

/**
 * Next.js Sitemap Index & Multiple Sitemaps
 * Membagi sitemap menjadi beberapa bagian agar lebih tertata & skalabel (Yoast Style)
 */

// 1. Definisikan ID untuk setiap jenis sitemap
export async function generateSitemaps() {
    return [
        { id: 0 }, // Static Pages
        { id: 1 }, // Games / Vouchers
        { id: 2 }, // Articles
    ];
}

export default async function sitemap({ id }: { id: number }): Promise<MetadataRoute.Sitemap> {
    try {
        // Fetch data slugs dari Backend
        const res = await fetch(`${API_URL}/sitemap-data`, {
            next: { revalidate: 3600 } // Cache selama 1 jam
        });

        if (!res.ok) throw new Error('Failed to fetch sitemap data');
        const { vouchers, articles } = await res.json();

        // Kembalikan data berdasarkan ID yang dipanggil
        switch (id) {
            case 0: // === Static Pages ===
                return [
                    {
                        url: BASE_URL,
                        lastModified: new Date(),
                        changeFrequency: 'daily',
                        priority: 1,
                    },
                    {
                        url: `${BASE_URL}/artikel`,
                        lastModified: new Date(),
                        changeFrequency: 'daily',
                        priority: 0.8,
                    },
                    {
                        url: `${BASE_URL}/cek-pesanan`,
                        lastModified: new Date(),
                        changeFrequency: 'weekly',
                        priority: 0.5,
                    },
                ];

            case 1: // === Games / Vouchers ===
                return vouchers.map((v: any) => ({
                    url: `${BASE_URL}/topup/${v.slug}`,
                    lastModified: new Date(v.lastmod),
                    changeFrequency: 'weekly',
                    priority: 0.9,
                }));

            case 2: // === Articles ===
                return articles.map((a: any) => ({
                    url: `${BASE_URL}/artikel/${a.slug}`,
                    lastModified: new Date(a.lastmod),
                    changeFrequency: 'monthly',
                    priority: 0.7,
                }));

            default:
                return [];
        }
    } catch (error) {
        console.error("Sitemap generation error:", error);
        return [{ url: BASE_URL, lastModified: new Date() }];
    }
}
