import { FC, ReactNode } from 'react';
import { Metadata } from 'next';
import { PageTransitionProvider } from '@/hooks/usePageTransition';
import './globals.css';

interface Props {
  children: ReactNode;
}

export const metadata: Metadata = {
  title: 'Naco | 김나코',
  description: '프론트엔드 개발자 김나코',
};

const RootLayout: FC<Props> = ({ children }) => {
  return (
    <html lang="ko" className="scroll-smooth">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="font-inter antialiased bg-black text-white">
        <PageTransitionProvider>
          {children}
        </PageTransitionProvider>
      </body>
    </html>
  );
};

export default RootLayout;