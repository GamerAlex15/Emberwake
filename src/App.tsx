import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { GameEngine } from './game/gameEngine';
import { GameCanvas } from './components/GameCanvas';
import { HUD } from './components/HUD';
import { TitleMenu } from './components/TitleMenu';
import { ForgeModal } from './components/ForgeModal';
import { PauseModal } from './components/PauseModal';
import { GameOverModal } from './components/GameOverModal';
import { BestiaryModal } from './components/BestiaryModal';
import { TouchControls } from './components/TouchControls';
import { Difficulty, Relic } from './types/game';

export default function App() {
  const engine = useMemo(() => new GameEngine(), []);

  // UI state synced with engine
  const [engineState, setEngineState] = useState(engine.state);
  const [isPaused, setIsPaused] = useState(false);
  const [showBestiary, setShowBestiary] = useState(false);
  const [autoAim, setAutoAim] = useState(false);
  const [autoFire, setAutoFire] = useState(false);

  // Sync engine state to React periodically for modal transitions
  useEffect(() => {
    const interval = setInterval(() => {
      if (engine.state !== engineState) {
        setEngineState(engine.state);
      }
      if (engine.isPaused !== isPaused) {
        setIsPaused(engine.isPaused);
      }
    }, 100);

    return () => clearInterval(interval);
  }, [engine, engineState, isPaused]);

  // Global pause keyboard shortcuts (Escape / KeyP)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Escape' || e.code === 'KeyP') {
        if (engine.state === 'PLAYING') {
          engine.isPaused = !engine.isPaused;
          setIsPaused(engine.isPaused);
        } else if (showBestiary) {
          setShowBestiary(false);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [engine, showBestiary]);

  const handleStartGame = useCallback((diff: Difficulty) => {
    engine.autoAim = autoAim;
    engine.autoFire = autoFire;
    engine.startGame(diff);
    setEngineState('PLAYING');
    setIsPaused(false);
  }, [engine, autoAim, autoFire]);

  const handlePause = useCallback(() => {
    engine.isPaused = true;
    setIsPaused(true);
  }, [engine]);

  const handleResume = useCallback(() => {
    engine.isPaused = false;
    setIsPaused(false);
  }, [engine]);

  const handleRestart = useCallback(() => {
    engine.startGame(engine.difficulty);
    setEngineState('PLAYING');
    setIsPaused(false);
  }, [engine]);

  const handleMainMenu = useCallback(() => {
    engine.state = 'TITLE_MENU';
    engine.isPaused = false;
    setEngineState('TITLE_MENU');
    setIsPaused(false);
  }, [engine]);

  const handleSelectRelic = useCallback((relic: Relic) => {
    engine.chooseRelic(relic);
    setEngineState('PLAYING');
  }, [engine]);

  const handleSetAutoAim = useCallback((val: boolean) => {
    setAutoAim(val);
    engine.autoAim = val;
  }, [engine]);

  const handleSetAutoFire = useCallback((val: boolean) => {
    setAutoFire(val);
    engine.autoFire = val;
  }, [engine]);

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-[#05070b]">
      {/* 60fps Game Simulation & Dynamic 2D Lighting Canvas */}
      <GameCanvas engine={engine} />

      {/* In-Game HUD during Active Play */}
      {engineState === 'PLAYING' && !isPaused && (
        <>
          <HUD engine={engine} onPause={handlePause} />
          <TouchControls engine={engine} />
        </>
      )}

      {/* Title Screen */}
      {engineState === 'TITLE_MENU' && (
        <TitleMenu
          onStart={handleStartGame}
          onOpenBestiary={() => setShowBestiary(true)}
          autoAim={autoAim}
          setAutoAim={handleSetAutoAim}
          autoFire={autoFire}
          setAutoFire={handleSetAutoFire}
        />
      )}

      {/* Celestial Forge Modal (Post-Vigil Upgrades) */}
      {engineState === 'FORGE_RELIC' && (
        <ForgeModal
          relics={engine.selectedRelicChoices}
          onSelectRelic={handleSelectRelic}
          nextVigilNumber={engine.currentVigilIndex + 1}
        />
      )}

      {/* Pause Menu Modal */}
      {isPaused && (
        <PauseModal
          engine={engine}
          onResume={handleResume}
          onRestart={handleRestart}
          onMainMenu={handleMainMenu}
        />
      )}

      {/* Game Over / Victory Modal */}
      {(engineState === 'GAME_OVER' || engineState === 'VICTORY') && (
        <GameOverModal
          engine={engine}
          onRestart={handleRestart}
          onMainMenu={handleMainMenu}
        />
      )}

      {/* Bestiary & Lore Codex */}
      {showBestiary && (
        <BestiaryModal onClose={() => setShowBestiary(false)} />
      )}
    </div>
  );
}
