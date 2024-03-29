import { Application } from 'pixi.js'
import { Player } from '../../classes/Player'
import { PlayerDTO } from '@shared/dtos/PlayerDTO'
import { DTOMap } from '../../types/DTOMap'

export class PlayerHandler {
    players: { [key: string]: Player } = {}
    application: Application
    private updateCallback
    constructor(updateCallback: () => void, application: Application) {
        this.updateCallback = updateCallback
        this.application = application
    }

    addPlayer(id: string, dto: PlayerDTO) {
        this.players = { ...this.players, ...{ [id]: new Player(this.application.stage, dto) } }
        this.updateCallback()
    }

    removePlayer(id: string) {
        this.players[id].cleanup(this.application.stage)
        delete this.players[id]
        this.updateCallback()
    }

    handlePlayerTickEvent(currentPlayers: DTOMap<PlayerDTO>) {
        this.syncPlayers(currentPlayers)
    }

    syncPlayers(currentPlayers: DTOMap<PlayerDTO>) {
        Object.entries(currentPlayers).forEach(([id, playerDto]) => {
            if (this.players[id] !== undefined) {
                this.players[id].sync(playerDto)
            } else {
                this.addPlayer(playerDto.id, playerDto)
            }
        })
    }

    handlePlayerSpawnEvent(affectedPlayers: DTOMap<PlayerDTO>) {
        this.syncPlayers(affectedPlayers)
    }

    handlePlayerLeaveEvent(affectedPlayers: { [key: string]: PlayerDTO }) {
        Object.keys(affectedPlayers).forEach((id) => {
            if (this.players[id] !== undefined) {
                this.removePlayer(id)
            }
        })
    }
}