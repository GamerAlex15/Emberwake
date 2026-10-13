import React from 'react';
import { GameEngine } from '../game/gameEngine';
import { WEAPONS } from '../game/constants';
import { WeaponType } from '../types/game';
import { Flame, Shield, Zap, Sparkles, Volume2, VolumeX, Pause } from 'lucide-react';
import { soundEngine } from '../audio/soundEngine';

interface HUDProps {
  engine: GameEngine;
  onPause: () => void;
}

export const HUD: React.FC<HUDProps> = ({ engine, onPause }) => {
  const currentVigil = engine.getCurrentVigil();
  const player = engine.player;
  const hearth = engine.hearth;
  const boss = engine.activeBoss;

  const vigilProgress = currentVigil.bossSpawn
    ? 0
    : Math.min(100, Math.floor((engine.vigilTimer / currentVigil.duration) * 100));

  const secondsRemaining = currentVigil.bossSpawn
    ? null
    : Math.max(0, Math.ceil(currentVigil.duration - engine.vigilTimer));

  const [muted, setMuted] = React.useState(soundEngine.getMuted());

  const toggleSound = () => {
    const next = !muted;
    soundEngine.setMuted(next);
    setMuted(next);
  };

  const weaponsList: WeaponType[] = ['SOLAR_LANCE', 'CINDER_FLURRY', 'CORONA_BEAM', 'DAWN_MORTAR'];

  const dashReady = player.dashCooldown <= 0;
  const dashPct = dashReady ? 100 : Math.floor(((player.dashMaxCooldown - player.dashCooldown) / player.dashMaxCooldown) * 100);

  const novaReady = player.novaCooldown <= 0;
  const novaPct = novaReady ? 100 : Math.floor(((player.novaMaxCooldown - player.novaCooldown) / player.novaMaxCooldown) * 100);

  return (
    <div className="pointer-events-none fixed inset-0 flex flex-col justify-between p-4 md:p-6 z-20 text-[#f5efe6] font-sans">
      {/* Top Header Row */}
      <header className="flex items-center justify-between gap-4">
        {/* Brand & Vigil info (Clean unboxed metadata) */}
        <div className="flex flex-col">
          <div className="flex items-center gap-2">
            <span className="font-display font-bold text-lg md:text-xl tracking-wider text-[#ffb703]">
              EMBERWAKE
            </span>
            <span className="text-xs text-neutral-500" aria-hidden="true">·</span>
            <span className="text-xs font-mono uppercase tracking-widest text-neutral-400">
              Vigil {currentVigil.number} of 8
            </span>
          </div>
          <div className="text-xs text-neutral-400 flex items-center gap-1.5 mt-0.5">
            <span className="font-medium text-neutral-300">{currentVigil.name}</span>
            <span aria-hidden="true" className="text-neutral-600">·</span>
            <span className="hidden sm:inline text-neutral-400">{currentVigil.subtitle}</span>
          </div>
        </div>

        {/* Center Progress: Vigil Timer or Boss Bar */}
        <div className="flex-1 max-w-xs md:max-w-md mx-2 flex flex-col items-center">
          {boss ? (
            <div className="w-full">
              <div className="flex items-center justify-between text-xs font-mono mb-1">
                <span className="font-bold text-[#ff4d6d]">THE HOLLOW KING</span>
                <span className="tabular-nums text-neutral-400">
                  {Math.max(0, Math.round(boss.health))} / {Math.round(boss.maxHealth)} HP
                </span>
              </div>
              <div className="w-full h-2.5 bg-black/70 border border-neutral-800 rounded overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-[#9d4edd] to-[#ff0055] transition-all duration-150"
                  style={{ width: `${Math.max(0, (boss.health / boss.maxHealth) * 100)}%` }}
                />
              </div>
            </div>
          ) : (
            <div className="w-full">
              <div className="flex items-center justify-between text-xs font-mono text-neutral-400 mb-1">
                <span>VIGIL PROGRESS</span>
                <span className="tabular-nums font-semibold text-neutral-200">
                  {secondsRemaining}s REMAINING
                </span>
              </div>
              <div className="w-full h-1.5 bg-black/60 border border-neutral-800/80 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-[#e07a14] to-[#ffb703] transition-all duration-200"
                  style={{ width: `${vigilProgress}%` }}
                />
              </div>
            </div>
          )}
        </div>

        {/* Right Stats & Controls */}
        <div className="flex items-center gap-3">
          {/* Embers carried */}
          <div className="flex items-center gap-1.5 bg-black/40 border border-neutral-800/80 px-2.5 py-1.5 rounded text-xs font-mono">
            <Flame className="w-3.5 h-3.5 text-[#ffb703] shrink-0" />
            <span className="tabular-nums font-bold text-[#ffe6a7]">{player.embersCarried}</span>
            <span className="text-neutral-500 text-[10px] hidden sm:inline">EMBERS</span>
          </div>

          {/* Score */}
          <div className="hidden sm:flex flex-col text-right font-mono text-xs">
            <span className="text-[10px] text-neutral-500 uppercase">Score</span>
            <span className="tabular-nums font-semibold text-neutral-200">{engine.stats.score.toLocaleString()}</span>
          </div>

          {/* Action buttons (pointer-events-auto) */}
          <div className="pointer-events-auto flex items-center gap-1.5">
            <button
              onClick={toggleSound}
              aria-label={muted ? 'Unmute Audio' : 'Mute Audio'}
              className="p-1.5 bg-neutral-900/80 hover:bg-neutral-800 border border-neutral-700/60 rounded text-neutral-300 hover:text-white transition-colors cursor-pointer"
            >
              {muted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
            </button>
            <button
              onClick={onPause}
              aria-label="Pause Game"
              className="p-1.5 bg-neutral-900/80 hover:bg-neutral-800 border border-neutral-700/60 rounded text-neutral-300 hover:text-white transition-colors cursor-pointer"
            >
              <Pause className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Bottom Area: Health, Hearth, Abilities & Weapons */}
      <footer className="flex flex-col md:flex-row items-end md:items-center justify-between gap-4">
        {/* Sparkbearer HP & Hearth Integrity */}
        <div className="flex flex-col gap-2 w-full md:w-80 bg-black/50 backdrop-blur-sm p-3 rounded-lg border border-neutral-800/80">
          {/* Player HP */}
          <div>
            <div className="flex items-center justify-between text-xs font-mono mb-1">
              <span className="flex items-center gap-1.5 text-neutral-300">
                <Sparkles className="w-3 h-3 text-[#ffb703]" />
                SPARKBEARER
              </span>
              <span className="tabular-nums text-neutral-400">
                {Math.round(player.health)} / {Math.round(player.maxHealth)} HP
              </span>
            </div>
            <div className="w-full h-2 bg-neutral-950 rounded overflow-hidden border border-neutral-800">
              <div
                className="h-full bg-gradient-to-r from-[#d90429] to-[#f77f00] transition-all duration-100"
                style={{ width: `${Math.max(0, (player.health / player.maxHealth) * 100)}%` }}
              />
            </div>
          </div>

          {/* Hearth Pyre HP */}
          <div>
            <div className="flex items-center justify-between text-xs font-mono mb-1">
              <span className="flex items-center gap-1.5 text-[#ffb703]">
                <Flame className="w-3 h-3 text-[#ffb703]" />
                SOLAR HEARTH (TIER {hearth.level})
              </span>
              <span className="tabular-nums text-neutral-400">
                {Math.round(hearth.health)} / {Math.round(hearth.maxHealth)}
              </span>
            </div>
            <div className="w-full h-2 bg-neutral-950 rounded overflow-hidden border border-neutral-800">
              <div
                className="h-full bg-gradient-to-r from-[#f77f00] to-[#ffd166] transition-all duration-100"
                style={{ width: `${Math.max(0, (hearth.health / hearth.maxHealth) * 100)}%` }}
              />
            </div>
          </div>
        </div>

        {/* Weapons & Cooldown Controls */}
        <div className="flex flex-wrap items-center gap-2 pointer-events-auto">
          {/* Weapons selector */}
          <div className="flex items-center gap-1 bg-black/60 p-1 rounded-lg border border-neutral-800">
            {weaponsList.map((wKey, idx) => {
              const weapon = WEAPONS[wKey];
              const isActive = player.activeWeapon === wKey;
              return (
                <button
                  key={wKey}
                  onClick={() => engine.switchWeapon(wKey)}
                  className={`px-2.5 py-1 text-xs font-mono rounded transition-colors cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
                    isActive
                      ? 'bg-[#ffb703] text-black font-semibold'
                      : 'text-neutral-400 hover:text-white hover:bg-neutral-800'
                  }`}
                >
                  <span className="text-[10px] opacity-70">[{idx + 1}]</span>
                  <span>{weapon.name}</span>
                </button>
              );
            })}
          </div>

          {/* Dash Ability button / Cooldown */}
          <button
            onClick={() => engine.dash()}
            className={`px-3 py-1.5 rounded-lg border text-xs font-mono flex items-center gap-1.5 transition-colors cursor-pointer whitespace-nowrap ${
              dashReady
                ? 'bg-neutral-900 border-[#ffb703]/50 text-neutral-200 hover:bg-neutral-800'
                : 'bg-black/60 border-neutral-800 text-neutral-500'
            }`}
          >
            <Zap className={`w-3.5 h-3.5 ${dashReady ? 'text-[#ffb703]' : 'text-neutral-600'}`} />
            <span>DASH</span>
            {!dashReady && <span className="text-[10px] tabular-nums text-neutral-400">{dashPct}%</span>}
          </button>

          {/* Supernova Purge Ability button / Cooldown */}
          <button
            onClick={() => engine.triggerSupernova()}
            className={`px-3 py-1.5 rounded-lg border text-xs font-mono flex items-center gap-1.5 transition-colors cursor-pointer whitespace-nowrap ${
              novaReady
                ? 'bg-neutral-900 border-[#ffd166] text-[#ffd166] hover:bg-neutral-800'
                : 'bg-black/60 border-neutral-800 text-neutral-500'
            }`}
          >
            <Shield className={`w-3.5 h-3.5 ${novaReady ? 'text-[#ffd166]' : 'text-neutral-600'}`} />
            <span>SUPERNOVA</span>
            {!novaReady && <span className="text-[10px] tabular-nums text-neutral-400">{novaPct}%</span>}
          </button>
        </div>
      </footer>
    </div>
  );
};
