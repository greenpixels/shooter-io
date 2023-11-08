import { MOVE_DIRECTION } from "@shared/enums/MoveDirection";
import { ProjectileDTO } from "./dtos/ProjectileDTO";
import { PlayerDTO } from "./dtos/PlayerDTO";


export abstract class GameEventHandler {
    EVENT_GAME_TICK = "game_tick_event"
    abstract game_tick(visible_players : {[key: string] : PlayerDTO}, visible_projectiles : {[key: string] : ProjectileDTO}) : void

    EVENT_PLAYER_DEATH = "player_death_event"
    abstract player_death(affected_players: {[key : string] : PlayerDTO}) : void

    EVENT_PLAYER_SPAWN = "player_spawn_event"
    abstract player_spawn(affected_players: { [key: string]: PlayerDTO; }) : void

    EVENT_PROJECTILE_SPAWN = "projectile_spawn_event"
    abstract projectile_spawn(...args : any) : void

    EVENT_PROJECTILE_DESTROY = "projectile_destroy_event"
    abstract projectile_destroy(...args : any) : void

    EVENT_PLAYER_MOVE = "player_move_event"
    abstract player_move(socket_id: string, direction: MOVE_DIRECTION, key_down: boolean) : void
}