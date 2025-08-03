import React, { useState, useEffect } from 'react';
import { Users, Plus, LogIn, Loader2 } from 'lucide-react';
import io from 'socket.io-client';

interface MultiplayerMenuProps {
  onJoinRoom: (roomId: string, playerName: string) => void;
  darkMode: boolean;
}

const MultiplayerMenu: React.FC<MultiplayerMenuProps> = ({ onJoinRoom, darkMode }) => {
  const [playerName, setPlayerName] = useState('');
  const [roomId, setRoomId] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [socket] = useState(() => io('http://localhost:5000'));

  useEffect(() => {
    const savedName = localStorage.getItem('playerName');
    if (savedName) {
      setPlayerName(savedName);
    } else {
      setPlayerName(`Player${Math.floor(Math.random() * 1000)}`);
    }

    socket.on('room-created', (data) => {
      console.log('Room created:', data);
      setIsLoading(false);
      setSuccess(`Room created: ${data.roomCode}`);
      setError('');
      localStorage.setItem('playerName', playerName);
      setTimeout(() => {
        onJoinRoom(data.roomCode, playerName);
      }, 1000);
    });

    socket.on('room-joined', (data) => {
      console.log('Room joined:', data);
      setIsLoading(false);
      setSuccess(`Joined room: ${data.roomCode}`);
      setError('');
      localStorage.setItem('playerName', playerName);
      setTimeout(() => {
        onJoinRoom(data.roomCode, playerName);
      }, 1000);
    });

    socket.on('room-error', (data) => {
      console.log('Room error:', data);
      setIsLoading(false);
      setError(data.message);
      setSuccess('');
    });

    return () => {
      socket.disconnect();
    };
  }, [socket, onJoinRoom]);

  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => setError(''), 5000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  useEffect(() => {
    if (success && !success.includes('Room created') && !success.includes('Joined room')) {
      const timer = setTimeout(() => setSuccess(''), 3000);
      return () => clearTimeout(timer);
    }
  }, [success]);

  const handleCreateRoom = () => {
    if (!playerName.trim()) {
      setError('Please enter your name');
      return;
    }
    setIsLoading(true);
    setError('');
    setSuccess('Creating room...');
    socket.emit('create-room', { playerName: playerName.trim() });
  };

  const handleJoinRoom = () => {
    if (!playerName.trim()) {
      setError('Please enter your name');
      return;
    }
    if (!roomId.trim()) {
      setError('Please enter a room code');
      return;
    }
    setIsLoading(true);
    setError('');
    setSuccess('Joining room...');
    socket.emit('join-room', { 
      roomCode: roomId.trim().toUpperCase(), 
      playerName: playerName.trim() 
    });
  };

  const inputClass = darkMode
    ? 'w-full px-4 py-3 rounded-lg bg-gray-800 border border-gray-600 text-white placeholder-gray-400 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20'
    : 'w-full px-4 py-3 rounded-lg bg-white/20 backdrop-blur-sm border border-white/30 text-white placeholder-white/70 focus:border-white focus:ring-2 focus:ring-white/20';

  const buttonClass = darkMode
    ? 'w-full px-6 py-3 rounded-lg font-medium transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed'
    : 'w-full px-6 py-3 rounded-lg font-medium transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed';

  const primaryButtonClass = darkMode
    ? `${buttonClass} bg-purple-600 hover:bg-purple-700 text-white`
    : `${buttonClass} bg-white/20 hover:bg-white/30 text-white border border-white/30`;

  const secondaryButtonClass = darkMode
    ? `${buttonClass} bg-green-600 hover:bg-green-700 text-white`
    : `${buttonClass} bg-green-500/20 hover:bg-green-500/30 text-white border border-green-400/30`;

  return (
    <div className="p-8 max-w-md mx-auto">
      <div className="text-center mb-8">
        <div className="flex justify-center mb-4">
          <Users size={48} className={darkMode ? 'text-purple-400' : 'text-white'} />
        </div>
        <h2 className="text-2xl font-bold mb-2 text-white">Multiplayer Racing</h2>
        <p className="text-sm text-white/80">Compete with friends in real-time typing races</p>
      </div>

      {error && (
        <div className="mb-4 p-3 rounded-lg bg-red-500/20 border border-red-500/50 text-red-200">
          {error}
        </div>
      )}
      {success && (
        <div className="mb-4 p-3 rounded-lg bg-green-500/20 border border-green-500/50 text-green-200">
          {success}
        </div>
      )}

      <div className="space-y-6">
        <div>
          <label className="block text-sm font-medium mb-2 text-white/80">Your Name</label>
          <input
            type="text"
            value={playerName}
            onChange={(e) => setPlayerName(e.target.value)}
            placeholder="Enter your name"
            className={inputClass}
            disabled={isLoading}
            maxLength={20}
          />
        </div>

        <div>
          <button
            onClick={handleCreateRoom}
            disabled={isLoading}
            className={primaryButtonClass}
          >
            {isLoading ? (
              <div className="flex items-center justify-center">
                <Loader2 size={20} className="animate-spin mr-2" />
                Creating...
              </div>
            ) : (
              <div className="flex items-center justify-center">
                <Plus size={20} className="mr-2" />
                Create New Room
              </div>
            )}
          </button>
        </div>

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-white/30" />
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-transparent text-white/70">or</span>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2 text-white/80">Room Code</label>
          <input
            type="text"
            value={roomId}
            onChange={(e) => setRoomId(e.target.value.toUpperCase())}
            placeholder="Enter room code"
            className={inputClass}
            disabled={isLoading}
            maxLength={6}
          />
        </div>

        <button
          onClick={handleJoinRoom}
          disabled={isLoading}
          className={secondaryButtonClass}
        >
          {isLoading ? (
            <div className="flex items-center justify-center">
              <Loader2 size={20} className="animate-spin mr-2" />
              Joining...
            </div>
          ) : (
            <div className="flex items-center justify-center">
              <LogIn size={20} className="mr-2" />
              Join Room
            </div>
          )}
        </button>
      </div>

      <div className="mt-8 p-4 rounded-lg bg-white/10">
        <h3 className="text-sm font-semibold mb-2 text-white">How it works:</h3>
        <ul className="text-xs space-y-1 text-white/80">
          <li>• Create a room to get a shareable code</li>
          <li>• Share the code with friends to join</li>
          <li>• Race together in real-time!</li>
        </ul>
      </div>
    </div>
  );
};

export default MultiplayerMenu;