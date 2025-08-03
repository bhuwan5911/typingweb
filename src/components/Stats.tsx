import React from 'react';

interface StatsProps {
  timeElapsed: number;
  wpm: number;
  accuracy: number;
  emoji: string;
  darkMode: boolean;
}

const Stats: React.FC<StatsProps> = ({ timeElapsed, wpm, accuracy, emoji, darkMode }) => {
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {/* Timer */}
      <div className={`backdrop-blur-lg rounded-xl p-4 text-center shadow-lg border transition-all duration-300 ${
        darkMode 
          ? 'bg-white/10 border-white/20' 
          : 'bg-white/20 border-white/30'
      }`}>
        <div className="text-2xl mb-1">⏱️</div>
        <div className={`text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-white/80'}`}>
          Timer
        </div>
        <div className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-white'}`}>
          {formatTime(timeElapsed)}
        </div>
      </div>

      {/* WPM */}
      <div className={`backdrop-blur-lg rounded-xl p-4 text-center shadow-lg border transition-all duration-300 ${
        darkMode 
          ? 'bg-white/10 border-white/20' 
          : 'bg-white/20 border-white/30'
      }`}>
        <div className="text-2xl mb-1">⚡</div>
        <div className={`text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-white/80'}`}>
          WPM
        </div>
        <div className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-white'}`}>
          {wpm}
        </div>
      </div>

      {/* Accuracy */}
      <div className={`backdrop-blur-lg rounded-xl p-4 text-center shadow-lg border transition-all duration-300 ${
        darkMode 
          ? 'bg-white/10 border-white/20' 
          : 'bg-white/20 border-white/30'
      }`}>
        <div className="text-2xl mb-1">✅</div>
        <div className={`text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-white/80'}`}>
          Accuracy
        </div>
        <div className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-white'}`}>
          {accuracy}%
        </div>
      </div>

      {/* Emoji Reaction */}
      <div className={`backdrop-blur-lg rounded-xl p-4 text-center shadow-lg border transition-all duration-300 ${
        darkMode 
          ? 'bg-white/10 border-white/20' 
          : 'bg-white/20 border-white/30'
      }`}>
        <div className="text-3xl mb-1 transition-all duration-300 transform hover:scale-110">
          {emoji}
        </div>
        <div className={`text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-white/80'}`}>
          Reaction
        </div>
        <div className={`text-sm font-bold ${darkMode ? 'text-white' : 'text-white'}`}>
          {wpm > 60 ? 'Blazing!' : wpm >= 30 ? 'Good!' : wpm > 0 ? 'Keep going!' : 'Start typing!'}
        </div>
      </div>
    </div>
  );
};

export default Stats;