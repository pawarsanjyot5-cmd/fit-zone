import CategoryPage from './CategoryPage';
import { YOGA_CATEGORIES } from '@/lib/constants';

export default function YogaPage() {
  return (
    <CategoryPage
      category="yoga"
      title="Yoga"
      subtitle="Explore yoga poses for flexibility, balance, and relaxation."
      subcategories={YOGA_CATEGORIES}
    />
  );
}
