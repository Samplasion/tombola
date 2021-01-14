import { Socket } from "socket.io-client";
import React from "react";
import Heading from "../components/Heading";
import { useHistory } from "react-router-dom";
import Modal from "../components/Modal";
import { StrippedPlayer } from "../../common/types";

interface WaitingForPlayersProps {
    socket: Socket;
    socketID: string;
    gameKey: string;
    host: boolean;
}

export const WaitingForPlayers: React.FunctionComponent<WaitingForPlayersProps> = ({ socket, socketID, gameKey, host }) => {
    const [players, setPlayers] = React.useState<StrippedPlayer[]>([]);
    const [open, setOpen] = React.useState(false);
    const history = useHistory();

    if (!gameKey)
        window.location.href = window.location.origin + "/"

    React.useEffect(() => {
        // Request a player update
        console.log(gameKey);
        socket.emit("playersUpdate", gameKey);
        socket.on("playersUpdate", (players: StrippedPlayer[]) => setPlayers(players));
        socket.on("startingGame", (givesTabellone: boolean) => {
            history.push(givesTabellone ? "/tabellone" : "/choose-cartelle");
        });
        socket.on("startGameError", () => {
            setOpen(true);
        });
        socket.on("disconnect", () => window.location.href = window.location.origin + "/")
    }, []); // eslint-disable-line

    return (
        <>
            <div className="flex flex-wrap">
                <Heading
                    className={host ? "w-full md:w-1/2" : ""}
                    title="Aspettando gli altri giocatori..."
                    subtitle={host ? 'Quando siete tutti pronti, premi "Gioca".' : 'Clicca "Pronto" per indicare all\'host che sei pronto per giocare.'}
                    />
                {host && (
                    <div className="w-full md:w-1/2">
                        <p className="text-lg md:float-right">ID della stanza: <b>{gameKey}</b></p>
                    </div>
                )}
            </div>
            <ol className="list-decimal my-4 pl-10">
                {players.map(p => {
                    return <li><span className={p.ready ? "text-green-700 dark:text-green-400" : ""}>{p.username}</span> {p.id === socketID && <>(<b>Tu!</b>)</>}</li>
                })}
            </ol>
            <div className="flex justify-end">
                {host && (
                    <button className="btn my-4 s-full md:ws-auto" onClick={() => socket.emit("startGame")}>Gioca</button>
                )}
                <button style={{ marginTop: "1rem" }} className={"btn my-4 s-full mt-4" + (host ? " btn-outline" : "")} onClick={() => socket.emit("ready")}>
                    {players.find(player => player.id === socketID)?.ready ? "Non pronto" : "Pronto"}
                </button>
            </div>
            <Modal
                title="Attenzione"
                open={open}
                setOpen={setOpen}
            >
                Sei da solo. Non ti aspetterai mica di poter giocare da solo?
            </Modal>
        </>
    )
}