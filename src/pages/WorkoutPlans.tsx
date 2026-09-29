import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { WorkoutPlan } from '@/types';
import { Loading, ErrorMessage } from '@/components/States';
import { useAuth } from '@/context/AuthContext';
import { Calendar, Dumbbell, CheckCircle, Video } from 'lucide-react';

export default function WorkoutPlans() {
  const [plans, setPlans] = useState<WorkoutPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedPlan, setExpandedPlan] = useState<string | null>(null);
  const [completedExercises, setCompletedExercises] = useState<Set<string>>(new Set());
  const { user } = useAuth();

  useEffect(() => {
    supabase
      .from('workout_plans')
      .select('*')
      .order('created_at', { ascending: true })
      .then(({ data, error }) => {
        if (error) {
          setError('Unable to load workout plans. Please try again.');
        } else {
          setPlans(data || []);
        }
        setLoading(false);
      });
  }, []);

  async function markExerciseCompleted(planId: string, dayIdx: number, exIdx: number, exerciseName: string) {
    if (!user) return;
    const key = `${planId}-${dayIdx}-${exIdx}`;
    if (completedExercises.has(key)) return;

    await supabase.from('workout_history').insert({
      user_id: user.id,
      exercise_name: exerciseName,
    });

    setCompletedExercises((prev) => new Set([...prev, key]));
  }

  if (loading) return <Loading message="Loading workout plans..." />;
  if (error) return <ErrorMessage message={error} />;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">Workout Plans</h1>
      <p className="text-gray-500 mb-8">Choose a plan that fits your goals. Each plan includes daily exercise breakdowns.</p>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {plans.map((plan) => (
          <div key={plan.id} className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
            {/* Plan header */}
            <div
              className="p-6 cursor-pointer hover:bg-gray-50 transition-colors"
              onClick={() => setExpandedPlan(expandedPlan === plan.id ? null : plan.id)}
            >
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="font-semibold text-gray-900 mb-1">{plan.name}</h2>
                  <p className="text-sm text-gray-500 mb-3">{plan.description}</p>
                  <div className="flex items-center gap-3 text-xs">
                    <span className="flex items-center gap-1 text-gray-400">
                      <Calendar className="w-3.5 h-3.5" />
                      {plan.days_per_week} days/week
                    </span>
                    <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-600 font-medium">
                      {plan.difficulty}
                    </span>
                  </div>
                </div>
                <span className="text-sm font-medium text-emerald-600">
                  {expandedPlan === plan.id ? 'Hide' : 'View'}
                </span>
              </div>
            </div>

            {/* Plan details */}
            {expandedPlan === plan.id && (
              <div className="border-t border-gray-100 p-6 space-y-6">
                {plan.days.map((day, dayIdx) => (
                  <div key={dayIdx}>
                    <h3 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
                      <Dumbbell className="w-4 h-4 text-emerald-600" />
                      {day.day}
                    </h3>
                    <div className="space-y-2">
                      {day.exercises.map((ex, exIdx) => {
                        const key = `${plan.id}-${dayIdx}-${exIdx}`;
                        const done = completedExercises.has(key);
                        return (
                          <div
                            key={exIdx}
                            className="flex items-center justify-between p-3 rounded-xl bg-gray-50"
                          >
                            <div className="flex-1">
                              <p className="text-sm font-medium text-gray-900">{ex.name}</p>
                              <div className="flex items-center gap-3 text-xs text-gray-400 mt-1">
                                <span>{ex.sets} sets</span>
                                <span>{ex.reps} reps</span>
                                <span>Rest: {ex.rest}</span>
                              </div>
                            </div>
                            <button
                              onClick={() => markExerciseCompleted(plan.id, dayIdx, exIdx, ex.name)}
                              disabled={done || !user}
                              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                                done
                                  ? 'bg-green-100 text-green-600'
                                  : 'bg-white text-gray-600 border border-gray-200 hover:border-emerald-300'
                              } ${!user ? 'opacity-50 cursor-not-allowed' : ''}`}
                            >
                              <CheckCircle className="w-3.5 h-3.5" />
                              {done ? 'Done' : 'Mark'}
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
                {!user && (
                  <p className="text-xs text-gray-400 text-center">Sign in to track your progress.</p>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
