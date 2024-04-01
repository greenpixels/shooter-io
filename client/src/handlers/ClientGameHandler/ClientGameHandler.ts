import { GameEventHandler } from '@shared/GameEventHandler'
import { Socket } from 'socket.io-client'
import { PlayerDTO } from '@shared/dtos/PlayerDTO'
import { ProjectileDTO } from '@shared/dtos/ProjectileDTO'
import { DTOConverter } from '@shared/classes/DTOConverter'
import { Vector2DTO } from '@shared/dtos/Vector2DTO'
import { Application, Renderer } from 'pixi.js'
import { PlayerHandler } from '../PlayerHandler/PlayerHandler'
import { DTOMap } from '../../types/DTOMap'
import { ProjectileHandler } from '../ProjectileHandler/ProjectileHandler'
import { InputHandler } from '../InputHandler/InputHandler'
import { FormatHelper } from '@shared/helpers/FormatHelper'

export type ClientGameHandlerProps = {
    socket: Socket & { id: string }
    application: Application<Renderer<HTMLCanvasElement>>
    canvasSize: Vector2DTO
}

export class ClientGameHandler extends GameEventHandler {
    application: Application<Renderer<HTMLCanvasElement>>
    socket: Socket & { id: string }
    playerHandler: PlayerHandler
    projectileHandler: ProjectileHandler
    inputHandler: InputHandler

    constructor(props: ClientGameHandlerProps) {
        super()
        this.application = props.application
        this.socket = props.socket

        this.playerHandler = new PlayerHandler(this.updateGameInformation.bind(this), this.application)
        this.projectileHandler = new ProjectileHandler(this.application)
        this.inputHandler = new InputHandler(props.canvasSize)

        this.socket.on(this.EVENT_GAME_TICK, this.gameTickEvent.bind(this))
        this.socket.on(this.EVENT_PLAYER_SPAWN, this.playerSpawnEvent.bind(this))
        this.socket.on(this.EVENT_PLAYER_DEATH, this.playerDeathEvent.bind(this))
        this.socket.on(this.EVENT_PLAYER_LEAVE, this.playerLeaveEvent.bind(this))
        this.socket.on(this.EVENT_PLAYER_HURT, this.playerHurtEvent.bind(this))

        this.socket.on(this.EVENT_PROJECTILE_SPAWN, this.projectileSpawnEvent.bind(this))
        this.socket.on(this.EVENT_PROJECTILE_DESTROY, this.projectileDestroyEvent.bind(this))
    }

    updateGameInformation() {
        const playerDtos = Object.keys(this.playerHandler.players).map((key) => {
            return DTOConverter.toPlayerDTO(this.playerHandler.players[key])
        })
        playerDtos.sort()
        dispatchEvent(
            new CustomEvent('ongamestatechange', {
                detail: {
                    players: playerDtos,
                    ownId: this.socket.id,
                },
            })
        )
    }

    playerShootEvent(socketId: string): void {
        this.socket.emit(this.EVENT_PLAYER_SHOOT, socketId)
    }

    gameTickEvent(visiblePlayers: DTOMap<PlayerDTO>, visibleProjectiles: { [key: string]: ProjectileDTO }): void {
        this.playerHandler.handlePlayerTickEvent(visiblePlayers)
        this.projectileHandler.handleProjectileTickEvent(visibleProjectiles)
        this.moveCameraWithCurrentPlayer()
        this.application.stage.sortChildren()
    }

    playerMoveEvent(socketId: string, moveVector: Vector2DTO): void {
        this.socket.emit(this.EVENT_PLAYER_MOVE, socketId, FormatHelper.limitVectorDecimals(moveVector))
    }

    playerAimEvent(socketId: string, aimVector: Vector2DTO): void {
        this.socket.volatile.emit(this.EVENT_PLAYER_AIM, socketId, FormatHelper.limitVectorDecimals(aimVector))
    }

    playerDeathEvent(...args: Array<unknown>): void {
        throw new Error('Method not implemented.' + args[0])
    }

    playerSpawnEvent(affectedPlayers: { [key: string]: PlayerDTO }): void {
        this.playerHandler.handlePlayerSpawnEvent(affectedPlayers)
    }

    playerHurtEvent(affectedPlayers: { [key: string]: PlayerDTO }): void {
        this.playerHandler.handlePlayerHurtEvent(affectedPlayers)
    }

    playerLeaveEvent(affectedPlayers: { [key: string]: PlayerDTO }): void {
        this.playerHandler.handlePlayerLeaveEvent(affectedPlayers)
    }

    projectileSpawnEvent(affectedProjectiles: { [key: string]: ProjectileDTO }): void {
        this.projectileHandler.handleProjectileSpawnEvent(affectedProjectiles)
        this.playerHandler.handlePlayerShootingProjectile(affectedProjectiles)
    }

    projectileDestroyEvent(affectedProjectiles: { [key: string]: ProjectileDTO }): void {
        this.projectileHandler.handleProjectileDestroyEvent(affectedProjectiles)
    }

    moveCameraWithCurrentPlayer() {
        const currentPlayer = this.playerHandler.players[this.socket.id]
        if (currentPlayer) {
            this.application.stage.pivot.set(
                currentPlayer.position.x + currentPlayer.sprite.width / 2 - this.application.screen.width / 2,
                currentPlayer.position.y + currentPlayer.sprite.height / 2 - this.application.screen.height / 2
            )
        }
    }
}
