import React, { ReactNode } from "react";
import { useLocation } from "react-router-dom";
import allCartelle from "../cartelle";
import Cartella, { TombolaAction } from "../components/Cartella";
import Heading from "../components/Heading";
import Modal from "../components/Modal";

function useQuery() {
    return new URLSearchParams(useLocation().search);
}

export default function Cartelle(props: { called: number[], onNewNumber?: (n: number) => void, onAction: (action: TombolaAction) => void }) {
    const query = useQuery();
    const [modal, setModal] = React.useState({ open: false, children: null as unknown as ReactNode, title: "", buttons: null as unknown as (ReactNode[] | null) });
    const cartelle = query.getAll("cartelle").map(cartella => parseInt(cartella)).filter((cartella, i, a) => cartella < allCartelle.length && a.indexOf(cartella) === i);
    if (cartelle.length === 0)
        cartelle.push(0);

    function alert(text: string) {
        return setModal(modal => ({
            ...modal,
            open: true,
            children: text,
            title: "Attenzione",
            buttons: null
        }));
    }

    function prompt(text: string, cb: (value: string) => void) {
        setModal(modal => ({
            ...modal,
            open: true,
            children: (
                <>
                    {text}
                    <input
                        id="new-number-id"
                        type="text" />
                </>
            ),
            title: "Attenzione",
            buttons: [
                <button
                    className="btn btn-outline"
                    onClick={() => setModal(m => ({ ...m, open: false }))}
                >
                    Annulla
                </button>,
                <button
                    className="btn"
                    onClick={() => { setModal(m => ({ ...m, open: false })); cb(document.querySelector<HTMLInputElement>("#new-number-id")!.value) }}
                >OK</button>
            ]
        }));

    }

    function checkActions() {
        let c = cartelle.map(i => allCartelle[i]);

        for (let cartella of c) {
            const lines = [
                cartella.filter((n, i) => i < 9 && n && props.called.includes(n)),
                cartella.filter((n, i) => i >= 9 && i < 18 && n && props.called.includes(n)),
                cartella.filter((n, i) => i >= 18 && i < 27 && n && props.called.includes(n)),
            ]
            console.log(lines.flat());
            if (lines.flat().length === 15)
                return props.onAction(TombolaAction.TOMBOLA)
            else for (let i of [5, 4, 3, 2]) {
                console.log("Checking", i);
                if (lines.some(line => line.length === i)) {
                    console.log(i);
                    return props.onAction(i);
                }
            }
        }
    }
    
    function addNumber() {
        if (props.called.length > 89) {
            return alert("Sono già usciti tutti i numeri!");
        }
        prompt("Che numero è uscito?", n => {
            let number = parseInt(n || "0");
            if (isNaN(number) || (number < 1 || number > 90)) {
                return alert("Il numero deve essere un valido numero tra 1 e 90.");
            }
            if (props.called.includes(number)) {
                return alert("Come fa il numero " + number + " a essere uscito adesso se era già uscito?");
            }
            props.onNewNumber?.(number);

        });
    }
    
    checkActions();
    
    return (
        <>
            <Heading
                title="Le tue cartelle"
                subtitle={"Usa il pulsante \"Aggiungi\" in basso per aggiungere i numeri estratti."} />
            <div className="lg:flex">
                <div className="w-full mb-4 lg:mb-0 lg:w-4/5">
                    <div className="flex flex-wrap justify-center">
                        {cartelle.sort((a, b) => a - b).map((cartella, i) => <Cartella number={cartella+1} called={props.called ?? []} layout={allCartelle[cartella]} zIndex={allCartelle.length - cartella} />)}
                    </div>
                </div>
                <div className="w-full lg:w-1/5">
                    <h1>Numeri chiamati</h1>
                    <ol>
                        {props.called.map(n => <li><b>{n}</b></li>)}
                    </ol>
                </div>
            </div>
            <button
                disabled={props.called.length > 89 || (cartelle.map(i => allCartelle[i]).some(c => c.every(n => props.called.includes(n))))}
                onClick={addNumber}
                className="btn float-right my-4"
            >
                Aggiungi
            </button>
            <Modal title={modal.title} open={modal.open} setOpen={open => setModal(modal => ({ ...modal, open }))} buttons={modal.buttons}>
                {modal.children}
            </Modal>
        </>
    )
}