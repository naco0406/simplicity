import { FC } from "react";

export const Loading: FC = () => {
    return (
        <div className="fixed inset-0 bg-black flex items-center justify-center z-50">
            <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
        </div>
    );
}