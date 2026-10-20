import React from 'react';
import { MusicProvider, useMusic } from './context/MusicContext';
import { FluidBackdrop } from './components/FluidBackdrop';
import { AppNavigation } from './components/AppNavigation';
import { NowPlayingUi } from './components/NowPlayingUi';
import { LibraryUi } from './components/LibraryUi';
import { OnlineUi } from './components/OnlineUi';
import { SettingsUi } from './components/SettingsUi';
import { MiniPlayer } from './components/MiniPlayer';

const MainContent: React.FC = () => {
  const { currentDestination } = useMusic();

  return (
    <div className="relative min-h-screen text-neutral-100 flex flex-col justify-between pt-16 pb-28">
      {/* Dynamic Animated Mesh Backdrop */}
      <FluidBackdrop />

      {/* Top Header & Floating Bottom Nav */}
      <AppNavigation />

      {/* Main View Router */}
      <main className="relative z-10 flex-1 flex flex-col justify-center">
        {currentDestination === 'NOW_PLAYING' && <NowPlayingUi />}
        {currentDestination === 'LIBRARY' && <LibraryUi />}
        {currentDestination === 'ONLINE' && <OnlineUi />}
        {currentDestination === 'SETTINGS' && <SettingsUi />}
      </main>

      {/* Floating Mini Player for non-NowPlaying views */}
      <MiniPlayer />
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <MusicProvider>
      <MainContent />
    </MusicProvider>
  );
};

export default App;
