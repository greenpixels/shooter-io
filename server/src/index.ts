import express from 'express';
import {createServer} from 'node:http';
import {Server} from 'socket.io';
import {SOCKET_EVENT} from "../../shared/enums/SocketEvents"
import {EventInformationDTO} from "../../shared/dtos/EventInformationDTO"
import {EventInformationType} from '../../shared/enums/EventInformationType';
import {PlayerDTO} from "../../shared/dtos/PlayerDTO"
import {Vector2} from "./types/Vector2";
import {MoveEvent} from "../../shared/MoveEvent";
import {MOVE_DIRECTION} from "../../shared/enums/MoveDirection";

const app = express();
const server = createServer(app);
const io = new Server(server);

let moveDirection = new Vector2({x: 0, y: 0});
let keysPressed = [false, false, false, false];

io.on('connection', (socket) => {
  console.log('a user connected');
  socket.emit(SOCKET_EVENT.GAME_EVENT, {type: EventInformationType.PLAYER_SPAWN, payload: {[socket.id] : {id: socket.id, position: {x: 50, y: 50}}}} satisfies EventInformationDTO<PlayerDTO>)
  socket.on('clicked', (text) => {
    console.log(text);
  });

  socket.on("move", (data: MoveEvent) => {
    switch (data.direction) {
        case MOVE_DIRECTION.UP:
            if(data.key_down !== keysPressed[0]) {
                console.log("called")
                if(data.key_down) {
                    moveDirection.y -= 1;
                } else {
                    moveDirection.add({x: 0, y: 1});
                }
                keysPressed[0] = data.key_down;
            }
            break;
    }

    console.log(moveDirection)
  })

});

server.listen(8080, () => {
  console.log('server running at http://localhost:3000');
});