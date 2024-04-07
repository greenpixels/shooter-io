import { Vector2DTO, ProjectileDTO } from '../../../shared/index'
import { randomUUID } from 'crypto'

export class Projectile implements ProjectileDTO {
    id: string
    sourcePlayerId: string
    position: Vector2DTO
    direction: Vector2DTO
    createdAt: number
    lifetime: number
    damage: number

    constructor(socketId: string, position: Vector2DTO, rotation: Vector2DTO, lifetime: number, damage: number) {
        this.id = randomUUID()
        this.sourcePlayerId = socketId
        this.position = position
        this.direction = rotation
        this.createdAt = Date.now()
        this.lifetime = lifetime
        this.damage = damage
    }
}
