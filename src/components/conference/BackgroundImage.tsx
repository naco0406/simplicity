import { Conference } from "@/types/conference"
import { FC, Fragment } from "react"

interface Props {
    conference: Conference
}
export const BackgroundImage: FC<Props> = ({ conference }) => {
    const { title, image } = conference
    return (
        <Fragment>
            <div className="absolute inset-0">
                <div className="relative w-full h-full">
                    <img
                        src={image}
                        alt={title}
                        className="w-full h-full object-cover scale-105 filter brightness-50"
                    />
                    {/* Multi-layer gradients */}
                    <div className="absolute inset-0 bg-gradient-to-b from-black via-transparent to-black" />
                    <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-black/20 to-black/80" />
                    <div className="absolute inset-0 bg-gradient-to-r from-black/30 via-transparent to-black/30" />
                </div>
            </div>
        </Fragment>
    )
}