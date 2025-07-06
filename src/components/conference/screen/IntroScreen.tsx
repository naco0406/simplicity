import { Conference } from "@/types/conference";
import { FC, Fragment } from "react";

interface Props {
    conference: Conference
}
export const Intro: FC<Props> = ({ conference }) => {
    const { title, subtitle, speaker, role } = conference
    return (
        <div className="px-8 py-6 mt-16">
            <div className="max-w-5xl mx-auto text-center">
                {/* Title section */}
                <div className="mb-64">
                    {subtitle && (
                        <h2 className="text-xl font-bold text-gray-300 mb-2 leading-relaxed">
                            {subtitle}
                        </h2>
                    )}
                    <h1 className="text-6xl font-bold mb-6 leading-tight tracking-tight whitespace-pre-line">
                        <span className="bg-gradient-to-r from-white via-white to-gray-300 bg-clip-text text-transparent">
                            {title}
                        </span>
                    </h1>
                </div>

                {/* Speaker info */}
                <div className="mb-8 opacity-90">
                    <div className="flex items-center justify-center space-x-4 mb-4">
                        <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                            <span className="text-2xl font-bold">
                                {speaker.split(' ').map(name => name[0]).join('')}
                            </span>
                        </div>
                        <div className="text-left">
                            <h3 className="text-xl font-semibold text-blue-300 mb-1">
                                {speaker}
                            </h3>
                            <p className="text-gray-400 text-sm">
                                {role}
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}