import { useState } from 'react';
import { Calculator, Info } from 'lucide-react';

export default function BMICalculator() {
  const [height, setHeight] = useState('');
  const [weight, setWeight] = useState('');
  const [bmi, setBmi] = useState<number | null>(null);
  const [category, setCategory] = useState<string>('');

  function calculate() {
    const h = parseFloat(height) / 100; // convert cm to m
    const w = parseFloat(weight);
    if (!h || !w || h <= 0 || w <= 0) return;

    const result = w / (h * h);
    setBmi(Math.round(result * 10) / 10);

    if (result < 18.5) setCategory('Underweight');
    else if (result < 25) setCategory('Normal weight');
    else if (result < 30) setCategory('Overweight');
    else setCategory('Obese');
  }

  const categoryColors: Record<string, string> = {
    Underweight: 'bg-blue-50 text-blue-600',
    'Normal weight': 'bg-green-50 text-green-600',
    Overweight: 'bg-yellow-50 text-yellow-600',
    Obese: 'bg-red-50 text-red-600',
  };

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-emerald-50 text-emerald-600 mb-3">
          <Calculator className="w-7 h-7" />
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">BMI Calculator</h1>
        <p className="text-gray-500 mt-1">A simple tool to check your Body Mass Index</p>
      </div>

      <div className="bg-white rounded-2xl p-6 sm:p-8 border border-gray-100 mb-6">
        <div className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Height (cm)</label>
            <input
              type="number"
              value={height}
              onChange={(e) => setHeight(e.target.value)}
              placeholder="e.g. 175"
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Weight (kg)</label>
            <input
              type="number"
              value={weight}
              onChange={(e) => setWeight(e.target.value)}
              placeholder="e.g. 70"
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm"
            />
          </div>
          <button
            onClick={calculate}
            disabled={!height || !weight}
            className="w-full py-3 rounded-xl bg-emerald-600 text-white font-semibold hover:bg-emerald-700 transition-colors disabled:opacity-50"
          >
            Calculate BMI
          </button>
        </div>

        {/* Result */}
        {bmi !== null && (
          <div className="mt-6 pt-6 border-t border-gray-100">
            <div className="text-center mb-4">
              <p className="text-sm text-gray-500 mb-1">Your BMI</p>
              <p className="text-4xl font-bold text-gray-900">{bmi}</p>
              <span className={`inline-block mt-2 px-4 py-1.5 rounded-full text-sm font-medium ${categoryColors[category] || ''}`}>
                {category}
              </span>
            </div>

            {/* BMI Scale */}
            <div className="relative pt-2">
              <div className="flex h-3 rounded-full overflow-hidden">
                <div className="flex-1 bg-blue-300" />
                <div className="flex-1 bg-green-300" />
                <div className="flex-1 bg-yellow-300" />
                <div className="flex-1 bg-red-300" />
              </div>
              <div className="flex justify-between text-xs text-gray-400 mt-1">
                <span>15</span>
                <span>18.5</span>
                <span>25</span>
                <span>30</span>
                <span>40</span>
              </div>
              {/* Marker */}
              <div
                className="absolute top-0 w-1 h-5 bg-gray-800 rounded-full"
                style={{
                  left: `${Math.min(Math.max(((bmi - 15) / (40 - 15)) * 100, 0), 100)}%`,
                  transform: 'translateX(-50%)',
                }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Disclaimer */}
      <div className="bg-amber-50 rounded-xl p-4 flex items-start gap-3">
        <Info className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
        <p className="text-sm text-amber-700">
          BMI is a general screening measure and does not provide a complete picture of individual
          health. It does not account for muscle mass, bone density, or overall body composition.
          This is not a medical diagnosis. Consult a healthcare professional for personalized advice.
        </p>
      </div>
    </div>
  );
}
