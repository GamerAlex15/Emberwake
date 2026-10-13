import { soundEngine } from '../audio/soundEngine';
import {
  ARENA_HEIGHT,
  ARENA_WIDTH,
  DIFFICULTY_MODIFIERS,
  RELICS,
  VIGILS,
  WEAPONS,
} from './constants';
import { ParticleManager } from './particleSystem';
import {
  Difficulty,
  EmberOrb,
  Enemy,
  EnemyType,
  GameModifiers,
  GameState,
  GameStats,
  Hearth,
  Player,
  Projectile,
  Relic,
  VigilConfig,
  WeaponType,
} from '../types/game';

export class GameEngine {
  public state: GameState = 'TITLE_MENU';
  public difficulty: Difficulty = 'TORCHBEARER';
  public currentVigilIndex: number = 0;
  public vigilTimer: number = 0;
  public isPaused: boolean = false;

  // Entities
  public player: Player;
  public hearth: Hearth;
  public enemies: Enemy[] = [];
  public projectiles: Projectile[] = [];
  public embers: EmberOrb[] = [];
  public particles: ParticleManager = new ParticleManager();

  // Modifiers & Upgrades
  public modifiers: GameModifiers;
  public selectedRelicChoices: Relic[] = [];
  public unlockedRelicIds: Set<string> = new Set();

  // Stats
  public stats: GameStats = {
    vigilsCompleted: 0,
    shadesDefeated: 0,
    embersGathered: 0,
    embersStoked: 0,
    damageDealt: 0,
    damageTaken: 0,
    score: 0,
    timeSurvived: 0,
    relicsAcquired: [],
  };

  // Camera & Screen Shake
  public cameraX: number = 0;
  public cameraY: number = 0;
  public screenShake: number = 0;

  // Input states
  public keys: Record<string, boolean> = {};
  public mouseX: number = 0;
  public mouseY: number = 0;
  public isMouseDown: boolean = false;
  public autoFire: boolean = false;
  public autoAim: boolean = false;

  // Touch joystick states (for mobile)
  public moveStick: { x: number; y: number; active: boolean } = { x: 0, y: 0, active: false };
  public aimStick: { x: number; y: number; active: boolean } = { x: 0, y: 0, active: false };

  // Timers
  private enemySpawnTimer: number = 0;
  private weaponFireTimer: number = 0;
  private hearthStokeFeedbackTimer: number = 0;
  private slowTimer: number = 0;

  // Boss reference
  public activeBoss: Enemy | null = null;

  constructor() {
    this.modifiers = this.getDefaultModifiers();
    this.player = this.createDefaultPlayer();
    this.hearth = this.createDefaultHearth();
    this.resetCamera();
  }

  private getDefaultModifiers(): GameModifiers {
    return {
      playerDamageMultiplier: 1.0,
      playerFireRateMultiplier: 1.0,
      playerSpeedMultiplier: 1.0,
      playerMaxHealthBonus: 0,
      playerLightRadiusMultiplier: 1.0,
      emberMagnetRadiusMultiplier: 1.0,
      hearthMaxHealthBonus: 0,
      hearthTurretUnlocked: false,
      hearthTurretDamage: 25,
      hearthAegisReflect: false,
      dashLeavesFire: false,
      pierceBonus: 0,
      critChance: 0.05,
      novaRadiusMultiplier: 1.0,
      inHearthBuff: false,
      orbitalMotesCount: 0,
    };
  }

  private createDefaultPlayer(): Player {
    const diff = DIFFICULTY_MODIFIERS[this.difficulty];
    const baseHp = 100 * diff.playerHpMult;
    return {
      x: ARENA_WIDTH / 2,
      y: ARENA_HEIGHT / 2 + 100,
      vx: 0,
      vy: 0,
      radius: 16,
      speed: 260,
      maxHealth: baseHp,
      health: baseHp,
      energy: 100,
      maxEnergy: 100,
      energyRegen: 35,
      lightRadius: 180,
      angle: 0,
      dashCooldown: 0,
      dashMaxCooldown: 1.6,
      isDashing: false,
      dashDuration: 0,
      dashSpeed: 680,
      novaCooldown: 0,
      novaMaxCooldown: 14.0,
      activeWeapon: 'SOLAR_LANCE',
      embersCarried: 0,
      maxEmbersCarried: 999,
      invulnerableTime: 0,
    };
  }

  private createDefaultHearth(): Hearth {
    const diff = DIFFICULTY_MODIFIERS[this.difficulty];
    const baseHp = 500 * (diff.playerHpMult > 1 ? 1.25 : 1.0);
    return {
      x: ARENA_WIDTH / 2,
      y: ARENA_HEIGHT / 2,
      radius: 46,
      health: baseHp,
      maxHealth: baseHp,
      level: 1,
      embersInvested: 0,
      embersForNextLevel: 15,
      lightRadius: 280,
      baseLightRadius: 280,
      pulseTimer: 0,
      autoTurretCooldown: 0,
    };
  }

  public startGame(diff: Difficulty = 'TORCHBEARER') {
    this.difficulty = diff;
    this.currentVigilIndex = 0;
    this.vigilTimer = 0;
    this.modifiers = this.getDefaultModifiers();
    this.unlockedRelicIds.clear();
    this.player = this.createDefaultPlayer();
    this.hearth = this.createDefaultHearth();
    this.enemies = [];
    this.projectiles = [];
    this.embers = [];
    this.particles.clear();
    this.activeBoss = null;
    this.stats = {
      vigilsCompleted: 0,
      shadesDefeated: 0,
      embersGathered: 0,
      embersStoked: 0,
      damageDealt: 0,
      damageTaken: 0,
      score: 0,
      timeSurvived: 0,
      relicsAcquired: [],
    };
    this.state = 'PLAYING';
    this.isPaused = false;
    this.enemySpawnTimer = 0;

    // Immediately snap camera to player
    this.resetCamera();

    // Spawn 5 introductory drifting embers near the Hearth to stoke right away
    for (let i = 0; i < 5; i++) {
      const angle = (i * Math.PI * 2) / 5;
      const dist = 70 + Math.random() * 60;
      this.embers.push({
        id: `initial-ember-${i}`,
        x: this.hearth.x + Math.cos(angle) * dist,
        y: this.hearth.y + Math.sin(angle) * dist,
        vx: (Math.random() - 0.5) * 10,
        vy: (Math.random() - 0.5) * 10,
        value: 1,
        lifetime: 0,
      });
    }

    // Immediately spawn an initial perimeter siege wave (6 Cinder Husks)
    const currentVigil = this.getCurrentVigil();
    for (let i = 0; i < 6; i++) {
      this.spawnRandomEnemy(currentVigil, true);
    }

    soundEngine.startAmbient();
  }

