import { Component } from "react";
import { TombolaAction } from "../components/Cartella";
import TabelloneClass from "../components/Tabellone";

const matrix = [1, 2, 3, 4, 5, 11, 12, 13, 14, 15, 21, 22, 23, 24, 25];

interface TabelloneProps {
    called: number[];
    onCall: (number: number) => void;
    onAction: (number: TombolaAction) => void;
}

interface TabelloneState {
    lastCalled: number;
}

export default class Tabellone extends Component<TabelloneProps, TabelloneState> {
    state = {
        lastCalled: 0
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

        console.log(c)

        c.forEach(cartella => {
            const lines = [
                cartella.filter((n, i) => i < 5 && this.props.called.includes(n)),
                cartella.filter((n, i) => i >= 5 && i < 10 && this.props.called.includes(n)),
                cartella.filter((n, i) => i >= 10 && i < 15 && this.props.called.includes(n)),
            ]
            console.log(lines);
            if (lines.flat().length === 15)
                return this.props.onAction?.(TombolaAction.TOMBOLA)
            else for (let i of [5, 4, 3, 2] as const) {
                // console.log("Checking", i);
                if (lines.some(line => line.length === i)) {
                    return this.props.onAction?.(i);
                }
            }
        });
    }

    render() {
        this.checkActions();

        const flattenedNumbers = this.numbers.flat().filter(n => !this.props.called.includes(n));

        return (
            <>
                <TabelloneClass lastCalled={this.state.lastCalled} numbers={this.numbers} called={this.props.called} />
                <button
                    className="btn mb-4 text-center w-full"
                    onClick={() => this.extractNumber(flattenedNumbers)}
                >Estrai!</button>
            </>
        )
    }

    extractNumber(flattenedNumbers: number[]) {
        const n = flattenedNumbers[Math.floor(Math.random() * flattenedNumbers.length)];
        this.props.onCall(n);
        this.setState(state => ({ ...state, lastCalled: n }));
    }
}