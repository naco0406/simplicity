import { FC } from "react";
import { useRouter } from 'next/navigation';

export const Error: FC = () => {
    const router = useRouter();
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