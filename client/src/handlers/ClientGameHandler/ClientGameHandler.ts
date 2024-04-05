import {
    GameEventHandler,
    PlayerDTO,
    ProjectileDTO,
    DTOConverter,
    Vector2DTO,
    KeyMap,
    FormatHelper,
} from '@shared/index'
import { Socket } from 'socket.io-client'
import { Application, Assets, Container, Renderer, Sprite, UVs } from 'pixi.js'
import { PlayerHandler } from '../PlayerHandler/PlayerHandler'
import { ProjectileHandler } from '../ProjectileHandler/ProjectileHandler'
import { InputHandler } from '../InputHandler/InputHandler'
import GroundImage from '@assets/spr_ground.png'

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
    groundSprite: Sprite

    constructor(props: ClientGameHandlerProps) {
        super()
        this.application = props.application
        this.socket = props.socket

        this.groundSprite = new Sprite()
        Assets.load(GroundImage).then((loadedTexture) => {
            loadedTexture.source.scaleMode = 'nearest'
            this.groundSprite.texture = loadedTexture
            this.groundSprite.texture.source.wrapMode = 'repeat'
            this.groundSprite.scale.set(16, 9)
        })

        const objectContainer = new Container()
        this.application.stage.addChild(this.groundSprite, objectContainer)

        this.playerHandler = new PlayerHandler(this.updateGameInformation.bind(this), objectContainer)
        this.projectileHandler = new ProjectileHandler(objectContainer)
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

    gameTickEvent(visiblePlayers: KeyMap<PlayerDTO>, visibleProjectiles: { [key: string]: ProjectileDTO }): void {
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

    projectileDestroyEvent(affectedProjectiles: { [key: string]: ProjectileDTO & { hasCollision: boolean } }): void {
        this.projectileHandler.handleProjectileDestroyEvent(affectedProjectiles)
    }

    moveCameraWithCurrentPlayer() {
        const currentPlayer = this.playerHandler.players[this.socket.id]

        if (currentPlayer) {
            const xCenter =
                currentPlayer.position.x + currentPlayer.sprite.width / 2 - this.application.screen.width / 2
            const yCenter =
                currentPlayer.position.y + currentPlayer.sprite.height / 2 - this.application.screen.height / 2

            this.application.stage.pivot.set(
                xCenter + currentPlayer.recoilFactor * Math.random() * 2,
                yCenter + currentPlayer.recoilFactor * Math.random() * 2
            )

            this.updateGroundUVBasedOnPlayerPosition({
                x: currentPlayer.position.x - currentPlayer.sprite.width / 2,
                y: currentPlayer.position.y - currentPlayer.sprite.height / 2,
            })
        }
    }

    updateGroundUVBasedOnPlayerPosition(position: Vector2DTO) {
        const dimensions = ['x', 'y']
        const scale = this.groundSprite.scale
        this.groundSprite.x = position.x - this.groundSprite.width / 2 + this.groundSprite.width / scale.x / 2
        this.groundSprite.y = position.y - this.groundSprite.height / 2 + this.groundSprite.height / scale.y / 2

        dimensions.forEach((dimension) => {
            const isX = dimension === 'x'
            const offset = isX ? position.x / this.groundSprite.width : position.y / this.groundSprite.height

            this.groundSprite.texture.uvs[`${dimension}0` as keyof UVs] =
                (0 + offset) * scale[dimension as keyof Vector2DTO]
            this.groundSprite.texture.uvs[`${dimension}1` as keyof UVs] =
                (Number(isX) + offset) * scale[dimension as keyof Vector2DTO]
            this.groundSprite.texture.uvs[`${dimension}2` as keyof UVs] =
                (1 + offset) * scale[dimension as keyof Vector2DTO]
            this.groundSprite.texture.uvs[`${dimension}3` as keyof UVs] =
                (Number(!isX) + offset) * scale[dimension as keyof Vector2DTO]
        })
    }
}
