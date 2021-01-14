/// <reference path="./index.d.ts" />

import express from 'express';
import path from 'path';
import http from 'http';
import socketio from 'socket.io';
import randomstring from "randomstring";
// import routes from './routes';
import { chooseCartella, choseAllCartelle, createRoom, extractNumber, joinRoom, pleaseGiveMeCartelle, ready, startGame, unchooseCartella, updatePlayers } from './routines/rooms';
import cartelle from './cartelle';
import {
    stripIndents
} from "common-tags";
import ip from "ip";
import { ClientEventNames } from "../common/events";

import { config } from "dotenv";
import { join } from 'path';
config({
  path: join(__dirname, "..", "..", ".env")
});

const app = express();

app.use(express.json());
app.use(express.urlencoded());
app.use(express.static(path.join(__dirname, '..', '..', 'build')));
// app.use(routes);

// 404 route
app.get("*", (req, res) => res.sendFile(path.join(__dirname, '..', '..', 'build', 'index.html')));

const server = http.createServer(app);
const io = new socketio.Server(server, {
    cors: {
        origin: process.env.DOMAIN,
        methods: ["GET", "POST"]
    }
});

io.on("connection", (socket: socketio.Socket) => {
    const ID = randomstring.generate();
    socket.emit("ID", ID)
    console.log("client connected:", ID);
    socket.on("disconnect", () => console.log(`client disconnected: ${ID}`));
    socket.on("createRoom", createRoom.bind(null, socket, ID));
    socket.on("joinRoom", joinRoom.bind(null, socket, ID));
    socket.on("playersUpdate", updatePlayers.bind(null, socket, ID));
    socket.on("extractNumber", extractNumber.bind(null, socket, ID));
    socket.on("chooseCartella", chooseCartella.bind(null, socket, ID));
    socket.on("unchooseCartella", unchooseCartella.bind(null, socket, ID));
    socket.on("startGame", startGame.bind(null, socket, ID));
    socket.on("choseAllCartelle", choseAllCartelle.bind(null, socket, ID));
    socket.on(ClientEventNames.PleaseGiveMeCartelle, pleaseGiveMeCartelle.bind(null, socket, ID));
    socket.on(ClientEventNames.GiveAllCartelle, () => {
        socket.emit(ClientEventNames.GiveAllCartelle, cartelle);
    });
    socket.on(ClientEventNames.Ready, ready.bind(null, socket, ID));
})

const PORT = process.env.PORT || 8080;
server.listen(PORT, () => {
    console.log(stripIndents`
    Listening on port ${PORT}.

    Localhost server: http://localhost:${PORT}
    Local net server: https://${ip.address()}:${PORT}
    Configured domain: ${process.env.DOMAIN}
    `)
});