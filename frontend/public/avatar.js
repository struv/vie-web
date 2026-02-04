// Vie Avatar - Psychedelic Fractal Animation (OPTIMIZED)
// Inspired by William's visual project - organic, morphing, recursive, hypnotic
// "We exist in the void and it's up to us to build something beautiful from it"
// Performance: Targets stable 60fps on mobile and desktop

class VieAvatar {
  constructor(container) {
    this.container = container;
    this.time = 0;
    this.particles = [];
    this.trails = [];
    this.fractalArms = [];
    
    // Device detection for adaptive performance
    this.isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    this.isLowEnd = this.isMobile || navigator.hardwareConcurrency < 4;
    
    // Adaptive configuration based on device
    this.config = {
      particleCount: this.isLowEnd ? 30 : 45, // Reduced from 60
      breathCycle: 4,
      armCount: this.isLowEnd ? 5 : 8, // Reduced arms on mobile
      maxTrails: 40, // Cap trail array size
      connectDistance: 60, // Only connect nearby particles
      noiseOctaves: this.isLowEnd ? 2 : 3, // Reduce noise complexity on mobile
      targetFPS: 60,
      drawConnections: !this.isLowEnd // Skip expensive O(n²) connections on mobile
    };
    
    // Performance monitoring
    this.frameCount = 0;
    this.lastFPSUpdate = 0;
    this.currentFPS = 60;
    
    // Animation frame handle for cleanup
    this.animationFrame = null;
    
    this.init();
  }
  
