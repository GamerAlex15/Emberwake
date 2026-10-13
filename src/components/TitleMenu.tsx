import React, { useState } from 'react';
import { Difficulty } from '../types/game';
import { DIFFICULTY_MODIFIERS } from '../game/constants';
import { Flame, Shield, Sun, BookOpen, Compass, Zap, Crosshair } from 'lucide-react';

interface TitleMenuProps {
  onStart: (diff: Difficulty) => void;
  onOpenBestiary: () => void;
  autoAim: boolean;
  setAutoAim: (val: boolean) => void;
  autoFire: boolean;
  setAutoFire: (val: boolean) => void;
}

export const TitleMenu: React.FC<TitleMenuProps> = ({
  onStart,
  onOpenBestiary,
  autoAim,
  setAutoAim,
  autoFire,
  setAutoFire,
}) => {
  const [selectedDiff, setSelectedDiff] = useState<Difficulty>('TORCHBEARER');

  return (
    <div className="fixed inset-0 z-30 flex items-center justify-center p-4 bg-[#05070b]/90 backdrop-blur-md text-[#f4eee5] overflow-y-auto">
      <div className="max-w-2xl w-full my-auto py-8 flex flex-col items-center text-center">
        {/* Decorative Solar Icon */}
        <div className="relative mb-4 flex items-center justify-center">
          <div className="absolute w-24 h-24 rounded-full bg-[#ffb703]/10 blur-xl animate-pulse" />
          <Sun className="w-12 h-12 text-[#ffb703] relative z-10" />
        </div>

        {/* Title & Tagline */}
        <h1 className="font-display font-extrabold text-4xl sm:text-5xl md:text-6xl tracking-widest text-[#ffdd55] drop-shadow-[0_2px_12px_rgba(255,183,3,0.3)]">
          EMBERWAKE
        </h1>

        <p className="mt-2 text-sm sm:text-base font-sans font-light tracking-wide text-neutral-300 max-w-lg">
          A twin-stick siege in the ruins of a dead sun. You are the last light. Eight vigils, then the Hollow King.
        </p>

        {/* Core Lore Accordion / Hook */}
        <div className="mt-6 text-xs text-neutral-400 bg-neutral-900/60 border border-neutral-800/80 p-4 rounded-xl max-w-xl text-left leading-relaxed">
          <div className="flex items-center gap-2 text-[#ffb703] font-mono font-medium mb-1.5">
            <Flame className="w-3.5 h-3.5" />
            <span>THE SACRED CHARGE</span>
          </div>
          The sun collapsed into obsidian centuries ago. Protect the central <strong>Solar Hearth</strong> at all costs. Slain void shades drop radiant <strong>Embers</strong>—gather them and return to the altar to stoke the flame, widen your sanctuary's light perimeter, and repair the wards.
        </div>

        {/* Difficulty Selection */}
        <div className="mt-6 w-full max-w-xl text-left">
          <div className="text-xs font-mono text-neutral-400 uppercase tracking-wider mb-2">
            Select Vigil Difficulty
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            {(Object.keys(DIFFICULTY_MODIFIERS) as Difficulty[]).map((diffKey) => {
              const diff = DIFFICULTY_MODIFIERS[diffKey];
              const isSelected = selectedDiff === diffKey;
              return (
                <button
                  key={diffKey}
                  onClick={() => setSelectedDiff(diffKey)}
                  className={`p-3 rounded-lg border text-left transition-colors cursor-pointer flex flex-col justify-between ${
                    isSelected
                      ? 'bg-[#ffb703]/10 border-[#ffb703] text-white shadow-sm'
                      : 'bg-neutral-900/40 border-neutral-800 text-neutral-400 hover:text-neutral-200 hover:bg-neutral-900/70'
                  }`}
                >
                  <span className={`text-xs font-mono font-semibold ${isSelected ? 'text-[#ffb703]' : ''}`}>
                    {diff.label}
                  </span>
                  <span className="text-[11px] text-neutral-400 mt-1 leading-snug">
                    {diff.description}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Accessibility & Toggles */}
        <div className="mt-5 flex flex-wrap items-center justify-center gap-4 text-xs font-mono text-neutral-400">
          <label className="flex items-center gap-2 cursor-pointer hover:text-neutral-200">
            <input
              type="checkbox"
              checked={autoAim}
              onChange={(e) => setAutoAim(e.target.checked)}
              className="accent-[#ffb703] rounded cursor-pointer"
            />
            <Crosshair className="w-3.5 h-3.5 text-[#ffb703]" />
            <span>Auto-Aim Assistance</span>
          </label>
          <span className="text-neutral-700" aria-hidden="true">·</span>
          <label className="flex items-center gap-2 cursor-pointer hover:text-neutral-200">
            <input
              type="checkbox"
              checked={autoFire}
              onChange={(e) => setAutoFire(e.target.checked)}
              className="accent-[#ffb703] rounded cursor-pointer"
            />
            <Zap className="w-3.5 h-3.5 text-[#ffb703]" />
            <span>Continuous Auto-Fire</span>
          </label>
        </div>

        {/* Primary CTA Buttons */}
        <div className="mt-8 flex flex-col sm:flex-row items-center gap-3 w-full max-w-sm">
          <button
            onClick={() => onStart(selectedDiff)}
            className="w-full py-3 px-6 bg-gradient-to-r from-[#d97706] to-[#f59e0b] hover:from-[#b45309] hover:to-[#d97706] text-black font-semibold text-sm tracking-wide rounded-lg shadow-lg hover:shadow-[#ffb703]/20 transition-all cursor-pointer flex items-center justify-center gap-2"
          >
            <Flame className="w-4 h-4 fill-black" />
            <span>Kindle the Light</span>
          </button>

          <button
            onClick={onOpenBestiary}
            className="w-full sm:w-auto py-3 px-4 bg-neutral-900/80 hover:bg-neutral-800 border border-neutral-700 rounded-lg text-neutral-300 hover:text-white text-xs font-mono transition-colors cursor-pointer flex items-center justify-center gap-1.5 whitespace-nowrap"
          >
            <BookOpen className="w-3.5 h-3.5 text-[#ffb703]" />
            <span>Sanctum Codex</span>
          </button>
        </div>

        {/* Controls Cheatsheet */}
        <div className="mt-8 text-neutral-500 text-[11px] font-mono flex flex-wrap justify-center gap-x-4 gap-y-1">
          <span>Move: WASD / Arrows</span>
          <span>·</span>
          <span>Aim: Mouse / Touch Stick</span>
          <span>·</span>
          <span>Fire: Left Click / Space</span>
          <span>·</span>
          <span>Dash: Space / Right Click</span>
          <span>·</span>
          <span>Supernova: Q / E</span>
        </div>
      </div>
    </div>
  );
};
