import { GameEventHandler } from '@shared/GameEventHandler'
import { Socket } from 'socket.io-client'
import { Projectile } from '../../classes/Projectile'
import { PlayerDTO } from '@shared/dtos/PlayerDTO'
import { ProjectileDTO } from '@shared/dtos/ProjectileDTO'
import { DTOConverter } from '@shared/classes/DTOConverter'
import { Vector2DTO } from '@shared/dtos/Vector2DTO'
import { Application, Renderer } from 'pixi.js'
import { PlayerHandler } from '../PlayerHandler/PlayerHandler'
import { DTOMap } from '../../types/DTOMap'
import { ProjectileHandler } from '../ProjectileHandler/ProjectileHandler'

export type ClientGameHandlerProps = {
    socket: Socket & { id: string }
    game: Application<Renderer<HTMLCanvasElement>>
    canvasSize: Vector2DTO
}

export class ClientGameHandler extends GameEventHandler {
    game: Application<Renderer<HTMLCanvasElement>>
    socket: Socket & { id: string }

    projectiles: { [key: string]: Projectile } = {}
    moveVector: Vector2DTO = { x: 0, y: 0 }
    canvasSize: Vector2DTO = { x: 0, y: 0 }
    playerHandler: PlayerHandler
    projectileHandler: ProjectileHandler

    constructor(props: ClientGameHandlerProps) {
        super()
        this.game = props.game
        this.socket = props.socket
        this.canvasSize = props.canvasSize
        this.playerHandler = new PlayerHandler(this.updateGameInformation.bind(this), this.game)
        this.projectileHandler = new ProjectileHandler(this.game)

        this.socket.on(this.EVENT_GAME_TICK, this.gameTickEvent.bind(this))
        this.socket.on(this.EVENT_PLAYER_SPAWN, this.playerSpawnEvent.bind(this))
        this.socket.on(this.EVENT_PLAYER_DEATH, this.playerDeathEvent.bind(this))
        this.socket.on(this.EVENT_PLAYER_LEAVE, this.playerLeaveEvent.bind(this))

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

    handleMouseMoveInput(ev: MouseEvent) {
        const clampValue = this.canvasSize.x * 2
        const centeredX = Math.max(-clampValue, Math.min(clampValue, ev.x - this.canvasSize.x / 2))
        const centeredY = Math.max(-clampValue, Math.min(clampValue, ev.y - this.canvasSize.y / 2))
        let normalizedMX = centeredX / clampValue
        if (Math.abs(normalizedMX) > 1) {
            normalizedMX = Math.sign(normalizedMX)
        }
        let normalizedMY = centeredY / clampValue
        if (Math.abs(normalizedMY) > 1) {
            normalizedMY = Math.sign(normalizedMY)
        }
        this.playerAimEvent(this.socket.id, { x: normalizedMX, y: normalizedMY })
    }

    handleKeyboardInput(ev: KeyboardEvent, isKeyDown: boolean) {
        const lastMoveVector = { ...this.moveVector }
        const downOffset = Math.sign(Number(isKeyDown) - 0.5)
        const amount = downOffset

        switch (ev.code) {
            case 'KeyS':
            case 'ArrowDown':
                ev.preventDefault()
                this.moveVector.y += amount
                break

            case 'KeyW':
            case 'ArrowUp':
                ev.preventDefault()
                this.moveVector.y -= amount
                break

            case 'KeyA':
            case 'ArrowLeft':
                ev.preventDefault()
                this.moveVector.x -= amount
                break

            case 'KeyD':
            case 'ArrowRight':
                ev.preventDefault()
                this.moveVector.x += amount
                break

            case 'Tab':
                ev.preventDefault()
                break
        }

        if (Math.abs(this.moveVector.x) > 1) {
            this.moveVector.x = Math.sign(this.moveVector.x)
        }
        if (Math.abs(this.moveVector.y) > 1) {
            this.moveVector.y = Math.sign(this.moveVector.y)
        }
        if (
            ev.repeat ||
            !this.socket.id ||
            (lastMoveVector.x === this.moveVector.x && lastMoveVector.y === this.moveVector.y)
        ) {
            return
        }
        this.playerMoveEvent(this.socket.id, this.moveVector)
    }

    handleMouseClickInput(ev: MouseEvent): void {
        ev.preventDefault()
        this.playerShootEvent(this.socket.id)
    }

    playerShootEvent(socketId: string): void {
        this.socket.emit(this.EVENT_PLAYER_SHOOT, socketId)
    }

    gameTickEvent(visiblePlayers: DTOMap<PlayerDTO>, visibleProjectiles: { [key: string]: ProjectileDTO }): void {
        this.playerHandler.handlePlayerTickEvent(visiblePlayers)
        this.projectileHandler.handleProjectileTickEvent(visibleProjectiles)
        this.moveCameraWithCurrentPlayer()
        this.game.stage.sortChildren()
    }

    playerMoveEvent(socketId: string, moveVector: Vector2DTO): void {
        this.socket.emit(this.EVENT_PLAYER_MOVE, socketId, moveVector)
    }

    playerAimEvent(socketId: string, aimVector: Vector2DTO): void {
        this.socket.emit(this.EVENT_PLAYER_AIM, socketId, aimVector)
    }

    playerDeathEvent(...args: Array<unknown>): void {
        throw new Error('Method not implemented.' + args[0])
    }

    playerSpawnEvent(affectedPlayers: { [key: string]: PlayerDTO }): void {
        this.playerHandler.handlePlayerSpawnEvent(affectedPlayers)
    }

    playerLeaveEvent(affectedPlayers: { [key: string]: PlayerDTO }): void {
        this.playerHandler.handlePlayerLeaveEvent(affectedPlayers)
    }

    projectileSpawnEvent(affectedProjectiles: { [key: string]: ProjectileDTO }): void {
        this.projectileHandler.handleProjectileSpawnEvent(affectedProjectiles)
    }

    projectileDestroyEvent(affectedProjectiles: { [key: string]: ProjectileDTO }): void {
        this.projectileHandler.handleProjectileDestroyEvent(affectedProjectiles)
    }

    moveCameraWithCurrentPlayer() {
        const currentPlayer = this.playerHandler.players[this.socket.id]
        if (currentPlayer) {
            this.game.stage.pivot.set(
                currentPlayer.position.x + currentPlayer.sprite.width / 2 - this.game.screen.width / 2,
                currentPlayer.position.y + currentPlayer.sprite.height / 2 - this.game.screen.height / 2
            )
        }
    }
}
