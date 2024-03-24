import { GameEventHandler } from "../../shared/GameEventHandler";
import { Server, Socket } from "socket.io";
import { PlayerDTO } from "../../shared/dtos/PlayerDTO";
import { Player } from "./classes/Player";
import { DefaultEventsMap } from "socket.io/dist/typed-events";
import { Vector2DTO } from "../../shared/dtos/Vector2DTO";
import { Vector2 } from "../../shared/classes/Vector2";
import { lengthdirX, lengthdirY } from "../../shared/helpers/trigonometry";
import { Projectile } from "./classes/Projectile";
import { ProjectileDTO } from "../../shared/dtos/ProjectileDTO";
import {DTOConverter} from "../../shared/classes/DTOConverter"

export class ServerGameHandler extends GameEventHandler {
    private server : Server
    private players : { [key: string]: Player; } = {}
    private projectiles : {[key: string]: Projectile; } = {}

    constructor(server: Server<DefaultEventsMap, DefaultEventsMap, DefaultEventsMap, unknown>) {
        super()
        this.server = server
        setInterval(() => this.gameTick(this.players, this.projectiles), 12)
    }

    addPlayer(socket: Socket) {
        const newPlayer = new Player(socket.id, {x: 50, y: 50})
        this.players[socket.id] = newPlayer
        this.playerSpawn({[socket.id] : DTOConverter.toPlayerDTO(newPlayer)})
        socket.on(this.EVENT_PLAYER_MOVE, this.playerMove.bind(this))
        socket.on(this.EVENT_PLAYER_AIM, this.playerAim.bind(this))
        socket.on(this.EVENT_PLAYER_SHOOT, this.playerShoot.bind(this))
    }

    removePlayer(socket: Socket) {
        this.playerLeave({[socket.id] : DTOConverter.toPlayerDTO(this.players[socket.id])})
        delete this.players[socket.id] 
        
    }


    gameTick(visiblePlayers: { [key: string]: Player; }, visibleProjectiles: { [key: string]: Projectile; }): void {
        const playerDtoMap : { [key: string]: PlayerDTO; } = {}
        const projectileDtoMap : { [key: string]: ProjectileDTO; } = {}
        const baseSpeed = 1.5

        Object.keys(visiblePlayers).forEach((id) => {
            const original = visiblePlayers[id]
            if(Math.abs(original.velocity.x) + Math.abs(original.velocity.y) > 0) {
                const angle = new Vector2(original.velocity).angle()
                original.position.x += lengthdirX(baseSpeed, angle)
                original.position.y += lengthdirY(baseSpeed, angle)
            }
            playerDtoMap[id] = DTOConverter.toPlayerDTO(original)
        })

        Object.keys(visibleProjectiles).forEach((id) => {
            const original = visibleProjectiles[id]
            const angle = new Vector2(original.direction).angle()
            original.position.x += lengthdirX(baseSpeed * 9, angle)
            original.position.y += lengthdirY(baseSpeed * 9, angle)
            if(Date.now() - original.createdAt > 500) {
                this.removeProjectile(original.id)
            } else {
                projectileDtoMap[id] = DTOConverter.toProjectileDTO(original)
            }
            
        })

        this.server.emit(this.EVENT_GAME_TICK, playerDtoMap, projectileDtoMap)
    }

    playerMove(socketId: string, moveVectorDTO: Vector2DTO): void {
        const player = this.players[socketId];
        player.velocity.x = Math.sign(moveVectorDTO.x)
        player.velocity.y = Math.sign(moveVectorDTO.y)
    }

    playerShoot(socketId: string): void {
        const player = this.players[socketId]
        const MINIMAL_SHOT_DELAY = 1000
        const now = Date.now()
        if(now - player.lastShotAt < MINIMAL_SHOT_DELAY) {
            return
        }
        player.lastShotAt = now
        const projectile = new Projectile(socketId, {...player.position}, {...player.aimDirection})
        const angle = new Vector2(projectile.direction).angle()
        projectile.position.x += lengthdirX(60, angle)
        projectile.position.y += lengthdirY(60, angle)
        
        this.projectiles = {...this.projectiles, [projectile.id]: projectile}
        this.projectileSpawn({[projectile.id]: DTOConverter.toProjectileDTO(projectile)})
    }

    playerAim(socketId: string, aimVector: Vector2DTO): void {
        const player = this.players[socketId];
        player.aimDirection = aimVector
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

    removeProjectile(projectileID : string) {
        this.projectileDestroy({[projectileID]: this.projectiles[projectileID]})
        delete this.projectiles[projectileID];
    }

    projectileSpawn(projectiles: { [key: string] : ProjectileDTO;}): void {
        this.server.emit(this.EVENT_PROJECTILE_SPAWN, projectiles)
    }
    projectileDestroy(affectedProjectiles: { [key: string] : ProjectileDTO;}): void {
        this.server.emit(this.EVENT_PROJECTILE_DESTROY, affectedProjectiles)
    }
}