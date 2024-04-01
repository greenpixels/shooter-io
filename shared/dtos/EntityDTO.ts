import { Vector2DTO } from './Vector2DTO'

export interface EntityDTO {
    /**
     * @format uuid
     * @maxLength 50
     * @minLength 2
     */
    id: string,
    position: Vector2DTO
}
