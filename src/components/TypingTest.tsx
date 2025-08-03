import React, { useState, useEffect, useCallback, useRef } from 'react';
import Stats from './Stats';
import Scoreboard from './Scoreboard';
import TypingChart from './TypingChart';
import GoalSetting from './GoalSetting';
import GameModeSelector from './GameModeSelector';
import BotRace from './BotRace';
import MemoryChallenge from './MemoryChallenge';
import CoachFeedback from './CoachFeedback';
import WordAnalysis from './WordAnalysis';
import MultiplayerRace from './MultiplayerRace';
import { Volume2, VolumeX, RotateCcw, Music, Eye, EyeOff, RefreshCw, Layers, Zap, Flame } from 'lucide-react';

// Type definitions
interface Score {
  wpm: number;
  accuracy: number;
  date: string;
}

interface WordStats {
  word: string;
  correct: boolean;
  timeSpent: number;
  startTime: number;
}

type GameMode = 'normal' | 'bot-race' | 'memory' | 'multiplayer';
type Difficulty = 'easy' | 'medium' | 'hard';

interface TypingTestProps {
  darkMode: boolean;
  initialWpmGoal: number;
}

// Template-based text generation data
const TEXT_TEMPLATES = {
  easy: [
    {
      template: "The quick brown fox jumps over the lazy dog. This pangram contains every letter of the alphabet and is commonly used for typing practice. It helps improve both speed and accuracy while maintaining proper finger placement on the keyboard.",
      variables: {}
    },
    {
      template: "The sun is bright in the blue sky. A gentle wind blows through the green trees. It is a nice day for a walk in the park. Children play games and laugh. Life is full of simple joys.",
      variables: {}
    },
    {
      template: "She went to the market to buy some fresh apples and oranges. The store was busy with many people. She found what she needed quickly and paid with her credit card. It was a good trip.",
      variables: {}
    },
    {
      template: "My friend and I like to play video games in the evening. We talk on the phone and play together. It is a fun way to spend our free time. We try to win each game we play.",
      variables: {}
    },
    {
      template: "Reading a book can transport you to different worlds. It is a fun and easy way to learn new things. We can find many stories in books, from simple fables to complex adventures. Find a good book and start reading today.",
      variables: {}
    },
    {
      template: "The cat sat on the mat. The little dog ran in the yard. They played a game of chase. The cat was fast, but the dog was faster. In the end, they both took a nap in the sun.",
      variables: {}
    },
    {
      template: "The school bell rang loudly, signaling the end of the day. Students gathered their books and hurried out the door. The promise of the afternoon filled the air with excitement and energy.",
      variables: {}
    },
    {
      template: "A small bird landed on the window sill. It sang a short and sweet song. The sound was very pleasant. I watched it for a little while before it flew away. It was a peaceful moment.",
      variables: {}
    },
    {
      template: "I like to drink a glass of cold water after I exercise. It feels good and helps me stay hydrated. It is important to drink water throughout the whole day, not just when you are thirsty.",
      variables: {}
    },
    {
      template: "The car drove down the long, winding road. The trees on either side were tall and full of leaves. We were on our way to visit family. The trip was fun and full of beautiful sights.",
      variables: {}
    }
  ],
  medium: [
    {
      template: "Throughout history, {subject} has influenced {area} in ways that continue to {impact} our modern world. These changes, while sometimes subtle, have profoundly shaped the course of human development and technological progress. This evolution is constant.",
      variables: {
        subject: ['science', 'art', 'literature', 'philosophy', 'technology', 'communication', 'politics', 'economics'],
        area: ['education', 'culture', 'society', 'innovation', 'global trade', 'personal relationships', 'public health'],
        impact: ['shape', 'transform', 'influence', 'improve', 'revolutionize', 'accelerate', 'challenge'],
      }
    },
    {
      template: "The relationship between {element1} and {element2} demonstrates how {principle} affects {result} in {field}. Understanding this connection is essential for solving complex problems and developing new theories.",
      variables: {
        element1: ['gravity', 'photosynthesis', 'ecosystems', 'supply and demand', 'neural networks', 'geopolitical tensions'],
        element2: ['planetary orbits', 'plant growth', 'biodiversity', 'market equilibrium', 'cognitive functions', 'international relations'],
        principle: ['Newtonian physics', 'biological cycles', 'natural selection', 'economic theory', 'computational modeling', 'diplomatic strategy'],
        result: ['predictable motion', 'sustainable agriculture', 'species adaptation', 'price stability', 'learning algorithms', 'global cooperation'],
        field: ['astronomy', 'biology', 'environmental science', 'microeconomics', 'psychology', 'political science'],
      }
    },
    {
      template: "Learning about {topic} helps us understand {concept} while developing {ability} that serves us well in {context}. Lifelong learning ensures we remain curious, adaptable, and capable of facing future challenges with confidence.",
      variables: {
        topic: ['history', 'psychology', 'economics', 'astronomy', 'political science', 'sociology', 'anthropology'],
        concept: ['human behavior', 'market trends', 'celestial mechanics', 'societal shifts', 'geopolitical strategy', 'cultural evolution'],
        ability: ['critical thinking', 'problem solving', 'communication', 'analysis', 'creativity', 'adaptability'],
        context: ['daily life', 'professional settings', 'academic pursuits', 'personal relationships', 'community involvement'],
      }
    },
    {
      template: "Modern {technology} has transformed the {industry} by enabling advanced {capability} and creating unprecedented {opportunity} for {beneficiary}. This paradigm shift requires a fresh perspective and innovative thinking.",
      variables: {
        technology: ['AI', 'smartphones', 'social media', 'e-commerce', 'cloud computing'],
        industry: ['healthcare', 'finance', 'retail', 'education', 'logistics', 'entertainment'],
        capability: ['faster processing', 'global connectivity', 'instant access to information', 'data analysis', 'real-time communication'],
        opportunity: ['new jobs', 'market growth', 'business expansion', 'personal development', 'creative expression'],
        beneficiary: ['everyone', 'students', 'businesses', 'consumers', 'creators'],
      }
    },
    {
      template: "The process of {action} involves a series of complex and interconnected {step1}, {step2}, and {step3}. Mastering this sequence is crucial for achieving a high-quality {outcome} and ensuring success in any endeavor.",
      variables: {
        action: ['developing a software application', 'building a website', 'planning a major event', 'conducting a scientific experiment'],
        step1: ['conceptualization and design', 'initial research and wireframing', 'logistical planning', 'hypothesis formation'],
        step2: ['iterative coding and testing', 'front-end development', 'securing vendors and locations', 'data collection'],
        step3: ['deployment and maintenance', 'back-end integration', 'day-of execution and management', 'analysis and conclusion'],
        outcome: ['functional software', 'polished website', 'memorable event', 'verified result'],
      }
    }
  ],
  hard: [
    {
      template: "The proliferation of {technology} has fundamentally transformed the {industry} by enabling advanced {capability} and creating unprecedented {opportunity} for {beneficiary}. This paradigm shift requires a recalibration of established methodologies.",
      variables: {
        technology: ['nanotechnology', 'quantum computing', 'cybernetics', 'decentralized ledgers', 'biometrics'],
        industry: ['biotechnology', 'financial services', 'telecommunications', 'logistics', 'cybersecurity', 'aerospace'],
        capability: ['parallel processing', 'secure transactions', 'predictive analytics', 'real-time automation', 'encrypted communication'],
        opportunity: ['hyper-personalized medicine', 'algorithmic trading', 'global supply chain optimization', 'next-generation encryption'],
        beneficiary: ['stakeholders', 'consumers', 'researchers', 'corporations', 'governments'],
      }
    },
    {
      template: "In the contemporary landscape of {field}, practitioners must possess a sophisticated understanding of both {theory} and its practical {application}, navigating the intricate interplay between historical precedent and emergent innovation to achieve optimal outcomes.",
      variables: {
        field: ['computational linguistics', 'neuroscience', 'molecular biology', 'aerospace engineering', 'theoretical physics', 'geopolitics'],
        theory: ['syntax analysis', 'synaptic plasticity', 'gene expression', 'aerodynamics', 'quantum mechanics', 'game theory'],
        application: ['natural language processing', 'cognitive enhancement', 'genetic therapies', 'spacecraft design', 'particle accelerator research', 'international diplomacy'],
      }
    },
    {
      template: "A comprehensive analysis of {subject} reveals a complex dependency on {variable1} and {variable2}, which together dictate the overall {outcome} of the system. This intricate relationship necessitates a multidisciplinary approach for accurate modeling.",
      variables: {
        subject: ['climate change', 'macroeconomics', 'cellular respiration', 'political systems', 'sociological trends'],
        variable1: ['atmospheric composition', 'market liquidity', 'glucose availability', 'electoral reforms', 'demographic shifts'],
        variable2: ['solar radiation', 'consumer confidence', 'oxygen concentration', 'media influence', 'economic inequalities'],
        outcome: ['global temperature shifts', 'economic stability', 'energy production', 'governmental policy', 'social cohesion'],
      }
    },
    {
      template: "Navigating the complexities of {system} requires an integrated approach, balancing the theoretical underpinnings of {concept1} with the practical constraints of {concept2}. This fusion of ideas often leads to groundbreaking {innovation}.",
      variables: {
        system: ['urban planning', 'machine learning algorithms', 'public policy', 'global finance'],
        concept1: ['architectural history', 'Bayesian statistics', 'socio-economic models', 'monetary theory'],
        concept2: ['budgetary limitations', 'data privacy concerns', 'political feasibility', 'regulatory oversight'],
        innovation: ['sustainable infrastructure', 'predictive intelligence', 'equitable legislation', 'fintech solutions'],
      }
    },
    {
      template: "The pursuit of {goal} in {domain} is often characterized by a rigorous process of {method1} and {method2}, which are essential for overcoming inherent {challenge1} and {challenge2} while maintaining a clear focus on the desired result.",
      variables: {
        goal: ['scientific discovery', 'technological advancement', 'sustainable growth', 'market leadership'],
        domain: ['biochemistry', 'software engineering', 'environmental protection', 'competitive industries'],
        method1: ['iterative experimentation', 'agile development', 'resource conservation', 'strategic planning'],
        method2: ['peer review and validation', 'continuous integration', 'policy implementation', 'data-driven decision-making'],
        challenge1: ['unpredictable outcomes', 'technical debt', 'regulatory hurdles', 'fierce competition'],
        challenge2: ['funding constraints', 'security vulnerabilities', 'public resistance', 'rapid technological shifts'],
      }
    }
  ]
};


