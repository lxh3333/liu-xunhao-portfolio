import { useEffect, useRef } from "react";
import { Mesh, Program, Renderer, Triangle } from "ogl";

const vertex = `
  attribute vec2 position;
  attribute vec2 uv;
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = vec4(position, 0.0, 1.0);
  }
`;

const fragment = `
  precision highp float;
  uniform float uTime;
  uniform vec2 uResolution;
  uniform vec3 uColor1;
  uniform vec3 uColor2;
  uniform vec3 uColor3;
  varying vec2 vUv;

  float hash(vec2 p) {
    return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
  }

  void main() {
    vec2 p = vUv - 0.5;
    p.x *= uResolution.x / max(uResolution.y, 1.0);
    float wave = sin(p.x * 4.2 + uTime * 0.45) * 0.12 + cos(p.y * 5.0 - uTime * 0.3) * 0.1;
    float field = smoothstep(-0.4, 0.65, p.x + p.y * 0.42 + wave);
    vec3 darkToAccent = mix(uColor3, uColor2, smoothstep(0.0, 0.85, field));
    vec3 color = mix(darkToAccent, uColor1, smoothstep(0.44, 1.0, p.y + field * 0.52));
    float grain = hash(vUv * uResolution * 0.18 + floor(uTime * 1.5));
    color += (grain - 0.5) * 0.055;
    gl_FragColor = vec4(color, 0.78);
  }
`;

function hexToRgb(hex) {
  const value = hex.replace("#", "");
  const bigint = parseInt(value, 16);
  return [((bigint >> 16) & 255) / 255, ((bigint >> 8) & 255) / 255, (bigint & 255) / 255];
}

export default function Grainient({
  color1 = "#d97717",
  color2 = "#31201c",
  color3 = "#080808",
  timeSpeed = 0.25,
  className = "",
}) {
  const containerRef = useRef(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return undefined;

    const renderer = new Renderer({ alpha: true, antialias: false, dpr: Math.min(window.devicePixelRatio || 1, 1.15) });
    const gl = renderer.gl;
    const canvas = gl.canvas;
    canvas.style.width = "100%";
    canvas.style.height = "100%";
    canvas.style.display = "block";
    container.appendChild(canvas);

    const program = new Program(gl, {
      vertex,
      fragment,
      uniforms: {
        uTime: { value: 0 },
        uResolution: { value: new Float32Array([1, 1]) },
        uColor1: { value: new Float32Array(hexToRgb(color1)) },
        uColor2: { value: new Float32Array(hexToRgb(color2)) },
        uColor3: { value: new Float32Array(hexToRgb(color3)) },
      },
    });
    const mesh = new Mesh(gl, { geometry: new Triangle(gl), program });

    const resize = () => {
      const rect = container.getBoundingClientRect();
      renderer.setSize(Math.max(1, rect.width), Math.max(1, rect.height));
      program.uniforms.uResolution.value[0] = gl.drawingBufferWidth;
      program.uniforms.uResolution.value[1] = gl.drawingBufferHeight;
    };
    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(container);
    resize();

    let raf = 0;
    let isVisible = false;
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const startedAt = performance.now();
    let lastFrame = 0;
    const render = (now) => {
      if (now - lastFrame < 33) {
        raf = requestAnimationFrame(render);
        return;
      }
      lastFrame = now;
      program.uniforms.uTime.value = (now - startedAt) * 0.001 * timeSpeed;
      renderer.render({ scene: mesh });
      raf = requestAnimationFrame(render);
    };
    const updatePlayback = () => {
      const shouldAnimate = isVisible && !document.hidden && !reducedMotion.matches;
      if (shouldAnimate && !raf) raf = requestAnimationFrame(render);
      if (!shouldAnimate && raf) {
        cancelAnimationFrame(raf);
        raf = 0;
      }
      if (!shouldAnimate) renderer.render({ scene: mesh });
    };
    const intersectionObserver = new IntersectionObserver(([entry]) => {
      isVisible = entry.isIntersecting;
      updatePlayback();
    });
    intersectionObserver.observe(container);
    document.addEventListener("visibilitychange", updatePlayback);
    reducedMotion.addEventListener("change", updatePlayback);

    return () => {
      cancelAnimationFrame(raf);
      resizeObserver.disconnect();
      intersectionObserver.disconnect();
      document.removeEventListener("visibilitychange", updatePlayback);
      reducedMotion.removeEventListener("change", updatePlayback);
      try { container.removeChild(canvas); } catch { /* canvas may already be detached */ }
    };
  }, [color1, color2, color3, timeSpeed]);

  return <div ref={containerRef} className={`grainient-container ${className}`.trim()} aria-hidden="true" />;
}
