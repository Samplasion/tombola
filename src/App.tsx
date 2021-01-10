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

interface AppState {
    called: number[];
    lastAction: TombolaAction;
    modal: {
        content: string;
        open: boolean;
    };
}

class App extends Component<{}, AppState> {
    state = {
        called: [] as number[],
        lastAction: 0 as TombolaAction,
        modal: {
            content: "",
            open: !1
        }
    }

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

    render() {
        return (
            <>
                <div>
                    <Router>
                        <Nav />
                        <div className="lg:px-16 px-6 pt-4">
                            <Switch>
                                <Route path="/choose-cartelle" children={<ChooseCartelle />} />
                                <Route path="/cartelle" children={<Cartelle onAction={this.onAction.bind(this)} onNewNumber={n => this.setState({ called: [...this.state.called, n] })} called={this.state.called} />} />
                                <Route path="/tabellone">
                                    <Tabellone onAction={this.onAction.bind(this)} onCall={n => this.setState({ called: [...this.state.called, n] })} called={this.state.called} />
                                </Route>
                                <Route path="/" children={<Home />} />
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