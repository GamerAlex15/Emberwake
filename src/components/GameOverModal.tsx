import React from 'react';
import { GameEngine } from '../game/gameEngine';
import { RotateCcw, Home, Sun, Skull } from 'lucide-react';

interface GameOverModalProps {
  engine: GameEngine;
  onRestart: () => void;
  onMainMenu: () => void;
}

export const GameOverModal: React.FC<GameOverModalProps> = ({
  engine,
  onRestart,
  onMainMenu,
}) => {
  const isVictory = engine.state === 'VICTORY';
  const stats = engine.stats;

  const minutes = Math.floor(stats.timeSurvived / 60);
  const seconds = Math.floor(stats.timeSurvived % 60);
  const timeFormatted = `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;

  return (
    <div className="fixed inset-0 z-30 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md text-[#f5efe6] font-sans">
      <div className="max-w-lg w-full bg-[#0a0d14] border border-neutral-800 p-6 sm:p-8 rounded-xl shadow-2xl flex flex-col items-center text-center">
        {/* Status Emblem */}
        <div className="mb-4">
          {isVictory ? (
            <div className="w-16 h-16 rounded-full bg-[#ffb703]/20 flex items-center justify-center text-[#ffb703] border border-[#ffb703]/50">
              <Sun className="w-8 h-8" />
            </div>
          ) : (
            <div className="w-16 h-16 rounded-full bg-[#d90429]/20 flex items-center justify-center text-[#d90429] border border-[#d90429]/50">
              <Skull className="w-8 h-8" />
            </div>
          )}
        </div>

        {/* Title */}
        <h2 className="font-display font-extrabold text-2xl sm:text-3xl text-neutral-100">
          {isVictory ? 'The Sun Rekindled' : 'The Light Extinguished'}
        </h2>

        <p className="text-xs text-neutral-400 mt-2 max-w-sm leading-relaxed">
          {isVictory
            ? 'Eight vigils endured. The Hollow King has fallen, and primeval dawn returns to the dead sun.'
            : 'The darkness broke the sanctum wards. The last ember fades into cosmic ash.'}
        </p>

        {/* Run Statistics Grid (Tabular Numerals) */}
        <div className="w-full my-6 bg-neutral-900/60 border border-neutral-800 rounded-lg p-4 grid grid-cols-2 gap-3 text-left font-mono">
          <div>
            <div className="text-[10px] text-neutral-500 uppercase">Vigils Cleared</div>
            <div className="text-base font-bold tabular-nums text-neutral-200">
              {stats.vigilsCompleted} / 8
            </div>
          </div>

          <div>
            <div className="text-[10px] text-neutral-500 uppercase">Shades Defeated</div>
            <div className="text-base font-bold tabular-nums text-neutral-200">
              {stats.shadesDefeated.toLocaleString()}
            </div>
          </div>

          <div>
            <div className="text-[10px] text-neutral-500 uppercase">Embers Stoked</div>
            <div className="text-base font-bold tabular-nums text-[#ffb703]">
              {stats.embersStoked.toLocaleString()}
            </div>
          </div>

          <div>
            <div className="text-[10px] text-neutral-500 uppercase">Survival Time</div>
            <div className="text-base font-bold tabular-nums text-neutral-200">
              {timeFormatted}
            </div>
          </div>

          <div className="col-span-2 pt-2 border-t border-neutral-800 flex items-center justify-between">
            <span className="text-xs text-neutral-400 uppercase">Final Score</span>
            <span className="text-lg font-bold tabular-nums text-[#ffdd55]">
              {stats.score.toLocaleString()}
            </span>
          </div>
        </div>

        {/* Attuned Relics summary if any */}
        {stats.relicsAcquired.length > 0 && (
          <div className="w-full mb-6 text-left">
            <div className="text-[10px] font-mono text-neutral-500 uppercase mb-1.5">
              Relics Attuned ({stats.relicsAcquired.length})
            </div>
            <div className="flex flex-wrap gap-1 text-[11px] font-mono text-neutral-400">
              {stats.relicsAcquired.map((r, i) => (
                <span key={i} className="bg-neutral-900 border border-neutral-800 px-2 py-0.5 rounded">
                  {r}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Primary CTA Buttons */}
        <div className="flex flex-col sm:flex-row items-center gap-3 w-full">
          <button
            onClick={onRestart}
            className="w-full py-3 px-6 bg-[#ffb703] hover:bg-[#e09f00] text-black font-semibold text-xs font-mono rounded transition-colors cursor-pointer flex items-center justify-center gap-2 whitespace-nowrap"
          >
            <RotateCcw className="w-4 h-4 fill-black" />
            <span>Kindle Again</span>
          </button>

          <button
            onClick={onMainMenu}
            className="w-full sm:w-auto py-3 px-4 bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 text-neutral-300 hover:text-white text-xs font-mono rounded transition-colors cursor-pointer flex items-center justify-center gap-1.5 whitespace-nowrap"
          >
            <Home className="w-4 h-4 text-neutral-400" />
            <span>Title Menu</span>
          </button>
        </div>
      </div>
    </div>
  );
};
