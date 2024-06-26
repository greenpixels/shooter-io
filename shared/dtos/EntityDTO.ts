import { Vector2DTO } from './Vector2DTO'

export interface EntityDTO {
    /**
     * @maxLength 50
     * @minLength 2
     */
    id: string,
    position: Vector2DTO
}
