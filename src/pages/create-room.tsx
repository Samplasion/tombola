// This component manages the creations of rooms.
import React from "react";
import { Socket } from "socket.io-client";
import { useInput } from "../hooks/useInput";
import { useHistory } from "react-router-dom";
import Heading from "../components/Heading";

interface CreateRoomProps {
    socket: Socket;
    socketID: string;
    setHost: () => void;
    setKey: (key: string) => void;
}

export const CreateRoom: React.FunctionComponent<CreateRoomProps> = ({ socket, setHost, setKey: setGameKey }) => {
    const { value, bind } = useInput('');
    const history = useHistory();

    function createRoom(evt: React.MouseEvent<Element, MouseEvent>, name: string) {
        socket.emit("createRoom", name);
        socket.once("createRoom", (data: { key: string }) => {
            console.log(`${name}, ${data.key}`);
            setHost();
            setGameKey(data.key);
            history.push("/waiting-for-players");
        })
    }
    return (
        <>
            <Heading
                title="Crea una stanza"
                subtitle="Scegli uno username e condividi il codice della stanza con chi vuoi." />
            <label>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-500">Username</label>
                <input type="text" {...bind} />
            </label>
            <div className="flex justify-end">
                <button className="btn my-4" disabled={!value.trim()} onClick={e => {createRoom(e, value)}}>Vai!</button>
            </div>
        </>
    );
}