  init() {
    // Create canvas + ASCII structure
    this.canvas = document.createElement('canvas');
    this.canvas.className = 'avatar-canvas';
    this.ctx = this.canvas.getContext('2d', { 
      alpha: true,
      desynchronized: true // Performance hint for browsers
    });
    
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
    
    // Initialize particles with varied behaviors
    for (let i = 0; i < this.config.particleCount; i++) {
      const angle = (i / this.config.particleCount) * Math.PI * 2;
      this.particles.push({
        angle: angle,
        baseAngle: angle,
        speed: 0.3 + Math.random() * 0.5,
        distance: 40 + Math.random() * 80,
        baseDistance: 40 + Math.random() * 80,
        size: 0.8 + Math.random() * 2,
        phase: Math.random() * Math.PI * 2,
        orbitSpeed: 0.4 + Math.random() * 0.6,
        spiralPhase: Math.random() * Math.PI * 2,
        chaosAmount: 0.3 + Math.random() * 0.7,
        // Cache computed values
        x: 0,
        y: 0,
        currentSize: 1
      });
    }
    
    // Initialize fractal spiral arms
    for (let i = 0; i < this.config.armCount; i++) {
      this.fractalArms.push({
        baseAngle: (i / this.config.armCount) * Math.PI * 2,
        rotationSpeed: 0.1 + Math.random() * 0.15,
        phase: Math.random() * Math.PI * 2
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
  
  // Optimized multi-octave noise - cached trig where possible
  noise(x, y, octaves = 3) {
    let val = 0;
    let amplitude = 1;
    let frequency = 1;
    
    for (let i = 0; i < octaves; i++) {
      val += amplitude * (
        Math.sin(x * frequency * 0.8 + this.time) *
        Math.cos(y * frequency * 1.2 - this.time * 0.7) +
        Math.sin((x + y) * frequency * 0.5 + this.time * 0.3)
      );
      amplitude *= 0.5;
      frequency *= 2;
    }
    
    return val;
  }
  
  // Breathing effect - slower, more organic
  getBreath() {
    return 1 + 0.25 * Math.sin(this.time / this.config.breathCycle);
  }
  
  // Kaleidoscopic color cycling
  getBreathColor(alpha = 1, hueShift = 0) {
    const t = (Math.sin(this.time / this.config.breathCycle) + 1) / 2;
    const hue = (270 + hueShift + t * 60) % 360; // Purple to pink range
    const sat = 70 + t * 30;
    const light = 60 + t * 20;
    return `hsla(${hue}, ${sat}%, ${light}%, ${alpha})`;
  }
  
  updateParticles() {
    const breath = this.getBreath();
    const breathPhase = this.time / this.config.breathCycle;
    
    this.particles.forEach((p, i) => {
      // Organic orbit with chaos
      p.angle += p.speed * 0.015;
      
      // Lissajous-style complex orbit
      const orbitX = Math.sin(p.angle * p.orbitSpeed + p.phase) * p.distance;
      const orbitY = Math.cos(p.angle * p.orbitSpeed * 0.8 + p.spiralPhase) * p.distance * 0.7;
      
      // Add fractal noise field (use adaptive octaves)
      const noiseX = this.noise(p.baseAngle, this.time * 0.5, this.config.noiseOctaves) * 15 * p.chaosAmount;
      const noiseY = this.noise(this.time * 0.5, p.baseAngle, this.config.noiseOctaves) * 12 * p.chaosAmount;
      
      // Spiral expansion/contraction
      const spiralMod = 1 + 0.3 * Math.sin(this.time * 0.4 + p.spiralPhase);
      
      // Kaleidoscopic folding - particles reflect and mirror
      const foldAngle = Math.sin(this.time * 0.2) * Math.PI / 6;
      const foldX = Math.cos(foldAngle);
      const foldY = Math.sin(foldAngle);
      
      p.x = this.centerX + (orbitX * spiralMod + noiseX) * breath * foldX;
      p.y = this.centerY + (orbitY * spiralMod + noiseY) * breath * foldY;
      
      // Pulsing size based on distance from center
      const distFromCenter = Math.sqrt(
        Math.pow(p.x - this.centerX, 2) + 
        Math.pow(p.y - this.centerY, 2)
      );
      p.currentSize = p.size * (1 + 0.5 * Math.sin(this.time + distFromCenter * 0.05));
      
      // Create swirling trails with varied life (reduced spawn rate)
      if (Math.random() < 0.3) { // Reduced from 0.4
        this.trails.push({
          x: p.x,
          y: p.y,
          life: 0.8 + Math.random() * 0.4,
          size: p.currentSize * 0.7,
          color: this.getBreathColor(0.6, (i / this.config.particleCount) * 60)
        });
      }
    });
    
    // Decay trails organically and enforce max size
    this.trails = this.trails.filter(t => {
      t.life -= 0.015;
      return t.life > 0;
    });
    
    // Hard cap on trail array to prevent unbounded growth
    if (this.trails.length > this.config.maxTrails) {
      this.trails = this.trails.slice(-this.config.maxTrails);
    }
  }
  
  render() {
    const ctx = this.ctx;
    const breath = this.getBreath();
    
    // Optimized clear - use simpler fade instead of expensive blend
    // This is much faster than rgba compositing every frame
    ctx.globalAlpha = 0.2;
    ctx.fillStyle = '#000000';
    ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    ctx.globalAlpha = 1;
    
    // Draw fractal spiral arms (subtle background field)
    this.fractalArms.forEach((arm, i) => {
      const armAngle = arm.baseAngle + this.time * arm.rotationSpeed;
      const armLength = 120 * breath;
      
      ctx.strokeStyle = this.getBreathColor(0.03, i * 45);
      ctx.lineWidth = 2;
      ctx.beginPath();
      
      // Curved arm with recursive subdivisions
      for (let d = 0; d < armLength; d += 3) {
        const t = d / armLength;
        const spiral = Math.sin(5 * armAngle + d * 0.08 - this.time * 0.5) * 15 * t;
        const x = this.centerX + Math.cos(armAngle) * d + Math.cos(armAngle + Math.PI/2) * spiral;
        const y = this.centerY + Math.sin(armAngle) * d * 0.6 + Math.sin(armAngle + Math.PI/2) * spiral * 0.6;
        
        if (d === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      
      ctx.stroke();
    });
    
    // Pulsing concentric rings - breathing geometry
    for (let ring = 0; ring < 5; ring++) {
      const radius = (30 + ring * 25) * breath;
      const phase = this.time * 0.5 + ring * 0.5;
      const alpha = (Math.sin(phase) + 1) / 2 * 0.15;
      
      ctx.strokeStyle = this.getBreathColor(alpha, ring * 15);
      ctx.lineWidth = 1 + Math.sin(phase) * 0.5;
      ctx.beginPath();
      ctx.arc(this.centerX, this.centerY, radius, 0, Math.PI * 2);
      ctx.stroke();
    }
    
    // Recursive glow center
    const centerGlow = ctx.createRadialGradient(
      this.centerX, this.centerY, 0,
      this.centerX, this.centerY, 100 * breath
    );
    centerGlow.addColorStop(0, this.getBreathColor(0.1));
    centerGlow.addColorStop(0.3, this.getBreathColor(0.05));
    centerGlow.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = centerGlow;
    ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    
    // Draw trails with fade
    this.trails.forEach(t => {
      const trailAlpha = t.life * 0.5;
      ctx.fillStyle = t.color.replace(/[\d.]+\)$/g, `${trailAlpha})`);
      ctx.beginPath();
      ctx.arc(t.x, t.y, t.size, 0, Math.PI * 2);
      ctx.fill();
    });
    
    // Draw particles with neon glow
    this.particles.forEach((p, i) => {
      // Outer glow
      const glowGrad = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.currentSize * 6);
      const particleHue = (i / this.config.particleCount) * 60;
      glowGrad.addColorStop(0, this.getBreathColor(0.8, particleHue));
      glowGrad.addColorStop(0.4, this.getBreathColor(0.4, particleHue));
      glowGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
      
      ctx.fillStyle = glowGrad;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.currentSize * 6, 0, Math.PI * 2);
      ctx.fill();
      
      // Core particle
      ctx.fillStyle = this.getBreathColor(1, particleHue);
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.currentSize, 0, Math.PI * 2);
      ctx.fill();
    });
    
    // OPTIMIZED: Only draw connecting lines on desktop/high-end devices
    // This O(n²) operation was causing major frame drops on mobile
    if (this.config.drawConnections) {
      ctx.strokeStyle = this.getBreathColor(0.05);
      ctx.lineWidth = 0.5;
      const maxDist = this.config.connectDistance;
      const maxDistSq = maxDist * maxDist; // Avoid sqrt in loop
      
      for (let i = 0; i < this.particles.length; i++) {
        const p1 = this.particles[i];
        
        // Only check forward to avoid duplicate lines
        for (let j = i + 1; j < this.particles.length; j++) {
          const p2 = this.particles[j];
          const dx = p2.x - p1.x;
          const dy = p2.y - p1.y;
          const distSq = dx * dx + dy * dy;
          
          if (distSq < maxDistSq) {
            const dist = Math.sqrt(distSq); // Only sqrt if within range
            const alpha = (1 - dist / maxDist) * 0.1;
            ctx.strokeStyle = this.getBreathColor(alpha, (i + j) * 5);
            ctx.beginPath();
            ctx.moveTo(p1.x, p1.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.stroke();
          }
        }
      }
    }
    
    // Update CSS variables for symbol animation
    this.asciiContainer.style.setProperty('--breath-scale', breath);
    this.asciiContainer.style.setProperty('--breath-color', this.getBreathColor(1));
  }
  
  animate() {
    this.time += 0.016; // ~60fps time step
    this.updateParticles();
    this.render();
    
    // FPS monitoring (optional, can be removed in production)
    this.frameCount++;
    const now = performance.now();
    if (now - this.lastFPSUpdate > 1000) {
      this.currentFPS = Math.round(this.frameCount * 1000 / (now - this.lastFPSUpdate));
      this.frameCount = 0;
      this.lastFPSUpdate = now;
      // console.log('Avatar FPS:', this.currentFPS);
    }
    
    // Store animation frame ID for cleanup
    this.animationFrame = requestAnimationFrame(() => this.animate());
  }
  
  destroy() {
    // CRITICAL: Cancel animation frame to prevent memory leak
    if (this.animationFrame) {
      cancelAnimationFrame(this.animationFrame);
      this.animationFrame = null;
    }
    
    // Clean up DOM
    if (this.wrapper && this.wrapper.parentNode) {
      this.wrapper.remove();
    }
    
    // Clear arrays
    this.particles = [];
    this.trails = [];
    this.fractalArms = [];
    
    // Remove event listener
    window.removeEventListener('resize', this.resize);
  }
}

window.VieAvatar = VieAvatar;
