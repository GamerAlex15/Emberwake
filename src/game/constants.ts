import {
  Difficulty,
  EnemyType,
  Relic,
  VigilConfig,
  Weapon,
  WeaponType,
} from '../types/game';

export const ARENA_WIDTH = 2200;
export const ARENA_HEIGHT = 1600;

export const WEAPONS: Record<WeaponType, Weapon> = {
  SOLAR_LANCE: {
    id: 'SOLAR_LANCE',
    name: 'Solar Lance',
    description: 'Focused searing bolts of concentrated sunlight with piercing power.',
    fireRate: 4.8,
    damage: 28,
    speed: 780,
    range: 850,
    spread: 0.04,
    pierce: 2,
    energyCost: 6,
    color: '#ffb338',
  },
  CINDER_FLURRY: {
    id: 'CINDER_FLURRY',
    name: 'Cinder Flurry',
    description: 'Spreads five burning solar shards to decimate swarms at close range.',
    fireRate: 2.4,
    damage: 16, // per pellet
    speed: 680,
    range: 520,
    spread: 0.28,
    pierce: 1,
    energyCost: 14,
    color: '#ff7a1a',
  },
  CORONA_BEAM: {
    id: 'CORONA_BEAM',
    name: 'Corona Beam',
    description: 'A continuous stream of incandescent solar radiation.',
    fireRate: 12.0,
    damage: 9,
    speed: 950,
    range: 680,
    spread: 0.02,
    pierce: 3,
    energyCost: 4.5,
    color: '#ffe066',
  },
  DAWN_MORTAR: {
    id: 'DAWN_MORTAR',
    name: 'Dawn Mortar',
    description: 'Heavy orb of compressed dawn light that explodes on impact.',
    fireRate: 1.1,
    damage: 85,
    speed: 460,
    range: 750,
    spread: 0.05,
    pierce: 1,
    energyCost: 26,
    color: '#ff4d00',
  },
};

