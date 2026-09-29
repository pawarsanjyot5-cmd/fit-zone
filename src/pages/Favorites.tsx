import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';
import { Exercise } from '@/types';
import { Loading, EmptyState } from '@/components/States';
import ExerciseCard from '@/components/ExerciseCard';
import { Heart, Trash2 } from 'lucide-react';

export default function Favorites() {
  const { user } = useAuth();
  const [favorites, setFavorites] = useState<Exercise[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    supabase
      .from('favorites')
      .select('exercise:exercises(*)')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .then(({ data }) => {
        setFavorites((data?.map((f: any) => f.exercise).filter(Boolean)) || []);
        setLoading(false);
      });
  }, [user]);

  async function removeFavorite(exerciseId: string) {
    if (!user) return;
    await supabase.from('favorites').delete().eq('user_id', user.id).eq('exercise_id', exerciseId);
    setFavorites(favorites.filter((f) => f.id !== exerciseId));
  }

  if (loading) return <Loading message="Loading favorites..." />;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">My Favorites</h1>
      <p className="text-gray-500 mb-6">Your saved exercises for quick access.</p>

      {favorites.length === 0 ? (
        <EmptyState message="You haven't added any exercises to your favorites yet." icon={Heart} />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {favorites.map((ex) => (
            <div key={ex.id} className="relative group">
              <ExerciseCard exercise={ex} />
              <button
                onClick={() => removeFavorite(ex.id)}
                className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/90 shadow-sm flex items-center justify-center text-red-500 hover:bg-red-50 transition-colors opacity-0 group-hover:opacity-100"
                aria-label="Remove from favorites"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
