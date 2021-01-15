import { Socket } from "socket.io";
import randomstring from "randomstring";
import { GameStartError, MAX_PLAYERS, PracticalTombolaAction, Room, RoomJoinError, SocketID, SocketWrapper, StrippedPlayer, TombolaAction } from "../../common/types";
import cartelle from "../cartelle";
import { ServerEventNames } from "../../common/events";

const rooms = new Map<string, Room>();
const flatbellone = [...Array(90).keys()].map(n => n + 1);

export function createRoom(socket: Socket, id: SocketID, username: string) {
    // console.log(username);
    const key = randomstring.generate({
        length: 6,
        capitalization: "uppercase",
        charset: "hex",
        readable: true
    });
    socket.emit("createRoom", {
        key
    });
    rooms.set(key, {
        tabellone: [],
        players: [
            {
                socketData: {
                    id,
                    socket
                },
                username,
                hasTabellone: false,
                cartelle: [],
                choseAllCartelle: false,
                ready: true,
            }
        ],
        gameStarted: false,
        id: key,
        nextProgress: TombolaAction.AMBO,
        winners: {
            2: null,
            3: null,
            4: null,
            5: null,
            15: null,
        }
    })
    socket.on("disconnect", () => {
        const room = rooms.get(key);
        rooms.delete(key);
        room?.players.forEach(player => {
            player.socketData.socket.emit("hostClosed");
            player.socketData.socket.disconnect();
        });
    });
}

export function joinRoom(socket: Socket, id: SocketID, username: string, roomID: string) {
    const room = rooms.get(roomID);
    if (!room) {
        socket.emit("joinRoomError", RoomJoinError.NoSuchRoom);
        return;
    }
    if (room.gameStarted) {
        socket.emit("joinRoomError", RoomJoinError.GameHasStarted);
        return;
    }

    room.players.push({
        socketData: {
            id,
            socket
        },
        username,
        hasTabellone: false,
        cartelle: [],
        choseAllCartelle: false,
        ready: false,
    });

    room.players.forEach(player => {
        player.socketData.socket.emit("playersUpdate", room.players.map(player => {
            return {
                id: player.socketData.id,
                name: player.username
            }
        }));
    });

    socket.emit("joinRoom", "OK");
    socket.on("disconnect", () => {
        room.players = room.players.filter(member => {
            member.socketData.id !== id;
        });
        socket.emit("playersUpdate", room.players.map(player => {
            return {
                id: player.socketData.id,
                name: player.username
            }
        }));
    });
}

export function updatePlayers(socket: Socket, id: SocketID, roomID: string) {
    if (!rooms.has(roomID))
        return socket.emit("playersUpdate", []);
    const room = rooms.get(roomID)!;
    socket.emit("playersUpdate", room.players.map((player): StrippedPlayer => {
        return {
            id: player.socketData.id,
            username: player.username,
            ready: player.ready
        }
    }));
}

export function extractNumber(socket: Socket, id: SocketID) {
    const roomID = roomIDForID(id);
    const room = rooms.get(roomID ?? "");
    if (!roomID || !room || room.players.find(p => p.hasTabellone)?.socketData.id != id)
        return;
    const available = flatbellone.filter(n => !room.tabellone.includes(n));
    const extracted = available[Math.floor(Math.random() * available.length)];
    if (extracted) {
        room.tabellone.push(extracted);

        const progressing = room.players.map(player => {
            const checked = player.hasTabellone ? checkTabellone(room) : checkCartelle(room, player.cartelle.map(c => cartelle[c]));
            return {
                checked,
                player
            }
        }).filter(({ checked }) => {
            // console.log(checked, TombolaAction[checked[1]], TombolaAction[room.nextProgress])
            return checked[0] && checked[1] === room.nextProgress;
        }).sort((dataA, dataB) => {
            return dataA.checked[1] - dataB.checked[1];
        });
        if (progressing.length) {
            room.nextProgress = nextOne(progressing[0].checked[1]);
        
            room.winners[previousOne(room.nextProgress) as PracticalTombolaAction] = progressing.map(({ player }) => {
                return {
                    username: player.username,
                    id: player.socketData.id,
                    ready: player.ready
                }
            });
        }

        return everySocketData(id).forEach(data => {
            data.socket.emit("extractedNumber", extracted, room.tabellone);

            // console.log(progressing);
            if (!progressing.length) return;

            data.socket.emit("progress", 
                previousOne(room.nextProgress),
                progressing.map(p => p.player.socketData.id).includes(data.id),
                ...progressing.map(({ player }) => {
                    return player.socketData.id == data.id ? "" : player.username;
                })
            );

            if (room.nextProgress == TombolaAction.DONE) {
                data.socket.emit("endGame", room.winners);
            }
        });
    }
}

