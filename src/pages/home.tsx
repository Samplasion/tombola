import { Link } from "react-router-dom";

export default function Home() {
    return (
        <>
            <section className="text-gray-400 bg-white dark:bg-gray-900 body-font">
                <div className="container mx-auto flex px-5 py-24 md:flex-row flex-col items-center">
                    <div className="lg:flex-grow md:w-1/2 lg:pr-24 md:pr-16 flex flex-col md:items-start md:text-left mb-16 md:mb-0 items-center text-center">
                        <h1 className="title-font sm:text-4xl text-3xl mb-4 font-medium text-black dark:text-white">Tombola online</h1>
                        <p className="mb-8 leading-relaxed">Stanco di dover rimettere a posto i segnalini per una folata d'aria? Gioca ora a "Tombola" online, la tua tombola, ma online! Completamente gratuito, totalmente divertente; che aspetti?</p>
                        <div className="flex flex-col md:flex-row justify-center w-full">
                            <Link to="/create-room" className="btn">Crea una stanza</Link>
                            <Link to="/join-room" className="btn btn-outline">Entra in una stanza</Link>
                        </div>
                    </div>
                    <div className="lg:max-w-lg lg:w-full md:w-1/2 w-5/6">
                        <img className="object-cover object-center rounded" alt="hero" src="/hero.jpg" />
                    </div>
                </div>
            </section>
        </>
    )
}