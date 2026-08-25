import HeroSection from '@/components/home/HeroSection';
import FeatureSection from '@/components/home/FeatureSection';
import FeaturedTrips from '@/components/home/FeaturedTrips';

export default function HomePage() {
  return (
    <div className="w-full">
      <HeroSection />
      <FeatureSection />
      <FeaturedTrips />
    </div>
  );
}