// Skip over the jumps
function nextOne(action: TombolaAction): Exclude<TombolaAction, TombolaAction.NONE> {
    switch(action) {
        case TombolaAction.NONE: return TombolaAction.AMBO;
        case TombolaAction.CINQUINA: return TombolaAction.TOMBOLA;
        default: return action + 1;
    }
}
// opposite of nextOne above
function previousOne(action: TombolaAction): Exclude<TombolaAction, TombolaAction.DONE> {
    switch(action) {
        case TombolaAction.AMBO: return TombolaAction.NONE;
        case TombolaAction.TOMBOLA: return TombolaAction.CINQUINA;
        default: return action - 1;
    }
}

export function chooseCartella(socket: Socket, id: SocketID, cartella: number) {
    const roomID = roomIDForID(id) ?? "";
    const room = rooms.get(roomID);
    if (!room)
        return;

    const i = room.players.findIndex(({ socketData: socket }) => socket.id === id);
    room.players[i].cartelle.push(cartella);
    
    allButOne(id).forEach(socket => socket.emit("chosenCartella", cartella));
}

export function unchooseCartella(socket: Socket, id: SocketID, cartella: number) {
    const roomID = roomIDForID(id) ?? "";
    const room = rooms.get(roomID);
    if (!room)
        return;
    
    const i = room.players.findIndex(({ socketData: socket }) => socket.id === id);
    room.players[i].cartelle = room.players[i].cartelle
        .filter(c => c !== cartella);

    allButOne(id).forEach(socket => socket.emit("unchosenCartella", cartella));
}

export function choseAllCartelle(socket: Socket, id: SocketID) {
    const roomID = roomIDForID(id) ?? "";
    const room = rooms.get(roomID);
    if (!room)
        return;
    room.players[room.players.findIndex(v => v.socketData.id === id)].choseAllCartelle = true;
    if (room.players.map(player => player.choseAllCartelle || player.hasTabellone).every(p => p))
        everySocket(id).forEach(socket => {
            socket.emit("everyoneChose");
        })
}

export function startGame(socket: Socket, id: SocketID) {
    const roomID = roomIDForID(id) ?? "";
    const room = rooms.get(roomID);
    if (!room)
        return;

    if (room.players.length <= 1) {
        socket.emit("startGameError", GameStartError.TooFewPlayers);
        return;
    } else if (room.players.length >= MAX_PLAYERS) {
        socket.emit("startGameError", GameStartError.TooManyPlayers);
        return;
    } else if (!room.players.every(player => player.ready)) {
        socket.emit("startGameError", GameStartError.NotReady);
        return;
    }
    
    room.tabellone = [];
    room.gameStarted = true;
    room.players.forEach(player => player.cartelle = []);

    const sockets = socketObjects(roomID);
    if (!sockets.length)
        return;
    const tabelloneGiver = sockets[Math.floor(Math.random() * sockets.length)];
    const tgIndex = room.players.findIndex(v => v.socketData.id === tabelloneGiver.id);
    room.players.forEach((_, i) => {
        room.players[i].hasTabellone = i === tgIndex;
    });
    const others = allButOne(tabelloneGiver.id);

    tabelloneGiver.socket.emit("startingGame", true);
    others.forEach(socket => {
        socket.emit("startingGame", false);
    })
}

