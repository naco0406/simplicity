'use client';

import { ConferenceSection } from '@/components/home/ConferenceSection';
import { Header } from '@/components/layout/Header';
import { SIMPLICITY } from '@/data/conferences';
import { usePageTransition } from '@/hooks/usePageTransition';
import { FC, useEffect, useRef, useState } from 'react';

const HomePage: FC = () => {
  const { executeReturnAnimation, endTransition } = usePageTransition();
  const conferenceGridRef = useRef<HTMLDivElement>(null);
  const [shouldShowInitialOverlay, setShouldShowInitialOverlay] = useState(() => {
    if (typeof window !== 'undefined') {
      return !!sessionStorage.getItem('returnTransitionData');
    }
    return false;
  });

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const returnData = sessionStorage.getItem('returnTransitionData');
      if (returnData) {
        const data = JSON.parse(returnData);
        const conferenceIndex = SIMPLICITY.findIndex(conf => conf.id === data.conference.id);

        const scrollEvent = new CustomEvent('scrollToCardInstantly', {
          detail: { index: conferenceIndex, conferenceId: data.conference.id }
        });
        window.dispatchEvent(scrollEvent);

        const executeAnimation = async () => {
          setShouldShowInitialOverlay(false);
          const focusedCard = document.querySelector(`[data-card-index="${conferenceIndex}"]`) as HTMLElement;
          await executeReturnAnimation(data.conference, focusedCard);

          sessionStorage.removeItem('returnTransitionData');
        };

        setTimeout(executeAnimation, 100);
      } else {
        endTransition();
      }
    }
  }, [executeReturnAnimation, endTransition]);

  return (
    <div className="h-screen flex flex-col relative overflow-hidden">
      {shouldShowInitialOverlay && (
        <div
          className="fixed inset-0 bg-black z-[9997] pointer-events-none"
          style={{ opacity: 1 }}
        />
      )}

      <Header />
      <main className="flex-1 flex items-center" ref={conferenceGridRef}>
        <ConferenceSection conferences={SIMPLICITY} />
      </main>
      {/* <Footer /> */}
    </div>
  );
};

export default HomePage;