// Musical notes frequencies for piano mode
const PIANO_NOTES = [
  261.63, 293.66, 329.63, 349.23, 392.00, 440.00, 493.88, // C4 to B4
  523.25, 587.33, 659.25, 698.46, 783.99, 880.00, 987.77  // C5 to B5
];

// Simple confetti function (since canvas-confetti might not be available)
const triggerConfetti = () => {
  // Simple confetti effect using DOM elements
  const colors = ['#ff0000', '#00ff00', '#0000ff', '#ffff00', '#ff00ff', '#00ffff'];
  for (let i = 0; i < 50; i++) {
    const confetti = document.createElement('div');
    confetti.style.position = 'fixed';
    confetti.style.left = Math.random() * 100 + '%';
    confetti.style.top = '0px';
    confetti.style.width = '10px';
    confetti.style.height = '10px';
    confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
    confetti.style.pointerEvents = 'none';
    confetti.style.zIndex = '1000';
    document.body.appendChild(confetti);

    const animation = confetti.animate([
      { transform: 'translateY(0px) rotate(0deg)', opacity: 1 },
      { transform: `translateY(${window.innerHeight}px) rotate(360deg)`, opacity: 0 }
    ], {
      duration: 3000,
      easing: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)'
    });

    animation.onfinish = () => confetti.remove();
  }
};

