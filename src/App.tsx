import React, { useState, useEffect } from 'react';
import TypingTest from './components/TypingTest';
import ErrorBoundary from './components/ErrorBoundary';
import MultiplayerMenu from './components/MultiplayerMenu';
import MultiplayerRoom from './components/MultiplayerRoom';
import { Sun, Moon, ArrowLeft } from 'lucide-react';
import socketService from './services/socketService';
import { Socket } from 'socket.io-client';

type GameMode = 'menu' | 'single' | 'multiplayer-menu' | 'multiplayer-room';

interface MultiplayerState {
  roomId: string;
  playerName: string;
}

function App() {
  const [darkMode, setDarkMode] = useState(() => {
    const saved = localStorage.getItem('darkMode');
    return saved ? JSON.parse(saved) : false;
  });

  const [gameMode, setGameMode] = useState<GameMode>('menu');
  const [multiplayerState, setMultiplayerState] = useState<MultiplayerState>({
    roomId: '',
    playerName: ''
  });
  const [socket, setSocket] = useState<Socket | null>(null);

  useEffect(() => {
    const socketInstance = socketService.connect();
    setSocket(socketInstance);

    return () => {
      socketService.disconnect();
    };
  }, []);

  useEffect(() => {
    localStorage.setItem('darkMode', JSON.stringify(darkMode));
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };

  const handleJoinRoom = (roomId: string, playerName: string) => {
    setMultiplayerState({ roomId, playerName });
    setGameMode('multiplayer-room');
  };

  const handleLeaveRoom = () => {
    setGameMode('menu');
    setMultiplayerState({ roomId: '', playerName: '' });
  };

  const backgroundClass = darkMode 
    ? 'bg-gradient-to-br from-gray-900 via-purple-900 to-violet-900' 
    : 'bg-gradient-to-br from-blue-400 via-purple-500 to-pink-500';

  const textClass = darkMode ? 'text-white' : 'text-white';

  return (
    <div className={`min-h-screen transition-all duration-500 ${backgroundClass}`}>
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <header className="flex justify-between items-center mb-8">
          <div className="flex items-center gap-4">
            {gameMode !== 'menu' && (
              <button
                onClick={() => {
                  if (gameMode === 'multiplayer-room') {
                    handleLeaveRoom();
                  } else if (gameMode === 'multiplayer-menu') {
                    setGameMode('menu');
                  } else {
                    setGameMode('menu');
                  }
                }}
                className={`p-2 rounded-full backdrop-blur-sm transition-all duration-300 hover:scale-110 ${
                  darkMode 
                    ? 'bg-white/10 text-white hover:bg-white/20' 
                    : 'bg-white/20 text-white hover:bg-white/30'
                }`}
              >
                <ArrowLeft size={20} />
              </button>
            )}
            
            <h1 className={`text-4xl font-bold ${textClass} drop-shadow-lg`}>
              💻 Typing Speed Test
            </h1>
          </div>
          
          <button
            onClick={toggleDarkMode}
            className={`p-3 rounded-full backdrop-blur-sm transition-all duration-300 hover:scale-110 ${
              darkMode 
                ? 'bg-white/10 text-yellow-400 hover:bg-white/20' 
                : 'bg-white/20 text-white hover:bg-white/30'
            }`}
          >
            {darkMode ? <Sun size={24} /> : <Moon size={24} />}
          </button>
        </header>

        {/* Main Content */}
        <ErrorBoundary>
          {gameMode === 'menu' && (
            <div className="max-w-md mx-auto">
              <div className="space-y-4">
                <button
                  onClick={() => setGameMode('single')}
                  className={`w-full py-6 rounded-xl backdrop-blur-sm transition-all duration-300 hover:scale-105 text-lg font-semibold ${
                    darkMode
                      ? 'bg-white/10 text-white hover:bg-white/20 border border-white/20'
                      : 'bg-white/20 text-white hover:bg-white/30 border border-white/30'
                  }`}
                >
                  🎯 Single Player
                </button>
                
                <button
                  onClick={() => setGameMode('multiplayer-menu')}
                  className={`w-full py-6 rounded-xl backdrop-blur-sm transition-all duration-300 hover:scale-105 text-lg font-semibold ${
                    darkMode
                      ? 'bg-purple-500/20 text-white hover:bg-purple-500/30 border border-purple-400/30'
                      : 'bg-purple-600/30 text-white hover:bg-purple-600/40 border border-purple-300/50'
                  }`}
                >
                  🏆 Multiplayer Race
                </button>
              </div>

              <div className={`mt-8 p-6 rounded-xl backdrop-blur-sm ${
                darkMode 
                  ? 'bg-white/5 border border-white/10' 
                  : 'bg-white/10 border border-white/20'
              }`}>
                <h3 className={`text-lg font-semibold mb-3 ${textClass}`}>How to Play:</h3>
                <ul className={`text-sm space-y-2 ${textClass} opacity-90`}>
                  <li>• <strong>Single Player:</strong> Practice and improve your typing speed</li>
                  <li>• <strong>Multiplayer:</strong> Race against friends in real-time</li>
                  <li>• Share room codes to invite others to join</li>
                </ul>
              </div>
            </div>
          )}

          {gameMode === 'single' && (
            <div className={`rounded-xl backdrop-blur-sm p-6 ${
              darkMode 
                ? 'bg-white/5 border border-white/10' 
                : 'bg-white/10 border border-white/20'
            }`}>
              <TypingTest darkMode={darkMode} initialWpmGoal={40} />
            </div>
          )}

          {gameMode === 'multiplayer-menu' && (
            <div className={`rounded-xl backdrop-blur-sm overflow-hidden ${
              darkMode 
                ? 'bg-white/5 border border-white/10' 
                : 'bg-white/10 border border-white/20'
            }`}>
              <MultiplayerMenu onJoinRoom={handleJoinRoom} darkMode={darkMode} />
            </div>
          )}

          {gameMode === 'multiplayer-room' && socket && (
            <div className={`rounded-xl backdrop-blur-sm overflow-hidden ${
              darkMode 
                ? 'bg-white/5 border border-white/10' 
                : 'bg-white/10 border border-white/20'
            }`}>
              <MultiplayerRoom
                roomId={multiplayerState.roomId}
                playerName={multiplayerState.playerName}
                onLeave={handleLeaveRoom}
                darkMode={darkMode}
                socket={socket}
              />
            </div>
          )}
        </ErrorBoundary>
      </div>
    </div>
  );
}

export default App;