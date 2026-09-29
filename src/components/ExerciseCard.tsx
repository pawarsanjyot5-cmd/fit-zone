import { Link } from 'react-router-dom';
import { Dumbbell, Sparkles, Flame, Clock, ArrowRight } from 'lucide-react';
import { Exercise } from '@/types';

interface ExerciseCardProps {
  exercise: Exercise;
}

export default function ExerciseCard({ exercise }: ExerciseCardProps) {
  const difficultyColors: Record<string, string> = {
    Beginner: 'bg-green-100 text-green-700',
    Intermediate: 'bg-yellow-100 text-yellow-700',
    Advanced: 'bg-red-100 text-red-700',
  };

  return (
    <Link
      to={`/exercise/${exercise.id}`}
      className="group bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md hover:border-emerald-200 transition-all duration-200"
    >
      <div className="relative h-44 bg-gray-100 overflow-hidden">
        {exercise.image_url ? (
          <img
            src={exercise.image_url}
            alt={exercise.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-400">
            <Dumbbell className="w-12 h-12" />
          </div>
        )}
        <div className="absolute top-3 left-3 flex gap-2">
          <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${difficultyColors[exercise.difficulty] || 'bg-gray-100 text-gray-700'}`}>
            {exercise.difficulty}
          </span>
        </div>
      </div>

      <div className="p-4">
        <h3 className="font-semibold text-gray-900 mb-1 group-hover:text-emerald-600 transition-colors">
          {exercise.name}
        </h3>
        {exercise.muscle_group && (
          <p className="text-sm text-gray-500 mb-2 flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5" />
            {exercise.muscle_group}
          </p>
        )}
        <div className="flex items-center gap-3 text-xs text-gray-400 mb-3">
          {exercise.equipment && (
            <span className="flex items-center gap-1">
              <Dumbbell className="w-3.5 h-3.5" />
              {exercise.equipment}
            </span>
          )}
          {exercise.duration && (
            <span className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" />
              {exercise.duration}
            </span>
          )}
          {exercise.sets && (
            <span className="flex items-center gap-1">
              <Flame className="w-3.5 h-3.5" />
              {exercise.sets} sets
            </span>
          )}
        </div>
        <div className="flex items-center text-sm font-medium text-emerald-600 group-hover:gap-2 transition-all">
          View Exercise
          <ArrowRight className="w-4 h-4 ml-1" />
        </div>
      </div>
    </Link>
  );
}