export const VIGILS: VigilConfig[] = [
  {
    number: 1,
    name: 'Ash Drift',
    subtitle: 'The embers stir amidst cold volcanic dust',
    lore: 'The sun died nine millennia ago. Only drifting ash remains, inhabited by mindless husks drawn to your faint warmth.',
    duration: 40,
    enemySpawnRate: 2.2,
    allowedEnemies: ['CINDER_HUSK'],
    skyColor: '#0a0d14',
    ambientAnomaly: 'Faint ash squalls sweep the perimeter.',
  },
  {
    number: 2,
    name: 'The Cold Eclipse',
    subtitle: 'Frost crystallizes across the obsidian floor',
    lore: 'The temperature plunges toward absolute darkness. Frigid wanderers emerge, freezing the ground you stand upon.',
    duration: 45,
    enemySpawnRate: 1.8,
    allowedEnemies: ['CINDER_HUSK', 'FROST_WANDERER', 'VOID_SPITTER'],
    skyColor: '#070f1a',
    ambientAnomaly: 'Bitter coronal frost slows unprotected souls.',
  },
  {
    number: 3,
    name: 'Umbral Swarm',
    subtitle: 'Skittering shadows claw from beneath the black glass',
    lore: 'A subterranean fissure breaches. Countless shadow crawlers and leechers surge directly toward the sacred Hearth.',
    duration: 50,
    enemySpawnRate: 1.2,
    allowedEnemies: ['CINDER_HUSK', 'UMBRAL_CRAWLER', 'ECLIPSE_LEECHER'],
    skyColor: '#0e0b16',
    ambientAnomaly: 'Frenzied swarm behavior targeting the Hearth.',
  },
  {
    number: 4,
    name: 'Corona Spires',
    subtitle: 'Monoliths of dark obsidian erupt from the void',
    lore: 'Ancient spires of dead matter rise, resonating with dark solar energy and firing pulses that crack the sky.',
    duration: 55,
    enemySpawnRate: 1.5,
    allowedEnemies: ['CINDER_HUSK', 'VOID_SPITTER', 'OBSIDIAN_SPIRE'],
    skyColor: '#120d1c',
    ambientAnomaly: 'Resonating spires project void waves across the sanctum.',
  },
  {
    number: 5,
    name: 'The Dread Penumbra',
    subtitle: 'Armored behemoths march against the light',
    lore: 'The Void Goliaths awaken. Clad in dense star-armor, they shatter stone with each strike and ward away scattered fire.',
    duration: 55,
    enemySpawnRate: 1.6,
    allowedEnemies: ['CINDER_HUSK', 'UMBRAL_CRAWLER', 'PENUMBRA_GOLIATH', 'VOID_SPITTER'],
    skyColor: '#160910',
    ambientAnomaly: 'Tremors announce the march of void titans.',
  },
  {
    number: 6,
    name: 'Eclipse Maelstrom',
    subtitle: 'Gravity warps as the dead star fractures',
    lore: 'The dead sun tugs violently at real space. Void Harbingers weave rifts, pulling shadows into swirling maelstroms.',
    duration: 60,
    enemySpawnRate: 1.3,
    allowedEnemies: ['UMBRAL_CRAWLER', 'FROST_WANDERER', 'VOID_HARBINGER', 'PENUMBRA_GOLIATH'],
    skyColor: '#14061a',
    ambientAnomaly: 'Dark matter currents distort projectile trajectories.',
  },
  {
    number: 7,
    name: 'The Ashen Legion',
    subtitle: 'All shadows assemble for the final siege',
    lore: 'The penultimate hour. The entire shadow legion mobilizes to extinguish your flame before the sovereign awakens.',
    duration: 65,
    enemySpawnRate: 0.95,
    allowedEnemies: [
      'CINDER_HUSK',
      'UMBRAL_CRAWLER',
      'VOID_SPITTER',
      'FROST_WANDERER',
      'OBSIDIAN_SPIRE',
      'PENUMBRA_GOLIATH',
      'VOID_HARBINGER',
    ],
    skyColor: '#180309',
    ambientAnomaly: 'Unchecked dark convergence from every horizon.',
  },
  {
    number: 8,
    name: 'The Hollow King',
    subtitle: 'The Extinction Sovereign rises to consume the final spark',
    lore: 'Born from the core of the dead sun, the Hollow King wields an obsidian crown of shattered stars. Survive the 3 phases of eclipse to rekindle dawn!',
    duration: 999, // Defeat boss to clear
    enemySpawnRate: 3.5,
    allowedEnemies: ['CINDER_HUSK', 'UMBRAL_CRAWLER'],
    bossSpawn: true,
    skyColor: '#0a0004',
    ambientAnomaly: 'The Hollow King commands the eclipse.',
  },
];

