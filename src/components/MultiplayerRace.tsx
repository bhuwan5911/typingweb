import React, { useState, useEffect, useRef, useCallback } from 'react';
import { ArrowLeft, Users, Copy, Play } from 'lucide-react';
import { initializeApp } from 'firebase/app';
import { getAuth, signInAnonymously, signInWithCustomToken, onAuthStateChanged } from 'firebase/auth';
import { getFirestore, doc, setDoc, onSnapshot, getDoc } from 'firebase/firestore';

interface MultiplayerRaceProps {
  darkMode: boolean;
  onBack: () => void;
  soundEnabled: boolean;
  musicMode: boolean;
  playSound: (isCorrect: boolean) => void;
  playMusicalNote: (charCode: number) => void;
}

interface Player {
  id: string;
  name: string;
  progress: number;
  wpm: number;
  finished: boolean;
}

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

const MultiplayerRace: React.FC<MultiplayerRaceProps> = ({ 
  darkMode, 
  onBack, 
  soundEnabled, 
  musicMode, 
  playSound, 
  playMusicalNote 
}) => {
  const [db, setDb] = useState<any>(null);
  const [auth, setAuth] = useState<any>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [isAuthReady, setIsAuthReady] = useState(false);
  const [roomId, setRoomId] = useState('');
  const [playerName, setPlayerName] = useState('');
  const [isHost, setIsHost] = useState(false);
  const [gameState, setGameState] = useState<'lobby' | 'waiting' | 'countdown' | 'racing' | 'finished'>('lobby');
  const [players, setPlayers] = useState<Player[]>([]);
  const [userInput, setUserInput] = useState('');
  const [countdown, setCountdown] = useState(3);
  const [startTime, setStartTime] = useState<number | null>(null);
  const [winner, setWinner] = useState<string | null>(null);
  const [raceText, setRaceText] = useState('');
  
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Firestore & Auth setup
  useEffect(() => {
    const firebaseConfig = JSON.parse(typeof __firebase_config !== 'undefined' ? __firebase_config : '{}');
    if (firebaseConfig.apiKey) {
      const app = initializeApp(firebaseConfig);
      setDb(getFirestore(app));
      setAuth(getAuth(app));
    }
  }, []);

  useEffect(() => {
    if (auth) {
      const unsubscribe = onAuthStateChanged(auth, async (user) => {
        if (user) {
          setUserId(user.uid);
        } else {
          try {
            await signInAnonymously(auth);
          } catch (e) {
            console.error("Anonymous sign-in failed:", e);
          }
        }
        setIsAuthReady(true);
      });
      return () => unsubscribe();
    }
  }, [auth]);

  // Real-time race data listener
  useEffect(() => {
    if (!db || !roomId || gameState === 'lobby' || !isAuthReady) return;

    const unsubscribe = onSnapshot(doc(db, "artifacts", typeof __app_id !== 'undefined' ? __app_id : 'default-app-id', "public", "data", "races", roomId), (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        setRaceText(data.text);
        setGameState(data.state);
        const playersArray = Object.values(data.players) as Player[];
        setPlayers(playersArray);
        setWinner(data.winner);
        
        if (data.state === 'racing' && !startTime) {
          setStartTime(Date.now());
          textareaRef.current?.focus();
        }
      }
    });

    return () => unsubscribe();
  }, [db, roomId, gameState, startTime, isAuthReady]);

  const generateNewRaceText = useCallback(() => {
    const randomTemplateData = RACE_TEMPLATES[Math.floor(Math.random() * RACE_TEMPLATES.length)];
    let newText = randomTemplateData.template;
    
    Object.keys(randomTemplateData.variables).forEach(key => {
      const values = randomTemplateData.variables[key];
      const randomValue = values[Math.floor(Math.random() * values.length)];
      const placeholder = `{${key}}`;
      newText = newText.replace(new RegExp(placeholder, 'g'), randomValue);
    });

    return newText;
  }, []);

  const createRoom = async () => {
    if (!playerName.trim() || !db || !userId) return;
    
    const newRoomId = Math.random().toString(36).substring(2, 8).toUpperCase();
    setRoomId(newRoomId);
    setIsHost(true);

    const raceDocRef = doc(db, "artifacts", typeof __app_id !== 'undefined' ? __app_id : 'default-app-id', "public", "data", "races", newRoomId);
    
    const newRaceText = generateNewRaceText();
    
    await setDoc(raceDocRef, {
      roomId: newRoomId,
      hostId: userId,
      text: newRaceText,
      state: 'waiting',
      players: {
        [userId]: { id: userId, name: playerName, progress: 0, wpm: 0, finished: false }
      },
      winner: null
    });
    setGameState('waiting');
  };

  const joinRoom = async () => {
    if (!playerName.trim() || !roomId.trim() || !db || !userId) return;
    
    const raceDocRef = doc(db, "artifacts", typeof __app_id !== 'undefined' ? __app_id : 'default-app-id', "public", "data", "races", roomId);
    const docSnap = await getDoc(raceDocRef);

    if (docSnap.exists()) {
      const roomData = docSnap.data();
      if (roomData.state === 'waiting' && Object.keys(roomData.players).length < 2) {
        const updatedPlayers = { ...roomData.players, [userId]: { id: userId, name: playerName, progress: 0, wpm: 0, finished: false } };
        await setDoc(raceDocRef, { players: updatedPlayers }, { merge: true });
        setGameState('waiting');
      } else {
        // Use a custom UI for this instead of alert
        console.log("Room is not in a joinable state (full or started).");
      }
    } else {
      console.log("Room not found.");
    }
  };

  const startRace = async () => {
    if (!isHost || gameState !== 'waiting' || players.length < 2 || !db || !roomId) return;
    
    const raceDocRef = doc(db, "artifacts", typeof __app_id !== 'undefined' ? __app_id : 'default-app-id', "public", "data", "races", roomId);
    await setDoc(raceDocRef, { state: 'countdown' }, { merge: true });

    setTimeout(async () => {
      await setDoc(raceDocRef, { state: 'racing', startTime: Date.now() }, { merge: true });
    }, 3000); // Wait for countdown
  };

  const handleInputChange = async (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    if (gameState !== 'racing' || !db || !userId || !raceText || !startTime) return;
    
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
      
      const progress = (value.length / raceText.length) * 100;
      const timeElapsed = (Date.now() - startTime) / 60000;
      const wordsTyped = value.trim().split(' ').filter(word => word.length > 0).length;
      const wpm = timeElapsed > 0 ? Math.round(wordsTyped / timeElapsed) : 0;
      
      const raceDocRef = doc(db, "artifacts", typeof __app_id !== 'undefined' ? __app_id : 'default-app-id', "public", "data", "races", roomId);
      
      const playerUpdate = {
        [`players.${userId}`]: {
          id: userId,
          name: playerName,
          progress,
          wpm,
          finished: progress >= 100
        }
      };
      await setDoc(raceDocRef, playerUpdate, { merge: true });

      if (value === raceText) {
        const docSnap = await getDoc(raceDocRef);
        if (docSnap.exists() && docSnap.data().winner === null) {
          await setDoc(raceDocRef, { winner: playerName, state: 'finished' }, { merge: true });
        }
      }
    }
  };

  const resetRace = async () => {
    if (!db || !roomId) return;
    const raceDocRef = doc(db, "artifacts", typeof __app_id !== 'undefined' ? __app_id : 'default-app-id', "public", "data", "races", roomId);
    await setDoc(raceDocRef, { state: 'lobby' }, { merge: true });
    setGameState('lobby');
    setPlayers([]);
    setUserInput('');
    setRoomId('');
    setPlayerName('');
    setIsHost(false);
    setWinner(null);
    setStartTime(null);
  };

  const renderTextWithHighlight = () => {
    if (!raceText) return null;
    return raceText.split('').map((char, index) => {
      let className = 'transition-all duration-150 ';
      
      if (index < userInput.length) {
        if (userInput[index] === char) {
          className += 'bg-green-200 text-green-800 dark:bg-green-800 dark:text-green-200';
        } else {
          className += 'bg-red-200 text-red-800 dark:bg-red-800 dark:text-red-200';
        }
      } else if (index === userInput.length && gameState === 'racing') {
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

  const copyRoomId = () => {
    const tempInput = document.createElement('input');
    tempInput.value = roomId;
    document.body.appendChild(tempInput);
    tempInput.select();
    try {
      document.execCommand('copy');
      console.log('Room ID copied to clipboard');
    } catch (err) {
      console.error('Failed to copy text:', err);
    }
    document.body.removeChild(tempInput);
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
          👥 Multiplayer Race
        </h2>
      </div>

      {/* Lobby */}
      {isAuthReady && gameState === 'lobby' && (
        <div className={`backdrop-blur-lg rounded-2xl p-8 shadow-2xl border ${
          darkMode 
            ? 'bg-white/10 border-white/20' 
            : 'bg-white/20 border-white/30'
        }`}>
          <div className="text-center mb-6">
            <Users className="mx-auto mb-4 text-blue-500" size={48} />
            <h3 className={`text-xl font-bold mb-2 ${darkMode ? 'text-white' : 'text-white'}`}>
              Join or Create a Race
            </h3>
            <p className={`${darkMode ? 'text-gray-300' : 'text-white/80'}`}>
              Race against friends in real-time typing challenges
            </p>
          </div>
          <div className="max-w-md mx-auto space-y-4">
            <input
              type="text"
              placeholder="Enter your name"
              value={playerName}
              onChange={(e) => setPlayerName(e.target.value)}
              className={`w-full px-4 py-3 rounded-lg text-center font-semibold ${
                darkMode 
                  ? 'bg-black/30 text-white placeholder-gray-400 border border-white/20' 
                  : 'bg-white/50 text-gray-800 placeholder-gray-600 border border-white/30'
              }`}
            />
            <div className="grid grid-cols-1 gap-4">
              <button
                onClick={createRoom}
                disabled={!playerName.trim()}
                className={`px-6 py-3 rounded-lg font-semibold transition-all duration-200 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed ${
                  darkMode 
                    ? 'bg-green-600 text-white hover:bg-green-700' 
                    : 'bg-green-500 text-white hover:bg-green-600'
                }`}
              >
                Create New Room
              </button>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Room ID"
                  value={roomId}
                  onChange={(e) => setRoomId(e.target.value.toUpperCase())}
                  className={`flex-1 px-4 py-3 rounded-lg text-center font-mono ${
                    darkMode 
                      ? 'bg-black/30 text-white placeholder-gray-400 border border-white/20' 
                      : 'bg-white/50 text-gray-800 placeholder-gray-600 border border-white/30'
                  }`}
                />
                <button
                  onClick={joinRoom}
                  disabled={!playerName.trim() || !roomId.trim()}
                  className={`px-6 py-3 rounded-lg font-semibold transition-all duration-200 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed ${
                    darkMode 
                      ? 'bg-blue-600 text-white hover:bg-blue-700' 
                      : 'bg-blue-500 text-white hover:bg-blue-600'
                  }`}
                >
                  Join
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Waiting Room */}
      {isAuthReady && gameState === 'waiting' && (
        <div className={`backdrop-blur-lg rounded-2xl p-8 shadow-2xl border ${
          darkMode 
            ? 'bg-white/10 border-white/20' 
            : 'bg-white/20 border-white/30'
        }`}>
          <div className="text-center mb-6">
            <h3 className={`text-xl font-bold mb-4 ${darkMode ? 'text-white' : 'text-white'}`}>
              Room: {roomId}
            </h3>
            <button
              onClick={copyRoomId}
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm transition-all duration-200 hover:scale-105 ${
                darkMode 
                  ? 'bg-white/10 text-white hover:bg-white/20' 
                  : 'bg-white/20 text-white hover:bg-white/30'
              }`}
            >
              <Copy size={16} />
              Copy Room ID
            </button>
          </div>
          <div className="space-y-3 mb-6">
            <h4 className={`font-semibold ${darkMode ? 'text-white' : 'text-white'}`}>
              Players ({players.length})
            </h4>
            {players.map((player) => (
              <div
                key={player.id}
                className={`flex items-center justify-between p-3 rounded-lg ${
                  darkMode ? 'bg-black/20' : 'bg-white/30'
                }`}
              >
                <span className={`font-medium ${darkMode ? 'text-white' : 'text-white'}`}>
                  {player.name} {player.id === (isHost ? userId : (players[0]?.id)) && '👑'}
                </span>
                <span className={`text-sm ${darkMode ? 'text-gray-300' : 'text-white/80'}`}>
                  Ready
                </span>
              </div>
            ))}
          </div>
          {isHost && players.length >= 2 && (
            <div className="text-center">
              <button
                onClick={startRace}
                className={`px-8 py-3 rounded-lg font-semibold transition-all duration-200 hover:scale-105 ${
                  darkMode 
                    ? 'bg-green-600 text-white hover:bg-green-700' 
                    : 'bg-green-500 text-white hover:bg-green-600'
                }`}
              >
                <Play size={20} className="inline mr-2" />
                Start Race
              </button>
            </div>
          )}
          {!isHost && (
            <div className={`text-center text-sm ${darkMode ? 'text-gray-300' : 'text-white/80'}`}>
              Waiting for host to start the race...
            </div>
          )}
        </div>
      )}

      {/* Countdown */}
      {isAuthReady && gameState === 'countdown' && (
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

      {/* Racing */}
      {isAuthReady && (gameState === 'racing' || gameState === 'finished') && (
        <>
          {/* Player Progress */}
          <div className={`backdrop-blur-lg rounded-2xl p-6 shadow-2xl border ${
            darkMode 
              ? 'bg-white/10 border-white/20' 
              : 'bg-white/20 border-white/30'
          }`}>
            <h3 className={`font-bold mb-4 ${darkMode ? 'text-white' : 'text-white'}`}>
              Race Progress
            </h3>
            <div className="space-y-3">
              {players.map((player) => (
                <div key={player.id}>
                  <div className="flex justify-between items-center mb-1">
                    <span className={`font-medium ${darkMode ? 'text-white' : 'text-white'}`}>
                      {player.name} {player.finished && '🏁'}
                    </span>
                    <span className={`text-sm ${darkMode ? 'text-gray-300' : 'text-white/80'}`}>
                      {player.wpm} WPM - {(player.progress).toFixed(0)}%
                    </span>
                  </div>
                  <div className={`w-full h-3 rounded-full overflow-hidden ${
                    darkMode ? 'bg-gray-700' : 'bg-white/30'
                  }`}>
                    <div 
                      className={`h-full transition-all duration-300 ${
                        player.id === userId ? 'bg-gradient-to-r from-blue-400 to-blue-600' :
                        'bg-gradient-to-r from-purple-400 to-purple-600'
                      }`}
                      style={{ width: `${player.progress}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Text and Input */}
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
              {renderTextWithHighlight()}
            </div>

            <textarea
              ref={textareaRef}
              value={userInput}
              onChange={handleInputChange}
              disabled={gameState === 'finished'}
              placeholder="Type the text above..."
              className={`w-full h-32 p-4 rounded-lg font-mono text-lg resize-none focus:outline-none focus:ring-2 transition-all duration-200 ${
                darkMode 
                  ? 'bg-black/30 text-white placeholder-gray-400 border border-white/10 focus:ring-purple-400' 
                  : 'bg-white/50 text-gray-800 placeholder-gray-600 border border-white/20 focus:ring-blue-400'
              }`}
            />
          </div>
        </>
      )}

      {/* Results */}
      {isAuthReady && gameState === 'finished' && (
        <div className={`backdrop-blur-lg rounded-2xl p-8 text-center shadow-2xl border ${
          darkMode 
            ? 'bg-white/10 border-white/20' 
            : 'bg-white/20 border-white/30'
        }`}>
          <div className="text-6xl mb-4">
            {winner === playerName ? '🏆' : '🏁'}
          </div>
          <h3 className={`text-2xl font-bold mb-4 ${darkMode ? 'text-white' : 'text-white'}`}>
            Race Finished!
          </h3>
          <p className={`text-lg mb-6 ${darkMode ? 'text-gray-300' : 'text-white/80'}`}>
            Winner: <span className="font-bold text-yellow-400">{winner}</span>
          </p>
          
          <button
            onClick={resetRace}
            className={`px-8 py-3 rounded-lg font-semibold transition-all duration-200 hover:scale-105 ${
              darkMode 
                ? 'bg-blue-600 text-white hover:bg-blue-700' 
                : 'bg-blue-500 text-white hover:bg-blue-600'
            }`}
          >
            New Race
          </button>
        </div>
      )}
    </div>
  );
};

export default MultiplayerRace;
