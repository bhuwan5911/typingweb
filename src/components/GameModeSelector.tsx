import React from 'react';
import { Gamepad2, Bot, Brain, Users, Eye } from 'lucide-react';

type GameMode = 'normal' | 'bot-race' | 'memory' | 'blind' | 'multiplayer';

interface GameModeSelectorProps {
  currentMode: GameMode;
  onModeChange: (mode: GameMode) => void;
  darkMode: boolean;
}

const GameModeSelector: React.FC<GameModeSelectorProps> = ({ currentMode, onModeChange, darkMode }) => {
  const modes = [
    { id: 'normal' as GameMode, name: 'Normal', icon: Gamepad2, description: 'Standard typing test' },
    { id: 'bot-race' as GameMode, name: 'Bot Race', icon: Bot, description: 'Race against AI' },
    { id: 'memory' as GameMode, name: 'Memory', icon: Brain, description: 'Type from memory' },
    { id: 'multiplayer' as GameMode, name: 'Multiplayer', icon: Users, description: 'Race with friends' },
  ];

  return (
    <div className={`backdrop-blur-lg rounded-2xl p-6 shadow-2xl border transition-all duration-300 ${
      darkMode 
        ? 'bg-white/10 border-white/20' 
        : 'bg-white/20 border-white/30'
    }`}>
      <h3 className={`text-lg font-bold mb-4 ${darkMode ? 'text-white' : 'text-white'}`}>
        🎮 Game Modes
      </h3>
      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {modes.map((mode) => {
          const Icon = mode.icon;
          const isActive = currentMode === mode.id;
          
          return (
            <button
              key={mode.id}
              onClick={() => onModeChange(mode.id)}
              className={`p-4 rounded-lg text-center transition-all duration-200 hover:scale-105 ${
                isActive
                  ? darkMode
                    ? 'bg-purple-600 text-white border-2 border-purple-400'
                    : 'bg-blue-500 text-white border-2 border-blue-300'
                  : darkMode
                    ? 'bg-white/10 text-white hover:bg-white/20 border border-white/20'
                    : 'bg-white/20 text-white hover:bg-white/30 border border-white/30'
              }`}
            >
              <Icon size={24} className="mx-auto mb-2" />
              <div className="font-semibold text-sm">{mode.name}</div>
              <div className={`text-xs mt-1 ${
                isActive 
                  ? 'text-white/90' 
                  : darkMode ? 'text-gray-300' : 'text-white/80'
              }`}>
                {mode.description}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default GameModeSelector;