  public getCurrentVigil(): VigilConfig {
    return VIGILS[Math.min(this.currentVigilIndex, VIGILS.length - 1)];
  }

  public update(dt: number) {
    if (this.state !== 'PLAYING' || this.isPaused) return;

    // Clamp dt to avoid physics tunnelling on lag spike
    const clampedDt = Math.min(dt, 0.05);

    this.stats.timeSurvived += clampedDt;
    this.vigilTimer += clampedDt;
    const currentVigil = this.getCurrentVigil();

    // Check Vigil Victory condition
    if (!currentVigil.bossSpawn) {
      if (this.vigilTimer >= currentVigil.duration) {
        this.completeVigil();
        return;
      }
    } else {
      // Boss vigil: spawns boss once if not present
      if (!this.activeBoss && this.enemies.filter((e) => e.isBoss).length === 0) {
        this.spawnHollowKing();
      }
    }

    // Update screen shake
    if (this.screenShake > 0) {
      this.screenShake = Math.max(0, this.screenShake - clampedDt * 22);
    }

    // Update Player & Cooldowns
    this.updatePlayer(clampedDt);

    // Update Hearth
    this.updateHearth(clampedDt);

    // Spawn & update enemies
    this.updateEnemies(clampedDt);

    // Update projectiles
    this.updateProjectiles(clampedDt);

    // Update embers
    this.updateEmbers(clampedDt);

    // Update particles & shockwaves
    this.particles.update(clampedDt);

    // Check Shockwave collisions (Supernova & Stomps)
    this.checkShockwaveCollisions();

    // Check win/loss
    if (this.player.health <= 0 || this.hearth.health <= 0) {
      this.triggerGameOver();
    }
  }

  private completeVigil() {
    this.stats.vigilsCompleted++;
    this.stats.score += 2500 * (this.currentVigilIndex + 1);
    soundEngine.playVigilComplete();

    // Push shockwave from hearth
    this.particles.addShockwave(this.hearth.x, this.hearth.y, 600, '#ffbf00', 100, true);

    // Destroy all non-boss enemies in a burst of light
    for (const enemy of this.enemies) {
      this.particles.addBurst(enemy.x, enemy.y, '#ffbf00', 12);
    }
    this.enemies = [];
    this.projectiles = [];

    if (this.currentVigilIndex >= VIGILS.length - 1) {
      // Victory over Hollow King!
      this.state = 'VICTORY';
      return;
    }

    // Prepare Relic choices for Forge
    this.prepareRelicChoices();
    this.state = 'FORGE_RELIC';
  }

  private prepareRelicChoices() {
    const available = RELICS.filter((r) => !this.unlockedRelicIds.has(r.id));
    if (available.length <= 3) {
      this.selectedRelicChoices = [...available];
    } else {
      // Pick 3 random relics
      const shuffled = [...available].sort(() => 0.5 - Math.random());
      this.selectedRelicChoices = shuffled.slice(0, 3);
    }
  }

  public chooseRelic(relic: Relic) {
    this.unlockedRelicIds.add(relic.id);
    this.stats.relicsAcquired.push(relic.name);
    relic.effect(this.modifiers);

    // Apply immediate stat boosts
    if (this.modifiers.playerMaxHealthBonus > 0) {
      const diff = 100 * DIFFICULTY_MODIFIERS[this.difficulty].playerHpMult + this.modifiers.playerMaxHealthBonus;
      this.player.maxHealth = diff;
      this.player.health = Math.min(this.player.health + 40, this.player.maxHealth);
    }
    if (this.modifiers.hearthMaxHealthBonus > 0) {
      const diff = 500 + this.modifiers.hearthMaxHealthBonus;
      this.hearth.maxHealth = diff;
      this.hearth.health = Math.min(this.hearth.health + 100, this.hearth.maxHealth);
    }

    // Heal player and hearth partially on vigil clear
    this.player.health = Math.min(this.player.health + 35, this.player.maxHealth);
    this.hearth.health = Math.min(this.hearth.health + 150, this.hearth.maxHealth);

    // Advance to next vigil
    this.currentVigilIndex++;
    this.vigilTimer = 0;
    this.state = 'PLAYING';
  }

  private triggerGameOver() {
    this.state = 'GAME_OVER';
    soundEngine.playExplosion();
  }

