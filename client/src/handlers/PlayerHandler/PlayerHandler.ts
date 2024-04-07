import { Container, Sprite } from 'pixi.js'
import { Player } from '../../classes/Player'
import { PlayerDTO, KeyMap, ProjectileDTO, Vector2, Trigonometry } from '@shared/index'

export class PlayerHandler {
    players: { [key: string]: Player } = {}
    container: Container
    private updateCallback
    constructor(updateCallback: () => void, container: Container) {
        this.updateCallback = updateCallback
        this.container = container
    }

    addPlayer(id: string, dto: PlayerDTO) {
        this.players = { ...this.players, ...{ [id]: new Player(this.container, dto) } }
        this.updateCallback()
    }

    removePlayer(id: string) {
        this.players[id].cleanup()
        delete this.players[id]
        this.updateCallback()
    }

    handlePlayerTickEvent(
        currentPlayers: KeyMap<PlayerDTO>,
        socketId: string,
        crownSprite: Sprite,
        arrowSprite: Sprite
    ) {
        this.syncPlayers(currentPlayers, socketId, crownSprite, arrowSprite)
    }

    syncPlayers(currentPlayers: KeyMap<PlayerDTO>, socketId: string, crownSprite: Sprite, arrowSprite: Sprite) {
        let highestScoringPlayer: Player | undefined
        let highestScore = -1
        Object.entries(currentPlayers).forEach(([id, playerDto]) => {
            if (this.players[id] !== undefined) {
                this.players[id].sync(playerDto)
            } else {
                this.addPlayer(playerDto.id, playerDto)
            }
            if (this.players[id] && this.players[id].score > highestScore) {
                highestScoringPlayer = this.players[id]
                highestScore = highestScoringPlayer.score
            }
        })
        const currentPlayer = this.players[socketId]
        if (!currentPlayer) return
        if (highestScoringPlayer) {
            crownSprite.position = {
                x: highestScoringPlayer.position.x + highestScoringPlayer.sprite.width / 2,
                y: highestScoringPlayer.position.y,
            }
            const targetPlayerPosition = new Vector2(highestScoringPlayer.position)
            const currentPlayerPosition = new Vector2(currentPlayer.position)
            if (
                socketId === highestScoringPlayer.id ||
                targetPlayerPosition.sub(currentPlayerPosition).length() < 250
            ) {
                arrowSprite.visible = false
            } else {
                arrowSprite.visible = true
                arrowSprite.angle = new Vector2(highestScoringPlayer.position).sub(currentPlayer.position).angle()
                const arrowDistance = 120
                arrowSprite.position = {
                    x:
                        currentPlayer.position.x +
                        currentPlayer.sprite.width / 2 +
                        Trigonometry.lengthdirX(arrowDistance, arrowSprite.angle),
                    y:
                        currentPlayer.position.y +
                        currentPlayer.sprite.height / 2 +
                        Trigonometry.lengthdirY(arrowDistance, arrowSprite.angle),
                }
            }
        } else {
            arrowSprite.visible = false
        }
    }

    handlePlayerSpawnEvent(
        affectedPlayers: KeyMap<PlayerDTO>,
        socketId: string,
        crownSprite: Sprite,
        arrowSprite: Sprite
    ) {
        this.syncPlayers(affectedPlayers, socketId, crownSprite, arrowSprite)
    }

    handlePlayerLeaveEvent(affectedPlayers: { [key: string]: PlayerDTO }) {
        Object.keys(affectedPlayers).forEach((id) => {
            if (this.players[id] !== undefined) {
                this.removePlayer(id)
            }
        })
    }

    handlePlayerHurtEvent(affectedPlayers: { [key: string]: PlayerDTO }) {
        Object.keys(affectedPlayers).forEach((id) => {
            if (this.players[id] !== undefined) {
                const player = this.players[id]
                player.impactFactor = 5
            }
        })
        setTimeout(this.updateCallback, 100)
    }

    handlePlayerShootingProjectile(affectedProjectiles: { [key: string]: ProjectileDTO }) {
        Object.keys(affectedProjectiles).forEach((id) => {
            const projectile = affectedProjectiles[id]
            const playerId = projectile.sourcePlayerId
            if (this.players[playerId] !== undefined) {
                const player = this.players[playerId]
                player.recoilFactor = 1
            }
        })
    }
}
