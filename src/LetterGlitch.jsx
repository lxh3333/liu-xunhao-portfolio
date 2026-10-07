import { useEffect, useRef } from 'react';

const FONT_SIZE = 16;
const CHAR_WIDTH = 11;
const CHAR_HEIGHT = 22;
const DEFAULT_CHARACTERS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ!@#$&*()-_+=/[]{};:<>.,0123456789';

const hexToRgb = (hex) => {
  const value = hex.replace('#', '');
  const expanded = value.length === 3 ? [...value].map((char) => char + char).join('') : value;
  return {
    r: parseInt(expanded.slice(0, 2), 16),
    g: parseInt(expanded.slice(2, 4), 16),
    b: parseInt(expanded.slice(4, 6), 16),
  };
};

const mixRgb = (from, to, amount) => ({
  r: Math.round(from.r + (to.r - from.r) * amount),
  g: Math.round(from.g + (to.g - from.g) * amount),
  b: Math.round(from.b + (to.b - from.b) * amount),
});

export default function LetterGlitch({
  className = '',
  glitchColors = ['#2b4539', '#61dca3', '#61b3dc'],
  glitchSpeed = 50,
  centerVignette = false,
  outerVignette = true,
  smooth = true,
  characters = DEFAULT_CHARACTERS,
}) {
  const containerRef = useRef(null);
  const canvasRef = useRef(null);

  useEffect(() => {
    const container = containerRef.current;
    const canvas = canvasRef.current;
    const context = canvas?.getContext('2d');
    if (!container || !canvas || !context) return undefined;

    const symbols = [...characters];
    const palette = glitchColors.map(hexToRgb);
    const random = (items) => items[Math.floor(Math.random() * items.length)];
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    let letters = [];
    let columns = 0;
    let frame = 0;
    let lastGlitch = 0;
    let visible = true;
    let active = true;
    let width = 0;
    let height = 0;

    const draw = () => {
      context.clearRect(0, 0, width, height);
      context.font = `${FONT_SIZE}px monospace`;
      context.textBaseline = 'top';
      letters.forEach((letter, index) => {
        const x = (index % columns) * CHAR_WIDTH;
        const y = Math.floor(index / columns) * CHAR_HEIGHT;
        context.fillStyle = `rgb(${letter.color.r}, ${letter.color.g}, ${letter.color.b})`;
        context.fillText(letter.char, x, y);
      });
    };

    const resize = () => {
      const rect = container.getBoundingClientRect();
      width = rect.width;
      height = rect.height;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      context.setTransform(dpr, 0, 0, dpr, 0, 0);
      columns = Math.max(1, Math.ceil(width / CHAR_WIDTH));
      const rows = Math.max(1, Math.ceil(height / CHAR_HEIGHT));
      letters = Array.from({ length: columns * rows }, () => {
        const color = random(palette);
        return { char: random(symbols), color, from: color, target: random(palette), progress: 1 };
      });
      draw();
    };

    let lastFrame = 0;
    const animate = (now) => {
      frame = 0;
      if (!active || !visible || reducedMotion.matches) return;
      if (now - lastFrame < 33) {
        frame = requestAnimationFrame(animate);
        return;
      }
      lastFrame = now;
      if (now - lastGlitch >= glitchSpeed) {
        const count = Math.max(1, Math.floor(letters.length * 0.05));
        for (let i = 0; i < count; i += 1) {
          const letter = random(letters);
          letter.char = random(symbols);
          letter.from = letter.color;
          letter.target = random(palette);
          letter.progress = smooth ? 0 : 1;
          if (!smooth) letter.color = letter.target;
        }
        lastGlitch = now;
      }
      if (smooth) {
        for (const letter of letters) {
          if (letter.progress >= 1) continue;
          letter.progress = Math.min(1, letter.progress + 0.08);
          letter.color = mixRgb(letter.from, letter.target, letter.progress);
        }
      }
      draw();
      frame = requestAnimationFrame(animate);
    };

    const resume = () => {
      if (!frame && visible && !reducedMotion.matches) frame = requestAnimationFrame(animate);
    };
    const pause = () => {
      cancelAnimationFrame(frame);
      frame = 0;
    };

    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(container);
    const visibilityObserver = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting && !document.hidden;
      if (visible) resume();
      else pause();
    });
    visibilityObserver.observe(container);
    const onVisibilityChange = () => {
      visible = !document.hidden;
      if (visible) resume();
      else pause();
    };
    const onMotionChange = () => {
      if (reducedMotion.matches) pause();
      else resume();
    };
    document.addEventListener('visibilitychange', onVisibilityChange);
    reducedMotion.addEventListener('change', onMotionChange);
    resize();
    resume();

    return () => {
      active = false;
      pause();
      resizeObserver.disconnect();
      visibilityObserver.disconnect();
      document.removeEventListener('visibilitychange', onVisibilityChange);
      reducedMotion.removeEventListener('change', onMotionChange);
    };
  }, [characters, glitchColors, glitchSpeed, smooth]);

  return (
    <div ref={containerRef} className={`letter-glitch ${className}`.trim()} aria-hidden="true">
      <canvas ref={canvasRef} />
      {centerVignette && <div className="letter-glitch__center-vignette" />}
      {outerVignette && <div className="letter-glitch__outer-vignette" />}
    </div>
  );
}
