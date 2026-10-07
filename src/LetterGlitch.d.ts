import type { FC } from 'react';

interface LetterGlitchProps {
  className?: string;
  glitchColors?: string[];
  glitchSpeed?: number;
  centerVignette?: boolean;
  outerVignette?: boolean;
  smooth?: boolean;
  characters?: string;
}

declare const LetterGlitch: FC<LetterGlitchProps>;
export default LetterGlitch;
