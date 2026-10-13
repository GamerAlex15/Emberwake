import React from 'react';
import { GameEngine } from '../game/gameEngine';
import { soundEngine } from '../audio/soundEngine';
import { Volume2, VolumeX, RotateCcw, Play, Home, Crosshair, Zap } from 'lucide-react';

interface PauseModalProps {
  engine: GameEngine;
  onResume: () => void;
  onRestart: () => void;
  onMainMenu: () => void;
}

export const PauseModal: React.FC<PauseModalProps> = ({
  engine,
  onResume,
  onRestart,
  onMainMenu,
}) => {
  const [volume, setVolume] = React.useState(soundEngine.getVolume());
  const [muted, setMuted] = React.useState(soundEngine.getMuted());
  const [autoAim, setAutoAim] = React.useState(engine.autoAim);
  const [autoFire, setAutoFire] = React.useState(engine.autoFire);

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    setVolume(val);
    soundEngine.setVolume(val);
  };

  const handleToggleMute = () => {
    const next = !muted;
    setMuted(next);
    soundEngine.setMuted(next);
  };

  const handleToggleAutoAim = (e: React.ChangeEvent<HTMLInputElement>) => {
    setAutoAim(e.target.checked);
    engine.autoAim = e.target.checked;
  };

  const handleToggleAutoFire = (e: React.ChangeEvent<HTMLInputElement>) => {
    setAutoFire(e.target.checked);
    engine.autoFire = e.target.checked;
  };

  return (
    <div className="fixed inset-0 z-30 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md text-[#f5efe6] font-sans">
      <div className="max-w-md w-full bg-[#0a0d14] border border-neutral-800 p-6 rounded-xl shadow-2xl flex flex-col">
        <h2 className="font-display font-bold text-2xl text-center text-neutral-100 mb-1">
          Vigil Paused
        </h2>
        <p className="text-xs text-neutral-400 text-center mb-6">
          Vigil {engine.getCurrentVigil().number} · {engine.getCurrentVigil().name}
        </p>

        {/* Action Buttons */}
        <div className="flex flex-col gap-2 mb-6">
          <button
            onClick={onResume}
            className="w-full py-2.5 px-4 bg-[#ffb703] hover:bg-[#e09f00] text-black font-semibold text-xs font-mono rounded transition-colors cursor-pointer flex items-center justify-center gap-2"
          >
            <Play className="w-4 h-4 fill-black" />
            <span>Resume Vigil</span>
          </button>

          <button
            onClick={onRestart}
            className="w-full py-2.5 px-4 bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 text-neutral-300 hover:text-white text-xs font-mono rounded transition-colors cursor-pointer flex items-center justify-center gap-2"
          >
            <RotateCcw className="w-4 h-4 text-neutral-400" />
            <span>Restart Vigil</span>
          </button>

          <button
            onClick={onMainMenu}
            className="w-full py-2.5 px-4 bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 text-neutral-300 hover:text-white text-xs font-mono rounded transition-colors cursor-pointer flex items-center justify-center gap-2"
          >
            <Home className="w-4 h-4 text-neutral-400" />
            <span>Return to Title Menu</span>
          </button>
        </div>

        {/* Audio & Controls Settings */}
        <div className="border-t border-neutral-800/80 pt-4 flex flex-col gap-3 text-xs">
          {/* Audio volume */}
          <div className="flex items-center justify-between">
            <span className="font-mono text-neutral-400 flex items-center gap-1.5">
              {muted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
              <span>Master Audio</span>
            </span>
            <div className="flex items-center gap-3">
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={volume}
                onChange={handleVolumeChange}
                className="w-24 accent-[#ffb703] cursor-pointer"
              />
              <button
                onClick={handleToggleMute}
                className="text-[11px] font-mono text-neutral-400 hover:text-white cursor-pointer"
              >
                {muted ? 'Unmute' : 'Mute'}
              </button>
            </div>
          </div>

          {/* Auto Aim */}
          <div className="flex items-center justify-between">
            <span className="font-mono text-neutral-400 flex items-center gap-1.5">
              <Crosshair className="w-4 h-4" />
              <span>Auto-Aim Nearest Shade</span>
            </span>
            <input
              type="checkbox"
              checked={autoAim}
              onChange={handleToggleAutoAim}
              className="accent-[#ffb703] cursor-pointer"
            />
          </div>

          {/* Auto Fire */}
          <div className="flex items-center justify-between">
            <span className="font-mono text-neutral-400 flex items-center gap-1.5">
              <Zap className="w-4 h-4" />
              <span>Continuous Auto-Fire</span>
            </span>
            <input
              type="checkbox"
              checked={autoFire}
              onChange={handleToggleAutoFire}
              className="accent-[#ffb703] cursor-pointer"
            />
          </div>
        </div>

        {/* Active Relics list */}
        {engine.stats.relicsAcquired.length > 0 && (
          <div className="border-t border-neutral-800/80 pt-4 mt-4">
            <div className="text-[11px] font-mono text-neutral-400 mb-1.5 uppercase">
              Attuned Relics ({engine.stats.relicsAcquired.length})
            </div>
            <div className="flex flex-wrap gap-1.5 text-[11px] text-neutral-300 font-mono">
              {engine.stats.relicsAcquired.map((name, i) => (
                <span key={i} className="bg-neutral-900 border border-neutral-800 px-2 py-0.5 rounded">
                  {name}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
