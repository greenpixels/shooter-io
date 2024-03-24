import { Vector2DTO } from '../../../shared/dtos/Vector2DTO'
import { ProjectileDTO } from '../../../shared/dtos/ProjectileDTO'
import { randomUUID } from 'crypto'

export class Projectile implements ProjectileDTO {
    id: string
    sourcePlayerId: string
    position: Vector2DTO
    direction: Vector2DTO
    createdAt: number

    constructor(socketId: string, position: Vector2DTO, rotation: Vector2DTO) {
        this.id = randomUUID()
        this.sourcePlayerId = socketId
        this.position = position
        this.direction = rotation
        this.createdAt = Date.now()
    }
}
