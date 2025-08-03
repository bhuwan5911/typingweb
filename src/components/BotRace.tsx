import React, { useState, useEffect, useRef, useCallback } from 'react';
import { ArrowLeft, Play, Pause, RefreshCcw } from 'lucide-react';

interface BotRaceProps {
  darkMode: boolean;
  onBack: () => void;
  soundEnabled: boolean;
  musicMode: boolean;
  playSound: (isCorrect: boolean) => void;
  playMusicalNote: (charCode: number) => void;
}

// Template-based text generation data for BotRace
const RACE_TEMPLATES = [
  {
    template: "The essence of {subject} lies in its ability to {action} complex {concepts} into a coherent framework, allowing us to {achieve} a deeper understanding of the world around us. This process is both a science and an art.",
    variables: {
      subject: ['scientific inquiry', 'artistic expression', 'philosophical debate', 'technological innovation'],
      action: ['simplify', 'visualize', 'dissect', 'synthesize'],
      concepts: ['theories', 'emotions', 'data points', 'ideas'],
      achieve: ['foster', 'attain', 'cultivate', 'promote'],
    },
  },
  {
    template: "Modern {technology} has fundamentally transformed the {industry} by enabling advanced {capability} and creating unprecedented {opportunity} for {beneficiary}. This paradigm shift requires a fresh perspective and innovative thinking to stay relevant.",
    variables: {
      technology: ['AI', 'smartphones', 'social media', 'e-commerce', 'cloud computing'],
      industry: ['healthcare', 'finance', 'retail', 'education', 'logistics', 'entertainment'],
      capability: ['faster processing', 'global connectivity', 'instant access to information', 'data analysis'],
      opportunity: ['new jobs', 'market growth', 'business expansion', 'personal development'],
      beneficiary: ['everyone', 'students', 'businesses', 'consumers', 'creators'],
    },
  },
  {
    template: "Exploring the vast {domain} of {topic} reveals a fascinating interplay of {element1} and {element2}. This dynamic relationship is crucial for understanding the overall {outcome} of the system, requiring careful observation and analysis.",
    variables: {
      domain: ['frontiers', 'intricacies', 'landscapes', 'dynamics'],
      topic: ['space exploration', 'human psychology', 'economic systems', 'ecological balance'],
      element1: ['celestial bodies', 'cognitive biases', 'market forces', 'species interactions'],
      element2: ['scientific instruments', 'social conditioning', 'regulatory policies', 'environmental factors'],
      outcome: ['discoveries', 'behavioral patterns', 'market stability', 'ecosystem health'],
    },
  },
  {
    template: "The pursuit of {goal} in {domain} is often characterized by a rigorous process of {method1} and {method2}, which are essential for overcoming inherent {challenge} and achieving the desired result.",
    variables: {
      goal: ['scientific discovery', 'technological advancement', 'sustainable growth', 'artistic mastery'],
      domain: ['biochemistry', 'software engineering', 'environmental protection', 'creative fields'],
      method1: ['iterative experimentation', 'agile development', 'resource conservation', 'consistent practice'],
      method2: ['peer review', 'continuous integration', 'policy implementation', 'innovative techniques'],
      challenge: ['unpredictable outcomes', 'technical debt', 'regulatory hurdles', 'creative blocks'],
    },
  },
  {
    template: "The art of {skill} requires {quality1} and {quality2}, leading to a sense of {outcome} that benefits both individuals and society. It is a journey of continuous improvement and self-discovery.",
    variables: {
      skill: ['cooking', 'photography', 'writing', 'music', 'programming', 'gardening'],
      quality1: ['patience', 'creativity', 'dedication', 'precision', 'passion'],
      quality2: ['practice', 'knowledge', 'perseverance', 'attention to detail', 'innovation'],
      outcome: ['mastery', 'fulfillment', 'success', 'recognition', 'personal growth'],
    }
  },
];


