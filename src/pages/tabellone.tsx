import { Socket } from "socket.io-client";
import { Component } from "react";
import { TombolaAction } from "../components/Cartella";
import TabelloneClass from "../components/Tabellone";
import Heading from "../components/Heading";
import { LoadingScreen } from "../components/LoadingScreen";
import Modal from "../components/Modal";
import { joinWithAnd } from "../functions/joinWithAnd";

const matrix = [1, 2, 3, 4, 5, 11, 12, 13, 14, 15, 21, 22, 23, 24, 25];

interface TabelloneProps {
    called: number[];
    onCall: (number: number) => void;
    onAction: (number: TombolaAction) => void;
    socket: Socket;
    socketID: string;
}

interface TabelloneState {
    lastCalled: number;
    called: number[];
    btnDisabled: boolean;
    loading: boolean;
    modalTitle: string;
    modalContent: React.ReactNode;
    modalOpen: boolean;
}

export default class Tabellone extends Component<TabelloneProps, TabelloneState> {
    state = {
        lastCalled: 0,
        called: [] as number[],
        btnDisabled: false,
        loading: true,
        modalTitle: "",
        modalContent: "",
        modalOpen: false,
    }

    numbers = [
        matrix,
        matrix.map(n => n + 5),
        matrix.map(n => n + 30),
        matrix.map(n => n + 35),
        matrix.map(n => n + 60),
        matrix.map(n => n + 65),
    ]

    checkActions() {
        let c = this.numbers;

        // console.log(c)

        // c.forEach(cartella => {
        //     const lines = [
        //         cartella.filter((n, i) => i < 5 && this.props.called.includes(n)),
        //         cartella.filter((n, i) => i >= 5 && i < 10 && this.props.called.includes(n)),
        //         cartella.filter((n, i) => i >= 10 && i < 15 && this.props.called.includes(n)),
        //     ]
        //     console.log(lines);
        //     if (lines.flat().length === 15)
        //         return this.props.onAction?.(TombolaAction.TOMBOLA)
        //     else for (let i of [5, 4, 3, 2] as const) {
        //         // console.log("Checking", i);
        //         if (lines.some(line => line.length === i)) {
        //             return this.props.onAction?.(i);
        //         }
        //     }
        // });
    }

    componentDidMount() {
        this.props.socket.on("everyoneChose", () => this.setState({ loading: false }));
        this.props.socket.on("progress", (type: TombolaAction, me: boolean, ...users: string[]) => {
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

            this.alert(content, title);
        });
        this.props.socket.on("endGame", (results: { [k in 2 | 3 | 4 | 5 | 15]: { username: string, id: string }[] }) => {
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
                    return a.id === this.props.socketID ? -1 : (b.id === this.props.socketID ? 1 : 0);
                }).map(({ username, id }) => id === this.props.socketID ? "tu" : username), " e "));
                s.push(<br />);
            }
            this.setState({ modalContent: [<span className="text-lg font-bold">Risultati del gioco:</span>, <br />, s] });
        });
    }

    alert(text: React.ReactNode, title: string = "Progresso") {
        this.setState(state => ({
            modalTitle: title,
            modalContent: text,
            modalOpen: true
        }));
    }

    render() {
        this.checkActions();

        return (
            <LoadingScreen
                loading={this.state.loading}
                title="In attesa..."
                subtitle="In attesa che tutti i giocatori selezionino le proprie cartelle"
            >
                <Heading
                    title="Tabellone"
                    subtitle={'Usa il pulsante in basso per estrarre un numero. Fai con calma!'} />
                <div className="flex justify-center">
                    <TabelloneClass lastCalled={this.state.lastCalled} numbers={this.numbers} called={this.state.called} />
                </div>
                <button
                    className="btn mb-4 text-center w-full"
                    disabled={this.state.btnDisabled}
                    onClick={() => this.extractNumber()}
                >Estrai!</button>
                <Modal
                    title={this.state.modalTitle}
                    open={this.state.modalOpen}
                    setOpen={open => this.setState(state => ({ modalOpen: open }))}
                >
                    {this.state.modalContent}
                </Modal>
            </LoadingScreen>
        )
    }

    extractNumber() {
        this.setState({ btnDisabled: true });
        this.props.socket.emit("extractNumber");
        this.props.socket.on("extractedNumber", (extracted: number, called: number[]) => {
            console.log(called)
            this.setState(state => ({ ...state, lastCalled: extracted, called, btnDisabled: false }));
        });
    }
}