export const RELICS: Relic[] = [
  {
    id: 'SOLAR_AEGIS',
    name: 'Solar Aegis',
    description: 'Hearth reflects 50% of damage received back to all nearby enemies as holy fire.',
    rarity: 'COMMON',
    icon: 'Shield',
    effect: (mods) => {
      mods.hearthAegisReflect = true;
    },
  },
  {
    id: 'PYRE_TURRET',
    name: 'Pyre Sentry',
    description: 'The Hearth gains an automatic celestial turret that fires radiant bolts at incoming threats.',
    rarity: 'RARE',
    icon: 'Crosshair',
    effect: (mods) => {
      mods.hearthTurretUnlocked = true;
      mods.hearthTurretDamage += 25;
    },
  },
  {
    id: 'CINDERSTEP_BLAZE',
    name: 'Cinderstep Blaze',
    description: 'Dashing leaves a scorched trail of fire that burns any shadows passing through it.',
    rarity: 'COMMON',
    icon: 'Flame',
    effect: (mods) => {
      mods.dashLeavesFire = true;
    },
  },
  {
    id: 'DAWN_PIERCER',
    name: 'Dawn Piercer',
    description: 'All player projectiles gain +2 pierce and +15% travel speed.',
    rarity: 'COMMON',
    icon: 'Zap',
    effect: (mods) => {
      mods.pierceBonus += 2;
      mods.playerDamageMultiplier *= 1.1;
    },
  },
  {
    id: 'MAGNETAR_EMBERS',
    name: 'Magnetar Embers',
    description: 'Increases Ember pickup suction radius by 150%.',
    rarity: 'COMMON',
    icon: 'Compass',
    effect: (mods) => {
      mods.emberMagnetRadiusMultiplier *= 2.5;
    },
  },
  {
    id: 'PHOENIX_SANCTUM',
    name: 'Phoenix Sanctum',
    description: 'Standing inside the Hearth light grants +25% attack speed and +20% critical strike chance.',
    rarity: 'RARE',
    icon: 'Sun',
    effect: (mods) => {
      mods.inHearthBuff = true;
    },
  },
  {
    id: 'RADIANT_ORBITALS',
    name: 'Radiant Orbitals',
    description: 'Summons two glowing celestial motes that circle you, burning nearby foes and intercepting void bolts.',
    rarity: 'RARE',
    icon: 'Atom',
    effect: (mods) => {
      mods.orbitalMotesCount += 2;
    },
  },
  {
    id: 'SUPERNOVA_CATALYST',
    name: 'Supernova Catalyst',
    description: 'Supernova Purge radius increased by 40% and deals double damage to shielded foes.',
    rarity: 'RARE',
    icon: 'Sparkles',
    effect: (mods) => {
      mods.novaRadiusMultiplier *= 1.4;
    },
  },
  {
    id: 'BLAZING_TEMPO',
    name: 'Blazing Tempo',
    description: 'Player movement speed increased by 20% and dash cooldown reduced by 30%.',
    rarity: 'COMMON',
    icon: 'Wind',
    effect: (mods) => {
      mods.playerSpeedMultiplier *= 1.2;
    },
  },
  {
    id: 'CRIMSON_CRIT',
    name: 'Wrath of the Sun',
    description: '+25% critical strike chance dealing 2.2x damage on hit.',
    rarity: 'RARE',
    icon: 'Target',
    effect: (mods) => {
      mods.critChance += 0.25;
    },
  },
  {
    id: 'HEARTH_FORTRESS',
    name: 'Hearth Fortress',
    description: 'Hearth maximum integrity increased by +350 HP and expands its default light perimeter.',
    rarity: 'COMMON',
    icon: 'Castle',
    effect: (mods) => {
      mods.hearthMaxHealthBonus += 350;
    },
  },
  {
    id: 'CORONAL_CORE',
    name: 'Coronal Core',
    description: 'Maximum player health increased by +60 and personal light radius increased by 40%.',
    rarity: 'RARE',
    icon: 'Heart',
    effect: (mods) => {
      mods.playerMaxHealthBonus += 60;
      mods.playerLightRadiusMultiplier *= 1.4;
    },
  },
  {
    id: 'APEX_INCANDESCENCE',
    name: 'Apex Incandescence',
    description: 'Gain +40% all outgoing damage. The light rejects surrender.',
    rarity: 'LEGENDARY',
    icon: 'Crown',
    effect: (mods) => {
      mods.playerDamageMultiplier *= 1.4;
    },
  },
];

export const DIFFICULTY_MODIFIERS: Record<
  Difficulty,
  {
    playerHpMult: number;
    enemyHpMult: number;
    enemySpeedMult: number;
    spawnRateMult: number;
    label: string;
    description: string;
  }
> = {
  PILGRIM: {
    playerHpMult: 1.4,
    enemyHpMult: 0.8,
    enemySpeedMult: 0.88,
    spawnRateMult: 1.25, // slower spawns
    label: 'Pilgrim',
    description: 'Gentle warmth. Slower enemy tempo, resilient hearth.',
  },
  TORCHBEARER: {
    playerHpMult: 1.0,
    enemyHpMult: 1.0,
    enemySpeedMult: 1.0,
    spawnRateMult: 1.0,
    label: 'Torchbearer',
    description: 'The canonical siege. Unforgiving dark, true radiant challenge.',
  },
  HOLLOW_ECLIPSE: {
    playerHpMult: 0.8,
    enemyHpMult: 1.35,
    enemySpeedMult: 1.15,
    spawnRateMult: 0.78, // faster spawns
    label: 'Hollow Eclipse',
    description: 'Brutal abyss. Ravenous shadows, desperate defense.',
  },
};
