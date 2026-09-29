import { Link } from 'react-router-dom';
import { Dumbbell, Heart } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300 mt-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <div className="flex items-center gap-2 text-white font-bold text-lg mb-3">
              <Dumbbell className="w-6 h-6 text-emerald-400" />
              FitZone
            </div>
            <p className="text-sm text-gray-400">
              A college web-development project designed to organize fitness and workout
              information in one simple platform.
            </p>
          </div>

          <div>
            <h3 className="text-white font-semibold mb-3">Explore</h3>
            <ul className="space-y-2 text-sm">
              <li><Link to="/strength" className="hover:text-emerald-400">Strength Training</Link></li>
              <li><Link to="/yoga" className="hover:text-emerald-400">Yoga</Link></li>
              <li><Link to="/warmup" className="hover:text-emerald-400">Warm-up & Stretching</Link></li>
              <li><Link to="/cardio" className="hover:text-emerald-400">Cardio</Link></li>
              <li><Link to="/search" className="hover:text-emerald-400">Search Exercises</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="text-white font-semibold mb-3">Account</h3>
            <ul className="space-y-2 text-sm">
              <li><Link to="/dashboard" className="hover:text-emerald-400">Dashboard</Link></li>
              <li><Link to="/progress" className="hover:text-emerald-400">Progress Tracker</Link></li>
              <li><Link to="/workout-plans" className="hover:text-emerald-400">Workout Plans</Link></li>
              <li><Link to="/bmi" className="hover:text-emerald-400">BMI Calculator</Link></li>
              <li><Link to="/about" className="hover:text-emerald-400">About</Link></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-700 mt-8 pt-6 flex flex-col sm:flex-row justify-between items-center gap-2 text-sm">
          <p className="text-gray-400">Developed as a College Web Development Project</p>
          <p className="text-gray-400 flex items-center gap-1">
            Built with <Heart className="w-4 h-4 text-emerald-400" /> using React & Supabase
          </p>
        </div>
      </div>
    </footer>
  );
}
