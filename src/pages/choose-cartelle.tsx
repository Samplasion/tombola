import React from "react";
import { Link } from "react-router-dom";
import allCartelle from "../cartelle";
import Cartella from "../components/Cartella";
import Heading from "../components/Heading";
import Modal from "../components/Modal";

export default function ChooseCartelle() {
    const [cartelle, setCartelle] = React.useState([] as number[]);
    const [open, setOpen] = React.useState(false);
    function removeCartella(cartella: number) {
        setCartelle(cartelle.filter(c => cartella !== c));
    }
    function addCartella(cartella: number) {
        if (cartelle.length >= 5) {
            setOpen(true);
            return false;
        }
        setCartelle([...cartelle, cartella]);
        return true;
    }

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
                                className={cartelle.includes(cartella) ? "selected" : ""}
                                called={[]}
                                number={cartella+1}
                                layout={allCartelle[cartella]} />
                            <input type="checkbox" hidden onChange={e => e.target.checked ? (e.target.checked = addCartella(cartella)) : removeCartella(cartella)} />
                        </label>
                    </div>
                })}
            </div>
            <Link to={!cartelle.length ? "#" : "/cartelle?cartelle=" + cartelle.join("&cartelle=")} className="btn float-right my-4">Vai</Link>
            <Modal title="Attenzione" open={open} setOpen={setOpen}>
                Hai già selezionato 5 cartelle. Prima di selezionare questa, deselezionane un'altra.
            </Modal>
        </>
    )
}