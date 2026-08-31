import { useEffect, useRef } from "react";
import s from "./particleHero.module.scss";

interface Particle {
  x: number;
  y: number;
  targetX: number;
  targetY: number;
  vx: number;
  vy: number;
  size: number;
  color: string;
  alpha: number;
  ease: number;
}

const ParticleHero = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<Particle[]>([]);
  const mouseRef = useRef({ x: -1000, y: -1000 });
  const animationRef = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const config = {
      particleCount: 1400,
      particleSize: 1.3,
      mouseRadius: 130,
      text: "DEhub",
      fontSize: 160,
      colors: ["#c9a96e", "#e8e4dc", "#8b9dc3", "#d4c4a8", "#f5f0e8"],
    };

    const resize = () => {
      const parent = canvas.parentElement;
      if (!parent) return;
      canvas.width = parent.offsetWidth;
      canvas.height = parent.offsetHeight;
      initParticles();
    };

    const getTextPositions = (text: string) => {
      const tempCanvas = document.createElement("canvas");
      const tempCtx = tempCanvas.getContext("2d");
      if (!tempCtx) return [];

      tempCanvas.width = canvas.width;
      tempCanvas.height = canvas.height;

      tempCtx.font = `300 ${config.fontSize}px Georgia, serif`;
      tempCtx.fillStyle = "white";
      tempCtx.textAlign = "center";
      tempCtx.textBaseline = "middle";
      tempCtx.fillText(text, canvas.width / 2, canvas.height / 2);

      const imageData = tempCtx.getImageData(0, 0, canvas.width, canvas.height);
      const positions: { x: number; y: number }[] = [];
      const step = 4;

      for (let y = 0; y < canvas.height; y += step) {
        for (let x = 0; x < canvas.width; x += step) {
          const index = (y * canvas.width + x) * 4;
          if (imageData.data[index + 3] > 128) {
            positions.push({ x, y });
          }
        }
      }
      return positions;
    };

    const initParticles = () => {
      const positions = getTextPositions(config.text);
      const count = Math.max(config.particleCount, positions.length);
      const particles: Particle[] = [];

      for (let i = 0; i < count; i++) {
        const targetX =
          i < positions.length
            ? positions[i].x
            : Math.random() * canvas.width;
        const targetY =
          i < positions.length
            ? positions[i].y
            : Math.random() * canvas.height;

        particles.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          targetX,
          targetY,
          vx: 0,
          vy: 0,
          size: Math.random() * config.particleSize + 0.5,
          color: config.colors[Math.floor(Math.random() * config.colors.length)],
          alpha: Math.random() * 0.5 + 0.3,
          ease: Math.random() * 0.025 + 0.015,
        });
      }

      particlesRef.current = particles;
    };

    const animate = () => {
      ctx.fillStyle = "rgba(10, 10, 15, 0.12)";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      const mouse = mouseRef.current;

      particlesRef.current.forEach((p) => {
        // Mouse repulsion
        const dx = mouse.x - p.x;
        const dy = mouse.y - p.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < config.mouseRadius) {
          const force = (config.mouseRadius - dist) / config.mouseRadius;
          p.vx -= (dx / dist) * force * 2.5;
          p.vy -= (dy / dist) * force * 2.5;
        }

        // Ease to target
        p.vx += (p.targetX - p.x) * p.ease;
        p.vy += (p.targetY - p.y) * p.ease;
        p.vx *= 0.94;
        p.vy *= 0.94;
        p.x += p.vx;
        p.y += p.vy;

        // Draw
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.globalAlpha = p.alpha;
        ctx.fill();
      });

      ctx.globalAlpha = 1;
      animationRef.current = requestAnimationFrame(animate);
    };

    // Mouse events
    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      mouseRef.current = {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      };
    };

    const handleMouseLeave = () => {
      mouseRef.current = { x: -1000, y: -1000 };
    };

    canvas.addEventListener("mousemove", handleMouseMove);
    canvas.addEventListener("mouseleave", handleMouseLeave);
    window.addEventListener("resize", resize);

    resize();
    animate();

    return () => {
      cancelAnimationFrame(animationRef.current);
      canvas.removeEventListener("mousemove", handleMouseMove);
      canvas.removeEventListener("mouseleave", handleMouseLeave);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <div className={s.particleHero}>
      <canvas ref={canvasRef} className={s.canvas} />
      <div className={s.content}>
        <h1 className={s.title}>DEhub</h1>
        <p className={s.subtitle}>Deutsch lernen = DSD bestehen</p>
      </div>
    </div>
  );
};

export default ParticleHero;