  private updatePlayer(dt: number) {
    const p = this.player;

    // Invulnerability timer
    if (p.invulnerableTime > 0) {
      p.invulnerableTime = Math.max(0, p.invulnerableTime - dt);
    }

    // Slow timer recovery
    if (this.slowTimer > 0) {
      this.slowTimer = Math.max(0, this.slowTimer - dt);
    }

    // Energy regeneration
    p.energy = Math.min(p.maxEnergy, p.energy + p.energyRegen * dt);

    // Cooldown updates
    if (p.dashCooldown > 0) {
      p.dashCooldown = Math.max(0, p.dashCooldown - dt);
    }
    if (p.novaCooldown > 0) {
      p.novaCooldown = Math.max(0, p.novaCooldown - dt);
    }
    if (this.weaponFireTimer > 0) {
      this.weaponFireTimer = Math.max(0, this.weaponFireTimer - dt);
    }

    // Dashing logic
    if (p.isDashing) {
      p.dashDuration -= dt;
      if (this.modifiers.dashLeavesFire) {
        this.particles.addFireTrail(p.x, p.y);
      }
      if (p.dashDuration <= 0) {
        p.isDashing = false;
      }
    }

    // Movement calculation
    let moveX = 0;
    let moveY = 0;

    // Keyboard movement
    if (this.keys['KeyW'] || this.keys['ArrowUp']) moveY -= 1;
    if (this.keys['KeyS'] || this.keys['ArrowDown']) moveY += 1;
    if (this.keys['KeyA'] || this.keys['ArrowLeft']) moveX -= 1;
    if (this.keys['KeyD'] || this.keys['ArrowRight']) moveX += 1;

    // Mobile Virtual Joystick movement
    if (this.moveStick.active) {
      moveX = this.moveStick.x;
      moveY = this.moveStick.y;
    }

    const moveMag = Math.hypot(moveX, moveY);
    let speed = p.speed * this.modifiers.playerSpeedMultiplier;
    if (this.slowTimer > 0) speed *= 0.65;

    if (p.isDashing) {
      speed = p.dashSpeed;
    }

    if (moveMag > 0.05) {
      const normX = moveX / moveMag;
      const normY = moveY / moveMag;
      p.vx = normX * speed;
      p.vy = normY * speed;
    } else if (!p.isDashing) {
      p.vx *= 0.78;
      p.vy *= 0.78;
    }

    p.x += p.vx * dt;
    p.y += p.vy * dt;

    // Boundaries clamp
    const margin = p.radius + 30;
    p.x = Math.max(margin, Math.min(ARENA_WIDTH - margin, p.x));
    p.y = Math.max(margin, Math.min(ARENA_HEIGHT - margin, p.y));

    // Aim calculation
    if (this.aimStick.active && Math.hypot(this.aimStick.x, this.aimStick.y) > 0.2) {
      p.angle = Math.atan2(this.aimStick.y, this.aimStick.x);
    } else if (this.autoAim && this.enemies.length > 0) {
      // Find nearest enemy
      let nearestDist = Infinity;
      let targetEnemy: Enemy | null = null;
      for (const e of this.enemies) {
        const d = Math.hypot(e.x - p.x, e.y - p.y);
        if (d < nearestDist) {
          nearestDist = d;
          targetEnemy = e;
        }
      }
      if (targetEnemy) {
        p.angle = Math.atan2(targetEnemy.y - p.y, targetEnemy.x - p.x);
      }
    } else {
      // Aim toward world mouse coords
      const worldMouseX = this.mouseX + this.cameraX;
      const worldMouseY = this.mouseY + this.cameraY;
      p.angle = Math.atan2(worldMouseY - p.y, worldMouseX - p.x);
    }

    // Firing trigger
    const shouldFire = this.isMouseDown || this.autoFire || this.aimStick.active;
    if (shouldFire && this.weaponFireTimer <= 0) {
      this.fireActiveWeapon();
    }

    // Check if player is standing in Hearth aura
    const distToHearth = Math.hypot(p.x - this.hearth.x, p.y - this.hearth.y);
    const inHearth = distToHearth < this.hearth.lightRadius;
    if (inHearth && this.modifiers.inHearthBuff) {
      // Regeneration in hearth
      p.health = Math.min(p.maxHealth, p.health + 4 * dt);
    }

    // Ambient spark trails from Sparkbearer
    this.particles.addAmbientEmbers(p.x, p.y, p.radius + 10);
  }

  public dash() {
    const p = this.player;
    if (p.dashCooldown > 0 || p.isDashing) return;

    p.isDashing = true;
    p.dashDuration = 0.22;
    p.dashCooldown = p.dashMaxCooldown * (this.modifiers.playerSpeedMultiplier > 1 ? 0.75 : 1.0);
    p.invulnerableTime = 0.25;

    // Dash towards movement direction or aim direction
    let angle = p.angle;
    if (Math.hypot(p.vx, p.vy) > 10) {
      angle = Math.atan2(p.vy, p.vx);
    }

    p.vx = Math.cos(angle) * p.dashSpeed;
    p.vy = Math.sin(angle) * p.dashSpeed;

    soundEngine.playDash();
    this.particles.addBurst(p.x, p.y, '#ffb703', 14);
    this.screenShake = 2.5;
  }

  public triggerSupernova() {
    const p = this.player;
    if (p.novaCooldown > 0) return;

    p.novaCooldown = p.novaMaxCooldown;
    const radius = 380 * this.modifiers.novaRadiusMultiplier;
    const damage = 220 * this.modifiers.playerDamageMultiplier;

    soundEngine.playSupernova();
    this.screenShake = 12;

    // Player shockwave
    this.particles.addShockwave(p.x, p.y, radius, '#ffe49e', damage, true);
    this.particles.addBurst(p.x, p.y, '#ffffff', 32);

    // Cleanse all nearby enemy projectiles
    for (let i = this.projectiles.length - 1; i >= 0; i--) {
      const proj = this.projectiles[i];
      if (!proj.isPlayer && Math.hypot(proj.x - p.x, proj.y - p.y) < radius) {
        this.particles.addSparks(proj.x, proj.y, '#ff9e00', 4);
        this.projectiles.splice(i, 1);
      }
    }
  }

  public switchWeapon(type: WeaponType) {
    this.player.activeWeapon = type;
  }

