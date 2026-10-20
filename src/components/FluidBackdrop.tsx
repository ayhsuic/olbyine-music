import React from 'react';
import { useMusic } from '../context/MusicContext';

export const FluidBackdrop: React.FC = () => {
  const { palette, audioEnergy, userSettings } = useMusic();
  const { playerFx } = userSettings;

  // React to beat pulse if enabled
  const pulseScale = playerFx.coverTilt ? 1 + audioEnergy * 0.06 : 1;
  const pulseOpacity = 0.5 + audioEnergy * 0.25;

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0 select-none">
      {/* Dark baseline */}
      <div
        className="absolute inset-0 transition-colors duration-1000"
        style={{ backgroundColor: palette.bgDark || '#09090e' }}
      />

      {/* Fluid Mesh Blobs */}
      <div
        className="absolute -top-1/4 -left-1/4 w-[90vw] h-[90vw] rounded-full fluid-blob transition-all duration-700"
        style={{
          background: `radial-gradient(circle, ${palette.primary} 0%, transparent 70%)`,
          opacity: pulseOpacity * 0.7,
          transform: `scale(${pulseScale})`,
        }}
      />
      <div
        className="absolute top-1/3 -right-1/4 w-[80vw] h-[80vw] rounded-full fluid-blob transition-all duration-700"
        style={{
          background: `radial-gradient(circle, ${palette.secondary} 0%, transparent 68%)`,
          opacity: pulseOpacity * 0.6,
          animationDelay: '-5s',
          transform: `scale(${pulseScale * 0.95})`,
        }}
      />
      <div
        className="absolute -bottom-1/4 left-1/4 w-[85vw] h-[85vw] rounded-full fluid-blob transition-all duration-700"
        style={{
          background: `radial-gradient(circle, ${palette.tertiary} 0%, transparent 70%)`,
          opacity: pulseOpacity * 0.55,
          animationDelay: '-9s',
        }}
      />
      <div
        className="absolute top-1/2 left-1/3 w-[60vw] h-[60vw] rounded-full fluid-blob transition-all duration-700"
        style={{
          background: `radial-gradient(circle, ${palette.accent} 0%, transparent 72%)`,
          opacity: pulseOpacity * 0.45,
          animationDelay: '-3s',
        }}
      />

      {/* Frosted Glass Overlay */}
      <div className="absolute inset-0 backdrop-blur-[64px] bg-black/25" />

      {/* Optional Film Grain overlay */}
      {playerFx.filmGrain && (
        <div className="absolute inset-0 film-grain opacity-25 mix-blend-overlay pointer-events-none" />
      )}
    </div>
  );
};
