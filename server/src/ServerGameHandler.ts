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

    constructor(server: Server<DefaultEventsMap, DefaultEventsMap, DefaultEventsMap, unknown>) {
        super()
        this.server = server
        setInterval(() => this.gameTick(this.players, {}), 12)
    }

    addPlayer(socket: Socket) {
        const newPlayer = new Player(socket, {x: 50, y: 50})
        this.players[socket.id] = newPlayer
        this.playerSpawn({[socket.id] : {id: socket.id, position: newPlayer.position}})
        socket.on(this.EVENT_PLAYER_MOVE, this.playerMove.bind(this))
    }

    
    gameTick(visiblePlayers: { [key: string]: PlayerDTO; }, visibleProjectiles: { [key: string]: ProjectileDTO; }): void { // eslint-disable-line  @typescript-eslint/no-unused-vars
        
        // TODO: We need to find a way to quickly convert the stored players to DTOs in order to send them over. This just ain't it.
        // We should re-think the dto-architecture all together
        const playerDtoMap : { [key: string]: PlayerDTO; } = {}
        Object.keys(this.players).forEach((id) => {
            const original = this.players[id]
            original.position.x += original.velocity.x
            original.position.y += original.velocity.y
            playerDtoMap[id] = {id: original.id, position: original.position}
        })
        this.server.emit(this.EVENT_GAME_TICK, playerDtoMap, {})
    }
    playerDeath(affectedPlayers: { [key: string]: PlayerDTO; }): void {
        throw new Error("Method not implemented." + affectedPlayers);
    }
    playerSpawn(affectedPlayers: { [key: string]: PlayerDTO; }): void {
        this.server.emit(this.EVENT_PLAYER_SPAWN, affectedPlayers)
    }
    projectileSpawn(...args: Array<unknown>): void {
        throw new Error("Method not implemented." + args);
    }
    projectileDestroy(...args: Array<unknown>): void {
        throw new Error("Method not implemented." + args);
    }
    playerMove(socketId: string, direction: MOVE_DIRECTION, isKeyDown: boolean): void {
        const factor = isKeyDown ? 1 : -1
        switch(direction) {
            case MOVE_DIRECTION.DOWN:
                this.players[socketId].velocity.y += 1 * factor; break;
            case MOVE_DIRECTION.UP:
                this.players[socketId].velocity.y += -1 * factor; break;
            case MOVE_DIRECTION.RIGHT:
                this.players[socketId].velocity.x += 1 * factor; break;
            case MOVE_DIRECTION.LEFT:
                this.players[socketId].velocity.x += -1 * factor; break;
        }
        // Clamp values
        this.players[socketId].velocity.x = Math.sign(this.players[socketId].velocity.x)
        this.players[socketId].velocity.y= Math.sign(this.players[socketId].velocity.y)
        // TODO: Calculating movement this way will cause diagonals to be faster.
    }
}