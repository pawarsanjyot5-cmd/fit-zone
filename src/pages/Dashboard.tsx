import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';
import { Exercise, WorkoutHistory, RecentlyViewed, CustomWorkout } from '@/types';
import { Loading } from '@/components/States';
import ExerciseCard from '@/components/ExerciseCard';
import {
  LayoutDashboard, Heart, Clock, TrendingUp, Flame, Calendar,
  Dumbbell, ArrowRight, User as UserIcon
} from 'lucide-react';

export default function Dashboard() {
  const { user, profile } = useAuth();
  const [favorites, setFavorites] = useState<Exercise[]>([]);
  const [history, setHistory] = useState<WorkoutHistory[]>([]);
  const [recentlyViewed, setRecentlyViewed] = useState<Exercise[]>([]);
  const [workouts, setWorkouts] = useState<CustomWorkout[]>([]);
  const [stats, setStats] = useState({ total: 0, weekly: 0, monthly: 0, streak: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    async function fetchDashboard() {
      const [favRes, histRes, recentRes, workoutRes] = await Promise.all([
        supabase.from('favorites').select('exercise:exercises(*)').eq('user_id', user!.id),
        supabase.from('workout_history').select('*').eq('user_id', user!.id).order('created_at', { ascending: false }).limit(10),
        supabase.from('recently_viewed').select('exercise:exercises(*)').eq('user_id', user!.id).order('viewed_at', { ascending: false }).limit(10),
        supabase.from('custom_workouts').select('*').eq('user_id', user!.id).order('created_at', { ascending: false }),
      ]);

      // Also get all history for stats
      const allHistRes = await supabase.from('workout_history').select('*').eq('user_id', user!.id);

      setFavorites((favRes.data?.map((f: any) => f.exercise).filter(Boolean)) || []);
      setHistory(histRes.data || []);
      setRecentlyViewed((recentRes.data?.map((r: any) => r.exercise).filter(Boolean)) || []);
      setWorkouts(workoutRes.data || []);

      // Calculate stats
      const allHist = allHistRes.data || [];
      const now = new Date();
      const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

      const weekly = allHist.filter((h) => new Date(h.workout_date) >= weekAgo).length;
      const monthly = allHist.filter((h) => new Date(h.workout_date) >= monthAgo).length;

      // Calculate streak
      const dates = [...new Set(allHist.map((h) => h.workout_date))].sort().reverse();
      let streak = 0;
      if (dates.length > 0) {
        let checkDate = new Date();
        for (const d of dates) {
          const date = new Date(d);
          if (date.toDateString() === checkDate.toDateString()) {
            streak++;
            checkDate.setDate(checkDate.getDate() - 1);
          } else if (date.toDateString() === new Date(checkDate.getTime() - 86400000).toDateString()) {
            streak++;
            checkDate.setDate(checkDate.getDate() - 1);
          } else {
            break;
          }
        }
      }

      setStats({ total: allHist.length, weekly, monthly, streak });
      setLoading(false);
    }
    fetchDashboard();
  }, [user]);

  if (loading) return <Loading message="Loading dashboard..." />;

  const statCards = [
    { label: 'Total Workouts', value: stats.total, icon: Dumbbell, color: 'bg-emerald-50 text-emerald-600' },
    { label: 'This Week', value: stats.weekly, icon: Calendar, color: 'bg-blue-50 text-blue-600' },
    { label: 'This Month', value: stats.monthly, icon: TrendingUp, color: 'bg-purple-50 text-purple-600' },
    { label: 'Streak (days)', value: stats.streak, icon: Flame, color: 'bg-orange-50 text-orange-600' },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Welcome */}
      <div className="flex items-center gap-3 mb-8">
        <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
          <UserIcon className="w-6 h-6" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Welcome, {profile?.full_name || 'Athlete'}!
          </h1>
          <p className="text-sm text-gray-500">Here's your fitness overview</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {statCards.map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.label} className="bg-white rounded-2xl p-5 border border-gray-100">
              <div className={`w-10 h-10 rounded-xl ${stat.color} flex items-center justify-center mb-3`}>
                <Icon className="w-5 h-5" />
              </div>
              <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
              <p className="text-sm text-gray-500">{stat.label}</p>
            </div>
          );
        })}
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* My Workout Plans */}
        <div className="bg-white rounded-2xl p-6 border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-gray-900 flex items-center gap-2">
              <LayoutDashboard className="w-5 h-5 text-emerald-600" />
              My Custom Workouts
            </h2>
            <Link to="/custom-workout" className="text-sm text-emerald-600 font-medium hover:underline">
              Create
            </Link>
          </div>
          {workouts.length === 0 ? (
            <p className="text-sm text-gray-400 py-6 text-center">
              No custom workouts yet.{' '}
              <Link to="/custom-workout" className="text-emerald-600">Create one →</Link>
            </p>
          ) : (
            <div className="space-y-3">
              {workouts.slice(0, 3).map((w) => (
                <div key={w.id} className="flex items-center justify-between p-3 rounded-xl bg-gray-50">
                  <div>
                    <p className="font-medium text-gray-900 text-sm">{w.name}</p>
                    <p className="text-xs text-gray-400">{w.exercise_ids.length} exercises</p>
                  </div>
                  <Link to="/custom-workout" className="text-emerald-600 text-sm font-medium">
                    View
                  </Link>
                </div>
              ))}
            </div>
          )}
          <Link to="/workout-plans" className="mt-4 block text-sm text-gray-500 hover:text-emerald-600">
            Browse predefined workout plans →
          </Link>
        </div>

        {/* Favorites */}
        <div className="bg-white rounded-2xl p-6 border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-gray-900 flex items-center gap-2">
              <Heart className="w-5 h-5 text-red-500" />
              Favorite Exercises
            </h2>
            <Link to="/favorites" className="text-sm text-emerald-600 font-medium hover:underline">
              View all
            </Link>
          </div>
          {favorites.length === 0 ? (
            <p className="text-sm text-gray-400 py-6 text-center">
              You haven't added any exercises to your favorites yet.
            </p>
          ) : (
            <div className="space-y-2">
              {favorites.slice(0, 4).map((ex) => (
                <Link
                  key={ex.id}
                  to={`/exercise/${ex.id}`}
                  className="flex items-center gap-3 p-2 rounded-xl hover:bg-gray-50 transition-colors"
                >
                  {ex.image_url ? (
                    <img src={ex.image_url} alt={ex.name} className="w-12 h-12 rounded-lg object-cover" />
                  ) : (
                    <div className="w-12 h-12 rounded-lg bg-gray-100 flex items-center justify-center">
                      <Dumbbell className="w-5 h-5 text-gray-400" />
                    </div>
                  )}
                  <div>
                    <p className="text-sm font-medium text-gray-900">{ex.name}</p>
                    <p className="text-xs text-gray-400">{ex.muscle_group}</p>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Workout History */}
        <div className="bg-white rounded-2xl p-6 border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-gray-900 flex items-center gap-2">
              <Clock className="w-5 h-5 text-blue-500" />
              Workout History
            </h2>
            <Link to="/progress" className="text-sm text-emerald-600 font-medium hover:underline">
              View progress
            </Link>
          </div>
          {history.length === 0 ? (
            <p className="text-sm text-gray-400 py-6 text-center">
              Complete a workout to see your history here.
            </p>
          ) : (
            <div className="space-y-2">
              {history.slice(0, 5).map((h) => (
                <div key={h.id} className="flex items-center justify-between p-2 rounded-xl bg-gray-50">
                  <span className="text-sm font-medium text-gray-900">{h.exercise_name}</span>
                  <span className="text-xs text-gray-400">
                    {new Date(h.workout_date).toLocaleDateString()}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recently Viewed */}
        <div className="bg-white rounded-2xl p-6 border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-gray-900 flex items-center gap-2">
              <Clock className="w-5 h-5 text-purple-500" />
              Recently Viewed
            </h2>
          </div>
          {recentlyViewed.length === 0 ? (
            <p className="text-sm text-gray-400 py-6 text-center">
              Browse exercises to see them here.
            </p>
          ) : (
            <div className="space-y-2">
              {recentlyViewed.slice(0, 5).map((ex) => (
                <Link
                  key={ex.id}
                  to={`/exercise/${ex.id}`}
                  className="flex items-center gap-3 p-2 rounded-xl hover:bg-gray-50 transition-colors"
                >
                  {ex.image_url ? (
                    <img src={ex.image_url} alt={ex.name} className="w-12 h-12 rounded-lg object-cover" />
                  ) : (
                    <div className="w-12 h-12 rounded-lg bg-gray-100 flex items-center justify-center">
                      <Dumbbell className="w-5 h-5 text-gray-400" />
                    </div>
                  )}
                  <div>
                    <p className="text-sm font-medium text-gray-900">{ex.name}</p>
                    <p className="text-xs text-gray-400">{ex.muscle_group}</p>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Quick links */}
      <div className="mt-8 grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Link to="/workout-plans" className="bg-emerald-600 text-white rounded-2xl p-5 hover:bg-emerald-700 transition-colors flex items-center justify-between">
          <span className="font-medium text-sm">Workout Plans</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
        <Link to="/bmi" className="bg-white rounded-2xl p-5 border border-gray-100 hover:border-emerald-200 transition-colors flex items-center justify-between">
          <span className="font-medium text-sm text-gray-700">BMI Calculator</span>
          <ArrowRight className="w-4 h-4 text-emerald-600" />
        </Link>
        <Link to="/progress" className="bg-white rounded-2xl p-5 border border-gray-100 hover:border-emerald-200 transition-colors flex items-center justify-between">
          <span className="font-medium text-sm text-gray-700">Progress Tracker</span>
          <ArrowRight className="w-4 h-4 text-emerald-600" />
        </Link>
        <Link to="/search" className="bg-white rounded-2xl p-5 border border-gray-100 hover:border-emerald-200 transition-colors flex items-center justify-between">
          <span className="font-medium text-sm text-gray-700">Search Exercises</span>
          <ArrowRight className="w-4 h-4 text-emerald-600" />
        </Link>
      </div>
    </div>
  );
}
