import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { Exercise } from '@/types';
import { useAuth } from '@/context/AuthContext';
import { Loading, ErrorMessage } from '@/components/States';
import ExerciseCard from '@/components/ExerciseCard';
import WorkoutTimer from '@/components/WorkoutTimer';
import {
  Heart, CheckCircle, Plus, ArrowLeft, Dumbbell, Sparkles, Flame,
  Clock, Target, AlertCircle, Shield, Lightbulb, Wind, TrendingUp
} from 'lucide-react';

export default function ExerciseDetail() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [exercise, setExercise] = useState<Exercise | null>(null);
  const [related, setRelated] = useState<Exercise[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isFav, setIsFav] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [actionMsg, setActionMsg] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    supabase
      .from('exercises')
      .select('*')
      .eq('id', id)
      .maybeSingle()
      .then(({ data, error }) => {
        if (error || !data) {
          setError('Unable to load exercise. Please try again.');
          setLoading(false);
        } else {
          setExercise(data as Exercise);
          // Fetch related exercises
          supabase
            .from('exercises')
            .select('*')
            .eq('category', data.category)
            .neq('id', id)
            .limit(4)
            .then(({ data: relData }) => {
              setRelated(relData || []);
              setLoading(false);
            });
        }
      });

    // Track recently viewed
    if (user && id) {
      supabase
        .from('recently_viewed')
        .upsert({ user_id: user.id, exercise_id: id }, { onConflict: 'user_id,exercise_id' })
        .then();
    }

    // Check if favorited
    if (user && id) {
      supabase
        .from('favorites')
        .select('id')
        .eq('user_id', user.id)
        .eq('exercise_id', id)
        .maybeSingle()
        .then(({ data }) => setIsFav(!!data));
    }
  }, [id, user]);

  function showMsg(msg: string) {
    setActionMsg(msg);
    setTimeout(() => setActionMsg(null), 3000);
  }

  async function toggleFavorite() {
    if (!user) {
      navigate('/login');
      return;
    }
    if (!exercise) return;

    if (isFav) {
      await supabase.from('favorites').delete().eq('user_id', user.id).eq('exercise_id', exercise.id);
      setIsFav(false);
      showMsg('Removed from favorites');
    } else {
      await supabase.from('favorites').insert({ user_id: user.id, exercise_id: exercise.id });
      setIsFav(true);
      showMsg('Added to favorites');
    }
  }

  async function markCompleted() {
    if (!user) {
      navigate('/login');
      return;
    }
    if (!exercise) return;

    if (completed) return;

    const { error } = await supabase.from('workout_history').insert({
      user_id: user.id,
      exercise_id: exercise.id,
      exercise_name: exercise.name,
    });

    if (!error) {
      setCompleted(true);
      showMsg('Marked as completed!');
    }
  }

  async function addToWorkout() {
    if (!user) {
      navigate('/login');
      return;
    }
    if (!exercise) return;
    navigate('/custom-workout', { state: { addExerciseId: exercise.id } });
  }

  if (loading) return <Loading message="Loading exercise..." />;
  if (error) return <ErrorMessage message={error} />;
  if (!exercise) return <ErrorMessage message="Exercise not found." />;

  const difficultyColors: Record<string, string> = {
    Beginner: 'bg-green-100 text-green-700',
    Intermediate: 'bg-yellow-100 text-yellow-700',
    Advanced: 'bg-red-100 text-red-700',
  };

  const infoItems = [
    { icon: Sparkles, label: 'Muscle Group', value: exercise.muscle_group },
    { icon: Target, label: 'Target Muscles', value: exercise.target_muscles },
    { icon: Flame, label: 'Difficulty', value: exercise.difficulty },
    { icon: Dumbbell, label: 'Equipment', value: exercise.equipment },
    { icon: TrendingUp, label: 'Sets', value: exercise.sets },
    { icon: TrendingUp, label: 'Repetitions', value: exercise.repetitions },
    { icon: Clock, label: 'Duration', value: exercise.duration },
    { icon: Clock, label: 'Rest Time', value: exercise.rest_time },
  ].filter((item) => item.value);

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Back link */}
      <Link to={-1 as any} className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-emerald-600 mb-6">
        <ArrowLeft className="w-4 h-4" />
        Back
      </Link>

      {actionMsg && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 bg-emerald-600 text-white px-6 py-3 rounded-xl shadow-lg text-sm font-medium animate-pulse">
          {actionMsg}
        </div>
      )}

      {/* Header */}
      <div className="grid lg:grid-cols-2 gap-8 mb-8">
        <div className="rounded-2xl overflow-hidden shadow-sm bg-gray-100">
          {exercise.image_url ? (
            <img src={exercise.image_url} alt={exercise.name} className="w-full h-72 object-cover" />
          ) : (
            <div className="w-full h-72 flex items-center justify-center text-gray-400">
              <Dumbbell className="w-16 h-16" />
            </div>
          )}
        </div>
        <div>
          <div className="flex items-start gap-3 mb-4">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">{exercise.name}</h1>
            <span className={`px-3 py-1 rounded-full text-xs font-medium ${difficultyColors[exercise.difficulty] || 'bg-gray-100 text-gray-700'}`}>
              {exercise.difficulty}
            </span>
          </div>
          {exercise.description && (
            <p className="text-gray-600 mb-6">{exercise.description}</p>
          )}

          {/* Info grid */}
          <div className="grid grid-cols-2 gap-3 mb-6">
            {infoItems.map((item, i) => {
              const Icon = item.icon;
              return (
                <div key={i} className="bg-white rounded-xl p-3 border border-gray-100">
                  <div className="flex items-center gap-1.5 text-xs text-gray-400 mb-1">
                    <Icon className="w-3.5 h-3.5" />
                    {item.label}
                  </div>
                  <p className="text-sm font-medium text-gray-900">{item.value}</p>
                </div>
              );
            })}
          </div>

          {/* Action buttons */}
          <div className="flex flex-wrap gap-3">
            <button
              onClick={toggleFavorite}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium text-sm transition-colors ${
                isFav
                  ? 'bg-red-50 text-red-600 border border-red-200'
                  : 'bg-white text-gray-700 border border-gray-200 hover:border-emerald-300'
              }`}
            >
              <Heart className={`w-4 h-4 ${isFav ? 'fill-red-500 text-red-500' : ''}`} />
              {isFav ? 'Favorited' : 'Add to Favorites'}
            </button>
            <button
              onClick={markCompleted}
              disabled={completed}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium text-sm transition-colors ${
                completed
                  ? 'bg-green-50 text-green-600 border border-green-200'
                  : 'bg-white text-gray-700 border border-gray-200 hover:border-emerald-300'
              }`}
            >
              <CheckCircle className="w-4 h-4" />
              {completed ? 'Completed' : 'Mark as Completed'}
            </button>
            <button
              onClick={addToWorkout}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium text-sm bg-emerald-600 text-white hover:bg-emerald-700 transition-colors"
            >
              <Plus className="w-4 h-4" />
              Add to Workout
            </button>
          </div>
        </div>
      </div>

      {/* Video */}
      {exercise.video_url && (
        <div className="mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Demonstration Video</h2>
          <div className="relative pb-[56.25%] h-0 rounded-2xl overflow-hidden shadow-sm bg-gray-900">
            <iframe
              src={exercise.video_url}
              title={`${exercise.name} demonstration`}
              className="absolute inset-0 w-full h-full"
              allowFullScreen
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            />
          </div>
        </div>
      )}

      {/* Detailed info sections */}
      <div className="grid lg:grid-cols-2 gap-6 mb-8">
        {exercise.instructions && (
          <div className="bg-white rounded-2xl p-6 border border-gray-100">
            <div className="flex items-center gap-2 mb-3">
              <Target className="w-5 h-5 text-emerald-600" />
              <h3 className="font-semibold text-gray-900">Step-by-Step Instructions</h3>
            </div>
            <p className="text-sm text-gray-600 leading-relaxed">{exercise.instructions}</p>
          </div>
        )}
        {exercise.correct_form && (
          <div className="bg-white rounded-2xl p-6 border border-gray-100">
            <div className="flex items-center gap-2 mb-3">
              <CheckCircle className="w-5 h-5 text-emerald-600" />
              <h3 className="font-semibold text-gray-900">Correct Form</h3>
            </div>
            <p className="text-sm text-gray-600 leading-relaxed">{exercise.correct_form}</p>
          </div>
        )}
        {exercise.breathing_technique && (
          <div className="bg-white rounded-2xl p-6 border border-gray-100">
            <div className="flex items-center gap-2 mb-3">
              <Wind className="w-5 h-5 text-blue-500" />
              <h3 className="font-semibold text-gray-900">Breathing Technique</h3>
            </div>
            <p className="text-sm text-gray-600 leading-relaxed">{exercise.breathing_technique}</p>
          </div>
        )}
        {exercise.common_mistakes && (
          <div className="bg-white rounded-2xl p-6 border border-gray-100">
            <div className="flex items-center gap-2 mb-3">
              <AlertCircle className="w-5 h-5 text-amber-500" />
              <h3 className="font-semibold text-gray-900">Common Mistakes</h3>
            </div>
            <p className="text-sm text-gray-600 leading-relaxed">{exercise.common_mistakes}</p>
          </div>
        )}
        {exercise.safety_tips && (
          <div className="bg-white rounded-2xl p-6 border border-gray-100">
            <div className="flex items-center gap-2 mb-3">
              <Shield className="w-5 h-5 text-red-500" />
              <h3 className="font-semibold text-gray-900">Safety Tips</h3>
            </div>
            <p className="text-sm text-gray-600 leading-relaxed">{exercise.safety_tips}</p>
          </div>
        )}
        {exercise.beginner_modification && (
          <div className="bg-white rounded-2xl p-6 border border-gray-100">
            <div className="flex items-center gap-2 mb-3">
              <Lightbulb className="w-5 h-5 text-yellow-500" />
              <h3 className="font-semibold text-gray-900">Beginner Modification</h3>
            </div>
            <p className="text-sm text-gray-600 leading-relaxed">{exercise.beginner_modification}</p>
          </div>
        )}
      </div>

      {/* Workout Timer */}
      <div className="mb-8">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Rest Timer</h2>
        <WorkoutTimer />
      </div>

      {/* Related Exercises */}
      {related.length > 0 && (
        <div>
          <h2 className="text-xl font-bold text-gray-900 mb-4">Related Exercises</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {related.map((ex) => (
              <ExerciseCard key={ex.id} exercise={ex} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
