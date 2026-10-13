import React, { useEffect, useRef } from 'react';
import { ARENA_HEIGHT, ARENA_WIDTH } from '../game/constants';
import { GameEngine } from '../game/gameEngine';
import { Enemy } from '../types/game';

interface GameCanvasProps {
  engine: GameEngine;
}

export const GameCanvas: React.FC<GameCanvasProps> = ({ engine }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationId: number;
    let lastTime = performance.now();

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = window.innerWidth * dpr;
      canvas.height = window.innerHeight * dpr;
      canvas.style.width = `${window.innerWidth}px`;
      canvas.style.height = `${window.innerHeight}px`;
      ctx.resetTransform?.();
      ctx.scale(dpr, dpr);
    };

    resize();
    window.addEventListener('resize', resize);

    // Mouse handlers
    const handleMouseMove = (e: MouseEvent) => {
      engine.mouseX = e.clientX;
      engine.mouseY = e.clientY;
    };

    const handleMouseDown = (e: MouseEvent) => {
      if (e.button === 0) {
        engine.isMouseDown = true;
      } else if (e.button === 2) {
        // Right click dash or nova
        engine.dash();
      }
    };

    const handleMouseUp = (e: MouseEvent) => {
      if (e.button === 0) {
        engine.isMouseDown = false;
      }
    };

    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault();
    };

    // Keyboard handlers
    const handleKeyDown = (e: KeyboardEvent) => {
      engine.keys[e.code] = true;
      if (e.code === 'Space') {
        engine.dash();
      }
      if (e.code === 'KeyE' || e.code === 'KeyQ') {
        engine.triggerSupernova();
      }
      if (e.code === 'Digit1') engine.switchWeapon('SOLAR_LANCE');
      if (e.code === 'Digit2') engine.switchWeapon('CINDER_FLURRY');
      if (e.code === 'Digit3') engine.switchWeapon('CORONA_BEAM');
      if (e.code === 'Digit4') engine.switchWeapon('DAWN_MORTAR');
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      engine.keys[e.code] = false;
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mouseup', handleMouseUp);
    window.addEventListener('contextmenu', handleContextMenu);
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    // Main render and loop
    const render = (time: number) => {
      const dt = (time - lastTime) / 1000;
      lastTime = time;

      // Update engine
      engine.update(dt);

      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const width = window.innerWidth;
      const height = window.innerHeight;

      // Camera lerp
      const targetCamX = engine.player.x - width / 2;
      const targetCamY = engine.player.y - height / 2;
      engine.cameraX += (targetCamX - engine.cameraX) * 0.12;
      engine.cameraY += (targetCamY - engine.cameraY) * 0.12;

      // Clamp camera within arena
      engine.cameraX = Math.max(-100, Math.min(ARENA_WIDTH - width + 100, engine.cameraX));
      engine.cameraY = Math.max(-100, Math.min(ARENA_HEIGHT - height + 100, engine.cameraY));

      // Screen shake offset
      const shakeX = (Math.random() - 0.5) * engine.screenShake * 2.5;
      const shakeY = (Math.random() - 0.5) * engine.screenShake * 2.5;

      ctx.save();
      ctx.clearRect(0, 0, width * dpr, height * dpr);
      ctx.translate(-engine.cameraX + shakeX, -engine.cameraY + shakeY);

      // 1. Draw World Arena Floor (Dead Sun Sanctum)
      drawArenaFloor(ctx, engine);

      // 2. Draw Embers
      drawEmbers(ctx, engine);

      // 3. Draw Hearth Altar
      drawHearth(ctx, engine);

      // 4. Draw Enemies
      drawEnemies(ctx, engine);

      // 5. Draw Player
      drawPlayer(ctx, engine);

      // 6. Draw Projectiles
      drawProjectiles(ctx, engine);

      // 7. Draw Particles & Shockwaves
      engine.particles.render(ctx);

      // 8. Dynamic Lighting & Fog of War
      drawLightingPass(ctx, engine, width, height);

      // 9. Crosshair Guide
      drawCrosshair(ctx, engine);

      ctx.restore();

      animationId = requestAnimationFrame(render);
    };

    animationId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener('resize', resize);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('contextmenu', handleContextMenu);
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [engine]);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 w-full h-full block bg-[#05070b] game-cursor select-none"
    />
  );
};

