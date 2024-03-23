import { EntityDTO } from "./EntityDTO";
import { Vector2DTO } from "./Vector2DTO";

export interface PlayerDTO extends EntityDTO {
    aimDirection: Vector2DTO;
}