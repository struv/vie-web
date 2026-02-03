// Vie Avatar - Procedural Animation System (Optimized)
// Inspired by entity.html - 60fps canvas effects + CSS glow

class VieAvatar {
  constructor(container) {
    this.container = container;
    this.time = 0;
    this.particles = [];
    this.trails = [];
    this.config = { particleCount: 40, breathCycle: 4 };
    this.init();
  }
  
  init() {
    // Create canvas + ASCII structure
    this.canvas = document.createElement('canvas');
    this.canvas.className = 'avatar-canvas';
    this.ctx = this.canvas.getContext('2d');
    
    this.asciiContainer = document.createElement('div');
    this.asciiContainer.className = 'avatar-ascii';
    this.asciiContainer.innerHTML = `
      <div class="avatar-symbol">⟢</div>
      <div class="avatar-core">
        <span class="core-ring"></span>
        <span class="core-ring"></span>
        <span class="core-ring"></span>
      </div>
    `;
    
    this.wrapper = document.createElement('div');
    this.wrapper.className = 'avatar-wrapper';
    this.wrapper.appendChild(this.canvas);
    this.wrapper.appendChild(this.asciiContainer);
    this.container.appendChild(this.wrapper);
    
    // Initialize particles
    for (let i = 0; i < this.config.particleCount; i++) {
      this.particles.push({
        angle: (i / this.config.particleCount) * Math.PI * 2,
        speed: 0.3 + Math.random() * 0.4,
        distance: 50 + Math.random() * 60,
        size: 1 + Math.random() * 2,
        phase: Math.random() * Math.PI * 2,
        orbitSpeed: 0.5 + Math.random() * 0.5
      });
    }
    
    this.resize();
    window.addEventListener('resize', () => this.resize());
    this.animate();
  }
  
  resize() {
    const size = Math.min(this.container.getBoundingClientRect().width, 400);
    this.canvas.width = this.canvas.height = size;
    this.canvas.style.width = this.canvas.style.height = `${size}px`;
    this.centerX = this.centerY = size / 2;
  }
  
  noise(x, y) {
    return Math.sin(x * 1.3 + this.time) * Math.cos(y * 1.7 - this.time * 0.7);
  }
  
  getBreath() {
    return 1 + 0.2 * Math.sin(this.time / this.config.breathCycle);
  }
  
  getBreathColor(alpha = 1) {
    const t = (Math.sin(this.time / this.config.breathCycle) + 1) / 2;
    const r = Math.floor(183 + 72 * t);
    const g = Math.floor(148 + 67 * t);
    const b = Math.floor(246 - 246 * t);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  }
  
  updateParticles() {
    const breath = this.getBreath();
    
    this.particles.forEach(p => {
      p.angle += p.speed * 0.02;
      const orbitX = Math.sin(p.angle * p.orbitSpeed + p.phase) * p.distance;
      const orbitY = Math.cos(p.angle * p.orbitSpeed * 0.7 + p.phase) * p.distance * 0.6;
      
      p.x = this.centerX + orbitX * breath + this.noise(p.angle, this.time) * 5;
      p.y = this.centerY + orbitY * breath + this.noise(this.time, p.angle) * 3;
      
      // Energy trails
      if (Math.random() < 0.3) {
        this.trails.push({
          x: p.x, y: p.y, life: 1, size: p.size * 0.8,
          color: this.getBreathColor(0.6)
        });
      }
    });
    
    this.trails = this.trails.filter(t => (t.life -= 0.02) > 0);
  }
  
  render() {
    const ctx = this.ctx;
    const breath = this.getBreath();
    
    // Clear
    ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    
    // Background gradient
    const grad = ctx.createRadialGradient(
      this.centerX, this.centerY, 0,
      this.centerX, this.centerY, 150 * breath
    );
    grad.addColorStop(0, 'rgba(183, 148, 246, 0.05)');
    grad.addColorStop(0.5, 'rgba(183, 148, 246, 0.02)');
    grad.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    
    // Geometric rings
    ctx.strokeStyle = this.getBreathColor(0.1);
    ctx.lineWidth = 1;
    for (let i = 0; i < 3; i++) {
      ctx.beginPath();
      ctx.arc(this.centerX, this.centerY, (60 + i * 30) * breath, 0, Math.PI * 2);
      ctx.stroke();
    }
    
    // Energy field rings
    for (let i = 0; i < 2; i++) {
      const phase = this.time * 2 + i * Math.PI;
      const radius = 70 + Math.sin(phase) * 10;
      const alpha = (Math.sin(phase) + 1) / 2 * 0.3;
      ctx.strokeStyle = this.getBreathColor(alpha);
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(this.centerX, this.centerY, radius * breath, 0, Math.PI * 2);
      ctx.stroke();
    }
    
    // Trails
    this.trails.forEach(t => {
      ctx.fillStyle = t.color.replace(/[\d.]+\)$/g, `${t.life * 0.4})`);
      ctx.beginPath();
      ctx.arc(t.x, t.y, t.size, 0, Math.PI * 2);
      ctx.fill();
    });
    
    // Particles with glow
    this.particles.forEach(p => {
      const pGrad = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.size * 4);
      pGrad.addColorStop(0, this.getBreathColor(0.8));
      pGrad.addColorStop(0.5, this.getBreathColor(0.3));
      pGrad.addColorStop(1, this.getBreathColor(0));
      
      ctx.fillStyle = pGrad;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size * 4, 0, Math.PI * 2);
      ctx.fill();
      
      ctx.fillStyle = this.getBreathColor(1);
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fill();
    });
    
    // Update CSS variables for symbol animation
    this.asciiContainer.style.setProperty('--breath-scale', breath);
    this.asciiContainer.style.setProperty('--breath-color', this.getBreathColor(1));
  }
  
  animate() {
    this.time += 0.016;
    this.updateParticles();
    this.render();
    requestAnimationFrame(() => this.animate());
  }
  
  destroy() {
    this.wrapper.remove();
  }
}

window.VieAvatar = VieAvatar;
