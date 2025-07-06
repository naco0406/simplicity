'use client';

import { SIMPLICITY } from '@/data/conferences';
import { usePageTransition } from '@/hooks/usePageTransition';
import { Conference } from '@/types/conference';
import { useRouter } from 'next/navigation';
import { FC, useEffect, useState, use } from 'react';
import { ArrowLeft, ArrowRight, Clock, MapPin, Users } from 'lucide-react';
import { GoBackButton } from '@/components/conference/GoBackButton';

interface Props {
    params: Promise<{
        id: string;
    }>;
}

const ConferenceDetailPage: FC<Props> = ({ params }) => {
    const router = useRouter();
    const { startReturnTransition, endTransition } = usePageTransition();
    const [conference, setConference] = useState<Conference | null>(null);
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

    if (isLoading) {
        return (
            <div className="fixed inset-0 bg-black flex items-center justify-center z-50">
                <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
            </div>
        );
    }

    if (notFound || !conference) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-black">
                <div className="text-center">
                    <div className="text-white text-xl mb-4">Conference not found</div>
                    <button
                        onClick={() => router.push('/')}
                        className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-6 rounded-lg transition-colors"
                    >
                        Go Back Home
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="h-screen bg-black text-white relative overflow-hidden flex flex-col">
            <div className={`transition-all duration-500 ease-out ${fadeIn ? 'opacity-100' : 'opacity-0'} h-full flex flex-col`}>
                {/* Gradient overlay for depth */}
                <div className="absolute inset-0 bg-gradient-to-br from-gray-900/20 via-transparent to-black/40 z-10" />

                {/* Background image */}
                <div className="absolute inset-0">
                    <div className="relative w-full h-full">
                        <img
                            src={conference.image}
                            alt={conference.title}
                            className="w-full h-full object-cover scale-105 filter brightness-50"
                        />
                        {/* Multi-layer gradients */}
                        <div className="absolute inset-0 bg-gradient-to-b from-black via-transparent to-black" />
                        <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-black/20 to-black/80" />
                        <div className="absolute inset-0 bg-gradient-to-r from-black/30 via-transparent to-black/30" />
                    </div>
                </div>

                {/* Navigation */}
                <nav className="relative z-20 p-6 flex-shrink-0">
                    <GoBackButton onClick={handleBackClick} />
                </nav>

                {/* Main content */}
                <div className="relative z-20 flex-1 flex flex-col justify-center min-h-0">
                    <div className="px-8 py-6">
                        <div className="max-w-5xl mx-auto text-center">
                            {/* Speaker info */}
                            <div className="mb-8 opacity-90">
                                <div className="flex items-center justify-center space-x-4 mb-4">
                                    <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                                        <span className="text-2xl font-bold">
                                            {conference.speaker.split(' ').map(name => name[0]).join('')}
                                        </span>
                                    </div>
                                    <div className="text-left">
                                        <h3 className="text-xl font-semibold text-blue-300 mb-1">
                                            {conference.speaker}
                                        </h3>
                                        <p className="text-gray-400 text-sm">
                                            {conference.role}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Title section */}
                            <div className="mb-12">
                                <h1 className="text-6xl md:text-7xl font-bold mb-6 leading-tight tracking-tight">
                                    <span className="bg-gradient-to-r from-white via-white to-gray-300 bg-clip-text text-transparent">
                                        {conference.title}
                                    </span>
                                </h1>

                                {conference.subtitle && (
                                    <h2 className="text-2xl md:text-3xl text-gray-300 mb-8 leading-relaxed font-light">
                                        {conference.subtitle}
                                    </h2>
                                )}
                            </div>

                            {/* Description */}
                            <div className="mb-12 max-w-3xl mx-auto">
                                <p className="text-lg md:text-xl text-gray-300 leading-relaxed font-light text-center">
                                    {conference.description}
                                </p>
                            </div>

                            {/* Action buttons */}
                            <div className="flex flex-col sm:flex-row gap-4 justify-center">
                                <button className="group px-8 py-4 bg-black/20 backdrop-blur-xl border border-white/20 hover:bg-black/40 hover:border-white/30 rounded-xl font-semibold text-white transition-all duration-300 hover:scale-105">
                                    <span className="flex items-center justify-center space-x-2">
                                        <span>자세히 알아보기</span>
                                        <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" />
                                    </span>
                                </button>
                            </div>

                            {/* Additional info */}
                            <div className="mt-16 pt-8 border-t border-white/10">
                                <div className="flex flex-wrap gap-8 text-sm text-gray-400 justify-center">
                                    <div className="flex items-center space-x-2">
                                        <Clock className="w-4 h-4" />
                                        <span>45 minutes</span>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <MapPin className="w-4 h-4" />
                                        <span>Online Event</span>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <Users className="w-4 h-4" />
                                        <span>500+ attendees</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ConferenceDetailPage;