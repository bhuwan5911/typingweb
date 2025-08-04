import React, { useState, useEffect, useRef } from 'react';
import { Users, Copy, Trophy, Clock, Target, Zap, CheckCircle } from 'lucide-react';
import socketService from '../services/socketService';
import { Socket } from 'socket.io-client';

interface MultiplayerRoomProps {
  roomId: string;
  playerName: string;
  onLeave: () => void;
  darkMode: boolean;
  socket: Socket;
}

interface Player {
  id: string;
  name: string;
  wpm: number;
  accuracy: number;
  finished: boolean;
  isHost: boolean;
}

const MultiplayerRoom: React.FC<MultiplayerRoomProps> = ({ roomId, playerName, onLeave, darkMode, socket }) => {
  const [players, setPlayers] = useState<Player[]>([]);
  const [gameStarted, setGameStarted] = useState(false);
  const [isHost, setIsHost] = useState(false);
  const [gameText, setGameText] = useState('');
  const [userInput, setUserInput] = useState('');
  const [wpm, setWpm] = useState(0);
  const [accuracy, setAccuracy] = useState(100);
  const [startTime, setStartTime] = useState<number | null>(null);
  const [copied, setCopied] = useState(false);
  const [finished, setFinished] = useState(false);

  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (!socket) return;

    socket.emit('join-room', { roomId, playerName });

    const handlePlayerList = (updatedPlayers: Player[]) => {
      setPlayers(updatedPlayers);
      const me = updatedPlayers.find(p => p.id === socket.id);
      if (me) setIsHost(me.isHost);
    };

    const handleGameStarted = ({ text }: { text: string }) => {
      setGameText(text);
      setGameStarted(true);
      setStartTime(Date.now());
      setUserInput('');
      setFinished(false);
      if (inputRef.current) {
        inputRef.current.disabled = false;
        inputRef.current.focus();
      }
    };

    const handlePlayerStats = (data: { playerId: string; progress: number; wpm: number }) => {
      setPlayers(prevPlayers =>
        prevPlayers.map(p =>
          p.id === data.playerId ? { ...p, progress: data.progress, wpm: data.wpm } : p
        )
      );
    };

    socket.on('players-update', handlePlayerList);
    socket.on('game-start', handleGameStarted);
    socket.on('player-progress', handlePlayerStats);

    return () => {
      socket.off('players-update', handlePlayerList);
      socket.off('game-start', handleGameStarted);
      socket.off('player-progress', handlePlayerStats);
    };
  }, [roomId, playerName, socket]);

  const handleStartGame = () => {
    const sampleTexts = [
      "Technology has revolutionized the way we communicate, work, and live our daily lives.",
      "The quick brown fox jumps over the lazy dog near the riverbank.",
      "Modern science continues to push the boundaries of human understanding."
    ];
    const randomText = sampleTexts[Math.floor(Math.random() * sampleTexts.length)];
    socket.emit('start-game', { roomId, text: randomText });
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    setUserInput(value);

    if (!startTime || finished) return;

    const elapsedMinutes = (Date.now() - startTime) / 1000 / 60;
    const correctChars = value.split('').filter((char, idx) => char === gameText[idx]).length;
    const words = correctChars / 5;
    const newWPM = Math.floor(words / elapsedMinutes);
    const newAccuracy = Math.floor((correctChars / value.length) * 100) || 0;

    setWpm(newWPM);
    setAccuracy(newAccuracy);

    const progress = (value.length / gameText.length) * 100;
    socket.emit('player-progress', { progress, wpm: newWPM });

    if (value.length === gameText.length) {
      setFinished(true);
      if (inputRef.current) inputRef.current.disabled = true;
    }
  };

  const copyRoomCode = async () => {
    try {
      await navigator.clipboard.writeText(roomId);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Copy failed');
    }
  };

  const textClass = darkMode ? 'text-white' : 'text-black';

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
        <div>
          <h2 className={`text-2xl font-bold ${textClass} flex items-center`}>
            <Users className="mr-2" size={24} />
            Room: {roomId}
          </h2>
          <p className={`text-sm ${textClass}`}>{players.length} player(s) joined</p>
        </div>

        <button
          onClick={copyRoomCode}
          className={`px-4 py-2 rounded-md ${darkMode ? 'bg-purple-600 text-white' : 'bg-purple-200 text-black'}`}
        >
          {copied ? <CheckCircle size={16} className="mr-2 inline" /> : <Copy size={16} className="mr-2 inline" />}
          {copied ? 'Copied' : 'Copy Code'}
        </button>
      </div>

      {/* Start Game Button */}
      {isHost && !gameStarted && (
        <button
          onClick={handleStartGame}
          className="bg-green-500 hover:bg-green-600 text-white px-6 py-2 rounded-lg font-bold mb-4"
        >
          Start Game
        </button>
      )}

      {/* Game Text */}
      {gameStarted && (
        <div className="bg-white text-black p-4 rounded-lg mb-4 font-mono min-h-[100px] leading-7">
          {gameText.split('').map((char, idx) => {
            let className = '';
            if (idx < userInput.length) {
              className = userInput[idx] === char ? 'text-green-500' : 'text-red-500';
            } else if (idx === userInput.length) {
              className = 'bg-yellow-200';
            }
            return (
              <span key={idx} className={className}>
                {char}
              </span>
            );
          })}
        </div>
      )}

      {/* Typing Input */}
      {gameStarted && (
        <textarea
          ref={inputRef}
          value={userInput}
          onChange={handleInputChange}
          className="w-full p-4 text-lg rounded-lg border font-mono bg-gray-100"
          rows={4}
          placeholder="Start typing here..."
        />
      )}

      {/* Stats */}
      {gameStarted && (
        <div className="flex justify-around mt-4 text-center">
          <div>
            <Zap className="mx-auto" />
            <div>{wpm} WPM</div>
          </div>
          <div>
            <Target className="mx-auto" />
            <div>{accuracy}% Accuracy</div>
          </div>
        </div>
      )}

      {/* Leaderboard */}
      <div className="mt-8">
        <h3 className={`text-xl font-semibold mb-2 ${textClass}`}>Leaderboard</h3>
        {players.map((p, idx) => (
          <div key={p.id} className="flex justify-between bg-gray-100 rounded-md p-2 mb-1">
            <span>
              {idx + 1}. {p.name} {socket && p.id === socket.id && '(You)'}
            </span>
            <span>{p.wpm} WPM, {p.accuracy}%</span>
          </div>
        ))}
      </div>

      {/* Leave Room */}
      <div className="mt-6 text-center">
        <button
          onClick={onLeave}
          className="px-6 py-2 rounded-lg bg-red-500 hover:bg-red-600 text-white"
        >
          Leave Room
        </button>
      </div>
    </div>
  );
};

export default MultiplayerRoom;
