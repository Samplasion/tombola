import React, { Component, ComponentProps } from "react";
import { List } from "list-array";
import "./Cartella.css";

export enum TombolaAction {
    NONE,
    AMBO = 2,
    TERNO,
    QUATERNA,
    CINQUINA,
    TOMBOLA = 15
}

interface CartellaProps extends React.HTMLAttributes<HTMLDivElement> {
    number: number,
    layout: number[],
    called: number[], 
    zIndex?: number
}

export default class Cartella extends Component<CartellaProps> {
    render() {
        return (
            <div
                className={"cartella dark:text-gray-400 " + (this.props.className ?? "")}
                style={{ zIndex: this.props.zIndex ?? "unset" }}
                aria-label={`Cartella ${this.props.number} con numeri ${this.props.layout.filter(n=>n).join(", ")}`}>
                <div className="layout-cartella">
                    {this.props.layout.map((num) => <div className={"casella" + (this.props.called.includes(num) ? " called" : "")}><div className="number">{num === 0 ? "" : num}</div></div>)}
                </div>
                <div className="number-cartella">
                    {this.props.number}
                </div>
            </div>
        )
    }
}