  private fireActiveWeapon() {
    const p = this.player;
    const weapon = WEAPONS[p.activeWeapon];

    let effectiveRate = weapon.fireRate * this.modifiers.playerFireRateMultiplier;
    if (this.modifiers.inHearthBuff && Math.hypot(p.x - this.hearth.x, p.y - this.hearth.y) < this.hearth.lightRadius) {
      effectiveRate *= 1.25;
    }

    this.weaponFireTimer = 1.0 / effectiveRate;

    const angle = p.angle;
    const spawnX = p.x + Math.cos(angle) * (p.radius + 6);
    const spawnY = p.y + Math.sin(angle) * (p.radius + 6);
    const pierce = weapon.pierce + this.modifiers.pierceBonus;

    switch (weapon.id) {
      case 'SOLAR_LANCE': {
        const spread = (Math.random() - 0.5) * weapon.spread;
        const fireAngle = angle + spread;
        this.projectiles.push({
          id: Math.random().toString(),
          x: spawnX,
          y: spawnY,
          vx: Math.cos(fireAngle) * weapon.speed,
          vy: Math.sin(fireAngle) * weapon.speed,
          radius: 4.5,
          damage: weapon.damage * this.modifiers.playerDamageMultiplier,
          color: weapon.color,
          isPlayer: true,
          pierce,
          piercedCount: 0,
          lifetime: 0,
          maxLifetime: weapon.range / weapon.speed,
          trail: true,
        });
        soundEngine.playSolarShot();
        this.screenShake = Math.max(this.screenShake, 1.2);
        break;
      }
      case 'CINDER_FLURRY': {
        const pellets = 5;
        const baseSpread = weapon.spread;
        for (let i = 0; i < pellets; i++) {
          const spreadOffset = ((i - (pellets - 1) / 2) / ((pellets - 1) / 2)) * baseSpread + (Math.random() - 0.5) * 0.06;
          const fireAngle = angle + spreadOffset;
          const spd = weapon.speed * (0.9 + Math.random() * 0.2);
          this.projectiles.push({
            id: Math.random().toString(),
            x: spawnX,
            y: spawnY,
            vx: Math.cos(fireAngle) * spd,
            vy: Math.sin(fireAngle) * spd,
            radius: 3.5,
            damage: weapon.damage * this.modifiers.playerDamageMultiplier,
            color: weapon.color,
            isPlayer: true,
            pierce,
            piercedCount: 0,
            lifetime: 0,
            maxLifetime: weapon.range / spd,
            trail: false,
          });
        }
        soundEngine.playFlurryShot();
        this.screenShake = Math.max(this.screenShake, 2.5);
        break;
      }
      case 'CORONA_BEAM': {
        const spread = (Math.random() - 0.5) * weapon.spread;
        const fireAngle = angle + spread;
        this.projectiles.push({
          id: Math.random().toString(),
          x: spawnX,
          y: spawnY,
          vx: Math.cos(fireAngle) * weapon.speed,
          vy: Math.sin(fireAngle) * weapon.speed,
          radius: 3.5,
          damage: weapon.damage * this.modifiers.playerDamageMultiplier,
          color: weapon.color,
          isPlayer: true,
          pierce,
          piercedCount: 0,
          lifetime: 0,
          maxLifetime: weapon.range / weapon.speed,
          trail: true,
        });
        soundEngine.playBeamTick();
        break;
      }
      case 'DAWN_MORTAR': {
        this.projectiles.push({
          id: Math.random().toString(),
          x: spawnX,
          y: spawnY,
          vx: Math.cos(angle) * weapon.speed,
          vy: Math.sin(angle) * weapon.speed,
          radius: 8,
          damage: weapon.damage * this.modifiers.playerDamageMultiplier,
          color: weapon.color,
          isPlayer: true,
          pierce: 1,
          piercedCount: 0,
          lifetime: 0,
          maxLifetime: weapon.range / weapon.speed,
          explosive: true,
          explosionRadius: 130,
          trail: true,
        });
        soundEngine.playExplosion();
        this.screenShake = Math.max(this.screenShake, 4.0);
        break;
      }
    }
  }

  private updateHearth(dt: number) {
    const h = this.hearth;
    const p = this.player;

    // Check if player is near Hearth to stoke embers
    const dist = Math.hypot(p.x - h.x, p.y - h.y);
    const interactionRange = h.radius + 50;

    if (dist < interactionRange && p.embersCarried > 0) {
      // Transfer embers
      const transferCount = Math.min(p.embersCarried, Math.ceil(p.embersCarried * 0.15) + 1);
      p.embersCarried -= transferCount;
      h.embersInvested += transferCount;
      this.stats.embersStoked += transferCount;
      this.stats.score += transferCount * 25;

      // Stoke Hearth HP
      h.health = Math.min(h.maxHealth, h.health + transferCount * 1.5);
      p.health = Math.min(p.maxHealth, p.health + transferCount * 0.8);

      this.hearthStokeFeedbackTimer += dt;
      if (this.hearthStokeFeedbackTimer > 0.15) {
        soundEngine.playHearthStoke();
        this.particles.addFloatingText(h.x, h.y - h.radius, `+${transferCount} EMBER`, '#ffdd55');
        this.hearthStokeFeedbackTimer = 0;
      }

      // Check Hearth Level up
      if (h.embersInvested >= h.embersForNextLevel) {
        h.level++;
        h.embersForNextLevel = Math.floor(h.embersForNextLevel * 1.6) + 10;
        h.lightRadius = h.baseLightRadius + h.level * 25;
        this.particles.addShockwave(h.x, h.y, 450, '#ffbf00', 80, true);
        this.particles.addFloatingText(h.x, h.y, `HEARTH ASCENDED: TIER ${h.level}!`, '#ffe680', true);
        soundEngine.playVigilComplete();
        this.screenShake = 6;
      }
    }

    // Auto Turret Relic
    if (this.modifiers.hearthTurretUnlocked) {
      h.autoTurretCooldown += dt;
      if (h.autoTurretCooldown >= 1.2 && this.enemies.length > 0) {
        h.autoTurretCooldown = 0;
        // Target nearest enemy
        let nearest: Enemy | null = null;
        let minDist = 650;
        for (const e of this.enemies) {
          const d = Math.hypot(e.x - h.x, e.y - h.y);
          if (d < minDist) {
            minDist = d;
            nearest = e;
          }
        }
        if (nearest) {
          const turretAngle = Math.atan2(nearest.y - h.y, nearest.x - h.x);
          this.projectiles.push({
            id: Math.random().toString(),
            x: h.x,
            y: h.y,
            vx: Math.cos(turretAngle) * 620,
            vy: Math.sin(turretAngle) * 620,
            radius: 5,
            damage: this.modifiers.hearthTurretDamage,
            color: '#ffc83b',
            isPlayer: true,
            pierce: 1,
            piercedCount: 0,
            lifetime: 0,
            maxLifetime: 1.2,
            trail: true,
          });
          soundEngine.playSolarShot();
        }
      }
    }

    // Ambient Hearth Embers
    this.particles.addAmbientEmbers(h.x, h.y, h.lightRadius * 0.7);
  }

