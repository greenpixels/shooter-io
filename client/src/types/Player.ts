import { PlayerDTO } from "@shared/dtos/PlayerDTO.ts";
import {Entity} from "./Entity"

export class Player extends Entity<PlayerDTO> {
    public sync(dto: PlayerDTO) {
        this.position = dto.position;
    }
}