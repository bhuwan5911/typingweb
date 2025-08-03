import React, { useState, useEffect, useRef, useCallback } from 'react';
import { ArrowLeft, Eye, EyeOff } from 'lucide-react';

interface MemoryChallengeProps {
  darkMode: boolean;
  onBack: () => void;
  soundEnabled: boolean;
  musicMode: boolean;
  playSound: (isCorrect: boolean) => void;
  playMusicalNote: (charCode: number) => void;
}

// Template-based sentences for Memory Challenge to provide unlimited unique texts.
const MEMORY_TEMPLATES = [
  {
    template: "The essence of {subject} lies in its ability to {action} complex {concepts} into a coherent framework.",
    variables: {
      subject: ['scientific inquiry', 'artistic expression', 'philosophical debate', 'technological innovation'],
      action: ['simplify', 'visualize', 'dissect', 'synthesize'],
      concepts: ['theories', 'emotions', 'data points', 'ideas'],
    }
  },
  {
    template: "Modern {technology} has transformed {industry} by enabling {capability} for {beneficiary}.",
    variables: {
      technology: ['AI', 'smartphones', 'social media', 'e-commerce'],
      industry: ['healthcare', 'finance', 'retail', 'education'],
      capability: ['faster processing', 'global connectivity', 'instant access to information'],
      beneficiary: ['everyone', 'students', 'businesses', 'consumers'],
    }
  },
  {
    template: "Exploring the vast {domain} of {topic} reveals a fascinating interplay of {element1} and {element2}.",
    variables: {
      domain: ['frontiers', 'intricacies', 'landscapes', 'dynamics'],
      topic: ['space exploration', 'human psychology', 'economic systems', 'ecological balance'],
      element1: ['celestial bodies', 'cognitive biases', 'market forces', 'species interactions'],
      element2: ['scientific instruments', 'social conditioning', 'regulatory policies', 'environmental factors'],
    }
  },
  {
    template: "The pursuit of {goal} is often characterized by a rigorous process of {method1} and {method2}.",
    variables: {
      goal: ['scientific discovery', 'technological advancement', 'sustainable growth', 'artistic mastery'],
      method1: ['iterative experimentation', 'agile development', 'resource conservation', 'consistent practice'],
      method2: ['peer review', 'continuous integration', 'policy implementation', 'innovative techniques'],
    }
  },
  {
    template: "The art of {skill} requires {quality1} and {quality2} for achieving {outcome}.",
    variables: {
      skill: ['cooking', 'photography', 'writing', 'music', 'programming', 'gardening'],
      quality1: ['patience', 'creativity', 'dedication', 'precision', 'passion'],
      quality2: ['practice', 'knowledge', 'perseverance', 'attention to detail'],
      outcome: ['mastery', 'fulfillment', 'success', 'personal growth'],
    }
  }
];

