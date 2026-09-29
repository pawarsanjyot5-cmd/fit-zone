import { Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { Dumbbell, Flower2, Clock, HeartPulse, ArrowRight, Lightbulb, Activity } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { Exercise } from '@/types';
import ExerciseCard from '@/components/ExerciseCard';
import { Loading } from '@/components/States';

const categories = [
  {
    title: 'Gym & Strength Training',
    description: 'Build strength and train different muscle groups.',
    icon: Dumbbell,
    path: '/strength',
    color: 'bg-emerald-50 text-emerald-600',
  },
  {
    title: 'Yoga',
    description: 'Explore yoga poses for flexibility, balance and relaxation.',
    icon: Flower2,
    path: '/yoga',
    color: 'bg-teal-50 text-teal-600',
  },
  {
    title: 'Warm-up & Stretching',
    description: 'Prepare your body before exercise and stretch after workouts.',
    icon: Clock,
    path: '/warmup',
    color: 'bg-blue-50 text-blue-600',
  },
  {
    title: 'Cardio',
    description: 'Explore exercises that improve cardiovascular fitness.',
    icon: HeartPulse,
    path: '/cardio',
    color: 'bg-orange-50 text-orange-600',
  },
];

const tips = [
  'Warm up before exercise to prepare your muscles and joints.',
  'Maintain proper form — quality over quantity, every time.',
  'Stay hydrated before, during, and after your workouts.',
  'Take adequate rest between workouts to allow recovery.',
  'Increase exercise difficulty gradually to avoid injury.',
];

export default function Home() {
  const [popular, setPopular] = useState<Exercise[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const names = ['Push-Ups', 'Squats', 'Pull-Ups', 'Plank', 'Lunges', 'Shoulder Press'];
    supabase
      .from('exercises')
      .select('*')
      .in('name', names)
      .then(({ data }) => {
        // Sort by the order of names array
        if (data) {
          const sorted = names
            .map((n) => data.find((e) => e.name === n))
            .filter((e): e is Exercise => e !== undefined);
          setPopular(sorted);
        }
        setLoading(false);
      });
  }, []);

  return (
    <div>
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-emerald-500 to-teal-600 text-white overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 left-10 w-72 h-72 bg-white rounded-full blur-3xl" />
          <div className="absolute bottom-10 right-10 w-96 h-96 bg-white rounded-full blur-3xl" />
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24">
          <div className="grid lg:grid-cols-2 gap-8 items-center">
            <div>
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4 leading-tight">
                Your Fitness Journey Starts Here
              </h1>
              <p className="text-lg text-emerald-50 mb-8 max-w-lg">
                Explore strength training, yoga, stretching and cardio exercises with
                proper guidance and demonstration videos.
              </p>
              <div className="flex flex-wrap gap-4">
                <Link
                  to="/strength"
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-white text-emerald-600 font-semibold hover:bg-emerald-50 transition-colors shadow-sm"
                >
                  Explore Workouts
                  <ArrowRight className="w-4 h-4" />
                </Link>
                <Link
                  to="/search"
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-emerald-700 text-white font-semibold hover:bg-emerald-800 transition-colors border border-emerald-400"
                >
                  Browse Exercises
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
            <div className="hidden lg:block">
              <img
                src="https://images.pexels.com/photos/3888405/pexels-photo-3888405.jpeg?auto=compress&cs=tinysrgb&h=650&w=940"
                alt="Person working out in gym"
                className="rounded-2xl shadow-2xl w-full h-80 object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Fitness Categories */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Fitness Categories</h2>
        <p className="text-gray-500 mb-8">Choose a category to start exploring exercises.</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {categories.map((cat) => {
            const Icon = cat.icon;
            return (
              <Link
                key={cat.path}
                to={cat.path}
                className="group bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md hover:border-emerald-200 transition-all"
              >
                <div className={`w-14 h-14 rounded-xl ${cat.color} flex items-center justify-center mb-4`}>
                  <Icon className="w-7 h-7" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2 group-hover:text-emerald-600 transition-colors">
                  {cat.title}
                </h3>
                <p className="text-sm text-gray-500 mb-4">{cat.description}</p>
                <span className="text-sm font-medium text-emerald-600 flex items-center gap-1 group-hover:gap-2 transition-all">
                  View More
                  <ArrowRight className="w-4 h-4" />
                </span>
              </Link>
            );
          })}
        </div>
      </section>

      {/* Popular Exercises */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16 bg-gray-50 rounded-3xl">
        <div className="flex items-center gap-2 mb-2">
          <Activity className="w-6 h-6 text-emerald-600" />
          <h2 className="text-2xl font-bold text-gray-900">Popular Exercises</h2>
        </div>
        <p className="text-gray-500 mb-8">Start with these fundamental exercises.</p>
        {loading ? (
          <Loading message="Loading exercises..." />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {popular.map((ex) => (
              <ExerciseCard key={ex.id} exercise={ex} />
            ))}
          </div>
        )}
      </section>

      {/* Fitness Tips */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        <div className="flex items-center gap-2 mb-2">
          <Lightbulb className="w-6 h-6 text-amber-500" />
          <h2 className="text-2xl font-bold text-gray-900">Fitness Tips</h2>
        </div>
        <p className="text-gray-500 mb-8">Simple guidelines to help you train safely and effectively.</p>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          {tips.map((tip, i) => (
            <div
              key={i}
              className="bg-white rounded-xl p-5 shadow-sm border border-gray-100"
            >
              <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center font-bold text-sm mb-3">
                {i + 1}
              </div>
              <p className="text-sm text-gray-600">{tip}</p>
            </div>
          ))}
        </div>
        <p className="text-xs text-gray-400 mt-6">
          Note: These tips are general fitness guidelines and not medical advice. Consult a healthcare
          professional before starting any new exercise program.
        </p>
      </section>
    </div>
  );
}
