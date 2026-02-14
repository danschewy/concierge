'use client';

import { useCallback } from 'react';
import Header from '@/components/layout/Header';
import LeftSidebar from '@/components/layout/LeftSidebar';
import CenterStage from '@/components/layout/CenterStage';
import RightPanel from '@/components/layout/RightPanel';
import VoiceOrb from '@/components/voice/VoiceOrb';
import { MobileTopBar, MobileMapSection, MobileQuickActions } from '@/components/layout/MobileLayout';

export default function Home() {
  const handleQuickAction = useCallback((text: string) => {
    const prefill = (window as unknown as Record<string, (text: string) => void>).__gothamPrefill;
    if (prefill) prefill(text);
  }, []);

  return (
    <div className="h-screen flex flex-col bg-[var(--bg-primary)]">
      <Header />

      {/* Mobile-only strips */}
      <MobileTopBar />
      <MobileMapSection />
      <MobileQuickActions onQuickAction={handleQuickAction} />

      {/* Main three-column layout */}
      <div className="flex-1 flex overflow-hidden">
        <LeftSidebar />
        <CenterStage />
        <RightPanel onQuickAction={handleQuickAction} />
      </div>

      {/* Voice Orb */}
      <VoiceOrb />
    </div>
  );
}