// Floor rendering
function drawArenaFloor(ctx: CanvasRenderingContext2D, engine: GameEngine) {
  const time = performance.now() / 1000;
  const cx = engine.hearth.x;
  const cy = engine.hearth.y;

  // Dark obsidian bedrock
  ctx.fillStyle = '#0a0d15';
  ctx.fillRect(0, 0, ARENA_WIDTH, ARENA_HEIGHT);

  // Outer border with ancient obsidian runes
  ctx.strokeStyle = '#1e2433';
  ctx.lineWidth = 16;
  ctx.strokeRect(10, 10, ARENA_WIDTH - 20, ARENA_HEIGHT - 20);

  ctx.strokeStyle = '#d4791e';
  ctx.lineWidth = 3;
  ctx.strokeRect(24, 24, ARENA_WIDTH - 48, ARENA_HEIGHT - 48);

  // Subtle grid of cracked black glass
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.035)';
  ctx.lineWidth = 1;
  const gridSize = 100;
  for (let x = 0; x <= ARENA_WIDTH; x += gridSize) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, ARENA_HEIGHT);
    ctx.stroke();
  }
  for (let y = 0; y <= ARENA_HEIGHT; y += gridSize) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(ARENA_WIDTH, y);
    ctx.stroke();
  }

  // Glowing Magma Fissures radiating outward from Hearth
  ctx.save();
  ctx.strokeStyle = 'rgba(234, 110, 24, 0.28)';
  ctx.lineWidth = 2.5;
  ctx.shadowColor = '#ff6b00';
  ctx.shadowBlur = 8;
  const fissureAngles = [0.3, 1.1, 2.0, 2.8, 3.6, 4.4, 5.2, 5.9];
  fissureAngles.forEach((baseAngle) => {
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    const length = 550;
    const midX = cx + Math.cos(baseAngle) * (length * 0.5) + Math.sin(baseAngle * 3) * 30;
    const midY = cy + Math.sin(baseAngle) * (length * 0.5) + Math.cos(baseAngle * 3) * 30;
    const endX = cx + Math.cos(baseAngle) * length;
    const endY = cy + Math.sin(baseAngle) * length;
    ctx.quadraticCurveTo(midX, midY, endX, endY);
    ctx.stroke();
  });
  ctx.restore();

  // Concentric Celestial Rings centered at Hearth
  const rings = [180, 360, 600, 850];
  rings.forEach((r, idx) => {
    ctx.strokeStyle = `rgba(234, 138, 38, ${0.12 - idx * 0.025})`;
    ctx.lineWidth = idx === 0 ? 3 : 2;
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.stroke();

    // Cardinal solar glyph markers
    for (let a = 0; a < 8; a++) {
      const angle = (a * Math.PI) / 4 + time * (idx % 2 === 0 ? 0.02 : -0.02);
      const gx = cx + Math.cos(angle) * r;
      const gy = cy + Math.sin(angle) * r;
      ctx.fillStyle = 'rgba(255, 183, 3, 0.35)';
      ctx.beginPath();
      ctx.arc(gx, gy, 4, 0, Math.PI * 2);
      ctx.fill();
    }
  });

  // 4 Ancient Solar Monoliths (celestial pillars around the sanctum)
  const pillars = [
    { x: cx - 340, y: cy - 240 },
    { x: cx + 340, y: cy - 240 },
    { x: cx - 340, y: cy + 240 },
    { x: cx + 340, y: cy + 240 },
  ];

  pillars.forEach((p, idx) => {
    ctx.save();
    // Shadow
    ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
    ctx.beginPath();
    ctx.ellipse(p.x, p.y + 16, 26, 14, 0, 0, Math.PI * 2);
    ctx.fill();

    // Obsidian base
    ctx.fillStyle = '#121620';
    ctx.strokeStyle = '#323c4e';
    ctx.lineWidth = 2;
    ctx.fillRect(p.x - 18, p.y - 18, 36, 36);
    ctx.strokeRect(p.x - 18, p.y - 18, 36, 36);

    // Glowing sun crystal on top
    const pulse = Math.sin(time * 3 + idx) * 0.2 + 0.8;
    ctx.shadowColor = '#ffb703';
    ctx.shadowBlur = 12 * pulse;
    ctx.fillStyle = '#ffb703';
    ctx.beginPath();
    ctx.arc(p.x, p.y, 8, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(p.x, p.y, 4, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  });
}


// Embers rendering
function drawEmbers(ctx: CanvasRenderingContext2D, engine: GameEngine) {
  const time = performance.now() / 1000;
  for (const ember of engine.embers) {
    const pulse = Math.sin(time * 6 + ember.x) * 1.5;
    const r = Math.max(3, 4 + pulse);

    ctx.save();
    ctx.shadowColor = '#ffb703';
    ctx.shadowBlur = 10;
    ctx.fillStyle = '#ffeaa7';
    ctx.beginPath();
    ctx.arc(ember.x, ember.y, r, 0, Math.PI * 2);
    ctx.fill();

    // Ember core
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(ember.x, ember.y, r * 0.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }
}

// Hearth rendering
function drawHearth(ctx: CanvasRenderingContext2D, engine: GameEngine) {
  const h = engine.hearth;
  const time = performance.now() / 1000;

  ctx.save();

  // Hearth glow pulse
  const pulseR = h.lightRadius * (0.97 + Math.sin(time * 2.5) * 0.03);
  const hearthGrad = ctx.createRadialGradient(h.x, h.y, h.radius, h.x, h.y, pulseR);
  hearthGrad.addColorStop(0, 'rgba(255, 183, 3, 0.28)');
  hearthGrad.addColorStop(0.5, 'rgba(251, 133, 0, 0.12)');
  hearthGrad.addColorStop(1, 'rgba(251, 133, 0, 0)');

  ctx.fillStyle = hearthGrad;
  ctx.beginPath();
  ctx.arc(h.x, h.y, pulseR, 0, Math.PI * 2);
  ctx.fill();

  // Outer stone pedestal
  ctx.fillStyle = '#161922';
  ctx.strokeStyle = '#e07a14';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.arc(h.x, h.y, h.radius + 6, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // Rotating solar gear / sun rune
  ctx.save();
  ctx.translate(h.x, h.y);
  ctx.rotate(time * 0.4);
  const rays = 8;
  ctx.strokeStyle = 'rgba(255, 183, 3, 0.6)';
  ctx.lineWidth = 3;
  for (let i = 0; i < rays; i++) {
    const angle = (i * Math.PI * 2) / rays;
    ctx.beginPath();
    ctx.moveTo(Math.cos(angle) * (h.radius - 8), Math.sin(angle) * (h.radius - 8));
    ctx.lineTo(Math.cos(angle) * (h.radius + 8), Math.sin(angle) * (h.radius + 8));
    ctx.stroke();
  }
  ctx.restore();

  // Core blazing sun crystal
  const coreGrad = ctx.createRadialGradient(h.x, h.y, 4, h.x, h.y, h.radius - 8);
  coreGrad.addColorStop(0, '#ffffff');
  coreGrad.addColorStop(0.4, '#ffdd55');
  coreGrad.addColorStop(0.8, '#ff8800');
  coreGrad.addColorStop(1, '#9e2a2b');

  ctx.shadowColor = '#ffaa00';
  ctx.shadowBlur = 24;
  ctx.fillStyle = coreGrad;
  ctx.beginPath();
  ctx.arc(h.x, h.y, h.radius - 8, 0, Math.PI * 2);
  ctx.fill();

  // Turret sentry if unlocked
  if (engine.modifiers.hearthTurretUnlocked) {
    ctx.strokeStyle = '#ffeaa7';
    ctx.lineWidth = 2;
    ctx.save();
    ctx.translate(h.x, h.y);
    ctx.rotate(-time * 1.2);
    ctx.strokeRect(-12, -12, 24, 24);
    ctx.restore();
  }

  // Health ring around hearth
  const hpRatio = Math.max(0, h.health / h.maxHealth);
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
  ctx.lineWidth = 5;
  ctx.beginPath();
  ctx.arc(h.x, h.y, h.radius + 16, 0, Math.PI * 2);
  ctx.stroke();

  ctx.strokeStyle = hpRatio > 0.4 ? '#ffb703' : '#d90429';
  ctx.beginPath();
  ctx.arc(h.x, h.y, h.radius + 16, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * hpRatio);
  ctx.stroke();

  // Ember stoking tether if player is nearby
  const dist = Math.hypot(engine.player.x - h.x, engine.player.y - h.y);
  if (dist < h.radius + 60 && engine.player.embersCarried > 0) {
    ctx.strokeStyle = 'rgba(255, 221, 89, 0.7)';
    ctx.lineWidth = 3;
    ctx.setLineDash([6, 4]);
    ctx.beginPath();
    ctx.moveTo(engine.player.x, engine.player.y);
    ctx.lineTo(h.x, h.y);
    ctx.stroke();
    ctx.setLineDash([]);
  }

  ctx.restore();
}

// Enemies rendering
function drawEnemies(ctx: CanvasRenderingContext2D, engine: GameEngine) {
  const time = performance.now() / 1000;

  for (const enemy of engine.enemies) {
    ctx.save();

    if (enemy.isBoss) {
      // Hollow King rendering
      drawHollowKing(ctx, enemy, time);
      ctx.restore();
      continue;
    }

    // Normal shadow enemies
    const pulse = Math.sin(time * 5 + enemy.x) * 1.5;
    const r = enemy.radius + pulse;

    // Outer shadow aura
    ctx.shadowColor = enemy.color;
    ctx.shadowBlur = 10;
    ctx.fillStyle = enemy.color;
    ctx.beginPath();
    ctx.arc(enemy.x, enemy.y, r, 0, Math.PI * 2);
    ctx.fill();

    // Inner menacing eye / core
    ctx.fillStyle = enemy.type === 'FROST_WANDERER' ? '#caf0f8' : '#e63946';
    ctx.beginPath();
    ctx.arc(enemy.x, enemy.y, r * 0.4, 0, Math.PI * 2);
    ctx.fill();

    // Spikes for Goliaths / Spires
    if (enemy.type === 'PENUMBRA_GOLIATH' || enemy.type === 'OBSIDIAN_SPIRE') {
      ctx.strokeStyle = '#9d4edd';
      ctx.lineWidth = 2.5;
      for (let s = 0; s < 4; s++) {
        const ang = (s * Math.PI) / 2 + time;
        ctx.beginPath();
        ctx.moveTo(enemy.x, enemy.y);
        ctx.lineTo(enemy.x + Math.cos(ang) * (r + 8), enemy.y + Math.sin(ang) * (r + 8));
        ctx.stroke();
      }
    }

    // Health bar above enemy if damaged
    if (enemy.health < enemy.maxHealth) {
      const barW = Math.max(26, enemy.radius * 2);
      const barH = 3.5;
      const barX = enemy.x - barW / 2;
      const barY = enemy.y - enemy.radius - 9;

      ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
      ctx.fillRect(barX, barY, barW, barH);

      const pct = Math.max(0, enemy.health / enemy.maxHealth);
      ctx.fillStyle = '#ef233c';
      ctx.fillRect(barX, barY, barW * pct, barH);
    }

    // Shield bar if present
    if (enemy.shield && enemy.maxShield && enemy.shield > 0) {
      const barW = Math.max(26, enemy.radius * 2);
      const barH = 3;
      const barX = enemy.x - barW / 2;
      const barY = enemy.y - enemy.radius - 14;

      ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
      ctx.fillRect(barX, barY, barW, barH);

      const sPct = enemy.shield / enemy.maxShield;
      ctx.fillStyle = '#48cae4';
      ctx.fillRect(barX, barY, barW * sPct, barH);
    }

    ctx.restore();
  }
}

// Boss rendering: The Hollow King
function drawHollowKing(ctx: CanvasRenderingContext2D, boss: Enemy, time: number) {
  ctx.save();

  // Dark Eclipse Core
  const r = boss.radius;
  ctx.shadowColor = boss.bossPhase === 3 ? '#ff0055' : '#7209b7';
  ctx.shadowBlur = 32;

  // Obsidian Crown spikes
  const crownHorns = 8;
  ctx.fillStyle = '#0f0514';
  ctx.strokeStyle = boss.bossPhase === 3 ? '#ff0055' : '#c77dff';
  ctx.lineWidth = 3;

  ctx.beginPath();
  for (let i = 0; i < crownHorns; i++) {
    const ang = (i * Math.PI * 2) / crownHorns + time * 0.5;
    const outerX = boss.x + Math.cos(ang) * (r + 26);
    const outerY = boss.y + Math.sin(ang) * (r + 26);
    const innerX = boss.x + Math.cos(ang + Math.PI / crownHorns) * (r - 4);
    const innerY = boss.y + Math.sin(ang + Math.PI / crownHorns) * (r - 4);
    if (i === 0) ctx.moveTo(outerX, outerY);
    else ctx.lineTo(outerX, outerY);
    ctx.lineTo(innerX, innerY);
  }
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // The Void Body
  ctx.fillStyle = '#06000c';
  ctx.beginPath();
  ctx.arc(boss.x, boss.y, r, 0, Math.PI * 2);
  ctx.fill();

  // The Dead Eclipse Eye
  const eyeR = r * 0.45;
  ctx.fillStyle = boss.bossPhase === 3 ? '#ff0055' : '#b5179e';
  ctx.beginPath();
  ctx.arc(boss.x, boss.y, eyeR, 0, Math.PI * 2);
  ctx.fill();

  // Black pupil
  ctx.fillStyle = '#000000';
  ctx.beginPath();
  ctx.arc(boss.x, boss.y, eyeR * 0.55, 0, Math.PI * 2);
  ctx.fill();

  // Orbiting Star Shards
  const shardCount = boss.bossPhase === 3 ? 6 : 4;
  for (let s = 0; s < shardCount; s++) {
    const shardAngle = (s * Math.PI * 2) / shardCount - time * 1.5;
    const sx = boss.x + Math.cos(shardAngle) * (r + 42);
    const sy = boss.y + Math.sin(shardAngle) * (r + 42);

    ctx.fillStyle = boss.bossPhase === 3 ? '#ff0055' : '#e0aaff';
    ctx.beginPath();
    ctx.arc(sx, sy, 7, 0, Math.PI * 2);
    ctx.fill();
  }

  // Boss Health Bar in World (also on top HUD)
  const barW = 120;
  const barH = 7;
  const barX = boss.x - barW / 2;
  const barY = boss.y - r - 30;

  ctx.fillStyle = 'rgba(0,0,0,0.8)';
  ctx.fillRect(barX, barY, barW, barH);
  const hpPct = Math.max(0, boss.health / boss.maxHealth);
  ctx.fillStyle = boss.bossPhase === 3 ? '#ff0055' : '#c77dff';
  ctx.fillRect(barX, barY, barW * hpPct, barH);

  ctx.restore();
}

// Player rendering
function drawPlayer(ctx: CanvasRenderingContext2D, engine: GameEngine) {
  const p = engine.player;
  const time = performance.now() / 1000;

  ctx.save();

  // Invulnerability blink
  if (p.invulnerableTime > 0 && Math.floor(time * 20) % 2 === 0) {
    ctx.globalAlpha = 0.5;
  }

  // Orbitals if unlocked
  if (engine.modifiers.orbitalMotesCount > 0) {
    for (let m = 0; m < engine.modifiers.orbitalMotesCount; m++) {
      const moteAngle = (m * Math.PI * 2) / engine.modifiers.orbitalMotesCount + time * 3.5;
      const mx = p.x + Math.cos(moteAngle) * 38;
      const my = p.y + Math.sin(moteAngle) * 38;

      ctx.shadowColor = '#ffb703';
      ctx.shadowBlur = 10;
      ctx.fillStyle = '#fff3b0';
      ctx.beginPath();
      ctx.arc(mx, my, 5, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // Dash glow / ghost
  if (p.isDashing) {
    ctx.shadowColor = '#ff6b35';
    ctx.shadowBlur = 25;
    ctx.fillStyle = 'rgba(255, 107, 53, 0.4)';
    ctx.beginPath();
    ctx.arc(p.x - p.vx * 0.04, p.y - p.vy * 0.04, p.radius * 1.4, 0, Math.PI * 2);
    ctx.fill();
  }

  // Sparkbearer Vessel Body
  ctx.shadowColor = '#ffb703';
  ctx.shadowBlur = 18;
  ctx.fillStyle = '#fdf0d5';
  ctx.beginPath();
  ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
  ctx.fill();

  // Golden Mantle / Core
  ctx.fillStyle = '#fb8500';
  ctx.beginPath();
  ctx.arc(p.x, p.y, p.radius * 0.65, 0, Math.PI * 2);
  ctx.fill();

  // Bright solar heart
  ctx.fillStyle = '#ffffff';
  ctx.beginPath();
  ctx.arc(p.x, p.y, p.radius * 0.35, 0, Math.PI * 2);
  ctx.fill();

  // Weapon aim pointer needle
  ctx.strokeStyle = '#ffe6a7';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(p.x + Math.cos(p.angle) * p.radius, p.y + Math.sin(p.angle) * p.radius);
  ctx.lineTo(p.x + Math.cos(p.angle) * (p.radius + 14), p.y + Math.sin(p.angle) * (p.radius + 14));
  ctx.stroke();

  // Extended aim laser guideline
  ctx.strokeStyle = 'rgba(255, 183, 3, 0.35)';
  ctx.lineWidth = 1.5;
  ctx.setLineDash([6, 6]);
  ctx.beginPath();
  ctx.moveTo(p.x + Math.cos(p.angle) * (p.radius + 14), p.y + Math.sin(p.angle) * (p.radius + 14));
  ctx.lineTo(p.x + Math.cos(p.angle) * 360, p.y + Math.sin(p.angle) * 360);
  ctx.stroke();
  ctx.setLineDash([]);

  ctx.restore();
}

// Projectiles rendering
function drawProjectiles(ctx: CanvasRenderingContext2D, engine: GameEngine) {
  for (const proj of engine.projectiles) {
    ctx.save();
    ctx.shadowColor = proj.color;
    ctx.shadowBlur = proj.isPlayer ? 14 : 10;
    ctx.fillStyle = proj.color;

    ctx.beginPath();
    ctx.arc(proj.x, proj.y, proj.radius, 0, Math.PI * 2);
    ctx.fill();

    // White core for player laser
    if (proj.isPlayer) {
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(proj.x, proj.y, proj.radius * 0.45, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.restore();
  }
}

// Dynamic Lighting & Cosmic Atmosphere Pass
function drawLightingPass(
  ctx: CanvasRenderingContext2D,
  engine: GameEngine,
  viewportW: number,
  viewportH: number
) {
  const p = engine.player;
  const h = engine.hearth;

  ctx.save();

  // 1. Warm luminous corona around Hearth Altar
  const hLightR = h.lightRadius;
  const hGrad = ctx.createRadialGradient(h.x, h.y, h.radius * 0.4, h.x, h.y, hLightR);
  hGrad.addColorStop(0, 'rgba(255, 183, 3, 0.24)');
  hGrad.addColorStop(0.5, 'rgba(234, 88, 12, 0.10)');
  hGrad.addColorStop(1, 'rgba(234, 88, 12, 0)');
  ctx.fillStyle = hGrad;
  ctx.beginPath();
  ctx.arc(h.x, h.y, hLightR, 0, Math.PI * 2);
  ctx.fill();

  // 2. Warm lantern aura around Sparkbearer
  const pLightR = p.lightRadius * engine.modifiers.playerLightRadiusMultiplier;
  const pGrad = ctx.createRadialGradient(p.x, p.y, p.radius, p.x, p.y, pLightR);
  pGrad.addColorStop(0, 'rgba(255, 230, 167, 0.28)');
  pGrad.addColorStop(0.6, 'rgba(255, 183, 3, 0.10)');
  pGrad.addColorStop(1, 'rgba(255, 183, 3, 0)');
  ctx.fillStyle = pGrad;
  ctx.beginPath();
  ctx.arc(p.x, p.y, pLightR, 0, Math.PI * 2);
  ctx.fill();

  // 3. Dark atmospheric cosmic vignette at viewport boundaries (leaves all entities visible)
  const viewCenterX = engine.cameraX + viewportW / 2;
  const viewCenterY = engine.cameraY + viewportH / 2;
  const maxDim = Math.max(viewportW, viewportH);
  const vignette = ctx.createRadialGradient(
    viewCenterX,
    viewCenterY,
    maxDim * 0.35,
    viewCenterX,
    viewCenterY,
    maxDim * 0.78
  );
  vignette.addColorStop(0, 'rgba(0, 0, 0, 0)');
  vignette.addColorStop(1, 'rgba(3, 4, 8, 0.60)');
  ctx.fillStyle = vignette;
  ctx.fillRect(engine.cameraX - 50, engine.cameraY - 50, viewportW + 100, viewportH + 100);

  ctx.restore();
}


// Aim crosshair guide
function drawCrosshair(ctx: CanvasRenderingContext2D, engine: GameEngine) {
  const worldMouseX = engine.mouseX + engine.cameraX;
  const worldMouseY = engine.mouseY + engine.cameraY;

  ctx.save();
  ctx.strokeStyle = 'rgba(255, 183, 3, 0.75)';
  ctx.lineWidth = 1.5;

  // Crosshair circle
  ctx.beginPath();
  ctx.arc(worldMouseX, worldMouseY, 9, 0, Math.PI * 2);
  ctx.stroke();

  // Center pip
  ctx.fillStyle = '#ffffff';
  ctx.beginPath();
  ctx.arc(worldMouseX, worldMouseY, 2, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();
}
