import { Socket } from 'socket.io'
import {
    DTOConverter,
    Trigonometry,
    Vector2DTO,
    GameEventHandler,
    Vector2,
    PlayerDTO,
    KeyMap,
} from '../../../shared/index'
import { Player } from '../classes/Player'
import { Projectile } from '../classes/Projectile'
import { GlobalValuesMap } from '../classes/GlobalValuesMap'

export class PlayerHandler {
    players: { [key: string]: Player } = {}
    readonly gameEventHandler: GameEventHandler
    constructor(gameEventHandler: GameEventHandler) {
        this.gameEventHandler = gameEventHandler
    }

    addPlayer(socket: Socket) {
        const newPlayer = new Player(socket.id, { x: 50, y: 50 })
        this.players[socket.id] = newPlayer
        socket.on(
            this.gameEventHandler.EVENT_PLAYER_MOVE,
            this.gameEventHandler.playerMoveEvent.bind(this.gameEventHandler)
        )
        socket.on(
            this.gameEventHandler.EVENT_PLAYER_AIM,
            this.gameEventHandler.playerAimEvent.bind(this.gameEventHandler)
        )
        socket.on(
            this.gameEventHandler.EVENT_PLAYER_SHOOT,
            this.gameEventHandler.playerShootEvent.bind(this.gameEventHandler)
        )
        this.gameEventHandler.playerSpawnEvent({ [socket.id]: DTOConverter.toPlayerDTO(newPlayer) })
    }

    removePlayer(socket: Socket) {
        this.gameEventHandler.playerLeaveEvent({ [socket.id]: DTOConverter.toPlayerDTO(this.players[socket.id]) })
        delete this.players[socket.id]
    }

    handlePlayerMoveEvent(player: Player, moveVectorDTO: Vector2DTO) {
        player.velocity.x = Math.sign(moveVectorDTO.x)
        player.velocity.y = Math.sign(moveVectorDTO.y)
    }

    handlePlayerShootEvent(socketId: string, player: Player) {
        const MINIMAL_SHOT_DELAY = 1000
        const now = Date.now()
        if (now - player.lastShotAt < MINIMAL_SHOT_DELAY) {
            return
        }
        player.lastShotAt = now
        const projectile = new Projectile(socketId, { ...player.position }, { ...player.aimDirection })
        const angle = new Vector2(projectile.direction).angle()
        projectile.position.x += Trigonometry.lengthdirX(60, angle)
        projectile.position.y += Trigonometry.lengthdirY(60, angle)
        return projectile
    }

    handlePlayersTickEvent(visiblePlayers: { [key: string]: Player }) {
        const playerDtoMap: KeyMap<PlayerDTO> = {}
        Object.keys(visiblePlayers).forEach((id) => {
            const original = visiblePlayers[id]
            if (original) {
                this.playerTick(original, playerDtoMap)
            }
        })
        return playerDtoMap
    }

    playerTick(player: Player, playerDtoMap: KeyMap<PlayerDTO>) {
        if (Math.abs(player.velocity.x) + Math.abs(player.velocity.y) > 0) {
            const angle = new Vector2(player.velocity).angle()
            const baseSpeed = GlobalValuesMap.PLAYER_BASE_SPEED
            player.position.x += Trigonometry.lengthdirX(baseSpeed, angle)
            player.position.y += Trigonometry.lengthdirY(baseSpeed, angle)
        }
        playerDtoMap[player.id] = DTOConverter.toPlayerDTO(player)
    }

    handePlayerMoveEvent(player: Player, moveVectorDTO: Vector2DTO) {
        player.velocity.x = moveVectorDTO.x
        player.velocity.y = moveVectorDTO.y
    }
}
