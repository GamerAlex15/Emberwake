import React from 'react';
import { Relic } from '../types/game';
import { Flame, Shield, Zap, Sparkles, Sun, Compass, Target, Castle, Heart, Crown, Crosshair, Atom, Wind } from 'lucide-react';

interface ForgeModalProps {
  relics: Relic[];
  onSelectRelic: (relic: Relic) => void;
  nextVigilNumber: number;
}

export const ForgeModal: React.FC<ForgeModalProps> = ({
  relics,
  onSelectRelic,
  nextVigilNumber,
}) => {
  const getIcon = (iconName: string) => {
    switch (iconName) {
      case 'Shield': return <Shield className="w-5 h-5 text-[#ffb703]" />;
      case 'Crosshair': return <Crosshair className="w-5 h-5 text-[#ffb703]" />;
      case 'Flame': return <Flame className="w-5 h-5 text-[#ffb703]" />;
      case 'Zap': return <Zap className="w-5 h-5 text-[#ffb703]" />;
      case 'Compass': return <Compass className="w-5 h-5 text-[#ffb703]" />;
      case 'Sun': return <Sun className="w-5 h-5 text-[#ffb703]" />;
      case 'Atom': return <Atom className="w-5 h-5 text-[#ffb703]" />;
      case 'Sparkles': return <Sparkles className="w-5 h-5 text-[#ffb703]" />;
      case 'Wind': return <Wind className="w-5 h-5 text-[#ffb703]" />;
      case 'Target': return <Target className="w-5 h-5 text-[#ffb703]" />;
      case 'Castle': return <Castle className="w-5 h-5 text-[#ffb703]" />;
      case 'Heart': return <Heart className="w-5 h-5 text-[#ffb703]" />;
      case 'Crown': return <Crown className="w-5 h-5 text-[#ffb703]" />;
      default: return <Sun className="w-5 h-5 text-[#ffb703]" />;
    }
  };

  return (
    <div className="fixed inset-0 z-30 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md text-[#f5efe6] font-sans">
      <div className="max-w-2xl w-full bg-[#0a0d14] border border-neutral-800 p-6 md:p-8 rounded-xl shadow-2xl flex flex-col items-center text-center">
        {/* Header */}
        <div className="text-xs font-mono uppercase tracking-widest text-[#ffb703] flex items-center gap-1.5 mb-1">
          <Sun className="w-4 h-4 text-[#ffb703]" />
          <span>CELESTIAL FORGE</span>
        </div>

        <h2 className="font-display font-bold text-2xl md:text-3xl text-neutral-100">
          Vigil Endured · Claim a Solar Relic
        </h2>

        <p className="text-xs text-neutral-400 max-w-md mt-1 mb-6">
          The dying star grants you a fragment of its primeval brilliance before Vigil {nextVigilNumber} begins.
        </p>

        {/* 3 Relic Choice Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 w-full mb-6">
          {relics.map((relic) => {
            const rarityColor =
              relic.rarity === 'LEGENDARY'
                ? 'text-[#f59e0b]'
                : relic.rarity === 'RARE'
                ? 'text-[#a855f7]'
                : 'text-neutral-400';

            return (
              <div
                key={relic.id}
                className="bg-neutral-900/60 border border-neutral-800 hover:border-[#ffb703]/60 p-4 rounded-lg flex flex-col justify-between text-left transition-all hover:bg-neutral-900/90 group"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div className="p-2 bg-neutral-800/80 rounded border border-neutral-700/50">
                      {getIcon(relic.icon)}
                    </div>
                    <span className={`text-[10px] font-mono uppercase tracking-wider ${rarityColor}`}>
                      {relic.rarity}
                    </span>
                  </div>

                  <h3 className="font-display font-bold text-sm text-neutral-200 group-hover:text-[#ffb703] transition-colors">
                    {relic.name}
                  </h3>

                  <p className="text-xs text-neutral-400 mt-2 leading-relaxed">
                    {relic.description}
                  </p>
                </div>

                <button
                  onClick={() => onSelectRelic(relic)}
                  className="mt-4 w-full py-2 px-3 bg-neutral-800 hover:bg-[#ffb703] hover:text-black text-neutral-200 text-xs font-mono font-medium rounded transition-colors cursor-pointer whitespace-nowrap"
                >
                  Attune Blessing
                </button>
              </div>
            );
          })}
        </div>

        <div className="text-[11px] font-mono text-neutral-500">
          Choosing an attunement also partially restores the Sparkbearer and Hearth integrity.
        </div>
      </div>
    </div>
  );
};
