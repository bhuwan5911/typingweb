import React from 'react';
import { X, Clock, CheckCircle, XCircle } from 'lucide-react';

interface WordStats {
  word: string;
  correct: boolean;
  timeSpent: number;
  startTime: number;
}

interface WordAnalysisProps {
  wordStats: WordStats[];
  darkMode: boolean;
  onClose: () => void;
}

const WordAnalysis: React.FC<WordAnalysisProps> = ({ wordStats, darkMode, onClose }) => {
  const averageTime = wordStats.length > 0 
    ? wordStats.reduce((sum, stat) => sum + stat.timeSpent, 0) / wordStats.length 
    : 0;
  
  const correctWords = wordStats.filter(stat => stat.correct).length;
  const incorrectWords = wordStats.filter(stat => !stat.correct);
  
  const slowestWords = [...wordStats]
    .sort((a, b) => b.timeSpent - a.timeSpent)
    .slice(0, 5);

  const formatTime = (ms: number) => {
    return (ms / 1000).toFixed(1) + 's';
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className={`max-w-4xl w-full max-h-[90vh] overflow-y-auto rounded-2xl p-6 shadow-2xl ${
        darkMode ? 'bg-gray-800 text-white' : 'bg-white text-gray-800'
      }`}>
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <div className="text-2xl">📊</div>
            <h2 className="text-xl font-bold">Word-by-Word Analysis</h2>
          </div>
          <button
            onClick={onClose}
            className={`p-2 rounded-lg transition-all duration-200 hover:scale-105 ${
              darkMode 
                ? 'bg-gray-700 text-white hover:bg-gray-600' 
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            <X size={20} />
          </button>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className={`p-4 rounded-lg text-center ${
            darkMode ? 'bg-gray-700' : 'bg-gray-50'
          }`}>
            <div className="text-2xl font-bold text-green-500">{correctWords}</div>
            <div className="text-sm opacity-70">Correct Words</div>
          </div>
          <div className={`p-4 rounded-lg text-center ${
            darkMode ? 'bg-gray-700' : 'bg-gray-50'
          }`}>
            <div className="text-2xl font-bold text-red-500">{incorrectWords.length}</div>
            <div className="text-sm opacity-70">Incorrect Words</div>
          </div>
          <div className={`p-4 rounded-lg text-center ${
            darkMode ? 'bg-gray-700' : 'bg-gray-50'
          }`}>
            <div className="text-2xl font-bold text-blue-500">{formatTime(averageTime)}</div>
            <div className="text-sm opacity-70">Avg Time/Word</div>
          </div>
          <div className={`p-4 rounded-lg text-center ${
            darkMode ? 'bg-gray-700' : 'bg-gray-50'
          }`}>
            <div className="text-2xl font-bold text-purple-500">
              {((correctWords / wordStats.length) * 100).toFixed(0)}%
            </div>
            <div className="text-sm opacity-70">Word Accuracy</div>
          </div>
        </div>

        {/* Incorrect Words Section */}
        {incorrectWords.length > 0 && (
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
              <XCircle className="text-red-500" size={20} />
              Words to Practice
            </h3>
            <div className={`p-4 rounded-lg ${
              darkMode ? 'bg-red-900/20 border border-red-800' : 'bg-red-50 border border-red-200'
            }`}>
              <div className="flex flex-wrap gap-2">
                {incorrectWords.map((stat, index) => (
                  <span
                    key={index}
                    className={`px-3 py-1 rounded-full text-sm font-medium ${
                      darkMode 
                        ? 'bg-red-800 text-red-200' 
                        : 'bg-red-200 text-red-800'
                    }`}
                  >
                    {stat.word} ({formatTime(stat.timeSpent)})
                  </span>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Slowest Words Section */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
            <Clock className="text-orange-500" size={20} />
            Slowest Words
          </h3>
          <div className={`p-4 rounded-lg ${
            darkMode ? 'bg-orange-900/20 border border-orange-800' : 'bg-orange-50 border border-orange-200'
          }`}>
            <div className="space-y-2">
              {slowestWords.map((stat, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between"
                >
                  <div className="flex items-center gap-2">
                    <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                      darkMode ? 'bg-orange-800 text-orange-200' : 'bg-orange-200 text-orange-800'
                    }`}>
                      {index + 1}
                    </span>
                    <span className="font-medium">{stat.word}</span>
                    {stat.correct ? (
                      <CheckCircle className="text-green-500" size={16} />
                    ) : (
                      <XCircle className="text-red-500" size={16} />
                    )}
                  </div>
                  <span className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                    {formatTime(stat.timeSpent)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* All Words Table */}
        <div>
          <h3 className="text-lg font-semibold mb-3">Complete Word Breakdown</h3>
          <div className={`rounded-lg overflow-hidden ${
            darkMode ? 'bg-gray-700' : 'bg-gray-50'
          }`}>
            <div className="max-h-64 overflow-y-auto">
              <table className="w-full">
                <thead className={`sticky top-0 ${
                  darkMode ? 'bg-gray-600' : 'bg-gray-200'
                }`}>
                  <tr>
                    <th className="text-left p-3 font-semibold">#</th>
                    <th className="text-left p-3 font-semibold">Word</th>
                    <th className="text-left p-3 font-semibold">Status</th>
                    <th className="text-left p-3 font-semibold">Time</th>
                  </tr>
                </thead>
                <tbody>
                  {wordStats.map((stat, index) => (
                    <tr
                      key={index}
                      className={`border-t ${
                        darkMode ? 'border-gray-600' : 'border-gray-200'
                      } ${
                        !stat.correct 
                          ? darkMode 
                            ? 'bg-red-900/10' 
                            : 'bg-red-50'
                          : ''
                      }`}
                    >
                      <td className="p-3 text-sm">{index + 1}</td>
                      <td className="p-3 font-medium">{stat.word}</td>
                      <td className="p-3">
                        {stat.correct ? (
                          <div className="flex items-center gap-1 text-green-500">
                            <CheckCircle size={16} />
                            <span className="text-sm">Correct</span>
                          </div>
                        ) : (
                          <div className="flex items-center gap-1 text-red-500">
                            <XCircle size={16} />
                            <span className="text-sm">Incorrect</span>
                          </div>
                        )}
                      </td>
                      <td className="p-3 text-sm">{formatTime(stat.timeSpent)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Close Button */}
        <div className="text-center mt-6">
          <button
            onClick={onClose}
            className={`px-8 py-3 rounded-lg font-semibold transition-all duration-200 hover:scale-105 ${
              darkMode 
                ? 'bg-blue-600 text-white hover:bg-blue-700' 
                : 'bg-blue-500 text-white hover:bg-blue-600'
            }`}
          >
            Close Analysis
          </button>
        </div>
      </div>
    </div>
  );
};

export default WordAnalysis;