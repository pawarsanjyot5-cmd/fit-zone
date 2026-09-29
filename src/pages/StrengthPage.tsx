import CategoryPage from './CategoryPage';
import { MUSCLE_GROUPS } from '@/lib/constants';

export default function StrengthPage() {
  return (
    <CategoryPage
      category="strength"
      title="Gym & Strength Training"
      subtitle="Select a muscle group to browse exercises with videos and instructions."
      subcategories={MUSCLE_GROUPS}
      muscleGroupMode
    />
  );
}
