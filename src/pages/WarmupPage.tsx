import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Exercise } from '@/types';
import ExerciseCard from '@/components/ExerciseCard';
import { Loading, ErrorMessage, EmptyState } from '@/components/States';
import { Dumbbell, Clock, Activity } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function WarmupPage() {
  const [warmups, setWarmups] = useState<Exercise[]>([]);
  const [stretches, setStretches] = useState<Exercise[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tab, setTab] = useState<'warmup' | 'stretching'>('warmup');

  useEffect(() => {
    async function fetchAll() {
      const [w, s] = await Promise.all([
        supabase.from('exercises').select('*').eq('category', 'warmup'),
        supabase.from('exercises').select('*').eq('category', 'stretching'),
      ]);

      if (w.error || s.error) {
        setError('Unable to load exercises. Please try again.');
      } else {
        setWarmups(w.data || []);
        setStretches(s.data || []);
      }
      setLoading(false);
    }
    fetchAll();
  }, []);

  const routines = [
    {
      title: 'Quick Warm-Up',
      desc: 'A 5-10 minute warm-up sequence to prepare your body.',
      icon: Activity,
      exercises: ['Jumping Jacks', 'Arm Circles', 'High Knees', 'Hip Circles', 'Bodyweight Squats'],
    },
    {
      title: 'Post-Workout Stretch',
      desc: 'A simple stretching routine to do after your workouts.',
      icon: Clock,
      exercises: ['Hamstring Stretch', 'Quadriceps Stretch', 'Calf Stretch', 'Shoulder Stretch', 'Chest Stretch', 'Lower Back Stretch'],
    },
  ];

  const current = tab === 'warmup' ? warmups : stretches;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">Warm-up & Stretching</h1>
        <p className="text-gray-500">
          Prepare your body before exercise and stretch after workouts to prevent injury.
        </p>
      </div>

      {/* Predefined Routines */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
        {routines.map((routine) => {
          const Icon = routine.icon;
          return (
            <div
              key={routine.title}
              className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100"
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                  <Icon className="w-5 h-5" />
                </div>
                <h3 className="font-semibold text-gray-900">{routine.title}</h3>
              </div>
              <p className="text-sm text-gray-500 mb-4">{routine.desc}</p>
              <ul className="space-y-1.5">
                {routine.exercises.map((ex) => (
                  <li key={ex} className="text-sm text-gray-600 flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                    {ex}
                  </li>
                ))}
              </ul>
            </div>
          );
        })}
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6">
        <button
          onClick={() => setTab('warmup')}
          className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
            tab === 'warmup'
              ? 'bg-emerald-600 text-white'
              : 'bg-white text-gray-600 border border-gray-200 hover:border-emerald-300'
          }`}
        >
          Warm-up Exercises
        </button>
        <button
          onClick={() => setTab('stretching')}
          className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
            tab === 'stretching'
              ? 'bg-emerald-600 text-white'
              : 'bg-white text-gray-600 border border-gray-200 hover:border-emerald-300'
          }`}
        >
          Stretching Exercises
        </button>
      </div>

      {/* Exercises Grid */}
      {loading ? (
        <Loading message="Loading exercises..." />
      ) : error ? (
        <ErrorMessage message={error} />
      ) : current.length === 0 ? (
        <EmptyState message="No exercises found." icon={Dumbbell} />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {current.map((ex) => (
            <ExerciseCard key={ex.id} exercise={ex} />
          ))}
        </div>
      )}

      {/* Browse stretching link */}
      {tab === 'warmup' && (
        <div className="mt-8 text-center">
          <Link to="/stretching" className="text-sm font-medium text-emerald-600 hover:underline">
            Browse all stretching exercises →
          </Link>
        </div>
      )}
    </div>
  );
}
