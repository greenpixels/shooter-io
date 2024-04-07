import { PlayerDTO, Vector2DTO } from '../../../shared/index'

export class Player implements PlayerDTO {
    id: string
    position: Vector2DTO
    velocity: Vector2DTO = { x: 0, y: 0 }
    aimDirection: Vector2DTO = { x: 0, y: 0 }
    lastShotAt: number
    level = 1
    maxHealth = 100
    health = this.maxHealth

    constructor(socketId: string, position: Vector2DTO) {
        this.id = socketId
        this.position = position
        this.lastShotAt = 0
    }

    setValuesOnRespawn() {
        this.health = this.maxHealth
        this.level = 1
        this.position = { x: 0, y: 0 }
    }
}
