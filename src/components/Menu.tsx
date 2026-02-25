import React from 'react';
import { motion } from 'motion/react';
import { Trophy, Users, Monitor, Play } from 'lucide-react';
import { GameMode } from '../types';

interface MenuProps {
  onSelectMode: (mode: GameMode) => void;
}

export const Menu: React.FC<MenuProps> = ({ onSelectMode }) => {
  return (
    <div className="min-h-screen bg-[#0a0a0a] flex flex-col items-center justify-center p-8 text-white">
      <motion.div
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-12"
      >
        <h1 className="text-8xl font-black tracking-tighter italic uppercase mb-2 text-transparent bg-clip-text bg-gradient-to-b from-white to-neutral-500">
          Turbo Drift
        </h1>
        <p className="text-neutral-500 font-mono tracking-widest uppercase text-sm">
          Multiplayer Racing Simulator
        </p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl w-full">
        <MenuCard
          title="Online Multiplayer"
          description="Race against players around the world in real-time."
          icon={<Users className="w-8 h-8" />}
          onClick={() => onSelectMode('multiplayer')}
          color="border-emerald-500/20 hover:border-emerald-500/50"
        />
        <MenuCard
          title="Couch Play"
          description="Local split-screen action for two players on one keyboard."
          icon={<Monitor className="w-8 h-8" />}
          onClick={() => onSelectMode('couch')}
          color="border-blue-500/20 hover:border-blue-500/50"
        />
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="mt-16 flex items-center gap-8 text-neutral-600 font-mono text-xs uppercase tracking-widest"
      >
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          Servers Online
        </div>
        <div className="flex items-center gap-2">
          <Trophy className="w-4 h-4" />
          Global Leaderboard
        </div>
      </motion.div>
    </div>
  );
};

interface MenuCardProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  onClick: () => void;
  color: string;
}

const MenuCard: React.FC<MenuCardProps> = ({ title, description, icon, onClick, color }) => (
  <motion.button
    whileHover={{ scale: 1.02, y: -5 }}
    whileTap={{ scale: 0.98 }}
    onClick={onClick}
    className={`bg-[#141414] border ${color} p-8 rounded-2xl text-left transition-all group relative overflow-hidden`}
  >
    <div className="relative z-10">
      <div className="mb-6 text-neutral-400 group-hover:text-white transition-colors">
        {icon}
      </div>
      <h3 className="text-2xl font-bold mb-2">{title}</h3>
      <p className="text-neutral-500 text-sm leading-relaxed">{description}</p>
      <div className="mt-8 flex items-center gap-2 text-xs font-bold uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity">
        Start Engine <Play className="w-3 h-3 fill-current" />
      </div>
    </div>
    <div className="absolute top-0 right-0 p-4 opacity-5">
      {icon}
    </div>
  </motion.button>
);
