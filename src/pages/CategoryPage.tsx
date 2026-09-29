import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Exercise } from '@/types';
import ExerciseCard from '@/components/ExerciseCard';
import { Loading, ErrorMessage, EmptyState } from '@/components/States';
import { Dumbbell, Search } from 'lucide-react';

interface CategoryPageProps {
  category: string;
  title: string;
  subtitle: string;
  subcategories: string[];
  muscleGroupMode?: boolean;
}

export default function CategoryPage({
  category,
  title,
  subtitle,
  subcategories,
  muscleGroupMode = false,
}: CategoryPageProps) {
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [selected, setSelected] = useState<string>(subcategories[0] || '');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');

  useEffect(() => {
    setLoading(true);
    setError(null);
    let query = supabase.from('exercises').select('*').eq('category', category);

    if (muscleGroupMode) {
      query = query.eq('muscle_group', selected);
    } else {
      query = query.eq('muscle_group', selected);
    }

    query.then(({ data, error }) => {
      if (error) {
        setError('Unable to load exercises. Please try again.');
        setExercises([]);
      } else {
        setExercises(data || []);
      }
      setLoading(false);
    });
  }, [category, selected, muscleGroupMode]);

  const filtered = exercises.filter((ex) =>
    ex.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">{title}</h1>
        <p className="text-gray-500">{subtitle}</p>
      </div>

      {/* Subcategory Tabs */}
      <div className="flex flex-wrap gap-2 mb-6">
        {subcategories.map((sub) => (
          <button
            key={sub}
            onClick={() => setSelected(sub)}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
              selected === sub
                ? 'bg-emerald-600 text-white'
                : 'bg-white text-gray-600 border border-gray-200 hover:border-emerald-300 hover:text-emerald-600'
            }`}
          >
            {sub}
          </button>
        ))}
      </div>

      {/* Search within category */}
      <div className="relative mb-6 max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          type="text"
          placeholder="Search exercises..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm"
        />
      </div>

      {/* Exercises Grid */}
      {loading ? (
        <Loading message="Loading exercises..." />
      ) : error ? (
        <ErrorMessage message={error} />
      ) : filtered.length === 0 ? (
        <EmptyState message="No exercises found in this category." icon={Dumbbell} />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filtered.map((ex) => (
            <ExerciseCard key={ex.id} exercise={ex} />
          ))}
        </div>
      )}
    </div>
  );
}
