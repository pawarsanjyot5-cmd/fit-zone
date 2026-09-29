import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';
import { Exercise } from '@/types';
import type { CustomWorkout as CustomWorkoutType } from '@/types';
import { Loading, EmptyState } from '@/components/States';
import { Search, Plus, Trash2, Save, Dumbbell, X, CheckCircle } from 'lucide-react';

export default function CustomWorkout() {
  const { user } = useAuth();
  const location = useLocation();
  const [workouts, setWorkouts] = useState<CustomWorkoutType[]>([]);
  const [allExercises, setAllExercises] = useState<Exercise[]>([]);
  const [selectedExercises, setSelectedExercises] = useState<string[]>([]);
  const [workoutName, setWorkoutName] = useState('');
  const [search, setSearch] = useState('');
  const [showPicker, setShowPicker] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [activeWorkout, setActiveWorkout] = useState<CustomWorkoutType | null>(null);

  useEffect(() => {
    if (!user) return;
    async function fetchData() {
      const [exRes, wRes] = await Promise.all([
        supabase.from('exercises').select('*').order('name'),
        supabase.from('custom_workouts').select('*').eq('user_id', user!.id).order('created_at', { ascending: false }),
      ]);
      setAllExercises(exRes.data || []);
      setWorkouts(wRes.data || []);
      setLoading(false);
    }
    fetchData();
  }, [user]);

  // Handle adding exercise from Exercise Detail page
  useEffect(() => {
    const addId = (location.state as any)?.addExerciseId;
    if (addId && !selectedExercises.includes(addId)) {
      setSelectedExercises([...selectedExercises, addId]);
      setShowPicker(false);
    }
  }, [location.state]);

  function toggleSelect(id: string) {
    if (selectedExercises.includes(id)) {
      setSelectedExercises(selectedExercises.filter((e) => e !== id));
    } else {
      setSelectedExercises([...selectedExercises, id]);
    }
  }

  async function saveWorkout() {
    if (!user || !workoutName.trim() || selectedExercises.length === 0) return;
    setSaving(true);
    const { data, error } = await supabase
      .from('custom_workouts')
      .insert({
        user_id: user.id,
        name: workoutName.trim(),
        exercise_ids: selectedExercises,
      })
      .select()
      .maybeSingle();

    if (!error && data) {
      setWorkouts([data, ...workouts]);
      setWorkoutName('');
      setSelectedExercises([]);
      setMsg('Workout saved successfully!');
      setTimeout(() => setMsg(null), 3000);
    }
    setSaving(false);
  }

  async function deleteWorkout(id: string) {
    await supabase.from('custom_workouts').delete().eq('id', id);
    setWorkouts(workouts.filter((w) => w.id !== id));
    if (activeWorkout?.id === id) setActiveWorkout(null);
  }

  if (loading) return <Loading message="Loading..." />;

  const filteredExercises = allExercises.filter((ex) =>
    ex.name.toLowerCase().includes(search.toLowerCase())
  );

  const selectedExerciseDetails = selectedExercises
    .map((id) => allExercises.find((e) => e.id === id))
    .filter((e): e is Exercise => e !== undefined);

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">Custom Workout</h1>
      <p className="text-gray-500 mb-8">Create your own workout by selecting exercises from the library.</p>

      {msg && (
        <div className="bg-emerald-50 text-emerald-700 px-4 py-3 rounded-xl text-sm font-medium mb-4">
          {msg}
        </div>
      )}

      {/* Create workout form */}
      <div className="bg-white rounded-2xl p-6 border border-gray-100 mb-6">
        <h2 className="font-semibold text-gray-900 mb-4">Create New Workout</h2>
        <input
          type="text"
          placeholder="Workout name (e.g. 'My Monday Routine')"
          value={workoutName}
          onChange={(e) => setWorkoutName(e.target.value)}
          className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm mb-4"
        />

        {/* Selected exercises */}
        {selectedExerciseDetails.length > 0 && (
          <div className="mb-4">
            <p className="text-sm font-medium text-gray-700 mb-2">
              Selected Exercises ({selectedExerciseDetails.length})
            </p>
            <div className="space-y-2">
              {selectedExerciseDetails.map((ex) => (
                <div key={ex.id} className="flex items-center justify-between p-3 rounded-xl bg-emerald-50">
                  <div className="flex items-center gap-3">
                    {ex.image_url ? (
                      <img src={ex.image_url} alt={ex.name} className="w-10 h-10 rounded-lg object-cover" />
                    ) : (
                      <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center">
                        <Dumbbell className="w-4 h-4 text-gray-400" />
                      </div>
                    )}
                    <div>
                      <p className="text-sm font-medium text-gray-900">{ex.name}</p>
                      <p className="text-xs text-gray-400">{ex.muscle_group}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => toggleSelect(ex.id)}
                    className="text-red-400 hover:text-red-600"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Exercise picker */}
        {showPicker && (
          <div className="mb-4 border border-gray-200 rounded-xl p-4 max-h-96 overflow-y-auto">
            <div className="relative mb-3">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search exercises..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
              />
            </div>
            <div className="space-y-1 max-h-64 overflow-y-auto">
              {filteredExercises.map((ex) => (
                <button
                  key={ex.id}
                  onClick={() => toggleSelect(ex.id)}
                  className={`w-full flex items-center gap-3 p-2.5 rounded-xl text-left transition-colors ${
                    selectedExercises.includes(ex.id)
                      ? 'bg-emerald-50 text-emerald-700'
                      : 'hover:bg-gray-50'
                  }`}
                >
                  {selectedExercises.includes(ex.id) ? (
                    <CheckCircle className="w-4 h-4 text-emerald-600" />
                  ) : (
                    <Plus className="w-4 h-4 text-gray-400" />
                  )}
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">{ex.name}</p>
                    <p className="text-xs text-gray-400">{ex.category} · {ex.muscle_group}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="flex gap-3">
          <button
            onClick={() => setShowPicker(!showPicker)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gray-100 text-gray-700 font-medium text-sm hover:bg-gray-200 transition-colors"
          >
            <Plus className="w-4 h-4" />
            {showPicker ? 'Hide Picker' : 'Add Exercises'}
          </button>
          <button
            onClick={saveWorkout}
            disabled={!workoutName.trim() || selectedExercises.length === 0 || saving}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 text-white font-medium text-sm hover:bg-emerald-700 transition-colors disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            {saving ? 'Saving...' : 'Save Workout'}
          </button>
        </div>
      </div>

      {/* Saved workouts */}
      <div>
        <h2 className="font-semibold text-gray-900 mb-4">My Saved Workouts</h2>
        {workouts.length === 0 ? (
          <EmptyState message="No custom workouts yet. Create one above!" icon={Dumbbell} />
        ) : (
          <div className="space-y-4">
            {workouts.map((w) => (
              <div key={w.id} className="bg-white rounded-2xl p-5 border border-gray-100">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold text-gray-900">{w.name}</h3>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-400">{w.exercise_ids.length} exercises</span>
                    <button
                      onClick={() => deleteWorkout(w.id)}
                      className="text-red-400 hover:text-red-600"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  {w.exercise_ids.map((id) => {
                    const ex = allExercises.find((e) => e.id === id);
                    return ex ? (
                      <span key={id} className="px-3 py-1 rounded-lg bg-gray-50 text-xs text-gray-600">
                        {ex.name}
                      </span>
                    ) : null;
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

