import React, { useState, useEffect, useRef } from 'react';

const TypingSpeedTest = () => {
  // Game state
  const [gameState, setGameState] = useState({
    isPlaying: false,
    isMultiplayer: false,
    currentText: '',
    userInput: '',
    startTime: null,
    timeLimit: 60,
    timeLeft: 60,
    wpm: 0,
    accuracy: 100,
    currentIndex: 0,
    correctChars: 0,
    totalChars: 0,
    roomCode: null,
    playerId: null,
    players: {}
  });

  const [currentScreen, setCurrentScreen] = useState('menu'); // 'menu', 'setup', 'game'
  const [roomInput, setRoomInput] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [countdown, setCountdown] = useState(0);
  const [showResults, setShowResults] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState('');

  const inputRef = useRef(null);
  const gameTimerRef = useRef(null);

  // Sample texts
  const sampleTexts = [
    "The quick brown fox jumps over the lazy dog near the riverbank where children often play during summer afternoons while their parents watch from wooden benches.",
    "Technology has revolutionized the way we communicate, work, and live our daily lives, bringing both incredible opportunities and new challenges that we must navigate carefully.",
    "In the heart of the bustling city, where skyscrapers reach toward the clouds and people move with purpose through crowded streets, stories unfold every moment.",
    "The ancient library contained thousands of books filled with wisdom from centuries past, their leather-bound covers holding secrets and knowledge waiting to be discovered.",
    "Modern science continues to push the boundaries of human understanding, exploring everything from the tiniest particles to the vast expanses of the universe beyond our planet."
  ];

  // Socket connection (simulated)
  const socket = useRef({
    connected: true,
    listeners: {},
    emit: function(event, data) {
      console.log('Socket emit:', event, data);
      
      if (event === 'join-room') {
        setTimeout(() => {
          if (data.roomCode && data.roomCode.length > 0) {
            // Try to join existing room
            const rooms = JSON.parse(localStorage.getItem('typingRooms') || '{}');
            if (rooms[data.roomCode]) {
              this.simulateRoomJoined(data.roomCode, data.playerName);
            } else {
              this.simulateRoomError('Room not found');
            }
          } else {
            // Create new room
            this.simulateRoomCreated(data.playerName);
          }
        }, 800);
      }
    },
    on: function(event, callback) {
      this.listeners[event] = callback;
    },
    simulateRoomJoined: function(roomCode, playerName) {
      const rooms = JSON.parse(localStorage.getItem('typingRooms') || '{}');
      if (!rooms[roomCode]) rooms[roomCode] = { players: {} };
      if (!rooms[roomCode].players) rooms[roomCode].players = {};
      
      const playerId = 'player-' + Math.random().toString(36).substr(2, 9);
      rooms[roomCode].players[playerId] = {
        name: playerName,
        progress: 0,
        wpm: 0
      };
      
      localStorage.setItem('typingRooms', JSON.stringify(rooms));
      
      if (this.listeners['room-joined']) {
        this.listeners['room-joined']({
          roomCode: roomCode,
          playerId: playerId
        });
      }
      
      setTimeout(() => {
        if (this.listeners['players-update']) {
          this.listeners['players-update'](rooms[roomCode].players);
        }
      }, 200);
    },
    simulateRoomCreated: function(playerName) {
      const newRoomCode = Math.random().toString(36).substr(2, 6).toUpperCase();
      const playerId = 'player-' + Math.random().toString(36).substr(2, 9);
      
      const rooms = JSON.parse(localStorage.getItem('typingRooms') || '{}');
      rooms[newRoomCode] = {
        players: {
          [playerId]: {
            name: playerName,
            progress: 0,
            wpm: 0
          }
        },
        gameStarted: false
      };
      
      localStorage.setItem('typingRooms', JSON.stringify(rooms));
      
      if (this.listeners['room-created']) {
        this.listeners['room-created']({
          roomCode: newRoomCode,
          playerId: playerId
        });
      }
    },
    simulateRoomError: function(message) {
      if (this.listeners['room-error']) {
        this.listeners['room-error']({ message });
      }
    }
  }).current;

  // Initialize socket events
  useEffect(() => {
    socket.on('room-created', (data) => {
      setGameState(prev => ({
        ...prev,
        roomCode: data.roomCode,
        playerId: data.playerId
      }));
      setSuccessMessage(`Room created! Share code: ${data.roomCode}`);
      setConnectionStatus('');
      startMultiplayerGame(data.roomCode, data.playerId);
    });

    socket.on('room-joined', (data) => {
      setGameState(prev => ({
        ...prev,
        roomCode: data.roomCode,
        playerId: data.playerId
      }));
      setSuccessMessage(`Joined room: ${data.roomCode}`);
      setConnectionStatus('');
      startMultiplayerGame(data.roomCode, data.playerId);
    });

    socket.on('room-error', (data) => {
      setErrorMessage(data.message || 'Room not found');
      setConnectionStatus('');
    });

    socket.on('players-update', (players) => {
      setGameState(prev => ({ ...prev, players }));
    });
  }, []);

  // Auto-hide messages
  useEffect(() => {
    if (errorMessage) {
      const timer = setTimeout(() => setErrorMessage(''), 5000);
      return () => clearTimeout(timer);
    }
  }, [errorMessage]);

  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => setSuccessMessage(''), 3000);
      return () => clearTimeout(timer);
    }
  }, [successMessage]);

  const startSinglePlayer = () => {
    const newText = sampleTexts[Math.floor(Math.random() * sampleTexts.length)];
    setGameState(prev => ({
      ...prev,
      isMultiplayer: false,
      currentText: newText,
      isPlaying: false,
      userInput: '',
      currentIndex: 0,
      correctChars: 0,
      totalChars: 0,
      startTime: null,
      timeLeft: 60,
      wpm: 0,
      accuracy: 100
    }));
    setCurrentScreen('game');
    setShowResults(false);
    setTimeout(() => initializeGame(), 100);
  };

  const startMultiplayerGame = (roomCode, playerId) => {
    const newText = sampleTexts[Math.floor(Math.random() * sampleTexts.length)];
    setGameState(prev => ({
      ...prev,
      isMultiplayer: true,
      currentText: newText,
      roomCode,
      playerId,
      players: {
        [playerId]: {
          name: 'You',
          progress: 0,
          wpm: 0,
          isCurrentUser: true
        },
        ['ai-player-1']: {
          name: 'AI Player',
          progress: 0,
          wpm: 0,
          isCurrentUser: false
        }
      }
    }));
    setCurrentScreen('game');
    setShowResults(false);
    setTimeout(() => startCountdown(), 1000);
  };

  const joinOrCreateRoom = () => {
    setConnectionStatus('Joining room...');
    setErrorMessage('');
    setSuccessMessage('');
    
    socket.emit('join-room', {
      roomCode: roomInput.trim() || null,
      playerName: 'Player' + Math.floor(Math.random() * 1000)
    });
  };

  const startCountdown = () => {
    setCountdown(3);
    const countdownInterval = setInterval(() => {
      setCountdown(count => {
        if (count <= 1) {
          clearInterval(countdownInterval);
          setTimeout(() => {
            setCountdown(0);
            initializeGame();
          }, 500);
          return 0;
        }
        return count - 1;
      });
    }, 1000);
  };

  const initializeGame = () => {
    setGameState(prev => ({
      ...prev,
      isPlaying: true,
      startTime: Date.now(),
      timeLeft: 60
    }));
    
    if (inputRef.current) {
      inputRef.current.disabled = false;
      inputRef.current.focus();
    }
    
    startTimer();
  };

  const startTimer = () => {
    gameTimerRef.current = setInterval(() => {
      setGameState(prev => {
        const newTimeLeft = prev.timeLeft - 1;
        if (newTimeLeft <= 0) {
          endGame();
          return prev;
        }
        return { ...prev, timeLeft: newTimeLeft };
      });
    }, 1000);
  };

  const calculateStats = (userInput, currentText, startTime) => {
    if (!startTime) return { wpm: 0, accuracy: 100 };
    
    const timeElapsed = (Date.now() - startTime) / 1000 / 60;
    const correctChars = userInput.split('').filter((char, index) => char === currentText[index]).length;
    const totalChars = userInput.length;
    const wordsTyped = correctChars / 5;
    const wpm = Math.floor(timeElapsed > 0 ? wordsTyped / timeElapsed : 0);
    const accuracy = totalChars > 0 ? Math.floor((correctChars / totalChars) * 100) : 100;
    
    return { wpm, accuracy, correctChars, totalChars };
  };

  const handleInputChange = (e) => {
    if (!gameState.isPlaying) return;
    
    const input = e.target.value;
    const stats = calculateStats(input, gameState.currentText, gameState.startTime);
    
    setGameState(prev => ({
      ...prev,
      userInput: input,
      currentIndex: input.length,
      correctChars: stats.correctChars,
      totalChars: Math.max(prev.totalChars, input.length),
      wpm: stats.wpm,
      accuracy: stats.accuracy
    }));
    
    // Check if text is completed
    if (input === gameState.currentText) {
      endGame();
    }
  };

  const endGame = () => {
    setGameState(prev => ({ ...prev, isPlaying: false }));
    if (gameTimerRef.current) {
      clearInterval(gameTimerRef.current);
    }
    if (inputRef.current) {
      inputRef.current.disabled = true;
    }
    setShowResults(true);
  };

  const resetGame = () => {
    setGameState({
      isPlaying: false,
      isMultiplayer: false,
      currentText: '',
      userInput: '',
      startTime: null,
      timeLimit: 60,
      timeLeft: 60,
      wpm: 0,
      accuracy: 100,
      currentIndex: 0,
      correctChars: 0,
      totalChars: 0,
      roomCode: null,
      playerId: null,
      players: {}
    });
    setCurrentScreen('menu');
    setShowResults(false);
    setCountdown(0);
    setRoomInput('');
    setErrorMessage('');
    setSuccessMessage('');
    setConnectionStatus('');
    if (gameTimerRef.current) {
      clearInterval(gameTimerRef.current);
    }
  };

  const displayText = () => {
    if (!gameState.currentText) return null;
    
    return gameState.currentText.split('').map((char, index) => {
      let className = 'char';
      if (index < gameState.currentIndex) {
        className += gameState.userInput[index] === char ? ' correct' : ' incorrect';
      } else if (index === gameState.currentIndex) {
        className += ' current';
      }
      
      return (
        <span key={index} className={className}>
          {char}
        </span>
      );
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 via-purple-700 to-purple-800 flex items-center justify-center p-4">
      <div className="max-w-4xl w-full bg-white bg-opacity-10 backdrop-blur-lg rounded-3xl border border-white border-opacity-20 shadow-2xl p-8">
        
        {/* Menu Screen */}
        {currentScreen === 'menu' && (
          <div className="text-center text-white">
            <h1 className="text-5xl font-light mb-12 tracking-wider">⚡ Speed Typer</h1>
            
            <button
              onClick={startSinglePlayer}
              className="w-full max-w-md block mx-auto mb-6 p-6 bg-white bg-opacity-20 hover:bg-opacity-30 border-2 border-transparent hover:border-white hover:border-opacity-50 rounded-2xl text-xl font-medium transition-all duration-300 transform hover:-translate-y-1"
            >
              <span className="text-2xl mr-3">🎯</span>
              Single Player
            </button>
            
            <button
              onClick={() => setCurrentScreen('setup')}
              className="w-full max-w-md block mx-auto mb-8 p-6 bg-white bg-opacity-20 hover:bg-opacity-30 border-2 border-transparent hover:border-white hover:border-opacity-50 rounded-2xl text-xl font-medium transition-all duration-300 transform hover:-translate-y-1"
            >
              <span className="text-2xl mr-3">🏆</span>
              Multiplayer Race
            </button>
            
            <div className="bg-white bg-opacity-10 rounded-2xl p-8 text-left">
              <h3 className="text-xl font-semibold mb-6 text-yellow-300">How to Play:</h3>
              <ul className="space-y-3">
                <li className="flex items-start">
                  <span className="text-yellow-300 mr-3">•</span>
                  <span><strong>Single Player:</strong> Practice and improve your typing speed</span>
                </li>
                <li className="flex items-start">
                  <span className="text-yellow-300 mr-3">•</span>
                  <span><strong>Multiplayer:</strong> Race against friends in real-time</span>
                </li>
                <li className="flex items-start">
                  <span className="text-yellow-300 mr-3">•</span>
                  <span>Share room codes to invite others to join</span>
                </li>
                <li className="flex items-start">
                  <span className="text-yellow-300 mr-3">•</span>
                  <span>Type as fast and accurately as you can!</span>
                </li>
              </ul>
            </div>
          </div>
        )}

        {/* Room Setup Screen */}
        {currentScreen === 'setup' && (
          <div className="text-center text-white">
            <h2 className="text-3xl font-light mb-8">Multiplayer Setup</h2>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-6">
              <input
                type="text"
                value={roomInput}
                onChange={(e) => setRoomInput(e.target.value)}
                placeholder="Enter room code or leave blank to create"
                className="px-6 py-4 text-lg rounded-xl bg-white bg-opacity-90 text-gray-800 placeholder-gray-500 min-w-0 flex-1 max-w-sm"
                onKeyPress={(e) => e.key === 'Enter' && joinOrCreateRoom()}
              />
              <button
                onClick={joinOrCreateRoom}
                className="px-8 py-4 bg-green-500 hover:bg-green-600 rounded-xl text-lg font-medium transition-colors"
              >
                Join/Create Room
              </button>
            </div>
            
            <button
              onClick={() => setCurrentScreen('menu')}
              className="px-6 py-3 bg-white bg-opacity-20 hover:bg-opacity-30 rounded-xl transition-colors"
            >
              Back to Menu
            </button>
            
            {connectionStatus && (
              <p className="mt-6 text-lg">{connectionStatus}</p>
            )}
          </div>
        )}

        {/* Game Screen */}
        {currentScreen === 'game' && (
          <div className="text-white">
            {/* Game Header */}
            <div className="flex flex-col lg:flex-row justify-between items-center mb-8 gap-6">
              <div className="flex gap-8">
                <div className="text-center">
                  <div className="text-3xl font-bold text-yellow-300">{gameState.wpm}</div>
                  <div className="text-sm">WPM</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-yellow-300">{gameState.accuracy}</div>
                  <div className="text-sm">Accuracy</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-yellow-300">{gameState.timeLeft}</div>
                  <div className="text-sm">Time</div>
                </div>
              </div>
              <button
                onClick={resetGame}
                className="px-6 py-3 bg-white bg-opacity-20 hover:bg-opacity-30 rounded-xl transition-colors"
              >
                End Game
              </button>
            </div>

            {/* Players List */}
            {gameState.isMultiplayer && Object.keys(gameState.players).length > 0 && (
              <div className="bg-white bg-opacity-10 rounded-2xl p-6 mb-6">
                <h3 className="text-lg font-semibold mb-4">Players:</h3>
                <div className="space-y-3">
                  {Object.entries(gameState.players).map(([id, player]) => (
                    <div
                      key={id}
                      className={`flex justify-between items-center p-3 rounded-xl ${
                        player.isCurrentUser ? 'bg-yellow-300 bg-opacity-30' : 'bg-white bg-opacity-10'
                      }`}
                    >
                      <div>
                        <strong>{player.name}</strong>
                        <div className="h-2 bg-white bg-opacity-30 rounded-full mt-1 w-32">
                          <div
                            className="h-full bg-green-500 rounded-full transition-all duration-300"
                            style={{
                              width: `${gameState.currentText ? (player.progress / gameState.currentText.length) * 100 : 0}%`
                            }}
                          />
                        </div>
                      </div>
                      <div>{player.wpm} WPM</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Countdown */}
            {countdown > 0 && (
              <div className="text-6xl font-bold text-center text-yellow-300 my-12">
                {countdown > 0 ? countdown : 'GO!'}
              </div>
            )}

            {/* Text Display */}
            <div className="bg-white bg-opacity-90 text-gray-800 p-8 rounded-2xl text-xl leading-relaxed font-mono mb-6 min-h-[150px] flex items-center">
              <div>
                {gameState.currentText ? displayText() : "Click 'Start Game' to begin typing..."}
              </div>
            </div>

            {/* Input Area */}
            <textarea
              ref={inputRef}
              value={gameState.userInput}
              onChange={handleInputChange}
              placeholder="Start typing here..."
              disabled={!gameState.isPlaying}
              className="w-full p-6 text-xl rounded-2xl bg-white bg-opacity-90 text-gray-800 font-mono resize-none"
              rows={4}
            />

            {/* Results */}
            {showResults && (
              <div className="bg-white bg-opacity-10 rounded-2xl p-8 mt-6 text-center">
                <h2 className="text-3xl font-bold text-yellow-300 mb-6">🎉 Race Complete!</h2>
                <div className="flex justify-center gap-12 flex-wrap mb-6">
                  <div className="text-center">
                    <div className="text-4xl font-bold text-yellow-300">{gameState.wpm}</div>
                    <div>Words Per Minute</div>
                  </div>
                  <div className="text-center">
                    <div className="text-4xl font-bold text-yellow-300">{gameState.accuracy}%</div>
                    <div>Accuracy</div>
                  </div>
                  <div className="text-center">
                    <div className="text-4xl font-bold text-yellow-300">{60 - gameState.timeLeft}s</div>
                    <div>Time Taken</div>
                  </div>
                </div>
                <button
                  onClick={resetGame}
                  className="px-8 py-4 bg-white bg-opacity-20 hover:bg-opacity-30 border-2 border-transparent hover:border-white hover:border-opacity-50 rounded-2xl text-xl font-medium transition-all duration-300"
                >
                  Back to Menu
                </button>
              </div>
            )}
          </div>
        )}

        {/* Messages */}
        {errorMessage && (
          <div className="fixed top-4 left-1/2 transform -translate-x-1/2 bg-red-500 text-white px-6 py-3 rounded-xl z-50">
            {errorMessage}
          </div>
        )}
        
        {successMessage && (
          <div className="fixed top-4 left-1/2 transform -translate-x-1/2 bg-green-500 text-white px-6 py-3 rounded-xl z-50">
            {successMessage}
          </div>
        )}
      </div>

      <style jsx>{`
        .char {
          position: relative;
        }
        .char.correct {
          background-color: #4CAF50;
          color: white;
        }
        .char.incorrect {
          background-color: #f44336;
          color: white;
        }
        .char.current {
          background-color: #2196F3;
          color: white;
          animation: blink 1s infinite;
        }
        @keyframes blink {
          0%, 50% { opacity: 1; }
          51%, 100% { opacity: 0.3; }
        }
      `}</style>
    </div>
  );
};

export default TypingSpeedTest;