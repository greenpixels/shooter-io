import {
    GameEventHandler,
    PlayerDTO,
    Vector2DTO,
    ProjectileDTO,
    DTOConverter,
    vector2DTOSchema,
    Valid,
    KeyMap,
} from '../../../shared/index'
import { Server } from 'socket.io'
import { Player } from '../classes/Player'
import { DefaultEventsMap } from 'socket.io/dist/typed-events'
import { Projectile } from '../classes/Projectile'
import { z } from 'zod'
import { PlayerHandler } from '../PlayerHandler/PlayerHandler'
import { ProjectileHandler } from '../ProjectileHandler/ProjectileHandler'

export class ServerGameHandler extends GameEventHandler {
    readonly server: Server
    readonly playerHandler: PlayerHandler
    readonly projectileHandler: ProjectileHandler

    constructor(server: Server<DefaultEventsMap, DefaultEventsMap, DefaultEventsMap, unknown>) {
        super()
        this.server = server
        this.playerHandler = new PlayerHandler(this)
        this.projectileHandler = new ProjectileHandler(this)
        setInterval(() => this.gameTickEvent(this.playerHandler.players, this.projectileHandler.projectiles), 12)
    }

    get players() {
        return this.playerHandler.players
    }

    get projectiles() {
        return this.projectileHandler.projectiles
    }

    gameTickEvent(visiblePlayers: { [key: string]: Player }, visibleProjectiles: { [key: string]: Projectile }): void {
        const playerDtos = this.playerHandler.handlePlayersTickEvent(visiblePlayers)
        const projectileDtos = this.projectileHandler.handleProjectilesTickEvent(visibleProjectiles)
        this.server.volatile.emit(this.EVENT_GAME_TICK, playerDtos, projectileDtos)
    }

    @Valid(z.string(), vector2DTOSchema)
    playerMoveEvent(socketId: string, moveVectorDTO: Vector2DTO): void {
        const player = this.players[socketId]
        if (!player) return
        this.playerHandler.handePlayerMoveEvent(player, moveVectorDTO)
    }

    @Valid(z.string())
    playerShootEvent(socketId: string): void {
        const player = this.players[socketId]
        if (!player) return
        const projectile = this.playerHandler.handlePlayerShootEvent(socketId, player)
        if (!projectile) return
        this.projectileHandler.projectiles = { ...this.projectiles, [projectile.id]: projectile }
        this.projectileSpawnEvent({ [projectile.id]: DTOConverter.toProjectileDTO(projectile) })
    }

    @Valid(z.string(), vector2DTOSchema)
    playerAimEvent(socketId: string, aimVector: Vector2DTO): void {
        const player = this.players[socketId]
        if (!player) return
        player.aimDirection = aimVector
    }

    playerHurtEvent(affectedPlayers: KeyMap<PlayerDTO>): void {
        this.server.emit(this.EVENT_PLAYER_HURT, affectedPlayers)
    }

    playerDeathEvent(affectedPlayers: KeyMap<PlayerDTO>): void {
        this.server.emit(this.EVENT_PLAYER_DEATH, affectedPlayers)
    }

    playerSpawnEvent(affectedPlayers: KeyMap<PlayerDTO>): void {
        this.server.emit(this.EVENT_PLAYER_SPAWN, affectedPlayers)
    }

    playerLeaveEvent(affectedPlayers: KeyMap<PlayerDTO>): void {
        this.server.emit(this.EVENT_PLAYER_LEAVE, affectedPlayers)
    }

    projectileSpawnEvent(projectiles: KeyMap<ProjectileDTO>): void {
        this.server.emit(this.EVENT_PROJECTILE_SPAWN, projectiles)
    }
    projectileDestroyEvent(affectedProjectiles: KeyMap<ProjectileDTO & { hasCollision: boolean }>): void {
        this.server.emit(this.EVENT_PROJECTILE_DESTROY, affectedProjectiles)
    }
}
