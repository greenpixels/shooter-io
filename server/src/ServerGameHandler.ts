import { GameEventHandler } from "../../shared/GameEventHandler";
import { Server, Socket } from "socket.io";
import { PlayerDTO } from "../../shared/dtos/PlayerDTO";
import { Player } from "./classes/Player";
import { DefaultEventsMap } from "socket.io/dist/typed-events";
import { Vector2DTO } from "../../shared/dtos/Vector2DTO";
import { Vector2 } from "../../shared/classes/Vector2";
import { lengthdirX, lengthdirY } from "../../shared/helpers/trigonometry";

export class ServerGameHandler extends GameEventHandler {
    private server : Server
    private players : { [key: string]: Player; } = {}

    constructor(server: Server<DefaultEventsMap, DefaultEventsMap, DefaultEventsMap, unknown>) {
        super()
        this.server = server
        setInterval(() => this.gameTick(this.players, {}), 12)
    }

    addPlayer(socket: Socket) {
        console.log(`A player with the socket ID ${socket.id} has connected!`)
        const newPlayer = new Player(socket, {x: 50, y: 50})
        this.players[socket.id] = newPlayer
        this.playerSpawn({[socket.id] : {id: socket.id, position: newPlayer.position}})
        socket.on(this.EVENT_PLAYER_MOVE, this.playerMove.bind(this))
    }

    removePlayer(socket: Socket) {
        console.log(`A player with the socket ID ${socket.id} has disconnected!`)
        if(this.players[socket.id] !== undefined) {
            this.playerLeave({[socket.id] : {id: socket.id, position: this.players[socket.id].position}})
            delete this.players[socket.id] 
        }
    }

    // @ts-expect-error  @typescript-eslint/no-unused-vars As of now we are not  using projectiles, so the argument is still unused
    gameTick(visiblePlayers: { [key: string]: Player; }, visibleProjectiles: { [key: string]: Projectile; }): void {     //  eslint-disable-line  @typescript-eslint/no-unused-vars 
        const playerDtoMap : { [key: string]: PlayerDTO; } = {}
        const baseSpeed = 1.5

        Object.keys(visiblePlayers).forEach((id) => {
            const original = visiblePlayers[id]
            if(Math.abs(original.velocity.x) + Math.abs(original.velocity.y) > 0) {
                const angle = new Vector2(original.velocity).angle()
                original.position.x += lengthdirX(baseSpeed, angle)
                original.position.y += lengthdirY(baseSpeed, angle)
            }
            playerDtoMap[id] = {id: original.id, position: original.position}

        })

        this.server.emit(this.EVENT_GAME_TICK, playerDtoMap, {})
    }
    playerMove(socketId: string, moveVectorDTO: Vector2DTO): void {
        const player = this.players[socketId];
        player.velocity.x = Math.sign(moveVectorDTO.x)
        player.velocity.y = Math.sign(moveVectorDTO.y)
    }

    playerDeath(affectedPlayers: { [key: string]: PlayerDTO; }): void {
        throw new Error("Method not implemented." + affectedPlayers);
    }
    playerSpawn(affectedPlayers: { [key: string]: PlayerDTO; }): void {
        this.server.emit(this.EVENT_PLAYER_SPAWN, affectedPlayers)
    }

    playerLeave(affectedPlayers: { [key: string] : PlayerDTO;}) : void {
        this.server.emit(this.EVENT_PLAYER_LEAVE, affectedPlayers)
    }

    projectileSpawn(...args: Array<unknown>): void {
        throw new Error("Method not implemented." + args);
    }
    projectileDestroy(...args: Array<unknown>): void {
        throw new Error("Method not implemented." + args);
    }
    
}