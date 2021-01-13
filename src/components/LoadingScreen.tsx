import React from "react"
import Heading from "./Heading"

interface LoadingScreenProps {
    children: React.ReactNode;
    loading: boolean;
    title: string;
    subtitle: string;
}

export const LoadingScreen: React.FunctionComponent<LoadingScreenProps> = ({ children, loading, title, subtitle }) => {
    return (
        <>
            <div id="loading-screen" className={"w-full h-full fixed block top-0 left-0 bg-white dark:bg-black z-50 transition-all " + (loading ? "" : "hidden opacity-0")}>
                <span className="top-1/2 my-0 mx-auto block relative text-center">
                    <Heading
                        title={title}
                        subtitle={subtitle} />
                </span>
            </div>
            {children}
        </>
    )
}