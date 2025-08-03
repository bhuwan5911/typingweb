import React, { useState, useEffect } from 'react';
import { Trophy, Trash2 } from 'lucide-react';

interface Score {
  wpm: number;
  accuracy: number;
  date: string;
}

interface ScoreboardProps {
  darkMode: boolean;
}

const Scoreboard: React.FC<ScoreboardProps> = ({ darkMode }) => {
  const [scores, setScores] = useState<Score[]>([]);

  useEffect(() => {
    const loadScores = () => {
      try {
        const savedScores = localStorage.getItem('typingScores');
        if (savedScores) {
          setScores(JSON.parse(savedScores));
        }
      } catch (error) {
        console.error('Error loading scores:', error);
      }
    };

    loadScores();
    
    // Listen for storage changes
    const handleStorageChange = () => {
      loadScores();
    };

    window.addEventListener('storage', handleStorageChange);
    
    // Custom event for same-tab updates
    window.addEventListener('scoresUpdated', handleStorageChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('scoresUpdated', handleStorageChange);
    };
  }, []);

  const clearHistory = () => {
    localStorage.removeItem('typingScores');
    setScores([]);
    // Dispatch custom event for same-tab updates
    window.dispatchEvent(new Event('scoresUpdated'));
  };

  const getRankEmoji = (index: number) => {
    switch (index) {
      case 0: return '🥇';
      case 1: return '🥈';
      case 2: return '🥉';
      default: return '🏅';
    }
  };

  if (scores.length === 0) {
    return (
      <div className={`backdrop-blur-lg rounded-2xl p-6 shadow-2xl border transition-all duration-300 ${
        darkMode 
          ? 'bg-white/10 border-white/20' 
          : 'bg-white/20 border-white/30'
      }`}>
        <div className="flex items-center justify-center gap-2 mb-4">
          <Trophy className={darkMode ? 'text-yellow-400' : 'text-yellow-600'} size={24} />
          <h2 className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-white'}`}>
            Top 5 Scores
          </h2>
        </div>
        <p className={`text-center ${darkMode ? 'text-gray-300' : 'text-white/80'}`}>
          No scores yet. Complete a typing test to see your results here!
        </p>
      </div>
    );
  }

  return (
    <div className={`backdrop-blur-lg rounded-2xl p-6 shadow-2xl border transition-all duration-300 ${
      darkMode 
        ? 'bg-white/10 border-white/20' 
        : 'bg-white/20 border-white/30'
    }`}>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Trophy className={darkMode ? 'text-yellow-400' : 'text-yellow-600'} size={24} />
          <h2 className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-white'}`}>
            Top 5 Scores
          </h2>
        </div>
        
        <button
          onClick={clearHistory}
          className={`p-2 rounded-lg transition-all duration-200 hover:scale-105 ${
            darkMode 
              ? 'bg-red-900/30 text-red-400 hover:bg-red-900/50' 
              : 'bg-red-500/20 text-red-100 hover:bg-red-500/30'
          }`}
          title="Clear History"
        >
          <Trash2 size={16} />
        </button>
      </div>

      <div className="space-y-3">
        {scores.map((score, index) => (
          <div
            key={index}
            className={`flex items-center justify-between p-4 rounded-lg transition-all duration-200 hover:scale-[1.02] ${
              darkMode 
                ? 'bg-white/5 border border-white/10' 
                : 'bg-white/10 border border-white/20'
            }`}
          >
            <div className="flex items-center gap-3">
              <span className="text-2xl">{getRankEmoji(index)}</span>
              <div>
                <div className={`font-bold ${darkMode ? 'text-white' : 'text-white'}`}>
                  {score.wpm} WPM
                </div>
                <div className={`text-sm ${darkMode ? 'text-gray-300' : 'text-white/80'}`}>
                  {score.accuracy}% accuracy
                </div>
              </div>
            </div>
            
            <div className={`text-right text-sm ${darkMode ? 'text-gray-400' : 'text-white/70'}`}>
              {new Date(score.date).toLocaleDateString()}
              <br />
              {new Date(score.date).toLocaleTimeString([], { 
                hour: '2-digit', 
                minute: '2-digit' 
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Scoreboard;