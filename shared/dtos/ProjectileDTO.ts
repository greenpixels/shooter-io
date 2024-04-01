import { EntityDTO } from './EntityDTO'
import { Vector2DTO } from './Vector2DTO'

export interface ProjectileDTO extends EntityDTO {
    direction: Vector2DTO,
    sourcePlayerId: string
}
