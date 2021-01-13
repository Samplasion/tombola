import React from "react";
import { Link, useHistory } from "react-router-dom";
import { Socket } from "socket.io-client";
import allCartelle from "../cartelle";
import Cartella from "../components/Cartella";
import Heading from "../components/Heading";
import Modal from "../components/Modal";

export default function ChooseCartelle({ socket, cartelle: allCartelle }: { socket: Socket, cartelle: number[][] }) {
    const [cartelle, setCartelle] = React.useState([] as number[]);
    const [open, setOpen] = React.useState(false);
    const [disabledCartelle, setDCartelle] = React.useState<number[]>([]);
    const history = useHistory();
    function removeCartella(cartella: number) {
        socket.emit("unchooseCartella", cartella);
        setCartelle(cartelle.filter(c => cartella !== c));
    }
    function addCartella(cartella: number) {
        socket.emit("chooseCartella", cartella);
        if (cartelle.length >= 5) {
            setOpen(true);
            return false;
        }
        setCartelle([...cartelle, cartella]);
        return true;
    }
    
    socket.on("chosenCartella", (number: number) => {
        setDCartelle([...disabledCartelle, number]);
    });
    socket.on("unchosenCartella", (number: number) => {
        setDCartelle(disabledCartelle.filter(n => n !== number));
    });

    return (
        <>
            <Heading
                title="Scegli le tue cartelle"
                subtitle="Puoi selezionarne fino a 5." />
            <div className="flex flex-wrap">
                {allCartelle.map((_, cartella) => {
                    return <div className="lg:w-1/3">
                        <label style={{ width: "100%" }}>
                            <Cartella
                                className={(cartelle.includes(cartella) ? "selected" : "") + (disabledCartelle.includes(cartella) ? " opacity-50" : "")}
                                called={[]}
                                number={cartella+1}
                                layout={allCartelle[cartella]}
                                disabled={disabledCartelle.includes(cartella)} />
                            <input type="checkbox" hidden onChange={e => disabledCartelle.includes(cartella) || (e.target.checked ? (e.target.checked = addCartella(cartella)) : removeCartella(cartella))} />
                        </label>
                    </div>
                })}
            </div>
            <div className="flex justify-end">
                <button
                    disabled={!cartelle.length}
                    onClick={() => {
                        socket.emit("choseAllCartelle");
                        console.log("/cartelle")
                        history.push("/cartelle");
                    }}
                    className="btn my-4"
                >
                    Vai!
                </button>
            </div>
            <Modal title="Attenzione" open={open} setOpen={setOpen}>
                Hai già selezionato 5 cartelle. Prima di selezionare questa, deselezionane un'altra.
            </Modal>
        </>
    )
}