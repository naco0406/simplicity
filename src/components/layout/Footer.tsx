import { FC, memo } from 'react';

export const Footer: FC = () => {
    return (
        <footer className="text-center py-16 px-8 bg-gradient-to-t from-black/20 to-transparent">
            <div className="max-w-4xl mx-auto">
                <div className="border-t border-white/10 pt-8">
                    <p className="text-white/50 text-sm mb-2">
                        © {new Date().getFullYear()} Naco. All rights reserved.
                    </p>
                </div>
            </div>
        </footer>
    );
};
