import { MOVE_DIRECTION } from "./enums/MoveDirection";
import { ProjectileDTO } from "./dtos/ProjectileDTO";
import { PlayerDTO } from "./dtos/PlayerDTO";


export abstract class GameEventHandler {
    EVENT_GAME_TICK = "game_tick_event"
    abstract gameTick(visiblePlayers : {[key: string] : PlayerDTO}, visibleProjectiles : {[key: string] : ProjectileDTO}) : void

    EVENT_PLAYER_DEATH = "player_death_event"
    abstract playerDeath(affectedPlayers: {[key : string] : PlayerDTO}) : void

    EVENT_PLAYER_SPAWN = "player_spawn_event"
    abstract playerSpawn(affectedPlayers: { [key: string]: PlayerDTO; }) : void

    EVENT_PROJECTILE_SPAWN = "projectile_spawn_event"
    abstract projectileSpawn(...args : Array<unknown>) : void

    EVENT_PROJECTILE_DESTROY = "projectile_destroy_event"
    abstract projectileDestroy(...args : Array<unknown>) : void

    EVENT_PLAYER_MOVE = "player_move_event"
    abstract playerMove(socketId: string, direction: MOVE_DIRECTION, isKeyDown: boolean) : void
}