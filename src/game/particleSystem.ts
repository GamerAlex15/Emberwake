import { FloatingText, Particle, Shockwave } from '../types/game';

export class ParticleManager {
  private particles: Particle[] = [];
  private floatingTexts: FloatingText[] = [];
  private shockwaves: Shockwave[] = [];
  private maxParticles: number = 400;

  public update(dt: number) {
    // Update particles
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.lifetime += dt;
      p.alpha = Math.max(0, 1 - p.lifetime / p.maxLifetime);

      if (p.lifetime >= p.maxLifetime) {
        this.particles.splice(i, 1);
      }
    }

    // Update floating texts
    for (let i = this.floatingTexts.length - 1; i >= 0; i--) {
      const ft = this.floatingTexts[i];
      ft.y -= 28 * dt;
      ft.lifetime += dt;
      ft.alpha = Math.max(0, 1 - ft.lifetime / 1.1);

      if (ft.lifetime >= 1.1) {
        this.floatingTexts.splice(i, 1);
      }
    }

    // Update shockwaves
    for (let i = this.shockwaves.length - 1; i >= 0; i--) {
      const sw = this.shockwaves[i];
      const progress = sw.radius / sw.maxRadius;
      sw.radius += (sw.maxRadius - sw.radius) * 7.5 * dt + 120 * dt;
      sw.alpha = Math.max(0, 1 - progress);

      if (sw.radius >= sw.maxRadius * 0.98 || sw.alpha <= 0.02) {
        this.shockwaves.splice(i, 1);
      }
    }
  }

  public addSparks(x: number, y: number, color: string, count: number = 8, speed: number = 180) {
    if (this.particles.length >= this.maxParticles) return;
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const spd = (0.3 + Math.random() * 0.7) * speed;
      this.particles.push({
        x,
        y,
        vx: Math.cos(angle) * spd,
        vy: Math.sin(angle) * spd,
        radius: 1.5 + Math.random() * 2.5,
        color,
        alpha: 1,
        lifetime: 0,
        maxLifetime: 0.25 + Math.random() * 0.35,
        decay: 1,
        glow: true,
      });
    }
  }

  public addBurst(x: number, y: number, color: string, count: number = 24) {
    this.addSparks(x, y, color, count, 260);
    // Add smoke/dissipation
    for (let i = 0; i < Math.floor(count / 2); i++) {
      const angle = Math.random() * Math.PI * 2;
      const spd = Math.random() * 70;
      this.particles.push({
        x,
        y,
        vx: Math.cos(angle) * spd,
        vy: Math.sin(angle) * spd,
        radius: 3 + Math.random() * 5,
        color: '#2b1b16',
        alpha: 0.6,
        lifetime: 0,
        maxLifetime: 0.5 + Math.random() * 0.4,
        decay: 1,
      });
    }
  }

  public addFireTrail(x: number, y: number) {
    if (this.particles.length >= this.maxParticles) return;
    this.particles.push({
      x: x + (Math.random() - 0.5) * 12,
      y: y + (Math.random() - 0.5) * 12,
      vx: (Math.random() - 0.5) * 20,
      vy: (Math.random() - 0.5) * 20 - 15,
      radius: 4 + Math.random() * 4,
      color: Math.random() > 0.4 ? '#ff7300' : '#ffb82e',
      alpha: 0.9,
      lifetime: 0,
      maxLifetime: 0.8 + Math.random() * 0.4,
      decay: 1,
      glow: true,
    });
  }

  public addAmbientEmbers(cx: number, cy: number, radius: number) {
    if (this.particles.length >= this.maxParticles || Math.random() > 0.3) return;
    const angle = Math.random() * Math.PI * 2;
    const dist = Math.random() * radius;
    this.particles.push({
      x: cx + Math.cos(angle) * dist,
      y: cy + Math.sin(angle) * dist,
      vx: (Math.random() - 0.5) * 25,
      vy: -15 - Math.random() * 25, // drifts upwards
      radius: 1 + Math.random() * 2,
      color: '#ffc83b',
      alpha: 0.7,
      lifetime: 0,
      maxLifetime: 1.2 + Math.random() * 1.0,
      decay: 1,
      glow: true,
    });
  }

  public addFloatingText(x: number, y: number, text: string, color: string = '#fdf3de', isCrit: boolean = false) {
    this.floatingTexts.push({
      id: Math.random().toString(),
      x: x + (Math.random() - 0.5) * 16,
      y: y - 10,
      text,
      color,
      alpha: 1,
      lifetime: 0,
      fontSize: isCrit ? 18 : 13,
      isCrit,
    });
  }

  public addShockwave(x: number, y: number, maxRadius: number, color: string = '#ffa726', damage: number = 0, isPlayer: boolean = false) {
    this.shockwaves.push({
      x,
      y,
      radius: 15,
      maxRadius,
      color,
      alpha: 0.9,
      damage,
      isPlayer,
    });
  }

  public render(ctx: CanvasRenderingContext2D) {
    // Render particles
    for (let i = 0; i < this.particles.length; i++) {
      const p = this.particles[i];
      ctx.save();
      ctx.globalAlpha = p.alpha;
      ctx.fillStyle = p.color;
      if (p.glow) {
        ctx.shadowColor = p.color;
        ctx.shadowBlur = 8;
      }
      ctx.beginPath();
      ctx.arc(p.x, p.y, Math.max(0.5, p.radius * p.alpha), 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

    // Render shockwaves
    for (let i = 0; i < this.shockwaves.length; i++) {
      const sw = this.shockwaves[i];
      ctx.save();
      ctx.globalAlpha = sw.alpha;
      ctx.strokeStyle = sw.color;
      ctx.lineWidth = 4 * sw.alpha + 1;
      ctx.shadowColor = sw.color;
      ctx.shadowBlur = 12;
      ctx.beginPath();
      ctx.arc(sw.x, sw.y, sw.radius, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();
    }

    // Render floating combat numbers
    for (let i = 0; i < this.floatingTexts.length; i++) {
      const ft = this.floatingTexts[i];
      ctx.save();
      ctx.globalAlpha = ft.alpha;
      ctx.font = `${ft.isCrit ? 'bold' : 'normal'} ${ft.fontSize}px 'JetBrains Mono', monospace`;
      ctx.fillStyle = ft.color;
      ctx.textAlign = 'center';
      if (ft.isCrit) {
        ctx.shadowColor = '#ff5100';
        ctx.shadowBlur = 8;
      }
      ctx.fillText(ft.text, ft.x, ft.y);
      ctx.restore();
    }
  }

  public getShockwaves(): Shockwave[] {
    return this.shockwaves;
  }

  public clear() {
    this.particles = [];
    this.floatingTexts = [];
    this.shockwaves = [];
  }
}
