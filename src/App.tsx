import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from '@/context/AuthContext';
import Layout from '@/components/Layout';
import { ProtectedRoute } from '@/components/ProtectedRoute';

import Home from '@/pages/Home';
import StrengthPage from '@/pages/StrengthPage';
import YogaPage from '@/pages/YogaPage';
import WarmupPage from '@/pages/WarmupPage';
import StretchingPage from '@/pages/StretchingPage';
import CardioPage from '@/pages/CardioPage';
import ExerciseDetail from '@/pages/ExerciseDetail';
import SearchPage from '@/pages/SearchPage';
import Login from '@/pages/Login';
import Register from '@/pages/Register';
import Dashboard from '@/pages/Dashboard';
import Favorites from '@/pages/Favorites';
import Progress from '@/pages/Progress';
import WorkoutPlans from '@/pages/WorkoutPlans';
import CustomWorkout from '@/pages/CustomWorkout';
import BMICalculator from '@/pages/BMICalculator';
import About from '@/pages/About';
import AdminDashboard from '@/pages/AdminDashboard';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route element={<Layout />}>
            {/* Public routes */}
            <Route path="/" element={<Home />} />
            <Route path="/strength" element={<StrengthPage />} />
            <Route path="/yoga" element={<YogaPage />} />
            <Route path="/warmup" element={<WarmupPage />} />
            <Route path="/stretching" element={<StretchingPage />} />
            <Route path="/cardio" element={<CardioPage />} />
            <Route path="/exercise/:id" element={<ExerciseDetail />} />
            <Route path="/search" element={<SearchPage />} />
            <Route path="/workout-plans" element={<WorkoutPlans />} />
            <Route path="/about" element={<About />} />
            <Route path="/bmi" element={<BMICalculator />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            {/* Protected routes */}
            <Route path="/dashboard" element={
              <ProtectedRoute><Dashboard /></ProtectedRoute>
            } />
            <Route path="/favorites" element={
              <ProtectedRoute><Favorites /></ProtectedRoute>
            } />
            <Route path="/progress" element={
              <ProtectedRoute><Progress /></ProtectedRoute>
            } />
            <Route path="/custom-workout" element={
              <ProtectedRoute><CustomWorkout /></ProtectedRoute>
            } />

            {/* Admin routes */}
            <Route path="/admin" element={
              <ProtectedRoute adminOnly><AdminDashboard /></ProtectedRoute>
            } />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
