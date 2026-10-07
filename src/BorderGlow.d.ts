import type { FC, ReactNode } from 'react';

interface BorderGlowProps {
  children: ReactNode;
  href?: string;
  className?: string;
  edgeSensitivity?: number;
  glowColor?: string;
  backgroundColor?: string;
  borderRadius?: number;
  colors?: string[];
}

declare const BorderGlow: FC<BorderGlowProps>;
export default BorderGlow;
