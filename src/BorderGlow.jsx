import { useRef } from 'react';

const BorderGlow = ({
  children,
  href,
  className = '',
  edgeSensitivity = 55,
  glowColor = '30 85% 66%',
  backgroundColor = '#1b1b1b',
  borderRadius = 8,
  colors = ['#ed963e', '#f0cb91', '#91b5ad'],
}) => {
  const cardRef = useRef(null);

  const handlePointerMove = (event) => {
    const card = cardRef.current;
    if (!card) return;

    const rect = card.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    const dx = x - rect.width / 2;
    const dy = y - rect.height / 2;
    const proximity = Math.min(100, Math.max(Math.abs(dx) / (rect.width / 2), Math.abs(dy) / (rect.height / 2)) * 100);
    const threshold = 100 - edgeSensitivity;
    const strength = Math.max(0, (proximity - threshold) / edgeSensitivity);

    card.style.setProperty('--pointer-x', `${x}px`);
    card.style.setProperty('--pointer-y', `${y}px`);
    card.style.setProperty('--cursor-angle', `${Math.atan2(dy, dx) * 180 / Math.PI + 90}deg`);
    card.style.setProperty('--glow-opacity', strength.toFixed(3));
  };

  const resetGlow = () => {
    cardRef.current?.style.setProperty('--glow-opacity', '0');
  };

  const Tag = href ? 'a' : 'div';

  return (
    <Tag
      ref={cardRef}
      href={href}
      className={`border-glow-card ${className}`.trim()}
      onPointerMove={handlePointerMove}
      onPointerLeave={resetGlow}
      onFocus={() => cardRef.current?.style.setProperty('--glow-opacity', '0.7')}
      onBlur={resetGlow}
      style={{
        '--card-bg': backgroundColor,
        '--border-radius': `${borderRadius}px`,
        '--glow-color': `hsl(${glowColor} / 65%)`,
        '--glow-primary': colors[0],
        '--glow-secondary': colors[1],
        '--glow-tertiary': colors[2],
      }}
    >
      <span className="edge-light" aria-hidden="true" />
      <div className="border-glow-inner">{children}</div>
    </Tag>
  );
};

export default BorderGlow;
