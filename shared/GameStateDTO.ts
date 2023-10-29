import { PlayerDTO } from "./PlayerDTO";
import { ProjectileDTO } from "./ProjectileDTO";

export interface GameStateDTO {
    players: {[key : string] : PlayerDTO};
    projectiles: {[key : string] : ProjectileDTO};
}