const TypingTest: React.FC<TypingTestProps> = ({ darkMode, initialWpmGoal }) => {
  // Refs
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const wpmIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);

  // State declarations
  const [difficulty, setDifficulty] = useState<Difficulty>('easy');
  const [currentText, setCurrentText] = useState('');
  const [userInput, setUserInput] = useState('');
  const [startTime, setStartTime] = useState<number | null>(null);
  const [endTime, setEndTime] = useState<number | null>(null);
  const [isCompleted, setIsCompleted] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [wpm, setWpm] = useState(0);
  const [accuracy, setAccuracy] = useState(100);
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [isLoadingNewText, setIsLoadingNewText] = useState(false);
  const [wpmHistory, setWpmHistory] = useState<Array<{ time: number; wpm: number }>>([]);
  const [gameMode, setGameMode] = useState<GameMode>('normal');
  const [wpmGoal, setWpmGoal] = useState(initialWpmGoal);
  const [goalAchieved, setGoalAchieved] = useState(false);
  const [wordStats, setWordStats] = useState<WordStats[]>([]);
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [currentWordStartTime, setCurrentWordStartTime] = useState<number | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [showWordAnalysis, setShowWordAnalysis] = useState(false);
  const [timeLeft, setTimeLeft] = useState(60);
  const [isTyping, setIsTyping] = useState(false);
  const [showCongrats, setShowCongrats] = useState(false);
  const [currentWpm, setCurrentWpm] = useState(0);
  const [testComplete, setTestComplete] = useState(false);

  // Audio and settings state
  const [soundEnabled, setSoundEnabled] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('soundEnabled');
      return saved ? JSON.parse(saved) : true;
    }
    return true;
  });

  const [musicMode, setMusicMode] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('musicMode');
      return saved ? JSON.parse(saved) : false;
    }
    return false;
  });

  const [blindMode, setBlindMode] = useState(false);

  // Audio setup effect
  useEffect(() => {
    // Create simple beep sounds
    const createBeepSound = (frequency: number) => {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);

      oscillator.frequency.value = frequency;
      oscillator.type = 'sine';

      gainNode.gain.setValueAtTime(0, audioContext.currentTime);
      gainNode.gain.linearRampToValueAtTime(0.1, audioContext.currentTime + 0.01);
      gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 0.1);

      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.1);
    };

    // Initialize audio context for music mode
    try {
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    } catch (error) {
      console.log('Audio context not supported');
    }
  }, []);

  // LocalStorage effects
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('soundEnabled', JSON.stringify(soundEnabled));
    }
  }, [soundEnabled]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('musicMode', JSON.stringify(musicMode));
    }
  }, [musicMode]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('wpmGoal', wpmGoal.toString());
    }
  }, [wpmGoal]);

  // Calculate WPM function
  const calculateWPM = useCallback(() => {
    if (!startTime || userInput.length === 0) return 0;

    const timeElapsedMinutes = (Date.now() - startTime) / 60000;
    const wordsTyped = userInput.trim().split(' ').filter(word => word.length > 0).length;
    return Math.round(wordsTyped / timeElapsedMinutes) || 0;
  }, [startTime, userInput]);

  // Play musical note function
  const playMusicalNote = useCallback((charCode: number) => {
    if (!musicMode || !audioContextRef.current) return;

    try {
      const noteIndex = charCode % PIANO_NOTES.length;
      const frequency = PIANO_NOTES[noteIndex];

      const oscillator = audioContextRef.current.createOscillator();
      const gainNode = audioContextRef.current.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioContextRef.current.destination);

      oscillator.frequency.setValueAtTime(frequency, audioContextRef.current.currentTime);
      oscillator.type = 'sine';

      gainNode.gain.setValueAtTime(0.3, audioContextRef.current.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContextRef.current.currentTime + 0.5);

      oscillator.start(audioContextRef.current.currentTime);
      oscillator.stop(audioContextRef.current.currentTime + 0.5);
    } catch (error) {
      console.log('Error playing musical note:', error);
    }
  }, [musicMode]);

  // Play sound function
  const playSound = useCallback((isCorrect: boolean) => {
    if (soundEnabled && !musicMode && audioContextRef.current) {
      try {
        const frequency = isCorrect ? 800 : 300;
        const oscillator = audioContextRef.current.createOscillator();
        const gainNode = audioContextRef.current.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(audioContextRef.current.destination);

        oscillator.frequency.value = frequency;
        oscillator.type = 'sine';

        gainNode.gain.setValueAtTime(0, audioContextRef.current.currentTime);
        gainNode.gain.linearRampToValueAtTime(0.1, audioContextRef.current.currentTime + 0.01);
        gainNode.gain.exponentialRampToValueAtTime(0.001, audioContextRef.current.currentTime + 0.1);

        oscillator.start(audioContextRef.current.currentTime);
        oscillator.stop(audioContextRef.current.currentTime + 0.1);
      } catch (error) {
        console.log('Error playing sound:', error);
      }
    }
  }, [soundEnabled, musicMode]);

  // Check goal achievement
  const checkGoalAchievement = useCallback(() => {
    if (wpm >= wpmGoal && !goalAchieved && isCompleted) {
      setGoalAchieved(true);
      triggerConfetti();
      setTimeout(() => setGoalAchieved(false), 5000);
    }
  }, [wpm, wpmGoal, goalAchieved, isCompleted]);

  // Calculate stats
  const calculateStats = useCallback(() => {
    if (!startTime || userInput.length === 0) return;

    const timeElapsedMinutes = (Date.now() - startTime) / 60000;
    const wordsTyped = userInput.trim().split(' ').filter(word => word.length > 0).length;
    const wpmValue = Math.round(wordsTyped / timeElapsedMinutes) || 0;

    let correctChars = 0;
    for (let i = 0; i < userInput.length && i < currentText.length; i++) {
      if (userInput[i] === currentText[i]) {
        correctChars++;
      }
    }

    const accuracyValue = userInput.length > 0
      ? Math.round((correctChars / userInput.length) * 100)
      : 100;

    setWpm(wpmValue);
    setAccuracy(accuracyValue);
    setTimeElapsed(Math.floor((Date.now() - startTime) / 1000));
  }, [startTime, userInput, currentText]);

  // Update WPM history
  const updateWpmHistory = useCallback(() => {
    if (startTime && userInput.length > 0) {
      const timeElapsedMinutes = (Date.now() - startTime) / 60000;
      const wordsTyped = userInput.trim().split(' ').filter(word => word.length > 0).length;
      const currentWpm = Math.round(wordsTyped / timeElapsedMinutes) || 0;

      setWpmHistory(prev => [...prev, {
        time: Math.floor((Date.now() - startTime) / 1000),
        wpm: currentWpm
      }]);
    }
  }, [startTime, userInput]);

  // Track word progress
  const trackWordProgress = useCallback(() => {
    const words = currentText.split(' ');
    const typedWords = userInput.split(' ');

    if (typedWords.length > currentWordIndex) {
      if (currentWordStartTime) {
        const timeSpent = Date.now() - currentWordStartTime;
        const word = words[currentWordIndex];
        const typedWord = typedWords[currentWordIndex];

        setWordStats(prev => [...prev, {
          word,
          correct: word === typedWord,
          timeSpent,
          startTime: currentWordStartTime
        }]);
      }

      setCurrentWordIndex(typedWords.length);
      setCurrentWordStartTime(Date.now());
    }
  }, [userInput, currentText, currentWordIndex, currentWordStartTime]);

  // Stats calculation effect
  useEffect(() => {
    if (startTime && !endTime) {
      intervalRef.current = setInterval(calculateStats, 100);
      if(wpmIntervalRef.current) clearInterval(wpmIntervalRef.current);
      wpmIntervalRef.current = setInterval(updateWpmHistory, 2000);
    }

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      if (wpmIntervalRef.current) clearInterval(wpmIntervalRef.current);
    };
  }, [startTime, endTime, calculateStats, updateWpmHistory]);

  // Word progress effect
  useEffect(() => {
    trackWordProgress();
  }, [trackWordProgress]);

  // Goal achievement effect
  useEffect(() => {
    checkGoalAchievement();
  }, [checkGoalAchievement]);

  // Timer effect
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isTyping && timeLeft > 0 && !testComplete) {
      timer = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            const finalWpm = calculateWPM();
            setCurrentWpm(finalWpm);
            setShowCongrats(finalWpm >= wpmGoal);
            setTestComplete(true);
            setIsTyping(false);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (timer) {
        clearInterval(timer);
      }
    };
  }, [isTyping, timeLeft, testComplete, calculateWPM, wpmGoal]);

  // Play intro music
  const playIntroMusic = useCallback(() => {
    if (musicMode && audioContextRef.current) {
      try {
        const oscillator = audioContextRef.current.createOscillator();
        const gainNode = audioContextRef.current.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(audioContextRef.current.destination);

        oscillator.frequency.setValueAtTime(440, audioContextRef.current.currentTime);
        oscillator.type = 'sine';

        gainNode.gain.setValueAtTime(0.3, audioContextRef.current.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContextRef.current.currentTime + 2);

        oscillator.start(audioContextRef.current.currentTime);
        oscillator.stop(audioContextRef.current.currentTime + 2);
      } catch (error) {
        console.log('Error playing intro music:', error);
      }
    }
  }, [musicMode]);

  useEffect(() => {
    playIntroMusic();
  }, [playIntroMusic]);

  // Handle input change
  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;

    if (testComplete) return;

    if (!startTime && value.length > 0) {
      setStartTime(Date.now());
      setCurrentWordStartTime(Date.now());
      setIsTyping(true);
    }

    if (value.length <= currentText.length) {
      const lastChar = value[value.length - 1];
      const expectedChar = currentText[value.length - 1];

      if (lastChar && expectedChar) {
        const isCorrect = lastChar === expectedChar;
        playSound(isCorrect);

        if (musicMode) {
          playMusicalNote(lastChar.charCodeAt(0));
        }
      }

      setUserInput(value);
      setCurrentIndex(value.length);

      if (value === currentText) {
        setEndTime(Date.now());
        setIsCompleted(true);
        setShowFeedback(true);
        setShowWordAnalysis(true);
        setTestComplete(true);
        setIsTyping(false);
        saveScore();
      }
    }
  };

  // Save score
  const saveScore = () => {
    if (wpm > 0 && typeof window !== 'undefined') {
      const newScore: Score = {
        wpm,
        accuracy,
        date: new Date().toLocaleString()
      };

      const existingScores = JSON.parse(localStorage.getItem('typingScores') || '[]');
      const updatedScores = [...existingScores, newScore]
        .sort((a, b) => b.wpm - a.wpm)
        .slice(0, 5);

      localStorage.setItem('typingScores', JSON.stringify(updatedScores));
    }
  };

  // Reset test
  const resetTest = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    if (wpmIntervalRef.current) {
      clearInterval(wpmIntervalRef.current);
      wpmIntervalRef.current = null;
    }

    setUserInput('');
    setStartTime(null);
    setEndTime(null);
    setIsCompleted(false);
    setCurrentIndex(0);
    setWpm(0);
    setAccuracy(100);
    setTimeElapsed(0);
    setTimeLeft(60);
    setIsTyping(false);
    setShowCongrats(false);
    setCurrentWpm(0);
    setTestComplete(false);
    setWpmHistory([]);
    setWordStats([]);
    setCurrentWordIndex(0);
    setCurrentWordStartTime(null);
    setShowFeedback(false);
    setShowWordAnalysis(false);
    setGoalAchieved(false);

    setTimeout(() => {
      textareaRef.current?.focus();
    }, 100);
  }, []);

  // Function to generate text from a template based on difficulty
  const generateTemplateText = useCallback((selectedDifficulty: Difficulty) => {
    const templates = TEXT_TEMPLATES[selectedDifficulty];
    const randomTemplateData = templates[Math.floor(Math.random() * templates.length)];
    let newText = randomTemplateData.template;
    
    // Replace placeholders with random values
    Object.keys(randomTemplateData.variables).forEach(key => {
      const values = randomTemplateData.variables[key];
      const randomValue = values[Math.floor(Math.random() * values.length)];
      const placeholder = `{${key}}`;
      newText = newText.replace(new RegExp(placeholder, 'g'), randomValue);
    });

    return newText;
  }, []);

  // Function to handle changing text (now based on difficulty)
  const changeText = useCallback(() => {
    setIsLoadingNewText(true);
    const newText = generateTemplateText(difficulty);
    setCurrentText(newText);
    resetTest();
    setIsLoadingNewText(false);
  }, [difficulty, generateTemplateText, resetTest]);
  
  // Effect to generate new text on mount and when difficulty changes
  useEffect(() => {
    setCurrentText(generateTemplateText(difficulty));
    resetTest();
  }, [difficulty]); // Depend on difficulty state

  // Handle continue
  const handleContinue = () => {
    setGoalAchieved(false);
    setShowCongrats(false);
    resetTest();
  };

  // Get emoji reaction
  const getEmojiReaction = () => {
    if (isCompleted) return '✅';
    if (wpm > 60) return '🚀';
    if (wpm >= 30) return '🙂';
    if (wpm > 0) return '🐢';
    return '😐';
  };

  // Render text with highlight
  const renderTextWithHighlight = () => {
    return currentText.split('').map((char, index) => {
      let className = 'transition-all duration-150 ';

      if (index < userInput.length) {
        if (userInput[index] === char) {
          className += 'bg-green-200 text-green-800 dark:bg-green-800 dark:text-green-200';
        } else {
          className += 'bg-red-200 text-red-800 dark:bg-red-800 dark:text-red-200';
        }
      } else if (index === currentIndex) {
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

  // Game mode renderers
  if (gameMode === 'bot-race') {
    return (
      <BotRace
        darkMode={darkMode}
        onBack={() => setGameMode('normal')}
        soundEnabled={soundEnabled}
        musicMode={musicMode}
        playSound={playSound}
        playMusicalNote={playMusicalNote}
      />
    );
  }

  if (gameMode === 'memory') {
    return (
      <MemoryChallenge
        darkMode={darkMode}
        onBack={() => setGameMode('normal')}
        soundEnabled={soundEnabled}
        musicMode={musicMode}
        playSound={playSound}
        playMusicalNote={playMusicalNote}
      />
    );
  }

  if (gameMode === 'multiplayer') {
    return (
      <MultiplayerRace
        darkMode={darkMode}
        onBack={() => setGameMode('normal')}
        soundEnabled={soundEnabled}
        musicMode={musicMode}
        playSound={playSound}
        playMusicalNote={playMusicalNote}
      />
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Goal Achievement Modal */}
      {goalAchieved && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className={`p-8 rounded-2xl text-center max-w-md mx-4 ${
            darkMode ? 'bg-gray-800 text-white' : 'bg-white text-gray-800'
          }`}>
            <div className="text-6xl mb-4">🎉</div>
            <h2 className="text-2xl font-bold mb-2">Goal Achieved!</h2>
            <p className="text-lg mb-4">
              Congratulations! You reached {wpm} WPM, exceeding your goal of {wpmGoal} WPM!
            </p>
            <button
              onClick={handleContinue}
              className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
            >
              Continue
            </button>
          </div>
        </div>
      )}

      {/* Game Mode Selector */}
      <GameModeSelector
        currentMode={gameMode}
        onModeChange={setGameMode}
        darkMode={darkMode}
      />

      {/* Goal Setting */}
      <GoalSetting
        goal={wpmGoal}
        onGoalChange={setWpmGoal}
        currentWpm={wpm}
        darkMode={darkMode}
      />

      {/* Stats Row */}
      <Stats
        timeElapsed={timeElapsed}
        wpm={wpm}
        accuracy={accuracy}
        emoji={getEmojiReaction()}
        darkMode={darkMode}
      />

      {/* Main Typing Area */}
      <div className={`backdrop-blur-lg rounded-2xl p-8 shadow-2xl border transition-all duration-300 ${
        darkMode
          ? 'bg-white/10 border-white/20'
          : 'bg-white/20 border-white/30'
      }`}>
        {/* Controls */}
        <div className="flex justify-between items-center mb-6">
          <div className="flex gap-2">
            <button
              onClick={() => setSoundEnabled(!soundEnabled)}
              className={`p-2 rounded-lg transition-all duration-200 hover:scale-105 ${
                darkMode
                  ? 'bg-white/10 text-white hover:bg-white/20'
                  : 'bg-white/20 text-white hover:bg-white/30'
              }`}
              title="Toggle Sound Effects"
            >
              {soundEnabled ? <Volume2 size={20} /> : <VolumeX size={20} />}
            </button>

            <button
              onClick={() => setMusicMode(!musicMode)}
              className={`p-2 rounded-lg transition-all duration-200 hover:scale-105 ${
                musicMode
                  ? darkMode
                    ? 'bg-purple-600 text-white hover:bg-purple-700'
                    : 'bg-purple-500 text-white hover:bg-purple-600'
                  : darkMode
                    ? 'bg-white/10 text-white hover:bg-white/20'
                    : 'bg-white/20 text-white hover:bg-white/30'
              }`}
              title="Toggle Music Mode"
            >
              <Music size={20} />
            </button>

            <button
              onClick={() => setBlindMode(!blindMode)}
              className={`p-2 rounded-lg transition-all duration-200 hover:scale-105 ${
                blindMode
                  ? darkMode
                    ? 'bg-orange-600 text-white hover:bg-orange-700'
                    : 'bg-orange-500 text-white hover:bg-orange-600'
                  : darkMode
                    ? 'bg-white/10 text-white hover:bg-white/20'
                    : 'bg-white/20 text-white hover:bg-white/30'
              }`}
              title="Toggle Blind Mode"
            >
              {blindMode ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
            
            {/* The "Change Text" button now uses the internal template generator */}
            <button
              onClick={changeText}
              disabled={isLoadingNewText}
              className={`p-2 rounded-lg transition-all duration-200 hover:scale-105 ${
                isLoadingNewText
                  ? 'bg-gray-400 cursor-not-allowed'
                  : darkMode
                    ? 'bg-white/10 text-white hover:bg-white/20'
                    : 'bg-white/20 text-white hover:bg-white/30'
              }`}
              title="Change Text"
            >
              {isLoadingNewText ? (
                <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
              ) : (
                <RefreshCw size={20} />
              )}
            </button>
            
            <button
              onClick={resetTest}
              className={`p-2 rounded-lg transition-all duration-200 hover:scale-105 ${
                darkMode
                  ? 'bg-white/10 text-white hover:bg-white/20'
                  : 'bg-white/20 text-white hover:bg-white/30'
              }`}
              title="Reset Test"
            >
              <RotateCcw size={20} />
            </button>
          </div>
          
          <div className="flex gap-2 justify-end">
             {/* Difficulty Selector */}
            <button
              onClick={() => setDifficulty('easy')}
              className={`p-2 rounded-lg transition-all duration-200 hover:scale-105 ${
                difficulty === 'easy'
                  ? 'bg-green-500 text-white'
                  : darkMode
                    ? 'bg-white/10 text-white hover:bg-white/20'
                    : 'bg-white/20 text-gray-800 hover:bg-white/30'
              }`}
              title="Easy Difficulty"
            >
              <Layers size={20} />
            </button>
            <button
              onClick={() => setDifficulty('medium')}
              className={`p-2 rounded-lg transition-all duration-200 hover:scale-105 ${
                difficulty === 'medium'
                  ? 'bg-yellow-500 text-black'
                  : darkMode
                    ? 'bg-white/10 text-white hover:bg-white/20'
                    : 'bg-white/20 text-gray-800 hover:bg-white/30'
              }`}
              title="Medium Difficulty"
            >
              <Zap size={20} />
            </button>
            <button
              onClick={() => setDifficulty('hard')}
              className={`p-2 rounded-lg transition-all duration-200 hover:scale-105 ${
                difficulty === 'hard'
                  ? 'bg-red-500 text-white'
                  : darkMode
                    ? 'bg-white/10 text-white hover:bg-white/20'
                    : 'bg-white/20 text-gray-800 hover:bg-white/30'
              }`}
              title="Hard Difficulty"
            >
              <Flame size={20} />
            </button>

            {/* Timer Display */}
            <div className={`px-4 py-2 rounded-lg ${
                darkMode ? 'bg-white/10 text-white' : 'bg-white/20 text-white'
            }`}>
                <span className="font-mono text-lg">
                {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}
                </span>
            </div>
          </div>
        </div>
        
        {/* Text Display */}
        <div className={`p-6 rounded-lg mb-4 font-mono text-lg leading-relaxed ${
          darkMode
            ? 'bg-black/20 border border-white/10'
            : 'bg-white/30 border border-white/20'
        }`}>
          {renderTextWithHighlight()}
        </div>

        {/* Input Area */}
        <textarea
          ref={textareaRef}
          value={userInput}
          onChange={handleInputChange}
          disabled={isCompleted || testComplete || isLoadingNewText} // Disable input while loading
          placeholder="Start typing here..."
          className={`w-full h-32 p-4 rounded-lg font-mono text-lg resize-none focus:outline-none focus:ring-2 transition-all duration-200 ${
            blindMode
              ? 'text-transparent caret-white'
              : darkMode
                ? 'text-white'
                : 'text-gray-800'
          } ${
            darkMode
              ? 'bg-black/30 placeholder-gray-400 border border-white/10 focus:ring-purple-400'
              : 'bg-white/50 placeholder-gray-600 border border-white/20 focus:ring-blue-400'
          }`}
          autoFocus
        />

        {blindMode && (
          <p className={`text-sm mt-2 ${darkMode ? 'text-yellow-400' : 'text-orange-600'}`}>
            🙈 Blind Mode: Your typing is invisible! Type from memory.
          </p>
        )}

        {(isCompleted || testComplete) && (
          <div className={`mt-4 p-4 rounded-lg text-center ${
            darkMode ? 'bg-green-900/30 text-green-300' : 'bg-green-100 text-green-800'
          }`}>
            <p className="text-xl font-semibold">🎉 Test Completed!</p>
            <p>Great job! Your score has been saved.</p>
            <button
              onClick={handleContinue}
              className="mt-4 px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
            >
              Try Again
            </button>
          </div>
        )}
      </div>

      {/* Coach Feedback */}
      {showFeedback && (
        <CoachFeedback
          wpm={wpm}
          accuracy={accuracy}
          goal={wpmGoal}
          darkMode={darkMode}
          onClose={() => setShowFeedback(false)}
        />
      )}

      {/* Word Analysis */}
      {showWordAnalysis && wordStats.length > 0 && (
        <WordAnalysis
          wordStats={wordStats}
          darkMode={darkMode}
          onClose={() => setShowWordAnalysis(false)}
        />
      )}

      {/* Chart */}
      {wpmHistory.length > 1 && (
        <TypingChart wpmHistory={wpmHistory} darkMode={darkMode} />
      )}

      {/* Scoreboard */}
      <Scoreboard darkMode={darkMode} />
    </div>
  );
};

export default TypingTest;
