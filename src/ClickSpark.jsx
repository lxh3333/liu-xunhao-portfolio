import { useEffect, useRef } from 'react';

export default function ClickSpark({
  children,
  sparkColor = '#ed963e',
  sparkSize = 11,
  sparkRadius = 25,
  sparkCount = 10,
  duration = 700,
  easing = 'ease-out',
  extraScale = 1,
}) {
  const canvasRef = useRef(null);
  const sparksRef = useRef([]);
  const wakeRef = useRef(() => {});

  useEffect(() => {
    const canvas = canvasRef.current;
    const context = canvas?.getContext('2d');
    if (!canvas || !context) return undefined;

    let animationFrame = 0;
    let active = true;

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 1.25);
      canvas.width = Math.round(window.innerWidth * dpr);
      canvas.height = Math.round(window.innerHeight * dpr);
      canvas.style.width = `${window.innerWidth}px`;
      canvas.style.height = `${window.innerHeight}px`;
      context.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    const ease = (progress) => {
      if (easing === 'linear') return progress;
      if (easing === 'ease-in') return progress * progress;
      if (easing === 'ease-in-out') return progress < 0.5
        ? 2 * progress * progress
        : -1 + (4 - 2 * progress) * progress;
      return progress * (2 - progress);
    };

    const draw = (timestamp) => {
      animationFrame = 0;
      if (!active) return;
      context.clearRect(0, 0, window.innerWidth, window.innerHeight);
      sparksRef.current = sparksRef.current.filter((spark) => {
        const progress = (timestamp - spark.startTime) / duration;
        if (progress >= 1) return false;

        const distance = ease(Math.max(0, progress)) * sparkRadius * extraScale;
        const lineLength = sparkSize * (1 - progress);
        const x1 = spark.x + distance * Math.cos(spark.angle);
        const y1 = spark.y + distance * Math.sin(spark.angle);
        const x2 = spark.x + (distance + lineLength) * Math.cos(spark.angle);
        const y2 = spark.y + (distance + lineLength) * Math.sin(spark.angle);

        context.globalAlpha = 1 - progress;
        context.strokeStyle = sparkColor;
        context.lineWidth = 2;
        context.beginPath();
        context.moveTo(x1, y1);
        context.lineTo(x2, y2);
        context.stroke();
        context.globalAlpha = 1;
        return true;
      });

      if (sparksRef.current.length) animationFrame = requestAnimationFrame(draw);
    };

    wakeRef.current = () => {
      if (!animationFrame) animationFrame = requestAnimationFrame(draw);
    };

    const handleResize = () => resize();
    resize();
    window.addEventListener('resize', handleResize, { passive: true });

    return () => {
      active = false;
      cancelAnimationFrame(animationFrame);
      wakeRef.current = () => {};
      window.removeEventListener('resize', handleResize);
    };
  }, [duration, easing, extraScale, sparkColor, sparkRadius, sparkSize]);

  const handleClick = (event) => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const now = performance.now();
    sparksRef.current.push(...Array.from({ length: sparkCount }, (_, index) => ({
      x: event.clientX,
      y: event.clientY,
      angle: (Math.PI * 2 * index) / sparkCount,
      startTime: now,
    })));
    wakeRef.current();
  };

  return (
    <div className="click-spark-page" onClick={handleClick}>
      <canvas ref={canvasRef} className="click-spark-canvas" aria-hidden="true" />
      {children}
    </div>
  );
}
