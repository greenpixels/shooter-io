import { Socket } from "socket.io";
import {PlayerDTO} from "@shared/dtos/PlayerDTO"
import { Vector2DTO } from "@shared/dtos/Vector2DTO";

export class Player implements PlayerDTO {
    private socket : Socket
    velocity: Vector2DTO = {x: 0, y: 0}
    id: string;
    position: Vector2DTO;
    

    constructor(socket : Socket, position: Vector2DTO) {
        this.socket = socket
        this.id = this.socket.id
        this.position = position
    }
}