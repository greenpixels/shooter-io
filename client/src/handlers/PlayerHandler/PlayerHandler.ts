import { Application } from 'pixi.js'
import { Player } from '../../classes/Player'
import { PlayerDTO } from '@shared/dtos/PlayerDTO'
import { DTOMap } from '../../types/DTOMap'

export class PlayerHandler {
    players: { [key: string]: Player } = {}
    game: Application
    private updateCallback
    constructor(updateCallback: () => void, game: Application) {
        this.updateCallback = updateCallback
        this.game = game
    }

    addPlayer(id: string, dto: PlayerDTO) {
        this.players = { ...this.players, ...{ [id]: new Player(this.game.stage, dto) } }
        this.updateCallback()
    }

    removePlayer(id: string) {
        this.players[id].cleanup(this.game.stage)
        delete this.players[id]
        this.updateCallback()
    }

    handlePlayerTickEvent(currentPlayers: DTOMap<PlayerDTO>) {
        Object.entries(currentPlayers).forEach(([id, playerDto]) => {
            if (this.players[id] !== undefined) {
                this.players[id].sync(playerDto)
            } else {
                this.addPlayer(playerDto.id, playerDto)
            }
        })
    }

    handlePlayerSpawnEvent(affectedPlayers: DTOMap<PlayerDTO>) {
        Object.keys(affectedPlayers).forEach((id) => {
            if (this.players[id] === undefined) {
                this.addPlayer(id, affectedPlayers[id])
            } else {
                this.players[id].sync(affectedPlayers[id])
            }
        })
    }

    handlePlayerLeaveEvent(affectedPlayers: { [key: string]: PlayerDTO }) {
        Object.keys(affectedPlayers).forEach((id) => {
            if (this.players[id] !== undefined) {
                this.removePlayer(id)
            }
        })
    }
}
