import React, { useState, useEffect } from 'react';
import { Users, Plus, LogIn, Loader2, Wifi, WifiOff } from 'lucide-react';
import socketService from '../services/socketService';

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
  const [isConnected, setIsConnected] = useState(false);
  const [isServerAvailable, setIsServerAvailable] = useState(false);

  // Initialize socket connection and check server health
  useEffect(() => {
    const socketInstance = socketService.connect();

    // Check connection status and server health
    const checkConnection = async () => {
      const connected = socketService.isSocketConnected();
      const serverHealth = await socketService.checkServerHealth();
      
      setIsConnected(connected);
      setIsServerAvailable(serverHealth);
      
      if (!serverHealth && !error) {
        setError('Server is not available. Please check if the backend server is running.');
      } else if (!connected && serverHealth && !error) {
        setError('Unable to connect to server. Please try refreshing the page.');
      }
    };

    // Initial check
    checkConnection();

    // Set up periodic connection check
    const interval = setInterval(checkConnection, 5000);

    return () => {
      clearInterval(interval);
      // Clean up socket listeners when component unmounts
      socketService.removeListener('room-created');
      socketService.removeListener('room-joined');
      socketService.removeListener('room-error');
    };
  }, []);

  // Set up socket event listeners
  useEffect(() => {
    const savedName = localStorage.getItem('playerName');
    if (savedName) {
      setPlayerName(savedName);
    } else {
      setPlayerName(`Player${Math.floor(Math.random() * 1000)}`);
    }

    const handleRoomCreated = (data: any) => {
      setIsLoading(false);
      setSuccess(`Room created: ${data.roomCode}`);
      setError('');
      localStorage.setItem('playerName', playerName);
      setTimeout(() => {
        onJoinRoom(data.roomCode, playerName);
      }, 1000);
    };

    const handleRoomJoined = (data: any) => {
      setIsLoading(false);
      setSuccess(`Joined room: ${data.roomCode}`);
      setError('');
      localStorage.setItem('playerName', playerName);
      setTimeout(() => {
        onJoinRoom(data.roomCode, playerName);
      }, 1000);
    };

    const handleRoomError = (data: any) => {
      setIsLoading(false);
      setError(data.message);
      setSuccess('');
    };

    // Use safe methods to add listeners
    socketService.addListener('room-created', handleRoomCreated);
    socketService.addListener('room-joined', handleRoomJoined);
    socketService.addListener('room-error', handleRoomError);

    return () => {
      // Use safe methods to remove listeners
      socketService.removeListener('room-created', handleRoomCreated);
      socketService.removeListener('room-joined', handleRoomJoined);
      socketService.removeListener('room-error', handleRoomError);
    };
  }, [onJoinRoom, playerName]);

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
    if (!socketService.isSocketConnected()) {
      setError('Not connected to server. Please try again.');
      return;
    }
    setIsLoading(true);
    setError('');
    setSuccess('Creating room...');
    
    try {
      socketService.emit('create-room', { playerName: playerName.trim() });
    } catch (error) {
      console.error('Error creating room:', error);
      setIsLoading(false);
      setError('Failed to create room. Please try again.');
    }
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
    if (!socketService.isSocketConnected()) {
      setError('Not connected to server. Please try again.');
      return;
    }
    setIsLoading(true);
    setError('');
    setSuccess('Joining room...');
    
    try {
      socketService.emit('join-room', { 
        roomCode: roomId.trim().toUpperCase(), 
        playerName: playerName.trim() 
      });
    } catch (error) {
      console.error('Error joining room:', error);
      setIsLoading(false);
      setError('Failed to join room. Please try again.');
    }
  };

  const handleRetryConnection = async () => {
    setError('');
    setIsLoading(true);
    
    try {
      const serverHealth = await socketService.checkServerHealth();
      setIsServerAvailable(serverHealth);
      
      if (serverHealth) {
        const socketInstance = socketService.connect();
        const connected = socketService.isSocketConnected();
        setIsConnected(connected);
        
        if (connected) {
          setSuccess('Successfully connected to server!');
        } else {
          setError('Server is available but connection failed. Please try refreshing the page.');
        }
      } else {
        setError('Server is not available. Please check if the backend server is running.');
      }
    } catch (error) {
      setError('Failed to check server status. Please try again.');
    } finally {
      setIsLoading(false);
    }
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
        
        {/* Connection Status */}
        <div className="mt-4 flex items-center justify-center space-x-2">
          {isConnected ? (
            <div className="flex items-center text-green-400">
              <Wifi size={16} />
              <span className="ml-1 text-sm">Connected</span>
            </div>
          ) : (
            <div className="flex items-center text-red-400">
              <WifiOff size={16} />
              <span className="ml-1 text-sm">Disconnected</span>
            </div>
          )}
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-6 p-4 bg-red-500/20 border border-red-500/30 rounded-lg">
          <div className="flex items-center justify-between">
            <p className="text-red-300 text-sm">{error}</p>
            <button
              onClick={handleRetryConnection}
              disabled={isLoading}
              className="ml-2 px-3 py-1 bg-red-600 hover:bg-red-700 text-white text-xs rounded transition-colors disabled:opacity-50"
            >
              {isLoading ? <Loader2 size={12} className="animate-spin" /> : 'Retry'}
            </button>
          </div>
        </div>
      )}

      {/* Success Message */}
      {success && (
        <div className="mb-6 p-4 bg-green-500/20 border border-green-500/30 rounded-lg">
          <p className="text-green-300 text-sm">{success}</p>
        </div>
      )}

      {/* Connection Warning */}
      {!isServerAvailable && (
        <div className="mb-6 p-4 bg-yellow-500/20 border border-yellow-500/30 rounded-lg">
          <div className="flex items-center">
            <WifiOff size={16} className="text-yellow-400 mr-2" />
            <div>
              <p className="text-yellow-300 text-sm font-medium">Server Unavailable</p>
              <p className="text-yellow-300/80 text-xs">The multiplayer server is not running. Please start the backend server.</p>
            </div>
          </div>
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
