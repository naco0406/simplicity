'use client';

import { ConferenceSection } from '@/components/home/ConferenceSection';
import { Header } from '@/components/layout/Header';
import { SIMPLICITY } from '@/data/conferences';
import { FC } from 'react';

const HomePage: FC = () => {

  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden">
      <Header />
      <main className="flex-1 my-auto">
        <ConferenceSection conferences={SIMPLICITY} />
      </main>
      {/* <Footer /> */}
    </div>
  );
};

export default HomePage;