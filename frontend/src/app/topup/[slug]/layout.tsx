import type { Metadata, ResolvingMetadata } from 'next';

type Props = {
    params: Promise<{ slug: string }>;
};

export async function generateMetadata(
    { params }: Props,
    parent: ResolvingMetadata
): Promise<Metadata> {
    const slug = (await params).slug;

    // Default fallback
    let title = 'Top Up Game Termurah - SamStore';
    let description = 'Top Up diamond instan 24 jam dengan harga termurah se-Indonesia.';
    let imageUrl = '/images/fallback.png';

    try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/public/vouchers/${slug}`, { next: { revalidate: 3600 } });
        if (res.ok) {
            const product = await res.json();
            title = `Top Up ${product.name} Termurah - SamStore`;
            description = `Beli diamond / voucher ${product.name} harga paling murah, proses 1 detik otomatis masuk!`;
            if (product.thumbnail) imageUrl = product.thumbnail;
        }
    } catch (e) {
        console.warn("Failed to generate dynamic metadata for slug:", slug);
    }

    return {
        title,
        description,
        openGraph: {
            title,
            description,
            images: [imageUrl],
            type: 'website',
        },
        twitter: {
            card: 'summary_large_image',
            title,
            description,
            images: [imageUrl],
        },
    };
}

export default function TopupLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    // Rendernya hanya meneruskan ke Page.tsx (client component)
    return <>{children}</>;
}
