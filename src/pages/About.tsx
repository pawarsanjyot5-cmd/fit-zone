import { Dumbbell, Flower2, HeartPulse, Clock, Code2, Database, Shield, Layers } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function About() {
  const features = [
    'Exercise library with strength training, yoga, warm-up, stretching, and cardio',
    'Demonstration videos for every exercise',
    'Search and filter exercises by name, muscle group, category, equipment, and difficulty',
    'User registration and login with secure authentication',
    'Favorites — save exercises for quick access',
    'Custom workout creation — build your own workout plans',
    'Predefined workout plans for different fitness goals',
    'Progress tracker with workout history and streak counter',
    'Workout timer with countdown and rest timer',
    'BMI calculator for general health screening',
    'Admin dashboard for managing all content',
    'Recently viewed exercises on dashboard',
    'Related exercise recommendations',
    'Responsive design for desktop, tablet, and mobile',
  ];

  const technologies = [
    { name: 'React + TypeScript', icon: Code2 },
    { name: 'Tailwind CSS', icon: Layers },
    { name: 'Supabase (Database & Auth)', icon: Database },
    { name: 'Row Level Security', icon: Shield },
    { name: 'React Router', icon: Dumbbell },
    { name: 'Lucide Icons', icon: Flower2 },
  ];

  const objectives = [
    'Provide a single platform for discovering fitness exercises',
    'Help users learn correct exercise techniques through videos',
    'Allow users to create and track custom workouts',
    'Demonstrate full-stack web development skills',
    'Implement secure authentication and role-based access control',
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="text-center mb-12">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-emerald-50 text-emerald-600 mb-4">
          <Dumbbell className="w-8 h-8" />
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-3">About FitZone</h1>
        <p className="text-gray-600 max-w-2xl mx-auto">
          FitZone is a college web-development project designed to organize fitness and workout
          information in one simple platform. It helps users discover exercises, learn proper
          techniques, create workouts, and track their progress.
        </p>
      </div>

      {/* Purpose */}
      <section className="mb-10">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Project Purpose</h2>
        <p className="text-gray-600 leading-relaxed">
          The purpose of FitZone is to provide a clean, user-friendly platform where anyone can
          explore fitness exercises across different categories — strength training, yoga,
          warm-up, stretching, and cardio. Each exercise includes detailed instructions,
          demonstration videos, and safety tips to help users perform exercises correctly.
          The project demonstrates a full-stack web application with authentication, database
          integration, and role-based access control.
        </p>
      </section>

      {/* Features */}
      <section className="mb-10">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Main Features</h2>
        <div className="grid sm:grid-cols-2 gap-3">
          {features.map((feature, i) => (
            <div key={i} className="flex items-start gap-2 bg-white rounded-xl p-4 border border-gray-100">
              <div className="w-2 h-2 rounded-full bg-emerald-500 mt-1.5 shrink-0" />
              <span className="text-sm text-gray-600">{feature}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Technologies */}
      <section className="mb-10">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Technologies Used</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {technologies.map((tech) => {
            const Icon = tech.icon;
            return (
              <div key={tech.name} className="flex items-center gap-3 bg-white rounded-xl p-4 border border-gray-100">
                <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                  <Icon className="w-5 h-5" />
                </div>
                <span className="text-sm font-medium text-gray-700">{tech.name}</span>
              </div>
            );
          })}
        </div>
      </section>

      {/* Objectives */}
      <section className="mb-10">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Project Objectives</h2>
        <ol className="space-y-3">
          {objectives.map((obj, i) => (
            <li key={i} className="flex items-start gap-3">
              <span className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold text-sm shrink-0">
                {i + 1}
              </span>
              <span className="text-sm text-gray-600 pt-1">{obj}</span>
            </li>
          ))}
        </ol>
      </section>

      {/* CTA */}
      <div className="bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl p-8 text-center text-white">
        <h2 className="text-xl font-bold mb-2">Ready to Start?</h2>
        <p className="text-emerald-50 mb-6">Explore exercises and begin your fitness journey today.</p>
        <div className="flex flex-wrap justify-center gap-4">
          <Link
            to="/"
            className="px-6 py-3 rounded-xl bg-white text-emerald-600 font-semibold hover:bg-emerald-50 transition-colors"
          >
            Go to Home
          </Link>
          <Link
            to="/strength"
            className="px-6 py-3 rounded-xl bg-emerald-700 text-white font-semibold hover:bg-emerald-800 transition-colors border border-emerald-400"
          >
            Browse Exercises
          </Link>
        </div>
      </div>

      <p className="text-center text-sm text-gray-400 mt-8">
        Developed as a College Web Development Project
      </p>
    </div>
  );
}