  private updateEnemies(dt: number) {
    const currentVigil = this.getCurrentVigil();
    const diff = DIFFICULTY_MODIFIERS[this.difficulty];

    // Spawn timer
    this.enemySpawnTimer += dt;
    const targetInterval = currentVigil.enemySpawnRate * diff.spawnRateMult;

    if (this.enemySpawnTimer >= targetInterval && this.enemies.length < 55) {
      this.enemySpawnTimer = 0;
      this.spawnRandomEnemy(currentVigil);
    }

    // Update each enemy
    const p = this.player;
    const h = this.hearth;

    for (let i = this.enemies.length - 1; i >= 0; i--) {
      const e = this.enemies[i];

      // Handle boss special AI
      if (e.isBoss) {
        this.updateHollowKing(e, dt);
        continue;
      }

      // Target selection: Hearth or Player
      const distToPlayer = Math.hypot(p.x - e.x, p.y - e.y);
      const distToHearth = Math.hypot(h.x - e.x, h.y - e.y);

      let targetX = p.x;
      let targetY = p.y;
      if (e.targetHearth || distToHearth < 280) {
        targetX = h.x;
        targetY = h.y;
      }

      const angleToTarget = Math.atan2(targetY - e.y, targetX - e.x);
      const speed = e.speed * diff.enemySpeedMult;

      // Special behaviors by enemy type
      if (e.type === 'VOID_SPITTER') {
        // Keep distance and shoot
        if (distToPlayer < 380) {
          // Back away slightly
          e.vx = -Math.cos(angleToTarget) * speed * 0.6;
          e.vy = -Math.sin(angleToTarget) * speed * 0.6;
        } else {
          e.vx = Math.cos(angleToTarget) * speed * 0.8;
          e.vy = Math.sin(angleToTarget) * speed * 0.8;
        }

        e.shootCooldown = (e.shootCooldown || 0) + dt;
        if (e.shootCooldown > 2.8) {
          e.shootCooldown = 0;
          this.fireEnemyProjectile(e.x, e.y, angleToTarget, 260, 16, '#9b5de5');
        }
      } else if (e.type === 'FROST_WANDERER') {
        e.vx = Math.cos(angleToTarget) * speed;
        e.vy = Math.sin(angleToTarget) * speed;

        e.shootCooldown = (e.shootCooldown || 0) + dt;
        if (e.shootCooldown > 3.4) {
          e.shootCooldown = 0;
          // Shoot freezing cone
          for (let k = -1; k <= 1; k++) {
            this.fireEnemyProjectile(e.x, e.y, angleToTarget + k * 0.22, 220, 12, '#64dfdf');
          }
        }
      } else if (e.type === 'VOID_HARBINGER') {
        e.specialTimer = (e.specialTimer || 0) + dt;
        if (e.specialTimer > 4.5) {
          e.specialTimer = 0;
          // Teleport to random spot near player
          const teleAngle = Math.random() * Math.PI * 2;
          const teleDist = 200 + Math.random() * 150;
          this.particles.addBurst(e.x, e.y, '#7209b7', 16);
          e.x = Math.max(100, Math.min(ARENA_WIDTH - 100, p.x + Math.cos(teleAngle) * teleDist));
          e.y = Math.max(100, Math.min(ARENA_HEIGHT - 100, p.y + Math.sin(teleAngle) * teleDist));
          this.particles.addBurst(e.x, e.y, '#7209b7', 16);

          // Fire 4 cross projectiles
          for (let dir = 0; dir < 4; dir++) {
            this.fireEnemyProjectile(e.x, e.y, (dir * Math.PI) / 2, 240, 15, '#b5179e');
          }
        }
        e.vx = Math.cos(angleToTarget) * speed * 0.5;
        e.vy = Math.sin(angleToTarget) * speed * 0.5;
      } else if (e.type === 'OBSIDIAN_SPIRE') {
        // Stationary, pulses dark waves
        e.vx = 0;
        e.vy = 0;
        e.specialTimer = (e.specialTimer || 0) + dt;
        if (e.specialTimer > 3.2) {
          e.specialTimer = 0;
          this.particles.addShockwave(e.x, e.y, 220, '#560bad', 18, false);
          soundEngine.playExplosion();
        }
      } else {
        // Standard pursuers (Cinder Husk, Umbral Crawler, Penumbra Goliath, Eclipse Leecher)
        e.vx = Math.cos(angleToTarget) * speed;
        e.vy = Math.sin(angleToTarget) * speed;
      }

      e.x += e.vx * dt;
      e.y += e.vy * dt;

      // Contact collision with Player
      if (distToPlayer < e.radius + p.radius && p.invulnerableTime <= 0 && !p.isDashing) {
        this.damagePlayer(e.damage);
        p.invulnerableTime = 0.6;
        if (e.type === 'FROST_WANDERER') {
          this.slowTimer = 2.0;
        }
      }

      // Contact collision with Hearth
      if (distToHearth < e.radius + h.radius) {
        this.damageHearth(e.damage * dt * 1.5);
        if (this.modifiers.hearthAegisReflect) {
          e.health -= 35 * dt;
          this.particles.addSparks(e.x, e.y, '#ffb703', 2);
        }
      }
    }
  }

