import express from 'express';
import { createServer } from 'node:http';
import { Server } from 'socket.io';
import {SOCKET_EVENT} from "../../shared/enums/SocketEvents"
import {EventInformationDTO} from "../../shared/EventInformationDTO"
import { EventInformationType } from '../../shared/enums/EventInformationType';
import {PlayerDTO} from "../../shared/PlayerDTO"

const app = express();
const server = createServer(app);
const io = new Server(server);

io.on('connection', (socket) => {
  console.log('a user connected');
  socket.emit(SOCKET_EVENT.GAME_EVENT, {type: EventInformationType.PLAYER_SPAWN, payload: {[socket.id] : {id: socket.id, position: {x: 50, y: 50}}}} satisfies EventInformationDTO<PlayerDTO>)
  socket.on('clicked', (text) => {
    console.log(text);
  });
});

server.listen(8080, () => {
  console.log('server running at http://localhost:3000');
});