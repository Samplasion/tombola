import './App.css';
import React, { Component } from 'react';
import Cartelle from './pages/cartelle';
import { Switch, Route, BrowserRouter as Router } from 'react-router-dom';
import Home from './pages/home';
import ChooseCartelle from './pages/choose-cartelle';
import Nav from './components/Nav';
import Tabellone from './pages/tabellone';
import Footer from './components/Footer';
import { TombolaAction } from './components/Cartella';
import Modal from './components/Modal';
import { CreateRoom } from './pages/create-room';
import socket from 'socket.io-client';
import { WaitingForPlayers } from './pages/waiting-for-players';
import { JoinRoom } from './pages/join-room';

interface AppState {
    called: number[];
    lastAction: TombolaAction;
    modal: {
        content: string;
        open: boolean;
    };
    socketID: string;
    host: boolean;
    key: string;
    cartelle: number[][]
}

class App extends Component<{}, AppState> {
    state: AppState = {
        called: [] as number[],
        lastAction: 0 as TombolaAction,
        modal: {
            content: "",
            open: !1
        },
        socketID: "",
        host: false,
        key: "",
        cartelle: []
    }

    socket: socket.Socket = socket.io(process.env.DOMAIN ?? "");

    onAction(number: TombolaAction) {
        if (this.state.lastAction >= number)
            return;
        this.setState({ lastAction: number }, () => {
            switch (number) {
                case TombolaAction.AMBO: return this.alert("Ambo!");
                case TombolaAction.TERNO: return this.alert("Terno!");
                case TombolaAction.QUATERNA: return this.alert("Quaterna!");
                case TombolaAction.CINQUINA: return this.alert("Cinquina!");
                case TombolaAction.TOMBOLA: return this.alert("Tombola!");
            }
        });
    }

    alert(text: string) {
        this.setState(state => ({ ...state, modal: { ...state.modal, content: text, open: true }}));
    }

    componentDidMount() {
        this.socket.on("ID", (data: string) => {
            this.setState({ socketID: data })
        });
        this.socket.emit("giveAllCartelle");
        this.socket.on("giveAllCartelle", (cartelle: number[][]) => {
            this.setState({ cartelle });
        })
    }

    componentWillUnmount() {
        this.socket?.disconnect();
    }

    render() {
        return (
            <>
                <div>
                    <Router>
                        <Nav />
                        <div className="lg:px-16 px-6 pt-4">
                            <Switch>
                                <Route path="/choose-cartelle" children={<ChooseCartelle socket={this.socket} cartelle={this.state.cartelle} />} />
                                <Route path="/cartelle" children={<Cartelle onAction={this.onAction.bind(this)} onNewNumber={n => this.setState({ called: [...this.state.called, n] })} called={this.state.called} socket={this.socket} cartelle={this.state.cartelle} socketID={this.state.socketID} />} />
                                <Route path="/tabellone">
                                    <Tabellone onAction={this.onAction.bind(this)} onCall={n => this.setState({ called: [...this.state.called, n] })} called={this.state.called} socket={this.socket} socketID={this.state.socketID} />
                                </Route>
                                <Route path="/create-room" children={<CreateRoom socketID={this.state.socketID} socket={this.socket!} setHost={() => this.setState({ host: true })} setKey={k => this.setState({ key: k.toUpperCase() })} />} />
                                <Route path="/join-room" children={<JoinRoom socketID={this.state.socketID} socket={this.socket!} setHost={() => this.setState({ host: false })} setKey={k => this.setState({ key: k.toUpperCase() })} />} />
                                <Route path="/waiting-for-players" children={<WaitingForPlayers socketID={this.state.socketID} socket={this.socket!} gameKey={this.state.key} host={this.state.host} />} />
                                <Route path="*" children={<Home />} />
                            </Switch>
                        </div>
                        <Modal
                            title="Progresso"
                            open={this.state.modal.open}
                            setOpen={(open) => this.setState(state => ({ ...state, modal: { ...state.modal, open }}))}
                        >
                            {this.state.modal.content}
                        </Modal>
                        <Footer />
                    </Router>
                </div>
            </>
        );
    }
}

export default App;