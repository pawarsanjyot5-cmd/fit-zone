import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Exercise, WorkoutPlan } from '@/types';
import { useAuth } from '@/context/AuthContext';
import { Loading } from '@/components/States';
import {
  Dumbbell, Plus, Edit2, Trash2, X, Save, Search,
  Flower2, HeartPulse, Clock, Calendar, Users, LayoutDashboard
} from 'lucide-react';
import { CATEGORIES, DIFFICULTIES, EQUIPMENT_OPTIONS, MUSCLE_GROUPS } from '@/lib/constants';

type Tab = 'exercises' | 'workout-plans' | 'users';

export default function AdminDashboard() {
  const { profile } = useAuth();
  const [tab, setTab] = useState<Tab>('exercises');
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [plans, setPlans] = useState<WorkoutPlan[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingExercise, setEditingExercise] = useState<Exercise | null>(null);
  const [categoryFilter, setCategoryFilter] = useState<string>('all');

  useEffect(() => {
    fetchAll();
  }, []);

  async function fetchAll() {
    const [exRes, planRes, userRes] = await Promise.all([
      supabase.from('exercises').select('*').order('created_at', { ascending: false }),
      supabase.from('workout_plans').select('*').order('created_at', { ascending: false }),
      supabase.from('profiles').select('*').order('created_at', { ascending: false }),
    ]);
    setExercises(exRes.data || []);
    setPlans(planRes.data || []);
    setUsers(userRes.data || []);
    setLoading(false);
  }

  async function deleteExercise(id: string) {
    if (!confirm('Are you sure you want to delete this exercise?')) return;
    await supabase.from('exercises').delete().eq('id', id);
    setExercises(exercises.filter((e) => e.id !== id));
  }

  async function deletePlan(id: string) {
    if (!confirm('Are you sure you want to delete this workout plan?')) return;
    await supabase.from('workout_plans').delete().eq('id', id);
    setPlans(plans.filter((p) => p.id !== id));
  }

  const filteredExercises = exercises.filter((ex) => {
    const matchesSearch = ex.name.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || ex.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  if (loading) return <Loading message="Loading admin dashboard..." />;

  const tabs = [
    { key: 'exercises' as Tab, label: 'Exercises', icon: Dumbbell, count: exercises.length },
    { key: 'workout-plans' as Tab, label: 'Workout Plans', icon: Calendar, count: plans.length },
    { key: 'users' as Tab, label: 'Users', icon: Users, count: users.length },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex items-center gap-3 mb-8">
        <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center">
          <LayoutDashboard className="w-6 h-6" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-sm text-gray-500">Manage exercises, workout plans, and users</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6 border-b border-gray-200">
        {tabs.map((t) => {
          const Icon = t.icon;
          return (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                tab === t.key
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <Icon className="w-4 h-4" />
              {t.label}
              <span className="px-2 py-0.5 rounded-full bg-gray-100 text-xs text-gray-500">
                {t.count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Exercises Tab */}
      {tab === 'exercises' && (
        <div>
          <div className="flex flex-col sm:flex-row gap-3 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search exercises..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              />
            </div>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            >
              <option value="all">All Categories</option>
              {CATEGORIES.map((c) => (
                <option key={c.key} value={c.key}>{c.label}</option>
              ))}
            </select>
            <button
              onClick={() => { setEditingExercise(null); setShowForm(true); }}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 text-white font-medium text-sm hover:bg-blue-700 transition-colors whitespace-nowrap"
            >
              <Plus className="w-4 h-4" />
              Add Exercise
            </button>
          </div>

          {/* Exercise table */}
          <div className="overflow-x-auto bg-white rounded-2xl border border-gray-100">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-gray-400 border-b border-gray-100">
                  <th className="px-4 py-3 font-medium">Name</th>
                  <th className="px-4 py-3 font-medium">Category</th>
                  <th className="px-4 py-3 font-medium hidden sm:table-cell">Muscle Group</th>
                  <th className="px-4 py-3 font-medium hidden md:table-cell">Difficulty</th>
                  <th className="px-4 py-3 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredExercises.map((ex) => (
                  <tr key={ex.id} className="border-b border-gray-50 hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium text-gray-900">{ex.name}</td>
                    <td className="px-4 py-3 text-gray-500 capitalize">{ex.category}</td>
                    <td className="px-4 py-3 text-gray-500 hidden sm:table-cell">{ex.muscle_group || '-'}</td>
                    <td className="px-4 py-3 hidden md:table-cell">
                      <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
                        {ex.difficulty}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => { setEditingExercise(ex); setShowForm(true); }}
                          className="p-2 rounded-lg text-blue-500 hover:bg-blue-50"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => deleteExercise(ex.id)}
                          className="p-2 rounded-lg text-red-500 hover:bg-red-50"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filteredExercises.length === 0 && (
              <p className="text-sm text-gray-400 text-center py-8">No exercises found.</p>
            )}
          </div>
        </div>
      )}

      {/* Workout Plans Tab */}
      {tab === 'workout-plans' && (
        <div>
          <div className="flex justify-between items-center mb-6">
            <p className="text-sm text-gray-500">{plans.length} workout plans</p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {plans.map((plan) => (
              <div key={plan.id} className="bg-white rounded-2xl p-5 border border-gray-100">
                <h3 className="font-semibold text-gray-900 mb-1">{plan.name}</h3>
                <p className="text-xs text-gray-400 mb-2">{plan.days_per_week} days/week · {plan.difficulty}</p>
                <p className="text-sm text-gray-500 mb-4 line-clamp-2">{plan.description}</p>
                <button
                  onClick={() => deletePlan(plan.id)}
                  className="flex items-center gap-1.5 text-sm text-red-500 hover:text-red-600 font-medium"
                >
                  <Trash2 className="w-4 h-4" />
                  Delete
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Users Tab */}
      {tab === 'users' && (
        <div className="overflow-x-auto bg-white rounded-2xl border border-gray-100">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-gray-400 border-b border-gray-100">
                <th className="px-4 py-3 font-medium">Name</th>
                <th className="px-4 py-3 font-medium hidden sm:table-cell">Role</th>
                <th className="px-4 py-3 font-medium hidden md:table-cell">Joined</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id} className="border-b border-gray-50">
                  <td className="px-4 py-3 font-medium text-gray-900">
                    {u.full_name || 'Unknown'}
                  </td>
                  <td className="px-4 py-3 hidden sm:table-cell">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                      u.role === 'admin' ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-600'
                    }`}>
                      {u.role}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-500 hidden md:table-cell">
                    {new Date(u.created_at).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {users.length === 0 && (
            <p className="text-sm text-gray-400 text-center py-8">No users found.</p>
          )}
        </div>
      )}

      {/* Exercise Form Modal */}
      {showForm && (
        <ExerciseForm
          exercise={editingExercise}
          onClose={() => { setShowForm(false); setEditingExercise(null); }}
          onSaved={() => {
            setShowForm(false);
            setEditingExercise(null);
            fetchAll();
          }}
        />
      )}
    </div>
  );
}

// Exercise Form Component
function ExerciseForm({
  exercise,
  onClose,
  onSaved,
}: {
  exercise: Exercise | null;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [form, setForm] = useState({
    name: exercise?.name || '',
    category: exercise?.category || 'strength',
    muscle_group: exercise?.muscle_group || '',
    target_muscles: exercise?.target_muscles || '',
    difficulty: exercise?.difficulty || 'Beginner',
    equipment: exercise?.equipment || 'No Equipment',
    description: exercise?.description || '',
    instructions: exercise?.instructions || '',
    video_url: exercise?.video_url || '',
    image_url: exercise?.image_url || '',
    sets: exercise?.sets || '',
    repetitions: exercise?.repetitions || '',
    duration: exercise?.duration || '',
    rest_time: exercise?.rest_time || '',
    common_mistakes: exercise?.common_mistakes || '',
    safety_tips: exercise?.safety_tips || '',
    beginner_modification: exercise?.beginner_modification || '',
    correct_form: exercise?.correct_form || '',
    breathing_technique: exercise?.breathing_technique || '',
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function update(field: string, value: string) {
    setForm({ ...form, [field]: value });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);

    const data = { ...form };
    if (exercise) {
      const { error } = await supabase.from('exercises').update(data).eq('id', exercise.id);
      if (error) setError(error.message);
      else onSaved();
    } else {
      const { error } = await supabase.from('exercises').insert(data);
      if (error) setError(error.message);
      else onSaved();
    }
    setSaving(false);
  }

  const inputClass = 'w-full px-3 py-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm';
  const labelClass = 'block text-sm font-medium text-gray-700 mb-1';

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-start justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl w-full max-w-2xl my-8">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-100 sticky top-0 bg-white rounded-t-2xl z-10">
          <h2 className="text-lg font-bold text-gray-900">
            {exercise ? 'Edit Exercise' : 'Add New Exercise'}
          </h2>
          <button onClick={onClose} className="p-2 rounded-lg text-gray-400 hover:bg-gray-100">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="bg-red-50 text-red-600 px-4 py-3 rounded-xl text-sm">
              {error}
            </div>
          )}

          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Exercise Name *</label>
              <input required value={form.name} onChange={(e) => update('name', e.target.value)} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Category *</label>
              <select value={form.category} onChange={(e) => update('category', e.target.value)} className={inputClass}>
                {CATEGORIES.map((c) => (
                  <option key={c.key} value={c.key}>{c.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className={labelClass}>Muscle Group</label>
              <input value={form.muscle_group} onChange={(e) => update('muscle_group', e.target.value)} className={inputClass} placeholder="e.g. Chest" />
            </div>
            <div>
              <label className={labelClass}>Target Muscles</label>
              <input value={form.target_muscles} onChange={(e) => update('target_muscles', e.target.value)} className={inputClass} placeholder="e.g. Pectorals, Triceps" />
            </div>
            <div>
              <label className={labelClass}>Difficulty</label>
              <select value={form.difficulty} onChange={(e) => update('difficulty', e.target.value)} className={inputClass}>
                {DIFFICULTIES.map((d) => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>
            <div>
              <label className={labelClass}>Equipment</label>
              <select value={form.equipment} onChange={(e) => update('equipment', e.target.value)} className={inputClass}>
                {EQUIPMENT_OPTIONS.map((eq) => <option key={eq} value={eq}>{eq}</option>)}
              </select>
            </div>
          </div>

          <div>
            <label className={labelClass}>Description</label>
            <textarea value={form.description} onChange={(e) => update('description', e.target.value)} className={inputClass} rows={2} />
          </div>
          <div>
            <label className={labelClass}>Instructions</label>
            <textarea value={form.instructions} onChange={(e) => update('instructions', e.target.value)} className={inputClass} rows={3} />
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Video URL (YouTube embed)</label>
              <input value={form.video_url} onChange={(e) => update('video_url', e.target.value)} className={inputClass} placeholder="https://www.youtube.com/embed/..." />
            </div>
            <div>
              <label className={labelClass}>Image URL</label>
              <input value={form.image_url} onChange={(e) => update('image_url', e.target.value)} className={inputClass} placeholder="https://..." />
            </div>
            <div>
              <label className={labelClass}>Sets</label>
              <input value={form.sets} onChange={(e) => update('sets', e.target.value)} className={inputClass} placeholder="e.g. 4" />
            </div>
            <div>
              <label className={labelClass}>Repetitions</label>
              <input value={form.repetitions} onChange={(e) => update('repetitions', e.target.value)} className={inputClass} placeholder="e.g. 8-12" />
            </div>
            <div>
              <label className={labelClass}>Duration</label>
              <input value={form.duration} onChange={(e) => update('duration', e.target.value)} className={inputClass} placeholder="e.g. 30-60 seconds" />
            </div>
            <div>
              <label className={labelClass}>Rest Time</label>
              <input value={form.rest_time} onChange={(e) => update('rest_time', e.target.value)} className={inputClass} placeholder="e.g. 90 seconds" />
            </div>
          </div>

          <div>
            <label className={labelClass}>Common Mistakes</label>
            <textarea value={form.common_mistakes} onChange={(e) => update('common_mistakes', e.target.value)} className={inputClass} rows={2} />
          </div>
          <div>
            <label className={labelClass}>Safety Tips</label>
            <textarea value={form.safety_tips} onChange={(e) => update('safety_tips', e.target.value)} className={inputClass} rows={2} />
          </div>
          <div>
            <label className={labelClass}>Beginner Modification</label>
            <textarea value={form.beginner_modification} onChange={(e) => update('beginner_modification', e.target.value)} className={inputClass} rows={2} />
          </div>
          <div>
            <label className={labelClass}>Correct Form</label>
            <textarea value={form.correct_form} onChange={(e) => update('correct_form', e.target.value)} className={inputClass} rows={2} />
          </div>
          <div>
            <label className={labelClass}>Breathing Technique</label>
            <textarea value={form.breathing_technique} onChange={(e) => update('breathing_technique', e.target.value)} className={inputClass} rows={2} />
          </div>

          <div className="flex gap-3 pt-4 border-t border-gray-100">
            <button
              type="submit"
              disabled={saving}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 text-white font-medium text-sm hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              {saving ? 'Saving...' : exercise ? 'Update Exercise' : 'Create Exercise'}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl bg-gray-100 text-gray-700 font-medium text-sm hover:bg-gray-200 transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
