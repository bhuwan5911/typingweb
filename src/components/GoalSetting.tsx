import React from 'react';
import { Target } from 'lucide-react';

interface GoalSettingProps {
  goal: number;
  onGoalChange: (goal: number) => void;
  currentWpm: number;
  darkMode: boolean;
}

const GoalSetting: React.FC<GoalSettingProps> = ({ goal, onGoalChange, currentWpm, darkMode }) => {
  const progressPercentage = Math.min((currentWpm / goal) * 100, 100);

  return (
    <div className={`backdrop-blur-lg rounded-2xl p-6 shadow-2xl border transition-all duration-300 ${
      darkMode 
        ? 'bg-white/10 border-white/20' 
        : 'bg-white/20 border-white/30'
    }`}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Target className={darkMode ? 'text-blue-400' : 'text-blue-600'} size={24} />
          <h3 className={`text-lg font-bold ${darkMode ? 'text-white' : 'text-white'}`}>
            Typing Goal
          </h3>
        </div>
        
        <div className="flex items-center gap-2">
          <label className={`text-sm ${darkMode ? 'text-gray-300' : 'text-white/80'}`}>
            Target WPM:
          </label>
          <input
            type="number"
            value={goal}
            onChange={(e) => onGoalChange(Math.max(1, parseInt(e.target.value) || 1))}
            min="1"
            max="200"
            className={`w-16 px-2 py-1 rounded text-center text-sm ${
              darkMode 
                ? 'bg-black/30 text-white border border-white/20' 
                : 'bg-white/30 text-gray-800 border border-white/30'
            }`}
          />
        </div>
      </div>

      {/* Progress Bar */}
      <div className={`w-full h-4 rounded-full overflow-hidden ${
        darkMode ? 'bg-gray-700' : 'bg-white/30'
      }`}>
        <div 
          className={`h-full transition-all duration-500 ${
            progressPercentage >= 100 
              ? 'bg-gradient-to-r from-green-400 to-green-600' 
              : 'bg-gradient-to-r from-blue-400 to-purple-500'
          }`}
          style={{ width: `${progressPercentage}%` }}
        />
      </div>

      <div className="flex justify-between items-center mt-2">
        <span className={`text-sm ${darkMode ? 'text-gray-300' : 'text-white/80'}`}>
          Current: {currentWpm} WPM
        </span>
        <span className={`text-sm font-semibold ${
          progressPercentage >= 100 
            ? 'text-green-400' 
            : darkMode ? 'text-blue-400' : 'text-blue-200'
        }`}>
          {progressPercentage.toFixed(0)}% of goal
        </span>
      </div>

      {progressPercentage >= 100 && (
        <div className={`mt-2 text-center text-sm font-semibold ${
          darkMode ? 'text-green-400' : 'text-green-200'
        }`}>
          🎯 Goal Achieved! Great job!
        </div>
      )}
    </div>
  );
};

export default GoalSetting;