export function pleaseGiveMeCartelle(socket: Socket, id: SocketID) {
    // console.log("pgmc")
    const roomID = roomIDForID(id) ?? "";
    const room = rooms.get(roomID);
    if (!room) {
        socket.emit("gaveMeCartelle", [0]);
        return;
    }

    socket.emit("gaveMeCartelle", room.players.find(player => player.socketData.id == id)?.cartelle ?? [0]);
}

export function ready(socket: Socket, id: SocketID) {
    const roomID = roomIDForID(id) ?? "";
    const room = rooms.get(roomID);
    if (!room)
        return;
    
    const i = room.players.findIndex(p => p.socketData.id === id);
    room.players[i].ready = !room.players[i].ready;

    everySocket(id).forEach(socket => {
        socket.emit(ServerEventNames.PlayersUpdate, room.players.map((p): StrippedPlayer => {
            return {
                id: p.socketData.id,
                username: p.username,
                ready: p.ready
            }
        }))
    });
}

function roomIDForID(id: SocketID): string | undefined {
    return [...rooms.entries()].find(([k, v]) => {
        return v.players.map(s => s.socketData.id).includes(id);
    })?.[0];
}

function allButOne(id: SocketID): Socket[] {
    return rooms.get(roomIDForID(id) ?? "")?.players.filter(player => {
        return player.socketData.id !== id;
    }).map(player => player.socketData.socket) ?? [];
}

function everySocketData(id: SocketID): SocketWrapper[] {
    return rooms.get(roomIDForID(id) ?? "")?.players.map(player => player.socketData) ?? [];
}

function everySocket(id: SocketID): Socket[] {
    return everySocketData(id).map(s => s.socket);
}

function socketObjects(room?: string): SocketWrapper[] {
    return rooms.get(room ?? "")?.players.map(player => player.socketData) ?? [];
}

// function subdivideTabellone(tabellone: number[]): [
//     number[], number[], number[], number[], number[], number[]
// ] {
//     return [[],[],[],[],[],[]];
// }

const matrix = [1, 2, 3, 4, 5, 11, 12, 13, 14, 15, 21, 22, 23, 24, 25];
const subdividedTabellone = [
    matrix,
    matrix.map(n => n + 5),
    matrix.map(n => n + 30),
    matrix.map(n => n + 35),
    matrix.map(n => n + 60),
    matrix.map(n => n + 65),
] as const;

function checkTabellone(room: Room): [boolean, TombolaAction] {
    for (let cartella of subdividedTabellone) {
        const lines = [
            cartella.filter((n, i) => i < 5 && room.tabellone.includes(n)),
            cartella.filter((n, i) => i >= 5 && i < 10 && room.tabellone.includes(n)),
            cartella.filter((n, i) => i >= 10 && i < 15 && room.tabellone.includes(n)),
        ]
        // console.log(lines, "lines")
        if (lines.flat().length === 15)
            return [true, TombolaAction.TOMBOLA];
        else for (let i of [5, 4, 3, 2].sort((b, a) => a - b).filter(a => a >= room.nextProgress)) {
            // // console.log("Checking", i);
            if (lines.some(line => line.length === i)) {
                return [true, i];
            }
        }
    }
    return [false, TombolaAction.NONE];
}

function checkCartelle(room: Room, cartelle: number[][]): [boolean, TombolaAction] {
    for (let cartella of cartelle) {
        const lines = [
            cartella.filter((n, i) => i < 9 && n && room.tabellone.includes(n)),
            cartella.filter((n, i) => i >= 9 && i < 18 && n && room.tabellone.includes(n)),
            cartella.filter((n, i) => i >= 18 && i < 27 && n && room.tabellone.includes(n)),
        ]
        
        // console.log(lines);

        if (lines.flat().length === 15) {
            return [true, TombolaAction.TOMBOLA];
        } else for (let i of [5, 4, 3, 2].sort((b, a) => a - b).filter(a => a >= room.nextProgress)) {
            // console.log(lines.some(line => line.length === i));
            if (lines.some(line => line.length === i)) {
                return [true, i];
            }
        }
    }
    return [false, TombolaAction.NONE];
}