import React from "react";
import { Socket } from "socket.io-client";
import { useInput } from "../hooks/useInput";
import { useHistory } from "react-router-dom";
import Heading from "../components/Heading";
import Modal from "../components/Modal";

interface JoinRoomProps {
    socket: Socket;
    socketID: string;
    setHost: () => void;
    setKey: (key: string) => void;
}

export const JoinRoom: React.FunctionComponent<JoinRoomProps> = ({ socket, setHost, setKey }) => {
    const [open, setOpen] = React.useState(false);
    const [modalContent, setModalContent] = React.useState("Questa stanza non esiste!");
    const { value: name, bind: nameBind } = useInput('');
    const { value: room, bind: roomBind } = useInput('');
    const history = useHistory();

    function joinRoom(evt: React.MouseEvent<Element, MouseEvent>, name: string, key: string) {
        console.log(name, key.toUpperCase());
        socket.emit("joinRoom", name, key.toUpperCase());
        socket.on("joinRoomError", (err: 0 | 1 | 2) => {
            switch (err) {
                case 0: setModalContent("Questa stanza non esiste!"); break;
                case 1: setModalContent("In quella stanza la partita è già iniziata."); break;
                case 2: setModalContent("La stanza è piena."); break;
            }
            setOpen(true);
        });
        socket.on("joinRoom", (data: "OK") => {
            setKey(room);
            history.push("/waiting-for-players");
            setHost();
        });
    }

    console.log(!name?.trim() || !room?.trim());

    return (
        <>
            <Heading
                title="Entra in una stanza"
                subtitle="Scegli uno username ed entra in una stanza con il codice." />
            <label>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-500">Username</label>
                <input type="text" {...nameBind} />
            </label>
            <label>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-500">ID della stanza</label>
                <input type="text" {...roomBind} />
            </label>
            <div className="flex justify-end">
                <button className="btn my-4" disabled={!name?.trim() || !room?.trim()} onClick={e => {joinRoom(e, name, room)}}>Vai!</button>
            </div>
            <Modal
                title="Attenzione"
                open={open}
                setOpen={setOpen}
            >
                {modalContent}
            </Modal>
        </>
    );
}