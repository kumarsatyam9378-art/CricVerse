/* =========================================
   VISUAL EFFECTS ENGINE (Particle System)
   Features: Confetti, Explosions, Screen Shake
   ========================================= */

class FXEngine {
    constructor() {
        this.canvas = document.createElement('canvas');
        this.ctx = this.canvas.getContext('2d');
        this.particles = [];
        this.isRunning = false;
        
        this.setupCanvas();
        window.addEventListener('resize', () => this.setupCanvas());
    }

    setupCanvas() {
        this.canvas.style.position = 'fixed';
        this.canvas.style.top = '0';
        this.canvas.style.left = '0';
        this.canvas.style.width = '100%';
        this.canvas.style.height = '100%';
        this.canvas.style.pointerEvents = 'none'; // Click-through
        this.canvas.style.zIndex = '9999'; // Topmost layer
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
        document.body.appendChild(this.canvas);
    }

    /**
     * Trigger Confetti (For Sixes/Wins)
     */
    triggerConfetti() {
        const colors = ['#00f2ff', '#7000ff', '#00ff9d', '#ffd700', '#ff0055'];
        
        for (let i = 0; i < 100; i++) {
            this.particles.push({
                x: window.innerWidth / 2,
                y: window.innerHeight / 2,
                vx: (Math.random() - 0.5) * 15,
                vy: (Math.random() - 0.5) * 15 - 5, // Upward bias
                size: Math.random() * 8 + 4,
                color: colors[Math.floor(Math.random() * colors.length)],
                life: 100,
                gravity: 0.2,
                drag: 0.96,
                type: 'square'
            });
        }
        this.startLoop();
    }

    /**
     * Trigger Explosion (For Wickets)
     */
    triggerExplosion() {
        for (let i = 0; i < 50; i++) {
            this.particles.push({
                x: window.innerWidth / 2,
                y: window.innerHeight / 2,
                vx: (Math.random() - 0.5) * 20,
                vy: (Math.random() - 0.5) * 20,
                size: Math.random() * 5 + 2,
                color: '#ff4500', // Fire color
                life: 60,
                gravity: 0,
                drag: 0.9,
                type: 'circle'
            });
        }
        this.screenShake();
        this.startLoop();
    }

    /**
     * Screen Shake Effect
     */
    screenShake() {
        const body = document.body;
        body.style.transition = 'transform 0.05s';
        
        let shakes = 0;
        const interval = setInterval(() => {
            const x = (Math.random() - 0.5) * 10;
            const y = (Math.random() - 0.5) * 10;
            body.style.transform = `translate(${x}px, ${y}px)`;
            shakes++;
            
            if (shakes > 10) {
                clearInterval(interval);
                body.style.transform = 'none';
            }
        }, 50);
    }

    startLoop() {
        if (!this.isRunning) {
            this.isRunning = true;
            this.animate();
        }
    }

    animate() {
        if (this.particles.length === 0) {
            this.isRunning = false;
            this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
            return;
        }

        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        for (let i = this.particles.length - 1; i >= 0; i--) {
            const p = this.particles[i];
            
            // Physics
            p.x += p.vx;
            p.y += p.vy;
            p.vx *= p.drag;
            p.vy *= p.drag;
            p.vy += p.gravity;
            p.life--;

            // Draw
            this.ctx.globalAlpha = p.life / 100;
            this.ctx.fillStyle = p.color;
            
            if (p.type === 'square') {
                this.ctx.fillRect(p.x, p.y, p.size, p.size);
            } else {
                this.ctx.beginPath();
                this.ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
                this.ctx.fill();
            }

            // Remove dead particles
            if (p.life <= 0) {
                this.particles.splice(i, 1);
            }
        }
        
        requestAnimationFrame(() => this.animate());
    }
}

export const VFX = new FXEngine();
