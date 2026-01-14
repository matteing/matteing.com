"use client";

import { useEffect, useRef } from "react";
import styles from "./NyanBackground.module.css";

interface Star {
  x: number;
  y: number;
  size: number;
  opacity: number;
  speed: number;
  twinkleSpeed: number;
  twinklePhase: number;
  color: string;
}

interface Nebula {
  x: number;
  y: number;
  radius: number;
  color: string;
  vx: number;
  vy: number;
}

interface ShootingStar {
  x: number;
  y: number;
  vx: number;
  vy: number;
  length: number;
  opacity: number;
  size: number;
}

export function NyanBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId: number;
    let stars: Star[] = [];
    let nebulas: Nebula[] = [];
    let shootingStars: ShootingStar[] = [];

    // Mouse state for smooth interpolation
    let mouseX = 0;
    let mouseY = 0;
    let currentMouseX = 0;
    let currentMouseY = 0;

    const handleMouseMove = (e: MouseEvent) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
    };

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      // Initialize center
      mouseX = canvas.width / 2;
      mouseY = canvas.height / 2;
      currentMouseX = mouseX;
      currentMouseY = mouseY;
      initSpace();
    };

    const initSpace = () => {
      stars = [];
      nebulas = [];
      shootingStars = [];

      // Init Stars - Optimized density
      const numStars = Math.floor((canvas.width * canvas.height) / 4000);
      const starColors = ["#ffffff", "#ffe9c4", "#d4fbff"]; // White, warm white, cool blue

      for (let i = 0; i < numStars; i++) {
        stars.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          size: Math.random() * 1.5 + 0.5, // Slightly smaller for performance
          opacity: Math.random(),
          speed: Math.random() * 0.2 + 0.05, // Slower for smoother feel
          twinkleSpeed: Math.random() * 0.03 + 0.005,
          twinklePhase: Math.random() * Math.PI * 2,
          color: starColors[Math.floor(Math.random() * starColors.length)],
        });
      }

      // Init Nebulas - Fewer for performance
      const numNebulas = 4;
      const colors = [
        "rgba(76, 29, 149, 0.2)", // Deep Purple
        "rgba(59, 130, 246, 0.2)", // Bright Blue
        "rgba(236, 72, 153, 0.15)", // Pink
        "rgba(16, 185, 129, 0.1)", // Emerald (subtle)
        "rgba(99, 102, 241, 0.2)", // Indigo
        "rgba(139, 92, 246, 0.2)", // Violet
      ];

      for (let i = 0; i < numNebulas; i++) {
        nebulas.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          radius: Math.random() * 400 + 300, // Larger radius
          color: colors[Math.floor(Math.random() * colors.length)],
          vx: (Math.random() - 0.5) * 0.3,
          vy: (Math.random() - 0.5) * 0.3,
        });
      }
    };

    const drawSpace = () => {
      // Smooth mouse interpolation (Lerp) - Faster response
      currentMouseX += (mouseX - currentMouseX) * 0.1;
      currentMouseY += (mouseY - currentMouseY) * 0.1;

      // Clear
      ctx.fillStyle = "#020204";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      const cx = canvas.width / 2;
      const cy = canvas.height / 2;

      // Parallax offset - More dramatic
      const parallaxX = (currentMouseX - cx) * 0.08;
      const parallaxY = (currentMouseY - cy) * 0.08;

      // Draw Nebulas - Simplified rendering
      nebulas.forEach((nebula) => {
        const nx = nebula.x + parallaxX * 0.2;
        const ny = nebula.y + parallaxY * 0.2;

        const gradient = ctx.createRadialGradient(
          nx,
          ny,
          0,
          nx,
          ny,
          nebula.radius
        );
        gradient.addColorStop(0, nebula.color);
        gradient.addColorStop(1, "rgba(0,0,0,0)");

        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(nx, ny, nebula.radius, 0, Math.PI * 2);
        ctx.fill();

        // Move Nebula
        nebula.x += nebula.vx;
        nebula.y += nebula.vy;

        // Wrap around
        if (nebula.x < -nebula.radius) nebula.x = canvas.width + nebula.radius;
        if (nebula.x > canvas.width + nebula.radius) nebula.x = -nebula.radius;
        if (nebula.y < -nebula.radius) nebula.y = canvas.height + nebula.radius;
        if (nebula.y > canvas.height + nebula.radius) nebula.y = -nebula.radius;
      });

      // Draw Stars - Optimized (No shadowBlur, no globalCompositeOperation)
      stars.forEach((star) => {
        // Twinkle effect
        star.twinklePhase += star.twinkleSpeed;
        const twinkle = Math.sin(star.twinklePhase) * 0.3 + 0.7;
        const currentOpacity = star.opacity * twinkle;

        // Parallax
        const sx = star.x + parallaxX * star.speed * 3;
        const sy = star.y + parallaxY * star.speed * 3;

        ctx.fillStyle = star.color;
        ctx.globalAlpha = currentOpacity;

        ctx.beginPath();
        ctx.arc(sx, sy, star.size, 0, Math.PI * 2);
        ctx.fill();

        // Move star
        star.x -= star.speed;

        // Wrap around
        if (star.x < 0) {
          star.x = canvas.width;
          star.y = Math.random() * canvas.height;
        }
      });

      // Shooting Stars
      if (Math.random() < 0.002) {
        const startX = Math.random() * canvas.width;
        const startY = Math.random() * (canvas.height * 0.5);
        const angle = Math.PI / 4 + (Math.random() * 0.2 - 0.1);
        const speed = 10 + Math.random() * 5;

        shootingStars.push({
          x: startX,
          y: startY,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          length: 150 + Math.random() * 80,
          opacity: 1,
          size: Math.random() * 2 + 1,
        });
      }

      for (let i = shootingStars.length - 1; i >= 0; i--) {
        const star = shootingStars[i];

        star.x += star.vx;
        star.y += star.vy;
        star.opacity -= 0.008;

        if (
          star.opacity <= 0 ||
          star.x > canvas.width + star.length ||
          star.y > canvas.height + star.length
        ) {
          shootingStars.splice(i, 1);
          continue;
        }

        const speed = Math.sqrt(star.vx * star.vx + star.vy * star.vy);
        const tailX = star.x - star.vx * (star.length / speed);
        const tailY = star.y - star.vy * (star.length / speed);

        const gradient = ctx.createLinearGradient(star.x, star.y, tailX, tailY);
        gradient.addColorStop(0, `rgba(255, 255, 255, ${star.opacity})`);
        gradient.addColorStop(1, `rgba(255, 255, 255, 0)`);

        ctx.beginPath();
        ctx.strokeStyle = gradient;
        ctx.lineWidth = star.size;
        ctx.lineCap = "round";
        ctx.moveTo(star.x, star.y);
        ctx.lineTo(tailX, tailY);
        ctx.stroke();

        ctx.beginPath();
        ctx.fillStyle = `rgba(255, 255, 255, ${star.opacity})`;
        ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.globalAlpha = 1.0;

      animationFrameId = requestAnimationFrame(drawSpace);
    };

    window.addEventListener("resize", resizeCanvas);
    window.addEventListener("mousemove", handleMouseMove);
    resizeCanvas();
    drawSpace();

    return () => {
      window.removeEventListener("resize", resizeCanvas);
      window.removeEventListener("mousemove", handleMouseMove);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <div className={styles.wrapper}>
      <canvas ref={canvasRef} className={styles.canvas} />
    </div>
  );
}