  private spawnRandomEnemy(vigil: VigilConfig, isInitial: boolean = false) {
    const types = vigil.allowedEnemies;
    const type = types[Math.floor(Math.random() * types.length)];
    const diff = DIFFICULTY_MODIFIERS[this.difficulty];

    // Spawn around Hearth in a ring, closer for initial wave so action starts instantly
    const spawnAngle = Math.random() * Math.PI * 2;
    const spawnDist = isInitial
      ? 360 + Math.random() * 120
      : 520 + Math.random() * 220;

    const x = Math.max(60, Math.min(ARENA_WIDTH - 60, this.hearth.x + Math.cos(spawnAngle) * spawnDist));
    const y = Math.max(60, Math.min(ARENA_HEIGHT - 60, this.hearth.y + Math.sin(spawnAngle) * spawnDist));


    let enemy: Enemy;
    switch (type) {
      case 'CINDER_HUSK':
        enemy = {
          id: Math.random().toString(),
          type,
          name: 'Cinder Husk',
          x,
          y,
          vx: 0,
          vy: 0,
          radius: 14,
          maxHealth: 45 * diff.enemyHpMult,
          health: 45 * diff.enemyHpMult,
          speed: 130,
          damage: 14,
          emberValue: 2,
          scoreValue: 40,
          color: '#3d3434',
          targetHearth: Math.random() > 0.6,
        };
        break;
      case 'UMBRAL_CRAWLER':
        enemy = {
          id: Math.random().toString(),
          type,
          name: 'Umbral Crawler',
          x,
          y,
          vx: 0,
          vy: 0,
          radius: 12,
          maxHealth: 30 * diff.enemyHpMult,
          health: 30 * diff.enemyHpMult,
          speed: 210,
          damage: 10,
          emberValue: 2,
          scoreValue: 50,
          color: '#1a1024',
          targetHearth: true,
        };
        break;
      case 'VOID_SPITTER':
        enemy = {
          id: Math.random().toString(),
          type,
          name: 'Void Spitter',
          x,
          y,
          vx: 0,
          vy: 0,
          radius: 17,
          maxHealth: 70 * diff.enemyHpMult,
          health: 70 * diff.enemyHpMult,
          speed: 110,
          damage: 16,
          emberValue: 4,
          scoreValue: 80,
          color: '#5b1784',
          targetHearth: false,
          shootCooldown: Math.random() * 2,
        };
        break;
      case 'FROST_WANDERER':
        enemy = {
          id: Math.random().toString(),
          type,
          name: 'Frost Wanderer',
          x,
          y,
          vx: 0,
          vy: 0,
          radius: 19,
          maxHealth: 90 * diff.enemyHpMult,
          health: 90 * diff.enemyHpMult,
          speed: 95,
          damage: 18,
          emberValue: 5,
          scoreValue: 110,
          color: '#3a7ca5',
          targetHearth: false,
          shootCooldown: Math.random() * 2,
        };
        break;
      case 'ECLIPSE_LEECHER':
        enemy = {
          id: Math.random().toString(),
          type,
          name: 'Eclipse Leecher',
          x,
          y,
          vx: 0,
          vy: 0,
          radius: 15,
          maxHealth: 55 * diff.enemyHpMult,
          health: 55 * diff.enemyHpMult,
          speed: 165,
          damage: 15,
          emberValue: 3,
          scoreValue: 65,
          color: '#49111c',
          targetHearth: true,
        };
        break;
      case 'OBSIDIAN_SPIRE':
        enemy = {
          id: Math.random().toString(),
          type,
          name: 'Obsidian Spire',
          x,
          y,
          vx: 0,
          vy: 0,
          radius: 28,
          maxHealth: 220 * diff.enemyHpMult,
          health: 220 * diff.enemyHpMult,
          speed: 0,
          damage: 22,
          emberValue: 12,
          scoreValue: 240,
          color: '#10002b',
          targetHearth: false,
          specialTimer: 0,
        };
        break;
      case 'PENUMBRA_GOLIATH':
        enemy = {
          id: Math.random().toString(),
          type,
          name: 'Penumbra Goliath',
          x,
          y,
          vx: 0,
          vy: 0,
          radius: 32,
          maxHealth: 320 * diff.enemyHpMult,
          health: 320 * diff.enemyHpMult,
          shield: 140,
          maxShield: 140,
          speed: 85,
          damage: 28,
          emberValue: 16,
          scoreValue: 350,
          color: '#240046',
          targetHearth: Math.random() > 0.5,
        };
        break;
      case 'VOID_HARBINGER':
        enemy = {
          id: Math.random().toString(),
          type,
          name: 'Void Harbinger',
          x,
          y,
          vx: 0,
          vy: 0,
          radius: 22,
          maxHealth: 240 * diff.enemyHpMult,
          health: 240 * diff.enemyHpMult,
          speed: 130,
          damage: 24,
          emberValue: 14,
          scoreValue: 300,
          color: '#7b2cbf',
          targetHearth: false,
          specialTimer: 0,
        };
        break;
      default:
        enemy = {
          id: Math.random().toString(),
          type: 'CINDER_HUSK',
          name: 'Cinder Husk',
          x,
          y,
          vx: 0,
          vy: 0,
          radius: 14,
          maxHealth: 45,
          health: 45,
          speed: 130,
          damage: 14,
          emberValue: 2,
          scoreValue: 40,
          color: '#3d3434',
          targetHearth: false,
        };
    }

    this.enemies.push(enemy);
  }

  private spawnHollowKing() {
    const diff = DIFFICULTY_MODIFIERS[this.difficulty];
    const bossHp = 2400 * diff.enemyHpMult;
    const boss: Enemy = {
      id: 'hollow-king',
      type: 'HOLLOW_KING',
      name: 'The Hollow King',
      x: ARENA_WIDTH / 2,
      y: ARENA_HEIGHT / 2 - 350,
      vx: 0,
      vy: 0,
      radius: 54,
      maxHealth: bossHp,
      health: bossHp,
      speed: 110,
      damage: 35,
      emberValue: 60,
      scoreValue: 10000,
      color: '#07000c',
      isBoss: true,
      bossPhase: 1,
      targetHearth: false,
      shootCooldown: 0,
      specialTimer: 0,
    };
    this.enemies.push(boss);
    this.activeBoss = boss;
    soundEngine.playBossRoar();
    this.screenShake = 16;
    this.particles.addShockwave(boss.x, boss.y, 500, '#3c096c', 0, false);
    this.particles.addFloatingText(boss.x, boss.y - 70, 'THE HOLLOW KING AWAKENS', '#ff4d6d', true);
  }

