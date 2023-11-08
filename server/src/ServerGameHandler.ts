import { GameEventHandler } from "../../shared/GameEventHandler";
import { MOVE_DIRECTION } from "../../shared/enums/MoveDirection";
import { Server, Socket } from "socket.io";
import { PlayerDTO } from "../../shared/dtos/PlayerDTO";
import { ProjectileDTO } from "../../shared/dtos/ProjectileDTO";
import { Player } from "./types/Player";
import { DefaultEventsMap } from "socket.io/dist/typed-events";

export class ServerGameHandler extends GameEventHandler {
    private server : Server
    private players : { [key: string]: Player; } = {}

    constructor(server: Server<DefaultEventsMap, DefaultEventsMap, DefaultEventsMap, any>) {
        super()
        this.server = server
        setInterval(() => this.game_tick(this.players, {}), 12)
    }

    add_player(socket: Socket) {
        const new_player = new Player(socket, {x: 50, y: 50})
        this.players[socket.id] = new_player
        this.player_spawn({[socket.id] : {id: socket.id, position: new_player.position}})
        socket.on(this.EVENT_PLAYER_MOVE, this.player_move.bind(this))
    }

    game_tick(visible_players: { [key: string]: PlayerDTO; }, visible_projectiles: { [key: string]: ProjectileDTO; }): void {
        // TODO: We need to find a way to quickly convert the stored players to DTOs in order to send them over. This just ain't it.
        // We should re-think the dto-architecture all together
        var player_dto_map : { [key: string]: PlayerDTO; } = {}
        Object.keys(this.players).forEach((id) => {
            const original = this.players[id]
            original.position.x += original.velocity.x
            original.position.y += original.velocity.y
            player_dto_map[id] = {id: original.id, position: original.position}
        })
        this.server.emit(this.EVENT_GAME_TICK, player_dto_map, {})
    }
    player_death(affected_players: { [key: string]: PlayerDTO; }): void {
        throw new Error("Method not implemented.");
    }
    player_spawn(affected_players: { [key: string]: PlayerDTO; }): void {
        this.server.emit(this.EVENT_PLAYER_SPAWN, affected_players)
    }
    projectile_spawn(...args: any): void {
        throw new Error("Method not implemented.");
    }
    projectile_destroy(...args: any): void {
        throw new Error("Method not implemented.");
    }
    player_move(socket_id: string, direction: MOVE_DIRECTION, key_down: boolean): void {
        const factor = key_down ? 1 : -1
        switch(direction) {
            case MOVE_DIRECTION.DOWN:
                this.players[socket_id].velocity.y += 1 * factor; break;
            case MOVE_DIRECTION.UP:
                this.players[socket_id].velocity.y += -1 * factor; break;
            case MOVE_DIRECTION.RIGHT:
                this.players[socket_id].velocity.x += 1 * factor; break;
            case MOVE_DIRECTION.LEFT:
                this.players[socket_id].velocity.x += -1 * factor; break;
        }
        // Clamp values
        this.players[socket_id].velocity.x = Math.sign(this.players[socket_id].velocity.x)
        this.players[socket_id].velocity.y= Math.sign(this.players[socket_id].velocity.y)
        // TODO: Calculating movement this way will cause diagonals to be faster.
    }
}