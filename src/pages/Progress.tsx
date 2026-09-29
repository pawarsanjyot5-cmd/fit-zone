import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';
import { Loading } from '@/components/States';
import { Dumbbell, Calendar, TrendingUp, Flame, Activity } from 'lucide-react';

export default function Progress() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [history, setHistory] = useState<any[]>([]);
  const [stats, setStats] = useState({ total: 0, weekly: 0, monthly: 0, streak: 0 });

  useEffect(() => {
    if (!user) return;
    supabase
      .from('workout_history')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .then(({ data }) => {
        const allHist = data || [];
        setHistory(allHist);

        const now = new Date();
        const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

        const weekly = allHist.filter((h) => new Date(h.workout_date) >= weekAgo).length;
        const monthly = allHist.filter((h) => new Date(h.workout_date) >= monthAgo).length;

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
      });
  }, [user]);

  if (loading) return <Loading message="Loading progress..." />;

  const statCards = [
    { label: 'Total Workouts', value: stats.total, icon: Dumbbell, color: 'bg-emerald-50 text-emerald-600', pct: 100 },
    { label: 'This Week', value: stats.weekly, icon: Calendar, color: 'bg-blue-50 text-blue-600', pct: Math.min((stats.weekly / 7) * 100, 100) },
    { label: 'This Month', value: stats.monthly, icon: TrendingUp, color: 'bg-purple-50 text-purple-600', pct: Math.min((stats.monthly / 30) * 100, 100) },
    { label: 'Streak (days)', value: stats.streak, icon: Flame, color: 'bg-orange-50 text-orange-600', pct: Math.min((stats.streak / 30) * 100, 100) },
  ];

  // Simple bar chart for last 7 days
  const last7Days = [];
  for (let i = 6; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    const dateStr = date.toISOString().split('T')[0];
    const count = history.filter((h) => h.workout_date === dateStr).length;
    last7Days.push({ day: date.toLocaleDateString('en', { weekday: 'short' }), count });
  }
  const maxCount = Math.max(...last7Days.map((d) => d.count), 1);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">Progress Tracker</h1>
      <p className="text-gray-500 mb-8">Track your workout activity and stay motivated.</p>

      {/* Stat Cards with Progress Bars */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {statCards.map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.label} className="bg-white rounded-2xl p-5 border border-gray-100">
              <div className={`w-10 h-10 rounded-xl ${stat.color} flex items-center justify-center mb-3`}>
                <Icon className="w-5 h-5" />
              </div>
              <p className="text-3xl font-bold text-gray-900 mb-1">{stat.value}</p>
              <p className="text-sm text-gray-500 mb-3">{stat.label}</p>
              <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
                <div
                  className="bg-emerald-500 h-full rounded-full transition-all duration-500"
                  style={{ width: `${stat.pct}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>

      {/* Weekly Activity Chart */}
      <div className="bg-white rounded-2xl p-6 border border-gray-100 mb-8">
        <div className="flex items-center gap-2 mb-6">
          <Activity className="w-5 h-5 text-emerald-600" />
          <h2 className="font-semibold text-gray-900">Last 7 Days Activity</h2>
        </div>
        <div className="flex items-end justify-between gap-2 h-48">
          {last7Days.map((d) => (
            <div key={d.day} className="flex-1 flex flex-col items-center gap-2">
              <div className="w-full flex items-end justify-center h-32">
                <div
                  className="w-full max-w-[60px] bg-emerald-500 rounded-t-lg transition-all duration-500 hover:bg-emerald-600 relative group"
                  style={{ height: `${(d.count / maxCount) * 100}%`, minHeight: d.count > 0 ? '8px' : '2px' }}
                >
                  {d.count > 0 && (
                    <span className="absolute -top-6 left-1/2 -translate-x-1/2 text-xs font-bold text-gray-700 opacity-0 group-hover:opacity-100 transition-opacity">
                      {d.count}
                    </span>
                  )}
                </div>
              </div>
              <span className="text-xs text-gray-400">{d.day}</span>
            </div>
          ))}
        </div>
      </div>

      {/* History Table */}
      <div className="bg-white rounded-2xl p-6 border border-gray-100">
        <h2 className="font-semibold text-gray-900 mb-4">Workout History</h2>
        {history.length === 0 ? (
          <p className="text-sm text-gray-400 py-8 text-center">
            Complete a workout to see your history here.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-gray-400 border-b border-gray-100">
                  <th className="pb-3 font-medium">Exercise</th>
                  <th className="pb-3 font-medium">Date</th>
                </tr>
              </thead>
              <tbody>
                {history.slice(0, 20).map((h) => (
                  <tr key={h.id} className="border-b border-gray-50">
                    <td className="py-3 font-medium text-gray-900">{h.exercise_name}</td>
                    <td className="py-3 text-gray-500">
                      {new Date(h.workout_date).toLocaleDateString('en', {
                        year: 'numeric', month: 'short', day: 'numeric'
                      })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