  private updateHollowKing(boss: Enemy, dt: number) {
    const p = this.player;
    const h = this.hearth;
    const healthPercent = boss.health / boss.maxHealth;

    // Phase checks
    if (healthPercent <= 0.33 && boss.bossPhase !== 3) {
      boss.bossPhase = 3;
      soundEngine.playBossRoar();
      this.screenShake = 14;
      this.particles.addShockwave(boss.x, boss.y, 450, '#ff0055', 0, false);
      this.particles.addFloatingText(boss.x, boss.y - 70, 'PHASE III: STAR EATER', '#ff0055', true);
    } else if (healthPercent <= 0.66 && boss.bossPhase === 1) {
      boss.bossPhase = 2;
      soundEngine.playBossRoar();
      this.screenShake = 10;
      this.particles.addShockwave(boss.x, boss.y, 400, '#9d4edd', 0, false);
      this.particles.addFloatingText(boss.x, boss.y - 70, 'PHASE II: ECLIPSE MAW', '#9d4edd', true);
    }

    // Boss movement & attacks based on phase
    const distToPlayer = Math.hypot(p.x - boss.x, p.y - boss.y);
    const angleToPlayer = Math.atan2(p.y - boss.y, p.x - boss.x);

    boss.shootCooldown = (boss.shootCooldown || 0) + dt;
    boss.specialTimer = (boss.specialTimer || 0) + dt;

    if (boss.bossPhase === 1) {
      // Phase 1: Drifts toward player, fires radial star needles every 2.4s
      boss.vx = Math.cos(angleToPlayer) * boss.speed;
      boss.vy = Math.sin(angleToPlayer) * boss.speed;

      if (boss.shootCooldown > 2.4) {
        boss.shootCooldown = 0;
        // 8-way star burst
        for (let i = 0; i < 8; i++) {
          const needleAngle = (i * Math.PI) / 4;
          this.fireEnemyProjectile(boss.x, boss.y, needleAngle, 280, 16, '#c77dff');
        }
        soundEngine.playEnemyHit();
      }
    } else if (boss.bossPhase === 2) {
      // Phase 2: Faster, sweeps sweeping crescent waves, summons shadow crawlers
      boss.vx = Math.cos(angleToPlayer) * (boss.speed * 1.25);
      boss.vy = Math.sin(angleToPlayer) * (boss.speed * 1.25);

      if (boss.shootCooldown > 1.8) {
        boss.shootCooldown = 0;
        // Targeted spread
        for (let i = -2; i <= 2; i++) {
          this.fireEnemyProjectile(boss.x, boss.y, angleToPlayer + i * 0.18, 330, 20, '#e0aaff');
        }
      }

      if (boss.specialTimer > 6.0) {
        boss.specialTimer = 0;
        // Stomp and summon 3 Crawlers
        this.particles.addShockwave(boss.x, boss.y, 320, '#5a189a', 25, false);
        this.screenShake = 8;
        soundEngine.playExplosion();
        for (let s = 0; s < 3; s++) {
          const spawnAngle = Math.random() * Math.PI * 2;
          this.enemies.push({
            id: Math.random().toString(),
            type: 'UMBRAL_CRAWLER',
            name: 'Hollow Larva',
            x: boss.x + Math.cos(spawnAngle) * 80,
            y: boss.y + Math.sin(spawnAngle) * 80,
            vx: 0,
            vy: 0,
            radius: 12,
            maxHealth: 25,
            health: 25,
            speed: 230,
            damage: 10,
            emberValue: 1,
            scoreValue: 30,
            color: '#240046',
            targetHearth: true,
          });
        }
      }
    } else {
      // Phase 3: Frenzied, 12-way rapid barrage, ground crushing slam
      boss.vx = Math.cos(angleToPlayer) * (boss.speed * 1.45);
      boss.vy = Math.sin(angleToPlayer) * (boss.speed * 1.45);

      if (boss.shootCooldown > 1.4) {
        boss.shootCooldown = 0;
        for (let i = 0; i < 12; i++) {
          const spiralAngle = (i * Math.PI) / 6 + (this.vigilTimer % Math.PI);
          this.fireEnemyProjectile(boss.x, boss.y, spiralAngle, 310, 22, '#ff0055');
        }
      }

      if (boss.specialTimer > 4.5) {
        boss.specialTimer = 0;
        // Giant Eclipse Slam
        this.particles.addShockwave(boss.x, boss.y, 480, '#ff0055', 35, false);
        this.screenShake = 15;
        soundEngine.playSupernova();
      }
    }

    boss.x += boss.vx * dt;
    boss.y += boss.vy * dt;

    // Contact damage
    if (distToPlayer < boss.radius + p.radius && p.invulnerableTime <= 0 && !p.isDashing) {
      this.damagePlayer(boss.damage);
      p.invulnerableTime = 0.8;
      this.screenShake = 7;
    }

    // Contact with Hearth
    const distToHearth = Math.hypot(h.x - boss.x, h.y - boss.y);
    if (distToHearth < boss.radius + h.radius) {
      this.damageHearth(boss.damage * dt * 2);
    }
  }

  private fireEnemyProjectile(x: number, y: number, angle: number, speed: number, damage: number, color: string) {
    this.projectiles.push({
      id: Math.random().toString(),
      x,
      y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      radius: 5.5,
      damage,
      color,
      isPlayer: false,
      pierce: 1,
      piercedCount: 0,
      lifetime: 0,
      maxLifetime: 3.5,
      trail: true,
    });
  }

  private updateProjectiles(dt: number) {
    const p = this.player;
    const h = this.hearth;

    for (let i = this.projectiles.length - 1; i >= 0; i--) {
      const proj = this.projectiles[i];
      proj.x += proj.vx * dt;
      proj.y += proj.vy * dt;
      proj.lifetime += dt;

      // Particle trail
      if (proj.trail && Math.random() > 0.4) {
        this.particles.addSparks(proj.x, proj.y, proj.color, 1, 40);
      }

      // Check lifetime or out of bounds
      if (
        proj.lifetime >= proj.maxLifetime ||
        proj.x < 0 ||
        proj.x > ARENA_WIDTH ||
        proj.y < 0 ||
        proj.y > ARENA_HEIGHT
      ) {
        if (proj.explosive) {
          this.detonateExplosive(proj);
        }
        this.projectiles.splice(i, 1);
        continue;
      }

      if (proj.isPlayer) {
        // Collide with enemies
        let removed = false;
        for (let j = this.enemies.length - 1; j >= 0; j--) {
          const enemy = this.enemies[j];
          const dist = Math.hypot(enemy.x - proj.x, enemy.y - proj.y);
          if (dist < enemy.radius + proj.radius) {
            // Hit enemy
            this.hitEnemy(enemy, proj.damage);
            proj.piercedCount++;

            if (proj.explosive) {
              this.detonateExplosive(proj);
              this.projectiles.splice(i, 1);
              removed = true;
              break;
            }

            if (proj.piercedCount >= proj.pierce) {
              this.particles.addSparks(proj.x, proj.y, proj.color, 6);
              this.projectiles.splice(i, 1);
              removed = true;
              break;
            }
          }
        }
        if (removed) continue;
      } else {
        // Collide with Player
        const distToPlayer = Math.hypot(p.x - proj.x, p.y - proj.y);
        if (distToPlayer < p.radius + proj.radius && p.invulnerableTime <= 0 && !p.isDashing) {
          this.damagePlayer(proj.damage);
          this.particles.addSparks(proj.x, proj.y, proj.color, 8);
          this.projectiles.splice(i, 1);
          continue;
        }

        // Collide with Hearth
        const distToHearth = Math.hypot(h.x - proj.x, h.y - proj.y);
        if (distToHearth < h.radius + proj.radius) {
          this.damageHearth(proj.damage);
          this.particles.addSparks(proj.x, proj.y, proj.color, 8);
          this.projectiles.splice(i, 1);
          continue;
        }
      }
    }
  }

