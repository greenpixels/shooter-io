import { PlayerDTO } from '@shared/index'

export interface GameInformation {
    players: Array<PlayerDTO>
    ownId: string
}
