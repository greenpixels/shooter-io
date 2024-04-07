import { Socket } from 'socket.io'
import {
    DTOConverter,
    Trigonometry,
    Vector2DTO,
    GameEventHandler,
    Vector2,
    PlayerDTO,
    KeyMap,
    GunInfo,
} from '../../../shared/index'
import { Player } from '../classes/Player'
import { Projectile } from '../classes/Projectile'
import { GlobalValuesMap } from '../classes/GlobalValuesMap'
import { CollisionHandler } from '../CollisionHandler/CollisionHandler'

export class PlayerHandler {
    players: { [key: string]: Player } = {}
    readonly gameEventHandler: GameEventHandler
    constructor(gameEventHandler: GameEventHandler) {
        this.gameEventHandler = gameEventHandler
    }

    addPlayer(socket: Socket) {
        const newPlayer = new Player(socket.id, { x: 0, y: 0 })
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
        CollisionHandler.setCollisionCell(newPlayer.position, newPlayer.position, newPlayer.id, 'player')
        this.gameEventHandler.playerSpawnEvent({ [socket.id]: DTOConverter.toPlayerDTO(newPlayer) })
    }

    removePlayer(socket: Socket) {
        this.gameEventHandler.playerLeaveEvent({ [socket.id]: DTOConverter.toPlayerDTO(this.players[socket.id]) })
        CollisionHandler.removeFromCollisionGrid(this.players[socket.id].position, socket.id, 'players')
        delete this.players[socket.id]
    }

    handlePlayerMoveEvent(player: Player, moveVectorDTO: Vector2DTO) {
        player.velocity.x = Math.sign(moveVectorDTO.x)
        player.velocity.y = Math.sign(moveVectorDTO.y)
    }

    handlePlayerShootEvent(socketId: string, player: Player) {
        let gunInfo = GunInfo[Math.max(0, Math.min(GunInfo.length - 1, player.level - 1))]
        const now = Date.now()
        if (now - player.lastShotAt < gunInfo.delay) {
            return
        }
        player.lastShotAt = now
        const projectile = new Projectile(
            socketId,
            { ...player.position },
            { ...player.aimDirection },
            gunInfo.projectileLife,
            gunInfo.damage
        )

        const angle = new Vector2(projectile.direction).angle()
        projectile.position.x += Trigonometry.lengthdirX(60, angle)
        projectile.position.y += Trigonometry.lengthdirY(60, angle)
        CollisionHandler.setCollisionCell(projectile.position, projectile.position, projectile.id, 'projectile')
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

    hurtPlayer(id: string, projectile: Projectile) {
        const player = this.players[id]
        if (!player) {
            return
        }
        player.health -= projectile.damage
        this.gameEventHandler.playerHurtEvent({ [player.id]: player })
        if (player.health <= 0) {
            this.gameEventHandler.playerDeathEvent({ [player.id]: player })
            this.respawnPlayer(id)
            this.rewardPlayerOnKill(projectile.sourcePlayerId)
        }
    }

    rewardPlayerOnKill(playerId: string) {
        const player = this.players[playerId]
        if (!player) {
            return
        }
        player.level++
    }

    respawnPlayer(id: string) {
        const player = this.players[id]
        if (!player) {
            return
        }
        player.setValuesOnRespawn()
    }

    playerTick(player: Player, playerDtoMap: KeyMap<PlayerDTO>) {
        if (Math.abs(player.velocity.x) + Math.abs(player.velocity.y) > 0) {
            const angle = new Vector2(player.velocity).angle()
            const baseSpeed = GlobalValuesMap.PLAYER_BASE_SPEED
            const oldPosition = player.position
            player.position.x += Trigonometry.lengthdirX(baseSpeed, angle)
            player.position.y += Trigonometry.lengthdirY(baseSpeed, angle)
            CollisionHandler.setCollisionCell(oldPosition, player.position, player.id, 'player')
        }
        playerDtoMap[player.id] = DTOConverter.toPlayerDTO(player)
    }

    handePlayerMoveEvent(player: Player, moveVectorDTO: Vector2DTO) {
        player.velocity.x = moveVectorDTO.x
        player.velocity.y = moveVectorDTO.y
    }
}