  private detonateExplosive(proj: Projectile) {
    const radius = proj.explosionRadius || 120;
    this.particles.addShockwave(proj.x, proj.y, radius, '#ff5100', proj.damage, true);
    this.particles.addBurst(proj.x, proj.y, '#ff8000', 24);
    soundEngine.playExplosion();
    this.screenShake = 6;

    // Damage all enemies in explosion radius
    for (let j = this.enemies.length - 1; j >= 0; j--) {
      const e = this.enemies[j];
      const d = Math.hypot(e.x - proj.x, e.y - proj.y);
      if (d < radius + e.radius) {
        this.hitEnemy(e, proj.damage);
      }
    }
  }

  private hitEnemy(enemy: Enemy, damage: number) {
    const isCrit = Math.random() < this.modifiers.critChance;
    const finalDamage = isCrit ? damage * 2.2 : damage;

    this.stats.damageDealt += finalDamage;

    // Check shield
    if (enemy.shield && enemy.shield > 0) {
      if (enemy.shield >= finalDamage) {
        enemy.shield -= finalDamage;
        this.particles.addFloatingText(enemy.x, enemy.y, `${Math.round(finalDamage)}`, '#70d6ff');
      } else {
        const overflow = finalDamage - enemy.shield;
        enemy.shield = 0;
        enemy.health -= overflow;
        this.particles.addFloatingText(enemy.x, enemy.y, 'SHIELD BROKEN!', '#70d6ff', true);
      }
    } else {
      enemy.health -= finalDamage;
      this.particles.addFloatingText(
        enemy.x,
        enemy.y,
        `${Math.round(finalDamage)}`,
        isCrit ? '#ff4d00' : '#ffe6a7',
        isCrit
      );
    }

    soundEngine.playEnemyHit();
    this.particles.addSparks(enemy.x, enemy.y, '#ffa600', 4);

    if (enemy.health <= 0) {
      this.killEnemy(enemy);
    }
  }

  private killEnemy(enemy: Enemy) {
    const idx = this.enemies.indexOf(enemy);
    if (idx !== -1) {
      this.enemies.splice(idx, 1);
    }

    this.stats.shadesDefeated++;
    this.stats.score += enemy.scoreValue;
    this.particles.addBurst(enemy.x, enemy.y, enemy.color, enemy.isBoss ? 48 : 16);

    // Spawn Embers
    const emberCount = enemy.emberValue;
    for (let i = 0; i < emberCount; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 40 + Math.random() * 80;
      this.embers.push({
        id: Math.random().toString(),
        x: enemy.x,
        y: enemy.y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        value: 1,
        lifetime: 0,
      });
    }

    if (enemy.isBoss) {
      this.activeBoss = null;
      this.completeVigil();
    }
  }

  private updateEmbers(dt: number) {
    const p = this.player;
    const h = this.hearth;
    const magnetRadius = 140 * this.modifiers.emberMagnetRadiusMultiplier;

    for (let i = this.embers.length - 1; i >= 0; i--) {
      const ember = this.embers[i];
      ember.lifetime += dt;

      // Friction
      ember.vx *= 0.94;
      ember.vy *= 0.94;

      // Magnet pull toward player or hearth
      const distToPlayer = Math.hypot(p.x - ember.x, p.y - ember.y);
      const distToHearth = Math.hypot(h.x - ember.x, h.y - ember.y);

      if (distToPlayer < magnetRadius) {
        const angle = Math.atan2(p.y - ember.y, p.x - ember.x);
        const pullSpeed = 440;
        ember.vx += Math.cos(angle) * pullSpeed * dt;
        ember.vy += Math.sin(angle) * pullSpeed * dt;
      } else if (distToHearth < h.lightRadius * 0.7) {
        // Gravitates slowly toward hearth if already inside hearth aura
        const angle = Math.atan2(h.y - ember.y, h.x - ember.x);
        ember.vx += Math.cos(angle) * 180 * dt;
        ember.vy += Math.sin(angle) * 180 * dt;
      }

      ember.x += ember.vx * dt;
      ember.y += ember.vy * dt;

      // Collection by player
      if (distToPlayer < p.radius + 14) {
        p.embersCarried += ember.value;
        this.stats.embersGathered += ember.value;
        soundEngine.playEmberPickup();
        this.particles.addSparks(ember.x, ember.y, '#ffd166', 4);
        this.embers.splice(i, 1);
        continue;
      }

      // Auto collection by hearth if pulled into core
      if (distToHearth < h.radius) {
        h.health = Math.min(h.maxHealth, h.health + 1);
        h.embersInvested++;
        this.stats.embersStoked++;
        soundEngine.playEmberPickup();
        this.particles.addSparks(ember.x, ember.y, '#ffd166', 4);
        this.embers.splice(i, 1);
        continue;
      }

      // Despawn after 35 seconds
      if (ember.lifetime > 35) {
        this.embers.splice(i, 1);
      }
    }
  }

  private checkShockwaveCollisions() {
    const shockwaves = this.particles.getShockwaves();
    const p = this.player;

    for (const sw of shockwaves) {
      if (sw.damage && sw.damage > 0) {
        if (sw.isPlayer) {
          // Hits enemies
          for (let i = this.enemies.length - 1; i >= 0; i--) {
            const e = this.enemies[i];
            const dist = Math.hypot(e.x - sw.x, e.y - sw.y);
            if (dist < sw.radius + e.radius && dist > sw.radius - 40) {
              this.hitEnemy(e, sw.damage);
            }
          }
        } else {
          // Enemy shockwave hitting player
          const dist = Math.hypot(p.x - sw.x, p.y - sw.y);
          if (dist < sw.radius + p.radius && dist > sw.radius - 35 && p.invulnerableTime <= 0) {
            this.damagePlayer(sw.damage);
            p.invulnerableTime = 0.5;
          }
        }
      }
    }
  }

  private damagePlayer(amount: number) {
    this.player.health = Math.max(0, this.player.health - amount);
    this.stats.damageTaken += amount;
    soundEngine.playPlayerHurt();
    this.screenShake = 6;
    this.particles.addFloatingText(this.player.x, this.player.y - 20, `-${Math.round(amount)}`, '#e63946', true);
  }

  private damageHearth(amount: number) {
    this.hearth.health = Math.max(0, this.hearth.health - amount);
    this.screenShake = Math.max(this.screenShake, 3);
    this.particles.addSparks(this.hearth.x, this.hearth.y, '#ff4d00', 3);
  }

  public resetCamera() {
    this.cameraX = this.player.x - window.innerWidth / 2;
    this.cameraY = this.player.y - window.innerHeight / 2;
  }
}
