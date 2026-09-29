import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { Exercise } from '@/types';
import ExerciseCard from '@/components/ExerciseCard';
import { Loading, EmptyState } from '@/components/States';
import { FILTER_CATEGORIES, MUSCLE_GROUPS, DIFFICULTIES, EQUIPMENT_OPTIONS } from '@/lib/constants';
import { Search, Filter, X } from 'lucide-react';

export default function SearchPage() {
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedMuscleGroups, setSelectedMuscleGroups] = useState<string[]>([]);
  const [selectedDifficulties, setSelectedDifficulties] = useState<string[]>([]);
  const [selectedEquipment, setSelectedEquipment] = useState<string[]>([]);
  const [showFilters, setShowFilters] = useState(false);

  const fetchExercises = useCallback(async () => {
    setLoading(true);
    let dbQuery = supabase.from('exercises').select('*');

    if (selectedCategories.length > 0) {
      dbQuery = dbQuery.in('category', selectedCategories);
    }
    if (selectedMuscleGroups.length > 0) {
      dbQuery = dbQuery.in('muscle_group', selectedMuscleGroups);
    }
    if (selectedDifficulties.length > 0) {
      dbQuery = dbQuery.in('difficulty', selectedDifficulties);
    }
    if (selectedEquipment.length > 0) {
      dbQuery = dbQuery.in('equipment', selectedEquipment);
    }

    const { data, error } = await dbQuery;

    if (error) {
      setExercises([]);
    } else {
      let filtered = data || [];
      if (query.trim()) {
        const q = query.toLowerCase();
        filtered = filtered.filter(
          (ex) =>
            ex.name?.toLowerCase().includes(q) ||
            ex.muscle_group?.toLowerCase().includes(q) ||
            ex.category?.toLowerCase().includes(q) ||
            ex.equipment?.toLowerCase().includes(q) ||
            ex.difficulty?.toLowerCase().includes(q) ||
            ex.target_muscles?.toLowerCase().includes(q)
        );
      }
      setExercises(filtered);
    }
    setLoading(false);
  }, [query, selectedCategories, selectedMuscleGroups, selectedDifficulties, selectedEquipment]);

  useEffect(() => {
    const timer = setTimeout(fetchExercises, 300);
    return () => clearTimeout(timer);
  }, [fetchExercises]);

  function toggleFilter(value: string, list: string[], setter: (v: string[]) => void) {
    if (list.includes(value)) {
      setter(list.filter((v) => v !== value));
    } else {
      setter([...list, value]);
    }
  }

  const hasActiveFilters =
    selectedCategories.length > 0 ||
    selectedMuscleGroups.length > 0 ||
    selectedDifficulties.length > 0 ||
    selectedEquipment.length > 0;

  function clearAll() {
    setSelectedCategories([]);
    setSelectedMuscleGroups([]);
    setSelectedDifficulties([]);
    setSelectedEquipment([]);
    setQuery('');
  }

  const FilterGroup = ({
    title,
    options,
    selected,
    setter,
  }: {
    title: string;
    options: string[];
    selected: string[];
    setter: (v: string[]) => void;
  }) => (
    <div className="mb-5">
      <h4 className="text-sm font-semibold text-gray-700 mb-2">{title}</h4>
      <div className="flex flex-wrap gap-2">
        {options.map((opt) => (
          <button
            key={opt}
            onClick={() => toggleFilter(opt, selected, setter)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              selected.includes(opt)
                ? 'bg-emerald-600 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {opt}
          </button>
        ))}
      </div>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">Exercise Search</h1>
      <p className="text-gray-500 mb-6">Search by name, muscle group, category, equipment, or difficulty.</p>

      {/* Search bar */}
      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
        <input
          type="text"
          placeholder="Search exercises... (e.g. 'Back', 'Dumbbell', 'Beginner')"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="w-full pl-11 pr-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm"
        />
      </div>

      {/* Filter toggle button (mobile) */}
      <button
        onClick={() => setShowFilters(!showFilters)}
        className="lg:hidden flex items-center gap-2 px-4 py-2 rounded-xl bg-white border border-gray-200 text-sm font-medium text-gray-600 mb-4"
      >
        <Filter className="w-4 h-4" />
        Filters {hasActiveFilters && `(${selectedCategories.length + selectedMuscleGroups.length + selectedDifficulties.length + selectedEquipment.length})`}
      </button>

      <div className="grid lg:grid-cols-[260px_1fr] gap-6">
        {/* Filters Sidebar */}
        <div className={`${showFilters ? 'block' : 'hidden'} lg:block`}>
          <div className="bg-white rounded-2xl p-5 border border-gray-100 sticky top-20">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                <Filter className="w-4 h-4" />
                Filters
              </h3>
              {hasActiveFilters && (
                <button onClick={clearAll} className="text-xs text-red-500 hover:underline flex items-center gap-1">
                  <X className="w-3 h-3" />
                  Clear all
                </button>
              )}
            </div>
            <FilterGroup
              title="Category"
              options={FILTER_CATEGORIES.map((c) => c.key)}
              selected={selectedCategories}
              setter={setSelectedCategories}
            />
            <FilterGroup
              title="Muscle Group"
              options={MUSCLE_GROUPS}
              selected={selectedMuscleGroups}
              setter={setSelectedMuscleGroups}
            />
            <FilterGroup
              title="Difficulty"
              options={DIFFICULTIES}
              selected={selectedDifficulties}
              setter={setSelectedDifficulties}
            />
            <FilterGroup
              title="Equipment"
              options={EQUIPMENT_OPTIONS}
              selected={selectedEquipment}
              setter={setSelectedEquipment}
            />
          </div>
        </div>

        {/* Results */}
        <div>
          <p className="text-sm text-gray-500 mb-4">
            {loading ? 'Searching...' : `${exercises.length} exercise${exercises.length !== 1 ? 's' : ''} found`}
          </p>
          {loading ? (
            <Loading message="Loading exercises..." />
          ) : exercises.length === 0 ? (
            <EmptyState message="No exercises match your search." icon={Search} />
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {exercises.map((ex) => (
                <ExerciseCard key={ex.id} exercise={ex} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
