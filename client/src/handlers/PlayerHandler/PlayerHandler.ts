import { Container } from 'pixi.js'
import { Player } from '../../classes/Player'
import { PlayerDTO, KeyMap, ProjectileDTO } from '@shared/index'

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

    handlePlayerTickEvent(currentPlayers: KeyMap<PlayerDTO>) {
        this.syncPlayers(currentPlayers)
    }

    syncPlayers(currentPlayers: KeyMap<PlayerDTO>) {
        Object.entries(currentPlayers).forEach(([id, playerDto]) => {
            if (this.players[id] !== undefined) {
                this.players[id].sync(playerDto)
            } else {
                this.addPlayer(playerDto.id, playerDto)
            }
        })
    }

    handlePlayerSpawnEvent(affectedPlayers: KeyMap<PlayerDTO>) {
        this.syncPlayers(affectedPlayers)
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