const BotRace: React.FC<BotRaceProps> = ({ 
  darkMode, 
  onBack, 
  soundEnabled, 
  musicMode, 
  playSound, 
  playMusicalNote 
}) => {
  const [userInput, setUserInput] = useState('');
  const [botInput, setBotInput] = useState('');
  const [gameStarted, setGameStarted] = useState(false);
  const [gameFinished, setGameFinished] = useState(false);
  const [countdown, setCountdown] = useState(3);
  const [winner, setWinner] = useState<'user' | 'bot' | null>(null);
  const [botSpeed, setBotSpeed] = useState(30); // Lowered default bot speed to 30 WPM
  const [userWpm, setUserWpm] = useState(0);
  const [startTime, setStartTime] = useState<number | null>(null);
  const [raceText, setRaceText] = useState("");
  
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const botIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const countdownIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Function to generate new text from a random template
  const generateNewRaceText = useCallback(() => {
    const randomTemplateData = RACE_TEMPLATES[Math.floor(Math.random() * RACE_TEMPLATES.length)];
    let newText = randomTemplateData.template;
    
    // Replace placeholders with random values
    Object.keys(randomTemplateData.variables).forEach(key => {
      const values = randomTemplateData.variables[key];
      const randomValue = values[Math.floor(Math.random() * values.length)];
      const placeholder = `{${key}}`;
      newText = newText.replace(new RegExp(placeholder, 'g'), randomValue);
    });

    setRaceText(newText);
  }, []);

  const startCountdown = () => {
    // Generate a new paragraph on every race start
    setCountdown(3);
    if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);
    countdownIntervalRef.current = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          clearInterval(countdownIntervalRef.current as NodeJS.Timeout);
          setGameStarted(true);
          setStartTime(Date.now());
          startBotTyping();
          textareaRef.current?.focus();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const startBotTyping = () => {
    // Average word length is 5 characters, so 1 WPM is 5 characters per minute.
    const charactersPerMinute = botSpeed * 5;
    const charactersPerSecond = charactersPerMinute / 60;
    const intervalMs = 1000 / charactersPerSecond;
    
    if (botIntervalRef.current) clearInterval(botIntervalRef.current);
    botIntervalRef.current = setInterval(() => {
      setBotInput(prev => {
        if (prev.length >= raceText.length) {
          setWinner('bot');
          setGameFinished(true);
          clearInterval(botIntervalRef.current as NodeJS.Timeout);
          return prev;
        }
        return raceText.substring(0, prev.length + 1);
      });
    }, intervalMs);
  };

  const calculateUserWpm = useCallback(() => {
    if (!startTime || userInput.length === 0) return;
    
    const words = userInput.split(' ').filter(word => word.length > 0).length;
    const timeElapsedMinutes = (Date.now() - (startTime as number)) / 60000;
    const wpm = Math.round(words / timeElapsedMinutes) || 0;
    setUserWpm(wpm);
  }, [startTime, userInput]);

  useEffect(() => {
    if (gameStarted && !gameFinished) {
      const interval = setInterval(calculateUserWpm, 100);
      return () => clearInterval(interval);
    }
  }, [gameStarted, gameFinished, calculateUserWpm]);

  // Initial text generation on component mount and on reset
  useEffect(() => {
    generateNewRaceText();
  }, [generateNewRaceText]);

  useEffect(() => {
    return () => {
      if (botIntervalRef.current) clearInterval(botIntervalRef.current);
      if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);
    };
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    if (!gameStarted || gameFinished) return;
    
    const value = e.target.value;
    
    if (value.length <= raceText.length) {
      const lastChar = value[value.length - 1];
      const expectedChar = raceText[value.length - 1];
      
      if (lastChar && expectedChar) {
        const isCorrect = lastChar === expectedChar;
        if (soundEnabled && !musicMode) playSound(isCorrect);
        if (musicMode) playMusicalNote(lastChar.charCodeAt(0));
      }

      setUserInput(value);

      if (value === raceText) {
        setWinner('user');
        setGameFinished(true);
        if (botIntervalRef.current) clearInterval(botIntervalRef.current);
      }
    }
  };

  const resetRace = () => {
    setUserInput('');
    setBotInput('');
    setGameStarted(false);
    setGameFinished(false);
    setWinner(null);
    setCountdown(3);
    setUserWpm(0);
    setStartTime(null);
    
    if (botIntervalRef.current) clearInterval(botIntervalRef.current);
    if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);
    generateNewRaceText(); // Generate a new text on reset
  };

  const userProgress = (userInput.length / raceText.length) * 100;
  const botProgress = (botInput.length / raceText.length) * 100;

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
          🤖 Bot Race Challenge
        </h2>
      </div>

      {/* Countdown */}
      {countdown > 0 && !gameStarted && (
        <div className={`backdrop-blur-lg rounded-2xl p-8 text-center shadow-2xl border ${
          darkMode 
            ? 'bg-white/10 border-white/20' 
            : 'bg-white/20 border-white/30'
        }`}>
          <div className="text-6xl font-bold text-yellow-400 mb-4">
            {countdown}
          </div>
          <p className={`text-lg ${darkMode ? 'text-white' : 'text-white'}`}>
            Get ready to race!
          </p>
        </div>
      )}

      {/* Race Progress */}
      <div className={`backdrop-blur-lg rounded-2xl p-6 shadow-2xl border ${
        darkMode 
          ? 'bg-white/10 border-white/20' 
          : 'bg-white/20 border-white/30'
      }`}>
        <div className="space-y-4">
          {/* User Progress */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <span className={`font-semibold ${darkMode ? 'text-white' : 'text-white'}`}>
                👤 You ({userWpm} WPM)
              </span>
              <span className={`text-sm ${darkMode ? 'text-gray-300' : 'text-white/80'}`}>
                {userProgress.toFixed(0)}%
              </span>
            </div>
            <div className={`w-full h-4 rounded-full overflow-hidden ${
              darkMode ? 'bg-gray-700' : 'bg-white/30'
            }`}>
              <div 
                className="h-full bg-gradient-to-r from-blue-400 to-blue-600 transition-all duration-300"
                style={{ width: `${userProgress}%` }}
              />
            </div>
          </div>

          {/* Bot Progress */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <span className={`font-semibold ${darkMode ? 'text-white' : 'text-white'}`}>
                🤖 Bot ({botSpeed} WPM)
              </span>
              <span className={`text-sm ${darkMode ? 'text-gray-300' : 'text-white/80'}`}>
                {botProgress.toFixed(0)}%
              </span>
            </div>
            <div className={`w-full h-4 rounded-full overflow-hidden ${
              darkMode ? 'bg-gray-700' : 'bg-white/30'
            }`}>
              <div 
                className="h-full bg-gradient-to-r from-red-400 to-red-600 transition-all duration-300"
                style={{ width: `${botProgress}%` }}
              />
            </div>
          </div>
        </div>

        {/* Bot Speed Selector and Change Text Button */}
        {!gameStarted && (
          <div className="mt-4 flex items-center gap-4">
            <label className={`text-sm ${darkMode ? 'text-gray-300' : 'text-white/80'}`}>
              Bot Speed:
            </label>
            <select
              value={botSpeed}
              onChange={(e) => setBotSpeed(parseInt(e.target.value))}
              className={`px-3 py-1 rounded text-sm ${
                darkMode 
                  ? 'bg-black/30 text-white border border-white/20' 
                  : 'bg-white/30 text-gray-800 border border-white/30'
              }`}
            >
              <option value={20}>Easy (20 WPM)</option>
              <option value={40}>Medium (40 WPM)</option>
              <option value={60}>Hard (60 WPM)</option>
              <option value={80}>Expert (80 WPM)</option>
            </select>
            <button
                onClick={generateNewRaceText}
                className={`px-4 py-2 rounded-lg font-semibold transition-all duration-200 hover:scale-105 ${
                    darkMode 
                    ? 'bg-gray-600 text-white hover:bg-gray-700' 
                    : 'bg-gray-400 text-gray-800 hover:bg-gray-500'
                }`}
                title="Change Text"
                >
                <RefreshCcw size={20} />
                </button>
          </div>
        )}
      </div>

      {/* Text Display */}
      <div className={`backdrop-blur-lg rounded-2xl p-6 shadow-2xl border ${
        darkMode 
          ? 'bg-white/10 border-white/20' 
          : 'bg-white/20 border-white/30'
      }`}>
        <div className={`p-4 rounded-lg mb-4 font-mono text-lg leading-relaxed ${
          darkMode 
            ? 'bg-black/20 border border-white/10' 
            : 'bg-white/30 border border-white/20'
        }`}>
          {raceText.split('').map((char, index) => {
            let className = 'transition-all duration-150 ';
            
            if (index < userInput.length) {
              if (userInput[index] === char) {
                className += 'bg-green-200 text-green-800 dark:bg-green-800 dark:text-green-200';
              } else {
                className += 'bg-red-200 text-red-800 dark:bg-red-800 dark:text-red-200';
              }
            } else if (index === userInput.length && gameStarted) {
              className += 'bg-yellow-300 dark:bg-yellow-600 animate-pulse';
            } else {
              className += darkMode ? 'text-gray-300' : 'text-gray-700';
            }

            return (
              <span key={index} className={className}>
                {char}
              </span>
            );
          })}
        </div>

        {/* Input Area */}
        <textarea
          ref={textareaRef}
          value={userInput}
          onChange={handleInputChange}
          disabled={!gameStarted || gameFinished}
          placeholder={gameStarted ? "Type the text above..." : "Click Start Race to begin!"}
          className={`w-full h-32 p-4 rounded-lg font-mono text-lg resize-none focus:outline-none focus:ring-2 transition-all duration-200 ${
            darkMode 
              ? 'bg-black/30 text-white placeholder-gray-400 border border-white/10 focus:ring-purple-400' 
              : 'bg-white/50 text-gray-800 placeholder-gray-600 border border-white/20 focus:ring-blue-400'
          }`}
        />

        {/* Controls */}
        <div className="flex justify-center gap-4 mt-4">
          {!gameStarted && !gameFinished && (
            <>
                <button
                onClick={startCountdown}
                className={`px-6 py-2 rounded-lg font-semibold transition-all duration-200 hover:scale-105 ${
                    darkMode 
                    ? 'bg-green-600 text-white hover:bg-green-700' 
                    : 'bg-green-500 text-white hover:bg-green-600'
                }`}
                >
                <Play size={20} className="inline mr-2" />
                Start Race
                </button>
            </>
          )}
          
          {(gameStarted || gameFinished) && (
            <>
              <button
                onClick={resetRace}
                className={`px-6 py-2 rounded-lg font-semibold transition-all duration-200 hover:scale-105 ${
                  darkMode 
                    ? 'bg-blue-600 text-white hover:bg-blue-700' 
                    : 'bg-blue-500 text-white hover:bg-blue-600'
                }`}
              >
                Race Again
              </button>
              <button
                onClick={generateNewRaceText}
                className={`px-4 py-2 rounded-lg font-semibold transition-all duration-200 hover:scale-105 ${
                  darkMode 
                    ? 'bg-gray-600 text-white hover:bg-gray-700' 
                    : 'bg-gray-400 text-gray-800 hover:bg-gray-500'
                }`}
                title="Change Text"
              >
                <RefreshCcw size={20} />
              </button>
            </>
          )}
        </div>
      </div>

      {/* Winner Announcement */}
      {gameFinished && winner && (
        <div className={`backdrop-blur-lg rounded-2xl p-8 text-center shadow-2xl border ${
          darkMode 
            ? 'bg-white/10 border-white/20' 
            : 'bg-white/20 border-white/30'
        }`}>
          <div className="text-6xl mb-4">
            {winner === 'user' ? '🏆' : '🤖'}
          </div>
          <h3 className={`text-2xl font-bold mb-2 ${darkMode ? 'text-white' : 'text-white'}`}>
            {winner === 'user' ? 'You Win!' : 'Bot Wins!'}
          </h3>
          <p className={`text-lg ${darkMode ? 'text-gray-300' : 'text-white/80'}`}>
            {winner === 'user' 
              ? `Congratulations! You typed at ${userWpm} WPM and beat the bot!`
              : `The bot finished first! Try again to improve your speed.`
            }
          </p>
        </div>
      )}
    </div>
  );
};

export default BotRace;
