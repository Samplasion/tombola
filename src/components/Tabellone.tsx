import { Component } from "react";
import "./Tabellone.css";

interface TabelloneProps {
    called: number[];
    numbers: number[][];
    lastCalled: number;
}

export default class Tabellone extends Component<TabelloneProps> {
    render() {
        return (
            <div className="tabellone max-w-lg">
                <div className="tabellone-header">
                    Tabellone
                </div>
                <div className="flex flex-wrap justify-center">
                    {this.props.numbers.map(cartella => {
                        return <div className="w-5/12 flex flex-wrap mr-2 mb-2">
                            {cartella.map(n => {
                                return <div className={"casella" + (this.props.called.includes(n) ? " selected" : "" ) + (this.props.lastCalled === n ? " active" : "")}>{n}</div>
                            })}
                        </div>
                    })}
                </div>
            </div>
        )
    }
}