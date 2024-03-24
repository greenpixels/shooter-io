import { PlayerDTO } from '../../../shared/dtos/PlayerDTO'
import { Vector2DTO } from '../../../shared/dtos/Vector2DTO'

export class Player implements PlayerDTO {
    id: string
    position: Vector2DTO
    velocity: Vector2DTO = { x: 0, y: 0 }
    aimDirection: Vector2DTO = { x: 0, y: 0 }
    lastShotAt: number

    constructor(socketId: string, position: Vector2DTO) {
        this.id = socketId
        this.position = position
        this.lastShotAt = 0
    }
}
