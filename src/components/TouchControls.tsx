import React, { useEffect, useState, useRef } from 'react';
import { GameEngine } from '../game/gameEngine';
import { Zap, Shield } from 'lucide-react';

interface TouchControlsProps {
  engine: GameEngine;
}

export const TouchControls: React.FC<TouchControlsProps> = ({ engine }) => {
  const [isTouchDevice, setIsTouchDevice] = useState(false);
  const leftStickRef = useRef<HTMLDivElement | null>(null);
  const rightStickRef = useRef<HTMLDivElement | null>(null);

  const [leftStickPos, setLeftStickPos] = useState({ x: 0, y: 0 });
  const [rightStickPos, setRightStickPos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const checkTouch = () => {
      if ('ontouchstart' in window || navigator.maxTouchPoints > 0) {
        setIsTouchDevice(true);
      }
    };
    checkTouch();
  }, []);

  if (!isTouchDevice) return null;

  // Touch Handlers for Left Joystick (Movement)
  const handleLeftTouch = (e: React.TouchEvent<HTMLDivElement>) => {
    if (!leftStickRef.current) return;
    const touch = e.targetTouches[0];
    if (!touch) return;

    const rect = leftStickRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    const dx = touch.clientX - centerX;
    const dy = touch.clientY - centerY;
    const maxRadius = rect.width / 2;
    const dist = Math.hypot(dx, dy);

    const clampedDist = Math.min(dist, maxRadius);
    const angle = Math.atan2(dy, dx);

    const normX = (Math.cos(angle) * clampedDist) / maxRadius;
    const normY = (Math.sin(angle) * clampedDist) / maxRadius;

    setLeftStickPos({ x: normX * 30, y: normY * 30 });
    engine.moveStick.x = normX;
    engine.moveStick.y = normY;
    engine.moveStick.active = true;
  };

  const handleLeftEnd = () => {
    setLeftStickPos({ x: 0, y: 0 });
    engine.moveStick.x = 0;
    engine.moveStick.y = 0;
    engine.moveStick.active = false;
  };

  // Touch Handlers for Right Joystick (Aim & Fire)
  const handleRightTouch = (e: React.TouchEvent<HTMLDivElement>) => {
    if (!rightStickRef.current) return;
    const touch = e.targetTouches[0];
    if (!touch) return;

    const rect = rightStickRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    const dx = touch.clientX - centerX;
    const dy = touch.clientY - centerY;
    const maxRadius = rect.width / 2;
    const dist = Math.hypot(dx, dy);

    const clampedDist = Math.min(dist, maxRadius);
    const angle = Math.atan2(dy, dx);

    const normX = (Math.cos(angle) * clampedDist) / maxRadius;
    const normY = (Math.sin(angle) * clampedDist) / maxRadius;

    setRightStickPos({ x: normX * 30, y: normY * 30 });
    engine.aimStick.x = normX;
    engine.aimStick.y = normY;
    engine.aimStick.active = dist > 15;
  };

  const handleRightEnd = () => {
    setRightStickPos({ x: 0, y: 0 });
    engine.aimStick.x = 0;
    engine.aimStick.y = 0;
    engine.aimStick.active = false;
  };

  return (
    <div className="fixed inset-0 pointer-events-none z-20 flex justify-between items-end p-6 select-none">
      {/* Left Move Stick */}
      <div
        ref={leftStickRef}
        onTouchStart={handleLeftTouch}
        onTouchMove={handleLeftTouch}
        onTouchEnd={handleLeftEnd}
        onTouchCancel={handleLeftEnd}
        className="pointer-events-auto w-28 h-28 rounded-full bg-black/40 border border-neutral-700/60 flex items-center justify-center relative touch-none"
      >
        <div
          className="w-12 h-12 rounded-full bg-[#ffb703]/60 border border-[#ffb703] absolute transition-transform"
          style={{
            transform: `translate(${leftStickPos.x}px, ${leftStickPos.y}px)`,
          }}
        />
        <span className="text-[10px] font-mono text-neutral-400 pointer-events-none">MOVE</span>
      </div>

      {/* Right Aim Stick & Floating Action Buttons */}
      <div className="flex flex-col items-end gap-3">
        {/* Action Buttons */}
        <div className="flex gap-2">
          <button
            onTouchStart={(e) => {
              e.preventDefault();
              engine.dash();
            }}
            className="pointer-events-auto w-14 h-14 rounded-full bg-neutral-900/90 border border-[#ffb703] flex flex-col items-center justify-center text-[#ffb703] active:bg-[#ffb703] active:text-black"
          >
            <Zap className="w-5 h-5" />
            <span className="text-[9px] font-mono">DASH</span>
          </button>

          <button
            onTouchStart={(e) => {
              e.preventDefault();
              engine.triggerSupernova();
            }}
            className="pointer-events-auto w-14 h-14 rounded-full bg-neutral-900/90 border border-[#ffd166] flex flex-col items-center justify-center text-[#ffd166] active:bg-[#ffd166] active:text-black"
          >
            <Shield className="w-5 h-5" />
            <span className="text-[9px] font-mono">NOVA</span>
          </button>
        </div>

        {/* Right Aim Stick */}
        <div
          ref={rightStickRef}
          onTouchStart={handleRightTouch}
          onTouchMove={handleRightTouch}
          onTouchEnd={handleRightEnd}
          onTouchCancel={handleRightEnd}
          className="pointer-events-auto w-28 h-28 rounded-full bg-black/40 border border-neutral-700/60 flex items-center justify-center relative touch-none"
        >
          <div
            className="w-12 h-12 rounded-full bg-[#ff5400]/60 border border-[#ff5400] absolute transition-transform"
            style={{
              transform: `translate(${rightStickPos.x}px, ${rightStickPos.y}px)`,
            }}
          />
          <span className="text-[10px] font-mono text-neutral-400 pointer-events-none">AIM & FIRE</span>
        </div>
      </div>
    </div>
  );
};