const MemoryChallenge: React.FC<MemoryChallengeProps> = ({ 
  darkMode, 
  onBack, 
  soundEnabled, 
  musicMode, 
  playSound, 
  playMusicalNote 
}) => {
  const [currentText, setCurrentText] = useState('');
  const [userInput, setUserInput] = useState('');
  const [showText, setShowText] = useState(false);
  const [countdown, setCountdown] = useState(5);
  const [gamePhase, setGamePhase] = useState<'ready' | 'memorize' | 'type' | 'result'>('ready');
  const [accuracy, setAccuracy] = useState(0);
  const [startTime, setStartTime] = useState<number | null>(null);
  const [completionTime, setCompletionTime] = useState(0);
  
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const countdownRef = useRef<NodeJS.Timeout | null>(null);

  const generateMemoryText = useCallback(() => {
    const randomTemplateData = MEMORY_TEMPLATES[Math.floor(Math.random() * MEMORY_TEMPLATES.length)];
    let newText = randomTemplateData.template;
    
    Object.keys(randomTemplateData.variables).forEach(key => {
      const values = randomTemplateData.variables[key];
      const randomValue = values[Math.floor(Math.random() * values.length)];
      const placeholder = `{${key}}`;
      newText = newText.replace(new RegExp(placeholder, 'g'), randomValue);
    });

    return newText;
  }, []);

  const startNewChallenge = () => {
    // Reset all state to a clean slate
    setCurrentText('');
    setUserInput('');
    setShowText(false);
    setCountdown(5);
    setGamePhase('memorize');
    setAccuracy(0);
    setStartTime(null);
    setCompletionTime(0);

    // Pick a new random text
    const newText = generateMemoryText();
    setCurrentText(newText);
    setShowText(true);

    if (countdownRef.current) {
        clearInterval(countdownRef.current);
    }
    
    // Start countdown
    countdownRef.current = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          clearInterval(countdownRef.current as NodeJS.Timeout);
          setShowText(false);
          setGamePhase('type');
          setStartTime(Date.now());
          setTimeout(() => textareaRef.current?.focus(), 100);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const calculateAccuracy = () => {
    if (userInput.length === 0) return 0;
    
    let correctChars = 0;
    const minLength = Math.min(userInput.length, currentText.length);
    
    for (let i = 0; i < minLength; i++) {
      if (userInput[i] === currentText[i]) {
        correctChars++;
      }
    }
    
    return Math.round((correctChars / currentText.length) * 100);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    if (gamePhase !== 'type') return;
    
    const value = e.target.value;
    
    if (value.length <= currentText.length) {
      const lastChar = value[value.length - 1];
      const expectedChar = currentText[value.length - 1];
      
      if (lastChar && expectedChar) {
        const isCorrect = lastChar === expectedChar;
        if (soundEnabled && !musicMode) playSound(isCorrect);
        if (musicMode) playMusicalNote(lastChar.charCodeAt(0));
      }

      setUserInput(value);

      if (value === currentText) {
        const endTime = Date.now();
        setCompletionTime(startTime ? Math.round((endTime - startTime) / 1000) : 0);
        setAccuracy(100);
        setGamePhase('result');
      }
    }
  };

  const handleSubmit = () => {
    if (gamePhase === 'type') {
      const endTime = Date.now();
      setCompletionTime(startTime ? Math.round((endTime - startTime) / 1000) : 0);
      setAccuracy(calculateAccuracy());
      setGamePhase('result');
    }
  };

  const resetToReady = () => {
    setCurrentText('');
    setUserInput('');
    setShowText(false);
    setCountdown(5);
    setGamePhase('ready');
    setAccuracy(0);
    setStartTime(null);
    setCompletionTime(0);
    
    if (countdownRef.current) {
      clearInterval(countdownRef.current);
    }
  };
  
  const handleTryAgain = () => {
    // Keep the same text, but reset the user input and go back to typing phase
    setUserInput('');
    setGamePhase('type');
    setStartTime(Date.now());
    setCompletionTime(0);
    setTimeout(() => textareaRef.current?.focus(), 100);
  }
  
  useEffect(() => {
    // This effect now correctly manages the cleanup of the countdown interval.
    return () => {
      if (countdownRef.current) {
        clearInterval(countdownRef.current);
      }
    };
  }, []);

  const renderTextWithHighlight = () => {
    return currentText.split('').map((char, index) => {
      let className = 'transition-all duration-150 ';
      
      if (index < userInput.length) {
        if (userInput[index] === char) {
          className += 'bg-green-200 text-green-800 dark:bg-green-800 dark:text-green-200';
        } else {
          className += 'bg-red-200 text-red-800 dark:bg-red-800 dark:text-red-200';
        }
      } else if (index === userInput.length && gamePhase === 'type') {
        className += 'bg-yellow-300 dark:bg-yellow-600 animate-pulse';
      } else {
        className += darkMode ? 'text-gray-300' : 'text-gray-700';
      }

      return (
        <span key={index} className={className}>
          {char}
        </span>
      );
    });
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button
          onClick={onBack}
          className={`p-2 rounded-lg transition-all duration-200 hover:scale-105 ${
            darkMode 
              ? 'bg-white/10 text-white hover:bg-white/20' 
              : 'bg-white/20 text-white hover:bg-white/30'
          }`}
        >
          <ArrowLeft size={20} />
        </button>
        <h2 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-white'}`}>
          🧠 Memory Challenge
        </h2>
      </div>

      {/* Instructions */}
      {gamePhase === 'ready' && (
        <div className={`backdrop-blur-lg rounded-2xl p-8 text-center shadow-2xl border ${
          darkMode 
            ? 'bg-white/10 border-white/20' 
            : 'bg-white/20 border-white/30'
        }`}>
          <div className="text-4xl mb-4">🧠</div>
          <h3 className={`text-xl font-bold mb-4 ${darkMode ? 'text-white' : 'text-white'}`}>
            Memory Challenge Rules
          </h3>
          <div className={`text-left max-w-md mx-auto space-y-2 mb-6 ${
            darkMode ? 'text-gray-300' : 'text-white/80'
          }`}>
            <p>• A sentence will be shown for 5 seconds</p>
            <p>• Memorize it carefully</p>
            <p>• Type it from memory when the text disappears</p>
            <p>• Accuracy is more important than speed</p>
          </div>
          <button
            onClick={startNewChallenge}
            className={`px-8 py-3 rounded-lg font-semibold transition-all duration-200 hover:scale-105 ${
              darkMode 
                ? 'bg-purple-600 text-white hover:bg-purple-700' 
                : 'bg-purple-500 text-white hover:bg-purple-600'
            }`}
          >
            Start Challenge
          </button>
        </div>
      )}

      {/* Memorization Phase */}
      {gamePhase === 'memorize' && (
        <div className={`backdrop-blur-lg rounded-2xl p-8 shadow-2xl border ${
          darkMode 
            ? 'bg-white/10 border-white/20' 
            : 'bg-white/20 border-white/30'
        }`}>
          <div className="text-center mb-6">
            <div className="text-4xl font-bold text-yellow-400 mb-2">
              {countdown}
            </div>
            <p className={`text-lg ${darkMode ? 'text-white' : 'text-white'}`}>
              Memorize this text!
            </p>
          </div>
          
          <div className={`p-6 rounded-lg font-mono text-xl leading-relaxed text-center ${
            darkMode 
              ? 'bg-black/20 border border-white/10 text-white' 
              : 'bg-white/30 border border-white/20 text-gray-800'
          }`}>
            {currentText}
          </div>
        </div>
      )}

      {/* Typing Phase */}
      {gamePhase === 'type' && (
        <div className={`backdrop-blur-lg rounded-2xl p-8 shadow-2xl border ${
          darkMode 
            ? 'bg-white/10 border-white/20' 
            : 'bg-white/20 border-white/30'
        }`}>
          <div className="text-center mb-6">
            <div className="flex items-center justify-center gap-2 mb-2">
              <EyeOff className={darkMode ? 'text-orange-400' : 'text-orange-600'} size={24} />
              <p className={`text-lg font-semibold ${darkMode ? 'text-white' : 'text-white'}`}>
                Type from memory!
              </p>
            </div>
            <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-white/80'}`}>
              The text is now hidden. Type what you remember.
            </p>
          </div>

          <textarea
            ref={textareaRef}
            value={userInput}
            onChange={handleInputChange}
            placeholder="Type the sentence you memorized..."
            className={`w-full h-32 p-4 rounded-lg font-mono text-lg resize-none focus:outline-none focus:ring-2 transition-all duration-200 mb-4 ${
              darkMode 
                ? 'bg-black/30 text-white placeholder-gray-400 border border-white/10 focus:ring-purple-400' 
                : 'bg-white/50 text-gray-800 placeholder-gray-600 border border-white/20 focus:ring-blue-400'
            }`}
          />

          <div className="flex justify-center gap-4">
            <button
              onClick={handleSubmit}
              className={`px-6 py-2 rounded-lg font-semibold transition-all duration-200 hover:scale-105 ${
                darkMode 
                  ? 'bg-green-600 text-white hover:bg-green-700' 
                  : 'bg-green-500 text-white hover:bg-green-600'
              }`}
            >
              Submit Answer
            </button>
            
            <button
              onClick={resetToReady}
              className={`px-6 py-2 rounded-lg font-semibold transition-all duration-200 hover:scale-105 ${
                darkMode 
                  ? 'bg-gray-600 text-white hover:bg-gray-700' 
                  : 'bg-gray-500 text-white hover:bg-gray-600'
              }`}
            >
              Give Up
            </button>
          </div>
        </div>
      )}

      {/* Results Phase */}
      {gamePhase === 'result' && (
        <div className={`backdrop-blur-lg rounded-2xl p-8 shadow-2xl border ${
          darkMode 
            ? 'bg-white/10 border-white/20' 
            : 'bg-white/20 border-white/30'
        }`}>
          <div className="text-center mb-6">
            <div className="text-4xl mb-4">
              {accuracy >= 90 ? '🏆' : accuracy >= 70 ? '🥈' : accuracy >= 50 ? '🥉' : '📝'}
            </div>
            <h3 className={`text-2xl font-bold mb-2 ${darkMode ? 'text-white' : 'text-white'}`}>
              Challenge Complete!
            </h3>
            <div className="grid grid-cols-2 gap-4 max-w-md mx-auto mb-6">
              <div className={`p-4 rounded-lg ${
                darkMode ? 'bg-black/20' : 'bg-white/30'
              }`}>
                <div className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-white'}`}>
                  {accuracy}%
                </div>
                <div className={`text-sm ${darkMode ? 'text-gray-300' : 'text-white/80'}`}>
                  Accuracy
                </div>
              </div>
              <div className={`p-4 rounded-lg ${
                darkMode ? 'bg-black/20' : 'bg-white/30'
              }`}>
                <div className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-white'}`}>
                  {completionTime}s
                </div>
                <div className={`text-sm ${darkMode ? 'text-gray-300' : 'text-white/80'}`}>
                  Time
                </div>
              </div>
            </div>
          </div>

          {/* Show comparison */}
          <div className="space-y-4 mb-6">
            <div>
              <h4 className={`font-semibold mb-2 ${darkMode ? 'text-white' : 'text-white'}`}>
                Original Text:
              </h4>
              <div className={`p-4 rounded-lg font-mono text-lg ${
                darkMode 
                  ? 'bg-black/20 border border-white/10 text-white' 
                  : 'bg-white/30 border border-white/20 text-gray-800'
              }`}>
                {renderTextWithHighlight()}
              </div>
            </div>
            
            <div>
              <h4 className={`font-semibold mb-2 ${darkMode ? 'text-white' : 'text-white'}`}>
                Your Answer:
              </h4>
              <div className={`p-4 rounded-lg font-mono text-lg ${
                darkMode 
                  ? 'bg-black/20 border border-white/10 text-white' 
                  : 'bg-white/30 border border-white/20 text-gray-800'
              }`}>
                {userInput || '(empty)'}
              </div>
            </div>
          </div>

          <div className="flex justify-center gap-4">
            <button
              onClick={handleTryAgain}
              className={`px-6 py-2 rounded-lg font-semibold transition-all duration-200 hover:scale-105 ${
                darkMode 
                  ? 'bg-purple-600 text-white hover:bg-purple-700' 
                  : 'bg-purple-500 text-white hover:bg-purple-600'
              }`}
            >
              Try Again
            </button>
            
            <button
              onClick={startNewChallenge}
              className={`px-6 py-2 rounded-lg font-semibold transition-all duration-200 hover:scale-105 ${
                darkMode 
                  ? 'bg-blue-600 text-white hover:bg-blue-700' 
                  : 'bg-blue-500 text-white hover:bg-blue-600'
              }`}
            >
              New Challenge
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default MemoryChallenge;
