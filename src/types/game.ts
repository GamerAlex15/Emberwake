/**
 * Types and interfaces for Emberwake
 */

export type GameState =
  | 'TITLE_MENU'
  | 'PLAYING'
  | 'VIGIL_VICTORY'
  | 'FORGE_RELIC'
  | 'PAUSED'
  | 'GAME_OVER'
  | 'VICTORY'
  | 'BESTIARY';

export type Difficulty = 'PILGRIM' | 'TORCHBEARER' | 'HOLLOW_ECLIPSE';

export type WeaponType = 'SOLAR_LANCE' | 'CINDER_FLURRY' | 'CORONA_BEAM' | 'DAWN_MORTAR';

export interface Weapon {
  id: WeaponType;
  name: string;
  description: string;
  fireRate: number; // Shots per second
  damage: number;
  speed: number;
  range: number;
  spread: number;
  pierce: number;
  energyCost: number;
  color: string;
}

export interface Player {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  speed: number;
  maxHealth: number;
  health: number;
  energy: number;
  maxEnergy: number;
  energyRegen: number;
  lightRadius: number;
  angle: number; // Aim angle in radians
  dashCooldown: number;
  dashMaxCooldown: number;
  isDashing: boolean;
  dashDuration: number;
  dashSpeed: number;
  novaCooldown: number;
  novaMaxCooldown: number;
  activeWeapon: WeaponType;
  embersCarried: number;
  maxEmbersCarried: number;
  invulnerableTime: number;
}

export interface Hearth {
  x: number;
  y: number;
  radius: number;
  health: number;
  maxHealth: number;
  level: number;
  embersInvested: number;
  embersForNextLevel: number;
  lightRadius: number;
  baseLightRadius: number;
  pulseTimer: number;
  autoTurretCooldown: number;
}

export type EnemyType =
  | 'CINDER_HUSK'
  | 'UMBRAL_CRAWLER'
  | 'VOID_SPITTER'
  | 'FROST_WANDERER'
  | 'ECLIPSE_LEECHER'
  | 'OBSIDIAN_SPIRE'
  | 'PENUMBRA_GOLIATH'
  | 'VOID_HARBINGER'
  | 'HOLLOW_KING';

export interface Enemy {
  id: string;
  type: EnemyType;
  name: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  maxHealth: number;
  health: number;
  speed: number;
  damage: number;
  emberValue: number;
  scoreValue: number;
  color: string;
  shootCooldown?: number;
  specialTimer?: number;
  targetHearth: boolean; // Pursues Hearth or Player
  isBoss?: boolean;
  bossPhase?: number;
  shield?: number;
  maxShield?: number;
  stunTimer?: number;
  scale?: number;
}

export interface Projectile {
  id: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  damage: number;
  color: string;
  isPlayer: boolean;
  pierce: number;
  piercedCount: number;
  lifetime: number;
  maxLifetime: number;
  explosive?: boolean;
  explosionRadius?: number;
  homing?: boolean;
  trail?: boolean;
}

export interface EmberOrb {
  id: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  value: number;
  lifetime: number;
}

export interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  color: string;
  alpha: number;
  lifetime: number;
  maxLifetime: number;
  decay: number;
  glow?: boolean;
}

export interface FloatingText {
  id: string;
  x: number;
  y: number;
  text: string;
  color: string;
  alpha: number;
  lifetime: number;
  fontSize: number;
  isCrit?: boolean;
}

export interface Shockwave {
  x: number;
  y: number;
  radius: number;
  maxRadius: number;
  color: string;
  alpha: number;
  damage?: number;
  isPlayer?: boolean;
}

export interface Relic {
  id: string;
  name: string;
  description: string;
  rarity: 'COMMON' | 'RARE' | 'LEGENDARY';
  icon: string;
  effect: (modifiers: GameModifiers) => void;
}

export interface GameModifiers {
  playerDamageMultiplier: number;
  playerFireRateMultiplier: number;
  playerSpeedMultiplier: number;
  playerMaxHealthBonus: number;
  playerLightRadiusMultiplier: number;
  emberMagnetRadiusMultiplier: number;
  hearthMaxHealthBonus: number;
  hearthTurretUnlocked: boolean;
  hearthTurretDamage: number;
  hearthAegisReflect: boolean;
  dashLeavesFire: boolean;
  pierceBonus: number;
  critChance: number;
  novaRadiusMultiplier: number;
  inHearthBuff: boolean;
  orbitalMotesCount: number;
}

export interface VigilConfig {
  number: number;
  name: string;
  subtitle: string;
  lore: string;
  duration: number; // Seconds to survive
  enemySpawnRate: number; // Seconds between spawns
  allowedEnemies: EnemyType[];
  bossSpawn?: boolean;
  skyColor: string;
  ambientAnomaly: string;
}

export interface GameStats {
  vigilsCompleted: number;
  shadesDefeated: number;
  embersGathered: number;
  embersStoked: number;
  damageDealt: number;
  damageTaken: number;
  score: number;
  timeSurvived: number;
  relicsAcquired: string[];
}
