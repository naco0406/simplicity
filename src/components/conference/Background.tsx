import { useFocusedConferenceContext } from "@/contexts/FocusedConferenceContext";
import { FC, Fragment } from "react";

export const Background: FC = () => {
    const { focusedConference } = useFocusedConferenceContext();

    const backgroundColor = focusedConference?.color ?? '#000000';

    return (
        <Fragment>
            <div className="absolute inset-0">
                <div className="relative w-full h-full">
                    {/* Primary radial gradient - enhanced center glow */}
                    <div
                        className="absolute inset-0 transition-all duration-1000 ease-out"
                        style={{
                            background: `radial-gradient(circle at center, ${backgroundColor}50 0%, ${backgroundColor}40 20%, ${backgroundColor}30 35%, ${backgroundColor}20 50%, ${backgroundColor}15 65%, transparent 85%)`
                        }}
                    />

                    {/* Secondary radial gradient for enhanced depth */}
                    <div
                        className="absolute inset-0 transition-all duration-1000 ease-out"
                        style={{
                            background: `radial-gradient(ellipse 90% 70% at center, ${backgroundColor}30 0%, ${backgroundColor}20 30%, ${backgroundColor}15 50%, transparent 75%)`
                        }}
                    />

                    {/* Additional large radial gradient for wider coverage */}
                    <div
                        className="absolute inset-0 transition-all duration-1000 ease-out"
                        style={{
                            background: `radial-gradient(circle at center, ${backgroundColor}25 0%, ${backgroundColor}15 40%, ${backgroundColor}10 60%, transparent 80%)`
                        }}
                    />

                    {/* Corner gradients for atmosphere - enhanced */}
                    <div
                        className="absolute inset-0 transition-all duration-1000 ease-out"
                        style={{
                            background: `radial-gradient(circle at 20% 20%, ${backgroundColor}20 0%, transparent 60%), radial-gradient(circle at 80% 80%, ${backgroundColor}20 0%, transparent 60%), radial-gradient(circle at 20% 80%, ${backgroundColor}15 0%, transparent 50%), radial-gradient(circle at 80% 20%, ${backgroundColor}15 0%, transparent 50%)`
                        }}
                    />

                    {/* Mid-section gradients for better coverage */}
                    <div
                        className="absolute inset-0 transition-all duration-1000 ease-out"
                        style={{
                            background: `radial-gradient(circle at 50% 30%, ${backgroundColor}15 0%, transparent 40%), radial-gradient(circle at 50% 70%, ${backgroundColor}15 0%, transparent 40%)`
                        }}
                    />

                    {/* Vertical gradient overlay for depth - enhanced */}
                    <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/40 transition-opacity duration-1000 ease-out" />

                    {/* Horizontal gradient for balance - enhanced */}
                    <div className="absolute inset-0 bg-gradient-to-r from-black/30 via-transparent to-black/30 transition-opacity duration-1000 ease-out" />

                    {/* Additional diagonal gradients for more coverage */}
                    <div
                        className="absolute inset-0 transition-all duration-1000 ease-out"
                        style={{
                            background: `radial-gradient(circle at 30% 50%, ${backgroundColor}10 0%, transparent 45%), radial-gradient(circle at 70% 50%, ${backgroundColor}10 0%, transparent 45%)`
                        }}
                    />
                </div>
            </div>
        </Fragment>
    )
}