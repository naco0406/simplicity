import { FC } from 'react';

export const Header: FC = () => {
    return (
        <header className="relative z-10 flex items-center justify-between px-12 py-8">
            <h1 className="text-2xl md:text-3xl font-bold text-white tracking-tight">
                Naco
            </h1>
            <span className="hidden sm:block px-3 py-1 bg-white/10 backdrop-blur-sm rounded-full text-sm text-white/80 font-bold">
                Frontend Developer
            </span>
        </header>
    );
};
