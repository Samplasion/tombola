import { Socket } from "socket.io";

export type SocketID = string;
export interface SocketWrapper {
    id: SocketID,
    socket: Socket
};
export interface Player {
    socketData: SocketWrapper;
    username: string;
    hasTabellone: boolean;
    cartelle: number[];
    choseAllCartelle: boolean;
}
export interface StrippedPlayer {
    username: string;
    id: SocketID;
}
export enum TombolaAction {
    NONE,
    AMBO = 2,
    TERNO,
    QUATERNA,
    CINQUINA,
    TOMBOLA = 15,
    DONE
}
export type PracticalTombolaAction = Exclude<Exclude<TombolaAction, TombolaAction.NONE>, TombolaAction.DONE>;
export interface Room {
    tabellone: number[];
    players: Player[];
    gameStarted: boolean;
    id: string;
    nextProgress: Exclude<TombolaAction, TombolaAction.NONE>;
    winners: {
        [Prog in PracticalTombolaAction]: StrippedPlayer[] | null;
    };
};
export enum RoomJoinError {
    NoSuchRoom,
    GameHasStarted
}