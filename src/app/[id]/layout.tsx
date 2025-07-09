'use client';

import { GoBackButton } from '@/components/conference/navigation/GoBackButton';
import { Loading } from '@/components/conference/screen/LoadingScreen';
import { Error } from '@/components/conference/screen/ErrorScreen';
import { SIMPLICITY } from '@/data/conferences';
import { ConferenceProvider } from '@/hooks/useConference';
import { usePageTransition } from '@/hooks/usePageTransition';
import { ConferenceData } from '@/types/conference';
import { useRouter } from 'next/navigation';
import { FC, ReactNode, use, useEffect, useState } from 'react';
import { BackgroundImage } from '@/components/conference/BackgroundImage';

interface Props {
    children: ReactNode;
    params: Promise<{
        id: string;
    }>;
}

const ConferenceLayout: FC<Props> = ({ children, params }) => {
    const router = useRouter();
    const { startReturnTransition, endTransition } = usePageTransition();
    const [conference, setConference] = useState<ConferenceData | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [notFound, setNotFound] = useState(false);
    const [fadeIn, setFadeIn] = useState(false);

    const resolvedParams = use(params);

    useEffect(() => {
        const foundConference = SIMPLICITY.find(conf => conf.id === resolvedParams.id);

        if (foundConference) {
            setConference(foundConference);
            setNotFound(false);
        } else {
            setNotFound(true);
        }

        setIsLoading(false);

        const timer = setTimeout(() => {
            endTransition();
            setFadeIn(true);
        }, 500);

        return () => clearTimeout(timer);
    }, [resolvedParams.id, endTransition]);

    const handleBackClick = async () => {
        if (!conference) return;

        setFadeIn(false);
        await new Promise(resolve => setTimeout(resolve, 500));

        try {
            await startReturnTransition(conference);
            router.push('/');
        } catch (error) {
            console.error('Back animation failed:', error);
            router.push('/');
        }
    };

    // 로딩 상태
    if (isLoading) {
        return <Loading />
    }

    // 에러 상태
    if (notFound || !conference) {
        return (
            <Error />
        );
    }

    return (
        <div className="h-screen bg-black text-white relative overflow-hidden flex flex-col">
            <div className={`transition-all duration-500 ease-out ${fadeIn ? 'opacity-100' : 'opacity-0'} h-full flex flex-col`}>
                <BackgroundImage conference={conference} />

                {/* Navigation */}
                <nav className="relative z-20 p-6 flex-shrink-0">
                    <GoBackButton onClick={handleBackClick} />
                </nav>

                {/* Main content */}
                <div className="relative z-20 flex-1 flex flex-col justify-center min-h-0">
                    <ConferenceProvider conference={conference}>
                        {children}
                    </ConferenceProvider>
                </div>
            </div>
        </div>
    );
};

export default ConferenceLayout;