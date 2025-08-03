import React from 'react';
import { X, TrendingUp, Target, Zap } from 'lucide-react';

interface CoachFeedbackProps {
  wpm: number;
  accuracy: number;
  goal: number;
  darkMode: boolean;
  onClose: () => void;
}

const CoachFeedback: React.FC<CoachFeedbackProps> = ({ wpm, accuracy, goal, darkMode, onClose }) => {
  const generateFeedback = () => {
    const messages = [];
    
    // WPM Feedback
    if (wpm >= goal) {
      messages.push({
        icon: '🎯',
        title: 'Goal Achieved!',
        message: `Excellent! You reached ${wpm} WPM, exceeding your goal of ${goal} WPM.`,
        type: 'success'
      });
    } else if (wpm >= goal * 0.8) {
      messages.push({
        icon: '📈',
        title: 'Almost There!',
        message: `You're close to your goal! Just ${goal - wpm} more WPM to reach ${goal} WPM.`,
        type: 'warning'
      });
    } else {
      messages.push({
        icon: '💪',
        title: 'Keep Practicing!',
        message: `Focus on building speed. Try to maintain a steady rhythm while typing.`,
        type: 'info'
      });
    }

    // Accuracy Feedback
    if (accuracy >= 95) {
      messages.push({
        icon: '✨',
        title: 'Perfect Accuracy!',
        message: 'Outstanding precision! Your accuracy is excellent.',
        type: 'success'
      });
    } else if (accuracy >= 85) {
      messages.push({
        icon: '👍',
        title: 'Good Accuracy',
        message: 'Nice work! Try to slow down slightly to improve accuracy further.',
        type: 'success'
      });
    } else if (accuracy >= 70) {
      messages.push({
        icon: '⚠️',
        title: 'Focus on Accuracy',
        message: 'Slow down and focus on typing correctly. Accuracy is more important than speed.',
        type: 'warning'
      });
    } else {
      messages.push({
        icon: '🎯',
        title: 'Practice Makes Perfect',
        message: 'Take your time and focus on each keystroke. Accuracy will improve with practice.',
        type: 'error'
      });
    }

    // Speed-specific tips
    if (wpm < 20) {
      messages.push({
        icon: '🔤',
        title: 'Finger Placement',
        message: 'Focus on proper finger placement on the home row keys (ASDF JKL;).',
        type: 'info'
      });
    } else if (wpm < 40) {
      messages.push({
        icon: '👀',
        title: 'Look Ahead',
        message: 'Try to read ahead while typing to maintain a steady flow.',
        type: 'info'
      });
    } else if (wpm < 60) {
      messages.push({
        icon: '🎵',
        title: 'Find Your Rhythm',
        message: 'Develop a consistent typing rhythm to increase your speed naturally.',
        type: 'info'
      });
    }

    return messages;
  };

  const feedback = generateFeedback();

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'success':
        return darkMode ? 'text-green-400 bg-green-900/20' : 'text-green-600 bg-green-100';
      case 'warning':
        return darkMode ? 'text-yellow-400 bg-yellow-900/20' : 'text-yellow-600 bg-yellow-100';
      case 'error':
        return darkMode ? 'text-red-400 bg-red-900/20' : 'text-red-600 bg-red-100';
      default:
        return darkMode ? 'text-blue-400 bg-blue-900/20' : 'text-blue-600 bg-blue-100';
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className={`max-w-2xl w-full rounded-2xl p-6 shadow-2xl ${
        darkMode ? 'bg-gray-800 text-white' : 'bg-white text-gray-800'
      }`}>
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <div className="text-2xl">🏃‍♂️</div>
            <h2 className="text-xl font-bold">Your Typing Coach</h2>
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

        {/* Performance Summary */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className={`p-4 rounded-lg text-center ${
            darkMode ? 'bg-gray-700' : 'bg-gray-50'
          }`}>
            <Zap className="mx-auto mb-2 text-blue-500" size={24} />
            <div className="text-2xl font-bold">{wpm}</div>
            <div className="text-sm opacity-70">WPM</div>
          </div>
          <div className={`p-4 rounded-lg text-center ${
            darkMode ? 'bg-gray-700' : 'bg-gray-50'
          }`}>
            <Target className="mx-auto mb-2 text-green-500" size={24} />
            <div className="text-2xl font-bold">{accuracy}%</div>
            <div className="text-sm opacity-70">Accuracy</div>
          </div>
          <div className={`p-4 rounded-lg text-center ${
            darkMode ? 'bg-gray-700' : 'bg-gray-50'
          }`}>
            <TrendingUp className="mx-auto mb-2 text-purple-500" size={24} />
            <div className="text-2xl font-bold">{goal}</div>
            <div className="text-sm opacity-70">Goal</div>
          </div>
        </div>

        {/* Feedback Messages */}
        <div className="space-y-4 mb-6">
          {feedback.map((item, index) => (
            <div
              key={index}
              className={`p-4 rounded-lg ${getTypeColor(item.type)}`}
            >
              <div className="flex items-start gap-3">
                <span className="text-2xl">{item.icon}</span>
                <div>
                  <h3 className="font-semibold mb-1">{item.title}</h3>
                  <p className="text-sm opacity-90">{item.message}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Action Button */}
        <div className="text-center">
          <button
            onClick={onClose}
            className={`px-8 py-3 rounded-lg font-semibold transition-all duration-200 hover:scale-105 ${
              darkMode 
                ? 'bg-purple-600 text-white hover:bg-purple-700' 
                : 'bg-purple-500 text-white hover:bg-purple-600'
            }`}
          >
            Continue Training
          </button>
        </div>
      </div>
    </div>
  );
};

export default CoachFeedback;