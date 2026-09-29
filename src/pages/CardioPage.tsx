import CategoryPage from './CategoryPage';
import { CARDIO_CATEGORIES } from '@/lib/constants';

export default function CardioPage() {
  return (
    <CategoryPage
      category="cardio"
      title="Cardio Exercises"
      subtitle="Improve your cardiovascular fitness with low-impact and high-intensity exercises."
      subcategories={CARDIO_CATEGORIES}
    />
  );
}
