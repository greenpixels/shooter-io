import { Socket } from "socket.io";
import {PlayerDTO} from "../../../shared/dtos/PlayerDTO"
import { Vector2DTO } from "../../../shared/dtos/Vector2DTO";

export class Player implements PlayerDTO {
    private socket : Socket
    id: string;
    position: Vector2DTO;
    velocity: Vector2DTO = {x: 0, y: 0}
    aimDirection: Vector2DTO = {x: 0, y: 0}

    constructor(socket : Socket, position: Vector2DTO) {
        this.socket = socket
        this.id = this.socket.id
        this.position = position
    }
}