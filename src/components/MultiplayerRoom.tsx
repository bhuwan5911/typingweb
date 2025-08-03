import React, { useState, useEffect, useRef } from 'react';
import { Users, Copy, Target, Zap, CheckCircle } from 'lucide-react';
import io from 'socket.io-client';

const socket = io('http://localhost:5000');

interface MultiplayerRoomProps {
  roomId: string;
  playerName: string;
  onLeave: () => void;
  darkMode: boolean;
}

interface Player {
  name: string;
  progress: number;
  wpm: number;
  socketId: string;
}

const MultiplayerRoom: React.FC<MultiplayerRoomProps> = ({ roomId, playerName, onLeave, darkMode }) => {
  const [players, setPlayers] = useState<{ [key: string]: Player }>({});
  const [gameStarted, setGameStarted] = useState(false);
  const [gameText, setGameText] = useState('');
  const [userInput, setUserInput] = useState('');
  const [wpm, setWpm] = useState(0);
  const [accuracy, setAccuracy] = useState(100);
  const [startTime, setStartTime] = useState<number | null>(null);
  const [copied, setCopied] = useState(false);
  const [finished, setFinished] = useState(false);

  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    console.log('Joining room:', roomId, 'Player:', playerName);
    socket.emit('join-room', { roomCode: roomId, playerName });

    socket.on('players-update', (updatedPlayers: { [key: string]: Player }) => {
      console.log('Players updated:', updatedPlayers);
      setPlayers(updatedPlayers);
    });

    socket.on('game-start', ({ text }: { text: string }) => {
      console.log('Game started with text:', text);
      setGameText(text);
      setGameStarted(true);
      setStartTime(Date.now());
      setUserInput('');
      setFinished(false);
      if (inputRef.current) {
        inputRef.current.disabled = false;
        inputRef.current.focus();
      }
    });

    socket.on('player-progress', ({ playerId, progress, wpm }: { playerId: string; progress: number; wpm: number }) => {
      console.log('Player progress:', playerId, progress, wpm);
      setPlayers(prev => ({
        ...prev,
        [playerId]: {
          ...prev[playerId],
          progress,
          wpm
        }
      }));
    });

    socket.on('game-end', (results: any[]) => {
      console.log('Game ended:', results);
    });

    return () => {
      socket.off('players-update');
      socket.off('game-start');
      socket.off('player-progress');
      socket.off('game-end');
    };
  }, [roomId, playerName]);

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    setUserInput(value);

    if (!startTime || finished) return;

    const elapsedMinutes = (Date.now() - startTime) / 1000 / 60;
    const correctChars = value.split('').filter((char, idx) => char === gameText[idx]).length;
    const words = correctChars / 5;
    const newWPM = Math.floor(words / elapsedMinutes);
    const newAccuracy = Math.floor((correctChars / value.length) * 100);

    setWpm(newWPM);
    setAccuracy(newAccuracy);

    socket.emit('player-progress', {
      progress: value.length,
      wpm: newWPM
    });

    if (value === gameText) {
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
  const playersArray = Object.values(players);

  return (
    <div className="p-6">
      <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
        <div>
          <h2 className={`text-2xl font-bold ${textClass} flex items-center`}>
            <Users className="mr-2" size={24} />
            Room: {roomId}
          </h2>
          <p className={`text-sm ${textClass}`}>{playersArray.length} player(s) joined</p>
        </div>

        <button
          onClick={copyRoomCode}
          className={`px-4 py-2 rounded-md ${darkMode ? 'bg-purple-600 text-white' : 'bg-purple-200 text-black'}`}
        >
          {copied ? <CheckCircle size={16} className="mr-2 inline" /> : <Copy size={16} className="mr-2 inline" />}
          {copied ? 'Copied' : 'Copy Code'}
        </button>
      </div>

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

      <div className="mt-8">
        <h3 className={`text-xl font-semibold mb-2 ${textClass}`}>Leaderboard</h3>
        {playersArray.map((p, idx) => (
          <div key={p.socketId} className="flex justify-between bg-gray-100 rounded-md p-2 mb-1">
            <span>
              {idx + 1}. {p.name} {p.socketId === socket.id && '(You)'}
            </span>
            <span>{p.wpm} WPM</span>
          </div>
        ))}
      </div>

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