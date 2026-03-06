import Hero from '@/components/Hero';
import GameCategories from '@/components/GameCategories';
import FlashSale from '@/components/FlashSale';
import ReviewCarousel from '@/components/ReviewCarousel';

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <main className="flex-1">
        <Hero />
        <FlashSale />
        <GameCategories />
        <ReviewCarousel />
      </main>

      {/* Simple Footer Placeholder */}
      <footer className="border-t border-border/40 bg-card py-6 mt-12 text-center text-sm text-muted-foreground">
        <div className="container mx-auto px-4 max-w-7xl">
          <p>&copy; {new Date().getFullYear()} <span className="font-bold text-primary">SamStore</span>. Hak Cipta Dilindungi.</p>
        </div>
      </footer>
    </div>
  );
}
