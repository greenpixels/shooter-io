import { GameEventHandler } from '@shared/GameEventHandler'
import { Socket } from 'socket.io-client'
import { Player } from './classes/Player'
import { Projectile } from './classes/Projectile'
import { PlayerDTO } from '@shared/dtos/PlayerDTO'
import { ProjectileDTO } from '@shared/dtos/ProjectileDTO'
import { DTOConverter } from '@shared/classes/DTOConverter'
import { Vector2DTO } from '@shared/dtos/Vector2DTO'
import { GameInformation } from './types/GameInformation'
import { Application, Renderer } from 'pixi.js'

export type ClientGameHandlerProps = {
    socket: Socket
    game: Application<Renderer<HTMLCanvasElement>>
    canvasSize: Vector2DTO
    setGameInfo: React.Dispatch<React.SetStateAction<GameInformation>>
}

export class ClientGameHandler extends GameEventHandler {
    game: Application<Renderer<HTMLCanvasElement>>
    socket: Socket
    players: { [key: string]: Player } = {}
    projectiles: { [key: string]: Projectile } = {}
    moveVector: Vector2DTO = { x: 0, y: 0 }
    canvasSize: Vector2DTO = { x: 0, y: 0 }
    updateGameInformation

    constructor(props: ClientGameHandlerProps) {
        super()
        this.game = props.game
        this.socket = props.socket
        this.canvasSize = props.canvasSize
        this.socket.on(this.EVENT_GAME_TICK, this.gameTick.bind(this))
        this.socket.on(this.EVENT_PLAYER_SPAWN, this.playerSpawn.bind(this))
        this.socket.on(this.EVENT_PLAYER_DEATH, this.playerDeath.bind(this))
        this.socket.on(this.EVENT_PLAYER_LEAVE, this.playerLeave.bind(this))

        this.socket.on(this.EVENT_PROJECTILE_SPAWN, this.projectileSpawn.bind(this))
        this.socket.on(this.EVENT_PROJECTILE_DESTROY, this.projectileDestroy.bind(this))

        this.updateGameInformation = () => {
            if (!this.socket.id) return
            const playerDtos = Object.keys(this.players).map((key) => {
                return DTOConverter.toPlayerDTO(this.players[key])
            })
            playerDtos.sort()
            props.setGameInfo({ players: playerDtos, ownId: this.socket.id })
        }

        setInterval(this.updateGameInformation, 1000)
    }

    handleMouseMoveInput(ev: MouseEvent) {
        if (!this.socket.id) return
        const clampValue = 2000
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
        this.playerAim(this.socket.id, { x: normalizedMX, y: normalizedMY })
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
        this.playerMove(this.socket.id, this.moveVector)
    }

    handleMouseClickInput(ev: MouseEvent): void {
        if (!this.socket.id) return
        ev.preventDefault()
        this.playerShoot(this.socket.id)
    }

    playerShoot(socketId: string): void {
        this.socket.emit(this.EVENT_PLAYER_SHOOT, socketId)
    }

    gameTick(visiblePlayers: { [key: string]: PlayerDTO }, visibleProjectiles: { [key: string]: ProjectileDTO }): void {
        if (!this.socket.id) {
            return
        }
        Object.entries(visiblePlayers).forEach(([id, playerDto]) => {
            if (this.players[id] !== undefined) {
                this.players[id].sync(playerDto)
            } else {
                this.playerSpawn({ [playerDto.id]: playerDto })
            }
        })

        Object.entries(visibleProjectiles).forEach(([id, projectileDto]) => {
            if (this.projectiles[id] !== undefined) {
                this.projectiles[id].sync(projectileDto)
            } else {
                this.addProjectile(id, visibleProjectiles[id])
            }
        })

        const currentPlayer = this.players[this.socket.id]
        if (currentPlayer) {
            this.game.stage.pivot.set(
                currentPlayer.position.x + currentPlayer.sprite.width / 2 - this.game.screen.width / 2,
                currentPlayer.position.y + currentPlayer.sprite.height / 2 - this.game.screen.height / 2
            )
        }

        this.game.stage.sortChildren()
    }

    playerMove(socketId: string, moveVector: Vector2DTO): void {
        this.socket.emit(this.EVENT_PLAYER_MOVE, socketId, moveVector)
    }

    playerAim(socketId: string, aimVector: Vector2DTO): void {
        this.socket.emit(this.EVENT_PLAYER_AIM, socketId, aimVector)
    }

    playerDeath(...args: Array<unknown>): void {
        throw new Error('Method not implemented.' + args[0])
    }

    playerSpawn(affectedPlayers: { [key: string]: PlayerDTO }): void {
        Object.keys(affectedPlayers).forEach((id) => {
            if (this.players[id] === undefined) {
                // A player that was not in the game before has joined
                this.addPlayer(id, affectedPlayers[id])
            } else {
                // A player respawned
                this.players[id].sync(affectedPlayers[id])
            }
        })
    }

    playerLeave(affectedPlayers: { [key: string]: PlayerDTO }): void {
        Object.keys(affectedPlayers).forEach((id) => {
            if (this.players[id] !== undefined) {
                // A player left the game
                this.removePlayer(id)
            }
        })
    }

    addPlayer(id: string, dto: PlayerDTO) {
        this.players = { ...this.players, ...{ [id]: new Player(this.game.stage, dto) } }
        this.updateGameInformation()
    }

    addProjectile(id: string, dto: ProjectileDTO) {
        const newProjectile = new Projectile(this.game.stage, dto)
        this.projectiles = { ...this.projectiles, ...{ [id]: newProjectile } }
    }

    removePlayer(id: string) {
        this.players[id].cleanup(this.game.stage)
        delete this.players[id]
        this.updateGameInformation()
    }

    projectileSpawn(affectedProjectiles: { [key: string]: ProjectileDTO }): void {
        Object.keys(affectedProjectiles).forEach((id) => {
            if (this.projectiles[id] === undefined) {
                this.addProjectile(id, affectedProjectiles[id])
            }
        })
    }

    projectileDestroy(affectedProjectiles: { [key: string]: ProjectileDTO }): void {
        Object.keys(affectedProjectiles).forEach((id) => {
            if (this.projectiles[id] !== undefined) {
                this.projectiles[id].cleanup(this.game.stage)
                delete this.projectiles[id]
            }
        })
    }
}
