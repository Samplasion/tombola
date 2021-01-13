import React from "react";
import { Socket } from "socket.io-client";
import { useLocation } from "react-router-dom";
// import allCartelle from "../cartelle";
import Cartella, { TombolaAction } from "../components/Cartella";
import Heading from "../components/Heading";
import Modal from "../components/Modal";
import { joinWithAnd } from "../functions/joinWithAnd";

export default function Cartelle(props: { called: number[], onNewNumber?: (n: number) => void, onAction: (action: TombolaAction) => void, socket: Socket, socketID: string, cartelle: number[][] }) {
    // const [modal, setModal] = React.useState({ open: false, children: null as unknown as ReactNode, title: "", buttons: null as unknown as (ReactNode[] | null), cb: null as unknown as () => void | null });
    const [cartelle, setCartelle] = React.useState<number[]>([]);
    const [modalContent, setModalContent] = React.useState<React.ReactNode>("");
    const [modalTitle, setModalTitle] = React.useState("");
    const [modalOpen, setModalOpen] = React.useState(false);

    React.useEffect(() => {
        props.socket.emit("pleaseGiveMeCartelle", "");
        props.socket.on("gaveMeCartelle", (cartelle: number[]) => {
            setCartelle(cartelle);
        });
        props.socket.on("extractedNumber", props.onNewNumber || (() => {}));
        props.socket.on("progress", (type: TombolaAction, me: boolean, ...users: string[]) => {
            let title = "";
            switch (type) {
                case TombolaAction.AMBO: title = "Ambo!"; break;
                case TombolaAction.TERNO: title = "Terno!"; break;
                case TombolaAction.QUATERNA: title = "Quaterna!"; break;
                case TombolaAction.CINQUINA: title = "Cinquina!"; break;
                case TombolaAction.TOMBOLA: title = "Tombola!"; break;
            }
            const verb = me ? (
                users.length > 1 ? "avete" : "hai"
            ) : (
                users.length > 1 ? "hanno" : "ha"
            )
            if (me) {
                // Sorts the users to have "you" at the start
                // so it results in a more natural-language
                // sentence "you and X" compared to "X, you"
                users.sort((a, b) => {
                    return !a ? -1 : (!b ? 1 : 0);
                })
            }

            let content: React.ReactNode = [
                "Progresso: ", users.length == 1 ? (users[0] ? users[0] + " " : "") : joinWithAnd(users.map(u => u || "tu"), " e "), verb, " fatto ", title
            ]

            alert(content, title);
        });
        props.socket.on("endGame", (results: { [k in 2 | 3 | 4 | 5 | 15]: { username: string, id: string }[] }) => {
            let s = [];
            for (let [type, players] of Object.entries(results)) {
                switch (parseInt(type)) {
                    case TombolaAction.AMBO: s.push("Ambo"); break;
                    case TombolaAction.TERNO: s.push("Terno"); break;
                    case TombolaAction.QUATERNA: s.push("Quaterna"); break;
                    case TombolaAction.CINQUINA: s.push("Cinquina"); break;
                    case TombolaAction.TOMBOLA: s.push("Tombola"); break;
                }
                s.push(": ");
                s.push(joinWithAnd(players.sort((a, b) => {
                    return a.id === props.socketID ? -1 : (b.id === props.socketID ? 1 : 0);
                }).map(({ username, id }) => id === props.socketID ? "tu" : username), " e "));
                s.push(<br />);
            }
            setModalContent([<span className="text-lg font-bold">Risultati del gioco:</span>, <br />, s]);
        });
    }, []);
    
    // if (cartelle.length === 0)
    //     cartelle.push(0);

    function alert(text: React.ReactNode, title: string = "Progresso") {
        setModalTitle(title);
        setModalContent(text);
        setModalOpen(true);
        // return setModal(modal => ({
        //     ...modal,
        //     open: true,
        //     children: text,
        //     title: "Attenzione",
        //     buttons: null,
        //     cb: null as unknown as () => void | null
        // }));
    }

    // function prompt(text: string, cb: (value: string) => void) {
    //     setModal(modal => ({
    //         ...modal,
    //         open: true,
    //         children: (
    //             <>
    //                 {text}
    //                 <input
    //                     id="new-number-id"
    //                     type="text" />
    //             </>
    //         ),
    //         title: "Attenzione",
    //         buttons: [
    //             <button
    //                 className="btn btn-outline"
    //                 onClick={() => setModal(m => ({ ...m, open: false }))}
    //             >
    //                 Annulla
    //             </button>,
    //             <button
    //                 className="btn"
    //                 onClick={() => { setModal(m => ({ ...m, open: false })); cb(document.querySelector<HTMLInputElement>("#new-number-id")!.value) }}
    //             >OK</button>
    //         ],
    //         cb: () => cb(document.querySelector<HTMLInputElement>("#new-number-id")!.value)
    //     }));
    // }
    
    // checkActions();
    
    return (
        <>
            <Heading
                title="Le tue cartelle"
                subtitle={"Quando il giocatore che dà il tabellone estrarrà un numero, quello comparirà quì sotto."} />
            <div className="lg:flex">
                <div className="w-full mb-4 lg:mb-0 lg:w-4/5">
                    <div className="flex flex-wrap justify-center">
                        {cartelle.sort((a, b) => a - b).map((cartella, i) => <Cartella number={cartella+1} called={props.called ?? []} layout={props.cartelle[cartella]} zIndex={props.cartelle.length - cartella} />)}
                    </div>
                </div>
                <div className="w-full lg:w-1/5">
                    <h2 className="font-semibold text-xl">Numeri chiamati</h2>
                    {props.called.length ? 
                        props.called.map(n => <b>{n}</b>).reduce((prev, curr): any => [prev, ', ', curr]) :
                        "Nessuno."
                    }
                </div>
            </div>
            {/* <button
                disabled={props.called.length > 89 || (cartelle.map(i => allCartelle[i]).some(c => c.every(n => props.called.includes(n))))}
                onClick={addNumber}
                className="btn float-right my-4"
            >
                Aggiungi
            </button> */}
            <Modal
                title={modalTitle}
                open={modalOpen}
                setOpen={setModalOpen}
            >
                {modalContent}
            </Modal>
        </>
    )
}