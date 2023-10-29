import { PlayerDTO } from "@shared/PlayerDTO";
import {Entity} from "./Entity"

export class Player extends Entity<PlayerDTO> {
    public sync(dto: PlayerDTO) {
        this.position = dto.position;
    }
}